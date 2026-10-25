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

const LESSON_UPDATED={"l1": "2026-10-23T05:47:18Z", "l10": "2026-10-21T10:39:37Z", "l11": "2026-10-21T10:48:17Z", "l12": "2026-10-21T10:48:17Z", "l13": "2026-10-21T10:56:23Z", "l14": "2026-10-21T10:56:23Z", "l15": "2026-10-21T11:03:29Z", "l16": "2026-10-21T11:03:29Z", "l17": "2026-10-21T11:06:02Z", "l18": "2026-10-21T11:06:02Z", "l19": "2026-10-21T11:14:08Z", "l2": "2026-10-21T06:30:40Z", "l20": "2026-10-21T11:14:08Z", "l21": "2026-10-24T03:48:22Z", "l22": "2026-10-24T03:48:22Z", "l23": "2026-10-24T03:48:22Z", "l24": "2026-10-24T03:48:22Z", "l25": "2026-10-23T16:19:53Z", "l26": "2026-10-23T15:26:37Z", "l27": "2026-10-23T15:26:37Z", "l28": "2026-10-23T15:26:37Z", "l29": "2026-10-23T15:26:37Z", "l3": "2026-10-21T06:30:40Z", "l30": "2026-10-23T15:45:04Z", "l31": "2026-10-23T15:47:03Z", "l32": "2026-10-23T15:54:57Z", "l33": "2026-10-23T15:58:57Z", "l34": "2026-10-23T16:03:16Z", "l35": "2026-10-23T16:13:36Z", "l36": "2026-10-23T16:19:53Z", "l37": "2026-10-23T16:27:15Z", "l38": "2026-10-23T16:32:25Z", "l39": "2026-10-23T16:40:26Z", "l4": "2026-10-21T06:30:40Z", "l40": "2026-10-23T16:46:26Z", "l41": "2026-10-23T19:15:46Z", "l42": "2026-10-23T19:20:26Z", "l43": "2026-10-23T19:25:45Z", "l44": "2026-10-23T19:29:53Z", "l45": "2026-10-23T19:36:32Z", "l46": "2026-10-23T19:40:59Z", "l47": "2026-10-23T19:45:32Z", "l48": "2026-10-23T19:50:48Z", "l49": "2026-10-23T19:55:49Z", "l5": "2026-10-21T06:30:40Z", "l50": "2026-10-23T20:00:56Z", "l51": "2026-10-23T20:38:23Z", "l52": "2026-10-23T20:43:14Z", "l53": "2026-10-23T21:03:33Z", "l54": "2026-10-23T20:56:53Z", "l55": "2026-10-23T21:03:33Z", "l56": "2026-10-23T21:11:37Z", "l57": "2026-10-23T21:15:43Z", "l58": "2026-10-23T21:21:17Z", "l59": "2026-10-23T21:25:44Z", "l6": "2026-10-21T06:54:39Z", "l60": "2026-10-23T21:30:25Z", "l61": "2026-10-23T21:34:43Z", "l62": "2026-10-23T21:42:41Z", "l63": "2026-10-23T21:48:35Z", "l64": "2026-10-23T21:56:40Z", "l65": "2026-10-23T22:05:07Z", "l66": "2026-10-23T22:10:01Z", "l67": "2026-10-23T22:15:49Z", "l68": "2026-10-23T22:20:42Z", "l69": "2026-10-23T22:26:55Z", "l7": "2026-10-21T06:54:39Z", "l70": "2026-10-23T22:31:52Z", "l71": "2026-10-24T01:02:39Z", "l72": "2026-10-24T01:07:45Z", "l73": "2026-10-24T01:12:41Z", "l74": "2026-10-24T01:17:26Z", "l8": "2026-10-21T10:39:37Z", "l9": "2026-10-21T10:39:37Z"};
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
