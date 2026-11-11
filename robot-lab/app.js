/* Robot Lab · giao diện: vẽ 3D bằng canvas 2D (tự chiếu phối cảnh, không thư viện ngoài), thanh trượt, bảng, công thức.
 * Toán nằm ở engine.js; file này chỉ đọc kết quả và vẽ. */
(function () {
  'use strict';
  var E = window.ScaraEngine, R = E.ROBOT, D2R = E.D2R, R2D = E.R2D;
  var $ = function (s) { return document.querySelector(s); };
  var $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };

  /* ---------- trạng thái ---------- */
  var st = {
    mode: 'fk',
    q: { q1: 30, q2: 45, d3: 100, q4: 0 },
    tgt: { x: 0, y: 0, z: 0, phi: 0 },
    arm: 'right',
    ik: null, other: null,
    trailOn: false, trail: [],
    anim: null, demo: false
  };
  var PRESETS = [
    ['Ví dụ giáo trình M01-L02: θ1 30°, θ2 45°, d3 100', { q1: 30, q2: 45, d3: 100, q4: 0 }],
    ['Duỗi thẳng — kỳ dị biên ngoài', { q1: 0, q2: 0, d3: 0, q4: 0 }],
    ['Gập khuỷu, hạ hết trục', { q1: 90, q2: -90, d3: 200, q4: 45 }],
    ['Gần trục J1 (θ2 = 140°)', { q1: 0, q2: 140, d3: 60, q4: 0 }],
    ['Với ra phía sau, tay trái', { q1: -125, q2: -100, d3: 80, q4: 30 }]
  ];

  /* ---------- định dạng số kiểu Việt Nam ---------- */
  function fmt(v, d) {
    if (d === undefined) d = 2;
    var s = (Math.abs(v) < 0.5 * Math.pow(10, -d) ? 0 : v).toFixed(d).replace('.', ',');
    return s.charAt(0) === '-' ? '−' + s.slice(1) : s;
  }

  function fp(v, d) { var t = fmt(v, d); return v < 0 && t.charAt(0) === '−' ? '(' + t + ')' : t; }
  function big(v) { return Math.round(v).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' '); }

  /* ---------- camera và phép chiếu ---------- */
  var cv = $('#cv'), ctx = cv.getContext('2d'), vw = $('#vw');
  var W = 300, H = 200, DPR = 1, F = 300;
  var VIEWS = { v3d: { yaw: -52, pitch: 24 }, vtop: { yaw: -90, pitch: 89.5 }, vside: { yaw: -90, pitch: 1 } };
  var cam = { yaw: -52, pitch: 24, dist: 1500, t: [140, 40, 170] };
  var eye, ax, ay, az; // vị trí mắt và 3 trục camera (phải, lên, nhìn tới)

  function setupCam() {
    var y = cam.yaw * D2R, p = cam.pitch * D2R, cp = Math.cos(p), sp = Math.sin(p);
    var dir = [cp * Math.cos(y), cp * Math.sin(y), sp];
    eye = [cam.t[0] + cam.dist * dir[0], cam.t[1] + cam.dist * dir[1], cam.t[2] + cam.dist * dir[2]];
    az = [-dir[0], -dir[1], -dir[2]];
    ax = [az[1], -az[0], 0];                    // az × (0,0,1)
    var n = Math.hypot(ax[0], ax[1]) || 1; ax = [ax[0] / n, ax[1] / n, 0];
    ay = [ax[1] * az[2] - ax[2] * az[1], ax[2] * az[0] - ax[0] * az[2], ax[0] * az[1] - ax[1] * az[0]];
  }
  function P(p) {
    var d0 = p[0] - eye[0], d1 = p[1] - eye[1], d2 = p[2] - eye[2];
    var zc = d0 * az[0] + d1 * az[1] + d2 * az[2];
    if (zc < 20) zc = 20;
    return [W / 2 + F * (d0 * ax[0] + d1 * ax[1] + d2 * ax[2]) / zc,
            H * 0.54 - F * (d0 * ay[0] + d1 * ay[1] + d2 * ay[2]) / zc, zc];
  }

  function resize() {
    var r = vw.getBoundingClientRect();
    DPR = Math.min(window.devicePixelRatio || 1, 2.5);
    W = Math.max(50, r.width); H = Math.max(50, r.height);
    cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
    F = Math.min(W * 1.05, H * 1.5);
    dirty();
  }

  /* ---------- vẽ ---------- */
  var COL = { base: '#475569', link: '#94a3b8', link2: '#a5b4c8', j1: '#7dd3fc', j2: '#c084fc', j3: '#5eead4', j4: '#fb923c',
              x: '#f87171', y: '#4ade80', z: '#60a5fa', grid: 'rgba(148,163,184,.13)', shadow: 'rgba(2,6,23,.45)' };

  function robotPrims(q, alpha) {
    var f = E.fk(q), j2 = f.j2, x = f.x, y = f.y, H0 = R.H, zt = f.z;
    var a = alpha === undefined ? 1 : alpha, g = a < 1;
    var L = [];
    var seg = function (p0, p1, r, col, lit) { L.push({ k: 's', a: p0, b: p1, r: r, c: col, al: a, lit: lit !== false && !g }); };
    if (!g) seg([0, 0, 0], [0, 0, H0 - 40], 62, COL.base);
    seg([0, 0, H0 - 40], [0, 0, H0 + 18], 52, g ? COL.link : COL.j1);                 // vỏ J1
    seg([0, 0, H0], [j2[0], j2[1], H0], 36, COL.link);                                 // cánh tay 1
    seg([j2[0], j2[1], H0 - 18], [j2[0], j2[1], H0 + 60], 38, g ? COL.link : COL.j2);  // vỏ J2
    seg([j2[0], j2[1], H0 + 42], [x, y, H0 + 42], 28, COL.link2);                      // cánh tay 2
    seg([x, y, H0 + 20], [x, y, H0 + 70], 30, COL.link2);                              // đầu cánh tay 2
    seg([x, y, zt + 300], [x, y, zt], 9, g ? COL.link : COL.j3);                       // trục vít-me bi (J3)
    if (!g) {                                                                          // kẹp (J4)
      var c = Math.cos(f.phi * D2R), s = Math.sin(f.phi * D2R), o = 16;
      seg([x, y, zt + 4], [x, y, zt - 14], 24, COL.j4);
      seg([x - s * o, y + c * o, zt - 14], [x - s * o, y + c * o, zt - 52], 5, COL.j4, false);
      seg([x + s * o, y - c * o, zt - 14], [x + s * o, y - c * o, zt - 52], 5, COL.j4, false);
    }
    return { prims: L, f: f };
  }

  function drawSeg(o) {
    var A = P(o.a), B = P(o.b), w = Math.max(1.2, 2 * o.r * F / ((A[2] + B[2]) / 2));
    ctx.globalAlpha = o.al;
    ctx.lineCap = 'round';
    ctx.strokeStyle = o.c; ctx.lineWidth = w;
    ctx.beginPath(); ctx.moveTo(A[0], A[1]); ctx.lineTo(B[0], B[1]); ctx.stroke();
    if (o.lit && w > 5) {                       // vệt sáng giả khối trụ
      var dx = B[0] - A[0], dy = B[1] - A[1], n = Math.hypot(dx, dy) || 1, ox = -dy / n * w * 0.2, oy = dx / n * w * 0.2;
      if (oy > 0) { ox = -ox; oy = -oy; }
      ctx.strokeStyle = 'rgba(255,255,255,.28)'; ctx.lineWidth = w * 0.28;
      ctx.beginPath(); ctx.moveTo(A[0] + ox, A[1] + oy); ctx.lineTo(B[0] + ox, B[1] + oy); ctx.stroke();
      ctx.strokeStyle = 'rgba(2,6,23,.25)'; ctx.lineWidth = w * 0.22;
      ctx.beginPath(); ctx.moveTo(A[0] - ox * 1.6, A[1] - oy * 1.6); ctx.lineTo(B[0] - ox * 1.6, B[1] - oy * 1.6); ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  function line3(a, b, col, w, dash) {
    var A = P(a), B = P(b);
    ctx.strokeStyle = col; ctx.lineWidth = w; ctx.setLineDash(dash || []);
    ctx.beginPath(); ctx.moveTo(A[0], A[1]); ctx.lineTo(B[0], B[1]); ctx.stroke(); ctx.setLineDash([]);
  }
  function circle3(cx, cy, z, r, col, w, dash, a0, a1) {
    ctx.strokeStyle = col; ctx.lineWidth = w; ctx.setLineDash(dash || []);
    ctx.beginPath();
    a0 = a0 === undefined ? 0 : a0; a1 = a1 === undefined ? 360 : a1;
    for (var a = a0; a <= a1 + 0.01; a += 4) {
      var p = P([cx + r * Math.cos(a * D2R), cy + r * Math.sin(a * D2R), z]);
      if (a === a0) ctx.moveTo(p[0], p[1]); else ctx.lineTo(p[0], p[1]);
    }
    ctx.stroke(); ctx.setLineDash([]);
  }
  function label3(p, s, col) {
    var A = P(p); ctx.fillStyle = col; ctx.font = '600 12px ' + getComputedStyle(document.body).fontFamily;
    ctx.fillText(s, A[0] + 4, A[1] - 4);
  }
  function axes3(o, Rm, len, w, lab) {
    var cols = [COL.x, COL.y, COL.z], n = ['x', 'y', 'z'];
    for (var i = 0; i < 3; i++) {
      var e = [o[0] + Rm[i][0] * len, o[1] + Rm[i][1] * len, o[2] + Rm[i][2] * len];
      line3(o, e, cols[i], w);
      if (lab) label3(e, n[i], cols[i]);
    }
  }

  function draw() {
    needDraw = false;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.clearRect(0, 0, W, H);
    setupCam();
    // lưới sàn
    for (var g = -500; g <= 600; g += 100) {
      line3([g, -500, 0], [g, 600, 0], COL.grid, 1);
      line3([-500, g, 0], [600, g, 0], COL.grid, 1);
    }
    // vùng làm việc (trên sàn): biên ngoài r = L1 + L2 trong giới hạn J1, biên trong
    circle3(0, 0, 0, R.L1 + R.L2, 'rgba(94,234,212,.35)', 1.2, [6, 5]);
    circle3(0, 0, 0, Math.abs(R.L1 - R.L2), 'rgba(94,234,212,.25)', 1, [4, 4]);
    circle3(0, 0, 0, 120, 'rgba(125,211,252,.55)', 2, null, R.lim.q1[0], R.lim.q1[1]);
    label3([R.L1 + R.L2, 0, 0], 'r = 450', 'rgba(94,234,212,.7)');
    // hệ thế giới
    axes3([0, 0, 0], [[1, 0, 0], [0, 1, 0], [0, 0, 1]], 160, 2, true);
    // bóng robot trên sàn
    var rb = robotPrims(st.q);
    rb.prims.forEach(function (o) {
      if (o.al < 1) return;
      drawSeg({ a: [o.a[0], o.a[1], 0], b: [o.b[0], o.b[1], 0], r: o.r, c: COL.shadow, al: 0.6, lit: false });
    });
    // vết TCP
    if (st.trail.length > 1) {
      ctx.strokeStyle = 'rgba(251,146,60,.8)'; ctx.lineWidth = 2; ctx.beginPath();
      st.trail.forEach(function (p, i) { var A = P(p); if (i) ctx.lineTo(A[0], A[1]); else ctx.moveTo(A[0], A[1]); });
      ctx.stroke();
    }
    // đích IK
    if (st.mode === 'ik') {
      var t = st.tgt, okT = st.ik && st.ik.ok, tc = okT ? '#5eead4' : '#f87171';
      line3([t.x, t.y, 0], [t.x, t.y, t.z], tc, 1, [3, 4]);
      line3([t.x - 40, t.y, t.z], [t.x + 40, t.y, t.z], tc, 1.6);
      line3([t.x, t.y - 40, t.z], [t.x, t.y + 40, t.z], tc, 1.6);
      var a = t.phi * D2R; line3([t.x, t.y, t.z], [t.x + 60 * Math.cos(a), t.y + 60 * Math.sin(a), t.z], COL.x, 2);
    }
    // bóng mờ cấu hình còn lại + robot, sắp theo độ sâu (vẽ xa trước)
    var all = rb.prims.slice();
    if (st.other && st.other.ok) all = robotPrims(st.other.q, 0.22).prims.concat(all);
    all.forEach(function (o) { o.d = (P(o.a)[2] + P(o.b)[2]) / 2; });
    all.sort(function (u, v) { return v.d - u.d; }).forEach(drawSeg);
    // hệ dụng cụ tại TCP
    var f = rb.f, c = Math.cos(f.phi * D2R), s = Math.sin(f.phi * D2R);
    axes3([f.x, f.y, f.z], [[c, s, 0], [-s, c, 0], [0, 0, 1]], 70, 2.4, true);
    var tp = P([f.x, f.y, f.z]);
    ctx.fillStyle = '#fde047'; ctx.beginPath(); ctx.arc(tp[0], tp[1], 3.5, 0, 7); ctx.fill();
    label3([f.x, f.y, f.z - 60], 'TCP', '#fde047');
  }
  var needDraw = false;
  function dirty() { if (!needDraw) { needDraw = true; requestAnimationFrame(draw); } }

  /* ---------- xoay, phóng góc nhìn ---------- */
  var ptrs = new Map(), pinch = null, tap = { t: 0, x: 0, y: 0 }, moved = 0;
  cv.addEventListener('pointerdown', function (e) {
    cv.setPointerCapture(e.pointerId); ptrs.set(e.pointerId, [e.clientX, e.clientY]); moved = 0; cv.classList.add('drag');
    if (ptrs.size === 2) { var v = Array.from(ptrs.values()); pinch = { d: Math.hypot(v[0][0] - v[1][0], v[0][1] - v[1][1]), dist: cam.dist }; }
  });
  cv.addEventListener('pointermove', function (e) {
    if (!ptrs.has(e.pointerId)) return;
    var o = ptrs.get(e.pointerId), dx = e.clientX - o[0], dy = e.clientY - o[1];
    ptrs.set(e.pointerId, [e.clientX, e.clientY]); moved += Math.abs(dx) + Math.abs(dy);
    if (ptrs.size === 1) {
      cam.yaw -= dx * 0.45; cam.pitch = Math.max(-5, Math.min(89.5, cam.pitch + dy * 0.35));
      viewBtn(null);
    } else if (ptrs.size === 2 && pinch) {
      var v = Array.from(ptrs.values()), d = Math.hypot(v[0][0] - v[1][0], v[0][1] - v[1][1]);
      cam.dist = Math.max(600, Math.min(4000, pinch.dist * pinch.d / Math.max(d, 1)));
    }
    dirty();
  });
  function up(e) {
    ptrs.delete(e.pointerId); if (ptrs.size < 2) pinch = null; if (!ptrs.size) cv.classList.remove('drag');
    if (e.type === 'pointerup' && moved < 8) {                     // chạm đúp: đặt lại góc nhìn
      var now = Date.now();
      if (now - tap.t < 320 && Math.hypot(e.clientX - tap.x, e.clientY - tap.y) < 30) { setView('v3d'); tap.t = 0; }
      else tap = { t: now, x: e.clientX, y: e.clientY };
    }
  }
  cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
  cv.addEventListener('wheel', function (e) { e.preventDefault(); cam.dist = Math.max(600, Math.min(4000, cam.dist * Math.exp(e.deltaY * 0.001))); dirty(); }, { passive: false });
  function viewBtn(id) { ['v3d', 'vtop', 'vside'].forEach(function (k) { $('#' + k).classList.toggle('on', k === id); }); }
  function setView(id) { cam.yaw = VIEWS[id].yaw; cam.pitch = VIEWS[id].pitch; cam.dist = 1500; viewBtn(id); dirty(); }
  ['v3d', 'vtop', 'vside'].forEach(function (k) { $('#' + k).onclick = function () { setView(k); }; });
  $('#vtrail').onclick = function () { st.trailOn = !st.trailOn; this.classList.toggle('on', st.trailOn); if (!st.trailOn) st.trail = []; dirty(); };

  /* ---------- thanh trượt ---------- */
  function rowsOf(box) { return $$(box + ' .jrow'); }
  function bindRows(box, get, set) {
    rowsOf(box).forEach(function (row) {
      var k = row.dataset.k, rg = row.querySelector('input[type=range]'), nb = row.querySelector('input[type=number]');
      nb.min = rg.min; nb.max = rg.max;
      rg.addEventListener('input', function () { stopAnim(); set(k, +rg.value); });
      nb.addEventListener('change', function () {
        var v = Math.max(+rg.min, Math.min(+rg.max, +nb.value || 0)); stopAnim(); set(k, v);
      });
    });
  }
  function syncRows(box, obj, dec) {
    rowsOf(box).forEach(function (row) {
      var k = row.dataset.k, v = obj[k];
      row.querySelector('input[type=range]').value = v;
      var nb = row.querySelector('input[type=number]');
      if (document.activeElement !== nb) nb.value = (+v.toFixed(dec[k] === undefined ? 1 : dec[k]));
    });
  }
  bindRows('#fkBox', null, function (k, v) { st.q[k] = v; afterFK(); });
  bindRows('#ikBox', null, function (k, v) { st.tgt[k] = v; solve(); });

  function poseOf(q) { var f = E.fk(q); return { x: f.x, y: f.y, z: f.z, phi: E.wrap(f.phi) }; }
  function afterFK() {
    st.tgt = poseOf(st.q);
    st.arm = st.q.q2 < 0 ? 'left' : 'right';
    var o = E.ik(st.tgt, st.arm === 'right' ? 'left' : 'right', R, st.q.q4);
    st.ik = { ok: true, q: st.q }; st.other = st.mode === 'ik' ? o : null;
    refresh();
  }
  function solve() {
    var r = E.ik(st.tgt, st.arm, R, st.q.q4);
    st.ik = r;
    if (r.ok) st.q = r.q;
    st.other = E.ik(st.tgt, st.arm === 'right' ? 'left' : 'right', R, st.q.q4);
    refresh();
  }

  /* ---------- hiển thị ---------- */
  var NAME = { q1: 'J1', q2: 'J2', d3: 'J3', q4: 'J4' };
  function refresh() {
    var f = E.fk(st.q);
    if (st.trailOn) { st.trail.push([f.x, f.y, f.z]); if (st.trail.length > 600) st.trail.shift(); }
    syncRows('#fkBox', st.q, { q1: 1, q2: 1, d3: 0, q4: 0 });
    syncRows('#ikBox', st.tgt, { x: 0, y: 0, z: 0, phi: 0 });
    // giới hạn khớp
    var bad = E.limitErrors(st.q);
    rowsOf('#fkBox').forEach(function (row) { row.classList.toggle('bad', bad.indexOf(row.dataset.k) >= 0); });
    // tư thế + ma trận
    $('#ox').textContent = fmt(f.x); $('#oy').textContent = fmt(f.y); $('#oz').textContent = fmt(f.z); $('#op').textContent = fmt(E.wrap(f.phi), 1);
    var T = f.T, h = '';
    for (var i = 0; i < 4; i++) for (var j = 0; j < 4; j++) {
      var cls = i === 3 ? 'k' : (j === 3 ? 't' : 'r');
      h += '<span class="' + cls + '">' + (j === 3 && i < 3 ? fmt(T[i * 4 + j], 2) : fmt(T[i * 4 + j], i === 3 ? 0 : 3)) + '</span>';
    }
    $('#mat').innerHTML = h;
    var ch = E.chain(st.q), t = '<tr><th>Sau phép</th><th>x</th><th>y</th><th>z</th><th>trục x</th></tr>';
    ch.forEach(function (c) {
      t += '<tr><td>' + c.name + '</td><td>' + fmt(c.T[3]) + '</td><td>' + fmt(c.T[7]) + '</td><td>' + fmt(c.T[11]) +
        '</td><td>' + fmt(E.wrap(Math.atan2(c.T[4], c.T[0]) * R2D), 1) + '°</td></tr>';
    });
    $('#chainTbl').innerHTML = t;
    // hai nghiệm IK của tư thế hiện tại (FK) hoặc của đích (IK)
    var target = st.mode === 'ik' ? st.tgt : poseOf(st.q), rows = '<tr><th>Cấu hình</th><th>θ1</th><th>θ2</th><th>d3</th><th>θ4</th><th></th></tr>';
    ['right', 'left'].forEach(function (arm) {
      var s = E.ik(target, arm, R, st.q.q4), cur = arm === st.arm && (st.mode === 'fk' || (st.ik && st.ik.ok));
      rows += '<tr' + (cur ? ' class="cur"' : '') + '><td>' + (arm === 'right' ? 'Tay phải' : 'Tay trái') + '</td>';
      if (s.q) ['q1', 'q2', 'd3', 'q4'].forEach(function (k) {
        rows += '<td' + (s.bad && s.bad.indexOf(k) >= 0 ? ' class="bad"' : '') + '>' + fmt(s.q[k], 1) + '</td>';
      });
      else rows += '<td colspan="4" class="bad" style="text-align:left;white-space:normal">' + s.reason + '</td>';
      rows += '<td>' + (s.ok ? (cur ? '<span style="color:var(--hi)">đang dùng</span>' : '<button data-arm="' + arm + '">Dùng</button>') : '<span style="color:var(--bad)">✕</span>') + '</td></tr>';
    });
    $('#solTbl').innerHTML = rows;
    $$('#solTbl button').forEach(function (b) { b.onclick = function () { switchArm(b.dataset.arm, true); }; });
    // thông báo IK
    var m = $('#ikMsg');
    if (st.mode === 'ik') {
      if (st.ik && st.ik.ok) { m.className = 'msg ok'; m.innerHTML = 'Có nghiệm: θ1 ' + fmt(st.q.q1, 1) + '°, θ2 ' + fmt(st.q.q2, 1) + '°, d3 ' + fmt(st.q.d3, 1) + ' mm, θ4 ' + fmt(st.q.q4, 1) + '°'; }
      else { m.className = 'msg err'; m.innerHTML = 'Không đạt được: ' + st.ik.reason + '. Robot giữ tư thế cũ.'; }
    }
    steps(target);
    status(f);
    dirty();
  }

  function status(f) {
    var el = $('#state'), sn = Math.abs(Math.sin(st.q.q2 * D2R));
    el.className = 'sc-st';
    if (st.mode === 'ik' && st.ik && !st.ik.ok) { el.classList.add('err'); el.textContent = 'IK: ' + st.ik.reason; return; }
    var txt = 'TCP (' + fmt(f.x, 1) + '; ' + fmt(f.y, 1) + '; ' + fmt(f.z, 1) + ') φ ' + fmt(E.wrap(f.phi), 1) + '°';
    if (sn < 0.06) { el.classList.add('warn'); txt += ' · gần kỳ dị: sinθ2 ≈ 0'; }
    else txt += ' · det J = ' + fmt(E.jacDet(st.q) / 1000, 1) + '·10³';
    el.textContent = txt;
  }

  function steps(t) {
    var L1 = R.L1, L2 = R.L2, r2 = t.x * t.x + t.y * t.y, r = Math.sqrt(r2);
    var c2 = (r2 - L1 * L1 - L2 * L2) / (2 * L1 * L2), sgn = st.arm === 'left' ? -1 : 1;
    var h = '<p><b>Động học ngược</b> cho điểm ' + (st.mode === 'ik' ? 'đích' : 'TCP hiện tại') +
      ' (' + fmt(t.x, 1) + '; ' + fmt(t.y, 1) + '; ' + fmt(t.z, 1) + '), φ = ' + fmt(t.phi, 1) + '°, ' + (sgn > 0 ? 'tay phải' : 'tay trái') + ':</p>';
    var n = 0, S = function (a, b) { n++; h += '<div class="step"><i>' + n + '</i><div>' + a + (b ? '<br><span class="f">' + b + '</span>' : '') + '</div></div>'; };
    S('Khoảng cách từ trục J1 tới điểm đích', 'r = √(x² + y²) = √(' + fp(t.x, 1) + '² + ' + fp(t.y, 1) + '²) = ' + fmt(r, 2) + ' mm');
    S('Định lý cos trong tam giác J1–J2–TCP', 'cosθ2 = (r² − L1² − L2²) / (2·L1·L2) = (' + big(r2) + ' − 62 500 − 40 000) / 100 000 = ' + fmt(c2, 4));
    if (c2 > 1 || c2 < -1) {
      S('|cosθ2| > 1 nên <b style="color:var(--bad)">không có góc θ2</b>', c2 > 1 ? 'r > L1 + L2 = 450: ngoài tầm với' : 'r < |L1 − L2| = 50: quá gần trục J1');
      $('#steps').innerHTML = h; return;
    }
    var s2 = sgn * Math.sqrt(1 - c2 * c2), q2 = Math.atan2(s2, c2) * R2D;
    S('Chọn dấu sinθ2 theo cấu hình tay (phải +, trái −)', 'sinθ2 = ' + (sgn > 0 ? '+' : '−') + '√(1 − cos²θ2) = ' + fmt(s2, 4));
    S('Dùng atan2 để ra đúng góc phần tư', 'θ2 = atan2(sinθ2, cosθ2) = ' + fmt(q2, 2) + '°');
    var A = Math.atan2(t.y, t.x) * R2D, B = Math.atan2(L2 * s2, L1 + L2 * c2) * R2D, q1 = E.wrap(A - B);
    S('Góc tới điểm đích trừ góc lệch do cánh tay 2', 'θ1 = atan2(y, x) − atan2(L2·sinθ2, L1 + L2·cosθ2) = ' + fp(A, 2) + '° − ' + fp(B, 2) + '° = ' + fmt(q1, 2) + '°');
    S('Trục J3 tịnh tiến', 'd3 = H − z = 350 − ' + fp(t.z, 1) + ' = ' + fmt(R.H - t.z, 1) + ' mm');
    S('Hướng dụng cụ là tổng 3 góc quay', 'θ4 = φ − θ1 − θ2 = ' + fp(t.phi, 1) + ' − ' + fp(q1, 2) + ' − ' + fp(q2, 2) + ' = ' + fmt(E.wrap(t.phi - q1 - q2), 2) + '° (cộng/trừ 360° nếu cần)');
    var x = L1 * Math.cos(q1 * D2R) + L2 * Math.cos((q1 + q2) * D2R), y = L1 * Math.sin(q1 * D2R) + L2 * Math.sin((q1 + q2) * D2R);
    S('Kiểm lại bằng động học thuận', 'x = L1·cosθ1 + L2·cos(θ1+θ2) = ' + fmt(x, 3) + ' · y = L1·sinθ1 + L2·sin(θ1+θ2) = ' + fmt(y, 3) + ' ✓');
    var lim = E.ik(t, st.arm, R, st.q.q4);
    if (!lim.ok) S('<b style="color:var(--bad)">Có nghiệm toán học nhưng ' + lim.reason + '</b>', 'Robot thật không đặt được tư thế này với cấu hình tay đã chọn.');
    $('#steps').innerHTML = h;
  }

  /* ---------- chế độ, cấu hình tay ---------- */
  function setMode(m) {
    stopAnim(); st.mode = m;
    $('#mFK').classList.toggle('on', m === 'fk'); $('#mIK').classList.toggle('on', m === 'ik');
    $('#fkBox').hidden = m !== 'fk'; $('#ikBox').hidden = m !== 'ik';
    $('#dkTitle').innerHTML = m === 'fk' ? 'ĐIỀU KHIỂN KHỚP · <span class="en">Forward kinematics</span>' : 'ĐIỂM ĐÍCH CỦA TCP · <span class="en">Inverse kinematics</span>';
    st.tgt = poseOf(st.q); st.arm = st.q.q2 < 0 ? 'left' : 'right'; armBtns();
    if (m === 'ik') solve(); else afterFK();
  }
  function armBtns() { $('#armR').classList.toggle('on', st.arm === 'right'); $('#armL').classList.toggle('on', st.arm === 'left'); }
  function switchArm(a, animate) {
    st.arm = a; armBtns();
    var r = E.ik(st.mode === 'ik' ? st.tgt : poseOf(st.q), a, R, st.q.q4);
    if (animate && r.ok) { var keep = st.mode; animateTo(r.q, 900, function () { if (keep === 'ik') solve(); else afterFK(); }); }
    else if (st.mode === 'ik') solve(); else afterFK();
  }
  $('#armR').onclick = function () { switchArm('right', true); };
  $('#armL').onclick = function () { switchArm('left', true); };
  $('#mFK').onclick = function () { setMode('fk'); };
  $('#mIK').onclick = function () { setMode('ik'); };

  /* ---------- chuyển động mượt trong không gian khớp ---------- */
  function animateTo(q, ms, done) {
    stopAnim(true);
    var q0 = { q1: st.q.q1, q2: st.q.q2, d3: st.q.d3, q4: st.q.q4 }, t0 = performance.now();
    st.anim = { done: done };
    (function step(now) {
      if (!st.anim) return;
      var u = Math.min(1, (now - t0) / ms), s = u * u * (3 - 2 * u);
      ['q1', 'q2', 'd3', 'q4'].forEach(function (k) { st.q[k] = q0[k] + (q[k] - q0[k]) * s; });
      st.tgt = poseOf(st.q);
      if (st.mode === 'ik') { st.ik = { ok: true, q: st.q }; st.other = null; }
      refresh();
      if (u < 1) st.anim.id = requestAnimationFrame(step);
      else { var d = st.anim.done; st.anim = null; if (d) d(); }
    })(t0);
  }
  function stopAnim(keepDemo) {
    if (st.anim) { cancelAnimationFrame(st.anim.id); st.anim = null; }
    if (!keepDemo && st.demo) { st.demo = false; $('#demo').textContent = '▶ Chạy thử'; $('#demo').classList.remove('on'); }
  }

  /* chạy thử: gắp ở A, đặt ở B, lặp lại */
  var DEMO = [
    { x: 330, y: -140, z: 320, phi: 0 }, { x: 330, y: -140, z: 190, phi: 0 }, { x: 330, y: -140, z: 320, phi: 0 },
    { x: 120, y: 330, z: 320, phi: 90 }, { x: 120, y: 330, z: 190, phi: 90 }, { x: 120, y: 330, z: 320, phi: 90 }
  ];
  function runDemo(i) {
    if (!st.demo) return;
    var p = DEMO[i % DEMO.length], s = E.ik(p, st.arm, R, st.q.q4);
    if (!s.ok) s = E.ik(p, st.arm === 'right' ? 'left' : 'right', R, st.q.q4);
    var down = i % 3 === 1;
    animateTo(s.q, down || i % 3 === 2 ? 650 : 1300, function () { setTimeout(function () { runDemo(i + 1); }, down ? 350 : 120); });
  }
  $('#demo').onclick = function () {
    if (st.demo) { stopAnim(); return; }
    st.demo = true; this.textContent = 'Dừng'; this.classList.add('on');
    if (!st.trailOn) $('#vtrail').click();
    runDemo(0);
  };
  $('#home').onclick = function () { stopAnim(); animateTo({ q1: 0, q2: 0, d3: 0, q4: 0 }, 900, function () { if (st.mode === 'ik') solve(); else afterFK(); }); };

  /* tư thế mẫu */
  var sel = $('#preset');
  sel.innerHTML = '<option value="">— chọn —</option>' + PRESETS.map(function (p, i) { return '<option value="' + i + '">' + p[0] + '</option>'; }).join('');
  sel.onchange = function () {
    if (sel.value === '') return;
    stopAnim(); var q = PRESETS[+sel.value][1];
    st.arm = q.q2 < 0 ? 'left' : 'right'; armBtns();
    animateTo(q, 900, function () { if (st.mode === 'ik') solve(); else afterFK(); });
  };

  /* ---------- hàng tên phần: bấm để cuộn khung ---------- */
  var scr = $('#scr');
  function secTop(n) { return scr.querySelector('[data-sec="' + n + '"]').offsetTop - scr.offsetTop; }
  $$('#stnav button').forEach(function (b) {
    b.onclick = function () { scr.scrollTo({ top: secTop(b.dataset.go) + 1, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); };
  });
  scr.addEventListener('scroll', function () {
    var cur = 'dk';
    $$('#scr [data-sec]').forEach(function (s) { if (s.offsetTop - scr.offsetTop - scr.scrollTop <= 40) cur = s.dataset.sec; });
    $$('#stnav button').forEach(function (b) { b.classList.toggle('act', b.dataset.go === cur); });
  }, { passive: true });

  /* ---------- khởi động ---------- */
  if (window.ResizeObserver) new ResizeObserver(resize).observe(vw); else window.addEventListener('resize', resize);
  resize();
  afterFK();
  /* mở thẳng một chế độ bằng địa chỉ: index.html#fk hoặc index.html#ik (id lấy từ data-mode của hai nút) */
  function fromHash() { var m = (location.hash || '').slice(1); if ((m === 'fk' || m === 'ik') && m !== st.mode) setMode(m); }
  window.addEventListener('hashchange', fromHash);
  fromHash();
})();
