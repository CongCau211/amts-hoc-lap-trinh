lazyWidgets();
Object.assign(SNIP,{"l16void": "void veDuongKe(int doDai) {\n    if (doDai <= 0) return;           // thoát sớm, không vẽ gì\n    for (int i = 0; i < doDai; i++)\n        cout << '-';\n    cout << '\\n';\n}                                     // hết thân hàm: tự quay về\n\nint main() {\n    veDuongKe(10);                    // gọi như một câu lệnh\n}", "l16proto": "#include <iostream>\nusing namespace std;\n\nint tinhTong(int a, int b);           // nguyên mẫu: báo trước hàm có tồn tại\n\nint main() {\n    cout << tinhTong(2, 3);      // dùng được dù thân hàm ở dưới\n}\n\nint tinhTong(int a, int b) {          // định nghĩa: thân hàm thật\n    return a + b;\n}"});PRESET_NOTES["l16"]={"Ví dụ: Hàm bình phương": "Hàm là đoạn code có tên, nhận dữ liệu vào và trả kết quả ra. Chạy từng bước để thấy khi gọi hàm, một khung mới được đẩy lên ngăn xếp.", "Ví dụ: Hàm void vẽ đường kẻ": "Hàm void làm việc nhưng không trả giá trị. Gọi một lần, dùng lại được với độ dài khác nhau.", "Ví dụ: Hàm bool kiểm tra số nguyên tố": "Hàm trả về bool dùng để kiểm tra điều kiện. return thoát hàm ngay khi đã có câu trả lời.", "Ví dụ: Hàm gọi hàm": "Một hàm có thể gọi hàm khác. Theo dõi ngăn xếp có hai khung chồng lên nhau khi theTichTru gọi dienTichTron.", "Ví dụ: Nguyên mẫu, hàm đặt sau main": "Nguyên mẫu (khai báo trước) cho phép đặt phần thân hàm sau main.", "Lỗi: gọi hàm trước khi khai báo": "Lỗi biên dịch: gọi hàm trước khi trình biên dịch biết tới nó. Thêm nguyên mẫu ở đầu hoặc chuyển hàm lên trên main.", "Lỗi: quên return ở một nhánh": "Lỗi: một nhánh của hàm không có return nên giá trị trả về là rác. Trình biên dịch cảnh báo; nhập số âm để thấy.", "Lỗi: chỉ có nguyên mẫu": "Lỗi liên kết: chỉ có nguyên mẫu mà không có phần thân thì không tạo được chương trình chạy.", "Lỗi: lấy giá trị của hàm void": "Lỗi biên dịch: hàm void không trả giá trị, nên không gán kết quả của nó vào biến."};EX_HINTS["l16"]=[["Trong hàm: giả sử m = a, rồi so với b và c.", "main nhập ba số và in lonNhat(a, b, c)."], ["Khởi tạo long long r = 1; lặp n lần, mỗi lần r *= a.", "n = 0 thì vòng không chạy, trả về 1 là đúng."], ["Hai vòng lồng nhau: cao dòng, mỗi dòng rong ký tự.", "Hết mỗi dòng in \"\\n\"; hàm void nên không cần return giá trị."]];
/* ===================== BÀI 16 · Định nghĩa và gọi hàm ===================== */
/* Bài 16 · Định nghĩa và gọi hàm
   Mã riêng của bài: ví dụ cho trình mô phỏng, công cụ minh họa, bài tập chấm tự động.
   Trắc nghiệm nằm ở quiz.json, đoạn code minh họa ở snippets/*.cpp. */
/* Cấu tạo hàm (Bài 16) */
(function(){const el=document.getElementById("anat-l16");if(!el)return;
  const SAY={ret:"<b>Kiểu trả về</b>: kiểu của giá trị hàm gửi lại cho nơi gọi. Hàm không trả về gì thì ghi <code>void</code>.",
    name:"<b>Tên hàm</b>: đặt theo quy tắc như tên biến, nên là động từ mô tả việc hàm làm: <code>tinhTrungBinh</code>, <code>inBangDiem</code>.",
    par:"<b>Danh sách tham số</b>: các biến nhận dữ liệu đầu vào, mỗi tham số ghi kiểu riêng, cách nhau dấu phẩy. Có thể để trống: <code>()</code>.",
    body:"<b>Thân hàm</b>: các câu lệnh trong cặp <code>{ }</code>, chạy mỗi khi hàm được gọi. Biến khai báo trong thân là biến cục bộ của hàm.",
    rs:"<b>return</b>: kết thúc hàm ngay lập tức và gửi giá trị về nơi gọi. Giá trị được chuyển sang kiểu trả về nếu cần.",
    call:"<b>Lời gọi hàm</b>: tên hàm kèm cặp ngoặc. Khi chạy xong, cả lời gọi được thay bằng giá trị trả về, ở đây là 8.25.",
    arg:"<b>Đối số</b>: giá trị thật truyền vào. Đối số thứ nhất chép vào tham số thứ nhất (a = 7.5), thứ hai vào tham số thứ hai (b = 9)."};
  el.querySelectorAll("[data-p].chip-btn").forEach(b=>b.onclick=()=>{const p=b.dataset.p;const on=el.dataset.on===p?"":p;el.dataset.on=on;
    el.querySelectorAll(".chip-btn").forEach(x=>x.classList.toggle("sel",x.dataset.p===on));
    el.querySelectorAll(".ap").forEach(x=>x.classList.toggle("on",x.dataset.p===on));
    el.querySelector(".a16-say").innerHTML=on?SAY[on]:"Chọn một phần ở trên."})})();

/* ---------- Bài 16 ---------- */
makeCallStack(document.getElementById("cs-l16"),{variants:[
 {label:"Gọi một hàm",code:`#include <iostream>
using namespace std;

double tinhTrungBinh(double a, double b) {
    double tong = a + b;
    return tong / 2;
}
int main() {
    double tb = tinhTrungBinh(7.5, 9);
    cout << "TB = " << tb << "\\n";
    return 0;
}`},
 {label:"Hàm gọi hàm",code:`#include <iostream>
using namespace std;

double dienTichTron(double r) {
    return 3.14 * r * r;
}
double theTichTru(double r, double h) {
    double day = dienTichTron(r);
    return day * h;
}
int main() {
    double v = theTichTru(2, 10);
    cout << "V = " << v << "\\n";
    return 0;
}`},
 {label:"Gọi nhiều lần",code:`#include <iostream>
using namespace std;

int binhPhuong(int x) {
    return x * x;
}
int main() {
    int tong = 0;
    for (int i = 1; i <= 3; i++) {
        tong += binhPhuong(i);
    }
    cout << tong << "\\n";
    return 0;
}`}
]});
const P16=[
 {label:"Ví dụ: Hàm bình phương",input:"7",code:`#include <iostream>
using namespace std;

int binhPhuong(int x) {
    return x * x;
}

int main() {
    int n;
    cin >> n;
    cout << n << "^2 = " << binhPhuong(n) << "\\n";
    cout << "(n+1)^2 = " << binhPhuong(n + 1) << "\\n";
    return 0;
}`},
 {label:"Ví dụ: Hàm void vẽ đường kẻ",input:"12",code:`#include <iostream>
using namespace std;

void veDuongKe(int doDai) {
    for (int i = 0; i < doDai; i++) {
        cout << '=';
    }
    cout << '\\n';
}

int main() {
    int n;
    cin >> n;
    veDuongKe(n);
    cout << "  BẢNG ĐIỂM\\n";
    veDuongKe(n);
    return 0;
}`},
 {label:"Ví dụ: Hàm bool kiểm tra số nguyên tố",input:"30",code:`#include <iostream>
using namespace std;

bool laNguyenTo(int n) {
    if (n < 2) return false;
    for (int d = 2; d * d <= n; d++) {
        if (n % d == 0) return false;   // return thoát hàm ngay
    }
    return true;
}

int main() {
    int n;
    cin >> n;
    for (int i = 1; i <= n; i++) {
        if (laNguyenTo(i)) cout << i << " ";
    }
    cout << "\\n";
    return 0;
}`},
 {label:"Ví dụ: Hàm gọi hàm",input:"2 10",code:`#include <iostream>
using namespace std;

double dienTichTron(double r) {
    return 3.14159 * r * r;
}

double theTichTru(double r, double h) {
    return dienTichTron(r) * h;
}

int main() {
    double r, h;
    cin >> r >> h;
    cout << "Thể tích trụ: " << theTichTru(r, h) << "\\n";
    return 0;
}`},
 {label:"Ví dụ: Nguyên mẫu, hàm đặt sau main",input:"3 4",code:`#include <iostream>
using namespace std;

int tinhTong(int a, int b);     // nguyên mẫu

int main() {
    int x, y;
    cin >> x >> y;
    cout << "Tổng = " << tinhTong(x, y) << "\\n";
    return 0;
}

int tinhTong(int a, int b) {
    return a + b;
}`},
 {label:"Lỗi: gọi hàm trước khi khai báo",input:"3 4",code:`#include <iostream>
using namespace std;

int main() {
    int x, y;
    cin >> x >> y;
    cout << tinhTong(x, y) << "\\n";
    return 0;
}

int tinhTong(int a, int b) {
    return a + b;
}`},
 {label:"Lỗi: quên return ở một nhánh",input:"-5",code:`#include <iostream>
using namespace std;

int giaTriTuyetDoi(int x) {
    if (x >= 0) {
        return x;
    }
    // quên: return -x;
}

int main() {
    int n;
    cin >> n;
    cout << giaTriTuyetDoi(n) << "\\n";
    return 0;
}`},
 {label:"Lỗi: chỉ có nguyên mẫu",code:`#include <iostream>
using namespace std;

int tinhTong(int a, int b);

int main() {
    cout << tinhTong(2, 3) << "\\n";
    return 0;
}`},
 {label:"Lỗi: lấy giá trị của hàm void",code:`#include <iostream>
using namespace std;

void inLoiChao() {
    cout << "Xin chào\\n";
}

int main() {
    int x = inLoiChao();
    return 0;
}`}
];
const sim16=makeSim2(document.getElementById("sim-l16"),{id:"s16",presets:P16});
makeEx2(document.getElementById("ex-l16"),sim16,[
 {t:"Lớn nhất của ba số",d:"Viết hàm int lonNhat(int a, int b, int c) trả về số lớn nhất trong ba số. Trong main, nhập ba số nguyên và in kết quả của hàm.",
  tests:[{in:"3 9 5",out:"9"},{in:"-1 -7 -3",out:"-1"},{in:"4 4 2",out:"4"},{in:"1 2 30",out:"30"}],
  need:/int\s+lonNhat\s*\(\s*int\s+\w+\s*,\s*int\s+\w+\s*,\s*int\s+\w+\s*\)\s*\{/,needMsg:"Hãy viết hàm int lonNhat(int a, int b, int c) và gọi nó trong main.",
  start:`#include <iostream>
using namespace std;

// viết hàm lonNhat ở đây

int main() {
    int a, b, c;
    cin >> a >> b >> c;

    return 0;
}`},
 {t:"Lũy thừa không dùng pow",d:"Viết hàm long long luyThua(int a, int n) tính a mũ n (n ≥ 0) bằng vòng lặp, không dùng pow. Nhập a và n, in kết quả.",
  tests:[{in:"2 10",out:"1024"},{in:"3 0",out:"1"},{in:"-2 3",out:"-8"},{in:"10 15",out:"1000000000000000"}],
  need:/^(?![\s\S]*\bpow\s*\()[\s\S]*long\s+long\s+luyThua\s*\(\s*int\s+\w+\s*,\s*int\s+\w+\s*\)\s*\{/,needMsg:"Hãy viết hàm long long luyThua(int a, int n) và không dùng pow.",
  start:`#include <iostream>
using namespace std;

// viết hàm luyThua ở đây

int main() {
    int a, n;
    cin >> a >> n;

    return 0;
}`},
 {t:"Vẽ hình chữ nhật",d:"Viết hàm void veHinh(int rong, int cao, char c) vẽ hình chữ nhật gồm cao dòng, mỗi dòng có rong ký tự c. Nhập rong, cao và ký tự c rồi gọi hàm.",
  tests:[{in:"4 2 #",out:"####\n####"},{in:"1 3 *",out:"*\n*\n*"},{in:"6 1 =",out:"======"}],
  need:/void\s+veHinh\s*\(\s*int\s+\w+\s*,\s*int\s+\w+\s*,\s*char\s+\w+\s*\)\s*\{/,needMsg:"Hãy viết hàm void veHinh(int rong, int cao, char c).",
  start:`#include <iostream>
using namespace std;

// viết hàm veHinh ở đây

int main() {
    int rong, cao;
    char c;
    cin >> rong >> cao >> c;

    return 0;
}`}
]);

makeQuiz("quiz16","score16",[{"q": "Trong <code>int f(int a, int b)<\/code>, chữ <code>int<\/code> đầu tiên cho biết?", "o": ["Kiểu của tham số a", "Kiểu giá trị hàm trả về", "Hàm chỉ chạy một lần", "Số lượng tham số"], "a": 1, "e": "Chữ đứng trước tên hàm là kiểu trả về."}, {"q": "Lệnh nào sau đây <b>sai<\/b> với <code>void inChao()<\/code>?", "o": ["<code>inChao();<\/code>", "<code>int x = inChao();<\/code>", "Gọi <code>inChao()<\/code> hai lần", "Gọi trong một vòng lặp"], "a": 1, "e": "Hàm void không trả về giá trị nên không gán được: void value not ignored as it ought to be."}, {"q": "Khi hàm A gọi hàm B, khung của B được đặt ở đâu trên stack?", "o": ["Dưới khung của A", "Trên đỉnh, phía trên khung của A", "Thay thế khung của A", "Không tạo khung"], "a": 1, "e": "Khung mới luôn đặt lên đỉnh. A tạm dừng, chờ B trả về rồi chạy tiếp."}, {"q": "main gọi hàm <code>tinhTong<\/code> được định nghĩa bên dưới main, không có nguyên mẫu. Kết quả?", "o": ["Chạy bình thường", "Lỗi 'tinhTong' was not declared in this scope", "Cảnh báo nhưng vẫn chạy", "Lỗi khi chạy"], "a": 1, "e": "Trình biên dịch đọc từ trên xuống. Thêm nguyên mẫu phía trên main hoặc chuyển hàm lên trên."}]);

fillSnips();
