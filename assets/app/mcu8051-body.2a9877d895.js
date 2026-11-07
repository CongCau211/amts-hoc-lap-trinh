/* ===================== trình mô phỏng của khóa (platform/js/51-mcu51-isa.js) ===================== */
/* ===================== Trình mô phỏng 8051 (khóa mcu8051) · 1/4: bảng lệnh và tên SFR =====================
   Chỉ tải trên trang khóa mcu8051 (build.py). Dùng chung cho trình dịch (52), máy giả lập (53) và giao diện (54).
   Tài liệu: docs/TRINH-MO-PHONG-8051.md. Bộ đối chiếu với sdas8051 / ucsim s51: tools/mcu51-test/.
   OPS[mã lệnh] = {m: tên lệnh, a: [kiểu toán hạng], n: số byte, c: số chu kỳ máy}
   Kiểu toán hạng: A AB C DPTR @DPTR @A+DPTR @A+PC Rn(R0..R7) @Ri(@R0,@R1) #d8 #d16 dir bit /bit rel a11 a16 */
const MCU51ISA=(function(){
  const OPS=new Array(256).fill(null);
  const D=(op,m,a,n,c)=>{OPS[op]={op,m,a,n,c}};
  const R=i=>"R"+i,AT=i=>"@R"+i;
  /* nhóm tính toán A với 4 dạng nguồn: #data, direct, @Ri, Rn */
  const ALU=(base,m)=>{D(base+4,m,["A","#d8"],2,1);D(base+5,m,["A","dir"],2,1);D(base+6,m,["A","@R0"],1,1);D(base+7,m,["A","@R1"],1,1);
    for(let i=0;i<8;i++)D(base+8+i,m,["A",R(i)],1,1)};
  for(let p=0;p<8;p++){D(p*32+1,"AJMP",["a11"],2,2);D(p*32+17,"ACALL",["a11"],2,2)}
  D(0x00,"NOP",[],1,1);D(0x02,"LJMP",["a16"],3,2);D(0x03,"RR",["A"],1,1);D(0x04,"INC",["A"],1,1);D(0x05,"INC",["dir"],2,1);
  D(0x06,"INC",["@R0"],1,1);D(0x07,"INC",["@R1"],1,1);for(let i=0;i<8;i++)D(0x08+i,"INC",[R(i)],1,1);
  D(0x10,"JBC",["bit","rel"],3,2);D(0x12,"LCALL",["a16"],3,2);D(0x13,"RRC",["A"],1,1);D(0x14,"DEC",["A"],1,1);D(0x15,"DEC",["dir"],2,1);
  D(0x16,"DEC",["@R0"],1,1);D(0x17,"DEC",["@R1"],1,1);for(let i=0;i<8;i++)D(0x18+i,"DEC",[R(i)],1,1);
  D(0x20,"JB",["bit","rel"],3,2);D(0x22,"RET",[],1,2);D(0x23,"RL",["A"],1,1);ALU(0x20,"ADD");
  D(0x30,"JNB",["bit","rel"],3,2);D(0x32,"RETI",[],1,2);D(0x33,"RLC",["A"],1,1);ALU(0x30,"ADDC");
  D(0x40,"JC",["rel"],2,2);D(0x42,"ORL",["dir","A"],2,1);D(0x43,"ORL",["dir","#d8"],3,2);ALU(0x40,"ORL");
  D(0x50,"JNC",["rel"],2,2);D(0x52,"ANL",["dir","A"],2,1);D(0x53,"ANL",["dir","#d8"],3,2);ALU(0x50,"ANL");
  D(0x60,"JZ",["rel"],2,2);D(0x62,"XRL",["dir","A"],2,1);D(0x63,"XRL",["dir","#d8"],3,2);ALU(0x60,"XRL");
  D(0x70,"JNZ",["rel"],2,2);D(0x72,"ORL",["C","bit"],2,2);D(0x73,"JMP",["@A+DPTR"],1,2);D(0x74,"MOV",["A","#d8"],2,1);D(0x75,"MOV",["dir","#d8"],3,2);
  D(0x76,"MOV",["@R0","#d8"],2,1);D(0x77,"MOV",["@R1","#d8"],2,1);for(let i=0;i<8;i++)D(0x78+i,"MOV",[R(i),"#d8"],2,1);
  D(0x80,"SJMP",["rel"],2,2);D(0x82,"ANL",["C","bit"],2,2);D(0x83,"MOVC",["A","@A+PC"],1,2);D(0x84,"DIV",["AB"],1,4);D(0x85,"MOV",["dir","dir"],3,2);
  D(0x86,"MOV",["dir","@R0"],2,2);D(0x87,"MOV",["dir","@R1"],2,2);for(let i=0;i<8;i++)D(0x88+i,"MOV",["dir",R(i)],2,2);
  D(0x90,"MOV",["DPTR","#d16"],3,2);D(0x92,"MOV",["bit","C"],2,2);D(0x93,"MOVC",["A","@A+DPTR"],1,2);ALU(0x90,"SUBB");
  D(0xA0,"ORL",["C","/bit"],2,2);D(0xA2,"MOV",["C","bit"],2,1);D(0xA3,"INC",["DPTR"],1,2);D(0xA4,"MUL",["AB"],1,4);
  D(0xA6,"MOV",["@R0","dir"],2,2);D(0xA7,"MOV",["@R1","dir"],2,2);for(let i=0;i<8;i++)D(0xA8+i,"MOV",[R(i),"dir"],2,2);
  D(0xB0,"ANL",["C","/bit"],2,2);D(0xB2,"CPL",["bit"],2,1);D(0xB3,"CPL",["C"],1,1);D(0xB4,"CJNE",["A","#d8","rel"],3,2);D(0xB5,"CJNE",["A","dir","rel"],3,2);
  D(0xB6,"CJNE",["@R0","#d8","rel"],3,2);D(0xB7,"CJNE",["@R1","#d8","rel"],3,2);for(let i=0;i<8;i++)D(0xB8+i,"CJNE",[R(i),"#d8","rel"],3,2);
  D(0xC0,"PUSH",["dir"],2,2);D(0xC2,"CLR",["bit"],2,1);D(0xC3,"CLR",["C"],1,1);D(0xC4,"SWAP",["A"],1,1);D(0xC5,"XCH",["A","dir"],2,1);
  D(0xC6,"XCH",["A","@R0"],1,1);D(0xC7,"XCH",["A","@R1"],1,1);for(let i=0;i<8;i++)D(0xC8+i,"XCH",["A",R(i)],1,1);
  D(0xD0,"POP",["dir"],2,2);D(0xD2,"SETB",["bit"],2,1);D(0xD3,"SETB",["C"],1,1);D(0xD4,"DA",["A"],1,1);D(0xD5,"DJNZ",["dir","rel"],3,2);
  D(0xD6,"XCHD",["A","@R0"],1,1);D(0xD7,"XCHD",["A","@R1"],1,1);for(let i=0;i<8;i++)D(0xD8+i,"DJNZ",[R(i),"rel"],2,2);
  D(0xE0,"MOVX",["A","@DPTR"],1,2);D(0xE2,"MOVX",["A","@R0"],1,2);D(0xE3,"MOVX",["A","@R1"],1,2);D(0xE4,"CLR",["A"],1,1);D(0xE5,"MOV",["A","dir"],2,1);
  D(0xE6,"MOV",["A","@R0"],1,1);D(0xE7,"MOV",["A","@R1"],1,1);for(let i=0;i<8;i++)D(0xE8+i,"MOV",["A",R(i)],1,1);
  D(0xF0,"MOVX",["@DPTR","A"],1,2);D(0xF2,"MOVX",["@R0","A"],1,2);D(0xF3,"MOVX",["@R1","A"],1,2);D(0xF4,"CPL",["A"],1,1);D(0xF5,"MOV",["dir","A"],2,1);
  D(0xF6,"MOV",["@R0","A"],1,1);D(0xF7,"MOV",["@R1","A"],1,1);for(let i=0;i<8;i++)D(0xF8+i,"MOV",[R(i),"A"],1,1);
  /* 0xA5: mã không dùng trên 8051 gốc */
  /* tên SFR có sẵn (giống tệp REG51/REG52 của Keil; A51 định nghĩa sẵn khi không có $NOMOD51); T2MOD (C9H) của AT89S52 như tệp AT89X52 */
  const SFR={P0:0x80,SP:0x81,DPL:0x82,DPH:0x83,PCON:0x87,TCON:0x88,TMOD:0x89,TL0:0x8A,TL1:0x8B,TH0:0x8C,TH1:0x8D,P1:0x90,SCON:0x98,SBUF:0x99,
    P2:0xA0,IE:0xA8,P3:0xB0,IP:0xB8,T2CON:0xC8,T2MOD:0xC9,RCAP2L:0xCA,RCAP2H:0xCB,TL2:0xCC,TH2:0xCD,PSW:0xD0,ACC:0xE0,B:0xF0};
  const SFR_NAME={};for(const k in SFR)SFR_NAME[SFR[k]]=k;
  /* tên bit có sẵn: địa chỉ bit */
  const BITN={};const bits=(base,names)=>names.forEach((n,i)=>{if(n)BITN[n]=base+7-i});
  bits(0x88,["TF1","TR1","TF0","TR0","IE1","IT1","IE0","IT0"]);bits(0x98,["SM0","SM1","SM2","REN","TB8","RB8","TI","RI"]);
  bits(0xA8,["EA","","ET2","ES","ET1","EX1","ET0","EX0"]);bits(0xB0,["RD","WR","T1","T0","INT1","INT0","TXD","RXD"]);
  bits(0xB8,["","","PT2","PS","PT1","PX1","PT0","PX0"]);bits(0xD0,["CY","AC","F0","RS1","RS0","OV","","P"]);
  bits(0xC8,["TF2","EXF2","RCLK","TCLK","EXEN2","TR2","C_T2","CP_RL2"]);
  const BIT_NAME={};for(const k in BITN)BIT_NAME[BITN[k]]=k;
  /* tên một địa chỉ bit để hiện: P1.0, ACC.7, 20H.3, TR0… */
  function bitName(b){if(BIT_NAME[b]&&(b&0xC8)!==0x80)return BIT_NAME[b];
    if(b<0x80){const by=0x20+(b>>3);return hx2(by)+"H."+(b&7)}const by=b&0xF8;return (SFR_NAME[by]||hx2(by)+"H")+"."+(b&7)}
  const hx2=v=>{const s=(v&255).toString(16).toUpperCase().padStart(2,"0");return /^[A-F]/.test(s)?"0"+s:s};
  const hx4=v=>{const s=(v&65535).toString(16).toUpperCase().padStart(4,"0");return /^[A-F]/.test(s)?"0"+s:s};
  /* dịch ngược một lệnh (để hiện mã máy, kiểm tra trình dịch) */
  function disasm(code,pc){const op=code[pc&0xFFFF],I=OPS[op];if(!I)return {n:1,c:1,t:"DB "+hx2(op)+"H",op};
    const b=k=>code[(pc+k)&0xFFFF]||0;let k=1;const out=[];
    const dirName=a=>a>=0x80&&SFR_NAME[a]?SFR_NAME[a]:hx2(a)+"H";
    for(let j=0;j<I.a.length;j++){const t=I.a[j];
      if(t==="#d8")out.push("#"+hx2(b(k++))+"H");
      else if(t==="#d16"){out.push("#"+hx4(b(k)<<8|b(k+1))+"H");k+=2}
      else if(t==="dir"){if(op===0x85&&j===0){out.push(dirName(b(2)));continue}if(op===0x85&&j===1){out.push(dirName(b(1)));k=3;continue}out.push(dirName(b(k++)))}
      else if(t==="bit")out.push(bitName(b(k++)));
      else if(t==="/bit")out.push("/"+bitName(b(k++)));
      else if(t==="rel"){const r=b(k++);out.push(hx4(pc+I.n+(r<128?r:r-256))+"H")}
      else if(t==="a11"){out.push(hx4(((pc+2)&0xF800)|((op>>5)<<8)|b(k++))+"H")}
      else if(t==="a16"){out.push(hx4(b(k)<<8|b(k+1))+"H");k+=2}
      else out.push(t)}
    return {n:I.n,c:I.c,t:I.m+(out.length?" "+out.join(","):""),op}}
  return {OPS,SFR,SFR_NAME,BITN,BIT_NAME,bitName,disasm,hx2,hx4};
})();
if(typeof module!=="undefined")module.exports=MCU51ISA;
/* ===================== trình mô phỏng của khóa (platform/js/52-mcu51-asm.js) ===================== */
/* ===================== Trình mô phỏng 8051 · 2/4: trình dịch hợp ngữ kiểu Keil A51 =====================
   MCU51ASM.assemble(nguồn, {using}) → {ok, errors:[{line,msg}], warnings, rom (Uint8Array 64 KB), used (Uint8Array cờ byte đã ghi),
   lines:[{line, addr, bytes, text}] theo dòng nguồn, at: Map(địa chỉ → dòng), symbols, size (số byte mã), end}.
   Hỗ trợ: nhãn, ORG, EQU, SET, DATA, IDATA, XDATA, BIT, CODE, DB, DW, DS, DBIT, END, USING, CSEG/DSEG/ISEG/BSEG/XSEG [AT n],
   số 30H 1010B 17O 17Q 25D 0x30, ký tự 'A', biểu thức + - * / MOD SHL SHR AND OR XOR NOT HIGH LOW EQ NE LT LE GT GE ( ), $,
   địa chỉ bit kiểu P1.0, ACC.7, 20H.3, tên SFR và tên bit có sẵn của 8051/8052, lệnh chung JMP/CALL.
   Lỗi báo đúng dòng, kèm giải thích tiếng Việt. Chi tiết và giới hạn: docs/TRINH-MO-PHONG-8051.md. */
const MCU51ASM=(function(){
  const ISA=typeof MCU51ISA!=="undefined"?MCU51ISA:require("./51-mcu51-isa.js");
  const {OPS,SFR,BITN,hx2,hx4}=ISA;
  const BYM={};OPS.forEach(o=>{if(o)(BYM[o.m]=BYM[o.m]||[]).push(o)});
  const DIRS=new Set(["ORG","DB","DW","DS","DBIT","END","USING","CSEG","DSEG","ISEG","BSEG","XSEG","RSEG","NAME","PUBLIC","EXTRN","SEGMENT"]);
  const DEFS=new Set(["EQU","SET","DATA","IDATA","XDATA","BIT","CODE"]);
  const WORDOPS=new Set(["MOD","SHL","SHR","AND","OR","XOR","NOT","HIGH","LOW","EQ","NE","LT","LE","GT","GE"]);
  const RESERVED=new Set(["A","AB","C","DPTR","PC","R0","R1","R2","R3","R4","R5","R6","R7","AR0","AR1","AR2","AR3","AR4","AR5","AR6","AR7",...WORDOPS]);
  class AsmErr extends Error{}
  const E=m=>{throw new AsmErr(m)};
  /* ---------- tách từ của biểu thức ---------- */
  function lex(s){const T=[];let i=0;
    while(i<s.length){const c=s[i];
      if(/\s/.test(c)){i++;continue}
      if(c==="'"||c==='"'){let j=i+1,v="";while(j<s.length&&s[j]!==c)v+=s[j++];if(j>=s.length)E("Thiếu dấu "+c+" đóng chuỗi ký tự.");T.push({t:"str",v});i=j+1;continue}
      if(/[0-9]/.test(c)){let j=i;while(j<s.length&&/[0-9A-Za-z_]/.test(s[j]))j++;T.push({t:"num",v:num(s.slice(i,j))});i=j;continue}
      if(/[A-Za-z_?]/.test(c)){let j=i;while(j<s.length&&/[\w?]/.test(s[j]))j++;const w=s.slice(i,j).toUpperCase();T.push(WORDOPS.has(w)?{t:"op",v:w}:{t:"id",v:w,raw:s.slice(i,j)});i=j;continue}
      const two=s.slice(i,i+2);if(["<>","<=",">=","=="].includes(two)){T.push({t:"op",v:two==="=="?"=":two});i+=2;continue}
      if("+-*/().$=<>%&|^~".includes(c)){T.push(c==="$"?{t:"pc"}:{t:"op",v:{"%":"MOD","&":"AND","|":"OR","^":"XOR","~":"NOT"}[c]||c});i++;continue}
      if(c==="#")E("Dấu # chỉ đứng ở đầu toán hạng (giá trị tức thời), ví dụ MOV A,#30H.");
      E("Ký tự '"+c+"' không dùng được trong biểu thức.")}
    return T}
  function num(w){const u=w.toUpperCase();let m;
    if(/^0X[0-9A-F]+$/.test(u))return parseInt(u.slice(2),16);
    if((m=/^([0-9][0-9A-F]*)H$/.exec(u)))return parseInt(m[1],16);
    if((m=/^([01]+)B$/.exec(u)))return parseInt(m[1],2);
    if((m=/^([0-7]+)[OQ]$/.exec(u)))return parseInt(m[1],8);
    if((m=/^([0-9]+)D?$/.exec(u)))return parseInt(m[1],10);
    if(/^[0-9][0-9A-F]*$/.test(u))E(`Số '${w}' có chữ số hệ 16 nhưng thiếu hậu tố H (viết ${w}H).`);
    E(`Số '${w}' viết sai. Cách viết đúng: 30H (hệ 16), 1010B (hệ 2), 17O hoặc 17Q (hệ 8), 25 hoặc 25D (hệ 10).`)}
  /* ---------- tính biểu thức: trả về số, hoặc null nếu còn ký hiệu chưa biết (lượt 1) ---------- */
  function evalExpr(T,ctx){let p=0;const pk=()=>T[p],isOp=v=>T[p]&&T[p].t==="op"&&T[p].v===v;
    const bin=(a,b,f)=>a==null||b==null?null:f(a,b);
    function prim(){const t=T[p++];if(!t)E("Biểu thức còn thiếu phần sau.");
      if(t.t==="num")return t.v;
      if(t.t==="str"){if(!t.v.length)E("Chuỗi ký tự rỗng không có giá trị.");if(t.v.length>2)E(`Hằng ký tự '${t.v}' dài quá 2 ký tự (chỉ DB mới nhận chuỗi dài).`);return [...t.v].reduce((a,ch)=>a*256+(ch.charCodeAt(0)&255),0)}
      if(t.t==="pc")return ctx.pc;
      if(t.t==="id")return ctx.sym(t.v,t.raw);
      if(t.t==="op"&&t.v==="("){const v=or();if(!isOp(")"))E("Thiếu dấu ) đóng ngoặc.");p++;return v}
      E(`Không hiểu '${t.v}' trong biểu thức.`)}
    function dot(){let v=prim();while(isOp(".")){p++;const b=prim();v=bin(v,b,(a,b)=>bitOf(a,b))}return v}
    function un(){if(isOp("-")){p++;const v=un();return v==null?null:-v}if(isOp("+")){p++;return un()}
      if(isOp("NOT")){p++;const v=un();return v==null?null:(~v)&0xFFFF}
      if(isOp("HIGH")){p++;const v=un();return v==null?null:(v>>8)&255}if(isOp("LOW")){p++;const v=un();return v==null?null:v&255}
      return dot()}
    function mul(){let v=un();for(;;){const t=pk();if(!t||t.t!=="op"||!["*","/","MOD","SHL","SHR"].includes(t.v))return v;p++;const b=un();
      v=bin(v,b,(a,b)=>{if((t.v==="/"||t.v==="MOD")&&b===0)E("Chia cho 0 trong biểu thức.");return t.v==="*"?a*b:t.v==="/"?Math.trunc(a/b):t.v==="MOD"?a%b:t.v==="SHL"?a<<b:a>>>b})}}
    function add(){let v=mul();for(;;){if(isOp("+")){p++;v=bin(v,mul(),(a,b)=>a+b)}else if(isOp("-")){p++;v=bin(v,mul(),(a,b)=>a-b)}else return v}}
    const REL={"=":"EQ","<>":"NE","<":"LT","<=":"LE",">":"GT",">=":"GE"};
    function rel(){let v=add();for(;;){const t=pk();if(!t||t.t!=="op")return v;const k=REL[t.v]||t.v;if(!["EQ","NE","LT","LE","GT","GE"].includes(k))return v;p++;const b=add();
      v=bin(v,b,(a,b)=>({EQ:a===b,NE:a!==b,LT:a<b,LE:a<=b,GT:a>b,GE:a>=b}[k]?0xFFFF:0))}}
    function and(){let v=rel();while(isOp("AND")){p++;v=bin(v,rel(),(a,b)=>a&b)}return v}
    function or(){let v=and();for(;;){if(isOp("OR")){p++;v=bin(v,and(),(a,b)=>a|b)}else if(isOp("XOR")){p++;v=bin(v,and(),(a,b)=>a^b)}else return v}}
    if(!T.length)E("Thiếu giá trị.");
    const v=or();if(p<T.length)E(`Thừa '${T[p].v??T[p].t}' trong biểu thức.`);return v}
  /* byte.bit → địa chỉ bit */
  function bitOf(by,b){if(b<0||b>7)E(`Số thứ tự bit phải từ 0 đến 7 (đang là ${b}).`);
    if(by>=0x20&&by<=0x2F)return (by-0x20)*8+b;
    if(by>=0x80&&by<=0xFF&&by%8===0)return by+b;
    E(`Byte ${hx2(by)}H không định địa chỉ bit được. Chỉ RAM 20H–2FH và các SFR có địa chỉ chia hết cho 8 (P0, TCON, P1, SCON, P2, IE, P3, IP, PSW, ACC, B…) mới có bit riêng.`)}
  /* tách toán hạng theo dấu phẩy (bỏ qua dấu phẩy trong chuỗi và trong ngoặc) */
  function splitOps(s){const out=[];let cur="",q=null,d=0;
    for(const c of s){if(q){cur+=c;if(c===q)q=null;continue}
      if(c==="'"||c==='"'){q=c;cur+=c;continue}if(c==="(")d++;if(c===")")d--;
      if(c===","&&d===0){out.push(cur.trim());cur="";continue}cur+=c}
    if(cur.trim()||out.length)out.push(cur.trim());return out}
  function stripComment(s){let q=null;for(let i=0;i<s.length;i++){const c=s[i];if(q){if(c===q)q=null;continue}if(c==="'"||c==='"')q=c;else if(c===";")return s.slice(0,i)}return s}

  function assemble(src,opt){opt=opt||{};
    const lines=String(src).replace(/\r\n?/g,"\n").split("\n");
    const sym=new Map();          // TÊN → {v, k: code|num|data|bit|reg, line, set}
    const errors=[],warnings=[];
    let rom,used,out,pass,seg,loc,bank,ended;
    const LOC={};
    const segName={CSEG:"code",DSEG:"data",ISEG:"idata",BSEG:"bit",XSEG:"xdata"};
    const err=(ln,m)=>{if(!errors.some(e=>e.line===ln))errors.push({line:ln,msg:m})};
    function lookup(name,raw){
      if(sym.has(name)){const s=sym.get(name);if(s.k==="reg")E(`'${raw||name}' là tên khác của thanh ghi ${s.v}, không dùng trong biểu thức số.`);return s.v}
      if(name in SFR)return SFR[name];
      if(name in BITN)return BITN[name];
      if(/^AR[0-7]$/.test(name))return bank*8+(+name[2]);
      if(RESERVED.has(name))E(`'${raw||name}' là tên thanh ghi, không dùng như một số trong biểu thức.`);
      if(pass===1)return null;
      if(/^[0-9A-F]+H$/.test(name)&&/^[A-F]/.test(name))E(`Ký hiệu '${raw||name}' chưa được định nghĩa. Nếu đây là số hệ 16 thì phải bắt đầu bằng chữ số: viết 0${raw||name}.`);
      E(`Ký hiệu '${raw||name}' chưa được định nghĩa (nhãn hoặc tên hằng viết sai, hoặc chưa khai báo).`)}
    const ctxAt=pc=>({pc,sym:lookup});
    const ev=(s,pc)=>evalExpr(lex(s),ctxAt(pc));
    function define(ln,name,raw,v,k,set){
      if(RESERVED.has(name)||/^R[0-7]$/.test(name))E(`'${raw}' là tên dành riêng (thanh ghi hoặc toán tử), không đặt làm nhãn hay tên hằng.`);
      if(DIRS.has(name)||DEFS.has(name)||BYM[name]||name==="JMP"||name==="CALL")E(`'${raw}' trùng tên lệnh hoặc chỉ thị, không đặt làm nhãn hay tên hằng.`);
      if((name in SFR||name in BITN)&&!sym.has(name))E(`'${raw}' là tên SFR / bit có sẵn của 8051, hãy đặt tên khác.`);
      const o=sym.get(name);
      if(pass===1&&o&&!(o.set&&set))E(`'${raw}' đã được định nghĩa ở dòng ${o.line}.`);
      if(pass===2&&o&&o.line!==ln&&!(o.set&&set))return;
      sym.set(name,{v,k,line:ln,set:!!set})}
    /* phân loại toán hạng */
    function opnd(s,ln){const u=s.replace(/\s+/g,"").toUpperCase();
      if(!u)E("Thiếu toán hạng (có dấu phẩy thừa?).");
      if(["A","AB","C","DPTR","@DPTR","@A+DPTR","@A+PC"].includes(u))return {k:u};
      if(u==="ACC")return {k:"x",s,named:"ACC"};
      let m;
      if((m=/^R([0-7])$/.exec(u)))return {k:"R"+m[1]};
      if((m=/^@R([0-7])$/.exec(u)))return m[1]<2?{k:"@R"+m[1]}:{k:"bad",why:`@R${m[1]}: chỉ R0 và R1 dùng được làm con trỏ (địa chỉ gián tiếp @R0, @R1).`};
      if(/^@/.test(u)){const al=sym.get(u.slice(1));if(al&&al.k==="reg"&&/^R[01]$/.test(al.v))return {k:"@"+al.v};
        return {k:"bad",why:`Địa chỉ gián tiếp '${s}' không có trên 8051. Chỉ có @R0, @R1, @DPTR, @A+DPTR, @A+PC.`}}
      if(sym.has(u)&&sym.get(u).k==="reg")return opnd(sym.get(u).v,ln);
      if(u[0]==="#")return {k:"imm",s:s.trim().slice(1)};
      if(u[0]==="/")return {k:"nbit",s:s.trim().slice(1)};
      return {k:"x",s}}
    const fits=(t,o)=>{if(t===o.k)return true;
      if(o.k==="imm")return t==="#d8"||t==="#d16";
      if(o.k==="nbit")return t==="/bit";
      if(o.k==="x")return ["dir","bit","rel","a11","a16"].includes(t);return false};
    function pick(mn,os){const L=BYM[mn]||[];return L.find(I=>I.a.length===os.length&&I.a.every((t,j)=>fits(t,os[j])))}
    function hint(mn,os,text){const ks=os.map(o=>o.k);const bad=os.find(o=>o.k==="bad");if(bad)return bad.why;
      const has=k=>ks.includes(k),Rn=k=>/^R[0-7]$/.test(k);
      if(mn==="MOV"&&(has("@DPTR")||(ks[0]&&/^@R/.test(ks[0])&&false)))return "Đọc / ghi RAM ngoài qua @DPTR phải dùng MOVX (ví dụ MOVX A,@DPTR).";
      if(mn==="MOV"&&ks.length===2&&Rn(ks[0])&&Rn(ks[1]))return "8051 không có lệnh chép thẳng Rn sang Rn. Dùng A làm trung gian (MOV A,R1 rồi MOV R2,A) hoặc dùng địa chỉ trực tiếp của thanh ghi (MOV R2,AR1).";
      if(mn==="MOV"&&ks.length===2&&/^@R/.test(ks[0])&&/^@R/.test(ks[1]))return "Không có lệnh chép từ @Ri sang @Ri; chép qua A.";
      if(mn==="MOV"&&ks.length===2&&Rn(ks[0])&&/^@R/.test(ks[1])||mn==="MOV"&&/^@R/.test(ks[0])&&Rn(ks[1]))return "Không có lệnh chép giữa Rn và @Ri; chép qua A.";
      if(mn==="MOV"&&ks[0]==="imm")return "Toán hạng đích không thể là giá trị tức thời (#…). Đích đứng trước dấu phẩy: MOV đích,nguồn.";
      if(mn==="MOV"&&ks[0]==="DPTR"&&ks[1]!=="imm")return "DPTR chỉ nạp được bằng giá trị tức thời 16 bit: MOV DPTR,#data16. Muốn chép từng nửa thì dùng DPL, DPH.";
      if(mn==="MOVX")return "MOVX chỉ có các dạng: MOVX A,@DPTR · MOVX @DPTR,A · MOVX A,@R0/@R1 · MOVX @R0/@R1,A.";
      if(mn==="MOVC")return "MOVC chỉ có hai dạng: MOVC A,@A+DPTR và MOVC A,@A+PC.";
      if(["ADD","ADDC","SUBB"].includes(mn))return `${mn} luôn lấy A làm đích: ${mn} A,nguồn (nguồn là #data, địa chỉ trực tiếp, @R0/@R1 hoặc R0–R7).`;
      if(["ANL","ORL","XRL"].includes(mn))return `${mn} có các dạng: ${mn} A,nguồn · ${mn} địa_chỉ,A · ${mn} địa_chỉ,#data${mn!=="XRL"?` · ${mn} C,bit · ${mn} C,/bit`:""}.`;
      if(["INC","DEC"].includes(mn)&&has("imm"))return `${mn} chỉ có một toán hạng (A, Rn, địa chỉ trực tiếp, @Ri${mn==="INC"?", DPTR":""}); muốn cộng một số thì dùng ADD.`;
      if(mn==="DEC"&&has("DPTR"))return "8051 không có DEC DPTR (chỉ có INC DPTR). Giảm DPL rồi mượn sang DPH bằng tay.";
      if(["MUL","DIV"].includes(mn))return `${mn} chỉ viết là ${mn} AB (A và B là hai toán hạng ngầm).`;
      if(mn==="CJNE")return "CJNE có các dạng: CJNE A,#data,nhãn · CJNE A,địa_chỉ,nhãn · CJNE Rn,#data,nhãn · CJNE @Ri,#data,nhãn.";
      if(mn==="DJNZ")return "DJNZ có hai dạng: DJNZ Rn,nhãn và DJNZ địa_chỉ,nhãn.";
      if(["PUSH","POP"].includes(mn))return `${mn} chỉ nhận địa chỉ trực tiếp. Ví dụ ${mn} ACC (không viết ${mn} A), ${mn} 00H thay cho ${mn} R0 khi đang ở băng 0.`;
      if(["RL","RR","RLC","RRC","SWAP","DA"].includes(mn))return `${mn} chỉ làm việc với A: ${mn} A.`;
      if(["SETB","CLR","CPL"].includes(mn))return `${mn} nhận C, một bit (ví dụ P1.0)${mn!=="SETB"?" hoặc A":""}.`;
      if(["XCH","XCHD"].includes(mn))return `${mn} luôn đổi chỗ với A: ${mn} A,${mn==="XCHD"?"@R0/@R1":"nguồn"}.`;
      const I=BYM[mn];if(I)return `${mn} không nhận các toán hạng này (${text.trim()||"không có toán hạng"}). Các dạng hợp lệ: ${[...new Set(I.map(x=>x.m+" "+x.a.map(t=>({dir:"địa_chỉ",bit:"bit","/bit":"/bit",rel:"nhãn",a11:"nhãn",a16:"nhãn","#d8":"#data","#d16":"#data16"}[t]||t)).join(",")))].join(" · ")}.`;
      return ""}
    function chkRange(v,lo,hi,what){if(v<lo||v>hi)E(`${what}: giá trị ${v} (${v<0?"âm":hx4(v)+"H"}) nằm ngoài phạm vi ${lo}…${hi}.`);return v}
    /* địa chỉ bit (P1.0, ACC.7, 20H.3, tên BIT tự đặt, tên bit có sẵn như TR0) đặt vào chỗ cần địa chỉ byte: Keil A51 báo lỗi toán hạng,
       trước đây AMTS dịch như byte (MOV P1.0,#1 → 75 90 01 ghi cả cổng P1) */
    function bitLike(o){const s=(o.s||"").trim();if(!s||/['"]/.test(s))return false;if(/\./.test(s))return true;
      const u=s.toUpperCase();if(!/^[A-Z_?][\w?]*$/.test(u))return false;
      if(sym.has(u))return sym.get(u).k==="bit";return u in BITN&&!(u in SFR)}
    function noBit(o,I){if(bitLike(o))E(`'${o.s.trim()}' là địa chỉ bit, không dùng được ở chỗ cần địa chỉ byte của ${I.m}. Toán hạng không hợp lệ. Muốn đặt hoặc xóa một bit: SETB/CLR ${o.s.trim()}; chép giữa bit và cờ C: MOV ${o.s.trim()},C hoặc MOV C,${o.s.trim()}; ghi hay đọc cả byte thì dùng tên byte (ví dụ P1).`)}
    function enc(I,os,pc,ln){const b=[I.op];const val=o=>{const v=ev(o.s,pc);return v};
      const relOf=(o,n)=>{const t=val(o);if(t==null)return 0;const d=t-(pc+n);
        if(d<-128||d>127)E(`${I.m}: đích cách ${d>0?"+":""}${d} byte, lệnh nhảy tương đối chỉ tới được −128…+127 byte tính từ lệnh kế tiếp. ${I.m==="SJMP"?"Dùng LJMP hoặc JMP.":"Đảo điều kiện và nhảy qua một lệnh LJMP, hoặc đưa đích lại gần."}`);return d&255};
      if(I.op===0x85){noBit(os[0],I);noBit(os[1],I);const s=val(os[1]),d=val(os[0]);b.push(chkRange(s??0,0,255,"Địa chỉ trực tiếp nguồn"),chkRange(d??0,0,255,"Địa chỉ trực tiếp đích"));return b}
      I.a.forEach((t,j)=>{const o=os[j];let v;
        if(t==="#d8"){v=val(o);v=v==null?0:chkRange(v,-256,255,"Giá trị tức thời 8 bit");b.push(v&255)}
        else if(t==="#d16"){v=val(o);v=v==null?0:chkRange(v,-32768,65535,"Giá trị tức thời 16 bit");b.push((v>>8)&255,v&255)}
        else if(t==="dir"){noBit(o,I);v=val(o);v=v==null?0:chkRange(v,0,255,"Địa chỉ trực tiếp");b.push(v)}
        else if(t==="bit"||t==="/bit"){v=val(o);v=v==null?0:chkRange(v,0,255,"Địa chỉ bit");b.push(v)}
        else if(t==="rel")b.push(relOf(o,I.n));
        else if(t==="a16"){v=val(o);v=v==null?0:chkRange(v,0,65535,"Địa chỉ mã");b.push(v>>8,v&255)}
        else if(t==="a11"){v=val(o);if(v==null)v=pc+2;chkRange(v,0,65535,"Địa chỉ mã");
          if((v&0xF800)!==((pc+2)&0xF800))E(`${I.m}: đích ${hx4(v)}H nằm ngoài trang 2 KB của lệnh (${hx4((pc+2)&0xF800)}H–${hx4(((pc+2)&0xF800)+0x7FF)}H). Dùng ${I.m==="AJMP"?"LJMP":"LCALL"}.`);
          b[0]=I.op|((v>>8)&7)<<5;b.push(v&255)}});
      return b}
    function emit(ln,bytes,pc){for(let k=0;k<bytes.length;k++){const a=pc+k;if(a>0xFFFF)E("Mã vượt quá 64 KB bộ nhớ chương trình.");
        if(pass===2){if(used[a])E(`Địa chỉ mã ${hx4(a)}H đã có byte của dòng ${out.at.get(a)}. Hai đoạn mã chồng lên nhau (xem lại ORG).`);used[a]=1;rom[a]=bytes[k]&255;out.at.set(a,ln)}}}
    /* lệnh chung JMP / CALL: lùi lại (đích đã biết) chọn lệnh ngắn nhất; nhảy tới (đích chưa biết) dùng LJMP / LCALL */
    function generic(mn,os,pc,ln){if(os.length!==1||os[0].k!=="x"){if(mn==="JMP"&&os.length===1&&os[0].k==="@A+DPTR")return OPS[0x73];E(`${mn} cần một toán hạng là nhãn (hoặc @A+DPTR với JMP).`)}
      const key=ln+":"+pc;let ch=out.gen.get(ln);
      if(pass===1){let t=null;try{t=ev(os[0].s,pc)}catch(e){t=null}
        const known=t!=null&&!fwd(os[0].s,ln);
        if(mn==="JMP"){if(known&&t-(pc+2)>=-128&&t-(pc+2)<=127)ch=OPS[0x80];else if(known&&(t&0xF800)===((pc+2)&0xF800))ch=OPS[0x01];else ch=OPS[0x02]}
        else ch=known&&(t&0xF800)===((pc+2)&0xF800)?OPS[0x11]:OPS[0x12];
        out.gen.set(ln,ch)}
      void key;return ch}
    function fwd(s,ln){/* có ký hiệu được định nghĩa ở dòng sau dòng ln (hoặc chưa định nghĩa) */
      try{for(const t of lex(s))if(t.t==="id"){const d=sym.get(t.v);if(!d&&!(t.v in SFR)&&!(t.v in BITN))return true;if(d&&d.line>=ln)return true}}catch(e){return true}return false}
    function line(ln,raw){
      let s=stripComment(raw);
      if(/^\s*\$/.test(s)){if(pass===1&&!/^\s*\$\s*(NOMOD51|MOD51|INCLUDE|NOLIST|LIST|TITLE|DEBUG|OBJECT|PRINT|NOPRINT|PAGEWIDTH|PAGELENGTH|SYMBOLS|XREF|NOSYMBOLS)/i.test(s))warnings.push({line:ln,msg:"Dòng điều khiển $… bị bỏ qua trong trình mô phỏng."});
        if(pass===1&&/^\s*\$\s*INCLUDE/i.test(s))warnings.push({line:ln,msg:"Không cần $INCLUDE: tên SFR và tên bit của 8051/8052 đã có sẵn."});return}
      if(/^\s*#\s*include/i.test(s)){if(pass===1)warnings.push({line:ln,msg:"#include bị bỏ qua: tên SFR và tên bit của 8051/8052 đã có sẵn."});return}
      let m=/^\s*([A-Za-z_?][\w?]*)\s*:(?!=)/.exec(s);
      const rec={line:ln,addr:loc,bytes:[],seg};
      if(m){const raw=m[1],nm=raw.toUpperCase();define(ln,nm,raw,loc,seg==="code"?"code":seg,false);s=s.slice(m[0].length)}
      const body=s.trim();if(!body){if(m)out.lines[ln]=rec;return}
      m=/^([A-Za-z_?][\w?]*)\s+([A-Za-z]+)\b\s*(.*)$/.exec(body);
      if(m&&DEFS.has(m[2].toUpperCase())){const nm=m[1].toUpperCase(),kw=m[2].toUpperCase(),rest=m[3].trim();
        if(!rest)E(`${kw} cần một giá trị: ${m[1]} ${kw} giá_trị.`);
        const ru=rest.replace(/\s+/g,"").toUpperCase();
        if((kw==="EQU"||kw==="SET")&&/^(A|R[0-7])$/.test(ru)){define(ln,nm,m[1],ru,"reg",kw==="SET");return}
        let v=ev(rest,loc);
        if(v==null&&kw!=="SET"&&pass===1){/* định nghĩa phụ thuộc ký hiệu phía sau: thử lại ở lượt 2 */out.late.push(ln);define(ln,nm,m[1],0,kw.toLowerCase(),kw==="SET");return}
        if(v!=null){if(kw==="BIT")chkRange(v,0,255,"Địa chỉ bit");if(kw==="DATA")chkRange(v,0,255,"Địa chỉ DATA");if(kw==="IDATA")chkRange(v,0,255,"Địa chỉ IDATA");if(kw==="XDATA"||kw==="CODE")chkRange(v,0,65535,"Địa chỉ");}
        if(pass===2&&sym.has(nm)&&sym.get(nm).line===ln)sym.get(nm).v=v;else define(ln,nm,m[1],v,kw==="EQU"||kw==="SET"?"num":kw.toLowerCase(),kw==="SET");
        rec.def=v;out.lines[ln]=rec;return}
      m=/^([A-Za-z_?][\w?]*)\s*(.*)$/.exec(body);if(!m)E("Dòng không đúng cú pháp: cần nhãn, lệnh hoặc chỉ thị.");
      const mn=m[1].toUpperCase(),rest=m[2];
      if(DEFS.has(mn))E(`${mn} cần tên đứng trước: TÊN ${mn} giá_trị (ví dụ LED ${mn==="BIT"?"BIT P1.0":mn+" 30H"}).`);
      if(DIRS.has(mn)){directive(ln,mn,rest,rec);out.lines[ln]=rec;return}
      if(!BYM[mn]&&mn!=="JMP"&&mn!=="CALL"){
        if(/^(MOVE|LD|LDI|ST|JUMP|JE|JNE|JMPZ|BRA|BR|CMP|SUB|SBC|ADC|OUT|IN|HALT|HLT|LOOP|PUSHA|POPA)$/.test(mn))E(`Lệnh '${m[1]}' không có trong tập lệnh 8051.${{SUB:" Phép trừ dùng SUBB A,… (nhớ xóa cờ CY trước bằng CLR C).",ADC:" Cộng có nhớ dùng ADDC.",CMP:" So sánh dùng CJNE hoặc SUBB.",JUMP:" Dùng SJMP, AJMP, LJMP hoặc JMP.",LOOP:" Vòng lặp đếm dùng DJNZ.",HALT:" Chương trình 8051 thường kết thúc bằng vòng lặp SJMP $.",HLT:" Chương trình 8051 thường kết thúc bằng vòng lặp SJMP $.",MOVE:" Chép dữ liệu dùng MOV."}[mn]||""}`);
        E(`'${m[1]}' không phải lệnh hay chỉ thị của 8051 (viết sai tên lệnh, hoặc nhãn thiếu dấu ':').`)}
      if(seg!=="code")E(`Lệnh ${mn} nằm trong đoạn dữ liệu (${Object.keys(segName).find(k=>segName[k]===seg)}). Viết CSEG trước khi viết lệnh.`);
      const os=splitOps(rest).map(x=>opnd(x,ln));
      let I=mn==="JMP"||mn==="CALL"?generic(mn,os,loc,ln):pick(mn,os);
      if(!I)E(hint(mn,os,rest)||`${mn}: toán hạng không hợp lệ.`);
      if(I.m==="MOV"&&I.a[0]==="dir"&&I.a[1]==="#d8"&&os[0].s&&/^\s*ACC\s*$/i.test(os[0].s)&&pass===1)warnings.push({line:ln,msg:"MOV ACC,#… dài 3 byte; MOV A,#… làm cùng việc chỉ với 2 byte."});
      rec.bytes=pass===2?enc(I,os,loc,ln):new Array(I.n).fill(0);rec.cyc=I.c;rec.ins=true;
      emit(ln,rec.bytes,loc);loc+=I.n;out.lines[ln]=rec}
    function directive(ln,mn,rest,rec){const r=rest.trim();
      if(mn==="ORG"){const v=ev(r,loc);if(v==null)E("ORG cần giá trị đã biết (không dùng nhãn định nghĩa phía sau).");loc=chkRange(v,0,65535,"ORG");rec.addr=loc;return}
      if(mn==="END"){ended=ln;return}
      if(mn==="USING"){const v=ev(r,loc);if(v==null||v<0||v>3)E("USING cần số băng thanh ghi 0…3.");bank=v;return}
      if(mn in segName){LOC[seg]=loc;seg=segName[mn];loc=LOC[seg]??0;const mm=/^AT\s+(.+)$/i.exec(r);
        if(mm){const v=ev(mm[1],loc);if(v==null)E(`${mn} AT cần giá trị đã biết.`);loc=v}else if(r)E(`${mn} chỉ nhận dạng ${mn} hoặc ${mn} AT địa_chỉ.`);rec.addr=loc;return}
      if(["RSEG","NAME","PUBLIC","EXTRN","SEGMENT"].includes(mn))E(`Chỉ thị ${mn} (chương trình nhiều module, đoạn tái định vị) chưa có trong trình mô phỏng: viết chương trình một file, dùng ORG hoặc CSEG AT.`);
      if(mn==="DS"){const v=ev(r,loc);if(v==null||v<0)E("DS cần số byte cần dành (đã biết, không âm).");loc+=v;rec.ds=v;return}
      if(mn==="DBIT"){if(seg!=="bit")E("DBIT chỉ dùng trong đoạn bit (BSEG).");const v=ev(r,loc);if(v==null||v<0)E("DBIT cần số bit cần dành.");loc+=v;return}
      if(mn==="DB"||mn==="DW"){if(seg!=="code")E(`${mn} chỉ dùng trong đoạn mã (CSEG). Trong đoạn dữ liệu dùng DS để dành chỗ.`);
        const items=splitOps(r);if(!r)E(`${mn} cần ít nhất một giá trị.`);const bytes=[];
        for(const it of items){if(!it)E(`${mn}: có giá trị rỗng (dấu phẩy thừa?).`);
          const sm=/^(['"])(.*)\1$/.exec(it.trim());
          if(mn==="DB"&&sm&&sm[2].length!==1){for(const ch of sm[2]){const c=ch.charCodeAt(0);if(c>255)E(`Ký tự '${ch}' không thuộc bảng mã 8 bit. Màn hình LCD/UART chỉ hiện ký tự ASCII; viết không dấu.`);bytes.push(c)}continue}
          const v=ev(it,loc+bytes.length);
          if(mn==="DB"){const x=v==null?0:chkRange(v,-128,255,"DB");bytes.push(x&255)}
          else{const x=v==null?0:chkRange(v,-32768,65535,"DW");bytes.push((x>>8)&255,x&255)}}
        rec.bytes=bytes;rec.data=true;emit(ln,bytes,loc);loc+=bytes.length;return}}
    for(pass=1;pass<=2;pass++){
      rom=new Uint8Array(65536);used=new Uint8Array(65536);
      if(pass===1)out={lines:[],at:new Map(),gen:new Map(),late:[]};else{out.lines=[];out.at=new Map()}
      seg="code";loc=0;bank=opt.using||0;ended=0;for(const k in LOC)delete LOC[k];
      for(let i=0;i<lines.length;i++){const ln=i+1;if(ended)break;
        try{line(ln,lines[i])}catch(e){if(!(e instanceof AsmErr))throw e;if(pass===2||!/chưa được định nghĩa/.test(e.message))err(ln,e.message)}}
      if(pass===1&&!ended&&errors.length===0)warnings.push({line:lines.length,msg:"Chương trình không có END. Keil A51 cảnh báo khi thiếu END; nên thêm END ở dòng cuối."});
    }
    errors.sort((a,b)=>a.line-b.line);
    let size=0;for(let a=0;a<65536;a++)if(used[a])size++;
    const syms={};for(const [k,v] of sym)syms[k]={v:v.v,k:v.k,line:v.line};
    return {ok:!errors.length,errors,warnings,rom,used,size,lines:out.lines,at:out.at,symbols:syms,end:ended}}
  /* bản liệt kê kiểu Keil .LST: địa chỉ, byte mã, dòng nguồn */
  function listing(res,src){const L=String(src).replace(/\r\n?/g,"\n").split("\n");
    return L.map((t,i)=>{const r=res.lines[i+1];const b=r&&r.bytes&&r.bytes.length?r.bytes.map(x=>x.toString(16).toUpperCase().padStart(2,"0")).join(""):"";
      return (r&&(b||r.def!=null)?(r.def!=null&&!b?"  "+(typeof r.def==="number"?hx4(r.def):"")+"  ":hx4(r.addr)+" ")+b:"").padEnd(14)+" "+String(i+1).padStart(4)+"  "+t}).join("\n")}
  return {assemble,listing,evalExpr:(s,syms)=>evalExpr(lex(s),{pc:0,sym:n=>syms&&n in syms?syms[n]:SFR[n]??BITN[n]??E("?")}),num};
})();
if(typeof module!=="undefined")module.exports=MCU51ASM;
/* ===================== trình mô phỏng của khóa (platform/js/53-mcu51-cpu.js) ===================== */
/* ===================== Trình mô phỏng 8051 · 3/4: máy giả lập (không dùng DOM, chạy được cả trong Node) =====================
   MCU51CPU.create({fosc, ram:128|256, strict}) → máy m:
   - m.load(rom, used) · m.reset() · m.step() → {pc, op, n, c, text, irq?, err?} · m.runUntil(điều kiện, giới hạn chu kỳ)
   - bộ nhớ: m.iram (256 B), m.sfr (128 B, địa chỉ 80H–FFH), m.rom (64 KB), m.xram (64 KB); m.pc, m.cyc (chu kỳ máy)
   - m.reg(tên): A B R0–R7 DPTR SP PSW PC CY AC OV P F0 RS; m.rd(địa chỉ trực tiếp), m.bit(địa chỉ bit), m.pins(cổng)
   - cổng: m.latch(i) (giá trị chốt), m.pins(i) = chốt AND chân bị kéo xuống bởi thiết bị ngoài (m.ext[i] hoặc m.extFn)
   - Timer 0/1 (chế độ 0–3, GATE, C/T đếm sườn xuống T0/T1), ngắt ngoài (mức / sườn), cổng nối tiếp (chế độ 0–3),
     ngắt 2 mức ưu tiên (IP), đếm chu kỳ máy (1 chu kỳ = 12 chu kỳ thạch anh)
   - m.snap()/m.restore(s): chụp và khôi phục trạng thái (Lùi bước); m.trace: nhật ký tín hiệu cho đồ thị thời gian;
     m.tx: các khung UART đã gửi; m.uartIn(byte, bit9, gapBits): đưa byte vào đường RXD (gapBits: số thời gian bit nghỉ trước byte);
     m.uartFeed(list): như setup.uart của bộ thử.
   Mô hình và giới hạn (thời điểm cờ ngắt, UART xấp xỉ theo khung…): docs/TRINH-MO-PHONG-8051.md. */
const MCU51CPU=(function(){
  const ISA=typeof MCU51ISA!=="undefined"?MCU51ISA:require("./51-mcu51-isa.js");
  const {OPS,hx2,hx4}=ISA;
  const ACC=0xE0,B_=0xF0,PSW=0xD0,SP=0x81,DPL=0x82,DPH=0x83,TCON=0x88,TMOD=0x89,TL0=0x8A,TL1=0x8B,TH0=0x8C,TH1=0x8D,
    SCON=0x98,SBUF=0x99,IE=0xA8,IP=0xB8,PCON=0x87,T2CON=0xC8,T2MOD=0xC9,RCAP2L=0xCA,RCAP2H=0xCB,TL2=0xCC,TH2=0xCD,P3=0xB0;
  const PORTS=[0x80,0x90,0xA0,0xB0];
  const VEC=[{n:"INT0",v:0x03,f:"IE0",en:0,pr:0},{n:"Timer 0",v:0x0B,f:"TF0",en:1,pr:1},{n:"INT1",v:0x13,f:"IE1",en:2,pr:2},{n:"Timer 1",v:0x1B,f:"TF1",en:3,pr:3},{n:"Cổng nối tiếp",v:0x23,f:"RI/TI",en:4,pr:4},{n:"Timer 2",v:0x2B,f:"TF2/EXF2",en:5,pr:5}];
  const par=v=>{v^=v>>4;v^=v>>2;v^=v>>1;return v&1};
  /* số chu kỳ máy được đếm (timer, UART, lấy mẫu chân) TRƯỚC khi lệnh đọc / ghi thanh ghi; phần còn lại đếm sau.
     Mặc định: mọi chu kỳ đếm trước. Các ngoại lệ đo được bằng tools/mcu51-test (chế độ probe) để khớp ucsim s51. */
  const PRE={};[0x10,0x43,0x72,0xA0,0xB0,0x53,0x63,0x75,0x82,0x85,0x86,0x87,0x88,0x89,0x8A,0x8B,0x8C,0x8D,0x8E,0x8F,0x92,0xA6,0xA7,0xA8,0xA9,0xAA,0xAB,0xAC,0xAD,0xAE,0xAF,0xC0,0xD0].forEach(o=>PRE[o]=1);
  function create(opt){opt=opt||{};
    const m={fosc:opt.fosc||12000000,ramSize:opt.ram===128?128:256,strict:opt.strict!==false,
      iram:new Uint8Array(256),sfr:new Uint8Array(128),rom:new Uint8Array(65536),used:null,xram:new Uint8Array(65536),
      pc:0,cyc:0,ext:[255,255,255,255],extFn:null,onPort:null,trace:[],tx:[],rxQ:[],warns:[],
      inLo:false,inHi:false,block:false,halted:false,isrStack:[],nIns:0};
    const iram=m.iram,sfr=m.sfr,xram=m.xram;let rom=m.rom;
    let S;   // trạng thái phụ: timer, UART, chân trước đó (để bắt sườn)
    function fresh(){return {t0p:1,t1p:1,i0p:1,i1p:1,e0:0,e1:0,g1:0,g2:0,fl:0,rise:[0,0,0,0,0,0],
      t2p:1,t2xp:1,e2:0,g3:0,t2o:1,   // Timer 2: mức trước của T2 (P1.0), T2EX (P1.1), sườn chờ xử lý, số lần tràn cho UART, mức xuất xung
      tx:null,           // {b, bits, need, cnt, unit, c0, mode}
      rx:null,sbufR:0,xUndo:null}}
    /* ---------- đọc ghi ---------- */
    const latch=i=>sfr[PORTS[i]-0x80];
    function pins(i){let x=latch(i)&(m.extFn?m.extFn(i,latch):m.ext[i]);
      if(i===3&&S&&S.tx&&S.tx.mode>0)x=x&~2|(txdLevel()<<1);
      if(i===1&&S&&!S.t2o&&t2clk())x&=~1;      // Timer 2 xuất xung ở P1.0 (T2OE = 1): mức 0 của bộ chia kéo chân xuống
      return x&255}
    m.latch=latch;m.pins=pins;
    function rdS(a){/* đọc SFR như lệnh thường (cổng: đọc chân) */
      if((a&0x8F)===0x80&&a<=0xB0)return pins((a-0x80)>>4);
      if(a===SBUF)return S.sbufR;
      return sfr[a-0x80]}
    const rd=a=>a<0x80?iram[a]:rdS(a);
    const rdL=a=>a<0x80?iram[a]:a===SBUF?S.sbufR:sfr[a-0x80];      // đọc–sửa–ghi: cổng đọc chốt
    function wrS(a,v){v&=255;const o=sfr[a-0x80];
      if(a===SBUF){sfr[a-0x80]=v;startTx(v);return}
      if((a&0x8F)===0x80&&a<=0xB0&&o!==v&&m.prePort)m.prePort((a-0x80)>>4,m.cyc);   // thiết bị ghi nhận trạng thái cũ (độ sáng LED…)
      sfr[a-0x80]=v;
      if(a===IE||a===IP)m.block=true;
      if((a&0x8F)===0x80&&a<=0xB0&&o!==v&&m.onPort)m.onPort((a-0x80)>>4,v,o,m.cyc)}
    const wr=(a,v)=>{if(a<0x80)iram[a]=v&255;else wrS(a,v)};
    function chkI(a){if(a>=m.ramSize){runErr(`Truy cập gián tiếp tới ${hx2(a)}H nhưng 8051 chỉ có 128 byte RAM trong (00H–7FH). Vùng 80H–FFH gián tiếp chỉ có trên 8052.`)}return a}
    const ird=a=>iram[chkI(a)],iwr=(a,v)=>{iram[chkI(a)]=v&255};
    const A=()=>sfr[0x60],setA=v=>{sfr[0x60]=v&255};
    const psw=()=>sfr[0x50];
    const CY=()=>sfr[0x50]>>7,setCY=c=>{sfr[0x50]=c?sfr[0x50]|0x80:sfr[0x50]&0x7F};
    const bank=()=>(sfr[0x50]>>3)&3;
    const Rn=n=>iram[bank()*8+n],setRn=(n,v)=>{iram[bank()*8+n]=v&255};
    const dptr=()=>sfr[DPH-0x80]<<8|sfr[DPL-0x80],setDptr=v=>{sfr[DPH-0x80]=(v>>8)&255;sfr[DPL-0x80]=v&255};
    /* bit: đọc thường (cổng: chân) hoặc đọc chốt (lệnh đọc–sửa–ghi) */
    const bAddr=b=>b<0x80?0x20+(b>>3):b&0xF8;
    const rdBit=b=>(rd(bAddr(b))>>(b&7))&1;
    const rdBitL=b=>(rdL(bAddr(b))>>(b&7))&1;
    function wrBit(b,v){const a=bAddr(b),k=b&7,o=rdL(a);wr(a,v?o|1<<k:o&~(1<<k))}
    function push(v){const s=(sfr[1]+1)&255;sfr[1]=s;if(s===0)warn("SP tràn qua FFH và quay về 00H: ngăn xếp ghi đè lên băng thanh ghi 0.");else if(s>=m.ramSize)warn(`SP = ${hx2(s)}H vượt quá RAM trong của 8051 (128 byte).`);iwr(s,v)}
    function pop(){const s=sfr[1];const v=ird(s);sfr[1]=(s-1)&255;return v}
    function warn(t){if(!m.warns.some(w=>w.t===t))m.warns.push({t,pc:m.pc0,c:m.cyc})}
    class RunErr extends Error{}
    function runErr(t){throw new RunErr(t)}
    m.RunErr=RunErr;
    /* ---------- cờ ---------- */
    function setF(cy,ac,ov){let p=sfr[0x50]&0x3B;if(cy)p|=0x80;if(ac)p|=0x40;if(ov)p|=0x04;sfr[0x50]=p|(sfr[0x50]&0x01)}
    function add(v,c){const a=A(),r=a+v+c;setF(r>255,((a&15)+(v&15)+c)>15,((a^r)&(v^r)&0x80)!==0);setA(r)}
    function subb(v){const a=A(),c=CY(),r=a-v-c;setF(r<0,((a&15)-(v&15)-c)<0,((a^v)&(a^(r&255))&0x80)!==0);setA(r)}
    /* ---------- ngoại vi: một chu kỳ máy ---------- */
    const tcon=()=>sfr[TCON-0x80],tmod=()=>sfr[TMOD-0x80];
    function setT(bit,v){const o=sfr[TCON-0x80];sfr[TCON-0x80]=v?o|bit:o&~bit}
    function t1Over(){/* tràn Timer 1: xung nhịp cho UART chế độ 1, 3 (bộ chia 16 chạy liên tục, đếm số lần tràn) */
      S.g1++;if(S.tx&&S.tx.unit==="t1")serialUnit(S.tx,S.g1);if(S.rx&&S.rx.unit==="t1")serialUnit(S.rx,S.g1)}
    function tick(){
      m.cyc++;const p3=pins(3),tc=tcon(),md=tmod();
      /* ngắt ngoài: lấy mẫu chân INT0 (P3.2), INT1 (P3.3) mỗi chu kỳ */
      const i0=(p3>>2)&1,i1=(p3>>3)&1;
      if(tc&1){if(S.i0p&&!i0)setT(0x02,1)}else setT(0x02,!i0);
      if(tc&4){if(S.i1p&&!i1)setT(0x08,1)}else setT(0x08,!i1);
      S.i0p=i0;S.i1p=i1;
      /* bộ đếm sự kiện: sườn 1→0 ở chân T0/T1 phát hiện trong chu kỳ này, số đếm tăng ở chu kỳ sau (Intel: S3P1 của chu kỳ kế tiếp) */
      const t0pin=(p3>>4)&1,t1pin=(p3>>5)&1,f0=S.e0,f1=S.e1;S.e0=S.t0p&&!t0pin?1:0;S.e1=S.t1p&&!t1pin?1:0;S.t0p=t0pin;S.t1p=t1pin;
      /* Timer 0 */
      const m0=md&3,run0=(tc&0x10)&&(!(md&8)||i0),inc0=run0&&((md&4)?f0:1);
      const m1=(md>>4)&3,mode3=m0===3;
      if(inc0)timerInc(0,m0);
      if(mode3&&(tc&0x40)){/* chế độ 3: TH0 là timer 8 bit riêng, chạy theo TR1, báo tràn bằng TF1 */
        const v=(sfr[TH0-0x80]+1)&255;sfr[TH0-0x80]=v;if(!v)setT(0x80,1)}
      /* Timer 1 (chế độ 3: dừng). Khi Timer 0 ở chế độ 3, Timer 1 vẫn chạy theo TR1 nhưng không đặt được TF1 */
      if(m1!==3){const run1=(tc&0x40)&&(!(md&0x80)||i1),inc1=run1&&((md&0x40)?f1:1);
        if(inc1&&timerInc(1,m1,mode3))t1Over()}
      /* Timer 2: chỉ có trên 8052/AT89S52 (cấu hình RAM 256 byte); cấu hình 8051 gốc: các ô T2CON… chỉ lưu giá trị */
      if(m.ramSize===256)timer2();
      /* UART chế độ 0 (1 bit mỗi chu kỳ máy) và chế độ 2 (12 nhịp thạch anh mỗi chu kỳ máy) */
      for(let k=0;k<12;k++){S.g2++;if(S.tx&&S.tx.unit==="osc")serialUnit(S.tx,S.g2);if(S.rx&&S.rx.unit==="osc")serialUnit(S.rx,S.g2)}
      if(S.tx&&S.tx.unit==="cyc")serialUnit(S.tx,0);if(S.rx&&S.rx.unit==="cyc")serialUnit(S.rx,0);
      if(!S.rx)rxStart();
      rises();sample()}
    /* cờ yêu cầu ngắt: IE0 TF0 IE1 TF1 RI|TI TF2|EXF2; ghi lại chu kỳ máy lúc mỗi cờ vừa bật */
    function flagMask(){const tc=tcon(),sc=scon();return (tc>>1&1)|(tc>>5&1)<<1|(tc>>3&1)<<2|(tc>>7&1)<<3|((sc&3)?1:0)<<4|t2req()<<5}
    /* yêu cầu ngắt Timer 2: TF2 hoặc EXF2; khi đếm lên/xuống (DCEN = 1) EXF2 chỉ đổi mức, không gây ngắt (datasheet AT89S52) */
    function t2req(){const c=sfr[T2CON-0x80];return (c&0x80)||((c&0x40)&&!(sfr[T2MOD-0x80]&1))?1:0}
    /* ---------- Timer 2 (8052, thêm T2MOD của AT89S52) ----------
       T2CON: TF2 EXF2 RCLK TCLK EXEN2 TR2 C/T2 CP/RL2 · T2MOD: T2OE (bit 1), DCEN (bit 0).
       - bộ định thời: tăng 1 mỗi chu kỳ máy; bộ tạo baud (RCLK/TCLK = 1) hoặc xuất xung (T2OE = 1): tăng theo fosc/2 = 6 lần mỗi chu kỳ máy;
       - bộ đếm (C/T2 = 1): sườn 1→0 ở T2 (P1.0), phát hiện ở một chu kỳ, số đếm tăng ở chu kỳ sau (như Timer 0/1);
       - sườn 1→0 ở T2EX (P1.1) được xử lý ngay trong chu kỳ lấy mẫu, kể cả khi TR2 = 0 (giống ucsim s51; Intel không ghi rõ — giả định);
       - bắt giữ (CP/RL2 = 1): tràn FFFFH → 0000H bật TF2; EXEN2 = 1 và sườn 1→0 ở T2EX (P1.1): chép TH2:TL2 vào RCAP2H:RCAP2L, bật EXF2;
       - tự nạp (CP/RL2 = 0): tràn → nạp RCAP2, bật TF2; EXEN2 = 1 và sườn ở T2EX: nạp RCAP2, bật EXF2;
         DCEN = 1: T2EX = 1 đếm lên (tràn → nạp RCAP2), T2EX = 0 đếm xuống (khi TH2:TL2 = RCAP2 → nạp FFFFH); TF2 bật, EXF2 đảo;
       - bộ tạo baud: tràn → nạp RCAP2, không bật TF2, là nhịp cho UART chế độ 1, 3 (16 lần tràn mỗi bit); sườn T2EX chỉ bật EXF2;
       - xuất xung (T2OE = 1, C/T2 = 0): mỗi lần tràn đảo mức P1.0, không bật TF2. */
    const t2clk=()=>m.ramSize===256&&(sfr[T2MOD-0x80]&2)&&!(sfr[T2CON-0x80]&2);
    function timer2(){const c=sfr[T2CON-0x80],md=sfr[T2MOD-0x80],p1=pins(1);
      /* T2: sườn phát hiện ở chu kỳ này, số đếm tăng ở chu kỳ sau (như T0/T1). T2EX: sườn xử lý ngay trong chu kỳ lấy mẫu (như cờ IEx) */
      const t2pin=p1&1,ex=(p1>>1)&1,f2=S.e2;S.e2=S.t2p&&!t2pin?1:0;const fx=S.t2xp&&!ex?1:0;S.t2p=t2pin;S.t2xp=ex;
      const baud=c&0x30,cap=!baud&&(c&1),dcen=!baud&&!cap&&(md&1),clko=t2clk();
      const setC=(b,v)=>{const o=sfr[T2CON-0x80];sfr[T2CON-0x80]=v?o|b:o&~b};
      const get=()=>sfr[TH2-0x80]<<8|sfr[TL2-0x80],put=v=>{sfr[TH2-0x80]=(v>>8)&255;sfr[TL2-0x80]=v&255};
      const rcap=()=>sfr[RCAP2H-0x80]<<8|sfr[RCAP2L-0x80];
      /* sườn ở T2EX (EXEN2 = 1) */
      if(fx&&(c&8)&&!dcen){if(cap){sfr[RCAP2H-0x80]=sfr[TH2-0x80];sfr[RCAP2L-0x80]=sfr[TL2-0x80]}else if(!baud)put(rcap());setC(0x40,1)}
      if(!(c&4))return;
      const n=(c&2)?f2:(baud||clko)?6:1;
      for(let k=0;k<n;k++){let v=get();
        if(dcen&&!ex){if(v===rcap()){put(0xFFFF);setC(0x80,1);setC(0x40,!(sfr[T2CON-0x80]&0x40))}else put(v-1);continue}
        if(v<0xFFFF){put(v+1);continue}
        put(cap?0:rcap());
        if(baud){S.g3++;if(S.tx&&S.tx.unit==="t2")serialUnit(S.tx,S.g3);if(S.rx&&S.rx.unit==="t2")serialUnit(S.rx,S.g3)}
        else if(!clko)setC(0x80,1);
        if(dcen)setC(0x40,!(sfr[T2CON-0x80]&0x40));
        if(clko)S.t2o^=1}}
    function rises(){const f=flagMask(),nw=f&~S.fl;if(nw)for(let i=0;i<6;i++)if(nw>>i&1)S.rise[i]=m.cyc;S.fl=f}
    /* tăng timer n; trả về true nếu tràn */
    function timerInc(n,mode,noFlag){const L=n?TL1-0x80:TL0-0x80,H=n?TH1-0x80:TH0-0x80,F=n?0x80:0x20;let over=false;
      if(mode===0){/* 13 bit: TH 8 bit nối sau 5 bit thấp của TL (TL chia 32). Intel ghi 3 bit cao của TL "không xác định";
           ở đây (giống ucsim s51) TL tăng như thanh ghi 8 bit, khi 5 bit thấp quay về 0 thì TL về 00H và TH tăng 1 */
        let tl=(sfr[L]+1)&255;
        if(!(tl&0x1F)){tl=0;const th=(sfr[H]+1)&255;sfr[H]=th;if(!th)over=true}sfr[L]=tl}
      else if(mode===1){let v=(sfr[H]<<8|sfr[L])+1;if(v>0xFFFF){v=0;over=true}sfr[H]=v>>8;sfr[L]=v&255}
      else if(mode===2){let v=sfr[L]+1;if(v>255){v=sfr[H];over=true}sfr[L]=v}
      else{/* chế độ 3, Timer 0: TL0 là timer 8 bit */let v=(sfr[L]+1)&255;sfr[L]=v;if(!v)over=true}
      if(over&&!noFlag)setT(F,1);
      return over}
    /* ---------- cổng nối tiếp ---------- */
    const scon=()=>sfr[SCON-0x80],smod=()=>(sfr[PCON-0x80]>>7)&1;
    function setS(bit,v){const o=sfr[SCON-0x80];sfr[SCON-0x80]=v?o|bit:o&~bit}
    function frameCfg(dir){const mode=scon()>>6;
      /* số đơn vị thời gian cho một bit: chế độ 0 → 1 chu kỳ máy; 1, 3 → 32 (16 nếu SMOD=1) lần tràn Timer 1; 2 → 64 (32) nhịp thạch anh;
         chế độ 1, 3 với TCLK (phát) / RCLK (nhận) = 1 trên 8052: 16 lần tràn Timer 2 */
      if(mode===0)return {mode,unit:"cyc",per:1,bits:8};
      if(mode===2)return {mode,unit:"osc",per:smod()?32:64,bits:11};
      if(m.ramSize===256&&(sfr[T2CON-0x80]&(dir==="rx"?0x20:0x10)))return {mode,unit:"t2",per:16,bits:mode===1?10:11};
      return {mode,unit:"t1",per:smod()?16:32,bits:mode===1?10:11}}
    function baudOf(f){const fosc=m.fosc;
      if(f.mode===0)return fosc/12;if(f.mode===2)return fosc/f.per;
      if(f.unit==="t2")return fosc/2/(65536-(sfr[RCAP2H-0x80]<<8|sfr[RCAP2L-0x80]))/16;
      const md=(tmod()>>4)&3,cnt=md===2?256-sfr[TH1-0x80]:md===1?65536:8192;return fosc/12/cnt/f.per}
    /* Phát (theo mô tả của Intel MCS-51):
       - chế độ 0: sau lệnh ghi SBUF có một chu kỳ máy chờ, rồi 8 bit, mỗi bit một chu kỳ máy; TI bật ở chu kỳ thứ 10;
       - chế độ 1, 2, 3: bit START bắt đầu ở lần quay vòng kế tiếp của bộ chia 16 (đồng bộ với nhịp baud, không phải lúc ghi SBUF);
         TI bật lúc bắt đầu bit STOP (sau 9 bit ở chế độ 1, 10 bit ở chế độ 2, 3). */
    function startTx(v){const f=frameCfg("tx");const s=scon();
      const bits=f.mode===0?[...Array(8)].map((_,i)=>(v>>i)&1):[0,...[...Array(8)].map((_,i)=>(v>>i)&1),...(f.mode>=2?[(s>>3)&1]:[]),1];
      S.tx={dir:"tx",b:v,mode:f.mode,unit:f.unit,per:f.per,bits,bitI:-1,cnt:0,c0:m.cyc,need:f.mode===0?9:f.mode===1?9:10,baud:baudOf(f),tb8:(s>>3)&1};
      m.tx.push({b:v,mode:f.mode,c0:m.cyc,cs:null,c1:null,baud:S.tx.baud,bits:bits.slice(),tb8:S.tx.tb8,per:f.per,unit:f.unit})}
    /* ghi SBUF khi khung trước đang ở bit STOP: khung trước kết thúc đúng lúc bit START của khung mới bắt đầu (cùng nhịp bộ chia 16) */
    function txStarted(){const L=m.tx,n=L.length;if(!n)return;L[n-1].cs=m.cyc;if(n>1&&L[n-2].c1==null)L[n-2].c1=m.cyc}
    function txdLevel(){const t=S.tx;if(!t||t.mode===0||t.bitI<0)return 1;return t.bits[Math.min(t.bitI,t.bits.length-1)]}
    /* g: số đếm của bộ chia (lần tràn Timer 1 hoặc nhịp thạch anh); chế độ 0 đếm theo chu kỳ máy */
    function serialUnit(t,g){
      if(t.mode===0){t.bitI++;if(t.dir==="tx"){if(t.bitI===0)txStarted();
          if(t.bitI===t.need){setS(0x02,1);const rec=m.tx[m.tx.length-1];if(rec)rec.c1=rec.cti=m.cyc;S.tx=null}}
        else if(t.bitI>=t.len+1){rxDone(t);S.rx=null}return}
      if(t.bitI<0){if(g%t.per)return;t.bitI=0;t.cnt=0;if(t.dir==="tx")txStarted();return}
      if(++t.cnt<t.per)return;t.cnt=0;t.bitI++;
      if(t.dir==="tx"){if(t.bitI===t.need){setS(0x02,1);const rec=m.tx[m.tx.length-1];if(rec)rec.cti=m.cyc}
        if(t.bitI>=t.bits.length){const rec=m.tx[m.tx.length-1];if(rec)rec.c1=m.cyc;S.tx=null}}
      else if(t.bitI>=t.len){rxDone(t);S.rx=null}}
    /* gap: số thời gian bit đường RXD nghỉ (mức 1) trước bit START của byte này, tính từ lúc khung trước nhận xong
       (byte đầu: từ chu kỳ 0); 0 = đến liền nhau như trước */
    m.uartIn=(b,b9,gap)=>{m.rxQ.push({b:b&255,b9:b9?1:0,gap:Math.max(0,+gap||0)})};
    /* list: chuỗi, hoặc mảng phần tử byte | ký tự | {b|byte, gapBits} (setup.uart của bộ thử, preset.uart của ví dụ) */
    m.uartFeed=list=>{if(list==null)return;(typeof list==="string"?[...list]:list).forEach(x=>{
      if(x&&typeof x==="object"){const v=x.b!=null?x.b:x.byte;m.uartIn(typeof v==="string"?v.charCodeAt(0):v,x.b9,x.gapBits)}
      else m.uartIn(typeof x==="string"?x.charCodeAt(0):x)})};
    function rxStart(){const s=scon();if(!m.rxQ.length||!(s&0x10))return;const f=frameCfg("rx");
      if(f.mode===0&&(s&1))return;
      const q=m.rxQ[0];
      if(q.gap&&m.cyc<(S.rxEnd||0)+Math.ceil(q.gap*m.fosc/12/baudOf(f)))return;   /* đường RXD còn nghỉ */
      S.rx={dir:"rx",b:q.b,b9:q.b9,mode:f.mode,unit:f.unit,per:f.per,bitI:f.mode===0?0:-1,cnt:0,len:f.mode===0?8:f.bits,c0:m.cyc,baud:baudOf(f)}}
    function rxDone(t){m.rxQ.shift();S.rxEnd=m.cyc;const s=scon(),sm2=(s>>5)&1;
      const stop=t.mode===1?1:t.b9;let ok=!(s&1);
      if(t.mode===1&&sm2&&!stop)ok=false;if(t.mode>=2&&sm2&&!t.b9)ok=false;
      (m.rxLog=m.rxLog||[]).push({b:t.b,c0:t.c0,c1:m.cyc,mode:t.mode,ok,baud:t.baud});
      if(!ok){if(s&1)warn("Byte nhận qua UART bị mất vì RI vẫn còn bằng 1 (chương trình chưa đọc SBUF và xóa RI).");return}
      S.sbufR=t.b;if(t.mode>=2)setS(0x04,t.b9);else if(t.mode===1)setS(0x04,stop);setS(0x01,1)}
    /* ---------- nhật ký tín hiệu cho đồ thị thời gian ---------- */
    let lastSig=-1;
    function sig(){const tc=tcon(),sc=scon(),t2=sfr[T2CON-0x80],p3=pins(3);return tc|((sc&3)<<8)|((m.inLo?1:0)<<10)|((m.inHi?1:0)<<11)|(txdLevel()<<12)|(pins(1)<<13)|(((p3>>2)&3)<<21)
      |((t2>>2&1)<<23)|((t2>>7&1)<<24)|((t2>>6&1)<<25)|(((p3>>4)&3)<<26)}   // bit 23–25: TR2, TF2, EXF2; bit 26, 27: chân T0 (P3.4), T1 (P3.5)
    function sample(){const v=sig();if(v!==lastSig){lastSig=v;const T=m.trace;T.push(m.cyc,v);if(T.length>120000)T.splice(0,60000)}}
    /* ---------- ngắt ---------- */
    function pending(){const ie=sfr[IE-0x80];if(!(ie&0x80))return null;const tc=tcon(),sc=scon(),ip=sfr[IP-0x80],t2=sfr[T2CON-0x80];
      const fl=[tc&0x02,tc&0x20,tc&0x08,tc&0x80,sc&0x03,t2req()];let best=null;
      for(let i=0;i<6;i++){if(!fl[i]||!(ie>>i&1))continue;const hi=(ip>>i)&1;
        /* cờ được lấy mẫu ở S5P2 và chỉ được hỏi vòng ở chu kỳ máy SAU đó: cờ bật trong chu kỳ cuối của lệnh vừa xong
           (kể cả cờ do chính lệnh đó ghi) chỉ được phục vụ sau lệnh kế tiếp */
        if(S.rise[i]>=m.cyc)continue;
        if(m.inHi||(m.inLo&&!hi))continue;
        if(!best||(hi&&!best.hi))best={i,hi}}
      return best}
    function vector(p){const V=VEC[p.i];push(m.pc&255);push(m.pc>>8);
      if(p.i===0&&(tcon()&1))setT(0x02,0);if(p.i===2&&(tcon()&4))setT(0x08,0);if(p.i===1)setT(0x20,0);if(p.i===3)setT(0x80,0);
      if(p.hi)m.inHi=true;else m.inLo=true;m.isrStack.push(p.hi?1:0);
      const from=m.pc;m.pc=V.v;tick();tick();return {irq:V.n,vec:V.v,from,hi:p.hi,flag:V.f}}
    /* ---------- thực hiện một lệnh ---------- */
    function exec(){const pc0=m.pc,op=rom[pc0];const I=OPS[op];m.pc0=pc0;
      if(m.strict&&m.used&&!m.used[pc0])runErr(`PC = ${hx4(pc0)}H nằm ngoài vùng có mã (chương trình chạy quá lệnh cuối?). Kết thúc chương trình 8051 bằng vòng lặp SJMP $ để CPU dừng tại chỗ.`);
      if(!I)runErr(`Mã lệnh ${hx2(op)}H tại ${hx4(pc0)}H không có trong tập lệnh 8051 (byte dữ liệu bị chạy như lệnh?).`);
      const b1=rom[(pc0+1)&0xFFFF],b2=rom[(pc0+2)&0xFFFF];let pc=(pc0+I.n)&0xFFFF;
      const rel=r=>(pc+(r<128?r:r-256))&0xFFFF;
      const lo=op&15,hi=op>>4;
      /* nguồn chung của nhóm ALU: 4 #data, 5 direct, 6–7 @Ri, 8–F Rn */
      const src=()=>lo===4?b1:lo===5?rd(b1):lo<8?ird(Rn(lo&1)):Rn(lo-8);
      switch(op){
        case 0x00:break;
        case 0x02:pc=b1<<8|b2;break;
        case 0x03:{const a=A();setA(a>>1|(a&1)<<7);break}
        case 0x04:setA(A()+1);break;
        case 0x05:wr(b1,rdL(b1)+1);break;
        case 0x06:case 0x07:{const r=Rn(op&1);iwr(r,ird(r)+1);break}
        case 0x10:if(rdBitL(b1)){wrBit(b1,0);pc=rel(b2)}break;
        case 0x12:m.pc=pc;push(pc&255);push(pc>>8);pc=b1<<8|b2;break;
        case 0x13:{const a=A(),c=CY();setCY(a&1);setA(a>>1|c<<7);break}
        case 0x14:setA(A()-1);break;
        case 0x15:wr(b1,rdL(b1)-1);break;
        case 0x16:case 0x17:{const r=Rn(op&1);iwr(r,ird(r)-1);break}
        case 0x20:if(rdBit(b1))pc=rel(b2);break;
        case 0x22:{const h=pop(),l=pop();pc=h<<8|l;break}
        case 0x23:{const a=A();setA(a<<1|a>>7);break}
        case 0x30:if(!rdBit(b1))pc=rel(b2);break;
        case 0x32:{const h=pop(),l=pop();pc=h<<8|l;const lv=m.isrStack.pop();if(m.inHi&&lv!==0)m.inHi=false;else m.inLo=false;m.block=true;if(lv===undefined)warn("RETI được thực hiện khi không có ngắt nào đang được phục vụ (gọi RETI thay cho RET?).");break}
        case 0x33:{const a=A(),c=CY();setCY(a>>7);setA(a<<1|c);break}
        case 0x40:if(CY())pc=rel(b1);break;
        case 0x42:wr(b1,rdL(b1)|A());break;
        case 0x43:wr(b1,rdL(b1)|b2);break;
        case 0x50:if(!CY())pc=rel(b1);break;
        case 0x52:wr(b1,rdL(b1)&A());break;
        case 0x53:wr(b1,rdL(b1)&b2);break;
        case 0x60:if(!A())pc=rel(b1);break;
        case 0x62:wr(b1,rdL(b1)^A());break;
        case 0x63:wr(b1,rdL(b1)^b2);break;
        case 0x70:if(A())pc=rel(b1);break;
        case 0x72:setCY(CY()|rdBit(b1));break;
        case 0x73:pc=(A()+dptr())&0xFFFF;break;
        case 0x74:setA(b1);break;
        case 0x75:wr(b1,b2);break;
        case 0x76:case 0x77:iwr(Rn(op&1),b1);break;
        case 0x80:pc=rel(b1);break;
        case 0x82:setCY(CY()&rdBit(b1));break;
        case 0x83:setA(rom[(A()+pc)&0xFFFF]);break;
        case 0x84:{const a=A(),b=sfr[0x70];if(!b){setF(0,(psw()>>6)&1,1);m.divZero=true;warn("DIV AB với B = 0: kết quả không xác định, cờ OV = 1.");}else{setA(Math.floor(a/b));sfr[0x70]=a%b;setF(0,(psw()>>6)&1,0)}break}
        case 0x85:wr(b2,rd(b1));break;
        case 0x86:case 0x87:wr(b1,ird(Rn(op&1)));break;
        case 0x90:setDptr(b1<<8|b2);break;
        case 0x92:wrBit(b1,CY());break;
        case 0x93:setA(rom[(A()+dptr())&0xFFFF]);break;
        case 0xA0:setCY(CY()|(rdBit(b1)^1));break;
        case 0xA2:setCY(rdBit(b1));break;
        case 0xA3:setDptr(dptr()+1);break;
        case 0xA4:{const p=A()*sfr[0x70];setA(p);sfr[0x70]=p>>8;setF(0,(psw()>>6)&1,p>255);break}
        case 0xA6:case 0xA7:iwr(Rn(op&1),rd(b1));break;
        case 0xB0:setCY(CY()&(rdBit(b1)^1));break;
        case 0xB2:wrBit(b1,rdBitL(b1)^1);break;
        case 0xB3:setCY(CY()^1);break;
        case 0xB4:case 0xB5:{const a=A(),v=op===0xB4?b1:rd(b1);setCY(a<v);if(a!==v)pc=rel(b2);break}
        case 0xB6:case 0xB7:{const a=ird(Rn(op&1));setCY(a<b1);if(a!==b1)pc=rel(b2);break}
        case 0xC0:{/* SP tăng trước rồi mới đọc toán hạng (PUSH SP cất giá trị SP mới) */const s=(sfr[1]+1)&255;sfr[1]=s;const v=rd(b1);sfr[1]=(s-1)&255;push(v);break}
        case 0xC2:wrBit(b1,0);break;
        case 0xC3:setCY(0);break;
        case 0xC4:{const a=A();setA(a<<4|a>>4);break}
        case 0xC5:{const a=A(),v=rd(b1);setA(v);wr(b1,a);break}
        case 0xC6:case 0xC7:{const r=Rn(op&1),a=A();setA(ird(r));iwr(r,a);break}
        case 0xD0:{const v=pop();wr(b1,v);break}
        case 0xD2:wrBit(b1,1);break;
        case 0xD3:setCY(1);break;
        case 0xD4:{let a=A(),c=CY();if((a&15)>9||(psw()&0x40)){a+=6;if(a>0xFF)c=1;a&=0xFF}if((a>>4)>9||c){a+=0x60;if(a>0xFF)c=1;a&=0xFF}setA(a);setCY(c);break}
        case 0xD5:{const v=(rdL(b1)-1)&255;wr(b1,v);if(v)pc=rel(b2);break}
        case 0xD6:case 0xD7:{const r=Rn(op&1),a=A(),v=ird(r);setA(a&0xF0|v&15);iwr(r,v&0xF0|a&15);break}
        case 0xE0:setA(xram[dptr()]);break;
        case 0xE2:case 0xE3:setA(xram[sfr[0x20]<<8|Rn(op&1)]);break;   /* MOVX @Ri: byte cao của địa chỉ lấy từ chốt P2 */
        case 0xE4:setA(0);break;
        case 0xF0:xw(dptr(),A());break;
        case 0xF2:case 0xF3:xw(sfr[0x20]<<8|Rn(op&1),A());break;
        case 0xF4:setA(~A());break;
        case 0xF5:wr(b1,A());break;
        default:
          if((op&0x1F)===0x01){pc=((pc&0xF800)|(op>>5)<<8|b1);break}
          if((op&0x1F)===0x11){m.pc=pc;push(pc&255);push(pc>>8);pc=((pc&0xF800)|(op>>5)<<8|b1);break}
          if(lo>=8){const r=lo-8;
            switch(hi){case 0:setRn(r,Rn(r)+1);break;case 1:setRn(r,Rn(r)-1);break;case 7:setRn(r,b1);break;case 8:wr(b1,Rn(r));break;
              case 0xA:setRn(r,rd(b1));break;case 0xB:{const v=Rn(r);setCY(v<b1);if(v!==b1)pc=rel(b2);break}
              case 0xC:{const a=A();setA(Rn(r));setRn(r,a);break}case 0xD:{const v=(Rn(r)-1)&255;setRn(r,v);if(v)pc=rel(b1);break}
              case 0xE:setA(Rn(r));break;case 0xF:setRn(r,A());break;
              default:alu(hi,src())}}
          else if(lo>=4){if(hi===0xE){setA(lo===5?rd(b1):ird(Rn(lo&1)))}else if(hi===0xF){if(lo===6||lo===7)iwr(Rn(lo&1),A())}else alu(hi,src())}
          else runErr(`Mã lệnh ${hx2(op)}H chưa được xử lý.`)}
      m.pc=pc;
      /* cờ chẵn lẻ P luôn phản ánh A */
      sfr[0x50]=(sfr[0x50]&0xFE)|par(sfr[0x60]);
      return I}
    function alu(hi,v){switch(hi){case 2:add(v,0);break;case 3:add(v,CY());break;case 4:setA(A()|v);break;case 5:setA(A()&v);break;case 6:setA(A()^v);break;case 9:subb(v);break}}
    function xw(a,v){if(S.xUndo)S.xUndo.push(a,xram[a]);xram[a]=v&255}
    /* ---------- một bước: một lệnh, hoặc lệnh gọi ngắt do phần cứng chèn vào ---------- */
    m.step=function(){m.pc0=m.pc;const c0=m.cyc;
      try{
        if(!m.block){const p=pending();if(p){const r=vector(p);sample();r.c=m.cyc-c0;r.pc=m.pc0;r.n=0;r.text=`(phần cứng) LCALL ${hx4(r.vec)}H · ngắt ${r.irq}`;return r}}
        m.block=false;
        /* mô hình thời gian (giống ucsim s51): các chu kỳ máy của lệnh được đếm cho timer, UART, chân ngắt TRƯỚC khi lệnh
           đổi thanh ghi. Vì vậy lệnh ghi TRx, TMOD, chốt cổng… có tác dụng từ lệnh kế tiếp; lệnh đọc cờ (JNB TF0…) thấy cờ
           vừa được đặt trong chính các chu kỳ của nó. */
        const pc0=m.pc,op=m.rom[pc0],I0=OPS[op];
        const pre=I0?(m.preTicks?m.preTicks(op):PRE[op]??I0.c):0;
        for(let k=0;k<pre;k++)tick();
        const I=exec();m.nIns++;for(let k=pre;k<I.c;k++)tick();rises();
        /* chữ của lệnh chỉ dịch ngược khi cần (chạy nhanh không tốn công) */
        const rom_=m.rom;return {pc:pc0,op,n:I.n,c:m.cyc-c0,get text(){return ISA.disasm(rom_,pc0).t},halt:op===0x80&&m.rom[pc0+1]===0xFE}
      }catch(e){if(e instanceof RunErr){m.halted=true;m.pc=m.pc0;return {pc:m.pc0,err:e.message,c:m.cyc-c0}}throw e}};
    /* chạy tới khi gặp điều kiện dừng: hết số chu kỳ, gặp SJMP $ (không còn ngắt nào có thể xảy ra), lỗi */
    m.runUntil=function(maxCyc,stopFn){const lim=m.cyc+maxCyc;let r=null;
      while(m.cyc<lim){r=m.step();if(r.err)return {stop:"err",r};if(stopFn&&stopFn(r))return {stop:"fn",r};
        if(r.halt&&idle())return {stop:"halt",r}}
      return {stop:"limit",r}};
    /* SJMP $ mà không còn gì có thể đánh thức CPU: ngắt tắt, hoặc không có nguồn ngắt nào đang chạy */
    function idle(){const ie=sfr[IE-0x80],tc=tcon();if(S.tx)return false;   // chờ gửi xong khung UART đang phát
      if(!(ie&0x80))return true;
      /* cờ ngắt đã bật sẵn (kể cả do phần mềm đặt, timer đã dừng) và không bị chương trình ngắt cùng/cao mức chặn: CPU sẽ còn vào ngắt */
      {const f=flagMask()&ie&0x3F,ip=sfr[IP-0x80];for(let i=0;i<6;i++)if(f>>i&1&&!(m.inHi||(m.inLo&&!(ip>>i&1))))return false}
      if(ie&0x01||ie&0x04)return false;            // ngắt ngoài: còn chờ nút bấm
      if(ie&0x02&&(tc&0x10))return false;if(ie&0x08&&(tc&0x40||(tmod()&3)===3&&tc&0x40))return false;
      if(ie&0x10&&(S.tx||S.rx||m.rxQ.length||scon()&3))return false;
      if(ie&0x20&&m.ramSize===256&&(sfr[T2CON-0x80]&4))return false;   // Timer 2 đang chạy
      return true}
    m.idle=idle;
    /* ---------- trạng thái ---------- */
    m.reset=function(){sfr.fill(0);for(const p of PORTS)sfr[p-0x80]=0xFF;sfr[SP-0x80]=7;m.pc=0;m.cyc=0;m.inLo=m.inHi=false;m.block=false;m.isrStack=[];
      m.halted=false;m.trace=[];m.tx=[];m.rxLog=[];m.warns=[];m.nIns=0;S=fresh();lastSig=-1;sample()};
    m.load=function(r,used){m.rom.set(r);m.used=used||null;rom=m.rom};
    m.reg=function(n){n=n.toUpperCase();const p=psw();
      switch(n){case "A":case "ACC":return A();case "B":return sfr[0x70];case "DPTR":return dptr();case "SP":return sfr[1];case "PSW":return p;case "PC":return m.pc;
        case "CY":case "C":return p>>7;case "AC":return (p>>6)&1;case "F0":return (p>>5)&1;case "RS":return (p>>3)&3;case "OV":return (p>>2)&1;case "P":return p&1;
        case "DPL":return sfr[2];case "DPH":return sfr[3]}
      if(/^R[0-7]$/.test(n))return Rn(+n[1]);
      if(ISA.SFR[n]!=null)return rdL(ISA.SFR[n]);
      if(ISA.BITN[n]!=null)return rdBitL(ISA.BITN[n]);
      return undefined};
    m.rd=a=>a<0x80?iram[a]:rdL(a);m.rdPins=rd;
    m.bit=b=>rdBitL(b);
    m.setReg=function(n,v){n=n.toUpperCase();if(n==="A"||n==="ACC"){setA(v);sfr[0x50]=(sfr[0x50]&0xFE)|par(sfr[0x60])}else if(n==="DPTR")setDptr(v);else if(n==="PC")m.pc=v&0xFFFF;else if(/^R[0-7]$/.test(n))setRn(+n[1],v);else if(ISA.SFR[n]!=null)sfr[ISA.SFR[n]-0x80]=v&255};
    m.snap=function(){const x=[];S.xUndo=null;const sv=JSON.parse(JSON.stringify(S));S.xUndo=x;
      return {iram:iram.slice(),sfr:sfr.slice(),pc:m.pc,cyc:m.cyc,inLo:m.inLo,inHi:m.inHi,block:m.block,isr:m.isrStack.slice(),
      S:sv,tr:m.trace.length,tx:m.tx.length,txLast:m.tx.length?Object.assign({},m.tx[m.tx.length-1]):null,rxQ:m.rxQ.slice(),rxLog:(m.rxLog||[]).length,warns:m.warns.length,lastSig,nIns:m.nIns,halted:m.halted,x}};
    m.restore=function(s,list){/* list: các bản chụp từ s tới bản mới nhất (kể cả s): hoàn tác các lần ghi RAM ngoài theo thứ tự ngược */
      const L=list||[s];for(let k=L.length-1;k>=0;k--){const u=L[k].x;for(let j=u.length-2;j>=0;j-=2)xram[u[j]]=u[j+1]}
      iram.set(s.iram);sfr.set(s.sfr);m.pc=s.pc;m.cyc=s.cyc;m.inLo=s.inLo;m.inHi=s.inHi;m.block=s.block;m.isrStack=s.isr.slice();
      S=JSON.parse(JSON.stringify(s.S));S.xUndo=null;m.trace.length=Math.min(m.trace.length,s.tr);m.tx.length=s.tx;if(s.txLast&&m.tx.length)m.tx[m.tx.length-1]=Object.assign({},s.txLast);
      m.rxQ=s.rxQ.slice();if(m.rxLog)m.rxLog.length=s.rxLog;m.warns.length=s.warns;lastSig=s.lastSig;m.nIns=s.nIns;m.halted=s.halted};
    m.uartState=()=>({tx:S.tx,rx:S.rx,sbufR:S.sbufR,baud:baudOf(frameCfg("tx")),cfg:frameCfg("tx")});
    m.time=()=>m.cyc*12/m.fosc;
    m.VEC=VEC;
    m.reset();
    return m}
  /* ---------- chấm bài: chạy chương trình và so trạng thái cuối ----------
     spec = {setup:{iram:{30H:…}, xram:{…}, regs:{A:…}, pins:{P1:…}, uart:[byte | {b, gapBits}…]}, maxCycles,
             expect:{regs:{A:…}, iram:{địa_chỉ:giá_trị}, xram:{…}, ports:{P1:…}, bits:{CY:1}, uart:"chuỗi" | [byte…]},
             maxCyc (giới hạn chu kỳ để đạt), minCyc (số chu kỳ tối thiểu: chương trình phải còn làm đủ phần việc bắt buộc,
             ví dụ vòng bận của main khi đề chỉ cho sửa ISR), maxBytes (giới hạn số byte mã)}
     Thêm (sau tích hợp AMTS-EMB-001):
       setup.gate {P1:"P3.7=0"}: mức chân setup.pins của cổng chỉ có khi bit chốt thỏa điều kiện (thiết bị chỉ xuất dữ liệu khi được chọn,
         ví dụ ADC xuất mã khi RD = 0); ngoài lúc đó cổng thả (đọc FFH);
       expect.seq {"P3.7":[1,0,1]}: dãy mức của bit (Px.y = bit chốt; tên bit như TF0) trong cả lần chạy (bỏ mức lặp liền nhau, tính cả mức ban đầu) — kiểm trình tự tín hiệu;
       expect.rise {"TF0":1}: bit phải chuyển 0 → 1 ít nhất từng ấy lần (ví dụ bắt buộc dùng Timer 0 tràn thật, không chỉ cho kết quả đúng).
     Thêm (quyết định của chủ khóa 06/11/2026, Bài 36):
       setup.uart phần tử {b: byte, gapBits: n}: đường RXD nghỉ n thời gian bit trước bit START của byte đó (tính từ lúc khung trước
         nhận xong; byte đầu tính từ chu kỳ 0) — bộ thử có khoảng nghỉ giữa các lệnh; phần tử byte/ký tự thường vẫn đến liền nhau.
     → {ok, pass, msgs:[…], cycles, bytes, stop} */
  function grade(src,spec,opt){const ASM=typeof MCU51ASM!=="undefined"?MCU51ASM:require("./52-mcu51-asm.js");
    const r=ASM.assemble(src);if(!r.ok)return {ok:false,pass:false,msgs:r.errors.map(e=>`Dòng ${e.line}: ${e.msg}`),cycles:0,bytes:0,stop:"asm"};
    const cases=spec.cases||[spec];let all=true,msgs=[],cyc=0;
    for(let ci=0;ci<cases.length;ci++){const sp=Object.assign({},spec,cases[ci]);const m=create(Object.assign({fosc:spec.fosc},opt||{}));m.load(r.rom,r.used);
      const su=sp.setup||{};
      for(const k in su.iram||{})m.iram[+k]=su.iram[k]&255;for(const k in su.xram||{})m.xram[+k]=su.xram[k]&255;
      for(const k in su.regs||{})m.setReg(k,su.regs[k]);
      const PN={P0:0,P1:1,P2:2,P3:3};for(const k in su.pins||{})m.ext[PN[k]]=su.pins[k]&255;
      const bitSpec=t=>{const g=/^P([0-3])\.([0-7])$/.exec(String(t).trim().toUpperCase());return g?[+g[1],+g[2]]:null};
      if(su.gate){const G={};for(const k in su.gate){const g=/^(.+)=([01])$/.exec(String(su.gate[k]).replace(/\s+/g,""));const b=g&&bitSpec(g[1]);if(b&&PN[k]!=null)G[PN[k]]=[b[0],b[1],+g[2]]}
        m.extFn=(i,lt)=>{const g=G[i];return g&&((lt(g[0])>>g[1])&1)!==g[2]?255:m.ext[i]}}
      m.uartFeed(su.uart);
      const ex=sp.expect||{};const SQ={};
      /* bit theo dõi: Px.y = bit CHỐT của cổng; tên bit khác (TF0, TR0, CY…) = giá trị bit như lệnh đọc–sửa–ghi thấy */
      const bitFn=k=>{const b=bitSpec(k);if(b)return ()=>(m.latch(b[0])>>b[1])&1;const v=m.reg(String(k));return v===0||v===1?()=>m.reg(String(k)):null};
      for(const k of [...Object.keys(ex.seq||{}),...Object.keys(ex.rise||{})]){if(SQ[k])continue;const f=bitFn(k);if(f)SQ[k]={f,v:[f()]}}
      const sqk=Object.keys(SQ);const sqFn=sqk.length?()=>{for(const k of sqk){const q=SQ[k],v=q.f();if(q.v[q.v.length-1]!==v)q.v.push(v)}return false}:null;
      const res=m.runUntil(sp.maxCycles||200000,sqFn);
      const pre=cases.length>1?`Bộ thử ${ci+1}: `:"";
      if(res.stop==="err"){all=false;msgs.push(pre+"Lỗi khi chạy: "+res.r.err);continue}
      if(res.stop==="limit"&&!sp.allowLimit){all=false;msgs.push(pre+`Chương trình chưa dừng sau ${sp.maxCycles||200000} chu kỳ máy (vòng lặp không thoát? thiếu SJMP $ ở cuối?).`);continue}
      cyc=Math.max(cyc,m.cyc);const H=v=>hx2(v)+"H";
      for(const k in ex.seq||{}){const got=(SQ[k]||{v:[]}).v,want=ex.seq[k];if(got.length!==want.length||got.some((v,j)=>v!==want[j])){all=false;msgs.push(pre+`${k} đổi mức theo thứ tự ${got.slice(0,12).join(" → ")}${got.length>12?" …":""}, cần ${want.join(" → ")}.`)}}
      for(const k in ex.rise||{}){const got=(SQ[k]||{v:[]}).v;let n=0;for(let j=1;j<got.length;j++)if(got[j-1]===0&&got[j]===1)n++;
        if(n<(+ex.rise[k]||1)){all=false;msgs.push(pre+`${k} chưa lần nào chuyển 0 → 1 trong lúc chạy${(+ex.rise[k]||1)>1?` đủ ${ex.rise[k]} lần`:""} (đề yêu cầu dùng phần cứng này).`)}}
      for(const k in ex.regs||{}){const v=m.reg(k);if(v!==ex.regs[k]){all=false;msgs.push(pre+`${k} = ${k==="DPTR"||k==="PC"?hx4(v)+"H":H(v)}, cần ${k==="DPTR"||k==="PC"?hx4(ex.regs[k])+"H":H(ex.regs[k])}.`)}}
      for(const k in ex.bits||{}){const v=m.reg(k);if(v!==ex.bits[k]){all=false;msgs.push(pre+`Bit ${k} = ${v}, cần ${ex.bits[k]}.`)}}
      for(const k in ex.iram||{}){const v=m.iram[+k];if(v!==(ex.iram[k]&255)){all=false;msgs.push(pre+`RAM trong [${H(+k)}] = ${H(v)}, cần ${H(ex.iram[k])}.`)}}
      for(const k in ex.xram||{}){const v=m.xram[+k];if(v!==(ex.xram[k]&255)){all=false;msgs.push(pre+`RAM ngoài [${hx4(+k)}H] = ${H(v)}, cần ${H(ex.xram[k])}.`)}}
      for(const k in ex.ports||{}){const v=m.latch(PN[k]);if(v!==ex.ports[k]){all=false;msgs.push(pre+`Cổng ${k} = ${H(v)}, cần ${H(ex.ports[k])}.`)}}
      if(ex.uart!=null){const got=m.tx.filter(t=>t.cs!=null).map(t=>t.b),   /* chỉ khung đã thật sự bắt đầu phát (byte ghi đè SBUF trước bit START không ra đường TXD) */
        want=typeof ex.uart==="string"?[...ex.uart].map(c=>c.charCodeAt(0)):ex.uart;
        if(got.length!==want.length||got.some((b,i)=>b!==want[i])){all=false;msgs.push(pre+`UART gửi ${JSON.stringify(String.fromCharCode(...got))}, cần ${JSON.stringify(String.fromCharCode(...want))}.`)}}
      if(sp.maxCyc&&m.cyc>sp.maxCyc){all=false;msgs.push(pre+`Chạy mất ${m.cyc} chu kỳ máy, cần không quá ${sp.maxCyc}.`)}
      if(sp.minCyc&&m.cyc<sp.minCyc){all=false;msgs.push(pre+`Chạy chỉ mất ${m.cyc} chu kỳ máy, ít hơn ${sp.minCyc}: chương trình đã bỏ bớt phần việc bắt buộc của đề.`)}}
    if(spec.maxBytes&&r.size>spec.maxBytes){all=false;msgs.push(`Mã dài ${r.size} byte, cần không quá ${spec.maxBytes} byte.`)}
    return {ok:true,pass:all,msgs,cycles:cyc,bytes:r.size,stop:"done"}}
  /* phiên bản mô hình máy (AMTS-MATH-SCI-001: đổi mô hình thì tăng số và chạy lại tools/mcu51-test); nhật ký: docs/TRINH-MO-PHONG-8051.md */
  return {create,grade,VEC,VERSION:"1.1.0"};
})();
if(typeof module!=="undefined")module.exports=MCU51CPU;
/* ===================== trình mô phỏng của khóa (platform/js/54-mcu51-dev.js) ===================== */
/* ===================== Trình mô phỏng 8051 · 4/5: thiết bị ảo (mô hình, không dùng DOM) =====================
   MCU51DEV.attach(m, cấu hình) → bộ thiết bị nối vào máy m (m.onPort, m.extFn). Mỗi thiết bị có snap()/restore() để Lùi bước.
   Cách nối mặc định (giả định, đổi được theo từng ví dụ; docs/TRINH-MO-PHONG-8051.md mục "Thiết bị ảo"):
     led    8 LED ở P1, sáng khi chân = 0 (anode nối nguồn qua điện trở, cathode vào chân)
     btn    nút K1 P3.2 (INT0), K2 P3.3 (INT1), K3 P3.4, K4 P3.5; bấm thì chân bị kéo xuống 0
     seg    LED 7 đoạn anode chung: đoạn a…g, dp ở P0.0…P0.7 (sáng khi bit = 0); 4 chữ số chọn bằng P2.0…P2.3 (mức 0 = chọn)
     key    ma trận phím 4×4: hàng P1.0…P1.3 (chương trình xuất 0 để quét), cột P1.4…P1.7 (đọc, có điện trở kéo lên)
     lcd    LCD 16×2 (tập lệnh HD44780): D0…D7 ở P2 (chế độ 4 bit dùng P2.4…P2.7), RS = P3.5, RW = P3.6, E = P3.7
     step   động cơ bước 4 pha (qua ULN2003): cuộn A, B, C, D ở P2.0…P2.3, mức 1 = có điện; 200 bước đủ / vòng (giả định)
     uart   cửa sổ terminal nối TXD/RXD */
const MCU51DEV=(function(){
  const PLUG={};   // thiết bị đăng ký thêm: PLUG[tên] = {def, make(m, cấu hình, {pin}) → thiết bị, html?, update?, bind?} (giao diện dùng html/update/bind)
  const pin=s=>{const m=/^P([0-3])\.([0-7])$/i.exec(String(s).trim());if(!m)throw new Error("Chân không hợp lệ: "+s);return {p:+m[1],b:+m[2]}};
  const EXT={};   // MCU51DEV.EXT[tên] = {DEF, attach(m, cấu hình, D) → thiết bị, html(cấu hình, thiết bị, m, công cụ)}: thêm thiết bị không sửa file này
  const DEF={
    led:{port:1,activeLow:true},
    btn:{pins:["P3.2","P3.3","P3.4","P3.5"],names:["K1 (INT0)","K2 (INT1)","K3 (T0)","K4 (T1)"]},
    seg:{port:0,sel:["P2.0","P2.1","P2.2","P2.3"],activeLow:true,selLow:true,digits:4},
    key:{rows:["P1.0","P1.1","P1.2","P1.3"],cols:["P1.4","P1.5","P1.6","P1.7"],labels:["1","2","3","A","4","5","6","B","7","8","9","C","*","0","#","D"]},
    lcd:{port:2,rs:"P3.5",rw:"P3.6",e:"P3.7"},
    step:{pins:["P2.0","P2.1","P2.2","P2.3"],stepsPerRev:200}};
  function attach(m,cfg){cfg=cfg||{};const D={list:[],m};
    const use=k=>cfg[k]?Object.assign({},DEF[k],cfg[k]===true?{}:cfg[k]):null;
    const pinV=(P,s)=>(m.latch(s.p)>>s.b)&1;               // mức chốt do CPU xuất
    /* ---------- LED ---------- */
    if(use("led")){const c=use("led");const L={kind:"led",c,on:new Float64Array(8),t0:m.cyc,last:m.cyc,
      lit(){const v=m.pins(c.port);return [...Array(8)].map((_,i)=>c.activeLow?!((v>>i)&1):!!((v>>i)&1))},
      acc(t){const dt=t-L.last;if(dt>0){const s=L.lit();for(let i=0;i<8;i++)if(s[i])L.on[i]+=dt}L.last=t},
      /* độ sáng trung bình kể từ lần hỏi trước (để thấy PWM) */
      duty(){L.acc(m.cyc);const span=m.cyc-L.t0;const r=[...L.on].map(x=>span>0?x/span:0);L.on.fill(0);L.t0=m.cyc;return span>0?r:L.lit().map(x=>x?1:0)},
      prePort(p){if(p===c.port)L.acc(m.cyc)},snap:()=>null,restore(){L.on.fill(0);L.t0=L.last=m.cyc}};D.list.push(L);D.led=L}
    /* ---------- nút bấm ---------- */
    if(use("btn")){const c=use("btn");const B={kind:"btn",c,pins:c.pins.map(pin),down:new Set(),
      drive(p){let mask=255;B.pins.forEach((s,i)=>{if(s.p===p&&B.down.has(i))mask&=~(1<<s.b)});return mask},
      set(i,on){if(on)B.down.add(i);else B.down.delete(i)},snap:()=>null,restore(){}};D.list.push(B);D.btn=B}
    /* ---------- ma trận phím ---------- */
    if(use("key")){const c=use("key");const K={kind:"key",c,rows:c.rows.map(pin),cols:c.cols.map(pin),down:null,
      drive(p){if(K.down==null)return 255;const r=K.rows[K.down>>2],q=K.cols[K.down&3];let mask=255;
        /* phím nối hàng r với cột q: một bên ở mức 0 thì kéo bên kia xuống 0 */
        if(pinV(p,r)===0&&q.p===p)mask&=~(1<<q.b);if(pinV(p,q)===0&&r.p===p)mask&=~(1<<r.b);return mask},
      snap:()=>null,restore(){}};D.list.push(K);D.key=K}
    /* ---------- LED 7 đoạn quét ---------- */
    if(use("seg")){const c=use("seg");const n=c.sel&&c.sel.length?Math.min(c.digits||c.sel.length,c.sel.length):1;
      const G={kind:"seg",c,n,sel:(c.sel||[]).slice(0,n).map(pin),pat:new Array(n).fill(0),seen:new Array(n).fill(-1e12),on:new Float64Array(n*8),t0:m.cyc,last:m.cyc,
        cur(){const v=m.pins(c.port);const segs=c.activeLow?(~v)&255:v;return G.sel.length?G.sel.map(s=>{const on=((m.pins(s.p)>>s.b)&1)===(c.selLow?0:1);return on?segs:0}):[segs]},
        acc(t){const dt=t-G.last;if(dt>0){const cu=G.cur();cu.forEach((sg,d)=>{if(sg){for(let k=0;k<8;k++)if(sg>>k&1)G.on[d*8+k]+=dt;G.pat[d]=sg;G.seen[d]=t}})}G.last=t},
        /* độ sáng từng đoạn trong khoảng vừa qua (quét nhanh thì mọi chữ số cùng sáng, mờ hơn) */
        light(){G.acc(m.cyc);const span=m.cyc-G.t0;let out;
          if(span>200){out=[...Array(G.n)].map((_,d)=>[...Array(8)].map((_,k)=>Math.min(1,G.on[d*8+k]/span*G.n)))}
          else{const cu=G.cur();out=cu.map(sg=>[...Array(8)].map((_,k)=>sg>>k&1))}
          G.on.fill(0);G.t0=m.cyc;return out},
        prePort(){G.acc(m.cyc)},snap:()=>null,restore(){G.on.fill(0);G.t0=G.last=m.cyc}};D.list.push(G);D.seg=G}
    /* ---------- LCD 16×2, tập lệnh HD44780 (phần hay dùng) ---------- */
    if(use("lcd")){const c=use("lcd");const rs=pin(c.rs),rw=pin(c.rw),e=pin(c.e);
      const us=x=>Math.ceil(x*1e-6*m.fosc/12);          // micro giây → chu kỳ máy
      const L={kind:"lcd",c,st:null,
        reset(){L.st={dd:new Array(128).fill(32),cg:new Array(64).fill(0),ac:0,cgMode:false,inc:1,shiftDisp:0,disp:0,cur:0,blink:0,dl8:1,lines2:0,
          half:null,busyTo:0,e:0,shift:0,log:[],warned:{}}},
        lvl:s=>(m.latch(s.p)>>s.b)&1,
        warn(k,t){if(!L.st.warned[k]){L.st.warned[k]=1;L.st.log.push(t);m.warns.push({t:"LCD: "+t,pc:m.pc0,c:m.cyc})}},
        busy:()=>m.cyc<L.st.busyTo,
        cmd(v){const s=L.st;let t=37;
          if(v&0x80){s.ac=v&0x7F;s.cgMode=false}
          else if(v&0x40){s.ac=v&0x3F;s.cgMode=true}
          else if(v&0x20){s.dl8=(v>>4)&1;s.lines2=(v>>3)&1;s.half=null}
          else if(v&0x10){const sc=(v>>3)&1,right=(v>>2)&1;if(sc)s.shift+=right?-1:1;else s.ac=(s.ac+(right?1:-1))&0x7F}
          else if(v&0x08){s.disp=(v>>2)&1;s.cur=(v>>1)&1;s.blink=v&1}
          else if(v&0x04){s.inc=(v>>1)&1?1:-1;s.shiftDisp=v&1}
          else if(v&0x02){s.ac=0;s.shift=0;s.cgMode=false;t=1520}
          else if(v&0x01){s.dd.fill(32);s.ac=0;s.shift=0;s.inc=1;s.cgMode=false;t=1520}
          s.busyTo=m.cyc+us(t)},
        data(v){const s=L.st;if(s.cgMode){s.cg[s.ac&63]=v&31;s.ac=(s.ac+s.inc)&63}else{s.dd[s.ac&127]=v;s.ac=(s.ac+s.inc)&127;if(s.shiftDisp)s.shift+=s.inc}
          s.busyTo=m.cyc+us(41)},
        latchByte(v){const s=L.st;
          if(L.busy())L.warn("busy","Ghi vào LCD khi LCD còn bận (chưa chờ đủ thời gian hoặc chưa đọc cờ BF): lệnh hoặc ký tự này bị bỏ qua. Cần chờ khoảng 40 µs sau mỗi lệnh, 1,6 ms sau lệnh xóa màn hình (0x01) và về đầu dòng (0x02).");
          else if(L.lvl(rs))L.data(v);else L.cmd(v)},
        onPort(){const s=L.st;const en=L.lvl(e);
          if(s.e&&!en&&!L.lvl(rw)){/* sườn xuống của E: LCD chốt dữ liệu */
            const v=m.latch(c.port);
            if(s.dl8)L.latchByte(v);
            else{const nib=v&0xF0;if(s.half==null)s.half=nib;else{const b=s.half|nib>>4;s.half=null;L.latchByte(b)}}}
          s.e=en},
        /* RW = 1, E = 1: LCD xuất cờ bận BF (bit 7) và bộ đếm địa chỉ AC lên chân dữ liệu */
        drive(p){if(p!==c.port||!L.lvl(rw)||!L.lvl(e))return 255;const s=L.st;const v=(L.busy()?0x80:0)|(s.ac&0x7F);return s.dl8?v:(s.half==null?(v&0xF0)|0x0F:(v<<4)&0xF0|0x0F)},
        text(){const s=L.st;const row=(base)=>[...Array(16)].map((_,i)=>s.dd[(base+((i+s.shift)%40+40)%40)&127]);return [row(0),row(0x40)]},
        snap:()=>JSON.stringify(L.st),restore(x){L.st=JSON.parse(x)}};
      L.reset();D.list.push(L);D.lcd=L}
    /* ---------- động cơ bước ---------- */
    if(use("step")){const c=use("step");const ps=c.pins.map(pin);const IDX={1:0,3:1,2:2,6:3,4:4,12:5,8:6,9:7};
      const S={kind:"step",c,st:{pos:0,last:null,bad:0,coils:0,tLast:null,dt:null},
        coils(){return ps.reduce((a,s,i)=>a|(((m.latch(s.p)>>s.b)&1)<<i),0)},
        onPort(){const st=S.st,v=S.coils();if(v===st.coils)return;st.coils=v;const ix=IDX[v];if(ix==null){if(v)st.bad++;return}
          if(st.last!=null){let d=(ix-st.last+8)%8;if(d>4)d-=8;if(d===4||d===-4)st.bad++;else if(d){st.pos+=d;if(st.tLast!=null)st.dt=m.cyc-st.tLast;st.tLast=m.cyc}}
          st.last=ix},
        /* góc quay (độ): mỗi nửa bước = 360 / (2 × số bước mỗi vòng) */
        angle(){return S.st.pos*360/(2*c.stepsPerRev)},
        snap:()=>JSON.stringify(S.st),restore(x){S.st=JSON.parse(x)}};D.list.push(S);D.step=S}
    /* ---------- thiết bị đăng ký từ file khác (EXT, ví dụ 56-mcu51-bus.js: bus I2C/SPI và thiết bị nối bus) ---------- */
    for(const k in EXT)if(cfg[k]){const x=EXT[k].attach(m,Object.assign({},EXT[k].DEF,cfg[k]===true?{}:cfg[k]),D);x.kind=k;D.list.push(x);D[k]=x}
    /* ---------- thiết bị đăng ký thêm từ file khác (MCU51DEV.PLUG, ví dụ 56-mcu51-ana.js: ADC, DAC, driver động cơ, encoder) ---------- */
    for(const k in PLUG)if(cfg[k]&&!D[k]){const x=PLUG[k].make(m,Object.assign({},PLUG[k].def||{},cfg[k]===true?{}:cfg[k]),{pin});x.kind=k;D.list.push(x);D[k]=x}
    /* ---------- nối vào máy ---------- */
    const drivers=D.list.filter(x=>x.drive);
    m.extFn=drivers.length?(p=>{let v=m.ext[p];for(const d of drivers)v&=d.drive(p);return v}):null;
    const pre=D.list.filter(x=>x.prePort);
    m.prePort=pre.length?((p,t)=>{for(const h of pre)h.prePort(p,t)}):null;
    const hooks=D.list.filter(x=>x.onPort);
    m.onPort=hooks.length?((p,v,o,t)=>{for(const h of hooks)h.onPort(p,v,o,t)}):null;
    D.snap=()=>D.list.map(x=>x.snap());
    D.restore=s=>D.list.forEach((x,i)=>x.restore(s[i]));
    D.resetAll=()=>{D.list.forEach(x=>{if(x.reset)x.reset();else x.restore(null)})};
    return D}
  /* mẫu đoạn sáng của các số 0–F (a = bit 0 … g = bit 6), anode chung thì đảo bit */
  const SEG_HEX=[0x3F,0x06,0x5B,0x4F,0x66,0x6D,0x7D,0x07,0x7F,0x6F,0x77,0x7C,0x39,0x5E,0x79,0x71];
  return {attach,DEF,SEG_HEX,pin,EXT,PLUG}})();
if(typeof module!=="undefined")module.exports=MCU51DEV;
/* ===================== trình mô phỏng của khóa (platform/js/55-mcu51-ui.js) ===================== */
/* ===================== Trình mô phỏng 8051 · 5/5: giao diện =====================
   makeSim51(phần_tử, {id, presets:[{label, code, note, dev:{led,btn,seg,key,lcd,step}, fosc, ram, speed}], ram:128|256, tall})  (ram của từng ví dụ ghi đè ram chung;
   speed "slow" | "fast" | "real" đặt sẵn ô Tốc độ chạy khi chọn ví dụ, ví dụ quét LED/LCD cần "real")
     → {run(), step(), reset(), get(), set(code), machine()}
   makeEx51(phần_tử, "lN", [{t, d, start, spec, hints, why}]) — bài tập chấm tự động (trạng thái cuối, chu kỳ, số byte).
   Bố cục theo docs/QUY-TAC-TRINH-MO-PHONG.md: code + các phần xếp dọc trong một khung cuộn (Thiết bị ảo → Thanh ghi →
   Mã máy → Bộ nhớ → Ngăn xếp → Thời gian → Kết quả) + hàng nút ở đáy khung. Lùi bước, Đoán trước, điểm dừng (bấm số dòng).
   Mô hình máy: 53-mcu51-cpu.js; thiết bị: 54-mcu51-dev.js. Tài liệu: docs/TRINH-MO-PHONG-8051.md. */
const MCU51UI=(function(){
  const ISA=MCU51ISA,{hx2,hx4}=ISA;
  const E=s=>String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
  const H2=v=>v.toString(16).toUpperCase().padStart(2,"0"),H4=v=>v.toString(16).toUpperCase().padStart(4,"0");
  const MOB=()=>!!(window.matchMedia&&matchMedia("(max-width:900px)").matches);
  const REDUCED=()=>!!(window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches);
  /* mô tả ngắn từng lệnh (hiện cạnh mã máy) */
  const DESC={NOP:"không làm gì",AJMP:"nhảy trong trang 2 KB",LJMP:"nhảy xa (64 KB)",SJMP:"nhảy gần (−128…+127)",JMP:"nhảy tới A + DPTR",RR:"quay phải A",RRC:"quay phải A qua CY",RL:"quay trái A",RLC:"quay trái A qua CY",
    INC:"tăng 1",DEC:"giảm 1",JBC:"nhảy nếu bit = 1 rồi xóa bit",ACALL:"gọi chương trình con trong trang 2 KB",LCALL:"gọi chương trình con (64 KB)",JB:"nhảy nếu bit = 1",JNB:"nhảy nếu bit = 0",RET:"trở về từ chương trình con",RETI:"trở về từ chương trình ngắt",
    ADD:"cộng vào A",ADDC:"cộng vào A có nhớ CY",JC:"nhảy nếu CY = 1",JNC:"nhảy nếu CY = 0",ORL:"OR logic",ANL:"AND logic",XRL:"XOR logic",JZ:"nhảy nếu A = 0",JNZ:"nhảy nếu A ≠ 0",
    MOV:"chép dữ liệu",MOVC:"đọc bảng trong ROM",DIV:"chia A cho B",MUL:"nhân A với B",SUBB:"trừ có mượn CY",CPL:"đảo",CJNE:"so sánh, khác thì nhảy",PUSH:"cất vào ngăn xếp",POP:"lấy từ ngăn xếp",CLR:"xóa về 0",SETB:"đặt bit = 1",
    SWAP:"đổi hai nửa byte của A",XCH:"đổi chỗ với A",XCHD:"đổi nửa thấp với A",DA:"hiệu chỉnh BCD sau phép cộng",DJNZ:"giảm 1, khác 0 thì nhảy",MOVX:"đọc / ghi RAM ngoài"};
  /* ---------- tô màu hợp ngữ ---------- */
  const DIRW=/^(ORG|EQU|SET|DATA|IDATA|XDATA|BIT|CODE|DB|DW|DS|DBIT|END|USING|CSEG|DSEG|ISEG|BSEG|XSEG)$/i;
  const MN=new Set(Object.keys(DESC).concat(["CALL"]));
  function hlLine(t){let out="",i=0;const n=t.length;
    while(i<n){const c=t[i],r=t.slice(i);let m;
      if(c===";"){out+=`<span class="t-com">${E(t.slice(i))}</span>`;break}
      if(c==="'"||c==='"'){let j=t.indexOf(c,i+1);if(j<0)j=n-1;out+=`<span class="t-str">${E(t.slice(i,j+1))}</span>`;i=j+1;continue}
      if((m=/^#?(0[xX][0-9A-Fa-f]+|[0-9][0-9A-Fa-f]*[HhBbOoQqDd]?)\b/.exec(r))){out+=`<span class="t-num">${E(m[0])}</span>`;i+=m[0].length;continue}
      if((m=/^[A-Za-z_?][\w?]*/.exec(r))){const w=m[0],u=w.toUpperCase();
        out+=MN.has(u)?`<span class="t-kw">${E(w)}</span>`:DIRW.test(u)?`<span class="t-pre">${E(w)}</span>`:/^(A|B|C|AB|DPTR|R[0-7]|PC)$/.test(u)?`<span class="t-op">${E(w)}</span>`:E(w);i+=w.length;continue}
      out+=E(c);i++}
    return out}
  /* ---------- CSS riêng (chỉ có trên trang khóa mcu8051) ---------- */
  function css(){if(document.getElementById("mcu51-css"))return;const s=document.createElement("style");s.id="mcu51-css";s.textContent=`
.sim51 .sim-in{padding:6px 12px;border-top:1px solid var(--code-line);background:var(--surface);font-size:13px;color:var(--muted);display:flex;flex-wrap:wrap;gap:4px 12px;align-items:center}
.sim51 .sim-in b{color:var(--ink)}
.sim51 .gutter div{cursor:pointer}
.sim51 .gutter div.bp{position:relative;color:#fff}
.sim51 .gutter div.bp::before{content:"";position:absolute;left:6px;top:50%;width:9px;height:9px;margin-top:-4.5px;border-radius:50%;background:var(--err)}
.m51-opts{display:flex;flex-wrap:wrap;gap:6px 10px;align-items:center;padding:6px 12px;border-bottom:1px solid var(--line);font-size:13px}
.m51-opts label{display:inline-flex;gap:6px;align-items:center;min-height:36px}
.m51-opts select{min-height:36px;max-width:100%}
.m51-sec{padding:8px 12px 12px}
.sim51 .pane-h .m51-cyc,.sim51 .pane-h .m51-devh,.sim51 .pane-h .m51-timh,.sim51 .pane-h .m51-sph,.sim51 .pane-h .m51-size{text-transform:none;letter-spacing:0;font-weight:600}
.m51-sec h5{margin:10px 0 6px;font-size:12.5px;color:var(--muted);font-weight:700}
.m51-sec h5:first-child{margin-top:2px}
.m51-tbl{border-collapse:collapse;font-family:var(--f-mono);font-size:13px;width:100%}
.m51-tbl th,.m51-tbl td{border:1px solid var(--line);padding:3px 6px;text-align:left;white-space:nowrap}
.m51-tbl td.wr,.m51-tbl th.wr{white-space:normal;overflow-wrap:anywhere}
.m51-tbl th{font-family:var(--f-body);font-weight:600;color:var(--muted);font-size:12px}
.m51-tbl td.chg,.m51-ram span.chg,.m51-bits span.chg{background:var(--warm-soft);color:var(--ink)}
.m51-regs{display:grid;grid-template-columns:repeat(auto-fill,minmax(92px,1fr));gap:6px}
.m51-reg{border:1px solid var(--line);border-radius:8px;padding:4px 8px;font-family:var(--f-mono);font-size:13px;min-width:0}
.m51-reg small{display:block;font-family:var(--f-body);color:var(--muted);font-size:11px}
.m51-reg b{font-size:15px}
.m51-reg.chg{background:var(--warm-soft);border-color:var(--warm)}
.m51-reg.bank{border-style:dashed}
.m51-bits{display:grid;grid-template-columns:repeat(8,minmax(0,1fr));gap:3px;max-width:420px}
.m51-bits span{border:1px solid var(--line);border-radius:6px;text-align:center;font-family:var(--f-mono);font-size:12px;padding:2px 0;min-width:0}
.m51-bits span i{display:block;font-style:normal;font-size:10.5px;color:var(--muted);font-family:var(--f-body)}
.m51-bits span.on{background:var(--accent-soft);border-color:var(--accent)}
.m51-now{font-family:var(--f-mono);font-size:13.5px;background:var(--code-bg);color:var(--code-fg);border-radius:8px;padding:8px 10px;overflow-wrap:anywhere}
.m51-now .op{color:var(--syn-num)}
.m51-now small{display:block;color:var(--code-muted);font-family:var(--f-body)}
.m51-ram{display:grid;grid-template-columns:44px repeat(8,minmax(0,1fr));gap:2px;font-family:var(--f-mono);font-size:12.5px;max-width:520px}
.m51-ram span{text-align:center;padding:2px 0;border-radius:4px;min-width:0}
.m51-ram .ad{color:var(--muted);text-align:right;padding-right:4px}
.m51-ram .bk0{background:color-mix(in srgb,var(--accent) 10%,transparent)}.m51-ram .bk1{background:color-mix(in srgb,var(--ok) 12%,transparent)}
.m51-ram .bk2{background:color-mix(in srgb,var(--warm) 12%,transparent)}.m51-ram .bk3{background:color-mix(in srgb,var(--syn-kw) 14%,transparent)}
.m51-ram .cur{outline:2px solid var(--accent);outline-offset:-2px;font-weight:700}
.m51-ram .bit{background:color-mix(in srgb,var(--syn-str) 16%,transparent)}
.m51-ram .up{color:var(--muted)}
.m51-ram .sp{box-shadow:inset 0 -3px 0 var(--err)}
.m51-leg{display:flex;flex-wrap:wrap;gap:4px 10px;font-size:12px;color:var(--muted);margin:6px 0}
.m51-leg i{display:inline-block;width:12px;height:12px;border-radius:3px;vertical-align:-2px;margin-right:4px}
label.m51-leg{flex-wrap:nowrap;align-items:flex-start;gap:6px;cursor:pointer}
label.m51-leg input{flex:none;margin:1px 0 0}
.m51-xr{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:4px 0 6px;font-size:13px}
.m51-xr input{width:84px;min-height:36px;font-family:var(--f-mono)}
.m51-dev{display:flex;flex-wrap:wrap;gap:12px}
.m51-box{border:1px solid var(--line);border-radius:10px;padding:8px 10px;min-width:0;max-width:100%}
.m51-box>b{display:block;font-size:12.5px;color:var(--muted);margin-bottom:6px}
.m51-leds{display:flex;gap:6px;flex-wrap:wrap}
.m51-led{display:flex;flex-direction:column;align-items:center;font-size:10.5px;color:var(--muted);font-family:var(--f-mono)}
.m51-led i{width:22px;height:22px;border-radius:50%;border:2px solid #7a2020;background:#3a1010;margin-bottom:2px}
.m51-btns{display:flex;gap:6px;flex-wrap:wrap}
.m51-btns button,.m51-keys button{min-height:44px;min-width:44px;border:1px solid var(--line);border-radius:8px;background:var(--surface);font-weight:600;touch-action:manipulation;user-select:none;-webkit-user-select:none}
.m51-btns button.dn,.m51-keys button.dn{background:var(--accent);color:var(--accent-ink);border-color:var(--accent)}
.m51-keys{display:grid;grid-template-columns:repeat(4,44px);gap:4px}
.m51-lcd{background:#9fbf3b;color:#14210a;border-radius:6px;padding:8px;font-family:var(--f-mono);font-size:15px;line-height:1.35;display:inline-block;max-width:100%;overflow:hidden}
.m51-lcd.off{background:#6d7f2c;color:transparent}
.m51-lcd div{white-space:pre;letter-spacing:.06em}
.m51-lcd u{text-decoration:none;box-shadow:inset 0 -2px 0 #14210a}
.m51-seg svg{display:block;max-width:100%;height:auto}
.m51-step svg{display:block;width:120px;height:120px}
.m51-term{background:var(--code-bg);color:var(--code-fg);font-family:var(--f-mono);font-size:13px;padding:8px 10px;border-radius:8px;white-space:pre-wrap;word-break:break-all;min-height:48px}
.m51-term .rx{color:var(--syn-str)}
.m51-send{display:flex;gap:6px;margin-top:6px;flex-wrap:wrap}
.m51-send input{flex:1 1 140px;min-width:0;min-height:40px;font-family:var(--f-mono)}
.m51-msg{font-size:14px;line-height:1.5;margin:0 0 6px}
.m51-msg.err{color:var(--err)}.m51-msg.warn{color:var(--warm)}.m51-msg.ok{color:var(--ok)}
.m51-msg code{font-family:var(--f-mono)}
.m51-lst td.cur{background:color-mix(in srgb,var(--syn-kw) 18%,transparent)}
.m51-lst td.src{white-space:pre;max-width:0;overflow:hidden;text-overflow:ellipsis;width:60%}
.m51-tbl.m51-lst{table-layout:fixed}
.m51-tbl.m51-lst col.c1{width:56px}.m51-tbl.m51-lst col.c2{width:84px}.m51-tbl.m51-lst col.c3{width:40px}
.m51-tim svg{display:block;max-width:100%;height:auto;font-family:var(--f-mono)}
.m51-tim .zoom{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:6px}
.m51-tim .zoom button{min-height:36px}
.m51-pred{border:1px solid var(--accent);background:var(--accent-soft);border-radius:10px;padding:8px 10px;margin:0 0 8px}
.m51-pred p{margin:0 0 6px;font-size:14px}
.m51-pred .row{display:flex;gap:6px;flex-wrap:wrap}
.m51-pred input{width:110px;min-height:40px;font-family:var(--f-mono)}
.m51-pred .fb{margin-top:6px;font-weight:600}
.m51-ex .editor{height:260px}
.m51-ex .ed-hl{margin:0;background:none;border-radius:0;padding:14px;font-size:14px;overflow:hidden}
.m51-ex .ex-res{font-size:14px;margin-top:6px}
.m51-ex .ex-res li{margin:2px 0}
@media (max-width:600px){.m51-tbl{font-size:12px}.m51-keys{grid-template-columns:repeat(4,48px)}}
`;document.head.appendChild(s)}
  /* ---------- trình mô phỏng ---------- */
  function build(root,cfg){css();
    const P=cfg.presets&&cfg.presets.length?cfg.presets:[{label:"Ví dụ",code:"        ORG   0\n        MOV   A,#30H\n        SJMP  $\n        END\n"}];
    const id=cfg.id||("s51x"+Math.random().toString(36).slice(2,7));
    root.classList.add("sim","sim2","sim51");
    root.innerHTML=`<div class="sim-bar"><div class="left"><span class="fname">main.a51</span>
     ${P.length>1?`<label class="pre-l"><span class="vh">Chọn ví dụ</span><select class="s-pre" id="${id}-pre">${P.map((p,i)=>`<option value="${i}">${E(p.label)}</option>`).join("")}</select></label>`:`<select class="s-pre" id="${id}-pre" hidden><option value="0">${E(P[0].label)}</option></select>`}
     <span class="s-chip idle" role="status" aria-live="polite">Chưa chạy</span></div></div>
    <div class="m51-opts"><label>Thạch anh <select class="m51-f" aria-label="Tần số thạch anh"><option value="12000000">12 MHz</option><option value="11059200">11,0592 MHz</option></select></label>
     <label>Tốc độ chạy <select class="m51-sp" aria-label="Tốc độ chạy"><option value="slow">Từ từ (3 lệnh/giây)</option><option value="fast" selected>Nhanh (300 lệnh/giây)</option><option value="real">Thời gian thực</option></select></label>
     <label><input type="checkbox" class="m51-pr"> Đoán trước</label></div>
    <details class="s-note" hidden><summary><b class="sn-h">Ví dụ này minh họa</b><span class="sn-1"></span></summary><p class="sn-t"></p></details>
    <div class="sim-stage"${cfg.tall?` style="--stH:${cfg.tall}"`:""}>
     <div class="st-code"><div class="editor"><div class="gutter" title="Bấm số dòng để đặt / bỏ điểm dừng"></div><div class="ed-wrap"><pre class="ed-hl" aria-hidden="true"></pre><textarea class="ed-ta" id="${id}-ed" spellcheck="false" autocapitalize="off" autocomplete="off" aria-label="Mã nguồn hợp ngữ 8051"></textarea></div></div>
      <div class="sim-in m51-info" aria-live="polite"></div></div>
     <div class="st-panes">
      <div class="st-nav" role="group" aria-label="Đi tới phần"><button type="button" data-go="dev">Thiết bị ảo</button><button type="button" data-go="reg">Thanh ghi</button><button type="button" data-go="code">Mã máy</button><button type="button" data-go="mem">Bộ nhớ</button><button type="button" data-go="stk">Ngăn xếp</button><button type="button" data-go="tim">Thời gian</button><button type="button" data-go="out">Kết quả</button></div>
      <div class="st-scroll" tabindex="0" role="region" aria-label="Thiết bị ảo, thanh ghi, bộ nhớ và kết quả">
       <section class="pn" data-sec="dev"><div class="pane-h"><span>Thiết bị ảo</span><span class="m51-devh"></span></div><div class="m51-sec m51-dev"></div></section>
       <section class="pn" data-sec="reg"><div class="pane-h"><span>Thanh ghi và cờ</span><span class="m51-cyc"></span></div><div class="m51-sec m51-reg-s"></div></section>
       <section class="pn" data-sec="code"><div class="pane-h"><span>Mã máy</span><span class="m51-size"></span></div><div class="m51-sec m51-code-s"></div></section>
       <section class="pn" data-sec="mem"><div class="pane-h"><span>Bộ nhớ</span><span></span></div><div class="m51-sec m51-mem-s"></div></section>
       <section class="pn" data-sec="stk"><div class="pane-h"><span>Ngăn xếp</span><span class="m51-sph"></span></div><div class="m51-sec m51-stk-s"></div></section>
       <section class="pn" data-sec="tim"><div class="pane-h"><span>Đồ thị thời gian</span><span class="m51-timh"></span></div><div class="m51-sec m51-tim"></div></section>
       <section class="pn" data-sec="out"><div class="pane-h"><span>Kết quả</span><span></span></div><div class="m51-sec m51-out"></div>
        <div class="m51-sec"><h5>Cửa sổ UART (TXD → màn hình, ô nhập → RXD)</h5><div class="m51-term" aria-live="polite"></div>
         <div class="m51-send"><input class="m51-in" id="${id}-uin" placeholder="Gõ ký tự gửi vào RXD" aria-label="Dữ liệu gửi vào RXD" autocomplete="off" spellcheck="false"><button type="button" class="btn m51-ub">Gửi</button></div></div></section>
      </div></div>
     <div class="sim-ctl"><span class="sc-st" aria-hidden="true">Chưa chạy</span><span class="sc-btns"><button type="button" class="btn nw s-reset" disabled title="Làm lại từ đầu" aria-label="Làm lại từ đầu">↺</button><button type="button" class="btn nw s-back" disabled title="Lùi lại một bước">← Lùi</button><button type="button" class="btn s-step">Từng bước</button><button type="button" class="btn pri s-run">▶ Chạy</button></span></div>
    </div>
    <details class="sim-scope"><summary>Trình mô phỏng 8051 hỗ trợ những gì?</summary><div>
     <p><b>Trình dịch</b> kiểu Keil A51: nhãn, ORG, EQU, SET, DATA, IDATA, XDATA, BIT, CODE, DB, DW, DS, DBIT, END, USING, CSEG/DSEG/BSEG/XSEG AT, biểu thức (+ − * / MOD, SHL, SHR, AND, OR, XOR, NOT, HIGH, LOW, $), tên SFR và bit có sẵn (P1.0, ACC.7, TR0…), JMP/CALL chung. Mã máy giống sdas8051 (đã đối chiếu cả 255 mã lệnh).</p>
     <p><b>Máy giả lập</b>: đủ 255 mã lệnh, 4 băng thanh ghi, RAM trong 256 byte (8052; chọn 128 byte trong cấu hình bài), RAM ngoài 64 KB, Timer 0/1 chế độ 0–3 (GATE, đếm sự kiện), Timer 2 của 8052/AT89S52 (tự nạp, bắt giữ, đếm lên/xuống, bộ tạo baud, xuất xung ở P1.0), ngắt ngoài mức/sườn, cổng nối tiếp chế độ 0–3, ngắt 2 mức ưu tiên, đếm chu kỳ máy (1 chu kỳ = 12 chu kỳ thạch anh).</p>
     <p><b>Chưa có:</b> chế độ nghỉ IDLE/PD, watchdog và hai DPTR của AT89S52, nhiều file (PUBLIC, EXTRN, RSEG), macro. <b>Giới hạn:</b> mỗi lần Chạy dừng sau 50 triệu chu kỳ máy; Lùi giữ 20 000 bước gần nhất (không dùng được sau khi chạy ở tốc độ Thời gian thực).</p>
     <p>Thời điểm cờ ngắt, UART và bộ đếm theo mô tả của Intel; chỗ khác với ucsim s51 và mô hình thiết bị ảo (giả định cách nối chân) ghi trong tài liệu trình mô phỏng.</p></div></details>`;
    const $=s=>root.querySelector(s);
    const ed=$(".ed-ta"),hl=$(".ed-hl"),gut=$(".gutter"),stage=$(".sim-stage"),sc=$(".st-scroll"),chip=$(".s-chip"),ctlSt=$(".sc-st");
    const bStep=$(".s-step"),bRun=$(".s-run"),bBack=$(".s-back"),bReset=$(".s-reset"),sel=$(".s-pre"),fSel=$(".m51-f"),spSel=$(".m51-sp"),prChk=$(".m51-pr");
    const secOf=k=>root.querySelector(`.pn[data-sec="${k}"]`),navB=k=>root.querySelector(`.st-nav [data-go="${k}"]`);
    const S={pi:0,m:null,D:null,asm:null,hist:[],running:false,raf:0,cur:0,bad:0,bp:new Set(),prev:null,last:null,notes:{},done:false,msgs:[],ask:null,zoom:400,xa:0,lastDraw:0,noBack:false};
    /* ---------- khung: cuộn trong khung, chống nhảy (docs/QUY-TAC-TRINH-MO-PHONG.md mục 3, 4) ---------- */
    function scrollIn(el,how){if(!el||el.hidden)return;const R=sc.getBoundingClientRect(),Q=el.getBoundingClientRect();if(!R.height)return;
      const to=how==="top"?sc.scrollTop+Q.top-R.top:Q.bottom>R.bottom||Q.top<R.top?sc.scrollTop+(Q.bottom>R.bottom&&Q.height<R.height?Q.bottom-R.bottom+8:Q.top-R.top):null;
      if(to!=null){if(sc.scrollTo)sc.scrollTo({top:to,behavior:REDUCED()?"auto":"smooth"});else sc.scrollTop=to}}
    root.querySelectorAll(".st-nav [data-go]").forEach(b=>b.onclick=()=>scrollIn(secOf(b.dataset.go),"top"));
    function paintNav(){let on=null;const R=sc.getBoundingClientRect();for(const k of ["dev","reg","code","mem","stk","tim","out"]){const s=secOf(k);if(!s||s.hidden)continue;const Q=s.getBoundingClientRect();if(Q.top<=R.top+R.height/3)on=k;else if(!on)on=k}
      root.querySelectorAll(".st-nav [data-go]").forEach(b=>b.classList.toggle("on",b.dataset.go===on))}
    sc.addEventListener("scroll",()=>{cancelAnimationFrame(sc._r);sc._r=requestAnimationFrame(paintNav)},{passive:true});
    function hold(){root.querySelectorAll(".pn").forEach(s=>{if(s.dataset.sec==="out"||s.hidden)return;const h=s.offsetHeight;if(h>(s._mh||0)){s._mh=h;s.style.minHeight=h+"px"}})}
    function unhold(){root.querySelectorAll(".pn").forEach(s=>{s._mh=0;s.style.minHeight=""})}
    function fitStage(){const r=stage.getBoundingClientRect();if(!r.height)return;let top=0;document.querySelectorAll(".top,.lbar,.ltoc").forEach(h=>{const q=h.getBoundingClientRect(),cs=getComputedStyle(h);if(q.height&&cs.position==="sticky"&&cs.display!=="none")top=Math.max(top,(parseFloat(cs.top)||0)+(h.open&&h.querySelector("summary")?h.querySelector("summary").offsetHeight:q.height))});
      const want=top+8;if(r.top<want-2||r.bottom>innerHeight+2)window.scrollBy({top:r.top-want,behavior:REDUCED()?"auto":"smooth"})}
    function live(on){if(on&&!stage.classList.contains("live")){stage.classList.add("live");fitStage()}else if(!on)stage.classList.remove("live")}
    function setChip(k,t){chip.className="s-chip "+k;chip.textContent=t;ctlSt.className="sc-st "+k;ctlSt.textContent=t}
    /* ---------- trình soạn ---------- */
    function paint(){const L=ed.value.split("\n");
      hl.innerHTML=L.map((s,i)=>`<span class="row${i+1===S.cur?" cur":""}${i+1===S.bad?" bad":""}">${hlLine(s)||" "}</span>`).join("");
      gut.innerHTML=L.map((_,i)=>`<div data-l="${i+1}" class="${i+1===S.bad?"err":""}${i+1===S.cur?" cur":""}${S.bp.has(i+1)?" bp":""}">${i+1}</div>`).join("");sync()}
    function sync(){hl.scrollTop=ed.scrollTop;hl.scrollLeft=ed.scrollLeft;gut.scrollTop=ed.scrollTop}
    function keepCur(){if(!S.cur)return;const lh=parseFloat(getComputedStyle(ed).lineHeight)||22,y=(S.cur-1)*lh,h=ed.clientHeight;if(y<ed.scrollTop+h*.25||y>ed.scrollTop+h*.7-lh){ed.scrollTop=Math.max(0,y-h/2+lh/2);sync()}}
    ed.addEventListener("scroll",sync);
    ed.addEventListener("input",()=>{stop();S.m=null;S.cur=S.bad=0;S.asm=null;live(false);paint();setChip("idle","Chưa chạy");info();btns()});
    ed.addEventListener("keydown",e=>{if(e.key==="Tab"){e.preventDefault();const a=ed.selectionStart,b=ed.selectionEnd;ed.value=ed.value.slice(0,a)+"\t"+ed.value.slice(b);ed.selectionStart=ed.selectionEnd=a+1;ed.dispatchEvent(new Event("input"))}
      if(e.key==="Enter"&&(e.ctrlKey||e.metaKey)){e.preventDefault();runBtn()}});
    gut.addEventListener("click",e=>{const d=e.target.closest("[data-l]");if(!d)return;const l=+d.dataset.l;if(S.bp.has(l))S.bp.delete(l);else S.bp.add(l);paint()});
    /* ---------- dịch và khởi động máy ---------- */
    const preset=()=>P[S.pi]||P[0];
    function info(){const el=$(".m51-info");const r=S.asm;
      el.innerHTML=r?(r.ok?`<span>Mã máy: <b>${r.size}</b> byte</span><span>Thạch anh: <b>${(+fSel.value/1e6).toLocaleString("vi-VN")} MHz</b> · 1 chu kỳ máy = <b>${(12e6/+fSel.value).toLocaleString("vi-VN",{maximumFractionDigits:4})} µs</b></span>`:`<span class="bad-t">Có ${r.errors.length} lỗi dịch, xem phần Kết quả</span>`):`<span>Bấm <b>Từng bước</b> hoặc <b>▶ Chạy</b> để dịch và chạy. Bấm số dòng để đặt điểm dừng.</span>`}
    function boot(){const r=MCU51ASM.assemble(ed.value);S.asm=r;S.msgs=[];S.bad=0;S.notes={};S.hist=[];S.done=false;S.noBack=false;S.last=null;S.ask=null;
      if(!r.ok){S.m=null;S.bad=r.errors[0].line;S.cur=0;setChip("err","Lỗi dịch ở dòng "+r.errors[0].line);
        S.msgs=r.errors.map(e=>({k:"err",t:`<b>Dòng ${e.line}:</b> ${E(e.msg)}`}));live(true);paint();renderAll();scrollIn(secOf("out"),"top");return false}
      r.warnings.forEach(w=>S.msgs.push({k:"warn",t:`Dòng ${w.line}: ${E(w.msg)}`}));
      const m=MCU51CPU.create({fosc:+fSel.value,ram:preset().ram||cfg.ram||256});m.load(r.rom,r.used);
      /* ví dụ có dữ liệu nhận sẵn (preset.uart: chuỗi hoặc mảng byte): đưa vào đường RXD ngay khi dựng máy, như PC gửi liền nhau */
      {const u=preset().uart;if(u&&u.length){const L=(typeof u==="string"?[...u]:u).map(b=>typeof b==="string"?b.charCodeAt(0)&255:b&255);L.forEach(b=>m.uartIn(b));S.msgs.push({k:"ok",t:`Dữ liệu nhận của ví dụ: ${L.length} byte (${E(L.map(b=>hx2(b)+"H").join(" "))}) đã xếp hàng ở đường RXD, đến liền nhau khi chương trình bật REN.`})}}
      const dv=Object.assign({},preset().dev||{led:true,btn:true});S.D=MCU51DEV.attach(m,dv);S.m=m;S.prev=snapRegs();curLine();info();return true}
    function curLine(){const m=S.m;S.cur=m&&S.asm?S.asm.at.get(m.pc)||0:0}
    function snapRegs(){const m=S.m;if(!m)return null;return {iram:m.iram.slice(),sfr:m.sfr.slice(),pc:m.pc}}
    /* ---------- một bước ---------- */
    function oneStep(record){const m=S.m;if(record){const sn=m.snap();sn.dev=S.D.snap();sn.notes=Object.assign({},S.notes);sn.prev=S.prev;sn.last=S.last;S.hist.push(sn);if(S.hist.length>20000)S.hist.shift()}
      const spBefore=m.reg("SP");const r=m.step();S.last=r;
      if(r.irq){S.notes[(spBefore+1)&255]=`địa chỉ trở về (byte thấp) · ngắt ${r.irq}`;S.notes[(spBefore+2)&255]=`địa chỉ trở về ${hx4(r.from)}H (byte cao)`}
      else if(!r.err){const op=r.op;if(op===0x12||(op&0x1F)===0x11){const ret=(r.pc+r.n)&0xFFFF;S.notes[(spBefore+1)&255]="địa chỉ trở về (byte thấp)";S.notes[(spBefore+2)&255]=`địa chỉ trở về ${hx4(ret)}H (byte cao)`}
        else if(op===0xC0){S.notes[(spBefore+1)&255]="PUSH "+r.text.slice(5)}}
      return r}
    function after(r,quiet){const m=S.m;curLine();
      if(r.err){S.msgs.push({k:"err",t:`Lỗi khi chạy (PC = ${hx4(r.pc)}H): ${E(r.err)}`});S.done=true;S.bad=S.asm.at.get(r.pc)||0;setChip("err","Lỗi khi chạy");return "err"}
      if(r.halt&&m.idle()){S.done=true;S.msgs.push({k:"ok",t:`Đã chạy xong: CPU dừng ở vòng lặp <code>SJMP $</code> (địa chỉ ${hx4(r.pc)}H). Tổng ${m.cyc.toLocaleString("vi-VN")} chu kỳ máy = ${fmtT(m.time())}; ${m.nIns.toLocaleString("vi-VN")} lệnh.`});setChip("ok","Đã chạy xong");return "halt"}
      if(S.bp.has(S.cur)&&!quiet)return "bp";
      return null}
    const fmtT=s=>s<1e-3?(s*1e6).toLocaleString("vi-VN",{maximumFractionDigits:2})+" µs":s<1?(s*1e3).toLocaleString("vi-VN",{maximumFractionDigits:3})+" ms":s.toLocaleString("vi-VN",{maximumFractionDigits:4})+" s";
    function stepBtn(){if(S.running){return}
      if(S.ask){return}
      if(!S.m||S.done){if(S.done&&S.m&&!S.asm.ok)return;if(!S.m||S.done){if(!boot())return;live(true);unhold()}}
      if(S.done)return;
      if(prChk.checked&&!S.ask&&predict())return;
      doStep()}
    function doStep(){const r=oneStep(true);const st=after(r,true);S.prev=S.prev||snapRegs();
      if(!st)setChip("step",`Dừng ở dòng ${S.cur||"?"}`);renderAll();keepCur();btns()}
    function backBtn(){if(S.running||!S.hist.length)return;S.ask=null;const k=S.hist.length-1;const sn=S.hist[k];S.m.restore(sn,S.hist.slice(k));S.D.restore(sn.dev);S.notes=sn.notes;S.prev=sn.prev;S.last=sn.last;S.hist.pop();
      S.done=false;S.bad=0;S.msgs=S.msgs.filter(x=>x.k==="warn");curLine();setChip("step",`Dừng ở dòng ${S.cur||"?"}`);renderAll();keepCur();btns()}
    function resetBtn(){stop();S.m=null;S.asm=null;S.cur=S.bad=0;S.msgs=[];S.hist=[];S.ask=null;S.done=false;S.last=null;live(false);unhold();paint();setChip("idle","Chưa chạy");renderAll();info();btns()}
    /* ---------- Chạy ---------- */
    function runBtn(){if(S.running){stop();setChip("step",`Tạm dừng ở dòng ${S.cur||"?"}`);renderAll();keepCur();btns();return}
      if(!S.m||S.done){if(!boot())return;unhold()}
      S.ask=null;live(true);S.running=true;S.noBack=spSel.value==="real";if(S.noBack)S.hist=[];setChip("run","Đang chạy…");btns();
      const limit=S.m.cyc+50e6;let t0=performance.now(),acc=0;
      const frame=now=>{if(!S.running)return;const m=S.m,mode=spSel.value;let st=null;
        if(mode==="slow"){acc+=now-t0;t0=now;if(acc<330){S.raf=requestAnimationFrame(frame);return}acc=0;st=after(oneStep(true))}
        else if(mode==="fast"){for(let i=0;i<5&&!st;i++)st=after(oneStep(true))}
        else{const dt=Math.min(100,now-t0);t0=now;const want=m.cyc+Math.max(1,Math.round(dt/1000*m.fosc/12));
          while(m.cyc<want&&!st)st=after(oneStep(false))}
        if(!st&&m.cyc>limit){S.msgs.push({k:"warn",t:"Dừng sau 50 triệu chu kỳ máy (giới hạn mỗi lần chạy). Bấm ▶ Chạy tiếp để chạy tiếp."});st="limit"}
        if(st){S.running=false;if(st==="bp")setChip("step",`Điểm dừng ở dòng ${S.cur}`);else if(st==="limit")setChip("step",`Tạm dừng ở dòng ${S.cur}`);
          renderAll();keepCur();btns();if(st==="halt"||st==="err")scrollIn(secOf("out"));return}
        if(now-S.lastDraw>(mode==="real"?90:40)){S.lastDraw=now;renderAll(true);keepCur()}
        S.raf=requestAnimationFrame(frame)};
      S.raf=requestAnimationFrame(frame)}
    function stop(){S.running=false;cancelAnimationFrame(S.raf);btns()}
    function btns(){const has=!!S.m;bReset.disabled=!has&&!S.asm;bBack.disabled=S.running||!S.hist.length;bStep.disabled=S.running||(S.done&&has);
      bStep.textContent=has&&!S.done?"Bước tiếp →":"Từng bước";
      bRun.textContent=S.running?"Tạm dừng":has&&!S.done?"▶ Chạy tiếp":"▶ Chạy";bRun.classList.toggle("stop",S.running);
      if(S.done){bStep.disabled=true;bRun.textContent="▶ Chạy lại"}}
    bStep.onclick=stepBtn;bRun.onclick=()=>{if(S.done){S.m=null;S.done=false}runBtn()};bBack.onclick=backBtn;bReset.onclick=resetBtn;
    /* ---------- Đoán trước ---------- */
    function predict(){const m=S.m;const d=ISA.disasm(m.rom,m.pc),I=ISA.OPS[m.rom[m.pc]];if(!I)return false;
      const sn=m.snap(),dsn=S.D.snap(),A0=m.reg("A"),C0=m.reg("CY"),ir=m.iram.slice(),sf=m.sfr.slice();
      const r=m.step();const A1=m.reg("A"),C1=m.reg("CY"),pc1=m.pc;let q=null;
      const jump=/^(JZ|JNZ|JC|JNC|JB|JNB|JBC|CJNE|DJNZ)$/.test(I.m);
      if(!r.irq&&!r.err){
        if(jump)q={kind:"jmp",text:`Lệnh <code>${E(d.t)}</code> có nhảy không?`,ans:pc1!==((m.pc0+I.n)&0xFFFF)?1:0,opts:["Không nhảy","Có nhảy"]};
        /* lệnh ngăn xếp (sửa sau tích hợp): hỏi SP sau lệnh — CALL/PUSH tăng SP trước khi ghi, POP/RET đọc rồi giảm */
        else if(/^(ACALL|LCALL|PUSH|POP|RET|RETI)$/.test(I.m)&&m.reg("SP")!==sf[0x81-0x80])q={kind:"hex",text:`Sau lệnh <code>${E(d.t)}</code>, con trỏ ngăn xếp SP bằng bao nhiêu (hệ 16)?`,ans:m.reg("SP")};
        else if(A1!==A0)q={kind:"hex",text:`Sau lệnh <code>${E(d.t)}</code>, thanh ghi A bằng bao nhiêu (hệ 16)?`,ans:A1};
        else{let at=-1;for(let a=0;a<256;a++)if(m.iram[a]!==ir[a]&&!(a>=0x08&&a===m.reg("SP")&&I.m!=="MOV")){at=a;break}
          if(at>=0&&!/CALL|PUSH/.test(I.m))q={kind:"hex",text:`Sau lệnh <code>${E(d.t)}</code>, ô RAM ${hx2(at)}H${at<32?` (R${at&7} của băng ${at>>3})`:""} bằng bao nhiêu (hệ 16)?`,ans:m.iram[at]};
          else if(C1!==C0)q={kind:"bit",text:`Sau lệnh <code>${E(d.t)}</code>, cờ CY bằng mấy?`,ans:C1,opts:["0","1"]};
          else{let s=-1;for(const a of [0x90,0xA0,0x80,0xB0])if(m.sfr[a-0x80]!==sf[a-0x80]){s=a;break}
            if(s>0)q={kind:"hex",text:`Sau lệnh <code>${E(d.t)}</code>, chốt cổng ${ISA.SFR_NAME[s]} bằng bao nhiêu (hệ 16)?`,ans:m.sfr[s-0x80]}}}}
      m.restore(sn,[sn]);S.D.restore(dsn);
      if(!q)return false;S.ask=q;renderAll();scrollIn(secOf("reg"),"top");btns();return true}
    function askHTML(){const q=S.ask;if(!q)return "";
      return `<div class="m51-pred" role="group" aria-label="Đoán trước"><p><b>Đoán trước:</b> ${q.text}</p><div class="row">${q.kind==="hex"?`<input class="m51-pa" id="${id}-pa" inputmode="text" autocomplete="off" spellcheck="false" aria-label="Giá trị đoán (hệ 16)" placeholder="ví dụ 3A"><button type="button" class="btn pri m51-pg">Kiểm tra</button>`:q.opts.map((o,i)=>`<button type="button" class="btn m51-po" data-v="${i}">${o}</button>`).join("")}<button type="button" class="btn m51-ps">Bỏ qua</button></div>${q.fb?`<p class="fb ${q.ok?"ok-t":"bad-t"}">${q.fb}</p>`:""}</div>`}
    function answer(v){const q=S.ask;const ok=v===q.ans;q.ok=ok;
      q.fb=ok?"✓ Đúng.":`✗ Chưa đúng. Đáp án: ${q.kind==="hex"?hx2(q.ans)+"H":q.opts[q.ans]}.`;const fb=q.fb;S.ask=null;doStep();
      const box=document.createElement("p");box.className="m51-msg "+(ok?"ok":"err");box.textContent="Đoán trước: "+fb;$(".m51-reg-s").prepend(box)}
    root.addEventListener("click",e=>{const t=e.target;if(!S.ask)return;
      if(t.classList.contains("m51-pg")){const raw=($(".m51-pa").value||"").trim().replace(/h$/i,"").replace(/^0x/i,"");const v=parseInt(raw,16);if(!/^[0-9a-f]{1,2}$/i.test(raw)){S.ask.fb="Gõ một số hệ 16 từ 00 đến FF.";S.ask.ok=false;renderReg();return}answer(v)}
      else if(t.classList.contains("m51-po"))answer(+t.dataset.v);
      else if(t.classList.contains("m51-ps")){S.ask=null;doStep()}});
    root.addEventListener("keydown",e=>{if(e.key==="Enter"&&e.target.classList&&e.target.classList.contains("m51-pa")){e.preventDefault();root.querySelector(".m51-pg").click()}});
    /* ---------- vẽ các phần ---------- */
    function renderAll(fast){paint();renderDev();renderReg();if(!fast){renderCode();renderMem();renderStk();renderTim();renderOut()}else{renderTimHead();renderTerm()}if(!fast)hold();paintNav();S.prev=snapRegs()}
    const chgR=(a,cur)=>S.prev&&S.prev.iram[a]!==cur,chgS=(a,cur)=>S.prev&&S.prev.sfr[a-0x80]!==cur;
    function renderReg(){const m=S.m,box=$(".m51-reg-s");if(!m){box.innerHTML=`<p class="mem-empty">Thanh ghi A, B, R0–R7, DPTR, SP, PC và các cờ sẽ hiện ở đây khi chương trình chạy.</p>`;$(".m51-cyc").textContent="";return}
      const bank=m.reg("RS"),r=k=>m.reg(k);
      const cell=(n,v,w,ch,extra)=>`<div class="m51-reg${ch?" chg":""}${extra||""}"><small>${n}</small><b>${w===4?H4(v):H2(v)}H</b> <small>${w===4?v:v+" · "+(v>127?v-256:v)}</small></div>`;
      const nx=ISA.disasm(m.rom,m.pc),I=ISA.OPS[m.rom[m.pc]];
      const last=S.last&&!S.last.err?`<small>Vừa chạy: ${E(S.last.text)} · ${S.last.c} chu kỳ máy${S.last.irq?" (phần cứng gọi ngắt)":""}</small>`:"";
      let h=askHTML()+`<h5>Lệnh kế tiếp (PC = ${hx4(m.pc)}H)</h5><div class="m51-now"><span class="op">${[...Array(nx.n)].map((_,k)=>H2(m.rom[(m.pc+k)&0xFFFF])).join(" ")}</span> &nbsp;${E(nx.t)}<small>${I?`${I.n} byte · ${I.c} chu kỳ máy · ${DESC[I.m]||""}`:"mã không hợp lệ"}</small>${last}</div>`;
      h+=`<h5>Thanh ghi (băng ${bank}: R0–R7 ở ${hx2(bank*8)}H–${hx2(bank*8+7)}H)</h5><div class="m51-regs">`+
        cell("A (ACC)",r("A"),2,chgS(0xE0,r("A")))+cell("B",r("B"),2,chgS(0xF0,r("B")))+[0,1,2,3,4,5,6,7].map(i=>cell("R"+i,r("R"+i),2,chgR(bank*8+i,r("R"+i))," bank")).join("")+
        cell("DPTR",r("DPTR"),4,chgS(0x82,m.sfr[2])||chgS(0x83,m.sfr[3]))+cell("SP",r("SP"),2,chgS(0x81,r("SP")))+cell("PC",m.pc,4,false)+`</div>`;
      const psw=r("PSW"),pn=["CY","AC","F0","RS1","RS0","OV","—","P"];
      h+=`<h5>PSW = ${H2(psw)}H (cờ)</h5><div class="m51-bits">${pn.map((n,i)=>{const b=(psw>>(7-i))&1,pb=S.prev?(S.prev.sfr[0x50]>>(7-i))&1:b;return `<span class="${b?"on":""}${pb!==b?" chg":""}"><i>${n}</i>${b}</span>`}).join("")}</div>`;
      h+=`<h5>Cổng (chốt / mức chân)</h5><table class="m51-tbl"><thead><tr><th>Cổng</th><th>Chốt</th><th>Chân</th><th>Nhị phân (chân 7…0)</th></tr></thead><tbody>${[0,1,2,3].map(i=>{const l=m.latch(i),p=m.pins(i);return `<tr><td>P${i}</td><td class="${chgS(0x80+i*16,l)?"chg":""}">${H2(l)}H</td><td>${H2(p)}H</td><td>${p.toString(2).padStart(8,"0").replace(/(....)/,"$1 ")}</td></tr>`}).join("")}</tbody></table>`;
      const sf=[["TMOD",0x89],["TCON",0x88],["TH0",0x8C],["TL0",0x8A],["TH1",0x8D],["TL1",0x8B],["SCON",0x98],["SBUF (ghi)",0x99],["IE",0xA8],["IP",0xB8],["PCON",0x87]];
      /* Timer 2 (8052/AT89S52): chỉ hiện khi chương trình đã dùng tới các thanh ghi này */
      if(m.ramSize===256&&[0xC8,0xC9,0xCA,0xCB,0xCC,0xCD].some(a=>m.sfr[a-0x80]))sf.push(["T2CON",0xC8],["T2MOD",0xC9],["TH2",0xCD],["TL2",0xCC],["RCAP2H",0xCB],["RCAP2L",0xCA]);
      h+=`<h5>Timer, ngắt, UART</h5><table class="m51-tbl"><tbody>${sf.map(([n,a],i)=>`${i%2?"":"<tr>"}<td>${n}</td><td class="${chgS(a,m.sfr[a-0x80])?"chg":""}">${H2(m.sfr[a-0x80])}H</td>${i%2?"</tr>":""}`).join("")}${sf.length%2?"</tr>":""}<tr><td>SBUF (nhận)</td><td>${H2(m.uartState().sbufR)}H</td><td>Đang phục vụ ngắt</td><td>${m.inHi?"mức cao":m.inLo?"mức thấp":"không"}</td></tr></tbody></table>`;
      box.innerHTML=h;$(".m51-cyc").textContent=`${m.cyc.toLocaleString("vi-VN")} chu kỳ máy · ${fmtT(m.time())}`;
      if(S.ask){const f=box.querySelector(".m51-pa,.m51-po");if(f)f.focus({preventScroll:true})}}
    function renderCode(){const box=$(".m51-code-s"),r=S.asm;if(!r||!r.ok){box.innerHTML=`<p class="mem-empty">Mã máy của từng lệnh (địa chỉ, các byte, số chu kỳ) hiện ở đây sau khi dịch.</p>`;$(".m51-size").textContent="";return}
      const src=ed.value.split("\n");const rows=[];r.lines.forEach((x,ln)=>{if(x&&x.bytes&&x.bytes.length)rows.push([ln,x])});
      let k=rows.findIndex(([ln])=>ln===S.cur);if(k<0)k=0;const a=Math.max(0,Math.min(k-5,rows.length-12)),b=Math.min(rows.length,a+12);
      box.innerHTML=`<table class="m51-tbl m51-lst"><colgroup><col class="c1"><col class="c2"><col class="c3"><col></colgroup><thead><tr><th>Địa chỉ</th><th>Mã máy</th><th title="chu kỳ máy">CK</th><th>Dòng nguồn</th></tr></thead><tbody>${rows.slice(a,b).map(([ln,x])=>{const cur=ln===S.cur?' class="cur"':"";
        return `<tr><td${cur}>${hx4(x.addr)}</td><td${cur}>${x.bytes.slice(0,4).map(H2).join(" ")}${x.bytes.length>4?" …":""}</td><td${cur}>${x.cyc||"—"}</td><td class="src${ln===S.cur?" cur":""}" title="${E((src[ln-1]||"").trim())}">${ln}: ${E((src[ln-1]||"").trim())}</td></tr>`}).join("")}</tbody></table><p class="m51-leg">Hiện 12 dòng quanh lệnh kế tiếp · CK = số chu kỳ máy · “—” là dữ liệu (DB, DW).</p>`;
      $(".m51-size").textContent=`${r.size} byte mã`}
    function renderMem(){const m=S.m,box=$(".m51-mem-s");if(!m){box.innerHTML=`<p class="mem-empty">Sơ đồ RAM trong (băng thanh ghi, vùng bit, vùng dùng chung, ngăn xếp), SFR và RAM ngoài hiện ở đây khi chương trình chạy.</p>`;return}
      const bank=m.reg("RS"),sp=m.reg("SP"),top=m.ramSize;let h=`<h5>RAM trong ${hx2(0)}H–${hx2(top-1)}H (8 byte mỗi hàng)</h5><div class="m51-leg"><span><i class="bk0" style="background:color-mix(in srgb,var(--accent) 22%,transparent)"></i>băng 0–3 (R0–R7)</span><span><i style="background:color-mix(in srgb,var(--syn-str) 30%,transparent)"></i>vùng bit 20H–2FH</span><span><i style="box-shadow:inset 0 -3px 0 var(--err)"></i>ô SP trỏ tới</span><span><i style="outline:2px solid var(--accent);outline-offset:-2px"></i>băng đang dùng</span></div><div class="m51-ram" role="table" aria-label="RAM trong">`;
      for(let r0=0;r0<top;r0+=8){h+=`<span class="ad">${hx2(r0)}</span>`;for(let a=r0;a<r0+8;a++){const v=m.iram[a];let c=a<32?"bk"+(a>>3)+((a>>3)===bank?" cur":""):a<48?"bit":a>=128?"up":"";if(a===sp)c+=" sp";if(chgR(a,v))c+=" chg";h+=`<span class="${c}" title="${hx2(a)}H = ${v}">${H2(v)}</span>`}}
      h+=`</div>`;if(top>128)h+=`<p class="m51-leg">80H–FFH (8052): chỉ truy cập gián tiếp bằng @R0, @R1 hoặc ngăn xếp; địa chỉ trực tiếp 80H–FFH là SFR.</p>`;
      h+=`<h5>RAM ngoài (MOVX)</h5><div class="m51-xr"><label>Từ địa chỉ <input class="m51-xa" value="${H4(S.xa)}" aria-label="Địa chỉ bắt đầu RAM ngoài (hệ 16)" spellcheck="false" autocomplete="off"></label><span>DPTR = ${H4(m.reg("DPTR"))}H</span></div><div class="m51-ram">`;
      for(let r0=S.xa;r0<S.xa+64;r0+=8){h+=`<span class="ad">${H4(r0&0xFFFF)}</span>`;for(let a=r0;a<r0+8;a++){const v=m.xram[a&0xFFFF];h+=`<span${(a&0xFFFF)===m.reg("DPTR")?' class="cur"':""}>${H2(v)}</span>`}}
      box.innerHTML=h+`</div>`;const xi=box.querySelector(".m51-xa");xi.onchange=()=>{const v=parseInt(xi.value,16);S.xa=isNaN(v)?0:v&0xFFF8;renderMem()}}
    function renderStk(){const m=S.m,box=$(".m51-stk-s");if(!m){box.innerHTML=`<p class="mem-empty">Ngăn xếp nằm trong RAM trong, bắt đầu từ SP + 1 (sau reset SP = 07H nên byte đầu tiên vào 08H, trùng băng 1).</p>`;$(".m51-sph").textContent="";return}
      const sp=m.reg("SP"),lo=Math.max(0,Math.min(...[8,sp+1].filter(x=>x<=sp+1)));const L=[];for(let a=sp;a>=Math.max(0x08,sp-15)&&a>=lo;a--)L.push(a);
      $(".m51-sph").textContent=`SP = ${hx2(sp)}H`;
      box.innerHTML=L.length&&sp>=0x08?`<table class="m51-tbl"><thead><tr><th>Địa chỉ</th><th>Giá trị</th><th class="wr">Ghi chú</th></tr></thead><tbody>${L.map(a=>`<tr><td>${hx2(a)}H${a===sp?" ← SP":""}</td><td class="${chgR(a,m.iram[a])?"chg":""}">${H2(m.iram[a])}H</td><td class="wr">${E(S.notes[a]||"")}</td></tr>`).join("")}</tbody></table><p class="m51-leg">Đỉnh ngăn xếp ở trên. PUSH: SP tăng rồi ghi; POP: đọc rồi SP giảm. LCALL/ACALL và ngắt cất PC byte thấp trước, byte cao sau.</p>`:`<p class="mem-empty">Ngăn xếp đang trống (SP = ${hx2(sp)}H).</p>`}
    /* đồ thị thời gian: các tín hiệu đã ghi trong m.trace (chu kỳ, gói bit) */
    const SIG=[["TR0",v=>v>>4&1],["TF0",v=>v>>5&1],["TR1",v=>v>>6&1],["TF1",v=>v>>7&1],["IE0",v=>v>>1&1],["IE1",v=>v>>3&1],["Ngắt",v=>(v>>10&1)|(v>>11&1)],["TI",v=>v>>9&1],["RI",v=>v>>8&1],["TXD",v=>v>>12&1],["P1.0",v=>v>>13&1],["INT0",v=>v>>21&1],["T0",v=>v>>26&1],["T1",v=>v>>27&1],["TR2",v=>v>>23&1],["TF2",v=>v>>24&1],["EXF2",v=>v>>25&1],["T2EX",v=>v>>14&1]];
    function renderTimHead(){const m=S.m;$(".m51-timh").textContent=m?`t = ${fmtT(m.time())}`:""}
    function renderTim(){const m=S.m,box=$(".m51-tim");renderTimHead();if(!m){box.innerHTML=`<p class="mem-empty">Đồ thị thời gian của timer (TR, TF, Timer 2), chân đếm T0 (P3.4), T1 (P3.5), T2EX (P1.1), ngắt (IE0, IE1, đang phục vụ ngắt), UART (TI, RI, TXD) và P1.0 hiện ở đây khi chương trình chạy.</p>`;return}
      const T=m.trace,end=m.cyc,W=S.zoom===0?Math.max(1,end):S.zoom,beg=Math.max(0,end-W);
      /* chỉ vẽ tín hiệu có đổi mức trong cả lần chạy; tín hiệu đứng yên ghi tên ở dưới */
      const act=SIG.filter(([n,f])=>{let a=null;for(let i=1;i<T.length;i+=2){const b=f(T[i]);if(a!=null&&b!==a)return true;a=b}return false});
      const still=SIG.filter(x=>!act.includes(x)).map(x=>x[0]);
      const rows=act.length?act:SIG.slice(0,2),rh=26,lw=48,w=Math.max(300,Math.floor(box.clientWidth||600)),hgt=rows.length*rh+30;const x=c=>lw+(c-beg)/Math.max(1,W)*(w-lw-8);
      let v0=null;const pts=[];for(let i=0;i<T.length;i+=2){if(T[i]<=beg)v0=T[i+1];else pts.push([T[i],T[i+1]])}if(v0==null)v0=pts.length?pts[0][1]:0;
      let s=`<svg viewBox="0 0 ${w} ${hgt}" width="${w}" height="${hgt}" role="img" aria-label="Đồ thị thời gian ${W} chu kỳ máy gần nhất">`;
      rows.forEach(([n,f],k)=>{const y0=k*rh+22,hi=y0-14,lo=y0;let d=`M${x(beg)},${f(v0)?hi:lo}`,cur=f(v0);for(const [c,v] of pts){const b=f(v);if(b!==cur){d+=` H${x(c).toFixed(1)} V${b?hi:lo}`;cur=b}}d+=` H${x(end)}`;
        s+=`<text x="2" y="${y0-2}" font-size="12" fill="currentColor">${n}</text><line x1="${lw}" x2="${w-8}" y1="${y0+4}" y2="${y0+4}" stroke="var(--line)" stroke-width=".6"/><path d="${d}" fill="none" stroke="var(--accent)" stroke-width="1.8"/>`});
      const txRow=rows.findIndex(r=>r[0]==="TXD");
      if(txRow>=0)for(const f of m.tx){if(f.cs==null)continue;const c1=f.c1??end;if(c1<beg||f.cs>end)continue;const xx=x(Math.max(beg,f.cs));s+=`<text x="${xx+2}" y="${txRow*rh+22-16}" font-size="11" fill="var(--warm)">${H2(f.b)}H${f.b>=32&&f.b<127?" '"+E(String.fromCharCode(f.b))+"'":""}</text>`}
      s+=`<text x="${lw}" y="${hgt-6}" font-size="11.5" fill="currentColor">${fmtT(beg*12/m.fosc)}</text><text x="${w-8}" y="${hgt-6}" font-size="11.5" text-anchor="end" fill="currentColor">${fmtT(end*12/m.fosc)}</text></svg>`;
      box.innerHTML=`<div class="zoom" role="group" aria-label="Độ rộng khung thời gian">${[100,400,2000,20000,200000,0].map(z=>`<button type="button" class="btn${z===S.zoom?" pri":""}" data-z="${z}">${z?z.toLocaleString("vi-VN")+" CK":"Từ đầu"}</button>`).join("")}</div>${s}<p class="m51-leg">Khung ${W.toLocaleString("vi-VN")} chu kỳ máy (CK) gần nhất ≈ ${fmtT(W*12/m.fosc)}. Mức cao = 1; 1 CK = 12 chu kỳ thạch anh = ${(12e6/m.fosc).toLocaleString("vi-VN",{maximumFractionDigits:4})} µs; tín hiệu ghi chính xác tới từng chu kỳ máy.${still.length?` Không đổi mức trong lần chạy này: ${still.join(", ")}.`:""}</p>`;
      box.querySelectorAll("[data-z]").forEach(b=>b.onclick=()=>{S.zoom=+b.dataset.z;renderTim()})}
    function renderTerm(){const m=S.m,t=$(".m51-term");if(!m){t.textContent="(chưa có dữ liệu)";return}
      const tx=m.tx.filter(f=>f.cs!=null&&f.c1!=null).map(f=>f.b);let h=tx.length?E(tx.map(b=>b===13?"":b===10?"\n":b>=32&&b<127?String.fromCharCode(b):`[${H2(b)}]`).join("")):"";
      const rx=(m.rxLog||[]).map(x=>x.b);if(rx.length)h+=`\n<span class="rx">→ RXD đã nhận: ${E(rx.map(b=>b>=32&&b<127?String.fromCharCode(b):`[${H2(b)}]`).join(""))}</span>`;
      const st=m.uartState();if(st.tx||tx.length)h+=`\n<span class="rx">(${["chế độ 0: thanh ghi dịch","chế độ 1: 8 bit","chế độ 2: 9 bit","chế độ 3: 9 bit"][st.cfg.mode]} · baud ≈ ${Math.round(st.baud).toLocaleString("vi-VN")})</span>`;
      t.innerHTML=h||"(chưa có dữ liệu)"}
    function renderOut(){const box=$(".m51-out"),m=S.m;let h=S.msgs.map(x=>`<p class="m51-msg ${x.k}">${x.t}</p>`).join("");
      if(m)m.warns.forEach(w=>{h+=`<p class="m51-msg warn">Cảnh báo (PC ${hx4(w.pc||0)}H): ${E(w.t)}</p>`});
      if(!h)h=`<p class="mem-empty">Thông báo của trình dịch, lỗi khi chạy, số chu kỳ máy và thời gian chạy hiện ở đây.</p>`;
      box.innerHTML=h;renderTerm()}
    /* thiết bị ảo */
    function renderDev(){const box=$(".m51-dev"),dv=preset().dev||{led:true,btn:true},D=S.D,m=S.m;const H={};
      const seg7=(L,n)=>{let s=`<svg viewBox="0 0 ${n*46+4} 74" width="${n*46+4}" role="img" aria-label="LED 7 đoạn">`;
        const SG=[[8,4,26,6],[34,8,6,26],[34,40,6,26],[8,64,26,6],[2,40,6,26],[2,8,6,26],[8,34,26,6]];
        for(let d=0;d<n;d++){const ox=4+d*46,on=L?L[d]:[];SG.forEach((r,k)=>{const b=on[k]||0;s+=`<rect x="${ox+r[0]}" y="${r[1]}" width="${r[2]}" height="${r[3]}" rx="2" fill="${b>0.05?`rgba(255,60,40,${0.25+0.75*b})`:"rgba(120,40,30,.25)"}"/>`});const dp=on[7]||0;s+=`<circle cx="${ox+42}" cy="68" r="3" fill="${dp>0.05?"rgba(255,60,40,1)":"rgba(120,40,30,.25)"}"/>`}
        return s+"</svg>"};
      if(dv.led){const c=Object.assign({},MCU51DEV.DEF.led,dv.led===true?{}:dv.led);const duty=D&&D.led?D.led.duty():null;
        H.led=`<div class="m51-box" data-dev="led"><b>8 LED ở P${c.port} (sáng khi chân = ${c.activeLow?0:1})</b><div class="m51-leds">${[7,6,5,4,3,2,1,0].map(i=>{const b=duty?duty[i]:0;return `<span class="m51-led"><i style="${b>0.02?`background:rgba(255,${60+Math.round(100*(1-b))},40,${0.35+0.65*b});border-color:#ff8a70;box-shadow:0 0 ${Math.round(10*b)}px rgba(255,90,60,${b})`:""}" aria-label="LED P${c.port}.${i} ${b>0.5?"sáng":"tắt"}"></i>${c.port}.${i}</span>`}).join("")}</div></div>`}
      if(dv.btn){const c=Object.assign({},MCU51DEV.DEF.btn,dv.btn===true?{}:dv.btn);H.btn=`<div class="m51-box" data-dev="btn"><b>Nút bấm (bấm = kéo chân xuống 0)</b><div class="m51-btns">${c.pins.map((p,i)=>`<button type="button" data-btn="${i}" class="${D&&D.btn&&D.btn.down.has(i)?"dn":""}" aria-pressed="${!!(D&&D.btn&&D.btn.down.has(i))}">${E(c.names[i]||"K"+(i+1))}<br><small>${E(p)}</small></button>`).join("")}</div><label class="m51-leg"><input type="checkbox" class="m51-latch"${S.latch?" checked":""}> Giữ nút (bấm lần nữa để nhả) — dùng khi chạy từng bước</label></div>`}
      if(dv.seg){const c=Object.assign({},MCU51DEV.DEF.seg,dv.seg===true?{}:dv.seg);const n=D&&D.seg?D.seg.n:Math.min(c.digits||4,(c.sel||[]).length||1);
        H.seg=`<div class="m51-box m51-seg" data-dev="seg"><b>LED 7 đoạn (đoạn ở P${c.port}${c.sel&&c.sel.length?`, chọn số ${c.sel.slice(0,n).join(", ")}`:""})</b>${seg7(D&&D.seg?D.seg.light():null,n)}</div>`}
      if(dv.key){const c=Object.assign({},MCU51DEV.DEF.key,dv.key===true?{}:dv.key);H.key=`<div class="m51-box" data-dev="key"><b>Ma trận phím 4×4 (hàng ${c.rows[0]}…, cột ${c.cols[0]}…)</b><div class="m51-keys">${c.labels.map((l,i)=>`<button type="button" data-key="${i}" class="${D&&D.key&&D.key.down===i?"dn":""}">${E(l)}</button>`).join("")}</div><label class="m51-leg"><input type="checkbox" class="m51-latch"${S.latch?" checked":""}> Giữ phím (bấm lần nữa để nhả) — dùng khi chạy từng bước</label></div>`}
      if(dv.lcd){const c=Object.assign({},MCU51DEV.DEF.lcd,dv.lcd===true?{}:dv.lcd);let rows=["",""],off=true,cur=-1;
        if(D&&D.lcd){const st=D.lcd.st;off=!st.disp;rows=D.lcd.text().map(r=>r.map(ch=>ch<8?"█":ch>=32&&ch<127?String.fromCharCode(ch):"▯").join(""));if(st.cur&&!st.cgMode){const a=st.ac,row=a>=0x40?1:0,col=((a&0x3F)-st.shift%40+40)%40;if(col<16)cur=row*16+col}}
        H.lcd=`<div class="m51-box" data-dev="lcd"><b>LCD 16×2 (dữ liệu P${c.port}, RS ${c.rs}, RW ${c.rw}, E ${c.e})</b><div class="m51-lcd${off?" off":""}" role="img" aria-label="Màn hình LCD: ${E(rows.join(" / ").trim())}">${rows.map((r,ri)=>`<div>${[...r.padEnd(16)].map((ch,ci)=>ri*16+ci===cur?`<u>${E(ch)}</u>`:E(ch)).join("")}</div>`).join("")}</div>${D&&D.lcd&&D.lcd.st.log.length?`<p class="m51-leg">${E(D.lcd.st.log[D.lcd.st.log.length-1])}</p>`:""}</div>`}
      if(dv.step){const c=Object.assign({},MCU51DEV.DEF.step,dv.step===true?{}:dv.step);const ang=D&&D.step?D.step.angle():0,co=D&&D.step?D.step.st.coils:0;
        H.step=`<div class="m51-box m51-step" data-dev="step"><b>Động cơ bước (${c.pins.join(", ")})</b><svg viewBox="0 0 120 120" role="img" aria-label="Động cơ bước, góc ${ang.toFixed(1)} độ"><circle cx="60" cy="60" r="50" fill="none" stroke="var(--line)" stroke-width="3"/>${["A","B","C","D"].map((n,i)=>{const a=i*Math.PI/2-Math.PI/2,on=co>>i&1;return `<circle cx="${60+50*Math.cos(a)}" cy="${60+50*Math.sin(a)}" r="9" fill="${on?"var(--warm)":"var(--surface)"}" stroke="var(--line)"/><text x="${60+50*Math.cos(a)}" y="${64+50*Math.sin(a)}" font-size="10" text-anchor="middle" fill="currentColor">${n}</text>`}).join("")}<line x1="60" y1="60" x2="${60+38*Math.sin(ang*Math.PI/180)}" y2="${60-38*Math.cos(ang*Math.PI/180)}" stroke="var(--accent)" stroke-width="5" stroke-linecap="round"/><circle cx="60" cy="60" r="5" fill="var(--accent)"/></svg><small>Góc ${ang.toLocaleString("vi-VN",{maximumFractionDigits:1})}° · ${D&&D.step?D.step.st.pos:0} nửa bước${D&&D.step&&D.step.st.bad?` · ${D.step.st.bad} lần đổi pha sai thứ tự`:""}</small></div>`}
      /* thiết bị đăng ký thêm (MCU51DEV.EXT, ví dụ bus I2C/SPI ở 56-mcu51-bus.js): tự vẽ phần của mình */
      const EX=MCU51DEV.EXT||{};for(const k in EX)if(dv[k]&&EX[k].html)H[k]=EX[k].html(Object.assign({},EX[k].DEF,dv[k]===true?{}:dv[k]),D&&D[k],m,{E,H2,fmtT});
      /* thiết bị đăng ký thêm (MCU51DEV.PLUG): mỗi thiết bị tự vẽ (html) và tự cập nhật phần tử của mình (update) */
      const PL=MCU51DEV.PLUG||{},pcfg=k=>Object.assign({},PL[k].def||{},dv[k]===true?{}:dv[k]);
      for(const k in PL)if(dv[k]&&PL[k].html)H[k]=PL[k].html(D&&D[k],pcfg(k),m);
      /* nút và phím giữ nguyên phần tử (đang bấm giữ thì không bị vẽ lại mất sự kiện thả); phần hiển thị thay mới */
      const sig=S.pi+":"+Object.keys(H).join(",");
      if(box.dataset.sig!==sig){box.dataset.sig=sig;box.innerHTML=Object.values(H).join("")||`<p class="mem-empty">Ví dụ này không dùng thiết bị ảo.</p>`;bindDev()}
      else for(const k in H){const el=box.querySelector(`[data-dev="${k}"]`);if(!el)continue;
        if(k==="btn"||k==="key"){el.querySelectorAll("[data-btn]").forEach(x=>{const on=!!(D&&D.btn&&D.btn.down.has(+x.dataset.btn));x.classList.toggle("dn",on);x.setAttribute("aria-pressed",on)});
          el.querySelectorAll("[data-key]").forEach(x=>x.classList.toggle("dn",!!(D&&D.key&&D.key.down===+x.dataset.key)))}
        else if(PL[k]&&PL[k].update)PL[k].update(el,D&&D[k],pcfg(k),m);
        else el.outerHTML=H[k]}
      $(".m51-devh").textContent=m?`${fmtT(m.time())}`:""}
    function bindDev(){const box=$(".m51-dev");box.querySelectorAll(".m51-latch").forEach(lt=>{lt.onchange=()=>{S.latch=lt.checked;box.querySelectorAll(".m51-latch").forEach(x=>{x.checked=S.latch})}});
      {const PL=MCU51DEV.PLUG||{};for(const k in PL){const el=box.querySelector(`[data-dev="${k}"]`);if(el&&PL[k].bind)PL[k].bind(el,()=>{if(!S.m)boot0();return S.D&&S.D[k]},()=>{if(!S.running)renderDev()})}}
      box.querySelectorAll("[data-btn]").forEach(b=>{const i=+b.dataset.btn;const set=on=>{if(!S.m)boot0();if(!S.D||!S.D.btn)return;S.D.btn.set(i,on);b.classList.toggle("dn",on);b.setAttribute("aria-pressed",on)};
        b.onpointerdown=e=>{e.preventDefault();if(S.latch)set(!S.D||!S.D.btn||!S.D.btn.down.has(i));else{set(true);b.setPointerCapture&&b.setPointerCapture(e.pointerId)}};
        b.onpointerup=b.onpointercancel=()=>{if(!S.latch)set(false)};
        b.onkeydown=e=>{if(e.key===" "||e.key==="Enter"){e.preventDefault();set(S.latch?!(S.D&&S.D.btn&&S.D.btn.down.has(i)):true)}};b.onkeyup=e=>{if(!S.latch&&(e.key===" "||e.key==="Enter"))set(false)}});
      box.querySelectorAll("[data-key]").forEach(b=>{const i=+b.dataset.key;const set=on=>{if(!S.m)boot0();if(!S.D||!S.D.key)return;S.D.key.down=on?i:null;box.querySelectorAll("[data-key]").forEach(x=>x.classList.toggle("dn",S.D.key.down===+x.dataset.key))};
        b.onpointerdown=e=>{e.preventDefault();if(S.latch)set(S.D&&S.D.key&&S.D.key.down===i?false:true);else{set(true);b.setPointerCapture&&b.setPointerCapture(e.pointerId)}};
        b.onpointerup=b.onpointercancel=()=>{if(!S.latch)set(false)};b.onkeydown=e=>{if(e.key===" "||e.key==="Enter"){e.preventDefault();set(true)}};b.onkeyup=()=>{if(!S.latch)set(false)}})}
    window.addEventListener("pointerup",()=>{if(S.latch||!S.D)return;if(S.D.btn&&S.D.btn.down.size){S.D.btn.down.clear();renderDev()}if(S.D.key&&S.D.key.down!=null){S.D.key.down=null;renderDev()}});
    function boot0(){/* bấm thiết bị trước khi chạy: dịch và dựng máy (không chạy) */if(boot()){setChip("step","Sẵn sàng · dòng "+(S.cur||1));live(true);renderAll();btns()}}
    /* UART: gửi chuỗi vào RXD */
    $(".m51-ub").onclick=()=>{const v=$(".m51-in").value;if(!v)return;if(!S.m&&!boot())return;for(const ch of v)S.m.uartIn(ch.charCodeAt(0)&255);$(".m51-in").value="";S.msgs.push({k:"ok",t:`Đã đưa ${v.length} byte vào đường RXD (chương trình cần REN = 1 để nhận).`});renderOut()};
    $(".m51-in").addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();$(".m51-ub").click()}});
    /* ---------- ví dụ ---------- */
    function load(i){stop();S.pi=i;const p=preset();ed.value=p.code.replace(/\n$/,"");if(p.fosc)fSel.value=String(p.fosc);if(p.speed){spSel.value=p.speed;S.spAuto=1}else if(S.spAuto){spSel.value="fast";S.spAuto=0}S.bp=new Set();resetBtn();
      const n=$(".s-note");n.hidden=!p.note;n.querySelector(".sn-1").textContent=p.note||"";n.querySelector(".sn-t").textContent=p.note||"";n.open=!MOB();
      const ed0=p.dev||{led:true,btn:true};secOf("dev").hidden=navB("dev").hidden=!Object.keys(ed0).some(k=>ed0[k]);renderAll()}
    sel.onchange=()=>load(+sel.value);fSel.onchange=()=>{resetBtn()};
    load(0);
    return {el:root,run:()=>{if(S.running)return;S.m=null;runBtn()},step:stepBtn,reset:resetBtn,get:()=>ed.value,set:c=>{ed.value=c;ed.dispatchEvent(new Event("input"))},machine:()=>S.m,devices:()=>S.D,state:S}}
  /* ---------- bài tập chấm tự động ---------- */
  function buildEx(el,lid,exs){css();el.classList.add("m51-exs");
    el.innerHTML=exs.map((x,i)=>`<article class="ex m51-ex" data-i="${i}"><h4>Bài tập ${i+1}. ${E(x.t)}</h4><div class="mt-d">${x.d}</div>
      <div class="editor"><div class="gutter"></div><div class="ed-wrap"><pre class="ed-hl" aria-hidden="true"></pre><textarea class="ed-ta" spellcheck="false" autocapitalize="off" autocomplete="off" aria-label="Mã hợp ngữ bài tập ${i+1}"></textarea></div></div>
      <div class="ex-btns" style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px"><button type="button" class="btn pri m51-go">Nộp bài</button><button type="button" class="btn m51-rs">Viết lại từ đầu</button><span class="st" role="status" aria-live="polite"></span></div>
      <div class="ex-res"></div></article>`).join("");
    el.querySelectorAll(".m51-ex").forEach(card=>{const i=+card.dataset.i,x=exs[i],key=`${lid}-${i}`,ta=card.querySelector(".ed-ta"),hlx=card.querySelector(".ed-hl"),gt=card.querySelector(".gutter"),res=card.querySelector(".ex-res"),st=card.querySelector(".st");let fails=0;
      const LS="amts-m51-"+key;let saved=null;try{saved=localStorage.getItem(LS)}catch(e){}
      ta.value=saved||x.start||"";
      const pt=()=>{const L=ta.value.split("\n");hlx.innerHTML=L.map(s=>`<span class="row">${hlLine(s)||" "}</span>`).join("");gt.innerHTML=L.map((_,k)=>`<div>${k+1}</div>`).join("");hlx.scrollTop=ta.scrollTop;gt.scrollTop=ta.scrollTop};
      ta.addEventListener("input",()=>{pt();try{localStorage.setItem(LS,ta.value)}catch(e){}});ta.addEventListener("scroll",()=>{hlx.scrollTop=ta.scrollTop;hlx.scrollLeft=ta.scrollLeft;gt.scrollTop=ta.scrollTop});pt();
      card.querySelector(".m51-rs").onclick=()=>{ta.value=x.start||"";pt();try{localStorage.removeItem(LS)}catch(e){}res.innerHTML="";st.textContent=""};
      card.querySelector(".m51-go").onclick=()=>{const g=MCU51CPU.grade(ta.value,x.spec||{});const pass=g.pass;
        st.className="st "+(pass?"pass":"fail");st.textContent=pass?"Đạt":"Chưa đạt";
        let h=`<ul>${g.msgs.map(t=>`<li>${E(t)}</li>`).join("")}</ul>`;if(g.ok)h+=`<p>Mã: <b>${g.bytes}</b> byte · chạy: <b>${g.cycles.toLocaleString("vi-VN")}</b> chu kỳ máy${x.spec&&x.spec.maxCyc?` (giới hạn ${x.spec.maxCyc})`:""}${x.spec&&x.spec.maxBytes?` · giới hạn ${x.spec.maxBytes} byte`:""}.</p>`;
        if(!pass&&x.hints&&x.hints.length){fails++;h+=x.hints.slice(0,Math.min(fails,x.hints.length)).map((t,k)=>`<p><b>Gợi ý ${k+1}:</b> ${t}</p>`).join("")}
        if(pass&&x.why)h+=`<p><b>Giải thích:</b> ${x.why}</p>`;res.innerHTML=h;
        if(window.TRACK)TRACK.ex(key,pass,`${g.bytes} byte, ${g.cycles} chu kỳ`)};
      const was=window.TRACK&&TRACK.exOf&&TRACK.exOf(key);if(was&&was.pass){st.className="st pass";st.textContent="Đã đạt trước đó"}})}
  return {build,buildEx,hlLine}})();
/* dựng khi bài được mở (giống makeSim2): bài đang ẩn thì để sau */
function makeSim51(root,cfg){let s=null;const ensure=()=>s||(s=MCU51UI.build(root,cfg));if(typeof deferInit==="function")deferInit(root,ensure);else ensure();
  return {el:root,run:()=>ensure().run(),step:()=>ensure().step(),reset:()=>ensure().reset(),get:()=>ensure().get(),set:c=>ensure().set(c),machine:()=>ensure().machine()}}
function makeEx51(el,lid,exs){const go=()=>MCU51UI.buildEx(el,lid,exs);if(typeof deferInit==="function")deferInit(el,go);else go()}
/* ===================== trình mô phỏng của khóa (platform/js/56-mcu51-ana.js) ===================== */
/* ===================== Trình mô phỏng 8051 · 6: thiết bị đo lường và điều khiển tải (mô hình + giao diện của từng thiết bị) =====================
   Đăng ký vào MCU51DEV.PLUG (54-mcu51-dev.js); dùng trong preset: dev:{adc:{…}, dac:{…}, motor:{…}, enc:{…}}.
   Mọi thông số dưới đây là GIẢ ĐỊNH của mô hình học tập (docs/TRINH-MO-PHONG-8051.md mục 10a), không phải số liệu của một IC cụ thể:
     adc    ADC 8 bit giao tiếp song song kiểu ADC0804: dữ liệu ở P1, WR = P3.6, RD = P3.7, INTR = P3.2 (INT0), CS nối cố định mức 0.
            WR 1→0: INTR lên 1; WR 0→1: lấy mẫu Vin và bắt đầu chuyển đổi; sau conv_us micro giây kết quả vào thanh ghi ra và INTR = 0.
            RD = 0: ADC xuất thanh ghi ra lên P1 (chân bit 0 bị kéo xuống); RD 1→0 đưa INTR về 1. RD = 1: ADC thả bus (P1 đọc 1 nhờ điện trở kéo lên).
            Mã = floor(Vin × 2^bits / vref), chặn ở 2^bits − 1 (lượng tử hóa làm tròn xuống; ADC thật có thể lệch 1/2 LSB — tra datasheet).
            Vin: hằng số (thanh trượt) hoặc dãy seq (mỗi lần chuyển đổi lấy phần tử kế tiếp, quay vòng).
     dac    DAC 8 bit ở P2: Vout = mã × vref / 2^bits, đổi ngay khi chốt cổng đổi (bỏ qua thời gian xác lập). Ghi lại lịch sử để vẽ dạng sóng.
     motor  driver cầu H kiểu L293D/L298: EN = P2.0 (PWM), IN1 = P2.1, IN2 = P2.2. IN1 = 1, IN2 = 0: thuận; 0, 1: ngược; bằng nhau: dừng.
            Đo từ sườn lên tới sườn lên của EN: chu kỳ, thời gian mức cao, duty, độ rung chu kỳ (jitter = chu kỳ dài nhất − ngắn nhất).
            Tốc độ tương đối: lọc bậc nhất của (chiều × EN) với hằng số thời gian tau_ms (giả định); không mô phỏng dòng, điện áp, mô-men.
     enc    encoder tăng dần hai kênh A = P3.2 (INT0), B = P3.3, lệch 90°: quay thuận thì A sớm hơn B. pps = số chu kỳ kênh A mỗi giây
            (âm = quay ngược); ppr = số xung mỗi vòng. Pha φ(t) = phase0 + pps·t; q = floor(4φ) mod 4 → (A,B) = (0,0),(1,0),(1,1),(0,1).
            Sườn xuống A: quay thuận ở φ = k + 0,75 (B = 1), quay ngược ở φ = k + 0,25 (B = 0); count(t) = số sườn xuống A có dấu.
            Chân A, B là hàm của thời gian (chu kỳ máy), không có dội, không có nhiễu. */
const MCU51ANA=(function(){
  const DEV=typeof MCU51DEV!=="undefined"?MCU51DEV:require("./54-mcu51-dev.js");
  const PLUG=DEV.PLUG;
  const H2=v=>(v&255).toString(16).toUpperCase().padStart(2,"0");
  const vn=(x,d)=>Number(x).toLocaleString("vi-VN",{minimumFractionDigits:d,maximumFractionDigits:d});
  const E=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"})[c]);
  const lvl=(m,s)=>(m.latch(s.p)>>s.b)&1;
  const cycUs=(m,us)=>Math.max(1,Math.round(us*1e-6*m.fosc/12));
  const usOf=(m,c)=>c*12e6/m.fosc;
  const quant=(v,vref,bits)=>{const n=1<<bits;if(!(v>0))return 0;return Math.min(n-1,Math.floor(v*n/vref+1e-9))};
  /* ---------------- ADC ---------------- */
  PLUG.adc={def:{port:1,wr:"P3.6",rd:"P3.7",intr:"P3.2",vref:5.12,bits:8,conv_us:100,vin:1.3,seq:null},
    make(m,c,{pin}){const wr=pin(c.wr),rd=pin(c.rd),it=pin(c.intr);
      const A={c,quant:v=>quant(v,c.vref,c.bits),
        st:{vin:c.vin,wr:lvl(m,wr),rd:lvl(m,rd),intr:1,out:0,code:0,doneAt:-1,n:0,vs:null,lastRead:null},
        upd(){const s=A.st;if(s.doneAt>=0&&m.cyc>=s.doneAt){s.out=s.code;s.intr=0;s.doneAt=-1}},
        busy(){A.upd();return A.st.doneAt>=0},
        onPort(){const s=A.st;A.upd();const w=lvl(m,wr),r=lvl(m,rd);
          if(s.wr&&!w)s.intr=1;
          if(!s.wr&&w){const v=c.seq&&c.seq.length?c.seq[s.n%c.seq.length]:s.vin;s.vs=v;s.code=A.quant(v);s.doneAt=m.cyc+cycUs(m,c.conv_us);s.n++}
          if(s.rd&&!r){s.intr=1;s.lastRead=s.out}
          s.wr=w;s.rd=r},
        drive(p){A.upd();const s=A.st;let mask=255;
          if(p===it.p&&!s.intr)mask&=~(1<<it.b);
          if(p===c.port&&!lvl(m,rd))mask&=s.out;
          return mask},
        snap:()=>JSON.stringify(A.st),restore(x){if(x)A.st=JSON.parse(x)},
        reset(){A.st={vin:c.vin,wr:lvl(m,wr),rd:lvl(m,rd),intr:1,out:0,code:0,doneAt:-1,n:0,vs:null,lastRead:null}}};
      return A},
    html(A,c,m){if(!m)A=null;const s=A?A.st:{vin:c.vin,intr:1,out:0,n:0,doneAt:-1};const lsb=c.vref/(1<<c.bits);const busy=A?A.busy():false;
      const vNow=c.seq&&c.seq.length?c.seq[(s.n||0)%c.seq.length]:s.vin;const ideal=quant(vNow,c.vref,c.bits);
      const ctl=c.seq&&c.seq.length?`<p class="ana-seq">Dãy Vin (V) cho từng lần chuyển đổi: ${c.seq.map((v,i)=>`<span class="${i===(s.n||0)%c.seq.length?"nx":""}">${vn(v,2)}</span>`).join(" ")}</p>`
        :`<label class="ana-sl">Vin <input type="range" min="0" max="${c.vref}" step="0.01" value="${s.vin}" aria-label="Điện áp vào Vin (V)"><output>${vn(s.vin,2)} V</output></label>`;
      return `<div class="m51-box ana" data-dev="adc"><b>ADC ${c.bits} bit (mô hình kiểu ADC0804, giả định): dữ liệu P${c.port}, WR ${c.wr}, RD ${c.rd}, INTR ${c.intr}</b>${ctl}
        <div class="ana-kv"><span>Toàn thang</span><b>${vn(c.vref,2)} V</b><span>LSB</span><b>${vn(lsb*1000,2)} mV</b><span>Mã lý tưởng của Vin kế tiếp</span><b class="ana-id">${ideal} = ${H2(ideal)}H</b>
        <span>Trạng thái</span><b class="ana-st">${busy?"đang chuyển đổi (INTR = 1)":s.intr?"chờ lệnh (INTR = 1)":"xong (INTR = 0)"}</b><span>Thanh ghi ra</span><b class="ana-out">${H2(s.out)}H${s.vs!=null?` (mẫu lấy ${vn(s.vs,2)} V)`:""}</b><span>Số lần chuyển đổi</span><b class="ana-n">${s.n}</b></div></div>`},
    update(el,A,c,m){const n=el.querySelector(".ana-kv");if(!n)return;const t=document.createElement("div");t.innerHTML=PLUG.adc.html(A,c,m);
      const nn=t.querySelector(".ana-kv");if(nn)n.innerHTML=nn.innerHTML;const sq=el.querySelector(".ana-seq"),sq2=t.querySelector(".ana-seq");if(sq&&sq2)sq.innerHTML=sq2.innerHTML;
      const r=el.querySelector("input[type=range]");if(r&&A&&document.activeElement!==r){r.value=A.st.vin;el.querySelector("output").textContent=vn(A.st.vin,2)+" V"}},
    bind(el,get,redraw){const r=el.querySelector("input[type=range]");if(!r)return;
      r.oninput=()=>{const A=get();el.querySelector("output").textContent=vn(+r.value,2)+" V";if(A)A.st.vin=+r.value;redraw()}}};
  /* ---------------- DAC ---------------- */
  PLUG.dac={def:{port:2,vref:5.12,bits:8,keep:4000},
    make(m,c){const D={c,base:0,h:[[m.cyc,m.latch(c.port)]],
        vout(){return m.latch(c.port)*c.vref/(1<<c.bits)},
        onPort(p){if(p!==c.port)return;D.h.push([m.cyc,m.latch(c.port)]);if(D.h.length>c.keep){const k=D.h.length>>1;D.h=D.h.slice(k);D.base+=k}},
        snap:()=>D.base+D.h.length,
        restore(n){if(n==null){D.base=0;D.h=[[m.cyc,m.latch(c.port)]];return}const k=n-D.base;if(k>=1&&k<D.h.length)D.h.length=k},
        reset(){D.base=0;D.h=[[m.cyc,m.latch(c.port)]]}};
      return D},
    svg(D,c,m){const W=300,Hh=90;if(!D||!m)return `<svg class="ana-sc" viewBox="0 0 ${W} ${Hh}" role="img" aria-label="Chưa có dữ liệu DAC"><rect x="0" y="0" width="${W}" height="${Hh}" fill="none" stroke="var(--line)"/></svg>`;
      const now=m.cyc,h=D.h;let i0=Math.max(0,h.length-260);let span=Math.max(100,now-h[i0][0]);const t0=now-span;
      const X=t=>((t-t0)/span*(W-4)+2).toFixed(1),Y=v=>(Hh-4-(v/((1<<c.bits)-1))*(Hh-8)).toFixed(1);
      let pts=[],prev=null;for(let i=i0;i<h.length;i++){const t=Math.max(h[i][0],t0);if(prev!=null)pts.push(X(t)+","+Y(prev));pts.push(X(t)+","+Y(h[i][1]));prev=h[i][1]}pts.push(X(now)+","+Y(prev));
      return `<svg class="ana-sc" viewBox="0 0 ${W} ${Hh}" role="img" aria-label="Dạng sóng Vout trong ${Math.round(span)} chu kỳ máy gần nhất"><rect x="0" y="0" width="${W}" height="${Hh}" fill="none" stroke="var(--line)"/><line x1="0" y1="${Y(128)}" x2="${W}" y2="${Y(128)}" stroke="var(--line)" stroke-dasharray="3 3"/><polyline fill="none" stroke="var(--accent)" stroke-width="1.6" points="${pts.join(" ")}"/></svg><small>Khung ${Math.round(span).toLocaleString("vi-VN")} chu kỳ máy ≈ ${vn(usOf(m,span),0)} µs gần nhất · nét đứt: mã 80H</small>`},
    html(D,c,m){if(!m)D=null;const code=m?m.latch(c.port):255,n=D?D.base+D.h.length-1:0;let last="";
      if(D&&D.h.length>2){const a=D.h[D.h.length-1][0]-D.h[D.h.length-2][0];last=`<span>Hai lần ghi gần nhất cách</span><b>${a} CK ≈ ${vn(usOf(m,a),1)} µs</b>`}
      return `<div class="m51-box ana" data-dev="dac"><b>DAC ${c.bits} bit ở P${c.port} (mô hình giả định: Vout = mã × ${vn(c.vref,2)} V / ${1<<c.bits}, đổi tức thì)</b>
        <div class="ana-kv"><span>Mã đang xuất</span><b>${H2(code)}H = ${code}</b><span>Vout</span><b>${vn(code*c.vref/(1<<c.bits),3)} V</b><span>Số lần chốt đổi</span><b>${n}</b>${last}</div><div class="ana-plot">${PLUG.dac.svg(D,c,m)}</div></div>`}};
  /* ---------------- driver động cơ (cầu H) ---------------- */
  PLUG.motor={def:{en:"P2.0",in1:"P2.1",in2:"P2.2",vm:12,tau_ms:50},
    make(m,c,{pin}){const en=pin(c.en),i1=pin(c.in1),i2=pin(c.in2);
      const fresh=()=>({en:lvl(m,en),rise:-1,fall:-1,hi:-1,per:-1,pmin:-1,pmax:-1,np:0,sp:0,ang:0,t:m.cyc,u:0});
      const M={c,st:fresh(),
        dir(){const a=lvl(m,i1),b=lvl(m,i2);return a&&!b?1:!a&&b?-1:0},
        input(){return lvl(m,en)?M.dir():0},
        adv(t){const s=M.st,dt=t-s.t;if(dt<=0)return;const tau=c.tau_ms*1e-3*m.fosc/12;const k=1-Math.exp(-dt/tau);
          const sp0=s.sp;s.sp+=(s.u-s.sp)*k;s.ang=(s.ang+(sp0+s.sp)/2*dt*12/m.fosc*720)%360;s.t=t},
        onPort(){const s=M.st;M.adv(m.cyc);const e=lvl(m,en);
          if(!s.en&&e){if(s.rise>=0){const per=m.cyc-s.rise;s.per=per;s.hi=s.fall>s.rise?s.fall-s.rise:per;s.np++;
              if(s.np>1){s.pmin=s.pmin<0?per:Math.min(s.pmin,per);s.pmax=Math.max(s.pmax,per)}}s.rise=m.cyc}
          if(s.en&&!e)s.fall=m.cyc;
          s.en=e;s.u=M.input()},
        snap:()=>JSON.stringify(M.st),restore(x){if(x)M.st=JSON.parse(x);else M.st=fresh()},reset(){M.st=fresh()}};
      M.st.u=M.input();return M},
    html(M,c,m){if(!m)M=null;if(M)M.adv(m.cyc);const s=M?M.st:{per:-1,hi:-1,np:0,sp:0,ang:0,pmin:-1,pmax:-1};const d=M?M.dir():0;
      const duty=s.per>0?s.hi/s.per:null;const a=s.ang*Math.PI/180;
      const txt=d>0?"thuận (IN1 = 1, IN2 = 0)":d<0?"ngược (IN1 = 0, IN2 = 1)":"dừng (IN1 = IN2)";
      return `<div class="m51-box ana ana-mot" data-dev="motor"><b>Driver cầu H + động cơ DC (mô hình giả định): EN ${c.en}, IN1 ${c.in1}, IN2 ${c.in2}</b>
        <div class="ana-row"><svg viewBox="0 0 100 100" role="img" aria-label="Động cơ, chiều ${txt}, tốc độ tương đối ${Math.round(Math.abs(s.sp)*100)} phần trăm"><circle cx="50" cy="50" r="42" fill="none" stroke="var(--line)" stroke-width="3"/><circle cx="50" cy="50" r="${4+Math.abs(s.sp)*30}" fill="var(--accent-soft)"/><line x1="50" y1="50" x2="${(50+36*Math.sin(a)).toFixed(1)}" y2="${(50-36*Math.cos(a)).toFixed(1)}" stroke="var(--accent)" stroke-width="5" stroke-linecap="round"/><circle cx="50" cy="50" r="5" fill="var(--accent)"/></svg>
        <div class="ana-kv"><span>Chiều</span><b>${txt}</b><span>Chu kỳ PWM gần nhất</span><b>${s.per>0?`${s.per} CK ≈ ${vn(usOf(m,s.per),1)} µs (${vn(1e6/usOf(m,s.per),1)} Hz)`:"chưa đo"}</b>
        <span>Duty</span><b>${duty!=null?vn(duty*100,1)+" %":"chưa đo"}</b><span>Điện áp trung bình</span><b>${duty!=null?vn(duty*c.vm,2)+" V (Vm = "+c.vm+" V)":"—"}</b>
        <span>Jitter chu kỳ</span><b>${s.pmax>0?`${s.pmax-s.pmin} CK (ngắn nhất ${s.pmin}, dài nhất ${s.pmax}, ${s.np-1} chu kỳ)`:"cần ít nhất 2 chu kỳ"}</b><span>Tốc độ tương đối</span><b>${vn(s.sp*100,0)} %</b></div></div></div>`}};
  /* ---------------- encoder tăng dần A/B ---------------- */
  const fmod=(x,n)=>((x%n)+n)%n;
  PLUG.enc={def:{a:"P3.2",b:"P3.3",pps:1000,ppr:20,phase0:0.125,cnt:null,rates:[-20000,-5000,-1000,-200,0,200,1000,5000,20000]},
    make(m,c,{pin}){const pa=pin(c.a),pb=pin(c.b);
      const N={c,st:{base:c.phase0,cb:m.cyc,pps:c.pps,c0:0},
        phi(t){const s=N.st;return s.base+s.pps*(t-s.cb)*12/m.fosc},
        ab(t){const q=fmod(Math.floor(4*N.phi(t)),4);return [q===1||q===2?1:0,q>=2?1:0]},
        /* số sườn xuống của A kể từ reset (thuận +1: φ tăng qua k + 0,75, lúc đó B = 1; ngược −1: φ giảm qua k + 0,25, lúc đó B = 0),
           cộng dồn qua các đoạn tốc độ không đổi */
        seg(t){const s=N.st,f=N.phi(t);return s.pps>=0?Math.floor(f-0.75)-Math.floor(s.base-0.75):-(Math.floor(s.base-0.25)-Math.floor(f-0.25))},
        count(t){return (N.st.c0||0)+N.seg(t)},
        setRate(v){const t=m.cyc;N.st={base:N.phi(t),cb:t,pps:v,c0:N.count(t)}},
        drive(p){const [a,b]=N.ab(m.cyc);let mask=255;if(p===pa.p&&!a)mask&=~(1<<pa.b);if(p===pb.p&&!b)mask&=~(1<<pb.b);return mask},
        snap:()=>JSON.stringify(N.st),restore(x){if(x)N.st=JSON.parse(x);else N.st={base:c.phase0,cb:m.cyc,pps:c.pps,c0:0}},reset(){N.st={base:c.phase0,cb:m.cyc,pps:c.pps,c0:0}}};
      return N},
    html(N,c,m){if(!m)N=null;const t=m?m.cyc:0,pps=N?N.st.pps:c.pps,cnt=N?N.count(t):0,ab=N?N.ab(t):[0,0];const ang=(N?N.phi(t):c.phase0)/c.ppr*360;
      const per=pps?1e6/Math.abs(pps):0;let ram="";
      if(c.cnt!=null&&m){const ad=typeof c.cnt==="string"?parseInt(c.cnt,16):c.cnt;const v=m.iram[ad];const sv=v>127?v-256:v;
        ram=`<span>Chương trình đếm (RAM ${H2(ad)}H)</span><b class="${(((cnt%256)+256)%256)!==v?"ana-bad":""}">${H2(v)}H = ${sv}${(((cnt%256)+256)%256)!==v?` · lệch ${cnt-sv} xung`:""}</b>`}
      const a=ang*Math.PI/180;
      return `<div class="m51-box ana ana-enc" data-dev="enc"><b>Encoder tăng dần (mô hình giả định): A ${c.a}, B ${c.b}, ${c.ppr} xung/vòng</b>
        <label class="ana-sl">Tốc độ <select aria-label="Số xung kênh A mỗi giây (âm = quay ngược)">${c.rates.map(r=>`<option value="${r}"${r===pps?" selected":""}>${r>0?"+":""}${r.toLocaleString("vi-VN")} xung/s</option>`).join("")}${c.rates.includes(pps)?"":`<option value="${pps}" selected>${pps.toLocaleString("vi-VN")} xung/s</option>`}</select></label>
        <div class="ana-row"><svg viewBox="0 0 100 100" role="img" aria-label="Đĩa encoder, góc ${Math.round(ang)} độ"><circle cx="50" cy="50" r="42" fill="none" stroke="var(--line)" stroke-width="3"/>${[...Array(c.ppr)].map((_,i)=>{const q=(i/c.ppr)*2*Math.PI+a;return `<line x1="${(50+34*Math.sin(q)).toFixed(1)}" y1="${(50-34*Math.cos(q)).toFixed(1)}" x2="${(50+42*Math.sin(q)).toFixed(1)}" y2="${(50-42*Math.cos(q)).toFixed(1)}" stroke="var(--muted)" stroke-width="2"/>`}).join("")}<line x1="50" y1="50" x2="${(50+30*Math.sin(a)).toFixed(1)}" y2="${(50-30*Math.cos(a)).toFixed(1)}" stroke="var(--accent)" stroke-width="4" stroke-linecap="round"/></svg>
        <div class="ana-kv"><span>Kênh A · B lúc này</span><b>${ab[0]} · ${ab[1]}</b><span>Chu kỳ kênh A</span><b>${pps?`${vn(per,0)} µs ≈ ${Math.round(per*1e-6*(m?m.fosc:12e6)/12).toLocaleString("vi-VN")} CK`:"đứng yên"}</b>
        <span>Số sườn xuống A thật (thuận +, ngược −)</span><b>${cnt}</b>${ram}</div></div></div>`},
    update(el,N,c,m){const t=document.createElement("div");t.innerHTML=PLUG.enc.html(N,c,m);
      ["svg",".ana-kv"].forEach(q=>{const a=el.querySelector(q),b=t.querySelector(q);if(a&&b)a.replaceWith(b)});
      const s=el.querySelector("select");if(s&&N&&document.activeElement!==s)s.value=String(N.st.pps)},
    bind(el,get,redraw){const s=el.querySelector("select");if(!s)return;s.onchange=()=>{const N=get();if(N)N.setRate(+s.value);redraw()}}};
  /* ---------------- CSS (chèn một lần) ---------------- */
  if(typeof document!=="undefined"&&!document.getElementById("mcu51-ana-css")){const st=document.createElement("style");st.id="mcu51-ana-css";
    st.textContent=`.ana .ana-kv{display:grid;grid-template-columns:minmax(0,auto) minmax(0,1fr);gap:2px 10px;font-size:12.5px;align-items:baseline}
.ana .ana-kv span{color:var(--muted)}.ana .ana-kv b{font-family:var(--f-mono);font-weight:600;overflow-wrap:anywhere;color:var(--ink)}
.ana .ana-kv b.ana-bad{color:var(--err)}
.ana .ana-sl{display:flex;flex-wrap:wrap;align-items:center;gap:6px 10px;font-size:13px;margin:2px 0 8px}
.ana .ana-sl input[type=range]{flex:1 1 140px;min-width:0;max-width:100%}.ana .ana-sl select{max-width:100%;font:inherit;padding:4px 6px;border:1px solid var(--line);border-radius:6px;background:var(--surface);color:var(--ink)}
.ana .ana-sl output{font-family:var(--f-mono);min-width:5em}
.ana .ana-seq{font-size:12.5px;margin:2px 0 8px;overflow-wrap:anywhere}.ana .ana-seq span{font-family:var(--f-mono);padding:0 3px;border-radius:4px}.ana .ana-seq span.nx{outline:1.5px solid var(--accent);font-weight:600}
.ana .ana-plot{margin-top:8px}.ana .ana-plot svg{display:block;width:100%;max-width:420px;height:auto}.ana .ana-plot small{display:block;font-size:11.5px;color:var(--muted);margin-top:2px}
.ana .ana-row{display:flex;flex-wrap:wrap;gap:8px 14px;align-items:center}.ana .ana-row>svg{flex:0 0 96px;width:96px;height:96px}.ana .ana-row>.ana-kv{flex:1 1 180px;min-width:0}`;
    document.head.appendChild(st)}
  return {PLUG,quant}})();
if(typeof module!=="undefined")module.exports=MCU51ANA;
/* ===================== trình mô phỏng của khóa (platform/js/56-mcu51-bus.js) ===================== */
/* ===================== Trình mô phỏng 8051 · thêm: bus I2C / SPI bit-bang và thiết bị nối bus (Chương 11, AMTS-EMB-001-SIM26) =====================
   Đăng ký vào MCU51DEV.EXT (54-mcu51-dev.js), không sửa mô hình CPU. Cấu hình trong preset của ví dụ:
     dev:{i2c:{sda:"P1.0", scl:"P1.1", mode:"fast"|"std", devs:[{type:"24c02", addr:0x50}, {type:"pcf8574", addr:0x20}]}}
     dev:{spi:{sck:"P1.4", mosi:"P1.5", miso:"P1.6", cs:"P1.7", devs:[{type:"reg", mode:0} | {type:"hc595"}]}}
   Mô hình (giả định, đọc docs/TRINH-MO-PHONG-8051-BUS.md):
   - Đường I2C cực máng hở: mức đường = chốt chân của 8051 AND mức slave kéo xuống (điện trở kéo lên ngoài, giả định). Slave đổi SDA ở sườn
     xuống SCL, lấy mẫu ở sườn lên; SDA đổi khi SCL = 1 là START (1→0) / STOP (0→1). Không mô phỏng điện (thời gian sườn, dung kháng bus).
   - Thời gian đo theo chu kỳ máy (độ phân giải 1 chu kỳ máy = 12/fosc); so với giới hạn tối thiểu của Standard-mode hoặc Fast-mode
     (bảng đặc tính thời gian trong đặc tả I2C UM10204 của NXP) — chỉ CẢNH BÁO, slave ảo vẫn nhận bit.
   - "24c02": EEPROM 256 byte, trang 8 byte, ghi trong tWR = 5 ms (giá trị lớn nhất kiểu datasheet, giả định), trong lúc ghi không ACK
     (ACK polling), địa chỉ trong trang quay vòng khi ghi quá trang, đọc liên tiếp quay vòng hết bộ nhớ; chu kỳ ghi bắt đầu ở STOP.
   - "pcf8574": cổng mở rộng 8 bit (ghi byte = mức 8 chân; đọc trả lại mức chân); 8 LED nối nguồn, sáng khi chân = 0 (giả định).
   - SPI: "reg" = thiết bị thanh ghi AMTS (giả định, không phải chip thật): CS tích cực mức thấp, MSB trước, mode 0–3 chọn được;
     byte đầu = R/W (bit 7, 1 = đọc) + địa chỉ ô (bit 3..0), các byte sau là dữ liệu, địa chỉ tự tăng; khi nhận byte đầu, MISO xuất 00H;
     ô 0 = 5AH (mã nhận dạng, chỉ đọc). "hc595" = thanh ghi dịch kiểu 74HC595: dịch ở sườn lên SCK (SRCLK), chốt ra 8 chân ở sườn lên CS (RCLK).
   Mỗi thiết bị có snap()/restore() nhỏ (độ dài nhật ký + nhật ký hoàn tác bộ nhớ) để Lùi bước 20 000 lần không tốn bộ nhớ. */
const MCU51BUS=(function(){
  const DEV=typeof MCU51DEV!=="undefined"?MCU51DEV:require("./54-mcu51-dev.js");
  const pin=DEV.pin;
  /* giới hạn thời gian nhỏ nhất (µs) — UM10204 bảng đặc tính SDA/SCL; tSU;DAT: 250 ns (Standard), 100 ns (Fast) */
  const LIM={std:{name:"Standard-mode (≤ 100 kHz)",tLOW:4.7,tHIGH:4.0,tHDSTA:4.0,tSUSTA:4.7,tSUSTO:4.0,tBUF:4.7,tSUDAT:0.25},
             fast:{name:"Fast-mode (≤ 400 kHz)",tLOW:1.3,tHIGH:0.6,tHDSTA:0.6,tSUSTA:0.6,tSUSTO:0.6,tBUF:1.3,tSUDAT:0.1}};
  const H2=v=>(v&255).toString(16).toUpperCase().padStart(2,"0");
  const MAXLOG=6000;
  /* nhật ký chung: sóng (t, mức gói bit), chú thích (t0, t1, chữ, loại), cảnh báo thời gian */
  function journal(){return {wave:[],ann:[],viol:[],undo:[]}}
  function trim(J){if(J.wave.length>MAXLOG*2){J.wave.splice(0,J.wave.length-MAXLOG);J.cut=(J.cut||0)+1}if(J.ann.length>MAXLOG)J.ann.splice(0,J.ann.length-MAXLOG/2);if(J.viol.length>200)J.viol.splice(0,J.viol.length-100)}
  /* ===================== I2C ===================== */
  function eeprom(o,m,J){const size=o.size||256,page=o.page||8,twr=o.twr_us||5000;
    const d={type:"24c02",addr:o.addr==null?0x50:o.addr,size,page,twr,mem:new Uint8Array(size).fill(o.fill==null?0xFF:o.fill),
      st:{ptr:0,word:false,pend:[],busyTo:-1,writes:0,last:"",pw:{}},
      busy:()=>m.cyc<d.st.busyTo,
      onAddr(b){if((b>>1)!==d.addr)return false;if(d.busy()){d.st.last="bận ghi nội: không ACK";return false}
        d.st.rw=b&1;d.st.word=!d.st.rw;d.st.pend=[];return true},
      onWrite(b){const s=d.st;if(s.word){s.ptr=b&(size-1);s.word=false;return true}
        const i=s.pend.findIndex(x=>x[0]===s.ptr);if(i>=0)s.pend[i][1]=b;else s.pend.push([s.ptr,b]);
        s.ptr=(s.ptr&~(page-1))|((s.ptr+1)&(page-1));return true},
      onRead(){const s=d.st;const v=d.mem[s.ptr];s.ptr=(s.ptr+1)&(size-1);return v},
      onStart(){d.st.pend=[]},         /* START lặp lại trước STOP: bỏ dữ liệu đang chờ, không ghi */
      onStop(){const s=d.st;if(s.pend.length){for(const [a,v] of s.pend){J.undo.push([d,a,d.mem[a]]);d.mem[a]=v}
          const pg=s.pend[0][0]&~(page-1);s.pw[pg]=(s.pw[pg]||0)+1;s.writes++;
          s.busyTo=m.cyc+Math.ceil(twr*1e-6*m.fosc/12);s.last=`ghi ${s.pend.length} byte từ ${H2(s.pend[0][0])}H, bận ${twr/1000} ms`;s.pend=[]}}};
    if(o.data)for(const k in o.data)d.mem[+k&(size-1)]=o.data[k]&255;
    return d}
  function pcf(o,m,J){const d={type:"pcf8574",addr:o.addr==null?0x20:o.addr,st:{port:0xFF,writes:0},
      onAddr(b){return (b>>1)===d.addr},onWrite(b){d.st.port=b;d.st.writes++;return true},onRead(){return d.st.port},onStart(){},onStop(){}};return d}
  function i2c(m,c,D){const sda=pin(c.sda),scl=pin(c.scl);const J=journal();
    const slaves=(c.devs||[]).map(o=>o.type==="pcf8574"?pcf(o,m,J):eeprom(o,m,J));
    const us=t=>t*12/m.fosc*1e6;
    const B={kind:"i2c",c,J,slaves,lim:LIM[c.mode]||LIM.fast,z:0,w:340,id:"b"+Math.random().toString(36).slice(2,8),
      st:null,
      reset(){B.st={scl:1,sda:1,pull:0,ph:"idle",n:0,sh:0,addr:true,cur:-1,rw:0,out:0,tSclUp:-1e9,tSclDn:-1e9,tSdaCh:-1e9,tStart:-1e9,tStop:-1e9,
          b0:0,frames:0,ack:null,started:false};J.wave.length=0;J.ann.length=0;J.viol.length=0;
        for(let i=J.undo.length-1;i>=0;i--){const [d,a,v]=J.undo[i];d.mem[a]=v}J.undo.length=0;
        slaves.forEach(d=>{if(d.type==="24c02")d.st={ptr:0,word:false,pend:[],busyTo:-1,writes:0,last:"",pw:{}};else d.st={port:0xFF,writes:0}});
        J.wave.push(0,3)},
      lvl:s=>(m.latch(s.p)>>s.b)&1,
      drive(p){return (B.st.pull&&p===sda.p)?~(1<<sda.b)&255:255},
      viol(t,k,need,got){J.viol.push({t,k,need,got});if(m.warns&&J.viol.length<=3)m.warns.push({t:`I2C: ${k} = ${got.toLocaleString("vi-VN",{maximumFractionDigits:3})} µs, cần ≥ ${need} µs (${B.lim.name})`,pc:m.pc0,c:t})},
      ann(t0,t1,txt,k){J.ann.push(t0,t1,txt,k)},
      onPort(p){if(p!==sda.p&&p!==scl.p)return;B.update(m.cyc)},
      update(t){const s=B.st;const L=B.lim;
        const mSda=B.lvl(sda),mScl=B.lvl(scl);
        let nScl=mScl;let nSda=mSda&(s.pull?0:1);
        const dScl=nScl!==s.scl,dSda=nSda!==s.sda;if(!dScl&&!dSda)return;
        /* SDA đổi khi SCL vẫn ở 1: START hoặc STOP */
        if(dSda&&!dScl&&s.scl===1){s.sda=nSda;B.rec(t);
          if(nSda===0){/* START */if(s.started&&us(t-s.tSclUp)<L.tSUSTA&&s.tSclUp>s.tStop)B.viol(t,"tSU;STA",L.tSUSTA,us(t-s.tSclUp));
            if(!s.started&&s.tStop>0&&us(t-s.tStop)<L.tBUF)B.viol(t,"tBUF",L.tBUF,us(t-s.tStop));
            const rep=s.started;if(rep)slaves.forEach(d=>d.onStart());
            s.started=true;s.ph="in";s.n=0;s.sh=0;s.addr=true;s.cur=-1;s.pull=0;s.tStart=t;s.b0=t;B.ann(t,t,rep?"Sr":"S","s")}
          else{/* STOP */if(us(t-s.tSclUp)<L.tSUSTO)B.viol(t,"tSU;STO",L.tSUSTO,us(t-s.tSclUp));
            if(s.started)slaves.forEach(d=>d.onStop());s.started=false;s.ph="idle";s.pull=0;s.cur=-1;s.tStop=t;B.ann(t,t,"P","p")}
          return}
        if(dSda){s.sda=nSda;s.tSdaCh=t}
        if(dScl){s.scl=nScl;
          if(nScl===1){/* sườn lên: lấy mẫu */
            if(dSda&&us(0)<L.tSUDAT)B.viol(t,"tSU;DAT",L.tSUDAT,0);
            if(s.tSclDn>-1e8&&us(t-s.tSclDn)<L.tLOW)B.viol(t,"tLOW",L.tLOW,us(t-s.tSclDn));
            s.tSclUp=t;const bit=s.sda;
            if(s.ph==="in"){if(s.n===0)s.b0=t;s.sh=(s.sh<<1|bit)&255;s.n++;
              if(s.n===8){const b=s.sh;let ack=false;
                if(s.addr){s.cur=-1;for(let i=0;i<slaves.length;i++){if(slaves[i].onAddr(b)){s.cur=i;ack=true;break}}s.rw=b&1;
                  B.ann(s.b0,t,`${H2(b)} (${H2(b>>1)}H ${b&1?"đọc":"ghi"})`,"a")}
                else{ack=s.cur>=0&&slaves[s.cur].onWrite(b);B.ann(s.b0,t,H2(b),"d")}
                s.ph="ackout";s.ackv=ack;s.n=0}}
            else if(s.ph==="ack9"){/* slave vừa giữ (hoặc không) SDA trong xung thứ 9 */s.ack=!bit;B.ann(t,t,bit?"NACK":"ACK",bit?"n":"k");s.ph="ack9done"}
            else if(s.ph==="out"){if(s.n===0)s.b0=t;s.n++;if(s.n===8){B.ann(s.b0,t,H2(s.out),"r");s.ph="mack"}}
            else if(s.ph==="mack9"){const ok=!bit;B.ann(t,t,ok?"ACK":"NACK",ok?"k":"n");s.ph=ok?"mack9a":"mack9n"}
            else if(s.ph==="nack"){/* không ai ACK: bỏ qua tới START/STOP */}
          }else{/* sườn xuống: slave đổi SDA */
            if(s.tSclUp>-1e8&&us(t-s.tSclUp)<L.tHIGH)B.viol(t,"tHIGH",L.tHIGH,us(t-s.tSclUp));
            if(s.ph==="in"&&s.n===0&&s.addr&&t-s.tStart>=0&&s.tSclDn<s.tStart&&us(t-s.tStart)<L.tHDSTA)B.viol(t,"tHD;STA",L.tHDSTA,us(t-s.tStart));
            s.tSclDn=t;
            if(s.ph==="ackout"){s.pull=s.ackv?1:0;s.ph="ack9"}
            else if(s.ph==="ack9done"){s.pull=0;
              if(!s.ackv){s.ph="nack"}
              else if(s.addr&&s.rw){s.addr=false;s.ph="out";s.n=0;s.out=slaves[s.cur].onRead();s.bi=0;s.pull=(s.out>>7&1)?0:1;s.bi=1}
              else{s.addr=false;s.ph="in";s.n=0;s.sh=0}}
            else if(s.ph==="out"){if(s.bi<8){s.pull=(s.out>>(7-s.bi)&1)?0:1;s.bi++}}
            else if(s.ph==="mack"){s.pull=0;s.ph="mack9"}
            else if(s.ph==="mack9a"){s.out=slaves[s.cur].onRead();s.n=0;s.pull=(s.out>>7&1)?0:1;s.bi=1;s.ph="out"}
            else if(s.ph==="mack9n"){s.pull=0;s.ph="nack"}
            /* slave vừa đổi mức SDA: cập nhật đường */
            s.sda=mSda&(s.pull?0:1)}}
        B.rec(t);trim(J)},
      rec(t){const s=B.st;const v=s.scl<<1|s.sda;const W=J.wave;if(W.length&&W[W.length-1]===v)return;if(W.length&&W[W.length-2]===t)W[W.length-1]=v;else W.push(t,v)},
      /* chuỗi giải mã gọn: dùng cho kiểm chứng và hiển thị */
      decoded(){const A=J.ann,o=[];for(let i=0;i<A.length;i+=4){const k=A[i+3],x=A[i+2];o.push(k==="a"||k==="d"||k==="r"?x.split(" ")[0]:x)}return o.join(" ")},
      snap(){return JSON.stringify([B.st,J.wave.length,J.ann.length,J.viol.length,J.undo.length,slaves.map(d=>d.st)])},
      restore(x){if(x==null){B.reset();return}const a=JSON.parse(x);B.st=a[0];J.wave.length=Math.min(J.wave.length,a[1]);J.ann.length=Math.min(J.ann.length,a[2]);J.viol.length=Math.min(J.viol.length,a[3]);
        for(let i=J.undo.length-1;i>=a[4];i--){const [d,ad,v]=J.undo[i];d.mem[ad]=v}J.undo.length=Math.min(J.undo.length,a[4]);slaves.forEach((d,i)=>d.st=a[5][i])}};
    B.reset();return B}
  /* ===================== SPI ===================== */
  function spiReg(o,m){const d={type:"reg",mode:o.mode||0,regs:new Uint8Array(16),st:{a:0,rw:0,first:true,writes:0,last:""},
      init(){d.regs.fill(0);d.regs[0]=0x5A;if(o.regs)o.regs.forEach((v,i)=>{if(i)d.regs[i&15]=v&255})},
      begin(){d.st.first=true;return 0x00},
      byte(b){const s=d.st;if(s.first){s.first=false;s.rw=b>>7&1;s.a=b&15;s.last=`lệnh ${H2(b)}: ${s.rw?"đọc":"ghi"} từ ô ${s.a}`;return s.rw?d.regs[s.a]:0x00}
        if(!s.rw){if(s.a)d.regs[s.a]=b;s.writes++;s.a=(s.a+1)&15;return 0x00}
        s.a=(s.a+1)&15;return d.regs[s.a]},
      end(){}};d.init();return d}
  function hc595(o,m){const d={type:"hc595",mode:0,st:{sh:0,out:0,n:0,latches:0},init(){},begin(){return 0xFF},
      clk(bit){d.st.sh=(d.st.sh<<1|bit)&255;d.st.n++},byte(){return 0xFF},end(){d.st.out=d.st.sh;d.st.latches++}};return d}
  function spi(m,c,D){const P={sck:pin(c.sck),mosi:pin(c.mosi),miso:pin(c.miso),cs:pin(c.cs)};const J=journal();
    const dv=(c.devs&&c.devs[0])?c.devs[0]:{type:"reg",mode:0};const d=dv.type==="hc595"?hc595(dv,m):spiReg(dv,m);
    const cpol=d.mode>>1&1,cpha=d.mode&1;
    const B={kind:"spi",c,J,dev:d,z:0,w:340,id:"b"+Math.random().toString(36).slice(2,8),st:null,
      reset(){B.st={sck:1,mosi:1,miso:1,cs:1,drv:-1,k:8,cur:0,inb:0,n:0,b0:0,tx:[],rx:[]};J.wave.length=0;J.ann.length=0;J.viol.length=0;J.undo.length=0;
        if(d.type==="hc595")d.st={sh:0,out:0,n:0,latches:0};else{d.st={a:0,rw:0,first:true,writes:0,last:""};d.init()}B.st.sck=B.lvl(P.sck);B.st.mosi=B.lvl(P.mosi);B.rec(0)},
      lvl:s=>(m.latch(s.p)>>s.b)&1,
      drive(p){const s=B.st;return (p===P.miso.p&&s.drv===0)?~(1<<P.miso.b)&255:255},
      out(bit){B.st.drv=d.type==="hc595"?-1:bit},
      ann(t0,t1,txt,k){J.ann.push(t0,t1,txt,k)},
      onPort(p){if(![P.sck.p,P.mosi.p,P.miso.p,P.cs.p].includes(p))return;B.update(m.cyc)},
      update(t){const s=B.st;const cs=B.lvl(P.cs),sck=B.lvl(P.sck),mosi=B.lvl(P.mosi);
        if(cs!==s.cs){s.cs=cs;
          if(cs===0){s.n=0;s.inb=0;s.cur=d.begin();s.k=0;s.b0=t;B.ann(t,t,"CS↓","s");if(!cpha){B.out(s.cur>>7&1);s.k=1}else s.drv=-1}
          else{s.drv=-1;if(d.type==="hc595")d.end();else d.end();B.ann(t,t,"CS↑","p")}}
        if(sck!==s.sck){const lead=(sck!==cpol);s.sck=sck;s.mosi=mosi;
          if(s.cs===0){const sample=cpha?!lead:lead;
            if(sample){if(s.n===0){s.b0=t;s.inm=0}s.inb=(s.inb<<1|mosi)&255;s.inm=(s.inm<<1|((m.pins(P.miso.p)>>P.miso.b)&1))&255;s.n++;if(d.type==="hc595")d.clk(mosi);
              if(s.n===8){B.ann(s.b0,t,d.type==="hc595"?H2(s.inb):H2(s.inb)+"/"+H2(s.inm),"d");const r=d.byte(s.inb);s.tx.push(s.inb);s.n=0;s.nxt=r;s.inb=0;s.done8=true}}
            else{/* sườn dịch ra */if(s.k>=8&&s.done8){s.cur=s.nxt;s.k=0;s.done8=false}if(s.k<8){B.out(s.cur>>(7-s.k)&1);s.k++}}}
          else if(d.type==="hc595"&&sck===1){/* 74HC595 không có CS: vẫn dịch khi RCLK đứng yên */}}
        s.mosi=mosi;s.miso=s.drv===0?0:1;B.rec(t);trim(J)},
      rec(t){const s=B.st;const v=s.cs<<3|s.sck<<2|s.mosi<<1|(s.drv===0?0:1);const W=J.wave;if(W.length&&W[W.length-1]===v)return;if(W.length&&W[W.length-2]===t)W[W.length-1]=v;else W.push(t,v)},
      decoded(){const A=J.ann,o=[];for(let i=0;i<A.length;i+=4)o.push(A[i+2]);return o.join(" ")},
      /* giải mã lại sóng đã ghi theo cả 4 mode (để so sánh): byte MOSI lấy mẫu ở sườn của từng mode trong mỗi lần CS = 0 */
      modes(){const W=J.wave,res=[];for(let md=0;md<4;md++){const pol=md>>1,ph=md&1;let prev=null,bytes=[],n=0,b=0;
          for(let i=0;i<W.length;i+=2){const v=W[i+1],cs=v>>3&1,sck=v>>2&1,mo=v>>1&1;
            if(prev){if(prev.cs===1&&cs===0){n=0;b=0}
              if(cs===0&&prev.cs===0&&sck!==prev.sck){const lead=sck!==pol;if(ph?!lead:lead){b=(b<<1|mo)&255;n++;if(n===8){bytes.push(b);n=0;b=0}}}}
            prev={cs,sck,mo}}
          res.push(bytes)}return res},
      snap(){return JSON.stringify([B.st,J.wave.length,J.ann.length,d.st,d.type==="reg"?[...d.regs]:0])},
      restore(x){if(x==null){B.reset();return}const a=JSON.parse(x);B.st=a[0];J.wave.length=Math.min(J.wave.length,a[1]);J.ann.length=Math.min(J.ann.length,a[2]);d.st=a[3];if(a[4])d.regs.set(a[4])}};
    B.reset();return B}
  /* ===================== vẽ: máy phân tích logic + trạng thái thiết bị ===================== */
  const REG=new Map();
  function css(){if(typeof document==="undefined"||document.getElementById("mcu51-bus-css"))return;const s=document.createElement("style");s.id="mcu51-bus-css";s.textContent=`
.m51-bus{min-width:0}
.m51-bus .bus-wv{width:100%;overflow:hidden}
.m51-bus .bus-wv svg{display:block;max-width:100%;height:auto}
.m51-bus .bus-z{display:flex;flex-wrap:wrap;gap:4px;margin:4px 0}
.m51-bus .bus-z button{min-height:32px;padding:2px 8px;font-size:12px}
.m51-bus .bus-dec{font-family:var(--f-mono);font-size:12.5px;overflow-wrap:anywhere;margin:4px 0;line-height:1.5}
.m51-bus .bus-dec .k{color:var(--ok,#1a7f37)} .m51-bus .bus-dec .n{color:var(--err)}
.m51-bus .bus-v{font-size:12.5px;color:var(--err);margin:4px 0;overflow-wrap:anywhere}
.m51-bus .bus-ok{font-size:12.5px;color:var(--muted);margin:4px 0}
.m51-bus .bus-mem{display:grid;grid-template-columns:auto repeat(8,minmax(0,1fr));gap:2px;font-family:var(--f-mono);font-size:12px;max-width:420px;margin:4px 0}
.m51-bus .bus-mem span{text-align:center;border:1px solid var(--line);border-radius:4px;padding:1px 0;min-width:0}
.m51-bus .bus-mem span.ad{border:0;color:var(--muted);padding-right:4px}
.m51-bus .bus-mem span.pg{border-left:2px solid var(--warm)}
.m51-bus .bus-mem span.ptr{outline:2px solid var(--accent);outline-offset:-2px}
.m51-bus .bus-mem span.new{background:var(--warm-soft)}
.m51-bus .bus-st{font-size:12.5px;margin:2px 0;overflow-wrap:anywhere}
.m51-bus .bus-leds{display:flex;gap:6px;flex-wrap:wrap;margin:4px 0;font-size:11px;color:var(--muted)}
.m51-bus .bus-leds span{display:flex;flex-direction:column;align-items:center;gap:2px}
.m51-bus .bus-leds i{width:16px;height:16px;border-radius:50%;border:1px solid var(--line);background:var(--surface)}
.m51-bus .bus-leds i.on{background:#ff6a3d;border-color:#ff8a70;box-shadow:0 0 8px rgba(255,90,60,.8)}
.m51-bus table.bus-md{border-collapse:collapse;font-family:var(--f-mono);font-size:12px;margin:4px 0}
.m51-bus table.bus-md td,.m51-bus table.bus-md th{border:1px solid var(--line);padding:2px 6px;text-align:left}
.m51-bus table.bus-md tr.me td{background:var(--accent-soft)}`;document.head.appendChild(s)}
  if(typeof document!=="undefined")document.addEventListener("click",e=>{const b=e.target.closest&&e.target.closest("[data-busz]");if(!b)return;const box=b.closest("[data-busid]");const B=box&&REG.get(box.dataset.busid);if(!B)return;
    B.z=+b.dataset.busz;const html=(B.kind==="i2c"?EXT_I2C:EXT_SPI).html(B.c,B,B._m,B._h);const t=document.createElement("div");t.innerHTML=html;box.replaceWith(t.firstElementChild)});
  function waveSvg(B,m,rows,decode){const W=B.J.wave;const end=m?m.cyc:0;let last=W.length?W[W.length-2]:0;
    const first=W.length>2?W[2]:0;let span=B.z||Math.max(20,end-Math.max(0,first-4));let t1=end;if(B.z&&last<end-B.z*0.9)t1=Math.min(end,last+Math.round(B.z*0.1));const t0=Math.max(0,t1-span);span=Math.max(1,t1-t0);
    const w=Math.max(300,B.w||340),lw=44,rh=30,top=18,h=top+rows.length*rh+18;const x=t=>lw+(Math.max(t0,Math.min(t1,t))-t0)/span*(w-lw-6);
    let v0=W.length?W[1]:0;const pts=[];for(let i=0;i<W.length;i+=2){if(W[i]<=t0)v0=W[i+1];else if(W[i]<=t1)pts.push([W[i],W[i+1]])}
    let s=`<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="Dạng sóng ${rows.map(r=>r[0]).join(", ")}: ${B._h.E(B.decoded().slice(-160))}">`;
    rows.forEach(([n,f],k)=>{const y0=top+k*rh+20,hi=y0-14,lo=y0;let cur=f(v0);let d=`M${x(t0).toFixed(1)},${cur?hi:lo}`;for(const [c,v] of pts){const b=f(v);if(b!==cur){d+=` H${x(c).toFixed(1)} V${b?hi:lo}`;cur=b}}d+=` H${x(t1).toFixed(1)}`;
      s+=`<text x="2" y="${y0-2}" font-size="12" fill="currentColor">${n}</text><line x1="${lw}" x2="${w-6}" y1="${y0+3}" y2="${y0+3}" stroke="var(--line)" stroke-width=".6"/><path d="${d}" fill="none" stroke="var(--accent)" stroke-width="1.8"/>`});
    /* chú thích giải mã ở trên cùng */
    const A=B.J.ann;let lastX=-99;for(let i=0;i<A.length;i+=4){const a0=A[i],a1=A[i+1];if(a1<t0||a0>t1)continue;const k=A[i+3];const txt=String(A[i+2]).split(" ")[0];const xm=(x(a0)+x(a1))/2;
      if(k==="s"||k==="p"){s+=`<line x1="${x(a0).toFixed(1)}" x2="${x(a0).toFixed(1)}" y1="${top}" y2="${h-16}" stroke="var(--warm)" stroke-dasharray="3 3"/>`}
      if(xm-lastX<16&&k!=="s"&&k!=="p")continue;lastX=xm;
      s+=`<text x="${xm.toFixed(1)}" y="12" font-size="11" text-anchor="middle" fill="${k==="n"?"var(--err)":k==="k"?"var(--ok,#1a7f37)":"var(--warm)"}">${B._h.E(k==="k"?"A":k==="n"?"N":txt)}</text>`}
    const fT=c=>B._h.fmtT(c*12/(m?m.fosc:12e6));
    s+=`<text x="${lw}" y="${h-3}" font-size="11" fill="currentColor">${fT(t0)}</text><text x="${w-6}" y="${h-3}" font-size="11" text-anchor="end" fill="currentColor">${fT(t1)}</text></svg>`;
    return `<div class="bus-z" role="group" aria-label="Khung thời gian">${[0,3000,800,200].map(z=>`<button type="button" class="btn${z===(B.z||0)?" pri":""}" data-busz="${z}">${z?z.toLocaleString("vi-VN")+" CK":"Toàn bộ"}</button>`).join("")}</div><div class="bus-wv">${s}</div>`}
  function measure(B){if(typeof requestAnimationFrame==="undefined")return;requestAnimationFrame(()=>{const el=document.querySelector(`[data-busid="${B.id}"] .bus-wv`);if(el&&el.clientWidth){const w=Math.max(300,Math.floor(el.clientWidth));if(Math.abs(w-B.w)>8)B.w=w}})}
  function decHtml(B){const A=B.J.ann,E=B._h.E;let o=[];for(let i=Math.max(0,A.length-4*40);i<A.length;i+=4){const k=A[i+3],x=A[i+2];o.push(k==="k"?`<span class="k">${E(x)}</span>`:k==="n"?`<span class="n">${E(x)}</span>`:E(x))}
    return `<p class="bus-dec">${o.length?(A.length>4*40?"… ":"")+o.join(" · "):"(bus chưa có hoạt động)"}</p>`}
  function violHtml(B){const V=B.J.viol;if(B.kind!=="i2c")return "";if(!V.length)return `<p class="bus-ok">Thời gian: chưa thấy vi phạm giới hạn ${B.lim.name}.</p>`;
    const cnt={};V.forEach(v=>cnt[v.k]=(cnt[v.k]||0)+1);const v=V[V.length-1];
    return `<p class="bus-v">Vi phạm thời gian ${B.lim.name}: ${Object.entries(cnt).map(([k,n])=>`${k} × ${n}`).join(", ")}. Lần cuối: ${v.k} = ${v.got.toLocaleString("vi-VN",{maximumFractionDigits:3})} µs (cần ≥ ${v.need} µs).</p>`}
  const EXT_I2C={DEF:{sda:"P1.0",scl:"P1.1",mode:"fast",devs:[{type:"24c02",addr:0x50}]},
    attach(m,c,D){const B=i2c(m,c,D);return B},
    html(c,B,m,h){css();const E=h.E;const devs=(c.devs||[]);
      if(!B||!m){return `<div class="m51-box m51-bus" data-dev="i2c"><b>Bus I2C: SDA ${E(c.sda)}, SCL ${E(c.scl)}</b><p class="bus-ok">${devs.map(d=>d.type==="pcf8574"?`PCF8574 (địa chỉ ${H2(d.addr==null?0x20:d.addr)}H)`:`EEPROM 24C02 (địa chỉ ${H2(d.addr==null?0x50:d.addr)}H, 256 byte, trang 8 byte)`).join(" · ")}. Dạng sóng và nội dung thiết bị hiện khi chạy.</p></div>`}
      B._m=m;B._h=h;if(REG.size>40)REG.clear();REG.set(B.id,B);measure(B);
      let s=`<div class="m51-box m51-bus" data-dev="i2c" data-busid="${B.id}"><b>Bus I2C: SDA ${E(c.sda)}, SCL ${E(c.scl)} · máy phân tích logic</b>`;
      s+=waveSvg(B,m,[["SCL",v=>v>>1&1],["SDA",v=>v&1]])+decHtml(B)+violHtml(B);
      for(const d of B.slaves){if(d.type==="24c02"){const st=d.st,busy=d.busy();const base=Math.max(0,Math.min(d.size-32,(st.ptr&~7)-8));
          s+=`<p class="bus-st"><b>EEPROM 24C02</b> địa chỉ ${H2(d.addr)}H · con trỏ ${H2(st.ptr)}H · ${busy?`<b>đang ghi nội</b>, còn ${h.fmtT((st.busyTo-m.cyc)*12/m.fosc)} (không ACK)`:"rảnh"} · ${st.writes} lần ghi${st.pend.length?` · đang chờ STOP: ${st.pend.length} byte`:""}</p>`;
          s+=`<div class="bus-mem" role="table" aria-label="Bộ nhớ EEPROM ${H2(base)}H đến ${H2(base+31)}H">`;
          const neu=new Set(B.J.undo.filter(u=>u[0]===d).map(u=>u[1]));
          for(let r=base;r<base+32;r+=8){s+=`<span class="ad">${H2(r)}</span>`;for(let a=r;a<r+8;a++)s+=`<span class="${a===st.ptr?"ptr ":""}${neu.has(a)?"new ":""}${a%d.page===0?"pg":""}" title="${H2(a)}H">${H2(d.mem[a])}</span>`}
          s+=`</div>`}
        else{const v=d.st.port;s+=`<p class="bus-st"><b>PCF8574</b> địa chỉ ${H2(d.addr)}H · chân P7…P0 = ${H2(v)}H · LED nối nguồn, sáng khi chân = 0 (giả định)</p><div class="bus-leds">${[7,6,5,4,3,2,1,0].map(i=>`<span><i class="${(v>>i&1)?"":"on"}"></i>P${i}</span>`).join("")}</div>`}}
      return s+`</div>`}};
  const EXT_SPI={DEF:{sck:"P1.4",mosi:"P1.5",miso:"P1.6",cs:"P1.7",devs:[{type:"reg",mode:0}]},
    attach(m,c,D){return spi(m,c,D)},
    html(c,B,m,h){css();const E=h.E;const dv=(c.devs&&c.devs[0])||{type:"reg",mode:0};const name=dv.type==="hc595"?"thanh ghi dịch 74HC595 (dịch ở sườn lên SCK, chốt ở sườn lên CS)":`thiết bị thanh ghi AMTS (giả định), mode ${dv.mode||0}`;
      if(!B||!m)return `<div class="m51-box m51-bus" data-dev="spi"><b>Bus SPI: SCK ${E(c.sck)}, MOSI ${E(c.mosi)}, MISO ${E(c.miso)}, CS ${E(c.cs)}</b><p class="bus-ok">${name}. Dạng sóng hiện khi chạy.</p></div>`;
      B._m=m;B._h=h;if(REG.size>40)REG.clear();REG.set(B.id,B);measure(B);
      let s=`<div class="m51-box m51-bus" data-dev="spi" data-busid="${B.id}"><b>Bus SPI: ${name}</b>`;
      s+=waveSvg(B,m,[["CS",v=>v>>3&1],["SCK",v=>v>>2&1],["MOSI",v=>v>>1&1],["MISO",v=>v&1]])+decHtml(B);
      const md=B.modes();if(md.some(x=>x.length))s+=`<table class="bus-md"><thead><tr><th>Đọc MOSI theo mode</th><th>Các byte</th></tr></thead><tbody>${md.map((b,i)=>`<tr class="${i===(B.dev.mode||0)?"me":""}"><td>mode ${i} (CPOL ${i>>1}, CPHA ${i&1})${i===(B.dev.mode||0)?" ← thiết bị":""}</td><td>${b.map(H2).join(" ")||"—"}</td></tr>`).join("")}</tbody></table>`;
      const d=B.dev;if(d.type==="hc595"){const v=d.st.out;s+=`<p class="bus-st">Chân ra QH…QA = ${H2(v)}H (đã chốt ${d.st.latches} lần) · thanh ghi dịch ${H2(d.st.sh)}H · LED sáng khi chân = 1 (giả định)</p><div class="bus-leds">${[7,6,5,4,3,2,1,0].map(i=>`<span><i class="${(v>>i&1)?"on":""}"></i>Q${i}</span>`).join("")}</div>`}
      else s+=`<p class="bus-st">Ô 0…7: ${[...d.regs.slice(0,8)].map(H2).join(" ")} · ô 8…15: ${[...d.regs.slice(8,16)].map(H2).join(" ")}${d.st.last?" · "+E(d.st.last):""}</p>`;
      return s+`</div>`}};
  DEV.EXT.i2c=EXT_I2C;DEV.EXT.spi=EXT_SPI;
  return {LIM,EXT_I2C,EXT_SPI,VERSION:"0.1.0"}})();
if(typeof module!=="undefined")module.exports=MCU51BUS;
/* ===================== trình mô phỏng của khóa (platform/js/56-mcu51-gpio.js) ===================== */
/* ===================== Trình mô phỏng 8051 · phần thêm cho Chương 6 (GPIO và driver số) =====================
   File MỚI, không sửa 54-mcu51-dev.js: bọc MCU51DEV.attach để thêm ba tùy chọn trong "dev" của một ví dụ
   (docs/TRINH-MO-PHONG-8051.md mục "Phần thêm GPIO"). Không dùng DOM, chạy được trong Node.
     btn:{bounce:[t1,t2,…]}  nút có dội tiếp điểm: sau MỖI lần bấm hoặc nhả, mức chân đổi ngay rồi lật thêm ở các thời điểm
                             t1, t2, … micro giây (số phần tử chẵn nên cuối cùng chân ở mức mới). Dạng dội là GIẢ ĐỊNH để học,
                             không phải số đo của một loại nút cụ thể.
     p0float:true            P0 KHÔNG có điện trở kéo lên ngoài: bit chốt = 1 thì transistor kéo xuống tắt, chân thả nổi.
                             Mức đọc thật không xác định; trình mô phỏng đọc 0 (giả định, để thấy lỗi) và báo cảnh báo một lần.
     pull:{P1:"FE"}          tải ngoài ghìm chân xuống 0 cố định (bit 0 trong mẫu), ví dụ cực B của transistor nối thẳng vào chân
                             không qua điện trở, hoặc LED nối từ chân xuống GND: chốt = 1 nhưng chân đọc 0.
   Thời gian dội tính theo chu kỳ máy: chu kỳ = làm tròn(t_µs × f_osc / 12 000 000). */
(function(){
  const DEV=typeof MCU51DEV!=="undefined"?MCU51DEV:require("./54-mcu51-dev.js");
  if(DEV.gpio)return;
  const base=DEV.attach;
  function attach(m,cfg){cfg=cfg||{};const D=base(m,cfg);
    /* ---------- nút có dội ---------- */
    const bc=cfg.btn&&cfg.btn!==true&&cfg.btn.bounce;
    if(D.btn&&bc&&bc.length){const B=D.btn;const cyc=us=>Math.round(us*m.fosc/12e6);
      B.ev=B.c.pins.map(()=>null);         // lần đổi gần nhất của từng nút: {t: chu kỳ, on}
      B.bounceCyc=()=>bc.map(cyc);
      const set0=B.set.bind(B);
      B.set=function(i,on){const was=B.down.has(i);set0(i,on);if(was!==!!on)B.ev[i]={t:m.cyc,on:!!on}};
      /* mức tiếp điểm hiệu dụng của nút i lúc này: true = chạm (chân bị kéo xuống 0) */
      B.contact=function(i){const e=B.ev[i];const on=B.down.has(i);if(!e)return on;const dt=m.cyc-e.t;let k=0;for(const t of B.bounceCyc())if(dt>=t)k++;return k%2?!e.on:e.on};
      B.drive=function(p){let mask=255;B.pins.forEach((s,i)=>{if(s.p===p&&B.contact(i))mask&=~(1<<s.b)});return mask};
      B.restore=function(){B.ev=B.ev.map(()=>null)}}
    /* ---------- tải ghìm chân cố định ---------- */
    const pl={};if(cfg.pull)for(const k in cfg.pull){const p=/^P([0-3])$/i.exec(k);if(p)pl[+p[1]]=parseInt(cfg.pull[k],16)&255}
    /* ---------- P0 không kéo lên ---------- */
    const fl=!!cfg.p0float;
    if(fl||Object.keys(pl).length){const f0=m.extFn;
      m.extFn=function(p,lt){let v=f0?f0(p,lt):m.ext[p];if(pl[p]!=null)v&=pl[p];
        if(fl&&p===0){const hi=m.latch(0)&v;  /* bit chốt = 1 mà không thiết bị nào kéo xuống: thả nổi */
          if(hi){v&=~hi;const t="P0 không có điện trở kéo lên ngoài: chân có chốt = 1 đang thả nổi (transistor kéo xuống tắt, không có gì kéo lên). Mức đọc thật không xác định; trình mô phỏng đọc 0 (giả định). Thêm điện trở kéo lên cho P0 khi dùng làm cổng vào/ra.";
            if(!m.warns.some(w=>w.t===t))m.warns.push({t,pc:m.pc0||0,c:m.cyc})}}
        return v};
      D.p0float=fl;D.pull=pl}
    return D}
  DEV.attach=attach;DEV.gpio={version:"1.0.0"};
  if(typeof module!=="undefined")module.exports=DEV})();
lazyWidgets();
/* đoạn code minh họa: lấy từ thư mục snippets của từng bài; thêm đầu khung (tên file + Sao chép) */
const SNIP={},PRESET_NOTES={},EX_HINTS={};
function copyText(t){if(navigator.clipboard&&navigator.clipboard.writeText)return navigator.clipboard.writeText(t);
  return new Promise((ok,no)=>{const a=document.createElement("textarea");a.value=t;a.setAttribute("readonly","");a.style.position="fixed";a.style.opacity="0";document.body.appendChild(a);a.select();
    try{document.execCommand("copy")?ok():no()}catch(e){no(e)}a.remove()})}
function fillSnips(root){(root||document).querySelectorAll("[data-snip]").forEach(el=>{const src=SNIP[el.dataset.snip];if(!src||el.dataset.filled)return;el.dataset.filled="1";
  el.innerHTML=highlightLines(src).map((s,i)=>`<span class="ln" data-n="${i+1}">${s||" "}</span>`).join("");
  const box=document.createElement("div");box.className="codebox";const h=document.createElement("div");h.className="code-h";
  const name=/\bint\s+main\s*\(/.test(src)?"main.cpp":"C++";
  h.innerHTML=`<span class="code-f">${name}</span><button type="button" class="code-copy">Sao chép</button><span class="vh" role="status" aria-live="polite"></span>`;
  const b=h.querySelector("button"),st=h.querySelector("[role=status]");let t=0;
  b.onclick=()=>copyText(src).then(()=>{b.textContent="Đã sao chép";st.textContent="Đã sao chép đoạn code";clearTimeout(t);t=setTimeout(()=>{b.textContent="Sao chép";st.textContent=""},1800)},()=>{b.textContent="Chưa sao chép được";clearTimeout(t);t=setTimeout(()=>b.textContent="Sao chép",2200)});
  if(el.hasAttribute("data-m")){box.setAttribute("data-m",el.getAttribute("data-m"));el.removeAttribute("data-m")}
  el.replaceWith(box);box.append(h,el)})}
fillSnips();
/* ================= TRANG THỰC HÀNH (#thuc-hanh) =================
   Gom mọi bài tập chấm tự động (EXERCISES, do makeEx2 của từng bài đăng ký) vào một trang:
   danh sách + lọc, đề bài, gợi ý (hints.json của bài), trình mô phỏng dùng chung, Chạy thử / Nộp bài,
   lời giải (solutions/*.cpp, nằm trong nội dung bảo vệ trên Firebase) và trình tự chạy từng bước.
   Lời giải mở khi: đã làm đạt, hoặc đã nộp ít nhất UNLOCK_AFTER lần chưa đạt (giảng viên luôn xem được). */
const PRACTICE=(()=>{
  const C=CMETA,UNLOCK_AFTER=3;
  let items=null,cur=null,sim=null,F="all",built=false;const solCache={},tries={},results={};
  const $=id=>document.getElementById(id);
  const lname=l=>(C.lessons.find(x=>x[0]===l)||[])[1]||"";
  const stOf=id=>window.TRACK&&TRACK.exOf?TRACK.exOf(id):null;
  const triesOf=id=>Math.max((stOf(id)||{}).n||0,tries[id]||0);
  const fold=s=>String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/đ/g,"d");
  function load(){if(items)return items;
    items=(C.practice||[]).map(id=>{const m=/^(l\d+)-(\d+)$/.exec(id);if(!m)return null;const e=(EXERCISES[m[1]]||[])[+m[2]];return e?{id,l:m[1],i:+m[2],e}:null}).filter(Boolean);return items}
  const icon=id=>{const x=stOf(id);return x?(x.pass?["ok","✓","đã đạt"]:["bad","✗","chưa đạt"]):["","","chưa nộp"]};
  function renderSum(){const n=items.filter(x=>(stOf(x.id)||{}).pass).length;
    $("pr-sum").innerHTML=`<span class="pbar" role="progressbar" aria-label="Bài tập đã đạt" aria-valuemin="0" aria-valuemax="${items.length}" aria-valuenow="${n}"><span style="width:${items.length?n/items.length*100:0}%"></span></span><span>Đã đạt <b>${n}/${items.length}</b> bài tập</span>`}
  function renderList(){
    const q=fold(($("pr-q").value||"").trim());let h="",shown=0,lastL=null;
    items.forEach(x=>{const s=stOf(x.id),pass=!!(s&&s.pass);
      if(F==="todo"&&pass||F==="done"&&!pass)return;
      if(q&&!fold(x.e.t+" "+x.e.d+" bai "+x.l.slice(1)+" "+lname(x.l)).includes(q))return;
      if(x.l!==lastL){if(lastL)h+=`</ul></div>`;h+=`<div class="pr-g"><b>${esc(lessonLabel(x.l))} · ${esc(lname(x.l))}</b><ul>`;lastL=x.l}
      const [c,ic,t]=icon(x.id);shown++;
      h+=`<li><button type="button" data-id="${x.id}"${cur&&cur.id===x.id?' aria-current="true"':""}><span class="ex-i ${c}" aria-hidden="true">${ic}</span><span>${x.i+1}. ${esc(x.e.t)}</span><span class="vh"> (${t})</span></button></li>`});
    if(lastL)h+=`</ul></div>`;
    $("pr-list").innerHTML=shown?h:`<p class="pr-empty">Không có bài tập khớp bộ lọc.</p>`;
    $("pr-list").querySelectorAll("[data-id]").forEach(b=>b.onclick=()=>{select(b.dataset.id);if(matchMedia("(max-width:1299px)").matches)$("pr-main").scrollIntoView({behavior:REDUCE()?"auto":"smooth",block:"start"})});
    const sel=$("pr-sel");if(sel){sel.innerHTML=items.map(x=>{const ic=icon(x.id)[1]||"○";return `<option value="${x.id}"${cur&&cur.id===x.id?" selected":""}>${ic} ${esc(lessonLabel(x.l))} · ${x.i+1}. ${esc(x.e.t)}</option>`}).join("")}
    renderSum()}
  let prLang=LANG_CUR; // ngôn ngữ của code đang mở (để lưu nháp đúng chỗ khi học viên đổi ngôn ngữ)
  const draftKey=(id,l)=>{l=l||prLang;return "amts-pr:"+((AMTS.S.user&&AMTS.S.user.uid)||"khach")+":"+id+(l!=="cpp"?":"+l:"")};
  document.addEventListener("amts-lang",()=>{if(!built||!cur)return;const keep=cur.id;saveDraft();prLang=LANG_CUR;for(const k in results)delete results[k];cur=null;select(keep)});
  const ST=e=>exF(e,"start",exLang(e)); // code mẫu theo ngôn ngữ đang chọn
  function saveDraft(){if(!cur||!sim)return;try{const v=sim.get(),cl=LANG_CUR;LANG_CUR=prLang;const st0=ST(cur.e);LANG_CUR=cl;if(v&&v!==st0)localStorage.setItem(draftKey(cur.id),v);else localStorage.removeItem(draftKey(cur.id))}catch(e){}}
  function build(){if(built)return;built=true;load();
    $("pr-main").innerHTML=`<div class="pr-pick"><label for="pr-sel">Chọn bài tập</label><select id="pr-sel"></select></div>
      <div class="pr-info" id="pr-info"></div>
      <div id="pr-sim"></div>
      <div class="pr-btns"><button type="button" class="btn" id="pr-reset">Nạp code mẫu</button><button type="button" class="btn" id="pr-try">Chạy thử</button><button type="button" class="btn pri" id="pr-grade">Nộp bài</button></div>
      <div class="ex-st" id="pr-res" role="status" aria-live="polite"></div>
      <div class="pr-sol" id="pr-sol"></div>
      <div class="pr-nav"><button type="button" class="btn" id="pr-prev">← Bài tập trước</button><button type="button" class="btn" id="pr-next">Bài tập sau →</button></div>`;
    sim=makeSim2($("pr-sim"),{id:"spr",lesson:"",presets:[{label:"Bài tập",code:""}],keepOnLang:true});
    $("pr-sel").onchange=e=>select(e.target.value);
    $("pr-reset").onclick=()=>{if(sim.get()!==ST(cur.e)&&!confirm("Thay code hiện tại bằng code mẫu ban đầu?"))return;sim.set(ST(cur.e));sim.setInput(cur.e.tests[0].in);saveDraft()};
    $("pr-try").onclick=()=>{$("pr-res").innerHTML=tryExHTML(cur.e,sim.get(),sim.lang);sim.setInput(cur.e.tests[0].in);sim.run()};
    $("pr-grade").onclick=grade;
    $("pr-prev").onclick=()=>step(-1);$("pr-next").onclick=()=>step(1);
    $("pr-q").addEventListener("input",renderList);
    document.querySelectorAll(".pr-f [data-f]").forEach(b=>b.onclick=()=>{F=b.dataset.f;document.querySelectorAll(".pr-f [data-f]").forEach(x=>x.setAttribute("aria-pressed",x===b));renderList()});
    document.addEventListener("amts-progress",()=>{renderList();if(cur)renderSol()});
    addEventListener("pagehide",saveDraft);
    $("pr-sim").addEventListener("input",()=>{clearTimeout(build.t);build.t=setTimeout(saveDraft,600)})}
  function step(d){const k=items.findIndex(x=>x.id===cur.id);const n=items[(k+d+items.length)%items.length];select(n.id);$("pr-info").scrollIntoView({behavior:REDUCE()?"auto":"smooth",block:"start"})}
  function select(id){saveDraft();const x=items.find(y=>y.id===id)||items[0];if(!x)return;cur=x;const e=x.e,hints=exF(e,"hints")||((typeof EX_HINTS!=="undefined"?EX_HINTS:{})[x.l]||[])[x.i]||[];
    $("pr-info").innerHTML=`<div class="crumb">${esc(lessonLabel(x.l))} · ${esc(lname(x.l))} · Bài tập ${x.i+1}/${(EXERCISES[x.l]||[]).length}</div>
      <div class="pr-title"><h2>${esc(e.t)}</h2><a href="#bai-${x.l.slice(1)}" data-go="${x.l}" class="pr-lesson">Xem lại bài học →</a></div>
      <p class="pr-d">${esc(exF(e,"d"))}</p>${e.perf?`<p class="ex-perf">Yêu cầu độ hiệu quả: <b>${PERF_TXT[e.perf.need]||""}</b> (bài được chạy thêm với dữ liệu lớn để đếm số bước).</p>`:""}
      <div class="io"><div><div class="pane-h" style="padding:0 0 4px">Ví dụ nhập</div><pre>${esc(e.tests[0].in||"(không có)")}</pre></div><div><div class="pane-h" style="padding:0 0 4px">Kết quả đúng</div><pre>${esc(e.tests[0].out)}</pre></div></div>
      ${hints.length?`<div class="pr-hints"><ol id="pr-hl"></ol><button type="button" class="btn sm" id="pr-hint">Xem gợi ý 1/${hints.length}</button></div>`:""}`;
    if(hints.length){let k=0;const b=$("pr-hint"),ol=$("pr-hl");b.onclick=()=>{ol.insertAdjacentHTML("beforeend",`<li><b>Gợi ý ${k+1}.</b> ${esc(hints[k])}</li>`);k++;if(k>=hints.length)b.remove();else b.textContent=`Xem gợi ý ${k+1}/${hints.length}`}}
    sim.forceLang(exLang(e));let code=ST(e);try{code=localStorage.getItem(draftKey(x.id))||ST(e)}catch(err){}
    sim.set(code);sim.setInput(e.tests[0].in);
    $("pr-res").innerHTML=results[x.id]||`<p class="ex-todo">${(stOf(x.id)||{}).pass?"Bạn đã làm đạt bài này. Có thể nộp lại để luyện thêm.":`Chưa nộp · ${e.tests.length} test sẽ được chấm.`}</p>`;
    renderSol();renderList();
    const h="#thuc-hanh-"+x.id;if(location.hash!==h){try{history.replaceState(null,"",h)}catch(err){}}}
  function grade(){const x=cur,g=gradeEx(x.e,sim.get(),sim.lang);tries[x.id]=triesOf(x.id)+1;
    if(window.TRACK)TRACK.ex(x.id,g.ok,g.d);
    results[x.id]=exResultHTML(x.e,g.R,g.ok,g.pass,g.srcOk)+(x.e.perf?(g.F?perfHTML(x.e.perf,g.F):`<div class="perf"><span class="pf-k">Độ hiệu quả sẽ được đo khi code đúng hết các test.</span></div>`):"");$("pr-res").innerHTML=results[x.id];saveDraft();renderSol();renderList()}
  function unlocked(x){return AMTS.isTeacher()||!!(stOf(x.id)||{}).pass||triesOf(x.id)>=UNLOCK_AFTER}
  function renderSol(){const x=cur,box=$("pr-sol");if(!x)return;
    if(!unlocked(x)){const left=UNLOCK_AFTER-triesOf(x.id);
      box.innerHTML=`<div class="pr-lock"><b>Lời giải</b><p>Lời giải mở khi bạn làm đạt bài này, hoặc sau ${UNLOCK_AFTER} lần nộp chưa đạt (còn ${left} lần). Hãy thử gợi ý trước nhé.</p></div>`;return}
    if(box.dataset.for===x.id&&box.querySelector(".codebox"))return;
    box.dataset.for="";box.innerHTML=`<div class="pr-lock open"><b>Lời giải</b><p>Đã mở. Xem để so sánh với cách làm của bạn, rồi chạy từng bước để hiểu chương trình chạy thế nào.</p><button type="button" class="btn" id="pr-showsol">Xem lời giải</button></div>`;
    $("pr-showsol").onclick=()=>showSol(x)}
  async function getSol(l){const pick=o=>o?(LANG_CUR==="cpp"?o.cpp||o.sol:(o.sols||o)[LANG_CUR])||null:null;if(SOL_EMBED)return pick(SOL_EMBED[l]);if(solCache[l])return pick(solCache[l]);{const c=typeof LC!=="undefined"&&LC.get(l);if(c)return pick(solCache[l]={cpp:c.sol,sols:c.sols||{}})}
    const S=await AMTS.ready();if(S.mode!=="ready"){const e=new Error("Chưa kết nối được máy chủ.");e.code="offline";throw e}
    const cfg=await AMTS.getConfig(CID);const d=await AMTS.getLesson(CID,l,C.contentVer,cfg);return pick(solCache[l]=d?{cpp:d.sol,sols:d.sols||{}}:null)}
  async function showSol(x){const box=$("pr-sol");box.innerHTML=`<p class="ex-todo">Đang tải lời giải…</p>`;
    let arr;try{arr=await getSol(x.l)}catch(e){
      box.innerHTML=`<div class="pr-lock"><b>Chưa tải được lời giải</b><p>${e.code==="permission-denied"?"Lời giải thuộc bài cần đăng nhập hoặc bài có phí. Hãy đăng nhập (hoặc kích hoạt khóa học) rồi thử lại.":e.code==="offline"?"Không kết nối được máy chủ. Kiểm tra Internet rồi thử lại.":esc(e.message||String(e))}</p><button type="button" class="btn" id="pr-showsol">Thử lại</button></div>`;
      $("pr-showsol").onclick=()=>showSol(x);return}
    if(cur!==x)return;const src=arr&&arr[x.i];
    if(!src){box.innerHTML=`<div class="pr-lock"><b>Lời giải</b><p>Bài này chưa có lời giải trên máy chủ.${AMTS.isTeacher()?" Giảng viên: hãy tải file noi-dung-${CID}.json mới lên.":""}</p></div>`;return}
    box.dataset.for=x.id;
    box.innerHTML=`<div class="pr-solh"><b>Lời giải tham khảo</b><span>Có nhiều cách đúng; đây là một cách.</span></div>
      <div class="code" data-src></div>
      <div class="pr-trace"><button type="button" class="btn pri" id="pr-run-sol">Xem trình tự chạy từng bước</button><p>Lời giải được nạp vào trình mô phỏng với dữ liệu ví dụ. Bấm <b>Bước tiếp →</b> để đi qua từng dòng và xem biến thay đổi trong khung Bộ nhớ. Code của bạn đã được lưu, chọn lại bài này là thấy.</p></div>`;
    const c=box.querySelector("[data-src]");c.innerHTML=highlightLines(src,LANG_CUR).map((s,i)=>`<span class="ln" data-n="${i+1}">${s||" "}</span>`).join("");
    c.removeAttribute("data-src");const wrap=document.createElement("div");wrap.className="codebox";const h=document.createElement("div");h.className="code-h";
    h.innerHTML=`<span class="code-f">loi-giai.${langOf(LANG_CUR).file.split(".").pop()}</span><button type="button" class="code-copy">Sao chép</button>`;c.replaceWith(wrap);wrap.append(h,c);
    h.querySelector("button").onclick=e=>copyText(src).then(()=>{e.target.textContent="Đã sao chép";setTimeout(()=>e.target.textContent="Sao chép",1800)},()=>{e.target.textContent="Chưa sao chép được"});
    $("pr-run-sol").onclick=()=>{saveDraft();sim.set(src);sim.setInput(x.e.tests[0].in);$("pr-sim").scrollIntoView({behavior:REDUCE()?"auto":"smooth",block:"start"});sim.step()}}
  function open(){build();load();if(!items.length){$("pr-main").innerHTML=(C.exercises||[]).length?`<p class="pr-empty">Bài tập của khóa này không viết code: làm ngay trong từng bài, ở mục <b>Bài tập chấm tự động</b>.</p>`:`<p class="pr-empty">Chưa có bài tập.</p>`;return}
    const want=window.PRACTICE_WANT;window.PRACTICE_WANT=null;
    const first=(want&&items.find(x=>x.id===want))||(cur)||items.find(x=>!(stOf(x.id)||{}).pass)||items[0];select(first.id)}
  return{open,select,get cur(){return cur}};
})();
if(typeof curView!=="undefined"&&curView==="practice")allLessonCode().then(()=>{if(curView==="practice")PRACTICE.open()});

const LESSON_UPDATED={"l1": "2026-11-06T20:28:11Z", "l10": "2026-11-06T20:28:11Z", "l11": "2026-11-06T20:28:11Z", "l12": "2026-11-06T20:28:11Z", "l13": "2026-11-06T20:28:11Z", "l14": "2026-11-06T20:28:11Z", "l15": "2026-11-06T20:28:11Z", "l16": "2026-11-06T20:28:11Z", "l17": "2026-11-06T20:28:11Z", "l18": "2026-11-06T20:28:11Z", "l19": "2026-11-06T20:28:11Z", "l2": "2026-11-06T20:28:11Z", "l20": "2026-11-06T20:28:11Z", "l21": "2026-11-06T20:28:11Z", "l22": "2026-11-06T20:39:49Z", "l23": "2026-11-06T20:39:49Z", "l24": "2026-11-06T20:28:11Z", "l25": "2026-11-06T20:28:11Z", "l26": "2026-11-06T20:28:11Z", "l27": "2026-11-06T20:28:11Z", "l28": "2026-11-06T20:28:11Z", "l29": "2026-11-06T20:28:11Z", "l3": "2026-11-06T20:28:11Z", "l30": "2026-11-06T20:28:11Z", "l31": "2026-11-06T20:28:11Z", "l32": "2026-11-06T20:28:11Z", "l33": "2026-11-06T20:28:11Z", "l34": "2026-11-06T20:28:11Z", "l35": "2026-11-06T20:28:11Z", "l36": "2026-11-06T20:28:11Z", "l37": "2026-11-06T20:28:11Z", "l38": "2026-11-06T20:28:11Z", "l39": "2026-11-06T20:28:11Z", "l4": "2026-11-06T20:28:11Z", "l40": "2026-11-06T20:28:11Z", "l41": "2026-11-06T20:28:11Z", "l42": "2026-11-06T20:28:11Z", "l43": "2026-11-06T20:28:11Z", "l44": "2026-11-06T20:28:11Z", "l45": "2026-11-06T20:28:11Z", "l46": "2026-11-06T20:28:11Z", "l47": "2026-11-06T20:28:11Z", "l48": "2026-11-06T20:28:11Z", "l49": "2026-11-06T20:28:11Z", "l5": "2026-11-06T20:28:11Z", "l50": "2026-11-06T20:28:11Z", "l51": "2026-11-06T20:28:11Z", "l52": "2026-11-06T20:28:11Z", "l53": "2026-11-06T20:28:11Z", "l54": "2026-11-06T20:28:11Z", "l55": "2026-11-06T20:28:11Z", "l56": "2026-11-06T20:28:11Z", "l57": "2026-11-06T20:28:11Z", "l58": "2026-11-06T20:28:11Z", "l59": "2026-11-06T20:28:11Z", "l6": "2026-11-06T20:28:11Z", "l60": "2026-11-06T20:28:11Z", "l7": "2026-11-06T20:28:11Z", "l8": "2026-11-06T20:28:11Z", "l9": "2026-11-06T20:28:11Z"};
(function(){for(const l in LESSON_UPDATED){const nx=document.querySelector(`#view-${l} div.next`);if(!nx)continue;
  const iso=LESSON_UPDATED[l],d=new Date(iso),p=document.createElement("p");p.className="updated";
  p.innerHTML=`Cập nhật lần cuối: <time datetime="${iso}">${d.toLocaleTimeString("vi-VN",{hour:"2-digit",minute:"2-digit"})}, ${d.toLocaleDateString("vi-VN",{day:"2-digit",month:"2-digit",year:"numeric"})}</time>`;nx.after(p)}})();
if(LESSON_EMBED)for(const l in LESSON_EMBED)mountLesson(l,LESSON_EMBED[l]);
/* ================= TIẾN ĐỘ CỦA KHÓA ĐANG MỞ (CID, CMETA khai báo ở 10-app.js; dùng lõi AMTS) ================= */
const LESSONS=CMETA.lessons.map(x=>x[0]);
const LESSON_NAMES=Object.fromEntries(CMETA.lessons);
let P=AMTS.getLocal(CID);
let saveTimer=null,lastUid=null;
let retryTimer=null;
/* trạng thái lưu: Đã lưu trên máy / Đang đồng bộ / Đã đồng bộ lúc … / Đang chờ kết nối */
const SYNC={st:"idle",at:0};
function setSync(st){SYNC.st=st;if(st==="ok")SYNC.at=Date.now();paintSync()}
function syncText(){const S=AMTS.S;
  if(!S.user)return S.mode==="ready"?["local","Đã lưu trên máy này · đăng nhập để đồng bộ"]:null;
  if(SYNC.st==="pending"||SYNC.st==="saving")return["busy","Đang đồng bộ…"];
  if(SYNC.st==="wait")return["wait",navigator.onLine===false?"Mất kết nối · đã lưu trên máy, sẽ đồng bộ khi có mạng":"Chưa đồng bộ được · đã lưu trên máy, đang thử lại"];
  if(SYNC.at)return["ok","Đã đồng bộ lúc "+new Date(SYNC.at).toLocaleTimeString("vi-VN",{hour:"2-digit",minute:"2-digit"})];
  return["ok","Đã đồng bộ"]}
function paintSync(){const el=document.getElementById("sync-st");if(!el)return;const t=syncText();el.hidden=!t;if(t){el.className="sync "+t[0];el.textContent=t[1]}}
async function pushNow(){clearTimeout(saveTimer);saveTimer=null;if(!AMTS.S.user)return;
  setSync("saving");
  const m=await AMTS.saveCourse(CID,P);
  if(m){P=AMTS.merge(P,m);AMTS.setLocal(CID,P);setSync("ok");renderProgress();if(P.lang&&typeof LANG_FROM_SYNC==="function")LANG_FROM_SYNC(P.lang.l,P.lang.at)}
  else if(AMTS.S.user){setSync("wait");clearTimeout(retryTimer);retryTimer=setTimeout(pushNow,20000)}}
function persist(){AMTS.setLocal(CID,P);clearTimeout(saveTimer);saveTimer=setTimeout(pushNow,1200);if(AMTS.S.user)setSync("pending");else paintSync()}
addEventListener("online",()=>{if(SYNC.st==="wait")pushNow()});
addEventListener("offline",()=>{if(SYNC.st==="wait")paintSync()});
// rời trang hoặc chuyển ứng dụng: lưu ngay, không chờ
addEventListener("pagehide",()=>{if(saveTimer)pushNow()});
document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="hidden"&&saveTimer)pushNow()});
const track=window.TRACK={
  visit(l){if(!LESSONS.includes(l))return;P.visited[l]=Date.now();P.lastLesson=l;persist()},
  done(l,v){P.lessons[l]=v?Date.now():-Date.now();persist();renderProgress()},
  ex(id,pass,detail){const cur=P.ex[id],n=Math.min(999,((cur&&cur.n)||0)+1);
    if(pass)P.ex[id]={pass:true,at:Date.now(),d:String(detail||""),n};
    else if(!cur||!cur.pass)P.ex[id]={pass:false,at:Date.now(),d:String(detail||""),n};
    else cur.n=n;
    persist();renderProgress()},
  exOf(id){return P.ex[id]||null},
  setLang(l,at){P.lang={l,at:at||Date.now()};persist()},
  quizOf(id){return P.quiz[id]||null},
  quiz(id,score,total){const cur=P.quiz[id]||{};P.quiz[id]={score,total,best:Math.max(score,cur.best||0),at:Date.now()};persist();renderProgress()}
};
const doneCount=()=>LESSONS.filter(l=>AMTS.isDone(P,l,CID)).length;
function lastLessonShown(){return VIEWS.find(x=>!document.getElementById("view-"+x).hidden)}
/* sidebar: tiến độ + trạng thái lưu (tài khoản nằm ở thanh điều hướng chung) */
function renderAccount(){
  const el=document.getElementById("acct");if(!el)return;const S=AMTS.S;
  const n=doneCount(),bar=`<div class="pbar" role="progressbar" aria-label="Tiến độ khóa ${escH(CMETA.name)}" aria-valuemin="0" aria-valuemax="${LESSONS.length}" aria-valuenow="${n}"><span style="width:${n/LESSONS.length*100}%"></span></div><div class="pnum">Đã hoàn thành ${n}/${LESSONS.length} bài đang mở</div>`;
  const cont=P.lastLesson&&P.lastLesson!==lastLessonShown()?`<button class="linkbtn" data-go="${P.lastLesson}">Tiếp tục: ${escH(lessonLabel(P.lastLesson))} · ${escH(LESSON_NAMES[P.lastLesson]||"")} →</button>`:"";
  let note="";
  if(S.mode==="unavailable")note=`<p class="acct-note">Tiến độ đang lưu trên trình duyệt này. Đăng nhập Google hoạt động trên bản đăng ở website.</p>`;
  else if(S.mode==="loading"||S.mode==="off")note=`<p class="acct-note">Đang kết nối dịch vụ đăng nhập…</p>`;
  else if(S.mode==="error")note=`<p class="acct-note bad-t">${escH(S.err)}</p>`;
  else if(S.user&&S.saveErr)note=`<p class="acct-note bad-t">${escH(S.saveErr)}</p>`;
  el.innerHTML=bar+`<p class="sync" id="sync-st" role="status" aria-live="polite" hidden></p>`+note+cont;paintSync();
}
const LV_TXT=["chưa học","đã đọc","đã làm bài tập","đạt kiểm tra"];
function renderProgress(){
  document.querySelectorAll("#outline li[data-l],#road li[data-l]").forEach(li=>{const l=li.dataset.l,D=AMTS.detailOf(P,l,CID),d=D.manual||D.level===3;
    li.classList.toggle("done",d);for(let k=1;k<=3;k++)li.classList.toggle("lv"+k,!d&&D.level===k);
    const t=li.querySelector(".st-t");if(t)t.textContent=" ("+(D.level===3?"đạt kiểm tra":d?"đã đánh dấu học xong":LV_TXT[D.level])+(li.classList.contains("cur")?", bài đang học":"")+")"});
  document.querySelectorAll("#road [data-rp]").forEach(x=>{const ls=[...x.closest("details").querySelectorAll("li[data-l]")];if(!ls.length){x.textContent="";return}
    const d=ls.filter(li=>AMTS.isDone(P,li.dataset.l,CID)).length;x.textContent=d?`${d}/${ls.length} bài xong`:""});
  document.querySelectorAll("[data-done]").forEach(b=>{const l=b.dataset.done,D=AMTS.detailOf(P,l,CID),auto=D.level===3,on=auto||D.manual;
    b.classList.toggle("is-done",on);b.setAttribute("aria-pressed",on);b.disabled=auto;
    b.textContent=auto?"✓ Đạt kiểm tra":D.manual?"✓ Đã đánh dấu học xong":"Đánh dấu đã học xong";
    b.title=auto?"Bài được tính hoàn thành tự động vì đã đạt bài tập và trắc nghiệm":D.manual?"Bấm để bỏ đánh dấu":"";
    const box=document.querySelector(`#view-${l} .lprog`);if(box)box.innerHTML=lprogHTML(D)});
  renderAccount();
  document.dispatchEvent(new Event("amts-progress"));
  const mp=document.getElementById("m-prog");if(mp){const n=doneCount();mp.textContent=`${n}/${LESSONS.length} bài`;mp.title=`Đã hoàn thành ${n}/${LESSONS.length} bài đang mở`}
}
/* dải tiến độ cuối bài: Đã đọc → Đã làm bài tập → Đạt kiểm tra */
function lprogHTML(D){const need=Math.ceil(D.exTotal*2/3-1e-9);
  const st=[["Đã đọc",D.read||D.level>0,""],
    ["Đã làm bài tập",D.exTotal?D.exOk:null,D.exTotal?`${D.exPass}/${D.exTotal} bài đạt · cần ${need}`:"bài này không có bài tập"],
    ["Đạt kiểm tra",D.level===3,D.hasQuiz?(D.quiz?`trắc nghiệm cao nhất ${D.quiz.best}/${D.quiz.total} · cần ≥ 3/4`:"chưa làm trắc nghiệm · cần ≥ 3/4"):"không có trắc nghiệm"]];
  return `<b class="lp-h">Tiến độ bài này</b><ol>${st.map(([t,ok,s])=>`<li class="${ok?"ok":ok===null?"na":""}"><span class="lp-i" aria-hidden="true">${ok?"✓":ok===null?"–":""}</span><span><b>${t}</b>${s?`<small>${s}</small>`:""}</span><span class="vh">${ok?": đã đạt":ok===null?": không áp dụng":": chưa đạt"}</span></li>`).join("")}</ol>`+
    (D.level<3&&D.manual?`<p class="lp-n">Bạn đã tự đánh dấu học xong bài này.</p>`:D.level<3?`<p class="lp-n">Bài được tính hoàn thành khi đạt cả bài tập và trắc nghiệm, hoặc khi bạn bấm “Đánh dấu đã học xong”.</p>`:"")}
LESSONS.forEach(l=>{const nx=document.querySelector(`#view-${l} div.next`);if(!nx)return;
  const pg=document.createElement("div");pg.className="lprog";pg.setAttribute("aria-live","polite");nx.before(pg);
  const b=document.createElement("button");b.className="btn done-btn";b.dataset.done=l;b.setAttribute("aria-pressed","false");
  b.onclick=()=>{const D=AMTS.detailOf(P,l,CID);if(D.level===3)return;track.done(l,!D.manual)};nx.prepend(b)});
AMTS.on(S=>{
  const uid=S.user?S.user.uid:null;
  if(uid&&uid!==lastUid&&S.docLoaded){ // vừa đăng nhập: gộp tiến độ trên máy với tiến độ trên máy chủ
    const remote=AMTS.courseOf(S.doc,CID);P=remote?AMTS.merge(remote,P):P;AMTS.setLocal(CID,P);
    lastUid=uid;pushNow();
  }
  if(!uid&&lastUid){P=AMTS.empty();lastUid=null}
  renderProgress();TOPNAV.render();
});
TOPNAV.opts.signOut=async()=>{await pushNow();await AMTS.signOut();P=AMTS.empty();try{localStorage.setItem(VKEY,"road")}catch(e){}location.hash="#lo-trinh";location.reload()};
renderProgress();TOPNAV.render();
{const v=lastLessonShown();if(v&&/^l\d/.test(v)&&(LESSON_EMBED||LOADED.has(v)))track.visit(v)}
AMTS.init();

READY_RAN=true;READY.splice(0).forEach(f=>{try{f()}catch(e){console.error(e)}});
BOOT_DONE();
