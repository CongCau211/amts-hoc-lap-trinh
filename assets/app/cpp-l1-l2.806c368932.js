lazyWidgets();
Object.assign(SNIP,{"l1std": "#include <iostream>\n\nint main() {\n    std::cout << \"Xin chào\" << std::endl;\n    return 0;\n}", "l1clash": "#include <iostream>\n#include <algorithm>\nusing namespace std;\n\nint count = 0;   // trùng tên với std::count\n\nint main() {\n    count++;     // lỗi: 'count' is ambiguous\n    cout << count;\n    return 0;\n}", "l1using": "#include <iostream>\nusing namespace std;   // từ đây viết cout thay cho std::cout\n\nint main() {\n    cout << \"Xin chào\" << endl;\n    return 0;\n}"});PRESET_NOTES["l1"]={};EX_HINTS["l1"]=[];
/* ===================== BÀI 1 · Chương trình C++ đầu tiên ===================== */
/* Bài 1 · Chương trình C++ đầu tiên
   Mã riêng của bài: ví dụ cho trình mô phỏng, công cụ minh họa, bài tập chấm tự động.
   Trắc nghiệm nằm ở quiz.json, đoạn code minh họa ở snippets/*.cpp. */
/* ================= ANATOMY ================= */
const ANAT_SRC=`// Chương trình đầu tiên
#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    return 0;
}`;
const ANAT=[
 {n:1,t:"Chú thích",lines:[1],d:"Bắt đầu bằng // và bị trình biên dịch bỏ qua. Dùng để giải thích code cho người đọc. Chú thích nhiều dòng viết trong /* ... */."},
 {n:2,t:"Chỉ thị #include",lines:[2],d:"Chép nội dung thư viện <iostream> vào file trước khi biên dịch. Thư viện này cung cấp cout để in ra màn hình và cin để nhập dữ liệu."},
 {n:3,t:"using namespace std;",lines:[3],d:"Các tên của thư viện chuẩn (cout, cin, endl, string…) nằm trong không gian tên (namespace) std, tên đầy đủ là std::cout. Dòng này cho phép viết gọn cout thay vì std::cout. Mọi chương trình trong khóa học đều có dòng này; lý do và lưu ý xem ngay bên dưới."},
 {n:4,t:"Hàm main",lines:[5,8],d:"Điểm bắt đầu của mọi chương trình. Hệ điều hành gọi main() đầu tiên. Kiểu trả về bắt buộc là int. Thân hàm nằm giữa cặp ngoặc nhọn { }."},
 {n:5,t:"cout và <<",lines:[6],d:"cout là luồng xuất ra màn hình, << đẩy dữ liệu vào luồng. endl xuống dòng."},
 {n:6,t:"Chuỗi ký tự",lines:[6],d:"Văn bản đặt trong dấu nháy kép \"...\" là một chuỗi hằng (string literal). Được in ra đúng nguyên văn."},
 {n:7,t:"return 0",lines:[7],d:"Kết thúc main và trả mã thoát 0 cho hệ điều hành, nghĩa là chạy thành công. Giá trị khác 0 thường báo lỗi."}
];
function renderAnat(active){
  const L=highlightLines(ANAT_SRC);const hl=active?ANAT[active-1].lines:[];
  const lines=hl.length===2?Array.from({length:hl[1]-hl[0]+1},(_,i)=>hl[0]+i).filter(x=>x===hl[0]||x===hl[1]):hl;
  document.getElementById("anat-code").innerHTML=L.map((s,i)=>`<span class="ln${lines.includes(i+1)?" hl":""}" data-n="${i+1}">${s||" "}</span>`).join("");
}
document.getElementById("anat-list").innerHTML=ANAT.map(a=>`<button aria-pressed="false" data-a="${a.n}"><span class="pin">${a.n}</span><b>${a.t}</b><span class="d">${esc(a.d)}</span></button>`).join("");
document.querySelectorAll("#anat-list button").forEach(b=>b.onclick=()=>{
  const on=b.getAttribute("aria-pressed")==="true";
  document.querySelectorAll("#anat-list button").forEach(x=>x.setAttribute("aria-pressed","false"));
  if(!on)b.setAttribute("aria-pressed","true");
  renderAnat(on?0:+b.dataset.a);
});
document.querySelector('#anat-list button[data-a="3"]').click();

/* ================= PIPELINE ================= */
const PIPE=[
 `<span class="cap">$ g++ -E main.cpp -o main.i</span>
Bộ tiền xử lý thay dòng #include &lt;iostream&gt; bằng toàn bộ nội dung thư viện
và xóa chú thích. File main.i dài hơn 30 000 dòng:

<span class="cap"># 1 "main.cpp"</span>
namespace std { ... extern ostream cout; ... }   <span class="cap">// từ iostream</span>
using namespace std;
int main() {
    cout &lt;&lt; "Hello, World!" &lt;&lt; endl;
    return 0;
}`,
 `<span class="cap">$ g++ -c main.i -o main.o</span>
Trình biên dịch kiểm tra cú pháp, kiểu dữ liệu rồi dịch sang mã máy.
Thiếu dấu ; hay viết sai tên sẽ bị báo lỗi ở bước này.
main.o là file đối tượng (object file), chưa chạy được:

<span class="cap">0000000000000000 &lt;main&gt;:</span>
  55                    push   %rbp
  48 89 e5              mov    %rsp,%rbp
  48 8d 35 00 00 00 00  lea    0x0(%rip),%rsi   <span class="cap">// "Hello, World!"</span>
  e8 00 00 00 00        call   ...              <span class="cap">// địa chỉ cout chưa biết</span>`,
 `<span class="cap">$ g++ main.o -o main</span>
Trình liên kết ghép main.o với thư viện chuẩn (libstdc++),
điền địa chỉ thật của std::cout và tạo file thực thi “main”.
Nếu không có hàm main, lỗi xuất hiện ở bước này:
<span class="cap">  undefined reference to \`main'</span>`,
 `<span class="cap">$ ./main</span>
Hello, World!
<span class="cap">
Hệ điều hành nạp chương trình vào bộ nhớ, gọi main().
main trả về 0 → $? = 0 (thành công).</span>`
];
let pstep=0;
function renderPipe(){
  document.querySelectorAll("#pipe .stage").forEach((s,i)=>{s.classList.toggle("on",i===pstep-1);s.classList.toggle("done",i<pstep-1)});
  document.getElementById("pipe-step").textContent=`Giai đoạn ${pstep} / 4`;
  document.getElementById("pipe-next").disabled=pstep>=4;
  document.getElementById("pipe-prev").disabled=pstep<=0;
  if(pstep>0)document.getElementById("pipe-out").innerHTML=PIPE[pstep-1];
}
document.getElementById("pipe-next").onclick=()=>{if(pstep<4){pstep++;renderPipe()}};
document.getElementById("pipe-prev").onclick=()=>{if(pstep>1){pstep--;renderPipe()}else if(pstep===1)document.getElementById("pipe-reset").onclick()};
document.getElementById("pipe-reset").onclick=()=>{pstep=0;renderPipe();document.getElementById("pipe-out").innerHTML='<span class="cap">$ g++ main.cpp -o main &amp;&amp; ./main\nLệnh trên chạy cả 4 giai đoạn cùng lúc. Nhấn “Bước tiếp” để tách từng giai đoạn.</span>'};

/* ================= MINI COMPILER / INTERPRETER ================= */
class CErr extends Error{constructor(pos,msg,vi,stage){super(msg);this.pos=pos;this.vi=vi;this.stage=stage||"compile"}}
function compileRun(src){
  const lineAt=p=>src.slice(0,p).split("\n").length;
  const colAt=p=>p-src.lastIndexOf("\n",p-1);
  // strip comments, keep positions
  let s="",i=0;const n=src.length;
  while(i<n){
    const c=src[i];
    if(c==='"'||c==="'"){let j=i+1;while(j<n&&src[j]!==c&&src[j]!=="\n"){if(src[j]==="\\")j++;j++}
      if(j>=n||src[j]!==c)throw new CErr(i,`missing terminating ${c} character`,"Chuỗi hoặc ký tự chưa được đóng. Thêm dấu nháy ở cuối trên cùng một dòng.");
      s+=src.slice(i,j+1);i=j+1;continue}
    if(c==="/"&&src[i+1]==="/"){while(i<n&&src[i]!=="\n"){s+=" ";i++}continue}
    if(c==="/"&&src[i+1]==="*"){const j=src.indexOf("*/",i+2);if(j<0)throw new CErr(i,"unterminated comment","Chú thích /* chưa có */ để đóng.");
      for(let k=i;k<j+2;k++)s+=src[k]==="\n"?"\n":" ";i=j+2;continue}
    s+=c;i++;
  }
  const blank=(a,b)=>{s=s.slice(0,a)+s.slice(a,b).replace(/[^\n]/g," ")+s.slice(b)};
  // preprocessor
  const includes=new Set();
  let re=/^[ \t]*#.*$/gm,m;
  while((m=re.exec(s))){
    const d=m[0].trim(),inc=/^#\s*include\s*<\s*([\w.]+)\s*>$/.exec(d);
    if(inc){if(!["iostream","cstdio","string"].includes(inc[1]))throw new CErr(m.index,`${inc[1]}: No such file or directory`,`Không tìm thấy thư viện <${inc[1]}>. Kiểm tra lại chính tả, ví dụ <iostream>.`);includes.add(inc[1])}
    else if(/^#\s*include/.test(d))throw new CErr(m.index,"#include expects \"FILENAME\" or <FILENAME>","Cú pháp đúng: #include <iostream>");
    else throw new CErr(m.index,`invalid preprocessing directive ${d.split(/\s/)[0]}`,"Chỉ thị tiền xử lý không hợp lệ.");
    blank(m.index,m.index+m[0].length);
  }
  let usingStd=false;
  re=/using\s+namespace\s+std\s*;/g;
  while((m=re.exec(s))){usingStd=true;blank(m.index,m.index+m[0].length)}
  // main
  const mm=/\bint\s+main\s*\(\s*(void)?\s*\)\s*\{/.exec(s);
  if(!mm){
    const vm=/\bvoid\s+main\s*\(/.exec(s);
    if(vm)throw new CErr(vm.index,"'::main' must return 'int'","Hàm main phải có kiểu trả về int, không phải void.");
    const alt=/\b(Main|MAIN|mian|main1)\s*\(/.exec(s);
    throw new CErr(-1,"undefined reference to `main'",alt?`Trình liên kết không tìm thấy hàm main. Bạn viết “${alt[1]}”, nhưng C++ phân biệt hoa thường: tên phải là main.`:"Trình liên kết không tìm thấy hàm main. Mọi chương trình cần có int main() { ... }.","link");
  }
  const open=mm.index+mm[0].length-1;
  let depth=0,close=-1;
  for(let k=open;k<s.length;k++){const c=s[k];
    if(c==='"'||c==="'"){k++;while(s[k]!==c){if(s[k]==="\\")k++;k++}continue}
    if(c==="{")depth++;else if(c==="}"){depth--;if(depth===0){close=k;break}}}
  if(close<0)throw new CErr(s.length-1,"expected '}' at end of input","Thiếu dấu } đóng thân hàm main.");
  const before=s.slice(0,mm.index).trim(),after=s.slice(close+1).trim();
  if(before||after){const p=before?s.search(/\S/):close+1+s.slice(close+1).search(/\S/);
    throw new CErr(p,"unsupported code outside main","Trình mô phỏng Bài 1 chỉ hỗ trợ #include, using namespace std và hàm main.")}
  // statements
  const stmts=[];let st=open+1;
  for(let k=open+1;k<close;k++){const c=s[k];
    if(c==='"'||c==="'"){k++;while(s[k]!==c){if(s[k]==="\\")k++;k++}continue}
    if(c==="{"||c==="}")throw new CErr(k,`unsupported '${c}'`,"Khối lệnh lồng nhau sẽ học ở Chương 4.");
    if(c===";"){stmts.push([st,k]);st=k+1}}
  const rest=s.slice(st,close);
  if(rest.trim()){const lastNs=st+rest.search(/\S\s*$/);
    throw new CErr(lastNs+1,"expected ';' before '}' token","Câu lệnh cuối thiếu dấu chấm phẩy ; ở cuối dòng.")}
  const steps=[];let exit=0;
  for(const [a,b] of stmts){
    const raw=s.slice(a,b),off=a+raw.search(/\S|$/),t=raw.trim();
    if(!t)continue;
    let r;
    if((r=/^return\b([\s\S]*)$/.exec(t))){
      const ex=r[1].trim();exit=ex?evalExpr(ex,off+6+(r[1].length-r[1].trimStart().length),usingStd).v:0;
      steps.push({line:lineAt(off),kind:"ret",code:exit});break}
    if((r=/^(std\s*::\s*)?(cout)\b/.exec(t))){
      if(!r[1]&&!usingStd)throw new CErr(off,"'cout' was not declared in this scope; did you mean 'std::cout'?","cout nằm trong không gian tên std. Thêm dòng using namespace std; ngay dưới #include (hoặc viết đầy đủ std::cout).");
      if(!includes.has("iostream"))throw new CErr(off,(r[1]?"'cout' is not a member of 'std'":"'cout' was not declared in this scope")+"; note: '#include <iostream>' is missing","Thiếu #include <iostream> ở đầu file nên trình biên dịch không biết cout là gì.");
      const body=t.slice(r[0].length),bodyOff=off+r[0].length;
      const parts=splitShift(body,bodyOff);
      if(parts[0].text.trim()){const p=parts[0];const q=p.off+p.text.search(/\S/);
        throw new CErr(q,`expected ';' before ${describe(p.text.trim())}`,"Sau cout phải là toán tử << rồi mới đến giá trị cần in.")}
      for(let k=1;k<parts.length;k++){
        const p=parts[k],pt=p.text.trim(),po=p.off+p.text.search(/\S|$/);
        if(!pt)throw new CErr(po,`expected primary-expression before ${k+1<parts.length?"'<<' token":"';' token"}`,"Có toán tử << nhưng thiếu giá trị phía sau.");
        steps.push(...evalPiece(pt,po,usingStd).map(x=>({...x,line:lineAt(x.pos)})));
      }
      if(parts.length===1)steps.push({line:lineAt(off),kind:"noop"});
      continue;
    }
    const w=/^[A-Za-z_][\w:]*/.exec(t);
    if(w&&/^(std::)?endl$/.test(w[0]))throw new CErr(off,"statement has no effect","endl phải đứng sau cout <<.");
    if(w&&/^(printf|puts)$/.test(w[0]))throw new CErr(off,`'${w[0]}' chưa được hỗ trợ`,`${w[0]} là hàm kiểu C. Trong khóa này ta dùng cout.`);
    if(w&&/^(int|double|float|char|bool|auto|std::string|string)$/.test(w[0]))throw new CErr(off,"khai báo biến chưa được hỗ trợ","Biến sẽ học ở Chương 2. Bài 1 chỉ dùng std::cout và return.");
    if(w&&/^Cout|^COUT|^Std|^STD/.test(w[0]))throw new CErr(off,`'${w[0].split(":")[0]}' was not declared in this scope`,"C++ phân biệt chữ hoa và chữ thường: phải viết std::cout.");
    throw new CErr(off,`'${(w||[t.slice(0,12)])[0]}' was not declared in this scope`,"Trình mô phỏng Bài 1 chỉ hỗ trợ cout và return.");
  }
  return {steps,exit};

  function describe(x){if(x[0]==='"')return "string constant";if(/^\d/.test(x))return "numeric constant";const w=/^[A-Za-z_]\w*/.exec(x);return w?`'${w[0]}'`:`'${x[0]}'`}
  function splitShift(body,base){
    const out=[];let st=0;
    for(let k=0;k<body.length;k++){const c=body[k];
      if(c==='"'||c==="'"){k++;while(body[k]!==c){if(body[k]==="\\")k++;k++}continue}
      if(c==="<"&&body[k+1]==="<"){out.push({text:body.slice(st,k),off:base+st});st=k+2;k++}}
    out.push({text:body.slice(st),off:base+st});return out;
  }
  function evalPiece(pt,po,usingStd){
    if(/^std\s*::\s*endl$/.test(pt))return [{pos:po,kind:"nl",text:"\n",src:"std::endl"}];
    if(pt==="endl"){if(!usingStd)throw new CErr(po,"'endl' was not declared in this scope; did you mean 'std::endl'?","endl cũng nằm trong không gian tên std. Thêm using namespace std; ngay dưới #include (hoặc viết std::endl).");return [{pos:po,kind:"nl",text:"\n",src:"endl"}]}
    if(pt[0]==='"'){
      let k=0,str="";const items=[];
      while(k<pt.length&&pt[k]==='"'){let j=k+1;while(pt[j]!=='"'){if(pt[j]==="\\")j++;j++}str+=unescape(pt.slice(k+1,j),po+k);k=j+1;while(/\s/.test(pt[k]||""))k++}
      const left=pt.slice(k).trim();
      if(left)throw new CErr(po+pt.indexOf(left,k),`expected ';' before ${describe(left)}`,"Thiếu dấu ; hoặc << giữa hai phần. Có thể câu lệnh phía trên quên dấu chấm phẩy.");
      return [{pos:po,kind:"str",text:str,src:pt}];
    }
    if(pt[0]==="'"){const j=pt.indexOf("'",pt[1]==="\\"?3:2);const ch=unescape(pt.slice(1,j),po);
      if(pt.slice(j+1).trim())throw new CErr(po+j+1,`expected ';' before ${describe(pt.slice(j+1).trim())}`,"Thiếu dấu ; hoặc <<.");
      return [{pos:po,kind:ch==="\n"?"nl":"str",text:ch,src:pt}]}
    const v=evalExpr(pt,po,usingStd);
    return [{pos:po,kind:"num",text:fmt(v),src:pt}];
  }
  function unescape(x,p){return x.replace(/\\(.)/g,(_,c)=>{const M={n:"\n",t:"\t",'"':'"',"'":"'","\\":"\\",0:""};if(c in M)return M[c];throw new CErr(p,`unknown escape sequence: '\\${c}'`,`\\${c} không phải ký tự thoát hợp lệ. Dùng \\n, \\t, \\" hoặc \\\\.`)})}
  function evalExpr(ex,base,usingStd){
    const toks=[];const rx=/\s*(\d+\.\d*|\.\d+|\d+|[A-Za-z_][\w:]*|[-+*/%()])/y;let k=0,mm;
    while(k<ex.length){rx.lastIndex=k;mm=rx.exec(ex);if(!mm){if(!ex.slice(k).trim())break;throw new CErr(base+k,`stray '${ex.slice(k).trim()[0]}' in program`,"Ký tự không hợp lệ trong biểu thức.")}toks.push({t:mm[1],p:base+mm.index+mm[0].indexOf(mm[1])});k=rx.lastIndex}
    let q=0;const peek=()=>toks[q]&&toks[q].t;
    function prim(){const tk=toks[q++];if(!tk)throw new CErr(base+ex.length,"expected primary-expression","Biểu thức chưa hoàn chỉnh.");
      if(tk.t==="("){const v=add();if(peek()!==")")throw new CErr(toks[q]?toks[q].p:base+ex.length,"expected ')'","Thiếu dấu ngoặc đóng ).");q++;return v}
      if(tk.t==="-"){const v=prim();return{v:-v.v,int:v.int}}
      if(tk.t==="+")return prim();
      if(/^[\d.]/.test(tk.t))return{v:parseFloat(tk.t),int:!/\./.test(tk.t)};
      if(/^(std::)?cout$/.test(tk.t))throw new CErr(tk.p,`expected ';' before '${tk.t.split(":")[0]}'`,"Câu lệnh phía trước thiếu dấu chấm phẩy ;.");
      throw new CErr(tk.p,`'${tk.t}' was not declared in this scope`,`Trình biên dịch không biết “${tk.t}”. Nếu muốn in chữ, đặt trong dấu nháy kép: "${tk.t}".`)}
    function mul(){let a=prim();while(["*","/","%"].includes(peek())){const o=toks[q++],b=prim();const I=a.int&&b.int;
      if(o.t==="%"&&!I)throw new CErr(o.p,"invalid operands to binary %","Toán tử % chỉ dùng cho số nguyên.");
      if((o.t==="/"||o.t==="%")&&I&&b.v===0)throw new CErr(o.p,"division by zero","Chia số nguyên cho 0 làm chương trình bị dừng (lỗi khi chạy).","run");
      let v=o.t==="*"?a.v*b.v:o.t==="/"?a.v/b.v:a.v%b.v;if(I)v=Math.trunc(v);a={v,int:I}}return a}
    function add(){let a=mul();while(["+","-"].includes(peek())){const o=toks[q++].t,b=mul();a={v:o==="+"?a.v+b.v:a.v-b.v,int:a.int&&b.int}}return a}
    const v=add();if(q<toks.length){const tk=toks[q];throw new CErr(tk.p,`expected ';' before ${describe(tk.t)}`,"Thiếu dấu ; hoặc toán tử. Có thể câu lệnh phía trên quên dấu chấm phẩy.")}
    return v;
  }
  function fmt(x){if(x.int)return String(x.v);const v=x.v;if(!isFinite(v))return v>0?"inf":v<0?"-inf":"nan";if(v===0)return "0";
    const e=Math.floor(Math.log10(Math.abs(v)));
    if(e<-5||e>=6){let [mt,ex]=v.toExponential(5).split("e");mt=mt.replace(/\.?0+$/,"");const sgn=ex[0]==="-"?"-":"+";ex=ex.replace(/^[+-]/,"").padStart(2,"0");return `${mt}e${sgn}${ex}`}
    return parseFloat(v.toPrecision(6)).toString().replace(/e.*/,"")}
}

/* ================= EDITOR UI ================= */
const PRESETS={
hello:`#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    return 0;
}`,
multi:`#include <iostream>
using namespace std;

int main() {
    // Mỗi << đẩy thêm một giá trị vào luồng
    cout << "Họ tên:\\tNguyễn Văn An" << "\\n";
    cout << "Lớp:\\tC++ Cơ bản" << endl;
    cout << "Câu nói: \\"Code là thơ\\"\\n";
    return 0;
}`,
math:`#include <iostream>
using namespace std;

int main() {
    cout << "7 + 3 = " << 7 + 3 << "\\n";
    cout << "7 / 2 = " << 7 / 2 << "\\n";     // chia nguyên
    cout << "7.0 / 2 = " << 7.0 / 2 << "\\n"; // chia thực
    cout << "7 % 2 = " << 7 % 2 << "\\n";     // chia lấy dư
    cout << "(2 + 3) * 4 = " << (2 + 3) * 4 << endl;
    return 0;
}`,
using:`#include <iostream>

int main() {
    // không có using namespace std; nên phải ghi đầy đủ std::
    std::cout << "Xin chào!" << std::endl;
    std::cout << "Năm nay là " << 2026 << std::endl;
    return 0;
}`,
e_semi:`#include <iostream>
using namespace std;

int main() {
    cout << "Dòng thứ nhất\\n"
    cout << "Dòng thứ hai\\n";
    return 0;
}`,
e_std:`#include <iostream>

int main() {
    cout << "Hello, World!" << endl;
    return 0;
}`,
e_inc:`using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    return 0;
}`,
e_main:`#include <iostream>
using namespace std;

int Main() {
    cout << "Hello, World!" << endl;
    return 0;
}`,
e_str:`#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World! << endl;
    return 0;
}`
};
const ed=document.getElementById("ed"),edHl=document.getElementById("ed-hl"),gutter=document.getElementById("gutter");
const term=document.getElementById("term"),stream=document.getElementById("stream"),explain=document.getElementById("explain");
let curLine=0,badLine=0;
function paint(){
  const L=highlightLines(ed.value);
  edHl.innerHTML=L.map((s,i)=>`<span class="row${i+1===curLine?" cur":""}${i+1===badLine?" bad":""}">${s||" "}</span>`).join("");
  gutter.innerHTML=L.map((_,i)=>`<div class="${i+1===badLine?"err":""}">${i+1}</div>`).join("");
  sync();
}
function sync(){edHl.scrollTop=ed.scrollTop;edHl.scrollLeft=ed.scrollLeft;gutter.scrollTop=ed.scrollTop}
ed.addEventListener("input",()=>{resetRun();badLine=0;paint();saveDraft()});
ed.addEventListener("scroll",sync);
ed.addEventListener("keydown",e=>{
  if(e.key==="Tab"){e.preventDefault();const a=ed.selectionStart;ed.setRangeText("    ",a,ed.selectionEnd,"end");ed.dispatchEvent(new Event("input"))}
  if(e.key==="Enter"&&(e.ctrlKey||e.metaKey)){e.preventDefault();run()}
});
/* bản nháp: lưu riêng theo tài khoản, để nhiều người dùng chung máy không thấy code của nhau */
function draftKey(){const u=typeof AMTS!=="undefined"&&AMTS.S&&AMTS.S.user;return "cpp-l1-draft"+(u&&u.uid?":"+u.uid:"")}
function saveDraft(){try{localStorage.setItem(draftKey(),ed.value)}catch(e){}}
function load(code){ed.value=code;ed.scrollTop=0;resetRun();badLine=0;paint();clearTerm()}
document.getElementById("preset").onchange=e=>{activeEx=-1;renderEx();load(PRESETS[e.target.value])};

let prog=null,stepIdx=0,timer=null,activeEx=-1;
/* dòng trạng thái ở hàng nút (khung trình mô phỏng chung, docs/QUY-TAC-TRINH-MO-PHONG.md) */
function setSt(k,t){const e=document.getElementById("sc-st");if(e){e.className="sc-st "+k;e.textContent=t}}
function clearTerm(){term.innerHTML='<span class="sys">$ g++ main.cpp -o main</span>';stream.innerHTML='<span class="empty">Các giá trị được đẩy vào luồng sẽ hiện ở đây.</span>';explain.hidden=true;document.getElementById("exit-info").textContent="";document.getElementById("step-info").textContent=""}
function resetRun(){prog=null;stepIdx=0;clearInterval(timer);timer=null;curLine=0;setSt("idle","Chưa chạy");document.getElementById("btn-step").textContent="Từng bước";updBack()}
function updBack(){const b=document.getElementById("btn-back");if(b)b.disabled=!prog||stepIdx<=0||!!timer}
function build(){
  resetRun();clearTerm();
  const src=ed.value;
  try{prog=compileRun(src);badLine=0;paint();
    term.innerHTML='<span class="sys">$ g++ main.cpp -o main\n$ ./main\n</span><span id="out"></span><span class="cursor"></span>';
    stream.innerHTML="";return true}
  catch(err){
    if(!(err instanceof CErr))throw err;
    const ln=err.pos<0?0:src.slice(0,err.pos).split("\n").length,col=err.pos<0?0:err.pos-src.lastIndexOf("\n",err.pos-1);
    badLine=err.stage==="run"?0:ln;paint();
    let msg;
    if(err.stage==="link")msg=`<span class="sys">$ g++ main.cpp -o main</span>\n<span class="e">/usr/bin/ld: (.text+0x1b): ${esc(err.message)}\ncollect2: error: ld returned 1 exit status</span>`;
    else if(err.stage==="run")msg=`<span class="sys">$ g++ main.cpp -o main\n$ ./main</span>\n<span class="e">Floating point exception (core dumped)</span>`;
    else{const lineTxt=src.split("\n")[ln-1]||"";
      msg=`<span class="sys">$ g++ main.cpp -o main</span>\n<span class="e">main.cpp:${ln}:${col}: error: ${esc(err.message)}</span>\n${String(ln).padStart(5)} | ${esc(lineTxt)}\n      | ${" ".repeat(Math.max(0,col-1))}<span class="e">^</span>`}
    term.innerHTML=msg;
    explain.hidden=false;explain.className="explain";
    explain.innerHTML=`<b>${err.stage==="link"?"Lỗi liên kết":err.stage==="run"?"Lỗi khi chạy":"Lỗi biên dịch"}${ln&&err.stage!=="run"?` ở dòng ${ln}`:""}</b><span>${esc(err.vi)}</span>`;
    document.getElementById("exit-info").textContent=err.stage==="run"?"dừng bất thường":"không tạo được file chạy";
    setSt("err",err.stage==="link"?"Lỗi liên kết":err.stage==="run"?"Lỗi khi chạy":`Lỗi biên dịch${ln?` · dòng ${ln}`:""}`);
    checkEx(null);return false}
}
function applyStep(i){
  const st=prog.steps[i];curLine=st.line;paint();
  document.getElementById("step-info").textContent=`bước ${i+1}/${prog.steps.length}`;
  if(st.kind!=="ret")setSt(timer?"run":"step",timer?"Đang chạy…":`Dừng ở dòng ${st.line}`);
  if(st.kind==="ret"){finish();return}
  if(st.kind==="noop")return;
  stream.querySelectorAll(".new").forEach(x=>x.classList.remove("new"));
  const tok=document.createElement("span");tok.className="tok new"+(st.kind==="nl"?" nl":"");
  tok.textContent=st.kind==="nl"?(st.src.includes("endl")?"endl ↵":"\\n ↵"):JSON.stringify(st.text).slice(1,-1).replace(/\\"/g,'"');
  stream.appendChild(tok);
  document.getElementById("out").textContent+=st.text;
  term.scrollTop=term.scrollHeight;
  updBack();
}
function finish(){
  const c=term.querySelector(".cursor");if(c)c.remove();
  const out=document.getElementById("out")?document.getElementById("out").textContent:"";
  term.insertAdjacentHTML("beforeend",`${out.endsWith("\n")||!out?"":"\n"}<span class="${prog.exit===0?"ok":"e"}">[Chương trình kết thúc, mã thoát ${prog.exit}]</span>`);
  document.getElementById("exit-info").textContent=`return ${prog.exit}`;setSt("ok","Đã chạy xong");
  curLine=0;paint();
  if(!prog.steps.some(s=>s.kind==="ret"))prog.steps.push({kind:"ret"});
  explain.hidden=false;explain.className="explain good";
  explain.innerHTML=`<b>Biên dịch và chạy thành công</b><span>${prog.steps.filter(s=>s.kind==="str"||s.kind==="num"||s.kind==="nl").length} giá trị đã đi qua cout.</span>`;
  document.getElementById("btn-step").textContent="Từng bước";
  checkEx(out);
  stepIdx=prog.steps.length;updBack();
}
function run(){
  if(!build())return;
  const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
  if(!prog.steps.length||prog.steps[prog.steps.length-1].kind!=="ret")prog.steps.push({line:0,kind:"ret",code:prog.exit});
  if(reduce){prog.steps.forEach((_,i)=>applyStep(i));return}
  stepIdx=0;timer=setInterval(()=>{if(stepIdx>=prog.steps.length){clearInterval(timer);timer=null;updBack();return}applyStep(stepIdx++)},160);updBack();
}
document.getElementById("btn-run").onclick=run;
document.getElementById("btn-step").onclick=function(){
  if(!prog||stepIdx>=prog.steps.length){if(!build())return;
    if(!prog.steps.length||prog.steps[prog.steps.length-1].kind!=="ret")prog.steps.push({line:0,kind:"ret",code:prog.exit});
    stepIdx=0;this.textContent="Bước tiếp →"}
  clearInterval(timer);timer=null;
  applyStep(stepIdx++);updBack();
};
document.getElementById("btn-back").onclick=()=>{
  if(!prog||stepIdx<=0)return;const t=stepIdx-1;clearInterval(timer);timer=null;
  if(!build())return;
  if(!prog.steps.length||prog.steps[prog.steps.length-1].kind!=="ret")prog.steps.push({line:0,kind:"ret",code:prog.exit});
  stepIdx=0;document.getElementById("btn-step").textContent="Bước tiếp →";
  for(let i=0;i<t;i++)applyStep(stepIdx++);
  updBack();
};

/* ================= EXERCISES ================= */
const EX=[
 {t:"Giới thiệu bản thân",d:"In đúng 2 dòng như dưới đây (thay tên của bạn cũng được tính là đúng nếu giữ định dạng).",exp:"Xin chào, tôi là An.\nTôi đang học C++.\n",match:o=>/^Xin chào, tôi là .+\.\nTôi đang học C\+\+\.\n$/.test(o),
  start:`#include <iostream>
using namespace std;

int main() {
    // Viết code của bạn ở đây

    return 0;
}`},
 {t:"Khung chữ nhật",d:"Dùng ký tự thoát và nhiều lệnh cout để vẽ khung sau.",exp:"+------+\n| C++  |\n+------+\n",
  start:`#include <iostream>
using namespace std;

int main() {
    cout << "+------+\\n";
    // Vẽ tiếp 2 dòng còn lại

    return 0;
}`},
 {t:"Máy tính bỏ túi",d:"In kết quả của 17 / 5 (chia nguyên), 17 % 5 và 17.0 / 5 bằng phép tính, không gõ sẵn đáp án.",exp:"17 / 5 = 3\n17 % 5 = 2\n17.0 / 5 = 3.4\n",
  check:src=>/<<\s*17\s*\/\s*5\b/.test(src)&&/<<\s*17\s*%\s*5/.test(src)&&/<<\s*17\.0\s*\/\s*5/.test(src),
  start:`#include <iostream>
using namespace std;

int main() {
    cout << "17 / 5 = " << 17 / 5 << "\\n";
    // In tiếp 17 % 5 và 17.0 / 5

    return 0;
}`}
];
const exState=EX.map(()=>"");
function renderEx(){
  document.getElementById("ex-grid").innerHTML=EX.map((e,i)=>`<div class="ex ${i===activeEx?"active":""}"><h4>${i+1}. ${e.t}</h4><p>${esc(e.d)}</p><div><div class="pane-h" style="padding:0 0 4px">Đầu ra mong đợi</div><pre>${esc(e.exp)}</pre></div>
  ${exState[i]?`<span class="st ${exState[i]==="pass"?"pass":"fail"}">${exState[i]==="pass"?"✓ Đạt":"✗ "+esc(exState[i])}</span>`:""}
  <button class="btn ${i===activeEx?"":"pri"}" data-ex="${i}">${i===activeEx?"Đang làm · nạp lại":"Làm bài này"}</button></div>`).join("");
  document.querySelectorAll("[data-ex]").forEach(b=>b.onclick=()=>{activeEx=+b.dataset.ex;exState[activeEx]="";renderEx();load(EX[activeEx].start);document.getElementById("p4").scrollIntoView({behavior:"smooth"})});
}
function checkEx(out){
  if(activeEx<0)return;const e=EX[activeEx];
  if(out===null){exState[activeEx]="Chưa biên dịch được";renderEx();return}
  const ok=(e.match?e.match(out):out===e.exp)&&(!e.check||e.check(ed.value));
  if(window.TRACK)TRACK.ex("l1-"+activeEx,ok,ok?"đạt":"chưa đạt");
  if(ok)exState[activeEx]="pass";
  else if(e.check&&!e.check(ed.value)&&(out===e.exp))exState[activeEx]="Đầu ra đúng nhưng hãy dùng phép tính thay vì gõ sẵn số";
  else{const want=e.exp;let k=0;while(k<out.length&&out[k]===want[k])k++;
    const ln=out.slice(0,k).split("\n").length;exState[activeEx]=`Khác ở dòng ${ln}. Kiểm tra dấu cách, dấu chấm và \\n.`}
  renderEx();
  explain.hidden=false;
  if(ok){explain.className="explain good";explain.innerHTML=`<b>Bài tập ${activeEx+1}: Đạt</b><span>Đầu ra khớp hoàn toàn với yêu cầu.</span>`}
  else{explain.className="explain";explain.innerHTML=`<b>Bài tập ${activeEx+1}: Chưa đạt</b><span>${esc(exState[activeEx])}</span>`}
}
renderEx();
/* nạp bản nháp khi trang sẵn sàng; đổi tài khoản thì nạp bản nháp của tài khoản đó (nếu có) */
onReady(()=>{
  const get=k=>{try{return localStorage.getItem(k)}catch(e){return null}};
  let key=draftKey();load(get(key)||PRESETS.hello);
  if(typeof AMTS!=="undefined"&&AMTS.on)AMTS.on(()=>{const k=draftKey();if(k===key)return;key=k;const d=get(k);if(d!=null)load(d);else saveDraft()});
});

makeQuiz("quiz","score",[{"q": "Chương trình C++ bắt đầu chạy từ đâu?", "o": ["Dòng đầu tiên của file", "Hàm <code>main<\/code>", "Dòng <code>#include<\/code>", "Hàm đầu tiên được viết"], "a": 1, "e": "Hệ điều hành luôn gọi hàm main() đầu tiên, bất kể nó nằm ở vị trí nào trong file."}, {"q": "<code>cout &lt;&lt; 9 / 2;<\/code> in ra gì?", "o": ["4.5", "4", "5", "Báo lỗi"], "a": 1, "e": "9 và 2 đều là số nguyên nên phép chia cho kết quả nguyên, phần thập phân bị bỏ đi."}, {"q": "Lỗi <code>undefined reference to `main'<\/code> xảy ra ở giai đoạn nào?", "o": ["Tiền xử lý", "Biên dịch", "Liên kết", "Khi chạy"], "a": 2, "e": "Trình liên kết là bước ghép mọi phần lại và tìm hàm main. Thiếu main thì bước này thất bại."}, {"q": "Khác biệt giữa <code>endl<\/code> và <code>\"\\n\"<\/code> là gì?", "o": ["Không khác gì", "endl xuống 2 dòng", "endl xuống dòng và xả bộ đệm ngay", "\\n chỉ dùng được trên Linux"], "a": 2, "e": "Cả hai đều xuống dòng; endl còn flush bộ đệm, nên chậm hơn khi in nhiều."}]);
Object.assign(SNIP,{});PRESET_NOTES["l2"]={};EX_HINTS["l2"]=[];
/* ===================== BÀI 2 · Cài đặt trình biên dịch & IDE ===================== */
/* Bài 2 · Cài đặt trình biên dịch & IDE
   Mã riêng của bài: ví dụ cho trình mô phỏng, công cụ minh họa, bài tập chấm tự động.
   Trắc nghiệm nằm ở quiz.json, đoạn code minh họa ở snippets/*.cpp. */
/* ================= BÀI 2 ================= */
const UA=navigator.userAgent;const HOST=/Mac/.test(UA)&&!/iPhone|iPad/.test(UA)?"mac":/Linux/.test(UA)&&!/Android/.test(UA)?"lin":"win";

/* OS tabs */
function pickOS(os){
  document.querySelectorAll(".ostabs [data-os]").forEach(b=>b.setAttribute("aria-selected",b.dataset.os===os));
  document.querySelectorAll(".ospanel").forEach(p=>p.hidden=p.dataset.panel!==os);
}
document.querySelectorAll(".ostabs [data-os]").forEach(b=>b.onclick=()=>pickOS(b.dataset.os));
pickOS(HOST);

/* copy buttons */
document.querySelectorAll(".cmd button").forEach(b=>b.onclick=()=>{
  const code=b.previousElementSibling,txt=code.textContent;
  const ok=()=>{b.textContent="Đã chép";setTimeout(()=>b.textContent="Sao chép",1400)};
  const fallback=()=>{const r=document.createRange();r.selectNodeContents(code);const s=getSelection();s.removeAllRanges();s.addRange(r);b.textContent="Đã chọn, nhấn Ctrl+C";setTimeout(()=>b.textContent="Sao chép",2000)};
  try{navigator.clipboard.writeText(txt).then(ok,fallback)}catch(e){fallback()}
});

/* PATH figure */
const PATH_BASE=["C:\\Windows\\system32","C:\\Windows","C:\\Program Files\\Git\\cmd"],PATH_ADD="C:\\msys64\\ucrt64\\bin";
let pathBusy=false;
function pathDirs(){return document.getElementById("path-add").checked?[...PATH_BASE,PATH_ADD]:PATH_BASE}
function renderPath(){
  document.getElementById("path-rows").innerHTML=pathDirs().map((d,i)=>`<div class="pathrow${d===PATH_ADD?" added":""}" data-i="${i}"><span class="i">Path[${i}]</span><span>${esc(d)}</span><span class="res"></span></div>`).join("");
  document.getElementById("path-out").innerHTML='PS C:\\cpp&gt; <span style="color:var(--code-muted)">nhấn nút để chạy</span>';
}
document.getElementById("path-add").onchange=()=>{if(!pathBusy)renderPath()};
document.getElementById("path-run").onclick=async()=>{
  if(pathBusy)return;pathBusy=true;renderPath();
  const out=document.getElementById("path-out");out.innerHTML="PS C:\\cpp&gt; g++ --version";
  const rows=[...document.querySelectorAll("#path-rows .pathrow")],dirs=pathDirs();
  const wait=ms=>new Promise(r=>setTimeout(r,matchMedia("(prefers-reduced-motion: reduce)").matches?0:ms));
  let found=false;
  for(let i=0;i<rows.length;i++){
    rows[i].classList.add("scan");await wait(420);rows[i].classList.remove("scan");
    if(dirs[i]===PATH_ADD){rows[i].classList.add("hit");rows[i].querySelector(".res").textContent="✓ có g++.exe";found=true;break}
    rows[i].classList.add("miss");rows[i].querySelector(".res").textContent="không có";
  }
  out.innerHTML+=found?"\n<span style='color:var(--code-fg)'>g++.exe (Rev2, Built by MSYS2 project) 14.2.0\nCopyright (C) 2024 Free Software Foundation, Inc.</span>"
   :"\n<span style='color:#FF9A8F'>g++ : The term 'g++' is not recognized as the name of a cmdlet, function,\nscript file, or operable program.</span>\n<span style='color:var(--code-muted)'>→ Đã tìm hết các thư mục trong PATH mà không thấy g++.exe</span>";
  pathBusy=false;
};
renderPath();

/* checklist */
const CHECK=[
 ["Cài xong trình biên dịch","MSYS2 g++, Command Line Tools của Apple, hoặc build-essential"],
 ["g++ --version (hoặc clang++ --version) chạy được trong terminal mới",""],
 ["Cài VS Code và extension C/C++","Hoặc IDE khác theo hướng dẫn của giảng viên"],
 ["Biên dịch và chạy Hello World bằng dòng lệnh trên máy thật","g++ main.cpp -o main rồi chạy file main"],
 ["Cố tình xóa một dấu ; rồi đọc thông báo lỗi","Tìm dòng và cột được báo, sửa lại, biên dịch lần nữa"]
];
let checks=[];try{checks=JSON.parse(localStorage.getItem("cpp-l2-check")||"[]")}catch(e){}
document.getElementById("checklist").innerHTML=CHECK.map((c,i)=>`<label><input type="checkbox" id="chk-${i}" ${checks[i]?"checked":""}><span>${esc(c[0])}${c[1]?`<small>${esc(c[1])}</small>`:""}</span></label>`).join("");
document.querySelectorAll("#checklist input").forEach((x,i)=>x.onchange=()=>{checks[i]=x.checked;try{localStorage.setItem("cpp-l2-check",JSON.stringify(checks))}catch(e){}});

/* ---------- Terminal mô phỏng ---------- */
const tty=document.getElementById("tty");
let SH;
function shInit(mode){
  SH={mode,files:{"main.cpp":{type:"src",text:PRESETS.hello},"loi.cpp":{type:"src",text:PRESETS.e_semi},"chao.cpp":{type:"src",text:PRESETS.using}},hist:[],hi:0,last:0,done:new Set()};
  document.querySelectorAll("[data-sh]").forEach(b=>b.setAttribute("aria-pressed",b.dataset.sh===mode));
  document.getElementById("sh-title").textContent=mode==="win"?"PowerShell · Windows":"Terminal · Linux / macOS";
  tty.innerHTML=`<div id="tlog"><span class="sys">Thư mục học tập có sẵn 3 file. Gõ help để xem lệnh.\n</span></div><div class="inl"><span id="tprompt"></span><input id="tin" aria-label="Nhập lệnh" autocomplete="off" autocapitalize="off" spellcheck="false"></div>`;
  document.getElementById("tprompt").innerHTML=prompt_()+" ";
  const tin=document.getElementById("tin");
  tin.addEventListener("keydown",e=>{
    if(e.key==="Enter"){const v=tin.value;tin.value="";if(v.trim()){SH.hist.push(v)}SH.hi=SH.hist.length;exec(v)}
    else if(e.key==="ArrowUp"){if(SH.hi>0){SH.hi--;tin.value=SH.hist[SH.hi];e.preventDefault()}}
    else if(e.key==="ArrowDown"){if(SH.hi<SH.hist.length){SH.hi++;tin.value=SH.hist[SH.hi]||""}}
    else if(e.key==="Tab"){e.preventDefault();const parts=tin.value.split(" "),last=parts.pop(),pre=last.replace(/^(\.\/|\.\\)/,""),lead=last.slice(0,last.length-pre.length);
      const m=Object.keys(SH.files).filter(f=>f.startsWith(pre));if(m.length===1){parts.push(lead+m[0]);tin.value=parts.join(" ")}else if(m.length>1)out(m.join("  "))}
    else if(e.key==="l"&&e.ctrlKey){e.preventDefault();document.getElementById("tlog").innerHTML=""}
  });
  renderTasks();renderFiles();
}
tty.addEventListener("click",()=>{if(!getSelection().toString())document.getElementById("tin").focus({preventScroll:true})});
function prompt_(){return SH.mode==="win"?'<span class="ps">PS C:\\cpp&gt;</span>':'<span class="pr">hocvien@amts:~/cpp$</span>'}
function out(html,cls){const d=document.createElement("div");if(cls)d.className=cls;d.innerHTML=html;document.getElementById("tlog").appendChild(d);tty.scrollTop=tty.scrollHeight}
function outT(text,cls){out(esc(text),cls)}
const TASKS=[
 {id:"ver",t:"Kiểm tra trình biên dịch",c:()=>"g++ --version"},
 {id:"cat",t:"Xem nội dung file nguồn",c:()=>"cat main.cpp"},
 {id:"out",t:"Biên dịch và đặt tên file chạy là hello",c:()=>"g++ main.cpp -o hello"},
 {id:"run",t:"Chạy chương trình vừa tạo",c:()=>SH.mode==="win"?".\\hello.exe":"./hello"},
 {id:"err",t:"Biên dịch loi.cpp, đọc dòng và cột bị lỗi",c:()=>"g++ loi.cpp -o loi"},
 {id:"std",t:"Dùng chuẩn C++17 và bật cảnh báo",c:()=>"g++ -std=c++17 -Wall main.cpp -o main"}
];
function renderTasks(){
  document.getElementById("tasks").innerHTML=TASKS.map(t=>`<li class="${SH.done.has(t.id)?"done":""}"><span class="box">✓</span><span><span class="t">${t.t}</span><br><code data-fill="${esc(t.c())}" tabindex="0" role="button">${esc(t.c())}</code></span></li>`).join("");
  document.getElementById("task-count").textContent=`${SH.done.size}/${TASKS.length}`;
  document.querySelectorAll("[data-fill]").forEach(c=>{const f=()=>{const tin=document.getElementById("tin");tin.value=c.dataset.fill;tin.focus({preventScroll:true})};c.onclick=f;c.onkeydown=e=>{if(e.key==="Enter")f()}});
}
function mark(id){if(!SH.done.has(id)){SH.done.add(id);renderTasks();if(SH.done.size===TASKS.length&&window.TRACK)TRACK.ex("l2-term",true,"6/6 nhiệm vụ");if(SH.done.size===TASKS.length)out("✓ Hoàn thành cả 6 nhiệm vụ. Hãy làm lại các bước này trên máy thật của bạn.","pr")}}
function renderFiles(){
  document.getElementById("files").innerHTML=Object.keys(SH.files).sort().map(f=>`<span class="${SH.files[f].type==="exe"?"exe":SH.files[f].type==="obj"?"obj":""}">${esc(f)}</span>`).join("");
}
function fmtErr(src,err,fname){
  if(err.stage==="link")return `<span class="e">${SH.mode==="win"?"ld.exe":"/usr/bin/ld"}: ${esc(err.message)}\ncollect2: error: ld returned 1 exit status</span>`;
  if(err.stage==="run")return null;
  const ln=src.slice(0,err.pos).split("\n").length,col=err.pos-src.lastIndexOf("\n",err.pos-1),lt=src.split("\n")[ln-1]||"";
  return `<span>${esc(fname)}: In function 'int main()':</span>\n<span class="e">${esc(fname)}:${ln}:${col}: error: ${esc(err.message)}</span>\n${String(ln).padStart(5)} | ${esc(lt)}\n      | ${" ".repeat(Math.max(0,col-1))}<span class="e">^</span>\n<span class="sys">→ ${esc(err.vi)}</span>`;
}
function versionText(tool){
  if(tool==="clang++")return SH.mode==="win"?"clang version 19.1.0\nTarget: x86_64-w64-windows-gnu\nThread model: posix":"clang version 18.1.3\nTarget: x86_64-pc-linux-gnu\nThread model: posix";
  return SH.mode==="win"?`${tool}.exe (Rev2, Built by MSYS2 project) 14.2.0\nCopyright (C) 2024 Free Software Foundation, Inc.\nThis is free software; see the source for copying conditions.`:`${tool} (Ubuntu 13.3.0-6ubuntu2) 13.3.0\nCopyright (C) 2023 Free Software Foundation, Inc.\nThis is free software; see the source for copying conditions.`;
}
const STDS=["c++98","c++03","c++11","c++14","c++17","c++20","c++23","gnu++11","gnu++14","gnu++17","gnu++20"];
function gxx(tool,args){
  let outName=null,std=null,wall=false,onlyC=false,onlyE=false;const srcs=[];
  for(let i=0;i<args.length;i++){const a=args[i];
    if(a==="--version"){outT(versionText(tool));if(tool!=="gcc")mark("ver");SH.last=0;return}
    if(a==="-o"){outName=args[++i];if(!outName){out(`<span class="e">${tool}: error: missing filename after '-o'</span>`);SH.last=1;return}continue}
    if(a.startsWith("-std=")){std=a.slice(5);if(!STDS.includes(std)){out(`<span class="e">${tool}: error: unrecognized command-line option '${esc(a)}'</span>\n<span class="sys">→ Các giá trị hợp lệ: c++11, c++14, c++17, c++20, c++23</span>`);SH.last=1;return}continue}
    if(["-Wall","-Wextra","-pedantic","-Werror","-g","-O0","-O1","-O2","-O3"].includes(a)){if(a==="-Wall")wall=true;continue}
    if(a==="-c"){onlyC=true;continue}
    if(a==="-E"){onlyE=true;continue}
    if(a.startsWith("-")){out(`<span class="e">${tool}: error: unrecognized command-line option '${esc(a)}'</span>`);SH.last=1;return}
    srcs.push(a);
  }
  if(!srcs.length){out(`<span class="e">${tool}: fatal error: no input files</span>\ncompilation terminated.`);SH.last=1;return}
  for(const f of srcs){if(!SH.files[f]){out(`<span class="e">${tool}: error: ${esc(f)}: No such file or directory</span>\n<span class="sys">→ Gõ ${SH.mode==="win"?"dir":"ls"} để xem các file có trong thư mục.</span>`);SH.last=1;return}
    if(SH.files[f].type!=="src"){out(`<span class="e">${esc(f)}: file not recognized: file format not recognized</span>\n<span class="sys">→ Chỉ biên dịch file mã nguồn .cpp.</span>`);SH.last=1;return}}
  if(outName&&srcs.includes(outName)){out(`<span class="e">${tool}: fatal error: input file '${esc(outName)}' is the same as output file</span>\n<span class="sys">→ Cẩn thận: nếu đặt -o trùng tên file nguồn, bạn có thể mất code.</span>`);SH.last=1;return}
  let prog=null;
  for(const f of srcs){
    try{prog=compileRun(SH.files[f].text)}
    catch(err){if(!(err instanceof CErr))throw err;
      if(err.stage==="run"){prog={steps:[],exit:136,crash:true};continue}
      out(fmtErr(SH.files[f].text,err,f));SH.last=1;if(f==="loi.cpp")mark("err");return}
  }
  if(onlyE){const s=SH.files[srcs[0]].text.replace(/^\s*#include.*$/gm,"").replace(/\/\/.*$/gm,"").replace(/\n{2,}/g,"\n").trim();
    outT(`# 0 "${srcs[0]}"\n# 1 "/usr/include/c++/iostream" ...\n`,"sys");outT("    ... (khoảng 30 000 dòng từ thư viện) ...","sys");outT(s);SH.last=0;return}
  if(onlyC){srcs.forEach(f=>{SH.files[outName&&srcs.length===1?outName:f.replace(/\.\w+$/,"")+".o"]={type:"obj"}});renderFiles();out('<span class="sys">→ Chỉ biên dịch, chưa liên kết. File .o chưa chạy được.</span>');SH.last=0;return}
  if(srcs.length>1){out(`<span class="e">${SH.mode==="win"?"ld.exe":"/usr/bin/ld"}: multiple definition of \`main'\ncollect2: error: ld returned 1 exit status</span>\n<span class="sys">→ Mỗi chương trình chỉ được có một hàm main.</span>`);SH.last=1;return}
  if(tool==="gcc"){out(`<span class="e">${SH.mode==="win"?"ld.exe":"/usr/bin/ld"}: /tmp/ccA1b2C3.o: in function \`main':\n${esc(srcs[0])}:(.text+0x13): undefined reference to \`std::cout'\ncollect2: error: ld returned 1 exit status</span>\n<span class="sys">→ gcc là trình biên dịch C, không tự liên kết thư viện C++. Hãy dùng g++.</span>`);SH.last=1;return}
  let name=outName||(SH.mode==="win"?"a.exe":"a.out");
  if(SH.mode==="win"&&!/\.\w+$/.test(name))name+=".exe";
  SH.files[name]={type:"exe",prog,src:srcs[0]};renderFiles();SH.last=0;
  if(!outName)out(`<span class="sys">→ Biên dịch thành công, không có thông báo nào. File chạy được đặt tên mặc định ${name}.</span>`);
  else if(SH.hist.length<6)out(`<span class="sys">→ Không có thông báo nghĩa là biên dịch thành công. Đã tạo ${esc(name)}.</span>`);
  if(/^hello(\.exe)?$/.test(name)&&srcs[0]==="main.cpp")mark("out");
  if(std&&wall&&srcs[0]==="main.cpp")mark("std");
}
function runExe(name,given){
  const f=SH.files[name];
  if(!f){if(SH.mode==="win")out(`<span class="e">${esc(given)} : The term '${esc(given)}' is not recognized as the name of a cmdlet, function,\nscript file, or operable program.</span>`);else out(`<span class="e">bash: ${esc(given)}: No such file or directory</span>`);SH.last=127;return}
  if(f.type==="src"){out(SH.mode==="win"?`<span class="sys">(Windows mở ${esc(name)} bằng trình soạn thảo mặc định)</span>`:`<span class="e">bash: ${esc(given)}: Permission denied</span>\n<span class="sys">→ File .cpp là mã nguồn, phải biên dịch bằng g++ trước khi chạy.</span>`);SH.last=126;return}
  if(f.type==="obj"){out(`<span class="e">bash: ${esc(given)}: cannot execute binary file: Exec format error</span>\n<span class="sys">→ File .o chưa được liên kết. Biên dịch lại không dùng -c.</span>`);SH.last=126;return}
  if(f.prog.crash){out('<span class="e">Floating point exception (core dumped)</span>');SH.last=136;return}
  const text=f.prog.steps.map(s=>s.text||"").join("");
  if(text)outT(text.replace(/\n$/,""));
  SH.last=f.prog.exit;
  if(/^hello(\.exe)?$/.test(name))mark("run");
}
function exec(line){
  out(prompt_()+" "+esc(line));
  const a=line.trim().split(/\s+/);const c=a[0];if(!c)return;const W=SH.mode==="win";
  if(c==="help"){outT(`Lệnh hỗ trợ trong mô phỏng:
  g++ / clang++ / gcc   biên dịch (thử -o, -std=c++17, -Wall, -c, -E, --version)
  ${W?".\\ten.exe":"./ten     "}            chạy file đã biên dịch
  ${W?"dir":"ls "}                   liệt kê file
  cat / ${W?"type":"less"} <file>     xem nội dung file
  rm <file>             xóa file
  echo ${W?"$LASTEXITCODE":"$?          "}   mã thoát của chương trình vừa chạy
  pwd, clear`,"sys");return}
  if(c==="clear"||c==="cls"){document.getElementById("tlog").innerHTML="";return}
  if(c==="ls"||c==="dir"||c==="ll"){outT(Object.keys(SH.files).sort().join(W?"\n":"  "));return}
  if(c==="pwd"){outT(W?"C:\\cpp":"/home/hocvien/cpp");return}
  if(["cat","type","less","more"].includes(c)){const f=a[1];if(!f){outT("Cần tên file, ví dụ: cat main.cpp","w");return}
    const F=SH.files[f];if(!F){out(`<span class="e">${c}: ${esc(f)}: No such file or directory</span>`);return}
    if(F.type!=="src"){outT("(file nhị phân: mã máy, không đọc được bằng mắt)","sys");return}
    out(highlightLines(F.text).join("\n"));if(f==="main.cpp")mark("cat");return}
  if(c==="rm"||c==="del"){const f=a[1];if(SH.files[f]){delete SH.files[f];renderFiles()}else out(`<span class="e">${c}: cannot remove '${esc(f||"")}': No such file or directory</span>`);return}
  if(c==="echo"){const r=a.slice(1).join(" ");outT(r==="$?"?(W?(SH.last===0?"True":"False"):String(SH.last)):r==="$LASTEXITCODE"?String(SH.last):r);return}
  if(["g++","c++","clang++","gcc","g++.exe"].includes(c)){gxx(c.replace(".exe",""),a.slice(1));return}
  if(c==="cl"||c==="cl.exe"){out(W?'<span class="e">cl : The term \'cl\' is not recognized…</span>\n<span class="sys">→ cl (MSVC) chỉ dùng được trong "Developer PowerShell for VS". Ở đây hãy dùng g++.</span>':'<span class="e">cl: command not found</span>');return}
  let m;
  if((m=/^\.[\/\\](.+)$/.exec(c))){let n=m[1];if(W&&!SH.files[n]&&SH.files[n+".exe"])n+=".exe";runExe(n,c);return}
  if(SH.files[c]||SH.files[c+".exe"]){
    if(W){out(`<span class="e">${esc(c)} : The term '${esc(c)}' is not recognized as the name of a cmdlet, function,\nscript file, or operable program.</span>\n<span class="sys">→ PowerShell không chạy file ở thư mục hiện tại nếu thiếu .\\ — gõ .\\${esc(c)}</span>`)}
    else out(`<span class="e">${esc(c)}: command not found</span>\n<span class="sys">→ Linux chỉ tìm lệnh trong PATH. Để chạy file ở thư mục hiện tại, gõ ./${esc(c)}</span>`);
    SH.last=127;return}
  if(W)out(`<span class="e">${esc(c)} : The term '${esc(c)}' is not recognized as the name of a cmdlet, function,\nscript file, or operable program.</span>`);else out(`<span class="e">${esc(c)}: command not found</span>`);
  SH.last=127;
}
document.querySelectorAll("[data-sh]").forEach(b=>b.onclick=()=>shInit(b.dataset.sh));
document.getElementById("sh-reset").onclick=()=>shInit(SH.mode);
shInit(HOST==="win"?"win":"nix");

makeQuiz("quiz2","score2",[{"q": "Lệnh nào kiểm tra g++ đã được cài và gọi được từ terminal?", "o": ["<code>g++ --version<\/code>", "<code>g++ install<\/code>", "<code>cpp check<\/code>", "<code>main.exe<\/code>"], "a": 0, "e": "Nếu terminal in ra tên và phiên bản trình biên dịch, g++ đã được cài và PATH đã đúng."}, {"q": "Trên Linux, <code>g++ main.cpp<\/code> (không có <code>-o<\/code>) tạo ra file nào?", "o": ["main", "main.exe", "a.out", "main.o"], "a": 2, "e": "Khi không chỉ định tên bằng -o, g++ dùng tên mặc định a.out (trên Windows là a.exe)."}, {"q": "Đã cài MSYS2 nhưng PowerShell báo <code>'g++' is not recognized<\/code>. Nguyên nhân có khả năng nhất?", "o": ["File main.cpp có lỗi", "Thư mục chứa g++ chưa nằm trong PATH", "Thiếu #include &lt;iostream&gt;", "Phải dùng gcc thay g++"], "a": 1, "e": "Terminal chỉ tìm lệnh trong các thư mục thuộc PATH. Thêm C:\\msys64\\ucrt64\\bin vào Path rồi mở terminal mới."}, {"q": "IDE (như VS Code) đóng vai trò gì?", "o": ["Thay thế hoàn toàn trình biên dịch", "Nơi viết code, gọi trình biên dịch phía sau khi bấm Run", "Chỉ dùng để chạy file .exe", "Chuyển C++ thành Python"], "a": 1, "e": "IDE không tự biên dịch được nếu máy chưa có g++, clang++ hoặc MSVC."}]);

fillSnips();
