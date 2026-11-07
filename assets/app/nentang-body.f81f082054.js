/* ===================== mã dùng chung của khóa (courses/nentang/course.js) ===================== */
/* Khóa Nền tảng vi điều khiển – vi xử lý (AMTS-FND-002, mã web nentang): công cụ dùng chung cho mọi bài của khóa.
   - NT: phần TÍNH (engine) của bảng bit, tách khỏi phần vẽ: đọc hằng số theo cú pháp Keil A51 / MASM (hậu tố H, B, D;
     số 0 đứng đầu khi hex bắt đầu bằng A–F) hoặc C51 (0x…), đổi ra nhị phân / hex / thập phân. Hàm thuần, không đụng DOM;
     kiểm thử: node tests/nentang/test_engine.js (đối chiếu bộ số tính độc lập bằng Python).
   - makeNtBits: phần VẼ của bảng bit tương tác (AMTS-FND-002-SIM01 Binary/Hex Bit Converter, bản 8 bit cho Bài 1).
   - makeMtLab, makeMtEx: CHÉP từ courses/maytinh/course.js (khóa AMTS-FND-001), thêm loại bài tập "base".
     makeMtLab: phòng mô phỏng chạy từng bước (chọn ví dụ, Đoán trước, Lùi / Bước tiếp / Xem hết / Làm lại); mỗi ví dụ là
     một dãy trạng thái tính sẵn do tools/author/nentang/mNN.py sinh ra và kiểm tra số liệu (assert, đối chiếu sdas8051/NASM).
     Theo docs/QUY-TAC-TRINH-MO-PHONG.md mục 5: hàng nút ngay sau phần hình, dính đáy màn hình; phần hình chỉ cao thêm (steady).
     makeMtEx: bài tập tính số (num), sắp xếp (order), phân loại (pick), nhập số theo hệ yêu cầu (base), và bài tập M4 viết
     đoạn mã Keil A51 tối ưu byte / chu kỳ máy (opt, chấm bằng NTO ở cuối file).
     Kết quả lưu như bài tập code: TRACK.ex("lN-i", đạt?, chi tiết). */
const NT={
  /* BỘ ĐỌC HEX DÙNG CHUNG cho mọi ô nhập hex của khóa (bài tập "base" hệ hex, bảng bit, ALU, ô địa chỉ Bài 7, biểu thức
     theo dõi Bài 9/11). Quyết định của chủ khóa (ủy quyền cho Claude, 06/11/2026): nhận mọi cách viết thường gặp 0FFH, FFH,
     0xFF và FF (chỉ khi ô yêu cầu hex: bare = true), không phân biệt hoa thường, bỏ khoảng trắng hai đầu; nếu hằng bắt đầu
     bằng chữ cái A–F mà thiếu số 0 đứng đầu thì vẫn nhận giá trị nhưng kèm lời nhắc (note) về cách viết trong Keil A51.
     Trả {ok:true,v,form,note} hoặc {ok:false}. */
  hexLit(s,bare){s=String(s==null?"":s).trim();let m;
    if((m=/^0x([0-9a-f]+)$/i.exec(s)))return{ok:true,v:parseInt(m[1],16),form:"C51 (0x…)",note:""};
    if((m=/^([0-9a-f]+)h$/i.exec(s)))return{ok:true,v:parseInt(m[1],16),form:"hex (hậu tố H)",note:NT.hexNote(m[1],true)};
    if(bare&&(m=/^[0-9a-f]+$/i.exec(s)))return{ok:true,v:parseInt(s,16),form:"hex",note:NT.hexNote(s,false)};
    return{ok:false}},
  /* lời nhắc khi chữ số hex đầu là chữ cái và không có số 0 đứng trước; "" nếu không cần nhắc */
  hexNote(d,h){const u=String(d).toUpperCase();if(!/^[A-F]/.test(u))return"";
    return h?`${u}H đúng giá trị; trong mã nguồn Keil A51 phải viết 0${u}H (thiếu số 0, trình dịch hiểu ${u}H là tên ký hiệu).`
      :`${u} đúng giá trị; trong mã nguồn Keil A51 viết 0${u}H (số 0 đứng đầu và hậu tố H).`},
  /* đọc một hằng số viết theo cú pháp hợp ngữ (Keil A51 / MASM) hoặc C51. Trả {ok,v,base,form,note} hoặc {ok:false,err}.
     max: giá trị lớn nhất cho phép (255 cho 1 byte). Hex đi qua NT.hexLit (FFH được nhận, kèm lời nhắc). */
  parse(s,max){s=String(s==null?"":s).trim();
    if(!s)return{ok:false,err:"Chưa nhập giá trị."};
    if(/\s/.test(s))return{ok:false,err:"Hằng số không có dấu cách ở giữa."};
    let m,base,digits,form,note="";
    const hx=NT.hexLit(s,false);
    if(hx.ok){base=16;digits=null;form=hx.form;note=hx.note}
    else if((m=/^([0-9]+)[bB]$/.exec(s))){
      if(/[2-9]/.test(m[1]))return{ok:false,err:`Hậu tố B nghĩa là nhị phân, chỉ được dùng chữ số 0 và 1 (${s} có chữ số khác).`};
      base=2;digits=m[1];form="nhị phân (hậu tố B)"}
    else if((m=/^([0-9]+)[dD]?$/.exec(s))){base=10;digits=m[1];form=/[dD]$/.test(s)?"thập phân (hậu tố D)":"thập phân (không hậu tố)"}
    else if(/^[0-9][0-9a-fA-F]*$/.test(s))return{ok:false,err:`${s} có chữ số A–F nhưng thiếu hậu tố H: trình dịch không đọc được là hex.`};
    else if(/^[a-fA-F][0-9a-fA-F]*$/.test(s))return{ok:false,err:`${s} không phải hằng số: thiếu số 0 đứng đầu và hậu tố H (viết 0${s.toUpperCase()}H).`};
    else return{ok:false,err:`Không đọc được “${s}”. Dùng dạng 165, 0A5H, 10100101B hoặc 0xA5.`};
    const v=hx.ok?hx.v:parseInt(digits,base);
    if(max!=null&&v>max)return{ok:false,err:`${s} = ${v} lớn hơn ${max}: không vừa ${max===255?"1 byte (8 bit)":"phạm vi cho phép"}.`};
    return{ok:true,v,base,form,note}},
  /* đọc câu trả lời của bài tập khi đề yêu cầu một hệ cụ thể: "hex" nhận A5, A5H, 0A5H, 0xA5 (qua NT.hexLit); "bin" nhận
     10100101, 1010 0101, 10100101B, 0b10100101; "dec" nhận số thập phân. Viết sai hệ → NaN. readx trả thêm lời nhắc. */
  read(s,f){return NT.readx(s,f).v},
  readx(s,f){s=String(s==null?"":s).trim().replace(/[\s_]+/g,"");let m;
    if(f==="hex"){const r=NT.hexLit(s,true);return r.ok?{v:r.v,note:r.note}:{v:NaN,note:""}}
    return{v:NT.read0(s,f),note:""}},
  read0(s,f){let m;
    if(f==="bin"){if((m=/^(?:0b)?([01]+)b?$/i.exec(s))&&!/^0b.*b$/i.test(s))return parseInt(m[1],2);return NaN}
    if(/^[0-9]+$/.test(s))return parseInt(s,10);return NaN},
  bin(v,n){const s=(v>>>0).toString(2).padStart(n||8,"0");return s.replace(/(.{4})(?=.)/g,"$1 ")},
  hex(v,n){return(v>>>0).toString(16).toUpperCase().padStart(n||2,"0")},
  a51(v,n){const h=NT.hex(v,n);return(/^[A-F]/.test(h)?"0":"")+h+"H"},
  ones(v){let c=0;for(;v;v>>>=1)c+=v&1;return c},
  /* các trọng số của bit 1, từ cao xuống thấp */
  terms(v,n){const t=[];for(let k=(n||8)-1;k>=0;k--)if((v>>k)&1)t.push(1<<k);return t}
};
function makeNtBits(el,cfg){
  /* phần vẽ: chỉ đọc / ghi giá trị qua NT, không tự tính */
  cfg=cfg||{};const P="ntb-"+(cfg.id||"x");let v=cfg.v||0;
  el.classList.add("nt-bits");
  el.innerHTML=`<div class="nt-in"><label for="${P}-in">Nhập hằng số</label><input id="${P}-in" type="text" inputmode="text" autocomplete="off" spellcheck="false" placeholder="ví dụ 0A5H" aria-describedby="${P}-err"><button type="button" class="btn" id="${P}-clr">Về 00H</button><button type="button" class="btn" id="${P}-inv">Đảo mọi bit</button></div>
   <p class="nt-err" id="${P}-err" role="status" aria-live="polite"></p>
   <div class="nt-tg" role="group" aria-label="8 bit, bấm để đổi 0 ↔ 1">${[7,6,5,4,3,2,1,0].map(k=>`<button type="button" data-k="${k}" aria-pressed="false" aria-label="Bit ${k}, trọng số ${1<<k}"><small>bit ${k}</small><b>0</b><small>${1<<k}</small></button>`).join("")}</div>
   <dl class="nt-out" aria-live="polite"><dt>Nhị phân</dt><dd id="${P}-b"></dd><dt>Hex (A51 / MASM)</dt><dd id="${P}-h"></dd><dt>Hex (C51)</dt><dd id="${P}-c"></dd><dt>Thập phân</dt><dd id="${P}-d"></dd><dt>Tổng trọng số</dt><dd id="${P}-t"></dd><dt>Nibble cao · thấp</dt><dd id="${P}-n"></dd><dt>Số bit 1</dt><dd id="${P}-o"></dd></dl>`;
  const $=s=>el.querySelector("#"+P+"-"+s),inp=$("in");
  function show(){el.querySelectorAll(".nt-tg button").forEach(b=>{const on=(v>>+b.dataset.k)&1;b.setAttribute("aria-pressed",on?"true":"false");b.querySelector("b").textContent=on});
    $("b").textContent=NT.bin(v,8)+"B";$("h").textContent=NT.a51(v,2);$("c").textContent="0x"+NT.hex(v,2);$("d").textContent=v;
    const t=NT.terms(v,8);$("t").textContent=(t.length?t.join(" + "):"0")+" = "+v;
    $("n").textContent=NT.hex(v>>4,1)+"H · "+NT.hex(v&15,1)+"H";$("o").textContent=NT.ones(v)}
  el.querySelectorAll(".nt-tg button").forEach(b=>b.onclick=()=>{v^=1<<+b.dataset.k;$("err").textContent="";inp.value=NT.a51(v,2);show()});
  inp.addEventListener("input",()=>{if(!inp.value.trim()){$("err").textContent="";return}const r=NT.parse(inp.value,255);
    if(r.ok){v=r.v;$("err").textContent="Đọc là "+r.form+"."+(r.note?" Lưu ý: "+r.note:"");show()}else $("err").textContent=r.err});
  $("clr").onclick=()=>{v=0;inp.value="";$("err").textContent="";show()};
  $("inv").onclick=()=>{v=(~v)&255;inp.value=NT.a51(v,2);$("err").textContent="";show()};
  show()}
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
    let order=null,fails=0,opt=null;
    function build(){card.querySelector(".mt-hint").hidden=card.querySelector(".mt-why").hidden=true;st.textContent="";st.className="st";
      if(x.kind==="num"||x.kind==="base")body.innerHTML=`<ol class="mt-items">${x.items.map((it,j)=>{const u=x.kind==="base"?{hex:"(hex)",bin:"(nhị phân)",dec:"(thập phân)"}[it.f]:it.unit;
        return`<li><label><span class="mt-q">${it.q}</span><span class="mt-in"><input type="text" inputmode="${x.kind==="base"&&it.f==="hex"?"text":"decimal"}" autocomplete="off" autocapitalize="characters" spellcheck="false" aria-label="Đáp số câu ${j+1}${u?" "+u:""}">${u?`<span class="mt-u">${u}</span>`:""}</span>${x.kind==="base"&&it.f==="hex"?'<span class="mt-tip" role="note" hidden></span>':""}</label><span class="mt-mk" aria-hidden="true"></span></li>`}).join("")}</ol>`;
      else if(x.kind==="pick")body.innerHTML=`<ol class="mt-items">${x.items.map((it,j)=>`<li><label><span class="mt-q">${it.q}</span><select aria-label="Chọn cho câu ${j+1}"><option value="-1">Chọn…</option>${x.cats.map((c,m)=>`<option value="${m}">${esc(c)}</option>`).join("")}</select></label><span class="mt-mk" aria-hidden="true"></span></li>`).join("")}</ol>`;
      else if(x.kind==="order"){order=mtShuffle(x.items.length,mtSeed(id));drawOrder()}
      else if(x.kind==="opt")opt=mtOpt(body,x,id)}
    function drawOrder(marks){body.innerHTML=`<ol class="mt-ord">${order.map((o,j)=>`<li${marks?` class="${marks[j]?"ok":"bad"}"`:""}><span class="mt-ot">${x.items[o]}</span><span class="mt-ob"><button type="button" class="btn" data-up="${j}" aria-label="Đưa lên trên"${j===0?" disabled":""}>↑</button><button type="button" class="btn" data-dn="${j}" aria-label="Đưa xuống dưới"${j===order.length-1?" disabled":""}>↓</button></span>${marks?`<span class="mt-mk">${marks[j]?OK:NO}</span>`:""}</li>`).join("")}</ol>`;
      body.querySelectorAll("[data-up],[data-dn]").forEach(b=>b.onclick=()=>{const j=+(b.dataset.up??b.dataset.dn),t=b.dataset.up!==undefined?j-1:j+1;
        [order[j],order[t]]=[order[t],order[j]];drawOrder();const f=body.querySelector(`[data-${b.dataset.up!==undefined?"up":"dn"}="${t}"]`);(f&&!f.disabled?f:body.querySelector("button:not(:disabled)")).focus()})}
    function grade(){let right=0,n=0,miss=false;
      if(x.kind==="opt"){const r=opt.grade();st.className="st "+(r.pass?"pass":"fail");st.textContent=(r.pass?"Đạt: ":"Chưa đạt: ")+r.msg;
        if(window.TRACK)TRACK.ex(id,r.pass,r.msg);return hint(r.pass)}
      if(x.kind==="order"){const marks=order.map((o,j)=>o===j);right=marks.filter(Boolean).length;n=marks.length;drawOrder(marks)}
      else body.querySelectorAll(".mt-items>li").forEach((li,j)=>{const it=x.items[j],f=li.querySelector("input,select");let ok;
        if(x.kind==="base"){if(f.value.trim()==="")miss=true;const r=NT.readx(f.value,it.f);ok=r.v===it.a;
          const tip=li.querySelector(".mt-tip");if(tip){tip.textContent=r.note?"Lưu ý: "+r.note:"";tip.hidden=!r.note}}
        else if(x.kind==="num"){const v=mtNum(f.value);if(f.value.trim()==="")miss=true;const tol=Math.max(it.tol||0,(it.rel||0)*Math.abs(it.a),1e-9);ok=!isNaN(v)&&Math.abs(v-it.a)<=tol}
        else{if(f.value==="-1")miss=true;ok=+f.value===it.a}
        n++;if(ok)right++;li.classList.toggle("ok",ok);li.classList.toggle("bad",!ok);li.querySelector(".mt-mk").textContent=ok?OK:NO});
      const pass=right===n;
      st.className="st "+(pass?"pass":"fail");
      st.textContent=pass?`Đạt: đúng ${right}/${n}`:`Chưa đạt: đúng ${right}/${n}`+(miss?" (còn câu chưa trả lời)":"");
      if(window.TRACK)TRACK.ex(id,pass,`đúng ${right}/${n}`);
      hint(pass)}
    function hint(pass){const H=card.querySelector(".mt-hint"),W=card.querySelector(".mt-why");
      if(pass){H.hidden=true;if(x.why){W.innerHTML=`<b>Giải thích:</b> ${x.why}`;W.hidden=false}}
      else if(x.hints&&x.hints.length){fails++;H.innerHTML=x.hints.slice(0,Math.min(fails,x.hints.length)).map((h,j)=>`<p><b>Gợi ý ${j+1}:</b> ${h}</p>`).join("");H.hidden=false}}
    card.querySelector(".mt-go").onclick=grade;
    card.querySelector(".mt-again").onclick=()=>{build();const f=body.querySelector("input,select,textarea,button");if(f)f.focus()};
    build();
    const was=window.TRACK&&TRACK.exOf&&TRACK.exOf(id);if(was&&was.pass){st.className="st pass";st.textContent="Đã đạt trước đó · làm lại để ôn"}})}
/* ===================== Bài 2–4: ALU 8 bit (thêm cho AMTS-FND-002-M01-L02…L04) =====================
   - NTA: phần TÍNH thuần (không đụng DOM) của các phép 8 bit theo tập lệnh 8051 kiểu gốc (ADD, ADDC, SUBB, DA A, ANL, ORL,
     XRL, CPL, RL, RR, RLC, RRC, SWAP) và cờ 8086 (CF, OF, SF, ZF, PF, AF) của lệnh tương ứng (ADD, ADC, SBB, SUB, NEG, AND,
     OR, XOR, SHL, SHR, SAR, CBW). Dùng cho AMTS-FND-002-SIM02 (bù hai / tràn) và SIM06 (mặt nạ bit).
     Kiểm thử: python3 tests/nentang/alu_vectors.py && node tests/nentang/test_alu.js (bộ số Python viết độc lập);
     python3 tests/nentang/alu_s51.py (bộ số Python so với ucsim s51); python3 tests/nentang/alu_x86.py (so với CPU x86 thật).
   - makeNtAlu: phần VẼ (máy tính ALU 8 bit: ô nhập, chọn phép, bảng bit, cờ, lệnh 8051 / 8086 tương ứng).
   Giới hạn: chỉ thanh ghi 8 bit (A / AL) và một toán hạng hằng số; không mô phỏng thời gian, chân điện, lệnh nhảy. */
const NTA={
  s8(v){v&=255;return v>127?v-256:v},
  s16(v){v&=65535;return v>32767?v-65536:v},
  par(v){return NT.ones(v&255)&1},                       // bit P của 8051: 1 khi kết quả có số lẻ bit 1
  add(a,b,c){c=c?1:0;const s=a+b+c,r=s&255;return{r,cy:+(s>255),ac:+((a&15)+(b&15)+c>15),ov:+(((a^r)&(b^r)&128)!==0),p:NTA.par(r)}},
  subb(a,b,c){c=c?1:0;const s=a-b-c,r=s&255;return{r,cy:+(s<0),ac:+((a&15)-(b&15)-c<0),ov:+(((a^b)&(a^r)&128)!==0),p:NTA.par(r)}},
  /* DA A của 8051: chỉnh A thành hai chữ số BCD sau ADD/ADDC; giữ CY = 1 nếu đã bằng 1, không đổi AC, OV */
  da(a,cy,ac){let r=a&255;cy=cy?1:0;if((r&15)>9||ac){r+=6;if(r>255)cy=1;r&=255}if((r>>4)>9||cy){r+=0x60;if(r>255)cy=1;r&=255}return{r,cy,p:NTA.par(r)}},
  rl(a){return((a<<1)|(a>>7))&255},
  rr(a){return((a>>1)|(a<<7))&255},
  rlc(a,c){return{r:((a<<1)|(c?1:0))&255,cy:(a>>7)&1}},
  rrc(a,c){return{r:(a>>1)|((c?1:0)<<7),cy:a&1}},
  swap(a){return((a<<4)|(a>>4))&255},
  /* cờ 8086 của một kết quả 8 bit: SF = bit 7, ZF, PF = 1 khi số bit 1 CHẴN (ngược bit P của 8051) */
  f86(r,cf,of,af){return{cf:cf?1:0,of:of?1:0,sf:(r>>7)&1,zf:+((r&255)===0),pf:1-NTA.par(r),af:af==null?null:(af?1:0)}},
  neg(a){return(-a)&255},
  cbw(a){return a&128?0xFF00|a:a&255},
  /* đọc toán hạng 8 bit: như NT.parse (A51 / MASM / C51) và thêm số thập phân có dấu −128…−1 (lưu bằng bù hai) */
  parse(s){const t=String(s==null?"":s).trim();let m;
    if((m=/^[-−]\s*([0-9]+)$/.exec(t))){const n=-parseInt(m[1],10);
      if(n<-128)return{ok:false,err:`${n} nhỏ hơn −128: không vừa 1 byte có dấu (bù hai 8 bit chỉ biểu diễn −128…127).`};
      return{ok:true,v:n&255,form:"thập phân có dấu, lưu bằng bù hai"}}
    return NT.parse(t,255)},
  hx(v){return NT.a51(v&255,2)},
  /* bảng phép: n = số toán hạng (1: chỉ A; 2: A và hằng B); c = dùng cờ CY đầu vào. run trả {r, cy, f51, f86, i51, i86} */
  OPS:{
    ADD:{t:"ADD (cộng)",n:2,run(a,b){const x=NTA.add(a,b,0);return{r:x.r,cy:x.cy,f51:{CY:x.cy,AC:x.ac,OV:x.ov,P:x.p},f86:NTA.f86(x.r,x.cy,x.ov,x.ac),i51:"ADD A,#"+NTA.hx(b),i86:"ADD AL,"+NTA.hx(b)}}},
    ADDC:{t:"ADDC (cộng có nhớ)",n:2,c:1,run(a,b,c){const x=NTA.add(a,b,c);return{r:x.r,cy:x.cy,f51:{CY:x.cy,AC:x.ac,OV:x.ov,P:x.p},f86:NTA.f86(x.r,x.cy,x.ov,x.ac),i51:"ADDC A,#"+NTA.hx(b),i86:"ADC AL,"+NTA.hx(b)}}},
    SUBB:{t:"SUBB (trừ có mượn)",n:2,c:1,run(a,b,c){const x=NTA.subb(a,b,c);return{r:x.r,cy:x.cy,f51:{CY:x.cy,AC:x.ac,OV:x.ov,P:x.p},f86:NTA.f86(x.r,x.cy,x.ov,x.ac),i51:"SUBB A,#"+NTA.hx(b),i86:(c?"SBB":"SUB")+" AL,"+NTA.hx(b)}}},
    NEG:{t:"Lấy số đối (bù hai)",n:1,run(a){const r=NTA.neg(a);return{r,f51:{P:NTA.par(r)},f86:NTA.f86(r,a!==0,a===128,(a&15)!==0),i51:"CPL A rồi INC A",i86:"NEG AL"}}},
    ANL:{t:"ANL (AND)",n:2,run(a,b){const r=a&b;return{r,f51:{P:NTA.par(r)},f86:NTA.f86(r,0,0,null),i51:"ANL A,#"+NTA.hx(b),i86:"AND AL,"+NTA.hx(b)}}},
    ORL:{t:"ORL (OR)",n:2,run(a,b){const r=a|b;return{r,f51:{P:NTA.par(r)},f86:NTA.f86(r,0,0,null),i51:"ORL A,#"+NTA.hx(b),i86:"OR AL,"+NTA.hx(b)}}},
    XRL:{t:"XRL (XOR)",n:2,run(a,b){const r=a^b;return{r,f51:{P:NTA.par(r)},f86:NTA.f86(r,0,0,null),i51:"XRL A,#"+NTA.hx(b),i86:"XOR AL,"+NTA.hx(b)}}},
    CPL:{t:"CPL (NOT)",n:1,run(a){const r=(~a)&255;return{r,f51:{P:NTA.par(r)},f86:null,i51:"CPL A",i86:"NOT AL (không đổi cờ)"}}},
    RL:{t:"RL (quay trái)",n:1,run(a){const r=NTA.rl(a);return{r,f51:{P:NTA.par(r)},f86:null,i51:"RL A",i86:"ROL AL,1"}}},
    RR:{t:"RR (quay phải)",n:1,run(a){const r=NTA.rr(a);return{r,f51:{P:NTA.par(r)},f86:null,i51:"RR A",i86:"ROR AL,1"}}},
    RLC:{t:"RLC (quay trái qua CY)",n:1,c:1,run(a,b,c){const x=NTA.rlc(a,c);return{r:x.r,cy:x.cy,f51:{CY:x.cy,P:NTA.par(x.r)},f86:null,i51:"RLC A",i86:"RCL AL,1"}}},
    RRC:{t:"RRC (quay phải qua CY)",n:1,c:1,run(a,b,c){const x=NTA.rrc(a,c);return{r:x.r,cy:x.cy,f51:{CY:x.cy,P:NTA.par(x.r)},f86:null,i51:"RRC A",i86:"RCR AL,1"}}},
    SWAP:{t:"SWAP (đổi hai nibble)",n:1,run(a){const r=NTA.swap(a);return{r,f51:{P:NTA.par(r)},f86:null,i51:"SWAP A",i86:"MOV CL,4 rồi ROL AL,CL"}}},
    SHL:{t:"SHL (dịch trái)",n:1,run(a){const r=(a<<1)&255,cf=(a>>7)&1;return{r,cy:cf,f51:null,f86:NTA.f86(r,cf,((r>>7)&1)^cf,null),i51:"CLR C rồi RLC A",i86:"SHL AL,1"}}},
    SHR:{t:"SHR (dịch phải logic)",n:1,run(a){const r=a>>1,cf=a&1;return{r,cy:cf,f51:null,f86:NTA.f86(r,cf,(a>>7)&1,null),i51:"CLR C rồi RRC A",i86:"SHR AL,1"}}},
    SAR:{t:"SAR (dịch phải số học)",n:1,run(a){const r=(a>>1)|(a&128),cf=a&1;return{r,cy:cf,f51:null,f86:NTA.f86(r,cf,0,null),i51:"MOV C,ACC.7 rồi RRC A",i86:"SAR AL,1"}}},
    DA:{t:"ADD rồi DA A (cộng BCD)",n:2,run(a,b){const x=NTA.add(a,b,0),d=NTA.da(x.r,x.cy,x.ac);return{r:d.r,cy:d.cy,mid:x,f51:{CY:d.cy,AC:x.ac,OV:x.ov,P:d.p},f86:null,i51:"ADD A,#"+NTA.hx(b)+" rồi DA A",i86:"ADD AL,"+NTA.hx(b)+" rồi DAA (cờ không mô phỏng)"}}}
  },
  calc(op,a,b,c){return NTA.OPS[op].run(a&255,b&255,c?1:0)},
  /* chữ in được của một byte theo ASCII 7 bit, hoặc null nếu là mã điều khiển / ngoài 7 bit */
  ascii(v){return v>=0x20&&v<=0x7E?String.fromCharCode(v):null},
  /* BCD nén: số 0…99, hoặc null nếu có nibble lớn hơn 9 */
  bcd(v){return(v>>4)<=9&&(v&15)<=9?(v>>4)*10+(v&15):null}
};
function makeNtAlu(el,cfg){
  /* phần vẽ: đọc / tính qua NTA, không tự tính */
  cfg=cfg||{};const P="nta-"+(cfg.id||"x"),ops=cfg.ops||["ADD"],show=cfg.show||[];
  let op=cfg.op||ops[0],a=(cfg.a||0)&255,b=(cfg.b||0)&255,c=cfg.c?1:0;
  el.classList.add("nt-alu");
  el.innerHTML=`<div class="nta-in">
     <label class="nta-f"><span>A</span><input id="${P}-a" type="text" autocomplete="off" spellcheck="false" aria-describedby="${P}-err"></label>
     <label class="nta-f"><span>Phép</span><select id="${P}-op">${ops.map(k=>`<option value="${k}">${esc(NTA.OPS[k].t)}</option>`).join("")}</select></label>
     <label class="nta-f" id="${P}-bw"><span>${esc(cfg.bl||"B (hằng số)")}</span><input id="${P}-b" type="text" autocomplete="off" spellcheck="false" aria-describedby="${P}-err"></label>
     <label class="nta-c" id="${P}-cw"><input type="checkbox" id="${P}-c"> CY ban đầu = 1</label></div>
   ${cfg.presets?`<div class="nta-pre" role="group" aria-label="Ví dụ có sẵn">${cfg.presets.map((p,i)=>`<button type="button" class="btn" data-p="${i}">${esc(p.t)}</button>`).join("")}</div>`:""}
   <p class="nt-err" id="${P}-err" role="status" aria-live="polite"></p>
   <div class="nt-byte" id="${P}-tab"></div>${show.includes("led")?`<div class="nt-leds" id="${P}-led" role="img"></div><p class="mt-cap">Kết quả ghi ra cổng P1; LED giả định tích cực mức thấp (sáng khi chân ở mức 0).</p>`:""}
   <dl class="nt-out" id="${P}-out" aria-live="polite"></dl>`;
  const $=s=>el.querySelector("#"+P+"-"+s),ia=$("a"),ib=$("b");
  let wcy=true;       /* cột CY chỉ hiện với phép dùng hoặc tạo cờ nhớ */
  const row=(lab,v,cy,cls)=>`<tr><td>${lab}</td>${wcy?`<td class="nta-cy">${cy==null?"":cy}</td>`:""}${[7,6,5,4,3,2,1,0].map(k=>`<td${cls&&cls(k)?` class="${cls(k)}"`:""}>${(v>>k)&1}</td>`).join("")}</tr>`;
  const val=v=>`${NTA.hx(v)} · ${v} không dấu · ${NTA.s8(v)} có dấu`;
  function draw(){const o=NTA.OPS[op],x=NTA.calc(op,a,b,c);
    $("bw").hidden=o.n<2;$("cw").hidden=!o.c;
    const ch=k=>((x.r^a)>>k)&1?"new":"";wcy=!!o.c||x.cy!=null;
    $("tab").innerHTML=`<table class="mt-tab" aria-label="Các bit của A${o.n>1?", "+esc(cfg.bl||"B"):""} và kết quả"><thead><tr><th scope="col"></th>${wcy?'<th scope="col">CY</th>':""}${[7,6,5,4,3,2,1,0].map(k=>`<th scope="col">${k}</th>`).join("")}</tr></thead><tbody>`+
      row("A",a,o.c?c:null)+(o.n>1?row(cfg.bl?"Mặt nạ":"B",b,null):"")+(x.mid?row("Sau ADD",x.mid.r,x.mid.cy):"")+row("Kết quả",x.r,x.cy==null?null:x.cy,ch)+"</tbody></table>";
    let h=`<dt>A</dt><dd>${val(a)}</dd>`+(o.n>1?`<dt>${esc(cfg.bl||"B")}</dt><dd>${val(b)}</dd>`:"")+`<dt>Kết quả</dt><dd><b>${val(x.r)}</b></dd>`;
    if(x.f51)h+=`<dt>Cờ 8051</dt><dd>${Object.entries(x.f51).map(([k,v])=>`${k} = ${v}`).join(" · ")}</dd>`;
    if(x.f86)h+=`<dt>Cờ 8086</dt><dd>${["cf","of","sf","zf","pf"].concat(x.f86.af==null?[]:["af"]).map(k=>`${k.toUpperCase()} = ${x.f86[k]}`).join(" · ")}</dd>`;
    h+=`<dt>Lệnh 8051</dt><dd><code>${esc(x.i51)}</code></dd><dt>Lệnh 8086</dt><dd><code>${esc(x.i86)}</code></dd>`;
    if(show.includes("bcd")){const d=NTA.bcd(x.r);h+=`<dt>Đọc như BCD nén</dt><dd>${d==null?"không hợp lệ (có nibble lớn hơn 9)":String(d).padStart(2,"0")}</dd>`}
    if(show.includes("asc")){const s=NTA.ascii(x.r);h+=`<dt>Đọc như mã ASCII</dt><dd>${s==null?(x.r<0x20||x.r===0x7F?"mã điều khiển, không phải chữ in được":"ngoài bảng ASCII 7 bit"):"ký tự ‘"+esc(s)+"’"}</dd>`}
    $("out").innerHTML=h;
    if(show.includes("led")){const L=$("led"),ks=[7,6,5,4,3,2,1,0];
      L.innerHTML=ks.map(k=>{const b=(x.r>>k)&1;return`<div class="nt-led${b?"":" on"}"><i aria-hidden="true"></i><b>P1.${k}</b><span>${b?"1 (cao)":"0 (thấp)"}</span></div>`}).join("");
      L.setAttribute("aria-label","8 LED trên P1: "+ks.map(k=>`P1.${k} ${(x.r>>k)&1?"tắt":"sáng"}`).join(", "))}
    el.querySelectorAll(".nta-pre button").forEach((btn,i)=>{const p=cfg.presets[i];btn.setAttribute("aria-pressed",p.op===op&&(p.a&255)===a&&(p.b==null||(p.b&255)===b)&&!!p.c===!!c?"true":"false")})}
  function rd(inp,set){if(!inp.value.trim()){$("err").textContent="";return}const r=NTA.parse(inp.value);
    if(r.ok){set(r.v);$("err").textContent=r.note?"Lưu ý: "+r.note:"";draw()}else $("err").textContent=r.err}
  ia.addEventListener("input",()=>rd(ia,v=>{a=v}));ib.addEventListener("input",()=>rd(ib,v=>{b=v}));
  $("op").onchange=()=>{op=$("op").value;draw()};
  $("c").onchange=()=>{c=$("c").checked?1:0;draw()};
  function put(){ia.value=NTA.hx(a);ib.value=NTA.hx(b);$("op").value=op;$("c").checked=!!c;$("err").textContent="";draw()}
  el.querySelectorAll(".nta-pre button").forEach(btn=>btn.onclick=()=>{const p=cfg.presets[+btn.dataset.p];op=p.op;a=p.a&255;if(p.b!=null)b=p.b&255;c=p.c?1:0;put()});
  put()}
/* ===================== Bài tập M4 tối ưu byte / chu kỳ máy (Bài 1, Bài 8) =====================
   Quyết định của chủ khóa (ủy quyền cho Claude, 06/11/2026): Bài 1 và Bài 8 có một bài tập M4 chấm tự động; học viên viết
   đoạn mã Keil A51, trang dịch, chạy, so kết quả với yêu cầu và giới hạn số byte / chu kỳ máy.
   Nằm trong course.js (dùng chung cho mọi bài của khóa).
   - NTO: phần TÍNH thuần (không đụng DOM): asm(src) dịch tập lệnh con của 8051 (bảng NTO.FORMS) ra byte mã máy và số chu kỳ
     máy; run(P, init) chạy đoạn mã từ 0000H tới khi PC ra khỏi đoạn mã; grade(x, src) dịch + chạy + so yêu cầu, giới hạn.
     Kiểm thử: python3 tests/nentang/opt_s51.py && node tests/nentang/test_opt.js (so byte với sdas8051, chu kỳ và trạng thái
     với ucsim s51 trên bộ chương trình tự sinh và chương trình của bài tập).
   - mtOpt: phần VẼ (ô soạn mã, bảng kết quả, listing), gọi từ makeMtEx khi kind = "opt".
   Mô hình: 8051 kiểu gốc 12T, thạch anh 12 MHz (1 chu kỳ máy = 1 µs). Sau reset: A = B = PSW = 00H, SP = 07H, DPTR = 0000H,
   P0…P3 = FFH. RAM trong (00H…7FH) chưa xác định: đọc một ô chưa ghi là lỗi (Bài 11). Không đọc chân cổng (MOV A,P1 đọc
   chân, phụ thuộc mạch ngoài); INC / DEC / DJNZ trên cổng đọc bộ chốt (đọc-sửa-ghi, Bài 3). Không có ngắt, timer, ngăn xếp,
   lệnh số học, nhảy có điều kiện ngoài DJNZ.
   Hằng số theo Keil A51: 165, 0A5H, 10100101B, 200D; FFH là TÊN ký hiệu (báo lỗi như trình dịch thật); 0x… không phải A51;
   hằng vượt 8 bit báo lỗi (sdas8051 cắt im lặng, Bài 1 Ví dụ 8; Keil A51 PENDING). */
const NTO={
  SFR:{P0:0x80,SP:0x81,DPL:0x82,DPH:0x83,P1:0x90,P2:0xA0,P3:0xB0,PSW:0xD0,ACC:0xE0,B:0xF0},
  PORT:[0x80,0x90,0xA0,0xB0],
  MAXSTEP:200000,
  /* [tên, kiểu toán hạng, byte đầu (cộng n với Rn), số byte, chu kỳ máy]; a = A, r = Rn, d = địa chỉ trực tiếp,
     i = #hằng 8 bit, w = #hằng 16 bit, p = DPTR, l = nhãn / $ (độ dời tương đối) */
  FORMS:[["NOP","",0x00,1,1],["MOV","a,i",0x74,2,1],["MOV","a,r",0xE8,1,1],["MOV","a,d",0xE5,2,1],["MOV","r,i",0x78,2,1],
    ["MOV","r,a",0xF8,1,1],["MOV","r,d",0xA8,2,2],["MOV","d,a",0xF5,2,1],["MOV","d,i",0x75,3,2],["MOV","d,r",0x88,2,2],
    ["MOV","d,d",0x85,3,2],["MOV","p,w",0x90,3,2],["CLR","a",0xE4,1,1],["CPL","a",0xF4,1,1],["INC","a",0x04,1,1],
    ["DEC","a",0x14,1,1],["INC","r",0x08,1,1],["DEC","r",0x18,1,1],["INC","d",0x05,2,1],["DEC","d",0x15,2,1],
    ["INC","p",0xA3,1,2],["DJNZ","r,l",0xD8,2,2],["DJNZ","d,l",0xD5,3,2],["SJMP","l",0x80,2,2]],
  hx(v,n){return NT.a51(v,n||2)},
  /* số có nhóm nghìn kiểu Việt: 1000 → "1 000" */
  gr(x){return String(x).replace(/\B(?=(\d{3})+(?!\d))/g," ")},
  /* hằng số trong mã nguồn (không có #): trả {v} hoặc {err} */
  num(t){t=t.trim();let m;
    if((m=/^([0-9][0-9a-f]*)h$/i.exec(t)))return{v:parseInt(m[1],16)};
    if((m=/^([01]+)b$/i.exec(t)))return{v:parseInt(m[1],2)};
    if((m=/^([0-9]+)d?$/i.exec(t)))return{v:parseInt(m[1],10)};
    const u=t.toUpperCase();
    if(/^0X[0-9A-F]+$/.test(u))return{err:`${t}: dạng 0x… là cú pháp C51; Keil A51 viết hậu tố H (${NT.a51(parseInt(u.slice(2),16))}).`};
    if(/^[A-F][0-9A-F]*H$/.test(u))return{err:`${u} bị hiểu là tên ký hiệu chưa định nghĩa: hằng hex bắt đầu bằng chữ cái phải có số 0 đứng đầu (0${u}).`};
    if(/^[0-9][0-9A-F]*$/.test(u))return{err:`${t}: có chữ số A–F nhưng thiếu hậu tố H.`};
    return{err:`“${t}” không phải hằng số.`}},
  /* phân loại một toán hạng theo kiểu mong đợi: {k, v, n, name, here} hoặc {err} */
  opd(t,want){const u=t.trim().toUpperCase();let m;
    if(!u)return{err:"thiếu toán hạng."};
    if(u==="A")return{k:"a"};
    if((m=/^R([0-7])$/.exec(u)))return{k:"r",n:+m[1]};
    if(u==="DPTR")return{k:"p"};
    if(/^@|^C$|^AB$/.test(u))return{err:`toán hạng ${u} không có trong bài tập này (dùng A, R0…R7, DPTR, địa chỉ trực tiếp, #hằng).`};
    if(u[0]==="#"){const r=NTO.num(t.trim().slice(1));if(r.err)return r;return{k:"i",v:r.v}}
    if(want==="l"){if(u==="$")return{k:"l",here:true};
      if(/^[A-Z_?][A-Z0-9_?]*$/.test(u)&&!(u in NTO.SFR))return{k:"l",name:u};
      const r=NTO.num(u);if(r.err)return r;return{k:"l",abs:r.v}}
    if(u in NTO.SFR)return{k:"d",v:NTO.SFR[u],name:u};
    if(/^[A-Z_?][A-Z0-9_?]*$/.test(u)&&!/^[A-F][0-9A-F]*H$/.test(u))return{err:`${u} không phải thanh ghi hay SFR có trong bài tập (dùng A, R0…R7, P0…P3, PSW, ACC, B, SP, DPL, DPH, DPTR hoặc địa chỉ 00H…7FH).`};
    const r=NTO.num(u);if(r.err)return r;
    if(r.v>0xFF)return{err:`địa chỉ trực tiếp ${u} lớn hơn 0FFH.`};
    if(r.v>=0x80&&!Object.values(NTO.SFR).includes(r.v))return{err:`địa chỉ ${NTO.hx(r.v)} là SFR không có trong bài tập này.`};
    return{k:"d",v:r.v}},
  /* dịch hai lượt: trả {ok:true, ins:[{ln, src, addr, b, cyc, f, os, tgt}], size, labels} hoặc {ok:false, ln, err} */
  asm(src){const lines=String(src==null?"":src).replace(/\r/g,"").split("\n"),ins=[],labels={};let addr=0;
    const fail=(ln,err)=>({ok:false,ln,err:`Dòng ${ln}: ${err}`});
    for(let i=0;i<lines.length;i++){let t=lines[i];const ln=i+1;const sc=t.indexOf(";");if(sc>=0)t=t.slice(0,sc);t=t.trim();if(!t)continue;
      let m=/^([A-Za-z_?][\w?]*)\s*:\s*(.*)$/.exec(t);
      if(m){const L=m[1].toUpperCase();if(L in labels)return fail(ln,`nhãn ${L} đặt hai lần.`);
        if(L in NTO.SFR||/^(A|R[0-7]|DPTR|[A-F][0-9A-F]*H)$/.test(L))return fail(ln,`${L} không dùng làm tên nhãn.`);
        labels[L]=addr;t=m[2].trim();if(!t)continue}
      m=/^(\S+)\s*(.*)$/.exec(t);const op=m[1].toUpperCase(),rest=m[2].trim();
      if(op==="END")break;
      if(["ORG","EQU","SET","DB","DW","DS","DATA","BIT","CODE","CSEG","RSEG","USING","PUBLIC","EXTRN"].includes(op))
        return fail(ln,`chỉ thị ${op} không dùng trong bài tập này: đoạn mã luôn bắt đầu ở 0000H.`);
      const forms=NTO.FORMS.filter(f=>f[0]===op);
      if(!forms.length)return fail(ln,`lệnh ${op} không có trong bài tập này (dùng ${[...new Set(NTO.FORMS.map(f=>f[0]))].join(", ")}).`);
      const parts=rest?rest.split(","):[];
      if(parts.length===1&&/\S\s+\S/.test(rest)&&forms.some(f=>f[1].includes(",")))return fail(ln,`thiếu dấu phẩy giữa hai toán hạng (“${rest}”).`);
      let hit=null,err=null;
      for(const f of forms){const ks=f[1]?f[1].split(","):[];if(ks.length!==parts.length)continue;
        const os=parts.map((p,j)=>NTO.opd(p,ks[j]));const e=os.find(o=>o.err);if(e){err=err||e.err;continue}
        if(os.every((o,j)=>o.k===ks[j]||(ks[j]==="w"&&o.k==="i"))){hit={f,os};break}}
      if(!hit)return fail(ln,err||`${op}${rest?" "+rest:""} không phải dạng lệnh có trong bài tập này.`);
      const {f,os}=hit,ks=f[1].split(",");
      for(let j=0;j<os.length;j++){const o=os[j];
        if(o.k==="i"&&ks[j]!=="w"&&o.v>255)return fail(ln,`#${parts[j].trim().slice(1)} = ${o.v} không vừa 8 bit (0…255).`);
        if(o.k==="i"&&o.v>65535)return fail(ln,`hằng ${o.v} không vừa 16 bit.`)}
      ins.push({ln,src:lines[i].split(";")[0].trim(),addr,f,os,b:null,cyc:f[4]});addr+=f[3]}
    for(const x of ins){const {f,os}=x;const R=os.find(o=>o.k==="r");const b=[R?f[2]+R.n:f[2]];
      if(f[1]==="d,d")b.push(os[1].v,os[0].v);
      else if(f[1]==="p,w")b.push(os[1].v>>8,os[1].v&255);
      else for(const o of os){if(o.k==="d"||o.k==="i")b.push(o.v);
        if(o.k==="l"){const tgt=o.here?x.addr:o.name!=null?labels[o.name]:o.abs;
          if(tgt==null)return fail(x.ln,`nhãn ${o.name} chưa định nghĩa.`);
          const d=tgt-(x.addr+f[3]);if(d<-128||d>127)return fail(x.ln,`đích nhảy cách ${d} byte, ngoài −128…+127 của lệnh nhảy tương đối.`);
          b.push(d&255);x.tgt=tgt}}
      x.b=b}
    if(!ins.length)return{ok:false,ln:0,err:"Chưa có lệnh nào."};
    return{ok:true,ins,size:addr,labels}},
  reset(){return{A:0,B:0,PSW:0,SP:7,DPH:0,DPL:0,P:[0xFF,0xFF,0xFF,0xFF],ram:new Array(128).fill(null)}},
  par(v){return NT.ones(v&255)&1},
  /* chạy từ 0000H tới khi PC = cuối đoạn mã: {ok, st, cyc, steps, cnt} hoặc {ok:false, ln, err} */
  run(P,init){const s=NTO.reset();
    if(init)for(const k in init){if(/^RAM/.test(k))s.ram[parseInt(k.slice(3),16)]=init[k];else if(/^P[0-3]$/.test(k))s.P[+k[1]]=init[k];else s[k]=init[k]}
    const at={};P.ins.forEach((x,i)=>{at[x.addr]=i});const cnt=P.ins.map(()=>0);let pc=0,cyc=0,steps=0,bad=null;
    const bank=()=>((s.PSW>>3)&3)*8;
    const rd=(a,ln,rmw)=>{if(a<0x80){const v=s.ram[a];
        if(v==null){bad=bad||{ok:false,ln,err:`Dòng ${ln}: đọc ô RAM ${NTO.hx(a)}${a<0x20?` (R${a&7} của băng ${a>>3})`:""} khi chưa ghi: RAM trong không có giá trị xác định sau khi cấp nguồn (Bài 11). Gán trước khi dùng.`};return 0}
        return v}
      const pi=NTO.PORT.indexOf(a);
      if(pi>=0){if(!rmw){bad=bad||{ok:false,ln,err:`Dòng ${ln}: MOV đọc P${pi} là đọc CHÂN cổng, giá trị phụ thuộc mạch ngoài; bài tập này không đọc cổng.`};return 0}return s.P[pi]}
      return a===0xE0?s.A:a===0xF0?s.B:a===0xD0?(s.PSW&0xFE)|NTO.par(s.A):a===0x81?s.SP:a===0x82?s.DPL:s.DPH};
    const wr=(a,v)=>{v&=255;if(a<0x80){s.ram[a]=v;return}const pi=NTO.PORT.indexOf(a);if(pi>=0){s.P[pi]=v;return}
      if(a===0xE0)s.A=v;else if(a===0xF0)s.B=v;else if(a===0xD0)s.PSW=v&0xFE;else if(a===0x81)s.SP=v;else if(a===0x82)s.DPL=v;else s.DPH=v};
    while(pc<P.size){const i=at[pc];if(i==null)return{ok:false,ln:0,err:`PC = ${NTO.hx(pc,4)} không trỏ vào đầu một lệnh.`};
      const x=P.ins[i],f=x.f,o=x.os,ln=x.ln;let next=pc+f[3];
      if(++steps>NTO.MAXSTEP)return{ok:false,ln,err:`Dòng ${ln}: đã chạy ${NTO.MAXSTEP} lệnh mà chưa ra khỏi đoạn mã (vòng lặp không dừng?).`,cyc,steps};
      cnt[i]++;cyc+=f[4];
      const R=o.find(q=>q.k==="r"),ra=R?bank()+R.n:0;
      switch(f[0]+" "+f[1]){
        case"NOP ":break;
        case"MOV a,i":s.A=o[1].v;break;case"MOV a,r":s.A=rd(ra,ln);break;case"MOV a,d":s.A=rd(o[1].v,ln);break;
        case"MOV r,i":wr(ra,o[1].v);break;case"MOV r,a":wr(ra,s.A);break;case"MOV r,d":wr(ra,rd(o[1].v,ln));break;
        case"MOV d,a":wr(o[0].v,s.A);break;case"MOV d,i":wr(o[0].v,o[1].v);break;case"MOV d,r":wr(o[0].v,rd(ra,ln));break;
        case"MOV d,d":wr(o[0].v,rd(o[1].v,ln));break;case"MOV p,w":s.DPH=o[1].v>>8;s.DPL=o[1].v&255;break;
        case"CLR a":s.A=0;break;case"CPL a":s.A=(~s.A)&255;break;case"INC a":s.A=(s.A+1)&255;break;case"DEC a":s.A=(s.A-1)&255;break;
        case"INC r":wr(ra,rd(ra,ln)+1);break;case"DEC r":wr(ra,rd(ra,ln)-1);break;
        case"INC d":wr(o[0].v,rd(o[0].v,ln,true)+1);break;case"DEC d":wr(o[0].v,rd(o[0].v,ln,true)-1);break;
        case"INC p":{const v=(((s.DPH<<8)|s.DPL)+1)&0xFFFF;s.DPH=v>>8;s.DPL=v&255;break}
        case"DJNZ r,l":{const v=(rd(ra,ln)-1)&255;wr(ra,v);if(v)next=x.tgt;break}
        case"DJNZ d,l":{const v=(rd(o[0].v,ln,true)-1)&255;wr(o[0].v,v);if(v)next=x.tgt;break}
        case"SJMP l":next=x.tgt;break}
      if(bad)return Object.assign(bad,{cyc,steps});
      pc=next}
    return{ok:true,st:s,cyc,steps,cnt}},
  /* một giá trị của trạng thái: A, B, PSW, SP, DPTR, P0…P3, RS (số băng), R0…R7 (băng hiện tại), RAMxx (xx hex) */
  get(s,k){if(k==="A")return s.A;if(k==="B")return s.B;if(k==="PSW")return(s.PSW&0xFE)|NTO.par(s.A);if(k==="SP")return s.SP;
    if(k==="DPTR")return(s.DPH<<8)|s.DPL;if(/^P[0-3]$/.test(k))return s.P[+k[1]];if(k==="RS")return(s.PSW>>3)&3;
    if(/^R[0-7]$/.test(k))return s.ram[((s.PSW>>3)&3)*8+(+k[1])];if(/^RAM/.test(k))return s.ram[parseInt(k.slice(3),16)];return null},
  /* chấm: x = {init, want:[{k, v, t}], limit:{bytes, cycles, exact, tol}} */
  grade(x,src){const P=NTO.asm(src);if(!P.ok)return{pass:false,stage:"asm",err:P.err,ln:P.ln};
    const r=NTO.run(P,x.init),bytes=P.size;
    if(!r.ok)return{pass:false,stage:"run",err:r.err,ln:r.ln,P,bytes};
    const checks=(x.want||[]).map(w=>{const g=NTO.get(r.st,w.k);return{t:w.t||w.k,k:w.k,want:w.v,got:g,ok:g===w.v}});
    const L=x.limit||{},lim=[];
    if(L.bytes!=null)lim.push({t:"Số byte",got:bytes,ok:bytes<=L.bytes,txt:`≤ ${L.bytes}`});
    if(L.cycles!=null){const tol=L.tol||0,ok=L.exact?Math.abs(r.cyc-L.cycles)<=tol:r.cyc<=L.cycles;
      lim.push({t:"Chu kỳ máy",got:r.cyc,ok,txt:L.exact?(tol?`${NTO.gr(L.cycles)} ± ${tol}`:`đúng ${NTO.gr(L.cycles)}`):`≤ ${NTO.gr(L.cycles)}`})}
    const right=checks.every(c=>c.ok),inLim=lim.every(l=>l.ok);
    return{pass:right&&inLim,right,inLim,checks,lim,P,run:r,bytes,cyc:r.cyc}}
};
/* phần VẼ của bài tập "opt" (gọi từ makeMtEx): ô soạn mã nạp sẵn code mẫu, bảng kết quả, listing. Trả {grade(), reset()} */
function mtOpt(body,x,id){
  const T="mto-"+id,E=s=>String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
  body.innerHTML=`<div class="mt-opt"><label class="mt-opt-l" for="${T}-src">Đoạn mã Keil A51 (bắt đầu ở 0000H; trang chạy tới khi ra khỏi đoạn mã)</label>
    <textarea id="${T}-src" class="mt-opt-src" rows="${Math.max(6,Math.min(14,x.sample.split("\n").length+2))}" spellcheck="false" autocapitalize="off" autocomplete="off" wrap="off"></textarea>
    <div class="mt-opt-out" aria-live="polite"></div></div>`;
  const ta=body.querySelector("textarea"),out=body.querySelector(".mt-opt-out");
  const H=(v,k)=>v==null?"chưa xác định":k==="RS"?String(v):NTO.hx(v,k==="DPTR"?4:2);
  function reset(){ta.value=x.sample;out.innerHTML=""}
  function grade(){const g=NTO.grade(x,ta.value);
    if(g.stage){out.innerHTML=`<p class="mt-opt-err">${E(g.err)}</p>`;return{pass:false,msg:g.stage==="asm"?"lỗi dịch":"lỗi khi chạy"}}
    let h=`<div class="mt-opt-scroll"><table class="mt-tab mt-opt-res"><thead><tr><th scope="col">Yêu cầu</th><th scope="col">Cần</th><th scope="col">Đoạn mã của bạn</th><th scope="col"><span class="vh">Đạt?</span></th></tr></thead><tbody>`+
      g.checks.map(c=>`<tr class="${c.ok?"ok":"bad"}"><td>${E(c.t)}</td><td>${H(c.want,c.k)}</td><td>${H(c.got,c.k)}</td><td>${c.ok?"✓":"✗"}</td></tr>`).join("")+
      g.lim.map(l=>`<tr class="${l.ok?"ok":"bad"}"><td>${l.t}</td><td>${l.txt}</td><td>${NTO.gr(l.got)}${l.t==="Chu kỳ máy"?` = ${NTO.gr(l.got)} µs ở 12 MHz`:""}</td><td>${l.ok?"✓":"✗"}</td></tr>`).join("")+`</tbody></table></div>`;
    h+=`<details class="mt-opt-lst"><summary>Listing: địa chỉ, mã máy, chu kỳ máy</summary><div class="mt-opt-scroll"><table class="mt-tab"><thead><tr><th scope="col">Địa chỉ</th><th scope="col">Byte</th><th scope="col">Lệnh</th><th scope="col">CKM</th><th scope="col">Số lần chạy</th></tr></thead><tbody>`+
      g.P.ins.map((q,i)=>`<tr><td>${NT.hex(q.addr,4)}H</td><td>${q.b.map(b=>NT.hex(b,2)).join(" ")}</td><td><code>${E(q.src.replace(/\s+/g," "))}</code></td><td>${q.cyc}</td><td>${g.run.cnt[i]}</td></tr>`).join("")+
      `</tbody></table></div><p class="mt-cap">Tổng ${g.bytes} byte; ${NTO.gr(g.cyc)} chu kỳ máy = tổng (CKM × số lần chạy) của mọi lệnh.</p></details>`;
    out.innerHTML=h;
    return{pass:g.pass,msg:!g.right?"kết quả chưa đúng yêu cầu":!g.inLim?"kết quả đúng nhưng chưa đạt giới hạn ("+g.lim.filter(l=>!l.ok).map(l=>`${l.t.toLowerCase()} ${NTO.gr(l.got)}, cần ${l.txt}`).join("; ")+")"
      :`${g.bytes} byte, ${NTO.gr(g.cyc)} chu kỳ máy`}}
  reset();return{grade,reset}}
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

const LESSON_UPDATED={"l1": "2026-11-06T19:18:22Z", "l10": "2026-11-06T19:00:51Z", "l11": "2026-11-06T19:00:51Z", "l12": "2026-11-06T19:00:51Z", "l2": "2026-11-06T18:19:33Z", "l3": "2026-11-06T18:19:33Z", "l4": "2026-11-06T18:19:33Z", "l5": "2026-11-06T19:25:56Z", "l6": "2026-11-06T19:00:51Z", "l7": "2026-11-06T19:00:51Z", "l8": "2026-11-06T19:09:16Z", "l9": "2026-11-06T19:00:51Z"};
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
