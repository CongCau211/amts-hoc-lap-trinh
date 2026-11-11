/* PID Lab · vẽ đồ thị theo thời gian trên <canvas> (dùng chung cho bài viết và Lab).
   ve(canvas, {theme, x0, x1, xU, cursor, panes:[{h, unit, title, min, max, lines:[{x,y,c,w,dash,step}], bands:[{y,c}], marks:[{x,c,label}]}]})
   Trả về hàm đổi toạ độ điểm chạm → thời gian, để chạm vào đồ thị xem một chu kỳ. */
(function (root) {
"use strict";
const TH = {
  dark: { bg: "#0b1220", grid: "rgba(148,163,184,.13)", axis: "#7c8ca3", txt: "#cbd5e1", cur: "#fde047" },
  light: { bg: "#ffffff", grid: "rgba(15,23,42,.08)", axis: "#64748b", txt: "#1e293b", cur: "#d97706" },
};
function nice(span, n) {
  const raw = span / n, p = Math.pow(10, Math.floor(Math.log10(raw))), f = raw / p;
  return (f < 1.5 ? 1 : f < 3 ? 2 : f < 7 ? 5 : 10) * p;
}
function lab(v, st) {
  const d = st >= 1 ? 0 : Math.min(6, Math.ceil(-Math.log10(st) - 1e-9));
  return v.toFixed(d).replace("-", "−").replace(".", ",");
}
function ve(cv, o) {
  const th = TH[o.theme || "dark"], dpr = Math.min(3, root.devicePixelRatio || 1);
  const W = Math.max(50, cv.clientWidth), H = Math.max(50, cv.clientHeight);
  if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(H * dpr)) { cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); }
  const g = cv.getContext("2d"); g.setTransform(dpr, 0, 0, dpr, 0, 0);
  g.fillStyle = th.bg; g.fillRect(0, 0, W, H);
  const fs = W < 420 ? 10 : 11, L = W < 420 ? 40 : 52, Rm = 8, B = 18;
  g.font = fs + "px ui-monospace,Consolas,monospace";
  const x0 = o.x0, x1 = o.x1, X = (t) => L + (t - x0) / (x1 - x0) * (W - L - Rm);
  const tot = o.panes.reduce((s, p) => s + p.h, 0), gap = 14;
  let top = 6;
  const avail = H - B - top - gap * (o.panes.length - 1);
  const xs = nice(x1 - x0, W < 420 ? 4 : 7);
  o.panes.forEach((p, pi) => {
    const ph = avail * p.h / tot, y0 = top, y1 = top + ph;
    let mn = p.min, mx = p.max;
    if (mn == null || mx == null) {
      let a = Infinity, b = -Infinity;
      p.lines.forEach(l => { for (let i = 0; i < l.y.length; i++) { const v = l.y[i]; if (isFinite(v)) { if (v < a) a = v; if (v > b) b = v; } } });
      (p.bands || []).forEach(bd => { a = Math.min(a, bd.y); b = Math.max(b, bd.y); });
      if (!isFinite(a)) { a = 0; b = 1; }
      if (p.zero) { a = Math.min(a, 0); b = Math.max(b, 0); }
      const pad = (b - a) * 0.08 || Math.abs(b) * 0.1 || 1;
      if (mn == null) mn = a - pad; if (mx == null) mx = b + pad;
    }
    const Y = (v) => y1 - (v - mn) / (mx - mn) * (y1 - y0);
    // lưới
    g.strokeStyle = th.grid; g.lineWidth = 1; g.fillStyle = th.axis; g.textAlign = "right"; g.textBaseline = "middle";
    const ys = nice(mx - mn, ph < 90 ? 2 : 4);
    for (let v = Math.ceil(mn / ys) * ys; v <= mx + 1e-9; v += ys) {
      const yy = Math.round(Y(v)) + 0.5; g.beginPath(); g.moveTo(L, yy); g.lineTo(W - Rm, yy); g.stroke();
      g.fillText(lab(v, ys), L - 4, yy);
    }
    for (let t = Math.ceil(x0 / xs) * xs; t <= x1 + 1e-9; t += xs) { const xx = Math.round(X(t)) + 0.5; g.beginPath(); g.moveTo(xx, y0); g.lineTo(xx, y1); g.stroke(); }
    g.strokeStyle = th.axis; g.strokeRect(L + 0.5, y0 + 0.5, W - L - Rm - 1, ph - 1);
    (p.bands || []).forEach(bd => { g.strokeStyle = bd.c; g.setLineDash([3, 4]); g.beginPath(); g.moveTo(L, Y(bd.y)); g.lineTo(W - Rm, Y(bd.y)); g.stroke(); g.setLineDash([]); });
    // đường
    g.save(); g.beginPath(); g.rect(L, y0, W - L - Rm, ph); g.clip();
    p.lines.forEach(l => {
      if (!l.y.length) return;
      g.strokeStyle = l.c; g.lineWidth = l.w || 1.8; g.setLineDash(l.dash || []); g.lineJoin = "round"; g.beginPath();
      const n = l.y.length, stp = Math.max(1, Math.floor(n / ((W - L) * 2)));
      for (let i = 0; i < n; i += (l.step ? 1 : stp)) {
        const xx = X(l.x[i]), yy = Y(l.y[i]);
        if (i === 0) g.moveTo(xx, yy); else if (l.step) { g.lineTo(xx, Y(l.y[i - 1])); g.lineTo(xx, yy); } else g.lineTo(xx, yy);
      }
      if (!l.step && (n - 1) % stp) g.lineTo(X(l.x[n - 1]), Y(l.y[n - 1]));
      g.stroke(); g.setLineDash([]);
    });
    (p.marks || []).forEach(m => { g.strokeStyle = m.c; g.lineWidth = 1; g.setLineDash([2, 3]); g.beginPath(); g.moveTo(X(m.x) + 0.5, y0); g.lineTo(X(m.x) + 0.5, y1); g.stroke(); g.setLineDash([]); });
    if (o.cursor != null) { g.strokeStyle = th.cur; g.lineWidth = 1.2; g.beginPath(); g.moveTo(X(o.cursor) + 0.5, y0); g.lineTo(X(o.cursor) + 0.5, y1); g.stroke(); }
    g.restore();
    (p.marks || []).forEach(m => { if (m.label) { g.fillStyle = m.c; g.textAlign = "left"; g.textBaseline = "top"; g.fillText(m.label, Math.min(X(m.x) + 3, W - Rm - g.measureText(m.label).width - 2), y0 + 3); } });
    if (p.title) {
      g.font = "600 " + fs + "px ui-monospace,Consolas,monospace"; g.textAlign = "left"; g.textBaseline = "top";
      const tx = L + 6, ty = y0 + 4 + ((p.marks || []).some(m => m.label) ? fs + 4 : 0), tw = g.measureText(p.title).width;
      g.fillStyle = th.bg; g.globalAlpha = 0.8; g.fillRect(tx - 3, ty - 2, tw + 6, fs + 5); g.globalAlpha = 1;
      g.fillStyle = th.txt; g.fillText(p.title, tx, ty); g.font = fs + "px ui-monospace,Consolas,monospace";
    }
    if (pi === o.panes.length - 1) {
      g.fillStyle = th.axis; g.textAlign = "center"; g.textBaseline = "top";
      for (let t = Math.ceil(x0 / xs) * xs; t <= x1 + 1e-9; t += xs) {
        const s = lab(t, xs), w = g.measureText(s).width, xx = Math.min(X(t), W - 2 - w / 2);
        g.fillText(s, xx, y1 + 3);
      }
      g.textAlign = "right"; g.fillText(o.xU || "", L - 14, y1 + 3);
    }
    top = y1 + gap;
  });
  return (px) => x0 + (px - L) / (W - L - Rm) * (x1 - x0);
}
root.ve = ve;
})(this);
