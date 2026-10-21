lazyWidgets();
Object.assign(SNIP,{"l10cond": "int diem = 7;\ncout << (diem >= 5 ? \"Đạt\" : \"Chưa đạt\") << \"\\n\";\n\nint a = 4, b = 9;\nint lonHon = (a > b) ? a : b;          // 9\n\n// Sai: thiếu ngoặc, cout << diem >= 5 ... bị hiểu là (cout << diem) >= 5\n// cout << diem >= 5 ? \"Đạt\" : \"Chưa đạt\";"});PRESET_NOTES["l10"]={"Ví dụ: Ưu tiên trong biểu thức hỗn hợp": "Một biểu thức hỗn hợp được tính theo thứ tự ưu tiên: số học → so sánh → logic. Tách từng phần để tự kiểm tra kết quả.", "Ví dụ: Toán tử ?:": "Toán tử ba ngôi điều kiện ? a : b chọn một trong hai giá trị. Gọn cho các lựa chọn đơn giản như số lớn hơn, chẵn hay lẻ.", "Lỗi: cout << a < b": "Lỗi biên dịch: << ưu tiên cao hơn <, nên cout << a < b bị hiểu sai. Cần đặt so sánh trong ngoặc.", "Lỗi: ?: thiếu ngoặc trong cout": "Lỗi biên dịch: ?: ưu tiên thấp hơn <<, nên phải bọc cả biểu thức điều kiện trong ngoặc khi in.", "Ví dụ: Gán kết hợp từ phải sang trái": "Phép gán chạy từ phải sang trái và trả về giá trị vừa gán, nên viết được a = b = c = 10. Theo dõi thứ tự a, b, c thay đổi.", "Cảnh báo: i++ + i không xác định": "Cảnh báo: vừa tăng vừa đọc cùng biến trong một biểu thức (i++ + i) là không xác định. Tách thành nhiều lệnh cho rõ ràng.", "Ví dụ: Ngoặc làm rõ ý": "Ngoặc không đổi kết quả khi đã đúng thứ tự ưu tiên, nhưng giúp người đọc hiểu ý ngay. Nên dùng khi kết hợp && và ||."};EX_HINTS["l10"]=[["Trung bình có trọng số = (m1 × 1 + m2 × 2 + m3 × 3) / (1 + 2 + 3).", "In với fixed << setprecision(2)."], ["Lớn hơn của hai số: a > b ? a : b.", "Lồng thêm một lần: so kết quả đó với c."], ["n % 2 == 0 cho biết n chẵn.", "Khi in, bọc cả biểu thức trong ngoặc: cout << (n % 2 == 0 ? \"chan\" : \"le\");"]];
/* ===================== BÀI 10 · Thứ tự ưu tiên ===================== */
/* Bài 10 · Thứ tự ưu tiên
   Mã riêng của bài: ví dụ cho trình mô phỏng, công cụ minh họa, bài tập chấm tự động.
   Trắc nghiệm nằm ở quiz.json, đoạn code minh họa ở snippets/*.cpp. */
const P10=[
 {label:"Ví dụ: Ưu tiên trong biểu thức hỗn hợp",code:`#include <iostream>
using namespace std;

int main() {
    int a = 3, b = 4, c = 5;
    cout << boolalpha;
    cout << (a + b * 2 > c && c % 2 == 1) << "\\n";
    cout << (a < b == b < c) << "\\n";        // (a<b) == (b<c)
    cout << (a == 3 || b == 0 && c == 0) << "\\n";
    return 0;
}`},
 {label:"Ví dụ: Toán tử ?:",input:"7 12",code:`#include <iostream>
using namespace std;

int main() {
    int a, b;
    cin >> a >> b;
    int lonHon = a > b ? a : b;
    cout << "Lớn hơn: " << lonHon << "\\n";
    cout << a << " là số " << (a % 2 == 0 ? "chẵn" : "lẻ") << "\\n";
    return 0;
}`},
 {label:"Lỗi: cout << a < b",code:`#include <iostream>
using namespace std;

int main() {
    int a = 3, b = 5;
    cout << a < b;
    return 0;
}`},
 {label:"Lỗi: ?: thiếu ngoặc trong cout",code:`#include <iostream>
using namespace std;

int main() {
    int n = 7;
    cout << n % 2 == 0 ? "chẵn" : "lẻ";
    return 0;
}`},
 {label:"Ví dụ: Gán kết hợp từ phải sang trái",code:`#include <iostream>
using namespace std;

int main() {
    int a, b, c;
    a = b = c = 10;        // a = (b = (c = 10))
    a += b -= 3;           // b thành 7, a thành 17
    cout << a << " " << b << " " << c << "\\n";
    return 0;
}`},
 {label:"Cảnh báo: i++ + i không xác định",code:`#include <iostream>
using namespace std;

int main() {
    int i = 1;
    int k = i++ + i;       // tùy trình biên dịch
    cout << k << "\\n";

    int j = 1;             // cách viết rõ ràng
    int truoc = j;
    j++;
    cout << truoc + j << "\\n";
    return 0;
}`},
 {label:"Ví dụ: Ngoặc làm rõ ý",code:`#include <iostream>
using namespace std;

int main() {
    int gio = 9, phut = 30;
    bool sang = gio >= 6 && gio < 12;
    bool dungGio = (gio == 9 && phut == 0) || (gio == 8 && phut >= 55);
    cout << boolalpha << sang << " " << dungGio << "\\n";
    return 0;
}`}
];
const sim10=makeSim2(document.getElementById("sim-l10"),{id:"s10",presets:P10});
makeExprTree(document.getElementById("etree-l10"),{id:"et10",decl:[["int","a","3"],["int","b","4"],["int","c","5"]],initial:"a + b * 2 > c && c % 2 == 1",fullParen:true,
  examples:["a + b * 2 > c && c % 2 == 1","a < b == b < c","a == 3 || b == 0 && c == 0","-a * b + c % 2","a > b ? a : b","a = b = c","a += b * 2","c & 1 == 1","!a + b"]});
makeCompileGuess(document.getElementById("cg-l10"),[
 {code:"int a = 3, b = 5;\ncout << a < b;"},
 {code:"int a = 3, b = 5;\ncout << (a < b);",why:"Ngoặc buộc so sánh được tính trước rồi mới in."},
 {code:"int a = 3, b = 5;\ncout << a + b;",why:"+ có ưu tiên cao hơn <<, nên a + b được tính trước khi in."},
 {code:"int n = 7;\ncout << n % 2 == 1;"},
 {code:"int n = 7;\ncout << (n > 5 ? \"lớn\" : \"nhỏ\");",why:"Cả biểu thức ?: nằm trong ngoặc nên được tính trước khi in."},
 {code:"int a = 1;\nint b = a > 0 ? 10 : \"không\";"},
 {code:"int a = 6;\ncout << (a & 1);",why:"Có ngoặc nên a & 1 tính trước rồi mới in: 0."},
 {code:"int a = 6;\ncout << a & 1;"}
]);
makeEx2(document.getElementById("ex-l10"),sim10,[
 {t:"Điểm có trọng số",d:"Nhập điểm 3 môn (số thực). Môn 1 hệ số 1, môn 2 hệ số 2, môn 3 hệ số 3. In điểm trung bình có trọng số với 2 chữ số sau dấu phẩy.",
  tests:[{in:"6 7 8",out:"7.33"},{in:"10 10 10",out:"10.00"},{in:"9 5 6",out:"6.17"}],
  start:`#include <iostream>
#include <iomanip>
using namespace std;

int main() {
    double m1, m2, m3;
    cin >> m1 >> m2 >> m3;

    return 0;
}`},
 {t:"Số lớn nhất",d:"Nhập 3 số nguyên. In số lớn nhất, dùng toán tử ?: (chưa dùng if).",
  tests:[{in:"3 9 4",out:"9"},{in:"-1 -5 -2",out:"-1"},{in:"7 7 2",out:"7"},{in:"1 2 30",out:"30"}],need:/\?/,needMsg:"Hãy dùng toán tử ?:.",
  start:`#include <iostream>
using namespace std;

int main() {
    int a, b, c;
    cin >> a >> b >> c;

    return 0;
}`},
 {t:"Chẵn hay lẻ",d:"Nhập n. In “chan” nếu n chẵn, “le” nếu n lẻ (không dấu). Dùng ?: và nhớ đặt ngoặc khi in.",
  tests:[{in:"4",out:"chan"},{in:"7",out:"le"},{in:"-3",out:"le"},{in:"0",out:"chan"}],need:/\?/,needMsg:"Hãy dùng toán tử ?:.",
  start:`#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;

    return 0;
}`}
]);

makeQuiz("quiz10","score10",[{"q": "Dạng đặt ngoặc đúng của <code>a + b * c &gt; d &amp;&amp; e<\/code> là?", "o": ["<code>((a + b) * c) &gt; (d &amp;&amp; e)<\/code>", "<code>(((a + (b * c)) &gt; d) &amp;&amp; e)<\/code>", "<code>(a + (b * (c &gt; d))) &amp;&amp; e<\/code>", "<code>a + ((b * c) &gt; (d &amp;&amp; e))<\/code>"], "a": 1, "e": "Nhân → cộng → so sánh → logic."}, {"q": "Vì sao <code>cout &lt;&lt; a &lt; b;<\/code> báo lỗi?", "o": ["Thiếu dấu chấm phẩy", "&lt;&lt; có ưu tiên cao hơn &lt; nên thành (cout &lt;&lt; a) &lt; b", "cout không in được bool", "a và b chưa khai báo"], "a": 1, "e": "Phải viết cout << (a < b);"}, {"q": "Sau <code>a = b = 5;<\/code> thì?", "o": ["a = 5, b chưa đổi", "a = b = 5", "Lỗi biên dịch", "a = 0"], "a": 1, "e": "Gán kết hợp từ phải sang trái: a = (b = 5), biểu thức b = 5 có giá trị 5."}, {"q": "<code>int k = i++ + i;<\/code> cho kết quả gì?", "o": ["Luôn là 2i", "Luôn là 2i + 1", "Không xác định, tùy trình biên dịch", "Lỗi biên dịch"], "a": 2, "e": "i vừa bị sửa vừa được đọc trong cùng biểu thức, không có thứ tự quy định."}]);

fillSnips();
