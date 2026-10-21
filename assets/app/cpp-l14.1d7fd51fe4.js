lazyWidgets();
Object.assign(SNIP,{"l14while": "int i = 1;                // 1. khởi tạo\nwhile (i <= 5) {          // 2. kiểm tra điều kiện\n    cout << i << \" \";\n    i++;                  // 3. cập nhật\n}\ncout << \"\\nXong\";    // in: 1 2 3 4 5", "l14do": "int diem;\ndo {\n    cout << \"Nhập điểm (0-10): \";\n    cin >> diem;\n} while (diem < 0 || diem > 10);     // sai thì hỏi lại\ncout << \"Điểm hợp lệ: \" << diem;"});PRESET_NOTES["l14"]={"Ví dụ: Đếm từ 1 đến n": "while lặp lại khối lệnh khi điều kiện còn đúng. Chạy từng bước để thấy i tăng dần và vòng lặp dừng khi i > n.", "Ví dụ: Tổng 1 + 2 + … + n": "Dùng biến tích lũy (tong) cộng dồn qua từng vòng. Đây là khuôn mẫu cơ bản của rất nhiều bài toán.", "Ví dụ: Đếm chữ số và đảo số": "Lặp theo chữ số: mỗi vòng lấy chữ số cuối bằng % 10 rồi bỏ nó bằng / 10, cho tới khi n bằng 0.", "Ví dụ: do-while hỏi lại khi nhập sai": "do-while chạy thân vòng ít nhất một lần rồi mới kiểm tra. Hợp với việc hỏi lại khi người dùng nhập sai.", "Ví dụ: Đọc đến hết dữ liệu": "Đọc tới khi hết dữ liệu: while (cin >> x) dừng khi cin không đọc được nữa. Khi chạy tay, bấm “Kết thúc nhập” để báo hết dữ liệu.", "Ví dụ: Lính canh, dừng khi gặp 0": "Dùng giá trị “lính canh” (ở đây là 0) để báo dừng đọc. Chú ý số 9 sau số 0 không được cộng.", "Lỗi: vòng lặp vô hạn": "Lỗi: quên tăng biến đếm nên điều kiện luôn đúng, vòng lặp chạy mãi. Trình mô phỏng tự dừng sau giới hạn số bước.", "Lỗi: dấu ; sau while": "Lỗi: dấu ; sau while làm thân vòng thành lệnh rỗng, vòng lặp chạy mãi mà không bao giờ tới khối { }.", "Bẫy: lệch một vòng": "Bẫy lệch một vòng: dùng < thay cho <= nên thiếu lần lặp cuối. Kiểm tra kỹ giá trị đầu và cuối của biến đếm."};EX_HINTS["l14"]=[["Mỗi vòng: cộng n % 10 vào tổng, rồi n /= 10.", "Lặp while (n > 0); nếu n = 0 ngay từ đầu thì tổng là 0."], ["Đọc số đầu tiên trước vòng lặp; lặp while (x != 0).", "Trong vòng: tăng biến đếm, cộng tổng, rồi đọc số tiếp theo."], ["do { đọc điểm; nếu sai thì tăng đếm } while (điểm ngoài 0–10);", "In \"Diem: \" và \"So lan nhap sai: \" trên hai dòng."]];
/* ===================== BÀI 14 · while, do-while ===================== */
/* Bài 14 · while, do-while
   Mã riêng của bài: ví dụ cho trình mô phỏng, công cụ minh họa, bài tập chấm tự động.
   Trắc nghiệm nằm ở quiz.json, đoạn code minh họa ở snippets/*.cpp. */
/* Bảng theo dõi vòng lặp */
function makeLoopTable(el,{variants}){
  let vi=0;
  el.innerHTML=`<div class="seg lt-seg" role="group" aria-label="Ví dụ">${variants.map((v,i)=>`<button data-v="${i}" aria-pressed="${i===0}">${esc(v.label)}</button>`).join("")}</div>
    <label class="lab-f lt-in"><span class="lt-lab"></span><input type="range" class="lt-n" aria-label="Giá trị đầu vào"><output class="lt-o"></output></label>
    <div class="lt-body"><div class="code lt-code"></div><div class="lt-side"><div class="tbl lt-tbl"></div><p class="lt-sum"></p></div></div>`;
  const nIn=el.querySelector(".lt-n");
  function setup(){const v=variants[vi];nIn.min=v.n.min;nIn.max=v.n.max;nIn.step=v.n.step||1;nIn.value=v.n.val;el.querySelector(".lt-lab").textContent=v.n.lab;
    el.querySelectorAll("[data-v]").forEach(b=>b.setAttribute("aria-pressed",String(+b.dataset.v===vi)));render()}
  function render(){
    const v=variants[vi],n=+nIn.value;el.querySelector(".lt-o").textContent=n;
    const src=v.code(n);el.querySelector(".lt-code").innerHTML=highlightLines(src).map((s,i)=>`<span class="ln" data-n="${i+1}">${s||" "}</span>`).join("");
    let c;try{c=compile2(src)}catch(e){el.querySelector(".lt-tbl").textContent=e.message;return}
    const M=new M2(c.prog,src,{interactive:false});const rows=[];let r,bodyRuns=0;
    for(let k=0;k<5000;k++){const before=Object.fromEntries(v.watch.map(w=>[w,M.vars.has(w)?M.vars.get(w).v:"—"]));r=M.step();
      if(r.op&&["jf","jt"].includes(r.op)&&["while","do-while","for"].includes(r.kw)){rows.push({vals:v.watch.map(w=>M.vars.has(w)?M.vars.get(w).v:before[w]),cond:r.cond,kw:r.kw,line:r.line});if(r.cond)bodyRuns++}
      if(r.s!=="ran")break}
    const groups=[...new Set(rows.map(x=>x.line))];
    const show=rows.slice(0,40);
    el.querySelector(".lt-tbl").innerHTML=`<table><thead><tr><th>Lần kiểm tra</th>${v.watch.map(w=>`<th><code>${esc(w)}</code></th>`).join("")}<th>${groups.length>1?"Vòng lặp":""} Điều kiện</th></tr></thead><tbody>${
      show.map((x,i)=>`<tr class="${x.cond?"":"stop"}"><td class="num">${i+1}</td>${x.vals.map(val=>`<td class="num">${esc(String(val))}</td>`).join("")}<td>${groups.length>1?`<small>dòng ${x.line}</small> `:""}<b class="${x.cond?"t":"f"}">${x.cond?"đúng":"sai → thoát"}</b></td></tr>`).join("")}${rows.length>40?`<tr><td colspan="${v.watch.length+2}">… còn ${rows.length-40} lần nữa</td></tr>`:""}</tbody></table>`;
    el.querySelector(".lt-sum").innerHTML=(v.sum?v.sum(rows,M):`Thân vòng lặp chạy <b>${bodyRuns}</b> lần.`)+` Console: <code>${esc(M.text().replace(/\n/g," ⏎ ")||"(trống)")}</code>`;
  }
  el.querySelectorAll("[data-v]").forEach(b=>b.onclick=()=>{vi=+b.dataset.v;setup()});
  nIn.addEventListener("input",render);setup();
}
const P14=[
 {label:"Ví dụ: Đếm từ 1 đến n",input:"5",code:`#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    int i = 1;
    while (i <= n) {
        cout << i << " ";
        i++;
    }
    cout << "\\n";
    return 0;
}`},
 {label:"Ví dụ: Tổng 1 + 2 + … + n",input:"100",code:`#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    int i = 1;
    long long tong = 0;
    while (i <= n) {
        tong += i;
        i++;
    }
    cout << "Tổng = " << tong << "\\n";
    return 0;
}`},
 {label:"Ví dụ: Đếm chữ số và đảo số",input:"20261019",code:`#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    int dem = 0, dao = 0;
    while (n > 0) {
        int chuSo = n % 10;
        dao = dao * 10 + chuSo;
        dem++;
        n /= 10;
    }
    cout << dem << " chữ số, đảo ngược: " << dao << "\\n";
    return 0;
}`},
 {label:"Ví dụ: do-while hỏi lại khi nhập sai",input:"12 -3 7",code:`#include <iostream>
using namespace std;

int main() {
    int diem;
    do {
        cout << "Nhập điểm (0-10): ";
        cin >> diem;
    } while (diem < 0 || diem > 10);
    cout << "Điểm hợp lệ: " << diem << "\\n";
    return 0;
}`},
 {label:"Ví dụ: Đọc đến hết dữ liệu",input:"8 6.5 9 7",code:`#include <iostream>
using namespace std;

int main() {
    double x, tong = 0;
    int dem = 0;
    while (cin >> x) {     // dừng khi hết dữ liệu
        tong += x;
        dem++;
    }
    cout << dem << " số, trung bình " << tong / dem << "\\n";
    return 0;
}`},
 {label:"Ví dụ: Lính canh, dừng khi gặp 0",input:"5 3 8 0 9",code:`#include <iostream>
using namespace std;

int main() {
    int x, tong = 0;
    cin >> x;
    while (x != 0) {
        tong += x;
        cin >> x;
    }
    cout << "Tổng: " << tong << "\\n";
    return 0;
}`},
 {label:"Lỗi: vòng lặp vô hạn",code:`#include <iostream>
using namespace std;

int main() {
    int i = 1;
    while (i <= 5) {
        cout << i << " ";
        // quên i++;
    }
    return 0;
}`},
 {label:"Lỗi: dấu ; sau while",code:`#include <iostream>
using namespace std;

int main() {
    int i = 1;
    while (i <= 5);
    {
        cout << i << " ";
        i++;
    }
    return 0;
}`},
 {label:"Bẫy: lệch một vòng",code:`#include <iostream>
using namespace std;

int main() {
    int n = 5, i = 1, tong = 0;
    while (i < n) {          // muốn cộng 1..5
        tong += i;
        i++;
    }
    cout << tong << "\\n";   // 10, không phải 15
    return 0;
}`}
];
const sim14=makeSim2(document.getElementById("sim-l14"),{id:"s14",presets:P14});
makeLoopTable(document.getElementById("loop-l14"),{variants:[
 {label:"Tổng 1 + … + n",n:{min:0,max:12,val:5,lab:"n ="},watch:["i","tong"],code:n=>`#include <iostream>
using namespace std;
int main() {
    int n = ${n};
    int i = 1, tong = 0;
    while (i <= n) {
        tong += i;
        i++;
    }
    cout << tong;
}`},
 {label:"Tách chữ số",n:{min:0,max:99999,val:4072,lab:"n ="},watch:["n","tong"],code:n=>`#include <iostream>
using namespace std;
int main() {
    int n = ${n};
    int tong = 0;
    while (n > 0) {
        tong += n % 10;
        n /= 10;
    }
    cout << tong;
}`},
 {label:"Nhân đôi đến khi vượt",n:{min:1,max:1000,val:100,lab:"gioiHan ="},watch:["x","lan"],code:n=>`#include <iostream>
using namespace std;
int main() {
    int gioiHan = ${n};
    int x = 1, lan = 0;
    while (x <= gioiHan) {
        x *= 2;
        lan++;
    }
    cout << x << " sau " << lan << " lần";
}`},
 {label:"while và do-while khi điều kiện sai ngay từ đầu",n:{min:0,max:5,val:0,lab:"n ="},watch:["a","b"],code:n=>`#include <iostream>
using namespace std;
int main() {
    int n = ${n};
    int a = 0, b = 0;
    while (a < n) {
        a++;
    }
    do {
        b++;
    } while (b < n);
    cout << "while: " << a << ", do-while: " << b;
}`,sum:(rows)=>{const w=rows.filter(r=>r.kw==="while"&&r.cond).length,d=rows.filter(r=>r.kw==="do-while").length;return `Thân <code>while</code> chạy <b>${w}</b> lần, thân <code>do-while</code> chạy <b>${d}</b> lần (luôn ít nhất 1).`}}
]});
makeEx2(document.getElementById("ex-l14"),sim14,[
 {t:"Tổng các chữ số",d:"Nhập số nguyên không âm n (có thể rất nhiều chữ số, tối đa 2 tỷ). In tổng các chữ số của n.",
  tests:[{in:"12345",out:"15"},{in:"0",out:"0"},{in:"2000000000",out:"2"},{in:"987654321",out:"45"}],need:/while/,needMsg:"Hãy dùng vòng lặp while.",
  start:`#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;

    return 0;
}`},
 {t:"Đếm và cộng đến khi gặp 0",d:"Đọc lần lượt các số nguyên cho đến khi gặp số 0 (không tính số 0). In số lượng số đã đọc và tổng của chúng, cách nhau một dấu cách.",
  tests:[{in:"5 3 8 0",out:"3 16"},{in:"0",out:"0 0"},{in:"-2 7 0 100",out:"2 5"}],need:/while/,needMsg:"Hãy dùng vòng lặp while.",
  start:`#include <iostream>
using namespace std;

int main() {
    int x;
    int dem = 0, tong = 0;

    return 0;
}`},
 {t:"Nhập lại khi sai",d:"Dùng do-while đọc điểm (số nguyên) cho tới khi nhận được số trong khoảng 0–10. Dòng 1 in “Diem: ” và điểm hợp lệ. Dòng 2 in “So lan nhap sai: ” và số lần nhập sai.",
  tests:[{in:"12 -3 7",out:"Diem: 7\nSo lan nhap sai: 2"},{in:"5",out:"Diem: 5\nSo lan nhap sai: 0"},{in:"11 10",out:"Diem: 10\nSo lan nhap sai: 1"}],need:/\bdo\b/,needMsg:"Hãy dùng vòng lặp do-while.",
  start:`#include <iostream>
using namespace std;

int main() {
    int diem;
    int sai = 0;

    return 0;
}`}
]);

makeQuiz("quiz14","score14",[{"q": "<code>int i = 0; while (i &lt; 5) i += 2;<\/code> Thân chạy mấy lần?", "o": ["2", "3", "5", "Vô hạn"], "a": 1, "e": "i = 0, 2, 4 thì điều kiện đúng (3 lần); i = 6 thì dừng."}, {"q": "Điểm khác biệt chính của do-while so với while?", "o": ["Chạy nhanh hơn", "Thân chạy ít nhất một lần", "Không cần điều kiện", "Chỉ dùng với số"], "a": 1, "e": "do-while kiểm tra điều kiện sau khi chạy thân."}, {"q": "Đoạn <code>while (i &lt;= 5); { i++; }<\/code> có vấn đề gì?", "o": ["Không vấn đề", "Dấu ; tạo vòng lặp rỗng, chạy mãi", "Lỗi biên dịch", "Chỉ chạy 1 lần"], "a": 1, "e": "Dấu ; là thân rỗng của while; i không bao giờ đổi nên vòng lặp không dừng."}, {"q": "Muốn cộng 1 + 2 + … + n, điều kiện nào đúng khi bắt đầu từ <code>i = 1<\/code>?", "o": ["<code>i &lt; n<\/code>", "<code>i &lt;= n<\/code>", "<code>i &gt; n<\/code>", "<code>i != n<\/code>"], "a": 1, "e": "i < n bỏ sót số n (lỗi lệch một)."}]);

fillSnips();
