lazyWidgets();
Object.assign(SNIP,{});PRESET_NOTES["l8"]={"Ví dụ: Năm phép toán với int": "Năm phép toán số học với số nguyên. Chú ý / cho thương nguyên và % cho số dư; thử đổi dữ liệu nhập để xem kết quả thay đổi.", "Ví dụ: Cùng phép toán với double": "Cùng các phép toán nhưng với double: phép chia cho kết quả thập phân. So với ví dụ trước để thấy kiểu dữ liệu quyết định kết quả.", "Ví dụ: Thứ tự ưu tiên": "Nhân, chia, chia dư được tính trước cộng, trừ; cùng mức thì tính từ trái sang phải. Dấu ngoặc thay đổi thứ tự.", "Ví dụ: Chia và chia dư với số âm": "Với số âm, phép / làm tròn về phía 0 và dấu của % theo số bị chia. Đối chiếu từng dòng để nắm quy tắc.", "Ví dụ: Tách chữ số bằng / và %": "Dùng / 10 và % 10 để tách từng chữ số của một số. Kỹ thuật này dùng rất nhiều trong bài tập về chữ số.", "Bẫy: ^ không phải lũy thừa": "Bẫy: ^ trong C++ là phép XOR bit, không phải lũy thừa. Lũy thừa dùng pow trong <cmath>.", "Bẫy: tính phần trăm": "Bẫy: 7 / 9 * 100 cho 0 vì phép chia nguyên chạy trước. Nhân 100 trước hoặc dùng 100.0 để được phần trăm đúng.", "Ví dụ: Gán kết hợp": "Toán tử gán kết hợp (+=, -=, *=, /=, %=) viết gọn phép “tính rồi gán lại”. Theo dõi biến tien thay đổi qua từng dòng.", "Lỗi khi chạy: chia cho 0": "Lỗi khi chạy: chia số nguyên cho 0 làm chương trình dừng đột ngột. Trình biên dịch không phát hiện được vì b chỉ biết lúc chạy."};EX_HINTS["l8"]=[["Chữ số hàng trăm = n / 100, hàng chục = n / 10 % 10, đơn vị = n % 10.", "Cộng ba chữ số rồi in."], ["Cộng giờ hiện tại với số giờ thêm.", "Lấy phần dư khi chia cho 24: (gio + them) % 24."], ["Với mỗi mệnh giá: số tờ = tiền / mệnh giá.", "Sau đó tiền %= mệnh giá để xét mệnh giá nhỏ hơn."]];
/* ===================== BÀI 8 · Toán tử số học ===================== */
/* Bài 8 · Toán tử số học
   Mã riêng của bài: ví dụ cho trình mô phỏng, công cụ minh họa, bài tập chấm tự động.
   Trắc nghiệm nằm ở quiz.json, đoạn code minh họa ở snippets/*.cpp. */
const P8=[
 {label:"Ví dụ: Năm phép toán với int",input:"17 5",code:`#include <iostream>
using namespace std;

int main() {
    int a, b;
    cin >> a >> b;
    cout << a << " + " << b << " = " << a + b << "\\n";
    cout << a << " - " << b << " = " << a - b << "\\n";
    cout << a << " * " << b << " = " << a * b << "\\n";
    cout << a << " / " << b << " = " << a / b << "\\n";
    cout << a << " % " << b << " = " << a % b << "\\n";
    return 0;
}`},
 {label:"Ví dụ: Cùng phép toán với double",input:"17 5",code:`#include <iostream>
using namespace std;

int main() {
    double a, b;
    cin >> a >> b;
    cout << a + b << " " << a - b << " " << a * b << " " << a / b << "\\n";
    return 0;
}`},
 {label:"Ví dụ: Thứ tự ưu tiên",code:`#include <iostream>
using namespace std;

int main() {
    cout << 2 + 3 * 4 << "\\n";        // 14
    cout << (2 + 3) * 4 << "\\n";      // 20
    cout << 20 - 6 - 4 << "\\n";       // 10: trái sang phải
    cout << 100 / 10 / 5 << "\\n";     // 2
    cout << 2 * 3 % 4 << "\\n";        // (2*3) % 4 = 2
    return 0;
}`},
 {label:"Ví dụ: Chia và chia dư với số âm",code:`#include <iostream>
using namespace std;

int main() {
    cout << 7 / 3 << " " << 7 % 3 << "\\n";
    cout << -7 / 3 << " " << -7 % 3 << "\\n";
    cout << 7 / -3 << " " << 7 % -3 << "\\n";
    cout << -7 / -3 << " " << -7 % -3 << "\\n";
    return 0;
}`},
 {label:"Ví dụ: Tách chữ số bằng / và %",input:"472",code:`#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    int donVi = n % 10;
    int chuc = n / 10 % 10;
    int tram = n / 100;
    cout << "Trăm: " << tram << ", chục: " << chuc
              << ", đơn vị: " << donVi << "\\n";
    cout << "Số lẻ? " << n % 2 << "\\n";
    return 0;
}`},
 {label:"Bẫy: ^ không phải lũy thừa",code:`#include <iostream>
#include <cmath>
using namespace std;

int main() {
    cout << (2 ^ 3) << "\\n";          // XOR bit: 010 ^ 011 = 001
    cout << pow(2, 3) << "\\n";   // lũy thừa thật
    return 0;
}`},
 {label:"Bẫy: tính phần trăm",code:`#include <iostream>
using namespace std;

int main() {
    int dung = 7, tong = 9;
    cout << dung / tong * 100 << "%\\n";     // 0
    cout << dung * 100 / tong << "%\\n";     // 77
    cout << dung * 100.0 / tong << "%\\n";   // 77.7778
    return 0;
}`},
 {label:"Ví dụ: Gán kết hợp",code:`#include <iostream>
using namespace std;

int main() {
    int tien = 100000;
    tien += 55500;     // nhận thêm
    tien -= 30000;     // chi tiêu
    tien *= 2;         // gấp đôi
    tien /= 3;         // chia 3 người
    int le = tien % 1000;
    tien -= le;        // bỏ phần lẻ dưới 1000
    cout << tien << " (bỏ lẻ " << le << ")\\n";
    return 0;
}`},
 {label:"Lỗi khi chạy: chia cho 0",input:"10 0",code:`#include <iostream>
using namespace std;

int main() {
    int a, b;
    cin >> a >> b;
    cout << "Thương: " << a / b << "\\n";
    return 0;
}`}
];
const sim8=makeSim2(document.getElementById("sim-l8"),{id:"s8",presets:P8});
makeExprTree(document.getElementById("etree-l8"));
makeEx2(document.getElementById("ex-l8"),sim8,[
 {t:"Tổng các chữ số",d:"Nhập một số nguyên có đúng 3 chữ số. In tổng 3 chữ số của nó.",
  tests:[{in:"472",out:"13"},{in:"100",out:"1"},{in:"999",out:"27"}],
  start:`#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;

    return 0;
}`},
 {t:"Đồng hồ 24 giờ",d:"Nhập giờ hiện tại (0–23) và số giờ cần cộng thêm (không âm). In giờ mới trên đồng hồ 24 giờ.",
  tests:[{in:"22 5",out:"3"},{in:"10 14",out:"0"},{in:"0 100",out:"4"}],
  start:`#include <iostream>
using namespace std;

int main() {
    int gio, them;
    cin >> gio >> them;

    return 0;
}`},
 {t:"Đổi tiền",d:"Nhập số tiền (bội của 1000). Đổi ra ít tờ nhất bằng các mệnh giá 50000, 20000, 10000, 5000, 1000. In mỗi mệnh giá một dòng dạng “50000: số_tờ”.",
  tests:[{in:"87000",out:"50000: 1\n20000: 1\n10000: 1\n5000: 1\n1000: 2"},{in:"1000",out:"50000: 0\n20000: 0\n10000: 0\n5000: 0\n1000: 1"},{in:"236000",out:"50000: 4\n20000: 1\n10000: 1\n5000: 1\n1000: 1"}],
  start:`#include <iostream>
using namespace std;

int main() {
    int tien;
    cin >> tien;
    // Gợi ý: số tờ = tien / menh_gia; phần còn lại = tien % menh_gia

    return 0;
}`}
]);

makeQuiz("quiz8","score8",[{"q": "<code>2 + 3 * 4<\/code> bằng?", "o": ["20", "14", "24", "9"], "a": 1, "e": "Nhân trước cộng sau: 3 * 4 = 12, rồi 2 + 12 = 14."}, {"q": "<code>-7 / 2<\/code> trong C++ bằng?", "o": ["-4", "-3", "-3.5", "3"], "a": 1, "e": "Chia nguyên cắt về phía 0: −3.5 thành −3."}, {"q": "<code>-7 % 3<\/code> bằng?", "o": ["2", "-1", "1", "-2"], "a": 1, "e": "Dấu phần dư theo số bị chia: −7 = (−2)·3 + (−1)."}, {"q": "<code>20 - 6 - 4<\/code> bằng?", "o": ["18", "10", "14", "Lỗi"], "a": 1, "e": "Cùng mức ưu tiên thì tính từ trái sang phải: (20 − 6) − 4 = 10."}]);

fillSnips();
