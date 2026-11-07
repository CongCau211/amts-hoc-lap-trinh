/* ===================== trình mô phỏng của khóa (platform/js/58-x86-asm.js) ===================== */
/* ===================== Trình mô phỏng 8086 · phần 1: trình dịch hợp ngữ (assembler) =====================
   Cú pháp MASM/TASM kiểu emu8086 (giảng viên chốt 21/10/2026). Chỉ tải trên trang khóa mpu8086. Không dùng DOM; chạy được trong Node.
   Tài liệu: docs/TRINH-MO-PHONG-8086.md (cú pháp hỗ trợ, cách bố trí bộ nhớ, giới hạn, cách kiểm chứng).

   X86.assemble(src) → {ok, errors:[{line, msg, vi}], warns:[…], prog}
   prog: {kind:"exe"|"com", psp, image (Uint8Array, nạp tại đoạn prog.base), entry {cs, ip}, ss, sp, ds0,
          stmts:[{line, seg, off, phys, bytes, kind:"ins"|"data", mn (tên lệnh, với "ins")}], lineAt: Map(địa chỉ vật lý → dòng), syms, codeSize, segs}

   Mã máy sinh ra giống MASM/JWasm (lệnh hai thanh ghi dùng dạng d = 1: MOV AX,BX → 8B C3; độ dời có nhãn luôn 16 bit),
   nhảy JMP/CALL được tối ưu ngắn/gần bằng nhiều lượt như MASM 6 / JWasm. Bộ đối chiếu với NASM: tools/x86-test/asm-vs-nasm.js.
   Macro (sửa sau tích hợp): tên MACRO [tham số, …] … ENDM, LOCAL, REPT n … ENDM, IRP x, <a, b> … ENDM, IRPC c, abc … ENDM, nối & —
   mở rộng dạng chữ trước khi dịch (expand()). Dịch có điều kiện: IF/IFE biểu thức (EQ NE LT LE GT GE), IFDEF/IFNDEF tên, IFB/IFNB,
   ELSEIF, ELSE, ENDIF — xét khi đọc tới dòng (chỉ biết hằng EQU/= và tên định nghĩa ở phía trên, như lượt 1 của MASM).
   STRUC: tên STRUC … tên ENDS (trường DB/DW/DD), biến tên KIỂU <giá trị, …> hoặc n DUP(<>), truy cập biến.trường, [BX].trường.
   INCLUDE: báo lỗi (trình duyệt không có tệp để đọc).
*/
(function(G){
"use strict";
const X86=G.X86||(G.X86={});
const R16=["AX","CX","DX","BX","SP","BP","SI","DI"],R8=["AL","CL","DL","BL","AH","CH","DH","BH"],SR=["ES","CS","SS","DS"];
const PSP=0x0700;   // giả định: DOS đặt PSP ở đoạn 0700h (giống emu8086); chương trình .EXE nạp ngay sau PSP (0710h)
class AsmErr extends Error{constructor(msg,vi,col){super(msg);this.vi=vi;this.col=col}}
const E=(msg,vi)=>new AsmErr(msg,vi);
const ALU={ADD:0,OR:1,ADC:2,SBB:3,AND:4,SUB:5,XOR:6,CMP:7};
const SHF={ROL:0,ROR:1,RCL:2,RCR:3,SHL:4,SAL:4,SHR:5,SAR:7};
const JCC={JO:0,JNO:1,JB:2,JC:2,JNAE:2,JNB:3,JAE:3,JNC:3,JE:4,JZ:4,JNE:5,JNZ:5,JBE:6,JNA:6,JA:7,JNBE:7,JS:8,JNS:9,JP:10,JPE:10,JNP:11,JPO:11,JL:12,JNGE:12,JGE:13,JNL:13,JLE:14,JNG:14,JG:15,JNLE:15};
const LOOPS={LOOPNE:0xE0,LOOPNZ:0xE0,LOOPE:0xE1,LOOPZ:0xE1,LOOP:0xE2,JCXZ:0xE3};
const SIMPLE={AAA:[0x37],AAS:[0x3F],DAA:[0x27],DAS:[0x2F],CBW:[0x98],CWD:[0x99],CLC:[0xF8],STC:[0xF9],CMC:[0xF5],CLD:[0xFC],STD:[0xFD],CLI:[0xFA],STI:[0xFB],
  HLT:[0xF4],NOP:[0x90],WAIT:[0x9B],LAHF:[0x9F],SAHF:[0x9E],PUSHF:[0x9C],POPF:[0x9D],INTO:[0xCE],IRET:[0xCF],XLATB:[0xD7],AAM:[0xD4,0x0A],AAD:[0xD5,0x0A],
  MOVSB:[0xA4],MOVSW:[0xA5],CMPSB:[0xA6],CMPSW:[0xA7],STOSB:[0xAA],STOSW:[0xAB],LODSB:[0xAC],LODSW:[0xAD],SCASB:[0xAE],SCASW:[0xAF],RETF:[0xCB],RETN:[0xC3]};
const STRK={MOVS:0xA4,CMPS:0xA6,STOS:0xAA,LODS:0xAC,SCAS:0xAE};
const PREFIX={REP:0xF3,REPE:0xF3,REPZ:0xF3,REPNE:0xF2,REPNZ:0xF2,LOCK:0xF0};
const MNEMS=new Set(["MOV","PUSH","POP","XCHG","XLAT","IN","OUT","LEA","LDS","LES","INC","DEC","NEG","NOT","MUL","IMUL","DIV","IDIV","TEST","CALL","JMP","RET","INT",
  ...Object.keys(ALU),...Object.keys(SHF),...Object.keys(JCC),...Object.keys(LOOPS),...Object.keys(SIMPLE),...Object.keys(STRK),...Object.keys(PREFIX)]);
const NEED186={PUSHA:1,POPA:1,ENTER:1,LEAVE:1,BOUND:1,INS:1,OUTS:1,INSB:1,INSW:1,OUTSB:1,OUTSW:1,MOVZX:3,MOVSX:3,JECXZ:3,CDQ:3,CWDE:3,PUSHAD:3,SETZ:3,SETE:3,BT:3,BSF:3,BSR:3};
const DIRS=new Set(["DB","DW","DD","EQU","=","PROC","ENDP","SEGMENT","ENDS","LABEL","GROUP","STRUC","STRUCT","MACRO"]);
const TYPES={BYTE:1,WORD:2,DWORD:4,NEAR:-1,FAR:-2,SHORT:-3};
/* ---------- tách từ ---------- */
function lex(line,ln){const T=[];let i=0;const n=line.length;
  while(i<n){const c=line[i];
    if(c===";")break;
    if(c===" "||c==="\t"||c==="\r"){i++;continue}
    if(c==="'"||c==='"'){let j=i+1,s="";for(;;){if(j>=n)throw E("missing closing quote","Thiếu dấu nháy đóng chuỗi ("+c+").");if(line[j]===c){if(line[j+1]===c){s+=c;j+=2;continue}break}s+=line[j++]}
      T.push({t:"str",v:s,col:i});i=j+1;continue}
    if(/[0-9]/.test(c)){let j=i;while(j<n&&/[0-9A-Za-z_]/.test(line[j]))j++;T.push({t:"num",v:line.slice(i,j),col:i});i=j;continue}
    if(/[A-Za-z_@$?.]/.test(c)){let j=i+1;while(j<n&&/[A-Za-z0-9_@$?]/.test(line[j]))j++;
      if(c==="$"&&j===i+1){T.push({t:"op",v:"$",col:i});i++;continue}
      const w=line.slice(i,j);T.push({t:"id",v:w,u:w.toUpperCase(),col:i});i=j;continue}
    if("+-*/()[],:<>=".includes(c)){T.push({t:"op",v:c,col:i});i++;continue}
    throw E("illegal character","Ký tự “"+c+"” không dùng được trong hợp ngữ ở đây.")}
  return T}
function parseNum(s){const u=s.toUpperCase();let m;
  if(/^0X[0-9A-F]+$/.test(u))return parseInt(u.slice(2),16);
  if(/^[0-9][0-9A-F]*H$/.test(u))return parseInt(u.slice(0,-1),16);
  if(/^[01]+[BY]$/.test(u))return parseInt(u.slice(0,-1),2);
  if(/^[0-7]+[OQ]$/.test(u))return parseInt(u.slice(0,-1),8);
  if((m=/^([0-9]+)[DT]?$/.exec(u)))return parseInt(m[1],10);
  if(/^[0-9A-F]+$/.test(u)&&/[A-F]/.test(u))throw E("invalid number","Số “"+s+"” có chữ A–F nhưng thiếu hậu tố H. Số hệ 16 viết là "+s+"h (bắt đầu bằng chữ số: 0"+s+"h nếu mở đầu là chữ cái).");
  throw E("invalid number","Không đọc được số “"+s+"”. Dùng hậu tố h (hệ 16), b (hệ 2), o hoặc q (hệ 8); không hậu tố là hệ 10.")}
/* ---------- biểu thức ----------
   Giá trị: {n, rel (đoạn của nhãn/biến, offset cần định vị), seg (giá trị là số hiệu đoạn), base, idx (thanh ghi trong []),
             mem (có [] hoặc tên biến), size (kiểu của biến hoặc PTR), sym (biến/nhãn đầu tiên), unk (ký hiệu chưa biết ở lượt này)} */
function V(n){return{n,rel:null,seg:false,base:-1,idx:-1,mem:false,size:0,sym:null,unk:false,regs:0,far:false,segof:null}}
const CMPOP={EQ:(x,y)=>x===y,NE:(x,y)=>x!==y,LT:(x,y)=>x<y,LE:(x,y)=>x<=y,GT:(x,y)=>x>y,GE:(x,y)=>x>=y};
class Parser{
  constructor(T,A){this.T=T;this.i=0;this.A=A}
  peek(k=0){return this.T[this.i+k]}
  eat(v){const t=this.T[this.i];if(t&&t.t!=="str"&&(t.v===v||t.u===v)){this.i++;return t}return null}   // hằng ký tự '-', '+', ',' không phải toán tử
  need(v,what){if(!this.eat(v))throw E("syntax error","Thiếu “"+v+"”"+(what?" "+what:"")+".")}
  done(){return this.i>=this.T.length}
  expr(){return this.orx()}
  orx(){let a=this.andx();for(;;){const t=this.peek();if(t&&(t.u==="OR"||t.u==="XOR")){this.i++;const b=this.andx();a=this.cst(a,b,t.u,t.u==="OR"?a.n|b.n:a.n^b.n)}else return a}}
  andx(){let a=this.notx();while(this.eat("AND")){const b=this.notx();a=this.cst(a,b,"AND",a.n&b.n)}return a}
  notx(){if(this.eat("NOT")){const a=this.notx();return this.cst(a,V(0),"NOT",~a.n)}return this.cmpx()}
  /* so sánh EQ NE LT LE GT GE (dùng trong IF): đúng = 0FFFFh (−1), sai = 0, như MASM; thấp hơn + − và cao hơn NOT */
  cmpx(){const a=this.add(),t=this.peek(),R=CMPOP[t&&t.t==="id"?t.u:""];if(!R)return a;this.i++;const b=this.add();return this.cst(a,b,t.u,R(a.n,b.n)?-1:0)}   // giá trị có dấu như MASM: AND AL, NOT 20h dịch được (−21h vừa 8 bit)
  cst(a,b,op,n){if(a.rel||b.rel||a.regs||b.regs||a.seg||b.seg)throw E("constant expected","Phép "+op+" chỉ dùng với hằng số, không dùng với địa chỉ của nhãn/biến hay thanh ghi.");const r=V(n);r.unk=a.unk||b.unk;return r}
  add(){let a=this.mul();for(;;){if(this.eat("+")){a=this.plus(a,this.mul(),1)}else if(this.eat("-")){a=this.plus(a,this.mul(),-1)}else return a}}
  plus(a,b,s){const r=Object.assign(V(0),a);r.n=a.n+s*b.n;r.unk=a.unk||b.unk;r.mem=a.mem||b.mem;r.size=a.size||b.size;r.sym=a.sym||b.sym;
    if(s<0){if(b.regs)throw E("invalid use of register","Không trừ thanh ghi trong địa chỉ.");
      if(b.rel){if(a.rel&&a.rel.name===b.rel.name){r.rel=null;r.mem=false;r.size=0;r.sym=null}else if(!a.unk&&!b.unk)throw E("invalid operand","Hiệu hai nhãn chỉ có nghĩa khi cùng một đoạn.")}
      return r}
    if(b.rel){if(a.rel&&!a.unk&&!b.unk)throw E("invalid operand","Không cộng địa chỉ của hai nhãn/biến với nhau.");r.rel=b.rel}
    if(b.seg)r.seg=true;
    for(const x of [b.base,b.idx])if(x>=0)this.addReg(r,x);
    return r}
  addReg(r,x){if(x===3||x===5){if(r.base>=0)throw E("multiple base registers","Không dùng cùng lúc hai thanh ghi cơ sở (BX và BP) trong một địa chỉ.");r.base=x}
    else if(x===6||x===7){if(r.idx>=0)throw E("multiple index registers","Không dùng cùng lúc hai thanh ghi chỉ số (SI và DI) trong một địa chỉ.");r.idx=x}
    else throw E("invalid register in address","8086 chỉ dùng BX, BP (cơ sở) và SI, DI (chỉ số) trong địa chỉ bộ nhớ. “["+R16[x]+"]” không hợp lệ.");r.regs++;r.mem=true}
  mul(){let a=this.unary();for(;;){const t=this.peek();if(!t)return a;const o=t.v==="*"||t.v==="/"?t.v:t.u==="MOD"||t.u==="SHL"||t.u==="SHR"?t.u:null;if(!o)return a;this.i++;const b=this.unary();
      if(o==="/"||o==="MOD")if(!b.n&&!b.unk)throw E("divide by zero","Chia cho 0 trong biểu thức.");
      a=this.cst(a,b,o,o==="*"?a.n*b.n:o==="/"?(b.n?Math.trunc(a.n/b.n):0):o==="MOD"?(b.n?a.n%b.n:0):o==="SHL"?a.n<<b.n:a.n>>>b.n)}}
  unary(){const t=this.peek();if(!t)throw E("operand expected","Thiếu toán hạng.");
    if(t.t==="op"&&t.v==="-"){this.i++;const a=this.unary();return this.cst(a,V(0),"đổi dấu",-a.n)}
    if(t.t==="op"&&t.v==="+"){this.i++;return this.unary()}
    const u=t.u;
    if(u==="OFFSET"){this.i++;const a=this.unary();if(a.regs)throw E("invalid operand","OFFSET không dùng với thanh ghi.");const r=Object.assign(V(0),a);r.mem=false;r.size=0;if(a.seg)throw E("invalid operand","OFFSET dùng với tên biến hoặc nhãn, không dùng với tên đoạn.");return r}
    if(u==="SEG"){this.i++;const a=this.unary();const r=V(0);r.unk=a.unk;r.seg=true;r.segof=a.rel||a.segof;r.n=0;return r}
    if(u==="TYPE"||u==="SIZE"||u==="LENGTH"){this.i++;const a=this.unary();const s=a.sym;const r=V(0);r.unk=a.unk;
      if(!s){if(u==="TYPE"){r.n=a.size||0;return r}throw E("invalid operand",u+" dùng với tên biến.")}
      r.n=u==="TYPE"?(s.type>0?s.type:s.type===-2?0xFFFE:0xFFFF):u==="LENGTH"?(s.len||1):(s.len||1)*(s.type>0?s.type:0);return r}
    if(u==="HIGH"||u==="LOW"){this.i++;const a=this.unary();const r=this.cst(a,V(0),u,u==="HIGH"?(a.n>>8)&255:a.n&255);return r}
    if(TYPES[u]&&this.peek(1)&&this.peek(1).u==="PTR"){this.i+=2;const a=this.unary();const r=Object.assign(V(0),a);r.size=TYPES[u];r.ptr=TYPES[u];r.mem=a.mem||a.regs>0||!!a.rel;return r}
    return this.post(this.prim())}
  post(a){for(;;){const t=this.peek();if(!t)return a;
      if(t.v==="["){this.i++;const b=this.inner();this.need("]");a=this.plus(a,b,1);a.mem=true;continue}
      if(t.t==="id"&&t.u[0]==="."&&t.u.length>1&&!this.A.isDir(t.u)){this.i++;const f=this.A.fieldOf(t.u.slice(1),a,t.v.slice(1));const sym=a.sym;a=this.plus(a,V(f.off),1);a.mem=true;a.size=f.type;a.sym=sym;continue}   // biến.trường, [BX].trường
      return a}}
  inner(){this.inBr=(this.inBr||0)+1;const r=this.expr();this.inBr--;r.mem=true;return r}
  prim(){const t=this.T[this.i++];
    if(t.t==="num"){return V(parseNum(t.v))}
    if(t.t==="str"){if(t.v.length>2||!t.v.length)throw E("invalid character constant","Hằng ký tự chỉ có 1 hoặc 2 ký tự (chuỗi dài chỉ dùng trong DB).");let n=0;for(const ch of t.v)n=(n<<8)|(ch.charCodeAt(0)&255);return V(n)}
    if(t.v==="("){const a=this.expr();this.need(")");return a}
    if(t.v==="["){const a=this.inner();this.need("]");a.mem=true;return a}
    if(t.v==="$"){const r=V(this.A.here());r.rel=this.A.cur;return r}
    if(t.t==="id"){const u=t.u;const ri=R16.indexOf(u);
      if(ri>=0){if(!this.inBr)throw E("register in expression","Thanh ghi "+u+" chỉ được dùng trong dấu [ ] khi làm địa chỉ.");const r=V(0);this.addReg(r,ri);return r}
      if(R8.includes(u)||SR.includes(u))throw E("invalid register in address","Thanh ghi "+u+" không dùng được trong địa chỉ bộ nhớ (chỉ BX, BP, SI, DI).");
      return this.A.symVal(u,t.v)}
    throw E("syntax error","Không hiểu “"+t.v+"” ở đây.")}
}
/* ---------- toán hạng của lệnh ---------- */
function splitCommas(T){const out=[];let cur=[],d=0;for(const t of T){const o=t.t==="str"?"":t.v;if(o==="["||o==="(")d++;else if(o==="]"||o===")")d--;if(o===","&&d===0){out.push(cur);cur=[]}else cur.push(t)}if(cur.length||out.length)out.push(cur);return out}
function operand(T,A){
  if(!T.length)throw E("operand expected","Thiếu toán hạng (có dấu phẩy thừa?).");
  if(T.length===1&&T[0].t==="id"){const u=T[0].u;let i;
    if((i=R16.indexOf(u))>=0)return{k:"r16",n:i};if((i=R8.indexOf(u))>=0)return{k:"r8",n:i};if((i=SR.indexOf(u))>=0)return{k:"sreg",n:i}}
  let j=0,size=0,dist=0;
  /* BYTE PTR / WORD PTR / DWORD PTR / FAR PTR / NEAR PTR / SHORT */
  for(;;){const t=T[j];if(!t)break;
    if(t.u==="SHORT"){dist=-3;j++;continue}
    if(TYPES[t.u]&&T[j+1]&&T[j+1].u==="PTR"){if(TYPES[t.u]>0)size=TYPES[t.u];else dist=TYPES[t.u];j+=2;continue}
    break}
  let seg=-1;
  if(T[j]&&T[j+1]&&T[j+1].v===":"&&T[j].t==="id"&&SR.includes(T[j].u)){seg=SR.indexOf(T[j].u);j+=2}
  else if(T[j]&&T[j+1]&&T[j+1].v===":"&&T[j].t==="id"){const s=A.segByName(T[j].u);if(s){seg={seg:s};j+=2}}
  const P=new Parser(T.slice(j),A);const v=P.expr();if(!P.done())throw E("syntax error","Không hiểu phần “"+T.slice(j+P.i).map(t=>t.v).join(" ")+"” của toán hạng.");
  if(!size&&v.ptr>0)size=v.ptr;
  if(v.mem||seg!==-1){const m={k:"mem",size:size||v.size,base:v.base,idx:v.idx,disp:v.n,rel:v.rel,unk:v.unk,seg,sym:v.sym,dist};
    if(m.size===4&&v.sym&&!size)m.size=4;return m}
  return{k:"imm",v:v.n,rel:v.rel,unk:v.unk,seg:v.seg,segof:v.segof,sym:v.sym,dist,size,far:v.far}}
/* ---------- assembler ---------- */
class Asm{
  constructor(src){this.src=src;this.lines=src.replace(/\r\n?/g,"\n").split("\n")}
  isDir(u){return [".MODEL",".DATA",".CODE",".STACK",".STARTUP",".EXIT"].includes(u)}
  segByName(u){return this.segs.find(s=>s.name===u)||(this.groups[u]&&this.groups[u])||null}
  here(){return this.cur?this.cur.lc:0}
  symVal(u,orig){
    if(u==="@DATA"){const g=this.groups.DGROUP||this.segByName("_DATA");const r=V(0);r.seg=true;r.segof=g||null;r.unk=!g;if(!g&&this.pass>0)throw E("no .DATA","@DATA dùng khi chương trình có .DATA (và .MODEL).");return r}
    if(u==="@CODE"){const s=this.segByName("_TEXT");const r=V(0);r.seg=true;r.segof=s;return r}
    const s=this.sym[u];
    if(!s){const g=this.segByName(u);if(g){const r=V(0);r.seg=true;r.segof=g;return r}
      if(this.final)throw Object.assign(E("undefined symbol","Chưa định nghĩa “"+orig+"”. Kiểm tra chính tả, hoặc khai báo biến (DB/DW), nhãn (tên:) hay hằng (EQU) trước khi dùng."),{undef:orig});
      this.unknown=true;const r=V(0);r.unk=true;return r}
    if(s.k==="const"){const r=V(s.v);r.unk=!!s.unk;if(s.rel){r.rel=s.rel;r.sym=s.sym}if(s.struc)r.size=s.v;return r}   // tên STRUC: kích thước (TYPE KIỂU)
    const r=V(this.offOf(s));r.rel=s.seg;r.sym=s;r.mem=s.k==="var";r.size=s.k==="var"?s.type:0;if(s.k==="label")r.far=s.type===-2;return r}
  frameOf(seg){return seg.group||seg}
  offOf(s){return (s.seg.group?s.seg.inGroup:0)+s.off}
  fail(ln,e){this.errors.push({line:ln,msg:e.message,vi:e.vi||e.message})}
  run(){
    this.errors=[];this.warns=[];const st=this.stmts=[];
    /* lượt 0: tách từng dòng thành câu lệnh */
    this.mode=null;this.pstruc=Object.create(null);this.curStruc=null;
    for(const L of this.expand()){let T;const tag=e=>{if(L.mac&&e instanceof AsmErr&&!/ \(trong macro/.test(e.vi))e.vi+=" (trong macro "+L.mac+")";return e};
      try{T=lex(L.t,L.ln)}catch(e){if(e instanceof AsmErr){this.fail(L.ln,tag(e));continue}throw e}
      if(!T.length)continue;
      try{const s=this.parseLine(T,L.ln);if(s)for(const x of s){if(L.mac)x.mac=L.mac;st.push(x)}}catch(e){if(e instanceof AsmErr)this.fail(L.ln,tag(e));else throw e}}
    if(this.curStruc)this.fail(this.curStruc.line,E("missing ENDS","STRUC "+this.curStruc.disp+" chưa có "+this.curStruc.disp+" ENDS."));
    if(this.errors.length)return this.result();
    /* các lượt bố trí: lặp tới khi địa chỉ mọi nhãn ổn định (lệnh nhảy chỉ dài ra, không ngắn lại, nên luôn dừng) */
    let prev=null;
    for(this.pass=0;this.pass<24;this.pass++){
      this.errors=[];const sig=this.layout(false);
      if(sig===prev)break;prev=sig}
    this.final=true;this.errors=[];this.layout(true);
    return this.result()}
  /* ---------- macro: mở rộng dạng chữ trước khi tách từ ----------
     → [{t: dòng chữ, ln: số dòng trong mã nguồn (dòng gọi macro với dòng sinh ra từ macro), mac: tên macro}] */
  expand(){
    const out=[],macs=this.macs=Object.create(null);let uniq=0;
    const code=l=>{let q=null,r="";for(const ch of l){if(q){r+=ch;if(ch===q)q=null;continue}if(ch==="'"||ch==='"'){q=ch;r+=ch;continue}if(ch===";")break;r+=ch}return r};
    const words=l=>code(l).trim().split(/[\s,]+/).filter(Boolean).map(w=>w.toUpperCase());
    const opens=l=>{const w=words(l);return w[0]==="REPT"||w[0]==="IRP"||w[0]==="IRPC"||w[1]==="MACRO"};
    const body=(L,i,what,ln)=>{let d=1,j=i+1;for(;j<L.length;j++){if(opens(L[j]))d++;else if(words(L[j])[0]==="ENDM"&&--d===0)break}
      if(j>=L.length)throw E("missing ENDM",what+" chưa có ENDM đóng lại.");return[L.slice(i+1,j),j]};
    const splitArgs=s=>{const a=[];let cur="",q=null,d=0;for(const ch of s){if(q){cur+=ch;if(ch===q)q=null;continue}
        if(ch==="'"||ch==='"'){q=ch;cur+=ch;continue}if(ch==="<"){if(d++===0)continue}else if(ch===">"){if(--d===0)continue}
        if(ch===","&&d===0){a.push(cur.trim());cur="";continue}cur+=ch}if(cur.trim()||a.length)a.push(cur.trim());return a};
    const ID=/[A-Za-z_@?$][\w@?$]*/g;
    const subst=(l,map)=>l.split(/('[^']*'|"[^"]*")/).map((p,k)=>k%2?p.replace(/&([A-Za-z_@?$][\w@?$]*)&?/g,(m,n)=>map[n.toUpperCase()]!=null?map[n.toUpperCase()]:m)
        :p.replace(ID,w=>map[w.toUpperCase()]!=null?map[w.toUpperCase()]:w).replace(/&/g,"")).join("");
    /* dịch có điều kiện: IF/IFE biểu thức, IFDEF/IFNDEF tên, IFB/IFNB <đối số>, ELSEIF, ELSE, ENDIF — xét ngay khi đọc tới (như lượt 1
       của MASM): hằng EQU/= và tên đã định nghĩa ở các dòng phía trên mới được biết */
    const consts=Object.create(null),defs=new Set();
    const CA={symVal:(u,v)=>{if(consts[u]!=null)return V(consts[u]);throw E("undefined symbol","Điều kiện dùng “"+v+"” nhưng "+v+" chưa được gán số bằng EQU hoặc = ở phía trên (IF được xét ngay khi đọc tới dòng đó).")},
      here:()=>{throw E("constant expected","Điều kiện IF không dùng $ (địa chỉ hiện tại).")},isDir:()=>false,
      fieldOf:()=>{throw E("constant expected","Điều kiện IF chỉ dùng hằng số.")},segByName:()=>null,cur:null};
    const cexp=(s,what)=>{const T=lex(s,0);if(!T.length)throw E("operand expected",what+" cần một biểu thức hằng (ví dụ "+what+" N GT 3).");
      const P=new Parser(T,CA);const v=P.expr();if(!P.done())throw E("syntax error","Không hiểu “"+T.slice(P.i).map(t=>t.v).join(" ")+"” trong điều kiện.");
      if(v.rel||v.regs||v.seg||v.mem)throw E("constant expected",what+" chỉ dùng hằng số (không dùng thanh ghi, biến hay nhãn).");return v.n};
    const isBlank=s=>{s=s.trim();if(/^<.*>$/.test(s))s=s.slice(1,-1);return !s.trim()};
    const CONDS={IF:r=>cexp(r,"IF")!==0,IFE:r=>cexp(r,"IFE")===0,IFDEF:r=>isDef(r,"IFDEF"),IFNDEF:r=>!isDef(r,"IFNDEF"),IFB:r=>isBlank(r),IFNB:r=>!isBlank(r)};
    const isDef=(r,what)=>{const t=r.trim();if(!/^[A-Za-z_@?$][\w@?$]*$/.test(t))throw E("syntax error",what+" cần đúng một tên (ví dụ "+what+" DEBUG).");const u=t.toUpperCase();return defs.has(u)||!!macs[u]};
    const track=c=>{let m=/^\s*([A-Za-z_@?$][\w@?$]*)\s*(?:\s(EQU)\b|(=))(.*)$/i.exec(c);
      if(m){const u=m[1].toUpperCase();defs.add(u);try{consts[u]=cexp(m[4],"EQU")}catch(e){if(!(e instanceof AsmErr))throw e;delete consts[u]}return}
      if((m=/^\s*([A-Za-z_@?$][\w@?$]*)\s*:/.exec(c)))defs.add(m[1].toUpperCase());
      if((m=/^\s*([A-Za-z_@?$][\w@?$]*)\s+(DB|DW|DD|PROC|SEGMENT|LABEL|STRUC|STRUCT|GROUP)\b/i.exec(c)))defs.add(m[1].toUpperCase())};
    const run=(L,lns,depth,mac)=>{
      const cs=[];   // khối điều kiện đang mở trong lượt này: {act, done, outer, ln, els}
      for(let i=0;i<L.length;i++){const ln=lns[i],raw=L[i],c=code(raw);
        try{
          const kw=(/^\s*([A-Za-z]+)\b/.exec(c)||[])[1];const K=kw&&kw.toUpperCase(),rest=kw?c.trim().slice(kw.length):"";
          if(K&&(CONDS[K]||K==="ELSE"||K==="ELSEIF"||K==="ENDIF"||K==="IFIDN"||K==="IFDIF"||K==="IF1"||K==="IF2"||K==="ELSEIFE"||K==="ELSEIFDEF"||K==="ELSEIFNDEF")){
            const on=cs.every(s=>s.act);
            if(CONDS[K]){let v;try{v=on?CONDS[K](rest):false}catch(e){cs.push({act:false,done:true,outer:on,ln,els:false});throw e}cs.push({act:v,done:v||!on,outer:on,ln,els:false});continue}
            if(K==="ENDIF"){if(!cs.length)throw E("ENDIF","ENDIF không có IF tương ứng.");cs.pop();continue}
            if(K==="ELSE"){const t=cs[cs.length-1];if(!t)throw E("ELSE","ELSE không có IF tương ứng.");if(t.els)throw E("ELSE","Một khối IF chỉ có một ELSE.");
              t.els=true;t.act=t.outer&&!t.done;t.done=true;continue}
            if(K==="ELSEIF"){const t=cs[cs.length-1];if(!t)throw E("ELSEIF","ELSEIF không có IF tương ứng.");if(t.els)throw E("ELSEIF","ELSEIF phải đứng trước ELSE.");
              const x=t.outer&&cexp(rest,"ELSEIF")!==0,v=x&&!t.done;t.act=v;if(v)t.done=true;continue}
            throw E("unsupported","Trình mô phỏng có IF, IFE, IFDEF, IFNDEF, IFB, IFNB, ELSEIF, ELSE, ENDIF; chưa có "+K+".")}
          if(!cs.every(s=>s.act))continue;
          let m=/^\s*([A-Za-z_@?$][\w@?$]*)\s+MACRO\b(.*)$/i.exec(c);
          if(m){const name=m[1].toUpperCase();if(MNEMS.has(name)||DIRS.has(name)||R16.includes(name)||R8.includes(name)||SR.includes(name))throw E("reserved word","“"+m[1]+"” là từ khóa, không đặt làm tên macro.");
            const params=m[2].split(",").map(x=>x.trim().replace(/:.*$/,"").toUpperCase()).filter(Boolean);
            const [b,j]=body(L,i,"MACRO "+m[1],ln);macs[name]={params,body:b,disp:m[1]};i=j;continue}
          m=/^\s*REPT\b(.*)$/i.exec(c);
          if(m){const t=m[1].trim();let n;try{n=parseNum(t)}catch(e){throw E("REPT count","REPT cần một số cụ thể (ví dụ REPT 4).")}
            if(n<0||n>1000)throw E("REPT count","Số lần REPT từ 0 đến 1000.");const [b,j]=body(L,i,"REPT",ln);i=j;
            const rep=[];for(let k=0;k<n;k++)rep.push(...b);if(depth>20)throw E("macro depth","Macro lồng quá sâu (quá 20 mức).");run(rep,rep.map(()=>ln),depth+1,mac||"REPT");continue}
          /* IRP tham số, <a, b, c> … ENDM: lặp thân, mỗi lần thay tham số bằng một phần tử; IRPC tham số, chuỗi … ENDM: mỗi lần một ký tự */
          m=/^\s*(IRPC?)\b(.*)$/i.exec(c);
          if(m){const kind=m[1].toUpperCase(),mm=/^\s*([A-Za-z_@?$][\w@?$]*)\s*,\s*(.*?)\s*$/.exec(m[2]);
            if(!mm)throw E("syntax error",kind==="IRP"?"IRP viết dạng IRP tham số, <a, b, c> … ENDM.":"IRPC viết dạng IRPC tham số, chuỗi ký tự … ENDM.");
            const p=mm[1].toUpperCase();let a=mm[2],items;
            if(kind==="IRP"){if(!/^<.*>$/.test(a))throw E("IRP list","IRP cần danh sách đặt trong dấu < > (ví dụ IRP r, <AX, BX, CX>).");a=a.slice(1,-1).trim();items=a?splitArgs(a):[]}
            else{if(/^<.*>$/.test(a))a=a.slice(1,-1);if(/\s/.test(a.trim()))throw E("IRPC list","Chuỗi của IRPC không có dấu cách (hoặc đặt trong dấu < >).");items=[...a.trim()]}
            if(items.length>1000)throw E("IRP list",kind+" lặp tối đa 1000 lần.");if(depth>20)throw E("macro depth","Macro lồng quá sâu (quá 20 mức).");
            const [b,j]=body(L,i,kind,ln);i=j;const rep=[];for(const it of items){const map=Object.create(null);map[p]=it;for(const l of b)rep.push(subst(l,map))}
            run(rep,rep.map(()=>ln),depth+1,mac||kind);continue}
          const w=words(raw);
          if(w[0]==="ENDM")throw E("ENDM","ENDM không có MACRO/REPT/IRP/IRPC tương ứng.");
          if(w[0]==="EXITM"||w[0]==="PURGE"||w[0]==="GOTO")throw E("unsupported","Trình mô phỏng hỗ trợ macro dạng MACRO … ENDM (có tham số, LOCAL), REPT, IRP, IRPC và dịch có điều kiện; chưa có "+w[0]+".");
          if(w[0]==="LOCAL"&&!mac)throw E("LOCAL","LOCAL chỉ dùng trong thân macro (ngay sau dòng MACRO).");
          m=/^\s*(?:([A-Za-z_@?$][\w@?$]*)\s*:\s*)?([A-Za-z_@?$][\w@?$]*)\b(.*)$/.exec(c);
          const mc=m&&macs[m[2].toUpperCase()];
          if(mc&&!(m[3].trim().split(/\s+/)[0]&&DIRS.has(m[3].trim().split(/\s+/)[0].toUpperCase()))){
            if(depth>20)throw E("macro depth","Macro gọi lồng quá sâu (quá 20 mức): macro có tự gọi chính nó không?");
            const args=m[3].trim()?splitArgs(m[3].trim()):[];if(args.length>mc.params.length)throw E("macro arguments","Macro "+mc.disp+" có "+mc.params.length+" tham số, đang truyền "+args.length+".");
            const map=Object.create(null);mc.params.forEach((p,k)=>{map[p]=args[k]!=null?args[k]:""});
            const b=[];for(const l of mc.body){const lm=/^\s*LOCAL\b(.*)$/i.exec(code(l));if(lm){for(const n of lm[1].split(",").map(x=>x.trim().toUpperCase()).filter(Boolean))map[n]="??"+(uniq++).toString(16).toUpperCase().padStart(4,"0");continue}b.push(l)}
            const ex=b.map(l=>subst(l,map));if(m[1])ex.unshift(m[1]+":");
            run(ex,ex.map(()=>ln),depth+1,mc.disp);continue}
          track(c);out.push({t:raw,ln,mac})}
        catch(e){if(!(e instanceof AsmErr))throw e;if(mac&&!/ \(trong macro/.test(e.vi))e.vi+=" (trong macro "+mac+")";this.fail(ln,e)}}
      if(cs.length){const e=E("missing ENDIF","IF chưa có ENDIF đóng lại.");if(mac)e.vi+=" (trong macro "+mac+")";this.fail(cs[cs.length-1].ln,e)}};
    run(this.lines,this.lines.map((_,i)=>i+1),0,null);
    return out}
  /* STRUC: trường (offset, kiểu) theo tên kiểu; .trường sau một toán hạng. a: giá trị bên trái (để biết kiểu STRUC của biến) */
  fieldOf(fname,a,disp){disp=disp||fname;const st=a&&a.sym&&a.sym.struc?this.sym[a.sym.struc]:null;
    if(st&&st.fields){const f=st.fields[fname];if(!f)throw E("unknown field","STRUC "+st.disp+" không có trường “"+disp+"”.");return f}
    const L=Object.values(this.strucList||{}).map(s=>s.fields[fname]).filter(Boolean);
    if(!L.length)throw E("unknown field","Không có trường “"+disp+"” trong STRUC nào đã khai báo.");
    if(L.some(f=>f.off!==L[0].off||f.type!==L[0].type))throw E("ambiguous field","Trường “"+disp+"” có ở nhiều STRUC với độ lệch khác nhau: dùng tên biến kiểu STRUC (bien."+disp+").");
    return L[0]}
  /* ---------- tách câu lệnh ---------- */
  parseLine(T,ln){
    const out=[];const S=(o)=>{o.line=ln;out.push(o)};
    let i=0;
    /* nhãn "ten:" */
    if(T.length>=2&&T[0].t==="id"&&T[1].v===":"&&!SR.includes(T[0].u)){
      if(MNEMS.has(T[0].u)||DIRS.has(T[0].u))throw E("reserved word","“"+T[0].v+"” là từ khóa, không đặt làm tên nhãn.");
      S({k:"label",name:T[0].u,disp:T[0].v});i=2;if(i>=T.length)return out}
    const t0=T[i],t1=T[i+1];
    /* trong STRUC … ENDS: chỉ khai báo trường */
    if(this.curStruc){const cs=this.curStruc;
      if(t0.t==="id"&&t1&&t1.u==="ENDS"&&T.length===2){if(t0.u!==cs.name)throw E("struc mismatch","ENDS không khớp tên STRUC đang mở ("+cs.disp+").");this.pstruc[cs.name]=cs;this.curStruc=null;return out}
      let nm=null,k=i;if(t0.t==="id"&&t1&&t1.t==="id"&&["DB","DW","DD"].includes(t1.u)){nm=t0;k=i+1}
      const d=T[k];if(!d||d.t!=="id"||!["DB","DW","DD"].includes(d.u))throw E("struc field","Trong STRUC chỉ khai báo trường bằng DB/DW/DD (kết thúc bằng "+cs.disp+" ENDS).");
      this.curW={DB:1,DW:2,DD:4}[d.u];cs.fields.push({name:nm?nm.u:null,disp:nm?nm.v:null,w:this.curW,items:this.dataItems(T.slice(k+1))});return out}
    if(t0.t==="id"&&t1&&(t1.u==="STRUC"||t1.u==="STRUCT")&&T.length===2){if(this.pstruc[t0.u])throw E("symbol redefinition","STRUC “"+t0.v+"” đã khai báo.");
      this.curStruc={k:"struc",name:t0.u,disp:t0.v,fields:[],line:ln};S(this.curStruc);return out}
    /* biến kiểu STRUC: [tên] KIỂU <giá trị, …>  hoặc  [tên] KIỂU n DUP(<…>) */
    {let nm=null,k=i;if(t0.t==="id"&&t1&&t1.t==="id"&&this.pstruc[t1.u]){nm=t0;k=i+1}
      if(T[k].t==="id"&&this.pstruc[T[k].u]&&(nm||!T[k+1]||T[k+1].v==="<"||T[k+1].t==="num")){const sn=T[k].u,rest=T.slice(k+1);
        if(nm&&(MNEMS.has(nm.u)||R16.includes(nm.u)||R8.includes(nm.u)||SR.includes(nm.u)))throw E("reserved word","“"+nm.v+"” là từ khóa hoặc tên thanh ghi, không đặt làm tên.");
        S({k:"svar",name:nm?nm.u:null,disp:nm?nm.v:null,sname:sn,...this.strucInit(rest)});return out}}
    if(t0.t==="id"&&t0.u[0]==="."){this.dot(t0.u,T.slice(i+1),S);return out}
    if(t0.t==="op"&&t0.v==="=")throw E("syntax error","Thiếu tên trước dấu =.");
    /* tên + chỉ thị */
    if(t1&&(t1.t==="id"&&DIRS.has(t1.u)||t1.v==="=")&&t0.t==="id"){const d=t1.v==="="?"=":t1.u,rest=T.slice(i+2),name=t0.u;
      if(MNEMS.has(name)||R16.includes(name)||R8.includes(name)||SR.includes(name))throw E("reserved word","“"+t0.v+"” là từ khóa hoặc tên thanh ghi, không đặt làm tên.");
      switch(d){
        case "DB":case "DW":case "DD":this.curW={DB:1,DW:2,DD:4}[d];S({k:"data",name,disp:t0.v,w:this.curW,items:this.dataItems(rest)});return out;
        case "EQU":case "=":S({k:"equ",name,disp:t0.v,T:rest,redef:d==="="});return out;
        case "PROC":{const ty=rest[0]?rest[0].u:"NEAR";if(rest.length>1||!(ty==="NEAR"||ty==="FAR"))throw E("syntax error","Sau PROC chỉ ghi NEAR hoặc FAR (hoặc để trống = NEAR).");S({k:"proc",name,disp:t0.v,far:ty==="FAR"});return out}
        case "ENDP":S({k:"endp",name});return out;
        case "SEGMENT":S({k:"segment",name,disp:t0.v,stack:rest.some(x=>x.u==="STACK"),cls:(rest.find(x=>x.t==="str")||{}).v||""});return out;
        case "ENDS":S({k:"ends",name});return out;
        case "LABEL":{const ty=rest[0]&&rest[0].u;if(!TYPES[ty]||ty==="SHORT")throw E("syntax error","Sau LABEL ghi BYTE, WORD, DWORD, NEAR hoặc FAR.");S({k:"lbl",name,disp:t0.v,type:TYPES[ty]});return out}
        case "GROUP":throw E("unsupported","Trình mô phỏng chưa hỗ trợ GROUP tự khai báo (dùng .MODEL SMALL: DGROUP có sẵn).")}}
    if(t0.t!=="id")throw E("syntax error","Dòng phải bắt đầu bằng tên lệnh, chỉ thị hoặc nhãn (không hiểu “"+t0.v+"”).");
    const u=t0.u,rest=T.slice(i+1);
    switch(u){
      case "DB":case "DW":case "DD":this.curW={DB:1,DW:2,DD:4}[u];S({k:"data",name:null,w:this.curW,items:this.dataItems(rest)});return out;
      case "ORG":S({k:"org",T:rest});return out;
      case "EVEN":S({k:"align",n:2});return out;
      case "ALIGN":S({k:"align",n:rest.length?parseNum(rest[0].v):2});return out;
      case "ASSUME":{const L=splitCommas(rest).map(p=>{if(p.length!==3||p[1].v!==":"||!SR.includes(p[0].u))throw E("syntax error","ASSUME viết dạng ASSUME CS:CODE, DS:DATA.");return[SR.indexOf(p[0].u),p[2].u]});S({k:"assume",L});return out}
      case "END":S({k:"end",T:rest});return out;
      case "TITLE":case "PAGE":case "NAME":case "SUBTTL":case "%OUT":return out;
      case "INCLUDE":throw E("INCLUDE","INCLUDE đọc thêm một tệp trên đĩa (ví dụ emu8086.inc); trình mô phỏng chạy trong trình duyệt nên không có tệp nào để đọc. Chép phần cần dùng (macro MACRO … ENDM, thủ tục PROC … ENDP) vào ngay chương trình này, hoặc gọi thẳng INT 21h để in, nhập.");
      case "MACRO":case "ENDM":case "LOCAL":case "REPT":case "IRP":case "IRPC":throw E("syntax error",u+" đặt sai chỗ: macro viết dạng tên MACRO tham số … ENDM (LOCAL ngay sau dòng MACRO), REPT n … ENDM, IRP x, <a, b> … ENDM, IRPC c, abc … ENDM.");
      case "STRUC":case "STRUCT":throw E("syntax error","STRUC phải có tên đứng trước (ví dụ: DIEM STRUC … DIEM ENDS).");
      case "EXTRN":case "PUBLIC":case "EXTERN":case "GLOBAL":return out;
      case "PROC":case "ENDP":case "SEGMENT":case "ENDS":throw E("syntax error",u+" phải có tên đứng trước (ví dụ: MAIN "+u+").")}
    if(NEED186[u])throw E("instruction not supported by 8086","Lệnh "+u+" chỉ có từ "+(NEED186[u]===1?"80186":"80386")+" trở đi, 8086 không có.");
    if(!MNEMS.has(u)){if(t1&&t1.t==="id"&&(MNEMS.has(t1.u)))throw E("syntax error","“"+t0.v+"” không phải lệnh. Nếu là nhãn thì thêm dấu hai chấm: "+t0.v+":");
      throw E("unknown instruction","Không có lệnh hay chỉ thị “"+t0.v+"” trong hợp ngữ 8086.")}
    if(PREFIX[u]!==undefined&&rest.length){const sub=this.parseLine(rest,ln);const s=sub[sub.length-1];
      if(!s||s.k!=="ins")throw E("syntax error",u+" phải đứng trước một lệnh.");
      if(u!=="LOCK"&&!(STRK[s.mn]||SIMPLE[s.mn]&&/^(MOVS|CMPS|STOS|LODS|SCAS)/.test(s.mn)))throw E("invalid prefix",u+" chỉ dùng trước lệnh chuỗi (MOVSB, STOSB, CMPSB, SCASB, LODSB…).");
      if((u==="REPE"||u==="REPZ"||u==="REPNE"||u==="REPNZ")&&/^(MOVS|STOS|LODS)/.test(s.mn))this.warns.push({line:ln,vi:u+" thường dùng với CMPS/SCAS; với "+s.mn+" chỉ cần REP."});
      s.pre=PREFIX[u];S(s);return out}
    S({k:"ins",mn:u,ops:splitCommas(rest),toks:rest});return out}
  dot(u,rest,S){
    switch(u){
      case ".MODEL":{const m=rest[0]&&rest[0].u;if(m!=="SMALL"&&m!=="TINY")throw E("unsupported model","Trình mô phỏng hỗ trợ .MODEL SMALL (chương trình .EXE) và .MODEL TINY (chương trình .COM).");S({k:"model",m});return}
      case ".STACK":S({k:"stack",T:rest});return;
      case ".DATA":case ".DATA?":S({k:"sdata"});return;
      case ".CODE":S({k:"scode"});return;
      case ".STARTUP":S({k:"ins",mn:"MOV",ops:[[{t:"id",v:"DX",u:"DX"}],[{t:"id",v:"@DATA",u:"@DATA"}]],gen:1});S({k:"ins",mn:"MOV",ops:[[{t:"id",v:"DS",u:"DS"}],[{t:"id",v:"DX",u:"DX"}]],gen:1});return;
      case ".EXIT":{S({k:"ins",mn:"MOV",ops:rest.length?[[{t:"id",v:"AH",u:"AH"}],[{t:"num",v:"4Ch"}]]:[[{t:"id",v:"AX",u:"AX"}],[{t:"num",v:"4C00h"}]],gen:1});
        if(rest.length)S({k:"ins",mn:"MOV",ops:[[{t:"id",v:"AL",u:"AL"}],rest],gen:1});S({k:"ins",mn:"INT",ops:[[{t:"num",v:"21h"}]],gen:1});return}
      case ".8086":case ".8087":case ".LIST":case ".NOLIST":return;
      case ".186":case ".286":case ".386":case ".486":case ".586":throw E("unsupported","Khóa học dùng tập lệnh 8086; bỏ dòng "+u+" đi.");
      default:throw E("unknown directive","Không có chỉ thị “"+u+"”.")}}
  /* giá trị đầu của biến STRUC: <a, , c> (bỏ trống = giữ giá trị mặc định của trường) hoặc n DUP(<…>) */
  strucInit(T){const angle=U=>{if(!U.length||U[0].v!=="<"||U[U.length-1].v!==">")throw E("syntax error","Biến kiểu STRUC viết dạng: ten KIEU <gia_tri, …> (dùng <> để giữ mọi giá trị mặc định) hoặc ten KIEU n DUP(<>).");
      const inner=U.slice(1,-1);return inner.length?splitCommas(inner).map(p=>p.length?this.item(p):null):[]};
    if(!T.length)return{count:null,init:[]};
    const k=T.findIndex(t=>t.u==="DUP");
    if(k>=0){if(T[k+1]?.v!=="("||T[T.length-1].v!==")")throw E("syntax error","DUP của biến STRUC viết dạng n DUP(<>).");return{count:T.slice(0,k),init:angle(T.slice(k+2,-1))}}
    return{count:null,init:angle(T)}}
  dataItems(T){if(!T.length)throw E("syntax error","DB/DW/DD cần ít nhất một giá trị (dùng ? nếu chưa có giá trị).");
    return splitCommas(T).map(p=>this.item(p))}
  item(p){if(!p.length)throw E("syntax error","Thiếu giá trị giữa hai dấu phẩy.");
    const k=p.findIndex(t=>t.u==="DUP");
    if(k>=0){if(p[k+1]?.v!=="("||p[p.length-1].v!==")")throw E("syntax error","DUP viết dạng: số_lần DUP(giá_trị), ví dụ 10 DUP(0) hoặc 5 DUP(?).");
      return{dup:p.slice(0,k),items:splitCommas(p.slice(k+2,-1)).map(q=>this.item(q))}}
    if(p.length===1&&p[0].v==="?"&&p[0].t!=="str")return{q:1};   // '?' trong nháy là ký tự 3Fh (MASM), ? không nháy là "chưa có giá trị"
    if(p.length===1&&p[0].t==="str"&&p[0].v.length>1&&!(this.curW>1&&p[0].v.length===2))return{s:p[0].v};   // DW 'AB' là hằng 2 ký tự (= 4142h), như MASM
    return{T:p}}
  /* ---------- bố trí và sinh mã (một lượt) ---------- */
  newSeg(name,disp,kind){let s=this.segs.find(x=>x.name===name);if(!s){const p=(this.prevSegs||[]).find(x=>x.name===name);
      s={name,disp:disp||name,kind,size:0,lc:0,bytes:[],group:null,inGroup:p?p.inGroup:0,base:p?p.base:0,stack:false};this.segs.push(s)}return s}
  layout(fin){
    const prevSym=this.symCur||Object.create(null);
    this.prevSegs=this.segs||[];this.segs=[];this.groups={};this.cur=null;this.unknown=false;
    this.assume=[null,null,null,null];this.model=null;this.stackSize=0;this.entry=null;this.procs=[];this.codeSize=0;this.segStack=[];
    this.prevSym=prevSym;
    const cur=this.symCur=Object.create(null);
    const defSym=(name,o,ln)=>{const old=cur[name];if(old&&!(o.k==="const"&&o.redef&&old.redef))throw E("symbol redefinition","Tên “"+(o.disp||name)+"” đã được khai báo (dòng "+old.line+").");o.line=ln;cur[name]=o};
    /* ký hiệu chưa gặp trong lượt này: dùng bản của lượt trước (nhảy tới trước, biến khai báo phía sau) */
    this.sym=new Proxy(cur,{get:(t,k)=>k in t?t[k]:prevSym[k],has:(t,k)=>k in t||k in prevSym});
    const simplified=this.stmts.some(s=>s.k==="model"||s.k==="sdata"||s.k==="scode"||s.k==="stack");
    const anySeg=this.stmts.some(s=>s.k==="segment");
    if(simplified&&anySeg)throw this.err0("Không trộn .CODE/.DATA với SEGMENT/ENDS trong cùng chương trình (chọn một cách viết).");
    const model=(this.stmts.find(s=>s.k==="model")||{}).m||(simplified?"SMALL":null);
    this.kind=model==="TINY"||(!simplified&&!anySeg)?"com":"exe";
    if(this.kind==="com"){const s=this.newSeg("_TEXT","_TEXT","code");s.lc=0x100;s.org=0x100;this.cur=s;this.assume=[s,s,s,s];this.flat=true}
    else if(simplified){const c=this.newSeg("_TEXT","_TEXT","code"),d=this.newSeg("_DATA","_DATA","data"),k=this.newSeg("STACK","STACK","stack");k.stack=true;
      const g={name:"DGROUP",members:[d,k]};d.group=g;k.group=g;this.groups.DGROUP=g;this.assume=[g,c,g,g];this.cur=null}
    /* tạo trước mọi đoạn khai báo bằng SEGMENT (theo thứ tự xuất hiện) để ASSUME DS:DATA, MOV AX, DATA dùng được trước khi gặp đoạn DATA */
    if(anySeg)for(const s of this.stmts)if(s.k==="segment"){const sg=this.newSeg(s.name,s.disp,s.stack?"stack":/CODE/i.test(s.cls+s.name)?"code":"data");sg.stack=sg.stack||s.stack}
    const out=[];this.out=out;let ended=false;
    for(const s of this.stmts){const ln=s.line;this.curLine=ln;
      if(ended){if(fin)this.warns.push({line:ln,vi:"Dòng sau END bị bỏ qua."});break}
      try{
        switch(s.k){
          case "model":if(this.model)throw E(".MODEL twice","Chỉ viết .MODEL một lần.");this.model=s.m;break;
          case "stack":this.stackSize=s.T.length?this.cval(s.T):1024;if(this.kind==="com")this.warns.push({line:ln,vi:"Chương trình .COM (.MODEL TINY) không dùng .STACK: DOS đặt SP = FFFEh."});break;
          case "sdata":if(this.kind==="com"){break}this.cur=this.segByName("_DATA");break;
          case "scode":this.cur=this.segByName("_TEXT");break;
          case "segment":{const sg=this.newSeg(s.name,s.disp,s.stack?"stack":/CODE/i.test(s.cls+s.name)?"code":"data");sg.stack=sg.stack||s.stack;if(this.segStack&&this.segStack.length)throw E("nested segment","Đoạn "+s.disp+" mở khi đoạn "+this.cur.disp+" chưa đóng (thiếu ENDS).");this.segStack=[sg];this.cur=sg;break}
          case "ends":if(!this.cur||this.cur.name!==s.name)throw E("segment mismatch","ENDS không khớp tên đoạn đang mở"+(this.cur?" ("+this.cur.disp+")":"")+".");this.segStack=[];this.cur=null;break;
          case "assume":for(const [r,n] of s.L){if(n==="NOTHING"){this.assume[r]=null;continue}const g=this.segByName(n);if(!g)throw E("undefined segment","Chưa có đoạn tên “"+n+"” để ASSUME.");this.assume[r]=g}break;
          case "end":ended=true;if(s.T.length){const v=this.expr(s.T);this.entry=v}break;
          case "org":{this.needSeg();const v=this.cval(s.T);if(v<this.cur.lc&&fin)this.warns.push({line:ln,vi:"ORG lùi địa chỉ về trước: có thể ghi đè mã đã sinh."});this.cur.lc=v;break}
          case "align":{this.needSeg();const n=s.n;while(this.cur.lc%n){this.emit(s,this.cur.kind==="code"?[0x90]:[0],"data")}break}
          case "label":{this.needSeg();defSym(s.name,{k:"label",seg:this.cur,off:this.cur.lc,type:-1,disp:s.disp},ln);this.emit(s,[],"label");break}
          case "lbl":{this.needSeg();defSym(s.name,{k:s.type>0?"var":"label",seg:this.cur,off:this.cur.lc,type:s.type,len:1,disp:s.disp},ln);this.emit(s,[],"label");break}
          case "proc":{this.needSeg();defSym(s.name,{k:"label",seg:this.cur,off:this.cur.lc,type:s.far?-2:-1,disp:s.disp,proc:true},ln);this.procs.push(s);this.emit(s,[],"label");break}
          case "endp":{const p=this.procs.pop();if(!p||p.name!==s.name)throw E("procedure mismatch","ENDP không khớp tên PROC đang mở"+(p?" ("+p.disp+")":"")+".");break}
          case "equ":{const v=this.expr(s.T);if(v.mem&&v.regs)throw E("invalid EQU","EQU không chứa thanh ghi.");
            defSym(s.name,{k:"const",v:v.n,rel:v.rel,sym:v.sym,unk:v.unk,disp:s.disp,redef:s.redef},ln);break}
          case "data":{this.needSeg();const bytes=[];let n1=0;
            for(const it of s.items){const b=this.dataBytes(it,s.w);if(!n1)n1=b.n;bytes.push(...b.v)}
            if(s.name)defSym(s.name,{k:"var",seg:this.cur,off:this.cur.lc,type:s.w,len:s.items.length===1&&s.items[0].dup?this.dupCount(s.items[0]):s.items.length===1&&s.items[0].s?s.items[0].s.length:s.items.length,disp:s.disp},ln);
            this.emit(s,bytes,"data");break}
          case "struc":{let off=0;const F=Object.create(null),list=[];
            for(const f of s.fields){const bytes=[];for(const it of f.items)bytes.push(...this.dataBytes(it,f.w).v);
              const x={off,type:f.w,size:bytes.length,bytes,disp:f.disp};list.push(x);if(f.name){if(F[f.name])throw E("symbol redefinition","Trường “"+f.disp+"” khai báo hai lần trong STRUC "+s.disp+".");F[f.name]=x}off+=bytes.length}
            const st={k:"const",v:off,struc:true,fields:F,list,disp:s.disp};defSym(s.name,st,ln);(this.strucList||(this.strucList=Object.create(null)))[s.name]=st;break}
          case "svar":{this.needSeg();const st=this.sym[s.sname];if(!st||!st.struc)throw E("undefined symbol","Chưa khai báo STRUC "+s.sname+".");
            if(s.init.length>st.list.length)throw E("struc init","STRUC "+st.disp+" có "+st.list.length+" trường, đang ghi "+s.init.length+" giá trị.");
            const one=[];st.list.forEach((f,j)=>{const it=s.init[j];if(!it){one.push(...f.bytes);return}
              const b=this.dataBytes(it,f.type).v;if(b.length>f.size)throw E("struc init","Giá trị cho trường "+(f.disp||"thứ "+(j+1))+" dài "+b.length+" byte, trường chỉ có "+f.size+" byte.");
              one.push(...b,...f.bytes.slice(b.length))});
            const n=s.count?this.cval(s.count):1;if(n<0||n>65535)throw E("invalid DUP","Số lần DUP phải từ 0 đến 65535.");
            const bytes=[];for(let j=0;j<n;j++)bytes.push(...one);
            if(s.name)defSym(s.name,{k:"var",seg:this.cur,off:this.cur.lc,type:st.v,len:n,disp:s.disp,struc:s.sname},ln);
            this.emit(s,bytes,"data");break}
          case "ins":{this.needSeg();let b;try{b=this.encode(s,fin)}catch(e){if(fin&&s.len)this.emit(s,new Array(s.len).fill(0x90),"ins");throw e}s.len=b.length;this.emit(s,b,"ins");break}
        }
      }catch(e){if(!(e instanceof AsmErr))throw e;if(fin){if(s.mac&&!/ \(trong macro/.test(e.vi))e.vi+=" (trong macro "+s.mac+")";this.fail(ln,e)}}}
    if(fin){if(this.procs.length)this.fail(this.procs[this.procs.length-1].line,E("missing ENDP","PROC "+this.procs[this.procs.length-1].disp+" chưa có ENDP."));
      if(this.segStack&&this.segStack.length)this.fail(this.lines.length,E("missing ENDS","Đoạn "+this.segStack[0].disp+" chưa có ENDS."));
      if(!ended)this.warns.push({line:this.lines.length,vi:"Thiếu END ở cuối chương trình (MASM bắt buộc). Trình mô phỏng tạm chạy từ lệnh đầu tiên của đoạn mã."})}
    this.place();
    /* chữ ký của lượt: địa chỉ mọi ký hiệu và kích thước mọi câu lệnh */
    const sig=Object.keys(this.sym).map(k=>{const s=this.sym[k];return k+(s.k==="const"?":"+s.v:"@"+(s.seg?s.seg.name:"")+":"+s.off)}).join(",")+"|"+out.map(o=>o.bytes.length).join(",")+"|"+this.segs.map(s=>s.base).join(",");
    return sig}
  err0(vi){return E("error",vi)}
  needSeg(){if(!this.cur)throw E("no segment","Lệnh/dữ liệu phải nằm trong một đoạn: viết .CODE hoặc .DATA (hoặc TÊN SEGMENT … TÊN ENDS) trước dòng này.")}
  emit(s,bytes,kind){const c=this.cur;const o={line:s.line,seg:c,off:c.lc,bytes,kind,gen:s.gen,mn:kind==="ins"?s.mn:undefined};this.out.push(o);
    for(let i=0;i<bytes.length;i++)c.bytes[c.lc+i]=bytes[i];c.lc+=bytes.length;if(c.lc>c.size)c.size=c.lc;
    if(c.lc>0x10000)throw E("segment too large","Đoạn "+c.disp+" vượt quá 64 KB.");
    if(kind==="ins")this.codeSize+=bytes.length}
  /* đặt các đoạn vào bộ nhớ: theo thứ tự xuất hiện, mỗi đoạn bắt đầu ở biên đoạn (16 byte); DGROUP = _DATA rồi STACK */
  place(){
    if(this.kind==="com"){const s=this.segs[0];s.base=PSP;this.image={base:PSP,end:PSP*16+Math.max(s.size,0x100)};this.cs=PSP;this.ip=0x100;this.ss=PSP;this.sp=0xFFFE;return}
    let st=this.segs.find(s=>s.stack);
    if(st&&st.name==="STACK"&&this.groups.DGROUP){st.size=Math.max(st.size,this.stackSize||(st.size?0:1024));}
    if(!st){st=this.newSeg("STACK","stack","stack");st.stack=true;st.size=1024;st.auto=true}
    let para=PSP+0x10;
    const order=this.groups.DGROUP?[this.segByName("_TEXT"),...this.segs.filter(s=>s.name!=="_TEXT"&&!s.group),this.segByName("_DATA"),this.segByName("STACK")]:this.segs.filter(s=>s!==st).concat([st]);
    for(const s of order){if(!s)continue;
      if(s.group&&s.group.members[0]!==s){const g=s.group,f=g.members[0];s.inGroup=(f.inGroup+((f.size+15)&~15));s.base=g.base+(s.inGroup>>4);para=s.base+((s.size+15)>>4);continue}
      s.base=para;s.inGroup=0;if(s.group)s.group.base=para;para+=(s.size+15)>>4}
    this.image={base:PSP+0x10,end:para*16};
    const code=this.segs.find(s=>s.kind==="code")||this.segs[0];
    this.ss=st.group?st.group.base:st.base;this.sp=((st.group?st.inGroup:0)+st.size)&0xFFFF;if(this.sp===0&&st.size)this.sp=0;
    this.cs=code.base;this.ip=0}
  segValue(v){/* giá trị số hiệu đoạn của biểu thức SEG x / @DATA / tên đoạn */
    const g=v.segof;if(!g)return 0;return g.base!==undefined?g.base:(g.members?g.members[0].base:0)||0}
  expr(T){const P=new Parser(T,this);const v=P.expr();if(!P.done())throw E("syntax error","Không hiểu “"+T.slice(P.i).map(t=>t.v).join(" ")+"”.");return v}
  cval(T){const v=this.expr(T);if(v.rel||v.regs||v.seg)throw E("constant expected","Ở đây cần một hằng số.");return v.n}
  dupCount(it){const n=this.cval(it.dup);return n}
  dataBytes(it,w){const out=[];let n=0;
    if(it.dup){const c=this.cval(it.dup);if(c<0||c>65535)throw E("invalid DUP","Số lần DUP phải từ 0 đến 65535.");
      const one=[];for(const x of it.items)one.push(...this.dataBytes(x,w).v);for(let i=0;i<c;i++)out.push(...one);return{v:out,n:c}}
    if(it.q){for(let i=0;i<w;i++)out.push(0);return{v:out,n:1}}
    if(it.s){if(w!==1)throw E("string too long","Chuỗi dài hơn 2 ký tự chỉ dùng với DB.");for(const ch of it.s){const c=ch.charCodeAt(0);if(c>255)throw E("non-ASCII","Ký tự “"+ch+"” không thuộc bảng mã ASCII/CP437. Viết tiếng Việt không dấu trong chuỗi.");out.push(c)}return{v:out,n:it.s.length}}
    const v=this.expr(it.T);
    if(v.regs)throw E("invalid data","Dữ liệu không chứa thanh ghi.");
    let n0=v.n;
    if(w===1){if(v.rel)throw E("invalid data","Địa chỉ (offset) của nhãn là 16 bit, không vừa DB. Dùng DW.");if(!v.unk&&(n0<-128||n0>255))throw E("value out of range","Giá trị "+n0+" không vừa 1 byte (−128…255).");out.push(n0&255)}
    else if(w===2){if(v.seg)n0=this.segValue(v);if(!v.unk&&(n0<-32768||n0>65535))throw E("value out of range","Giá trị "+n0+" không vừa 1 word (−32768…65535).");out.push(n0&255,(n0>>8)&255)}
    else{if(v.rel){const seg=v.rel.group?v.rel.group.base:v.rel.base;out.push(n0&255,(n0>>8)&255,seg&255,(seg>>8)&255)}else out.push(n0&255,(n0>>8)&255,(n0>>16)&255,(n0>>>24)&255)}
    return{v:out,n:1}}
  /* ---------- sinh mã một lệnh ---------- */
  encode(s,fin){
    const mn=s.mn,O=s.ops.map(p=>operand(p,this)),n=O.length,pre=s.pre!==undefined?[s.pre]:[];
    /* [số] không tiền tố đoạn, không tên (MOV AL, [60h]): dịch thành ô nhớ DS:số như NASM; cảnh báo để học viên viết DS:[60h]
       (quyết định của chủ khóa 06/11/2026; cách MASM/TASM đọc dạng này CẦN XÁC MINH trên công cụ thật) */
    if(fin)O.forEach((o,k)=>{if(o.k==="mem"&&o.base<0&&o.idx<0&&!o.rel&&!o.unk&&o.seg===-1&&s.ops[k].some(t=>t.v==="[")&&!s.ops[k].some(t=>t.t==="id"&&!TYPES[t.u]&&t.u!=="PTR"))
      this.warns.push({line:s.line,vi:`[${X86.hex4?X86.hex4(o.disp):o.disp}h] chỉ có số trong dấu [ ]: trình mô phỏng hiểu là ô nhớ DS:${X86.hex4?X86.hex4(o.disp):o.disp}h. Nên viết DS:[…] (ví dụ MOV AL, DS:[60h]) để mọi trình dịch đều hiểu là ô nhớ.`})});
    const want=(k)=>{if(n!==k)throw E("wrong operand count","Lệnh "+mn+" cần "+(k?k+" toán hạng":"không có toán hạng")+" (đang có "+n+").")};
    const out=(b)=>pre.concat(b);
    if(SIMPLE[mn]){if(mn==="AAM"||mn==="AAD"){if(n>1)want(1);if(n===1){const v=this.imm8(O[0],false);return out([SIMPLE[mn][0],v])}return out(SIMPLE[mn])}
      if(mn==="RETF"||mn==="RETN"){if(n===1){const v=this.immv(O[0]);return out([mn==="RETF"?0xCA:0xC2,v&255,(v>>8)&255])}}
      if(mn==="XLATB"&&n===1)return out(this.segPre(O[0],3).concat([0xD7]));
      want(0);return out(SIMPLE[mn])}
    if(STRK[mn]!==undefined)return out(this.strIns(mn,O));
    if(ALU[mn]!==undefined){want(2);return out(this.alu2(ALU[mn],O[0],O[1],mn))}
    if(SHF[mn]!==undefined){want(2);const [d,c]=O;const w=this.wOf(d,null,mn);let op;
      if(c.k==="imm"&&!c.rel&&c.v===1)op=0xD0;else if(c.k==="r8"&&c.n===1)op=0xD2;
      else if(c.k==="imm")throw E("shift count","8086 chỉ dịch/quay 1 bit (… ,1) hoặc CL bit (… ,CL). Muốn dịch "+c.v+" bit: MOV CL,"+c.v+" rồi "+mn+" …,CL (dịch nhiều bit bằng số tức thời chỉ có từ 80186).");
      else throw E("shift count","Số bit dịch phải là 1 hoặc thanh ghi CL.");
      return out(this.rmOp(op|w,SHF[mn],d))}
    if(JCC[mn]!==undefined||LOOPS[mn]!==undefined){want(1);const t=O[0];const opc=JCC[mn]!==undefined?0x70+JCC[mn]:LOOPS[mn];
      const d=this.relTarget(t,s,2,mn);if(d===null)return out([opc,0]);
      if(d<-128||d>127){if(fin)throw E("jump out of range",`${mn} chỉ nhảy được trong khoảng −128…+127 byte (lệnh nhảy ngắn), nhãn đang cách ${d} byte. Cách sửa: đảo điều kiện để nhảy qua một lệnh JMP (ví dụ thay "JE xa" bằng "JNE tiep / JMP xa / tiep:").`);return out([opc,0])}
      return out([opc,d&255])}
    switch(mn){
      case "MOV":want(2);return out(this.mov(O[0],O[1]));
      case "PUSH":case "POP":{want(1);const a=O[0],P=mn==="PUSH";
        if(a.k==="r16")return out([(P?0x50:0x58)+a.n]);
        if(a.k==="sreg"){if(!P&&a.n===1)throw E("POP CS","Không dùng POP CS (muốn đổi CS thì dùng JMP xa / RETF).");return out([(P?0x06:0x07)|(a.n<<3)])}
        if(a.k==="r8")throw E("operand size",mn+" chỉ làm việc với 16 bit (thanh ghi 16 bit, thanh ghi đoạn hoặc WORD PTR bộ nhớ).");
        if(a.k==="imm")throw E("PUSH immediate","8086 không có PUSH hằng số (lệnh này có từ 80186). Đưa giá trị vào thanh ghi rồi PUSH thanh ghi.");
        if(a.size&&a.size!==2)throw E("operand size",mn+" chỉ làm việc với word (16 bit).");
        return out(P?this.rmOp(0xFF,6,a):this.rmOp(0x8F,0,a))}
      case "XCHG":{want(2);let [a,b]=O;if(a.k==="mem"&&b.k==="mem")throw E("two memory operands","XCHG không đổi chỗ hai ô nhớ với nhau.");
        if(a.k==="imm"||b.k==="imm"||a.k==="sreg"||b.k==="sreg")throw E("invalid operands","XCHG chỉ đổi giữa thanh ghi đa dụng với thanh ghi hoặc ô nhớ.");
        if(a.k==="r16"&&b.k==="r16"&&(a.n===0||b.n===0))return out([0x90+(a.n===0?b.n:a.n)]);
        if(a.k==="mem"){const t=a;a=b;b=t}
        const w=this.wOf(a,b,mn);return out(this.rmOp(0x86|w,a.n,b))}
      case "LEA":case "LDS":case "LES":{want(2);const [r,m]=O;if(r.k!=="r16")throw E("invalid operands",mn+" cần thanh ghi 16 bit ở toán hạng đầu.");if(m.k!=="mem")throw E("invalid operands",mn+" cần toán hạng bộ nhớ ở toán hạng thứ hai (ví dụ "+mn+" "+R16[r.n]+", bien).");
        return out(this.rmOp(mn==="LEA"?0x8D:mn==="LDS"?0xC5:0xC4,r.n,m))}
      case "INC":case "DEC":{want(1);const a=O[0];if(a.k==="r16")return out([(mn==="INC"?0x40:0x48)+a.n]);const w=this.wOf(a,null,mn);return out(this.rmOp(0xFE|w,mn==="INC"?0:1,a))}
      case "NOT":case "NEG":case "MUL":case "IMUL":case "DIV":case "IDIV":{want(1);const a=O[0];if(a.k==="imm")throw E("invalid operand",mn+" không nhận hằng số"+(mn.includes("MUL")||mn.includes("DIV")?" (8086: số nhân/số chia phải là thanh ghi hoặc ô nhớ)":"")+".");
        const w=this.wOf(a,null,mn);return out(this.rmOp(0xF6|w,{NOT:2,NEG:3,MUL:4,IMUL:5,DIV:6,IDIV:7}[mn],a))}
      case "TEST":{want(2);let [a,b]=O;if(a.k==="imm"){const t=a;a=b;b=t}
        if(b.k==="imm"){const w=this.wOf(a,b,mn);if((a.k==="r8"||a.k==="r16")&&a.n===0)return out([0xA8|w].concat(this.immBytes(b,w)));return out(this.rmOp(0xF6|w,0,a).concat(this.immBytes(b,w)))}
        if(a.k==="mem"){const t=a;a=b;b=t}
        if(a.k==="mem")throw E("two memory operands","TEST không so hai ô nhớ với nhau.");
        const w=this.wOf(a,b,mn);return out(this.rmOp(0x84|w,a.n,b))}
      case "IN":{want(2);const [a,p]=O;if(!((a.k==="r8"||a.k==="r16")&&a.n===0))throw E("invalid operands","IN đưa dữ liệu vào AL hoặc AX: IN AL, cổng / IN AX, DX.");const w=a.k==="r16"?1:0;
        if(p.k==="r16"&&p.n===2)return out([0xEC|w]);if(p.k==="imm"){const v=this.immv(p);if(v<0||v>255)throw E("port","Số hiệu cổng viết trực tiếp chỉ từ 0 đến 255; cổng lớn hơn: MOV DX, cổng rồi IN AL, DX.");return out([0xE4|w,v])}
        throw E("invalid operands","Cổng của IN là hằng 0–255 hoặc DX.")}
      case "OUT":{want(2);const [p,a]=O;if(!((a.k==="r8"||a.k==="r16")&&a.n===0))throw E("invalid operands","OUT gửi dữ liệu từ AL hoặc AX: OUT cổng, AL / OUT DX, AX.");const w=a.k==="r16"?1:0;
        if(p.k==="r16"&&p.n===2)return out([0xEE|w]);if(p.k==="imm"){const v=this.immv(p);if(v<0||v>255)throw E("port","Số hiệu cổng viết trực tiếp chỉ từ 0 đến 255; cổng lớn hơn: MOV DX, cổng rồi OUT DX, AL.");return out([0xE6|w,v])}
        throw E("invalid operands","Cổng của OUT là hằng 0–255 hoặc DX.")}
      case "INT":{want(1);const v=this.immv(O[0]);if(v<0||v>255)throw E("interrupt number","Số hiệu ngắt từ 0 đến 255.");return out(v===3?[0xCC]:[0xCD,v])}
      case "RET":{const far=this.procs.length&&this.procs[this.procs.length-1].far;if(n===0)return out([far?0xCB:0xC3]);want(1);const v=this.immv(O[0]);return out([far?0xCA:0xC2,v&255,(v>>8)&255])}
      case "XLAT":return out((n?this.segPre(O[0],3):[]).concat([0xD7]));
      case "JMP":case "CALL":{want(1);return out(this.jmpCall(mn,O[0],s))}
    }
    throw E("unknown instruction","Chưa hỗ trợ lệnh "+mn+".")}
  immv(o){if(o.k!=="imm")throw E("constant expected","Ở đây cần một hằng số.");if(o.seg)return this.segValue(o);return o.v}
  imm8(o){const v=this.immv(o);if(!o.unk&&(v<-128||v>255))throw E("value out of range","Giá trị "+v+" không vừa 8 bit.");return v&255}
  immBytes(o,w){if(o.k!=="imm")throw E("invalid operand","Cần hằng số.");let v=o.seg?this.segValue(o):o.v;
    if(!o.unk){if(w&&(v<-32768||v>65535))throw E("value out of range","Giá trị "+v+" không vừa 16 bit (−32768…65535).");if(!w&&(v<-128||v>255))throw E("value out of range","Giá trị "+v+" không vừa 8 bit (−128…255): toán hạng kia là thanh ghi/ô nhớ 8 bit.")}
    return w?[v&255,(v>>8)&255]:[v&255]}
  /* kích thước (w = 0 byte, 1 word) của cặp toán hạng; báo lỗi khi không khớp hoặc chưa rõ */
  wOf(a,b,mn){const sz=o=>o.k==="r8"?1:o.k==="r16"||o.k==="sreg"?2:o.k==="mem"?o.size:0;let x=sz(a),y=b?sz(b):0;
    if(x===4||y===4)throw E("operand size",mn+" của 8086 làm việc với 8 hoặc 16 bit; biến DWORD cần WORD PTR để lấy từng nửa.");
    if(x&&y&&x!==y)throw E("operand size mismatch","Hai toán hạng khác kích thước ("+(x===1?"8":"16")+" bit và "+(y===1?"8":"16")+" bit). "+(a.k==="mem"||b.k==="mem"?"Dùng BYTE PTR / WORD PTR nếu muốn đọc ô nhớ theo kích thước khác.":""));
    const r=x||y;if(!r)throw E("operand size","Chưa rõ kích thước ô nhớ: thêm BYTE PTR hoặc WORD PTR (ví dụ "+mn+" BYTE PTR [BX], …).");return r===2?1:0}
  /* tiền tố đoạn: có ghi rõ (ES:) hoặc suy ra từ ASSUME khi dùng tên biến */
  segPre(m,def){
    if(typeof m.seg==="object"&&m.seg&&m.seg.seg){const g=m.seg.seg;const r=this.assume.findIndex(x=>x&&x.name===g.name);if(r<0)throw E("no ASSUME","Không có thanh ghi đoạn nào được ASSUME cho "+g.name+".");m.seg=r}
    if(m.seg>=0)return m.seg===def?[]:[0x26|(m.seg<<3)];
    if(m.sym&&m.sym.seg&&!this.flat){const g=m.sym.seg,f=g.group||g;const ok=r=>this.assume[r]&&(this.assume[r].name===g.name||this.assume[r].name===f.name);
      if(ok(def))return[];for(const r of [3,0,2,1])if(ok(r))return[0x26|(r<<3)];
      if(this.final&&!m.unk&&!this.warnedAssume){this.warnedAssume=1;this.warns.push({line:this.curLine,vi:"Biến “"+m.sym.disp+"” nằm trong đoạn "+g.disp+" nhưng chưa có ASSUME tới đoạn đó (MASM sẽ báo lỗi). Trình mô phỏng dùng thanh ghi đoạn mặc định; thêm ASSUME DS:"+g.disp+" và nhớ nạp DS."})}}
    return[]}
  /* byte ModR/M (+ độ dời) cho toán hạng thanh ghi hoặc bộ nhớ; reg = trường reg */
  rmOp(op,reg,m,extra){
    if(m.k==="r8"||m.k==="r16")return[op,0xC0|(reg<<3)|m.n];
    if(m.k!=="mem")throw E("invalid operand","Toán hạng ở đây phải là thanh ghi hoặc ô nhớ.");
    const b=m.base,x=m.idx;let rm,def=3;
    if(b<0&&x<0)rm=-1;else if(b===3)rm=x<0?7:x===6?0:1;else if(b===5){rm=x<0?6:x===6?2:3;def=2}else rm=x===6?4:5;
    let d=m.disp;const rel=!!m.rel||m.unk;
    const seg=this.segPre(m,def);
    if(rm<0){return seg.concat([op,(reg<<3)|6,d&255,(d>>8)&255])}
    if(!rel&&d===0&&rm!==6)return seg.concat([op,(reg<<3)|rm]);
    if(!rel&&d>=-128&&d<=127)return seg.concat([op,0x40|(reg<<3)|rm,d&255]);
    if(!rel&&(d<-32768||d>65535))throw E("displacement","Độ dời "+d+" vượt 16 bit.");
    return seg.concat([op,0x80|(reg<<3)|rm,d&255,(d>>8)&255])}
  alu2(k,a,b,mn){
    if(a.k==="imm")throw E("invalid destination","Toán hạng đích của "+mn+" không thể là hằng số.");
    if(a.k==="sreg"||b.k==="sreg")throw E("segment register",mn+" không dùng thanh ghi đoạn. Chép sang thanh ghi đa dụng trước (MOV AX, DS).");
    if(b.k==="imm"){const w=this.wOf(a,b,mn);const v=b.seg?this.segValue(b):b.v;
      if(w&&!b.unk&&!b.rel&&!b.seg&&(v>=-128&&v<=127||v>=0xFF80&&v<=0xFFFF))return this.rmOp(0x83,k,a).concat([v&255]);   // 0FF80h…0FFFFh = −128…−1: dạng 83 như MASM/JWasm, NASM
      if((a.k==="r8"||a.k==="r16")&&a.n===0)return[(k<<3)|4|w].concat(this.immBytes(b,w));
      return this.rmOp(0x80|w,k,a).concat(this.immBytes(b,w))}
    if(a.k==="mem"&&b.k==="mem")throw E("two memory operands","8086 không có lệnh "+mn+" giữa hai ô nhớ. Đưa một ô vào thanh ghi trước.");
    const w=this.wOf(a,b,mn);
    if(a.k==="mem")return this.rmOp((k<<3)|w,b.n,a);
    return this.rmOp((k<<3)|2|w,a.n,b)}
  mov(a,b){
    if(a.k==="imm")throw E("invalid destination","Toán hạng đích của MOV không thể là hằng số.");
    if(a.k==="sreg"){if(a.n===1)throw E("MOV CS","Không nạp trực tiếp vào CS bằng MOV (CS đổi bằng JMP xa, CALL xa, RETF).");
      if(b.k==="imm")throw E("MOV sreg, imm","8086 không nạp hằng số thẳng vào thanh ghi đoạn. Viết hai lệnh: MOV AX, giá_trị rồi MOV "+SR[a.n]+", AX.");
      if(b.k==="sreg")throw E("MOV sreg, sreg","Không chép trực tiếp giữa hai thanh ghi đoạn. Dùng thanh ghi trung gian (MOV AX, "+SR[b.n]+" / MOV "+SR[a.n]+", AX) hoặc PUSH/POP.");
      if(b.k==="r8"||b.k==="mem"&&b.size&&b.size!==2)throw E("operand size","Thanh ghi đoạn 16 bit chỉ nhận thanh ghi 16 bit hoặc word trong bộ nhớ.");
      return this.rmOp(0x8E,a.n,b)}
    if(b.k==="sreg"){if(a.k==="r8"||a.k==="mem"&&a.size&&a.size!==2)throw E("operand size","Thanh ghi đoạn 16 bit chỉ chép sang thanh ghi 16 bit hoặc word trong bộ nhớ.");return this.rmOp(0x8C,b.n,a)}
    if(b.k==="imm"){const w=this.wOf(a,b,"MOV");if(a.k==="r8"||a.k==="r16")return[0xB0+(w<<3)+a.n].concat(this.immBytes(b,w));return this.rmOp(0xC6|w,0,a).concat(this.immBytes(b,w))}
    if(a.k==="mem"&&b.k==="mem")throw E("two memory operands","8086 không chép trực tiếp từ ô nhớ sang ô nhớ. Dùng thanh ghi trung gian (MOV AX, nguon / MOV dich, AX) hoặc lệnh chuỗi MOVSB/MOVSW.");
    const w=this.wOf(a,b,"MOV");
    /* MOV AL/AX, [địa chỉ trực tiếp] và chiều ngược lại: dạng ngắn A0–A3 */
    const direct=m=>m.k==="mem"&&m.base<0&&m.idx<0;
    if((a.k==="r8"||a.k==="r16")&&a.n===0&&direct(b)){const p=this.segPre(b,3);return p.concat([0xA0|w,b.disp&255,(b.disp>>8)&255])}
    if((b.k==="r8"||b.k==="r16")&&b.n===0&&direct(a)){const p=this.segPre(a,3);return p.concat([0xA2|w,a.disp&255,(a.disp>>8)&255])}
    if(a.k==="mem")return this.rmOp(0x88|w,b.n,a);
    return this.rmOp(0x8A|w,a.n,b)}
  strIns(mn,O){const base=STRK[mn];
    if(!O.length)throw E("operand size",mn+" cần biết kích thước: dùng "+mn+"B (byte) hoặc "+mn+"W (word), hoặc ghi toán hạng (ví dụ MOVS dich, nguon).");
    let w=0,pre=[];const sz=o=>o.k==="mem"?o.size:o.k==="r8"?1:o.k==="r16"?2:0;const s=O.map(sz).find(x=>x)||0;if(!s)throw E("operand size","Chưa rõ kích thước: dùng "+mn+"B hoặc "+mn+"W.");w=s===2?1:0;
    /* toán hạng nguồn DS:SI có thể đổi đoạn; đích ES:DI thì không */
    const src=mn==="MOVS"||mn==="CMPS"?O[mn==="MOVS"?1:0]:mn==="LODS"?O[0]:null;
    if(src&&src.k==="mem")pre=this.segPre(src,3);
    return pre.concat([base|w])}
  /* độ dời tương đối tới nhãn (cho nhảy ngắn/gần); null khi nhãn chưa biết ở lượt này */
  relTarget(t,s,len,mn){
    if(t.k!=="imm"||t.seg)throw E("invalid jump target",mn+" cần tên nhãn đích.");
    if(t.unk)return null;
    if(!t.rel)throw E("invalid jump target",mn+" nhảy tới nhãn (tên:), không tới một số cố định.");
    const fr=this.frameOf(t.rel),cf=this.frameOf(this.cur);
    if(fr.name!==cf.name)throw E("jump to other segment","Nhãn đích ở đoạn khác; "+mn+" chỉ nhảy trong cùng đoạn mã.");
    const here=(this.cur.group?this.cur.inGroup:0)+this.cur.lc;
    return t.v-(here+len)}
  jmpCall(mn,t,s){
    const J=mn==="JMP";
    if(t.k==="r16")return[0xFF,0xC0|((J?4:2)<<3)|t.n];
    if(t.k==="r8"||t.k==="sreg")throw E("invalid operand",mn+" gián tiếp qua thanh ghi cần thanh ghi 16 bit.");
    if(t.k==="mem"){const far=t.size===4||t.dist===-2;if(t.size===1)throw E("operand size","Địa chỉ đích là WORD (gần) hoặc DWORD (xa), không phải BYTE.");
      if(t.sym&&t.sym.k==="label"&&!t.regs&&t.base<0&&t.idx<0&&!t.size)return this.jmpCall(mn,{k:"imm",v:t.disp,rel:t.rel,unk:t.unk,sym:t.sym,dist:t.dist},s);
      return this.rmOp(0xFF,J?(far?5:4):(far?3:2),t)}
    if(t.k!=="imm"||t.seg)throw E("invalid target",mn+" cần tên nhãn hoặc thủ tục.");
    if(!t.rel&&!t.unk)throw E("invalid target",mn+" tới một địa chỉ số cố định chưa hỗ trợ; dùng nhãn.");
    const far=t.dist===-2||(t.sym&&t.sym.type===-2&&t.dist!==-1&&t.dist!==-3);
    if(far){if(t.unk)return J?[0xEA,0,0,0,0]:[0x9A,0,0,0,0];const seg=this.frameOf(t.rel);const sv=seg.base||0;return[J?0xEA:0x9A,t.v&255,(t.v>>8)&255,sv&255,(sv>>8)&255]}
    if(!J){const d=this.relTarget(t,s,3,mn);return d===null?[0xE8,0,0]:[0xE8,d&255,(d>>8)&255]}
    /* JMP: thử nhảy ngắn (2 byte) trước; lượt sau mà xa quá thì chuyển hẳn sang gần (3 byte) và giữ nguyên */
    if(t.dist===-3){const d=this.relTarget(t,s,2,mn);if(d===null)return[0xEB,0];if(d<-128||d>127){if(this.final)throw E("jump out of range","JMP SHORT chỉ tới được −128…+127 byte; bỏ chữ SHORT.");return[0xEB,0]}return[0xEB,d&255]}
    if(!s.long){const d=this.relTarget(t,s,2,mn);if(d===null&&this.pass===0)return[0xEB,0];if(d!==null&&d>=-128&&d<=127)return[0xEB,d&255];s.long=true}
    const d=this.relTarget(t,s,3,mn);return d===null?[0xE9,0,0]:[0xE9,d&255,(d>>8)&255]}
  result(){
    const errors=this.errors.sort((a,b)=>a.line-b.line);
    if(errors.length)return{ok:false,errors,warns:this.warns};
    /* ảnh bộ nhớ của chương trình */
    const segs=this.segs,base=this.image.base,img=new Uint8Array(Math.max(0,this.image.end-base*16));
    for(const s of segs){const a=s.base*16-base*16;s.bytes.forEach((v,i)=>{if(v!==undefined&&a+i>=0&&a+i<img.length)img[a+i]=v})}
    const stmts=this.out.filter(o=>o.bytes.length||o.kind==="label").map(o=>({line:o.line,seg:o.seg.disp,segBase:o.seg.base,off:(o.seg.group?o.seg.inGroup:0)+o.off,frame:o.seg.group?o.seg.group.base:o.seg.base,phys:o.seg.base*16+o.off,bytes:o.bytes,kind:o.kind,gen:!!o.gen,mn:o.mn}));
    const lineAt=new Map();for(const o of stmts)if(o.kind==="ins"&&!lineAt.has(o.phys))lineAt.set(o.phys,o.line);
    let cs=this.cs,ip=this.ip;
    if(this.entry){const e=this.entry;if(!e.rel){this.errors.push({line:this.lines.length,msg:"invalid END",vi:"END chỉ ghi tên nhãn/thủ tục bắt đầu chương trình."});return{ok:false,errors:this.errors,warns:this.warns}}
      cs=this.frameOf(e.rel).base;ip=e.n}
    else{const f=stmts.find(o=>o.kind==="ins");if(f){cs=f.frame;ip=f.off}}
    const syms=Object.keys(Object.assign({},this.prevSym)).length?null:null;
    const S={};for(const k of Object.keys(this.sym)){const x=this.sym[k];S[k]=x.k==="const"?{k:"const",v:x.v,name:x.disp,line:x.line}:{k:x.k,name:x.disp,seg:x.seg.disp,frame:(x.seg.group||x.seg).base,off:this.offOf(x),phys:x.seg.base*16+x.off,type:x.type,len:x.len,line:x.line}}
    const dgroup=this.groups.DGROUP;
    const prog={kind:this.kind,psp:PSP,base,image:img,entry:{cs,ip},ss:this.ss,sp:this.sp,stmts,lineAt,syms:S,codeSize:this.codeSize,
      segs:segs.map(s=>({name:s.disp,base:s.base,frame:(s.group||s).base,size:s.size,kind:s.kind,auto:!!s.auto})),dataSeg:dgroup?dgroup.base:null,lines:this.lines.length};
    if(segs.some(s=>s.auto))this.warns.push({line:1,vi:"Chương trình chưa khai báo ngăn xếp (.STACK hoặc đoạn STACK): trình mô phỏng tự tạo ngăn xếp 1024 byte."});
    return{ok:true,errors:[],warns:this.warns,prog}}
}
X86.assemble=function(src){const A=new Asm(String(src||""));try{return A.run()}catch(e){if(e instanceof AsmErr)return{ok:false,errors:[{line:0,msg:e.message,vi:e.vi}],warns:[]};throw e}};
X86.AsmErr=AsmErr;X86.PSP=PSP;
if(typeof module!=="undefined"&&module.exports)module.exports=X86;
})(typeof window!=="undefined"?window:globalThis);
/* ===================== trình mô phỏng của khóa (platform/js/58-x86-cpu.js) ===================== */
/* ===================== Trình mô phỏng 8086 · phần 2: CPU (máy giả lập) =====================
   Chỉ tải trên trang khóa mpu8086 (build.py: SIM_JS). Không phụ thuộc DOM; chạy được trong Node (tools/x86-test/).
   Tài liệu: docs/TRINH-MO-PHONG-8086.md.

   - Chế độ thực (real mode), bộ nhớ 1 MB, địa chỉ vật lý = đoạn × 16 + độ lệch (quay vòng ở FFFFFh).
   - Đủ các lệnh có tài liệu của 8086 (trừ ESC/FPU: giải mã rồi bỏ qua; WAIT, LOCK: không làm gì).
   - Cờ: tính như 8086/8088; các cờ "không xác định" theo tài liệu Intel được đặt theo một quy tắc cố định
     (bộ test SingleStepTests che các cờ này khi đối chiếu, xem tools/x86-test/sst.js).
   - Chu kỳ: theo bảng thời gian lệnh của 8086 (Intel 8086 Family User's Manual, 1979, bảng thời gian lệnh),
     cộng thời gian tính địa chỉ hiệu dụng (EA), +2 khi có tiền tố đoạn, +4 mỗi lần truy cập word ở địa chỉ lẻ.
     Giả định: không có trạng thái chờ (wait state), bỏ qua ảnh hưởng của hàng đợi lệnh (prefetch queue).
     Lệnh có thời gian thay đổi theo dữ liệu (MUL, IMUL, DIV, IDIV) lấy cận dưới của khoảng; khoảng đầy đủ ghi trong cyc.range.
   - Ngắt: INT n nhảy theo bảng vectơ ngắt (IVT) ở 0000:0000. Môi trường DOS (X86.Dos) cài sẵn các vectơ trỏ tới
     một vùng "ROM" giả (F000:xxxx); khi CPU gọi tới đó, dịch vụ được thực hiện bằng JavaScript (hook).
*/
(function(G){
"use strict";
const X86=G.X86||(G.X86={});
const CF=1,PF=4,AF=16,ZF=64,SF=128,TF=256,IF=512,DF=1024,OF=2048;
const PAR=new Uint8Array(256);for(let i=0;i<256;i++){let b=i,p=1;while(b){p^=b&1;b>>=1}PAR[i]=p?PF:0}
const R16=["AX","CX","DX","BX","SP","BP","SI","DI"],R8=["AL","CL","DL","BL","AH","CH","DH","BH"],SR=["ES","CS","SS","DS"];
/* số chu kỳ tính địa chỉ hiệu dụng (EA) theo trường r/m, mod 0 / có độ dời */
const EA0=[7,8,8,7,5,5,6,5],EAD=[11,12,12,11,9,9,9,9];
const TRAP_CYC=50;   // chu kỳ nhận ngắt chạy từng bước (giả định, CẦN XÁC MINH với bảng thời gian của Intel)
const EA_TXT=["BX+SI","BX+DI","BP+SI","BP+DI","SI","DI","BP","BX"];
class X86Error extends Error{constructor(msg,vi){super(msg);this.vi=vi||msg}}
class CPU{
  constructor(mem){
    this.m=mem||new Uint8Array(0x100000);
    this.r=new Uint16Array(8);this.s=new Uint16Array(4);this.ip=0;this.f=0xF002;
    this.ports=new Uint8Array(65536).fill(0xFF);this.portOut=[];
    this.hooks=null;      // {n: function(cpu)} dịch vụ ngắt viết bằng JS (môi trường DOS)
    this.hookSeg=-1;      // đoạn chứa các điểm vào giả của dịch vụ ngắt
    this.ulog=null;       // nhật ký ghi bộ nhớ để Lùi bước: [địa chỉ, giá trị cũ, …]
    this.acc=null;        // danh sách truy cập bộ nhớ của lệnh vừa chạy (để giao diện tô sáng)
    this.onExec=null;     // (địa chỉ vật lý của lệnh, số byte) sau mỗi lệnh; chỉ X86.grade đặt
    this.halted=false;this.cyc=0;this.total=0;this.odd=0;this.steps=0;
    this.trapped=false;   // lệnh vừa chạy kết thúc bằng bẫy TF (ngắt loại 1)
  }
  /* ---------- thanh ghi ---------- */
  get ax(){return this.r[0]}set ax(v){this.r[0]=v}
  get cx(){return this.r[1]}set cx(v){this.r[1]=v}
  get dx(){return this.r[2]}set dx(v){this.r[2]=v}
  get bx(){return this.r[3]}set bx(v){this.r[3]=v}
  get sp(){return this.r[4]}set sp(v){this.r[4]=v}
  get bp(){return this.r[5]}set bp(v){this.r[5]=v}
  get si(){return this.r[6]}set si(v){this.r[6]=v}
  get di(){return this.r[7]}set di(v){this.r[7]=v}
  get es(){return this.s[0]}set es(v){this.s[0]=v}
  get cs(){return this.s[1]}set cs(v){this.s[1]=v}
  get ss(){return this.s[2]}set ss(v){this.s[2]=v}
  get ds(){return this.s[3]}set ds(v){this.s[3]=v}
  g8(i){return i<4?this.r[i]&255:this.r[i-4]>>8}
  s8(i,v){if(i<4)this.r[i]=(this.r[i]&0xFF00)|(v&255);else this.r[i-4]=(this.r[i-4]&255)|((v&255)<<8)}
  getReg(n){n=String(n).toUpperCase();let i=R16.indexOf(n);if(i>=0)return this.r[i];i=R8.indexOf(n);if(i>=0)return this.g8(i);
    i=SR.indexOf(n);if(i>=0)return this.s[i];if(n==="IP")return this.ip;if(n==="FLAGS")return this.f;return undefined}
  setReg(n,v){n=String(n).toUpperCase();let i=R16.indexOf(n);if(i>=0){this.r[i]=v;return}i=R8.indexOf(n);if(i>=0){this.s8(i,v);return}
    i=SR.indexOf(n);if(i>=0){this.s[i]=v;return}if(n==="IP")this.ip=v&0xFFFF;else if(n==="FLAGS")this.f=(v&0x0FD5)|0xF002}
  /* ---------- bộ nhớ ---------- */
  pa(seg,off){return ((seg<<4)+(off&0xFFFF))&0xFFFFF}
  rd8(seg,off){const a=this.pa(seg,off);if(this.acc)this.acc.push(["r",a,1]);return this.m[a]}
  rd16(seg,off){const a=this.pa(seg,off),b=this.pa(seg,off+1);if(a&1)this.odd++;if(this.acc)this.acc.push(["r",a,2]);return this.m[a]|(this.m[b]<<8)}
  wr8(seg,off,v){const a=this.pa(seg,off);if(this.ulog)this.ulog.push(a,this.m[a]);this.m[a]=v;if(this.acc)this.acc.push(["w",a,1])}
  wr16(seg,off,v){const a=this.pa(seg,off),b=this.pa(seg,off+1);if(a&1)this.odd++;if(this.ulog)this.ulog.push(a,this.m[a],b,this.m[b]);this.m[a]=v&255;this.m[b]=(v>>8)&255;if(this.acc)this.acc.push(["w",a,2])}
  f8(){const v=this.m[this.pa(this.s[1],this.ip)];this.ip=(this.ip+1)&0xFFFF;this.fl++;return v}
  f16(){const v=this.f8();return v|(this.f8()<<8)}
  push(v){this.r[4]=(this.r[4]-2)&0xFFFF;this.wr16(this.s[2],this.r[4],v)}
  pop(){const v=this.rd16(this.s[2],this.r[4]);this.r[4]=(this.r[4]+2)&0xFFFF;return v}
  /* ---------- cờ ---------- */
  setF(b,on){if(on)this.f|=b;else this.f&=~b}
  szp8(r){this.f=(this.f&~(SF|ZF|PF))|(r&0x80?SF:0)|(r&255?0:ZF)|PAR[r&255]}
  szp16(r){this.f=(this.f&~(SF|ZF|PF))|(r&0x8000?SF:0)|(r&0xFFFF?0:ZF)|PAR[r&255]}
  cond(c){const f=this.f;let r;
    switch(c>>1){case 0:r=f&OF;break;case 1:r=f&CF;break;case 2:r=f&ZF;break;case 3:r=f&(CF|ZF);break;case 4:r=f&SF;break;case 5:r=f&PF;break;
      case 6:r=!(f&SF)!==!(f&OF);break;default:r=(f&ZF)||(!(f&SF)!==!(f&OF))}
    r=!!r;return c&1?!r:r}
  /* phép toán ALU: 0 ADD, 1 OR, 2 ADC, 3 SBB, 4 AND, 5 SUB, 6 XOR, 7 CMP; w = 1 nếu 16 bit */
  alu(op,a,b,w){const M=w?0xFFFF:0xFF,H=w?0x8000:0x80;let r,f=this.f&~(CF|PF|AF|ZF|SF|OF);
    switch(op){
      case 0:case 2:{const c=op===2&&(this.f&CF)?1:0;r=a+b+c;if(r>M)f|=CF;if((a^b^r)&16)f|=AF;if((a^r)&(b^r)&H)f|=OF;break}
      case 3:case 5:case 7:{const c=op===3&&(this.f&CF)?1:0;r=a-b-c;if(r<0)f|=CF;if((a^b^r)&16)f|=AF;if((a^b)&(a^r)&H)f|=OF;break}
      case 1:r=a|b;break;case 4:r=a&b;break;default:r=a^b}
    r&=M;f|=(r&H?SF:0)|(r?0:ZF)|PAR[r&255];this.f=f;return r}
  /* ---------- giải mã ModR/M ---------- */
  modrm(){const b=this.f8(),mod=b>>6,reg=(b>>3)&7,rm=b&7,o=this.o;o.mod=mod;o.reg=reg;o.rm=rm;
    if(mod===3){o.isReg=true;o.ea=0;return}
    o.isReg=false;let off,seg=3;
    if(mod===0&&rm===6){off=this.f16();o.eac=6;o.eat="d16"}
    else{switch(rm){case 0:off=this.r[3]+this.r[6];break;case 1:off=this.r[3]+this.r[7];break;case 2:off=this.r[5]+this.r[6];seg=2;break;case 3:off=this.r[5]+this.r[7];seg=2;break;
        case 4:off=this.r[6];break;case 5:off=this.r[7];break;case 6:off=this.r[5];seg=2;break;default:off=this.r[3]}
      if(mod===1){let d=this.f8();if(d&0x80)d-=256;off+=d;o.eac=EAD[rm];o.eat=EA_TXT[rm]+"+d8"}
      else if(mod===2){off+=this.f16();o.eac=EAD[rm];o.eat=EA_TXT[rm]+"+d16"}
      else{o.eac=EA0[rm];o.eat=EA_TXT[rm]}}
    if(this.segOv>=0){seg=this.segOv;o.eac+=2}
    o.seg=seg;o.off=off&0xFFFF;this.ea=o}
  rm8(){const o=this.o;return o.isReg?this.g8(o.rm):this.rd8(this.s[o.seg],o.off)}
  rm16(){const o=this.o;return o.isReg?this.r[o.rm]:this.rd16(this.s[o.seg],o.off)}
  wrm8(v){const o=this.o;if(o.isReg)this.s8(o.rm,v);else this.wr8(this.s[o.seg],o.off,v)}
  wrm16(v){const o=this.o;if(o.isReg)this.r[o.rm]=v;else this.wr16(this.s[o.seg],o.off,v)}
  rmw(w){return w?this.rm16():this.rm8()}
  wrmw(w,v){if(w)this.wrm16(v);else this.wrm8(v)}
  regw(w,i){return w?this.r[i]:this.g8(i)}
  setregw(w,i,v){if(w)this.r[i]=v;else this.s8(i,v)}
  dseg(){return this.s[this.segOv>=0?this.segOv:3]}
  /* ---------- ngắt ---------- */
  interrupt(n,retIP){this.push(this.f);this.push(this.s[1]);this.push(retIP);this.f&=~(IF|TF);
    this.ip=this.m[n*4]|(this.m[n*4+1]<<8);this.s[1]=this.m[n*4+2]|(this.m[n*4+3]<<8)}
  /* ngắt loại 1 (single-step) sau lệnh vừa chạy khi TF = 1: cất FLAGS (TF còn 1), CS, IP của lệnh kế tiếp, xóa IF và TF, nhảy theo vectơ 1.
     Vectơ 1 còn trỏ vào ROM giả của DOS (trình phục vụ mặc định chỉ có IRET): không làm gì, như DOS không có debugger.
     50 chu kỳ: giả định theo bảng thời gian Intel (CẦN XÁC MINH). */
  trap(){this.trapped=true;const vip=this.m[4]|(this.m[5]<<8),vcs=this.m[6]|(this.m[7]<<8);
    if(this.hooks&&vcs===this.hookSeg&&vip===4)return TRAP_CYC;
    this.interrupt(1,this.ip);this.jumped=true;return TRAP_CYC}
  divErr(){this.divFault=true;const h=this.hooks&&this.hooks[0];
    if(h&&(this.m[2]|(this.m[3]<<8))===this.hookSeg&&(this.m[0]|(this.m[1]<<8))===0){this.intNo=0;h(this);return}   // vectơ 0 chưa bị đổi: dịch vụ giả của DOS báo lỗi chia
    this.interrupt(0,this.ip)}
  /* ---------- chạy một lệnh ----------
     Trả về số chu kỳ của lệnh (this.cyc). Lệnh có tiền tố REP chạy hết mọi lần lặp trong một bước (như CPU thật: một lệnh);
     khi TF = 1, mỗi bước chỉ chạy một lần lặp rồi bẫy (this.repCut: lệnh chưa xong, IP ở tiền tố REP). */
  step(){
    const o=this.o={};this.ea=null;this.jumped=false;this.cycR=null;this.repN=-1;this.intNo=-1;this.segOv=-1;this.rep=0;this.odd=0;this.divFault=false;this.note=null;
    this.startCS=this.s[1];this.startIP=this.ip;this.fl=0;this.trapped=false;this.noTrap=false;
    /* bẫy chạy từng bước: TF được lấy lúc BẮT ĐẦU lệnh (POPF/IRET đặt TF thì bẫy sau lệnh kế tiếp; lệnh vào trình phục vụ đã xóa TF
       nên trình phục vụ không bị bẫy); không bẫy giữa MOV SS / POP SS và lệnh kế tiếp (CPU chưa nhận ngắt ở chỗ đó, giống chặn INTR
       ở 59-x86-trainer.js) — bẫy xảy ra sau lệnh kế tiếp */
    const tf=(this.f&TF)!==0;
    let c=0,pre=0,lock=0,op;
    this.repAt=-1;this.repCut=false;
    /* REP + TF: bẫy sau MỖI lần lặp (REP ngắt được giữa hai lần lặp). Lệnh chưa xong thì IP quay về byte tiền tố REP, CX/SI/DI giữ
       trạng thái dở dang; IRET của trình phục vụ chạy tiếp lệnh từ tiền tố đó (tiền tố đứng TRƯỚC REP bị bỏ). CẦN XÁC MINH với Intel. */
    this.tfStep=tf;
    for(;;){const at=this.ip;op=this.f8();
      if(op===0x26||op===0x2E||op===0x36||op===0x3E){this.segOv=(op>>3)&3;pre++;continue}
      if(op===0xF2||op===0xF3){this.rep=op;this.repAt=at;pre++;continue}
      if(op===0xF0||op===0xF1){lock=1;pre++;continue}
      break}
    this.opcode=op;
    c=this.exec(op);
    if(lock)c+=2;
    if(this.ea&&!this.ea.isReg)c+=this.ea.eac;
    c+=4*this.odd;
    if(tf&&!this.halted&&!this.noTrap&&!(op===0x17||(op===0x8E&&o.reg===2)))c+=this.trap();
    this.cyc=c;this.total+=c;this.steps++;
    if(this.onExec)this.onExec(this.pa(this.startCS,this.startIP),this.fl);   // chấm bài: biết byte nào được chạy như lệnh (đếm DB/DW chạy như lệnh vào số byte mã)
    return c}
  exec(op){
    const o=this.o;let w=op&1,v,a,b,t;
    /* nhóm ALU 00–3F (trừ các ô tiền tố, PUSH/POP đoạn, DAA…) */
    if(op<0x40&&(op&7)<6){const k=op>>3;
      switch(op&7){
        case 0:case 1:this.modrm();a=this.rmw(w);b=this.regw(w,o.reg);v=this.alu(k,a,b,w);if(k!==7)this.wrmw(w,v);return o.isReg?3:k===7?9:16;
        case 2:case 3:this.modrm();a=this.regw(w,o.reg);b=this.rmw(w);v=this.alu(k,a,b,w);if(k!==7)this.setregw(w,o.reg,v);return o.isReg?3:9;
        case 4:b=this.f8();v=this.alu(k,this.r[0]&255,b,0);if(k!==7)this.s8(0,v);return 4;
        case 5:b=this.f16();v=this.alu(k,this.r[0],b,1);if(k!==7)this.r[0]=v;return 4}}
    if(op>=0x40&&op<0x48){a=this.r[op&7];const cf=this.f&CF;v=this.alu(0,a,1,1);this.f=(this.f&~CF)|cf;this.r[op&7]=v;return 2}
    if(op>=0x48&&op<0x50){a=this.r[op&7];const cf=this.f&CF;v=this.alu(5,a,1,1);this.f=(this.f&~CF)|cf;this.r[op&7]=v;return 2}
    if(op>=0x50&&op<0x58){if(op===0x54){this.r[4]=(this.r[4]-2)&0xFFFF;this.wr16(this.s[2],this.r[4],this.r[4])}else this.push(this.r[op&7]);return 11}
    if(op>=0x58&&op<0x60){this.r[op&7]=this.pop();return 8}
    if(op>=0x60&&op<0x80){b=this.f8();if(b&0x80)b-=256;if(this.cond(op&15)){this.ip=(this.ip+b)&0xFFFF;this.jumped=true;return 16}return 4}
    if(op>=0x91&&op<0x98){t=this.r[0];this.r[0]=this.r[op&7];this.r[op&7]=t;return 3}
    if(op>=0xB0&&op<0xB8){this.s8(op&7,this.f8());return 4}
    if(op>=0xB8&&op<0xC0){this.r[op&7]=this.f16();return 4}
    if(op>=0xD8&&op<0xE0){this.modrm();return o.isReg?2:8}   // ESC (lệnh cho bộ đồng xử lý 8087): không mô phỏng FPU
    switch(op){
      case 0x06:case 0x0E:case 0x16:case 0x1E:this.push(this.s[(op>>3)&3]);return 10;
      case 0x07:case 0x0F:case 0x17:case 0x1F:this.s[(op>>3)&3]=this.pop();return 8;
      case 0x27:case 0x2F:{const al=this.r[0]&255,cf=this.f&CF,af=this.f&AF;let r=al,f=this.f&~(CF|AF);
        /* 8086/8088: khi AF = 1, ngưỡng của nửa cao là 9Fh chứ không phải 99h (đã đối chiếu SingleStepTests) */
        const lim=af?0x9F:0x99;
        if(op===0x27){if((al&15)>9||af){r+=6;f|=AF}if(al>lim||cf){r+=0x60;f|=CF}}
        else{if((al&15)>9||af){r-=6;f|=AF}if(al>lim||cf){r-=0x60;f|=CF}}
        r&=255;f&=~OF;if(op===0x27){if(!(al&0x80)&&(r&0x80))f|=OF}else{if((al&0x80)&&!(r&0x80))f|=OF}
        this.f=f;this.s8(0,r);this.szp8(r);return 4}
      case 0x37:case 0x3F:{const al=this.r[0]&255;let ah=this.r[0]>>8,r=al;
        if((al&15)>9||(this.f&AF)){if(op===0x37){r=al+6;ah=(ah+1)&255}else{r=al-6;ah=(ah-1)&255}this.f|=AF|CF}else this.f&=~(AF|CF);
        this.szp8(r&255);this.f&=~OF;this.r[0]=(ah<<8)|(r&15);return 4}  // AAA/AAS (8086: AL±6, AH±1)
      case 0x80:case 0x81:case 0x82:case 0x83:{this.modrm();a=this.rmw(w);b=op===0x81?this.f16():this.f8();if(op===0x83&&(b&0x80))b|=0xFF00;
        v=this.alu(o.reg,a,b,w);if(o.reg!==7)this.wrmw(w,v);return o.isReg?4:o.reg===7?10:17}
      case 0x84:case 0x85:this.modrm();this.alu(4,this.rmw(w),this.regw(w,o.reg),w);return o.isReg?3:9;
      case 0x86:case 0x87:this.modrm();a=this.rmw(w);b=this.regw(w,o.reg);this.setregw(w,o.reg,a);this.wrmw(w,b);return o.isReg?4:17;
      case 0x88:case 0x89:this.modrm();this.wrmw(w,this.regw(w,o.reg));return o.isReg?2:9;
      case 0x8A:case 0x8B:this.modrm();this.setregw(w,o.reg,this.rmw(w));return o.isReg?2:8;
      case 0x8C:this.modrm();this.wrm16(this.s[o.reg&3]);return o.isReg?2:9;
      case 0x8D:this.modrm();if(o.isReg){this.r[o.reg]=this.lastEA||0;return 2}this.r[o.reg]=o.off;this.lastEA=o.off;return 2;
      case 0x8E:this.modrm();this.s[o.reg&3]=this.rm16();return o.isReg?2:8;
      case 0x8F:{v=this.pop();this.modrm();this.wrm16(v);return o.isReg?8:17}
      case 0x90:return 3;
      case 0x98:this.r[0]=(this.r[0]&0x80)?(this.r[0]|0xFF00):(this.r[0]&0xFF);return 2;
      case 0x99:this.r[2]=(this.r[0]&0x8000)?0xFFFF:0;return 5;
      case 0x9A:{const nip=this.f16(),ncs=this.f16();this.push(this.s[1]);this.push(this.ip);this.s[1]=ncs;this.ip=nip;this.jumped=true;return 28}
      case 0x9B:return 3;
      case 0x9C:this.push(this.f);return 10;
      case 0x9D:this.f=(this.pop()&0x0FD5)|0xF002;return 8;
      case 0x9E:this.f=(this.f&0xFF00)|((this.r[0]>>8)&0xD5)|2;return 4;
      case 0x9F:this.s8(4,this.f&255);return 4;
      case 0xA0:this.s8(0,this.rd8(this.dseg(),this.f16()));return this.segOv>=0?12:10;
      case 0xA1:this.r[0]=this.rd16(this.dseg(),this.f16());return this.segOv>=0?12:10;
      case 0xA2:this.wr8(this.dseg(),this.f16(),this.r[0]&255);return this.segOv>=0?12:10;
      case 0xA3:this.wr16(this.dseg(),this.f16(),this.r[0]);return this.segOv>=0?12:10;
      case 0xA4:case 0xA5:case 0xA6:case 0xA7:case 0xAA:case 0xAB:case 0xAC:case 0xAD:case 0xAE:case 0xAF:return this.str(op);
      case 0xA8:this.alu(4,this.r[0]&255,this.f8(),0);return 4;
      case 0xA9:this.alu(4,this.r[0],this.f16(),1);return 4;
      case 0xC0:case 0xC2:{b=this.f16();this.ip=this.pop();this.r[4]=(this.r[4]+b)&0xFFFF;this.jumped=true;return 12}
      case 0xC1:case 0xC3:this.ip=this.pop();this.jumped=true;return 8;
      case 0xC4:case 0xC5:{this.modrm();if(o.isReg)return 16;const lo=this.rd16(this.s[o.seg],o.off),hi=this.rd16(this.s[o.seg],o.off+2);this.r[o.reg]=lo;this.s[op===0xC4?0:3]=hi;return 16}
      case 0xC6:this.modrm();this.wrm8(this.f8());return o.isReg?4:10;
      case 0xC7:this.modrm();this.wrm16(this.f16());return o.isReg?4:10;
      case 0xC8:case 0xCA:{b=this.f16();this.ip=this.pop();this.s[1]=this.pop();this.r[4]=(this.r[4]+b)&0xFFFF;this.jumped=true;return 17}
      case 0xC9:case 0xCB:this.ip=this.pop();this.s[1]=this.pop();this.jumped=true;return 18;
      case 0xCC:return this.intn(3,52);
      case 0xCD:return this.intn(this.f8(),51);
      case 0xCE:if(this.f&OF)return this.intn(4,53);return 4;
      case 0xCF:this.ip=this.pop();this.s[1]=this.pop();this.f=(this.pop()&0x0FD5)|0xF002;this.jumped=true;return 24;
      case 0xD0:case 0xD1:case 0xD2:case 0xD3:{this.modrm();const n=op<0xD2?1:this.r[1]&255;a=this.rmw(w);v=this.shift(o.reg,a,n,w);this.wrmw(w,v);
        return op<0xD2?(o.isReg?2:15):(o.isReg?8:20)+4*n}
      case 0xD4:{b=this.f8();const al=this.r[0]&255;if(b===0){this.szp8(0);this.divErr();return 83}const q=Math.floor(al/b),r=al%b;this.r[0]=(q<<8)|r;this.szp8(r);this.f&=~(CF|OF|AF);return 83}
      case 0xD5:{b=this.f8();const al=this.r[0]&255,ah=this.r[0]>>8;const r=this.alu(0,al,(ah*b)&255,0);this.r[0]=r;return 60}
      case 0xD6:this.s8(0,this.f&CF?0xFF:0);return 4; // SALC (không có trong tài liệu)
      case 0xD7:this.s8(0,this.rd8(this.dseg(),(this.r[3]+(this.r[0]&255))&0xFFFF));return 11;
      case 0xE0:case 0xE1:case 0xE2:{b=this.f8();if(b&0x80)b-=256;this.r[1]=(this.r[1]-1)&0xFFFF;const z=!!(this.f&ZF);
        const go=this.r[1]!==0&&(op===0xE2||(op===0xE1?z:!z));if(go){this.ip=(this.ip+b)&0xFFFF;this.jumped=true}
        return op===0xE2?(go?17:5):op===0xE1?(go?18:6):(go?19:5)}
      case 0xE3:{b=this.f8();if(b&0x80)b-=256;if(this.r[1]===0){this.ip=(this.ip+b)&0xFFFF;this.jumped=true;return 18}return 6}
      case 0xE4:this.s8(0,this.inp(this.f8()));return 10;
      case 0xE5:{const p=this.f8();this.r[0]=this.inp(p)|(this.inp((p+1)&0xFFFF)<<8);return 10}
      case 0xE6:this.outp(this.f8(),this.r[0]&255);return 10;
      case 0xE7:{const p=this.f8();this.outp(p,this.r[0]&255);this.outp((p+1)&0xFFFF,this.r[0]>>8);return 10}
      case 0xE8:{b=this.f16();this.push(this.ip);this.ip=(this.ip+b)&0xFFFF;this.jumped=true;return 19}
      case 0xE9:{b=this.f16();this.ip=(this.ip+b)&0xFFFF;this.jumped=true;return 15}
      case 0xEA:{const nip=this.f16(),ncs=this.f16();this.ip=nip;this.s[1]=ncs;this.jumped=true;return 15}
      case 0xEB:{b=this.f8();if(b&0x80)b-=256;this.ip=(this.ip+b)&0xFFFF;this.jumped=true;return 15}
      case 0xEC:this.s8(0,this.inp(this.r[2]));return 8;
      case 0xED:this.r[0]=this.inp(this.r[2])|(this.inp((this.r[2]+1)&0xFFFF)<<8);return 8;
      case 0xEE:this.outp(this.r[2],this.r[0]&255);return 8;
      case 0xEF:this.outp(this.r[2],this.r[0]&255);this.outp((this.r[2]+1)&0xFFFF,this.r[0]>>8);return 8;
      case 0xF4:this.halted=true;return 2;
      case 0xF5:this.f^=CF;return 2;
      case 0xF6:case 0xF7:return this.grp3(w);
      case 0xF8:this.f&=~CF;return 2;case 0xF9:this.f|=CF;return 2;
      case 0xFA:this.f&=~IF;return 2;case 0xFB:this.f|=IF;return 2;
      case 0xFC:this.f&=~DF;return 2;case 0xFD:this.f|=DF;return 2;
      case 0xFE:{this.modrm();if(o.reg>1)throw this.bad(op);a=this.rm8();const cf=this.f&CF;v=this.alu(o.reg?5:0,a,1,0);this.f=(this.f&~CF)|cf;this.wrm8(v);return o.isReg?3:15}
      case 0xFF:return this.grp5();
    }
    throw this.bad(op)}
  bad(op){return new X86Error("bad opcode "+op.toString(16),`CPU gặp mã lệnh ${op.toString(16).toUpperCase().padStart(2,"0")}h không có trong tập lệnh 8086 (tại ${hex4(this.startCS)}:${hex4(this.startIP)}). Thường do chương trình chạy lạc vào vùng dữ liệu: kiểm tra lệnh nhảy, CALL/RET và lệnh kết thúc chương trình (MOV AH,4Ch / INT 21h).`)}
  inp(p){return this.ports[p&0xFFFF]}
  outp(p,v){this.portOut.push([p&0xFFFF,v&255]);if(this.portOut.length>256)this.portOut.shift()}
  intn(n,c){
    const h=this.hooks&&this.hooks[n];
    const vip=this.m[n*4]|(this.m[n*4+1]<<8),vcs=this.m[n*4+2]|(this.m[n*4+3]<<8);
    if(h&&vcs===this.hookSeg&&vip===n*4){this.intNo=n;const r=h(this);return c+(r||0)}   // dịch vụ DOS/BIOS giả: chạy bằng JS, không đếm chu kỳ của dịch vụ
    this.interrupt(n,this.ip);this.jumped=true;return c}
  shift(k,a,n,w){if(!n)return a;const H=w?0x8000:0x80,M=w?0xFFFF:0xFF,B=w?16:8;let f=this.f,cf=f&CF?1:0,of=0;
    for(let i=0;i<n;i++){
      switch(k){
        case 0:cf=a&H?1:0;a=((a<<1)|cf)&M;of=((a&H)?1:0)^cf;break;                          // ROL
        case 1:cf=a&1;a=(a>>1)|(cf?H:0);of=((a>>(B-1))^(a>>(B-2)))&1;break;                // ROR
        case 2:{const nc=a&H?1:0;a=((a<<1)|cf)&M;cf=nc;of=((a&H)?1:0)^cf;break}             // RCL
        case 3:{const nc=a&1;a=(a>>1)|(cf?H:0);cf=nc;of=((a>>(B-1))^(a>>(B-2)))&1;break}   // RCR
        case 4:case 6:cf=a&H?1:0;a=(a<<1)&M;of=((a&H)?1:0)^cf;break;                         // SHL/SAL (6: bí danh)
        case 5:cf=a&1;of=a&H?1:0;a>>=1;break;                                                // SHR
        default:cf=a&1;a=(a>>1)|(a&H);of=0}}                                                 // SAR
    f=(f&~(CF|OF))|(cf?CF:0)|(of?OF:0);
    if(k>=4)f=(f&~(SF|ZF|PF|AF))|(a&H?SF:0)|(a?0:ZF)|PAR[a&255];
    this.f=f;return a}
  grp3(w){const o=this.o;this.modrm();const k=o.reg;let a,b,v;
    switch(k){
      case 0:case 1:a=this.rmw(w);b=w?this.f16():this.f8();this.alu(4,a,b,w);return o.isReg?5:11;
      case 2:this.wrmw(w,(~this.rmw(w))&(w?0xFFFF:0xFF));return o.isReg?3:16;
      case 3:{a=this.rmw(w);v=this.alu(5,0,a,w);this.wrmw(w,v);return o.isReg?3:16}
      case 4:{a=this.rmw(w);if(w){const r=this.r[0]*a;this.r[0]=r&0xFFFF;this.r[2]=(r>>>16)&0xFFFF;this.flagsMul(this.r[2]!==0,this.r[2]);this.cycR=[118,133,124,139];return o.isReg?118:124}
        const r=(this.r[0]&255)*a;this.r[0]=r;this.flagsMul((r>>8)!==0,r>>8);this.cycR=[70,77,76,83];return o.isReg?70:76}
      case 5:{a=this.rmw(w);if(w){const r=sx16(this.r[0])*sx16(a);this.r[0]=r&0xFFFF;this.r[2]=(r>>16)&0xFFFF;this.flagsMul(r!==sx16(r&0xFFFF),this.r[2]);this.cycR=[128,154,134,160];return o.isReg?128:134}
        const r=sx8(this.r[0]&255)*sx8(a);this.r[0]=r&0xFFFF;this.flagsMul(r!==sx8(r&255),(r>>8)&255);this.cycR=[80,98,86,104];return o.isReg?80:86}
      case 6:{a=this.rmw(w);if(w){const n=this.r[2]*65536+this.r[0];if(a===0||Math.floor(n/a)>0xFFFF){this.divErr();this.cycR=[144,162,150,168];return o.isReg?144:150}
          this.r[0]=Math.floor(n/a);this.r[2]=n%a;this.cycR=[144,162,150,168];return o.isReg?144:150}
        const n=this.r[0];if(a===0||Math.floor(n/a)>0xFF){this.divErr();this.cycR=[80,90,86,96];return o.isReg?80:86}
        this.r[0]=((n%a)<<8)|Math.floor(n/a);this.cycR=[80,90,86,96];return o.isReg?80:86}
      default:{a=this.rmw(w);if(w){const n=(this.r[2]<<16)|this.r[0],d=sx16(a);let q=d?Math.trunc(n/d):0;if(this.rep)q=-q;
          if(d===0||q>32767||q<-32767){this.divErr();this.cycR=[165,184,171,190];return o.isReg?165:171}
          this.r[0]=q&0xFFFF;this.r[2]=(n-Math.trunc(n/d)*d)&0xFFFF;this.cycR=[165,184,171,190];return o.isReg?165:171}
        const n=sx16(this.r[0]),d=sx8(a);let q=d?Math.trunc(n/d):0;if(this.rep)q=-q;
        if(d===0||q>127||q<-127){this.divErr();this.cycR=[101,112,107,118];return o.isReg?101:107}
        this.r[0]=((((n-Math.trunc(n/d)*d))&255)<<8)|(q&255);this.cycR=[101,112,107,118];return o.isReg?101:107}}}
  flagsMul(hi,h){this.setF(CF|OF,hi);this.szp8(h&255)}
  grp5(){const o=this.o;this.modrm();let a,v;
    switch(o.reg){
      case 0:case 1:{a=this.rm16();const cf=this.f&CF;v=this.alu(o.reg?5:0,a,1,1);this.f=(this.f&~CF)|cf;this.wrm16(v);return o.isReg?2:15}
      case 2:a=this.rm16();this.push(this.ip);this.ip=a;this.jumped=true;return o.isReg?16:21;
      case 3:{if(o.isReg)return 37;const ni=this.rd16(this.s[o.seg],o.off),nc=this.rd16(this.s[o.seg],o.off+2);this.push(this.s[1]);this.push(this.ip);this.ip=ni;this.s[1]=nc;this.jumped=true;return 37}
      case 4:this.ip=this.rm16();this.jumped=true;return o.isReg?11:18;
      case 5:{if(o.isReg)return 24;const ni=this.rd16(this.s[o.seg],o.off),nc=this.rd16(this.s[o.seg],o.off+2);this.ip=ni;this.s[1]=nc;this.jumped=true;return 24}
      default:{if(o.isReg&&o.rm===4){this.r[4]=(this.r[4]-2)&0xFFFF;this.wr16(this.s[2],this.r[4],this.r[4]);return 11}a=this.rm16();this.push(a);return o.isReg?11:16}}}
  /* lệnh chuỗi; có tiền tố REP thì lặp tới khi CX = 0 (CMPS/SCAS: thêm điều kiện ZF) */
  str(op){const w=op&1,d=this.f&DF?-1:1,step=(w?2:1)*d,src=this.dseg(),kind=op&0xFE;
    const T={0xA4:[18,17],0xA6:[22,22],0xAA:[11,10],0xAC:[12,13],0xAE:[15,15]}[kind];
    const one=()=>{let a,b;
      switch(kind){
        case 0xA4:this.wrmw16(w,this.s[0],this.r[7],w?this.rd16(src,this.r[6]):this.rd8(src,this.r[6]));this.r[6]+=step;this.r[7]+=step;break;
        case 0xA6:a=w?this.rd16(src,this.r[6]):this.rd8(src,this.r[6]);b=w?this.rd16(this.s[0],this.r[7]):this.rd8(this.s[0],this.r[7]);this.alu(7,a,b,w);this.r[6]+=step;this.r[7]+=step;break;
        case 0xAA:this.wrmw16(w,this.s[0],this.r[7],w?this.r[0]:this.r[0]&255);this.r[7]+=step;break;
        case 0xAC:if(w)this.r[0]=this.rd16(src,this.r[6]);else this.s8(0,this.rd8(src,this.r[6]));this.r[6]+=step;break;
        default:b=w?this.rd16(this.s[0],this.r[7]):this.rd8(this.s[0],this.r[7]);this.alu(7,w?this.r[0]:this.r[0]&255,b,w);this.r[7]+=step}};
    if(!this.rep){one();return T[0]+(this.segOv>=0?2:0)}
    let n=0;const cmp=kind===0xA6||kind===0xAE;
    while(this.r[1]!==0){one();this.r[1]--;n++;if(cmp&&(this.rep===0xF3?!(this.f&ZF):(this.f&ZF)))break;
      if(this.tfStep&&this.r[1]!==0){this.ip=this.repAt;this.repCut=true;break}   // TF = 1: dừng sau một lần lặp, bẫy rồi chạy tiếp từ tiền tố
      if(n>0x20000)break}
    this.repN=n;return 9+T[1]*n+(this.segOv>=0?2:0)}
  wrmw16(w,seg,off,v){if(w)this.wr16(seg,off,v);else this.wr8(seg,off,v)}
  /* trạng thái gọn để lưu / so sánh */
  regs(){return{ax:this.r[0],bx:this.r[3],cx:this.r[1],dx:this.r[2],sp:this.r[4],bp:this.r[5],si:this.r[6],di:this.r[7],cs:this.s[1],ds:this.s[3],ss:this.s[2],es:this.s[0],ip:this.ip,flags:this.f}}
  setRegs(R){for(const k in R)this.setReg(k,R[k]);if(R.flags!=null)this.f=R.flags&0xFFFF}
}
function sx8(v){v&=255;return v&0x80?v-256:v}
function sx16(v){v&=0xFFFF;return v&0x8000?v-65536:v}
function hex4(v){return (v&0xFFFF).toString(16).toUpperCase().padStart(4,"0")}
function hex2(v){return (v&0xFF).toString(16).toUpperCase().padStart(2,"0")}
X86.VERSION="0.1.1";   // phiên bản máy giả lập; đổi cách tính cờ, chu kỳ hay lệnh thì tăng số và chạy lại tools/x86-test (docs/TRINH-MO-PHONG-8086.md mục 9)
Object.assign(X86,{TRAP_CYC,CPU,X86Error,FLAGS:{CF,PF,AF,ZF,SF,TF,IF,DF,OF},R16,R8,SR,hex4,hex2,sx8,sx16});
if(typeof module!=="undefined"&&module.exports)module.exports=X86;
})(typeof window!=="undefined"?window:globalThis);
/* ===================== trình mô phỏng của khóa (platform/js/58-x86-dos.js) ===================== */
/* ===================== Trình mô phỏng 8086 · phần 3: máy DOS giả (nạp chương trình, INT 21h, INT 10h, INT 16h, Lùi bước) =====================
   Chỉ tải trên trang khóa mpu8086. Không dùng DOM; chạy được trong Node. Tài liệu: docs/TRINH-MO-PHONG-8086.md.

   new X86.Machine(prog, {input, interactive, maxSteps}) — prog lấy từ X86.assemble(src).prog
     .step()  → {s:"ok"|"wait"|"exit"|"halt"|"crash"|"limit"}  chạy một lệnh (REP… chạy hết các lần lặp)
     .back()  → lùi một lệnh (giữ tối đa HIST bước gần nhất)
     .run(n)  → chạy tới khi xong / chờ nhập / hết n bước
     .feed(text) thêm dữ liệu bàn phím; .out chuỗi đã in (dùng để chấm); .screen() 25 dòng màn hình văn bản (đọc từ B800:0000)
   Bố trí bộ nhớ (giả định, giống emu8086 / DOS): IVT 0000:0000, vùng dữ liệu BIOS 0040:0000, PSP 0700:0000, chương trình từ 0710:0000
   (.EXE) hoặc 0700:0100 (.COM), bộ nhớ màn hình văn bản B800:0000 (80 × 25, mỗi ô 2 byte: ký tự, thuộc tính), "ROM" dịch vụ ngắt F000:0000.
   Dịch vụ ngắt chạy bằng JavaScript: chỉ tính 51 chu kỳ của lệnh INT, không tính thời gian chạy bên trong DOS/BIOS. */
(function(G){
"use strict";
const X86=G.X86||(G.X86={});
const {CPU,hex4,hex2}=X86;
const ROM=0xF000,VID=0xB8000,COLS=80,ROWS=25,BDA=0x400,HIST=20000;
class Stop extends Error{}
class Machine{
  constructor(prog,opt){
    opt=opt||{};this.prog=prog;this.maxSteps=opt.maxSteps||2000000;
    const m=this.mem=new Uint8Array(0x100000);const c=this.cpu=new CPU(m);
    /* bảng vectơ ngắt: mọi vectơ trỏ vào "ROM" F000:(n×4), ở đó có sẵn IRET */
    for(let n=0;n<256;n++){m[n*4]=(n*4)&255;m[n*4+1]=(n*4)>>8;m[n*4+2]=ROM&255;m[n*4+3]=ROM>>8;m[ROM*16+n*4]=0xCF}
    c.hookSeg=ROM;c.hooks=this.hooks();
    /* vùng dữ liệu BIOS: chế độ màn hình 3 (văn bản 80 × 25), con trỏ ở 0,0 */
    m[BDA+0x49]=3;m[BDA+0x4A]=COLS;m[BDA+0x84]=ROWS-1;
    for(let i=0;i<COLS*ROWS;i++){m[VID+i*2]=0x20;m[VID+i*2+1]=0x07}
    /* PSP: INT 20h ở PSP:0000, đuôi dòng lệnh rỗng */
    m.set(prog.image,prog.base*16);
    const P=prog.psp*16;m[P]=0xCD;m[P+1]=0x20;m[P+2]=0x00;m[P+3]=0xA0;m[P+0x80]=0;m[P+0x81]=0x0D;
    if(prog.kind==="com"){c.cs=c.ds=c.es=c.ss=prog.psp;c.ip=0x100;c.sp=0xFFFE;m[P+0xFFFE]=0;m[P+0xFFFF]=0}
    else{c.cs=prog.entry.cs;c.ip=prog.entry.ip;c.ss=prog.ss;c.sp=prog.sp;c.ds=c.es=prog.psp}
    c.f=0xF202;
    this.out="";this.inBuf=opt.input||"";this.inPos=0;this.interactive=opt.interactive!==false;this.eof=false;
    this.done=false;this.exit=null;this.crash=null;this.waiting=null;this.hist=[];this.reads=0;this.notes=new Set();this.last=null;this.trace=opt.trace!==false;
    this.ahAfterKey=opt.ahAfterKey!=null?opt.ahAfterKey&255:null;
    /* chấm bài: bit RAM kẹt (lỗi phần cứng giả lập mà chương trình không thấy trong mã nguồn): [{at:"biến", off, bit, val}] — sau mỗi lệnh,
       bit đó của ô biến+off bị ép về val (0/1), như ô nhớ hỏng: ghi gì đọc lại vẫn thấy bit kẹt. Chỉ dùng khi chấm (Lùi không hoàn lại). */
    this.stuck=(opt.stuck||[]).map(q=>{const y=prog.syms&&prog.syms[String(q.at).toUpperCase()];return y&&y.phys!=null?{a:(y.phys+(q.off||0))&0xFFFFF,m:1<<(q.bit&7),v:q.val?1<<(q.bit&7):0}:null}).filter(Boolean);   // chấm bài: đặt AH = giá trị này sau mỗi lần INT 21h hàm 01h/07h/08h trả phím (test kiểm đề “nạp lại AH”)
    this.execCount=new Map();this.lastCyc=new Map();
  }
  /* ---------- màn hình văn bản (đọc thẳng từ bộ nhớ B800:0000, nên chương trình ghi trực tiếp vào bộ nhớ màn hình cũng hiện) ---------- */
  get curX(){return this.mem[BDA+0x50]}get curY(){return this.mem[BDA+0x51]}
  setCur(x,y){this.wb(BDA+0x50,x);this.wb(BDA+0x51,y)}
  wb(a,v){const m=this.mem;if(this.cpu.ulog)this.cpu.ulog.push(a,m[a]);m[a]=v&255}
  screen(){const L=[];for(let y=0;y<ROWS;y++){let s="";for(let x=0;x<COLS;x++){const ch=this.mem[VID+(y*COLS+x)*2];s+=CP437[ch]}L.push(s.replace(/\s+$/,""))}return L}
  scrollUp(n,t,l,b,r,attr){for(let y=t;y<=b;y++)for(let x=l;x<=r;x++){const sy=y+n,a=VID+(y*COLS+x)*2;
      if(n&&sy<=b){const s=VID+(sy*COLS+x)*2;this.wb(a,this.mem[s]);this.wb(a+1,this.mem[s+1])}else{this.wb(a,0x20);this.wb(a+1,attr)}}}
  scrollDown(n,t,l,b,r,attr){for(let y=b;y>=t;y--)for(let x=l;x<=r;x++){const sy=y-n,a=VID+(y*COLS+x)*2;
      if(n&&sy>=t){const s=VID+(sy*COLS+x)*2;this.wb(a,this.mem[s]);this.wb(a+1,this.mem[s+1])}else{this.wb(a,0x20);this.wb(a+1,attr)}}}
  tty(ch){/* in một ký tự như BIOS INT 10h/0Eh: CR về đầu dòng, LF xuống dòng (cuộn khi ở dòng cuối), BS lùi, BEL bỏ qua */
    let x=this.curX,y=this.curY;
    if(ch===13)x=0;else if(ch===10)y++;else if(ch===8){if(x>0)x--}else if(ch===7){}
    else{const a=VID+(y*COLS+x)*2;this.wb(a,ch);x++;if(x>=COLS){x=0;y++}}
    if(y>=ROWS){this.scrollUp(1,0,0,ROWS-1,COLS-1,0x07);y=ROWS-1}
    this.setCur(x,y)}
  put(ch){/* DOS: ký tự ra màn hình; TAB → khoảng trắng tới cột chia hết cho 8 */
    if(this.out.length>200000){this.crashWith("Chương trình in quá 200 000 ký tự: có thể đang lặp vô hạn.");return}
    if(ch===9){do{this.tty(32);this.out+=" "}while(this.curX%8);return}
    this.tty(ch);this.out+=OUTC(ch)}
  /* ---------- bàn phím ---------- */
  feed(t){this.inBuf+=t}
  hasKey(){return this.inPos<this.inBuf.length}
  key(){/* một ký tự; xuống dòng trong dữ liệu nhập là phím Enter (0Dh) */let ch=this.inBuf.charCodeAt(this.inPos++);if(ch===10)ch=13;else if(ch===13){if(this.inBuf[this.inPos]==="\n")this.inPos++}
    if(ch>255){this.notes.add("utf8");ch=0x3F}return ch}
  needKey(kind){if(this.hasKey())return true;if(this.interactive&&!this.eof){this.waiting=kind;throw new Stop()}return false}
  crashWith(vi){this.crash={vi};this.done=true;throw new Stop()}
  hooks(){const H={},self=this;
    H[0x00]=c=>{self.crashWith("Lỗi chia (INT 0, divide error) ở lệnh tại "+hex4(c.startCS)+":"+hex4(c.startIP)+": số chia bằng 0, hoặc thương quá lớn không vừa thanh ghi đích (AL với phép chia 8 bit, AX với phép chia 16 bit). DOS sẽ in “Divide overflow” và dừng chương trình.")};
    H[0x03]=c=>{self.stopBp=true};
    H[0x04]=c=>{self.crashWith("Ngắt tràn số (INTO khi OF = 1) ở "+hex4(c.startCS)+":"+hex4(c.startIP)+".")};
    H[0x20]=c=>{self.finish(0,"20")};
    H[0x21]=c=>self.int21(c);
    H[0x10]=c=>self.int10(c);
    H[0x16]=c=>self.int16(c);
    for(const n of [0x01,0x02,0x05,0x06,0x07,0x08,0x09,0x0A,0x0B,0x0C,0x0D,0x0E,0x0F,0x11,0x12,0x13,0x14,0x15,0x17,0x19,0x1A,0x1B,0x1C,0x1D,0x1E,0x1F,0x22,0x23,0x24,0x25,0x26,0x27,0x28,0x2F,0x33])
      if(!H[n])H[n]=c=>self.crashWith("Trình mô phỏng chưa có dịch vụ ngắt INT "+hex2(n)+"h. Có: INT 21h (hàm 01h, 02h, 06h, 07h, 08h, 09h, 0Ah, 0Bh, 0Ch, 25h, 35h, 4Ch), INT 10h, INT 16h, INT 20h; hoặc tự cài vectơ ngắt (INT 21h/25h).");
    return H}
  finish(code,via){this.exit=code&255;this.exitVia=via||null;this.exitCS=this.cpu.startCS;this.done=true;this.cpu.noTrap=true}   // exitCS: CS của lệnh INT kết thúc (INT 20h, INT 21h/00h cần CS = PSP trên DOS thật)   // exitVia: "4C" | "00" | "20" (INT 21h/4Ch, INT 21h/00h, INT 20h; RET của .COM về PSP:0000 cũng là "20")
  int21(c){const ah=c.ax>>8,al=c.ax&255;
    switch(ah){
      case 0x00:this.finish(0,"00");return;
      case 0x4C:this.finish(al,"4C");return;
      case 0x01:{if(!this.needKey("char")){c.s8(0,0);return}const k=this.key();this.put(k);c.s8(0,k);this.reads++;if(this.ahAfterKey!=null)c.s8(4,this.ahAfterKey);return}
      case 0x07:case 0x08:{if(!this.needKey("char")){c.s8(0,0);return}c.s8(0,this.key());if(this.ahAfterKey!=null)c.s8(4,this.ahAfterKey);return}
      case 0x02:{const d=c.dx&255;this.put(d);c.s8(0,d===9?0x20:d);return}
      case 0x06:{const d=c.dx&255;if(d===0xFF){if(this.hasKey()){c.s8(0,this.key());c.f&=~64}else{c.s8(0,0);c.f|=64}}else{this.put(d);c.s8(0,d)}return}
      case 0x09:{let off=c.dx,n=0;for(;;){const ch=this.mem[c.pa(c.ds,off)];if(ch===0x24)break;this.put(ch);off=(off+1)&0xFFFF;
          if(++n>=4000){this.crashWith("INT 21h/09h in chuỗi tới khi gặp ký tự $; đã in 4000 ký tự mà chưa gặp $. Kiểm tra: chuỗi có kết thúc bằng '$' chưa, DX trỏ đúng chuỗi chưa (LEA DX, ten_chuoi), và DS đã nạp đoạn dữ liệu chưa (MOV AX, @DATA / MOV DS, AX).");return}}
        if(c.ds===this.prog.psp&&this.prog.kind==="exe")this.notes.add("ds");c.s8(0,0x24);return}
      case 0x0A:{const a=c.pa(c.ds,c.dx),max=this.mem[a];if(!max){return}
        /* đọc một dòng: chờ có đủ một dòng (tới Enter) trong bộ đệm nhập */
        if(!this.inBuf.slice(this.inPos).includes("\n")&&this.interactive&&!this.eof){this.waiting="line";throw new Stop()}
        let n=0;for(;;){if(!this.hasKey())break;const k=this.key();if(k===13)break;if(k===8){if(n>0){n--;this.put(8);this.put(32);this.put(8)}continue}
          if(n<max-1){this.wb(c.pa(c.ds,c.dx+2+n),k);n++;this.put(k)}else this.notes.add("full")}
        this.wb(c.pa(c.ds,c.dx+1),n);this.wb(c.pa(c.ds,c.dx+2+n),13);this.put(13);this.reads++;return}
      case 0x0B:c.s8(0,this.hasKey()?0xFF:0);return;
      case 0x0C:{this.inPos=this.inPos;const f=al;if([1,6,7,8,0x0A].includes(f)){c.ax=(f<<8)|(c.dx&255);return this.int21(c)}return}
      case 0x25:{const a=al*4;this.wb(a,c.dx&255);this.wb(a+1,c.dx>>8);this.wb(a+2,c.ds&255);this.wb(a+3,c.ds>>8);return}
      case 0x35:{const a=al*4;c.bx=this.mem[a]|(this.mem[a+1]<<8);c.es=this.mem[a+2]|(this.mem[a+3]<<8);return}
      default:this.crashWith("INT 21h hàm AH = "+hex2(ah)+"h chưa có trong trình mô phỏng. Có: 01h (nhập 1 ký tự, hiện lên), 02h (in ký tự DL), 06h, 07h/08h (nhập không hiện), 09h (in chuỗi kết thúc bằng $), 0Ah (nhập một dòng vào bộ đệm), 0Bh, 0Ch, 25h/35h (đặt/đọc vectơ ngắt), 4Ch (kết thúc chương trình).")}}
  int10(c){const ah=c.ax>>8,al=c.ax&255;
    switch(ah){
      case 0x00:this.scrollUp(0,0,0,ROWS-1,COLS-1,0x07);this.setCur(0,0);if(al!==3&&al!==2&&al!==7)this.notes.add("mode");return;
      case 0x01:return;
      case 0x02:this.setCur(Math.min(c.dx&255,COLS-1),Math.min(c.dx>>8,ROWS-1));return;
      case 0x03:c.dx=(this.curY<<8)|this.curX;c.cx=0x0607;return;
      case 0x05:return;
      case 0x06:case 0x07:{const t=c.cx>>8,l=c.cx&255,b=Math.min(c.dx>>8,ROWS-1),r=Math.min(c.dx&255,COLS-1),attr=c.bx>>8;const n=al===0||al>b-t?b-t+1:al;
        if(ah===6)this.scrollUp(n,t,l,b,r,attr);else this.scrollDown(n,t,l,b,r,attr);return}
      case 0x08:{const a=VID+(this.curY*COLS+this.curX)*2;c.ax=(this.mem[a+1]<<8)|this.mem[a];return}
      case 0x09:case 0x0A:{let x=this.curX,y=this.curY;for(let i=0;i<c.cx&&y<ROWS;i++){const a=VID+(y*COLS+x)*2;this.wb(a,al);if(ah===9)this.wb(a+1,c.bx&255);if(++x>=COLS){x=0;y++}}
        {const n=Math.min(c.cx,COLS*ROWS);this.out+=CP437[al].repeat(n)+"\b".repeat(n)}return}   // hàm 09h/0Ah không dời con trỏ: luồng chữ dùng để chấm lùi lại n ô (chữ in sau ghi đè lên, như trên màn hình)
      case 0x0E:this.tty(al);this.out+=OUTC(al);return;
      case 0x0F:c.ax=(COLS<<8)|3;c.bx&=0x00FF;return;
      case 0x13:{let x=c.dx&255,y=c.dx>>8;this.setCur(x,y);for(let i=0;i<c.cx;i++){const ch=this.mem[c.pa(c.es,c.bp+i*(al&2?2:1))],at=al&2?this.mem[c.pa(c.es,c.bp+i*2+1)]:c.bx&255;
          if(ch===13||ch===10||ch===8||ch===7)this.tty(ch);else{const a=VID+(this.curY*COLS+this.curX)*2;this.wb(a,ch);this.wb(a+1,at);let nx=this.curX+1,ny=this.curY;if(nx>=COLS){nx=0;ny++}if(ny>=ROWS){this.scrollUp(1,0,0,ROWS-1,COLS-1,7);ny=ROWS-1}this.setCur(nx,ny)}
          this.out+=OUTC(ch)}
        if(!(al&1))this.setCur(x,y);return}
      default:this.crashWith("INT 10h hàm AH = "+hex2(ah)+"h chưa có trong trình mô phỏng. Có: 00h (đặt chế độ, xóa màn hình), 02h/03h (đặt/đọc con trỏ), 06h/07h (cuộn, xóa vùng), 08h, 09h, 0Ah (ghi ký tự), 0Eh (in ký tự kiểu máy chữ), 0Fh, 13h (in chuỗi).")}}
  int16(c){const ah=c.ax>>8;
    switch(ah){
      case 0x00:case 0x10:{if(!this.needKey("char")){c.ax=0;return}const k=this.key();c.ax=k;this.reads++;return}   // mã quét (AH) không mô phỏng: AH = 0
      case 0x01:case 0x11:if(this.hasKey()){c.ax=this.inBuf.charCodeAt(this.inPos)===10?13:this.inBuf.charCodeAt(this.inPos)&255;c.f&=~64}else c.f|=64;return;
      case 0x02:c.s8(0,0);return;
      default:this.crashWith("INT 16h hàm AH = "+hex2(ah)+"h chưa có. Có: 00h (chờ phím, AL = mã ASCII), 01h (kiểm tra có phím).")}}
  /* ---------- chạy một lệnh ---------- */
  step(){
    if(this.done)return{s:this.crash?"crash":"exit"};
    const c=this.cpu;
    if(this.hist.length>=HIST+2000)this.hist.splice(0,2000);
    const rec={r:c.r.slice(),sg:c.s.slice(),ip:c.ip,f:c.f,out:this.out.length,inPos:this.inPos,total:c.total,steps:c.steps,halted:c.halted,ulog:[],reads:this.reads||0,stopBp:this.stopBp};
    c.ulog=rec.ulog;c.acc=this.trace?[]:null;this.waiting=null;this.stopBp=false;
    const ph=c.pa(c.cs,c.ip);
    try{
      if(c.halted){return{s:"halt"}}
      if(c.steps>=this.maxSteps){this.done=true;this.crash={vi:"Đã chạy "+this.maxSteps.toLocaleString("vi-VN")+" lệnh mà chưa kết thúc: có thể chương trình lặp vô hạn (thiếu lệnh kết thúc MOV AH,4Ch / INT 21h, hoặc điều kiện dừng vòng lặp sai)."};return{s:"limit"}}
      if(this.stuck.length)this.forceStuck();
      c.step();
      if(this.stuck.length)this.forceStuck();
    }catch(e){
      if(e instanceof Stop){
        if(this.waiting&&!this.done){this.undo(rec);return{s:"wait",kind:this.waiting}}
        this.hist.push(rec);this.last=this.info(c,ph);return{s:"crash"}}
      if(e instanceof X86.X86Error){this.hist.push(rec);this.done=true;this.crash={vi:e.vi};this.last=this.info(c,ph);return{s:"crash"}}
      throw e}
    this.hist.push(rec);
    if(this.trace){this.last=this.info(c,ph);this.execCount.set(ph,(this.execCount.get(ph)||0)+1);this.lastCyc.set(ph,c.cyc)}
    if(this.done)return{s:"exit"};
    if(c.halted){this.done=true;this.halted=true;return{s:"halt"}}
    if(this.stopBp)return{s:"bp"};
    return{s:"ok"}}
  forceStuck(){for(const q of this.stuck)this.mem[q.a]=(this.mem[q.a]&~q.m)|q.v}
  info(c,ph){const n=c.fl||0;const bytes=[];for(let i=0;i<n;i++)bytes.push(this.mem[(ph+i)&0xFFFFF]);
    const ea=c.ea&&!c.ea.isReg?{seg:c.ea.seg,segv:c.s[c.ea.seg],off:c.ea.off,phys:c.pa(c.s[c.ea.seg],c.ea.off),eat:c.ea.eat,eac:c.ea.eac}:null;
    return{cs:c.startCS,ip:c.startIP,phys:ph,bytes,cyc:c.cyc,cycR:c.cycR,line:this.prog.lineAt.get(ph)||0,ea,acc:c.acc||[],jumped:c.jumped,repN:c.repN,odd:c.odd,intNo:c.intNo,trap:c.trapped}}
  undo(rec){const c=this.cpu,m=this.mem,L=rec.ulog;for(let i=L.length-2;i>=0;i-=2)m[L[i]]=L[i+1];
    c.r.set(rec.r);c.s.set(rec.sg);c.ip=rec.ip;c.f=rec.f;c.total=rec.total;c.steps=rec.steps;c.halted=rec.halted;this.out=this.out.slice(0,rec.out);this.inPos=rec.inPos;this.reads=rec.reads;this.stopBp=rec.stopBp;
    this.done=false;this.exit=null;this.exitVia=null;this.exitCS=null;this.crash=null;this.halted=false}
  canBack(){return this.hist.length>0}
  back(){const rec=this.hist.pop();if(!rec)return false;this.undo(rec);
    const ph=this.cpu.pa(this.cpu.cs,this.cpu.ip);const n=this.execCount.get(ph);if(n>1)this.execCount.set(ph,n-1);else this.execCount.delete(ph);
    this.last=null;return true}
  run(n){let r={s:"ok"};for(let i=0;i<n;i++){r=this.step();if(r.s!=="ok")break}return r}
  regs(){return this.cpu.regs()}
  /* chuỗi đã in, chuẩn hóa để chấm: bỏ CR, bỏ khoảng trắng cuối dòng và dòng trống cuối */
  printed(){return normOut(this.out)}
}
/* chữ đã in, dựng lại như trên màn hình (không giới hạn số dòng): CR về đầu dòng, LF xuống dòng giữ cột, BS lùi một cột.
   Dùng để chấm bài: bỏ khoảng trắng cuối dòng và các dòng trống ở cuối. */
function normOut(s){const L=[[]];let y=0,x=0;
  for(const ch of String(s)){if(ch==="\r")x=0;else if(ch==="\n"){y++;if(!L[y])L[y]=[]}else if(ch==="\b"){if(x>0)x--}
    else{const row=L[y];while(row.length<x)row.push(" ");row[x]=ch;x++}}
  return L.map(r=>r.join("").replace(/\s+$/,"")).join("\n").replace(/\n+$/,"")}
const OUTC=ch=>ch===13?"\r":ch===10?"\n":ch===8?"\b":ch===7?"":CP437[ch];
/* bảng mã CP437 (màn hình văn bản của PC IBM): 32–126 giống ASCII; vài ký tự vẽ khung hay dùng */
const CP437=(()=>{const a=[];const hi="ÇüéâäàåçêëèïîìÄÅÉæÆôöòûùÿÖÜ¢£¥₧ƒáíóúñÑªº¿⌐¬½¼¡«»░▒▓│┤╡╢╖╕╣║╗╝╜╛┐└┴┬├─┼╞╟╚╔╩╦╠═╬╧╨╤╥╙╘╒╓╫╪┘┌█▄▌▐▀αßΓπΣσµτΦΘΩδ∞φε∩≡±≥≤⌠⌡÷≈°∙·√ⁿ²■ ";
  const lo=" ☺☻♥♦♣♠•◘○◙♂♀♪♫☼►◄↕‼¶§▬↨↑↓→←∟↔▲▼";
  for(let i=0;i<256;i++)a.push(i===0?" ":i<32?lo[i]:i<127?String.fromCharCode(i):i===127?"⌂":hi[i-128]);return a})();
Object.assign(X86,{Machine,normOut,CP437,VID,COLS,ROWS});
if(typeof module!=="undefined"&&module.exports)module.exports=X86;
})(typeof window!=="undefined"?window:globalThis);
/* ===================== trình mô phỏng của khóa (platform/js/58-x86-ui.js) ===================== */
/* ===================== Trình mô phỏng 8086 · phần 4: giao diện =====================
   Chỉ tải trên trang khóa mpu8086. Theo docs/QUY-TAC-TRINH-MO-PHONG.md: khung cao cố định (.sim-stage), code ở trên/trái,
   các phần theo dõi xếp dọc trong một khung cuộn (Thanh ghi → Mã máy → Bộ nhớ → Ngăn xếp → Màn hình DOS), hàng nút ở đáy khung.
   Máy (58-x86-cpu.js, 58-x86-dos.js) tách khỏi phần vẽ này: phần vẽ chỉ đọc trạng thái máy sau mỗi bước.

   makeX86Sim(el, {id, presets:[{label, code, input, note}], file}) → {get, set, setInput, run, step, el, machine}
   makeX86Ex(el, sim, [{t, d, start, tests:[{in, out, regs, mem}], perf:{cycles, bytes}}], opt)   bài tập chấm tự động
   Hướng dẫn dùng trong bài: docs/TRINH-MO-PHONG-8086.md mục 5. */
(function(G){
"use strict";
const X86=G.X86;
const doc=G.document;
const h4=X86.hex4,h2=X86.hex2,h5=v=>(v>>>0).toString(16).toUpperCase().padStart(5,"0");
const escH=s=>String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
const reduce=()=>!!(G.matchMedia&&G.matchMedia("(prefers-reduced-motion: reduce)").matches);
const MOB=()=>!!(G.matchMedia&&G.matchMedia("(max-width:900px)").matches);
const MHZ=5;   // giả định: xung nhịp 5 MHz (8086 bản 5 MHz) để đổi số chu kỳ ra thời gian
/* ---------- tô màu cú pháp hợp ngữ ---------- */
const KW_DIR=new Set("DB DW DD DUP EQU PROC ENDP SEGMENT ENDS ASSUME END ORG EVEN ALIGN LABEL PTR BYTE WORD DWORD NEAR FAR SHORT OFFSET SEG TYPE SIZE LENGTH MOD SHL SHR AND OR XOR NOT HIGH LOW TITLE".split(" "));
const REGS=new Set("AX BX CX DX SI DI BP SP AL AH BL BH CL CH DL DH CS DS SS ES IP".split(" "));
function hlLine(s){let o="",i=0;const n=s.length;
  while(i<n){const c=s[i];
    if(c===";"){o+=`<span class="t-com">${escH(s.slice(i))}</span>`;break}
    if(c==="'"||c==='"'){let j=s.indexOf(c,i+1);if(j<0)j=n-1;o+=`<span class="t-str">${escH(s.slice(i,j+1))}</span>`;i=j+1;continue}
    if(/[0-9]/.test(c)){let j=i;while(j<n&&/[0-9A-Za-z]/.test(s[j]))j++;o+=`<span class="t-num">${escH(s.slice(i,j))}</span>`;i=j;continue}
    if(/[A-Za-z_@.?$]/.test(c)){let j=i+1;while(j<n&&/[A-Za-z0-9_@?$]/.test(s[j]))j++;const w=s.slice(i,j),u=w.toUpperCase();
      const cls=u[0]==="."||KW_DIR.has(u)||u==="@DATA"?"t-pre":REGS.has(u)?"t-op":MNEM(u)?"t-kw":"";o+=cls?`<span class="${cls}">${escH(w)}</span>`:escH(w);i=j;continue}
    o+=escH(c);i++}
  return o}
const MN=new Set("MOV PUSH POP XCHG XLAT XLATB IN OUT LEA LDS LES LAHF SAHF PUSHF POPF ADD ADC INC AAA DAA SUB SBB DEC NEG CMP AAS DAS MUL IMUL AAM DIV IDIV AAD CBW CWD NOT SHL SAL SHR SAR ROL ROR RCL RCR AND TEST OR XOR MOVS MOVSB MOVSW CMPS CMPSB CMPSW SCAS SCASB SCASW LODS LODSB LODSW STOS STOSB STOSW REP REPE REPZ REPNE REPNZ CALL JMP RET RETF RETN JE JZ JNE JNZ JA JAE JB JBE JC JNC JG JGE JL JLE JO JNO JS JNS JP JNP JPE JPO JNA JNAE JNB JNBE JNG JNGE JNL JNLE JCXZ LOOP LOOPE LOOPZ LOOPNE LOOPNZ INT INTO IRET CLC STC CMC CLD STD CLI STI HLT WAIT LOCK NOP".split(" "));
function MNEM(u){return MN.has(u)}
/* ---------- câu hỏi Đoán trước (dựa vào dòng lệnh sắp chạy) ---------- */
function askFor(text){
  const t=text.replace(/;.*/,"").replace(/^\s*[A-Za-z_@?$][\w@?$]*\s*:/,"").trim();if(!t)return null;
  const m=/^(\w+)\s*(.*)$/.exec(t);if(!m)return null;let mn=m[1].toUpperCase();const ops=m[2].split(",").map(x=>x.trim());
  if(/^(REP|REPE|REPZ|REPNE|REPNZ)$/.test(mn))return{kind:"reg",reg:"CX",q:"Sau lệnh chuỗi có tiền tố "+mn+", CX bằng bao nhiêu?"};
  if(/^J(?!MP)/.test(mn)||/^LOOP/.test(mn))return{kind:"jump",q:`Lệnh ${mn} có nhảy tới ${escH(ops[0]||"nhãn")} không?`};
  if(mn==="CMP"||mn==="TEST")return{kind:"flag",flag:"ZF",q:`Sau lệnh ${mn}, cờ ZF bằng mấy?`};
  if(/^(MUL|IMUL|DIV|IDIV)$/.test(mn))return{kind:"reg",reg:"AX",q:`Sau lệnh ${mn} ${escH(ops[0])}, AX bằng bao nhiêu (hệ 16)?`};
  if(mn==="PUSH"||mn==="CALL"||mn==="POP"&&!REGS.has((ops[0]||"").toUpperCase()))return{kind:"reg",reg:"SP",q:`Sau lệnh ${mn}, SP bằng bao nhiêu (hệ 16)?`};
  const d=(ops[0]||"").toUpperCase();
  if(REGS.has(d)&&!/^(CS|DS|SS|ES|IP)$/.test(d)&&/^(MOV|ADD|ADC|SUB|SBB|AND|OR|XOR|INC|DEC|NEG|NOT|SHL|SAL|SHR|SAR|ROL|ROR|RCL|RCR|LEA|POP|XCHG|LODSB|LODSW|CBW|CWD)$/.test(mn))
    return{kind:"reg",reg:d,q:`Sau lệnh này, ${d} bằng bao nhiêu (hệ 16)?`};
  if(mn==="LODSB"||mn==="LODSW")return{kind:"reg",reg:mn==="LODSB"?"AL":"AX",q:`Sau ${mn}, ${mn==="LODSB"?"AL":"AX"} bằng bao nhiêu (hệ 16)?`};
  return null}
function parseHex(s){s=String(s).trim().toUpperCase().replace(/^0X/,"");if(/^[0-9]+D$/.test(s))return parseInt(s,10);s=s.replace(/H$/,"");if(!/^[0-9A-F]{1,4}$/.test(s))return null;return parseInt(s,16)}
let SEQ=0;
G.makeX86Sim=function(root,cfg){
  cfg=cfg||{};const id=cfg.id||("x86s"+(++SEQ));const shown=(cfg.presets||[]).filter(p=>!p.an);   // p.an: ví dụ ẩn trên trang (vẫn là bằng chứng kiểm chứng của bài)
  const presets=shown.length?shown:[{label:"Chương trình",code:".MODEL SMALL\n.STACK 100h\n.DATA\n.CODE\nMAIN PROC\n    MOV AX, @DATA\n    MOV DS, AX\n\n    MOV AX, 4C00h\n    INT 21h\nMAIN ENDP\nEND MAIN\n"}];
  root.classList.add("sim","x86");
  root.innerHTML=`<div class="sim-bar"><div class="left"><span class="fname">${escH(cfg.file||"MAIN.ASM")}</span>
    ${presets.length>1?`<label class="pre-l"><span class="vh">Chọn ví dụ</span><select class="s-pre" id="${id}-pre">${presets.map((p,i)=>`<option value="${i}">${escH(p.label)}</option>`).join("")}</select></label>`:""}
    <span class="s-chip idle" role="status" aria-live="polite">Chưa chạy</span></div>
    <div class="right"><label class="xs-pred"><input type="checkbox" class="s-predon"><span>Đoán trước</span></label></div></div>
  <details class="s-note" hidden><summary><b class="sn-h">Ví dụ này minh họa</b><span class="sn-1"></span></summary><p class="sn-t"></p></details>
  <div class="sim-stage">
   <div class="st-code"><div class="editor"><div class="gutter"></div><div class="ed-wrap"><pre class="ed-hl" aria-hidden="true"></pre><textarea class="ed-ta" id="${id}-ed" spellcheck="false" autocapitalize="off" autocomplete="off" aria-label="Mã nguồn hợp ngữ 8086"></textarea></div></div>
    <div class="sim-in"><label for="${id}-in"><b>Dữ liệu gõ từ bàn phím</b><small>Chương trình đọc bằng INT 21h (hàm 01h, 0Ah…) lần lượt từng ký tự; xuống dòng là phím Enter. Để trống thì khi chạy, chương trình sẽ hỏi bạn.</small></label><textarea class="s-in" id="${id}-in" rows="1" spellcheck="false" autocapitalize="off" autocomplete="off"></textarea></div></div>
   <div class="st-panes">
    <div class="st-nav" role="group" aria-label="Đi tới phần"><button type="button" data-go="reg">Thanh ghi</button><button type="button" data-go="code">Mã máy</button><button type="button" data-go="mem">Bộ nhớ</button><button type="button" data-go="stk">Ngăn xếp</button><button type="button" data-go="out">Màn hình</button></div>
    <div class="st-scroll" tabindex="0" role="region" aria-label="Thanh ghi, mã máy, bộ nhớ, ngăn xếp và màn hình">
     <section class="pn" data-sec="reg"><div class="pane-h"><span>Thanh ghi và cờ</span><span class="xs-last"></span></div>
      <div class="xs-ask" hidden></div><div class="xs-regs"></div><div class="xs-pa"></div></section>
     <section class="pn" data-sec="code"><div class="pane-h"><span>Mã máy và chu kỳ</span><span class="xs-tot"></span></div><div class="xs-list"></div></section>
     <section class="pn" data-sec="mem"><div class="pane-h"><span>Bộ nhớ (hệ 16)</span><span class="xs-mtag"></span></div>
      <div class="xs-mbar"><label><span class="vh">Vùng nhớ</span><select class="xs-mseg"><option value="data">Đoạn dữ liệu</option><option value="ds">DS:0000</option><option value="es">ES:0000</option><option value="ss">SS:SP</option><option value="cs">CS:IP</option><option value="vid">B800:0000 (màn hình)</option><option value="ivt">0000:0000 (vectơ ngắt)</option></select></label>
       <button type="button" class="btn xs-mprev" aria-label="Lùi 128 byte">◀</button><button type="button" class="btn xs-mnext" aria-label="Tới 128 byte">▶</button></div>
      <div class="xs-mem"></div></section>
     <section class="pn" data-sec="stk"><div class="pane-h"><span>Ngăn xếp</span><span class="xs-sp"></span></div><div class="xs-stk"></div></section>
     <section class="pn" data-sec="out"><div class="pane-h"><span>Màn hình DOS</span><span class="s-exit"></span></div>
      <div class="xs-scr" tabindex="-1"></div>
      <div class="s-wait" hidden><label for="${id}-cin"><b>Chương trình đang chờ bạn gõ phím</b><small class="xs-wk">Gõ rồi bấm Gửi (hoặc Enter). Enter được gửi kèm như phím Enter.</small></label>
       <div class="s-wrow"><input class="con-in" id="${id}-cin" autocomplete="off" spellcheck="false" autocapitalize="off" enterkeyhint="send"><button type="button" class="btn pri s-send">Gửi</button><button type="button" class="btn eof-btn" title="Báo hết dữ liệu nhập">Hết dữ liệu</button></div></div>
      <div class="explain" hidden></div></section>
    </div></div>
   <div class="sim-ctl"><span class="sc-st" aria-hidden="true">Chưa chạy</span><span class="sc-btns"><button type="button" class="btn nw s-reset" disabled title="Làm lại từ đầu" aria-label="Làm lại từ đầu">↺</button><button type="button" class="btn nw s-back" disabled title="Lùi lại một lệnh">← Lùi</button><button type="button" class="btn s-step">Từng bước</button><button type="button" class="btn pri s-run">▶ Chạy</button></span></div>
  </div>
  <div class="sim-foot"><span><kbd>Ctrl</kbd> + <kbd>Enter</kbd> trong khung code để chạy</span><span class="xs-foot"></span></div>
  <details class="sim-scope"><summary>Trình mô phỏng 8086 hỗ trợ những gì?</summary><div>
   <p><b>Đây là trình mô phỏng để học</b>, viết theo cú pháp MASM/TASM giống emu8086. Mã máy sinh ra giống MASM; đã đối chiếu với NASM và với bộ test từng lệnh SingleStepTests của CPU 8088 thật (chi tiết trong tài liệu của khóa).</p>
   <p><b>Có:</b> .MODEL SMALL (chương trình .EXE) và .MODEL TINY / ORG 100h (chương trình .COM); .STACK, .DATA, .CODE, SEGMENT/ENDS, ASSUME, PROC/ENDP (NEAR, FAR), DB/DW/DD, DUP, ?, EQU, =, LABEL, OFFSET, SEG, @DATA, PTR, SHORT, tiền tố đoạn (ES:), $, .STARTUP, .EXIT, END. Mọi lệnh của 8086 trừ lệnh cho bộ đồng xử lý 8087. INT 21h hàm 01h, 02h, 06h, 07h, 08h, 09h, 0Ah, 0Bh, 0Ch, 25h, 35h, 4Ch; INT 10h hàm 00h, 02h, 03h, 06h, 07h, 08h, 09h, 0Ah, 0Eh, 0Fh, 13h; INT 16h hàm 00h, 01h; INT 20h; ghi trực tiếp vào bộ nhớ màn hình B800:0000.</p>
   <p><b>Chu kỳ:</b> theo bảng thời gian lệnh của 8086, cộng thời gian tính địa chỉ (EA), +2 khi có tiền tố đoạn, +4 mỗi lần đọc/ghi word ở địa chỉ lẻ. Giả định không có trạng thái chờ và bỏ qua hàng đợi lệnh; MUL/DIV lấy cận dưới của khoảng; thời gian chạy bên trong dịch vụ DOS/BIOS không tính. Đổi ra thời gian theo xung nhịp ${MHZ} MHz (giả định).</p>
   <p><b>Cũng có:</b> macro (MACRO … ENDM, LOCAL, REPT, IRP, IRPC), dịch có điều kiện (IF, IFE, IFDEF, IFNDEF, IFB, IFNB, ELSEIF, ELSE, ENDIF), STRUC; bẫy chạy từng bước bằng cờ TF (ngắt 1, cả sau từng lần lặp của lệnh REP); khi chạy Từng bước, mũi tên ở lề trái khung code chỉ lệnh nhảy vừa chạy tới dòng đích.</p>
   <p><b>Chưa có:</b> INCLUDE (báo lỗi: trình duyệt không có tệp để đọc), FPU 8087, chế độ bảo vệ, ngắt phần cứng (timer, bàn phím), cổng vào/ra thật (IN đọc FFh). HLT được coi là kết thúc chương trình (máy thật dừng chờ ngắt rồi chạy tiếp). Giới hạn: 2 000 000 lệnh mỗi lần chạy, Lùi được 20 000 lệnh gần nhất.</p></div></details>`;
  const $=s=>root.querySelector(s);
  const ed=$(".ed-ta"),hl=$(".ed-hl"),gut=$(".gutter"),inp=$(".s-in"),chip=$(".s-chip"),stage=$(".sim-stage"),sc=$(".st-scroll"),ctlSt=$(".sc-st");
  const btnStep=$(".s-step"),btnRun=$(".s-run"),btnBack=$(".s-back"),btnReset=$(".s-reset"),exp=$(".explain");
  const secOf=k=>root.querySelector(`.pn[data-sec="${k}"]`),navB=k=>root.querySelector(`.st-nav [data-go="${k}"]`);
  const S={pi:0,asm:null,M:null,cur:0,bad:0,running:false,mode:null,tok:0,mview:"data",moff:null,prevRegs:null,ask:null,predOn:false,fb:null,outN:0,listKey:""};
  /* ---------- khung: cuộn trong khung, chống nhảy, đưa khung vào màn hình một lần ---------- */
  function scrollIn(el,how){if(!el||el.hidden)return;const R=sc.getBoundingClientRect(),E=el.getBoundingClientRect();if(!R.height)return;
    const to=how==="top"?sc.scrollTop+E.top-R.top:E.bottom>R.bottom||E.top<R.top?sc.scrollTop+(E.bottom>R.bottom&&E.height<R.height?E.bottom-R.bottom+8:E.top-R.top):null;
    if(to!=null){if(sc.scrollTo)sc.scrollTo({top:to,behavior:reduce()?"auto":"smooth"});else sc.scrollTop=to}}
  const goPane=k=>scrollIn(secOf(k),"top");
  root.querySelectorAll(".st-nav [data-go]").forEach(b=>b.onclick=()=>goPane(b.dataset.go));
  function seen(k){const s=secOf(k),R=sc.getBoundingClientRect(),E=s.getBoundingClientRect();return E.top<R.bottom-24&&E.bottom>R.top+24}
  function paintNav(){let on=null;const R=sc.getBoundingClientRect();for(const k of ["reg","code","mem","stk","out"]){const E=secOf(k).getBoundingClientRect();if(E.top<=R.top+R.height/3)on=k;else if(!on)on=k}
    root.querySelectorAll(".st-nav [data-go]").forEach(b=>b.classList.toggle("on",b.dataset.go===on));if(seen("out"))navB("out").classList.remove("new")}
  sc.addEventListener("scroll",()=>{cancelAnimationFrame(sc._r);sc._r=requestAnimationFrame(paintNav)},{passive:true});
  function hold(){["reg","code","mem","stk"].forEach(k=>{const s=secOf(k),h=s.offsetHeight;if(h>(s._mh||0)){s._mh=h;s.style.minHeight=h+"px"}})}
  function unhold(){root.querySelectorAll(".pn").forEach(s=>{s._mh=0;s.style.minHeight=""})}
  function fitStage(){const r=stage.getBoundingClientRect();if(!r.height)return;let top=0;doc.querySelectorAll(".top,.lbar,.ltoc").forEach(h=>{const q=h.getBoundingClientRect(),cs=getComputedStyle(h);if(q.height&&cs.position==="sticky"&&cs.display!=="none")top=Math.max(top,(parseFloat(cs.top)||0)+(h.open&&h.querySelector("summary")?h.querySelector("summary").offsetHeight:q.height))});
    const want=top+8;if(r.top<want-2||r.bottom>innerHeight+2)G.scrollBy({top:r.top-want,behavior:reduce()?"auto":"smooth"})}
  function live(on){if(on&&!stage.classList.contains("live")){stage.classList.add("live");fitStage()}else if(!on)stage.classList.remove("live")}
  function setChip(k,t){chip.className="s-chip "+k;chip.textContent=t;ctlSt.className="sc-st "+k;ctlSt.textContent=t}
  /* ---------- trình soạn code ---------- */
  function paint(){const L=ed.value.split("\n"),J=S.jmp;
    const jc=i=>J?(i===J.from?(J.to?" jf":" jn"):i===J.to?" jt":""):"";
    hl.innerHTML=L.map((s,i)=>`<span class="row${i+1===S.cur?" cur":""}${i+1===S.bad?" bad":""}${jc(i+1)}">${hlLine(s)||" "}</span>`).join("");
    /* SIM17: mũi tên luồng nhảy vẽ trên mã nguồn (lề trái của khung code, cuộn cùng code): từ lệnh nhảy vừa chạy tới dòng đích */
    if(J&&J.to){const R=hl.querySelectorAll(".row"),a=R[J.from-1],b=R[J.to-1];
      if(a&&b){const y1=a.offsetTop+a.offsetHeight/2,y2=b.offsetTop+b.offsetHeight/2,top=Math.min(y1,y2)-6,h=Math.abs(y2-y1)+12,f=y1-top,t=y2-top;
        hl.insertAdjacentHTML("beforeend",`<svg class="xs-jmp${y2<y1?" up":""}" aria-hidden="true" style="top:${top}px;height:${h}px" width="12" height="${h}" viewBox="0 0 12 ${h}"><path d="M11 ${f}H3V${t}H8" fill="none"/><path class="hd" d="M7 ${t-4}L12 ${t}L7 ${t+4}Z"/></svg>`)}}
    gut.innerHTML=L.map((_,i)=>`<div class="${i+1===S.bad?"err":""}${i+1===S.cur?" cur":""}">${i+1}</div>`).join("");sync()}
  function sync(){hl.scrollTop=ed.scrollTop;hl.scrollLeft=ed.scrollLeft;gut.scrollTop=ed.scrollTop}
  function keepCur(){if(!S.cur)return;const lh=parseFloat(getComputedStyle(ed).lineHeight)||22,y=(S.cur-1)*lh,h=ed.clientHeight;if(y<ed.scrollTop+h*.25||y>ed.scrollTop+h*.7-lh){ed.scrollTop=Math.max(0,y-h/2+lh/2);sync()}}
  ed.addEventListener("scroll",sync);
  ed.addEventListener("input",()=>{if(S.M||S.bad||S.asm)reset();else paint()});
  ed.addEventListener("keydown",e=>{
    if(e.key==="Enter"&&(e.ctrlKey||e.metaKey)){e.preventDefault();runAll();return}
    if(e.key==="Tab"&&!e.shiftKey&&!e.altKey){e.preventDefault();const a=ed.selectionStart,b=ed.selectionEnd;ed.setRangeText("    ",a,b,"end");ed.dispatchEvent(new Event("input"))}});
  inp.addEventListener("input",()=>{inp.rows=Math.min(4,Math.max(1,inp.value.split("\n").length));if(S.M)reset()});
  /* ---------- ví dụ ---------- */
  function showNote(){const p=presets[S.pi]||{},n=p.note||"",el=$(".s-note");el.hidden=!n;el.querySelector(".sn-h").textContent=/^Lỗi|^Bẫy/.test(p.label||"")?"Ví dụ này cho thấy":"Ví dụ này minh họa";
    el.querySelector(".sn-1").textContent=n;el.querySelector(".sn-t").textContent=n;el.open=!MOB()}
  function load(i){const p=presets[i];S.pi=i;ed.value=p.code.replace(/\n$/,"")+"\n";inp.value=p.input||"";inp.rows=Math.min(4,Math.max(1,inp.value.split("\n").length));ed.scrollTop=0;S.bad=0;showNote();S.mview="data";S.moff=null;$(".xs-mseg").value="data";reset()}
  const pre=$(".s-pre");if(pre)pre.onchange=()=>load(+pre.value);
  /* ---------- dịch và nạp ---------- */
  function compile(){
    S.tok++;S.bad=0;exp.hidden=true;$(".s-exit").textContent="";
    const r=X86.assemble(ed.value);S.asm=r;S.warn=r.warns||[];
    if(!r.ok){S.M=null;const e=r.errors[0];S.bad=e.line;S.cur=0;
      renderAll();
      exp.hidden=false;exp.className="explain";
      exp.innerHTML=`<b>Lỗi dịch${e.line?` ở dòng ${e.line}`:""}</b><span>${escH(e.vi)}</span>${r.errors.length>1?`<span class="xs-more">${r.errors.slice(1,6).map(x=>`Dòng ${x.line}: ${escH(x.vi)}`).join("<br>")}${r.errors.length>6?"<br>…":""}</span>`:""}`;
      $(".s-exit").textContent="chưa dịch được";setRunning(false);setChip("err","Lỗi dịch · dòng "+e.line);live(true);goPane("out");cfg.onResult&&cfg.onResult(null);return false}
    S.M=new X86.Machine(r.prog,{input:inp.value?inp.value.replace(/\r/g,"")+(inp.value.endsWith("\n")?"":"\n"):"",interactive:true});
    S.prevRegs=S.M.regs();S.listKey="";
    if(S.mview==="data"&&!r.prog.dataSeg)S.mview="cs";
    return true}
  /* ---------- vẽ các phần ---------- */
  const RG=[["AX",0],["BX",3],["CX",1],["DX",2]],RP=[["SI",6],["DI",7],["BP",5],["SP",4]],RS=[["CS",1],["DS",3],["SS",2],["ES",0]];
  const FL=[["OF",11,"tràn có dấu"],["DF",10,"hướng"],["IF",9,"cho phép ngắt"],["TF",8,"bẫy"],["SF",7,"dấu"],["ZF",6,"bằng 0"],["AF",4,"nhớ phụ"],["PF",2,"chẵn lẻ"],["CF",0,"nhớ"]];
  function renderRegs(){const M=S.M,box=$(".xs-regs");
    if(!M){box.innerHTML=`<p class="mem-empty">Thanh ghi và cờ sẽ hiện ở đây khi chạy.</p>`;$(".xs-pa").innerHTML="";$(".xs-last").textContent="";return}
    const c=M.cpu,P=S.prevRegs||{};const ch=(k,v)=>P[k]!==undefined&&P[k]!==v?" chg":"";
    const g=([n,i])=>{const v=c.r[i];return`<div class="xr${ch(n.toLowerCase(),v)}"><span class="xr-n">${n}</span><span class="xr-v">${h4(v)}</span><span class="xr-b"><i>${n[0]}H ${h2(v>>8)}</i><i>${n[0]}L ${h2(v)}</i></span><span class="xr-d">${v}</span></div>`};
    const p=([n,i])=>{const v=c.r[i];return`<div class="xr${ch(n.toLowerCase(),v)}"><span class="xr-n">${n}</span><span class="xr-v">${h4(v)}</span><span class="xr-d">${v}</span></div>`};
    const s=([n,i])=>{const v=c.s[i];return`<div class="xr sg${ch(n.toLowerCase(),v)}"><span class="xr-n">${n}</span><span class="xr-v">${h4(v)}</span></div>`};
    const f=c.f,pf=P.flags;
    box.innerHTML=`<div class="xr-g">${RG.map(g).join("")}</div><div class="xr-g">${RP.map(p).join("")}</div><div class="xr-g s5">${RS.map(s).join("")}<div class="xr${ch("ip",c.ip)}"><span class="xr-n">IP</span><span class="xr-v">${h4(c.ip)}</span></div></div>
      <div class="xf" role="list" aria-label="Cờ">${FL.map(([n,b,t])=>{const on=(f>>b)&1,was=pf!==undefined?(pf>>b)&1:on;return`<span role="listitem" class="xf-i${on?" on":""}${was!==on?" chg":""}" title="${n}: cờ ${t}"><b>${n[0]}</b><i>${on}</i></span>`}).join("")}<span class="xf-v">FLAGS = ${h4(f)}</span></div>`;
    /* hình minh họa địa chỉ vật lý = đoạn × 16 + độ lệch */
    const L=M.last,pa=(sn,sv,on,ov,what)=>{const phys=((sv<<4)+ov)&0xFFFFF;return`<div class="xpa"><div class="xpa-h">${what}</div><div class="xpa-g"><span>${sn} × 16</span><code>${h4(sv)}<u>0</u></code><span>+ ${escH(on)}</span><code> ${h4(ov)}</code><span>= địa chỉ vật lý</span><code class="xpa-r">${h5(phys)}</code></div></div>`};
    let h=pa("CS",c.cs,"IP",c.ip,"Lệnh sẽ chạy tiếp theo: CS:IP = "+h4(c.cs)+":"+h4(c.ip));
    if(L&&L.ea)h+=pa(X86.SR[L.ea.seg],L.ea.segv,"EA",L.ea.off,`Ô nhớ lệnh vừa rồi dùng: ${X86.SR[L.ea.seg]}:[${L.ea.eat.replace("+d8","+độ dời").replace("+d16","+độ dời").replace("d16","địa chỉ trực tiếp")}] = ${h4(L.ea.segv)}:${h4(L.ea.off)}`);
    $(".xs-pa").innerHTML=h;
    let lt=L?`lệnh vừa chạy: ${L.cyc} chu kỳ`:"";if(L&&L.cycR){const [a,b]=L.ea?[L.cycR[2],L.cycR[3]]:[L.cycR[0],L.cycR[1]];lt+=` (bảng 8086: ${a}–${b}${L.ea?" + EA":""}, lấy cận dưới)`}
    const J=S.jmp;if(J)lt+=J.to?` · ${J.mn} nhảy từ dòng ${J.from} tới dòng ${J.to}`:` · ${J.mn} không nhảy`;
    $(".xs-last").textContent=lt;}
  function renderList(){const box=$(".xs-list"),M=S.M;
    if(!S.asm||!S.asm.ok){box.innerHTML=`<p class="mem-empty">Bấm Chạy hoặc Từng bước: trình dịch sinh mã máy cho từng lệnh, hiện ở đây cùng số chu kỳ.</p>`;$(".xs-tot").textContent="";return}
    const P=S.asm.prog,src=ed.value.split("\n"),nextPh=M?M.cpu.pa(M.cpu.cs,M.cpu.ip):-1,lastPh=M&&M.last?M.last.phys:-1;
    const rows=P.stmts.filter(s=>s.kind!=="label");
    box.innerHTML=`<table class="xl"><thead><tr><th scope="col">Địa chỉ</th><th scope="col">Mã máy</th><th scope="col">Lệnh</th><th scope="col" title="Số chu kỳ của lần chạy gần nhất">Chu kỳ</th><th scope="col" title="Số lần đã chạy">Lần</th></tr></thead><tbody>${rows.map(s=>{
      const by=s.bytes.length>6?s.bytes.slice(0,6).map(h2).join(" ")+" …":s.bytes.map(h2).join(" ");const ins=s.kind==="ins";
      const n=M&&ins?M.execCount.get(s.phys)||0:0,cy=M&&ins?M.lastCyc.get(s.phys):undefined;
      return`<tr class="${ins?"":"xl-d"}${s.phys===nextPh&&ins?" next":""}${s.phys===lastPh?" last":""}" data-line="${s.line}"><td>${h4(s.frame)}:${h4(s.off)}</td><td class="xl-b">${by}</td><td class="xl-s">${escH((src[s.line-1]||"").trim().replace(/\s*;.*$/,""))}${s.gen?" <small>(sinh tự động)</small>":""}</td><td>${cy!==undefined?cy:""}</td><td>${n||""}</td></tr>`}).join("")}</tbody></table>`;
    const c=M?M.cpu:null;
    $(".xs-tot").textContent=`mã ${P.codeSize} byte`+(c?` · ${c.steps} lệnh · ${c.total} chu kỳ`:"");
    const r=box.querySelector("tr.next")||box.querySelector("tr.last");if(r&&S.mode==="step"){/* giữ hàng đang chạy trong tầm nhìn khi đang xem phần này */}}
  function memBase(){const M=S.M,c=M.cpu,P=S.asm.prog;
    switch(S.mview){case "ds":return[c.ds,0];case "es":return[c.es,0];case "ss":return[c.ss,c.sp&0xFFF0];case "cs":return[c.cs,c.ip&0xFFF0];case "vid":return[0xB800,0];case "ivt":return[0,0];
      default:return[P.dataSeg!=null?P.dataSeg:c.ds,0]}}
  function renderMem(){const box=$(".xs-mem"),M=S.M;
    if(!M){box.innerHTML=`<p class="mem-empty">Các byte của chương trình và dữ liệu sẽ hiện ở đây khi chạy.</p>`;$(".xs-mtag").textContent="";return}
    const [seg,off0]=memBase();const off=S.moff!=null?S.moff:off0;const per=MOB()||sc.clientWidth<600?8:16,rowsN=per===8?16:8;
    const W=new Set(),R=new Set();if(M.last)for(const [k,a,n] of M.last.acc)for(let i=0;i<n;i++)(k==="w"?W:R).add(a+i);
    const names=new Map();const syms=S.asm.prog.syms;for(const k in syms){const s=syms[k];if(s.k==="var"){const len=Math.max(1,(s.len||1)*(s.type>0?s.type:1));for(let i=0;i<len&&i<256;i++)if(!names.has(s.phys+i))names.set(s.phys+i,i?s.name+"+"+i:s.name)}}
    const starts=new Set();for(const k in syms){const s=syms[k];if(s.k==="var")starts.add(s.phys)}
    let h=`<div class="xm" style="--per:${per}"><div class="xm-r xm-h"><span>${h4(seg)}:</span>${Array.from({length:per},(_,i)=>`<span>${h2(((off&15)+i)&15).slice(1)}</span>`).join("")}<span class="xm-a">ASCII</span></div>`;
    for(let r=0;r<rowsN;r++){const o=(off+r*per)&0xFFFF;let a="",cells="";
      for(let i=0;i<per;i++){const ph=((seg<<4)+((o+i)&0xFFFF))&0xFFFFF,v=M.mem[ph],nm=names.get(ph);
        cells+=`<span class="${W.has(ph)?"w":R.has(ph)?"r":""}${starts.has(ph)?" v0":nm?" v":""}"${nm?` title="${escH(nm)} · ${h5(ph)}h"`:` title="${h5(ph)}h"`}>${h2(v)}</span>`;a+=v>=32&&v<127?String.fromCharCode(v):"·"}
      h+=`<div class="xm-r"><span class="xm-o">${h4(o)}</span>${cells}<span class="xm-a">${escH(a)}</span></div>`}
    box.innerHTML=h+`</div><p class="xm-k"><span class="w">ghi</span><span class="r">đọc</span> ở lệnh vừa chạy · <span class="v0">biến</span> (chạm vào ô để xem tên) · địa chỉ vật lý = ${h4(seg)}h × 16 + độ lệch</p>`;
    $(".xs-mtag").textContent=`${h4(seg)}:${h4(off)} → ${h5(((seg<<4)+off)&0xFFFFF)}h`}
  function renderStk(){const box=$(".xs-stk"),M=S.M;
    if(!M){box.innerHTML=`<p class="mem-empty">Ngăn xếp (SS:SP) sẽ hiện ở đây khi chạy. Mỗi ô là một word (2 byte); PUSH làm SP giảm 2, POP làm SP tăng 2.</p>`;$(".xs-sp").textContent="";return}
    const c=M.cpu,P=S.asm.prog,top0=P.kind==="com"?0xFFFE:P.sp;const sp=c.sp;
    const ret=new Map();const st=P.stmts;for(let i=0;i<st.length;i++){const s=st[i];if(s.kind!=="ins")continue;const t=(ed.value.split("\n")[s.line-1]||"").replace(/;.*/,"");if(/^\s*([\w@?$]+:\s*)?CALL\b/i.test(t)){const nx=s.off+s.bytes.length;ret.set(nx,s.line)}}
    let rows="",n=0;
    if(sp===top0||(top0-sp+0x10000)%0x10000>0x400)rows=`<tr><td colspan="3" class="mem-empty">Ngăn xếp đang rỗng (SP = ${h4(sp)}h, đáy ngăn xếp).</td></tr>`;
    else for(let o=sp;o!==top0&&n<24;o=(o+2)&0xFFFF,n++){const v=M.mem[c.pa(c.ss,o)]|(M.mem[c.pa(c.ss,o+1)]<<8);const notes=[];
      if(o===sp)notes.push("← SP (đỉnh)");if(o===c.bp)notes.push("← BP");if(ret.has(v))notes.push(`địa chỉ trả về (sau CALL ở dòng ${ret.get(v)})`);
      rows+=`<tr class="${o===sp?"top":""}"><td>${h4(c.ss)}:${h4(o)}</td><td><b>${h4(v)}</b></td><td>${notes.join(" · ")}</td></tr>`}
    box.innerHTML=`<table class="xk"><thead><tr><th scope="col">SS:offset</th><th scope="col">Giá trị</th><th scope="col">Ghi chú</th></tr></thead><tbody>${rows}</tbody></table>`;
    $(".xs-sp").textContent=`SP = ${h4(sp)} · đáy ${h4(top0)}`}
  function renderOut(){const M=S.M,box=$(".xs-scr");
    if(!M){box.innerHTML=`<span class="con-empty">Màn hình văn bản 80 × 25 của DOS. Bấm Chạy hoặc Từng bước để xem chương trình in gì.</span>`;$(".s-wait").hidden=true;return}
    const L=M.screen();let last=L.length-1;while(last>0&&!L[last])last--;last=Math.max(last,M.curY);
    const cx=M.curX,cy=M.curY;
    box.innerHTML=L.slice(0,last+1).map((l,y)=>{if(y!==cy||M.done)return escH(l)||" ";const p=l.padEnd(cx+1," ");return escH(p.slice(0,cx))+`<span class="xs-cur">${escH(p[cx])}</span>`+escH(p.slice(cx+1))}).join("\n");
    const wb=$(".s-wait");
    if(M.waiting){if(wb.hidden){wb.hidden=false;const ci=wb.querySelector(".con-in");ci.value="";$(".xs-wk").textContent=M.waiting==="line"?"Chương trình đọc một dòng (INT 21h, hàm 0Ah): gõ rồi bấm Gửi (hoặc Enter).":"Chương trình đọc từng phím: gõ một hoặc nhiều ký tự rồi bấm Gửi; Enter được gửi như phím Enter.";ci.focus({preventScroll:true});scrollIn(wb)}}
    else wb.hidden=true;
    const n=M.out.length;if(n>S.outN&&!seen("out"))navB("out").classList.add("new");S.outN=n}
  function renderAsk(){const box=$(".xs-ask");if(!S.ask&&!S.fb){box.hidden=true;return}box.hidden=false;
    if(S.ask){const a=S.ask;box.innerHTML=`<p class="xa-q"><b>Đoán trước:</b> ${a.q}</p>`+(a.kind==="jump"?`<div class="xa-b"><button type="button" class="btn" data-a="1">Có nhảy</button><button type="button" class="btn" data-a="0">Không nhảy</button></div>`:a.kind==="flag"?`<div class="xa-b"><button type="button" class="btn" data-a="1">${a.flag} = 1</button><button type="button" class="btn" data-a="0">${a.flag} = 0</button></div>`:`<div class="xa-b"><label><span class="vh">Giá trị dự đoán</span><input class="xa-in" inputmode="text" autocomplete="off" spellcheck="false" placeholder="ví dụ 0A3Fh"></label><button type="button" class="btn pri" data-a="v">Kiểm tra</button></div>`)+`<button type="button" class="xa-skip">Bỏ qua câu này</button>`;
      box.querySelectorAll("[data-a]").forEach(b=>b.onclick=()=>answer(b.dataset.a));const ii=box.querySelector(".xa-in");if(ii){ii.onkeydown=e=>{if(e.key==="Enter"){e.preventDefault();answer("v")}};ii.focus({preventScroll:true})}
      box.querySelector(".xa-skip").onclick=()=>{S.ask=null;doStep()}}
    else box.innerHTML=`<p class="xa-f ${S.fb.ok?"ok":"bad"}">${S.fb.t}</p>`}
  function renderAll(){const M=S.M;
    btnBack.disabled=S.running||!(M&&S.mode==="step"&&M.canBack());btnReset.disabled=!M&&!S.bad;runLabel();
    const stick=sc.scrollHeight-sc.scrollTop-sc.clientHeight<24&&sc.scrollTop>0;
    if(M&&!M.done&&!S.running){if(M.waiting)setChip("wait","Đang chờ nhập dữ liệu");else if(S.mode==="step")setChip("step",S.cur?`Dừng ở dòng ${S.cur}`:"Dừng (ngoài chương trình)")}
    if(M){const ph=M.cpu.pa(M.cpu.cs,M.cpu.ip);S.cur=M.done?0:S.asm.prog.lineAt.get(ph)||0}
    S.jmp=jumpOf(M);
    paint();renderAsk();renderRegs();renderList();renderMem();renderStk();renderOut();keepCur();
    if(M)hold();if(stick)sc.scrollTop=sc.scrollHeight;paintNav()}
  /* lệnh nhảy vừa chạy (chế độ Từng bước): {from, to} khi nhảy tới một dòng của chương trình; {from, to:0} khi lệnh nhảy có điều kiện không nhảy */
  function jumpOf(M){const L=M&&M.last;if(!M||M.done||S.running||S.mode!=="step"||!L||!L.line)return null;
    const mn=((ed.value.split("\n")[L.line-1]||"").replace(/;.*/,"").replace(/^\s*[A-Za-z_@?$][\w@?$]*\s*:/,"").trim().split(/\s+/)[0]||"").toUpperCase();
    if(!/^(J[A-Z]{1,4}|LOOP[A-Z]*|CALL|RET[NF]?|IRET)$/.test(mn))return null;
    if(L.jumped)return S.cur&&S.cur!==L.line?{from:L.line,to:S.cur,mn}:null;
    return /^(J|LOOP)/.test(mn)&&mn!=="JMP"?{from:L.line,to:0,mn}:null}
  function setRunning(on){S.running=on;btnStep.disabled=on;if(on)btnBack.disabled=true;runLabel()}
  function runLabel(){const cont=!S.running&&S.M&&S.mode==="step"&&!S.M.done;btnRun.textContent=S.running?"Tạm dừng":cont?"▶ Chạy tiếp":"▶ Chạy";btnRun.classList.toggle("stop",S.running)}
  function reset(){S.tok++;S.M=null;S.asm=null;setRunning(false);setChip("idle","Chưa chạy");S.cur=0;S.mode=null;S.ask=null;S.fb=null;S.outN=0;S.prevRegs=null;exp.hidden=true;btnStep.textContent="Từng bước";$(".s-exit").textContent="";live(false);unhold();navB("out").classList.remove("new");renderAll()}
  function fresh(){unhold();S.outN=0;navB("out").classList.remove("new");live(true);sc.scrollTop=0}
  /* ---------- kết thúc ---------- */
  function finish(r){const M=S.M,c=M.cpu;setRunning(false);S.cur=0;btnStep.textContent="Từng bước";
    const P=S.asm.prog,us=(c.total/MHZ).toLocaleString("vi-VN",{maximumFractionDigits:1});
    const stat=`${c.steps.toLocaleString("vi-VN")} lệnh · ${c.total.toLocaleString("vi-VN")} chu kỳ (≈ ${us} µs ở ${MHZ} MHz) · mã ${P.codeSize} byte`;
    const tips=[];
    if(M.notes.has("ds"))tips.push("INT 21h/09h chạy khi DS vẫn trỏ vào PSP (DOS đặt DS = ES = PSP lúc bắt đầu). Bạn đã nạp DS chưa: MOV AX, @DATA rồi MOV DS, AX?");
    if(M.notes.has("full"))tips.push("Dòng nhập dài hơn bộ đệm của INT 21h/0Ah: các ký tự thừa bị bỏ (DOS kêu bíp).");
    if(M.notes.has("utf8"))tips.push("Dữ liệu nhập có chữ có dấu: màn hình DOS chỉ có bảng mã 1 byte (CP437), ký tự đó được thay bằng “?”.");
    for(const w of S.warn||[])tips.push(`Dòng ${w.line}: ${escH(w.vi)}`);
    if(r.s==="crash"||r.s==="limit"){const ln=M.last&&M.last.line;S.bad=ln||0;setChip("err",ln?`Lỗi khi chạy · dòng ${ln}`:"Lỗi khi chạy");$(".s-exit").textContent="dừng bất thường";
      exp.hidden=false;exp.className="explain";exp.innerHTML=`<b>Lỗi khi chạy${ln?` ở dòng ${ln}`:""}</b><span>${escH(M.crash.vi)}</span><span class="xs-stat">${stat}</span>`+tips.map(t=>`<span class="xs-tip">${t}</span>`).join("")}
    else{const how=M.halted?"dừng ở lệnh HLT":M.exit!=null?`kết thúc, mã thoát ${M.exit}`:"kết thúc";setChip("ok","Đã chạy xong");$(".s-exit").textContent=how;
      exp.hidden=false;exp.className="explain good";exp.innerHTML=`<b>Chương trình đã ${how}</b><span class="xs-stat">${stat}</span>`+tips.map(t=>`<span class="xs-tip">${t}</span>`).join("")}
    renderAll();setTimeout(()=>goPane("out"),0);cfg.onResult&&cfg.onResult(M)}
  /* ---------- chạy ---------- */
  function startIfNeeded(){if(S.M&&!S.M.done)return true;fresh();S.mode=null;if(!compile())return false;return true}
  function after(r){const M=S.M;
    if(r.s==="wait"){S.wasRun=S.running;setRunning(false);S.mode="step";setChip("wait","Đang chờ nhập dữ liệu");renderAll();goPane("out");return true}
    if(r.s==="exit"||r.s==="crash"||r.s==="halt"||r.s==="limit"){finish(r);return true}
    if(r.s==="bp"){setRunning(false);S.mode="step";S.fb={ok:true,t:"Gặp INT 3 (điểm dừng): chương trình tạm dừng. Bấm Bước tiếp hoặc Chạy tiếp."};renderAll();return true}
    return false}
  function doStep(){const M=S.M;S.prevRegs=M.regs();M.trace=true;const ask=S.pendAsk;S.pendAsk=null;
    const r=M.step();
    if(ask&&r.s!=="wait")S.fb=judge(ask,M);
    if(!after(r)){S.mode="step";btnStep.textContent="Bước tiếp →";renderAll()}}
  function judge(a,M){const c=M.cpu,L=M.last;
    if(a.kind==="jump"){const j=!!(L&&L.jumped);const ok=(a.guess==="1")===j;return{ok,t:(ok?"Đúng! ":"Chưa đúng: ")+(j?"lệnh đã nhảy.":"lệnh không nhảy, chạy tiếp lệnh ngay sau.")}}
    if(a.kind==="flag"){const v=(c.f>>6)&1;const ok=String(v)===a.guess;return{ok,t:(ok?"Đúng! ":"Chưa đúng: ")+`${a.flag} = ${v}`+(v?" (hai giá trị bằng nhau / kết quả bằng 0).":" (kết quả khác 0).")}}
    const v=c.getReg(a.reg),g=parseHex(a.guess),w=/^[ABCD][LH]$/.test(a.reg)?2:4;const ok=g!==null&&(g&(w===2?255:0xFFFF))===v;
    return{ok,t:(ok?"Đúng! ":"Chưa đúng: ")+`${a.reg} = ${(v).toString(16).toUpperCase().padStart(w,"0")}h (= ${v}).`+(g===null&&a.guess?" Bạn ghi chưa đúng dạng số hệ 16.":"")}}
  function answer(v){const a=S.ask;if(!a)return;if(v==="v"){const ii=$(".xa-in");a.guess=ii?ii.value:""}else a.guess=v;S.ask=null;S.pendAsk=a;doStep()}
  function step(){if(S.running)return;if(S.M&&S.M.done){reset()}
    if(!S.M){if(!startIfNeeded())return;S.mode="step";S.prevRegs=S.M.regs();btnStep.textContent="Bước tiếp →";setChip("step","Đã nạp chương trình");renderAll();return}
    if(S.M.waiting){goPane("out");return}
    S.fb=null;
    if(S.predOn){const ph=S.M.cpu.pa(S.M.cpu.cs,S.M.cpu.ip),ln=S.asm.prog.lineAt.get(ph);const q=ln?askFor(ed.value.split("\n")[ln-1]||""):null;
      if(q&&!S.ask){S.ask=q;renderAll();goPane("reg");return}}
    S.ask=null;doStep()}
  function back(){if(!S.M||S.running)return;if(S.M.back()){S.M.done=false;S.fb=null;S.ask=null;exp.hidden=true;$(".s-exit").textContent="";S.bad=0;S.mode="step";btnStep.textContent="Bước tiếp →";renderAll()}}
  function runAll(){if(S.running){S.tok++;setRunning(false);S.mode="step";renderAll();return}
    if(S.M&&S.M.done)reset();
    if(!S.M&&!startIfNeeded())return;
    if(S.M.waiting){goPane("out");return}
    S.ask=null;S.fb=null;S.mode="run";setRunning(true);setChip("run","Đang chạy…");const tok=++S.tok;const M=S.M;M.trace=false;
    const chunk=()=>{if(tok!==S.tok)return;const t0=performance.now();let r={s:"ok"};
      while(performance.now()-t0<14){r=M.run(2000);if(r.s!=="ok")break}
      if(r.s!=="ok"){M.trace=true;S.prevRegs=null;after(r);return}
      setChip("run",`Đang chạy… ${M.cpu.steps.toLocaleString("vi-VN")} lệnh`);setTimeout(chunk,0)};
    chunk()}
  btnStep.onclick=step;btnRun.onclick=runAll;btnBack.onclick=back;btnReset.onclick=()=>{S.bad=0;reset()};
  $(".s-predon").onchange=e=>{S.predOn=e.target.checked;S.ask=null;S.fb=S.predOn?{ok:true,t:"Đã bật Đoán trước: bấm Từng bước, trước mỗi lệnh có câu hỏi, bạn đoán kết quả rồi trình mô phỏng mới chạy lệnh đó."}:null;renderAll();if(S.predOn)goPane("reg")};
  /* bàn phím trong lúc chạy */
  function feedNow(eof){const M=S.M;if(!M||!M.waiting)return;const ci=$(".con-in");if(eof)M.eof=true;else M.feed(ci.value+"\n");ci.value="";M.waiting=null;
    if(S.wasRun){S.wasRun=false;runAll()}else doStep()}
  $(".con-in").addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();feedNow(false)}});
  $(".s-send").onclick=()=>feedNow(false);$(".eof-btn").onclick=()=>feedNow(true);
  /* bộ nhớ: chọn vùng, lật trang */
  $(".xs-mseg").onchange=e=>{S.mview=e.target.value;S.moff=null;renderMem()};
  $(".xs-mprev").onclick=()=>{if(!S.M)return;const [,o]=memBase();S.moff=((S.moff!=null?S.moff:o)-128)&0xFFFF;renderMem()};
  $(".xs-mnext").onclick=()=>{if(!S.M)return;const [,o]=memBase();S.moff=((S.moff!=null?S.moff:o)+128)&0xFFFF;renderMem()};
  /* bấm một hàng ở phần Mã máy: tô dòng code tương ứng */
  $(".xs-list").addEventListener("click",e=>{const tr=e.target.closest("tr[data-line]");if(!tr)return;const ln=+tr.dataset.line,lh=parseFloat(getComputedStyle(ed).lineHeight)||22;ed.scrollTop=Math.max(0,(ln-1)*lh-ed.clientHeight/2);sync()});
  let mq=MOB()||sc.clientWidth<600;G.addEventListener("resize",()=>{const m=MOB()||sc.clientWidth<600;if(m!==mq){mq=m;renderMem()}});
  load(0);
  const api={el:root,get:()=>ed.value,set:(c,note)=>{ed.value=c;S.bad=0;if(note){/* code không phải ví dụ đang chọn (code mẫu bài tập): thay ghi chú của ví dụ */const el=$(".s-note");el.hidden=false;el.querySelector(".sn-h").textContent=note.head||"Code đang mở";el.querySelector(".sn-1").textContent=note.text||"";el.querySelector(".sn-t").textContent=note.text||""}reset()},setInput:v=>{inp.value=v||"";if(S.M)reset()},
    run:()=>{reset();runAll()},step,get machine(){return S.M},get asm(){return S.asm},load};
  root.x86=api;return api};
/* ---------- chấm bài (không cần giao diện; dùng được trong Node) ----------
   ex: {tests:[{in, out, ahAfterKey (AH sau mỗi lần INT 21h đọc phím), stuck:[{at, off, bit, val}] (bit RAM kẹt), regs:{AX:…}, mem:[{at:"ten_bien", bytes:[…]} | {at:"ten_bien", word:…, mask?}], regsRel:{ES:["DS",1]}}], perf:{cycles, bytes}, require:[tên lệnh], forbid:[tên lệnh]}
   Trả về {ok, R:[{ok, why, out, want, cyc}], cyc (lớn nhất), bytes, perfOk} */
/* Byte dữ liệu (DB/DW/DD) mà CPU chạy như lệnh: cộng vào số byte mã khi chấm, để không lách được giới hạn byte bằng cách viết lệnh
   bằng DB (P2 của lượt duyệt chương 1). Dữ liệu không bị chạy (biến của .COM, chuỗi in ra) không tính. */
X86.dataExec=function(P){const D=new Set(),hit=new Set();
  for(const s of P.stmts)if(s.kind==="data")for(let i=0;i<s.bytes.length;i++)D.add((s.phys+i)&0xFFFFF);
  return{watch(cpu){if(D.size)cpu.onExec=(ph,n)=>{for(let i=0;i<n;i++){const a=(ph+i)&0xFFFFF;if(D.has(a))hit.add(a)}}},get n(){return hit.size}}};
/* Lệnh bắt buộc / lệnh cấm (quyết định của chủ khóa 06/11/2026; dùng chung mọi bài, ghi trong bai-tap.json):
   ex.require: ["XCHG"] — mỗi test phải CHẠY ít nhất một lệnh có tên đó do học viên viết (lệnh nằm ở chỗ không chạy tới không tính);
   ex.forbid: ["MOVSB"] — không được viết lệnh có tên đó (kể cả kèm tiền tố). So theo tên lệnh trong mã nguồn; lệnh do .STARTUP/.EXIT
   sinh ra không tính. Đề bài phải nói rõ yêu cầu này (người soạn bài kiểm). */
X86.useCheck=function(P,ex){const U=a=>(a||[]).map(x=>String(x).toUpperCase());const req=U(ex.require),fb=U(ex.forbid);
  const ins=P.stmts.filter(s=>s.kind==="ins"&&!s.gen&&s.mn),bad=ins.filter(s=>fb.includes(s.mn)),at={};
  for(const m of req)at[m]=ins.filter(s=>s.mn===m).map(s=>s.phys);
  let ran=null;
  return{watch(cpu){if(!req.length)return;ran=new Set();const f0=cpu.onExec;cpu.onExec=(ph,n)=>{if(f0)f0(ph,n);ran.add(ph)}},
    why(){const w=bad.map(s=>`Đề bài không cho dùng lệnh ${s.mn} (dòng ${s.line}).`);
      for(const m of req){if(!at[m].length)w.push(`Đề bài yêu cầu dùng lệnh ${m}: chương trình chưa có lệnh ${m}.`);else if(ran&&!at[m].some(p=>ran.has(p)))w.push(`Đề bài yêu cầu dùng lệnh ${m}: có lệnh ${m} nhưng test này không chạy tới lệnh đó.`)}
      return w}}};
X86.grade=function(ex,src,opt){opt=opt||{};const r=X86.assemble(src);
  if(!r.ok)return{ok:false,compile:r.errors,R:[],why:"Lỗi dịch ở dòng "+r.errors[0].line+": "+r.errors[0].vi};
  const P=r.prog,R=[],DX=X86.dataExec(P);let maxC=0;
  for(const t of ex.tests||[]){const M=new X86.Machine(P,{input:t.in?String(t.in).replace(/\r/g,"")+(String(t.in).endsWith("\n")?"":"\n"):"",interactive:false,maxSteps:opt.maxSteps||2000000,ahAfterKey:t.ahAfterKey,stuck:t.stuck});M.trace=false;DX.watch(M.cpu);const UC=X86.useCheck(P,ex);UC.watch(M.cpu);
    let s;for(;;){s=M.run(100000);if(s.s!=="ok"&&s.s!=="bp")break}   // INT 3 (điểm dừng) không làm dừng khi chấm, như DOS (vectơ 3 mặc định là IRET)
    const out=M.printed(),why=[],strict=t.dosExit!==false;   // mặc định chỉ nhận INT 21h/4Ch (đề mọi bài DOS yêu cầu); dosExit: false để nhận cả HLT, INT 20h, RET của .COM
    if(s.s==="crash"||s.s==="limit")why.push(M.crash.vi);
    else if(M.exit==null&&!M.halted)why.push("Chương trình chưa kết thúc bằng INT 21h/4Ch.");
    else if(strict&&M.exit==null)why.push("Chương trình dừng bằng HLT; đề yêu cầu kết thúc bằng INT 21h hàm 4Ch (HLT không trả quyền cho DOS).");   // HLT không được tính là kết thúc
    else if(strict&&M.exitVia&&M.exitVia!=="4C")why.push("Chương trình kết thúc bằng "+(M.exitVia==="00"?"INT 21h hàm 00h":"INT 20h (hoặc RET về PSP:0000 của .COM)")+"; đề yêu cầu kết thúc bằng INT 21h hàm 4Ch.");   // chỉ nhận INT 21h/4Ch (INT 20h ít hơn 4 chu kỳ, 3 byte; trong .EXE còn sai vì CS ≠ PSP)
    else if((M.exitVia==="20"||M.exitVia==="00")&&P.kind==="exe"&&M.exitCS!==P.psp)why.push("Chương trình .EXE kết thúc bằng "+(M.exitVia==="00"?"INT 21h hàm 00h":"INT 20h")+" khi CS = "+X86.hex4(M.exitCS)+"h ≠ PSP ("+X86.hex4(P.psp)+"h): trên DOS thật hai cách này chỉ đúng khi CS = PSP (chương trình .COM). Dùng MOV AX, 4C00h / INT 21h.");   // cả khi test ghi dosExit: false
    if(t.out!=null&&out!==X86.normOut(t.out))why.push("Kết quả in ra chưa đúng.");
    if(t.regs)for(const k in t.regs){const v=M.cpu.getReg(k);if(v!==(t.regs[k]&(/^[ABCD][LH]$/i.test(k)?255:0xFFFF)))why.push(`${k.toUpperCase()} = ${v.toString(16).toUpperCase()}h, cần ${t.regs[k].toString(16).toUpperCase()}h.`)}
    if(t.mem)for(const q of t.mem){const s0=P.syms[String(q.at).toUpperCase()];if(!s0){why.push(`Không thấy biến ${q.at} (giữ nguyên tên biến của đề bài).`);continue}
      const want=q.bytes||(q.word!=null?[q.word&255,(q.word>>8)&255]:[]);const got=want.map((_,i)=>M.mem[s0.phys+i]);
      const mk=q.mask!=null?[q.mask&255,(q.mask>>8)&255]:null,mb=i=>mk?mk[i]!=null?mk[i]:0:255;   // mask (word): chỉ so các bit = 1 của mặt nạ
      if(got.some((v,i)=>(v&mb(i))!==(want[i]&mb(i))))why.push(`Biến ${q.at} = ${got.map(X86.hex2).join(" ")}, cần ${want.map(X86.hex2).join(" ")}${mk?` (chỉ so các bit của mặt nạ ${X86.hex4(q.mask)}h)`:""}.`)}
    /* regsRel: {ES: ["DS", 1]} — thanh ghi ES phải bằng DS + 1 lúc kết thúc (ràng buộc cách làm không phụ thuộc chỗ nạp) */
    if(t.regsRel)for(const k in t.regsRel){const [b,d]=t.regsRel[k],v=M.cpu.getReg(k),w=(M.cpu.getReg(b)+(d||0))&0xFFFF;
      if(v!==w)why.push(`${k.toUpperCase()} = ${X86.hex4(v)}h, đề yêu cầu ${k.toUpperCase()} = ${b.toUpperCase()}${d?(d>0?" + ":" − ")+Math.abs(d):""} = ${X86.hex4(w)}h.`)}
    why.push(...UC.why());
    maxC=Math.max(maxC,M.cpu.total);R.push({ok:!why.length,why,out,want:t.out,cyc:M.cpu.total,steps:M.cpu.steps,in:t.in})}
  const okAll=R.every(x=>x.ok);let perfOk=true;const pf=ex.perf||{};
  if(okAll&&pf.cycles!=null&&maxC>pf.cycles)perfOk=false;
  const bytes=P.codeSize+DX.n;
  if(okAll&&pf.bytes!=null&&bytes>pf.bytes)perfOk=false;
  return{ok:okAll&&perfOk,pass:R.filter(x=>x.ok).length,R,cyc:maxC,bytes,dataBytes:DX.n,perfOk,perf:pf}};
/* ---------- bài tập chấm tự động trên trang ---------- */
G.makeX86Ex=function(el,sim,list,opt){opt=opt||{};const L=(el.id||"ex-x86").replace("ex-","");
  /* không ghi vào EXERCISES: trang Thực hành (60-practice.js) chấm bằng trình mô phỏng C++, chưa chấm được bài 8086 */
  const st=list.map(()=>null);let cur=0;
  const stateOf=i=>G.TRACK&&G.TRACK.exOf?G.TRACK.exOf(L+"-"+i):null;
  const mark=i=>{const x=stateOf(i);return x?(x.pass?["ok","✓","đạt"]:["bad","✗","chưa đạt"]):["","","chưa nộp"]};
  el.classList.add("exw","x86ex");
  el.innerHTML=`<div class="ex-list" role="tablist" aria-label="Chọn bài tập">${list.map((e,i)=>`<button type="button" role="tab" id="${el.id}-t${i}" aria-controls="${el.id}-p" data-pick="${i}" aria-selected="${i===0}" tabindex="${i===0?0:-1}"><span class="ex-i" aria-hidden="true"></span><span class="ex-n">${i+1}. ${escH(e.t)}</span><span class="vh ex-s"></span></button>`).join("")}</div>
    <div class="ex ex-panel" role="tabpanel" id="${el.id}-p" aria-labelledby="${el.id}-t0"></div>
    <div class="ex-btns"><button type="button" class="btn" data-act="load">Nạp code mẫu</button><button type="button" class="btn" data-act="try">Chạy thử</button><button type="button" class="btn pri" data-act="grade">Nộp bài</button></div>
    <div class="ex-st" role="status" aria-live="polite"></div>`;
  const tabs=[...el.querySelectorAll("[data-pick]")],panel=el.querySelector(".ex-panel"),stEl=el.querySelector(".ex-st");
  const perfTxt=p=>[p.cycles!=null?`không quá ${p.cycles.toLocaleString("vi-VN")} chu kỳ`:"",p.bytes!=null?`mã không quá ${p.bytes} byte`:""].filter(Boolean).join(", ");
  function paintList(){tabs.forEach((b,i)=>{const [c,ic,t]=mark(i);b.querySelector(".ex-i").className="ex-i "+c;b.querySelector(".ex-i").textContent=ic;b.querySelector(".ex-s").textContent=" ("+t+")"})}
  function render(){const e=list[cur],t0=(e.tests||[])[0]||{};
    tabs.forEach((b,i)=>{b.setAttribute("aria-selected",i===cur);b.tabIndex=i===cur?0:-1});panel.setAttribute("aria-labelledby",`${el.id}-t${cur}`);
    panel.innerHTML=`<h4>Bài ${cur+1}. ${escH(e.t)}</h4><p>${e.dHTML||escH(e.d||"")}</p>${e.perf?`<p class="ex-perf">Yêu cầu độ hiệu quả: <b>${perfTxt(e.perf)}</b> (đo trên test chạy lâu nhất).</p>`:""}${(e.require||[]).length||(e.forbid||[]).length?`<p class="ex-perf">Yêu cầu về lệnh: ${[(e.require||[]).length?`phải chạy lệnh <b>${e.require.map(escH).join(", ")}</b>`:"",(e.forbid||[]).length?`không dùng <b>${e.forbid.map(escH).join(", ")}</b>`:""].filter(Boolean).join("; ")} (trang chấm kiểm).</p>`:""}
      <div class="io"><div><div class="pane-h" style="padding:0 0 4px">Ví dụ bàn phím</div><pre>${escH(t0.in||"(không nhập)")}</pre></div><div><div class="pane-h" style="padding:0 0 4px">Màn hình cần có</div><pre>${escH(t0.out!=null?t0.out:"(chấm theo thanh ghi / bộ nhớ)")}</pre></div></div>`;
    stEl.innerHTML=st[cur]||`<p class="ex-todo">Chưa nộp bài này · ${(e.tests||[]).length} test sẽ được chấm.</p>`;paintList()}
  tabs.forEach((b,i)=>{b.onclick=()=>{cur=i;render()};b.onkeydown=ev=>{const d=ev.key==="ArrowRight"||ev.key==="ArrowDown"?1:ev.key==="ArrowLeft"||ev.key==="ArrowUp"?-1:0;if(!d)return;ev.preventDefault();cur=(cur+d+list.length)%list.length;render();tabs[cur].focus()}});
  el.querySelector('[data-act="load"]').onclick=()=>{const e=list[cur];sim.set(e.start||"",{head:"Code mẫu của bài tập",text:"Bài "+(cur+1)+". "+e.t+": viết tiếp rồi bấm Chạy thử, Nộp bài ở mục bài tập."});sim.setInput((e.tests&&e.tests[0]&&e.tests[0].in)||"");sim.el.scrollIntoView({behavior:reduce()?"auto":"smooth",block:"start"})};
  el.querySelector('[data-act="try"]').onclick=()=>{const e=list[cur];sim.setInput((e.tests&&e.tests[0]&&e.tests[0].in)||"");stEl.innerHTML=`<p class="ex-todo">Đang chạy thử với test 1 trên trình mô phỏng ở trên.</p>`;sim.run()};
  el.querySelector('[data-act="grade"]').onclick=()=>grade(cur);
  function grade(i){const e=list[i],g=X86.grade(e,sim.get());
    if(G.TRACK&&G.TRACK.ex)G.TRACK.ex(L+"-"+i,g.ok,{cyc:g.cyc,bytes:g.bytes});
    let h;
    if(g.compile)h=`<div class="ex-res bad"><b>Chưa dịch được</b><p>${escH(g.why)}</p></div>`;
    else{h=`<div class="ex-res ${g.ok?"ok":"bad"}"><b>${g.ok?"Đạt":"Chưa đạt"}: ${g.pass}/${g.R.length} test đúng</b><ol class="x-tests">${g.R.map((r,k)=>`<li class="${r.ok?"ok":"bad"}">Test ${k+1}: ${r.ok?"đúng":"sai"} · ${r.steps.toLocaleString("vi-VN")} lệnh, ${r.cyc.toLocaleString("vi-VN")} chu kỳ${r.ok?"":`<br>${r.why.map(escH).join("<br>")}${r.want!=null&&r.out!==X86.normOut(r.want)?`<div class="io"><div><div class="pane-h" style="padding:0 0 4px">Màn hình của bạn</div><pre>${escH(r.out||"(trống)")}</pre></div><div><div class="pane-h" style="padding:0 0 4px">Cần có</div><pre>${escH(X86.normOut(r.want))}</pre></div></div>`:""}`}</li>`).join("")}</ol>`;
      if(e.perf&&g.R.every(r=>r.ok))h+=`<p class="x-perf ${g.perfOk?"ok":"bad"}">Độ hiệu quả: ${g.cyc.toLocaleString("vi-VN")} chu kỳ${e.perf.cycles!=null?` / giới hạn ${e.perf.cycles.toLocaleString("vi-VN")}`:""} · mã ${g.bytes} byte${g.dataBytes?` (gồm ${g.dataBytes} byte DB/DW chạy như lệnh)`:""}${e.perf.bytes!=null?` / giới hạn ${e.perf.bytes}`:""}${g.perfOk?" → đạt.":" → chưa đạt: thử dùng lệnh ngắn hơn, ít lần truy cập bộ nhớ hơn, hoặc lệnh chuỗi."}</p>`;
      h+="</div>"}
    st[i]=h;opt.onGrade&&opt.onGrade(i,g);cur=i;render()}
  if(doc)doc.addEventListener("amts-progress",paintList);
  render();return{select:i=>{cur=i;render()},grade,get cur(){return cur}}};
})(typeof window!=="undefined"?window:globalThis);
/* ===================== trình mô phỏng của khóa (platform/js/59-x86-biu.js) ===================== */
/* ===================== Mô hình hàng đợi lệnh 8086/8088 (EU – BIU) · phần máy =====================
   Chỉ tải trên trang khóa mpu8086 (build.py SIM_FILES). Không dùng DOM: chạy được trong Node (tools/x86-test/biu.js).
   Đây là MÔ HÌNH GIẢNG DẠY theo từng chu kỳ xung nhịp, không phải bản sao chính xác từng chu kỳ của CPU thật.
   Tài liệu, giả định và giới hạn: docs/TRINH-MO-PHONG-8086.md mục 12.

   Quy tắc (giả định, ghi rõ cho học viên):
     1. Mỗi chu kỳ bus (nạp lệnh hoặc EU đọc/ghi bộ nhớ) dài 4 chu kỳ xung nhịp T1–T4, không có trạng thái chờ.
     2. BIU nạp trước khi bus rảnh, EU không xin bus và hàng đợi còn trống ít nhất `free` byte
        (8086: hàng đợi 6 byte, trống ≥ 2 byte, nạp 1 word ở địa chỉ chẵn, 1 byte nếu địa chỉ lẻ;
         8088: hàng đợi 4 byte, trống ≥ 1 byte, nạp 1 byte mỗi chu kỳ bus).
        Byte nạp được vào hàng đợi ở cuối T4.
     3. EU lấy byte của lệnh kế tiếp ra khỏi hàng đợi ngay khi có (đầu mỗi chu kỳ); khi đã lấy đủ mọi byte của lệnh thì bắt đầu chạy
        đúng số chu kỳ trong bảng thời gian lệnh (bảng của Intel giả định lệnh đã nằm sẵn trong hàng đợi). Đơn giản hóa: EU thật
        bắt đầu giải mã từ byte đầu và lấy dần các byte sau trong lúc chạy; mô hình bỏ qua phần chồng lấn đó.
     4. Lệnh có m lần truy cập bộ nhớ dùng bus trong 4·m chu kỳ cuối của lệnh. Nếu lúc đó BIU đang nạp dở, EU đứng chờ
        tới khi chu kỳ bus đó xong (tối đa 3 chu kỳ). EU được ưu tiên hơn việc nạp trước.
     5. Lệnh nhảy (j = true): khi lệnh xong, hàng đợi bị xóa; byte của chu kỳ nạp đang dở bị bỏ; BIU nạp lại từ địa chỉ đích.
     6. 8088: mỗi lần truy cập một word cần 2 chu kỳ bus, và lệnh tốn thêm 4 chu kỳ cho mỗi word (quy tắc bảng thời gian 8088).

   X86Q.run(list, {cpu:"8086"|"8088", image:{địa chỉ: byte}}) → {clocks, segs, total, stats, …}
     list: các lệnh ĐÃ CHẠY theo thứ tự (vết chạy thật), mỗi phần tử {t, a (độ lệch), b:[byte], c (chu kỳ 8086), m (số lần truy cập bộ nhớ), w (1 = word), j (nhảy)}.
*/
(function(G){
"use strict";
const VERSION="0.1.0";
const PROF={"8086":{cpu:"8086",Q:6,free:2,wide:2},"8088":{cpu:"8088",Q:4,free:1,wide:1}};
const MAXCLK=20000;
const hx=(v,n)=>(v>>>0).toString(16).toUpperCase().padStart(n||4,"0");
function check(list){
  if(!Array.isArray(list)||!list.length)throw new Error("Danh sách lệnh rỗng.");
  list.forEach((x,i)=>{const where="Lệnh "+(i+1)+" ("+(x&&x.t)+"): ";
    if(!x||!Array.isArray(x.b)||x.b.length<1||x.b.length>6)throw new Error(where+"cần 1–6 byte mã.");
    if(!Number.isInteger(x.a)||x.a<0||x.a>0xFFFF)throw new Error(where+"độ lệch sai.");
    if(!Number.isInteger(x.c)||x.c<1)throw new Error(where+"số chu kỳ phải là số nguyên dương.");
    if(!Number.isInteger(x.m||0)||(x.m||0)<0)throw new Error(where+"số lần truy cập bộ nhớ sai.");
    if(4*(x.m||0)>x.c)throw new Error(where+"4 × số lần truy cập bộ nhớ lớn hơn số chu kỳ của lệnh.");
    const nx=list[i+1];
    if(nx&&!x.j&&nx.a!==((x.a+x.b.length)&0xFFFF))throw new Error(where+"lệnh sau không nằm ngay sau lệnh này mà lệnh không phải lệnh nhảy.")})}
function run(list,opt){
  opt=opt||{};const P=PROF[opt.cpu||"8086"];if(!P)throw new Error("CPU phải là 8086 hoặc 8088.");
  check(list);
  const img=new Map();
  if(opt.image)for(const k of Object.keys(opt.image))img.set(+k,opt.image[k]);
  for(const x of list)x.b.forEach((v,i)=>img.set((x.a+i)&0xFFFF,v));
  const L=list.map(x=>{const m0=x.m||0,w=!!x.w;
    return P.cpu==="8088"&&w?{x,n:x.b.length,c:x.c+4*m0,m:2*m0}:{x,n:x.b.length,c:x.c,m:m0}});
  let k=0,i=0,q=0,fa=list[0].a,ca=list[0].a,bus=null,eu={st:"wait"};
  const Qb=[];   // byte trong hàng đợi: {a, v}
  const st={fetch:0,mem:0,idle:0,euRun:0,euWaitQ:0,euWaitBus:0,flush:0,discard:0,fetched:0};
  const clocks=[],done=[];
  while(i<L.length||eu.st==="exec"){
    if(++k>MAXCLK)throw new Error("Quá "+MAXCLK+" chu kỳ.");
    const ev=[];
    /* 1. EU bắt đầu lệnh mới nếu đủ byte */
    if(eu.st==="wait"&&i<L.length&&q>0){
      if(!eu.got&&ca!==L[i].x.a)throw new Error("Nội bộ: hàng đợi lệch địa chỉ.");
      const t=Math.min(q,L[i].n-(eu.got||0));eu.got=(eu.got||0)+t;Qb.splice(0,t);q-=t;ca=(ca+t)&0xFFFF;
      if(eu.got===L[i].n){eu={st:"exec",idx:i,left:L[i].c,mem:L[i].m,own:false,start:k};ev.push({k:"start",i})}
      else ev.push({k:"take",i,n:t,got:eu.got})}
    /* 2. EU cần bus cho lần truy cập bộ nhớ kế tiếp? */
    const want=eu.st==="exec"&&eu.mem>0&&!eu.own&&eu.left<=4*eu.mem;
    /* 3. bus rảnh: EU trước, rồi mới nạp trước */
    if(!bus){
      if(want){bus={kind:"mem",left:4};eu.own=true;ev.push({k:"mem"})}
      else if(P.Q-q>=P.free){const nb=P.wide===2&&fa%2===0?2:1;bus={kind:"fetch",left:4,a:fa,nb,discard:false};fa=(fa+nb)&0xFFFF;ev.push({k:"fetch",a:bus.a,nb})}}
    /* 4. chạy một chu kỳ */
    const row={k,q0:q};
    if(bus){row.bus=bus.kind;row.T=5-bus.left;if(bus.kind==="fetch"){row.ba=bus.a;row.nb=bus.nb;st.fetch++}else st.mem++;bus.left--}
    else{row.bus="idle";st.idle++}
    if(eu.st==="exec"){row.eu=eu.idx;
      if(eu.mem>0&&!eu.own&&eu.left<=4*eu.mem){row.euSt="bus";st.euWaitBus++}
      else{row.euSt="run";row.prog=L[eu.idx].c-eu.left+1;eu.left--;st.euRun++}}
    else{row.eu=i<L.length?i:-1;row.euSt=i<L.length?"waitq":"end";row.got=eu.got||0;if(i<L.length)st.euWaitQ++}
    /* 5. cuối chu kỳ */
    if(bus&&bus.left===0){
      if(bus.kind==="fetch"){if(bus.discard){st.discard+=bus.nb;ev.push({k:"discard",a:bus.a,nb:bus.nb})}
        else{for(let t=0;t<bus.nb;t++)Qb.push({a:(bus.a+t)&0xFFFF,v:img.has((bus.a+t)&0xFFFF)?img.get((bus.a+t)&0xFFFF):null});q+=bus.nb;st.fetched+=bus.nb;ev.push({k:"got",a:bus.a,nb:bus.nb})}}
      else{eu.mem--;eu.own=false}
      bus=null}
    if(eu.st==="exec"&&eu.left===0&&eu.mem===0){
      const I=L[eu.idx];done.push({i:eu.idx,start:eu.start,end:k});ev.push({k:"end",i:eu.idx});
      if(I.x.j&&eu.idx+1<L.length){const tg=L[eu.idx+1].x.a;st.flush++;ev.push({k:"flush",n:q,to:tg});
        q=0;Qb.length=0;fa=ca=tg;if(bus&&bus.kind==="fetch")bus.discard=true}
      i=eu.idx+1;eu={st:"wait"}}
    row.q=q;row.qb=Qb.map(o=>o.v);row.qa=Qb.length?Qb[0].a:ca;row.ev=ev;clocks.push(row)}
  /* gộp các chu kỳ liên tiếp giống nhau thành một đoạn */
  const segs=[];
  const BEGIN=new Set(["start","take","fetch","mem"]),END=new Set(["got","end","flush","discard"]);
  for(const r of clocks){const key=[r.bus,r.ba,r.eu,r.euSt].join("|");const s=segs[segs.length-1];
    const b=r.ev.some(e=>BEGIN.has(e.k)),e=r.ev.some(x=>END.has(x.k))||r.T===4;
    if(s&&s.key===key&&!s.closed&&!b){s.to=r.k;s.q=r.q;s.got=r.got;s.qb=r.qb;s.qa=r.qa;s.ev.push(...r.ev);s.closed=e;continue}
    segs.push({key,from:r.k,to:r.k,got:r.got,bus:r.bus,ba:r.ba,nb:r.nb,eu:r.eu,euSt:r.euSt,q:r.q,qb:r.qb,qa:r.qa,ev:r.ev.slice(),closed:e})}
  segs.forEach(s=>{delete s.key;delete s.closed});
  const table=list.reduce((s,x,j)=>s+L[j].c,0),bytes=list.reduce((s,x)=>s+x.b.length,0);
  return{version:VERSION,cpu:P.cpu,Q:P.Q,total:k,table,bytes,fetchBound:P.cpu==="8086"?2*bytes:4*bytes,stats:st,clocks,segs,done,list:L.map(o=>({t:o.x.t,n:o.n,c:o.c,m:o.m,j:!!o.x.j}))}}
G.X86Q={VERSION,PROF,run,hx};
if(typeof module!=="undefined"&&module.exports)module.exports=G.X86Q;
})(typeof window!=="undefined"?window:globalThis);
/* ===================== trình mô phỏng của khóa (platform/js/59-x86-biu-ui.js) ===================== */
/* ===================== Mô hình hàng đợi lệnh 8086/8088 (EU – BIU) · phần vẽ =====================
   Chỉ tải trên trang khóa mpu8086 (build.py SIM_FILES). Máy: platform/js/59-x86-biu.js (X86Q.run); file này chỉ vẽ kết quả.
   Công cụ nhỏ chạy từng bước theo docs/QUY-TAC-TRINH-MO-PHONG.md mục 5: hình (danh sách lệnh, BIU, hàng đợi, EU) → hàng nút
   (dính đáy màn hình) → nhật ký các đoạn đã chạy (dài thêm mỗi bước, nằm dưới hàng nút). steady() giữ chiều cao, không nhảy.
   makeX86Queue(el, {id, scen:[{label, note, list, image}]})   list: vết chạy, xem 59-x86-biu.js */
(function(G){
"use strict";
const Q=G.X86Q,doc=G.document;
const esc=s=>String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
const h2=v=>v==null?"??":(v&255).toString(16).toUpperCase().padStart(2,"0"),h4=v=>Q.hx(v,4);
function makeX86Queue(el,opt){
  const P=opt.id||"xq",SC=opt.scen||[];let si=0,cpu="8086",R=null,k=0,pred=false,ask=null;
  el.classList.add("xq");
  el.innerHTML=`<div class="xq-bar"><label class="xq-sel"><span>Đoạn lệnh</span><select id="${P}-s" aria-label="Chọn đoạn lệnh">${SC.map((s,i)=>`<option value="${i}">${esc(s.label)}</option>`).join("")}</select></label>
    <div class="xq-cpu" role="group" aria-label="Chọn CPU"><button type="button" class="chip-btn on" data-cpu="8086" aria-pressed="true">8086 · hàng đợi 6 byte</button><button type="button" class="chip-btn" data-cpu="8088" aria-pressed="false">8088 · hàng đợi 4 byte</button></div></div>
   <p class="xq-note" id="${P}-n"></p>
   <div class="xq-fig" id="${P}-f"></div>
   <div class="pipe-ctl"><button type="button" class="btn" id="${P}-prev">← Lùi</button><button type="button" class="btn pri" id="${P}-next">Bước tiếp →</button><button type="button" class="btn" id="${P}-all">Chạy hết</button><button type="button" class="btn" id="${P}-reset">↺ Làm lại</button>
     <label class="xq-pl"><input type="checkbox" id="${P}-p"> Đoán trước</label><span class="crumb" id="${P}-k" aria-live="polite"></span></div>
   <div class="xq-ask" id="${P}-a"></div>
   <div class="xq-log" id="${P}-l"></div>`;
  const $=s=>el.querySelector("#"+P+"-"+s);
  const SD=typeof steady==="function"?steady(el,[".xq-fig",".xq-ask"],prime):{hold(){},free(){}};
  function load(){const s=SC[si];$("n").textContent=s.note||"";
    try{R=Q.run(s.list,{cpu,image:s.image})}catch(e){R=null;$("f").innerHTML=`<p class="xq-err">${esc(e.message)}</p>`;return}
    k=0;ask=null;SD.free();prime()}
  function prime(){if(!R)return;const k0=k;let hi=0,hk=0;R.segs.forEach((s,j)=>{const n=s.ev.length;if(n>=hi){hi=n;hk=j+1}});
    k=hk;draw();SD.hold();k=R.segs.length;draw();SD.hold();k=k0;draw()}
  function euText(s){if(s.euSt==="end")return"đã chạy hết đoạn lệnh";const L=R.list[s.eu];if(!L)return"";
    const nm=`<code>${esc(L.t)}</code>`;
    if(s.euSt==="waitq")return`chờ byte lệnh: ${nm} dài ${L.n} byte, đã lấy ${s.got||0} byte`;
    if(s.euSt==="bus")return`chờ bus: ${nm} cần đọc/ghi bộ nhớ nhưng BIU đang nạp dở`;
    return`đang chạy ${nm} (${L.c} chu kỳ${L.m?", "+L.m+" lần truy cập bộ nhớ":""})`}
  function busText(s){if(s.bus==="fetch")return`nạp trước ${s.nb===2?"word":"1 byte"} ở CS:${h4(s.ba)}${s.nb===2?"–"+h4(s.ba+1):""}`;
    if(s.bus==="mem")return"EU dùng bus: đọc/ghi toán hạng bộ nhớ";return R.Q-(s.q)<(cpu==="8086"?2:1)?"rảnh: hàng đợi đầy":"rảnh"}
  function evText(e){const L=R.list[e.i];
    switch(e.k){case"start":return`EU lấy ${L.n} byte của <code>${esc(L.t)}</code> ra khỏi hàng đợi`;case"end":return`<code>${esc(L.t)}</code> xong`;
      case"take":return`EU lấy ${e.n} byte của <code>${esc(L.t)}</code> (đủ ${e.got}/${L.n} byte)`;
      case"got":return`${e.nb} byte vào hàng đợi`;case"discard":return`bỏ ${e.nb} byte vừa nạp (hàng đợi đã bị xóa)`;
      case"flush":return`<b>lệnh nhảy: xóa hàng đợi</b> (${e.n} byte nạp trước bị bỏ), nạp lại từ CS:${h4(e.to)}`;default:return""}}
  function draw(){if(!R)return;const seg=k>0?R.segs[k-1]:null;const last=k===R.segs.length;
    const cur=seg&&seg.euSt!=="waitq"&&seg.euSt!=="end"?seg.eu:-1;const doneN=seg?R.done.filter(d=>d.end<=seg.to).length:0;
    const slots=[];const qb=seg?seg.qb:[],qa=seg?seg.qa:R.list.length&&SC[si].list[0].a;
    for(let j=0;j<R.Q;j++)slots.push(j<qb.length?`<span class="xq-slot on" title="CS:${h4(qa+j)}"><b>${h2(qb[j])}</b><small>${h4(qa+j).slice(2)}</small></span>`:`<span class="xq-slot"><b>··</b><small>trống</small></span>`);
    const code=SC[si].list.map((x,j)=>`<li class="${j<doneN?"dn":""}${j===cur?" cur":""}"><code class="a">${h4(x.a)}</code><code class="b">${x.b.map(h2).join(" ")}</code><code class="t">${esc(x.t)}</code><span class="c">${R.list[j].c} ck</span></li>`).join("");
    $("f").innerHTML=`<ol class="xq-code" aria-label="Các lệnh của đoạn, theo thứ tự chạy">${code}</ol>
      <div class="xq-units">
        <div class="xq-u biu"><div class="xq-h"><b>BIU</b><span>giao tiếp bus</span></div><p>${seg?busText(seg):"chưa chạy"}</p>
          <div class="xq-q" role="img" aria-label="Hàng đợi lệnh ${R.Q} byte, đang có ${seg?seg.q:0} byte">${slots.join("")}</div>
          <p class="xq-qn">Hàng đợi: <b>${seg?seg.q:0}</b> / ${R.Q} byte · địa chỉ đầu hàng CS:${h4(qa)}</p></div>
        <div class="xq-u eu"><div class="xq-h"><b>EU</b><span>thực thi</span></div><p>${seg?euText(seg):"chưa chạy"}</p></div>
      </div>
      <p class="xq-ev">${seg?`Chu kỳ ${seg.from}${seg.to>seg.from?"–"+seg.to:""}: ${seg.ev.map(evText).filter(Boolean).join("; ")||"không có sự kiện mới"}`:"Bấm Bước tiếp: mỗi bước là một đoạn chu kỳ (một chu kỳ bus T1–T4, hoặc một khoảng EU chạy mà bus rảnh)."}</p>`;
    $("k").textContent=`chu kỳ ${k?seg.to:0} · bước ${k}/${R.segs.length}`;
    $("prev").disabled=k===0;$("next").disabled=last;$("all").disabled=last;
    const rows=R.segs.slice(0,k).map(s=>`<tr><td>${s.from}${s.to>s.from?"–"+s.to:""}</td><td>${s.bus==="fetch"?"nạp "+h4(s.ba):s.bus==="mem"?"EU đọc/ghi":"rảnh"}</td><td>${s.euSt==="run"?esc(R.list[s.eu].t):s.euSt==="bus"?"chờ bus":s.euSt==="waitq"?"chờ byte":"xong"}</td><td>${s.q}</td></tr>`).join("");
    const st=R.stats;
    $("l").innerHTML=(k?`<div class="tbl"><table><thead><tr><th scope="col">Chu kỳ</th><th scope="col">BIU</th><th scope="col">EU</th><th scope="col">Byte</th></tr></thead><tbody>${rows}</tbody></table></div>`:"")
      +(last?`<p class="xq-sum"><b>Tổng ${R.total} chu kỳ</b> theo mô hình (${cpu}); cộng bảng thời gian lệnh: ${R.table} chu kỳ; ${R.bytes} byte mã → nạp cần ít nhất ${R.fetchBound} chu kỳ (${cpu==="8086"?"2":"4"} chu kỳ mỗi byte). EU chạy ${st.euRun}, chờ byte ${st.euWaitQ}, chờ bus ${st.euWaitBus} chu kỳ; bus nạp ${st.fetch}, EU dùng ${st.mem}, rảnh ${st.idle} chu kỳ${st.flush?`; ${st.flush} lần xóa hàng đợi, ${st.discard} byte nạp rồi bỏ`:""}.</p>`:"");
    $("a").innerHTML=!ask?"":ask.done?`<p class="xq-fb ${ask.ok?"ok":"bad"}">${ask.fb}</p>`:`<p>Đoán trước: cuối đoạn tới, hàng đợi có bao nhiêu byte?</p><div class="chips">${Array.from({length:R.Q+1},(_,j)=>`<button type="button" class="chip-btn" data-q="${j}">${j}</button>`).join("")}</div>`}
  function next(){if(!R||k>=R.segs.length)return;
    if(pred&&(!ask||ask.done)){ask={want:R.segs[k].q};draw();SD.hold();return}
    ask=null;k++;draw();SD.hold()}
  el.addEventListener("click",e=>{const b=e.target.closest("button");if(!b||!el.contains(b))return;
    if(b.dataset.cpu){cpu=b.dataset.cpu;el.querySelectorAll("[data-cpu]").forEach(x=>{x.classList.toggle("on",x===b);x.setAttribute("aria-pressed",x===b)});load();return}
    if(b.dataset.q!=null&&ask&&!ask.done){const v=+b.dataset.q;ask.ok=v===ask.want;ask.done=true;ask.fb=(ask.ok?"Đúng: ":"Chưa đúng: ")+`hàng đợi có ${ask.want} byte.`;k++;draw();SD.hold();return}
    if(b.id===P+"-next")next();
    else if(b.id===P+"-prev"){ask=null;if(k>0)k--;draw()}
    else if(b.id===P+"-all"){ask=null;k=R?R.segs.length:0;draw();SD.hold()}
    else if(b.id===P+"-reset"){ask=null;k=0;draw()}});
  $("s").addEventListener("change",()=>{si=+$("s").value;load()});
  $("p").addEventListener("change",()=>{pred=$("p").checked;ask=null;draw()});
  load();
  return{get state(){return{k,cpu,si,R}},step:next,load}}
G.makeX86Queue=makeX86Queue;
})(typeof window!=="undefined"?window:globalThis);
/* ===================== trình mô phỏng của khóa (platform/js/59-x86-dbg.js) ===================== */
/* ===================== Bảng lệnh debugger kiểu dòng lệnh cho trình mô phỏng 8086 · phần máy =====================
   Chỉ tải trên trang khóa mpu8086 (build.py SIM_FILES). Không dùng DOM: chạy được trong Node (tools/x86-test/dbg.js).
   Thêm cho Bài 4 (AMTS-EMB-002-M01-L04). Dùng máy DOS giả có sẵn (X86.assemble, X86.Machine của 58-x86-*.js), KHÔNG sửa máy đó.
   Tài liệu: docs/TRINH-MO-PHONG-8086.md mục 13.

   Mô phỏng CÁCH LÀM VIỆC của một debugger dòng lệnh kiểu DEBUG của DOS (một chữ cái là một lệnh, số viết hệ 16), không chép
   giao diện hay câu chữ của chương trình nào. Lệnh:
     R            xem thanh ghi, cờ và lệnh sắp chạy          R AX 1234   đặt giá trị cho một thanh ghi
     T [n]        chạy n lệnh (mặc định 1), in từng lệnh       G [độ lệch] chạy tới độ lệch đó trong CS (điểm dừng) hoặc tới khi xong / gặp INT 3
     D [địa chỉ] [L độ dài]  dump bộ nhớ (8 byte mỗi dòng, 4 trên màn hình hẹp; hệ 16 và ký tự); không có địa chỉ: tiếp sau lần dump trước
     E địa chỉ byte …       ghi byte vào bộ nhớ (số hệ 16 hoặc 'chuỗi')
     U [độ lệch]  xem bản liệt kê (độ lệch, byte mã, dòng nguồn) từ độ lệch đó, mặc định từ IP
     P [n]        như T nhưng chạy trọn CALL, INT, LOOP/LOOPE/LOOPNE (dừng ở lệnh ngay sau), REP chạy trọn như T
     A [độ lệch] lệnh   dịch MỘT lệnh (số hệ 16 như DEBUG) bằng trình dịch có sẵn và ghi vào CS:độ lệch (mặc định sau lần A trước, hoặc IP)
     I cổng       đọc một byte từ cổng (qua bo I/O của chương 11 khi trang có bo; không có thiết bị: FFh)
     O cổng byte  ghi một byte ra cổng
     B            lùi: hoàn lại thao tác gần nhất — một lệnh đã chạy, hoặc một lần E, R, A (máy DOS giả giữ 20 000 lệnh gần nhất;
                  DEBUG thật không có). Không hoàn lại I/O (trạng thái thiết bị ở cổng).
     L            nạp lại chương trình từ đầu       ?  danh sách lệnh
   Địa chỉ: đoạn:độ lệch (đoạn là số hoặc CS/DS/ES/SS), chỉ độ lệch (đoạn mặc định: DS với D/E, CS với U/G), hoặc tên biến.

   X86D.open(src, {input, cols: 8 | 4}) → phiên {cmd(dòng) → {out:[dòng chữ], err:bool}, M (máy), prog}; lỗi dịch → ném Error có .errors */
(function(G){
"use strict";
const X86=G.X86;
const VERSION="0.2.0";
const MAXT=0x100,MAXG=200000,MAXD=0x100;
const h2=v=>(v&255).toString(16).toUpperCase().padStart(2,"0"),h4=v=>(v&0xFFFF).toString(16).toUpperCase().padStart(4,"0");
const R16=["AX","BX","CX","DX","SP","BP","SI","DI"],SR=["CS","DS","ES","SS"],R8=["AL","AH","BL","BH","CL","CH","DL","DH"];
const FL=[["OF",11],["DF",10],["IF",9],["SF",7],["ZF",6],["AF",4],["PF",2],["CF",0]];
const HELP=["Lệnh (số viết hệ 16, không cần chữ h):",
  "R            thanh ghi, cờ, lệnh sắp chạy",
  "R AX 1234    đặt AX = 1234h",
  "T [n]        chạy n lệnh (mặc định 1)",
  "G [độ lệch]  chạy tới CS:độ lệch, tới INT 3 hoặc hết",
  "D [đ.chỉ] [L n]  dump n byte (mặc định 40h)",
  "E đ.chỉ b …  ghi byte, ví dụ E DS:0 41 'B'",
  "U [độ lệch]  xem listing từ độ lệch (mặc định IP)",
  "P [n]        như T, chạy trọn CALL, INT, LOOP",
  "A [độ lệch] lệnh  dịch một lệnh vào CS:độ lệch",
  "I cổng / O cổng byte  đọc / ghi cổng I/O",
  "B            lùi lệnh, E, R, A gần nhất;  L  nạp lại",
  "Địa chỉ: 0712:0000, DS:0, SS:SP, 10 (đoạn DS) hoặc tên biến."];
function num(t){if(!/^0?[0-9A-F]{1,4}H?$/i.test(t))return null;return parseInt(t.replace(/h$/i,""),16)}
function open(src,opt){opt=opt||{};
  const r=X86.assemble(src);if(!r.ok){const e=new Error("Lỗi dịch ở dòng "+r.errors[0].line+": "+r.errors[0].vi);e.errors=r.errors;throw e}
  const P=r.prog,lines=src.split("\n");
  const code0=P.stmts.filter(s=>s.kind==="ins"||(s.kind==="data"&&s.seg==="_TEXT"&&s.bytes.length));let code=code0.slice();
  const W=opt.cols===4?4:8;   // số byte mỗi dòng dump: 8 (mặc định), 4 cho màn hình hẹp
  let M,dnext=null,anext=null,U=[];
  /* U: các lần sửa bằng E, R, A (bộ nhớ, thanh ghi, bảng liệt kê cũ) để B hoàn lại; after = số lệnh đã chạy sau lần sửa đó */
  const reset=()=>{M=new X86.Machine(P,{input:opt.input||"",interactive:false,maxSteps:MAXG*4});dnext=null;anext=null;U=[];code=code0.slice()};reset();
  const c=()=>M.cpu;
  const srcOf=s=>s?(s.text!=null?s.text:(lines[s.line-1]||"").replace(/;.*/,"").trim()):"";
  const pa=(seg,off)=>((seg<<4)+(off&0xFFFF))&0xFFFFF;
  /* chạy một lệnh của máy; ghi nhận để B lùi đúng thứ tự (lệnh đã chạy và các lần sửa E/R/A xen kẽ) */
  function stepM(){const h0=M.hist.length,s=M.step();if(M.hist.length!==h0&&U.length)U[U.length-1].after++;return s}
  function edit(memAddrs,extra){const C=c();const u={mem:memAddrs.map(a=>[a,M.mem[a]]),r:C.r.slice(),sg:C.s.slice(),ip:C.ip,f:C.f,code:code.slice(),anext,after:0};U.push(u);if(U.length>500)U.shift();return u}
  const stAt=(cs,ip)=>code.find(s=>s.frame===cs&&s.off===ip);
  const insLine=(cs,ip)=>{const s=stAt(cs,ip);
    if(s)return`${h4(cs)}:${h4(ip)}  ${s.bytes.map(h2).join(" ").padEnd(12)} ${srcOf(s)}`;
    const p=((cs<<4)+ip)&0xFFFFF;return`${h4(cs)}:${h4(ip)}  ${[0,1,2].map(i=>h2(M.mem[(p+i)&0xFFFFF])).join(" ").padEnd(12)} (ngoài chương trình: không có dòng nguồn)`};
  function regs(){const C=c(),g=n=>n+"="+h4(C.getReg(n)),fl=FL.map(([n,b])=>n+"="+((C.f>>b)&1));
    return[["AX","BX","CX"].map(g).join(" "),["DX","SP","BP"].map(g).join(" "),["SI","DI"].map(g).join(" ")+" IP="+h4(C.ip),
      ["DS","ES","SS","CS"].map(g).join(" "),fl.slice(0,4).join(" "),fl.slice(4).join(" "),
      ended()?"(chương trình đã kết thúc: "+endText()+")":insLine(C.cs,C.ip)]}
  const ended=()=>M.done||M.exit!=null||M.halted||!!M.crash;
  const endText=()=>M.crash?"lỗi: "+M.crash.vi:M.halted?"gặp HLT":"mã thoát "+M.exit;
  function addr(t,defSeg){const C=c();if(!t)return null;
    const v=P.syms[t.toUpperCase()];if(v&&v.k==="var")return{seg:v.frame,off:v.off};
    let seg=C.getReg(defSeg),o=t;const k=t.indexOf(":");
    if(k>=0){const s=t.slice(0,k).toUpperCase();o=t.slice(k+1);seg=SR.includes(s)?C.getReg(s):num(s);if(seg==null)return null}
    const ou=o.toUpperCase();const off=R16.includes(ou)?C.getReg(ou):num(o);if(off==null)return null;return{seg,off}}
  function dump(a,n){const out=[];let off=a.off;
    for(let i=0;i<n;i+=W){const k=Math.min(W,n-i),b=[];for(let j=0;j<k;j++)b.push(M.mem[(((a.seg<<4)+((off+j)&0xFFFF))&0xFFFFF)]);
      out.push(`${h4(a.seg)}:${h4(off)}  ${b.map(h2).join(" ").padEnd(W*3-1)}  ${b.map(x=>x>=32&&x<127?String.fromCharCode(x):".").join("")}`);off=(off+k)&0xFFFF}
    dnext={seg:a.seg,off};return out}
  function news(o0,p0){const out=[];const add=M.out.slice(o0);if(add)out.push("Màn hình nhận thêm: "+JSON.stringify(add).slice(1,-1).replace(/\\r\\n/g,"↵").replace(/\\u0007/g,"(BEL)"));
    const po=c().portOut;if(po.length>p0&&po.length<256)for(const [p,v] of po.slice(p0))out.push(`OUT cổng ${h4(p)}h ← ${h2(v)}h`);return out}
  function one(){const C=c(),cs=C.cs,ip=C.ip;const s=stepM();const L=M.last;
    return{s:s.s,line:`${h4(cs)}:${h4(ip)}  ${srcOf(stAt(cs,ip))||"(byte "+(L?L.bytes.map(h2).join(" "):"?")+")"}${L?"  · "+L.cyc+" ck":""}`}}
  /* độ dài lệnh tại CS:IP nếu P phải chạy trọn (CALL, INT n/INT 3/INTO, LOOP/LOOPE/LOOPNE); 0 nếu P như T */
  function proceedLen(cs,ip){const st=stAt(cs,ip);let i=0,b;
    for(;i<4;i++){b=M.mem[pa(cs,ip+i)];if(![0x26,0x2E,0x36,0x3E,0xF0,0xF2,0xF3].includes(b))break}
    let n=0;if(b===0xE8)n=3;else if(b===0x9A)n=5;else if(b===0xCD)n=2;else if(b===0xCC||b===0xCE)n=1;else if(b>=0xE0&&b<=0xE2)n=2;
    else if(b===0xFF){const mr=M.mem[pa(cs,ip+i+1)],reg=(mr>>3)&7,mod=mr>>6,rm=mr&7;if(reg!==2&&reg!==3)return 0;n=2+(mod===1?1:mod===2||(mod===0&&rm===6)?2:0)}
    else return 0;
    return st?st.bytes.length:i+n}
  /* A: dịch một lệnh bằng trình dịch có sẵn. Số viết hệ 16 không cần h (như DEBUG); đích nhảy/gọi là độ lệch số trong CS */
  function asmOne(txt,off){const parts=txt.split(/('[^']*'|"[^"]*")/);
    let t=parts.map((p,i)=>i%2?p:p.replace(/\b([0-9A-F]+)H?\b/gi,(m0,d,o,all)=>{if(!(i||all.slice(0,o).trim())||/^[A-D]H$/i.test(m0))return m0;return "0"+d+"h"})).join("").trim();
    const mn=(t.match(/^\w+/)||[""])[0].toUpperCase();
    if(["DB","DW","DD","ORG","END","EQU","PROC","SEGMENT","ASSUME"].includes(mn)||/^\w+\s*:/.test(t)&&!/^(ES|CS|SS|DS):/i.test(t))return{err:"A chỉ dịch một lệnh 8086 (không nhãn, không chỉ thị)."};
    let extra="";const J=/^(J\w+|LOOP\w*|CALL)\s+((?:SHORT\s+|NEAR\s+PTR\s+)?)(0[0-9A-F]*h)$/i.exec(t);
    if(J){const to=parseInt(J[3],16);if(to>0xFFFF)return{err:"Đích nhảy là độ lệch 0000–FFFF trong CS."};t=J[1]+" "+J[2]+"dich__";extra="\n ORG "+to.toString(16).toUpperCase()+"h\ndich__:"}
    const r=X86.assemble("ORG "+(off&0xFFFF).toString(16).toUpperCase()+"h\n "+t+extra+"\n");
    if(!r.ok)return{err:"Không dịch được: "+r.errors[0].vi};
    const L=r.prog.stmts.filter(s=>s.kind==="ins");if(L.length!==1||!L[0].bytes.length)return{err:"A dịch đúng một lệnh mỗi lần."};
    return{bytes:L[0].bytes,text:txt.trim().replace(/\s+/g," ").toUpperCase()}}
  function cmd(raw){const t=String(raw||"").trim();if(!t)return{out:[],err:false};
    const w=t.match(/'[^']*'|\S+/g),k=w[0].toUpperCase(),a=w.slice(1);const bad=m=>({out:[m],err:true});
    if(k==="?"||k==="H")return{out:HELP.slice(),err:false};
    if(k==="L"){reset();return{out:["Đã nạp lại chương trình từ đầu."].concat(regs()),err:false}}
    if(k==="R"){if(!a.length)return{out:regs(),err:false};
      const n=a[0].toUpperCase();if(!R16.concat(SR,R8,["IP"]).includes(n))return bad("Không có thanh ghi "+a[0]+".");
      if(a.length<2)return{out:[`${n} = ${(n==="IP"?h4(c().ip):R8.includes(n)?h2(c().getReg(n)):h4(c().getReg(n)))}h`],err:false};
      const v=num(a[1]);if(v==null||(R8.includes(n)&&v>255))return bad("Giá trị phải là số hệ 16 "+(R8.includes(n)?"00–FF":"0000–FFFF")+".");
      edit([]);if(n==="IP")c().ip=v;else c().setReg(n,v);return{out:[`${n} = ${R8.includes(n)?h2(v):h4(v)}h`].concat(regs()),err:false}}
    if(k==="T"){if(ended())return bad("Chương trình đã kết thúc ("+endText()+"). Gõ L để nạp lại.");
      const n=a.length?num(a[0]):1;if(!n||n>MAXT)return bad("T n: n là số hệ 16 từ 1 tới 100.");
      const o0=M.out.length,p0=c().portOut.length,out=[];let s="ok";
      for(let i=0;i<n&&!ended();i++){const x=one();out.push(x.line);s=x.s;if(s==="bp"){out.push("Gặp INT 3 (điểm dừng).");break}}
      return{out:out.concat(news(o0,p0),regs()),err:false}}
    if(k==="G"){if(ended())return bad("Chương trình đã kết thúc ("+endText()+"). Gõ L để nạp lại.");
      let stop=null;if(a.length){const v=num(a[0].replace(/^=/,""));if(v==null)return bad("G độ lệch: độ lệch là số hệ 16 trong đoạn CS.");stop=v}
      const cs0=c().cs,o0=M.out.length,p0=c().portOut.length;let why="",i=0;
      for(;i<MAXG;i++){const s=stepM().s;if(s==="bp"){why="Gặp INT 3 (điểm dừng).";break}
        if(ended()){why="Chương trình kết thúc ("+endText()+").";break}
        if(stop!=null&&c().cs===cs0&&c().ip===stop){why=`Dừng ở điểm dừng ${h4(cs0)}:${h4(stop)} (lệnh ở đó chưa chạy).`;break}}
      if(i>=MAXG)why=`Đã chạy ${MAXG} lệnh mà chưa tới điểm dừng: dừng tạm.`;
      return{out:[why+` Đã chạy ${i+1>MAXG?MAXG:i+1} lệnh.`].concat(news(o0,p0),regs()),err:false}}
    if(k==="D"){let A=dnext,n=0x40;const rest=a.slice();
      if(rest.length&&rest[0].toUpperCase()!=="L"){A=addr(rest.shift(),"DS");if(!A)return bad("Địa chỉ không hiểu được: "+a[0]+".")}
      if(rest.length){if(rest[0].toUpperCase()!=="L"||rest.length<2)return bad("Độ dài viết L n, ví dụ D DS:0 L 10.");n=num(rest[1]);if(!n||n>MAXD)return bad("Độ dài từ 1 tới 100h byte.")}
      if(!A)A={seg:c().getReg("DS"),off:0};return{out:dump(A,n),err:false}}
    if(k==="E"){if(a.length<2)return bad("E địa chỉ byte …, ví dụ E DS:0 41 42.");const A=addr(a[0],"DS");if(!A)return bad("Địa chỉ không hiểu được: "+a[0]+".");
      const b=[];for(const x of a.slice(1)){if(/^'.*'$/.test(x)){for(const ch of x.slice(1,-1))b.push(ch.charCodeAt(0)&255);continue}
        const v=num(x);if(v==null||v>255)return bad("Byte phải là số hệ 16 00–FF hoặc 'chuỗi': "+x+".");b.push(v)}
      edit(b.map((_,i)=>pa(A.seg,A.off+i)));b.forEach((v,i)=>{M.mem[pa(A.seg,A.off+i)]=v});return{out:[`Đã ghi ${b.length} byte từ ${h4(A.seg)}:${h4(A.off)}.`].concat(dump(A,Math.min(MAXD,Math.ceil(b.length/W)*W))),err:false}}
    if(k==="U"){const cs=c().cs;let off=c().ip;if(a.length){const v=num(a[0]);if(v==null)return bad("U độ lệch: số hệ 16 trong đoạn CS.");off=v}
      const L=code.filter(s=>s.frame===cs&&s.off>=off).slice(0,8);if(!L.length)return bad(`Không có lệnh nào của chương trình từ ${h4(cs)}:${h4(off)}.`);
      return{out:L.map(s=>`${h4(cs)}:${h4(s.off)}  ${s.bytes.map(h2).join(" ").padEnd(12)} ${srcOf(s)}`),err:false}}
    if(k==="B"){const u=U[U.length-1];
      if(u&&u.after===0){U.pop();for(let i=u.mem.length-1;i>=0;i--)M.mem[u.mem[i][0]]=u.mem[i][1];const C=c();C.r.set(u.r);C.s.set(u.sg);C.ip=u.ip;C.f=u.f;code=u.code;anext=u.anext;
        return{out:["Đã hoàn lại lần sửa gần nhất (E, R hoặc A)."].concat(regs()),err:false}}
      if(!M.back())return bad(U.length?"Không lùi được nữa: lịch sử lệnh đã hết (máy chỉ giữ 20 000 lệnh gần nhất).":"Không lùi được nữa (đang ở đầu chương trình).");
      if(u)u.after--;M.done=false;return{out:["Đã lùi một lệnh."].concat(regs()),err:false}}
    if(k==="P"){if(ended())return bad("Chương trình đã kết thúc ("+endText()+"). Gõ L để nạp lại.");
      const n=a.length?num(a[0]):1;if(!n||n>MAXT)return bad("P n: n là số hệ 16 từ 1 tới 100.");
      const o0=M.out.length,p0=c().portOut.length,out=[];
      for(let i=0;i<n&&!ended();i++){const C=c(),cs=C.cs,ip=C.ip,len=proceedLen(cs,ip);
        if(!len){const x=one();out.push(x.line);if(x.s==="bp"){out.push("Gặp INT 3 (điểm dừng).");break}continue}
        const t0=C.total,sp0=C.sp,to=(ip+len)&0xFFFF,first=srcOf(stAt(cs,ip))||"(byte "+h2(M.mem[pa(cs,ip)])+" …)";let k2=0,why="";
        for(;k2<MAXG;k2++){const s=stepM().s;if(s==="bp"){why="Gặp INT 3 (điểm dừng).";k2++;break}if(ended()){k2++;break}
          if(c().cs===cs&&c().ip===to&&c().sp>=sp0){k2++;break}}
        if(k2>=MAXG)why=`Đã chạy ${MAXG} lệnh mà chưa về ${h4(cs)}:${h4(to)}: dừng tạm.`;
        out.push(`${h4(cs)}:${h4(ip)}  ${first}  · chạy trọn: ${k2} lệnh, ${c().total-t0} ck`);if(why){out.push(why);break}}
      return{out:out.concat(news(o0,p0),regs()),err:false}}
    if(k==="I"){if(a.length!==1)return bad("I cổng, ví dụ I 80.");const p=num(a[0]);if(p==null)return bad("Cổng là số hệ 16 0000–FFFF.");
      const v=c().inp(p)&255;return{out:[`IN cổng ${h4(p)}h → ${h2(v)}h`],err:false}}
    if(k==="O"){if(a.length!==2)return bad("O cổng byte, ví dụ O 86 82.");const p=num(a[0]),v=num(a[1]);if(p==null)return bad("Cổng là số hệ 16 0000–FFFF.");
      if(v==null||v>255)return bad("Byte phải là số hệ 16 00–FF.");c().outp(p,v);return{out:[`OUT cổng ${h4(p)}h ← ${h2(v)}h`],err:false}}
    if(k==="A"){let rest=t.slice(1).trim();let off;const m=/^([0-9][0-9A-F]{0,4})H?\s+(.+)$/i.exec(rest);
      if(m){off=parseInt(m[1],16);if(off>0xFFFF)return bad("Độ lệch tối đa FFFF.");rest=m[2]}else off=anext!=null?anext:c().ip;
      if(!rest)return bad("A [độ lệch] lệnh, ví dụ A 0 MOV AX,1234 (độ lệch bắt đầu bằng chữ số, ví dụ 0B00).");
      const r=asmOne(rest,off);if(r.err)return bad(r.err);const cs=c().cs,b=r.bytes;
      edit(b.map((_,i)=>pa(cs,off+i)));b.forEach((v,i)=>{M.mem[pa(cs,off+i)]=v});
      code=code.filter(s=>!(s.frame===cs&&s.off<off+b.length&&s.off+s.bytes.length>off)).concat([{frame:cs,off,bytes:b,line:0,text:r.text,kind:"ins"}]).sort((x,y)=>x.frame-y.frame||x.off-y.off);
      anext=(off+b.length)&0xFFFF;return{out:[`${h4(cs)}:${h4(off)}  ${b.map(h2).join(" ").padEnd(12)} ${r.text}`],err:false}}
    return bad("Không có lệnh "+w[0]+". Gõ ? để xem danh sách lệnh.")}
  return{cmd,get M(){return M},prog:P,regs}}
const X86D={VERSION,open,HELP};
G.X86D=X86D;
if(typeof module!=="undefined"&&module.exports)module.exports=X86D;
})(typeof window!=="undefined"?window:globalThis);
/* ===================== trình mô phỏng của khóa (platform/js/59-x86-dbg-ui.js) ===================== */
/* ===================== Bảng lệnh debugger kiểu dòng lệnh (8086) · phần vẽ =====================
   Chỉ tải trên trang khóa mpu8086 (build.py SIM_FILES). Máy: platform/js/59-x86-dbg.js (X86D.open); file này chỉ vẽ.
   Bố cục theo docs/QUY-TAC-TRINH-MO-PHONG.md mục 5: chọn chương trình → khung kết quả CAO CỐ ĐỊNH (cuộn bên trong, không làm trang
   nhảy) → hàng nhập lệnh và nút (dính đáy màn hình khi công cụ cao hơn màn hình) → các lệnh gợi ý.
   makeX86Dbg(el, {id, progs:[{label, code, input, note, cmds:["R","T 2",…]}]}) */
(function(G){
"use strict";
const D=G.X86D,doc=G.document;
const esc=s=>String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
function makeX86Dbg(el,opt){
  const P=opt.id||"xd",PR=opt.progs||[];let pi=0,S=null,hist=[],hk=0;
  el.classList.add("xd");
  el.innerHTML=`<div class="xd-bar"><label class="xd-sel"><span>Chương trình</span><select id="${P}-s" aria-label="Chọn chương trình để gỡ lỗi">${PR.map((p,i)=>`<option value="${i}">${esc(p.label)}</option>`).join("")}</select></label></div>
   <p class="xd-note" id="${P}-n"></p>
   <div class="xd-out" id="${P}-o" role="log" aria-live="polite" aria-label="Kết quả của debugger" tabindex="0"></div>
   <form class="pipe-ctl xd-ctl" id="${P}-f" autocomplete="off"><label class="xd-in"><span class="xd-pr" aria-hidden="true">-</span><span class="vh">Lệnh debugger</span><input id="${P}-c" spellcheck="false" autocapitalize="characters" placeholder="ví dụ: T 2" enterkeyhint="go"></label>
     <button type="submit" class="btn pri">Chạy lệnh</button><button type="button" class="btn" id="${P}-r" title="Nạp lại chương trình từ đầu">↺ Nạp lại</button></form>
   <div class="xd-hint"><span>Gợi ý:</span><div class="chips" id="${P}-k"></div></div>`;
  const $=s=>el.querySelector("#"+P+"-"+s),out=$("o");
  /* màn hình hẹp (điện thoại): dump 4 byte mỗi dòng để một dòng không bị gãy */
  const narrow=()=>out.clientWidth?out.clientWidth<330:!!(G.matchMedia&&G.matchMedia("(max-width:600px)").matches);
  function put(lines,cls){const box=doc.createElement("div");box.className="xd-blk"+(cls?" "+cls:"");box.textContent=lines.join("\n");out.appendChild(box);
    while(out.childNodes.length>60)out.removeChild(out.firstChild);out.scrollTop=out.scrollHeight}
  function load(){const p=PR[pi];$("n").textContent=p.note||"";out.textContent="";hist=[];hk=0;
    $("k").innerHTML=(p.cmds||["R","T","G","D","U","?"]).map(c=>`<button type="button" class="chip-btn" data-c="${esc(c)}">${esc(c)}</button>`).join("");
    try{S=D.open(p.code,{input:p.input||"",cols:narrow()?4:8});put(["Đã nạp "+(p.file||"chương trình")+". Gõ lệnh (? xem danh sách). Số viết hệ 16."].concat(S.regs()),"sys")}
    catch(e){S=null;put([e.message],"err")}}
  function run(t){t=String(t).trim();if(!t||!S)return;put(["-"+t],"cmd");const r=S.cmd(t);if(r.out.length)put(r.out,r.err?"err":"");
    if(hist[hist.length-1]!==t)hist.push(t);hk=hist.length}
  $("f").addEventListener("submit",e=>{e.preventDefault();const i=$("c");run(i.value);i.value=""});
  $("c").addEventListener("keydown",e=>{if(e.key==="ArrowUp"&&hk>0){hk--;e.target.value=hist[hk];e.preventDefault()}
    else if(e.key==="ArrowDown"&&hk<hist.length){hk++;e.target.value=hist[hk]||"";e.preventDefault()}});
  $("r").addEventListener("click",()=>{if(S)run("L")});
  $("k").addEventListener("click",e=>{const b=e.target.closest("[data-c]");if(b)run(b.dataset.c)});
  $("s").addEventListener("change",()=>{pi=+$("s").value;load()});
  load();
  return{run,get session(){return S},load}}
G.makeX86Dbg=makeX86Dbg;
})(typeof window!=="undefined"?window:globalThis);
/* ===================== trình mô phỏng của khóa (platform/js/59-x86-bus.js) ===================== */
/* ===================== Trình mô phỏng 8086 · phần 5: chu kỳ bus (AMTS-EMB-002-SIM21, chương 9) =====================
   Chỉ tải trên trang khóa mpu8086 (build.py: SIM_FILES), sau 58-x86-*.js. Không sửa máy 58-x86-*: chỉ đọc nhật ký truy cập
   bộ nhớ của lệnh vừa chạy (M.last.acc, cpu.ulog) và bọc cpu.inp/cpu.outp của MỘT máy để ghi các lần đọc/ghi cổng.
   Tài liệu: docs/TRINH-MO-PHONG-8086-BUS.md.

   Phần máy (chạy được trong Node, tools/x86-test/bus.js):
     X86.Bus.attach(M)            bọc máy M: sau mỗi M.step(), M.lastBus = danh sách chu kỳ bus dữ liệu của lệnh vừa chạy
     X86.Bus.split(...)           tách một lần truy cập byte/word thành chu kỳ bus 8086 (word ở địa chỉ lẻ = 2 chu kỳ), BHE, A0, làn dữ liệu
     X86.Bus.wave(cyc, mode, n)   dạng sóng định tính theo T1, T2, T3, n × Tw, T4 (mỗi T chia 3 phần: CLK thấp, thấp, cao — xung 33 %)
     X86.Bus.S8288                bảng giải mã S2 S1 S0 của bộ điều khiển bus 8288 (chế độ maximum)
     X86.Bus.hold(hold, rogue)    mô hình HOLD/HLDA ở chế độ minimum theo từng xung nhịp (giả định đơn giản hóa, xem tài liệu)
   Phần vẽ: makeX86Bus(el, {presets, mode, modes, wm, wi}) và makeX86Hold(el, {scenarios}).
   Đây là mô hình để học: dạng sóng định tính (thứ tự sự kiện, không theo tỉ lệ ns); không vẽ chu kỳ nạp lệnh (trình mô phỏng
   chưa mô hình hàng đợi lệnh); thứ tự các chu kỳ trong một lệnh nhiều lần truy cập lấy theo trình mô phỏng. */
(function(G){
"use strict";
const X86=G.X86;
const doc=G.document;
const hx=(v,n)=>(v>>>0).toString(16).toUpperCase().padStart(n,"0");
const escH=s=>String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
/* ---------- loại chu kỳ bus và bảng S2 S1 S0 (8288) ---------- */
const KIND={
  MR:{vi:"Đọc bộ nhớ",mio:1,rd:1,s:"101"},
  MW:{vi:"Ghi bộ nhớ",mio:1,rd:0,s:"110"},
  IR:{vi:"Đọc cổng I/O",mio:0,rd:1,s:"001"},
  IW:{vi:"Ghi cổng I/O",mio:0,rd:0,s:"010"},
  HA:{vi:"Dừng (HALT)",mio:null,rd:null,s:"011"}};
/* S2 S1 S0 → loại chu kỳ, lệnh 8288 bật (cmd), lệnh ghi "sớm" (adv). Nguồn: datasheet 8086 (bảng trạng thái chế độ maximum) và 8288. */
const S8288=[
  {s:"000",vi:"Chấp nhận ngắt (INTA)",cmd:"INTA",adv:""},
  {s:"001",vi:"Đọc cổng I/O",cmd:"IORC",adv:""},
  {s:"010",vi:"Ghi cổng I/O",cmd:"IOWC",adv:"AIOWC"},
  {s:"011",vi:"Dừng (HALT)",cmd:"",adv:""},
  {s:"100",vi:"Nạp lệnh (đọc mã)",cmd:"MRDC",adv:""},
  {s:"101",vi:"Đọc bộ nhớ",cmd:"MRDC",adv:""},
  {s:"110",vi:"Ghi bộ nhớ",cmd:"MWTC",adv:"AMWC"},
  {s:"111",vi:"Thụ động (không có chu kỳ bus)",cmd:"",adv:""}];
/* S4 S3 theo thanh ghi đoạn (chỉ số của máy: 0 ES, 1 CS, 2 SS, 3 DS) */
const S43={0:"00",2:"01",1:"10",3:"11"},SEGN=["ES","CS","SS","DS"];
/* tách một lần truy cập thành chu kỳ bus của 8086 (bus dữ liệu 16 bit, hai dải chẵn/lẻ):
   byte ở địa chỉ chẵn: BHE = 1, A0 = 0, dữ liệu trên D7–D0; byte ở địa chỉ lẻ: BHE = 0, A0 = 1, dữ liệu trên D15–D8;
   word ở địa chỉ chẵn: một chu kỳ BHE = 0, A0 = 0; word ở địa chỉ lẻ: hai chu kỳ (byte thấp ở địa chỉ lẻ trước, rồi byte cao ở địa chỉ chẵn kế tiếp). */
function split(kind,addr,size,data,seg){const io=kind[0]==="I",M=io?0xFFFF:0xFFFFF;addr&=M;
  const one=(a,lane,d)=>({kind,addr:a,bhe:lane==="lo"?1:0,a0:a&1,lane,data:d,seg:io?null:seg,io});
  if(size===1)return[one(addr,addr&1?"hi":"lo",data&255)];
  if(!(addr&1))return[one(addr,"w",data&0xFFFF)];
  return[one(addr,"hi",data&255),one((addr+1)&M,"lo",(data>>8)&255)]}
/* thanh ghi đoạn của một lần truy cập bộ nhớ (để vẽ S4 S3); null = không xác định được từ trình mô phỏng */
function segOf(info,cpu,k,a,i){const b=info.bytes||[];let j=0,ov=-1;
  while(j<b.length&&[0x26,0x2E,0x36,0x3E,0xF0,0xF2,0xF3].includes(b[j])){if((b[j]&0xE7)===0x26)ov=(b[j]>>3)&3;j++}
  const op=b[j];const ds=ov>=0?ov:3;
  if(op>=0xA4&&op<=0xAF){if(op===0xA4||op===0xA5)return k==="r"?ds:0;if(op===0xAA||op===0xAB)return 0;if(op===0xAC||op===0xAD)return ds;
    if(op===0xA6||op===0xA7)return i===0?ds:0;if(op===0xAE||op===0xAF)return 0}
  if(op>=0xA0&&op<=0xA3||op===0xD7)return ds;
  if(op===0xCC||op===0xCD||op===0xCE)return a<0x400?null:2;
  if(info.ea&&a>=info.ea.phys&&a<=info.ea.phys+1)return info.ea.seg;
  return 2}   // còn lại: PUSH, POP, CALL, RET, IRET, PUSHF, POPF… dùng ngăn xếp SS
/* chu kỳ bus dữ liệu của lệnh vừa chạy */
function cyclesOf(M){const c=M.cpu,info=M.last;if(!info)return[];const out=[];
  const old=new Map();const U=c.ulog||[];for(let i=0;i<U.length;i+=2)if(!old.has(U[i]))old.set(U[i],U[i+1]);
  const rb=a=>old.has(a)?old.get(a):M.mem[a];
  (info.acc||[]).forEach(([k,a,n],i)=>{const seg=segOf(info,c,k,a,i);
    const d=k==="w"?(n===2?M.mem[a]|(M.mem[(a+1)&0xFFFFF]<<8):M.mem[a]):(n===2?rb(a)|(rb((a+1)&0xFFFFF)<<8):rb(a));
    out.push(...split(k==="w"?"MW":"MR",a,n,d,seg))});
  const io=c.iol||[];for(let i=0;i<io.length;i++){const [k,p,v]=io[i];const nx=io[i+1];
    if(!(p&1)&&nx&&nx[0]===k&&nx[1]===((p+1)&0xFFFF)&&c.iow){out.push(...split(k,p,2,v|(nx[2]<<8),null));i++}
    else out.push(...split(k,p,1,v,null))}
  const b=info.bytes||[];let j=0;while(j<b.length&&[0x26,0x2E,0x36,0x3E,0xF0,0xF2,0xF3].includes(b[j]))j++;
  /* INT n / INT 3 / INTO tới chương trình phục vụ của người học (có cất ngăn xếp): máy đọc bảng vectơ thẳng từ bộ nhớ, không ghi nhật ký,
     nên thêm 2 chu kỳ đọc word ở n × 4 (IP) và n × 4 + 2 (CS). Thứ tự so với 3 lần cất ngăn xếp: CẦN XÁC MINH (xem tài liệu). */
  if((b[j]===0xCD||b[j]===0xCC||b[j]===0xCE)&&(info.acc||[]).some(x=>x[0]==="w")){const n=b[j]===0xCD?b[j+1]:b[j]===0xCC?3:4;
    for(const a of [n*4,n*4+2])out.push(...split("MR",a,2,M.mem[a]|(M.mem[a+1]<<8),null))}
  if(b[j]===0xF4)out.push({kind:"HA",addr:0,bhe:1,a0:0,lane:"",data:0,seg:null,io:false});   // HLT: chu kỳ "dừng" (ALE, không có lệnh đọc/ghi)
  const lock=b.slice(0,j).includes(0xF0);
  for(const x of out){x.s5=(c.f>>9)&1;x.lock=lock}   // S5 = cờ IF; LOCK: tiền tố F0 (chân LOCK chỉ có ở chế độ maximum)
  return out}
function attach(M){if(M._bus)return M;M._bus=true;const c=M.cpu,inp=c.inp,outp=c.outp,step=M.step;
  c.inp=function(p){const v=inp.call(this,p);if(this.iol)this.iol.push(["IR",p&0xFFFF,v]);return v};
  c.outp=function(p,v){if(this.iol)this.iol.push(["IW",p&0xFFFF,v&255]);return outp.call(this,p,v)};
  M.step=function(){c.iol=[];c.iow=false;
    const ph=c.pa(c.cs,c.ip),op=[0,1,2,3].map(i=>M.mem[(ph+i)&0xFFFFF]);let j=0;while([0x26,0x2E,0x36,0x3E,0xF0,0xF2,0xF3].includes(op[j])&&j<3)j++;
    c.iow=op[j]===0xE5||op[j]===0xE7||op[j]===0xED||op[j]===0xEF;   // IN/OUT dạng word: hai byte cổng liên tiếp
    const r=step.call(M);M.lastBus=M.last?cyclesOf(M):[];c.iol=null;return r};
  return M}
/* ---------- dạng sóng định tính ----------
   Mỗi trạng thái T chia 3 phần (xung nhịp 8086 có hệ số làm việc 33 %: thấp 2/3, cao 1/3; T bắt đầu ở sườn xuống).
   Hàng "bit": mảng mức 1/0 theo từng phần; hàng "bus": các đoạn {a, b, t (chữ), z (thả nổi)}. */
function wave(cy,mode,nw){nw=Math.max(0,Math.min(5,nw|0));const T=["T1","T2","T3"];for(let i=0;i<nw;i++)T.push("Tw");T.push("T4");
  const N=T.length*3,t4=(T.length-1)*3,t3=6,endW=t4;   // phần đầu của T3 và của T4
  const lv=f=>Array.from({length:N},(_,i)=>f(i)?1:0);
  const rd=KIND[cy.kind].rd,io=cy.io;
  const rows=[];rows.push({n:"CLK",k:"clk",v:lv(i=>i%3===2)});
  if(cy.kind==="HA"){   // chu kỳ dừng: một xung ALE, không bật RD/WR (minimum) hay lệnh nào của 8288 (maximum)
    if(mode==="max")rows.push({n:"S2 S1 S0",k:"bus",v:[{a:0,b:t3,t:"011"},{a:t3,b:N,t:"111"}]});
    rows.push({n:mode==="max"?"ALE (8288)":"ALE",k:"bit",v:lv(i=>i<2)});
    rows.push({n:"AD15–AD0",k:"bus",v:[{a:0,b:N,t:"không có dữ liệu"}]});
    if(mode==="max")rows.push({n:"MRDC … IOWC",k:"bit",v:lv(()=>1),low:1});
    else{rows.push({n:"RD",k:"bit",v:lv(()=>1),low:1});rows.push({n:"WR",k:"bit",v:lv(()=>1),low:1})}
    return{T,N,rows}}
  const adr=io?hx(cy.addr,4):hx(cy.addr&0xFFFF,4),hi=io?"0":hx(cy.addr>>16,1);
  const dat=cy.lane==="w"?hx(cy.data,4)+"h · D15–D0":hx(cy.data,2)+"h · "+(cy.lane==="hi"?"D15–D8":"D7–D0");
  const sbits=(cy.seg==null?"S4S3 ?":"S4S3 = "+S43[cy.seg])+" · S5 = "+cy.s5;
  if(mode==="max"){const s=KIND[cy.kind].s,pas=nw?endW-3:t3;
    rows.push({n:"S2 S1 S0",k:"bus",v:[{a:0,b:pas,t:s},{a:pas,b:N,t:"111"}]});
    rows.push({n:"ALE (8288)",k:"bit",v:lv(i=>i<2)})}
  else rows.push({n:"ALE",k:"bit",v:lv(i=>i<2)});
  rows.push({n:"AD15–AD0",k:"bus",v:rd?[{a:0,b:3,t:adr+"h"},{a:3,b:t3,z:1},{a:t3,b:t4+1,t:"vào "+dat},{a:t4+1,b:N,z:1}]
                                       :[{a:0,b:3,t:adr+"h"},{a:3,b:N,t:"ra "+dat}]});
  rows.push({n:"A19–A16/S6–S3",k:"bus",v:[{a:0,b:3,t:hi+"h"},{a:3,b:N,t:io?"S6–S3":sbits}]});
  rows.push({n:"BHE/S7",k:"bus",v:[{a:0,b:3,t:"BHE = "+cy.bhe},{a:3,b:N,t:"S7"}]});
  const act=(a,b)=>lv(i=>!(i>=a&&i<b));   // tín hiệu tích cực mức thấp: 0 trong [a, b)
  if(mode==="max"){
    const nm=(KIND[cy.kind].mio?"M":"IO");
    if(rd)rows.push({n:nm==="M"?"MRDC":"IORC",k:"bit",v:act(3,t4),low:1});
    else{rows.push({n:nm==="M"?"AMWC":"AIOWC",k:"bit",v:act(3,t4),low:1});rows.push({n:nm==="M"?"MWTC":"IOWC",k:"bit",v:act(t3,t4),low:1})}
    rows.push({n:"DT/R",k:"bit",v:lv(()=>!rd)});
    rows.push({n:"DEN (8288)",k:"bit",v:lv(i=>rd?i>=4&&i<t4+2:i>=2&&i<t4+2)});
    if(cy.lock)rows.push({n:"LOCK",k:"bit",v:lv(()=>0),low:1})}
  else{
    rows.push({n:"M/IO",k:"bit",v:lv(()=>KIND[cy.kind].mio)});
    rows.push({n:"RD",k:"bit",v:rd?act(3,t4):lv(()=>1),low:1});
    rows.push({n:"WR",k:"bit",v:rd?lv(()=>1):act(3,t4),low:1});
    rows.push({n:"DT/R",k:"bit",v:lv(()=>!rd)});
    rows.push({n:"DEN",k:"bit",v:rd?act(4,t4+2):act(2,t4+2),low:1})}
  rows.push({n:"READY",k:"bit",v:lv(i=>!nw||i<5||i>=endW-1)});
  return{T,N,rows}}
/* ---------- mô hình HOLD/HLDA (minimum), theo từng xung nhịp ----------
   Giả định đơn giản hóa (ghi trong bài): CPU luôn muốn bus, chạy liền các chu kỳ bus 4 xung nhịp (T1–T4, không chờ),
   bắt đầu T1 ở xung nhịp 0. CPU xét HOLD ở mỗi xung nhịp; nếu HOLD = 1 ở T4 thì nhả bus từ xung nhịp sau (HLDA = 1).
   Khi đã nhả bus: HOLD còn 1 → thiết bị dùng bus (D); HOLD = 0 → HLDA = 0, bus trống một xung nhịp (-), xung nhịp sau CPU bắt đầu T1.
   rogue (tùy chọn): xung nhịp nào thiết bị tự lái bus mà không chờ HLDA → trùng với CPU là xung đột (X). */
function hold(H){H=String(H||"");let st="bus",p=0;const out=[];
  for(let k=0;k<H.length;k++){const h=H[k]==="1"?1:0;
    if(st==="bus"){out.push({k,h,t:"T"+(p+1),hlda:0,o:"C"});if(p===3){p=0;if(h)st="rel"}else p++}
    else if(h)out.push({k,h,t:"Ti",hlda:1,o:"D"});else{out.push({k,h,t:"Ti",hlda:0,o:"-"});st="bus";p=0}}
  return out}
X86.Bus={KIND,S8288,S43,SEGN,split,cyclesOf,attach,wave,hold,VERSION:"0.1.0"};
if(typeof module!=="undefined"&&module.exports)module.exports=X86;
if(!doc)return;
/* =====================================================================================================
   Phần vẽ
   ===================================================================================================== */
const MOB=()=>!!(G.matchMedia&&G.matchMedia("(max-width:900px)").matches);
let SEQ=0;
/* SVG dạng sóng: cột nhãn + N phần; chữ ≥ 12 đơn vị; khung tự cuộn ngang trên điện thoại (không làm tràn trang) */
function svgWave(W,opt){opt=opt||{};const LW=112,SW=opt.sw||34,RH=30,TOP=24,w=LW+W.N*SW+8,h=TOP+W.rows.length*RH+6;
  const X=i=>LW+i*SW,o=[];
  o.push(`<svg class="xb-svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${escH(opt.aria||"Dạng sóng chu kỳ bus")}">`);
  W.T.forEach((t,i)=>{o.push(`<rect x="${X(i*3)}" y="0" width="${SW*3}" height="${h}" class="${t==="Tw"?"xw-tw":i%2?"xw-b":"xw-a"}"/>`);
    o.push(`<text x="${X(i*3)+SW*1.5}" y="16" class="xw-t" text-anchor="middle">${t}</text>`)});
  W.rows.forEach((r,j)=>{const y0=TOP+j*RH,yh=y0+6,yl=y0+RH-8,ym=(yh+yl)/2;
    o.push(`<text x="4" y="${ym+4}" class="xw-n">${escH(r.n)}</text>`);
    if(r.low)o.push(`<line x1="${4}" y1="${ym-9}" x2="${4+escH(r.n).length*6.6}" y2="${ym-9}" class="xw-ov"/>`);
    if(r.k==="clk"||r.k==="bit"){let d="";r.v.forEach((v,i)=>{const y=v?yh:yl;d+=(i?`L${X(i)} ${y}`:`M${X(0)} ${y}`)+`L${X(i+1)} ${y}`});
      o.push(`<path d="${d}" class="${r.k==="clk"?"xw-clk":"xw-bit"}"/>`)}
    else r.v.forEach(s=>{const a=X(s.a)+2,b=X(s.b)-2;
      if(s.z)o.push(`<line x1="${a}" y1="${ym}" x2="${b}" y2="${ym}" class="xw-z"/>`);
      else{o.push(`<path d="M${a} ${ym}L${a+5} ${yh}L${b-5} ${yh}L${b} ${ym}L${b-5} ${yl}L${a+5} ${yl}Z" class="xw-bus"/>`);
        o.push(`<text x="${(a+b)/2}" y="${ym+4}" class="xw-v" text-anchor="middle">${escH(fit(s.t,(b-a-8)/6.8))}</text>`)}})});
  o.push("</svg>");return o.join("")}
function fit(t,n){t=String(t);n=Math.max(2,Math.floor(n));return t.length<=n?t:t.slice(0,n-1)+"…"}
const KVI=k=>KIND[k].vi;
/* ---------- makeX86Bus ---------- */
G.makeX86Bus=function(root,cfg){cfg=cfg||{};const id="xb"+(++SEQ);const P=cfg.presets||[];const modes=cfg.modes||[cfg.mode||"min"];
  const S={pi:cfg.start||0,mode:modes[0],wm:cfg.wm|0,wi:cfg.wi|0,M:null,hist:[],sel:0,done:false,err:"",pred:false,ask:false,fb:""};
  root.classList.add("xb");
  root.innerHTML=`<div class="xb-bar">
    <label><span>Chương trình</span><select class="xb-pre" id="${id}-pre">${P.map((p,i)=>`<option value="${i}">${escH(p.label)}</option>`).join("")}</select></label>
    ${modes.length>1?`<label><span>Chế độ</span><select class="xb-mode">${modes.map(m=>`<option value="${m}">${m==="max"?"maximum (MN/MX = 0, có 8288)":"minimum (MN/MX = 1)"}</option>`).join("")}</select></label>`:""}
    <label><span>Trạng thái chờ ở bộ nhớ</span><select class="xb-wm">${[0,1,2,3].map(n=>`<option value="${n}">${n}</option>`).join("")}</select></label>
    <label><span>Trạng thái chờ ở cổng I/O</span><select class="xb-wi">${[0,1,2,3].map(n=>`<option value="${n}">${n}</option>`).join("")}</select></label>
    <label class="xb-pr"><input type="checkbox" class="xb-pred"><span>Đoán trước</span></label></div>
   <div class="xb-ins" aria-live="polite"></div>
   <div class="xb-ask" hidden></div>
   <div class="xb-list"></div>
   <div class="xb-wave" tabindex="0" role="region" aria-label="Dạng sóng chu kỳ bus đang chọn"></div>
   <div class="xb-sum"></div>
   <div class="xb-ctl pipe-ctl"><button type="button" class="btn nw xb-reset" title="Làm lại từ đầu" aria-label="Làm lại từ đầu">↺</button><button type="button" class="btn nw xb-back">← Lùi</button><button type="button" class="btn xb-step">Lệnh tiếp →</button><button type="button" class="btn pri xb-next">Tới chu kỳ bus tiếp</button></div>
   <p class="xb-lim">Mô hình để học: dạng sóng định tính (thứ tự sự kiện trong các trạng thái T, không theo tỉ lệ nano giây). Chỉ vẽ chu kỳ bus <b>dữ liệu</b> của lệnh; chu kỳ nạp lệnh vào hàng đợi không vẽ (trình mô phỏng chưa mô hình hàng đợi lệnh). Lệnh INT 21h: dịch vụ DOS chạy bằng JavaScript nên không có chu kỳ bus. Cổng chưa gắn thiết bị đọc được FFh.</p>`;
  const $=s=>root.querySelector(s),pre=$(".xb-pre"),ins=$(".xb-ins"),list=$(".xb-list"),wv=$(".xb-wave"),sum=$(".xb-sum"),ask=$(".xb-ask");
  const st=typeof G.steady==="function"?G.steady(root,[".xb-ins",".xb-list",".xb-wave",".xb-sum"],prime):null;
  function load(i){S.pi=i;const p=P[i]||{};if(p.mode&&modes.includes(p.mode))S.mode=p.mode;if(p.wm!=null)S.wm=p.wm;if(p.wi!=null)S.wi=p.wi;
    pre.value=String(i);const m=$(".xb-mode");if(m)m.value=S.mode;$(".xb-wm").value=String(S.wm);$(".xb-wi").value=String(S.wi);reset()}
  function reset(){S.hist=[];S.sel=0;S.done=false;S.err="";S.ask=false;S.fb="";const p=P[S.pi];
    const r=X86.assemble(p.code);if(!r.ok){S.M=null;S.err="Lỗi dịch ở dòng "+r.errors[0].line+": "+r.errors[0].vi}
    else{S.M=X86.Bus.attach(new X86.Machine(r.prog,{input:p.input||"",interactive:false,maxSteps:200000}));S.M.trace=true;S.src=p.code.split("\n")}
    st&&st.free();render();prime()}
  const waits=c=>c.kind==="HA"?0:c.io?S.wi:S.wm;
  function one(){const M=S.M;if(!M||S.done)return false;const r=M.step();
    if(r.s==="wait"){S.done=true;S.err="Chương trình chờ nhập bàn phím: công cụ này không nhận phím.";return false}
    S.hist.push({info:M.last,bus:M.lastBus||[],line:M.last?S.src[M.last.line-1]||"":""});S.sel=0;
    if(r.s!=="ok"&&r.s!=="bp"){S.done=true;if(r.s==="crash"||r.s==="limit")S.err=M.crash?M.crash.vi:"Dừng bất thường."}
    return true}
  function step(){if(S.pred&&!S.ask&&S.M&&!S.done){S.ask=true;S.fb="";render();return}one();S.ask=false;render();st&&st.hold()}
  function next(){S.ask=false;S.fb="";let n=0;while(one()&&!(S.hist[S.hist.length-1].bus.length)&&n<5000)n++;render();st&&st.hold()}
  function back(){if(!S.M||!S.hist.length)return;S.M.back();S.hist.pop();S.done=false;S.err="";S.sel=0;S.ask=false;S.fb="";render()}
  function answer(k){const M=S.M;S.ask=false;one();const h=S.hist[S.hist.length-1];const n=h?h.bus.length:0;
    S.fb=(+k===n?"Đúng! ":"Chưa đúng: ")+`lệnh này có ${n} chu kỳ bus dữ liệu.`+(n?"":" Lệnh chỉ dùng thanh ghi (hoặc gọi dịch vụ DOS chạy bằng JavaScript).");void M;render();st&&st.hold()}
  /* vẽ trước lệnh có nhiều chu kỳ bus nhất của chương trình (chạy trên một máy riêng) để giữ sẵn chiều cao, rồi vẽ lại trạng thái đang xem */
  function prime(){if(!S.M||!st)return;const p=P[S.pi];const r=X86.assemble(p.code);if(!r.ok)return;
    const M=X86.Bus.attach(new X86.Machine(r.prog,{input:p.input||"",interactive:false,maxSteps:20000}));M.trace=true;let best=null;
    for(let k=0;k<20000;k++){const s=M.step();if(M.last&&(!best||(M.lastBus||[]).length>best.bus.length))best={info:M.last,bus:M.lastBus||[],line:S.src[M.last.line-1]||""};if(s.s!=="ok")break}
    if(!best||!root.offsetHeight)return;const keep=S.hist,ks=S.sel,ka=S.ask,kf=S.fb;S.hist=[best];S.sel=0;S.ask=false;S.fb="";render();st.hold();S.hist=keep;S.sel=ks;S.ask=ka;S.fb=kf;render()}
  function render(){const h=S.hist[S.hist.length-1];
    $(".xb-back").disabled=!S.hist.length;$(".xb-step").disabled=$(".xb-next").disabled=!S.M||S.done;
    ask.hidden=!S.ask&&!S.fb;
    if(S.ask){const nx=S.M?S.src[(S.M.prog.lineAt.get(S.M.cpu.pa(S.M.cpu.cs,S.M.cpu.ip))||0)-1]||"":"";
      ask.innerHTML=`<p>Lệnh sắp chạy: <code>${escH(nx.replace(/;.*/,"").trim())}</code>. Lệnh này cần mấy chu kỳ bus <b>dữ liệu</b> (không tính nạp lệnh)?</p><div class="xb-ab">${[0,1,2,3,4].map(k=>`<button type="button" class="btn" data-a="${k}">${k}</button>`).join("")}</div>`;
      ask.querySelectorAll("[data-a]").forEach(b=>b.onclick=()=>answer(b.dataset.a))}
    else if(S.fb)ask.innerHTML=`<p class="xb-fb">${escH(S.fb)}</p>`;
    if(S.err&&!S.M){ins.innerHTML=`<b>${escH(S.err)}</b>`;list.innerHTML="";wv.innerHTML="";sum.innerHTML="";return}
    if(!h){ins.innerHTML=`Chưa chạy lệnh nào. Bấm <b>Lệnh tiếp →</b> để chạy một lệnh, hoặc <b>Tới chu kỳ bus tiếp</b> để chạy tới lệnh kế tiếp có đọc/ghi bộ nhớ hay cổng.`;
      list.innerHTML="";wv.innerHTML=`<p class="xb-none">Dạng sóng hiện ở đây khi lệnh có chu kỳ bus.</p>`;sum.innerHTML="";return}
    const I=h.info;const code=h.line.replace(/;.*/,"").trim();
    ins.innerHTML=`<span class="xb-k">Lệnh vừa chạy (${S.hist.length})</span> <code>${escH(code)}</code> <span class="xb-m">${hx(I.cs,4)}:${hx(I.ip,4)} · ${I.bytes.map(b=>hx(b,2)).join(" ")} · ${I.cyc} chu kỳ theo bảng</span><b class="xb-end"${S.done?"":" style=\"visibility:hidden\""}>${S.done&&S.err?escH(S.err):"Chương trình đã kết thúc."}</b>`;
    if(!h.bus.length){list.innerHTML=`<p class="xb-none">Không có chu kỳ bus dữ liệu: lệnh chỉ làm việc trên thanh ghi${/INT/i.test(code)?" (dịch vụ DOS chạy bằng JavaScript)":""}. CPU thật vẫn dùng bus để nạp các byte lệnh.</p>`;
      wv.innerHTML=`<p class="xb-none">Không có dạng sóng cho lệnh này.</p>`;sum.innerHTML=`Lệnh: ${I.cyc} chu kỳ theo bảng, không thêm trạng thái chờ.`;return}
    const max=S.mode==="max";
    list.innerHTML=`<div class="tbl"><table><thead><tr><th scope="col">#</th><th scope="col">Loại</th><th scope="col">Địa chỉ</th><th scope="col">BHE A0</th><th scope="col">Dữ liệu</th><th scope="col">${max?"S2 S1 S0 → 8288":"M/IO"}</th><th scope="col">Chờ</th></tr></thead><tbody>${h.bus.map((c,i)=>{const s=X86.Bus.S8288[parseInt(KIND[c.kind].s,2)];
      return`<tr data-i="${i}" class="${i===S.sel?"on":""}" tabindex="0"><td>${i+1}</td><td>${KVI(c.kind)}</td>${c.kind==="HA"?"<td>—</td><td>—</td><td>—</td>":`<td><code>${c.io?hx(c.addr,4):hx(c.addr,5)}h</code></td><td>${c.bhe} ${c.a0}</td><td><code>${c.lane==="w"?hx(c.data,4):hx(c.data,2)}h</code> <small>${c.lane==="w"?"D15–D0":c.lane==="hi"?"D15–D8":"D7–D0"}</small></td>`}<td>${max?`${KIND[c.kind].s} → ${s.adv?s.adv+", ":""}${s.cmd||"không lệnh"}${c.lock?" · LOCK":""}`:c.kind==="HA"?"—":KIND[c.kind].mio}</td><td>${waits(c)}</td></tr>`}).join("")}</tbody></table></div>`;
    list.querySelectorAll("tr[data-i]").forEach(tr=>{tr.onclick=()=>{S.sel=+tr.dataset.i;render()};tr.onkeydown=e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();S.sel=+tr.dataset.i;render()}}});
    const c=h.bus[Math.min(S.sel,h.bus.length-1)],W=X86.Bus.wave(c,S.mode,waits(c));
    wv.innerHTML=`<div class="xb-cap">Chu kỳ ${Math.min(S.sel,h.bus.length-1)+1}: ${KVI(c.kind)}${c.kind==="HA"?"":c.io?" cổng "+hx(c.addr,4)+"h":" địa chỉ "+hx(c.addr,5)+"h"}, ${W.T.length} trạng thái T (${W.T.join(" ")})${max?" · chế độ maximum":" · chế độ minimum"}</div>`
      +svgWave(W,{aria:`${KVI(c.kind)} ở ${hx(c.addr,5)}h: ${W.T.join(", ")}`});
    const add=h.bus.reduce((s,x)=>s+waits(x),0);
    sum.innerHTML=`Lệnh: ${I.cyc} chu kỳ theo bảng (không chờ) + ${h.bus.length} chu kỳ bus × trạng thái chờ = <b>${I.cyc+add} chu kỳ</b>${add?` (thêm ${add})`:""}. Chưa tính chu kỳ nạp lệnh và hàng đợi.`}
  pre.onchange=()=>load(+pre.value);
  const md=$(".xb-mode");if(md)md.onchange=()=>{S.mode=md.value;render()};
  $(".xb-wm").onchange=e=>{S.wm=+e.target.value;render()};$(".xb-wi").onchange=e=>{S.wi=+e.target.value;render()};
  $(".xb-pred").onchange=e=>{S.pred=e.target.checked;S.ask=false;S.fb=S.pred?"Đã bật Đoán trước: trước mỗi lệnh, chọn số chu kỳ bus dữ liệu rồi lệnh mới chạy.":"";render()};
  $(".xb-step").onclick=step;$(".xb-next").onclick=next;$(".xb-back").onclick=back;$(".xb-reset").onclick=reset;
  load(S.pi);
  const api={el:root,load,step,next,back,reset,get state(){return S}};root.xbus=api;return api};
/* ---------- makeX86Hold: HOLD/HLDA theo từng xung nhịp ---------- */
G.makeX86Hold=function(root,cfg){cfg=cfg||{};const SC=cfg.scenarios||[];const S={i:0,k:0,R:[]};root.classList.add("xh");
  root.innerHTML=`<div class="xb-bar"><label><span>Tình huống</span><select class="xh-pre">${SC.map((s,i)=>`<option value="${i}">${escH(s.label)}</option>`).join("")}</select></label></div>
   <p class="xh-note"></p>
   <div class="xh-tl" role="img"></div>
   <div class="xh-rows"><div class="tbl"><table><thead><tr><th scope="col">Xung nhịp</th><th scope="col">HOLD</th><th scope="col">CPU</th><th scope="col">HLDA</th><th scope="col">Ai lái bus</th></tr></thead><tbody></tbody></table></div></div>
   <div class="xb-sum xh-sum"></div>
   <div class="xb-ctl pipe-ctl"><button type="button" class="btn nw xh-reset" aria-label="Làm lại từ đầu" title="Làm lại từ đầu">↺</button><button type="button" class="btn nw xh-back">← Lùi</button><button type="button" class="btn xh-step">Xung nhịp tiếp →</button><button type="button" class="btn pri xh-run">Tới cuối</button></div>
   <p class="xb-lim">Mô hình giả định đơn giản hóa (ghi trong bài): CPU chạy liền các chu kỳ bus 4 xung nhịp, chỉ nhả bus sau T4 khi thấy HOLD = 1 ở T4; thả HOLD thì bus trống một xung nhịp rồi CPU bắt đầu T1. Không theo tỉ lệ ns, không có trạng thái chờ.</p>`;
  const $=s=>root.querySelector(s),tb=$("tbody"),tl=$(".xh-tl");
  const st=typeof G.steady==="function"?G.steady(root,[".xh-rows",".xh-sum"],()=>prime()):null;
  const OWN={C:"CPU",D:"Thiết bị (DMA)","-":"Không ai (thả nổi)",X:"XUNG ĐỘT: CPU và thiết bị cùng lái"};
  function load(i){S.i=i;$(".xh-pre").value=String(i);const s=SC[i]||{};S.R=s.rogue?rogueRun(s):X86.Bus.hold(s.hold);S.k=0;$(".xh-note").textContent=s.note||"";st&&st.free();render();prime()}
  function prime(){if(!st||!root.offsetHeight)return;const k=S.k;S.k=S.R.length;render();st.hold();S.k=k;render()}
  function rogueRun(s){const R=X86.Bus.hold(s.hold);return R.map((x,k)=>{const r=s.rogue[k]==="1";const o=r?(x.o==="C"?"X":x.o==="-"?"D":x.o):x.o;return Object.assign({},x,{o,rogue:r})})}
  function render(){const R=S.R,k=S.k;
    tl.setAttribute("aria-label","Dòng thời gian ai lái bus: "+R.slice(0,k).map(x=>x.o).join(""));
    tl.innerHTML=R.map((x,i)=>`<span class="xh-c ${i<k?"o"+(x.o==="-"?"z":x.o):"todo"}" title="xung nhịp ${i}">${i<k?escH(x.o):"·"}</span>`).join("");
    tb.innerHTML=R.slice(0,k).map(x=>`<tr class="${x.o==="X"?"bad":""}"><td>${x.k}</td><td>${x.h}</td><td>${x.t}</td><td>${x.hlda}</td><td>${OWN[x.o]}${x.rogue?" · thiết bị tự lái":""}</td></tr>`).join("")||`<tr><td colspan="5">Bấm <b>Xung nhịp tiếp →</b> để chạy từng xung nhịp.</td></tr>`;
    const d=R.slice(0,k).filter(x=>x.o==="D").length,x=R.slice(0,k).filter(x=>x.o==="X").length,c=R.slice(0,k).filter(x=>x.o==="C").length;
    $(".xh-sum").innerHTML=`Đã chạy ${k}/${R.length} xung nhịp · CPU lái ${c} · thiết bị lái ${d}${x?` · <b class="xb-bad">${x} xung nhịp xung đột</b>`:""}`;
    $(".xh-back").disabled=!k;$(".xh-step").disabled=$(".xh-run").disabled=k>=R.length}
  $(".xh-pre").onchange=e=>load(+e.target.value);
  $(".xh-step").onclick=()=>{if(S.k<S.R.length)S.k++;render();st&&st.hold()};
  $(".xh-run").onclick=()=>{S.k=S.R.length;render();st&&st.hold()};
  $(".xh-back").onclick=()=>{if(S.k>0)S.k--;render()};
  $(".xh-reset").onclick=()=>load(S.i);
  load(0);const api={el:root,load,get state(){return S}};root.xhold=api;return api};
})(typeof window!=="undefined"?window:globalThis);
/* ===================== trình mô phỏng của khóa (platform/js/59-x86-mem.js) ===================== */
/* ===================== Trình mô phỏng 8086 · phần bộ nhớ (AMTS-EMB-002-SIM22, chương 10 “Thiết kế bộ nhớ và giải mã địa chỉ”) =====================
   Chỉ tải trên trang khóa mpu8086 (build.py: SIM_FILES), sau 58-x86-*.js. Không sửa máy 58-x86-*: đây là ba công cụ nhỏ chạy từng bước
   trong bài (docs/QUY-TAC-TRINH-MO-PHONG.md mục 5). Tài liệu: docs/TRINH-MO-PHONG-8086-MEM.md.

   Phần máy (không dùng DOM, chạy được trong Node; kiểm bằng tools/x86-test/mem.js):
     X86.Mem.chip(c)            chuẩn hóa một chip: kích thước 2^n byte, phương trình chọn chip (bit địa chỉ → 0/1), bit không giải mã
     X86.Mem.sel(c, a)          chip c có được chọn ở địa chỉ vật lý a (20 bit) không
     X86.Mem.map(design)        bản đồ bộ nhớ: các khoảng địa chỉ liền nhau có cùng tập chip được chọn (kể cả khoảng trống)
     X86.Mem.audit(design)      kiểm tra thiết kế: cặp chip chồng nhau (xung đột bus), ROM phủ FFFF0h, RAM phủ bảng vectơ ngắt
     X86.Mem.bank(size, a, rw)  tách một lần truy cập byte/word thành các chu kỳ bus của 8086: BHE, A0, dải chẵn/lẻ, làn dữ liệu, địa chỉ trong chip
     X86.Mem.timing(p)          thời gian truy cập bộ nhớ cho phép theo mô hình của bài (3 ràng buộc: địa chỉ, chọn chip, RD) và số trạng thái chờ cần chèn
   Phần vẽ: makeX86Decode(el, {designs}), makeX86Bank(el, {presets}), makeX86Timing(el, {presets}).
   Đây là mô hình để học: giải mã là logic lý tưởng (không có trễ cổng), bus là mức chức năng; thời gian dùng thông số AC của datasheet
   8086 (cột 8086, 5 MHz) do bài nhập vào và trễ mạch ghép là giả định. Không mô hình hàng đợi lệnh và chu kỳ nạp lệnh. */
(function(G){
"use strict";
const X86=G.X86||(G.X86={});
const doc=G.document;
const hx=(v,n)=>(v>>>0).toString(16).toUpperCase().padStart(n,"0");
const escH=s=>String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
const AMASK=0xFFFFF;
/* ---------- giải mã địa chỉ ---------- */
function log2(n){let k=0;while((1<<k)<n)k++;if((1<<k)!==n)throw new Error("kích thước chip phải là lũy thừa của 2: "+n);return k}
function chip(c){if(c._n!=null)return c;const n=log2(c.size);const cs={};
  for(const [b,v] of Object.entries(c.cs||{})){const i=+b;if(i<n||i>19)throw new Error(c.name+": bit A"+i+" nằm trong địa chỉ của chip hoặc ngoài A0–A19");cs[i]=v?1:0}
  const ign=[];for(let i=19;i>=n;i--)if(!(i in cs))ign.push(i);
  let base=0;for(const [i,v] of Object.entries(cs))if(v)base|=1<<i;
  return Object.assign({},c,{_n:n,cs,ign,base,alias:2**ign.length})}
function sel(c,a){c=chip(c);a&=AMASK;for(const i in c.cs)if(((a>>i)&1)!==c.cs[i])return false;return true}
/* địa chỉ bên trong chip = các bit thấp A(n−1)…A0 */
const inChip=(c,a)=>(a&AMASK)&((1<<chip(c)._n)-1);
/* mọi khoảng địa chỉ của chip (mỗi tổ hợp của các bit không giải mã cho một khoảng); tối đa lim khoảng */
function ranges(c,lim){c=chip(c);lim=lim||4096;const out=[];const k=c.ign.length;const cnt=Math.min(2**k,lim);
  for(let m=0;m<cnt;m++){let a=c.base;c.ign.forEach((b,j)=>{if((m>>(k-1-j))&1)a|=1<<b});out.push([a,a+(1<<c._n)-1])}
  return out.sort((x,y)=>x[0]-y[0])}
function map(d){const C=d.chips.map(chip);const pts=new Set([0,0x100000]);
  C.forEach(c=>ranges(c).forEach(([a,b])=>{pts.add(a);pts.add(b+1)}));
  const P=[...pts].sort((a,b)=>a-b);const out=[];
  for(let i=0;i+1<P.length;i++){const a=P[i],b=P[i+1]-1;const on=C.filter(c=>sel(c,a)).map(c=>c.id);
    const L=out[out.length-1];if(L&&L.on.join()===on.join())L.hi=b;else out.push({lo:a,hi:b,on})}
  return out}
function audit(d){const C=d.chips.map(chip),R=[];
  for(let i=0;i<C.length;i++)for(let j=i+1;j<C.length;j++){const a=C[i],b=C[j];
    if(Object.keys(a.cs).every(k=>!(k in b.cs)||b.cs[k]===a.cs[k])){   // không bit nào bắt buộc khác nhau → có địa chỉ chọn cả hai
      let x=a.base|b.base;R.push({k:"conflict",a:a.id,b:b.id,at:x})}}
  const rom=C.filter(c=>c.kind==="ROM"&&sel(c,0xFFFF0)),ram=C.filter(c=>c.kind==="RAM"&&sel(c,0)&&sel(c,0x3FF));
  R.push({k:"reset",ok:rom.length===1,chips:rom.map(c=>c.id)});R.push({k:"ivt",ok:ram.length===1,chips:ram.map(c=>c.id)});
  return R}
/* ---------- bank chẵn/lẻ (bus dữ liệu 16 bit) ----------
   byte ở địa chỉ chẵn: BHE = 1, A0 = 0, dải chẵn, D7–D0; byte ở địa chỉ lẻ: BHE = 0, A0 = 1, dải lẻ, D15–D8;
   word ở địa chỉ chẵn: 1 chu kỳ, BHE = 0, A0 = 0, cả hai dải; word ở địa chỉ lẻ: 2 chu kỳ (byte thấp ở a trên dải lẻ, rồi byte cao ở a + 1 trên dải chẵn).
   Mỗi chip 8 bit của một dải nhận A1–A(n) của CPU làm địa chỉ A0–A(n−1) của chip: địa chỉ trong chip = a >> 1. */
function bank(size,a,rw){a&=AMASK;const one=(x,lane,which)=>({addr:x,bhe:lane==="lo"?1:0,a0:x&1,lane,banks:lane==="w"?["chẵn","lẻ"]:[lane==="lo"?"chẵn":"lẻ"],
    data:lane==="w"?"D15–D0":lane==="lo"?"D7–D0":"D15–D8",which,inChip:x>>1,rw:rw||"r"});
  if(size===1)return[one(a,a&1?"hi":"lo","byte")];
  if(!(a&1))return[one(a,"w","word")];
  return[one(a,"hi","byte thấp"),one((a+1)&AMASK,"lo","byte cao")]}
const bankPenalty=(size,a)=>size===2&&(a&1)?4:0;   // chu kỳ thêm của 8086 cho mỗi lần truy cập word ở địa chỉ lẻ (bảng thời gian lệnh)
/* ---------- thời gian truy cập (chu kỳ đọc bộ nhớ, chế độ minimum) ----------
   Mô hình của bài: thời gian tính từ đầu T1. Địa chỉ ra chân CPU muộn nhất TCLAV, qua chốt (tLatch) tới chip; dữ liệu phải có ở chân CPU
   trước sườn xuống CLK đầu T4 một khoảng TDVCL (thời gian thiết lập), sau khi qua bộ đệm (tBuf).
     cho phép theo địa chỉ:   tAcc_ok = (3 + Tw)·T − TCLAV − tLatch − tBuf − TDVCL
     cho phép theo chọn chip: tCe_ok  = tAcc_ok − tDec
     cho phép theo RD:        tOe_ok  = (2 + Tw)·T − TCLRL − tBuf − TDVCL
   Số Tw cần = số nguyên nhỏ nhất ≥ 0 để cả ba điều kiện tACC ≤ tAcc_ok, tCE ≤ tCe_ok, tOE ≤ tOe_ok đều đúng. */
function timing(p){const T=p.T,base={acc:3*T-p.TCLAV-p.tLatch-p.tBuf-p.TDVCL,oe:2*T-p.TCLRL-p.tBuf-p.TDVCL};base.ce=base.acc-p.tDec;
  const need=(t,ok)=>t<=ok?0:Math.ceil((t-ok)/T);
  const w={acc:need(p.tACC,base.acc),ce:need(p.tCE,base.ce),oe:need(p.tOE,base.oe)};const tw=Math.max(w.acc,w.ce,w.oe);
  const at=k=>base[k]+tw*T;
  return{T,base,w,tw,ok:{acc:at("acc"),ce:at("ce"),oe:at("oe")},margin:{acc:at("acc")-p.tACC,ce:at("ce")-p.tCE,oe:at("oe")-p.tOE},
    cycle:(4+tw)*T,
    /* mốc thời gian (ns, từ đầu T1) để vẽ */
    ev:{addrCpu:p.TCLAV,addrMem:p.TCLAV+p.tLatch,csMem:p.TCLAV+p.tLatch+p.tDec,rd:T+p.TCLRL,sample:(3+tw)*T,
      dataMem:Math.max(p.TCLAV+p.tLatch+p.tACC,p.TCLAV+p.tLatch+p.tDec+p.tCE,T+p.TCLRL+p.tOE),dataCpu:Math.max(p.TCLAV+p.tLatch+p.tACC,p.TCLAV+p.tLatch+p.tDec+p.tCE,T+p.TCLRL+p.tOE)+p.tBuf}}}
X86.Mem={VERSION:"0.1.0",chip,sel,inChip,ranges,map,audit,bank,bankPenalty,timing,hx};
if(!doc)return;   // Node: chỉ phần máy
/* ======================================================= phần vẽ ======================================================= */
const h=(t,a,c)=>{const e=doc.createElement(t);if(a)for(const k in a)e.setAttribute(k,a[k]);if(c!=null)e.innerHTML=c;return e};
const ctlHTML=P=>`<div class="pipe-ctl xm-ctl"><button type="button" class="btn" data-k="reset">↺ Làm lại</button><button type="button" class="btn" data-k="back">← Lùi</button><button type="button" class="btn pri" data-k="next">Bước tiếp →</button><label class="xm-pr"><input type="checkbox" data-k="pred"> Đoán trước</label><span class="crumb" data-k="pos"></span></div>`;
/* khung chung: chọn mẫu, phần hình, hàng nút, phần câu hỏi / giải thích (dưới hàng nút) */
function frame(el,cls,title,opts,labels){el.classList.add("xm",cls);
  el.innerHTML=`<div class="xm-bar"><label><span>${escH(title)}</span><select data-k="pick">${labels.map((l,i)=>`<option value="${i}">${escH(l)}</option>`).join("")}</select></label></div>
  <div class="xm-fig" data-k="fig"></div>${ctlHTML()}<div class="xm-ask" data-k="ask" hidden></div><div class="xm-say" data-k="say" aria-live="polite"></div>`;
  const q=k=>el.querySelector(`[data-k="${k}"]`);return q}
/* hỏi đoán trước: hiện các lựa chọn, chờ học viên chọn rồi mới cho bước tiếp */
function asker(q){let pend=null;return{get busy(){return!!pend},ask(text,opts,right,why,done){const A=q("ask");pend=done;A.hidden=false;
    A.innerHTML=`<p><b>Đoán trước:</b> ${text}</p><div class="xm-ab">${opts.map((o,i)=>`<button type="button" class="btn" data-a="${i}">${escH(o)}</button>`).join("")}</div><p class="xm-fb"></p>`;
    A.querySelectorAll("[data-a]").forEach(b=>b.onclick=()=>{if(!pend)return;const i=+b.dataset.a,ok=i===right;
      A.querySelector(".xm-fb").innerHTML=(ok?"<b>Đúng.</b> ":"<b>Chưa đúng.</b> Đáp án: "+escH(opts[right])+". ")+why;A.querySelectorAll("[data-a]").forEach(x=>x.disabled=true);
      const f=pend;pend=null;f()})},clear(){pend=null;const A=q("ask");A.hidden=true;A.innerHTML=""}}}
function bits20(a,role){let s="";for(let i=19;i>=0;i--){const r=role(i);s+=`<span class="xm-bit ${r}" title="A${i}"><small>A${i}</small>${(a>>i)&1}</span>`}return`<div class="xm-bits" role="img" aria-label="20 bit địa chỉ A19 tới A0 của ${hx(a,5)}h">${s}</div>`}
/* ---------- công cụ 1: giải mã địa chỉ, quét bản đồ bộ nhớ ---------- */
G.makeX86Decode=function(el,o){const D=o.designs;const q=frame(el,"xm-dec","Thiết kế giải mã",o,D.map(d=>d.label));const A=asker(q);
  const SD=G.steady?G.steady(el,['[data-k="fig"]','[data-k="say"]']):{hold(){},free(){}};
  let d,M,C,k,shown;
  function eqn(c){const ks=Object.keys(c.cs).map(Number).sort((a,b)=>b-a);return ks.map(i=>`<code>${c.cs[i]?"":"/"}A${i}</code>`).join(" · ")||"(luôn chọn)"}
  function load(){d=D[+q("pick").value];C=d.chips.map(X86.Mem.chip);M=X86.Mem.map(d);k=-1;shown=-1;A.clear();SD.free();draw();prime()}
  function prime(){const s=k;k=M.length-1;shown=k;draw();SD.hold();k=s;shown=s;draw()}
  function nm(id){const c=C.find(x=>x.id===id);return c?c.name:id}
  function draw(){const au=X86.Mem.audit(d);const cur=k>=0?M[k]:null;
    const rows=M.map((r,i)=>`<tr class="${i===k?"on":""}${r.on.length>1?" bad":""}${!r.on.length?" none":""}"><td><code>${hx(r.lo,5)}–${hx(r.hi,5)}</code></td><td>${i<=shown?(r.on.length?r.on.map(nm).map(escH).join(" + "):"(trống)"):"?"}</td></tr>`).join("");
    const ch=C.map(c=>`<tr><td><b>${escH(c.name)}</b><br><small>${c.size>=1024?c.size/1024+" KB":c.size+" byte"}, dùng A${c._n-1}–A0 · </small>${c.ign.length?`<small class="xm-warn">${c.alias} vùng (bỏ ${c.ign.map(i=>"A"+i).join(", ")})</small>`:"<small>1 vùng</small>"}</td><td>${eqn(c)}</td></tr>`).join("");
    const conf=au.filter(x=>x.k==="conflict");const rs=au.find(x=>x.k==="reset"),iv=au.find(x=>x.k==="ivt");
    let cb=bits20(0,()=>"ign")+`<p class="xm-legend">Chọn một khoảng bằng <b>Bước tiếp</b> để xem vai trò của từng bit địa chỉ.</p>`;if(cur){const a=cur.lo;const used=new Set();C.forEach(c=>{if(cur.on.includes(c.id))Object.keys(c.cs).forEach(i=>used.add(+i))});
      const n=cur.on.length?Math.min(...C.filter(c=>cur.on.includes(c.id)).map(c=>c._n)):0;
      cb=bits20(a,i=>used.has(i)?"dec":i<n?"in":"ign")+`<p class="xm-legend"><span class="xm-bit dec">1</span> bit đưa vào giải mã · <span class="xm-bit in">1</span> địa chỉ trong chip · <span class="xm-bit ign">1</span> không dùng</p>`}
    q("fig").innerHTML=`<div class="tbl xm-t"><table><caption>Phương trình chọn chip (CS tích cực khi mọi bit khớp; /A15 nghĩa là A15 = 0)</caption><thead><tr><th scope="col">Chip</th><th scope="col">Chọn khi</th></tr></thead><tbody>${ch}</tbody></table></div>
      ${cb}<div class="tbl xm-t xm-map"><table><caption>Bản đồ bộ nhớ (bước tiếp: khoảng kế tiếp)</caption><thead><tr><th scope="col">Khoảng địa chỉ</th><th scope="col">Chip được chọn</th></tr></thead><tbody>${rows}</tbody></table></div>
      <p class="xm-chk">${conf.length?`<span class="xm-warn">Xung đột: ${conf.map(x=>escH(nm(x.a))+" và "+escH(nm(x.b))+" cùng được chọn, ví dụ ở "+hx(x.at,5)+"h").join("; ")}.</span>`:"Không có hai chip nào được chọn cùng lúc."} ${rs.ok?"ROM phủ FFFF0h (lệnh đầu tiên sau RESET).":`<span class="xm-warn">Không có đúng một ROM phủ FFFF0h.</span>`} ${iv.ok?"RAM phủ bảng vectơ ngắt 00000h–003FFh.":`<span class="xm-warn">Bảng vectơ ngắt 00000h–003FFh không nằm trọn trong một RAM.</span>`}</p>`;
    let say="";if(cur){const sz=cur.hi-cur.lo+1;say=`<p>Khoảng <code>${hx(cur.lo,5)}h–${hx(cur.hi,5)}h</code> (${sz>=1024?sz/1024+" KB":sz+" byte"}): ${cur.on.length===0?"không chip nào được chọn; đọc ở đây cho giá trị không xác định (bus thả nổi).":cur.on.length>1?`<b>${cur.on.map(nm).map(escH).join(" và ")}</b> cùng xuất dữ liệu: xung đột bus, phải sửa giải mã.`:`chọn <b>${escH(nm(cur.on[0]))}</b>, địa chỉ trong chip <code>${hx(X86.Mem.inChip(C.find(c=>c.id===cur.on[0]),cur.lo),5)}h</code>–<code>${hx(X86.Mem.inChip(C.find(c=>c.id===cur.on[0]),cur.hi),5)}h</code>.`}</p>`}
    else say=`<p>${escH(d.note||"")} Bấm <b>Bước tiếp</b> để đi qua từng khoảng của bản đồ bộ nhớ.</p>`;
    q("say").innerHTML=say;q("pos").textContent=k<0?"Chưa bắt đầu":`Khoảng ${k+1}/${M.length}`;q("back").disabled=k<0;q("next").disabled=k>=M.length-1}
  function next(){if(A.busy||k>=M.length-1)return;const n=k+1,r=M[n];
    const go=()=>{k=n;shown=Math.max(shown,k);draw();SD.hold()};
    if(q("pred").checked){const opts=C.map(c=>c.name).concat(["Không chip nào"]);const right=r.on.length===1?C.findIndex(c=>c.id===r.on[0]):r.on.length?C.findIndex(c=>c.id===r.on[0]):C.length;
      A.ask(`địa chỉ <code>${hx(r.lo,5)}h</code> chọn chip nào?`,opts,right,r.on.length>1?"Ở đây có hơn một chip được chọn (xung đột); lựa chọn đúng là chip đầu tiên trong số đó.":"Xem các bit đưa vào giải mã của địa chỉ này.",go)}
    else{A.clear();go()}}
  q("pick").onchange=load;q("next").onclick=next;q("back").onclick=()=>{if(k<0)return;A.clear();k--;draw()};q("reset").onclick=()=>{A.clear();k=-1;shown=-1;SD.free();draw();prime()};
  load()};
/* ---------- công cụ 2: bank chẵn/lẻ, BHE và A0 ---------- */
G.makeX86Bank=function(el,o){const P=o.presets;const q=frame(el,"xm-bank","Dãy truy cập",o,P.map(p=>p.label));const A=asker(q);
  const SD=G.steady?G.steady(el,['[data-k="fig"]','[data-k="say"]']):{hold(){},free(){}};
  let p,S,k;
  function load(){p=P[+q("pick").value];S=[];p.acc.forEach((x,ai)=>{const cy=X86.Mem.bank(x.size,x.addr,x.rw);cy.forEach((c,j)=>S.push(Object.assign({ai,j,of:cy.length,x},c)))});k=-1;A.clear();SD.free();draw();prime()}
  function prime(){const s=k;let mx=0;S.forEach((c,i)=>{if(c.lane==="w")mx=i});k=S.length?mx:-1;draw();SD.hold();k=s;draw()}
  function laneBox(c){const on=b=>c&&c.banks.includes(b);const v=c?((c.x.val!=null)?c.x.val:null):null;
    const lo=c&&(c.lane==="lo"||c.lane==="w"),hi=c&&(c.lane==="hi"||c.lane==="w");
    const bl=c?c.x.size===2?(c.lane==="w"?["byte thấp","byte cao"]:c.j===0?[null,"byte thấp"]:["byte cao",null]):[c.lane==="lo"?"byte":null,c.lane==="hi"?"byte":null]:[null,null];
    return`<div class="xm-banks" role="img" aria-label="Hai dải bộ nhớ 8 bit: dải chẵn nối D7–D0, dải lẻ nối D15–D8">
      <div class="xm-bk ${on("lẻ")?"on":""}"><b>Dải lẻ</b><small>chọn khi BHE = 0 · nối D15–D8</small><span>${on("lẻ")?`địa chỉ trong chip <code>${hx(c.inChip,5)}h</code>${bl[1]?" · "+bl[1]:""}`:"không hoạt động"}</span></div>
      <div class="xm-bk ${on("chẵn")?"on":""}"><b>Dải chẵn</b><small>chọn khi A0 = 0 · nối D7–D0</small><span>${on("chẵn")?`địa chỉ trong chip <code>${hx(c.inChip,5)}h</code>${bl[0]?" · "+bl[0]:""}`:"không hoạt động"}</span></div>
      <div class="xm-lane ${hi?"on":""}">D15–D8</div><div class="xm-lane ${lo?"on":""}">D7–D0</div></div>`}
  function draw(){const c=k>=0?S[k]:null;
    const rows=p.acc.map((x,i)=>{const n=X86.Mem.bank(x.size,x.addr).length;const done=S.filter((s,j)=>s.ai===i&&j<=k).length;
      return`<tr class="${c&&c.ai===i?"on":""}"><td><code>${escH(x.ins)}</code></td><td>${x.size===2?"word":"byte"} ở <code>${hx(x.addr,5)}h</code> (${x.addr&1?"lẻ":"chẵn"})<br><small>${done?`${n} chu kỳ bus${X86.Mem.bankPenalty(x.size,x.addr)?" · +4 chu kỳ xung nhịp":""}`:"? chu kỳ bus"}</small></td></tr>`}).join("");
    const sig=c?`<div class="xm-sig"><span>BHE = <b>${c.bhe}</b></span><span>A0 = <b>${c.a0}</b></span><span>${c.rw==="w"?"WR":"RD"} · ${c.which}</span><span>A19–A1 = <code>${hx(c.addr>>1,5)}h</code></span></div>`:"";
    q("fig").innerHTML=`<div class="tbl xm-t"><table><caption>Các lần truy cập của đoạn code</caption><thead><tr><th scope="col">Lệnh</th><th scope="col">Truy cập · chu kỳ bus</th></tr></thead><tbody>${rows}</tbody></table></div>
      ${c?bits20(c.addr,i=>i===0?"dec":"in"):bits20(0,()=> "ign")}${sig}${laneBox(c)}`;
    q("say").innerHTML=c?`<p>Chu kỳ bus ${c.j+1}/${c.of} của <code>${escH(c.x.ins)}</code>: ${c.lane==="w"?"word ở địa chỉ chẵn: BHE = 0 và A0 = 0, hai dải cùng hoạt động, 16 bit đi trong <b>một</b> chu kỳ bus.":c.x.size===2?(c.j===0?"word ở địa chỉ lẻ: chu kỳ 1 lấy byte thấp ở địa chỉ lẻ, chỉ dải lẻ (BHE = 0, A0 = 1), byte đi trên D15–D8 rồi CPU tự chuyển vào nửa thấp.":"chu kỳ 2 lấy byte cao ở địa chỉ chẵn kế tiếp, chỉ dải chẵn (BHE = 1, A0 = 0). Hai chu kỳ bus: 8086 tốn thêm 4 chu kỳ máy."):c.lane==="lo"?"byte ở địa chỉ chẵn: chỉ dải chẵn (A0 = 0), BHE = 1 để dải lẻ không ghi đè.":"byte ở địa chỉ lẻ: chỉ dải lẻ (BHE = 0), A0 = 1 để dải chẵn đứng yên."} ${escH(c.x.note||"")}</p>`:`<p>${escH(p.note||"")} Bấm <b>Bước tiếp</b> để đi qua từng chu kỳ bus.</p>`;
    q("pos").textContent=k<0?"Chưa bắt đầu":`Chu kỳ bus ${k+1}/${S.length}`;q("back").disabled=k<0;q("next").disabled=k>=S.length-1}
  function next(){if(A.busy||k>=S.length-1)return;const n=k+1,c=S[n];const go=()=>{k=n;draw();SD.hold()};
    if(q("pred").checked){const opts=["BHE = 0, A0 = 0","BHE = 0, A0 = 1","BHE = 1, A0 = 0"];const right=c.bhe===0&&c.a0===0?0:c.bhe===0?1:2;
      A.ask(`chu kỳ bus ${c.j+1} của <code>${escH(c.x.ins)}</code> đặt BHE và A0 thế nào?`,opts,right,"BHE = 0 bật dải lẻ (D15–D8), A0 = 0 bật dải chẵn (D7–D0).",go)}
    else{A.clear();go()}}
  q("pick").onchange=load;q("next").onclick=next;q("back").onclick=()=>{if(k<0)return;A.clear();k--;draw()};q("reset").onclick=()=>{A.clear();k=-1;SD.free();draw();prime()};
  load()};
/* ---------- công cụ 3: thời gian truy cập bộ nhớ, trạng thái chờ ---------- */
G.makeX86Timing=function(el,o){const P=o.presets;const q=frame(el,"xm-tim","Cặp CPU – bộ nhớ",o,P.map(p=>p.label));const A=asker(q);
  const SD=G.steady?G.steady(el,['[data-k="fig"]','[data-k="say"]']):{hold(){},free(){}};
  let p,R,ST,k;
  const F=[["tACC","tACC bộ nhớ"],["tCE","tCE bộ nhớ"],["tOE","tOE bộ nhớ"],["tLatch","trễ chốt"],["tDec","trễ giải mã"],["tBuf","trễ bộ đệm"]];
  function load(){p=Object.assign({},P[+q("pick").value]);k=-1;A.clear();SD.free();calc();prime()}
  function calc(){R=X86.Mem.timing(p);ST=["T1","T2","T3"];for(let i=0;i<R.tw;i++)ST.push("Tw");ST.push("T4");if(k>=ST.length)k=ST.length-1;draw()}
  function prime(){const s=k;k=ST.length-1;draw();SD.hold();k=s;draw()}
  function wave(){const T=R.T,W=ST.length,px=Math.max(56,Math.round(64*200/T)),sc=px/T,w=W*px+70,y0=20,rh=34;
    const X=t=>56+t*sc;let s=`<svg viewBox="0 0 ${w} ${y0+rh*5+26}" width="${w}" height="${y0+rh*5+26}" class="xm-wave" role="img" aria-label="Dạng sóng chu kỳ đọc bộ nhớ: ${ST.join(", ")}">`;
    ST.forEach((n,i)=>{s+=`<rect x="${X(i*T)}" y="4" width="${px}" height="${y0+rh*5}" class="${i===k?"xm-col on":"xm-col"}"/><text x="${X(i*T)+px/2}" y="15" class="xm-tx c">${n}</text>`});
    const row=(r,lbl)=>`<text x="2" y="${y0+r*rh+22}" class="xm-tx l">${lbl}</text>`;
    // CLK: thấp 2/3 đầu, cao 1/3 cuối mỗi T (xung 33 %, như 8284A)
    let c=`M${X(0)} ${y0+28}`;ST.forEach((n,i)=>{const a=X(i*T),b=X(i*T+2*T/3),e=X((i+1)*T);c+=` L${b} ${y0+28} L${b} ${y0+12} L${e} ${y0+12} L${e} ${y0+28}`});s+=row(0,"CLK")+`<path d="${c}" class="xm-ln"/>`;
    const y1=y0+rh;s+=row(1,"ALE")+`<path d="M${X(0)} ${y1+28} L${X(p.TCLLH||0)+2} ${y1+28} L${X(p.TCLLH||0)+2} ${y1+12} L${X(T*0.66)} ${y1+12} L${X(T*0.66)} ${y1+28} L${X(W*T)} ${y1+28}" class="xm-ln"/>`;
    const y2=y0+2*rh;s+=row(2,"Địa chỉ")+`<path d="M${X(0)} ${y2+20} L${X(R.ev.addrMem)} ${y2+20}" class="xm-ln dim"/><rect x="${X(R.ev.addrMem)}" y="${y2+12}" width="${X(W*T)-X(R.ev.addrMem)}" height="16" class="xm-bar a"/><text x="${X(R.ev.addrMem)+4}" y="${y2+24}" class="xm-tx">địa chỉ đã chốt tới chip</text>`;
    const y3=y0+3*rh;s+=row(3,"RD")+`<path d="M${X(0)} ${y3+12} L${X(R.ev.rd)} ${y3+12} L${X(R.ev.rd)} ${y3+28} L${X((W-1)*T+T*0.66)} ${y3+28} L${X((W-1)*T+T*0.66)} ${y3+12} L${X(W*T)} ${y3+12}" class="xm-ln"/>`;
    const y4=y0+4*rh,dv=Math.min(R.ev.dataCpu,W*T),late=R.ev.dataCpu>R.ev.sample-p.TDVCL;
    s+=row(4,"Dữ liệu")+`<path d="M${X(0)} ${y4+20} L${X(dv)} ${y4+20}" class="xm-ln dim"/>${dv<W*T?`<rect x="${X(dv)}" y="${y4+12}" width="${X(W*T)-X(dv)}" height="16" class="xm-bar ${late?"bad":"d"}"/>`:""}`;
    s+=`<line x1="${X(R.ev.sample)}" y1="4" x2="${X(R.ev.sample)}" y2="${y0+rh*5}" class="xm-smp"/><line x1="${X(R.ev.sample-p.TDVCL)}" y1="${y4+6}" x2="${X(R.ev.sample-p.TDVCL)}" y2="${y0+rh*5}" class="xm-smp s"/>`;
    s+=`<text x="${X(R.ev.sample)+3}" y="${y0+rh*5+18}" class="xm-tx">CPU đọc dữ liệu (đầu T4)</text></svg>`;return s}
  function draw(){const inp=F.map(([f,l])=>`<label><span>${l} (ns)</span><input type="number" inputmode="numeric" min="0" max="2000" step="5" data-f="${f}" value="${p[f]}"></label>`).join("");
    const m=x=>`${x>=0?"+":"−"}${Math.abs(x)} ns`;
    const row=(k,lbl,f,need)=>`<tr><td><b>${lbl}</b><br><small>${f}</small></td><td>${R.ok[k]} / ${need} ns</td><td class="${R.margin[k]<0?"xm-warn":""}">${m(R.margin[k])}</td></tr>`;
    const tb=`<div class="tbl xm-t xm-tim"><table><caption>Thời gian cho phép với ${R.tw} trạng thái chờ (T = ${R.T} ns)</caption><thead><tr><th scope="col">Ràng buộc</th><th scope="col">Cho phép / bộ nhớ cần</th><th scope="col">Dư</th></tr></thead><tbody>
      ${row("acc","tACC","(3 + Tw)·T − TCLAV − chốt − đệm − TDVCL",p.tACC)}${row("ce","tCE","như trên − giải mã",p.tCE)}${row("oe","tOE","(2 + Tw)·T − TCLRL − đệm − TDVCL",p.tOE)}</tbody></table></div>`;
    q("fig").innerHTML=`<div class="xm-in">${inp}</div><p class="xm-cpu">CPU: T = ${p.T} ns, TCLAV ≤ ${p.TCLAV} ns, TCLRL ≤ ${p.TCLRL} ns, TDVCL ≥ ${p.TDVCL} ns <small>(${escH(p.src||"")})</small></p>
      ${tb}<p class="xm-res">Cần <b>${R.tw} trạng thái chờ</b> (theo tACC ${R.w.acc}, tCE ${R.w.ce}, tOE ${R.w.oe}); một chu kỳ đọc dài (4 + ${R.tw}) × ${R.T} = <b>${R.cycle} ns</b>.</p>
      <div class="xm-wv">${wave()}</div>`;
    q("fig").querySelectorAll("input[data-f]").forEach(i=>i.onchange=()=>{const v=Math.max(0,Math.min(2000,Math.round(+i.value||0)));p[i.dataset.f]=v;A.clear();SD.free();calc()});
    const st=k>=0?ST[k]:null;const tw=ST.slice(0,k+1).filter(x=>x==="Tw").length;
    const EV={T1:`CPU đưa địa chỉ ra AD0–AD15, A16–A19 (muộn nhất TCLAV = ${p.TCLAV} ns sau đầu T1) và phát xung ALE; chốt giữ địa chỉ, sau ${p.tLatch} ns địa chỉ tới chip (mốc ${R.ev.addrMem} ns), bộ giải mã chọn chip ở mốc ${R.ev.csMem} ns.`,
      T2:`AD0–AD15 thả nổi để chuẩn bị nhận dữ liệu; RD xuống mức thấp muộn nhất TCLRL = ${p.TCLRL} ns sau đầu T2 (mốc ${R.ev.rd} ns), bộ nhớ bắt đầu mở đầu ra (tOE).`,
      T3:`Bộ nhớ đang truy cập. Dữ liệu tới chân CPU ở mốc ${R.ev.dataCpu} ns; CPU cần nó trước mốc ${3*R.T-p.TDVCL+R.tw*R.T} ns. ${R.tw?"Chưa kịp: READY bị kéo xuống, CPU chèn trạng thái chờ sau T3.":"Kịp: không cần trạng thái chờ."}`,
      Tw:`Trạng thái chờ thứ ${tw}: mọi tín hiệu giữ nguyên, CPU chờ thêm ${R.T} ns.`,
      T4:`Đầu T4 CPU chốt dữ liệu (mốc ${R.ev.sample} ns, cần dữ liệu ổn định trước đó TDVCL = ${p.TDVCL} ns); RD lên mức cao, chu kỳ đọc kết thúc sau ${R.cycle} ns.`};
    q("say").innerHTML=st?`<p><b>${st}${st==="Tw"?" "+tw:""}:</b> ${EV[st]}</p>`:`<p>${escH(p.note||"")} Đổi thông số bộ nhớ hoặc trễ mạch ghép rồi bấm <b>Bước tiếp</b> để đi qua từng trạng thái T.</p>`;
    q("pos").textContent=k<0?"Chưa bắt đầu":`${st} (${k+1}/${ST.length})`;q("back").disabled=k<0;q("next").disabled=k>=ST.length-1}
  function next(){if(A.busy||k>=ST.length-1)return;const n=k+1;const go=()=>{k=n;draw();SD.hold()};
    if(q("pred").checked&&ST[n]!=="T1"&&ST[n-1]==="T3"){A.ask("sau T3, CPU chèn trạng thái chờ (Tw) hay sang T4?",["Chèn Tw","Sang T4"],ST[n]==="Tw"?0:1,"Bảng thời gian cho phép: còn ràng buộc nào âm ở 0 Tw thì phải chèn Tw.",go)}
    else{A.clear();go()}}
  q("pick").onchange=load;q("next").onclick=next;q("back").onclick=()=>{if(k<0)return;A.clear();k--;draw()};q("reset").onclick=()=>{A.clear();k=-1;SD.free();draw();prime()};
  load()};
})(typeof window!=="undefined"?window:globalThis);
/* ===================== trình mô phỏng của khóa (platform/js/59-x86-io.js) ===================== */
/* ===================== Trình mô phỏng 8086 · phần 5: bo I/O ngoại vi (8255A, 8254, 8259A, 8251A) =====================
   Chỉ tải trên trang khóa mpu8086 (build.py: SIM_FILES). Không dùng DOM; chạy được trong Node. Tài liệu: docs/TRINH-MO-PHONG-8086-IO.md.
   Tệp này KHÔNG sửa 58-x86-*.js: nó thay X86.Machine bằng một lớp con có gắn "bo I/O AMTS" (giả định) và bọc X86.grade để chấm
   thêm trạng thái thiết bị (test.io). Chương trình không dùng cổng 80h–9Fh chạy y như trước (IN ở cổng khác vẫn đọc FFh).

   Bo I/O AMTS (giả định của khóa, giống bo thí nghiệm 8086 thường gặp): bốn chip 8 bit nối vào nửa thấp bus dữ liệu D0–D7,
   nên chỉ trả lời ở địa chỉ CHẴN (A0 = 0); A2 A1 chọn thanh ghi trong chip, A5 A4 A3 chọn chip (74LS138), A7 = 1, A6 = 0, A15–A8 = 0.
     8255A PPI   80h PA · 82h PB · 84h PC · 86h thanh ghi điều khiển
     8254 PIT    88h bộ đếm 0 · 8Ah bộ đếm 1 · 8Ch bộ đếm 2 · 8Eh thanh ghi điều khiển
     8259A PIC   90h (A0 = 0) · 92h (A0 = 1)   (94h, 96h là bí danh vì 8259A chỉ dùng A0 ← A1 của CPU)
     8251A USART 98h dữ liệu · 9Ah điều khiển/trạng thái   (9Ch, 9Eh là bí danh)
   Địa chỉ lẻ trong vùng 80h–9Fh: không chip nào nối với D8–D15 → đọc FFh, ghi bị mất (ghi chú "odd").
   Thiết bị ngoài: PA → 8 LED (1 = sáng); PB ← 8 công tắc (1 = bật); PC3–PC0 → 4 LED đỏ, PC0 còn nối GATE1 của 8254;
   PC7–PC4 ← 4 nút K0–K3 (1 = đang nhấn). 8254: CLK0 = CLK1 = CLK2 = PCLK của 8284A = 2,5 MHz (CPU 5 MHz, giả định),
   GATE0 = GATE2 = 1; OUT0 → IR0 của 8259A; OUT2 → TxC và RxC của 8251A. IR1 ← nút ngắt (cạnh lên khi nhấn). IR2–IR7 = 0.
   8251A TxD/RxD nối "máy tính đầu kia" (terminal, mặc định 9600 baud 8N1, giả định).
   Thời gian đo bằng chu kỳ xung nhịp CPU (5 MHz → 0,2 µs); 8254 đếm một lần mỗi 2 chu kỳ CPU. Thiết bị tiến theo từng lệnh:
   đọc/ghi cổng có hiệu lực ngay khi lệnh IN/OUT chạy, rồi thời gian của cả lệnh mới trôi qua (sai số tối đa một lệnh).
   Ngắt phần cứng: giữa hai lệnh, nếu IF = 1 và 8259A đang yêu cầu (INT), CPU nhận ngắt (hai chu kỳ INTA, 61 chu kỳ, giả định theo bảng
   Intel — CẦN XÁC MINH), cất FLAGS, CS, IP, xóa IF, TF và nhảy theo vectơ 8259A đưa ra. HLT: CPU chờ tới ngắt kế tiếp nếu bo có
   nguồn ngắt đang chạy; nếu không, như cũ (coi là kết thúc). */
(function(G){
"use strict";
const X86=G.X86;
const IF=512,CPU_HZ=5e6,TICK=2;
const IO=X86.IO={CPU_HZ,TICK,PIT_HZ:CPU_HZ/TICK,queue:[],live:null,
  MAP:{ppi:0x80,pit:0x88,pic:0x90,usart:0x98},INTR_CYC:61,HLT_MAX:5000000};
const hx=v=>X86.hex2(v)+"h";
/* ============ 8255A ============ */
class PPI{
  constructor(b){this.b=b;this.reset()}
  reset(){this.s={cw:0x9B,set:1,aIn:1,bIn:1,cuIn:1,clIn:1,mA:0,mB:0,pa:0,pb:0,pc:0,writes:0}}
  pins(){const s=this.s,x=this.b.ext;
    const pa=s.aIn?0xFF:s.pa;                      // PA vào: chân để hở, giả định kéo lên → FFh
    const pb=s.bIn?x.sw&255:s.pb;                  // PB nối công tắc
    const cu=s.cuIn?((x.btn&15)<<4):(s.pc&0xF0);   // PC7–PC4 nối nút K0–K3
    const cl=s.clIn?0x0F:(s.pc&0x0F);              // PC3–PC0 vào: hở → 1
    return{pa,pb,pc:cu|cl}}
  rd(r){const s=this.s,p=this.pins();
    if(r===0)return p.pa;if(r===1)return p.pb;if(r===2)return p.pc;
    this.b.note("ppird","8255A không cho đọc thanh ghi điều khiển (86h): trình mô phỏng trả FFh.");return 0xFF}
  wr(r,v){const s=this.s;s.writes++;
    if(r===3){if(v&0x80){Object.assign(s,{cw:v,set:1,mA:(v>>5)&3,aIn:(v>>4)&1,cuIn:(v>>3)&1,mB:(v>>2)&1,bIn:(v>>1)&1,clIn:v&1,pa:0,pb:0,pc:0});
        if(s.mA||s.mB)this.b.note("ppimode","Từ điều khiển "+hx(v)+" chọn mode "+(s.mA>1?2:s.mA)+" (nhóm A) / mode "+s.mB+" (nhóm B): trình mô phỏng chưa có bắt tay của mode 1, 2; cổng chạy như mode 0.");
        if(!s.bIn)this.b.note("ppibout","Cổng B đặt là cổng RA nhưng đang nối 8 công tắc: hai bên cùng lái một dây (xung đột). Trên bo thật có thể hỏng chip; trình mô phỏng đọc PB ra chốt ra.");
        if(!s.cuIn)this.b.note("ppicuout","Nửa cao cổng C (PC7–PC4) đặt là cổng RA nhưng đang nối 4 nút K0–K3: khi nhấn nút, nút và chốt ra cùng lái một dây (xung đột). Chỉ an toàn khi không nhấn nút; nên chọn từ điều khiển có bit D3 = 1 (C cao là cổng vào), ví dụ 8Ah thay cho 82h.")}   // quyết định của chủ khóa 06/11/2026 (biên bản Bài 41–44)
      else{const bit=(v>>1)&7;if(v&1)s.pc|=1<<bit;else s.pc&=~(1<<bit)}   // BSR: lập/xóa một bit của PC
      this.b.gates();return}
    if(r===0){s.pa=v;if(this.b.paLog.length<256)this.b.paLog.push(v)}else if(r===1)s.pb=v;else s.pc=v;
    if((r===0&&s.aIn)||(r===1&&s.bIn))this.b.note("ppiin","Ghi vào cổng "+"AB"[r]+" khi cổng đang là cổng VÀO: byte nằm trong chốt ra nhưng không ra chân (đèn không đổi).");
    this.b.gates()}
  leds(){const s=this.s;return{pa:s.aIn?0:s.pa,pcl:s.clIn?0:s.pc&15}}
  desc(){const s=this.s;if(!s.set)return"";return`CW = ${hx(s.cw)} · A: ${s.aIn?"vào":"ra"} · B: ${s.bIn?"vào":"ra"} · C cao: ${s.cuIn?"vào":"ra"} · C thấp: ${s.clIn?"vào":"ra"} · mode ${s.mA>1?2:s.mA}/${s.mB}`}
}
/* ============ 8254 (bộ đếm 0–2). Đơn vị: một xung CLK = TICK chu kỳ CPU ============ */
function mkCtr(){return{mode:0,rw:3,bcd:0,cr:0,ce:0,ol:0,latched:0,stLatched:0,st:0,out:1,nul:1,pend:0,run:0,gate:1,trig:0,wlo:0,wflip:0,rflip:0,prog:0,ph:0,lowOne:0,edges:0,rise1:-1,rise0:-1,fall:-1}}
class PIT{
  constructor(b){this.b=b;this.reset()}
  reset(){this.c=[mkCtr(),mkCtr(),mkCtr()];this.wave=[[],[],[]]}
  setOut(i,v){const c=this.c[i];if(c.out===v)return;c.out=v;const t=this.b.now;c.edges++;
    if(v){c.rise0=c.rise1;c.rise1=t}else c.fall=t;
    const w=this.wave[i];w.push([t,v]);if(w.length>600)w.splice(0,200);
    this.b.outEdge(i,v)}
  wr(r,v){if(r===3){const sc=v>>6;
      if(sc===3){/* lệnh đọc lại (8254) */for(let i=0;i<3;i++)if(v&(2<<i)){const c=this.c[i];
          if(!(v&0x20)&&!c.latched){c.ol=this.val(c);c.latched=c.rw===3?2:1}
          if(!(v&0x10)&&!c.stLatched){c.st=(c.out<<7)|(c.nul<<6)|(c.rw<<4)|(c.mode<<1)|c.bcd;c.stLatched=1}}return}
      const c=this.c[sc],rw=(v>>4)&3;
      if(rw===0){if(!c.latched){c.ol=this.val(c);c.latched=c.rw===3?2:1}return}   // lệnh chốt bộ đếm
      let m=(v>>1)&7;if(m>5)m-=4;
      Object.assign(c,{mode:m,rw,bcd:v&1,nul:1,pend:0,run:0,trig:0,wflip:0,rflip:0,latched:0,stLatched:0,prog:1,lowOne:0});
      if(c.bcd)this.b.note("bcd","Bộ đếm "+sc+" đặt đếm BCD: trình mô phỏng đếm nhị phân (giá trị nạp vẫn đọc như số hệ 16).");
      this.setOut(sc,m===0?0:1);return}
    const c=this.c[r];if(!c.prog){this.b.note("pitnop","Ghi số đếm vào bộ đếm "+r+" khi chưa ghi từ điều khiển cho bộ đếm đó: trình mô phỏng dùng mode 0, đọc/ghi 2 byte.");c.prog=1}
    if(c.rw===1)this.load(r,v);else if(c.rw===2)this.load(r,v<<8);
    else if(!c.wflip){c.wlo=v;c.wflip=1;if(c.mode===0){c.run=0;this.setOut(r,0)}}else{c.wflip=0;this.load(r,c.wlo|(v<<8))}}
  load(r,n){const c=this.c[r];c.cr=n&0xFFFF;c.nul=1;
    if(c.mode===0){this.setOut(r,0);c.pend=1;c.run=0}
    else if(c.mode===1||c.mode===5){/* chờ cạnh lên của GATE */}
    else if(c.mode===4){c.pend=1;c.run=0}
    else if(!c.run)c.pend=1}            // mode 2, 3: đang đếm thì giá trị mới dùng ở lần nạp lại kế tiếp
  val(c){if(c.mode===3)return(c.ph*2)&0xFFFF;return c.ce&0xFFFF}
  rd(r){if(r===3){this.b.note("pitrd","8254 không cho đọc thanh ghi điều khiển (8Eh): đọc được FFh.");return 0xFF}
    const c=this.c[r];
    if(c.stLatched){c.stLatched=0;return c.st}
    let v;if(c.latched){v=c.ol}else v=this.val(c);
    let out;if(c.rw===1)out=v&255;else if(c.rw===2)out=v>>8;else{out=c.rflip?v>>8:v&255;c.rflip^=1}
    if(c.latched&&(c.rw!==3||!c.rflip))c.latched=0;
    return out&255}
  gate(i,g){const c=this.c[i];if(c.gate===g)return;c.gate=g;
    if(g){if(c.mode===1||c.mode===5){if(c.prog)c.trig=1}else if(c.mode===2||c.mode===3){if(c.prog&&c.run){c.run=0;c.pend=1}}}
    else if((c.mode===2||c.mode===3)&&c.prog)this.setOut(i,1)}
  tick(){for(let i=0;i<3;i++){const c=this.c[i];if(!c.prog)continue;const N=c.cr||0x10000;
    switch(c.mode){
      case 0:if(c.pend){c.ce=c.cr;c.pend=0;c.nul=0;c.run=1;break}
        if(c.run&&c.gate){c.ce=(c.ce-1)&0xFFFF;if(c.ce===0)this.setOut(i,1)}break;
      case 1:if(c.trig){c.trig=0;c.ce=c.cr;c.nul=0;c.run=1;this.setOut(i,0);break}
        if(c.run){c.ce=(c.ce-1)&0xFFFF;if(c.ce===0){this.setOut(i,1);c.run=0}}break;
      case 2:if(c.pend){c.ce=c.cr;c.pend=0;c.nul=0;c.run=1;this.setOut(i,1);break}
        if(c.run&&c.gate){if(c.out===0){c.ce=c.cr;c.nul=0;this.setOut(i,1)}else{c.ce=(c.ce-1)&0xFFFF;if(c.ce===1)this.setOut(i,0)}}break;
      case 3:if(c.pend){c.pend=0;c.nul=0;c.run=1;c.ph=(N+1)>>1;this.setOut(i,1);break}
        if(c.run&&c.gate){c.ph--;if(c.ph<=0){const nv=c.out?0:1;this.setOut(i,nv);c.nul=0;c.ph=nv?(N+1)>>1:N>>1}}break;
      case 4:case 5:if(c.lowOne){c.lowOne=0;this.setOut(i,1)}
        if(c.mode===4&&c.pend||c.mode===5&&c.trig){c.pend=0;c.trig=0;c.ce=c.cr;c.nul=0;c.run=1;break}
        if(c.run&&(c.gate||c.mode===5)){c.ce=(c.ce-1)&0xFFFF;if(c.ce===0){this.setOut(i,0);c.lowOne=1;c.run=0}}break}}}
  active(){return this.c.some(c=>c.run||c.pend||c.trig)}
  measure(i){const c=this.c[i];if(c.rise0<0||c.rise1<0)return null;const per=c.rise1-c.rise0;let hi=null;
    if(c.fall>c.rise0&&c.fall<c.rise1)hi=c.fall-c.rise0;
    return{period:per,high:hi,freq:CPU_HZ/per,duty:hi!=null?hi/per:null}}
  pulse(i){const c=this.c[i];return c.fall>=0&&c.rise1>c.fall?c.rise1-c.fall:null}   // độ rộng xung 0 gần nhất (mode 1, 4, 5)
  desc(i){const c=this.c[i];if(!c.prog)return"chưa lập trình";return`mode ${c.mode} · ${["chốt","LSB","MSB","LSB rồi MSB"][c.rw]} · nạp ${c.cr.toString(16).toUpperCase()}h (${c.cr||65536})`}
}
/* ============ 8259A (một chip, chế độ fully nested, ICW4 µPM = 1 cho 8086) ============ */
class PIC{
  constructor(b){this.b=b;this.reset()}
  reset(){this.s={st:"none",icw1:0,base:0,icw4:0,upm:0,aeoi:0,ltim:0,single:1,ic4:0,irr:0,isr:0,imr:0xFF,ris:0,poll:0,low:7,lines:0,acks:0,eois:0,initDone:0}}
  rd(a0){const s=this.s;
    if(s.poll){s.poll=0;const L=this.best();if(L<0)return 0;this.ack(L);return 0x80|L}
    if(a0)return s.imr;return s.ris?s.isr:s.irr}
  wr(a0,v){const s=this.s;
    if(!a0){
      if(v&0x10){Object.assign(s,{st:"icw2",icw1:v,ic4:v&1,single:(v>>1)&1,ltim:(v>>3)&1,imr:0,isr:0,irr:0,ris:0,poll:0,low:7,upm:0,aeoi:0,initDone:0});
        if(s.ltim)s.irr=s.lines;return}
      if(s.st!=="ready"&&s.st!=="none"){this.b.note("picseq","Ghi "+hx(v)+" vào 90h khi 8259A còn chờ "+s.st.toUpperCase()+" (phải ghi vào 92h): chuỗi khởi tạo sai thứ tự.")}
      if(v&0x08){if(v&4)s.poll=1;if(v&2)s.ris=v&1;return}   // OCW3
      const k=v>>5,L=v&7;                                    // OCW2
      if(k===1||k===5){const l=this.topIsr();if(l>=0){s.isr&=~(1<<l);s.eois++;if(k===5)s.low=l}else this.b.note("eoi0","Gửi EOI khi 8259A không có ngắt nào đang phục vụ (ISR = 0).")}
      else if(k===3||k===7){if(s.isr&(1<<L)){s.isr&=~(1<<L);s.eois++}if(k===7)s.low=L}
      else if(k===6)s.low=L;
      return}
    switch(s.st){
      case "icw2":s.base=v&0xF8;s.st=s.single?(s.ic4?"icw4":"ready"):"icw3";if(s.st==="ready")this.done();return;
      case "icw3":s.st=s.ic4?"icw4":"ready";if(s.st==="ready")this.done();return;
      case "icw4":s.icw4=v;s.upm=v&1;s.aeoi=(v>>1)&1;s.st="ready";this.done();return;
      default:s.imr=v;if(s.st==="none")this.b.note("picnoinit","Ghi IMR (92h) khi 8259A chưa được khởi tạo bằng ICW1–ICW4.")}}
  done(){const s=this.s;s.initDone=1;if(!s.upm)this.b.note("upm","ICW4 không có hoặc bit µPM = 0: 8259A ở chế độ 8080/8085 (gửi lệnh CALL), không hợp với 8086. Với 8086 phải đặt IC4 = 1 trong ICW1 và µPM = 1 trong ICW4.")}
  line(n,v){const s=this.s,m=1<<n,old=s.lines&m;if(v)s.lines|=m;else s.lines&=~m;
    if(s.ltim){if(v)s.irr|=m;else s.irr&=~m}else if(v&&!old)s.irr|=m}
  order(){const o=[];for(let k=1;k<=8;k++)o.push((this.s.low+k)&7);return o}
  topIsr(){const s=this.s;for(const l of this.order())if(s.isr&(1<<l))return l;return -1}
  best(){const s=this.s,req=s.irr&~s.imr;if(!req)return -1;
    for(const l of this.order()){if(s.isr&(1<<l))return -1;if(req&(1<<l))return l}return -1}
  int(){return this.s.st==="ready"&&this.best()>=0}
  ack(L){const s=this.s,m=1<<L;s.irr&=~m;if(s.ltim&&(s.lines&m))s.irr|=m;if(!s.aeoi)s.isr|=m;s.acks++;return(s.base+L)&255}
}
/* ============ 8251A (chế độ bất đồng bộ) ============ */
class USART{
  constructor(b){this.b=b;this.reset()}
  reset(){this.s={exp:"mode",mode:0,f:16,bits:8,pen:0,ep:0,stop:1,cmd:0,txen:0,rxe:0,sbrk:0,txBuf:-1,sh:-1,shBits:0,shN:0,shCnt:0,frame:[],
    rxSt:0,rxCnt:0,rxBits:0,rxN:0,rxData:0,rxRdy:0,pe:0,oe:0,fe:0,tx:1,txN:0,rxOk:0,modes:0}}
  stat(){const s=this.s;const txRdy=s.txBuf<0?1:0,empty=s.txBuf<0&&s.sh<0?1:0;
    return txRdy|(s.rxRdy<<1)|(empty<<2)|(s.pe<<3)|(s.oe<<4)|(s.fe<<5)}
  rd(cd){const s=this.s;if(cd)return this.stat();if(!s.rxRdy)this.b.note("rxempty","Đọc dữ liệu 98h khi RxRDY = 0: byte đọc được là byte cũ.");s.rxRdy=0;this.b.picLine(3,0);return s.rxData}
  wr(cd,v){const s=this.s;
    if(!cd){if(s.exp==="mode"){this.b.note("txnomode","Ghi dữ liệu vào 98h khi 8251A chưa nhận từ chế độ (mode): byte bị bỏ qua.");return}
      if(s.txBuf>=0)this.b.note("txovr","Ghi byte mới khi TxRDY = 0 (bộ đệm phát còn byte cũ): byte cũ bị ghi đè, mất một ký tự. Phải chờ bit TxRDY (bit 0 của 9Ah) bằng 1.");
      s.txBuf=v;return}
    if(s.exp==="sync"){if(--s.syncLeft<=0)s.exp="cmd";return}
    if(s.exp==="mode"){const bf=v&3;s.modes++;
      if(!bf){/* chế độ đồng bộ: theo sau là 1 hoặc 2 ký tự đồng bộ (SCS = D7), rồi mới tới từ lệnh */
        Object.assign(s,{mode:v,f:1,sync:1,exp:"sync",syncLeft:(v&0x80)?1:2});return}
      s.sync=0;s.f=[1,1,16,64][bf];
      Object.assign(s,{mode:v,bits:5+((v>>2)&3),pen:(v>>4)&1,ep:(v>>5)&1,stop:[1,1,1.5,2][v>>6],exp:"cmd"});
      if(!(v>>6))this.b.note("stop0","Từ chế độ "+hx(v)+" có 2 bit cao = 00 (số bit stop không hợp lệ): trình mô phỏng dùng 1 bit stop.");
      return}
    if(v&0x40){s.exp="mode";s.txen=0;s.rxe=0;s.cmd=v;s.txBuf=-1;s.sh=-1;s.rxSt=0;s.rxRdy=0;this.setTx();return}   // IR: reset trong, lần ghi kế tiếp là từ chế độ
    if(s.sync&&(v&5))this.b.note("sync","8251A đang ở chế độ ĐỒNG BỘ (từ chế độ có 2 bit thấp = 00): trình mô phỏng chỉ có bất đồng bộ, không phát/thu. Ghi 40h (reset trong) rồi từ chế độ bất đồng bộ.");
    s.cmd=v;s.txen=s.sync?0:v&1;const r=s.sync?0:(v>>2)&1;if(r&&!s.rxe)this.b.rxEnabled();s.rxe=r;s.sbrk=(v>>3)&1;
    if(v&0x10){s.pe=s.oe=s.fe=0}
    this.setTx()}
  setTx(){const s=this.s;const v=s.sbrk?0:s.sh>=0?s.frame[s.shN]:1;if(v!==s.tx){s.tx=v;this.b.txEdge(v)}}
  /* cạnh xuống của TxC/RxC (OUT2 của 8254) */
  clk(){const s=this.s;if(s.exp==="mode"&&!s.modes)return;
    /* phát */
    if(s.sh>=0){if(++s.shCnt>=s.shBits[s.shN]){s.shCnt=0;s.shN++;if(s.shN>=s.frame.length){s.sh=-1;s.txN++}this.setTx()}}
    if(s.sh<0&&s.txBuf>=0&&s.txen){const d=s.txBuf;s.txBuf=-1;s.sh=d;const fr=[0],len=[s.f];let ones=0;
      for(let k=0;k<s.bits;k++){const b=(d>>k)&1;ones+=b;fr.push(b);len.push(s.f)}
      if(s.pen){fr.push(s.ep?ones&1:(ones&1)^1);len.push(s.f)}
      fr.push(1);len.push(Math.round(s.f*s.stop));s.frame=fr;s.shBits=len;s.shN=0;s.shCnt=0;this.setTx()}
    /* thu: lấy mẫu RxD (đường phát của terminal) */
    if(!s.rxe)return;const line=this.b.termLine();
    if(s.rxSt===0){if(!line){s.rxSt=1;s.rxCnt=0}return}
    if(s.rxSt===1){if(++s.rxCnt>=Math.max(1,s.f>>1)){if(line){s.rxSt=0;return}s.rxSt=2;s.rxCnt=0;s.rxN=0;s.rxBits=0}return}
    if(s.rxSt===2){if(++s.rxCnt<s.f)return;s.rxCnt=0;const nd=s.bits+(s.pen?1:0);
      if(s.rxN<s.bits)s.rxBits|=line<<s.rxN;
      else if(s.rxN<nd){let ones=0;for(let k=0;k<s.bits;k++)ones+=(s.rxBits>>k)&1;const want=s.ep?ones&1:(ones&1)^1;if(line!==want)s.pe=1}
      else{if(!line)s.fe=1;if(s.rxRdy)s.oe=1;s.rxData=s.rxBits&((1<<s.bits)-1);s.rxRdy=1;s.rxOk++;this.b.picLine(3,1);s.rxSt=line?0:3;return}
      s.rxN++;return}
    if(s.rxSt===3&&line)s.rxSt=0}
  desc(){const s=this.s;if(s.exp==="mode"&&!s.modes)return"chưa nhận từ chế độ";
    return`×${s.f} · ${s.bits} bit · ${s.pen?(s.ep?"parity chẵn":"parity lẻ"):"không parity"} · ${s.stop} stop · ${s.txen?"TxEN":"phát tắt"} · ${s.rxe?"RxE":"thu tắt"}${s.exp==="mode"?" · chờ từ chế độ":""}`}
}
/* ============ terminal (máy tính đầu kia), 8N1 mặc định ============ */
function mkTerm(cfg){cfg=cfg||{};return{baud:cfg.baud||9600,bits:cfg.bits||8,par:(cfg.parity||"N").toUpperCase(),stop:cfg.stop||1,send:String(cfg.send||""),t0:-1,
  rx:"",fe:0,pe:0,dec:{st:0,ts:0,ptr:0}}}
/* ============ bo I/O ============ */
class Board{
  constructor(M,cfg){cfg=cfg||{};this.M=M;this.cfg=cfg;this.now=0;this.touched=false;this.notes=[];this.noteKeys=new Set();
    this.ext={sw:(cfg.sw||0)&255,btn:(cfg.btn||0)&15};this.irq1=(cfg.irq1||[]).slice().sort((a,b)=>a-b);this.irqN=0;this.btnIR=0;
    this.ppi=new PPI(this);this.pit=new PIT(this);this.pic=new PIC(this);this.us=new USART(this);this.term=mkTerm(cfg.term);this.txLog=[[0,1]];this.paLog=[];
    this.ints=[];this.hwN=0;this.idle=0;this.gates()}
  note(k,vi){if(this.noteKeys.has(k))return;this.noteKeys.add(k);this.notes.push({k,vi,t:this.now})}
  dec(p){p&=0xFFFF;if((p&0xFF00)||p<0x80||p>0x9F)return null;if(p&1)return{chip:"odd"};const chip=(p>>3)&3,r=(p>>1)&3;return{chip,r}}
  inp(p){const d=this.dec(p);if(!d)return 0xFF;this.touched=true;
    if(d.chip==="odd"){this.note("odd","IN ở cổng lẻ "+X86.hex4(p)+"h: các chip của bo nối D0–D7 nên chỉ có địa chỉ chẵn; byte lẻ đi trên D8–D15, không ai trả lời → FFh.");return 0xFF}
    return[()=>this.ppi.rd(d.r),()=>this.pit.rd(d.r),()=>this.pic.rd(d.r&1),()=>this.us.rd(d.r&1)][d.chip]()}
  outp(p,v){const d=this.dec(p);if(!d)return;this.touched=true;
    if(d.chip==="odd"){this.note("odd","OUT ra cổng lẻ "+X86.hex4(p)+"h: chip của bo chỉ có địa chỉ chẵn (nối D0–D7), byte này đi trên D8–D15 nên bị mất. Bo dùng 80h, 82h, 84h, 86h… (không phải 80h, 81h, 82h, 83h như trên PC 8088).");return}
    [()=>this.ppi.wr(d.r,v),()=>this.pit.wr(d.r,v),()=>this.pic.wr(d.r&1,v),()=>this.us.wr(d.r&1,v)][d.chip]()}
  gates(){const s=this.ppi.s;this.pit.gate(1,s.clIn?1:s.pc&1)}
  outEdge(i,v){if(i===0)this.pic.line(0,v);else if(i===2&&!v)this.us.clk()}
  picLine(n,v){this.pic.line(n,v)}
  txEdge(v){this.txLog.push([this.now,v])}
  rxEnabled(){const T=this.term;if(T.t0<0)T.t0=this.now+Math.round(this.tbit()*2)}
  tbit(){return CPU_HZ/this.term.baud}
  frameBits(){const T=this.term;return 1+T.bits+(T.par==="N"?0:1)+T.stop}
  termLine(){/* mức RxD lúc này: terminal phát lần lượt các ký tự của cfg.term.send, mỗi khung cách nhau 2 bit nghỉ */
    const T=this.term;if(T.t0<0||!T.send)return 1;const tb=this.tbit(),fb=this.frameBits(),per=fb+2;
    const x=(this.now-T.t0)/tb;if(x<0)return 1;const k=Math.floor(x/per);if(k>=T.send.length)return 1;const j=Math.floor(x-k*per);if(j>=fb)return 1;
    if(j===0)return 0;const ch=T.send.charCodeAt(k)&255;if(j<=T.bits)return(ch>>(j-1))&1;
    if(T.par!=="N"&&j===T.bits+1){let o=0;for(let q=0;q<T.bits;q++)o+=(ch>>q)&1;return T.par==="E"?o&1:(o&1)^1}return 1}
  txAt(t){const L=this.txLog;let v=1;for(let i=0;i<L.length&&L[i][0]<=t;i++)v=L[i][1];return v}
  termDecode(){/* terminal lấy mẫu TxD ở giữa mỗi bit theo baud của terminal */
    const T=this.term,D=T.dec,L=this.txLog,tb=this.tbit(),fb=this.frameBits();
    for(;;){if(D.st===0){let i=D.ptr;while(i<L.length&&!(L[i][1]===0&&L[i][0]>=D.ts))i++;if(i>=L.length)return;
        const ts=L[i][0];if(ts+(fb-0.5)*tb>this.now){D.ptr=i;return}
        let ch=0,ones=0;for(let k=0;k<T.bits;k++){const b=this.txAt(ts+(k+1.5)*tb);ch|=b<<k;ones+=b}
        if(T.par!=="N"){const p=this.txAt(ts+(T.bits+1.5)*tb);if(p!==(T.par==="E"?ones&1:(ones&1)^1))T.pe++}
        const ts2=ts+(1+T.bits+(T.par==="N"?0:1)+0.5)*tb,stop=this.txAt(ts2);if(!stop)T.fe++;
        T.rx+=String.fromCharCode(ch);D.ts=ts2;D.ptr=i+1;if(!stop){D.st=1}}
      if(D.st===1){let i=D.ptr;while(i<L.length&&!(L[i][1]===1&&L[i][0]>=D.ts))i++;if(i>=L.length)return;D.ts=L[i][0];D.ptr=i;D.st=0}}}
  advance(cyc){if(cyc<=0)return;if(!this.touched&&!this.irq1.length){this.now+=cyc;return}const end=this.now+cyc;let next=Math.floor(this.now/TICK)*TICK+TICK;
    while(next<=end){this.now=next;this.extEvents();this.pit.tick();next+=TICK}
    this.now=end;this.extEvents();if(this.txLog.length>1)this.termDecode()}
  extEvents(){if(this.btnIR&&this.now>=this.btnIR){this.btnIR=0;this.pic.line(1,0)}
    while(this.irqN<this.irq1.length&&this.irq1[this.irqN]<=this.now){this.irqN++;this.pressIR1()}}
  pressIR1(){this.pic.line(1,1);this.btnIR=this.now+2000}    // nút ngắt: mức 1 trong 2000 chu kỳ (0,4 ms, giả định)
  active(){return this.pit.active()||this.us.s.sh>=0||this.irqN<this.irq1.length||this.btnIR>0}
  canWake(){return this.pic.s.st==="ready"&&this.active()}
  /* ---------- lưu / khôi phục (Lùi bước) ---------- */
  save(){if(!this.touched)return{fresh:1,now:this.now,irqN:this.irqN,btnIR:this.btnIR};return{now:this.now,irqN:this.irqN,btnIR:this.btnIR,ppi:{...this.ppi.s},pit:this.pit.c.map(c=>({...c})),pic:{...this.pic.s},
    us:{...this.us.s,frame:this.us.s.frame,shBits:this.us.s.shBits},term:{...this.term,dec:{...this.term.dec}},txN:this.txLog.length,paN:this.paLog.length,ints:this.ints.length,hwN:this.hwN,idle:this.idle,touched:this.touched}}
  load(z){if(z.fresh){const n=this.now;this.ppi.reset();this.pit.reset();this.pic.reset();this.us.reset();this.term=mkTerm(this.cfg.term);this.txLog=[[0,1]];this.paLog=[];this.ints=[];this.hwN=0;this.idle=0;this.notes=[];this.noteKeys=new Set();
      this.now=z.now;this.irqN=z.irqN;this.btnIR=z.btnIR;this.touched=false;this.gates();return}
    this.now=z.now;this.irqN=z.irqN;this.btnIR=z.btnIR;this.ppi.s=z.ppi;this.pit.c=z.pit.map(c=>({...c}));this.pic.s={...z.pic};this.us.s={...z.us};
    this.term={...z.term,dec:{...z.term.dec}};this.txLog.length=Math.min(this.txLog.length,z.txN);this.paLog.length=Math.min(this.paLog.length,z.paN);this.ints.length=Math.min(this.ints.length,z.ints);this.hwN=z.hwN;this.idle=z.idle;this.touched=z.touched}
  /* ---------- kết quả để chấm ---------- */
  state(){const p=this.ppi.pins(),l=this.ppi.leds();
    return{pa:l.pa,pcl:l.pcl,ppiCw:this.ppi.s.cw,pc:p.pc,pit:this.pit.c.map((c,i)=>({mode:c.mode,count:c.cr,prog:c.prog,out:c.out,m:this.pit.measure(i)})),
      pic:{...this.pic.s},ints:this.ints.slice(),usart:{...this.us.s,stat:this.us.stat()},term:this.term.rx,termFe:this.term.fe,termPe:this.term.pe,notes:this.notes.map(n=>n.k)}}
}
IO.Board=Board;
/* ============ máy DOS có gắn bo ============ */
const Base=X86.Machine;
class IOMachine extends Base{
  constructor(prog,opt){super(prog,opt);const cfg=IO.queue.length?IO.queue.shift():IO.live;this.io=new Board(this,cfg||{});
    const c=this.cpu,b=this.io,ip=c.inp.bind(c),op=c.outp.bind(c);
    c.inp=p=>{const d=b.dec(p);return d?b.inp(p):ip(p)};
    c.outp=(p,v)=>{op(p,v);b.outp(p,v)}}
  step(){
    if(this.done)return super.step();
    const c=this.cpu,b=this.io;
    /* ngắt phần cứng ở ranh giới lệnh */
    if(c.halted||((c.f&IF)&&b.pic.int())){const r=this.hwStep();if(r)return r}
    const z=b.save(),n0=this.hist.length,t0=c.total;
    const r=super.step();
    if(r.s==="wait")return r;
    if(z&&this.hist.length>n0)this.hist[this.hist.length-1].io=z;
    b.advance(c.total-t0);
    if(r.s==="halt"&&this.halted&&b.canWake()&&(c.f&IF)){/* HLT: chờ ngắt */this.done=false;this.halted=false;c.halted=true;return{s:"ok"}}
    return r}
  hwStep(){const c=this.cpu,b=this.io;
    const rec={r:c.r.slice(),sg:c.s.slice(),ip:c.ip,f:c.f,out:this.out.length,inPos:this.inPos,total:c.total,steps:c.steps,halted:c.halted,ulog:[],reads:this.reads||0,stopBp:this.stopBp,io:b.save(),hw:1};
    if(c.halted){/* CPU đứng ở HLT: cho thời gian trôi tới khi 8259A yêu cầu ngắt */
      let w=0;while(!((c.f&IF)&&b.pic.int())){if(w>=IO.HLT_MAX||!b.canWake()){this.done=true;this.halted=true;return{s:"halt"}}
        const d=Math.min(2*TICK,IO.HLT_MAX-w);b.advance(d);w+=d}
      c.total+=w;b.idle+=w;c.halted=false}
    if(!((c.f&IF)&&b.pic.int())){this.hist.push(rec);this.last=null;return{s:"ok"}}
    c.ulog=rec.ulog;c.acc=this.trace?[]:null;
    const L=b.pic.best();
    if(!b.pic.s.upm){this.hist.push(rec);this.crash={vi:"8259A yêu cầu ngắt (IR"+L+") nhưng đang ở chế độ 8080/8085 (thiếu ICW4 hoặc bit µPM = 0): nó gửi mã lệnh CALL thay cho số hiệu vectơ, 8086 không dùng được. Sửa: ICW1 có IC4 = 1 (ví dụ 13h), ICW4 = 01h."};this.done=true;
      this.last={cs:c.cs,ip:c.ip,phys:c.pa(c.cs,c.ip),bytes:[],cyc:0,line:0,ea:null,acc:[],jumped:false,intNo:-1,hw:1};return{s:"crash"}}
    const n=b.pic.ack(L),ph=c.pa(c.cs,c.ip),cs0=c.cs,ip0=c.ip;
    c.interrupt(n,c.ip);c.total+=IO.INTR_CYC;c.cyc=IO.INTR_CYC;b.hwN++;b.ints.push({t:b.now,ir:L,v:n});
    this.hist.push(rec);b.advance(IO.INTR_CYC);
    this.last={cs:cs0,ip:ip0,phys:ph,bytes:[],cyc:IO.INTR_CYC,cycR:null,line:0,ea:null,acc:c.acc||[],jumped:true,intNo:n,hw:1,ir:L};
    return{s:"ok",hw:1}}
  back(){const rec=this.hist[this.hist.length-1];if(!rec)return false;
    if(rec.hw){this.hist.pop();this.undo(rec);this.io.load(rec.io);this.last=null;return true}
    const ok=super.back();if(ok&&rec.io)this.io.load(rec.io);return ok}
  /* sau khi chương trình kết thúc, phần cứng vẫn chạy: cho bo chạy thêm (để đo dạng sóng, chờ ký tự phát xong) */
  settle(cyc){const b=this.io;b.advance(cyc||0)}
}
X86.Machine=IOMachine;
/* ============ chấm thêm trạng thái thiết bị: test.io = {sw, btn, irq1:[chu kỳ], term:{baud, send}, run, want:{…}} ============ */
IO.check=function(M,io){const w=io.want||{},b=M.io,S=b.state(),why=[];
  if(w.pa!=null&&S.pa!==w.pa)why.push(`8 LED ở cổng A = ${hx(S.pa)}, cần ${hx(w.pa)}.`);
  if(w.pcl!=null&&S.pcl!==w.pcl)why.push(`4 LED ở PC3–PC0 = ${X86.hex2(S.pcl).slice(1)}h, cần ${X86.hex2(w.pcl).slice(1)}h.`);
  if(w.ppiCw!=null&&b.ppi.s.cw!==w.ppiCw)why.push(`Từ điều khiển 8255A = ${hx(b.ppi.s.cw)}, cần ${hx(w.ppiCw)}.`);
  if(w.pit)for(const k in w.pit){const q=w.pit[k],c=S.pit[k];
    if(q.mode!=null&&(!c.prog||c.mode!==q.mode))why.push(`Bộ đếm ${k} của 8254 đang ở ${c.prog?"mode "+c.mode:"trạng thái chưa lập trình"}, cần mode ${q.mode}.`);
    if(q.count!=null&&c.count!==q.count)why.push(`Bộ đếm ${k}: số nạp = ${c.count}, cần ${q.count}.`);
    if(q.period!=null){const m=c.m;if(!m)why.push(`OUT${k} chưa tạo xung lặp lại (chưa có hai cạnh lên).`);else if(Math.abs(m.period-q.period)>(q.tol||0))why.push(`Chu kỳ OUT${k} = ${m.period} chu kỳ CPU (${(m.freq).toFixed(1)} Hz), cần ${q.period} (${(CPU_HZ/q.period).toFixed(1)} Hz).`)}
    if(q.none&&c.m)why.push(`OUT${k} đang tạo xung lặp lại (chu kỳ ${c.m.period}), đề bài không cho phép.`);
    if(q.low!=null){const pw=b.pit.pulse(k);if(pw!==q.low)why.push(`Xung 0 ở OUT${k} dài ${pw==null?"(chưa có)":pw} chu kỳ CPU, cần ${q.low}.`)}
    if(q.high!=null){const m=c.m;if(m&&m.high!==q.high)why.push(`OUT${k} ở mức 1 trong ${m.high} chu kỳ CPU mỗi chu kỳ xung, cần ${q.high}.`)}}
  if(w.paSeq&&b.paLog.join()!==w.paSeq.join())why.push(`Dãy byte đã ghi ra cổng A: ${b.paLog.map(hx).join(" ")||"(không có)"}; cần ${w.paSeq.map(hx).join(" ")}.`);
  if(w.min)for(const k in w.min){const sy=M.prog.syms[k.toUpperCase()];if(!sy){why.push(`Không thấy biến ${k} (giữ nguyên tên biến của đề bài).`);continue}const v=M.mem[sy.phys]|(sy.type===2?M.mem[sy.phys+1]<<8:0);if(v<w.min[k])why.push(`Biến ${k} = ${v}, cần ít nhất ${w.min[k]}.`)}
  if(w.irs&&S.ints.map(x=>x.ir).join()!==w.irs.join())why.push(`Thứ tự ngắt được phục vụ: ${S.ints.map(x=>"IR"+x.ir).join(", ")||"(không có)"}; cần ${w.irs.map(x=>"IR"+x).join(", ")}.`);
  if(w.stat!=null&&S.usart.stat!==w.stat)why.push(`Trạng thái 8251A = ${hx(S.usart.stat)}, cần ${hx(w.stat)}.`);
  if(w.imr!=null&&S.pic.imr!==w.imr)why.push(`IMR của 8259A = ${hx(S.pic.imr)}, cần ${hx(w.imr)}.`);
  if(w.base!=null&&S.pic.base!==w.base)why.push(`Vectơ gốc (ICW2) = ${hx(S.pic.base)}, cần ${hx(w.base)}.`);
  if(w.isr!=null&&S.pic.isr!==w.isr)why.push(`ISR của 8259A khi kết thúc = ${hx(S.pic.isr)}, cần ${hx(w.isr)} (quên gửi EOI?).`);
  if(w.ints!=null&&S.ints.length!==w.ints)why.push(`CPU nhận ${S.ints.length} ngắt phần cứng, cần ${w.ints}.`);
  if(w.term!=null&&S.term!==w.term)why.push(`Terminal nhận được “${S.term.replace(/[^\x20-\x7e]/g,"·")}”, cần “${w.term}”.`);
  if(w.mode!=null&&S.usart.mode!==w.mode)why.push(`Từ chế độ 8251A = ${hx(S.usart.mode)}, cần ${hx(w.mode)}.`);
  if(w.noNotes)for(const k of w.noNotes)if(S.notes.includes(k)){const n=b.notes.find(x=>x.k===k);why.push(n.vi)}
  return why};
const G0=X86.grade;
X86.grade=function(ex,src,opt){const tests=ex.tests||[],made=[],keep=IO.queue,live=IO.live;
  IO.queue=tests.map(t=>t.io||{});
  IO._made=made;let g;try{g=G0(ex,src,opt)}finally{IO.queue=keep;IO.live=live;IO._made=null}
  if(!g.R||!g.R.length)return g;
  tests.forEach((t,i)=>{const M=made[i],R=g.R[i];if(!M||!R)return;
    if(t.io){M.settle(t.io.run!=null?t.io.run:20000);if(t.io.want){const why=IO.check(M,t.io);if(why.length){R.ok=false;R.why.push(...why)}}}
    R.io=M.io.state()});
  const okAll=g.R.every(x=>x.ok);g.pass=g.R.filter(x=>x.ok).length;g.ok=okAll&&g.perfOk;return g};
/* ghi lại máy được tạo trong lúc chấm (để đọc trạng thái thiết bị sau khi chạy) */
const Wrapped=IOMachine;
X86.Machine=class extends Wrapped{constructor(p,o){super(p,o);if(IO._made)IO._made.push(this)}};
IO.Machine=X86.Machine;
if(typeof module!=="undefined"&&module.exports)module.exports=X86;
})(typeof window!=="undefined"?window:globalThis);
/* ===================== trình mô phỏng của khóa (platform/js/59-x86-io-ui.js) ===================== */
/* ===================== Trình mô phỏng 8086 · phần 6: giao diện bo I/O (8255A, 8254, 8259A, 8251A) =====================
   Chỉ tải trên trang khóa mpu8086. Máy thiết bị ở 59-x86-io.js (không dùng DOM); phần này chỉ ĐỌC trạng thái máy để vẽ và
   chuyển thao tác của học viên (công tắc, nút, dữ liệu terminal) vào cấu hình bo. Không sửa 58-x86-ui.js: thêm một phần
   "Bo I/O" vào ĐẦU khung cuộn của trình mô phỏng (thứ tự xếp dọc như quy tắc: Thiết bị → Thanh ghi → … → Màn hình).
     makeX86IO(sim, {show:["ppi","pit","pic","usart"], presets:[io của từng ví dụ], ex: phần tử bài tập})
   io = {sw, btn, irq1:[chu kỳ], term:{baud, send}} như test.io của bài tập. Tài liệu: docs/TRINH-MO-PHONG-8086-IO.md. */
(function(G){
"use strict";
const X86=G.X86,IO=X86.IO,doc=G.document;
const h2=X86.hex2,esc=s=>String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
const bits=(v,n,cls,lab)=>Array.from({length:n},(_,k)=>{const b=n-1-k,on=(v>>b)&1;return`<span class="${cls}${on?" on":""}" title="${lab}${b}: ${on}"><i>${lab}${b}</i><b>${on}</b></span>`}).join("");
function wave(b,i,W){/* dạng sóng OUTi trong W chu kỳ CPU gần nhất, vẽ bằng SVG (không đổi kích thước khung) */
  const now=b.now,t0=Math.max(0,now-W),w=b.pit.wave[i].filter(e=>e[0]<=now);let lv=b.pit.c[i].out;
  for(let k=w.length-1;k>=0;k--)if(w[k][0]<=t0){lv=w[k][1];break}else lv=w[k][1]?0:1;
  const X=t=>((t-t0)/W*300).toFixed(1),Y=v=>v?3:17;let d=`M0 ${Y(lv)}`;
  for(const [t,v] of w)if(t>t0){d+=` H${X(t)} V${Y(v)}`}
  d+=` H300`;return`<svg class="xio-wv" viewBox="0 0 300 20" preserveAspectRatio="none" aria-hidden="true"><path d="${d}"/></svg>`}
G.makeX86IO=function(sim,cfg){cfg=cfg||{};const root=sim.el,show=new Set(cfg.show||["ppi","pit","pic","usart"]),pres=cfg.presets||[];
  const nav=root.querySelector(".st-nav"),sc=root.querySelector(".st-scroll");if(!nav||!sc)return null;
  const st={sw:0,btn:0,term:{baud:9600,send:""},irq1:[]};
  function use(io){io=io||{};st.sw=(io.sw||0)&255;st.btn=(io.btn||0)&15;st.irq1=(io.irq1||[]).slice();st.term={baud:(io.term&&io.term.baud)||9600,send:(io.term&&io.term.send)||""};paintIn()}
  const cfgNow=()=>({sw:st.sw,btn:st.btn,irq1:st.irq1.slice(),term:{baud:st.term.baud,send:st.term.send}});
  /* thanh tên phần + khung */
  const nb=doc.createElement("button");nb.type="button";nb.dataset.go="io";nb.textContent="Bo I/O";nav.insertBefore(nb,nav.firstChild);
  const sec=doc.createElement("section");sec.className="pn xio";sec.dataset.sec="io";sc.insertBefore(sec,sc.firstChild);
  nb.onclick=()=>{const R=sc.getBoundingClientRect(),E=sec.getBoundingClientRect();sc.scrollTo?sc.scrollTo({top:sc.scrollTop+E.top-R.top}):sc.scrollTop+=E.top-R.top};
  const sp=root.querySelector(".sim-scope>div");
  if(sp){const p=doc.createElement("p");p.innerHTML="<b>Bo I/O (chương 11):</b> 8255A ở 80h–86h (PA → 8 LED, PB ← 8 công tắc, PC7–PC4 ← nút K0–K3, PC3–PC0 → 4 LED), 8254 ở 88h–8Eh (CLK = 2,5 MHz, OUT0 → IR0, OUT2 → TxC/RxC), 8259A ở 90h/92h (IR1 ← nút ngắt), 8251A ở 98h/9Ah nối terminal. Chỉ địa chỉ chẵn; cổng khác vẫn đọc FFh. Ngắt phần cứng được nhận giữa hai lệnh khi IF = 1 (61 chu kỳ, giả định); HLT chờ tới ngắt kế tiếp. Thiết bị tiến theo từng lệnh, chế độ 1, 2 của 8255A và truyền đồng bộ của 8251A chưa có. Mọi địa chỉ, tần số là giả định của bo thí nghiệm này.";sp.appendChild(p)}
  sec.innerHTML=`<div class="pane-h"><span>Bo I/O</span></div>
   <p class="xio-d xio-t"></p>
   ${show.has("ppi")?`<div class="xio-dev"><div class="xio-row"><span class="xio-l">LED cổng A</span><span class="xio-leds xio-pa"></span></div>
    <div class="xio-row"><span class="xio-l">LED PC3–PC0</span><span class="xio-leds xio-pcl"></span></div>
    <div class="xio-row"><span class="xio-l">Công tắc → PB</span><span class="xio-sw"></span></div>
    <div class="xio-row"><span class="xio-l">Nút K3–K0 → PC7–PC4</span><span class="xio-btn"></span></div>
    <p class="xio-d xio-ppi"></p></div>`:""}
   ${show.has("pit")?`<div class="xio-blk"><div class="xio-h">8254 · CLK 2,5 MHz (giả định)</div><div class="xio-pit"></div></div>`:""}
   ${show.has("pic")?`<div class="xio-blk"><div class="xio-h">8259A <button type="button" class="btn xio-ir1">Nhấn nút ngắt (IR1)</button></div><div class="xio-pic"></div></div>`:""}
   ${show.has("usart")?`<div class="xio-blk"><div class="xio-h">8251A và terminal</div><div class="xio-us"></div>
    <div class="xio-term"><label><span>Terminal gửi (khi 8251A bật thu)</span><input class="xio-send" autocomplete="off" spellcheck="false" maxlength="40"></label>
     <label><span>Baud của terminal</span><select class="xio-baud">${[1200,2400,4800,9600,19200].map(b=>`<option value="${b}">${b}</option>`).join("")}</select></label></div>
    <div class="xio-h2">Terminal nhận được</div><pre class="xio-rx"></pre></div>`:""}
   <ul class="xio-notes"></ul>`;
  const $=s=>sec.querySelector(s);
  function paintIn(){if(show.has("ppi")){
      $(".xio-sw").innerHTML=Array.from({length:8},(_,k)=>{const b=7-k,on=(st.sw>>b)&1;return`<button type="button" class="xio-k${on?" on":""}" data-sw="${b}" aria-pressed="${!!on}" title="Công tắc PB${b}"><i>PB${b}</i><b>${on?"BẬT":"tắt"}</b></button>`}).join("");
      $(".xio-btn").innerHTML=Array.from({length:4},(_,k)=>{const b=3-k,on=(st.btn>>b)&1;return`<button type="button" class="xio-k${on?" on":""}" data-bt="${b}" aria-pressed="${!!on}" title="Nút K${b} (PC${b+4})"><i>K${b}</i><b>${on?"nhấn":"thả"}</b></button>`}).join("")}
    if(show.has("usart")){$(".xio-send").value=st.term.send;$(".xio-baud").value=String(st.term.baud)}}
  sec.addEventListener("click",e=>{const k=e.target.closest("[data-sw],[data-bt]");const M=sim.machine;
    if(k){if(k.dataset.sw!=null)st.sw^=1<<+k.dataset.sw;else st.btn^=1<<+k.dataset.bt;paintIn();if(M&&M.io){M.io.ext.sw=st.sw;M.io.ext.btn=st.btn}draw(true);return}
    if(e.target.closest(".xio-ir1")){if(M&&M.io&&!M.done){M.io.pressIR1();draw(true)}else{const n=$(".xio-notes");n.innerHTML=`<li>Nút ngắt chỉ có tác dụng khi chương trình đang chạy (Từng bước hoặc Tạm dừng).</li>`}}});
  if(show.has("usart")){$(".xio-send").addEventListener("input",e=>{st.term.send=e.target.value});$(".xio-baud").addEventListener("change",e=>{st.term.baud=+e.target.value})}
  /* cấu hình bo cho máy sắp tạo: đặt ngay trước khi trình mô phỏng (hoặc bài tập) dịch và chạy */
  const arm=()=>{IO.live=cfgNow()};
  root.addEventListener("click",arm,true);root.addEventListener("keydown",arm,true);
  if(cfg.ex){cfg.ex.addEventListener("click",e=>{const b=e.target.closest('[data-act="try"],[data-act="load"]');if(!b||!cfg.exList)return;
    const k=cfg.exCur?cfg.exCur():0,t=(cfg.exList[k]&&cfg.exList[k].tests||[])[0];if(t)use(t.io);arm()},true)}
  const pre=root.querySelector(".s-pre");if(pre)pre.addEventListener("change",()=>{use(pres[+pre.value]);draw(true)});
  use(pres[0]);
  /* vẽ */
  let key="",M0=null,last=0;
  function draw(force){const M=sim.machine,b=M&&M.io;
    if(!b){if(M0!==null||force){M0=null;key="";paint(null)}return}
    const k=[M.cpu.total,M.hist.length,b.now,M.done?1:0,b.notes.length].join();if(!force&&k===key&&M===M0)return;
    M0=M;if(M.done&&!M._ioSettled){M._ioSettled=1;if(b.active())M.settle(20000)}   // chương trình đã kết thúc: phần cứng vẫn chạy thêm 4 ms
    key=k;paint(b,M)}
  function paint(b,M){
    $(".xio-t").textContent=b?`Thời gian trên bo: ${(b.now/IO.CPU_HZ*1000).toLocaleString("vi-VN",{maximumFractionDigits:3})} ms (${b.now.toLocaleString("vi-VN")} chu kỳ CPU)`:"Bo chưa chạy: bấm Từng bước hoặc Chạy.";
    if(show.has("ppi")){const l=b?b.ppi.leds():{pa:0,pcl:0};$(".xio-pa").innerHTML=bits(l.pa,8,"xio-led","PA");$(".xio-pcl").innerHTML=bits(l.pcl,4,"xio-led r","PC");
      $(".xio-ppi").textContent=b?(b.ppi.desc()||"8255A: chưa ghi từ điều khiển (sau RESET: mọi cổng là cổng vào)"):"8255A: sau RESET mọi cổng là cổng vào; LED tắt."}
    if(show.has("pit")){const W=(()=>{if(!b)return 20000;let m=0;for(let i=0;i<3;i++){const q=b.pit.measure(i);if(q)m=Math.max(m,q.period)}return Math.min(400000,Math.max(4000,m*3))})();
      $(".xio-pit").innerHTML=`<table class="xio-tb"><thead><tr><th scope="col">Bộ đếm</th><th scope="col">Cấu hình</th><th scope="col">Đếm</th><th scope="col">OUT</th></tr></thead><tbody>${[0,1,2].map(i=>{
        const c=b?b.pit.c[i]:null,q=b?b.pit.measure(i):null;
        return`<tr><td>${i}<small>${["→ IR0","GATE = PC0","→ TxC/RxC"][i]}</small></td><td>${b?esc(b.pit.desc(i)):"chưa lập trình"}</td><td>${c&&c.prog?b.pit.val(c):"–"}</td><td>${c?c.out:1}</td></tr>
        <tr class="xio-wr"><td colspan="4">${b?wave(b,i,W):""}<small>${q?`chu kỳ ${q.period} ck = ${(q.period/IO.CPU_HZ*1e6).toLocaleString("vi-VN",{maximumFractionDigits:1})} µs · ${q.freq.toLocaleString("vi-VN",{maximumFractionDigits:1})} Hz${q.duty!=null?` · mức 1: ${Math.round(q.duty*100)}%`:""}`:"chưa có xung lặp lại"}</small></td></tr>`}).join("")}</tbody></table><p class="xio-d">Dạng sóng: ${(W/IO.CPU_HZ*1000).toLocaleString("vi-VN",{maximumFractionDigits:2})} ms gần nhất (ck = chu kỳ CPU 0,2 µs).</p>`}
    if(show.has("pic")){const s=b?b.pic.s:null;
      $(".xio-pic").innerHTML=s?`<div class="xio-bits"><span class="xio-bl">IRR</span>${bits(s.irr,8,"xio-bit","IR")}</div><div class="xio-bits"><span class="xio-bl">ISR</span>${bits(s.isr,8,"xio-bit","IR")}</div><div class="xio-bits"><span class="xio-bl">IMR</span>${bits(s.imr,8,"xio-bit","IR")}</div>
        <p class="xio-d">${s.st==="ready"?`Đã khởi tạo · vectơ gốc ${h2(s.base)}h (IR0 → INT ${h2(s.base)}h) · ${s.aeoi?"tự EOI":"cần EOI"} · ${s.ltim?"kích theo mức":"kích theo cạnh"}`:s.st==="none"?"Chưa khởi tạo (chưa có ICW1).":"Đang khởi tạo, chờ "+s.st.toUpperCase()+" ở 92h."} · CPU đã nhận ${b.ints.length} ngắt phần cứng${b.ints.length?` (gần nhất IR${b.ints[b.ints.length-1].ir} → INT ${h2(b.ints[b.ints.length-1].v)}h)`:""}${b.idle?` · HLT chờ ${b.idle} ck`:""}. IF = ${M.cpu.f&512?1:0}.</p>`:`<p class="xio-d">8259A chưa khởi tạo. IR0 ← OUT0 của 8254, IR1 ← nút ngắt.</p>`}
    if(show.has("usart")){const u=b?b.us:null,s=u?u.s:null;
      $(".xio-us").innerHTML=u?`<p class="xio-d">${esc(u.desc())}${s.modes?` · từ chế độ ${h2(s.mode)}h, lệnh ${h2(s.cmd)}h`:""} · đã phát ${s.txN} khung, đã thu ${s.rxOk}</p><div class="xio-bits"><span class="xio-bl">Trạng thái ${h2(u.stat())}h</span>${["TxRDY","RxRDY","TxE","PE","OE","FE"].map((n,k)=>`<span class="xio-bit${(u.stat()>>k)&1?" on":""}"><i>${n}</i><b>${(u.stat()>>k)&1}</b></span>`).join("")}</div>`:`<p class="xio-d">8251A chờ từ chế độ (mode) sau RESET.</p>`;
      const t=b?b.term:null;$(".xio-rx").textContent=t?(t.rx.replace(/[^\x20-\x7e\n]/g,"·")||" ")+(t.fe?`\n[${t.fe} lỗi khung (framing)]`:""):" "}
    $(".xio-notes").innerHTML=b?b.notes.map(n=>`<li>${esc(n.vi)}</li>`).join(""):""}
  const loop=()=>{if(!sec.isConnected)return;const t=performance.now();if(t-last>90){last=t;draw(false)}requestAnimationFrame(loop)};
  paint(null);requestAnimationFrame(loop);
  return{use,draw:()=>draw(true),get cfg(){return cfgNow()}}};
})(typeof window!=="undefined"?window:globalThis);
/* ===================== trình mô phỏng của khóa (platform/js/59-x86-trainer.js) ===================== */
/* ===================== Trình mô phỏng 8086 · trainer bare-metal AMTS-86 (máy, không dùng DOM) =====================
   Chỉ tải trên trang khóa mpu8086 (build.py: SIM_FILES). Chạy được trong Node (require sau 58-x86-asm/cpu/dos/ui.js).
   Tài liệu: docs/TRINH-MO-PHONG-8086-TRAINER.md. Dùng cho chương 12 (AMTS-EMB-002-M12, mô phỏng AMTS-EMB-002-SIM24).

   Tệp này KHÔNG sửa 58-x86-*.js. Nó bọc ba điểm vào:
     X86.assemble  chương trình có đoạn tên ROM (ROM SEGMENT … ROM ENDS) là chương trình nạp vào EPROM của trainer: dịch như cũ,
                   rồi đặt lại địa chỉ: đoạn ROM → FC00h (EPROM FC000h–FFFFFh), đoạn RAM (nếu có) → 0040h (RAM 00400h…).
                   Giá trị số hiệu đoạn trong mã (JMP FAR PTR, MOV AX, ROM, DW nhãn, 0FC00h…) được định vị lại.
     X86.Machine   prog.trainer → máy Trainer: không có DOS, CPU bắt đầu ở FFFF:0000 (FFFF0h) như sau RESET.
     X86.grade     chương trình trainer: chấm thêm đèn LED, thiết bị, ô nhớ theo địa chỉ; chương trình kết thúc bằng HLT.
   Chương trình DOS (.MODEL SMALL/TINY, không có đoạn ROM) chạy y như trước.

   Trainer AMTS-86 (GIẢ ĐỊNH của khóa học, thiết kế ở Bài 45; không phải bo của hãng nào):
     CPU 8086 chế độ minimum, CLK 5 MHz (8284A, thạch anh 15 MHz), PCLK 2,5 MHz cấp cho 8254.
     Bộ nhớ (giải mã đầy đủ A19–A14, M/IO = 1):
       RAM   00000h–03FFFh  2 × 6264 (8K × 8): bank chẵn D0–D7 (A0 = 0), bank lẻ D8–D15 (BHE = 0). Lúc bật nguồn chứa giá trị rác
             (trình mô phỏng dùng một dãy cố định để chạy lại ra cùng kết quả).
       EPROM FC000h–FFFFFh  2 × 2764 (8K × 8). Ô chưa nạp = FFh. Ghi vào EPROM không có tác dụng.
       Vùng khác: không chip nào trả lời; đọc ra FFh (giả định điện trở kéo lên trên bus dữ liệu), ghi bị mất.
     Cổng I/O (M/IO = 0; bốn chip 8 bit nối D0–D7 nên chỉ dùng địa chỉ CHẴN; 74LS138 giải mã A5–A3 khi A7 = 1, A6 = 0, A0 = 0):
       8255A PPI   80h PA → 8 LED (1 = sáng) · 82h PB ← 8 công tắc · 84h PC: PC3–PC0 → 4 LED đỏ, PC7–PC4 ← nút K0–K3 · 86h điều khiển
       8254 PIT    88h, 8Ah, 8Ch bộ đếm 0–2 · 8Eh điều khiển. CLK0 = 2,5 MHz, GATE0 = 1, OUT0 → IR0 của 8259A.
       8259A PIC   90h (A0 = 0), 92h (A0 = 1). IR0 ← OUT0, IR1 ← nút NGẮT (cạnh lên), IR2–IR7 không nối.
       8251A USART 98h dữ liệu · 9Ah điều khiển/trạng thái. TxD/RxD nối terminal 9600 baud, 8 bit, không chẵn lẻ, 1 stop (8N1, ×16).
       Địa chỉ lẻ 81h–9Fh: không chip nào trên D8–D15 → đọc FFh, ghi mất. Cổng khác: đọc FFh.
   Mức mô hình (giới hạn, ghi rõ cho học viên):
     - 8255A chỉ mode 0 và BSR; 8254 chỉ mode 0, 2, 3 của bộ đếm 0 (bộ đếm 1, 2 nhận lệnh nhưng không có đầu ra); 8259A một chip,
       kích cạnh, ưu tiên cố định, EOI thường/đặc biệt, AEOI; 8251A chỉ bất đồng bộ: terminal nhận ngay (không mô phỏng thời gian
       truyền từng bit), từ chế độ khác 4Eh làm terminal nhận sai (hiện “?”).
     - Thiết bị tiến theo từng lệnh (sai số tối đa một lệnh). Ngắt chỉ được nhận giữa hai lệnh; lệnh REP chạy trọn một bước.
       Nhận ngắt INTR tốn 61 chu kỳ (giả định theo bảng thời gian Intel, CẦN XÁC MINH). Không nhận ngắt ngay sau STI, MOV SS, POP SS.
     - HLT: nếu IF = 1 và có nguồn ngắt (timer đang chạy, phím NGẮT trong test), CPU chờ tới ngắt kế tiếp (tối đa 1 s mô phỏng);
       thời gian chờ tính riêng (không cộng vào số chu kỳ của chương trình). Không có nguồn ngắt: HLT là dừng hẳn (kết thúc).
*/
(function(G){
"use strict";
const X86=G.X86;
if(!X86||!X86.Machine||X86.Trainer)return;
const Base=X86.Machine,asm0=X86.assemble,grade0=X86.grade;
const h2=v=>(v&255).toString(16).toUpperCase().padStart(2,"0"),h4=v=>(v&0xFFFF).toString(16).toUpperCase().padStart(4,"0"),h5=v=>(v>>>0).toString(16).toUpperCase().padStart(5,"0");
const ROMSEG=0xFC00,ROM_LO=0xFC000,ROM_SIZE=0x4000,RAM_HI=0x3FFF,RAMSEG=0x0040,RAM_DATA=0x400;
const IF=0x200,TF=0x100,INTR_CYC=61,TICK=2,HLT_MAX=5000000,HIST=20000,LOGMAX=3000;
const MHZ=5,PIT_HZ=2500000;
const isRam=a=>a>=0&&a<=RAM_HI,isRom=a=>a>=ROM_LO&&a<=0xFFFFF;
class Stop extends Error{}
/* ================= dịch: chương trình có đoạn ROM → ảnh EPROM của trainer ================= */
function segLine(src,name){const L=String(src).split("\n");const re=new RegExp("^\\s*"+name+"\\s+SEGMENT\\b","i");for(let i=0;i<L.length;i++)if(re.test(L[i]))return i+1;return 0}
function toTrainer(src,r){
  const P=r.prog,errs=[],warns=(r.warns||[]).filter(w=>!/ngăn xếp|STACK/i.test(w.vi));
  const segU=n=>String(n).toUpperCase();
  const rom=P.segs.find(s=>segU(s.name)==="ROM"),ram=P.segs.find(s=>segU(s.name)==="RAM");
  for(const s of P.segs){const u=segU(s.name);if(u==="ROM"||u==="RAM"||s.auto)continue;
    errs.push({line:segLine(src,s.name),msg:"segment",vi:"Chương trình cho trainer chỉ có hai đoạn: ROM (mã, hằng, vectơ khởi động) và RAM (biến, không có giá trị ban đầu). Đoạn “"+s.name+"” không có chỗ trên bo. Ngăn xếp: tự đặt SS:SP trong RAM (ví dụ SS = 0000h, SP = 4000h)."})}
  if(rom.size>ROM_SIZE)errs.push({line:segLine(src,"ROM"),msg:"rom size",vi:"Đoạn ROM dài "+rom.size+" byte, EPROM của trainer chỉ có 16 384 byte (FC000h–FFFFFh)."});
  if(ram&&ram.size>RAM_HI+1-RAM_DATA)errs.push({line:segLine(src,"RAM"),msg:"ram size",vi:"Đoạn RAM dài "+ram.size+" byte, vượt vùng RAM còn lại từ 00400h tới 03FFFh."});
  if(errs.length)return{ok:false,errors:errs,warns};
  /* tìm các word là số hiệu đoạn: dịch lại với một đoạn đệm 16 byte đứng đầu, mọi đoạn dời đi 1 đoạn; byte nào đổi là số hiệu đoạn */
  const r2=asm0("ZZPAD SEGMENT\nDB 16 DUP(0)\nZZPAD ENDS\n"+src);
  const A=P.stmts.filter(s=>s.bytes&&s.bytes.length),B=r2.ok?r2.prog.stmts.filter(s=>s.bytes&&s.bytes.length&&segU(s.seg)!=="ZZPAD"):null;
  if(!B||B.length!==A.length)return{ok:false,errors:[{line:0,msg:"reloc",vi:"Không định vị lại được chương trình cho trainer (lỗi trình mô phỏng). Báo cho giảng viên kèm mã nguồn."}],warns};
  const tgt=new Map();for(const s of P.segs){const u=segU(s.name);if(u==="ROM")tgt.set(s.frame,ROMSEG);else if(u==="RAM")tgt.set(s.frame,RAMSEG)}
  const relocs=[];
  A.forEach((s,k)=>{const a=s.bytes,b=B[k].bytes;for(let i=0;i<a.length;i++){if(a[i]===b[i])continue;
      const w1=a[i]|((a[i+1]||0)<<8),w2=b[i]|((b[i+1]||0)<<8);let at=i;
      if(((w2-w1)&0xFFFF)!==1&&i>0&&(((b[i-1]|(b[i]<<8))-(a[i-1]|(a[i]<<8)))&0xFFFF)===1)at=i-1;
      const w=a[at]|(a[at+1]<<8);
      if(!tgt.has(w)){errs.push({line:s.line,msg:"reloc",vi:"Dòng này dùng số hiệu đoạn của đoạn ngăn xếp/đoạn không có trên trainer. Dùng ROM, RAM hoặc hằng số (ví dụ 0FC00h)."});break}
      relocs.push([s,at,tgt.get(w)]);i=at+1}});
  if(errs.length)return{ok:false,errors:errs,warns};
  const romImg=new Uint8Array(ROM_SIZE).fill(0xFF),romMask=new Uint8Array(ROM_SIZE);
  const fix=new Map();for(const [s,at,v] of relocs){if(!fix.has(s))fix.set(s,s.bytes.slice());const b=fix.get(s);b[at]=v&255;b[at+1]=v>>8}
  const stmts=P.stmts.map(s=>{const u=segU(s.seg);const t=u==="ROM"?ROMSEG:u==="RAM"?RAMSEG:null;const bytes=fix.get(s)||s.bytes;
    const n=Object.assign({},s,{bytes});if(t!=null){n.frame=t;n.segBase=t;n.phys=t*16+s.off}return n});
  for(const s of stmts)if(segU(s.seg)==="ROM")for(let i=0;i<s.bytes.length;i++){const o=s.off+i;if(o<ROM_SIZE){romImg[o]=s.bytes[i];romMask[o]=1}}
  for(const s of stmts)if(segU(s.seg)==="RAM"&&s.kind==="data"&&s.bytes.some(v=>v))warns.push({line:s.line,vi:"Giá trị ban đầu trong đoạn RAM không được nạp: RAM mất nội dung khi tắt nguồn. Chương trình phải tự ghi giá trị đầu (ví dụ chép từ bảng trong ROM)."});
  const lineAt=new Map();for(const s of stmts)if(s.kind==="ins"&&!lineAt.has(s.phys))lineAt.set(s.phys,s.line);
  const syms={};for(const [k,v] of Object.entries(P.syms)){if(v.k==="const"){syms[k]=v;continue}const u=segU(v.seg);const t=u==="ROM"?ROMSEG:u==="RAM"?RAMSEG:null;
    syms[k]=t==null?v:Object.assign({},v,{frame:t,phys:t*16+v.off})}
  const segs=P.segs.filter(s=>!s.auto).map(s=>{const u=segU(s.name);const t=u==="ROM"?ROMSEG:RAMSEG;return Object.assign({},s,{base:t,frame:t})});
  const prog=Object.assign({},P,{kind:"rom",trainer:true,image:romImg,romMask,base:ROMSEG,entry:{cs:0xFFFF,ip:0},ss:0,sp:0,stmts,lineAt,syms,segs,
    dataSeg:ram?RAMSEG:null,relocs:relocs.length});
  if(!romMask[0x3FF0])warns.push({line:segLine(src,"ROM"),vi:"Ô FFFF0h (ROM:3FF0h) chưa có lệnh: sau RESET CPU nạp lệnh ở đó. Thêm ORG 3FF0h rồi lệnh JMP xa tới đầu chương trình."});
  return{ok:true,errors:[],warns,prog}}
X86.assemble=function(src){const r=asm0(src);if(!r.ok||!r.prog||!r.prog.segs.some(s=>String(s.name).toUpperCase()==="ROM"))return r;return toTrainer(src,r)};
/* ================= thiết bị trên bo ================= */
/* trạng thái thiết bị nằm trong một mảng số (lưu/khôi phục nhanh cho nút Lùi) */
const K={};["CW","AIN","BIN","CUIN","CLIN","PA","PB","PC","PSET","PWR",
  "P0MODE","P0RW","P0CR","P0RUN","P0T0","P0WF","P0WLO","P0LAT","P0RF","P0NEXT","P0PROG","P0BCD",
  "C1","C2",
  "ICINIT","ICW1","ICW2","ICW4","IMR","IRR","ISR","RDSEL","NINT",
  "UST","UMODE","UCMD","USYN","UTX","URX","UPOLL","USENT","UGARB",
  "IDLE","KEYI","LOGN","INH","LASTV"].forEach((k,i)=>K[k]=i);
const NS=Object.keys(K).length;
class Board{
  constructor(M,ext){this.M=M;this.ext=ext;this.S=new Float64Array(NS);this.log=[];this.logBase=0;this.notes=new Map();
    const S=this.S;S[K.CW]=0x9B;S[K.AIN]=S[K.BIN]=S[K.CUIN]=S[K.CLIN]=1;S[K.P0LAT]=-1;S[K.UTX]=-1;S[K.URX]=-1;S[K.LASTV]=-1}
  get now(){return this.M.cpu.total+this.S[K.IDLE]}
  save(){return this.S.slice()}
  load(s){this.S.set(s);const n=s[K.LOGN]-this.logBase;if(n>=0&&n<this.log.length)this.log.length=n}
  note(k,vi){if(!this.notes.has(k))this.notes.set(k,vi)}
  addLog(k,a,v,dev,extra){const S=this.S;const e={n:S[K.LOGN],t:this.now,k,a,v,dev,x:extra||""};this.log.push(e);S[K.LOGN]++;
    if(this.log.length>LOGMAX){this.log.splice(0,1000);this.logBase+=1000}}
  /* ---------- cổng I/O ---------- */
  dev(p){p&=0xFFFF;if(p<0x80||p>0x9F)return null;if(p&1)return{odd:1};const c=(p>>3)&3,r=(p>>1)&3;return{c:["ppi","pit","pic","usart"][c],r}}
  rd(p){const d=this.dev(p);let v=0xFF,name="—";
    if(!d){name="không có chip";if(p<0x80||p>0x9F)this.note("port"+p,"IN từ cổng "+h4(p)+"h: trên trainer không chip nào ở địa chỉ này, bus đọc FFh. Bản đồ I/O: 80h–86h 8255A, 88h–8Eh 8254, 90h/92h 8259A, 98h/9Ah 8251A.")}
    else if(d.odd){name="cổng lẻ";this.note("odd","Cổng lẻ "+h2(p)+"h: bốn chip I/O nối nửa thấp bus D0–D7 nên chỉ trả lời ở địa chỉ chẵn (A0 = 0). Đọc ra FFh.")}
    else if(d.c==="ppi"){v=this.ppiRd(d.r);name="8255A "+["PA","PB","PC","điều khiển"][d.r]}
    else if(d.c==="pit"){v=this.pitRd(d.r);name="8254 "+(d.r<3?"bộ đếm "+d.r:"điều khiển")}
    else if(d.c==="pic"){v=this.picRd(d.r&1);name="8259A A0 = "+(d.r&1)}
    else{v=this.uRd(d.r&1);name="8251A "+(d.r&1?"trạng thái":"dữ liệu")}
    this.addLog("IOR",p,v,name);return v&255}
  wr(p,v){v&=255;const d=this.dev(p);
    const name=!d?"không có chip":d.odd?"cổng lẻ":d.c==="ppi"?"8255A "+["PA","PB","PC","điều khiển"][d.r]:d.c==="pit"?"8254 "+(d.r<3?"bộ đếm "+d.r:"điều khiển"):d.c==="pic"?"8259A A0 = "+(d.r&1):"8251A "+(d.r&1?"điều khiển":"dữ liệu");
    this.addLog("IOW",p,v,name);
    if(!d)this.note("wport"+p,"OUT tới cổng "+h4(p)+"h: không chip nào ở địa chỉ này, byte bị mất. Bản đồ I/O: 80h–86h 8255A, 88h–8Eh 8254, 90h/92h 8259A, 98h/9Ah 8251A.");
    else if(d.odd)this.note("oddw","OUT tới cổng lẻ "+h2(p)+"h: không chip nào nối D8–D15, byte bị mất (dùng địa chỉ chẵn).");
    else if(d.c==="ppi")this.ppiWr(d.r,v);
    else if(d.c==="pit")this.pitWr(d.r,v);
    else if(d.c==="pic")this.picWr(d.r&1,v);
    else this.uWr(d.r&1,v)}
  /* ---------- 8255A (mode 0, BSR) ---------- */
  ppiRd(r){const S=this.S,x=this.ext;
    if(r===0)return S[K.AIN]?0xFF:S[K.PA];
    if(r===1){if(!S[K.BIN])this.note("pbout","Đọc PB khi cổng B đặt là cổng RA: PB đang nối 8 công tắc (hai bên cùng lái dây). Trình mô phỏng trả chốt ra.");return S[K.BIN]?(x.sw&255):S[K.PB]}
    if(r===2){const cu=S[K.CUIN]?((x.btn&15)<<4):(S[K.PC]&0xF0),cl=S[K.CLIN]?0x0F:(S[K.PC]&0x0F);return cu|cl}
    this.note("ppird","8255A không cho đọc thanh ghi điều khiển (86h): bus đọc FFh.");return 0xFF}
  ppiWr(r,v){const S=this.S;S[K.PWR]++;
    if(r===3){if(v&0x80){S[K.CW]=v;S[K.PSET]=1;S[K.AIN]=(v>>4)&1;S[K.CUIN]=(v>>3)&1;S[K.BIN]=(v>>1)&1;S[K.CLIN]=v&1;S[K.PA]=S[K.PB]=S[K.PC]=0;
        if(v&0x64)this.note("ppimode","Từ điều khiển "+h2(v)+"h chọn mode 1/2: trình mô phỏng chỉ có mode 0; cổng chạy như mode 0.");
        if(!S[K.BIN])this.note("pbo","Cổng B đặt là cổng RA nhưng đang nối 8 công tắc: xung đột trên dây (bo thật có thể hỏng chip).")}
      else{const b=(v>>1)&7;if(v&1)S[K.PC]|=1<<b;else S[K.PC]&=~(1<<b)}return}
    if(r===0){S[K.PA]=v;if(S[K.AIN])this.note("pain","Ghi PA khi cổng A còn là cổng VÀO (sau RESET 8255A đặt mọi cổng là vào): byte nằm trong chốt nhưng LED không đổi. Ghi từ điều khiển (ví dụ 89h hoặc 82h) trước.")}
    else if(r===1){S[K.PB]=v;if(S[K.BIN])this.note("pbin","Ghi PB: cổng B là cổng vào nối công tắc, byte không ra chân.")}
    else S[K.PC]=v}
  leds(){const S=this.S;return S[K.AIN]?0:S[K.PA]&255}
  ledsC(){const S=this.S;return S[K.CLIN]?0:S[K.PC]&15}
  /* ---------- 8254: bộ đếm 0 (mode 0, 2, 3) ---------- */
  pitWr(r,v){const S=this.S;
    if(r===3){const sc=v>>6,rw=(v>>4)&3;if(sc===3){this.note("readback","Lệnh đọc lại (read-back) của 8254: trình mô phỏng chưa có.");return}
      if(sc!==0){S[sc===1?K.C1:K.C2]=v;return}
      if(rw===0){if(S[K.P0LAT]<0){S[K.P0LAT]=this.cnt0();S[K.P0RF]=0}return}
      let m=(v>>1)&7;if(m>5)m-=4;S[K.P0MODE]=m;S[K.P0RW]=rw;S[K.P0BCD]=v&1;S[K.P0RUN]=0;S[K.P0WF]=0;S[K.P0RF]=0;S[K.P0LAT]=-1;S[K.P0PROG]=1;S[K.P0NEXT]=0;
      if(m!==0&&m!==2&&m!==3)this.note("pitmode","Bộ đếm 0 đặt mode "+m+": trình mô phỏng chỉ có mode 0, 2, 3; bộ đếm không tạo ngắt.");
      if(v&1)this.note("bcd","Bộ đếm 0 đặt đếm BCD: trình mô phỏng đếm nhị phân.");return}
    if(r!==0){S[r===1?K.C1:K.C2]=v;return}
    if(!S[K.P0PROG])this.note("pitnop","Ghi số đếm vào bộ đếm 0 khi chưa ghi từ điều khiển (8Eh): bộ đếm chưa có mode.");
    const rw=S[K.P0RW]||3;
    if(rw===1)this.load0(v);else if(rw===2)this.load0(v<<8);
    else if(!S[K.P0WF]){S[K.P0WLO]=v;S[K.P0WF]=1}else{S[K.P0WF]=0;this.load0(S[K.P0WLO]|(v<<8))}}
  load0(n){const S=this.S;S[K.P0CR]=n&0xFFFF;const N=(n&0xFFFF)||65536;
    if(S[K.P0RUN]&&(S[K.P0MODE]===2||S[K.P0MODE]===3))return;   // đang chạy: giá trị mới dùng ở lần nạp lại kế tiếp
    S[K.P0RUN]=1;S[K.P0T0]=this.now;S[K.P0NEXT]=this.now+N*TICK}
  per0(){return((this.S[K.P0CR]&0xFFFF)||65536)*TICK}
  cnt0(){const S=this.S;if(!S[K.P0RUN])return S[K.P0CR];const N=(S[K.P0CR]&0xFFFF)||65536;const el=Math.floor((this.now-S[K.P0T0])/TICK);
    if(S[K.P0MODE]===0)return Math.max(0,N-el)&0xFFFF;return(N-(el%N))&0xFFFF}
  pitRd(r){const S=this.S;if(r!==0){this.note("pitrd","Đọc bộ đếm "+r+": trình mô phỏng chỉ có bộ đếm 0.");return 0xFF}
    const v=S[K.P0LAT]>=0?S[K.P0LAT]:this.cnt0();const rw=S[K.P0RW]||3;let b;
    if(rw===1)b=v&255;else if(rw===2)b=v>>8;else{b=S[K.P0RF]?v>>8:v&255;S[K.P0RF]^=1}
    if(S[K.P0LAT]>=0&&(rw!==3||!S[K.P0RF]))S[K.P0LAT]=-1;return b&255}
  /* ---------- 8259A (một chip, kích cạnh) ---------- */
  picWr(a0,v){const S=this.S;
    if(!a0){if(v&0x10){S[K.ICINIT]=1;S[K.ICW1]=v;S[K.IMR]=0;S[K.IRR]=0;S[K.ISR]=0;S[K.RDSEL]=0;S[K.ICW4]=0;
        if(v&0x08)this.note("ltim","ICW1 đặt kích mức (LTIM = 1): trình mô phỏng chỉ có kích cạnh.");
        if(!(v&0x02))this.note("cascade","ICW1 có SNGL = 0 (nối tầng): trainer chỉ có một 8259A, cần thêm ICW3; nên dùng SNGL = 1.");return}
      if((v&0x18)===0x08){if(v&2)S[K.RDSEL]=v&1;return}
      const e=v>>5;
      if(e===1){const b=this.hiBit(S[K.ISR]);if(b>=0)S[K.ISR]&=~(1<<b);this.addLog("EOI",0x90,v,"8259A","EOI thường"+(b>=0?": xóa ISR bit "+b:" nhưng ISR = 0"));return}
      if(e===3){S[K.ISR]&=~(1<<(v&7));this.addLog("EOI",0x90,v,"8259A","EOI cho IR"+(v&7));return}
      this.note("ocw2","OCW2 "+h2(v)+"h (xoay vòng ưu tiên…): trình mô phỏng chỉ có EOI thường (20h) và EOI đặc biệt (60h + n).");return}
    const st=S[K.ICINIT];
    if(st===1){S[K.ICW2]=v;if(v&7)this.note("icw2low","ICW2 = "+h2(v)+"h: ở chế độ 8086, 3 bit thấp của ICW2 bị bỏ qua (8259A tự điền số IR).");
      S[K.ICINIT]=(S[K.ICW1]&2)?((S[K.ICW1]&1)?3:4):2;return}
    if(st===2){S[K.ICINIT]=(S[K.ICW1]&1)?3:4;return}
    if(st===3){S[K.ICW4]=v;S[K.ICINIT]=4;if(!(v&1))this.note("upm","ICW4 có µPM = 0 (chế độ 8080/8085): 8259A không đưa số hiệu ngắt kiểu 8086. Đặt bit 0 của ICW4 = 1.");return}
    if(st===4){S[K.IMR]=v;return}
    this.note("picinit","Ghi 92h khi 8259A chưa được khởi tạo bằng ICW1 (90h, bit 4 = 1): byte không có tác dụng.")}
  picRd(a0){const S=this.S;if(a0)return S[K.IMR];return S[K.RDSEL]?S[K.ISR]:S[K.IRR]}
  hiBit(m){for(let i=0;i<8;i++)if(m&(1<<i))return i;return -1}
  raise(n){const S=this.S;if(S[K.ICINIT]!==4)return;S[K.IRR]|=1<<n}
  intr(){const S=this.S;if(S[K.ICINIT]!==4)return false;const req=S[K.IRR]&~S[K.IMR]&255;if(!req)return false;const b=this.hiBit(req),s=this.hiBit(S[K.ISR]);return s<0||b<s}
  ack(){const S=this.S;const req=S[K.IRR]&~S[K.IMR]&255,b=this.hiBit(req);S[K.IRR]&=~(1<<b);if(!(S[K.ICW4]&2))S[K.ISR]|=1<<b;S[K.NINT]++;
    const v=(S[K.ICW2]&0xF8)|b;this.addLog("INTA",b,v,"8259A","IR"+b+" → vectơ "+h2(v)+"h, đọc IVT ở "+h5(v*4)+"h");return v}
  /* ---------- 8251A (bất đồng bộ) ---------- */
  uWr(a0,v){const S=this.S,M=this.M;S[K.UPOLL]=0;
    if(a0){const st=S[K.UST];
      if(st===0){S[K.UMODE]=v;if((v&3)===0){S[K.USYN]=(v&0x80)?1:2;S[K.UST]=1}else S[K.UST]=3;
        if((v&3)&&v!==0x4E)this.note("umode","Từ chế độ 8251A = "+h2(v)+"h khác 4Eh (bất đồng bộ ×16, 8 bit, không chẵn lẻ, 1 stop) mà terminal đang dùng: terminal nhận sai khung (hiện “?”).");return}
      if(st===1){if(--S[K.USYN]<=0)S[K.UST]=3;return}
      S[K.UCMD]=v;if(v&0x40){S[K.UST]=0;S[K.UCMD]=0;S[K.UTX]=-1;return}
      if((v&1)&&S[K.UTX]>=0){const b=S[K.UTX];S[K.UTX]=-1;this.txOut(b)}return}
    if(S[K.UST]!==3){this.note("uncfg","Ghi dữ liệu vào 8251A khi chip chưa nhận đủ từ chế độ và từ lệnh: byte không được gửi.");return}
    if(!(S[K.UCMD]&1)){S[K.UTX]=v;this.note("txen","Từ lệnh 8251A có TxEN = 0: byte nằm trong bộ đệm phát, không được gửi, TxRDY về 0. Từ lệnh thường dùng: 37h (TxEN, DTR, RxE, ER, RTS).");return}
    this.txOut(v)}
  txOut(v){const S=this.S,M=this.M;S[K.USENT]++;
    if(S[K.UMODE]!==0x4E||(S[K.UMODE]&3)===0){S[K.UGARB]++;M.tput(0x3F)}else M.tput(v)}
  uRd(a0){const S=this.S,M=this.M;
    if(a0){const rxe=(S[K.UCMD]&4)&&S[K.UST]===3,has=rxe&&M.hasKey(),txr=S[K.UTX]<0;
      S[K.UPOLL]++;
      if(!has&&txr&&rxe&&S[K.UPOLL]>=3){   // đang chờ ký tự từ terminal
        if(M.interactive&&!M.eof){M.waiting="char";throw new Stop()}
        M.idleEnd=true}
      if(!txr&&S[K.UPOLL]>2000)M.crashWith("Chương trình chờ TxRDY của 8251A mãi: byte trước còn nằm trong bộ đệm vì từ lệnh có TxEN = 0 (hoặc 8251A chưa được lập trình). Kiểm tra từ lệnh ghi vào 9Ah (ví dụ 37h).");
      if(!rxe&&!has&&S[K.UPOLL]>2000&&!(M.hasKey()))M.crashWith("Chương trình chờ RxRDY mãi: 8251A chưa bật thu (RxE = 0 trong từ lệnh) hoặc chưa được lập trình, nên không nhận được ký tự từ terminal.");
      return (txr?1:0)|(has?2:0)|(txr?4:0)}
    S[K.UPOLL]=0;
    if(!((S[K.UCMD]&4)&&S[K.UST]===3)){this.note("rxe","Đọc dữ liệu 8251A khi chưa bật thu (RxE = 0): không có ký tự.");return 0xFF}
    if(!M.hasKey()){this.note("rxempty","Đọc cổng dữ liệu 98h khi RxRDY = 0: chưa có ký tự mới, byte đọc được là byte cũ.");return S[K.LASTV]<0?0:S[K.LASTV]}
    const k=M.key();S[K.LASTV]=k;M.reads++;return k}
  /* ---------- thời gian ---------- */
  tick(){const S=this.S;
    while(S[K.P0RUN]&&this.now>=S[K.P0NEXT]){this.raise(0);this.addLog("IRQ",0,1,"8254 OUT0","cạnh lên → IR0");
      if(S[K.P0MODE]===0){S[K.P0RUN]=0;break}S[K.P0T0]=S[K.P0NEXT];S[K.P0NEXT]+=this.per0()}
    const keys=this.ext.keys||[];while(S[K.KEYI]<keys.length&&keys[S[K.KEYI]]<=this.now){this.raise(1);this.addLog("IRQ",1,1,"nút NGẮT","cạnh lên → IR1");S[K.KEYI]++}}
  nextEvent(){const S=this.S;let t=Infinity;
    if(S[K.P0RUN]&&S[K.ICINIT]===4&&!(S[K.IMR]&1))t=S[K.P0NEXT];
    const keys=this.ext.keys||[];if(S[K.KEYI]<keys.length&&S[K.ICINIT]===4&&!(S[K.IMR]&2))t=Math.min(t,Math.max(keys[S[K.KEYI]],this.now));
    return t}
  press(){this.raise(1);this.addLog("IRQ",1,1,"nút NGẮT","cạnh lên → IR1 (bấm tay)")}
  desc(){const S=this.S,N=(S[K.P0CR]&0xFFFF)||65536;
    return{ppi:S[K.PSET]?`CW = ${h2(S[K.CW])}h · PA ${S[K.AIN]?"vào":"ra"} · PB ${S[K.BIN]?"vào":"ra"} · PC cao ${S[K.CUIN]?"vào":"ra"} · PC thấp ${S[K.CLIN]?"vào":"ra"}`:"chưa ghi từ điều khiển (sau RESET: mọi cổng là cổng vào)",
      pit:S[K.P0PROG]?`bộ đếm 0: mode ${S[K.P0MODE]}, N = ${N}${S[K.P0RUN]?` → ${(PIT_HZ/N).toLocaleString("vi-VN",{maximumFractionDigits:2})} Hz (chu kỳ ${(N/PIT_HZ*1000).toLocaleString("vi-VN",{maximumFractionDigits:3})} ms)`:" (chưa nạp số đếm)"}`:"chưa lập trình",
      pic:S[K.ICINIT]===4?`ICW2 = ${h2(S[K.ICW2])}h (IR0 → ${h2(S[K.ICW2]&0xF8)}h) · IMR = ${h2(S[K.IMR])}h · IRR = ${h2(S[K.IRR])}h · ISR = ${h2(S[K.ISR])}h · đã nhận ${S[K.NINT]} ngắt`:S[K.ICINIT]?"đang khởi tạo (chờ ICW"+(S[K.ICINIT]+1)+")":"chưa khởi tạo",
      usart:S[K.UST]===3?`chế độ ${h2(S[K.UMODE])}h · lệnh ${h2(S[K.UCMD])}h${S[K.UCMD]&1?"":" (TxEN = 0)"}${S[K.UCMD]&4?"":" (RxE = 0)"} · đã gửi ${S[K.USENT]} byte`:S[K.UST]?"chờ ký tự đồng bộ":"chờ từ chế độ",
      cpuCyc:this.M.cpu.total,idle:S[K.IDLE],nint:S[K.NINT]}}
}
/* ================= máy trainer ================= */
const RAMSEED=0x2F6E2B1;
function ramByte(a){let s=(RAMSEED^Math.imul(a+1,0x9E3779B1))>>>0;s^=s>>>15;s=Math.imul(s,0x85EBCA6B)>>>0;s^=s>>>13;return s&255}
class Trainer extends Base{
  constructor(prog,opt){super(prog,opt);opt=opt||{};
    const m=this.mem,c=this.cpu;m.fill(0xFF);
    for(let a=0;a<=RAM_HI;a++)m[a]=ramByte(a);
    m.set(prog.image,ROM_LO);
    this.ext=opt.ext||(X86.Trainer.ext)||{sw:0,btn:0};
    const F=this.ext.fault||{};
    for(const f of F.romFlip||[]){const a=f.a-ROM_LO;if(a>=0&&a<ROM_SIZE)m[f.a]^=1<<f.bit}
    this.alias=F.ramAlias||0;this.stuck=(F.ramStuck||[]).slice();
    if(this.alias)for(let a=0;a<=RAM_HI;a++)if(a&this.alias)m[a]=m[a&~this.alias];
    for(const s of this.stuck)m[s.a]=s.v?m[s.a]|(1<<s.bit):m[s.a]&~(1<<s.bit);
    this.ram0=m.slice(0,RAM_HI+1);
    c.hooks=null;c.hookSeg=-1;c.r.fill(0);c.s.fill(0);c.cs=0xFFFF;c.ip=0;c.f=0xF002;
    this.bd=new Board(this,this.ext);
    c.inp=p=>this.bd.rd(p);c.outp=(p,v)=>this.bd.wr(p,v);
    this.idleEnd=false;this.termKey=-1;this.termCache=null;}
  get notes(){if(!this._n)this._n=new Set();return this._n}set notes(v){this._n=v}
  crashWith(vi){this.crash={vi};this.done=true;throw new Stop()}
  tput(ch){if(this.out.length>200000){this.crashWith("Terminal đã nhận quá 200 000 ký tự: có thể chương trình đang lặp vô hạn.");return}
    this.out+=ch===13?"\r":ch===10?"\n":ch===8?"\b":ch===7?"":X86.CP437[ch]}
  term(){if(this.termCache&&this.termCache.n===this.out.length)return this.termCache;
    const L=[[]];let y=0,x=0;for(const ch of this.out){if(ch==="\r")x=0;else if(ch==="\n"){y++;if(!L[y])L[y]=[]}else if(ch==="\b"){if(x>0)x--}else{const r=L[y];while(r.length<x)r.push(" ");r[x]=ch;x++}}
    while(L.length<=y)L.push([]);const off=Math.max(0,L.length-25);
    return this.termCache={n:this.out.length,L:L.slice(off).map(r=>r.join("").replace(/\s+$/,"")),x,y:y-off}}
  screen(){return this.term().L}
  get curX(){return this.term().x}get curY(){return this.term().y}
  setCur(){}
  needKey(){return this.hasKey()}
  step(){
    if(this.done)return{s:this.crash?"crash":"exit"};
    const c=this.cpu,bd=this.bd,m=this.mem;
    if(this.hist.length>=HIST+2000)this.hist.splice(0,2000);
    const rec={r:c.r.slice(),sg:c.s.slice(),ip:c.ip,f:c.f,out:this.out.length,inPos:this.inPos,total:c.total,steps:c.steps,halted:c.halted,ulog:[],reads:this.reads||0,stopBp:this.stopBp,
      bd:bd.save(),sp:this.prog.sp,idleEnd:this.idleEnd};
    c.ulog=rec.ulog;c.acc=this.trace?[]:null;this.waiting=null;this.stopBp=false;
    let ph=c.pa(c.cs,c.ip),intr=-1;
    try{
      if(c.steps>=this.maxSteps){this.done=true;this.crash={vi:"Đã chạy "+this.maxSteps.toLocaleString("vi-VN")+" lệnh mà chương trình chưa dừng. Trên trainer không có DOS: chương trình kết thúc bằng HLT (với IF = 0 hoặc không còn nguồn ngắt), hoặc chờ ký tự từ terminal. Kiểm tra điều kiện dừng của vòng lặp."};return{s:"limit"}}
      if(c.halted){/* HLT: chờ ngắt kế tiếp */
        const S=bd.S;let waited=0;
        while(!((c.f&IF)&&bd.intr())){const t=bd.nextEvent();if(!(c.f&IF)||t===Infinity||t-bd.now+waited>HLT_MAX)break;
          const d=Math.max(0,t-bd.now);S[K.IDLE]+=d;waited+=d;bd.tick()}
        if(!((c.f&IF)&&bd.intr())){this.done=true;this.halted=true;
          if(c.f&IF&&bd.nextEvent()!==Infinity)bd.note("hltmax","CPU dừng ở HLT: sau 1 s mô phỏng (5 000 000 chu kỳ) vẫn chưa có ngắt được nhận.");
          this.hist.push(rec);return{s:"halt"}}}
      const S=bd.S;
      if((c.f&IF)&&!S[K.INH]&&bd.intr()){/* nhận ngắt phần cứng INTR: 2 chu kỳ INTA, cất FLAGS, CS, IP, nhảy theo IVT */
        c.halted=false;c.startCS=c.cs;c.startIP=c.ip;c.fl=0;c.ea=null;c.cycR=null;c.jumped=true;c.repN=-1;c.odd=0;
        if(!(S[K.ICW1]&1)||!(S[K.ICW4]&1))this.crashWith("8259A ở chế độ 8080/8085 (ICW4 thiếu hoặc bit µPM = 0): chu kỳ INTA không đưa số hiệu ngắt kiểu 8086. Đặt ICW1 có IC4 = 1 và ICW4 = 01h.");
        intr=bd.ack();const vp=intr*4;
        c.interrupt(intr,c.ip);c.cyc=INTR_CYC;c.total+=INTR_CYC;c.steps++;
        const nph=c.pa(c.cs,c.ip);
        this.last={cs:c.startCS,ip:c.startIP,phys:-1,bytes:[],cyc:INTR_CYC,cycR:null,line:0,ea:null,acc:c.acc||[],jumped:true,repN:-1,odd:0,intNo:intr,intr:intr,
          vec:{at:vp,ip:c.ip,cs:c.cs,phys:nph}};
        S[K.INH]=0;bd.tick();this.hist.push(rec);this.lastIntr=intr;return{s:"ok"}}
      S[K.INH]=0;c.fl=0;c.startCS=c.cs;c.startIP=c.ip;
      if(!isRam(ph)&&!isRom(ph))this.crashWith(`CPU nạp lệnh ở ${h4(c.cs)}:${h4(c.ip)} = ${h5(ph)}h: không chip nhớ nào ở địa chỉ này (bus đọc FFh). Thường do vectơ ngắt chưa được ghi (RAM lúc bật nguồn là rác), ICW2 sai, RET lấy địa chỉ sai vì ngăn xếp hỏng, hoặc SS:SP chưa khởi tạo.`);
      if(isRom(ph)&&!this.prog.romMask[ph-ROM_LO])this.crashWith(`CPU nạp lệnh ở ${h4(c.cs)}:${h4(c.ip)} = ${h5(ph)}h: ô EPROM này chưa được nạp (FFh).${ph===0xFFFF0?" Sau RESET CPU bắt đầu ở FFFF0h: đặt ORG 3FF0h trong đoạn ROM rồi lệnh JMP xa tới đầu chương trình.":" Chương trình chạy ra ngoài phần mã đã nạp: thiếu HLT/vòng lặp cuối, hoặc nhảy sai."}`);
      const op0=m[ph];
      c.step();
      const op=c.opcode;
      if(op===0xFB||op===0x17||(op===0x8E&&((m[(c.pa(c.startCS,c.startIP)+1)&0xFFFFF]>>3)&3)===2))S[K.INH]=1;   // STI, POP SS, MOV SS,…: không nhận ngắt sau lệnh này
      if(op===0xBC)this.prog.sp=c.sp;
      void op0;
    }catch(e){
      if(e instanceof Stop){
        if(this.waiting&&!this.done){this.undoT(rec);return{s:"wait",kind:this.waiting}}
        this.hist.push(rec);this.last=this.info(c,ph);return{s:"crash"}}
      if(e instanceof X86.X86Error){this.hist.push(rec);this.done=true;this.crash={vi:e.vi};this.last=this.info(c,ph);return{s:"crash"}}
      throw e}
    /* bộ nhớ: chỉ RAM ghi được; lỗi phần cứng giả lập (bí danh địa chỉ, bit kẹt) */
    const L=rec.ulog;
    for(let i=0;i<L.length;i+=2){const a=L[i];
      if(!isRam(a)){if(m[a]!==L[i+1]){const was=m[a];m[a]=L[i+1];
          if(isRom(a)){bd.note("romw","Lệnh ghi vào "+h5(a)+"h (EPROM): EPROM không ghi được bằng chu kỳ ghi của CPU, ô nhớ giữ nguyên. Biến phải đặt trong đoạn RAM.");bd.addLog("MEMW",a,was,"EPROM","bị bỏ qua")}
          else{bd.note("memw"+(a>>12),"Lệnh ghi vào "+h5(a)+"h: không chip nhớ nào ở địa chỉ này (RAM chỉ có 00000h–03FFFh), byte bị mất.");bd.addLog("MEMW",a,was,"không có chip","bị mất")}}
        continue}
      if(this.alias){const b=a^this.alias;if(isRam(b)&&m[b]!==m[a]){L.push(b,m[b]);m[b]=m[a]}}}
    for(const s of this.stuck){const v=s.v?m[s.a]|(1<<s.bit):m[s.a]&~(1<<s.bit);if(v!==m[s.a]){L.push(s.a,m[s.a]);m[s.a]=v}}
    bd.tick();
    this.hist.push(rec);
    if(this.trace){this.last=this.info(c,ph);this.execCount.set(ph,(this.execCount.get(ph)||0)+1);this.lastCyc.set(ph,c.cyc)}
    if(this.done)return{s:"exit"};
    if(this.idleEnd){this.done=true;this.exit=null;return{s:"exit"}}
    if(c.halted){if((c.f&IF)&&(bd.intr()||bd.nextEvent()!==Infinity))return{s:"ok"};this.done=true;this.halted=true;return{s:"halt"}}
    if(this.stopBp)return{s:"bp"};
    return{s:"ok"}}
  undoT(rec){super.undo(rec);this.bd.load(rec.bd);this.prog.sp=rec.sp;this.idleEnd=rec.idleEnd;this.termCache=null}
  undo(rec){this.undoT(rec)}
}
/* new X86.Machine(prog, opt): chương trình trainer → Trainer, chương trình DOS → máy DOS như cũ */
class Machine extends Base{constructor(prog,opt){if(prog&&prog.trainer)return new Trainer(prog,opt);super(prog,opt)}}
X86.Machine=Machine;
/* ================= chấm bài cho chương trình trainer =================
   test: {in (ký tự terminal gửi tới), sw (công tắc PB), btn (nút K0–K3), keys:[chu kỳ bấm nút NGẮT], fault:{ramStuck,ramAlias,romFlip},
          out (chữ trên terminal), leds (PA), ledsC (PC3–PC0), regs, mem:[{at:"biến RAM", bytes|word}], phys:[{at:địa chỉ, bytes}],
          keep:[địa chỉ RAM phải giữ giá trị lúc bật nguồn], dev:{pit0, imr, icw2, nint, ppiCw, umode, ucmd}} */
X86.grade=function(ex,src,opt){opt=opt||{};const r=X86.assemble(src);
  if(!r.ok||!r.prog.trainer)return grade0(ex,src,opt);
  const P=r.prog,R=[],DX=X86.dataExec?X86.dataExec(P):{watch(){},n:0};let maxC=0;
  for(const t of ex.tests||[]){
    const M=new X86.Machine(P,{input:t.in?String(t.in).replace(/\r/g,"")+(String(t.in).endsWith("\n")?"":"\n"):"",interactive:false,maxSteps:opt.maxSteps||2000000,
      ext:{sw:t.sw||0,btn:t.btn||0,keys:t.keys||[],fault:t.fault||null}});M.trace=false;DX.watch(M.cpu);const UC=X86.useCheck?X86.useCheck(P,ex):{watch(){},why:()=>[]};UC.watch(M.cpu);
    let s;for(;;){s=M.run(100000);if(s.s!=="ok"&&s.s!=="bp")break}
    const out=M.printed(),why=[],bd=M.bd,S=bd.S;
    if(s.s==="crash"||s.s==="limit")why.push(M.crash.vi);
    else if(!M.halted&&!M.idleEnd)why.push("Chương trình chưa dừng bằng HLT.");
    if(t.out!=null&&out!==X86.normOut(t.out))why.push("Chữ trên terminal chưa đúng.");
    if(t.leds!=null&&bd.leds()!==t.leds)why.push(`Đèn LED (PA) = ${h2(bd.leds())}h, cần ${h2(t.leds)}h.`);
    if(t.ledsC!=null&&bd.ledsC()!==t.ledsC)why.push(`LED đỏ (PC3–PC0) = ${bd.ledsC().toString(2).padStart(4,"0")}, cần ${t.ledsC.toString(2).padStart(4,"0")}.`);
    if(t.regs)for(const k in t.regs){const v=M.cpu.getReg(k);if(v!==(t.regs[k]&(/^[ABCD][LH]$/i.test(k)?255:0xFFFF)))why.push(`${k.toUpperCase()} = ${v.toString(16).toUpperCase()}h, cần ${t.regs[k].toString(16).toUpperCase()}h.`)}
    if(t.mem)for(const q of t.mem){const s0=P.syms[String(q.at).toUpperCase()];if(!s0||s0.phys==null){why.push(`Không thấy biến ${q.at} (giữ nguyên tên biến của đề bài).`);continue}
      const want=q.bytes||(q.word!=null?[q.word&255,(q.word>>8)&255]:[]);const got=want.map((_,i)=>M.mem[s0.phys+i]);
      if(got.some((v,i)=>v!==(want[i]&255)))why.push(`Biến ${q.at} = ${got.map(h2).join(" ")}, cần ${want.map(h2).join(" ")}.`)}
    if(t.phys)for(const q of t.phys){const got=q.bytes.map((_,i)=>M.mem[q.at+i]);if(got.some((v,i)=>v!==q.bytes[i]))why.push(`Ô nhớ ${h5(q.at)}h = ${got.map(h2).join(" ")}, cần ${q.bytes.map(h2).join(" ")}.`)}
    if(t.keep)for(const a of t.keep)if(M.mem[a]!==M.ram0[a])why.push(`Ô nhớ ${h5(a)}h đã bị ghi; đề yêu cầu giữ nguyên vùng này.`);
    if(t.dev){const D={pit0:S[K.P0CR],imr:S[K.IMR],icw2:S[K.ICW2],nint:S[K.NINT],ppiCw:S[K.CW],umode:S[K.UMODE],ucmd:S[K.UCMD]};
      const NM={pit0:"số đếm bộ đếm 0 của 8254",imr:"IMR của 8259A",icw2:"ICW2",nint:"số ngắt đã nhận",ppiCw:"từ điều khiển 8255A",umode:"từ chế độ 8251A",ucmd:"từ lệnh 8251A"};
      for(const k in t.dev)if(D[k]!==t.dev[k])why.push(`${NM[k]||k} = ${D[k]}, cần ${t.dev[k]}.`)}
    why.push(...UC.why());   // ex.require / ex.forbid (như X86.grade của 58-x86-ui.js)
    maxC=Math.max(maxC,M.cpu.total);R.push({ok:!why.length,why,out,want:t.out,cyc:M.cpu.total,steps:M.cpu.steps,in:t.in,leds:bd.leds(),idle:S[K.IDLE],nint:S[K.NINT]})}
  const okAll=R.every(x=>x.ok);let perfOk=true;const pf=ex.perf||{};
  if(okAll&&pf.cycles!=null&&maxC>pf.cycles)perfOk=false;
  const bytes=P.codeSize+DX.n;   // cộng byte DB/DW chạy như lệnh (như X86.grade của 58-x86-ui.js)
  if(okAll&&pf.bytes!=null&&bytes>pf.bytes)perfOk=false;
  return{ok:okAll&&perfOk,pass:R.filter(x=>x.ok).length,R,cyc:maxC,bytes,dataBytes:DX.n,perfOk,perf:pf}};
X86.Trainer={VERSION:"0.1.0",Board,Trainer,K,ext:{sw:0,btn:0,fault:null},ROMSEG,RAMSEG,ROM_LO,RAM_HI,INTR_CYC,TICK,PIT_HZ,MHZ,HLT_MAX,ramByte,
  MAP:{ppi:0x80,pit:0x88,pic:0x90,usart:0x98}};
if(typeof module!=="undefined"&&module.exports)module.exports=X86;
})(typeof window!=="undefined"?window:globalThis);
/* ===================== trình mô phỏng của khóa (platform/js/59-x86-trainer-ui.js) ===================== */
/* ===================== Trình mô phỏng 8086 · giao diện trainer AMTS-86 =====================
   Chỉ tải trên trang khóa mpu8086. Máy: 59-x86-trainer.js (không DOM). Tài liệu: docs/TRINH-MO-PHONG-8086-TRAINER.md.
   makeX86Trainer(el, cfg)  = makeX86Sim(el, cfg) + phần “Bo mạch” (LED, công tắc, nút, nút NGẮT, trạng thái 8255A/8254/8259A/8251A,
                              nhật ký bus, chẩn đoán) xếp dọc trong khung theo dõi; phần “Màn hình DOS” thành “Terminal (8251A)”.
                              Mỗi ví dụ (preset) có thể kèm sw (công tắc lúc nạp) và fault (lỗi phần cứng giả lập).
   makeX86TrainerEx(el, sim, list) = makeX86Ex + đặt công tắc / lỗi phần cứng của test 1 khi bấm Chạy thử. */
(function(G){
"use strict";
const X86=G.X86,doc=G.document;
if(!X86||!X86.Trainer||!G.makeX86Sim)return;
const T=X86.Trainer,K=T.K;
const h2=v=>(v&255).toString(16).toUpperCase().padStart(2,"0"),h4=v=>(v&0xFFFF).toString(16).toUpperCase().padStart(4,"0");
const escH=s=>String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
G.makeX86Trainer=function(root,cfg){
  cfg=cfg||{};const presets=(cfg.presets||[]).filter(p=>!p.an);const ext=T.ext;   // như makeX86Sim: ví dụ "an" không hiện
  const apply=i=>{const p=presets[i]||{};ext.sw=p.sw!=null?p.sw:0;ext.btn=p.btn||0;ext.fault=p.fault||null};
  apply(0);
  const sim=G.makeX86Sim(root,cfg);
  root.classList.add("x86tr");
  const $=s=>root.querySelector(s);
  /* đổi tên: Màn hình DOS → Terminal; ô nhập → ký tự gửi từ terminal */
  const outSec=root.querySelector('.pn[data-sec="out"]');outSec.querySelector(".pane-h span").textContent="Terminal (8251A, 9600 baud 8N1)";
  const nb=root.querySelector('.st-nav [data-go="out"]');if(nb)nb.textContent="Terminal";
  const lab=$(".sim-in label");if(lab)lab.innerHTML="<b>Ký tự terminal gửi tới 8251A</b><small>Chương trình nhận bằng IN AL, 98h khi bit RxRDY (bit 1 của cổng 9Ah) = 1; xuống dòng là phím Enter (0Dh). Để trống thì khi chương trình chờ ký tự, trang sẽ hỏi bạn.</small>";
  const scope=$(".sim-scope>div");if(scope)scope.insertAdjacentHTML("afterbegin",`<p><b>Trainer AMTS-86 (giả định của khóa, chương 12):</b> chương trình có đoạn <code>ROM SEGMENT</code> được nạp vào EPROM FC000h–FFFFFh; đoạn <code>RAM SEGMENT</code> nằm từ 00400h. Không có DOS: CPU bắt đầu ở FFFF0h, INT 21h không có dịch vụ. RAM 00000h–03FFFh (lúc bật nguồn là rác), vùng khác không có chip (đọc FFh). Cổng: 8255A 80h–86h (PA → 8 LED, PB ← 8 công tắc, PC3–PC0 → 4 LED đỏ, PC7–PC4 ← nút K0–K3), 8254 88h–8Eh (CLK0 2,5 MHz, OUT0 → IR0), 8259A 90h/92h (IR1 ← nút NGẮT), 8251A 98h/9Ah (terminal 8N1, nhận ngay, không mô phỏng thời gian từng bit). Nhận ngắt tốn 61 chu kỳ (giả định); HLT chờ ngắt kế tiếp, thời gian chờ không cộng vào số chu kỳ chương trình. 8255A chỉ mode 0; 8254 chỉ mode 0, 2, 3 của bộ đếm 0; 8259A một chip, kích cạnh.</p>`);
  /* phần Bo mạch */
  const sec=doc.createElement("section");sec.className="pn tr-pn";sec.dataset.sec="board";
  sec.innerHTML=`<div class="pane-h"><span>Bo mạch trainer</span><span class="tr-time"></span></div>
    <div class="tr-io">
      <div class="tr-g"><div class="tr-h">8 LED · 8255A PA (80h)</div><div class="tr-leds" role="img"></div></div>
      <div class="tr-g"><div class="tr-h">LED đỏ · PC3–PC0 (84h)</div><div class="tr-ledc" role="img"></div></div>
      <div class="tr-g"><div class="tr-h">Công tắc · PB (82h) <span class="tr-swv"></span></div><div class="tr-sw" role="group" aria-label="Công tắc PB7 đến PB0"></div></div>
      <div class="tr-g"><div class="tr-h">Nút K3–K0 · PC7–PC4</div><div class="tr-btn" role="group" aria-label="Nút K3 đến K0"></div>
        <button type="button" class="btn tr-key" title="Tạo cạnh lên ở IR1 của 8259A">NGẮT → IR1</button></div>
    </div>
    <dl class="tr-dev"></dl>
    <div class="tr-h">Nhật ký bus (I/O, ngắt, lỗi ghi) <span class="tr-logn"></span></div>
    <ol class="tr-log"></ol>
    <div class="tr-diag" hidden></div>`;
  outSec.parentNode.insertBefore(sec,outSec);
  const nav=root.querySelector(".st-nav");if(nav){const b=doc.createElement("button");b.type="button";b.dataset.go="board";b.textContent="Bo mạch";nav.insertBefore(b,nav.querySelector('[data-go="out"]'));
    b.onclick=()=>{const sc=root.querySelector(".st-scroll"),R=sc.getBoundingClientRect(),E=sec.getBoundingClientRect();sc.scrollTop+=E.top-R.top}}
  const swBox=sec.querySelector(".tr-sw"),btBox=sec.querySelector(".tr-btn");
  swBox.innerHTML=[7,6,5,4,3,2,1,0].map(b=>`<button type="button" class="tr-t" data-b="${b}" aria-pressed="false" aria-label="Công tắc PB${b}"><i></i><span>${b}</span></button>`).join("");
  btBox.innerHTML=[3,2,1,0].map(b=>`<button type="button" class="tr-t tr-k" data-b="${b}" aria-pressed="false" aria-label="Nút K${b}"><i></i><span>K${b}</span></button>`).join("");
  swBox.onclick=e=>{const t=e.target.closest("[data-b]");if(!t)return;ext.sw^=1<<+t.dataset.b;paint()};
  btBox.onclick=e=>{const t=e.target.closest("[data-b]");if(!t)return;ext.btn^=1<<+t.dataset.b;paint()};
  sec.querySelector(".tr-key").onclick=()=>{const M=sim.machine;if(M&&M.bd&&!M.done){M.bd.press();paint()}};
  const pre=$(".s-pre");if(pre)pre.addEventListener("change",()=>{apply(+pre.value);paint()});
  const dot=(on,cls)=>`<span class="tr-d${on?" on":""}${cls?" "+cls:""}"></span>`;
  function paint(){const M=sim.machine,bd=M&&M.bd;
    const leds=bd?bd.leds():0,lc=bd?bd.ledsC():0;
    const L=sec.querySelector(".tr-leds");L.innerHTML=[7,6,5,4,3,2,1,0].map(b=>dot((leds>>b)&1)).join("")+`<b>${h2(leds)}h</b>`;L.setAttribute("aria-label","LED PA7 đến PA0 = "+leds.toString(2).padStart(8,"0"));
    const C=sec.querySelector(".tr-ledc");C.innerHTML=[3,2,1,0].map(b=>dot((lc>>b)&1,"r")).join("");C.setAttribute("aria-label","LED đỏ PC3 đến PC0 = "+lc.toString(2).padStart(4,"0"));
    swBox.querySelectorAll("[data-b]").forEach(t=>{const on=(ext.sw>>+t.dataset.b)&1;t.classList.toggle("on",!!on);t.setAttribute("aria-pressed",on?"true":"false")});
    btBox.querySelectorAll("[data-b]").forEach(t=>{const on=(ext.btn>>+t.dataset.b)&1;t.classList.toggle("on",!!on);t.setAttribute("aria-pressed",on?"true":"false")});
    sec.querySelector(".tr-swv").textContent=`= ${h2(ext.sw)}h`;
    sec.querySelector(".tr-key").disabled=!(bd&&!M.done);
    const dv=sec.querySelector(".tr-dev");
    if(!bd){dv.innerHTML=`<p class="mem-empty">Bấm Từng bước hoặc Chạy: trainer bật nguồn, CPU bắt đầu ở FFFF0h. Trạng thái 8255A, 8254, 8259A, 8251A hiện ở đây.${ext.fault?" <b>Bo này có lỗi phần cứng giả lập</b> (xem ghi chú của ví dụ).":""}</p>`;
      sec.querySelector(".tr-log").innerHTML="";sec.querySelector(".tr-logn").textContent="";sec.querySelector(".tr-diag").hidden=true;sec.querySelector(".tr-time").textContent="";return}
    const d=bd.desc();
    dv.innerHTML=`<dt>8255A</dt><dd>${escH(d.ppi)}</dd><dt>8254</dt><dd>${escH(d.pit)}</dd><dt>8259A</dt><dd>${escH(d.pic)}</dd><dt>8251A</dt><dd>${escH(d.usart)}</dd>`;
    const ms=(d.cpuCyc+d.idle)/(T.MHZ*1000);
    sec.querySelector(".tr-time").textContent=`thời gian ${ms.toLocaleString("vi-VN",{maximumFractionDigits:3})} ms (CPU ${d.cpuCyc.toLocaleString("vi-VN")} ck + chờ HLT ${d.idle.toLocaleString("vi-VN")} ck)`;
    const lg=bd.log.slice(-8);sec.querySelector(".tr-logn").textContent=bd.S[K.LOGN]?`· ${bd.S[K.LOGN]} mục, 8 mục cuối`:"· chưa có";
    sec.querySelector(".tr-log").innerHTML=lg.map(e=>{const t=e.t.toLocaleString("vi-VN");
      const what=e.k==="IOR"?`IN ${h2(e.a)}h → ${h2(e.v)}h`:e.k==="IOW"?`OUT ${h2(e.a)}h ← ${h2(e.v)}h`:e.k==="INTA"?`INTA`:e.k==="IRQ"?`IR${e.a}`:e.k==="EOI"?`EOI`:`ghi ${e.a.toString(16).toUpperCase().padStart(5,"0")}h`;
      return`<li class="k-${e.k}"><span class="tr-lt">${t}</span><span class="tr-lw">${what}</span><span class="tr-ld">${escH(e.dev)}${e.x?" · "+escH(e.x):""}</span></li>`}).join("");
    const dg=sec.querySelector(".tr-diag"),n=[...bd.notes.values()];dg.hidden=!n.length;dg.innerHTML=n.length?`<b>Chẩn đoán từ trainer</b><ul>${n.slice(-6).map(x=>`<li>${escH(x)}</li>`).join("")}</ul>`:"";
    const L0=M.last;if(L0&&L0.intr!=null){const x=$(".xs-last");if(x)x.textContent=`nhận ngắt: vectơ ${h2(L0.intr)}h, ${T.INTR_CYC} chu kỳ (giả định) → ${h4(L0.vec.cs)}:${h4(L0.vec.ip)}`}}
  let raf=0;const later=()=>{if(raf)return;raf=(G.requestAnimationFrame||setTimeout)(()=>{raf=0;paint()})};
  if(G.MutationObserver)new MutationObserver(later).observe($(".xs-regs"),{childList:true,subtree:true});
  paint();
  sim.paintBoard=paint;sim.ext=ext;
  return sim};
G.makeX86TrainerEx=function(el,sim,list,opt){
  const ex=G.makeX86Ex(el,sim,list,opt);const ext=T.ext;
  const set0=()=>{const t=(list[ex.cur]&&list[ex.cur].tests||[])[0]||{};ext.sw=t.sw||0;ext.btn=t.btn||0;ext.fault=t.fault||null;sim.paintBoard&&sim.paintBoard()};
  ["try","load"].forEach(a=>{const b=el.querySelector(`[data-act="${a}"]`);if(b)b.addEventListener("click",set0,true)});
  return ex};
})(typeof window!=="undefined"?window:globalThis);
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

const LESSON_UPDATED={"l1": "2026-11-06T22:17:58Z", "l10": "2026-11-06T22:31:32Z", "l11": "2026-11-06T22:17:58Z", "l12": "2026-11-06T22:17:58Z", "l13": "2026-11-06T22:31:32Z", "l14": "2026-11-06T22:31:32Z", "l15": "2026-11-06T22:17:58Z", "l16": "2026-11-06T22:31:32Z", "l17": "2026-11-06T22:31:32Z", "l18": "2026-11-06T22:17:58Z", "l19": "2026-11-06T22:31:32Z", "l2": "2026-11-06T22:17:58Z", "l20": "2026-11-06T22:31:32Z", "l21": "2026-11-06T22:31:32Z", "l22": "2026-11-06T22:31:32Z", "l23": "2026-11-06T22:31:32Z", "l24": "2026-11-06T22:31:32Z", "l25": "2026-11-06T22:17:58Z", "l26": "2026-11-06T22:31:32Z", "l27": "2026-11-06T22:31:32Z", "l28": "2026-11-06T22:17:58Z", "l29": "2026-11-06T22:17:58Z", "l3": "2026-11-06T22:17:58Z", "l30": "2026-11-06T22:17:58Z", "l31": "2026-11-06T22:17:58Z", "l32": "2026-11-06T22:17:58Z", "l33": "2026-11-06T22:31:32Z", "l34": "2026-11-06T22:31:32Z", "l35": "2026-11-06T22:31:32Z", "l36": "2026-11-06T22:17:58Z", "l37": "2026-11-06T22:31:32Z", "l38": "2026-11-06T22:17:58Z", "l39": "2026-11-06T22:17:58Z", "l4": "2026-11-06T22:17:58Z", "l40": "2026-11-06T22:17:58Z", "l41": "2026-11-06T22:17:58Z", "l42": "2026-11-06T22:17:58Z", "l43": "2026-11-06T22:31:32Z", "l44": "2026-11-06T22:17:58Z", "l45": "2026-11-06T22:31:32Z", "l46": "2026-11-06T22:17:58Z", "l47": "2026-11-06T22:31:32Z", "l48": "2026-11-06T22:17:58Z", "l5": "2026-11-06T22:31:32Z", "l6": "2026-11-06T22:17:58Z", "l7": "2026-11-06T22:17:58Z", "l8": "2026-11-06T22:31:32Z", "l9": "2026-11-06T22:31:32Z"};
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
