import { createJournalScene } from './journal-scene';
import { installV2Reader } from './v2-reader';
import './style.css';
import './v2-reader.css';
import './v3-overrides.css';
const app=document.querySelector('#app');
app.innerHTML=`<main id="home" class="journal-home"><h1 class="sr-only">个人作品集 · 立体创作日志</h1><div id="three-stage"></div><nav class="model-access sr-only" aria-label="三维日志物品"><button data-model="content">ID CARD · 内容与运营</button><button data-model="ai">AI 创作实验</button><button data-model="visual">视觉手记</button><button data-model="about">关于我</button></nav><div id="load-state" role="status">正在准备三维日志</div><div class="scene-actions" hidden><button id="read-object">阅读档案 ↗</button><button id="restore-object">返回日志 ×</button></div></main>`;
let journal=null,lastOpener=null;
const reader=installV2Reader({onClose:()=>{document.querySelector('#read-object').focus();},onSwitch:id=>journal?.focus(id)});
function onState({phase,id}){
 document.querySelector('.scene-actions').hidden=phase!=='focused';
 if(phase==='opening'&&location.hash!==`#project/${id}`)history.pushState({project:id},'',`#project/${id}`);
 if(phase==='idle'){reader.close(false);if(location.hash.startsWith('#project/'))history.replaceState(null,'',location.pathname+location.search);lastOpener?.focus({preventScroll:true});}
}
document.querySelector('#read-object').onclick=()=>reader.open(journal.state.selected);
document.querySelector('#restore-object').onclick=()=>journal?.restore();
document.querySelectorAll('[data-model]').forEach(b=>b.onclick=()=>{lastOpener=b;journal?.focus(b.dataset.model);});
window.addEventListener('keydown',e=>{if(e.key==='Escape'&&!reader.isOpen&&!document.querySelector('#lightbox').open&&!document.querySelector('#contact-dialog').open)journal?.restore();});
window.addEventListener('hashchange',()=>{const m=location.hash.match(/^#project\/([a-z]+)/);if(m)journal?.focus(m[1]);else journal?.restore();});
async function init(){try{journal=await createJournalScene(document.querySelector('#three-stage'),onState);window.__journal3d=journal;window.__portfolioReader=reader;document.querySelector('#load-state').hidden=true;const m=location.hash.match(/^#project\/([a-z]+)/);if(m)journal.focus(m[1]);}catch(error){console.error(error);document.querySelector('#load-state').textContent='三维场景未能加载，请启用 WebGL 后刷新。';}}
init();window.addEventListener('pagehide',()=>journal?.dispose());
