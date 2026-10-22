import gsap from 'gsap';
import { profile, chapters, demo } from './content';
import './style.css';
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const app=document.querySelector('#app');
app.innerHTML=`<main id="home" class="journal-home"><h1 class="sr-only">${profile.name} 的个人创作日志</h1><section class="scene" id="scene" aria-label="点击日志中的物品查看内容"><div class="archive-wrap" id="archive-wrap"><div class="archive" id="archive"><img class="archive-image" src="/archive.svg" alt="奶油白纸张、蓝色文件夹、地图线稿和金属夹组成的个人创作档案" width="1100" height="720" fetchpriority="high">
<div class="archive-label archive-top">FIELD NOTES <span>个人创作档案 / 2026</span></div>
<button class="paper-link entry-content" data-open="content"><span class="paper-kicker">01 / SELECTED CONTENT</span><strong>内容<br>有回响。</strong><span class="paper-caption">内容与运营 <b>↗</b></span></button>
<button class="paper-link entry-ai" data-open="ai"><span class="paper-kicker">02 / EXPLORATION</span><strong>超越<br><i>想象</i></strong><span class="paper-caption">AI 创作实验 <b>↗</b></span></button>
<button class="paper-link entry-visual" data-open="visual"><span class="paper-kicker">03 / VISUAL JOURNAL</span><strong>看见，<br>另一种可能。</strong><span class="paper-caption">视觉手记 <b>↗</b></span></button>
<button class="paper-link entry-about" data-open="about"><span class="paper-kicker">04 / PERSONAL FILE</span><strong>HELLO,<br>I’M ${profile.name}.</strong><span class="paper-caption">关于我 <b>↗</b></span></button>
<span class="margin-note">make things<br><i>that matter.</i></span><span class="archive-stamp">OPEN<br>TO IDEAS</span><span class="little-label">创作没有标准答案</span><div class="journal-controls"><span>点击物品 · 展开日志</span><button id="replay">重播聚合 ↻</button><button id="skip" hidden>跳过开场 →</button></div></div><canvas id="particles" aria-hidden="true"></canvas></div></section></main>
<dialog id="focus-dialog" aria-labelledby="focus-title"><article class="focus-object" tabindex="-1"><img class="focus-texture" alt="" aria-hidden="true"><div class="focus-header"><span id="focus-meta"></span><button id="close-focus" aria-label="退出聚焦，返回日志">×</button></div><div class="focus-scroll"><span class="focus-eyebrow">PERSONAL ARCHIVE / 示例内容</span><h2 id="focus-title"></h2><p id="focus-note"></p><nav class="focus-tabs" aria-label="日志内容分节"></nav><div id="focus-content"></div></div><div class="focus-bottom"><span>点击纸张外的空白处返回</span><span>ESC ↙</span></div></article></dialog>
<dialog id="contact-dialog" aria-labelledby="contact-title"><button class="contact-close" aria-label="关闭联系窗口">×</button><span class="eyebrow">LET’S MAKE SOMETHING</span><h2 id="contact-title">一起，让想法发生。</h2><p>欢迎交流内容、视觉与 AI 创作。<br>联系方式将在个人资料确认后开放。</p><div class="contact-info">${profile.email ? `<a href="mailto:${profile.email}">${profile.email}</a>` : '联系方式尚未添加'}</div><button class="contact-confirm">好的，回到日志 ↗</button></dialog>`;
const dialog=document.querySelector('#focus-dialog');
const object=dialog.querySelector('.focus-object');
const contact=document.querySelector('#contact-dialog');
let active=null,opener=null,transition=null,closing=false,currentTab='overview';
const titles={overview:'概览',process:'思路与行动',work:'作品与复盘',index:'日志目录'};
const angles={content:-7,ai:4,visual:5,about:-5};
function setTab(tab){
 currentTab=tab;const c=chapters.find(c=>c.id===active),d=demo[active];if(!c)return;
 document.querySelector('.focus-tabs').innerHTML=Object.entries(titles).map(([id,title])=>`<button data-tab="${id}" aria-current="${id===tab?'page':'false'}">${title}</button>`).join('');
 const body=document.querySelector('#focus-content');
 if(tab==='overview')body.innerHTML=`<h3>${d.title}</h3><p>${d.description}</p><dl class="focus-facts"><div><dt>方向</dt><dd>${c.label}</dd></div><div><dt>状态</dt><dd>演示文案 · 真实资料待加入</dd></div></dl>${active==='about'?`<div class="journal-signoff"><p>这是第一版，也是新的起点。<br>期待下一个一起展开的故事。</p><button data-contact>聊聊新的可能 ↗</button></div>`:''}`;
 if(tab==='process')body.innerHTML=`<h3>让过程，也值得被看见。</h3><ol class="focus-process">${d.work.map((w,i)=>`<li><span>0${i+1}</span><p>${w}</p></li>`).join('')}</ol>`;
 if(tab==='work')body.innerHTML=`<h3>从草稿，到作品。</h3><p>${d.output}</p><div class="focus-mini-art" role="img" aria-label="档案主题示意插画，非真实作品"><span>MAKE<br>THINGS<br>MATTER.</span><i></i></div><h3>留一点空间给下一次。</h3><p>${d.reflection}</p>`;
 if(tab==='index')body.innerHTML=`<h3>每一页，都有迹可循。</h3><div class="journal-index">${chapters.map(p=>`<button data-open="${p.id}"><span>${p.number}</span><strong>${p.title}<small>${p.en}</small></strong><span>↗</span></button>`).join('')}</div><p class="journal-index-note">这是第一版，也是新的起点。<br>示例姓名与案例 · 待替换为真实资料</p><div class="journal-signoff"><p>期待下一个<br>一起展开的故事。</p><button data-contact>聊聊新的可能 ↗</button><small>© 2026 ${profile.name} · PERSONAL ARCHIVE</small></div>`;
 body.querySelectorAll('[data-open]').forEach(b=>b.onclick=()=>{location.hash=`project/${b.dataset.open}`;});
 body.querySelectorAll('[data-contact]').forEach(b=>b.onclick=()=>contact.showModal());
 if(!reduced.matches)gsap.fromTo(body,{opacity:.25,y:7},{opacity:1,y:0,duration:.23,overwrite:true});
}
function sourcePose(){
 const rect=opener?.getBoundingClientRect();const target=object.getBoundingClientRect();
 if(!rect)return{x:0,y:24,scaleX:.96,scaleY:.96,rotation:0,opacity:0};
 return{x:rect.left+rect.width/2-(target.left+target.width/2),y:rect.top+rect.height/2-(target.top+target.height/2),scaleX:rect.width/target.width,scaleY:rect.height/target.height,rotation:angles[active]||0,opacity:.65};
}
function openProject(id){
 const c=chapters.find(c=>c.id===id);if(!c)return;
 if(active===id&&dialog.open&&!closing)return;
 finishIntro();transition?.kill();closing=false;
 const wasOpen=dialog.open;active=id;opener=document.querySelector(`.paper-link[data-open="${id}"]`);
 object.dataset.theme=id;
 document.querySelector('.focus-texture').src=`/item-${id}.svg`;
 document.querySelector('#focus-meta').textContent=`${c.number} / ${c.en}`;
 document.querySelector('#focus-title').textContent=c.title;
 document.querySelector('#focus-note').textContent=c.note;
 setTab('overview');if(!wasOpen)dialog.showModal();
 document.body.classList.add('focusing');document.querySelector('.focus-scroll').scrollTop=0;
 gsap.set(object,{clearProps:'transform,opacity'});
 const pose=sourcePose();
 transition=gsap.timeline().fromTo(object,wasOpen?{opacity:.2,y:10}:pose,{x:0,y:0,scaleX:1,scaleY:1,rotation:0,opacity:1,duration:reduced.matches?0:.65,ease:'power3.inOut'},0).to('#archive',{opacity:.22,scale:.97,duration:reduced.matches?0:.45,ease:'power2.out'},0);
 document.querySelector('#close-focus').focus({preventScroll:true});
}
function closeProject(){
 if(!dialog.open||closing)return;closing=true;transition?.kill();
 // Measure the untransformed destination afresh, including viewport changes.
 gsap.set(object,{x:0,y:0,scaleX:1,scaleY:1,rotation:0});const pose=sourcePose();
 const done=()=>{dialog.close();active=null;closing=false;document.body.classList.remove('focusing');gsap.set(object,{clearProps:'transform,opacity'});gsap.set('#archive',{clearProps:'transform,opacity'});opener?.focus({preventScroll:true});};
 transition=gsap.timeline({onComplete:done}).to(object,{...pose,opacity:0,duration:reduced.matches?0:.5,ease:'power3.inOut'},0).to('#archive',{opacity:1,scale:1,duration:reduced.matches?0:.5,ease:'power2.out'},0);
}
function returnHome(){if(location.hash.startsWith('#project/'))history.replaceState(null,'',location.pathname+location.search);closeProject();}
function route(){const match=location.hash.match(/^#project\/([a-z]+)/);if(match)openProject(match[1]);else closeProject();}
document.querySelectorAll('.paper-link').forEach(b=>b.onclick=()=>{if(location.hash===`#project/${b.dataset.open}`)openProject(b.dataset.open);else location.hash=`project/${b.dataset.open}`;});
document.querySelector('#close-focus').onclick=returnHome;
dialog.addEventListener('click',e=>{if(e.target===dialog)returnHome();const tab=e.target.closest('[data-tab]');if(tab)setTab(tab.dataset.tab);});
dialog.addEventListener('cancel',e=>{e.preventDefault();returnHome();});
contact.querySelectorAll('.contact-close,.contact-confirm').forEach(b=>b.onclick=()=>contact.close());
contact.addEventListener('click',e=>{if(e.target===contact)contact.close();});
window.addEventListener('hashchange',route);

// Particle targets are sampled from the same transparent SVG and share its coordinates.
const canvas=document.querySelector('#particles');const ctx=canvas.getContext('2d');const image=document.querySelector('.archive-image');
let intro=null, frame=0, points=[], progress={value:0}, hasFinished=true;
function sessionSeen(){try{return sessionStorage.getItem('archive-intro')==='seen';}catch{return false;}}
function finishIntro(){intro?.kill();cancelAnimationFrame(frame);hasFinished=true;gsap.set('#archive',{opacity:1});canvas.style.opacity=0;document.querySelector('#skip').hidden=true;document.querySelector('#replay').hidden=false;try{sessionStorage.setItem('archive-intro','seen');}catch{}}
function draw(){if(document.hidden||hasFinished)return;const w=canvas.width,h=canvas.height;ctx.clearRect(0,0,w,h);const t=progress.value;
 for(const p of points){const k=gsap.parseEase('power3.out')(Math.min(1,Math.max(0,(t-p.delay)/(1-p.delay))));const x=(p.sx+(p.x-p.sx)*k)*w,y=(p.sy+(p.y-p.sy)*k)*h;ctx.fillStyle=`rgba(85,120,255,${p.a})`;ctx.fillRect(x,y,p.size,p.size);}
 frame=requestAnimationFrame(draw);
}
async function startIntro(force=false){
 finishIntro();if(reduced.matches||(!force&&sessionSeen()))return;
 try{await image.decode();const sample=document.createElement('canvas');sample.width=550;sample.height=360;const sc=sample.getContext('2d',{willReadFrequently:true});sc.drawImage(image,0,0,550,360);const pixels=sc.getImageData(0,0,550,360).data;
 points=[];for(let y=0;y<360;y+=4)for(let x=0;x<550;x+=4){const i=(y*550+x)*4;if(pixels[i+3]>100&&Math.random()>.2){points.push({x:x/550,y:y/360,sx:Math.random()*1.4-.2,sy:Math.random()*1.4-.2,delay:Math.random()*.22,a:.4+Math.random()*.6,size:Math.random()+1});}}
 const box=canvas.getBoundingClientRect();canvas.width=box.width*Math.min(devicePixelRatio,2);canvas.height=box.height*Math.min(devicePixelRatio,2);
 hasFinished=false;progress.value=0;gsap.set('#archive',{opacity:0});canvas.style.opacity=1;document.querySelector('#skip').hidden=false;document.querySelector('#replay').hidden=true;draw();
 intro=gsap.timeline({onComplete:finishIntro}).to(progress,{value:1,duration:2,ease:'none'},0).to('#archive',{opacity:1,duration:1,ease:'power2.inOut'},1.35).to(canvas,{opacity:0,duration:.7},1.8);
 }catch{finishIntro();}
}
document.querySelector('#skip').onclick=finishIntro;document.querySelector('#replay').onclick=()=>startIntro(true);
document.addEventListener('visibilitychange',()=>{if(document.hidden){intro?.pause();cancelAnimationFrame(frame);}else if(!hasFinished){intro?.resume();draw();}});
window.addEventListener('resize',()=>{if(!hasFinished)finishIntro();});reduced.addEventListener('change',()=>{if(reduced.matches)finishIntro();});
window.addEventListener('pagehide',()=>{finishIntro();transition?.kill();});
if(location.hash.startsWith('#project/')){route();}else if(!reduced.matches&&!sessionSeen()){startIntro(true);}else finishIntro();
