/* ================= THANH ĐIỀU HƯỚNG CHUNG (trang chủ + trang khóa học) =================
   Khung HTML: platform/partials/topnav.html · CSS: platform/css/07-topnav.css */
const IC={doc:'<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h4"/></svg>',
  book:'<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 7h8M8 11h8M8 15h5"/></svg>',
  bell:'<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9a6 6 0 1 1 12 0c0 6 2.5 7.5 2.5 7.5h-17S6 15 6 9z"/><path d="M10 20a2 2 0 0 0 4 0"/></svg>',
  check:'<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>',
  arrow:'<span aria-hidden="true">→</span>',chev:'<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true" style="width:16px;height:16px"><path d="m6 9 6 6 6-6"/></svg>'};
const TOPNAV=(()=>{
  const top=document.getElementById("top"),ROOT=(top&&top.dataset.root)||"";
  const opts={signOut:null};
  const seen=()=>{try{return JSON.parse(localStorage.getItem("amts-notif-seen")||"{}")}catch(e){return{}}};
  function wireMenu(bid,mid,onOpen){const b=document.getElementById(bid),m=document.getElementById(mid);if(!b||!m)return;
    b.onclick=e=>{e.stopPropagation();const o=m.hidden;closeMenus();if(o){m.hidden=false;b.setAttribute("aria-expanded","true");onOpen&&onOpen();const f=m.querySelector("a,button");if(f&&e.detail===0)f.focus()}}}
  function closeMenus(except){document.querySelectorAll(".menu").forEach(m=>{if(m!==except)m.hidden=true});
    document.querySelectorAll("[aria-haspopup]").forEach(b=>{if(!except||b.getAttribute("aria-controls")!==except.id)b.setAttribute("aria-expanded","false")})}
  document.addEventListener("click",e=>{if(!e.target.closest(".menu"))closeMenus();if(top&&!e.target.closest("#top"))setOpen(false)});
  document.addEventListener("keydown",e=>{if(e.key!=="Escape")return;const open=document.querySelector(".menu:not([hidden])");
    if(open){const b=document.querySelector(`[aria-controls="${open.id}"]`);closeMenus();if(b)b.focus()}else if(top&&top.classList.contains("open")){setOpen(false);document.getElementById("nav-menu").focus()}});
  function setOpen(o){if(!top)return;top.classList.toggle("open",o);const b=document.getElementById("nav-menu");if(b)b.setAttribute("aria-expanded",String(o))}
  const mb=document.getElementById("nav-menu");if(mb)mb.onclick=e=>{e.stopPropagation();setOpen(!top.classList.contains("open"))};
  wireMenu("nav-docs","m-docs");
  {const nv=document.getElementById("mainnav");if(nv)nv.addEventListener("click",e=>{if(e.target.closest("a")){setOpen(false);closeMenus()}})}
  function setActive(k){document.querySelectorAll("#mainnav [data-nav]").forEach(a=>{if(a.dataset.nav===k)a.setAttribute("aria-current","page");else a.removeAttribute("aria-current")})}
  /* Thực hành: trang Thực hành của khóa đang mở */
  function practiceHref(){const c=(typeof CID!=="undefined"&&courseById(CID))||COURSES.find(x=>x.status==="open");if(!c)return ROOT+"index.html";return ROOT+c.url+"#thuc-hanh"}
  function render(){
    const el=document.getElementById("topacct");if(!el)return;const S=AMTS.S;
    const subs=COURSES.filter(c=>AMTS.notifyOf(c.id)),sn=seen(),fresh=subs.filter(c=>c.status==="open"&&!sn[c.id]);
    const notif=`<div class="navdd"><button class="iconbtn" id="b-bell" aria-haspopup="true" aria-expanded="false" aria-controls="m-bell" aria-label="Thông báo${fresh.length?` (${fresh.length} mới)`:""}">${IC.bell}${fresh.length?'<span class="dot" aria-hidden="true"></span>':""}</button>
      <div class="menu right notif" id="m-bell" hidden><b class="m-h">Thông báo</b>${subs.length?subs.map(c=>c.status==="open"?`<p class="new">${escH(c.name)} đã mở! <a href="${escH(ROOT+c.url)}">Vào học →</a></p>`:`<p>Bạn sẽ được báo khi <b>${escH(c.name)}</b> mở.</p>`).join("")
        :`<p>Bạn chưa có thông báo mới.</p><p class="note">Bấm “Nhận thông báo” ở một khóa sắp ra mắt để được báo khi khóa mở.</p>`}</div></div>`;
    let h="";
    if(S.mode==="unavailable")h="";
    else if(S.mode==="loading"||S.mode==="off")h=`<span class="note">Đang kết nối…</span>`;
    else if(S.mode==="error")h=`<span class="note bad-t">${escH(S.err)}</span>`;
    else if(!S.user)h=notif+`<button class="gbtn" id="btn-in"><span class="g">G</span>Đăng nhập</button>`;
    else{const u=S.user;
      h=notif+`<div class="navdd"><button class="avabtn" id="b-me" aria-haspopup="true" aria-expanded="false" aria-controls="m-me" aria-label="Tài khoản: ${escH(u.displayName||u.email||"")}">${avatarHTML(u)}${IC.chev}</button>
        <div class="menu right" id="m-me" hidden><div class="who">${avatarHTML(u)}<div><b>${escH(u.displayName||"Học viên")}</b><small>${escH(u.email||"")}</small></div></div>
          ${AMTS.isTeacher()?`<a href="${ROOT}index.html#giang-vien">Trang giảng viên<small>Tiến độ học viên, học phí, nội dung</small></a>`:""}
          ${S.saveErr?`<p class="note bad-t" style="padding:6px 12px">${escH(S.saveErr)}</p>`:""}
          <button type="button" id="btn-out">Đăng xuất</button></div></div>`}
    el.innerHTML=h+`<span class="note bad-t" id="acct-msg" aria-live="polite"></span>`;
    const bi=document.getElementById("btn-in");if(bi)bi.onclick=async()=>{const m=await AMTS.signIn();document.getElementById("acct-msg").textContent=m};
    const bo=document.getElementById("btn-out");if(bo)bo.onclick=async()=>{if(opts.signOut)return opts.signOut();await AMTS.signOut();if(window.renderAll)renderAll();else render()};
    wireMenu("b-bell","m-bell",()=>{const s=seen();subs.forEach(c=>{if(c.status==="open")s[c.id]=1});try{localStorage.setItem("amts-notif-seen",JSON.stringify(s))}catch(e){}});
    wireMenu("b-me","m-me");
    const pr=document.getElementById("nav-practice");if(pr)pr.href=practiceHref();
  }
  return{render,setActive,closeMenus,wireMenu,opts,practiceHref,ROOT};
})();
const closeMenus=TOPNAV.closeMenus,wireMenu=TOPNAV.wireMenu;

/* ================= TRANG CHỦ ================= */
function progressOf(id){
  const local=AMTS.getLocal(id),S=AMTS.S;
  const remote=S.user&&S.docLoaded?AMTS.courseOf(S.doc,id):null;
  return remote?AMTS.merge(remote,local):local;
}
let PUB={},pubAsked=false;
/* ---------- ảnh minh họa từng ngôn ngữ (SVG tự vẽ, không dùng logo chính thức) ---------- */
/* ảnh của designer (assets/courses/<khóa>/card|card-square|hero) — build điền vào; khóa nào chưa có thì dùng ảnh do code vẽ bên dưới */
const ASSETS={"cpp": {"card": {"src": "assets/courses/cpp/card.webp"}, "card-square": {"src": "assets/courses/cpp/card-square.webp"}, "hero": {"src": "assets/courses/cpp/hero.webp"}}, "algo": {"card": {"src": "assets/courses/algo/card.webp"}, "card-square": {"src": "assets/courses/algo/card-square.webp"}, "hero": {"src": "assets/courses/algo/hero.webp"}}, "sql": {"card": {"src": "assets/courses/sql/card.webp"}, "card-square": {"src": "assets/courses/sql/card-square.webp"}, "hero": {"src": "assets/courses/sql/hero.webp"}}, "kcd": {"card": {"src": "assets/courses/kcd/card.webp"}, "card-square": {"src": "assets/courses/kcd/card-square.webp"}, "hero": {"src": "assets/courses/kcd/hero.webp"}}, "nentang": {"card": {"src": "assets/courses/nentang/card.webp"}, "card-square": {"src": "assets/courses/nentang/card-square.webp"}, "hero": {"src": "assets/courses/nentang/hero.webp"}}, "mcu8051": {"card": {"src": "assets/courses/mcu8051/card.webp"}, "card-square": {"src": "assets/courses/mcu8051/card-square.webp"}, "hero": {"src": "assets/courses/mcu8051/hero.webp"}}, "mpu8086": {"card": {"src": "assets/courses/mpu8086/card.webp"}, "card-square": {"src": "assets/courses/mpu8086/card-square.webp"}, "hero": {"src": "assets/courses/mpu8086/hero.webp"}}, "csharp": {"card": {"src": "assets/courses/csharp/card.webp"}, "card-square": {"src": "assets/courses/csharp/card-square.webp"}, "hero": {"src": "assets/courses/csharp/hero.webp"}}, "python": {"card": {"src": "assets/courses/python/card.webp"}, "card-square": {"src": "assets/courses/python/card-square.webp"}, "hero": {"src": "assets/courses/python/hero.webp"}}, "java": {"card": {"src": "assets/courses/java/card.webp"}, "card-square": {"src": "assets/courses/java/card-square.webp"}, "hero": {"src": "assets/courses/java/hero.webp"}}};
/* mục lục dự kiến của khóa sắp ra mắt (courses/<khóa>/syllabus.json) — build điền vào */
/* mục lục khóa sắp ra mắt: SYL là chỉ mục gọn (số chương/bài, chữ để tìm, file đầy đủ); bản đầy đủ tải khi mở hộp mục lục */
const SYL={"algo": {"n": {"ch": 14, "l": 74}, "q": "Nhập môn giải thuật Giải thuật là gì? Từ công thức nấu ăn đến chương trình Mô tả giải thuật bằng các bước, mã giả và lưu đồ Tính đúng: bất biến vòng lặp và kiểm thử Đo thời gian chạy bằng cách đếm phép toán Độ phức tạp Big-O, Big-Θ, Big-Ω Độ phức tạp bộ nhớ và cách đọc giới hạn của đề bài Mảng và các kỹ thuật cơ bản Mảng, vector và chỉ số Duyệt mảng: đếm, tính tổng, tìm lớn nhất và nhỏ nhất Mảng cộng dồn (prefix sum) Mảng hiệu (difference array) Kỹ thuật hai con trỏ Kỹ thuật cửa sổ trượt Tìm kiếm và sắp xếp Tìm kiếm tuần tự Tìm kiếm nhị phân Tìm kiếm nhị phân trên đáp án Sắp xếp chọn, chèn và nổi bọt Sắp xếp trộn (merge sort) Sắp xếp nhanh (quick sort) Sắp xếp đếm, tính ổn định và hàm sort() của STL Đệ quy, chia để trị và quay lui Ôn đệ quy: điều kiện dừng và cây lời gọi Chia để trị Quay lui: sinh tổ hợp và hoán vị Quay lui có cắt nhánh: bài toán N quân hậu Đệ quy có nhớ (memoization) Cấu trúc dữ liệu tuyến tính Danh sách liên kết Ngăn xếp (stack) và bài toán kiểm tra dấu ngoặc Hàng đợi (queue) và hàng đợi hai đầu (deque) Ngăn xếp đơn điệu Hàng đợi đơn điệu: giá trị lớn nhất trong cửa sổ trượt Bảng băm và tập hợp Bảng băm hoạt động ra sao; va chạm và cách xử lý unordered_map và unordered_set set và map (cây cân bằng) so với bảng băm Bài toán đếm tần suất và tìm cặp có tổng cho trước Băm chuỗi Cây và hàng đợi ưu tiên Cây, cây nhị phân và các cách duyệt cây Cây nhị phân tìm kiếm (BST) Đống (heap) và priority_queue Hợp nhất tập hợp (Disjoint Set Union) Cây tiền tố (trie) Tham lam Ý tưởng tham lam và khi nào nó đúng Bài toán chọn hoạt động và xếp lịch Chứng minh tham lam bằng lập luận hoán đổi Mã Huffman Quy hoạch động Từ đệ quy có nhớ đến quy hoạch động Trạng thái và công thức truy hồi qua bài leo cầu thang Dãy con tăng dài nhất (LIS) Xâu con chung dài nhất (LCS) và khoảng cách sửa Bài toán cái túi Quy hoạch động trên lưới Truy vết để in ra lời giải Đồ thị cơ bản Đồ thị và các cách biểu diễn BFS và đường đi ngắn nhất không trọng số DFS và thành phần liên thông Sắp xếp tô pô Phát hiện chu trình và đồ thị hai phía Đường đi ngắn nhất và cây khung Thuật toán Dijkstra Thuật toán Bellman-Ford và chu trình âm Thuật toán Floyd-Warshall Cây khung nhỏ nhất: Kruskal và Prim Cấu trúc dữ liệu nâng cao Bảng thưa (sparse table) Cây Fenwick (BIT) Cây phân đoạn (segment tree) Cập nhật lười (lazy propagation) Tổ tiên chung gần nhất (LCA) Toán và xử lý chuỗi Số nguyên tố và sàng Eratosthenes Ước chung lớn nhất, bội chung nhỏ nhất, đồng dư và lũy thừa nhanh Tổ hợp và nghịch đảo modulo So khớp chuỗi: KMP và Z-function Quy hoạch động nâng cao và tổng kết Quy hoạch động trạng thái bit (bitmask) Quy hoạch động trên cây Quy hoạch động chữ số Tiếp cận một bài toán lạ: từ trâu bò đến tối ưu Kiểm thử đối chiếu (stress test) và gỡ lỗi Dự án cuối khóa: bộ đề luyện thi và phỏng vấn tổng hợp", "f": "assets/app/syl-algo.11c02e55b4.json"}, "sql": {"n": {"ch": 13, "l": 71}, "q": "Nhập môn cơ sở dữ liệu Dữ liệu, cơ sở dữ liệu và hệ quản trị cơ sở dữ liệu Vì sao không chỉ dùng Excel? Dữ liệu lặp, sai lệch và mất mát Mô hình quan hệ: bảng, dòng, cột và giá trị Cài đặt SQLite, PostgreSQL và công cụ quản lý Câu lệnh SQL đầu tiên và cách đọc kết quả Truy vấn một bảng SELECT và FROM: chọn cột cần lấy WHERE: lọc dòng với so sánh và AND / OR / NOT BETWEEN, IN, LIKE: các điều kiện hay dùng NULL – giá trị “chưa biết” và IS NULL ORDER BY, LIMIT / OFFSET: sắp xếp và phân trang DISTINCT, bí danh AS và cột tính toán Kiểu dữ liệu và hàm dựng sẵn Kiểu số, chuỗi, ngày giờ và logic Hàm xử lý chuỗi: UPPER, LOWER, SUBSTRING, TRIM, nối chuỗi Hàm ngày giờ và tính khoảng thời gian CASE WHEN: rẽ nhánh trong truy vấn COALESCE, NULLIF và ép kiểu CAST Gom nhóm và thống kê Hàm tổng hợp COUNT, SUM, AVG, MIN, MAX GROUP BY: thống kê theo nhóm HAVING khác WHERE thế nào Thứ tự thực thi logic của một câu SELECT Thực hành: báo cáo doanh thu theo tháng Kết nối bảng với JOIN Khóa chính, khóa ngoại và quan hệ giữa các bảng INNER JOIN LEFT, RIGHT và FULL OUTER JOIN Self join và cross join Lỗi JOIN thường gặp: nhân bản dòng, mất dòng UNION, INTERSECT, EXCEPT Truy vấn con và CTE Truy vấn con trong WHERE, FROM và SELECT EXISTS và NOT EXISTS Truy vấn con tương quan CTE với WITH: đặt tên cho từng bước CTE đệ quy: dữ liệu dạng cây (danh mục, sơ đồ tổ chức) Tạo bảng và thay đổi dữ liệu CREATE TABLE và chọn kiểu dữ liệu phù hợp Ràng buộc NOT NULL, UNIQUE, CHECK, DEFAULT Khóa ngoại và ON DELETE / ON UPDATE INSERT, UPDATE, DELETE an toàn ALTER TABLE và quản lý thay đổi cấu trúc (migration) View: lưu một truy vấn thành bảng ảo Thiết kế cơ sở dữ liệu Phân tích yêu cầu: thực thể, thuộc tính, mối quan hệ Sơ đồ ERD và các kiểu quan hệ 1–1, 1–n, n–n Chuyển ERD thành bảng Dị thường dữ liệu và phụ thuộc hàm Chuẩn hóa 1NF, 2NF, 3NF và BCNF Khi nào nên phi chuẩn hóa Dự án: thiết kế cơ sở dữ liệu quản lý trường học Window function OVER và PARTITION BY ROW_NUMBER, RANK, DENSE_RANK LAG, LEAD: so sánh với dòng trước và sau Tổng lũy kế và trung bình trượt Bài toán top N trong mỗi nhóm Chỉ mục và tối ưu truy vấn Dữ liệu được lưu trên đĩa thế nào: trang và khối Chỉ mục B-tree hoạt động ra sao Chỉ mục nhiều cột và chỉ mục bao phủ Đọc kế hoạch thực thi với EXPLAIN Viết truy vấn tận dụng được chỉ mục Khi nào chỉ mục làm hệ thống chậm đi Giao dịch và truy cập đồng thời Giao dịch: BEGIN, COMMIT, ROLLBACK Bốn tính chất ACID Đọc bẩn, đọc không lặp lại và bóng ma Các mức cô lập (isolation level) Khóa, deadlock và MVCC Lập trình trong cơ sở dữ liệu và bảo mật Stored procedure và function Trigger Người dùng, vai trò và GRANT / REVOKE SQL injection và câu lệnh tham số hóa Sao lưu và phục hồi dữ liệu Cơ sở dữ liệu trong ứng dụng thực tế Kết nối cơ sở dữ liệu từ chương trình C++ ORM: tiện lợi và bẫy N+1 truy vấn NoSQL (document, key-value): khi nào nên dùng Nhân bản (replication) và phân mảnh (sharding) – tổng quan Dự án cuối khóa: cơ sở dữ liệu cửa hàng trực tuyến, từ thiết kế đến báo cáo", "f": "assets/app/syl-sql.0ba51d79bc.json"}, "kcd": {"n": {"ch": 18, "l": 159}, "q": "Nhập môn và an toàn điện Khí cụ điện trong một máy tự động Phân biệt mạch động lực và mạch điều khiển Nhận diện nguy cơ Ngắt và cô lập nguồn Xác nhận không còn điện PE, nối đất bảo vệ và dây trung tính Điều kiện an toàn của bàn thực hành Xử lý tình huống bất thường Nền tảng điện cho người mới Điện áp, dòng điện, điện trở Định luật Ohm Nguồn AC và DC Mạch nối tiếp và song song Công suất và điện năng Điện một pha và ba pha Tải điện trở, điện cảm và điện dung Trạng thái mạch Ký hiệu và đọc bản vẽ điện Các loại bản vẽ Tiếp điểm NO/NC Ký hiệu cuộn dây, nút nhấn, contactor, CB, cầu chì và động cơ Mã thiết bị và chú giải bản vẽ Số đầu cực Đánh số dây, terminal và tham chiếu trang Liên hệ cuộn dây với tiếp điểm Phân tích một mạch Start/Stop Thiết bị thao tác và báo hiệu Nút nhấn nhả về và nút nhấn giữ trạng thái Khối tiếp điểm NO/NC Selector 2/3 vị trí Công tắc hành trình và microswitch Nút dừng khẩn Đèn báo, còi và đèn tháp Đọc nhãn và kiểm tra tiếp điểm Thiết kế bảng thao tác đơn giản Relay trung gian và relay bán dẫn Relay điện từ Cuộn AC/DC Tiếp điểm chuyển đổi Đế relay và sơ đồ chân Tải tiếp điểm Dập xung cuộn dây Relay bán dẫn (SSR) Lỗi thường gặp Contactor và khởi động từ Cấu tạo contactor Nguyên lý hút/nhả Contactor AC/DC Sơ đồ đầu cực Cấp sử dụng Chọn theo điện áp, tải và tần suất đóng cắt Phụ kiện Cụm khởi động động cơ Hư hỏng Timer, bộ đếm và relay giám sát Tham số thời gian ON-delay OFF-delay Interval, pulse và cyclic Timer đa chức năng Bộ đếm Relay giám sát Hành vi sau mất nguồn Cầu dao, cách ly, cầu chì và CB Dao cách ly, cầu dao phụ tải và switch-disconnector Cầu chì Nhóm cầu chì MCB MCCB Thiết bị AC/DC Khả năng cắt và dòng ngắn mạch dự kiến Chọn lọc và phối hợp bảo vệ Phân nhánh tủ máy Bảo vệ động cơ và bảo vệ dòng rò Relay nhiệt Dải chỉnh và cấp tác động Tiếp điểm trip và reset MPCB và bảo vệ động cơ điện tử Mất pha, kẹt tải và quá tải RCD, RCCB và RCBO Chọn bảo vệ dòng rò theo ứng dụng Thiết bị chống sét lan truyền (SPD) Ma trận bảo vệ Nguồn 24 VDC và phân phối điện điều khiển Bộ nguồn AC/DC Đọc thông số nguồn Bảng tải 24 VDC Dòng tức thời và dự phòng Phân nhánh DC 0 V, PE và nối đất tín hiệu Sụt áp đường dây Nguồn dự phòng, UPS DC và module redundancy Dây dẫn, terminal và phụ kiện tủ điện Dây đơn, dây mềm, cáp nhiều lõi Chọn tiết diện Đầu cos và ferrule Terminal Cầu nối, end stop, end plate và marker DIN rail, máng dây và cable gland Thanh PE, phân phối nguồn và che chắn Quạt, lọc gió, thermostat và heater Nhãn thiết bị, nhãn dây và mã cáp Mạch điều khiển động cơ cơ bản Đọc nhãn động cơ Mạch khởi động trực tiếp (DOL) Start/Stop và tự giữ Điều khiển từ hai vị trí Đèn Ready/Run/Fault Đảo chiều động cơ Chuyển chiều và điều kiện dừng Sao–tam giác Trình tự sao–ngắt–tam giác Manual/Auto và chạy tuần tự Kết nối khí cụ điện với PLC và thiết bị điện tử Tiếp điểm khô và tín hiệu có điện áp Digital input PNP/NPN, sourcing/sinking và chân COM Digital output relay/transistor Relay trung gian giữa PLC và tải Cuộn contactor và van điện từ Phản hồi contactor Biến tần và khởi động mềm Nhập môn mạch an toàn Đọc datasheet và lựa chọn thiết bị Cấu trúc mã hàng Datasheet, manual và catalog Thông số định mức Môi trường Tuổi thọ điện/cơ Lựa chọn cho tải động cơ, cuộn điện từ và tải điện trở Thay thế tương đương Phối hợp thiết bị Hồ sơ quyết định Thiết kế sơ bộ tủ điều khiển Thu thập yêu cầu Danh sách tải và I/O Kiến trúc cấp nguồn Sơ đồ động lực Sơ đồ điều khiển Bố trí trong tủ Nhiệt và môi trường Lập BOM Kiểm tra chéo Quản lý phiên bản Lắp ráp, kiểm tra và chạy thử Chuẩn bị Lắp cơ khí Chuẩn bị dây Đấu nối Kiểm tra khi chưa cấp nguồn Thử nghiệm cách điện Kế hoạch cấp nguồn Kiểm tra chức năng Biên bản nghiệm thu thực hành Chẩn đoán lỗi và bảo trì Phương pháp tìm lỗi Contactor không hút Chỉ chạy khi giữ Start Không dừng theo lệnh Relay nhiệt/CB tác động Timer sai trình tự Nguồn 24 VDC sụt hoặc dao động Lỗi chập chờn Bảo trì phòng ngừa Báo cáo lỗi Đồ án cuối khóa và đánh giá Nhận đề bài và xác định phạm vi Đồ án A — Băng tải một chiều Đồ án B — Đảo chiều động cơ Đồ án C — Hai bơm luân phiên Đồ án mở rộng — Trạm máy có PLC và van Lập hồ sơ Mô phỏng và kiểm tra Thực hành mô hình và ghi bằng chứng Bảo vệ phương án Hoàn thiện và bàn giao", "f": "assets/app/syl-kcd.87716f2ec7.json"}, "nentang": {"n": {"ch": 3, "l": 12}, "q": "Dữ liệu số và phép toán bit Bit, byte, nhị phân và hex Số có dấu, bù hai và tràn Logic và mặt nạ bit Dịch bit, BCD và ASCII Điện tử số và phần cứng tối thiểu Điện áp, dòng và mức logic Nút nhấn và tầng công suất CPU, bộ nhớ và bus Clock, reset và thời gian Tư duy lập trình và phương pháp thực hành Biến, điều kiện, vòng lặp và hàm Chương trình được tạo và chạy thế nào Debug có giả thuyết Đọc datasheet và ghi chép lab", "f": "assets/app/syl-nentang.c5ec40a446.json"}, "mcu8051": {"n": {"ch": 15, "l": 60}, "q": "Khởi động 8051 và hệ tối thiểu 8051, 8052 và AT89S52 Nguồn, clock, reset và EA Tạo project và nạp chương trình Lab đầu tiên: LED có dự đoán CPU, thanh ghi và chu kỳ lệnh A, B, R0–R7 và PSW PC, DPTR và con trỏ Tìm nạp, giải mã và thực thi Clock và số chu kỳ của lệnh Bộ nhớ và định địa chỉ RAM nội, bank và vùng bit SFR và RAM gián tiếp CODE, XDATA, MOVC và MOVX Định địa chỉ immediate/direct/indirect/indexed Assembly 8051 nền tảng Truyền dữ liệu và thao tác bit Số học, logic, dịch và xoay So sánh, nhảy và vòng lặp Chương trình con và stack C nhúng cho 8051 C tối thiểu cho phần cứng SFR, bit và header thiết bị Vùng nhớ, con trỏ và tài nguyên Build, listing và đối chiếu Assembly GPIO và driver số Cấu trúc cổng và Port 0 Nút nhấn và chống dội LED, buzzer và driver tải Lab bộ đếm sản phẩm mini Timer và Counter Timer 0/1 và chế độ hoạt động Tính giá trị nạp và sai số Counter và đo xung Timer 2 trên AT89S52 Ngắt và chia sẻ dữ liệu Vector, enable và ưu tiên Ngắt ngoài và ngắt timer ISR, volatile và tính nguyên tử Lab nhiều nguồn sự kiện UART và giao tiếp máy tính Khung UART và mức điện Baud rate, SCON và SBUF Ngắt UART và ring buffer Parser lệnh và timeout Hiển thị và bàn phím LED bảy đoạn và bảng mã Quét nhiều chữ số Bàn phím ma trận LCD ký tự và menu Giao tiếp nối tiếp bằng phần mềm I2C qua GPIO EEPROM nối tiếp SPI qua GPIO Thiết kế driver tái sử dụng Đo lường và điều khiển tải ADC ngoài và dữ liệu đo DAC ngoài và lọc số đơn giản PWM phần mềm và driver động cơ Xung, encoder và giới hạn tài nguyên Firmware không chặn và máy trạng thái Tick và scheduler hợp tác Máy trạng thái hữu hạn Timeout, interlock và lỗi Máy tính giám sát và Modbus RTU tùy chọn Độ tin cậy, tối ưu và chẩn đoán RAM, stack và call graph Timing và tối ưu có đo Watchdog, reset và tham số bền vững Kiểm thử driver và fault injection Đồ án và phát triển năng lực chuyên sâu Đặc tả và phân rã hệ thống Tích hợp prototype Nghiệm thu lỗi và tối ưu Bảo vệ và chuyển giao", "f": "assets/app/syl-mcu8051.d5cbe54f95.json"}, "mpu8086": {"n": {"ch": 12, "l": 48}, "q": "Khởi động và môi trường 8086 8086 và bức tranh hệ thống EU, BIU và hàng đợi lệnh Toolchain và profile CPU Chương trình đầu tiên và debugger Thanh ghi, cờ và phân đoạn Thanh ghi tổng quát và con trỏ FLAGS và ý nghĩa phép toán Segment:offset Little-endian, word và giới hạn Bộ nhớ và định địa chỉ Immediate, register và memory Địa chỉ hiệu dụng hợp lệ Segment mặc định và override Bảng dữ liệu và vùng nhớ Tập lệnh xử lý dữ liệu MOV, XCHG, LEA và chuyển dữ liệu ADD/ADC, SUB/SBB và mở rộng dấu MUL/IMUL, DIV/IDIV Logic, TEST, shift và rotate Rẽ nhánh và thuật toán Assembly CMP và nhảy signed/unsigned LOOP và vòng lặp có điều kiện Tìm kiếm và thống kê dãy Chuyển số và xử lý nhập số Stack, thủ tục và hợp đồng hàm SS:SP và thao tác stack CALL/RET near và far Truyền tham số và bảo toàn thanh ghi Reentrancy và chương trình con lồng Mảng, chuỗi và lệnh chuỗi Mảng byte/word và sắp xếp MOVS/STOS/LODS và DF CMPS/SCAS và REP Dữ liệu chồng lấn và biên Môi trường DOS/BIOS và mô hình ngắt INT và bảng vector Dịch vụ DOS trong profile DOS BIOS và giả định nền tảng PC COM/EXE và chương trình đa module Bus và chế độ hệ thống Chân tín hiệu và bus ghép kênh Chế độ minimum và clock/reset Chế độ maximum và điều khiển bus Arbitration và tranh chấp bus Thiết kế bộ nhớ và giải mã địa chỉ Memory map, ROM và reset vector Latch, buffer và chip select Bank chẵn/lẻ và A0/BHE Timing truy cập bộ nhớ I/O và ngoại vi lập trình được IN/OUT và 8255 PPI 8253/8254 và định thời 8259 PIC và IRQ phần cứng 8251 USART và truyền nối tiếp Đồ án hệ thống và kiểm chứng Thiết kế trainer 8086 tối giản Monitor bare-metal Chẩn đoán bus và kiểm thử tích hợp Bảo vệ và hướng phát triển", "f": "assets/app/syl-mpu8086.fd4549fb7f.json"}},SYL_FULL={};
function sylLoad(id){if(SYL_FULL[id])return Promise.resolve(SYL_FULL[id]);const x=SYL[id];if(!x||!x.f)return Promise.reject(new Error("no syllabus"));
  return SYL_FULL["_p"+id]||(SYL_FULL["_p"+id]=fetch(x.f).then(r=>{if(!r.ok)throw new Error(r.status);return r.json()}).then(d=>SYL_FULL[id]=d,e=>{delete SYL_FULL["_p"+id];throw e}))}
IC.list='<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4.5" cy="6" r="1"/><circle cx="4.5" cy="12" r="1"/><circle cx="4.5" cy="18" r="1"/></svg>';
const lt=l=>typeof l==="string"?l:l.t;   /* một bài trong mục lục: chữ, hoặc {code, t, d, lab} */
const sylCount=s=>s.n||({ch:s.tiers.reduce((a,t)=>a+t.chapters.length,0),l:s.tiers.reduce((a,t)=>a+t.chapters.reduce((b,c)=>b+c.lessons.length,0),0)});
const sylText=s=>s?(s.q||s.tiers.map(t=>t.chapters.map(c=>c.title+" "+c.lessons.map(lt).join(" ")).join(" ")).join(" ")):"";
function artFor(c,slot,uid){const a=(ASSETS[c.id]||{})[slot];
  if(a&&a.svg)return a.svg;
  if(a&&a.src)return `<img src="${escH(a.src)}" alt="" loading="lazy" decoding="async">`;
  return slot==="card-square"?artSQ(c.hue,uid):artSVG(c.hue,uid,slot==="hero")}
const ART={
  cpp:{a:"#4D7BFF",b:"#1534A6",c:"#9DB6FF",mono:"C++",code:["#include <iostream>","int main() {","  std::cout << \"Hi\";","  return 0;","}"]},
  cs:{a:"#9A5BF5",b:"#4517A0",c:"#C9A7FF",mono:"C#",code:["class App {","  static void Main() {","    Console.Write(1);","  }","}"]},
  py:{a:"#1BB3A6",b:"#075A5E",c:"#8BEBDD",mono:"Py",dot:"#F6CA47",code:["for i in range(5):","    print(i)","","nums = [1, 2, 3]","print(sum(nums))"]},
  algo:{a:"#C76A92",b:"#6A2147",c:"#F2B8CF",mono:"Algo",code:["sort(a.begin(), a.end());","int lo = 0, hi = n - 1;","while (lo <= hi) {","  int mid = (lo + hi) / 2;","}"]},
  sql:{a:"#5B78E0",b:"#22357F",c:"#B3C3FF",mono:"SQL",code:["SELECT name","FROM students","WHERE active = 1","ORDER BY name;",""]},
  kcd:{a:"#F28C28",b:"#0B2A55",c:"#FFD29A",mono:"KCĐ",code:["QF  ─┤ ├─","KM  ─┤ ├─","FR  ─┤ ├─","A1 ──( KM )── A2",""]},
  nentang:{a:"#3FA36A",b:"#123F2A",c:"#B7EDCB",mono:"NT",code:["0b1010_0101 = 0xA5","A & 0x0F  → 0x05","A | 0x80  → 0xA5","bit 7: 1 · bit 0: 1",""]},
  mcu8051:{a:"#29A3E0",b:"#0A3A66",c:"#A9E2FF",mono:"8051",code:["ORG 0000H","MOV A, #01H","LOOP: MOV P1, A","RL A","SJMP LOOP"]},
  mpu8086:{a:"#D98A3D",b:"#5A2E0E",c:"#FFD7AE",mono:"8086",code:[".MODEL SMALL",".CODE","MOV AX, 1234H","ADD AX, 0001H","INT 21H"]},
  java:{a:"#FF9548",b:"#B23B16",c:"#FFC796",mono:"Java",code:["class Main {","  void main() {","    out.println(1);","  }","}"]}};
function cube(x,y,s,o){const h=s*.58;return `<g opacity="${o}"><path d="M${x} ${y-h}L${x+s} ${y}L${x} ${y+h}L${x-s} ${y}Z" fill="#fff" fill-opacity=".55"/><path d="M${x-s} ${y}L${x} ${y+h}L${x} ${y+h+s*1.1}L${x-s} ${y+s*1.1}Z" fill="#fff" fill-opacity=".22"/><path d="M${x+s} ${y}L${x} ${y+h}L${x} ${y+h+s*1.1}L${x+s} ${y+s*1.1}Z" fill="#fff" fill-opacity=".12"/></g>`}
function artSQ(hue,uid){const A=ART[hue]||ART.cpp,id="q"+uid,fs=A.mono.length>3?30:A.mono.length>2?40:46;
  return `<svg viewBox="0 0 160 160" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false"><defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${A.a}"/><stop offset="1" stop-color="${A.b}"/></linearGradient></defs>
  <rect width="160" height="160" fill="url(#${id})"/>${cube(30,128,18,.45)}${cube(132,120,22,.4)}
  <g transform="translate(80 76)"><circle r="46" fill="#fff"/>${A.dot?`<circle cx="30" cy="-30" r="8" fill="${A.dot}"/>`:""}<text text-anchor="middle" dominant-baseline="central" font-family="Be Vietnam Pro,system-ui,sans-serif" font-weight="800" font-size="${fs}" fill="${A.b}">${escH(A.mono)}</text></g></svg>`}
function artSVG(hue,uid,wide){
  const A=ART[hue]||ART.cpp,W=wide?440:480,id="g"+uid;
  const cubes=[[40,160,26,.55],[92,178,20,.45],[300,170,30,.5],[360,150,22,.4],[430,178,26,.5],[470,128,18,.35],[250,190,16,.4]].map(c=>cube(c[0]*(W/480),c[1],c[2],c[3])).join("");
  const fs=A.mono.length>3?34:A.mono.length>2?46:52;
  return `<svg viewBox="0 0 ${W} 214" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
  <defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${A.a}"/><stop offset="1" stop-color="${A.b}"/></linearGradient>
  <radialGradient id="${id}r" cx=".3" cy=".45" r=".6"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
  <linearGradient id="${id}b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="${A.c}"/></linearGradient></defs>
  <rect width="${W}" height="214" fill="url(#${id})"/><rect width="${W}" height="214" fill="url(#${id}r)"/>
  <g stroke="#fff" stroke-opacity=".08">${[40,80,120,160,200].map(y=>`<path d="M0 ${y}H${W}"/>`).join("")}${Array.from({length:12},(_,i)=>`<path d="M${i*44} 0V214"/>`).join("")}</g>
  ${cubes}
  <g transform="translate(${wide?W*.54:W*.53} 30) skewY(-7)"><rect width="${wide?W*.42:W*.4}" height="112" rx="10" fill="#0B1020" fill-opacity=".22" stroke="#fff" stroke-opacity=".35"/>
  ${A.code.map((t,i)=>`<text x="14" y="${26+i*19}" font-family="JetBrains Mono,ui-monospace,monospace" font-size="12.5" fill="#fff" fill-opacity="${t?.88:0}">${escH(t)}</text>`).join("")}</g>
  <g transform="translate(${wide?W*.27:W*.21} 104)"><circle r="66" fill="#000" fill-opacity=".14" transform="translate(5 9)"/><circle r="66" fill="url(#${id}b)"/><circle r="52" fill="none" stroke="${A.a}" stroke-opacity=".25" stroke-width="10"/>
  ${A.dot?`<circle cx="40" cy="-40" r="11" fill="${A.dot}"/>`:""}
  <text text-anchor="middle" dominant-baseline="central" font-family="Be Vietnam Pro,system-ui,sans-serif" font-weight="800" font-size="${fs}" fill="${A.b}">${escH(A.mono)}</text></g></svg>`}
/* ---------- quyền truy cập và học phí, viết ngắn cho người học ---------- */
function accessLine(c,f){if(!f)return "";const n=c.lessons.length,lf=+f.loginFrom,np=c.lessons.filter(([l])=>f.paid&&f.paid[l]).length;
  const inn=!!AMTS.S.user;
  if(f.paidMode&&np)return `${n-np} bài miễn phí, ${np} bài có phí${f.price?` (${f.price})`:""}.${lf<=n&&!inn?` Đăng nhập để học từ bài ${lf}.`:""}`;
  if(inn)return "";
  return lf<=n?`Khóa học miễn phí. Đăng nhập để học từ bài ${lf}.`:"Khóa học miễn phí, không cần đăng nhập."}
function isPaid(c){const f=PUB[c.id];return !!(f&&f.paidMode&&c.lessons.some(([l])=>f.paid&&f.paid[l]))}
function statsOf(c){const p=progressOf(c.id),total=c.lessons.length,done=c.lessons.filter(([l])=>AMTS.isDone(p,l,c.id)).length;
  const lastAt=Math.max(0,...Object.values(p.visited||{}).map(Number).filter(Boolean));
  const last=p.lastLesson&&c.lessons.find(x=>x[0]===p.lastLesson);return{p,total,done,last,lastAt,started:!!(done||last)}}
/* ---------- khối "Tiếp tục học" ---------- */
function renderResume(){
  const open=COURSES.filter(c=>c.status==="open");if(!open.length){document.getElementById("resume").hidden=true;return}
  const ss=open.map(c=>({c,...statsOf(c)})).sort((a,b)=>b.lastAt-a.lastAt);const x=ss.find(y=>y.started)||ss[0],c=x.c;
  const pct=x.total?Math.round(x.done/x.total*100):0,href=c.url+(x.last?"#bai-"+x.last[0].slice(1):"#bai-1");
  document.getElementById("greet-p").textContent=x.started?"Tiếp tục hành trình lập trình của bạn cùng AMTS.":"Bắt đầu hành trình lập trình của bạn cùng AMTS.";
  document.getElementById("resume").innerHTML=`<div class="art">${artFor(c,"hero","r")}</div>
    <div class="r-body"><div class="r-main"><span class="kicker">${x.started?"Khóa học của bạn":"Bắt đầu ngay"}</span><h2>${escH(c.name)}</h2>
      ${x.started?`<p class="r-last">${IC.doc}${x.last?`Bài gần nhất: Bài ${x.last[0].slice(1)} · ${escH(x.last[1])}`:"Chưa mở bài nào"}</p>`:`<p class="r-last">${IC.doc}Bài 1 · ${escH(c.lessons[0][1])}</p>`}
      <div class="r-prog"><div class="pbar" role="progressbar" aria-label="Tiến độ ${escH(c.name)}" aria-valuemin="0" aria-valuemax="${x.total}" aria-valuenow="${x.done}"><span style="width:${pct}%"></span></div><b>${pct}%</b>
        <span class="r-sub">Đã hoàn thành ${x.done}/${x.total} bài đang mở${c.chapters?` · lộ trình ${c.chapters} chương`:""}</span></div>
      ${PUB[c.id]&&accessLine(c,PUB[c.id])?`<p class="r-acc">${escH(accessLine(c,PUB[c.id]))}</p>`:""}</div>
    <a class="cta" href="${escH(href)}">${x.started?"Tiếp tục học":"Học thử bài đầu tiên"} ${IC.arrow}</a></div>`}
/* ---------- thẻ khóa học + tìm kiếm + lọc ---------- */
let CF="all",cmsg={};
const fold=t=>String(t||"").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/đ/g,"d");
function renderCourses(){
  const q=fold(document.getElementById("c-q").value).trim();
  const list=COURSES.filter(c=>(CF==="all"||(CF==="open")===(c.status==="open"))&&(!q||fold(c.name+" "+c.desc+" "+c.mono+" "+c.id+" "+c.lessons.map(x=>x[1]).join(" ")+" "+sylText(SYL[c.id])).includes(q)));
  const S=AMTS.S;
  document.getElementById("courses").innerHTML=list.length?list.map(c=>{const open=c.status==="open";
    if(open){const x=statsOf(c),href=c.url+(x.last?"#bai-"+x.last[0].slice(1):"");
      return `<article class="course" style="--hue:var(--c-${c.hue})"><div class="art">${artFor(c,"card",c.id)}</div><div class="c-body">
        <div class="c-title"><h3>${escH(c.name)}</h3><span class="chip open">Đang mở</span></div><p>${escH(c.desc)}</p>
        <div class="c-meta">${IC.book}${c.chapters?`${c.chapters} chương · `:""}Đã mở ${x.total} bài học</div>
        <div class="c-foot">${isPaid(c)?`<span class="price paid">Có bài có phí</span>`:`<span class="price">Miễn phí</span>`}<a class="btn-p" href="${escH(href)}">${x.started?"Học tiếp":"Xem khóa học"} ${IC.arrow}</a></div>
        ${PUB[c.id]&&accessLine(c,PUB[c.id])?`<p class="c-fee">${escH(accessLine(c,PUB[c.id]))}</p>`:""}</div></article>`}
    const on=AMTS.notifyOf(c.id);
    return `<article class="course soon" style="--hue:var(--c-${c.hue})"><div class="art"><span class="a-w">${artFor(c,"card",c.id)}</span><span class="a-s">${artFor(c,"card-square",c.id)}</span></div><div class="c-body">
      <div class="c-title"><h3>${escH(c.name)}</h3><span class="chip">Sắp ra mắt</span></div><p>${escH(c.desc)}</p>${SYL[c.id]?(n=>`<div class="c-meta">${IC.book}Dự kiến ${n.ch} chương · ${n.l} bài</div>`)(sylCount(SYL[c.id])):"<span></span>"}
      <div class="c-foot">${SYL[c.id]?`<button type="button" class="btn-o syl-b" data-syl="${c.id}">${IC.list}Xem mục lục</button>`:""}${NST[c.id]==="busy"?`<button type="button" class="btn-o" disabled aria-busy="true">${IC.bell}Đang đăng ký…</button>`:NST[c.id]==="fail"?`<button type="button" class="btn-o fail" data-notify="${c.id}">${IC.bell}Thử lại</button>`:`<button type="button" class="btn-o${on?" on":""}" data-notify="${c.id}" aria-pressed="${on}">${on?IC.check+"Sẽ báo khi khóa mở":IC.bell+"Nhận thông báo"}</button>`}</div>
      <p class="c-msg${NST[c.id]==="fail"?" bad-t":""}" role="status">${cmsg[c.id]?escH(cmsg[c.id]):""}</p></div></article>`}).join("")
    :`<p class="c-empty" role="status">Không có khóa học nào khớp “${escH(document.getElementById("c-q").value)}”${CF!=="all"?` trong mục “${CF==="open"?"Đang mở":"Sắp ra mắt"}”`:""}. Thử từ khóa ngắn hơn (ví dụ “mảng”, “hàm”)${q?`, <button type="button" class="linkb" id="c-clear">xóa tìm kiếm</button>`:""}${CF!=="all"?` hoặc <button type="button" class="linkb" id="c-all">xem tất cả khóa học</button>`:""}.</p>`;
  {const qx=document.getElementById("c-x");if(qx)qx.hidden=!document.getElementById("c-q").value;
   const cc=document.getElementById("c-clear");if(cc)cc.onclick=clearSearch;
   const ca=document.getElementById("c-all");if(ca)ca.onclick=()=>document.querySelector('.seg [data-f="all"]').click()}
  document.querySelectorAll("[data-notify]").forEach(b=>b.onclick=()=>toggleNotify(b.dataset.notify));
  document.querySelectorAll("[data-syl]").forEach(b=>b.onclick=()=>openSyl(b.dataset.syl,b));
  renderPractice();
}
/* ---------- hộp "Mục lục khóa học" (khóa sắp ra mắt) ---------- */
function openSyl(id,from){const c=courseById(id);if(!SYL[id]||!c)return;
  if(!SYL_FULL[id]){if(from&&from.getAttribute("aria-busy")==="true")return;const t=from&&from.innerHTML;if(from){from.setAttribute("aria-busy","true");from.classList.add("busy")}
    sylLoad(id).then(()=>openSyl(id,from),()=>{if(from)from.textContent="Chưa tải được mục lục, bấm để thử lại"}).finally(()=>{if(from){from.removeAttribute("aria-busy");from.classList.remove("busy");if(SYL_FULL[id]&&t)from.innerHTML=t}});return}
  const s=SYL_FULL[id],n=sylCount(s),dlg=document.getElementById("syl");let no=0,chi=0,cn=(s.chStart===0?0:1)-1;
  const q=fold(document.getElementById("c-q").value).trim(),hit=t=>q&&fold(t).includes(q);
  dlg.innerHTML=`<div class="sy-h"><div><span class="kicker">Mục lục dự kiến · Sắp ra mắt</span><h2 id="syl-t">${escH(c.name)}</h2>
      <p class="sy-n">${n.ch} chương · ${n.l} bài · ${s.tiers.length} ${escH(s.tierWord||"cấp độ")}</p></div><button type="button" class="sy-x" aria-label="Đóng mục lục">×</button></div>
    <div class="sy-b">
      <dl class="sy-info"><div><dt>Dành cho</dt><dd>${escH(s.for)}</dd></div><div><dt>Cần biết trước</dt><dd>${escH(s.prereq)}</dd></div><div><dt>Công cụ</dt><dd>${escH(s.tools)}</dd></div></dl>
      <div class="sy-out"><b>Học xong khóa này, bạn sẽ</b><ul>${s.outcome.map(o=>`<li>${escH(o)}</li>`).join("")}</ul></div>
      ${(s.sections||[]).map(x=>`<details class="sy-sec"><summary>${escH(x.t)}</summary><ul>${x.items.map(i=>`<li>${escH(i)}</li>`).join("")}</ul></details>`).join("")}
      <div class="sy-tools"><b>Nội dung khóa học</b><button type="button" class="linkb" data-sy-all aria-pressed="false">Mở tất cả chương</button></div>
      ${s.tiers.map(t=>`<section class="sy-tier ${t.cls}"><h3><span class="sy-lv">${escH(t.tier)}</span>${escH(t.note)}</h3>
        ${t.chapters.map(ch=>{cn++;const open=++chi===1||ch.lessons.some(l=>hit(lt(l))||hit(l.d||""))||hit(ch.title);
          return `<details class="sy-ch"${open?" open":""}><summary><span class="sy-no">${escH(ch.code||String(cn).padStart(2,"0"))}</span><span class="sy-ct"><b>${escH(ch.title)}</b><small>${ch.lessons.length} bài · ${escH(ch.en)}</small></span></summary>
          <p class="sy-goal"><b>Mục tiêu:</b> ${escH(ch.goal)}</p>${ch.sim?`<p class="sy-sim"><b>Mô phỏng:</b> ${escH(ch.sim)}</p>`:""}
          <ol class="sy-l${ch.lessons[0]&&ch.lessons[0].code?" coded":""}" start="${no+1}">${ch.lessons.map(l=>{no++;const o=typeof l==="string"?{t:l}:l;
            return `<li${hit(o.t)||hit(o.d||"")?' class="hit"':""}>${o.code?`<span class="sy-code">${escH(o.code)}</span>`:""}<b class="sy-lt">${escH(o.t)}</b>${o.d?`<span class="sy-ld">${escH(o.d)}</span>`:""}${o.lab?`<span class="sy-lab"><i>Thực hành:</i> ${escH(o.lab)}</span>`:""}</li>`}).join("")}</ol></details>`}).join("")}</section>`).join("")}
    </div>
    <div class="sy-f"><button type="button" class="btn-o${AMTS.notifyOf(id)?" on":""}" data-sy-notify>${AMTS.notifyOf(id)?IC.check+"Sẽ báo khi khóa mở":IC.bell+"Nhận thông báo khi khóa mở"}</button><button type="button" class="btn-p" data-sy-close>Đóng</button></div>`;
  dlg.setAttribute("aria-labelledby","syl-t");
  const close=()=>dlg.close();
  dlg.querySelector(".sy-x").onclick=close;dlg.querySelector("[data-sy-close]").onclick=close;
  dlg.querySelector("[data-sy-notify]").onclick=()=>{close();toggleNotify(id)};
  dlg.onclick=e=>{if(e.target===dlg)close()};
  const all=dlg.querySelector("[data-sy-all]"),chs=[...dlg.querySelectorAll(".sy-ch")],sync=()=>{const o=chs.every(d=>d.open);all.textContent=o?"Thu gọn tất cả":"Mở tất cả chương";all.setAttribute("aria-pressed",o)};
  all.onclick=()=>{const o=!chs.every(d=>d.open);chs.forEach(d=>d.open=o);sync()};chs.forEach(d=>d.ontoggle=sync);
  dlg.onclose=()=>{document.documentElement.classList.remove("sy-open");const b=document.querySelector(`[data-syl="${id}"]`)||from;if(b)b.focus()};
  document.documentElement.classList.add("sy-open");
  dlg.showModal();dlg.querySelector(".sy-b").scrollTop=0;dlg.querySelector(".sy-x").focus()}
let wantNotify=null;const NST={};
function clearSearch(){const i=document.getElementById("c-q");i.value="";renderCourses();i.focus()}
document.getElementById("c-x").onclick=clearSearch;
/* Nhận thông báo: Đang đăng ký… → Sẽ báo khi khóa mở; lỗi thì hiện lỗi + Thử lại (không báo thành công giả) */
async function setNotifyUI(id,on){NST[id]="busy";cmsg={};renderCourses();
  try{await AMTS.setNotify(id,on);delete NST[id];cmsg[id]=on?"Đã đăng ký. Bạn sẽ được báo khi khóa mở.":"Đã hủy nhận thông báo."}
  catch(e){NST[id]="fail";cmsg[id]="Chưa đăng ký được: "+(e.message||e.code)+"."}
  renderAll();const b=document.querySelector(`[data-notify="${id}"]`);if(b)b.focus()}
async function toggleNotify(id){const S=AMTS.S;cmsg={};
  if(S.mode!=="ready"){cmsg[id]="Chức năng này cần bản đăng trên website (có đăng nhập Google).";renderCourses();return}
  if(!S.user){wantNotify=id;cmsg[id]="Đăng nhập để nhận thông báo. Lựa chọn của bạn được giữ lại.";renderCourses();const m=await AMTS.signIn();if(m){cmsg[id]=m;wantNotify=null;renderCourses()}return}
  setNotifyUI(id,NST[id]==="fail"?true:!AMTS.notifyOf(id))}
/* ---------- thực hành: tới bài đầu tiên còn bài tập chưa đạt ---------- */
function renderPractice(){const c=COURSES.find(x=>x.status==="open");if(!c)return;const p=progressOf(c.id);
  const L=c.practice||[],nPass=L.filter(k=>(p.ex[k]||{}).pass).length,href=c.url+"#thuc-hanh";
  document.getElementById("pr-link").href=href;document.getElementById("nav-practice").href=href;
  document.getElementById("pr-text").textContent=`${L.length} bài tập chấm tự động có gợi ý, lời giải và trình tự chạy từng bước`+(nPass?` · bạn đã làm đạt ${nPass}/${L.length}.`:".")}
document.getElementById("c-q").addEventListener("input",renderCourses);
document.querySelectorAll(".seg [data-f]").forEach(b=>b.onclick=()=>{CF=b.dataset.f;document.querySelectorAll(".seg [data-f]").forEach(x=>x.setAttribute("aria-pressed",x===b));renderCourses()});

/* ================= GIẢNG VIÊN ================= */
/* ================= QUẢN TRỊ: truy cập, học phí, kích hoạt, nội dung ================= */
let CFG=null,ENR={},PAYREQ={},admMsg="";
const pendingOf=uid=>{const r=PAYREQ[uid];return r&&r.courses&&r.courses[TC]&&!((ENR[uid]||{})[TC]===true)?r.courses[TC]:null};
function enrollList(){const m=new Map(students().map(r=>[r.uid,r]));for(const uid in PAYREQ)if(!m.has(uid)&&!AMTS.TEACHERS.includes(String(PAYREQ[uid].email||"").toLowerCase()))m.set(uid,{uid,name:PAYREQ[uid].name,email:PAYREQ[uid].email});return[...m.values()]}
function ssGet(){try{return JSON.parse(sessionStorage.getItem("amts-adm-open"))||{set:true}}catch(e){return{set:true}}}
async function loadAdmin(){
  const c=courseById(TC);if(c.status!=="open"){document.getElementById("t-adm").innerHTML="";document.getElementById("t-over").innerHTML="";return}
  try{[CFG,ENR]=await Promise.all([AMTS.getConfig(TC,true),AMTS.allEnroll()]);PAYREQ=await AMTS.allPayReq().catch(()=>({}))}
  catch(e){document.getElementById("t-adm").innerHTML=`<p class="empty bad-t">Không đọc được cài đặt truy cập: ${e.code==="permission-denied"?"Firestore từ chối. Hãy dán bộ quy tắc firestore.rules mới (có phần config, enroll, content) trong Firebase Console.":escH(e.message||e.code)}</p>`;return}
  renderAdmin();
}
/* thẻ tổng quan: dẫn tới từng mục quản trị */
function renderOver(nPend,hasPage){const el=document.getElementById("t-over");if(!el)return;const c=courseById(TC);
  const inC=students().filter(r=>AMTS.courseOf(r,c.id)).length;
  const cards=[["t-prog","Tiến độ học viên",`${inC} học viên`,`${students().length} đã đăng nhập`,""],
    ["adm-set","Truy cập và học phí",CFG&&CFG.paidMode?"Đang bật trả phí":"Đang miễn phí",CFG&&CFG.paidMode?`${Object.values(CFG.paid||{}).filter(Boolean).length} bài có phí`:`Đăng nhập từ bài ${CFG&&CFG.loginFrom<999?CFG.loginFrom:"—"}`,""],
    ["adm-enr","Kích hoạt học viên",`${enrolledCount()} đã kích hoạt`,nPend?`${nPend} chờ xác nhận`:"Không có yêu cầu mới",nPend?"warn":""],
    ["adm-ct","Nội dung bài học",hasPage?"Đủ phiên bản":"Thiếu phiên bản",hasPage?"Trang đang đọc đúng nội dung":"Cần tải file nội dung lên",hasPage?"":"warn"],
    ["t-backup","Sao lưu","Tải hoặc khôi phục","Nên tải định kỳ mỗi tháng",""]];
  el.innerHTML=cards.map(([id,t,b,s,cls])=>`<a href="#${id}" class="t-card${cls?" "+cls:""}" data-to="${id}"><span>${t}</span><b>${b}</b><small>${s}</small></a>`).join("");
  el.querySelectorAll("[data-to]").forEach(a=>a.onclick=e=>{e.preventDefault();const t=document.getElementById(a.dataset.to);if(!t)return;if(t.tagName==="DETAILS")t.open=true;t.scrollIntoView({behavior:"smooth",block:"start"});
    const f=t.querySelector("summary")||t;if(!f.hasAttribute("tabindex")&&f.tagName!=="SUMMARY")f.setAttribute("tabindex","-1");f.focus({preventScroll:true})});
}
function enrolledCount(){return Object.values(ENR).filter(x=>x&&x[TC]===true).length}
function renderAdmin(){
  const c=courseById(TC),box=document.getElementById("t-adm");if(!CFG||c.status!=="open"){box.innerHTML="";return}
  const L=c.lessons,paid=CFG.paid||{},nPaid=L.filter(([l])=>paid[l]).length;
  const open=ssGet();
  const sv=c.contentVer,V=CFG.versions||{},hasPage=!!(V[sv]&&V[sv].ok);
  const nPend=enrollList().filter(r=>pendingOf(r.uid)).length;
  renderOver(nPend,hasPage);
  const vers=Object.entries(V).sort((a,b)=>String(b[1].at||"").localeCompare(String(a[1].at||"")));
  box.innerHTML=`
  <details class="adm-box" id="adm-set" data-k="set"${open.set?" open":""}><summary><b>Truy cập và học phí</b><span class="chip ${CFG.paidMode?"warn":"open"}">${CFG.paidMode?`Đang bật trả phí · ${nPaid} bài có phí`:"Đang miễn phí"}</span></summary>
    <div class="adm-in">
      <label class="sw"><input type="checkbox" id="a-paid"${CFG.paidMode?" checked":""}><span class="sw-ui" aria-hidden="true"></span><span><b>Bật chế độ trả phí</b><small>Tắt: mọi bài miễn phí. Bật: các bài đánh dấu “có phí” chỉ mở cho học viên đã được kích hoạt.</small></span></label>
      <label class="adm-f"><span>Yêu cầu đăng nhập từ</span><select id="a-login"><option value="9999">Không yêu cầu</option>${L.map(([l,n],i)=>`<option value="${i+1}"${+CFG.loginFrom===i+1?" selected":""}>Bài ${i+1} · ${escH(n)}</option>`).join("")}</select></label>
      <p class="note">Học viên chưa đăng nhập vẫn xem được các bài trước bài này. Mặc định: Bài 16 (Chương 5 · Hàm).</p>
      <fieldset class="adm-paid" id="a-paidbox"${CFG.paidMode?"":" disabled"}>
        <legend>Bài có phí</legend>
        <div class="adm-quick"><span>Chọn nhanh:</span><label>có phí từ <select id="a-from">${L.map(([l],i)=>`<option value="${i+1}"${i+1===16?" selected":""}>Bài ${i+1}</option>`).join("")}</select> trở đi</label><button class="btn sm" type="button" id="a-apply">Áp dụng</button><button class="btn sm" type="button" id="a-none">Bỏ chọn tất cả</button></div>
        <div class="adm-lessons">${L.map(([l,n],i)=>`<label><input type="checkbox" data-l="${l}"${paid[l]?" checked":""}><b>B${i+1}</b><span>${escH(n)}</span></label>`).join("")}</div>
        <label class="adm-f"><span>Học phí</span><input id="a-price" maxlength="200" value="${escH(CFG.price||"")}" placeholder="Ví dụ: 1.500.000đ cho cả khóa"></label>
        <div class="adm-pay"><b>Thông tin chuyển khoản</b><small>Hiện cho học viên đã đăng nhập nhưng chưa được kích hoạt. Nội dung chuyển khoản luôn là email của học viên.</small>
          <label class="adm-f"><span>Ngân hàng</span><input id="a-bank" maxlength="120" value="${escH(CFG.bankName||"")}" autocomplete="off"></label>
          <label class="adm-f"><span>Người nhận</span><input id="a-accname" maxlength="120" value="${escH(CFG.accName||"")}" autocomplete="off"></label>
          <label class="adm-f"><span>Số tài khoản</span><input id="a-accno" maxlength="60" value="${escH(CFG.accNo||"")}" autocomplete="off" inputmode="numeric"></label>
          <label class="adm-f"><span>Liên hệ</span><input id="a-contact" maxlength="300" value="${escH(CFG.payContact||"")}" placeholder="Zalo / email giảng viên" autocomplete="off"></label>
          <label class="adm-f col"><span>Ghi chú thêm (không bắt buộc)</span><textarea id="a-pay" rows="3" maxlength="2000">${escH(CFG.payInfo||"")}</textarea></label></div>
      </fieldset>
      <div class="adm-act"><button class="btn pri" id="a-save">Lưu cài đặt</button><span class="note" id="a-msg" aria-live="polite">${escH(admMsg)}</span></div>
    </div></details>
  <details class="adm-box" id="adm-enr" data-k="enr"${open.enr||nPend?" open":""}><summary><b>Kích hoạt học viên</b><span class="chip">${enrolledCount()} đã kích hoạt</span>${nPend?`<span class="chip warn">${nPend} chờ xác nhận chuyển khoản</span>`:""}</summary>
    <div class="adm-in">
      <p class="note">Học viên cần đăng nhập vào trang ít nhất một lần thì mới có tên trong danh sách. Đối chiếu email trong nội dung chuyển khoản rồi bấm Kích hoạt.</p>
      <input id="a-eq" placeholder="Tìm theo tên hoặc email" autocomplete="off" aria-label="Tìm học viên để kích hoạt">
      <div class="adm-enr" id="a-enr"></div>
    </div></details>
  <details class="adm-box" id="adm-ct" data-k="ct"${open.ct||!hasPage?" open":""}><summary><b>Nội dung bài học trên máy chủ</b><span class="chip ${hasPage?"open":"warn"}">${hasPage?"Có đủ phiên bản trang cần":"Thiếu phiên bản trang cần"}</span></summary>
    <div class="adm-in">
      <p>Phần chữ của bài học nằm trên Firebase để chỉ người có quyền mới xem được. Mỗi bản trang đi kèm <b>một phiên bản nội dung</b> và tự đọc đúng phiên bản đó.</p>
      <ol class="adm-steps"><li><b>Tải file <code>noi-dung-${escH(TC)}.json</code> mới lên đây.</b> Phiên bản mới được lưu riêng, trang đang chạy không bị ảnh hưởng.</li><li>Hệ thống tự đọc lại và kiểm tra đủ bài.</li><li>Sau đó mới đưa trang mới lên GitHub. Trang mới tự dùng phiên bản nội dung của nó.</li></ol>
      <p class="note"><b>Quay lại bản trước:</b> đưa lại bản trang cũ lên GitHub; nội dung cũ vẫn còn ở đây. Nên giữ 2–3 phiên bản gần nhất.</p>
      <p class="note">Bản trang hiện tại cần phiên bản <code>${escH(sv||"?")}</code>.</p>
      ${vers.length?`<div class="tbl"><table class="ver-t"><thead><tr><th>Phiên bản</th><th>Tải lên</th><th>Số bài</th><th>Trạng thái</th><th></th></tr></thead><tbody>${vers.map(([v,x])=>{const tags=[v===sv?"Trang hiện tại dùng":"",v===CFG.activeVer?"Mới nhất":""].filter(Boolean);const lock=v===sv||v===CFG.activeVer;
        return `<tr><td><code>${escH(v)}</code></td><td>${x.at?escH(new Date(x.at).toLocaleString("vi-VN",{hour:"2-digit",minute:"2-digit",day:"2-digit",month:"2-digit",year:"numeric"})):"?"}${x.by?`<br><small>${escH(x.by)}</small>`:""}</td><td>${x.n||0}${x.ok?" ✓":""}</td><td>${tags.length?tags.map(t=>`<span class="chip open">${t}</span>`).join(" "):"Bản cũ"}</td><td>${lock?"":`<button class="btn sm" data-del="${escH(v)}">Xóa</button>`}</td></tr>`}).join("")}</tbody></table></div>`:`<p class="note">Chưa có phiên bản nào được tải lên theo cách mới.</p>`}
      <div class="adm-act"><input type="file" id="a-file" accept=".json,application/json"><button class="btn pri" id="a-up">Tải lên phiên bản mới</button><button class="btn" id="a-chk">Kiểm tra từng bài</button><span class="note" id="a-umsg" aria-live="polite"></span></div>
      <div id="a-chkres"></div>
    </div></details>`;
  box.querySelectorAll("details.adm-box").forEach(d=>d.addEventListener("toggle",()=>{const o=ssGet();o[d.dataset.k]=d.open;try{sessionStorage.setItem("amts-adm-open",JSON.stringify(o))}catch(e){}}));
  const $=id=>document.getElementById(id);
  $("a-paid").onchange=e=>{$("a-paidbox").disabled=!e.target.checked};
  $("a-apply").onclick=()=>{const f=+$("a-from").value;box.querySelectorAll("[data-l]").forEach(x=>x.checked=+x.dataset.l.slice(1)>=f)};
  $("a-none").onclick=()=>box.querySelectorAll("[data-l]").forEach(x=>x.checked=false);
  $("a-save").onclick=saveAdmin;
  $("a-eq").addEventListener("input",renderEnroll);renderEnroll();
  $("a-up").onclick=uploadPkg;
  box.querySelectorAll("[data-del]").forEach(b=>b.onclick=()=>delVersion(b.dataset.del));
  $("a-chk").onclick=checkContent;
}
/* đọc toàn bộ nội dung trên máy chủ, đối chiếu với phiên bản bản trang này cần */
async function checkContent(){
  const out=document.getElementById("a-chkres"),c=courseById(TC),sv=c.contentVer;out.innerHTML=`<p class="note">Đang đọc nội dung trên máy chủ…</p>`;
  try{const all=await AMTS.dump("content"),groups={};
    for(const id in all){const m=id.match(new RegExp("^"+TC+"(?:@([\\w.-]+))?-(l\\d+)$"));if(!m)continue;(groups[m[1]||""]=groups[m[1]||""]||[]).push(m[2])}
    const L=c.lessons,mine=new Set(groups[sv]||[]),miss=L.filter(([l])=>!mine.has(l)||!(all[AMTS.docId(TC,sv,l)]||{}).html);
    const legacy=groups[""]||[];
    let h=`<p class="${miss.length?"bad-t":"ok-t"}"><b>Phiên bản ${escH(sv)}: ${L.length-miss.length}/${L.length} bài có trên máy chủ</b>${miss.length?"":" · đủ bài, trang hoạt động bình thường"}.</p>`;
    if(miss.length)h+=`<p class="note">Thiếu: ${miss.map(([l])=>"Bài "+l.slice(1)).join(", ")}. Hãy tải lên file <code>noi-dung-${escH(TC)}.json</code> đi kèm bản trang này.</p>`;
    const others=Object.keys(groups).filter(v=>v&&v!==sv);
    if(others.length)h+=`<p class="note">Phiên bản khác trên máy chủ: ${others.map(v=>`<code>${escH(v)}</code> (${groups[v].length} bài)`).join(", ")}.</p>`;
    if(legacy.length)h+=`<p class="note">Còn ${legacy.length} bài dạng cũ (chưa có phiên bản), dành cho bản trang trước khi có phiên bản. ${miss.length?"Giữ lại cho tới khi phiên bản mới đủ bài.":`<button class="btn sm" id="a-dellegacy">Xóa bản cũ</button>`}</p>`;
    out.innerHTML=h;const b=document.getElementById("a-dellegacy");if(b)b.onclick=()=>delVersion("",legacy)}
  catch(e){out.innerHTML=`<p class="bad-t">Không đọc được: ${escH(e.message||e.code)}</p>`}
}
async function delVersion(v,lessons){
  const c=courseById(TC);if(v&&(v===c.contentVer||v===CFG.activeVer))return;
  const ls=lessons||((CFG.versions||{})[v]||{}).lessons||c.lessons.map(([l])=>l);
  if(!confirm(v?`Xóa phiên bản ${v} (${ls.length} bài) khỏi máy chủ?\n\nBản trang nào còn dùng phiên bản này sẽ không hiện được nội dung. Không hoàn tác được (trừ khi tải lại file nội dung của phiên bản đó).`:`Xóa ${ls.length} bài dạng cũ (chưa có phiên bản)?\n\nChỉ bản trang cũ (trước khi có phiên bản) còn dùng chúng.`))return;
  const msg=document.getElementById("a-umsg");msg.textContent="Đang xóa…";
  try{await AMTS.deleteVersion(TC,v,ls);CFG=await AMTS.getConfig(TC,true);PUB[TC]=CFG;admMsg=v?`Đã xóa phiên bản ${v}.`:"Đã xóa bản cũ không phiên bản.";renderAdmin()}
  catch(e){msg.textContent="Không xóa được: "+(e.message||e.code)}
}
async function saveAdmin(){
  const $=id=>document.getElementById(id),msg=$("a-msg");
  const paid={};document.querySelectorAll("#t-adm [data-l]").forEach(x=>paid[x.dataset.l]=x.checked);
  const next={...CFG,paidMode:$("a-paid").checked,loginFrom:+$("a-login").value,paid,price:$("a-price").value.trim(),payInfo:$("a-pay").value.trim(),
    bankName:$("a-bank").value.trim(),accName:$("a-accname").value.trim(),accNo:$("a-accno").value.trim(),payContact:$("a-contact").value.trim()};
  const nP=Object.values(paid).filter(Boolean).length,c=courseById(TC);
  if(next.paidMode&&!nP){msg.textContent="Chế độ trả phí đang bật nhưng chưa chọn bài có phí nào.";return}
  if(next.paidMode&&!next.accNo&&!next.payInfo&&!confirm("Chưa có số tài khoản hoặc ghi chú chuyển khoản. Học viên sẽ không biết cách đóng học phí. Vẫn lưu?"))return;
  const was=CFG.paidMode&&CFG.paid?Object.keys(CFG.paid).filter(k=>CFG.paid[k]).sort().join(","):"",now=next.paidMode?Object.keys(paid).filter(k=>paid[k]).sort().join(","):"";
  if(was!==now&&!confirm(next.paidMode?`Lưu cài đặt khóa ${c.name}: ${nP} bài có phí sẽ chỉ mở cho học viên đã kích hoạt (${enrolledCount()} người). Học viên khác đang học các bài này sẽ bị khóa. Tiếp tục?`:`Tắt chế độ trả phí của khóa ${c.name}: mọi bài sẽ mở miễn phí cho tất cả học viên. Tiếp tục?`))return;
  msg.textContent="Đang lưu…";
  try{CFG=await AMTS.saveConfig(TC,next);PUB[TC]=CFG;admMsg="Đã lưu lúc "+new Date().toLocaleTimeString("vi-VN",{hour:"2-digit",minute:"2-digit"})+".";renderAdmin();renderCourses()}
  catch(e){msg.textContent="Không lưu được: "+(e.code==="permission-denied"?"Firestore từ chối. Hãy dán bộ quy tắc firestore.rules mới.":(e.message||e.code))}
}
function renderEnroll(){
  const el=document.getElementById("a-enr");if(!el)return;const q=(document.getElementById("a-eq").value||"").toLowerCase().trim();
  const all=enrollList(),st=all.filter(r=>!q||(r.name||"").toLowerCase().includes(q)||(r.email||"").includes(q))
    .sort((a,b)=>(!!pendingOf(b.uid))-(!!pendingOf(a.uid))||((ENR[b.uid]||{})[TC]===true)-((ENR[a.uid]||{})[TC]===true)||tsMs(b.lastSeen)-tsMs(a.lastSeen));
  if(!st.length){el.innerHTML=`<p class="empty">${all.length?"Không có học viên khớp từ khóa.":"Chưa có học viên nào đăng nhập."}</p>`;return}
  el.innerHTML=st.slice(0,200).map(r=>{const on=(ENR[r.uid]||{})[TC]===true,at=(ENR[r.uid]||{})["at_"+TC],pd=pendingOf(r.uid);
    return `<div class="enr${on?" on":""}${pd?" pend":""}"><div><b>${escH(r.name||"(chưa có tên)")}</b><small>${escH(r.email||"")}</small></div><span class="enr-st">${on?`✓ Đã kích hoạt${at?" · "+fmtTime(at):""}`:pd?`● Báo đã chuyển khoản · ${fmtTime(pd)}`:"Chưa kích hoạt"}</span><button class="btn sm${on?"":" pri"}" data-u="${escH(r.uid)}">${on?"Hủy kích hoạt":"Kích hoạt"}</button></div>`}).join("")+(st.length>200?`<p class="note">Đang hiện 200 / ${st.length} học viên. Dùng ô tìm kiếm để lọc.</p>`:"");
  el.querySelectorAll("[data-u]").forEach(b=>b.onclick=async()=>{const r=all.find(x=>x.uid===b.dataset.u),on=!((ENR[r.uid]||{})[TC]===true),c=courseById(TC),nP=Object.values(CFG.paid||{}).filter(Boolean).length;
    if(!confirm(on?`Kích hoạt ${r.name||""} (${r.email}) cho khóa ${c.name}?\n\nHọc viên này sẽ mở được ${nP} bài có phí. Hãy chắc chắn đã nhận đủ học phí với nội dung chuyển khoản là email trên.`:`Hủy kích hoạt ${r.name||""} (${r.email}) khỏi khóa ${c.name}?\n\nHọc viên này sẽ không mở được ${nP} bài có phí nữa.`))return;
    b.disabled=true;b.textContent="Đang lưu…";
    try{await AMTS.setEnroll(r.uid,TC,on,{email:r.email,name:r.name});ENR[r.uid]=Object.assign({},ENR[r.uid],{[TC]:on,["at_"+TC]:new Date()});
      if(on&&PAYREQ[r.uid]){try{await AMTS.clearPayReq(r.uid,TC);const x=Object.assign({},PAYREQ[r.uid].courses);delete x[TC];PAYREQ[r.uid]=Object.assign({},PAYREQ[r.uid],{courses:x})}catch(e){}}
      renderAdmin()}
    catch(e){b.disabled=false;b.textContent="Thử lại";alert("Không lưu được: "+(e.code==="permission-denied"?"Firestore từ chối. Hãy dán bộ quy tắc firestore.rules mới.":(e.message||e.code)))}});
}
async function uploadPkg(){
  const f=document.getElementById("a-file").files[0],msg=document.getElementById("a-umsg");
  if(!f){msg.textContent=`Hãy chọn file noi-dung-${TC}.json trước.`;return}
  let pkg;try{pkg=JSON.parse(await f.text())}catch(e){msg.textContent="File không đọc được (không phải JSON).";return}
  if(pkg.course!==TC){msg.textContent=`File này là nội dung của khóa “${pkg.course||"?"}”, không phải khóa đang chọn.`;return}
  const btn=document.getElementById("a-up");btn.disabled=true;
  if((CFG.versions||{})[pkg.ver]&&!confirm(`Phiên bản ${pkg.ver} đã có trên máy chủ. Tải lại (ghi đè đúng phiên bản này)?`)){btn.disabled=false;return}
  try{const n=await AMTS.uploadContent(pkg,(k,t,ph)=>msg.textContent=ph==="verify"?`Đang kiểm tra lại ${k-t/2}/${t/2} bài…`:`Đang tải lên ${k}/${t/2} bài…`);
    CFG=await AMTS.getConfig(TC,true);PUB[TC]=CFG;msg.textContent="";
    admMsg=`Đã tải lên và kiểm tra đủ ${n} bài, phiên bản ${pkg.ver}.`+(pkg.ver===courseById(TC).contentVer?" Khớp bản trang hiện tại.":" Bây giờ có thể đưa bản trang mới (cùng đợt build) lên GitHub.");renderAdmin()}
  catch(e){btn.disabled=false;msg.textContent="Không tải lên được: "+(e.code==="permission-denied"?"Firestore từ chối. Hãy dán bộ quy tắc firestore.rules mới.":(e.message||e.code))}
}

let ALL=[],TC="cpp",loadedFor=null;
const tsMs=t=>t?(t.toMillis?t.toMillis():new Date(t).getTime()):0;
function fmtTime(t){if(!t)return"—";const d=t.toDate?t.toDate():new Date(t);if(isNaN(d))return"—";return d.toLocaleString("vi-VN",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"})}
function summarize(r,c){
  const p=AMTS.courseOf(r,c.id);if(!p)return null;
  const done=c.lessons.filter(([l])=>AMTS.isDone(p,l,c.id)).map(x=>x[0]);
  const exPass=c.exercises.filter(k=>(p.ex[k]||{}).pass).length;
  const qs=Object.values(p.quiz||{}).filter(q=>q&&q.total);const qavg=qs.length?Math.round(qs.reduce((s,q)=>s+(q.best||0)/q.total,0)/qs.length*100):null;
  const upd=(r.courses&&r.courses[c.id]&&r.courses[c.id].updatedAt)||r.lastSeen;
  return{p,done,exPass,qavg,upd};
}
const students=()=>ALL.filter(r=>!AMTS.TEACHERS.includes((r.email||"").toLowerCase()));
async function loadTeacher(){
  const box=document.getElementById("t-body");box.innerHTML=`<p class="empty">Đang tải danh sách học viên…</p>`;
  try{ALL=await AMTS.allUsers();loadedFor=AMTS.S.user.uid;renderTeacher();loadAdmin()}
  catch(e){box.innerHTML=`<p class="empty bad-t">${e.code==="permission-denied"?"Firestore từ chối: hãy kiểm tra đã dán quy tắc bảo mật mới và email giảng viên trong quy tắc trùng với email đang đăng nhập.":"Không tải được dữ liệu: "+escH(e.message||"")}</p>`}
}
function renderTabs(){
  document.getElementById("t-tabs").innerHTML=COURSES.map(c=>`<button role="tab" aria-selected="${c.id===TC}" data-c="${c.id}">${escH(c.name)}${c.status==="open"?"":" <small>(sắp ra mắt)</small>"}</button>`).join("");
  document.querySelectorAll("#t-tabs [data-c]").forEach(b=>b.onclick=()=>{TC=b.dataset.c;renderTabs();renderTeacher();CFG=null;loadAdmin()});
}
function renderTeacher(){
  const c=courseById(TC),q=(document.getElementById("t-q").value||"").toLowerCase().trim();
  if(!c.lessons.length){const w=students().filter(r=>r.courses&&r.courses[c.id]&&r.courses[c.id].notify);
    document.getElementById("t-stats").innerHTML=`<div><b>${students().length}</b><span>học viên đã đăng nhập</span></div><div><b>${w.length}</b><span>đăng ký nhận thông báo khi khóa mở</span></div>`;
    document.getElementById("t-body").innerHTML=w.length?`<div class="tbl"><table><thead><tr><th>Học viên chờ khóa ${escH(c.name)}</th><th>Email</th><th>Đăng ký lúc</th></tr></thead><tbody>${w.map(r=>`<tr><td>${escH(r.name||"")}</td><td>${escH(r.email||"")}</td><td>${r.courses[c.id].notifyAt?escH(new Date(r.courses[c.id].notifyAt).toLocaleDateString("vi-VN")):""}</td></tr>`).join("")}</tbody></table></div><p class="note">Khi mở khóa, hãy gửi email báo cho danh sách này (có thể xuất bằng nút Xuất Excel).</p>`
      :`<p class="empty">Khóa ${escH(c.name)} chưa có bài học và chưa có ai đăng ký nhận thông báo.</p>`;return}
  const st=students(),inC=st.map(r=>({r,s:summarize(r,c)})).filter(x=>x.s);
  const active=inC.filter(x=>Date.now()-tsMs(x.s.upd)<7*864e5).length;
  const avg=inC.length?(inC.reduce((a,x)=>a+x.s.done.length,0)/inC.length).toFixed(1):"0";
  document.getElementById("t-stats").innerHTML=`<div><b>${st.length}</b><span>học viên đã đăng nhập</span></div><div><b>${inC.length}</b><span>đã bắt đầu khóa này</span></div><div><b>${active}</b><span>học khóa này 7 ngày qua</span></div><div><b>${avg}</b><span>bài hoàn thành trung bình</span></div>`;
  const box=document.getElementById("t-body");
  if(!c.lessons.length){box.innerHTML=`<p class="empty">Khóa ${escH(c.name)} chưa có bài học. Bảng tiến độ sẽ hiện khi khóa được mở.</p>`;return}
  const rows=inC.filter(({r})=>!q||(r.name||"").toLowerCase().includes(q)||(r.email||"").includes(q)).sort((a,b)=>tsMs(b.s.upd)-tsMs(a.s.upd));
  if(!rows.length){box.innerHTML=`<p class="empty">${inC.length?"Không có học viên khớp từ khóa.":"Chưa có học viên nào học khóa này. Danh sách sẽ hiện khi học viên đăng nhập và mở bài học."}</p>`;return}
  const L=c.lessons;
  box.innerHTML=`<div class="tbl"><table class="tt"><thead><tr><th>Học viên</th>${L.map(([l,n],i)=>`<th title="${escH(n)}">B${i+1}</th>`).join("")}<th>Bài tập</th><th>Trắc nghiệm</th><th>Lần cuối</th></tr></thead><tbody>${
    rows.map(({r,s})=>`<tr class="trow" data-id="${escH(r.uid)}" tabindex="0"><td><b>${escH(r.name||"(chưa có tên)")}</b><small>${escH(r.email||"")}</small></td>${L.map(([l])=>`<td class="st">${stCell(s.p,l,c.id)}</td>`).join("")}
      <td class="num">${s.exPass}/${c.exercises.length}</td><td class="num">${s.qavg===null?"—":s.qavg+"%"}</td><td class="when">${fmtTime(s.upd)}${s.p.lastLesson?`<small>${escH((L.find(x=>x[0]===s.p.lastLesson)||[])[1]||"")}</small>`:""}</td></tr>
      <tr class="tdetail" hidden data-for="${escH(r.uid)}"><td colspan="${L.length+4}">${detail(s.p,c)}</td></tr>`).join("")}</tbody></table></div>
    <ul class="t-cards">${rows.map(({r,s})=>{const n=s.done.length,pct=Math.round(n/L.length*100);
      return `<li><details><summary><span class="tc-who"><b>${escH(r.name||"(chưa có tên)")}</b><small>${escH(r.email||"")}</small></span>
        <span class="tc-p"><span class="pbar" role="progressbar" aria-label="Tiến độ" aria-valuemin="0" aria-valuemax="${L.length}" aria-valuenow="${n}"><span style="width:${pct}%"></span></span><small>${n}/${L.length} bài · Bài tập ${s.exPass}/${c.exercises.length} · Trắc nghiệm ${s.qavg===null?"—":s.qavg+"%"}</small></span>
        <small class="tc-when">Lần cuối: ${fmtTime(s.upd)}</small></summary>${detail(s.p,c)}</details></li>`}).join("")}</ul>
    <p class="note">✓ đạt kiểm tra (bài tập ≥ 2/3 và trắc nghiệm ≥ 3/4) · ☑ học viên tự đánh dấu học xong · ◑ đã làm bài tập · ◔ đã đọc · bấm vào một học viên để xem chi tiết.</p>`;
  box.querySelectorAll(".trow").forEach(tr=>{const f=()=>{const d=[...box.querySelectorAll(".tdetail")].find(x=>x.dataset.for===tr.dataset.id);d.hidden=!d.hidden;tr.classList.toggle("open",!d.hidden)};tr.onclick=f;tr.onkeydown=e=>{if(e.key==="Enter")f()}});
}
function stCell(p,l,cid){const D=AMTS.detailOf(p,l,cid);
  return D.level===3?'<span class="s-done" title="Đạt kiểm tra">✓</span>':D.manual?'<span class="s-done" title="Tự đánh dấu học xong">☑</span>':D.level===2?'<span class="s-ex" title="Đã làm bài tập">◑</span>':D.level===1?'<span class="s-seen" title="Đã đọc">◔</span>':'<span class="s-no">·</span>'}
const LV_NAME=["Chưa học","Đã đọc","Đã làm bài tập","✓ Đạt kiểm tra"];
function detail(p,c){
  return `<div class="tdet">${c.lessons.map(([l,n],i)=>{const exs=c.exercises.filter(k=>k.startsWith(l+"-"));const q=p.quiz[c.quizzes[l]];
    return `<div><b>Bài ${i+1}</b> <small>${escH(n)}</small><span>${(()=>{const D=AMTS.detailOf(p,l,c.id);return LV_NAME[D.level]+(D.manual&&D.level<3?" · tự đánh dấu học xong":"")})()}</span>
      <span>Bài tập: ${exs.length?exs.map(k=>{const x=p.ex[k];return `<i class="${x?x.pass?"ok":"bad":""}" title="${escH(k)}${x&&x.d?" · "+escH(x.d):""}">${x?x.pass?"✓":"✗":"·"}</i>`}).join(""):"—"}</span>
      <span>Trắc nghiệm: ${q?`${q.score}/${q.total} (cao nhất ${q.best}/${q.total})`:"—"}</span></div>`}).join("")}</div>`;
}
function download(name,text,type){
  const blob=new Blob([text],{type});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=name;
  document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},800);
}
const today=()=>new Date().toISOString().slice(0,10);
function exportCSV(){
  const c=courseById(TC);if(!c.lessons.length)return;
  const head=["Họ tên","Email","Khóa học","Số bài hoàn thành","Các bài hoàn thành","Bài tập đạt","Trắc nghiệm TB (%)","Bài gần nhất","Lần cuối học khóa này","Ngày bắt đầu dùng trang"];
  const q=s=>`"${String(s??"").replace(/"/g,'""')}"`;
  const rows=students().map(r=>({r,s:summarize(r,c)})).filter(x=>x.s);
  const lines=[head.map(q).join(",")].concat(rows.map(({r,s})=>[r.name,r.email,c.name,s.done.length,s.done.map(l=>"Bài "+(c.lessons.findIndex(x=>x[0]===l)+1)).join("; "),`${s.exPass}/${c.exercises.length}`,s.qavg??"",(c.lessons.find(x=>x[0]===s.p.lastLesson)||[])[1]||"",fmtTime(s.upd),fmtTime(r.createdAt)].map(q).join(",")));
  download(`tien-do-${c.id}-${today()}.csv`,"﻿"+lines.join("\r\n"),"text/csv;charset=utf-8");
}
/* Sao lưu: Timestamp của Firestore ghi thành {"$ts":"ISO"} để khôi phục lại đúng kiểu thời gian */
function plain(v){if(v&&typeof v.toDate==="function")return {$ts:v.toDate().toISOString()};if(Array.isArray(v))return v.map(plain);if(v&&typeof v==="object"){const o={};for(const k in v)o[k]=plain(v[k]);return o}return v}
const TS_KEYS=/^(createdAt|lastSeen|updatedAt|uploadedAt|savedAt|at_[\w-]+)$/;
function revive(v,key){
  const TS=window.firebase&&firebase.firestore&&firebase.firestore.Timestamp,mk=iso=>{const d=new Date(iso);return isNaN(d)?iso:(TS?TS.fromDate(d):d)};
  if(v&&typeof v==="object"&&!Array.isArray(v)&&Object.keys(v).length===1&&typeof v.$ts==="string")return mk(v.$ts);
  if(typeof v==="string"&&key&&TS_KEYS.test(key)&&/^\d{4}-\d\d-\d\dT/.test(v))return mk(v);   // bản sao lưu cũ (v2): thời gian là chuỗi
  if(Array.isArray(v))return v.map(x=>revive(x));
  if(v&&typeof v==="object"){const o={};for(const k in v)o[k]=revive(v[k],k);return o}
  return v}
async function exportJSON(){
  const msg=document.getElementById("t-msg");msg.textContent="Đang lấy dữ liệu mới nhất…";
  try{ALL=await AMTS.allUsers();renderTeacher();
    const [config,enroll,content]=await Promise.all(["config","enroll","content"].map(c=>AMTS.dump(c)));
    const data={app:"AMTS Học Lập Trình",format:"amts-backup-v3",firebaseProject:AMTS.PROJECT,exportedAt:new Date().toISOString(),exportedBy:AMTS.S.user.email,
      note:"users: tiến độ học viên · config: cài đặt truy cập/học phí · enroll: danh sách kích hoạt · content: phần chữ bài học. Thời gian dạng {\"$ts\": ISO}. KHÔNG gồm: tài khoản đăng nhập (Firebase Authentication), quy tắc Firestore, mã nguồn.",
      counts:{users:ALL.length,config:Object.keys(config).length,enroll:Object.keys(enroll).length,content:Object.keys(content).length},
      courses:COURSES.map(c=>({id:c.id,name:c.name})),users:ALL.map(plain),config:plain(config),enroll:plain(enroll),content:plain(content)};
    download(`amts-sao-luu-${today()}.json`,JSON.stringify(data,null,1),"application/json");
    msg.textContent=`Đã tạo bản sao lưu: ${ALL.length} học viên, ${Object.keys(content).length} bài học, ${Object.keys(enroll).length} tài khoản kích hoạt.`}
  catch(e){msg.textContent="Không sao lưu được: "+(e.code==="permission-denied"?"Firestore từ chối truy cập. Hãy dán bộ quy tắc firestore.rules mới.":(e.message||e.code))}
}
/* kiểm tra cấu trúc file trước khi ghi bất cứ thứ gì */
function checkBackup(d){
  const E=[],isObj=x=>x&&typeof x==="object"&&!Array.isArray(x);
  if(!isObj(d))return["File không phải bản sao lưu của AMTS."];
  if(!/^amts-backup-v[23]$/.test(d.format||""))E.push(`Định dạng “${d.format||"?"}” không được hỗ trợ (cần amts-backup-v2 hoặc v3).`);
  if(!Array.isArray(d.users))E.push("Thiếu danh sách users.");
  else d.users.forEach((u,i)=>{if(!isObj(u)||typeof u.uid!=="string"||!u.uid)E.push(`users[${i}] thiếu uid.`);else if(u.courses!==undefined&&!isObj(u.courses))E.push(`users[${i}].courses sai kiểu.`)});
  for(const c of ["config","enroll","content"])if(d[c]!==undefined&&!isObj(d[c]))E.push(`Mục ${c} sai kiểu.`);
  for(const id in d.content||{}){const x=d.content[id];if(!isObj(x)||typeof x.html!=="string"||typeof x.lesson!=="string"||typeof x.course!=="string")E.push(`content/${id} thiếu html, lesson hoặc course.`)}
  for(const id in d.config||{}){const x=d.config[id];if(!isObj(x)||(x.paid!==undefined&&!isObj(x.paid)))E.push(`config/${id} sai cấu trúc.`)}
  return E.slice(0,8)}
async function restoreJSON(f){
  const msg=document.getElementById("t-msg");let d;
  try{d=JSON.parse(await f.text())}catch(e){msg.textContent="File không đọc được (không phải JSON).";return}
  const errs=checkBackup(d);
  if(errs.length){msg.textContent="Không khôi phục: file sao lưu không hợp lệ. "+errs.join(" ");return}
  const n={users:d.users.length,config:Object.keys(d.config||{}).length,enroll:Object.keys(d.enroll||{}).length,content:Object.keys(d.content||{}).length};
  const other=d.firebaseProject&&d.firebaseProject!==AMTS.PROJECT?`\n\n⚠ File được tạo từ dự án Firebase “${d.firebaseProject}”, khác dự án hiện tại.`:"";
  if(!confirm(`Khôi phục từ bản sao lưu ngày ${(d.exportedAt||"?").slice(0,10)}?\n\n• ${n.users} học viên (tiến độ)\n• ${n.config} cài đặt khóa học\n• ${n.enroll} tài khoản kích hoạt\n• ${n.content} bài học\n\nCách khôi phục: mục nào có trong file sẽ GHI ĐÈ mục cùng tên trên máy chủ. Mục đang có trên máy chủ nhưng không có trong file được GIỮ NGUYÊN. Đây không phải đưa toàn bộ hệ thống về đúng thời điểm sao lưu.\nKhông gồm tài khoản đăng nhập, quy tắc Firestore và mã nguồn.${other}`))return;
  let k=0;const tot=n.users+n.config+n.enroll+n.content;const tick=()=>msg.textContent=`Đang khôi phục ${++k}/${tot}…`;
  try{
    for(const u of d.users){const {uid,...rest}=u;await AMTS.restoreDoc("users",uid,revive(rest));tick()}
    for(const col of ["config","enroll","content"])for(const id in (d[col]||{})){await AMTS.restoreDoc(col,id,revive(d[col][id]));tick()}
    msg.textContent=`Đã khôi phục ${k} mục (ghi đè các mục trùng tên). Đang tải lại…`;loadTeacher()}
  catch(e){msg.textContent=`Dừng ở mục ${k}/${tot}: `+(e.code==="permission-denied"?"Firestore từ chối. Hãy dán bộ quy tắc firestore.rules mới (cho phép giảng viên khôi phục).":(e.message||e.code))}
}
document.getElementById("t-rf").addEventListener("change",e=>{const f=e.target.files[0];e.target.value="";if(f)restoreJSON(f)});
document.getElementById("t-q").addEventListener("input",()=>ALL.length&&renderTeacher());
document.getElementById("t-reload").onclick=loadTeacher;
document.getElementById("t-csv").onclick=exportCSV;
document.getElementById("t-json").onclick=exportJSON;

function renderAll(){
  TOPNAV.render();renderResume();renderCourses();
  if(AMTS.S.user&&AMTS.S.docLoaded&&wantNotify){const id=wantNotify;wantNotify=null;if(!AMTS.notifyOf(id))setNotifyUI(id,true)}
  if(AMTS.S.mode==="ready"&&!pubAsked){pubAsked=true;Promise.all(COURSES.filter(c=>c.status==="open").map(c=>AMTS.getConfig(c.id).then(f=>{if(f.exists)PUB[c.id]=f}).catch(()=>{}))).then(()=>{renderResume();renderCourses()})}
  const S=AMTS.S,t=document.getElementById("giang-vien"),isT=AMTS.isTeacher();
  t.hidden=!isT;
  if(isT&&S.user&&loadedFor!==S.user.uid){renderTabs();loadTeacher();if(location.hash==="#giang-vien")setTimeout(()=>t.scrollIntoView(),50)}
  if(!isT){ALL=[];loadedFor=null}
}
AMTS.on(renderAll);
AMTS.init();
