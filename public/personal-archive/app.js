const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const scenes=$$('.scene'),detail=$('#detail');let index=0,lastFocus=null;const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
function go(to){
 if(detail.open||!$('#cover').hidden)return;
 to=(to+scenes.length)%scenes.length;
 if(to===index)return;
 const from=scenes[index],next=scenes[to];
 // Swap synchronously: never composite two translucent page panels.
 from.hidden=true;from.inert=true;
 next.hidden=false;next.inert=false;index=to;
 $$('[data-go]').forEach(b=>{const selected=+b.dataset.go===index;b.classList.toggle('selected',selected);if(selected)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current')});
 $('#position').textContent=`0${index+1} / 05`;
 $('#page-path').textContent='PERSONAL ARCHIVE / '+['PROFILE','NOTES','COLLECTION','ECHOES','TRACE'][index];
 window.scrollTo({top:0,behavior:'instant'});
}

$$('[data-go]').forEach(b=>b.onclick=()=>go(+b.dataset.go));$$('[data-next]').forEach(b=>b.onclick=()=>go(index+1));$$('[data-prev]').forEach(b=>b.onclick=()=>go(index-1));scenes.forEach((s,i)=>{s.inert=i!==0});
let touchX=0,touchY=0;$('#camera').addEventListener('touchstart',e=>{touchX=e.changedTouches[0].clientX;touchY=e.changedTouches[0].clientY},{passive:true});$('#camera').addEventListener('touchend',e=>{const dx=e.changedTouches[0].clientX-touchX,dy=e.changedTouches[0].clientY-touchY;if(Math.abs(dx)>65&&Math.abs(dx)>Math.abs(dy)*1.5)go(index+(dx<0?1:-1))},{passive:true});
function show(content){lastFocus=document.activeElement;$('#detail-content').innerHTML=content;detail.showModal();$('#close-detail').focus()}
$$('[data-image]').forEach(b=>b.onclick=()=>show(`<img src="${b.dataset.image}" alt="收藏图片原图">`));function close(){detail.close();lastFocus?.focus({preventScroll:true})}$('#close-detail').onclick=close;$('#close-bottom').onclick=close;detail.onclick=e=>{if(e.target===detail){const r=detail.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)close()}};
document.addEventListener('keydown',e=>{if(detail.open||!$('#cover').hidden)return;if(e.key==='ArrowRight')go(index+1);if(e.key==='ArrowLeft')go(index-1)});

const cover=$('#cover'),app=$('#app');document.body.classList.add('at-cover');function openArchive(){if(cover.hidden)return;cover.classList.add('departing');app.inert=false;document.body.classList.remove('at-cover');setTimeout(()=>{cover.hidden=true;cover.classList.remove('departing');$('#nav button.selected').focus({preventScroll:true})},reduced?40:650)}
$('#open-archive').onclick=e=>{e.stopPropagation();openArchive()};cover.onclick=openArchive;

// Prevent native double-tap magnification only on navigation controls.
$('#nav').addEventListener('dblclick', event => event.preventDefault());
