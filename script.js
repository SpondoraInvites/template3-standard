/* ============================================================
   STANDARD TEMPLATE — SCRIPT
   Falling petals canvas, generatively drawn botanical branches,
   generative music-box melody, the sealed-envelope opening,
   scroll reveals, live countdown, add-to-calendar and the RSVP
   form.
   Client values (wedding date, calendar, RSVP) come from
   config.js — edit that file, not this one.
   ============================================================ */

(function(){
"use strict";
/* config.js declares INVITE_CONFIG with `const`, which is a global
   lexical binding, not a window property — check both. */
const CFG=window.INVITE_CONFIG||INVITE_CONFIG;
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;

/* =========================================================
   1. Falling petals — canvas with cursor "wind" + bursts
   ========================================================= */
const canvas=$('#petals'),ctx=canvas.getContext('2d');
let W=innerWidth,H=innerHeight,DPR=Math.min(devicePixelRatio||1,2);
const COLORS=[[233,196,186],[243,229,206],[209,214,188],[236,209,199]];
const petals=[];
let wind=0,windTarget=0,mx=.5,my=.5;

function sizeCanvas(){W=innerWidth;H=innerHeight;DPR=Math.min(devicePixelRatio||1,2);
  canvas.width=W*DPR;canvas.height=H*DPR;ctx.setTransform(DPR,0,0,DPR,0,0);}
sizeCanvas();addEventListener('resize',sizeCanvas);

function spawn(top){const s=4+Math.random()*7;return{
  x:Math.random()*W,y:top?-20-Math.random()*H*.3:Math.random()*H,
  s,rot:Math.random()*Math.PI*2,rs:(Math.random()-.5)*.028,
  ph:Math.random()*Math.PI*2,ps:.006+Math.random()*.012,amp:.4+Math.random()*1.1,
  c:COLORS[Math.floor(Math.random()*COLORS.length)],a:.3+Math.random()*.32,
  vx:0,vy:.35+(s/11)*.75,temp:false};}

const BASE=()=>Math.max(10,Math.min(26,Math.round(W/55)));
for(let i=0;i<BASE();i++)petals.push(spawn(false));

function burst(x,y){ // petal burst when the seal cracks
  for(let i=0;i<26;i++){
    const a=Math.random()*Math.PI*2,sp=2+Math.random()*4.5,p=spawn(false);
    p.x=x;p.y=y;p.vx=Math.cos(a)*sp;p.vy=Math.sin(a)*sp-1.6;p.s=4+Math.random()*6;p.a=.5+Math.random()*.3;
    p.temp=true;petals.push(p);
  }
  while(petals.length>BASE()+80)petals.shift();
}
function drawPetal(p){
  ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rot+Math.sin(p.ph)*.5);
  ctx.scale(p.s,p.s*.85);
  ctx.beginPath();ctx.moveTo(0,-1);
  ctx.bezierCurveTo(.9,-1.1,1.5,-.2,1.2,.5);
  ctx.bezierCurveTo(.9,1.1,.3,1.2,0,.9);
  ctx.bezierCurveTo(-.3,1.2,-.9,1.1,-1.2,.5);
  ctx.bezierCurveTo(-1.5,-.2,-.9,-1.1,0,-1);
  ctx.fillStyle=`rgba(${p.c[0]},${p.c[1]},${p.c[2]},${p.a})`;ctx.fill();ctx.restore();
}
addEventListener('mousemove',e=>{
  windTarget=Math.max(-2.5,Math.min(2.5,(e.movementX||0)*.05));
  mx=e.clientX/W;my=e.clientY/H;
},{passive:true});

/* =========================================================
   2. Botanical branches — procedurally drawn line art,
      gently parallaxed by the cursor
   ========================================================= */
function makeBranchSVG(){
  const P0={x:10,y:132},P1={x:34,y:88},P2={x:100,y:8};let leaves='';
  const n=8;
  for(let i=0;i<n;i++){
    const t=.14+.72*i/(n-1),mt=1-t;
    const x=mt*mt*P0.x+2*mt*t*P1.x+t*t*P2.x;
    const y=mt*mt*P0.y+2*mt*t*P1.y+t*t*P2.y;
    const tx=2*mt*(P1.x-P0.x)+2*t*(P2.x-P1.x), ty=2*mt*(P1.y-P0.y)+2*t*(P2.y-P1.y);
    const ang=Math.atan2(ty,tx)*180/Math.PI, side=i%2?1:-1;
    const size=(1-t*.5)*1.05, rot=ang+side*58+(Math.random()*8-4);
    leaves+=`<path d="M1 0 C6 -8 15 -10 23 -3 C15 5 6 4 1 0 Z" fill="none" stroke="currentColor" stroke-width="1.1" transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rot.toFixed(1)}) scale(${size.toFixed(2)})"/>`;
  }
  return `<svg viewBox="0 0 115 140" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
    <path d="M${P0.x} ${P0.y} Q ${P1.x} ${P1.y} ${P2.x} ${P2.y}" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>${leaves}</svg>`;
}
const branchSVG=makeBranchSVG(), botanicals=$$('.botanical');
botanicals.forEach(el=>el.innerHTML=branchSVG);

/* single render loop for petals + parallax */
function frame(){
  ctx.clearRect(0,0,W,H);
  wind+=(windTarget-wind)*.06; windTarget*=.9;
  for(let i=petals.length-1;i>=0;i--){
    const p=petals[i];
    p.ph+=p.ps;p.rot+=p.rs;
    const fall=.35+(p.s/11)*.8;
    p.vy+=(fall-p.vy)*(p.temp?.03:1);p.vx*=.94;
    p.x+=p.vx+wind*(.3+p.s/11)+Math.sin(p.ph)*p.amp*.35;
    p.y+=p.vy;
    if(p.x<-30)p.x=W+20; if(p.x>W+30)p.x=-20;
    if(p.y>H+40){ if(p.temp){petals.splice(i,1);continue;} p.y=-20;p.x=Math.random()*W; }
    drawPetal(p);
  }
  botanicals.forEach(el=>{
    const d=parseFloat(el.dataset.depth||1);
    const dx=(mx-.5)*-16*d, dy=(my-.5)*-10*d;
    el.style.transform=`translate(${dx.toFixed(1)}px,${dy.toFixed(1)}px) ${el.dataset.base||''}`;
  });
  requestAnimationFrame(frame);
}
if(!RM)requestAnimationFrame(frame);

/* =========================================================
   3. Generative music box — Web Audio, composed live
   ========================================================= */
let engine=null,musicOn=false;
const musicBtn=$('#musicBtn');
function impulse(actx,sec,decay){
  const rate=actx.sampleRate,len=Math.floor(rate*sec),buf=actx.createBuffer(2,len,rate);
  for(let c=0;c<2;c++){const d=buf.getChannelData(c);
    for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,decay);}
  return buf;
}
function note(actx,dest,midi,when,vel,pan){
  const f=440*Math.pow(2,(midi-69)/12);
  const g=actx.createGain();
  g.gain.setValueAtTime(0,when);
  g.gain.linearRampToValueAtTime(vel,when+.007);
  g.gain.exponentialRampToValueAtTime(.0003,when+2);
  const o=actx.createOscillator();o.type='sine';o.frequency.value=f;o.detune.value=Math.random()*5-2.5;
  const o2=actx.createOscillator();o2.type='sine';o2.frequency.value=f*3.47; // music-box partial
  const g2=actx.createGain();g2.gain.value=.04;
  let out=g;
  if(actx.createStereoPanner){const p=actx.createStereoPanner();p.pan.value=(pan||0)*.6;g.connect(p);out=p;}
  o.connect(g);o2.connect(g2);g2.connect(g);out.connect(dest);
  o.start(when);o.stop(when+2.1);o2.start(when);o2.stop(when+2.1);
}
function buildEngine(){
  const actx=new (window.AudioContext||window.webkitAudioContext)();
  const master=actx.createGain();master.gain.value=.75;master.connect(actx.destination);
  const conv=actx.createConvolver();conv.buffer=impulse(actx,2.6,2.8);
  const wet=actx.createGain();wet.gain.value=.34;conv.connect(wet);wet.connect(master);
  const dry=actx.createGain();dry.gain.value=.9;dry.connect(master);dry.connect(conv);
  // D – Bm – G – A, gentle 3/4 arpeggios, 8 bars looping
  const BARS=[
    {r:62,p:[0,7,12,16,19,16]},{r:59,p:[0,7,12,15,19,15]},
    {r:55,p:[0,7,12,16,19,16]},{r:57,p:[0,7,12,16,19,16]},
    {r:62,p:[0,7,12,16,19,24]},{r:59,p:[12,19,24,19,15,12]},
    {r:55,p:[12,16,19,16,12,7]}, {r:57,p:[0,4,7,12,16,19]}
  ];
  const seq=[];
  BARS.forEach(b=>b.p.forEach((o,i)=>{
    const notes=[b.r+o]; if(i===0)notes.push(b.r-12); // soft bass on the downbeat
    seq.push({notes,v:i===0?.16:(i===2?.115:.105)});
  }));
  const EIGHTH=60/64/2, state={nextT:actx.currentTime+.2,idx:0};
  setInterval(()=>{
    if(actx.state!=='running')return;
    while(state.nextT<actx.currentTime+1.2){
      const ev=seq[state.idx];
      ev.notes.forEach((n,k)=>note(actx,dry,n,state.nextT,(k>0?.7:1)*ev.v,(state.idx%12)/12-.5));
      if(Math.random()<.055) // occasional high sparkle
        note(actx,dry,ev.notes[0]+(Math.random()<.5?24:28),state.nextT+EIGHTH*.5,.05,Math.random()-.5);
      state.nextT+=EIGHTH; state.idx=(state.idx+1)%seq.length;
    }
  },280);
  return {actx,state};
}
function setMusic(on){
  musicOn=on;musicBtn.classList.toggle('on',on);
  musicBtn.title=on?'Pause the music box':'Play the music box';
  if(!engine)return;
  if(on){
    if(engine.state.nextT<engine.actx.currentTime+.1)engine.state.nextT=engine.actx.currentTime+.1;
    engine.actx.resume();
  }else engine.actx.suspend();
}
musicBtn.addEventListener('click',()=>{
  if(!engine){engine=buildEngine();}
  setMusic(!musicOn);
});

/* =========================================================
   4. Envelope opening sequence
   ========================================================= */
const overlay=$('#overlay'),envelope=$('#envelope'),flap=$('#envFlap'),
      sealBtn=$('#sealBtn'),ovHint=$('#ovHint'),ovHead=$('.ov-head');
let opened=false;
function finishOpen(){
  overlay.classList.add('gone');
  document.body.classList.remove('locked');
  document.body.classList.add('revealed');
  setTimeout(()=>overlay.style.display='none',1000);
}
sealBtn.addEventListener('click',()=>{
  if(opened)return;opened=true;
  if(!engine)engine=buildEngine();
  setMusic(true); // the click doubles as the audio unlock
  const r=sealBtn.getBoundingClientRect();
  burst(r.left+r.width/2,r.top+r.height/2);
  if(RM){finishOpen();return;}
  sealBtn.classList.add('crack');
  ovHint.classList.add('fade');ovHead.classList.add('fade');
  setTimeout(()=>envelope.classList.add('open'),350);      // flap swings up
  setTimeout(()=>flap.style.zIndex=1,1250);                // flap tucks behind the card
  setTimeout(()=>envelope.classList.add('out'),1350);      // card rises out
  setTimeout(finishOpen,2400);                             // reveal the page
});

/* =========================================================
   5. Scroll reveals, nav state, timeline progress
   ========================================================= */
const io=new IntersectionObserver(es=>es.forEach(e=>{
  if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}
}),{threshold:.15,rootMargin:'0px 0px -8% 0px'});
 $$('.reveal').forEach(el=>io.observe(el));

const nav=$('#nav'),timeline=$('#timeline'),tlFill=$('#tlFill'),nodes=$$('.node');
let ticking=false;
function onScroll(){
  const y=scrollY;
  nav.classList.toggle('scrolled',y>40);
  const tr=timeline.getBoundingClientRect();
  const passed=Math.min(Math.max(innerHeight*.55-tr.top,0),tr.height);
  tlFill.style.transform=`scaleY(${(passed/tr.height).toFixed(3)})`;
  const line=tr.top+passed;
  nodes.forEach(n=>{const r=n.getBoundingClientRect();n.classList.toggle('lit',r.top+5<=line);});
  ticking=false;
}
addEventListener('scroll',()=>{if(!ticking){ticking=true;requestAnimationFrame(onScroll);}},{passive:true});
onScroll();

/* =========================================================
   6. Live countdown — to the datetime set in config.js
   ========================================================= */
const TARGET=new Date(CFG.weddingDateTime).getTime();
const pad=v=>String(v).padStart(2,'0');
let cdT=0; // assigned below — must exist before the first tick, which
           // hits the "just married!" branch when the date has passed
function tickCd(){
  let d=TARGET-Date.now();
  if(d<=0){if(cdT)clearInterval(cdT);$('#count').innerHTML='<p class="cd-done">just married!</p>';return;}
  const s=Math.floor(d/1000);
  $('#cdD').textContent=Math.floor(s/86400);
  $('#cdH').textContent=pad(Math.floor(s/3600)%24);
  $('#cdM').textContent=pad(Math.floor(s/60)%60);
  $('#cdS').textContent=pad(s%60);
}
tickCd();cdT=setInterval(tickCd,1000);

/* =========================================================
   7. Toasts
   ========================================================= */
const toastBox=$('#toasts');
function toast(msg){
  const t=document.createElement('div');t.className='toast';
  t.innerHTML=`<svg class="ic"><use href="#i-sprig"/></svg><span>${msg}</span>`;
  toastBox.appendChild(t);
  requestAnimationFrame(()=>requestAnimationFrame(()=>t.classList.add('show')));
  setTimeout(()=>{t.classList.add('hide');setTimeout(()=>t.remove(),450);},3600);
}

/* =========================================================
   8. Add to calendar (.ics generated locally)
   ========================================================= */
 $('#icsBtn').addEventListener('click',()=>{
  const cal=CFG.calendar;
  const ics=v=>new Date(v).toISOString().replace(/[-:]/g,'').replace(/\.\d+/,'');
  const esc=v=>v.replace(/,/g,'\\,');
  const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//'+cal.prodid+'//EN','BEGIN:VEVENT',
    'UID:'+cal.uid,'DTSTAMP:'+ics(Date.now()),
    'DTSTART:'+ics(CFG.weddingDateTime),
    'DTEND:'+ics(new Date(CFG.weddingDateTime).getTime()+cal.durationHours*3600000),
    'SUMMARY:'+cal.title,
    'LOCATION:'+esc(cal.location),
    'DESCRIPTION:'+esc(cal.description),
    'END:VEVENT','END:VCALENDAR'];
  const blob=new Blob([lines.join('\r\n')],{type:'text/calendar;charset=utf-8'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);a.download=cal.filename;
  document.body.appendChild(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(a.href),4000);
  toast('Calendar file saved — see you in September');
});

/* =========================================================
   9. RSVP — live script preview, stepper, seal & storage
   ========================================================= */
const form=$('#rsvpForm'),nameI=$('#fName'),nameField=$('#nameField'),
      attY=$('#attY'),attN=$('#attN'),gNum=$('#gNum'),
      pvName=$('#pvName'),pvLine=$('#pvLine'),
      confirmEl=$('#confirm'),cName=$('#cName'),cBody=$('#cBody'),
      savedNote=$('#savedNote'),LS=CFG.rsvp.storageKey;
const WORDS=['zero','one','two','three','four','five','six'];
function updatePreview(){
  const n=nameI.value.trim();
  pvName.textContent=n||'Your name';
  pvName.classList.toggle('empty',!n);
  const g=Math.min(CFG.rsvp.maxParty,Math.max(1,parseInt(gNum.textContent)||1));
  pvLine.textContent=attY.checked
    ?`joyfully accepts — party of ${WORDS[g]}`
    :'regretfully declines, with love';
  form.classList.toggle('decline',!attY.checked);
}
nameI.addEventListener('input',()=>{nameField.classList.remove('error');updatePreview();});
[attY,attN].forEach(r=>r.addEventListener('change',updatePreview));
function setG(v){gNum.textContent=Math.min(CFG.rsvp.maxParty,Math.max(1,v));updatePreview();}
 $('#gPlus').addEventListener('click',()=>setG(parseInt(gNum.textContent)+1));
 $('#gMinus').addEventListener('click',()=>setG(parseInt(gNum.textContent)-1));

form.addEventListener('submit',e=>{
  e.preventDefault();
  const n=nameI.value.trim();
  if(!n){
    nameField.classList.add('error');
    nameI.classList.add('shake');setTimeout(()=>nameI.classList.remove('shake'),500);
    nameI.focus();toast('Please tell us your name first');return;
  }
  nameField.classList.remove('error');
  const data={n,att:attY.checked?'yes':'no',g:parseInt(gNum.textContent),
    song:$('#fSong').value.trim(),notes:$('#fNotes').value.trim(),ts:Date.now()};
  try{localStorage.setItem(LS,JSON.stringify(data));}catch(_){}
  cName.textContent=n.split(' ')[0];
  cBody.textContent=data.att==='yes'
    ?'Your reply is sealed and on its way. We’ll save you a seat in the garden — and a slice of cake.'
    :'You’ll be dearly missed — but thank you for telling us. We’ll raise a glass to you on the twelfth.';
  form.style.display='none';
  confirmEl.classList.add('show');
  toast(data.att==='yes'?'Your reply has been sealed — thank you':'Thank you for letting us know');
});
 $('#editReply').addEventListener('click',()=>{
  confirmEl.classList.remove('show');form.style.display='';
});
/* restore a previous reply */
try{
  const saved=JSON.parse(localStorage.getItem(LS)||'null');
  if(saved){
    nameI.value=saved.n||'';
    if(saved.att==='no')attN.checked=true;
    gNum.textContent=Math.min(CFG.rsvp.maxParty,Math.max(1,saved.g||1));
    $('#fSong').value=saved.song||'';
    $('#fNotes').value=saved.notes||'';
    savedNote.hidden=false;updatePreview();
  }
}catch(_){}
updatePreview();
})();
