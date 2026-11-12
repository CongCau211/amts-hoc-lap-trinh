/* ===================== trình mô phỏng của khóa (platform/js/70-mes-core.js) ===================== */
/* ===================== Khóa MES (AMTS-DAT-009): khung mô phỏng tương tác + nhiệm vụ tự chấm =====================
   mesSim(el, cfg): dựng một trình mô phỏng loại cfg.kind (đăng ký trong MES_ENG bởi các file 71-…79-mes-*.js) và danh sách
   nhiệm vụ cfg.tasks = [{t: "việc cần làm", hint: "gợi ý", ok: "giải thích khi đạt", check: (s, ctx) => true/false}].
   Nhiệm vụ làm lần lượt: chỉ nhiệm vụ đang mở được chấm; kiểm tra lại mỗi khi trình mô phỏng đổi trạng thái.
   ctx.log: nhật ký thao tác của học viên và sự kiện của mô phỏng ({type, …, t}); ctx.since: vị trí nhật ký khi nhiệm vụ mở.
   ctx.has(type, pred): có sự kiện type (thỏa pred) kể từ khi nhiệm vụ mở chưa. */
const MES_ENG={};
const mesE=s=>String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
const mesFmt=(v,d=0)=>{if(v==null||!isFinite(v))return"–";const s=Number(v).toFixed(d).split(".");s[0]=s[0].replace(/\B(?=(\d{3})+(?!\d))/g," ");return s.join(",")};
const mesPct=(v,d=1)=>v==null||!isFinite(v)?"–":mesFmt(v*100,d)+" %";
const mesHM=t=>{t=Math.floor(t);const h=Math.floor(t/3600),m=Math.floor(t%3600/60),s=t%60;return String(6+h).padStart(2,"0")+":"+String(m).padStart(2,"0")+(s?":"+String(s).padStart(2,"0"):"")};
const mesHMs=t=>{t=Math.floor(t);const h=Math.floor(t/3600),m=Math.floor(t%3600/60),s=t%60;return String(6+h).padStart(2,"0")+":"+String(m).padStart(2,"0")+":"+String(s).padStart(2,"0")};
function mesRand(seed){let s=seed>>>0;return()=>{s=(s+0x6D2B79F5)>>>0;let t=s;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}
function mesSim(el,cfg){
  const run=()=>{try{mesBuild(el,cfg)}catch(e){console.error(e);el.innerHTML='<p class="ms-err">Không dựng được trình mô phỏng.</p>'}};
  if(typeof deferInit==="function")deferInit(el,run);else run()}
function mesBuild(el,cfg){
  const eng=MES_ENG[cfg.kind];if(!eng){el.textContent="Thiếu trình mô phỏng "+cfg.kind;return}
  const tasks=cfg.tasks||[];
  el.classList.add("ms");
  el.innerHTML=`<div class="ms-head"><div class="ms-ttl"><b>${mesE(cfg.title||"Mô phỏng")}</b>${cfg.sub?`<span>${cfg.sub}</span>`:""}</div>
    <div class="ms-hctl"><span class="ms-prog" role="status"></span><button type="button" class="btn ms-reset" title="Làm lại từ đầu">↺ Làm lại</button></div></div>
   <div class="ms-wrap"><div class="ms-stage"></div>
    ${tasks.length?`<aside class="ms-tasks" aria-label="Nhiệm vụ"><h4>Nhiệm vụ</h4><ol></ol><div class="ms-say" aria-live="polite"></div></aside>`:""}</div>`;
  const stage=el.querySelector(".ms-stage"),ol=el.querySelector(".ms-tasks ol"),say=el.querySelector(".ms-say"),prog=el.querySelector(".ms-prog");
  let cur=0,done=[],hintOpen=[],ctx=null,inst=null,busy=false;
  function drawTasks(){if(!ol)return;
    ol.innerHTML=tasks.map((t,i)=>`<li class="${done[i]?"ok":i===cur?"cur":"todo"}"><div class="ms-tt">${done[i]?'<span class="ms-ck" aria-label="đã đạt">✓</span>':i===cur?'<span class="ms-ck cur" aria-hidden="true">▸</span>':'<span class="ms-ck" aria-hidden="true">○</span>'}<span>${i<=cur||done[i]?t.t:'<i>Mở sau khi xong nhiệm vụ trước</i>'}</span></div>
      ${i===cur&&!done[i]&&t.hint?(hintOpen[i]?`<p class="ms-hint">${t.hint}</p>`:`<button type="button" class="ms-hbtn" data-h="${i}">Gợi ý</button>`):""}
      ${done[i]&&t.ok?`<p class="ms-okt">${t.ok}</p>`:""}</li>`).join("");
    ol.querySelectorAll("[data-h]").forEach(b=>b.onclick=()=>{hintOpen[+b.dataset.h]=1;drawTasks()});
    const n=done.filter(Boolean).length;prog.textContent=tasks.length?`${n}/${tasks.length} nhiệm vụ`+(n===tasks.length?" · hoàn thành":""):"";}
  function evaluate(){if(busy||!tasks.length)return;busy=true;
    try{let moved=false;
      while(cur<tasks.length){const t=tasks[cur];let ok=false;
        try{ok=!!t.check(inst.state(),ctx)}catch(e){ok=false}
        if(!ok)break;done[cur]=true;cur++;ctx.since=ctx.log.length;moved=true;
        if(say)say.innerHTML=`<p class="ms-fb">✓ Đạt nhiệm vụ ${cur}.${cur===tasks.length?" Bạn đã hoàn thành phòng mô phỏng.":""}</p>`}
      if(moved){drawTasks();if(cur===tasks.length&&window.TRACK&&TRACK.ex)try{TRACK.ex((cfg.id||"x")+"-sim",true,"đạt "+tasks.length+" nhiệm vụ")}catch(e){}}}
    finally{busy=false}}
  function start(){cur=0;done=[];hintOpen=[];if(say)say.innerHTML="";
    if(inst&&inst.stop)inst.stop();
    ctx={log:[],since:0,has(type,pred){for(let i=this.since;i<this.log.length;i++){const e=this.log[i];if(e.type===type&&(!pred||pred(e)))return e}return null},
      count(type,pred){let n=0;for(let i=this.since;i<this.log.length;i++){const e=this.log[i];if(e.type===type&&(!pred||pred(e)))n++}return n}};
    stage.innerHTML="";
    inst=eng(stage,cfg,{log:e=>{ctx.log.push(e)},changed:evaluate});
    drawTasks();evaluate()}
  el.querySelector(".ms-reset").onclick=start;
  start()}
/* ---------- tiện ích dựng giao diện dùng chung của các trình mô phỏng ---------- */
function mesH(tag,cls,html){const x=document.createElement(tag);if(cls)x.className=cls;if(html!=null)x.innerHTML=html;return x}
function mesBtn(txt,cls,fn,title){const b=document.createElement("button");b.type="button";b.className="btn "+(cls||"");b.innerHTML=txt;if(title){b.title=title;b.setAttribute("aria-label",title)}b.onclick=fn;return b}
function mesTable(head,rows,cls){return`<table class="ms-tab ${cls||""}"><thead><tr>${head.map(h=>`<th scope="col">${h}</th>`).join("")}</tr></thead><tbody>${rows.map(r=>`<tr${r.cls?` class="${r.cls}"`:""}>${(r.c||r).map(c=>`<td>${c}</td>`).join("")}</tr>`).join("")}</tbody></table>`}

/* ===================== Hình minh họa theo bước (.mes-fig có <g class="st sN">) =====================
   Hình đặt trong nội dung bài (lên Firestore, không có nút); khi bài được ghép vào trang, gắn nút Lùi/Tiếp.
   Nhóm .st.sN hiện từ bước N trở đi; nhóm .sn.sN (lời thuyết minh trong hình) chỉ hiện ở đúng bước N.
   Danh sách <ol class="mes-steps"> dưới hình: mục thứ N là lời giải thích bước N, chỉ hiện mục của bước đang xem. */
function mesFigSteps(root){
  (root||document).querySelectorAll(".mes-fig").forEach(f=>{if(f._st)return;const svg=f.querySelector("svg");if(!svg)return;
    let n=0;svg.querySelectorAll("g.st,g.sn").forEach(g=>{const m=/\bs(\d+)\b/.exec(g.getAttribute("class"));if(m)n=Math.max(n,+m[1])});
    const ol=f.querySelector("ol.mes-steps");if(ol)n=Math.max(n,ol.children.length);
    if(n<2)return;f._st=1;let k=1;
    const bar=mesH("div","mes-fctl");
    const prev=mesBtn("← Lùi","",()=>{if(k>1){k--;paint()}},"Bước trước"),next=mesBtn("Tiếp →","pri",()=>{if(k<n){k++;paint()}},"Bước sau"),
      all=mesBtn("Xem hết","",()=>{k=n;paint()},"Hiện toàn bộ hình"),again=mesBtn("↺","",()=>{k=1;paint()},"Xem lại từ bước 1");
    const lab=mesH("span","mes-fk");lab.setAttribute("aria-live","polite");
    bar.append(again,prev,lab,next,all);
    const cap=f.querySelector(".mt-cap");f.insertBefore(bar,ol||cap||null);
    function paint(){svg.querySelectorAll("g.st").forEach(g=>{const m=/\bs(\d+)\b/.exec(g.getAttribute("class"));g.style.opacity=m&&+m[1]>k?"0":"";g.style.visibility=m&&+m[1]>k?"hidden":""});
      svg.querySelectorAll("g.sn").forEach(g=>{const m=/\bs(\d+)\b/.exec(g.getAttribute("class"));g.style.display=m&&+m[1]!==k?"none":""});
      if(ol)[...ol.children].forEach((li,i)=>{li.dataset.n=i+1;li.hidden=i!==k-1;li.classList.toggle("cur",i===k-1)});
      lab.textContent=`Bước ${k}/${n}`;prev.disabled=k===1;next.disabled=all.disabled=k===n;f.classList.toggle("mes-fend",k===n)}
    f.classList.add("mes-stepped");paint()})}
if(typeof mountLesson==="function"){const _ml=mountLesson;mountLesson=function(l,html){_ml(l,html);try{mesFigSteps(document.getElementById("view-"+l))}catch(e){console.error(e)}}}
document.addEventListener("DOMContentLoaded",()=>{try{mesFigSteps(document)}catch(e){}});
/* ===================== trình mô phỏng của khóa (platform/js/71-mes-line.js) ===================== */
/* ===================== Mô phỏng dây chuyền L1 + FX5U giả lập + MES (khóa MES) =====================
   Ba máy M1 rót 2,0 s, M2 dán nắp 1,8 s, M3 cân 1,5 s nối bằng hai bộ đệm. Mỗi máy có một FX5U với bảng tag của khóa:
   D100 từ trạng thái (bit 0 RUN, bit 1 FAULT, bit 2 AUTO), D101 mã lỗi, D102–D103 số đạt 32 bit, D104–D105 số lỗi 32 bit,
   D106 nhịp tim, D110 mã sản phẩm, D111 cờ bắt tay (MES ghi 1, PLC trả 2 = ACK, 3 = REJECT).
   Phía MES: collector đọc mỗi chu kỳ (mặc định 1 s), sinh sự kiện trạng thái (StateTracker), số đếm delta (CounterTracker),
   NO_DATA khi mất mạng, OEE từng máy, Andon leo thang 5 / 15 phút, lệnh và bắt tay mã sản phẩm.
   Giờ mô phỏng tính bằng giây kể từ 06:00; ca 06:00–14:00, nghỉ 10:00–10:30 (theo ví dụ của khóa).
   cfg: machines ["M1","M2","M3"], panels [...], start (giây), speed, until (dừng tự động), script [[t,"lệnh",…]], net, poll,
        rej {M3:0.03}, show (máy mặc định của bảng thanh ghi), order {code, qty}, faults {M2:[[12,"kẹt nắp"],…]} */
MES_ENG.line=function(root,cfg,api){
  const NAMES={M1:["Máy rót",2.0],M2:["Máy dán nắp",1.8],M3:["Máy cân",1.5]};
  const MS=cfg.machines||["M1","M2","M3"],PANELS=cfg.panels||["plant","regs","events","oee"];
  const BR=[14400,16200],SHIFT=28800,CAP=20,GRACE=4;
  const rnd=mesRand(cfg.seed||7);
  const FAULTS=Object.assign({M1:[[12,"lỗi vòi rót"],[21,"thiếu liệu"]],M2:[[12,"kẹt nắp"],[21,"thiếu nắp"]],M3:[[12,"cân lệch"],[30,"lỗi cảm biến"]]},cfg.faults||{});
  const MAP=Object.assign({"M2:12":"EQ-CAP-JAM · Kẹt nắp","M2:21":"MT-SHORT · Thiếu liệu"},cfg.map||{});
  const REASONS=cfg.reasons||["Kẹt nắp","Cân lệch","Lỗi cảm biến","Thiếu liệu","Đổi sản phẩm","Chờ lệnh","Thiếu người","Khác"];
  const S={t:cfg.start||0,speed:cfg.speed==null?10:cfg.speed,net:{},poll:cfg.poll||1,m:{},mes:{events:[],open:{},counts:[],andon:[],nodata:0,warn:[]},order:null,buf:{b1:cfg.b1==null?6:cfg.b1,b2:cfg.b2==null?6:cfg.b2}};
  MS.forEach(k=>{S.m[k]={id:k,name:NAMES[k][0],cyc:NAMES[k][1],auto:true,fault:0,starve:false,slow:1,rej:(cfg.rej||{})[k]||0,prog:0,good:0,bad:0,hb:0,wait:0,run:0,down:0,idle:0,brk:0,
    D110:0,D111:0,noAck:false,state:"IDLE",reset:0,hbStop:false};S.net[k]=true});
  if(cfg.order)S.order=Object.assign({status:"RELEASED",sent:null,good0:null,good:0},cfg.order);
  let timer=null,acc=0,lastPoll={};
  const inBreak=t=>t>=BR[0]&&t<BR[1];
  /* ---------- PLC: một bước 0,1 s ---------- */
  function hasIn(i){const k=MS[i];if(k==="M1")return!S.m.M1.starve;if(k==="M2")return MS.includes("M1")?S.buf.b1>0:true;if(k==="M3")return MS.includes("M2")?S.buf.b2>0:true}
  function hasOut(i){const k=MS[i];if(k==="M1")return MS.includes("M2")?S.buf.b1<CAP:true;if(k==="M2")return MS.includes("M3")?S.buf.b2<CAP:true;return true}
  function take(k){if(k==="M2"&&MS.includes("M1"))S.buf.b1--;if(k==="M3"&&MS.includes("M2"))S.buf.b2--}
  function put(k){if(k==="M1"&&MS.includes("M2"))S.buf.b1++;if(k==="M2"&&MS.includes("M3"))S.buf.b2++}
  function plcStep(dt){
    MS.forEach((k,i)=>{const m=S.m[k];m.hbAcc=(m.hbAcc||0)+dt;if(m.hbAcc>=1){m.hbAcc-=1;if(!m.hbStop)m.hb=(m.hb+1)&0xFFFF}
      let st;
      if(m.fault)st="DOWN";else if(!m.auto)st="STOP";else if(inBreak(S.t))st="BREAK";
      else{const can=hasIn(i)&&hasOut(i);if(can)m.wait=0;else m.wait+=dt;st=can||m.wait<GRACE?"RUN":"IDLE"}
      m.state=st;
      if(st==="RUN"&&hasIn(i)&&hasOut(i)){m.prog+=dt/(m.cyc*m.slow);
        if(m.prog>=1){m.prog-=1;take(k);if(rnd()<m.rej){m.bad++}else{m.good++;put(k)}
          if(S.order&&S.order.status==="RUNNING"&&k===MS[MS.length-1])S.order.good++}}
      if(st==="RUN")m.run+=dt;else if(st==="DOWN")m.down+=dt;else if(st==="BREAK")m.brk+=dt;else m.idle+=dt;
      if(m.D111===1){m.ackT=(m.ackT||0)+dt;if(m.ackT>=0.1&&!m.noAck){m.D111=m.state==="RUN"?3:2;m.ackT=0;api.log({type:"plcAck",m:k,v:m.D111,t:S.t})}}});
    S.t+=dt}
  function D(k){const m=S.m[k];if(m.hbStop&&m.frozen)return m.frozen.slice();const w=(m.state==="RUN"?1:0)|(m.fault?2:0)|(m.auto?4:0);
    return[w,m.fault,m.good&0xFFFF,(m.good>>>16)&0xFFFF,m.bad&0xFFFF,(m.bad>>>16)&0xFFFF,m.hb,0,0,0,m.D110,m.D111]}
  /* ---------- MES: collector + StateTracker + CounterTracker ---------- */
  const decode=w=>w&2?"DOWN":w&1?"RUNNING":"IDLE";
  function mesState(k,st,code){const o=S.mes.open[k];if(o&&o.state===st)return;
    if(o){o.end=S.t;S.mes.events.push(o);api.log({type:"mesEvent",m:k,state:o.state,start:o.start,end:o.end,code:o.code,t:S.t});
      if(o.state==="DOWN"){o.reason=o.reason||MAP[k+":"+o.code]||(o.code?"UNMAPPED":null)}}
    S.mes.open[k]={m:k,state:st,start:S.t,end:null,code:code||0,reason:null};
    if(st==="DOWN")andonOpen(k,"MAINT");
    if(o&&o.state==="DOWN")andonClose(k)}
  function poll(k){const m=S.m[k];
    if(!S.net[k]){if(S.mes.open[k]&&S.mes.open[k].state!=="NO_DATA")mesState(k,"NO_DATA");lastPoll[k]="✗ hết thời gian chờ (mất kết nối)";return}
    const d=D(k),st=decode(d[0]);
    const g=d[2]+d[3]*65536,b=d[4]+d[5]*65536,ct=S.mes.ct||(S.mes.ct={});const c=ct[k]||(ct[k]={g:null,b:null,hb:null,hbSame:0});
    let dg=0,db=0;
    if(c.g!=null){if(g>=c.g)dg=g-c.g;else{dg=g;S.mes.warn.push({m:k,t:S.t,msg:"Bộ đếm giảm "+c.g+" → "+g+": coi là PLC reset"});api.log({type:"counterReset",m:k,t:S.t})}
      if(b>=c.b)db=b-c.b;else db=b}
    c.g=g;c.b=b;
    if(c.hb===d[6])c.hbSame++;else c.hbSame=0;c.hb=d[6];
    if(dg||db){S.mes.counts.push({m:k,t:S.t,good:dg,bad:db});api.log({type:"count",m:k,good:dg,bad:db,t:S.t})}
    const st2=c.hbSame>5?"DOWN":st;
    mesState(k,st2,c.hbSame>5?999:d[1]);
    lastPoll[k]=`đọc D100 ×7 → ${d.slice(0,7).join(", ")}`}
  /* ---------- Andon ---------- */
  function andonOpen(k,kind){if(S.mes.andon.some(a=>a.m===k&&!a.closed))return;const a={m:k,kind,opened:S.t,acked:null,closed:null,level:1};S.mes.andon.push(a);api.log({type:"andonOpen",m:k,t:S.t})}
  function andonClose(k){S.mes.andon.forEach(a=>{if(a.m===k&&!a.closed&&a.kind==="MAINT"){a.closed=S.t;if(!a.acked)a.acked=S.t;api.log({type:"andonClose",m:k,t:S.t})}})}
  function andonTick(){S.mes.andon.forEach(a=>{if(a.closed||a.acked)return;const w=S.t-a.opened,l=w>=900?3:w>=300?2:1;if(l>a.level){a.level=l;api.log({type:"escalate",m:a.m,level:l,t:S.t})}})}
  /* ---------- OEE theo dữ liệu MES (sự kiện + số đếm) ---------- */
  function oee(k){const ev=S.mes.events.filter(e=>e.m===k).concat(S.mes.open[k]?[Object.assign({},S.mes.open[k],{end:S.t})]:[]);
    const t0=cfg.start||0;let run=0,down=0,idle=0,nod=0;
    ev.forEach(e=>{const a=Math.max(e.start,t0),b=e.end;if(b<=a)return;const br=Math.max(0,Math.min(b,BR[1])-Math.max(a,BR[0]));const d=b-a-br;
      if(e.state==="RUNNING")run+=d;else if(e.state==="DOWN")down+=d;else if(e.state==="NO_DATA")nod+=d;else idle+=d});
    const plan=Math.max(0,S.t-t0-Math.max(0,Math.min(S.t,BR[1])-Math.max(t0,BR[0])));
    const good=S.mes.counts.filter(c=>c.m===k).reduce((s,c)=>s+c.good,0),bad=S.mes.counts.filter(c=>c.m===k).reduce((s,c)=>s+c.bad,0),tot=good+bad;
    const pl=plan-nod,A=pl>0?run/pl:null,P=run>0?S.m[k].cyc*tot/run:null,Q=tot?good/tot:null;
    return{plan,run,down,idle,nod,good,bad,tot,A,P,Q,OEE:A!=null&&P!=null&&Q!=null?A*P*Q:null}}
  /* ---------- vòng thời gian ---------- */
  function advance(sec){let left=sec;while(left>1e-9){const dt=Math.min(0.1,left);plcStep(dt);left-=dt;
      MS.forEach(k=>{const ph=(S.t+1e-6)%S.poll;if(ph<dt+1e-6)poll(k)});andonTick();runScript();
      if(cfg.until&&S.t>=cfg.until){S.speed=0;break}}}
  let si=0;const SCR=(cfg.script||[]).slice().sort((a,b)=>a[0]-b[0]);
  function runScript(){while(si<SCR.length&&SCR[si][0]<=S.t){const [,cmd,k,v]=SCR[si++];act(cmd,k,v,true)}}
  function act(cmd,k,v,auto){const m=S.m[k];
    if(cmd==="fault"){m.fault=v||12}else if(cmd==="clear"){m.fault=0}else if(cmd==="auto"){m.auto=!!v}else if(cmd==="starve"){m.starve=!!v}
    else if(cmd==="net"){S.net[k]=!!v}else if(cmd==="slow"){m.slow=v}else if(cmd==="rej"){m.rej=v}else if(cmd==="resetCnt"){m.good=0;m.bad=0;m.reset++}
    else if(cmd==="hbStop"){if(v&&!m.hbStop)m.frozen=D(k);m.hbStop=!!v;if(!v)m.frozen=null}else if(cmd==="poll"){S.poll=v}
    api.log({type:cmd,m:k,v,t:S.t,auto:!!auto})}
  /* ---------- giao diện ---------- */
  const ui={};
  root.classList.add("msl");
  const bar=mesH("div","msl-bar");
  const clock=mesH("span","msl-clock");clock.setAttribute("aria-live","off");
  const spBtns=[[0,"⏸","Tạm dừng"],[1,"×1","Thời gian thật"],[10,"×10","Nhanh 10 lần"],[60,"×60","1 giây = 1 phút"]].map(([v,txt,ti])=>{const b=mesBtn(txt,"msl-sp",()=>{S.speed=v;api.log({type:"speed",v,t:S.t});paint()},ti);b.dataset.v=v;return b});
  const jump=mesBtn("+10 phút","msl-sp",()=>{advance(600);api.log({type:"jump",t:S.t});paint();api.changed()},"Chạy nhanh 10 phút");
  bar.append(clock,...spBtns,jump);
  if(cfg.brief)root.append(mesH("p","msl-brief",cfg.brief));
  root.append(bar);
  const grid=mesH("div","msl-grid");root.append(grid);
  const P={};PANELS.forEach(p=>{P[p]=mesH("section","msl-p msl-"+p);grid.append(P[p])});
  let sel=cfg.show||MS[0];
  /* nhà máy */
  if(P.plant){P.plant.innerHTML=`<h5>Dây chuyền L1 <small>(máy và FX5U giả lập)</small></h5><div class="msl-line"></div>`;
    const ln=P.plant.querySelector(".msl-line");
    MS.forEach((k,i)=>{const m=S.m[k];const c=mesH("div","msl-m");c.innerHTML=`<div class="msl-mh"><span class="msl-lamp"></span><b>${k}</b> ${m.name}</div><div class="msl-st"></div><div class="msl-cnt"></div><div class="msl-bar2"><i></i></div><div class="msl-ctl"></div>`;
      const ctl=c.querySelector(".msl-ctl");
      if(cfg.controls!==false){
        const fs=mesH("select","msl-fsel");fs.setAttribute("aria-label","Mã lỗi gây ra cho "+k);fs.innerHTML=FAULTS[k].map(([c2,n])=>`<option value="${c2}">mã ${c2}: ${n}</option>`).join("");
        const fb=mesBtn("Gây lỗi","msl-f",()=>{act(m.fault?"clear":"fault",k,+fs.value);paint();api.changed()},"Gây lỗi hoặc xóa lỗi "+k);
        const ab=mesBtn("Dừng tay","",()=>{act("auto",k,!m.auto);paint();api.changed()},"Chuyển AUTO/dừng tay "+k);
        ctl.append(fs,fb,ab);
        if(k==="M1"&&!(cfg.noStarve)){const sb=mesBtn("Hết hạt","",()=>{act("starve",k,!m.starve);paint();api.changed()},"Ngừng cấp liệu cho M1");ctl.append(sb);ui["sb"+k]=sb}
        if(cfg.netCtl){const nb=mesBtn("Rút cáp","",()=>{act("net",k,!S.net[k]);paint();api.changed()},"Rút hoặc cắm lại cáp mạng của "+k);ctl.append(nb);ui["nb"+k]=nb}
        if(cfg.rejCtl&&cfg.rejCtl.includes(k)){const r=mesH("label","msl-rej",`Tỉ lệ lỗi <input type="range" min="0" max="0.2" step="0.01" value="${m.rej}"> <span></span>`);
          const inp=r.querySelector("input");inp.oninput=()=>{act("rej",k,+inp.value);paint();api.changed()};ctl.append(r);ui["rj"+k]=r}
        if(cfg.hbCtl){const hb=mesBtn("PLC STOP","",()=>{act("hbStop",k,!m.hbStop);m.auto=!m.hbStop;paint();api.changed()},"Cho PLC dừng chạy chương trình (nhịp tim đứng)");ctl.append(hb);ui["hb"+k]=hb}
        if(cfg.cntCtl){const rb=mesBtn("Reset bộ đếm","",()=>{act("resetCnt",k);paint();api.changed()},"Kỹ sư PLC reset bộ đếm của "+k);ctl.append(rb)}
        ui["fb"+k]=fb;ui["ab"+k]=ab}
      c.onclick=e=>{if(e.target.closest("button,select,input"))return;sel=k;paint()};
      ln.append(c);ui["m"+k]=c;
      if(i<MS.length-1){const b=mesH("div","msl-buf");ln.append(b);ui["buf"+i]=b}})}
  if(P.regs){P.regs.innerHTML=`<h5>Thanh ghi FX5U <span class="msl-rsel"></span></h5><div class="msl-regs"></div><p class="msl-poll"></p>`;
    const rs=P.regs.querySelector(".msl-rsel");MS.forEach(k=>{const b=mesBtn(k,"msl-rb",()=>{sel=k;paint()},"Xem thanh ghi "+k);b.dataset.k=k;rs.append(b)})}
  if(P.events)P.events.innerHTML=`<h5>Sự kiện trạng thái trong MES <small>(state_event)</small></h5><div class="msl-ev"></div>`;
  if(P.counts)P.counts.innerHTML=`<h5>Số đếm MES nhận <small>(count_delta)</small></h5><div class="msl-cd"></div>`;
  if(P.oee)P.oee.innerHTML=`<h5>OEE từ dữ liệu MES <small>(tính từ ${mesHM(cfg.start||0)})</small></h5><div class="msl-oee"></div>`;
  if(P.andon)P.andon.innerHTML=`<h5>Andon chuyền L1</h5><div class="msl-an"></div>`;
  if(P.order){P.order.innerHTML=`<h5>Lệnh sản xuất và bắt tay mã sản phẩm</h5><div class="msl-or"></div><div class="msl-orc"></div>`;
    const oc=P.order.querySelector(".msl-orc");
    const k0=cfg.orderMachine||"M2";
    oc.append(mesBtn("MES ghi D110 = mã, D111 = 1","pri",()=>{const m=S.m[k0];m.D110=S.order.code;m.D111=1;m.ackT=0;S.order.sent=S.t;S.order.res=null;api.log({type:"send",m:k0,t:S.t});paint();api.changed()},"Gửi mã sản phẩm xuống PLC"),
      mesBtn("Bắt đầu lệnh","",()=>{const o=S.order;if(o.res!=="ACK"){o.msg="Chưa có ACK: MES không cho bắt đầu.";api.log({type:"startDenied",t:S.t})}else{o.status="RUNNING";o.msg="";api.log({type:"orderStart",t:S.t})}paint();api.changed()},"Bắt đầu lệnh"));
    if(cfg.noAckCtl){const l=mesH("label","msl-chk",`<input type="checkbox"> PLC không phản hồi (giả lập lỗi)`);l.querySelector("input").onchange=e=>{S.m[k0].noAck=e.target.checked;api.log({type:"noAck",v:e.target.checked,t:S.t})};oc.append(l)}}
  if(P.net)P.net.innerHTML=`<h5>Collector <small>(đọc mỗi <span class="msl-pp"></span> s)</small></h5><div class="msl-nt"></div>`;
  /* ---------- vẽ ---------- */
  const LBL={RUN:"CHẠY",DOWN:"LỖI",IDLE:"CHỜ",STOP:"DỪNG TAY",BREAK:"NGHỈ",RUNNING:"CHẠY",NO_DATA:"MẤT TÍN HIỆU"};
  const CLS={RUN:"ok",RUNNING:"ok",DOWN:"er",IDLE:"wa",STOP:"m",BREAK:"m",NO_DATA:"nd"};
  function paint(){clock.innerHTML=`<b>${mesHMs(S.t)}</b>${inBreak(S.t)?' <span class="msl-tag">giờ nghỉ</span>':""}`;
    spBtns.forEach(b=>b.classList.toggle("on",+b.dataset.v===S.speed));
    MS.forEach((k,i)=>{const m=S.m[k],c=ui["m"+k];if(!c)return;
      c.className="msl-m st-"+CLS[m.state]+(sel===k?" sel":"");
      c.querySelector(".msl-st").innerHTML=`${LBL[m.state]}${m.fault?` · mã ${m.fault}`:""}`;
      c.querySelector(".msl-cnt").innerHTML=`đạt <b>${mesFmt(m.good)}</b> · lỗi <b>${mesFmt(m.bad)}</b>`;
      c.querySelector(".msl-bar2 i").style.width=(m.state==="RUN"?Math.min(100,m.prog*100):0)+"%";
      if(ui["fb"+k])ui["fb"+k].textContent=m.fault?"Xóa lỗi":"Gây lỗi";
      if(ui["ab"+k])ui["ab"+k].textContent=m.auto?"Dừng tay":"Chạy AUTO";
      if(ui["sb"+k])ui["sb"+k].textContent=m.starve?"Cấp hạt lại":"Hết hạt";
      if(ui["nb"+k]){ui["nb"+k].textContent=S.net[k]?"Rút cáp":"Cắm cáp";ui["nb"+k].classList.toggle("warn",!S.net[k])}
      if(ui["hb"+k])ui["hb"+k].textContent=m.hbStop?"PLC RUN lại":"PLC STOP";
      if(ui["rj"+k])ui["rj"+k].querySelector("span").textContent=mesPct(m.rej,0);
      if(i<MS.length-1&&ui["buf"+i]){const v=i===0?S.buf.b1:S.buf.b2;ui["buf"+i].innerHTML=`<span>${v}</span><small>hộp chờ</small>`}});
    if(P.regs){P.regs.querySelectorAll(".msl-rb").forEach(b=>b.classList.toggle("on",b.dataset.k===sel));
      const d=D(sel);const w=d[0];
      const rows=[["D100","Từ trạng thái",`${w} <span class="msl-bits">= ${[2,1,0].map(b=>`<i class="${w>>b&1?"on":""}" title="bit ${b}">${w>>b&1}</i>`).join("")}<small>AUTO FAULT RUN</small></span>`],
        ["D101","Mã lỗi",d[1]],["D102","Số đạt (từ thấp)",d[2]],["D103","Số đạt (từ cao)",`${d[3]} <small>→ ${mesFmt(d[2]+d[3]*65536)} hộp</small>`],["D104","Số lỗi (thấp)",d[4]],["D105","Số lỗi (cao)",d[5]],["D106","Nhịp tim",d[6]],
        ["D110","Mã sản phẩm",d[10]],["D111","Cờ bắt tay",d[11]+(d[11]===2?" (ACK)":d[11]===3?" (REJECT)":d[11]===1?" (MES đã ghi)":"")]];
      P.regs.querySelector(".msl-regs").innerHTML=mesTable(["Thanh ghi","Ý nghĩa","Giá trị"],rows.map(r=>({c:[`<code>${r[0]}</code>`,r[1],r[2]]})));
      P.regs.querySelector(".msl-poll").innerHTML=lastPoll[sel]?`Collector: ${mesE(lastPoll[sel])}`:""}
    if(P.events){const ev=S.mes.events.concat(MS.map(k=>S.mes.open[k]).filter(Boolean).map(o=>Object.assign({},o,{open:true})));
      const show=ev.filter(e=>!cfg.evMachines||cfg.evMachines.includes(e.m)).sort((a,b)=>b.start-a.start).slice(0,cfg.evRows||8);
      P.events.querySelector(".msl-ev").innerHTML=show.length?mesTable(["Máy","Trạng thái","Từ","Tới","Phút","Mã","Lý do"],show.map(e=>({cls:"st-"+CLS[e.state],
        c:[e.m,`<span class="msl-sb ${CLS[e.state]}">${LBL[e.state]||e.state}</span>`,mesHMs(e.start),e.open?"<i>đang mở</i>":mesHMs(e.end),mesFmt(((e.open?S.t:e.end)-e.start)/60,1),e.code||"",
          e.state==="IDLE"&&!e.open&&cfg.pickReason?`<select class="msl-rs" data-i="${S.mes.events.indexOf(e)}" aria-label="Chọn lý do dừng"><option value="">Chọn lý do…</option>${REASONS.map(r=>`<option${e.reason===r?" selected":""}>${r}</option>`).join("")}</select>`:mesE(e.reason||"")]}))):"<p class='msl-empty'>Chưa có sự kiện.</p>";
      P.events.querySelectorAll(".msl-rs").forEach(s=>s.onchange=()=>{const e=S.mes.events[+s.dataset.i];e.reason=s.value;api.log({type:"reason",m:e.m,v:s.value,t:S.t});api.changed()})}
    if(P.counts){const c=S.mes.counts.slice(-6).reverse();P.counts.querySelector(".msl-cd").innerHTML=(c.length?mesTable(["Lúc","Máy","+ đạt","+ lỗi"],c.map(x=>[mesHMs(x.t),x.m,x.good,x.bad])):"")+
      (S.mes.warn.length?`<p class="msl-warn">⚠ ${mesE(S.mes.warn[S.mes.warn.length-1].msg)}</p>`:"")}
    if(P.oee){P.oee.querySelector(".msl-oee").innerHTML=mesTable(["Máy","Kế hoạch","Chạy","A","P","Q","OEE"],MS.map(k=>{const o=oee(k);return[k,mesFmt(o.plan/60,1)+" ph",mesFmt(o.run/60,1)+" ph",mesPct(o.A),mesPct(o.P),mesPct(o.Q),`<b>${mesPct(o.OEE)}</b>`]}))+
      `<p class="msl-note">A = chạy / (kế hoạch − mất tín hiệu) · P = chu kỳ lý tưởng × tổng hộp / chạy · Q = đạt / tổng. Giờ nghỉ 10:00–10:30 không tính.</p>`}
    if(P.andon){const a=S.mes.andon.slice().reverse().slice(0,5);P.andon.querySelector(".msl-an").innerHTML=a.length?a.map((x,i)=>`<div class="msl-ac lv${x.level} ${x.closed?"cl":""}"><b>${x.m} · ${x.kind}</b> mở ${mesHMs(x.opened)} · cấp ${x.level}${x.acked?` · xác nhận ${mesHMs(x.acked)}`:""}${x.closed?` · đóng ${mesHMs(x.closed)}`:""}
        ${!x.acked&&!x.closed?`<button type="button" class="btn msl-ack" data-i="${S.mes.andon.indexOf(x)}">Kỹ thuật xác nhận</button>`:""}</div>`).join(""):"<p class='msl-empty'>Không có cuộc gọi.</p>";
      P.andon.querySelectorAll(".msl-ack").forEach(b=>b.onclick=()=>{const x=S.mes.andon[+b.dataset.i];x.acked=S.t;api.log({type:"ack",m:x.m,t:S.t});paint();api.changed()})}
    if(P.order){const o=S.order,k0=cfg.orderMachine||"M2",m=S.m[k0];
      if(o.sent!=null&&!o.res){if(m.D111===2){o.res="ACK";m.D111=0;api.log({type:"ACK",t:S.t})}else if(m.D111===3){o.res="REJECT";api.log({type:"REJECT",t:S.t})}else if(S.t-o.sent>=3){o.res="TIMEOUT";api.log({type:"TIMEOUT",t:S.t})}}
      P.order.querySelector(".msl-or").innerHTML=`<p>Lệnh <b>${mesE(o.wo||"WO-1")}</b> · sản phẩm ${mesE(o.sp||"SP-07")} (mã ${o.code}) · mục tiêu ${mesFmt(o.qty)} hộp · trạng thái <b>${o.status}</b> · đã làm ${mesFmt(o.good)}</p>
        <p>Kết quả bắt tay: <b class="${o.res==="ACK"?"ok-t":o.res?"bad-t":""}">${o.res||(o.sent!=null?"đang chờ PLC…":"chưa gửi")}</b>${o.msg?` · <span class="bad-t">${mesE(o.msg)}</span>`:""}</p>`}
    if(P.net){P.net.querySelector(".msl-pp").textContent=S.poll;P.net.querySelector(".msl-nt").innerHTML=MS.map(k=>`<p><b>${k}</b> ${S.net[k]?"🟢 nối mạng":"🔴 mất kết nối"} · ${mesE(lastPoll[k]||"")}</p>`).join("")+
      (cfg.pollCtl?`<p>Chu kỳ đọc: ${[1,10].map(v=>`<button type="button" class="btn msl-pc${S.poll===v?" on":""}" data-v="${v}">${v} s</button>`).join(" ")}</p>`:"");
      P.net.querySelectorAll(".msl-pc").forEach(b=>b.onclick=()=>{act("poll",null,+b.dataset.v);paint();api.changed()})}}
  function tick(){if(S.speed>0){advance(0.25*S.speed);paint();api.changed()}}
  /* chạy trước phần lịch sử (cfg.pre: giây) để học viên vào là thấy dữ liệu */
  if(cfg.pre){const sp=S.speed;advance(cfg.pre);S.speed=sp}
  if(!cfg.pre)plcStep(0.1);MS.forEach(k=>poll(k));
  paint();timer=setInterval(()=>{if(!root.isConnected){clearInterval(timer);return}if(root.closest("article[hidden]"))return;tick()},250);
  const st={get t(){return S.t},m:S.m,mes:S.mes,order:S.order,net:S.net,buf:S.buf,get poll(){return S.poll},get speed(){return S.speed},oee,D,inBreak};
  return{state:()=>st,stop:()=>clearInterval(timer)}};
/* ===================== trình mô phỏng của khóa (platform/js/72-mes-basic.js) ===================== */
/* ===================== Khóa MES: các trình mô phỏng cơ bản =====================
   sort     — xếp thẻ vào nhóm (chọn nhóm cho từng thẻ, có phản hồi từng thẻ)
   calc     — thanh trượt / ô số → kết quả tính tức thì + biểu đồ thanh
   timeline — tô trạng thái máy lên trục ca, tự cắt giờ nghỉ, tính A (P, Q, OEE nếu có số đếm), chia theo ca
   bits     — thanh ghi 16 bit: bấm từng bit, xem thập phân / hex / có dấu, ghép hai từ thành 32 bit
   statem   — máy trạng thái: bấm sự kiện, chuyển không hợp lệ bị từ chối, có điều kiện chặn */
/* ---------------- sort ---------------- */
MES_ENG.sort=function(root,cfg,api){
  const bins=cfg.bins,cards=cfg.cards,ans={};const order=cfg.shuffle===false?cards.map((_,i)=>i):mtShuffle(cards.length,mtSeed(cfg.id||"s"));
  root.innerHTML=`${cfg.brief?`<p class="msl-brief">${cfg.brief}</p>`:""}<div class="mss-bins">${bins.map((b,j)=>`<section class="mss-bin" data-j="${j}"><h5>${b}</h5><div class="mss-in"></div></section>`).join("")}</div>
   <div class="mss-pool"><h5>Thẻ chưa xếp</h5><div class="mss-cards"></div></div><div class="mss-fb" aria-live="polite"></div>`;
  const pool=root.querySelector(".mss-cards"),fb=root.querySelector(".mss-fb");
  function card(i){const c=cards[i],d=mesH("div","mss-card"+(ans[i]!=null?(ans[i]===c.bin?" ok":" bad"):""));
    d.innerHTML=`<span>${c.t}</span>`;const sel=mesH("select","mss-sel");sel.setAttribute("aria-label","Chọn nhóm cho thẻ");
    sel.innerHTML=`<option value="">Xếp vào…</option>`+bins.map((b,j)=>`<option value="${j}"${ans[i]===j?" selected":""}>${b.replace(/<[^>]+>/g,"")}</option>`).join("");
    sel.onchange=()=>{if(sel.value==="")delete ans[i];else{ans[i]=+sel.value;const ok=ans[i]===c.bin;api.log({type:"place",i,ok});
      fb.innerHTML=ok?`<p class="ok-t">✓ ${c.why||"Đúng."}</p>`:`<p class="bad-t">✗ Chưa đúng: ${c.hint||"đọc lại thẻ và thử nhóm khác."}</p>`}draw();api.changed()};
    d.append(sel);d.draggable=true;d.ondragstart=e=>{e.dataTransfer.setData("text/plain",i)};return d}
  root.querySelectorAll(".mss-bin").forEach(b=>{b.ondragover=e=>e.preventDefault();b.ondrop=e=>{e.preventDefault();const i=+e.dataTransfer.getData("text/plain");if(isNaN(i))return;
    ans[i]=+b.dataset.j;const ok=ans[i]===cards[i].bin;api.log({type:"place",i,ok});fb.innerHTML=ok?`<p class="ok-t">✓ ${cards[i].why||"Đúng."}</p>`:`<p class="bad-t">✗ Chưa đúng: ${cards[i].hint||"thử nhóm khác."}</p>`;draw();api.changed()}});
  function draw(){pool.innerHTML="";root.querySelectorAll(".mss-in").forEach(x=>x.innerHTML="");
    order.forEach(i=>{const d=card(i);if(ans[i]==null)pool.append(d);else root.querySelector(`.mss-bin[data-j="${ans[i]}"] .mss-in`).append(d)});
    root.querySelector(".mss-pool").hidden=!pool.children.length}
  draw();
  const st={get placed(){return Object.keys(ans).length},get correct(){return cards.filter((c,i)=>ans[i]===c.bin).length},get total(){return cards.length},ans,
    allOk(){return cards.every((c,i)=>ans[i]===c.bin)},binOk(j){return cards.every((c,i)=>c.bin!==j||ans[i]===j)}};
  return{state:()=>st}};
/* ---------------- calc ---------------- */
MES_ENG.calc=function(root,cfg,api){
  const V={};(cfg.inputs||[]).forEach(x=>V[x.k]=x.v);
  root.innerHTML=`${cfg.brief?`<p class="msl-brief">${cfg.brief}</p>`:""}<div class="msc"><div class="msc-in"></div><div class="msc-out"></div></div><div class="msc-chart"></div>`;
  const inp=root.querySelector(".msc-in"),out=root.querySelector(".msc-out"),ch=root.querySelector(".msc-chart");
  (cfg.inputs||[]).forEach(x=>{const l=mesH("label","msc-row");
    if(x.opts){l.innerHTML=`<span>${x.l}</span><select>${x.opts.map((o,j)=>`<option value="${j}"${j===x.v?" selected":""}>${o}</option>`).join("")}</select>`;
      l.querySelector("select").onchange=e=>{V[x.k]=+e.target.value;api.log({type:"set",k:x.k,v:V[x.k]});paint();api.changed()}}
    else{l.innerHTML=`<span>${x.l}</span><input type="range" min="${x.min}" max="${x.max}" step="${x.step||1}" value="${x.v}" aria-label="${mesE(x.l.replace(/<[^>]+>/g,""))}"><input type="number" class="msc-num" min="${x.min}" max="${x.max}" step="${x.step||1}" value="${x.v}" aria-label="${mesE(x.l.replace(/<[^>]+>/g,""))} (ô số)"><em>${x.u||""}</em>`;
      const [r,n]=l.querySelectorAll("input");const set=v=>{v=Math.min(x.max,Math.max(x.min,+v));if(isNaN(v))return;V[x.k]=v;r.value=v;n.value=v;api.log({type:"set",k:x.k,v});paint();api.changed()};
      r.oninput=()=>set(r.value);n.onchange=()=>set(n.value)}
    inp.append(l)});
  function paint(){const R={};(cfg.outputs||[]).forEach(o=>{try{R[o.k]=o.f(V,R)}catch(e){R[o.k]=NaN}});
    out.innerHTML=(cfg.outputs||[]).map(o=>`<div class="msc-o${o.big?" big":""}"><span>${o.l}</span><b class="${o.cls?o.cls(R[o.k],V,R):""}${typeof R[o.k]==="string"?" msc-txt":""}">${o.fmt?o.fmt(R[o.k],V,R):typeof R[o.k]==="string"?mesE(R[o.k]):mesFmt(R[o.k],o.d||0)}</b>${o.x?`<small>${o.x(V,R)}</small>`:""}</div>`).join("");
    if(cfg.bars){const b=cfg.bars(V,R),mx=Math.max(...b.map(x=>Math.abs(x[1])),1e-9);
      ch.innerHTML=`<div class="msc-bars">${b.map(([l,v,c,t])=>`<div class="msc-b"><span>${l}</span><i class="${c||"a"}" style="width:${Math.max(0.5,100*Math.abs(v)/mx).toFixed(1)}%"></i><em>${t!=null?t:mesFmt(v,1)}</em></div>`).join("")}</div>`}
    st.R=R}
  const st={V,R:{}};paint();return{state:()=>st}};
/* ---------------- timeline ---------------- */
MES_ENG.timeline=function(root,cfg,api){
  const T0=cfg.t0||0,T1=cfg.t1||28800,SNAP=cfg.snap||300,breaks=(cfg.breaks||[[14400,16200]]).map(x=>x.slice());
  const rows=(cfg.rows||[{id:"M1",segs:cfg.segs||[["RUNNING",T0,T1]]}]).map(r=>({id:r.id,segs:r.segs.map(s=>({st:s[0],a:s[1],b:s[2]})),good:r.good,bad:r.bad,cyc:r.cyc}));
  const STS=cfg.states||["RUNNING","DOWN","IDLE","NO_DATA"],LB={RUNNING:"CHẠY",DOWN:"LỖI",IDLE:"CHỜ",NO_DATA:"MẤT TÍN HIỆU",BREAK:"NGHỈ",OFF:"KHÔNG KẾ HOẠCH"};
  const CL={RUNNING:"ok",DOWN:"er",IDLE:"wa",NO_DATA:"nd"};
  let brush=STS[1]||"DOWN",drag=null;
  const fm=t=>mesHM(t);
  root.innerHTML=`${cfg.brief?`<p class="msl-brief">${cfg.brief}</p>`:""}
   <div class="mst-tools"><span>Cọ tô:</span>${STS.map(s=>`<button type="button" class="btn mst-br ${CL[s]}" data-s="${s}">${LB[s]}</button>`).join("")}
    ${cfg.breakCtl?`<label class="msl-chk"><input type="checkbox" class="mst-bk" checked> Có giờ nghỉ 10:00–10:30</label>`:""}
    <span class="mst-hint">Kéo trên dải thời gian để tô (bắt bước ${SNAP/60} phút); bấm một đoạn để xem chi tiết.</span></div>
   <div class="mst-rows"></div><div class="mst-axis"></div><div class="mst-out"></div>`;
  const R=root.querySelector(".mst-rows"),AX=root.querySelector(".mst-axis"),OUT=root.querySelector(".mst-out");
  root.querySelectorAll(".mst-br").forEach(b=>b.onclick=()=>{brush=b.dataset.s;paint()});
  const bk=root.querySelector(".mst-bk");if(bk)bk.onchange=()=>{if(bk.checked)breaks.splice(0,breaks.length,...(cfg.breaks||[[14400,16200]]));else breaks.splice(0);api.log({type:"breaks",on:bk.checked});paint();api.changed()};
  function norm(r){r.segs.sort((x,y)=>x.a-y.a);const o=[];r.segs.forEach(s=>{if(s.b<=s.a)return;const l=o[o.length-1];if(l&&l.st===s.st&&l.b>=s.a)l.b=Math.max(l.b,s.b);else o.push(s)});r.segs=o}
  function paintRange(r,a,b,st){if(b<a)[a,b]=[b,a];if(b-a<SNAP)return;const n=[];r.segs.forEach(s=>{if(s.b<=a||s.a>=b){n.push(s);return}if(s.a<a)n.push({st:s.st,a:s.a,b:a});if(s.b>b)n.push({st:s.st,a:b,b:s.b})});
    n.push({st,a,b});r.segs=n;norm(r);api.log({type:"paint",row:r.id,st,a,b})}
  const X=t=>(t-T0)/(T1-T0)*100;
  function inPlan(a,b){let d=b-a;breaks.forEach(([p,q])=>{d-=Math.max(0,Math.min(b,q)-Math.max(a,p))});return Math.max(0,d)}
  function metrics(r){const m={plan:inPlan(T0,T1),RUNNING:0,DOWN:0,IDLE:0,NO_DATA:0};r.segs.forEach(s=>{m[s.st]=(m[s.st]||0)+inPlan(s.a,s.b)});
    m.A=(m.plan-m.NO_DATA)>0?m.RUNNING/(m.plan-m.NO_DATA):null;
    if(r.good!=null){const tot=r.good+(r.bad||0);m.P=m.RUNNING>0?r.cyc*tot/m.RUNNING:null;m.Q=tot?r.good/tot:null;m.OEE=m.A!=null&&m.P!=null?m.A*m.P*m.Q:null}
    m.events=r.segs.length;return m}
  function paint(){
    R.innerHTML=rows.map((r,ri)=>`<div class="mst-row"><b>${r.id}</b><div class="mst-bar" data-r="${ri}">${breaks.map(([p,q])=>`<i class="mst-brk" style="left:${X(p)}%;width:${X(q)-X(p)}%"></i>`).join("")}
      ${r.segs.map((s,si)=>`<span class="mst-seg ${CL[s.st]}" data-si="${si}" style="left:${X(s.a)}%;width:${X(s.b)-X(s.a)}%" title="${LB[s.st]} ${fm(s.a)}–${fm(s.b)}">${X(s.b)-X(s.a)>7?LB[s.st]:""}</span>`).join("")}</div></div>`).join("");
    const tk=cfg.ticks||[0,3600,7200,10800,14400,18000,21600,25200,28800];
    AX.innerHTML=`<div class="mst-ax">${tk.map(t=>`<span style="left:${X(t)}%">${fm(t)}</span>`).join("")}</div>`;
    const ms=rows.map(metrics);st.m=ms;
    OUT.innerHTML=mesTable(["Máy","Kế hoạch","Chạy","Lỗi","Chờ","Mất tín hiệu","A"].concat(rows[0].good!=null?["P","Q","OEE"]:[]),
      rows.map((r,i)=>{const m=ms[i];return[r.id,mesFmt(m.plan/60)+" ph",mesFmt(m.RUNNING/60)+" ph",mesFmt(m.DOWN/60)+" ph",mesFmt(m.IDLE/60)+" ph",mesFmt(m.NO_DATA/60)+" ph",`<b>${mesPct(m.A)}</b>`].concat(r.good!=null?[mesPct(m.P),mesPct(m.Q),`<b>${mesPct(m.OEE)}</b>`]:[])}))+
      `<p class="msl-note">A = chạy / (kế hoạch − mất tín hiệu)${rows[0].good!=null?" · P = chu kỳ lý tưởng × tổng / chạy · Q = đạt / tổng":""}. Phần nằm trong giờ nghỉ không tính.</p>`+
      (cfg.list!==false?`<details class="mst-list"><summary>Danh sách sự kiện (${rows.reduce((s,r)=>s+r.segs.length,0)})</summary>${mesTable(["Máy","Trạng thái","Từ","Tới","Phút (trong kế hoạch)"],rows.flatMap(r=>r.segs.map(s=>[r.id,LB[s.st],fm(s.a),fm(s.b),mesFmt(inPlan(s.a,s.b)/60)])))}</details>`:"");
    root.querySelectorAll(".mst-br").forEach(b=>b.classList.toggle("on",b.dataset.s===brush));
    R.querySelectorAll(".mst-bar").forEach(bar=>{const ri=+bar.dataset.r;
      const tAt=e=>{const rc=bar.getBoundingClientRect();const x=(e.touches?e.touches[0].clientX:e.clientX)-rc.left;return Math.round((T0+(x/rc.width)*(T1-T0))/SNAP)*SNAP};
      bar.onpointerdown=e=>{drag={ri,a:tAt(e)};bar.setPointerCapture&&bar.setPointerCapture(e.pointerId)};
      bar.onpointermove=e=>{if(!drag)return;const b=tAt(e);let g=bar.querySelector(".mst-ghost");if(!g){g=mesH("i","mst-ghost "+CL[brush]);bar.append(g)}
        const a=Math.min(drag.a,b),c=Math.max(drag.a,b);g.style.left=X(a)+"%";g.style.width=(X(c)-X(a))+"%"};
      bar.onpointerup=e=>{if(!drag)return;const b=tAt(e);const d=drag;drag=null;if(Math.abs(b-d.a)>=SNAP){paintRange(rows[d.ri],Math.max(T0,d.a),Math.min(T1,b),brush);paint();api.changed()}else paint()}});
  }
  const st={rows,breaks,m:[],metrics,inPlan,get brush(){return brush}};
  paint();return{state:()=>st}};
/* ---------------- bits ---------------- */
MES_ENG.bits=function(root,cfg,api){
  const regs=(cfg.regs||[{name:"D100",v:0}]).map(r=>Object.assign({},r));
  const names=cfg.bitNames||{};
  root.innerHTML=`${cfg.brief?`<p class="msl-brief">${cfg.brief}</p>`:""}<div class="msb"></div>${cfg.pair?`<div class="msb-pair"></div>`:""}`;
  const box=root.querySelector(".msb"),pair=root.querySelector(".msb-pair");
  function paint(){box.innerHTML="";regs.forEach((r,ri)=>{const v=r.v&0xFFFF,sg=v>=0x8000?v-0x10000:v;
    const d=mesH("div","msb-reg");
    d.innerHTML=`<div class="msb-h"><code>${r.name}</code>${r.l?` <span>${r.l}</span>`:""}</div>
      <div class="msb-bits" role="group" aria-label="16 bit của ${r.name}">${[...Array(16)].map((_,k)=>{const b=15-k;const on=v>>b&1;return`<button type="button" class="msb-bit${on?" on":""}${b%4===3&&b<15?" sep":""}" data-b="${b}" aria-pressed="${!!on}" aria-label="bit ${b}${(names[r.name]||{})[b]?" "+names[r.name][b]:""}"><small>${b}</small>${on}${(names[r.name]||{})[b]?`<em>${names[r.name][b]}</em>`:""}</button>`}).join("")}</div>
      <div class="msb-val"><label>Thập phân <input type="number" min="0" max="65535" value="${v}" class="msb-dec"></label><span>Hex <code>0x${v.toString(16).toUpperCase().padStart(4,"0")}</code></span>
        <span>Có dấu <code>${sg}</code></span><span>Trên dây (byte thấp trước) <code>${(v&255).toString(16).toUpperCase().padStart(2,"0")} ${(v>>8).toString(16).toUpperCase().padStart(2,"0")}</code></span></div>`;
    d.querySelectorAll(".msb-bit").forEach(b=>b.onclick=()=>{r.v=v^(1<<+b.dataset.b);api.log({type:"bit",reg:r.name,b:+b.dataset.b,v:r.v});paint();api.changed()});
    d.querySelector(".msb-dec").onchange=e=>{let x=Math.round(+e.target.value);if(isNaN(x))return;r.v=((x%65536)+65536)%65536;api.log({type:"set",reg:r.name,v:r.v});paint();api.changed()};
    box.append(d)});
    if(pair){const [lo,hi]=cfg.pair;const L=regs.find(r=>r.name===lo),H=regs.find(r=>r.name===hi);const u=(H.v&0xFFFF)*65536+(L.v&0xFFFF);
      pair.innerHTML=`<p>Giá trị 32 bit = <code>${hi}</code> × 65 536 + <code>${lo}</code> = ${mesFmt(H.v&0xFFFF)} × 65 536 + ${mesFmt(L.v&0xFFFF)} = <b>${mesFmt(u)}</b></p>
        <label class="msc-row"><span>Nhập giá trị 32 bit</span><input type="number" min="0" max="4294967295" class="msb-u32" value="${u}"></label>`;
      pair.querySelector(".msb-u32").onchange=e=>{let x=Math.round(+e.target.value);if(isNaN(x)||x<0)return;x=x%4294967296;L.v=x%65536;H.v=Math.floor(x/65536);api.log({type:"u32",v:x});paint();api.changed()};
      st.u32=u}}
  const st={regs,get(n){const r=regs.find(x=>x.name===n);return r?r.v&0xFFFF:null},u32:0};paint();return{state:()=>st}};
/* ---------------- statem ---------------- */
MES_ENG.statem=function(root,cfg,api){
  let cur=cfg.start;const hist=[{s:cur,ev:"(bắt đầu)"}];const vars=Object.assign({},cfg.vars||{});
  root.innerHTML=`${cfg.brief?`<p class="msl-brief">${cfg.brief}</p>`:""}<div class="msm"><div class="msm-g"></div><div class="msm-side"><div class="msm-cur"></div><div class="msm-ev"></div>${cfg.varsUi?`<div class="msm-vars"></div>`:""}<div class="msm-fb" aria-live="polite"></div></div></div><ol class="msm-h"></ol>`;
  const g=root.querySelector(".msm-g"),cu=root.querySelector(".msm-cur"),evb=root.querySelector(".msm-ev"),fb=root.querySelector(".msm-fb"),hl=root.querySelector(".msm-h"),vb=root.querySelector(".msm-vars");
  const evs=[...new Set(cfg.trans.map(t=>t.ev))];
  function fire(ev){const t=cfg.trans.find(t=>t.ev===ev&&(t.from===cur||t.from==="*"));
    if(!t){fb.innerHTML=`<p class="bad-t">✗ Không có chuyển “${mesE(ev)}” từ ${mesE(cur)}. ${cfg.why&&cfg.why[cur+"|"+ev]?cfg.why[cur+"|"+ev]:"Máy trạng thái từ chối, dữ liệu giữ nguyên."}</p>`;api.log({type:"reject",from:cur,ev});return}
    if(t.guard){const r=t.guard(vars);if(r!==true){fb.innerHTML=`<p class="bad-t">✗ Bị chặn: ${r}</p>`;api.log({type:"blocked",from:cur,ev});return}}
    const from=cur;cur=t.to==="="?cur:t.to;if(t.act)t.act(vars);hist.push({s:cur,ev,from});fb.innerHTML=`<p class="ok-t">✓ ${mesE(from)} → ${mesE(cur)}${t.say?": "+t.say:""}</p>`;api.log({type:"go",from,to:cur,ev})}
  function paint(){g.innerHTML=`<div class="msm-states">${cfg.states.map(s=>`<span class="msm-s${s.id===cur?" cur":""}${hist.some(h=>h.s===s.id)?" seen":""}" title="${mesE(s.d||"")}">${mesE(s.l||s.id)}${s.d?`<small>${s.d}</small>`:""}</span>`).join("")}</div>`;
    cu.innerHTML=`Trạng thái hiện tại: <b>${mesE(cur)}</b>`;
    evb.innerHTML="";evs.forEach(ev=>{const ok=cfg.trans.some(t=>t.ev===ev&&(t.from===cur||t.from==="*"));evb.append(mesBtn(ev,ok?"msm-ok":"msm-no",()=>{fire(ev);paint();api.changed()},ev))});
    hl.innerHTML=hist.map(h=>`<li>${h.from?`${mesE(h.from)} —<i>${mesE(h.ev)}</i>→ `:""}<b>${mesE(h.s)}</b></li>`).join("");
    if(vb){vb.innerHTML="";cfg.varsUi.forEach(v=>{const l=mesH("label","msc-row");l.innerHTML=v.bool?`<input type="checkbox"${vars[v.k]?" checked":""}> ${v.l}`:`<span>${v.l}</span><input type="number" value="${vars[v.k]}">`;
      l.querySelector("input").onchange=e=>{vars[v.k]=v.bool?e.target.checked:+e.target.value;api.log({type:"var",k:v.k,v:vars[v.k]});paint();api.changed()};vb.append(l)})}}
  const st={get cur(){return cur},hist,vars,visited:s=>hist.some(h=>h.s===s)};paint();return{state:()=>st}};
/* ===================== trình mô phỏng của khóa (platform/js/73-mes-sql.js) ===================== */
/* ===================== Khóa MES: PostgreSQL thu nhỏ chạy trong trình duyệt (kind "db") =====================
   Đủ cho bài học: SELECT (JOIN, WHERE, GROUP BY, HAVING, ORDER BY, LIMIT, DISTINCT, CASE, hàm gộp), WITH [RECURSIVE],
   INSERT … VALUES … [ON CONFLICT … DO NOTHING | DO UPDATE SET …] [RETURNING], UPDATE, DELETE, BEGIN / COMMIT / ROLLBACK.
   Ràng buộc: PRIMARY KEY, UNIQUE, NOT NULL, FOREIGN KEY, CHECK (biểu thức SQL), DEFAULT, serial. Thông báo lỗi theo mẫu PostgreSQL.
   Thời điểm là chuỗi 'YYYY-MM-DD HH:MM[:SS]'; hiệu hai thời điểm là khoảng (interval); EXTRACT(EPOCH FROM …) ra giây.
   Đây là trình thông dịch rút gọn để học, không phải PostgreSQL thật: câu lệnh ngoài phạm vi trên sẽ báo "chưa hỗ trợ". */
const MSQL=(()=>{
  class SqlErr extends Error{constructor(m,d){super(m);this.detail=d}}
  const KW=new Set("select from where group by having order asc desc limit offset as and or not null is in between like ilike join inner left outer on insert into values update set delete begin commit rollback distinct case when then else end true false with recursive union all conflict do nothing returning interval extract epoch excluded start transaction".split(" "));
  function lex(s){const t=[];let i=0;
    while(i<s.length){const c=s[i];
      if(/\s/.test(c)){i++;continue}
      if(c==="-"&&s[i+1]==="-"){while(i<s.length&&s[i]!=="\n")i++;continue}
      if(c==="'"){let j=i+1,v="";while(j<s.length){if(s[j]==="'"){if(s[j+1]==="'"){v+="'";j+=2;continue}break}v+=s[j++]}if(j>=s.length)throw new SqlErr("unterminated quoted string");t.push({k:"str",v});i=j+1;continue}
      if(c==='"'){let j=i+1;while(j<s.length&&s[j]!=='"')j++;t.push({k:"id",v:s.slice(i+1,j)});i=j+1;continue}
      if(/[0-9]/.test(c)||(c==="."&&/[0-9]/.test(s[i+1]))){let j=i;while(j<s.length&&/[0-9.eE]/.test(s[j]))j++;const raw=s.slice(i,j);t.push({k:"num",v:+raw,f:/[.eE]/.test(raw)});i=j;continue}
      if(/[A-Za-z_\u00C0-\u1EF9]/.test(c)){let j=i;while(j<s.length&&/[A-Za-z0-9_\u00C0-\u1EF9]/.test(s[j]))j++;const w=s.slice(i,j),lw=w.toLowerCase();t.push(KW.has(lw)?{k:"kw",v:lw}:{k:"id",v:lw});i=j;continue}
      const two=s.slice(i,i+2);if(["<=",">=","<>","!=","||","::"].includes(two)){t.push({k:"op",v:two});i+=2;continue}
      if("=<>+-*/%(),;.".includes(c)){t.push({k:"op",v:c});i++;continue}
      throw new SqlErr(`syntax error at or near "${c}"`)}
    t.push({k:"eof"});return t}
  function parse(src){const T=lex(src);let p=0;
    const pk=()=>T[p],nx=()=>T[p++],is=(k,v)=>T[p].k===k&&(v==null||T[p].v===v),kw=v=>is("kw",v),op=v=>is("op",v);
    const eat=(k,v)=>{if(!is(k,v)){const t=T[p];throw new SqlErr(`syntax error at or near "${t.k==="eof"?"end of input":t.v}"`)}return nx()};
    const ekw=v=>eat("kw",v),eop=v=>eat("op",v);
    function ident(){if(is("id"))return nx().v;if(is("kw")&&!["from","where","group","order","limit","on","join","left","inner","set","values","returning","union","having","as","and","or","then","else","end","when","do"].includes(pk().v))return nx().v;eat("id")}
    function qname(){let n=ident();while(op(".")&&T[p+1].k!=="op"){nx();n+="."+ident()}return n}
    /* biểu thức */
    function expr(){return orE()}
    function orE(){let a=andE();while(kw("or")){nx();a={t:"or",a,b:andE()}}return a}
    function andE(){let a=notE();while(kw("and")){nx();a={t:"and",a,b:notE()}}return a}
    function notE(){if(kw("not")){nx();return{t:"not",a:notE()}}return cmpE()}
    function cmpE(){let a=catE();
      for(;;){if(op("=")||op("<>")||op("!=")||op("<")||op(">")||op("<=")||op(">=")){const o=nx().v;a={t:"cmp",o,a,b:catE()};continue}
        if(kw("is")){nx();let neg=false;if(kw("not")){nx();neg=true}if(kw("null")){nx();a={t:"isnull",a,neg};continue}if(kw("true")||kw("false")){const v=nx().v==="true";a={t:"cmp",o:neg?"<>":"=",a,b:{t:"lit",v}};continue}eat("kw","null")}
        let neg=false;if(kw("not")&&(T[p+1].v==="in"||T[p+1].v==="between"||T[p+1].v==="like"||T[p+1].v==="ilike")){nx();neg=true}
        if(kw("in")){nx();eop("(");const l=[];if(kw("select")||kw("with")){const sub=selectStmt();eop(")");a={t:"insub",a,sub,neg};continue}
          do{l.push(expr())}while(op(",")&&nx());eop(")");a={t:"in",a,l,neg};continue}
        if(kw("between")){nx();const lo=catE();ekw("and");const hi=catE();a={t:"between",a,lo,hi,neg};continue}
        if(kw("like")||kw("ilike")){const ci=nx().v==="ilike";a={t:"like",a,b:catE(),neg,ci};continue}
        return a}}
    function catE(){let a=addE();while(op("||")){nx();a={t:"bin",o:"||",a,b:addE()}}return a}
    function addE(){let a=mulE();while(op("+")||op("-")){const o=nx().v;a={t:"bin",o,a,b:mulE()}}return a}
    function mulE(){let a=unE();while(op("*")||op("/")||op("%")){const o=nx().v;a={t:"bin",o,a,b:unE()}}return a}
    function unE(){if(op("-")){nx();return{t:"neg",a:unE()}}let a=prim();while(op("::")){nx();const ty=ident();a={t:"cast",a,ty}}return a}
    function prim(){const t=pk();
      if(t.k==="num"){nx();return{t:"lit",v:t.v,fl:t.f}}if(t.k==="str"){nx();return{t:"lit",v:t.v}}
      if(kw("null")){nx();return{t:"lit",v:null}}if(kw("true")||kw("false")){return{t:"lit",v:nx().v==="true"}}
      if(kw("interval")){nx();const s=eat("str").v;return{t:"lit",v:ivl(s)}}
      if(kw("extract")){nx();eop("(");ekw("epoch");ekw("from");const a=expr();eop(")");return{t:"epoch",a}}
      if(kw("case")){nx();let base=null;if(!kw("when"))base=expr();const w=[];while(kw("when")){nx();const c=expr();ekw("then");w.push([c,expr()])}let el=null;if(kw("else")){nx();el=expr()}ekw("end");return{t:"case",base,w,el}}
      if(op("(")){nx();if(kw("select")){const sub=selectStmt();eop(")");return{t:"sub",sub}}const e=expr();eop(")");return e}
      if(op("*")){nx();return{t:"star"}}
      if(kw("excluded")){nx();eop(".");return{t:"col",tb:"excluded",c:ident()}}
      if(t.k==="id"||(t.k==="kw"&&!["from","where"].includes(t.v))){const n=ident();
        if(op("(")){nx();const f={t:"fn",n,args:[],dist:false};if(op("*")){nx();f.star=true}else if(!op(")")){if(kw("distinct")){nx();f.dist=true}do{f.args.push(expr())}while(op(",")&&nx())}eop(")");return f}
        if(op(".")){nx();if(op("*")){nx();return{t:"star",tb:n}}return{t:"col",tb:n,c:ident()}}
        return{t:"col",c:n}}
      throw new SqlErr(`syntax error at or near "${t.k==="eof"?"end of input":t.v}"`)}
    /* câu lệnh */
    function selectCore(){ekw("select");const dist=kw("distinct")?(nx(),true):false;const items=[];
      do{const e=expr();let al=null;if(kw("as")){nx();al=ident()}else if(is("id"))al=nx().v;items.push({e,al})}while(op(",")&&nx());
      const s={k:"select",dist,items,from:[],where:null,group:[],having:null,order:[],limit:null,offset:null};
      if(kw("from")){nx();s.from.push(fromItem());
        for(;;){if(op(",")){nx();s.from.push(Object.assign(fromItem(),{join:"cross"}));continue}
          let jt=null;if(kw("join")||kw("inner")){if(kw("inner"))nx();jt="inner"}else if(kw("left")){nx();if(kw("outer"))nx();jt="left"}
          if(!jt)break;ekw("join");const f=fromItem();ekw("on");f.join=jt;f.on=expr();s.from.push(f)}}
      if(kw("where")){nx();s.where=expr()}
      if(kw("group")){nx();ekw("by");do{s.group.push(expr())}while(op(",")&&nx())}
      if(kw("having")){nx();s.having=expr()}
      return s}
    function selectStmt(){let s=selectCore();
      while(kw("union")){nx();const all=kw("all")?(nx(),true):false;s={k:"union",a:s,b:selectCore(),all}}
      if(kw("order")){nx();ekw("by");do{const e=expr();let d=false;if(kw("asc"))nx();else if(kw("desc")){nx();d=true}(s.order||(s.order=[])).push({e,d})}while(op(",")&&nx())}
      if(kw("limit")){nx();s.limit=eat("num").v}if(kw("offset")){nx();s.offset=eat("num").v}
      return s}
    function fromItem(){if(op("(")){nx();const sub=selectStmt();eop(")");if(kw("as"))nx();return{sub,al:ident()}}
      const n=qname();let al=null;if(kw("as")){nx();al=ident()}else if(is("id"))al=nx().v;return{tb:n,al:al||n.split(".").pop()}}
    function stmt(){
      if(kw("begin")||kw("start")){nx();if(kw("transaction"))nx();return{k:"begin"}}
      if(kw("commit")){nx();return{k:"commit"}}if(kw("rollback")){nx();return{k:"rollback"}}
      if(kw("with")){nx();const rec=kw("recursive")?(nx(),true):false;const ctes=[];
        do{const n=ident();let cols=null;if(op("(")){nx();cols=[];do{cols.push(ident())}while(op(",")&&nx());eop(")")}ekw("as");eop("(");const q=selectStmt();eop(")");ctes.push({n,cols,q})}while(op(",")&&nx());
        const main=selectStmt();return{k:"with",rec,ctes,main}}
      if(kw("select"))return selectStmt();
      if(kw("insert")){nx();ekw("into");const tb=qname();let cols=null;if(op("(")){nx();cols=[];do{cols.push(ident())}while(op(",")&&nx());eop(")")}
        let rows=null,sel=null;if(kw("values")){nx();rows=[];do{eop("(");const r=[];do{r.push(expr())}while(op(",")&&nx());eop(")");rows.push(r)}while(op(",")&&nx())}else sel=selectStmt();
        let oc=null;if(kw("on")){nx();ekw("conflict");let cc=null;if(op("(")){nx();cc=[];do{cc.push(ident())}while(op(",")&&nx());eop(")")}ekw("do");
          if(kw("nothing")){nx();oc={cc,nothing:true}}else{ekw("update");ekw("set");const sets=[];do{const c=ident();eop("=");sets.push([c,expr()])}while(op(",")&&nx());let w=null;if(kw("where")){nx();w=expr()}oc={cc,sets,w}}}
        let ret=null;if(kw("returning")){nx();ret=[];do{const e=expr();let al=null;if(kw("as")){nx();al=ident()}ret.push({e,al})}while(op(",")&&nx())}
        return{k:"insert",tb,cols,rows,sel,oc,ret}}
      if(kw("update")){nx();const tb=qname();let al=tb.split(".").pop();if(is("id"))al=nx().v;ekw("set");const sets=[];do{const c=ident();eop("=");sets.push([c,expr()])}while(op(",")&&nx());
        let from=null;if(kw("from")){nx();from=[fromItem()];while(op(",")){nx();from.push(fromItem())}}
        let w=null;if(kw("where")){nx();w=expr()}let ret=null;if(kw("returning")){nx();ret=[];do{ret.push({e:expr(),al:null})}while(op(",")&&nx())}return{k:"update",tb,al,sets,from,w,ret}}
      if(kw("delete")){nx();ekw("from");const tb=qname();let al=tb.split(".").pop();if(is("id"))al=nx().v;let w=null;if(kw("where")){nx();w=expr()}return{k:"delete",tb,al,w}}
      throw new SqlErr(`syntax error at or near "${pk().v||"end of input"}"`,"Trình mô phỏng hỗ trợ SELECT, WITH, INSERT, UPDATE, DELETE, BEGIN, COMMIT, ROLLBACK.")}
    const out=[];while(!is("eof")){if(op(";")){nx();continue}out.push(stmt());if(!op(";")&&!is("eof"))eat("op",";")}return out}
  /* ---------- thời gian ---------- */
  function ivl(s){const m=/^\s*(-?\d+(?:\.\d+)?)\s*(second|sec|minute|min|hour|day)s?\s*$/i.exec(s);if(!m)throw new SqlErr(`invalid input syntax for type interval: "${s}"`);
    const k={second:1,sec:1,minute:60,min:60,hour:3600,day:86400}[m[2].toLowerCase()];return{iv:+m[1]*k}}
  const TSR=/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?/;
  const isTs=v=>typeof v==="string"&&TSR.test(v);
  const ts2s=v=>{const m=TSR.exec(v);return Date.UTC(+m[1],m[2]-1,+m[3],+m[4],+m[5],+(m[6]||0))/1000};
  const s2ts=x=>{const d=new Date(x*1000);const z=n=>String(n).padStart(2,"0");return`${d.getUTCFullYear()}-${z(d.getUTCMonth()+1)}-${z(d.getUTCDate())} ${z(d.getUTCHours())}:${z(d.getUTCMinutes())}${d.getUTCSeconds()?":"+z(d.getUTCSeconds()):""}`};
  const fmtIv=v=>{let s=Math.round(v.iv);const neg=s<0;s=Math.abs(s);const z=n=>String(n).padStart(2,"0");return(neg?"-":"")+z(Math.floor(s/3600))+":"+z(Math.floor(s%3600/60))+":"+z(s%60)};
  /* ---------- đánh giá ---------- */
  const AGG=new Set(["count","sum","avg","min","max","bool_and","bool_or","string_agg"]);
  function hasAgg(e){if(!e||typeof e!=="object")return false;if(e.t==="fn"&&AGG.has(e.n))return true;return Object.values(e).some(v=>Array.isArray(v)?v.some(x=>hasAgg(x)||(Array.isArray(x)&&x.some(hasAgg))):hasAgg(v))}
  function cmpv(a,b){if(a&&a.iv!=null&&b&&b.iv!=null)return a.iv-b.iv;if(typeof a==="number"&&typeof b==="string"&&b.trim()!==""&&!isNaN(+b))b=+b;if(typeof b==="number"&&typeof a==="string"&&a.trim()!==""&&!isNaN(+a))a=+a;
    if(typeof a==="boolean")a=+a;if(typeof b==="boolean")b=+b;return a<b?-1:a>b?1:0}
  function DB(schema){
    let tabs={},seq={},tx=null,aborted=false;
    schema.forEach(t=>{tabs[t.name]=(t.rows||[]).map(r=>Object.assign({},r));seq[t.name]=Math.max(0,...tabs[t.name].map(r=>+r[(t.cols.find(c=>c.serial)||{}).n]||0))});
    const S={};schema.forEach(t=>{S[t.name]=t;t.cols.forEach(c=>{if(c.check&&typeof c.check==="string")c._chk=parse("select "+c.check)[0].items[0].e});(t.checks||[]).forEach(k=>{if(typeof k.sql==="string")k._chk=parse("select "+k.sql)[0].items[0].e});(t.unique||[]).forEach(u=>{if(typeof u.where==="string")u._w=parse("select "+u.where)[0].items[0].e})});
    const short=n=>S[n]?n:Object.keys(S).find(k=>k.split(".").pop()===n)||null;
    function tbl(n){const k=short(n);if(!k)throw new SqlErr(`relation "${n}" does not exist`);return k}
    function ev(e,env,grp){switch(e.t){
      case"lit":return e.v;
      case"col":{if(e.tb==="excluded"){if(!env.__excl)throw new SqlErr("missing FROM-clause entry for table \"excluded\"");return env.__excl[e.c]}
        if(e.tb){const r=env[e.tb];if(r===undefined){if(env.__outer)return ev(e,env.__outer,grp);throw new SqlErr(`missing FROM-clause entry for table "${e.tb}"`)}if(r===null)return null;if(!(e.c in r))throw new SqlErr(`column ${e.tb}.${e.c} does not exist`);return r[e.c]}
        if(env.__al&&e.c in env.__al)return env.__al[e.c];
        let found,hit=0;for(const k in env){if(k.startsWith("__"))continue;const r=env[k];if(r&&e.c in r){found=r[e.c];hit++}else if(r===null&&env.__cols&&env.__cols[k]&&env.__cols[k].includes(e.c)){found=null;hit++}}
        if(hit>1)throw new SqlErr(`column reference "${e.c}" is ambiguous`);if(!hit){if(env.__outer)return ev(e,env.__outer,grp);throw new SqlErr(`column "${e.c}" does not exist`)}return found}
      case"star":throw new SqlErr("* chỉ dùng trong danh sách cột");
      case"neg":{const v=ev(e.a,env,grp);return v==null?null:v.iv!=null?{iv:-v.iv}:-v}
      case"not":{const v=ev(e.a,env,grp);return v==null?null:!v}
      case"and":{const a=ev(e.a,env,grp);if(a===false)return false;const b=ev(e.b,env,grp);if(b===false)return false;return a==null||b==null?null:true}
      case"or":{const a=ev(e.a,env,grp);if(a===true)return true;const b=ev(e.b,env,grp);if(b===true)return true;return a==null||b==null?null:false}
      case"cmp":{const a=ev(e.a,env,grp),b=ev(e.b,env,grp);if(a==null||b==null)return null;const c=cmpv(a,b);return{"=":c===0,"<>":c!==0,"!=":c!==0,"<":c<0,">":c>0,"<=":c<=0,">=":c>=0}[e.o]}
      case"isnull":{const v=ev(e.a,env,grp);return e.neg?v!=null:v==null}
      case"in":{const v=ev(e.a,env,grp);if(v==null)return null;const r=e.l.some(x=>cmpv(v,ev(x,env,grp))===0);return e.neg?!r:r}
      case"insub":{const v=ev(e.a,env,grp);const res=runSelect(e.sub,{},env);const r=res.rows.some(x=>cmpv(v,x[0])===0);return e.neg?!r:r}
      case"sub":{const res=runSelect(e.sub,{},env);return res.rows.length?res.rows[0][0]:null}
      case"between":{const v=ev(e.a,env,grp);const r=cmpv(v,ev(e.lo,env,grp))>=0&&cmpv(v,ev(e.hi,env,grp))<=0;return e.neg?!r:r}
      case"like":{const v=ev(e.a,env,grp),pt=ev(e.b,env,grp);if(v==null||pt==null)return null;const re=new RegExp("^"+String(pt).replace(/[.*+?^${}()|[\]\\]/g,"\\$&").replace(/%/g,".*").replace(/_/g,".")+"$",e.ci?"is":"s");const r=re.test(String(v));return e.neg?!r:r}
      case"bin":{const a=ev(e.a,env,grp),b=ev(e.b,env,grp);if(a==null||b==null)return null;
        if(e.o==="||")return String(a)+String(b);
        if(isTs(a)&&isTs(b)&&e.o==="-")return{iv:ts2s(a)-ts2s(b)};
        if(isTs(a)&&b&&b.iv!=null)return s2ts(ts2s(a)+(e.o==="-"?-b.iv:b.iv));
        if(a&&a.iv!=null&&b&&b.iv!=null)return{iv:e.o==="-"?a.iv-b.iv:a.iv+b.iv};
        if(a&&a.iv!=null&&typeof b==="number")return{iv:e.o==="*"?a.iv*b:e.o==="/"?a.iv/b:NaN};
        const x=+a,y=+b;if(isNaN(x)||isNaN(y))throw new SqlErr(`operator does not exist: ${typeof a} ${e.o} ${typeof b}`);
        if(e.o==="/"){if(y===0)throw new SqlErr("division by zero");return intE(e.a)&&intE(e.b)?Math.trunc(x/y):x/y}
        return e.o==="+"?x+y:e.o==="-"?x-y:e.o==="*"?x*y:x%y}
      case"cast":{const v=ev(e.a,env,grp);if(v==null)return null;const ty=e.ty;if(/^(int|integer|bigint|smallint)$/.test(ty))return Math.round(+v);if(/^(numeric|float|real|double|decimal)/.test(ty)){const r=+v;return r}if(ty==="text"||ty==="varchar")return v.iv!=null?fmtIv(v):String(v);if(ty==="date")return String(v).slice(0,10);return v}
      case"epoch":{const v=ev(e.a,env,grp);if(v==null)return null;if(v.iv!=null)return v.iv;if(isTs(v))return ts2s(v);throw new SqlErr("EXTRACT(EPOCH FROM …) cần một khoảng thời gian")}
      case"case":{const base=e.base?ev(e.base,env,grp):undefined;for(const [c,r] of e.w){const ok=e.base?cmpv(base,ev(c,env,grp))===0:ev(c,env,grp)===true;if(ok)return ev(r,env,grp)}return e.el?ev(e.el,env,grp):null}
      case"fn":{const n=e.n;
        if(AGG.has(n)){if(!grp)throw new SqlErr(`aggregate functions are not allowed in this context`);
          let vals=e.star?grp.map(()=>1):grp.map(g=>ev(e.args[0],g)).filter(v=>v!=null);
          if(e.dist){const seen=new Set();vals=vals.filter(v=>{const k=JSON.stringify(v);if(seen.has(k))return false;seen.add(k);return true})}
          if(n==="count")return vals.length;if(!vals.length)return null;
          if(n==="sum")return vals[0]&&vals[0].iv!=null?{iv:vals.reduce((s,v)=>s+v.iv,0)}:vals.reduce((s,v)=>s+(+v),0);
          if(n==="avg")return vals.reduce((s,v)=>s+(+v),0)/vals.length;
          if(n==="min")return vals.reduce((m,v)=>cmpv(v,m)<0?v:m);if(n==="max")return vals.reduce((m,v)=>cmpv(v,m)>0?v:m);
          if(n==="bool_and")return vals.every(Boolean);if(n==="bool_or")return vals.some(Boolean);
          if(n==="string_agg"){const sep=ev(e.args[1],grp[0]);return grp.map(g=>ev(e.args[0],g)).filter(v=>v!=null).join(sep)}}
        const a=e.args.map(x=>ev(x,env,grp));
        switch(n){case"coalesce":return a.find(v=>v!=null)??null;case"round":{if(a[0]==null)return null;const k=Math.pow(10,a[1]||0);return Math.round(a[0]*k)/k}
          case"lower":return a[0]==null?null:String(a[0]).toLowerCase();case"upper":return a[0]==null?null:String(a[0]).toUpperCase();case"length":return a[0]==null?null:String(a[0]).length;
          case"abs":return a[0]==null?null:Math.abs(a[0]);case"greatest":{const v=a.filter(x=>x!=null);return v.length?v.reduce((m,x)=>cmpv(x,m)>0?x:m):null}
          case"least":{const v=a.filter(x=>x!=null);return v.length?v.reduce((m,x)=>cmpv(x,m)<0?x:m):null}
          case"now":return cfgNow;case"nullif":return cmpv(a[0],a[1])===0?null:a[0];case"floor":return a[0]==null?null:Math.floor(a[0]);case"ceil":return a[0]==null?null:Math.ceil(a[0]);
          case"date_trunc":{const u=a[0],v=a[1];if(v==null)return null;if(u==="hour")return v.slice(0,13)+":00";if(u==="day")return v.slice(0,10)+" 00:00";if(u==="minute")return v.slice(0,16);return v}
          case"time_bucket":{if(a[1]==null)return null;const w=(typeof a[0]==="string"?ivl(a[0]):a[0]).iv;return s2ts(Math.floor(ts2s(a[1])/w)*w)}
          case"to_char":return a[0]==null?null:String(a[0]);case"concat":return a.map(x=>x==null?"":x).join("");
          case"gen_random_uuid":return"xxxxxxxx-xxxx-4xxx-8xxx-xxxxxxxxxxxx".replace(/x/g,()=>Math.floor(Math.random()*16).toString(16))}
        throw new SqlErr(`function ${n}() does not exist`)}}
      throw new SqlErr("biểu thức chưa hỗ trợ")}
    let cfgNow="2026-11-11 10:00",ctes={};
    const INTY=/^(int|integer|bigint|smallint|serial|bigserial)$/;
    /* PostgreSQL: số nguyên chia số nguyên thì bỏ phần lẻ (7 / 2 = 3); extract(epoch …), avg, ::numeric, số có dấu chấm là số thực */
    function intE(e){if(!e)return false;switch(e.t){case"lit":return typeof e.v==="number"&&!e.fl&&Number.isInteger(e.v);
      case"col":{for(const k in S){const c=S[k].cols.find(c=>c.n===e.c);if(c)return INTY.test(c.ty||"")}return false}
      case"fn":return e.n==="count"||((e.n==="sum"||e.n==="min"||e.n==="max"||e.n==="abs")&&intE(e.args[0]));
      case"cast":return INTY.test(e.ty);case"neg":return intE(e.a);case"bin":return e.o!=="/"&&e.o!=="||"&&intE(e.a)&&intE(e.b);default:return false}}
    function source(f,outer){if(f.sub){const r=runSelect(f.sub,{},outer);return{rows:r.rows.map(x=>Object.fromEntries(r.cols.map((c,i)=>[c,x[i]]))),cols:r.cols}}
      if(ctes[f.tb])return{rows:ctes[f.tb].rows,cols:ctes[f.tb].cols};const k=tbl(f.tb);return{rows:tabs[k],cols:S[k].cols.map(c=>c.n)}}
    function runSelect(s,_,outer){
      if(s.k==="union"){const a=runSelect(s.a,_,outer),b=runSelect(s.b,_,outer);let rows=a.rows.concat(b.rows);if(!s.all){const seen=new Set();rows=rows.filter(r=>{const k=JSON.stringify(r);if(seen.has(k))return false;seen.add(k);return true})}
        const res={cols:a.cols,rows};if(s.order)res.rows=sortRows(res.rows,s.order,res.cols);if(s.limit!=null)res.rows=res.rows.slice(s.offset||0,(s.offset||0)+s.limit);return res}
      let envs=[{__outer:outer,__cols:{}}];
      s.from.forEach((f,fi)=>{const src=source(f,outer);const al=f.al||f.tb;const n=[];
        envs.forEach(env=>{let hit=false;src.rows.forEach(r=>{const e2=Object.assign({},env,{[al]:r});e2.__cols=Object.assign({},env.__cols,{[al]:src.cols});if(!f.on||ev(f.on,e2)===true){n.push(e2);hit=true}});
          if(!hit&&f.join==="left"){const e2=Object.assign({},env,{[al]:null});e2.__cols=Object.assign({},env.__cols,{[al]:src.cols});n.push(e2)}});envs=n});
      if(s.where)envs=envs.filter(e=>ev(s.where,e)===true);
      const items=[];s.items.forEach(it=>{if(it.e.t==="star"){const al=Object.keys(envs[0]||{}).filter(k=>!k.startsWith("__"));
          const srcs=it.e.tb?[it.e.tb]:s.from.map(f=>f.al||f.tb);srcs.forEach(a=>{const cols=(envs[0]&&envs[0].__cols[a])||source(s.from.find(f=>(f.al||f.tb)===a)||{tb:a}).cols;cols.forEach(c=>items.push({e:{t:"col",tb:a,c},al:c}))})}
        else items.push({e:it.e,al:it.al||(it.e.t==="col"?it.e.c:it.e.t==="fn"?it.e.n:"?column?")})});
      const cols=items.map(i=>i.al);let rows,keep;
      const agg=s.group.length||items.some(i=>hasAgg(i.e))||(s.having&&hasAgg(s.having));
      if(agg){const G=new Map();envs.forEach(e=>{const k=JSON.stringify(s.group.map(g=>{const al=items.find(i=>g.t==="col"&&!g.tb&&i.al===g.c&&!(e[g.c]!==undefined));return ev(al?al.e:g,e)}));if(!G.has(k))G.set(k,[]);G.get(k).push(e)});
        if(!G.size&&!s.group.length)G.set("[]",[]);
        rows=[];keep=[];G.forEach(g=>{const rep=g[0]||{__outer:outer};if(s.having&&ev(s.having,rep,g)!==true)return;rows.push(items.map(i=>ev(i.e,rep,g)));keep.push({rep,g})})}
      else{rows=envs.map(e=>items.map(i=>ev(i.e,e)));keep=envs.map(e=>({rep:e}))}
      if(s.dist){const seen=new Set();const r2=[],k2=[];rows.forEach((r,i)=>{const k=JSON.stringify(r);if(!seen.has(k)){seen.add(k);r2.push(r);k2.push(keep[i])}});rows=r2;keep=k2}
      if(s.order&&s.order.length){const idx=rows.map((r,i)=>i);const key=(o,i)=>{if(o.e.t==="lit"&&typeof o.e.v==="number")return rows[i][o.e.v-1];const ci=o.e.t==="col"&&!o.e.tb?cols.indexOf(o.e.c):-1;if(ci>=0)return rows[i][ci];return ev(o.e,Object.assign({},keep[i].rep,{__al:Object.fromEntries(cols.map((c,j)=>[c,rows[i][j]]))}),keep[i].g)};
        idx.sort((x,y)=>{for(const o of s.order){const a=key(o,x),b=key(o,y);if(a==null&&b==null)continue;if(a==null)return o.d?-1:1;if(b==null)return o.d?1:-1;const c=cmpv(a,b);if(c)return o.d?-c:c}return 0});rows=idx.map(i=>rows[i])}
      if(s.limit!=null||s.offset)rows=rows.slice(s.offset||0,s.limit!=null?(s.offset||0)+s.limit:undefined);
      return{cols,rows}}
    function sortRows(rows,order,cols){return rows.slice().sort((x,y)=>{for(const o of order){const i=o.e.t==="lit"?o.e.v-1:cols.indexOf(o.e.c);const c=cmpv(x[i],y[i]);if(c)return o.d?-c:c}return 0})}
    /* ràng buộc */
    function checkRow(k,r,old){const t=S[k];
      t.cols.forEach(c=>{if((c.nn||c.pk)&&r[c.n]==null)throw new SqlErr(`null value in column "${c.n}" of relation "${k.split(".").pop()}" violates not-null constraint`,`Failing row contains (${t.cols.map(x=>r[x.n]==null?"null":r[x.n]).join(", ")}).`);
        if(c._chk){const v=ev(c._chk,{[k.split(".").pop()]:r});if(v===false)throw new SqlErr(`new row for relation "${k.split(".").pop()}" violates check constraint "${k.split(".").pop()}_${c.n}_check"`,`Failing row contains (${t.cols.map(x=>r[x.n]==null?"null":r[x.n]).join(", ")}).`)}
        if(c.fk&&r[c.n]!=null){const [ft,fc]=c.fk.split(":");const fk=tbl(ft);if(!tabs[fk].some(x=>cmpv(x[fc],r[c.n])===0))throw new SqlErr(`insert or update on table "${k.split(".").pop()}" violates foreign key constraint "${k.split(".").pop()}_${c.n}_fkey"`,`Key (${c.n})=(${r[c.n]}) is not present in table "${fk.split(".").pop()}".`)}});
      (t.checks||[]).forEach(ch=>{const v=ev(ch._chk,{[k.split(".").pop()]:r});if(v===false)throw new SqlErr(`new row for relation "${k.split(".").pop()}" violates check constraint "${ch.name}"`,`Failing row contains (${t.cols.map(x=>r[x.n]==null?"null":r[x.n]).join(", ")}).`)});
      const uq=[];const pkc=t.cols.filter(c=>c.pk).map(c=>c.n);if(pkc.length)uq.push([k.split(".").pop()+"_pkey",pkc]);const tn=k.split(".").pop(),inW=(u,x)=>!u._w||ev(u._w,{[tn]:x})===true;(t.unique||[]).forEach((u,i)=>{if(inW(u,r))uq.push([u.name||tn+"_"+u.cols.join("_")+"_key",u.cols,u])});t.cols.filter(c=>c.uq).forEach(c=>uq.push([k.split(".").pop()+"_"+c.n+"_key",[c.n]]));
      if(t.exclude){const x=t.exclude,a=r[x.start],b=r[x.end];if(a!=null){const hit=tabs[k].find(o=>o!==old&&cmpv(o[x.key],r[x.key])===0&&(o[x.end]==null||cmpv(a,o[x.end])<0)&&(b==null||cmpv(o[x.start],b)<0));
        if(hit)throw new SqlErr(`conflicting key value violates exclusion constraint "${x.name||k.split(".").pop()+"_excl"}"`,`Key (${x.key}, ${x.start}, ${x.end})=(${r[x.key]}, ${a}, ${b==null?"∞":b}) conflicts with existing key (${hit[x.key]}, ${hit[x.start]}, ${hit[x.end]==null?"∞":hit[x.end]}).`)}}
      uq.forEach(([nm,cs,u])=>{if(cs.some(c=>r[c]==null))return;const dup=tabs[k].find(x=>x!==old&&cs.every(c=>cmpv(x[c],r[c])===0)&&(!u||inW(u,x)));if(dup){const e=new SqlErr(`duplicate key value violates unique constraint "${nm}"`,`Key (${cs.join(", ")})=(${cs.map(c=>r[c]).join(", ")}) already exists.`);e.uq=cs;e.dup=dup;throw e}})}
    function refCheck(k,r){schema.forEach(t=>t.cols.forEach(c=>{if(!c.fk)return;const [ft,fc]=c.fk.split(":");if(tbl(ft)!==k)return;if(tabs[t.name].some(x=>cmpv(x[c.n],r[fc])===0))throw new SqlErr(`update or delete on table "${k.split(".").pop()}" violates foreign key constraint "${t.name.split(".").pop()}_${c.n}_fkey" on table "${t.name.split(".").pop()}"`,`Key (${fc})=(${r[fc]}) is still referenced from table "${t.name.split(".").pop()}".`)}))}
    function exec1(st){
      if(st.k==="begin"){if(tx)return{msg:"WARNING:  there is already a transaction in progress",cmd:"BEGIN"};tx={tabs:JSON.parse(JSON.stringify(tabs)),seq:Object.assign({},seq)};aborted=false;return{cmd:"BEGIN"}}
      if(st.k==="commit"){if(!tx)return{msg:"WARNING:  there is no transaction in progress",cmd:"COMMIT"};if(aborted){tabs=tx.tabs;seq=tx.seq;tx=null;aborted=false;return{cmd:"ROLLBACK",msg:"Giao dịch đã lỗi nên COMMIT thực chất là ROLLBACK."}}tx=null;return{cmd:"COMMIT"}}
      if(st.k==="rollback"){if(!tx)return{msg:"WARNING:  there is no transaction in progress",cmd:"ROLLBACK"};tabs=tx.tabs;seq=tx.seq;tx=null;aborted=false;return{cmd:"ROLLBACK"}}
      if(aborted)throw new SqlErr("current transaction is aborted, commands ignored until end of transaction block");
      if(st.k==="with"){ctes={};st.ctes.forEach(c=>{if(st.rec&&c.q.k==="union"){let base=runSelect(c.q.a);const cols=c.cols||base.cols;const toObj=r=>Object.fromEntries(cols.map((cn,i)=>[cn,r[i]]));
            let all=base.rows.map(toObj),delta=all,guard=0;
            while(delta.length&&guard++<200){ctes[c.n]={rows:delta,cols};const nx=runSelect(c.q.b).rows.map(toObj);
              const nw=c.q.all?nx:nx.filter(r=>!all.some(a=>JSON.stringify(a)===JSON.stringify(r)));all=all.concat(nw);delta=nw}
            if(guard>=200)throw new SqlErr("truy vấn đệ quy quá 200 vòng (có vòng lặp trong dữ liệu?)");ctes[c.n]={rows:all,cols}}
          else{const r=runSelect(c.q);const cols=c.cols||r.cols;ctes[c.n]={rows:r.rows.map(x=>Object.fromEntries(cols.map((cn,i)=>[cn,x[i]]))),cols}}});
        try{const r=runSelect(st.main);return Object.assign(r,{cmd:"SELECT "+r.rows.length})}finally{ctes={}}}
      if(st.k==="select"||st.k==="union"){const r=runSelect(st);return Object.assign(r,{cmd:"SELECT "+r.rows.length})}
      if(st.k==="insert"){const k=tbl(st.tb),t=S[k];const cols=st.cols||t.cols.map(c=>c.n);cols.forEach(c=>{if(!t.cols.some(x=>x.n===c))throw new SqlErr(`column "${c}" of relation "${k.split(".").pop()}" does not exist`)});
        const src=st.rows?st.rows.map(r=>{if(r.length!==cols.length)throw new SqlErr(r.length>cols.length?"INSERT has more expressions than target columns":"INSERT has more target columns than expressions");return r.map(x=>ev(x,{}))}):runSelect(st.sel).rows;
        let n=0;const ret=[];
        src.forEach(vals=>{const r={};t.cols.forEach(c=>{if(cols.includes(c.n))r[c.n]=vals[cols.indexOf(c.n)];else if(c.serial)r[c.n]=++seq[k];else if(c.def!==undefined)r[c.n]=c.def==="now()"?cfgNow:c.def;else r[c.n]=null});
          if(t.cols.some(c=>c.serial&&cols.includes(c.n)))seq[k]=Math.max(seq[k],...t.cols.filter(c=>c.serial).map(c=>+r[c.n]||0));
          try{checkRow(k,r);tabs[k].push(r);n++;ret.push(r)}
          catch(e){if(e.uq&&st.oc&&(!st.oc.cc||st.oc.cc.every(c=>e.uq.includes(c))&&st.oc.cc.length===e.uq.length)){if(st.oc.nothing)return;
              const tgt=e.dup,env={[k.split(".").pop()]:tgt,__excl:r};if(st.oc.w&&ev(st.oc.w,env)!==true)return;const nw=Object.assign({},tgt);st.oc.sets.forEach(([c,x])=>nw[c]=ev(x,env));checkRow(k,nw,tgt);Object.assign(tgt,nw);n++;ret.push(tgt);return}
            throw e}});
        const out={cmd:"INSERT 0 "+n,count:n};if(st.ret){out.cols=st.ret.map(i=>i.e.t==="star"?null:i.al||(i.e.c||"?column?"));if(st.ret.some(i=>i.e.t==="star")){out.cols=t.cols.map(c=>c.n);out.rows=ret.map(r=>out.cols.map(c=>r[c]))}else out.rows=ret.map(r=>st.ret.map(i=>ev(i.e,{[k.split(".").pop()]:r})))}
        return out}
      if(st.k==="update"){const k=tbl(st.tb),t=S[k];st.sets.forEach(([c])=>{if(!t.cols.some(x=>x.n===c))throw new SqlErr(`column "${c}" of relation "${k.split(".").pop()}" does not exist`)});
        let n=0;const changes=[];
        tabs[k].forEach(r=>{let env={[st.al]:r};if(st.from){const srcs=st.from.map(f=>({f,rows:source(f).rows}));let matched=null;
            const walk=(i,e)=>{if(matched)return;if(i===srcs.length){if(!st.w||ev(st.w,e)===true)matched=e;return}srcs[i].rows.forEach(x=>walk(i+1,Object.assign({},e,{[srcs[i].f.al]:x})))};walk(0,env);if(!matched)return;env=matched}
          else if(st.w&&ev(st.w,env)!==true)return;
          const nw=Object.assign({},r);st.sets.forEach(([c,x])=>nw[c]=ev(x,env));changes.push([r,nw])});
        changes.forEach(([r,nw])=>{checkRow(k,nw,r);t.cols.forEach(c=>{if(c.pk&&cmpv(r[c.n],nw[c.n])!==0)refCheck(k,r)});Object.assign(r,nw);n++});
        const out={cmd:"UPDATE "+n,count:n};if(st.ret){out.cols=t.cols.map(c=>c.n);out.rows=changes.map(([r])=>out.cols.map(c=>r[c]))}return out}
      if(st.k==="delete"){const k=tbl(st.tb);const del=tabs[k].filter(r=>!st.w||ev(st.w,{[st.al]:r})===true);del.forEach(r=>refCheck(k,r));tabs[k]=tabs[k].filter(r=>!del.includes(r));return{cmd:"DELETE "+del.length,count:del.length}}
      throw new SqlErr("chưa hỗ trợ")}
    function exec(sql){let sts;try{sts=parse(sql)}catch(e){return[{err:"ERROR:  "+e.message,detail:e.detail}]}
      const out=[];for(const st of sts){try{out.push(exec1(st))}catch(e){if(tx)aborted=true;out.push({err:"ERROR:  "+e.message,detail:e.detail})}}return out}
    return{exec,get tabs(){return tabs},get inTx(){return!!tx},get aborted(){return aborted},schema:S,setNow(v){cfgNow=v},rows:n=>tabs[tbl(n)],fmtIv}}
  return{DB,parse,fmtIv,SqlErr}})();
MES_ENG.db=function(root,cfg,api){
  const db=MSQL.DB(cfg.tables);if(cfg.now)db.setNow(cfg.now);
  const hist=[];let shown=cfg.show||cfg.tables[0].name,last=null;
  root.innerHTML=`${cfg.brief?`<p class="msl-brief">${cfg.brief}</p>`:""}
   <div class="msq"><div class="msq-ed"><label class="vh" for="${cfg.id}-sql">Câu lệnh SQL</label><textarea id="${cfg.id}-sql" class="msq-ta" spellcheck="false" rows="${cfg.rows||6}"></textarea>
     <div class="msq-ctl"><button type="button" class="btn pri msq-run">▶ Chạy (Ctrl+Enter)</button><span class="msq-tx"></span></div>
     ${cfg.samples?`<div class="msq-smp"><span>Câu mẫu:</span>${cfg.samples.map((x,i)=>`<button type="button" class="btn msq-s" data-i="${i}">${x.l}</button>`).join("")}</div>`:""}
     <div class="msq-res" aria-live="polite"></div></div>
    <div class="msq-db"><div class="msq-tabs">${cfg.tables.filter(t=>!t.hidden).map(t=>`<button type="button" class="btn msq-tb" data-t="${t.name}">${t.name}</button>`).join("")}</div><div class="msq-tv"></div></div></div>`;
  const ta=root.querySelector(".msq-ta"),res=root.querySelector(".msq-res"),tv=root.querySelector(".msq-tv"),txl=root.querySelector(".msq-tx");
  ta.value=cfg.sql||"";
  const cell=v=>v==null?'<i class="msq-null">NULL</i>':v.iv!=null?MSQL.fmtIv(v):typeof v==="number"?String(Math.round(v*1e6)/1e6).replace(".",","):typeof v==="boolean"?(v?"t":"f"):mesE(v);
  function run(){const sql=ta.value;const out=db.exec(sql);last=out[out.length-1]||{};
    res.innerHTML=out.map(r=>r.err?`<pre class="msq-err">${mesE(r.err)}${r.detail?"\nDETAIL:  "+mesE(r.detail):""}</pre>`:
      (r.rows&&r.cols?`<div class="msq-rt">${mesTable(r.cols.map(mesE),r.rows.slice(0,200).map(x=>x.map(cell)))}<p class="msq-cmd">(${r.rows.length} dòng)</p></div>`:`<p class="msq-cmd">${mesE(r.cmd||"")}${r.msg?" · "+mesE(r.msg):""}</p>`)).join("");
    out.forEach(r=>{const e={type:"sql",sql,ok:!r.err,err:r.err,cmd:r.cmd||"",rows:r.rows||[],cols:r.cols||[],count:r.count};hist.push(e);api.log(e)});
    paint();api.changed()}
  root.querySelector(".msq-run").onclick=run;ta.onkeydown=e=>{if(e.key==="Enter"&&(e.ctrlKey||e.metaKey)){e.preventDefault();run()}};
  root.querySelectorAll(".msq-s").forEach(b=>b.onclick=()=>{ta.value=cfg.samples[+b.dataset.i].sql;ta.focus()});
  root.querySelectorAll(".msq-tb").forEach(b=>b.onclick=()=>{shown=b.dataset.t;paint()});
  function paint(){root.querySelectorAll(".msq-tb").forEach(b=>b.classList.toggle("on",b.dataset.t===shown));
    const t=db.schema[shown];const rows=db.tabs[shown];
    tv.innerHTML=`<p class="msq-def">${t.cols.map(c=>`<code>${c.n}</code> ${c.ty||""}${c.pk?" <b>PK</b>":""}${c.fk?` → ${c.fk.replace(":",".")}`:""}${c.nn?" NOT NULL":""}${c.check?` CHECK (${mesE(c.check)})`:""}`).join(" · ")}${(t.checks||[]).map(c=>` · CHECK ${mesE(c.sql)}`).join("")}${(t.unique||[]).map(u=>` · UNIQUE (${u.cols.join(", ")})`).join("")}</p>`+
      mesTable(t.cols.map(c=>c.n),rows.slice(-(cfg.maxRows||12)).map(r=>t.cols.map(c=>cell(r[c.n]))))+(rows.length>(cfg.maxRows||12)?`<p class="msq-cmd">… ${rows.length} dòng, hiện ${cfg.maxRows||12} dòng cuối</p>`:"");
    txl.innerHTML=db.inTx?(db.aborted?'<b class="bad-t">Giao dịch đã lỗi: chỉ còn ROLLBACK</b>':'<b class="wa-t">Đang trong giao dịch (BEGIN)</b>'):""}
  paint();
  const st={db,hist,get last(){return last},rows:n=>db.rows(n),q(sql){const r=db.exec(sql);return r[r.length-1]}};
  return{state:()=>st}};
/* ===================== trình mô phỏng của khóa (platform/js/74-mes-frame.js) ===================== */
/* ===================== Khóa MES: dựng và giải mã khung SLMP 3E nhị phân / Modbus TCP (kind "frame") =====================
   Học viên chọn lệnh, thiết bị, địa chỉ, số điểm → thấy từng byte theo trường; gửi tới FX5U giả lập → khung phản hồi và
   giải mã; hoặc dán khung hex để giải mã. FX5U giả lập: D0–D7999, giá trị D100–D106 theo ví dụ Bài 52 (6, 12, 58, 0, 2, 0, 130).
   cfg: mode "slmp" | "modbus" | "both"; mem {100:6,…}; allowWrite [110,111] (danh sách ghi cho phép của collector). */
MES_ENG.frame=function(root,cfg,api){
  const MEM=Object.assign({100:6,101:12,102:58,103:0,104:2,105:0,106:130},cfg.mem||{});
  const DEV={D:0xA8,SD:0xA9},DMAX=8000;
  const hx=b=>b.toString(16).toUpperCase().padStart(2,"0");
  const le=(v,n)=>[...Array(n)].map((_,i)=>(v>>>(8*i))&255),be=(v,n)=>le(v,n).reverse();
  let mode=cfg.mode==="modbus"?"modbus":"slmp";
  const F={cmd:"0401",dev:"D",start:cfg.start!=null?cfg.start:100,count:cfg.count!=null?cfg.count:7,timer:16,vals:"7, 1",tid:1,unit:1,fn:3,addr:cfg.addr!=null?cfg.addr:100,qty:7,noReply:false};
  const st={req:[],fields:[],resp:null,decoded:null,err:null,sent:0,F,get mode(){return mode},mem:MEM};
  root.innerHTML=`${cfg.brief?`<p class="msl-brief">${cfg.brief}</p>`:""}
   ${cfg.mode==="both"?`<div class="msf-mode" role="tablist"><button type="button" class="btn" data-m="slmp">SLMP 3E (Mitsubishi)</button><button type="button" class="btn" data-m="modbus">Modbus TCP</button></div>`:""}
   <div class="msf"><div class="msf-form"></div><div class="msf-out"><h5>Khung yêu cầu <small class="msf-n"></small></h5><div class="msf-req"></div>
    <div class="msf-ctl"><button type="button" class="btn pri msf-send">Gửi tới FX5U giả lập</button><label class="msl-chk"><input type="checkbox" class="msf-nr"> PLC không trả lời</label></div>
    <h5>Khung phản hồi</h5><div class="msf-resp"><p class="msl-empty">Chưa gửi.</p></div></div></div>
   <details class="msf-dec"><summary>Dán một khung hex để giải mã</summary><input class="msf-hex" spellcheck="false" placeholder="ví dụ: D0 00 00 FF FF 03 00 04 00 00 00 06 00"><button type="button" class="btn msf-go">Giải mã</button><div class="msf-dout"></div></details>`;
  const form=root.querySelector(".msf-form"),reqB=root.querySelector(".msf-req"),respB=root.querySelector(".msf-resp"),nB=root.querySelector(".msf-n");
  const COL={hd:"c1",route:"c2",len:"c3",timer:"c4",cmd:"c5",sub:"c5",dev:"c6",start:"c6",count:"c7",data:"c8",end:"c3",tid:"c1",proto:"c2",unit:"c4",fn:"c5",addr:"c6",qty:"c7",nb:"c3"};
  function build(){st.err=null;const f=[];
    if(mode==="slmp"){const isW=F.cmd==="1401";const vals=isW?F.vals.split(/[ ,;]+/).filter(Boolean).map(Number):[];
      const body=[["timer",le(F.timer,2),`Bộ định thời giám sát = ${F.timer} × 250 ms = ${(F.timer*0.25).toString().replace(".",",")} s`],["cmd",le(parseInt(F.cmd,16),2),`Lệnh ${F.cmd}: ${isW?"ghi khối":"đọc khối"}`],["sub",le(0,2),"Lệnh phụ 0000: theo từ"],
        ["start",le(F.start,3),`Số thiết bị bắt đầu = ${F.start} (3 byte, thấp trước)`],["dev",[DEV[F.dev]],`Mã thiết bị ${F.dev} = 0x${hx(DEV[F.dev])}`],["count",le(isW?vals.length:F.count,2),`Số điểm = ${isW?vals.length:F.count} từ`]];
      if(isW)body.push(["data",vals.flatMap(v=>le(v&0xFFFF,2)),`Dữ liệu ghi: ${vals.join(", ")} (mỗi từ 2 byte, thấp trước)`]);
      const blen=body.reduce((s,x)=>s+x[1].length,0);
      f.push(["hd",[0x50,0],"Đầu khung yêu cầu 3E (0x0050)"],["route",[0,0xFF,0xFF,3,0],"Đường đi: mạng 00, trạm FF, module 03FF (CPU), trạm đa điểm 00"],["len",le(blen,2),`Độ dài dữ liệu = ${blen} byte (từ bộ định thời tới hết)`],...body)}
    else{const pdu=F.fn===3?[3,...be(F.addr,2),...be(F.qty,2)]:[6,...be(F.addr,2),...be(+F.vals.split(/[ ,;]+/)[0]||0,2)];
      f.push(["tid",be(F.tid,2),`Mã giao dịch = ${F.tid}`],["proto",[0,0],"Mã giao thức = 0 (Modbus)"],["len",be(pdu.length+1,2),`Độ dài phần còn lại = ${pdu.length+1} byte`],["unit",[F.unit],`Mã đơn vị = ${F.unit}`],
        ["fn",[pdu[0]],`Mã chức năng ${pdu[0]===3?"03: đọc holding register":"06: ghi một thanh ghi"}`],["addr",pdu.slice(1,3),`Địa chỉ giao thức = ${F.addr} (cách ghi 4xxxx: ${40001+F.addr})`],
        ["qty",pdu.slice(3,5),pdu[0]===3?`Số thanh ghi = ${F.qty}`:`Giá trị ghi = ${(pdu[3]<<8)|pdu[4]}`])}
    st.fields=f;st.req=f.flatMap(x=>x[1]);
    reqB.innerHTML=strip(f);nB.textContent=`${st.req.length} byte${mode==="slmp"?" · số nhiều byte viết byte thấp trước":" · byte cao trước"}`}
  function strip(f){return`<div class="msf-bytes">${f.map(([k,b,d])=>`<span class="msf-g ${COL[k]||""}" title="${mesE(d)}"><span class="msf-bh">${b.map(x=>`<code>${hx(x)}</code>`).join("")}</span><em>${mesE(d)}</em></span>`).join("")}</div>`}
  function form_(){if(mode==="slmp")form.innerHTML=`<label class="msc-row"><span>Lệnh</span><select data-k="cmd"><option value="0401">0401 · đọc khối từ</option><option value="1401">1401 · ghi khối từ</option></select></label>
      <label class="msc-row"><span>Thiết bị</span><select data-k="dev"><option>D</option><option>SD</option></select></label>
      <label class="msc-row"><span>Bắt đầu</span><input type="number" min="0" max="99999" data-k="start"></label>
      <label class="msc-row msf-rd"><span>Số điểm (từ)</span><input type="number" min="1" max="2000" data-k="count"></label>
      <label class="msc-row msf-wr"><span>Giá trị ghi</span><input type="text" data-k="vals"></label>
      <label class="msc-row"><span>Định thời (× 250 ms)</span><input type="number" min="0" max="65535" data-k="timer"></label>`;
    else form.innerHTML=`<label class="msc-row"><span>Mã chức năng</span><select data-k="fn"><option value="3">03 · đọc holding register</option><option value="6">06 · ghi một thanh ghi</option></select></label>
      <label class="msc-row"><span>Địa chỉ giao thức</span><input type="number" min="0" max="65535" data-k="addr"></label>
      <label class="msc-row msf-rd"><span>Số thanh ghi</span><input type="number" min="1" max="200" data-k="qty"></label>
      <label class="msc-row msf-wr"><span>Giá trị ghi</span><input type="text" data-k="vals"></label>
      <label class="msc-row"><span>Mã giao dịch</span><input type="number" min="0" max="65535" data-k="tid"></label>
      <p class="msl-note">Giả định của khóa: holding register 0 ↔ D0, nên D100 là địa chỉ 100 (cách ghi 40101).</p>`;
    form.querySelectorAll("[data-k]").forEach(el=>{const k=el.dataset.k;el.value=F[k];el.onchange=el.oninput=()=>{F[k]=el.type==="number"||k==="fn"?+el.value:el.value;sync();build();api.log({type:"field",k,v:F[k]});api.changed()}});sync()}
  function sync(){const isW=mode==="slmp"?F.cmd==="1401":F.fn===6;form.querySelectorAll(".msf-rd").forEach(x=>x.hidden=isW);form.querySelectorAll(".msf-wr").forEach(x=>x.hidden=!isW)}
  function send(){st.sent++;const req=st.req.slice();let resp=null,info="",err=null,words=null;
    if(root.querySelector(".msf-nr").checked){err="TIMEOUT";info=`Không có phản hồi sau ${mode==="slmp"?(F.timer*0.25).toString().replace(".",","):"vài"} giây: socket hết thời gian chờ. Collector thử lại có giới hạn rồi ghi NO_DATA.`}
    else if(mode==="slmp"){const isW=F.cmd==="1401";const vals=isW?F.vals.split(/[ ,;]+/).filter(Boolean).map(Number):[];
      const allow=cfg.allowWrite||[110,111];
      if(isW&&vals.some((_,i)=>!allow.includes(F.start+i))){err="BLOCKED";info=`Collector từ chối trước khi gửi: chỉ được ghi ${allow.map(a=>"D"+a).join(", ")} (Bài 48). Không byte nào ra khỏi máy tính.`}
      else if(F.count>960&&!isW){err="LIMIT";info="Mã tham chiếu (mini_mes/slmp.py) từ chối: tối đa 960 từ một lệnh."}
      else{const n=isW?vals.length:F.count;let end=0;if(F.dev==="D"&&F.start+n>DMAX)end=0xC059;
        if(end){resp=[0xD0,0,0,0xFF,0xFF,3,0,...le(2+9,2),...le(end,2),0,0xFF,0xFF,3,0,...le(parseInt(F.cmd,16),2),0,0];err="END";info=`Mã kết thúc 0x${end.toString(16).toUpperCase()} ≠ 0: PLC từ chối (vượt dải D0–D${DMAX-1}). FX5U giả lập của khóa chỉ dùng mã 0xC059; PLC thật có bảng mã riêng của hãng.`}
        else if(isW){vals.forEach((v,i)=>MEM[F.start+i]=v&0xFFFF);resp=[0xD0,0,0,0xFF,0xFF,3,0,...le(2,2),0,0];info="Mã kết thúc 0: PLC đã ghi."}
        else{words=[...Array(n)].map((_,i)=>MEM[F.start+i]||0);resp=[0xD0,0,0,0xFF,0xFF,3,0,...le(2+2*n,2),0,0,...words.flatMap(w=>le(w,2))];info=`Mã kết thúc 0 = thành công. ${resp.length} byte = 9 + 2 + 2 × ${n}.`}}}
    else{if(F.fn===6){const a=F.addr;if(!(cfg.allowWrite||[110,111]).includes(a)){err="BLOCKED";info="Collector từ chối trước khi gửi: chỉ được ghi D110–D111."}
        else{MEM[a]=(+F.vals.split(/[ ,;]+/)[0]||0)&0xFFFF;resp=st.req.slice();info="Ghi một thanh ghi: phản hồi lặp lại yêu cầu."}}
      else if(F.addr+F.qty>DMAX||F.qty>125){resp=[...be(F.tid,2),0,0,0,3,F.unit,0x83,2];err="EXC";info="Mã chức năng 0x83 = 0x03 + 0x80 báo ngoại lệ; mã ngoại lệ 02: địa chỉ dữ liệu không hợp lệ."}
      else{words=[...Array(F.qty)].map((_,i)=>MEM[F.addr+i]||0);const pdu=[3,2*F.qty,...words.flatMap(w=>be(w,2))];resp=[...be(F.tid,2),0,0,...be(pdu.length+1,2),F.unit,...pdu];info=`${resp.length} byte; mỗi thanh ghi byte cao trước.`}}
    st.resp=resp;st.err=err;st.decoded=words;
    respB.innerHTML=(resp?decodeHTML(resp):"")+`<p class="${err?"bad-t":"ok-t"}">${info}</p>`+(words?mesTable(["Thiết bị","Byte trên dây","Giá trị"],words.map((w,i)=>[mode==="slmp"?`${F.dev}${F.start+i}`:`HR ${F.addr+i} (D${F.addr+i})`,`<code>${(mode==="slmp"?le(w,2):be(w,2)).map(hx).join(" ")}</code>`,w])):"");
    api.log({type:"send",mode,req,resp,err,words,F:Object.assign({},F)})}
  function decodeHTML(b){const r=decode(b);return r.f?strip(r.f)+(r.err?`<p class="bad-t">${mesE(r.err)}</p>`:""):`<p class="bad-t">${mesE(r.err)}</p>`}
  function decode(b){const f=[];
    if(b[0]===0xD0&&b[1]===0){if(b.length<11)return{err:"Khung quá ngắn (cần ít nhất 11 byte)."};const len=b[7]|(b[8]<<8);const end=b[9]|(b[10]<<8);
      f.push(["hd",b.slice(0,2),"Đầu khung phản hồi 3E (D0 00)"],["route",b.slice(2,7),"Đường đi (chép lại từ yêu cầu)"],["len",b.slice(7,9),`Độ dài = ${len} byte`],["end",b.slice(9,11),`Mã kết thúc = 0x${end.toString(16).toUpperCase().padStart(4,"0")}${end?" (lỗi)":" (thành công)"}`]);
      const rest=b.slice(11);for(let i=0;i+1<rest.length;i+=2)f.push(["data",rest.slice(i,i+2),`Từ ${i/2+1} = ${rest[i]|(rest[i+1]<<8)}`]);
      return{f,err:9+len!==b.length?`Độ dài khai báo ${len} nhưng sau 9 byte đầu còn ${b.length-9} byte: khung hỏng, đóng và mở lại kết nối.`:null,end,words:f.filter(x=>x[0]==="data").map(x=>x[1][0]|(x[1][1]<<8))}}
    if(b[0]===0x50&&b[1]===0){const len=b[7]|(b[8]<<8);f.push(["hd",b.slice(0,2),"Đầu khung yêu cầu 3E"],["route",b.slice(2,7),"Đường đi"],["len",b.slice(7,9),`Độ dài = ${len}`],["timer",b.slice(9,11),"Bộ định thời"],["cmd",b.slice(11,13),"Lệnh "+hx(b[12])+hx(b[11])],["sub",b.slice(13,15),"Lệnh phụ"],
        ["start",b.slice(15,18),"Bắt đầu = "+(b[15]|(b[16]<<8)|(b[17]<<16))],["dev",b.slice(18,19),"Mã thiết bị 0x"+hx(b[18]||0)],["count",b.slice(19,21),"Số điểm = "+(b[19]|(b[20]<<8))]);return{f,err:9+len!==b.length?"Độ dài khai báo khác độ dài thật.":null}}
    if(b.length>=8&&b[2]===0&&b[3]===0){const len=(b[4]<<8)|b[5];f.push(["tid",b.slice(0,2),"Mã giao dịch"],["proto",b.slice(2,4),"Mã giao thức 0"],["len",b.slice(4,6),`Độ dài = ${len}`],["unit",b.slice(6,7),"Mã đơn vị"],["fn",b.slice(7,8),"Mã chức năng "+hx(b[7])]);
      if(b[7]&0x80){f.push(["end",b.slice(8,9),"Mã ngoại lệ "+b[8]]);return{f,err:"Phản hồi ngoại lệ (mã chức năng + 0x80)."}}
      if(b.length>9&&b[8]===b.length-9){f.push(["nb",b.slice(8,9),`Số byte dữ liệu = ${b[8]}`]);for(let i=9;i+1<b.length;i+=2)f.push(["data",b.slice(i,i+2),`Thanh ghi = ${(b[i]<<8)|b[i+1]}`])}
      else if(b.length>=12)f.push(["addr",b.slice(8,10),"Địa chỉ = "+((b[8]<<8)|b[9])],["qty",b.slice(10,12),"Số lượng / giá trị = "+((b[10]<<8)|b[11])]);
      return{f,err:6+len!==b.length?"Độ dài MBAP khác độ dài thật.":null}}
    return{err:"Không nhận ra khung: SLMP phản hồi bắt đầu D0 00, yêu cầu 50 00; Modbus có mã giao thức 00 00 ở byte 3–4."}}
  root.querySelector(".msf-send").onclick=()=>{send();api.changed()};
  root.querySelector(".msf-go").onclick=()=>{const s=root.querySelector(".msf-hex").value;const b=(s.match(/[0-9a-fA-F]{2}/g)||[]).map(x=>parseInt(x,16));
    const r=decode(b);root.querySelector(".msf-dout").innerHTML=decodeHTML(b);api.log({type:"decode",bytes:b,ok:!r.err,words:r.words,end:r.end});api.changed()};
  root.querySelectorAll(".msf-mode .btn").forEach(b=>b.onclick=()=>{mode=b.dataset.m;root.querySelectorAll(".msf-mode .btn").forEach(x=>x.classList.toggle("on",x.dataset.m===mode));form_();build();respB.innerHTML='<p class="msl-empty">Chưa gửi.</p>';api.log({type:"mode",mode});api.changed()});
  const mb=root.querySelector(`.msf-mode [data-m="${mode}"]`);if(mb)mb.classList.add("on");
  form_();build();
  st.hex=()=>st.req.map(hx).join(" ");
  return{state:()=>st}};
/* ===================== trình mô phỏng của khóa (platform/js/75-mes-flow.js) ===================== */
/* ===================== Khóa MES: phả hệ / cây, truyền tin tin cậy, MQTT, lập lịch, SPC =====================
   graph — nút và cạnh theo cột; bấm nút rồi truy ngược / truy xuôi (lan từng tầng), giữ HOLD, nổ định mức theo số lượng
   net   — bên gửi, mạng, bên nhận: mất gói, mất phản hồi, gửi lại giãn cách, chống trùng msg_id, outbox, hàng đợi chết
   mqtt  — broker, chủ đề, đăng ký có ký tự đại diện (+, #), giữ lại (retain), di chúc (Last Will)
   sched — xếp thứ tự lệnh, thời gian đổi sản phẩm, trễ hạn
   spc   — lấy mẫu nhóm con, biểu đồ X̄–R, Cp/Cpk, kiểm từng giá trị theo giới hạn kỹ thuật */
/* ---------------- graph ---------------- */
MES_ENG.graph=function(root,cfg,api){
  const N=cfg.nodes.map(n=>Object.assign({},n)),E=cfg.edges.map(e=>({f:e[0],t:e[1],q:e[2]}));
  const byId=Object.fromEntries(N.map(n=>[n.id,n]));const cols=[...new Set(N.map(n=>n.col))].sort((a,b)=>a-b);
  let sel=cfg.sel||null,reach=new Set(),dir=null,held=new Set(),busy=false,qty={};
  root.innerHTML=`${cfg.brief?`<p class="msl-brief">${cfg.brief}</p>`:""}<div class="msg-ctl"></div><div class="msg-wrap"><svg class="msg-svg" aria-hidden="true"></svg><div class="msg-cols">${cols.map(c=>`<div class="msg-col"><h6>${(cfg.colNames||{})[c]||""}</h6>${N.filter(n=>n.col===c).map(n=>`<button type="button" class="msg-n k-${n.kind||"x"}" data-id="${mesE(n.id)}"><b>${mesE(n.l||n.id)}</b>${n.sub?`<small>${mesE(n.sub)}</small>`:""}<i class="msg-q"></i></button>`).join("")}</div>`).join("")}</div></div><div class="msg-out" aria-live="polite"></div>`;
  const ctl=root.querySelector(".msg-ctl"),svg=root.querySelector(".msg-svg"),wrap=root.querySelector(".msg-wrap"),out=root.querySelector(".msg-out");
  const acts=cfg.actions||["back","fwd"];
  const btn={};
  if(acts.includes("back"))ctl.append(btn.back=mesBtn("← Truy ngược (làm từ gì?)","",()=>trace(-1),"Truy ngược từ nút đã chọn"));
  if(acts.includes("fwd"))ctl.append(btn.fwd=mesBtn("Truy xuôi (đi đâu?) →","",()=>trace(1),"Truy xuôi từ nút đã chọn"));
  if(acts.includes("hold"))ctl.append(btn.hold=mesBtn("Đặt HOLD các nút tìm được","",()=>{reach.forEach(id=>held.add(id));api.log({type:"hold",ids:[...reach]});paint();api.changed()},"Giữ hàng nghi ngờ"));
  if(acts.includes("explode")){const l=mesH("label","msc-row",`<span>Số lượng của nút đã chọn</span><input type="number" min="1" value="${cfg.qty||1000}" class="msg-qi">`);ctl.append(l);
    ctl.append(btn.exp=mesBtn("Nổ định mức xuống dưới","pri",()=>explode(+l.querySelector("input").value),"Tính nhu cầu vật tư"))}
  ctl.append(mesBtn("Xóa tô","",()=>{reach=new Set();dir=null;qty={};out.innerHTML="";paint();api.changed()},"Bỏ tô màu"));
  root.querySelectorAll(".msg-n").forEach(b=>b.onclick=()=>{if(busy)return;sel=b.dataset.id;api.log({type:"select",id:sel});paint();api.changed()});
  function nb(id,d){return d<0?E.filter(e=>e.t===id).map(e=>e.f):E.filter(e=>e.f===id).map(e=>e.t)}
  function trace(d){if(!sel||busy)return;busy=true;dir=d;reach=new Set([sel]);let front=[sel],lv=0;const levels=[[sel]];
    const step=()=>{const nx=[];front.forEach(id=>nb(id,d).forEach(x=>{if(!reach.has(x)){reach.add(x);nx.push(x)}}));
      if(!nx.length){busy=false;finish(levels);return}levels.push(nx);front=nx;lv++;paint();setTimeout(step,cfg.fast?0:350)};
    paint();setTimeout(step,cfg.fast?0:350)}
  function finish(levels){const kinds={};[...reach].filter(x=>x!==sel).forEach(id=>{const k=byId[id].kind||"x";(kinds[k]=kinds[k]||[]).push(id)});
    out.innerHTML=`<p><b>${dir<0?"Truy ngược":"Truy xuôi"} từ ${mesE(byId[sel].l||sel)}</b>: ${levels.length-1} tầng, tìm thấy ${reach.size-1} nút.</p>`+
      `<ul>${Object.entries(kinds).map(([k,v])=>`<li>${mesE((cfg.kindNames||{})[k]||k)}: ${v.map(x=>mesE(byId[x].l||x)).join(", ")}</li>`).join("")}</ul>`+
      (cfg.sql?`<details><summary>Câu SQL tương ứng</summary><pre class="msg-sql">${mesE(dir<0?cfg.sql.back:cfg.sql.fwd).replace("$ID",mesE(sel))}</pre></details>`:"");
    api.log({type:"trace",dir,from:sel,ids:[...reach],levels:levels.length-1});paint();api.changed()}
  function explode(q){if(!sel)return;qty={[sel]:q};const order=[sel];for(let i=0;i<order.length;i++){const id=order[i];E.filter(e=>e.f===id).forEach(e=>{qty[e.t]=(qty[e.t]||0)+qty[id]*(e.q||1);if(!order.includes(e.t))order.push(e.t)})}
    reach=new Set(order);dir=1;out.innerHTML=`<p><b>Nhu cầu cho ${mesFmt(q)} ${mesE(byId[sel].u||"")} ${mesE(byId[sel].l||sel)}</b></p>`+mesTable(["Vật tư","Định mức / đơn vị cha","Nhu cầu"],order.slice(1).map(id=>{const e=E.find(x=>x.t===id);return[mesE(byId[id].l||id),mesFmt(e.q,3).replace(/,?0+$/,"")+" "+mesE(byId[id].u||""),"<b>"+mesFmt(qty[id],3).replace(/,?0+$/,"")+" "+mesE(byId[id].u||"")+"</b>"]}));
    api.log({type:"explode",from:sel,q,qty:Object.assign({},qty)});paint();api.changed()}
  function paint(){root.querySelectorAll(".msg-n").forEach(b=>{const id=b.dataset.id;b.classList.toggle("sel",id===sel);b.classList.toggle("hit",reach.has(id)&&id!==sel);b.classList.toggle("held",held.has(id));
      b.querySelector(".msg-q").textContent=qty[id]!=null&&id!==sel?mesFmt(qty[id],3).replace(/,?0+$/,"")+" "+(byId[id].u||""):held.has(id)?"HOLD":(byId[id].status||"")});
    Object.values(btn).forEach(b=>b.disabled=!sel||busy);if(btn.hold)btn.hold.disabled=!reach.size||busy;
    requestAnimationFrame(lines)}
  function lines(){const r0=wrap.getBoundingClientRect();svg.setAttribute("width",r0.width);svg.setAttribute("height",r0.height);
    svg.innerHTML=E.map(e=>{const a=root.querySelector(`.msg-n[data-id="${CSS.escape(e.f)}"]`),b=root.querySelector(`.msg-n[data-id="${CSS.escape(e.t)}"]`);if(!a||!b)return"";
      const ra=a.getBoundingClientRect(),rb=b.getBoundingClientRect();const x1=ra.right-r0.left,y1=ra.top+ra.height/2-r0.top,x2=rb.left-r0.left,y2=rb.top+rb.height/2-r0.top;
      const on=reach.has(e.f)&&reach.has(e.t);return`<path d="M${x1} ${y1} C${x1+30} ${y1} ${x2-30} ${y2} ${x2} ${y2}" class="msg-e${on?" on":""}"/>${e.q!=null&&cfg.showQ?`<text x="${(x1+x2)/2}" y="${(y1+y2)/2-4}" class="msg-et">${String(e.q).replace(".",",")}</text>`:""}`}).join("")}
  if(window.ResizeObserver)new ResizeObserver(()=>lines()).observe(wrap);
  paint();
  const st={get sel(){return sel},get reach(){return reach},get dir(){return dir},held,qty,has:id=>reach.has(id)};return{state:()=>st}};
/* ---------------- net ---------------- */
MES_ENG.net=function(root,cfg,api){
  const unit=cfg.unit||"phút",BACK=cfg.backoff||[1,2,4,8,16,30],MAXT=cfg.maxTries||10;
  const S={t:0,net:"ok",dropAck:false,rcvErr:0,outbox:!!cfg.outbox,idem:!!cfg.idem,retry:cfg.retry!==false,q:[],rcv:[],dead:[],log:[],seq:1,lost:[]};
  root.innerHTML=`${cfg.brief?`<p class="msl-brief">${cfg.brief}</p>`:""}<div class="msn-ctl"></div><div class="msn-grid"><section><h5>${mesE(cfg.from||"MES")} <small>(bên gửi)</small></h5><div class="msn-q"></div></section>
    <section><h5>${mesE(cfg.to||"ERP")} <small>(bên nhận)</small></h5><div class="msn-r"></div></section></div><h5>Nhật ký trao đổi <small class="msn-clk"></small></h5><ol class="msn-log"></ol>`;
  const ctl=root.querySelector(".msn-ctl");
  const tog=(k,l)=>{const x=mesH("label","msl-chk",`<input type="checkbox"${S[k]?" checked":""}> ${l}`);x.querySelector("input").onchange=e=>{S[k]=e.target.checked;api.log({type:"opt",k,v:S[k]});paint();api.changed()};return x};
  ctl.append(mesBtn(cfg.newLabel||"Tạo bản tin","pri",()=>{newMsg();paint();api.changed()},"Tạo bản tin mới"),
    mesBtn("Gửi các bản tin đang chờ","",()=>{sendAll();paint();api.changed()},"Gửi ngay"),
    mesBtn(`Chờ ${cfg.tickL||"1 "+unit}`,"",()=>{tick(1);paint();api.changed()},"Thời gian trôi"),mesBtn(`Chờ ${cfg.bigL||"30 "+unit}`,"",()=>{tick(30);paint();api.changed()},"Thời gian trôi nhiều"));
  const sel=mesH("label","msc-row",`<span>Mạng</span><select><option value="ok">tốt</option><option value="down">đứt</option></select>`);sel.querySelector("select").onchange=e=>{S.net=e.target.value;api.log({type:"net",v:S.net});paint();api.changed()};ctl.append(sel);
  ctl.append(tog("dropAck","Mất phản hồi của lần gửi tới"));
  const rs=mesH("label","msc-row",`<span>${mesE(cfg.to||"ERP")} trả lời</span><select><option value="0">bình thường</option><option value="500">500 (lỗi tạm thời)</option><option value="422">422 (dữ liệu sai)</option></select>`);
  rs.querySelector("select").onchange=e=>{S.rcvErr=+e.target.value;api.log({type:"rcvErr",v:S.rcvErr});paint();api.changed()};ctl.append(rs);
  if(cfg.toggles!==false){if((cfg.toggles||["retry","idem","outbox"]).includes("retry"))ctl.append(tog("retry","Tự gửi lại có giãn cách"));if((cfg.toggles||["idem"]).includes("idem"))ctl.append(tog("idem","Bên nhận chống trùng theo msg_id"));
    if((cfg.toggles||["outbox"]).includes("outbox"))ctl.append(tog("outbox","Lưu vào outbox trước khi gửi"))}
  if(cfg.crash!==false)ctl.append(mesBtn(`Khởi động lại ${mesE(cfg.from||"MES")}`,"",()=>{const lost=S.q.filter(m=>!m.stored);S.lost.push(...lost);S.q=S.q.filter(m=>m.stored);L(`⟲ ${cfg.from||"MES"} khởi động lại${lost.length?`: mất ${lost.length} bản tin chưa lưu (${lost.map(m=>m.id).join(", ")})`:": outbox còn nguyên"}`,lost.length?"er":"ok");api.log({type:"crash",lost:lost.length});paint();api.changed()},"Mất điện / khởi động lại bên gửi"));
  const L=(s,c)=>{S.log.push({t:S.t,s,c});};
  function newMsg(){const m={id:(cfg.idPrefix||"msg-")+String(S.seq++).padStart(3,"0"),body:cfg.body?cfg.body(S.seq-1):"sản lượng ca",tries:0,next:0,stored:S.outbox,status:"PENDING"};S.q.push(m);L(`+ Tạo ${m.id}${S.outbox?" (đã lưu trong outbox, cùng giao dịch)":" (chỉ trong bộ nhớ)"}`);api.log({type:"new",id:m.id})}
  function attempt(m){m.tries++;L(`→ Gửi ${m.id} (lần ${m.tries})`,"ac");api.log({type:"try",id:m.id,n:m.tries});
    if(S.net==="down"){L(`✗ ${m.id}: hết thời gian chờ (mạng đứt)`,"er");return fail(m,"timeout")}
    if(S.rcvErr===422){L(`✗ ${m.id}: 422 dữ liệu sai: lỗi vĩnh viễn`,"er");m.status="DEAD";S.dead.push(m);S.q=S.q.filter(x=>x!==m);api.log({type:"dead",id:m.id,why:"422"});return}
    if(S.rcvErr===500){L(`✗ ${m.id}: 500 lỗi tạm thời`,"er");return fail(m,"500")}
    const dup=S.rcv.some(r=>r.id===m.id);
    if(dup&&S.idem){L(`← ${m.id}: 409 đã có (bên nhận không xử lý lại)`,"ok");api.log({type:"dupBlocked",id:m.id})}
    else{S.rcv.push({id:m.id,t:S.t,dup});L(dup?`⚠ ${cfg.to||"ERP"} xử lý ${m.id} LẦN NỮA: trùng dữ liệu!`:`✓ ${cfg.to||"ERP"} đã xử lý ${m.id}`,dup?"er":"ok");api.log({type:dup?"duplicate":"processed",id:m.id})}
    if(S.dropAck){S.dropAck=false;root.querySelector(".msn-ctl input[type=checkbox]")&&(root.querySelectorAll(".msn-ctl input")[0].checked=false);L(`✗ Phản hồi cho ${m.id} bị mất trên đường về: bên gửi không biết đã thành công`,"er");api.log({type:"ackLost",id:m.id});return fail(m,"noack")}
    m.status="SENT";S.q=S.q.filter(x=>x!==m);L(`← 200 OK ${m.id}: đánh dấu đã gửi`,"ok")}
  function fail(m,why){if(!S.retry){m.status="FAILED";S.q=S.q.filter(x=>x!==m);S.lost.push(m);L(`✗ Không gửi lại: ${m.id} bị bỏ`,"er");api.log({type:"dropped",id:m.id});return}
    if(m.tries>=MAXT){m.status="DEAD";S.dead.push(m);S.q=S.q.filter(x=>x!==m);L(`☠ ${m.id} vào hàng đợi chết sau ${m.tries} lần`,"er");api.log({type:"dead",id:m.id,why});return}
    const w=BACK[Math.min(m.tries-1,BACK.length-1)];m.next=S.t+w;m.status="RETRY";L(`… ${m.id} chờ ${w} ${unit} rồi gửi lại`,"wa")}
  function sendAll(){S.q.filter(m=>m.status==="PENDING"||(m.status==="RETRY"&&m.next<=S.t)).forEach(attempt)}
  function tick(n){for(let i=0;i<n;i++){S.t++;S.q.filter(m=>m.status==="RETRY"&&m.next<=S.t).forEach(attempt)}}
  function paint(){root.querySelector(".msn-clk").textContent=`(t = ${S.t} ${unit})`;
    root.querySelector(".msn-q").innerHTML=(S.q.length?mesTable(["msg_id","Trạng thái","Lần gửi","Gửi lại lúc","Lưu?"],S.q.map(m=>[m.id,m.status,m.tries,m.status==="RETRY"?`t = ${m.next}`:"",m.stored?"outbox":"bộ nhớ"])):"<p class='msl-empty'>Không có bản tin chờ.</p>")+
      (S.dead.length?`<p class="bad-t">Hàng đợi chết: ${S.dead.map(m=>m.id).join(", ")}</p>`:"")+(S.lost.length?`<p class="bad-t">Đã mất: ${S.lost.map(m=>m.id).join(", ")}</p>`:"");
    const cnt={};S.rcv.forEach(r=>cnt[r.id]=(cnt[r.id]||0)+1);
    root.querySelector(".msn-r").innerHTML=S.rcv.length?mesTable(["msg_id","Số lần xử lý"],Object.entries(cnt).map(([k,v])=>({cls:v>1?"bad":"",c:[k,v>1?`<b class="bad-t">${v} (trùng)</b>`:v]}))):"<p class='msl-empty'>Chưa nhận gì.</p>";
    root.querySelector(".msn-log").innerHTML=S.log.slice(-14).map(x=>`<li class="${x.c||""}"><span>t=${x.t}</span> ${mesE(x.s)}</li>`).join("")}
  paint();
  const st={S,get dupCount(){const c={};S.rcv.forEach(r=>c[r.id]=(c[r.id]||0)+1);return Object.values(c).filter(v=>v>1).length},get processed(){return new Set(S.rcv.map(r=>r.id)).size}};
  return{state:()=>st}};
/* ---------------- mqtt ---------------- */
MES_ENG.mqtt=function(root,cfg,api){
  const S={ret:{},subs:(cfg.subs||[]).map(s=>({c:s[0],f:s[1],got:[]})),clients:Object.assign({},cfg.clients||{collector:{up:true,will:cfg.will||null}}),log:[]};
  const match=(f,t)=>{const a=f.split("/"),b=t.split("/");for(let i=0;i<a.length;i++){if(a[i]==="#")return true;if(i>=b.length)return false;if(a[i]!=="+"&&a[i]!==b[i])return false}return a.length===b.length};
  root.innerHTML=`${cfg.brief?`<p class="msl-brief">${cfg.brief}</p>`:""}<div class="msmq"><section><h5>Xuất bản</h5><label class="msc-row"><span>Chủ đề</span><input class="mq-t" spellcheck="false"></label><label class="msc-row"><span>Nội dung</span><input class="mq-p" spellcheck="false"></label>
    <label class="msl-chk"><input type="checkbox" class="mq-r"> giữ lại (retain)</label><div class="msl-orc"><button type="button" class="btn pri mq-pub">Xuất bản</button><button type="button" class="btn mq-kill">Rút điện collector</button><button type="button" class="btn mq-up">Collector chạy lại</button></div>
    <h5>Đăng ký mới</h5><label class="msc-row"><span>Bộ lọc</span><input class="mq-f" spellcheck="false" placeholder="amts/hcm/+/L1/#"></label><button type="button" class="btn mq-sub">Đăng ký (khách mới)</button></section>
    <section><h5>Broker: bản tin giữ lại</h5><div class="mq-ret"></div><h5>Khách đăng ký</h5><div class="mq-subs"></div></section></div><ol class="msn-log mq-log"></ol>`;
  const $=s=>root.querySelector(s);$(".mq-t").value=cfg.topic||"amts/hcm/dong-goi/L1/M2/state";$(".mq-p").value=cfg.payload||"RUNNING";
  const L=(s,c)=>S.log.push({s,c});
  function publish(t,p,r,who){L(`${who||"collector"} → ${t} = ${p}${r?" (retain)":""}`,"ac");if(r)S.ret[t]=p;let n=0;S.subs.forEach(s=>{if(match(s.f,t)){s.got.push(t+" = "+p);n++}});L(`  chuyển tới ${n} khách đăng ký`);api.log({type:"pub",t,p,r,n})}
  $(".mq-pub").onclick=()=>{if(!S.clients.collector.up){L("✗ collector đang tắt","er");paint();return}publish($(".mq-t").value.trim(),$(".mq-p").value,$(".mq-r").checked);paint();api.changed()};
  $(".mq-sub").onclick=()=>{const f=$(".mq-f").value.trim();if(!f)return;const s={c:"khách "+(S.subs.length+1),f,got:[]};Object.entries(S.ret).forEach(([t,p])=>{if(match(f,t))s.got.push(t+" = "+p+" (giữ lại)")});S.subs.push(s);L(`+ ${s.c} đăng ký ${f}: nhận ngay ${s.got.length} bản tin giữ lại`,"ok");api.log({type:"sub",f,n:s.got.length});paint();api.changed()};
  $(".mq-kill").onclick=()=>{const c=S.clients.collector;if(!c.up)return;c.up=false;L("⚡ collector mất kết nối không báo trước","er");if(c.will){L("Broker gửi di chúc (Last Will) thay collector","wa");publish(c.will[0],c.will[1],true,"broker")}api.log({type:"kill"});paint();api.changed()};
  $(".mq-up").onclick=()=>{const c=S.clients.collector;if(c.up)return;c.up=true;L("collector kết nối lại","ok");if(cfg.birth)publish(cfg.birth[0],cfg.birth[1],true);api.log({type:"up"});paint();api.changed()};
  function paint(){$(".mq-ret").innerHTML=Object.keys(S.ret).length?mesTable(["Chủ đề","Giá trị"],Object.entries(S.ret).map(([t,p])=>[`<code>${mesE(t)}</code>`,mesE(p)])):"<p class='msl-empty'>Chưa có.</p>";
    $(".mq-subs").innerHTML=S.subs.map(s=>`<div class="mq-s"><b>${mesE(s.c)}</b> <code>${mesE(s.f)}</code><ul>${s.got.slice(-4).map(g=>`<li>${mesE(g)}</li>`).join("")}</ul></div>`).join("");
    $(".mq-log").innerHTML=S.log.slice(-12).map(x=>`<li class="${x.c||""}">${mesE(x.s)}</li>`).join("")}
  paint();const st={S,match};return{state:()=>st}};
/* ---------------- sched ---------------- */
MES_ENG.sched=function(root,cfg,api){
  let ord=cfg.orders.map(o=>Object.assign({},o));const CO=cfg.changeover||25;
  root.innerHTML=`${cfg.brief?`<p class="msl-brief">${cfg.brief}</p>`:""}<div class="msd"><ol class="msd-list"></ol><div class="msd-g"></div></div><div class="msd-m"></div>`;
  const list=root.querySelector(".msd-list"),g=root.querySelector(".msd-g"),m=root.querySelector(".msd-m");
  function plan(){let t=0,prev=null,co=0;const bl=[];ord.forEach(o=>{if(prev&&prev!==o.sp){bl.push({k:"co",a:t,b:t+CO});t+=CO;co++}bl.push({k:"wo",o,a:t,b:t+o.dur});o.end=t+o.dur;o.late=Math.max(0,o.end-o.due);t+=o.dur;prev=o.sp});return{bl,end:t,co,late:ord.reduce((s,o)=>s+o.late,0),nLate:ord.filter(o=>o.late>0).length}}
  function paint(){const p=plan();st.p=p;const T=Math.max(p.end,...ord.map(o=>o.due))+20;const X=t=>t/T*100;
    list.innerHTML=ord.map((o,i)=>`<li class="sp-${o.sp.replace(/\W/g,"")}"><b>${o.id}</b> ${o.sp} · ${o.dur} ph · hạn ${mesHM(o.due*60)}<span><button type="button" class="btn" data-u="${i}" aria-label="Đưa ${o.id} lên"${i?"":" disabled"}>↑</button><button type="button" class="btn" data-d="${i}" aria-label="Đưa ${o.id} xuống"${i<ord.length-1?"":" disabled"}>↓</button></span></li>`).join("");
    list.querySelectorAll("[data-u],[data-d]").forEach(b=>b.onclick=()=>{const i=+(b.dataset.u??b.dataset.d),j=b.dataset.u!=null?i-1:i+1;[ord[i],ord[j]]=[ord[j],ord[i]];api.log({type:"move",seq:ord.map(o=>o.id)});paint();api.changed()});
    g.innerHTML=`<div class="msd-row">${p.bl.map(b=>`<span class="msd-b ${b.k==="co"?"co":"sp-"+b.o.sp.replace(/\W/g,"")}${b.o&&b.o.late?" late":""}" style="left:${X(b.a)}%;width:${X(b.b)-X(b.a)}%" title="${b.k==="co"?"đổi sản phẩm":b.o.id}">${b.k==="co"?"đổi":b.o.id}</span>`).join("")}
      ${ord.map(o=>`<i class="msd-due" style="left:${X(o.due)}%" title="hạn ${o.id}"><em>${o.id}</em></i>`).join("")}</div><div class="mst-ax">${[0,60,120,180,240,300,360,420,480].filter(t=>t<=T).map(t=>`<span style="left:${X(t)}%">${mesHM(t*60)}</span>`).join("")}</div>`;
    m.innerHTML=mesTable(["Xong lúc","Số lần đổi","Lệnh trễ","Tổng phút trễ"],[[mesHM(p.end*60),p.co,p.nLate,`<b>${p.late}</b>`]])+mesTable(["Lệnh","Xong","Hạn","Trễ"],ord.map(o=>({cls:o.late?"bad":"",c:[o.id,mesHM(o.end*60),mesHM(o.due*60),o.late?`<b class="bad-t">${o.late} ph</b>`:"0"]})))}
  const st={get seq(){return ord.map(o=>o.id)},p:null};paint();return{state:()=>st}};
/* ---------------- spc ---------------- */
MES_ENG.spc=function(root,cfg,api){
  const n=cfg.n||5,d2={2:1.128,3:1.693,4:2.059,5:2.326}[n],A2={2:1.88,3:1.023,4:0.729,5:0.577}[n],D4={2:3.267,3:2.574,4:2.282,5:2.114}[n],D3=0;
  const LSL=cfg.lsl,USL=cfg.usl;let mu=cfg.mu||503.4,sig=cfg.sigma||0.86;const rnd=mesRand(cfg.seed||11);
  const gauss=()=>{let u=0,v=0;while(!u)u=rnd();while(!v)v=rnd();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v)};
  const G=(cfg.groups||[]).map(x=>x.slice());let lim=cfg.limits||null;
  root.innerHTML=`${cfg.brief?`<p class="msl-brief">${cfg.brief}</p>`:""}<div class="msp"><div class="msp-in">
    <label class="msc-row"><span>Tâm quá trình μ (g)</span><input type="range" min="${cfg.muMin||500}" max="${cfg.muMax||507}" step="0.05" value="${mu}" class="msp-mu"><b class="msp-muv"></b></label>
    <label class="msc-row"><span>Độ phân tán σ (g)</span><input type="range" min="0.2" max="2" step="0.02" value="${sig}" class="msp-sg"><b class="msp-sgv"></b></label>
    <div class="msl-orc"><button type="button" class="btn pri msp-take">Lấy 1 nhóm ${n} hộp</button><button type="button" class="btn msp-take5">Lấy 5 nhóm</button><button type="button" class="btn msp-lim">Tính giới hạn từ dữ liệu</button></div>
    <label class="msc-row"><span>Hoặc nhập ${n} giá trị</span><input class="msp-man" placeholder="503,1 504,0 498,7 503,8 504,4"></label><button type="button" class="btn msp-add">Thêm nhóm nhập tay</button>
    <div class="msp-st"></div></div><div class="msp-ch"></div></div><div class="msp-tab"></div>`;
  const $=s=>root.querySelector(s);
  $(".msp-mu").oninput=e=>{mu=+e.target.value;api.log({type:"mu",v:mu});paint();api.changed()};$(".msp-sg").oninput=e=>{sig=+e.target.value;api.log({type:"sigma",v:sig});paint();api.changed()};
  const take=k=>{for(let i=0;i<k;i++)G.push([...Array(n)].map(()=>Math.round((mu+sig*gauss())*10)/10));api.log({type:"take",k,n:G.length});paint();api.changed()};
  $(".msp-take").onclick=()=>take(1);$(".msp-take5").onclick=()=>take(5);
  $(".msp-lim").onclick=()=>{if(G.length<2)return;const xb=G.map(g=>g.reduce((a,b)=>a+b,0)/n),R=G.map(g=>Math.max(...g)-Math.min(...g));const X=xb.reduce((a,b)=>a+b,0)/xb.length,Rb=R.reduce((a,b)=>a+b,0)/R.length;
    lim={X,Rb,ucl:X+A2*Rb,lcl:X-A2*Rb,uclR:D4*Rb,lclR:D3*Rb,k:G.length};api.log({type:"limits",k:G.length});paint();api.changed()};
  $(".msp-add").onclick=()=>{const v=($(".msp-man").value.match(/-?\d+(?:[.,]\d+)?/g)||[]).map(x=>+x.replace(",","."));if(v.length!==n){$(".msp-st").innerHTML=`<p class="bad-t">Cần đúng ${n} giá trị.</p>`;return}G.push(v);
    const bad=v.filter(x=>(LSL!=null&&x<LSL)||(USL!=null&&x>USL));api.log({type:"manual",v,bad:bad.length});paint();if(bad.length)$(".msp-st").innerHTML+=`<p class="bad-t">Có ${bad.length} giá trị ngoài dung sai ${LSL}–${USL} g → MES đặt lô HOLD, bật Andon QUALITY.</p>`;api.changed()};
  function paint(){$(".msp-muv").textContent=mesFmt(mu,2);$(".msp-sgv").textContent=mesFmt(sig,2);
    const xb=G.map(g=>g.reduce((a,b)=>a+b,0)/n),R=G.map(g=>Math.max(...g)-Math.min(...g));
    const Rb=R.length?R.reduce((a,b)=>a+b,0)/R.length:null,X=xb.length?xb.reduce((a,b)=>a+b,0)/xb.length:null;const sh=Rb!=null?Rb/d2:null;
    const cp=sh&&LSL!=null?(USL-LSL)/(6*sh):null,cpk=sh&&LSL!=null?Math.min(USL-X,X-LSL)/(3*sh):null;
    const out=lim?xb.map((v,i)=>v>lim.ucl||v<lim.lcl||R[i]>lim.uclR):xb.map(()=>false);
    st.xb=xb;st.R=R;st.cp=cp;st.cpk=cpk;st.lim=lim;st.out=out.filter(Boolean).length;st.k=G.length;st.mu=mu;st.sig=sig;st.Rb=Rb;st.X=X;
    $(".msp-st").innerHTML=`<p>${G.length} nhóm · X̿ = ${mesFmt(X,2)} · R̄ = ${mesFmt(Rb,2)} · σ̂ = R̄ / ${String(d2).replace(".",",")} = ${mesFmt(sh,3)}</p>`+(cp!=null?`<p>Cp = ${mesFmt(cp,2)} · <b>Cpk = ${mesFmt(cpk,2)}</b> (LSL ${LSL}, USL ${USL})</p>`:"")+
      (lim?`<p>Giới hạn kiểm soát (từ ${lim.k} nhóm): X̄ ${mesFmt(lim.lcl,2)} – ${mesFmt(lim.ucl,2)} · R ≤ ${mesFmt(lim.uclR,2)}</p>`:"<p class='msl-note'>Chưa có giới hạn kiểm soát: lấy đủ nhóm rồi bấm “Tính giới hạn”.</p>")+(st.out?`<p class="bad-t">⚠ ${st.out} nhóm ngoài giới hạn kiểm soát: quá trình có nguyên nhân đặc biệt.</p>`:"");
    const W=560,H=160,pad=36;const draw=(vals,lo,hi,lines,lab)=>{if(!vals.length)return"";const mn=Math.min(lo,...vals),mx=Math.max(hi,...vals);const sy=v=>H-14-(v-mn)/(mx-mn||1)*(H-28);const sx=i=>pad+(i+0.5)*(W-pad-8)/Math.max(vals.length,10);
      return`<svg viewBox="0 0 ${W} ${H}" class="msp-svg" role="img" aria-label="${lab}"><text x="4" y="12" class="msp-t">${lab}</text>${lines.map(([v,c,l])=>`<line x1="${pad}" x2="${W-8}" y1="${sy(v)}" y2="${sy(v)}" class="msp-l ${c}"/><text x="${W-8}" y="${sy(v)-3}" text-anchor="end" class="msp-t ${c}">${l} ${mesFmt(v,2)}</text>`).join("")}
        <polyline points="${vals.map((v,i)=>sx(i)+","+sy(v)).join(" ")}" class="msp-pl"/>${vals.map((v,i)=>`<circle cx="${sx(i)}" cy="${sy(v)}" r="4" class="${out[i]?"msp-bad":"msp-pt"}"/>`).join("")}</svg>`};
    const lx=lim?[[lim.ucl,"er","UCL"],[lim.X,"m","X̿"],[lim.lcl,"er","LCL"]]:[];const lr=lim?[[lim.uclR,"er","UCL"],[lim.Rb,"m","R̄"]]:[];
    $(".msp-ch").innerHTML=draw(xb,lim?lim.lcl:(X||0)-1,lim?lim.ucl:(X||0)+1,lx,"Biểu đồ X̄ (g)")+draw(R,0,lim?lim.uclR:3,lr,"Biểu đồ R (g)");
    $(".msp-tab").innerHTML=G.length?`<details><summary>${G.length} nhóm mẫu</summary>${mesTable(["#"].concat([...Array(n)].map((_,i)=>"x"+(i+1)),["X̄","R"]),G.slice(-12).map((g,i)=>[G.length-Math.min(12,G.length)+i+1,...g.map(v=>mesFmt(v,1)),mesFmt(xb[G.length-Math.min(12,G.length)+i],2),mesFmt(R[G.length-Math.min(12,G.length)+i],1)]))}</details>`:""}
  const st={G};paint();return{state:()=>st}};
/* ===================== trình mô phỏng của khóa (platform/js/76-mes-tools.js) ===================== */
/* ===================== Khóa MES: API, dòng lệnh, trạm quét, trang web, vùng mạng =====================
   api   — gửi yêu cầu HTTP tới API MES giả lập (FastAPI + Pydantic): kiểm tra dữ liệu (422), quyền (401/403), trạng thái
   term  — cửa sổ dòng lệnh có kịch bản (PowerShell, psql, pytest, docker…): lệnh khớp mẫu thì in kết quả và đổi trạng thái
   scan  — trạm quét cấp liệu theo BOM, chống sai (poka-yoke), in nhãn GS1, đếm WIP
   web   — sửa HTML/CSS/JS, xem trước trong khung cách ly có API MES giả lập
   zones — vùng mạng và luật tường lửa: thử các luồng kết nối cần và cấm */
/* ---------------- api ---------------- */
MES_ENG.api=function(root,cfg,api){
  const store=JSON.parse(JSON.stringify(cfg.store||{}));const hist=[];
  const TOK=cfg.tokens||{"(không có)":null};
  root.innerHTML=`${cfg.brief?`<p class="msl-brief">${cfg.brief}</p>`:""}<div class="msa"><div class="msa-req">
    <div class="msa-line"><select class="msa-m" aria-label="Phương thức">${["GET","POST","PUT","PATCH","DELETE"].map(m=>`<option>${m}</option>`).join("")}</select><input class="msa-p" spellcheck="false" aria-label="Đường dẫn"><button type="button" class="btn pri msa-go">Gửi</button></div>
    <label class="msc-row"><span>Đăng nhập với</span><select class="msa-tok">${Object.keys(TOK).map(k=>`<option>${mesE(k)}</option>`).join("")}</select></label>
    <label class="vh" for="${cfg.id}-body">Thân yêu cầu JSON</label><textarea id="${cfg.id}-body" class="msq-ta msa-b" rows="${cfg.rows||7}" spellcheck="false"></textarea>
    ${cfg.samples?`<div class="msq-smp"><span>Mẫu:</span>${cfg.samples.map((s,i)=>`<button type="button" class="btn msq-s" data-i="${i}">${s.l}</button>`).join("")}</div>`:""}
    <details class="msa-doc"><summary>Các endpoint</summary><ul>${cfg.routes.map(r=>`<li><code>${r.m} ${mesE(r.p)}</code> ${r.d||""}${r.roles?` <small>(vai trò: ${r.roles.join(", ")})</small>`:""}</li>`).join("")}</ul></details></div>
    <div class="msa-res"><h5>Phản hồi</h5><pre class="msa-out">Chưa gửi.</pre><h5>Đã gửi</h5><ol class="msn-log msa-h"></ol></div></div>`;
  const $=s=>root.querySelector(s);$(".msa-m").value=cfg.method||"GET";$(".msa-p").value=cfg.path||cfg.routes[0].p.replace(/\{[^}]+\}/g,"1");$(".msa-b").value=cfg.body||"";
  root.querySelectorAll(".msq-s").forEach(b=>b.onclick=()=>{const s=cfg.samples[+b.dataset.i];$(".msa-m").value=s.m;$(".msa-p").value=s.p;$(".msa-b").value=s.b||""});
  function validate(schema,body){const det=[];if(body==null||typeof body!=="object"||Array.isArray(body))return[{loc:["body"],msg:"Input should be a valid dictionary",type:"dict_type"}];
    Object.entries(schema).forEach(([k,r])=>{const v=body[k];if(v===undefined){if(r.req!==false&&r.def===undefined)det.push({loc:["body",k],msg:"Field required",type:"missing"});else if(r.def!==undefined)body[k]=r.def;return}
      if(r.t==="int"){if(!(typeof v==="number"&&Number.isInteger(v))&&!(typeof v==="string"&&/^-?\d+$/.test(v))){det.push({loc:["body",k],msg:"Input should be a valid integer",type:"int_parsing",input:v});return}body[k]=+v}
      if(r.t==="float"){if(typeof v!=="number"&&!(typeof v==="string"&&v.trim()!==""&&!isNaN(+v))){det.push({loc:["body",k],msg:"Input should be a valid number",type:"float_parsing",input:v});return}body[k]=+v}
      if(r.t==="str"&&typeof v!=="string"){det.push({loc:["body",k],msg:"Input should be a valid string",type:"string_type",input:v});return}
      if(r.t==="dt"&&!(typeof v==="string"&&/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?(Z|[+-]\d{2}:\d{2})$/.test(v))){det.push({loc:["body",k],msg:r.tz?"Input should have timezone info":"Input should be a valid datetime",type:r.tz?"timezone_aware":"datetime_parsing",input:v});return}
      if(r.gt!=null&&!(body[k]>r.gt))det.push({loc:["body",k],msg:`Input should be greater than ${r.gt}`,type:"greater_than",input:v});
      if(r.ge!=null&&!(body[k]>=r.ge))det.push({loc:["body",k],msg:`Input should be greater than or equal to ${r.ge}`,type:"greater_than_equal",input:v});
      if(r.le!=null&&!(body[k]<=r.le))det.push({loc:["body",k],msg:`Input should be less than or equal to ${r.le}`,type:"less_than_equal",input:v});
      if(r.en&&!r.en.includes(v))det.push({loc:["body",k],msg:`Input should be ${r.en.map(x=>"'"+x+"'").join(", ").replace(/, ([^,]*)$/," or $1")}`,type:"enum",input:v});
      if(r.re&&!new RegExp(r.re).test(String(v)))det.push({loc:["body",k],msg:`String should match pattern '${r.re}'`,type:"string_pattern_mismatch",input:v})});
    if(cfg.forbidExtra)Object.keys(body).forEach(k=>{if(!schema[k])det.push({loc:["body",k],msg:"Extra inputs are not permitted",type:"extra_forbidden",input:body[k]})});
    return det}
  function send(){const m=$(".msa-m").value,path=$(".msa-p").value.trim(),tk=TOK[$(".msa-tok").value];let raw=$(".msa-b").value.trim(),body=null,res;
    const rt=cfg.routes.map(r=>{if(r.m!==m)return null;const re=new RegExp("^"+r.p.replace(/\{(\w+)\}/g,"(?<$1>[^/]+)")+"$");const mm=re.exec(path.split("?")[0]);return mm?{r,params:mm.groups||{}}:null}).find(Boolean);
    const anyPath=cfg.routes.some(r=>new RegExp("^"+r.p.replace(/\{(\w+)\}/g,"[^/]+")+"$").test(path.split("?")[0]));
    if(!rt)res=anyPath?{status:405,body:{detail:"Method Not Allowed"}}:{status:404,body:{detail:"Not Found"}};
    else if(rt.r.roles&&!tk)res={status:401,body:{detail:"Not authenticated"}};
    else if(rt.r.roles&&!rt.r.roles.includes(tk.role))res={status:403,body:{detail:`Vai trò ${tk.role} không được phép`}};
    else{if(m!=="GET"&&m!=="DELETE"&&rt.r.schema){if(!raw)raw="";try{body=raw?JSON.parse(raw):null}catch(e){res={status:422,body:{detail:[{loc:["body",0],msg:"JSON decode error",type:"json_invalid"}]}}}
        if(!res){const det=validate(rt.r.schema,body);if(det.length)res={status:422,body:{detail:det}}}}
      if(!res){try{const q=Object.fromEntries(new URLSearchParams(path.split("?")[1]||""));res=rt.r.h({params:rt.params,body,store,user:tk,query:q})}catch(e){res={status:500,body:{detail:"Internal Server Error"}}}}}
    const e={type:"http",m,path,status:res.status,body:res.body,req:body,user:tk&&tk.role};hist.push(e);api.log(e);
    $(".msa-out").className="msa-out s"+String(res.status)[0];$(".msa-out").textContent=`HTTP/1.1 ${res.status} ${{200:"OK",201:"Created",204:"No Content",400:"Bad Request",401:"Unauthorized",403:"Forbidden",404:"Not Found",405:"Method Not Allowed",409:"Conflict",422:"Unprocessable Entity",500:"Internal Server Error"}[res.status]||""}\ncontent-type: application/json\n\n${res.body===undefined?"":JSON.stringify(res.body,null,2)}`;
    $(".msa-h").innerHTML=hist.slice(-8).map(h=>`<li class="${h.status<300?"ok":h.status<500?"wa":"er"}">${h.m} ${mesE(h.path)} → ${h.status}</li>`).join("");api.changed()}
  $(".msa-go").onclick=send;
  const st={store,hist,last:()=>hist[hist.length-1]};return{state:()=>st}};
/* ---------------- term ---------------- */
MES_ENG.term=function(root,cfg,api){
  const S=Object.assign({cwd:cfg.cwd||"C:\\mes",env:{}},JSON.parse(JSON.stringify(cfg.vars||{})));const hist=[];let hi=0;
  const prompt=()=>typeof cfg.prompt==="function"?cfg.prompt(S):(cfg.prompt||"PS {cwd}> ").replace("{cwd}",S.cwd);
  root.innerHTML=`${cfg.brief?`<p class="msl-brief">${cfg.brief}</p>`:""}<div class="mstm" role="log" aria-live="polite"><pre class="mstm-o"></pre><div class="mstm-l"><span class="mstm-p"></span><input class="mstm-i" spellcheck="false" autocomplete="off" aria-label="Gõ lệnh rồi Enter"></div></div>
    ${cfg.hints?`<div class="msq-smp"><span>Gõ thử:</span>${cfg.hints.map(h=>`<button type="button" class="btn msq-s">${mesE(h)}</button>`).join("")}</div>`:""}`;
  const o=root.querySelector(".mstm-o"),inp=root.querySelector(".mstm-i"),pp=root.querySelector(".mstm-p");
  o.textContent=cfg.banner||"";pp.textContent=prompt();
  root.querySelectorAll(".msq-s").forEach(b=>b.onclick=()=>{inp.value=b.textContent;inp.focus()});
  root.querySelector(".mstm").onclick=e=>{if(e.target.tagName!=="INPUT")inp.focus({preventScroll:true})};
  function run(line){const p=prompt();o.textContent+=(o.textContent&&!o.textContent.endsWith("\n")?"\n":"")+p+line+"\n";
    let out=null,ok=true;const t=line.trim();
    if(!t){}else if(/^(cls|clear)$/i.test(t)){o.textContent="";}
    else{const c=(cfg.cmds||[]).find(c=>c.re.test(t));
      if(c){const m=t.match(c.re);try{out=typeof c.out==="function"?c.out(m,S):c.out;if(c.fx)c.fx(m,S);ok=c.ok!==false&&!(out&&out.err)}catch(e){out="lỗi kịch bản: "+e.message;ok=false}if(out&&out.err){out=out.err;ok=false}}
      else{out=(cfg.unknown||(x=>`${x.split(/\s+/)[0]} : The term '${x.split(/\s+/)[0]}' is not recognized as the name of a cmdlet, function, script file, or operable program.`))(t);ok=false}}
    if(out!=null&&out!=="")o.textContent+=out.replace(/\n?$/,"\n");
    hist.push(t);hi=hist.length;api.log({type:"cmd",line:t,ok,out:out||""});pp.textContent=prompt();o.parentElement.scrollTop=o.parentElement.scrollHeight;api.changed()}
  inp.onkeydown=e=>{if(e.key==="Enter"){const v=inp.value;inp.value="";run(v)}else if(e.key==="ArrowUp"){if(hi>0){hi--;inp.value=hist[hi]}e.preventDefault()}else if(e.key==="ArrowDown"){if(hi<hist.length){hi++;inp.value=hist[hi]||""}e.preventDefault()}};
  const st={S,hist,ran:re=>hist.some(h=>re.test(h)),run};return{state:()=>st}};
/* ---------------- scan ---------------- */
MES_ENG.scan=function(root,cfg,api){
  const mode=cfg.mode||"feed";const S={loads:[],rejects:[],labels:[],wip:Object.assign({},cfg.wip||{}),moves:[]};
  if(mode==="feed"){const lots=cfg.lots.map(l=>Object.assign({},l));const bom=cfg.bom;
    root.innerHTML=`${cfg.brief?`<p class="msl-brief">${cfg.brief}</p>`:""}<div class="msk"><section><h5>Trạm ${mesE(cfg.station||"M1 · phễu hạt")} · lệnh ${mesE(cfg.wo||"WO-1")} (${mesE(cfg.sp||"SP-07")})</h5>
      ${mesTable(["Vật tư theo BOM","Định mức","Đã nạp"],bom.map(b=>[mesE(b.cls),mesE(b.per),`<span class="msk-ld" data-c="${mesE(b.cls)}"></span>`]))}
      <label class="msc-row"><span>Quét mã lô</span><input class="msk-in" spellcheck="false" placeholder="LOT-…"></label><button type="button" class="btn pri msk-go">Quét</button>
      <div class="msk-fb" aria-live="polite"></div></section><section><h5>Lô trong kho cạnh chuyền <small>(bấm để quét)</small></h5><div class="msk-lots"></div><h5>Nhật ký nạp (material_load)</h5><div class="msk-log"></div></section></div>`;
    const $=s=>root.querySelector(s);
    const scan=code=>{code=code.trim().toUpperCase();const l=lots.find(x=>x.id.toUpperCase()===code);let why=null,ok=false;
      const rules=cfg.rules||["exists","class","hold","expiry","fefo"];
      if(!l)why=`Không có lô ${code} trong MES: chưa nhận hàng hoặc quét sai.`;
      else if(rules.includes("class")&&!bom.some(b=>b.cls===l.cls))why=`${l.id} là ${l.cls}: không có trong BOM của ${cfg.sp||"SP-07"}.`;
      else if(rules.includes("hold")&&l.status==="HOLD")why=`${l.id} đang HOLD (chất lượng giữ lại).`;
      else if(rules.includes("expiry")&&l.exp&&l.exp<(cfg.today||"2026-11-11"))why=`${l.id} hết hạn ${l.exp}.`;
      else if(rules.includes("fefo")){const older=lots.find(x=>x!==l&&x.cls===l.cls&&x.status!=="HOLD"&&x.exp&&x.exp>=(cfg.today||"2026-11-11")&&x.exp<l.exp&&x.qty>0);
        if(older&&!S.fefoWarned){S.fefoWarned=l.id;why=`Còn lô ${older.id} hạn sớm hơn (${older.exp}): dùng trước theo FEFO. Quét lại ${l.id} nếu tổ trưởng cho phép.`}}
      if(!why){ok=true;S.loads.push({lot:l.id,cls:l.cls,t:mesHMs((S.loads.length+1)*90)});l.qty=Math.max(0,(l.qty||0)-(cfg.take||25))}
      else S.rejects.push({lot:code,why});
      $(".msk-fb").innerHTML=ok?`<p class="ok-t">✓ Chấp nhận ${l.id} (${mesE(l.cls)}): ghi material_load, phả hệ có cạnh lô → lệnh.</p>`:`<p class="bad-t">✗ Từ chối: ${mesE(why)}</p>`;
      api.log({type:ok?"load":"reject",lot:code,cls:l&&l.cls,why});paint();api.changed()};
    $(".msk-go").onclick=()=>{scan($(".msk-in").value);$(".msk-in").value=""};$(".msk-in").onkeydown=e=>{if(e.key==="Enter"){scan(e.target.value);e.target.value=""}};
    function paint(){$(".msk-lots").innerHTML="";lots.forEach(l=>{const b=mesBtn(`<b>${mesE(l.id)}</b><small>${mesE(l.cls)} · ${l.exp?"hạn "+l.exp:""} ${l.status==="HOLD"?"· HOLD":""}</small>`,"msk-lot"+(l.status==="HOLD"?" hold":""),()=>scan(l.id),"Quét "+l.id);$(".msk-lots").append(b)});
      root.querySelectorAll(".msk-ld").forEach(x=>{const n=S.loads.filter(z=>z.cls===x.dataset.c);x.innerHTML=n.length?n.map(z=>z.lot).join(", "):"<i>chưa</i>"});
      $(".msk-log").innerHTML=S.loads.length?mesTable(["Lô","Vật tư"],S.loads.map(z=>[z.lot,mesE(z.cls)])):"<p class='msl-empty'>Chưa nạp.</p>"}
    paint();S.lots=lots}
  else if(mode==="label"){
    root.innerHTML=`${cfg.brief?`<p class="msl-brief">${cfg.brief}</p>`:""}<div class="msk"><section><h5>Dữ liệu nhãn</h5>
      <label class="msc-row"><span>GTIN 12 số đầu</span><input class="msk-g" value="${cfg.gtin12||"893123456789"}" inputmode="numeric"></label>
      <label class="msc-row"><span>Số lô (10)</span><input class="msk-lot2" value="${cfg.lot||"LOT-1108"}"></label>
      <label class="msc-row"><span>Hạn dùng (17) YYMMDD</span><input class="msk-exp" value="${cfg.exp||"270508"}"></label>
      <label class="msc-row"><span>Số lượng</span><input class="msk-q" value="${cfg.qty||"1000"}"></label></section>
      <section><h5>Nhãn</h5><div class="msk-label"></div><div class="msk-calc"></div></section></div>`;
    const $=s=>root.querySelector(s);
    const chk=d=>{const s=d.split("").reverse().reduce((a,c,i)=>a+(+c)*(i%2===0?3:1),0);return(10-s%10)%10};
    function paint(){const g12=$(".msk-g").value.replace(/\D/g,"");const lot=$(".msk-lot2").value.trim(),exp=$(".msk-exp").value.replace(/\D/g,"");
      const ok12=g12.length===12,cd=ok12?chk("0"+g12):null,gtin=ok12?"0"+g12+cd:"";
      const hri=ok12?`(01)${gtin}(17)${exp}(10)${lot}`:"";S.gtin=gtin;S.cd=cd;S.hri=hri;
      $(".msk-calc").innerHTML=ok12?`<p>Số kiểm tra GTIN-14: nhân xen kẽ 3, 1 từ phải sang trên <code>0${g12}</code> → tổng ${("0"+g12).split("").reverse().reduce((a,c,i)=>a+(+c)*(i%2===0?3:1),0)} → <b>${cd}</b></p>`:`<p class="bad-t">Cần đúng 12 chữ số.</p>`;
      $(".msk-label").innerHTML=`<div class="msk-lb"><b>Hạt điều rang muối · ${mesE(cfg.sp||"SP-07")}</b><div class="msk-bc" aria-hidden="true">${[...(gtin+exp+lot)].map((c,i)=>`<i style="width:${1+(c.charCodeAt(0)*7+i)%3}px"></i>`).join("")}</div><code>${mesE(hri)}</code><small>SL ${mesE($(".msk-q").value)} · Lô ${mesE(lot)} · HSD ${exp.slice(4,6)}/${exp.slice(2,4)}/20${exp.slice(0,2)}</small></div>`;
      api.log({type:"label",gtin,cd,hri});api.changed()}
    root.querySelectorAll("input").forEach(i=>i.oninput=paint);paint()}
  else if(mode==="wip"){const st_=cfg.stations;
    root.innerHTML=`${cfg.brief?`<p class="msl-brief">${cfg.brief}</p>`:""}<div class="msk-w"></div><div class="msk-fb" aria-live="polite"></div>`;
    function paint(){const w=root.querySelector(".msk-w");w.innerHTML="";st_.forEach((s,i)=>{const d=mesH("div","msk-st",`<b>${mesE(s)}</b><span class="msk-n">${S.wip[s]||0}</span><small>đang chờ / đang làm</small>`);
        if(i<st_.length-1)d.append(mesBtn(`Chuyển 1 thùng sang ${st_[i+1]} →`,"",()=>{if((S.wip[s]||0)<=0){root.querySelector(".msk-fb").innerHTML=`<p class="bad-t">${s} không còn gì để chuyển.</p>`;return}S.wip[s]--;S.wip[st_[i+1]]=(S.wip[st_[i+1]]||0)+1;S.moves.push([s,st_[i+1]]);api.log({type:"move",from:s,to:st_[i+1]});paint();api.changed()},"Chuyển"));
        if(i===0)d.append(mesBtn("+ Đưa 1 thùng vào","",()=>{S.wip[s]=(S.wip[s]||0)+1;api.log({type:"in",at:s});paint();api.changed()},"Đưa vào"));
        if(i===st_.length-1)d.append(mesBtn("Xuất kho 1 thùng","",()=>{if((S.wip[s]||0)>0){S.wip[s]--;api.log({type:"out"});paint();api.changed()}},"Xuất"));
        w.append(d)});st.total=st_.reduce((a,s)=>a+(S.wip[s]||0),0)}
    paint()}
  const st={S,mode};return{state:()=>st}};
/* ---------------- web ---------------- */
MES_ENG.web=function(root,cfg,api){
  const F={html:cfg.html||"",css:cfg.css||"",js:cfg.js||""};let tab="html",last={};
  root.innerHTML=`${cfg.brief?`<p class="msl-brief">${cfg.brief}</p>`:""}<div class="msw"><div><div class="msw-tabs">${["html","css","js"].map(k=>`<button type="button" class="btn" data-k="${k}">${k.toUpperCase()}</button>`).join("")}<button type="button" class="btn pri msw-run">▶ Xem trước</button></div>
    <textarea class="msq-ta msw-ta" rows="${cfg.rows||14}" spellcheck="false" aria-label="Mã nguồn"></textarea></div><div><h5>Xem trước <small>(khung cách ly; API MES giả lập)</small></h5><iframe class="msw-fr" sandbox="allow-scripts" title="Xem trước trang"></iframe><div class="msw-info" aria-live="polite"></div></div></div>`;
  const ta=root.querySelector(".msw-ta"),fr=root.querySelector(".msw-fr"),info=root.querySelector(".msw-info");
  root.querySelectorAll(".msw-tabs [data-k]").forEach(b=>b.onclick=()=>{F[tab]=ta.value;tab=b.dataset.k;ta.value=F[tab];paintTabs()});
  const paintTabs=()=>root.querySelectorAll(".msw-tabs [data-k]").forEach(b=>b.classList.toggle("on",b.dataset.k===tab));
  ta.value=F.html;paintTabs();
  const mock=`<script>(function(){const M=${JSON.stringify(cfg.api||{})};let tick=0;const st=${JSON.stringify(cfg.states||[])};
    window.fetch=function(u){const k=String(u).replace(/^https?:\\/\\/[^/]+/,"");let v=M[k];if(k==="/api/machines"&&st.length){v=v.map((m,i)=>Object.assign({},m,{state:st[(tick+i)%st.length]}));tick++}
      return Promise.resolve({ok:v!==undefined,status:v!==undefined?200:404,json:()=>Promise.resolve(v===undefined?{detail:"Not Found"}:JSON.parse(JSON.stringify(v)))})};
    window.WebSocket=function(u){const ws=this;setTimeout(()=>{ws.onopen&&ws.onopen({});let n=0;ws._t=setInterval(()=>{const LS=M["/api/machines"]||M["/machines"]||M["/machines/state"]||[{}];const m=LS[n%LS.length]||{};ws.onmessage&&ws.onmessage({data:JSON.stringify({machine_id:m.machine_id,state:st[n%st.length]||"RUNNING",ts:"2026-11-11T08:0"+(n%10)+":00+07:00"})});n++},1200)},200);this.send=function(){};this.close=function(){clearInterval(ws._t)}};
    function rep(){try{parent.postMessage({__msw:1,text:document.body.innerText.slice(0,2000),n:document.querySelectorAll("*").length,cls:[...document.querySelectorAll("[class]")].map(e=>e.className).join(" ").slice(0,500),
      bg:[...document.querySelectorAll("*")].slice(0,200).map(e=>getComputedStyle(e).backgroundColor).filter(c=>c!=="rgba(0, 0, 0, 0)").slice(0,20)},"*")}catch(e){}}
    window.addEventListener("error",e=>{try{parent.postMessage({__msw:1,err:String(e.message)},"*")}catch(x){}});
    window.addEventListener("load",()=>{setTimeout(rep,300);setInterval(rep,1500)})})();<\/script>`;
  function run(){F[tab]=ta.value;fr.srcdoc=`<!doctype html><html><head><meta charset="utf-8"><style>body{font-family:system-ui,sans-serif}${F.css}</style>${mock}</head><body>${F.html}<script>${F.js.replace(/<\/script/gi,"<\\/script")}<\/script></body></html>`;
    api.log({type:"run",F:Object.assign({},F)});info.textContent="Đang chạy…"}
  root.querySelector(".msw-run").onclick=run;
  const onMsg=e=>{if(e.source!==fr.contentWindow||!e.data||!e.data.__msw)return;if(e.data.err){info.innerHTML=`<span class="bad-t">Lỗi JavaScript: ${mesE(e.data.err)}</span>`;api.log({type:"jserr",msg:e.data.err});api.changed();return}
    last=e.data;info.textContent=`Trang có ${e.data.n} phần tử.`;api.log({type:"render",text:e.data.text,cls:e.data.cls});api.changed()};
  window.addEventListener("message",onMsg);
  const st={F,get last(){return last},code:()=>(F[tab]=ta.value,F)};run();return{state:()=>st,stop:()=>window.removeEventListener("message",onMsg)}};
/* ---------------- zones ---------------- */
MES_ENG.zones=function(root,cfg,api){
  const rules=(cfg.rules||[]).map(r=>Object.assign({},r));const Z=cfg.zones;
  root.innerHTML=`${cfg.brief?`<p class="msl-brief">${cfg.brief}</p>`:""}<div class="msz"><section><h5>Luật tường lửa <small>(xét từ trên xuống, không khớp luật nào thì CHẶN)</small></h5><div class="msz-r"></div>
    <div class="msz-add"><select class="z-f">${Z.map(z=>`<option>${z}</option>`).join("")}</select> → <select class="z-t">${Z.map(z=>`<option>${z}</option>`).join("")}</select>
    <select class="z-p">${(cfg.ports||["5000/tcp SLMP","5432/tcp PostgreSQL","8443/tcp HTTPS API","502/tcp Modbus","3389/tcp RDP","any"]).map(p=>`<option>${p}</option>`).join("")}</select><select class="z-a"><option>CHO PHÉP</option><option>CHẶN</option></select><button type="button" class="btn pri z-add">Thêm luật</button></div></section>
    <section><h5>Thử các luồng</h5><div class="msz-f"></div></section></div>`;
  const $=s=>root.querySelector(s);
  $(".z-add").onclick=()=>{rules.push({f:$(".z-f").value,t:$(".z-t").value,p:$(".z-p").value,a:$(".z-a").value});api.log({type:"rule"});paint();api.changed()};
  const hit=(r,fl)=>(r.f===fl.f||r.f==="any")&&(r.t===fl.t||r.t==="any")&&(r.p===fl.p||r.p==="any");
  function verdict(fl){const r=rules.find(r=>hit(r,fl));return r?r.a==="CHO PHÉP":false}
  function paint(){$(".msz-r").innerHTML=rules.length?mesTable(["#","Từ","Tới","Cổng","Hành động",""],rules.map((r,i)=>[i+1,r.f,r.t,r.p,r.a==="CHO PHÉP"?'<b class="ok-t">CHO PHÉP</b>':'<b class="bad-t">CHẶN</b>',`<button type="button" class="btn z-del" data-i="${i}" aria-label="Xóa luật ${i+1}">✕</button>`])):"<p class='msl-empty'>Chưa có luật: mọi luồng đều bị chặn.</p>";
    root.querySelectorAll(".z-del").forEach(b=>b.onclick=()=>{rules.splice(+b.dataset.i,1);api.log({type:"del"});paint();api.changed()});
    const res=cfg.flows.map(fl=>({fl,ok:verdict(fl)}));st.res=res;
    $(".msz-f").innerHTML=mesTable(["Luồng","Cần?","Kết quả"],res.map(({fl,ok})=>({cls:ok===fl.need?"":"bad",c:[`${mesE(fl.l||(fl.f+" → "+fl.t))}<br><small>${fl.f} → ${fl.t} · ${fl.p}</small>`,fl.need?"cần":"<b>cấm</b>",ok?(fl.need?'<b class="ok-t">thông</b>':'<b class="bad-t">thông (nguy hiểm)</b>'):(fl.need?'<b class="bad-t">bị chặn (hỏng việc)</b>':'<b class="ok-t">bị chặn</b>')]})))}
  const st={rules,res:[],get good(){return this.res.every(x=>x.ok===x.fl.need)},get needOk(){return this.res.filter(x=>x.fl.need).every(x=>x.ok)},get badOpen(){return this.res.filter(x=>!x.fl.need&&x.ok).length}};
  paint();return{state:()=>st}};
/* ===================== mã dùng chung của khóa (courses/mes/course.js) ===================== */
/* Khóa Xây dựng hệ thống MES từ con số 0 (AMTS-DAT-009): công cụ dùng chung cho mọi bài của khóa.
   Bản sao nguyên văn makeMtLab / makeMtEx của courses/maytinh/course.js (25/10/2026). Mỗi trang khóa chỉ tải course.js của
   chính khóa đó nên không trùng tên. Khi sửa một bản, sửa cả bản kia (hoặc chuyển hai hàm vào platform/js dùng chung). */
function mtShuffle(n,seed){let s=seed>>>0;const rnd=()=>{s=(s+0x6D2B79F5)>>>0;let t=s;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296};
  /* xáo trộn cố định theo bài tập (Fisher–Yates); chọn cách xáo có ít nhất nửa số mục rời chỗ để bài tập không gần như đã xếp sẵn */
  let best=null,bf=n+1;
  for(let k=0;k<40;k++){const ix=[...Array(n).keys()];for(let i=n-1;i>0;i--){const j=Math.floor(rnd()*(i+1));[ix[i],ix[j]]=[ix[j],ix[i]]}
    const fixed=ix.filter((v,i)=>v===i).length;if(fixed<bf){best=ix;bf=fixed}if(fixed<=Math.floor(n/2)-1||fixed===0)break}
  return best}
function mtSeed(s){let h=2166136261;for(const c of String(s)){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0}
function mtNum(s){s=String(s||"").trim().replace(/\s+/g,"").replace(/,/g,".").replace(/[×x]10\^?(-?\d+)$/i,"e$1");
  if(!/^[-+]?(\d+\.?\d*|\.\d+)(e[-+]?\d+)?$/i.test(s))return NaN;return Number(s)}
function makeMtLab(el,cfg){
  const S=cfg.scenarios,P="mtl-"+(cfg.id||"x");let si=0,k=0,asking=false,answered={};
  el.classList.add("mt-lab");
  el.innerHTML=`<div class="mt-top"><label class="mt-sel"><span>Ví dụ</span><select id="${P}-sel">${S.map((s,i)=>`<option value="${i}">${esc(s.label)}</option>`).join("")}</select></label>
    <label class="mt-pred"><input type="checkbox" id="${P}-pred"> Đoán trước</label></div>
   <details class="mt-note" id="${P}-note"><summary>Ví dụ này minh họa</summary><div id="${P}-nt"></div></details>
   <div class="mt-view" id="${P}-view"><div class="mt-stage" id="${P}-stage"></div><div class="mt-say" id="${P}-say" aria-live="polite"></div></div>
   <div class="pipe-ctl mt-ctl"><button type="button" class="btn mt-b0" id="${P}-reset" title="Làm lại từ đầu" aria-label="Làm lại từ đầu">↺</button><button type="button" class="btn mt-b1" id="${P}-prev">← Lùi</button><button type="button" class="btn pri mt-b2" id="${P}-next">Bước tiếp →</button><button type="button" class="btn mt-b3" id="${P}-all">Xem hết</button><span class="mt-k" id="${P}-k" role="status"></span></div>
   <ol class="mt-log" id="${P}-log" aria-label="Các bước đã xem"></ol>`;
  const $=s=>el.querySelector("#"+P+"-"+s);
  const SD=steady(el,[".mt-view"],prime);
  if(matchMedia("(min-width:901px)").matches)$("note").open=true;
  const steps=()=>S[si].steps;
  function paint(fb){const st=steps(),x=st[k];asking=false;
    $("stage").innerHTML=x.html;
    $("say").innerHTML=(fb||"")+`<p class="mt-st"><b>${esc(x.t)}</b></p>`+(x.say?`<div class="mt-sx">${x.say}</div>`:"");
    $("k").textContent=`Bước ${k}/${st.length-1}`+(k===st.length-1?" · xong":"");
    $("prev").disabled=k===0;$("next").disabled=$("all").disabled=k===st.length-1;
    $("log").innerHTML=st.slice(1,k+1).map((y,i)=>`<li${i+1===k?' class="cur"':""}><button type="button" data-k="${i+1}">${esc(y.t)}</button></li>`).join("");
    $("log").querySelectorAll("button").forEach(b=>b.onclick=()=>{k=+b.dataset.k;paint();SD.hold()});
    SD.hold()}
  function prime(){const keep=k;for(k=0;k<steps().length;k++)paint();k=keep;paint()}
  function load(i){si=i;k=0;answered={};SD.free();$("nt").innerHTML=S[si].note||"";prime()}
  function ask(n){const a=steps()[n].ask;asking=true;
    $("say").innerHTML=`<div class="mt-qa"><p><b>Đoán trước:</b> ${a.q}</p><div class="mt-qo">${a.o.map((o,j)=>`<button type="button" class="btn" data-j="${j}">${o}</button>`).join("")}</div></div>`;
    $("say").querySelectorAll("[data-j]").forEach(b=>b.onclick=()=>{answered[n]=1;k=n;const ok=+b.dataset.j===a.a;
      paint(`<p class="mt-fb ${ok?"ok-t":"bad-t"}">${ok?"✓ Đúng.":"✗ Chưa đúng. Đáp án: "+a.o[a.a]+"."}</p>`)});
    SD.hold();const f=$("say").querySelector("button");if(f)f.focus({preventScroll:true})}
  $("sel").onchange=()=>load(+$("sel").value);
  $("reset").onclick=()=>{k=0;answered={};paint()};
  $("prev").onclick=()=>{if(asking){paint();return}if(k>0){k--;paint()}};
  $("next").onclick=()=>{if(asking)return;const n=k+1;if(n>=steps().length)return;
    if($("pred").checked&&steps()[n].ask&&!answered[n])ask(n);else{k=n;paint()}};
  $("all").onclick=()=>{k=steps().length-1;paint()};
  load(0)}
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

const LESSON_UPDATED={"l1": "2026-11-11T16:21:48Z", "l10": "2026-11-11T16:26:57Z", "l100": "2026-11-11T18:39:57Z", "l101": "2026-11-11T18:39:57Z", "l102": "2026-11-11T18:39:57Z", "l103": "2026-11-11T18:39:57Z", "l104": "2026-11-11T18:39:57Z", "l105": "2026-11-11T19:17:30Z", "l106": "2026-11-11T18:39:57Z", "l107": "2026-11-11T18:45:00Z", "l108": "2026-11-11T18:45:00Z", "l109": "2026-11-11T18:45:00Z", "l11": "2026-11-11T16:26:57Z", "l110": "2026-11-11T19:17:30Z", "l111": "2026-11-11T18:45:00Z", "l112": "2026-11-11T18:45:00Z", "l113": "2026-11-11T18:45:00Z", "l114": "2026-11-11T18:45:00Z", "l115": "2026-11-11T18:45:00Z", "l116": "2026-11-11T18:45:00Z", "l117": "2026-11-11T18:45:00Z", "l118": "2026-11-11T18:47:46Z", "l119": "2026-11-11T18:45:00Z", "l12": "2026-11-11T16:26:57Z", "l120": "2026-11-11T19:17:30Z", "l121": "2026-11-11T19:17:30Z", "l13": "2026-11-11T16:26:57Z", "l14": "2026-11-11T16:26:57Z", "l15": "2026-11-11T16:26:57Z", "l16": "2026-11-11T16:26:57Z", "l17": "2026-11-11T16:29:24Z", "l18": "2026-11-11T16:29:24Z", "l19": "2026-11-11T16:29:24Z", "l2": "2026-11-11T16:21:48Z", "l20": "2026-11-11T16:29:24Z", "l21": "2026-11-11T16:29:24Z", "l22": "2026-11-11T16:31:33Z", "l23": "2026-11-11T16:31:33Z", "l24": "2026-11-11T16:31:33Z", "l25": "2026-11-11T16:31:33Z", "l26": "2026-11-11T16:31:33Z", "l27": "2026-11-11T16:33:41Z", "l28": "2026-11-11T16:33:41Z", "l29": "2026-11-11T16:33:41Z", "l3": "2026-11-11T16:21:48Z", "l30": "2026-11-11T16:33:41Z", "l31": "2026-11-11T16:33:41Z", "l32": "2026-11-11T16:33:41Z", "l33": "2026-11-11T16:36:41Z", "l34": "2026-11-11T16:36:41Z", "l35": "2026-11-11T16:36:41Z", "l36": "2026-11-11T16:36:41Z", "l37": "2026-11-11T16:36:41Z", "l38": "2026-11-11T16:36:41Z", "l39": "2026-11-11T16:36:41Z", "l4": "2026-11-11T16:21:48Z", "l40": "2026-11-11T16:36:41Z", "l41": "2026-11-11T16:36:41Z", "l42": "2026-11-11T16:36:41Z", "l43": "2026-11-11T16:40:50Z", "l44": "2026-11-11T16:40:50Z", "l45": "2026-11-11T16:40:50Z", "l46": "2026-11-11T16:40:50Z", "l47": "2026-11-11T16:40:50Z", "l48": "2026-11-11T16:40:50Z", "l49": "2026-11-11T16:40:50Z", "l5": "2026-11-11T16:21:48Z", "l50": "2026-11-11T16:40:50Z", "l51": "2026-11-11T16:40:50Z", "l52": "2026-11-11T16:40:50Z", "l53": "2026-11-11T16:40:50Z", "l54": "2026-11-11T16:40:50Z", "l55": "2026-11-11T16:43:57Z", "l56": "2026-11-11T16:43:57Z", "l57": "2026-11-11T16:43:57Z", "l58": "2026-11-11T16:43:57Z", "l59": "2026-11-11T16:43:57Z", "l6": "2026-11-11T16:26:57Z", "l60": "2026-11-11T16:43:57Z", "l61": "2026-11-11T16:43:57Z", "l62": "2026-11-11T16:43:57Z", "l63": "2026-11-11T16:43:57Z", "l64": "2026-11-11T16:43:57Z", "l65": "2026-11-11T16:47:07Z", "l66": "2026-11-11T16:47:07Z", "l67": "2026-11-11T16:47:07Z", "l68": "2026-11-11T16:47:07Z", "l69": "2026-11-11T16:47:07Z", "l7": "2026-11-11T16:26:57Z", "l70": "2026-11-11T16:47:07Z", "l71": "2026-11-11T16:47:07Z", "l72": "2026-11-11T16:50:12Z", "l73": "2026-11-11T16:47:07Z", "l74": "2026-11-11T16:47:07Z", "l75": "2026-11-11T16:47:07Z", "l76": "2026-11-11T18:28:31Z", "l77": "2026-11-11T18:29:23Z", "l78": "2026-11-11T18:28:31Z", "l79": "2026-11-11T18:28:31Z", "l8": "2026-11-11T16:26:57Z", "l80": "2026-11-11T19:17:30Z", "l81": "2026-11-11T18:28:31Z", "l82": "2026-11-11T18:28:31Z", "l83": "2026-11-11T18:28:31Z", "l84": "2026-11-11T18:28:31Z", "l85": "2026-11-11T18:28:31Z", "l86": "2026-11-11T18:28:31Z", "l87": "2026-11-11T18:36:06Z", "l88": "2026-11-11T18:36:19Z", "l89": "2026-11-11T18:34:28Z", "l9": "2026-11-11T16:26:57Z", "l90": "2026-11-11T19:17:30Z", "l91": "2026-11-11T18:34:28Z", "l92": "2026-11-11T18:34:28Z", "l93": "2026-11-11T18:34:28Z", "l94": "2026-11-11T18:34:28Z", "l95": "2026-11-11T18:34:28Z", "l96": "2026-11-11T18:34:28Z", "l97": "2026-11-11T19:17:30Z", "l98": "2026-11-11T18:39:57Z", "l99": "2026-11-11T18:39:57Z"};
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
