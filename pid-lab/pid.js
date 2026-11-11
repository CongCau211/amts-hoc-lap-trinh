/* PID Lab · bộ máy mô phỏng (không phụ thuộc giao diện, chạy được trong Node: node --test test.js)
   - Đối tượng (plant) là hệ phương trình vi phân liên tục, giải bằng RK4 bước nhỏ dt.
   - Bộ điều khiển là PID SỐ: cứ mỗi chu kỳ lấy mẫu Ts đọc cảm biến một lần, tính u, rồi GIỮ u không đổi tới lần sau (ZOH),
     đúng như PLC / vi điều khiển thật.
   - Trễ (dead time) L là trễ vận chuyển giữa u và đối tượng (đường ống, driver, cảm biến...).
   Mọi đại lượng có đơn vị thật (°C, rpm, độ, m, cm) để học viên quen với con số ngoài đời. */
(function (root) {
"use strict";

/* ---------------- đối tượng điều khiển ---------------- */
const PLANTS = [
  { id: "lo", name: "Lò nhiệt", en: "Heater / furnace",
    desc: "Lò điện trở: u là % công suất thanh nhiệt (0–100 %, chỉ sưởi được, không làm lạnh được), y là nhiệt độ trong lò. Đối tượng bậc 1 có trễ (FOPDT): τ = 150 s, K = 3 °C/%, trễ L = 15 s.",
    model: "τ·dy/dt = −(y − 25) + K·u(t − L) − D",
    yName: "Nhiệt độ", yU: "°C", uName: "Công suất", uU: "%", tU: "s",
    T: 1200, dt: 0.5, Ts: 1, L: 15, uMin: 0, uMax: 100,
    y0: 25, r1: 200, tStep: 10, tDist: 720, distName: "Mở cửa lò (mất nhiệt)", distMag: 60,
    gains: { Kp: 2, Ki: 0.004, Kd: 0 }, ref: { Kp: 1.6, Ki: 0.013, Kd: 20 }, noiseRef: 2,
    p: { K: 3, tau: 150, amb: 25 },
    init(p) { return [p.amb]; },
    f(x, u, d, p) { return [(-(x[0] - p.amb) + p.K * u - d) / p.tau]; },
    out(x) { return x[0]; },
    u0() { return 0; },
    uss(r, p) { return (r - p.amb) / p.K; },
    goal: { os: 5, ts: 400, ess: 1, txt: "vọt lố < 5 %, xác lập (±2 %) < 400 s, sai số xác lập < 1 °C" } },

  { id: "dc", name: "Tốc độ động cơ DC", en: "DC motor speed",
    desc: "Động cơ DC nam châm vĩnh cửu: u là điện áp đặt vào (−24…24 V), y là tốc độ quay (rpm). Mô hình đủ hai phương trình điện và cơ (bậc 2); trễ đo tốc độ của encoder L = 1 ms. Nhiễu tải là mô-men cản 0,04 N·m.",
    model: "L·di/dt = V − R·i − Ke·ω ;  J·dω/dt = Kt·i − b·ω − T_tải",
    yName: "Tốc độ", yU: "rpm", uName: "Điện áp", uU: "V", tU: "s",
    T: 1.0, dt: 0.0002, Ts: 0.002, L: 0.001, uMin: -24, uMax: 24,
    y0: 0, r1: 3000, tStep: 0.05, tDist: 0.6, distName: "Mô-men tải 0,04 N·m", distMag: 0.04,
    gains: { Kp: 0.01, Ki: 0.08, Kd: 0 }, ref: { Kp: 0.05, Ki: 1, Kd: 0.0005 }, noiseRef: 30,
    p: { R: 2, Lm: 0.01, Kt: 0.05, Ke: 0.05, J: 2e-4, b: 1e-5 },
    init() { return [0, 0]; },
    f(x, u, d, p) { return [(u - p.R * x[0] - p.Ke * x[1]) / p.Lm, (p.Kt * x[0] - p.b * x[1] - d) / p.J]; },
    out(x) { return x[1] * 60 / (2 * Math.PI); },
    u0() { return 0; },
    uss(r, p) { const w = r * 2 * Math.PI / 60; return w * (p.R * p.b + p.Kt * p.Ke) / p.Kt; },
    goal: { os: 5, ts: 0.25, ess: 10, txt: "vọt lố < 5 %, xác lập < 0,25 s, sai số xác lập < 10 rpm" } },

  { id: "servo", name: "Vị trí servo", en: "Servo position",
    desc: "Trục động cơ quay tới một góc: u là điện áp (−12…12 V), y là góc (độ). Đối tượng có khâu tích phân (vị trí là tích phân của tốc độ) nên chỉ P đã hết sai số khi không tải; nhiễu tải là mô-men cản cố định 0,02 N·m (giống trọng lực kéo cánh tay). Trễ driver L = 5 ms.",
    model: "dθ/dt = ω ;  dω/dt = 125·V − 6,3·ω − T_tải/J",
    yName: "Góc", yU: "°", uName: "Điện áp", uU: "V", tU: "s",
    T: 1.5, dt: 0.0005, Ts: 0.002, L: 0.005, uMin: -12, uMax: 12, integrating: true,
    y0: 0, r1: 90, tStep: 0.05, tDist: 0.9, distName: "Mô-men tải 0,02 N·m", distMag: 0.02,
    gains: { Kp: 0.05, Ki: 0, Kd: 0.002 }, ref: { Kp: 0.1, Ki: 1, Kd: 0.005 }, noiseRef: 0.5,
    p: { R: 2, Kt: 0.05, Ke: 0.05, J: 2e-4, b: 1e-5 },
    init() { return [0, 0]; },
    f(x, u, d, p) { return [x[1], (p.Kt / (p.J * p.R)) * u - ((p.b + p.Kt * p.Ke / p.R) / p.J) * x[1] - d / p.J]; },
    out(x) { return x[0] * 180 / Math.PI; },
    u0() { return 0; },
    uss() { return 0; },
    goal: { os: 5, ts: 0.4, ess: 0.5, txt: "vọt lố < 5 %, xác lập < 0,4 s, sai số xác lập < 0,5° (kể cả khi có tải)" } },

  { id: "bon", name: "Mực nước bồn", en: "Tank level",
    desc: "Bồn chứa có van xả ở đáy: u là % công suất bơm cấp (0–100 %), y là mực nước (m). Lưu lượng xả tỉ lệ √h nên đối tượng PHI TUYẾN: mực càng cao xả càng mạnh. Ống cấp dài gây trễ L = 3 s. Bồn cao 2 m, đầy thì tràn.",
    model: "A·dh/dt = q_max·u(t − L)/100 − c·√h − q_xả_thêm",
    yName: "Mực nước", yU: "m", uName: "Bơm", uU: "%", tU: "s",
    T: 900, dt: 0.5, Ts: 1, L: 3, uMin: 0, uMax: 100,
    y0: 0.5, r1: 1.0, tStep: 20, tDist: 540, distName: "Mở thêm van xả", distMag: 0.004,
    gains: { Kp: 60, Ki: 0.4, Kd: 0 }, ref: { Kp: 300, Ki: 8, Kd: 1000 }, noiseRef: 0.01,
    p: { A: 0.8, qmax: 0.02, c: 0.01, H: 2 },
    init() { return [0.5]; },
    f(x, u, d, p) { const h = Math.max(0, x[0]); return [(p.qmax * u / 100 - p.c * Math.sqrt(h) - (h > 0 ? d : 0)) / p.A]; },
    clamp(x, p) { if (x[0] < 0) x[0] = 0; if (x[0] > p.H) x[0] = p.H; },
    out(x) { return x[0]; },
    u0(p) { return p.c * Math.sqrt(0.5) / p.qmax * 100; },
    uss(r, p) { return p.c * Math.sqrt(Math.max(0, r)) / p.qmax * 100; },
    goal: { os: 3, ts: 250, ess: 0.005, txt: "vọt lố < 3 %, xác lập < 250 s, sai số xác lập < 5 mm" } },

  { id: "loxo", name: "Khối lượng – lò xo", en: "Mass–spring–damper",
    desc: "Vật 1 kg gắn lò xo 40 N/m, giảm chấn rất yếu (ζ ≈ 0,1): tự nó đã dao động. u là lực đẩy (−50…50 N), y là vị trí (cm). Đây là nơi khâu D (giảm chấn ảo) thể hiện rõ nhất. Trễ cơ cấu chấp hành L = 5 ms.",
    model: "m·d²x/dt² = F(t − L) − c·dx/dt − k·x + F_nhiễu",
    yName: "Vị trí", yU: "cm", uName: "Lực", uU: "N", tU: "s",
    T: 10, dt: 0.002, Ts: 0.01, L: 0.005, uMin: -50, uMax: 50,
    y0: 0, r1: 10, tStep: 0.2, tDist: 6, distName: "Lực đẩy ngoài 5 N", distMag: 5,
    gains: { Kp: 0.5, Ki: 0, Kd: 0 }, ref: { Kp: 0.5, Ki: 1, Kd: 0.2 }, noiseRef: 0.1, oscill: true,
    p: { m: 1, k: 40, c: 1.2 },
    init() { return [0, 0]; },
    f(x, u, d, p) { return [x[1], (u - p.c * x[1] - p.k * x[0] + d) / p.m]; },
    out(x) { return x[0] * 100; },
    u0() { return 0; },
    uss(r, p) { return p.k * r / 100; },
    goal: { os: 5, ts: 2, ess: 0.1, txt: "vọt lố < 5 %, xác lập < 2 s, sai số xác lập < 1 mm" } },
];
const BY = {}; PLANTS.forEach(P => BY[P.id] = P);

/* sao chép đối tượng và ghi đè một số thông số (bài viết dùng để bỏ trễ, đổi K...) */
function plant(id, over) {
  const B = BY[id]; if (!B) throw new Error("không có đối tượng " + id);
  const P = Object.assign({}, B, over || {});
  P.p = Object.assign({}, B.p, (over && over.p) || {});
  return P;
}

/* ---------------- bộ điều khiển ---------------- */
function defaultCtrl(P) {
  return { type: "pid", Kp: P.gains.Kp, Ki: P.gains.Ki, Kd: P.gains.Kd, Ts: P.Ts,
    b: 1,          // trọng số điểm đặt của khâu P (1 = PID chuẩn)
    dOn: "y",      // khâu D lấy theo: "e" sai số (bị "giật D" khi đổi điểm đặt) | "y" giá trị đo
    Nf: 5,         // lọc khâu D: hằng số lọc Tf = Nf·Ts (0 = không lọc)
    aw: "clamp",   // chống bão hòa tích phân: "none" | "clamp" (dừng tích phân) | "back" (tính ngược)
    isep: 0,       // tách tích phân: chỉ cộng dồn khi |e| < isep (cùng đơn vị y; 0 = luôn cộng dồn)
    hyst: 0,       // độ trễ (vùng chết) của bộ On/Off, cùng đơn vị y
    noise: 0 };    // nhiễu đo: độ lệch chuẩn, cùng đơn vị y
}
function defaultScen(P, opt) {
  opt = opt || {};
  const ev = [{ t: P.tStep, type: "r", v: P.r1 }];
  if (opt.dist !== false) ev.push({ t: P.tDist, type: "d", v: 1 });
  return { T: opt.T || P.T, r0: P.y0, ev };
}

/* số ngẫu nhiên có hạt giống: chạy lại cùng thông số cho cùng đường cong */
function rng(seed) {
  let a = seed >>> 0;
  const u = () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  return () => { let s = 0; for (let i = 0; i < 6; i++) s += u(); return (s - 3) * Math.SQRT2; };   // gần chuẩn N(0,1)
}

function rk4(P, x, u, d, h) {
  const f = (s) => P.f(s, u, d, P.p), add = (a, b, c) => a.map((v, i) => v + c * b[i]);
  const k1 = f(x), k2 = f(add(x, k1, h / 2)), k3 = f(add(x, k2, h / 2)), k4 = f(add(x, k3, h));
  return x.map((v, i) => v + h / 6 * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]));
}

/* Một lần mô phỏng. step() chạy đúng MỘT chu kỳ lấy mẫu (đọc cảm biến → tính PID → giữ u trong Ts).
   ctrl được đọc lại ở mỗi chu kỳ, nên đổi Kp/Ki/Kd giữa chừng có tác dụng ngay từ chu kỳ sau. */
function Sim(P, ctrl, scen, seed) {
  this.P = P; this.c = ctrl; this.scen = scen;
  this.Ts = ctrl.Ts;
  this.n = Math.max(1, Math.round(this.Ts / P.dt)); this.h = this.Ts / this.n;
  this.nd = Math.round((P.L || 0) / this.h);
  this.x = P.init(P.p);
  this.u0 = P.u0(P.p);
  this.buf = []; for (let i = 0; i < this.nd; i++) this.buf.push(this.u0);
  this.k = 0; this.r = scen.r0; this.dOn = 0;
  this.I = this.u0;            // khởi động không giật: khâu I mang sẵn u đang cần ở trạng thái đầu
  this.Df = 0; this.xPrev = null; this.lastU = this.u0; this.lastRaw = this.u0; this.relay = 1;
  this.ev = scen.ev.slice().sort((a, b) => a.t - b.t); this.ei = 0;
  this.gauss = rng(seed == null ? 12345 : seed);
  this.R = { t: [], r: [], y: [], ym: [], u: [], uRaw: [], e: [], P: [], I: [], Ip: [], D: [], Dr: [], sat: [], hold: [], d: [] };
  this.N = Math.floor(scen.T / this.Ts + 1e-9) + 1;
}
Sim.prototype.done = function () { return this.k >= this.N; };
Sim.prototype.addEvent = function (e) {   // sự kiện thêm lúc đang chạy (bấm nút): chèn đúng chỗ theo thời gian
  let i = this.ei; while (i < this.ev.length && this.ev[i].t <= e.t) i++;
  this.ev.splice(i, 0, e);
};
Sim.prototype.step = function () {
  if (this.done()) return false;
  const P = this.P, c = this.c, Ts = this.Ts, t = this.k * Ts, R = this.R;
  while (this.ei < this.ev.length && this.ev[this.ei].t <= t + 1e-9) {
    const e = this.ev[this.ei++];
    if (e.type === "r") this.r = e.v; else this.dOn = e.v;
  }
  const y = P.out(this.x), ym = y + (c.noise > 0 ? c.noise * this.gauss() : 0), r = this.r;
  const e = r - ym;
  let u, uRaw, Pt = 0, Ip = this.I, D = 0, Dr = 0, hold = 0;
  if (c.type === "onoff") {
    const h = (c.hyst || 0) / 2;
    if (e > h) this.relay = 1; else if (e < -h) this.relay = -1;
    uRaw = u = this.relay > 0 ? P.uMax : P.uMin;
    this.I = 0;
  } else if (c.type === "relay") {          // thử rơ-le (tự chỉnh Åström–Hägglund)
    const h = (c.hyst || 0) / 2;
    if (e > h) this.relay = 1; else if (e < -h) this.relay = -1;
    uRaw = u = c.uc + this.relay * c.d;
    this.I = 0;
  } else if (c.type === "open") {           // vòng hở: u đặt tay (thử bước)
    uRaw = u = c.uFn(t);
    this.I = 0;
  } else {
    Pt = c.Kp * ((c.b == null ? 1 : c.b) * r - ym);
    const xd = c.dOn === "e" ? e : -ym;
    Dr = this.xPrev == null ? 0 : c.Kd * (xd - this.xPrev) / Ts;
    this.xPrev = xd;
    const Tf = (c.Nf || 0) * Ts;
    this.Df = Tf > 0 ? this.Df + Ts / (Tf + Ts) * (Dr - this.Df) : Dr;
    D = this.Df;
    const sep = c.isep > 0 && Math.abs(e) >= c.isep;      // sai số còn lớn: tạm chưa tích phân
    let I = sep ? this.I : this.I + c.Ki * Ts * e;
    if (sep) hold = 2;
    if (c.aw === "back" && c.Ki > 0) {
      const Ti = c.Kp > 0 ? c.Kp / c.Ki : 1 / c.Ki, Td = c.Kp > 0 ? c.Kd / c.Kp : 0;
      const Tt = Td > 0 ? Math.sqrt(Ti * Td) : Ti;
      I += Ts / Tt * (this.lastU - this.lastRaw);
    }
    uRaw = Pt + I + D;
    if (c.aw === "clamp" && ((uRaw > P.uMax && e * c.Ki > 0) || (uRaw < P.uMin && e * c.Ki < 0))) {
      I = this.I; uRaw = Pt + I + D; hold = 1;   // đang bão hòa mà còn đẩy thêm cùng chiều: không cộng dồn nữa
    }
    this.I = I;
    u = Math.min(P.uMax, Math.max(P.uMin, uRaw));
  }
  this.lastU = u; this.lastRaw = uRaw;
  R.t.push(t); R.r.push(r); R.y.push(y); R.ym.push(ym); R.u.push(u); R.uRaw.push(uRaw); R.e.push(e);
  R.P.push(Pt); R.Ip.push(Ip); R.I.push(c.type === "pid" ? this.I : 0); R.D.push(D); R.Dr.push(Dr);
  R.sat.push(uRaw > P.uMax + 1e-12 ? 1 : uRaw < P.uMin - 1e-12 ? -1 : 0); R.hold.push(hold); R.d.push(this.dOn);
  // giữ u trong Ts, giải đối tượng bằng RK4 với n bước nhỏ, qua bộ đệm trễ
  const dd = this.dOn ? P.distMag : 0;
  for (let i = 0; i < this.n; i++) {
    let ua = u;
    if (this.nd > 0) { this.buf.push(u); ua = this.buf.shift(); }
    this.x = rk4(P, this.x, ua, dd, this.h);
    if (P.clamp) P.clamp(this.x, P.p);
  }
  this.k++;
  return true;
};
function run(P, ctrl, scen, seed) {
  const s = new Sim(P, ctrl, scen || defaultScen(P), seed);
  while (s.step());
  return s.R;
}

/* ---------------- chỉ tiêu chất lượng ----------------
   Tính cho lần đổi điểm đặt đầu tiên (đoạn từ lúc đổi tới sự kiện kế tiếp hoặc hết giờ)
   và cho nhiễu tải (độ lệch lớn nhất, thời gian phục hồi về dải ±2 %). */
function metrics(R, scen, P) {
  const N = R.t.length; if (N < 3) return null;
  const Ts = R.t[1] - R.t[0];
  const ev = scen.ev.slice().sort((a, b) => a.t - b.t);
  const out = {};
  const iOf = (t) => Math.min(N - 1, Math.max(0, Math.ceil(t / Ts - 1e-9)));
  const st = ev.find(e => e.type === "r");
  if (st) {
    const i0 = iOf(st.t), nx = ev.find(e => e.t > st.t + 1e-9), i1 = nx ? iOf(nx.t) - 1 : N - 1;
    const y0 = R.y[i0], r = st.v;
    // giá trị xác lập y∞ = trung bình 5 % cuối đoạn; vọt lố, thời gian lên, xác lập tính theo y∞ (định nghĩa chuẩn),
    // sai số xác lập ess = r − y∞
    const nT = Math.max(1, Math.round((i1 - i0 + 1) * 0.05));
    let yinf = 0; for (let i = i1 - nT + 1; i <= i1; i++) yinf += R.y[i]; yinf /= nT;
    let ref = yinf; if (Math.abs(yinf - y0) < 0.05 * Math.abs(r - y0)) ref = r;
    const dy = ref - y0, s = Math.sign(dy) || 1, A = Math.abs(dy) || 1;
    let t10 = null, t90 = null, pk = -Infinity, iae = 0;
    for (let i = i0; i <= i1; i++) {
      const p = (R.y[i] - y0) * s / A;
      if (t10 == null && p >= 0.1) t10 = R.t[i];
      if (t90 == null && p >= 0.9) t90 = R.t[i];
      if (p > pk) pk = p;
      iae += Math.abs(r - R.y[i]) * Ts;
    }
    let last = null; for (let i = i1; i >= i0; i--) if (Math.abs(R.y[i] - ref) > 0.02 * A) { last = i; break; }
    const ess = r - yinf;
    out.step = { t0: st.t, y0, r, yinf, rise: t10 != null && t90 != null ? t90 - t10 : null,
      os: Math.max(0, (pk - 1) * 100), ts: last == null ? 0 : last >= i1 - nT ? null : R.t[last + 1] - st.t,
      ess, iae, segEnd: R.t[i1] };
  }
  const dv = ev.find(e => e.type === "d" && e.v);
  if (dv) {
    const i0 = iOf(dv.t), nx = ev.find(e => e.t > dv.t + 1e-9), i1 = nx ? iOf(nx.t) - 1 : N - 1;
    if (i1 > i0) {
      const r = R.r[i0]; let mx = 0, mi = i0;
      for (let i = i0; i <= i1; i++) { const v = Math.abs(R.y[i] - r); if (v > mx) { mx = v; mi = i; } }
      const band = 0.02 * (Math.abs(r - scen.r0) || Math.abs(r) || 1);
      let last = null; for (let i = i1; i >= i0; i--) if (Math.abs(R.y[i] - r) > band) { last = i; break; }
      out.dist = { t0: dv.t, dev: mx, tPeak: R.t[mi] - dv.t, rec: last == null ? 0 : last === i1 ? null : R.t[last + 1] - dv.t, endErr: r - R.y[i1] };
    }
  }
  let ns = 0; for (let i = 0; i < N; i++) if (R.sat[i]) ns++;
  out.satPct = ns / N * 100;
  return out;
}
function check(P, m) {   // bài thử thách của từng đối tượng
  if (!m || !m.step) return null;
  const g = P.goal, s = m.step;
  return [
    { k: "os", ok: s.os <= g.os },
    { k: "ts", ok: s.ts != null && s.ts <= g.ts },
    { k: "ess", ok: Math.abs(s.ess) <= g.ess && (!m.dist || m.dist.endErr == null || Math.abs(m.dist.endErr) <= g.ess) },
  ];
}

/* ---------------- tự chỉnh ----------------
   1) Thử rơ-le (Åström–Hägglund, 1984): thay PID bằng rơ-le u = uc ± d quanh điểm đặt; vòng kín tự dao động ở đúng
      tần số tới hạn. Đo biên độ a và chu kỳ Tu:  Ku ≈ 4d / (π·a). Sau đó tra bảng Ziegler–Nichols.
   2) Thử bước vòng hở: đổi u một bậc Δu, đo đường cong y(t), xấp xỉ thành bậc 1 có trễ (K, τ, L) bằng hai điểm
      28,3 % và 63,2 %:  τ = 1,5·(t63 − t28),  L = t63 − τ.  Sau đó dùng quy tắc SIMC (Skogestad, 2003). */
function relayTest(P, r) {
  r = r == null ? P.r1 : r;
  const uc = Math.min(P.uMax, Math.max(P.uMin, P.uss(r, P.p)));
  const d = Math.min(0.25 * (P.uMax - P.uMin), P.uMax - uc, uc - P.uMin);
  if (!(d > 0)) return { ok: false, why: "Điểm đặt quá sát giới hạn của u, không còn chỗ cho rơ-le." };
  const c = Object.assign(defaultCtrl(P), { type: "relay", uc, d, hyst: 0, noise: 0 });
  const R = run(P, c, { T: P.T * 2, r0: r, ev: [{ t: 0, type: "r", v: r }] });
  const up = [];
  for (let i = 1; i < R.t.length; i++) if (R.y[i - 1] < r && R.y[i] >= r) up.push(R.t[i]);
  if (up.length < 5) return { ok: false, why: "Chưa dao động đều (cần ít nhất 4 chu kỳ)." , R };
  const last = up.slice(-4), Tu = (last[3] - last[0]) / 3;
  let mx = -Infinity, mn = Infinity;
  for (let i = 0; i < R.t.length; i++) if (R.t[i] >= last[1]) { mx = Math.max(mx, R.y[i]); mn = Math.min(mn, R.y[i]); }
  const a = (mx - mn) / 2, Ku = 4 * d / (Math.PI * a);
  return { ok: true, Ku, Tu, a, d, uc, R };
}
function znRules(Ku, Tu) {
  return [
    { id: "zn-p", name: "Ziegler–Nichols P", Kp: 0.5 * Ku, Ti: Infinity, Td: 0 },
    { id: "zn-pi", name: "Ziegler–Nichols PI", Kp: 0.45 * Ku, Ti: Tu / 1.2, Td: 0 },
    { id: "zn-pid", name: "Ziegler–Nichols PID", Kp: 0.6 * Ku, Ti: Tu / 2, Td: Tu / 8 },
    { id: "zn-no", name: "ZN “không vọt lố”", Kp: 0.2 * Ku, Ti: Tu / 2, Td: Tu / 3 },
    { id: "tl-pi", name: "Tyreus–Luyben PI", Kp: Ku / 3.2, Ti: 2.2 * Tu, Td: 0 },
    { id: "tl-pid", name: "Tyreus–Luyben PID", Kp: Ku / 2.2, Ti: 2.2 * Tu, Td: Tu / 6.3 },
  ].map(toParallel);
}
function stepTest(P) {
  if (P.integrating) return { ok: false, why: "Đối tượng có khâu tích phân (vị trí): bước vòng hở làm y tăng mãi, không xấp xỉ được thành bậc 1 có trễ. Hãy dùng thử rơ-le." };
  if (P.oscill) return { ok: false, why: "Đối tượng tự dao động (bậc 2, giảm chấn rất yếu): đường cong bước không giống bậc 1 có trễ. Hãy dùng thử rơ-le." };
  const u0 = P.u0(P.p), du = 0.2 * (P.uMax - P.uMin) * (u0 + 0.2 * (P.uMax - P.uMin) <= P.uMax ? 1 : -1), tS = P.T * 0.02;
  const c = Object.assign(defaultCtrl(P), { type: "open", uFn: (t) => t >= tS ? u0 + du : u0, noise: 0 });
  const R = run(P, c, { T: P.T * 1.5, r0: P.y0, ev: [] });
  const y0 = R.y[0], yE = R.y[R.y.length - 1], dy = yE - y0;
  const at = (p) => { for (let i = 0; i < R.t.length; i++) if ((R.y[i] - y0) / dy >= p) return R.t[i] - tS; return null; };
  const t28 = at(0.283), t63 = at(0.632);
  if (t28 == null || t63 == null) return { ok: false, why: "Không đo được đường cong.", R };
  // Hai điểm 28,3 % / 63,2 % (Smith): đúng tuyệt đối với bậc 1 có trễ. Đối tượng phi tuyến (bồn nước) có thể cho L âm:
  // khi đó lấy L = lúc y bắt đầu nhích (vượt 1 % biên độ), τ = t63 − L.
  let tau = 1.5 * (t63 - t28), L = t63 - tau, how = "hai điểm";
  const tMove = at(0.01);
  if (L < 0.5 * tMove) { L = tMove; tau = t63 - L; how = "điểm bắt đầu nhích"; }
  const K = dy / du;
  return { ok: true, K, tau, L, du, tS, t28, t63, how, R };
}
function fopdtRules(K, tau, L, Ts) {
  const th = Math.max(L, Ts / 2);   // trễ hiệu dụng tối thiểu: nửa chu kỳ lấy mẫu
  const sim = (tc, nm, id) => ({ id, name: nm, Kp: tau / (K * (tc + th)), Ti: Math.min(tau, 4 * (tc + th)), Td: 0 });
  return [
    sim(th, "SIMC PI (τc = L, cân bằng)", "simc"),
    sim(3 * th, "SIMC PI (τc = 3L, êm)", "simc-em"),
    { id: "zno-pid", name: "Ziegler–Nichols PID (đường cong đáp ứng)", Kp: 1.2 * tau / (K * th), Ti: 2 * th, Td: 0.5 * th },
  ].map(toParallel);
}
function toParallel(g) {   // dạng chuẩn ISA Kp·(1 + 1/(Ti·s) + Td·s)  →  dạng song song Kp, Ki = Kp/Ti, Kd = Kp·Td
  return Object.assign({}, g, { Ki: isFinite(g.Ti) && g.Ti > 0 ? g.Kp / g.Ti : 0, Kd: g.Kp * g.Td });
}

/* số kiểu Việt Nam: dấu phẩy thập phân, đủ chữ số có nghĩa */
function fmt(v, sig) {
  if (v == null || !isFinite(v)) return "—";
  if (v === 0) return "0";
  sig = sig || 3;
  const a = Math.abs(v);
  let s;
  if (a >= 1e5 || a < 1e-4) s = v.toExponential(sig - 1).replace("e", "·10^");
  else { const dec = Math.max(0, sig - 1 - Math.floor(Math.log10(a))); s = v.toFixed(Math.min(dec, 6)); if (s.indexOf(".") >= 0) s = s.replace(/0+$/, "").replace(/\.$/, ""); }
  return s.replace("-", "−").replace(".", ",");
}

const API = { PLANTS, BY, plant, defaultCtrl, defaultScen, Sim, run, metrics, check, relayTest, stepTest, znRules, fopdtRules, toParallel, fmt, rng };
if (typeof module !== "undefined" && module.exports) module.exports = API; else root.PID = API;
})(this);
