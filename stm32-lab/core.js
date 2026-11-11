/* STM32 Lab: lõi giả lập STM32F103RB, phiên bản 1.0 (11/11/2026).
   CPU Cortex-M3 (Thumb/Thumb-2, NVIC, SysTick) + RCC, FLASH, GPIO, AFIO, EXTI, TIM1-4, USART1-3, ADC1.
   Không phụ thuộc giao diện: chạy được trong trình duyệt và trong Node (test.js). */
function createMCU(hooks) {
  'use strict';
  hooks = hooks || {};
  const FLASH_BASE = 0x08000000, FLASH_SIZE = 128 * 1024, RAM_BASE = 0x20000000, RAM_SIZE = 20 * 1024;
  const FLASH_END = FLASH_BASE + FLASH_SIZE, RAM_END = RAM_BASE + RAM_SIZE;
  const flashB = new Uint8Array(FLASH_SIZE), ramB = new Uint8Array(RAM_SIZE);
  const flash = new DataView(flashB.buffer), ram = new DataView(ramB.buffer);

  class Fault extends Error { constructor(kind, addr) { super(kind); this.kind = kind; this.addr = addr; } }
  const hex = (v, n = 8) => '0x' + (v >>> 0).toString(16).toUpperCase().padStart(n, '0');
  const warned = new Set();
  function warn(key, msg) { if (warned.has(key)) return; warned.add(key); if (hooks.warn) hooks.warn(msg, key); }

  // ==== Trạng thái CPU ====
  const r = new Int32Array(17); // r[16]: thanh ghi đệm cho các lệnh so sánh
  let N = 0, Z = 0, C = 0, V = 0, Q = 0, SC = 0, IT = 0;
  let PC = 0, NPC = 0, cyc = 0, limit = 0;
  let IPSR = 0, ctrl = 0, primask = 0, faultmask = 0, basepri = 0, spOther = 0;
  let sleeping = false, halted = null, sevFlag = false, exclusive = false;
  const NEXC = 16 + 68;
  const pend = new Uint8Array(NEXC), active = new Uint8Array(NEXC), prio = new Uint8Array(NEXC), enabled = new Uint8Array(NEXC), lines = new Uint8Array(NEXC);
  let pendAny = 0, prigroup = 0, VTOR = 0, scbCCR = 0x200, scbSCR = 0, cfsr = 0, hfsr = 0, bfar = 0, mmfar = 0, shcsr = 0;

  const fns = new Array(FLASH_SIZE >> 1);
  const lens = new Uint8Array(FLASH_SIZE >> 1), costs = new Uint8Array(FLASH_SIZE >> 1);

  function setPend(e) { if (!pend[e]) { pend[e] = 1; pendAny++; } limit = 0; if (scbSCR & 16) sevFlag = true; }
  function clrPend(e) { if (pend[e]) { pend[e] = 0; pendAny--; } }
  function setLine(irq, level) {
    const e = irq + 16; const l = level ? 1 : 0;
    if (lines[e] !== l) { lines[e] = l; if (l) setPend(e); }
  }

  // ==== Xung nhịp ====
  const rcc = { cr: 0x83, cfgr: 0, cir: 0, apb2en: 0, apb1en: 0, ahben: 0x14, bdcr: 0, csr: 0x0C000000, apb2rst: 0, apb1rst: 0 };
  let hclk = 8e6, pclk1 = 8e6, pclk2 = 8e6, sysclk = 8e6, flashACR = 0x30, baseTime = 0, baseCyc = 0;
  const AHBDIV = [1, 1, 1, 1, 1, 1, 1, 1, 2, 4, 8, 16, 64, 128, 256, 512], APBDIV = [1, 1, 1, 1, 2, 4, 8, 16], ADCDIV = [2, 4, 6, 8];
  function pllClock() {
    const c = rcc.cfgr; let m = ((c >>> 18) & 15) + 2; if (m > 16) m = 16;
    const src = (c & (1 << 16)) ? ((c & (1 << 17)) ? 4e6 : 8e6) : 4e6;
    return src * m;
  }
  function recomputeClocks() {
    syncAll();
    const sw = rcc.cfgr & 3;
    sysclk = sw === 1 ? 8e6 : sw === 2 ? pllClock() : 8e6;
    const nh = sysclk / AHBDIV[(rcc.cfgr >>> 4) & 15];
    pclk1 = nh / APBDIV[(rcc.cfgr >>> 8) & 7]; pclk2 = nh / APBDIV[(rcc.cfgr >>> 11) & 7];
    baseTime = simTime(); baseCyc = cyc; hclk = nh;
    if (sysclk > 72e6) warn('oc', `SYSCLK = ${sysclk / 1e6} MHz vượt mức tối đa 72 MHz của STM32F103.`);
    if (pclk1 > 36e6) warn('pclk1', `PCLK1 = ${pclk1 / 1e6} MHz vượt mức tối đa 36 MHz.`);
    const lat = flashACR & 7, need = sysclk > 48e6 ? 2 : sysclk > 24e6 ? 1 : 0;
    if (lat < need) warn('lat', `FLASH latency = ${lat} là quá thấp cho ${sysclk / 1e6} MHz (cần tối thiểu ${need}). Board thật có thể chạy sai.`);
    for (const t of tims) t.updateRatio(); limit = 0;
  }
  function simTime() { return baseTime + (cyc - baseCyc) / hclk; }

  // ==== GPIO ====
  class GPIO {
    constructor(name, idx, clkBit) { this.name = name; this.idx = idx; this.clkBit = clkBit; this.ext = new Int8Array(16).fill(-1); this.reset(); this.levels = 0; }
    reset() { this.crl = 0x44444444; this.crh = 0x44444444; this.odr = 0; this.lckr = 0; this.afOut = 0; this.afMask = 0; }
    cfg(p) { return (((p < 8 ? this.crl : this.crh) >>> ((p & 7) * 4)) & 15) >>> 0; }
    mode(p) { const c = this.cfg(p); return { out: (c & 3) !== 0, af: (c & 3) !== 0 && (c & 8) !== 0, cnf: c >>> 2 }; }
    level(p) {
      const m = this.mode(p);
      if (m.out) return m.af ? (this.afOut >> p) & 1 : (this.odr >> p) & 1;
      if (m.cnf === 0) return 0; // analog: IDR đọc về 0
      if (this.ext[p] >= 0) return this.ext[p];
      if (m.cnf === 2) return (this.odr >> p) & 1; // kéo lên/xuống
      return 0;
    }
    idr() { let v = 0; for (let p = 0; p < 16; p++) if (this.level(p)) v |= 1 << p; return v; }
    update() {
      const nv = this.idr(), old = this.levels, ch = nv ^ old;
      this.levels = nv;
      if (ch) {
        for (let p = 0; p < 16; p++) if (ch & (1 << p)) extiEdge(this.idx, p, (nv >> p) & 1);
        if (hooks.pinChange) hooks.pinChange(this, ch, nv);
      }
    }
    on() { return rcc.apb2en & (1 << this.clkBit); }
    read(o) {
      switch (o) { case 0: return this.crl; case 4: return this.crh; case 8: return this.idr(); case 12: return this.odr; case 0x18: return this.lckr; }
      return 0;
    }
    write(o, v) {
      switch (o) {
        case 0: this.crl = v >>> 0; break;
        case 4: this.crh = v >>> 0; break;
        case 12: this.odr = v & 0xFFFF; break;
        case 0x10: this.odr = ((this.odr | (v & 0xFFFF)) & ~(v >>> 16)) & 0xFFFF; break;
        case 0x14: this.odr &= ~(v & 0xFFFF); break;
        case 0x18: this.lckr = v; break;
      }
      this.update();
    }
  }
  const gpios = [new GPIO('A', 0, 2), new GPIO('B', 1, 3), new GPIO('C', 2, 4), new GPIO('D', 3, 5), new GPIO('E', 4, 6)];
  gpios[2].ext[13] = 1; // B1 trên board có điện trở kéo lên: nhả = 1

  // ==== AFIO / EXTI ====
  const afio = { evcr: 0, mapr: 0, exticr: [0, 0, 0, 0] };
  const exti = { imr: 0, emr: 0, rtsr: 0, ftsr: 0, pr: 0 };
  function extiPort(p) { return (afio.exticr[p >> 2] >>> ((p & 3) * 4)) & 15; }
  function extiEdge(port, p, val) {
    if (extiPort(p) !== port) return;
    if ((val ? exti.rtsr : exti.ftsr) & (1 << p)) { exti.pr |= 1 << p; extiUpdate(); }
  }
  function extiUpdate() {
    const a = exti.pr & exti.imr;
    setLine(6, a & 1); setLine(7, a & 2); setLine(8, a & 4); setLine(9, a & 8); setLine(10, a & 16);
    setLine(23, a & 0x3E0); setLine(40, a & 0xFC00);
  }

  // ==== SysTick ====
  let stCtrl = 0, stLoad = 0, stVal = 0, stLast = 0, stAcc = 0, stFlag = 0;
  function stSync() {
    const d = cyc - stLast; stLast = cyc;
    if (!(stCtrl & 1)) return;
    const div = stCtrl & 4 ? 1 : 8; stAcc += d;
    let t = Math.floor(stAcc / div); stAcc -= t * div;
    while (t > 0) {
      if (stVal === 0) { stVal = stLoad; t--; if (stLoad === 0) break; continue; }
      if (t >= stVal) { t -= stVal; stVal = 0; stFlag = 1; if (stCtrl & 2) setPend(15); }
      else { stVal -= t; t = 0; }
    }
  }
  function stNext() {
    if (!(stCtrl & 1) || !(stCtrl & 2) || stLoad === 0) return Infinity;
    const div = stCtrl & 4 ? 1 : 8;
    return cyc + Math.max(1, (stVal === 0 ? stLoad + 1 : stVal) * div - stAcc);
  }

  // ==== Timer ====
  class TIM {
    constructor(name, bus, bit, irqs) { this.name = name; this.bus = bus; this.bit = bit; this.irqs = irqs; this.ratio = 1; this.reset(); }
    reset() {
      this.cr1 = 0; this.cr2 = 0; this.smcr = 0; this.dier = 0; this.sr = 0; this.ccmr1 = 0; this.ccmr2 = 0; this.ccer = 0; this.cnt = 0;
      this.psc = 0; this.pscA = 0; this.arr = 0xFFFF; this.arrA = 0xFFFF; this.rcr = 0; this.ccr = [0, 0, 0, 0]; this.bdtr = 0; this.acc = 0; this.last = cyc;
    }
    on() { return (this.bus === 2 ? rcc.apb2en : rcc.apb1en) & (1 << this.bit); }
    updateRatio() {
      const presc = (rcc.cfgr >>> (this.bus === 2 ? 11 : 8)) & 7;
      const pclk = this.bus === 2 ? pclk2 : pclk1;
      this.ratio = (presc < 4 ? pclk : pclk * 2) / hclk;
    }
    sync() {
      const d = cyc - this.last; this.last = cyc;
      if (!(this.cr1 & 1)) return;
      if (this.cr1 & 0x60) warn(this.name + 'cms', `${this.name}: chế độ đếm center-aligned đang được mô phỏng như đếm lên.`);
      this.acc += d * this.ratio;
      const div = this.pscA + 1, t = Math.floor(this.acc / div);
      if (t > 0) { this.acc -= t * div; this.advance(t); }
    }
    period() { return this.arrA + 1; }
    uev() {
      if (this.cr1 & 2) return;
      this.pscA = this.psc; if (this.cr1 & 0x80) this.arrA = this.arr;
      this.sr |= 1;
      if (this.cr1 & 8) this.cr1 &= ~1;
    }
    ccMatch(from, to) { // from < giá trị <= to
      for (let i = 0; i < 4; i++) { const c = this.ccr[i]; if (c > from && c <= to) this.sr |= 2 << i; }
    }
    advance(t) {
      const down = this.cr1 & 0x10;
      while (t > 0 && (this.cr1 & 1)) {
        if (!down) {
          const top = this.arrA, rem = this.cnt <= top ? top - this.cnt : 65535 - this.cnt;
          if (t <= rem) { this.ccMatch(this.cnt, this.cnt + t); this.cnt += t; t = 0; }
          else {
            this.ccMatch(this.cnt, top); t -= rem + 1; this.cnt = 0; this.uev();
            const p = this.period();
            if (t >= p && !(this.cr1 & 8)) { this.ccMatch(-1, this.arrA); t %= p; this.sr |= (this.cr1 & 2) ? 0 : 1; }
            if (this.ccr.includes(0)) this.ccMatch(-1, 0);
          }
        } else {
          if (t <= this.cnt) { this.cnt -= t; t = 0; }
          else {
            t -= this.cnt + 1; this.uev(); this.cnt = this.arrA;
            const p = this.period(); if (t >= p && !(this.cr1 & 8)) { t %= p; this.sr |= (this.cr1 & 2) ? 0 : 1; }
          }
        }
      }
      this.irq();
    }
    irq() {
      const a = this.sr & this.dier;
      if (this.irqs.length === 1) setLine(this.irqs[0], a & 0x5F);
      else { setLine(this.irqs[0], a & 1); setLine(this.irqs[1], a & 0x1E); }
    }
    next() {
      if (!(this.cr1 & 1) || !(this.dier & 0x5F) || this.ratio <= 0) return Infinity;
      const top = this.arrA; let tk;
      if (this.cr1 & 0x10) tk = this.cnt + 1;
      else {
        tk = (this.cnt <= top ? top - this.cnt : 65535 - this.cnt) + 1;
        if (this.dier & 0x1E) for (let i = 0; i < 4; i++) if ((this.dier & (2 << i)) && this.ccr[i] > this.cnt && this.ccr[i] <= top) tk = Math.min(tk, this.ccr[i] - this.cnt);
      }
      return cyc + Math.max(1, Math.ceil(((tk * (this.pscA + 1)) - this.acc) / this.ratio));
    }
    read(o) {
      switch (o) {
        case 0: return this.cr1; case 4: return this.cr2; case 8: return this.smcr; case 0xC: return this.dier; case 0x10: return this.sr;
        case 0x18: return this.ccmr1; case 0x1C: return this.ccmr2; case 0x20: return this.ccer; case 0x24: return this.cnt;
        case 0x28: return this.psc; case 0x2C: return this.arr; case 0x30: return this.rcr; case 0x34: case 0x38: case 0x3C: case 0x40: return this.ccr[(o - 0x34) >> 2];
        case 0x44: return this.bdtr;
      }
      return 0;
    }
    write(o, v) {
      v &= 0xFFFF;
      switch (o) {
        case 0: if ((v & 1) && !(this.cr1 & 1)) { this.last = cyc; this.acc = 0; } this.cr1 = (v & 0x3FF); break;
        case 4: this.cr2 = v; break;
        case 8: this.smcr = v; if (v & 7) warn(this.name + 'sm', `${this.name}: chế độ slave (SMCR) chưa được mô phỏng.`); break;
        case 0xC: this.dier = v; if (v & 0x1F00) warn(this.name + 'dma', `${this.name}: DMA chưa được mô phỏng.`); break;
        case 0x10: this.sr &= v; break;
        case 0x14:
          if (v & 1) { this.pscA = this.psc; this.arrA = this.arr; this.cnt = (this.cr1 & 0x10) ? this.arrA : 0; this.acc = 0; if (!(this.cr1 & 4)) this.sr |= 1; }
          this.sr |= v & 0x1E; break;
        case 0x18: this.ccmr1 = v; this.ckIc(v); break;
        case 0x1C: this.ccmr2 = v; this.ckIc(v); break;
        case 0x20: this.ccer = v; break;
        case 0x24: this.cnt = v; break;
        case 0x28: this.psc = v; break;
        case 0x2C: this.arr = v; if (!(this.cr1 & 0x80)) this.arrA = v; break;
        case 0x30: this.rcr = v & 0xFF; break;
        case 0x34: case 0x38: case 0x3C: case 0x40: this.ccr[(o - 0x34) >> 2] = v; break;
        case 0x44: this.bdtr = v; break;
      }
      this.irq(); limit = 0;
    }
    ckIc(v) { if ((v & 3) || ((v >> 8) & 3)) warn(this.name + 'ic', `${this.name}: input capture/encoder chưa được mô phỏng.`); }
    pwm() { // Trả về các kênh PWM đang hoạt động
      const out = [];
      for (let i = 0; i < 4; i++) {
        if (!(this.ccer & (1 << (i * 4)))) continue;
        const mr = i < 2 ? this.ccmr1 : this.ccmr2, mode = (mr >>> ((i & 1) * 8 + 4)) & 7;
        if (mode !== 6 && mode !== 7) continue;
        let duty = this.period() ? Math.min(1, this.ccr[i] / this.period()) : 0;
        if (mode === 7) duty = 1 - duty;
        if (this.ccer & (2 << (i * 4))) duty = 1 - duty;
        const freq = (this.cr1 & 1) ? (this.ratio * hclk) / ((this.pscA + 1) * this.period()) : 0;
        out.push({ tim: this.name, ch: i + 1, duty: (this.cr1 & 1) ? duty : 0, freq, pin: TIMPINS[this.name][i] });
      }
      return out;
    }
  }
  const TIMPINS = { TIM1: ['PA8', 'PA9', 'PA10', 'PA11'], TIM2: ['PA0', 'PA1', 'PA2', 'PA3'], TIM3: ['PA6', 'PA7', 'PB0', 'PB1'], TIM4: ['PB6', 'PB7', 'PB8', 'PB9'] };
  const tims = [new TIM('TIM1', 2, 11, [25, 27]), new TIM('TIM2', 1, 0, [28]), new TIM('TIM3', 1, 1, [29]), new TIM('TIM4', 1, 2, [30])];

  // ==== USART ====
  class USART {
    constructor(name, bus, bit, irq) { this.name = name; this.bus = bus; this.bit = bit; this.irqn = irq; this.rxq = []; this.reset(); }
    reset() { this.sr = 0xC0; this.rdr = 0; this.brr = 0; this.cr1 = 0; this.cr2 = 0; this.cr3 = 0; this.gtpr = 0; this.hold = -1; this.shift = -1; this.txEnd = Infinity; this.rxAt = Infinity; }
    on() { return (this.bus === 2 ? rcc.apb2en : rcc.apb1en) & (1 << this.bit); }
    clk() { return this.bus === 2 ? pclk2 : pclk1; }
    baud() { return this.brr ? this.clk() / this.brr : 0; }
    byteCyc() { const b = this.baud() || 115200; const bits = (this.cr1 & 0x1000) ? 11 : 10; return Math.max(1, Math.round(bits * hclk / b)); }
    startTx(b) { this.shift = b; this.txEnd = cyc + this.byteCyc(); }
    sync() {
      while (this.txEnd <= cyc) {
        if (hooks.uart) hooks.uart(this.name, this.shift, this.baud());
        this.shift = -1; this.txEnd = Infinity;
        if (this.hold >= 0) { const b = this.hold; this.hold = -1; this.sr |= 0x80; this.startTx(b); } else this.sr |= 0x40;
      }
      while (this.rxAt <= cyc && this.rxq.length) {
        const b = this.rxq.shift();
        if ((this.cr1 & 0x2000) && (this.cr1 & 4)) {
          if (this.sr & 0x20) this.sr |= 8; else { this.rdr = b; this.sr |= 0x20; }
        } else warn(this.name + 'rx', `${this.name}: firmware chưa bật bộ thu (UE/RE), ký tự bạn gõ đã bị bỏ qua.`);
        this.rxAt = this.rxq.length ? this.rxAt + this.byteCyc() : Infinity;
      }
      if (!this.rxq.length) this.rxAt = Infinity;
      this.irq();
    }
    irq() {
      const c = this.cr1, s = this.sr;
      setLine(this.irqn, ((c & 0x80) && (s & 0x80)) || ((c & 0x40) && (s & 0x40)) || ((c & 0x20) && (s & 0x28)) || ((c & 0x10) && (s & 0x10)));
    }
    next() { return Math.min(this.txEnd, this.rxAt); }
    inject(b) { if (this.rxq.length === 0) this.rxAt = cyc + this.byteCyc(); this.rxq.push(b); limit = 0; }
    read(o) {
      switch (o) {
        case 0: return this.sr;
        case 4: { const v = this.rdr; this.sr &= ~0x28; this.irq(); return v; }
        case 8: return this.brr; case 0xC: return this.cr1; case 0x10: return this.cr2; case 0x14: return this.cr3; case 0x18: return this.gtpr;
      }
      return 0;
    }
    write(o, v) {
      switch (o) {
        case 0: this.sr &= (v | ~0x360); break;
        case 4:
          if (!(this.cr1 & 0x2000)) { warn(this.name + 'ue', `${this.name}: ghi DR khi UE chưa bật, dữ liệu không được gửi.`); break; }
          if (!(this.cr1 & 8)) { warn(this.name + 'te', `${this.name}: ghi DR khi TE chưa bật, dữ liệu không được gửi.`); break; }
          this.sr &= ~0x40;
          if (this.shift < 0) this.startTx(v & 0xFF); else { this.hold = v & 0xFF; this.sr &= ~0x80; }
          break;
        case 8: this.brr = v & 0xFFFF; break;
        case 0xC: this.cr1 = v & 0x3FFF; break;
        case 0x10: this.cr2 = v; break;
        case 0x14: this.cr3 = v; if (v & 0xC0) warn(this.name + 'dma', `${this.name}: DMA chưa được mô phỏng.`); break;
        case 0x18: this.gtpr = v; break;
      }
      this.irq(); limit = 0;
    }
  }
  const usarts = [new USART('USART1', 2, 14, 37), new USART('USART2', 1, 17, 38), new USART('USART3', 1, 18, 39)];

  // ==== ADC1 ====
  const SMPCYC = [1.5, 7.5, 13.5, 28.5, 41.5, 55.5, 71.5, 239.5];
  const adc = {
    sr: 0, cr1: 0, cr2: 0, smpr1: 0, smpr2: 0, sqr: [0, 0, 0], dr: 0, end: Infinity, seq: 0, inputs: new Float64Array(18), cal: 0,
    reset() { this.sr = 0; this.cr1 = 0; this.cr2 = 0; this.smpr1 = 0; this.smpr2 = 0; this.sqr = [0, 0, 0]; this.dr = 0; this.end = Infinity; this.seq = 0; this.cal = 0; },
    on() { return rcc.apb2en & (1 << 9); },
    channel() { const i = this.seq; const q = i < 6 ? this.sqr[2] : i < 12 ? this.sqr[1] : this.sqr[0]; return (q >>> ((i % 6) * 5)) & 31; },
    start() {
      const ch = this.channel(), s = ch < 10 ? (this.smpr2 >>> (ch * 3)) & 7 : (this.smpr1 >>> ((ch - 10) * 3)) & 7;
      const adcclk = pclk2 / ADCDIV[(rcc.cfgr >>> 14) & 3];
      if (adcclk > 14e6) warn('adcclk', `Xung ADC = ${adcclk / 1e6} MHz vượt mức tối đa 14 MHz.`);
      this.end = cyc + Math.ceil((SMPCYC[s] + 12.5) * hclk / adcclk);
    },
    value(ch) {
      if (ch === 16) return Math.round(1.43 / 3.3 * 4095);
      if (ch === 17) return Math.round(1.2 / 3.3 * 4095);
      return Math.round(Math.max(0, Math.min(1, this.inputs[ch] || 0)) * 4095);
    },
    sync() {
      if (this.end > cyc) return;
      this.dr = this.value(this.channel()); this.sr |= 2; this.end = Infinity;
      const L = ((this.sqr[0] >>> 20) & 15) + 1; const scan = this.cr1 & 0x100;
      if (scan && this.seq + 1 < L) { this.seq++; this.start(); }
      else { this.seq = 0; if (this.cr2 & 2) this.start(); }
      setLine(18, (this.cr1 & 0x20) && (this.sr & 2));
    },
    read(o) {
      switch (o) {
        case 0: return this.sr; case 4: return this.cr1; case 8: return this.cr2;
        case 0xC: return this.smpr1; case 0x10: return this.smpr2;
        case 0x2C: case 0x30: case 0x34: return this.sqr[(o - 0x2C) >> 2];
        case 0x4C: { const v = this.dr; this.sr &= ~2; setLine(18, 0); return (this.cr2 & 0x800) ? (v << 4) & 0xFFFF : v; }
      }
      return 0;
    },
    write(o, v) {
      switch (o) {
        case 0: this.sr &= v; break;
        case 4: this.cr1 = v; break;
        case 8: {
          const old = this.cr2; this.cr2 = v & ~(0x400000 | 0x200000 | 0xC);
          if ((v & 1) && !(old & 1)) { /* đánh thức */ }
          if ((v & 0x400000) && (v & 1)) { this.seq = 0; this.sr |= 0x10; this.start(); }
          if ((v & 1) && (old & 1) && !(v & 0x400000) && (((v >>> 17) & 7) === 7) && !(v & 0x100000)) { this.seq = 0; this.start(); }
          break;
        }
        case 0xC: this.smpr1 = v; break;
        case 0x10: this.smpr2 = v; break;
        case 0x2C: case 0x30: case 0x34: this.sqr[(o - 0x2C) >> 2] = v; break;
      }
      setLine(18, (this.cr1 & 0x20) && (this.sr & 2)); limit = 0;
    },
  };

  function syncAll() {
    stSync();
    for (let i = 0; i < 4; i++) tims[i].sync();
    for (let i = 0; i < 3; i++) usarts[i].sync();
    adc.sync();
  }
  function nextEvent() {
    let n = stNext();
    for (let i = 0; i < 4; i++) { const v = tims[i].next(); if (v < n) n = v; }
    for (let i = 0; i < 3; i++) { const v = usarts[i].next(); if (v < n) n = v; }
    if (adc.end < n) n = adc.end;
    return n;
  }

  // ==== Bản đồ ngoại vi ====
  const storage = new Map();
  const UNIMPL = { 0x40002800: 'RTC', 0x40002C00: 'WWDG', 0x40003000: 'IWDG', 0x40003800: 'SPI2', 0x40005400: 'I2C1', 0x40005800: 'I2C2', 0x40005C00: 'USB', 0x40006400: 'CAN', 0x40012800: 'ADC2', 0x40013000: 'SPI1', 0x40020000: 'DMA1', 0x40023000: 'CRC' };
  function clockOff(name, write) { warn('clk' + name + write, `Firmware ${write ? 'ghi vào' : 'đọc'} ${name} khi chưa bật clock của ngoại vi này trong RCC. Trên board thật thao tác này không có tác dụng.`); }
  function periphFor(base) {
    switch (base) {
      case 0x40000000: return tims[1]; case 0x40000400: return tims[2]; case 0x40000800: return tims[3]; case 0x40012C00: return tims[0];
      case 0x40004400: return usarts[1]; case 0x40004800: return usarts[2]; case 0x40013800: return usarts[0];
      case 0x40010800: return gpios[0]; case 0x40010C00: return gpios[1]; case 0x40011000: return gpios[2]; case 0x40011400: return gpios[3]; case 0x40011800: return gpios[4];
    }
    return null;
  }
  function periphName(p) { return p.name.length === 1 ? 'GPIO' + p.name : p.name; }
  function pRead(a) {
    const base = a & 0xFFFFFC00, o = a & 0x3FC;
    if (base === 0x40021000) return rccRead(o);
    if (base === 0x40022000) return flashRead(o);
    syncAll();
    const p = periphFor(base);
    if (p) { if (!p.on()) { clockOff(periphName(p), false); return 0; } return p.read(o); }
    switch (base) {
      case 0x40010000: if (!(rcc.apb2en & 1)) return 0; if (o === 0) return afio.evcr; if (o === 4) return afio.mapr; if (o >= 8 && o < 0x18) return afio.exticr[(o - 8) >> 2]; return 0;
      case 0x40010400: return o === 0 ? exti.imr : o === 4 ? exti.emr : o === 8 ? exti.rtsr : o === 0xC ? exti.ftsr : o === 0x14 ? exti.pr : 0;
      case 0x40012400: if (!adc.on()) { clockOff('ADC1', false); return 0; } return adc.read(o);
      case 0x40007000: case 0x40006C00: return storage.get(a) || 0;
    }
    return unimpl(a, base);
  }
  function unimpl(a, base) {
    const nm = UNIMPL[base];
    warn('un' + base, nm ? `${nm} chưa được mô phỏng. Code dùng ${nm} có thể bị treo chờ cờ hoặc báo lỗi timeout.` : `Firmware truy cập địa chỉ ngoại vi ${hex(a)} chưa được mô phỏng.`);
    return 0;
  }
  function pWrite(a, v) {
    const base = a & 0xFFFFFC00, o = a & 0x3FC;
    if (base === 0x40021000) { rccWrite(o, v); return; }
    if (base === 0x40022000) { flashWrite(o, v); return; }
    syncAll();
    const p = periphFor(base);
    if (p) { if (!p.on()) { clockOff(periphName(p), true); return; } p.write(o, v); return; }
    switch (base) {
      case 0x40010000:
        if (!(rcc.apb2en & 1)) { clockOff('AFIO', true); return; }
        if (o === 0) afio.evcr = v; else if (o === 4) afio.mapr = v; else if (o >= 8 && o < 0x18) afio.exticr[(o - 8) >> 2] = v & 0xFFFF;
        return;
      case 0x40010400:
        if (o === 0) { exti.imr = v & 0xFFFFF; extiUpdate(); }
        else if (o === 4) exti.emr = v; else if (o === 8) exti.rtsr = v; else if (o === 0xC) exti.ftsr = v;
        else if (o === 0x10) { exti.pr |= v & exti.imr; extiUpdate(); }
        else if (o === 0x14) { exti.pr &= ~v; extiUpdate(); }
        return;
      case 0x40012400: if (!adc.on()) { clockOff('ADC1', true); return; } adc.write(o, v); return;
      case 0x40007000: case 0x40006C00: storage.set(a, v); return;
    }
    unimpl(a, base);
  }
  function rccRead(o) {
    switch (o) {
      case 0: return rcc.cr;
      case 4: return (rcc.cfgr & ~0xC) | ((rcc.cfgr & 3) << 2);
      case 8: return rcc.cir; case 0xC: return rcc.apb2rst; case 0x10: return rcc.apb1rst; case 0x14: return rcc.ahben; case 0x18: return rcc.apb2en; case 0x1C: return rcc.apb1en;
      case 0x20: return rcc.bdcr; case 0x24: return rcc.csr;
    }
    return 0;
  }
  function rccWrite(o, v) {
    switch (o) {
      case 0: {
        let c = v & ~(2 | (1 << 17) | (1 << 25));
        if (c & 1) c |= 2; if (c & (1 << 16)) c |= 1 << 17; if (c & (1 << 24)) c |= 1 << 25;
        rcc.cr = c >>> 0; break;
      }
      case 4: rcc.cfgr = (v & ~0xC) >>> 0; recomputeClocks(); break;
      case 8: rcc.cir = v & 0x1F00; break;
      case 0xC: rcc.apb2rst = v;
        if (v & 4) gpioReset(0); if (v & 8) gpioReset(1); if (v & 16) gpioReset(2); if (v & 32) gpioReset(3); if (v & 64) gpioReset(4);
        if (v & (1 << 9)) adc.reset(); if (v & (1 << 11)) tims[0].reset(); if (v & (1 << 14)) usarts[0].reset(); break;
      case 0x10: rcc.apb1rst = v;
        if (v & 1) tims[1].reset(); if (v & 2) tims[2].reset(); if (v & 4) tims[3].reset(); if (v & (1 << 17)) usarts[1].reset(); if (v & (1 << 18)) usarts[2].reset(); break;
      case 0x14: rcc.ahben = v; break;
      case 0x18: rcc.apb2en = v; break;
      case 0x1C: rcc.apb1en = v; break;
      case 0x20: { let b = v & ~2; if (b & 1) b |= 2; rcc.bdcr = b; break; }
      case 0x24: { let s = v & ~2; if (s & 1) s |= 2; rcc.csr = s; break; }
    }
    limit = 0;
  }
  function gpioReset(i) { gpios[i].reset(); gpios[i].update(); }
  function flashRead(o) { if (o === 0) return flashACR; if (o === 0x10) return 0x80; return 0; }
  function flashWrite(o, v) {
    if (o === 0) { flashACR = v & 0x3F; return; }
    warn('flashprog', 'Ghi vào bộ nhớ flash trong chương trình chưa được mô phỏng.');
  }

  // ==== PPB: NVIC / SCB / SysTick ====
  function ppbRead(a) {
    if (a >= 0xE000E100 && a < 0xE000E120) { const i = (a - 0xE000E100) >> 2; let v = 0; for (let b = 0; b < 32; b++) if (enabled[16 + i * 32 + b]) v |= 1 << b; return v; }
    if (a >= 0xE000E180 && a < 0xE000E1A0) { const i = (a - 0xE000E180) >> 2; let v = 0; for (let b = 0; b < 32; b++) if (enabled[16 + i * 32 + b]) v |= 1 << b; return v; }
    if (a >= 0xE000E200 && a < 0xE000E220) { const i = (a - 0xE000E200) >> 2; let v = 0; for (let b = 0; b < 32; b++) if (pend[16 + i * 32 + b]) v |= 1 << b; return v; }
    if (a >= 0xE000E280 && a < 0xE000E2A0) { const i = (a - 0xE000E280) >> 2; let v = 0; for (let b = 0; b < 32; b++) if (pend[16 + i * 32 + b]) v |= 1 << b; return v; }
    if (a >= 0xE000E300 && a < 0xE000E320) { const i = (a - 0xE000E300) >> 2; let v = 0; for (let b = 0; b < 32; b++) if (active[16 + i * 32 + b]) v |= 1 << b; return v; }
    if (a >= 0xE000E400 && a < 0xE000E454) { const i = a - 0xE000E400; return prio[16 + i] | prio[17 + i] << 8 | prio[18 + i] << 16 | prio[19 + i] << 24; }
    switch (a) {
      case 0xE000E010: stSync(); { const v = stCtrl | (stFlag << 16); stFlag = 0; return v; }
      case 0xE000E014: return stLoad;
      case 0xE000E018: stSync(); return stVal;
      case 0xE000E01C: return 0x40000000 | 8999;
      case 0xE000ED00: return 0x411FC231;
      case 0xE000ED04: { let v = IPSR & 0x1FF; if (pend[14]) v |= 1 << 28; if (pend[15]) v |= 1 << 26; return v; }
      case 0xE000ED08: return VTOR;
      case 0xE000ED0C: return 0xFA050000 | (prigroup << 8);
      case 0xE000ED10: return scbSCR;
      case 0xE000ED14: return scbCCR;
      case 0xE000ED18: return prio[4] | prio[5] << 8 | prio[6] << 16 | prio[7] << 24;
      case 0xE000ED1C: return prio[8] | prio[9] << 8 | prio[10] << 16 | prio[11] << 24;
      case 0xE000ED20: return prio[12] | prio[13] << 8 | prio[14] << 16 | prio[15] << 24;
      case 0xE000ED24: return shcsr;
      case 0xE000ED28: return cfsr;
      case 0xE000ED2C: return hfsr;
      case 0xE000ED34: return mmfar;
      case 0xE000ED38: return bfar;
      case 0xE000E004: return 2;
    }
    return 0;
  }
  function ppbWrite(a, v) {
    if (a >= 0xE000E100 && a < 0xE000E120) { const i = (a - 0xE000E100) >> 2; for (let b = 0; b < 32; b++) if (v & (1 << b)) enabled[16 + i * 32 + b] = 1; limit = 0; return; }
    if (a >= 0xE000E180 && a < 0xE000E1A0) { const i = (a - 0xE000E180) >> 2; for (let b = 0; b < 32; b++) if (v & (1 << b)) enabled[16 + i * 32 + b] = 0; return; }
    if (a >= 0xE000E200 && a < 0xE000E220) { const i = (a - 0xE000E200) >> 2; for (let b = 0; b < 32; b++) if (v & (1 << b)) setPend(16 + i * 32 + b); return; }
    if (a >= 0xE000E280 && a < 0xE000E2A0) { const i = (a - 0xE000E280) >> 2; for (let b = 0; b < 32; b++) if (v & (1 << b)) { clrPend(16 + i * 32 + b); if (lines[16 + i * 32 + b]) setPend(16 + i * 32 + b); } return; }
    if (a >= 0xE000E400 && a < 0xE000E454) { const i = a - 0xE000E400; for (let k = 0; k < 4; k++) prio[16 + i + k] = (v >>> (k * 8)) & 0xF0; limit = 0; return; }
    switch (a) {
      case 0xE000E010: stSync(); stCtrl = v & 7; stLast = cyc; limit = 0; return;
      case 0xE000E014: stLoad = v & 0xFFFFFF; limit = 0; return;
      case 0xE000E018: stSync(); stVal = 0; stFlag = 0; stAcc = 0; limit = 0; return;
      case 0xE000ED04:
        if (v & (1 << 31)) setPend(2);
        if (v & (1 << 28)) setPend(14); if (v & (1 << 27)) clrPend(14);
        if (v & (1 << 26)) setPend(15); if (v & (1 << 25)) clrPend(15);
        return;
      case 0xE000ED08: VTOR = v & 0x3FFFFF80; return;
      case 0xE000ED0C:
        if ((v >>> 16) === 0x05FA) { prigroup = (v >>> 8) & 7; if (v & 4) resetRequested = true, limit = 0; }
        limit = 0; return;
      case 0xE000ED10: scbSCR = v & 0x16; return;
      case 0xE000ED14: scbCCR = v; return;
      case 0xE000ED18: for (let k = 0; k < 4; k++) prio[4 + k] = (v >>> (k * 8)) & 0xF0; return;
      case 0xE000ED1C: for (let k = 0; k < 4; k++) prio[8 + k] = (v >>> (k * 8)) & 0xF0; return;
      case 0xE000ED20: for (let k = 0; k < 4; k++) prio[12 + k] = (v >>> (k * 8)) & 0xF0; limit = 0; return;
      case 0xE000ED24: shcsr = v; return;
      case 0xE000ED28: cfsr &= ~v; return;
      case 0xE000ED2C: hfsr &= ~v; return;
    }
  }
  let resetRequested = false;

  // ==== Truy cập bộ nhớ ====
  function devRead32(a) {
    a >>>= 0;
    if (a >= 0xE0000000) {
      if (a >= 0xE000E000 && a < 0xE000F000) return ppbRead(a);
      if (a === 0xE0042000) return 0x20036410;
      if (a === 0xE0042004) return 0;
      if (a < 0xE0100000) return 0; // ITM/DWT/TPIU: bỏ qua
      throw new Fault('bus', a);
    }
    if (a >= 0x42000000 && a < 0x44000000) { const off = a - 0x42000000, wa = 0x40000000 + ((off >>> 5) & ~3), bit = (off >>> 2) & 31; return (pRead(wa) >>> bit) & 1; }
    if (a >= 0x22000000 && a < 0x22100000) { const off = a - 0x22000000, ba = RAM_BASE + (off >>> 5), bit = (off >>> 2) & 7; if (ba >= RAM_END) throw new Fault('bus', a); return (ramB[ba - RAM_BASE] >>> bit) & 1; }
    if (a >= 0x40000000 && a < 0x40030000) return pRead(a);
    if (a < FLASH_SIZE) return flash.getInt32(a & ~3, true);
    if (a >= 0x1FFFF000 && a < 0x1FFFF810) { if ((a & ~3) === 0x1FFFF7E0) return 128; if ((a & ~3) === 0x1FFFF7E8) return 0x12345678; if ((a & ~3) === 0x1FFFF7EC) return 0x41424344; if ((a & ~3) === 0x1FFFF7F0) return 0x53494D31; return 0; }
    throw new Fault('bus', a);
  }
  function devWrite32(a, v) {
    a >>>= 0;
    if (a >= 0xE0000000) { if (a >= 0xE000E000 && a < 0xE000F000) { ppbWrite(a, v); return; } if (a < 0xE0100000) return; throw new Fault('bus', a); }
    if (a >= 0x42000000 && a < 0x44000000) { const off = a - 0x42000000, wa = 0x40000000 + ((off >>> 5) & ~3), bit = (off >>> 2) & 31; const cur = pRead(wa); pWrite(wa, (v & 1) ? (cur | (1 << bit)) : (cur & ~(1 << bit))); return; }
    if (a >= 0x22000000 && a < 0x22100000) { const off = a - 0x22000000, ba = RAM_BASE + (off >>> 5), bit = (off >>> 2) & 7; if (ba >= RAM_END) throw new Fault('bus', a); if (v & 1) ramB[ba - RAM_BASE] |= 1 << bit; else ramB[ba - RAM_BASE] &= ~(1 << bit); return; }
    if (a >= 0x40000000 && a < 0x40030000) { pWrite(a, v); return; }
    if (a < FLASH_SIZE || (a >= FLASH_BASE && a < FLASH_END)) { warn('flashw', `Firmware ghi trực tiếp vào flash tại ${hex(a)}: lệnh ghi bị bỏ qua.`); return; }
    throw new Fault('bus', a);
  }
  function rd32(a) {
    a >>>= 0;
    if (a >= RAM_BASE && a <= RAM_END - 4) return ram.getInt32(a - RAM_BASE, true);
    if (a >= FLASH_BASE && a <= FLASH_END - 4) return flash.getInt32(a - FLASH_BASE, true);
    return devRead32(a) | 0;
  }
  function rdU16(a) {
    a >>>= 0;
    if (a >= RAM_BASE && a <= RAM_END - 2) return ram.getUint16(a - RAM_BASE, true);
    if (a >= FLASH_BASE && a <= FLASH_END - 2) return flash.getUint16(a - FLASH_BASE, true);
    if (a < FLASH_SIZE - 1) return flash.getUint16(a, true);
    return (devRead32(a & ~3) >>> ((a & 2) * 8)) & 0xFFFF;
  }
  function rdU8(a) {
    a >>>= 0;
    if (a >= RAM_BASE && a < RAM_END) return ramB[a - RAM_BASE];
    if (a >= FLASH_BASE && a < FLASH_END) return flashB[a - FLASH_BASE];
    if (a < FLASH_SIZE) return flashB[a];
    return (devRead32(a & ~3) >>> ((a & 3) * 8)) & 0xFF;
  }
  function wr32(a, v) {
    a >>>= 0;
    if (a >= RAM_BASE && a <= RAM_END - 4) { ram.setInt32(a - RAM_BASE, v, true); return; }
    devWrite32(a, v);
  }
  function wr16(a, v) {
    a >>>= 0;
    if (a >= RAM_BASE && a <= RAM_END - 2) { ram.setUint16(a - RAM_BASE, v, true); return; }
    if (a >= 0x40000000 && a < 0x40030000) { const al = a & ~3, sh = (a & 2) * 8, cur = (a & 0xFFFFFC00) === 0x40010400 ? 0 : 0; pWrite(al, (v & 0xFFFF) << sh | cur); return; }
    devWrite32(a & ~3, (v & 0xFFFF) << ((a & 2) * 8));
  }
  function wr8(a, v) {
    a >>>= 0;
    if (a >= RAM_BASE && a < RAM_END) { ramB[a - RAM_BASE] = v; return; }
    if (a >= 0xE000E400 && a < 0xE000E454) { prio[16 + a - 0xE000E400] = v & 0xF0; limit = 0; return; }
    if (a >= 0xE000ED18 && a < 0xE000ED24) { prio[4 + a - 0xE000ED18] = v & 0xF0; limit = 0; return; }
    devWrite32(a & ~3, (v & 0xFF) << ((a & 3) * 8));
  }

  // ==== Ngoại lệ ====
  function group(p) { const m = (0xFF << (prigroup + 1)) & 0xFF; return p & m; }
  function excPrio(e) { return e === 1 ? -3 : e === 2 ? -2 : e === 3 ? -1 : group(prio[e]); }
  function execPrio() {
    let p = 256;
    for (let e = 1; e < NEXC; e++) if (active[e]) { const q = excPrio(e); if (q < p) p = q; }
    if (basepri !== 0) { const b = group(basepri); if (b < p) p = b; }
    if (primask && p > 0) p = 0;
    if (faultmask && p > -1) p = -1;
    return p;
  }
  function makeXPSR() {
    return ((N << 31) | (Z << 30) | (C << 29) | (V << 28) | (Q << 27) | (1 << 24) | ((IT & 3) << 25) | ((IT >>> 2) << 10) | IPSR) >>> 0;
  }
  function setStack(useP) { // useP: có dùng PSP không
    const curP = IPSR === 0 && (ctrl & 2) !== 0;
    if (curP !== useP) { const t = r[13]; r[13] = spOther; spOther = t; }
  }
  function excEnter(e) {
    const sp0 = r[13];
    const align = (sp0 & 4) ? 1 : 0;
    const sp = ((sp0 - 32) & ~7) >>> 0;
    let x = makeXPSR(); if (align) x |= 1 << 9;
    wr32(sp, r[0]); wr32(sp + 4, r[1]); wr32(sp + 8, r[2]); wr32(sp + 12, r[3]); wr32(sp + 16, r[12]); wr32(sp + 20, r[14]); wr32(sp + 24, PC); wr32(sp + 28, x);
    r[13] = sp;
    const threadPSP = IPSR === 0 && (ctrl & 2) !== 0;
    r[14] = IPSR !== 0 ? 0xFFFFFFF1 | 0 : (threadPSP ? 0xFFFFFFFD | 0 : 0xFFFFFFF9 | 0);
    if (threadPSP) { const t = r[13]; r[13] = spOther; spOther = t; }
    IPSR = e; active[e] = 1; clrPend(e); IT = 0; sleeping = false; exclusive = false;
    PC = (rd32((VTOR + e * 4) >>> 0) & ~1) >>> 0;
    cyc += 12; limit = 0;
  }
  function excReturn(v) {
    const e = IPSR; active[e] = 0;
    if (e >= 16 && lines[e]) setPend(e);
    const toHandler = (v & 15) === 1, usePSP = (v & 15) === 13;
    IPSR = toHandler ? IPSR : 0;
    if (usePSP) { const t = r[13]; r[13] = spOther; spOther = t; ctrl |= 2; }
    else if ((v & 15) === 9) ctrl &= ~2;
    const sp = r[13] >>> 0;
    const nr = [rd32(sp), rd32(sp + 4), rd32(sp + 8), rd32(sp + 12), rd32(sp + 16), rd32(sp + 20), rd32(sp + 24), rd32(sp + 28)];
    r[0] = nr[0]; r[1] = nr[1]; r[2] = nr[2]; r[3] = nr[3]; r[12] = nr[4]; r[14] = nr[5];
    const x = nr[7];
    N = (x >>> 31) & 1; Z = (x >>> 30) & 1; C = (x >>> 29) & 1; V = (x >>> 28) & 1; Q = (x >>> 27) & 1;
    IT = ((x >>> 25) & 3) | (((x >>> 10) & 0x3F) << 2);
    IPSR = x & 0x1FF;
    if (toHandler && IPSR === 0) IPSR = e;
    r[13] = (sp + 32 + ((x & (1 << 9)) ? 4 : 0)) | 0;
    NPC = (nr[6] & ~1) >>> 0;
    cyc += 12; limit = 0;
  }
  function checkInterrupts() {
    if (resetRequested) { resetRequested = false; reset(false); return; }
    if (pendAny === 0) return;
    let best = -1, bp = 999;
    for (let e = 1; e < NEXC; e++) {
      if (!pend[e]) continue;
      if (e >= 16 && !enabled[e]) continue;
      const p = excPrio(e);
      if (p < bp) { bp = p; best = e; }
    }
    if (best < 0) return;
    if (sleeping) { sleeping = false; }
    if (bp < execPrio()) excEnter(best);
  }
  function fault(f) {
    IT = IT; // giữ trạng thái
    hfsr |= 0x40000000;
    if (f.kind === 'bus') { cfsr |= 0x8200; bfar = f.addr >>> 0; }
    else if (f.kind === 'undef') cfsr |= 0x10000;
    else if (f.kind === 'invstate') cfsr |= 0x20000;
    else if (f.kind === 'div0') cfsr |= 0x2000000;
    else if (f.kind === 'unaligned') cfsr |= 0x1000000;
    if (hooks.fault) hooks.fault(f, PC);
    if (active[3] || active[2]) { halted = { kind: 'lockup', pc: PC, fault: f }; return; }
    try { excEnter(3); } catch (e) { if (e instanceof Fault) halted = { kind: 'lockup', pc: PC, fault: e }; else throw e; }
  }
  function bxTo(v) {
    if ((v >>> 28) === 0xF && IPSR !== 0) { excReturn(v); return; }
    if (!(v & 1)) throw new Fault('invstate', v);
    NPC = (v & ~1) >>> 0;
  }
  function aluTo(v) {
    if ((v >>> 28) === 0xF && IPSR !== 0) { excReturn(v); return; }
    NPC = (v & ~1) >>> 0;
  }

  // ==== Dịch bit, số học ====
  function shf(v, t, n) { // t: 0 LSL,1 LSR,2 ASR,3 ROR,4 RRX. Đặt SC
    switch (t) {
      case 0: if (n === 0) { SC = C; return v; } if (n < 32) { SC = (v >>> (32 - n)) & 1; return v << n; } SC = n === 32 ? v & 1 : 0; return 0;
      case 1: if (n === 0) { SC = C; return v; } if (n < 32) { SC = (v >>> (n - 1)) & 1; return (v >>> n) | 0; } SC = n === 32 ? v >>> 31 : 0; return 0;
      case 2: if (n === 0) { SC = C; return v; } if (n < 32) { SC = (v >> (n - 1)) & 1; return v >> n; } SC = v >>> 31; return v >> 31;
      case 3: {
        if (n === 0) { SC = C; return v; }
        const m = n & 31;
        if (m === 0) { SC = v >>> 31; return v; }
        const x = (v >>> m) | (v << (32 - m)); SC = x >>> 31; return x;
      }
      default: { SC = v & 1; return (C << 31) | (v >>> 1); }
    }
  }
  function addc(a, b, c) {
    const s = (a >>> 0) + (b >>> 0) + c, x = s | 0;
    C = s > 4294967295 ? 1 : 0; V = ((a ^ x) & (b ^ x)) < 0 ? 1 : 0; N = x < 0 ? 1 : 0; Z = x === 0 ? 1 : 0;
    return x;
  }
  function cond(c) {
    switch (c) {
      case 0: return Z === 1; case 1: return Z === 0; case 2: return C === 1; case 3: return C === 0;
      case 4: return N === 1; case 5: return N === 0; case 6: return V === 1; case 7: return V === 0;
      case 8: return C === 1 && Z === 0; case 9: return C === 0 || Z === 1;
      case 10: return N === V; case 11: return N !== V;
      case 12: return Z === 0 && N === V; case 13: return Z === 1 || N !== V;
      default: return true;
    }
  }
  function sx(v, bits) { const s = 32 - bits; return (v << s) >> s; }

  // Thao tác đọc/ghi nhiều thanh ghi
  function ldmIA(base, list, wb) {
    let a = r[base] >>> 0; const haspc = list & 0x8000;
    const n = popcnt(list);
    for (let i = 0; i < 15; i++) if (list & (1 << i)) { r[i] = rd32(a); a = (a + 4) >>> 0; }
    if (wb && !(list & (1 << base))) r[base] = r[base] + 4 * n;
    if (haspc) { const v = rd32(a); bxTo(v); }
  }
  function stmIA(base, list, wb) {
    let a = r[base] >>> 0; const n = popcnt(list);
    for (let i = 0; i < 15; i++) if (list & (1 << i)) { wr32(a, r[i]); a = (a + 4) >>> 0; }
    if (wb) r[base] = r[base] + 4 * n;
  }
  function ldmDB(base, list, wb) {
    const n = popcnt(list); let a = (r[base] - 4 * n) >>> 0; const start = a;
    for (let i = 0; i < 15; i++) if (list & (1 << i)) { r[i] = rd32(a); a = (a + 4) >>> 0; }
    if (wb && !(list & (1 << base))) r[base] = start;
    if (list & 0x8000) { bxTo(rd32(a)); }
  }
  function stmDB(base, list, wb) {
    const n = popcnt(list); let a = (r[base] - 4 * n) >>> 0; const start = a;
    for (let i = 0; i < 15; i++) if (list & (1 << i)) { wr32(a, r[i]); a = (a + 4) >>> 0; }
    if (wb) r[base] = start;
  }
  function popcnt(x) { let c = 0; while (x) { x &= x - 1; c++; } return c; }

  // ==== Giải mã lệnh ====
  let dFn = null, dLen = 2, dCost = 1;
  const undef = (h) => () => { throw new Fault('undef', h); };
  function brTaken() { cyc += 2; }

  function decode16(h, inIT, pc) {
    dLen = 2; dCost = 1;
    const top5 = h >>> 11;
    const a = (h >> 3) & 7, d = h & 7, b = (h >> 6) & 7, imm8 = h & 0xFF, rd8h = (h >> 8) & 7;
    switch (top5) {
      case 0: case 1: case 2: { // LSL/LSR/ASR imm
        const im = (h >> 6) & 31, t = top5;
        if (t === 0 && im === 0) return inIT ? () => { r[d] = r[a]; } : () => { const v = r[a]; r[d] = v; N = v < 0 ? 1 : 0; Z = v === 0 ? 1 : 0; };
        const n = (t !== 0 && im === 0) ? 32 : im;
        if (inIT) return () => { r[d] = shf(r[a], t, n); };
        return () => { const v = shf(r[a], t, n); r[d] = v; N = v < 0 ? 1 : 0; Z = v === 0 ? 1 : 0; C = SC; };
      }
      case 3: {
        const op = (h >> 9) & 3;
        switch (op) {
          case 0: return inIT ? () => { r[d] = r[a] + r[b]; } : () => { r[d] = addc(r[a], r[b], 0); };
          case 1: return inIT ? () => { r[d] = r[a] - r[b]; } : () => { r[d] = addc(r[a], ~r[b], 1); };
          case 2: return inIT ? () => { r[d] = r[a] + b; } : () => { r[d] = addc(r[a], b, 0); };
          default: return inIT ? () => { r[d] = r[a] - b; } : () => { r[d] = addc(r[a], ~b, 1); };
        }
      }
      case 4: return inIT ? () => { r[rd8h] = imm8; } : () => { r[rd8h] = imm8; N = 0; Z = imm8 === 0 ? 1 : 0; };
      case 5: return () => { addc(r[rd8h], ~imm8, 1); };
      case 6: return inIT ? () => { r[rd8h] = r[rd8h] + imm8; } : () => { r[rd8h] = addc(r[rd8h], imm8, 0); };
      case 7: return inIT ? () => { r[rd8h] = r[rd8h] - imm8; } : () => { r[rd8h] = addc(r[rd8h], ~imm8, 1); };
      case 8: {
        if (!(h & 0x400)) { // Data-processing
          const op = (h >> 6) & 15, s = !inIT;
          const nz = (v) => { N = v < 0 ? 1 : 0; Z = v === 0 ? 1 : 0; };
          switch (op) {
            case 0: return s ? () => { const v = r[d] & r[a]; r[d] = v; nz(v); } : () => { r[d] &= r[a]; };
            case 1: return s ? () => { const v = r[d] ^ r[a]; r[d] = v; nz(v); } : () => { r[d] ^= r[a]; };
            case 2: case 3: case 4: case 7: {
              const t = op === 2 ? 0 : op === 3 ? 1 : op === 4 ? 2 : 3;
              return s ? () => { const v = shf(r[d], t, r[a] & 0xFF); r[d] = v; nz(v); C = SC; } : () => { r[d] = shf(r[d], t, r[a] & 0xFF); };
            }
            case 5: return s ? () => { r[d] = addc(r[d], r[a], C); } : () => { r[d] = r[d] + r[a] + C; };
            case 6: return s ? () => { r[d] = addc(r[d], ~r[a], C); } : () => { r[d] = r[d] + (~r[a]) + C; };
            case 8: return () => { nz(r[d] & r[a]); };
            case 9: return s ? () => { r[d] = addc(~r[a], 0, 1); } : () => { r[d] = -r[a]; };
            case 10: return () => { addc(r[d], ~r[a], 1); };
            case 11: return () => { addc(r[d], r[a], 0); };
            case 12: return s ? () => { const v = r[d] | r[a]; r[d] = v; nz(v); } : () => { r[d] |= r[a]; };
            case 13: return s ? () => { const v = Math.imul(r[d], r[a]); r[d] = v; nz(v); } : () => { r[d] = Math.imul(r[d], r[a]); };
            case 14: return s ? () => { const v = r[d] & ~r[a]; r[d] = v; nz(v); } : () => { r[d] &= ~r[a]; };
            default: return s ? () => { const v = ~r[a]; r[d] = v; nz(v); } : () => { r[d] = ~r[a]; };
          }
        }
        const op = (h >> 8) & 3, hd = (d | ((h >> 4) & 8)), hm = (h >> 3) & 15;
        if (op === 0) { const f = () => { r[hd] = r[hd] + r[hm]; }; if (hd === 15) return () => { aluTo((r[15] + r[hm]) | 0); }; return f; }
        if (op === 1) return () => { addc(r[hd], ~r[hm], 1); };
        if (op === 2) { if (hd === 15) return () => { aluTo(r[hm]); }; return () => { r[hd] = r[hm]; }; }
        if (h & 0x80) { dCost = 3; return () => { const t = r[hm]; r[14] = (NPC | 1); bxTo(t); }; }
        dCost = 3;
        return () => { bxTo(r[hm]); };
      }
      case 9: { const o = imm8 * 4; dCost = 2; return () => { r[rd8h] = rd32(((r[15] & ~3) + o) >>> 0); }; }
      case 10: case 11: {
        const op = (h >> 9) & 7; dCost = 2;
        switch (op) {
          case 0: return () => { wr32(r[a] + r[b], r[d]); };
          case 1: return () => { wr16(r[a] + r[b], r[d]); };
          case 2: return () => { wr8(r[a] + r[b], r[d]); };
          case 3: return () => { r[d] = sx(rdU8(r[a] + r[b]), 8); };
          case 4: return () => { r[d] = rd32(r[a] + r[b]); };
          case 5: return () => { r[d] = rdU16(r[a] + r[b]); };
          case 6: return () => { r[d] = rdU8(r[a] + r[b]); };
          default: return () => { r[d] = sx(rdU16(r[a] + r[b]), 16); };
        }
      }
      case 12: { const o = ((h >> 6) & 31) * 4; dCost = 2; return () => { wr32(r[a] + o, r[d]); }; }
      case 13: { const o = ((h >> 6) & 31) * 4; dCost = 2; return () => { r[d] = rd32(r[a] + o); }; }
      case 14: { const o = (h >> 6) & 31; dCost = 2; return () => { wr8(r[a] + o, r[d]); }; }
      case 15: { const o = (h >> 6) & 31; dCost = 2; return () => { r[d] = rdU8(r[a] + o); }; }
      case 16: { const o = ((h >> 6) & 31) * 2; dCost = 2; return () => { wr16(r[a] + o, r[d]); }; }
      case 17: { const o = ((h >> 6) & 31) * 2; dCost = 2; return () => { r[d] = rdU16(r[a] + o); }; }
      case 18: { const o = imm8 * 4; dCost = 2; return () => { wr32(r[13] + o, r[rd8h]); }; }
      case 19: { const o = imm8 * 4; dCost = 2; return () => { r[rd8h] = rd32(r[13] + o); }; }
      case 20: { const o = imm8 * 4; return () => { r[rd8h] = ((r[15] & ~3) + o) | 0; }; }
      case 21: { const o = imm8 * 4; return () => { r[rd8h] = r[13] + o; }; }
      case 22: case 23: return decodeMisc(h, inIT);
      case 24: { const list = imm8, b0 = rd8h; dCost = 1 + popcnt(list); return () => stmIA(b0, list, true); }
      case 25: { const list = imm8, b0 = rd8h; dCost = 1 + popcnt(list); return () => ldmIA(b0, list, !(list & (1 << b0))); }
      case 26: case 27: {
        const c = (h >> 8) & 15;
        if (c === 15) { const nm = imm8; dCost = 2; return () => { setPend(11); void nm; }; }
        if (c === 14) { const kod = imm8; return () => { throw new Fault('undef', kod); }; }
        const off = sx(imm8, 8) * 2, tgt = (pc + 4 + off) >>> 0;
        return () => { if (cond(c)) { NPC = tgt; cyc += 2; } };
      }
      case 28: { const off = sx(h & 0x7FF, 11) * 2, tgt = (pc + 4 + off) >>> 0; dCost = 3; return () => { NPC = tgt; }; }
    }
    return undef(h);
  }
  function decodeMisc(h, inIT) {
    const op = (h >> 8) & 15, d = h & 7, a = (h >> 3) & 7;
    if (op === 0) { const v = (h & 0x7F) * 4; return (h & 0x80) ? () => { r[13] = r[13] - v; } : () => { r[13] = r[13] + v; }; }
    if ((op & 5) === 1) { // CBZ/CBNZ
      const nz = h & 0x800, o = (((h >> 9) & 1) << 6) | (((h >> 3) & 31) << 1), rn = d;
      return nz ? () => { if (r[rn] !== 0) { NPC = (r[15] + o) >>> 0; cyc += 2; } } : () => { if (r[rn] === 0) { NPC = (r[15] + o) >>> 0; cyc += 2; } };
    }
    if (op === 2) {
      switch ((h >> 6) & 3) {
        case 0: return () => { r[d] = (r[a] << 16) >> 16; };
        case 1: return () => { r[d] = (r[a] << 24) >> 24; };
        case 2: return () => { r[d] = r[a] & 0xFFFF; };
        default: return () => { r[d] = r[a] & 0xFF; };
      }
    }
    if (op === 4 || op === 5) { // PUSH
      const list = (h & 0xFF) | ((h & 0x100) << 6);
      dCost = 1 + popcnt(list); return () => stmDB(13, list, true);
    }
    if (op === 12 || op === 13) { // POP
      const list = (h & 0xFF) | ((h & 0x100) << 7); dCost = 1 + popcnt(list);
      return () => ldmIA(13, list, true);
    }
    if (op === 6) { // CPS
      if ((h & 0xFFE0) === 0xB660) {
        const dis = (h >> 4) & 1;
        return () => { if (h & 2) primask = dis; if (h & 1) faultmask = dis; limit = 0; };
      }
      return undef(h);
    }
    if (op === 10) {
      switch ((h >> 6) & 3) {
        case 0: return () => { const v = r[a]; r[d] = ((v & 0xFF) << 24) | ((v & 0xFF00) << 8) | ((v >>> 8) & 0xFF00) | (v >>> 24); };
        case 1: return () => { const v = r[a]; r[d] = ((v & 0xFF00FF) << 8) | ((v >>> 8) & 0xFF00FF); };
        case 3: return () => { const v = r[a]; r[d] = (((v & 0xFF) << 24) >> 16) | ((v >>> 8) & 0xFF); };
      }
      return undef(h);
    }
    if (op === 14) { const kod = h & 0xFF; return () => { halted = { kind: 'bkpt', pc: PC, code: kod }; limit = 0; }; }
    if (op === 15) {
      const mask = h & 15;
      if (mask !== 0) { const val = h & 0xFF; return () => { IT = val; }; }
      switch ((h >> 4) & 15) {
        case 1: return () => {}; // YIELD
        case 2: return () => { if (!sevFlag) { sleeping = true; limit = 0; } sevFlag = false; }; // WFE
        case 3: return () => { sleeping = true; limit = 0; }; // WFI
        case 4: return () => { sevFlag = true; }; // SEV
        default: return () => {};
      }
    }
    return undef(h);
  }

  function dpOp(op, s, d, n, g, h) {
    const nz = (v) => { N = v < 0 ? 1 : 0; Z = v === 0 ? 1 : 0; };
    switch (op) {
      case 0: return s ? () => { const v = r[n] & g(); r[d] = v; nz(v); C = SC; } : () => { r[d] = r[n] & g(); };
      case 1: return s ? () => { const v = r[n] & ~g(); r[d] = v; nz(v); C = SC; } : () => { r[d] = r[n] & ~g(); };
      case 2: return s ? () => { const v = r[n] | g(); r[d] = v; nz(v); C = SC; } : () => { r[d] = r[n] | g(); };
      case 3: return s ? () => { const v = r[n] | ~g(); r[d] = v; nz(v); C = SC; } : () => { r[d] = r[n] | ~g(); };
      case 4: return s ? () => { const v = r[n] ^ g(); r[d] = v; nz(v); C = SC; } : () => { r[d] = r[n] ^ g(); };
      case 8: return s ? () => { r[d] = addc(r[n], g(), 0); } : () => { r[d] = r[n] + g(); };
      case 10: return s ? () => { r[d] = addc(r[n], g(), C); } : () => { r[d] = r[n] + g() + C; };
      case 11: return s ? () => { r[d] = addc(r[n], ~g(), C); } : () => { r[d] = r[n] + ~g() + C; };
      case 13: return s ? () => { r[d] = addc(r[n], ~g(), 1); } : () => { r[d] = r[n] - g(); };
      case 14: return s ? () => { r[d] = addc(~r[n], g(), 1); } : () => { r[d] = g() - r[n]; };
    }
    return undef(h);
  }
  function thumbExpand(i) { // trả về [giá trị, carry | -1 = giữ nguyên]
    if ((i >>> 10) === 0) {
      const v = i & 0xFF;
      switch ((i >>> 8) & 3) {
        case 0: return [v, -1];
        case 1: return [(v << 16) | v, -1];
        case 2: return [(v << 24) | (v << 8), -1];
        default: return [(v << 24) | (v << 16) | (v << 8) | v, -1];
      }
    }
    const un = 0x80 | (i & 0x7F), rot = (i >>> 7) & 31;
    const val = (un >>> rot) | (un << (32 - rot));
    return [val, val >>> 31];
  }

  function decode32(h1, h2, inIT, pc) {
    dLen = 4; dCost = 1;
    const op1 = (h1 >>> 11) & 3, op2 = (h1 >>> 4) & 0x7F, op = h2 >>> 15;
    const rn = h1 & 15, rt = h2 >>> 12, rd = (h2 >>> 8) & 15, rm = h2 & 15;
    const code = ((h1 << 16) | h2) >>> 0;
    if (op1 === 1) {
      if ((op2 & 0x64) === 0) { // LDM/STM
        const t = (h1 >>> 7) & 3, L = (h1 >>> 4) & 1, W = (h1 >>> 5) & 1, list = h2 & 0xDFFF & (L ? 0xFFFF : 0x5FFF);
        dCost = 1 + popcnt(list);
        if (t === 1) return L ? () => ldmIA(rn, list, W === 1) : () => stmIA(rn, list, W === 1);
        if (t === 2) return L ? () => ldmDB(rn, list, W === 1) : () => stmDB(rn, list, W === 1);
        return undef(code);
      }
      if ((op2 & 0x64) === 4) { // Dual / exclusive / TBB
        const o1 = (h1 >>> 7) & 3, o2 = (h1 >>> 4) & 3, o3 = (h2 >>> 4) & 15;
        if (o1 === 0 && o2 === 0) { const imm = (h2 & 0xFF) * 4, td = rd; dCost = 2; return () => { const a = r[rn] + imm; if (exclusive) { wr32(a, r[rt]); r[td] = 0; exclusive = false; } else r[td] = 1; }; }
        if (o1 === 0 && o2 === 1) { const imm = (h2 & 0xFF) * 4; dCost = 2; return () => { r[rt] = rd32(r[rn] + imm); exclusive = true; }; }
        if (o1 === 1 && o2 === 1) {
          if (o3 === 0) { dCost = 4; return () => { NPC = (r[15] + 2 * rdU8(r[rn] + r[rm])) >>> 0; }; }
          if (o3 === 1) { dCost = 4; return () => { NPC = (r[15] + 2 * rdU16(r[rn] + r[rm] * 2)) >>> 0; }; }
          if (o3 === 4) { dCost = 2; return () => { r[rt] = rdU8(r[rn]); exclusive = true; }; }
          if (o3 === 5) { dCost = 2; return () => { r[rt] = rdU16(r[rn]); exclusive = true; }; }
        }
        if (o1 === 1 && o2 === 0) {
          const td = rm;
          if (o3 === 4) { dCost = 2; return () => { if (exclusive) { wr8(r[rn], r[rt]); r[td] = 0; exclusive = false; } else r[td] = 1; }; }
          if (o3 === 5) { dCost = 2; return () => { if (exclusive) { wr16(r[rn], r[rt]); r[td] = 0; exclusive = false; } else r[td] = 1; }; }
        }
        // LDRD/STRD
        const P = (h1 >>> 8) & 1, U = (h1 >>> 7) & 1, W = (h1 >>> 5) & 1, L = (h1 >>> 4) & 1, imm = (h2 & 0xFF) * 4, t2 = rd;
        if (!P && !W) return undef(code);
        dCost = 3;
        const off = U ? imm : -imm;
        if (L) return () => {
          const base = rn === 15 ? (r[15] & ~3) : r[rn], ad = P ? base + off : base;
          const v1 = rd32(ad), v2 = rd32(ad + 4); r[rt] = v1; r[t2] = v2; if (W) r[rn] = base + off;
        };
        return () => {
          const base = r[rn], ad = P ? base + off : base;
          wr32(ad, r[rt]); wr32(ad + 4, r[t2]); if (W) r[rn] = base + off;
        };
      }
      if ((op2 & 0x60) === 0x20) { // Data-processing shifted register
        const o = (h1 >>> 5) & 15, s = (h1 >>> 4) & 1;
        const im = ((h2 >>> 12) & 7) << 2 | ((h2 >>> 6) & 3), t = (h2 >>> 4) & 3;
        let g;
        if (t === 0 && im === 0) g = () => { SC = C; return r[rm]; };
        else if (t === 3 && im === 0) g = () => shf(r[rm], 4, 1);
        else { const n = ((t === 1 || t === 2) && im === 0) ? 32 : im; g = () => shf(r[rm], t, n); }
        if (rd === 15 && s) {
          switch (o) { // TST TEQ CMN CMP
            case 0: return dpOp(0, 1, 16, rn, g, code);
            case 4: return dpOp(4, 1, 16, rn, g, code);
            case 8: return dpOp(8, 1, 16, rn, g, code);
            case 13: return dpOp(13, 1, 16, rn, g, code);
          }
        }
        if (rn === 15) {
          if (o === 2) { // MOV & shifts
            return s ? () => { const v = g(); r[rd] = v; N = v < 0 ? 1 : 0; Z = v === 0 ? 1 : 0; C = SC; } : () => { r[rd] = g(); };
          }
          if (o === 3) return s ? () => { const v = ~g(); r[rd] = v; N = v < 0 ? 1 : 0; Z = v === 0 ? 1 : 0; C = SC; } : () => { r[rd] = ~g(); };
        }
        return dpOp(o, s, rd, rn, g, code);
      }
      return undef(code); // coprocessor
    }
    if (op1 === 2) {
      if (op === 0) {
        const i = (h1 >>> 10) & 1, imm3 = (h2 >>> 12) & 7, imm8 = h2 & 0xFF;
        if (!(op2 & 0x20)) { // modified immediate
          const o = (h1 >>> 5) & 15, s = (h1 >>> 4) & 1;
          const [val, car] = thumbExpand((i << 11) | (imm3 << 8) | imm8);
          const g = car < 0 ? () => { SC = C; return val; } : () => { SC = car; return val; };
          if (rd === 15 && s) {
            switch (o) { case 0: return dpOp(0, 1, 16, rn, g, code); case 4: return dpOp(4, 1, 16, rn, g, code); case 8: return dpOp(8, 1, 16, rn, g, code); case 13: return dpOp(13, 1, 16, rn, g, code); }
          }
          if (rn === 15) {
            if (o === 2) return s ? () => { r[rd] = val; N = val < 0 ? 1 : 0; Z = val === 0 ? 1 : 0; if (car >= 0) C = car; } : () => { r[rd] = val; };
            if (o === 3) { const nv = ~val; return s ? () => { r[rd] = nv; N = nv < 0 ? 1 : 0; Z = nv === 0 ? 1 : 0; if (car >= 0) C = car; } : () => { r[rd] = nv; }; }
          }
          return dpOp(o, s, rd, rn, g, code);
        }
        // plain binary immediate
        const o = (h1 >>> 4) & 31;
        const imm12 = (i << 11) | (imm3 << 8) | imm8;
        switch (o) {
          case 0: return rn === 15 ? () => { r[rd] = (r[15] & ~3) + imm12; } : () => { r[rd] = r[rn] + imm12; };
          case 4: { const v = ((h1 & 15) << 12) | (i << 11) | (imm3 << 8) | imm8; return () => { r[rd] = v; }; }
          case 10: return rn === 15 ? () => { r[rd] = (r[15] & ~3) - imm12; } : () => { r[rd] = r[rn] - imm12; };
          case 12: { const v = ((h1 & 15) << 12) | (i << 11) | (imm3 << 8) | imm8; return () => { r[rd] = (r[rd] & 0xFFFF) | (v << 16); }; }
          case 16: case 18: { // SSAT
            const im = (imm3 << 2) | ((h2 >>> 6) & 3), shT = (h1 >>> 5) & 1 ? 2 : 0, w = (h2 & 31) + 1;
            const lo = -Math.pow(2, w - 1), hi = Math.pow(2, w - 1) - 1;
            return () => { let v = r[rn]; v = shT === 2 ? v >> (im || 31) : v << im; if (v < lo) { v = lo; Q = 1; } else if (v > hi) { v = hi; Q = 1; } r[rd] = v; };
          }
          case 24: case 26: { // USAT
            const im = (imm3 << 2) | ((h2 >>> 6) & 3), shT = (h1 >>> 5) & 1 ? 2 : 0, w = h2 & 31, hi = Math.pow(2, w) - 1;
            return () => { let v = r[rn]; v = shT === 2 ? v >> (im || 31) : v << im; if (v < 0) { v = 0; Q = 1; } else if (v > hi) { v = hi; Q = 1; } r[rd] = v; };
          }
          case 20: { const lsb = (imm3 << 2) | ((h2 >>> 6) & 3), w = (h2 & 31) + 1, sh = 32 - w; return () => { r[rd] = (r[rn] >>> lsb) << sh >> sh; }; } // SBFX
          case 28: { const lsb = (imm3 << 2) | ((h2 >>> 6) & 3), w = (h2 & 31) + 1, mask = w === 32 ? -1 : (1 << w) - 1; return () => { r[rd] = (r[rn] >>> lsb) & mask; }; } // UBFX
          case 22: { // BFI/BFC
            const lsb = (imm3 << 2) | ((h2 >>> 6) & 3), msb = h2 & 31, w = msb - lsb + 1;
            const mask = (w === 32 ? -1 : ((1 << w) - 1)) << lsb;
            if (rn === 15) return () => { r[rd] &= ~mask; };
            return () => { r[rd] = (r[rd] & ~mask) | ((r[rn] << lsb) & mask); };
          }
        }
        return undef(code);
      }
      // Branches & misc
      const o1 = (h2 >>> 12) & 7;
      if ((o1 & 5) === 0) {
        const c = (h1 >>> 6) & 15;
        if ((c & 14) !== 14) { // B<c>.W
          const S = (h1 >>> 10) & 1, J1 = (h2 >>> 13) & 1, J2 = (h2 >>> 11) & 1;
          const off = sx((S << 20) | (J2 << 19) | (J1 << 18) | ((h1 & 0x3F) << 12) | ((h2 & 0x7FF) << 1), 21);
          const tgt = (pc + 4 + off) >>> 0;
          return () => { if (cond(c)) { NPC = tgt; cyc += 2; } };
        }
        // Misc control
        const o = (h1 >>> 4) & 0x7F;
        if (o === 0x38 || o === 0x39) { // MSR
          const sys = h2 & 0xFF, mask = (h2 >>> 10) & 3, n = rn;
          return () => writeSys(sys, r[n], mask);
        }
        if (o === 0x3A) { // hints
          const hint = h2 & 0xFF;
          if (hint === 3) return () => { sleeping = true; limit = 0; };
          if (hint === 2) return () => { if (!sevFlag) { sleeping = true; limit = 0; } sevFlag = false; };
          if (hint === 4) return () => { sevFlag = true; };
          return () => {};
        }
        if (o === 0x3B) { if (((h2 >>> 4) & 15) === 2) return () => { exclusive = false; }; return () => {}; } // DMB DSB ISB CLREX
        if (o === 0x3E || o === 0x3F) { const sys = h2 & 0xFF, d0 = rd; return () => { r[d0] = readSys(sys); }; } // MRS
        if (o === 0x7F) return undef(code);
        return undef(code);
      }
      if ((o1 & 5) === 1 || (o1 & 5) === 5) {
        const S = (h1 >>> 10) & 1, J1 = (h2 >>> 13) & 1, J2 = (h2 >>> 11) & 1, I1 = (J1 ^ S) ^ 1, I2 = (J2 ^ S) ^ 1;
        const off = sx((S << 24) | (I1 << 23) | (I2 << 22) | ((h1 & 0x3FF) << 12) | ((h2 & 0x7FF) << 1), 25);
        const tgt = (pc + 4 + off) >>> 0;
        if ((o1 & 5) === 1) { dCost = 3; return () => { NPC = tgt; }; } // B.W
        if (o1 & 1) { dCost = 3; const ret = (pc + 4) | 1; return () => { r[14] = ret; NPC = tgt; }; } // BL
      }
      return undef(code);
    }
    // op1 === 3
    if ((op2 & 0x71) === 0 || (op2 & 0x71) === 0x10) return decodeStore(h1, h2, code);
    if ((op2 & 0x67) === 1 || (op2 & 0x67) === 3 || (op2 & 0x67) === 5) return decodeLoad(h1, h2, code);
    if ((op2 & 0x70) === 0x20) return decodeDpReg(h1, h2, code);
    if ((op2 & 0x78) === 0x30) { // MUL/MLA/MLS
      const o = (h1 >>> 4) & 7, o2 = (h2 >>> 4) & 15, ra = rt;
      if (o === 0) {
        if (o2 === 0) return ra === 15 ? () => { r[rd] = Math.imul(r[rn], r[rm]); } : () => { r[rd] = (Math.imul(r[rn], r[rm]) + r[ra]) | 0; };
        if (o2 === 1) return () => { r[rd] = (r[ra] - Math.imul(r[rn], r[rm])) | 0; };
      }
      return undef(code);
    }
    if ((op2 & 0x78) === 0x38) { // Long mul / div
      const o = (h1 >>> 4) & 7, o2 = (h2 >>> 4) & 15, lo = rt, hi = rd;
      if (o === 0 && o2 === 0) { dCost = 3; return () => { const v = BigInt.asIntN(64, BigInt(r[rn]) * BigInt(r[rm])); r[lo] = Number(BigInt.asIntN(32, v)); r[hi] = Number(v >> 32n); }; }
      if (o === 2 && o2 === 0) { dCost = 3; return () => { umul(r[rn], r[rm], lo, hi); }; }
      if (o === 1 && o2 === 15) { dCost = 4; return () => { const b = r[rm]; if (b === 0) { if (scbCCR & 16) throw new Fault('div0', 0); r[rd] = 0; } else { const a = r[rn]; r[rd] = (a === -2147483648 && b === -1) ? a : (a / b) | 0; } }; }
      if (o === 3 && o2 === 15) { dCost = 4; return () => { const b = r[rm] >>> 0; if (b === 0) { if (scbCCR & 16) throw new Fault('div0', 0); r[rd] = 0; } else r[rd] = Math.floor((r[rn] >>> 0) / b) | 0; }; }
      if (o === 4 && o2 === 0) { dCost = 4; return () => { const v = BigInt.asIntN(64, (BigInt(r[hi]) << 32n) + BigInt(r[lo] >>> 0)) + BigInt(r[rn]) * BigInt(r[rm]); r[lo] = Number(BigInt.asIntN(32, v)); r[hi] = Number(BigInt.asIntN(32, v >> 32n)); }; }
      if (o === 6 && o2 === 0) { dCost = 4; return () => { const v = (BigInt(r[hi] >>> 0) << 32n) + BigInt(r[lo] >>> 0) + BigInt(r[rn] >>> 0) * BigInt(r[rm] >>> 0); r[lo] = Number(BigInt.asIntN(32, v)); r[hi] = Number(BigInt.asIntN(32, v >> 32n)); }; }
      return undef(code);
    }
    return undef(code);
  }
  function umul(a, b, lo, hi) {
    const ua = a >>> 0, ub = b >>> 0;
    const a0 = ua & 0xFFFF, a1 = ua >>> 16, b0 = ub & 0xFFFF, b1 = ub >>> 16;
    const p00 = a0 * b0, p01 = a0 * b1, p10 = a1 * b0, p11 = a1 * b1;
    const mid = p01 + p10 + Math.floor(p00 / 65536);
    r[lo] = Math.imul(a, b);
    r[hi] = (p11 + Math.floor(mid / 65536)) | 0;
  }
  function decodeStore(h1, h2, code) {
    const sz = (h1 >>> 5) & 3, rn = h1 & 15, rt = h2 >>> 12;
    dCost = 2;
    const w = sz === 0 ? wr8 : sz === 1 ? wr16 : wr32;
    if (rn === 15) return undef(code);
    if (h1 & 0x80) { const off = h2 & 0xFFF; return () => { w(r[rn] + off, r[rt]); }; }
    if (h2 & 0x800) {
      const P = (h2 >>> 10) & 1, U = (h2 >>> 9) & 1, W = (h2 >>> 8) & 1, off = (h2 & 0xFF) * (U ? 1 : -1);
      return () => { const b = r[rn], a = P ? b + off : b; w(a, r[rt]); if (W) r[rn] = b + off; };
    }
    const sh = (h2 >>> 4) & 3, rm = h2 & 15;
    return () => { w(r[rn] + (r[rm] << sh), r[rt]); };
  }
  function decodeLoad(h1, h2, code) {
    const sz = (h1 >>> 5) & 3, sgn = (h1 >>> 8) & 1, rn = h1 & 15, rt = h2 >>> 12;
    dCost = 2;
    let rf;
    if (sz === 0) rf = sgn ? (a) => sx(rdU8(a), 8) : rdU8;
    else if (sz === 1) rf = sgn ? (a) => sx(rdU16(a), 16) : rdU16;
    else rf = rd32;
    const toPC = rt === 15;
    if (rt === 15 && sz !== 2) return () => {}; // PLD/ PLI
    if (rn === 15) {
      const off = (h2 & 0xFFF) * ((h1 & 0x80) ? 1 : -1);
      return toPC ? () => { bxTo(rf(((r[15] & ~3) + off) >>> 0)); } : () => { r[rt] = rf(((r[15] & ~3) + off) >>> 0); };
    }
    if (h1 & 0x80) { const off = h2 & 0xFFF; return toPC ? () => { bxTo(rf(r[rn] + off)); } : () => { r[rt] = rf(r[rn] + off); }; }
    if (h2 & 0x800) {
      const P = (h2 >>> 10) & 1, U = (h2 >>> 9) & 1, W = (h2 >>> 8) & 1, off = (h2 & 0xFF) * (U ? 1 : -1);
      return () => {
        const b = r[rn], a = P ? b + off : b, v = rf(a);
        if (W) r[rn] = b + off;
        if (toPC) bxTo(v); else r[rt] = v;
      };
    }
    const sh = (h2 >>> 4) & 3, rm = h2 & 15;
    return toPC ? () => { bxTo(rf(r[rn] + (r[rm] << sh))); } : () => { r[rt] = rf(r[rn] + (r[rm] << sh)); };
  }
  function decodeDpReg(h1, h2, code) {
    const o1 = (h1 >>> 4) & 15, o2 = (h2 >>> 4) & 15, rn = h1 & 15, rd = (h2 >>> 8) & 15, rm = h2 & 15;
    const nz = (v) => { N = v < 0 ? 1 : 0; Z = v === 0 ? 1 : 0; };
    if ((o1 & 8) === 0 && (o2 & 8) === 0 && o2 === 0) { // Shift register
      const t = (o1 >>> 1) & 3, s = o1 & 1;
      return s ? () => { const v = shf(r[rn], t, r[rm] & 0xFF); r[rd] = v; nz(v); C = SC; } : () => { r[rd] = shf(r[rn], t, r[rm] & 0xFF); };
    }
    if ((o1 & 8) === 0 && (o2 & 8) !== 0) { // Extend
      const rot = ((h2 >>> 4) & 3) * 8, kind = o1;
      const rv = rot === 0 ? (v) => v : (v) => (v >>> rot) | (v << (32 - rot));
      const add = rn !== 15;
      switch (kind) {
        case 0: return add ? () => { r[rd] = r[rn] + ((rv(r[rm]) << 16) >> 16); } : () => { r[rd] = (rv(r[rm]) << 16) >> 16; };
        case 1: return add ? () => { r[rd] = r[rn] + (rv(r[rm]) & 0xFFFF); } : () => { r[rd] = rv(r[rm]) & 0xFFFF; };
        case 4: return add ? () => { r[rd] = r[rn] + ((rv(r[rm]) << 24) >> 24); } : () => { r[rd] = (rv(r[rm]) << 24) >> 24; };
        case 5: return add ? () => { r[rd] = r[rn] + (rv(r[rm]) & 0xFF); } : () => { r[rd] = rv(r[rm]) & 0xFF; };
      }
      return undef(code);
    }
    if (o1 === 9 && (o2 >>> 2) === 2) { // REV, REV16, RBIT, REVSH
      switch (o2 & 3) {
        case 0: return () => { const v = r[rn]; r[rd] = ((v & 0xFF) << 24) | ((v & 0xFF00) << 8) | ((v >>> 8) & 0xFF00) | (v >>> 24); };
        case 1: return () => { const v = r[rn]; r[rd] = ((v & 0xFF00FF) << 8) | ((v >>> 8) & 0xFF00FF); };
        case 2: return () => { let v = r[rn] >>> 0, x = 0; for (let i = 0; i < 32; i++) { x = (x << 1) | (v & 1); v >>>= 1; } r[rd] = x; };
        default: return () => { const v = r[rn]; r[rd] = (((v & 0xFF) << 24) >> 16) | ((v >>> 8) & 0xFF); };
      }
    }
    if (o1 === 11 && o2 === 8) return () => { r[rd] = Math.clz32(r[rn]); }; // CLZ
    return undef(code);
  }
  function readSys(s) {
    switch (s) {
      case 0: return ((N << 31) | (Z << 30) | (C << 29) | (V << 28) | (Q << 27));
      case 1: case 5: return IPSR;
      case 2: return 0;
      case 3: return ((N << 31) | (Z << 30) | (C << 29) | (V << 28) | (Q << 27)) | IPSR;
      case 6: case 7: return IPSR;
      case 8: return (IPSR === 0 && (ctrl & 2)) ? spOther : r[13];
      case 9: return (IPSR === 0 && (ctrl & 2)) ? r[13] : spOther;
      case 16: return primask;
      case 17: case 18: return basepri;
      case 19: return faultmask;
      case 20: return ctrl;
    }
    return 0;
  }
  function writeSys(s, v, mask) {
    switch (s) {
      case 0: case 1: case 2: case 3:
        if (mask & 2) { N = (v >>> 31) & 1; Z = (v >>> 30) & 1; C = (v >>> 29) & 1; V = (v >>> 28) & 1; Q = (v >>> 27) & 1; }
        break;
      case 8: if (IPSR === 0 && (ctrl & 2)) spOther = v & ~3; else r[13] = v & ~3; break;
      case 9: if (IPSR === 0 && (ctrl & 2)) r[13] = v & ~3; else spOther = v & ~3; break;
      case 16: primask = v & 1; limit = 0; break;
      case 17: basepri = v & 0xF0; limit = 0; break;
      case 18: { const nv = v & 0xF0; if (nv !== 0 && (nv < basepri || basepri === 0)) basepri = nv; limit = 0; break; }
      case 19: faultmask = v & 1; limit = 0; break;
      case 20: {
        const np = v & 2; const was = ctrl & 2;
        if (IPSR === 0 && np !== was) { const t = r[13]; r[13] = spOther; spOther = t; }
        ctrl = np | (v & 1); break;
      }
    }
  }

  function decodeAt(pc, inIT) {
    const h = rdU16(pc);
    let f;
    if ((h >>> 11) >= 0x1D) {
      const h2 = rdU16(pc + 2);
      f = decode32(h, h2, inIT, pc);
      // Ghi trực tiếp vào PC của các lệnh xử lý dữ liệu 32 bit không xuất hiện trong code thường
    } else f = decode16(h, inIT, pc);
    return f;
  }

  // ==== Vòng lặp chính ====
  function runUntil(target) {
    if (halted) return;
    while (cyc < target) {
      if (resetRequested) { checkInterrupts(); continue; }
      checkInterruptsSafe();
      if (halted) return;
      if (sleeping) {
        const nx = nextEvent();
        cyc = Math.min(target, Math.max(cyc + 1, nx));
        syncAll();
        continue;
      }
      limit = Math.min(target, nextEvent());
      if (limit <= cyc) { syncAll(); limit = Math.min(target, cyc + 16); }
      try {
        while (cyc < limit) {
          const pc = PC, i = (pc - FLASH_BASE) >>> 1;
          let fn, l, co;
          if (i < 65536) {
            fn = fns[i];
            if (fn === undefined) { fn = decodeAt(pc, IT !== 0); fns[i] = fn; lens[i] = dLen; costs[i] = dCost; }
            l = lens[i]; co = costs[i];
          } else { fn = decodeAt(pc, IT !== 0); l = dLen; co = dCost; }
          r[15] = pc + 4; NPC = pc + l;
          if (IT !== 0) {
            const c = IT >>> 4;
            IT = (IT & 7) === 0 ? 0 : (IT & 0xE0) | ((IT << 1) & 0x1F);
            if (!cond(c)) { PC = NPC; cyc += 1; continue; }
          }
          fn();
          PC = NPC; cyc += co;
        }
      } catch (e) {
        if (e instanceof Fault) fault(e); else if (e === BAD) { /* */ } else throw e;
      }
      syncAll();
      if (halted) return;
    }
    syncAll();
  }
  const BAD = {};
  function checkInterruptsSafe() {
    try { checkInterrupts(); } catch (e) { if (e instanceof Fault) fault(e); else throw e; }
  }
  function reset(clearRam) {
    r.fill(0); N = Z = C = V = Q = 0; IT = 0; IPSR = 0; ctrl = 0; primask = 0; faultmask = 0; basepri = 0; spOther = 0;
    sleeping = false; halted = null; sevFlag = false; exclusive = false; resetRequested = false;
    pend.fill(0); active.fill(0); prio.fill(0); enabled.fill(0); lines.fill(0); pendAny = 0; prigroup = 0; VTOR = 0; scbCCR = 0x200; scbSCR = 0; cfsr = 0; hfsr = 0; bfar = 0; mmfar = 0; shcsr = 0;
    rcc.cr = 0x83; rcc.cfgr = 0; rcc.cir = 0; rcc.apb2en = 0; rcc.apb1en = 0; rcc.ahben = 0x14; rcc.bdcr = 0; rcc.csr = 0x0C000000; rcc.apb2rst = 0; rcc.apb1rst = 0;
    flashACR = 0x30; baseTime = 0; baseCyc = cyc = 0; sysclk = hclk = pclk1 = pclk2 = 8e6;
    for (const g of gpios) { g.reset(); g.levels = 0; }
    afio.evcr = 0; afio.mapr = 0; afio.exticr = [0, 0, 0, 0]; exti.imr = exti.emr = exti.rtsr = exti.ftsr = exti.pr = 0;
    stCtrl = stLoad = stVal = stFlag = stAcc = 0; stLast = 0;
    for (const t of tims) { t.reset(); t.updateRatio(); }
    for (const u of usarts) { u.reset(); u.rxq.length = 0; }
    adc.reset(); storage.clear(); warned.clear();
    if (clearRam) ramB.fill(0);
    for (const g of gpios) g.levels = g.idr();
    r[13] = rd32(0) & ~3; PC = (rd32(4) & ~1) >>> 0;
    if (hooks.reset) hooks.reset();
  }

  function loadImage(segs) { // segs: [{addr, data}]
    flashB.fill(0xFF); fns.fill(undefined);
    for (const s of segs) {
      let a = s.addr;
      if (a >= RAM_BASE && a < RAM_END) continue;
      if (a >= FLASH_BASE && a + s.data.length <= FLASH_END) flashB.set(s.data, a - FLASH_BASE);
      else if (a < FLASH_SIZE && a + s.data.length <= FLASH_SIZE) flashB.set(s.data, a);
      else throw new Error(`Đoạn dữ liệu tại ${hex(a)} (${s.data.length} byte) nằm ngoài flash 128 KB của STM32F103RB.`);
    }
    const sp = flash.getUint32(0, true), rv = flash.getUint32(4, true);
    if (sp === 0xFFFFFFFF || rv === 0xFFFFFFFF) throw new Error('Không tìm thấy bảng vector tại đầu flash (0x08000000).');
    if (sp > RAM_END || sp < RAM_BASE) throw new Error(`Con trỏ ngăn xếp ban đầu ${hex(sp)} nằm ngoài RAM 20 KB. File này có thể được build cho chip khác, không phải STM32F103RB.`);
    if (!(rv & 1) || (rv & ~1) >>> 0 < FLASH_BASE || (rv & ~1) >>> 0 >= FLASH_END) throw new Error(`Địa chỉ reset ${hex(rv)} không hợp lệ cho STM32F103RB.`);
    reset(true);
  }

  return {
    loadImage, reset: () => reset(false), runUntil,
    run(seconds) { // chạy theo thời gian mô phỏng (đúng cả khi firmware đổi tần số xung)
      const end = simTime() + seconds;
      while (!halted) {
        const rem = end - simTime();
        if (rem <= 0) break;
        runUntil(cyc + Math.max(1, Math.ceil(rem * hclk)));
      }
    },
    step() {
      if (halted) return;
      const t = cyc + 1; let n = 0;
      runUntil(t);
      void n;
    },
    get cycles() { return cyc; }, get hclk() { return hclk; }, get sysclk() { return sysclk; }, get pclk1() { return pclk1; }, get pclk2() { return pclk2; },
    get pc() { return PC; }, get halted() { return halted; }, get sleeping() { return sleeping; }, get ipsr() { return IPSR; },
    get time() { return simTime(); },
    regs: r, gpios, usarts, tims, adc, hex, TIMPINS,
    flags() { return { N, Z, C, V, Q }; },
    xpsr: makeXPSR,
    msp() { return readSys(8); }, psp() { return readSys(9); },
    setInput(port, pin, level) { const g = gpios[port]; g.ext[pin] = level; syncAll(); g.update(); limit = 0; },
    setAnalog(ch, v) { adc.inputs[ch] = v; },
    uartSend(i, bytes) { syncAll(); for (const b of bytes) usarts[i].inject(b); },
    read32: (a) => rd32(a) >>> 0, read8: rdU8,
    rcc, exti,
    faultInfo() { return { cfsr, hfsr, bfar }; },
    allPwm() { const o = []; for (const t of tims) if (t.on()) o.push(...t.pwm()); return o; },
    syncAll,
  };
}

// ==== Đọc file firmware ====
function parseFirmware(buf, name) {
  const u8 = new Uint8Array(buf);
  if (u8[0] === 0x7F && u8[1] === 0x45 && u8[2] === 0x4C && u8[3] === 0x46) return parseELF(u8);
  if (u8[0] === 0x3A) return parseHEX(new TextDecoder().decode(u8));
  if (/\.bin$/i.test(name || '')) return { segs: [{ addr: 0x08000000, data: u8.slice() }], syms: [], entry: 0 };
  throw new Error('Không nhận dạng được file. Hãy chọn file .elf, .hex hoặc .bin trong thư mục Debug của project.');
}
function parseELF(u8) {
  const dv = new DataView(u8.buffer, u8.byteOffset, u8.byteLength);
  if (u8[4] !== 1 || u8[5] !== 1) throw new Error('Đây không phải file ELF 32 bit little-endian.');
  if (dv.getUint16(18, true) !== 40) throw new Error('File ELF này không dành cho vi điều khiển ARM.');
  const phoff = dv.getUint32(28, true), shoff = dv.getUint32(32, true), phes = dv.getUint16(42, true), phn = dv.getUint16(44, true), shes = dv.getUint16(46, true), shn = dv.getUint16(48, true), eflags = dv.getUint32(36, true);
  const segs = [];
  for (let i = 0; i < phn; i++) {
    const o = phoff + i * phes;
    if (dv.getUint32(o, true) !== 1) continue;
    const off = dv.getUint32(o + 4, true), paddr = dv.getUint32(o + 12, true), fsz = dv.getUint32(o + 16, true);
    if (fsz === 0) continue;
    segs.push({ addr: paddr, data: u8.slice(off, off + fsz) });
  }
  const syms = [];
  for (let i = 0; i < shn; i++) {
    const o = shoff + i * shes;
    if (dv.getUint32(o + 4, true) !== 2) continue;
    const off = dv.getUint32(o + 16, true), sz = dv.getUint32(o + 20, true), link = dv.getUint32(o + 24, true);
    const so = shoff + link * shes, stroff = dv.getUint32(so + 16, true);
    for (let p = off; p + 16 <= off + sz; p += 16) {
      const nmo = dv.getUint32(p, true), val = dv.getUint32(p + 4, true), size = dv.getUint32(p + 8, true), info = u8[p + 12];
      if ((info & 15) !== 2) continue;
      let e = stroff + nmo, s = '';
      while (u8[e]) s += String.fromCharCode(u8[e++]);
      if (s) syms.push({ addr: (val & ~1) >>> 0, size, name: s });
    }
  }
  syms.sort((a, b) => a.addr - b.addr);
  return { segs, syms, eflags };
}
function parseHEX(txt) {
  const map = new Map(); let base = 0;
  for (const line of txt.split(/\r?\n/)) {
    if (!line.startsWith(':')) continue;
    const n = parseInt(line.substr(1, 2), 16), ad = parseInt(line.substr(3, 4), 16), t = parseInt(line.substr(7, 2), 16);
    if (t === 4) base = parseInt(line.substr(9, 4), 16) * 65536;
    else if (t === 2) base = parseInt(line.substr(9, 4), 16) * 16;
    else if (t === 0) for (let i = 0; i < n; i++) map.set(base + ad + i, parseInt(line.substr(9 + i * 2, 2), 16));
  }
  const keys = [...map.keys()].sort((a, b) => a - b), segs = [];
  let i = 0;
  while (i < keys.length) {
    let j = i; while (j + 1 < keys.length && keys[j + 1] === keys[j] + 1) j++;
    const data = new Uint8Array(j - i + 1); for (let k = i; k <= j; k++) data[k - i] = map.get(keys[k]);
    segs.push({ addr: keys[i], data }); i = j + 1;
  }
  return { segs, syms: [] };
}
function symbolAt(syms, pc) {
  let lo = 0, hi = syms.length - 1, best = null;
  while (lo <= hi) { const m = (lo + hi) >> 1; if (syms[m].addr <= pc) { best = syms[m]; lo = m + 1; } else hi = m - 1; }
  if (best && (best.size === 0 || pc < best.addr + best.size)) return best.name;
  return best && pc - best.addr < 256 ? best.name : null;
}
if (typeof module !== 'undefined') module.exports = { createMCU, parseFirmware, symbolAt };
