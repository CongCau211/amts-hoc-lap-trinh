lazyWidgets();
Object.assign(SNIP,{"l12dangle2": "if (coVe) {\n    if (laHocSinh) {\n        cout << \"Giảm 50%\";\n    }\n} else {                        // giờ mới thuộc if (coVe)\n    cout << \"Mời mua vé\";\n}", "l12dangle": "if (coVe)\n    if (laHocSinh)\n        cout << \"Giảm 50%\";\nelse                            // thuộc if (laHocSinh)!\n    cout << \"Mời mua vé\";", "l12scope": "int a = 17, b = 5;\nif (b != 0) {\n    int thuong = a / b;         // thuong sinh ra ở đây\n    cout << thuong;\n}                               // thuong bị hủy ở đây\n// cout << thuong;         // lỗi: 'thuong' was not declared in this scope", "l12if": "int tuoi;\ncin >> tuoi;\n\nif (tuoi >= 18) {                       // điều kiện đúng thì chạy khối này\n    cout << \"Đủ tuổi lái xe máy\\n\";\n} else {                                // ngược lại chạy khối này\n    cout << \"Chưa đủ tuổi\\n\";\n}\ncout << \"Kết thúc\\n\";              // luôn chạy"});PRESET_NOTES["l12"]={"Ví dụ: if … else": "if … else chọn một trong hai nhánh theo điều kiện. Chạy từng bước với tuổi khác nhau để thấy chỉ một nhánh được thực hiện.", "Ví dụ: Chuỗi else if xếp loại": "Chuỗi else if kiểm tra lần lượt từ trên xuống, gặp điều kiện đúng đầu tiên thì dừng. Thứ tự điều kiện quyết định kết quả xếp loại.", "Ví dụ: Phạm vi biến": "Biến khai báo trong khối { } chỉ tồn tại trong khối đó. Theo dõi bảng bộ nhớ: thuong và du biến mất khi ra khỏi khối.", "Ví dụ: if lồng nhau": "if lồng nhau để kiểm tra năm nhuận theo nhiều điều kiện. Thử 2024, 1900, 2000 và theo dõi nhánh được chọn.", "Cảnh báo: if (x = 5)": "Cảnh báo: if (x = 5) là phép GÁN chứ không phải so sánh, nên luôn đúng và làm đổi x. So sánh phải dùng ==.", "Cảnh báo: dấu ; sau if": "Cảnh báo: dấu ; ngay sau if tạo một lệnh rỗng, khối { } phía sau luôn chạy. Quan sát dòng thanh toán vẫn in dù không đủ tiền.", "Bẫy: thiếu { } với nhiều lệnh": "Bẫy: không có { }, if chỉ điều khiển MỘT lệnh ngay sau nó. Lệnh soMonTruot++ luôn chạy dù điều kiện sai.", "Cảnh báo: else lơ lửng": "Cảnh báo: else gắn với if gần nhất, không theo cách thụt lề. Dùng { } để thể hiện đúng ý.", "Lỗi: dùng biến ngoài phạm vi": "Lỗi biên dịch: b khai báo trong khối if nên không dùng được bên ngoài. Muốn dùng sau if thì khai báo trước if."};EX_HINTS["l12"]=[["Ba trường hợp: n > 0, n < 0, còn lại bằng 0.", "Dùng if … else if … else."], ["Kiểm tra điểm không hợp lệ (< 0 hoặc > 10) trước tiên.", "Sau đó xét từ cao xuống thấp: >= 8.5, >= 7.0, >= 5.0, còn lại."], ["Xét a == 0 trước, trong đó phân biệt b == 0 hay không.", "a khác 0 thì x = -b / a, in với fixed << setprecision(2)."]];
/* ===================== BÀI 12 · if / else ===================== */
/* Bài 12 · if / else
   Mã riêng của bài: ví dụ cho trình mô phỏng, công cụ minh họa, bài tập chấm tự động.
   Trắc nghiệm nằm ở quiz.json, đoạn code minh họa ở snippets/*.cpp. */
/* ================= WIDGET + DỮ LIỆU BÀI 12–14 ================= */
/* Lưu đồ xếp loại sáng theo đường chạy */
function makeFlowIf(el){
  const CODE=`double diem;
cin >> diem;
if (diem >= 8.5) {
    cout << "Giỏi";
} else if (diem >= 7.0) {
    cout << "Khá";
} else if (diem >= 5.0) {
    cout << "Trung bình";
} else {
    cout << "Yếu";
}`;
  el.innerHTML=`<label class="lab-f fl-slider"><span>diem =</span><input type="range" id="fi-d" min="0" max="10" step="0.1" value="7.6" aria-label="Điểm"><output id="fi-o">7.6</output></label>
    <div class="fi-body"><div class="fi-svg" id="fi-svg"></div><div><div class="code fi-code" id="fi-code"></div><div class="fi-log" id="fi-log" aria-live="polite"></div></div></div>`;
  const N={start:[280,26,"Bắt đầu","oval"],inp:[280,84,"Nhập diem","io"],d1:[280,166,"diem >= 8.5 ?","dia"],r1:[478,166,"Giỏi","box"],d2:[280,262,"diem >= 7.0 ?","dia"],r2:[478,262,"Khá","box"],d3:[280,358,"diem >= 5.0 ?","dia"],r3:[478,358,"Trung bình","box"],r4:[280,446,"Yếu","box"],end:[280,516,"Kết thúc","oval"]};
  const E=[["start","inp","",[[280,40],[280,68]]],["inp","d1","",[[280,100],[280,128]]],["d1","r1","đúng",[[350,166],[420,166]]],["d1","d2","sai",[[280,204],[280,224]]],["d2","r2","đúng",[[350,262],[420,262]]],["d2","d3","sai",[[280,300],[280,320]]],["d3","r3","đúng",[[350,358],[420,358]]],["d3","r4","sai",[[280,396],[280,428]]],
    ["r1","end","",[[536,166],[548,166],[548,516],[322,516]]],["r2","end","",[[536,262],[548,262],[548,516],[322,516]]],["r3","end","",[[536,358],[548,358],[548,516],[322,516]]],["r4","end","",[[280,464],[280,500]]]];
  function shape(k,[x,y,t,s],on){const c=on?"on":"";
    if(s==="dia")return `<g class="fn ${c}"><polygon points="${x},${y-38} ${x+70},${y} ${x},${y+38} ${x-70},${y}"/><text x="${x}" y="${y+4}" class="mono">${esc(t)}</text></g>`;
    if(s==="oval")return `<g class="fn ${c}"><rect x="${x-56}" y="${y-15}" width="112" height="30" rx="15"/><text x="${x}" y="${y+5}">${esc(t)}</text></g>`;
    if(s==="io")return `<g class="fn ${c}"><polygon points="${x-58},${y+16} ${x-44},${y-16} ${x+66},${y-16} ${x+52},${y+16}"/><text x="${x+4}" y="${y+5}">${esc(t)}</text></g>`;
    return `<g class="fn ${c} res"><rect x="${x-58}" y="${y-18}" width="116" height="36" rx="8"/><text x="${x}" y="${y+5}">${esc(t)}</text></g>`}
  function render(){
    const d=+el.querySelector("#fi-d").value;el.querySelector("#fi-o").textContent=d.toFixed(1);
    const c1=d>=8.5,c2=d>=7.0,c3=d>=5.0;
    const path=["start","inp","d1"];const lines=[1,2,3];const log=[`diem >= 8.5 → ${c1?"đúng":"sai"}`];
    if(c1){path.push("r1");lines.push(4)}else{path.push("d2");lines.push(5);log.push(`diem >= 7.0 → ${c2?"đúng":"sai"}`);
      if(c2){path.push("r2");lines.push(6)}else{path.push("d3");lines.push(7);log.push(`diem >= 5.0 → ${c3?"đúng":"sai"}`);
        if(c3){path.push("r3");lines.push(8)}else{path.push("r4");lines.push(10)}}}
    path.push("end");const res=c1?"Giỏi":c2?"Khá":c3?"Trung bình":"Yếu";
    const onE=(a,b)=>path.includes(a)&&path.includes(b)&&path.indexOf(b)===path.indexOf(a)+1;
    const edges=E.map(([a,b,lab,pts])=>{const on=onE(a,b);const dd=pts.map((p,i)=>(i?"L":"M")+p[0]+" "+p[1]).join(" ");
      const lp=pts[0];return `<path d="${dd}" class="fe ${on?"on":""}" marker-end="url(#fa-${on?"on":"off"})"/>${lab?`<text x="${lab==="đúng"?lp[0]+10:lp[0]+8}" y="${lab==="đúng"?lp[1]-7:lp[1]+14}" class="fl-lab ${lab==="đúng"?"t":"f"}">${lab}</text>`:""}`}).join("");
    el.querySelector("#fi-svg").innerHTML=`<svg viewBox="0 0 580 540" role="img" aria-label="Lưu đồ xếp loại theo điểm">
      <defs><marker id="fa-on" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="var(--accent)"/></marker><marker id="fa-off" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="var(--line)"/></marker></defs>
      ${edges}${Object.entries(N).map(([k,v])=>shape(k,v,path.includes(k))).join("")}</svg>`;
    el.querySelector("#fi-code").innerHTML=highlightLines(CODE).map((s,i)=>`<span class="ln${lines.includes(i+1)?" hl":" dim"}" data-n="${i+1}">${s||" "}</span>`).join("");
    el.querySelector("#fi-log").innerHTML=`<b>Các điều kiện đã kiểm tra:</b> ${log.map(x=>`<code>${esc(x)}</code>`).join(" ")}${log.length<3&&!(!c3)?` <span>· dừng ở điều kiện đúng đầu tiên, các nhánh sau bị bỏ qua.</span>`:""}<div class="fi-out">Console: <b>${esc(res)}</b></div>`;
  }
  el.addEventListener("input",render);render();
}

const P12=[
 {label:"Ví dụ: if … else",input:"16",code:`#include <iostream>
using namespace std;

int main() {
    int tuoi;
    cout << "Tuổi: ";
    cin >> tuoi;
    if (tuoi >= 18) {
        cout << "Đủ tuổi lái xe máy\\n";
    } else {
        cout << "Chưa đủ tuổi, còn " << 18 - tuoi << " năm\\n";
    }
    cout << "Kết thúc\\n";
    return 0;
}`},
 {label:"Ví dụ: Chuỗi else if xếp loại",input:"7.6",code:`#include <iostream>
using namespace std;

int main() {
    double diem;
    cin >> diem;
    if (diem < 0 || diem > 10) {
        cout << "Điểm không hợp lệ\\n";
    } else if (diem >= 8.5) {
        cout << "Giỏi\\n";
    } else if (diem >= 7.0) {
        cout << "Khá\\n";
    } else if (diem >= 5.0) {
        cout << "Trung bình\\n";
    } else {
        cout << "Yếu\\n";
    }
    return 0;
}`},
 {label:"Ví dụ: Phạm vi biến",code:`#include <iostream>
using namespace std;

int main() {
    int a = 17, b = 5;
    if (b != 0) {
        int thuong = a / b;
        int du = a % b;
        cout << thuong << " dư " << du << "\\n";
    }
    cout << "Ra khỏi khối\\n";
    return 0;
}`},
 {label:"Ví dụ: if lồng nhau",input:"2024",code:`#include <iostream>
using namespace std;

int main() {
    int nam;
    cin >> nam;
    if (nam % 4 == 0) {
        if (nam % 100 == 0) {
            if (nam % 400 == 0) {
                cout << "Nhuận\\n";
            } else {
                cout << "Không nhuận\\n";
            }
        } else {
            cout << "Nhuận\\n";
        }
    } else {
        cout << "Không nhuận\\n";
    }
    return 0;
}`},
 {label:"Cảnh báo: if (x = 5)",code:`#include <iostream>
using namespace std;

int main() {
    int x = 3;
    if (x = 5) {
        cout << "x bằng 5? x giờ là " << x << "\\n";
    }
    return 0;
}`},
 {label:"Cảnh báo: dấu ; sau if",code:`#include <iostream>
using namespace std;

int main() {
    int soDu = 50000, gia = 80000;
    if (soDu >= gia);
    {
        cout << "Thanh toán thành công!\\n";   // luôn in
    }
    return 0;
}`},
 {label:"Bẫy: thiếu { } với nhiều lệnh",code:`#include <iostream>
using namespace std;

int main() {
    int diem = 4, soMonTruot = 0;
    if (diem < 5)
        cout << "Trượt môn\\n";
    soMonTruot++;              // không thuộc if!
    diem = 9;
    if (diem < 5)
        cout << "Trượt môn\\n";
    soMonTruot++;              // vẫn chạy
    cout << "Số môn trượt: " << soMonTruot << "\\n";   // 2?!
    return 0;
}`},
 {label:"Cảnh báo: else lơ lửng",code:`#include <iostream>
using namespace std;

int main() {
    bool coVe = false, laHocSinh = false;
    if (coVe)
        if (laHocSinh)
            cout << "Giảm 50%\\n";
    else
        cout << "Mời mua vé\\n";   // không in!
    return 0;
}`},
 {label:"Lỗi: dùng biến ngoài phạm vi",code:`#include <iostream>
using namespace std;

int main() {
    int a = 10;
    if (a > 5) {
        int b = a * 2;
    }
    cout << b << "\\n";
    return 0;
}`}
];
const sim12=makeSim2(document.getElementById("sim-l12"),{id:"s12",presets:P12});
makeFlowIf(document.getElementById("flow-l12"));

makeEx2(document.getElementById("ex-l12"),sim12,[
 {t:"Dương, âm hay không",d:"Nhập một số nguyên. In “duong” nếu lớn hơn 0, “am” nếu nhỏ hơn 0, “khong” nếu bằng 0.",
  tests:[{in:"5",out:"duong"},{in:"-12",out:"am"},{in:"0",out:"khong"}],need:/\bif\b/,needMsg:"Hãy dùng câu lệnh if.",
  start:`#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;

    return 0;
}`},
 {t:"Xếp loại học lực",d:"Nhập điểm (số thực). Điểm ngoài 0–10 in “Khong hop le”. Từ 8.5 in “Gioi”, từ 7.0 in “Kha”, từ 5.0 in “Trung binh”, còn lại “Yeu”.",
  tests:[{in:"9.2",out:"Gioi"},{in:"8.5",out:"Gioi"},{in:"7",out:"Kha"},{in:"5.5",out:"Trung binh"},{in:"3",out:"Yeu"},{in:"11",out:"Khong hop le"},{in:"-1",out:"Khong hop le"}],
  start:`#include <iostream>
using namespace std;

int main() {
    double diem;
    cin >> diem;

    return 0;
}`},
 {t:"Phương trình ax + b = 0",d:"Nhập a và b (số thực). a = 0 và b = 0: in “Vo so nghiem”. a = 0, b ≠ 0: in “Vo nghiem”. Ngược lại in “x = ” và nghiệm với 2 chữ số sau dấu phẩy.",
  tests:[{in:"2 -4",out:"x = 2.00"},{in:"0 0",out:"Vo so nghiem"},{in:"0 5",out:"Vo nghiem"},{in:"3 1",out:"x = -0.33"}],
  start:`#include <iostream>
#include <iomanip>
using namespace std;

int main() {
    double a, b;
    cin >> a >> b;

    return 0;
}`}
]);

makeQuiz("quiz12","score12",[{"q": "Với <code>int x = 3;<\/code>, đoạn <code>if (x = 5) cout &lt;&lt; x;<\/code> in ra?", "o": ["Không in gì", "3", "5", "Lỗi biên dịch"], "a": 2, "e": "x = 5 là phép gán: x thành 5, giá trị biểu thức là 5 (khác 0 nên đúng), rồi in x = 5. g++ cảnh báo -Wparentheses."}, {"q": "Với điểm 9.0, đoạn sau in gì? <code>if (d &gt;= 5) cout &lt;&lt; \"TB\"; else if (d &gt;= 8.5) cout &lt;&lt; \"Giỏi\";<\/code>", "o": ["Giỏi", "TB", "TBGiỏi", "Không in gì"], "a": 1, "e": "Điều kiện đầu tiên d >= 5 đã đúng nên chỉ in TB; các else if phía dưới bị bỏ qua. Phải xếp điều kiện chặt nhất lên trước."}, {"q": "Biến khai báo bên trong khối <code>{ }<\/code> của if tồn tại tới đâu?", "o": ["Hết hàm main", "Hết khối { } đó", "Hết chương trình", "Mãi mãi"], "a": 1, "e": "Phạm vi của biến kết thúc ở dấu } đóng khối chứa nó."}, {"q": "Trong <code>if (a) if (b) x(); else y();<\/code>, else thuộc về?", "o": ["if (a)", "if (b)", "Cả hai", "Lỗi cú pháp"], "a": 1, "e": "else luôn gắn với if gần nhất chưa có else, tức if (b). Dùng { } để thể hiện ý khác."}]);

fillSnips();
