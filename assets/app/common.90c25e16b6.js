/* ================= AMTS · LÕI DÙNG CHUNG (danh mục khóa học + tài khoản + tiến độ) =================
   Thêm khóa học mới: thêm một mục vào COURSES (status:"soon", url "<khóa>/index.html", cuối mục là chỗ giữ CATALOG của khóa).
   Khi courses/<khóa>/course.json có ít nhất một bài đã viết, build điền danh mục bài và tự chuyển khóa sang status:"open". */
const COURSES=[
 {id:"cpp",name:"C++ từ nền tảng",mono:"C++",url:"cpp/index.html",status:"open",hue:"cpp",
  desc:"Xây nền tảng vững chắc với bài học có hình minh họa và trình mô phỏng trực quan.",
  status:"open",
  chWord:"chương",
  chapters:12,
  lessons:[["l1", "Chương trình C++ đầu tiên"], ["l2", "Cài đặt trình biên dịch & IDE"], ["l3", "Nhập xuất với cin / cout"], ["l4", "Biến, khai báo, khởi tạo"], ["l5", "int, double, char, bool"], ["l6", "Hằng số const / constexpr"], ["l7", "Ép kiểu và tràn số"], ["l8", "Toán tử số học"], ["l9", "So sánh và logic"], ["l10", "Thứ tự ưu tiên"], ["l11", "Toán tử bit"], ["l12", "if / else"], ["l13", "switch"], ["l14", "while, do-while"], ["l15", "for, break, continue"], ["l16", "Định nghĩa và gọi hàm"], ["l17", "Truyền tham trị / tham chiếu"], ["l18", "Nạp chồng hàm"], ["l19", "Đệ quy"], ["l20", "Phạm vi biến"], ["l21", "Mảng một chiều"], ["l22", "Mảng hai chiều"], ["l23", "string"], ["l24", "vector cơ bản"], ["l25", "Địa chỉ và con trỏ"], ["l26", "Tham chiếu"], ["l27", "Stack và heap"], ["l28", "new / delete"], ["l29", "Lỗi bộ nhớ thường gặp"], ["l30", "struct và class"], ["l31", "Constructor / destructor"], ["l32", "Đóng gói"], ["l33", "Nạp chồng toán tử"], ["l34", "Kế thừa"], ["l35", "Hàm ảo và vtable"], ["l36", "Lớp trừu tượng"], ["l37", "Đa kế thừa"], ["l38", "Hàm mẫu (function template)"], ["l39", "Lớp mẫu (class template)"], ["l40", "Container của STL"], ["l41", "Iterator và algorithm"], ["l42", "Lambda"], ["l43", "RAII"], ["l44", "unique_ptr, shared_ptr"], ["l45", "Move semantics"], ["l46", "Ngoại lệ"], ["l47", "optional, variant"], ["l48", "thread"], ["l49", "mutex & data race"], ["l50", "atomic"], ["l51", "async / future"], ["l52", "Dự án tổng hợp"]],
  exercises:["l1-0", "l1-1", "l1-2", "l2-term", "l3-0", "l3-1", "l3-2", "l4-0", "l4-1", "l4-2", "l5-0", "l5-1", "l5-2", "l6-0", "l6-1", "l6-2", "l7-0", "l7-1", "l7-2", "l8-0", "l8-1", "l8-2", "l9-0", "l9-1", "l9-2", "l10-0", "l10-1", "l10-2", "l11-0", "l11-1", "l11-2", "l12-0", "l12-1", "l12-2", "l13-0", "l13-1", "l13-2", "l14-0", "l14-1", "l14-2", "l15-0", "l15-1", "l15-2", "l16-0", "l16-1", "l16-2", "l17-0", "l17-1", "l17-2", "l18-0", "l18-1", "l18-2", "l19-0", "l19-1", "l19-2", "l20-0", "l20-1", "l20-2", "l21-0", "l21-1", "l21-2", "l22-0", "l22-1", "l22-2", "l23-0", "l23-1", "l23-2", "l24-0", "l24-1", "l24-2", "l25-0", "l25-1", "l25-2", "l26-0", "l26-1", "l26-2", "l27-0", "l27-1", "l27-2", "l28-0", "l28-1", "l28-2", "l29-0", "l29-1", "l29-2", "l30-0", "l30-1", "l30-2", "l31-0", "l31-1", "l31-2", "l32-0", "l32-1", "l32-2", "l33-0", "l33-1", "l33-2", "l34-0", "l34-1", "l34-2", "l35-0", "l35-1", "l35-2", "l36-0", "l36-1", "l36-2", "l37-0", "l37-1", "l37-2", "l38-0", "l38-1", "l38-2", "l39-0", "l39-1", "l39-2", "l40-0", "l40-1", "l40-2", "l41-0", "l41-1", "l41-2", "l42-0", "l42-1", "l42-2", "l43-0", "l43-1", "l43-2", "l44-0", "l44-1", "l44-2", "l45-0", "l45-1", "l45-2", "l46-0", "l46-1", "l46-2", "l47-0", "l47-1", "l47-2", "l48-0", "l48-1", "l48-2", "l49-0", "l49-1", "l49-2", "l50-0", "l50-1", "l50-2", "l51-0", "l51-1", "l51-2", "l52-0", "l52-1", "l52-2"],
  practice:["l3-0", "l3-1", "l3-2", "l4-0", "l4-1", "l4-2", "l5-0", "l5-1", "l5-2", "l6-0", "l6-1", "l6-2", "l7-0", "l7-1", "l7-2", "l8-0", "l8-1", "l8-2", "l9-0", "l9-1", "l9-2", "l10-0", "l10-1", "l10-2", "l11-0", "l11-1", "l11-2", "l12-0", "l12-1", "l12-2", "l13-0", "l13-1", "l13-2", "l14-0", "l14-1", "l14-2", "l15-0", "l15-1", "l15-2", "l16-0", "l16-1", "l16-2", "l17-0", "l17-1", "l17-2", "l18-0", "l18-1", "l18-2", "l19-0", "l19-1", "l19-2", "l20-0", "l20-1", "l20-2", "l21-0", "l21-1", "l21-2", "l22-0", "l22-1", "l22-2", "l23-0", "l23-1", "l23-2", "l24-0", "l24-1", "l24-2", "l25-0", "l25-1", "l25-2", "l26-0", "l26-1", "l26-2", "l27-0", "l27-1", "l27-2", "l28-0", "l28-1", "l28-2", "l29-0", "l29-1", "l29-2", "l30-0", "l30-1", "l30-2", "l31-0", "l31-1", "l31-2", "l32-0", "l32-1", "l32-2", "l33-0", "l33-1", "l33-2", "l34-0", "l34-1", "l34-2", "l35-0", "l35-1", "l35-2", "l36-0", "l36-1", "l36-2", "l37-0", "l37-1", "l37-2", "l38-0", "l38-1", "l38-2", "l39-0", "l39-1", "l39-2", "l40-0", "l40-1", "l40-2", "l41-0", "l41-1", "l41-2", "l42-0", "l42-1", "l42-2", "l43-0", "l43-1", "l43-2", "l44-0", "l44-1", "l44-2", "l45-0", "l45-1", "l45-2", "l46-0", "l46-1", "l46-2", "l47-0", "l47-1", "l47-2", "l48-0", "l48-1", "l48-2", "l49-0", "l49-1", "l49-2", "l50-0", "l50-1", "l50-2", "l51-0", "l51-1", "l51-2", "l52-0", "l52-1", "l52-2"],
  contentVer:"156b94155733",
  langs:["cpp"],
  quizzes:{"l1": "quiz", "l2": "quiz2", "l3": "quiz3", "l4": "quiz4", "l5": "quiz5", "l6": "quiz6", "l7": "quiz7", "l8": "quiz8", "l9": "quiz9", "l10": "quiz10", "l11": "quiz11", "l12": "quiz12", "l13": "quiz13", "l14": "quiz14", "l15": "quiz15", "l16": "quiz16", "l17": "quiz17", "l18": "quiz18", "l19": "quiz19", "l20": "quiz20", "l21": "quiz21", "l22": "quiz22", "l23": "quiz23", "l24": "quiz24", "l25": "quiz25", "l26": "quiz26", "l27": "quiz27", "l28": "quiz28", "l29": "quiz29", "l30": "quiz30", "l31": "quiz31", "l32": "quiz32", "l33": "quiz33", "l34": "quiz34", "l35": "quiz35", "l36": "quiz36", "l37": "quiz37", "l38": "quiz38", "l39": "quiz39", "l40": "quiz40", "l41": "quiz41", "l42": "quiz42", "l43": "quiz43", "l44": "quiz44", "l45": "quiz45", "l46": "quiz46", "l47": "quiz47", "l48": "quiz48", "l49": "quiz49", "l50": "quiz50", "l51": "quiz51", "l52": "quiz52"}},
 {id:"algo",name:"Cấu trúc dữ liệu & Giải thuật",mono:"Algo",url:"algo/index.html",status:"soon",hue:"algo",
  desc:"Tư duy giải thuật, phân tích độ phức tạp và các kỹ thuật kinh điển để thi học sinh giỏi, phỏng vấn.",status:"open",
  chWord:"chương",
  chapters:14,
  lessons:[["l1", "Giải thuật là gì? Từ công thức nấu ăn đến chương trình"], ["l2", "Mô tả giải thuật bằng các bước, mã giả và lưu đồ"], ["l3", "Tính đúng: bất biến vòng lặp và kiểm thử"], ["l4", "Đo thời gian chạy bằng cách đếm phép toán"], ["l5", "Độ phức tạp Big-O, Big-Θ, Big-Ω"], ["l6", "Độ phức tạp bộ nhớ và cách đọc giới hạn của đề bài"], ["l7", "Mảng, vector và chỉ số"], ["l8", "Duyệt mảng: đếm, tính tổng, tìm lớn nhất và nhỏ nhất"], ["l9", "Mảng cộng dồn (prefix sum)"], ["l10", "Mảng hiệu (difference array)"], ["l11", "Kỹ thuật hai con trỏ"], ["l12", "Kỹ thuật cửa sổ trượt"], ["l13", "Tìm kiếm tuần tự"], ["l14", "Tìm kiếm nhị phân"], ["l15", "Tìm kiếm nhị phân trên đáp án"], ["l16", "Sắp xếp chọn, chèn và nổi bọt"], ["l17", "Sắp xếp trộn (merge sort)"], ["l18", "Sắp xếp nhanh (quick sort)"], ["l19", "Sắp xếp đếm, tính ổn định và hàm sort() của STL"], ["l20", "Ôn đệ quy: điều kiện dừng và cây lời gọi"], ["l21", "Chia để trị"], ["l22", "Quay lui: sinh tổ hợp và hoán vị"], ["l23", "Quay lui có cắt nhánh: bài toán N quân hậu"], ["l24", "Đệ quy có nhớ (memoization)"], ["l25", "Danh sách liên kết"], ["l26", "Ngăn xếp (stack) và bài toán kiểm tra dấu ngoặc"], ["l27", "Hàng đợi (queue) và hàng đợi hai đầu (deque)"], ["l28", "Ngăn xếp đơn điệu"], ["l29", "Hàng đợi đơn điệu: giá trị lớn nhất trong cửa sổ trượt"], ["l30", "Bảng băm hoạt động ra sao; va chạm và cách xử lý"], ["l31", "unordered_map và unordered_set"], ["l32", "set và map (cây cân bằng) so với bảng băm"], ["l33", "Bài toán đếm tần suất và tìm cặp có tổng cho trước"], ["l34", "Băm chuỗi"], ["l35", "Cây, cây nhị phân và các cách duyệt cây"], ["l36", "Cây nhị phân tìm kiếm (BST)"], ["l37", "Đống (heap) và priority_queue"], ["l38", "Hợp nhất tập hợp (DSU)"], ["l39", "Cây tiền tố (trie)"], ["l40", "Ý tưởng tham lam và khi nào nó đúng"], ["l41", "Bài toán chọn hoạt động và xếp lịch"], ["l42", "Chứng minh tham lam bằng lập luận hoán đổi"], ["l43", "Mã Huffman"], ["l44", "Từ đệ quy có nhớ đến quy hoạch động"], ["l45", "Trạng thái và công thức truy hồi qua bài leo cầu thang"], ["l46", "Dãy con tăng dài nhất (LIS)"], ["l47", "Xâu con chung dài nhất (LCS) và khoảng cách sửa"], ["l48", "Bài toán cái túi"], ["l49", "Quy hoạch động trên lưới"], ["l50", "Truy vết để in ra lời giải"], ["l51", "Đồ thị và các cách biểu diễn"], ["l52", "BFS và đường đi ngắn nhất không trọng số"], ["l53", "DFS và thành phần liên thông"], ["l54", "Sắp xếp tô pô"], ["l55", "Phát hiện chu trình và đồ thị hai phía"], ["l56", "Thuật toán Dijkstra"], ["l57", "Thuật toán Bellman-Ford và chu trình âm"], ["l58", "Thuật toán Floyd-Warshall"], ["l59", "Cây khung nhỏ nhất: Kruskal và Prim"], ["l60", "Bảng thưa (sparse table)"], ["l61", "Cây Fenwick (BIT)"], ["l62", "Cây phân đoạn (segment tree)"], ["l63", "Cập nhật lười (lazy propagation)"], ["l64", "Tổ tiên chung gần nhất (LCA)"], ["l65", "Số nguyên tố và sàng Eratosthenes"], ["l66", "Ước chung lớn nhất, bội chung nhỏ nhất, đồng dư và lũy thừa nhanh"], ["l67", "Tổ hợp và nghịch đảo modulo"], ["l68", "So khớp chuỗi: KMP và Z-function"], ["l69", "Quy hoạch động trạng thái bit (bitmask)"], ["l70", "Quy hoạch động trên cây"], ["l71", "Quy hoạch động chữ số"], ["l72", "Tiếp cận một bài toán lạ: từ trâu bò đến tối ưu"], ["l73", "Kiểm thử đối chiếu (stress test) và gỡ lỗi"], ["l74", "Dự án cuối khóa: bộ đề luyện thi và phỏng vấn tổng hợp"]],
  exercises:["l1-0", "l1-1", "l1-2", "l2-0", "l2-1", "l2-2", "l3-0", "l3-1", "l3-2", "l4-0", "l4-1", "l4-2", "l5-0", "l5-1", "l5-2", "l6-0", "l6-1", "l6-2", "l7-0", "l7-1", "l7-2", "l8-0", "l8-1", "l8-2", "l9-0", "l9-1", "l9-2", "l10-0", "l10-1", "l10-2", "l11-0", "l11-1", "l11-2", "l12-0", "l12-1", "l12-2", "l13-0", "l13-1", "l13-2", "l14-0", "l14-1", "l14-2", "l15-0", "l15-1", "l15-2", "l16-0", "l16-1", "l16-2", "l17-0", "l17-1", "l17-2", "l18-0", "l18-1", "l18-2", "l19-0", "l19-1", "l19-2", "l20-0", "l20-1", "l20-2", "l21-0", "l21-1", "l21-2", "l22-0", "l22-1", "l22-2", "l23-0", "l23-1", "l23-2", "l24-0", "l24-1", "l24-2", "l25-0", "l25-1", "l25-2", "l26-0", "l26-1", "l26-2", "l27-0", "l27-1", "l27-2", "l28-0", "l28-1", "l28-2", "l29-0", "l29-1", "l29-2", "l30-0", "l30-1", "l30-2", "l31-0", "l31-1", "l31-2", "l32-0", "l32-1", "l32-2", "l33-0", "l33-1", "l33-2", "l34-0", "l34-1", "l34-2", "l35-0", "l35-1", "l35-2", "l36-0", "l36-1", "l36-2", "l37-0", "l37-1", "l37-2", "l38-0", "l38-1", "l38-2", "l39-0", "l39-1", "l39-2", "l40-0", "l40-1", "l40-2", "l41-0", "l41-1", "l41-2", "l42-0", "l42-1", "l42-2", "l43-0", "l43-1", "l43-2", "l44-0", "l44-1", "l44-2", "l45-0", "l45-1", "l45-2", "l46-0", "l46-1", "l46-2", "l47-0", "l47-1", "l47-2", "l48-0", "l48-1", "l48-2", "l49-0", "l49-1", "l49-2", "l50-0", "l50-1", "l50-2", "l51-0", "l51-1", "l51-2", "l52-0", "l52-1", "l52-2", "l53-0", "l53-1", "l53-2", "l54-0", "l54-1", "l54-2", "l55-0", "l55-1", "l55-2", "l56-0", "l56-1", "l56-2", "l57-0", "l57-1", "l57-2", "l58-0", "l58-1", "l58-2", "l59-0", "l59-1", "l59-2", "l60-0", "l60-1", "l60-2", "l61-0", "l61-1", "l61-2", "l62-0", "l62-1", "l62-2", "l63-0", "l63-1", "l63-2", "l64-0", "l64-1", "l64-2", "l65-0", "l65-1", "l65-2", "l66-0", "l66-1", "l66-2", "l67-0", "l67-1", "l67-2", "l68-0", "l68-1", "l68-2", "l69-0", "l69-1", "l69-2", "l70-0", "l70-1", "l70-2", "l71-0", "l71-1", "l71-2", "l72-0", "l72-1", "l72-2", "l73-0", "l73-1", "l73-2", "l74-0", "l74-1", "l74-2"],
  practice:["l1-0", "l1-1", "l1-2", "l2-0", "l2-1", "l2-2", "l3-0", "l3-1", "l3-2", "l4-0", "l4-1", "l4-2", "l5-0", "l5-1", "l5-2", "l6-0", "l6-1", "l6-2", "l7-0", "l7-1", "l7-2", "l8-0", "l8-1", "l8-2", "l9-0", "l9-1", "l9-2", "l10-0", "l10-1", "l10-2", "l11-0", "l11-1", "l11-2", "l12-0", "l12-1", "l12-2", "l13-0", "l13-1", "l13-2", "l14-0", "l14-1", "l14-2", "l15-0", "l15-1", "l15-2", "l16-0", "l16-1", "l16-2", "l17-0", "l17-1", "l17-2", "l18-0", "l18-1", "l18-2", "l19-0", "l19-1", "l19-2", "l20-0", "l20-1", "l20-2", "l21-0", "l21-1", "l21-2", "l22-0", "l22-1", "l22-2", "l23-0", "l23-1", "l23-2", "l24-0", "l24-1", "l24-2", "l25-0", "l25-1", "l25-2", "l26-0", "l26-1", "l26-2", "l27-0", "l27-1", "l27-2", "l28-0", "l28-1", "l28-2", "l29-0", "l29-1", "l29-2", "l30-0", "l30-1", "l30-2", "l31-0", "l31-1", "l31-2", "l32-0", "l32-1", "l32-2", "l33-0", "l33-1", "l33-2", "l34-0", "l34-1", "l34-2", "l35-0", "l35-1", "l35-2", "l36-0", "l36-1", "l36-2", "l37-0", "l37-1", "l37-2", "l38-0", "l38-1", "l38-2", "l39-0", "l39-1", "l39-2", "l40-0", "l40-1", "l40-2", "l41-0", "l41-1", "l41-2", "l42-0", "l42-1", "l42-2", "l43-0", "l43-1", "l43-2", "l44-0", "l44-1", "l44-2", "l45-0", "l45-1", "l45-2", "l46-0", "l46-1", "l46-2", "l47-0", "l47-1", "l47-2", "l48-0", "l48-1", "l48-2", "l49-0", "l49-1", "l49-2", "l50-0", "l50-1", "l50-2", "l51-0", "l51-1", "l51-2", "l52-0", "l52-1", "l52-2", "l53-0", "l53-1", "l53-2", "l54-0", "l54-1", "l54-2", "l55-0", "l55-1", "l55-2", "l56-0", "l56-1", "l56-2", "l57-0", "l57-1", "l57-2", "l58-0", "l58-1", "l58-2", "l59-0", "l59-1", "l59-2", "l60-0", "l60-1", "l60-2", "l61-0", "l61-1", "l61-2", "l62-0", "l62-1", "l62-2", "l63-0", "l63-1", "l63-2", "l64-0", "l64-1", "l64-2", "l65-0", "l65-1", "l65-2", "l66-0", "l66-1", "l66-2", "l67-0", "l67-1", "l67-2", "l68-0", "l68-1", "l68-2", "l69-0", "l69-1", "l69-2", "l70-0", "l70-1", "l70-2", "l71-0", "l71-1", "l71-2", "l72-0", "l72-1", "l72-2", "l73-0", "l73-1", "l73-2", "l74-0", "l74-1", "l74-2"],
  contentVer:"1d913ae673c9",
  langs:["cpp", "py", "cs"],
  quizzes:{"l1": "quiz1", "l2": "quiz2", "l3": "quiz3", "l4": "quiz4", "l5": "quiz5", "l6": "quiz6", "l7": "quiz7", "l8": "quiz8", "l9": "quiz9", "l10": "quiz10", "l11": "quiz11", "l12": "quiz12", "l13": "quiz13", "l14": "quiz14", "l15": "quiz15", "l16": "quiz16", "l17": "quiz17", "l18": "quiz18", "l19": "quiz19", "l20": "quiz20", "l21": "quiz21", "l22": "quiz22", "l23": "quiz23", "l24": "quiz24", "l25": "quiz25", "l26": "quiz26", "l27": "quiz27", "l28": "quiz28", "l29": "quiz29", "l30": "quiz30", "l31": "quiz31", "l32": "quiz32", "l33": "quiz33", "l34": "quiz34", "l35": "quiz35", "l36": "quiz36", "l37": "quiz37", "l38": "quiz38", "l39": "quiz39", "l40": "quiz40", "l41": "quiz41", "l42": "quiz42", "l43": "quiz43", "l44": "quiz44", "l45": "quiz45", "l46": "quiz46", "l47": "quiz47", "l48": "quiz48", "l49": "quiz49", "l50": "quiz50", "l51": "quiz51", "l52": "quiz52", "l53": "quiz53", "l54": "quiz54", "l55": "quiz55", "l56": "quiz56", "l57": "quiz57", "l58": "quiz58", "l59": "quiz59", "l60": "quiz60", "l61": "quiz61", "l62": "quiz62", "l63": "quiz63", "l64": "quiz64", "l65": "quiz65", "l66": "quiz66", "l67": "quiz67", "l68": "quiz68", "l69": "quiz69", "l70": "quiz70", "l71": "quiz71", "l72": "quiz72", "l73": "quiz73", "l74": "quiz74"}},
 {id:"hsg",name:"Luyện thi HSG & Tin học trẻ C++",mono:"HSG",url:"hsg/index.html",status:"soon",hue:"hsg",
  desc:"Lộ trình 24 tuần cho học sinh THPT ôn thi học sinh giỏi Tin học cấp tỉnh và Hội thi Tin học trẻ bảng C bằng C++: đọc ghi file, kỹ thuật mảng, tìm kiếm nhị phân, quy hoạch động, đồ thị và luyện đề 150 phút.",status:"open",
  chWord:"phần",
  chapters:5,
  lessons:[["l1", "Mục tiêu khóa học và vì sao chọn C++"], ["l2", "Cài đặt môi trường và công cụ chấm"], ["l3", "Khung chương trình thi"], ["l4", "Kiểu dữ liệu và tràn số"], ["l5", "Rẽ nhánh, vòng lặp, hàm"], ["l6", "Độ phức tạp thuật toán"], ["l7", "Sinh test và đối chiếu lời giải"], ["l8", "Số học 1: chia hết, ước, số nguyên tố, sàng Eratosthenes"], ["l9", "Số học 2: ƯCLN, BCNN, lũy thừa nhanh, modulo"], ["l10", "Xâu 1: duyệt ký tự, đếm tần suất, tách từ"], ["l11", "Xâu 2: đối xứng, chuẩn hóa, cộng trừ số lớn"], ["l12", "vector, pair và sắp xếp"], ["l13", "Mảng cộng dồn và mảng hiệu"], ["l14", "Tìm kiếm nhị phân trên mảng"], ["l15", "Tìm kiếm nhị phân trên kết quả"], ["l16", "Hai con trỏ và cửa sổ trượt"], ["l17", "Tham lam"], ["l18", "stack, queue, deque"], ["l19", "set, map, priority_queue"], ["l20", "Đệ quy và quay lui"], ["l21", "Quy hoạch động 1: trạng thái, công thức truy hồi, đếm cách"], ["l22", "Quy hoạch động 2: dãy con tăng dài nhất, cái túi 0/1"], ["l23", "Quy hoạch động 3: trên xâu và trên lưới"], ["l24", "Đồ thị: BFS và DFS"], ["l25", "Loang trên lưới"], ["l34", "Thi thử 3: đề HSG Bắc Giang 2023–2024 (150 phút)"], ["l26", "Chiến lược 150 phút và lấy subtask"], ["l28", "Chữa đề HSG 11 tỉnh khác"], ["l30", "Tổng ôn lỗi thường gặp"]],
  exercises:["l1-0", "l1-1", "l1-2", "l2-0", "l2-1", "l3-0", "l3-1", "l3-2", "l4-0", "l4-1", "l4-2", "l5-0", "l5-1", "l6-0", "l6-1", "l7-0", "l7-1", "l7-2", "l8-0", "l8-1", "l8-2", "l9-0", "l9-1", "l9-2", "l10-0", "l10-1", "l10-2", "l11-0", "l11-1", "l11-2", "l12-0", "l12-1", "l12-2", "l13-0", "l13-1", "l13-2", "l14-0", "l14-1", "l14-2", "l15-0", "l15-1", "l15-2", "l16-0", "l16-1", "l16-2", "l17-0", "l17-1", "l17-2", "l18-0", "l18-1", "l18-2", "l19-0", "l19-1", "l19-2", "l20-0", "l20-1", "l20-2", "l21-0", "l21-1", "l21-2", "l22-0", "l22-1", "l22-2", "l23-0", "l23-1", "l23-2", "l24-0", "l24-1", "l24-2", "l25-0", "l25-1", "l25-2", "l34-0", "l34-1", "l34-2", "l34-3", "l26-0", "l26-1", "l26-2", "l26-3", "l26-4", "l28-0", "l28-1", "l28-2", "l30-0", "l30-1", "l30-2"],
  practice:["l1-0", "l1-1", "l1-2", "l2-0", "l2-1", "l3-0", "l3-1", "l3-2", "l4-0", "l4-1", "l4-2", "l5-0", "l5-1", "l6-0", "l6-1", "l7-0", "l7-1", "l7-2", "l8-0", "l8-1", "l8-2", "l9-0", "l9-1", "l9-2", "l10-0", "l10-1", "l10-2", "l11-0", "l11-1", "l11-2", "l12-0", "l12-1", "l12-2", "l13-0", "l13-1", "l13-2", "l14-0", "l14-1", "l14-2", "l15-0", "l15-1", "l15-2", "l16-0", "l16-1", "l16-2", "l17-0", "l17-1", "l17-2", "l18-0", "l18-1", "l18-2", "l19-0", "l19-1", "l19-2", "l20-0", "l20-1", "l20-2", "l21-0", "l21-1", "l21-2", "l22-0", "l22-1", "l22-2", "l23-0", "l23-1", "l23-2", "l24-0", "l24-1", "l24-2", "l25-0", "l25-1", "l25-2", "l34-0", "l34-1", "l34-2", "l34-3", "l26-0", "l26-1", "l26-2", "l26-3", "l26-4", "l28-0", "l28-1", "l28-2", "l30-0", "l30-1", "l30-2"],
  contentVer:"956a2dd90e8e",
  langs:["cpp"],
  quizzes:{"l1": "quiz1", "l2": "quiz2", "l3": "quiz3", "l4": "quiz4", "l5": "quiz5", "l6": "quiz6", "l7": "quiz7", "l8": "quiz8", "l9": "quiz9", "l10": "quiz10", "l11": "quiz11", "l12": "quiz12", "l13": "quiz13", "l14": "quiz14", "l15": "quiz15", "l16": "quiz16", "l17": "quiz17", "l18": "quiz18", "l19": "quiz19", "l20": "quiz20", "l21": "quiz21", "l22": "quiz22", "l23": "quiz23", "l24": "quiz24", "l25": "quiz25", "l34": "quiz34", "l26": "quiz26", "l28": "quiz28", "l30": "quiz30"}},
 {id:"sql",name:"Cơ sở dữ liệu & SQL",mono:"SQL",url:"sql/index.html",status:"soon",hue:"sql",
  desc:"Thiết kế cơ sở dữ liệu và viết truy vấn SQL, từ bảng đầu tiên đến tối ưu hiệu năng.",chapters:null,lessons:[],exercises:[],practice:[],quizzes:{}},
 {id:"kcd",name:"Khí cụ điện thực hành",mono:"KCĐ",url:"kcd/index.html",status:"soon",hue:"kcd",
  desc:"Từ nhận biết thiết bị đến thiết kế tủ điều khiển: relay, contactor, timer, bảo vệ, mạch động cơ, có mô phỏng mạch trên web.",chapters:null,lessons:[],exercises:[],practice:[],quizzes:{}},
 {id:"nentang",name:"Nền tảng vi điều khiển – vi xử lý",mono:"NT",url:"nentang/index.html",status:"soon",hue:"nentang",
  desc:"Học trước khi vào 8051 hoặc 8086: dữ liệu số và phép toán bit, mạch nút – LED, CPU – bộ nhớ – bus, phương pháp debug và ghi lab.",chapters:null,lessons:[],exercises:[],practice:[],quizzes:{}},
 {id:"mcu8051",name:"Lập trình vi điều khiển 8051",mono:"8051",url:"mcu8051/index.html",status:"soon",hue:"mcu8051",
  desc:"Hợp ngữ 8051 trên chip AT89S52: thanh ghi, bộ nhớ, timer, ngắt, UART, LED 7 đoạn, LCD, bàn phím; trình mô phỏng có LED, LCD và đồ thị thời gian.",chapters:null,lessons:[],exercises:[],practice:[],quizzes:{}},
 {id:"mpu8086",name:"Kiến trúc và lập trình vi xử lý 8086",mono:"8086",url:"mpu8086/index.html",status:"soon",hue:"mpu8086",
  desc:"Hợp ngữ 8086 kiểu MASM/TASM: thanh ghi, phân đoạn bộ nhớ, ngăn xếp, lệnh chuỗi, DOS/BIOS, bus và ngoại vi 8255, 8253, 8259, 8251.",chapters:null,lessons:[],exercises:[],practice:[],quizzes:{}},
 {id:"csharp",name:"C# căn bản",mono:"C#",url:"csharp/index.html",status:"soon",hue:"cs",
  desc:"Lập trình hướng đối tượng với .NET.",chapters:null,lessons:[],exercises:[],practice:[],quizzes:{}},
 {id:"python",name:"Python cho người mới",mono:"Py",url:"python/index.html",status:"soon",hue:"py",
  desc:"Bắt đầu lập trình và xử lý dữ liệu.",chapters:null,lessons:[],exercises:[],practice:[],quizzes:{}},
 {id:"java",name:"Java từ đầu",mono:"Java",url:"java/index.html",status:"soon",hue:"java",
  desc:"Nền tảng Java và tư duy lập trình.",chapters:null,lessons:[],exercises:[],practice:[],quizzes:{}},
];
const courseById=id=>COURSES.find(c=>c.id===id);

const AMTS=(()=>{
  const FB_CONFIG={"apiKey": "AIzaSyBEz_fVVa2JgZyyXeZ7ziiO0vha1jzk82s", "authDomain": "amts-cpp.firebaseapp.com", "projectId": "amts-cpp", "storageBucket": "amts-cpp.firebasestorage.app", "messagingSenderId": "1008205171330", "appId": "1:1008205171330:web:ca3019bf0ff5adbbe9429b"};
  const TEACHERS=["congcau0910@gmail.com"];
  const ENV={"name": "prod", "label": ""};
  const FB_VER="10.14.1";
  const LEGACY=["lessons","visited","ex","quiz","lastLesson"]; // dạng dữ liệu cũ (chỉ có khóa C++)
  const S={mode:"off",user:null,auth:null,db:null,doc:null,err:"",saveErr:""};
  const subs=[];
  const emit=()=>subs.forEach(f=>{try{f(S)}catch(e){console.error(e)}});
  const empty=()=>({lessons:{},visited:{},ex:{},quiz:{},lastLesson:null});

  /* ---- lưu trên trình duyệt, theo từng khóa ---- */
  const LKEY=id=>"amts-progress-"+id;
  function getLocal(id){
    try{let s=localStorage.getItem(LKEY(id));
      if(!s&&id==="cpp"){s=localStorage.getItem("cpp-progress");if(s){localStorage.setItem(LKEY(id),s);localStorage.removeItem("cpp-progress")}}
      const o=s?JSON.parse(s):null;return o&&typeof o==="object"?Object.assign(empty(),o):empty()}catch(e){return empty()}
  }
  function setLocal(id,p){try{localStorage.setItem(LKEY(id),JSON.stringify(p))}catch(e){}}
  function clearLocal(){try{COURSES.forEach(c=>localStorage.removeItem(LKEY(c.id)));localStorage.removeItem("cpp-progress");
    // nội dung bài đã nhớ trên máy (amts-c:…): xóa hết khi đăng xuất để máy dùng chung không còn bài có phí
    Object.keys(localStorage).filter(k=>k.startsWith("amts-c")).forEach(k=>localStorage.removeItem(k))}catch(e){}}

  /* ---- gộp hai bản tiến độ (không làm mất kết quả nào) ---- */
  function merge(a,b){
    a=Object.assign(empty(),a);b=Object.assign(empty(),b);
    // lessons[l] > 0: thời điểm đánh dấu xong; < 0: thời điểm bỏ đánh dấu. Thao tác mới hơn thắng.
    for(const k in b.lessons){const x=b.lessons[k],y=a.lessons[k];if(y===undefined||Math.abs(x||0)>Math.abs(y||0))a.lessons[k]=x}
    for(const k in b.visited)a.visited[k]=Math.max(a.visited[k]||0,b.visited[k]||0);
    for(const k in b.ex){const x=b.ex[k],y=a.ex[k];if(!y||(x.pass&&!y.pass)||(x.pass===y.pass&&(x.at||0)>(y.at||0)))a.ex[k]=x}
    for(const k in b.quiz){const x=b.quiz[k],y=a.quiz[k];if(!y)a.quiz[k]=x;else{const l=(x.at||0)>(y.at||0)?x:y;a.quiz[k]={...l,best:Math.max(x.best||0,y.best||0)}}}
    // ngôn ngữ lập trình học viên chọn cho khóa (khóa nhiều ngôn ngữ): lựa chọn mới hơn thắng
    if(b.lang&&b.lang.l&&(!a.lang||(b.lang.at||0)>(a.lang.at||0)))a.lang={l:String(b.lang.l).slice(0,8),at:Number(b.lang.at)||0};
    if(b.lastLesson&&(!a.lastLesson||(b.visited[b.lastLesson]||0)>(a.visited[a.lastLesson]||0)))a.lastLesson=b.lastLesson;
    return a;
  }
  /* ---- đọc tiến độ một khóa từ tài liệu học viên (hiểu cả dạng cũ) ---- */
  function courseOf(doc,id){
    if(!doc)return null;
    if(doc.courses&&doc.courses[id])return Object.assign(empty(),doc.courses[id]);
    if(id==="cpp"&&LEGACY.some(k=>k in doc))return Object.assign(empty(),{lessons:doc.lessons||{},visited:doc.visited||{},ex:doc.ex||{},quiz:doc.quiz||{},lastLesson:doc.lastLesson||null});
    return null;
  }
  const hasLegacy=doc=>!!doc&&LEGACY.some(k=>k in doc);

  const isTeacher=()=>!!(S.user&&S.user.emailVerified&&TEACHERS.includes((S.user.email||"").toLowerCase()));
  const allowedHere=()=>(location.protocol==="https:"&&!/claude|anthropic/i.test(location.hostname))||["localhost","127.0.0.1"].includes(location.hostname);
  function loadScript(src){return new Promise((res,rej)=>{const s=document.createElement("script");s.src=src;s.async=false;s.onload=res;s.onerror=()=>rej(new Error(src));document.head.appendChild(s)})}

  async function init(){
    if(!allowedHere()){S.mode="unavailable";emit();return}
    S.mode="loading";emit();
    try{
      // ba thư viện tải song song (async=false giữ đúng thứ tự chạy app → auth → firestore)
      await Promise.all(["app","auth","firestore"].map(m=>loadScript(`https://cdn.jsdelivr.net/npm/firebase@${FB_VER}/firebase-${m}-compat.js`)));
      firebase.initializeApp(FB_CONFIG);S.auth=firebase.auth();S.db=firebase.firestore();S.mode="ready";
      // Biết đã đăng nhập hay chưa là đủ để kiểm tra quyền mở bài: báo ngay (authKnown).
      // Tiến độ users/{uid} đọc song song; đọc xong mới đặt docLoaded (saveCourse chờ cờ này nên không ghi đè máy chủ).
      S.auth.onAuthStateChanged(u=>{
        S.user=u;S.saveErr="";S.doc=null;S.docLoaded=false;enr=null;S.authKnown=true;emit();
        if(!u)return;const uid=u.uid;
        S.db.collection("users").doc(uid).get().then(snap=>{if(!S.user||S.user.uid!==uid)return;S.doc=snap.exists?snap.data():null;S.docLoaded=true;emit()},
          e=>{if(!S.user||S.user.uid!==uid)return;S.docLoaded=false;S.saveErr=e.code==="permission-denied"?"Firestore đang từ chối truy cập: hãy dán quy tắc bảo mật mới (firestore.rules) trong Firebase Console.":"Chưa tải được tiến độ từ máy chủ. Tiến độ vẫn được giữ trên trình duyệt này.";emit()});
      });
    }catch(e){console.error(e);S.mode="error";S.err="Không kết nối được dịch vụ đăng nhập. Kiểm tra Internet rồi tải lại trang.";emit()}
  }
  /* ---- ghi tiến độ một khóa; các khóa khác giữ nguyên ----
     Ghi trong transaction: đọc bản trên máy chủ, gộp với bản trên máy này rồi mới ghi,
     nên hai thiết bị học cùng lúc không ghi đè mất kết quả của nhau. Trả về bản đã gộp (hoặc null nếu lỗi). */
  async function saveCourse(id,data){
    const u=S.user;if(!u||!S.db||!S.docLoaded)return null;
    const FV=firebase.firestore.FieldValue,ref=S.db.collection("users").doc(u.uid);
    const profile={name:u.displayName||"",email:(u.email||"").toLowerCase(),photo:u.photoURL||"",lastSeen:FV.serverTimestamp()};
    const clean=x=>Object.assign({lessons:x.lessons||{},visited:x.visited||{},ex:x.ex||{},quiz:x.quiz||{},lastLesson:x.lastLesson||null},x.lang&&x.lang.l?{lang:{l:String(x.lang.l).slice(0,8),at:Number(x.lang.at)||0}}:{});
    try{
      let merged=null,docAfter=null;
      await S.db.runTransaction(async tx=>{
        const snap=await tx.get(ref);const doc=snap.exists?snap.data():null;
        const remote=courseOf(doc,id);merged=clean(remote?merge(remote,data):Object.assign(empty(),data));
        if(!doc){tx.set(ref,{...profile,createdAt:FV.serverTimestamp(),courses:{[id]:{...merged,updatedAt:FV.serverTimestamp()}}});docAfter={...profile,courses:{[id]:merged}};return}
        const upd={...profile,["courses."+id]:{...merged,updatedAt:FV.serverTimestamp()}};
        if(hasLegacy(doc)){ // chuyển dữ liệu cũ (dạng phẳng) vào courses.cpp rồi xóa các trường cũ trong cùng một lần ghi
          if(id!=="cpp")upd["courses.cpp"]={...courseOf(doc,"cpp"),updatedAt:FV.serverTimestamp()};
          LEGACY.forEach(k=>upd[k]=FV.delete())}
        tx.update(ref,upd);
        const nd={...doc};LEGACY.forEach(k=>delete nd[k]);nd.courses=Object.assign({},doc.courses,hasLegacy(doc)&&id!=="cpp"?{cpp:courseOf(doc,"cpp")}:{},{[id]:merged});docAfter=nd});
      S.doc=docAfter;
      if(S.saveErr){S.saveErr="";emit()}
      return merged;
    }catch(e){S.saveErr=e.code==="permission-denied"?"Firestore đang từ chối ghi: hãy dán quy tắc bảo mật mới (firestore.rules) trong Firebase Console.":"Chưa lưu được lên máy chủ, sẽ tự thử lại sau ít phút.";emit();return null}
  }
  async function signIn(){
    try{const p=new firebase.auth.GoogleAuthProvider();p.setCustomParameters({prompt:"select_account"});await S.auth.signInWithPopup(p);return ""}
    catch(e){if(e.code==="auth/popup-closed-by-user"||e.code==="auth/cancelled-popup-request")return "";
      const M={"auth/popup-blocked":"Trình duyệt đã chặn cửa sổ đăng nhập. Hãy cho phép cửa sổ bật lên (popup) cho trang này rồi thử lại.","auth/unauthorized-domain":`Tên miền ${location.hostname} chưa được thêm vào Authorized domains trong Firebase.`,"auth/network-request-failed":"Lỗi mạng, hãy kiểm tra Internet.","auth/operation-not-allowed":"Đăng nhập Google chưa được bật trong Firebase Authentication."};
      return M[e.code]||("Không đăng nhập được: "+(e.message||e.code))}
  }
  async function signOut(){await S.auth.signOut();clearLocal()}
  async function allUsers(){const snap=await S.db.collection("users").get();return snap.docs.map(d=>({uid:d.id,...d.data()}))}

  /* ---- quyền truy cập bài học: config/{khóa}, enroll/{uid}, content/{khóa}-{bài} ---- */
  const DEF_CFG={paidMode:false,loginFrom:16,paid:{},price:"",payInfo:"",bankName:"",accName:"",accNo:"",payContact:"",contentVer:"",activeVer:"",versions:{}};
  const defaultConfig=()=>JSON.parse(JSON.stringify(DEF_CFG));
  const cfgCache={};let enr=null,readyP=null;
  function ready(){return readyP||(readyP=new Promise(res=>{const ok=()=>S.mode==="unavailable"||S.mode==="error"||(S.mode==="ready"&&S.authKnown);
    if(ok())res(S);else subs.push(()=>{if(ok())res(S)})}))}
  async function getConfig(id,fresh){
    if(!fresh&&cfgCache[id])return cfgCache[id];
    const s=await S.db.collection("config").doc(id).get();
    const c=Object.assign(defaultConfig(),s.exists?s.data():{});c.exists=s.exists;return cfgCache[id]=c}
  async function saveConfig(id,c){
    const d={paidMode:!!c.paidMode,loginFrom:Number(c.loginFrom)||9999,paid:Object.assign({},c.paid||{}),price:String(c.price||"").slice(0,200),payInfo:String(c.payInfo||"").slice(0,2000),bankName:String(c.bankName||"").slice(0,120),accName:String(c.accName||"").slice(0,120),accNo:String(c.accNo||"").slice(0,60),payContact:String(c.payContact||"").slice(0,300),contentVer:String(c.contentVer||""),activeVer:String(c.activeVer||""),versions:cleanVersions(c.versions),updatedAt:firebase.firestore.FieldValue.serverTimestamp(),updatedBy:(S.user&&S.user.email)||""};
    await S.db.collection("config").doc(id).set(d);cfgCache[id]=Object.assign(defaultConfig(),d,{exists:true});return cfgCache[id]}
  async function isEnrolled(id){
    if(!S.user)return false;
    if(enr===null){try{const s=await S.db.collection("enroll").doc(S.user.uid).get();enr=s.exists?s.data():{}}catch(e){enr={}}}
    return enr[id]===true}
  const clearEnroll=()=>{enr=null};
  /* Nội dung theo phiên bản: content/{khóa}@{phiên bản}-{bài}. Trang đọc đúng phiên bản nó được build cùng;
     chưa có thì dùng bản mới nhất đã kiểm tra (activeVer), rồi tới bản cũ không phiên bản ({khóa}-{bài}). */
  const docId=(id,ver,l)=>ver?`${id}@${ver}-${l}`:`${id}-${l}`;
  function cleanVersions(v){const o={};if(v&&typeof v==="object")for(const k in v){if(!/^[\w.-]{1,40}$/.test(k))continue;const x=v[k]||{};
    o[k]={at:x.at||null,by:String(x.by||"").slice(0,120),n:Number(x.n)||0,lessons:Array.isArray(x.lessons)?x.lessons.filter(y=>/^l\d+$/.test(y)).slice(0,500):[],ok:x.ok===true}}return o}
  /* only: "exact" = chỉ đúng phiên bản; "rest" = bỏ qua đúng phiên bản (đã thử rồi); không ghi = thử lần lượt cả ba */
  async function getLesson(id,l,ver,cfg,only){
    const tries=only==="rest"?[]:[[ver,"exact"]];if(only!=="exact"){if(cfg&&cfg.activeVer&&cfg.activeVer!==ver)tries.push([cfg.activeVer,"active"]);tries.push(["","legacy"])}
    let denied=null;
    for(const [v,from] of tries){if(from!=="legacy"&&!v)continue;
      try{const s=await S.db.collection("content").doc(docId(id,v,l)).get();if(s.exists){const d=s.data();if(d&&d.html)return Object.assign({},d,{_from:from,_ver:v||d.ver||""})}}
      catch(e){if(e.code!=="permission-denied")throw e;denied=e}}
    if(denied)throw denied;return null}
  async function allEnroll(){const s=await S.db.collection("enroll").get();const m={};s.docs.forEach(d=>m[d.id]=d.data());return m}
  async function setEnroll(uid,id,on,info){const FV=firebase.firestore.FieldValue;
    await S.db.collection("enroll").doc(uid).set({[id]:!!on,email:(info&&info.email)||"",name:(info&&info.name)||"",["at_"+id]:FV.serverTimestamp(),["by_"+id]:(S.user&&S.user.email)||""},{merge:true})}
  /* ---- sao lưu / khôi phục toàn bộ (chỉ giảng viên) ---- */
  async function dump(col){const s=await S.db.collection(col).get();const m={};s.docs.forEach(d=>m[d.id]=d.data());return m}
  async function restoreDoc(col,id,data){await S.db.collection(col).doc(id).set(data)}
  /* Tải một phiên bản nội dung lên (không ghi đè phiên bản đang dùng), đọc lại kiểm tra đủ bài, rồi ghi vào danh sách phiên bản */
  /* lời giải theo ngôn ngữ khác C++ (khóa nhiều ngôn ngữ): {py:[...], cs:[...]} */
  const solsOf=L=>{const o={};const x=L.sols&&typeof L.sols==="object"?L.sols:{};["cs","py"].forEach(k=>{if(Array.isArray(x[k]))o[k]=x[k].map(String)});return o};
  /* so sánh khi kiểm tra lại: Firestore KHÔNG giữ thứ tự khóa của map (đọc lại có thể ra {py, cs}), nên sắp khóa trước khi so */
  const solsKey=o=>JSON.stringify(Object.keys(o||{}).sort().map(k=>[k,o[k]]));
  async function uploadContent(pkg,onProg){
    if(!pkg||!pkg.course||!Array.isArray(pkg.lessons)||!pkg.ver||!/^[\w.-]{1,40}$/.test(pkg.ver))throw new Error("File không đúng định dạng nội dung bài học.");
    for(const L of pkg.lessons)if(!/^l\d+$/.test(L.id)||typeof L.html!=="string")throw new Error("Bài "+L.id+" không hợp lệ.");
    const FV=firebase.firestore.FieldValue,col=S.db.collection("content");let k=0;const tot=pkg.lessons.length*2;
    for(const L of pkg.lessons){
      await col.doc(docId(pkg.course,pkg.ver,L.id)).set({course:pkg.course,lesson:L.id,order:Number(L.order)||0,title:String(L.title||""),html:L.html,sol:Array.isArray(L.sol)?L.sol.map(String):[],sols:solsOf(L),ver:pkg.ver,updatedAt:FV.serverTimestamp()});
      onProg&&onProg(++k,tot,"upload")}
    const bad=[];
    for(const L of pkg.lessons){const s=await col.doc(docId(pkg.course,pkg.ver,L.id)).get();const d=s.exists?s.data():null;
      if(!d||d.html!==L.html||d.ver!==pkg.ver||JSON.stringify(d.sol||[])!==JSON.stringify(Array.isArray(L.sol)?L.sol.map(String):[])||solsKey(d.sols)!==solsKey(solsOf(L)))bad.push(L.id);onProg&&onProg(++k,tot,"verify")}
    if(bad.length)throw new Error(`Kiểm tra sau khi tải lên thấy ${bad.length} bài chưa đúng (${bad.join(", ")}). Hãy tải lại; phiên bản đang dùng không bị ảnh hưởng.`);
    const cur=await getConfig(pkg.course,true);
    cur.versions=Object.assign({},cur.versions||{},{[pkg.ver]:{at:new Date().toISOString(),by:(S.user&&S.user.email)||"",n:pkg.lessons.length,lessons:pkg.lessons.map(L=>L.id),ok:true}});
    cur.activeVer=pkg.ver;cur.contentVer=pkg.ver;await saveConfig(pkg.course,cur);
    return pkg.lessons.length}
  /* Xóa một phiên bản cũ ("" = bản không phiên bản {khóa}-{bài}) */
  async function deleteVersion(id,ver,lessons){
    const col=S.db.collection("content");for(const l of lessons)await col.doc(docId(id,ver,l)).delete();
    if(ver){const cur=await getConfig(id,true);const v=Object.assign({},cur.versions||{});delete v[ver];cur.versions=v;await saveConfig(id,cur)}}
  /* "Tôi đã chuyển khoản": học viên gửi yêu cầu kiểm tra (payreq/{uid}); không tự mở quyền học */
  async function payReqOf(id){if(!S.user||!S.db)return null;try{const s=await S.db.collection("payreq").doc(S.user.uid).get();const c=s.exists&&s.data().courses;return c&&c[id]?c[id]:null}catch(e){return null}}
  async function requestPay(id){const u=S.user;if(!u||!S.db){const e=new Error("Cần đăng nhập");e.code="login";throw e}
    const ref=S.db.collection("payreq").doc(u.uid);let cur={};try{const s=await ref.get();if(s.exists)cur=s.data().courses||{}}catch(e){}
    const courses=Object.assign({},cur,{[id]:firebase.firestore.FieldValue.serverTimestamp()});
    await ref.set({email:(u.email||"").toLowerCase(),name:u.displayName||"",courses});return true}
  async function allPayReq(){const s=await S.db.collection("payreq").get();const m={};s.docs.forEach(d=>m[d.id]=d.data());return m}
  async function clearPayReq(uid,id){const ref=S.db.collection("payreq").doc(uid);const s=await ref.get();if(!s.exists)return;const d=s.data(),c=Object.assign({},d.courses||{});delete c[id];
    if(Object.keys(c).length)await ref.set(Object.assign({},d,{courses:c}));else await ref.delete()}
  /* "Nhận thông báo" cho khóa sắp ra mắt: lưu trong users/{uid}.courses.{khóa}.notify (không cần đổi rules) */
  const notifyOf=id=>!!(S.doc&&S.doc.courses&&S.doc.courses[id]&&S.doc.courses[id].notify);
  async function setNotify(id,on){const u=S.user;if(!u||!S.db){const e=new Error("Cần đăng nhập");e.code="login";throw e}
    const ref=S.db.collection("users").doc(u.uid),cur=(S.doc&&S.doc.courses&&S.doc.courses[id])||{};
    const val=Object.assign({},cur,{notify:!!on,notifyAt:Date.now()});
    try{await ref.update({["courses."+id]:val})}
    catch(e){if(e.code!=="not-found")throw e;await ref.set({name:u.displayName||"",email:(u.email||"").toLowerCase(),photo:u.photoURL||"",courses:{[id]:val}},{merge:true})}
    S.doc=Object.assign({},S.doc||{});S.doc.courses=Object.assign({},S.doc.courses||{},{[id]:val});emit()}
  /* Tiến độ 3 mức của một bài: 0 chưa học · 1 Đã đọc · 2 Đã làm bài tập (đạt ≥ 2/3 bài tập) · 3 Đạt kiểm tra (bài tập ≥ 2/3 và trắc nghiệm ≥ 3/4).
     Bài không có bài tập/trắc nghiệm thì bỏ qua điều kiện đó. "Hoàn thành" = Đạt kiểm tra HOẶC học viên tự bấm "Đánh dấu đã học xong". */
  const PASS_EX=2/3,PASS_QUIZ=3/4;
  function detailOf(p,l,cid){const c=courseById(cid||"cpp")||{},ex=(c.exercises||[]).filter(k=>k.startsWith(l+"-")),qid=(c.quizzes||{})[l];
    const pass=p?ex.filter(k=>((p.ex||{})[k]||{}).pass).length:0,q=p&&qid?(p.quiz||{})[qid]:null;
    const exOk=!ex.length||pass>=Math.ceil(ex.length*PASS_EX-1e-9),qOk=!qid||!!(q&&q.total&&(q.best||0)/q.total>=PASS_QUIZ-1e-9);
    const read=!!(p&&p.visited&&p.visited[l]),manual=!!(p&&p.lessons&&(p.lessons[l]||0)>0);
    const level=(ex.length||qid)&&exOk&&qOk?3:ex.length&&exOk?2:read||pass||q?1:0;
    return{level,read,manual,exTotal:ex.length,exPass:pass,quiz:q?{best:q.best||0,total:q.total}:null,hasQuiz:!!qid,exOk,qOk}}
  const levelOf=(p,l,cid)=>detailOf(p,l,cid).level;
  const isDone=(p,l,cid)=>{const d=detailOf(p,l,cid);return d.manual||d.level===3};
  return{S,TEACHERS,ENV,PROJECT:FB_CONFIG.projectId,init,isDone,levelOf,detailOf,on:f=>{subs.push(f);f(S)},getLocal,setLocal,clearLocal,merge,courseOf,saveCourse,signIn,signOut,isTeacher,allUsers,empty,
    notifyOf,setNotify,payReqOf,requestPay,allPayReq,clearPayReq,dump,restoreDoc,ready,defaultConfig,getConfig,saveConfig,isEnrolled,clearEnroll,getLesson,allEnroll,setEnroll,uploadContent,deleteVersion,docId};
})();
/* tiện ích dùng chung */
const escH=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function avatarHTML(u){const ini=(u.displayName||u.email||"?").trim()[0].toUpperCase();
  return `<span class="ava">${escH(ini)}${u.photoURL?`<img src="${escH(u.photoURL)}" alt="" referrerpolicy="no-referrer" onerror="this.remove()">`:""}</span>`}
