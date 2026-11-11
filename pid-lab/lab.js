/* PID Lab · giao diện.
   Bố cục theo docs/QUY-TAC-TRINH-MO-PHONG.md: khung cao đúng một màn hình, đồ thị luôn thấy, các phần xếp dọc trong
   một khung cuộn riêng, hàng nút ở đáy. Trang không bao giờ tự cuộn.
   Hai cách xem:
   - Xem nhanh (mặc định): mỗi lần đổi thông số, tính lại cả lần chạy và vẽ ngay → kéo thanh trượt thấy đường cong đổi liền.
   - ▶ Chạy: chạy dần theo thời gian; đổi thông số giữa chừng có tác dụng từ chu kỳ sau; bấm Điểm đặt / Nhiễu tải lúc đang chạy. */
(function () {
"use strict";
const $ = (id) => document.getElementById(id), X = PID, f = X.fmt;
const RR = { lo: [25, 300], dc: [-4000, 4000], servo: [-180, 180], bon: [0.1, 1.9], loxo: [-20, 20] };
const HINT = {
  lo: "Bắt đầu chỉ với P: tăng Kp tới khi y lên nhanh mà chưa dao động, thấy còn sai số xác lập. Thêm Ki nhỏ để xóa sai số. Lò chỉ sưởi được (u ≥ 0) nên khi đặt nhiệt cao u bão hòa 100 %: thử tắt chống bão hòa để thấy vọt lố. Hoặc vào Tự chỉnh → Thử bước → SIMC.",
  dc: "Động cơ nhanh (τ ≈ 0,15 s). Kp quá nhỏ thì chậm, Ki quá nhỏ thì sau khi có tải tốc độ tụt mãi không về. Thử Kp ≈ 0,05 V/rpm và Ti ≈ τ (Ki = Kp/Ti).",
  servo: "Chỉ P đã về đúng 90° khi không tải (đối tượng có khâu tích phân), D để giảm vọt lố. Có tải thì cần I, nhưng I làm vọt lố khi đổi điểm đặt: bật Tách tích phân (Thực tế) để I chỉ làm việc khi đã tới gần đích.",
  bon: "Bồn phi tuyến và có trễ 3 s. Thử bước cho K ≈ 0,036 m/%, τ ≈ 160 s: SIMC cho Kp vài trăm %/m. Mực nước không thể âm và bơm không hút ngược được (u ≥ 0).",
  loxo: "Chỉ P: vật dao động mãi và vẫn lệch. Thêm D như một giảm chấn ảo (Kd tính bằng N·s/cm), rồi thêm I để hết sai số. Thử Kp = 0,5, Ki = 1, Kd = 0,2.",
};
let P, C, G = {}, en = { P: true, I: true, D: true }, r1, base, userEv = [], mode = "view", sim = null, R = null, cur = null, ghost = null, raf = 0, acc = 0, lastSc = null, seed = 1;
const ls = (k, v) => { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } };

/* ---------- chọn đối tượng ---------- */
const pick = $("pick");
X.PLANTS.forEach(p => { const o = document.createElement("option"); o.value = p.id; o.textContent = p.name; pick.appendChild(o); });
pick.onchange = () => { load(pick.value); history.replaceState(null, "", "#" + pick.value); };

function parseHash() {
  const h = decodeURIComponent(location.hash.slice(1)), [id, q] = h.split("?"), o = {};
  (q || "").split("&").forEach(kv => { const [k, v] = kv.split("="); if (k) o[k] = v; });
  return { id: X.BY[id] ? id : "lo", o };
}
function load(id, o) {
  stop(); P = X.plant(id); C = X.defaultCtrl(P); o = o || {};
  G = { Kp: P.gains.Kp, Ki: P.gains.Ki, Kd: P.gains.Kd };
  ["Kp", "Ki", "Kd"].forEach(k => { if (o[k] != null && isFinite(+o[k])) G[k] = +o[k]; });
  en = { P: true, I: true, D: true };
  if (o.type === "onoff") C.type = "onoff";
  if (o.aw) C.aw = o.aw; if (o.don) C.dOn = o.don; if (o.nf != null) C.Nf = +o.nf; if (o.hy != null) C.hyst = +o.hy;
  r1 = P.r1; userEv = []; ghost = null; mode = "view"; sim = null;
  base = { r1, dist: o.dist !== "0" };
  pick.value = id;
  // các ô chọn ở phần Thực tế
  $("ctype").value = C.type; $("oAw").value = C.aw; $("oDon").value = C.dOn; $("oNf").value = String(C.Nf);
  $("oNoise").value = "0"; $("oSep").value = "0"; $("oB").value = "1";
  const ts = $("oTs"); ts.innerHTML = "";
  [1, 5, 20].forEach(m => { const v = P.Ts * m, op = document.createElement("option"); op.value = String(v); op.textContent = tFmt(v) + (m === 1 ? " (chuẩn)" : ""); ts.appendChild(op); });
  ts.value = String(P.Ts);
  $("oDist").checked = base.dist; $("tDistL").textContent = "t = " + tFmt(P.tDist) + " (" + P.distName.toLowerCase() + ")";
  const [a, b] = RR[P.id]; $("rR").min = 0; $("rR").max = 1000;
  $("rHy").max = 100;
  plantInfo(); syncUI(); $("relayOut").innerHTML = ""; $("stepOut").innerHTML = "";
  cur = Math.round(P.tStep / P.Ts);
  recompute();
}
const tFmt = (v) => P.tU === "s" && v < 1 ? f(v * 1000, 3) + " ms" : f(v, 3) + " s";

/* ---------- thanh trượt theo thang log ---------- */
const lim = (k) => { const r = P.ref[k]; return [r / 100, r * 50]; };
const toPos = (k, v) => { if (!(v > 0)) return 0; const [a, b] = lim(k); return Math.max(1, Math.min(1000, 1 + Math.round(999 * Math.log(v / a) / Math.log(b / a)))); };
const fromPos = (k, p) => { if (p <= 0) return 0; const [a, b] = lim(k); return +(a * Math.pow(b / a, (p - 1) / 999)).toPrecision(3); };
const num = (s) => { const v = parseFloat(String(s).replace(/\s/g, "").replace("−", "-").replace(",", ".")); return isFinite(v) ? v : null; };
const rToPos = (v) => { const [a, b] = RR[P.id]; return Math.round((v - a) / (b - a) * 1000); };
const rFromPos = (p) => { const [a, b] = RR[P.id]; const v = a + (b - a) * p / 1000, st = (b - a) / 200; return +(Math.round(v / st) * st).toPrecision(4); };

["Kp", "Ki", "Kd"].forEach(k => {
  $("r" + k).oninput = (e) => { G[k] = fromPos(k, +e.target.value); $("n" + k).value = f(G[k], 3); changed(); };
  $("n" + k).onchange = (e) => { const v = num(e.target.value); if (v == null || v < 0) { e.target.classList.add("badv"); return; } e.target.classList.remove("badv"); G[k] = v; $("r" + k).value = toPos(k, v); changed(); };
});
[["onP", "P"], ["onI", "I"], ["onD", "D"]].forEach(([id, k]) => $(id).onchange = (e) => { en[k] = e.target.checked; changed(); });
$("rR").oninput = (e) => setR(rFromPos(+e.target.value), false);
$("nR").onchange = (e) => { const v = num(e.target.value); if (v == null) return; setR(v, true); };
$("rHy").oninput = (e) => { C.hyst = +(e.target.value / 100 * hyMax()).toPrecision(3); $("nHy").value = f(C.hyst, 3); changed(); };
$("nHy").onchange = (e) => { const v = num(e.target.value); if (v == null || v < 0) return; C.hyst = v; $("rHy").value = Math.round(v / hyMax() * 100); changed(); };
const hyMax = () => Math.abs(P.r1 - P.y0) * 0.2;
function setR(v, fromNum) {
  if (P.id === "bon") v = Math.max(0.05, Math.min(1.95, v));
  r1 = v; if (!fromNum) $("nR").value = f(v, 4); else $("rR").value = rToPos(v);
  if (mode === "run" || mode === "pause") { const ev = { t: sim.k * C.Ts, type: "r", v }; sim.addEvent(ev); userEv.push(ev); if (mode === "pause") drawAll(); }
  else { base.r1 = v; userEv = []; recompute(); }
  syncSep();
}
$("ctype").onchange = (e) => { C.type = e.target.value; syncUI(); changed(); };
$("oAw").onchange = (e) => { C.aw = e.target.value; changed(); };
$("oDon").onchange = (e) => { C.dOn = e.target.value; changed(); };
$("oNf").onchange = (e) => { C.Nf = +e.target.value; changed(); };
$("oNoise").onchange = (e) => { C.noise = +e.target.value * P.noiseRef; changed(); };
$("oSep").onchange = () => { syncSep(); changed(); };
$("oB").onchange = (e) => { C.b = +e.target.value; changed(); };
$("oTs").onchange = (e) => { C.Ts = +e.target.value; stop(); mode = "view"; userEv = []; recompute(); say("Đổi Ts: tính lại từ đầu (không đổi Ts giữa chừng được)."); };
$("oDist").onchange = (e) => { if (mode === "run" || mode === "pause") { say("Kịch bản nhiễu tải áp dụng cho lần chạy sau. Lúc đang chạy, dùng nút Nhiễu tải."); return; } base.dist = e.target.checked; userEv = []; recompute(); };
$("oShow").onchange = () => { $("lgPID").hidden = !$("oShow").checked; drawAll(); };
function syncSep() { const fr = +$("oSep").value; C.isep = fr > 0 ? fr * Math.abs(r1 - P.y0 || P.r1 - P.y0) : 0; }

function eff() { C.Kp = en.P ? G.Kp : 0; C.Ki = en.I ? G.Ki : 0; C.Kd = en.D ? G.Kd : 0; }
function changed() {
  eff(); paramText();
  if (mode === "run") return;                 // đang chạy: sim đọc C ở chu kỳ sau
  if (mode === "pause") { drawAll(); return; }
  recompute();
}
function syncUI() {
  ["Kp", "Ki", "Kd"].forEach(k => { $("r" + k).value = toPos(k, G[k]); $("n" + k).value = f(G[k], 3); $("n" + k).classList.remove("badv"); });
  $("onP").checked = en.P; $("onI").checked = en.I; $("onD").checked = en.D;
  $("rR").value = rToPos(r1); $("nR").value = f(r1, 4);
  $("rHy").value = Math.round((C.hyst || 0) / hyMax() * 100); $("nHy").value = f(C.hyst || 0, 3);
  $("pidBox").hidden = C.type !== "pid"; $("ooBox").hidden = C.type !== "onoff";
  $("sR").textContent = "Điểm đặt r (" + P.yU + "): đổi lúc t = " + tFmt(P.tStep) + " từ " + f(P.y0, 3) + " lên giá trị này.";
  syncSep(); eff(); paramText();
}
function paramText() {
  const uy = P.uU + "/" + P.yU;
  $("sKp").textContent = "Kp (" + uy + "): sai 1 " + P.yU + " thì P góp " + f(C.Kp, 3) + " " + P.uU + ".";
  $("sKi").textContent = "Ki (" + uy + "/s)" + (C.Ki > 0 && C.Kp > 0 ? " · Ti = Kp/Ki = " + tFmt(C.Kp / C.Ki) : C.Ki > 0 ? "" : " · khâu I đang tắt");
  $("sKd").textContent = "Kd (" + P.uU + "·s/" + P.yU + ")" + (C.Kd > 0 && C.Kp > 0 ? " · Td = Kd/Kp = " + tFmt(C.Kd / C.Kp) : C.Kd > 0 ? "" : " · khâu D đang tắt");
  const b = C.b == null ? 1 : C.b, pe = b === 1 ? "e" : b === 0 ? "(−y)" : "(" + f(b, 2) + "·r − y)", de = C.dOn === "e" ? "de/dt" : "d(−y)/dt";
  $("formula").innerHTML = C.type === "onoff" ? "On/Off: u = " + f(P.uMax, 3) + " " + P.uU + " khi y thấp hơn r, u = " + f(P.uMin, 3) + " " + P.uU + " khi y cao hơn r."
    : "u = <span style=\"color:var(--cp)\">Kp·" + pe + "</span> + <span style=\"color:var(--ci)\">Ki·∫e dt</span> + <span style=\"color:var(--cd)\">Kd·" + de + (C.Nf ? " (qua bộ lọc)" : "") + "</span>, rồi giới hạn trong [" + f(P.uMin, 3) + "; " + f(P.uMax, 3) + "] " + P.uU + ". Tính mỗi Ts = " + tFmt(C.Ts) + ".";
}

/* ---------- kịch bản và chạy ---------- */
function scen() {
  const ev = [{ t: P.tStep, type: "r", v: base.r1 }];
  if (base.dist) ev.push({ t: P.tDist, type: "d", v: 1 });
  return { T: P.T, r0: P.y0, ev: ev.concat(userEv) };
}
function recompute() { eff(); lastSc = scen(); R = X.run(P, C, lastSc, seed); drawAll(); }
function stop() { if (raf) cancelAnimationFrame(raf); raf = 0; }
function startRun() {
  stop(); eff(); userEv = []; base = { r1, dist: $("oDist").checked };
  lastSc = scen(); sim = new X.Sim(P, C, lastSc, seed); R = sim.R; acc = 0; mode = "run";
  tick.last = 0; raf = requestAnimationFrame(tick);
}
function tick(ts) {
  const dt = tick.last ? Math.min(0.1, (ts - tick.last) / 1000) : 0; tick.last = ts;
  acc += dt * sim.N / +$("spd").value;
  let n = Math.floor(acc); acc -= n;
  while (n-- > 0 && sim.step());
  cur = R.t.length - 1;
  if (sim.done()) { mode = "done"; raf = 0; drawAll(); return; }
  drawAll(); raf = requestAnimationFrame(tick);
}
$("bRun").onclick = () => {
  if (mode === "run") { stop(); mode = "pause"; drawAll(); }
  else if (mode === "pause") { mode = "run"; tick.last = 0; raf = requestAnimationFrame(tick); drawAll(); }
  else startRun();
};
$("bStepK").onclick = () => {
  if (mode === "run") return;
  if (mode !== "pause") { startRun(); stop(); mode = "pause"; }
  if (sim.step()) { cur = R.t.length - 1; }
  if (sim.done()) mode = "done";
  dotIf("chuky"); drawAll();
};
$("bReset").onclick = () => { stop(); mode = "view"; userEv = []; base = { r1, dist: $("oDist").checked }; cur = Math.round(P.tStep / C.Ts); recompute(); };
$("bR").onclick = () => {
  if (!sim || (mode !== "run" && mode !== "pause")) return;
  const v = Math.abs(sim.r - P.y0) < 1e-9 ? r1 : P.y0, ev = { t: sim.k * C.Ts, type: "r", v };
  sim.addEvent(ev); userEv.push(ev); if (mode === "pause") drawAll();
};
$("bD").onclick = () => {
  if (!sim || (mode !== "run" && mode !== "pause")) return;
  const ev = { t: sim.k * C.Ts, type: "d", v: sim.dOn ? 0 : 1 };
  sim.addEvent(ev); userEv.push(ev); if (mode === "pause") drawAll();
};
$("bPin").onclick = () => {
  if (!R || !R.t.length) return;
  ghost = { t: R.t.slice(), y: R.y.slice(), lab: C.type === "onoff" ? "On/Off" : "Kp " + f(C.Kp, 3) + " · Ki " + f(C.Ki, 3) + " · Kd " + f(C.Kd, 3) };
  drawAll();
};
function say(s) { $("state").textContent = s; say.t = Date.now(); }

/* ---------- vẽ ---------- */
const cv = $("cv");
function drawAll() {
  if (!R) return;
  const n = R.t.length; if (cur == null || cur >= n) cur = n - 1;
  const show = $("oShow").checked && C.type === "pid";
  const top = { h: 62, title: P.yName + " (" + P.yU + ")", lines: [], marks: [] }, bot = { h: 38, title: P.uName + " (" + P.uU + ")", lines: [], bands: [{ y: P.uMax, c: "rgba(248,113,113,.7)" }, { y: P.uMin, c: "rgba(248,113,113,.7)" }] };
  if (ghost) top.lines.push({ x: ghost.t, y: ghost.y, c: "#64748b", w: 1.6 });
  if (C.noise > 0) top.lines.push({ x: R.t, y: R.ym, c: "rgba(94,234,212,.35)", w: 1 });
  top.lines.push({ x: R.t, y: R.r, c: "#fbbf24", w: 1.5, dash: [6, 4], step: true });
  top.lines.push({ x: R.t, y: R.y, c: "#5eead4", w: 2.2 });
  if (show) { bot.lines.push({ x: R.t, y: R.P, c: "#f472b6", w: 1.2 }, { x: R.t, y: R.I, c: "#a78bfa", w: 1.2 }, { x: R.t, y: R.D, c: "#fb923c", w: 1.2 }); bot.zero = true; }
  else { const pad = (P.uMax - P.uMin) * 0.08; bot.min = P.uMin - pad; bot.max = P.uMax + pad; }
  bot.lines.push({ x: R.t, y: R.u, c: "#7dd3fc", w: 1.6, step: true });
  ((sim && (mode === "run" || mode === "pause")) ? sim.ev : lastSc ? lastSc.ev : []).forEach(e => {
    if (e.t > 0) top.marks.push({ x: e.t, c: e.type === "r" ? "rgba(251,191,36,.55)" : "rgba(248,113,113,.6)", label: e.type === "r" ? "r" : e.v ? "nhiễu" : "hết nhiễu" });
  });
  pickT = X ? ve(cv, { theme: "dark", x0: 0, x1: P.T, xU: P.tU, cursor: R.t[cur], panes: [top, bot] }) : null;
  $("lgG").hidden = !ghost;
  $("rd").innerHTML = "t " + tFmt(R.t[cur]) + " · <b style=\"color:var(--cy)\">y " + f(R.y[cur], 4) + "</b> · <b style=\"color:var(--cu)\">u " + f(R.u[cur], 3) + "</b>";
  ctlState(); cycle(); met(); ghostInfo();
}
let pickT = null, drag = false;
function pt(e) { if (!pickT || !R || mode === "run") return; const r = cv.getBoundingClientRect(), t = pickT(e.clientX - r.left); cur = Math.max(0, Math.min(R.t.length - 1, Math.round(t / C.Ts))); dotIf("chuky"); drawAll(); }
cv.addEventListener("pointerdown", (e) => { drag = true; pt(e); });
cv.addEventListener("pointermove", (e) => { if (drag && e.pointerType === "mouse") pt(e); });
addEventListener("pointerup", () => drag = false);
new ResizeObserver(() => drawAll()).observe(cv);

function ctlState() {
  const b = $("bRun"), live = mode === "run" || mode === "pause";
  b.textContent = mode === "run" ? "Tạm dừng" : mode === "pause" ? "▶ Chạy tiếp" : "▶ Chạy";
  $("bStepK").disabled = mode === "run"; $("bR").disabled = !live; $("bD").disabled = !live;
  if (say.t && Date.now() - say.t < 2500) return;
  const k = cur, t = R.t[k];
  $("state").textContent = mode === "run" ? "Đang chạy… t = " + tFmt(t) : mode === "pause" ? "Tạm dừng ở chu kỳ k = " + k + " (t = " + tFmt(t) + ")"
    : mode === "done" ? "Đã chạy xong. Đổi thông số để tính lại cùng kịch bản." : "Xem nhanh: kéo thanh trượt là vẽ lại ngay. Chạm đồ thị để xem một chu kỳ.";
}

/* ---------- từng chu kỳ ---------- */
function cycle() {
  const k = cur, n = (v, s) => f(v, s || 4), Ts = C.Ts, uU = P.uU, yU = P.yU;
  const L = [];
  const row = (i, h) => L.push('<div class="s"><span>' + i + '</span><span>' + h + '</span></div>');
  L.push('<div class="f">Chu kỳ <b>k = ' + k + '</b> · t = k·Ts = ' + k + ' × ' + tFmt(Ts) + ' = <b>' + tFmt(R.t[k]) + '</b>' + (R.d[k] ? ' · <span class="bad">đang có nhiễu tải</span>' : '') + '</div>');
  row(1, 'Đọc cảm biến: y[k] = <b>' + n(R.ym[k]) + '</b> ' + yU + (C.noise > 0 ? ' <span class="f">(thật ' + n(R.y[k]) + ', nhiễu ' + n(R.ym[k] - R.y[k], 2) + ')</span>' : ''));
  row(2, 'Sai số: e[k] = r − y = ' + n(R.r[k]) + ' − ' + n(R.ym[k]) + ' = <b>' + n(R.e[k]) + '</b> ' + yU);
  if (C.type === "onoff") {
    row(3, 'On/Off' + (C.hyst ? ' (trễ ' + n(C.hyst, 3) + ')' : '') + ': ' + (R.u[k] === P.uMax ? 'e &gt; ' + n((C.hyst || 0) / 2, 3) + ' hoặc giữ trạng thái cũ → BẬT' : 'e &lt; ' + n(-(C.hyst || 0) / 2, 3) + ' hoặc giữ trạng thái cũ → TẮT') + ' → <b class="cu">u = ' + n(R.u[k], 3) + ' ' + uU + '</b>');
  } else {
    const b = C.b == null ? 1 : C.b;
    row(3, '<span class="cp">P</span> = Kp·(' + (b === 1 ? 'r − y' : f(b, 2) + '·r − y') + ') = ' + n(C.Kp, 3) + ' × ' + n(b * R.r[k] - R.ym[k]) + ' = <b class="cp">' + n(R.P[k]) + '</b> ' + uU);
    const inc = R.I[k] - R.Ip[k], pure = C.Ki * Ts * R.e[k];
    let it = '<span class="ci">I</span>[k] = I[k−1] + Ki·Ts·e = ' + n(R.Ip[k]) + ' + ' + n(C.Ki, 3) + ' × ' + n(Ts, 3) + ' × ' + n(R.e[k]);
    if (R.hold[k] === 1) it = '<span class="ci">I</span>[k] = I[k−1] = ' + n(R.Ip[k]) + ' <span class="warn">(giữ nguyên: u đang bão hòa, cộng thêm sẽ càng vượt giới hạn — chống windup)</span>';
    else if (R.hold[k] === 2) it = '<span class="ci">I</span>[k] = I[k−1] = ' + n(R.Ip[k]) + ' <span class="warn">(|e| còn lớn hơn ngưỡng tách tích phân ' + n(C.isep, 3) + ': chưa cộng dồn)</span>';
    else if (C.aw === "back" && Math.abs(inc - pure) > 1e-12) it += ' + Ts/Tt·(u − u*)[k−1] = ' + n(R.Ip[k]) + ' + ' + n(pure) + ' ' + (inc - pure < 0 ? '− ' : '+ ') + n(Math.abs(inc - pure)) + ' <span class="f">(tính ngược)</span>';
    else it += '';
    row(4, it + ' = <b class="ci">' + n(R.I[k]) + '</b> ' + uU);
    const xNow = C.dOn === "e" ? R.e[k] : -R.ym[k], xPrev = k > 0 ? (C.dOn === "e" ? R.e[k - 1] : -R.ym[k - 1]) : xNow;
    let dt = '<span class="cd">D</span> thô = Kd·(' + (C.dOn === "e" ? 'e[k] − e[k−1]' : 'y[k−1] − y[k]') + ')/Ts = ' + n(C.Kd, 3) + ' × ' + n(xNow - xPrev) + ' / ' + n(Ts, 3) + ' = ' + n(R.Dr[k]);
    if (C.Kd === 0 && !(k > 0 && R.D[k - 1])) dt = '<span class="cd">D</span> = 0 (Kd = 0: khâu D đang tắt)';
    else if (k === 0) dt = '<span class="cd">D</span> = 0 (chu kỳ đầu chưa có giá trị trước để lấy hiệu)';
    else if (C.Nf > 0) dt += ' → lọc: D[k] = D[k−1] + Ts/(Tf+Ts)·(thô − D[k−1]) = ' + n(k > 0 ? R.D[k - 1] : 0) + ' + ' + n(1 / (C.Nf + 1), 3) + ' × (' + n(R.Dr[k]) + ' − ' + n(k > 0 ? R.D[k - 1] : 0) + ')';
    row(5, dt + ' = <b class="cd">' + n(R.D[k]) + '</b> ' + uU);
    row(6, 'Tổng: u* = P + I + D = ' + n(R.P[k]) + ' + ' + n(R.I[k]) + ' + ' + n(R.D[k]) + ' = <b>' + n(R.uRaw[k]) + '</b> ' + uU);
    row(7, 'Giới hạn: u = min(' + n(P.uMax, 3) + ', max(' + n(P.uMin, 3) + ', u*)) = <b class="cu">' + n(R.u[k]) + ' ' + uU + '</b>' + (R.sat[k] ? ' <span class="warn">bão hòa ' + (R.sat[k] > 0 ? 'trên' : 'dưới') + '</span>' : ''));
  }
  row(C.type === "onoff" ? 4 : 8, 'Giữ u này trong ' + tFmt(Ts) + (P.L ? ', tới đối tượng sau trễ L = ' + tFmt(P.L) : '') + '; đối tượng được giải bằng RK4 với bước ' + tFmt(Ts / Math.max(1, Math.round(Ts / P.dt))) + '.');
  $("cyc").innerHTML = L.join("");
}

/* ---------- chỉ tiêu và thử thách ---------- */
function met() {
  if (mode === "run" || mode === "pause") {
    $("met").innerHTML = '<p class="note f">Chỉ tiêu được tính khi chạy xong (hoặc ở chế độ xem nhanh).</p>';
    goal(null); return;
  }
  const m = X.metrics(R, lastSc, P); goal(m);
  if (!m || !m.step) { $("met").innerHTML = ""; return; }
  const s = m.step, g = P.goal, yU = P.yU, ok = (c) => c ? ' <span class="ok">✓</span>' : ' <span class="bad">✗</span>';
  const rows = [
    ["Thời gian lên <span class=\"en\">rise time</span> (10 → 90 %)", s.rise == null ? "chưa lên tới" : tFmt(s.rise)],
    ["Vọt lố <span class=\"en\">overshoot</span>", f(s.os, 3) + " %" + ok(s.os <= g.os)],
    ["Thời gian xác lập <span class=\"en\">settling</span> (±2 %)", (s.ts == null ? "chưa xác lập" : tFmt(s.ts)) + ok(s.ts != null && s.ts <= g.ts)],
    ["Giá trị xác lập y∞", f(s.yinf, 5) + " " + yU],
    ["Sai số xác lập e∞ = r − y∞", f(s.ess, 3) + " " + yU + ok(Math.abs(s.ess) <= g.ess)],
    ["IAE = ∫|e|dt (càng nhỏ càng tốt)", f(s.iae, 3)],
  ];
  if (m.dist) rows.push(["Nhiễu tải: lệch lớn nhất", f(m.dist.dev, 3) + " " + yU], ["Nhiễu tải: về lại ±2 % sau", m.dist.rec == null ? "chưa về" : tFmt(m.dist.rec)], ["Nhiễu tải: sai số cuối", f(m.dist.endErr, 3) + " " + yU]);
  rows.push(["Thời gian u bão hòa", f(m.satPct, 2) + " %"]);
  $("met").innerHTML = "<table>" + rows.map(r => "<tr><td>" + r[0] + "</td><td class=\"v\">" + r[1] + "</td></tr>").join("") + "</table>" +
    '<p class="note f" style="margin-top:8px">Tính cho lần đổi điểm đặt đầu tiên (từ ' + tFmt(s.t0) + ' tới sự kiện kế tiếp). Vọt lố và xác lập so với y∞.</p>';
}
function goal(m) {
  const ch = m ? X.check(P, m) : null, nm = { os: "Vọt lố", ts: "Thời gian xác lập", ess: "Sai số xác lập (cả sau nhiễu tải)" };
  const all = ch && ch.every(c => c.ok);
  $("goal").innerHTML = '<p><b>' + P.name + ':</b> chỉnh để ' + P.goal.txt + '.' + (base && !base.dist ? ' <span class="warn">(Bật lại nhiễu tải ở phần Thực tế để thử thách đủ.)</span>' : '') + '</p>' +
    (ch ? '<ul class="goal">' + ch.map(c => '<li>' + (c.ok ? '<span class="ok">✓</span> ' : '<span class="bad">✗</span> ') + nm[c.k] + '</li>').join("") + '</ul>' + (all ? '<p class="ok"><b>Đạt cả ba!</b> Bấm Ghim rồi thử một bộ thông số khác xem có tốt hơn không (IAE nhỏ hơn).</p>' : '') : '<p class="f">Chạy xong mới chấm.</p>') +
    '<details><summary>Gợi ý</summary><p>' + HINT[P.id] + '</p></details>';
}
function ghostInfo() {
  const g = $("ghostInfo"); g.hidden = !ghost; if (!ghost) return;
  g.innerHTML = '<span>Đường ghim (xám): ' + ghost.lab + '</span><button class="btn2" id="bUnpin">Bỏ ghim</button>';
  $("bUnpin").onclick = () => { ghost = null; drawAll(); };
}
function dotIf(sec) { const b = document.querySelector('.st-nav [data-go="' + sec + '"]'); if (b && !b.classList.contains("act")) b.classList.add("dot"); }

/* ---------- tự chỉnh ---------- */
function ruleTable(rules, box) {
  const sc = scen();
  const rows = rules.map((g, i) => {
    const c = Object.assign({}, C, { type: "pid", Kp: g.Kp, Ki: g.Ki, Kd: g.Kd, noise: 0 }), m = X.metrics(X.run(P, c, sc, seed), sc, P), s = m.step;
    return '<tr><td>' + g.name + '<br><span class="f">Kp ' + f(g.Kp, 3) + ' · Ki ' + f(g.Ki, 3) + ' · Kd ' + f(g.Kd, 3) + '<br>vọt lố ' + f(s.os, 2) + ' % · xác lập ' + (s.ts == null ? "—" : tFmt(s.ts)) + '</span></td><td class="v"><button class="btn2" data-i="' + i + '">Áp dụng</button></td></tr>';
  });
  box.insertAdjacentHTML("beforeend", "<table>" + rows.join("") + "</table>");
  box.querySelectorAll("button[data-i]").forEach(b => b.onclick = () => {
    const g = rules[+b.dataset.i]; stop(); mode = "view";
    G = { Kp: +g.Kp.toPrecision(3), Ki: +g.Ki.toPrecision(3), Kd: +g.Kd.toPrecision(3) }; en = { P: true, I: true, D: true }; C.type = "pid"; $("ctype").value = "pid";
    syncUI(); recompute(); say("Đã áp dụng " + g.name + ".");
  });
}
function mini(box, R2, extra) {
  const c = document.createElement("canvas"); c.className = "mini"; box.appendChild(c);
  requestAnimationFrame(() => ve(c, { theme: "dark", x0: R2.t[0], x1: R2.t[R2.t.length - 1], xU: P.tU, panes: [{ h: 60, title: "y", lines: [{ x: R2.t, y: R2.y, c: "#5eead4" }].concat(extra || []) }, { h: 40, title: "u", lines: [{ x: R2.t, y: R2.u, c: "#7dd3fc", step: true }] }] }));
}
$("bRelay").onclick = () => {
  const box = $("relayOut"); box.innerHTML = ""; const s = X.relayTest(P, r1);
  if (!s.ok) { box.innerHTML = '<p class="bad">' + s.why + '</p>'; return; }
  mini(box, s.R, [{ x: s.R.t, y: s.R.r, c: "#fbbf24", dash: [6, 4] }]);
  box.insertAdjacentHTML("beforeend", '<div class="eq">rơ-le: u = ' + f(s.uc, 4) + ' ± ' + f(s.d, 3) + ' ' + P.uU + '\nbiên độ dao động a = ' + f(s.a, 3) + ' ' + P.yU + '\nchu kỳ Tu = ' + tFmt(s.Tu) + '\nKu = 4·d/(π·a) = 4 × ' + f(s.d, 3) + ' / (π × ' + f(s.a, 3) + ') = ' + f(s.Ku, 3) + ' ' + P.uU + '/' + P.yU + '</div>');
  ruleTable(X.znRules(s.Ku, s.Tu), box);
};
$("bStep").onclick = () => {
  const box = $("stepOut"); box.innerHTML = ""; const s = X.stepTest(P);
  if (!s.ok) { box.innerHTML = '<p class="bad">' + s.why + '</p>'; return; }
  mini(box, s.R);
  box.insertAdjacentHTML("beforeend", '<div class="eq">bước Δu = ' + f(s.du, 3) + ' ' + P.uU + ' lúc t = ' + tFmt(s.tS) + '\nK = Δy/Δu = ' + f(s.K, 3) + ' ' + P.yU + '/' + P.uU + '\nt28 = ' + tFmt(s.t28) + ' ; t63 = ' + tFmt(s.t63) + '\nτ = 1,5·(t63 − t28) ' + (s.how === "hai điểm" ? '= ' + tFmt(s.tau) : '→ L âm (phi tuyến), lấy L = lúc y nhích, τ = t63 − L = ' + tFmt(s.tau)) + '\nL = ' + tFmt(s.L) + '</div>');
  ruleTable(X.fopdtRules(s.K, s.tau, s.L, C.Ts), box);
};

/* ---------- đối tượng ---------- */
function plantInfo() {
  const p = P.p, rows = Object.keys(p).map(k => "<tr><td>" + k + "</td><td class=\"v\">" + f(p[k], 4) + "</td></tr>").join("");
  $("plantInfo").innerHTML = "<p>" + P.desc + "</p><div class=\"eq\">" + P.model + "</div><p style=\"margin-top:8px\">Giới hạn u: [" + f(P.uMin, 3) + "; " + f(P.uMax, 3) + "] " + P.uU +
    " · Ts chuẩn " + tFmt(P.Ts) + " · trễ L " + tFmt(P.L || 0) + " · cửa sổ " + tFmt(P.T) + ".</p><table>" + rows + "</table>" +
    '<p class="f" style="margin-top:8px">Cách mô hình hóa từng đối tượng: xem <a href="index.html#doi-tuong">Bài học, mục Mô hình đối tượng</a>.</p>';
}

/* ---------- hàng tên phần: chỉ cuộn khung, không cuộn trang ---------- */
const scr = $("scr"), navB = [...document.querySelectorAll("#stnav button")];
navB.forEach(b => b.onclick = () => {
  const s = scr.querySelector('[data-sec="' + b.dataset.go + '"]');
  scr.scrollTo({ top: s.getBoundingClientRect().top - scr.getBoundingClientRect().top + scr.scrollTop, behavior: matchMedia("(prefers-reduced-motion:reduce)").matches ? "auto" : "smooth" });
});
function navSync() {
  const top = scr.getBoundingClientRect().top + 8; let a = navB[0];
  scr.querySelectorAll(".pn-sec").forEach(s => { if (s.getBoundingClientRect().top <= top + 30) a = navB.find(b => b.dataset.go === s.dataset.sec) || a; });
  if (scr.scrollTop + scr.clientHeight >= scr.scrollHeight - 2) a = navB[navB.length - 1];
  navB.forEach(b => { b.classList.toggle("act", b === a); if (b === a) b.classList.remove("dot"); });
}
scr.addEventListener("scroll", navSync, { passive: true });

const h0 = parseHash(); load(h0.id, h0.o); navSync();
addEventListener("hashchange", () => { const h = parseHash(); load(h.id, h.o); });
})();
