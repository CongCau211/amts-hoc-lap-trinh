# AMTS Học Lập Trình

Website học lập trình của trung tâm đào tạo **AMTS**. Mỗi bài có hình minh họa, trình mô phỏng C++ chạy ngay trên trình duyệt, bài tập chấm tự động và trắc nghiệm. Học viên đăng nhập bằng Google để lưu tiến độ; giảng viên theo dõi tiến độ, cài đặt học phí và kích hoạt học viên.

- Trang chủ: `index.html`
- Khóa C++ từ nền tảng: `cpp/index.html` (19 bài đang mở, lộ trình 12 chương)
- Công nghệ: HTML, CSS, JavaScript thuần; Firebase Authentication (Google) và Cloud Firestore; hosting tĩnh GitHub Pages.

## Repo này chứa gì và không chứa gì

| Có trong repo | Không có trong repo (cố ý) |
|---|---|
| `index.html`, `cpp/index.html`: khung trang, trình mô phỏng, bài tập, trắc nghiệm | **Phần chữ của bài học**: nằm trên Firestore (`content/…`), chỉ người có quyền mới đọc được |
| `firestore.rules`: quy tắc bảo mật Firestore đang dùng | `noi-dung-cpp.json`: gói nội dung bài học để tải lên Firestore. Giảng viên giữ riêng, **không đưa lên GitHub** |
| `README.md`: tài liệu này | Mã nguồn để build (`site-src/`, `build.py`): giảng viên/nhóm phát triển giữ riêng |

### Thư mục `assets/app/` và `assets/fonts/`
- `assets/app/*.<mã băm>.js|css|json`: phần dùng chung của các trang (giao diện, trình mô phỏng, mã của từng bài, mục lục khóa sắp ra mắt). Tên file đổi khi nội dung đổi, nên trình duyệt của học viên nhớ được file cũ và chỉ tải phần thật sự thay đổi sau mỗi lần cập nhật.
- Khi tải đè bản mới lên GitHub, các file cũ trong `assets/app/` vẫn còn nhưng không trang nào dùng nữa. Có thể xóa file cũ bất cứ lúc nào: chỉ giữ các file có trong file zip mới nhất.
- `assets/fonts/`: phông Be Vietnam Pro và JetBrains Mono (giấy phép SIL Open Font License 1.1) lưu ngay trên trang, không phải tải từ Google.

Vì vậy chỉ clone repo **chưa đủ** để dựng lại toàn bộ hệ thống: cần thêm file nội dung `noi-dung-cpp.json` hoặc một bản sao lưu đầy đủ (xem mục “Khôi phục”).

## Dữ liệu trên Firestore

| Collection | Nội dung | Ai đọc | Ai ghi |
|---|---|---|---|
| `users/{uid}` | Hồ sơ và tiến độ học (`courses.cpp…`) | chủ tài khoản, giảng viên | chủ tài khoản (chỉ các trường cho phép), giảng viên |
| `config/{khóa}` | Chế độ trả phí, bài có phí, bài cần đăng nhập, học phí, thông tin chuyển khoản, phiên bản nội dung | mọi người | giảng viên |
| `enroll/{uid}` | Học viên đã được kích hoạt phần có phí | chủ tài khoản, giảng viên | giảng viên |
| `content/{khóa}-{bài}` | Phần chữ bài học (HTML) | theo quyền: công khai / cần đăng nhập / đã kích hoạt | giảng viên |

Giảng viên được xác định bằng email đã xác minh trong `firestore.rules` (hàm `isTeacher`). Danh sách này phải khớp với `TEACHERS` trong mã trang.

## Triển khai lần đầu trên một dự án Firebase

1. Tạo dự án Firebase, bật **Authentication → Google**, tạo **Firestore** (khu vực `asia-southeast1`).
2. **Authentication → Settings → Authorized domains**: thêm tên miền của trang (ví dụ `congcau211.github.io`).
3. **Firestore → Rules**: dán toàn bộ `firestore.rules` → **Publish**.
4. Nếu đổi sang dự án Firebase khác: cập nhật cấu hình `FB_CONFIG` trong mã nguồn rồi build lại.
5. Đưa `index.html` và thư mục `cpp/` lên GitHub, bật **Settings → Pages** (nhánh `main`, thư mục gốc).
6. Mở trang, đăng nhập bằng email giảng viên → **Trang giảng viên** → **Nội dung bài học trên máy chủ** → chọn `noi-dung-cpp.json` → **Tải nội dung lên**. Bấm **Kiểm tra từng bài** để xác nhận đủ 19/19 bài.
7. Kiểm tra bằng cửa sổ ẩn danh: bài công khai mở được, bài cần đăng nhập và bài có phí bị khóa đúng.

## Cập nhật khi có bài mới

1. Dán lại `firestore.rules` nếu file thay đổi.
2. Tải đè `index.html` và `cpp/` lên GitHub.
3. Trang giảng viên → tải `noi-dung-cpp.json` mới lên → **Kiểm tra từng bài**.

Nếu trang và nội dung trên máy chủ lệch phiên bản, giảng viên sẽ thấy cảnh báo ở đầu bài và trong Trang giảng viên.

## Sao lưu

Trang giảng viên → **Tải bản sao lưu (JSON)**. File gồm: tiến độ mọi học viên (`users`), cài đặt (`config`), danh sách kích hoạt (`enroll`) và nội dung bài học (`content`). Nên tải định kỳ, cất ở nơi riêng tư (file chứa toàn bộ bài học và email học viên).

## Khôi phục

- **Trên cùng dự án Firebase** (lỡ xóa, lỡ sửa sai): Trang giảng viên → **Khôi phục từ bản sao lưu…** → chọn file. Dữ liệu trùng tên bị ghi đè bằng dữ liệu trong file.
- **Sang dự án Firebase mới**: làm các bước “Triển khai lần đầu” (1–5), đăng nhập giảng viên, rồi **Khôi phục từ bản sao lưu…**. Mã định danh học viên (`uid`) chỉ giữ nguyên nếu dùng lại cùng dự án Firebase. Ở dự án mới, học viên đăng nhập lại sẽ có `uid` mới, nên tiến độ cũ cần được gán lại theo email (liên hệ nhóm phát triển).

## Trình mô phỏng C++

Đây là trình mô phỏng để học, chạy một phần của C++, **không phải trình biên dịch đầy đủ**. Các ví dụ của bài học được đối chiếu tự động với **g++ 13 (`-std=c++17 -Wall -Wextra`)**: kết quả biên dịch, đầu ra và số cảnh báo khớp nhau, trừ các ví dụ cố ý minh họa hành vi không xác định (biến chưa khởi tạo, dịch quá số bit).

- **Có:** int, unsigned, short, long long (64 bit chính xác), char, bool, float, double, std::string; cin/cout/getline, iomanip, cmath; mọi toán tử; if, switch, các vòng lặp; hàm, tham chiếu, nạp chồng, tham số mặc định, đệ quy, biến toàn cục.
- **Chưa có:** mảng và chỉ số `[]`, vector và STL, con trỏ, struct/class, template, printf/scanf, file. Code dùng các phần này được báo “chưa hỗ trợ”, không bị báo là lỗi C++.
- **Giới hạn:** 1 000 000 bước, 3 000 tầng gọi hàm, 200 000 ký tự đầu ra.

## Giới hạn cần biết

- Phần mô phỏng, đề bài tập và đáp án trắc nghiệm nằm trong mã công khai; chỉ phần chữ bài học được bảo vệ.
- Tiến độ và kết quả bài tập được tính ở trình duyệt của học viên: phù hợp theo dõi tự học, không dùng để thi hay cấp chứng chỉ.
- Gói Firebase miễn phí (Spark): 50 000 lượt đọc/ngày; vượt hạn mức thì tạm ngừng tới hôm sau, không mất dữ liệu.
