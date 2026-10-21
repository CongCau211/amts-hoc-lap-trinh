lazyWidgets();
Object.assign(SNIP,{});PRESET_NOTES["l7"]={"Ví dụ: Đổi kiểu ngầm trong biểu thức": "Khi biểu thức trộn nhiều kiểu, C++ tự đổi về kiểu “rộng” hơn (int → double, char → int). Đọc từng dòng in ra để biết kết quả thuộc kiểu nào.", "Ví dụ: Cắt bỏ và làm tròn": "Ép sang int là cắt bỏ phần thập phân (không làm tròn), kể cả với số âm. Muốn làm tròn đúng thì dùng round.", "Lỗi logic: tràn ở phép tính trung gian": "Lỗi logic: a * a tính bằng int nên đã tràn TRƯỚC khi gán vào long long. Phải đổi một vế sang long long trước khi nhân.", "Cảnh báo: tràn số với hằng": "Cảnh báo: phép tính giữa hai hằng int vượt giới hạn bị trình biên dịch phát hiện ngay. Kết quả in ra là số đã tràn.", "Ví dụ: Giới hạn các kiểu": "numeric_limits cho biết giá trị nhỏ nhất và lớn nhất của từng kiểu. Dùng để chọn kiểu phù hợp với dữ liệu.", "Bẫy: trộn unsigned và int": "Bẫy: cộng unsigned với int âm thì int bị đổi sang unsigned, cho số khổng lồ thay vì −10. Ép kiểu rõ ràng để được kết quả đúng.", "Ví dụ: char và int qua lại": "char và int đổi qua lại theo mã ký tự. Lưu ý c + 1 in ra số vì kết quả phép cộng là int.", "Bẫy: double quá lớn ép sang int": "Bẫy: ép một số double vượt khoảng của int là hành vi không xác định. Chọn kiểu đủ lớn (long long) trước khi ép.", "Lỗi: thu hẹp kiểu với { }": "Lỗi biên dịch: { } không cho đưa 300 vào char (chỉ chứa tới 127), vì sẽ mất dữ liệu."};EX_HINTS["l7"]=[["static_cast<int>(x) bỏ phần thập phân (không làm tròn).", "round(x) trong <cmath> làm tròn tới số nguyên gần nhất."], ["a * b với hai int có thể tràn trước khi gán vào long long.", "Đổi một vế trước: static_cast<long long>(a) * b."], ["dung * 100 / tong là chia nguyên; dùng 100.0 để có phần thập phân.", "In với fixed << setprecision(1) rồi thêm ký tự %."]];
/* ===================== BÀI 7 · Ép kiểu và tràn số ===================== */
/* Bài 7 · Ép kiểu và tràn số
   Mã riêng của bài: ví dụ cho trình mô phỏng, công cụ minh họa, bài tập chấm tự động.
   Trắc nghiệm nằm ở quiz.json, đoạn code minh họa ở snippets/*.cpp. */
/* Bậc thang chuyển kiểu */
function makeLadder(el){
  const TY=[["bool","bool"],["char","char"],["short","short"],["int","int"],["unsigned","unsigned int"],["long long","long long"],["float","float"],["double","double"]];
  const RUNG=[["double","double"],["float","float"],["long long","long long"],["unsigned","unsigned int"],["int","int"]];
  el.innerHTML=`<div class="ld-top"><code class="v0">a</code><select id="ld-a" class="v0" aria-label="Kiểu của a">${TY.map(t=>`<option value="${t[0]}">${t[1]}</option>`).join("")}</select>
    <code>+</code><select id="ld-b" class="v1" aria-label="Kiểu của b">${TY.map(t=>`<option value="${t[0]}">${t[1]}</option>`).join("")}</select><code class="v1">b</code></div>
    <div class="ld-body"><ol class="ld-rungs" id="ld-rungs"></ol><div class="ld-steps" id="ld-steps"></div></div>`;
  const A=el.querySelector("#ld-a"),B=el.querySelector("#ld-b");A.value="int";B.value="double";
  function upd(){const a=A.value,b=B.value;const small=t=>["bool","char","short"].includes(t);
    const pa=small(a)?"int":a,pb=small(b)?"int":b,res=promo(a,b);
    el.querySelector("#ld-rungs").innerHTML=RUNG.map(([k,n])=>`<li class="${k===res?"res":""}"><span class="nm">${n}</span><span class="who">${pa===k?'<i class="v0">a</i>':""}${pb===k?'<i class="v1">b</i>':""}</span></li>`).join("")+
      `<li class="small"><span class="nm">bool · char · short</span><span class="who">${small(a)?'<i class="v0">a</i>':""}${small(b)?'<i class="v1">b</i>':""}</span><span class="up">↑ nâng lên int</span></li>`;
    const st=[];
    if(small(a)||small(b))st.push(`<b>Bước 1 · Nâng kiểu nhỏ:</b> ${[small(a)?`a (${a})`:"",small(b)?`b (${b})`:""].filter(Boolean).join(" và ")} được đổi thành <code>int</code> trước khi tính.`);
    if(pa!==pb)st.push(`<b>${st.length?"Bước 2":"Bước 1"} · Kiểu thấp đi lên kiểu cao:</b> <code>${tn(pa)}</code> và <code>${tn(pb)}</code> khác nhau nên ${["double","float"].includes(res)?"bên số nguyên được đổi sang số thực":"bên thấp hơn được đổi lên"} <code>${tn(res)}</code>.`);
    else st.push(`<b>${st.length?"Bước 2":"Bước 1"} ·</b> Hai bên đã cùng kiểu <code>${tn(pa)}</code>, tính luôn.`);
    st.push(`<b>Kết quả:</b> <code>a + b</code> có kiểu <code class="res-t">${tn(res)}</code>.`);
    if(res==="unsigned"&&(pa==="int"||pb==="int"))st.push(`<span class="warn-t">Bẫy: số âm kiểu int bị đổi sang unsigned. Ví dụ −1 thành 4 294 967 295, nên <code>-1 &lt; 1u</code> lại là false.</span>`);
    if(res==="float"&&(pa==="long long"||pb==="long long"||pa==="int"||pb==="int"))st.push(`<span class="warn-t">float chỉ có khoảng 7 chữ số chính xác: số nguyên lớn đổi sang float có thể bị làm tròn.</span>`);
    el.querySelector("#ld-steps").innerHTML=st.map(s=>`<p>${s}</p>`).join("")}
  A.onchange=upd;B.onchange=upd;upd();
}

/* Cắt bỏ và làm tròn */
function makeRounder(el){
  const ex=["7.6","7.5","7.4","-7.5","-2.4","2.999","3e10"];
  el.innerHTML=`<label class="stdin-row"><span>double x =</span><input id="rd-x" value="7.5" inputmode="decimal" autocomplete="off" style="max-width:160px"></label>
   <div class="chips">${ex.map(x=>`<button class="chip-btn" data-x="${x}">${x}</button>`).join("")}</div>
   <div class="tbl"><table><thead><tr><th>Cách viết</th><th>Kết quả</th><th>Quy tắc</th></tr></thead><tbody id="rd-body"></tbody></table></div>`;
  const inp=el.querySelector("#rd-x");
  function upd(){const x=Number(inp.value.replace(",","."));const body=el.querySelector("#rd-body");
    if(!isFinite(x)||inp.value.trim()===""){body.innerHTML=`<tr><td colspan="3">Nhập một số thực, ví dụ 7.5</td></tr>`;return}
    const f=v=>gfmt(v,10);const inR=x>=-2147483648&&x<=2147483647;
    const rows=[
      ["static_cast<int>(x)",inR?String(Math.trunc(x)):"không xác định","Cắt bỏ phần thập phân (về phía 0)."+(inR?"":" x vượt phạm vi int: hành vi không xác định, máy x86 thường cho −2147483648.")],
      ["trunc(x)",f(Math.trunc(x)),"Giống cắt bỏ nhưng kết quả vẫn là double."],
      ["round(x)",f(Math.sign(x)*Math.round(Math.abs(x))),"Làm tròn tới số nguyên gần nhất; .5 làm tròn ra xa số 0."],
      ["floor(x)",f(Math.floor(x)),"Làm tròn xuống (về phía âm vô cùng)."],
      ["ceil(x)",f(Math.ceil(x)),"Làm tròn lên (về phía dương vô cùng)."]];
    body.innerHTML=rows.map(r=>`<tr><td><code>${esc(r[0])}</code></td><td class="num">${esc(r[1])}</td><td>${esc(r[2])}</td></tr>`).join("")}
  inp.addEventListener("input",upd);el.querySelectorAll("[data-x]").forEach(b=>b.onclick=()=>{inp.value=b.dataset.x;upd()});upd();
}
const P7=[
 {label:"Ví dụ: Đổi kiểu ngầm trong biểu thức",code:`#include <iostream>
using namespace std;

int main() {
    int i = 5;
    double d = 2.5;
    char c = 'A';
    bool b = true;
    cout << "i + d = " << i + d << "\\n";   // double
    cout << "c + i = " << c + i << "\\n";   // int
    cout << "b + c = " << b + c << "\\n";   // int
    cout << "i / 2 = " << i / 2 << "\\n";   // int
    cout << "i / 2.0 = " << i / 2.0 << "\\n";
    int x = 9.99;                                // cắt còn 9
    cout << "x = " << x << "\\n";
    return 0;
}`},
 {label:"Ví dụ: Cắt bỏ và làm tròn",code:`#include <iostream>
#include <cmath>
using namespace std;

int main() {
    double a = 7.6, b = -7.6;
    cout << static_cast<int>(a) << " " << static_cast<int>(b) << "\\n";
    cout << round(a) << " " << round(b) << "\\n";
    cout << floor(a) << " " << floor(b) << "\\n";
    cout << ceil(a) << " " << ceil(b) << "\\n";
    double tien = 12.3456;
    cout << round(tien * 100) / 100 << "\\n";   // 2 chữ số
    return 0;
}`},
 {label:"Lỗi logic: tràn ở phép tính trung gian",code:`#include <iostream>
using namespace std;

int main() {
    int a = 50000;
    long long sai = a * a;
    long long dung = static_cast<long long>(a) * a;
    cout << "sai  = " << sai << "\\n";
    cout << "dung = " << dung << "\\n";
    return 0;
}`},
 {label:"Cảnh báo: tràn số với hằng",code:`#include <iostream>
using namespace std;

int main() {
    int x = 2147483647 + 1;
    cout << x << "\\n";
    return 0;
}`},
 {label:"Ví dụ: Giới hạn các kiểu",code:`#include <iostream>
#include <limits>
using namespace std;

int main() {
    cout << "int:       " << numeric_limits<int>::min()
              << " .. " << numeric_limits<int>::max() << "\\n";
    cout << "unsigned:  " << numeric_limits<unsigned int>::min()
              << " .. " << numeric_limits<unsigned int>::max() << "\\n";
    cout << "long long: " << numeric_limits<long long>::min()
              << " .. " << numeric_limits<long long>::max() << "\\n";
    cout << "double:    " << numeric_limits<double>::lowest()
              << " .. " << numeric_limits<double>::max() << "\\n";
    return 0;
}`},
 {label:"Bẫy: trộn unsigned và int",code:`#include <iostream>
using namespace std;

int main() {
    unsigned int soLuong = 10;
    int thayDoi = -20;
    cout << soLuong + thayDoi << "\\n";   // không phải -10!
    cout << static_cast<int>(soLuong) + thayDoi << "\\n";
    return 0;
}`},
 {label:"Ví dụ: char và int qua lại",code:`#include <iostream>
using namespace std;

int main() {
    int ma = 97;
    char c = ma;                            // 'a'
    char sau = static_cast<char>(ma + 1);   // 'b'
    cout << c << sau << "\\n";
    cout << c + 1 << "\\n";            // 98: in số vì đã thành int
    cout << static_cast<char>(c + 1) << "\\n";
    return 0;
}`},
 {label:"Bẫy: double quá lớn ép sang int",code:`#include <iostream>
using namespace std;

int main() {
    double danSo = 8.1e9;
    int sai = static_cast<int>(danSo);              // không xác định
    long long dung = static_cast<long long>(danSo);
    cout << sai << "\\n" << dung << "\\n";
    return 0;
}`},
 {label:"Lỗi: thu hẹp kiểu với { }",code:`#include <iostream>
using namespace std;

int main() {
    char c{300};
    return 0;
}`}
];
const sim7=makeSim2(document.getElementById("sim-l7"),{id:"s7",presets:P7});
makeLadder(document.getElementById("ladder-l7"));
makeRounder(document.getElementById("round-l7"));
makeEx2(document.getElementById("ex-l7"),sim7,[
 {t:"Cắt bỏ và làm tròn",d:"Nhập một số thực x. Dòng 1 in “Cat: ” và x đã cắt phần thập phân (số nguyên). Dòng 2 in “Tron: ” và x làm tròn tới số nguyên gần nhất.",
  tests:[{in:"7.6",out:"Cat: 7\nTron: 8"},{in:"7.4",out:"Cat: 7\nTron: 7"},{in:"-2.5",out:"Cat: -2\nTron: -3"}],
  start:`#include <iostream>
#include <cmath>
using namespace std;

int main() {
    double x;
    cin >> x;

    return 0;
}`},
 {t:"Tích hai số lớn",d:"Nhập hai số nguyên a, b (kiểu int, mỗi số có thể tới 2 tỷ). In tích chính xác của chúng.",
  tests:[{in:"50000 50000",out:"2500000000"},{in:"2000000000 3",out:"6000000000"},{in:"-123456 654321",out:"-80779853376"}],
  start:`#include <iostream>
using namespace std;

int main() {
    int a, b;
    cin >> a >> b;
    // Cẩn thận tràn số ở phép nhân

    return 0;
}`},
 {t:"Tỉ lệ đúng",d:"Nhập số câu đúng và tổng số câu (số nguyên). In “Dat X%” với X có 1 chữ số sau dấu phẩy.",
  tests:[{in:"2 3",out:"Dat 66.7%"},{in:"45 50",out:"Dat 90.0%"},{in:"1 7",out:"Dat 14.3%"}],
  start:`#include <iostream>
#include <iomanip>
using namespace std;

int main() {
    int dung, tong;
    cin >> dung >> tong;

    return 0;
}`}
]);

makeQuiz("quiz7","score7",[{"q": "<code>int<\/code> cộng <code>double<\/code> cho kết quả kiểu gì?", "o": ["int", "double", "float", "Tùy giá trị"], "a": 1, "e": "Bên thấp (int) được đổi lên kiểu cao hơn (double) trước khi cộng."}, {"q": "<code>static_cast&lt;int&gt;(-3.7)<\/code> bằng?", "o": ["-4", "-3", "3", "-3.7"], "a": 1, "e": "Ép sang int cắt bỏ phần thập phân, tức là làm tròn về phía 0."}, {"q": "<code>int a = 50000; long long r = a * a;<\/code> vì sao r sai?", "o": ["long long quá nhỏ", "Phép nhân tính bằng int và đã tràn trước khi gán", "Phải dùng double", "Thiếu #include &lt;climits&gt;"], "a": 1, "e": "Kiểu của phép nhân phụ thuộc vào toán hạng (int), không phụ thuộc biến nhận kết quả."}, {"q": "<code>unsigned int u = 1; int i = -2;<\/code> thì <code>u + i<\/code> bằng?", "o": ["-1", "1", "4294967295", "Lỗi biên dịch"], "a": 2, "e": "i bị đổi sang unsigned (thành 4294967294), cộng 1 được 4294967295."}]);

fillSnips();
