lazyWidgets();
Object.assign(SNIP,{"l18def": "void keDong(int doDai = 10, char kyTu = '-');   // mặc định ghi ở nguyên mẫu\n\nint main() {\n    keDong();          // ----------   (10, '-')\n    keDong(5);         // -----        (5, '-')\n    keDong(5, '*');    // *****        (5, '*')\n}\n\nvoid keDong(int doDai, char kyTu) {            // định nghĩa: không ghi lại\n    for (int i = 0; i < doDai; i++) cout << kyTu;\n    cout << '\\n';\n}", "l18ov": "int tong(int a, int b)            { return a + b; }\ndouble tong(double a, double b)   { return a + b; }\nint tong(int a, int b, int c)     { return a + b + c; }\n\ntong(1, 2);         // gọi bản (int, int)          → 3\ntong(1.5, 2.25);    // gọi bản (double, double)    → 3.75\ntong(1, 2, 3);      // gọi bản (int, int, int)     → 6"});PRESET_NOTES["l18"]={"Ví dụ: Ba phiên bản tong": "Nạp chồng hàm: nhiều hàm cùng tên khác danh sách tham số. Trình biên dịch chọn bản phù hợp theo số lượng và kiểu đối số.", "Ví dụ: Mỗi kiểu một phiên bản in": "Mỗi kiểu dữ liệu một phiên bản in. Quan sát phiên bản nào được gọi với 42, 3.14, 'A' và một chuỗi.", "Ví dụ: Tham số mặc định": "Tham số mặc định: bỏ trống đối số thì hàm dùng giá trị mặc định. So sánh các lời gọi có và không có đối số.", "Ví dụ: Mặc định ghi ở nguyên mẫu": "Giá trị mặc định được ghi ở nguyên mẫu (khai báo), không lặp lại ở phần thân.", "Lỗi: chỉ khác kiểu trả về": "Lỗi biên dịch: hai hàm chỉ khác kiểu trả về không phải nạp chồng hợp lệ, vì lời gọi không phân biệt được.", "Lỗi: lời gọi mơ hồ": "Lỗi biên dịch: đối số long long đổi được sang cả int lẫn double, nên trình biên dịch không biết chọn bản nào (mơ hồ).", "Lỗi: mặc định không nằm cuối": "Lỗi biên dịch: tham số có giá trị mặc định phải nằm ở cuối danh sách.", "Lỗi: mơ hồ do tham số mặc định": "Lỗi biên dịch: ve(3) khớp cả hai phiên bản vì tham số thứ hai có giá trị mặc định, nên lời gọi bị mơ hồ."};EX_HINTS["l18"]=[["Hai hàm cùng tên dienTich, khác số tham số.", "Đọc k trước, rồi đọc 1 hoặc 2 số tùy k; in với setprecision(2)."], ["Bản ba tham số có thể gọi lại bản hai tham số.", "Đọc k rồi đọc đủ k số; gọi lonNhat(a, b) hoặc lonNhat(a, b, c)."], ["Giá trị mặc định chỉ đặt ở cuối danh sách tham số.", "k = 1 gọi tinhTien(g); k = 2 gọi tinhTien(g, s); k = 3 gọi tinhTien(g, s, p)."]];
/* ===================== BÀI 18 · Nạp chồng hàm ===================== */
/* Bài 18 · Nạp chồng hàm
   Mã riêng của bài: ví dụ cho trình mô phỏng, công cụ minh họa, bài tập chấm tự động.
   Trắc nghiệm nằm ở quiz.json, đoạn code minh họa ở snippets/*.cpp. */
/* Bộ chọn phiên bản nạp chồng: dùng chính trình biên dịch mô phỏng để quyết định */
function makeOverload(el){
  const CAND=[{t:"int",on:true},{t:"double",on:true},{t:"char",on:false},{t:"long long",on:false},{t:"string",on:false}];
  const ARGS=[{c:"7",t:"int"},{c:"7.5",t:"double"},{c:"'A'",t:"char"},{c:"7.5f",t:"float"},{c:"true",t:"bool"},{c:"7LL",t:"long long"},{c:'"abc"',t:"const char*"}];
  let ai=0;
  el.innerHTML=`<div class="ov-top"><div><div class="pane-h" style="padding:0 0 6px">Các phiên bản đang có</div><div class="ov-cands">${CAND.map((c,i)=>`<label class="ov-c"><input type="checkbox" data-c="${i}"${c.on?" checked":""}><code>void f(${esc(c.t)} x)</code></label>`).join("")}</div></div>
    <div><div class="pane-h" style="padding:0 0 6px">Lời gọi trong main</div><div class="ov-args" role="group" aria-label="Đối số">${ARGS.map((a,i)=>`<button class="chip-btn" data-a="${i}"><code>f(${esc(a.c)})</code></button>`).join("")}</div><p class="ov-at"></p></div></div>
    <div class="tbl"><table><thead><tr><th>Phiên bản</th><th>Mức khớp với đối số</th><th>Kết quả</th></tr></thead><tbody class="ov-rows"></tbody></table></div>
    <div class="ov-res" aria-live="polite"></div>`;
  const $=s=>el.querySelector(s);
  const T={"string":"string","const char*":"cstr"};
  const rank=(A,P)=>{A=T[A]||A;P=T[P]||P;if(P==="string")return A==="string"?3:A==="cstr"?0.5:-1;if(A==="cstr"||A==="string")return -1;if(A===P)return 3;if(P==="int"&&["char","bool","short"].includes(A))return 2;if(P==="double"&&A==="float")return 2;return 1};
  const LBL={3:["Khớp chính xác","r3"],2:["Nâng kiểu","r2"],1:["Chuyển đổi","r1"],0.5:["Chuyển đổi qua lớp string","r0"],"-1":["Không nhận được","rx"]};
  function render(){const a=ARGS[ai];
    el.querySelectorAll("[data-a]").forEach(b=>b.classList.toggle("sel",+b.dataset.a===ai));
    $(".ov-at").innerHTML=`Đối số <code>${esc(a.c)}</code> có kiểu <b>${esc(a.t)}</b>.`;
    const on=CAND.filter(c=>c.on);
    const src=`#include <iostream>\n#include <string>\nusing namespace std;\n${on.map(c=>`void f(${c.t} x) { cout << "${c.t}"; }`).join("\n")}\nint main() {\n    f(${a.c});\n}`;
    let chosen=null,err=null;
    try{const c=compile2(src);const M=new M2(c.prog,src,{interactive:false});M.runAll();chosen=M.text()}catch(e){if(!(e instanceof E2))throw e;err=e}
    $(".ov-rows").innerHTML=on.length?on.map(c=>{const r=rank(a.t,c.t),[lb,cl]=LBL[String(r)];return `<tr class="${chosen===c.t?"win":""}"><td><code>void f(${esc(c.t)} x)</code></td><td><span class="ov-r ${cl}">${lb}</span></td><td>${chosen===c.t?"<b>✓ được gọi</b>":""}</td></tr>`}).join(""):`<tr><td colspan="3">Chưa bật phiên bản nào.</td></tr>`;
    $(".ov-res").innerHTML=err?`<div class="res bad"><b>Lỗi biên dịch</b><code>${esc(err.message)}</code><span>${esc(err.vi)}</span></div>`:`<div class="res ok"><b>Gọi <code>void f(${esc(chosen)} x)</code></b><span>${on.length>1?"Phiên bản này khớp tốt hơn hẳn các phiên bản còn lại.":"Chỉ có một phiên bản nhận được đối số này."}</span></div>`}
  el.querySelectorAll("[data-c]").forEach(x=>x.onchange=()=>{CAND[+x.dataset.c].on=x.checked;render()});
  el.querySelectorAll("[data-a]").forEach(b=>b.onclick=()=>{ai=+b.dataset.a;render()});
  render();
}

/* ---------- Bài 18 ---------- */
makeOverload(document.getElementById("ov-l18"));
const P18=[
 {label:"Ví dụ: Ba phiên bản tong",code:`#include <iostream>
using namespace std;

int tong(int a, int b) {
    return a + b;
}
double tong(double a, double b) {
    return a + b;
}
int tong(int a, int b, int c) {
    return a + b + c;
}

int main() {
    cout << tong(1, 2) << "\\n";
    cout << tong(1.5, 2.25) << "\\n";
    cout << tong(1, 2, 3) << "\\n";
    return 0;
}`},
 {label:"Ví dụ: Mỗi kiểu một phiên bản in",code:`#include <iostream>
#include <string>
using namespace std;

void in(int x)         { cout << "số nguyên " << x << "\\n"; }
void in(double x)      { cout << "số thực " << x << "\\n"; }
void in(char x)        { cout << "ký tự " << x << "\\n"; }
void in(string x) { cout << "chuỗi " << x << "\\n"; }

int main() {
    in(42);
    in(3.14);
    in('A');
    string ten = "AMTS";
    in(ten);
    in(true);          // bool nâng kiểu thành int
    return 0;
}`},
 {label:"Ví dụ: Tham số mặc định",code:`#include <iostream>
using namespace std;

void keDong(int doDai = 10, char kyTu = '-') {
    for (int i = 0; i < doDai; i++) {
        cout << kyTu;
    }
    cout << "\\n";
}

int main() {
    keDong();
    keDong(5);
    keDong(5, '*');
    return 0;
}`},
 {label:"Ví dụ: Mặc định ghi ở nguyên mẫu",input:"200000 3",code:`#include <iostream>
using namespace std;

long long tinhTien(long long gia, int soLuong = 1, int giam = 0);

int main() {
    long long gia;
    int sl;
    cin >> gia >> sl;
    cout << tinhTien(gia) << "\\n";
    cout << tinhTien(gia, sl) << "\\n";
    cout << tinhTien(gia, sl, 10) << "\\n";
    return 0;
}

long long tinhTien(long long gia, int soLuong, int giam) {
    return gia * soLuong * (100 - giam) / 100;
}`},
 {label:"Lỗi: chỉ khác kiểu trả về",code:`#include <iostream>
using namespace std;

int nhanDoi(int x) {
    return x * 2;
}
double nhanDoi(int x) {
    return x * 2.0;
}

int main() {
    cout << nhanDoi(3);
    return 0;
}`},
 {label:"Lỗi: lời gọi mơ hồ",code:`#include <iostream>
using namespace std;

void in(int x)    { cout << "int " << x; }
void in(double x) { cout << "double " << x; }

int main() {
    long long n = 5;
    in(n);
    return 0;
}`},
 {label:"Lỗi: mặc định không nằm cuối",code:`#include <iostream>
using namespace std;

int tinh(int a = 1, int b) {
    return a + b;
}

int main() {
    cout << tinh(2, 3);
    return 0;
}`},
 {label:"Lỗi: mơ hồ do tham số mặc định",code:`#include <iostream>
using namespace std;

void ve(int n) { cout << "một tham số"; }
void ve(int n, char c = '*') { cout << "hai tham số"; }

int main() {
    ve(3);
    return 0;
}`}
];
const sim18=makeSim2(document.getElementById("sim-l18"),{id:"s18",presets:P18});
makeEx2(document.getElementById("ex-l18"),sim18,[
 {t:"Diện tích hai loại hình",d:"Viết hai phiên bản: double dienTich(double r) cho hình tròn (dùng 3.14159) và double dienTich(double a, double b) cho hình chữ nhật. Nhập k: k = 1 thì nhập r, k = 2 thì nhập a và b. In diện tích với 2 chữ số thập phân.",
  tests:[{in:"1 2",out:"12.57"},{in:"2 3 4.5",out:"13.50"},{in:"1 0.5",out:"0.79"},{in:"2 10 10",out:"100.00"}],
  need:/(double\s+dienTich\s*\(\s*double\s+\w+\s*\)[\s\S]*double\s+dienTich\s*\(\s*double\s+\w+\s*,\s*double\s+\w+\s*\))|(double\s+dienTich\s*\(\s*double\s+\w+\s*,\s*double\s+\w+\s*\)[\s\S]*double\s+dienTich\s*\(\s*double\s+\w+\s*\))/,needMsg:"Hãy viết đủ hai phiên bản dienTich(double r) và dienTich(double a, double b).",
  start:`#include <iostream>
#include <iomanip>
using namespace std;

// viết hai phiên bản dienTich ở đây

int main() {
    int k;
    cin >> k;
    cout << fixed << setprecision(2);

    return 0;
}`},
 {t:"Lớn nhất của 2 hoặc 3 số",d:"Viết hai phiên bản nạp chồng: int lonNhat(int a, int b) và int lonNhat(int a, int b, int c). Nhập k (2 hoặc 3) rồi k số nguyên; in số lớn nhất bằng cách gọi đúng phiên bản.",
  tests:[{in:"2 4 9",out:"9"},{in:"3 4 9 7",out:"9"},{in:"3 -5 -2 -8",out:"-2"},{in:"2 6 6",out:"6"}],
  need:/int\s+lonNhat\s*\([^)]*\)\s*\{[\s\S]*int\s+lonNhat\s*\([^)]*\)\s*\{/,needMsg:"Hãy viết hai phiên bản lonNhat: hai tham số và ba tham số.",
  start:`#include <iostream>
using namespace std;

// viết hai phiên bản lonNhat ở đây

int main() {
    int k;
    cin >> k;

    return 0;
}`},
 {t:"Tính tiền với tham số mặc định",d:"Viết hàm long long tinhTien(long long donGia, int soLuong = 1, int giamPhanTram = 0) trả về donGia * soLuong * (100 - giamPhanTram) / 100. Nhập k (1 đến 3) rồi k số, gọi hàm với đúng k đối số và in kết quả.",
  tests:[{in:"1 50000",out:"50000"},{in:"2 50000 3",out:"150000"},{in:"3 50000 3 10",out:"135000"},{in:"3 99000 2 50",out:"99000"}],
  need:/tinhTien\s*\([^)]*=\s*1\s*,[^)]*=\s*0\s*\)/,needMsg:"Hãy khai báo tham số mặc định: int soLuong = 1, int giamPhanTram = 0.",
  start:`#include <iostream>
using namespace std;

// viết hàm tinhTien ở đây

int main() {
    int k;
    cin >> k;

    return 0;
}`}
]);

makeQuiz("quiz18","score18",[{"q": "Hai hàm nào <b>không<\/b> nạp chồng được với nhau?", "o": ["<code>int f(int)<\/code> và <code>int f(double)<\/code>", "<code>int f(int)<\/code> và <code>int f(int, int)<\/code>", "<code>int f(int)<\/code> và <code>double f(int)<\/code>", "<code>void f(char)<\/code> và <code>void f(int)<\/code>"], "a": 2, "e": "Chỉ khác kiểu trả về thì danh sách tham số giống nhau: ambiguating new declaration."}, {"q": "Có <code>f(int)<\/code> và <code>f(double)<\/code>. Gọi <code>f('A')<\/code> thì?", "o": ["Gọi f(int) vì char nâng kiểu thành int", "Gọi f(double)", "Mơ hồ", "Lỗi vì không có f(char)"], "a": 0, "e": "char → int là nâng kiểu, tốt hơn chuyển đổi char → double."}, {"q": "Khai báo nào đúng quy tắc tham số mặc định?", "o": ["<code>void f(int a = 0, int b)<\/code>", "<code>void f(int a, int b = 0)<\/code>", "<code>void f(int a = 0, int b, int c = 0)<\/code>", "Cả ba"], "a": 1, "e": "Tham số mặc định phải nằm ở cuối danh sách."}, {"q": "Có <code>g(int)<\/code> và <code>g(int, int = 5)<\/code>. Lời gọi <code>g(1)<\/code> thì?", "o": ["Gọi g(int)", "Gọi g(int, int)", "Mơ hồ, lỗi biên dịch", "Gọi cả hai"], "a": 2, "e": "Cả hai phiên bản đều nhận g(1) với mức khớp như nhau: call of overloaded 'g(int)' is ambiguous."}]);

fillSnips();
