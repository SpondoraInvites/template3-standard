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
   3. Background music — looping nasheed (audio file)
   ========================================================= */
const musicBtn=$('#musicBtn');
const MUSIC={src:(CFG.music&&CFG.music.src)||'assets/music/nafsiji.mp3',
             volume:(CFG.music&&typeof CFG.music.volume==='number')?CFG.music.volume:.6};
let audio=null,musicOn=false;
function ensureAudio(){
  if(audio)return audio;
  audio=new Audio(MUSIC.src);
  audio.loop=true;audio.preload='auto';audio.volume=0;
  return audio;
}
function fadeTo(target,done){
  if(!audio)return;
  const from=audio.volume,t0=performance.now(),dur=650;
  (function step(now){
    const k=Math.min(1,(now-t0)/dur);
    audio.volume=Math.max(0,Math.min(1,from+(target-from)*k));
    if(k<1)requestAnimationFrame(step);
    else if(done)done();
  })(t0);
}
function setMusic(on){
  musicOn=on;musicBtn.classList.toggle('on',on);
  musicBtn.title=on?'Pause the music':'Play the music';
  if(!audio)return;
  if(on){
    const p=audio.play();
    if(p&&p.catch)p.catch(()=>{});
    fadeTo(MUSIC.volume);
  }else fadeTo(0,()=>audio.pause());
}
musicBtn.addEventListener('click',()=>{ensureAudio();setMusic(!musicOn);});

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
  ensureAudio();
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

/* =========================================================
   10. Share — copy link + WhatsApp / Messenger / Telegram /
       email. Any [data-share-button] paired (via
       aria-controls) with a [data-share-menu] opens the same
       channel options; the "day" section uses one inline, and
       a floating one sticks above the music button once the
       hero scrolls out of view. No backend: channels compose
       prefilled links; copying falls back for plain http.
   ========================================================= */
const shareText=()=>{
  const d=new Date(CFG.weddingDateTime);
  const when=d&&Number.isFinite(d.getTime())
    ?d.toLocaleDateString('en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric'}) :'';
  return `${CFG.calendar.title}${when?' — '+when:''}`;
};
const enc=s=>encodeURIComponent(s);
async function copyLink(){
  const url=location.href;
  try{
    await navigator.clipboard.writeText(url);
  }catch(_){
    /* Clipboard API needs a secure context — fall back for plain http */
    const ta=document.createElement('textarea');
    ta.value=url;ta.style.position='fixed';ta.style.opacity='0';
    document.body.appendChild(ta);ta.select();
    try{document.execCommand('copy');}catch(__){}
    ta.remove();
  }
  toast('Invitation link copied');
}
const shareActions={
  copy:copyLink,
  whatsapp:()=>window.open(`https://wa.me/?text=${enc(`${shareText()}\n${location.href}`)}`,'_blank','noopener'),
  /* shortcut: deep link only opens the Messenger app (mobile); the desktop
     web dialog needs a registered Facebook app ID */
  messenger:()=>window.open(`fb-messenger://share/?link=${enc(location.href)}`,'_blank','noopener'),
  telegram:()=>window.open(`https://t.me/share/url?url=${enc(location.href)}&text=${enc(shareText())}`,'_blank','noopener'),
  email:()=>{location.href=`mailto:?subject=${enc(shareText())}&body=${enc(`${shareText()}\n${location.href}`)}`;},
};
const sharePairs=[];
for(const button of $$('[data-share-button]')){
  const menu=document.getElementById(button.getAttribute('aria-controls')||'');
  if(!menu)continue;
  menu.hidden=false; // JS is healthy — the .open class takes over from [hidden]
  const setOpen=open=>{
    menu.classList.toggle('open',open);
    button.setAttribute('aria-expanded',String(open));
  };
  button.addEventListener('click',()=>setOpen(!menu.classList.contains('open')));
  document.addEventListener('click',e=>{
    if(menu.classList.contains('open')&&!menu.contains(e.target)&&e.target.closest('[data-share-button]')!==button)setOpen(false);
  });
  for(const[key,fn]of Object.entries(shareActions)){
    const b=menu.querySelector(`[data-share="${key}"]`);
    if(!b)continue;
    b.addEventListener('click',()=>{fn();if(key!=='copy')setOpen(false);});
  }
  sharePairs.push({button,setOpen});
}
document.addEventListener('keydown',e=>{
  if(e.key!=='Escape')return;
  for(const{button,setOpen}of sharePairs){
    if(button.getAttribute('aria-expanded')==='true'){setOpen(false);button.focus();}
  }
});
/* floating share — slides in above the music button once the hero
   has scrolled out of view */
const heroEl=$('.hero'),floatShare=$('#floatShare');
if(heroEl&&floatShare){
  const updateFloat=()=>{
    floatShare.classList.toggle('show',heroEl.getBoundingClientRect().bottom<innerHeight*.4);
  };
  updateFloat();
  addEventListener('scroll',updateFloat,{passive:true});
  addEventListener('resize',updateFloat,{passive:true});
}
})();
