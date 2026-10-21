lazyWidgets();
Object.assign(SNIP,{"l17swap": "void doiCho(int& a, int& b) {   // a, b là tên khác của x, y\n    int tam = a;\n    a = b;\n    b = tam;\n}\n\nint main() {\n    int x = 3, y = 8;\n    doiCho(x, y);\n    cout << x << \" \" << y;    // 8 3\n}", "l17multi": "void chia(int a, int b, int& thuong, int& du) {\n    thuong = a / b;\n    du = a % b;\n}\n\nint main() {\n    int q, r;                      // hai “hộp đựng” kết quả\n    chia(17, 5, q, r);\n    cout << q << \" dư \" << r; // 3 dư 2\n}"});PRESET_NOTES["l17"]={"Ví dụ: Tham trị không đổi biến gốc": "Truyền tham trị: hàm nhận BẢN SAO của biến. Theo dõi hai khung trên ngăn xếp: x tăng nhưng a trong main không đổi.", "Ví dụ: Tham chiếu đổi được biến gốc": "Truyền tham chiếu (int&): tham số là tên khác của chính biến gốc, nên sửa x là sửa a. So sánh với ví dụ tham trị.", "Ví dụ: Đổi chỗ hai số": "Đổi chỗ hai số qua hàm cần tham chiếu, để thay đổi giữ lại sau khi hàm kết thúc.", "Ví dụ: Trả hai kết quả (thương và dư)": "Tham chiếu giúp hàm “trả về” nhiều kết quả cùng lúc: thương và số dư được ghi thẳng vào q và r.", "Ví dụ: const string& in thẻ tên": "const string& truyền chuỗi mà không sao chép và không cho hàm sửa. Cách truyền chuỗi nên dùng.", "Ví dụ: Nhập dữ liệu qua tham chiếu": "Hàm nhận tham chiếu để ghi dữ liệu nhập thẳng vào biến của main. Thử nhập điểm sai để thấy vòng hỏi lại.", "Lỗi: truyền số vào int&": "Lỗi biên dịch: tham chiếu int& cần một biến thật, không truyền một số hằng như 5.", "Lỗi: sửa tham số const&": "Lỗi biên dịch: tham số const& không được sửa trong hàm.", "Lỗi: quên & trong hàm đổi chỗ": "Lỗi logic: quên & nên hàm chỉ đổi chỗ trên bản sao; x, y trong main vẫn như cũ."};EX_HINTS["l17"]=[["Tham số phải có &: void doiCho(int& a, int& b).", "Bên trong dùng biến tạm như hoán đổi thông thường."], ["thuong và du là tham chiếu: gán thẳng thuong = a / b; du = a % b;", "Trong main khai báo hai biến q, r rồi truyền vào hàm."], ["gio = tong / 3600, phut = tong % 3600 / 60, giay = tong % 60.", "Ba tham số cuối là int& để hàm ghi kết quả ra ngoài."]];
/* ===================== BÀI 17 · Truyền tham trị / tham chiếu ===================== */
/* Bài 17 · Truyền tham trị / tham chiếu
   Mã riêng của bài: ví dụ cho trình mô phỏng, công cụ minh họa, bài tập chấm tự động.
   Trắc nghiệm nằm ở quiz.json, đoạn code minh họa ở snippets/*.cpp. */
/* ---------- Bài 17 ---------- */
makeCallStack(document.getElementById("cs-l17"),{variants:[
 {label:"Tham trị",code:`#include <iostream>
using namespace std;

void tangMot(int x) {
    x = x + 1;
    cout << "trong hàm: " << x << "\\n";
}
int main() {
    int a = 5;
    tangMot(a);
    cout << "sau khi gọi: " << a << "\\n";
}`},
 {label:"Tham chiếu",code:`#include <iostream>
using namespace std;

void tangMot(int& x) {
    x = x + 1;
    cout << "trong hàm: " << x << "\\n";
}
int main() {
    int a = 5;
    tangMot(a);
    cout << "sau khi gọi: " << a << "\\n";
}`},
 {label:"Đổi chỗ hai số",code:`#include <iostream>
using namespace std;

void doiCho(int& a, int& b) {
    int tam = a;
    a = b;
    b = tam;
}
int main() {
    int x = 3, y = 8;
    doiCho(x, y);
    cout << x << " " << y << "\\n";
}`}
]});
const P17=[
 {label:"Ví dụ: Tham trị không đổi biến gốc",input:"5",code:`#include <iostream>
using namespace std;

void tangMot(int x) {
    x++;
    cout << "Trong hàm x = " << x << "\\n";
}

int main() {
    int a;
    cin >> a;
    tangMot(a);
    cout << "Trong main a = " << a << "\\n";
    return 0;
}`},
 {label:"Ví dụ: Tham chiếu đổi được biến gốc",input:"5",code:`#include <iostream>
using namespace std;

void tangMot(int& x) {
    x++;
    cout << "Trong hàm x = " << x << "\\n";
}

int main() {
    int a;
    cin >> a;
    tangMot(a);
    cout << "Trong main a = " << a << "\\n";
    return 0;
}`},
 {label:"Ví dụ: Đổi chỗ hai số",input:"3 8",code:`#include <iostream>
using namespace std;

void doiCho(int& a, int& b) {
    int tam = a;
    a = b;
    b = tam;
}

int main() {
    int x, y;
    cin >> x >> y;
    doiCho(x, y);
    cout << x << " " << y << "\\n";
    return 0;
}`},
 {label:"Ví dụ: Trả hai kết quả (thương và dư)",input:"17 5",code:`#include <iostream>
using namespace std;

void chia(int a, int b, int& thuong, int& du) {
    thuong = a / b;
    du = a % b;
}

int main() {
    int a, b;
    cin >> a >> b;
    int q, r;
    chia(a, b, q, r);
    cout << a << " = " << b << " x " << q << " + " << r << "\\n";
    return 0;
}`},
 {label:"Ví dụ: const string& in thẻ tên",input:"Nguyen Van An\nC++ K12",code:`#include <iostream>
#include <string>
using namespace std;

void inThe(const string& hoTen, const string& lop) {
    cout << "+--------------------+\\n";
    cout << "| " << hoTen << "\\n";
    cout << "| Lớp: " << lop << "\\n";
    cout << "+--------------------+\\n";
}

int main() {
    string ten, lop;
    getline(cin, ten);
    getline(cin, lop);
    inThe(ten, lop);              // không chép chuỗi, hàm không sửa được
    inThe("Khach moi", "Tham quan");
    return 0;
}`},
 {label:"Ví dụ: Nhập dữ liệu qua tham chiếu",input:"12\n-1\n8",code:`#include <iostream>
using namespace std;

void nhapDiem(int& d) {
    do {
        cout << "Điểm (0-10): ";
        cin >> d;
    } while (d < 0 || d > 10);
}

int main() {
    int diem;
    nhapDiem(diem);
    cout << "Đã nhận điểm " << diem << "\\n";
    return 0;
}`},
 {label:"Lỗi: truyền số vào int&",code:`#include <iostream>
using namespace std;

void tangMot(int& x) {
    x++;
}

int main() {
    tangMot(5);
    return 0;
}`},
 {label:"Lỗi: sửa tham số const&",code:`#include <iostream>
#include <string>
using namespace std;

void chao(const string& ten) {
    ten = "Bạn " + ten;
    cout << ten;
}

int main() {
    chao("An");
    return 0;
}`},
 {label:"Lỗi: quên & trong hàm đổi chỗ",input:"3 8",code:`#include <iostream>
using namespace std;

void doiCho(int a, int b) {
    int tam = a;
    a = b;
    b = tam;
}

int main() {
    int x, y;
    cin >> x >> y;
    doiCho(x, y);
    cout << x << " " << y << "\\n";   // vẫn là 3 8
    return 0;
}`}
];
const sim17=makeSim2(document.getElementById("sim-l17"),{id:"s17",presets:P17});
makeEx2(document.getElementById("ex-l17"),sim17,[
 {t:"Đổi chỗ hai số",d:"Viết hàm void doiCho(int& a, int& b). Trong main, nhập hai số nguyên x, y, gọi doiCho(x, y) rồi in x và y cách nhau một dấu cách.",
  tests:[{in:"3 8",out:"8 3"},{in:"-1 4",out:"4 -1"},{in:"7 7",out:"7 7"}],
  need:/void\s+doiCho\s*\(\s*int\s*&\s*\w+\s*,\s*int\s*&\s*\w+\s*\)\s*\{[\s\S]*doiCho\s*\(\s*\w+\s*,\s*\w+\s*\)/,needMsg:"Hãy viết hàm void doiCho(int& a, int& b) và gọi doiCho(x, y) trong main.",
  start:`#include <iostream>
using namespace std;

// viết hàm doiCho ở đây

int main() {
    int x, y;
    cin >> x >> y;

    cout << x << " " << y;
    return 0;
}`},
 {t:"Thương và số dư",d:"Viết hàm void chia(int a, int b, int& thuong, int& du) tính phép chia nguyên a / b và số dư a % b. Nhập a, b (b khác 0), in thương và dư cách nhau một dấu cách.",
  tests:[{in:"17 5",out:"3 2"},{in:"20 4",out:"5 0"},{in:"-7 2",out:"-3 -1"},{in:"3 10",out:"0 3"}],
  need:/void\s+chia\s*\(\s*int\s+\w+\s*,\s*int\s+\w+\s*,\s*int\s*&\s*\w+\s*,\s*int\s*&\s*\w+\s*\)/,needMsg:"Hãy viết hàm void chia(int a, int b, int& thuong, int& du).",
  start:`#include <iostream>
using namespace std;

// viết hàm chia ở đây

int main() {
    int a, b;
    cin >> a >> b;

    return 0;
}`},
 {t:"Đổi giây ra giờ, phút, giây",d:"Viết hàm void doiGiay(int tong, int& gio, int& phut, int& giay). Nhập tổng số giây, in giờ, phút, giây cách nhau một dấu cách.",
  tests:[{in:"3725",out:"1 2 5"},{in:"59",out:"0 0 59"},{in:"86399",out:"23 59 59"},{in:"7200",out:"2 0 0"}],
  need:/void\s+doiGiay\s*\(\s*int\s+\w+\s*,\s*int\s*&\s*\w+\s*,\s*int\s*&\s*\w+\s*,\s*int\s*&\s*\w+\s*\)/,needMsg:"Hãy viết hàm void doiGiay(int tong, int& gio, int& phut, int& giay).",
  start:`#include <iostream>
using namespace std;

// viết hàm doiGiay ở đây

int main() {
    int tong;
    cin >> tong;

    return 0;
}`}
]);

makeQuiz("quiz17","score17",[{"q": "<code>void f(int x) { x = 10; }<\/code>, sau <code>int a = 1; f(a);<\/code> thì a bằng?", "o": ["1", "10", "11", "Lỗi biên dịch"], "a": 0, "e": "Tham trị: x là bản sao, sửa x không ảnh hưởng a."}, {"q": "<code>void f(int&amp; x) { x = 10; }<\/code>, sau <code>int a = 1; f(a);<\/code> thì a bằng?", "o": ["1", "10", "0", "Lỗi biên dịch"], "a": 1, "e": "Tham chiếu: x là tên khác của a, gán x = 10 chính là gán a = 10."}, {"q": "Với <code>void f(int&amp; x)<\/code>, lời gọi nào báo lỗi?", "o": ["<code>f(a);<\/code>", "<code>f(b);<\/code>", "<code>f(a + 1);<\/code>", "Không lời gọi nào"], "a": 2, "e": "a + 1 là giá trị tạm, không có ô nhớ để tham chiếu gắn vào: cannot bind non-const lvalue reference."}, {"q": "Truyền một <code>string<\/code> dài vào hàm chỉ để đọc, cách nào tốt nhất?", "o": ["<code>string s<\/code>", "<code>string&amp; s<\/code>", "<code>const string&amp; s<\/code>", "Biến toàn cục"], "a": 2, "e": "const & không sao chép và đảm bảo hàm không sửa chuỗi gốc; vẫn nhận được chuỗi hằng như \"abc\"."}]);

fillSnips();
