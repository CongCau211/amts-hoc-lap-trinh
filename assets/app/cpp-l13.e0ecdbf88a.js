lazyWidgets();
Object.assign(SNIP,{"l13group": "switch (kyTu) {\n    case 'a': case 'e': case 'i':\n    case 'o': case 'u':\n        cout << \"Nguyên âm\";\n        break;\n    default:\n        cout << \"Phụ âm\";\n}", "l13syntax": "switch (luaChon) {             // chỉ số nguyên hoặc char\n    case 1:                     // nhảy tới đây nếu luaChon == 1\n        cout << \"Xem điểm\";\n        break;                  // thoát khỏi switch\n    case 2:\n        cout << \"Đổi mật khẩu\";\n        break;\n    default:                    // không khớp case nào\n        cout << \"Lựa chọn không hợp lệ\";\n}"});PRESET_NOTES["l13"]={"Ví dụ: Menu với switch": "switch chọn nhánh theo giá trị của một biến, gọn hơn chuỗi else if khi so với nhiều hằng. Nhập 1, 2, 3 hoặc số khác để thấy default.", "Ví dụ: Gộp case (nguyên âm)": "Nhiều nhãn case liền nhau dùng chung một đoạn code. Đây là cách “rơi xuống” có chủ đích và an toàn.", "Ví dụ: Máy tính bỏ túi": "Máy tính bỏ túi: switch theo ký tự phép toán. Thử các phép + - * / và một ký tự lạ.", "Cảnh báo: quên break": "Cảnh báo: quên break thì chương trình chạy tiếp sang case bên dưới (fall-through). Nhập 3 để thấy cả “Ba” và “Bốn” được in.", "Lỗi: switch với số thực": "Lỗi biên dịch: switch chỉ nhận số nguyên hoặc ký tự, không nhận số thực. Với double phải dùng if … else if.", "Lỗi: case không phải hằng": "Lỗi biên dịch: nhãn case phải là hằng biết trước lúc biên dịch, không dùng biến.", "Lỗi: khai báo biến trong case": "Lỗi biên dịch: khai báo biến có khởi tạo ngay trong case bị “nhảy qua” khi vào case khác.", "Sửa: đặt case trong { }": "Cách sửa: bọc nội dung case trong { } để biến chỉ thuộc về case đó."};EX_HINTS["l13"]=[["switch (n) với case 1 … case 7 và default.", "Nhớ break sau mỗi case để không chạy sang case dưới."], ["Đọc: cin >> a >> phepToan >> b; với phepToan kiểu char.", "Trong case '/' và '%', kiểm tra b == 0 trước khi chia."], ["Gộp case 1, 3, 5, 7, 8, 10, 12 (31 ngày) và case 4, 6, 9, 11 (30 ngày).", "case 2: kiểm tra năm nhuận để in 29 hoặc 28; default in Khong hop le."]];
/* ===================== BÀI 13 · switch ===================== */
/* Bài 13 · switch
   Mã riêng của bài: ví dụ cho trình mô phỏng, công cụ minh họa, bài tập chấm tự động.
   Trắc nghiệm nằm ở quiz.json, đoạn code minh họa ở snippets/*.cpp. */
const P13=[
 {label:"Ví dụ: Menu với switch",input:"2",code:`#include <iostream>
using namespace std;

int main() {
    int luaChon;
    cout << "1. Xem điểm  2. Đổi mật khẩu  3. Thoát\\nChọn: ";
    cin >> luaChon;
    switch (luaChon) {
        case 1:
            cout << "Điểm của bạn: 8.5\\n";
            break;
        case 2:
            cout << "Mời nhập mật khẩu mới\\n";
            break;
        case 3:
            cout << "Tạm biệt!\\n";
            break;
        default:
            cout << "Lựa chọn không hợp lệ\\n";
    }
    return 0;
}`},
 {label:"Ví dụ: Gộp case (nguyên âm)",input:"e",code:`#include <iostream>
using namespace std;

int main() {
    char c;
    cin >> c;
    switch (c) {
        case 'a': case 'e': case 'i': case 'o': case 'u':
        case 'A': case 'E': case 'I': case 'O': case 'U':
            cout << c << " là nguyên âm\\n";
            break;
        default:
            cout << c << " là phụ âm\\n";
    }
    return 0;
}`},
 {label:"Ví dụ: Máy tính bỏ túi",input:"12 * 4",code:`#include <iostream>
using namespace std;

int main() {
    double a, b;
    char phepToan;
    cin >> a >> phepToan >> b;
    switch (phepToan) {
        case '+': cout << a + b; break;
        case '-': cout << a - b; break;
        case '*': cout << a * b; break;
        case '/':
            if (b == 0) cout << "Không chia được cho 0";
            else cout << a / b;
            break;
        default: cout << "Phép toán không hợp lệ";
    }
    cout << "\\n";
    return 0;
}`},
 {label:"Cảnh báo: quên break",input:"3",code:`#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    switch (n) {
        case 3:
            cout << "Ba ";
        case 4:
            cout << "Bốn ";
            break;
        default:
            cout << "Khác";
    }
    return 0;
}`},
 {label:"Lỗi: switch với số thực",code:`#include <iostream>
using namespace std;

int main() {
    double diem = 8.5;
    switch (diem) {
        case 8.5: cout << "Giỏi"; break;
    }
    return 0;
}`},
 {label:"Lỗi: case không phải hằng",code:`#include <iostream>
using namespace std;

int main() {
    int n = 2, k = 2;
    switch (n) {
        case k: cout << "bằng k"; break;
    }
    return 0;
}`},
 {label:"Lỗi: khai báo biến trong case",code:`#include <iostream>
using namespace std;

int main() {
    int loai = 1;
    switch (loai) {
        case 1:
            int giam = 10;
            cout << giam;
            break;
        case 2:
            cout << "Không giảm";
            break;
    }
    return 0;
}`},
 {label:"Sửa: đặt case trong { }",code:`#include <iostream>
using namespace std;

int main() {
    int loai = 1;
    switch (loai) {
        case 1: {
            int giam = 10;
            cout << "Giảm " << giam << "%\\n";
            break;
        }
        case 2:
            cout << "Không giảm\\n";
            break;
    }
    return 0;
}`}
];
const sim13=makeSim2(document.getElementById("sim-l13"),{id:"s13",presets:P13});
const SW=(brk)=>`#include <iostream>
using namespace std;

int main() {
    int n = {{N}};
    switch (n) {
        case 1:
            cout << "Một ";
            break;
        case 3:
            cout << "Ba ";${brk?"\n            break;":"\n            // quên break"}
        case 4:
            cout << "Bốn ";
            break;
        default:
            cout << "Khác ";
    }
    cout << "| hết";
}`;
makeLineRun(document.getElementById("run-l13"),{id:"lr13",label:"n =",values:[1,2,3,4,7],variants:[{label:"Đủ break",code:SW(true)},{label:"Quên break ở case 3",code:SW(false)}]});
makeEx2(document.getElementById("ex-l13"),sim13,[
 {t:"Thứ trong tuần",d:"Nhập n từ 1 đến 7. In “Thu hai” cho 1, “Thu ba” cho 2, … “Thu bay” cho 6, “Chu nhat” cho 7. Số khác in “Khong hop le”. Dùng switch.",
  tests:[{in:"1",out:"Thu hai"},{in:"5",out:"Thu sau"},{in:"7",out:"Chu nhat"},{in:"9",out:"Khong hop le"}],need:/switch/,needMsg:"Hãy dùng switch.",
  start:`#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;

    return 0;
}`},
 {t:"Máy tính số nguyên",d:"Nhập “a phép_toán b” với a, b nguyên và phép toán là + - * / %. In kết quả (chia nguyên). Chia hoặc chia dư cho 0 in “Loi: chia cho 0”. Phép toán khác in “Phep toan khong hop le”.",
  tests:[{in:"7 + 3",out:"10"},{in:"7 / 2",out:"3"},{in:"7 % 3",out:"1"},{in:"5 / 0",out:"Loi: chia cho 0"},{in:"4 ^ 2",out:"Phep toan khong hop le"}],need:/switch/,needMsg:"Hãy dùng switch theo phép toán.",
  start:`#include <iostream>
using namespace std;

int main() {
    int a, b;
    char op;
    cin >> a >> op >> b;

    return 0;
}`},
 {t:"Số ngày trong tháng",d:"Nhập tháng và năm. In số ngày của tháng đó (tháng 2 năm nhuận có 29 ngày). Tháng không hợp lệ in “Khong hop le”. Gợi ý: gộp các case cùng số ngày.",
  tests:[{in:"1 2026",out:"31"},{in:"4 2026",out:"30"},{in:"2 2024",out:"29"},{in:"2 1900",out:"28"},{in:"13 2026",out:"Khong hop le"}],need:/switch/,needMsg:"Hãy dùng switch theo tháng.",
  start:`#include <iostream>
using namespace std;

int main() {
    int thang, nam;
    cin >> thang >> nam;

    return 0;
}`}
]);

makeQuiz("quiz13","score13",[{"q": "Kiểu nào <b>không<\/b> dùng được trong <code>switch (…)<\/code>?", "o": ["int", "char", "double", "long long"], "a": 2, "e": "switch chỉ nhận số nguyên và ký tự. Với double, dùng if ... else if."}, {"q": "Thiếu <code>break<\/code> ở cuối một case thì?", "o": ["Lỗi biên dịch", "Chương trình chạy tiếp các lệnh của case bên dưới", "switch tự thoát", "Nhảy về default"], "a": 1, "e": "Đó là fall-through: chạy tiếp xuống cho tới khi gặp break hoặc hết switch."}, {"q": "Với <code>n = 7<\/code> và switch có <code>case 1<\/code>, <code>case 2<\/code>, <code>default<\/code>: nhánh nào chạy?", "o": ["case 1", "case 2", "default", "Không nhánh nào"], "a": 2, "e": "Không khớp case nào thì nhảy tới default."}, {"q": "Cách nào gộp case đúng?", "o": ["<code>case 1, 2, 3:<\/code>", "<code>case 1 || 2:<\/code>", "<code>case 1: case 2: case 3:<\/code>", "<code>case 1..3:<\/code>"], "a": 2, "e": "Đặt các nhãn case liền nhau. case 1 || 2 là biểu thức 1 || 2 = true = 1, tức chỉ khớp 1."}]);

fillSnips();
