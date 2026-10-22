lazyWidgets();
Object.assign(SNIP,{"l11flags": "constexpr int READ  = 1 << 0;   // 001\nconstexpr int WRITE = 1 << 1;   // 010\nconstexpr int EXEC  = 1 << 2;   // 100\n\nint quyen = READ | WRITE;       // 011: được đọc và ghi\nquyen |= EXEC;                  // bật bit:   011 | 100 = 111\nquyen &= ~WRITE;                // tắt bit:   111 & 101 = 101\nquyen ^= READ;                  // đảo bit:   101 ^ 001 = 100\nbool coTheGhi = (quyen & WRITE) != 0;   // kiểm tra bit"});PRESET_NOTES["l11"]={"Ví dụ: Sáu toán tử bit": "Sáu toán tử bit làm việc trên từng bit của số nguyên. Đổi a, b sang nhị phân trên giấy rồi đối chiếu với kết quả in ra.", "Ví dụ: Cờ quyền với mặt nạ": "Dùng mỗi bit làm một “cờ”: | để bật, & ~ để tắt, & để kiểm tra. Cách lưu nhiều quyền trong một số nguyên.", "Ví dụ: Chẵn lẻ và lũy thừa của 2": "Mẹo bit: n & 1 cho biết chẵn lẻ; n & (n − 1) == 0 kiểm tra lũy thừa của 2. Thử nhiều giá trị n.", "Ví dụ: Hoán đổi bằng XOR": "Đổi chỗ hai số bằng ba phép XOR mà không cần biến tạm. Chạy từng bước để thấy a, b thay đổi.", "Ví dụ: Tách màu RGB": "Tách thành phần đỏ, xanh lá, xanh dương của một mã màu bằng dịch bit >> và mặt nạ & 0xFF.", "Cảnh báo: n & 1 == 0": "Cảnh báo: == ưu tiên cao hơn &, nên n & 1 == 0 bị hiểu sai. Đặt (n & 1) trong ngoặc.", "Bẫy: dịch quá số bit": "Bẫy: dịch bằng hoặc quá số bit của kiểu (32 với int) là không xác định; dịch phải số âm cũng cần chú ý.", "Bẫy: & thay vì &&": "Bẫy: & (bit) khác && (logic). 2 && 1 là true, nhưng 2 & 1 bằng 0 vì không có bit chung."};EX_HINTS["l11"]=[["Dịch phải k bit để bit cần xem về vị trí 0: n >> k.", "Lấy bit cuối bằng & 1: (n >> k) & 1."], ["2 mũ n = 1 << n.", "Dòng 2: in ((1 << n) > 1000) với boolalpha."], ["Bật bit k: q | (1 << k); tắt: q & ~(1 << k); đảo: q ^ (1 << k).", "Mỗi dòng tính từ q ban đầu, không dùng kết quả dòng trước."]];
/* ===================== BÀI 11 · Toán tử bit ===================== */
/* Bài 11 · Toán tử bit
   Mã riêng của bài: ví dụ cho trình mô phỏng, công cụ minh họa, bài tập chấm tự động.
   Trắc nghiệm nằm ở quiz.json, đoạn code minh họa ở snippets/*.cpp. */
/* Máy tính bit 8 bit */
function makeBitOps(el){
  let a=12,b=10,op="&",n=2;
  const OPS=[["&","a & b"],["|","a | b"],["^","a ^ b"],["~","~a"],["<<","a << n"],[">>","a >> n"]];
  function calc(){switch(op){case "&":return a&b;case "|":return a|b;case "^":return a^b;case "~":return (~a)&255;case "<<":return (a<<n)&255;case ">>":return a>>n}}
  const bits=(v,id,click)=>{let h="";for(let i=7;i>=0;i--){const on=(v>>i)&1;h+=click?`<button class="bit${on?" on":""}" data-w="${id}" data-i="${i}" aria-label="bit ${i} của ${id}">${on}</button>`:`<span class="bit res${on?" on":""}">${on}</span>`;if(i===4)h+='<span class="gap"></span>'}return h};
  function render(){
    const r=calc(),two=!["~","<<",">>"].includes(op);
    const extra=op==="<<"?` (giữ 8 bit thấp; với int thật là ${a<<n})`:op==="~"?` (8 bit; với int thật là ${~a})`:"";
    el.innerHTML=`<div class="bo-ops" role="group" aria-label="Toán tử">${OPS.map(([o,t])=>`<button class="chip-btn${o===op?" sel":""}" data-op="${esc(o)}" aria-pressed="${o===op}"><code>${esc(t)}</code></button>`).join("")}</div>
      <div class="bo-grid">
        <span class="bo-l">a</span><div class="bits">${bits(a,"a",1)}</div><span class="bo-v"><input type="number" min="0" max="255" value="${a}" data-in="a" aria-label="giá trị a"></span>
        ${two?`<span class="bo-l">b</span><div class="bits">${bits(b,"b",1)}</div><span class="bo-v"><input type="number" min="0" max="255" value="${b}" data-in="b" aria-label="giá trị b"></span>`:op!=="~"?`<span class="bo-l">n</span><div class="bo-n"><input type="range" min="0" max="7" value="${n}" data-in="n" aria-label="số bit dịch"> dịch ${n} bit</div><span></span>`:""}
        <span class="bo-l op">${esc(op==="~"?"~a":op==="<<"||op===">>"?"a "+op+" "+n:"a "+op+" b")}</span><div class="bits">${bits(r,"r",0)}</div><span class="bo-v res">${r}</span>
      </div>
      <p class="note-s">${op==="&"?"AND: bit kết quả là 1 chỉ khi cả hai bit cùng cột là 1. Dùng để giữ lại (lọc) một số bit.":op==="|"?"OR: bit kết quả là 1 khi ít nhất một bit là 1. Dùng để bật bit.":op==="^"?"XOR: bit kết quả là 1 khi hai bit khác nhau. Dùng để đảo bit; a ^ a luôn bằng 0.":op==="~"?"NOT: đảo mọi bit."+extra:op==="<<"?`Dịch trái ${n} bit = nhân ${2**n}${extra}.`:`Dịch phải ${n} bit = chia nguyên cho ${2**n}.`} Hệ 16: <code>0x${r.toString(16).toUpperCase().padStart(2,"0")}</code>.</p>`;
    el.querySelectorAll("[data-op]").forEach(x=>x.onclick=()=>{op=x.dataset.op;render()});
    el.querySelectorAll("[data-w]").forEach(x=>x.onclick=()=>{const m=1<<+x.dataset.i;if(x.dataset.w==="a")a^=m;else b^=m;render()});
    el.querySelectorAll("[data-in]").forEach(x=>x.onchange=x.oninput=()=>{const v=Math.max(0,Math.min(x.dataset.in==="n"?7:255,Math.trunc(+x.value||0)));if(x.dataset.in==="a")a=v;else if(x.dataset.in==="b")b=v;else n=v;if(x.type==="range")render()});
  }
  el.addEventListener("change",e=>{if(e.target.matches('input[type="number"]'))render()});
  render();
}
/* Cờ quyền */
function makeFlags(el){
  let q=1;const F=[["READ",1,"đọc"],["WRITE",2,"ghi"],["EXEC",4,"chạy"]];let last="int quyen = READ;";
  const b3=v=>v.toString(2).padStart(3,"0");
  function render(){
    el.innerHTML=`<div class="fl-state">${F.map(([n,v,vi])=>`<div class="fl ${q&v?"on":""}"><b>${n}</b><span>${vi}</span><code>bit ${Math.log2(v)} = ${q&v?1:0}</code></div>`).join("")}
      <div class="fl-val"><span>quyen</span><b>${q}</b><code>${b3(q)}</code></div></div>
      <div class="fl-acts">${F.map(([n,v])=>`<button class="btn sm" data-a="on" data-f="${n}">Bật ${n}</button><button class="btn sm" data-a="off" data-f="${n}">Tắt ${n}</button><button class="btn sm" data-a="flip" data-f="${n}">Đảo ${n}</button>`).join("")}</div>
      <div class="fl-code"><span>Câu lệnh vừa chạy</span><code>${esc(last)}</code></div>
      <div class="fl-chk">${F.map(([n,v])=>`<div><code>(quyen &amp; ${n}) != 0</code><b class="${q&v?"t":"f"}">${q&v?"true":"false"}</b></div>`).join("")}</div>`;
    el.querySelectorAll("[data-a]").forEach(x=>x.onclick=()=>{const [n,v]=F.find(f=>f[0]===x.dataset.f);const old=q;
      if(x.dataset.a==="on"){q|=v;last=`quyen |= ${n};   // ${b3(old)} | ${b3(v)} = ${b3(q)}`}
      else if(x.dataset.a==="off"){q&=~v;last=`quyen &= ~${n};  // ${b3(old)} & ${b3(~v&7)} = ${b3(q)}`}
      else{q^=v;last=`quyen ^= ${n};   // ${b3(old)} ^ ${b3(v)} = ${b3(q)}`}
      render()});
  }
  render();
}
const P11=[
 {label:"Ví dụ: Sáu toán tử bit",input:"12 10",code:`#include <iostream>
using namespace std;

int main() {
    int a, b;
    cin >> a >> b;
    cout << "a & b  = " << (a & b) << "\\n";
    cout << "a | b  = " << (a | b) << "\\n";
    cout << "a ^ b  = " << (a ^ b) << "\\n";
    cout << "~a     = " << ~a << "\\n";
    cout << "a << 2 = " << (a << 2) << "\\n";
    cout << "a >> 1 = " << (a >> 1) << "\\n";
    return 0;
}`},
 {label:"Ví dụ: Cờ quyền với mặt nạ",code:`#include <iostream>
using namespace std;

int main() {
    constexpr int READ = 1 << 0, WRITE = 1 << 1, EXEC = 1 << 2;
    int quyen = READ | WRITE;
    cout << "Ban đầu: " << quyen << "\\n";
    quyen |= EXEC;
    cout << "Bật EXEC: " << quyen << "\\n";
    quyen &= ~WRITE;
    cout << "Tắt WRITE: " << quyen << "\\n";
    cout << boolalpha << "Ghi được? " << ((quyen & WRITE) != 0) << "\\n";
    return 0;
}`},
 {label:"Ví dụ: Chẵn lẻ và lũy thừa của 2",input:"64",code:`#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    cout << boolalpha;
    cout << "Lẻ? " << ((n & 1) == 1) << "\\n";
    cout << "Lũy thừa của 2? " << (n > 0 && (n & (n - 1)) == 0) << "\\n";
    return 0;
}`},
 {label:"Ví dụ: Hoán đổi bằng XOR",input:"5 9",code:`#include <iostream>
using namespace std;

int main() {
    int a, b;
    cin >> a >> b;
    a ^= b;
    b ^= a;
    a ^= b;
    cout << a << " " << b << "\\n";
    return 0;
}`},
 {label:"Ví dụ: Tách màu RGB",code:`#include <iostream>
using namespace std;

int main() {
    int mau = 0xFF8C1A;              // cam: R=255, G=140, B=26
    int r = (mau >> 16) & 0xFF;
    int g = (mau >> 8) & 0xFF;
    int b = mau & 0xFF;
    cout << r << " " << g << " " << b << "\\n";
    return 0;
}`},
 {label:"Cảnh báo: n & 1 == 0",input:"6",code:`#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    cout << (n & 1 == 0) << "\\n";      // n & (1 == 0) = n & 0
    cout << ((n & 1) == 0) << "\\n";    // đúng ý
    return 0;
}`},
 {label:"Bẫy: dịch quá số bit",code:`#include <iostream>
using namespace std;

int main() {
    cout << (1 << 31) << "\\n";
    cout << (1 << 32) << "\\n";
    cout << (-16 >> 2) << "\\n";
    return 0;
}`},
 {label:"Bẫy: & thay vì &&",code:`#include <iostream>
using namespace std;

int main() {
    int a = 2, b = 1;
    cout << boolalpha;
    cout << (a && b) << "\\n";   // true
    cout << (a & b) << "\\n";    // 0: 10 & 01 = 00
    return 0;
}`}
];
const sim11=makeSim2(document.getElementById("sim-l11"),{id:"s11",presets:P11});
makeBitOps(document.getElementById("bitops-l11"));
makeFlags(document.getElementById("flags-l11"));
makeEx2(document.getElementById("ex-l11"),sim11,[
 {t:"Bit thứ k",d:"Nhập n và k (0 ≤ k ≤ 30). In giá trị bit thứ k của n (0 hoặc 1), đếm từ bit 0 bên phải.",
  tests:[{in:"12 2",out:"1"},{in:"12 0",out:"0"},{in:"255 7",out:"1"},{in:"1024 10",out:"1"}],need:/>>|<</,needMsg:"Hãy dùng toán tử dịch bit.",
  start:`#include <iostream>
using namespace std;

int main() {
    int n, k;
    cin >> n >> k;

    return 0;
}`},
 {t:"Lũy thừa của 2",d:"Nhập n (0 ≤ n ≤ 30). Dòng 1 in 2 mũ n bằng phép dịch bit. Dòng 2 in true/false: 2 mũ n có lớn hơn 1000 không.",
  tests:[{in:"10",out:"1024\ntrue"},{in:"3",out:"8\nfalse"},{in:"0",out:"1\nfalse"}],need:/<</,needMsg:"Hãy tính 2 mũ n bằng 1 << n.",
  start:`#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;

    return 0;
}`},
 {t:"Bật, tắt, đảo bit",d:"Nhập số q. In 3 dòng: q sau khi bật bit 2; q sau khi tắt bit 0; q sau khi đảo bit 1. Mỗi dòng tính từ q ban đầu.",
  tests:[{in:"1",out:"5\n0\n3"},{in:"7",out:"7\n6\n5"},{in:"10",out:"14\n10\n8"}],
  start:`#include <iostream>
using namespace std;

int main() {
    int q;
    cin >> q;

    return 0;
}`}
]);

makeQuiz("quiz11","score11",[{"q": "<code>12 &amp; 10<\/code> bằng?", "o": ["22", "8", "14", "6"], "a": 1, "e": "1100 & 1010 = 1000 = 8."}, {"q": "Câu lệnh nào <b>tắt<\/b> bit WRITE trong biến quyen?", "o": ["<code>quyen |= WRITE;<\/code>", "<code>quyen &amp;= ~WRITE;<\/code>", "<code>quyen ^= WRITE;<\/code>", "<code>quyen = !WRITE;<\/code>"], "a": 1, "e": "~WRITE có mọi bit là 1 trừ bit WRITE; AND với nó xóa đúng bit đó. ^= là đảo, không phải tắt."}, {"q": "<code>5 &lt;&lt; 3<\/code> bằng?", "o": ["15", "40", "8", "125"], "a": 1, "e": "Dịch trái 3 bit = nhân 2³ = 8: 5 × 8 = 40."}, {"q": "Với n = 6, <code>n &amp; 1 == 0<\/code> bằng?", "o": ["1 (n chẵn)", "0", "6", "Lỗi"], "a": 1, "e": "== tính trước &: n & (1 == 0) = 6 & 0 = 0. Phải viết (n & 1) == 0."}]);

fillSnips();
