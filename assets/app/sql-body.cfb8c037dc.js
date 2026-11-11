/* ===================== trình mô phỏng của khóa (platform/js/57-sql-data.js) ===================== */
/* ===================== Phòng thực hành SQL · phần 2: bộ dữ liệu mẫu =====================
   Mọi tên người, cửa hàng, số liệu dưới đây là DỮ LIỆU MẪU TỰ ĐẶT để học, không phải dữ liệu thật.
   Mỗi bộ: {title, note, tables:[{name, cols:[[tên cột, "kiểu và ràng buộc"]], rows:[[…]], extra:["ràng buộc bảng"]}]}.
   Kiểu và ràng buộc chỉ dùng loại chạy được ở cả SQLite và PostgreSQL (INTEGER, TEXT, DATE, NUMERIC, PRIMARY KEY, NOT NULL,
   UNIQUE, CHECK, REFERENCES), để tests/sql/crosscheck.js nạp cùng một đoạn SQL vào cả hai hệ.
   Bộ có hậu tố _kt là bộ kiểm tra thêm của bài tập (cùng cấu trúc, khác số liệu) để câu trả lời ghi cứng giá trị không qua được.
   Thêm bộ mới: docs/TRINH-MO-PHONG-SQL.md mục 6. */
(function(G){
"use strict";
const D={};
D.lop={title:"Lớp học",note:"Dữ liệu mẫu tự đặt: 8 học viên, điểm thang 10. NULL ở cột diem là học viên vắng thi (chưa có điểm), NULL ở cột lop là học viên chưa xếp lớp.",
  tables:[{name:"hoc_vien",cols:[["id","INTEGER PRIMARY KEY"],["ho_ten","TEXT NOT NULL"],["lop","TEXT"],["nam_sinh","INTEGER"],["diem","INTEGER CHECK (diem BETWEEN 0 AND 10)"]],
    rows:[[1,"Nguyễn An","10A",2010,8],[2,"Trần Bình","10A",2010,6],[3,"Lê Chi","10B",2010,9],[4,"Phạm Dũng","10B",2009,null],
          [5,"Hoàng Em","10A",2010,10],[6,"Vũ Giang",null,2011,7],[7,"Đỗ Hà","10C",2010,5],[8,"Bùi Khánh","10B",2010,8]]}]};
D.lop_kt={title:"Lớp học (bộ kiểm tra)",note:"Bộ kiểm tra thêm của bài tập: cùng cấu trúc với Lớp học, số liệu khác.",
  tables:[{name:"hoc_vien",cols:D.lop.tables[0].cols,
    rows:[[1,"Mai Lan","10B",2010,7],[2,"Ngô Minh","10A",2009,9],[3,"Lý Na",null,2010,null],[4,"Tạ Phong","10C",2010,8],
          [5,"Hồ Quân","10A",2010,4],[6,"Đinh Sơn","10C",2011,10],[7,"La Tú","10B",2010,null],[8,"Kiều Vy","10B",2010,9]]}]};
D.cuahang={title:"Cửa hàng",note:"Dữ liệu mẫu tự đặt: 4 khách hàng, 6 đơn hàng; tong_tien tính bằng nghìn đồng (giả định). Khách Dũng chưa mua đơn nào; đơn 105 của khách vãng lai (khach_id là NULL).",
  tables:[{name:"khach_hang",cols:[["id","INTEGER PRIMARY KEY"],["ten","TEXT NOT NULL"],["thanh_pho","TEXT"]],
    rows:[[1,"An","Hà Nội"],[2,"Bình","Đà Nẵng"],[3,"Chi","Hà Nội"],[4,"Dũng","Cần Thơ"]]},
   {name:"don_hang",cols:[["id","INTEGER PRIMARY KEY"],["khach_id","INTEGER REFERENCES khach_hang(id)"],["ngay","DATE NOT NULL"],["tong_tien","INTEGER NOT NULL CHECK (tong_tien >= 0)"]],
    rows:[[101,1,"2026-01-05",250],[102,2,"2026-01-09",120],[103,1,"2026-02-11",90],[104,3,"2026-02-14",300],[105,null,"2026-02-20",60],[106,2,"2026-03-02",180]]}]};
D.cuahang_kt={title:"Cửa hàng (bộ kiểm tra)",note:"Bộ kiểm tra thêm của bài tập: cùng cấu trúc với Cửa hàng, số liệu khác.",
  tables:[{name:"khach_hang",cols:D.cuahang.tables[0].cols,rows:[[1,"Hạnh","Huế"],[2,"Khoa","Hà Nội"],[3,"Linh","Huế"],[4,"Nam","Đà Nẵng"],[5,"Oanh","Hà Nội"]]},
   {name:"don_hang",cols:D.cuahang.tables[1].cols,
    rows:[[201,2,"2026-04-01",75],[202,2,"2026-04-03",310],[203,5,"2026-04-08",40],[204,null,"2026-04-10",55],[205,1,"2026-05-02",500],[206,5,"2026-05-06",95],[207,2,"2026-05-09",20]]}]};
/* ---------- kịch bản hình động dùng chung (bài nào cần thì gọi makeSqlViz(el, {pick:[mã…]})) ----------
   {id, label (Ví dụ/Bẫy/Lỗi: …), note, data (tên bộ dữ liệu), spec (đặc tả cho SQLENG.trace)}
   Mã kịch bản: chữ cái loại + số (w = WHERE, g = GROUP BY, j = JOIN); thêm mới ở cuối, không đổi mã đã dùng. */
const hv=["ho_ten","lop","diem"];
const V=[
 {id:"w1",label:"Ví dụ: lọc học viên có điểm từ 8",data:"lop",note:"Mỗi dòng được xét riêng: so diem với 8. Điểm NULL (vắng thi) cho kết quả NULL, không phải TRUE.",
  spec:{kind:"where",table:"hoc_vien",cols:hv,where:"diem >= 8"}},
 {id:"w2",label:"Ví dụ: AND, lớp 10A và điểm từ 8",data:"lop",note:"AND chỉ TRUE khi cả hai vế TRUE. Xem giá trị từng vế ở mỗi dòng.",
  spec:{kind:"where",table:"hoc_vien",cols:hv,where:"lop = '10A' AND diem >= 8",parts:["lop = '10A'","diem >= 8"]}},
 {id:"w3",label:"Bẫy: tìm điểm trống bằng diem = NULL",data:"lop",note:"So sánh bất kỳ giá trị nào với NULL bằng = cho NULL (chưa biết), kể cả NULL = NULL. Vì vậy không dòng nào được giữ.",
  spec:{kind:"where",table:"hoc_vien",cols:hv,where:"diem = NULL"}},
 {id:"w4",label:"Ví dụ: IS NULL tìm học viên vắng thi",data:"lop",note:"Muốn hỏi “có phải NULL không” thì dùng IS NULL; kết quả luôn là TRUE hoặc FALSE.",
  spec:{kind:"where",table:"hoc_vien",cols:hv,where:"diem IS NULL"}},
 {id:"w5",label:"Bẫy: OR khi một vế là NULL",data:"lop",note:"Logic ba giá trị: TRUE OR NULL = TRUE, FALSE OR NULL = NULL. Dòng có vế NULL chỉ được giữ khi vế còn lại TRUE.",
  spec:{kind:"where",table:"hoc_vien",cols:hv,where:"lop = '10A' OR diem >= 9",parts:["lop = '10A'","diem >= 9"]}},
 {id:"w6",label:"Bẫy: NOT không lấy được phần còn lại",data:"lop",note:"NOT NULL vẫn là NULL. Vì vậy WHERE điều_kiện và WHERE NOT (điều_kiện) cộng lại có thể thiếu dòng có NULL.",
  spec:{kind:"where",table:"hoc_vien",cols:hv,where:"NOT (diem >= 8)",parts:["diem >= 8"]}},
 {id:"g1",label:"Ví dụ: đếm học viên theo lớp",data:"lop",note:"GROUP BY lop: mỗi giá trị khác nhau của lop thành một nhóm, kể cả nhóm NULL (học viên chưa xếp lớp).",
  spec:{kind:"group",table:"hoc_vien",cols:hv,key:"lop",aggs:["COUNT(*)"]}},
 {id:"g2",label:"Bẫy: COUNT(*) khác COUNT(diem)",data:"lop",note:"COUNT(*) đếm dòng; COUNT(diem) chỉ đếm dòng có điểm. AVG(diem) chia cho số dòng có điểm, không chia cho số học viên.",
  spec:{kind:"group",table:"hoc_vien",cols:hv,key:"lop",aggs:["COUNT(*)","COUNT(diem)","AVG(diem)"]}},
 {id:"g3",label:"Ví dụ: HAVING giữ lớp có từ 2 học viên",data:"lop",note:"HAVING lọc nhóm, chạy sau khi đã tính COUNT(*) cho từng nhóm.",
  spec:{kind:"group",table:"hoc_vien",cols:hv,key:"lop",aggs:["COUNT(*)","MAX(diem)"],having:"COUNT(*) >= 2"}},
 {id:"g4",label:"Ví dụ: WHERE lọc dòng trước, GROUP BY sau",data:"lop",note:"WHERE diem >= 7 loại dòng trước khi gom nhóm, nên số đếm ở mỗi lớp nhỏ đi.",
  spec:{kind:"group",table:"hoc_vien",cols:hv,key:"lop",aggs:["COUNT(*)"],where:"diem >= 7"}},
 {id:"g5",label:"Ví dụ: doanh thu theo khách hàng",data:"cuahang",note:"Gom đơn hàng theo khach_id. Đơn của khách vãng lai (khach_id NULL) thành nhóm NULL riêng. tong_tien tính bằng nghìn đồng (giả định).",
  spec:{kind:"group",table:"don_hang",cols:["id","khach_id","tong_tien"],key:"khach_id",aggs:["COUNT(*)","SUM(tong_tien)"]}},
 {id:"j1",label:"Ví dụ: INNER JOIN khách hàng với đơn hàng",data:"cuahang",note:"Mỗi khách được so với mọi đơn. Cặp nào k.id = d.khach_id là TRUE thì thành một dòng kết quả. Khách Dũng không có đơn nên bị bỏ.",
  spec:{kind:"join",type:"INNER",left:{table:"khach_hang",as:"k",cols:["id","ten"]},right:{table:"don_hang",as:"d",cols:["id","khach_id","tong_tien"]},on:"k.id = d.khach_id"}},
 {id:"j2",label:"Ví dụ: LEFT JOIN giữ khách chưa mua",data:"cuahang",note:"LEFT JOIN giữ mọi dòng của bảng trái. Khách Dũng không khớp đơn nào nên được ghép với NULL.",
  spec:{kind:"join",type:"LEFT",left:{table:"khach_hang",as:"k",cols:["id","ten"]},right:{table:"don_hang",as:"d",cols:["id","khach_id","tong_tien"]},on:"k.id = d.khach_id"}},
 {id:"j3",label:"Bẫy: đơn của khách vãng lai biến mất",data:"cuahang",note:"Đặt don_hang bên trái. Đơn 105 có khach_id NULL: NULL = k.id luôn cho NULL. INNER JOIN sẽ làm mất đơn này; LEFT JOIN giữ lại.",
  spec:{kind:"join",type:"LEFT",left:{table:"don_hang",as:"d",cols:["id","khach_id","tong_tien"]},right:{table:"khach_hang",as:"k",cols:["id","ten"]},on:"d.khach_id = k.id"}},
];
G.SQLDATA=D;G.SQLVIZ=V;
if(typeof module!=="undefined"&&module.exports)module.exports={data:D,viz:V};
})(typeof window!=="undefined"?window:globalThis);
/* ===================== trình mô phỏng của khóa (platform/js/57-sql-engine.js) ===================== */
/* ===================== Phòng thực hành SQL · phần 1: máy (engine) =====================
   Chỉ tải trên trang khóa sql (AMTS-DAT-001). Không dùng DOM để tính; chạy được trong Node (tests/sql/).
   SQLite thật trong trình duyệt: sql.js 1.14.2 (MIT, SQLite 3.49.1) chép sẵn ở platform/vendor/sqljs-1.14.2/,
   build chép sang assets/sqljs-1.14.2/. File .wasm (~650 KB) chỉ được tải khi một công cụ SQL hiện lên hoặc khi học viên bấm Chạy
   (SQLENG.load()), không tải ở trang chủ hay khóa khác. Tài liệu: docs/TRINH-MO-PHONG-SQL.md.

   SQLENG.load() → Promise<SQL>          tải sql.js (một lần); trong Node: SQLENG.useModule(await initSqlJs())
   SQLENG.seedSql(ds) → chuỗi SQL         sinh CREATE TABLE + INSERT từ bộ dữ liệu mẫu (57-sql-data.js)
   SQLENG.open(ds|sql) → Db               cơ sở dữ liệu mới trong bộ nhớ, đã nạp dữ liệu mẫu, bật khóa ngoại
   db.run(sql) → {kind:"rows",cols,rows,more} | {kind:"ok",verb,changes} | {kind:"err",msg,vi,hint}
   SQLENG.split(sql) → [{sql,line,endLine,verb}]   tách câu lệnh theo dấu ; (bỏ qua ; trong chuỗi, chú thích, thân TRIGGER)
   SQLENG.explain(msg) → {vi, hint}       giải thích lỗi của SQLite bằng tiếng Việt
   SQLENG.dialect(sql) → [{k, vi}]        chỗ khác nhau giữa SQLite và PostgreSQL trong câu lệnh
   SQLENG.canon / hash / grade            chấm bài: so tập kết quả với kết quả của truy vấn chuẩn (chỉ so mã băm)
   SQLENG.trace(db, spec) → trace         các bước của hình động (where, group, join); thêm loại mới: SQLENG.TRACERS[kind] = fn */
(function(G){
"use strict";
const SQLJS_VER="1.14.2";
const E={VER:"0.1.0",SQLJS_VER,base:"../assets/sqljs-"+SQLJS_VER+"/",SQL:null,_p:null,
  LIMIT_ROWS:5000,            // đọc tối đa 5 000 dòng mỗi câu SELECT (phần còn lại bỏ, báo “còn nữa”)
  TRACERS:{}};
/* ---------- tải sql.js (lười) ---------- */
E.useModule=SQL=>(E.SQL=SQL);
E.ready=()=>!!E.SQL;
function b64(s){const bin=G.atob(s),u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);return u}
E.load=function(){
  if(E.SQL)return Promise.resolve(E.SQL);
  if(E._p)return E._p;
  const doc=G.document;
  const add=src=>new Promise((ok,no)=>{const s=doc.createElement("script");s.src=src;s.async=true;s.onload=ok;s.onerror=()=>no(new Error("Không tải được "+src));doc.head.appendChild(s)});
  /* mở bằng file:// (bản xem trước): trình duyệt chặn fetch file .wasm cục bộ, nên dùng bản base64 nạp bằng thẻ <script> */
  const local=!!(G.location&&G.location.protocol==="file:");
  E._p=(G.initSqlJs?Promise.resolve():add(E.base+"sql-wasm.js"))
    .then(()=>local&&!G.AMTS_SQLJS_WASM?add(E.base+"sql-wasm-b64.js"):null)
    .then(()=>{if(typeof G.initSqlJs!=="function")throw new Error("sql.js chưa nạp được");
      const opt=local&&G.AMTS_SQLJS_WASM?{wasmBinary:b64(G.AMTS_SQLJS_WASM)}:{locateFile:f=>E.base+f};
      return G.initSqlJs(opt)})
    .then(S=>{try{delete G.AMTS_SQLJS_WASM}catch(e){G.AMTS_SQLJS_WASM=null}E.SQL=S;return S},e=>{E._p=null;throw e});
  return E._p};
/* ---------- dữ liệu mẫu → SQL ---------- */
const qi=n=>/^[A-Za-z_][A-Za-z0-9_]*$/.test(n)?n:'"'+String(n).replace(/"/g,'""')+'"';
function lit(v){if(v===null||v===undefined)return"NULL";if(typeof v==="number"){if(!isFinite(v))throw new Error("số không hữu hạn");return String(v)}
  if(typeof v==="boolean")return v?"TRUE":"FALSE";return"'"+String(v).replace(/'/g,"''")+"'"}
E.lit=lit;E.qi=qi;
/* ds: {tables:[{name, cols:[[tên, "kiểu và ràng buộc"]], rows:[[…]], extra:["ràng buộc bảng"]}], patch?: "SQL thêm sau"} */
E.seedSql=function(ds){if(typeof ds==="string")return ds;const o=[];
  for(const t of ds.tables){o.push(`CREATE TABLE ${qi(t.name)} (\n  ${t.cols.map(c=>qi(c[0])+" "+c[1]).concat(t.extra||[]).join(",\n  ")}\n);`)}
  for(const t of ds.tables)if(t.rows.length)o.push(`INSERT INTO ${qi(t.name)} (${t.cols.map(c=>qi(c[0])).join(", ")}) VALUES\n  ${t.rows.map(r=>"("+r.map(lit).join(", ")+")").join(",\n  ")};`);
  if(ds.patch)o.push(ds.patch);
  return o.join("\n")};
/* ---------- tách câu lệnh ---------- */
const KW_VERB=s=>{const m=/^\s*(?:(?:--[^\n]*\n?|\/\*[\s\S]*?\*\/)\s*)*([A-Za-z]+)/.exec(s);return m?m[1].toUpperCase():""};
E.verb=KW_VERB;
E.split=function(src){const out=[];let i=0,st=0,n=src.length,line=1,stLine=1,seen=false;
  const push=end=>{const t=src.slice(st,end);if(seen&&t.trim()){const lead=/^(?:\s|--[^\n]*(?:\n|$)|\/\*[\s\S]*?\*\/)*/.exec(t)[0];
      const l0=stLine+(lead.match(/\n/g)||[]).length;out.push({sql:t.trim(),line:l0,endLine:line,verb:KW_VERB(t)})}seen=false};
  let trig=false;   // trong thân CREATE TRIGGER … BEGIN … END; dấu ; không kết thúc câu lệnh
  while(i<n){const c=src[i],d=src[i+1];
    if(c==="\n"){line++;i++;continue}
    if(c==="-"&&d==="-"){while(i<n&&src[i]!=="\n")i++;continue}
    if(c==="/"&&d==="*"){const j=src.indexOf("*/",i+2);const e=j<0?n:j+2;line+=(src.slice(i,e).match(/\n/g)||[]).length;i=e;continue}
    if(c==="'"||c==='"'||c==="`"||c==="["){const q=c==="["?"]":c;let j=i+1;for(;j<n;j++){if(src[j]===q){if(q!=="]"&&src[j+1]===q){j++;continue}break}}
      line+=(src.slice(i,j).match(/\n/g)||[]).length;seen=true;i=j+1;continue}
    if(c===";"){const head=src.slice(st,i);
      if(!trig&&/^\s*(?:(?:--[^\n]*\n|\/\*[\s\S]*?\*\/)\s*)*CREATE\s+(?:TEMP\s+|TEMPORARY\s+)?TRIGGER\b/i.test(head))trig=true;
      // thân TRIGGER kết thúc ở END khớp với BEGIN: số END (ngoài chuỗi, chú thích) phải nhiều hơn số CASE … END bên trong
      if(trig){const bare=head.replace(/'(?:[^']|'')*'|"(?:[^"]|"")*"|--[^\n]*|\/\*[\s\S]*?\*\//g," ");
        if(!/\bEND\s*$/i.test(bare)||(bare.match(/\bEND\b/gi)||[]).length<=(bare.match(/\bCASE\b/gi)||[]).length){i++;continue}}
      trig=false;push(i);i++;st=i;stLine=line;continue}
    if(!/\s/.test(c))seen=true;
    i++}
  push(n);return out};
/* ---------- giải thích lỗi ---------- */
const ERR=[
  [/^no such table: (?:main\.)?(.+)$/,m=>[`Không có bảng tên “${m[1]}”.`,"Kiểm tra lại tên bảng (xem phần Cơ sở dữ liệu). Tên bảng phải viết đúng từng chữ; bảng chỉ có sau khi CREATE TABLE đã chạy."]],
  [/^no such column: (.+)$/,m=>[`Không có cột “${m[1]}”.`,`Kiểm tra tên cột trong bảng. Nếu “${m[1]}” là một chuỗi chữ thì phải đặt trong dấu nháy đơn: '${m[1].replace(/^.*\./,"")}'. Dấu nháy kép "…" dùng cho tên cột, tên bảng.`]],
  [/^near "(.+)": syntax error$/,m=>[`Lỗi cú pháp ở gần “${m[1]}”.`,"SQLite đọc tới chữ này thì không hiểu tiếp. Xem lại chính chữ đó và chữ ngay trước: thiếu dấu phẩy giữa các cột, thiếu dấu nháy đóng chuỗi, viết sai từ khóa (SELECT, FROM, WHERE…), hoặc sai thứ tự mệnh đề (SELECT … FROM … WHERE … GROUP BY … HAVING … ORDER BY … LIMIT)."]],
  [/^incomplete input$/,()=>["Câu lệnh chưa viết xong.","Có thể thiếu dấu nháy đóng chuỗi, thiếu dấu ngoặc đóng ) hoặc câu lệnh dừng giữa chừng."]],
  [/^unrecognized token: "(.+)"$/,m=>[`Có ký tự không hợp lệ: ${m[1]}`,"Thường do dấu nháy chưa đóng, hoặc dùng dấu nháy cong “ ” ‘ ’ thay cho dấu nháy thẳng ' \"."]],
  [/^UNIQUE constraint failed: (.+)$/,m=>[`Vi phạm ràng buộc UNIQUE / PRIMARY KEY ở ${m[1]}: giá trị này đã có trong bảng.`,"Khóa chính và cột UNIQUE không được trùng. Đổi giá trị, hoặc kiểm tra dòng đã có."]],
  [/^NOT NULL constraint failed: (.+)$/,m=>[`Cột ${m[1]} không được để trống (NOT NULL).`,"Câu lệnh INSERT/UPDATE phải ghi giá trị cho cột này."]],
  [/^FOREIGN KEY constraint failed$/,()=>["Vi phạm khóa ngoại (FOREIGN KEY).","Giá trị khóa ngoại phải có trong bảng được tham chiếu; hoặc bạn đang xóa một dòng mà bảng khác còn tham chiếu tới."]],
  [/^CHECK constraint failed: (.+)$/,m=>[`Vi phạm ràng buộc CHECK: ${m[1]}.`,"Giá trị mới không thỏa điều kiện CHECK của bảng."]],
  [/^misuse of aggregate(?: function)?:? ?(.*)$/,m=>[`Dùng hàm tổng hợp ${m[1]||""} sai chỗ.`.replace("  "," "),"Hàm COUNT, SUM, AVG, MIN, MAX không dùng được trong WHERE (WHERE lọc từng dòng, trước khi gom nhóm). Điều kiện trên kết quả tổng hợp viết ở HAVING."]],
  [/^a GROUP BY clause is required before HAVING$/,()=>["Có HAVING nhưng thiếu GROUP BY.","HAVING lọc các nhóm, nên cần GROUP BY trước nó (SQLite cũ bắt buộc; PostgreSQL cho phép HAVING không có GROUP BY, khi đó cả bảng là một nhóm)."]],
  [/^ambiguous column name: (.+)$/,m=>[`Tên cột “${m[1]}” mơ hồ: có ở nhiều bảng.`,`Ghi rõ bảng hoặc bí danh trước tên cột, ví dụ k.${m[1].replace(/^.*\./,"")}.`]],
  [/^table (.+) already exists$/,m=>[`Bảng ${m[1]} đã có.`,"Dùng CREATE TABLE IF NOT EXISTS, hoặc DROP TABLE trước. Bấm ↺ để về dữ liệu mẫu ban đầu."]],
  [/^table (.+) has (\d+) columns but (\d+) values were supplied$/,m=>[`Bảng ${m[1]} có ${m[2]} cột nhưng câu lệnh ghi ${m[3]} giá trị.`,"Ghi danh sách cột sau tên bảng: INSERT INTO bảng (cột1, cột2) VALUES (…), số giá trị bằng số cột."]],
  [/^(\d+) values for (\d+) columns$/,m=>[`Có ${m[1]} giá trị cho ${m[2]} cột.`,"Số giá trị trong VALUES (…) phải bằng số cột đã liệt kê."]],
  [/^no such function: (.+)$/,m=>[`SQLite không có hàm ${m[1]}.`,"Hàm này có thể chỉ có ở hệ khác (ví dụ PostgreSQL). Xem phần SQLite và PostgreSQL bên dưới."]],
  [/^wrong number of arguments to function (.+)$/,m=>[`Gọi hàm ${m[1]} sai số đối số.`,"Kiểm tra số giá trị trong ngoặc của hàm."]],
  [/^datatype mismatch$/,()=>["Sai kiểu dữ liệu.","Ví dụ ghi chữ vào cột INTEGER PRIMARY KEY."]],
  [/^cannot commit - no transaction is active$|^cannot rollback - no transaction is active$/,()=>["Chưa có giao dịch nào đang mở.","Bắt đầu giao dịch bằng BEGIN trước khi COMMIT hoặc ROLLBACK."]],
  [/^cannot start a transaction within a transaction$/,()=>["Đang ở trong một giao dịch rồi.","Kết thúc giao dịch hiện tại bằng COMMIT hoặc ROLLBACK trước."]],
  [/^sub-select returns (\d+) columns - expected 1$/,m=>[`Truy vấn con trả về ${m[1]} cột, nhưng ở chỗ này chỉ được 1 cột.`,"Truy vấn con dùng như một giá trị (sau =, IN …) chỉ được chọn một cột."]],
  [/^SELECTs to the left and right of (UNION|UNION ALL|INTERSECT|EXCEPT) do not have the same number of result columns$/,m=>[`Hai câu SELECT hai bên ${m[1]} có số cột khác nhau.`,"Hai câu phải chọn cùng số cột, theo cùng thứ tự."]],
  [/^(?:ORDER BY|GROUP BY) term out of range - should be between 1 and (\d+)$/,m=>[`Số thứ tự cột trong ORDER BY / GROUP BY phải từ 1 tới ${m[1]}.`,"ORDER BY 2 nghĩa là sắp theo cột thứ hai của SELECT."]],
  [/^too many terms in compound SELECT$|^interrupted$/,()=>["Câu lệnh quá lớn hoặc bị ngắt.",""]],
];
E.explain=function(msg){msg=String(msg||"").replace(/^Error:\s*/,"").trim();
  for(const [re,f] of ERR){const m=re.exec(msg);if(m){const [vi,hint]=f(m);return{vi,hint}}}
  return{vi:"SQLite báo lỗi: "+msg,hint:""}};
/* ---------- chỗ khác nhau giữa SQLite và PostgreSQL (đã đối chiếu bằng tests/sql/crosscheck.js) ---------- */
const DIA=[
  ["limitcomma",/\bLIMIT\s+\d+\s*,\s*\d+/i,"LIMIT a, b (bỏ a dòng, lấy b dòng) chỉ có ở SQLite và MySQL. PostgreSQL báo lỗi; viết LIMIT b OFFSET a, cách này chạy được ở cả hai."],
  ["autoinc",/\bAUTOINCREMENT\b/i,"AUTOINCREMENT là của SQLite. PostgreSQL dùng id INTEGER GENERATED ALWAYS AS IDENTITY (hoặc SERIAL)."],
  ["ipk",/\bINTEGER\s+PRIMARY\s+KEY\b/i,"Ở SQLite, cột INTEGER PRIMARY KEY tự cấp số khi INSERT không ghi giá trị cho nó. PostgreSQL không tự cấp; cần GENERATED … AS IDENTITY hoặc SERIAL."],
  ["like",/\bLIKE\b/i,"LIKE của SQLite mặc định không phân biệt hoa thường với chữ Latin không dấu (A–Z); PostgreSQL phân biệt, muốn không phân biệt thì dùng ILIKE (chỉ có ở PostgreSQL) hoặc LOWER(cột) LIKE …"],
  ["ifnull",/\bIFNULL\s*\(/i,"IFNULL chỉ có ở SQLite (và MySQL). COALESCE chạy được ở cả hai hệ."],
  ["gconcat",/\bGROUP_CONCAT\s*\(/i,"GROUP_CONCAT là của SQLite. PostgreSQL dùng string_agg(cột, ', ')."],
  ["date",/\b(?:strftime|julianday|date|datetime)\s*\(/i,"Hàm ngày giờ khác nhau: SQLite có date(), strftime(), julianday() trên chuỗi 'YYYY-MM-DD'; PostgreSQL có kiểu DATE thật, CURRENT_DATE, EXTRACT(), to_char(), phép trừ hai ngày ra số ngày."],
  ["typeof",/\btypeof\s*\(/i,"typeof() là của SQLite. PostgreSQL dùng pg_typeof()."],
  ["orrepl",/\bINSERT\s+OR\s+(?:REPLACE|IGNORE)\b|\bREPLACE\s+INTO\b/i,"INSERT OR REPLACE / OR IGNORE là của SQLite. PostgreSQL viết INSERT … ON CONFLICT (cột) DO UPDATE / DO NOTHING (SQLite từ 3.24 cũng hiểu cách này)."],
  ["pragma",/^\s*PRAGMA\b/im,"PRAGMA chỉ có ở SQLite (xem cấu trúc bảng: PRAGMA table_info(bảng)). PostgreSQL dùng information_schema hoặc lệnh \\d bảng của psql."],
  ["dq",/"[^"\n]*'[^"\n]*"|=\s*"[^"\n]+"/,"Chuỗi chữ phải đặt trong nháy đơn '…'. Nháy kép \"…\" là tên cột/bảng; SQLite đôi khi tự coi \"…\" là chuỗi khi không có cột tên đó, PostgreSQL thì báo lỗi."],
  ["div",/\b\d+\s*\/\s*\d+\b/,"Chia hai số nguyên (7 / 2) cho kết quả nguyên (3) ở cả SQLite và PostgreSQL. Muốn có phần thập phân: 7.0 / 2 hoặc CAST(7 AS REAL) / 2 (PostgreSQL: 7::numeric / 2)."],
  ["bool",/\b(?:TRUE|FALSE)\b/i,"SQLite không có kiểu BOOLEAN riêng: TRUE là 1, FALSE là 0. PostgreSQL có kiểu boolean thật (in ra t / f)."],
  ["affinity",/^\s*CREATE\s+TABLE\b/im,"SQLite chỉ coi kiểu cột là “gợi ý” (type affinity): ghi chữ 'abc' vào cột INTEGER vẫn được, trừ khi bảng khai báo STRICT. PostgreSQL kiểm tra kiểu nghiêm ngặt và báo lỗi."],
  ["fkon",/\bREFERENCES\b/i,"Khóa ngoại: SQLite chỉ kiểm tra khi bật PRAGMA foreign_keys = ON (phòng thực hành này đã bật sẵn); PostgreSQL luôn kiểm tra."],
];
E.DIALECT=DIA;
E.dialect=function(sql){const s=String(sql||"").replace(/--[^\n]*/g,"");return DIA.filter(d=>d[1].test(s)).map(d=>({k:d[0],vi:d[2]}))};
/* ---------- cơ sở dữ liệu ---------- */
function Db(seed){if(!E.SQL)throw new Error("SQLENG: sql.js chưa được tải (gọi SQLENG.load() trước)");
  this.db=new E.SQL.Database();this.db.exec("PRAGMA foreign_keys = ON;");this.seed=seed||"";if(this.seed)this.db.exec(this.seed)}
E.open=ds=>new Db(ds?E.seedSql(ds):"");
E.Db=Db;
Db.prototype.close=function(){try{this.db.close()}catch(e){}};
Db.prototype.total=function(){const r=this.db.exec("SELECT total_changes()");return r[0].values[0][0]};
/* chạy MỘT câu lệnh (đã tách bằng SQLENG.split); params: mảng giá trị cho dấu ? */
Db.prototype.run=function(sql,params){let st;const verb=KW_VERB(sql);const t0=this.total();
  try{st=this.db.prepare(sql)}catch(e){return errOf(e)}
  try{if(params)st.bind(params);const cols=st.getColumnNames(),rows=[];let more=false;
    while(st.step()){if(rows.length>=E.LIMIT_ROWS){more=true;break}rows.push(st.get())}
    if(cols.length)return{kind:"rows",verb,cols,rows,more};
    return{kind:"ok",verb,changes:this.total()-t0}}
  catch(e){return errOf(e)}finally{try{st.free()}catch(e){}}};
function errOf(e){const msg=String(e&&e.message||e).replace(/^Error:\s*/,"");const x=E.explain(msg);return{kind:"err",msg,vi:x.vi,hint:x.hint}}
/* hàng đầu tiên, cột đầu tiên (tiện cho truy vấn nội bộ) */
Db.prototype.rows=function(sql,params){const r=this.run(sql,params);if(r.kind==="err")throw new Error(r.msg+" · "+sql);return r.rows||[]};
Db.prototype.value=function(sql,params){const r=this.rows(sql,params);return r.length?r[0][0]:null};
/* ảnh chụp các bảng (phần “Cơ sở dữ liệu” của giao diện): [{name, cols:[{n,t,pk,nn}], rows, count, view}] */
Db.prototype.snapshot=function(maxRows){maxRows=maxRows||50;const out=[];
  for(const [name,type] of this.rows("SELECT name, type FROM sqlite_schema WHERE type IN ('table','view') AND name NOT LIKE 'sqlite\\_%' ESCAPE '\\' ORDER BY type = 'view', rowid")){
    const cols=this.rows(`SELECT name, type, pk, "notnull" FROM pragma_table_info(?)`,[name]).map(c=>({n:c[0],t:c[1],pk:c[2],nn:c[3]}));
    const count=this.value(`SELECT COUNT(*) FROM ${qi(name)}`);
    const rows=this.rows(`SELECT * FROM ${qi(name)} LIMIT ${maxRows|0}`);
    out.push({name,cols,rows,count,view:type==="view"})}
  return out};
/* ---------- chạy cả đoạn code theo từng câu lệnh ---------- */
E.script=function(src){return E.split(src)};
/* ---------- so sánh kết quả, mã băm ---------- */
/* một giá trị → dạng chuẩn: NULL; số (kể cả chuỗi trông như số) làm tròn 6 chữ số thập phân; chuỗi giữ nguyên */
const NUMRE=/^[-+]?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?$/;
function cval(v){if(v===null||v===undefined)return"∅";
  if(v instanceof Uint8Array)return"x"+Array.from(v,b=>b.toString(16).padStart(2,"0")).join("");
  if(typeof v==="string"&&NUMRE.test(v.trim()))v=Number(v.trim());
  if(typeof v==="number"){if(!isFinite(v))return"n"+v;let r=Math.round(v*1e6)/1e6;if(Object.is(r,-0))r=0;return"n"+r}
  if(typeof v==="boolean")return"n"+(v?1:0);
  return"s"+v}
E.cval=cval;
E.canon=function(cols,rows,ordered){const R=rows.map(r=>JSON.stringify(r.map(cval)));if(!ordered)R.sort();return cols.length+"|"+R.join("\n")};
/* SHA-256 (thuần JS, giống crypto.createHash("sha256") của Node) */
const K=new Uint32Array([0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2]);
function utf8(s){if(G.TextEncoder)return new G.TextEncoder().encode(s);const o=[];for(const ch of s){let c=ch.codePointAt(0);
  if(c<128)o.push(c);else if(c<2048)o.push(192|c>>6,128|c&63);else if(c<65536)o.push(224|c>>12,128|c>>6&63,128|c&63);else o.push(240|c>>18,128|c>>12&63,128|c>>6&63,128|c&63)}return new Uint8Array(o)}
E.sha256=function(str){const m=utf8(str),l=m.length,n=((l+9+63)>>6)<<6,b=new Uint8Array(n);b.set(m);b[l]=0x80;
  const bits=l*8;for(let i=0;i<8;i++)b[n-1-i]=Math.floor(bits/Math.pow(2,8*i))&255;
  const H=new Uint32Array([0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19]),W=new Uint32Array(64);
  for(let o=0;o<n;o+=64){for(let i=0;i<16;i++)W[i]=(b[o+4*i]<<24|b[o+4*i+1]<<16|b[o+4*i+2]<<8|b[o+4*i+3])>>>0;
    for(let i=16;i<64;i++){const x=W[i-15],y=W[i-2];const s0=(x>>>7|x<<25)^(x>>>18|x<<14)^(x>>>3),s1=(y>>>17|y<<15)^(y>>>19|y<<13)^(y>>>10);W[i]=(W[i-16]+s0+W[i-7]+s1)>>>0}
    let [a,bb,c,d,e,f,g,h]=H;
    for(let i=0;i<64;i++){const S1=(e>>>6|e<<26)^(e>>>11|e<<21)^(e>>>25|e<<7),ch=(e&f)^(~e&g),t1=(h+S1+ch+K[i]+W[i])>>>0,
      S0=(a>>>2|a<<30)^(a>>>13|a<<19)^(a>>>22|a<<10),mj=(a&bb)^(a&c)^(bb&c),t2=(S0+mj)>>>0;h=g;g=f;f=e;e=(d+t1)>>>0;d=c;c=bb;bb=a;a=(t1+t2)>>>0}
    H[0]+=a;H[1]+=bb;H[2]+=c;H[3]+=d;H[4]+=e;H[5]+=f;H[6]+=g;H[7]+=h}
  return Array.from(H,x=>x.toString(16).padStart(8,"0")).join("")};
/* mã băm của một kết quả; muối theo mã bài tập để hai bài tập cùng đáp án không cùng mã */
E.hash=(salt,cols,rows,ordered)=>E.sha256("amts-sql|"+salt+"|"+E.canon(cols,rows,ordered)).slice(0,32);
/* tạo đặc tả chấm từ truy vấn chuẩn (chỉ chạy lúc soạn bài: tools/author/sql/exspec.js) */
E.specOf=function(salt,ds,ref,ordered){const db=E.open(ds);try{const r=db.run(ref);if(r.kind!=="rows")throw new Error("truy vấn chuẩn lỗi: "+(r.msg||r.kind));
  const o={c:r.cols.length,n:r.rows.length,h:E.hash(salt,r.cols,r.rows,!!ordered)};if(ordered)o.uh=E.hash(salt,r.cols,r.rows,false);return o}finally{db.close()}};
/* chấm: chạy câu của học viên trên dữ liệu mẫu mới (và các bộ dữ liệu kiểm tra thêm), so mã băm
   ex: {id, data:[ds…], checks:[{c,n,h,uh?}…] (cùng thứ tự với data), ordered} → {ok, res (kết quả trên bộ đầu), msg, hint, k (bộ dữ liệu sai)} */
E.grade=function(ex,src){const parts=E.split(src||"");
  if(!parts.length)return{ok:false,msg:"Chưa có câu lệnh nào.",hint:"Viết một câu SELECT rồi bấm Nộp bài."};
  if(parts.length>1)return{ok:false,msg:`Có ${parts.length} câu lệnh; bài này chỉ cần một câu SELECT.`,hint:"Xóa các câu thừa, hoặc gộp lại thành một câu."};
  const q=parts[0];if(!/^(SELECT|WITH|VALUES)$/.test(q.verb))return{ok:false,msg:"Bài này cần một câu truy vấn SELECT (không sửa dữ liệu).",hint:"Câu lệnh phải bắt đầu bằng SELECT (hoặc WITH)."};
  let first=null;
  for(let k=0;k<ex.checks.length;k++){const db=E.open(ex.data[k]);let r;try{r=db.run(q.sql)}finally{db.close()}
    if(k===0)first=r;
    if(r.kind==="err")return{ok:false,res:r,msg:r.vi,hint:r.hint,err:true};
    if(r.kind!=="rows")return{ok:false,res:r,msg:"Câu lệnh không trả về bảng kết quả.",hint:""};
    if(r.more)return{ok:false,res:first,msg:"Kết quả quá nhiều dòng.",hint:"Kiểm tra điều kiện ghép bảng: thiếu ON sẽ ghép mọi dòng với mọi dòng."};
    const C=ex.checks[k],tag=k?" (trên bộ dữ liệu kiểm tra thêm)":"";
    if(E.hash(ex.id,r.cols,r.rows,!!ex.ordered)===C.h)continue;
    if(r.cols.length!==C.c)return{ok:false,res:first,k,msg:`Kết quả có ${r.cols.length} cột, đề bài cần ${C.c} cột${tag}.`,hint:"Xem lại danh sách cột sau SELECT: đúng các cột đề bài hỏi, theo đúng thứ tự."};
    if(r.rows.length!==C.n)return{ok:false,res:first,k,msg:`Kết quả có ${r.rows.length} dòng, đáp án có ${C.n} dòng${tag}.`,hint:r.rows.length>C.n?"Thừa dòng: điều kiện lọc còn lỏng, hoặc ghép bảng bị nhân dòng.":"Thiếu dòng: điều kiện lọc quá chặt, hoặc quên các dòng có NULL / không ghép được."};
    if(ex.ordered&&C.uh&&E.hash(ex.id,r.cols,r.rows,false)===C.uh)return{ok:false,res:first,k,msg:"Đúng các dòng nhưng sai thứ tự"+tag+".",hint:"Đề bài yêu cầu sắp xếp: xem lại ORDER BY (cột nào, tăng ASC hay giảm DESC)."};
    return{ok:false,res:first,k,msg:`Số cột, số dòng đúng nhưng có giá trị khác đáp án${tag}.`,hint:k?"Câu lệnh đúng với dữ liệu mẫu nhưng sai với dữ liệu khác: đừng ghi cứng giá trị, hãy viết điều kiện tổng quát.":"So từng cột với đề bài: đúng cột chưa, phép tính, làm tròn, điều kiện lọc."}}
  return{ok:true,res:first,msg:"Đúng với dữ liệu mẫu"+(ex.checks.length>1?` và ${ex.checks.length-1} bộ dữ liệu kiểm tra thêm`:"")+"."}};
/* ---------- hình động: các bước ---------- */
/* mọi loại hình động trả về {kind, sql, cols, steps:[{t, say, ask?, …trạng thái của bước}], result:{cols, rows}, check:true}
   check = kết quả tính từng bước trùng với kết quả SQLite chạy thật câu lệnh đầy đủ (đã so). */
const truth=v=>v===null||v===undefined?"NULL":v?"TRUE":"FALSE";
E.truth=truth;
function sameBag(a,b){const f=x=>x.map(r=>JSON.stringify(r.map(cval))).sort().join("\n");return f(a)===f(b)}
const show=v=>v===null||v===undefined?"NULL":typeof v==="string"?"'"+v+"'":String(v);
E.show=show;
/* WHERE: từng dòng đi qua điều kiện. spec: {table, cols:[…], where, parts:[biểu thức con…]} */
E.TRACERS.where=function(db,s){const cols=s.cols&&s.cols.length?s.cols:db.rows(`SELECT name FROM pragma_table_info(?)`,[s.table]).map(r=>r[0]);
  const P=s.parts||[];
  const sel=`SELECT rowid, ${cols.map(qi).join(", ")}, (${s.where})${P.map(p=>`, (${p})`).join("")} FROM ${qi(s.table)} ORDER BY rowid`;
  const raw=db.rows(sel);
  const keepIds=new Set(db.rows(`SELECT rowid FROM ${qi(s.table)} WHERE ${s.where}`).map(r=>r[0]));
  const rows=raw.map(r=>({rid:r[0],vals:r.slice(1,1+cols.length),v:r[1+cols.length],parts:r.slice(2+cols.length),keep:keepIds.has(r[0])}));
  const sql=`SELECT ${cols.join(", ")}\nFROM ${s.table}\nWHERE ${s.where};`;
  const real=db.run(sql);if(real.kind!=="rows")throw new Error("WHERE: "+real.msg);
  const result={cols,rows:rows.filter(r=>r.keep).map(r=>r.vals)};
  const steps=[{t:"Bảng ban đầu",cur:-1,say:`Bảng ${s.table} có ${rows.length} dòng. WHERE xét lần lượt từng dòng: điều kiện TRUE thì giữ, FALSE hoặc NULL (chưa biết) thì bỏ.`}];
  rows.forEach((r,i)=>{const why=P.length?P.map((p,j)=>`${p} → ${truth(r.parts[j])}`).join("; ")+`; cả điều kiện → ${truth(r.v)}`:`${s.where} → ${truth(r.v)}`;
    steps.push({t:`Dòng ${i+1}: ${r.keep?"giữ":"bỏ"}`,cur:i,say:`${why}. ${r.keep?"TRUE nên dòng được giữ.":r.v===null?"Kết quả là NULL (chưa biết), không phải TRUE, nên dòng bị bỏ.":"FALSE nên dòng bị bỏ."}`,
      ask:{q:`Dòng ${i+1} được giữ hay bị bỏ?`,o:["Giữ","Bỏ"],a:r.keep?0:1}})});
  steps.push({t:"Kết quả",cur:rows.length,say:`Giữ ${result.rows.length}/${rows.length} dòng. Đây đúng là kết quả SQLite trả về khi chạy cả câu lệnh.`,
    ask:{q:"Kết quả có bao nhiêu dòng?",o:[...new Set([result.rows.length,rows.length,Math.max(0,result.rows.length-1),result.rows.length+1])].sort((a,b)=>a-b).map(String),a:-1}});
  const L=steps[steps.length-1].ask;L.a=L.o.indexOf(String(result.rows.length));
  return{kind:"where",sql,table:s.table,cols,parts:P,where:s.where,rows,steps,result,check:sameBag(result.rows,real.rows)&&real.cols.length===cols.length}};
/* GROUP BY: chia dòng vào nhóm rồi tính hàm tổng hợp. spec: {table, cols:[cột hiện], key, aggs:[biểu thức], where?, having?, order?} */
E.TRACERS.group=function(db,s){const T=qi(s.table),W=s.where?`(${s.where})`:"1";
  const raw=db.rows(`SELECT rowid, ${s.cols.map(qi).join(", ")}, (${s.key}) FROM ${T} ORDER BY rowid`);
  const passIds=new Set(db.rows(`SELECT rowid FROM ${T} WHERE ${W}`).map(r=>r[0]));
  const rows=raw.map(r=>({rid:r[0],vals:r.slice(1,1+s.cols.length),key:r[1+s.cols.length],pass:passIds.has(r[0]),g:-1}));
  const groups=[];const gk=v=>cval(v);
  for(const r of rows){if(!r.pass)continue;let g=groups.findIndex(x=>gk(x.key)===gk(r.key));if(g<0){groups.push({key:r.key,n:0,aggs:null,keep:true});g=groups.length-1}r.g=g;groups[g].n++}
  for(const g of groups){g.aggs=db.rows(`SELECT ${s.aggs.join(", ")} FROM ${T} WHERE ${W} AND (${s.key}) IS ?`,[g.key])[0];
    if(s.having)g.keep=!!db.value(`SELECT CASE WHEN (${s.having}) THEN 1 ELSE 0 END FROM ${T} WHERE ${W} AND (${s.key}) IS ?`,[g.key])}
  const sql=`SELECT ${s.key}, ${s.aggs.join(", ")}\nFROM ${s.table}${s.where?"\nWHERE "+s.where:""}\nGROUP BY ${s.key}${s.having?"\nHAVING "+s.having:""};`;
  const real=db.run(sql);if(real.kind!=="rows")throw new Error("GROUP BY: "+real.msg);
  const result={cols:[s.key,...s.aggs],rows:groups.filter(g=>g.keep).map(g=>[g.key,...g.aggs])};
  const steps=[{t:"Bảng ban đầu",phase:"rows",cur:-1,upto:-1,say:`Bảng ${s.table} có ${rows.length} dòng.${s.where?` WHERE ${s.where} lọc dòng trước khi gom nhóm.`:""} GROUP BY ${s.key}: các dòng có cùng giá trị ${s.key} vào chung một nhóm (mọi NULL vào chung một nhóm NULL).`}];
  rows.forEach((r,i)=>{const before=[...new Set(rows.slice(0,i).filter(x=>x.g>=0).map(x=>x.g))],seenBefore=r.g>=0&&before.includes(r.g);
    const o=before.map(g=>"nhóm "+show(groups[g].key)).concat("nhóm mới");
    steps.push({t:r.pass?`Dòng ${i+1} → nhóm ${show(r.key)}`:`Dòng ${i+1}: bị WHERE loại`,phase:"rows",cur:i,upto:i,
      say:r.pass?`${s.key} = ${show(r.key)}: ${seenBefore?"vào nhóm đã có.":"tạo nhóm mới."}`:`Dòng này không thỏa WHERE ${s.where}, không vào nhóm nào.`,
      ask:r.pass&&o.length>1?{q:`Dòng ${i+1} vào nhóm nào?`,o,a:seenBefore?before.indexOf(r.g):o.length-1}:null})});
  groups.forEach((g,j)=>steps.push({t:`Tính cho nhóm ${show(g.key)}`,phase:"agg",cur:j,upto:rows.length-1,
    say:`Nhóm ${show(g.key)} có ${g.n} dòng: ${s.aggs.map((a,m)=>`${a} = ${show(g.aggs[m])}`).join("; ")}.`+(/\b(?:SUM|AVG|MIN|MAX)\s*\(/i.test(s.aggs.join(" "))?" (SUM, AVG, MIN, MAX bỏ qua NULL; COUNT(*) đếm mọi dòng, COUNT(cột) chỉ đếm dòng có giá trị.)":"")}));
  if(s.having)steps.push({t:`HAVING ${s.having}`,phase:"having",cur:-1,upto:rows.length-1,say:`HAVING lọc nhóm sau khi tính: giữ ${groups.filter(g=>g.keep).length}/${groups.length} nhóm.`});
  steps.push({t:"Kết quả",phase:"done",cur:-1,upto:rows.length-1,say:`Mỗi nhóm thành một dòng kết quả: ${result.rows.length} dòng. Trùng với kết quả SQLite chạy cả câu lệnh.`});
  return{kind:"group",sql,table:s.table,cols:s.cols,key:s.key,aggs:s.aggs,having:s.having||"",where:s.where||"",rows,groups,steps,result,check:sameBag(result.rows,real.rows)}};
/* JOIN: ghép từng dòng bảng trái với các dòng bảng phải. spec: {left:{table, as, cols}, right:{table, as, cols}, on, type:"INNER"|"LEFT"} */
E.TRACERS.join=function(db,s){const Lt=s.left,Rt=s.right,type=(s.type||"INNER").toUpperCase(),la=Lt.as,ra=Rt.as;
  const L=db.rows(`SELECT rowid, ${Lt.cols.map(c=>qi(c)).join(", ")} FROM ${qi(Lt.table)} ORDER BY rowid`).map(r=>({rid:r[0],vals:r.slice(1)}));
  const R=db.rows(`SELECT rowid, ${Rt.cols.map(c=>qi(c)).join(", ")} FROM ${qi(Rt.table)} ORDER BY rowid`).map(r=>({rid:r[0],vals:r.slice(1)}));
  const ev=new Map(db.rows(`SELECT ${la}.rowid, ${ra}.rowid, (${s.on}) FROM ${qi(Lt.table)} AS ${la} CROSS JOIN ${qi(Rt.table)} AS ${ra}`).map(r=>[r[0]+"/"+r[1],r[2]]));
  const hit=new Set(db.rows(`SELECT ${la}.rowid, ${ra}.rowid FROM ${qi(Lt.table)} AS ${la} JOIN ${qi(Rt.table)} AS ${ra} ON ${s.on}`).map(r=>r[0]+"/"+r[1]));
  const cols=[...Lt.cols.map(c=>la+"."+c),...Rt.cols.map(c=>ra+"."+c)];
  const out=[],steps=[{t:"Hai bảng ban đầu",cur:-1,outN:0,say:`${type} JOIN: lấy từng dòng của ${Lt.table} (bảng trái), so điều kiện ON ${s.on} với mọi dòng của ${Rt.table} (bảng phải). Mỗi cặp TRUE cho một dòng kết quả.${type==="LEFT"?" LEFT JOIN: dòng trái không ghép được với dòng nào vẫn được giữ, các cột bên phải là NULL.":" Dòng không ghép được với dòng nào bị bỏ."}`}];
  L.forEach((l,i)=>{const marks=R.map(r=>{const k=l.rid+"/"+r.rid;return{v:ev.get(k),hit:hit.has(k)}}),m=marks.filter(x=>x.hit).length;
    const add=[];marks.forEach((x,j)=>{if(x.hit)add.push({vals:[...l.vals,...R[j].vals],l:i,r:j})});
    if(!m&&type==="LEFT")add.push({vals:[...l.vals,...Rt.cols.map(()=>null)],l:i,r:-1,pad:true});
    out.push(...add);
    steps.push({t:`Dòng trái ${i+1}: ${m} cặp khớp`,cur:i,marks,outN:out.length,
      say:m?`So ON với ${R.length} dòng phải: ${m} cặp TRUE → ${m} dòng kết quả.`+(m>1?" Một dòng trái khớp nhiều dòng phải thì xuất hiện nhiều lần.":""):type==="LEFT"?"Không cặp nào TRUE: LEFT JOIN vẫn giữ dòng trái, ghép với NULL.":"Không cặp nào TRUE: INNER JOIN bỏ dòng này."+(marks.some(x=>x.v===null)?" (So sánh với NULL cho NULL, không phải TRUE.)":""),
      ask:{q:`Dòng trái ${i+1} cho bao nhiêu dòng kết quả?`,o:["0","1","2","3"],a:Math.min(3,m||(type==="LEFT"?1:0))}})});
  const sql=`SELECT ${cols.join(", ")}\nFROM ${Lt.table} AS ${la}\n${type==="LEFT"?"LEFT":"INNER"} JOIN ${Rt.table} AS ${ra} ON ${s.on};`;
  const real=db.run(sql);if(real.kind!=="rows")throw new Error("JOIN: "+real.msg);
  const result={cols,rows:out.map(x=>x.vals)};
  steps.push({t:"Kết quả",cur:L.length,marks:null,outN:out.length,say:`${result.rows.length} dòng kết quả. Trùng với kết quả SQLite chạy cả câu lệnh.`});
  return{kind:"join",sql,type,left:Lt,right:Rt,on:s.on,L,R,out,cols,steps,result,check:sameBag(result.rows,real.rows)}};
E.trace=function(db,spec){const f=E.TRACERS[spec.kind];if(!f)throw new Error("SQLENG.trace: chưa có loại hình động "+spec.kind);return f(db,spec)};
G.SQLENG=E;
if(typeof module!=="undefined"&&module.exports)module.exports=E;
})(typeof window!=="undefined"?window:globalThis);
/* ===================== trình mô phỏng của khóa (platform/js/57-sql-ui.js) ===================== */
/* ===================== Phòng thực hành SQL · phần 3: giao diện (renderer) =====================
   Chỉ tải trên trang khóa sql. Máy (57-sql-engine.js) tách khỏi phần vẽ: phần vẽ chỉ đọc kết quả, ảnh chụp bảng, các bước hình động.
   sql.js chỉ được tải (SQLENG.load) khi công cụ hiện lên màn hình hoặc khi học viên bấm một nút; trước đó bảng dữ liệu mẫu vẽ từ 57-sql-data.js.
   Tài liệu: docs/TRINH-MO-PHONG-SQL.md.

   makeSqlLab(el, {id, file, data, presets:[{label, note, sql, data}]})     trình soạn SQL theo khung docs/QUY-TAC-TRINH-MO-PHONG.md
       (code trái/trên; Cơ sở dữ liệu → Kết quả → SQLite và PostgreSQL xếp dọc trong một khung cuộn; ↺ · ← Lùi · Từng bước · ▶ Chạy ở đáy)
       Từng bước = chạy một câu lệnh; Lùi = nạp lại dữ liệu mẫu rồi chạy lại các câu trước đó; Đoán trước = đoán số dòng trước khi chạy.
   makeSqlViz(el, {id, pick:[mã kịch bản trong SQLVIZ] | scenarios:[…]})  hình động từng bước (WHERE, GROUP BY, JOIN…), mục 5 của quy tắc
   makeSqlEx(el, lid, [{t, d, data, kt:[bộ kiểm tra thêm], start, ordered, checks, hints, why}])   bài tập viết SQL chấm tự động */
(function(G){
"use strict";
const doc=G.document,E=G.SQLENG,D=G.SQLDATA,VZ=G.SQLVIZ||[];
const escH=s=>String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
const reduce=()=>!!(G.matchMedia&&G.matchMedia("(prefers-reduced-motion: reduce)").matches);
const MOB=()=>!!(G.matchMedia&&G.matchMedia("(max-width:900px)").matches);
/* ---------- tô màu SQL ---------- */
const KW=new Set(("SELECT FROM WHERE AND OR NOT NULL IS IN BETWEEN LIKE GLOB ESCAPE AS DISTINCT ALL ORDER BY ASC DESC LIMIT OFFSET GROUP HAVING JOIN INNER LEFT RIGHT FULL OUTER CROSS NATURAL ON USING "+
 "UNION INTERSECT EXCEPT WITH RECURSIVE INSERT INTO VALUES UPDATE SET DELETE CREATE TABLE VIEW INDEX UNIQUE PRIMARY KEY FOREIGN REFERENCES CHECK DEFAULT CONSTRAINT DROP ALTER ADD COLUMN RENAME TO IF EXISTS "+
 "BEGIN COMMIT ROLLBACK TRANSACTION SAVEPOINT RELEASE CASE WHEN THEN ELSE END CAST TRUE FALSE NULLS FIRST LAST OVER PARTITION WINDOW ROWS RANGE PRECEDING FOLLOWING CURRENT ROW UNBOUNDED "+
 "INTEGER TEXT REAL NUMERIC DATE BOOLEAN VARCHAR CHAR BLOB AUTOINCREMENT EXPLAIN QUERY PLAN PRAGMA TRIGGER AFTER BEFORE INSTEAD OF FOR EACH REPLACE IGNORE CONFLICT DO NOTHING RETURNING STRICT").split(" "));
const FN=new Set("COUNT SUM AVG MIN MAX ROUND ABS LENGTH UPPER LOWER SUBSTR SUBSTRING TRIM LTRIM RTRIM REPLACE INSTR COALESCE IFNULL NULLIF TYPEOF DATE TIME DATETIME STRFTIME JULIANDAY ROW_NUMBER RANK DENSE_RANK LAG LEAD GROUP_CONCAT PRINTF FORMAT".split(" "));
function hlSql(s){let o="",i=0;const n=s.length;
  while(i<n){const c=s[i];
    if(c==="-"&&s[i+1]==="-"){o+=`<span class="t-com">${escH(s.slice(i))}</span>`;break}
    if(c==="'"){let j=i+1;for(;j<n;j++){if(s[j]==="'"){if(s[j+1]==="'"){j++;continue}break}}o+=`<span class="t-str">${escH(s.slice(i,j+1))}</span>`;i=j+1;continue}
    if(c==='"'){let j=s.indexOf('"',i+1);if(j<0)j=n-1;o+=`<span class="t-op">${escH(s.slice(i,j+1))}</span>`;i=j+1;continue}
    if(/[0-9]/.test(c)&&!/[A-Za-z_]/.test(s[i-1]||"")){let j=i;while(j<n&&/[0-9.]/.test(s[j]))j++;o+=`<span class="t-num">${escH(s.slice(i,j))}</span>`;i=j;continue}
    if(/[A-Za-z_]/.test(c)){let j=i+1;while(j<n&&/[A-Za-z0-9_]/.test(s[j]))j++;const w=s.slice(i,j),u=w.toUpperCase();
      const cls=KW.has(u)?"t-kw":FN.has(u)&&s[j]==="("?"t-pre":"";o+=cls?`<span class="${cls}">${escH(w)}</span>`:escH(w);i=j;continue}
    o+=escH(c);i++}
  return o}
G.hlSql=hlSql;
/* ---------- bảng ---------- */
const cell=v=>v===null||v===undefined?`<td class="nul">NULL</td>`:typeof v==="number"?`<td class="num">${escH(fmtNum(v))}</td>`:v instanceof Uint8Array?`<td class="nul">BLOB ${v.length} byte</td>`:`<td>${escH(v)}</td>`;
function fmtNum(v){if(Number.isInteger(v))return String(v);const r=Math.round(v*1e6)/1e6;return String(r)}
function gridHtml(cols,rows,max,cap){max=max||100;const sh=rows.slice(0,max);
  return `<div class="sq-tw"><table class="sq-t">${cap?`<caption>${cap}</caption>`:""}<thead><tr>${cols.map(c=>`<th scope="col">${escH(c)}</th>`).join("")}</tr></thead><tbody>${sh.map(r=>`<tr>${r.map(cell).join("")}</tr>`).join("")||`<tr><td class="sq-empty" colspan="${Math.max(1,cols.length)}">(không có dòng nào)</td></tr>`}</tbody></table></div>`+(rows.length>max?`<p class="sq-more">… còn ${rows.length-max} dòng nữa (chỉ hiện ${max} dòng đầu).</p>`:"")}
/* bảng từ ảnh chụp (SQLENG) hoặc từ bộ dữ liệu mẫu (chưa tải SQLite) */
function tablesOf(ds){return ds.tables.map(t=>({name:t.name,cols:t.cols.map(c=>({n:c[0],t:c[1].split(/\s/)[0],pk:/PRIMARY KEY/i.test(c[1])?1:0,nn:/NOT NULL/i.test(c[1])?1:0,fk:/REFERENCES/i.test(c[1])})),rows:t.rows,count:t.rows.length}))}
function dbHtml(tabs,changed,max){max=max||12;if(!tabs.length)return`<p class="sq-empty">Cơ sở dữ liệu trống: chưa có bảng nào.</p>`;
  return tabs.map(t=>`<div class="sq-tb${changed&&changed.has(t.name)?" chg":""}"><div class="sq-tbh"><b>${escH(t.name)}</b><span>${t.view?"view · ":""}${t.count} dòng${changed&&changed.has(t.name)?" · vừa đổi":""}</span></div>`+
    `<div class="sq-tw"><table class="sq-t"><thead><tr>${t.cols.map(c=>`<th scope="col">${escH(c.n)}<small>${escH((c.t||"").toLowerCase())}${c.pk?" · khóa chính":""}${c.nn&&!c.pk?" · not null":""}${c.fk?" · khóa ngoại":""}</small></th>`).join("")}</tr></thead>`+
    `<tbody>${t.rows.slice(0,max).map(r=>`<tr>${r.map(cell).join("")}</tr>`).join("")||`<tr><td class="sq-empty" colspan="${Math.max(1,t.cols.length)}">(bảng chưa có dòng nào)</td></tr>`}</tbody></table></div>`+
    (t.count>max?`<p class="sq-more">… còn ${t.count-max} dòng nữa.</p>`:"")+`</div>`).join("")}
G.sqlGrid=gridHtml;
/* ---------- tải SQLite khi công cụ hiện lên (một lần cho cả trang) ---------- */
function whenShown(el,f){if(!G.IntersectionObserver){f();return}const io=new G.IntersectionObserver(es=>{if(es.some(e=>e.isIntersecting)){io.disconnect();f()}},{rootMargin:"200px 0px"});io.observe(el)}
const LOADMSG="Đang tải SQLite (khoảng 0,7 MB, chỉ tải lần đầu)…";
function loadErr(e){return`Không tải được SQLite: ${escH(e&&e.message||e)}. Kiểm tra kết nối mạng rồi tải lại trang.`}
/* =====================================================================================
   1. Trình soạn SQL
   ===================================================================================== */
G.makeSqlLab=function(root,cfg){cfg=cfg||{};const id=cfg.id||"sq";
  const presets=(cfg.presets&&cfg.presets.length?cfg.presets:[{label:"Câu lệnh",sql:"SELECT * FROM hoc_vien;",data:cfg.data||"lop"}]).map(p=>Object.assign({data:cfg.data||"lop"},p));
  const dsNames=[...new Set(presets.map(p=>p.data).concat(cfg.datasets||[]))].filter(k=>D[k]);
  root.classList.add("sim","sqlsim");
  root.innerHTML=`<div class="sim-bar"><div class="left"><span class="fname">${escH(cfg.file||"truy-van.sql")}</span>
    ${presets.length>1?`<label class="pre-l"><span class="vh">Chọn ví dụ</span><select class="s-pre" id="${id}-pre">${presets.map((p,i)=>`<option value="${i}">${escH(p.label)}</option>`).join("")}</select></label>`:""}
    <span class="s-chip idle" role="status" aria-live="polite">Chưa chạy</span></div>
    <div class="right"><label class="sq-pred"><input type="checkbox" class="s-predon"><span>Đoán trước</span></label></div></div>
  <details class="s-note" hidden><summary><b class="sn-h">Ví dụ này minh họa</b><span class="sn-1"></span></summary><p class="sn-t"></p></details>
  <div class="sim-stage">
   <div class="st-code"><div class="editor"><div class="gutter"></div><div class="ed-wrap"><pre class="ed-hl" aria-hidden="true"></pre><textarea class="ed-ta" id="${id}-ed" spellcheck="false" autocapitalize="off" autocomplete="off" aria-label="Câu lệnh SQL"></textarea></div></div>
    <div class="sim-in sq-in"><label for="${id}-ds"><b>Bộ dữ liệu mẫu</b></label><select class="sq-ds" id="${id}-ds">${dsNames.map(k=>`<option value="${k}">${escH(D[k].title)}</option>`).join("")}</select></div></div>
   <div class="st-panes">
    <div class="st-nav" role="group" aria-label="Đi tới phần"><button type="button" data-go="db">Cơ sở dữ liệu</button><button type="button" data-go="out">Kết quả</button><button type="button" data-go="pg">SQLite và PostgreSQL</button></div>
    <div class="st-scroll" tabindex="0" role="region" aria-label="Cơ sở dữ liệu, kết quả, khác biệt SQLite và PostgreSQL">
     <section class="pn" data-sec="db"><div class="pane-h"><span>Cơ sở dữ liệu</span><span class="sq-dbtag"></span></div><div class="sq-ask" hidden></div><p class="sq-dsnote"></p><div class="sq-db"></div></section>
     <section class="pn" data-sec="out"><div class="pane-h"><span>Kết quả</span><span class="s-exit"></span></div><div class="sq-out"></div><div class="explain" hidden></div></section>
     <section class="pn" data-sec="pg"><div class="pane-h"><span>SQLite và PostgreSQL</span><span></span></div><div class="sq-pg"></div></section>
    </div></div>
   <div class="sim-ctl"><span class="sc-st" aria-hidden="true">Chưa chạy</span><span class="sc-btns"><button type="button" class="btn nw s-reset" disabled title="Làm lại từ đầu: nạp lại dữ liệu mẫu" aria-label="Làm lại từ đầu">↺</button><button type="button" class="btn nw s-back" disabled title="Lùi lại một câu lệnh">← Lùi</button><button type="button" class="btn s-step">Từng bước</button><button type="button" class="btn pri s-run">▶ Chạy</button></span></div>
  </div>
  <div class="sim-foot"><span><kbd>Ctrl</kbd> + <kbd>Enter</kbd> trong khung code để chạy</span><span>SQLite ${escH(E.SQLJS_VER==="1.14.2"?"3.49.1":"")} chạy ngay trong trình duyệt · dữ liệu mẫu tự đặt</span></div>
  <details class="sim-scope"><summary>Phòng thực hành SQL hỗ trợ những gì?</summary><div>
   <p><b>Đây là SQLite thật</b> (bản 3.49.1, đóng gói WebAssembly bởi thư viện sql.js 1.14.2) chạy trong trình duyệt của bạn, không gửi gì lên máy chủ. Mỗi lần ↺ hoặc tải lại trang, cơ sở dữ liệu trở về dữ liệu mẫu ban đầu; không lưu thay đổi.</p>
   <p><b>Từng bước</b> chạy một câu lệnh (các câu cách nhau bằng dấu <code>;</code>). <b>Lùi</b> nạp lại dữ liệu mẫu rồi chạy lại các câu trước đó, nên câu dùng <code>random()</code> hay giờ hiện tại có thể cho kết quả khác lần trước. Khóa ngoại được bật sẵn (<code>PRAGMA foreign_keys = ON</code>) để giống PostgreSQL.</p>
   <p><b>Giới hạn:</b> mỗi câu SELECT đọc tối đa ${E.LIMIT_ROWS.toLocaleString("vi-VN")} dòng, khung Kết quả hiện 100 dòng đầu. Câu lệnh chạy rất lâu (ví dụ CTE đệ quy không có điểm dừng) có thể làm trang đứng; khi đó tải lại trang. Không có tệp: <code>ATTACH</code>, <code>VACUUM INTO</code> không dùng được.</p>
   <p><b>PostgreSQL</b> không chạy trong trình duyệt. Phần “SQLite và PostgreSQL” ghi những chỗ câu lệnh của bạn sẽ chạy khác trên PostgreSQL; các ví dụ mẫu của khóa đã được chạy thử trên cả PostgreSQL 16 (xem tài liệu của khóa).</p></div></details>`;
  const $=s=>root.querySelector(s);
  const ed=$(".ed-ta"),hl=$(".ed-hl"),gut=$(".gutter"),chip=$(".s-chip"),stage=$(".sim-stage"),sc=$(".st-scroll"),ctlSt=$(".sc-st"),exp=$(".explain"),dsSel=$(".sq-ds");
  const btnStep=$(".s-step"),btnRun=$(".s-run"),btnBack=$(".s-back"),btnReset=$(".s-reset");
  const secOf=k=>root.querySelector(`.pn[data-sec="${k}"]`),navB=k=>root.querySelector(`.st-nav [data-go="${k}"]`);
  const S={pi:0,ds:presets[0].data,parts:null,k:0,db:null,outs:[],cur:0,curEnd:0,bad:0,mode:null,ask:null,pend:null,fb:null,predOn:false,busy:false,changed:null,done:false};
  /* ---------- khung: cuộn trong khung, chống nhảy, đưa khung vào màn hình một lần ---------- */
  function scrollIn(el,how){if(!el||el.hidden)return;const R=sc.getBoundingClientRect(),Q=el.getBoundingClientRect();if(!R.height)return;
    const to=how==="top"?sc.scrollTop+Q.top-R.top:Q.bottom>R.bottom||Q.top<R.top?sc.scrollTop+(Q.bottom>R.bottom&&Q.height<R.height?Q.bottom-R.bottom+8:Q.top-R.top):null;
    if(to!=null){if(sc.scrollTo)sc.scrollTo({top:to,behavior:reduce()?"auto":"smooth"});else sc.scrollTop=to}}
  const goPane=k=>scrollIn(secOf(k),"top");
  root.querySelectorAll(".st-nav [data-go]").forEach(b=>b.onclick=()=>goPane(b.dataset.go));
  function seen(k){const s=secOf(k),R=sc.getBoundingClientRect(),Q=s.getBoundingClientRect();return Q.top<R.bottom-24&&Q.bottom>R.top+24}
  function paintNav(){let on=null;const R=sc.getBoundingClientRect();for(const k of ["db","out","pg"]){const Q=secOf(k).getBoundingClientRect();if(Q.top<=R.top+R.height/3)on=k;else if(!on)on=k}
    root.querySelectorAll(".st-nav [data-go]").forEach(b=>b.classList.toggle("on",b.dataset.go===on));if(seen("out"))navB("out").classList.remove("new")}
  sc.addEventListener("scroll",()=>{cancelAnimationFrame(sc._r);sc._r=requestAnimationFrame(paintNav)},{passive:true});
  function hold(){["db","out"].forEach(k=>{const s=secOf(k),h=s.offsetHeight;if(h>(s._mh||0)){s._mh=h;s.style.minHeight=h+"px"}})}
  function unhold(){root.querySelectorAll(".pn").forEach(s=>{s._mh=0;s.style.minHeight=""})}
  function fitStage(){const r=stage.getBoundingClientRect();if(!r.height)return;let top=0;doc.querySelectorAll(".top,.lbar,.ltoc").forEach(h=>{const q=h.getBoundingClientRect(),cs=getComputedStyle(h);if(q.height&&cs.position==="sticky"&&cs.display!=="none")top=Math.max(top,(parseFloat(cs.top)||0)+(h.open&&h.querySelector("summary")?h.querySelector("summary").offsetHeight:q.height))});
    const want=top+8;if(r.top<want-2||r.bottom>innerHeight+2)G.scrollBy({top:r.top-want,behavior:reduce()?"auto":"smooth"})}
  function live(on){if(on&&!stage.classList.contains("live")){stage.classList.add("live");fitStage()}else if(!on)stage.classList.remove("live")}
  function setChip(k,t){chip.className="s-chip "+k;chip.textContent=t;ctlSt.className="sc-st "+k;ctlSt.textContent=t}
  /* ---------- trình soạn code ---------- */
  function paint(){const L=ed.value.split("\n"),a=S.cur,b=S.curEnd||S.cur;
    hl.innerHTML=L.map((s,i)=>`<span class="row${a&&i+1>=a&&i+1<=b?" cur":""}${i+1===S.bad?" bad":""}">${hlSql(s)||" "}</span>`).join("");
    gut.innerHTML=L.map((_,i)=>`<div class="${i+1===S.bad?"err":""}${a&&i+1>=a&&i+1<=b?" cur":""}">${i+1}</div>`).join("");sync()}
  function sync(){hl.scrollTop=ed.scrollTop;hl.scrollLeft=ed.scrollLeft;gut.scrollTop=ed.scrollTop}
  function keepCur(){if(!S.cur)return;const lh=parseFloat(getComputedStyle(ed).lineHeight)||22,y=(S.cur-1)*lh,h=ed.clientHeight;if(y<ed.scrollTop+h*.25||y>ed.scrollTop+h*.7-lh){ed.scrollTop=Math.max(0,y-h/2+lh/2);sync()}}
  ed.addEventListener("scroll",sync);
  ed.addEventListener("input",()=>{if(S.parts||S.bad)reset();else{paint();paintPg()}});
  ed.addEventListener("keydown",e=>{
    if(e.key==="Enter"&&(e.ctrlKey||e.metaKey)){e.preventDefault();runAll();return}
    if(e.key==="Tab"&&!e.shiftKey&&!e.altKey){e.preventDefault();const a=ed.selectionStart,b=ed.selectionEnd;ed.setRangeText("    ",a,b,"end");ed.dispatchEvent(new Event("input"))}});
  dsSel.onchange=()=>{S.ds=dsSel.value;reset()};
  /* ---------- ví dụ ---------- */
  function showNote(){const p=presets[S.pi]||{},n=p.note||"",el=$(".s-note");el.hidden=!n;el.querySelector(".sn-h").textContent=/^Lỗi|^Bẫy/.test(p.label||"")?"Ví dụ này cho thấy":"Ví dụ này minh họa";
    el.querySelector(".sn-1").textContent=n;el.querySelector(".sn-t").textContent=n;el.open=!MOB()}
  function load(i){const p=presets[i];S.pi=i;ed.value=p.sql.replace(/\n$/,"")+"\n";S.ds=p.data;dsSel.value=p.data;ed.scrollTop=0;S.bad=0;showNote();reset()}
  const pre=$(".s-pre");if(pre)pre.onchange=()=>load(+pre.value);
  /* ---------- vẽ các phần ---------- */
  function paintDb(){const box=$(".sq-db");$(".sq-dsnote").textContent=D[S.ds].note||"";
    $(".sq-dbtag").textContent=S.db?(S.k?`sau câu ${S.k}`:"dữ liệu mẫu"):"dữ liệu mẫu";
    box.innerHTML=dbHtml(S.db?S.db.snapshot(50):tablesOf(D[S.ds]),S.changed)}
  function paintOut(){const box=$(".sq-out");
    if(!S.outs.length){box.innerHTML=`<p class="sq-empty">${S.busy?escH(LOADMSG):S.parts?"Chưa chạy câu lệnh nào.":"Bấm ▶ Chạy để chạy cả đoạn, hoặc Từng bước để chạy từng câu lệnh."}</p>`;return}
    box.innerHTML=S.outs.map(o=>{const r=o.res,h=`<div class="sq-oh"><b>Câu ${o.i+1}</b><span>dòng ${o.line} · ${escH(o.verb||"?")}</span></div>`;
      if(r.kind==="rows")return`<div class="sq-o${o.i===S.k-1?" last":""}">${h}<p class="sq-n">${r.rows.length.toLocaleString("vi-VN")}${r.more?"+":""} dòng × ${r.cols.length} cột</p>${gridHtml(r.cols,r.rows,100)}${r.more?`<p class="sq-more">Kết quả bị cắt ở ${E.LIMIT_ROWS.toLocaleString("vi-VN")} dòng.</p>`:""}</div>`;
      if(r.kind==="ok")return`<div class="sq-o ok${o.i===S.k-1?" last":""}">${h}<p class="sq-n">${okText(r)}</p></div>`;
      return`<div class="sq-o bad">${h}<p class="sq-n"><b>Lỗi:</b> ${escH(r.vi)}</p>${r.hint?`<p class="sq-hint">${escH(r.hint)}</p>`:""}<p class="sq-raw">SQLite: <code>${escH(r.msg)}</code></p></div>`}).join("")}
  function okText(r){const v=r.verb,n=r.changes;
    if(v==="INSERT"||v==="REPLACE")return`Đã thêm ${n} dòng.`;if(v==="UPDATE")return`Đã sửa ${n} dòng.`;if(v==="DELETE")return`Đã xóa ${n} dòng.`;
    if(v==="CREATE")return"Đã tạo xong.";if(v==="DROP")return"Đã xóa xong.";if(v==="ALTER")return"Đã đổi cấu trúc bảng.";
    if(v==="BEGIN")return"Bắt đầu giao dịch.";if(v==="COMMIT"||v==="END")return"Đã xác nhận giao dịch (COMMIT).";if(v==="ROLLBACK")return"Đã hủy giao dịch (ROLLBACK): dữ liệu trở lại như lúc BEGIN.";
    return"Đã chạy xong."+(n?` (${n} dòng thay đổi)`:"")}
  function paintPg(){const notes=E.dialect(ed.value);
    $(".sq-pg").innerHTML=(notes.length?`<ul class="sq-pgl">${notes.map(n=>`<li>${escH(n.vi)}</li>`).join("")}</ul>`:`<p class="sq-empty">Không thấy cú pháp riêng của SQLite trong đoạn code này. Vẫn nên chạy thử trên PostgreSQL trước khi dùng thật: hai hệ còn khác nhau ở kiểu dữ liệu và thứ tự NULL khi sắp xếp.</p>`)}
  function paintAsk(){const box=$(".sq-ask");
    if(!S.ask&&!S.fb){box.hidden=true;return}box.hidden=false;
    if(S.ask){const a=S.ask;box.innerHTML=`<p><b>Đoán trước:</b> ${escH(a.q)}</p><div class="sq-arow"><input class="sq-ain" type="text" inputmode="numeric" autocomplete="off" aria-label="Số bạn đoán"><button type="button" class="btn pri sq-ago">Đoán rồi chạy</button><button type="button" class="btn sq-askip">Bỏ qua</button></div>`;
      const i=box.querySelector(".sq-ain");box.querySelector(".sq-ago").onclick=()=>answer(i.value);box.querySelector(".sq-askip").onclick=()=>answer(null);i.addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();answer(i.value)}});
      setTimeout(()=>i.focus({preventScroll:true}),0);return}
    box.innerHTML=`<p class="${S.fb.ok?"ok-t":"bad-t"}">${escH(S.fb.t)}</p>`}
  function renderAll(){paint();paintDb();paintOut();paintAsk();btnBack.disabled=!S.parts||S.k===0||S.busy;btnReset.disabled=!S.parts&&!S.bad;
    btnRun.textContent=S.parts&&S.k>0&&!S.done?"▶ Chạy tiếp":"▶ Chạy";hold()}
  /* ---------- chạy ---------- */
  function ensure(then){if(E.ready()){then();return}S.busy=true;setChip("wait",LOADMSG);renderAll();
    E.load().then(()=>{S.busy=false;then()},e=>{S.busy=false;setChip("err","Không tải được SQLite");exp.hidden=false;exp.className="explain";exp.innerHTML=`<b>Không tải được SQLite</b><span>${loadErr(e)}</span>`;renderAll()})}
  function start(){S.parts=E.split(ed.value);S.k=0;S.outs=[];S.done=false;S.bad=0;S.changed=null;if(S.db)S.db.close();S.db=E.open(D[S.ds]);unhold();live(true);sc.scrollTop=0;exp.hidden=true;$(".s-exit").textContent=""}
  function snapKey(){const o={};for(const t of S.db.snapshot(1e6))o[t.name]=JSON.stringify([t.cols,t.rows]);return o}
  function exec1(quiet){const p=S.parts[S.k],before=quiet?null:snapKey();const r=S.db.run(p.sql);S.outs.push({i:S.k,line:p.line,verb:p.verb,res:r});S.k++;S.cur=p.line;S.curEnd=p.endLine;
    if(!quiet){const after=snapKey(),ch=new Set();for(const k in after)if(before[k]!==after[k])ch.add(k);S.changed=ch}
    if(r.kind==="err"){S.bad=p.line;return false}return true}
  function finish(){S.done=true;const errs=S.outs.filter(o=>o.res.kind==="err").length;
    if(errs){const o=S.outs[S.outs.length-1];setChip("err",`Lỗi ở câu ${o.i+1} · dòng ${o.line}`);$(".s-exit").textContent="dừng vì lỗi";
      exp.hidden=false;exp.className="explain";exp.innerHTML=`<b>Lỗi ở câu ${o.i+1} (dòng ${o.line})</b><span>${escH(o.res.vi)}</span>${o.res.hint?`<span>${escH(o.res.hint)}</span>`:""}`}
    else{setChip("ok",`Đã chạy xong · ${S.k} câu lệnh`);$(".s-exit").textContent=`${S.k} câu lệnh`;exp.hidden=true}
    S.cur=errs?S.cur:0;S.curEnd=errs?S.curEnd:0;btnStep.textContent="Từng bước";renderAll();setTimeout(()=>goPane("out"),0)}
  function stepped(){const o=S.outs[S.outs.length-1];
    if(o.res.kind==="err"){finish();return}
    if(S.k>=S.parts.length){finish();return}
    S.mode="step";btnStep.textContent="Bước tiếp →";setChip("step",`Đã chạy câu ${S.k}/${S.parts.length} · dòng ${o.line}`);renderAll();keepCur();
    if(!seen("out")||o.res.kind==="rows")setTimeout(()=>scrollIn(root.querySelector(".sq-o.last")||secOf("out")),0)}
  function askFor(p){if(/^(SELECT|WITH|VALUES)$/.test(p.verb))return{q:`Câu ${S.k+1} (dòng ${p.line}) trả về bao nhiêu dòng?`,kind:"rows"};
    if(/^(INSERT|UPDATE|DELETE|REPLACE)$/.test(p.verb))return{q:`Câu ${S.k+1} (dòng ${p.line}) làm thay đổi bao nhiêu dòng?`,kind:"chg"};return null}
  function answer(v){const a=S.ask;S.ask=null;exec1(false);const r=S.outs[S.outs.length-1].res;
    if(v!==null&&String(v).trim()!==""){const g=Number(String(v).trim()),truth=r.kind==="rows"?r.rows.length:r.kind==="ok"?r.changes:null;
      S.fb=truth===null?{ok:false,t:"Câu lệnh bị lỗi nên không có số dòng để so."}:{ok:g===truth,t:(g===truth?"Đúng! ":"Chưa đúng: ")+(a.kind==="rows"?`câu lệnh trả về ${truth} dòng.`:`câu lệnh đổi ${truth} dòng.`)}}
    else S.fb=null;
    stepped()}
  function step(){if(S.busy)return;if(S.done)reset();
    ensure(()=>{if(!S.parts){start();if(!S.parts.length){S.parts=null;setChip("idle","Chưa có câu lệnh nào");live(false);renderAll();return}}
      if(S.ask){answer(null);return}
      S.fb=null;const p=S.parts[S.k];
      if(S.predOn){const q=askFor(p);if(q){S.ask=q;S.cur=p.line;S.curEnd=p.endLine;setChip("step",`Câu ${S.k+1}/${S.parts.length} · đoán trước`);renderAll();keepCur();goPane("db");return}}
      exec1(false);stepped()})}
  function runAll(){if(S.busy)return;if(S.done)reset();
    ensure(()=>{if(!S.parts)start();S.ask=null;S.fb=null;
      if(!S.parts.length){S.parts=null;setChip("idle","Chưa có câu lệnh nào");live(false);renderAll();return}
      setChip("run","Đang chạy…");const before=snapKey();let ok=true;while(ok&&S.k<S.parts.length)ok=exec1(true);
      const after=snapKey(),ch=new Set();for(const t in after)if(before[t]!==after[t])ch.add(t);S.changed=ch;
      finish()})}
  function back(){if(!S.parts||S.k===0||S.busy)return;const k=S.k-1;S.ask=null;S.fb=null;start();
    while(S.k<k)exec1(S.k<k-1);
    S.done=false;S.bad=0;if(!k){S.cur=0;S.curEnd=0;S.changed=null;setChip("step","Đã nạp lại dữ liệu mẫu · chưa chạy câu nào")}
    else setChip("step",`Đã chạy câu ${S.k}/${S.parts.length} · dòng ${S.outs[S.outs.length-1].line}`);
    btnStep.textContent="Bước tiếp →";renderAll();keepCur()}
  function reset(){S.parts=null;S.k=0;S.outs=[];S.cur=0;S.curEnd=0;S.mode=null;S.ask=null;S.fb=null;S.done=false;S.changed=null;if(S.db){S.db.close();S.db=null}
    if(!S.busy)setChip("idle","Chưa chạy");exp.hidden=true;btnStep.textContent="Từng bước";$(".s-exit").textContent="";live(false);unhold();navB("out").classList.remove("new");paintPg();renderAll()}
  btnStep.onclick=step;btnRun.onclick=runAll;btnBack.onclick=back;btnReset.onclick=()=>{S.bad=0;reset()};
  $(".s-predon").onchange=e=>{S.predOn=e.target.checked;S.ask=null;S.fb=S.predOn?{ok:true,t:"Đã bật Đoán trước: bấm Từng bước, trước mỗi câu SELECT / INSERT / UPDATE / DELETE bạn đoán số dòng rồi mới chạy."}:null;renderAll();if(S.predOn)goPane("db")};
  /* tải SQLite trước khi học viên bấm (khi công cụ hiện lên), để lần bấm đầu chạy ngay */
  whenShown(root,()=>{E.load().catch(()=>{})});
  load(0);
  const api={el:root,get:()=>ed.value,set:(c,ds)=>{ed.value=c;if(ds&&D[ds]){S.ds=ds;dsSel.value=ds}S.bad=0;reset()},run:()=>{reset();runAll()},step,back,reset,load,get state(){return S}};
  root.sqlLab=api;return api};
/* =====================================================================================
   2. Hình động từng bước (WHERE, GROUP BY, JOIN; thêm loại mới: SQLENG.TRACERS[kind] + SQLUI.VIZ[kind])
   ===================================================================================== */
const VIZ={};
const tv=v=>v===null||v===undefined?`<span class="sqtv n">NULL</span>`:v?`<span class="sqtv t">TRUE</span>`:`<span class="sqtv f">FALSE</span>`;
const vtxt=v=>v===null||v===undefined?`<i class="nul">NULL</i>`:escH(typeof v==="number"?fmtNum(v):v);
/* WHERE: bảng nguồn (mỗi dòng: giá trị các vế, kết luận), bảng kết quả bên dưới */
VIZ.where=function(T,st){const k=st.cur,n=T.rows.length;
  const head=`<tr><th scope="col">#</th>${T.cols.map(c=>`<th scope="col">${escH(c)}</th>`).join("")}${T.parts.map(p=>`<th scope="col" class="sqv-e">${escH(p)}</th>`).join("")}<th scope="col" class="sqv-e">WHERE →</th></tr>`;
  const body=T.rows.map((r,i)=>{const done=i<=k,cls=i===k?"cur":done?(r.keep?"keep":"drop"):"wait";
    return`<tr class="${cls}"><td class="num">${i+1}</td>${r.vals.map(v=>`<td${typeof v==="number"?' class="num"':""}>${vtxt(v)}</td>`).join("")}${r.parts.map(v=>`<td>${done?tv(v):""}</td>`).join("")}<td class="sqv-vd">${done?tv(r.v)+(r.keep?" ✓ giữ":" ✗ bỏ"):""}</td></tr>`}).join("");
  const kept=T.rows.filter((r,i)=>i<=k&&r.keep).map(r=>r.vals);
  return`<div class="sq-tw"><table class="sq-t sqv-src"><caption>${escH(T.table)} · WHERE ${escH(T.where)}</caption><thead>${head}</thead><tbody>${body}</tbody></table></div>`+
    `<div class="sqv-res"><p class="sqv-rh">Kết quả${k>=n?"":" (đang lập)"}: ${kept.length} dòng</p>${gridHtml(T.cols,kept,100)}</div>`};
/* GROUP BY: bảng nguồn (mỗi dòng ghi nhóm), các nhóm, bảng kết quả */
VIZ.group=function(T,st){const up=st.upto,G2=T.groups,dup=T.cols.includes(T.key);
  const gi=T.rows.map(r=>r.g),vis=new Set(T.rows.filter((r,i)=>i<=up&&r.g>=0).map(r=>r.g));
  const head=`<tr><th scope="col">#</th>${T.cols.map(c=>`<th scope="col">${escH(c)}</th>`).join("")}${dup?"":`<th scope="col" class="sqv-e">${escH(T.key)}</th>`}<th scope="col">nhóm ${escH(T.key)}</th></tr>`;
  const body=T.rows.map((r,i)=>{const done=i<=up,cls=st.phase==="rows"&&i===st.cur?"cur":done?(r.pass?"keep":"drop"):"wait";
    return`<tr class="${cls}"><td class="num">${i+1}</td>${r.vals.map(v=>`<td${typeof v==="number"?' class="num"':""}>${vtxt(v)}</td>`).join("")}${dup?"":`<td>${vtxt(r.key)}</td>`}<td>${done?(r.pass?`<span class="sqv-g g${r.g%6}">${vtxt(r.key)}</span>`:"✗ WHERE"):""}</td></tr>`}).join("");
  const phase=st.phase,aggOn=j=>phase==="having"||phase==="done"||(phase==="agg"&&j<=st.cur);
  const cards=G2.map((g,j)=>{if(!vis.has(j))return`<div class="sqv-gc wait" aria-hidden="true"><div class="sqv-gh"><span class="sqv-g">…</span></div></div>`;
    const mem=T.rows.filter((r,i)=>i<=up&&r.g===j).map(r=>vtxt(r.vals[0])).join(", ");
    const out=(phase==="having"||phase==="done")&&!g.keep;
    return`<div class="sqv-gc${phase==="agg"&&j===st.cur?" cur":""}${out?" drop":""}"><div class="sqv-gh"><span class="sqv-g g${j%6}">${escH(T.key)} = ${vtxt(g.key)}</span><span>${T.rows.filter((r,i)=>i<=up&&r.g===j).length} dòng</span></div><p class="sqv-gm">${mem}</p>`+
      `<p class="sqv-ga">${aggOn(j)?T.aggs.map((a,m)=>`<span><code>${escH(a)}</code> = <b>${vtxt(g.aggs[m])}</b></span>`).join(""):"<span class=\"sqv-wait\">chưa tính</span>"}</p>${out?`<p class="sqv-gx">HAVING ${escH(T.having)} → FALSE, bỏ nhóm</p>`:""}</div>`}).join("");
  const res=phase==="done"||phase==="having"?T.result.rows:[];
  return`<div class="sq-tw"><table class="sq-t sqv-src"><caption>${escH(T.table)}${T.where?` · WHERE ${escH(T.where)}`:""} · GROUP BY ${escH(T.key)}</caption><thead>${head}</thead><tbody>${body}</tbody></table></div>`+
    `<div class="sqv-groups">${cards}</div><div class="sqv-res"><p class="sqv-rh">Kết quả${phase==="done"?"":" (chưa xong)"}: ${phase==="done"?res.length+" dòng":"…"}</p>${gridHtml(T.result.cols,phase==="done"?res:[],100)}</div>`};
/* JOIN: bảng trái (dòng đang xét), bảng phải (mỗi dòng: kết quả ON), bảng kết quả */
VIZ.join=function(T,st){const k=st.cur,m=st.marks;
  const tbl=(cap,cols,rows,rowCls,extra)=>`<div class="sq-tw"><table class="sq-t"><caption>${cap}</caption><thead><tr><th scope="col">#</th>${cols.map(c=>`<th scope="col">${escH(c)}</th>`).join("")}${extra?`<th scope="col" class="sqv-e">${extra}</th>`:""}</tr></thead><tbody>${rows.map((r,i)=>`<tr class="${rowCls(i)}"><td class="num">${i+1}</td>${r.vals.map(v=>`<td${typeof v==="number"?' class="num"':""}>${vtxt(v)}</td>`).join("")}${extra?`<td>${m?tv(m[i].v)+(m[i].hit?" ✓":""):""}</td>`:""}</tr>`).join("")}</tbody></table></div>`;
  const left=tbl(`Bảng trái: ${escH(T.left.table)} AS ${escH(T.left.as)}`,T.left.cols,T.L,i=>i===k?"cur":i<k?"done":"wait");
  const right=tbl(`Bảng phải: ${escH(T.right.table)} AS ${escH(T.right.as)}`,T.right.cols,T.R,i=>m?(m[i].hit?"keep":"drop"):"wait","ON");
  const out=T.out.slice(0,st.outN);
  const res=`<div class="sq-tw"><table class="sq-t"><caption>Kết quả ${escH(T.type)} JOIN: ${out.length} dòng${k>=T.L.length?"":" (đang lập)"}</caption><thead><tr>${T.cols.map(c=>`<th scope="col">${escH(c)}</th>`).join("")}</tr></thead><tbody>${out.map(o=>`<tr class="${o.l===k?"new":""}${o.pad?" pad":""}">${o.vals.map(v=>`<td${typeof v==="number"?' class="num"':""}>${vtxt(v)}</td>`).join("")}</tr>`).join("")||`<tr><td class="sq-empty" colspan="${T.cols.length}">(chưa có dòng nào)</td></tr>`}</tbody></table></div>`;
  return`<div class="sqv-two">${left}${right}</div><p class="sqv-on">ON ${escH(T.on)}</p><div class="sqv-res">${res}</div>`};
G.SQLUI={VIZ,hlSql,grid:gridHtml};
G.makeSqlViz=function(el,cfg){cfg=cfg||{};const P="sqv-"+(cfg.id||"x");
  const S=(cfg.scenarios||[]).concat((cfg.pick||[]).map(k=>VZ.find(v=>v.id===k)).filter(Boolean));
  if(!S.length){el.textContent="(chưa có kịch bản)";return}
  let si=0,k=0,T=null,asking=false,answered={},busy=false;
  el.classList.add("figure","sqv");
  el.innerHTML=`<div class="mt-top sqv-top"><label class="mt-sel"><span>Ví dụ</span><select id="${P}-sel">${S.map((s,i)=>`<option value="${i}">${escH(s.label)}</option>`).join("")}</select></label>
    <label class="mt-pred"><input type="checkbox" id="${P}-pred"> Đoán trước</label></div>
   <details class="mt-note" id="${P}-note"><summary>Ví dụ này minh họa</summary><div id="${P}-nt"></div></details>
   <div class="sqv-view" id="${P}-view"><pre class="sqv-sql" id="${P}-sql"></pre><div class="sqv-stage" id="${P}-stage"></div><div class="mt-say sqv-say" id="${P}-say" aria-live="polite"></div></div>
   <div class="pipe-ctl mt-ctl"><button type="button" class="btn mt-b0" id="${P}-reset" title="Làm lại từ đầu" aria-label="Làm lại từ đầu">↺</button><button type="button" class="btn mt-b1" id="${P}-prev">← Lùi</button><button type="button" class="btn pri mt-b2" id="${P}-next">Bước tiếp →</button><button type="button" class="btn mt-b3" id="${P}-all">Xem hết</button><span class="mt-k" id="${P}-k" role="status"></span></div>
   <ol class="mt-log" id="${P}-log" aria-label="Các bước đã xem"></ol>`;
  const $=s=>el.querySelector("#"+P+"-"+s);
  const SD=G.steady?G.steady(el,[".sqv-view"],()=>{if(T)prime()}):{hold(){},free(){}};
  if(G.matchMedia&&G.matchMedia("(min-width:901px)").matches)$("note").open=true;
  function paint(fb){asking=false;const sc=S[si];
    if(!T){const ds=D[sc.data];$("sql").innerHTML="";$("stage").innerHTML=dbHtml(tablesOf(ds).filter(t=>JSON.stringify(sc.spec).includes('"'+t.name+'"')),null,20);
      $("say").innerHTML=`<p class="mt-st"><b>${busy?escH(LOADMSG):"Bảng ban đầu"}</b></p>`;$("k").textContent="";["prev","next","all","reset"].forEach(b=>$(b).disabled=true);$("log").innerHTML="";return}
    const st=T.steps,x=st[k];
    $("sql").innerHTML=T.sql.split("\n").map(l=>hlSql(l)).join("\n");
    $("stage").innerHTML=VIZ[T.kind](T,x);
    $("say").innerHTML=(fb||"")+`<p class="mt-st"><b>${escH(x.t)}</b></p><div class="mt-sx"><p>${escH(x.say)}</p></div>`;
    $("k").textContent=`Bước ${k}/${st.length-1}`+(k===st.length-1?" · xong":"");
    $("prev").disabled=k===0;$("next").disabled=$("all").disabled=k===st.length-1;$("reset").disabled=false;
    $("log").innerHTML=st.slice(1,k+1).map((y,i)=>`<li${i+1===k?' class="cur"':""}><button type="button" data-k="${i+1}">${escH(y.t)}</button></li>`).join("");
    $("log").querySelectorAll("button").forEach(b=>b.onclick=()=>{k=+b.dataset.k;paint();SD.hold()});
    SD.hold()}
  /* vẽ trước mọi bước để lấy chiều cao lớn nhất (phần hình chỉ cao thêm), rồi quay lại bước đang xem */
  function prime(){const keep=k;for(k=0;k<T.steps.length;k++)paint();k=keep;paint()}
  function compute(){const sc=S[si],db=E.open(D[sc.data]);try{T=E.trace(db,sc.spec)}catch(e){T=null;$("say").innerHTML=`<p class="bad-t">Lỗi kịch bản: ${escH(e.message)}</p>`;return}finally{db.close()}SD.free();prime()}
  function load(i){si=i;k=0;answered={};SD.free();$("nt").textContent=S[si].note||"";T=null;
    if(E.ready())compute();else{paint();if(started)boot()}}
  let started=false;
  function boot(){started=true;if(E.ready()){if(!T)compute();return}busy=true;paint();
    E.load().then(()=>{busy=false;compute()},e=>{busy=false;$("say").innerHTML=`<p class="bad-t">${loadErr(e)}</p>`})}
  function ask(n){const a=T.steps[n].ask;asking=true;
    $("say").innerHTML=`<div class="mt-qa"><p><b>Đoán trước:</b> ${escH(a.q)}</p><div class="mt-qo">${a.o.map((o,j)=>`<button type="button" class="btn" data-j="${j}">${escH(o)}</button>`).join("")}</div></div>`;
    $("say").querySelectorAll("[data-j]").forEach(b=>b.onclick=()=>{answered[n]=1;k=n;const ok=+b.dataset.j===a.a;
      paint(`<p class="mt-fb ${ok?"ok-t":"bad-t"}">${ok?"✓ Đúng.":"✗ Chưa đúng. Đáp án: "+escH(a.o[a.a])+"."}</p>`)});
    SD.hold();const f=$("say").querySelector("button");if(f)f.focus({preventScroll:true})}
  $("sel").onchange=()=>load(+$("sel").value);
  $("reset").onclick=()=>{if(!T)return;k=0;answered={};paint()};
  $("prev").onclick=()=>{if(!T)return;if(asking){paint();return}if(k>0){k--;paint()}};
  $("next").onclick=()=>{if(!T||asking)return;const n=k+1;if(n>=T.steps.length)return;
    if($("pred").checked&&T.steps[n].ask&&!answered[n])ask(n);else{k=n;paint()}};
  $("all").onclick=()=>{if(!T)return;k=T.steps.length-1;paint()};
  load(0);whenShown(el,boot);
  return{el,load,get trace(){return T},get k(){return k},next:()=>$("next").click(),prev:()=>$("prev").click()}};
/* =====================================================================================
   3. Bài tập viết SQL, chấm tự động (so kết quả với kết quả của truy vấn chuẩn; trang chỉ có mã băm của kết quả)
   ===================================================================================== */
G.makeSqlEx=function(el,lid,exs){el.classList.add("sq-exs");
  el.innerHTML=exs.map((x,i)=>`<article class="ex sq-x" data-i="${i}"><h4>Bài tập ${i+1}. ${escH(x.t)}</h4><div class="mt-d">${x.d}</div>
    <details class="sq-xd"><summary>Xem dữ liệu mẫu: ${escH(D[x.data].title)}</summary><div class="sq-xdb"></div></details>
    <label class="vh" for="${lid}-sx${i}">Câu lệnh SQL của bạn cho bài tập ${i+1}</label>
    <textarea class="sq-xta" id="${lid}-sx${i}" rows="${Math.min(9,Math.max(4,(x.start||"").split("\n").length+1))}" spellcheck="false" autocapitalize="off" autocomplete="off"></textarea>
    <div class="mt-xctl"><button type="button" class="btn sq-try">Chạy thử</button><button type="button" class="btn pri sq-go">Nộp bài</button><button type="button" class="btn sq-again">Làm lại</button><span class="st" role="status" aria-live="polite"></span></div>
    <div class="sq-xres" hidden></div><div class="mt-hint" hidden></div><div class="mt-why" hidden></div></article>`).join("");
  el.querySelectorAll(".sq-x").forEach(card=>{const i=+card.dataset.i,x=exs[i],id=`${lid}-${i}`,ta=card.querySelector("textarea"),st=card.querySelector(".st"),res=card.querySelector(".sq-xres"),H=card.querySelector(".mt-hint"),W=card.querySelector(".mt-why");
    let fails=0;const ex={id,data:[x.data].concat(x.kt||[]).map(k=>D[k]),checks:x.checks,ordered:!!x.ordered};
    card.querySelector(".sq-xdb").innerHTML=dbHtml(tablesOf(D[x.data]),null,20)+(D[x.data].note?`<p class="sq-dsnote">${escH(D[x.data].note)}</p>`:"");
    const fresh=()=>{ta.value=x.start||"";res.hidden=H.hidden=W.hidden=true;st.textContent="";st.className="st"};
    const need=f=>{if(E.ready()){f();return}st.className="st";st.textContent=LOADMSG;E.load().then(()=>{st.textContent="";f()},e=>{st.className="st fail";st.textContent="Không tải được SQLite"})};
    function show(r,title){res.hidden=false;
      res.innerHTML=r.kind==="rows"?`<p class="sq-n">${escH(title)}: ${r.rows.length} dòng × ${r.cols.length} cột</p>${gridHtml(r.cols,r.rows,50)}`:
        r.kind==="err"?`<p class="sq-n bad-t"><b>Lỗi:</b> ${escH(r.vi)}</p>${r.hint?`<p class="sq-hint">${escH(r.hint)}</p>`:""}<p class="sq-raw">SQLite: <code>${escH(r.msg)}</code></p>`:`<p class="sq-n">Câu lệnh chạy xong, không trả về bảng kết quả.</p>`}
    card.querySelector(".sq-try").onclick=()=>need(()=>{const parts=E.split(ta.value);if(!parts.length){st.className="st fail";st.textContent="Chưa có câu lệnh nào.";return}
      const db=E.open(D[x.data]);let r;try{for(const p of parts){r=db.run(p.sql);if(r.kind==="err")break}}finally{db.close()}show(r,"Kết quả chạy thử trên dữ liệu mẫu");st.className="st";st.textContent="Chạy thử (chưa chấm)"});
    card.querySelector(".sq-go").onclick=()=>need(()=>{const g=E.grade(ex,ta.value);if(g.res)show(g.res,"Kết quả của bạn trên dữ liệu mẫu");else res.hidden=true;
      st.className="st "+(g.ok?"pass":"fail");st.textContent=g.ok?"Đạt: "+g.msg:"Chưa đạt: "+g.msg;
      if(G.TRACK)G.TRACK.ex(id,g.ok,g.ok?"đúng":g.msg);
      if(g.ok){H.hidden=true;if(x.why){W.innerHTML=`<b>Giải thích:</b> ${x.why}`;W.hidden=false}}
      else{fails++;const hs=[g.hint].concat((x.hints||[]).slice(0,fails)).filter(Boolean);H.innerHTML=hs.map((h,j)=>`<p><b>${j?"Gợi ý "+j:"Vì sao"}:</b> ${j?h:escH(h)}</p>`).join("");H.hidden=!hs.length}});
    card.querySelector(".sq-again").onclick=()=>{fresh();ta.focus()};
    ta.addEventListener("keydown",e=>{if(e.key==="Enter"&&(e.ctrlKey||e.metaKey)){e.preventDefault();card.querySelector(".sq-try").click()}});
    fresh();
    const was=G.TRACK&&G.TRACK.exOf&&G.TRACK.exOf(id);if(was&&was.pass){st.className="st pass";st.textContent="Đã đạt trước đó · làm lại để ôn"}});
  whenShown(el,()=>{E.load().catch(()=>{})})};
})(typeof window!=="undefined"?window:globalThis);
/* ===================== mã dùng chung của khóa (courses/sql/course.js) ===================== */
/* Khóa Cơ sở dữ liệu & SQL căn bản (AMTS-DAT-001): mã dùng chung cho mọi bài của khóa (nhẹ, không tải SQLite).
   - makeMtEx (cùng mtShuffle, mtSeed, mtNum): CHÉP NGUYÊN từ courses/maytinh/course.js (khóa AMTS-FND-001), bài tập chấm tự động
     không viết code: tính số (num), sắp xếp thứ tự (order), phân loại / ghép cặp (pick). Kết quả lưu như bài tập code:
     TRACK.ex("lN-i", đạt?, chi tiết). Sửa ở maytinh thì chép lại sang đây.
   - Phòng thực hành SQL (makeSqlLab, makeSqlViz, makeSqlEx) ở platform/js/57-sql-*.js, chỉ nạp trên trang khóa này (COURSE_SIMS). */
function mtShuffle(n,seed){let s=seed>>>0;const rnd=()=>{s=(s+0x6D2B79F5)>>>0;let t=s;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296};
  /* xáo trộn cố định theo bài tập (Fisher–Yates); chọn cách xáo có ít nhất nửa số mục rời chỗ để bài tập không gần như đã xếp sẵn */
  let best=null,bf=n+1;
  for(let k=0;k<40;k++){const ix=[...Array(n).keys()];for(let i=n-1;i>0;i--){const j=Math.floor(rnd()*(i+1));[ix[i],ix[j]]=[ix[j],ix[i]]}
    const fixed=ix.filter((v,i)=>v===i).length;if(fixed<bf){best=ix;bf=fixed}if(fixed<=Math.floor(n/2)-1||fixed===0)break}
  return best}
function mtSeed(s){let h=2166136261;for(const c of String(s)){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0}
function mtNum(s){s=String(s||"").trim().replace(/\s+/g,"").replace(/,/g,".").replace(/[×x]10\^?(-?\d+)$/i,"e$1");
  if(!/^[-+]?(\d+\.?\d*|\.\d+)(e[-+]?\d+)?$/i.test(s))return NaN;return Number(s)}
function makeMtEx(el,lid,exs){
  el.classList.add("mt-exs");
  const OK="✓",NO="✗";
  el.innerHTML=exs.map((x,i)=>`<article class="ex mt-x" data-i="${i}"><h4>Bài tập ${i+1}. ${esc(x.t)}</h4><div class="mt-d">${x.d}</div><div class="mt-body"></div>
    <div class="mt-xctl"><button type="button" class="btn pri mt-go">Nộp bài</button><button type="button" class="btn mt-again">Làm lại</button><span class="st" role="status" aria-live="polite"></span></div>
    <div class="mt-hint" hidden></div><div class="mt-why" hidden></div></article>`).join("");
  el.querySelectorAll(".mt-x").forEach(card=>{const i=+card.dataset.i,x=exs[i],id=`${lid}-${i}`,body=card.querySelector(".mt-body"),st=card.querySelector(".st");
    let order=null,fails=0;
    function build(){card.querySelector(".mt-hint").hidden=card.querySelector(".mt-why").hidden=true;st.textContent="";st.className="st";
      if(x.kind==="num")body.innerHTML=`<ol class="mt-items">${x.items.map((it,j)=>`<li><label><span class="mt-q">${it.q}</span><span class="mt-in"><input type="text" inputmode="decimal" autocomplete="off" spellcheck="false" aria-label="Đáp số câu ${j+1}">${it.unit?`<span class="mt-u">${it.unit}</span>`:""}</span></label><span class="mt-mk" aria-hidden="true"></span></li>`).join("")}</ol>`;
      else if(x.kind==="pick")body.innerHTML=`<ol class="mt-items">${x.items.map((it,j)=>`<li><label><span class="mt-q">${it.q}</span><select aria-label="Chọn cho câu ${j+1}"><option value="-1">Chọn…</option>${x.cats.map((c,m)=>`<option value="${m}">${esc(c)}</option>`).join("")}</select></label><span class="mt-mk" aria-hidden="true"></span></li>`).join("")}</ol>`;
      else if(x.kind==="order"){order=mtShuffle(x.items.length,mtSeed(id));drawOrder()}}
    function drawOrder(marks){body.innerHTML=`<ol class="mt-ord">${order.map((o,j)=>`<li${marks?` class="${marks[j]?"ok":"bad"}"`:""}><span class="mt-ot">${x.items[o]}</span><span class="mt-ob"><button type="button" class="btn" data-up="${j}" aria-label="Đưa lên trên"${j===0?" disabled":""}>↑</button><button type="button" class="btn" data-dn="${j}" aria-label="Đưa xuống dưới"${j===order.length-1?" disabled":""}>↓</button></span>${marks?`<span class="mt-mk">${marks[j]?OK:NO}</span>`:""}</li>`).join("")}</ol>`;
      body.querySelectorAll("[data-up],[data-dn]").forEach(b=>b.onclick=()=>{const j=+(b.dataset.up??b.dataset.dn),t=b.dataset.up!==undefined?j-1:j+1;
        [order[j],order[t]]=[order[t],order[j]];drawOrder();const f=body.querySelector(`[data-${b.dataset.up!==undefined?"up":"dn"}="${t}"]`);(f&&!f.disabled?f:body.querySelector("button:not(:disabled)")).focus()})}
    function grade(){let right=0,n=0,miss=false;
      if(x.kind==="order"){const marks=order.map((o,j)=>o===j);right=marks.filter(Boolean).length;n=marks.length;drawOrder(marks)}
      else body.querySelectorAll(".mt-items>li").forEach((li,j)=>{const it=x.items[j],f=li.querySelector("input,select");let ok;
        if(x.kind==="num"){const v=mtNum(f.value);if(f.value.trim()==="")miss=true;const tol=Math.max(it.tol||0,(it.rel||0)*Math.abs(it.a),1e-9);ok=!isNaN(v)&&Math.abs(v-it.a)<=tol}
        else{if(f.value==="-1")miss=true;ok=+f.value===it.a}
        n++;if(ok)right++;li.classList.toggle("ok",ok);li.classList.toggle("bad",!ok);li.querySelector(".mt-mk").textContent=ok?OK:NO});
      const pass=right===n;
      st.className="st "+(pass?"pass":"fail");
      st.textContent=pass?`Đạt: đúng ${right}/${n}`:`Chưa đạt: đúng ${right}/${n}`+(miss?" (còn câu chưa trả lời)":"");
      if(window.TRACK)TRACK.ex(id,pass,`đúng ${right}/${n}`);
      const H=card.querySelector(".mt-hint"),W=card.querySelector(".mt-why");
      if(pass){H.hidden=true;if(x.why){W.innerHTML=`<b>Giải thích:</b> ${x.why}`;W.hidden=false}}
      else if(x.hints&&x.hints.length){fails++;H.innerHTML=x.hints.slice(0,Math.min(fails,x.hints.length)).map((h,j)=>`<p><b>Gợi ý ${j+1}:</b> ${h}</p>`).join("");H.hidden=false}}
    card.querySelector(".mt-go").onclick=grade;
    card.querySelector(".mt-again").onclick=()=>{build();const f=body.querySelector("input,select,button");if(f)f.focus()};
    build();
    const was=window.TRACK&&TRACK.exOf&&TRACK.exOf(id);if(was&&was.pass){st.className="st pass";st.textContent="Đã đạt trước đó · làm lại để ôn"}})}
lazyWidgets();
/* đoạn code minh họa: lấy từ thư mục snippets của từng bài; thêm đầu khung (tên file + Sao chép) */
const SNIP={},PRESET_NOTES={},EX_HINTS={};
function copyText(t){if(navigator.clipboard&&navigator.clipboard.writeText)return navigator.clipboard.writeText(t);
  return new Promise((ok,no)=>{const a=document.createElement("textarea");a.value=t;a.setAttribute("readonly","");a.style.position="fixed";a.style.opacity="0";document.body.appendChild(a);a.select();
    try{document.execCommand("copy")?ok():no()}catch(e){no(e)}a.remove()})}
function fillSnips(root){(root||document).querySelectorAll("[data-snip]").forEach(el=>{const src=SNIP[el.dataset.snip];if(!src||el.dataset.filled)return;el.dataset.filled="1";
  el.innerHTML=highlightLines(src).map((s,i)=>`<span class="ln" data-n="${i+1}">${s||" "}</span>`).join("");
  const box=document.createElement("div");box.className="codebox";const h=document.createElement("div");h.className="code-h";
  const name=/\bint\s+main\s*\(/.test(src)?"main.cpp":"C++";
  h.innerHTML=`<span class="code-f">${name}</span><button type="button" class="code-copy">Sao chép</button><span class="vh" role="status" aria-live="polite"></span>`;
  const b=h.querySelector("button"),st=h.querySelector("[role=status]");let t=0;
  b.onclick=()=>copyText(src).then(()=>{b.textContent="Đã sao chép";st.textContent="Đã sao chép đoạn code";clearTimeout(t);t=setTimeout(()=>{b.textContent="Sao chép";st.textContent=""},1800)},()=>{b.textContent="Chưa sao chép được";clearTimeout(t);t=setTimeout(()=>b.textContent="Sao chép",2200)});
  if(el.hasAttribute("data-m")){box.setAttribute("data-m",el.getAttribute("data-m"));el.removeAttribute("data-m")}
  el.replaceWith(box);box.append(h,el)})}
fillSnips();
/* ================= TRANG THỰC HÀNH (#thuc-hanh) =================
   Gom mọi bài tập chấm tự động (EXERCISES, do makeEx2 của từng bài đăng ký) vào một trang:
   danh sách + lọc, đề bài, gợi ý (hints.json của bài), trình mô phỏng dùng chung, Chạy thử / Nộp bài,
   lời giải (solutions/*.cpp, nằm trong nội dung bảo vệ trên Firebase) và trình tự chạy từng bước.
   Lời giải mở khi: đã làm đạt, hoặc đã nộp ít nhất UNLOCK_AFTER lần chưa đạt (giảng viên luôn xem được). */
const PRACTICE=(()=>{
  const C=CMETA,UNLOCK_AFTER=3;
  let items=null,cur=null,sim=null,F="all",built=false;const solCache={},tries={},results={};
  const $=id=>document.getElementById(id);
  const lname=l=>(C.lessons.find(x=>x[0]===l)||[])[1]||"";
  const stOf=id=>window.TRACK&&TRACK.exOf?TRACK.exOf(id):null;
  const triesOf=id=>Math.max((stOf(id)||{}).n||0,tries[id]||0);
  const fold=s=>String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/đ/g,"d");
  function load(){if(items)return items;
    items=(C.practice||[]).map(id=>{const m=/^(l\d+)-(\d+)$/.exec(id);if(!m)return null;const e=(EXERCISES[m[1]]||[])[+m[2]];return e?{id,l:m[1],i:+m[2],e}:null}).filter(Boolean);return items}
  const icon=id=>{const x=stOf(id);return x?(x.pass?["ok","✓","đã đạt"]:["bad","✗","chưa đạt"]):["","","chưa nộp"]};
  function renderSum(){const n=items.filter(x=>(stOf(x.id)||{}).pass).length;
    $("pr-sum").innerHTML=`<span class="pbar" role="progressbar" aria-label="Bài tập đã đạt" aria-valuemin="0" aria-valuemax="${items.length}" aria-valuenow="${n}"><span style="width:${items.length?n/items.length*100:0}%"></span></span><span>Đã đạt <b>${n}/${items.length}</b> bài tập</span>`}
  function renderList(){
    const q=fold(($("pr-q").value||"").trim());let h="",shown=0,lastL=null;
    items.forEach(x=>{const s=stOf(x.id),pass=!!(s&&s.pass);
      if(F==="todo"&&pass||F==="done"&&!pass)return;
      if(q&&!fold(x.e.t+" "+x.e.d+" bai "+x.l.slice(1)+" "+lname(x.l)).includes(q))return;
      if(x.l!==lastL){if(lastL)h+=`</ul></div>`;h+=`<div class="pr-g"><b>${esc(lessonLabel(x.l))} · ${esc(lname(x.l))}</b><ul>`;lastL=x.l}
      const [c,ic,t]=icon(x.id);shown++;
      h+=`<li><button type="button" data-id="${x.id}"${cur&&cur.id===x.id?' aria-current="true"':""}><span class="ex-i ${c}" aria-hidden="true">${ic}</span><span>${x.i+1}. ${esc(x.e.t)}</span><span class="vh"> (${t})</span></button></li>`});
    if(lastL)h+=`</ul></div>`;
    $("pr-list").innerHTML=shown?h:`<p class="pr-empty">Không có bài tập khớp bộ lọc.</p>`;
    $("pr-list").querySelectorAll("[data-id]").forEach(b=>b.onclick=()=>{select(b.dataset.id);if(matchMedia("(max-width:1299px)").matches)$("pr-main").scrollIntoView({behavior:REDUCE()?"auto":"smooth",block:"start"})});
    const sel=$("pr-sel");if(sel){sel.innerHTML=items.map(x=>{const ic=icon(x.id)[1]||"○";return `<option value="${x.id}"${cur&&cur.id===x.id?" selected":""}>${ic} ${esc(lessonLabel(x.l))} · ${x.i+1}. ${esc(x.e.t)}</option>`}).join("")}
    renderSum()}
  let prLang=LANG_CUR; // ngôn ngữ của code đang mở (để lưu nháp đúng chỗ khi học viên đổi ngôn ngữ)
  const draftKey=(id,l)=>{l=l||prLang;return "amts-pr:"+((AMTS.S.user&&AMTS.S.user.uid)||"khach")+":"+id+(l!=="cpp"?":"+l:"")};
  document.addEventListener("amts-lang",()=>{if(!built||!cur)return;const keep=cur.id;saveDraft();prLang=LANG_CUR;for(const k in results)delete results[k];cur=null;select(keep)});
  const ST=e=>exF(e,"start",exLang(e)); // code mẫu theo ngôn ngữ đang chọn
  function saveDraft(){if(!cur||!sim)return;try{const v=sim.get(),cl=LANG_CUR;LANG_CUR=prLang;const st0=ST(cur.e);LANG_CUR=cl;if(v&&v!==st0)localStorage.setItem(draftKey(cur.id),v);else localStorage.removeItem(draftKey(cur.id))}catch(e){}}
  function build(){if(built)return;built=true;load();
    $("pr-main").innerHTML=`<div class="pr-pick"><label for="pr-sel">Chọn bài tập</label><select id="pr-sel"></select></div>
      <div class="pr-info" id="pr-info"></div>
      <div id="pr-sim"></div>
      <div class="pr-btns"><button type="button" class="btn" id="pr-reset">Nạp code mẫu</button><button type="button" class="btn" id="pr-try">Chạy thử</button><button type="button" class="btn pri" id="pr-grade">Nộp bài</button></div>
      <div class="ex-st" id="pr-res" role="status" aria-live="polite"></div>
      <div class="pr-sol" id="pr-sol"></div>
      <div class="pr-nav"><button type="button" class="btn" id="pr-prev">← Bài tập trước</button><button type="button" class="btn" id="pr-next">Bài tập sau →</button></div>`;
    sim=makeSim2($("pr-sim"),{id:"spr",lesson:"",presets:[{label:"Bài tập",code:""}],keepOnLang:true});
    $("pr-sel").onchange=e=>select(e.target.value);
    $("pr-reset").onclick=()=>{if(sim.get()!==ST(cur.e)&&!confirm("Thay code hiện tại bằng code mẫu ban đầu?"))return;sim.set(ST(cur.e));sim.setInput(cur.e.tests[0].in);saveDraft()};
    $("pr-try").onclick=()=>{$("pr-res").innerHTML=tryExHTML(cur.e,sim.get(),sim.lang);sim.setInput(cur.e.tests[0].in);sim.run()};
    $("pr-grade").onclick=grade;
    $("pr-prev").onclick=()=>step(-1);$("pr-next").onclick=()=>step(1);
    $("pr-q").addEventListener("input",renderList);
    document.querySelectorAll(".pr-f [data-f]").forEach(b=>b.onclick=()=>{F=b.dataset.f;document.querySelectorAll(".pr-f [data-f]").forEach(x=>x.setAttribute("aria-pressed",x===b));renderList()});
    document.addEventListener("amts-progress",()=>{renderList();if(cur)renderSol()});
    addEventListener("pagehide",saveDraft);
    $("pr-sim").addEventListener("input",()=>{clearTimeout(build.t);build.t=setTimeout(saveDraft,600)})}
  function step(d){const k=items.findIndex(x=>x.id===cur.id);const n=items[(k+d+items.length)%items.length];select(n.id);$("pr-info").scrollIntoView({behavior:REDUCE()?"auto":"smooth",block:"start"})}
  function select(id){saveDraft();const x=items.find(y=>y.id===id)||items[0];if(!x)return;cur=x;const e=x.e,hints=exF(e,"hints")||((typeof EX_HINTS!=="undefined"?EX_HINTS:{})[x.l]||[])[x.i]||[];
    $("pr-info").innerHTML=`<div class="crumb">${esc(lessonLabel(x.l))} · ${esc(lname(x.l))} · Bài tập ${x.i+1}/${(EXERCISES[x.l]||[]).length}</div>
      <div class="pr-title"><h2>${esc(e.t)}</h2><a href="#bai-${x.l.slice(1)}" data-go="${x.l}" class="pr-lesson">Xem lại bài học →</a></div>
      <p class="pr-d">${esc(exF(e,"d"))}</p>${e.perf?`<p class="ex-perf">Yêu cầu độ hiệu quả: <b>${PERF_TXT[e.perf.need]||""}</b> (bài được chạy thêm với dữ liệu lớn để đếm số bước).</p>`:""}
      <div class="io"><div><div class="pane-h" style="padding:0 0 4px">Ví dụ nhập</div><pre>${esc(e.tests[0].in||"(không có)")}</pre></div><div><div class="pane-h" style="padding:0 0 4px">Kết quả đúng</div><pre>${esc(e.tests[0].out)}</pre></div></div>
      ${hints.length?`<div class="pr-hints"><ol id="pr-hl"></ol><button type="button" class="btn sm" id="pr-hint">Xem gợi ý 1/${hints.length}</button></div>`:""}`;
    if(hints.length){let k=0;const b=$("pr-hint"),ol=$("pr-hl");b.onclick=()=>{ol.insertAdjacentHTML("beforeend",`<li><b>Gợi ý ${k+1}.</b> ${esc(hints[k])}</li>`);k++;if(k>=hints.length)b.remove();else b.textContent=`Xem gợi ý ${k+1}/${hints.length}`}}
    sim.forceLang(exLang(e));let code=ST(e);try{code=localStorage.getItem(draftKey(x.id))||ST(e)}catch(err){}
    sim.set(code);sim.setInput(e.tests[0].in);
    $("pr-res").innerHTML=results[x.id]||`<p class="ex-todo">${(stOf(x.id)||{}).pass?"Bạn đã làm đạt bài này. Có thể nộp lại để luyện thêm.":`Chưa nộp · ${e.tests.length} test sẽ được chấm.`}</p>`;
    renderSol();renderList();
    const h="#thuc-hanh-"+x.id;if(location.hash!==h){try{history.replaceState(null,"",h)}catch(err){}}}
  function grade(){const x=cur,g=gradeEx(x.e,sim.get(),sim.lang);tries[x.id]=triesOf(x.id)+1;
    if(window.TRACK)TRACK.ex(x.id,g.ok,g.d);
    results[x.id]=exResultHTML(x.e,g.R,g.ok,g.pass,g.srcOk)+(x.e.perf?(g.F?perfHTML(x.e.perf,g.F):`<div class="perf"><span class="pf-k">Độ hiệu quả sẽ được đo khi code đúng hết các test.</span></div>`):"");$("pr-res").innerHTML=results[x.id];saveDraft();renderSol();renderList()}
  function unlocked(x){return AMTS.isTeacher()||!!(stOf(x.id)||{}).pass||triesOf(x.id)>=UNLOCK_AFTER}
  function renderSol(){const x=cur,box=$("pr-sol");if(!x)return;
    if(!unlocked(x)){const left=UNLOCK_AFTER-triesOf(x.id);
      box.innerHTML=`<div class="pr-lock"><b>Lời giải</b><p>Lời giải mở khi bạn làm đạt bài này, hoặc sau ${UNLOCK_AFTER} lần nộp chưa đạt (còn ${left} lần). Hãy thử gợi ý trước nhé.</p></div>`;return}
    if(box.dataset.for===x.id&&box.querySelector(".codebox"))return;
    box.dataset.for="";box.innerHTML=`<div class="pr-lock open"><b>Lời giải</b><p>Đã mở. Xem để so sánh với cách làm của bạn, rồi chạy từng bước để hiểu chương trình chạy thế nào.</p><button type="button" class="btn" id="pr-showsol">Xem lời giải</button></div>`;
    $("pr-showsol").onclick=()=>showSol(x)}
  async function getSol(l){const pick=o=>o?(LANG_CUR==="cpp"?o.cpp||o.sol:(o.sols||o)[LANG_CUR])||null:null;if(SOL_EMBED)return pick(SOL_EMBED[l]);if(solCache[l])return pick(solCache[l]);{const c=typeof LC!=="undefined"&&LC.get(l);if(c)return pick(solCache[l]={cpp:c.sol,sols:c.sols||{}})}
    const S=await AMTS.ready();if(S.mode!=="ready"){const e=new Error("Chưa kết nối được máy chủ.");e.code="offline";throw e}
    const cfg=await AMTS.getConfig(CID);const d=await AMTS.getLesson(CID,l,C.contentVer,cfg);return pick(solCache[l]=d?{cpp:d.sol,sols:d.sols||{}}:null)}
  async function showSol(x){const box=$("pr-sol");box.innerHTML=`<p class="ex-todo">Đang tải lời giải…</p>`;
    let arr;try{arr=await getSol(x.l)}catch(e){
      box.innerHTML=`<div class="pr-lock"><b>Chưa tải được lời giải</b><p>${e.code==="permission-denied"?"Lời giải thuộc bài cần đăng nhập hoặc bài có phí. Hãy đăng nhập (hoặc kích hoạt khóa học) rồi thử lại.":e.code==="offline"?"Không kết nối được máy chủ. Kiểm tra Internet rồi thử lại.":esc(e.message||String(e))}</p><button type="button" class="btn" id="pr-showsol">Thử lại</button></div>`;
      $("pr-showsol").onclick=()=>showSol(x);return}
    if(cur!==x)return;const src=arr&&arr[x.i];
    if(!src){box.innerHTML=`<div class="pr-lock"><b>Lời giải</b><p>Bài này chưa có lời giải trên máy chủ.${AMTS.isTeacher()?" Giảng viên: hãy tải file noi-dung-${CID}.json mới lên.":""}</p></div>`;return}
    box.dataset.for=x.id;
    box.innerHTML=`<div class="pr-solh"><b>Lời giải tham khảo</b><span>Có nhiều cách đúng; đây là một cách.</span></div>
      <div class="code" data-src></div>
      <div class="pr-trace"><button type="button" class="btn pri" id="pr-run-sol">Xem trình tự chạy từng bước</button><p>Lời giải được nạp vào trình mô phỏng với dữ liệu ví dụ. Bấm <b>Bước tiếp →</b> để đi qua từng dòng và xem biến thay đổi trong khung Bộ nhớ. Code của bạn đã được lưu, chọn lại bài này là thấy.</p></div>`;
    const c=box.querySelector("[data-src]");c.innerHTML=highlightLines(src,LANG_CUR).map((s,i)=>`<span class="ln" data-n="${i+1}">${s||" "}</span>`).join("");
    c.removeAttribute("data-src");const wrap=document.createElement("div");wrap.className="codebox";const h=document.createElement("div");h.className="code-h";
    h.innerHTML=`<span class="code-f">loi-giai.${langOf(LANG_CUR).file.split(".").pop()}</span><button type="button" class="code-copy">Sao chép</button>`;c.replaceWith(wrap);wrap.append(h,c);
    h.querySelector("button").onclick=e=>copyText(src).then(()=>{e.target.textContent="Đã sao chép";setTimeout(()=>e.target.textContent="Sao chép",1800)},()=>{e.target.textContent="Chưa sao chép được"});
    $("pr-run-sol").onclick=()=>{saveDraft();sim.set(src);sim.setInput(x.e.tests[0].in);$("pr-sim").scrollIntoView({behavior:REDUCE()?"auto":"smooth",block:"start"});sim.step()}}
  function open(){build();load();if(!items.length){$("pr-main").innerHTML=(C.exercises||[]).length?`<p class="pr-empty">Bài tập của khóa này không viết code: làm ngay trong từng bài, ở mục <b>Bài tập chấm tự động</b>.</p>`:`<p class="pr-empty">Chưa có bài tập.</p>`;return}
    const want=window.PRACTICE_WANT;window.PRACTICE_WANT=null;
    const first=(want&&items.find(x=>x.id===want))||(cur)||items.find(x=>!(stOf(x.id)||{}).pass)||items[0];select(first.id)}
  return{open,select,get cur(){return cur}};
})();
if(typeof curView!=="undefined"&&curView==="practice")allLessonCode().then(()=>{if(curView==="practice")PRACTICE.open()});

const LESSON_UPDATED={"l1": "2026-11-11T10:10:28Z", "l72": "2026-11-11T08:40:33Z"};
(function(){for(const l in LESSON_UPDATED){const nx=document.querySelector(`#view-${l} div.next`);if(!nx)continue;
  const iso=LESSON_UPDATED[l],d=new Date(iso),p=document.createElement("p");p.className="updated";
  p.innerHTML=`Cập nhật lần cuối: <time datetime="${iso}">${d.toLocaleTimeString("vi-VN",{hour:"2-digit",minute:"2-digit"})}, ${d.toLocaleDateString("vi-VN",{day:"2-digit",month:"2-digit",year:"numeric"})}</time>`;nx.after(p)}})();
if(LESSON_EMBED)for(const l in LESSON_EMBED)mountLesson(l,LESSON_EMBED[l]);
/* ================= TIẾN ĐỘ CỦA KHÓA ĐANG MỞ (CID, CMETA khai báo ở 10-app.js; dùng lõi AMTS) ================= */
const LESSONS=CMETA.lessons.map(x=>x[0]);
const LESSON_NAMES=Object.fromEntries(CMETA.lessons);
let P=AMTS.getLocal(CID);
let saveTimer=null,lastUid=null;
let retryTimer=null;
/* trạng thái lưu: Đã lưu trên máy / Đang đồng bộ / Đã đồng bộ lúc … / Đang chờ kết nối */
const SYNC={st:"idle",at:0};
function setSync(st){SYNC.st=st;if(st==="ok")SYNC.at=Date.now();paintSync()}
function syncText(){const S=AMTS.S;
  if(!S.user)return S.mode==="ready"?["local","Đã lưu trên máy này · đăng nhập để đồng bộ"]:null;
  if(SYNC.st==="pending"||SYNC.st==="saving")return["busy","Đang đồng bộ…"];
  if(SYNC.st==="wait")return["wait",navigator.onLine===false?"Mất kết nối · đã lưu trên máy, sẽ đồng bộ khi có mạng":"Chưa đồng bộ được · đã lưu trên máy, đang thử lại"];
  if(SYNC.at)return["ok","Đã đồng bộ lúc "+new Date(SYNC.at).toLocaleTimeString("vi-VN",{hour:"2-digit",minute:"2-digit"})];
  return["ok","Đã đồng bộ"]}
function paintSync(){const el=document.getElementById("sync-st");if(!el)return;const t=syncText();el.hidden=!t;if(t){el.className="sync "+t[0];el.textContent=t[1]}}
async function pushNow(){clearTimeout(saveTimer);saveTimer=null;if(!AMTS.S.user)return;
  setSync("saving");
  const m=await AMTS.saveCourse(CID,P);
  if(m){P=AMTS.merge(P,m);AMTS.setLocal(CID,P);setSync("ok");renderProgress();if(P.lang&&typeof LANG_FROM_SYNC==="function")LANG_FROM_SYNC(P.lang.l,P.lang.at)}
  else if(AMTS.S.user){setSync("wait");clearTimeout(retryTimer);retryTimer=setTimeout(pushNow,20000)}}
function persist(){AMTS.setLocal(CID,P);clearTimeout(saveTimer);saveTimer=setTimeout(pushNow,1200);if(AMTS.S.user)setSync("pending");else paintSync()}
addEventListener("online",()=>{if(SYNC.st==="wait")pushNow()});
addEventListener("offline",()=>{if(SYNC.st==="wait")paintSync()});
// rời trang hoặc chuyển ứng dụng: lưu ngay, không chờ
addEventListener("pagehide",()=>{if(saveTimer)pushNow()});
document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="hidden"&&saveTimer)pushNow()});
const track=window.TRACK={
  visit(l){if(!LESSONS.includes(l))return;P.visited[l]=Date.now();P.lastLesson=l;persist()},
  done(l,v){P.lessons[l]=v?Date.now():-Date.now();persist();renderProgress()},
  ex(id,pass,detail){const cur=P.ex[id],n=Math.min(999,((cur&&cur.n)||0)+1);
    if(pass)P.ex[id]={pass:true,at:Date.now(),d:String(detail||""),n};
    else if(!cur||!cur.pass)P.ex[id]={pass:false,at:Date.now(),d:String(detail||""),n};
    else cur.n=n;
    persist();renderProgress()},
  exOf(id){return P.ex[id]||null},
  setLang(l,at){P.lang={l,at:at||Date.now()};persist()},
  quizOf(id){return P.quiz[id]||null},
  quiz(id,score,total){const cur=P.quiz[id]||{};P.quiz[id]={score,total,best:Math.max(score,cur.best||0),at:Date.now()};persist();renderProgress()}
};
const doneCount=()=>LESSONS.filter(l=>AMTS.isDone(P,l,CID)).length;
function lastLessonShown(){return VIEWS.find(x=>!document.getElementById("view-"+x).hidden)}
/* sidebar: tiến độ + trạng thái lưu (tài khoản nằm ở thanh điều hướng chung) */
function renderAccount(){
  const el=document.getElementById("acct");if(!el)return;const S=AMTS.S;
  const n=doneCount(),bar=`<div class="pbar" role="progressbar" aria-label="Tiến độ khóa ${escH(CMETA.name)}" aria-valuemin="0" aria-valuemax="${LESSONS.length}" aria-valuenow="${n}"><span style="width:${n/LESSONS.length*100}%"></span></div><div class="pnum">Đã hoàn thành ${n}/${LESSONS.length} bài đang mở</div>`;
  const cont=P.lastLesson&&P.lastLesson!==lastLessonShown()?`<button class="linkbtn" data-go="${P.lastLesson}">Tiếp tục: ${escH(lessonLabel(P.lastLesson))} · ${escH(LESSON_NAMES[P.lastLesson]||"")} →</button>`:"";
  let note="";
  if(S.mode==="unavailable")note=`<p class="acct-note">Tiến độ đang lưu trên trình duyệt này. Đăng nhập Google hoạt động trên bản đăng ở website.</p>`;
  else if(S.mode==="loading"||S.mode==="off")note=`<p class="acct-note">Đang kết nối dịch vụ đăng nhập…</p>`;
  else if(S.mode==="error")note=`<p class="acct-note bad-t">${escH(S.err)}</p>`;
  else if(S.user&&S.saveErr)note=`<p class="acct-note bad-t">${escH(S.saveErr)}</p>`;
  el.innerHTML=bar+`<p class="sync" id="sync-st" role="status" aria-live="polite" hidden></p>`+note+cont;paintSync();
}
const LV_TXT=["chưa học","đã đọc","đã làm bài tập","đạt kiểm tra"];
function renderProgress(){
  document.querySelectorAll("#outline li[data-l],#road li[data-l]").forEach(li=>{const l=li.dataset.l,D=AMTS.detailOf(P,l,CID),d=D.manual||D.level===3;
    li.classList.toggle("done",d);for(let k=1;k<=3;k++)li.classList.toggle("lv"+k,!d&&D.level===k);
    const t=li.querySelector(".st-t");if(t)t.textContent=" ("+(D.level===3?"đạt kiểm tra":d?"đã đánh dấu học xong":LV_TXT[D.level])+(li.classList.contains("cur")?", bài đang học":"")+")"});
  document.querySelectorAll("#road [data-rp]").forEach(x=>{const ls=[...x.closest("details").querySelectorAll("li[data-l]")];if(!ls.length){x.textContent="";return}
    const d=ls.filter(li=>AMTS.isDone(P,li.dataset.l,CID)).length;x.textContent=d?`${d}/${ls.length} bài xong`:""});
  document.querySelectorAll("[data-done]").forEach(b=>{const l=b.dataset.done,D=AMTS.detailOf(P,l,CID),auto=D.level===3,on=auto||D.manual;
    b.classList.toggle("is-done",on);b.setAttribute("aria-pressed",on);b.disabled=auto;
    b.textContent=auto?"✓ Đạt kiểm tra":D.manual?"✓ Đã đánh dấu học xong":"Đánh dấu đã học xong";
    b.title=auto?"Bài được tính hoàn thành tự động vì đã đạt bài tập và trắc nghiệm":D.manual?"Bấm để bỏ đánh dấu":"";
    const box=document.querySelector(`#view-${l} .lprog`);if(box)box.innerHTML=lprogHTML(D)});
  renderAccount();
  document.dispatchEvent(new Event("amts-progress"));
  const mp=document.getElementById("m-prog");if(mp){const n=doneCount();mp.textContent=`${n}/${LESSONS.length} bài`;mp.title=`Đã hoàn thành ${n}/${LESSONS.length} bài đang mở`}
}
/* dải tiến độ cuối bài: Đã đọc → Đã làm bài tập → Đạt kiểm tra */
function lprogHTML(D){const need=Math.ceil(D.exTotal*2/3-1e-9);
  const st=[["Đã đọc",D.read||D.level>0,""],
    ["Đã làm bài tập",D.exTotal?D.exOk:null,D.exTotal?`${D.exPass}/${D.exTotal} bài đạt · cần ${need}`:"bài này không có bài tập"],
    ["Đạt kiểm tra",D.level===3,D.hasQuiz?(D.quiz?`trắc nghiệm cao nhất ${D.quiz.best}/${D.quiz.total} · cần ≥ 3/4`:"chưa làm trắc nghiệm · cần ≥ 3/4"):"không có trắc nghiệm"]];
  return `<b class="lp-h">Tiến độ bài này</b><ol>${st.map(([t,ok,s])=>`<li class="${ok?"ok":ok===null?"na":""}"><span class="lp-i" aria-hidden="true">${ok?"✓":ok===null?"–":""}</span><span><b>${t}</b>${s?`<small>${s}</small>`:""}</span><span class="vh">${ok?": đã đạt":ok===null?": không áp dụng":": chưa đạt"}</span></li>`).join("")}</ol>`+
    (D.level<3&&D.manual?`<p class="lp-n">Bạn đã tự đánh dấu học xong bài này.</p>`:D.level<3?`<p class="lp-n">Bài được tính hoàn thành khi đạt cả bài tập và trắc nghiệm, hoặc khi bạn bấm “Đánh dấu đã học xong”.</p>`:"")}
LESSONS.forEach(l=>{const nx=document.querySelector(`#view-${l} div.next`);if(!nx)return;
  const pg=document.createElement("div");pg.className="lprog";pg.setAttribute("aria-live","polite");nx.before(pg);
  const b=document.createElement("button");b.className="btn done-btn";b.dataset.done=l;b.setAttribute("aria-pressed","false");
  b.onclick=()=>{const D=AMTS.detailOf(P,l,CID);if(D.level===3)return;track.done(l,!D.manual)};nx.prepend(b)});
AMTS.on(S=>{
  const uid=S.user?S.user.uid:null;
  if(uid&&uid!==lastUid&&S.docLoaded){ // vừa đăng nhập: gộp tiến độ trên máy với tiến độ trên máy chủ
    const remote=AMTS.courseOf(S.doc,CID);P=remote?AMTS.merge(remote,P):P;AMTS.setLocal(CID,P);
    lastUid=uid;pushNow();
  }
  if(!uid&&lastUid){P=AMTS.empty();lastUid=null}
  renderProgress();TOPNAV.render();
});
TOPNAV.opts.signOut=async()=>{await pushNow();await AMTS.signOut();P=AMTS.empty();try{localStorage.setItem(VKEY,"road")}catch(e){}location.hash="#lo-trinh";location.reload()};
renderProgress();TOPNAV.render();
{const v=lastLessonShown();if(v&&/^l\d/.test(v)&&(LESSON_EMBED||LOADED.has(v)))track.visit(v)}
AMTS.init();

READY_RAN=true;READY.splice(0).forEach(f=>{try{f()}catch(e){console.error(e)}});
BOOT_DONE();
