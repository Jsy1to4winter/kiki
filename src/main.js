import gsap from 'gsap';
import { createJournalScene } from './journal-scene';
import { profile, chapters, demo } from './content';
import './style.css';
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const app=document.querySelector('#app');
app.innerHTML=`<main id="home" class="journal-home"><h1 class="sr-only">${profile.name} 的个人创作日志</h1><div id="three-stage"></div><nav class="model-access sr-only" aria-label="三维日志物品">${chapters.map(c=>`<button data-model="${c.id}">${c.title}</button>`).join('')}</nav><div id="load-state" role="status">正在准备三维日志</div><div class="scene-actions" hidden><button id="read-object">阅读档案 ↗</button><button id="restore-object">返回日志 ×</button></div></main>
<section id="reader" role="region" aria-labelledby="focus-title" hidden><article class="focus-object" tabindex="-1"><div class="focus-header"><span id="focus-meta"></span><button id="close-reader" aria-label="收起内容">×</button></div><div class="focus-scroll"><span class="focus-eyebrow">PERSONAL ARCHIVE / 示例内容</span><h2 id="focus-title"></h2><p id="focus-note"></p><nav class="focus-tabs" aria-label="日志内容分节"></nav><div id="focus-content"></div></div></article></section>
<dialog id="contact-dialog" aria-labelledby="contact-title"><button class="contact-close" aria-label="关闭联系窗口">×</button><h2 id="contact-title">一起，让想法发生。</h2><p>联系方式将在个人资料确认后开放。</p><div class="contact-info">${profile.email||'联系方式尚未添加'}</div><button class="contact-confirm">回到日志 ↗</button></dialog>`;
const object=document.querySelector('.focus-object');const contact=document.querySelector('#contact-dialog');
let active=null,currentTab='overview',journal=null,lastOpener=null;
const titles={overview:'概览',process:'思路与行动',work:'作品与复盘',index:'日志目录'};
function onState({phase,id}){active=id;if(phase==='opening'&&location.hash!==`#project/${id}`)history.pushState({project:id},'',`#project/${id}`);document.querySelector('.scene-actions').hidden=phase!=='focused';if(phase!=='focused')document.querySelector('#reader').hidden=true;if(phase==='idle'){if(location.hash.startsWith('#project/'))history.replaceState(null,'',location.pathname+location.search);lastOpener?.focus({preventScroll:true});}}
function showReader(){const c=chapters.find(c=>c.id===active);if(!c)return;document.querySelector('#focus-meta').textContent=`${c.number} / ${c.en}`;document.querySelector('#focus-title').textContent=c.title;document.querySelector('#focus-note').textContent=c.note;setTab('overview');document.querySelector('#reader').hidden=false;document.querySelector('#close-reader').focus();}
function openProject(id){if(!journal)return;journal.focus(id);}
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

document.querySelector('#read-object').onclick=showReader;
document.querySelector('#restore-object').onclick=()=>journal?.restore();
document.querySelector('#close-reader').onclick=()=>{document.querySelector('#reader').hidden=true;document.querySelector('#read-object').focus();};
document.querySelector('#reader').onclick=e=>{if(e.target.id==='reader'){e.currentTarget.hidden=true;return;}const t=e.target.closest('[data-tab]');if(t)setTab(t.dataset.tab);};
document.querySelectorAll('[data-model]').forEach(b=>b.onclick=()=>{lastOpener=b;openProject(b.dataset.model);});
contact.querySelectorAll('.contact-close,.contact-confirm').forEach(b=>b.onclick=()=>contact.close());
window.addEventListener('keydown',e=>{if(e.key==='Escape'&&!contact.open){if(!document.querySelector('#reader').hidden)document.querySelector('#reader').hidden=true;else journal?.restore();}});
window.addEventListener('hashchange',()=>{const m=location.hash.match(/^#project\/([a-z]+)/);if(m)openProject(m[1]);else journal?.restore();});
async function init(){try{journal=await createJournalScene(document.querySelector('#three-stage'),onState);window.__journal3d=journal;document.querySelector('#load-state').hidden=true;const m=location.hash.match(/^#project\/([a-z]+)/);if(m)openProject(m[1]);}catch(error){console.error(error);document.querySelector('#load-state').textContent='三维场景未能加载，请确认浏览器已启用 WebGL 后刷新。';}
}
init();
window.addEventListener('pagehide',()=>journal?.dispose());
