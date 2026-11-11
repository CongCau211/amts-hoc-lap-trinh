/* Mạch số Lab · bộ máy mô phỏng mức cổng, trễ đơn vị (unit-delay).
   Mỗi bước: mọi cổng/khối "chưa ổn định" cập nhật cùng lúc theo giá trị cũ (giống mạch thật, mỗi cổng trễ 1 đơn vị).
   Nếu trạng thái lặp lại (dao động, ví dụ thả S=R=1 của chốt SR) thì chuyển sang cập nhật từng cổng ngẫu nhiên:
   mô phỏng việc ngoài đời hai cổng không bao giờ nhanh bằng nhau tuyệt đối. */
function evalG(t,a){let r;switch(t){case 'not':return a[0]?0:1;case 'and':case 'nand':r=a.every(x=>x)?1:0;break;case 'or':case 'nor':r=a.some(x=>x)?1:0;break;case 'xor':case 'xnor':r=a.reduce((p,x)=>p^x,0)}return t[0]==='n'||t==='xnor'?1-r:r}
function makeSim(C){
  const V={},blocks={};
  (C.inputs||[]).forEach(i=>V[i.id]=i.init||0);
  (C.gates||[]).forEach(g=>V[g.id]=(C.init&&C.init[g.id])||0);
  (C.blocks||[]).forEach(b=>{blocks[b.id]={state:0,last:0};V[b.id+'.Q']=0;V[b.id+'.Qn']=1});
  (C.blocks||[]).forEach(b=>blocks[b.id].last=V[b.clk]);
  return{V,blocks};
}
function unstable(C,S,lbl){
  const {V,blocks}=S,ups=[];
  (C.gates||[]).forEach(g=>{const a=g.in.map(s=>V[s]),v=evalG(g.type,a);
    if(v!==V[g.id])ups.push({id:g.id,msg:(g.label?g.id+' ('+g.label+')':g.id)+': '+g.type.toUpperCase()+'('+g.in.map(s=>lbl(s)+'='+V[s]).join(', ')+') = '+v,apply(){V[g.id]=v}})});
  (C.blocks||[]).forEach(b=>{const rb=blocks[b.id],clk=V[b.clk];
    if(clk!==rb.last){const edge=rb.last===0&&clk===1,d=V[b.d],ns=edge?d:rb.state;
      ups.push({id:b.id,msg:edge?b.label+': CLK ↑ → chụp D='+d+' → Q='+ns:null,apply(){rb.last=clk;rb.state=ns;V[b.id+'.Q']=ns;V[b.id+'.Qn']=1-ns}})}});
  return ups;
}
function keyOf(S){return JSON.stringify(S.V)+Object.values(S.blocks).map(b=>b.last+''+b.state).join('')}
if(typeof module!=="undefined")module.exports={evalG,makeSim,unstable,keyOf};
