lazyWidgets();
Object.assign(SNIP,{"l15for": "for (int i = 1; i <= 5; i++) {\n    cout << i << \" \";\n}\n// in: 1 2 3 4 5", "l15while": "int i = 1;\nwhile (i <= 5) {\n    cout << i << \" \";\n    i++;\n}"});PRESET_NOTES["l15"]={"Ví dụ: Bảng cửu chương": "for gom khởi tạo, điều kiện và bước tăng vào một dòng. Bảng cửu chương là ví dụ điển hình của số lần lặp biết trước.", "Ví dụ: Tổng các số chẵn từ 1 đến n": "Bước tăng không nhất thiết là 1: i += 2 chỉ đi qua các số chẵn.", "Ví dụ: Đếm ngược": "Vòng for đếm ngược bằng i--. Theo dõi điều kiện i >= 1 để biết khi nào vòng dừng.", "Ví dụ: Tam giác sao (vòng lồng nhau)": "Vòng lặp lồng nhau: vòng trong chạy hết mỗi lần vòng ngoài lặp một lần. Số * mỗi dòng phụ thuộc i.", "Ví dụ: Ước nhỏ nhất lớn hơn 1 (break)": "break thoát khỏi vòng lặp ngay khi đã tìm thấy kết quả, không cần lặp tiếp.", "Ví dụ: Bỏ qua số âm (continue)": "continue bỏ qua phần còn lại của lần lặp hiện tại và sang lần kế tiếp. Ở đây số âm không được cộng.", "Lỗi: dấu ; ngay sau for": "Lỗi: dấu ; ngay sau for làm vòng lặp có thân rỗng, khối { } chỉ chạy một lần.", "Lỗi: dùng biến đếm sau vòng for": "Lỗi biên dịch: biến khai báo trong for chỉ tồn tại trong vòng lặp, không dùng được sau đó.", "Lỗi: dấu phẩy thay chấm phẩy": "Lỗi biên dịch: ba phần trong for ngăn bằng dấu chấm phẩy, không phải dấu phẩy."};EX_HINTS["l15"]=[["for (int i = 1; i <= 10; i++)", "Mỗi dòng: n << \" x \" << i << \" = \" << n * i."], ["n < 2 không phải số nguyên tố.", "Thử d từ 2 khi d * d <= n; gặp n % d == 0 thì kết luận NO và break."], ["Hai vòng lồng nhau: i từ 1 đến n, j từ 1 đến i.", "In dấu cách giữa các số (không in sau số cuối), hết dòng in \"\\n\"."]];
/* ===================== BÀI 15 · for, break, continue ===================== */
/* Bài 15 · for, break, continue
   Mã riêng của bài: ví dụ cho trình mô phỏng, công cụ minh họa, bài tập chấm tự động.
   Trắc nghiệm nằm ở quiz.json, đoạn code minh họa ở snippets/*.cpp. */
/* ================= WIDGET + DỮ LIỆU BÀI 15–19 ================= */
/* Bộ dựng vòng for: chọn giá trị đầu, điều kiện, bước nhảy */
function makeForBuilder(el){
  const OPS=["<","<=",">",">=","!="],UPS=["i++","i--","i += 2","i -= 2","i *= 2"];
  el.innerHTML=`<div class="fb-row code" role="group" aria-label="Dòng for"><span class="t-kw">for</span> (<span class="t-kw">int</span> i = <input type="number" class="fb-a" value="0" min="-20" max="60" aria-label="Giá trị đầu của i">; i <select class="fb-op" aria-label="Phép so sánh">${OPS.map(o=>`<option${o==="<"?" selected":""}>${esc(o)}</option>`).join("")}</select> <input type="number" class="fb-b" value="5" min="-20" max="60" aria-label="Giá trị so sánh">; <select class="fb-up" aria-label="Bước nhảy">${UPS.map(o=>`<option>${esc(o)}</option>`).join("")}</select>)</div>
    <div class="fb-pre" role="group" aria-label="Mẫu có sẵn"><span>Thử nhanh:</span>
      <button class="chip-btn" data-s="0,<,5,i++">0 → 4</button><button class="chip-btn" data-s="1,<=,5,i++">1 → 5</button><button class="chip-btn" data-s="10,>=,1,i--">đếm lùi</button><button class="chip-btn" data-s="0,<=,10,i += 2">số chẵn</button><button class="chip-btn" data-s="1,<=,100,i *= 2">lũy thừa 2</button><button class="chip-btn" data-s="10,<,0,i--">không chạy</button><button class="chip-btn" data-s="0,!=,5,i += 2">!= vượt qua</button><button class="chip-btn" data-s="0,<,5,i--">sai hướng</button></div>
    <div class="fb-seq" aria-live="polite"></div><p class="fb-sum"></p>`;
  const $=s=>el.querySelector(s);
  function render(){
    const a=Math.max(-99,Math.min(99,parseInt($(".fb-a").value,10)||0)),b=Math.max(-99,Math.min(99,parseInt($(".fb-b").value,10)||0)),op=$(".fb-op").value,up=$(".fb-up").value;
    const src=`#include <iostream>\nusing namespace std;\n\nint main() {\n    for (int i = ${a}; i ${op} ${b}; ${up})\n        cout << i << " ";\n}`;
    const c=compile2(src);const M=new M2(c.prog,src,{interactive:false});const rows=[];
    for(let k=0;k<1200;k++){const V0=M.vars.get("i"),pre=V0?V0.v:"?";const r=M.step();if(r.op==="jf"&&r.kw==="for")rows.push({i:pre,ok:r.cond});if(r.s!=="ran"||rows.length>=150)break}
    const inf=!M.done;const runs=rows.filter(x=>x.ok).length,show=rows.slice(0,36);
    $(".fb-seq").innerHTML=`<span class="fb-st">① i = ${a}</span>`+show.map(x=>`<span class="fb-c ${x.ok?"t":"f"}">i = ${x.i} ${x.ok?"✓":"✗ thoát"}</span>`).join("")+(rows.length>36?`<span class="fb-c more">… ${inf?"còn mãi":"còn "+(rows.length-36)}</span>`:"");
    $(".fb-sum").innerHTML=inf?`<b class="bad-t">Vòng lặp vô hạn:</b> sau ${rows.length} lần kiểm tra điều kiện vẫn đúng. Bước nhảy <code>${esc(up)}</code> không đưa <code>i</code> tới chỗ làm điều kiện <code>i ${esc(op)} ${b}</code> sai. Trình mô phỏng dừng lại để minh họa.`
      :runs===0?`Điều kiện sai ngay lần kiểm tra đầu tiên nên thân vòng lặp <b>không chạy lần nào</b>.`
      :`Thân vòng lặp chạy <b>${runs}</b> lần, điều kiện được kiểm tra <b>${rows.length}</b> lần (lần cuối sai thì thoát). Console: <code>${esc(M.text().trim())}</code>`}
  el.querySelectorAll("input,select").forEach(x=>x.addEventListener("input",render));
  el.querySelectorAll("[data-s]").forEach(btn=>btn.onclick=()=>{const [a,op,b,up]=btn.dataset.s.split(",");$(".fb-a").value=a;$(".fb-op").value=op;$(".fb-b").value=b;$(".fb-up").value=up;render()});
  render();
}
/* Vòng lặp lồng nhau: in hình */
function makeNest(el,{variants}){
  let vi=0;
  el.innerHTML=`<div class="seg lt-seg" role="group" aria-label="Hình">${variants.map((v,i)=>`<button data-v="${i}" aria-pressed="${i===0}">${esc(v.label)}</button>`).join("")}</div>
    <label class="lab-f"><span>n =</span><input type="range" class="ns-n" min="1" max="7" value="4" aria-label="n"><output class="ns-o">4</output></label>
    <div class="lt-body"><div class="code ns-code"></div><div><div class="pane-h" style="padding:0 0 6px">Console</div><pre class="lr-out ns-out"></pre><p class="lt-sum ns-sum"></p></div></div>`;
  const $=s=>el.querySelector(s);
  function render(){const v=variants[vi],n=+$(".ns-n").value;$(".ns-o").textContent=n;
    el.querySelectorAll("[data-v]").forEach(b=>b.setAttribute("aria-pressed",String(+b.dataset.v===vi)));
    const src=v.code(n);$(".ns-code").innerHTML=highlightLines(src).map((s,i)=>`<span class="ln${i+1===v.inner?" hl":""}" data-n="${i+1}">${s||" "}</span>`).join("");
    const c=compile2(src);const M=new M2(c.prog,src,{interactive:false});let inner=0,outer=0;
    for(let k=0;k<20000;k++){const r=M.step();if(r.op==="stmt"&&r.line===v.inner)inner++;if(r.op==="jf"&&r.line===v.outer&&r.cond)outer++;if(r.s!=="ran")break}
    $(".ns-out").textContent=M.text();
    $(".ns-sum").innerHTML=`Vòng ngoài chạy <b>${outer}</b> lần; dòng tô sáng (thân vòng trong) chạy tổng cộng <b>${inner}</b> lần.`}
  el.querySelectorAll("[data-v]").forEach(b=>b.onclick=()=>{vi=+b.dataset.v;render()});
  $(".ns-n").addEventListener("input",render);render();
}

/* ---------- Bài 15 ---------- */
makeForBuilder(document.getElementById("forb-l15"));
makeNest(document.getElementById("nest-l15"),{variants:[
 {label:"Hình chữ nhật",inner:7,outer:5,code:n=>`#include <iostream>
using namespace std;
int main() {
    int n = ${n};
    for (int i = 1; i <= n; i++) {
        for (int j = 1; j <= 6; j++)
            cout << '*';
        cout << '\\n';
    }
}`},
 {label:"Tam giác vuông",inner:7,outer:5,code:n=>`#include <iostream>
using namespace std;
int main() {
    int n = ${n};
    for (int i = 1; i <= n; i++) {
        for (int j = 1; j <= i; j++)
            cout << '*';
        cout << '\\n';
    }
}`},
 {label:"Bảng cửu chương nhỏ",inner:8,outer:6,code:n=>`#include <iostream>
#include <iomanip>
using namespace std;
int main() {
    int n = ${n};
    for (int i = 1; i <= n; i++) {
        for (int j = 1; j <= n; j++)
            cout << setw(4) << i * j;
        cout << '\\n';
    }
}`},
 {label:"Tam giác cân",inner:9,outer:5,code:n=>`#include <iostream>
using namespace std;
int main() {
    int n = ${n};
    for (int i = 1; i <= n; i++) {
        for (int j = 1; j <= n - i; j++)
            cout << ' ';
        for (int j = 1; j <= 2 * i - 1; j++)
            cout << '*';
        cout << '\\n';
    }
}`}
]});
const BC=(kw)=>`#include <iostream>
using namespace std;

int main() {
    for (int i = 1; i <= 6; i++) {
        if (i % {{N}} == 0)
            ${kw};
        cout << i << " ";
    }
    cout << "| hết";
}`;
makeLineRun(document.getElementById("run-l15"),{id:"lr15",label:"k =",values:[2,3,4,7],variants:[{label:"break",code:BC("break")},{label:"continue",code:BC("continue")}]});

const P15=[
 {label:"Ví dụ: Bảng cửu chương",input:"7",code:`#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    for (int i = 1; i <= 10; i++) {
        cout << n << " x " << i << " = " << n * i << "\\n";
    }
    return 0;
}`},
 {label:"Ví dụ: Tổng các số chẵn từ 1 đến n",input:"10",code:`#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    int tong = 0;
    for (int i = 2; i <= n; i += 2) {
        tong += i;
    }
    cout << "Tổng số chẵn: " << tong << "\\n";
    return 0;
}`},
 {label:"Ví dụ: Đếm ngược",input:"5",code:`#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    for (int i = n; i >= 1; i--) {
        cout << i << "... ";
    }
    cout << "Bắt đầu!\\n";
    return 0;
}`},
 {label:"Ví dụ: Tam giác sao (vòng lồng nhau)",input:"4",code:`#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    for (int i = 1; i <= n; i++) {
        for (int j = 1; j <= i; j++) {
            cout << "* ";
        }
        cout << "\\n";
    }
    return 0;
}`},
 {label:"Ví dụ: Ước nhỏ nhất lớn hơn 1 (break)",input:"91",code:`#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    int uoc = n;
    for (int d = 2; d * d <= n; d++) {
        if (n % d == 0) {
            uoc = d;
            break;              // tìm thấy rồi, thoát luôn
        }
    }
    cout << "Ước nhỏ nhất: " << uoc << "\\n";
    return 0;
}`},
 {label:"Ví dụ: Bỏ qua số âm (continue)",input:"5\n4 -2 7 -1 3",code:`#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    int tong = 0;
    for (int i = 0; i < n; i++) {
        int x;
        cin >> x;
        if (x < 0)
            continue;           // bỏ qua, sang số kế tiếp
        tong += x;
    }
    cout << "Tổng các số không âm: " << tong << "\\n";
    return 0;
}`},
 {label:"Lỗi: dấu ; ngay sau for",code:`#include <iostream>
using namespace std;

int main() {
    for (int i = 1; i <= 5; i++);
    {
        cout << "Xin chào\\n";     // chỉ in 1 lần!
    }
    return 0;
}`},
 {label:"Lỗi: dùng biến đếm sau vòng for",code:`#include <iostream>
using namespace std;

int main() {
    int tong = 0;
    for (int i = 1; i <= 5; i++) {
        tong += i;
    }
    cout << "i cuối cùng = " << i << "\\n";
    return 0;
}`},
 {label:"Lỗi: dấu phẩy thay chấm phẩy",code:`#include <iostream>
using namespace std;

int main() {
    for (int i = 0, i < 5, i++) {
        cout << i;
    }
    return 0;
}`}
];
const sim15=makeSim2(document.getElementById("sim-l15"),{id:"s15",presets:P15});
makeEx2(document.getElementById("ex-l15"),sim15,[
 {t:"Bảng cửu chương",d:"Nhập số nguyên n. In 10 dòng dạng “n x i = kết quả” với i từ 1 đến 10.",
  tests:[{in:"7",out:"7 x 1 = 7\n7 x 2 = 14\n7 x 3 = 21\n7 x 4 = 28\n7 x 5 = 35\n7 x 6 = 42\n7 x 7 = 49\n7 x 8 = 56\n7 x 9 = 63\n7 x 10 = 70"},{in:"1",out:"1 x 1 = 1\n1 x 2 = 2\n1 x 3 = 3\n1 x 4 = 4\n1 x 5 = 5\n1 x 6 = 6\n1 x 7 = 7\n1 x 8 = 8\n1 x 9 = 9\n1 x 10 = 10"},{in:"12",out:"12 x 1 = 12\n12 x 2 = 24\n12 x 3 = 36\n12 x 4 = 48\n12 x 5 = 60\n12 x 6 = 72\n12 x 7 = 84\n12 x 8 = 96\n12 x 9 = 108\n12 x 10 = 120"}],need:/\bfor\s*\(/,needMsg:"Hãy dùng vòng lặp for.",
  start:`#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;

    return 0;
}`},
 {t:"Số nguyên tố",d:"Nhập số nguyên n. In “YES” nếu n là số nguyên tố, ngược lại in “NO”. Gợi ý: chỉ cần thử chia cho d với d * d <= n, gặp ước thì break.",
  tests:[{in:"2",out:"YES"},{in:"1",out:"NO"},{in:"97",out:"YES"},{in:"91",out:"NO"},{in:"0",out:"NO"},{in:"1000003",out:"YES"}],need:/\bfor\s*\(/,needMsg:"Hãy dùng vòng lặp for.",
  start:`#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;

    return 0;
}`},
 {t:"Tam giác số",d:"Nhập n. In n dòng: dòng thứ i gồm các số từ 1 đến i, cách nhau một dấu cách.",
  tests:[{in:"3",out:"1\n1 2\n1 2 3"},{in:"1",out:"1"},{in:"5",out:"1\n1 2\n1 2 3\n1 2 3 4\n1 2 3 4 5"}],need:/for[\s\S]*for/,needMsg:"Hãy dùng hai vòng for lồng nhau.",
  start:`#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;

    return 0;
}`}
]);

makeQuiz("quiz15","score15",[{"q": "Trong <code>for (A; B; C) { D }<\/code>, phần nào chỉ chạy đúng một lần?", "o": ["A", "B", "C", "D"], "a": 0, "e": "Khởi tạo A chạy một lần. Sau đó lặp: B, D, C, B, D, C… cho tới khi B sai."}, {"q": "<code>for (int i = 0; i &lt; 10; i += 3) cout &lt;&lt; i;<\/code> in ra?", "o": ["0369", "036", "03691", "0 3 6 9 12"], "a": 0, "e": "i = 0, 3, 6, 9 thỏa i < 10; i = 12 thì dừng. Không có dấu cách nên in 0369."}, {"q": "Lệnh nào bỏ qua phần còn lại của vòng hiện tại và sang vòng kế tiếp?", "o": ["break", "continue", "return", "exit"], "a": 1, "e": "continue nhảy tới bước nhảy (với for) rồi kiểm tra điều kiện. break thì thoát hẳn vòng lặp."}, {"q": "Hai vòng for lồng nhau, ngoài chạy 4 lần, trong chạy 5 lần mỗi lần. Thân vòng trong chạy tổng cộng?", "o": ["9", "20", "5", "4"], "a": 1, "e": "Với mỗi lần của vòng ngoài, vòng trong chạy trọn 5 lần: 4 × 5 = 20."}]);

fillSnips();
