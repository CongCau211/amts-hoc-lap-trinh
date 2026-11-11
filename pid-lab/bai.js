/* PID Lab · các mô phỏng nhỏ trong bài học (index.html). Dùng chung bộ máy pid.js và hàm vẽ ve.js với Lab.
   Mỗi mô phỏng: đồ thị cao cố định + vài thanh trượt; kéo là tính lại cả lần chạy và vẽ ngay (không có gì xê dịch). */
(function () {
"use strict";
const X = PID, f = X.fmt, $ = (id) => document.getElementById(id);
const C = { r: "#d97706", y: "#0E97A9", u: "#2563eb", p: "#db2777", i: "#7c3aed", d: "#ea580c", g: "#94a3b8" };

function widget(el, cfg) {
  if (!el) return;
  const P = X.plant(cfg.plant, cfg.over), vals = {};
  let h = '<div class="wt">' + cfg.title + '</div><div class="leg"><span><i class="ds" style="border-color:' + C.r + '"></i>r điểm đặt</span><span><i style="border-color:' + C.y + '"></i>y</span><span><i style="border-color:' + C.u + '"></i>u</span>' +
    (cfg.pid ? '<span><i style="border-color:' + C.i + '"></i>khâu I</span>' : '') + '</div><canvas aria-label="Đồ thị mô phỏng"></canvas><div class="ctl">';
  cfg.controls.forEach(c => {
    vals[c.k] = c.val;
    if (c.opts) h += '<label>' + c.label + '<select data-k="' + c.k + '">' + c.opts.map(o => '<option value="' + o[0] + '"' + (o[0] === c.val ? " selected" : "") + '>' + o[1] + '</option>').join("") + '</select></label>';
    else h += '<label><b>' + c.label + '</b><input type="range" data-k="' + c.k + '" min="' + c.min + '" max="' + c.max + '" step="' + c.step + '" value="' + c.val + '" aria-label="' + c.label.replace(/<[^>]+>/g, "") + '"><output></output></label>';
  });
  h += '</div><div class="out"></div><a class="lk" href="lab.html">Mở trong PID Lab →</a>';
  el.innerHTML = h;
  const cv = el.querySelector("canvas"), out = el.querySelector(".out"), lk = el.querySelector(".lk");
  function go() {
    el.querySelectorAll("input[type=range]").forEach(i => { vals[i.dataset.k] = +i.value; i.nextElementSibling.textContent = f(+i.value, 3) + (cfg.unit && cfg.unit[i.dataset.k] ? " " + cfg.unit[i.dataset.k] : ""); });
    el.querySelectorAll("select").forEach(s => vals[s.dataset.k] = isNaN(+s.value) ? s.value : +s.value);
    const PP = cfg.plantFn ? cfg.plantFn(vals) : P;
    const c = Object.assign(X.defaultCtrl(PP), cfg.ctrl, cfg.set(vals, PP));
    const sc = X.defaultScen(PP, { dist: !!cfg.dist }); if (cfg.T) sc.T = cfg.T;
    const R = X.run(PP, c, sc, 3), m = X.metrics(R, sc, PP);
    const bot = { h: 40, title: PP.uName + " (" + PP.uU + ")", lines: [], bands: [{ y: PP.uMax, c: "rgba(185,28,28,.6)" }, { y: PP.uMin, c: "rgba(185,28,28,.6)" }] };
    if (cfg.pid) { bot.lines.push({ x: R.t, y: R.I, c: C.i, w: 1.6 }); bot.zero = true; }
    else { const pad = (PP.uMax - PP.uMin) * 0.08; bot.min = PP.uMin - pad; bot.max = PP.uMax + pad; }
    bot.lines.push({ x: R.t, y: R.u, c: C.u, w: 1.6, step: true });
    const top = { h: 60, title: PP.yName + " (" + PP.yU + ")", lines: [], marks: [] };
    if (c.noise > 0) top.lines.push({ x: R.t, y: R.ym, c: "rgba(14,151,169,.3)", w: 1 });
    top.lines.push({ x: R.t, y: R.r, c: C.r, w: 1.5, dash: [6, 4], step: true }, { x: R.t, y: R.y, c: C.y, w: 2.3 });
    sc.ev.forEach(e => { if (e.type === "d") top.marks.push({ x: e.t, c: "rgba(185,28,28,.6)", label: "nhiễu tải" }); });
    if (cfg.yRange) { top.min = cfg.yRange[0]; top.max = cfg.yRange[1]; }
    ve(cv, { theme: "light", x0: 0, x1: sc.T, xU: PP.tU, panes: [top, bot] });
    out.innerHTML = cfg.out(R, m, vals, PP, c);
    lk.href = "lab.html#" + PP.id + "?" + cfg.lab(vals, c);
  }
  el.addEventListener("input", go); el.addEventListener("change", go);
  go(); new ResizeObserver(() => go()).observe(cv);
}
const tF = (v, P) => v == null ? "chưa xác lập" : f(v, 3) + " " + P.tU;

/* 4. On/Off */
widget($("w-onoff"), {
  title: "Lò nhiệt điều khiển On/Off", plant: "lo", ctrl: { type: "onoff" }, T: 1200,
  controls: [{ k: "h", label: "Vùng trễ", min: 0, max: 40, step: 1, val: 0 }], unit: { h: "°C" },
  set: (v) => ({ hyst: v.h }),
  out: (R) => {
    let sw = 0, mx = -Infinity, mn = Infinity; const n = R.t.length;
    for (let i = 1; i < n; i++) if (R.u[i] !== R.u[i - 1]) sw++;
    for (let i = Math.floor(n / 2); i < n; i++) { mx = Math.max(mx, R.y[i]); mn = Math.min(mn, R.y[i]); }
    return "Nửa sau: nhiệt độ dao động từ <b>" + f(mn, 4) + "</b> tới <b>" + f(mx, 4) + " °C</b> (biên độ đỉnh–đỉnh " + f(mx - mn, 3) + " °C). Rơ-le đóng cắt <b>" + sw + " lần</b> trong 20 phút. Tăng vùng trễ: bớt đóng cắt nhưng dao động rộng hơn. Dù trễ = 0, trễ 15 s của lò vẫn làm nhiệt độ vượt qua lại điểm đặt.";
  },
  lab: (v) => "type=onoff&hy=" + v.h + "&dist=0",
});

/* 5. P */
widget($("w-p"), {
  title: "Chỉ khâu P: sai số xác lập và dao động", plant: "lo",
  plantFn: (v) => X.plant("lo", { L: v.L }),
  controls: [{ k: "Kp", label: "K<sub>p</sub>", min: 0.2, max: 8, step: 0.1, val: 2 }, { k: "L", label: "Trễ của lò", opts: [[0, "Không có trễ (L = 0)"], [15, "Có trễ L = 15 s"]], val: 0 }], unit: { Kp: "%/°C" },
  set: (v) => ({ Kp: v.Kp, Ki: 0, Kd: 0 }),
  out: (R, m, v, P) => {
    const s = m.step, th = 175 / (1 + 3 * v.Kp);
    return "Công thức: e∞ = 175 / (1 + 3 × " + f(v.Kp, 3) + ") = <b>" + f(th, 3) + " °C</b>. Mô phỏng: e∞ = <b>" + f(s.ess, 3) + " °C</b>" +
      (s.ts == null ? ' <span style="color:var(--warn)">(vẫn đang dao động, chưa xác lập: K<sub>p</sub> quá lớn so với trễ)</span>' : "") + ". Vọt lố " + f(s.os, 3) + " %. Tăng K<sub>p</sub>: sai số nhỏ đi, nhưng khi có trễ thì dao động tăng dần.";
  },
  lab: (v) => "Kp=" + v.Kp + "&Ki=0&Kd=0&dist=0",
});

/* 6. I */
widget($("w-i"), {
  title: "Thêm khâu I: xóa sai số, kể cả khi có nhiễu tải", plant: "lo", dist: true,
  controls: [{ k: "Kp", label: "K<sub>p</sub>", min: 0.5, max: 4, step: 0.05, val: 1.6 }, { k: "Ki", label: "K<sub>i</sub>", min: 0, max: 0.06, step: 0.001, val: 0.014 }], unit: { Kp: "%/°C" },
  set: (v) => ({ Kp: v.Kp, Ki: v.Ki, Kd: 0 }),
  out: (R, m, v, P) => {
    const s = m.step, d = m.dist;
    return (v.Ki > 0 ? "T<sub>i</sub> = K<sub>p</sub>/K<sub>i</sub> = " + f(v.Kp / v.Ki, 3) + " s. " : "K<sub>i</sub> = 0: chỉ còn P. ") + "Sai số xác lập <b>" + f(s.ess, 3) + " °C</b>, vọt lố <b>" + f(s.os, 3) + " %</b>, xác lập ±2 % sau <b>" + tF(s.ts, P) + "</b>. Mở cửa lò lúc 720 s: lệch tối đa " + f(d.dev, 3) + " °C, cuối cùng còn lệch " + f(d.endErr, 3) + " °C.";
  },
  lab: (v) => "Kp=" + v.Kp + "&Ki=" + v.Ki + "&Kd=0",
});

/* 7. D */
widget($("w-d"), {
  title: "Khâu D là giảm chấn: khối lượng – lò xo", plant: "loxo", T: 6,
  controls: [{ k: "Kp", label: "K<sub>p</sub>", min: 0.1, max: 3, step: 0.05, val: 0.5 }, { k: "Kd", label: "K<sub>d</sub>", min: 0, max: 0.5, step: 0.01, val: 0 },
    { k: "nz", label: "Nhiễu đo", opts: [[0, "Không có nhiễu"], [1, "Nhiễu vừa"], [3, "Nhiễu mạnh"]], val: 0 }, { k: "nf", label: "Lọc khâu D", opts: [[0, "Không lọc"], [5, "Lọc Tf = 5·Ts"], [20, "Lọc Tf = 20·Ts"]], val: 0 }],
  unit: { Kp: "N/cm", Kd: "N·s/cm" },
  set: (v, P) => ({ Kp: v.Kp, Ki: 0, Kd: v.Kd, noise: v.nz * P.noiseRef, Nf: v.nf }),
  out: (R, m, v, P) => {
    const p = P.p, z = (p.c + 100 * v.Kd) / (2 * Math.sqrt(p.m * (p.k + 100 * v.Kp)));
    return "ζ = (c + K<sub>d</sub>) / (2√(m·(k + K<sub>p</sub>))) = (" + f(p.c, 2) + " + " + f(100 * v.Kd, 3) + ") / (2√(1 × (" + f(p.k, 2) + " + " + f(100 * v.Kp, 3) + "))) = <b>" + f(z, 3) + "</b> <span style=\"color:var(--muted)\">(đổi K<sub>p</sub>, K<sub>d</sub> sang N/m, N·s/m: nhân 100)</span>. Vọt lố <b>" + f(m.step.os, 3) + " %</b>, xác lập " + tF(m.step.ts, P) + ". ζ &lt; 0,3 dao động mạnh; ζ ≈ 0,7–1 đẹp. Bật nhiễu: u rung mạnh khi K<sub>d</sub> lớn, lọc D giúp bớt rung.";
  },
  lab: (v) => "Kp=" + v.Kp + "&Ki=0&Kd=" + v.Kd + "&nf=" + v.nf,
});

/* 12. windup */
widget($("w-wind"), {
  title: "Bão hòa tích phân khi khởi động lò", plant: "lo", pid: true, T: 1200,
  controls: [{ k: "Ki", label: "K<sub>i</sub>", min: 0.01, max: 0.08, step: 0.002, val: 0.05 },
    { k: "aw", label: "Chống bão hòa", opts: [["none", "Không chống"], ["clamp", "Dừng tích phân"], ["back", "Tính ngược"]], val: "none" }],
  set: (v) => ({ Kp: 2, Ki: v.Ki, Kd: 0, aw: v.aw }),
  out: (R, m, v, P) => {
    let mx = -Infinity; R.I.forEach(x => mx = Math.max(mx, x));
    return "K<sub>p</sub> = 2. Khâu I (đường tím ở đồ thị dưới) lớn nhất <b>" + f(mx, 3) + " %</b> trong khi u không thể quá 100 %. Vọt lố <b>" + f(m.step.os, 3) + " %</b>, xác lập sau " + tF(m.step.ts, P) + ". Chọn “Dừng tích phân” hoặc “Tính ngược” rồi so.";
  },
  lab: (v) => "Kp=2&Ki=" + v.Ki + "&Kd=0&aw=" + v.aw + "&dist=0",
});

/* 10. tính PID số từng bước bằng tay */
(function calc() {
  const el = $("w-calc"); if (!el) return;
  const Kp = 1, Ki = 0.5, Kd = 0.2, Ts = 1, r = 10, a = 0.8, b = 0.4, uMin = 0, uMax = 20;
  el.innerHTML = '<div class="wt">PID số tính tay, từng chu kỳ</div>' +
    '<p style="margin:0 0 6px;font-size:14.5px">K<sub>p</sub> = 1, K<sub>i</sub> = 0,5, K<sub>d</sub> = 0,2, T<sub>s</sub> = 1 s, điểm đặt r = 10, y[0] = 0, u giới hạn trong [0; 20]. D theo sai số, lấy e[−1] = e[0].</p>' +
    '<div class="row"><button class="p" id="cNext">Bước tiếp →</button><button id="c10">Chạy 10 bước</button><button id="cRe">↺ Làm lại</button></div><div class="lines" id="cL"></div><canvas id="cCv" style="height:180px"></canvas>';
  let S;
  const reset = () => { S = { k: 0, y: [0], e: [], I: [0], u: [], P: [], D: [] }; };
  function step() {
    const k = S.k, y = S.y[k], e = r - y, eP = k ? S.e[k - 1] : e, Ip = k ? S.I[k] : 0;
    const P = Kp * e, I = Ip + Ki * Ts * e, D = Kd * (e - eP) / Ts, u0 = P + I + D, u = Math.min(uMax, Math.max(uMin, u0));
    S.e[k] = e; S.P[k] = P; S.I[k + 1] = I; S.D[k] = D; S.u[k] = u; S.y[k + 1] = a * y + b * u; S.k++;
    S.last = { k, y, e, eP, Ip, P, I, D, u0, u, yn: S.y[k + 1] };
  }
  const n = (v) => f(v, 4);
  function show() {
    const L = S.last, ln = (a1, b1) => '<div class="ln"><span>' + a1 + '</span><span>' + b1 + '</span></div>';
    $("cL").innerHTML = !L ? ln("Chưa chạy", "Bấm <b>Bước tiếp</b> để tính chu kỳ k = 0.") + ln("", "") + ln("", "") + ln("", "") + ln("", "") + ln("", "") + ln("", "") :
      ln("Chu kỳ", "k = " + L.k + ", t = " + L.k + " s") +
      ln("1. Đọc y", "y[" + L.k + "] = <b>" + n(L.y) + "</b>") +
      ln("2. Sai số", "e = r − y = 10 − " + n(L.y) + " = <b>" + n(L.e) + "</b>") +
      ln('3. <span class="cp">P</span>', "Kp·e = 1 × " + n(L.e) + " = <b class=\"cp\">" + n(L.P) + "</b>") +
      ln('4. <span class="ci">I</span>', "I[k−1] + Ki·Ts·e = " + n(L.Ip) + " + 0,5 × 1 × " + n(L.e) + " = <b class=\"ci\">" + n(L.I) + "</b>") +
      ln('5. <span class="cd">D</span>', "Kd·(e[k] − e[k−1])/Ts = 0,2 × (" + n(L.e) + " − " + n(L.eP) + ") / 1 = <b class=\"cd\">" + n(L.D) + "</b>") +
      ln("6. u", "P + I + D = " + n(L.u0) + (L.u0 !== L.u ? " → giới hạn [0; 20] → " : " (trong giới hạn) → ") + "<b class=\"cu\">u = " + n(L.u) + "</b>") +
      ln("7. Đối tượng", "y[" + (L.k + 1) + "] = 0,8 × " + n(L.y) + " + 0,4 × " + n(L.u) + " = <b>" + n(L.yn) + "</b>");
    const t = S.y.map((_, i) => i), tu = S.u.map((_, i) => i), T = Math.max(10, S.k + 1);
    ve($("cCv"), { theme: "light", x0: 0, x1: T, xU: "k", cursor: L ? L.k : null, panes: [
      { h: 60, title: "y", min: 0, max: 14, lines: [{ x: [0, T], y: [r, r], c: C.r, dash: [6, 4] }, { x: t, y: S.y, c: C.y, w: 2.2 }] },
      { h: 40, title: "u", min: -1, max: 21, lines: [{ x: tu, y: S.u, c: C.u, step: true }] }] });
  }
  $("cNext").onclick = () => { step(); show(); };
  $("c10").onclick = () => { for (let i = 0; i < 10; i++) step(); show(); };
  $("cRe").onclick = () => { reset(); show(); };
  reset(); show(); new ResizeObserver(show).observe($("cCv"));
})();

/* mục lục: mở sẵn trên màn hình rộng, tô mục đang đọc */
const d = $("tocd"); if (d && matchMedia("(min-width:1024px)").matches) d.open = true;
const links = [...document.querySelectorAll("#tocl a")];
const io = new IntersectionObserver((es) => {
  es.forEach(e => { if (e.isIntersecting) links.forEach(a => a.classList.toggle("on", a.getAttribute("href") === "#" + e.target.id)); });
}, { rootMargin: "-80px 0px -70% 0px" });
document.querySelectorAll("section.s").forEach(s => io.observe(s));
links.forEach(a => a.addEventListener("click", () => { if (!matchMedia("(min-width:1024px)").matches) d.open = false; }));
})();
