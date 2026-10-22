lazyWidgets();
Object.assign(SNIP,{});PRESET_NOTES["l5"]={"Ví dụ: sizeof các kiểu": "sizeof cho biết mỗi kiểu chiếm bao nhiêu byte bộ nhớ. Kích thước quyết định khoảng giá trị kiểu đó chứa được.", "Ví dụ: Tràn số nguyên": "int có giới hạn: vượt quá INT_MAX thì giá trị “quay vòng” sang số âm (tràn số). Xem phép nhân lương cả năm cũng bị tràn và cách dùng long long.", "Ví dụ: 0.1 + 0.2 có bằng 0.3?": "Số thực được lưu gần đúng ở hệ nhị phân, nên 0.1 + 0.2 không đúng bằng 0.3. In 17 chữ số để thấy phần sai lệch rất nhỏ.", "Ví dụ: float và double": "float chính xác khoảng 7 chữ số, double khoảng 15–16. So sánh hai dòng in để thấy vì sao nên dùng double cho tính toán thông thường.", "Ví dụ: char và mã ASCII": "char lưu một ký tự bằng mã số (ASCII). Cộng số vào char là dịch sang ký tự khác; đổi chữ thường sang hoa cũng chỉ là phép trừ mã.", "Ví dụ: bool": "bool chỉ có true/false; mọi số khác 0 khi đổi sang bool đều là true. boolalpha giúp in chữ true/false thay cho 1/0.", "Ví dụ: Chia nguyên và static_cast": "Chia hai số int luôn cho kết quả nguyên (bỏ phần thập phân). static_cast<double> đổi một vế sang số thực để được kết quả chính xác.", "Bẫy: unsigned và số âm": "unsigned không chứa số âm: 3 − 5 quay vòng thành một số rất lớn, và so sánh -1 với unsigned cho kết quả sai. Tránh trộn int với unsigned.", "Lỗi: % với số thực": "Lỗi biên dịch: phép % chỉ dùng cho số nguyên. Với số thực dùng fmod trong <cmath>.", "Cảnh báo: char chứa nhiều ký tự": "Cảnh báo: char chỉ chứa một ký tự; 'An' là hai ký tự nên chỉ giữ lại một. Chuỗi nhiều ký tự phải dùng string với dấu nháy kép."};EX_HINTS["l5"]=[["Chữ hoa cách chữ thường đúng 32 trong bảng mã: 'a' − 'A' = 32.", "In ký tự rồi mã số: static_cast<int>(hoa) để in mã."], ["Tổng 3 số nguyên chia 3 sẽ bị chia nguyên; đổi sang double trước khi chia.", "Dùng fixed << setprecision(2)."], ["Viết 9.0 / 5 (hoặc C là double) để tránh chia nguyên 9 / 5 = 1.", "In với fixed << setprecision(1)."]];
/* ===================== BÀI 5 · int, double, char, bool ===================== */
/* Bài 5 · int, double, char, bool
   Mã riêng của bài: ví dụ cho trình mô phỏng, công cụ minh họa, bài tập chấm tự động.
   Trắc nghiệm nằm ở quiz.json, đoạn code minh họa ở snippets/*.cpp. */
/* ---------- xem bit (Bài 5) ---------- */
function makeBits(el){
  const T={char:8,short:16,int:32};let ty="char",u=0;
  el.innerHTML=`<div class="bits-top"><div class="seg" role="group" aria-label="Kiểu">${Object.keys(T).map(k=>`<button data-ty="${k}" aria-pressed="${k==="char"}">${k} · ${T[k]/8} byte</button>`).join("")}</div>
    <label class="stdin-row"><span>Giá trị</span><input id="bits-v" type="number" value="0" style="max-width:150px"></label></div>
    <div class="bits-wrap"><div class="bits" id="bits"></div></div>
    <div class="bits-info" id="bits-info"></div>
    <div class="pipe-ctl"><button class="btn" data-op="dec">− 1</button><button class="btn pri" data-op="inc">+ 1</button><button class="btn" data-op="min">Nhỏ nhất</button><button class="btn" data-op="max">Lớn nhất</button><button class="btn" data-op="zero">0</button><button class="btn" data-op="neg1">−1</button></div>
    <p class="bits-msg" id="bits-msg" aria-live="polite"></p>`;
  const W=()=>T[ty],MOD=()=>2**W();
  const sgn=x=>x>=MOD()/2?x-MOD():x;
  function render(msg){const w=W();
    let h="";for(let b=w-1;b>=0;b--){const on=Math.floor(u/2**b)%2;h+=`<button class="bit${on?" on":""}${b===w-1?" sign":""}" data-b="${b}" aria-label="bit ${b}">${on}</button>${b%8===0&&b?'<span class="gap"></span>':""}`}
    el.querySelector("#bits").innerHTML=h;
    const s=sgn(u);el.querySelector("#bits-v").value=s;
    el.querySelector("#bits-info").innerHTML=`<div><span>Giá trị (${ty})</span><b>${s.toLocaleString("vi-VN")}</b></div><div><span>Nếu là unsigned</span><b>${u.toLocaleString("vi-VN")}</b></div><div><span>Hệ 16</span><b>0x${u.toString(16).toUpperCase().padStart(w/4,"0")}</b></div><div><span>Phạm vi ${ty}</span><b>${(-MOD()/2).toLocaleString("vi-VN")} → ${(MOD()/2-1).toLocaleString("vi-VN")}</b></div>`;
    el.querySelector("#bits-msg").innerHTML=msg||(s<0?"Bit đầu tiên (bit dấu) bằng 1 nên đây là số âm. C++ lưu số âm theo dạng <b>bù hai</b>: −1 là toàn bit 1.":"Mỗi ô là một bit. Bấm vào bit để bật/tắt.")}
  el.querySelector("#bits").addEventListener("click",e=>{const b=e.target.closest("[data-b]");if(!b)return;const k=+b.dataset.b;const on=Math.floor(u/2**k)%2;u=on?u-2**k:u+2**k;render()});
  el.querySelectorAll("[data-ty]").forEach(b=>b.onclick=()=>{const s=sgn(u);ty=b.dataset.ty;el.querySelectorAll("[data-ty]").forEach(x=>x.setAttribute("aria-pressed",x===b));u=((s%MOD())+MOD())%MOD();render(sgn(u)!==s?`Giá trị ${s} không vừa kiểu ${ty}, chỉ giữ lại ${W()} bit thấp: ${sgn(u)}.`:"")});
  el.querySelector("#bits-v").addEventListener("change",e=>{const v=Math.trunc(Number(e.target.value)||0);u=((v%MOD())+MOD())%MOD();render(sgn(u)!==v?`${v} vượt phạm vi ${ty}, chỉ giữ ${W()} bit thấp nên thành ${sgn(u)}.`:"")});
  el.querySelectorAll("[data-op]").forEach(b=>b.onclick=()=>{const op=b.dataset.op,M=MOD();const before=sgn(u);
    if(op==="inc")u=(u+1)%M;if(op==="dec")u=(u-1+M)%M;if(op==="min")u=M/2;if(op==="max")u=M/2-1;if(op==="zero")u=0;if(op==="neg1")u=M-1;
    const after=sgn(u);let msg="";
    if(op==="inc"&&after<before)msg=`<b class="bad-t">Tràn số!</b> ${before.toLocaleString("vi-VN")} + 1 quay vòng thành ${after.toLocaleString("vi-VN")}. Với số có dấu, đây là <b>hành vi không xác định</b> trong C++: thực tế thường quay vòng như thế này, nhưng trình biên dịch không hứa điều đó.`;
    if(op==="dec"&&after>before)msg=`<b class="bad-t">Tràn số!</b> ${before.toLocaleString("vi-VN")} − 1 quay vòng thành ${after.toLocaleString("vi-VN")}.`;
    render(msg)});
  render();
}

/* ---------- bảng ASCII (Bài 5) ---------- */
function makeAscii(el){
  let h="";for(let c=32;c<127;c++)h+=`<button class="ac" data-c="${c}" aria-label="mã ${c}">${c===32?"␠":esc(String.fromCharCode(c))}</button>`;
  el.innerHTML=`<div class="ascii-grid">${h}</div><div class="ascii-info" id="ascii-info" aria-live="polite"></div>`;
  const show=c=>{el.querySelectorAll(".ac").forEach(b=>b.classList.toggle("on",+b.dataset.c===c));const ch=String.fromCharCode(c);
    const rel=c>=65&&c<=90?`Chữ thường tương ứng: '${String.fromCharCode(c+32)}' = ${c}+32 = ${c+32}`:c>=97&&c<=122?`Chữ hoa tương ứng: '${String.fromCharCode(c-32)}' = ${c}−32 = ${c-32}`:c>=48&&c<=57?`'${ch}' − '0' = ${c}−48 = ${c-48} (đổi ký tự số thành số)`:"";
    el.querySelector("#ascii-info").innerHTML=`<div class="big-ch">${c===32?"␠":esc(ch)}</div><div><code>char c = '${c===39?"\\'":c===92?"\\\\":esc(ch)}';</code><dl><dt>Thập phân</dt><dd>${c}</dd><dt>Nhị phân</dt><dd>${c.toString(2).padStart(8,"0")}</dd><dt>Hệ 16</dt><dd>0x${c.toString(16).toUpperCase()}</dd></dl>${rel?`<p>${esc(rel)}</p>`:""}</div>`};
  el.querySelector(".ascii-grid").addEventListener("click",e=>{const b=e.target.closest("[data-c]");if(b)show(+b.dataset.c)});
  show(65);
}
const P5=[
 {label:"Ví dụ: sizeof các kiểu",code:`#include <iostream>
using namespace std;

int main() {
    cout << "bool:      " << sizeof(bool) << " byte\\n";
    cout << "char:      " << sizeof(char) << " byte\\n";
    cout << "short:     " << sizeof(short) << " byte\\n";
    cout << "int:       " << sizeof(int) << " byte\\n";
    cout << "long long: " << sizeof(long long) << " byte\\n";
    cout << "float:     " << sizeof(float) << " byte\\n";
    cout << "double:    " << sizeof(double) << " byte\\n";
    return 0;
}`},
 {label:"Ví dụ: Tràn số nguyên",code:`#include <iostream>
#include <climits>
using namespace std;

int main() {
    int x = INT_MAX;
    cout << "INT_MAX     = " << x << "\\n";
    x = x + 1;                       // tràn số!
    cout << "INT_MAX + 1 = " << x << "\\n";

    int luong = 50000;
    int tongNam = luong * 50000;     // 2,5 tỷ: vượt int
    long long dung = 50000LL * 50000;
    cout << tongNam << " vs " << dung << "\\n";
    return 0;
}`},
 {label:"Ví dụ: 0.1 + 0.2 có bằng 0.3?",code:`#include <iostream>
#include <iomanip>
using namespace std;

int main() {
    double a = 0.1 + 0.2;
    cout << a << "\\n";
    cout << setprecision(17) << a << "\\n";
    cout << "a == 0.3 ? " << boolalpha << (a == 0.3) << "\\n";
    return 0;
}`},
 {label:"Ví dụ: float và double",code:`#include <iostream>
#include <iomanip>
using namespace std;

int main() {
    float f = 1.0f / 3;
    double d = 1.0 / 3;
    cout << setprecision(12);
    cout << "float : " << f << "\\n";
    cout << "double: " << d << "\\n";
    float lon = 16777216.0f;
    float them = lon + 1.0f;    // float không còn đủ chữ số
    cout << "16777216 + 1 = " << them << "\\n";
    return 0;
}`},
 {label:"Ví dụ: char và mã ASCII",code:`#include <iostream>
using namespace std;

int main() {
    char c = 'A';
    cout << c << " có mã " << static_cast<int>(c) << "\\n";
    c = c + 2;
    cout << "Cộng 2: " << c << "\\n";
    char thuong = 'g';
    char hoa = thuong - 32;
    cout << thuong << " -> " << hoa << "\\n";
    char chuSo = '7';
    int giaTri = chuSo - '0';
    cout << "'7' - '0' = " << giaTri << "\\n";
    return 0;
}`},
 {label:"Ví dụ: bool",code:`#include <iostream>
using namespace std;

int main() {
    bool a = true;
    bool b = 25;     // khác 0 nên là true
    bool c = 0;
    cout << a << " " << b << " " << c << "\\n";
    cout << boolalpha << a << " " << c << "\\n";
    cout << "3 > 2 là " << (3 > 2) << "\\n";
    return 0;
}`},
 {label:"Ví dụ: Chia nguyên và static_cast",code:`#include <iostream>
using namespace std;

int main() {
    int tongDiem = 17, soMon = 5;
    cout << tongDiem / soMon << "\\n";
    cout << static_cast<double>(tongDiem) / soMon << "\\n";
    cout << (double)(tongDiem / soMon) << "\\n";
    double tb = tongDiem / soMon;    // vẫn sai: chia nguyên trước
    cout << tb << "\\n";
    return 0;
}`},
 {label:"Bẫy: unsigned và số âm",code:`#include <iostream>
using namespace std;

int main() {
    unsigned int a = 3, b = 5;
    cout << "3 - 5 = " << a - b << "\\n";
    int am = -1;
    cout << "-1 < 3 ? " << (am < a) << "\\n";
    return 0;
}`},
 {label:"Lỗi: % với số thực",code:`#include <iostream>
using namespace std;

int main() {
    double x = 7.5;
    cout << x % 2 << "\\n";
    return 0;
}`},
 {label:"Cảnh báo: char chứa nhiều ký tự",code:`#include <iostream>
using namespace std;

int main() {
    char ten = 'An';
    cout << ten << "\\n";      // chỉ còn 'n'
    return 0;
}`}
];
const sim5=makeSim2(document.getElementById("sim-l5"),{id:"s5",presets:P5});
makeEx2(document.getElementById("ex-l5"),sim5,[
 {t:"Đổi sang chữ hoa",d:"Nhập một chữ cái thường. In chữ hoa tương ứng và mã ASCII của chữ hoa, cách nhau một dấu cách. Không dùng hàm toupper.",
  tests:[{in:"b",out:"B 66"},{in:"z",out:"Z 90"},{in:"a",out:"A 65"}],need:/-\s*32|-\s*\(\s*'a'\s*-\s*'A'\s*\)|-\s*'a'|-=\s*32/,needMsg:"Hãy tự tính bằng mã ASCII (chữ thường − 32).",
  start:`#include <iostream>
using namespace std;

int main() {
    char c;
    cin >> c;

    return 0;
}`},
 {t:"Trung bình chính xác",d:"Nhập 3 số nguyên. In trung bình cộng dạng số thực với 2 chữ số sau dấu phẩy.",
  tests:[{in:"7 8 8",out:"7.67"},{in:"1 2 2",out:"1.67"},{in:"10 10 9",out:"9.67"}],
  start:`#include <iostream>
#include <iomanip>
using namespace std;

int main() {
    int a, b, c;
    cin >> a >> b >> c;
    // Cẩn thận: int / int là chia nguyên

    return 0;
}`},
 {t:"Độ C sang độ F",d:"Nhập nhiệt độ C (số thực). In độ F với 1 chữ số sau dấu phẩy. Công thức F = C × 9 / 5 + 32.",
  tests:[{in:"37",out:"98.6"},{in:"-40",out:"-40.0"},{in:"100",out:"212.0"}],
  start:`#include <iostream>
#include <iomanip>
using namespace std;

int main() {
    double doC;
    cin >> doC;

    return 0;
}`}
]);
makeBits(document.getElementById("bits-l5"));
makeAscii(document.getElementById("ascii-l5"));

makeQuiz("quiz5","score5",[{"q": "Biến <code>int<\/code> 4 byte lưu được số dương lớn nhất khoảng bao nhiêu?", "o": ["32 nghìn", "2,1 tỷ", "4,3 tỷ", "9,2 tỷ tỷ"], "a": 1, "e": "2^31 − 1 = 2 147 483 647. 4,3 tỷ là của unsigned int."}, {"q": "<code>cout &lt;&lt; 'A' + 1;<\/code> in ra gì?", "o": ["B", "A1", "66", "Lỗi"], "a": 2, "e": "'A' được nâng thành int 65 trước khi cộng, kết quả là int 66 nên in số. Muốn in B thì ép về char: static_cast&lt;char&gt;('A' + 1)."}, {"q": "<code>0.1 + 0.2 == 0.3<\/code> có giá trị?", "o": ["true", "false", "Tùy máy", "Lỗi biên dịch"], "a": 1, "e": "0.1 và 0.2 đều được lưu gần đúng; tổng là 0.30000000000000004, khác với giá trị gần đúng của 0.3."}, {"q": "<code>cout &lt;&lt; 7 / 2 * 2.0;<\/code> in ra?", "o": ["7", "6", "7.0", "3.5"], "a": 1, "e": "Tính từ trái sang phải: 7 / 2 = 3 (chia nguyên), rồi 3 * 2.0 = 6.0, cout in là 6."}]);

fillSnips();
