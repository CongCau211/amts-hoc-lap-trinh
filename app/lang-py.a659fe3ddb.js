/* ================= TRÌNH MÔ PHỎNG PYTHON (khóa Giải thuật) =================
   Chạy một phần Python 3 đủ cho khóa học, ngay trên trình duyệt, nhẹ và chạy được từng bước.
   Mã nguồn → tách từ (lex) → cây cú pháp (parse) → mã máy dạng ngăn xếp (compile) → máy PyM chạy từng lệnh.
   Mỗi câu lệnh bắt đầu bằng một lệnh LINE: "Từng bước" = chạy tới LINE kế tiếp (kể cả LINE bên trong hàm được gọi).
   Giao diện dùng chung với trình mô phỏng C++ qua đối tượng LANGS.py (40-lang.js). */
const PY=(()=>{
"use strict";
class PErr extends Error{constructor(p,msg,vi,type,kind){super(msg);this.p=p;this.vi=vi||"";this.type=type||"SyntaxError";this.kind=kind||"compile"}}
const KWS=new Set("False None True and as assert async await break class continue def del elif else except finally for from global if import in is lambda nonlocal not or pass raise return try while with yield".split(" "));

/* ---------------- 1. tách từ ---------------- */
const OPS=["**=","//=",">>=","<<=","->","...","**","//","<<",">>","<=",">=","==","!=","+=","-=","*=","/=","%=","&=","|=","^=",":=","+","-","*","/","%","@","&","|","^","~","<",">","(",")","[","]","{","}",",",":",".",";","=","!"];
function lex(src){
  const T=[];let i=0,line=1,depth=0;const n=src.length;const ind=[0];let atStart=true;const br=[];
  const push=(t,v,p,ln)=>T.push({t,v,p,line:ln||line});
  while(i<n){
    if(atStart){ // đầu dòng logic: đo thụt lề
      let col=0,j=i;while(j<n&&(src[j]===" "||src[j]==="\t"||src[j]==="\f")){col=src[j]==="\t"?(col+8)-(col%8):col+1;j++}
      if(j>=n)break;
      if(src[j]==="\n"||src[j]==="#"||(src[j]==="\r")){ // dòng trống / chỉ có chú thích
        while(j<n&&src[j]!=="\n")j++;i=j+1;line++;continue}
      if(src[j]==="\\"&&src[j+1]==="\n"){i=j+2;line++;continue}
      atStart=false;i=j;
      if(col>ind[ind.length-1]){ind.push(col);push("indent",col,i)}
      else{while(col<ind[ind.length-1]){ind.pop();push("dedent",col,i)}
        if(col!==ind[ind.length-1])throw new PErr(i,"unindent does not match any outer indentation level","Thụt lề của dòng này không khớp với khối nào ở trên. Các dòng cùng một khối phải thụt vào bằng nhau (nên dùng 4 dấu cách).","IndentationError")}
    }
    const c=src[i];
    if(c===" "||c==="\t"||c==="\r"||c==="\f"){i++;continue}
    if(c==="#"){while(i<n&&src[i]!=="\n")i++;continue}
    if(c==="\\"&&src[i+1]==="\n"){i+=2;line++;continue}
    if(c==="\n"){if(depth===0){push("nl","",i);atStart=true}i++;line++;continue}
    // chuỗi (có thể có tiền tố r, f, b, u)
    let m=/^([rRfFbBuU]{0,2})("""|'''|"|')/.exec(src.slice(i,i+5));
    if(m&&(m[1]===""||/^[A-Za-z]+$/.test(m[1]))&&/^(|r|f|b|u|rf|fr|br|rb)$/i.test(m[1])){
      const pre=m[1].toLowerCase(),q=m[2],st=i,ln0=line;let j=i+m[0].length,raw=pre.includes("r"),fs=pre.includes("f");
      if(pre.includes("b"))throw new PErr(i,"bytes literals are not supported","Chuỗi byte (b'...') chưa có trong trình mô phỏng.","SyntaxError","unsup");
      let s="";
      for(;;){
        if(j>=n||(q.length===1&&src[j]==="\n"))throw new PErr(st,q.length===3?"unterminated triple-quoted string literal (detected at line "+line+")":"unterminated string literal (detected at line "+ln0+")","Chuỗi chưa được đóng: thiếu dấu "+q+" ở cuối.","SyntaxError");
        if(src.startsWith(q,j)){j+=q.length;break}
        const ch=src[j];
        if(ch==="\\"&&!raw){const e=src[j+1];j+=2;
          if(e==="n")s+="\n";else if(e==="t")s+="\t";else if(e==="r")s+="\r";else if(e==="\\")s+="\\";else if(e==="'")s+="'";else if(e==='"')s+='"';else if(e==="0")s+="\0";else if(e==="a")s+="\x07";else if(e==="b")s+="\b";else if(e==="f")s+="\f";else if(e==="v")s+="\v";
          else if(e==="\n"){line++}
          else if(e==="x"){s+=String.fromCharCode(parseInt(src.substr(j,2),16));j+=2}
          else if(e==="u"){s+=String.fromCharCode(parseInt(src.substr(j,4),16));j+=4}
          else{s+="\\"+e}
          continue}
        if(ch==="\\"&&raw){s+=ch+(src[j+1]||"");if(src[j+1]==="\n")line++;j+=2;continue}
        if(ch==="\n")line++;
        s+=ch;j++}
      push(fs?"fstr":"str",s,st,ln0);if(fs)T[T.length-1].raw=raw;i=j;continue}
    m=/^(?:0[xX][\da-fA-F_]+|0[bB][01_]+|0[oO][0-7_]+|(?:\d[\d_]*\.?[\d_]*|\.\d[\d_]*)(?:[eE][+-]?\d+)?)/.exec(src.slice(i,i+80));
    if(m&&m[0]&&m[0]!=="."){let s=m[0].replace(/_/g,"");let v;
      if(/^0[xXbBoO]/.test(s))v=normInt(BigInt(s));
      else if(/[.eE]/.test(s))v=new PyFloat(parseFloat(s));
      else{if(/^0\d/.test(s)&&/[1-9]/.test(s))throw new PErr(i,"leading zeros in decimal integer literals are not permitted; use an 0o prefix for octal integers","Python không cho viết số nguyên có số 0 ở đầu (như 012).");v=normInt(BigInt(s))}
      if(/^[A-Za-z_]/.test(src[i+m[0].length]||""))throw new PErr(i,"invalid decimal literal","Số viết liền với chữ: hãy kiểm tra lại (ví dụ 2x phải viết 2*x).");
      push("num",v,i);i+=m[0].length;continue}
    m=/^[A-Za-z_\u00C0-\u1EF9][\w\u00C0-\u1EF9]*/.exec(src.slice(i,i+120));
    if(m){push(KWS.has(m[0])?"kw":"name",m[0],i);i+=m[0].length;continue}
    let op=null;for(const o of OPS)if(src.startsWith(o,i)){op=o;break}
    if(!op)throw new PErr(i,`invalid character '${c}' (U+${c.charCodeAt(0).toString(16).toUpperCase().padStart(4,"0")})`,"Ký tự này không dùng được trong code Python. Kiểm tra lại dấu nháy, dấu ngoặc có bị gõ thành ký tự đặc biệt (nhất là khi chép từ Word) không.");
    if(op==="("||op==="["||op==="{"){depth++;br.push({op,p:i})}
    if(op===")"||op==="]"||op==="}"){const o=br.pop();const want={")":"(","]":"[","}":"{"}[op];
      if(!o)throw new PErr(i,`unmatched '${op}'`,"Có dấu đóng ngoặc thừa.");
      if(o.op!==want)throw new PErr(i,`closing parenthesis '${op}' does not match opening parenthesis '${o.op}'`,"Dấu đóng ngoặc không khớp với dấu mở ngoặc.");depth--}
    push("op",op,i);i+=op.length}
  if(br.length){const o=br[br.length-1];throw new PErr(o.p,`'${o.op}' was never closed`,"Dấu mở ngoặc này chưa được đóng.")}
  if(!atStart)push("nl","",n);
  while(ind.length>1){ind.pop();push("dedent",0,n)}
  push("eof","",n);return T}

/* ---------------- giá trị ---------------- */
class PyFloat{constructor(v){this.v=v}}
class PyList{constructor(a){this.a=a||[]}}
class PyTuple{constructor(a){this.a=a||[]}}
class PyDict{constructor(){this.m=new Map()}} // khóa băm → [khóa, giá trị]
class PySet{constructor(){this.m=new Map()}}
class PyRange{constructor(a,b,c){this.a=a;this.b=b;this.c=c}}
class PyFunc{constructor(code,env,defs,name){this.code=code;this.env=env;this.defs=defs;this.name=name}}
class PyBuiltin{constructor(name,fn,o){this.name=name;this.fn=fn;Object.assign(this,o||{})}}
class PyMod{constructor(name,attrs){this.name=name;this.attrs=attrs}}
class PyType{constructor(name,call,o){this.name=name;this.call=call;if(o)Object.assign(this,o)}}
class PyIter{constructor(a){this.a=a;this.i=0}}
class PyDeque{constructor(a){this.a=a||[]}}
class PyExcV{constructor(type,args){this.type=type;this.args=args||[]}}
/* lỗi Python lúc chạy (ném qua JS rồi được máy chuyển thành raise) */
class PyExc{constructor(type,msg,vi){this.type=type;this.msg=msg;this.vi=vi||""}}
const raise=(type,msg,vi)=>{throw new PyExc(type,msg,vi)};
const SAFE=Number.MAX_SAFE_INTEGER;
function normInt(b){return b>=-SAFE&&b<=SAFE?Number(b):b}
const isInt=v=>typeof v==="number"||typeof v==="bigint"||typeof v==="boolean";
const isNum=v=>isInt(v)||v instanceof PyFloat;
const toNum=v=>v instanceof PyFloat?v.v:typeof v==="bigint"?Number(v):typeof v==="boolean"?+v:v;
const toBig=v=>typeof v==="bigint"?v:BigInt(typeof v==="boolean"?+v:v);
const ib=v=>typeof v==="boolean"?+v:v;
function tname(v){if(v===null)return "NoneType";switch(typeof v){case "number":case "bigint":return "int";case "boolean":return "bool";case "string":return "str"}
  if(v instanceof PyFloat)return "float";if(v instanceof PyList)return "list";if(v instanceof PyTuple)return "tuple";if(v instanceof PyDict)return v.dd?"collections.defaultdict":v.ctr?"Counter":"dict";if(v instanceof PySet)return "set";
  if(v instanceof PyRange)return "range";if(v instanceof PyFunc)return "function";if(v instanceof PyBuiltin)return "builtin_function_or_method";if(v instanceof PyMod)return "module";if(v instanceof PyType)return "type";
  if(v instanceof PyIter)return "iterator";if(v instanceof PyDeque)return "collections.deque";if(v instanceof PyExcV)return v.type;return "object"}

/* ---------------- 2. cây cú pháp ---------------- */
function parse(src){
  const T=lex(src);let k=0;
  const pk=(o=0)=>T[k+o],nx=()=>T[k++];
  const is=(v,o=0)=>{const t=T[k+o];return t&&(t.t==="op"||t.t==="kw")&&t.v===v};
  const desc=t=>t.t==="eof"?"end of file":t.t==="nl"?"newline":t.t==="indent"?"indent":t.t==="dedent"?"dedent":`'${t.v}'`;
  function err(t,msg,vi,type){throw new PErr(t.p,msg,vi,type)}
  function expect(v,vi){if(is(v))return nx();const t=pk();
    if(v===":"&&t.t==="op"&&t.v==="{")err(t,"expected ':'","Python không dùng { } để mở khối lệnh: kết thúc dòng bằng dấu “:”, rồi xuống dòng và thụt lề các lệnh bên trong.");
    if(v===":"&&t.t==="kw"&&t.v==="if"&&T[k-1]&&T[k-1].v==="else")err(t,"expected ':'","Python viết elif thay cho else if.");
    if(v===":")err(t,"expected ':'",vi||"Thiếu dấu hai chấm “:” ở cuối dòng. Sau if, elif, else, for, while, def… phải có dấu “:”.");
    if(v===")")err(t,t.t==="nl"?"'(' was never closed":"invalid syntax. Perhaps you forgot a comma?",vi||"Thiếu dấu đóng ngoặc “)” hoặc thiếu dấu phẩy giữa các giá trị.");
    err(t,`expected '${v}'`,vi||`Ở đây cần dấu “${v}”.`)}
  function invalid(t,vi){
    const p1=T[k-1],p2=T[k-2];
    if(p1&&p2&&p1.t==="op"&&p2.t==="op"&&((p1.v==="+"&&p2.v==="+")||(p1.v==="-"&&p2.v==="-")))err(p2,"invalid syntax","Python không có toán tử ++ và --. Hãy viết i += 1 hoặc i -= 1.");
    if(p1&&p1.t==="op"&&p1.v==="&"&&t.t==="op"&&t.v==="&"||p1&&p1.t==="op"&&p1.v==="&"&&p2&&p2.t==="op"&&p2.v==="&")err(t,"invalid syntax","Python dùng chữ and thay cho &&.");
    if(p1&&p1.t==="op"&&p1.v==="|"&&t.t==="op"&&t.v==="|")err(t,"invalid syntax","Python dùng chữ or thay cho ||.");
    if(t.t==="op"&&(t.v==="+"&&is("+",1)||t.v==="-"&&is("-",1)))err(t,"invalid syntax","Python không có toán tử ++ và --. Hãy viết i += 1 hoặc i -= 1.");
    if(t.t==="op"&&t.v==="&"&&is("&",1))err(t,"invalid syntax","Python dùng chữ and thay cho &&.");
    if(t.t==="op"&&t.v==="|"&&is("|",1))err(t,"invalid syntax","Python dùng chữ or thay cho ||.");
    if(t.t==="op"&&t.v==="!")err(t,"invalid syntax","Python dùng chữ not thay cho dấu !. Ví dụ: if not ok:");
    if(t.t==="op"&&t.v==="{")err(t,"invalid syntax","Python không dùng { } để mở khối lệnh: viết dấu “:” rồi xuống dòng và thụt lề.");
    if(t.t==="indent")err(t,"unexpected indent","Dòng này bị thụt lề nhưng không nằm trong khối nào (không có if/for/def… ở trên kết thúc bằng “:”). Hãy bỏ thụt lề.","IndentationError");
    err(t,"invalid syntax",vi||"Câu lệnh viết chưa đúng cú pháp Python.")}
  const L=t=>({p:t.p,line:t.line});
  /* ---- biểu thức ---- */
  function test(){ // biểu thức đầy đủ (có lambda, a if c else b)
    if(is("lambda")){const t=nx();const ps=params(":");expect(":");const body=test();return{k:"Lambda",ps,body,...L(t)}}
    const t=pk();const a=orTest();
    if(is("if")&&!noTernary){nx();const c=orTest();if(!is("else"))err(pk(),"expected 'else' after 'if' expression","Biểu thức “a if điều_kiện else b” thiếu phần else.");nx();const b=test();return{k:"IfExp",c,a,b,...L(t)}}
    if(is(":=")){const w=nx();if(a.k!=="Name")err(w,"cannot use assignment expressions with "+a.k,"Toán tử := chỉ gán cho một tên biến.");const v=test();return{k:"Walrus",n:a.n,e:v,...L(w)}}
    return a}
  let noTernary=false;
  function orTest(){let a=andTest();if(!is("or"))return a;const vals=[a];const t=pk();while(is("or")){nx();vals.push(andTest())}return{k:"Bool",op:"or",vals,...L(t)}}
  function andTest(){let a=notTest();if(!is("and"))return a;const vals=[a];const t=pk();while(is("and")){nx();vals.push(notTest())}return{k:"Bool",op:"and",vals,...L(t)}}
  function notTest(){if(is("not")){const t=nx();return{k:"Not",a:notTest(),...L(t)}}return comparison()}
  const CMP=["<",">","==",">=","<=","!="];
  function comparison(){const a=bitor();const ops=[];
    for(;;){const t=pk();let op=null;
      if(t.t==="op"&&CMP.includes(t.v)){nx();op=t.v}
      else if(is("in")){nx();op="in"}
      else if(is("not")&&is("in",1)){nx();nx();op="not in"}
      else if(is("is")){nx();if(is("not")){nx();op="is not"}else op="is"}
      else if(t.t==="op"&&t.v==="="&&false){}
      else break;
      ops.push([op,bitor(),t])}
    return ops.length?{k:"Cmp",a,ops,p:a.p,line:a.line}:a}
  const bin=(next,ops)=>function(){let a=next();for(;;){const t=pk();if(t.t==="op"&&ops.includes(t.v)&&!(t.v==="*"&&false)){nx();const b=next();a={k:"Bin",op:t.v,a,b,...L(t)}}else return a}};
  const factor=()=>{const t=pk();if(t.t==="op"&&(t.v==="-"||t.v==="+"||t.v==="~")){nx();return{k:"Un",op:t.v,a:factor(),...L(t)}}return power()};
  const term=bin(factor,["*","/","//","%","@"]),arith=bin(term,["+","-"]),shift=bin(arith,["<<",">>"]),band=bin(shift,["&"]),bxor=bin(band,["^"]),bitor=bin(bxor,["|"]);
  function power(){const a=trailers(atom());if(is("**")){const t=nx();return{k:"Bin",op:"**",a,b:factor(),...L(t)}}return a}
  function trailers(a){
    for(;;){
      if(is("(")){const t=nx();const{args,kw}=callArgs();a={k:"Call",f:a,args,kw,...L(t)};continue}
      if(is("[")){const t=nx();const idx=subscript();expect("]");a={k:"Sub",o:a,i:idx,...L(t)};continue}
      if(is(".")){const t=nx();const nm=nx();if(nm.t!=="name"&&nm.t!=="kw")err(nm,"invalid syntax","Sau dấu chấm phải là tên thuộc tính hoặc hàm.");a={k:"Attr",o:a,n:nm.v,...L(t)};continue}
      return a}}
  function subscript(){
    const one=()=>{const t=pk();let lo=null,hi=null,st=null;
      if(!is(":"))lo=test();
      if(is(":")){nx();if(!is("]")&&!is(":")&&!is(","))hi=test();if(is(":")){nx();if(!is("]")&&!is(","))st=test()}return{k:"Slice",lo,hi,st,...L(t)}}
      return lo};
    const a=one();if(is(",")){const items=[a];while(is(",")){nx();if(is("]"))break;items.push(one())}return{k:"Tuple",items,p:a.p,line:a.line}}return a}
  function callArgs(){const args=[],kw=[];
    while(!is(")")){
      if(is("*")){const t=nx();args.push({k:"Star",e:test(),...L(t)})}
      else if(is("**")){const t=nx();kw.push({dstar:test(),...L(t)})}
      else if(pk().t==="name"&&is("=",1)){const n=nx().v;nx();kw.push({n,e:test()})}
      else{const e=test();
        if(is("for")){const gens=compFor();args.push({k:"Comp",kind:"gen",e,gens,p:e.p,line:e.line})}else{if(kw.length&&!kw[kw.length-1].dstar)err(pk(),"positional argument follows keyword argument","Đối số không tên phải đứng trước các đối số có tên (key=...).");args.push(e)}}
      if(!is(",")){if(!is(")"))expect(")");break}nx()}
    nx();return{args,kw}}
  function compFor(){const gens=[];
    while(is("for")){nx();const t=targetList();if(!is("in"))err(pk(),"invalid syntax","Thiếu chữ in trong vòng for của biểu thức rút gọn.");nx();noTernary=true;const it=orTest();noTernary=false;const ifs=[];
      while(is("if")){nx();noTernary=true;ifs.push(orTest());noTernary=false}gens.push({t,it,ifs})}
    return gens}
  function targetList(){const t=pk();const one=()=>{if(is("*")){const s=nx();return{k:"Star",e:trailers(atom()),...L(s)}}return trailers(atom())};const a=one();
    if(is(",")){const items=[a];while(is(",")){nx();if(is("in")||is("="))break;items.push(one())}return{k:"Tuple",items,...L(t)}}return a}
  function atom(){const t=pk();
    if(t.t==="num"){nx();return{k:"Const",v:t.v,...L(t)}}
    if(t.t==="str"||t.t==="fstr"){ // các chuỗi viết liền nhau được nối lại
      const parts=[];while(pk().t==="str"||pk().t==="fstr"){const s=nx();if(s.t==="str")parts.push(s.v);else parts.push(...fparts(s))}
      if(parts.every(x=>typeof x==="string"))return{k:"Const",v:parts.join(""),...L(t)};
      return{k:"FStr",parts,...L(t)}}
    if(t.t==="name"){nx();return{k:"Name",n:t.v,...L(t)}}
    if(t.t==="kw"){
      if(t.v==="True"||t.v==="False"){nx();return{k:"Const",v:t.v==="True",...L(t)}}
      if(t.v==="None"){nx();return{k:"Const",v:null,...L(t)}}
      if(t.v==="yield"||t.v==="await")err(t,`'${t.v}' chưa hỗ trợ`,"yield (hàm sinh) chưa có trong trình mô phỏng.","SyntaxError");
      err(t,"invalid syntax",`“${t.v}” là từ khóa của Python, không dùng làm tên biến hay đặt ở vị trí này được.`)}
    if(is("(")){nx();if(is(")")){nx();return{k:"Tuple",items:[],...L(t)}}
      const first=is("*")?(()=>{const s=nx();return{k:"Star",e:bitor(),...L(s)}})():test();
      if(is("for")){const gens=compFor();expect(")");return{k:"Comp",kind:"gen",e:first,gens,...L(t)}}
      if(is(",")){const items=[first];while(is(",")){nx();if(is(")"))break;items.push(is("*")?(()=>{const s=nx();return{k:"Star",e:bitor(),...L(s)}})():test())}expect(")");return{k:"Tuple",items,...L(t)}}
      expect(")");return{k:"Paren",e:first,...L(t)}}
    if(is("[")){nx();if(is("]")){nx();return{k:"List",items:[],...L(t)}}
      const first=is("*")?(()=>{const s=nx();return{k:"Star",e:bitor(),...L(s)}})():test();
      if(is("for")){const gens=compFor();expect("]");return{k:"Comp",kind:"list",e:first,gens,...L(t)}}
      const items=[first];while(is(",")){nx();if(is("]"))break;items.push(is("*")?(()=>{const s=nx();return{k:"Star",e:bitor(),...L(s)}})():test())}
      if(!is("]"))err(pk(),"invalid syntax. Perhaps you forgot a comma?","Các phần tử trong [ ] phải cách nhau bằng dấu phẩy.");nx();return{k:"List",items,...L(t)}}
    if(is("{")){nx();if(is("}")){nx();return{k:"Dict",keys:[],vals:[],...L(t)}}
      if(is("**"))err(pk(),"** trong { } chưa hỗ trợ","Cú pháp {**d} chưa có trong trình mô phỏng; hãy dùng d.copy() và update().","SyntaxError");
      const first=test();
      if(is(":")){nx();const v=test();
        if(is("for")){const gens=compFor();expect("}");return{k:"Comp",kind:"dict",e:first,v,gens,...L(t)}}
        const keys=[first],vals=[v];while(is(",")){nx();if(is("}"))break;keys.push(test());expect(":");vals.push(test())}expect("}");return{k:"Dict",keys,vals,...L(t)}}
      if(is("for")){const gens=compFor();expect("}");return{k:"Comp",kind:"set",e:first,gens,...L(t)}}
      const items=[first];while(is(",")){nx();if(is("}"))break;items.push(test())}expect("}");return{k:"SetD",items,...L(t)}}
    if(t.t==="op"&&t.v==="...")err(t,"... chưa hỗ trợ","Dấu ... (Ellipsis) chưa có trong trình mô phỏng.");
    invalid(t)}
  /* f-string: tách phần chữ và phần {biểu thức!r:định dạng} */
  function fparts(tok){const s=tok.v,out=[];let i=0,lit="";
    while(i<s.length){const c=s[i];
      if(c==="{"&&s[i+1]==="{"){lit+="{";i+=2;continue}
      if(c==="}"&&s[i+1]==="}"){lit+="}";i+=2;continue}
      if(c==="}")throw new PErr(tok.p,"f-string: single '}' is not allowed","Trong f-string, muốn in dấu } thì viết }}.");
      if(c!=="{"){lit+=c;i++;continue}
      if(lit){out.push(lit);lit=""}
      let j=i+1,d=0,q=null;
      for(;j<s.length;j++){const x=s[j];if(q){if(x===q)q=null;continue}if(x==="'"||x==='"'){q=x;continue}
        if(x==="("||x==="["||x==="{")d++;else if(x===")"||x==="]"||(x==="}"&&d>0))d--;else if(d===0&&(x==="}"||x===":"||x==="!"&&s[j+1]!=="="))break}
      let expr=s.slice(i+1,j),conv=null,spec=null,eq=false;
      if(/=\s*$/.test(expr)&&!/[=!<>]=\s*$/.test(expr)){eq=true}
      if(s[j]==="!"){conv=s[j+1];j+=2}
      if(s[j]===":"){let k2=j+1,dd=0;for(;k2<s.length;k2++){if(s[k2]==="{")dd++;else if(s[k2]==="}"){if(dd===0)break;dd--}}spec=s.slice(j+1,k2);j=k2}
      if(s[j]!=="}")throw new PErr(tok.p,"f-string: expecting '}'","f-string thiếu dấu } đóng phần biểu thức.");
      const ex=eq?expr.replace(/=\s*$/,""):expr;
      if(!ex.trim())throw new PErr(tok.p,"f-string: valid expression required before '}'","Trong { } của f-string phải có một biểu thức.");
      let e;try{const sub=parse("("+ex+")\n");const st=sub.body[0];if(!st||st.k!=="Expr")throw 0;e=st.e.k==="Paren"?st.e.e:st.e}catch(x){throw new PErr(tok.p,"f-string: invalid syntax",x&&x.vi?"Biểu thức trong f-string viết chưa đúng: "+x.vi:"Biểu thức trong f-string viết chưa đúng.")}
      fixPos(e,tok);
      if(eq)out.push(expr);
      out.push({e,conv:conv||(eq&&!spec?"r":null),spec:spec==null?null:spec.includes("{")?fparts({v:spec,p:tok.p,line:tok.line}):[spec]});i=j+1}
    if(lit)out.push(lit);return out}
  function fixPos(e,tok){if(!e||typeof e!=="object")return;if("p" in e){e.p=tok.p;e.line=tok.line}for(const k in e){const v=e[k];if(v&&typeof v==="object"&&k!=="v")Array.isArray(v)?v.forEach(x=>fixPos(x,tok)):fixPos(v,tok)}}
  function params(end){const ps=[];let seenDef=false,star=false;
    while(!is(end)){const t=pk();
      if(is("*")){nx();if(pk().t==="name"){ps.push({n:nx().v,star:1});star=true}else{star=true}}
      else if(is("**")){nx();ps.push({n:nx().v,star:2})}
      else{if(t.t!=="name")err(t,"invalid syntax","Tên tham số không hợp lệ.");nx();let d=null;
        if(is(":")&&end===")"){nx();test()} // chú thích kiểu: bỏ qua
        if(is("=")){nx();d=test();seenDef=true}else if(seenDef&&!star)err(t,"parameter without a default follows parameter with a default","Tham số không có giá trị mặc định phải đứng trước các tham số có giá trị mặc định.");
        ps.push({n:t.v,d,kwonly:star})}
      if(!is(","))break;nx()}
    return ps}
  /* ---- câu lệnh ---- */
  function exprList(){const t=pk();const one=()=>{if(is("*")){const s=nx();return{k:"Star",e:bitor(),...L(s)}}return test()};const a=one();
    if(is(",")){const items=[a];while(is(",")){nx();if(endOfSimple()||is("="))break;items.push(one())}return{k:"Tuple",items,...L(t)}}return a}
  const endOfSimple=()=>pk().t==="nl"||is(";")||pk().t==="eof";
  function block(kw,t0){
    if(pk().t!=="nl"){const st=simpleLine();return st} // if x: lenh
    nx();if(pk().t!=="indent")err(pk(),`expected an indented block after ${kw} on line ${t0.line}`,`Sau dòng ${kw.replace(/'/g,"").replace(/ statement$/,"").replace("function definition","def")} (dòng ${t0.line}) phải có ít nhất một dòng thụt lề vào trong. Nếu chưa muốn viết gì, dùng lệnh pass.`,"IndentationError");
    nx();const body=[];while(pk().t!=="dedent"&&pk().t!=="eof")body.push(...stmt());if(pk().t==="dedent")nx();return body}
  function simpleLine(){const out=[simple()];while(is(";")){nx();if(pk().t==="nl")break;out.push(simple())}
    if(pk().t!=="nl"&&pk().t!=="eof"){const t=pk();
      if(t.t!=="op"&&out[out.length-1].k==="Expr"&&out[out.length-1].e.k==="Name"&&out[out.length-1].e.n==="print")err(t,"Missing parentheses in call to 'print'. Did you mean print(...)?","Python 3 viết print có dấu ngoặc: print(x).");
      invalid(t)}
    if(pk().t==="nl")nx();return out}
  const AUG=["+=","-=","*=","/=","//=","%=","**=","&=","|=","^=",">>=","<<="];
  function checkTarget(e,t,aug){
    if(e.k==="Name"||e.k==="Sub"||e.k==="Attr")return;
    if(!aug&&(e.k==="Tuple"||e.k==="List")){e.items.forEach(x=>checkTarget(x.k==="Star"?x.e:x,t));return}
    if(e.k==="Paren")return checkTarget(e.e,t,aug);
    if(e.k==="Call")err(t,"cannot assign to function call here. Maybe you meant '==' instead of '='?","Không gán giá trị cho lời gọi hàm được. Nếu muốn so sánh, dùng ==.");
    if(e.k==="Const")err(t,"cannot assign to literal here. Maybe you meant '==' instead of '='?","Không gán giá trị cho một hằng số được. Nếu muốn so sánh, dùng ==.");
    err(t,"cannot assign to expression here. Maybe you meant '==' instead of '='?","Bên trái dấu = phải là tên biến (hoặc phần tử a[i]). Nếu muốn so sánh, dùng ==.")}
  function simple(){const t=pk();
    if(t.t==="kw"){
      switch(t.v){
        case "pass":nx();return{k:"Pass",...L(t)};
        case "break":nx();return{k:"Break",...L(t)};
        case "continue":nx();return{k:"Continue",...L(t)};
        case "return":{nx();const e=endOfSimple()?null:exprList();return{k:"Return",e,...L(t)}}
        case "global":case "nonlocal":{nx();const ns=[nx().v];while(is(",")){nx();ns.push(nx().v)}return{k:t.v==="global"?"Global":"Nonlocal",ns,...L(t)}}
        case "del":{nx();const e=exprList();return{k:"Del",ts:e.k==="Tuple"?e.items:[e],...L(t)}}
        case "import":{nx();const ns=[];do{if(is(","))nx();let m=nx().v;while(is(".")){nx();m+="."+nx().v}let as=null;if(is("as")){nx();as=nx().v}ns.push([m,as])}while(is(","));return{k:"Import",ns,...L(t)}}
        case "from":{nx();let m=nx().v;while(is(".")){nx();m+="."+nx().v}if(!is("import"))err(pk(),"invalid syntax","Cú pháp đúng: from tên_thư_viện import tên");nx();const ns=[];
          const par=is("(");if(par)nx();
          do{if(is(","))nx();if(par&&is(")"))break;if(is("*")){nx();ns.push(["*",null]);continue}const n=nx().v;let as=null;if(is("as")){nx();as=nx().v}ns.push([n,as])}while(is(","));if(par)expect(")");return{k:"From",m,ns,...L(t)}}
        case "assert":{nx();const c=test();let msg=null;if(is(",")){nx();msg=test()}return{k:"Assert",c,msg,...L(t)}}
        case "raise":{nx();const e=endOfSimple()?null:test();if(is("from")){nx();test()}return{k:"Raise",e,...L(t)}}
        case "else":case "elif":err(t,"invalid syntax",`“${t.v}” không đi cùng if nào ở trên với cùng mức thụt lề. Kiểm tra thụt lề của ${t.v} phải bằng thụt lề của if.`);
        case "except":case "finally":err(t,"invalid syntax",`“${t.v}” phải đi sau khối try có cùng mức thụt lề.`);
      }}
    const e=exprList();
    if(is("=")){const targets=[e];checkTarget(e,pk());let v;
      while(is("=")){nx();v=pk().t==="kw"&&pk().v==="yield"?atom():exprList();if(is("=")){checkTarget(v,pk());targets.push(v)}}
      return{k:"Assign",ts:targets,e:v,...L(t)}}
    if(pk().t==="op"&&AUG.includes(pk().v)){const op=nx().v;checkTarget(e,t,true);if(e.k==="Tuple")err(t,"'tuple' is an illegal expression for augmented assignment","Không dùng += cho nhiều biến cùng lúc.");return{k:"Aug",t:e,op:op.slice(0,-1),e:exprList(),...L(t)}}
    if(is(":")&&e.k==="Name"){nx();test();if(is("=")){nx();return{k:"Assign",ts:[e],e:exprList(),...L(t)}}return{k:"Pass",...L(t)}} // a: int = 5
    if(pk().t==="op"&&(pk().v==="+"||pk().v==="-")&&is(pk().v,1))invalid(pk());
    return{k:"Expr",e,...L(t)}}
  function stmt(){const t=pk();
    if(t.t==="indent")invalid(t);
    if(t.t==="op"&&t.v==="@"){const decos=[];while(is("@")){nx();decos.push(test());if(pk().t==="nl")nx()}if(!is("def"))err(pk(),"invalid syntax","Sau @ (decorator) phải là một hàm def.");const f=stmt()[0];f.decos=decos;return[f]}
    if(t.t==="kw")switch(t.v){
      case "if":{nx();const tests=[];const c=namedTest();expect(":");tests.push([c,block("'if' statement",t)]);let els=null;
        while(is("elif")){const t2=nx();const c2=namedTest();expect(":");tests.push([c2,block("'elif' statement",t2)])}
        if(is("else")){const t2=nx();expect(":");els=block("'else' statement",t2)}
        return[{k:"If",tests,els,...L(t)}]}
      case "while":{nx();const c=namedTest();expect(":");const body=block("'while' statement",t);let els=null;if(is("else")){const t2=nx();expect(":");els=block("'else' statement",t2)}return[{k:"While",c,body,els,...L(t)}]}
      case "for":{nx();const tg=targetList();checkTarget(tg,t);if(!is("in"))err(pk(),"invalid syntax","Vòng for của Python viết: for biến in dãy:  (ví dụ for i in range(n):). Không viết kiểu for (i = 0; i < n; i++).");nx();const it=exprList();expect(":");const body=block("'for' statement",t);let els=null;if(is("else")){const t2=nx();expect(":");els=block("'else' statement",t2)}return[{k:"For",t:tg,it,body,els,...L(t)}]}
      case "def":{nx();const nm=nx();if(nm.t!=="name")err(nm,"invalid syntax","Sau def phải là tên hàm.");if(!is("("))err(pk(),"expected '('","Định nghĩa hàm cần dấu ngoặc: def ten_ham(tham_so):");nx();const ps=params(")");expect(")");if(is("->")){nx();test()}expect(":");const body=block(`function definition`,t);return[{k:"Def",n:nm.v,ps,body,decos:[],...L(t)}]}
      case "try":{nx();expect(":");const body=block("'try' statement",t);const hs=[];let els=null,fin=null;
        while(is("except")){const t2=nx();let ty=null,as=null;if(!is(":")){ty=test();if(is("as")){nx();as=nx().v}}expect(":");hs.push({ty,as,body:block("'except' statement",t2),...L(t2)})}
        if(is("else")){const t2=nx();expect(":");els=block("'else' statement",t2)}
        if(is("finally")){const t2=nx();expect(":");fin=block("'finally' statement",t2)}
        if(!hs.length&&!fin)err(pk(),"expected 'except' or 'finally' block","Sau khối try phải có except hoặc finally.");
        return[{k:"Try",body,hs,els,fin,...L(t)}]}
      case "class":throw new PErr(t.p,"class chưa hỗ trợ","Lớp (class) chưa có trong trình mô phỏng. Khóa học dùng hàm, list, dict, tuple là đủ.","SyntaxError","unsup");
      case "with":throw new PErr(t.p,"with chưa hỗ trợ","Lệnh with (mở file…) chưa có trong trình mô phỏng.","SyntaxError","unsup");
      case "async":throw new PErr(t.p,"async chưa hỗ trợ","async/await chưa có trong trình mô phỏng.","SyntaxError","unsup");
      case "match":break;
    }
    return simpleLine()}
  function namedTest(){const e=test();if(is("=")&&!is("=",1))err(pk(),"invalid syntax. Maybe you meant '==' or ':=' instead of '='?","Trong điều kiện, so sánh bằng phải viết == (hai dấu bằng).");return e}
  const body=[];while(pk().t!=="eof"){if(pk().t==="nl"){nx();continue}body.push(...stmt())}
  return{k:"Module",body}}

return{PErr,lex,parse,PyFloat,PyList,PyTuple,PyDict,PySet,PyRange,PyFunc,PyBuiltin,PyMod,PyType,PyIter,PyDeque,PyExcV,PyExc,raise,normInt,isInt,isNum,toNum,toBig,ib,tname};
})();

/* ---------------- 3. biên dịch cây cú pháp → mã máy ngăn xếp ---------------- */
const PYC=(()=>{
"use strict";
const {PErr}=PY;
let OPN=0;const O={};
"LINE CONST LOADL STOREL DELL LOADD STORED LOADG STOREG DELG POP DUP DUP2 ROT2 ROT3 BIN INPL UN NOT CMP JMP JIF JIT JIFK JITK BLIST BTUPLE BSET BDICT LEXT LAPP SADD MADD SUB STSUB DELSUB SLICE ATTR STATTR CALL CALLX RET ITER FOR UNPACK MKFN IMPORT IMPFROM FMT BSTR TRY POPTRY EXCM RERAISE RAISE ENDEXC ASSERTF LISTTOTUPLE STARCHK NOP WALRUS".split(" ").forEach(n=>O[n]=OPN++);
/* phân tích phạm vi: tên nào là biến cục bộ của hàm */
function scan(body,acc){
  const add=n=>acc.asg.add(n);
  const tgt=e=>{if(!e)return;if(e.k==="Name")add(e.n);else if(e.k==="Tuple"||e.k==="List")e.items.forEach(x=>tgt(x.k==="Star"?x.e:x));else if(e.k==="Paren")tgt(e.e)};
  const ex=e=>{if(!e||typeof e!=="object")return;if(Array.isArray(e)){e.forEach(ex);return}
    if(e.k==="Walrus")add(e.n);if(e.k==="Lambda"||e.k==="Comp"){if(e.k==="Comp")ex(e.gens[0].it);return}
    for(const k in e){const v=e[k];if(v&&typeof v==="object")ex(v)}};
  for(const s of body){
    switch(s.k){
      case "Assign":s.ts.forEach(tgt);ex(s.e);s.ts.forEach(ex);break;
      case "Aug":tgt(s.t);ex(s.e);ex(s.t);break;
      case "For":tgt(s.t);ex(s.it);scan(s.body,acc);if(s.els)scan(s.els,acc);break;
      case "While":ex(s.c);scan(s.body,acc);if(s.els)scan(s.els,acc);break;
      case "If":s.tests.forEach(([c,b])=>{ex(c);scan(b,acc)});if(s.els)scan(s.els,acc);break;
      case "Def":add(s.n);s.ps.forEach(p=>p.d&&ex(p.d));(s.decos||[]).forEach(ex);break;
      case "Import":s.ns.forEach(([m,as])=>add(as||m.split(".")[0]));break;
      case "From":s.ns.forEach(([n,as])=>{if(n!=="*")add(as||n)});break;
      case "Global":s.ns.forEach(n=>acc.glob.add(n));break;
      case "Nonlocal":s.ns.forEach(n=>acc.nonl.add(n));break;
      case "Del":s.ts.forEach(tgt);break;
      case "Try":scan(s.body,acc);s.hs.forEach(h=>{if(h.as)add(h.as);if(h.ty)ex(h.ty);scan(h.body,acc)});if(s.els)scan(s.els,acc);if(s.fin)scan(s.fin,acc);break;
      default:ex(s)}}
  return acc}
function compileModule(src){
  const ast=PY.parse(src);
  const mod=newCode("<module>","module",null,[],ast.body,1);
  return mod}
function newCode(name,kind,parent,ps,body,line,isLambda,comp){
  const C={name,kind,parent,ps,code:[],lines:[],line0:line,locals:new Set(),glob:new Set(),nonl:new Set(),loops:[],tries:0,lambda:!!isLambda};
  if(kind!=="module"){
    if(comp){C.ps=[{n:".0"}];comp.gens.forEach((g,i)=>{const acc={asg:new Set(),glob:new Set(),nonl:new Set()};scan([{k:"Assign",ts:[g.t],e:{k:"Const",v:null}}],acc);acc.asg.forEach(n=>C.locals.add(n))});C.locals.add(".0")}
    else{ps.forEach(p=>C.locals.add(p.n));
      if(!isLambda){const acc=scan(body,{asg:new Set(),glob:new Set(),nonl:new Set()});acc.glob.forEach(n=>C.glob.add(n));acc.nonl.forEach(n=>C.nonl.add(n));acc.asg.forEach(n=>{if(!C.glob.has(n)&&!C.nonl.has(n))C.locals.add(n)})}}
  } else {const acc=scan(body,{asg:new Set(),glob:new Set(),nonl:new Set()});C.modNames=acc.asg}
  const E=(op,a,b,c)=>{C.code.push([op,a,b,c]);return C.code.length-1};
  const here=()=>C.code.length;
  const patch=(i,t)=>{C.code[i][1]=t};
  let curLine=line;
  const cerr=(node,msg,vi,kind)=>{throw new PErr(node.p,msg,vi,"SyntaxError",kind)};
  /* tìm tên: cục bộ / hàm bao ngoài (độ sâu) / toàn cục */
  function where(n){
    if(C.kind==="module")return["g"];
    if(C.glob.has(n))return["g"];
    if(C.locals.has(n)&&!C.nonl.has(n))return["l"];
    let d=0;for(let p=C.parent;p;p=p.parent){d++;if(p.kind==="module")break;if(p.locals.has(n)&&!p.glob.has(n)&&!p.nonl.has(n))return["d",d]}
    if(C.nonl.has(n))cerr({p:0},`no binding for nonlocal '${n}' found`,`Không có biến ${n} ở hàm bao ngoài để dùng nonlocal.`);
    return["g"]}
  function load(n){const w=where(n);if(w[0]==="l")E(O.LOADL,n);else if(w[0]==="d")E(O.LOADD,n,w[1]);else E(O.LOADG,n)}
  function store(n){const w=where(n);if(w[0]==="l")E(O.STOREL,n);else if(w[0]==="d")E(O.STORED,n,w[1]);else E(O.STOREG,n)}
  function expr(e){
    switch(e.k){
      case "Const":E(O.CONST,e.v);return;
      case "Name":load(e.n);return;
      case "Paren":expr(e.e);return;
      case "Bin":expr(e.a);expr(e.b);E(O.BIN,e.op,e.line);return;
      case "Un":if(e.op==="-"&&e.a.k==="Const"&&typeof e.a.v!=="boolean"&&e.a.v!==null&&typeof e.a.v!=="string"){E(O.CONST,PYR.neg(e.a.v));return}expr(e.a);E(O.UN,e.op);return;
      case "Not":expr(e.a);E(O.NOT);return;
      case "Bool":{const J=[];e.vals.forEach((v,i)=>{expr(v);if(i<e.vals.length-1)J.push(E(e.op==="and"?O.JIFK:O.JITK,0))});J.forEach(j=>patch(j,here()));return}
      case "Cmp":{ // a < b < c: so lần lượt, dừng sớm khi sai
        expr(e.a);const J=[];
        e.ops.forEach(([op,b],i)=>{expr(b);if(i<e.ops.length-1){E(O.DUP);E(O.ROT3);E(O.CMP,op);J.push(E(O.JIFK,0))}else E(O.CMP,op)});
        if(J.length){const end=E(O.JMP,0);J.forEach(j=>patch(j,here()));E(O.ROT2);E(O.POP);patch(end,here())}return}
      case "IfExp":{expr(e.c);const j=E(O.JIF,0);expr(e.a);const k=E(O.JMP,0);patch(j,here());expr(e.b);patch(k,here());return}
      case "Walrus":expr(e.e);E(O.DUP);store(e.n);return;
      case "List":case "Tuple":case "SetD":{
        if(e.items.some(x=>x.k==="Star")){E(O.BLIST,0);e.items.forEach(x=>{if(x.k==="Star"){expr(x.e);E(O.LEXT)}else{expr(x);E(O.LAPP,1)}});if(e.k==="Tuple")E(O.LISTTOTUPLE);if(e.k==="SetD")E(O.LISTTOTUPLE,1);return}
        e.items.forEach(expr);E(e.k==="List"?O.BLIST:e.k==="Tuple"?O.BTUPLE:O.BSET,e.items.length);return}
      case "Dict":e.keys.forEach((k,i)=>{expr(k);expr(e.vals[i])});E(O.BDICT,e.keys.length);return;
      case "Sub":expr(e.o);expr(e.i);E(O.SUB);return;
      case "Slice":["lo","hi","st"].forEach(k=>e[k]?expr(e[k]):E(O.CONST,null));E(O.SLICE);return;
      case "Attr":expr(e.o);E(O.ATTR,e.n);return;
      case "Call":{expr(e.f);
        const star=e.args.some(a=>a.k==="Star")||e.kw.some(k=>k.dstar);
        if(!star){e.args.forEach(expr);e.kw.forEach(k=>expr(k.e));E(O.CALL,e.args.length,e.kw.length?e.kw.map(k=>k.n):null,e.line);return}
        E(O.BLIST,0);e.args.forEach(a=>{if(a.k==="Star"){expr(a.e);E(O.LEXT)}else{expr(a);E(O.LAPP,1)}});
        E(O.BDICT,0);e.kw.forEach(k=>{if(k.dstar){expr(k.dstar);E(O.MADD,-1)}else{E(O.CONST,k.n);expr(k.e);E(O.MADD,1)}});
        E(O.CALLX,0,0,e.line);return}
      case "Lambda":{const sub=newCode("<lambda>","func",C,e.ps,[{k:"Return",e:e.body,p:e.p,line:e.line}],e.line,true);
        e.ps.forEach(p=>{if(p.d)expr(p.d)});E(O.MKFN,sub,e.ps.filter(p=>p.d).length);return}
      case "Comp":{ // biểu thức rút gọn = một hàm nhỏ chạy ngay
        const sub=newCode(e.kind==="list"?"<listcomp>":e.kind==="dict"?"<dictcomp>":e.kind==="set"?"<setcomp>":"<genexpr>","func",C,[],null,e.line,false,e);
        sub.compBody(e);E(O.MKFN,sub,0);expr(e.gens[0].it);E(O.ITER);E(O.CALL,1,null,e.line);return}
      case "FStr":{let n=0;for(const p of e.parts){if(typeof p==="string"){E(O.CONST,p);n++;continue}
        expr(p.e);if(p.spec){let m=0;p.spec.forEach(s=>{if(typeof s==="string")E(O.CONST,s);else{expr(s.e);E(O.FMT,s.conv,0)}m++});E(O.BSTR,m);E(O.FMT,p.conv,1)}else E(O.FMT,p.conv,0);n++}
        E(O.BSTR,n);return}
      case "Star":cerr(e,"can't use starred expression here","Dấu * chỉ dùng khi gọi hàm (print(*a)) hoặc khi gán nhiều biến.");
    }
    cerr(e,"invalid syntax","Biểu thức chưa đúng.")}
  function target(t){ // gán giá trị trên đỉnh ngăn xếp vào t
    if(t.k==="Name")store(t.n);
    else if(t.k==="Paren")target(t.e);
    else if(t.k==="Sub"){expr(t.o);expr(t.i);E(O.STSUB)}
    else if(t.k==="Attr"){expr(t.o);E(O.STATTR,t.n)}
    else if(t.k==="Tuple"||t.k==="List"){const si=t.items.findIndex(x=>x.k==="Star");E(O.UNPACK,t.items.length,si,t.line);t.items.forEach(x=>target(x.k==="Star"?x.e:x))}
    else cerr(t,"cannot assign to expression","Không gán được vào biểu thức này.")}
  function del(t){if(t.k==="Name"){const w=where(t.n);E(w[0]==="l"?O.DELL:O.DELG,t.n)}else if(t.k==="Sub"){expr(t.o);expr(t.i);E(O.DELSUB)}else if(t.k==="Paren")del(t.e);else if(t.k==="Tuple"||t.k==="List")t.items.forEach(del);else cerr(t,"cannot delete expression","Chỉ xóa được biến hoặc phần tử a[i].")}
  function stmts(L){L.forEach(stmt)}
  function stmt(s){curLine=s.line;
    switch(s.k){
      case "Expr":E(O.LINE,s.line);expr(s.e);E(O.POP);return;
      case "Pass":E(O.LINE,s.line);return;
      case "Assign":E(O.LINE,s.line);expr(s.e);s.ts.forEach((t,i)=>{if(i<s.ts.length-1)E(O.DUP);target(t)});return;
      case "Aug":{E(O.LINE,s.line);const t=s.t;
        if(t.k==="Name"){load(t.n);expr(s.e);E(O.INPL,s.op,s.line);store(t.n)}
        else if(t.k==="Sub"){expr(t.o);expr(t.i);E(O.DUP2);E(O.SUB);expr(s.e);E(O.INPL,s.op,s.line);E(O.ROT3);E(O.STSUB)}
        else if(t.k==="Attr"){cerr(t,"gán thuộc tính chưa hỗ trợ","Gán vào thuộc tính (a.b = ...) chưa có trong trình mô phỏng.","unsup")}
        else cerr(t,"illegal expression for augmented assignment","Bên trái += phải là tên biến hoặc a[i].");return}
      case "If":{const ends=[];s.tests.forEach(([c,b],i)=>{E(O.LINE,i===0?s.line:c.line);expr(c);const j=E(O.JIF,0);stmts(b);if(i<s.tests.length-1||s.els)ends.push(E(O.JMP,0));patch(j,here())});
        if(s.els)stmts(s.els);ends.forEach(j=>patch(j,here()));return}
      case "While":{const top=here();E(O.LINE,s.line);expr(s.c);const j=E(O.JIF,0);const lp={brk:[],cont:top,tries:C.tries};C.loops.push(lp);stmts(s.body);C.loops.pop();E(O.JMP,top);patch(j,here());if(s.els)stmts(s.els);lp.brk.forEach(b=>patch(b,here()));return}
      case "For":{E(O.LINE,s.line);expr(s.it);E(O.ITER,s.line);const j0=E(O.JMP,0);const top=here();E(O.LINE,s.line);patch(j0,here());const f=E(O.FOR,0);target(s.t);
        const lp={brk:[],cont:top,tries:C.tries,iter:true};C.loops.push(lp);stmts(s.body);C.loops.pop();E(O.JMP,top);patch(f,here());if(s.els)stmts(s.els);
        const after=here();lp.brk.forEach(b=>patch(b,after));lp.brkPop=true;return}
      case "Break":case "Continue":{E(O.LINE,s.line);const lp=C.loops[C.loops.length-1];if(!lp)cerr(s,`'${s.k.toLowerCase()}' outside loop`,`${s.k.toLowerCase()} chỉ dùng được bên trong vòng lặp for hoặc while.`);
        for(let t=C.tries;t>lp.tries;t--)E(O.POPTRY);
        if(s.k==="Break"){if(lp.iter)E(O.POP);lp.brk.push(E(O.JMP,0))}else E(O.JMP,lp.cont);return}
      case "Return":E(O.LINE,s.line);if(C.kind==="module")cerr(s,"'return' outside function","return chỉ dùng được bên trong hàm (def).");if(s.e)expr(s.e);else E(O.CONST,null);E(O.RET);return;
      case "Def":{E(O.LINE,s.line);(s.decos||[]).forEach(expr);const sub=newCode(s.n,"func",C,s.ps,s.body,s.line);s.ps.forEach(p=>{if(p.d)expr(p.d)});E(O.MKFN,sub,s.ps.filter(p=>p.d).length);
        (s.decos||[]).forEach(()=>E(O.CALL,1,null,s.line));store(s.n);return}
      case "Global":case "Nonlocal":E(O.LINE,s.line);if(C.kind==="module"&&s.k==="Nonlocal")cerr(s,"nonlocal declaration not allowed at module level","nonlocal chỉ dùng trong hàm lồng trong hàm khác.");return;
      case "Del":E(O.LINE,s.line);s.ts.forEach(del);return;
      case "Import":E(O.LINE,s.line);s.ns.forEach(([m,as])=>{E(O.IMPORT,m,s.line);if(!as&&m.includes(".")){E(O.POP);E(O.IMPORT,m.split(".")[0],s.line)}store(as||m.split(".")[0])});return;
      case "From":E(O.LINE,s.line);E(O.IMPORT,s.m,s.line);s.ns.forEach(([n,as])=>{if(n==="*")cerr(s,"from … import * chưa hỗ trợ","Hãy import từng tên cần dùng, ví dụ from math import sqrt.","unsup");E(O.IMPFROM,n,s.m);store(as||n)});E(O.POP);return;
      case "Assert":{E(O.LINE,s.line);expr(s.c);const j=E(O.JIT,0);if(s.msg)expr(s.msg);else E(O.CONST,null);E(O.ASSERTF);patch(j,here());return}
      case "Raise":E(O.LINE,s.line);if(s.e){expr(s.e);E(O.RAISE,1)}else E(O.RAISE,0);return;
      case "Try":{E(O.LINE,s.line);
        if(s.fin){ // try … finally: chạy khối finally cả khi bình thường lẫn khi có lỗi
          const h=E(O.TRY,0);C.tries++;stmts(s.hs.length?[{...s,fin:null}]:s.body);C.tries--;E(O.POPTRY);stmts(s.fin);const j=E(O.JMP,0);patch(h,here());stmts(s.fin);E(O.RERAISE);patch(j,here());return}
        const h=E(O.TRY,0);C.tries++;stmts(s.body);C.tries--;E(O.POPTRY);const jElse=E(O.JMP,0);patch(h,here());const ends=[];
        s.hs.forEach(H=>{let nxt=null;E(O.LINE,H.line);if(H.ty){E(O.DUP);expr(H.ty);E(O.EXCM);nxt=E(O.JIF,0)}
          if(H.as)store(H.as);else E(O.POP);stmts(H.body);E(O.ENDEXC);ends.push(E(O.JMP,0));if(nxt!==null){patch(nxt,here())}});
        E(O.RERAISE);patch(jElse,here());if(s.els)stmts(s.els);ends.forEach(j=>patch(j,here()));return}
    }
    cerr(s,"invalid syntax","Câu lệnh chưa được hỗ trợ.")}
  C.compBody=function(e){ // thân của list/dict/set comprehension; tham số .0 là bộ lặp của vòng for đầu
    E(e.kind==="dict"?O.BDICT:e.kind==="set"?O.BSET:O.BLIST,0);
    const nest=(gi)=>{const g=e.gens[gi];if(gi===0)E(O.LOADL,".0");else{expr(g.it);E(O.ITER)}
      const top=here();const f=E(O.FOR,0);target(g.t);const J=[];g.ifs.forEach(c=>{expr(c);J.push(E(O.JIF,0))});
      if(gi+1<e.gens.length)nest(gi+1);else{if(e.kind==="dict"){expr(e.e);expr(e.v);E(O.MADD,gi+2)}else{expr(e.e);E(e.kind==="set"?O.SADD:O.LAPP,gi+2)}}
      J.forEach(j=>patch(j,top));E(O.JMP,top);patch(f,here())};
    nest(0);E(O.RET)};
  if(body&&isLambda){expr(body[0].e);E(O.RET)}
  else if(body){stmts(body);E(O.CONST,null);E(O.RET)}
  return C}
return{O,compileModule};
})();

/* ---------------- 4. phép toán, in giá trị, định dạng ---------------- */
const PYR=(()=>{
"use strict";
const {PyFloat,PyList,PyTuple,PyDict,PySet,PyRange,PyFunc,PyBuiltin,PyMod,PyType,PyIter,PyDeque,PyExcV,PyExc,raise,normInt,isInt,isNum,toNum,toBig,ib,tname}=PY;
const F=x=>new PyFloat(x);
class PySlice{constructor(lo,hi,st){this.lo=lo;this.hi=hi;this.st=st}}
class PyCached{constructor(fn){this.fn=fn;this.cache=new Map();this.name=fn.name}}
class PyKey{constructor(f,v){this.f=f;this.v=v}} // functools.cmp_to_key
const dq=d=>{if(d.h){d.a=d.a.slice(d.h);d.h=0}return d.a}; // deque: bỏ phần đã lấy ra ở đầu
const seqA=v=>v instanceof PyDeque?dq(v):v.a;
function truth(v){if(v===null)return false;switch(typeof v){case "boolean":return v;case "number":return v!==0;case "bigint":return v!==0n;case "string":return v.length>0}
  if(v instanceof PyFloat)return v.v!==0;if(v instanceof PyList||v instanceof PyTuple)return v.a.length>0;if(v instanceof PyDeque)return dq(v).length>0;if(v instanceof PyDict||v instanceof PySet)return v.m.size>0;if(v instanceof PyRange)return rlen(v)>0;return true}
function rlenBig(r){const a=toBig(r.a),b=toBig(r.b),c=toBig(r.c);let n=c>0n?(b-a+c-1n)/c:(a-b-c-1n)/(-c);return n<0n?0:normInt(n)}
function rlen(r){const a=toBig(r.a),b=toBig(r.b),c=toBig(r.c);let n=c>0n?(b-a+c-1n)/c:(a-b-c-1n)/(-c);return n<0n?0:Number(n)}
const intTN=v=>tname(v);
const bad=(op,a,b)=>raise("TypeError",`unsupported operand type(s) for ${op}: '${tname(a)}' and '${tname(b)}'`,`Phép ${op} không dùng được giữa kiểu ${tname(a)} và ${tname(b)}.${(tname(a)==="str"||tname(b)==="str")?" Nếu đọc số bằng input(), nhớ đổi sang số: int(input()).":""}`);
function iop(op,a,b){a=ib(a);b=ib(b);
  if(typeof a==="number"&&typeof b==="number"){const r=op==="+"?a+b:op==="-"?a-b:a*b;if(Number.isSafeInteger(r))return r}
  const x=toBig(a),y=toBig(b);return normInt(op==="+"?x+y:op==="-"?x-y:x*y)}
function rep(seq,n,mk){n=Number(ib(n));if(n<=0)return typeof seq==="string"?"":mk([]);const len=(typeof seq==="string"?seq.length:seq.length)*n;if(len>20000000)raise("MemoryError","","Kết quả quá lớn cho trình mô phỏng.");
  if(typeof seq==="string")return seq.repeat(n);const out=[];for(let i=0;i<n;i++)for(const x of seq)out.push(x);return mk(out)}
function add(a,b){
  if(isInt(a)&&isInt(b))return iop("+",a,b);
  if(isNum(a)&&isNum(b))return F(toNum(a)+toNum(b));
  if(typeof a==="string"){if(typeof b==="string")return a+b;raise("TypeError",`can only concatenate str (not "${tname(b)}") to str`,`Không cộng chuỗi với ${tname(b)} được. Đổi số thành chuỗi bằng str(x), hoặc dùng f-string: f"...{x}".`)}
  if(a instanceof PyList){if(b instanceof PyList)return new PyList(a.a.concat(b.a));raise("TypeError",`can only concatenate list (not "${tname(b)}") to list`,"Chỉ nối được list với list. Muốn thêm một phần tử, dùng a.append(x).")}
  if(a instanceof PyTuple&&b instanceof PyTuple)return new PyTuple(a.a.concat(b.a));
  if(isNum(a)&&typeof b==="string")raise("TypeError",`unsupported operand type(s) for +: '${tname(a)}' and 'str'`,"Không cộng số với chuỗi được. Nếu chuỗi là số đọc từ input(), đổi bằng int(...).");
  bad("+",a,b)}
function sub(a,b){if(isInt(a)&&isInt(b))return iop("-",a,b);if(isNum(a)&&isNum(b))return F(toNum(a)-toNum(b));
  if(a instanceof PySet&&b instanceof PySet){const s=new PySet();a.m.forEach((v,k)=>{if(!b.m.has(k))s.m.set(k,v)});return s}bad("-",a,b)}
function mul(a,b){if(isInt(a)&&isInt(b))return iop("*",a,b);if(isNum(a)&&isNum(b))return F(toNum(a)*toNum(b));
  if(typeof a==="string"&&isInt(b))return rep(a,b);if(isInt(a)&&typeof b==="string")return rep(b,a);
  if(a instanceof PyList&&isInt(b))return rep(a.a,b,x=>new PyList(x));if(isInt(a)&&b instanceof PyList)return rep(b.a,a,x=>new PyList(x));
  if(a instanceof PyTuple&&isInt(b))return rep(a.a,b,x=>new PyTuple(x));
  if(isInt(a)&&b instanceof PyTuple)return rep(b.a,a,x=>new PyTuple(x));
  if((typeof a==="string"||a instanceof PyList)&&b instanceof PyFloat)raise("TypeError",`can't multiply sequence by non-int of type 'float'`,"Chỉ nhân chuỗi/list với số nguyên.");bad("*",a,b)}
const zde=(m)=>raise("ZeroDivisionError",m,"Phép chia (hoặc chia lấy dư) cho 0. Kiểm tra số chia trước khi chia.");
function truediv(a,b){if(!isNum(a)||!isNum(b))bad("/",a,b);const y=toNum(b);if(y===0)zde(isInt(a)&&isInt(b)?"division by zero":"float division by zero");
  if(typeof a==="bigint"||typeof b==="bigint"){const x=toBig(a),yy=toBig(b);if(isInt(a)&&isInt(b)&&x%yy===0n)return F(Number(x/yy))}
  return F(toNum(a)/y)}
function floordiv(a,b){
  if(isInt(a)&&isInt(b)){a=ib(a);b=ib(b);if(b===0||b===0n)zde("integer division or modulo by zero");
    if(typeof a==="number"&&typeof b==="number"){let q=Math.floor(a/b);let r=a-q*b;if(Number.isSafeInteger(q*b)){if(b>0?r<0:r>0)q--;else if(b>0?r>=b:r<=b)q++;return q}}
    const x=toBig(a),y=toBig(b);let q=x/y;if((x%y!==0n)&&((x<0n)!==(y<0n)))q-=1n;return normInt(q)}
  if(isNum(a)&&isNum(b)){const y=toNum(b);if(y===0)zde("float floor division by zero");return F(Math.floor(toNum(a)/y))}bad("//",a,b)}
function mod(a,b){
  if(typeof a==="string")return pctFormat(a,b);
  if(isInt(a)&&isInt(b)){a=ib(a);b=ib(b);if(b===0||b===0n)zde("integer modulo by zero");
    if(typeof a==="number"&&typeof b==="number"){let r=a%b;if(r!==0&&(r<0)!==(b<0))r+=b;return r}
    const x=toBig(a),y=toBig(b);let r=x%y;if(r!==0n&&(r<0n)!==(y<0n))r+=y;return normInt(r)}
  if(isNum(a)&&isNum(b)){const x=toNum(a),y=toNum(b);if(y===0)zde("float modulo by zero");let r=x%y;if(r!==0&&(r<0)!==(y<0))r+=y;return F(r)}bad("%",a,b)}
function pow(a,b,m){
  if(m!==undefined&&m!==null){if(!isInt(a)||!isInt(b)||!isInt(m))raise("TypeError","pow() 3rd argument not allowed unless all arguments are integers","");
    let x=toBig(a),e=toBig(b),M=toBig(m);if(M===0n)raise("ValueError","pow() 3rd argument cannot be 0","");if(e<0n)raise("ValueError","base is not invertible for the given modulus","");
    let r=1n%M;x=((x%M)+M)%M;while(e>0n){if(e&1n)r=r*x%M;x=x*x%M;e>>=1n}if(r!==0n&&(r<0n)!==(M<0n))r+=M;return normInt(r)}
  if(isInt(a)&&isInt(b)){const e=toBig(b);
    if(e<0n){const x=toNum(a);if(x===0)zde("0.0 cannot be raised to a negative power");return F(Math.pow(x,Number(e)))}
    const x=toBig(a);const bits=x===0n||x===1n||x===-1n?1:x.toString(2).length*Number(e);if(bits>2000000)raise("MemoryError","","Lũy thừa quá lớn cho trình mô phỏng.");
    return normInt(x**e)}
  if(isNum(a)&&isNum(b)){const x=toNum(a),y=toNum(b);if(x===0&&y<0)zde("0.0 cannot be raised to a negative power");if(x<0&&!Number.isInteger(y))raise("ValueError","math domain error","Lũy thừa số âm với số mũ không nguyên cho kết quả số phức, trình mô phỏng chưa hỗ trợ.");
    const r=Math.pow(x,y);if(!isFinite(r)&&isFinite(x)&&isFinite(y))raise("OverflowError","(34, 'Numerical result out of range')","Kết quả lũy thừa quá lớn cho kiểu float.");return F(r)}
  bad("** or pow()",a,b)}
function bitop(op,a,b){
  if(typeof a==="boolean"&&typeof b==="boolean"&&"&|^".includes(op))return op==="&"?a&&b:op==="|"?a||b:a!==b;
  if(a instanceof PySet&&b instanceof PySet){const s=new PySet();if(op==="|"){a.m.forEach((v,k)=>s.m.set(k,v));b.m.forEach((v,k)=>s.m.set(k,v))}else if(op==="&"){a.m.forEach((v,k)=>{if(b.m.has(k))s.m.set(k,v)})}else if(op==="^"){a.m.forEach((v,k)=>{if(!b.m.has(k))s.m.set(k,v)});b.m.forEach((v,k)=>{if(!a.m.has(k))s.m.set(k,v)})}else bad(op,a,b);return s}
  if(a instanceof PyDict&&b instanceof PyDict&&op==="|"){const d=newDict();a.m.forEach((v,k)=>d.m.set(k,v));b.m.forEach((v,k)=>d.m.set(k,v));return d}
  if(!isInt(a)||!isInt(b))bad(op,a,b);
  if(typeof a==="number"&&typeof b==="number"&&a>=-1073741824&&a<1073741824&&b>=0&&b<1073741824){if(op==="&")return a&b;if(op==="|")return a|b;if(op==="^")return a^b}
  const x=toBig(a),y=toBig(b);
  if((op==="<<"||op===">>")&&y<0n)raise("ValueError","negative shift count","Số bit dịch không được âm.");
  if(op==="<<"&&y>100000n)raise("MemoryError","","Dịch bit quá lớn.");
  return normInt(op==="&"?x&y:op==="|"?x|y:op==="^"?x^y:op==="<<"?x<<y:x>>y)}
function binop(op,a,b){switch(op){case "+":return add(a,b);case "-":return sub(a,b);case "*":return mul(a,b);case "/":return truediv(a,b);case "//":return floordiv(a,b);case "%":return mod(a,b);case "**":return pow(a,b);case "@":bad("@",a,b)}return bitop(op,a,b)}
function neg(v){if(typeof v==="number")return v===0?0:-v;if(typeof v==="bigint")return normInt(-v);if(typeof v==="boolean")return -+v;if(v instanceof PyFloat)return F(-v.v);raise("TypeError",`bad operand type for unary -: '${tname(v)}'`,"")}
function unop(op,v){if(op==="-")return neg(v);if(op==="+"){if(isNum(v))return typeof v==="boolean"?+v:v;raise("TypeError",`bad operand type for unary +: '${tname(v)}'`,"")}
  if(!isInt(v))raise("TypeError",`bad operand type for unary ~: '${tname(v)}'`,"");return normInt(-toBig(v)-1n)}
/* so sánh */
function eq(a,b){if(a===b)return a===a||!(a instanceof PyFloat);
  if(isNum(a)&&isNum(b)){const x=a instanceof PyFloat?a.v:ib(a),y=b instanceof PyFloat?b.v:ib(b);return x==y}
  if(typeof a!=="object"||typeof b!=="object"||a===null||b===null)return false;
  if((a instanceof PyList&&b instanceof PyList)||(a instanceof PyTuple&&b instanceof PyTuple)||(a instanceof PyDeque&&b instanceof PyDeque)){const x=seqA(a),y=seqA(b);if(x.length!==y.length)return false;for(let i=0;i<x.length;i++)if(!eq(x[i],y[i]))return false;return true}
  if(a instanceof PyDict&&b instanceof PyDict){if(a.m.size!==b.m.size)return false;for(const[k,[,v]]of a.m){const o=b.m.get(k);if(!o||!eq(v,o[1]))return false}return true}
  if(a instanceof PySet&&b instanceof PySet){if(a.m.size!==b.m.size)return false;for(const k of a.m.keys())if(!b.m.has(k))return false;return true}
  if(a instanceof PyRange&&b instanceof PyRange)return eq(new PyList(rangeArr(a)),new PyList(rangeArr(b)));
  if(a instanceof PyExcV&&b instanceof PyExcV)return a===b;
  return false}
const CMPN={"<":"<",">":">","<=":"<=",">=":">="};
let CALLK=null; // gọi hàm so sánh của cmp_to_key (máy đặt vào)
function lt(a,b,op){op=op||"<";
  if(isNum(a)&&isNum(b)){const x=a instanceof PyFloat?a.v:ib(a),y=b instanceof PyFloat?b.v:ib(b);return x<y}
  if(typeof a==="string"&&typeof b==="string")return a<b;
  if((a instanceof PyList&&b instanceof PyList)||(a instanceof PyTuple&&b instanceof PyTuple)){const x=a.a,y=b.a;const n=Math.min(x.length,y.length);
    for(let i=0;i<n;i++){if(!eq(x[i],y[i]))return lt(x[i],y[i],op)}return x.length<y.length}
  if(a instanceof PySet&&b instanceof PySet){if(a.m.size>=b.m.size)return false;for(const k of a.m.keys())if(!b.m.has(k))return false;return true}
  if(a instanceof PyKey&&b instanceof PyKey){const r=CALLK(a.f,[a.v,b.v]);return toNum(r)<0}
  raise("TypeError",`'${op}' not supported between instances of '${tname(a)}' and '${tname(b)}'`,`Không so sánh ${op} được giữa ${tname(a)} và ${tname(b)}.${tname(a)==="str"||tname(b)==="str"?" Có thể bạn quên đổi dữ liệu nhập sang số bằng int(...).":""}`)}
function compare(op,a,b,M){
  switch(op){
    case "==":return eq(a,b);case "!=":return !eq(a,b);
    case "<":return lt(a,b,"<");case ">":return lt(b,a,">");
    case "<=":{if(isNum(a)&&isNum(b))return lt(a,b)||eq(a,b);return lt(a,b,"<=")||eq(a,b)}
    case ">=":{if(isNum(a)&&isNum(b))return lt(b,a)||eq(a,b);return lt(b,a,">=")||eq(a,b)}
    case "in":return contains(b,a,M);case "not in":return !contains(b,a,M);
    case "is":return a===b||(a===null&&b===null)||(typeof a!=="object"&&a===b);
    case "is not":return !(a===b)}}
/* băm khóa của dict / set */
function hk(v){switch(typeof v){case "number":return "i"+v;case "bigint":return "i"+v.toString();case "boolean":return v?"i1":"i0";case "string":return "s"+v}
  if(v===null)return "N";if(v instanceof PyFloat)return Number.isInteger(v.v)&&Math.abs(v.v)<1e300?"i"+(Number.isSafeInteger(v.v)?v.v:BigInt(v.v).toString()):"f"+v.v;
  if(v instanceof PyTuple)return "t("+v.a.map(hk).join(",")+")";
  if(v instanceof PyFunc||v instanceof PyBuiltin||v instanceof PyType||v instanceof PyCached)return "o"+oid(v);
  raise("TypeError",`unhashable type: '${tname(v)}'`,`Kiểu ${tname(v)} không dùng làm khóa của dict hay phần tử của set được (vì có thể thay đổi). Đổi sang tuple nếu cần: tuple(a).`)}
const OIDS=new WeakMap();let OIDN=0;const oid=o=>{if(!OIDS.has(o))OIDS.set(o,++OIDN);return OIDS.get(o)};
function newDict(){return new PyDict()}
function dget(d,k){const e=d.m.get(hk(k));return e?e[1]:undefined}
function dset(d,k,v){const h=hk(k),e=d.m.get(h);if(e)e[1]=v;else d.m.set(h,[k,v])}
function sadd(s,v){const h=hk(v);if(!s.m.has(h))s.m.set(h,v)}
function contains(c,x,M){
  if(typeof c==="string"){if(typeof x!=="string")raise("TypeError",`'in <string>' requires string as left operand, not ${tname(x)}`,"");if(M)M.cost+=Math.ceil(c.length/16);return c.includes(x)}
  if(c instanceof PyList||c instanceof PyTuple||c instanceof PyDeque){const a=seqA(c);if(M)M.cost+=Math.max(1,a.length>>2);for(const y of a)if(eq(x,y))return true;return false}
  if(c instanceof PyDict||c instanceof PySet)return c.m.has(hk(x));
  if(c instanceof PyRange){if(!isInt(x))return rangeArr(c).some(y=>eq(x,y));const v=toBig(x),a=toBig(c.a),b=toBig(c.b),s=toBig(c.c);if(s>0n?(v<a||v>=b):(v>a||v<=b))return false;return (v-a)%s===0n}
  if(c instanceof PyIter){const a=c.a.slice(c.i);const r=a.some(y=>eq(x,y));return r}
  raise("TypeError",`argument of type '${tname(c)}' is not iterable`,"")}
function rangeArr(r,lim){const out=[];const n=rlen(r);if(n>(lim||20000000))raise("MemoryError","","range quá lớn để tạo thành list trong trình mô phỏng.");let v=toBig(r.a);const c=toBig(r.c);
  if(typeof r.a==="number"&&typeof r.c==="number"&&Math.abs(r.a)+Math.abs(r.c)*n<SAFE2){let x=r.a;for(let i=0;i<n;i++){out.push(x);x+=r.c}return out}
  for(let i=0;i<n;i++){out.push(normInt(v));v+=c}return out}
const SAFE2=Number.MAX_SAFE_INTEGER;
/* biến thành mảng JS (để lặp, sorted, list(...)) */
function toArr(v,M,what){
  if(v instanceof PyList||v instanceof PyTuple)return v.a.slice();
  if(v instanceof PyDeque)return dq(v).slice();
  if(typeof v==="string")return Array.from(v);
  if(v instanceof PyRange)return rangeArr(v);
  if(v instanceof PyDict)return [...v.m.values()].map(e=>e[0]);
  if(v instanceof PySet)return [...v.m.values()];
  if(v instanceof PyIter){const a=v.a.slice(v.i);v.i=v.a.length;return a}
  if(v instanceof PyMod&&v.name==="sys.stdin"&&M)return M.stdinLines();
  raise("TypeError",`'${tname(v)}' object is not iterable`,`${what||"Giá trị này"} không lặp được (không phải list, chuỗi, range…).${isInt(v)?" Có thể bạn muốn viết range(n) thay vì n.":""}`)}
/* bộ lặp cho vòng for: list và deque lặp "sống" theo chỉ số như Python */
function iterOf(v,M){
  if(v instanceof PyList)return{l:v,i:0};
  if(v instanceof PyRange){const n=rlen(v);if(typeof v.a==="number"&&typeof v.c==="number"&&Math.abs(v.a)+Math.abs(v.c)*n<SAFE2)return{r:true,x:v.a,s:v.c,n,i:0};return{a:rangeArr(v),i:0}}
  if(v instanceof PyIter)return{it:v};
  return{a:toArr(v,M),i:0}}
const DONE=Symbol("done");
function iterNext(o){
  if(o.l){const a=o.l.a;if(o.i<a.length)return a[o.i++];return DONE}
  if(o.r){if(o.i<o.n){o.i++;const x=o.x;o.x+=o.s;return x}return DONE}
  if(o.it){const t=o.it;if(t.i<t.a.length)return t.a[t.i++];return DONE}
  if(o.i<o.a.length)return o.a[o.i++];return DONE}
/* in giá trị */
function floatRepr(x){if(Number.isNaN(x))return "nan";if(x===Infinity)return "inf";if(x===-Infinity)return "-inf";if(x===0)return Object.is(x,-0)?"-0.0":"0.0";
  const s=x.toExponential();let [m,e]=s.split("e");e=+e;const neg=m[0]==="-";if(neg)m=m.slice(1);const dg=m.replace(".","");
  let out;
  if(e>=-4&&e<16){ // dạng thường
    if(e>=0){const ip=dg.length>e+1?dg.slice(0,e+1):dg+"0".repeat(e+1-dg.length);const fp=dg.length>e+1?dg.slice(e+1):"0";out=ip+"."+fp}
    else out="0."+"0".repeat(-e-1)+dg}
  else out=(dg.length>1?dg[0]+"."+dg.slice(1):dg[0])+"e"+(e<0?"-":"+")+String(Math.abs(e)).padStart(2,"0");
  return (neg?"-":"")+out}
function strRepr(s){const q=s.includes("'")&&!s.includes('"')?'"':"'";let o=q;
  for(const ch of s){const c=ch.codePointAt(0);
    if(ch==="\\")o+="\\\\";else if(ch===q)o+="\\"+q;else if(ch==="\n")o+="\\n";else if(ch==="\t")o+="\\t";else if(ch==="\r")o+="\\r";
    else if(c<32||c===127)o+="\\x"+c.toString(16).padStart(2,"0");else o+=ch}
  return o+q}
function repr(v,seen){
  switch(typeof v){case "number":return String(v);case "bigint":return v.toString();case "boolean":return v?"True":"False";case "string":return strRepr(v)}
  if(v===null)return "None";if(v instanceof PyFloat)return floatRepr(v.v);
  seen=seen||new Set();
  const rec=(o,f)=>{if(seen.has(o))return o instanceof PyList?"[...]":o instanceof PyDict?"{...}":"(...)";seen.add(o);const r=f();seen.delete(o);return r};
  if(v instanceof PyList)return rec(v,()=>"["+v.a.map(x=>repr(x,seen)).join(", ")+"]");
  if(v instanceof PyTuple)return rec(v,()=>v.a.length===1?"("+repr(v.a[0],seen)+",)":"("+v.a.map(x=>repr(x,seen)).join(", ")+")");
  if(v instanceof PyDict){const body=()=>"{"+[...v.m.values()].map(([k,x])=>repr(k,seen)+": "+repr(x,seen)).join(", ")+"}";
    if(v.ctr)return rec(v,()=>"Counter("+(v.m.size?body():"")+")");
    if(v.dd)return rec(v,()=>`defaultdict(${v.ddName}, ${body()})`);return rec(v,body)}
  if(v instanceof PySet)return v.m.size?"{"+[...v.m.values()].map(x=>repr(x,seen)).join(", ")+"}":"set()";
  if(v instanceof PyDeque)return "deque(["+dq(v).map(x=>repr(x,seen)).join(", ")+"]"+(v.maxlen!=null?", maxlen="+v.maxlen:"")+")";
  if(v instanceof PyRange)return v.c===1?`range(${v.a}, ${v.b})`:`range(${v.a}, ${v.b}, ${v.c})`;
  if(v instanceof PyFunc)return `<function ${v.name} at 0x7f${(0x3a2b1000+oid(v)*0x40).toString(16)}>`;
  if(v instanceof PyCached)return `<functools._lru_cache_wrapper object at 0x7f${(0x3a2b1000+oid(v)*0x40).toString(16)}>`;
  if(v instanceof PyBuiltin)return v.self!==undefined?`<built-in method ${v.name} of ${tname(v.self)} object at 0x7f${(0x3a2b1000+oid(v)*0x40).toString(16)}>`:`<built-in function ${v.name}>`;
  if(v instanceof PyType)return v.exc?`<class '${v.name}'>`:`<class '${v.name}'>`;
  if(v instanceof PyMod)return `<module '${v.name}'>`;
  if(v instanceof PyExcV)return `${v.type}(${v.args.map(x=>repr(x)).join(", ")})`;
  if(v instanceof PyIter)return `<${v.kind||"list_iterator"} object at 0x7f${(0x3a2b1000+oid(v)*0x40).toString(16)}>`;
  if(v instanceof PySlice)return `slice(${repr(v.lo)}, ${repr(v.hi)}, ${repr(v.st)})`;
  if(v instanceof PyKey)return "<functools.KeyWrapper object>";
  return "<object>"}
function str(v){if(typeof v==="string")return v;if(v instanceof PyExcV)return v.args.length===1?str(v.args[0]):v.args.length?repr(new PyTuple(v.args)):"";return repr(v)}
/* làm tròn chính xác như Python (nửa về số chẵn trên giá trị nhị phân thật) */
function exactParts(x){const b=new DataView(new ArrayBuffer(8));b.setFloat64(0,x);const hi=b.getUint32(0),lo=b.getUint32(4);
  const ex=(hi>>>20)&0x7ff;let man=(BigInt(hi&0xfffff)<<32n)|BigInt(lo);let e;if(ex===0)e=-1074;else{man|=1n<<52n;e=ex-1075}return[man,e]} // |x| = man * 2^e
function fixedStr(x,p){if(!isFinite(x))return Number.isNaN(x)?"nan":x>0?"inf":"-inf";
  const neg=x<0||Object.is(x,-0);const [m,e]=exactParts(Math.abs(x));
  let q;const P=10n**BigInt(p);
  if(e>=0)q=(m<<BigInt(e))*P;
  else{const D=1n<<BigInt(-e),N=m*P;q=N/D;const r=N%D;const t=2n*r;if(t>D||(t===D&&(q&1n)))q+=1n}
  let s=q.toString();if(p>0){s=s.padStart(p+1,"0");s=s.slice(0,-p)+"."+s.slice(-p)}
  return (neg&&(q!==0n||Object.is(x,-0)||x<0)?"-":"")+s}
function expStr(x,p,upper){if(!isFinite(x))return fixedStr(x,0);if(x===0)return (Object.is(x,-0)?"-":"")+"0"+(p>0?"."+"0".repeat(p):"")+(upper?"E+00":"e+00");
  const neg=x<0;let a=Math.abs(x);let e=Math.floor(Math.log10(a));
  let s=fixedStr(a/Math.pow(10,e),p);if(parseFloat(s)>=10){e++;s=fixedStr(a/Math.pow(10,e),p)}
  // dùng toExponential để chính xác hơn khi có thể
  const te=a.toExponential(p);const [mm,ee]=te.split("e");s=mm;e=+ee;
  return (neg?"-":"")+s+(upper?"E":"e")+(e<0?"-":"+")+String(Math.abs(e)).padStart(2,"0")}
function genStr(x,p,alt,upper){if(!isFinite(x))return fixedStr(x,0);if(p===0)p=1;if(x===0)return (Object.is(x,-0)?"-":"")+"0";
  const ex=+x.toExponential(p-1).split("e")[1];
  let s;if(ex>=-4&&ex<p)s=fixedStr(x,p-1-ex);else s=expStr(x,p-1,upper);
  if(!alt){if(s.includes("e")||s.includes("E")){let [m,e]=s.split(/(?=[eE])/);if(m.includes("."))m=m.replace(/0+$/,"").replace(/\.$/,"");s=m+e}else if(s.includes("."))s=s.replace(/0+$/,"").replace(/\.$/,"")}
  return s}
function group(intPart,sep){const neg=intPart[0]==="-";let d=neg?intPart.slice(1):intPart;let o="";while(d.length>3){o=sep+d.slice(-3)+o;d=d.slice(0,-3)}return (neg?"-":"")+d+o}
function formatSpec(v,spec){
  if(v instanceof PyExcV||v instanceof PyList||v instanceof PyTuple||v instanceof PyDict||v instanceof PySet||v===null)v=str(v);
  const m=/^(?:(.)?([<>=^]))?([+\- ])?(z)?(#)?(0)?(\d+)?([,_])?(?:\.(\d+))?([bcdeEfFgGnosxX%])?$/s.exec(spec);
  if(!m)raise("ValueError",`Invalid format specifier '${spec}' for object of type '${tname(v)}'`,"Phần định dạng sau dấu “:” chưa đúng (ví dụ đúng: :.2f, :5d, :>8).");
  let [,fill,align,sign,,alt,zero,width,grp,prec,type]=m;
  width=width?+width:0;prec=prec==null?null:+prec;
  if(zero&&!align){fill=fill||"0";align="="}
  fill=fill||" ";
  let body,isN=isNum(v)&&typeof v!=="string";
  if(typeof v==="string"){if(type&&type!=="s")raise("ValueError",`Unknown format code '${type}' for object of type 'str'`,`Mã định dạng ${type} không dùng cho chuỗi.`);body=prec!=null?v.slice(0,prec):v;align=align||"<"}
  else if(isN){
    const isI=isInt(v);let t=type||(isI?"d":null);
    if(isI&&"eEfFgG%".includes(t||"x")===false&&t!=="d"&&!"bcoxXn".includes(t))t="d";
    let neg=false,digits;
    const x=toNum(v);
    if(t==="d"||t==="n"){if(!isI)raise("ValueError",`Unknown format code 'd' for object of type 'float'`,"Mã :d chỉ dùng cho số nguyên. Với số thực, dùng :.0f hoặc đổi sang int(...).");const b=toBig(v);neg=b<0n;digits=(neg?-b:b).toString()}
    else if("bcoxX".includes(t)){if(!isI)raise("ValueError",`Unknown format code '${t}' for object of type 'float'`,"");const b=toBig(v);neg=b<0n;const a=neg?-b:b;
      digits=t==="b"?a.toString(2):t==="o"?a.toString(8):t==="c"?String.fromCodePoint(Number(a)):a.toString(16);if(t==="X")digits=digits.toUpperCase();if(alt&&t!=="c")digits=(t==="b"?"0b":t==="o"?"0o":t==="x"?"0x":"0X")+digits}
    else{const xx=toNum(v);neg=xx<0||Object.is(xx,-0);const a=Math.abs(xx);
      if(t==="f"||t==="F")digits=fixedStr(a,prec==null?6:prec);
      else if(t==="e"||t==="E")digits=expStr(a,prec==null?6:prec,t==="E");
      else if(t==="%")digits=fixedStr(a*100,prec==null?6:prec)+"%";
      else if(t==="g"||t==="G")digits=genStr(a,prec==null?6:prec,!!alt,t==="G");
      else digits=prec==null?floatRepr(a):genStr(a,prec,false)+(/[.eEn]/.test(genStr(a,prec,false))?"":"")}
    if(grp){const [ip,fp]=digits.split(".");digits=group(ip,grp)+(fp!=null?"."+fp:"")}
    const sg=neg?"-":sign==="+"?"+":sign===" "?" ":"";
    align=align||">";
    if(align==="="){const pad=Math.max(0,width-sg.length-digits.length);return sg+fill.repeat(pad)+digits}
    body=sg+digits}
  else body=str(v);
  const pad=Math.max(0,width-[...body].length);
  if(align==="<")return body+fill.repeat(pad);if(align===">")return fill.repeat(pad)+body;if(align==="^"){const l=Math.floor(pad/2);return fill.repeat(l)+body+fill.repeat(pad-l)}
  return fill.repeat(pad)+body}
function pctFormat(fmt,args){const A=args instanceof PyTuple?args.a.slice():[args];let k=0;
  const out=fmt.replace(/%(\((\w+)\))?([-+ 0#]*)(\d+|\*)?(?:\.(\d+))?([diouxXeEfFgGcrsa%])/g,(all,_,name,flags,w,p,t)=>{
    if(t==="%")return "%";
    let v=name?dget(args,name):A[k++];if(v===undefined)raise("TypeError","not enough arguments for format string","Thiếu giá trị cho các chỗ % trong chuỗi.");
    let spec="";if(flags.includes("-"))spec+="<";else if(flags.includes("0")&&"diouxXeEfFgG".includes(t))spec+="0=";
    if(flags.includes("+"))spec+="+";else if(flags.includes(" "))spec+=" ";
    spec=spec.replace("0=","");const zero=flags.includes("0")&&!flags.includes("-");
    if(t==="s")return formatSpec(str(v),(flags.includes("-")?"<":">")+(w||"")+(p!=null?"."+p:""));
    if(t==="r"||t==="a")return formatSpec(repr(v),(flags.includes("-")?"<":">")+(w||""));
    if(t==="c")return isInt(v)?String.fromCodePoint(Number(ib(v))):str(v);
    if("diu".includes(t)){if(!isNum(v))raise("TypeError",`%${t} format: a real number is required, not ${tname(v)}`,"");v=isInt(v)?v:normInt(BigInt(Math.trunc(toNum(v))));t="d"}
    return formatSpec(v,(flags.includes("-")?"<":"")+(flags.includes("+")?"+":flags.includes(" ")?" ":"")+(zero?"0":"")+(w||"")+(p!=null?"."+p:"")+t)});
  if(k<A.length&&!(args instanceof PyDict))raise("TypeError","not all arguments converted during string formatting","Số giá trị nhiều hơn số chỗ % trong chuỗi.");
  return out}
return{PySlice,PyCached,PyKey,F,truth,binop,add,sub,mul,truediv,floordiv,mod,pow,bitop,neg,unop,eq,lt,compare,hk,dget,dset,sadd,newDict,contains,toArr,iterOf,iterNext,DONE,rangeArr,rlen,rlenBig,repr,str,floatRepr,fixedStr,formatSpec,pctFormat,dq,seqA,oid,setCallK:f=>CALLK=f};
})();

/* ---------------- 5. hàm có sẵn, phương thức, thư viện ---------------- */
const PYB=(()=>{
"use strict";
const {PyFloat,PyList,PyTuple,PyDict,PySet,PyRange,PyFunc,PyBuiltin,PyMod,PyType,PyIter,PyDeque,PyExcV,PyExc,raise,normInt,isInt,isNum,toNum,toBig,ib,tname}=PY;
const R=PYR,{F,truth,repr,str,eq,lt,hk,dget,dset,sadd,newDict,toArr,dq,seqA}=PYR;
const B=(name,fn,o)=>new PyBuiltin(name,fn,o);
const argN=(name,a,lo,hi)=>{if(a.length<lo||a.length>hi)raise("TypeError",lo===hi?`${name}() takes exactly ${lo} argument${lo===1?"":"s"} (${a.length} given)`:a.length<lo?`${name}() takes at least ${lo} argument${lo===1?"":"s"} (${a.length} given)`:`${name}() takes at most ${hi} arguments (${a.length} given)`,`Hàm ${name}() được gọi với số đối số chưa đúng.`)};
const kwv=(kw,n,d)=>kw&&kw.has(n)?kw.get(n):d;
const idx=(i,n,what)=>{if(!isInt(i))raise("TypeError",`${what} indices must be integers or slices, not ${tname(i)}`,`Chỉ số của ${what} phải là số nguyên.${tname(i)==="float"?" Phép chia / luôn cho số thực; dùng // để chia lấy phần nguyên.":tname(i)==="str"?" Có thể bạn quên int(...) khi đọc dữ liệu.":""}`);
  let k=Number(ib(i));if(k<0)k+=n;return k};
/* chỉ số và lát cắt */
function sliceIdx(s,n){const st=s.st===null?1:Number(ib(s.st));if(st===0)raise("ValueError","slice step cannot be zero","Bước của lát cắt không được bằng 0.");
  const norm=(v,d)=>{if(v===null)return d;let k=Number(ib(v));if(k<0)k+=n;return k};
  let lo,hi;if(st>0){lo=Math.min(Math.max(norm(s.lo,0),0),n);hi=Math.min(Math.max(norm(s.hi,n),0),n)}else{lo=Math.min(Math.max(norm(s.lo,n-1),-1),n-1);hi=Math.min(Math.max(norm(s.hi,-1),-1),n-1)}
  const out=[];if(st>0)for(let i=lo;i<hi;i+=st)out.push(i);else for(let i=lo;i>hi;i+=st)out.push(i);return out}
function getitem(o,i,M){
  if(o instanceof PyList||o instanceof PyTuple||o instanceof PyDeque){const a=seqA(o);
    if(i instanceof R.PySlice){const ix=sliceIdx(i,a.length);if(M)M.cost+=ix.length>>3;const r=ix.map(k=>a[k]);return o instanceof PyTuple?new PyTuple(r):o instanceof PyDeque?raise("TypeError","sequence index must be integer, not 'slice'",""):new PyList(r)}
    const nm=o instanceof PyList?"list":o instanceof PyTuple?"tuple":"deque";const k=idx(i,a.length,nm);
    if(k<0||k>=a.length)raise("IndexError",`${nm} index out of range`,`Chỉ số ${repr(i)} nằm ngoài ${nm}: ${nm} có ${a.length} phần tử nên chỉ số hợp lệ là ${a.length?`0..${a.length-1} (hoặc −${a.length}..−1)`:"không có (đang rỗng)"}.`);
    if(M&&M.snap&&o instanceof PyList)M.rd.add(M.cellOf(o,k));return a[k]}
  if(typeof o==="string"){if(i instanceof R.PySlice){const ix=sliceIdx(i,o.length);return ix.map(k=>o[k]).join("")}const k=idx(i,o.length,"string");
    if(k<0||k>=o.length)raise("IndexError","string index out of range",`Chỉ số ${repr(i)} nằm ngoài chuỗi dài ${o.length} ký tự (chỉ số hợp lệ 0..${o.length-1}).`);if(M&&M.snap)M.rdStr(o,k);return o[k]}
  if(o instanceof PyDict){const v=dget(o,i);if(v!==undefined)return v;
    if(o.ctr)return 0;if(o.dd){const d=M.callf(o.dd,[]);dset(o,i,d);return d}
    raise("KeyError",repr(i),`Khóa ${repr(i)} không có trong dict. Kiểm tra trước bằng “if k in d”, hoặc dùng d.get(k, giá_trị_mặc_định).`)}
  if(o instanceof PyRange){const a=R.rangeArr(o);return getitem(new PyList(a),i,null)}
  if(o instanceof PyType&&(o.name==="list"||o.name==="dict"||o.name==="tuple"||o.name==="set"))return o; // list[int] (chú thích kiểu)
  raise("TypeError",`'${tname(o)}' object is not subscriptable`,`Giá trị kiểu ${tname(o)} không dùng [ ] được.`)}
function setitem(o,i,v,M){
  if(o instanceof PyList||o instanceof PyDeque){const a=seqA(o);
    if(i instanceof R.PySlice){if(o instanceof PyDeque)raise("TypeError","sequence index must be integer, not 'slice'","");const vals=toArr(v,M);
      if(i.st===null||ib(i.st)===1){const ix=sliceIdx(new R.PySlice(i.lo,i.hi,null),a.length);const lo=ix.length?ix[0]:Math.min(Math.max(i.lo===null?0:(ib(i.lo)<0?ib(i.lo)+a.length:Number(ib(i.lo))),0),a.length);a.splice(lo,ix.length,...vals);return}
      const ix=sliceIdx(i,a.length);if(ix.length!==vals.length)raise("ValueError",`attempt to assign sequence of size ${vals.length} to extended slice of size ${ix.length}`,"");ix.forEach((k,j)=>a[k]=vals[j]);return}
    const k=idx(i,a.length,"list");if(k<0||k>=a.length)raise("IndexError","list assignment index out of range",`Gán vào chỉ số ${repr(i)} nằm ngoài list (list có ${a.length} phần tử). Muốn thêm phần tử mới, dùng a.append(x); muốn list có sẵn n ô, tạo bằng [0] * n.`);
    a[k]=v;if(M&&M.snap){M.wr.add(M.cellOf(o,k));M.mut.add(o)}return}
  if(o instanceof PyDict){dset(o,i,v);if(M&&M.snap)M.mut.add(o);return}
  if(typeof o==="string")raise("TypeError","'str' object does not support item assignment","Chuỗi trong Python không sửa từng ký tự được. Hãy đổi sang list: a = list(s), sửa a[i], rồi ghép lại ''.join(a).");
  if(o instanceof PyTuple)raise("TypeError","'tuple' object does not support item assignment","Tuple không sửa được. Dùng list nếu cần thay đổi phần tử.");
  raise("TypeError",`'${tname(o)}' object does not support item assignment`,"")}
function delitem(o,i,M){
  if(o instanceof PyList){if(i instanceof R.PySlice){const ix=new Set(sliceIdx(i,o.a.length));o.a=o.a.filter((_,k)=>!ix.has(k));return}const k=idx(i,o.a.length,"list");if(k<0||k>=o.a.length)raise("IndexError","list assignment index out of range","");o.a.splice(k,1);if(M)M.cost+=o.a.length>>4;return}
  if(o instanceof PyDict){const h=hk(i);if(!o.m.has(h))raise("KeyError",repr(i),`Khóa ${repr(i)} không có trong dict.`);o.m.delete(h);return}
  raise("TypeError",`'${tname(o)}' object doesn't support item deletion`,"")}
function len(v){if(typeof v==="string")return v.length;if(v instanceof PyList||v instanceof PyTuple)return v.a.length;if(v instanceof PyDeque)return dq(v).length;if(v instanceof PyDict||v instanceof PySet)return v.m.size;if(v instanceof PyRange)return R.rlenBig(v);
  raise("TypeError",`object of type '${tname(v)}' has no len()`,`len() chỉ dùng cho chuỗi, list, dict, set, tuple… không dùng cho ${tname(v)}.`)}
/* chuyển kiểu */
function toInt(v,base){
  if(base!==undefined){if(typeof v!=="string")raise("TypeError","int() can't convert non-string with explicit base","");return parseIntStr(v,Number(ib(base)))}
  if(isInt(v))return ib(v);if(v instanceof PyFloat){if(!isFinite(v.v))raise(Number.isNaN(v.v)?"ValueError":"OverflowError",Number.isNaN(v.v)?"cannot convert float NaN to integer":"cannot convert float infinity to integer","");const t=Math.trunc(v.v);return Number.isSafeInteger(t)?t:normInt(BigInt(t))}
  if(typeof v==="string")return parseIntStr(v,10);
  raise("TypeError",`int() argument must be a string, a bytes-like object or a real number, not '${tname(v)}'`,"")}
function parseIntStr(s,base){const t=s.trim().replace(/(\d)_(?=\d)/g,"$1");
  const ok=base===10?/^[+-]?\d+$/.test(t):base===16?/^[+-]?(0[xX])?[0-9a-fA-F]+$/.test(t):base===2?/^[+-]?(0[bB])?[01]+$/.test(t):base===8?/^[+-]?(0[oO])?[0-7]+$/.test(t):new RegExp("^[+-]?[0-9a-z]+$","i").test(t);
  if(!ok||!t)raise("ValueError",`invalid literal for int() with base ${base}: ${repr(s)}`,s.trim().includes(" ")?`Chuỗi ${repr(s)} có nhiều giá trị cách nhau bằng dấu cách, int() chỉ đổi được một số. Hãy tách ra: a, b = map(int, input().split()).`:/^[+-]?\d*\.\d*$/.test(s.trim())&&s.trim()!=="."?`Chuỗi ${repr(s)} là số thực, int() không đổi trực tiếp được. Dùng int(float(s)) hoặc float(s).`:s.trim()===""?"Chuỗi rỗng: có thể dòng nhập đang trống, hoặc đã đọc hết dữ liệu.":`Không đổi được ${repr(s)} thành số nguyên.`);
  const neg=t[0]==="-",d=t.replace(/^[+-]/,"").replace(/^0[xXbBoO]/,"");
  let v;if(base===10)v=BigInt(d);else{v=0n;const B=BigInt(base);for(const c of d.toLowerCase())v=v*B+BigInt(parseInt(c,36))}
  return normInt(neg?-v:v)}
function toFloat(v){if(v instanceof PyFloat)return v;if(isInt(v))return F(toNum(v));
  if(typeof v==="string"){const t=v.trim().toLowerCase().replace(/(\d)_(?=\d)/g,"$1");
    if(/^[+-]?(inf|infinity)$/.test(t))return F(t[0]==="-"?-Infinity:Infinity);if(/^[+-]?nan$/.test(t))return F(NaN);
    if(/^[+-]?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?$/.test(t))return F(parseFloat(t));
    raise("ValueError",`could not convert string to float: ${repr(v)}`,v.trim().includes(" ")?"Chuỗi có nhiều giá trị: tách bằng split() trước khi đổi.":`Không đổi được ${repr(v)} thành số thực.`)}
  raise("TypeError",`float() argument must be a string or a real number, not '${tname(v)}'`,"")}
/* sắp xếp ổn định, có key và reverse */
function sortArr(M,a,key,rev){
  const ks=key&&key!==null?a.map(x=>M.callf(key,[x])):a;
  const ix=a.map((_,i)=>i);
  const cmp=(i,j)=>{const x=ks[i],y=ks[j];if(rev){if(lt(y,x))return -1;if(lt(x,y))return 1;return 0}if(lt(x,y))return -1;if(lt(y,x))return 1;return 0};
  ix.sort(cmp);M.cost+=Math.ceil(a.length*Math.log2(a.length+1));return ix.map(i=>a[i])}
function minmax(M,name,args,kw,sign){
  const key=kwv(kw,"key",null),def=kw&&kw.has("default")?kw.get("default"):undefined;
  let a;if(args.length===1)a=toArr(args[0],M);else if(args.length>1)a=args;else raise("TypeError",`${name} expected at least 1 argument, got 0`,"");
  if(!a.length){if(def!==undefined)return def;raise("ValueError",`${name}() iterable argument is empty`,`${name}() được gọi với một dãy rỗng. Kiểm tra dãy có phần tử trước, hoặc dùng ${name}(a, default=...).`)}
  M.cost+=a.length>>2;
  let best=a[0],bk=key!==null?M.callf(key,[best]):best;
  for(let i=1;i<a.length;i++){const k=key!==null?M.callf(key,[a[i]]):a[i];if(sign<0?lt(k,bk):lt(bk,k)){best=a[i];bk=k}}
  return best}
/* ---- phương thức của từng kiểu ---- */
const LISTM={
  append(s,a,kw,M){argN("append",a,1,1);s.a.push(a[0]);if(M.snap){M.mut.add(s);M.wr.add(M.cellOf(s,s.a.length-1))}return null},
  extend(s,a,kw,M){argN("extend",a,1,1);const v=toArr(a[0],M);for(const x of v)s.a.push(x);M.cost+=v.length>>3;if(M.snap)M.mut.add(s);return null},
  insert(s,a,kw,M){argN("insert",a,2,2);let k=Number(ib(a[0]));const n=s.a.length;if(k<0)k=Math.max(0,k+n);if(k>n)k=n;s.a.splice(k,0,a[1]);M.cost+=(n-k)>>4;if(M.snap){M.mut.add(s);M.wr.add(M.cellOf(s,k))}return null},
  pop(s,a,kw,M){argN("pop",a,0,1);if(!s.a.length)raise("IndexError","pop from empty list","Gọi pop() trên list rỗng. Kiểm tra list còn phần tử trước khi lấy ra.");let k=a.length?Number(ib(a[0])):s.a.length-1;if(k<0)k+=s.a.length;if(k<0||k>=s.a.length)raise("IndexError","pop index out of range","");M.cost+=(s.a.length-1-k)>>4;if(M.snap)M.mut.add(s);return s.a.splice(k,1)[0]},
  remove(s,a,kw,M){argN("remove",a,1,1);const k=s.a.findIndex(x=>eq(x,a[0]));M.cost+=s.a.length>>3;if(k<0)raise("ValueError","list.remove(x): x not in list",`Giá trị ${repr(a[0])} không có trong list nên không xóa được. Kiểm tra bằng “if x in a” trước.`);s.a.splice(k,1);if(M.snap)M.mut.add(s);return null},
  index(s,a,kw,M){argN("index",a,1,3);const lo=a.length>1?Number(ib(a[1])):0,hi=a.length>2?Number(ib(a[2])):s.a.length;for(let i=Math.max(0,lo<0?lo+s.a.length:lo);i<Math.min(hi<0?hi+s.a.length:hi,s.a.length);i++){M.cost+=0.25;if(eq(s.a[i],a[0]))return i}raise("ValueError",`${repr(a[0])} is not in list`,`Giá trị ${repr(a[0])} không có trong list.`)},
  count(s,a,kw,M){argN("count",a,1,1);M.cost+=s.a.length>>2;return s.a.filter(x=>eq(x,a[0])).length},
  sort(s,a,kw,M){if(a.length)raise("TypeError","sort() takes no positional arguments","Viết a.sort(reverse=True) hoặc a.sort(key=...)");s.a=sortArr(M,s.a,kwv(kw,"key",null),truth(kwv(kw,"reverse",false)));if(M.snap)M.mut.add(s);return null},
  reverse(s,a,kw,M){s.a.reverse();M.cost+=s.a.length>>3;if(M.snap)M.mut.add(s);return null},
  copy(s){return new PyList(s.a.slice())},
  clear(s,a,kw,M){s.a.length=0;if(M.snap)M.mut.add(s);return null}};
const TUPM={count:LISTM.count,index:LISTM.index};
const STRM={
  split(s,a,kw){const sep=a.length?a[0]:kwv(kw,"sep",null),mx=a.length>1?Number(ib(a[1])):Number(ib(kwv(kw,"maxsplit",-1)));
    if(sep===null){const t=s.replace(/^[\s]+/,"");if(!t)return new PyList([]);if(mx<0)return new PyList(t.replace(/[\s]+$/,"").split(/[\s]+/));const out=[];let r=t;for(let k=0;k<mx;k++){const m=/[\s]+/.exec(r);if(!m)break;out.push(r.slice(0,m.index));r=r.slice(m.index+m[0].length);if(!r)break}if(r)out.push(r.replace(/[\s]+$/,""));return new PyList(out)}
    if(sep==="")raise("ValueError","empty separator","");const parts=s.split(sep);if(mx>=0&&parts.length>mx+1){const h=parts.slice(0,mx);h.push(parts.slice(mx).join(sep));return new PyList(h)}return new PyList(parts)},
  rsplit(s,a,kw){if(!a.length||a.length<2)return STRM.split(s,a,kw);const sep=a[0],mx=Number(ib(a[1]));const parts=s.split(sep);if(parts.length>mx+1){const t=parts.slice(parts.length-mx);t.unshift(parts.slice(0,parts.length-mx).join(sep));return new PyList(t)}return new PyList(parts)},
  strip(s,a){return a.length&&a[0]!==null?stripC(s,a[0],3):s.replace(/^\s+|\s+$/g,"")},lstrip(s,a){return a.length&&a[0]!==null?stripC(s,a[0],1):s.replace(/^\s+/,"")},rstrip(s,a){return a.length&&a[0]!==null?stripC(s,a[0],2):s.replace(/\s+$/,"")},
  join(s,a,kw,M){argN("join",a,1,1);const v=toArr(a[0],M);v.forEach((x,i)=>{if(typeof x!=="string")raise("TypeError",`sequence item ${i}: expected str instance, ${tname(x)} found`,"join() chỉ ghép được các chuỗi. Đổi số thành chuỗi trước: ' '.join(map(str, a)).")});M.cost+=v.length>>3;return v.join(s)},
  upper(s){return s.toUpperCase()},lower(s){return s.toLowerCase()},title(s){return s.replace(/\w\S*/g,w=>w[0].toUpperCase()+w.slice(1).toLowerCase())},capitalize(s){return s?s[0].toUpperCase()+s.slice(1).toLowerCase():s},swapcase(s){return [...s].map(c=>c===c.toUpperCase()?c.toLowerCase():c.toUpperCase()).join("")},
  isdigit(s){return /^[0-9]+$/.test(s)},isnumeric(s){return /^[0-9]+$/.test(s)},isdecimal(s){return /^[0-9]+$/.test(s)},isalpha(s){return /^\p{L}+$/u.test(s)},isalnum(s){return /^[\p{L}0-9]+$/u.test(s)},isspace(s){return /^\s+$/.test(s)},
  isupper(s){return /\p{Lu}/u.test(s)&&!/\p{Ll}/u.test(s)},islower(s){return /\p{Ll}/u.test(s)&&!/\p{Lu}/u.test(s)},
  startswith(s,a){const p=a[0];if(p instanceof PyTuple)return p.a.some(x=>s.startsWith(x,a[1]!=null?Number(ib(a[1])):0));return s.startsWith(p,a.length>1?Number(ib(a[1])):0)},
  endswith(s,a){const p=a[0];if(p instanceof PyTuple)return p.a.some(x=>s.endsWith(x));return s.endsWith(p)},
  find(s,a){const st=a.length>1?Number(ib(a[1])):0;return s.indexOf(a[0],st<0?st+s.length:st)},rfind(s,a){return s.lastIndexOf(a[0])},
  index(s,a){const r=s.indexOf(a[0],a.length>1?Number(ib(a[1])):0);if(r<0)raise("ValueError","substring not found",`Chuỗi con ${repr(a[0])} không có trong chuỗi.`);return r},
  rindex(s,a){const r=s.lastIndexOf(a[0]);if(r<0)raise("ValueError","substring not found","");return r},
  count(s,a){if(a[0]==="")return s.length+1;let c=0,i=0;for(;;){const k=s.indexOf(a[0],i);if(k<0)break;c++;i=k+a[0].length}return c},
  replace(s,a){const c=a.length>2?Number(ib(a[2])):-1;if(c<0)return s.split(a[0]).join(a[1]);let r=s;let out="",k=0;for(let i=0;i<c;i++){const j=r.indexOf(a[0]);if(j<0)break;out+=r.slice(0,j)+a[1];r=r.slice(j+a[0].length)}return out+r},
  zfill(s,a){const w=Number(ib(a[0]));const sg=s[0]==="-"||s[0]==="+"?s[0]:"";const b=sg?s.slice(1):s;return sg+b.padStart(w-sg.length,"0")},
  ljust(s,a){return s.padEnd(Number(ib(a[0])),a[1]||" ")},rjust(s,a){return s.padStart(Number(ib(a[0])),a[1]||" ")},
  center(s,a){const w=Number(ib(a[0])),f=a[1]||" ";const p=Math.max(0,w-s.length);const l=Math.floor(p/2)+((p%2)&&(w%2)?1:0);return f.repeat(l)+s+f.repeat(p-l)},
  splitlines(s){return new PyList(s.split(/\r?\n/).filter((x,i,arr)=>!(i===arr.length-1&&x==="")))},
  partition(s,a){const k=s.indexOf(a[0]);return k<0?new PyTuple([s,"",""]):new PyTuple([s.slice(0,k),a[0],s.slice(k+a[0].length)])},
  format(s,a,kw){return strFormat(s,a,kw)},
  encode(){raise("NotImplementedError","","bytes chưa có trong trình mô phỏng.")}};
function stripC(s,cs,w){let i=0,j=s.length;if(w&1)while(i<j&&cs.includes(s[i]))i++;if(w&2)while(j>i&&cs.includes(s[j-1]))j--;return s.slice(i,j)}
function strFormat(fmt,a,kw){let auto=0;
  return fmt.replace(/\{\{|\}\}|\{([^{}!:]*)(?:!([rsa]))?(?::((?:[^{}]|\{[^{}]*\})*))?\}/g,(all,f,conv,spec)=>{
    if(all==="{{")return "{";if(all==="}}")return "}";
    let v;const path=(f||"").split(/(?=[.[])/);const head=path.shift();
    if(head==="")v=a[auto++];else if(/^\d+$/.test(head))v=a[+head];else v=kw&&kw.get(head);
    if(v===undefined)raise(head===""||/^\d+$/.test(head)?"IndexError":"KeyError",head===""||/^\d+$/.test(head)?`Replacement index ${head||auto-1} out of range for positional args tuple`:repr(head),"Số chỗ {} nhiều hơn số giá trị truyền vào format().");
    for(const p of path){if(p[0]==="[")v=getitem(v,/^\d+$/.test(p.slice(1,-1))?+p.slice(1,-1):p.slice(1,-1),null)}
    if(conv==="r")v=repr(v);else if(conv==="s")v=str(v);
    if(spec&&spec.includes("{"))spec=spec.replace(/\{(\w*)\}/g,(m,n)=>str(n===""?a[auto++]:/^\d+$/.test(n)?a[+n]:kw.get(n)));
    return spec?R.formatSpec(v,spec):str(v)})}
const DICTM={
  get(s,a){argN("get",a,1,2);const v=dget(s,a[0]);return v===undefined?(a.length>1?a[1]:null):v},
  keys(s){const it=new PyIter([...s.m.values()].map(e=>e[0]));it.kind="dict_keys";it.view=s;return it},
  values(s){const it=new PyIter([...s.m.values()].map(e=>e[1]));it.kind="dict_values";it.view=s;return it},
  items(s){const it=new PyIter([...s.m.values()].map(e=>new PyTuple([e[0],e[1]])));it.kind="dict_items";it.view=s;return it},
  setdefault(s,a,kw,M){const v=dget(s,a[0]);if(v!==undefined)return v;const d=a.length>1?a[1]:null;dset(s,a[0],d);if(M.snap)M.mut.add(s);return d},
  pop(s,a,kw,M){const h=hk(a[0]),e=s.m.get(h);if(!e){if(a.length>1)return a[1];raise("KeyError",repr(a[0]),`Khóa ${repr(a[0])} không có trong dict.`)}s.m.delete(h);if(M.snap)M.mut.add(s);return e[1]},
  popitem(s){if(!s.m.size)raise("KeyError","'popitem(): dictionary is empty'","");const k=[...s.m.keys()].pop();const e=s.m.get(k);s.m.delete(k);return new PyTuple([e[0],e[1]])},
  update(s,a,kw,M){if(a.length){const o=a[0];if(o instanceof PyDict)o.m.forEach(e=>dset(s,e[0],e[1]));else toArr(o,M).forEach(p=>{const q=toArr(p,M);dset(s,q[0],q[1])})}if(kw)kw.forEach((v,k)=>dset(s,k,v));if(M.snap)M.mut.add(s);return null},
  copy(s){const d=newDict();s.m.forEach((e,k)=>d.m.set(k,[e[0],e[1]]));if(s.dd){d.dd=s.dd;d.ddName=s.ddName}if(s.ctr)d.ctr=true;return d},
  clear(s){s.m.clear();return null},
  most_common(s,a){const e=[...s.m.values()];const ix=e.map((_,i)=>i).sort((i,j)=>{const x=e[i][1],y=e[j][1];return lt(y,x)?-1:lt(x,y)?1:0});let r=ix.map(i=>new PyTuple([e[i][0],e[i][1]]));if(a.length&&a[0]!==null)r=r.slice(0,Number(ib(a[0])));return new PyList(r)},
  elements(s){const out=[];s.m.forEach(e=>{for(let i=0;i<toNum(e[1]);i++)out.push(e[0])});return new PyIter(out)},
  total(s){let t=0;s.m.forEach(e=>t=R.add(t,e[1]));return t}};
const SETM={
  add(s,a,kw,M){argN("add",a,1,1);sadd(s,a[0]);if(M.snap)M.mut.add(s);return null},
  remove(s,a,kw,M){const h=hk(a[0]);if(!s.m.has(h))raise("KeyError",repr(a[0]),`Phần tử ${repr(a[0])} không có trong set.`);s.m.delete(h);if(M.snap)M.mut.add(s);return null},
  discard(s,a,kw,M){s.m.delete(hk(a[0]));if(M.snap)M.mut.add(s);return null},
  pop(s){if(!s.m.size)raise("KeyError","'pop from an empty set'","");const k=s.m.keys().next().value;const v=s.m.get(k);s.m.delete(k);return v},
  update(s,a,kw,M){a.forEach(o=>toArr(o,M).forEach(x=>sadd(s,x)));return null},
  union(s,a,kw,M){const r=new PySet();s.m.forEach((v,k)=>r.m.set(k,v));a.forEach(o=>toArr(o,M).forEach(x=>sadd(r,x)));return r},
  intersection(s,a,kw,M){let r=new PySet();s.m.forEach((v,k)=>r.m.set(k,v));a.forEach(o=>{const t=new Set(toArr(o,M).map(hk));const q=new PySet();r.m.forEach((v,k)=>{if(t.has(k))q.m.set(k,v)});r=q});return r},
  difference(s,a,kw,M){const r=new PySet();const t=new Set();a.forEach(o=>toArr(o,M).forEach(x=>t.add(hk(x))));s.m.forEach((v,k)=>{if(!t.has(k))r.m.set(k,v)});return r},
  issubset(s,a,kw,M){const t=new Set(toArr(a[0],M).map(hk));for(const k of s.m.keys())if(!t.has(k))return false;return true},
  issuperset(s,a,kw,M){return toArr(a[0],M).every(x=>s.m.has(hk(x)))},
  copy(s){const r=new PySet();s.m.forEach((v,k)=>r.m.set(k,v));return r},clear(s){s.m.clear();return null}};
const DEQM={
  append(s,a,kw,M){dq(s).push(a[0]);if(s.maxlen!=null&&s.a.length>s.maxlen)s.a.shift();if(M.snap)M.mut.add(s);return null},
  appendleft(s,a,kw,M){dq(s).unshift(a[0]);if(s.maxlen!=null&&s.a.length>s.maxlen)s.a.pop();if(M.snap)M.mut.add(s);return null},
  pop(s,a,kw,M){const x=dq(s);if(!x.length)raise("IndexError","pop from an empty deque","Gọi pop() trên deque rỗng.");if(M.snap)M.mut.add(s);return x.pop()},
  popleft(s,a,kw,M){if(s.a.length-s.h<=0)raise("IndexError","pop from an empty deque","Gọi popleft() trên deque rỗng. Kiểm tra “while q:” trước khi lấy.");const v=s.a[s.h];s.a[s.h]=undefined;s.h++;if(s.h>64&&s.h*2>s.a.length){s.a=s.a.slice(s.h);s.h=0}if(M.snap)M.mut.add(s);return v},
  extend(s,a,kw,M){const x=dq(s);toArr(a[0],M).forEach(v=>x.push(v));return null},
  extendleft(s,a,kw,M){const x=dq(s);toArr(a[0],M).forEach(v=>x.unshift(v));return null},
  rotate(s,a){const x=dq(s);const n=x.length;if(!n)return null;let k=((Number(ib(a.length?a[0]:1))%n)+n)%n;s.a=x.slice(n-k).concat(x.slice(0,n-k));return null},
  clear(s){s.a=[];s.h=0;return null},count(s,a){return dq(s).filter(x=>eq(x,a[0])).length},index(s,a){const k=dq(s).findIndex(x=>eq(x,a[0]));if(k<0)raise("ValueError",`${repr(a[0])} is not in deque`,"");return k},
  copy(s){const d=new PyDeque(dq(s).slice());d.h=0;return d},remove(s,a){const x=dq(s);const k=x.findIndex(v=>eq(v,a[0]));if(k<0)raise("ValueError","deque.remove(x): x not in deque","");x.splice(k,1);return null}};
const HINT={push:"append",push_back:"append",length:"len(a)",size:"len(a)",add:"append",pop_back:"pop",contains:"x in a",lenght:"len(a)",toUpperCase:"upper",toLowerCase:"lower",trim:"strip",substr:"cắt lát s[i:j]",substring:"cắt lát s[i:j]",charAt:"s[i]",indexOf:"find (chuỗi) hoặc index (list)",empty:"len(a) == 0",front:"a[0]",back:"a[-1]",begin:"(Python không có iterator kiểu C++)",sort_values:"sorted"};
function getattr(o,n,M){
  if(o instanceof PyMod){if(n in o.attrs)return o.attrs[n];raise("AttributeError",`module '${o.name}' has no attribute '${n}'`,`Thư viện ${o.name} không có ${n} (hoặc trình mô phỏng chưa hỗ trợ).`)}
  let T=null;
  if(o instanceof PyList)T=LISTM;else if(typeof o==="string")T=STRM;else if(o instanceof PyDict)T=DICTM;else if(o instanceof PySet)T=SETM;else if(o instanceof PyTuple)T=TUPM;else if(o instanceof PyDeque)T=DEQM;
  if(T&&Object.prototype.hasOwnProperty.call(T,n)&&!(T===DICTM&&!o.ctr&&(n==="most_common"||n==="elements"||n==="total")))return new PyBuiltin(n,(a,kw,MM)=>T[n](o,a,kw,MM),{self:o});
  if(o instanceof PyIter&&o.view instanceof PyDict){} 
  if(isInt(o)&&n==="bit_length")return new PyBuiltin(n,()=>{const b=toBig(o);return b===0n?0:(b<0n?-b:b).toString(2).length},{self:o});
  if(o instanceof PyFloat&&n==="is_integer")return new PyBuiltin(n,()=>Number.isInteger(o.v),{self:o});
  if(o instanceof PyDeque&&n==="maxlen")return o.maxlen==null?null:o.maxlen;
  if(o instanceof PyExcV&&n==="args")return new PyTuple(o.args);
  if(o instanceof PyMod===false&&o&&o.isStdin)return null;
  const h=HINT[n];
  raise("AttributeError",`'${tname(o)}' object has no attribute '${n}'`,`Kiểu ${tname(o)} không có ${n}.${h?` Trong Python dùng ${h}.`:""}`)}
/* ---- hàm có sẵn ---- */
function mkIter(a,kind){const it=new PyIter(a);it.kind=kind;return it}
const TYPES={};
const T=(name,call,o)=>TYPES[name]=new PyType(name,call,o);
T("int",(a,kw)=>{if(!a.length)return 0;const b=a.length>1?a[1]:kw&&kw.has("base")?kw.get("base"):undefined;return toInt(a[0],b)});
T("float",a=>a.length?toFloat(a[0]):F(0));
T("str",a=>a.length?str(a[0]):"");
T("bool",a=>a.length?truth(a[0]):false);
T("list",(a,kw,M)=>new PyList(a.length?toArr(a[0],M,"Đối số của list()"):[]));
T("tuple",(a,kw,M)=>new PyTuple(a.length?toArr(a[0],M):[]));
T("set",(a,kw,M)=>{const s=new PySet();if(a.length)toArr(a[0],M).forEach(x=>sadd(s,x));return s});
T("frozenset",(a,kw,M)=>{const s=new PySet();if(a.length)toArr(a[0],M).forEach(x=>sadd(s,x));return s});
T("dict",(a,kw,M)=>{const d=newDict();if(a.length){const o=a[0];if(o instanceof PyDict)o.m.forEach(e=>dset(d,e[0],e[1]));else toArr(o,M).forEach(p=>{const q=toArr(p,M);if(q.length!==2)raise("ValueError",`dictionary update sequence element has length ${q.length}; 2 is required`,"");dset(d,q[0],q[1])})}if(kw)kw.forEach((v,k)=>dset(d,k,v));return d});
T("range",(a)=>{argN("range",a,1,3);a.forEach(x=>{if(!isInt(x))raise("TypeError",`'${tname(x)}' object cannot be interpreted as an integer`,`range() chỉ nhận số nguyên.${tname(x)==="float"?" Phép / cho số thực; dùng // hoặc int(...).":tname(x)==="str"?" Có thể bạn quên int(input()).":""}`)});
  const [s,e,st]=a.length===1?[0,ib(a[0]),1]:[ib(a[0]),ib(a[1]),a.length>2?ib(a[2]):1];if(st===0||st===0n)raise("ValueError","range() arg 3 must not be zero","Bước của range không được bằng 0.");return new PyRange(s,e,st)});
T("type",(a)=>{argN("type",a,1,1);const n=tname(a[0]);return TYPES[n]||new PyType(n)});
T("object",()=>raise("TypeError","object() chưa hỗ trợ",""));
const EXC={};const exParent={Exception:"BaseException",ArithmeticError:"Exception",ZeroDivisionError:"ArithmeticError",OverflowError:"ArithmeticError",LookupError:"Exception",IndexError:"LookupError",KeyError:"LookupError",ValueError:"Exception",TypeError:"Exception",NameError:"Exception",UnboundLocalError:"NameError",AttributeError:"Exception",RuntimeError:"Exception",RecursionError:"RuntimeError",NotImplementedError:"RuntimeError",EOFError:"Exception",StopIteration:"Exception",AssertionError:"Exception",MemoryError:"Exception",ImportError:"Exception",ModuleNotFoundError:"ImportError",SystemExit:"BaseException",KeyboardInterrupt:"BaseException",BaseException:null,SyntaxError:"Exception",IndentationError:"SyntaxError"};
for(const n in exParent){EXC[n]=new PyType(n,(a)=>new PyExcV(n,a),{exc:true})}
function excIs(type,cls){for(let t=type;t;t=exParent[t])if(t===cls)return true;return false}
const BUILTINS=new Map();
const def=(n,f)=>BUILTINS.set(n,B(n,f));
Object.values(TYPES).forEach(t=>BUILTINS.set(t.name,t));Object.values(EXC).forEach(t=>BUILTINS.set(t.name,t));
def("print",(a,kw,M)=>{const sep=kw&&kw.has("sep")&&kw.get("sep")!==null?kw.get("sep"):" ",end=kw&&kw.has("end")&&kw.get("end")!==null?kw.get("end"):"\n";
  const err=kw&&kw.has("file")&&kw.get("file")&&kw.get("file").name==="sys.stderr";
  let n=0;const s=a.map(x=>{const t=str(x);n+=t.length;return t}).join(str(sep))+str(end);M.cost+=n>>6;M.write(s,err);return null});
def("input",(a,kw,M)=>{if(a.length)M.write(str(a[0]));return M.readLine(true)});
def("len",(a)=>{argN("len",a,1,1);return len(a[0])});
def("abs",(a)=>{argN("abs",a,1,1);const v=a[0];if(isInt(v)){const b=ib(v);return typeof b==="bigint"?normInt(b<0n?-b:b):Math.abs(b)}if(v instanceof PyFloat)return F(Math.abs(v.v));raise("TypeError",`bad operand type for abs(): '${tname(v)}'`,"")});
def("min",(a,kw,M)=>minmax(M,"min",a,kw,-1));def("max",(a,kw,M)=>minmax(M,"max",a,kw,1));
def("sum",(a,kw,M)=>{argN("sum",a,1,2);let s=a.length>1?a[1]:kwv(kw,"start",0);if(typeof s==="string")raise("TypeError","sum() can't sum strings [use ''.join(seq) instead]","Dùng ''.join(...) để nối chuỗi.");const v=toArr(a[0],M,"Đối số của sum()");M.cost+=v.length>>2;for(const x of v)s=R.add(s,x);return s});
def("sorted",(a,kw,M)=>{argN("sorted",a,1,1);return new PyList(sortArr(M,toArr(a[0],M,"Đối số của sorted()"),kwv(kw,"key",null),truth(kwv(kw,"reverse",false))))});
def("reversed",(a,kw,M)=>{argN("reversed",a,1,1);const v=a[0];if(v instanceof PyDict||v instanceof PySet)raise("TypeError",`'${tname(v)}' object is not reversible`,"");return mkIter(toArr(v,M).reverse(),"list_reverseiterator")});
def("enumerate",(a,kw,M)=>{argN("enumerate",a,1,2);let st=a.length>1?ib(a[1]):ib(kwv(kw,"start",0));const v=toArr(a[0],M);M.cost+=v.length>>3;return mkIter(v.map((x,i)=>new PyTuple([R.add(st,i),x])),"enumerate")});
def("zip",(a,kw,M)=>{const L=a.map(x=>toArr(x,M));const n=L.length?Math.min(...L.map(x=>x.length)):0;if(kw&&truth(kwv(kw,"strict",false))&&L.some(x=>x.length!==n))raise("ValueError","zip() arguments have different lengths","");const out=[];for(let i=0;i<n;i++)out.push(new PyTuple(L.map(x=>x[i])));return mkIter(out,"zip")});
def("map",(a,kw,M)=>{if(a.length<2)raise("TypeError","map() must have at least two arguments.","");const f=a[0];const L=a.slice(1).map(x=>toArr(x,M));const n=Math.min(...L.map(x=>x.length));const out=[];
  if(f instanceof PyType&&f.name==="int"&&L.length===1){M.cost+=n>>2;for(const x of L[0])out.push(toInt(x));return mkIter(out,"map")}
  for(let i=0;i<n;i++)out.push(M.callf(f,L.map(x=>x[i])));return mkIter(out,"map")});
def("filter",(a,kw,M)=>{argN("filter",a,2,2);const f=a[0];return mkIter(toArr(a[1],M).filter(x=>truth(f===null?x:M.callf(f,[x]))),"filter")});
def("any",(a,kw,M)=>{argN("any",a,1,1);for(const x of toArr(a[0],M))if(truth(x))return true;return false});
def("all",(a,kw,M)=>{argN("all",a,1,1);for(const x of toArr(a[0],M))if(!truth(x))return false;return true});
def("round",(a)=>{argN("round",a,1,2);const v=a[0];const nd=a.length>1&&a[1]!==null?Number(ib(a[1])):null;
  if(isInt(v)){if(nd===null||nd>=0)return ib(v);const p=10n**BigInt(-nd);const x=toBig(v);let q=x/p,r=x%p;if(r<0n){r+=p;q-=1n}if(2n*r>p||(2n*r===p&&(q&1n)))q+=1n;return normInt(q*p)}
  if(!(v instanceof PyFloat))raise("TypeError",`type ${tname(v)} doesn't define __round__ method`,"");
  if(nd===null){const x=v.v;if(!isFinite(x))raise(Number.isNaN(x)?"ValueError":"OverflowError",Number.isNaN(x)?"cannot convert float NaN to integer":"cannot convert float infinity to integer","");const f=Math.floor(x),d=x-f;let r=d>0.5?f+1:d<0.5?f:(f%2===0?f:f+1);return Number.isSafeInteger(r)?r:normInt(BigInt(r))}
  return F(parseFloat(R.fixedStr(v.v,nd)))});
def("pow",(a)=>{argN("pow",a,2,3);return R.pow(a[0],a[1],a.length>2?a[2]:undefined)});
def("divmod",(a)=>{argN("divmod",a,2,2);return new PyTuple([R.floordiv(a[0],a[1]),R.mod(a[0],a[1])])});
def("ord",(a)=>{argN("ord",a,1,1);const s=a[0];if(typeof s!=="string"||[...s].length!==1)raise("TypeError",typeof s==="string"?`ord() expected a character, but string of length ${s.length} found`:`ord() expected string of length 1, but ${tname(s)} found`,"ord() nhận đúng một ký tự.");return s.codePointAt(0)});
def("chr",(a)=>{argN("chr",a,1,1);const c=Number(ib(a[0]));if(!isInt(a[0]))raise("TypeError",`'${tname(a[0])}' object cannot be interpreted as an integer`,"");if(c<0||c>0x10ffff)raise("ValueError","chr() arg not in range(0x110000)","");return String.fromCodePoint(c)});
def("isinstance",(a)=>{argN("isinstance",a,2,2);const ts=a[1] instanceof PyTuple?a[1].a:[a[1]];const n=tname(a[0]);return ts.some(t=>t instanceof PyType&&(t.name===n||(t.name==="int"&&n==="bool")||(t.exc&&a[0] instanceof PyExcV&&excIs(a[0].type,t.name))||(t.name==="dict"&&a[0] instanceof PyDict)))});
def("hex",(a)=>{const b=toBig(a[0]);return (b<0n?"-0x":"0x")+(b<0n?-b:b).toString(16)});
def("bin",(a)=>{const b=toBig(a[0]);return (b<0n?"-0b":"0b")+(b<0n?-b:b).toString(2)});
def("oct",(a)=>{const b=toBig(a[0]);return (b<0n?"-0o":"0o")+(b<0n?-b:b).toString(8)});
def("repr",(a)=>repr(a[0]));def("ascii",(a)=>repr(a[0]));
def("format",(a)=>R.formatSpec(a[0],a.length>1?a[1]:""));
def("hash",(a)=>{const h=hk(a[0]);let x=0;for(const c of h)x=(x*31+c.charCodeAt(0))|0;return isInt(a[0])?ib(a[0]):x});
def("id",(a)=>140000000000000+R.oid(a[0])*48);
def("iter",(a,kw,M)=>{const v=a[0];if(v instanceof PyIter)return v;return mkIter(toArr(v,M),"iterator")});
def("next",(a)=>{const it=a[0];if(!(it instanceof PyIter))raise("TypeError",`'${tname(it)}' object is not an iterator`,"Dùng iter(...) để tạo bộ lặp trước khi gọi next().");if(it.i<it.a.length)return it.a[it.i++];if(a.length>1)return a[1];raise("StopIteration","","Bộ lặp đã hết phần tử.")});
def("callable",(a)=>a[0] instanceof PyFunc||a[0] instanceof PyBuiltin||a[0] instanceof PyType||a[0] instanceof R.PyCached);
def("exit",(a)=>{throw{sysexit:a.length?a[0]:null}});def("quit",(a)=>{throw{sysexit:a.length?a[0]:null}});
def("open",()=>raise("OSError","open() chưa hỗ trợ","Trình mô phỏng không đọc ghi file. Hãy đọc dữ liệu bằng input()."));
def("eval",()=>raise("NotImplementedError","eval() chưa hỗ trợ","eval chưa có trong trình mô phỏng."));
def("exec",()=>raise("NotImplementedError","exec() chưa hỗ trợ",""));
def("vars",()=>raise("NotImplementedError","vars() chưa hỗ trợ",""));
def("globals",()=>raise("NotImplementedError","globals() chưa hỗ trợ",""));
def("locals",()=>raise("NotImplementedError","locals() chưa hỗ trợ",""));
def("getattr",(a,kw,M)=>getattr(a[0],a[1],M));
/* ---- thư viện ---- */
const MODS={};
const mod=(name,attrs)=>MODS[name]=new PyMod(name,attrs);
const fl=(f)=>(a)=>F(f(...a.map(toNum)));
const need1=(n,f)=>(a)=>{argN(n,a,1,1);return f(a[0])};
const isqrt=b=>{if(b<0n)raise("ValueError","isqrt() argument must be nonnegative","");if(b<2n)return b;let x=BigInt(Math.floor(Math.sqrt(Number(b))));while(x*x>b)x--;while((x+1n)*(x+1n)<=b)x++;return x};
const gcd2=(x,y)=>{x=x<0n?-x:x;y=y<0n?-y:y;while(y){[x,y]=[y,x%y]}return x};
const mathDomain=()=>raise("ValueError","math domain error","Giá trị đưa vào hàm toán học không hợp lệ (ví dụ căn bậc hai của số âm, log của số ≤ 0).");
mod("math",{pi:F(Math.PI),e:F(Math.E),tau:F(2*Math.PI),inf:F(Infinity),nan:F(NaN),
  sqrt:B("sqrt",a=>{const x=toNum(a[0]);if(x<0)mathDomain();return F(Math.sqrt(x))}),
  isqrt:B("isqrt",a=>normInt(isqrt(toBig(a[0])))),
  floor:B("floor",a=>{const v=a[0];if(isInt(v))return ib(v);const f=Math.floor(toNum(v));return Number.isSafeInteger(f)?f:normInt(BigInt(f))}),
  ceil:B("ceil",a=>{const v=a[0];if(isInt(v))return ib(v);const f=Math.ceil(toNum(v));return Number.isSafeInteger(f)?f:normInt(BigInt(f))}),
  trunc:B("trunc",a=>toInt(a[0])),
  gcd:B("gcd",a=>normInt(a.reduce((g,x)=>gcd2(g,toBig(x)),0n))),
  lcm:B("lcm",a=>normInt(a.reduce((l,x)=>{const y=toBig(x);if(l===0n||y===0n)return 0n;const g=gcd2(l,y);const r=l/g*y;return r<0n?-r:r},1n))),
  factorial:B("factorial",a=>{const n=toBig(a[0]);if(n<0n)raise("ValueError","factorial() not defined for negative values","");if(n>20000n)raise("MemoryError","","Giai thừa quá lớn.");let r=1n;for(let i=2n;i<=n;i++)r*=i;return normInt(r)}),
  comb:B("comb",a=>{const n=toBig(a[0]),k=toBig(a[1]);if(k<0n||n<0n)raise("ValueError","n must be a non-negative integer","");if(k>n)return 0;let r=1n;const kk=k>n-k?n-k:k;for(let i=0n;i<kk;i++)r=r*(n-i)/(i+1n);return normInt(r)}),
  perm:B("perm",a=>{const n=toBig(a[0]),k=a.length>1?toBig(a[1]):n;if(k>n)return 0;let r=1n;for(let i=0n;i<k;i++)r*=n-i;return normInt(r)}),
  log:B("log",a=>{const x=toNum(a[0]);if(x<=0)mathDomain();return F(a.length>1?Math.log(x)/Math.log(toNum(a[1])):Math.log(x))}),
  log2:B("log2",a=>{const x=toNum(a[0]);if(x<=0)mathDomain();return F(Math.log2(x))}),log10:B("log10",a=>{const x=toNum(a[0]);if(x<=0)mathDomain();return F(Math.log10(x))}),
  exp:B("exp",fl(Math.exp)),sin:B("sin",fl(Math.sin)),cos:B("cos",fl(Math.cos)),tan:B("tan",fl(Math.tan)),atan:B("atan",fl(Math.atan)),atan2:B("atan2",fl(Math.atan2)),asin:B("asin",fl(Math.asin)),acos:B("acos",fl(Math.acos)),
  hypot:B("hypot",a=>F(Math.hypot(...a.map(toNum)))),fabs:B("fabs",fl(Math.abs)),pow:B("pow",a=>F(Math.pow(toNum(a[0]),toNum(a[1])))),
  isinf:B("isinf",a=>!isFinite(toNum(a[0]))&&!Number.isNaN(toNum(a[0]))),isnan:B("isnan",a=>Number.isNaN(toNum(a[0]))),isfinite:B("isfinite",a=>isFinite(toNum(a[0]))),
  isclose:B("isclose",(a,kw)=>{const x=toNum(a[0]),y=toNum(a[1]);const rt=toNum(kwv(kw,"rel_tol",F(1e-9))),at=toNum(kwv(kw,"abs_tol",F(0)));return Math.abs(x-y)<=Math.max(rt*Math.max(Math.abs(x),Math.abs(y)),at)}),
  prod:B("prod",(a,kw,M)=>{let p=kwv(kw,"start",1);for(const x of toArr(a[0],M))p=R.mul(p,x);return p}),
  fsum:B("fsum",(a,kw,M)=>F(toArr(a[0],M).reduce((s,x)=>s+toNum(x),0))),
  dist:B("dist",(a,kw,M)=>{const p=toArr(a[0],M),q=toArr(a[1],M);return F(Math.hypot(...p.map((x,i)=>toNum(x)-toNum(q[i]))))}),
  degrees:B("degrees",fl(x=>x*180/Math.PI)),radians:B("radians",fl(x=>x*Math.PI/180))});
const heapq=(()=>{
  const up=(h,i)=>{const x=h[i];while(i>0){const p=(i-1)>>1;if(lt(x,h[p])){h[i]=h[p];i=p}else break}h[i]=x};
  const down=(h,i)=>{const n=h.length,x=h[i];for(;;){let c=2*i+1;if(c>=n)break;if(c+1<n&&lt(h[c+1],h[c]))c++;if(lt(h[c],x)){h[i]=h[c];i=c}else break}h[i]=x};
  const chk=(h,n)=>{if(!(h instanceof PyList))raise("TypeError",`${n}() argument 1 must be list, not ${tname(h)}`,"heapq dùng trên list.");return h.a};
  const lg=n=>Math.ceil(Math.log2(n+2));
  return{heappush:B("heappush",(a,kw,M)=>{const h=chk(a[0],"heappush");h.push(a[1]);up(h,h.length-1);M.cost+=lg(h.length);if(M.snap)M.mut.add(a[0]);return null}),
    heappop:B("heappop",(a,kw,M)=>{const h=chk(a[0],"heappop");if(!h.length)raise("IndexError","index out of range","heappop() trên heap rỗng. Kiểm tra “while h:” trước khi lấy.");const last=h.pop();let r=last;if(h.length){r=h[0];h[0]=last;down(h,0)}M.cost+=lg(h.length);if(M.snap)M.mut.add(a[0]);return r}),
    heapify:B("heapify",(a,kw,M)=>{const h=chk(a[0],"heapify");for(let i=(h.length>>1)-1;i>=0;i--)down(h,i);M.cost+=h.length;if(M.snap)M.mut.add(a[0]);return null}),
    heappushpop:B("heappushpop",(a,kw,M)=>{const h=chk(a[0],"heappushpop");let x=a[1];if(h.length&&lt(h[0],x)){const r=h[0];h[0]=x;down(h,0);x=r}M.cost+=lg(h.length);return x}),
    heapreplace:B("heapreplace",(a,kw,M)=>{const h=chk(a[0],"heapreplace");if(!h.length)raise("IndexError","index out of range","");const r=h[0];h[0]=a[1];down(h,0);M.cost+=lg(h.length);return r}),
    nsmallest:B("nsmallest",(a,kw,M)=>new PyList(sortArr(M,toArr(a[1],M),kwv(kw,"key",null),false).slice(0,Number(ib(a[0]))))),
    nlargest:B("nlargest",(a,kw,M)=>new PyList(sortArr(M,toArr(a[1],M),kwv(kw,"key",null),true).slice(0,Number(ib(a[0])))))}})();
mod("heapq",heapq);
const bis=(right)=>(a,kw,M)=>{const L=a[0];if(!(L instanceof PyList))raise("TypeError","bisect cần list đã sắp xếp","");const arr=L.a,x=a[1];let lo=a.length>2?Number(ib(a[2])):Number(ib(kwv(kw,"lo",0))),hi=a.length>3?Number(ib(a[3])):kwv(kw,"hi",null)===null?arr.length:Number(ib(kw.get("hi")));const key=kwv(kw,"key",null);
  while(lo<hi){const mid=(lo+hi)>>1;M.cost++;const v=key!==null?M.callf(key,[arr[mid]]):arr[mid];if(right?lt(x,v):lt(v,x)){if(right)hi=mid;else lo=mid+1}else{if(right)lo=mid+1;else hi=mid}}return lo};
mod("bisect",{bisect_left:B("bisect_left",bis(false)),bisect_right:B("bisect_right",bis(true)),bisect:B("bisect",bis(true)),
  insort_left:B("insort_left",(a,kw,M)=>{const k=bis(false)(a,kw,M);a[0].a.splice(k,0,a[1]);M.cost+=(a[0].a.length-k)>>4;return null}),
  insort_right:B("insort_right",(a,kw,M)=>{const k=bis(true)(a,kw,M);a[0].a.splice(k,0,a[1]);M.cost+=(a[0].a.length-k)>>4;return null}),
  insort:B("insort",(a,kw,M)=>{const k=bis(true)(a,kw,M);a[0].a.splice(k,0,a[1]);M.cost+=(a[0].a.length-k)>>4;return null})});
const DEQUE=new PyType("deque",(a,kw,M)=>{const d=new PyDeque(a.length?toArr(a[0],M):[]);d.h=0;const ml=a.length>1?a[1]:kwv(kw,"maxlen",null);if(ml!==null){d.maxlen=Number(ib(ml));if(d.a.length>d.maxlen)d.a=d.a.slice(d.a.length-d.maxlen)}return d});
const DDICT=new PyType("defaultdict",(a,kw,M)=>{const d=newDict();d.dd=a.length?a[0]:null;d.ddName=d.dd===null?"None":d.dd instanceof PyType?`<class '${d.dd.name}'>`:repr(d.dd);if(a.length>1)DICTM.update(d,[a[1]],null,M);if(d.dd===null){delete d.dd}return d});
const COUNTER=new PyType("Counter",(a,kw,M)=>{const d=newDict();d.ctr=true;if(a.length){const o=a[0];if(o instanceof PyDict)o.m.forEach(e=>dset(d,e[0],e[1]));else{const v=toArr(o,M);M.cost+=v.length>>2;for(const x of v){const c=dget(d,x);dset(d,x,c===undefined?1:R.add(c,1))}}}return d});
mod("collections",{deque:DEQUE,defaultdict:DDICT,Counter:COUNTER,OrderedDict:TYPES.dict});
mod("functools",{
  lru_cache:B("lru_cache",(a)=>{if(a.length&&(a[0] instanceof PyFunc))return new R.PyCached(a[0]);return B("decorating_function",b=>new R.PyCached(b[0]))}),
  cache:B("cache",a=>new R.PyCached(a[0])),
  reduce:B("reduce",(a,kw,M)=>{const v=toArr(a[1],M);let acc,i=0;if(a.length>2)acc=a[2];else{if(!v.length)raise("TypeError","reduce() of empty iterable with no initial value","");acc=v[0];i=1}for(;i<v.length;i++)acc=M.callf(a[0],[acc,v[i]]);return acc}),
  cmp_to_key:B("cmp_to_key",(a)=>B("K",b=>new R.PyKey(a[0],b[0])))});
const lim=(n)=>{if(n>2000000)raise("MemoryError","","Số tổ hợp/hoán vị quá lớn cho trình mô phỏng.")};
function perms(v,r){const out=[];const n=v.length;if(r>n)return out;const used=new Array(n).fill(false),cur=[];(function go(){if(cur.length===r){out.push(new PyTuple(cur.slice()));lim(out.length);return}for(let i=0;i<n;i++)if(!used[i]){used[i]=true;cur.push(v[i]);go();cur.pop();used[i]=false}})();return out}
function combs(v,r,rep){const out=[];const n=v.length,cur=[];(function go(s){if(cur.length===r){out.push(new PyTuple(cur.slice()));lim(out.length);return}for(let i=s;i<n;i++){cur.push(v[i]);go(rep?i:i+1);cur.pop()}})(0);return out}
mod("itertools",{
  permutations:B("permutations",(a,kw,M)=>{const v=toArr(a[0],M);const r=a.length>1&&a[1]!==null?Number(ib(a[1])):v.length;const o=perms(v,r);M.cost+=o.length;return mkIter(o,"itertools.permutations")}),
  combinations:B("combinations",(a,kw,M)=>{const v=toArr(a[0],M);const o=combs(v,Number(ib(a[1])),false);M.cost+=o.length;return mkIter(o,"itertools.combinations")}),
  combinations_with_replacement:B("combinations_with_replacement",(a,kw,M)=>{const v=toArr(a[0],M);const o=combs(v,Number(ib(a[1])),true);M.cost+=o.length;return mkIter(o,"itertools.combinations_with_replacement")}),
  product:B("product",(a,kw,M)=>{let L=a.map(x=>toArr(x,M));const rp=Number(ib(kwv(kw,"repeat",1)));let LL=[];for(let i=0;i<rp;i++)LL=LL.concat(L);let out=[[]];for(const l of LL){const nx=[];for(const p of out)for(const x of l){nx.push(p.concat([x]));lim(nx.length)}out=nx}M.cost+=out.length;return mkIter(out.map(x=>new PyTuple(x)),"itertools.product")}),
  accumulate:B("accumulate",(a,kw,M)=>{const v=toArr(a[0],M);const f=a.length>1?a[1]:kwv(kw,"func",null);const ini=kwv(kw,"initial",null);const out=[];let acc;let first=true;if(ini!==null){acc=ini;out.push(acc);first=false}for(const x of v){if(first){acc=x;first=false}else acc=f===null?R.add(acc,x):M.callf(f,[acc,x]);out.push(acc)}return mkIter(out,"itertools.accumulate")}),
  chain:B("chain",(a,kw,M)=>mkIter([].concat(...a.map(x=>toArr(x,M))),"itertools.chain")),
  pairwise:B("pairwise",(a,kw,M)=>{const v=toArr(a[0],M);const o=[];for(let i=0;i+1<v.length;i++)o.push(new PyTuple([v[i],v[i+1]]));return mkIter(o,"itertools.pairwise")})});
mod("string",{ascii_lowercase:"abcdefghijklmnopqrstuvwxyz",ascii_uppercase:"ABCDEFGHIJKLMNOPQRSTUVWXYZ",ascii_letters:"abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",digits:"0123456789",punctuation:"!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~",whitespace:" \t\n\r\x0b\x0c"});
let rnd=12345;const rnext=()=>{rnd=(rnd*1103515245+12345)&0x7fffffff;return rnd/0x80000000};
mod("random",{seed:B("seed",a=>{rnd=a.length?Number(ib(toInt(a[0])))&0x7fffffff:12345;return null}),random:B("random",()=>F(rnext())),
  randint:B("randint",a=>{const lo=Number(ib(a[0])),hi=Number(ib(a[1]));return lo+Math.floor(rnext()*(hi-lo+1))}),
  randrange:B("randrange",a=>{const lo=a.length>1?Number(ib(a[0])):0,hi=Number(ib(a.length>1?a[1]:a[0]));return lo+Math.floor(rnext()*(hi-lo))}),
  choice:B("choice",(a)=>{const v=seqA(a[0]);if(!v.length)raise("IndexError","Cannot choose from an empty sequence","");return v[Math.floor(rnext()*v.length)]}),
  shuffle:B("shuffle",a=>{const v=a[0].a;for(let i=v.length-1;i>0;i--){const j=Math.floor(rnext()*(i+1));[v[i],v[j]]=[v[j],v[i]]}return null}),
  uniform:B("uniform",a=>F(toNum(a[0])+rnext()*(toNum(a[1])-toNum(a[0]))))});
function deep(v,memo){if(v===null||typeof v!=="object"||v instanceof PyFloat||v instanceof PyFunc||v instanceof PyBuiltin||v instanceof PyType)return v;if(memo.has(v))return memo.get(v);
  if(v instanceof PyList){const r=new PyList([]);memo.set(v,r);r.a=v.a.map(x=>deep(x,memo));return r}
  if(v instanceof PyTuple)return new PyTuple(v.a.map(x=>deep(x,memo)));
  if(v instanceof PyDict){const r=DICTM.copy(v);memo.set(v,r);r.m.forEach(e=>{e[0]=deep(e[0],memo);e[1]=deep(e[1],memo)});return r}
  if(v instanceof PySet)return SETM.copy(v);if(v instanceof PyDeque){const d=new PyDeque(dq(v).map(x=>deep(x,memo)));d.h=0;return d}return v}
mod("copy",{copy:B("copy",a=>{const v=a[0];if(v instanceof PyList)return new PyList(v.a.slice());if(v instanceof PyDict)return DICTM.copy(v);if(v instanceof PySet)return SETM.copy(v);return v}),deepcopy:B("deepcopy",a=>deep(a[0],new Map()))});
mod("time",{time:B("time",()=>F(0)),perf_counter:B("perf_counter",()=>F(0))});
function sysMod(M){
  const stdin=new PyMod("sys.stdin",{readline:B("readline",()=>M.readLine(false)),read:B("read",()=>M.readAll()),readlines:B("readlines",()=>new PyList(M.stdinLines()))});
  const stdout=new PyMod("sys.stdout",{write:B("write",a=>{M.write(str(a[0]));return str(a[0]).length}),flush:B("flush",()=>null)});
  const stderr=new PyMod("sys.stderr",{write:B("write",a=>{M.write(str(a[0]),true);return str(a[0]).length}),flush:B("flush",()=>null)});
  return new PyMod("sys",{stdin,stdout,stderr,maxsize:9223372036854775807n,argv:new PyList(["main.py"]),
    setrecursionlimit:B("setrecursionlimit",a=>{M.reclimit=Math.min(Math.max(Number(ib(a[0])),50),20000);return null}),getrecursionlimit:B("getrecursionlimit",()=>M.reclimit),
    exit:B("exit",a=>{throw{sysexit:a.length?a[0]:null}}),setrecursionlimitMax:20000,
    /* kích thước theo CPython 3.13, 64 bit (list tính như tạo một lần, chưa tính phần dự trữ khi append) */
    getsizeof:B("getsizeof",a=>{const v=a[0];if(v===null)return 16;if(typeof v==="boolean")return 28;
      if(typeof v==="number"||typeof v==="bigint"){let x=toBig(v);if(x<0n)x=-x;let d=0;while(x>0n){d++;x>>=30n}return 24+4*Math.max(1,d)}
      if(v instanceof PyFloat)return 24;if(typeof v==="string"){let asc=true;for(const ch of v)if(ch.codePointAt(0)>127){asc=false;break}return asc?41+v.length:74+2*[...v].length}
      if(v instanceof PyList)return 56+8*v.a.length;if(v instanceof PyTuple)return 40+8*v.a.length;
      raise("TypeError","","sys.getsizeof trong trình mô phỏng chỉ hỗ trợ số, chuỗi, list, tuple.")})})}
return{BUILTINS,MODS,TYPES,EXC,excIs,getitem,setitem,delitem,getattr,len,toInt,toFloat,sortArr,sysMod,LISTM,DICTM,strFormat,sliceIdx};
})();

/* ---------------- 6. máy chạy từng bước ---------------- */
const PYM=(()=>{
"use strict";
const {O}=PYC;
const {PyFloat,PyList,PyTuple,PyDict,PySet,PyRange,PyFunc,PyBuiltin,PyMod,PyType,PyIter,PyDeque,PyExcV,PyExc,raise,normInt,isInt,toNum,ib,tname}=PY;
const R=PYR,Bn=PYB;
const NEED={need:true};
const LIMIT=1000000;
const VI_EXC={
  ZeroDivisionError:"Phép chia (hoặc chia lấy dư) cho 0. Kiểm tra số chia khác 0 trước khi chia.",
  IndexError:"Chỉ số nằm ngoài danh sách. Danh sách có n phần tử thì chỉ số hợp lệ là 0..n−1.",
  KeyError:"Khóa không có trong dict. Kiểm tra bằng “if k in d” hoặc dùng d.get(k, mặc_định).",
  NameError:"Tên này chưa được định nghĩa: chưa gán giá trị, viết sai chính tả, hoặc dùng trước khi gán. Python phân biệt chữ hoa và chữ thường.",
  TypeError:"Phép toán hoặc hàm được dùng với kiểu dữ liệu không phù hợp.",
  ValueError:"Giá trị không hợp lệ cho thao tác này.",
  RecursionError:"Đệ quy quá sâu (Python mặc định chỉ cho khoảng 1 000 tầng). Thường do thiếu điều kiện dừng; nếu đệ quy đúng nhưng sâu, có thể tăng giới hạn bằng sys.setrecursionlimit(...) hoặc đổi sang vòng lặp.",
  EOFError:"input() được gọi nhưng đã hết dữ liệu nhập: chương trình đọc nhiều dòng hơn dữ liệu có.",
  AttributeError:"Kiểu dữ liệu này không có thuộc tính hay phương thức đó.",
  UnboundLocalError:"Biến được gán ở đâu đó trong hàm nên Python coi là biến cục bộ, nhưng đang được đọc trước khi gán. Muốn sửa biến toàn cục bên trong hàm, thêm dòng global tên_biến.",
  AssertionError:"Điều kiện trong assert bị sai.",
  StopIteration:"Bộ lặp đã hết phần tử.",
  MemoryError:"Dữ liệu quá lớn cho trình mô phỏng.",
  ModuleNotFoundError:"Trình mô phỏng chỉ có các thư viện chuẩn hay dùng: math, sys, collections, heapq, bisect, functools, itertools, string, random, copy.",
  OverflowError:"Số quá lớn cho kiểu float."};
const CPPW={cout:"print(...)",cin:"input()",endl:"\"\\n\" (print tự xuống dòng)",printf:"print(...)",scanf:"input()",true:"True",false:"False",null:"None",NULL:"None",nullptr:"None",this:"self",length:"len(a)",string:"str",vector:"list",println:"print",echo:"print",puts:"print",elif_:"elif",elseif:"elif",lenght:"len"};
function editDist(a,b){if(Math.abs(a.length-b.length)>2)return 9;const d=Array.from({length:a.length+1},(_,i)=>[i]);for(let j=1;j<=b.length;j++)d[0][j]=j;for(let i=1;i<=a.length;i++)for(let j=1;j<=b.length;j++)d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+(a[i-1]===b[j-1]?0:1));return d[a.length][b.length]}
class PyM{
  constructor(prog,src,opt){opt=opt||{};
    this.src=src;this.L=src.split("\n");this.buf=opt.input||"";this.pos=0;this.reads=[];this.out=[];this.outLen=0;this.inter=!!opt.interactive;this.eofIn=false;
    this.cost=0;this.done=false;this.crash=null;this.exit=0;this.notes=[];this.failed=false;this.eof=false;this.nCalls=0;this.maxDepth=0;this.ctree=[];this.cnode=-1;
    this.rd=new Set();this.wr=new Set();this.wrRoot=new Set();this.mut=new Set();this.stores=[];this.snap=true;this.reclimit=1000;this.curExc=null;this.mid=false;this.gorder=[];this.hasFns=true;this.lang="py";
    this.globals=new Map();this.sys=null;this.cells=new WeakMap();
    const top={code:prog,ip:0,stack:[],loc:this.globals,env:null,tries:[],title:"<module>",fname:"<module>",line:0,mod:true};
    this.frames=[top];this.f=top;this.curLine=0;
    if(!prog.code.length||prog.code[0][0]!==O.LINE)this.done=true;
  }
  /* ---- giao diện chung với trình mô phỏng C++ ---- */
  get vars(){return this.f.loc}get order(){return this.f?[...this.f.loc.keys()].filter(n=>this.visible(this.f.loc.get(n))):[]}get lastOrder(){if(!this.done||!this.globals||!this.globals.keys)return null;return [...this.globals.keys()].filter(n=>this.visible(this.globals.get(n)))}get calls(){return this.frames.slice(1)}get globalsMap(){return this.globals}
  nextLine(){if(this.done)return 0;const I=this.f.code.code[this.f.ip];return I&&I[0]===O.LINE?I[1]:this.curLine}
  text(){return this.out.filter(x=>x.k==="o").map(x=>x.s).join("")}
  feed(line){this.buf+=line+"\n";this.out.push({k:"i",s:line+"\n"})}
  argTxt(v){return v&&v.py!==undefined?R.repr(v.py):""}
  write(s,err){if(!s)return;this.outLen+=s.length;if(this.outLen>200000)throw{olimit:true};const k=err?"e":"o";const L=this.out[this.out.length-1];if(L&&L.k===k)L.s+=s;else this.out.push({k,s})}
  runAll(max){let r;for(let k=0;k<(max||LIMIT+5);k++){r=this.step();if(r.s!=="ran")break}return r}
  /* ---- nhập dữ liệu ---- */
  needInput(){return this.inter&&!this.eofIn&&this.buf.indexOf("\n",this.pos)<0}
  readLine(isInput){
    if(this.pos>=this.buf.length){this.eof=true;if(isInput)raise("EOFError","EOF when reading a line",VI_EXC.EOFError);return ""}
    let j=this.buf.indexOf("\n",this.pos);const a=this.pos;let line;
    if(j<0){line=this.buf.slice(a);this.pos=this.buf.length}else{line=this.buf.slice(a,j);this.pos=j+1}
    this.reads.push({a,b:this.pos,n:isInput?"input()":"sys.stdin.readline()"});this.cost+=line.length>>6;
    return isInput?line.replace(/\r$/,""):line+(j<0?"":"\n")}
  readAll(){const s=this.buf.slice(this.pos);this.reads.push({a:this.pos,b:this.buf.length,n:"sys.stdin.read()"});this.pos=this.buf.length;this.cost+=s.length>>6;return s}
  stdinLines(){const out=[];while(this.pos<this.buf.length)out.push(this.readLine(false));return out}
  /* ---- gọi hàm ---- */
  callf(fn,args){ // gọi đồng bộ từ hàm có sẵn (key=, map, reduce…)
    if(fn instanceof PyBuiltin)return fn.fn(args,null,this);
    if(fn instanceof PyType)return fn.exc?new PyExcV(fn.name,args):fn.call(args,null,this);
    const base=this.frames.length,saved=this.f;const r=this.call(fn,args,null,0);if(r!==undefined)return r;
    this.exec(base);return saved.stack.pop()}
  call(fn,args,kw,line){
    if(fn instanceof PyFunc)return this.enter(fn,args,kw,line,null);
    if(fn instanceof R.PyCached){const key=R.hk(new PyTuple(args.concat(kw?[...kw].map(([k,v])=>new PyTuple([k,v])):[])));if(fn.cache.has(key)){this.cost++;return fn.cache.get(key)}
      return this.enter(fn.fn,args,kw,line,v=>fn.cache.set(key,v))}
    if(fn instanceof PyBuiltin)return fn.fn(args,kw,this);
    if(fn instanceof PyType){if(fn.exc)return new PyExcV(fn.name,args);return fn.call(args,kw,this)}
    raise("TypeError",`'${tname(fn)}' object is not callable`,`Giá trị kiểu ${tname(fn)} không gọi như hàm được.${tname(fn)==="list"||tname(fn)==="str"?" Muốn lấy phần tử, dùng dấu ngoặc vuông a[i], không phải a(i).":tname(fn)==="int"?" Có thể bạn đặt tên biến trùng tên hàm (ví dụ sum = 0 rồi gọi sum(...)), hoặc thiếu dấu * khi nhân: 2(x+1) phải viết 2*(x+1).":""}`)}
  enter(fn,args,kw,line,post){
    const C=fn.code,ps=C.ps;const loc=new Map();const name=fn.name;
    if(this.frames.length>=this.reclimit)raise("RecursionError","maximum recursion depth exceeded",VI_EXC.RecursionError);
    let ai=0;const defs=fn.defs||[];const nDef=ps.filter(p=>p.d!==undefined&&p.d!==null).length;let di=0;const extra=[];
    ps.forEach((p,i)=>{
      if(p.star===1){loc.set(p.n,new PyTuple(args.slice(ai)));ai=args.length;return}
      if(p.star===2){const d=new PyDict();if(kw)kw.forEach((v,k)=>{if(!ps.some(q=>q.n===k&&!q.star))R.dset(d,k,v)});loc.set(p.n,d);return}
      const hasDef=p.d!==undefined&&p.d!==null;const dv=hasDef?defs[di++]:undefined;
      if(!p.kwonly&&ai<args.length){if(kw&&kw.has(p.n))raise("TypeError",`${name}() got multiple values for argument '${p.n}'`,"");loc.set(p.n,args[ai++])}
      else if(kw&&kw.has(p.n))loc.set(p.n,kw.get(p.n));
      else if(hasDef)loc.set(p.n,dv);
      else extra.push(p.n)});
    if(ai<args.length){const np=ps.filter(p=>!p.star&&!p.kwonly).length;raise("TypeError",`${name}() takes ${np} positional argument${np===1?"":"s"} but ${args.length} ${args.length===1?"was":"were"} given`,`Hàm ${name} nhận ${np} tham số nhưng được gọi với ${args.length} giá trị.`)}
    if(extra.length)raise("TypeError",`${name}() missing ${extra.length} required positional argument${extra.length>1?"s":""}: ${extra.map(x=>"'"+x+"'").join(extra.length===2?" and ":", ")}`,`Gọi hàm ${name} thiếu giá trị cho tham số ${extra.join(", ")}.`);
    if(kw&&!ps.some(p=>p.star===2))kw.forEach((v,k)=>{if(!ps.some(p=>p.n===k&&!p.star))raise("TypeError",`${name}() got an unexpected keyword argument '${k}'`,`Hàm ${name} không có tham số tên ${k}.`)});
    const title=name+"("+(name.startsWith("<")?"":ps.filter(p=>!p.star&&loc.has(p.n)).map(p=>p.n+"="+short(loc.get(p.n))).join(", "))+")";
    const fr={code:C,ip:0,stack:[],loc,env:fn.env,tries:[],title,fname:name,line:C.line0,post,cn:this.cnode,callLine:this.f.line,comp:name.startsWith("<")};
    fr.envObj={vars:loc,up:fn.env};
    if(!fr.comp){this.nCalls++;if(this.ctree.length<300){this.ctree.push({l:title,f:name,par:this.cnode,ret:null,done:false});this.cnode=this.ctree.length-1}else this.cnode=-2}
    this.frames.push(fr);this.f=fr;if(this.frames.length-1>this.maxDepth)this.maxDepth=this.frames.length-1;
    return undefined}
  ret(v){const fr=this.frames.pop();
    if(fr.post)fr.post(v);
    if(!fr.comp){const nd=this.cnode>=0?this.ctree[this.cnode]:null;if(nd){nd.done=true;nd.ret=short(v)}this.cnode=fr.cn;this.lastRet={fn:fr.fname,v}}
    if(!this.frames.length){this.f=null;return true}
    this.f=this.frames[this.frames.length-1];this.f.stack.push(v);return false}
  modOf(n){if(n==="sys"){return this.sys||(this.sys=Bn.sysMod(this))}const m=Bn.MODS[n];if(m)return m;
    if(n==="collections.abc"||n==="typing")return new PyMod(n,{List:Bn.TYPES.list,Dict:Bn.TYPES.dict,Tuple:Bn.TYPES.tuple,Set:Bn.TYPES.set,Optional:Bn.TYPES.list,Iterable:Bn.TYPES.list});
    raise("ModuleNotFoundError",`No module named '${n}'`,`Thư viện ${n} không có trong trình mô phỏng. ${VI_EXC.ModuleNotFoundError}`)}
  nameErr(n){const near=[...this.globals.keys(),...Bn.BUILTINS.keys(),...this.f.loc.keys()].filter(x=>editDist(x,n)<=1&&x!==n);
    raise("NameError",`name '${n}' is not defined`,CPPW[n]?`Python không có ${n}. Dùng ${CPPW[n]}.`:near.length?`Tên ${n} chưa được định nghĩa. Có phải bạn muốn viết ${near[0]}?`:`Tên ${n} chưa được định nghĩa: chưa gán giá trị trước khi dùng, hoặc viết sai chính tả (Python phân biệt chữ hoa, chữ thường).${/^[a-z]+$/.test(n)?" Nếu đây là một chuỗi, nhớ đặt trong dấu nháy: \""+n+"\".":""}`)}
  tick(){if(++this.cost>LIMIT)throw{tle:true}}
  cellOf(o,i){let c=this.cells.get(o);if(!c){c=[];this.cells.set(o,c)}while(c.length<=i)c.push({o,i:c.length});return c[i]}
  rdStr(){}
  /* ---- vòng lặp chính: chạy lệnh tới LINE kế tiếp (hoặc tới khi hàm gọi đồng bộ trả về) ---- */
  exec(base){const sync=base!==undefined;
    for(;;){const f=this.f;const I=f.code.code[f.ip];
      if(I[0]===O.LINE){if(!sync)return "line";f.ip++;f.line=I[1];this.tick();continue}
      f.ip++;
      try{const S=f.stack;
        switch(I[0]){
          case O.CONST:S.push(I[1]);break;
          case O.LOADL:{const v=f.loc.get(I[1]);if(v===undefined){if(f.mod)this.nameErr(I[1]);raise("UnboundLocalError",`cannot access local variable '${I[1]}' where it is not associated with a value`,VI_EXC.UnboundLocalError.replace("tên_biến",I[1]))}S.push(v);break}
          case O.STOREL:f.loc.set(I[1],S.pop());if(this.snap)this.stores.push([f,I[1]]);break;
          case O.DELL:if(!f.loc.delete(I[1]))raise("UnboundLocalError",`cannot access local variable '${I[1]}' where it is not associated with a value`,"");break;
          case O.LOADD:{let e=f.envObj;for(let d=0;d<I[2];d++)e=e.up;const v=e&&e.vars.get(I[1]);if(v===undefined)raise("NameError",`cannot access free variable '${I[1]}' where it is not associated with a value in enclosing scope`,"Biến của hàm bên ngoài chưa được gán giá trị.");S.push(v);break}
          case O.STORED:{let e=f.envObj;for(let d=0;d<I[2];d++)e=e.up;e.vars.set(I[1],S.pop());break}
          case O.LOADG:{let v=this.globals.get(I[1]);if(v===undefined){v=Bn.BUILTINS.get(I[1]);if(v===undefined)this.nameErr(I[1])}S.push(v);break}
          case O.STOREG:{const n=I[1];if(!this.globals.has(n)&&!this.gorder.includes(n))this.gorder.push(n);this.globals.set(n,S.pop());if(this.snap)this.stores.push([this.frames[0],n]);break}
          case O.DELG:if(!this.globals.delete(I[1]))this.nameErr(I[1]);break;
          case O.POP:S.pop();break;
          case O.DUP:S.push(S[S.length-1]);break;
          case O.DUP2:S.push(S[S.length-2],S[S.length-1]);break;
          case O.ROT2:{const n=S.length;const t=S[n-1];S[n-1]=S[n-2];S[n-2]=t;break}
          case O.ROT3:{const n=S.length;const x=S[n-1];S[n-1]=S[n-2];S[n-2]=S[n-3];S[n-3]=x;break}
          case O.BIN:{const b=S.pop(),a=S.pop();S.push(R.binop(I[1],a,b));if((I[1]==="+"||I[1]==="*")&&(a instanceof PyList||a instanceof PyTuple))this.cost+=(S[S.length-1].a.length)>>3;break}
          case O.INPL:{const b=S.pop(),a=S.pop();
            if(I[1]==="+"&&a instanceof PyList){const v=R.toArr(b,this);for(const x of v)a.a.push(x);this.cost+=v.length>>3;if(this.snap)this.mut.add(a);S.push(a)}
            else if(I[1]==="|"&&a instanceof PySet&&b instanceof PySet){b.m.forEach((v,k)=>a.m.set(k,v));S.push(a)}
            else S.push(R.binop(I[1],a,b));break}
          case O.UN:S.push(R.unop(I[1],S.pop()));break;
          case O.NOT:S.push(!R.truth(S.pop()));break;
          case O.CMP:{const b=S.pop(),a=S.pop();S.push(R.compare(I[1],a,b,this));break}
          case O.JMP:f.ip=I[1];break;
          case O.JIF:if(!R.truth(S.pop()))f.ip=I[1];break;
          case O.JIT:if(R.truth(S.pop()))f.ip=I[1];break;
          case O.JIFK:if(!R.truth(S[S.length-1]))f.ip=I[1];else S.pop();break;
          case O.JITK:if(R.truth(S[S.length-1]))f.ip=I[1];else S.pop();break;
          case O.BLIST:S.push(new PyList(I[1]?S.splice(S.length-I[1]):[]));break;
          case O.BTUPLE:S.push(new PyTuple(I[1]?S.splice(S.length-I[1]):[]));break;
          case O.BSET:{const s=new PySet();(I[1]?S.splice(S.length-I[1]):[]).forEach(x=>R.sadd(s,x));S.push(s);break}
          case O.BDICT:{const d=new PyDict();const a=I[1]?S.splice(S.length-2*I[1]):[];for(let i=0;i<a.length;i+=2)R.dset(d,a[i],a[i+1]);S.push(d);break}
          case O.LEXT:{const it=S.pop();const L=S[S.length-1];for(const x of R.toArr(it,this))L.a.push(x);break}
          case O.LAPP:{const v=S.pop();S[S.length-I[1]].a.push(v);break}
          case O.SADD:{const v=S.pop();R.sadd(S[S.length-I[1]],v);break}
          case O.MADD:{if(I[1]===-1){const m=S.pop();const d=S[S.length-1];if(!(m instanceof PyDict))raise("TypeError","argument after ** must be a mapping","");m.m.forEach(e=>R.dset(d,e[0],e[1]));break}
            const v=S.pop(),k=S.pop();R.dset(S[S.length-I[1]],k,v);break}
          case O.LISTTOTUPLE:{const L=S.pop();if(I[1]===1){const s=new PySet();L.a.forEach(x=>R.sadd(s,x));S.push(s)}else S.push(new PyTuple(L.a));break}
          case O.SUB:{const i=S.pop(),o=S.pop();S.push(Bn.getitem(o,i,this));break}
          case O.STSUB:{const i=S.pop(),o=S.pop(),v=S.pop();Bn.setitem(o,i,v,this);break}
          case O.DELSUB:{const i=S.pop(),o=S.pop();Bn.delitem(o,i,this);if(this.snap)this.mut.add(o);break}
          case O.SLICE:{const st=S.pop(),hi=S.pop(),lo=S.pop();S.push(new R.PySlice(lo,hi,st));break}
          case O.ATTR:S.push(Bn.getattr(S.pop(),I[1],this));break;
          case O.STATTR:raise("AttributeError","gán thuộc tính chưa hỗ trợ","Gán vào thuộc tính chưa có trong trình mô phỏng.");break;
          case O.CALL:{const nk=I[2]?I[2].length:0,tot=I[1]+nk,n=S.length;const fn=S[n-tot-1];
            if(fn instanceof PyBuiltin&&(fn.name==="input"||fn.name==="readline")&&this.needInput()&&!sync){f.ip--;throw NEED}
            const args=S.slice(n-tot,n-nk);let kw=null;if(nk){kw=new Map();for(let k=0;k<nk;k++)kw.set(I[2][k],S[n-nk+k])}
            S.length=n-tot-1;const r=this.call(fn,args,kw,I[3]);if(r!==undefined)S.push(r);break}
          case O.CALLX:{const kd=S.pop(),al=S.pop(),fn=S.pop();let kw=null;if(kd.m.size){kw=new Map();kd.m.forEach(e=>{if(typeof e[0]!=="string")raise("TypeError","keywords must be strings","");kw.set(e[0],e[1])})}
            if(fn instanceof PyBuiltin&&(fn.name==="input"||fn.name==="readline")&&this.needInput()&&!sync){S.push(fn,al,kd);f.ip--;throw NEED}
            const r=this.call(fn,al.a.slice(),kw,I[3]);if(r!==undefined)S.push(r);break}
          case O.RET:{const v=S.pop();const end=this.ret(v);if(end)return "end";if(sync&&this.frames.length===base)return "ret";break}
          case O.ITER:S.push(R.iterOf(S.pop(),this));break;
          case O.FOR:{const x=R.iterNext(S[S.length-1]);if(x===R.DONE){S.pop();f.ip=I[1]}else S.push(x);break}
          case O.UNPACK:{const v=S.pop();const n=I[1],si=I[2];const a=v instanceof PyTuple||v instanceof PyList?v.a:R.toArr(v,this,"Giá trị bên phải dấu =");
            if(si<0){if(a.length!==n)raise("ValueError",a.length>n?`too many values to unpack (expected ${n})`:`not enough values to unpack (expected ${n}, got ${a.length})`,`Số biến bên trái (${n}) không bằng số giá trị (${a.length}).${a.length>n?" Nếu đọc nhiều số trên một dòng, kiểm tra dữ liệu nhập có đúng số giá trị không.":""}`);for(let i=n-1;i>=0;i--)S.push(a[i])}
            else{const after=n-si-1;if(a.length<n-1)raise("ValueError",`not enough values to unpack (expected at least ${n-1}, got ${a.length})`,"");for(let i=after-1;i>=0;i--)S.push(a[a.length-after+i]);S.push(new PyList(a.slice(si,a.length-after)));for(let i=si-1;i>=0;i--)S.push(a[i])}break}
          case O.MKFN:{const defs=I[2]?S.splice(S.length-I[2]):[];S.push(new PyFunc(I[1],f.mod?null:f.envObj,defs,I[1].name));break}
          case O.IMPORT:S.push(this.modOf(I[1]));break;
          case O.IMPFROM:{const m=S[S.length-1];if(!(I[1] in m.attrs))raise("ImportError",`cannot import name '${I[1]}' from '${I[2]}' (unknown location)`,`Thư viện ${I[2]} không có ${I[1]} (hoặc trình mô phỏng chưa hỗ trợ).`);S.push(m.attrs[I[1]]);break}
          case O.FMT:{let spec="";if(I[2])spec=S.pop();let v=S.pop();if(I[1]==="r")v=R.repr(v);else if(I[1]==="s"||I[1]==="a")v=R.str(v);S.push(spec?R.formatSpec(v,spec):R.str(v));break}
          case O.BSTR:{S.push(S.splice(S.length-I[1]).join(""));break}
          case O.TRY:f.tries.push({h:I[1],sp:S.length});break;
          case O.POPTRY:f.tries.pop();break;
          case O.EXCM:{const cls=S.pop(),e=S.pop();const L=cls instanceof PyTuple?cls.a:[cls];
            S.push(L.some(c=>{if(!(c instanceof PyType)||!c.exc)raise("TypeError","catching classes that do not inherit from BaseException is not allowed","");return Bn.excIs(e.type,c.name)}));break}
          case O.RERAISE:throw{pyexc:S.pop(),re:true};
          case O.RAISE:{if(I[1]===0){if(!this.curExc)raise("RuntimeError","No active exception to reraise","");throw{pyexc:this.curExc,re:true}}
            let v=S.pop();if(v instanceof PyType&&v.exc)v=new PyExcV(v.name,[]);if(!(v instanceof PyExcV))raise("TypeError","exceptions must derive from BaseException","Chỉ raise được lỗi, ví dụ raise ValueError(\"...\").");throw{pyexc:v}}
          case O.ENDEXC:this.curExc=null;break;
          case O.ASSERTF:{const m=S.pop();throw{pyexc:new PyExcV("AssertionError",m===null?[]:[m])}}
          case O.NOP:break;
          default:throw new Error("op "+I[0]);
        }
      }catch(x){const r=this.onErr(x,base);if(r)return r}
    }}
  onErr(x,base){
    if(x===NEED||x&&(x.tle||x.olimit||x.sysexit!==undefined||x.crash))throw x;
    let e;
    if(x instanceof PyExc){e=new PyExcV(x.type,x.msg===""?[]:[x.msg]);e.vi=x.vi}
    else if(x&&x.pyexc){e=x.pyexc}
    else if(x instanceof RangeError){e=new PyExcV("RecursionError",["maximum recursion depth exceeded"]);e.vi="Chương trình gọi lồng quá sâu."}
    else{e=new PyExcV("SystemError",[String(x&&x.message||x)]);e.vi="Trình mô phỏng gặp lỗi nội bộ khi chạy đoạn code này. Hãy báo cho giảng viên kèm đoạn code."}
    if(!e.tb)e.tb=[];
    for(;;){const f=this.f;
      if(f.tries.length){const h=f.tries.pop();f.stack.length=h.sp;f.stack.push(e);f.ip=h.h;this.curExc=e;return null}
      if(base!==undefined&&this.frames.length===base)throw{pyexc:e};
      e.tb.push({line:f.line,name:f.fname});
      const fr=this.frames.pop();if(!fr.comp&&this.cnode>=0&&this.ctree[this.cnode]){this.ctree[this.cnode].done=true;this.ctree[this.cnode].ret="lỗi"}if(!fr.comp)this.cnode=fr.cn;
      if(!this.frames.length){this.f=fr;throw{crash:e}}
      this.f=this.frames[this.frames.length-1]}}
  tbText(e){const tb=e.tb.slice().reverse();
    return "Traceback (most recent call last):\n"+tb.map(t=>`  File "main.py", line ${t.line}, in ${t.name}\n    ${(this.L[t.line-1]||"").trim()}`).join("\n")+"\n"+e.type+(e.args.length?": "+R.str(e):"")}
  /* ---- một bước = một câu lệnh ---- */
  step(){
    if(this.done)return{s:"done"};
    R.setCallK(this._ck||(this._ck=(f,a)=>this.callf(f,a)));
    if(!this.mid){const f=this.f,I=f.code.code[f.ip];f.ip++;f.line=I[1];this.curLine=I[1];
      if(++this.cost>LIMIT)return this.tle();
      this.rd=new Set();this.wr=new Set();this.mut=new Set();this.stores=[]}
    this.mid=false;const d0=this.frames.length,line=this.curLine;let r;
    try{r=this.exec()}
    catch(x){
      if(x===NEED){this.mid=true;return{s:"need",line}}
      if(x&&x.tle)return this.tle();
      if(x&&x.olimit){this.done=true;this.crash={msg:"Output limit exceeded",vi:"Chương trình in ra quá nhiều (hơn 200 000 ký tự), có thể do vòng lặp vô hạn."};this.exit=124;return{s:"crash",line}}
      if(x&&x.sysexit!==undefined){this.done=true;const v=x.sysexit;if(v===null||v===undefined)this.exit=0;else if(isInt(v))this.exit=Number(ib(v));else{this.write(R.str(v)+"\n",true);this.exit=1}return{s:"done",line}}
      if(x&&x.crash){const e=x.crash;this.done=true;this.exit=1;const tb=e.tb;const ln=tb.length?tb[0].line:line;
        this.crash={msg:this.tbText(e),vi:e.vi||VI_EXC[e.type]||"",type:e.type,short:e.type+(e.args.length?": "+R.str(e):"")};return{s:"crash",line:ln}}
      throw x}
    const ch=this.chSet();
    if(r==="end"){this.done=true;return{s:"done",line,ch}}
    const d1=this.frames.length;
    if(d1>d0)return{s:"ran",line,ch,kw:"call",fn:this.f.fname};
    if(d1<d0&&this.lastRet)return{s:"ran",line,ch,kw:"ret",fn:this.lastRet.fn,rv:{py:this.lastRet.v,t:this.lastRet.v===null?"void":"x"}};
    return{s:"ran",line,ch}}
  tle(){this.done=true;this.crash={msg:"Time limit exceeded",vi:"Chương trình đã chạy hơn 1 000 000 bước, vượt giới hạn của trình mô phỏng. Nguyên nhân thường gặp là vòng lặp vô hạn (điều kiện lặp không bao giờ sai) hoặc đệ quy không dừng. Nếu thuật toán đúng nhưng cần nhiều bước, hãy thử với dữ liệu nhỏ hơn."};this.exit=124;return{s:"crash",line:this.curLine}}
  chSet(){const ch=new Set();if(!this.snap||!this.f)return ch;const f=this.f;
    for(const [fr,n] of this.stores)if(fr===f||(fr.mod&&f.mod))ch.add(n);
    if(this.mut.size)f.loc.forEach((v,n)=>{if(this.mut.has(v))ch.add(n)});
    return ch}
  visible(v){return !(v instanceof PyFunc||v instanceof PyBuiltin||v instanceof PyMod||v instanceof PyType||v instanceof R.PyCached)}
  /* ---- hình động: trả về đối tượng có dạng giống biến của trình mô phỏng C++ ---- */
  vizLook(n){
    let v;const f=this.f||this.frames[0];if(!f)return null;
    if(f.loc.has(n))v=f.loc.get(n);
    else{for(let e=f.envObj&&f.envObj.up;e;e=e.up)if(e.vars.has(n)){v=e.vars.get(n);break}
      if(v===undefined&&this.globals.has(n))v=this.globals.get(n);
      if(v===undefined)for(let k=this.frames.length-1;k>=0;k--)if(this.frames[k].loc.has(n)){v=this.frames[k].loc.get(n);break}}
    if(v===undefined)return null;
    const V=this.shim(v,0);V.w=this.chSet().has(n);return V}
  shim(v,depth){
    if(v instanceof PyList||v instanceof PyTuple||v instanceof PyDeque){const a=R.seqA(v);
      const c=v instanceof PyList?(()=>{const cs=this.cellOf(v,Math.max(0,a.length-1));cs;return (this.cells.get(v)||[]).slice(0,a.length)})():a.map((x,i)=>({i}));
      if(v instanceof PyList&&a.length===0)c.length=0;
      a.forEach((x,i)=>{const s=depth<1&&(x instanceof PyList||x instanceof PyTuple)?this.shim(x,depth+1):null;const cell=c[i];
        if(s){cell.t="list";cell.v=s.v;cell.txt=null;cell.init=true}else{cell.t=isInt(x)?"int":x instanceof PyFloat?"double":typeof x==="string"?"pystr":"obj";cell.v=isInt(x)?Number(ib(x)):x instanceof PyFloat?x.v:0;cell.txt=short(x,12);cell.init=true}});
      return{t:"list",v:{a:c},init:true,txt:"["+a.length+"]",len:a.length}}
    if(typeof v==="string")return{t:"string",v,init:true,txt:R.repr(v)};
    if(isInt(v))return{t:"int",v:Number(ib(v)),init:true,txt:R.repr(v)};
    if(v instanceof PyFloat)return{t:"double",v:v.v,init:true,txt:R.repr(v)};
    return{t:"obj",v:0,init:true,txt:short(v,40)}}
  /* ---- khung Bộ nhớ ---- */
  memHTML(ch){const frames=this.frames.slice().reverse();if(!frames.length)return "";
    const cnt=new Map();frames.forEach(F=>F.loc.forEach(v=>{if(v&&typeof v==="object"&&!(v instanceof PyFloat))cnt.set(v,(cnt.get(v)||0)+1)}));
    const ids=new Map();let nid=0;const tag=v=>{if(!(cnt.get(v)>1))return "";if(!ids.has(v))ids.set(v,++nid);return ` <small class="py-id" title="Nhiều tên cùng trỏ tới một đối tượng: sửa qua tên này thì tên kia cũng thấy">#${ids.get(v)}</small>`};
    const row=(n,v,isTop)=>{const c=isTop&&ch&&ch.has(n)?"chg":"";const t=tname(v);
      if(v instanceof PyList||v instanceof PyTuple||v instanceof PyDeque){const a=R.seqA(v);
        return `<tr class="${c}"><td><b>${esc(n)}</b></td><td>${esc(t)}</td><td><small class="seq-n">${a.length} phần tử ↓</small>${tag(v)}</td></tr><tr class="seqrow ${c}"><td colspan="3">${this.seqHTML(v)}</td></tr>`}
      return `<tr class="${c}"><td><b>${esc(n)}</b></td><td>${esc(t)}</td><td>${esc(short(v,90))}${tag(v)}</td></tr>`};
    return `<div class="stk">${frames.map((F,k)=>{const top=k===0;const names=[...F.loc.keys()].filter(n=>!n.startsWith(".")&&this.visible(F.loc.get(n)));
      const fns=F.mod?[...F.loc.keys()].filter(n=>!this.visible(F.loc.get(n))):[];
      return `<div class="fr${top?" top":""}${F.mod?" glob":""}"><div class="fr-h"><b>${esc(F.mod?"Chương trình chính":F.title)}</b><span>${top?(frames.length>1?"đang chạy · đỉnh stack":"đang chạy"):`đang chờ ở dòng ${F.line}`}</span></div>${names.length?`<table class="py-mem"><thead><tr><th>Tên</th><th>Kiểu</th><th>Giá trị</th></tr></thead><tbody>${names.map(n=>row(n,F.loc.get(n),top)).join("")}</tbody></table>`:`<p class="mem-empty">Chưa có biến.</p>`}${fns.length?`<p class="py-fns">Hàm và thư viện: ${fns.map(esc).join(", ")}</p>`:""}</div>`}).join("")}</div>`}
  seqHTML(v){const a=R.seqA(v);const L=v instanceof PyList?(this.cells.get(v)||[]):[];
    const cls=i=>{const c=L[i];return "ac"+(c&&this.wr.has(c)?" w":"")+(c&&this.rd.has(c)?" r":"")};
    const row=(arr,lim,owner)=>arr.slice(0,lim).map((x,i)=>`<span class="${owner===v?cls(i):"ac"}"><i>${i}</i><b>${esc(short(x,14))}</b></span>`).join("")+(arr.length>lim?`<span class="ac more"><i>…</i><b>+${arr.length-lim}</b></span>`:"");
    if(a.length&&a.every(x=>x instanceof PyList||x instanceof PyTuple))return `<span class="mx">${a.slice(0,16).map((r,i)=>`<span class="mx-r"><span class="mx-i">${i}</span><span class="ar">${r.a.length?row(r.a,24,r):'<span class="ac-e">(rỗng)</span>'}</span></span>`).join("")}${a.length>16?`<span class="mx-more">… còn ${a.length-16} hàng</span>`:""}</span>`;
    return `<span class="ar">${a.length?row(a,48,v):'<span class="ac-e">(rỗng)</span>'}</span>`}
  bufStatus(){return this.eof?`<span class="bad-t">input(): hết dữ liệu</span>`:`<span class="ok-t">input(): bình thường</span>`}
}
function short(v,max){let s;try{s=R.repr(v)}catch(e){s="…"}max=max||40;return s.length>max?s.slice(0,max-1)+"…":s}
function compile(src){const prog=PYC.compileModule(src);return{prog,warns:[]}}
R.setCallK&&0;
return{PyM,compile,NEED};
})();

/* ---------------- 7. đăng ký với giao diện chung ---------------- */
if(typeof LANGS!=="undefined"){
  const fmtPyErr=(src,err)=>{const p=Math.max(0,Math.min(err.p,src.length));const ln=src.slice(0,p).split("\n").length,col=p-src.lastIndexOf("\n",p-1);const lt=src.split("\n")[ln-1]||"";
    const ind=lt.length-lt.trimStart().length;
    return `  File "main.py", line ${ln}\n    ${esc(lt.trim())}\n    ${" ".repeat(Math.max(0,col-1-ind))}<span class="e">^</span>\n<span class="e">${esc(err.type)}: ${esc(err.message)}</span>`};
  LANGS.py={id:"py",name:"Python",file:"main.py",
    compile:src=>PYM.compile(src),Machine:PYM.PyM,isErr:e=>e instanceof PY.PErr,
    head:()=>'<span class="sys">$ python3 main.py</span>\n',
    errHead:(src,err,uns)=>'<span class="sys">$ python3 main.py</span>\n'+(uns?`<span class="w">chưa hỗ trợ: ${esc(err.message)}</span>`:fmtPyErr(src,err)),
    errTitle:err=>err.type==="IndentationError"?"Lỗi thụt lề":"Lỗi cú pháp",unsupNote:"Đây không phải lỗi Python: code có thể vẫn chạy đúng với Python trên máy thật.",
    inLabel:"Dữ liệu đầu vào cho input()",inHelp:"Mỗi lần gọi input() đọc một dòng. Gõ sẵn dữ liệu theo từng dòng (ví dụ dòng 1: <code>3</code>, dòng 2: <code>1 2 3</code>). Để trống thì khi chạy, chương trình sẽ hỏi bạn ở khung Kết quả.",
    bufTab:"Dữ liệu nhập",bufHead:"Dữ liệu nhập (input)",bufEmpty:"Dữ liệu bạn gõ sẽ vào đây trước, mỗi lần input() lấy ra một dòng.",
    noOut:"Chương trình không in gì ra màn hình (chưa có lệnh print nào chạy).",okTitle:"Chạy thành công",noBuild:"không chạy được",readWord:"input()",
    scope:`<p><b>Đây là trình mô phỏng để học</b>, chạy một phần của Python 3 ngay trên trình duyệt, không phải Python đầy đủ. Thông báo lỗi viết theo Python 3.13.</p>
      <p><b>Có:</b> int (số lớn tùy ý), float, str, bool, None; list, tuple, dict, set, range, cắt lát a[i:j:k]; f-string, format, %; if/elif/else, while, for, break, continue, else của vòng lặp; hàm (tham số mặc định, *args, **kwargs, đệ quy, hàm lồng nhau, global, nonlocal), lambda; list/dict/set comprehension; try/except/finally, raise, assert; input(), print(), sys.stdin; các hàm có sẵn (len, range, sorted, min, max, sum, map, zip, enumerate…); thư viện math, collections (deque, defaultdict, Counter), heapq, bisect, functools (lru_cache, reduce, cmp_to_key), itertools, string, random, copy.</p>
      <p><b>Chưa có:</b> class (lập trình hướng đối tượng), yield (hàm sinh), with, đọc ghi file, các thư viện ngoài (numpy…). Code dùng các phần này được báo là “chưa hỗ trợ”, không phải lỗi Python.</p>
      <p><b>Giới hạn:</b> 1 000 000 bước chạy, 1 000 tầng đệ quy (tăng được bằng sys.setrecursionlimit, tối đa 20 000), 200 000 ký tự đầu ra.</p>`};
}
