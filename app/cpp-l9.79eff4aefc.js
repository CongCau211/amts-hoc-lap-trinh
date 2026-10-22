lazyWidgets();
Object.assign(SNIP,{});PRESET_NOTES["l9"]={"Ví dụ: Sáu toán tử so sánh": "Sáu toán tử so sánh trả về true/false (in ra 1/0). Thử nhập các cặp số khác nhau, kể cả hai số bằng nhau.", "Ví dụ: Kết hợp && || !": "Kết hợp điều kiện bằng && (và), || (hoặc), ! (phủ định). Đổi dữ liệu nhập để thấy học bổng phụ thuộc cả điểm, tuổi và hoàn cảnh.", "Ví dụ: Ngắn mạch tránh chia cho 0": "Ngắn mạch: với &&, vế trái sai thì vế phải không được tính. Đặt kiểm tra b != 0 trước giúp tránh chia cho 0.", "Lỗi khi chạy: đảo thứ tự điều kiện": "Đảo thứ tự hai vế: phép chia chạy trước khi kiểm tra b, nên chương trình bị lỗi chia cho 0. So sánh với ví dụ ngắn mạch.", "Cảnh báo: 10 < x < 20": "Cảnh báo: 10 < x < 20 không kiểm tra “x nằm giữa” mà luôn đúng. Phải viết 10 < x && x < 20.", "Cảnh báo: !x == y": "Cảnh báo: ! chạy trước ==, nên !x == y nghĩa là (!x) == y. Dùng ngoặc để thể hiện đúng ý.", "Bẫy: so sánh số thực": "Bẫy: không so sánh số thực bằng ==. So độ chênh lệch với một sai số rất nhỏ thay vào đó.", "Cảnh báo: so sánh int với unsigned": "Cảnh báo: so sánh int âm với unsigned cho kết quả sai vì -1 bị đổi thành số rất lớn.", "Ví dụ: So sánh chuỗi": "Chuỗi string so sánh được bằng == và theo thứ tự từ điển bằng <. Thử nhập hai tên khác nhau."};EX_HINTS["l9"]=[["Chia hết dùng % == 0; ghép điều kiện bằng && và ||.", "(y % 4 == 0 && y % 100 != 0) || y % 400 == 0; in với boolalpha."], ["Không viết 10 <= x <= 20.", "Viết 10 <= x && x <= 20."], ["Cần đủ ba điều kiện a + b > c, a + c > b, b + c > a.", "Ghép ba điều kiện bằng && và in với boolalpha."]];
/* ===================== BÀI 9 · So sánh và logic ===================== */
/* Bài 9 · So sánh và logic
   Mã riêng của bài: ví dụ cho trình mô phỏng, công cụ minh họa, bài tập chấm tự động.
   Trắc nghiệm nằm ở quiz.json, đoạn code minh họa ở snippets/*.cpp. */
/* ================= WIDGET + DỮ LIỆU BÀI 9–11 ================= */
/* Bảng chân trị */
function makeTruth(el){
  let A=true,B=false;
  const f=v=>v?"true":"false";
  function render(){
    const rows=[[false,false],[false,true],[true,false],[true,true]];
    el.innerHTML=`<div class="tt-ctl"><button class="tv ${A?"on":""}" id="tv-a" aria-pressed="${A}"><span>A</span><b>${f(A)}</b></button><button class="tv ${B?"on":""}" id="tv-b" aria-pressed="${B}"><span>B</span><b>${f(B)}</b></button>
      <div class="tv-res">${[["A && B",A&&B],["A || B",A||B],["!A",!A],["A != B",A!==B]].map(([t,v])=>`<div class="${v?"t":"f"}"><code>${esc(t)}</code><b>${f(v)}</b></div>`).join("")}</div></div>
      <div class="tbl"><table class="truth"><thead><tr><th>A</th><th>B</th><th>A &amp;&amp; B</th><th>A || B</th><th>!A</th><th>A != B <small>(XOR)</small></th></tr></thead><tbody>${
      rows.map(([a,b])=>`<tr class="${a===A&&b===B?"cur":""}"><td>${f(a)}</td><td>${f(b)}</td>${[a&&b,a||b,!a,a!==b].map(v=>`<td class="${v?"t":"f"}">${f(v)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>
      <p class="note-s">Mẹo nhớ: <b>&amp;&amp;</b> chỉ đúng ở 1 hàng (cả hai đúng); <b>||</b> chỉ sai ở 1 hàng (cả hai sai).</p>`;
    el.querySelector("#tv-a").onclick=()=>{A=!A;render();el.querySelector("#tv-a").focus()};
    el.querySelector("#tv-b").onclick=()=>{B=!B;render();el.querySelector("#tv-b").focus()};
  }
  render();
}
/* Phòng thí nghiệm điều kiện (học bổng) */
function makeLogicLab(el){
  el.innerHTML=`<div class="lab-in">
    <label class="lab-f"><span>diem</span><input type="range" id="lab-d" min="0" max="10" step="0.1" value="8.5"><output id="lab-do">8.5</output></label>
    <label class="lab-f"><span>tuoi</span><input type="range" id="lab-t" min="10" max="25" step="1" value="19"><output id="lab-to">19</output></label>
    <label class="lab-c"><input type="checkbox" id="lab-n"> <span>ngheo (hộ nghèo)</span></label>
    <label class="switch"><input type="checkbox" id="lab-p"> Bỏ ngoặc</label></div>
    <div class="lab-expr" id="lab-expr" aria-live="polite"></div><div class="lab-res" id="lab-res"></div>`;
  const $=s=>el.querySelector(s);
  const chip=(code,v)=>`<span class="lx ${v?"t":"f"}"><code>${esc(code)}</code><small>${v?"true":"false"}</small></span>`;
  function upd(){
    const d=+$("#lab-d").value,t=+$("#lab-t").value,n=$("#lab-n").checked,noP=$("#lab-p").checked;
    $("#lab-do").textContent=d.toFixed(1);$("#lab-to").textContent=t;
    const c1=d>=8.0,c2=t<18,c3=n;
    const withP=c1&&(c2||c3),without=(c1&&c2)||c3;
    const res=noP?without:withP;
    $("#lab-expr").innerHTML=noP
      ?`${chip("diem >= 8.0",c1)}<i>&amp;&amp;</i>${chip("tuoi < 18",c2)}<i>||</i>${chip("ngheo",c3)}<div class="lab-read">Máy hiểu là: <code>(diem &gt;= 8.0 &amp;&amp; tuoi &lt; 18) || ngheo</code> vì <code>&amp;&amp;</code> được tính trước <code>||</code>.</div>`
      :`${chip("diem >= 8.0",c1)}<i>&amp;&amp;</i><span class="lx-g">(${chip("tuoi < 18",c2)}<i>||</i>${chip("ngheo",c3)})<small>${c2||c3?"true":"false"}</small></span>`;
    $("#lab-res").className="lab-res "+(res?"t":"f");
    $("#lab-res").innerHTML=`<b>${res?"✓ Được học bổng":"✗ Không được học bổng"}</b>${noP&&without!==withP?`<span>Sai quy định! Có ngoặc thì kết quả là <b>${withP?"được":"không được"}</b>. ${c3&&!c1?"Học sinh hộ nghèo nhưng điểm dưới 8.0 vẫn lọt qua.":""}</span>`:noP?`<span>Trường hợp này hai cách viết tình cờ cho cùng kết quả. Thử bật “ngheo” và kéo điểm xuống dưới 8.</span>`:""}`;
  }
  el.addEventListener("input",upd);upd();
}

const P9=[
 {label:"Ví dụ: Sáu toán tử so sánh",input:"7 3",code:`#include <iostream>
using namespace std;

int main() {
    int a, b;
    cin >> a >> b;
    cout << "a == b: " << (a == b) << "\\n";
    cout << "a != b: " << (a != b) << "\\n";
    cout << "a <  b: " << (a < b) << "\\n";
    cout << "a >= b: " << (a >= b) << "\\n";
    cout << boolalpha;
    cout << "a >  b: " << (a > b) << "\\n";
    cout << "a <= b: " << (a <= b) << "\\n";
    return 0;
}`},
 {label:"Ví dụ: Kết hợp && || !",input:"8.5 16 0",code:`#include <iostream>
using namespace std;

int main() {
    double diem;
    int tuoi;
    bool ngheo;
    cin >> diem >> tuoi >> ngheo;
    bool hocBong = diem >= 8.0 && (tuoi < 18 || ngheo);
    bool canhCao = !(diem >= 5.0);
    cout << boolalpha;
    cout << "Học bổng: " << hocBong << "\\n";
    cout << "Cảnh cáo: " << canhCao << "\\n";
    return 0;
}`},
 {label:"Ví dụ: Ngắn mạch tránh chia cho 0",input:"10 0",code:`#include <iostream>
using namespace std;

int main() {
    int a, b;
    cin >> a >> b;
    // b != 0 sai nên a / b không được tính: an toàn
    bool lonHon = b != 0 && a / b > 1;
    cout << boolalpha << lonHon << "\\n";
    return 0;
}`},
 {label:"Lỗi khi chạy: đảo thứ tự điều kiện",input:"10 0",code:`#include <iostream>
using namespace std;

int main() {
    int a, b;
    cin >> a >> b;
    bool lonHon = a / b > 1 && b != 0;   // chia trước khi kiểm tra
    cout << lonHon << "\\n";
    return 0;
}`},
 {label:"Cảnh báo: 10 < x < 20",input:"35",code:`#include <iostream>
using namespace std;

int main() {
    int x;
    cin >> x;
    cout << boolalpha;
    cout << (10 < x < 20) << "\\n";          // luôn true!
    cout << (10 < x && x < 20) << "\\n";     // đúng ý
    return 0;
}`},
 {label:"Cảnh báo: !x == y",code:`#include <iostream>
using namespace std;

int main() {
    int x = 5, y = 0;
    cout << (!x == y) << "\\n";     // (!x) == y
    cout << !(x == y) << "\\n";     // đúng ý
    return 0;
}`},
 {label:"Bẫy: so sánh số thực",code:`#include <iostream>
#include <cmath>
using namespace std;

int main() {
    double a = 0.1 + 0.2;
    cout << boolalpha;
    cout << (a == 0.3) << "\\n";
    cout << (abs(a - 0.3) < 1e-9) << "\\n";
    return 0;
}`},
 {label:"Cảnh báo: so sánh int với unsigned",code:`#include <iostream>
using namespace std;

int main() {
    int am = -1;
    unsigned int soLuong = 3;
    cout << boolalpha << (am < soLuong) << "\\n";   // false!
    return 0;
}`},
 {label:"Ví dụ: So sánh chuỗi",input:"an binh",code:`#include <iostream>
#include <string>
using namespace std;

int main() {
    string s1, s2;
    cin >> s1 >> s2;
    cout << boolalpha;
    cout << (s1 == s2) << " " << (s1 < s2) << "\\n";
    return 0;
}`}
];
const sim9=makeSim2(document.getElementById("sim-l9"),{id:"s9",presets:P9});
makeTruth(document.getElementById("truth-l9"));
makeLogicLab(document.getElementById("lab-l9"));
makeExprTree(document.getElementById("etree-l9"),{id:"et9",decl:[["int","a","10"],["int","b","0"],["int","x","15"]],initial:"b != 0 && a / b > 1",
  examples:["b != 0 && a / b > 1","a / b > 1 && b != 0","b == 0 || a / b > 1","x > 10 && x < 20","10 < x < 20","!(x == 15)","!x == 0","a > 5 || b > 5 && x < 0"]});

makeEx2(document.getElementById("ex-l9"),sim9,[
 {t:"Năm nhuận",d:"Nhập một năm. In true nếu là năm nhuận, false nếu không (dùng boolalpha). Năm nhuận: chia hết cho 4 nhưng không chia hết cho 100, hoặc chia hết cho 400.",
  tests:[{in:"2024",out:"true"},{in:"1900",out:"false"},{in:"2000",out:"true"},{in:"2026",out:"false"}],
  start:`#include <iostream>
using namespace std;

int main() {
    int nam;
    cin >> nam;

    return 0;
}`},
 {t:"Trong khoảng",d:"Nhập x. In true nếu 10 ≤ x ≤ 20, ngược lại in false. Cẩn thận lỗi 10 <= x <= 20.",
  tests:[{in:"15",out:"true"},{in:"10",out:"true"},{in:"21",out:"false"},{in:"5",out:"false"}],need:/&&/,needMsg:"Hãy kết hợp hai phép so sánh bằng &&.",
  start:`#include <iostream>
using namespace std;

int main() {
    int x;
    cin >> x;

    return 0;
}`},
 {t:"Tam giác hợp lệ",d:"Nhập 3 cạnh (số nguyên dương). In true nếu ba cạnh tạo thành tam giác: tổng hai cạnh bất kỳ lớn hơn cạnh còn lại.",
  tests:[{in:"3 4 5",out:"true"},{in:"1 2 3",out:"false"},{in:"10 2 3",out:"false"},{in:"7 7 7",out:"true"}],
  start:`#include <iostream>
using namespace std;

int main() {
    int a, b, c;
    cin >> a >> b >> c;

    return 0;
}`}
]);

makeQuiz("quiz9","score9",[{"q": "<code>cout &lt;&lt; (5 &gt; 3);<\/code> in ra gì?", "o": ["true", "1", "5 > 3", "Lỗi"], "a": 1, "e": "Kết quả so sánh là bool true; cout mặc định in true thành 1. Thêm boolalpha để in chữ true."}, {"q": "Với x = 35, <code>10 &lt; x &lt; 20<\/code> có giá trị?", "o": ["false", "true", "Lỗi biên dịch", "Không xác định"], "a": 1, "e": "(10 < 35) là true (1), rồi 1 < 20 là true. Phải viết 10 < x && x < 20."}, {"q": "Khi b = 0, biểu thức nào an toàn?", "o": ["<code>a / b &gt; 1 &amp;&amp; b != 0<\/code>", "<code>b != 0 &amp;&amp; a / b &gt; 1<\/code>", "Cả hai", "Không cái nào"], "a": 1, "e": "Ngắn mạch: vế trái b != 0 là false nên a / b không được tính."}, {"q": "<code>true || false &amp;&amp; false<\/code> bằng?", "o": ["true", "false", "Lỗi", "Tùy trình biên dịch"], "a": 0, "e": "&& tính trước ||: true || (false && false) = true || false = true."}]);

fillSnips();
