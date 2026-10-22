lazyWidgets();
Object.assign(SNIP,{"l6bad": "double tong = gia * soLuong;\ntong = tong + tong * 0.08;\ntong = tong + 15000;\n// 0.08 là gì? 15000 là gì?\n// Đổi thuế phải sửa khắp nơi", "l6good": "constexpr double THUE_VAT = 0.08;\nconstexpr int PHI_GIAO_HANG = 15000;\n\ndouble tong = gia * soLuong;\ntong = tong + tong * THUE_VAT;\ntong = tong + PHI_GIAO_HANG;", "l6const": "const int SO_MON = 5;              // khởi tạo ngay\nconst double DIEM_DAT = 5.0;\n\nint namSinh;\ncin >> namSinh;\nconst int TUOI = 2026 - namSinh;    // được: giá trị có lúc chạy\n\nSO_MON = 6;                         // lỗi: hằng không đổi được\nconst int MAX;                      // lỗi: hằng chưa khởi tạo", "l6define": "#define PI 3.14159          // không có kiểu, không có dấu ;\n#define BINH_PHUONG(x) x * x\n\nint a = BINH_PHUONG(2 + 1);  // mong 9, nhưng được 2 + 1 * 2 + 1 = 5\n\nconstexpr double PI_MOI = 3.14159;   // cách hiện đại: có kiểu, an toàn"});PRESET_NOTES["l6"]={"Ví dụ: Tính hóa đơn với hằng": "Hằng số (constexpr) đặt tên cho các giá trị cố định như thuế, phí giao hàng. Đổi mức thuế chỉ cần sửa một chỗ, code dễ đọc hơn.", "Ví dụ: const nhận giá trị lúc chạy": "const có thể nhận giá trị lúc chương trình chạy (từ dữ liệu nhập), sau đó không đổi được nữa. Theo dõi TUOI được tính từ năm sinh bạn nhập.", "Ví dụ: constexpr tính từ constexpr": "constexpr được tính ngay lúc biên dịch và có thể xây từ các constexpr khác. Xem số giây mỗi ngày được ghép từ các hằng nhỏ.", "Lỗi: const không khởi tạo": "Lỗi biên dịch: hằng const phải được khởi tạo ngay khi khai báo, vì sau đó không gán được nữa.", "Lỗi: gán lại hằng": "Lỗi biên dịch: không được tăng, giảm hay gán lại một hằng. Trình biên dịch chặn ngay, giúp tránh sửa nhầm.", "Lỗi: constexpr từ dữ liệu nhập": "Lỗi biên dịch: constexpr cần giá trị biết trước lúc biên dịch, nên không lấy từ dữ liệu nhập. Trường hợp này dùng const.", "Lỗi: cin vào hằng": "Lỗi biên dịch: cin không đọc được vào hằng, vì đọc vào nghĩa là thay đổi giá trị."};EX_HINTS["l6"]=[["Khai báo: constexpr double PI = 3.14159; rồi tính PI * r * r.", "In \"Dien tich: \" với fixed << setprecision(2)."], ["Khai báo thêm constexpr int PHI_GIAO_HANG = 15000;", "Tổng = giá × số lượng, cộng tổng × THUE_VAT, cộng phí giao hàng; in với setprecision(0)."], ["Ba hằng: 60 giây/phút, 60 phút/giờ, 24 giờ/ngày.", "Kết quả = số ngày × 24 × 60 × 60."]];
/* ===================== BÀI 6 · Hằng số const / constexpr ===================== */
/* Bài 6 · Hằng số const / constexpr
   Mã riêng của bài: ví dụ cho trình mô phỏng, công cụ minh họa, bài tập chấm tự động.
   Trắc nghiệm nằm ở quiz.json, đoạn code minh họa ở snippets/*.cpp. */
const P6=[
 {label:"Ví dụ: Tính hóa đơn với hằng",input:"45000 3",code:`#include <iostream>
using namespace std;

int main() {
    constexpr double THUE_VAT = 0.08;
    constexpr int PHI_GIAO_HANG = 15000;

    int gia, soLuong;
    cin >> gia >> soLuong;
    double tong = gia * soLuong;
    tong = tong + tong * THUE_VAT + PHI_GIAO_HANG;
    cout << "Tổng thanh toán: " << tong << " đồng\\n";
    return 0;
}`},
 {label:"Ví dụ: const nhận giá trị lúc chạy",input:"2008",code:`#include <iostream>
using namespace std;

int main() {
    constexpr int NAM_HIEN_TAI = 2026;
    int namSinh;
    cout << "Năm sinh: ";
    cin >> namSinh;
    const int TUOI = NAM_HIEN_TAI - namSinh;   // const, không phải constexpr
    cout << "Bạn " << TUOI << " tuổi\\n";
    return 0;
}`},
 {label:"Ví dụ: constexpr tính từ constexpr",code:`#include <iostream>
using namespace std;

int main() {
    constexpr int GIAY_MOI_PHUT = 60;
    constexpr int PHUT_MOI_GIO = 60;
    constexpr int GIO_MOI_NGAY = 24;
    constexpr int GIAY_MOI_NGAY = GIAY_MOI_PHUT * PHUT_MOI_GIO * GIO_MOI_NGAY;
    cout << "Một ngày có " << GIAY_MOI_NGAY << " giây\\n";
    cout << "Một tuần có " << GIAY_MOI_NGAY * 7 << " giây\\n";
    return 0;
}`},
 {label:"Lỗi: const không khởi tạo",code:`#include <iostream>
using namespace std;

int main() {
    const double PI;
    return 0;
}`},
 {label:"Lỗi: gán lại hằng",code:`#include <iostream>
using namespace std;

int main() {
    constexpr int SO_MON = 5;
    SO_MON++;
    return 0;
}`},
 {label:"Lỗi: constexpr từ dữ liệu nhập",code:`#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    constexpr int GAP_DOI = n * 2;
    return 0;
}`},
 {label:"Lỗi: cin vào hằng",code:`#include <iostream>
using namespace std;

int main() {
    const int SO_HOC_VIEN = 30;
    cin >> SO_HOC_VIEN;
    return 0;
}`}
];
const sim6=makeSim2(document.getElementById("sim-l6"),{id:"s6",presets:P6});

makeCompileGuess(document.getElementById("cg-l6"),[
 {code:"const int MAX = 100;\ncout << MAX;"},
 {code:"const int MAX;\ncout << MAX;"},
 {code:"const double PI = 3.14;\nPI = 3.1416;"},
 {code:"int n;\ncin >> n;\nconst int N = n;",why:"const chấp nhận giá trị chỉ biết lúc chạy."},
 {code:"int n;\ncin >> n;\nconstexpr int N = n;"},
 {code:"constexpr int GIO = 24;\nconstexpr int PHUT = GIO * 60;",why:"GIO là constexpr nên GIO * 60 tính được lúc biên dịch."},
 {code:"const int SO_LOP = 5;\ncin >> SO_LOP;"},
 {code:"constexpr double G = 9.8;\ndouble v = G * 2;\nv = v + 1;",why:"v là biến thường, chỉ đọc giá trị từ hằng G nên đổi thoải mái."}
]);

makeEx2(document.getElementById("ex-l6"),sim6,[
 {t:"Diện tích hình tròn",d:"Khai báo hằng constexpr PI = 3.14159. Nhập bán kính r (số thực), in “Dien tich: X” với 2 chữ số sau dấu phẩy.",
  tests:[{in:"1",out:"Dien tich: 3.14"},{in:"2.5",out:"Dien tich: 19.63"},{in:"10",out:"Dien tich: 314.16"}],need:/(constexpr|const)\s+double\s+PI\s*[={(]/,needMsg:"Hãy khai báo hằng: constexpr double PI = 3.14159;",
  start:`#include <iostream>
#include <iomanip>
using namespace std;

int main() {
    // Khai báo hằng PI ở đây

    double r;
    cin >> r;

    return 0;
}`},
 {t:"Hóa đơn có VAT",d:"Dùng hằng THUE_VAT = 0.08 và PHI_GIAO_HANG = 15000. Nhập giá và số lượng (số nguyên). In “Tong: X” là giá × số lượng, cộng thuế, cộng phí giao hàng, làm tròn tới đồng (fixed, 0 chữ số thập phân).",
  tests:[{in:"100000 2",out:"Tong: 231000"},{in:"45000 3",out:"Tong: 160800"},{in:"1 1",out:"Tong: 15001"}],need:/(constexpr|const)\s+\w+\s+THUE_VAT/,needMsg:"Hãy dùng hằng THUE_VAT thay cho số 0.08.",
  start:`#include <iostream>
#include <iomanip>
using namespace std;

int main() {
    constexpr double THUE_VAT = 0.08;
    // Thêm hằng PHI_GIAO_HANG

    int gia, soLuong;
    cin >> gia >> soLuong;

    return 0;
}`},
 {t:"Ngày sang giây",d:"Khai báo các hằng constexpr cho số giây/phút, phút/giờ, giờ/ngày. Nhập số ngày (số nguyên), in tổng số giây.",
  tests:[{in:"1",out:"86400"},{in:"7",out:"604800"},{in:"30",out:"2592000"}],need:/constexpr/,needMsg:"Hãy khai báo các hằng bằng constexpr.",
  start:`#include <iostream>
using namespace std;

int main() {
    // Khai báo 3 hằng constexpr

    int soNgay;
    cin >> soNgay;

    return 0;
}`}
]);

makeQuiz("quiz6","score6",[{"q": "Khai báo nào báo lỗi?", "o": ["<code>const int A = 5;<\/code>", "<code>const int B;<\/code>", "<code>constexpr int C = 10;<\/code>", "<code>const double D = 2.5 * 2;<\/code>"], "a": 1, "e": "Hằng phải được khởi tạo ngay lúc khai báo vì sau đó không thể gán."}, {"q": "Sau <code>int n; cin &gt;&gt; n;<\/code>, dòng nào hợp lệ?", "o": ["<code>constexpr int M = n;<\/code>", "<code>const int M = n;<\/code>", "Cả hai", "Không dòng nào"], "a": 1, "e": "Giá trị của n chỉ có lúc chạy. const chấp nhận điều đó, constexpr thì không."}, {"q": "Lợi ích chính của <code>THUE_VAT<\/code> so với gõ <code>0.08<\/code> ở nhiều chỗ?", "o": ["Chương trình chạy nhanh hơn rõ rệt", "Code rõ nghĩa, sửa một chỗ, và trình biên dịch chặn gán nhầm", "Tiết kiệm bộ nhớ", "Bắt buộc theo chuẩn C++"], "a": 1, "e": "Tốc độ gần như không đổi. Lợi ích nằm ở khả năng đọc, bảo trì và an toàn."}, {"q": "<code>constexpr<\/code> khác <code>const<\/code> ở điểm nào?", "o": ["constexpr đổi được giá trị", "Giá trị của constexpr phải biết ngay lúc biên dịch", "constexpr chỉ dùng cho số nguyên", "Không khác gì"], "a": 1, "e": "constexpr đảm bảo giá trị là hằng lúc biên dịch; const chỉ đảm bảo không đổi sau khi khởi tạo."}]);

fillSnips();
