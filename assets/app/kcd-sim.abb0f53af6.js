/* trình mô phỏng của khóa kcd (tải khi cần; nguồn: platform/sim/kcd/engine.js, platform/sim/kcd/circuits/*.json, platform/sim/kcd/ui.js, platform/sim/kcd/kcd.css) */
/* AMTS · Trình mô phỏng mạch điều khiển điện (khóa Khí cụ điện, AMTS-ELE-001) · BỘ MÁY (engine)
   Tài liệu: docs/TRINH-MO-PHONG-KCD.md. Không phụ thuộc giao diện, chạy được trong Node (tests/kcd/test.js).

   Mô hình (giáo dục, KHÔNG phải công cụ tính toán điện thật):
   - Mạch điều khiển: các nhánh nối tiếp / song song giữa thanh nguồn (+) và (0). Mỗi lần cần biết “cuộn nào có điện”,
     bộ máy giải mạch bằng phương pháp điện thế nút với giá trị TƯƠNG ĐỐI (tiếp điểm đóng ≈ 0, tải = 1): chỉ để tìm đường
     dòng điện, phát hiện ngắn mạch (tải bị nối tắt) và hai tải nối tiếp; không ra ampe thật.
   - Trễ đơn vị (unit-delay, giống Mạch số Lab): mỗi “bước” mọi cuộn đang lệch (có điện mà chưa hút, mất điện mà chưa nhả)
     cùng đổi theo trạng thái cũ; tiếp điểm của thiết bị đổi ngay trong bước đó. Trạng thái lặp lại → chạy đua: chuyển sang
     đổi từng cuộn một, chọn ngẫu nhiên có hạt giống (seed) cố định; vẫn lặp → rung (chattering), dừng lan truyền.
   - Thời gian chỉ trôi khi gọi advance()/bước thời gian: timer, giai đoạn khởi động động cơ, relay nhiệt là sự kiện có giờ.
   - Mạch động lực 3 pha: theo dõi pha nào tới đầu cực nào (đúng/sai thứ tự pha, mất pha, chạm pha), không tính dòng thật.
     Dòng động cơ là bội số của dòng định mức In theo các hệ số GIẢ ĐỊNH ghi trong DEF bên dưới. */
(function(G){
"use strict";
const GS=1e4,LEAK=1e-9,VON=0.6,ISHORT=100,EPS=1e-9;
/* Hệ số giả định (ghi trong tài liệu, hiện trên giao diện). Mạch có thể đặt lại trong trường "params". */
const DEF={kStart:6,tStart:1.5,starF:1/3,lossF:Math.sqrt(3),tau:90,kTrip:1.15,resetTh:1.0,load:1,ir:1};
const LOGMAX=500,TRMAX=600,STEPMAX=400;
const SW_T=["pb","estop","sel","sw","ls"],COIL_T=["relay","contactor","ton","tof"];
const NAMEK={NO:"thường mở",NC:"thường đóng",dNO:"thường mở đóng trễ",dNC:"thường đóng mở trễ"};
function rng(seed){let s=seed>>>0;return()=>{s=(s+0x6D2B79F5)>>>0;let t=s;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}
const fmt=x=>{const r=Math.round(x*100)/100;return String(r).replace(".",",")};
const clone=o=>JSON.parse(JSON.stringify(o));

/* ---------- phân tích dữ liệu mạch ---------- */
function kindOf(D,term,id){
  const t=D.type;
  if(/^A1-A2$/.test(term)){if(COIL_T.includes(t))return"coil";throw Error(id+": "+term+" chỉ dùng cho cuộn hút")}
  if(/^X1-X2$/.test(term)){if(t==="lamp")return"lamp";throw Error(id+": X1-X2 chỉ dùng cho đèn")}
  if(t==="lamp")throw Error(id+": đèn dùng đầu cực X1-X2");
  if(t==="fuse"||t==="mcb")return"prot";
  if(t==="ol"){if(term==="95-96")return"NC";if(term==="97-98")return"NO";throw Error(id+": relay nhiệt chỉ có 95-96 (NC), 97-98 (NO)")}
  const m=/^(\d)(\d)-\1(\d)$/.exec(term);if(!m)throw Error(id+": đầu cực "+term+" không đúng dạng (ví dụ 13-14, 21-22, 55-56, 67-68)");
  const f=m[2]+m[3];
  if(f==="12")return"NC";if(f==="34")return"NO";
  if(t==="ton"||t==="tof"){if(f==="56")return"dNC";if(f==="78")return"dNO"}
  throw Error(id+": đầu cực "+term+" không hợp với thiết bị loại "+t);
}
function compile(C){
  const devs=C.devices||{},els=[],nodes=["+","0"];let rail=0;
  const nn=()=>{nodes.push("n"+nodes.length);return nodes.length-1};
  const sup=C.supply||{};
  if(sup.prot){if(!devs[sup.prot])throw Error("supply.prot: không có thiết bị "+sup.prot);rail=nn()}
  function leaf(x,a,b,p){const o=typeof x==="string"?{ref:x}:x;const [dev,term]=o.ref.split(":");const D=devs[dev];
    if(!D)throw Error("không có thiết bị "+dev+" (trong "+o.ref+")");
    const e={id:"e"+els.length,ref:o.ref,dev,term,kind:o.kind||kindOf(D,term,o.ref),a,b,p,label:o.label||""};els.push(e);return e}
  function build(x,a,b,p){
    if(Array.isArray(x)){if(!x.length)throw Error("nhánh rỗng");let cur=a;x.forEach((y,i)=>{const nx=i===x.length-1?b:nn();build(y,cur,nx,p);cur=nx});return}
    if(x&&x.par){x.par.forEach(br=>build(Array.isArray(br)?br:[br],a,b,p));return}
    leaf(x,a,b,p)}
  (C.paths||[]).forEach((P,p)=>build(P,rail,1,p));
  const coilOf={};els.forEach(e=>{if(e.kind==="coil"||e.kind==="lamp"){if(coilOf[e.dev])throw Error(e.dev+": chỉ được một cuộn / một đèn");coilOf[e.dev]=e.id}});
  Object.keys(devs).forEach(k=>{if(COIL_T.includes(devs[k].type)&&!coilOf[k]&&!(C.power&&powerDevs(C.power).includes(k)))throw Error(k+": thiếu cuộn A1-A2")});
  return{els,nodes,rail,coilOf,pnet:powerNet(C)};
}
function powerDevs(P){return[P.Q,P.F,P.M].concat(P.K?(Array.isArray(P.K)?P.K:Object.values(P.K)):[]).filter(Boolean)}
/* mạch động lực theo mẫu: dol (trực tiếp), rev (đảo chiều), yd (sao – tam giác). Cạnh: [id, nút a, nút b, thiết bị, loại, pha] */
function powerNet(C){const P=C.power;if(!P)return null;const E=[],L=["L1","L2","L3"];
  const Q=P.Q,F=P.F;
  const chainTo=(from,to,i)=>{let x=from;if(F){E.push(["F"+i,x,"c"+i,F,"heater",i]);x="c"+i}E.push(["W"+i,x,to,null,"wire",i])};
  for(let i=1;i<=3;i++)E.push(["Q"+i,L[i-1],"a"+i,Q,"cb",i]);
  if(P.type==="dol"){const K=Array.isArray(P.K)?P.K[0]:P.K;for(let i=1;i<=3;i++){E.push(["K"+i,"a"+i,"b"+i,K,"main",i]);chainTo("b"+i,["U","V","W"][i-1],i)}}
  else if(P.type==="rev"){const{F:KF,R:KR}=P.K;const sw=[3,2,1];
    for(let i=1;i<=3;i++){E.push(["KF"+i,"a"+i,"b"+i,KF,"main",i]);E.push(["KR"+i,"a"+i,"b"+sw[i-1],KR,"main",i]);chainTo("b"+i,["U","V","W"][i-1],i)}}
  else if(P.type==="yd"){const{main:KM,delta:KD,star:KY}=P.K;const T1=["U1","V1","W1"],T2d=["W2","U2","V2"];
    for(let i=1;i<=3;i++){E.push(["K"+i,"a"+i,"b"+i,KM,"main",i]);chainTo("b"+i,T1[i-1],i);E.push(["KD"+i,T1[i-1],T2d[i-1],KD,"main",i])}
    ["U2","V2","W2"].forEach((t,i)=>E.push(["KY"+(i+1),t,"Y",KY,"main",i+1]))}
  else throw Error("power.type phải là dol, rev hoặc yd");
  return{E:E.map(([id,a,b,dev,kind,ph])=>({id,a,b,dev,kind,ph})),type:P.type};
}

/* ---------- bộ máy ---------- */
function create(C,opt){
  opt=opt||{};const K=compile(C),devs=C.devices||{},PRM=Object.assign({},DEF,C.params||{});
  const R={rnd:rng(opt.seed==null?1:opt.seed)};
  const el=id=>K.els.find(e=>e.id===id);
  const name=k=>k+(devs[k]&&devs[k].name?" ("+devs[k].name+")":"");
  function init(){const d={};
    for(const k in devs){const D=devs[k],t=D.type;
      if(SW_T.includes(t))d[k]={act:D.init?1:0};
      else if(COIL_T.includes(t))d[k]={on:0,out:0,t0:null};
      else if(t==="ol")d[k]={trip:0,th:0,ir:D.ir||PRM.ir};
      else if(t==="fuse"||t==="mcb")d[k]={ok:1};
      else if(t==="cb3")d[k]={on:D.init===0?0:1,trip:0};
      else if(t==="lamp")d[k]={on:0};
      else if(t==="motor")d[k]={conn:"off",dir:0,phase:"stop",tStart:null,tOff:0,load:D.load||PRM.load,x:0};
      else throw Error(k+": loại thiết bị không biết: "+t)}
    return{t:0,n:0,sup:1,dev:d,f:{open:{},weld:{},stuck:{},burn:{},short:{},phase:{}},race:0,chatter:0,seen:[],scen:null,log:[],tr:[],pshort:0}}
  let S=init();
  /* ---- tiếp điểm, cuộn ---- */
  function actOf(k){const D=devs[k],s=S.dev[k];if(!D)return 0;
    if(SW_T.includes(D.type))return s.act;if(COIL_T.includes(D.type))return s.on||S.f.stuck[k]?1:0;if(D.type==="ol")return s.trip;return 0}
  function outOf(k){const D=devs[k],s=S.dev[k];if(D.type==="ton")return s.out||S.f.stuck[k]?1:0;if(D.type==="tof")return s.out||S.f.stuck[k]?1:0;return actOf(k)}
  function conducts(e){if(S.f.open[e.id])return false;
    switch(e.kind){case"coil":case"lamp":return!S.f.burn[e.dev];case"prot":return!!S.dev[e.dev].ok;
      case"NO":return S.f.weld[e.id]||actOf(e.dev)===1;case"NC":return!!(S.f.weld[e.id]||actOf(e.dev)===0);
      case"dNO":return S.f.weld[e.id]||outOf(e.dev)===1;case"dNC":return!!(S.f.weld[e.id]||outOf(e.dev)===0)}return false}
  /* ---- giải mạch điều khiển: điện thế nút, giá trị tương đối ---- */
  function solve(){const N=K.nodes.length,edges=[];
    const sp=C.supply&&C.supply.prot;
    if(sp&&S.dev[sp].ok)edges.push({a:0,b:K.rail,g:GS,id:"prot"});
    K.els.forEach(e=>{if(conducts(e))edges.push({a:e.a,b:e.b,g:(e.kind==="coil"||e.kind==="lamp")?1:GS,id:e.id});
      if(S.f.short[e.id])edges.push({a:e.a,b:e.b,g:GS,id:e.id+"~"})});
    const Vs=S.sup?1:0,idx=[];let m=0;for(let i=0;i<N;i++)idx.push(i<2?-1:m++);
    const A=[...Array(m)].map(()=>new Float64Array(m+1));
    for(let i=2;i<N;i++)A[idx[i]][idx[i]]+=LEAK;
    edges.forEach(({a,b,g})=>{const ia=idx[a],ib=idx[b];
      if(ia>=0)A[ia][ia]+=g;if(ib>=0)A[ib][ib]+=g;
      if(ia>=0&&ib>=0){A[ia][ib]-=g;A[ib][ia]-=g}
      if(ia>=0&&b===0)A[ia][m]+=g*Vs;if(ib>=0&&a===0)A[ib][m]+=g*Vs});
    for(let c=0;c<m;c++){let p=c;for(let r=c+1;r<m;r++)if(Math.abs(A[r][c])>Math.abs(A[p][c]))p=r;[A[c],A[p]]=[A[p],A[c]];
      const d=A[c][c];if(Math.abs(d)<1e-300)continue;for(let r=0;r<m;r++){if(r===c)continue;const f=A[r][c]/d;if(f)for(let k=c;k<=m;k++)A[r][k]-=f*A[c][k]}}
    const V=new Float64Array(N);V[0]=Vs;for(let i=2;i<N;i++){const r=idx[i];V[i]=A[r][m]/A[r][r]}
    const I={},on={};let isup=0;
    edges.forEach(x=>{const i=x.g*(V[x.a]-V[x.b]);I[x.id]=(I[x.id]||0)+i;if(x.a===0)isup+=i;if(x.b===0)isup-=i});
    K.els.forEach(e=>{if((e.kind==="coil"||e.kind==="lamp")&&conducts(e))on[e.id]=Math.abs(V[e.a]-V[e.b])>VON});
    return{V,I,on,isup,short:isup>ISHORT,live:i=>V[i]>0.5}}
  /* đường dòng điện tới một tải: lần ngược từ đầu trên của tải về thanh (+) theo cạnh có dòng chảy vào */
  function pathTo(sol,e){const out=[];let n=e.a,guard=0;
    while(n!==0&&guard++<200){if(n===K.rail&&C.supply.prot){out.unshift(C.supply.prot);break}
      let best=null,bi=0;
      K.els.forEach(x=>{if(x===e||!conducts(x))return;const i=sol.I[x.id]||0;
        if(x.b===n&&i>bi+1e-6){best=[x,x.a];bi=i}else if(x.a===n&&-i>bi+1e-6){best=[x,x.b];bi=-i}});
      if(!best)break;out.unshift(best[0].ref.replace(":"," "));n=best[1]}
    return out}
  /* vì sao tải mất điện: các phần tử đang hở trên cùng cột mà nếu đóng thì tải có điện */
  function blockers(e){const res=[],cand=K.els.filter(x=>x.p===e.p&&x!==e&&!conducts(x));
    const sp=C.supply&&C.supply.prot;
    if(!S.sup)return["mất nguồn điều khiển"];
    if(sp&&!S.dev[sp].ok)return[sp+" đã cắt"];
    if(S.f.burn[e.dev])return["cuộn "+e.dev+" bị cháy (hở)"];
    for(const x of cand){const keep=S.f.weld[x.id];S.f.weld[x.id]=1;const wasOpen=S.f.open[x.id];delete S.f.open[x.id];
      const ok=solve().on[e.id];S.f.weld[x.id]=keep;if(!keep)delete S.f.weld[x.id];if(wasOpen)S.f.open[x.id]=1;
      if(ok)res.push(x.ref.replace(":"," ")+(S.f.open[x.id]?" (dây đứt)":" mở"));if(res.length>=3)break}
    return res}
  function contactsText(k,after){const D=devs[k];const L=K.els.filter(e=>e.dev===k&&["NO","NC","dNO","dNC"].includes(e.kind));
    const inst=L.filter(e=>e.kind==="NO"||e.kind==="NC");
    const main=C.power&&D.type==="contactor"&&powerDevs(C.power).includes(k)?["tiếp điểm chính 1-2, 3-4, 5-6 "+(after?"đóng":"mở")]:[];
    return main.concat(inst.map(e=>e.term+" "+((e.kind==="NO")===!!after?"đóng":"mở"))).join(", ")}
  function log(kind,msg,dev){S.log.push({t:S.t,n:S.n,kind,msg,dev:dev||null});if(S.log.length>LOGMAX)S.log.splice(0,S.log.length-LOGMAX)}
  /* ---- cuộn nào đang lệch ---- */
  function pending(sol){const P=[];
    for(const k in K.coilOf){const D=devs[k];if(!COIL_T.includes(D.type))continue;const e=el(K.coilOf[k]);const want=sol.on[e.id]?1:0;
      if(want&&!S.dev[k].on&&mech(k).some(o=>actOf(o)))continue;
      if(want!==S.dev[k].on)P.push({k,want,e})}
    return P}
  const mech=k=>(C.mechInterlock||[]).filter(p=>p.includes(k)).map(p=>p[0]===k?p[1]:p[0]);
  function applyCoil(c,sol){const k=c.k,D=devs[k],s=S.dev[k],e=c.e;
    const why=c.why||[];
    s.on=c.want;
    if(c.want){const via=c.via||[],ct=contactsText(k,1);
      let m=k+" hút: cuộn A1-A2 có điện"+(via.length?" qua "+via.join(" → "):"")+".";
      if(D.type==="ton"){s.t0=S.t;s.out=0;m+=" Bắt đầu đếm "+fmt(D.T)+" s (trễ đóng, ON-delay)."+(ct?" Tiếp điểm tức thời: "+ct+".":"")}
      else if(D.type==="tof"){s.t0=null;s.out=1;m+=" Tiếp điểm trễ đổi ngay (OFF-delay)."+(ct?" Tiếp điểm tức thời: "+ct+".":"")}
      else m+=ct?" Tiếp điểm: "+ct+".":"";
      if(S.f.stuck[k])m+=" (Thiết bị đang bị kẹt ở vị trí hút.)";
      log("on",m,k)}
    else{let m=k+" nhả: cuộn mất điện"+(why.length?" vì "+why.join(", "):"")+".";const ct=contactsText(k,0);
      if(D.type==="ton"){s.out=0;s.t0=null;m+=" Timer về 0, tiếp điểm trễ trở về ngay."}
      else if(D.type==="tof"){s.t0=S.t;m+=" Bắt đầu đếm "+fmt(D.T)+" s rồi tiếp điểm trễ mới trở về."}
      if(S.f.stuck[k])m+=" Nhưng lõi thép bị kẹt (lỗi chèn): mọi tiếp điểm vẫn ở vị trí hút!";else if(ct)m+=" Tiếp điểm trở về: "+ct+".";
      log("off",m,k)}
  }
  /* ---- mạch động lực ---- */
  function pclosed(x){if(x.kind==="cb"){const s=S.dev[x.dev];return s.on&&!s.trip}
    if(x.kind==="main")return actOf(x.dev)===1;if(x.kind==="wire"||x.kind==="heater")return!S.f.phase[x.ph];return false}
  function pstate(){const N=K.pnet;if(!N)return null;const par={};const f=a=>{while(par[a]!=null&&par[a]!==a)a=par[a];return a};
    const nodes=new Set(["L1","L2","L3"]);N.E.forEach(x=>{nodes.add(x.a);nodes.add(x.b)});nodes.forEach(n=>par[n]=n);
    N.E.forEach(x=>{if(pclosed(x)){const ra=f(x.a),rb=f(x.b);if(ra!==rb)par[ra]=rb}});
    const ph={};nodes.forEach(n=>ph[n]=[]);["L1","L2","L3"].forEach((L,i)=>{const r=f(L);nodes.forEach(n=>{if(f(n)===r)ph[n].push(i+1)})});
    let short=null;nodes.forEach(n=>{if(ph[n].length>1&&!short)short=ph[n].map(i=>"L"+i).join("–")});
    if(short)return{ph,short,conn:"short",dir:0,f};
    const one=t=>ph[t].length===1?ph[t][0]:0;let conn="off",dir=0;
    const perm=a=>{const s=a.join("");return["123","231","312"].includes(s)?1:["132","213","321"].includes(s)?-1:0};
    if(N.type==="yd"){const a=["U1","V1","W1"].map(one),b=["U2","V2","W2"].map(one);
      const starY=f("U2")===f("V2")&&f("V2")===f("W2")&&!b.some(x=>x);
      if(a.every(x=>x)&&new Set(a).size===3){if(starY){conn="star";dir=perm(a)}else if(b.every(x=>x)&&[0,1,2].every(i=>a[i]!==b[i])){conn="delta";dir=perm(a)}else if(!b.some(x=>x))conn="off";else conn="loss"}
      else if(a.filter(x=>x).length>=1)conn="loss"}
    else{const a=["U","V","W"].map(one),n=new Set(a.filter(x=>x)).size;
      if(n===3){conn="run";dir=perm(a)}else if(n===2)conn="loss"}
    return{ph,short:null,conn,dir,f}}
  const MOT=()=>C.power&&C.power.M;
  function motorX(){const k=MOT();if(!k)return 0;const m=S.dev[k];
    if(m.conn==="off"||m.conn==="short")return 0;
    const locked=m.load==="ket";
    if(m.phase==="locked")return PRM.kStart;
    if(m.phase==="start")return PRM.kStart*(m.conn==="star"?PRM.starF:1);
    if(m.conn==="loss")return(locked?PRM.kStart:m.load)*PRM.lossF;
    return locked?PRM.kStart:m.load}
  function power(){const k=MOT();if(!k)return;const st=pstate(),m=S.dev[k],prev={conn:m.conn,dir:m.dir,phase:m.phase};
    S.pshort=st.short?1:0;
    const conn=st.short?"off":st.conn,dir=st.short?0:st.dir;
    if(conn==="off"){if(m.conn!=="off"){m.tOff=S.t;m.lastPhase=m.phase}m.conn="off";m.dir=0;m.phase="stop"}
    else if(conn==="loss"){if(m.conn!=="loss"){m.phase=(m.phase==="run"||(m.conn==="off"&&m.tOff===S.t&&m.lastPhase==="run"))?"run":"locked"}m.conn="loss";m.dir=0}
    else{const fresh=m.conn==="off"||m.conn==="loss";
      if(fresh){const keep=m.conn==="off"&&m.tOff===S.t&&m.lastPhase==="run"&&m.lastDir===dir;
        m.phase=keep?"run":"start";if(!keep)m.tStart=S.t}
      else if(m.dir!==dir){m.phase="start";m.tStart=S.t}
      if(m.load==="ket"&&m.phase!=="start"){m.phase="locked"}
      m.conn=conn;m.dir=dir;m.lastDir=dir}
    if(m.conn!=="off")m.lastDir=m.dir||m.lastDir;
    if(prev.conn!==m.conn||prev.dir!==m.dir||prev.phase!==m.phase)log("motor",k+": "+motorText(m),k);
    m.x=motorX()}
  function motorText(m){if(m.conn==="off")return"dừng (không có điện)";
    if(m.conn==="loss")return m.phase==="locked"?"chỉ có 2 pha (mất pha): không tự khởi động được, kêu ù, dòng lớn (giả định "+fmt(PRM.kStart)+" × In)":"mất pha khi đang chạy: vẫn quay nhưng dòng tăng (giả định "+fmt(PRM.lossF)+" × dòng tải)";
    const d=m.dir>0?"quay thuận":"quay ngược",c=m.conn==="star"?", nối sao (Y)":m.conn==="delta"?", nối tam giác (Δ)":"";
    if(m.phase==="locked")return d+c+" nhưng rôto bị kẹt: dòng lớn (giả định "+fmt(PRM.kStart)+" × In)";
    return d+c+(m.phase==="start"?", đang khởi động (giả định "+fmt(PRM.tStart)+" s, dòng "+fmt(PRM.kStart*(m.conn==="star"?PRM.starF:1))+" × In)":", chạy ổn định")}
  /* ---- relay nhiệt: mô hình nhiệt bậc nhất (giả định) ---- */
  function olX(k){const m=MOT();if(!m||!C.power||C.power.F!==k)return 0;return S.dev[m].x/S.dev[k].ir}
  function heat(h){if(h<=0)return;for(const k in devs)if(devs[k].type==="ol"){const s=S.dev[k],x=olX(k),inf=x*x,tau=devs[k].tau||PRM.tau;s.th=inf+(s.th-inf)*Math.exp(-h/tau)}}
  function thTrip(k){const kt=devs[k].kTrip||PRM.kTrip;return kt*kt}
  /* ---- sự kiện có giờ ---- */
  function events(){const L=[];
    for(const k in devs){const D=devs[k],s=S.dev[k];
      if(D.type==="ton"&&s.on&&!s.out&&s.t0!=null)L.push({t:s.t0+D.T,k,kind:"ton"});
      if(D.type==="tof"&&!s.on&&s.out&&s.t0!=null)L.push({t:s.t0+D.T,k,kind:"tof"});
      if(D.type==="ol"&&!s.trip){const x=olX(k),inf=x*x,tt=thTrip(k),tau=D.tau||PRM.tau;
        if(inf>tt+EPS){const dt=s.th>=tt?0:tau*Math.log((inf-s.th)/(inf-tt));L.push({t:S.t+dt,k,kind:"ol",x})}}
      if(D.type==="motor"&&s.phase==="start"&&s.tStart!=null)L.push({t:s.tStart+PRM.tStart,k,kind:"mstart"})}
    L.sort((a,b)=>a.t-b.t);return L}
  function fire(ev){const D=devs[ev.k],s=S.dev[ev.k];
    if(ev.kind==="ton"){s.out=1;log("timer",ev.k+" hết thời gian đặt "+fmt(D.T)+" s: tiếp điểm trễ đổi trạng thái"+delayedText(ev.k,1)+".",ev.k)}
    else if(ev.kind==="tof"){s.out=0;s.t0=null;log("timer",ev.k+" đếm xong "+fmt(D.T)+" s sau khi mất điện: tiếp điểm trễ trở về"+delayedText(ev.k,0)+".",ev.k)}
    else if(ev.kind==="mstart"){s.phase="run";s.x=motorX();log("motor",ev.k+": hết giai đoạn khởi động, dòng về theo tải ("+(s.load==="ket"?"kẹt":fmt(s.load)+" × In")+", giả định).",ev.k);power()}
    else if(ev.kind==="ol"){s.trip=1;s.th=Math.max(s.th,thTrip(ev.k));log("trip",ev.k+" (relay nhiệt) tác động: dòng ≈ "+fmt(ev.x)+" × dòng chỉnh Ir kéo dài làm nóng thanh lưỡng kim (mô hình giả định). Tiếp điểm 95-96 mở, 97-98 đóng.",ev.k)}
    S.n++;S.seen=[];S.race=0;S.chatter=0;power();lamps(solve());rec()}
  function delayedText(k,on){const L=K.els.filter(e=>e.dev===k&&(e.kind==="dNO"||e.kind==="dNC"));return L.length?" ("+L.map(e=>e.term+" "+((e.kind==="dNO")===!!on?"đóng":"mở")).join(", ")+")":""}
  /* ---- lan truyền một bước ---- */
  function lamps(sol,quiet){for(const k in devs)if(devs[k].type==="lamp"){const e=el(K.coilOf[k]);if(!e)continue;const v=sol.on[e.id]?1:0;
    if(v!==S.dev[k].on){S.dev[k].on=v;if(!quiet)log("lamp",k+(devs[k].name?" ("+devs[k].name+")":"")+(v?" sáng":" tắt")+".",k)}}}
  function keyOf(){const o=[];for(const k in devs){const s=S.dev[k];if("on"in s&&COIL_T.includes(devs[k].type))o.push(s.on,s.out)}return o.join("")}
  function propStep(){if(S.chatter)return null;
    const sol=solve();const sp=C.supply&&C.supply.prot;
    if(sol.short&&sp&&S.dev[sp].ok){S.n++;S.dev[sp].ok=0;
      log("trip",sp+(devs[sp].type==="fuse"?" (cầu chì) đứt":" (MCB) cắt")+": ngắn mạch trong mạch điều khiển (có đường từ (+) về (0) không qua tải nào). Toàn bộ mạch điều khiển mất điện.",sp);
      after();return"prop"}
    const P=pending(sol);
    for(const k in K.coilOf){const s=S.dev[k];if(!COIL_T.includes(devs[k].type))continue;const w=sol.on[K.coilOf[k]]&&!s.on&&mech(k).some(o=>actOf(o));
      if(w&&!s.blocked)log("block",k+" có điện nhưng bị khóa liên động cơ khí với "+mech(k).filter(o=>actOf(o)).join(", ")+" nên không hút được.",k);s.blocked=w?1:0}
    if(!P.length){
      if(S.pshort&&C.power){S.n++;const q=C.power.Q,st=pstate();S.dev[q].trip=1;
        log("trip","Ngắn mạch giữa các pha "+st.short+" ở mạch động lực: "+q+" cắt tức thời (cắt từ, mô hình). Thường do hai contactor đảo chiều cùng đóng hoặc tiếp điểm bị dính.",q);
        after();return"prop"}
      if(S.race){log("ok","Mạch ổn định sau chạy đua: thiết bị nào đổi trước là do ngẫu nhiên trong mô hình (ngoài đời không đoán trước được: tùy thiết bị nhanh hơn, và với contactor đảo chiều có thể cả hai cùng kịp đóng).");S.race=0}
      S.seen=[];return null}
    const key=keyOf();
    if(S.seen.includes(key)){
      if(S.race){S.chatter=1;S.n++;log("chatter","Mạch rung (chattering): các cuộn "+P.map(c=>c.k).join(", ")+" cứ hút rồi nhả liên tục, không bao giờ ổn định. Mô phỏng dừng lan truyền; hãy sửa mạch hoặc thao tác lại.");rec();return"chatter"}
      S.race=1;S.seen=[];log("race","Chạy đua: "+P.map(c=>c.k).join(" và ")+" cùng đổi trạng thái rồi lại làm nhau đổi ngược, trạng thái lặp lại. Từ đây mô phỏng cho từng cuộn đổi một, chọn ngẫu nhiên (ngoài đời không đoán trước được; không được dựa vào chạy đua để bảo vệ mạch).")}
    S.seen.push(key);if(S.seen.length>STEPMAX){S.chatter=1;log("chatter","Quá "+STEPMAX+" bước mà chưa ổn định: dừng lan truyền.");return"chatter"}
    S.n++;
    let todo=P;if(S.race)todo=[P[Math.floor(R.rnd()*P.length)]];
    else if(C.mechInterlock){const ups=P.filter(c=>c.want);(C.mechInterlock||[]).forEach(([a,b])=>{const A=ups.find(c=>c.k===a),B=ups.find(c=>c.k===b);
      if(A&&B){const lose=R.rnd()<0.5?A:B;todo=todo.filter(c=>c!==lose);log("race",a+" và "+b+" cùng có điện; khóa liên động cơ khí chỉ cho một cái hút: "+(lose===A?b:a)+" hút trước (chọn ngẫu nhiên trong mô hình).")}})}
    todo.forEach(c=>{if(c.want)c.via=pathTo(sol,c.e);else c.why=blockers(c.e)});
    todo.forEach(c=>applyCoil(c,sol));
    if(todo.length>1&&C.power&&C.power.type==="rev"){const{F,R:RR}=C.power.K;if(actOf(F)&&actOf(RR)&&pending(solve()).length)log("warn","⚠ Trong bước này "+F+" và "+RR+" cùng có lệnh hút. Trên mạch thật, nếu tiếp điểm chính của cả hai kịp đóng sẽ chạm pha: mô hình không quyết định được, vì vậy mạch đảo chiều cần thêm khóa cơ khí.")}
    after();return"prop"}
  function after(){lamps(solve());power();rec()}
  function rec(){const v={};sigs().forEach(s=>v[s.id]=s.get());S.tr.push({t:S.t,n:S.n,v});if(S.tr.length>TRMAX)S.tr.splice(0,S.tr.length-TRMAX)}
  let SIG=null;
  function sigs(){if(SIG)return SIG;const L=[];const want=C.trace;
    const add=(id,label,get,kind)=>L.push({id,label,get,kind:kind||"bit"});
    for(const k in devs){const D=devs[k],t=D.type;
      if(SW_T.includes(t))add(k,k,()=>S.dev[k].act);
      else if(COIL_T.includes(t)){if(K.coilOf[k])add(k,k+(t==="ton"||t==="tof"?" cuộn":""),()=>actOf(k));if(t==="ton"||t==="tof")add(k+".t",k+" trễ",()=>outOf(k))}
      else if(t==="lamp")add(k,k,()=>S.dev[k].on);
      else if(t==="ol")add(k,k+" trip",()=>S.dev[k].trip);
      else if(t==="motor")add(k,k,()=>S.dev[k].conn==="off"?0:S.dev[k].dir===-1?-1:S.dev[k].conn==="loss"?0.5:1,"motor")}
    SIG=want?want.map(id=>L.find(s=>s.id===id)).filter(Boolean):L;return SIG}
  /* ---- thao tác của học viên ---- */
  function act(a){
    if(Array.isArray(a.dev)){S.seen=[];S.race=0;S.chatter=0;const ms=[];
      a.dev.forEach(k=>{const D=devs[k];if(!D)throw Error("không có "+k);if(a.do==="press")S.dev[k].act=D.type==="pb"&&D.latch?S.dev[k].act^1:1;else if(a.do==="release")S.dev[k].act=0;else throw Error("nhiều thiết bị cùng lúc chỉ dùng press/release");ms.push(name(k))});
      S.n++;log("user","Bạn "+(a.do==="press"?"nhấn":"nhả")+" cùng lúc: "+ms.join(" và ")+".");power();lamps(solve());rec();return true}
    const k=a.dev,D=devs[k],s=k?S.dev[k]:null;let m="";
    if(k&&!D)throw Error("không có thiết bị "+k);
    S.seen=[];S.race=0;S.chatter=0;
    const nm=k?name(k):"";
    switch(a.do){
      case"press":if(!D)throw Error("không có "+k);
        if(D.type==="pb"&&D.latch){s.act^=1;m="Bạn nhấn "+nm+" (nút tự giữ vị trí): "+(s.act?"giữ ở vị trí nhấn":"trở về")}
        else{s.act=1;m=D.type==="estop"?"Bạn đập nút dừng khẩn "+nm+": nút tự khóa ở vị trí nhấn":D.type==="ls"?"Cữ hành trình "+nm+" bị tác động":"Bạn nhấn giữ "+nm}break;
      case"release":if(D.type==="estop"){s.act=0;m="Bạn xoay nhả nút dừng khẩn "+nm+" (nhả nút không làm máy tự chạy lại)"}else{s.act=0;m=D.type==="ls"?"Cữ hành trình "+nm+" trở về":"Bạn nhả "+nm}break;
      case"toggle":
        if(SW_T.includes(D.type)){if(D.type==="estop"){return act({do:s.act?"release":"press",dev:k})}if(D.type==="pb"&&!D.latch){return act({do:s.act?"release":"press",dev:k})}s.act^=1;m="Bạn chuyển "+nm+" sang vị trí "+(s.act?"1":"0")}
        else if(D.type==="cb3"){if(s.trip){s.trip=0;s.on=1;m="Bạn đóng lại "+nm+" sau khi cắt"}else{s.on^=1;m="Bạn "+(s.on?"đóng":"cắt")+" "+nm}}
        else if(D.type==="mcb"){s.ok^=1;m="Bạn "+(s.ok?"đóng":"cắt")+" "+nm}
        else if(D.type==="fuse"){if(!s.ok){s.ok=1;m="Bạn thay cầu chì "+nm}else{m=nm+" vẫn tốt"}}
        else throw Error(k+": không bật/tắt được");break;
      case"reset":
        if(D.type==="ol"){if(!s.trip)m=nm+" chưa tác động, không cần reset";else if(s.th>(devs[k].resetTh||PRM.resetTh)){m="Bạn bấm reset "+nm+" nhưng thanh lưỡng kim chưa nguội (mô hình giả định): chưa reset được, chờ thêm";log("user",m,k);rec();return false}
          else{s.trip=0;m="Bạn reset "+nm+": 95-96 đóng lại, 97-98 mở. Contactor không tự hút lại vì mạch tự giữ đã nhả"}}
        else if(D.type==="fuse"){s.ok=1;m="Bạn thay cầu chì "+nm}
        else if(D.type==="mcb"){s.ok=1;m="Bạn đóng lại "+nm}
        else if(D.type==="cb3"){s.trip=0;s.on=1;m="Bạn đóng lại "+nm}
        else throw Error(k+": không reset được");break;
      case"supply":S.sup=a.on?1:0;m=a.on?"Có điện trở lại ở nguồn điều khiển":"Mất điện nguồn điều khiển";break;
      case"load":{const mk=MOT();S.dev[mk].load=a.val;m="Đặt tải động cơ: "+(a.val==="ket"?"rôto bị kẹt":fmt(a.val)+" × In")+" (giả định)";break}
      case"ir":s.ir=a.val;m="Chỉnh dòng tác động "+nm+": Ir = "+fmt(a.val)+" × In";break;
      case"fault":return fault(a.kind,a.target,a.on!==false);
      case"clear":S.f={open:{},weld:{},stuck:{},burn:{},short:{},phase:{}};m="Gỡ hết lỗi đã chèn";break;
      default:throw Error("thao tác không biết: "+a.do)}
    S.n++;log("user",m+".",k);power();lamps(solve());rec();return true}
  const FAULTS={open:"Đứt dây",weld:"Dính tiếp điểm",stuck:"Kẹt lõi contactor",burn:"Cháy cuộn dây / bóng đèn",short:"Ngắn mạch tải",trip:"Relay nhiệt tác động",phase:"Mất pha"};
  function fault(kind,target,on){S.n++;let m;
    if(typeof target==="string"&&target.includes(":")){const e=K.els.find(x=>x.ref===target);if(!e)throw Error("không có phần tử "+target);target=e.id}
    if(kind==="trip"){const s=S.dev[target];s.trip=1;s.th=Math.max(s.th,thTrip(target));m="Chèn lỗi: "+target+" tác động (giả lập quá tải): 95-96 mở, 97-98 đóng"}
    else{const box=S.f[kind];if(!box)throw Error("lỗi không biết: "+kind);if(on)box[target]=1;else delete box[target];
      const what=K.els.find(e=>e.id===target);const tn=what?what.ref:kind==="phase"?"pha L"+target:target;
      m=(on?"Chèn lỗi: ":"Gỡ lỗi: ")+FAULTS[kind].toLowerCase()+" tại "+tn}
    S.seen=[];S.race=0;S.chatter=0;log("fault",m+".",null);power();lamps(solve());rec();return true}
  /* ---- kịch bản ---- */
  function load(sc){S.scen=sc?{a:clone(sc.steps||sc),i:0,left:null,fails:[]}:null}
  function scenNext(){const Q=S.scen;if(!Q||Q.i>=Q.a.length)return null;return Q.a[Q.i]}
  function check(ex,where){const bad=[];for(const k in ex){const v=ex[k];let got;
      if(k==="t")got=S.t;else if(devs[k]&&devs[k].type==="motor"){const m=S.dev[k];got=m.conn==="off"?"stop":m.conn==="loss"?"loss":m.conn==="star"?"star":m.conn==="delta"?"delta":m.dir>0?"fwd":"rev";if(v==="run"&&(got==="fwd"||got==="rev"))got="run"}
      else if(/\.t$/.test(k))got=outOf(k.slice(0,-2));
      else if(devs[k]){const D=devs[k],s=S.dev[k];got=D.type==="lamp"?s.on:D.type==="ol"?s.trip:D.type==="fuse"||D.type==="mcb"?s.ok:D.type==="cb3"?(s.on&&!s.trip?1:0):SW_T.includes(D.type)?s.act:actOf(k)}
      else if(k==="chatter")got=S.chatter;else if(k==="race")got=S.race;
      else if(k==="one"){got=v.filter(x=>actOf(x)).length;if(got!==1)bad.push(where+": phải có đúng một trong "+v.join(", ")+" hút (đang có "+got+")");continue}
      else{bad.push(where+": không biết "+k);continue}
      if(k==="t"?Math.abs(got-v)>1e-6:got!==v)bad.push(where+": "+k+" = "+JSON.stringify(got)+", mong đợi "+JSON.stringify(v))}
    return bad}
  /* ---- một bước: lan truyền → thao tác trong kịch bản → sự kiện có giờ ---- */
  function step(){const r=propStep();if(r)return{type:r};
    const a=scenNext();
    if(a){const Q=S.scen;
      if(a.wait!=null){if(Q.left==null)Q.left=a.wait;const tEnd=S.t+Q.left,ev=events()[0];
        if(ev&&ev.t<=tEnd+EPS){heat(ev.t-S.t);Q.left=tEnd-ev.t;S.t=ev.t;fire(ev);return{type:"time"}}
        heat(Q.left);S.t=tEnd;Q.left=null;Q.i++;S.n++;log("wait","Chờ "+fmt(a.wait)+" s (t = "+fmt(S.t)+" s).");power();rec();if(a.expect)Q.fails.push(...check(a.expect,"t="+fmt(S.t)));return{type:"time"}}
      Q.i++;
      if(a.expect&&!a.do){Q.fails.push(...check(a.expect,"bước "+Q.i+(a.label?" ("+a.label+")":"")));return step()}
      if(a.note){log("note",a.note);if(!a.do){rec();return{type:"note"}}}
      act(a);if(a.expect)Q.pendingExpect={ex:a.expect,at:"sau bước "+Q.i};return{type:"action"}}
    const ev=events()[0];
    if(ev&&(S.scen==null||S.scen.i>=S.scen.a.length)){heat(ev.t-S.t);S.t=ev.t;fire(ev);return{type:"time"}}
    return{type:"idle"}}
  function settle(max){let n=0;while(n++<(max||STEPMAX)){const r=propStep();if(!r||r==="chatter")break}flushExpect()}
  function flushExpect(){const Q=S.scen;if(Q&&Q.pendingExpect){Q.fails.push(...check(Q.pendingExpect.ex,Q.pendingExpect.at));Q.pendingExpect=null}}
  /* chạy hết kịch bản (kiểm thử): sau mỗi thao tác cho mạch ổn định rồi mới so “expect” */
  function runScenario(sc,max){load(sc);let n=0;
    while(n++<(max||5000)){const before=S.scen.i;const r=propStep();if(r){if(r==="chatter")flushExpect();continue}
      flushExpect();if(S.scen.i>=S.scen.a.length)break;
      const a=scenNext();
      if(a.wait!=null){const Q=S.scen;if(Q.left==null)Q.left=a.wait;const tEnd=S.t+Q.left,ev=events()[0];
        if(ev&&ev.t<=tEnd+EPS){heat(ev.t-S.t);Q.left=tEnd-ev.t;S.t=ev.t;fire(ev);continue}
        heat(Q.left);S.t=tEnd;Q.left=null;Q.i++;S.n++;log("wait","Chờ "+fmt(a.wait)+" s (t = "+fmt(S.t)+" s).");power();rec();
        settle();if(a.expect)Q.fails.push(...check(a.expect,"t="+fmt(S.t)));continue}
      step();if(S.scen.i===before)break}
    flushExpect();return S.scen.fails}
  /* chạy theo thời gian thực (giao diện, chế độ tự do): tiến đồng hồ dt giây, xử lý mọi sự kiện, mỗi sự kiện cho mạch ổn định */
  function advance(dt){const tEnd=S.t+dt;let guard=0;
    while(guard++<1000){settle();const ev=events()[0];if(!ev||ev.t>tEnd+EPS)break;heat(ev.t-S.t);S.t=ev.t;fire(ev)}
    if(tEnd>S.t){heat(tEnd-S.t);S.t=tEnd}}
  /* ---- dữ liệu cho phần vẽ ---- */
  function view(){const sol=solve(),pst=pstate();
    const els=K.els.map(e=>({id:e.id,ref:e.ref,dev:e.dev,term:e.term,kind:e.kind,p:e.p,closed:conducts(e),
      cur:Math.abs(sol.I[e.id]||0)>1e-3,live:sol.live(e.a)||sol.live(e.b),liveA:sol.live(e.a),liveB:sol.live(e.b),on:!!sol.on[e.id],fault:faultsOn(e)}));
    let pw=null;if(pst){const m=S.dev[MOT()];const cur=m&&m.x>0;
      pw=K.pnet.E.map(x=>{const cl=pclosed(x),la=pst.ph[x.a].length>0,lb=pst.ph[x.b].length>0;
        return{id:x.id,dev:x.dev,kind:x.kind,ph:x.ph,closed:cl,live:la||lb,cur:cl&&cur&&la&&(lb||x.b==="Y"),phA:pst.ph[x.a],phB:pst.ph[x.b],fault:!!S.f.phase[x.ph]&&(x.kind==="wire")}})}
    return{t:S.t,n:S.n,sup:S.sup,els,pw,pshort:pst&&pst.short,dev:S.dev,f:S.f,race:S.race,chatter:S.chatter,
      pending:pending(sol).map(c=>({k:c.k,want:c.want})),events:events(),isup:sol.isup,short:sol.short}}
  function faultsOn(e){const L=[];for(const k of["open","weld","short"])if(S.f[k][e.id])L.push(k);if(S.f.burn[e.dev]&&(e.kind==="coil"||e.kind==="lamp"))L.push("burn");return L}
  function stable(){return!pending(solve()).length&&!(S.pshort&&C.power&&!S.chatter)}
  function boot(){power();lamps(solve(),true);S.log=[];rec()}
  boot();
  return{C,K,PRM,FAULTS,get S(){return S},set S(v){S=v},snapshot:()=>clone(S),restore:v=>{S=clone(v)},
    reset:()=>{S=init();boot()},act,fault,step,settle,advance,load,runScenario,view,solve,events,pending:()=>pending(solve()),
    stable,actOf,outOf,sigs,check,motorText:()=>MOT()?motorText(S.dev[MOT()]):"",thTrip,olX,name,nextAction:scenNext}
}
const API={create,compile,DEF,circuits:{},register(c){API.circuits[c.id]=c;return c},version:"0.1.0"};
if(typeof module!=="undefined"&&module.exports)module.exports=API;else G.KcdEngine=API;
})(typeof window!=="undefined"?window:globalThis);
KcdEngine.register({"id":"den-cong-tac","title":"Công tắc, nút nhấn NO/NC, selector và đèn","sims":["AMTS-ELE-001-SIM15"],"summary":"Năm nhánh độc lập giữa (+24 V) và (0 V). Công tắc giữ nguyên vị trí sau khi gạt; nút nhấn chỉ đổi trạng thái khi đang nhấn; selector 2 vị trí có một tiếp điểm thường đóng (21-22) và một thường mở (13-14).","supply":{"kind":"DC","plus":"+24 V","minus":"0 V","label":"Nguồn điều khiển 24 VDC (giả định)","prot":"F0"},"devices":{"F0":{"type":"fuse","name":"Cầu chì mạch điều khiển"},"S1":{"type":"sw","name":"Công tắc"},"S2":{"type":"pb","name":"Nút NO","color":"green"},"S3":{"type":"pb","name":"Nút NC","color":"red"},"S4":{"type":"sel","name":"Selector 0–1"},"H1":{"type":"lamp","name":"Đèn công tắc","color":"yellow"},"H2":{"type":"lamp","name":"Đèn nút NO","color":"green"},"H3":{"type":"lamp","name":"Đèn nút NC","color":"red"},"H4":{"type":"lamp","name":"Đèn vị trí 0","color":"white"},"H5":{"type":"lamp","name":"Đèn vị trí 1","color":"blue"}},"paths":[["S1:13-14","H1:X1-X2"],["S2:13-14","H2:X1-X2"],["S3:11-12","H3:X1-X2"],["S4:21-22","H4:X1-X2"],["S4:13-14","H5:X1-X2"]],"scenarios":[{"label":"Gạt công tắc, nhấn và nhả nút","note":"Công tắc giữ vị trí; nút NO chỉ đóng khi đang nhấn; nút NC mở khi đang nhấn. Đoán trước đèn nào sáng ở mỗi bước.","steps":[{"expect":{"H1":0,"H2":0,"H3":1,"H4":1,"H5":0},"label":"lúc đầu"},{"do":"toggle","dev":"S1","expect":{"H1":1}},{"do":"press","dev":"S2","expect":{"H2":1}},{"do":"release","dev":"S2","expect":{"H2":0}},{"do":"press","dev":"S3","expect":{"H3":0}},{"do":"release","dev":"S3","expect":{"H3":1}},{"do":"toggle","dev":"S4","expect":{"H4":0,"H5":1}},{"do":"toggle","dev":"S1","expect":{"H1":0}}]},{"label":"Lỗi: bóng đèn H2 cháy","note":"Nút vẫn đóng mạch nhưng đèn không sáng. Phân biệt lỗi ở nút và lỗi ở tải.","steps":[{"do":"fault","kind":"burn","target":"H2"},{"do":"press","dev":"S2","expect":{"S2":1,"H2":0}},{"do":"release","dev":"S2"}]},{"label":"Lỗi: ngắn mạch qua đèn H1","note":"Đèn bị nối tắt: khi công tắc đóng, (+) nối thẳng về (0) không qua tải, cầu chì F0 đứt và cả mạch mất điện.","steps":[{"do":"fault","kind":"short","target":"H1:X1-X2"},{"do":"toggle","dev":"S1","expect":{"F0":0,"H3":0,"H4":0}},{"do":"toggle","dev":"S1"},{"do":"fault","kind":"short","target":"H1:X1-X2","on":false},{"do":"reset","dev":"F0","expect":{"F0":1,"H3":1}}]}]});
KcdEngine.register({"id":"nut-relay","title":"Nút nhấn điều khiển relay","sims":["AMTS-ELE-001-SIM16"],"summary":"Nút S1 cấp điện cho cuộn K1 (A1-A2). Khi K1 hút, tiếp điểm thường mở 13-14 đóng (H1 sáng) và tiếp điểm thường đóng 21-22 mở (H2 tắt). Nhả nút thì K1 nhả: mạch không có tự giữ.","supply":{"kind":"DC","plus":"+24 V","minus":"0 V","label":"Nguồn điều khiển 24 VDC (giả định)","prot":"F0"},"devices":{"F0":{"type":"fuse","name":"Cầu chì mạch điều khiển"},"S1":{"type":"pb","name":"Nút nhấn","color":"green"},"K1":{"type":"relay","name":"Relay trung gian"},"H1":{"type":"lamp","name":"Đèn qua 13-14","color":"green"},"H2":{"type":"lamp","name":"Đèn qua 21-22","color":"red"}},"paths":[["S1:13-14","K1:A1-A2"],["K1:13-14","H1:X1-X2"],["K1:21-22","H2:X1-X2"]],"scenarios":[{"label":"Nhấn rồi nhả nút","note":"Quan sát thứ tự: nút đóng → cuộn K1 có điện → K1 hút → hai tiếp điểm đổi cùng lúc → đèn đổi.","steps":[{"expect":{"K1":0,"H1":0,"H2":1},"label":"lúc đầu"},{"do":"press","dev":"S1","expect":{"K1":1,"H1":1,"H2":0}},{"do":"release","dev":"S1","expect":{"K1":0,"H1":0,"H2":1}}]},{"label":"Lỗi: cuộn K1 bị cháy","note":"Nhấn nút nhưng relay không hút. Đèn vẫn như lúc nghỉ: lỗi ở cuộn hoặc ở dây tới cuộn.","steps":[{"do":"fault","kind":"burn","target":"K1"},{"do":"press","dev":"S1","expect":{"K1":0,"H1":0,"H2":1}},{"do":"release","dev":"S1"}]},{"label":"Lỗi: tiếp điểm 13-14 bị dính","note":"Tiếp điểm dính luôn đóng, nên H1 sáng cả khi relay đang nghỉ.","steps":[{"do":"fault","kind":"weld","target":"K1:13-14","expect":{"K1":0,"H1":1,"H2":1}}]}]});
KcdEngine.register({"id":"tu-giu","title":"Start/Stop tự duy trì (tự giữ)","sims":["AMTS-ELE-001-SIM05","AMTS-ELE-001-SIM17"],"summary":"Tiếp điểm phụ KM1 13-14 mắc song song với nút Start S2: sau khi KM1 hút, dòng đi qua 13-14 nên nhả Start mà KM1 vẫn giữ. Stop S1 là nút thường đóng mắc nối tiếp: nhấn Stop là cắt cuộn. Mất điện thì KM1 nhả và không tự hút lại khi có điện.","supply":{"kind":"DC","plus":"+24 V","minus":"0 V","label":"Nguồn điều khiển 24 VDC (giả định)","prot":"F0"},"devices":{"F0":{"type":"fuse","name":"Cầu chì mạch điều khiển"},"S1":{"type":"pb","name":"Stop","color":"red"},"S2":{"type":"pb","name":"Start","color":"green"},"KM1":{"type":"contactor","name":"Contactor"},"H1":{"type":"lamp","name":"Đèn chạy","color":"green"},"H2":{"type":"lamp","name":"Đèn dừng","color":"red"}},"paths":[["S1:11-12",{"par":[["S2:13-14"],["KM1:13-14"]]},"KM1:A1-A2"],["KM1:43-44","H1:X1-X2"],["KM1:21-22","H2:X1-X2"]],"scenarios":[{"label":"Start, nhả Start, rồi Stop","note":"Sau khi nhả Start, dòng tới cuộn đi qua tiếp điểm tự giữ 13-14. Đoán trước: nhả Start thì KM1 còn hút không?","steps":[{"do":"press","dev":"S2","expect":{"KM1":1,"H1":1,"H2":0}},{"do":"release","dev":"S2","expect":{"KM1":1},"label":"tự giữ"},{"do":"press","dev":"S1","expect":{"KM1":0,"H1":0,"H2":1}},{"do":"release","dev":"S1","expect":{"KM1":0}}]},{"label":"Nhấn Stop và Start cùng lúc","note":"Stop nằm nối tiếp trước mạch Start: khi cả hai cùng nhấn, cuộn không có điện (ưu tiên dừng).","steps":[{"do":"press","dev":["S1","S2"],"expect":{"KM1":0}},{"do":"release","dev":["S1","S2"],"expect":{"KM1":0}}]},{"label":"Mất điện rồi có điện lại","note":"Tự giữ cũng là bảo vệ chống tự khởi động lại: có điện trở lại thì phải nhấn Start mới chạy.","steps":[{"do":"press","dev":"S2"},{"do":"release","dev":"S2","expect":{"KM1":1}},{"do":"supply","on":false,"expect":{"KM1":0}},{"do":"supply","on":true,"expect":{"KM1":0,"H2":1}}]},{"label":"Lỗi: đứt dây tiếp điểm tự giữ","note":"Triệu chứng: chỉ chạy khi đang giữ Start, nhả là dừng. Chỗ hỏng nằm ở nhánh tự giữ 13-14.","steps":[{"do":"fault","kind":"open","target":"KM1:13-14"},{"do":"press","dev":"S2","expect":{"KM1":1}},{"do":"release","dev":"S2","expect":{"KM1":0}}]},{"label":"Lỗi: nút Start bị dính","note":"Start luôn đóng: nhấn Stop thì dừng, nhả Stop máy chạy lại ngay. Nguy hiểm vì máy tự chạy.","steps":[{"do":"fault","kind":"weld","target":"S2:13-14","expect":{"KM1":1}},{"do":"press","dev":"S1","expect":{"KM1":0}},{"do":"release","dev":"S1","expect":{"KM1":1}}]}]});
KcdEngine.register({"id":"dol","title":"Khởi động trực tiếp (DOL) có relay nhiệt và dừng khẩn","sims":["AMTS-ELE-001-SIM07","AMTS-ELE-001-SIM20"],"summary":"Mạch động lực: Q1 → tiếp điểm chính KM1 → phần tử nhiệt F1 → động cơ M1. Mạch điều khiển: tiếp điểm F1 95-96, dừng khẩn S0, Stop S1 nối tiếp; Start S2 song song với tự giữ KM1 13-14. Relay nhiệt tác động thì 95-96 mở (KM1 nhả), 97-98 đóng (đèn báo lỗi H2).","supply":{"kind":"DC","plus":"+24 V","minus":"0 V","label":"Nguồn điều khiển 24 VDC (giả định)","prot":"F0"},"devices":{"Q1":{"type":"cb3","name":"CB động lực 3 pha"},"F0":{"type":"fuse","name":"Cầu chì mạch điều khiển"},"F1":{"type":"ol","name":"Relay nhiệt"},"S0":{"type":"estop","name":"Dừng khẩn"},"S1":{"type":"pb","name":"Stop","color":"red"},"S2":{"type":"pb","name":"Start","color":"green"},"KM1":{"type":"contactor","name":"Contactor động cơ"},"M1":{"type":"motor","name":"Động cơ 3 pha"},"H1":{"type":"lamp","name":"Đèn chạy","color":"green"},"H2":{"type":"lamp","name":"Đèn quá tải","color":"yellow"}},"power":{"type":"dol","Q":"Q1","K":"KM1","F":"F1","M":"M1","label":"3 pha L1 L2 L3"},"paths":[["F1:95-96","S0:11-12","S1:11-12",{"par":[["S2:13-14"],["KM1:13-14"]]},"KM1:A1-A2"],["KM1:43-44","H1:X1-X2"],["F1:97-98","H2:X1-X2"]],"scenarios":[{"label":"Khởi động, chạy, dừng","note":"Khởi động trực tiếp: lúc đầu dòng lớn (giả định 6 × In trong 1,5 s), sau đó dòng theo tải.","steps":[{"do":"press","dev":"S2","expect":{"KM1":1,"M1":"fwd","H1":1}},{"do":"release","dev":"S2"},{"wait":3,"expect":{"M1":"fwd","F1":0}},{"do":"press","dev":"S1","expect":{"KM1":0,"M1":"stop"}},{"do":"release","dev":"S1"}]},{"label":"Quá tải: relay nhiệt tác động, reset","note":"Tải tăng lên 2 × In: thanh lưỡng kim nóng dần rồi F1 tác động. Reset ngay thì chưa được (chưa nguội); reset xong máy cũng không tự chạy lại.","steps":[{"do":"press","dev":"S2"},{"do":"release","dev":"S2"},{"wait":5},{"do":"load","val":2},{"wait":25,"expect":{"F1":1,"KM1":0,"M1":"stop","H2":1}},{"do":"reset","dev":"F1","expect":{"F1":1}},{"wait":60},{"do":"reset","dev":"F1","expect":{"F1":0,"KM1":0,"H2":0}},{"do":"load","val":1}]},{"label":"Rôto bị kẹt","note":"Động cơ không quay được, dòng giữ ở mức khởi động. Relay nhiệt cắt sau vài giây (theo mô hình giả định).","steps":[{"do":"load","val":"ket"},{"do":"press","dev":"S2"},{"do":"release","dev":"S2"},{"wait":10,"expect":{"F1":1,"KM1":0}}]},{"label":"Lỗi: mất pha L3","note":"Chỉ còn hai pha: động cơ đứng yên không khởi động được, dòng lớn; relay nhiệt bảo vệ.","steps":[{"do":"fault","kind":"phase","target":3},{"do":"press","dev":"S2","expect":{"M1":"loss"}},{"do":"release","dev":"S2"},{"wait":10,"expect":{"F1":1,"KM1":0,"M1":"stop"}}]},{"label":"Dừng khẩn rồi nhả","note":"Nút dừng khẩn tự khóa khi đập. Xoay nhả nút không làm máy chạy lại: phải nhấn Start.","steps":[{"do":"press","dev":"S2"},{"do":"release","dev":"S2","expect":{"KM1":1}},{"do":"press","dev":"S0","expect":{"KM1":0,"M1":"stop"}},{"do":"release","dev":"S0","expect":{"KM1":0}},{"do":"press","dev":"S2","expect":{"KM1":1}},{"do":"release","dev":"S2"}]},{"label":"Lỗi: contactor kẹt ở vị trí hút","note":"Nhấn Stop, cuộn mất điện nhưng lõi kẹt nên tiếp điểm chính vẫn đóng: động cơ vẫn chạy. Phải cắt Q1.","steps":[{"do":"press","dev":"S2"},{"do":"release","dev":"S2"},{"do":"fault","kind":"stuck","target":"KM1"},{"do":"press","dev":"S1","expect":{"M1":"fwd"}},{"do":"release","dev":"S1"},{"do":"toggle","dev":"Q1","expect":{"M1":"stop","Q1":0}}]}]});
KcdEngine.register({"id":"dao-chieu","title":"Đảo chiều động cơ: khóa chéo điện và khóa chéo nút nhấn","sims":["AMTS-ELE-001-SIM06","AMTS-ELE-001-SIM22"],"summary":"KM1 nối L1-L2-L3 thẳng vào U-V-W (quay thuận), KM2 đổi chỗ L1 và L3 (quay ngược). Khóa chéo điện: tiếp điểm thường đóng KM2 21-22 nằm trong nhánh cuộn KM1 và ngược lại. Khóa chéo nút nhấn: tiếp điểm thường đóng 21-22 của nút Thuận S1 nằm trong nhánh Ngược, và ngược lại. Khóa cơ khí giữa KM1 và KM2 (thường có trên bộ contactor đảo chiều) là lớp chặn thứ ba. Cữ hành trình SQ1, SQ2 (thường đóng) dừng ở cuối hành trình.","supply":{"kind":"DC","plus":"+24 V","minus":"0 V","label":"Nguồn điều khiển 24 VDC (giả định)","prot":"F0"},"devices":{"Q1":{"type":"cb3","name":"CB động lực 3 pha"},"F0":{"type":"fuse","name":"Cầu chì mạch điều khiển"},"F1":{"type":"ol","name":"Relay nhiệt"},"S0":{"type":"pb","name":"Stop","color":"red"},"S1":{"type":"pb","name":"Thuận","color":"green"},"S2":{"type":"pb","name":"Ngược","color":"green"},"SQ1":{"type":"ls","name":"Cữ cuối hành trình thuận"},"SQ2":{"type":"ls","name":"Cữ cuối hành trình ngược"},"KM1":{"type":"contactor","name":"Contactor thuận"},"KM2":{"type":"contactor","name":"Contactor ngược"},"M1":{"type":"motor","name":"Động cơ 3 pha"},"H1":{"type":"lamp","name":"Đèn thuận","color":"green"},"H2":{"type":"lamp","name":"Đèn ngược","color":"blue"}},"mechInterlock":[["KM1","KM2"]],"power":{"type":"rev","Q":"Q1","K":{"F":"KM1","R":"KM2"},"F":"F1","M":"M1","label":"3 pha L1 L2 L3"},"paths":[["F1:95-96","S0:11-12",{"par":[["S2:21-22",{"par":[["S1:13-14"],["KM1:13-14"]]},"SQ1:11-12","KM2:21-22","KM1:A1-A2"],["S1:21-22",{"par":[["S2:13-14"],["KM2:13-14"]]},"SQ2:11-12","KM1:21-22","KM2:A1-A2"]]}],["KM1:43-44","H1:X1-X2"],["KM2:43-44","H2:X1-X2"]],"scenarios":[{"label":"Thuận → Dừng → Ngược","note":"Mỗi chiều có tự giữ riêng. Đang chạy một chiều thì tiếp điểm thường đóng của contactor đó chặn contactor kia.","steps":[{"do":"press","dev":"S1","expect":{"KM1":1,"KM2":0,"M1":"fwd"}},{"do":"release","dev":"S1","expect":{"KM1":1}},{"do":"press","dev":"S0","expect":{"KM1":0,"M1":"stop"}},{"do":"release","dev":"S0"},{"do":"press","dev":"S2","expect":{"KM2":1,"KM1":0,"M1":"rev"}},{"do":"release","dev":"S2","expect":{"KM2":1}}]},{"label":"Đổi chiều trực tiếp (nhờ khóa chéo nút)","note":"Đang quay thuận, nhấn Ngược: tiếp điểm 21-22 của S2 cắt nhánh thuận trước, KM1 nhả, rồi KM2 mới hút. Đếm số bước.","steps":[{"do":"press","dev":"S1"},{"do":"release","dev":"S1","expect":{"M1":"fwd"}},{"do":"press","dev":"S2","expect":{"KM1":0,"KM2":1,"M1":"rev"}},{"do":"release","dev":"S2","expect":{"KM2":1}}]},{"label":"Nhấn Thuận và Ngược cùng lúc","note":"Với khóa chéo nút, mỗi nút cắt nhánh của nút kia: không contactor nào hút.","steps":[{"do":"press","dev":["S1","S2"],"expect":{"KM1":0,"KM2":0,"M1":"stop"}},{"do":"release","dev":["S1","S2"],"expect":{"KM1":0,"KM2":0}}]},{"label":"Cữ hành trình dừng ở cuối đường","note":"Đang chạy thuận, bàn máy chạm SQ1: tiếp điểm thường đóng SQ1 mở, KM1 nhả. Nhấn Thuận lại cũng không chạy; chỉ chạy Ngược được.","steps":[{"do":"press","dev":"S1"},{"do":"release","dev":"S1"},{"do":"press","dev":"SQ1","expect":{"KM1":0,"M1":"stop"}},{"do":"press","dev":"S1","expect":{"KM1":0}},{"do":"release","dev":"S1"},{"do":"press","dev":"S2","expect":{"KM2":1,"M1":"rev"}},{"do":"release","dev":"S2"},{"do":"release","dev":"SQ1","expect":{"KM2":1}}]},{"label":"Lỗi: KM1 dính tiếp điểm chính","note":"KM1 kẹt ở vị trí hút: nhấn Ngược, khóa chéo điện (KM1 21-22 vẫn mở) không cho KM2 hút, nhờ vậy không chạm pha.","steps":[{"do":"press","dev":"S1"},{"do":"release","dev":"S1"},{"do":"fault","kind":"stuck","target":"KM1"},{"do":"press","dev":"S2","expect":{"KM2":0,"M1":"fwd","Q1":1}},{"do":"release","dev":"S2"}]}]});
KcdEngine.register({"id":"dao-chieu-khoa-dien","title":"Đảo chiều chỉ có khóa chéo điện (để so sánh)","sims":["AMTS-ELE-001-SIM06"],"summary":"Giống mạch đảo chiều đầy đủ nhưng bỏ khóa chéo nút nhấn và cữ hành trình. Đang chạy thuận muốn chạy ngược phải nhấn Stop trước. Nhấn hai nút cùng lúc thì hai cuộn cùng có điện: mạch chạy đua.","supply":{"kind":"DC","plus":"+24 V","minus":"0 V","label":"Nguồn điều khiển 24 VDC (giả định)","prot":"F0"},"devices":{"Q1":{"type":"cb3","name":"CB động lực 3 pha"},"F0":{"type":"fuse","name":"Cầu chì mạch điều khiển"},"F1":{"type":"ol","name":"Relay nhiệt"},"S0":{"type":"pb","name":"Stop","color":"red"},"S1":{"type":"pb","name":"Thuận","color":"green"},"S2":{"type":"pb","name":"Ngược","color":"green"},"KM1":{"type":"contactor","name":"Contactor thuận"},"KM2":{"type":"contactor","name":"Contactor ngược"},"M1":{"type":"motor","name":"Động cơ 3 pha"}},"power":{"type":"rev","Q":"Q1","K":{"F":"KM1","R":"KM2"},"F":"F1","M":"M1","label":"3 pha L1 L2 L3"},"paths":[["F1:95-96","S0:11-12",{"par":[[{"par":[["S1:13-14"],["KM1:13-14"]]},"KM2:21-22","KM1:A1-A2"],[{"par":[["S2:13-14"],["KM2:13-14"]]},"KM1:21-22","KM2:A1-A2"]]}]],"scenarios":[{"label":"Đang thuận nhấn Ngược: không đổi chiều","note":"Khóa chéo điện chặn KM2 khi KM1 đang hút. Muốn đổi chiều phải nhấn Stop trước.","steps":[{"do":"press","dev":"S1"},{"do":"release","dev":"S1","expect":{"KM1":1}},{"do":"press","dev":"S2","expect":{"KM1":1,"KM2":0,"M1":"fwd"}},{"do":"release","dev":"S2"},{"do":"press","dev":"S0","expect":{"KM1":0}},{"do":"release","dev":"S0"},{"do":"press","dev":"S2","expect":{"KM2":1,"M1":"rev"}},{"do":"release","dev":"S2"}]},{"label":"Nhấn hai nút cùng lúc: chạy đua","note":"Hai cuộn cùng có điện trong một bước, rồi tiếp điểm thường đóng của cái này cắt cái kia: trạng thái lặp lại. Mô phỏng báo chạy đua và cho một contactor thắng ngẫu nhiên. Ngoài đời không chắc chỉ một cái đóng: nếu tiếp điểm chính của cả hai kịp chạm thì L1 và L3 bị ngắn mạch. Vì vậy mạch đảo chiều thật dùng cả khóa chéo nút nhấn (mạch dao-chieu) và khóa cơ khí giữa hai contactor.","steps":[{"do":"press","dev":["S1","S2"],"expect":{"one":["KM1","KM2"],"Q1":1}},{"do":"release","dev":["S1","S2"],"expect":{"one":["KM1","KM2"]}}]}]});
KcdEngine.register({"id":"dao-chieu-khong-khoa","title":"Đảo chiều KHÔNG có khóa chéo (mạch sai, để thấy hậu quả)","sims":["AMTS-ELE-001-SIM06"],"summary":"Mạch sai cố ý: hai nhánh thuận, ngược không chặn nhau. Đang chạy thuận mà nhấn Ngược thì cả hai contactor cùng đóng, L1 và L3 bị nối tắt qua tiếp điểm chính: CB Q1 cắt. Chỉ để học trong mô phỏng, không lắp mạch này.","supply":{"kind":"DC","plus":"+24 V","minus":"0 V","label":"Nguồn điều khiển 24 VDC (giả định)","prot":"F0"},"devices":{"Q1":{"type":"cb3","name":"CB động lực 3 pha"},"F0":{"type":"fuse","name":"Cầu chì mạch điều khiển"},"F1":{"type":"ol","name":"Relay nhiệt"},"S0":{"type":"pb","name":"Stop","color":"red"},"S1":{"type":"pb","name":"Thuận","color":"green"},"S2":{"type":"pb","name":"Ngược","color":"green"},"KM1":{"type":"contactor","name":"Contactor thuận"},"KM2":{"type":"contactor","name":"Contactor ngược"},"M1":{"type":"motor","name":"Động cơ 3 pha"}},"power":{"type":"rev","Q":"Q1","K":{"F":"KM1","R":"KM2"},"F":"F1","M":"M1","label":"3 pha L1 L2 L3"},"paths":[["F1:95-96","S0:11-12",{"par":[[{"par":[["S1:13-14"],["KM1:13-14"]]},"KM1:A1-A2"],[{"par":[["S2:13-14"],["KM2:13-14"]]},"KM2:A1-A2"]]}]],"scenarios":[{"label":"Đang thuận nhấn Ngược: chạm pha","note":"Không có gì ngăn KM2 hút khi KM1 đang hút. Hai bộ tiếp điểm chính cùng đóng nối tắt L1 với L3: Q1 cắt, động cơ dừng.","steps":[{"do":"press","dev":"S1"},{"do":"release","dev":"S1","expect":{"KM1":1,"M1":"fwd"}},{"do":"press","dev":"S2","expect":{"KM1":1,"KM2":1,"Q1":0,"M1":"stop"}},{"do":"release","dev":"S2"}]}]});
KcdEngine.register({"id":"timer","title":"Timer trễ đóng (ON-delay) và trễ mở (OFF-delay)","sims":["AMTS-ELE-001-SIM18"],"summary":"Công tắc S1 cấp điện cùng lúc cho hai timer, thời gian đặt 3 s (giả định). KT1 trễ đóng: tiếp điểm 67-68 chỉ đóng sau khi cuộn có điện đủ 3 s. KT2 trễ mở: 67-68 đóng ngay khi cuộn có điện và chỉ mở sau khi cuộn mất điện đủ 3 s. Mất điện trước khi đủ thời gian thì KT1 đếm lại từ đầu.","supply":{"kind":"DC","plus":"+24 V","minus":"0 V","label":"Nguồn điều khiển 24 VDC (giả định)","prot":"F0"},"devices":{"F0":{"type":"fuse","name":"Cầu chì mạch điều khiển"},"S1":{"type":"sw","name":"Công tắc"},"KT1":{"type":"ton","name":"Timer trễ đóng","T":3},"KT2":{"type":"tof","name":"Timer trễ mở","T":3},"H1":{"type":"lamp","name":"Đèn qua KT1 67-68","color":"green"},"H2":{"type":"lamp","name":"Đèn qua KT2 67-68","color":"yellow"},"H3":{"type":"lamp","name":"Đèn qua KT1 55-56","color":"red"}},"paths":[["S1:13-14",{"par":[["KT1:A1-A2"],["KT2:A1-A2"]]}],["KT1:67-68","H1:X1-X2"],["KT2:67-68","H2:X1-X2"],["KT1:55-56","H3:X1-X2"]],"trace":["S1","KT1","KT1.t","KT2","KT2.t","H1","H2"],"scenarios":[{"label":"Bật 5 s rồi tắt","note":"Vẽ giản đồ thời gian: H1 sáng sau 3 s; H2 sáng ngay, tắt sau khi tắt công tắc 3 s.","steps":[{"do":"toggle","dev":"S1","expect":{"KT1":1,"KT1.t":0,"H1":0,"H2":1,"H3":1}},{"wait":2,"expect":{"H1":0}},{"wait":1,"expect":{"KT1.t":1,"H1":1,"H3":0}},{"wait":2},{"do":"toggle","dev":"S1","expect":{"KT1":0,"H1":0,"H2":1,"H3":1}},{"wait":3,"expect":{"KT2.t":0,"H2":0}}]},{"label":"Bật 2 s (chưa đủ thời gian)","note":"Cuộn KT1 mất điện trước khi đếm đủ 3 s: tiếp điểm trễ không đổi, lần sau đếm lại từ 0.","steps":[{"do":"toggle","dev":"S1"},{"wait":2},{"do":"toggle","dev":"S1","expect":{"H1":0}},{"wait":1},{"do":"toggle","dev":"S1"},{"wait":2.5,"expect":{"H1":0}},{"wait":0.5,"expect":{"H1":1}}]}]});
KcdEngine.register({"id":"sao-tam-giac","title":"Khởi động sao – tam giác dùng timer","sims":["AMTS-ELE-001-SIM22","AMTS-ELE-001-SIM18"],"summary":"Một cách nối phổ biến (giả định, có nhiều biến thể): Start cấp điện cho KM1 (contactor chính), KT1 (timer trễ đóng, đặt 5 s giả định) và KM3 (nối sao). Hết thời gian, KT1 55-56 mở cắt KM3; khi KM3 đã nhả thì KM3 21-22 đóng lại và KT1 67-68 cho KM2 (nối tam giác) hút. KM2 và KM3 khóa chéo nhau. Khi nối sao, dòng khởi động bằng 1/3 so với nối tam giác.","supply":{"kind":"DC","plus":"+24 V","minus":"0 V","label":"Nguồn điều khiển 24 VDC (giả định)","prot":"F0"},"devices":{"Q1":{"type":"cb3","name":"CB động lực 3 pha"},"F0":{"type":"fuse","name":"Cầu chì mạch điều khiển"},"F1":{"type":"ol","name":"Relay nhiệt"},"S1":{"type":"pb","name":"Stop","color":"red"},"S2":{"type":"pb","name":"Start","color":"green"},"KM1":{"type":"contactor","name":"Contactor chính"},"KM2":{"type":"contactor","name":"Contactor tam giác"},"KM3":{"type":"contactor","name":"Contactor sao"},"KT1":{"type":"ton","name":"Timer chuyển sao → tam giác","T":5},"M1":{"type":"motor","name":"Động cơ 6 đầu dây"}},"power":{"type":"yd","Q":"Q1","K":{"main":"KM1","delta":"KM2","star":"KM3"},"F":"F1","M":"M1","label":"3 pha L1 L2 L3"},"paths":[["F1:95-96","S1:11-12",{"par":[["S2:13-14"],["KM1:13-14"]]},{"par":[["KM1:A1-A2"],["KT1:A1-A2"],["KT1:55-56","KM2:21-22","KM3:A1-A2"],["KT1:67-68","KM3:21-22","KM2:A1-A2"]]}]],"trace":["S2","KM1","KM3","KT1.t","KM2","M1","F1"],"scenarios":[{"label":"Khởi động sao rồi chuyển tam giác","note":"Đếm bước ở lúc chuyển: KM3 nhả trước, rồi KM2 mới hút (không bao giờ cùng đóng).","steps":[{"do":"press","dev":"S2","expect":{"KM1":1,"KM3":1,"KM2":0,"M1":"star"}},{"do":"release","dev":"S2","expect":{"KM1":1}},{"wait":5,"expect":{"KM3":0,"KM2":1,"M1":"delta","F1":0}},{"wait":5,"expect":{"M1":"delta"}},{"do":"press","dev":"S1","expect":{"KM1":0,"KM2":0,"KM3":0,"KT1":0,"M1":"stop"}},{"do":"release","dev":"S1"}]},{"label":"Lỗi: cuộn timer KT1 cháy","note":"Timer không bao giờ đếm xong: động cơ chạy mãi ở nối sao. Triệu chứng: máy yếu, không lên tam giác.","steps":[{"do":"fault","kind":"burn","target":"KT1"},{"do":"press","dev":"S2"},{"do":"release","dev":"S2"},{"wait":20,"expect":{"KM3":1,"KM2":0,"M1":"star"}}]},{"label":"Dừng khi đang nối sao","note":"Nhấn Stop trong lúc timer đang đếm: mọi contactor nhả, timer về 0.","steps":[{"do":"press","dev":"S2"},{"do":"release","dev":"S2"},{"wait":2},{"do":"press","dev":"S1","expect":{"KM1":0,"KM3":0,"KT1":0,"KT1.t":0}},{"do":"release","dev":"S1"},{"wait":5,"expect":{"KM2":0}}]}]});
KcdEngine.register({"id":"mach-rung","title":"Relay tự cắt cuộn của mình (mạch rung)","sims":["AMTS-ELE-001-SIM16"],"summary":"Mạch sai cố ý: tiếp điểm thường đóng K1 21-22 nằm nối tiếp với chính cuộn K1. Cuộn có điện → K1 hút → 21-22 mở → cuộn mất điện → K1 nhả → 21-22 đóng → … Relay đóng cắt liên tục (rung, chattering), làm mòn tiếp điểm. Mô phỏng phát hiện trạng thái lặp và dừng lan truyền.","supply":{"kind":"DC","plus":"+24 V","minus":"0 V","label":"Nguồn điều khiển 24 VDC (giả định)","prot":"F0"},"devices":{"F0":{"type":"fuse","name":"Cầu chì mạch điều khiển"},"S1":{"type":"pb","name":"Nút nhấn","color":"green"},"K1":{"type":"relay","name":"Relay"}},"paths":[["S1:13-14","K1:21-22","K1:A1-A2"]],"scenarios":[{"label":"Nhấn nút: relay rung","note":"Theo dõi Nhật ký: K1 hút, nhả, hút… trạng thái lặp lại nên mô phỏng báo rung.","steps":[{"do":"press","dev":"S1","expect":{"chatter":1}},{"do":"release","dev":"S1","expect":{"K1":0,"chatter":0}}]}]});
/* AMTS · Trình mô phỏng mạch điều khiển điện (khóa Khí cụ điện) · GIAO DIỆN (renderer)
   Vẽ SVG sơ đồ từ dữ liệu mạch (platform/sim/kcd/circuits/*.json) bằng ký hiệu kiểu IEC tự vẽ; bấm vào thiết bị để thao tác.
   Bố cục theo docs/QUY-TAC-TRINH-MO-PHONG.md: khung cao cố định (.sim-stage), sơ đồ luôn thấy (điện thoại: ở trên; laptop: cột trái),
   các phần theo dõi xếp dọc trong một khung cuộn (.st-scroll), hàng nút ở đáy khung. Bộ máy: engine.js (KcdEngine). */
(function(){
"use strict";
const E=window.KcdEngine;
const H=s=>String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
const fmt=x=>String(Math.round(x*100)/100).replace(".",",");
const MOB=()=>!!(window.matchMedia&&matchMedia("(max-width:900px)").matches);
const RED=()=>!!(window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches);
const CW=64,RH=58,YR=40;           /* ô lưới mạch điều khiển: rộng, cao; vị trí thanh nguồn trên */
const OPS=["pb","estop","sel","sw","ls"];
const TYPE_VI={pb:"Nút nhấn",estop:"Nút dừng khẩn",sel:"Công tắc chọn (selector)",sw:"Công tắc",ls:"Cữ hành trình",relay:"Relay trung gian",contactor:"Contactor",
  ton:"Timer trễ đóng (ON-delay)",tof:"Timer trễ mở (OFF-delay)",ol:"Relay nhiệt",fuse:"Cầu chì",mcb:"Aptomat (MCB)",cb3:"CB 3 pha",lamp:"Đèn báo",motor:"Động cơ 3 pha"};
let UID=0;

/* ---------- bố trí mạch điều khiển: cột dòng điện thẳng đứng giữa thanh (+) ở trên và (0) ở dưới ---------- */
function size(x){if(Array.isArray(x)){let w=0,h=0;x.forEach(y=>{const s=size(y);w=Math.max(w,s.w);h+=s.h});return{w,h}}
  if(x&&x.par){let w=0,h=0;x.par.forEach(b=>{const s=size(Array.isArray(b)?b:[b]);w+=s.w;h=Math.max(h,s.h)});return{w,h}}return{w:1,h:1}}
function layout(C,cx0){const P=C.paths||[],sz=P.map(size),Hr=Math.max(1,...sz.map(s=>s.h)),leaves=[],segs=[],bus=[],cols=[];let ei=0,col=0;
  const X=c=>cx0+c*CW+CW/2,Y=r=>YR+r*RH;
  /* trả về danh sách id phần tử trong khối (để biết khối có dòng không) */
  function draw(x,c,r,h,p,last){
    if(Array.isArray(x)){const ids=[];let rr=r;x.forEach((y,i)=>{const isL=i===x.length-1;const hh=isL?r+h-rr:size(y).h;ids.push(...draw(y,c,rr,hh,p,isL&&last));rr+=hh});return ids}
    if(x&&x.par){const br=x.par.map(b=>Array.isArray(b)?b:[b]);let cc=c;const groups=[],starts=[];
      br.forEach(b=>{starts.push(cc);const s=size(b);groups.push(draw(b,cc,r,h,p,last));cc+=s.w});
      for(let i=1;i<br.length;i++){const rest=groups.slice(i).flat(),first=groups[i][0],lastId=groups[i][groups[i].length-1];
        segs.push({d:`M${X(starts[i-1])},${Y(r)}H${X(starts[i])}`,b:{ids:rest,live:groups[0][0],side:"A"}});
        segs.push({d:`M${X(starts[i-1])},${Y(r+h)}H${X(starts[i])}`,b:{ids:rest,live:lastId,side:"B"}})}
      starts.forEach((s,i)=>{bus.push([X(s),Y(r)]);bus.push([X(s),Y(r+h)])});
      return groups.flat()}
    const o=typeof x==="string"?{ref:x}:x,id="e"+(ei++),[dev,term]=o.ref.split(":");const load=/^(A1-A2|X1-X2)$/.test(term);
    const yTop=load?Y(r+h-1):Y(r);leaves.push({id,ref:o.ref,dev,term,x:X(c),y:yTop,p,load});
    if(h>1){if(load)segs.push({d:`M${X(c)},${Y(r)}V${yTop}`,b:{ids:[id],live:id,side:"A"}});else segs.push({d:`M${X(c)},${yTop+RH}V${Y(r+h)}`,b:{ids:[id],live:id,side:"B"}})}
    return[id]}
  const paths=[];P.forEach((x,p)=>{const ids=draw(x,col,0,Hr,p,true);cols.push(col);paths.push(ids);col+=sz[p].w});
  const W=col;return{W,Hr,leaves,segs,bus,cols,paths,X,Y,yBot:Y(Hr),width:cx0+W*CW+18}}

/* ---------- ký hiệu (tự vẽ theo cách thể hiện thông dụng của IEC 60617; không chép hình) ---------- */
function contactSVG(L,v,D,act){const x=L.x,y=L.y,t1=y+17,t2=y+RH-17,[ta,tb]=L.term.split("-"),k=v.kind,closed=v.closed;
  const no=k==="NO"||k==="dNO";let s="";
  s+=`<path class="w ${wc(v,"A")}" d="M${x},${y}V${t1}"/><path class="w ${wc(v,"B")}" d="M${x},${t2}V${y+RH}"/>`;
  if(!no)s+=`<path class="w ${wc(v,"A")}" d="M${x},${t1}h9"/>`;
  const bx=closed?(no?x:x+9):(no?x-11:x-12),by=closed?t1+(no?0:1):t1+4;
  s+=`<path class="bl ${v.cur?"cur":v.liveB||v.liveA&&closed?"live":""}" d="M${x},${t2}L${bx},${by}"/>`;
  const mx=x+(bx-x)*.55,my=t2+(by-t2)*.55;
  const T=D.type;
  if(T==="pb"||T==="estop"||T==="sel"||T==="sw"||T==="ls"){const ax=x-24;s+=`<path class="lk" d="M${mx},${my}H${ax+4}"/>`;
    if(T==="pb")s+=`<path class="ac" d="M${ax+4},${my-7}V${my+7}M${ax+4},${my-7}h-4M${ax+4},${my+7}h-4"/>`;
    else if(T==="estop")s+=`<path class="ac es" d="M${ax+4},${my-8}a8,8 0 0 0 0,16Z"/>`;
    else if(T==="ls")s+=`<circle class="ac" cx="${ax}" cy="${my}" r="4"/><path class="ac" d="M${ax+4},${my}l5,-6"/>`;
    else s+=`<path class="ac" d="M${ax+4},${my-7}V${my}h-5v7"/>`}
  else if(T==="ol")s+=`<path class="lk" d="M${mx},${my}H${x-18}"/><path class="ac" d="M${x-18},${my-6}h-6v6h-6v6h6"/>`;
  else{s+=`<path class="lk" d="M${mx},${my}H${x-20}"/>`;if(k==="dNO"||k==="dNC")s+=`<path class="ac" d="M${x-16},${my-7}a7,7 0 0 ${D.type==="ton"?0:1} 0,14"/>`}
  s+=`<text class="tm" x="${x+5}" y="${y+12}">${H(ta)}</text><text class="tm" x="${x+5}" y="${y+RH-5}">${H(tb)}</text>`;
  s+=`<text class="tg" x="${x-27}" y="${y+RH/2+(T==="pb"||T==="estop"||T==="sw"||T==="sel"||T==="ls"?-10:-10)}" text-anchor="end">${H(L.dev)}</text>`;
  if(v.fault.includes("weld"))s+=`<circle class="flt" cx="${x+3}" cy="${t1+3}" r="3.5"/>`;
  return s}
function wc(v,side){const live=side==="A"?v.liveA:v.liveB;if(v.fault.includes("open")&&side==="A")return"open";return v.cur?"cur":live?"live":""}
function coilSVG(L,v,D,st,pend){const x=L.x,y=L.y,b1=y+RH/2-10,s=[];
  s.push(`<path class="w ${wc(v,"A")}" d="M${x},${y}V${b1}"/><path class="w ${wc(v,"B")}" d="M${x},${b1+20}V${y+RH}"/>`);
  const on=L.term==="X1-X2"?st.on:(st.on||0);
  if(L.term==="X1-X2"){const c=D.color||"white";
    s.push(`<circle class="lamp c-${H(c)} ${on?"on":""}" cx="${x}" cy="${b1+10}" r="10"/><path class="lx" d="M${x-7},${b1+3}l14,14M${x+7},${b1+3}l-14,14"/>`)}
  else{s.push(`<rect class="coil ${on?"on":""} ${pend?"pend":""}" x="${x-15}" y="${b1}" width="30" height="20" rx="2"/>`);
    if(D.type==="ton"||D.type==="tof")s.push(`<path class="ac" d="M${x-15},${b1+4}h-6v12h6"/><text class="tm" x="${x-27}" y="${b1+30}" text-anchor="middle">${D.type==="ton"?"ON":"OFF"}</text>`)}
  if(v.fault.includes("burn"))s.push(`<path class="flt-x" d="M${x-9},${b1+1}l18,18M${x+9},${b1+1}l-18,18"/>`);
  if(v.fault.includes("short"))s.push(`<path class="flt-s" d="M${x+20},${b1-4}v28"/><path class="flt-s" d="M${x},${b1-4}h20M${x},${b1+24}h20"/>`);
  const [ta,tb]=L.term.split("-");s.push(`<text class="tm" x="${x+5}" y="${y+12}">${ta}</text><text class="tm" x="${x+5}" y="${y+RH-5}">${tb}</text>`);
  s.push(`<text class="tg" x="${x-18}" y="${b1-3}" text-anchor="end">${H(L.dev)}</text>`);
  return s.join("")}

/* ---------- mạch động lực theo mẫu ---------- */
function powerGeo(P){const px=42,X=[0,px+12,px+36,px+60],G={lines:{},devs:[],motor:null,w:0,h:0,taps:[]};
  const ln=(id,pts)=>{G.lines[id]=(G.lines[id]||[]).concat([pts])};
  for(let i=1;i<=3;i++)ln("Q"+i,[[X[i],YR-6],[X[i],100]]);
  G.devs.push({dev:P.Q,kind:"cb",ys:[50,86],xs:[X[1],X[2],X[3]],ids:["Q1","Q2","Q3"]});
  const motorAt=(y,six)=>{G.motor={x:X[2],y,six}};
  const heat=(y0,dev)=>{if(!dev)return;G.devs.push({dev,kind:"heater",ys:[y0,y0+30],xs:[X[1],X[2],X[3]],ids:["F1","F2","F3"]})};
  if(P.type==="dol"){for(let i=1;i<=3;i++){ln("K"+i,[[X[i],100],[X[i],170]]);if(P.F){ln("F"+i,[[X[i],170],[X[i],226]]);ln("W"+i,[[X[i],226],[X[i],270]])}else ln("W"+i,[[X[i],170],[X[i],270]])}
    G.devs.push({dev:P.K,kind:"main",ys:[118,152],xs:[X[1],X[2],X[3]],ids:["K1","K2","K3"]});heat(184,P.F);motorAt(296);G.w=px+90;G.h=340}
  else if(P.type==="rev"){const sw=[0,3,2,1],XR=i=>X[i]+92;
    for(let i=1;i<=3;i++){ln("KF"+i,[[X[i],100],[X[i],200]]);const ty=104+i*5,oy=176+i*5,t=sw[i];
      ln("KR"+i,[[X[i],ty],[XR(i),ty],[XR(i),oy],[X[t],oy],[X[t],200]]);G.taps.push([X[i],ty],[X[t],oy]);
      if(P.F){ln("F"+i,[[X[i],200],[X[i],250]]);ln("W"+i,[[X[i],250],[X[i],290]])}else ln("W"+i,[[X[i],200],[X[i],290]])}
    G.devs.push({dev:P.K.F,kind:"main",ys:[126,160],xs:[X[1],X[2],X[3]],ids:["KF1","KF2","KF3"]});
    G.devs.push({dev:P.K.R,kind:"main",ys:[126,160],xs:[XR(1),XR(2),XR(3)],ids:["KR1","KR2","KR3"]});heat(208,P.F);motorAt(316);G.w=px+170;G.h=360}
  else if(P.type==="yd"){const XD=i=>X[i]+96,T2=[0,3,1,2];
    for(let i=1;i<=3;i++){ln("K"+i,[[X[i],100],[X[i],170]]);if(P.F){ln("F"+i,[[X[i],170],[X[i],226]]);ln("W"+i,[[X[i],226],[X[i],282]])}else ln("W"+i,[[X[i],170],[X[i],282]]);
      const ty=232+i*6,by=352+i*6;ln("KD"+i,[[X[i],ty],[XD(i),ty],[XD(i),by],[X[T2[i]],by]]);G.taps.push([X[i],ty],[X[T2[i]],by]);
      ln("KY"+i,[[X[i],342],[X[i],412],[X[1],412]]);if(i===3)ln("KY3",[[X[3],412],[X[1],412]])}
    G.devs.push({dev:P.K.main,kind:"main",ys:[118,152],xs:[X[1],X[2],X[3]],ids:["K1","K2","K3"]});heat(184,P.F);
    G.devs.push({dev:P.K.delta,kind:"main",ys:[290,324],xs:[XD(1),XD(2),XD(3)],ids:["KD1","KD2","KD3"]});
    G.devs.push({dev:P.K.star,kind:"main",ys:[372,402],xs:[X[1],X[2],X[3]],ids:["KY1","KY2","KY3"]});
    motorAt(312,true);G.w=px+176;G.h=430}
  G.X=X;return G}
function powerSVG(G,V,C){const P=C.power,pw={};(V.pw||[]).forEach(e=>pw[e.id]=e);const s=[];
  const cls=id=>{const e=pw[id];if(!e)return"";return(e.fault?"open ":"")+(e.cur?"cur":e.live?"live":"")};
  ["L1","L2","L3"].forEach((L,i)=>s.push(`<text class="tg" x="${G.X[i+1]}" y="${YR-12}" text-anchor="middle">${L}</text>`));
  /* đường dây (phần tiếp điểm được vẽ đè ở dưới, đoạn dây chỗ tiếp điểm bị che bằng nền) */
  for(const id in G.lines)G.lines[id].forEach(pts=>s.push(`<polyline class="w ${cls(id)}" points="${pts.map(p=>p.join(",")).join(" ")}"/>`));
  G.taps.forEach(([x,y])=>s.push(`<circle class="dot" cx="${x}" cy="${y}" r="2.6"/>`));
  G.devs.forEach(d=>{const[y1,y2]=d.ys,st=V.dev[d.dev];
    d.xs.forEach((x,i)=>{const e=pw[d.ids[i]]||{},c=e.cur?"cur":e.live?"live":"";
      if(d.kind==="heater"){s.push(`<rect class="gap" x="${x-6}" y="${y1+2}" width="12" height="${y2-y1-4}"/><rect class="heat ${c}" x="${x-6}" y="${y1+2}" width="12" height="${y2-y1-4}" rx="1"/><path class="w ${c}" d="M${x},${y1+2}v6h-3v6h6v6h-3v${y2-y1-24}"/>`);return}
      s.push(`<rect class="gap" x="${x-9}" y="${y1}" width="18" height="${y2-y1}"/>`);
      s.push(`<path class="w ${pw[d.ids[i]]&&pw[d.ids[i]].live?c||"live":""}" d="M${x},${y1-1}V${y1+5}M${x},${y2-5}V${y2+1}"/>`);
      const closed=e.closed;s.push(`<path class="bl ${c}" d="M${x},${y2-5}L${closed?x:x-10},${y1+(closed?5:8)}"/>`);
      if(d.kind==="cb")s.push(`<path class="ac" d="M${x-3},${y1+2}l6,6M${x+3},${y1+2}l-6,6"/>`)});
    const mid=(y1+y2)/2+2;s.push(`<path class="lk" d="M${d.xs[0]-6},${mid}H${d.xs[2]}"/>`);
    s.push(`<text class="tg" x="${d.xs[0]-12}" y="${mid+4}" text-anchor="end">${H(d.dev)}</text>`);
    if(d.kind==="cb"&&st&&st.trip)s.push(`<text class="tg err" x="${d.xs[2]+8}" y="${mid+4}">cắt</text>`);
    if(d.kind==="heater"&&st&&st.trip)s.push(`<text class="tg err" x="${d.xs[2]+8}" y="${mid+4}">trip</text>`);
    if(d.kind==="cb")s.push(`<rect class="hit" data-dev="${H(d.dev)}" x="${d.xs[0]-30}" y="${y1-4}" width="${d.xs[2]-d.xs[0]+44}" height="${y2-y1+8}"/>`)});
  if(G.motor){const m=G.motor,ms=V.dev[P.M],run=ms&&ms.conn!=="off",cx=m.x,cy=m.y+(m.six?20:24),r=m.six?22:24;
    if(m.six){s.push(`<rect class="mot ${run?"on":""}" x="${G.X[1]-10}" y="${m.y-26}" width="${G.X[3]-G.X[1]+20}" height="56" rx="6"/>`);
      ["U1","V1","W1"].forEach((t,i)=>s.push(`<text class="tm" x="${G.X[i+1]+3}" y="${m.y-16}">${t}</text>`));["U2","V2","W2"].forEach((t,i)=>s.push(`<text class="tm" x="${G.X[i+1]+3}" y="${m.y+26}">${t}</text>`));
      s.push(`<text class="mt" x="${cx}" y="${m.y+6}" text-anchor="middle">M 3~</text>`)}
    else{s.push(`<circle class="mot ${run?"on":""}" cx="${cx}" cy="${cy}" r="${r}"/><text class="mt" x="${cx}" y="${cy+4}" text-anchor="middle">M 3~</text>`);
      ["U","V","W"].forEach((t,i)=>s.push(`<text class="tm" x="${G.X[i+1]+3}" y="${cy-r-3}">${t}</text>`))}
    const dir=ms?ms.conn==="off"?"":ms.conn==="loss"?"mất pha":ms.dir>0?"↻ thuận":"↺ ngược":"";
    s.push(`<text class="tg" x="${G.X[1]-12}" y="${(m.six?m.y:cy)+4}" text-anchor="end">${H(P.M)}</text><text class="mdir ${ms&&ms.conn==="loss"?"err":""}" x="${cx}" y="${(m.six?m.y+44:cy+r+14)}" text-anchor="middle">${dir}${ms&&ms.conn==="star"?" · Y":ms&&ms.conn==="delta"?" · Δ":""}</text>`)}
  return s.join("")}

/* ---------- khung trình mô phỏng ---------- */
function mount(root,cfg){
  cfg=cfg||{};const ids=cfg.circuits||(cfg.circuit?[cfg.circuit]:Object.keys(E.circuits));
  const CIRC=ids.map(i=>{const c=E.circuits[i];if(!c)throw Error("Không có mạch "+i);return c});
  const P="ks"+(++UID);let ci=Math.max(0,ids.indexOf(cfg.start||ids[0])),sim,C,LAY,PG,scen=0,hist=[],mode="idle",timer=null,lastT=0,pause=0,faultKind="",ask=null,speed=1,zoom=1,view="all",held={};
  root.classList.add("sim","kcd-sim");root.dataset.kcd="1";
  root.innerHTML=`<div class="sim-bar"><div class="left"><span class="fname">Mạch điều khiển</span>
    ${CIRC.length>1?`<label class="pre-l"><span class="vh">Chọn mạch</span><select class="k-circ">${CIRC.map((c,i)=>`<option value="${i}">${H(c.title)}</option>`).join("")}</select></label>`:""}
    <label class="pre-l"><span class="vh">Chọn kịch bản</span><select class="s-pre"></select></label>
    <label class="k-predl"><input type="checkbox" class="k-pred"> Đoán trước</label>
    <span class="s-chip idle" role="status" aria-live="polite">Chưa chạy</span></div></div>
  <details class="s-note"><summary><b class="sn-h">Mạch này</b><span class="sn-1"></span></summary><div class="sn-t"></div></details>
  <div class="sim-stage">
   <div class="st-code"><div class="editor kcd-draw" role="region" aria-label="Sơ đồ mạch"><div class="k-dtools"><span class="k-views" role="group" aria-label="Phần sơ đồ hiện"><button type="button" data-v="all" class="on">Cả hai</button><button type="button" data-v="ctl">Điều khiển</button><button type="button" data-v="pwr">Động lực</button></span><span class="k-zoom"><button type="button" data-z="-1" aria-label="Thu nhỏ sơ đồ">−</button><button type="button" data-z="0" aria-label="Vừa khung">Vừa</button><button type="button" data-z="1" aria-label="Phóng to sơ đồ">+</button></span></div><div class="k-svgw"><svg class="k-svg" xmlns="http://www.w3.org/2000/svg" role="img"></svg></div></div>
    <div class="sim-in k-hint"></div></div>
   <div class="st-panes">
    <div class="st-nav" role="group" aria-label="Đi tới phần"><button type="button" data-go="ops" class="on">Thao tác</button><button type="button" data-go="st">Trạng thái</button><button type="button" data-go="td">Giản đồ</button><button type="button" data-go="log">Từng bước</button><button type="button" data-go="ab">Giả định</button></div>
    <div class="st-scroll" tabindex="0" role="region" aria-label="Thao tác, trạng thái, giản đồ thời gian, nhật ký và giả định">
     <section class="pn" data-sec="ops"><div class="pane-h"><span>Bảng thao tác</span><span class="k-t"></span></div><div class="k-ops"></div></section>
     <section class="pn" data-sec="st"><div class="pane-h"><span>Trạng thái thiết bị</span><span class="k-pend"></span></div><div class="k-st"></div></section>
     <section class="pn" data-sec="td"><div class="pane-h"><span>Giản đồ thời gian</span><span class="k-tdh"></span></div><div class="k-td"></div></section>
     <section class="pn" data-sec="log"><div class="pane-h"><span>Từng bước (vì sao tiếp điểm đổi)</span><span class="k-n"></span></div><div class="k-say" aria-live="polite"></div><ol class="k-log"></ol></section>
     <section class="pn" data-sec="ab"><div class="pane-h"><span>Mô hình, giả định và giới hạn</span></div><div class="k-ab"></div></section>
    </div></div>
   <div class="sim-ctl"><span class="sc-st" aria-hidden="true">Chưa chạy</span><span class="sc-btns"><button type="button" class="btn nw s-reset" title="Làm lại từ đầu" aria-label="Làm lại từ đầu">↺</button><button type="button" class="btn nw s-back" disabled title="Lùi lại một bước">← Lùi</button><button type="button" class="btn s-step">Từng bước</button><button type="button" class="btn pri s-run">▶ Chạy</button></span></div>
  </div>`;
  const $=s=>root.querySelector(s),svg=$(".k-svg"),svgw=$(".k-svgw"),stage=$(".sim-stage"),sc=$(".st-scroll"),chip=$(".s-chip"),ctlSt=$(".sc-st");
  const bStep=$(".s-step"),bRun=$(".s-run"),bBack=$(".s-back"),bReset=$(".s-reset"),logEl=$(".k-log");
  const secOf=k=>root.querySelector(`.pn[data-sec="${k}"]`),navB=k=>root.querySelector(`.st-nav [data-go="${k}"]`);
  /* ---- khung cuộn: tên phần, chấm báo có dòng mới, chỉ cuộn khung ---- */
  root.querySelectorAll(".st-nav button").forEach(b=>b.onclick=()=>{const s=secOf(b.dataset.go);sc.scrollTo({top:s.offsetTop-sc.offsetTop,behavior:RED()?"auto":"smooth"});b.classList.remove("new")});
  function navAct(){let cur="ops";root.querySelectorAll(".st-scroll .pn").forEach(s=>{if(s.offsetTop-sc.offsetTop-sc.scrollTop<=40)cur=s.dataset.sec});
    root.querySelectorAll(".st-nav button").forEach(b=>{b.classList.toggle("on",b.dataset.go===cur);if(b.dataset.go===cur)b.classList.remove("new")})}
  sc.addEventListener("scroll",navAct,{passive:true});
  const seen=k=>{const s=secOf(k),t=s.offsetTop-sc.offsetTop-sc.scrollTop;return t<sc.clientHeight*.85&&t+s.offsetHeight>30};
  function hold(){root.querySelectorAll(".st-scroll .pn").forEach(s=>{const h=s.offsetHeight;if(h>(s._mh||0)){s._mh=h;s.style.minHeight=h+"px"}})}
  function unhold(){root.querySelectorAll(".st-scroll .pn").forEach(s=>{s._mh=0;s.style.minHeight=""})}
  function fitStage(){const r=stage.getBoundingClientRect();if(!r.height)return;let top=0;document.querySelectorAll(".top,.lbar,.ltoc").forEach(h=>{const q=h.getBoundingClientRect(),cs=getComputedStyle(h);if(q.height&&cs.position==="sticky"&&cs.display!=="none")top=Math.max(top,(parseFloat(cs.top)||0)+(h.open&&h.querySelector("summary")?h.querySelector("summary").offsetHeight:q.height))});
    const want=top+8;if(r.top<want-2||r.bottom>innerHeight+2)window.scrollBy({top:r.top-want,behavior:RED()?"auto":"smooth"})}
  /* ---- nạp mạch ---- */
  function loadCircuit(i){ci=i;C=CIRC[i];sim=E.create(C,{seed:cfg.seed||1});sim.settle();
    const pre=$(".s-pre");pre.innerHTML=`<option value="0">Tự thao tác (bấm thiết bị trên sơ đồ)</option>`+(C.scenarios||[]).map((s,j)=>`<option value="${j+1}">${H(s.label)}</option>`).join("");
    const cx0=C.power?0:0;PG=C.power?powerGeo(C.power):null;LAY=layout(C,(PG?PG.w+24:0)+64);
    root.querySelector(".k-views").hidden=!PG;view=PG&&MOB()?"ctl":"all";views();
    scen=Math.min(cfg.scenario||0,(C.scenarios||[]).length);pre.value=String(scen);reset(true)}
  function reset(first){stop();sim.reset();sim.settle();sim.S.log=[];if(scen>0)sim.load(C.scenarios[scen-1]);hist=[];mode="idle";ask=null;held={};faultKind="";
    unhold();stage.classList.remove("live");logEl.innerHTML="";
    const note=scen>0?C.scenarios[scen-1].note:C.summary,n=$(".s-note");$(".sn-h").textContent=scen>0?"Kịch bản này":"Mạch này";$(".sn-1").textContent=note||"";
    $(".sn-t").innerHTML=`<p>${H(note||"")}</p>`+(scen>0?`<p class="k-sum">${H(C.summary||"")}</p>`:"")+`<p class="k-codes">Mã mô phỏng: ${(C.sims||[]).map(H).join(", ")}</p>`;
    n.open=!MOB();
    $(".k-ab").innerHTML=aboutHTML();ops();say(scen>0?"Bấm <b>Từng bước</b> để xem kịch bản từng thao tác, hoặc <b>▶ Chạy</b>.":"Bấm vào nút nhấn, công tắc trên sơ đồ (hoặc ở Bảng thao tác). <b>Từng bước</b>: tự xem lan truyền từng bước.");
    paint();status();if(!first)hold()}
  /* ---- vẽ ---- */
  function paint(){const V=sim.view(),pend=new Set(V.pending.map(p=>p.k));const s=[];
    const cx0=(PG?PG.w+24:0)+64;
    const showP=PG&&view!=="ctl",showC=view!=="pwr";
    if(showC){const L=LAY,elv={};V.els.forEach(e=>elv[e.id]=e);
      const anyCur=ids=>ids.some(i=>elv[i]&&elv[i].cur);
      /* thanh nguồn */
      const sup=C.supply||{},prot=sup.prot,pv=prot?V.dev[prot]:null,live=V.sup&&(!pv||pv.ok);
      const xs=L.cols.map(c=>L.X(c)),xR=xs[xs.length-1]||cx0;
      s.push(`<text class="tg" x="${cx0-60}" y="${YR-22}">${H(sup.plus||"+")}</text><text class="tg" x="${cx0-60}" y="${L.yBot+18}">${H(sup.minus||"0")}</text>`);
      s.push(`<path class="w ${V.sup?(L.paths.some(anyCur)?"cur":"live"):""}" d="M${cx0-60},${YR}H${cx0-44}"/>`);
      if(prot){s.push(`<rect class="fuse ${pv.ok?"":"blown"}" x="${cx0-44}" y="${YR-6}" width="26" height="12"/><path class="w ${live?(L.paths.some(anyCur)?"cur":"live"):""}" d="M${cx0-44},${YR}h26"/><text class="tg" x="${cx0-31}" y="${YR+20}" text-anchor="middle">${H(prot)}</text>`);
        s.push(`<rect class="hit" data-dev="${H(prot)}" x="${cx0-48}" y="${YR-16}" width="34" height="28"/>`);if(!pv.ok)s.push(`<text class="tg err" x="${cx0-31}" y="${YR+34}" text-anchor="middle">đứt</text>`)}
      let xl=cx0-18;xs.forEach((x,p)=>{const rest=L.paths.slice(p).flat();s.push(`<path class="w rail ${live?(anyCur(rest)?"cur":"live"):""}" d="M${xl},${YR}H${x}"/>`);
        s.push(`<path class="w rail ${anyCur(rest)?"cur":""}" d="M${xl},${L.yBot}H${x}"/>`);xl=x;
        s.push(`<text class="pno" x="${x}" y="${YR-8}" text-anchor="middle">${p+1}</text>`)});
      s.push(`<path class="w rail" d="M${cx0-60},${L.yBot}H${cx0-18}"/>`);
      L.segs.forEach(g=>{const r=elv[g.b.live];const lv=r&&(g.b.side==="A"?r.liveA:r.liveB);s.push(`<path class="w ${anyCur(g.b.ids)?"cur":lv?"live":""}" d="${g.d}"/>`)});
      L.bus.forEach(([x,y])=>s.push(`<circle class="dot" cx="${x}" cy="${y}" r="2.4"/>`));
      L.leaves.forEach(f=>{const v=elv[f.id],D=C.devices[f.dev],st=V.dev[f.dev];
        const op=OPS.includes(D.type)||(D.type==="ol"&&false),fk=faultKind&&canFault(faultKind,f,D);
        s.push(`<g class="el ${op?"op":""} ${fk?"fk":""} ${st&&st.act?"act":""}" data-el="${f.id}" data-dev="${H(f.dev)}">`);
        s.push(f.load?coilSVG(f,v,D,st,pend.has(f.dev)):contactSVG(f,v,D,st));
        if(op||fk)s.push(`<rect class="hit" x="${f.x-34}" y="${f.y+2}" width="58" height="${RH-4}"/>`);
        s.push(`</g>`)});
      /* tham chiếu chéo dưới cuộn: tiếp điểm của thiết bị nằm ở cột nào */
      L.leaves.filter(f=>f.term==="A1-A2").forEach(f=>{const xr=L.leaves.filter(g=>g.dev===f.dev&&!g.load).map(g=>g.term+"→"+(g.p+1));
        if(xr.length)s.push(`<text class="xr" x="${f.x}" y="${L.yBot+14}" text-anchor="middle">${H(xr.slice(0,3).join(" "))}</text>`)});
    }
    if(showP)s.push(powerSVG(PG,V,C));
    const wC=LAY.width,hC=LAY.yBot+26,w=showC?wC:PG.w+10,h=Math.max(showC?hC:0,showP?PG.h+10:0);
    const x0=showC||!PG?0:0;svg.setAttribute("viewBox",`${x0} 0 ${w} ${h}`);svg.dataset.w=w;svg.dataset.h=h;
    svg.setAttribute("aria-label","Sơ đồ "+C.title+(PG?": mạch động lực và mạch điều khiển":": mạch điều khiển"));
    svg.innerHTML=(showC&&!showP&&PG?`<g transform="translate(${-(PG.w+24)},0)">`:"")+s.join("")+(showC&&!showP&&PG?"</g>":"");
    if(showC&&!showP&&PG){svg.setAttribute("viewBox",`0 0 ${wC-(PG.w+24)} ${hC}`);svg.dataset.w=wC-(PG.w+24)}
    fit();state(V);timing();logs();ops(true)}
  function fit(){const w=+svg.dataset.w,h=+svg.dataset.h,bw=svgw.clientWidth||300,bh=svgw.clientHeight||300;const s=Math.min(bw/w,bh/h)*zoom;svg.style.width=Math.floor(w*s)+"px";svg.style.height=Math.floor(h*s)+"px"}
  function views(){root.querySelectorAll(".k-views button").forEach(b=>b.classList.toggle("on",b.dataset.v===view))}
  root.querySelectorAll(".k-views button").forEach(b=>b.onclick=()=>{view=b.dataset.v;views();paint()});
  root.querySelectorAll(".k-zoom button").forEach(b=>b.onclick=()=>{const z=+b.dataset.z;zoom=z===0?1:Math.max(1,Math.min(4,zoom*(z>0?1.4:1/1.4)));fit()});
  if(window.ResizeObserver)new ResizeObserver(()=>fit()).observe(svgw);
  /* kéo để xem khi đã phóng to */
  {let d=null;svgw.addEventListener("pointerdown",e=>{if(zoom<=1||e.target.closest(".hit"))return;d={x:e.clientX,y:e.clientY,l:svgw.scrollLeft,t:svgw.scrollTop}});
   svgw.addEventListener("pointermove",e=>{if(!d)return;svgw.scrollLeft=d.l-(e.clientX-d.x);svgw.scrollTop=d.t-(e.clientY-d.y)});
   ["pointerup","pointerleave","pointercancel"].forEach(k=>svgw.addEventListener(k,()=>d=null))}
  /* ---- bảng thao tác ---- */
  function canFault(k,f,D){if(k==="open")return true;if(k==="weld")return!f.load&&D.type!=="fuse";if(k==="burn")return f.load;if(k==="short")return f.load;return false}
  function ops(update){const box=$(".k-ops"),V=sim.view();
    const opBtn=k=>{const D=C.devices[k],s=V.dev[k],nm=`<b>${H(k)}</b> ${H(D.name||TYPE_VI[D.type])}`;let t,cls="";
      if(D.type==="pb"){t=s.act?"đang giữ · bấm để nhả":"nhấn giữ";cls=s.act?"act":""}
      else if(D.type==="estop"){t=s.act?"đang khóa · xoay nhả":"đập dừng khẩn";cls=s.act?"act es":"es"}
      else if(D.type==="ls"){t=s.act?"đang bị tác động · nhả":"tác động";cls=s.act?"act":""}
      else{t="vị trí "+(s.act?"1":"0")+" · gạt";cls=s.act?"act":""}
      return`<button type="button" class="btn k-op ${cls} c-${H(D.color||"")}" data-op="${H(k)}" aria-pressed="${s.act?"true":"false"}">${nm}<small>${t}</small></button>`};
    const devK=Object.keys(C.devices);
    const prot=devK.filter(k=>["fuse","mcb","cb3","ol"].includes(C.devices[k].type));
    const mot=C.power&&C.power.M,olk=C.power&&C.power.F;
    const html=`<div class="k-grp">${devK.filter(k=>OPS.includes(C.devices[k].type)).map(opBtn).join("")}</div>
     <div class="k-grp">${prot.map(k=>{const D=C.devices[k],s=V.dev[k];
       if(D.type==="cb3")return`<button type="button" class="btn k-op ${s.on&&!s.trip?"act":""}" data-tg="${H(k)}"><b>${H(k)}</b> ${H(D.name||"")}<small>${s.trip?"đã cắt · đóng lại":s.on?"đang đóng · cắt":"đang cắt · đóng"}</small></button>`;
       if(D.type==="ol")return`<button type="button" class="btn k-op ${s.trip?"bad":""}" data-rs="${H(k)}"><b>${H(k)}</b> ${H(D.name||"")}<small>${s.trip?"đã tác động · bấm reset":"bình thường"}</small></button>`;
       return`<button type="button" class="btn k-op ${s.ok?"":"bad"}" data-rs="${H(k)}"><b>${H(k)}</b> ${H(D.name||"")}<small>${s.ok?"tốt":D.type==="fuse"?"đã đứt · thay cầu chì":"đã cắt · đóng lại"}</small></button>`}).join("")}
       <button type="button" class="btn k-op ${V.sup?"act":"bad"}" data-sup="1"><b>Nguồn</b> điều khiển<small>${V.sup?"có điện · cắt điện":"mất điện · cấp lại"}</small></button></div>
     ${mot?`<div class="k-row"><label>Tải động cơ <select class="k-load">${[["0.5","0,5 × In"],["1","1 × In (định mức)"],["1.3","1,3 × In"],["2","2 × In"],["ket","Rôto bị kẹt"]].map(([v,t])=>`<option value="${v}">${t}</option>`).join("")}</select></label>
       ${olk?`<label>Dòng chỉnh ${H(olk)} <select class="k-ir">${["0.8","0.9","1","1.1","1.2"].map(v=>`<option value="${v}">Ir = ${v.replace(".",",")} × In</option>`).join("")}</select></label>`:""}</div>`:""}
     <div class="k-row"><label>Tốc độ thời gian khi Chạy <select class="k-spd">${[1,5,20].map(v=>`<option value="${v}">× ${v}</option>`).join("")}</select></label></div>
     <div class="k-row k-flt"><label>Chèn lỗi (tìm lỗi) <select class="k-fk"><option value="">Không chèn lỗi</option><option value="open">Đứt dây: chọn phần tử</option><option value="weld">Dính tiếp điểm: chọn tiếp điểm</option><option value="burn">Cháy cuộn / bóng đèn: chọn cuộn, đèn</option><option value="short">Ngắn mạch tải: chọn cuộn, đèn</option>
       ${devK.some(k=>C.devices[k].type==="contactor")?`<option value="stuck">Kẹt lõi contactor</option>`:""}${olk?`<option value="trip">Relay nhiệt tác động</option>`:""}${C.power?`<option value="phase">Mất pha</option>`:""}</select></label>
       <span class="k-fx"></span><button type="button" class="btn k-clr">Gỡ hết lỗi</button></div>`;
    if(update&&box.dataset.c===C.id){/* chỉ đổi chữ, giữ nguyên các ô chọn đang mở */
      const tmp=document.createElement("div");tmp.innerHTML=html;const a=box.querySelectorAll(".k-op"),b=tmp.querySelectorAll(".k-op");
      if(a.length===b.length){a.forEach((x,i)=>{x.className=b[i].className;x.innerHTML=b[i].innerHTML;if(b[i].hasAttribute("aria-pressed"))x.setAttribute("aria-pressed",b[i].getAttribute("aria-pressed"))});fx();return}}
    box.dataset.c=C.id;box.innerHTML=html;
    box.querySelectorAll("[data-op]").forEach(b=>b.onclick=()=>operate(b.dataset.op));
    box.querySelectorAll("[data-tg]").forEach(b=>b.onclick=()=>doAct({do:"toggle",dev:b.dataset.tg}));
    box.querySelectorAll("[data-rs]").forEach(b=>b.onclick=()=>doAct({do:"reset",dev:b.dataset.rs}));
    box.querySelector("[data-sup]").onclick=()=>doAct({do:"supply",on:!sim.S.sup});
    const ld=box.querySelector(".k-load");if(ld){ld.value=String(V.dev[mot].load);ld.onchange=()=>doAct({do:"load",val:ld.value==="ket"?"ket":+ld.value})}
    const ir=box.querySelector(".k-ir");if(ir){ir.value=String(V.dev[olk].ir);ir.onchange=()=>doAct({do:"ir",dev:olk,val:+ir.value})}
    const sp=box.querySelector(".k-spd");sp.value=String(speed);sp.onchange=()=>speed=+sp.value;
    const fk=box.querySelector(".k-fk");fk.value=faultKind;fk.onchange=()=>{faultKind=fk.value;fx();paint()};
    box.querySelector(".k-clr").onclick=()=>{faultKind="";doAct({do:"clear"})};fx()}
  function fx(){const el=$(".k-fx"),k=faultKind;if(!el)return;
    if(!k){el.innerHTML="";return}
    if(k==="stuck"){const L=Object.keys(C.devices).filter(d=>C.devices[d].type==="contactor");el.innerHTML=L.map(d=>`<button type="button" class="btn" data-st="${H(d)}">${H(d)}${sim.S.f.stuck[d]?" ✓":""}</button>`).join("");el.querySelectorAll("[data-st]").forEach(b=>b.onclick=()=>doAct({do:"fault",kind:"stuck",target:b.dataset.st,on:!sim.S.f.stuck[b.dataset.st]}));return}
    if(k==="trip"){el.innerHTML=`<button type="button" class="btn" data-tr="1">${H(C.power.F)} tác động</button>`;el.querySelector("[data-tr]").onclick=()=>doAct({do:"fault",kind:"trip",target:C.power.F});return}
    if(k==="phase"){el.innerHTML=[1,2,3].map(i=>`<button type="button" class="btn" data-ph="${i}">L${i}${sim.S.f.phase[i]?" ✓":""}</button>`).join("");el.querySelectorAll("[data-ph]").forEach(b=>b.onclick=()=>doAct({do:"fault",kind:"phase",target:+b.dataset.ph,on:!sim.S.f.phase[b.dataset.ph]}));return}
    el.innerHTML=`<small>Bấm vào phần tử có viền cam trên sơ đồ (bấm lần nữa để gỡ).</small>`}
  svg.addEventListener("click",e=>{const g=e.target.closest("[data-dev]");if(!g)return;const dev=g.dataset.dev,elid=g.dataset.el,D=C.devices[dev];
    if(faultKind&&elid&&["open","weld","burn","short"].includes(faultKind)){const f=LAY.leaves.find(x=>x.id===elid);if(!canFault(faultKind,f,D))return;
      const tgt=faultKind==="burn"?dev:elid,box=sim.S.f[faultKind];doAct({do:"fault",kind:faultKind,target:tgt,on:!box[tgt]});return}
    if(OPS.includes(D.type))operate(dev);else if(D.type==="cb3")doAct({do:"toggle",dev});else if(D.type==="fuse"||D.type==="mcb")doAct({do:"reset",dev})});
  function operate(k){const D=C.devices[k],s=sim.S.dev[k];
    if(D.type==="pb"||D.type==="ls")doAct({do:s.act?"release":"press",dev:k});else if(D.type==="estop")doAct({do:s.act?"release":"press",dev:k});else doAct({do:"toggle",dev:k})}
  /* ---- thao tác: chụp trạng thái để Lùi, áp dụng, rồi lan truyền theo chế độ ---- */
  function snap(){hist.push(sim.snapshot());if(hist.length>300)hist.shift()}
  function doAct(a){ask=null;snap();sim.act(a);
    if(mode==="idle"||mode==="done"){mode="run";live(true);start()}
    else if(mode==="step")say("Đã thao tác. Bấm <b>Bước tiếp →</b> để xem lan truyền từng bước.");
    paint();status();hold()}
  /* ---- một bước (Từng bước / Bước tiếp) ---- */
  function predQ(){if(!$(".k-pred").checked)return null;const P=sim.pending();if(!P.length)return null;
    const coils=Object.keys(C.devices).filter(k=>["relay","contactor","ton","tof"].includes(C.devices[k].type));
    const opts=coils.map(k=>({k,t:k+(sim.S.dev[k].on?" nhả":" hút")})).concat([{k:"",t:"Không thiết bị nào"}]);
    return{q:"Ở bước tiếp theo, cuộn nào đổi trạng thái?",o:opts,a:new Set(P.map(p=>p.k))}}
  function stepOnce(){if(ask)return;const q=predQ();
    if(q){ask=q;say(`<div class="k-qa"><p><b>Đoán trước:</b> ${H(q.q)}</p><div class="k-qo">${q.o.map((o,j)=>`<button type="button" class="btn" data-j="${j}">${H(o.t)}</button>`).join("")}</div></div>`);
      root.querySelectorAll(".k-qo button").forEach(b=>b.onclick=()=>{const o=q.o[+b.dataset.j],ok=q.a.has(o.k);ask=null;doStep(`<p class="k-fb ${ok?"ok":"bad"}">${ok?"✓ Đúng.":"✗ Chưa đúng."} Cuộn đổi ở bước này: ${H([...q.a].join(", "))}.</p>`)});
      scrollTo("log");return}
    doStep("")}
  function doStep(fb){snap();const r=sim.step();if(r.type==="idle"){hist.pop();mode=mode==="run"?"run":"step";if(!fb)say(doneText())}
    else if(fb)say(fb+lastSay());else say(lastSay());
    paint();status();hold();return r}
  function lastSay(){const L=sim.S.log;if(!L.length)return"";const n=L[L.length-1].n;const cur=L.filter(x=>x.n===n);return cur.map(x=>`<p class="k-l ${x.kind}">${H(x.msg)}</p>`).join("")}
  function doneText(){const v=sim.view();if(v.chatter)return"<p>Mạch rung: lan truyền đã dừng. Thao tác lại hoặc bấm ↺.</p>";
    if(scen>0&&!sim.nextAction())return"<p><b>Đã chạy xong kịch bản.</b> Có thể tiếp tục bấm thiết bị để thử thêm, hoặc chọn kịch bản khác.</p>";
    return"<p>Mạch đã ổn định: không còn cuộn nào đổi trạng thái"+(v.events.length?", có sự kiện chờ theo thời gian.":".")+"</p>"}
  function say(h){$(".k-say").innerHTML=h}
  /* ---- chạy liên tục: mỗi việc rời rạc (bước lan truyền, thao tác kịch bản, sự kiện) cách nhau một nhịp, thời gian trôi theo đồng hồ thật × tốc độ ---- */
  const BEAT=420;
  function start(){if(timer)return;lastT=performance.now();pause=0;timer=setInterval(tick,60)}
  function stop(){if(timer){clearInterval(timer);timer=null}}
  function tick(){const now=performance.now(),dt=Math.min(.25,(now-lastT)/1000);lastT=now;
    if(!root.isConnected){stop();return}
    if(pause>0){pause-=dt*1000;return}
    const na0=sim.nextAction();
    if((!sim.stable()&&!sim.S.chatter)||(na0&&na0.wait==null)){const r=doStep("");if(r.type!=="idle"){pause=BEAT;return}}
    /* thời gian trôi: tới sự kiện kế tiếp hoặc hết lượt chờ của kịch bản */
    const ev=sim.events()[0],na=sim.nextAction(),d=dt*speed;
    if(na&&na.wait!=null){const Q=sim.S.scen,left=Q.left==null?na.wait:Q.left;
      if((ev&&ev.t-sim.S.t<=Math.min(d,left)+1e-9)||left<=d+1e-9){doStep("");pause=BEAT;return}
      Q.left=left-d;sim.advance(d);paintLite();return}
    if(ev&&ev.t-sim.S.t<=d+1e-9){doStep("");pause=BEAT;return}
    if(scen>0&&!na&&!ev){mode="done";stop();status();say(doneText());return}
    sim.advance(d);paintLite()}
  function paintLite(){$(".k-t").textContent="t = "+fmt(sim.S.t)+" s";state(sim.view())}
  function live(on){if(on&&!stage.classList.contains("live")){stage.classList.add("live");fitStage()}}
  bStep.onclick=()=>{if(mode==="run"){stop()}if(mode!=="step"){mode="step";live(true)}stepOnce();status()};
  bRun.onclick=()=>{if(mode==="run"){stop();mode="step";status();say("Đã tạm dừng. Bấm <b>Bước tiếp →</b> để đi từng bước, hoặc <b>▶ Chạy tiếp</b>.");return}
    if(mode==="done")reset();ask=null;mode="run";live(true);start();status()};
  bBack.onclick=()=>{if(mode==="run")return;const s=hist.pop();if(!s)return;sim.restore(s);ask=null;mode="step";say("Đã lùi một bước."+lastSay());paint();status()};
  bReset.onclick=()=>reset();
  $(".s-pre").onchange=()=>{scen=+$(".s-pre").value;reset()};
  const cs=$(".k-circ");if(cs)cs.onchange=()=>{zoom=1;loadCircuit(+cs.value)};
  function status(){const v=sim.view();let t,c;
    if(v.chatter){t="Mạch rung (chattering)";c="err"}
    else if(mode==="run"){t=scen>0?"Đang chạy kịch bản…":"Đang chạy · bấm thiết bị để thao tác";c="run"}
    else if(mode==="step"){t=ask?"Đang chờ bạn đoán":!sim.stable()?"Từng bước · còn cuộn chờ đổi":scen>0&&sim.nextAction()?"Từng bước · chờ thao tác kế tiếp":"Từng bước · mạch ổn định";c="step"}
    else if(mode==="done"){t="Đã chạy xong";c="ok"}else{t="Chưa chạy";c="idle"}
    chip.textContent=t;chip.className="s-chip "+c;ctlSt.textContent=t+" · t = "+fmt(v.t)+" s · bước "+v.n;ctlSt.className="sc-st "+c;
    bStep.textContent=mode==="step"?"Bước tiếp →":"Từng bước";bRun.textContent=mode==="run"?"Tạm dừng":mode==="step"?"▶ Chạy tiếp":"▶ Chạy";bRun.classList.toggle("stop",mode==="run");
    bBack.disabled=mode==="run"||!hist.length;bStep.disabled=false;$(".k-t").textContent="t = "+fmt(v.t)+" s";$(".k-n").textContent="bước "+v.n;
    $(".k-hint").innerHTML=faultKind?"<b>Chèn lỗi:</b> bấm phần tử có viền cam trên sơ đồ.":"Bấm nút, công tắc trên sơ đồ để thao tác. <span class=\"k-lg\"><span class=\"k-sw cur\"></span>có dòng</span> <span class=\"k-lg\"><span class=\"k-sw live\"></span>có điện áp</span>"}
  /* ---- trạng thái thiết bị ---- */
  function state(V){const rows=[],pend=V.pending;
    for(const k in C.devices){const D=C.devices[k],s=V.dev[k];let t="",cls="";
      switch(D.type){
        case"pb":case"ls":t=s.act?"đang nhấn / tác động":"nghỉ";cls=s.act?"on":"";break;
        case"estop":t=s.act?"đã đập (khóa)":"nghỉ";cls=s.act?"bad":"";break;
        case"sel":case"sw":t="vị trí "+(s.act?1:0);cls=s.act?"on":"";break;
        case"relay":case"contactor":t=(s.on?"hút":"nhả")+(V.f.stuck[k]?" · LỖI: kẹt lõi":"")+(V.f.burn[k]?" · LỖI: cháy cuộn":"")+(s.blocked?" · bị khóa cơ khí":"");cls=s.on||V.f.stuck[k]?"on":"";break;
        case"ton":case"tof":{const el=s.t0!=null?Math.min(D.T,V.t-s.t0):0;t=(s.on?"cuộn có điện":"cuộn mất điện")+" · tiếp điểm trễ "+(s.out?"đã đổi":"chưa đổi")+(s.t0!=null&&((D.type==="ton"&&s.on&&!s.out)||(D.type==="tof"&&!s.on&&s.out))?` · đang đếm ${fmt(el)}/${fmt(D.T)} s`:"");cls=s.out?"on":"";break}
        case"ol":{const tt=sim.thTrip(k),pc=Math.min(100,Math.round(100*s.th/tt));t=(s.trip?"ĐÃ TÁC ĐỘNG · ":"")+`nhiệt ${pc}% ngưỡng · dòng ${fmt(sim.olX(k))} × Ir`;cls=s.trip?"bad":pc>70?"warn":"";break}
        case"fuse":case"mcb":t=s.ok?"tốt":(D.type==="fuse"?"ĐỨT":"ĐÃ CẮT");cls=s.ok?"":"bad";break;
        case"cb3":t=s.trip?"ĐÃ CẮT (sự cố)":s.on?"đóng":"cắt";cls=s.trip?"bad":s.on?"on":"";break;
        case"lamp":t=s.on?"sáng":"tắt";cls=s.on?"on":"";break;
        case"motor":t=sim.motorText()+(s.x?` · dòng ≈ ${fmt(s.x)} × In`:"");cls=s.conn==="off"?"":s.conn==="loss"||s.phase==="locked"?"bad":"on";break}
      rows.push(`<tr class="${cls}"><th scope="row">${H(k)}</th><td>${H(D.name||TYPE_VI[D.type]||"")}</td><td>${H(t)}</td></tr>`)}
    $(".k-st").innerHTML=`<div class="tbl"><table><thead><tr><th scope="col">Mã</th><th scope="col">Thiết bị</th><th scope="col">Trạng thái</th></tr></thead><tbody>${rows.join("")}</tbody></table></div>`+
      `<p class="k-pl">${pend.length?"Chờ đổi ở bước sau: "+pend.map(p=>H(p.k)+(p.want?" → hút":" → nhả")).join(", "):V.events.length?"Sự kiện kế tiếp: "+H(evText(V.events[0]))+" lúc t = "+fmt(V.events[0].t)+" s":"Mạch ổn định."}</p>`;
    $(".k-pend").textContent=pend.length?pend.length+" cuộn chờ đổi":""}
  const evText=e=>e.kind==="ton"?e.k+" hết thời gian trễ đóng":e.kind==="tof"?e.k+" hết thời gian trễ mở":e.kind==="ol"?e.k+" tác động (dự kiến)":e.kind==="mstart"?e.k+" hết giai đoạn khởi động":e.k;
  /* ---- giản đồ thời gian: trục ngang theo thứ tự sự kiện, khoảng cách tăng theo thời gian trôi ---- */
  function timing(){const tr=sim.S.tr,sg=sim.sigs(),box=$(".k-td");if(!tr.length){box.innerHTML="";return}
    const Wp=Math.max(280,(box.clientWidth||sc.clientWidth||320)-8),lw=62,rh=20,hh=sg.length*rh+26;
    const xs=[0];for(let i=1;i<tr.length;i++){const dt=tr[i].t-tr[i-1].t;xs.push(xs[i-1]+(dt>1e-9?Math.min(70,14+16*Math.log2(1+dt)):7))}
    let i0=0;const span=Wp-lw-12;while(xs[xs.length-1]-xs[i0]>span&&i0<tr.length-1)i0++;
    const X=i=>lw+(xs[i]-xs[i0]);const out=[];
    sg.forEach((s,r)=>{const y=r*rh+4,yh=y+3,yl=y+rh-5;out.push(`<text class="tl" x="2" y="${y+rh-7}">${H(s.label)}</text>`);
      let d="";for(let i=i0;i<tr.length;i++){const v=tr[i].v[s.id],yy=s.kind==="motor"?(v===0?yl:v===0.5?(yl+yh)/2:yh):(v?yh:yl);d+=(i===i0?`M${X(i)},${yy}`:`V${yy}`)+(i<tr.length-1?`H${X(i+1)}`:`h10`)}
      out.push(`<path class="tw ${s.kind}" d="${d}"/>`);
      if(s.kind==="motor"){for(let i=i0;i<tr.length;i++){const v=tr[i].v[s.id];if(i===i0||v!==tr[i-1].v[s.id])if(v)out.push(`<text class="tv" x="${X(i)+2}" y="${yh+8}">${v===-1?"N":v===0.5?"mất pha":"T"}</text>`)}}});
    let lastx=-99;for(let i=i0;i<tr.length;i++){if(i>i0&&tr[i].t===tr[i-1].t)continue;const x=X(i);if(x-lastx<34)continue;lastx=x;out.push(`<path class="tg-g" d="M${x},2V${sg.length*rh+4}"/><text class="tt" x="${x}" y="${sg.length*rh+18}" text-anchor="middle">${fmt(tr[i].t)}</text>`)}
    box.innerHTML=`<svg class="k-tds" width="${Wp}" height="${hh}" viewBox="0 0 ${Wp} ${hh}" role="img" aria-label="Giản đồ thời gian các tín hiệu">${out.join("")}</svg><p class="k-tdn">Trục ngang: thứ tự các bước; chữ số ở dưới là thời gian t (giây). Các bước lan truyền cùng một thời điểm được vẽ sát nhau (trong mô hình chúng không tốn thời gian).</p>`;
    $(".k-tdh").textContent=tr.length+" mẫu"}
  /* ---- nhật ký ---- */
  let shown=0;
  /* mới nhất ở trên cùng: không cần cuộn khi có dòng mới */
  function logs(){const L=sim.S.log;
    logEl.innerHTML=L.slice(-160).reverse().map(x=>`<li class="${x.kind}"><span class="k-ln">#${x.n} · ${fmt(x.t)} s</span> ${H(x.msg)}</li>`).join("");
    if(L.length>shown&&!seen("log"))navB("log").classList.add("new");shown=L.length}
  function scrollTo(k){const s=secOf(k);sc.scrollTo({top:s.offsetTop-sc.offsetTop,behavior:RED()?"auto":"smooth"})}
  function aboutHTML(){const p=sim.PRM;return`<div class="k-abt">
    <p><b>Đây là mô hình để học, không phải công cụ tính toán hay thiết kế điện.</b> Kết quả không dùng để chọn thiết bị, chỉnh relay nhiệt hay kết luận an toàn của một tủ điện thật. Không thao tác trên mạch có điện thật theo mô phỏng này; mọi thực hành có cấp nguồn phải theo quy trình an toàn của khóa học và có người hướng dẫn.</p>
    <ul>
    <li><b>Trễ đơn vị:</b> mỗi bước, mọi cuộn đang lệch (có điện mà chưa hút, mất điện mà chưa nhả) cùng đổi; tiếp điểm đổi ngay trong bước đó. Bước lan truyền không tốn thời gian trong mô hình (thực tế mỗi relay mất vài mili giây, tùy loại).</li>
    <li><b>Chạy đua:</b> trạng thái lặp lại thì mô phỏng cho từng cuộn đổi một, chọn ngẫu nhiên có hạt giống cố định (cùng thao tác cho cùng kết quả). Vẫn lặp thì báo <b>rung</b> và dừng lan truyền.</li>
    <li><b>Mạch điều khiển:</b> giải bằng điện thế nút với giá trị tương đối (tiếp điểm đóng gần 0, mỗi tải bằng 1) chỉ để tìm đường dòng điện; một tải chỉ được coi là có điện khi điện áp trên nó lớn hơn 60% điện áp nguồn (hai tải nối tiếp: không tải nào hút). Có đường từ (+) về (0) không qua tải: ngắn mạch, cầu chì/MCB cắt ngay.</li>
    <li><b>Mạch động lực:</b> chỉ theo dõi pha nào tới đầu cực nào: đúng thứ tự pha (thuận), đảo hai pha (ngược), thiếu pha, chạm pha (CB cắt ngay). Không tính dòng ngắn mạch, sụt áp, mô-men.</li>
    <li><b>Dòng động cơ (giả định):</b> khởi động ${fmt(p.kStart)} × In trong ${fmt(p.tStart)} s; nối sao bằng ${fmt(p.starF)} lần nối tam giác; chạy theo tải đặt; rôto kẹt hoặc thiếu pha khi đứng yên: ${fmt(p.kStart)} × In; thiếu pha khi đang chạy: ${fmt(p.lossF)} × dòng tải.</li>
    <li><b>Relay nhiệt (giả định):</b> nhiệt θ theo mô hình bậc nhất dθ/dt = ((I/Ir)² − θ)/τ với τ = ${fmt(p.tau)} s; tác động khi θ ≥ ${fmt(p.kTrip)}²; reset được khi θ ≤ ${fmt(p.resetTh)}. Đây không phải đường đặc tính của relay thật nào; đường thật lấy theo datasheet và cấp tác động (trip class) của hãng.</li>
    <li><b>Timer:</b> lý tưởng, đúng thời gian đặt, không sai số, không cần nguồn nuôi riêng (timer trễ mở thật có loại cần nguồn nuôi: xem datasheet).</li>
    <li><b>Ký hiệu, đầu cực:</b> vẽ theo cách thể hiện thông dụng (cuộn A1-A2; tiếp điểm thường đóng ..1-..2, thường mở ..3-..4; trễ ..5-..6, ..7-..8; relay nhiệt 95-96, 97-98). Khi lắp thật, đối chiếu sơ đồ đầu cực in trên thiết bị và datasheet. (PENDING_SCIENCE_REVIEW)</li>
    </ul><p class="k-ver">Bộ máy ${H(E.version)} · tài liệu: docs/TRINH-MO-PHONG-KCD.md</p></div>`}
  loadCircuit(ci);
  return{get sim(){return sim},step:()=>bStep.click(),run:()=>bRun.click(),el:root}
}
window.KcdUI={mount,layout,version:"0.1.0"};
})();
(function(){var s=document.createElement("style");s.setAttribute("data-sim","kcd");s.textContent="/* AMTS · Trình mô phỏng mạch điều khiển điện (khóa Khí cụ điện). Chỉ nạp trên trang khóa kcd, khi trình mô phỏng hiện ra.\n   Khung chung: platform/css/36-khung-mo-phong.css (.sim-stage, .st-panes, .sim-ctl…); ở đây chỉ thêm phần riêng. */\n.kcd-sim{--k-live:#C25A0A;--k-cur:#D9361E;--k-wire:#8A94A8;--k-on:#17734A;--k-pend:#975506;border:1px solid var(--line);border-radius:12px;background:var(--surface);margin:16px 0}\n@media (prefers-color-scheme:dark){:root:not([data-theme=\"light\"]) .kcd-sim{--k-live:#F5A04A;--k-cur:#FF7B66;--k-wire:#6F7A92;--k-on:#5ACB93;--k-pend:#F0AE52}}\n:root[data-theme=\"dark\"] .kcd-sim{--k-live:#F5A04A;--k-cur:#FF7B66;--k-wire:#6F7A92;--k-on:#5ACB93;--k-pend:#F0AE52}\n.kcd-sim .sim-stage{grid-template-columns:minmax(0,1.55fr) minmax(0,1fr)}\n.kcd-sim .sim-bar{display:flex;flex-wrap:wrap;gap:8px;align-items:center;padding:8px 12px;border-bottom:1px solid var(--line)}\n.kcd-sim .sim-bar .left{display:flex;flex-wrap:wrap;gap:8px;align-items:center;min-width:0}\n.kcd-sim .fname{font:600 13px var(--f-mono,monospace);color:var(--muted)}\n.kcd-sim select{max-width:100%;min-height:36px;border:1px solid var(--line);border-radius:8px;background:var(--surface);color:var(--ink);font-size:14px;padding:0 8px}\n.kcd-sim .sim-bar select{max-width:min(320px,calc(100vw - 64px))}\n.kcd-sim .k-predl{display:flex;align-items:center;gap:6px;font-size:14px;min-height:36px}\n.kcd-sim .s-chip{font:600 12.5px var(--f-mono,monospace);color:var(--muted)}\n.kcd-sim .s-chip.run,.kcd-sim .s-chip.step{color:var(--accent)}.kcd-sim .s-chip.ok{color:var(--ok)}.kcd-sim .s-chip.err{color:var(--err)}\n.kcd-sim .s-note .sn-t p{margin:0 0 8px}.kcd-sim .k-codes{font-size:13px;color:var(--muted)}\n/* vùng sơ đồ (thay chỗ khung code của trình mô phỏng ngôn ngữ) */\n.kcd-sim .sim-stage .editor.kcd-draw{display:flex;flex-direction:column;height:auto;min-height:0;background:var(--bg);grid-template-columns:none}\n.kcd-sim .k-dtools{flex:none;display:flex;justify-content:space-between;gap:6px;padding:6px 8px;border-bottom:1px solid var(--line);background:var(--surface)}\n.kcd-sim .k-dtools button{min-height:36px;min-width:40px;border:1px solid var(--line);background:var(--surface);color:var(--ink);border-radius:8px;padding:0 10px;font-size:13px}\n.kcd-sim .k-dtools button.on{border-color:var(--accent);color:var(--accent);background:var(--accent-soft)}\n.kcd-sim .k-views,.kcd-sim .k-zoom{display:flex;gap:4px}.kcd-sim .k-views[hidden]{display:none}\n.kcd-sim .k-svgw{flex:1;min-height:0;overflow:auto;overscroll-behavior:contain;display:grid;place-items:center;touch-action:pan-x pan-y}\n.kcd-sim .k-svg{display:block;max-width:none;user-select:none;-webkit-user-select:none}\n.kcd-sim .sim-in.k-hint{padding:6px 12px;font-size:13px;color:var(--muted);border-top:1px solid var(--line);min-height:44px;display:flex;align-items:center}\n.kcd-sim .k-sw{display:inline-block;width:18px;height:0;border-top:3px solid;vertical-align:middle;margin:0 3px}.kcd-sim .k-sw.cur{border-color:var(--k-cur)}.kcd-sim .k-sw.live{border-color:var(--k-live);border-top-style:dashed}\n/* SVG */\n.k-svg text{font-family:var(--f-mono,monospace);fill:var(--ink)}\n.k-svg .tg{font-size:12px;font-weight:700}.k-svg .tg.err,.k-svg .mdir.err{fill:var(--err)}\n.k-svg .tm{font-size:9.5px;fill:var(--muted)}.k-svg .pno{font-size:10px;fill:var(--muted)}.k-svg .xr{font-size:8.5px;fill:var(--muted)}\n.k-svg .mt{font-size:12px;font-weight:700}.k-svg .mdir{font-size:11px;font-weight:700;fill:var(--k-on)}\n.k-svg .w,.k-svg .bl{fill:none;stroke:var(--k-wire);stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}\n.k-svg .w.live,.k-svg .bl.live{stroke:var(--k-live);stroke-dasharray:5 3}\n.k-svg .w.cur,.k-svg .bl.cur{stroke:var(--k-cur);stroke-width:3;stroke-dasharray:none}\n.k-svg .w.open{stroke:var(--err);stroke-dasharray:2 4;stroke-width:2}\n.k-svg .bl{stroke-width:2.2}.k-svg .bl.cur{stroke-width:3.2}\n.k-svg .lk{fill:none;stroke:var(--muted);stroke-width:1;stroke-dasharray:3 2}\n.k-svg .ac{fill:none;stroke:var(--ink);stroke-width:1.4}.k-svg .ac.es{fill:var(--err);stroke:var(--err)}\n.k-svg .dot{fill:var(--ink)}\n.k-svg .coil{fill:var(--surface);stroke:var(--ink);stroke-width:1.6}.k-svg .coil.on{fill:var(--k-on);stroke:var(--k-on)}\n.k-svg .coil.pend{stroke:var(--k-pend);stroke-width:2.6;stroke-dasharray:4 2}\n.k-svg .lamp{fill:var(--surface);stroke:var(--ink);stroke-width:1.6}.k-svg .lx{stroke:var(--ink);stroke-width:1.2}\n.k-svg .lamp.on.c-green{fill:#3FBF6E}.k-svg .lamp.on.c-red{fill:#E5483B}.k-svg .lamp.on.c-yellow{fill:#F2C230}.k-svg .lamp.on.c-blue{fill:#4C8DF6}.k-svg .lamp.on.c-white{fill:#F4F1E4}\n.k-svg .fuse{fill:var(--surface);stroke:var(--ink);stroke-width:1.4}.k-svg .fuse.blown{stroke:var(--err);stroke-width:2.4}\n.k-svg .gap{fill:var(--bg);stroke:none}\n.k-svg .heat{fill:none;stroke:var(--ink);stroke-width:1.2}\n.k-svg .mot{fill:var(--surface);stroke:var(--ink);stroke-width:1.8}.k-svg .mot.on{stroke:var(--k-on);stroke-width:3}\n.k-svg .flt{fill:var(--err)}.k-svg .flt-x{stroke:var(--err);stroke-width:2.4}.k-svg .flt-s{stroke:var(--err);stroke-width:2.2;fill:none}\n.k-svg .hit{fill:transparent;cursor:pointer}\n.k-svg .el.op .hit:hover{fill:var(--accent-soft);fill-opacity:.35}\n.k-svg .el.fk .hit{fill:var(--warm-soft);fill-opacity:.5;stroke:var(--warm);stroke-width:1.5;stroke-dasharray:3 2}\n.k-svg .el.op.act .ac{stroke:var(--accent);stroke-width:2.2}\n/* phần theo dõi */\n.kcd-sim .pane-h{display:flex;justify-content:space-between;gap:8px;padding:8px 12px;font-weight:700;font-size:14px;border-bottom:1px solid var(--line)}\n.kcd-sim .pane-h span:last-child{font:600 12px var(--f-mono,monospace);color:var(--muted)}\n.kcd-sim .k-ops{padding:8px 10px 10px}\n.kcd-sim .k-grp{display:grid;grid-template-columns:repeat(auto-fill,minmax(138px,1fr));gap:6px;margin-bottom:8px}\n.kcd-sim .k-op{display:flex;flex-direction:column;align-items:flex-start;gap:2px;min-height:52px;padding:6px 10px;text-align:left;line-height:1.25;white-space:normal;font-size:13.5px}\n.kcd-sim .k-op small{font-size:12px;color:var(--muted)}\n.kcd-sim .k-op.act{border-color:var(--accent);background:var(--accent-soft)}.kcd-sim .k-op.bad{border-color:var(--err);background:var(--err-soft)}\n.kcd-sim .k-op.es{border-color:var(--err)}\n.kcd-sim .k-row{display:flex;flex-wrap:wrap;gap:8px 14px;align-items:center;margin:6px 0;font-size:13.5px}\n.kcd-sim .k-row label{display:flex;flex-wrap:wrap;align-items:center;gap:6px}\n.kcd-sim .k-fx{display:flex;flex-wrap:wrap;gap:6px}.kcd-sim .k-fx .btn,.kcd-sim .k-clr{min-height:40px}\n.kcd-sim .k-st .tbl{overflow-x:auto}.kcd-sim .k-st table{width:100%;border-collapse:collapse;font-size:13px}\n.kcd-sim .k-st th,.kcd-sim .k-st td{padding:5px 8px;border-bottom:1px solid var(--line);text-align:left;vertical-align:top}\n.kcd-sim .k-st tr.on td:last-child{color:var(--ok);font-weight:600}.kcd-sim .k-st tr.bad td:last-child{color:var(--err);font-weight:700}.kcd-sim .k-st tr.warn td:last-child{color:var(--warm)}\n.kcd-sim .k-pl{margin:6px 12px 10px;font-size:13px;color:var(--warm)}\n.kcd-sim .k-td{padding:6px 4px 2px;overflow:hidden}\n.k-tds .tl{font:600 10.5px var(--f-mono,monospace);fill:var(--ink)}.k-tds .tt{font:9.5px var(--f-mono,monospace);fill:var(--muted)}.k-tds .tv{font:9px var(--f-mono,monospace);fill:var(--k-on)}\n.k-tds .tw{fill:none;stroke:var(--accent);stroke-width:1.6}.k-tds .tw.motor{stroke:var(--k-on)}.k-tds .tg-g{stroke:var(--line);stroke-width:1}\n.kcd-sim .k-tdn{margin:2px 10px 8px;font-size:12px;color:var(--muted)}\n.kcd-sim .k-say{min-height:84px;padding:8px 12px;border-bottom:1px dashed var(--line);font-size:14px;line-height:1.5}\n.kcd-sim .k-say p{margin:0 0 4px}.kcd-sim .k-l.on{color:var(--ok)}.kcd-sim .k-l.off{color:var(--muted)}.kcd-sim .k-l.trip,.kcd-sim .k-l.chatter,.kcd-sim .k-l.race,.kcd-sim .k-l.warn{color:var(--err)}\n.kcd-sim .k-qo{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px}.kcd-sim .k-qo .btn{min-height:40px}\n.kcd-sim .k-fb.ok{color:var(--ok);font-weight:700}.kcd-sim .k-fb.bad{color:var(--err);font-weight:700}\n.kcd-sim .k-log{list-style:none;margin:0;padding:4px 10px 10px;font-size:13px;line-height:1.45}\n.kcd-sim .k-log li{padding:4px 0;border-bottom:1px solid var(--line)}\n.kcd-sim .k-ln{font:600 11px var(--f-mono,monospace);color:var(--muted);margin-right:4px}\n.kcd-sim .k-log li.user{color:var(--accent)}.kcd-sim .k-log li.trip,.kcd-sim .k-log li.chatter,.kcd-sim .k-log li.race,.kcd-sim .k-log li.warn,.kcd-sim .k-log li.fault{color:var(--err)}\n.kcd-sim .k-log li.timer,.kcd-sim .k-log li.motor{color:var(--ok)}\n.kcd-sim .k-abt{padding:8px 12px 12px;font-size:13.5px;line-height:1.55}.kcd-sim .k-abt ul{padding-left:18px;margin:6px 0}.kcd-sim .k-ver{font-size:12px;color:var(--muted)}\n/* đang tải */\n.kcd-wait{display:grid;place-items:center;min-height:min(520px,80vh);border:1px dashed var(--line);border-radius:12px;color:var(--muted);font-size:14px;margin:16px 0;text-align:center;padding:16px}\n@media (max-width:900px){\n  .kcd-sim .sim-stage{grid-template-columns:minmax(0,1fr);--codeH:minmax(0,1.45fr)}\n  .kcd-sim .sim-stage.live{--codeH:minmax(0,1.45fr)}\n  .kcd-sim .sim-in.k-hint,.kcd-sim .sim-stage.live .sim-in.k-hint{display:none}\n  .kcd-sim .k-dtools{padding:4px 6px}\n  .kcd-sim .k-dtools button{min-width:36px;padding:0 7px;font-size:12.5px}\n  .kcd-sim .k-grp{grid-template-columns:repeat(2,minmax(0,1fr))}\n}\n.kcd-sim .k-lg{white-space:nowrap;margin-left:8px}\n";document.head.appendChild(s)})();
