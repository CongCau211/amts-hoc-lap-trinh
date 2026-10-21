lazyWidgets();
Object.assign(SNIP,{"l19fact": "long long giaiThua(int n) {\n    if (n <= 1)                    // trường hợp cơ sở\n        return 1;\n    return n * giaiThua(n - 1);    // bước đệ quy: n - 1 nhỏ hơn n\n}"});PRESET_NOTES["l19"]={"Ví dụ: Giai thừa": "Đệ quy: hàm gọi lại chính nó với bài toán nhỏ hơn, dừng ở trường hợp cơ sở. Chạy từng bước để thấy ngăn xếp cao dần rồi rút về.", "Ví dụ: Đếm ngược và đếm xuôi": "Lệnh trước lời gọi đệ quy chạy khi “đi xuống”, lệnh sau chạy khi “quay lên”, nên in ra cả đếm ngược và đếm xuôi.", "Ví dụ: Tổng các chữ số": "Mỗi lần gọi bỏ đi một chữ số cuối, cho tới khi chỉ còn một chữ số (trường hợp cơ sở).", "Ví dụ: Ước chung lớn nhất (Euclid)": "Thuật toán Euclid: UCLN(a, b) = UCLN(b, a % b), dừng khi b bằng 0. Chỉ cần vài lần gọi.", "Ví dụ: Fibonacci, đếm số lần gọi": "Fibonacci đệ quy gọi lại rất nhiều lần cùng một giá trị. Biến toàn cục soLanGoi cho thấy số lần gọi tăng rất nhanh khi n lớn.", "Ví dụ: Tháp Hà Nội": "Tháp Hà Nội: chuyển n đĩa bằng cách chuyển n − 1 đĩa sang cọc trung gian, rồi đĩa lớn nhất, rồi n − 1 đĩa trở lại.", "Lỗi: thiếu trường hợp cơ sở": "Lỗi: thiếu trường hợp cơ sở nên hàm gọi mãi tới khi tràn ngăn xếp (stack overflow).", "Lỗi: quên làm nhỏ dữ liệu": "Lỗi: gọi lại với cùng n, bài toán không nhỏ đi nên cũng không bao giờ dừng."};EX_HINTS["l19"]=[["Trường hợp cơ sở: n < 10 thì trả về n.", "Bước đệ quy: n % 10 + tongChuSo(n / 10)."], ["Trường hợp cơ sở: n == 0 thì trả về 1.", "Bước đệ quy: a * luyThua(a, n - 1)."], ["Trường hợp cơ sở: n == 0 thì không in gì (return).", "Gọi inNhiPhan(n / 2) TRƯỚC, rồi mới in n % 2."]];
/* ===================== BÀI 19 · Đệ quy ===================== */
/* Bài 19 · Đệ quy
   Mã riêng của bài: ví dụ cho trình mô phỏng, công cụ minh họa, bài tập chấm tự động.
   Trắc nghiệm nằm ở quiz.json, đoạn code minh họa ở snippets/*.cpp. */
/* Cây lời gọi fib(n) */
function makeFibTree(el){
  el.innerHTML=`<label class="lab-f"><span>fib(n), n =</span><input type="range" class="ft-n" min="1" max="6" value="5" aria-label="n"><output class="ft-o">5</output></label>
    <div class="ft-svg"></div><div class="ft-stats" role="group" aria-label="Số lần tính mỗi giá trị"></div><p class="lt-sum ft-sum"></p>`;
  const $=s=>el.querySelector(s);let sel=null;
  const fib=n=>{let a=0,b=1;for(let i=0;i<n;i++)[a,b]=[b,a+b];return a};
  function render(){const n=+$(".ft-n").value;$(".ft-o").textContent=n;
    let leaf=0,ord=0;const nodes=[],edges=[];
    (function go(k,d,par){const me={k,d,o:++ord};nodes.push(me);
      if(k<2){me.x=leaf++}else{const a=go(k-1,d+1,me),b=go(k-2,d+1,me);me.x=(a.x+b.x)/2}
      if(par)edges.push([par,me]);return me})(n,0,null);
    const W=46,H=52,maxD=Math.max(...nodes.map(x=>x.d));const vw=Math.max(1,leaf)*W,vh=(maxD+1)*H+6;
    const X=x=>x*W+W/2,Y=d=>d*H+22;
    $(".ft-svg").innerHTML=`<svg viewBox="0 0 ${vw} ${vh}" role="img" aria-label="Cây lời gọi fib(${n}), ${nodes.length} lời gọi" style="max-width:${Math.max(vw,260)}px">${edges.map(([p,c])=>`<line x1="${X(p.x)}" y1="${Y(p.d)+11}" x2="${X(c.x)}" y2="${Y(c.d)-12}" class="ft-e"/>`).join("")}${nodes.map(m=>`<g class="ft-n k${m.k}${sel===m.k?" sel":""}"><rect x="${X(m.x)-20}" y="${Y(m.d)-12}" width="40" height="24" rx="7"/><text x="${X(m.x)}" y="${Y(m.d)+4}">f(${m.k})</text><text class="ft-ord" x="${X(m.x)+18}" y="${Y(m.d)-14}">${m.o}</text></g>`).join("")}</svg>`;
    const cnt={};nodes.forEach(m=>cnt[m.k]=(cnt[m.k]||0)+1);
    $(".ft-stats").innerHTML=Object.keys(cnt).map(Number).sort((a,b)=>b-a).map(k=>`<button class="chip-btn${sel===k?" sel":""}" data-k="${k}">f(${k}): ${cnt[k]} lần</button>`).join("");
    el.querySelectorAll("[data-k]").forEach(b=>b.onclick=()=>{sel=sel===+b.dataset.k?null:+b.dataset.k;render()});
    $(".ft-sum").innerHTML=`fib(${n}) = <b>${fib(n)}</b>, cần <b>${nodes.length}</b> lời gọi hàm (số nhỏ ở góc mỗi ô là thứ tự gọi). Số lời gọi gần như nhân đôi khi n tăng thêm 1: fib(30) cần <b>2 692 537</b> lời gọi, trong khi vòng lặp chỉ cần 30 bước.`}
  $(".ft-n").addEventListener("input",()=>{sel=null;render()});render();
}

/* ---------- Bài 19 ---------- */
makeCallStack(document.getElementById("cs-l19"),{variants:[
 {label:"giaiThua(4)",code:`#include <iostream>
using namespace std;

long long giaiThua(int n) {
    if (n <= 1)
        return 1;
    return n * giaiThua(n - 1);
}
int main() {
    cout << giaiThua(4) << "\\n";
}`},
 {label:"In trước khi gọi",code:`#include <iostream>
using namespace std;

void dem(int n) {
    if (n == 0) return;
    cout << n << " ";
    dem(n - 1);
}
int main() {
    dem(3);
}`},
 {label:"In sau khi gọi",code:`#include <iostream>
using namespace std;

void dem(int n) {
    if (n == 0) return;
    dem(n - 1);
    cout << n << " ";
}
int main() {
    dem(3);
}`}
]});
makeFibTree(document.getElementById("fib-l19"));
const P19=[
 {label:"Ví dụ: Giai thừa",input:"5",code:`#include <iostream>
using namespace std;

long long giaiThua(int n) {
    if (n <= 1) {
        return 1;                    // trường hợp cơ sở
    }
    return n * giaiThua(n - 1);      // bước đệ quy
}

int main() {
    int n;
    cin >> n;
    cout << n << "! = " << giaiThua(n) << "\\n";
    return 0;
}`},
 {label:"Ví dụ: Đếm ngược và đếm xuôi",input:"4",code:`#include <iostream>
using namespace std;

void dem(int n) {
    if (n == 0) return;
    cout << n << " ";       // in khi đi xuống
    dem(n - 1);
    cout << n << " ";       // in khi quay lên
}

int main() {
    int n;
    cin >> n;
    dem(n);
    cout << "\\n";
    return 0;
}`},
 {label:"Ví dụ: Tổng các chữ số",input:"4072",code:`#include <iostream>
using namespace std;

int tongChuSo(int n) {
    if (n < 10) return n;
    return n % 10 + tongChuSo(n / 10);
}

int main() {
    int n;
    cin >> n;
    cout << tongChuSo(n) << "\\n";
    return 0;
}`},
 {label:"Ví dụ: Ước chung lớn nhất (Euclid)",input:"48 18",code:`#include <iostream>
using namespace std;

int ucln(int a, int b) {
    if (b == 0) return a;
    return ucln(b, a % b);
}

int main() {
    int a, b;
    cin >> a >> b;
    cout << "UCLN = " << ucln(a, b) << "\\n";
    return 0;
}`},
 {label:"Ví dụ: Fibonacci, đếm số lần gọi",input:"10",code:`#include <iostream>
using namespace std;

int soLanGoi = 0;                // biến toàn cục

int fib(int n) {
    soLanGoi++;
    if (n < 2) return n;
    return fib(n - 1) + fib(n - 2);
}

int main() {
    int n;
    cin >> n;
    cout << "fib(" << n << ") = " << fib(n) << "\\n";
    cout << "Số lần gọi: " << soLanGoi << "\\n";
    return 0;
}`},
 {label:"Ví dụ: Tháp Hà Nội",input:"3",code:`#include <iostream>
using namespace std;

void chuyen(int n, char tu, char den, char trungGian) {
    if (n == 0) return;
    chuyen(n - 1, tu, trungGian, den);
    cout << "Đĩa " << n << ": " << tu << " → " << den << "\\n";
    chuyen(n - 1, trungGian, den, tu);
}

int main() {
    int n;
    cin >> n;
    chuyen(n, 'A', 'C', 'B');
    return 0;
}`},
 {label:"Lỗi: thiếu trường hợp cơ sở",input:"5",code:`#include <iostream>
using namespace std;

long long giaiThua(int n) {
    return n * giaiThua(n - 1);     // không có điểm dừng!
}

int main() {
    int n;
    cin >> n;
    cout << giaiThua(n) << "\\n";
    return 0;
}`},
 {label:"Lỗi: quên làm nhỏ dữ liệu",input:"5",code:`#include <iostream>
using namespace std;

long long giaiThua(int n) {
    if (n <= 1) return 1;
    return n * giaiThua(n);         // n không giảm
}

int main() {
    int n;
    cin >> n;
    cout << giaiThua(n) << "\\n";
    return 0;
}`}
];
const sim19=makeSim2(document.getElementById("sim-l19"),{id:"s19",presets:P19});
const NOLOOP="^(?![\\s\\S]*\\b(?:for|while)\\s*\\()";
makeEx2(document.getElementById("ex-l19"),sim19,[
 {t:"Tổng chữ số bằng đệ quy",d:"Viết hàm đệ quy int tongChuSo(int n) (n ≥ 0), không dùng vòng lặp. Nhập n, in tổng các chữ số.",
  tests:[{in:"4072",out:"13"},{in:"0",out:"0"},{in:"9",out:"9"},{in:"2000000000",out:"2"},{in:"999999999",out:"81"}],
  need:new RegExp(NOLOOP+"(?:[\\s\\S]*?\\btongChuSo\\s*\\(){3}"),needMsg:"Hãy viết hàm tongChuSo gọi lại chính nó, và không dùng for / while.",
  start:`#include <iostream>
using namespace std;

int tongChuSo(int n) {
    // trường hợp cơ sở?
    // bước đệ quy?
}

int main() {
    int n;
    cin >> n;
    cout << tongChuSo(n);
    return 0;
}`},
 {t:"Lũy thừa bằng đệ quy",d:"Viết hàm đệ quy long long luyThua(int a, int n) với n ≥ 0, dựa trên a^n = a × a^(n−1) và a^0 = 1. Không dùng vòng lặp hay pow. Nhập a, n và in kết quả.",
  tests:[{in:"2 10",out:"1024"},{in:"3 0",out:"1"},{in:"-2 3",out:"-8"},{in:"10 15",out:"1000000000000000"}],
  need:new RegExp(NOLOOP+"(?![\\s\\S]*\\bpow\\s*\\()(?:[\\s\\S]*?\\bluyThua\\s*\\(){3}"),needMsg:"Hãy viết hàm luyThua gọi lại chính nó, không dùng for / while / pow.",
  start:`#include <iostream>
using namespace std;

long long luyThua(int a, int n) {

}

int main() {
    int a, n;
    cin >> a >> n;
    cout << luyThua(a, n);
    return 0;
}`},
 {t:"In số nhị phân",d:"Viết hàm đệ quy void inNhiPhan(int n) in biểu diễn nhị phân của n (n ≥ 1): in nhị phân của n / 2 trước, rồi in n % 2. Trong main, nhập n; nếu n = 0 thì in 0, ngược lại gọi inNhiPhan(n).",
  tests:[{in:"10",out:"1010"},{in:"1",out:"1"},{in:"0",out:"0"},{in:"255",out:"11111111"},{in:"1024",out:"10000000000"}],
  need:new RegExp(NOLOOP+"(?:[\\s\\S]*?\\binNhiPhan\\s*\\(){3}"),needMsg:"Hãy viết hàm inNhiPhan gọi lại chính nó, không dùng for / while.",
  start:`#include <iostream>
using namespace std;

void inNhiPhan(int n) {

}

int main() {
    int n;
    cin >> n;

    return 0;
}`}
]);

makeQuiz("quiz19","score19",[{"q": "Thành phần nào giúp hàm đệ quy dừng lại?", "o": ["Bước đệ quy", "Trường hợp cơ sở", "Kiểu trả về", "Tham số"], "a": 1, "e": "Trường hợp cơ sở trả lời ngay mà không gọi lại; mọi nhánh đệ quy phải tiến dần về nó."}, {"q": "Khi đang tính <code>giaiThua(4)<\/code> và vừa gọi tới <code>giaiThua(1)<\/code>, stack có bao nhiêu khung (tính cả main)?", "o": ["1", "2", "4", "5"], "a": 3, "e": "main, giaiThua(4), giaiThua(3), giaiThua(2), giaiThua(1): 5 khung."}, {"q": "Hàm đệ quy không có trường hợp cơ sở thường kết thúc bằng?", "o": ["Trả về 0", "Segmentation fault do tràn stack", "Chạy đúng nhưng chậm", "Lỗi biên dịch"], "a": 1, "e": "Khung chồng mãi tới khi hết stack, hệ điều hành dừng chương trình."}, {"q": "<code>void f(int n) { if (n == 0) return; f(n - 1); cout &lt;&lt; n; }<\/code> Gọi <code>f(3)<\/code> in ra?", "o": ["321", "123", "3", "0123"], "a": 1, "e": "Lệnh in đứng sau lời gọi đệ quy nên chạy khi “quay lên”: f(1) in trước, rồi f(2), f(3)."}]);

fillSnips();
