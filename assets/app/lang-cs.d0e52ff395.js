/* ================= TRÌNH MÔ PHỎNG C# (khóa Giải thuật) =================
   Chạy phần C# mà khóa học cần, ngay trên trình duyệt, nhẹ và chạy được từng bước:
   int, long, double, bool, char, string; mảng (kể cả mảng răng cưa int[][]); List, Dictionary, HashSet, Stack, Queue,
   PriorityQueue, StringBuilder; hàm static, hàm cục bộ, đệ quy, lambda; Console.ReadLine / Write / WriteLine;
   Math, Array, một phần LINQ (Select, Where, Sum, Max, Min, OrderBy, ToArray, ToList…).
   Mã nguồn → tách từ (lex) → cây cú pháp (parse) → kiểm tra kiểu (check, báo lỗi kiểu trình biên dịch C#)
   → máy CsM chạy cây bằng generator: mỗi câu lệnh dừng một lần ("Từng bước"), gọi hàm thì đi vào thân hàm.
   Giao diện dùng chung với trình mô phỏng C++ qua LANGS.cs (cuối file). */
const CS=(()=>{
"use strict";
class CErr extends Error{constructor(p,code,msg,vi,kind){super(msg);this.p=p;this.code=code||"";this.vi=vi||"";this.kind=kind||"compile"}}
const unsup=(p,what,vi)=>new CErr(p,"",what+" chưa có trong trình mô phỏng",vi||"Phần này của C# chưa có trong trình mô phỏng của khóa học. Code vẫn có thể đúng với trình biên dịch C# thật.","unsup");
const KW=new Set(("abstract as base bool break byte case catch char checked class const continue decimal default delegate do double else enum event explicit extern false finally fixed float for foreach goto if implicit in int interface internal is lock long namespace new null object operator out override params private protected public readonly ref return sbyte sealed short sizeof stackalloc static string struct switch this throw true try typeof uint ulong unchecked unsafe ushort using virtual void volatile while var").split(" "));
const PRED=new Set(["int","long","double","bool","char","string","void","object","float","decimal","byte","short","uint","ulong","sbyte","ushort"]);
const SUPPORTED_T=new Set(["int","long","double","bool","char","string","void","object"]);

/* ---------------- 1. tách từ ---------------- */
const OPS=["<<=",">>=","??=","=>","==","!=","<=",">=","&&","||","++","--","+=","-=","*=","/=","%=","&=","|=","^=","<<","??","?.","::","{","}","(",")","[","]",";",",",".",":","?","+","-","*","/","%","<",">","=","!","&","|","^","~"];
function lex(src,off){off=off||0;const T=[];let i=0;const n=src.length;
  const err=(p,m,vi)=>{throw new CErr(p+off,"CS1010",m,vi)};
  const esc=j=>{const c=src[j+1];const map={n:"\n",t:"\t",r:"\r","0":"\0","\\":"\\","'":"'",'"':'"',a:"\x07",b:"\b",f:"\f",v:"\v"};
    if(c in map)return[map[c],2];if(c==="u"){const h=src.slice(j+2,j+6);if(!/^[0-9a-fA-F]{4}$/.test(h))err(j,"Unrecognized escape sequence","Sau \\u cần đúng 4 chữ số hệ 16.");return[String.fromCharCode(parseInt(h,16)),6]}
    throw new CErr(j+off,"CS1009","Unrecognized escape sequence","Ký tự thoát không hợp lệ. Muốn viết dấu \\ trong chuỗi, viết \\\\.")};
  while(i<n){const c=src[i];
    if(c===" "||c==="\t"||c==="\r"||c==="\n"){i++;continue}
    if(c==="/"&&src[i+1]==="/"){while(i<n&&src[i]!=="\n")i++;continue}
    if(c==="/"&&src[i+1]==="*"){const j=src.indexOf("*/",i+2);if(j<0)throw new CErr(i+off,"CS1035","End-of-file found, '*/' expected","Chú thích /* chưa được đóng bằng */.");i=j+2;continue}
    if(c==="#"){throw unsup(i+off,"Chỉ thị tiền xử lý (#)")}
    // chuỗi nội suy $"..." / $@"..." / @$"..."
    if((c==="$"&&(src[i+1]==='"'||(src[i+1]==="@"&&src[i+2]==='"')))||(c==="@"&&src[i+1]==="$"&&src[i+2]==='"')){
      const verb=src.slice(i,i+3).includes("@");let j=i+(verb?3:2);const st=i;const parts=[];let s="";
      for(;;){if(j>=n||(!verb&&src[j]==="\n"))throw new CErr(st+off,"CS1039","Unterminated string literal","Chuỗi chưa được đóng: thiếu dấu \" ở cuối.");
        const d=src[j];
        if(d==='"'){if(verb&&src[j+1]==='"'){s+='"';j+=2;continue}j++;break}
        if(d==="\\"&&!verb){const[r,k]=esc(j);s+=r;j+=k;continue}
        if(d==="{"){if(src[j+1]==="{"){s+="{";j+=2;continue}
          if(s)parts.push({s});s="";let k=j+1,dep=0,q=null;
          for(;k<n;k++){const e=src[k];if(q){if(e==="\\")k++;else if(e===q)q=null;continue}if(e==='"'||e==="'"){q=e;continue}if(e==="("||e==="["||e==="{")dep++;else if(e===")"||e==="]")dep--;else if(e==="}"){if(dep===0)break;dep--}else if((e===":"||e===",")&&dep===0)break}
          const ex=src.slice(j+1,k),exP=j+1;let align=null,fmt=null;
          if(src[k]===","){let m=k+1;while(m<n&&src[m]!==":"&&src[m]!=="}")m++;align=parseInt(src.slice(k+1,m).trim(),10);if(isNaN(align))err(k,"Invalid alignment","Độ rộng sau dấu phẩy trong {…} phải là số nguyên.");k=m}
          if(src[k]===":"){let m=k+1;while(m<n&&src[m]!=="}")m++;fmt=src.slice(k+1,m);k=m}
          if(src[k]!=="}")throw new CErr(j+off,"CS8076","Missing close delimiter '}' for interpolated expression","Thiếu dấu } đóng biểu thức trong chuỗi $\"...\".");
          if(!ex.trim())err(j,"Empty expression in interpolated string","Trong {…} cần có một biểu thức.");
          parts.push({src:ex,p:exP+off,align,fmt});j=k+1;continue}
        if(d==="}"){if(src[j+1]==="}"){s+="}";j+=2;continue}err(j,"'}' character must be escaped (by doubling) in an interpolated string","Muốn in dấu } trong chuỗi $\"...\", viết }}.")}
        s+=d;j++}
      if(s)parts.push({s});T.push({t:"istr",parts,p:st+off,e:j+off});i=j;continue}
    if(c==="@"&&src[i+1]==='"'){let j=i+2,s="";for(;;){if(j>=n)throw new CErr(i+off,"CS1039","Unterminated string literal","Chuỗi chưa được đóng.");if(src[j]==='"'){if(src[j+1]==='"'){s+='"';j+=2;continue}j++;break}s+=src[j++]}T.push({t:"str",v:s,p:i+off,e:j+off});i=j;continue}
    if(c==='"'){let j=i+1,s="";for(;;){if(j>=n||src[j]==="\n")throw new CErr(i+off,"CS1010","Newline in constant","Chuỗi chưa được đóng: thiếu dấu \" ở cuối dòng.");const d=src[j];if(d==='"'){j++;break}if(d==="\\"){const[r,k]=esc(j);s+=r;j+=k;continue}s+=d;j++}
      T.push({t:"str",v:s,p:i+off,e:j+off});i=j;continue}
    if(c==="'"){let j=i+1,s;if(src[j]==="\\"){const[r,k]=esc(j);s=r;j+=k}else{s=src[j];j++}
      if(src[j]!=="'"){if(src[j-1]==="'"&&s==="'")throw new CErr(i+off,"CS1011","Empty character literal","Ký tự rỗng '' không hợp lệ.");throw new CErr(i+off,"CS1012","Too many characters in character literal","Dấu nháy đơn chỉ chứa đúng một ký tự. Chuỗi nhiều ký tự dùng nháy kép \"...\".")}
      T.push({t:"chr",v:s.charCodeAt(0),p:i+off,e:j+1+off});i=j+1;continue}
    if(/[0-9]/.test(c)||(c==="."&&/[0-9]/.test(src[i+1]||""))){let m;const r=src.slice(i);
      if((m=/^0[xX][0-9a-fA-F_]+([uU]?[lL]?|[lL]?[uU]?)/.exec(r))){const s=m[0];const suf=(m[1]||"").toLowerCase();const v=BigInt("0x"+s.slice(2,s.length-m[1].length).replace(/_/g,""));
        T.push({t:"num",ty:suf.includes("l")||v>2147483647n?"long":"int",v,p:i+off,e:i+s.length+off,raw:s});i+=s.length;continue}
      m=/^(\d[\d_]*)?(\.\d[\d_]*)?([eE][+-]?\d+)?([dDfFmMlLuU]{0,2})/.exec(r);const s=m[0],suf=m[4].toLowerCase(),body=s.slice(0,s.length-m[4].length).replace(/_/g,"");
      if(suf.includes("u"))throw unsup(i+off,"Số không dấu (hậu tố U)");if(suf==="m")throw unsup(i+off,"Kiểu decimal (hậu tố M)");if(suf==="f")throw unsup(i+off,"Kiểu float (hậu tố F)","Khóa học dùng double cho số thực.");
      if(m[2]||m[3]||suf==="d")T.push({t:"num",ty:"double",v:parseFloat(body),p:i+off,e:i+s.length+off,raw:s});
      else{const v=BigInt(body);if(v>9223372036854775807n)throw new CErr(i+off,"CS1021","Integral constant is too large","Số quá lớn, vượt cả kiểu long.");
        T.push({t:"num",ty:suf==="l"||v>2147483647n?"long":"int",v,p:i+off,e:i+s.length+off,raw:s})}
      i+=s.length;continue}
    if(/[A-Za-z_\u00C0-\u1EF9]/.test(c)){let j=i;while(j<n&&/[\w\u00C0-\u1EF9]/.test(src[j]))j++;const w=src.slice(i,j);T.push({t:KW.has(w)?"kw":"id",v:w,p:i+off,e:j+off});i=j;continue}
    if(c==="@"&&/[A-Za-z_]/.test(src[i+1]||"")){let j=i+1;while(j<n&&/\w/.test(src[j]))j++;T.push({t:"id",v:src.slice(i+1,j),p:i+off,e:j+off});i=j;continue}
    let op=null;for(const o of OPS)if(src.startsWith(o,i)){op=o;break}
    if(!op)throw new CErr(i+off,"CS1056",`Unexpected character '${c}'`,`Ký tự “${c}” không dùng được trong C#.`);
    T.push({t:"op",v:op,p:i+off,e:i+op.length+off});i+=op.length}
  T.push({t:"eof",v:"",p:n+off,e:n+off});return T}

/* ---------------- 2. phân tích cú pháp ---------------- */
/* kiểu: chuỗi "int", "int[]", "List<int>", "Dictionary<string,int>", "int[][]" … */
const TYPE_NAMES=new Set(["List","Dictionary","HashSet","Stack","Queue","PriorityQueue","StringBuilder","Func","Action","Comparison","KeyValuePair","IEnumerable","SortedSet","SortedDictionary","LinkedList","Tuple","IList","ICollection","IDictionary"]);
const STATIC_CLS=new Set(["Console","Math","Array","Convert","String","Int32","Int64","Double","Char","Enumerable","StringSplitOptions","Environment","Random","Comparer","EqualityComparer","Tuple","BitConverter","Buffer","GC","TimeSpan","DateTime"]);
class Parser{
  constructor(T,src){this.T=T;this.i=0;this.src=src}
  pk(o){return this.T[Math.min(this.i+(o||0),this.T.length-1)]}
  nx(){return this.T[this.i++]}
  is(v,o){const k=this.pk(o);return(k.t==="op"||k.t==="kw")&&k.v===v}
  isId(o){return this.pk(o).t==="id"}
  desc(k){return k.t==="eof"?"end of file":`'${k.t==="str"?'"'+k.v+'"':k.v}'`}
  prevEnd(){return this.i>0?this.T[this.i-1].e:0}
  expect(v,code,vi){if(this.is(v))return this.nx();const k=this.pk();
    if(v===";"||v===")"||v==="]"||v==="}")throw new CErr(this.prevEnd(),code||"CS1002",`${v} expected`,vi||(v===";"?"Thiếu dấu chấm phẩy ; ở cuối câu lệnh.":v===")"?"Thiếu dấu ngoặc đóng ).":v==="}"?"Thiếu dấu ngoặc nhọn đóng }.":"Thiếu dấu ]."));
    throw new CErr(k.p,code||"CS1003",`Syntax error, '${v}' expected`,vi||`Cần dấu ${v} ở đây.`)}
  ident(what){const k=this.pk();if(k.t==="id")return this.nx();
    if(k.t==="kw")throw new CErr(k.p,"CS1041",`Identifier expected; '${k.v}' is a keyword`,`“${k.v}” là từ khóa của C#, không dùng làm tên ${what||"biến"} được.`);
    throw new CErr(k.p,"CS1001","Identifier expected",`Cần một tên ${what||""} ở đây.`)}
  /* ---- kiểu dữ liệu ---- */
  typeStartAt(o){const k=this.pk(o);if(k.t==="kw"&&PRED.has(k.v))return true;if(k.t==="kw"&&k.v==="var")return true;return k.t==="id"}
  /* thử đọc một kiểu bắt đầu ở vị trí hiện tại; không được thì trả về null và không đổi vị trí */
  tryType(){const s=this.i;try{const t=this.type(true);return t}catch(e){this.i=s;if(e instanceof CErr&&e.kind==="unsup")throw e;return null}}
  type(soft){const k=this.pk();let t;
    if(k.t==="kw"&&(PRED.has(k.v)||k.v==="var")){this.nx();t=k.v;
      if(!SUPPORTED_T.has(t)&&t!=="var"){if(soft)throw 0;throw unsup(k.p,`Kiểu ${t}`,t==="float"?"Khóa học dùng double cho số thực.":"Khóa học dùng int, long, double, bool, char, string.")}}
    else if(k.t==="id"){this.nx();let name=k.v;
      while(this.is(".")&&this.isId(1)&&(name==="System"||name==="Collections"||name==="Generic"||name==="Text"||name==="Linq")){this.nx();name=this.nx().v}
      if(name==="Int32")name="int";else if(name==="Int64")name="long";else if(name==="Double")name="double";else if(name==="String"&&!this.is("."))name="string";else if(name==="Boolean")name="bool";else if(name==="Char"&&!this.is("."))name="char";
      t=name;
      if(this.is("<")){this.nx();const args=[this.type(soft)];while(this.is(",")){this.nx();args.push(this.type(soft))}
        if(this.is(">"))this.nx();else if(this.is(">>")){this.T[this.i]={...this.pk(),v:">",p:this.pk().p+1}}else if(this.is(">=")||this.is(">>=")){if(soft)throw 0;this.expect(">")}else{if(soft)throw 0;this.expect(">")}
        t=name+"<"+args.join(",")+">"}
      else if(soft&&!TYPE_NAMES.has(name)&&!this.isId()&&!this.is("[")){throw 0}}
    else{if(soft)throw 0;throw new CErr(k.p,"CS1031","Type expected","Cần tên một kiểu dữ liệu ở đây (int, long, double, string…).")}
    while(this.is("[")&&(this.is("]",1)||this.is(",",1))){if(this.is(",",1)){throw unsup(this.pk().p,"Mảng nhiều chiều dạng int[,]","Dùng mảng răng cưa int[][] (mảng của các mảng).")}this.nx();this.nx();t+="[]"}
    if(this.is("?")&&!soft){const q=this.pk();if(!/^[=;,)]/.test(this.pk(1).v||"")||t==="var")throw unsup(q.p,"Kiểu cho phép null (T?)")}
    return t}
  /* ---- chương trình ---- */
  program(){const P={classes:[],top:[],usings:[],p0:0};
    while(this.is("using")&&!this.is("(",1)){const k=this.nx();let nm="";if(this.is("static"))throw unsup(k.p,"using static");
      nm=this.ident("thư viện").v;while(this.is(".")){this.nx();nm+="."+this.ident("thư viện").v}
      if(this.is("=")) throw unsup(k.p,"Bí danh using X = …");this.expect(";");P.usings.push({n:nm,p:k.p})}
    if(this.is("namespace")){this.nx();this.ident();while(this.is(".")){this.nx();this.ident()}if(this.is(";"))this.nx();else{this.expect("{");P.nsBrace=true}}
    for(;;){const k=this.pk();if(k.t==="eof")break;if(P.nsBrace&&this.is("}")){this.nx();P.nsBrace=false;continue}
      const s=this.i;let mods=[];while(this.pk().t==="kw"&&["public","private","internal","static","sealed","partial","abstract"].includes(this.pk().v))mods.push(this.nx().v);
      if(this.is("class")||this.is("struct")||this.is("record")||this.is("interface")||this.is("enum")){
        if(!this.is("class"))throw unsup(this.pk().p,this.pk().v,"Khóa học chỉ dùng class chứa các hàm static.");
        P.classes.push(this.classDecl(mods));continue}
      this.i=s;if(P.classes.length&&!P.top.length&&false){}
      P.top.push(this.stmt(true))}
    if(P.nsBrace)this.expect("}");
    return P}
  classDecl(mods){const kc=this.nx();const nm=this.ident("lớp");const C={name:nm.v,p:nm.p,fields:[],methods:[]};
    if(this.is("<"))throw unsup(this.pk().p,"Lớp tổng quát (generic class)");if(this.is(":"))throw unsup(this.pk().p,"Kế thừa");
    this.expect("{");
    while(!this.is("}")){if(this.pk().t==="eof")this.expect("}");
      const ms=[];while(this.pk().t==="kw"&&["public","private","internal","static","const","readonly","protected","override","virtual","sealed","unsafe","extern","new"].includes(this.pk().v))ms.push(this.nx());
      if(this.is("class")){throw unsup(this.pk().p,"Lớp lồng trong lớp")}
      if(this.isId()&&this.pk().v===C.name&&this.is("(",1))throw unsup(this.pk().p,"Hàm khởi tạo (constructor) và đối tượng","Khóa học dùng các hàm static; lập trình hướng đối tượng học ở khóa C# căn bản.");
      const isStatic=ms.some(m=>m.v==="static"||m.v==="const"),isConst=ms.some(m=>m.v==="const");
      const tp=this.pk().p;const t=this.is("void")?(this.nx(),"void"):this.type();const nmk=this.ident("thành phần");
      if(this.is("(")){if(!isStatic)throw unsup(nmk.p,"Phương thức không static (cần đối tượng)","Thêm từ khóa static: static "+t+" "+nmk.v+"(...). Khóa học dùng các hàm static.");
        C.methods.push(this.methodRest(t,nmk,tp));continue}
      if(this.is("{"))throw unsup(nmk.p,"Thuộc tính (property) { get; set; }");
      if(!isStatic)throw unsup(nmk.p,"Trường không static (cần đối tượng)","Thêm từ khóa static cho biến dùng chung của lớp.");
      for(;;){let init=null;if(this.is("=")){this.nx();init=this.varInit(t)}C.fields.push({t,name:nmk.v,p:nmk.p,init,isConst});if(!this.is(","))break;this.nx();const n2=this.ident();nmk.v=n2.v;nmk.p=n2.p}
      this.expect(";")}
    this.expect("}");return C}
  methodRest(t,nmk,tp){this.expect("(");const ps=[];
    if(!this.is(")"))for(;;){const k=this.pk();if(this.is("ref")||this.is("out")||this.is("params")||this.is("in"))throw unsup(k.p,`Tham số ${k.v}`,k.v==="ref"||k.v==="out"?"Muốn hàm sửa được mảng/List thì truyền thẳng (mảng là kiểu tham chiếu). Muốn trả nhiều giá trị, dùng biến static hoặc trả về mảng.":"");
      const pt=this.type();if(pt==="var")throw new CErr(k.p,"CS0825","The contextual keyword 'var' may only appear within a local variable declaration","Tham số phải ghi rõ kiểu, không dùng var.");
      const pn=this.ident("tham số");let def=null;if(this.is("=")){this.nx();def=this.expr()}
      ps.push({t:pt,name:pn.v,p:pn.p,def});if(!this.is(","))break;this.nx()}
    this.expect(")");
    if(this.is("=>")){this.nx();const e=this.expr();this.expect(";");return{name:nmk.v,p:nmk.p,ret:t,ps,body:{k:"block",ss:[t==="void"?{k:"expr",e,p:e.p}:{k:"ret",e,p:e.p}],p:e.p},tp}}
    if(!this.is("{")){const k=this.pk();throw new CErr(this.prevEnd(),"CS1002","; expected","Sau danh sách tham số cần thân hàm { … }.")}
    return{name:nmk.v,p:nmk.p,ret:t,ps,body:this.block(),tp}}
  block(){const k=this.expect("{");const ss=[];while(!this.is("}")){if(this.pk().t==="eof")throw new CErr(this.prevEnd(),"CS1513","} expected","Thiếu dấu ngoặc nhọn đóng } cho khối lệnh mở ở dòng "+lineOf(this.src,k.p)+".");ss.push(this.stmt(false))}this.nx();return{k:"block",ss,p:k.p,end:this.prevEnd()}}
  /* phân biệt khai báo (kiểu + tên) với biểu thức */
  declAhead(){const s=this.i;const k=this.pk();
    if(!(k.t==="id"||(k.t==="kw"&&(PRED.has(k.v)||k.v==="var"))))return null;
    const t=this.tryType();if(t===null){this.i=s;return null}
    if(this.isId()&&(this.is("=",1)||this.is(";",1)||this.is(",",1)||this.is("in",1)||this.is("(",1))){return t}
    this.i=s;return null}
  stmt(top){const k=this.pk();
    if(k.t==="op"&&k.v==="{")return this.block();
    if(k.t==="op"&&k.v===";"){this.nx();return{k:"empty",p:k.p}}
    if(k.t==="kw")switch(k.v){
      case "if":{this.nx();this.expect("(");const c=this.expr();this.expect(")");const th=this.stmtBody();let el=null;if(this.is("else")){this.nx();el=this.stmtBody()}return{k:"if",c,th,el,p:k.p}}
      case "while":{this.nx();this.expect("(");const c=this.expr();this.expect(")");return{k:"while",c,body:this.stmtBody(),p:k.p}}
      case "do":{this.nx();const body=this.stmtBody();if(!this.is("while"))this.expect("while");const w=this.nx();this.expect("(");const c=this.expr();this.expect(")");this.expect(";");return{k:"do",c,body,p:k.p,wp:w.p}}
      case "for":{this.nx();this.expect("(");let init=[];
        if(!this.is(";")){const t=this.declAhead();if(t){init=[this.declRest(t,this.pk().p)]}else{init.push({k:"expr",e:this.expr(),p:this.pk().p});while(this.is(",")){this.nx();init.push({k:"expr",e:this.expr()})}}}
        this.expect(";");const c=this.is(";")?null:this.expr();this.expect(";");const st=[];if(!this.is(")")){st.push(this.expr());while(this.is(",")){this.nx();st.push(this.expr())}}
        this.expect(")");return{k:"for",init,c,st,body:this.stmtBody(),p:k.p}}
      case "foreach":{this.nx();this.expect("(");const tp=this.pk().p;const t=this.type();const nm=this.ident();if(!this.is("in"))this.expect("in");this.nx();const e=this.expr();this.expect(")");return{k:"foreach",t,name:nm.v,np:nm.p,e,body:this.stmtBody(),p:k.p}}
      case "return":{this.nx();const e=this.is(";")?null:this.expr();this.expect(";");return{k:"ret",e,p:k.p}}
      case "break":{this.nx();this.expect(";");return{k:"break",p:k.p}}
      case "continue":{this.nx();this.expect(";");return{k:"cont",p:k.p}}
      case "switch":return this.switchStmt();
      case "throw":{this.nx();const e=this.is(";")?null:this.expr();this.expect(";");return{k:"throw",e,p:k.p}}
      case "const":{this.nx();const t=this.type();const d=this.declRest(t,k.p);d.isConst=true;this.expect(";");return d}
      case "try":case "goto":case "lock":case "unsafe":case "fixed":case "checked":case "unchecked":case "yield":throw unsup(k.p,`Lệnh ${k.v}`);
      case "else":throw new CErr(k.p,"CS8641","'else' cannot start a statement","else phải đi ngay sau thân của một lệnh if.");
      case "case":case "default":if(!this.is("(",1))throw new CErr(k.p,"CS1513","} expected","case/default chỉ dùng bên trong switch.");break;
      case "static":{if(this.typeStartAt(1)||this.is("void",1)){this.nx();return this.localFn(k.p,true)}break}
      case "class":throw unsup(k.p,"Khai báo class ở giữa các câu lệnh","Đặt class sau các câu lệnh, hoặc viết các hàm cục bộ.")}
    if(this.is("void")){return this.localFn(k.p)}
    // hàm cục bộ: kiểu Tên(
    {const s=this.i;const t=this.typeStartAt()?this.tryType():null;if(t!==null&&this.isId()&&this.is("(",1)){this.i=s;return this.localFn(k.p)}this.i=s}
    const t=this.declAhead();
    if(t){const d=this.declRest(t,k.p);this.expect(";");return d}
    const e=this.expr();
    if(!this.is(";")){const n=this.pk();if(n.t!=="eof"&&lineOf(this.src,n.p)===lineOf(this.src,this.prevEnd()))throw new CErr(n.p,"CS1002","; expected",`Thiếu dấu ; hoặc viết sai cú pháp trước ${this.desc(n)}.`)}
    this.expect(";");
    if(!["assign","call","post","pre","new","tswap"].includes(e.k)&&!(e.k==="cond"))throw new CErr(e.p,"CS0201","Only assignment, call, increment, decrement, await, and new object expressions can be used as a statement","Biểu thức này tính ra một giá trị nhưng không dùng đến. Có thể bạn quên gán (x = …) hoặc quên gọi hàm in.");
    return{k:"expr",e,p:e.p}}
  stmtBody(){const k=this.pk();if(this.is(";")){this.nx();return{k:"empty",p:k.p,warnEmpty:true}}
    const t=this.declAhead();if(t)throw new CErr(k.p,"CS1023","Embedded statement cannot be a declaration or labeled statement","Muốn khai báo biến ở đây, đặt nó trong cặp ngoặc nhọn { … }.");return this.stmt(false)}
  localFn(p,isStatic){const t=this.is("void")?(this.nx(),"void"):this.type();const nm=this.ident("hàm");const m=this.methodRest(t,nm,p);m.k="fn";m.local=true;m.p=nm.p;return m}
  declRest(t,p){const ds=[];
    for(;;){const nm=this.ident();let init=null;
      if(this.is("(")){throw new CErr(this.pk().p,"CS1002","; expected","Khai báo biến không có dấu ( sau tên. Muốn tạo đối tượng, viết: "+t+" "+nm.v+" = new "+t+"(...);")}
      if(this.is("[")) throw new CErr(this.pk().p,"CS0650","Bad array declarator: To declare a managed array the rank specifier precedes the variable's identifier","Trong C#, dấu [] viết sau kiểu, không viết sau tên: "+t+"[] "+nm.v+" = new "+t+"[n];");
      if(this.is("=")){this.nx();init=this.varInit(t)}
      else if(t==="var")throw new CErr(nm.p,"CS0818","Implicitly-typed variables must be initialized","Biến khai báo bằng var phải được gán giá trị ngay (để C# biết kiểu).");
      ds.push({name:nm.v,p:nm.p,init});if(!this.is(","))break;this.nx()}
    if(t==="var"&&ds.length>1)throw new CErr(p,"CS0819","Implicitly-typed variables cannot have multiple declarators","Mỗi khai báo var chỉ một biến.");
    return{k:"decl",t,ds,p}}
  varInit(t){if(this.is("{")){if(!t.endsWith("[]"))throw new CErr(this.pk().p,"CS0622","Can only use array initializer expressions to assign to array types. Try using a new expression instead.","Danh sách { … } chỉ dùng để khởi tạo mảng. Với List, viết new List<…> { … }.");return this.arrInit(t.slice(0,-2))}return this.expr()}
  arrInit(el){const k=this.expect("{");const xs=[];while(!this.is("}")){xs.push(this.is("{")?this.arrInit(el.endsWith("[]")?el.slice(0,-2):el):this.expr());if(!this.is(","))break;this.nx()}this.expect("}");return{k:"newarr",el,init:xs,p:k.p}}
  switchStmt(){const k=this.nx();this.expect("(");const e=this.expr();this.expect(")");this.expect("{");const secs=[];
    while(!this.is("}")){const labels=[];
      while(this.is("case")||this.is("default")){const c=this.nx();if(c.v==="default"){labels.push({def:true,p:c.p})}else{const v=this.expr();if(this.is("when"))throw unsup(this.pk().p,"case … when");labels.push({e:v,p:c.p})}this.expect(":")}
      if(!labels.length){const n=this.pk();throw new CErr(n.p,"CS1513","} expected","Trong switch, mỗi nhóm lệnh phải bắt đầu bằng case …: hoặc default:.")}
      const ss=[];while(!this.is("case")&&!this.is("default")&&!this.is("}")){if(this.pk().t==="eof")this.expect("}");ss.push(this.stmt(false))}
      secs.push({labels,ss})}
    this.nx();return{k:"switch",e,secs,p:k.p}}
  /* ---- biểu thức ---- */
  expr(){return this.assign()}
  assign(){const s=this.i;
    // lambda: x => …   (x, y) => …   () => …
    if(this.isId()&&this.is("=>",1)){const nm=this.nx();this.nx();return this.lamBody([{name:nm.v,t:null}],nm.p)}
    if(this.is("(")){let j=1;const ps=[];let ok=true;
      if(this.is(")",1)&&this.is("=>",2)){const k=this.nx();this.nx();this.nx();return this.lamBody([],k.p)}
      for(;;){if(this.isId(j)&&(this.is(",",j+1)||this.is(")",j+1))){ps.push({name:this.pk(j).v,t:null});j++}
        else if((this.pk(j).t==="kw"&&PRED.has(this.pk(j).v))&&this.isId(j+1)){ps.push({name:this.pk(j+1).v,t:this.pk(j).v});j+=2}
        else{ok=false;break}
        if(this.is(",",j)){j++;continue}if(this.is(")",j)&&this.is("=>",j+1))break;ok=false;break}
      if(ok&&ps.length){const k=this.pk();this.i+=j+2;return this.lamBody(ps,k.p)}}
    const L=this.cond();
    if(this.pk().t==="op"&&["=","+=","-=","*=","/=","%=","&=","|=","^=","<<=",">>=","??="].includes(this.pk().v)){const op=this.nx();
      if(L.k==="tuple"&&op.v==="="){if(!L.xs.every(x=>["id","index"].includes(x.k)))throw new CErr(L.p,"CS0131","The left-hand side of an assignment must be a variable, property or indexer","Trong (x, y) = (…, …), vế trái chỉ gồm biến hoặc phần tử a[i].");const R=this.assign();
        if(R.k!=="tuple"||R.xs.length!==L.xs.length)throw unsup(R.p,"Gán bộ giá trị (tuple) không cùng dạng","Trình mô phỏng hỗ trợ dạng đổi chỗ (a, b) = (b, a) với hai vế cùng số phần tử.");return{k:"tswap",ts:L.xs,vs:R.xs,p:L.p,op_p:op.p}}
      if(!["id","index","member"].includes(L.k))throw new CErr(L.p,"CS0131","The left-hand side of an assignment must be a variable, property or indexer","Vế trái của phép gán phải là một biến, một phần tử a[i] hoặc thuộc tính, không phải biểu thức tính toán.");
      const R=this.assign();return{k:"assign",op:op.v,t:L,v:R,p:L.p,op_p:op.p}}
    return L}
  lamBody(ps,p){if(this.is("{"))return{k:"lambda",ps,body:this.block(),p};return{k:"lambda",ps,expr:this.assign(),p}}
  cond(){const c=this.coalesce();if(this.is("?")){const q=this.nx();const a=this.assign();this.expect(":");const b=this.assign();return{k:"cond",c,a,b,p:c.p}}return c}
  coalesce(){const a=this.bin(0);if(this.is("??")){const k=this.nx();const b=this.coalesce();return{k:"bin",op:"??",a,b,p:a.p,op_p:k.p}}return a}
  bin(lv){const LV=[["||"],["&&"],["|"],["^"],["&"],["==","!="],["<",">","<=",">=","is","as"],["<<",">>"],["+","-"],["*","/","%"]];
    if(lv>=LV.length)return this.unary();
    let a=this.bin(lv+1);
    for(;;){const k=this.pk();
      if(lv===7&&k.t==="op"&&k.v===">"&&this.is(">",1)&&this.pk(1).p===k.p+1){this.nx();this.nx();const b=this.bin(lv+1);a={k:"bin",op:">>",a,b,p:a.p,op_p:k.p};continue}
      if(!((k.t==="op"||k.t==="kw")&&LV[lv].includes(k.v)))break;
      if(k.v==="is"||k.v==="as")throw unsup(k.p,`Toán tử ${k.v}`);
      this.nx();const b=this.bin(lv+1);a={k:"bin",op:k.v,a,b,p:a.p,op_p:k.p}}
    return a}
  unary(){const k=this.pk();
    if(k.t==="op"&&["+","-","!","~"].includes(k.v)){this.nx();const x=this.unary();
      if(k.v==="-"&&x.k==="num"&&!x.neg){x.v=-x.v;x.neg=true;x.p=k.p;if(x.ty==="long"&&x.v===-2147483648n)x.ty="int";return x}
      return{k:"un",op:k.v,x,p:k.p}}
    if(k.t==="op"&&(k.v==="++"||k.v==="--")){this.nx();const x=this.unary();return{k:"pre",op:k.v,x,p:k.p}}
    // ép kiểu (int)x
    if(this.is("(")&&this.pk(1).t==="kw"&&PRED.has(this.pk(1).v)){let j=2;while(this.is("[",j)&&this.is("]",j+1))j+=2;
      if(this.is(")",j)){const t=this.pk(1).v+"[]".repeat((j-2)/2);if(!SUPPORTED_T.has(this.pk(1).v))throw unsup(this.pk(1).p,`Kiểu ${this.pk(1).v}`);this.i+=j+1;const x=this.unary();return{k:"cast",t,x,p:k.p}}}
    return this.postfix(this.primary())}
  args(){this.expect("(");const a=[];
    if(!this.is(")"))for(;;){if(this.is("out")){const o=this.nx();let t=null;if(this.typeStartAt()&&this.isId(1)||(this.typeStartAt()&&(this.is("<",1)||this.is("[",1)))){const s=this.i;const tt=this.tryType();if(tt!==null&&this.isId())t=tt;else this.i=s}
        const nm=this.ident();a.push({k:"out",t,name:nm.v,p:o.p,np:nm.p})}
      else if(this.is("ref")||this.is("in")){throw unsup(this.pk().p,"Đối số ref")}
      else{if(this.isId()&&this.is(":",1))throw unsup(this.pk().p,"Đối số có tên (tên: giá trị)");a.push(this.expr())}
      if(!this.is(","))break;this.nx()}
    this.expect(")");return a}
  postfix(x){for(;;){const k=this.pk();
      if(this.is(".")||this.is("?.")){if(this.is("?."))throw unsup(k.p,"Toán tử ?.");this.nx();const nm=this.pk();
        if(nm.t!=="id"&&!(nm.t==="kw"&&["ToString","Equals"].includes(nm.v)))throw new CErr(nm.p,"CS1001","Identifier expected","Sau dấu chấm cần tên một thuộc tính hoặc phương thức.");this.nx();
        let targs=null;if(this.is("<")&&/^(Max|Min|Sum|Select|ToArray|ToList|Cast|OfType|Empty|Repeat|Range)$/.test(nm.v)){const s=this.i;try{this.nx();targs=[this.type(true)];while(this.is(",")){this.nx();targs.push(this.type(true))}this.expect(">")}catch(e){this.i=s;targs=null}}
        x={k:"member",o:x,name:nm.v,p:x.p,np:nm.p,targs};continue}
      if(this.is("(")){const a=this.args();x={k:"call",f:x,a,p:x.p,cp:k.p,end:this.prevEnd()};continue}
      if(this.is("[")){this.nx();const idx=[this.expr()];while(this.is(",")){this.nx();idx.push(this.expr())}this.expect("]");if(idx.length>1)throw unsup(k.p,"Chỉ số nhiều chiều a[i, j]","Dùng mảng răng cưa: a[i][j].");x={k:"index",o:x,i:idx[0],p:x.p,ip:k.p};continue}
      if(this.is("++")||this.is("--")){this.nx();x={k:"post",op:k.v,x,p:x.p};continue}
      if(this.is("!")&&false){}
      return x}}
  primary(){const k=this.pk();
    switch(k.t){
      case "num":this.nx();return{k:"num",ty:k.ty,v:k.ty==="double"?k.v:k.v,p:k.p,raw:k.raw};
      case "str":this.nx();return{k:"str",v:k.v,p:k.p};
      case "chr":this.nx();return{k:"chr",v:k.v,p:k.p};
      case "istr":{this.nx();const parts=k.parts.map(x=>{if(x.s!==undefined)return x;const sub=this.src.slice(x.p,x.p+x.src.length);const P2=new Parser(lex(x.src,x.p),this.src);const e=P2.expr();if(P2.pk().t!=="eof")throw new CErr(P2.pk().p,"CS1073","Unexpected token","Biểu thức trong {…} viết sai.");return{e,align:x.align,fmt:x.fmt}});return{k:"istr",parts,p:k.p}}
      case "id":if(k.v==="System"&&this.is(".",1)&&this.isId(2)){this.nx();this.nx();while(["Collections","Generic","Text","Linq"].includes(this.pk().v)&&this.is(".",1)){this.nx();this.nx()}const q=this.primary();q.qual=true;return q}
        this.nx();return{k:"id",name:k.v,p:k.p,e:k.e};
      case "kw":
        if(k.v==="true"||k.v==="false"){this.nx();return{k:"bool",v:k.v==="true",p:k.p}}
        if(k.v==="null"){this.nx();return{k:"null",p:k.p}}
        if(k.v==="new")return this.newExpr();
        if(PRED.has(k.v)){this.nx();if(!SUPPORTED_T.has(k.v))throw unsup(k.p,`Kiểu ${k.v}`);return{k:"id",name:{int:"int",long:"long",double:"double",bool:"bool",char:"char",string:"string",object:"object",void:"void"}[k.v],p:k.p,tyname:true}}
        if(k.v==="this"||k.v==="base")throw unsup(k.p,k.v,"Khóa học dùng các hàm static, không dùng đối tượng.");
        if(k.v==="default"){this.nx();if(this.is("(")){this.nx();const t=this.type();this.expect(")");return{k:"default",t,p:k.p}}return{k:"default",t:null,p:k.p}}
        if(k.v==="sizeof"&&this.is("(",1)){this.nx();this.nx();const tk=this.pk();const t=this.type();this.expect(")");const SZ={int:4,long:8,double:8,char:2,bool:1};if(!SZ[t])throw new CErr(tk.p,"CS0233",`'${t}' does not have a predefined size, therefore sizeof can only be used in an unsafe context`,"sizeof chỉ dùng với kiểu số, char, bool (ví dụ sizeof(int) là 4).");return{k:"num",ty:"int",v:BigInt(SZ[t]),p:k.p,raw:String(SZ[t])}}
        if(k.v==="typeof"||k.v==="sizeof"||k.v==="checked"||k.v==="unchecked"||k.v==="delegate"||k.v==="stackalloc")throw unsup(k.p,k.v);
        throw new CErr(k.p,"CS1525",`Invalid expression term '${k.v}'`,`Từ khóa ${k.v} không đứng được ở vị trí này.`);
      case "op":
        if(k.v==="("){this.nx();if(this.is(")"))throw new CErr(this.pk().p,"CS1525","Invalid expression term ')'","Cặp ngoặc rỗng ( ) không phải biểu thức.");const e=this.expr();
          if(this.is(",")){const xs=[e];while(this.is(",")){this.nx();xs.push(this.expr())}this.expect(")");return{k:"tuple",xs,p:k.p}}this.expect(")");e.paren=true;return e}
        if(k.v==="{")throw new CErr(k.p,"CS1525","Invalid expression term '{'","Danh sách { … } chỉ dùng khi khởi tạo mảng: int[] a = { 1, 2, 3 }; hoặc new int[] { 1, 2, 3 }.");
        if(k.v==="["&&false){}
        throw new CErr(k.p,"CS1525",`Invalid expression term '${k.v}'`,`Thiếu một giá trị trước ${k.v}, hoặc thừa dấu ${k.v}.`);
      case "eof":throw new CErr(k.p,"CS1733","Expected expression","Câu lệnh bị cắt ngang: thiếu phần còn lại của biểu thức.")}
    throw new CErr(k.p,"CS1525","Invalid expression term","Cú pháp không hợp lệ.")}
  newExpr(){const k=this.nx();
    if(this.is("(")){this.nx();this.expect(")");if(this.is("{"))throw unsup(k.p,"new() { … } không ghi kiểu");return{k:"new",t:null,a:[],p:k.p}}
    if(this.is("[")){this.nx();this.expect("]");return this.arrInit2(null,k.p)}
    const tp=this.pk().p;let base;const kk=this.pk();
    if(kk.t==="kw"&&PRED.has(kk.v)){this.nx();base=kk.v;if(!SUPPORTED_T.has(base))throw unsup(kk.p,`Kiểu ${base}`)}
    else{const nm=this.ident("kiểu");base=nm.v;if(base==="Int32")base="int";else if(base==="Int64")base="long";
      if(this.is("<")){this.nx();const as=[this.type()];while(this.is(",")){this.nx();as.push(this.type())}if(this.is(">>")){this.T[this.i]={...this.pk(),v:">",p:this.pk().p+1}}else this.expect(">");base+="<"+as.join(",")+">"}}
    if(this.is("[")){this.nx();
      if(this.is("]")){this.nx();let t=base;while(this.is("[")&&this.is("]",1)){this.nx();this.nx();t+="[]"}return this.arrInit2(t,k.p)}
      if(this.is(","))throw unsup(this.pk().p,"Mảng nhiều chiều new int[n, m]","Dùng mảng răng cưa: new int[n][] rồi cấp từng hàng.");
      const size=this.expr();this.expect("]");let t=base,rest="";while(this.is("[")){if(!this.is("]",1)){throw new CErr(this.pk().p,"CS0178","Invalid rank specifier: expected ',' or ']'","Mảng răng cưa: chỉ ghi kích thước ở cặp [] đầu tiên, ví dụ new int[n][]; các hàng tạo sau bằng new int[m].")}this.nx();this.nx();rest+="[]"}
      let init=null;if(this.is("{")){init=this.arrInit((t+rest)).init}
      return{k:"newarr",el:t+rest,size,init,p:k.p}}
    let a=[];if(this.is("("))a=this.args();
    let init=null;
    if(this.is("{")){const b=this.nx();init=[];while(!this.is("}")){if(this.is("{")){const q=this.nx();const kv=[this.expr()];while(this.is(",")){this.nx();kv.push(this.expr())}this.expect("}");init.push({kv,p:q.p})}else if(this.is("[")){throw unsup(this.pk().p,"Khởi tạo Dictionary dạng [khóa] = giá trị","Viết { { khóa, giá trị }, … } hoặc gọi Add sau khi tạo.")}else init.push(this.expr());if(!this.is(","))break;this.nx()}this.expect("}")}
    else if(!a.length&&this.prevEnd()<=tp)this.expect("(");
    return{k:"new",t:base,a,init,p:k.p,tp}}
  arrInit2(el,p){if(!this.is("{"))this.expect("{");const xs=this.arrInit(el||"?").init;return{k:"newarr",el:el||null,init:xs,p}}
}
/* có lời gọi hàm của người viết (hoặc Console.ReadLine) ở bên trong không: khi đó biểu thức chạy bằng generator để dừng từng bước được */
function kidsGc(e){for(const k of ["o","i","x","c","a","b","v","t","f","size"]){const y=e[k];if(y&&typeof y==="object"){if(Array.isArray(y)){if(y.some(z=>z&&z.gc))return true}else if(y.gc)return true}}
  if(Array.isArray(e.init)&&e.init.some(z=>z&&(z.gc||(z.kv&&z.kv.some(w=>w.gc)))))return true;if(e.parts&&e.parts.some(z=>z.e&&z.e.gc))return true;return false}
function lineOf(src,p){return src.slice(0,Math.max(0,p)).split("\n").length}

/* ---------------- 3. kiểu dữ liệu ---------------- */
const isArr=t=>typeof t==="string"&&t.endsWith("[]");
const elemOf=t=>t.slice(0,-2);
function gen(t){if(typeof t!=="string")return null;const i=t.indexOf("<");if(i<0||!t.endsWith(">"))return null;const n=t.slice(0,i),body=t.slice(i+1,-1);const a=[];let d=0,s=0;
  for(let k=0;k<body.length;k++){const c=body[k];if(c==="<")d++;else if(c===">")d--;else if(c===","&&d===0){a.push(body.slice(s,k));s=k+1}}a.push(body.slice(s));return{n,a}}
const NUM=new Set(["int","long","double","char"]),INTEGRAL=new Set(["int","long","char"]);
const isNumT=t=>NUM.has(t),isIntT=t=>INTEGRAL.has(t);
function promo(a,b){if(a==="double"||b==="double")return "double";if(a==="long"||b==="long")return "long";return "int"}
const isRefT=t=>t==="string"||t==="object"||isArr(t)||!!gen(t)||t==="StringBuilder"||t==="null";
/* phần tử khi duyệt foreach / LINQ */
function seqElem(t){if(t==="string")return "char";if(isArr(t))return elemOf(t);const g=gen(t);if(!g)return null;
  if(g.n==="Dictionary"||g.n==="SortedDictionary")return `KeyValuePair<${g.a[0]},${g.a[1]}>`;
  if(["List","HashSet","Stack","Queue","IEnumerable","SortedSet","KeyColl","LinkedList","IList","ICollection"].includes(g.n))return g.a[0];
  if(g.n==="PriorityQueue")return `(${g.a[0]},${g.a[1]})`;return null}
const CLRN={int:"Int32",long:"Int64",double:"Double",char:"Char",string:"String",bool:"Boolean",object:"Object"};
function clrName(t){if(CLRN[t])return "System."+CLRN[t];if(isArr(t))return clrName(elemOf(t))+"[]";const g=gen(t);
  if(g){const ns=g.n==="StringBuilder"?"System.Text.":g.n==="KeyValuePair"?"System.Collections.Generic.":"System.Collections.Generic.";return ns+g.n+"`"+g.a.length+"["+g.a.map(clrName).join(",")+"]"}
  if(t==="StringBuilder")return "System.Text.StringBuilder";return t}
/* chuyển ngầm định được không (C# cho phép mở rộng số, null vào kiểu tham chiếu, mọi thứ vào object) */
function canImp(from,to){if(from===to||to==="object")return true;if(from==="null")return isRefT(to);
  if(from==="int")return to==="long"||to==="double";if(from==="long")return to==="double";if(from==="char")return to==="int"||to==="long"||to==="double";
  const gt=gen(to);if(gt&&(gt.n==="IEnumerable"||gt.n==="IList"||gt.n==="ICollection")){const e=seqElem(from);return e===gt.a[0]}
  return false}
function canExp(from,to){if(canImp(from,to))return true;if(isNumT(from)&&isNumT(to))return true;if(from==="object")return true;return false}
const showT=t=>t==="null"?"<null>":t;

/* ---------------- 4. kiểm tra kiểu, gắn tên ---------------- */
class Checker{
  constructor(P,src){this.P=P;this.src=src;this.warns=[];this.fns=new Map();this.statics=new Map();this.usings=new Set(P.usings.map(u=>u.n));this.usingP=new Map(P.usings.map(u=>[u.n,u.p]));this.usedNs=new Set()}
  err(p,code,msg,vi){return new CErr(p,code,msg,vi)}
  /* ---- chương trình ---- */
  run(){const P=this.P;let main=null;
    for(const C of P.classes){
      for(const f of C.fields){if(this.statics.has(f.name))throw this.err(f.p,"CS0102",`The type '${C.name}' already contains a definition for '${f.name}'`,`Biến ${f.name} đã được khai báo trong lớp.`);this.statics.set(f.name,{t:f.t,f})}
      for(const m of C.methods){m.depth=0;m.cls=C.name;this.addFn(this.fns,m)}}
    for(const C of P.classes)for(const m of C.methods)if(m.name==="Main"){if(main)throw this.err(m.p,"CS0017","Program has more than one entry point defined","Chỉ được có một hàm Main.");main=m}
    if(P.top.length){
      if(main)throw this.err(P.top[0].p,"CS8804","Cannot specify a Main method in a program with top-level statements","Chương trình đã có các câu lệnh ở ngoài class (top-level) thì không viết thêm hàm Main nữa.");
      main={name:"Main",ret:"void",ps:[],body:{k:"block",ss:P.top,p:P.top[0].p,top:true},depth:0,top:true,p:P.top[0].p}}
    if(!main)throw this.err(0,"CS5001","Program does not contain a static 'Main' method suitable for an entry point","Chương trình cần hàm static void Main() bên trong class, hoặc viết thẳng các câu lệnh ở ngoài class.");
    if(main.ps.length>1||(main.ps.length===1&&main.ps[0].t!=="string[]"))throw this.err(main.p,"CS5001","Program does not contain a static 'Main' method suitable for an entry point","Hàm Main không có tham số, hoặc có một tham số string[] args.");
    if(!["void","int"].includes(main.ret))throw this.err(main.p,"CS5001","Program does not contain a static 'Main' method suitable for an entry point","Hàm Main phải trả về void hoặc int.");
    this.main=main;
    // biến static: kiểm tra giá trị khởi tạo
    const gScope={vars:new Map(),up:null,fn:{depth:-1,ret:"void",name:"<static>"},fnScope:true};
    for(const C of P.classes)for(const f of C.fields)if(f.init){this.fnCur=gScope.fn;const t=this.expr(f.init,gScope,f.t);this.coerce(f.init,f.t,f.init.p)}
    for(const C of P.classes)for(const m of C.methods)this.fnBody(m,null);
    if(main.top)this.fnBody(main,null);
    if(!this.usings.has("System")&&this.needSystem)throw this.err(this.needSystem.p,"CS0103",`The name '${this.needSystem.name}' does not exist in the current context`,`Thiếu dòng using System; ở đầu chương trình (cần cho ${this.needSystem.name}).`);
    return{main,statics:P.classes.flatMap(C=>C.fields)}}
  addFn(map,m){const L=map.get(m.name)||[];
    for(const o of L)if(o.ps.length===m.ps.length&&o.ps.every((p,i)=>p.t===m.ps[i].t))throw this.err(m.p,"CS0111",`Type already defines a member called '${m.name}' with the same parameter types`,`Hàm ${m.name} với cùng danh sách tham số đã được viết rồi.`);
    L.push(m);map.set(m.name,L)}
  fnBody(m,outer){const fn={depth:m.depth,ret:m.ret,name:m.name,m};const S={vars:new Map(),up:outer,fn,fnScope:true};
    for(const p of m.ps){if(S.vars.has(p.name))throw this.err(p.p,"CS0100",`The parameter name '${p.name}' is a duplicate`,`Hai tham số trùng tên ${p.name}.`);this.checkT(p.t,p.p);S.vars.set(p.name,{t:p.t,kind:"param",depth:m.depth,uses:1,assigned:true})}
    if(m.ret!=="void")this.checkT(m.ret,m.tp||m.p);
    const prev=this.fnCur;this.fnCur=fn;
    const reach=this.block(m.body,S,true);
    if(reach&&m.ret!=="void")throw this.err(m.body.end?m.body.end-1:m.p,"CS0161",`'${m.name}(${m.ps.map(p=>p.t).join(", ")})': not all code paths return a value`,`Hàm ${m.name} khai báo trả về ${m.ret} nhưng có đường chạy tới cuối hàm mà không gặp return. Thêm return … ở cuối (hoặc ở mọi nhánh).`);
    this.fnCur=prev;m.nVars=S.vars.size}
  checkT(t,p){const base=t.replace(/\[\]/g,"");const g=gen(base);
    if(g){const ok={List:1,Dictionary:2,HashSet:1,Stack:1,Queue:1,PriorityQueue:2,Func:-1,KeyValuePair:2,IEnumerable:1,Comparison:1,IList:1,ICollection:1};
      if(!ok[g.n])throw unsup(p,`Kiểu ${g.n}<…>`,"Trình mô phỏng có List, Dictionary, HashSet, Stack, Queue, PriorityQueue, StringBuilder.");
      if(ok[g.n]>0&&g.a.length!==ok[g.n])throw this.err(p,"CS0305",`Using the generic type '${g.n}' requires ${ok[g.n]} type arguments`,`${g.n} cần ${ok[g.n]} kiểu trong cặp < >.`);
      this.usedNs.add("System.Collections.Generic");if(!this.usings.has("System.Collections.Generic")&&!["Func","Comparison"].includes(g.n))throw this.err(p,"CS0246",`The type or namespace name '${g.n}<>' could not be found (are you missing a using directive or an assembly reference?)`,`Thiếu dòng using System.Collections.Generic; ở đầu chương trình (cần cho ${g.n}).`);
      g.a.forEach(x=>this.checkT(x,p));return}
    if(base==="StringBuilder"){if(!this.usings.has("System.Text"))throw this.err(p,"CS0246","The type or namespace name 'StringBuilder' could not be found (are you missing a using directive or an assembly reference?)","Thiếu dòng using System.Text; ở đầu chương trình (cần cho StringBuilder).");return}
    if(SUPPORTED_T.has(base)||base==="var")return;
    if(TYPE_NAMES.has(base))throw this.err(p,"CS0305",`Using the generic type '${base}' requires type arguments`,`${base} cần ghi kiểu phần tử, ví dụ ${base}<int>.`);
    throw this.err(p,"CS0246",`The type or namespace name '${base}' could not be found (are you missing a using directive or an assembly reference?)`,`Không có kiểu dữ liệu tên ${base}. Kiểm tra chính tả (C# phân biệt chữ hoa, chữ thường: int, string, List…).`)}
  /* ---- tên ---- */
  lookup(S,n){let hops=0;for(let s=S;s;s=s.up){if(s.vars.has(n)){const v=s.vars.get(n);return{v,hops:this.fnCur.depth-v.depth}}if(s.fns&&s.fns.has(n))return{fn:s.fns.get(n)}}return null}
  declare(S,n,info,p){for(let s=S;s;s=s.up){if(s.vars.has(n)){if(s===S)throw this.err(p,"CS0128",`A local variable or function named '${n}' is already defined in this scope`,`Biến ${n} đã được khai báo trước đó trong cùng phạm vi. Muốn gán giá trị mới, bỏ tên kiểu ở đầu: ${n} = …;`);
        throw this.err(p,"CS0136",`A local or parameter named '${n}' cannot be declared in this scope because that name is used in an enclosing local scope to define a local or parameter`,`Tên ${n} đã dùng cho một biến ở phạm vi bên ngoài. C# không cho đặt trùng; hãy đổi tên khác.`)}if(s.fnScope)break}
    info.depth=this.fnCur.depth;S.vars.set(n,info);(S.decls||(S.decls=[])).push(n)}
  /* ---- câu lệnh: trả về true nếu chạy tới được cuối ---- */
  block(B,S,isFn){const S2=isFn?S:{vars:new Map(),up:S,fn:S.fn};B.scope=S2;
    // hàm cục bộ: khai báo trước để gọi được từ mọi chỗ trong khối
    const fns=B.ss.filter(s=>s.k==="fn");if(fns.length){S2.fns=new Map();for(const f of fns){if(this.lookup(S2,f.name)&&this.lookup(S2,f.name).v)throw this.err(f.p,"CS0128",`A local variable or function named '${f.name}' is already defined in this scope`,`Tên ${f.name} đã được dùng.`);f.depth=this.fnCur.depth+1;this.addFn(S2.fns,f)}}
    let reach=true;
    for(const s of B.ss){if(!reach&&s.k!=="fn"&&s.k!=="empty"){/* mã không bao giờ chạy tới: C# chỉ cảnh báo */if(!B.warnedUnreach){B.warnedUnreach=true;this.warn(s.p,"CS0162","Unreachable code detected","Câu lệnh này không bao giờ được chạy tới (đứng sau return, break hoặc continue).")}}
      const r=this.stmt(s,S2);if(s.k!=="fn")reach=reach&&r}
    for(const f of fns)this.fnBody(f,S2);
    B.decls=S2.decls||[];
    for(const n of B.decls){const v=S2.vars.get(n);if(v.kind==="local"&&!v.uses){if(v.hasInit){if(v.constInit)this.warn(v.p,"CS0219",`The variable '${n}' is assigned but its value is never used`,`Biến ${n} được gán giá trị nhưng không bao giờ được dùng.`)}else if(!v.assigned)this.warn(v.p,"CS0168",`The variable '${n}' is declared but never used`,`Biến ${n} được khai báo nhưng không dùng tới.`)}}
    return reach}
  warn(p,code,msg,vi){if(!this.warns.some(w=>w.p===p&&w.code===code))this.warns.push({p,code,msg,vi,warn:true})}
  stmt(s,S){
    switch(s.k){
      case "block":return this.block(s,S,false);
      case "empty":return true;
      case "fn":return true;
      case "decl":{
        for(const d of s.ds){let t=s.t;
          if(t!=="var")this.checkT(t,s.p);
          if(d.init){const it=this.expr(d.init,S,t==="var"?null:t);
            if(t==="var"){if(it==="null")throw this.err(d.p,"CS0815","Cannot assign <null> to an implicitly-typed variable","Biến var không gán bằng null được (C# không biết kiểu).");if(it==="void")throw this.err(d.p,"CS0815","Cannot assign void to an implicitly-typed variable","Hàm này không trả về giá trị nên không gán vào biến được.");if(String(it).startsWith("mg:")||it==="lambda")throw this.err(d.p,"CS8917","The delegate type could not be inferred.","Không gán thẳng hàm hay lambda vào var; ghi rõ kiểu Func<…>.");t=it}
            else this.coerce(d.init,t,d.init.p)}
          d.t=t;const info={t,kind:"local",p:d.p,uses:0,hasInit:!!d.init,assigned:!!d.init,isConst:!!s.isConst,constInit:!!d.init&&["num","str","chr","bool","null"].includes(d.init.k)};
          if(s.isConst&&!d.init)throw this.err(d.p,"CS0145","A const field requires a value to be provided","Hằng const phải có giá trị.");
          this.declare(S,d.name,info,d.p);d.info=info}
        s.t=s.ds[0].t;return true}
      case "expr":{const t=this.expr(s.e,S,null);return true}
      case "if":{this.cond(s.c,S);const a=this.stmtIn(s.th,S);const b=s.el?this.stmtIn(s.el,S):true;
        if(s.th.k==="empty"&&s.th.warnEmpty)this.warn(s.th.p,"CS0642","Possible mistaken empty statement","Có dấu ; ngay sau if (...): thân của if là câu lệnh rỗng, khối phía sau luôn chạy.");
        return a||b}
      case "while":{this.cond(s.c,S);this.loops=(this.loops||0)+1;const br0=this.brk;this.brk=false;this.stmtIn(s.body,S);const hasBrk=this.brk;this.brk=br0;this.loops--;
        if(s.body.k==="empty"&&s.body.warnEmpty)this.warn(s.body.p,"CS0642","Possible mistaken empty statement","Có dấu ; ngay sau while (...): vòng lặp có thân rỗng.");
        return !(s.c.k==="bool"&&s.c.v)||hasBrk}
      case "do":{this.loops=(this.loops||0)+1;const br0=this.brk;this.brk=false;this.stmtIn(s.body,S);const hasBrk=this.brk;this.brk=br0;this.loops--;this.cond(s.c,S);return !(s.c.k==="bool"&&s.c.v)||hasBrk}
      case "for":{const S2={vars:new Map(),up:S,fn:S.fn};s.scope=S2;for(const x of s.init)this.stmt(x,S2);if(s.c)this.cond(s.c,S2);for(const e of s.st)this.expr(e,S2,null);
        this.loops=(this.loops||0)+1;const br0=this.brk;this.brk=false;this.stmtIn(s.body,S2);const hasBrk=this.brk;this.brk=br0;this.loops--;s.decls=S2.decls||[];
        for(const n of s.decls){const v=S2.vars.get(n);if(!v.uses)this.warn(v.p,"CS0219",`The variable '${n}' is assigned but its value is never used`,`Biến ${n} không được dùng.`)}
        if(s.body.k==="empty"&&s.body.warnEmpty)this.warn(s.body.p,"CS0642","Possible mistaken empty statement","Có dấu ; ngay sau for (...): vòng lặp có thân rỗng.");
        return !!s.c||hasBrk}
      case "foreach":{const et=this.expr(s.e,S,null);const el=seqElem(et);
        if(!el)throw this.err(s.e.p,"CS1579",`foreach statement cannot operate on variables of type '${showT(et)}' because '${showT(et)}' does not contain a public instance or extension definition for 'GetEnumerator'`,`Không duyệt foreach được trên giá trị kiểu ${et}: chỉ duyệt được mảng, chuỗi, List, Dictionary, HashSet…`);
        if(el.startsWith("("))throw unsup(s.e.p,"Duyệt foreach trên PriorityQueue","Lấy lần lượt bằng Dequeue().");
        let t=s.t;if(t==="var")t=el;else{this.checkT(t,s.p);if(!canExp(el,t))throw this.err(s.p,"CS0030",`Cannot convert type '${el}' to '${t}'`,`Phần tử có kiểu ${el}, không đổi sang ${t} được.`)}
        s.vt=t;s.el=el;const S2={vars:new Map(),up:S,fn:S.fn};s.scope=S2;this.declare(S2,s.name,{t,kind:"local",p:s.np,uses:0,assigned:true,ro:true},s.np);
        this.loops=(this.loops||0)+1;const br0=this.brk;this.stmtIn(s.body,S2);this.brk=br0;this.loops--;s.decls=S2.decls;
        if(!S2.vars.get(s.name).uses)this.warn(s.np,"CS0168",`The variable '${s.name}' is declared but never used`,`Biến ${s.name} không được dùng.`);return true}
      case "ret":{const R=this.fnCur.ret;
        if(this.fnCur.depth<0)throw this.err(s.p,"CS0127","return not allowed here","");
        if(R==="?"){if(!s.e){this.fnCur.inferred="void";return false}this.fnCur.inferred=this.expr(s.e,S,null);return false}
        if(!s.e){if(R!=="void")throw this.err(s.p,"CS0126",`An object of a type convertible to '${R}' is required`,`Hàm trả về ${R}: sau return cần một giá trị.`);return false}
        if(R==="void"){if(this.fnCur.m&&this.fnCur.m.top){this.expr(s.e,S,"int");return false}
          throw this.err(s.p,"CS0127",`Since '${this.fnCur.name}' returns void, a return keyword must not be followed by an object expression`,`Hàm ${this.fnCur.name} khai báo void (không trả về gì) nên chỉ viết return; không kèm giá trị. Muốn trả giá trị, đổi void thành kiểu của giá trị.`)}
        this.expr(s.e,S,R);this.coerce(s.e,R,s.e.p);return false}
      case "break":if(!this.loops&&!this.sw)throw this.err(s.p,"CS0139","No enclosing loop out of which to break or continue","break chỉ dùng bên trong vòng lặp hoặc switch.");this.brk=true;return false;
      case "cont":if(!this.loops)throw this.err(s.p,"CS0139","No enclosing loop out of which to break or continue","continue chỉ dùng bên trong vòng lặp.");return false;
      case "throw":{if(s.e){const t=this.expr(s.e,S,null);if(!/Exception$/.test(t))throw this.err(s.e.p,"CS0155","The type caught or thrown must be derived from System.Exception","Sau throw cần một ngoại lệ, ví dụ throw new Exception(\"…\");")}return false}
      case "switch":{const t=this.expr(s.e,S,null);if(!["int","long","char","string","bool"].includes(t))throw unsup(s.e.p,`switch trên kiểu ${t}`);
        this.sw=(this.sw||0)+1;let anyReach=false,hasDef=false;const seen=new Set();
        const S2={vars:new Map(),up:S,fn:S.fn};s.scope=S2;
        for(const sec of s.secs){for(const L of sec.labels){if(L.def){hasDef=true;continue}const lt=this.expr(L.e,S2,t);this.coerce(L.e,t,L.e.p);
            if(!["num","str","chr","bool"].includes(L.e.k)&&!(L.e.k==="un"))throw unsup(L.e.p,"case với giá trị không phải hằng số");const key=String(L.e.v);if(seen.has(key))throw this.err(L.p,"CS0152",`The switch statement contains multiple cases with the label value`,`Hai case trùng giá trị ${key}.`);seen.add(key)}
          const br0=this.brk;this.brk=false;let r=true;for(const x of sec.ss){if(!r)break;r=this.stmt(x,S2)}
          if(r&&sec.ss.length)throw this.err(sec.labels[0].p,"CS0163",`Control cannot fall through from one case label ('${sec.labels[0].def?"default":"case "+(sec.labels[0].e.raw||sec.labels[0].e.v)+":"}') to another`,"Mỗi nhánh case trong C# phải kết thúc bằng break; (hoặc return). C# không cho chạy tràn sang case kế tiếp.");
          if(this.brk)anyReach=true;this.brk=br0}
        s.decls=S2.decls||[];this.sw--;return anyReach||!hasDef}}
    throw unsup(s.p,"Câu lệnh "+s.k)}
  stmtIn(s,S){if(s.k==="block")return this.block(s,S,false);return this.stmt(s,S)}
  cond(e,S){const t=this.expr(e,S,"bool");if(t!=="bool"){
      if(e.k==="assign"&&e.op==="=")throw this.err(e.op_p,"CS0029",`Cannot implicitly convert type '${showT(t)}' to 'bool'`,"Trong điều kiện, so sánh bằng dùng == (hai dấu bằng); một dấu = là phép gán.");
      throw this.err(e.p,"CS0029",`Cannot implicitly convert type '${showT(t)}' to 'bool'`,`Điều kiện phải là giá trị đúng/sai (bool). C# không tự đổi số sang bool như C++: viết rõ, ví dụ x != 0.`)}}
  /* gắn chuyển kiểu ngầm định khi cần; báo lỗi nếu không chuyển được */
  coerce(e,to,p){const from=e.ty;if(!to||from===to)return;
    if(e.k==="lambda"||String(from).startsWith("mg:"))return;
    if(e.k==="num"&&from==="int"&&to==="char"){}
    if(!canImp(from,to)){
      if(from==="void")throw this.err(p,"CS0029",`Cannot implicitly convert type 'void' to '${to}'`,"Hàm này là void (không trả về giá trị) nên không dùng kết quả của nó được.");
      if(canExp(from,to))throw this.err(p,"CS0266",`Cannot implicitly convert type '${showT(from)}' to '${to}'. An explicit conversion exists (are you missing a cast?)`,`Giá trị kiểu ${from} có thể bị mất thông tin khi đổi sang ${to}, nên C# không tự đổi. Nếu chắc chắn, ép kiểu: (${to})(…).${from==="long"&&to==="int"?" Hoặc khai báo biến là long.":from==="double"&&isIntT(to)?" Phần thập phân sẽ bị bỏ.":""}`);
      throw this.err(p,"CS0029",`Cannot implicitly convert type '${showT(from)}' to '${to}'`,from==="string"&&isNumT(to)?`Chuỗi không tự đổi thành số. Dùng ${to}.Parse(…), ví dụ int.Parse(Console.ReadLine()).`:isNumT(from)&&to==="string"?"Số không tự đổi thành chuỗi. Dùng x.ToString() hoặc chuỗi nội suy $\"{x}\".":`Kiểu ${from} không gán được cho biến kiểu ${to}.`)}
    if(from!==to&&isNumT(from)&&isNumT(to)&&!(from==="char"&&to==="int"))e.cv=to}
  num(e,to){/* ép một nút số sang kiểu to (dùng trong phép toán hai ngôi) */if(e.ty!==to&&!(e.ty==="char"&&to==="int"))e.cv=to}
  lval(e,S){if(e.k==="id"){const r=this.lookup(S,e.name);if(r&&r.v){if(r.v.isConst)throw this.err(e.p,"CS0131","The left-hand side of an assignment must be a variable, property or indexer",`${e.name} là hằng (const), không gán lại được.`);if(r.v.ro)throw this.err(e.p,"CS1656",`Cannot assign to '${e.name}' because it is a 'foreach iteration variable'`,`Biến ${e.name} của vòng foreach chỉ để đọc. Muốn sửa phần tử, dùng vòng for với chỉ số.`)}
      else{const st=this.statics.get(e.name);if(st&&st.f.isConst)throw this.err(e.p,"CS0131","The left-hand side of an assignment must be a variable, property or indexer",`${e.name} là hằng (const), không gán lại được.`)}}
    if(e.k==="member"&&!e.setter)throw this.err(e.p,"CS0200",`Property or indexer '${e.name}' cannot be assigned to -- it is read only`,`${e.name} chỉ để đọc, không gán được.`);
    if(e.k==="index"&&e.o.ty==="string")throw this.err(e.p,"CS0200","Property or indexer 'string.this[int]' cannot be assigned to -- it is read only","Chuỗi (string) trong C# không sửa từng ký tự được. Đổi sang char[] bằng s.ToCharArray(), sửa, rồi new string(mảng); hoặc dùng StringBuilder.")}
  /* ---- biểu thức: trả về kiểu, gắn e.ty ---- */
  expr(e,S,want){const t=this.ex(e,S,want);e.ty=t;if(!e.gc&&e.k!=="lambda"&&kidsGc(e))e.gc=true;return t}
  ex(e,S,want){const self=this;
    switch(e.k){
      case "num":return e.ty;
      case "str":return "string";case "chr":return "char";case "bool":return "bool";case "null":return "null";
      case "istr":for(const x of e.parts)if(x.e){const t=this.expr(x.e,S,null);if(t==="void")throw this.err(x.e.p,"CS0029","Cannot implicitly convert type 'void' to 'object'","Hàm void không có giá trị để in.");if(x.e.gc)e.gc=true}return "string";
      case "default":{if(!e.t){if(!want)throw this.err(e.p,"CS8716","There is no target type for the default literal.","Viết default(kiểu).");e.t=want}return e.t}
      case "id":return this.idT(e,S);
      case "member":return this.memberT(e,S);
      case "call":return this.callT(e,S,want);
      case "index":{const ot=this.expr(e.o,S,null);const it=this.expr(e.i,S,null);if(e.o.gc||e.i.gc)e.gc=true;
        if(isArr(ot)||ot==="string"||ot==="StringBuilder"){if(!isIntT(it)){if(it==="long"){e.i.cv="int";e.longIdx=true}else throw this.err(e.i.p,"CS0029",`Cannot implicitly convert type '${showT(it)}' to 'int'`,"Chỉ số phải là số nguyên.")}else this.num(e.i,"int");e.kind=isArr(ot)?"arr":ot==="string"?"str":"sb";return isArr(ot)?elemOf(ot):"char"}
        const g=gen(ot);
        if(g&&g.n==="List"){if(!isIntT(it))throw this.err(e.i.p,"CS1503",`Argument 1: cannot convert from '${showT(it)}' to 'int'`,"Chỉ số của List phải là số nguyên int.");this.num(e.i,"int");e.kind="list";e.setter=true;return g.a[0]}
        if(g&&(g.n==="Dictionary")){this.coerce(e.i,g.a[0],e.i.p);e.kind="dict";e.setter=true;return g.a[1]}
        throw this.err(e.p,"CS0021",`Cannot apply indexing with [] to an expression of type '${showT(ot)}'`,`Giá trị kiểu ${ot} không dùng [ ] được.${g&&["Stack","Queue","HashSet"].includes(g.n)?` ${g.n} không truy cập theo chỉ số.`:""}`)}
      case "new":return this.newT(e,S,want);
      case "newarr":{let el=e.el;
        if(e.size){const st=this.expr(e.size,S,"int");if(!isIntT(st))throw this.err(e.size.p,"CS0029",`Cannot implicitly convert type '${showT(st)}' to 'int'`,"Kích thước mảng phải là số nguyên.");this.num(e.size,st==="long"?"long":"int");if(e.size.gc)e.gc=true}
        if(!el){if(!e.init||!e.init.length)throw this.err(e.p,"CS0826","No best type found for implicitly-typed array","new[] cần ít nhất một phần tử để biết kiểu.");let t=null;for(const x of e.init){const xt=this.expr(x,S,null);t=t===null?xt:canImp(t,xt)?xt:canImp(xt,t)?t:(()=>{throw this.err(x.p,"CS0826","No best type found for implicitly-typed array","Các phần tử trong new[] { … } phải cùng kiểu.")})()}el=t;e.el=el}
        this.checkT(el,e.p);
        if(e.init){for(const x of e.init){if(x.k==="newarr"&&!x.el)x.el=isArr(el)?elemOf(el):el;this.expr(x,S,el);this.coerce(x,el,x.p);if(x.gc)e.gc=true}
          if(e.size&&e.size.k==="num"&&Number(e.size.v)!==e.init.length)throw this.err(e.p,"CS0847",`An array initializer of length '${e.size.v}' is expected`,`Mảng khai báo ${e.size.v} phần tử nhưng danh sách khởi tạo có ${e.init.length} phần tử.`)}
        return el+"[]"}
      case "un":{const t=this.expr(e.x,S,null);if(e.x.gc)e.gc=true;
        if(e.op==="!"){if(t!=="bool")throw this.err(e.p,"CS0023",`Operator '!' cannot be applied to operand of type '${showT(t)}'`,"Toán tử ! (phủ định) chỉ dùng cho giá trị bool.");return "bool"}
        if(!isNumT(t))throw this.err(e.p,"CS0023",`Operator '${e.op}' cannot be applied to operand of type '${showT(t)}'`,`Toán tử ${e.op} chỉ dùng cho số.`);
        if(e.op==="~"&&t==="double")throw this.err(e.p,"CS0023","Operator '~' cannot be applied to operand of type 'double'","~ chỉ dùng cho số nguyên.");
        const r=t==="char"?"int":t;this.num(e.x,r);return r}
      case "pre":case "post":{const t=this.expr(e.x,S,null);if(e.x.gc)e.gc=true;this.lval(e.x,S);this.markAssign(e.x,S,true);if(!isNumT(t))throw this.err(e.p,"CS0023",`Operator '${e.op}' cannot be applied to operand of type '${showT(t)}'`,`Toán tử ${e.op} chỉ dùng cho biến số.`);return t}
      case "bin":return this.binT(e,S);
      case "assign":return this.assignT(e,S);
      case "cond":{this.cond(e.c,S);const a=this.expr(e.a,S,want),b=this.expr(e.b,S,want);if(e.c.gc||e.a.gc||e.b.gc)e.gc=true;let t;
        if(a===b)t=a;else if(canImp(a,b))t=b;else if(canImp(b,a))t=a;else if(isNumT(a)&&isNumT(b))t=promo(a,b);
        else throw this.err(e.p,"CS0173",`Type of conditional expression cannot be determined because there is no implicit conversion between '${showT(a)}' and '${showT(b)}'`,`Hai nhánh của ? : phải cùng kiểu (đang là ${a} và ${b}).`);
        if(t==="null")t=want||"object";this.coerce(e.a,t,e.a.p);this.coerce(e.b,t,e.b.p);return t}
      case "cast":{const t=this.expr(e.x,S,null);if(e.x.gc)e.gc=true;this.checkT(e.t,e.p);
        if(t===e.t)return t;
        if(!canExp(t,e.t))throw this.err(e.p,"CS0030",`Cannot convert type '${showT(t)}' to '${e.t}'`,t==="string"?`Chuỗi không ép thẳng sang ${e.t} được. Dùng ${e.t}.Parse(chuỗi).`:isNumT(t)&&e.t==="string"?"Đổi số thành chuỗi bằng x.ToString().":`Không đổi kiểu ${t} sang ${e.t} được.`);
        return e.t}
      case "lambda":{const fp=want&&this.funcParts(want);if(!fp)throw this.err(e.p,"CS1660",`Cannot convert lambda expression to type '${showT(want||"object")}' because it is not a delegate type`,"Biểu thức lambda (x => …) chỉ dùng làm đối số cho các hàm như Sort, Select, Where… hoặc gán cho biến kiểu Func<…>.");
        return this.lamT(e,S,fp.ps,fp.ret)}
      case "tuple":throw unsup(e.p,"Bộ giá trị (tuple) (a, b)","Trình mô phỏng chỉ hỗ trợ tuple trong phép đổi chỗ (a, b) = (b, a). Dùng mảng hoặc hai biến riêng.");
      case "tswap":{e.ts.forEach((T,i)=>{const tt=this.expr(T,S,null);this.lval(T,S);const v=e.vs[i];this.expr(v,S,tt);this.coerce(v,tt,v.p);this.markAssign(T,S,false)});
        if(e.ts.some(x=>x.gc)||e.vs.some(x=>x.gc))e.gc=true;return "void"}
      case "out":throw this.err(e.p,"CS1615","Argument may not be passed with the 'out' keyword","Hàm này không có tham số out.")}
    throw unsup(e.p,"Biểu thức "+e.k)}
  funcParts(t){const g=gen(t);if(!g)return null;if(g.n==="Func")return{ps:g.a.slice(0,-1),ret:g.a[g.a.length-1]};if(g.n==="Comparison")return{ps:[g.a[0],g.a[0]],ret:"int"};if(g.n==="Action")return{ps:g.a,ret:"void"};return null}
  /* kiểu của lambda khi biết kiểu tham số; ret: kiểu trả về mong muốn hoặc null (tự suy) */
  lamT(e,S,pts,ret){if(e.ps.length!==pts.length)throw this.err(e.p,"CS1593",`Delegate does not take ${e.ps.length} arguments`,`Lambda này cần ${pts.length} tham số.`);
    const fn={depth:this.fnCur.depth+1,ret:ret||"?",name:"lambda",lam:true};const S2={vars:new Map(),up:S,fn,fnScope:true};
    const prev=this.fnCur;this.fnCur=fn;e.depth=fn.depth;
    e.ps.forEach((p,i)=>{if(p.t&&p.t!==pts[i])throw this.err(e.p,"CS1661","Cannot convert lambda expression: parameter types do not match","Kiểu tham số của lambda không khớp.");S2.vars.set(p.name,{t:pts[i],kind:"param",depth:fn.depth,uses:1,assigned:true})});
    let rt;if(e.expr){rt=this.expr(e.expr,S2,ret&&ret!=="?"?ret:null);if(ret&&ret!=="?"&&ret!=="void")this.coerce(e.expr,ret,e.expr.p)}
    else{fn.ret=ret&&ret!=="?"?ret:"?";this.block(e.body,S2,true);rt=fn.ret==="?"?(fn.inferred||"void"):fn.ret}
    this.fnCur=prev;e.pts=pts;e.rt=ret&&ret!=="?"?ret:rt;e.ty="lambda";return e.rt}
  idT(e,S){const n=e.name;
    if(e.tyname)return "type:"+n;
    const r=this.lookup(S,n);
    if(r&&r.v){r.v.uses++;e.bind={kind:"local",hops:r.hops};
      if(!r.v.assigned&&!this.assigning){throw this.err(e.p,"CS0165",`Use of unassigned local variable '${n}'`,`Biến ${n} chưa được gán giá trị trước khi dùng. Khởi tạo khi khai báo, ví dụ: ${r.v.t} ${n} = 0;`)}
      return r.v.t}
    if(r&&r.fn){e.bind={kind:"fn",fns:r.fn};return "mg:"+n}
    const st=this.statics.get(n);if(st){e.bind={kind:"static"};return st.t}
    const fs=this.fns.get(n);if(fs){e.bind={kind:"fn",fns:fs};return "mg:"+n}
    if(STATIC_CLS.has(n)||n==="int"||n==="long"||n==="double"||n==="string"||n==="char"||n==="bool"){if(["Console","Math","Array","Convert","String","Char","Int32","Int64","Double","Environment"].includes(n)&&!e.qual&&!this.usings.has("System")&&!this.needSystem)this.needSystem=e;
      if(n==="Enumerable"&&!this.usings.has("System.Linq"))throw this.err(e.p,"CS0103","The name 'Enumerable' does not exist in the current context","Thiếu dòng using System.Linq; ở đầu chương trình.");
      return "type:"+({String:"string",Int32:"int",Int64:"long",Double:"double",Char:"char"}[n]||n)}
    if(TYPE_NAMES.has(n)||n==="StringBuilder")throw this.err(e.p,"CS0119",`'${n}' is a type, which is not valid in the given context`,`${n} là tên kiểu, không phải biến. Muốn tạo mới, viết new ${n}<…>().`);
    const CPP={cout:"Console.WriteLine(…)",cin:"Console.ReadLine()",endl:"Console.WriteLine()",printf:"Console.WriteLine(…)",print:"Console.WriteLine(…)",input:"Console.ReadLine()",len:"a.Length (mảng, chuỗi) hoặc a.Count (List)",True:"true",False:"false",None:"null",vector:"List<int>",nullptr:"null",NULL:"null",println:"Console.WriteLine",size:"a.Length / a.Count"};
    const near=[...this.allNames(S)].filter(x=>x.toLowerCase()===n.toLowerCase()&&x!==n);
    throw this.err(e.p,"CS0103",`The name '${n}' does not exist in the current context`,CPP[n]?`C# không có ${n}. Dùng ${CPP[n]}.`:near.length?`Không có tên ${n}. Có phải bạn muốn viết ${near[0]}? (C# phân biệt chữ hoa, chữ thường.)`:`Tên ${n} chưa được khai báo: biến phải khai báo kèm kiểu trước khi dùng (ví dụ int ${n} = 0;), hoặc kiểm tra lại chính tả.`)}
  allNames(S){const out=new Set();for(let s=S;s;s=s.up){s.vars.forEach((v,k)=>out.add(k));if(s.fns)s.fns.forEach((v,k)=>out.add(k))}this.statics.forEach((v,k)=>out.add(k));this.fns.forEach((v,k)=>out.add(k));["Console","Math","Array"].forEach(x=>out.add(x));return out}
  markAssign(t,S,read){if(t.k==="id"){const r=this.lookup(S,t.name);if(r&&r.v){r.v.assigned=true;if(!read)r.v.uses=r.v.uses}}}
  assignT(e,S){const T=e.t;
    if(T.k==="id"){const r=this.lookup(S,T.name);if(r&&r.v&&!r.v.assigned&&e.op==="="){r.v.assigned=true;this.assigning=true;try{this.expr(T,S,null)}finally{this.assigning=false}r.v.uses--}else this.expr(T,S,null)}
    else this.expr(T,S,null);
    const tt=T.ty;this.lval(T,S);
    if(e.op==="="){const vt=this.expr(e.v,S,tt);this.coerce(e.v,tt,e.v.p);if(T.gc||e.v.gc)e.gc=true;this.markAssign(T,S,false);return tt}
    const vt=this.expr(e.v,S,tt);if(T.gc||e.v.gc)e.gc=true;
    const op=e.op.slice(0,-1);
    if(op==="??")throw unsup(e.op_p,"Toán tử ??=");
    if(tt==="string"&&op==="+"){e.opT="string";return tt}
    if(tt==="bool"&&["&","|","^"].includes(op)){if(vt!=="bool")throw this.err(e.op_p,"CS0019",`Operator '${e.op}' cannot be applied to operands of type 'bool' and '${showT(vt)}'`,"");e.opT="bool";return tt}
    if(!isNumT(tt)||!isNumT(vt))throw this.err(e.op_p,"CS0019",`Operator '${e.op}' cannot be applied to operands of type '${showT(tt)}' and '${showT(vt)}'`,`Phép ${e.op} cần hai vế là số.`);
    if((op==="<<"||op===">>")){if(!isIntT(tt)||!isIntT(vt))throw this.err(e.op_p,"CS0019",`Operator '${e.op}' cannot be applied to operands of type '${tt}' and '${vt}'`,"Phép dịch bit chỉ dùng cho số nguyên.");e.opT=tt==="long"?"long":"int";this.num(e.v,"int");return tt}
    const r=promo(tt,vt);
    if(!canImp(vt,tt)&&!(tt==="char"&&vt==="int"&&e.v.k==="num"))throw this.err(e.op_p,"CS0266",`Cannot implicitly convert type '${vt}' to '${tt}'. An explicit conversion exists (are you missing a cast?)`,`Biến ${tt} cộng/trừ… với giá trị ${vt} cho kết quả ${r}, không tự đổi về ${tt}. Khai báo biến kiểu ${r}, hoặc ép kiểu vế phải.`);
    if(["&","|","^","%"].includes(op)&&op!=="%"&&!isIntT(tt))throw this.err(e.op_p,"CS0019",`Operator '${e.op}' cannot be applied to operands of type '${tt}' and '${vt}'`,"");
    e.opT=r;this.num(e.v,r);return tt}
  binT(e,S){const op=e.op;
    if(op==="&&"||op==="||"){this.cond(e.a,S);this.cond(e.b,S);if(e.a.gc||e.b.gc)e.gc=true;return "bool"}
    const a=this.expr(e.a,S,null),b=this.expr(e.b,S,null);if(e.a.gc||e.b.gc)e.gc=true;
    const bad=()=>this.err(e.op_p,"CS0019",`Operator '${op}' cannot be applied to operands of type '${showT(a)}' and '${showT(b)}'`,
      (a==="string"||b==="string")&&op!=="+"&&op!=="=="&&op!=="!="?`Chuỗi không dùng phép ${op} được.${op==="<"||op===">"?" So sánh chuỗi dùng string.Compare(a, b) hoặc a.CompareTo(b).":" Nếu chuỗi là số đọc vào, đổi bằng int.Parse(…)."}`:`Phép ${op} không dùng được giữa ${a} và ${b}.`);
    if(op==="??"){if(!isRefT(a))throw bad();return a}
    if(op==="+"&&(a==="string"||b==="string")){if(a==="void"||b==="void")throw bad();e.opT="string";return "string"}
    if(op==="=="||op==="!="){
      if(isNumT(a)&&isNumT(b)){const r=promo(a,b);e.opT=r;this.num(e.a,r);this.num(e.b,r);return "bool"}
      if(a==="bool"&&b==="bool"){e.opT="bool";return "bool"}
      if(a==="string"&&b==="string"||(a==="string"&&b==="null")||(a==="null"&&b==="string")){e.opT="string";return "bool"}
      if((isRefT(a)||a==="null")&&(isRefT(b)||b==="null")&&(a===b||a==="null"||b==="null")){e.opT="ref";return "bool"}
      throw bad()}
    if(["<",">","<=",">="].includes(op)){if(!isNumT(a)||!isNumT(b))throw bad();const r=promo(a,b);e.opT=r;this.num(e.a,r);this.num(e.b,r);return "bool"}
    if(op==="&"||op==="|"||op==="^"){if(a==="bool"&&b==="bool"){e.opT="bool";return "bool"}if(!isIntT(a)||!isIntT(b))throw bad();const r=promo(a,b);e.opT=r;this.num(e.a,r);this.num(e.b,r);return r}
    if(op==="<<"||op===">>"){if(!isIntT(a)||!isIntT(b)||b==="long")throw bad();const r=a==="long"?"long":"int";e.opT=r;this.num(e.a,r);this.num(e.b,"int");return r}
    if(!isNumT(a)||!isNumT(b))throw bad();
    const r=promo(a,b);e.opT=r;this.num(e.a,r);this.num(e.b,r);
    if(op==="/"&&r!=="double"&&e.b.k==="num"&&Number(e.b.v)===0)throw this.err(e.b.p,"CS0020","Division by constant zero","Chia cho hằng số 0.");
    return r}
  /* ---- thư viện ---- */
  needLinq(p,name,t){if(!this.usings.has("System.Linq"))throw this.err(p,"CS1061",`'${showT(t)}' does not contain a definition for '${name}' and no accessible extension method '${name}' accepting a first argument of type '${showT(t)}' could be found (are you missing a using directive or an assembly reference?)`,`Hàm ${name} thuộc LINQ: thêm dòng using System.Linq; ở đầu chương trình.`)}
  noMember(p,t,name,hint){return this.err(p,"CS1061",`'${showT(t)}' does not contain a definition for '${name}' and no accessible extension method '${name}' accepting a first argument of type '${showT(t)}' could be found (are you missing a using directive or an assembly reference?)`,hint||`Kiểu ${t} không có ${name}. Kiểm tra chính tả (C# phân biệt chữ hoa, chữ thường).`)}
  memberT(e,S){const ot=this.expr(e.o,S,null);if(e.o.gc)e.gc=true;const n=e.name;
    if(String(ot).startsWith("type:")){const c=ot.slice(5);e.static=c;
      const F={"Math.PI":"double","Math.E":"double","int.MaxValue":"int","int.MinValue":"int","long.MaxValue":"long","long.MinValue":"long","double.MaxValue":"double","double.MinValue":"double","double.PositiveInfinity":"double","double.NegativeInfinity":"double","double.NaN":"double","double.Epsilon":"double","char.MaxValue":"char","char.MinValue":"char","string.Empty":"string","StringSplitOptions.RemoveEmptyEntries":"StringSplitOptions","StringSplitOptions.None":"StringSplitOptions","StringSplitOptions.TrimEntries":"StringSplitOptions"};
      const key=c+"."+n;if(F[key]){e.lib="sf:"+key;return F[key]}
      if(c==="Console"&&(n==="Out"||n==="In"||n==="Error"))throw unsup(e.np,"Console."+n,"Dùng Console.WriteLine / Console.ReadLine.");
      return "mgs:"+key}
    if(String(ot).startsWith("mg"))throw this.err(e.np,"CS0119","Method group used like a value",`Thiếu cặp ngoặc ( ) khi gọi hàm.`);
    const g=gen(ot);
    if(n==="Length"){if(ot==="string"||isArr(ot)||ot==="StringBuilder"){e.lib="len";return "int"}
      if(g&&["List","HashSet","Dictionary","Stack","Queue","PriorityQueue"].includes(g.n))throw this.noMember(e.np,ot,n,`${g.n} dùng .Count để lấy số phần tử, không phải .Length.`)}
    if(n==="Count"&&g&&["List","HashSet","Dictionary","Stack","Queue","PriorityQueue","KeyColl"].includes(g.n)){e.lib="count";return "int"}
    if(n==="Count"&&(isArr(ot)||ot==="string")&&!this.inCall)throw this.err(e.np,"CS0428","Cannot convert method group 'Count' to non-delegate type 'int'. Did you intend to invoke the method?",`Mảng và chuỗi dùng .Length để lấy độ dài.`);
    if(g&&g.n==="Dictionary"&&(n==="Keys"||n==="Values")){e.lib=n==="Keys"?"keys":"vals";return `KeyColl<${n==="Keys"?g.a[0]:g.a[1]}>`}
    if(g&&g.n==="KeyValuePair"&&(n==="Key"||n==="Value")){e.lib=n==="Key"?"kvk":"kvv";return g.a[n==="Key"?0:1]}
    if(this.inCall)return "mgi:"+n;
    throw this.noMember(e.np,ot,n,isArr(ot)&&n==="Count"?"Mảng dùng .Length.":g&&g.n==="List"&&n==="Length"?"List dùng .Count.":undefined)}
  /* đối số là lambda hoặc tên hàm: suy ra kiểu trả về khi biết kiểu tham số */
  fnArg(a,S,pts,ret,what){
    if(a.k==="lambda"){a.ty="lambda";const r=this.lamT(a,S,pts,ret);return r}
    const t=this.expr(a,S,null);
    if(String(t).startsWith("mgs:")){const k=t.slice(4);const M={"int.Parse":["string","int"],"long.Parse":["string","long"],"double.Parse":["string","double"],"char.IsDigit":["char","bool"],"char.IsLetter":["char","bool"],"char.IsUpper":["char","bool"],"char.IsLower":["char","bool"],"char.ToUpper":["char","char"],"char.ToLower":["char","char"],"char.IsWhiteSpace":["char","bool"],"char.IsLetterOrDigit":["char","bool"],"Math.Abs":[pts[0],pts[0]],"Convert.ToInt32":[pts[0],"int"],"Convert.ToInt64":[pts[0],"long"],"Convert.ToDouble":[pts[0],"double"],"char.GetNumericValue":["char","double"]};
      if(!M[k]||pts.length!==1||(M[k][0]!==pts[0]&&!canImp(pts[0],M[k][0])))throw this.err(a.p,"CS1503",`Argument: cannot convert from 'method group' to the expected delegate`,`Hàm ${k} không dùng được ở đây.`);a.mgs=k;a.ty="mgs";return M[k][1]}
    if(String(t).startsWith("mg:")){const fns=a.bind.fns.filter(f=>f.ps.length===pts.length&&f.ps.every((p,i)=>canImp(pts[i],p.t)));if(!fns.length)throw this.err(a.p,"CS1503","Argument: cannot convert from 'method group'",`Hàm ${t.slice(3)} không nhận đúng ${pts.length} tham số kiểu ${pts.join(", ")}.`);
      a.mgFn=fns[0];a.ty="mgfn";a.hops=fns[0].local?this.fnCur.depth-(fns[0].depth-1):0;a.gc=true;return fns[0].ret}
    const fp=this.funcParts(t);if(fp){a.fvar=true;return fp.ret}
    throw this.err(a.p,"CS1503",`Argument: cannot convert from '${showT(t)}' to a delegate`,`Ở đây cần một hàm, ví dụ x => x * 2${what?" ("+what+")":""}.`)}
  argc(e,n,lo,hi){hi=hi===undefined?lo:hi;if(n<lo||n>hi){const nm=e.f.k==="member"?e.f.name:e.f.name;throw this.err(e.f.np||e.f.p,"CS1501",`No overload for method '${nm}' takes ${n} arguments`,`Hàm ${nm} không nhận ${n} đối số (cần ${lo===hi?lo:lo+"–"+hi}).`)}}
  /* đối số thường: gõ kiểu và ép về kiểu cần */
  argT(a,S,to){if(a.k==="out")throw this.err(a.p,"CS1620","Argument must be passed without the 'out' keyword","Đối số này không có out.");const t=this.expr(a,S,to);if(to)this.coerce(a,to,a.p);return t}
  outArg(a,S,t){if(a.k!=="out")throw this.err(a.p,"CS1620","Argument must be passed with the 'out' keyword",`Đối số này cần viết: out ${t} tên_biến.`);
    if(a.t){const tt=a.t==="var"?t:a.t;if(tt!==t)throw this.err(a.p,"CS1503",`Argument: cannot convert from 'out ${a.t}' to 'out ${t}'`,`Biến out phải có kiểu ${t}.`);const info={t,kind:"local",p:a.np,uses:0,assigned:true};this.declare(S,a.name,info,a.np);a.bind={kind:"local",hops:0}}
    else{const r=this.lookup(S,a.name);if(!r||!r.v)throw this.err(a.np,"CS0103",`The name '${a.name}' does not exist in the current context`,`Biến ${a.name} chưa khai báo. Có thể viết out ${t} ${a.name} để khai báo luôn.`);if(r.v.t!==t)throw this.err(a.p,"CS1503",`Argument: cannot convert from 'out ${r.v.t}' to 'out ${t}'`,`Biến out phải có kiểu ${t}.`);r.v.assigned=true;a.bind={kind:"local",hops:r.hops}}
    a.ty=t}
  callT(e,S,want){const f=e.f;e.gc=e.a.some(x=>x.gc);
    if(f.k==="id"){const r=this.lookup(S,f.name);
      if(r&&r.v){const fp=this.funcParts(r.v.t);if(!fp)throw this.err(f.p,"CS0149","Method name expected",`${f.name} là biến, không phải hàm.`);r.v.uses++;f.bind={kind:"local",hops:r.hops};
        this.argc(e,e.a.length,fp.ps.length);e.a.forEach((x,i)=>this.argT(x,S,fp.ps[i]));e.callVar=true;e.gc=true;return fp.ret}
      let fns=r&&r.fn?r.fn:this.fns.get(f.name);
      if(!fns){if(this.statics.has(f.name))throw this.err(f.p,"CS0149","Method name expected",`${f.name} là biến, không phải hàm.`);this.idT(f,S)}
      const ats=e.a.map(x=>x.k==="lambda"||x.k==="out"?null:this.expr(x,S,null));
      const cand=fns.filter(m=>{const req=m.ps.filter(p=>!p.def).length;return e.a.length>=req&&e.a.length<=m.ps.length});
      if(!cand.length){const m=fns[0];throw this.err(f.p,"CS7036",`There is no argument given that corresponds to the required parameter of '${f.name}(${m.ps.map(p=>p.t).join(", ")})'`,`Hàm ${f.name} cần ${m.ps.length} đối số (${m.ps.map(p=>p.t+" "+p.name).join(", ")}) nhưng được gọi với ${e.a.length}.`)}
      let pick=cand.filter(m=>e.a.every((x,i)=>ats[i]===null||ats[i]===m.ps[i].t));if(!pick.length)pick=cand.filter(m=>e.a.every((x,i)=>ats[i]===null||canImp(ats[i],m.ps[i].t)));
      if(!pick.length){const m=cand[0];const i=e.a.findIndex((x,i)=>ats[i]!==null&&!canImp(ats[i],m.ps[i].t));const x=e.a[i];
        throw this.err(x.p,"CS1503",`Argument ${i+1}: cannot convert from '${showT(ats[i])}' to '${m.ps[i].t}'`,`Tham số thứ ${i+1} của ${f.name} có kiểu ${m.ps[i].t}, nhưng đối số có kiểu ${ats[i]}.${canExp(ats[i],m.ps[i].t)?` Ép kiểu: (${m.ps[i].t})(…).`:""}`)}
      const m=pick[0];e.fn=m;e.a.forEach((x,i)=>{if(ats[i]===null)this.fnArg(x,S,(this.funcParts(m.ps[i].t)||{ps:[]}).ps,(this.funcParts(m.ps[i].t)||{}).ret);else this.coerce(x,m.ps[i].t,x.p)});
      e.defs=m.ps.slice(e.a.length).map(p=>p.def);for(const d of e.defs){this.expr(d,S,null)}
      e.hops=m.local?this.fnCur.depth-(m.depth-1):0;e.gc=true;
      if(this.fnCur.m===m)this.fnCur.recursive=true;
      return m.ret}
    if(f.k!=="member")throw this.err(f.p,"CS0149","Method name expected","Chỉ gọi được hàm (tên hàm theo sau là ( … )).");
    this.inCall=true;let ot;try{ot=this.expr(f.o,S,null)}finally{this.inCall=false}if(f.o.gc)e.gc=true;
    if(String(ot).startsWith("type:"))return this.staticCall(e,S,ot.slice(5),f.name,want);
    if(String(ot).startsWith("mg"))throw this.err(f.p,"CS0119","Method group used like a value","Thiếu cặp ngoặc ( ) khi gọi hàm trước dấu chấm.");
    if(ot==="void")throw this.err(f.np,"CS0023",`Operator '.' cannot be applied to operand of type 'void'`,"Hàm phía trước dấu chấm không trả về giá trị.");
    if(ot==="null")throw this.err(f.p,"CS0023","Operator '.' cannot be applied to operand of type '<null>'","");
    return this.instCall(e,S,ot,f.name,want)}
  staticCall(e,S,c,n,want){const A=e.a,k=c+"."+n;const T=x=>this.argT(x,S,null);const self=this;e.lib=k;
    const num1=()=>{this.argc(e,A.length,1);const t=T(A[0]);if(!isNumT(t))throw this.err(A[0].p,"CS1503",`Argument 1: cannot convert from '${showT(t)}' to 'double'`,`${k} cần một số.`);return t};
    switch(k){
      case "Console.ReadLine":this.argc(e,A.length,0);e.gc=true;return "string";
      case "Console.WriteLine":case "Console.Write":{if(!A.length){if(n==="Write")this.argc(e,0,1);return "void"}
        const t=T(A[0]);if(t==="void")throw this.err(A[0].p,"CS1503","Argument 1: cannot convert from 'void' to 'bool'","Hàm này không trả về giá trị nên không in được.");
        if(A.length>1){if(t!=="string")this.argc(e,A.length,1);A.slice(1).forEach(x=>T(x));e.lib=k+"F"}return "void"}
      case "Console.Read":throw unsup(e.p,"Console.Read()","Dùng Console.ReadLine().");
      case "Math.Max":case "Math.Min":{this.argc(e,A.length,2);const a=T(A[0]),b=T(A[1]);if(!isNumT(a)||!isNumT(b))throw this.err(e.p,"CS1503",`Argument: cannot convert to numeric type`,`${k} cần hai số.`);const r=promo(a,b);this.num(A[0],r);this.num(A[1],r);e.rt=r;return r}
      case "Math.Abs":{const t=num1();const r=t==="char"?"int":t;this.num(A[0],r);e.rt=r;return r}
      case "Math.Sign":{const t=num1();this.num(A[0],t==="char"?"int":t);e.at=t==="char"?"int":t;return "int"}
      case "Math.Sqrt":case "Math.Floor":case "Math.Ceiling":case "Math.Log10":case "Math.Log2":case "Math.Exp":case "Math.Sin":case "Math.Cos":case "Math.Tan":case "Math.Atan":case "Math.Asin":case "Math.Acos":case "Math.Truncate":case "Math.Cbrt":{num1();this.num(A[0],"double");return "double"}
      case "Math.Log":{this.argc(e,A.length,1,2);A.forEach(x=>{T(x);this.num(x,"double")});return "double"}
      case "Math.Pow":case "Math.Atan2":{this.argc(e,A.length,2);A.forEach(x=>{const t=T(x);if(!isNumT(t))throw this.err(x.p,"CS1503",`Argument: cannot convert from '${showT(t)}' to 'double'`,"Cần số.");this.num(x,"double")});return "double"}
      case "Math.Round":{this.argc(e,A.length,1,2);const t=T(A[0]);if(!isNumT(t))throw this.err(A[0].p,"CS1503","","Cần số.");this.num(A[0],"double");if(A[1]){const t2=T(A[1]);if(t2!=="int")throw this.err(A[1].p,"CS1503","Argument 2: cannot convert to 'int'","Số chữ số thập phân là int.")}return "double"}
      case "Math.Clamp":{this.argc(e,A.length,3);const ts=A.map(T);let r=ts.reduce((x,y)=>promo(x,y));A.forEach(x=>this.num(x,r));e.rt=r;return r}
      case "int.Parse":case "long.Parse":case "double.Parse":{this.argc(e,A.length,1);const t=T(A[0]);if(t!=="string"&&t!=="null")throw this.err(A[0].p,"CS1503",`Argument 1: cannot convert from '${showT(t)}' to 'string'`,`${k} nhận một chuỗi. Muốn đổi kiểu số, dùng ép kiểu (${c})x.`);return c}
      case "int.TryParse":case "long.TryParse":case "double.TryParse":{this.argc(e,A.length,2);this.argT(A[0],S,"string");this.outArg(A[1],S,c);return "bool"}
      case "double.IsNaN":case "double.IsInfinity":{num1();this.num(A[0],"double");return "bool"}
      case "char.IsDigit":case "char.IsLetter":case "char.IsLetterOrDigit":case "char.IsUpper":case "char.IsLower":case "char.IsWhiteSpace":case "char.IsPunctuation":{this.argc(e,A.length,1);this.argT(A[0],S,"char");return "bool"}
      case "char.ToUpper":case "char.ToLower":{this.argc(e,A.length,1);this.argT(A[0],S,"char");return "char"}
      case "char.GetNumericValue":{this.argc(e,A.length,1);this.argT(A[0],S,"char");return "double"}
      case "string.Join":{if(A.length<2)this.argc(e,A.length,2);const st=T(A[0]);if(st!=="string"&&st!=="char")throw this.err(A[0].p,"CS1503","Argument 1: cannot convert to 'string'","Đối số đầu của string.Join là chuỗi ngăn cách, ví dụ \" \".");
        if(A.length===2){const t=T(A[1]);const el=seqElem(t);if(el&&t!=="string"){e.jt=el;return "string"}e.jt=t;e.lib="string.JoinArgs";e.jts=[t];return "string"}
        e.lib="string.JoinArgs";e.jts=A.slice(1).map(T);return "string"}
      case "string.IsNullOrEmpty":case "string.IsNullOrWhiteSpace":{this.argc(e,A.length,1);this.argT(A[0],S,"string");return "bool"}
      case "string.Concat":{e.jts=A.map(T);return "string"}
      case "string.Compare":case "string.CompareOrdinal":{this.argc(e,A.length,2);this.argT(A[0],S,"string");this.argT(A[1],S,"string");return "int"}
      case "string.Format":{if(!A.length)this.argc(e,0,1);this.argT(A[0],S,"string");e.jts=A.slice(1).map(T);return "string"}
      case "Array.Sort":{this.argc(e,A.length,1,3);const t=T(A[0]);if(!isArr(t))throw this.err(A[0].p,"CS1503",`Argument 1: cannot convert from '${showT(t)}' to 'System.Array'`,"Array.Sort nhận một mảng. List thì dùng a.Sort().");const el=elemOf(t);e.el=el;
        if(A.length===2){const r=this.fnArg(A[1],S,[el,el],"int","hàm so sánh");if(r!=="int")throw this.err(A[1].p,"CS1662","Cannot convert lambda expression to intended delegate type because some of the return types in the block are not implicitly convertible to the delegate return type","Hàm so sánh phải trả về số int: âm nếu x đứng trước, dương nếu y đứng trước, 0 nếu bằng nhau.");e.cmp=true}
        if(A.length===3){this.argT(A[1],S,"int");this.argT(A[2],S,"int");e.range=true}
        if(!e.cmp&&!this.comparable(el))throw this.err(e.p,"CS0311",`The type '${el}' cannot be used`,`Mảng phần tử ${el} cần hàm so sánh khi sắp xếp.`);return "void"}
      case "Array.Reverse":{this.argc(e,A.length,1,3);const t=T(A[0]);if(!isArr(t))throw this.err(A[0].p,"CS1503","Argument 1: cannot convert to 'System.Array'","Array.Reverse nhận một mảng.");if(A.length===3){this.argT(A[1],S,"int");this.argT(A[2],S,"int");e.range=true}return "void"}
      case "Array.Fill":{this.argc(e,A.length,2);const t=T(A[0]);if(!isArr(t))throw this.err(A[0].p,"CS1503","","Array.Fill nhận một mảng.");this.argT(A[1],S,elemOf(t));return "void"}
      case "Array.IndexOf":case "Array.LastIndexOf":{this.argc(e,A.length,2);const t=T(A[0]);if(!isArr(t))throw this.err(A[0].p,"CS1503","","Cần một mảng.");this.argT(A[1],S,elemOf(t));return "int"}
      case "Array.BinarySearch":{this.argc(e,A.length,2);const t=T(A[0]);if(!isArr(t))throw this.err(A[0].p,"CS1503","","Cần một mảng.");this.argT(A[1],S,elemOf(t));return "int"}
      case "Array.Exists":case "Array.TrueForAll":{this.argc(e,A.length,2);const t=T(A[0]);if(!isArr(t))throw this.err(A[0].p,"CS1503","","Cần một mảng.");this.fnArg(A[1],S,[elemOf(t)],"bool");return "bool"}
      case "Array.ConvertAll":{this.argc(e,A.length,2);const t=T(A[0]);if(!isArr(t))throw this.err(A[0].p,"CS1503",`Argument 1: cannot convert from '${showT(t)}' to an array`,"Array.ConvertAll nhận một mảng, ví dụ Console.ReadLine().Split().");const r=this.fnArg(A[1],S,[elemOf(t)],null);e.el=r;return r+"[]"}
      case "Array.Copy":{this.argc(e,A.length,3,5);if(A.length===4)this.argc(e,4,3);const ts=A.map(T);if(!isArr(ts[0]))throw this.err(A[0].p,"CS1503","","Cần mảng nguồn.");if(A.length===3){if(!isArr(ts[1]))throw this.err(A[1].p,"CS1503","","Cần mảng đích.");this.num(A[2],"int")}else{this.num(A[1],"int");if(!isArr(ts[2]))throw this.err(A[2].p,"CS1503","","Cần mảng đích.");this.num(A[3],"int");this.num(A[4],"int")}return "void"}
      case "Array.Clear":{this.argc(e,A.length,1,3);A.forEach(T);return "void"}
      case "Array.Resize":throw unsup(e.p,"Array.Resize","Dùng List<T> khi cần đổi kích thước.");
      case "Convert.ToInt32":case "Convert.ToInt64":case "Convert.ToDouble":{this.argc(e,A.length,1);const t=T(A[0]);if(!isNumT(t)&&t!=="string"&&t!=="bool")throw this.err(A[0].p,"CS1503","","");e.at=t;return {ToInt32:"int",ToInt64:"long",ToDouble:"double"}[n]}
      case "Convert.ToString":{this.argc(e,A.length,1,2);e.at=T(A[0]);if(A[1]){this.argT(A[1],S,"int");e.base=true}return "string"}
      case "Convert.ToChar":{this.argc(e,A.length,1);const t=T(A[0]);this.num(A[0],"int");return "char"}
      case "Enumerable.Range":{this.needLinq(e.p,"Range","Enumerable");this.argc(e,A.length,2);this.argT(A[0],S,"int");this.argT(A[1],S,"int");return "IEnumerable<int>"}
      case "Enumerable.Repeat":{this.needLinq(e.p,"Repeat","Enumerable");this.argc(e,A.length,2);const t=T(A[0]);this.argT(A[1],S,"int");return `IEnumerable<${t}>`}
      case "Environment.Exit":{this.argc(e,A.length,1);this.argT(A[0],S,"int");return "void"}}
    if(c==="Console")throw this.err(e.f.np,"CS0117",`'Console' does not contain a definition for '${n}'`,/^write/i.test(n)?`Viết đúng chữ hoa: Console.${n.toLowerCase()==="writeline"?"WriteLine":"Write"}.`:/^read/i.test(n)?"Viết đúng: Console.ReadLine().":"Console có WriteLine, Write, ReadLine.");
    if(c==="Math")throw this.err(e.f.np,"CS0117",`'Math' does not contain a definition for '${n}'`,/^(max|min|abs|sqrt|pow)$/i.test(n)?`Viết hoa chữ đầu: Math.${n[0].toUpperCase()+n.slice(1).toLowerCase()}.`:"Kiểm tra lại tên hàm của Math.");
    throw this.err(e.f.np,"CS0117",`'${c}' does not contain a definition for '${n}'`,`${c} không có ${n}, hoặc trình mô phỏng chưa hỗ trợ ${c}.${n}.`)}
  comparable(t){return isNumT(t)||t==="string"||t==="bool"}
  instCall(e,S,t,n,want){const A=e.a;const T=x=>this.argT(x,S,null);const g=gen(t);const el=seqElem(t);e.recv=t;
    const lib=(tag,r)=>{e.lib=tag;return r};
    // ---- phương thức chung của mọi giá trị
    if(n==="ToString"){this.argc(e,A.length,0,1);if(A.length){const f=T(A[0]);if(f!=="string")throw this.err(A[0].p,"CS1503","Argument 1: cannot convert to 'string'","Định dạng là một chuỗi, ví dụ \"F2\".");}return lib("toString","string")}
    if(n==="Equals"){this.argc(e,A.length,1);T(A[0]);return lib("equals","bool")}
    if(n==="CompareTo"&&(isNumT(t)||t==="string"||t==="bool")){this.argc(e,A.length,1);const a=T(A[0]);if(isNumT(t)){if(!canImp(a,t))throw this.err(A[0].p,"CS1503","","Đối số phải cùng kiểu.");this.num(A[0],t)}return lib("compareTo","int")}
    if(n==="GetHashCode"||n==="GetType")throw unsup(e.f.np,n);
    // ---- chuỗi
    if(t==="string"){switch(n){
      case "Substring":this.argc(e,A.length,1,2);A.forEach(x=>this.argT(x,S,"int"));return lib("s.Substring","string");
      case "IndexOf":case "LastIndexOf":{this.argc(e,A.length,1,2);const a=T(A[0]);if(a!=="char"&&a!=="string")throw this.err(A[0].p,"CS1503","","Tìm một ký tự hoặc một chuỗi.");if(A[1])this.argT(A[1],S,"int");return lib("s."+n,"int")}
      case "Contains":case "StartsWith":case "EndsWith":{this.argc(e,A.length,1);const a=T(A[0]);if(a!=="char"&&a!=="string")throw this.err(A[0].p,"CS1503","","");return lib("s."+n,"bool")}
      case "Split":{this.argc(e,A.length,0,2);if(A.length){const a=T(A[0]);if(a!=="char"&&a!=="string"&&a!=="char[]")throw this.err(A[0].p,"CS1503","Argument 1: cannot convert to 'char'","Ký tự ngăn cách viết trong nháy đơn, ví dụ Split(' ').");if(A[1]){const b=T(A[1]);if(b!=="StringSplitOptions"){throw unsup(A[1].p,"Split với số phần tối đa")}}}return lib("s.Split","string[]")}
      case "Trim":case "TrimStart":case "TrimEnd":case "ToUpper":case "ToLower":this.argc(e,A.length,0,n.startsWith("Trim")?1:0);A.forEach(x=>this.argT(x,S,"char"));return lib("s."+n,"string");
      case "Replace":{this.argc(e,A.length,2);const a=T(A[0]),b=T(A[1]);if(a!==b||(a!=="char"&&a!=="string"))throw this.err(A[0].p,"CS1503","","Replace(cũ, mới): hai đối số cùng là char hoặc cùng là string.");return lib("s.Replace","string")}
      case "ToCharArray":this.argc(e,A.length,0);return lib("s.ToCharArray","char[]");
      case "PadLeft":case "PadRight":this.argc(e,A.length,1,2);this.argT(A[0],S,"int");if(A[1])this.argT(A[1],S,"char");return lib("s."+n,"string");
      case "Insert":this.argc(e,A.length,2);this.argT(A[0],S,"int");this.argT(A[1],S,"string");return lib("s.Insert","string");
      case "Remove":this.argc(e,A.length,1,2);A.forEach(x=>this.argT(x,S,"int"));return lib("s.Remove","string");
      case "Length":throw this.err(e.f.np,"CS1955","Non-invocable member 'string.Length' cannot be used like a method.","Length là thuộc tính, không có cặp ngoặc: s.Length.");}}
    if(t==="StringBuilder"){switch(n){
      case "Append":{this.argc(e,A.length,1);const a=T(A[0]);e.at=a;return lib("sb.Append","StringBuilder")}
      case "AppendLine":{this.argc(e,A.length,0,1);if(A.length)e.at=T(A[0]);return lib("sb.AppendLine","StringBuilder")}
      case "Insert":{this.argc(e,A.length,2);this.argT(A[0],S,"int");e.at=T(A[1]);return lib("sb.Insert","StringBuilder")}
      case "Remove":this.argc(e,A.length,2);A.forEach(x=>this.argT(x,S,"int"));return lib("sb.Remove","StringBuilder");
      case "Clear":this.argc(e,A.length,0);return lib("sb.Clear","StringBuilder");}}
    if(g&&g.n==="List"){const T0=g.a[0];switch(n){
      case "Add":this.argc(e,A.length,1);this.argT(A[0],S,T0);return lib("l.Add","void");
      case "AddRange":{this.argc(e,A.length,1);const a=T(A[0]);if(seqElem(a)!==T0)throw this.err(A[0].p,"CS1503",`Argument 1: cannot convert from '${a}' to 'IEnumerable<${T0}>'`,`AddRange cần một dãy phần tử kiểu ${T0}.`);return lib("l.AddRange","void")}
      case "Insert":this.argc(e,A.length,2);this.argT(A[0],S,"int");this.argT(A[1],S,T0);return lib("l.Insert","void");
      case "RemoveAt":this.argc(e,A.length,1);this.argT(A[0],S,"int");return lib("l.RemoveAt","void");
      case "RemoveRange":this.argc(e,A.length,2);A.forEach(x=>this.argT(x,S,"int"));return lib("l.RemoveRange","void");
      case "Remove":this.argc(e,A.length,1);this.argT(A[0],S,T0);return lib("l.Remove","bool");
      case "RemoveAll":this.argc(e,A.length,1);this.fnArg(A[0],S,[T0],"bool");return lib("l.RemoveAll","int");
      case "Contains":this.argc(e,A.length,1);this.argT(A[0],S,T0);return lib("l.Contains","bool");
      case "IndexOf":case "LastIndexOf":this.argc(e,A.length,1);this.argT(A[0],S,T0);return lib("l."+n,"int");
      case "Sort":{this.argc(e,A.length,0,1);if(A.length){const r=this.fnArg(A[0],S,[T0,T0],"int","hàm so sánh");e.cmp=true}else if(!this.comparable(T0))throw this.err(e.p,"CS0311","","Cần hàm so sánh.");e.el=T0;return lib("l.Sort","void")}
      case "Reverse":this.argc(e,A.length,0);return lib("l.Reverse","void");
      case "Clear":this.argc(e,A.length,0);return lib("l.Clear","void");
      case "ToArray":this.argc(e,A.length,0);return lib("toArray",T0+"[]");
      case "BinarySearch":this.argc(e,A.length,1);this.argT(A[0],S,T0);return lib("l.BinarySearch","int");
      case "GetRange":this.argc(e,A.length,2);A.forEach(x=>this.argT(x,S,"int"));return lib("l.GetRange",t);
      case "Exists":this.argc(e,A.length,1);this.fnArg(A[0],S,[T0],"bool");return lib("q.Any","bool");
      case "FindIndex":this.argc(e,A.length,1);this.fnArg(A[0],S,[T0],"bool");return lib("l.FindIndex","int");
      case "Find":this.argc(e,A.length,1);this.fnArg(A[0],S,[T0],"bool");e.def=T0;return lib("l.Find",T0);
      case "TrueForAll":this.argc(e,A.length,1);this.fnArg(A[0],S,[T0],"bool");return lib("q.All","bool");
      case "ForEach":throw unsup(e.f.np,"List.ForEach","Dùng vòng foreach.");}}
    if(g&&g.n==="Dictionary"){const[K,V]=g.a;switch(n){
      case "Add":this.argc(e,A.length,2);this.argT(A[0],S,K);this.argT(A[1],S,V);return lib("d.Add","void");
      case "TryAdd":this.argc(e,A.length,2);this.argT(A[0],S,K);this.argT(A[1],S,V);return lib("d.TryAdd","bool");
      case "ContainsKey":this.argc(e,A.length,1);this.argT(A[0],S,K);return lib("d.ContainsKey","bool");
      case "ContainsValue":this.argc(e,A.length,1);this.argT(A[0],S,V);return lib("d.ContainsValue","bool");
      case "Remove":this.argc(e,A.length,1);this.argT(A[0],S,K);return lib("d.Remove","bool");
      case "Clear":this.argc(e,A.length,0);return lib("d.Clear","void");
      case "TryGetValue":this.argc(e,A.length,2);this.argT(A[0],S,K);this.outArg(A[1],S,V);e.vt=V;return lib("d.TryGetValue","bool");
      case "GetValueOrDefault":this.argc(e,A.length,1,2);this.argT(A[0],S,K);if(A[1])this.argT(A[1],S,V);e.vt=V;return lib("d.GetValueOrDefault",V);}}
    if(g&&g.n==="HashSet"){const T0=g.a[0];switch(n){
      case "Add":case "Remove":this.argc(e,A.length,1);this.argT(A[0],S,T0);return lib("h."+n,"bool");
      case "Contains":this.argc(e,A.length,1);this.argT(A[0],S,T0);return lib("h.Contains","bool");
      case "Clear":this.argc(e,A.length,0);return lib("h.Clear","void");
      case "UnionWith":case "IntersectWith":case "ExceptWith":{this.argc(e,A.length,1);const a=T(A[0]);if(seqElem(a)!==T0)throw this.err(A[0].p,"CS1503","","Cần một dãy cùng kiểu phần tử.");return lib("h."+n,"void")}}}
    if(g&&(g.n==="Stack"||g.n==="Queue")){const T0=g.a[0];const st=g.n==="Stack";switch(n){
      case "Push":case "Enqueue":if((n==="Push")!==st)break;this.argc(e,A.length,1);this.argT(A[0],S,T0);return lib("sq.Add","void");
      case "Pop":case "Dequeue":if((n==="Pop")!==st)break;this.argc(e,A.length,0);return lib("sq.Take",T0);
      case "Peek":this.argc(e,A.length,0);return lib("sq.Peek",T0);
      case "TryPop":case "TryDequeue":case "TryPeek":this.argc(e,A.length,1);this.outArg(A[0],S,T0);return lib(n==="TryPeek"?"sq.TryPeek":"sq.TryTake","bool");
      case "Contains":this.argc(e,A.length,1);this.argT(A[0],S,T0);return lib("sq.Contains","bool");
      case "Clear":this.argc(e,A.length,0);return lib("sq.Clear","void");
      case "ToArray":this.argc(e,A.length,0);return lib("toArray",T0+"[]");}
      if(st&&(n==="Enqueue"||n==="Dequeue"))throw this.noMember(e.f.np,t,n,"Stack (ngăn xếp) dùng Push, Pop, Peek.");
      if(!st&&(n==="Push"||n==="Pop"))throw this.noMember(e.f.np,t,n,"Queue (hàng đợi) dùng Enqueue, Dequeue, Peek.")}
    if(g&&g.n==="PriorityQueue"){const[E,P]=g.a;switch(n){
      case "Enqueue":this.argc(e,A.length,2);this.argT(A[0],S,E);this.argT(A[1],S,P);e.pt=P;return lib("pq.Enqueue","void");
      case "Dequeue":this.argc(e,A.length,0);e.pt=P;return lib("pq.Dequeue",E);
      case "Peek":this.argc(e,A.length,0);return lib("pq.Peek",E);
      case "TryDequeue":case "TryPeek":this.argc(e,A.length,2);this.outArg(A[0],S,E);this.outArg(A[1],S,P);e.pt=P;return lib("pq."+n,"bool");
      case "Clear":this.argc(e,A.length,0);return lib("pq.Clear","void");}
      if(!this.comparable(P))throw this.err(e.p,"CS0311","",`Độ ưu tiên kiểu ${P} cần so sánh được.`)}
    // ---- LINQ trên mọi dãy
    if(el&&!el.startsWith("(")){const L=["Select","Where","Sum","Max","Min","Average","Count","Any","All","Contains","First","Last","FirstOrDefault","LastOrDefault","OrderBy","OrderByDescending","ThenBy","ThenByDescending","ToArray","ToList","ToHashSet","Distinct","Reverse","Take","Skip","Concat","SequenceEqual","ElementAt","Sum","Prepend","Append"];
      if(L.includes(n)){if(n!=="ToArray"||!(g&&["List","Stack","Queue"].includes(g.n)))this.needLinq(e.f.np,n,t);
        if((n==="ThenBy"||n==="ThenByDescending")&&!(e.f.o.k==="call"&&/^(OrderBy|ThenBy)/.test(e.f.o.f.name||"")))throw this.err(e.f.np,"CS1061",`'${t}' does not contain a definition for '${n}'`,"ThenBy dùng ngay sau OrderBy / OrderByDescending.");
        e.el=el;return this.linq(e,S,el,n)}}
    if(isArr(t)&&n==="Clone"){this.argc(e,A.length,0);return lib("clone","object")}
    if(isArr(t)&&(n==="Length"||n==="Count"))throw this.err(e.f.np,"CS1955",`Non-invocable member 'Array.Length' cannot be used like a method.`,"Length là thuộc tính: a.Length (không có cặp ngoặc).");
    if(g&&n==="Count"&&!el)throw this.err(e.f.np,"CS1955","Non-invocable member 'Count' cannot be used like a method.","Count là thuộc tính: a.Count (không có cặp ngoặc).");
    const hint=t==="string"&&/^(length|size|substr|find|charAt|upper|lower|split|trim)$/i.test(n)?`Chuỗi C# dùng: s.Length, s.Substring(i, n), s.IndexOf(x), s[i], s.ToUpper(), s.Split(), s.Trim().`:
      g&&g.n==="List"&&/^(push_back|append|add|size|length|len|pop|insert|erase|remove)$/i.test(n)?"List dùng: Add(x), Insert(i, x), RemoveAt(i), Remove(x), Count, Contains(x).":
      isArr(t)&&/^(push|add|append|size|sort)$/i.test(n)?"Mảng có kích thước cố định: dùng a.Length; sắp xếp bằng Array.Sort(a). Cần thêm phần tử thì dùng List<T>.":undefined;
    throw this.noMember(e.f.np,t,n,hint)}
  linq(e,S,el,n){const A=e.a,self=this;const lib=(tag,r)=>{e.lib="q."+tag;return r};const sumT=t=>{if(!["int","long","double"].includes(t))throw this.err(e.p,"CS1929",`'${t}' does not contain a definition for 'Sum'`,`Sum/Average chỉ dùng cho dãy số int, long, double (đang là ${t}).`);return t};
    switch(n){
      case "Select":{this.argc(e,A.length,1);const r=this.fnArg(A[0],S,[el],null);if(r==="void")throw this.err(A[0].p,"CS0411","The type arguments cannot be inferred","Hàm trong Select phải trả về giá trị.");return lib("Select",`IEnumerable<${r}>`)}
      case "Where":this.argc(e,A.length,1);this.fnArg(A[0],S,[el],"bool");return lib("Where",`IEnumerable<${el}>`);
      case "Sum":case "Average":{this.argc(e,A.length,0,1);let t=el;if(A.length)t=this.fnArg(A[0],S,[el],null);e.st=sumT(t);return lib(n,n==="Average"?"double":t)}
      case "Max":case "Min":{this.argc(e,A.length,0,1);let t=el;if(A.length)t=this.fnArg(A[0],S,[el],null);if(!this.comparable(t)&&t!=="char")throw this.err(e.p,"CS1929","",`Max/Min cần phần tử so sánh được.`);e.st=t;return lib(n,t)}
      case "Count":case "Any":{this.argc(e,A.length,0,1);if(A.length)this.fnArg(A[0],S,[el],"bool");return lib(n,n==="Count"?"int":"bool")}
      case "All":this.argc(e,A.length,1);this.fnArg(A[0],S,[el],"bool");return lib("All","bool");
      case "Contains":this.argc(e,A.length,1);this.argT(A[0],S,el);return lib("Contains","bool");
      case "First":case "Last":case "FirstOrDefault":case "LastOrDefault":this.argc(e,A.length,0,1);if(A.length)this.fnArg(A[0],S,[el],"bool");e.def=el;return lib(n,el);
      case "OrderBy":case "OrderByDescending":case "ThenBy":case "ThenByDescending":{this.argc(e,A.length,1);const r=this.fnArg(A[0],S,[el],null);if(!this.comparable(r)&&r!=="char")throw this.err(A[0].p,"CS0411","",`Khóa sắp xếp phải là số, chữ hoặc chuỗi.`);e.kt=r;return lib(n,`IEnumerable<${el}>`)}
      case "ToArray":this.argc(e,A.length,0);e.lib="toArray";return el+"[]";
      case "ToList":this.argc(e,A.length,0);return lib("ToList",`List<${el}>`);
      case "ToHashSet":this.argc(e,A.length,0);return lib("ToHashSet",`HashSet<${el}>`);
      case "Distinct":case "Reverse":this.argc(e,A.length,0);return lib(n,`IEnumerable<${el}>`);
      case "Take":case "Skip":this.argc(e,A.length,1);this.argT(A[0],S,"int");return lib(n,`IEnumerable<${el}>`);
      case "ElementAt":this.argc(e,A.length,1);this.argT(A[0],S,"int");return lib(n,el);
      case "Concat":case "SequenceEqual":{this.argc(e,A.length,1);const a=this.argT(A[0],S,null);if(seqElem(a)!==el)throw this.err(A[0].p,"CS1929","","Hai dãy phải cùng kiểu phần tử.");return lib(n,n==="Concat"?`IEnumerable<${el}>`:"bool")}
      case "Prepend":case "Append":this.argc(e,A.length,1);this.argT(A[0],S,el);return lib(n,`IEnumerable<${el}>`)}
    throw unsup(e.p,"LINQ "+n)}
  newT(e,S,want){let t=e.t;if(!t){if(!want||want==="var")throw this.err(e.p,"CS8754","There is no target type for 'new()'","new() không ghi kiểu chỉ dùng khi biến đã khai báo kiểu rõ ràng.");t=want;e.t=t}
    const A=e.a;const T=x=>this.argT(x,S,null);
    if(t==="string"){this.argc({f:{name:"string",p:e.p}},A.length,1,2);const a=T(A[0]);if(A.length===2){if(a!=="char")throw this.err(A[0].p,"CS1503","","new string(ký_tự, số_lần).");this.argT(A[1],S,"int");e.lib="newStrRep"}else{if(a!=="char[]")throw this.err(A[0].p,"CS1503","","new string(mảng_char).");e.lib="newStrArr"}return "string"}
    if(/Exception$/.test(t)){if(!["Exception","ArgumentException","InvalidOperationException","ArgumentOutOfRangeException","IndexOutOfRangeException","NotImplementedException"].includes(t))this.checkT(t,e.tp);A.forEach(x=>this.argT(x,S,"string"));e.lib="newExc";return t}
    if(t==="Random")throw unsup(e.p,"Random","Kết quả ngẫu nhiên khác nhau mỗi lần chạy nên trình mô phỏng chưa hỗ trợ.");
    this.checkT(t,e.tp||e.p);const g=gen(t);
    if(t==="StringBuilder"){if(A.length){const a=T(A[0]);if(a!=="string")throw this.err(A[0].p,"CS1503","","new StringBuilder(chuỗi).")}e.lib="newSB";return t}
    if(!g)throw this.err(e.p,"CS0144",`Cannot create an instance of '${t}'`,`Không tạo đối tượng kiểu ${t} bằng new được.`);
    if(g.n==="KeyValuePair"){this.argc({f:{name:t,p:e.p}},A.length,2);this.argT(A[0],S,g.a[0]);this.argT(A[1],S,g.a[1]);e.lib="newKV";return t}
    if(!["List","Dictionary","HashSet","Stack","Queue","PriorityQueue"].includes(g.n))throw this.err(e.p,"CS0144",`Cannot create an instance of the abstract type or interface '${t}'`,`${g.n} không tạo trực tiếp được; dùng List<…>.`);
    e.lib="new"+g.n;
    if(A.length>1)throw this.err(e.p,"CS1729",`'${t}' does not contain a constructor that takes ${A.length} arguments`,"");
    if(A.length){const a=T(A[0]);if(a==="int"&&g.n!=="PriorityQueue"){e.cap=true}else if(g.n==="Dictionary"||g.n==="PriorityQueue"){throw unsup(A[0].p,`new ${g.n}(…) có đối số`)}else{if(seqElem(a)!==g.a[0])throw this.err(A[0].p,"CS1503",`Argument 1: cannot convert from '${a}' to 'IEnumerable<${g.a[0]}>'`,`Muốn tạo ${g.n} từ một dãy, dãy phải có phần tử kiểu ${g.a[0]}.`);e.from=true}}
    if(e.init){if(g.n==="Dictionary"){for(const x of e.init){if(!x.kv||x.kv.length!==2)throw this.err(x.p||e.p,"CS7036","","Mỗi phần tử khởi tạo Dictionary viết { khóa, giá trị }.");this.argT(x.kv[0],S,g.a[0]);this.argT(x.kv[1],S,g.a[1])}}
      else if(g.n==="List"||g.n==="HashSet"){for(const x of e.init){if(x.kv)throw this.err(x.p,"CS1950","","Phần tử khởi tạo List viết thẳng giá trị, không có { }.");this.argT(x,S,g.a[0])}}
      else throw unsup(e.p,`Khởi tạo ${g.n} bằng { … }`,"Tạo rỗng rồi thêm từng phần tử.")}
    return t}
}

/* ---------------- 5. giá trị lúc chạy ---------------- */
class CsExc{constructor(type,msg,vi){this.type=type;this.msg=msg;this.vi=vi||""}}
const VI_EXC={
  "System.IndexOutOfRangeException":"Truy cập ngoài mảng: chỉ số nhỏ hơn 0 hoặc lớn hơn hay bằng Length. Mảng n phần tử có chỉ số 0 … n − 1.",
  "System.ArgumentOutOfRangeException":"Chỉ số nằm ngoài List (hoặc ngoài chuỗi): phải từ 0 tới Count − 1.",
  "System.DivideByZeroException":"Chia số nguyên (hoặc chia lấy dư) cho 0.",
  "System.FormatException":"Chuỗi không đổi được thành số: kiểm tra dữ liệu nhập (có chữ, có dấu cách thừa giữa các số, hoặc đọc cả dòng nhiều số bằng một lần int.Parse).",
  "System.OverflowException":"Số quá lớn hoặc quá nhỏ cho kiểu dữ liệu (ví dụ int chỉ tới khoảng 2,1 tỉ; dùng long).",
  "System.NullReferenceException":"Dùng một giá trị null. Thường gặp: Console.ReadLine() trả về null vì đã hết dữ liệu nhập, rồi gọi .Split() trên nó; hoặc dùng mảng chưa được tạo bằng new.",
  "System.ArgumentNullException":"Đối số là null. Thường do Console.ReadLine() đã hết dữ liệu nhập.",
  "System.Collections.Generic.KeyNotFoundException":"Đọc d[khóa] khi Dictionary chưa có khóa đó. Kiểm tra bằng ContainsKey trước, hoặc dùng TryGetValue.",
  "System.InvalidOperationException":"Thao tác không hợp lệ với trạng thái hiện tại, ví dụ Pop/Dequeue/Peek khi rỗng, hay Max() của dãy rỗng.",
  "System.ArgumentException":"Đối số không hợp lệ, ví dụ Add một khóa đã có trong Dictionary (dùng d[k] = v để ghi đè).",
  "System.Exception":"Chương trình chủ động báo lỗi bằng throw."};
const EXC=(type,msg)=>new CsExc(type,msg,VI_EXC[type]);
const I32=v=>v|0,L64=v=>BigInt.asIntN(64,v);
function conv(v,from,to){if(from===to||v===null||v===undefined)return v;
  switch(to){
    case "long":if(from==="double"){if(!isFinite(v)||Math.abs(v)>=9.223372036854776e18)return -9223372036854775808n;return BigInt(Math.trunc(v))}return BigInt(v);
    case "int":if(from==="long")return Number(BigInt.asIntN(32,v));if(from==="double"){if(!isFinite(v)||Math.abs(v)>=2147483648)return -2147483648;return Math.trunc(v)|0}return v|0;
    case "double":return from==="long"?Number(v):v;
    case "char":if(from==="long")return Number(BigInt.asUintN(16,v));if(from==="double")return isFinite(v)?(Math.trunc(v)&0xFFFF):0;return v&0xFFFF}
  return v}
const defOf=t=>t==="int"||t==="double"||t==="char"?0:t==="long"?0n:t==="bool"?false:null;
/* số thực in theo .NET (chuỗi ngắn nhất đọc lại đúng; dạng E khi số mũ ≥ 15 hoặc < −5) */
function netD(x){if(Number.isNaN(x))return "NaN";if(x===Infinity)return "Infinity";if(x===-Infinity)return "-Infinity";if(x===0)return Object.is(x,-0)?"-0":"0";
  let s=String(x);let m=/^(-?)(\d+)(?:\.(\d+))?(?:e([+-]\d+))?$/.exec(s);if(!m)return s;const sign=m[1];let digs=(m[2]+(m[3]||"")).replace(/^0+/,"");let exp=(m[4]?+m[4]:0)+m[2].length-1;
  if(m[2]==="0"){const z=(m[3]||"").match(/^0*/)[0].length;exp=-z-1;digs=(m[3]||"").slice(z)}
  digs=digs.replace(/0+$/,"")||"0";
  if(exp>=17||exp<-4){const mant=digs.length>1?digs[0]+"."+digs.slice(1):digs;return sign+mant+"E"+(exp<0?"-":"+")+String(Math.abs(exp)).padStart(2,"0")}
  if(exp>=0){const ip=digs.length>exp+1?digs.slice(0,exp+1):digs.padEnd(exp+1,"0");const fp=digs.slice(exp+1);return sign+ip+(fp?"."+fp:"")}
  return sign+"0."+"0".repeat(-exp-1)+digs}
/* làm tròn tới d chữ số thập phân theo giá trị nhị phân chính xác, hòa thì về chẵn (giống .NET Core) */
function fixedNet(x,d){if(!isFinite(x))return netD(x);const neg=x<0||Object.is(x,-0);x=Math.abs(x);
  const buf=new DataView(new ArrayBuffer(8));buf.setFloat64(0,x);const hi=buf.getUint32(0),lo=buf.getUint32(4);const ex=(hi>>>20)&0x7ff;let man=(BigInt(hi&0xfffff)<<32n)|BigInt(lo);let e2;
  if(ex===0)e2=-1074;else{man|=1n<<52n;e2=ex-1075}
  let num=man,den=1n;if(e2>=0)num<<=BigInt(e2);else den<<=BigInt(-e2);
  const sc=10n**BigInt(d);const t=num*sc;let q=t/den,r=t%den;const twice=r*2n;if(twice>den||(twice===den&&(q&1n)))q+=1n;
  const s=q.toString().padStart(d+1,"0");const ip=s.slice(0,s.length-d),fp=s.slice(s.length-d);
  return (neg?"-":"")+ip+(d?"."+fp:"")}
const groupInt=s=>{const neg=s.startsWith("-");if(neg)s=s.slice(1);const[i,f]=s.split(".");return (neg?"-":"")+i.replace(/\B(?=(\d{3})+(?!\d))/g,",")+(f!==undefined?"."+f:"")};
function fmtNum(v,t,f){if(!f)return fmtVal(v,t);const m=/^([A-Za-z])(\d*)$/.exec(f);const isI=t==="int"||t==="long"||t==="char";const x=t==="long"?Number(v):v;
  if(m){const c=m[1].toUpperCase(),d=m[2]===""?null:+m[2];
    switch(c){
      case "F":return isI?(t==="long"?v.toString():String(v))+(d!==0?"."+"0".repeat(d===null?2:d):""):fixedNet(x,d===null?2:d);
      case "N":return groupInt(isI?(t==="long"?v.toString():String(v))+(d!==0?"."+"0".repeat(d===null?2:d):""):fixedNet(x,d===null?2:d));
      case "D":if(!isI)throw EXC("System.FormatException","Format specifier was invalid.");{const s=t==="long"?v.toString():String(v);const neg=s.startsWith("-");const b=neg?s.slice(1):s;return (neg?"-":"")+b.padStart(d||0,"0")}
      case "X":if(!isI)throw EXC("System.FormatException","Format specifier was invalid.");{let b=t==="long"?BigInt.asUintN(64,v).toString(16):(v>>>0).toString(16);if(m[1]==="X")b=b.toUpperCase();return b.padStart(d||0,"0")}
      case "E":{const dd=d===null?6:d;let s=x.toExponential(dd);const mm=/^(-?[\d.]+)e([+-])(\d+)$/.exec(s);return mm[1]+(m[1]==="e"?"e":"E")+mm[2]+mm[3].padStart(3,"0")}
      case "G":return fmtVal(v,t);
      case "P":return fixedNet(x*100,d===null?2:d)+" %";}}
  if(/^[0#,]*(\.0*#*)?$/.test(f)){const dot=f.indexOf(".");const dz=dot<0?0:(f.slice(dot+1).match(/0/g)||[]).length;const dh=dot<0?0:(f.slice(dot+1).match(/#/g)||[]).length;
    let s=fixedNet(isI?Number(x):x,dz+dh);if(dh){s=s.replace(/(\.\d*?)0+$/,(q,a)=>{const keep=Math.max(dz,a.length-1);return q.slice(0,1+keep)}).replace(/\.$/,"")}
    const ipad=(f.split(".")[0].match(/0/g)||[]).length;const neg=s.startsWith("-");let body=neg?s.slice(1):s;let[ip,fp]=body.split(".");ip=ip.padStart(ipad,"0");if(ipad===0&&ip==="0"&&fp)ip="";
    let r=ip+(fp!==undefined?"."+fp:"");if(f.includes(","))r=groupInt(r);return (neg?"-":"")+r}
  throw new CsExc("System.FormatException","Format specifier was invalid.","Định dạng số này chưa có trong trình mô phỏng (có F2, N0, D3, E2, X, 0.00).")}
function chs(c){return String.fromCharCode(c)}
/* in một giá trị như Console.Write / ToString của .NET */
function fmtVal(v,t){if(v===null||v===undefined)return "";
  switch(t){case "int":return String(v);case "long":return v.toString();case "double":return netD(v);case "bool":return v?"True":"False";case "char":return chs(v);case "string":return v}
  if(typeof v==="object"){if(v.k==="sb")return v.s;if(v.k==="kvp")return `[${fmtVal(v.key,v.kt)}, ${fmtVal(v.val,v.vt)}]`;if(v.k==="exc")return v.type+": "+v.msg;return clrName(v.t||t)}
  if(typeof v==="bigint")return v.toString();if(typeof v==="boolean")return v?"True":"False";return String(v)}
/* hiển thị trong khung Bộ nhớ / hình động: viết như literal C# */
function lit(v,t,max){max=max||40;let s;
  if(v===null||v===undefined)s="null";
  else switch(t){case "char":s="'"+(v===10?"\\n":v===9?"\\t":v===0?"\\0":chs(v))+"'";break;case "string":s=JSON.stringify(v);break;case "bool":s=v?"true":"false";break;case "double":s=netD(v);break;case "long":case "int":s=String(v);break;
    default:if(typeof v==="object"){const a=seqVals(v);if(v.k==="dict"){const E=dEnt(v);s="{"+E.slice(0,8).map(x=>lit(x.key,v.kt,12)+": "+lit(x.val,v.vt,12)).join(", ")+(E.length>8?", …":"")+"}"}
        else if(v.k==="sb")s='"'+v.s+'"';else if(v.k==="fn")s="(lambda)";else if(v.k==="kvp")s="["+lit(v.key,v.kt,12)+", "+lit(v.val,v.vt,12)+"]";
        else if(a)s=(v.k==="set"?"{":"[")+a.slice(0,8).map(x=>lit(x,v.el,12)).join(", ")+(a.length>8?", …":"")+(v.k==="set"?"}":"]");else s=String(v.t||"")}else s=String(v)}
  return s.length>max?s.slice(0,max-1)+"…":s}
/* các phần tử của một giá trị có thể duyệt (mảng, List, chuỗi, HashSet, Stack, Queue, dãy LINQ, Keys/Values) */
function seqVals(v){if(v===null||v===undefined)return null;if(typeof v==="string")return Array.from(v,c=>c.charCodeAt(0));
  switch(v.k){case "arr":case "list":case "seq":return v.a;case "set":return dEnt(v).map(x=>x.key);case "stack":return v.a.slice().reverse();case "queue":return v.a.slice(v.h);
    case "dict":return dEnt(v).map(x=>({k:"kvp",key:x.key,val:x.val,kt:v.kt,vt:v.vt,t:`KeyValuePair<${v.kt},${v.vt}>`}));case "keys":return dEnt(v.d).map(x=>x.key);case "vals":return dEnt(v.d).map(x=>x.val);case "pq":return v.h.slice(0,v.n).map(x=>x[0])}
  return null}
/* Dictionary / HashSet giống .NET: mảng các ô theo thứ tự thêm; ô bị xóa vào danh sách trống (LIFO) và được dùng lại trước */
const dEnt=d=>d.ent.filter(Boolean);
function dNew(k,kt,vt,t){return k==="dict"?{k,ent:[],idx:new Map(),free:[],kt,vt,t,ver:0}:{k,ent:[],idx:new Map(),free:[],el:kt,t,ver:0}}
function dPut(d,key,val){const i=d.idx.get(key);if(i!==undefined){d.ent[i].val=val;return false}
  const j=d.free.length?d.free.pop():d.ent.length;d.ent[j]={key,val};d.idx.set(key,j);d.ver++;return true}
function dDel(d,key){const i=d.idx.get(key);if(i===undefined)return false;d.ent[i]=null;d.idx.delete(key);d.free.push(i);return true}
function dClear(d){d.ent=[];d.idx=new Map();d.free=[];d.ver++}
const cmpVal=(a,b)=>a<b?-1:a>b?1:0;
function cmpT(t){if(t==="string")return (a,b)=>a===null?(b===null?0:-1):b===null?1:ordStr(a,b);if(t==="bool")return (a,b)=>(a?1:0)-(b?1:0);return cmpVal}
/* so sánh chuỗi: .NET mặc định theo văn hóa (chữ thường đứng trước chữ hoa cùng loại); khóa học dùng chuỗi ASCII đơn giản */
function ordStr(a,b){const la=a.toLowerCase(),lb=b.toLowerCase();if(la!==lb){const n=Math.min(la.length,lb.length);for(let i=0;i<n;i++){const x=la[i],y=lb[i];if(x!==y){const ax=/[a-z0-9]/.test(x),ay=/[a-z0-9]/.test(y);if(ax!==ay)return ax?1:-1;return x<y?-1:1}}return la.length-lb.length<0?-1:1}
  for(let i=0;i<a.length;i++){if(a[i]!==b[i])return a[i]===a[i].toLowerCase()?-1:1}return 0}
const NEED=Symbol("need"),BRK={brk:1},CNT={cnt:1};
const LIMIT=1000000,MAXDEPTH=5000;

/* ---------------- 6. máy chạy từng bước ---------------- */
class CsM{
  constructor(prog,src,opt){opt=opt||{};
    this.P=prog;this.src=src;this.buf=opt.input||"";this.pos=0;this.reads=[];this.out=[];this.outLen=0;this.inter=!!opt.interactive;this.eofIn=false;
    this.cost=0;this.done=false;this.crash=null;this.exit=0;this.notes=[];this.failed=false;this.eof=false;this.nCalls=0;this.maxDepth=0;this.ctree=[];this.cnode=-1;
    this.rd=new Set();this.wr=new Set();this.wrRoot=new Set();this.mut=new Set();this.stores=[];this.snap=true;this.gorder=[];this.hasFns=true;this.lang="cs";
    this.sv=new Map();this.st=new Map();this.frames=[];this.f=null;this.cells=new WeakMap();this.curLine=0;this.nextL=0;
    this.LS=[0];for(let i=0;i<src.length;i++)if(src[i]==="\n")this.LS.push(i+1);
    this.g=this.run();this.pendErr=null;
    try{const r=this.g.next();if(r.done){this.done=true}else if(r.value===NEED){this.nextL=this.curLine;this.primeNeed=true}else this.nextL=r.value}
    catch(x){this.pendErr=x;this.nextL=this.curLine||1}}
  /* ---- giao diện chung với trình mô phỏng C++ ---- */
  get vars(){return this.f?this.f.vars:new Map()}get order(){return this.f?[...this.f.vars.keys()]:[]}get lastOrder(){return this.done&&this.mainSeen?[...this.mainSeen]:null}get calls(){return this.frames.slice(1)}get globals(){return this.sv}
  nextLine(){return this.done?0:this.nextL}
  text(){return this.out.filter(x=>x.k==="o").map(x=>x.s).join("")}
  feed(line){this.buf+=line+"\n";this.out.push({k:"i",s:line+"\n"})}
  write(s){if(!s)return;this.outLen+=s.length;if(this.outLen>200000)throw{olimit:true};const L=this.out[this.out.length-1];if(L&&L.k==="o")L.s+=s;else this.out.push({k:"o",s})}
  runAll(max){let r;for(let k=0;k<(max||LIMIT+5);k++){r=this.step();if(r.s!=="ran")break}return r}
  lineOf(p){let lo=0,hi=this.LS.length-1;while(lo<hi){const m=(lo+hi+1)>>1;if(this.LS[m]<=p)lo=m;else hi=m-1}return lo+1}
  mark(fr,s){const ln=s.ln||(s.ln=this.lineOf(s.p));if(fr)fr.line=ln;this.curLine=ln;if(++this.cost>LIMIT)throw{tle:true};return ln}
  step(){if(this.done)return{s:"done",line:this.curLine};
    const line=this.nextL;
    if(this.pendErr){const x=this.pendErr;this.pendErr=null;return this.fail(x,line)}
    if(this.snap){this.rd=new Set();this.wr=new Set();this.stores=[];this.mut=new Set()}
    const d0=this.frames.length;this.lc=null;this.lastRet=null;
    let r;try{r=this.g.next()}catch(x){return this.fail(x,line)}
    const ch=this.chSet();
    if(r.done){this.done=true;this.nextL=0;return{s:"done",line,ch}}
    if(r.value===NEED)return{s:"need",line:this.curLine};
    this.nextL=r.value;const d1=this.frames.length;
    if(d1===1&&this.f)for(const k of this.f.vars.keys())(this.mainSeen||(this.mainSeen=new Set())).add(k);
    if(d1>d0)return{s:"ran",line,ch,kw:"call",fn:this.f.fn.name};
    if(d1<d0&&this.lastRet)return{s:"ran",line,ch,kw:"ret",fn:this.lastRet.fn,rv:{cs:this.lastRet.v,t:this.lastRet.t}};
    if(this.lc)return{s:"ran",line,ch,kw:this.lc.kw,op:this.lc.kw,cond:this.lc.c};
    return{s:"ran",line,ch}}
  fail(x,line){this.done=true;
    if(x&&x.tle){this.crash={msg:"Time limit exceeded",short:"Time limit exceeded",vi:"Chương trình đã chạy hơn 1 000 000 bước, vượt giới hạn của trình mô phỏng. Nguyên nhân thường gặp là vòng lặp vô hạn hoặc đệ quy không dừng. Nếu giải thuật đúng nhưng cần nhiều bước, hãy thử với dữ liệu nhỏ hơn."};this.exit=124;return{s:"crash",line}}
    if(x&&x.olimit){this.crash={msg:"Output limit exceeded",short:"Output limit exceeded",vi:"Chương trình in ra quá nhiều (hơn 200 000 ký tự), có thể do vòng lặp vô hạn."};this.exit=124;return{s:"crash",line}}
    if(x&&x.exitCode!==undefined){this.exit=x.exitCode;return{s:"done",line}}
    const at=this.frames.slice().reverse().map(F=>`   at ${F.fn&&F.fn.top?"Program.<Main>$(String[] args)":"Program."+(F.fn?F.fn.name:"?")+"()"} in main.cs:line ${F.line}`).join("\n");
    if(x&&x.so){this.crash={msg:"Stack overflow.\n"+at.split("\n").slice(0,6).join("\n"),short:"Stack overflow.",type:"StackOverflow",vi:`Đệ quy quá sâu (hơn ${MAXDEPTH} tầng trong trình mô phỏng). Thường do thiếu điều kiện dừng, hoặc điều kiện dừng không bao giờ đạt tới.`};this.exit=134;return{s:"crash",line:this.curLine}}
    if(x instanceof CsExc){this.crash={msg:`Unhandled exception. ${x.type}: ${x.msg}\n${at}`,short:`${x.type}: ${x.msg}`,type:x.type,vi:x.vi||VI_EXC[x.type]||""};this.exit=134;return{s:"crash",line:this.curLine}}
    if(x instanceof RangeError&&/call stack/i.test(x.message)){return this.fail({so:true},line)}
    this.crash={msg:"Lỗi trong trình mô phỏng: "+(x&&x.message||x),short:"Lỗi trình mô phỏng",vi:"Trình mô phỏng gặp lỗi nội bộ khi chạy đoạn code này. Code có thể vẫn đúng với C# thật."};this.exit=1;if(typeof console!=="undefined")console.error(x);return{s:"crash",line}}
  chSet(){const ch=new Set();if(!this.snap||!this.f)return ch;for(const n of this.stores)ch.add(n);if(this.mut.size)this.f.vars.forEach((v,n)=>{if(this.mut.has(v))ch.add(n)});return ch}
  /* ---- nhập dữ liệu ---- */
  needInput(){return this.inter&&!this.eofIn&&this.buf.indexOf("\n",this.pos)<0}
  readLine(){if(this.pos>=this.buf.length){this.eof=true;return null}
    let j=this.buf.indexOf("\n",this.pos);const a=this.pos;let line;if(j<0){line=this.buf.slice(a);this.pos=this.buf.length}else{line=this.buf.slice(a,j);this.pos=j+1}
    this.reads.push({a,b:this.pos,n:"Console.ReadLine()"});this.cost+=line.length>>6;return line.replace(/\r$/,"")}
  /* ---- chạy ---- */
  *run(){
    for(const f of this.P.statics){let v=f.init?(f.init.gc?yield* this.evg(f.init,null):this.ev(f.init,null)):defOf(f.t);this.sv.set(f.name,v);this.st.set(f.name,f.t);this.gorder.push(f.name)}
    const m=this.P.main;const fr={fn:m,vars:new Map(),tys:new Map(),up:null,line:0,title:"Main()",top:true};this.frames.push(fr);this.f=fr;
    const r=yield* this.blk(m.body,fr,true);   // giữ biến của Main sau khi chạy xong để Bộ nhớ, Hình động còn trạng thái cuối
    if(m.ret==="int"&&r&&r.r!==undefined)this.exit=r.r}
  getVar(fr,e){let f=fr;for(let h=e.bind.hops;h>0;h--)f=f.up;const v=f.vars.get(e.name);return v}
  setVar(fr,name,hops,v){let f=fr;for(let h=hops;h>0;h--)f=f.up;f.vars.set(name,v);if(this.snap&&f===this.f)this.stores.push(name)}
  walk(fr,h){let f=fr;for(;h>0;h--)f=f.up;return f}
  *blk(b,fr,keep){const ss=b.ss;let r;
    for(let k=0;k<ss.length;k++){const s=ss[k];if(s.k==="fn")continue;r=yield* this.S(s,fr);if(r)break}
    if(b.decls&&b.decls.length&&!b.top&&!keep)for(const n of b.decls){fr.vars.delete(n);fr.tys.delete(n)}
    return r}
  body(s,fr){return s.k==="block"?this.blk(s,fr):this.S(s,fr)}
  E(e,fr){return e.gc?this.evg(e,fr):null}
  *S(s,fr){
    switch(s.k){
      case "empty":return;
      case "block":return yield* this.blk(s,fr);
      case "decl":{yield this.mark(fr,s);
        for(const d of s.ds){const v=d.init?(d.init.gc?yield* this.evg(d.init,fr):this.ev(d.init,fr)):defOf(d.t);fr.vars.set(d.name,v);fr.tys.set(d.name,d.t);if(this.snap)this.stores.push(d.name)}
        return}
      case "expr":yield this.mark(fr,s);if(s.e.gc)yield* this.evg(s.e,fr);else this.ev(s.e,fr);return;
      case "if":{yield this.mark(fr,s);const c=s.c.gc?yield* this.evg(s.c,fr):this.ev(s.c,fr);this.lc={kw:"if",c};
        if(c)return yield* this.body(s.th,fr);if(s.el)return yield* this.body(s.el,fr);return}
      case "while":{for(;;){yield this.mark(fr,s);const c=s.c.gc?yield* this.evg(s.c,fr):this.ev(s.c,fr);this.lc={kw:"while",c};if(!c)return;
          const r=yield* this.body(s.body,fr);if(r===BRK)return;if(r&&r!==CNT)return r}}
      case "do":{for(;;){const r=yield* this.body(s.body,fr);if(r===BRK)return;if(r&&r!==CNT)return r;
          yield this.mark(fr,{p:s.wp,ln:s.wln});s.wln=this.curLine;const c=s.c.gc?yield* this.evg(s.c,fr):this.ev(s.c,fr);this.lc={kw:"while",c};if(!c)return}}
      case "for":{yield this.mark(fr,s);let res;
        for(const x of s.init){if(x.k==="decl"){for(const d of x.ds){const v=d.init?(d.init.gc?yield* this.evg(d.init,fr):this.ev(d.init,fr)):defOf(d.t);fr.vars.set(d.name,v);fr.tys.set(d.name,d.t);if(this.snap)this.stores.push(d.name)}}else{if(x.e.gc)yield* this.evg(x.e,fr);else this.ev(x.e,fr)}}
        for(;;){if(s.c){const c=s.c.gc?yield* this.evg(s.c,fr):this.ev(s.c,fr);this.lc={kw:"for",c};if(!c)break}
          const r=yield* this.body(s.body,fr);if(r===BRK)break;if(r&&r!==CNT){res=r;break}
          yield this.mark(fr,s);for(const x of s.st){if(x.gc)yield* this.evg(x,fr);else this.ev(x,fr)}}
        if(s.decls)for(const n of s.decls){fr.vars.delete(n);fr.tys.delete(n)}
        return res}
      case "foreach":{yield this.mark(fr,s);const coll=s.e.gc?yield* this.evg(s.e,fr):this.ev(s.e,fr);if(coll===null||coll===undefined)throw EXC("System.NullReferenceException","Object reference not set to an instance of an object.");
        const ver=coll.ver;const items=seqVals(coll);const n=items.length;let res;
        const chk=()=>{if(coll.ver!==ver)throw EXC("System.InvalidOperationException","Collection was modified; enumeration operation may not execute.")};
        for(let k=0;k<n;k++){if(k>0)yield this.mark(fr,s);chk();
          let v=items[k];if(s.el!==s.vt)v=conv(v,s.el,s.vt);fr.vars.set(s.name,v);fr.tys.set(s.name,s.vt);if(this.snap){this.stores.push(s.name);if(coll.k==="arr"||coll.k==="list")this.rd.add(this.cellOf(coll,k))}
          const r=yield* this.body(s.body,fr);if(r===BRK)break;if(r&&r!==CNT){res=r;break}if(k===n-1){yield this.mark(fr,s);chk()}}
        fr.vars.delete(s.name);fr.tys.delete(s.name);return res}
      case "ret":{yield this.mark(fr,s);if(!s.e)return{r:undefined};const v=s.e.gc?yield* this.evg(s.e,fr):this.ev(s.e,fr);return{r:v}}
      case "break":yield this.mark(fr,s);return BRK;
      case "cont":yield this.mark(fr,s);return CNT;
      case "throw":{yield this.mark(fr,s);const v=s.e?(s.e.gc?yield* this.evg(s.e,fr):this.ev(s.e,fr)):null;if(!v)throw EXC("System.NullReferenceException","Object reference not set to an instance of an object.");throw new CsExc(v.type,v.msg,VI_EXC[v.type]||"")}
      case "switch":{yield this.mark(fr,s);const v=s.e.gc?yield* this.evg(s.e,fr):this.ev(s.e,fr);let sec=null;
        outer:for(const x of s.secs)for(const L of x.labels){if(L.def)continue;const lv=this.ev(L.e,fr);if(lv===v){sec=x;break outer}}
        const hit=!!sec;if(!sec)sec=s.secs.find(x=>x.labels.some(L=>L.def));this.lc={kw:"switch",c:{sw:lit(v,s.e.ty,20),hit}};let res;
        if(sec)for(const x of sec.ss){const r=yield* this.S(x,fr);if(r===BRK)break;if(r){res=r;break}}
        if(s.decls)for(const n of s.decls){fr.vars.delete(n);fr.tys.delete(n)}return res}
      case "fn":return}
    throw new Error("câu lệnh "+s.k)}
  /* ---- gọi hàm của người viết ---- */
  *callUser(m,args,fr,hops){
    if(this.frames.length>=MAXDEPTH)throw{so:true};
    const up=m.local?this.walk(fr,hops):null;const nf={fn:m,vars:new Map(),tys:new Map(),up,line:this.lineOf(m.p),callLine:fr?fr.line:0,cn:this.cnode};
    m.ps.forEach((p,i)=>{nf.vars.set(p.name,args[i]);nf.tys.set(p.name,p.t)});
    nf.title=m.name+"("+m.ps.map(p=>p.name+"="+lit(nf.vars.get(p.name),p.t,14)).join(", ")+")";
    this.nCalls++;if(this.ctree.length<300){this.ctree.push({l:nf.title,f:m.name,par:this.cnode,ret:null,done:false});this.cnode=this.ctree.length-1}else this.cnode=-2;
    this.frames.push(nf);this.f=nf;if(this.frames.length-1>this.maxDepth)this.maxDepth=this.frames.length-1;
    const r=yield* this.blk(m.body,nf);
    const v=r&&r.r!==undefined?r.r:undefined;
    const nd=this.cnode>=0?this.ctree[this.cnode]:null;if(nd){nd.done=true;if(m.ret!=="void")nd.ret=lit(v,m.ret,16)}this.cnode=nf.cn;this.lastRet={fn:m.name,v,t:m.ret};
    this.frames.pop();this.f=this.frames[this.frames.length-1]||null;
    return v}
  drain(g){let r;for(;;){r=g.next();if(r.done)return r.value;if(r.value===NEED){if(this.pos>=this.buf.length){this.eofIn=true}}}}
  /* gọi một hàm-giá-trị (lambda, tên hàm) một cách đồng bộ: dùng cho Sort, Select, Where… */
  invoke(fv,args){if(!fv)throw EXC("System.NullReferenceException","Object reference not set to an instance of an object.");
    if(fv.k==="fn"){const L=fv.lam;const nf={vars:new Map(),tys:new Map(),up:fv.fr,lam:true};L.ps.forEach((p,i)=>{nf.vars.set(p.name,args[i]);nf.tys.set(p.name,L.pts[i])});this.cost++;
      if(L.expr)return L.expr.gc?this.drain(this.evg(L.expr,nf)):this.ev(L.expr,nf);const r=this.drain(this.blk(L.body,nf));return r&&r.r}
    if(fv.k==="mgs")return this.mgs(fv.name,args[0]);
    if(fv.k==="mgfn")return this.drain(this.callUser(fv.m,args,fv.fr,0));
    throw new Error("không gọi được")}
  mgs(n,x){switch(n){case "int.Parse":return this.parseNum(x,"int");case "long.Parse":return this.parseNum(x,"long");case "double.Parse":return this.parseNum(x,"double");
    case "char.IsDigit":return x>=48&&x<=57;case "char.IsLetter":return /\p{L}/u.test(chs(x));case "char.IsUpper":return /\p{Lu}/u.test(chs(x));case "char.IsLower":return /\p{Ll}/u.test(chs(x));
    case "char.ToUpper":return chs(x).toUpperCase().charCodeAt(0);case "char.ToLower":return chs(x).toLowerCase().charCodeAt(0);case "char.IsWhiteSpace":return /\s/.test(chs(x));case "char.IsLetterOrDigit":return /[\p{L}\p{Nd}]/u.test(chs(x));
    case "Math.Abs":return typeof x==="bigint"?(x<0n?L64(-x):x):Math.abs(x);case "char.GetNumericValue":return x>=48&&x<=57?x-48:-1;
    case "Convert.ToInt32":return typeof x==="string"?this.parseNum(x,"int"):typeof x==="bigint"?Number(BigInt.asIntN(32,x)):Number.isInteger(x)?x:roundEven(x)|0;
    case "Convert.ToInt64":return typeof x==="string"?this.parseNum(x,"long"):typeof x==="bigint"?x:BigInt(roundEven(x));case "Convert.ToDouble":return typeof x==="string"?this.parseNum(x,"double"):Number(x)}
    throw new Error(n)}
  parseNum(s,t){if(s===null||s===undefined)throw EXC("System.ArgumentNullException","Value cannot be null. (Parameter 's')");this.cost+=s.length>>4;
    const T=s.replace(/^[\s]+|[\s]+$/g,"");
    if(t==="double"){if(!/^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/.test(T)&&!/^[+-]?(Infinity|∞|NaN)$/.test(T))throw EXC("System.FormatException",`The input string '${s}' was not in a correct format.`);return parseFloat(T)}
    if(!/^[+-]?\d+$/.test(T))throw EXC("System.FormatException",`The input string '${s}' was not in a correct format.`);
    const b=BigInt(T);if(t==="int"){if(b>2147483647n||b<-2147483648n)throw EXC("System.OverflowException","Value was either too large or too small for an Int32.");return Number(b)}
    if(b>9223372036854775807n||b<-9223372036854775808n)throw EXC("System.OverflowException","Value was either too large or too small for an Int64.");return b}
  cellOf(o,i){let c=this.cells.get(o);if(!c){c=[];this.cells.set(o,c)}while(c.length<=i)c.push({o,i:c.length});return c[i]}
  /* phần lẻ của số bước (so sánh khi sắp xếp, tìm nhị phân…) được gộp lại để số bước luôn là số nguyên */
  tick(f){this.fc=(this.fc||0)+f;if(this.fc>=1){const w=Math.floor(this.fc);this.cost+=w;this.fc-=w}}
  nullChk(o){if(o===null||o===undefined)throw EXC("System.NullReferenceException","Object reference not set to an instance of an object.")}
  /* ---- biểu thức ---- */
  argVal(x,fr){if(x.k==="lambda")return{k:"fn",lam:x,fr};if(x.mgs)return{k:"mgs",name:x.mgs};if(x.mgFn)return{k:"mgfn",m:x.mgFn,fr:this.walk(fr,x.hops)};if(x.k==="out")return{out:x};return this.ev(x,fr)}
  isSt(e){if(e.isStatic===undefined)e.isStatic=e.f.k==="member"&&String(e.f.o.ty).startsWith("type:");return e.isStatic}
  ev(e,fr){if(e.gc)return this.drain(this.evg(e,fr));const v=this.ev0(e,fr);return e.cv?conv(v,e.ty,e.cv):v}
  *evg(e,fr){if(!e.gc)return this.ev(e,fr);const v=yield* this.evg0(e,fr);return e.cv?conv(v,e.ty,e.cv):v}
  ev0(e,fr){
    switch(e.k){
      case "num":return e.cval!==undefined?e.cval:(e.cval=e.ty==="long"?BigInt.asIntN(64,BigInt(e.v)):e.ty==="double"?e.v:Number(e.v));
      case "str":case "chr":case "bool":return e.v;
      case "null":return null;
      case "default":return defOf(e.t);
      case "istr":return this.istr(e,e.parts.map(x=>x.e?this.ev(x.e,fr):null));
      case "id":{const b=e.bind;if(!b)return null;if(b.kind==="local")return this.getVar(fr,e);if(b.kind==="static")return this.sv.get(e.name);return null}
      case "member":return this.memGet(e,e.lib&&e.lib.startsWith("sf:")?null:this.ev(e.o,fr));
      case "index":{const o=this.ev(e.o,fr);return this.idxGet(e,o,this.ev(e.i,fr))}
      case "call":{const recv=this.isSt(e)?null:this.ev(e.f.o,fr);const A=e.a.map(x=>this.argVal(x,fr));return this.lib(e,recv,A,fr)}
      case "new":return this.newObj(e,e.a.map(x=>this.ev(x,fr)),e.init?e.init.map(x=>x.kv?x.kv.map(y=>this.ev(y,fr)):this.ev(x,fr)):null);
      case "newarr":return this.newArr(e,e.size?this.ev(e.size,fr):null,e.init?e.init.map(x=>this.ev(x,fr)):null);
      case "un":return this.unop(e,this.ev(e.x,fr));
      case "pre":case "post":{const T=e.x;let o=null,i=null;if(T.k==="index"){o=this.ev(T.o,fr);i=this.ev(T.i,fr)}return this.incr(e,T,fr,o,i)}
      case "bin":{const op=e.op;
        if(op==="&&")return this.ev(e.a,fr)&&this.ev(e.b,fr);
        if(op==="||")return this.ev(e.a,fr)||this.ev(e.b,fr);
        if(op==="??"){const a=this.ev(e.a,fr);return a!==null&&a!==undefined?a:this.ev(e.b,fr)}
        const a=this.ev(e.a,fr);return this.binop(e,a,this.ev(e.b,fr))}
      case "assign":{const T=e.t;let o=null,i=null;if(T.k==="index"){o=this.ev(T.o,fr);i=this.ev(T.i,fr)}
        if(e.op==="="){const v=this.ev(e.v,fr);this.store(T,fr,o,i,v);return v}
        const cur=this.load(T,fr,o,i);const r=this.compound(e,cur,this.ev(e.v,fr));this.store(T,fr,o,i,r);return r}
      case "cond":return this.ev(e.c,fr)?this.ev(e.a,fr):this.ev(e.b,fr);
      case "cast":return this.cast(e,this.ev(e.x,fr));
      case "tswap":{const loc=e.ts.map(T=>T.k==="index"?[this.ev(T.o,fr),this.ev(T.i,fr)]:[null,null]);const vs=e.vs.map(v=>this.ev(v,fr));e.ts.forEach((T,i)=>this.store(T,fr,loc[i][0],loc[i][1],vs[i]));return}
      case "lambda":return{k:"fn",lam:e,fr}}
    throw new Error("biểu thức "+e.k)}
  *evg0(e,fr){
    switch(e.k){
      case "istr":{const vs=[];for(const x of e.parts)vs.push(x.e?yield* this.evg(x.e,fr):null);return this.istr(e,vs)}
      case "member":return this.memGet(e,yield* this.evg(e.o,fr));
      case "index":{const o=yield* this.evg(e.o,fr);const i=yield* this.evg(e.i,fr);return this.idxGet(e,o,i)}
      case "call":{
        if(e.fn){const A=[];for(const x of e.a)A.push(x.gc&&!x.mgFn?yield* this.evg(x,fr):this.argVal(x,fr));
          if(e.defs)e.defs.forEach((d,k)=>A.push(conv(this.ev(d,fr),d.ty,e.fn.ps[e.a.length+k].t)));
          return yield* this.callUser(e.fn,A,fr,e.hops)}
        if(e.callVar){const fv=this.getVar(fr,e.f);const A=[];for(const x of e.a)A.push(yield* this.evg(x,fr));return this.invoke(fv,A)}
        if(e.lib==="Console.ReadLine"){while(this.needInput())yield NEED;return this.readLine()}
        const recv=this.isSt(e)?null:yield* this.evg(e.f.o,fr);const A=[];for(const x of e.a)A.push(x.gc&&!x.mgFn?yield* this.evg(x,fr):this.argVal(x,fr));return this.lib(e,recv,A,fr)}
      case "new":{const A=[];for(const x of e.a)A.push(yield* this.evg(x,fr));let I=null;
        if(e.init){I=[];for(const x of e.init){if(x.kv){const kv=[];for(const y of x.kv)kv.push(yield* this.evg(y,fr));I.push(kv)}else I.push(yield* this.evg(x,fr))}}return this.newObj(e,A,I)}
      case "newarr":{const n=e.size?yield* this.evg(e.size,fr):null;let I=null;if(e.init){I=[];for(const x of e.init)I.push(yield* this.evg(x,fr))}return this.newArr(e,n,I)}
      case "un":return this.unop(e,yield* this.evg(e.x,fr));
      case "pre":case "post":{const T=e.x;let o=null,i=null;if(T.k==="index"){o=yield* this.evg(T.o,fr);i=yield* this.evg(T.i,fr)}return this.incr(e,T,fr,o,i)}
      case "bin":{const op=e.op;
        if(op==="&&")return (yield* this.evg(e.a,fr))&&(yield* this.evg(e.b,fr));
        if(op==="||")return (yield* this.evg(e.a,fr))||(yield* this.evg(e.b,fr));
        if(op==="??"){const a=yield* this.evg(e.a,fr);return a!==null&&a!==undefined?a:(yield* this.evg(e.b,fr))}
        const a=yield* this.evg(e.a,fr);const b=yield* this.evg(e.b,fr);return this.binop(e,a,b)}
      case "assign":{const T=e.t;let o=null,i=null;if(T.k==="index"){o=yield* this.evg(T.o,fr);i=yield* this.evg(T.i,fr)}
        if(e.op==="="){const v=yield* this.evg(e.v,fr);this.store(T,fr,o,i,v);return v}
        const cur=this.load(T,fr,o,i);const v=yield* this.evg(e.v,fr);const r=this.compound(e,cur,v);this.store(T,fr,o,i,r);return r}
      case "cond":{const c=yield* this.evg(e.c,fr);return c?(yield* this.evg(e.a,fr)):(yield* this.evg(e.b,fr))}
      case "cast":return this.cast(e,yield* this.evg(e.x,fr));
      case "tswap":{const loc=[];for(const T of e.ts)loc.push(T.k==="index"?[yield* this.evg(T.o,fr),yield* this.evg(T.i,fr)]:[null,null]);const vs=[];for(const v of e.vs)vs.push(yield* this.evg(v,fr));e.ts.forEach((T,i)=>this.store(T,fr,loc[i][0],loc[i][1],vs[i]));return}}
    return this.ev0(e,fr)}
  /* ---- đọc / ghi một chỗ chứa (biến, phần tử) ---- */
  load(T,fr,o,i){if(T.k==="id")return T.bind.kind==="static"?this.sv.get(T.name):this.getVar(fr,T);return this.idxGet(T,o,i)}
  store(T,fr,o,i,v){if(T.k==="id"){if(T.bind.kind==="static"){this.sv.set(T.name,v);if(this.snap)this.stStore=T.name}else this.setVar(fr,T.name,T.bind.hops,v);return}this.idxSet(T,o,i,v)}
  setOut(x,v,fr){let f=this.walk(fr,x.bind.hops);f.vars.set(x.name,v);if(x.t)f.tys.set(x.name,x.ty);if(this.snap&&f===this.f)this.stores.push(x.name)}
  incr(e,T,fr,o,i){const t=T.ty;const cur=this.load(T,fr,o,i);const d=e.op==="++"?1:-1;
    const nv=t==="int"?(cur+d)|0:t==="long"?L64(cur+BigInt(d)):t==="char"?(cur+d)&0xFFFF:cur+d;
    this.store(T,fr,o,i,nv);return e.k==="pre"?nv:cur}
  compound(e,cur,v){const op=e.op.slice(0,-1),tt=e.t.ty,r=e.opT;
    if(r==="string")return (cur===null?"":cur)+fmtVal(v,e.v.ty);
    if(r==="bool")return op==="&"?(cur&&v):op==="|"?(cur||v):cur!==v;
    return conv(arith(op,conv(cur,tt,r),v,r),r,tt)}
  binop(e,a,b){const op=e.op,r=e.opT;
    if(r==="string"){if(op==="+")return fmtVal(a,e.a.ty)+fmtVal(b,e.b.ty);return op==="=="?a===b:a!==b}
    switch(op){case "==":return a===b;case "!=":return a!==b;case "<":return a<b;case ">":return a>b;case "<=":return a<=b;case ">=":return a>=b}
    if(r==="bool")return op==="&"?(a&&b):op==="|"?(a||b):a!==b;
    return arith(op,a,b,r)}
  unop(e,x){switch(e.op){case "!":return !x;case "+":return x;
    case "-":return e.ty==="int"?(-x)|0:e.ty==="long"?L64(-x):-x;
    case "~":return e.ty==="long"?L64(~x):~x}}
  cast(e,v){return conv(v,e.x.ty,e.t)}
  memGet(e,o){const L=e.lib;if(L&&L.startsWith("sf:"))return SF[L.slice(3)];this.nullChk(o);
    switch(L){case "len":return typeof o==="string"?o.length:o.k==="sb"?o.s.length:o.a.length;
      case "count":return cnt(o);
      case "keys":return{k:"keys",d:o,t:e.ty,el:o.kt};case "vals":return{k:"vals",d:o,t:e.ty,el:o.vt};
      case "kvk":return o.key;case "kvv":return o.val}
    throw new Error("thành phần "+e.name)}
  idxGet(e,o,i){this.nullChk(o);
    switch(e.kind){
      case "arr":if(i<0||i>=o.a.length)throw EXC("System.IndexOutOfRangeException","Index was outside the bounds of the array.");if(this.snap)this.rd.add(this.cellOf(o,i));return o.a[i];
      case "str":if(i<0||i>=o.length)throw EXC("System.IndexOutOfRangeException","Index was outside the bounds of the array.");return o.charCodeAt(i);
      case "sb":if(i<0||i>=o.s.length)throw EXC("System.IndexOutOfRangeException","Index was outside the bounds of the array.");return o.s.charCodeAt(i);
      case "list":if(i<0||i>=o.a.length)throw AOOR();if(this.snap)this.rd.add(this.cellOf(o,i));return o.a[i];
      case "dict":{if(i===null)throw EXC("System.ArgumentNullException","Value cannot be null. (Parameter 'key')");const j=o.idx.get(i);if(j===undefined)throw EXC("System.Collections.Generic.KeyNotFoundException",`The given key '${fmtVal(i,o.kt)}' was not present in the dictionary.`);return o.ent[j].val}}
    throw new Error("chỉ số "+e.kind)}
  idxSet(e,o,i,v){this.nullChk(o);
    switch(e.kind){
      case "arr":if(i<0||i>=o.a.length)throw EXC("System.IndexOutOfRangeException","Index was outside the bounds of the array.");o.a[i]=v;break;
      case "list":if(i<0||i>=o.a.length)throw AOOR();o.a[i]=v;o.ver++;break;
      case "sb":if(i<0||i>=o.s.length)throw AOOR();o.s=o.s.slice(0,i)+chs(v)+o.s.slice(i+1);break;
      case "dict":if(i===null)throw EXC("System.ArgumentNullException","Value cannot be null. (Parameter 'key')");dPut(o,i,v);break;
      default:throw new Error("gán chỉ số "+e.kind)}
    if(this.snap){this.mut.add(o);if(e.kind==="arr"||e.kind==="list")this.wr.add(this.cellOf(o,i))}}
  istr(e,vs){let s="";e.parts.forEach((x,k)=>{if(x.s!==undefined){s+=x.s;return}let t=fmtAny(vs[k],x.e.ty,x.fmt);if(x.align)t=x.align>0?t.padStart(x.align):t.padEnd(-x.align);s+=t});return s}
  sortCmp(fv,el){if(fv){return (x,y)=>{const r=this.invoke(fv,[x,y]);return typeof r==="bigint"?Number(r):r}}const c=cmpT(el);return (x,y)=>{this.tick(0.125);return c(x,y)}}
  pred(fv){return x=>this.invoke(fv,[x])}
  /* ---- thư viện ---- */
  write2(v,t){if(t==="char[]"&&v)return v.a.map(chs).join("");return fmtVal(v,t)}
  lib(e,o,A,fr){const L=e.lib,ty=x=>e.a[x].ty;const self=this;
    const elT=t=>{const g=gen(t);return g?g.a[0]:isArr(t)?elemOf(t):null};
    const src=()=>{if(o===null||o===undefined)throw EXC("System.ArgumentNullException","Value cannot be null. (Parameter 'source')");const v=seqVals(o);this.cost+=v.length>>4;return v};
    const muts=()=>{if(this.snap)this.mut.add(o)};
    switch(L){
      /* Console */
      case "Console.WriteLine":this.write((A.length?this.write2(A[0],ty(0)):"")+"\n");return;
      case "Console.Write":this.write(this.write2(A[0],ty(0)));return;
      case "Console.WriteLineF":this.write(composite(A[0],A.slice(1),e.a.slice(1).map(x=>x.ty))+"\n");return;
      case "Console.WriteF":this.write(composite(A[0],A.slice(1),e.a.slice(1).map(x=>x.ty)));return;
      case "Console.ReadLine":return this.readLine();
      /* Math */
      case "Math.Max":return e.rt==="double"?Math.max(A[0],A[1]):A[0]>A[1]?A[0]:A[1];
      case "Math.Min":return e.rt==="double"?Math.min(A[0],A[1]):A[0]<A[1]?A[0]:A[1];
      case "Math.Abs":{const x=A[0];if(e.rt==="int"){if(x===-2147483648)throw EXC("System.OverflowException","Negating the minimum value of a twos complement number is invalid.");return Math.abs(x)}
        if(e.rt==="long"){if(x===-9223372036854775808n)throw EXC("System.OverflowException","Negating the minimum value of a twos complement number is invalid.");return x<0n?-x:x}return Math.abs(x)}
      case "Math.Sign":{const x=A[0];if(e.at==="double"&&Number.isNaN(x))throw EXC("System.ArithmeticException","Function does not accept floating point Not-a-Number values.");return x>0||x>0n?1:x<0||x<0n?-1:0}
      case "Math.Sqrt":return Math.sqrt(A[0]);case "Math.Floor":return Math.floor(A[0]);case "Math.Ceiling":return Math.ceil(A[0]);case "Math.Truncate":return Math.trunc(A[0]);
      case "Math.Log10":return Math.log10(A[0]);case "Math.Log2":return Math.log2(A[0]);case "Math.Exp":return Math.exp(A[0]);case "Math.Cbrt":return Math.cbrt(A[0]);
      case "Math.Sin":return Math.sin(A[0]);case "Math.Cos":return Math.cos(A[0]);case "Math.Tan":return Math.tan(A[0]);case "Math.Atan":return Math.atan(A[0]);case "Math.Asin":return Math.asin(A[0]);case "Math.Acos":return Math.acos(A[0]);
      case "Math.Log":return A.length>1?Math.log(A[0])/Math.log(A[1]):Math.log(A[0]);
      case "Math.Pow":return A[1]===0?1:A[0]===1?1:Math.pow(A[0],A[1]);case "Math.Atan2":return Math.atan2(A[0],A[1]);
      case "Math.Round":{if(A.length<2)return roundEven(A[0]);const d=A[1];if(d<0||d>15)throw EXC("System.ArgumentOutOfRangeException","Rounding digits must be between 0 and 15, inclusive. (Parameter 'digits')");const x=A[0];if(Math.abs(x)<1e16){const p=10**d;return roundEven(x*p)/p}return x}
      case "Math.Clamp":{const[v,a,b]=A;if(a>b)throw EXC("System.ArgumentException",`'${fmtVal(a,e.rt)}' cannot be greater than ${fmtVal(b,e.rt)}.`);return v<a?a:v>b?b:v}
      /* đổi kiểu */
      case "int.Parse":return this.parseNum(A[0],"int");case "long.Parse":return this.parseNum(A[0],"long");case "double.Parse":return this.parseNum(A[0],"double");
      case "int.TryParse":case "long.TryParse":case "double.TryParse":{const t=L.split(".")[0];let v=defOf(t),ok=true;try{if(A[0]===null)throw 0;v=this.parseNum(A[0],t)}catch(x){if(x instanceof CsExc||x===0){ok=false;v=defOf(t)}else throw x}this.setOut(A[1].out,v,fr);return ok}
      case "double.IsNaN":return Number.isNaN(A[0]);case "double.IsInfinity":return A[0]===Infinity||A[0]===-Infinity;
      case "char.IsDigit":case "char.IsLetter":case "char.IsUpper":case "char.IsLower":case "char.ToUpper":case "char.ToLower":case "char.IsWhiteSpace":case "char.IsLetterOrDigit":case "char.GetNumericValue":return this.mgs(L,A[0]);
      case "char.IsPunctuation":return /\p{P}/u.test(chs(A[0]));
      case "Convert.ToInt32":case "Convert.ToInt64":{const t=L==="Convert.ToInt32"?"int":"long";const x=A[0],at=e.at;
        if(at==="string")return x===null?defOf(t):this.parseNum(x,t);if(at==="bool")return t==="int"?(x?1:0):(x?1n:0n);
        if(at==="double"){const r=roundEven(x);if(!isFinite(r)||(t==="int"?(r>2147483647||r<-2147483648):(r>=9223372036854775808||r<-9223372036854775808)))throw EXC("System.OverflowException",`Value was either too large or too small for an ${t==="int"?"Int32":"Int64"}.`);return t==="int"?r|0:BigInt(r)}
        if(at==="long"&&t==="int"){if(x>2147483647n||x<-2147483648n)throw EXC("System.OverflowException","Value was either too large or too small for an Int32.");return Number(x)}
        return conv(x,at,t)}
      case "Convert.ToDouble":{const x=A[0],at=e.at;if(at==="string")return x===null?0:this.parseNum(x,"double");if(at==="bool")return x?1:0;return conv(x,at,"double")}
      case "Convert.ToString":{const x=A[0];if(A.length<2)return fmtVal(x,e.at);const b=A[1];if(![2,8,10,16].includes(b))throw EXC("System.ArgumentException","Invalid Base.");
        if(e.at==="long")return b===10?x.toString():BigInt.asUintN(64,x).toString(b);if(b===10)return String(x);return (x>>>0).toString(b)}
      case "Convert.ToChar":{const x=A[0];if(x<0||x>65535)throw EXC("System.OverflowException","Value was either too large or too small for a character.");return x}
      /* chuỗi tĩnh */
      case "string.Join":{const sep=sepStr(A[0],ty(0));if(A[1]===null)throw EXC("System.ArgumentNullException","Value cannot be null. (Parameter 'values')");const v=seqVals(A[1]);this.cost+=v.length>>3;return v.map(x=>fmtVal(x,e.jt)).join(sep)}
      case "string.JoinArgs":{const sep=sepStr(A[0],ty(0));return A.slice(1).map((x,k)=>fmtVal(x,e.jts[k])).join(sep)}
      case "string.IsNullOrEmpty":return A[0]===null||A[0]==="";
      case "string.IsNullOrWhiteSpace":return A[0]===null||WS_ALL.test(A[0]);
      case "string.Concat":return A.map((x,k)=>fmtVal(x,e.jts[k])).join("");
      case "string.Compare":{const[a,b]=A;if(a===b)return 0;if(a===null)return -1;if(b===null)return 1;return ordStr(a,b)}
      case "string.CompareOrdinal":{const[a,b]=A;if(a===b)return 0;if(a===null)return -1;if(b===null)return 1;const n=Math.min(a.length,b.length);for(let i=0;i<n;i++)if(a[i]!==b[i])return a.charCodeAt(i)-b.charCodeAt(i);return a.length-b.length}
      case "string.Format":return composite(A[0],A.slice(1),e.a.slice(1).map(x=>x.ty));
      /* Array */
      case "Array.Sort":{const a=A[0];this.nullChk(a);let lo=0,n=a.a.length;if(e.range){lo=A[1];n=A[2];if(lo<0||n<0)throw EXC("System.ArgumentOutOfRangeException",`Non-negative number required. (Parameter '${lo<0?"index":"length"}')`);if(lo+n>a.a.length)throw EXC("System.ArgumentException","Offset and length were out of bounds for the array or count is greater than the number of elements from index to the end of the source collection.")}
        introSort(a.a,lo,n,this.sortCmp(e.cmp?A[1]:null,e.el));if(this.snap)this.mut.add(a);return}
      case "Array.Reverse":{const a=A[0];this.nullChk(a);let lo=0,n=a.a.length;if(e.range){lo=A[1];n=A[2];if(lo<0||n<0||lo+n>a.a.length)throw EXC("System.ArgumentException","Offset and length were out of bounds for the array or count is greater than the number of elements from index to the end of the source collection.")}
        const seg=a.a.slice(lo,lo+n).reverse();for(let k=0;k<n;k++)a.a[lo+k]=seg[k];this.cost+=n>>3;if(this.snap)this.mut.add(a);return}
      case "Array.Fill":{const a=A[0];this.nullChk(a);a.a.fill(A[1]);this.cost+=a.a.length>>3;if(this.snap)this.mut.add(a);return}
      case "Array.IndexOf":{const a=A[0];this.nullChk(a);this.cost+=a.a.length>>3;return a.a.indexOf(A[1])}
      case "Array.LastIndexOf":{const a=A[0];this.nullChk(a);this.cost+=a.a.length>>3;return a.a.lastIndexOf(A[1])}
      case "Array.BinarySearch":{const a=A[0];this.nullChk(a);const c=cmpT(a.el);let lo=0,hi=a.a.length-1;while(lo<=hi){const m=lo+((hi-lo)>>1);const r=c(a.a[m],A[1]);this.tick(0.25);if(r===0)return m;if(r<0)lo=m+1;else hi=m-1}return ~lo}
      case "Array.Exists":{const a=A[0];this.nullChk(a);const p=this.pred(A[1]);return a.a.some(p)}
      case "Array.TrueForAll":{const a=A[0];this.nullChk(a);const p=this.pred(A[1]);return a.a.every(p)}
      case "Array.ConvertAll":{const a=A[0];this.nullChk(a);const p=this.pred(A[1]);return mkArr(e.el,a.a.map(p))}
      case "Array.Copy":{let s,si,d,di,n;if(A.length===3){[s,d,n]=A;si=0;di=0}else[s,si,d,di,n]=A;this.nullChk(s);this.nullChk(d);
        if(n<0)throw EXC("System.ArgumentOutOfRangeException","Non-negative number required. (Parameter 'length')");
        if(si<0||di<0)throw EXC("System.ArgumentOutOfRangeException",`Non-negative number required. (Parameter '${si<0?"sourceIndex":"destinationIndex"}')`);
        if(si+n>s.a.length)throw EXC("System.ArgumentException","Source array was not long enough. Check the source index, length, and the array's lower bounds. (Parameter 'sourceArray')");
        if(di+n>d.a.length)throw EXC("System.ArgumentException","Destination array was not long enough. Check the destination index, length, and the array's lower bounds. (Parameter 'destinationArray')");
        const seg=s.a.slice(si,si+n);for(let k=0;k<n;k++)d.a[di+k]=seg[k];this.cost+=n>>3;if(this.snap)this.mut.add(d);return}
      case "Array.Clear":{const a=A[0];this.nullChk(a);const lo=A.length>1?A[1]:0,n=A.length>1?A[2]:a.a.length;if(lo<0||n<0||lo+n>a.a.length)throw EXC("System.IndexOutOfRangeException","Index was outside the bounds of the array.");const z=defOf(a.el);for(let k=lo;k<lo+n;k++)a.a[k]=z;if(this.snap)this.mut.add(a);return}
      case "Enumerable.Range":{const[s,n]=A;if(n<0||s+n-1>2147483647)throw EXC("System.ArgumentOutOfRangeException","Specified argument was out of the range of valid values. (Parameter 'count')");if(n>20000000)throw MEM();const a=new Array(n);for(let k=0;k<n;k++)a[k]=s+k;this.cost+=n>>3;return mkSeq("int",a)}
      case "Enumerable.Repeat":{const[x,n]=A;if(n<0)throw EXC("System.ArgumentOutOfRangeException","Specified argument was out of the range of valid values. (Parameter 'count')");if(n>20000000)throw MEM();this.cost+=n>>3;return mkSeq(ty(0),new Array(n).fill(x))}
      case "Environment.Exit":throw{exitCode:A[0]}}
    /* ---- phương thức của đối tượng ---- */
    if(L==="toString"){if(o===null)this.nullChk(o);return A.length?fmtAny(o,e.recv,A[0]):fmtVal(o,e.recv)}
    if(L==="equals")return o===A[0];
    if(L==="clone"){this.nullChk(o);this.cost+=o.a.length>>3;return mkArr(o.el,o.a.slice())}
    if(L==="compareTo"){const c=cmpT(e.recv);if(e.recv==="string"&&A[0]===null)return 1;return c(o,A[0])}
    this.nullChk(o);
    const s=o;
    switch(L){
      case "s.Substring":{const i=A[0];if(A.length===1){if(i<0)throw EXC("System.ArgumentOutOfRangeException","StartIndex cannot be less than zero. (Parameter 'startIndex')");if(i>s.length)throw EXC("System.ArgumentOutOfRangeException","startIndex cannot be larger than length of string. (Parameter 'startIndex')");return s.slice(i)}
        const n=A[1];if(i<0)throw EXC("System.ArgumentOutOfRangeException","StartIndex cannot be less than zero. (Parameter 'startIndex')");if(i>s.length)throw EXC("System.ArgumentOutOfRangeException","startIndex cannot be larger than length of string. (Parameter 'startIndex')");if(n<0)throw EXC("System.ArgumentOutOfRangeException","Length cannot be less than zero. (Parameter 'length')");if(i+n>s.length)throw EXC("System.ArgumentOutOfRangeException","Index and length must refer to a location within the string. (Parameter 'length')");this.cost+=n>>5;return s.substr(i,n)}
      case "s.IndexOf":{const x=ty(0)==="char"?chs(A[0]):A[0];const st=A.length>1?A[1]:0;if(st<0||st>s.length)throw EXC("System.ArgumentOutOfRangeException","Index was out of range. Must be non-negative and less than or equal to the size of the collection. (Parameter 'startIndex')");this.cost+=s.length>>5;return s.indexOf(x,st)}
      case "s.LastIndexOf":{const x=ty(0)==="char"?chs(A[0]):A[0];this.cost+=s.length>>5;if(A.length<2)return s.lastIndexOf(x);const st=A[1];if(st<0||st>=s.length&&s.length)throw EXC("System.ArgumentOutOfRangeException","Index was out of range. Must be non-negative and less than the size of the collection. (Parameter 'startIndex')");return s.lastIndexOf(x,st-x.length+1)}
      case "s.Contains":{this.cost+=s.length>>5;return s.includes(ty(0)==="char"?chs(A[0]):A[0])}
      case "s.StartsWith":return s.startsWith(ty(0)==="char"?chs(A[0]):A[0]);
      case "s.EndsWith":return s.endsWith(ty(0)==="char"?chs(A[0]):A[0]);
      case "s.Split":{this.cost+=s.length>>4;let seps=null,opt=0;
        if(A.length){const t0=ty(0);if(t0==="char")seps=[chs(A[0])];else if(t0==="string")seps=A[0]===null||A[0]===""?[]:[A[0]];else seps=A[0]?A[0].a.map(chs):null;if(seps&&!seps.length&&t0!=="string")seps=null;if(A.length>1)opt=A[1]}
        let parts;if(seps===null)parts=s.split(WS_ONE);else if(!seps.length)parts=[s];else if(seps.length===1)parts=s.split(seps[0]);else parts=s.split(new RegExp("["+seps.map(c=>c.replace(/[\]\\^-]/g,"\\$&")).join("")+"]"));
        if(opt&2)parts=parts.map(p=>p.replace(WS_TRIM,""));if(opt&1)parts=parts.filter(p=>p!=="");return mkArr("string",parts)}
      case "s.Trim":case "s.TrimStart":case "s.TrimEnd":{let r=s;const c=A.length?chs(A[0]):null;const st=L!=="s.TrimEnd",en=L!=="s.TrimStart";
        if(c===null){if(st)r=r.replace(WS_L,"");if(en)r=r.replace(WS_R,"")}else{let a=0,b=r.length;if(st)while(a<b&&r[a]===c)a++;if(en)while(b>a&&r[b-1]===c)b--;r=r.slice(a,b)}return r}
      case "s.ToUpper":return s.toUpperCase();case "s.ToLower":return s.toLowerCase();
      case "s.Replace":{if(ty(0)==="char")return s.split(chs(A[0])).join(chs(A[1]));if(A[0]===null)throw EXC("System.ArgumentNullException","Value cannot be null. (Parameter 'oldValue')");if(A[0]==="")throw EXC("System.ArgumentException","The value cannot be an empty string. (Parameter 'oldValue')");this.cost+=s.length>>4;return s.split(A[0]).join(A[1]===null?"":A[1])}
      case "s.ToCharArray":{this.cost+=s.length>>4;const a=new Array(s.length);for(let k=0;k<s.length;k++)a[k]=s.charCodeAt(k);return mkArr("char",a)}
      case "s.PadLeft":case "s.PadRight":{const n=A[0];if(n<0)throw EXC("System.ArgumentOutOfRangeException","Non-negative number required. (Parameter 'totalWidth')");const c=A.length>1?chs(A[1]):" ";return L==="s.PadLeft"?s.padStart(n,c):s.padEnd(n,c)}
      case "s.Insert":{const i=A[0];if(i<0||i>s.length)throw EXC("System.ArgumentOutOfRangeException","Index was out of range. Must be non-negative and less than or equal to the size of the collection. (Parameter 'startIndex')");if(A[1]===null)throw EXC("System.ArgumentNullException","Value cannot be null. (Parameter 'value')");return s.slice(0,i)+A[1]+s.slice(i)}
      case "s.Remove":{const i=A[0];if(A.length===1){if(i<0)throw EXC("System.ArgumentOutOfRangeException","StartIndex cannot be less than zero. (Parameter 'startIndex')");if(i>=s.length)throw EXC("System.ArgumentOutOfRangeException","startIndex must be less than length of string. (Parameter 'startIndex')");return s.slice(0,i)}
        const n=A[1];if(i<0)throw EXC("System.ArgumentOutOfRangeException","StartIndex cannot be less than zero. (Parameter 'startIndex')");if(n<0)throw EXC("System.ArgumentOutOfRangeException","Count cannot be less than zero. (Parameter 'count')");if(i+n>s.length)throw EXC("System.ArgumentOutOfRangeException","Index and count must refer to a location within the string. (Parameter 'count')");return s.slice(0,i)+s.slice(i+n)}
      /* StringBuilder */
      case "sb.Append":{const t=this.write2(A[0],e.at);o.s+=t;this.cost+=t.length>>6;muts();return o}
      case "sb.AppendLine":o.s+=(A.length?this.write2(A[0],e.at):"")+"\n";muts();return o;
      case "sb.Insert":{const i=A[0];if(i<0||i>o.s.length)throw AOOR();o.s=o.s.slice(0,i)+this.write2(A[1],e.at)+o.s.slice(i);this.cost+=o.s.length>>6;muts();return o}
      case "sb.Remove":{const[i,n]=A;if(i<0||n<0||i+n>o.s.length)throw EXC("System.ArgumentOutOfRangeException","Index was out of range. Must be non-negative and less than the size of the collection. (Parameter 'startIndex')");o.s=o.s.slice(0,i)+o.s.slice(i+n);this.cost+=o.s.length>>6;muts();return o}
      case "sb.Clear":o.s="";muts();return o;
      /* List */
      case "l.Add":o.a.push(A[0]);o.ver++;if(this.snap){this.mut.add(o);this.wr.add(this.cellOf(o,o.a.length-1))}return;
      case "l.AddRange":{const v=seqVals(A[0]);if(!v)throw EXC("System.ArgumentNullException","Value cannot be null. (Parameter 'collection')");for(const x of v.slice())o.a.push(x);o.ver++;this.cost+=v.length>>3;muts();return}
      case "l.Insert":{const i=A[0];if(i<0||i>o.a.length)throw EXC("System.ArgumentOutOfRangeException","Index must be within the bounds of the List. (Parameter 'index')");o.a.splice(i,0,A[1]);o.ver++;this.cost+=(o.a.length-i)>>4;if(this.snap){this.mut.add(o);this.wr.add(this.cellOf(o,i))}return}
      case "l.RemoveAt":{const i=A[0];if(i<0||i>=o.a.length)throw AOOR();o.a.splice(i,1);o.ver++;this.cost+=(o.a.length-i)>>4;muts();return}
      case "l.RemoveRange":{const[i,n]=A;if(i<0||n<0)throw EXC("System.ArgumentOutOfRangeException",`Non-negative number required. (Parameter '${i<0?"index":"count"}')`);if(i+n>o.a.length)throw EXC("System.ArgumentException","Offset and length were out of bounds for the array or count is greater than the number of elements from index to the end of the source collection.");o.a.splice(i,n);o.ver++;muts();return}
      case "l.Remove":{const i=o.a.indexOf(A[0]);this.cost+=o.a.length>>3;if(i<0)return false;o.a.splice(i,1);o.ver++;muts();return true}
      case "l.RemoveAll":{const p=this.pred(A[0]);const n0=o.a.length;o.a=o.a.filter(x=>!p(x));const r=n0-o.a.length;if(r)o.ver++;muts();return r}
      case "l.Contains":this.cost+=o.a.length>>3;return o.a.indexOf(A[0])>=0;
      case "l.IndexOf":this.cost+=o.a.length>>3;return o.a.indexOf(A[0]);
      case "l.LastIndexOf":this.cost+=o.a.length>>3;return o.a.lastIndexOf(A[0]);
      case "l.Sort":introSort(o.a,0,o.a.length,this.sortCmp(e.cmp?A[0]:null,e.el));o.ver++;muts();return;
      case "l.Reverse":o.a.reverse();o.ver++;this.cost+=o.a.length>>3;muts();return;
      case "l.Clear":o.a.length=0;o.ver++;muts();return;
      case "l.BinarySearch":{const c=cmpT(o.el);let lo=0,hi=o.a.length-1;while(lo<=hi){const m=lo+((hi-lo)>>1);const r=c(o.a[m],A[0]);this.tick(0.25);if(r===0)return m;if(r<0)lo=m+1;else hi=m-1}return ~lo}
      case "l.GetRange":{const[i,n]=A;if(i<0||n<0)throw EXC("System.ArgumentOutOfRangeException",`Non-negative number required. (Parameter '${i<0?"index":"count"}')`);if(i+n>o.a.length)throw EXC("System.ArgumentException","Offset and length were out of bounds for the array or count is greater than the number of elements from index to the end of the source collection.");this.cost+=n>>3;return mkList(o.el,o.a.slice(i,i+n))}
      case "l.FindIndex":{const p=this.pred(A[0]);return o.a.findIndex(p)}
      case "l.Find":{const p=this.pred(A[0]);const i=o.a.findIndex(p);return i<0?defOf(e.def):o.a[i]}
      case "toArray":{let v;if(o.k==="list")v=o.a.slice();else v=seqVals(o).slice();this.cost+=v.length>>3;return mkArr(elemOf(e.ty),v)}
      /* Dictionary */
      case "d.Add":if(A[0]===null)throw EXC("System.ArgumentNullException","Value cannot be null. (Parameter 'key')");if(o.idx.has(A[0]))throw EXC("System.ArgumentException",`An item with the same key has already been added. Key: ${fmtVal(A[0],o.kt)}`);dPut(o,A[0],A[1]);muts();return;
      case "d.TryAdd":if(o.idx.has(A[0]))return false;dPut(o,A[0],A[1]);muts();return true;
      case "d.ContainsKey":return o.idx.has(A[0]);
      case "d.ContainsValue":this.cost+=o.idx.size>>3;return dEnt(o).some(x=>x.val===A[0]);
      case "d.Remove":{const r=dDel(o,A[0]);if(r)muts();return r}
      case "d.Clear":dClear(o);muts();return;
      case "d.TryGetValue":{const j=o.idx.get(A[0]);this.setOut(A[1].out,j===undefined?defOf(e.vt):o.ent[j].val,fr);return j!==undefined}
      case "d.GetValueOrDefault":{const j=o.idx.get(A[0]);return j===undefined?(A.length>1?A[1]:defOf(e.vt)):o.ent[j].val}
      /* HashSet */
      case "h.Add":{const r=dPut(o,A[0],true);if(r)muts();return r}
      case "h.Remove":{const r=dDel(o,A[0]);if(r)muts();return r}
      case "h.Contains":return o.idx.has(A[0]);
      case "h.Clear":dClear(o);muts();return;
      case "h.UnionWith":{const v=seqVals(A[0]);for(const x of v.slice())dPut(o,x,true);this.cost+=v.length>>3;muts();return}
      case "h.IntersectWith":{const other=new Set(seqVals(A[0]));for(const x of dEnt(o).map(z=>z.key))if(!other.has(x))dDel(o,x);this.cost+=o.idx.size>>3;muts();return}
      case "h.ExceptWith":{const v=seqVals(A[0]);for(const x of v.slice())dDel(o,x);this.cost+=v.length>>3;muts();return}
      /* Stack / Queue */
      case "sq.Add":o.a.push(A[0]);o.ver++;if(this.snap){this.mut.add(o)}return;
      case "sq.Take":case "sq.Peek":{const n=o.k==="stack"?o.a.length:o.a.length-o.h;if(!n)throw EXC("System.InvalidOperationException",o.k==="stack"?"Stack empty.":"Queue empty.");
        if(L==="sq.Peek")return o.k==="stack"?o.a[o.a.length-1]:o.a[o.h];
        o.ver++;muts();if(o.k==="stack")return o.a.pop();const v=o.a[o.h++];if(o.h>64&&o.h*2>o.a.length){o.a=o.a.slice(o.h);o.h=0}return v}
      case "sq.TryTake":case "sq.TryPeek":{const n=o.k==="stack"?o.a.length:o.a.length-o.h;if(!n){this.setOut(A[0].out,defOf(elT(o.t)),fr);return false}
        let v;if(L==="sq.TryPeek")v=o.k==="stack"?o.a[o.a.length-1]:o.a[o.h];else{o.ver++;muts();if(o.k==="stack")v=o.a.pop();else{v=o.a[o.h++];if(o.h>64&&o.h*2>o.a.length){o.a=o.a.slice(o.h);o.h=0}}}
        this.setOut(A[0].out,v,fr);return true}
      case "sq.Contains":this.cost+=o.a.length>>3;return o.a.indexOf(A[0],o.k==="queue"?o.h:0)>=0;
      case "sq.Clear":o.a=[];if(o.k==="queue")o.h=0;o.ver++;muts();return;
      /* PriorityQueue (đống 4 nhánh như .NET) */
      case "pq.Enqueue":pqPush(o,A[0],A[1]);this.tick(0.5);muts();return;
      case "pq.Dequeue":if(!o.n)throw EXC("System.InvalidOperationException","Queue empty.");this.tick(0.5);muts();return pqPop(o)[0];
      case "pq.Peek":if(!o.n)throw EXC("System.InvalidOperationException","Queue empty.");return o.h[0][0];
      case "pq.TryDequeue":case "pq.TryPeek":{if(!o.n){this.setOut(A[0].out,defOf(o.et),fr);this.setOut(A[1].out,defOf(o.pt),fr);return false}
        const x=L==="pq.TryPeek"?o.h[0]:pqPop(o);if(L!=="pq.TryPeek")muts();this.setOut(A[0].out,x[0],fr);this.setOut(A[1].out,x[1],fr);return true}
      case "pq.Clear":o.h=[];o.n=0;o.ver++;muts();return}
    if(L&&L.startsWith("q."))return this.linqRun(e,L.slice(2),src(),A,o);
    throw new Error("hàm thư viện "+L)}
  linqRun(e,n,v,A,o){const el=e.el;const rt=()=>{const g=gen(e.ty);return g?g.a[0]:el};const F=A.length&&A[0]&&(A[0].k==="fn"||A[0].k==="mgs"||A[0].k==="mgfn")?this.pred(A[0]):null;
    const none=()=>EXC("System.InvalidOperationException","Sequence contains no elements");
    switch(n){
      case "Select":return mkSeq(rt(),v.map(F));
      case "Where":return mkSeq(el,v.filter(F));
      case "Sum":{const a=F?v.map(F):v;const t=e.st;if(t==="double"){let s=0;for(const x of a)s+=x;return s}
        if(t==="int"){let s=0;for(const x of a){s+=x;if(s>2147483647||s<-2147483648)throw EXC("System.OverflowException","Arithmetic operation resulted in an overflow.")}return s}
        let s=0n;for(const x of a){s+=x;if(s>9223372036854775807n||s<-9223372036854775808n)throw EXC("System.OverflowException","Arithmetic operation resulted in an overflow.")}return s}
      case "Average":{const a=F?v.map(F):v;if(!a.length)throw none();if(e.st==="double"){let s=0;for(const x of a)s+=x;return s/a.length}let s=0n;for(const x of a)s+=BigInt(x);return Number(s)/a.length}
      case "Max":case "Min":{const a=F?v.map(F):v;if(!a.length){if(e.st==="string")return null;throw none()}const c=cmpT(e.st);let b=a[0];for(let k=1;k<a.length;k++){const r=c(a[k],b);if(n==="Max"?r>0:r<0)b=a[k]}
        if(e.st==="double"){if(n==="Min"&&a.some(Number.isNaN))return NaN}return b}
      case "Count":return F?v.filter(F).length:v.length;
      case "Any":return F?v.some(F):v.length>0;
      case "All":return v.every(F);
      case "Contains":return v.indexOf(A[0])>=0;
      case "First":case "FirstOrDefault":{const i=F?v.findIndex(F):(v.length?0:-1);if(i<0){if(n==="First")throw F?EXC("System.InvalidOperationException","Sequence contains no matching element"):none();return defOf(e.def)}return v[i]}
      case "Last":case "LastOrDefault":{let i=-1;if(F){for(let k=v.length-1;k>=0;k--)if(F(v[k])){i=k;break}}else i=v.length-1;if(i<0){if(n==="Last")throw F?EXC("System.InvalidOperationException","Sequence contains no matching element"):none();return defOf(e.def)}return v[i]}
      case "OrderBy":case "OrderByDescending":case "ThenBy":case "ThenByDescending":{const then=n.startsWith("Then");
        const base=then&&o&&o.ord?o.ord.base:v;const ks=(then&&o&&o.ord?o.ord.ks:[]).concat([{f:F,d:n.endsWith("Descending"),c:cmpT(e.kt)}]);
        const keys=ks.map(K=>base.map(x=>K.f(x)));const idx=base.map((x,i)=>i);this.tick(base.length*Math.log2(base.length+1)/8);
        idx.sort((i,j)=>{for(let q=0;q<ks.length;q++){const r=ks[q].c(keys[q][i],keys[q][j]);if(r)return ks[q].d?-r:r}return 0});
        const s=mkSeq(el,idx.map(i=>base[i]));s.ord={base,ks};return s}
      case "ToList":return mkList(el,v.slice());
      case "ToHashSet":{const h=dNew("set",el,null,`HashSet<${el}>`);for(const x of v)dPut(h,x,true);return h}
      case "Distinct":{const seen=new Set(),out=[];for(const x of v)if(!seen.has(x)){seen.add(x);out.push(x)}return mkSeq(el,out)}
      case "Reverse":return mkSeq(el,v.slice().reverse());
      case "Take":return mkSeq(el,v.slice(0,Math.max(0,A[0])));
      case "Skip":return mkSeq(el,v.slice(Math.max(0,A[0])));
      case "Concat":{const w=seqVals(A[0]);if(!w)throw EXC("System.ArgumentNullException","Value cannot be null. (Parameter 'second')");return mkSeq(el,v.concat(w))}
      case "SequenceEqual":{const w=seqVals(A[0]);if(!w)throw EXC("System.ArgumentNullException","Value cannot be null. (Parameter 'second')");return w.length===v.length&&v.every((x,i)=>x===w[i])}
      case "ElementAt":if(A[0]<0||A[0]>=v.length)throw AOOR();return v[A[0]];
      case "Prepend":return mkSeq(el,[A[0]].concat(v));
      case "Append":return mkSeq(el,v.concat([A[0]]))}
    throw new Error("LINQ "+n)}
  /* ---- tạo đối tượng ---- */
  newObj(e,A,I){const g=gen(e.t);
    switch(e.lib){
      case "newList":{if(e.cap&&A[0]<0)throw EXC("System.ArgumentOutOfRangeException","Non-negative number required. (Parameter 'capacity')");const a=e.from?(()=>{const v=seqVals(A[0]);if(!v)throw EXC("System.ArgumentNullException","Value cannot be null. (Parameter 'collection')");return v.slice()})():[];if(I)for(const x of I)a.push(x);this.cost+=a.length>>3;return mkList(g.a[0],a)}
      case "newHashSet":{const h=dNew("set",g.a[0],null,e.t);if(e.from){const v=seqVals(A[0]);if(!v)throw EXC("System.ArgumentNullException","Value cannot be null. (Parameter 'collection')");for(const x of v)dPut(h,x,true);this.cost+=v.length>>3}if(I)for(const x of I)dPut(h,x,true);h.ver=0;return h}
      case "newDictionary":{const d=dNew("dict",g.a[0],g.a[1],e.t);if(I)for(const[k,v]of I){if(d.idx.has(k))throw EXC("System.ArgumentException",`An item with the same key has already been added. Key: ${fmtVal(k,d.kt)}`);dPut(d,k,v)}d.ver=0;return d}
      case "newStack":{const s={k:"stack",a:[],el:g.a[0],t:e.t,ver:0};if(e.from){const v=seqVals(A[0]);for(const x of v)s.a.push(x)}return s}
      case "newQueue":{const q={k:"queue",a:[],h:0,el:g.a[0],t:e.t,ver:0};if(e.from){const v=seqVals(A[0]);for(const x of v)q.a.push(x)}return q}
      case "newPriorityQueue":return{k:"pq",h:[],n:0,et:g.a[0],pt:g.a[1],t:e.t,ver:0,c:cmpT(g.a[1])};
      case "newSB":return{k:"sb",s:A.length&&A[0]!==null?A[0]:"",t:"StringBuilder"};
      case "newStrRep":{if(A[1]<0)throw EXC("System.ArgumentOutOfRangeException","Non-negative number required. (Parameter 'count')");if(A[1]>20000000)throw MEM();return chs(A[0]).repeat(A[1])}
      case "newStrArr":{const a=A[0];if(!a)return "";let s="";for(let k=0;k<a.a.length;k+=8192)s+=String.fromCharCode.apply(null,a.a.slice(k,k+8192));return s}
      case "newExc":{const type=e.t==="KeyNotFoundException"?"System.Collections.Generic.KeyNotFoundException":"System."+e.t;return{k:"exc",type,t:e.t,msg:A.length&&A[0]!==null?A[0]:EXC_DEF[e.t]||`Exception of type '${type}' was thrown.`}}
      case "newKV":return{k:"kvp",key:A[0],val:A[1],kt:g.a[0],vt:g.a[1],t:e.t}}
    throw new Error("new "+e.lib)}
  newArr(e,n,I){const el=e.el;
    if(I){if(e.size&&Number(n)!==I.length){}return mkArr(el,I)}
    n=Number(n);if(n<0)throw EXC("System.OverflowException","Arithmetic operation resulted in an overflow.");if(n>20000000)throw MEM();
    this.cost+=n>>6;return mkArr(el,new Array(n).fill(defOf(el)))}
  /* ---- hình động: trả về đối tượng có dạng giống biến của trình mô phỏng C++ ---- */
  vizLook(n){const f=this.f||this.frames[0];if(!f)return null;let v,t,found=false;
    for(let F=f;F;F=F.up)if(F.vars.has(n)){v=F.vars.get(n);t=F.tys.get(n);found=true;break}
    if(!found&&this.sv.has(n)){v=this.sv.get(n);t=this.st.get(n);found=true}
    if(!found)for(let k=this.frames.length-1;k>=0;k--)if(this.frames[k].vars.has(n)){v=this.frames[k].vars.get(n);t=this.frames[k].tys.get(n);found=true;break}
    if(!found)return null;const V=this.shim(v,t,0);V.w=this.chSet().has(n);return V}
  shim(v,t,depth){
    if(v&&typeof v==="object"&&(v.k==="arr"||v.k==="list")){const a=v.a;if(a.length)this.cellOf(v,a.length-1);const c=(this.cells.get(v)||[]).slice(0,a.length);
      a.forEach((x,i)=>{const cell=c[i];const s=depth<1&&x&&typeof x==="object"&&(x.k==="arr"||x.k==="list")?this.shim(x,v.el,depth+1):null;
        if(s){cell.t="list";cell.v=s.v;cell.txt=null;cell.init=true}else{const et=v.el;cell.t=et==="int"||et==="long"||et==="char"?"int":et==="double"?"double":et==="string"?"pystr":"obj";cell.v=et==="long"?Number(x):et==="double"||et==="int"?x:0;cell.txt=lit(x,et,12);cell.init=true}});
      return{t:"list",v:{a:c},init:true,txt:"["+a.length+"]",len:a.length}}
    if(t==="string")return{t:"string",v:v===null?"":v,init:true,txt:lit(v,t)};
    if(t==="int"||t==="long"||t==="char")return{t:"int",v:Number(v),init:true,txt:lit(v,t)};
    if(t==="double")return{t:"double",v,init:true,txt:lit(v,t)};
    return{t:"obj",v:0,init:true,txt:lit(v,t,40)}}
  /* ---- khung Bộ nhớ ---- */
  memHTML(ch){const frames=this.frames.slice().reverse();if(!frames.length)return "";
    const cnt=new Map();const see=v=>{if(v&&typeof v==="object")cnt.set(v,(cnt.get(v)||0)+1)};frames.forEach(F=>F.vars.forEach(see));this.sv.forEach(see);
    const ids=new Map();let nid=0;const tag=v=>{if(!(cnt.get(v)>1))return "";if(!ids.has(v))ids.set(v,++nid);return ` <small class="py-id" title="Nhiều biến cùng trỏ tới một đối tượng: sửa qua biến này thì biến kia cũng thấy">#${ids.get(v)}</small>`};
    const row=(n,v,t,c)=>{
      if(v&&typeof v==="object"&&(v.k==="arr"||v.k==="list"||v.k==="stack"||v.k==="queue"||v.k==="set")){const a=seqVals(v);
        return `<tr class="${c}"><td><b>${esc(n)}</b></td><td>${esc(t)}</td><td><small class="seq-n">${a.length} phần tử ↓</small>${tag(v)}</td></tr><tr class="seqrow ${c}"><td colspan="3">${this.seqHTML(v)}</td></tr>`}
      return `<tr class="${c}"><td><b>${esc(n)}</b></td><td>${esc(t)}</td><td>${esc(lit(v,t,90))}${tag(v)}</td></tr>`};
    const table=(names,get,top)=>`<table class="py-mem"><thead><tr><th>Tên</th><th>Kiểu</th><th>Giá trị</th></tr></thead><tbody>${names.map(n=>{const[v,t]=get(n);return row(n,v,t,top&&ch&&ch.has(n)?"chg":"")}).join("")}</tbody></table>`;
    const html=frames.map((F,k)=>{const top=k===0;const names=[...F.vars.keys()];
      return `<div class="fr${top?" top":""}"><div class="fr-h"><b>${esc(F.title)}</b><span>${top?(frames.length>1?"đang chạy · đỉnh stack":"đang chạy"):`đang chờ ở dòng ${F.line}`}</span></div>${names.length?table(names,n=>[F.vars.get(n),F.tys.get(n)],top):`<p class="mem-empty">Chưa có biến.</p>`}</div>`}).join("");
    const gl=this.gorder.length?`<div class="fr glob"><div class="fr-h"><b>Biến static</b><span>dùng chung cho mọi hàm</span></div>${table(this.gorder,n=>[this.sv.get(n),this.st.get(n)],false)}</div>`:"";
    return `<div class="stk">${html}${gl}</div>`}
  seqHTML(v){const a=seqVals(v);const L=v.k==="arr"||v.k==="list"?(this.cells.get(v)||[]):[];
    const cls=(i,own)=>{const c=own?L[i]:null;return "ac"+(c&&this.wr.has(c)?" w":"")+(c&&this.rd.has(c)?" r":"")};
    const row=(arr,el,lim,own)=>arr.slice(0,lim).map((x,i)=>`<span class="${cls(i,own)}"><i>${i}</i><b>${esc(lit(x,el,14))}</b></span>`).join("")+(arr.length>lim?`<span class="ac more"><i>…</i><b>+${arr.length-lim}</b></span>`:"");
    if(a.length&&a.every(x=>x&&typeof x==="object"&&(x.k==="arr"||x.k==="list")))return `<span class="mx">${a.slice(0,16).map((r,i)=>{const Lr=this.cells.get(r)||[];const cl=j=>{const c=Lr[j];return "ac"+(c&&this.wr.has(c)?" w":"")+(c&&this.rd.has(c)?" r":"")};
      return `<span class="mx-r"><span class="mx-i">${i}</span><span class="ar">${r.a.length?r.a.slice(0,24).map((x,j)=>`<span class="${cl(j)}"><i>${j}</i><b>${esc(lit(x,r.el,14))}</b></span>`).join("")+(r.a.length>24?`<span class="ac more"><i>…</i><b>+${r.a.length-24}</b></span>`:""):'<span class="ac-e">(rỗng)</span>'}</span></span>`}).join("")}${a.length>16?`<span class="mx-more">… còn ${a.length-16} hàng</span>`:""}</span>`;
    const el=v.el||"object";return `<span class="ar">${a.length?row(a,el,48,true):'<span class="ac-e">(rỗng)</span>'}</span>`}
  bufStatus(){return this.eof?`<span class="bad-t">Console.ReadLine(): hết dữ liệu (trả về null)</span>`:`<span class="ok-t">Console.ReadLine(): bình thường</span>`}
  argTxt(rv){return rv&&rv.cs!==undefined?lit(rv.cs,rv.t,30):""}
}
/* ---------------- 7. hàm phụ ---------------- */
const SF={"Math.PI":Math.PI,"Math.E":Math.E,"int.MaxValue":2147483647,"int.MinValue":-2147483648,"long.MaxValue":9223372036854775807n,"long.MinValue":-9223372036854775808n,"double.MaxValue":Number.MAX_VALUE,"double.MinValue":-Number.MAX_VALUE,"double.PositiveInfinity":Infinity,"double.NegativeInfinity":-Infinity,"double.NaN":NaN,"double.Epsilon":5e-324,"char.MaxValue":65535,"char.MinValue":0,"string.Empty":"","StringSplitOptions.RemoveEmptyEntries":1,"StringSplitOptions.None":0,"StringSplitOptions.TrimEntries":2};
const EXC_DEF={ArgumentException:"Value does not fall within the expected range.",InvalidOperationException:"Operation is not valid due to the current state of the object.",NotImplementedException:"The method or operation is not implemented.",IndexOutOfRangeException:"Index was outside the bounds of the array.",ArgumentOutOfRangeException:"Specified argument was out of the range of valid values."};
const AOOR=()=>EXC("System.ArgumentOutOfRangeException","Index was out of range. Must be non-negative and less than the size of the collection. (Parameter 'index')");
const MEM=()=>new CsExc("System.OutOfMemoryException","Array dimensions exceeded supported range.","Trình mô phỏng giới hạn mảng / chuỗi tối đa 20 000 000 phần tử.");
const mkArr=(el,a)=>({k:"arr",a,el,t:el+"[]"}),mkList=(el,a)=>({k:"list",a,el,t:`List<${el}>`,ver:0}),mkSeq=(el,a)=>({k:"seq",a,el,t:`IEnumerable<${el}>`});
function cnt(o){switch(o.k){case "list":case "arr":case "stack":return o.a.length;case "queue":return o.a.length-o.h;case "dict":case "set":return o.idx.size;case "pq":return o.n;case "keys":case "vals":return o.d.idx.size;case "seq":return o.a.length}return 0}
const WSC="\\t\\n\\v\\f\\r \\u0085\\u00a0\\u1680\\u2000-\\u200a\\u2028\\u2029\\u202f\\u205f\\u3000";
const WS_ONE=new RegExp("["+WSC+"]"),WS_ALL=new RegExp("^["+WSC+"]*$"),WS_L=new RegExp("^["+WSC+"]+"),WS_R=new RegExp("["+WSC+"]+$"),WS_TRIM=new RegExp("^["+WSC+"]+|["+WSC+"]+$","g");
const sepStr=(x,t)=>t==="char"?chs(x):x===null?"":x;
function fmtAny(v,t,f){if(f&&(t==="int"||t==="long"||t==="double"))return fmtNum(v,t,f);return fmtVal(v,t)}
function composite(f,vals,tys){if(f===null)throw EXC("System.ArgumentNullException","Value cannot be null. (Parameter 'format')");let out="";let i=0;const bad=()=>EXC("System.FormatException","Input string was not in a correct format.");
  while(i<f.length){const c=f[i];
    if(c==="{"){if(f[i+1]==="{"){out+="{";i+=2;continue}const j=f.indexOf("}",i);if(j<0)throw bad();const body=f.slice(i+1,j);const m=/^\s*(\d+)\s*(?:,\s*(-?\d+)\s*)?(?::(.*))?$/.exec(body);if(!m)throw bad();
      const k=+m[1];if(k>=vals.length)throw EXC("System.FormatException","Index (zero based) must be greater than or equal to zero and less than the size of the argument list.");
      let s=fmtAny(vals[k],tys[k],m[3]);if(m[2]){const w=+m[2];s=w>0?s.padStart(w):s.padEnd(-w)}out+=s;i=j+1;continue}
    if(c==="}"){if(f[i+1]==="}"){out+="}";i+=2;continue}throw bad()}
    out+=c;i++}
  return out}
function roundEven(x){if(!isFinite(x))return x;const f=Math.floor(x),d=x-f;let r;if(d>0.5)r=f+1;else if(d<0.5)r=f;else r=(f%2===0)?f:f+1;return r===0&&(x<0||Object.is(x,-0))?-0:r}
function arith(op,a,b,r){
  if(r==="int"){switch(op){case "+":return (a+b)|0;case "-":return (a-b)|0;case "*":return Math.imul(a,b);
      case "/":if(b===0)throw EXC("System.DivideByZeroException","Attempted to divide by zero.");if(a===-2147483648&&b===-1)throw EXC("System.OverflowException","Arithmetic operation resulted in an overflow.");return (a/b)|0;
      case "%":if(b===0)throw EXC("System.DivideByZeroException","Attempted to divide by zero.");if(b===-1)return 0;return (a%b)|0;
      case "&":return a&b;case "|":return a|b;case "^":return a^b;case "<<":return a<<(b&31);case ">>":return a>>(b&31)}}
  if(r==="long"){switch(op){case "+":return L64(a+b);case "-":return L64(a-b);case "*":return L64(a*b);
      case "/":if(b===0n)throw EXC("System.DivideByZeroException","Attempted to divide by zero.");if(a===-9223372036854775808n&&b===-1n)throw EXC("System.OverflowException","Arithmetic operation resulted in an overflow.");return a/b;
      case "%":if(b===0n)throw EXC("System.DivideByZeroException","Attempted to divide by zero.");if(b===-1n)return 0n;return a%b;
      case "&":return a&b;case "|":return a|b;case "^":return a^b;case "<<":return L64(a<<BigInt(b&63));case ">>":return a>>BigInt(b&63)}}
  switch(op){case "+":return a+b;case "-":return a-b;case "*":return a*b;case "/":return a/b;case "%":return a%b}
  throw new Error("phép "+op)}
/* sắp xếp như Array.Sort / List.Sort của .NET (introsort, không ổn định) để thứ tự các phần tử bằng nhau giống máy thật */
function introSort(K,lo,n,cmp){if(n<2)return;
  const sw=(i,j)=>{const t=K[i];K[i]=K[j];K[j]=t};
  const sig=(i,j)=>{if(i!==j&&cmp(K[i],K[j])>0)sw(i,j)};
  const ins=(l,h)=>{for(let i=l;i<h;i++){const t=K[i+1];let j=i;while(j>=l&&cmp(t,K[j])<0){K[j+1]=K[j];j--}K[j+1]=t}};
  const heap=(l,h)=>{const m=h-l+1;const down=(i,nn)=>{const d=K[l+i-1];while(i<=nn>>1){let c=2*i;if(c<nn&&cmp(K[l+c-1],K[l+c])<0)c++;if(!(cmp(d,K[l+c-1])<0))break;K[l+i-1]=K[l+c-1];i=c}K[l+i-1]=d};
    for(let i=m>>1;i>=1;i--)down(i,m);for(let i=m;i>1;i--){sw(l,l+i-1);down(1,i-1)}};
  const bad=()=>EXC("System.InvalidOperationException","Failed to compare two elements in the array.");
  const part=(l,h)=>{const mid=l+((h-l)>>1);sig(l,mid);sig(l,h);sig(mid,h);const p=K[mid];sw(mid,h-1);let L=l,R=h-1;
    while(L<R){while(cmp(K[++L],p)<0)if(L>=h)throw bad();while(cmp(p,K[--R])<0)if(R<=l)throw bad();if(L>=R)break;sw(L,R)}if(L!==h-1)sw(L,h-1);return L};
  const intro=(l,h,dl)=>{while(h>l){const ps=h-l+1;if(ps<=16){if(ps===2){sig(l,h);return}if(ps===3){sig(l,h-1);sig(l,h);sig(h-1,h);return}ins(l,h);return}
      if(dl===0){heap(l,h);return}dl--;const p=part(l,h);intro(p+1,h,dl);h=p-1}};
  intro(lo,lo+n-1,2*(Math.floor(Math.log2(n))+1))}
/* PriorityQueue của .NET: đống nhỏ nhất 4 nhánh */
function pqPush(q,e,p){let i=q.n++;const c=q.c;while(i>0){const pi=(i-1)>>2;const par=q.h[pi];if(c(p,par[1])<0){q.h[i]=par;i=pi}else break}q.h[i]=[e,p];q.ver++}
function pqPop(q){const top=q.h[0];const last=--q.n;if(last>0){const node=q.h[last];const c=q.c;let i=0,k;
    while((k=(i<<2)+1)<last){let mc=q.h[k],mi=k;const ub=Math.min(k+4,last);while(++k<ub){if(c(q.h[k][1],mc[1])<0){mc=q.h[k];mi=k}}if(c(node[1],mc[1])<=0)break;q.h[i]=mc;i=mi}
    q.h[i]=node}q.h.length=q.n;q.ver++;return top}
function compile(src){const T=lex(src);const P=new Parser(T,src).program();const C=new Checker(P,src);const prog=C.run();return{prog,warns:C.warns}}
return{CsM,compile,CErr,lex,netD,fixedNet,fmtNum};
})();

/* ---------------- 8. đăng ký với giao diện chung ---------------- */
if(typeof LANGS!=="undefined"){
  const fmtCsErr=(src,err,warn)=>{const p=Math.max(0,Math.min(err.p,src.length));const ln=src.slice(0,p).split("\n").length,col=p-src.lastIndexOf("\n",p-1);
    return `main.cs(${ln},${col}): <span class="${warn?"w":"e"}">${warn?"warning":"error"} ${esc(err.code||"")}</span>: ${esc(err.message||err.msg)}`};
  LANGS.cs={id:"cs",name:"C#",file:"main.cs",
    compile:src=>CS.compile(src),Machine:CS.CsM,isErr:e=>e instanceof CS.CErr,
    head:(src,warns)=>'<span class="sys">$ dotnet run</span>\n'+warns.map(w=>fmtCsErr(src,w,true)+"\n").join(""),
    errHead:(src,err,uns)=>'<span class="sys">$ dotnet run</span>\n'+(uns?`<span class="w">chưa hỗ trợ: ${esc(err.message)}</span>`:fmtCsErr(src,err)+"\n\nThe build failed. Fix the build errors and run again."),
    errTitle:()=>"Lỗi biên dịch",unsupNote:"Đây không phải lỗi C#: code có thể vẫn đúng với trình biên dịch C# thật.",
    inLabel:"Dữ liệu đầu vào cho Console.ReadLine()",inHelp:"Mỗi lần gọi Console.ReadLine() đọc một dòng. Gõ sẵn dữ liệu theo từng dòng (ví dụ dòng 1: <code>3</code>, dòng 2: <code>1 2 3</code>). Để trống thì khi chạy, chương trình sẽ hỏi bạn ở khung Kết quả.",
    bufTab:"Dữ liệu nhập",bufHead:"Dữ liệu nhập (Console.ReadLine)",bufEmpty:"Dữ liệu bạn gõ sẽ vào đây trước, mỗi lần Console.ReadLine() lấy ra một dòng.",
    noOut:"Chương trình không in gì ra màn hình (chưa có lệnh Console.WriteLine nào chạy).",okTitle:"Biên dịch và chạy thành công",noBuild:"không biên dịch được",readWord:"Console.ReadLine()",
    scope:`<p><b>Đây là trình mô phỏng để học</b>, chạy một phần của C# ngay trên trình duyệt, không phải .NET đầy đủ. Thông báo lỗi viết theo .NET 8.</p>
      <p><b>Có:</b> int, long, double, bool, char, string; mảng (cả mảng răng cưa int[][]), List, Dictionary, HashSet, Stack, Queue, PriorityQueue, StringBuilder; hàm static, hàm cục bộ, đệ quy, tham số mặc định, out; lambda (x =&gt; …), Func; if/else, switch, while, do, for, foreach, break, continue; chuỗi nội suy $"…{x:F2}"; Console.ReadLine, Console.WriteLine, Console.Write; Math, int.Parse, Convert, Array.Sort, các hàm LINQ thường dùng (Select, Where, Sum, Max, Min, OrderBy, ToArray, ToList…).</p>
      <p><b>Chưa có:</b> class có đối tượng (new của lớp tự viết, thuộc tính, kế thừa), struct, try/catch, ref, tuple, async, đọc ghi file, float, decimal. Code dùng các phần này được báo là “chưa hỗ trợ”, không phải lỗi C#.</p>
      <p><b>Giới hạn:</b> 1 000 000 bước chạy, 5 000 tầng đệ quy, 200 000 ký tự đầu ra, mảng tối đa 20 000 000 phần tử.</p>`};
}
