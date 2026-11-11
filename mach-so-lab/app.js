/* Mạch số Lab · giao diện.
   Bố cục theo docs/QUY-TAC-TRINH-MO-PHONG.md: khung cao cố định bằng màn hình, sơ đồ luôn thấy,
   các phần theo dõi xếp dọc trong một khung cuộn riêng, hàng nút ở đáy khung. Không cuộn trang khi chạy. */
(function(){
const $=id=>document.getElementById(id);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
let C,S,wires=[],running=false,pending=false,gen=0,delay=300,hist=[],autoT=null;
const byId={};CIRCUITS.forEach(c=>byId[c.id]=c);

const inp=id=>(C.inputs||[]).find(i=>i.id===id);
const gate=id=>(C.gates||[]).find(g=>g.id===id);
const blk=id=>(C.blocks||[]).find(b=>b.id===id);
function lbl(s){const i=inp(s);if(i)return i.label||i.id;const o=(C.outputs||[]).find(o=>o.src===s);if(o&&s.includes('.'))return o.label;return s}
function gdim(g){return{w:g.type==='not'?40:60,h:g.h||(g.type==='not'?30:40)}}
const bub=t=>['not','nand','nor','xnor'].includes(t);
function srcPt(s){
  const i=inp(s);if(i)return[42,i.y];
  const g=gate(s);if(g){const{w,h}=gdim(g);return[g.x+w+(bub(g.type)?8:0),g.y+h/2]}
  const [b,p]=s.split('.'),B=blk(b);return[B.x+70,B.y+(p==='Q'?20:50)];
}
function inPt(g,k){const{w,h}=gdim(g),f=(k+1)/(g.in.length+1);let x=g.x;if(['or','nor','xor','xnor'].includes(g.type))x+=.6*w*f*(1-f);return[x,g.y+h*f]}
function route(src,d,idx,via){
  const s=srcPt(src),p=[s];
  if(via)p.push(...via);
  else if(C.bus&&C.bus[src]!=null){const bx=C.bus[src];p.push([bx,s[1]],[bx,d[1]])}
  else if(Math.abs(s[1]-d[1])>.5){const mx=d[0]-14-idx*8;p.push([mx,s[1]],[mx,d[1]])}
  p.push(d);return p;
}
function shape(g){
  const{w,h}=gdim(g),x=g.x,y=g.y,t=g.type;let d,extra='';
  if(t==='not')d=`M${x},${y}L${x+w},${y+h/2}L${x},${y+h}Z`;
  else if(t==='and'||t==='nand')d=`M${x},${y}H${x+w-h/2}A${h/2},${h/2} 0 0 1 ${x+w-h/2},${y+h}H${x}Z`;
  else{d=`M${x},${y}Q${x+w*.6},${y} ${x+w},${y+h/2}Q${x+w*.6},${y+h} ${x},${y+h}Q${x+w*.3},${y+h/2} ${x},${y}Z`;
    if(t==='xor'||t==='xnor')extra=`<path class="xb" d="M${x-7},${y}Q${x-7+w*.3},${y+h/2} ${x-7},${y+h}"/>`}
  const b=bub(t)?`<circle cx="${x+w+4}" cy="${y+h/2}" r="4"/>`:'',name=t.toUpperCase();
  return `<g class="gate" id="g_${g.id}">${extra}<path d="${d}"/>${b}`+
    (t==='not'?'':`<text x="${x+w*.42}" y="${y+h/2+4}" text-anchor="middle" font-size="10" fill="#94a3b8">${name}</text>`)+
    (g.id!==name?`<text x="${x+w/2}" y="${y-4}" text-anchor="middle" font-size="9" fill="#5b6b82">${g.id}</text>`:'')+'</g>';
}
function blockSVG(b){const x=b.x,y=b.y;return `<g class="gate" id="g_${b.id}"><rect x="${x}" y="${y}" width="70" height="70" rx="6"/>
<text x="${x+8}" y="${y+24}" font-size="12" fill="#cbd5e1">D</text><path d="M${x},${y+44}L${x+9},${y+50}L${x},${y+56}" fill="none" stroke="#c084fc" stroke-width="1.6"/>
<text x="${x+62}" y="${y+24}" font-size="12" fill="#7dd3fc" text-anchor="end">Q</text><text x="${x+62}" y="${y+54}" font-size="12" fill="#7dd3fc" text-anchor="end">Q̄</text>
<text x="${x+35}" y="${y-5}" font-size="10" fill="#94a3b8" text-anchor="middle">${b.label}</text></g>`}
function badge(id,x,y,label,color,click,side){
  const lt=side?`<text x="${x-18}" y="${y-6}" text-anchor="end" font-size="12" font-weight="700" fill="${color}">${label}</text>`
               :`<text x="${x}" y="${y-18}" text-anchor="middle" font-size="12" font-weight="700" fill="${color}">${label}</text>`;
  return `<g class="badge" id="bd_${id}" ${click?`data-in="${id}"`:''}><circle cx="${x}" cy="${y}" r="13"/><text x="${x}" y="${y+5}" text-anchor="middle" font-size="14" fill="#e2e8f0" id="bt_${id}">0</text>${lt}</g>`}

function build(){
  const svg=$('circ');svg.setAttribute('viewBox',`0 0 ${C.W} ${C.H}`);svg.setAttribute('aria-label','Sơ đồ '+C.title);
  wires=[];
  (C.gates||[]).forEach(g=>g.in.forEach((s,k)=>wires.push({src:s,pts:route(s,inPt(g,k),k,g.via&&g.via[k])})));
  (C.blocks||[]).forEach(b=>{wires.push({src:b.d,pts:route(b.d,[b.x,b.y+20],0,b.via&&b.via.d)});wires.push({src:b.clk,pts:route(b.clk,[b.x,b.y+50],1,b.via&&b.via.clk)})});
  (C.outputs||[]).forEach(o=>{const s=srcPt(o.src);
    if(o.bx!=null){o._x=o.bx;o._y=o.by;wires.push({src:o.src,pts:[s,...(o.via||[]),[o.bx,o.by+13]]})}
    else{o._x=C.W-24;o._y=s[1];wires.push({src:o.src,pts:[s,[C.W-37,s[1]]]})}});
  let h='';
  wires.forEach((w,i)=>h+=`<polyline class="wire" id="w${i}" points="${w.pts.map(p=>p.join(',')).join(' ')}"/>`);
  (C.gates||[]).forEach(g=>h+=shape(g));
  (C.blocks||[]).forEach(b=>h+=blockSVG(b));
  (C.inputs||[]).forEach(i=>h+=badge(i.id,28,i.y,i.label||i.id,i.color||(i.kind==='clk'?'var(--clk)':'var(--s)'),true));
  (C.outputs||[]).forEach(o=>h+=badge('o_'+o.src.replace('.','_'),o._x,o._y,o.label,'var(--q)',false,o.bx==null));
  svg.innerHTML=h;
  svg.querySelectorAll('[data-in]').forEach(e=>e.onclick=()=>toggle(e.dataset.in));
  wires.forEach((w,i)=>w.el=$('w'+i));
  const ctl=$('ctl');ctl.innerHTML='';
  const mk=(txt,cls,fn,id)=>{const b=document.createElement('button');b.textContent=txt;if(cls)b.className=cls;if(id)b.id=id;b.onclick=fn;ctl.appendChild(b);return b};
  (C.inputs||[]).forEach(i=>{
    mk('',i.kind==='clk'?'clk':'',()=>toggle(i.id),'btn_'+i.id);
    if(i.kind==='clk'){mk('⎍ Xung','clk',()=>pulse(i.id));mk('▶ Tự chạy','clk',()=>autoClk(i.id),'auto')}
  });
  (C.extra||[]).forEach(x=>mk(x.label,'ex',()=>x.run(H)));
}
function render(){
  const V=S.V;
  wires.forEach(w=>w.el.classList.toggle('on',!!V[w.src]));
  (C.inputs||[]).forEach(i=>{$('bd_'+i.id).classList.toggle('on',!!V[i.id]);$('bt_'+i.id).textContent=V[i.id];
    const b=$('btn_'+i.id);b.textContent=(i.label||i.id)+' = '+V[i.id];b.classList.toggle('on',!!V[i.id])});
  (C.outputs||[]).forEach(o=>{const k='o_'+o.src.replace('.','_');$('bd_'+k).classList.toggle('on',!!V[o.src]);$('bt_'+k).textContent=V[o.src]});
  if(C.state){const [t,c]=C.state(V);$('state').textContent=t;$('state').style.color=c}
  else $('state').textContent=(C.outputs||[]).map(o=>o.label+'='+V[o.src]).join('  ');
  if(C.table&&C.table.match){const m=C.table.match(V);document.querySelectorAll('#tbl tr[data-r]').forEach(r=>r.classList.toggle('act',+r.dataset.r===m))}
}
/* ---- khung cuộn riêng: tên phần, chấm báo có dòng mới ---- */
const scr=$('scr');
function secTop(name){const s=scr.querySelector(`[data-sec="${name}"]`);return s.offsetTop-scr.offsetTop}
function seen(name){const s=scr.querySelector(`[data-sec="${name}"]`),t=s.offsetTop-scr.offsetTop-scr.scrollTop;return t<scr.clientHeight*.8&&t+s.offsetHeight>40}
document.querySelectorAll('#stnav button').forEach(b=>b.onclick=()=>{
  scr.scrollTo({top:secTop(b.dataset.go)+1,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});b.classList.remove('dot')});
function navAct(){let cur='xung';document.querySelectorAll('#scr [data-sec]').forEach(s=>{if(s.offsetTop-scr.offsetTop-scr.scrollTop<=40)cur=s.dataset.sec});
  document.querySelectorAll('#stnav button').forEach(b=>{b.classList.toggle('act',b.dataset.go===cur);if(b.dataset.go==='buoc'&&seen('buoc'))b.classList.remove('dot')})}
scr.addEventListener('scroll',navAct,{passive:true});

function log(m,c){const d=document.createElement('div');d.textContent=m;if(c)d.className=c;const L=$('log');L.prepend(d);while(L.children.length>40)L.lastChild.remove();
  if(!seen('buoc'))document.querySelector('#stnav [data-go="buoc"]').classList.add('dot')}
function flash(ids,on){ids.forEach(id=>{const e=$('g_'+id);if(e)e.classList.toggle('flash',on)})}

async function settle(){
  if(running){pending=true;return}
  running=true;const my=gen;
  do{pending=false;let n=0,asy=false;const seenK=new Set();
    while(true){
      if(gen!==my)return;
      let ups=unstable(C,S,lbl);
      if(!ups.length){if(n)log('✓ Ổn định sau '+n+' bước trễ','ok');break}
      const k=keyOf(S);
      if(seenK.has(k)&&!asy){asy=true;log('⚡ Dao động! Trạng thái lặp lại. Ngoài đời 2 cổng không bao giờ nhanh bằng nhau tuyệt đối → cổng nhanh hơn thắng (ngẫu nhiên).','race')}
      seenK.add(k);n++;
      if(delay){const ids=ups.map(u=>u.id);flash(ids,true);await sleep(delay);flash(ids,false);if(gen!==my)return;ups=unstable(C,S,lbl);if(!ups.length)continue}
      if(asy)ups=[ups[Math.floor(Math.random()*ups.length)]];
      ups.forEach(u=>u.apply());ups.forEach(u=>u.msg&&log('B'+n+' · '+u.msg));
      render();if(n>300)break;
    }
  }while(pending);
  if(gen===my)running=false;
}
async function idle(){while(running)await sleep(30)}
function toggle(id){S.V[id]^=1;log('— Bạn đổi '+lbl(id)+' = '+S.V[id]+' —','user');render();settle()}
async function pulse(id){const my=gen;
  if(S.V[id]){S.V[id]=0;render();settle();await idle()}if(gen!==my)return;
  S.V[id]=1;log('— '+lbl(id)+' ↑ —','user');render();settle();await idle();if(gen!==my)return;
  await sleep(Math.max(150,delay));S.V[id]=0;log('— '+lbl(id)+' ↓ —','user');render();settle()}
function autoClk(id){const a=$('auto');
  if(autoT){clearInterval(autoT);autoT=null;a.textContent='▶ Tự chạy';a.classList.remove('on');return}
  a.textContent='■ Dừng';a.classList.add('on');autoT=setInterval(()=>{if(!running){S.V[id]^=1;render();settle()}},Math.max(400,delay*4))}
function resetBlocks(){(C.blocks||[]).forEach(b=>{S.blocks[b.id].state=0;S.V[b.id+'.Q']=0;S.V[b.id+'.Qn']=1});
  (C.blocks||[]).forEach(b=>S.blocks[b.id].last=S.V[b.clk]);log('— Reset —','user');render();settle()}
const H={get V(){return S.V},log,lbl,render,settle,idle,sleep,resetBlocks};

function silentSettle(){let n=0,asy=false;const k=new Set();while(n++<300){let u=unstable(C,S,lbl);if(!u.length)return;const kk=keyOf(S);if(k.has(kk))asy=true;k.add(kk);if(asy)u=[u[Math.floor(Math.random()*u.length)]];u.forEach(x=>x.apply())}}

function load(id){
  if(!byId[id])id=CIRCUITS[0].id;
  gen++;running=false;pending=false;if(autoT){clearInterval(autoT);autoT=null}
  C=byId[id];S=makeSim(C);silentSettle();hist=[];if(paused)setPause(false);
  $('pick').value=id;
  $('dsc').textContent=C.desc;
  $('chips').innerHTML=(C.chips||[]).map(c=>`<div class="chip">${c[0]}<b>${c[1]}</b></div>`).join('');
  const t=C.table;$('tbl').innerHTML='<table><tr>'+t.head.map(x=>'<th>'+x+'</th>').join('')+'</tr>'+t.rows.map((r,i)=>`<tr data-r="${i}">`+r.map(x=>'<td>'+x+'</td>').join('')+'</tr>').join('')+'</table>';
  $('steps').innerHTML=C.steps.map(s=>'<p>'+s+'</p>').join('');
  $('ic').innerHTML=C.ic;
  $('log').innerHTML='<div>Bấm nút ở đáy (hoặc chạm vòng tròn đầu vào trên sơ đồ) để xem tín hiệu đi qua từng cổng.</div>';
  document.querySelector('#stnav [data-go="buoc"]').classList.remove('dot');
  const k=CIRCUITS.indexOf(C);$('prev').disabled=k===0;$('next').disabled=k===CIRCUITS.length-1;
  build();render();scr.scrollTop=0;navAct();draw();
}
// chọn mạch
const groups=[...new Set(CIRCUITS.map(c=>c.group))];
$('pick').innerHTML=groups.map((g,i)=>`<optgroup label="${i+1}. ${g}">`+CIRCUITS.filter(c=>c.group===g).map(c=>`<option value="${c.id}">${c.name}</option>`).join('')+'</optgroup>').join('');
const go=id=>{if(location.hash.slice(1)!==id)location.hash=id;else load(id)};
$('pick').onchange=e=>go(e.target.value);
$('prev').onclick=()=>{const k=CIRCUITS.indexOf(C);if(k>0)go(CIRCUITS[k-1].id)};
$('next').onclick=()=>{const k=CIRCUITS.indexOf(C);if(k<CIRCUITS.length-1)go(CIRCUITS[k+1].id)};

// giản đồ xung (chiều cao cố định theo số tín hiệu của mạch)
const cv=$('cv'),cx=cv.getContext('2d'),N=200,TICK=80;
// Tạm dừng: chỉ đóng băng HÌNH giản đồ (ảnh chụp 'frozen'); mạch và việc ghi 'hist' vẫn chạy,
// nên bấm Tiếp tục là thấy ngay tín hiệu theo thời gian thực.
let paused=false,frozen=null,cur=-1;
function setPause(p){paused=p;frozen=p?hist.map(r=>r.slice()):null;cur=-1;
  const b=$('wv-pause');b.setAttribute('aria-pressed',String(p));b.textContent=p?'▶ Tiếp tục':'⏸ Tạm dừng';
  b.title=p?'Tiếp tục vẽ giản đồ theo thời gian thực':'Tạm dừng giản đồ để phân tích; mạch vẫn chạy';
  $('wv-tip').hidden=!p;draw()}
$('wv-pause').onclick=()=>setPause(!paused);
function pick(e){if(!paused||!frozen||!frozen.length)return;const r=cv.getBoundingClientRect(),x0=40,dx=(r.width-x0-4)/N;
  const j=Math.floor((e.clientX-r.left-x0)/dx);cur=j>=0&&j<frozen.length?j:-1;draw()}
cv.addEventListener('pointermove',pick);cv.addEventListener('pointerdown',pick);
cv.addEventListener('pointerleave',e=>{if(e.pointerType==='mouse'&&cur>=0){cur=-1;draw()}});
function draw(){
  const sig=C.sig,lane=30,h=sig.length*lane+6;cv.style.height=h+'px';
  const w=cv.clientWidth,dpr=devicePixelRatio||1;if(!w)return;if(cv.width!==Math.round(w*dpr)||cv.height!==Math.round(h*dpr)){cv.width=Math.round(w*dpr);cv.height=Math.round(h*dpr)}
  cx.setTransform(dpr,0,0,dpr,0,0);cx.clearRect(0,0,w,h);
  const cols=['#5eead4','#fbbf24','#7dd3fc','#e2e8f0','#f472b6','#a3e635'],x0=40,dx=(w-x0-4)/N;
  const hs=paused&&frozen?frozen:hist;
  cx.font='12px ui-monospace,Consolas,monospace';
  sig.forEach(([lab,k],i)=>{const c=k==='CLK'?'#c084fc':cols[i%cols.length],top=i*lane+7,bot=(i+1)*lane-5;
    cx.fillStyle=c;cx.fillText(lab,4,(top+bot)/2+4);
    cx.strokeStyle='rgba(100,116,139,.18)';cx.lineWidth=1;cx.beginPath();cx.moveTo(x0,bot);cx.lineTo(w,bot);cx.stroke();
    cx.strokeStyle=c;cx.lineWidth=2;cx.beginPath();
    hs.forEach((s,j)=>{const y=s[i]?top:bot,x=x0+j*dx;if(j===0)cx.moveTo(x,y);else{cx.lineTo(x,hs[j-1][i]?top:bot);cx.lineTo(x,y)}cx.lineTo(x+dx,y)});
    cx.stroke()});
  if(paused&&cur<0){const tl='❚❚ ĐÃ TẠM DỪNG',tw=cx.measureText(tl).width;cx.fillStyle='rgba(13,20,36,.9)';cx.fillRect(w-tw-12,0,tw+12,17);cx.fillStyle='rgba(251,191,36,.95)';cx.textAlign='right';cx.fillText(tl,w-6,12);cx.textAlign='left'}
  if(paused&&cur>=0&&cur<hs.length){const x=x0+cur*dx+dx/2;
    cx.strokeStyle='rgba(226,232,240,.75)';cx.lineWidth=1;cx.setLineDash([4,3]);cx.beginPath();cx.moveTo(x,0);cx.lineTo(x,h);cx.stroke();cx.setLineDash([]);
    const t=((hs.length-1-cur)*TICK/1000).toFixed(2).replace('.',','),right=x>w-120;
    cx.textAlign=right?'right':'left';const tx=right?x-6:x+6;
    sig.forEach(([lab],i)=>{const top=i*lane+7,bot=(i+1)*lane-5,v=hs[cur][i];
      const txt=lab+'='+v,tw=cx.measureText(txt).width;cx.fillStyle='rgba(10,26,51,.85)';cx.fillRect(right?tx-tw-3:tx-3,(top+bot)/2-8,tw+6,16);
      cx.fillStyle=v?'#5eead4':'#94a3b8';cx.fillText(txt,tx,(top+bot)/2+4)});
    cx.textAlign='left';$('wv-t').textContent='Vạch đọc: '+t+' s trước lúc tạm dừng.'}else $('wv-t').textContent=''
}
// Chỉ VẼ khi giản đồ đang hiện trên màn hình, tab đang mở và chưa tạm dừng; việc GHI tín hiệu (rất nhẹ) vẫn chạy
// để lúc cuộn tới / quay lại tab / bấm Tiếp tục thấy đúng 16 s gần nhất.
let onScreen=true;
if('IntersectionObserver' in window)new IntersectionObserver(es=>{onScreen=es[es.length-1].isIntersecting;if(onScreen)draw()}).observe(cv);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)draw()});
setInterval(()=>{if(!C)return;hist.push(C.sig.map(([,k])=>S.V[k]));if(hist.length>N)hist.shift();if(onScreen&&!document.hidden&&!paused)draw()},TICK);

$('spd').onchange=e=>{delay=+e.target.value};
window.addEventListener('hashchange',()=>load(location.hash.slice(1)));
load(location.hash.slice(1)||CIRCUITS[0].id);
})();
