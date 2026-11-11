/* Robot Lab · bộ máy động học SCARA 4 trục (RRPR).
 * Không phụ thuộc giao diện: chạy trong trình duyệt (window.ScaraEngine) và trong Node (module.exports).
 * Công thức trùng với docs/AMTS-GIAO-TRINH/giao-trinh/AMTS-ROB-004/ma-nguon/amts_tf.py (scara_T).
 * Đơn vị: mm và độ ở giao diện; bên trong tính bằng radian.
 *
 *   T_base_flange = Tz(H) · Rz(θ1) · Tx(L1) · Rz(θ2) · Tx(L2) · Tz(−d3) · Rz(θ4)
 *   x = L1·cosθ1 + L2·cos(θ1+θ2),  y = L1·sinθ1 + L2·sin(θ1+θ2),  z = H − d3,  φ = θ1 + θ2 + θ4
 */
(function (root) {
  'use strict';
  var D2R = Math.PI / 180, R2D = 180 / Math.PI;

  /* Robot SCARA mẫu AMTS (thông số học tập, không phải sản phẩm của hãng nào) */
  var ROBOT = {
    L1: 250, L2: 200, H: 350,
    lim: { q1: [-132, 132], q2: [-145, 145], d3: [0, 200], q4: [-360, 360] }
  };

  /* góc về (−180, 180] */
  function vn(v) { return v.toFixed(1).replace('.', ','); }

  function wrap(a) {
    a = ((a + 180) % 360 + 360) % 360 - 180;
    return a === -180 ? 180 : a;
  }

  /* ---- ma trận 4×4, lưu mảng 16 phần tử theo hàng ---- */
  function mul(A, B) {
    var C = new Array(16), i, j, k, s;
    for (i = 0; i < 4; i++) for (j = 0; j < 4; j++) {
      s = 0;
      for (k = 0; k < 4; k++) s += A[i * 4 + k] * B[k * 4 + j];
      C[i * 4 + j] = s;
    }
    return C;
  }
  function Tz(d) { return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, d, 0, 0, 0, 1]; }
  function Tx(d) { return [1, 0, 0, d, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]; }
  function Rz(deg) {
    var c = Math.cos(deg * D2R), s = Math.sin(deg * D2R);
    return [c, -s, 0, 0, s, c, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
  }

  /* chuỗi ma trận: trả về T của mặt bích và các khung trung gian (để vẽ) */
  function chain(q, R) {
    R = R || ROBOT;
    var steps = [
      ['Tz(H)', Tz(R.H)], ['Rz(θ1)', Rz(q.q1)], ['Tx(L1)', Tx(R.L1)], ['Rz(θ2)', Rz(q.q2)],
      ['Tx(L2)', Tx(R.L2)], ['Tz(−d3)', Tz(-q.d3)], ['Rz(θ4)', Rz(q.q4)]
    ];
    var T = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1], out = [];
    for (var i = 0; i < steps.length; i++) {
      T = mul(T, steps[i][1]);
      out.push({ name: steps[i][0], T: T.slice() });
    }
    return out;
  }

  /* động học thuận (forward kinematics) — công thức kín */
  function fk(q, R) {
    R = R || ROBOT;
    var a1 = q.q1 * D2R, a12 = (q.q1 + q.q2) * D2R;
    var j2 = [R.L1 * Math.cos(a1), R.L1 * Math.sin(a1), R.H];
    var x = j2[0] + R.L2 * Math.cos(a12), y = j2[1] + R.L2 * Math.sin(a12);
    var phi = q.q1 + q.q2 + q.q4;
    var c = Math.cos(phi * D2R), s = Math.sin(phi * D2R), z = R.H - q.d3;
    return {
      x: x, y: y, z: z, phi: phi,
      j2: j2, j3: [x, y, R.H],
      T: [c, -s, 0, x, s, c, 0, y, 0, 0, 1, z, 0, 0, 0, 1]
    };
  }

  /* kiểm giới hạn khớp: trả về danh sách khớp vượt giới hạn */
  function limitErrors(q, R) {
    R = R || ROBOT;
    var bad = [];
    ['q1', 'q2', 'd3', 'q4'].forEach(function (k) {
      var L = R.lim[k];
      if (q[k] < L[0] - 1e-9 || q[k] > L[1] + 1e-9) bad.push(k);
    });
    return bad;
  }

  /* chọn θ4 trong giới hạn, gần giá trị tham chiếu nhất (θ4 và θ4 ± 360° cho cùng hướng dụng cụ) */
  function pickQ4(raw, ref, R) {
    R = R || ROBOT;
    var best = null;
    for (var k = -2; k <= 2; k++) {
      var v = raw + 360 * k;
      if (v < R.lim.q4[0] - 1e-9 || v > R.lim.q4[1] + 1e-9) continue;
      if (best === null || Math.abs(v - ref) < Math.abs(best - ref)) best = v;
    }
    return best === null ? wrap(raw) : best;
  }

  /* động học ngược (inverse kinematics) cho một cấu hình tay.
   * arm = 'right' (tay phải, θ2 > 0) hoặc 'left' (tay trái, θ2 < 0) — quy ước của Robot Lab.
   * Trả về {ok, q, reason, c2, steps} — steps ghi từng bước để hiển thị. */
  function ik(p, arm, R, q4ref) {
    R = R || ROBOT;
    var x = p.x, y = p.y, z = p.z, phi = p.phi;
    var r2 = x * x + y * y, r = Math.sqrt(r2);
    var c2 = (r2 - R.L1 * R.L1 - R.L2 * R.L2) / (2 * R.L1 * R.L2);
    var res = { ok: false, arm: arm, r: r, c2: c2, q: null, reason: '' };
    if (c2 > 1 + 1e-12) { res.reason = 'ngoài tầm với: r = ' + vn(r) + ' > L1 + L2 = ' + (R.L1 + R.L2); return res; }
    if (c2 < -1 - 1e-12) { res.reason = 'quá gần trục J1: r = ' + vn(r) + ' < |L1 − L2| = ' + Math.abs(R.L1 - R.L2); return res; }
    c2 = Math.max(-1, Math.min(1, c2));
    var s2 = Math.sqrt(1 - c2 * c2) * (arm === 'left' ? -1 : 1);
    var q2 = Math.atan2(s2, c2) * R2D;
    var q1 = wrap((Math.atan2(y, x) - Math.atan2(R.L2 * s2, R.L1 + R.L2 * c2)) * R2D);
    var d3 = R.H - z;
    var q4 = pickQ4(wrap(phi - q1 - q2), q4ref === undefined ? 0 : q4ref, R);
    res.s2 = s2;
    res.q = { q1: q1, q2: q2, d3: d3, q4: q4 };
    var bad = limitErrors(res.q, R);
    if (bad.length) {
      var name = { q1: 'J1', q2: 'J2', d3: 'J3', q4: 'J4' };
      res.reason = 'vượt giới hạn khớp ' + bad.map(function (k) { return name[k]; }).join(', ');
      res.bad = bad;
      return res;
    }
    res.ok = true;
    return res;
  }

  /* định thức Jacobian phẳng (2×2 của x, y theo θ1, θ2) = L1·L2·sinθ2; bằng 0 là kỳ dị */
  function jacDet(q, R) { R = R || ROBOT; return R.L1 * R.L2 * Math.sin(q.q2 * D2R); }

  var api = { ROBOT: ROBOT, D2R: D2R, R2D: R2D, wrap: wrap, mul: mul, chain: chain, fk: fk, ik: ik,
              limitErrors: limitErrors, pickQ4: pickQ4, jacDet: jacDet };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.ScaraEngine = api;
})(this);
