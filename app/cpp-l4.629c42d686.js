lazyWidgets();
Object.assign(SNIP,{"l4a": "int tuoi;              // khai báo: chưa có giá trị (rác)\nint soLuong = 10;      // khởi tạo sao chép\ndouble diem(8.5);      // khởi tạo trực tiếp\nchar xepLoai{'A'};     // khởi tạo bằng ngoặc nhọn (khuyên dùng)\nint tong{};            // { } để trống: giá trị 0"});PRESET_NOTES["l4"]={"Ví dụ: Khai báo, khởi tạo, gán": "Biến là ô nhớ có tên, có kiểu. Chạy từng bước để thấy khai báo tạo ô nhớ, khởi tạo đặt giá trị đầu tiên, còn phép gán thay giá trị cũ bằng giá trị mới.", "Ví dụ: Ba cách khởi tạo": "C++ có nhiều cách khởi tạo: =, ( ) và { }. Chú ý int d{} nhận 0, và int f = e âm thầm cắt 3.9 thành 3 mà không báo lỗi.", "Ví dụ: Tăng, giảm ++ và --": "x++ và ++x đều tăng x thêm 1, khác nhau ở giá trị trả về: x++ trả giá trị cũ, ++x trả giá trị mới. Chạy từng bước và theo dõi y, z.", "Lỗi logic: tráo đổi sai": "Lỗi logic khi đổi chỗ hai biến: gán a = b làm mất giá trị cũ của a. Chương trình vẫn chạy nhưng kết quả sai, xem bảng bộ nhớ ở từng bước.", "Sửa: tráo đổi với biến tạm": "Cách đúng để đổi chỗ: lưu tạm một giá trị trước khi ghi đè. Theo dõi biến tam giữ số 5 trong lúc a nhận giá trị của b.", "Cảnh báo: biến chưa khởi tạo": "Biến cục bộ chưa khởi tạo chứa giá trị rác. Trình biên dịch cảnh báo; kết quả in ra không đoán trước được. Luôn khởi tạo biến khi khai báo.", "Lỗi: dùng trước khi khai báo": "Lỗi biên dịch: biến phải được khai báo trước khi dùng. Trình biên dịch đọc từ trên xuống nên chưa biết diem ở dòng gán.", "Lỗi: khai báo trùng tên": "Lỗi biên dịch: trong cùng một khối không được khai báo hai biến trùng tên. Muốn đổi giá trị thì chỉ cần gán, không khai báo lại.", "Cảnh báo: thu hẹp kiểu từ biến với { }": "Khởi tạo bằng { } không cho phép mất dữ liệu (thu hẹp kiểu) như đưa 49.9 vào int. Đây là lý do nên dùng { } khi muốn được bảo vệ.", "Lỗi: sai chữ hoa, chữ thường": "Lỗi biên dịch: C++ phân biệt chữ hoa, chữ thường. soHocvien và soHocVien là hai tên khác nhau; trình biên dịch còn gợi ý tên gần đúng.", "Lỗi: tên biến có dấu cách": "Lỗi biên dịch: tên biến không được chứa dấu cách. Dùng kiểu viết soHocVien hoặc so_hoc_vien.", "Lỗi: gán cho hằng const": "Lỗi biên dịch: biến khai báo const không đổi được giá trị sau khi khởi tạo. Đây là cách trình biên dịch giúp tránh sửa nhầm hằng số."};EX_HINTS["l4"]=[["Cần một biến tạm: tam = a; a = b; b = tam;", "In đúng định dạng: \"a = \" << a << \", b = \" << b."], ["Chu vi = 2 × (dài + rộng), diện tích = dài × rộng.", "In hai dòng: \"Chu vi: \" và \"Dien tich: \"."], ["Số giờ = tổng / 3600; phần còn lại = tổng % 3600.", "Từ phần còn lại: phút = còn lại / 60, giây = còn lại % 60."]];
/* ===================== BÀI 4 · Biến, khai báo, khởi tạo ===================== */
/* Bài 4 · Biến, khai báo, khởi tạo
   Mã riêng của bài: ví dụ cho trình mô phỏng, công cụ minh họa, bài tập chấm tự động.
   Trắc nghiệm nằm ở quiz.json, đoạn code minh họa ở snippets/*.cpp. */
/* ---------- bảng theo dõi giá trị (Bài 4) ---------- */
function makeTrace(el,snips){
  el.innerHTML=snips.map((s,i)=>`<div class="tr-card" data-i="${i}">
    <div class="tr-head"><h4>${esc(s.t)}</h4></div>
    <div class="code">${highlightLines(s.code).map((l,k)=>`<span class="ln" data-n="${k+1}">${l||" "}</span>`).join("")}</div>
    <div class="tr-ask">Sau khi chạy hết:${s.ask.map(v=>` <label><code>${v}</code> = <input id="tr-${i}-${v}" inputmode="numeric" autocomplete="off" size="4"></label>`).join("")}
    <button class="btn pri" data-chk="${i}">Kiểm tra</button><button class="btn" data-show="${i}">Xem bảng theo dõi</button></div>
    <div class="tr-res"></div><div class="tr-tbl"></div></div>`).join("");
  function trace(s){const src=`int main(){\n${s.code}\n}`;const c=compile2(src);const M=new M2(c.prog,src,{interactive:false});const rows=[];const lines=s.code.split("\n");
    while(!M.done&&M.i<M.st.length){const ln=M.line(M.st[M.i].p)-1;const r=M.step();rows.push({code:lines[ln-1].trim(),vals:s.ask.map(n=>M.vars.has(n)?(M.vars.get(n).init?String(M.vars.get(n).v):"?"):"—"),ch:r.ch})}
    return{rows,M}}
  el.querySelectorAll("[data-chk]").forEach(b=>b.onclick=()=>{const i=+b.dataset.chk,s=snips[i];const {M}=trace(s);
    const res=s.ask.map(n=>{const g=el.querySelector(`#tr-${i}-${n}`).value.trim();return{n,ok:g!==""&&Number(g)===M.vars.get(n).v}});
    const all=res.every(x=>x.ok);const box=el.querySelector(`.tr-card[data-i="${i}"] .tr-res`);
    box.className="tr-res "+(all?"ok":"bad");box.innerHTML=all?"✓ Chính xác!":`Chưa đúng: ${res.filter(x=>!x.ok).map(x=>x.n).join(", ")}. Hãy xem bảng theo dõi để thấy giá trị thay đổi qua từng dòng.`});
  el.querySelectorAll("[data-show]").forEach(b=>b.onclick=()=>{const i=+b.dataset.show,s=snips[i];const {rows}=trace(s);
    el.querySelector(`.tr-card[data-i="${i}"] .tr-tbl`).innerHTML=`<div class="tbl"><table><thead><tr><th>Câu lệnh</th>${s.ask.map(n=>`<th><code>${n}</code></th>`).join("")}</tr></thead><tbody>${rows.map(r=>`<tr><td><code>${esc(r.code)}</code></td>${r.vals.map((v,k)=>`<td class="${r.ch&&r.ch.has(s.ask[k])?"chg":""}">${esc(v)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`});
}

/* ---------- kiểm tra tên biến (Bài 4) ---------- */
const CPP_KW="alignas alignof and asm auto bool break case catch char char16_t char32_t char8_t class const constexpr const_cast continue decltype default delete do double dynamic_cast else enum explicit export extern false float for friend goto if inline int long mutable namespace new noexcept not nullptr operator or private protected public register reinterpret_cast return short signed sizeof static static_assert static_cast struct switch template this throw true try typedef typeid typename union unsigned using virtual void volatile wchar_t while".split(" ");
function checkName(s){
  if(!s)return{st:"",msg:"Gõ một tên để kiểm tra."};
  if(/\s/.test(s))return{st:"bad",msg:"Không được chứa dấu cách.",tip:s.trim().replace(/\s+(\w)/g,(_,c)=>c.toUpperCase())};
  if(/[^\x00-\x7F]/.test(s))return{st:"bad",msg:"Không được dùng chữ có dấu tiếng Việt hay ký tự đặc biệt Unicode.",tip:s.normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/đ/g,"d").replace(/Đ/g,"D")};
  if(/^\d/.test(s))return{st:"bad",msg:"Không được bắt đầu bằng chữ số.",tip:"so"+s};
  if(/[^A-Za-z0-9_]/.test(s))return{st:"bad",msg:`Ký tự “${s.match(/[^A-Za-z0-9_]/)[0]}” không hợp lệ. Chỉ dùng chữ cái a–z, A–Z, chữ số và dấu gạch dưới _.`,tip:s.replace(/[^A-Za-z0-9_]+/g,"_")};
  if(CPP_KW.includes(s))return{st:"bad",msg:`“${s}” là từ khóa của C++.`,tip:s+"Value"};
  if(/^_[A-Z]/.test(s)||s.includes("__"))return{st:"warn",msg:"Hợp lệ, nhưng tên bắt đầu bằng _ + chữ hoa hoặc chứa __ được dành riêng cho trình biên dịch và thư viện chuẩn. Nên tránh."};
  let style="";
  if(/^[a-z][a-z0-9]*([A-Z][a-z0-9]*)+$/.test(s))style="camelCase, kiểu phổ biến cho tên biến.";
  else if(/^[a-z][a-z0-9]*(_[a-z0-9]+)+$/.test(s))style="snake_case, cũng rất phổ biến (thư viện chuẩn C++ dùng kiểu này).";
  else if(/^[A-Z][A-Z0-9]*(_[A-Z0-9]+)*$/.test(s))style="CHỮ_HOA, thường dành cho hằng số.";
  else if(/^[A-Z][a-zA-Z0-9]*$/.test(s))style="PascalCase, thường dành cho tên kiểu/lớp (Chương 8).";
  else if(s.length===1)style="Tên một chữ chỉ nên dùng cho biến đếm hoặc công thức ngắn. Tên có nghĩa giúp code dễ đọc hơn.";
  else style="Hợp lệ.";
  return{st:"ok",msg:"Tên hợp lệ. "+style};
}
function makeNameCheck(el){
  const ex=["diemToan","so_luong","2lop","so luong","điểm","int","my-var","_Temp","x","MAX_SIZE","Diem"];
  el.innerHTML=`<label class="stdin-row"><span>Tên biến</span><input id="nm-in" value="diemToan" spellcheck="false" autocomplete="off"></label>
    <div class="chips">${ex.map(x=>`<button class="chip-btn" data-x="${esc(x)}">${esc(x)}</button>`).join("")}</div><div class="nm-out" id="nm-out" aria-live="polite"></div>`;
  const inp=el.querySelector("#nm-in");
  const upd=()=>{const r=checkName(inp.value);const o=el.querySelector("#nm-out");o.className="nm-out "+r.st;
    o.innerHTML=r.st?`<b>${r.st==="ok"?"✓ Hợp lệ":r.st==="warn"?"⚠ Nên tránh":"✗ Không hợp lệ"}</b><span>${esc(r.msg)}</span>${r.tip?`<span>Gợi ý: <code>${esc(r.tip)}</code></span>`:""}`:esc(r.msg)};
  inp.addEventListener("input",upd);
  el.querySelectorAll("[data-x]").forEach(b=>b.onclick=()=>{inp.value=b.dataset.x;upd()});upd();
}
const P4=[
 {label:"Ví dụ: Khai báo, khởi tạo, gán",code:`#include <iostream>
using namespace std;

int main() {
    int soLuong = 3;
    double donGia = 12.5;
    double thanhTien = soLuong * donGia;
    cout << "Thành tiền: " << thanhTien << "\\n";

    soLuong = soLuong + 2;   // gán: tính vế phải rồi cất vào vế trái
    thanhTien = soLuong * donGia;
    thanhTien += 10;         // phí giao hàng
    cout << "Sau khi đổi: " << thanhTien << "\\n";
    return 0;
}`},
 {label:"Ví dụ: Ba cách khởi tạo",code:`#include <iostream>
using namespace std;

int main() {
    int a = 7;
    int b(7);
    int c{7};
    int d{};          // 0
    double e = 3.9;
    int f = e;        // âm thầm cắt còn 3
    cout << a << " " << b << " " << c << " " << d << " " << f << "\\n";
    return 0;
}`},
 {label:"Ví dụ: Tăng, giảm ++ và --",code:`#include <iostream>
using namespace std;

int main() {
    int x = 5;
    int y = x++;   // y nhận 5, sau đó x thành 6
    int z = ++x;   // x thành 7, rồi z nhận 7
    x--;
    cout << "x = " << x << ", y = " << y << ", z = " << z << "\\n";
    return 0;
}`},
 {label:"Lỗi logic: tráo đổi sai",code:`#include <iostream>
using namespace std;

int main() {
    int a = 5, b = 9;
    a = b;    // a = 9, giá trị 5 bị mất!
    b = a;    // b = 9
    cout << "a = " << a << ", b = " << b << "\\n";
    return 0;
}`},
 {label:"Sửa: tráo đổi với biến tạm",code:`#include <iostream>
using namespace std;

int main() {
    int a = 5, b = 9;
    int tam = a;
    a = b;
    b = tam;
    cout << "a = " << a << ", b = " << b << "\\n";
    return 0;
}`},
 {label:"Cảnh báo: biến chưa khởi tạo",code:`#include <iostream>
using namespace std;

int main() {
    int tong;          // quên khởi tạo
    int diem = 8;
    tong = tong + diem;
    cout << "Tổng: " << tong << "\\n";
    return 0;
}`},
 {label:"Lỗi: dùng trước khi khai báo",code:`#include <iostream>
using namespace std;

int main() {
    diem = 9;
    int diem;
    return 0;
}`},
 {label:"Lỗi: khai báo trùng tên",code:`#include <iostream>
using namespace std;

int main() {
    int soLuong = 5;
    int soLuong = 8;
    return 0;
}`},
 {label:"Cảnh báo: thu hẹp kiểu từ biến với { }",code:`#include <iostream>
using namespace std;

int main() {
    double gia = 49.9;
    int giaLamTron{gia};
    return 0;
}`},
 {label:"Lỗi: sai chữ hoa, chữ thường",code:`#include <iostream>
using namespace std;

int main() {
    int soHocVien = 30;
    cout << soHocvien << "\\n";
    return 0;
}`},
 {label:"Lỗi: tên biến có dấu cách",code:`#include <iostream>
using namespace std;

int main() {
    int so hoc vien = 30;
    return 0;
}`},
 {label:"Lỗi: gán cho hằng const",code:`#include <iostream>
using namespace std;

int main() {
    const double PI = 3.14159;
    PI = 3.14;
    return 0;
}`}
];
const sim4=makeSim2(document.getElementById("sim-l4"),{id:"s4",presets:P4});
makeEx2(document.getElementById("ex-l4"),sim4,[
 {t:"Hoán đổi hai số",d:"Nhập a và b. Hoán đổi giá trị của chúng (dùng biến tạm), rồi in “a = …, b = …”.",
  tests:[{in:"5 9",out:"a = 9, b = 5"},{in:"-1 3",out:"a = 3, b = -1"},{in:"7 7",out:"a = 7, b = 7"}],need:/=\s*a\s*;/,needMsg:"Hãy hoán đổi bằng phép gán giữa các biến (ví dụ int tam = a;), không in ngược thứ tự.",
  start:`#include <iostream>
using namespace std;

int main() {
    int a, b;
    cin >> a >> b;
    // Hoán đổi a và b ở đây

    cout << "a = " << a << ", b = " << b;
    return 0;
}`},
 {t:"Hình chữ nhật",d:"Nhập chiều dài và chiều rộng (số nguyên). In “Chu vi: …” và “Dien tich: …” trên 2 dòng.",
  tests:[{in:"4 7",out:"Chu vi: 22\nDien tich: 28"},{in:"1 1",out:"Chu vi: 4\nDien tich: 1"},{in:"120 35",out:"Chu vi: 310\nDien tich: 4200"}],
  start:`#include <iostream>
using namespace std;

int main() {
    int dai{}, rong{};
    cin >> dai >> rong;
    // Khai báo biến chuVi, dienTich và tính

    return 0;
}`},
 {t:"Đổi giây",d:"Nhập tổng số giây. In theo dạng “H gio M phut S giay”. Gợi ý: dùng / và %.",
  tests:[{in:"3725",out:"1 gio 2 phut 5 giay"},{in:"59",out:"0 gio 0 phut 59 giay"},{in:"86399",out:"23 gio 59 phut 59 giay"}],
  start:`#include <iostream>
using namespace std;

int main() {
    int tongGiay{};
    cin >> tongGiay;

    return 0;
}`}
]);

makeTrace(document.getElementById("trace-l4"),[
 {t:"Đoạn 1: Gán và gán kết hợp",ask:["a","b"],code:`int a = 3;
int b = a;
a = a + 2;
b *= a;
a -= b;`},
 {t:"Đoạn 2: ++ và -- tiền tố, hậu tố",ask:["x","y"],code:`int x = 10;
int y = x++;
y = y + ++x;
x--;`},
 {t:"Đoạn 3: Chia nguyên và chia dư",ask:["n","q","r"],code:`int n = 47;
int q = n / 10;
int r = n % 10;
n = r * 10 + q;`}
]);
makeNameCheck(document.getElementById("namecheck"));

makeQuiz("quiz4","score4",[{"q": "Tên biến nào hợp lệ?", "o": ["<code>2diem<\/code>", "<code>diem_toan<\/code>", "<code>so luong<\/code>", "<code>return<\/code>"], "a": 1, "e": "Không bắt đầu bằng số, không có dấu cách, không trùng từ khóa."}, {"q": "<code>int x{3.7};<\/code> cho kết quả gì?", "o": ["x = 3", "x = 4", "Lỗi biên dịch", "x = 3.7"], "a": 2, "e": "Khởi tạo bằng { } không cho phép thu hẹp kiểu (double → int mất dữ liệu) nên báo lỗi. Viết int x = 3.7; thì x âm thầm thành 3."}, {"q": "Sau <code>int a = 5; int b = a; a = 10;<\/code> thì b bằng?", "o": ["5", "10", "15", "Không xác định"], "a": 0, "e": "b = a chép giá trị 5 vào b tại thời điểm đó. Đổi a sau này không ảnh hưởng b."}, {"q": "Sau <code>int x = 5; int y = x++;<\/code> thì?", "o": ["x = 5, y = 5", "x = 6, y = 6", "x = 6, y = 5", "x = 5, y = 6"], "a": 2, "e": "x++ (hậu tố) trả về giá trị cũ 5 cho y, rồi mới tăng x lên 6."}]);

fillSnips();
