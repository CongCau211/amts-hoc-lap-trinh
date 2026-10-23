lazyWidgets();
Object.assign(SNIP,{"l3a": "#include <iostream>\nusing namespace std;\n\nint main() {\n    int a, b;\n    cout << \"Nhập hai số: \";\n    cin >> a >> b;          // dữ liệu chảy từ cin vào a, rồi vào b\n    cout << \"Tổng: \" << a + b << endl;\n    return 0;\n}"});PRESET_NOTES["l3"]={"Ví dụ: Tổng hai số (nhập tay)": "cin đọc dữ liệu từ bàn phím vào biến. Chạy rồi gõ hai số cách nhau dấu cách: xem hai số đi vào bộ đệm cin trước, rồi lần lượt vào a và b.", "Ví dụ: Đọc nhiều kiểu cùng lúc": "Một lệnh cin >> có thể đọc nhiều biến khác kiểu. Quan sát cin tự cắt dữ liệu theo dấu cách và đổi chữ “20” thành số int, “1.72” thành double.", "Ví dụ: Nhập sai kiểu": "Khi dữ liệu không khớp kiểu biến, cin rơi vào trạng thái lỗi. Xem a nhận 0, còn lệnh đọc b phía sau bị bỏ qua dù vẫn còn số 5 trong bộ đệm.", "Lỗi logic: getline bị bỏ qua": "Lỗi hay gặp khi trộn cin >> với getline: ký tự xuống dòng còn sót trong bộ đệm khiến getline đọc ngay một chuỗi rỗng. Theo dõi ô bộ đệm sau khi đọc tuổi.", "Sửa: dùng cin.ignore": "Cách sửa lỗi trên: cin.ignore bỏ phần còn sót (đến hết dòng) trước khi gọi getline. So sánh với ví dụ trước để thấy họ tên được đọc đúng.", "Ví dụ: Định dạng số thực và căn cột": "Định dạng số thực khi in: setprecision, fixed và setw giúp kết quả gọn và thẳng cột. So sánh từng dòng in ra với cách viết lệnh tương ứng.", "Ví dụ: viết đầy đủ std:: (không dùng using)": "Cùng chương trình nhưng không có using namespace std;, nên mọi tên của thư viện chuẩn phải ghi kèm std:: (std::cin, std::cout, std::string). Bạn sẽ gặp cách viết này trong nhiều tài liệu và dự án lớn; kết quả chạy giống hệt.", "Lỗi: dùng << với cin": "Lỗi biên dịch: cin dùng >> (dữ liệu đi VÀO biến), cout mới dùng <<. Đọc thông báo lỗi của trình biên dịch để quen cách nó báo sai toán tử.", "Lỗi: cin >> một giá trị": "Lỗi biên dịch: cin chỉ đọc vào một biến, không đọc vào một biểu thức như a + 1. Thông báo lỗi cho biết vế phải phải là biến.", "Lỗi: thiếu <iomanip>": "Lỗi biên dịch: setprecision nằm trong thư viện <iomanip>. Thiếu #include thì tên này không tồn tại; trình biên dịch còn gợi ý thư viện cần thêm."};EX_HINTS["l3"]=[["Đọc cả hai số bằng một lệnh: cin >> a >> b;", "In hai dòng, mỗi dòng kết thúc bằng \"\\n\": Tong rồi Hieu (a − b)."], ["Đọc tuổi bằng cin >>, nhưng họ tên có dấu cách nên phải dùng getline.", "Trước getline, dùng cin.ignore(...) để bỏ ký tự xuống dòng còn sót sau khi đọc tuổi."], ["Đọc 3 số vào 3 biến double rồi tính (a + b + c) / 3.", "In với fixed << setprecision(2) (cần #include <iomanip>)."]];
/* ===================== BÀI 3 · Nhập xuất với cin / cout ===================== */
/* Bài 3 · Nhập xuất với cin / cout
   Mã riêng của bài: ví dụ cho trình mô phỏng, công cụ minh họa, bài tập chấm tự động.
   Trắc nghiệm nằm ở quiz.json, đoạn code minh họa ở snippets/*.cpp. */
/* ---------- mô phỏng bộ đệm nhanh (Bài 3) ---------- */
function makeBufTry(el){
  const TY=["int","double","char","string"];
  el.innerHTML=`<div class="bt-top"><label class="stdin-row" style="flex:1"><span>Bạn gõ</span><input id="bt-in" value="  12 3.5 An" spellcheck="false" autocomplete="off"></label><span class="crumb">rồi nhấn Enter (↵)</span></div>
   <div class="bt-code"><code>cin</code>${[0,1,2].map(i=>` <code>&gt;&gt;</code> <select id="bt-t${i}" aria-label="Kiểu biến ${"abc"[i]}" class="v${i}">${TY.map(t=>`<option>${t}</option>`).join("")}</select> <code class="v${i}">${"abc"[i]}</code>`).join("")}<code>;</code></div>
   <div class="cells big" id="bt-cells"></div>
   <div class="bt-vars" id="bt-vars"></div><p class="bt-note" id="bt-note"></p>`;
  const sel=[0,1,2].map(i=>el.querySelector("#bt-t"+i));sel[0].value="int";sel[1].value="double";sel[2].value="string";
  function upd(){const raw=el.querySelector("#bt-in").value;
    const ts=sel.map(s=>s.value);
    const src=`#include <iostream>\n#include <string>\nusing namespace std;\nint main(){\n${ts.map((t,i)=>`${t} ${"abc"[i]}${t==="string"?"":"{}"};`).join("\n")}\ncin >> a >> b >> c;\n}`;
    const c=compile2(src);const M=new M2(c.prog,src,{input:raw+"\n",interactive:false});M.runAll();
    M.reads.forEach(r=>r.color="abc".indexOf(r.n));
    el.querySelector("#bt-cells").innerHTML=bufCells(M.buf,M.reads,M.pos,{colors:true});
    el.querySelector("#bt-vars").innerHTML=["a","b","c"].map((n,i)=>{const V=M.vars.get(n);const r=M.reads.find(x=>x.n===n);
      return `<div class="bv v${i}"><span>${n} <small>${esc(tn(V.t))}</small></span><b>${r&&!r.ok?'<span class="garb">0 · đọc lỗi</span>':r?showVal(V):'<span class="garb">bị bỏ qua</span>'}</b></div>`}).join("");
    const fails=M.reads.filter(r=>!r.ok);const left=M.buf.slice(M.pos).replace(/\n$/,"");
    el.querySelector("#bt-note").innerHTML=fails.length?`cin không đọc được <b>${fails[0].n}</b> vì “${esc(M.buf.slice(fails[0].a).trim().split(/\s/)[0]||"(hết dữ liệu)")}” không phải kiểu ${esc(tn(M.vars.get(fails[0].n).t))}. cin chuyển sang trạng thái lỗi, các lệnh đọc sau bị bỏ qua.`
      :left.trim()?`Còn lại trong bộ đệm: “${esc(left)}”. Lần đọc tiếp theo sẽ lấy từ đây.`:"Mọi dữ liệu đã được đọc. Ký tự ↵ cuối cùng vẫn còn trong bộ đệm.";
  }
  el.addEventListener("input",upd);el.addEventListener("change",upd);upd();
}

/* ---------- bước qua bộ đệm (getline) ---------- */
function makeLineStepper(el,variants){
  let vi=0,M=null,k=0;
  el.innerHTML=`<div class="seg" role="group" aria-label="Phiên bản code">${variants.map((v,i)=>`<button aria-pressed="${i===0}" data-v="${i}">${esc(v.label)}</button>`).join("")}</div>
   <div class="ls-body"><div class="code ls-code"></div><div class="ls-right"><div class="pane-h" style="padding:0 0 6px">Bộ đệm · dữ liệu gõ: <code class="ls-in"></code></div><div class="cells big ls-cells"></div><div class="ls-vars"></div></div></div>
   <p class="ls-cap"></p><div class="pipe-ctl"><button class="btn ls-prev">← Lùi</button><button class="btn pri ls-next">Bước tiếp</button><button class="btn ls-reset">Làm lại</button><span class="crumb ls-k"></span></div>`;
  const V=()=>variants[vi],SD=steady(el,[".ls-body",".ls-cap"],()=>M&&prime());
  function start(keep){const v=V();if(!keep)SD.free();const c=compile2(v.code);M=new M2(c.prog,v.code,{input:v.input,interactive:false});k=0;render();if(!keep)prime()}
  /* giữ sẵn chiều cao: chạy thử một lượt tới bước cuối, rồi quay lại bước đang xem */
  function prime(){const t=k;start(true);while(!M.done&&k<V().caps.length-1){adv();render()}start(true);for(let i=0;i<t;i++)adv();render()}
  function render(){const v=V();const L=highlightLines(v.code);const cur=M.nextLine();
    el.querySelector(".ls-code").innerHTML=L.map((s,i)=>`<span class="ln${i+1===cur&&!M.done?" hl":""}" data-n="${i+1}">${s||" "}</span>`).join("");
    el.querySelector(".ls-in").textContent=JSON.stringify(v.input).slice(1,-1);
    el.querySelector(".ls-cells").innerHTML=bufCells(M.buf,M.reads,M.pos);
    el.querySelector(".ls-vars").innerHTML=M.order.map(n=>{const x=M.vars.get(n);return `<div class="bv"><span>${esc(n)} <small>${esc(tn(x.t))}</small></span><b>${showVal(x)}</b></div>`}).join("");
    el.querySelector(".ls-cap").innerHTML=v.caps[k]||"";
    el.querySelector(".ls-k").textContent=`Bước ${k} / ${v.caps.length-1}`;
    el.querySelector(".ls-next").disabled=M.done||k>=v.caps.length-1;el.querySelector(".ls-prev").disabled=k<=0;SD.hold()}
  const adv=()=>{let r;do{r=M.step()}while(r.s==="ran"&&M.last&&M.last.s&&M.last.s.k==="decl");k++};
  el.querySelector(".ls-next").onclick=()=>{if(!SD.ok())prime();adv();render()};
  el.querySelector(".ls-prev").onclick=()=>{if(k<=0)return;if(!SD.ok())prime();const t=k-1;start(true);for(let i=0;i<t;i++)adv();render()};
  el.querySelector(".ls-reset").onclick=()=>start();
  el.querySelectorAll("[data-v]").forEach(b=>b.onclick=()=>{vi=+b.dataset.v;el.querySelectorAll("[data-v]").forEach(x=>x.setAttribute("aria-pressed",x===b));start()});
  start();
}
const P3=[
 {label:"Ví dụ: Tổng hai số (nhập tay)",code:`#include <iostream>
using namespace std;

int main() {
    int a, b;
    cout << "Nhập hai số nguyên: ";
    cin >> a >> b;
    cout << "Tổng = " << a + b << endl;
    return 0;
}`},
 {label:"Ví dụ: Đọc nhiều kiểu cùng lúc",input:"An 20 1.72 M",code:`#include <iostream>
#include <string>
using namespace std;

int main() {
    string ten;
    int tuoi;
    double chieuCao;
    char gioiTinh;
    cin >> ten >> tuoi >> chieuCao >> gioiTinh;
    cout << ten << ", " << tuoi << " tuổi, cao "
              << chieuCao << " m, giới tính " << gioiTinh << "\\n";
    return 0;
}`},
 {label:"Ví dụ: Nhập sai kiểu",input:"abc 5",code:`#include <iostream>
using namespace std;

int main() {
    int a = 1, b = 2;
    cin >> a;    // gõ chữ vào biến int
    cin >> b;    // bị bỏ qua vì cin đang lỗi
    cout << "a = " << a << ", b = " << b << "\\n";
    cout << "cin.fail() = " << cin.fail() << "\\n";
    return 0;
}`},
 {label:"Lỗi logic: getline bị bỏ qua",input:"20\nNguyễn Văn An",code:`#include <iostream>
#include <string>
using namespace std;

int main() {
    int tuoi;
    string hoTen;
    cout << "Tuổi: ";
    cin >> tuoi;
    cout << "Họ tên: ";
    getline(cin, hoTen);   // đọc phải ↵ còn sót
    cout << "[" << hoTen << "] " << tuoi << " tuổi\\n";
    return 0;
}`},
 {label:"Sửa: dùng cin.ignore",input:"20\nNguyễn Văn An",code:`#include <iostream>
#include <string>
#include <limits>
using namespace std;

int main() {
    int tuoi;
    string hoTen;
    cout << "Tuổi: ";
    cin >> tuoi;
    cin.ignore(numeric_limits<streamsize>::max(), '\\n');
    cout << "Họ tên: ";
    getline(cin, hoTen);
    cout << "[" << hoTen << "] " << tuoi << " tuổi\\n";
    return 0;
}`},
 {label:"Ví dụ: Định dạng số thực và căn cột",code:`#include <iostream>
#include <iomanip>
using namespace std;

int main() {
    double pi = 3.14159265358979;
    cout << pi << "\\n";                        // mặc định
    cout << setprecision(3) << pi << "\\n"; // 3 chữ số có nghĩa
    cout << fixed << setprecision(2);  // 2 số sau dấu phẩy
    cout << pi << "\\n";
    cout << setw(10) << "Mon" << setw(10) << "Gia" << "\\n";
    cout << setw(10) << "Pho" << setw(10) << 45.5 << "\\n";
    cout << setw(10) << "Com" << setw(10) << 38.0 << "\\n";
    // Lưu ý: setw đếm theo byte, chữ có dấu chiếm 2-3 byte nên lệch cột
    return 0;
}`},
 {label:"Ví dụ: viết đầy đủ std:: (không dùng using)",input:"Lan 9.5",code:`#include <iostream>
#include <string>

int main() {
    std::string ten;
    double diem;
    std::cin >> ten >> diem;
    std::cout << "Bạn " << ten << " đạt " << diem << " điểm" << std::endl;
    return 0;
}`},
 {label:"Lỗi: dùng << với cin",code:`#include <iostream>
using namespace std;

int main() {
    int a;
    cin << a;
    return 0;
}`},
 {label:"Lỗi: cin >> một giá trị",code:`#include <iostream>
using namespace std;

int main() {
    int a;
    cin >> a + 1;
    return 0;
}`},
 {label:"Lỗi: thiếu <iomanip>",code:`#include <iostream>
using namespace std;

int main() {
    double x = 2.0 / 3;
    cout << setprecision(4) << x << "\\n";
    return 0;
}`}
];
const sim3=makeSim2(document.getElementById("sim-l3"),{id:"s3",presets:P3});

makeBufTry(document.getElementById("buftry"));
makeLineStepper(document.getElementById("linestep"),[
 {label:"Viết sai",input:"20\nNguyễn Văn An\n",code:`int tuoi;
string hoTen;
cin >> tuoi;
getline(cin, hoTen);`,
  caps:["Người dùng gõ <b>20↵</b> rồi <b>Nguyễn Văn An↵</b>. Mọi thứ đều nằm trong bộ đệm.","<code>cin &gt;&gt; tuoi</code> đọc “20” rồi dừng ở ↵. <b>Ký tự ↵ vẫn nằm lại.</b>","<code>getline</code> đọc tới ↵ đầu tiên, mà ↵ đứng ngay vị trí hiện tại, nên <b>hoTen là chuỗi rỗng</b>. Dòng họ tên bị bỏ lại chưa đọc."]},
 {label:"Sửa bằng cin.ignore()",input:"20\nNguyễn Văn An\n",code:`int tuoi;
string hoTen;
cin >> tuoi;
cin.ignore();
getline(cin, hoTen);`,
  caps:["Cùng dữ liệu như trước: <b>20↵Nguyễn Văn An↵</b>.","<code>cin &gt;&gt; tuoi</code> đọc “20”, ↵ còn lại.","<code>cin.ignore()</code> bỏ đi đúng 1 ký tự: chính là ↵ còn sót.","Lúc này <code>getline</code> đọc trọn “Nguyễn Văn An” và bỏ ↵ cuối dòng."]}
].map(v=>({...v,code:`#include <iostream>\n#include <string>\nusing namespace std;\n\nint main() {\n${v.code.split("\n").map(l=>"    "+l).join("\n")}\n}`})));

makeEx2(document.getElementById("ex-l3"),sim3,[
 {t:"Tổng và hiệu",d:"Nhập hai số nguyên a và b trên một dòng. In 2 dòng: “Tong: …” và “Hieu: …” (a − b).",
  tests:[{in:"3 7",out:"Tong: 10\nHieu: -4"},{in:"10 -4",out:"Tong: 6\nHieu: 14"},{in:"0 0",out:"Tong: 0\nHieu: 0"}],
  start:`#include <iostream>
using namespace std;

int main() {
    int a, b;
    // Đọc a, b rồi in kết quả

    return 0;
}`},
 {t:"Lời chào",d:"Dòng 1 là tuổi, dòng 2 là họ tên đầy đủ (có dấu cách). In: “Xin chao <họ tên>, nam sau ban <tuổi + 1> tuoi.”",
  tests:[{in:"20\nNguyen Van An",out:"Xin chao Nguyen Van An, nam sau ban 21 tuoi."},{in:"17\nTran Thi Binh",out:"Xin chao Tran Thi Binh, nam sau ban 18 tuoi."}],
  start:`#include <iostream>
#include <string>
#include <limits>
using namespace std;

int main() {
    int tuoi;
    string hoTen;
    // Gợi ý: nhớ xử lý ký tự xuống dòng còn sót

    return 0;
}`},
 {t:"Điểm trung bình",d:"Nhập 3 điểm (số thực) trên một dòng. In “Trung binh: X” với đúng 2 chữ số sau dấu phẩy.",
  tests:[{in:"7 8.5 8",out:"Trung binh: 7.83"},{in:"10 10 10",out:"Trung binh: 10.00"},{in:"5 6 7.5",out:"Trung binh: 6.17"}],
  start:`#include <iostream>
#include <iomanip>
using namespace std;

int main() {
    double d1, d2, d3;

    return 0;
}`}
]);

makeQuiz("quiz3","score3",[{"q": "Với <code>cin &gt;&gt; a &gt;&gt; b;<\/code> (a, b kiểu int), người dùng gõ <code>12   34↵<\/code>. b bằng bao nhiêu?", "o": ["12", "34", "0", "1234"], "a": 1, "e": "&gt;&gt; bỏ qua mọi khoảng trắng ở đầu, kể cả nhiều dấu cách liền nhau, nên b nhận 34."}, {"q": "Gõ <code>3.7<\/code> vào <code>int x<\/code> bằng <code>cin &gt;&gt; x<\/code>. Chuyện gì xảy ra?", "o": ["x = 4 (làm tròn)", "x = 3, phần “.7” còn lại trong bộ đệm", "cin báo lỗi, x = 0", "x = 3.7"], "a": 1, "e": "cin đọc chữ số cho tới khi gặp dấu chấm, vốn không thuộc số nguyên. “.7” chờ lần đọc sau."}, {"q": "Vì sao <code>getline<\/code> ngay sau <code>cin &gt;&gt; tuoi<\/code> trả về chuỗi rỗng?", "o": ["getline bị lỗi trên Windows", "Ký tự ↵ từ lần nhập trước còn trong bộ đệm", "Phải dùng cin &gt;&gt; thay cho getline", "Thiếu #include &lt;iomanip&gt;"], "a": 1, "e": "cin &gt;&gt; không lấy ↵ đi. getline thấy ↵ ngay lập tức nên kết thúc với chuỗi rỗng. Sửa bằng cin.ignore()."}, {"q": "In <code>2.0/3<\/code> thành <code>0.667<\/code> cần viết?", "o": ["<code>setprecision(3)<\/code>", "<code>fixed &lt;&lt; setprecision(3)<\/code>", "<code>setw(3)<\/code>", "Cả A và B đều được"], "a": 3, "e": "setprecision(3) cho 3 chữ số có nghĩa: 0.667. fixed &lt;&lt; setprecision(3) cho 3 chữ số sau dấu phẩy: cũng 0.667. Hai cách khác nhau với số có phần nguyên lớn."}]);

fillSnips();
