/* STM32 Lab: giao diện. Bộ máy (CPU + ngoại vi) nằm trong core.js, bài mẫu trong samples.js. */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var fmt = function (v, d) { return v.toLocaleString('vi-VN', { minimumFractionDigits: d, maximumFractionDigits: d }); };
  var mhz = function (v) { return fmt(v / 1e6, Number.isInteger(v / 1e6) ? 0 : 2) + ' MHz'; };
  var SPEEDS = [1, 0.1, 0.01];
  var syms = [], loaded = false, running = true, speedIx = 0, cur = null, faultInfo = null;
  var ledOn = 0, ledLast = 0, ledLevel = 0, frameCyc = 0, lastCom = -1;
  var termBuf = '', termLines = 0, warnN = 0, speedAvg = 1;
  var watch = null, watchStamp = 0, watchFails = 0;
  // Mỗi mẫu mở sẵn phần nên xem
  var GO = { button: 'tb', exti: 'tb', timer: 'cpu', uart: 'com', adcpwm: 'tb', rtos: 'com', noclock: 'cb', fault: 'cpu' };

  var m = createMCU({
    uart: function (name, b, baud) {
      var ch = (b === 9 || b === 10 || b === 13 || b >= 32) ? String.fromCharCode(b) : '<' + b.toString(16).padStart(2, '0') + '>';
      termBuf += (name === 'USART2' ? '' : '[' + name + '] ') + ch;
      lastCom = performance.now();
    },
    warn: function (msg) {
      warnN++;
      var li = document.createElement('li'); li.textContent = msg; $('cbList').appendChild(li);
      $('cbEmpty').hidden = true; mark('cb');
    },
    fault: function (f, pc) { faultInfo = { kind: f.kind, addr: f.addr >>> 0, pc: pc }; },
    pinChange: function (g, ch, nv) {
      if (g === m.gpios[0] && (ch & 32)) { var c = m.cycles; if (ledLevel) ledOn += c - ledLast; ledLast = c; ledLevel = (nv >> 5) & 1; }
    },
    reset: function () { ledOn = 0; ledLast = 0; ledLevel = 0; frameCyc = 0; faultInfo = null; }
  });

  /* ---------- bảng mạch ---------- */
  var NS = 'http://www.w3.org/2000/svg', dots = [];
  function hpin(g, x, y, lbl, pin, end) {
    var t = document.createElementNS(NS, 'text');
    t.setAttribute('x', end ? x - 12 : x + 12); t.setAttribute('y', y + 4); t.textContent = lbl + ' ' + pin; g.appendChild(t);
    var c = document.createElementNS(NS, 'circle');
    c.setAttribute('cx', x); c.setAttribute('cy', y); c.setAttribute('r', 5); c.setAttribute('fill', 'transparent'); g.appendChild(c);
    dots.push({ c: c, port: pin.charCodeAt(1) - 65, n: +pin.slice(2), last: -1 });
  }
  [['A0', 'PA0'], ['A1', 'PA1'], ['A2', 'PA4'], ['A3', 'PB0'], ['A4', 'PC1'], ['A5', 'PC0']]
    .forEach(function (p, i) { hpin($('hdrL'), 49, 119 + i * 28, p[0], p[1], false); });
  [['D13', 'PA5'], ['D12', 'PA6'], ['D11', 'PA7'], ['D10', 'PB6'], ['D9', 'PC7'], ['D8', 'PA9'], ['D7', 'PA8'], ['D6', 'PB10'], ['D5', 'PB4'], ['D4', 'PB5'], ['D3', 'PB3'], ['D2', 'PA10'], ['D1', 'PA2'], ['D0', 'PA3']]
    .forEach(function (p, i) { hpin($('hdrR'), 595, 119 + i * 14, p[0], p[1], true); });
  (function () {
    var s = '';
    for (var i = 0; i < 16; i++) { var o = -56 + i * 7.5; s += '<rect x="' + o + '" y="-72" width="3.6" height="10"/><rect x="' + o + '" y="62" width="3.6" height="10"/><rect x="-72" y="' + o + '" width="10" height="3.6"/><rect x="62" y="' + o + '" width="10" height="3.6"/>'; }
    $('legs').innerHTML = s;
  })();

  function holdButton(el, cap, down, up) {
    var held = false;
    var start = function (e) {
      if (e.preventDefault) e.preventDefault();
      if (held) return; held = true;
      if (e.pointerId !== undefined && el.setPointerCapture) { try { el.setPointerCapture(e.pointerId); } catch (x) { /* bỏ qua */ } }
      cap.setAttribute('r', 20); down();
    };
    var end = function () { if (!held) return; held = false; cap.setAttribute('r', 23); up(); };
    el.addEventListener('pointerdown', start);
    el.addEventListener('pointerup', end);
    el.addEventListener('pointercancel', end);
    el.addEventListener('lostpointercapture', end);
    el.addEventListener('keydown', function (e) { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) start(e); });
    el.addEventListener('keyup', function (e) { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); end(); } });
    el.addEventListener('blur', end);
    el.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  }
  holdButton($('b1'), $('b1cap'), function () { m.setInput(2, 13, 0); renderPins(true); }, function () { m.setInput(2, 13, 1); renderPins(true); });
  holdButton($('b2'), $('b2cap'), function () {}, function () { reset(); });

  /* ---------- chân GPIO ---------- */
  var pinEl = [];
  ['A', 'B', 'C'].forEach(function (P, pi) {
    var box = document.createElement('div'); box.className = 'port';
    box.innerHTML = '<b>GPIO' + P + '</b>';
    var grid = document.createElement('div'); grid.className = 'pins'; box.appendChild(grid);
    pinEl[pi] = [];
    for (var n = 0; n < 16; n++) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'pin';
      b.innerHTML = 'P' + P + n + '<small>-</small>';
      b.addEventListener('click', cyclePin.bind(null, pi, n));
      grid.appendChild(b); pinEl[pi][n] = { b: b, sub: b.lastChild, key: '' };
    }
    $('ports').appendChild(box);
  });
  var KIND = { OUT: 'ngõ ra', AF: 'ngõ ra của ngoại vi', AN: 'analog', PU: 'ngõ vào kéo lên', PD: 'ngõ vào kéo xuống', IN: 'ngõ vào thả nổi' };
  function cyclePin(port, n) {
    var g = m.gpios[port];
    if (g.mode(n).out) return;
    var e = g.ext[n];
    if (port === 2 && n === 13) e = e === 1 ? 0 : 1; // B1 có điện trở kéo lên trên board: chỉ 1 hoặc 0
    else e = e === -1 ? 1 : e === 1 ? 0 : -1;
    m.setInput(port, n, e); renderPins(true);
  }
  function renderPins(force) {
    for (var pi = 0; pi < 3; pi++) {
      var g = m.gpios[pi];
      for (var n = 0; n < 16; n++) {
        var md = g.mode(n), lv = (g.levels >> n) & 1, el = pinEl[pi][n];
        var k = md.out ? (md.af ? 'AF' : 'OUT') : md.cnf === 0 ? 'AN' : md.cnf === 2 ? (((g.odr >> n) & 1) ? 'PU' : 'PD') : 'IN';
        var key = k + lv + g.ext[n];
        if (key === el.key && !force) continue;
        el.key = key; el.sub.textContent = k;
        el.b.dataset.l = lv; el.b.dataset.dir = md.out ? 'out' : 'in';
        var ext = !md.out && g.ext[n] >= 0 && !(pi === 2 && n === 13 && g.ext[n] === 1);
        el.b.classList.toggle('ext', ext);
        el.b.title = 'P' + 'ABC'[pi] + n + ': ' + KIND[k] + ', mức ' + lv + (ext ? ', đang được cấp từ ngoài' : '') + (pi === 2 && n === 13 ? ' (nút B1)' : '') + (pi === 0 && n === 5 ? ' (LED LD2)' : '');
      }
    }
    dots.forEach(function (d) {
      var l = (m.gpios[d.port].levels >> d.n) & 1;
      if (l !== d.last) { d.last = l; d.c.setAttribute('fill', l ? '#fb923c' : 'transparent'); }
    });
  }
  function renderPwm() {
    var list = m.allPwm(), host = $('pwm'), sig = list.map(function (p) { return p.tim + p.ch; }).join();
    if (host.dataset.sig !== sig) {
      host.dataset.sig = sig;
      host.innerHTML = list.length ? '' : '<p class="dim" style="margin:0;font-size:13px">Chưa có kênh PWM nào đang chạy.</p>';
      list.forEach(function (p) {
        var r = document.createElement('div'); r.className = 'pwm-row';
        r.innerHTML = '<span>' + p.pin + ' ' + p.tim + ' CH' + p.ch + '</span><span class="meter"><i></i></span><span class="v"></span>';
        host.appendChild(r);
      });
    }
    list.forEach(function (p, i) {
      var r = host.children[i];
      r.querySelector('i').style.width = (p.duty * 100).toFixed(1) + '%';
      r.querySelector('.v').textContent = fmt(p.duty * 100, 1) + '% · ' + (p.freq >= 1000 ? fmt(p.freq / 1000, 2) + ' kHz' : fmt(p.freq, 1) + ' Hz');
    });
  }
  function applyAnalog() {
    [['a0', 0], ['a1', 1]].forEach(function (x) { var v = +$(x[0]).value; m.setAnalog(x[1], v / 3.3); $(x[0] + 'v').textContent = fmt(v, 2) + ' V'; });
  }
  $('a0').addEventListener('input', applyAnalog); $('a1').addEventListener('input', applyAnalog);

  /* ---------- CPU ---------- */
  var RN = ['R0', 'R1', 'R2', 'R3', 'R4', 'R5', 'R6', 'R7', 'R8', 'R9', 'R10', 'R11', 'R12', 'SP', 'LR', 'PC', 'xPSR', 'MSP', 'PSP'];
  $('regs').innerHTML = RN.map(function (n) { return '<div><span>' + n + '</span><b id="r_' + n + '" style="font-weight:500"></b></div>'; }).join('');
  function fname(pc) { return symbolAt(syms, pc); }
  function renderCpu() {
    $('cClk').textContent = mhz(m.sysclk);
    $('cApb').textContent = fmt(m.pclk1 / 1e6, 0) + ' / ' + fmt(m.pclk2 / 1e6, 0) + ' MHz';
    $('cTime').textContent = fmt(m.time, 3) + ' s';
    $('cSpeed').textContent = loaded && running && !m.halted ? fmt(Math.min(100, speedAvg * 100), 0) + '%' : '–';
    for (var i = 0; i < 15; i++) $('r_' + RN[i]).textContent = m.hex(m.regs[i]);
    $('r_PC').textContent = m.hex(m.pc); $('r_xPSR').textContent = m.hex(m.xpsr()); $('r_MSP').textContent = m.hex(m.msp()); $('r_PSP').textContent = m.hex(m.psp());
    var f = m.flags();
    $('where').textContent = 'Hàm: ' + (fname(m.pc) || 'không rõ') + ' · cờ N=' + f.N + ' Z=' + f.Z + ' C=' + f.C + ' V=' + f.V + (m.ipsr ? ' · đang trong ngắt số ' + m.ipsr : '');
    var u = m.usarts[1];
    $('baud').textContent = u.brr ? Math.round(u.baud()).toLocaleString('vi-VN') + ' baud' : 'chưa cấu hình';
  }

  /* ---------- trạng thái, thông báo trên bảng mạch ---------- */
  var msgSrc = '';
  function showMsg(text, kind, src) { var b = $('msg'); b.textContent = text; b.className = 'ov msg' + (kind === 'info' ? ' info' : ''); b.hidden = !text; msgSrc = text ? src : ''; }
  function runMsg() {
    var fn = fname(m.pc) || '', h = m.halted;
    if (h && h.kind === 'lockup') return 'CPU bị khóa (lockup) vì lại gặp lỗi trong lúc đang xử lý lỗi. Lệnh cuối ở ' + (fname(h.pc) || m.hex(h.pc)) + '. Sửa code rồi bấm Reset.';
    if (h && h.kind === 'bkpt') return 'Chương trình gặp lệnh BKPT tại ' + (fname(h.pc) || m.hex(h.pc)) + '. Bấm Reset để chạy lại.';
    if (/HardFault_Handler/.test(fn) || (faultInfo && m.ipsr === 3)) {
      var why = '';
      if (faultInfo) why = {
        bus: ' Lý do: truy cập địa chỉ ' + m.hex(faultInfo.addr) + ', nơi không có bộ nhớ hay ngoại vi.',
        undef: ' Lý do: gặp lệnh máy không hợp lệ (file build cho chip khác, hoặc chương trình nhảy vào vùng dữ liệu).',
        invstate: ' Lý do: nhảy tới địa chỉ không hợp lệ, thường do con trỏ hàm sai hoặc ngăn xếp bị ghi đè.',
        div0: ' Lý do: chia cho 0 khi đã bật bẫy chia 0.'
      }[faultInfo.kind] || '';
      return 'Chương trình rơi vào HardFault.' + why + (faultInfo ? ' Lệnh gây lỗi trong hàm ' + (fname(faultInfo.pc) || 'không rõ') + ' (' + m.hex(faultInfo.pc) + ').' : '');
    }
    if (fn === 'Error_Handler') return 'Chương trình kẹt trong Error_Handler(): một hàm khởi tạo HAL trả về lỗi. Xem mục Cảnh báo.';
    return '';
  }
  function renderStatus() {
    var s = 'run', t = 'Đang chạy', rm = loaded ? runMsg() : '';
    if (!loaded) { s = 'stop'; t = 'Chưa nạp firmware'; }
    else if (m.halted) { s = 'err'; t = m.halted.kind === 'bkpt' ? 'Dừng tại BKPT' : 'CPU bị khóa'; }
    else if (rm) { s = 'err'; t = 'Lỗi: ' + (fname(m.pc) || ''); }
    else if (!running) { s = 'stop'; t = 'Tạm dừng tại ' + (fname(m.pc) || m.hex(m.pc)); }
    else if (m.sleeping) { s = 'sleep'; t = 'CPU đang ngủ, chờ ngắt'; }
    else t = 'Đang chạy · ' + (fname(m.pc) || m.hex(m.pc));
    $('st').dataset.s = s; $('stText').textContent = t;
    if (msgSrc !== 'load') showMsg(rm, 'err', 'run');
    renderCpu(); renderPwm();
  }

  /* ---------- cổng COM ---------- */
  var scr = $('scr');
  function atEnd() { return scr.scrollHeight - scr.scrollTop - scr.clientHeight < 30; }
  function flushTerm() {
    if (!termBuf) return;
    var stick = atEnd() && secNow() === 'com', term = $('term');
    var text = termBuf.replace(/\r\n?/g, '\n'); termBuf = '';
    term.appendChild(document.createTextNode(text));
    termLines += (text.match(/\n/g) || []).length;
    if (termLines > 400) { // giữ khoảng 300 dòng gần nhất
      var all = term.textContent.split('\n'); term.textContent = all.slice(-300).join('\n'); termLines = 300;
    }
    if (stick) scr.scrollTop = scr.scrollHeight; else mark('com');
  }
  function termNote(t) {
    var term = $('term');
    if (term.textContent && !/\n$/.test(term.textContent)) term.appendChild(document.createTextNode('\n'));
    var s = document.createElement('span'); s.className = 'sys'; s.textContent = t + '\n'; term.appendChild(s);
  }
  $('txForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var text = $('txIn').value + $('eol').value.replace('\\r', '\r').replace('\\n', '\n');
    if (!text) return;
    m.uartSend(1, new TextEncoder().encode(text)); lastCom = performance.now(); $('txIn').value = '';
  });
  $('txClear').addEventListener('click', function () { $('term').textContent = ''; termLines = 0; });

  /* ---------- tên phần: cuộn trong khung, chấm cam khi có nội dung mới ---------- */
  var secs = [].slice.call(document.querySelectorAll('.pn-sec')), navBtns = [].slice.call(document.querySelectorAll('#stnav button'));
  function secNow() {
    var top = scr.getBoundingClientRect().top + 40, now = secs[0].dataset.sec;
    secs.forEach(function (s) { if (s.getBoundingClientRect().top <= top) now = s.dataset.sec; });
    if (atEnd()) now = secs[secs.length - 1].dataset.sec;
    return now;
  }
  function goSec(id, smooth) {
    var s = document.querySelector('.pn-sec[data-sec="' + id + '"]'); if (!s) return;
    var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    var top = s.getBoundingClientRect().top - scr.getBoundingClientRect().top + scr.scrollTop;
    scr.scrollTo({ top: top, behavior: smooth && !reduce ? 'smooth' : 'auto' });
    if (id === 'com' && !smooth) scr.scrollTop = scr.scrollHeight;
  }
  function mark(id) { if (secNow() !== id) { var b = document.querySelector('#stnav [data-go="' + id + '"]'); if (b) b.classList.add('dot'); } }
  function syncNav() {
    var now = secNow();
    navBtns.forEach(function (b) { var on = b.dataset.go === now; b.classList.toggle('act', on); if (on) b.classList.remove('dot'); });
  }
  navBtns.forEach(function (b) { b.addEventListener('click', function () { goSec(b.dataset.go, true); }); });
  scr.addEventListener('scroll', syncNav, { passive: true });

  /* ---------- LED ---------- */
  function renderLed() {
    var c = m.cycles, span = c - frameCyc, f;
    if (span <= 0) f = ledLevel;
    else { var on = ledOn; if (ledLevel) on += c - ledLast; f = Math.min(1, on / span); }
    ledOn = 0; ledLast = c; frameCyc = c;
    $('ld2').setAttribute('opacity', f.toFixed(2)); $('ld2glow').setAttribute('opacity', (f * 0.35).toFixed(2));
    $('ld1').setAttribute('fill', performance.now() - lastCom < 60 ? '#ff5a3d' : '#40130f');
  }

  /* ---------- vòng chạy: chỉ chạy khi tab đang mở ---------- */
  var lastFrame = performance.now(), tick = 0;
  function frame(now) {
    requestAnimationFrame(frame);
    var dt = Math.min(0.05, (now - lastFrame) / 1000); lastFrame = now;
    if (loaded && running && !m.halted) {
      var speed = SPEEDS[speedIx], want = dt * speed, t0 = performance.now(), sim0 = m.time;
      while (want > 1e-9) {
        var s = Math.min(want, 0.001); m.run(s); want -= s;
        if (m.halted || performance.now() - t0 > 11) break;
      }
      if (dt > 0) speedAvg += (Math.min((m.time - sim0) / dt / speed, 1) - speedAvg) * 0.05;
    }
    flushTerm(); renderLed(); renderPins(false);
    if (++tick % 6 === 0) renderStatus();
  }
  document.addEventListener('visibilitychange', function () { lastFrame = performance.now(); });

  /* ---------- nạp firmware ---------- */
  function clearWarn() { warnN = 0; $('cbList').innerHTML = ''; $('cbEmpty').hidden = false; }
  function setRunning(r) { running = r; $('bRun').textContent = r ? 'Tạm dừng' : '▶ Chạy tiếp'; $('bStep').disabled = r || !loaded; }
  function boot(segs, symList, name, desc, sample) {
    clearWarn(); faultInfo = null;
    m.loadImage(segs);
    syms = symList; loaded = true; cur = sample || null; speedAvg = 1;
    setRunning(true);
    $('fname').textContent = name; $('fdesc').textContent = desc || '';
    $('sample').value = sample || '';
    $('code').textContent = sample ? SAMPLES.filter(function (s) { return s.k === sample; })[0].src
      : 'Bạn đang chạy file của riêng mình (' + name + '). Mã nguồn nằm trong project STM32CubeIDE, thường là Core/Src/main.c.\nChọn một bài mẫu ở thanh trên để xem code của mẫu đó.';
    $('term').textContent = ''; termLines = 0; termNote('Đã nạp ' + name + (desc ? ' · ' + desc : ''));
    if (msgSrc === 'load') showMsg('', '', '');
    applyAnalog(); renderPins(true); renderStatus();
  }
  function b64(s) { var b = atob(s), u = new Uint8Array(b.length); for (var i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u; }
  function loadSample(k) {
    var s = SAMPLES.filter(function (x) { return x.k === k; })[0]; if (!s) return false;
    stopWatch();
    boot([{ addr: s.a, data: b64(s.b) }], s.s.map(function (x) { return { addr: x[0], size: x[1], name: x[2] }; }), s.f, s.d, s.k);
    goSec(GO[k] || 'tb', false); syncNav();
    return true;
  }
  function loadBuffer(buf, name, note) {
    var fw = parseFirmware(buf, name);
    boot(fw.segs, fw.syms, name, note || 'file của bạn', null);
    if (location.hash) history.replaceState(null, '', location.pathname + location.search);
  }
  function loadError(e) { showMsg('Không nạp được file: ' + (e && e.message ? e.message : e), 'err', 'load'); }
  SAMPLES.forEach(function (s) { var o = document.createElement('option'); o.value = s.k; o.textContent = s.t; $('sample').appendChild(o); });
  var own = document.createElement('option'); own.value = ''; own.textContent = 'File của bạn'; own.disabled = true; $('sample').appendChild(own);
  $('sample').addEventListener('change', function (e) { if (e.target.value) go(e.target.value); });
  function go(k) { if (location.hash.slice(1) !== k) location.hash = k; else loadSample(k); }
  window.addEventListener('hashchange', function () { var k = location.hash.slice(1); if (k && k !== cur) loadSample(k); });

  $('bOpen').addEventListener('click', function () { $('file').click(); });
  $('file').addEventListener('change', function (e) {
    var f = e.target.files[0]; e.target.value = ''; if (!f) return;
    stopWatch();
    f.arrayBuffer().then(function (b) { try { loadBuffer(b, f.name); } catch (x) { loadError(x); } });
  });

  // Tự nạp khi Build: theo dõi ngày sửa của file (File System Access API, Chrome/Edge)
  function stopWatch() { if (!watch) return; watch = null; $('bWatch').classList.remove('on'); $('bWatch').textContent = 'Tự nạp khi Build'; }
  $('bWatch').addEventListener('click', function () {
    if (watch) { stopWatch(); return; }
    if (!window.showOpenFilePicker) { showMsg('Trình duyệt này không theo dõi được file. Dùng Chrome hoặc Edge trên máy tính, hoặc bấm Nạp file .elf sau mỗi lần Build.', 'info', 'load'); return; }
    window.showOpenFilePicker({ types: [{ description: 'Firmware', accept: { 'application/octet-stream': ['.elf', '.hex', '.bin'] } }] })
      .then(function (hs) {
        var h = hs[0];
        return h.getFile().then(function (f) {
          return f.arrayBuffer().then(function (b) {
            loadBuffer(b, f.name, 'đang theo dõi, Build lại là tự nạp');
            watch = h; watchStamp = f.lastModified; watchFails = 0;
            $('bWatch').classList.add('on'); $('bWatch').textContent = 'Đang theo dõi';
          });
        });
      })
      .catch(function (e) {
        if (e && e.name === 'AbortError') return;
        if (e && /Security|NotAllowed/.test(e.name)) showMsg('Trang này không được phép theo dõi file. Hãy bấm Nạp file .elf sau mỗi lần Build.', 'info', 'load');
        else loadError(e);
      });
  });
  setInterval(function () {
    if (!watch) return;
    var h = watch;
    h.getFile().then(function (f) {
      if (h !== watch || f.lastModified === watchStamp) return;
      return f.arrayBuffer().then(function (b) {
        try {
          loadBuffer(b, f.name, 'Build lại lúc ' + new Date(f.lastModified).toLocaleTimeString('vi-VN'));
          watchStamp = f.lastModified; watchFails = 0;
        } catch (x) { // CubeIDE có thể đang ghi dở file: thử lại vài lần
          if (++watchFails >= 3) { loadError(x); watchStamp = f.lastModified; watchFails = 0; }
        }
      });
    }).catch(function () { /* file đang bị ghi hoặc tạm mất: chờ lần sau */ });
  }, 1000);

  // Kéo thả file
  var depth = 0;
  window.addEventListener('dragenter', function (e) { if (e.dataTransfer && [].indexOf.call(e.dataTransfer.types, 'Files') >= 0) { e.preventDefault(); depth++; $('drop').hidden = false; } });
  window.addEventListener('dragover', function (e) { e.preventDefault(); });
  window.addEventListener('dragleave', function () { if (--depth <= 0) { depth = 0; $('drop').hidden = true; } });
  window.addEventListener('drop', function (e) {
    e.preventDefault(); depth = 0; $('drop').hidden = true;
    var f = e.dataTransfer && e.dataTransfer.files[0]; if (!f) return;
    stopWatch();
    f.arrayBuffer().then(function (b) { try { loadBuffer(b, f.name); } catch (x) { loadError(x); } });
  });

  /* ---------- hàng nút ---------- */
  function reset() {
    if (!loaded) return;
    m.reset(); faultInfo = null; clearWarn(); termNote('Reset'); setRunning(true);
    if (msgSrc === 'run') showMsg('', '', '');
    applyAnalog(); renderPins(true); renderStatus();
  }
  $('bReset').addEventListener('click', reset);
  $('bRun').addEventListener('click', function () { if (!loaded) return; setRunning(!running); lastFrame = performance.now(); renderStatus(); });
  $('bStep').addEventListener('click', function () { m.step(); flushTerm(); renderPins(false); renderStatus(); });
  $('bSpeed').addEventListener('click', function () {
    speedIx = (speedIx + 1) % SPEEDS.length; speedAvg = 1;
    $('spd').textContent = fmt(SPEEDS[speedIx] * 100, 0) + '%';
  });

  /* ---------- khởi động ---------- */
  if (!loadSample(location.hash.slice(1))) loadSample(SAMPLES[0].k);
  requestAnimationFrame(frame);
  window.__stm32lab = { m: m, loadBuffer: loadBuffer, loadSample: loadSample };
})();
