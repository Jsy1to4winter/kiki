const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const scenes=$$('.scene'),detail=$('#detail');let index=0,lastFocus=null;const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
let switching = false, pending = null;
function swapScene(to) {
 const from=scenes[index],next=scenes[to];
 from.hidden=true;from.inert=true;
 next.hidden=false;next.inert=false;index=to;
 $$('[data-go]').forEach(b=>{const selected=+b.dataset.go===index;b.classList.toggle('selected',selected);if(selected)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current')});
 $('#position').textContent=`0${index+1} / 05`;
 $('#page-path').textContent='PERSONAL ARCHIVE / '+['PROFILE','NOTES','COLLECTION','ECHOES','TRACE'][index];
 window.scrollTo({top:0,behavior:'instant'});
}
function finishSwitch() {
 switching=false;
 $('#camera').removeAttribute('aria-busy');
 document.documentElement.classList.remove('camera-fallback');
 const queued=pending;pending=null;
 if(queued!==null&&queued!==index)go(queued);
}
function contentOf(scene) {
 let content=scene.querySelector(':scope > .scene-content');
 if(!content){content=document.createElement('div');content.className='scene-content';content.append(...scene.childNodes);scene.append(content);}
 return content;
}
function go(to){
 if(document.querySelector('dialog[open]')||!$('#cover').hidden)return;
 to=(to+scenes.length)%scenes.length;
 if(switching){pending=to;return;}
 if(to===index)return;
 if(matchMedia('(prefers-reduced-motion: reduce)').matches){swapScene(to);return;}
 switching=true;
 $('#camera').setAttribute('aria-busy','true');
 if(document.startViewTransition){
  // Animate flattened browser snapshots so live frosted panels never overlap.
  try{
   const transition=document.startViewTransition(()=>swapScene(to));
   transition.finished.catch(()=>{}).finally(finishSwitch);
  }catch{swapScene(to);finishSwitch();}
 }else if(window.gsap){
  // Older browsers keep the frosted outer panel stable and push only its content.
  const outgoing=contentOf(scenes[index]),incoming=contentOf(scenes[to]);
  document.documentElement.classList.add('camera-fallback');
  const tl=gsap.timeline({onComplete:finishSwitch});
  tl.to(outgoing,{scale:1.065,opacity:0,filter:'blur(5px)',duration:.22,ease:'power2.in'})
   .call(()=>{swapScene(to);gsap.set(outgoing,{clearProps:'transform,opacity,filter'});gsap.set(incoming,{scale:.965,opacity:0,filter:'blur(5px)'});})
   .to(incoming,{scale:1,opacity:1,filter:'blur(0px)',duration:.28,ease:'power2.out'})
   .set(incoming,{clearProps:'transform,opacity,filter'});
 }else{swapScene(to);finishSwitch();}
}

$$('[data-go]').forEach(b=>b.onclick=()=>go(+b.dataset.go));$$('[data-next]').forEach(b=>b.onclick=()=>go(index+1));$$('[data-prev]').forEach(b=>b.onclick=()=>go(index-1));scenes.forEach((s,i)=>{s.inert=i!==0});
let touchX=0,touchY=0;$('#camera').addEventListener('touchstart',e=>{touchX=e.changedTouches[0].clientX;touchY=e.changedTouches[0].clientY},{passive:true});$('#camera').addEventListener('touchend',e=>{const dx=e.changedTouches[0].clientX-touchX,dy=e.changedTouches[0].clientY-touchY;if(Math.abs(dx)>65&&Math.abs(dx)>Math.abs(dy)*1.5)go(index+(dx<0?1:-1))},{passive:true});
function show(content){lastFocus=document.activeElement;$('#detail-content').innerHTML=content;detail.showModal();$('#close-detail').focus({preventScroll:true})}
$$('[data-image]').forEach(b=>b.onclick=()=>show(`<img src="${b.dataset.image}" alt="收藏图片原图">`));function close(){detail.close();lastFocus?.focus({preventScroll:true})}$('#close-detail').onclick=close;$('#close-bottom').onclick=close;detail.onclick=e=>{if(e.target===detail){const r=detail.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)close()}};
document.addEventListener('keydown',e=>{if(document.querySelector('dialog[open]')||!$('#cover').hidden)return;if(e.key==='ArrowRight')go(index+1);if(e.key==='ArrowLeft')go(index-1)});

const cover=$('#cover'),app=$('#app');document.body.classList.add('at-cover');function openArchive(){if(cover.hidden)return;cover.classList.add('departing');app.inert=false;document.body.classList.remove('at-cover');setTimeout(()=>{cover.hidden=true;cover.classList.remove('departing');$('#nav button.selected').focus({preventScroll:true})},reduced?40:650)}
$('#open-archive').onclick=e=>{e.stopPropagation();openArchive()};cover.onclick=openArchive;

// Prevent native double-tap magnification only on navigation controls.
$('#nav').addEventListener('dblclick', event => event.preventDefault());

// Pointer-triggered dialogs have no focus ring; keyboard focus remains visible.
document.documentElement.dataset.input='pointer';
document.addEventListener('pointerdown',()=>{document.documentElement.dataset.input='pointer';},true);
document.addEventListener('keydown',event=>{if(event.key==='Tab'||event.key==='Enter'||event.key===' ')document.documentElement.dataset.input='keyboard';},true);
