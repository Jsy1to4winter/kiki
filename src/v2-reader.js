import gsap from "gsap";
export function installV2Reader({onClose,onSwitch}={}){
const ht=gsap,St=matchMedia("(prefers-reduced-motion: reduce)");let we=null;
const fi={name:"KIKI"};
const hi=[
{id:"content",number:"01",title:"内容与运营",en:"CONTENT & STRATEGY"},
{id:"ai",number:"02",title:"AI 创作实验",en:"AI & EXPLORATION"},
{id:"visual",number:"03",title:"视觉手记",en:"VISUAL JOURNAL"},
{id:"about",number:"04",title:"关于我",en:"A LITTLE ABOUT ME"}];
const TABS={
content:[["dy","抖音剧情账号"],["idea","运营思路"],["xhs","小红书账号"],["notes","笔记与数据"]],
ai:[["main","AI 创作"]],
visual:[["main","视觉手记"]],
about:[["id","基本信息"],["skill","职业技能"]]};
const IMG="/assets/img/";
const g=(a)=>a.map((x,n)=>({id:"d"+n,src:IMG+x[0],cap:x[1]||""}));

/* ---------- 默认内容（来自个人作品集 PDF） ---------- */
const DEF={f:{},i:{},g:{}};
Object.assign(DEF.f,{
"content.title":"ACCOUNT\nOPERATION","content.cn":"账号运营","content.meta":"PART 01 · SELECTED CONTENT · 2025—2026",
"ai.title":"AI\nEXPLORATION","ai.cn":"AI 创作实验","ai.meta":"PART 02 · AI & EXPLORATION",
"visual.title":"VISUAL\nJOURNAL","visual.cn":"视觉手记","visual.meta":"PART 03 · VISUAL JOURNAL",
"about.title":"BASIC\nINFORMATION","about.cn":"关于我","about.meta":"PART 04 · PERSONAL FILE · 个人简介",

"content.dy.kick":"PART 01 · 账号搭建","content.dy.name":"@抖音剧情类账号",
"content.dy.s1.k":"运营周期","content.dy.s1.v":"2025年1月—2026年9月",
"content.dy.s2.k":"粉丝总增长量","content.dy.s2.v":"7.1万，账号从0启动，纯自然流无投流",
"content.dy.s3.k":"总点赞藏","content.dy.s3.v":"点赞503万，自然流量占比80%",
"content.dy.s4.k":"视频数及爆款量","content.dy.s4.v":"总100+篇，平均每月6-8篇，其中15篇（点赞>5w+），其中6篇点赞10w+",
"content.dy.datacap":"部分数据展示",

"content.idea.kick":"PART 01 · 账号搭建","content.idea.h":"运营思路",
"content.idea.body":"从0到1搭建新媒体账号，以用户需求为核心、内容增长为目标、数据复盘为依据，建立从账号定位、选题策划、内容生产到用户运营的完整流程通过市场调研挖掘内容机会，结合热点与用户反馈持续优化内容，逐步形成可复用的内容生产和运营机制，用户思维、利他、提供价值和满足人群需求是产出优质内容的王道",
"content.idea.s1.n":"01","content.idea.s1.t":"账号定位与前期调研","content.idea.s1.b":"结合自身经验、内容优势及市场需求，明确账号定位、目标用户与内容方向；观察同赛道账号的内容布局、用户反馈及数据表现，寻找现有内容中的空缺，确定账号的差异化切入点",
"content.idea.s2.n":"02","content.idea.s2.t":"竞品分析与内容拆解","content.idea.s2.b":"筛选同领域优质账号，围绕账号定位、选题方向、标题表达、内容结构及互动情况进行分析，拆解高流量内容的共性，了解目标用户的兴趣偏好与内容需求，为后续内容策划提供参考",
"content.idea.s3.n":"03","content.idea.s3.t":"用户洞察与选题规划","content.idea.s3.b":"结合用户评论、互动反馈、平台热点及同类账号表现，挖掘用户感兴趣的话题与潜在需求；挖掘40+高流量选题，建立选题储备，并根据内容方向、用户需求及热点时效性安排发布计划",
"content.idea.s4.n":"04","content.idea.s4.t":"内容策划与生产","content.idea.s4.b":"围绕选定主题完成素材搜集、内容构思、脚本撰写及视频剪辑，持续优化内容切入点、开头吸引力与表达方式。结合热点事件和用户讨论策划内容",
"content.idea.s5.n":"05","content.idea.s5.t":"数据复盘","content.idea.s5.b":"持续跟踪内容发布后的播放量、完播率、点赞、评论及涨粉等数据，分析不同选题与内容形式的表现差异。通过高表现内容拆解与低表现内容复盘，判断内容优势及优化方向，并将分析结果应用于后续选题与制作",
"content.idea.s6.n":"06","content.idea.s6.t":"策略迭代与用户运营","content.idea.s6.b":"根据数据表现及用户反馈，持续调整内容方向、选题策略与表达方式，建立「用户洞察—选题策划—内容生产—发布测试—数据复盘—策略迭代」的内容运营闭环",

"content.xhs.kick":"PART 01 · 小红书账号搭建","content.xhs.h":"日常分享类账号（小红书）",
"content.xhs.before.k":"接手前现状：","content.xhs.before.v":"内容发布随机，多为产品种草，风格不统一，像日常美图搬运号\n用户互动率低，粉丝画像模糊，无法与用户形成关联\n内容发布无识别度，无法在众多分享账号中脱颖而出",
"content.xhs.after.k":"接手后现状：","content.xhs.after.v":"目标用户群体明确，内容方向与用户需求的匹配度提升\n持续输出有深度、有观点、能够引发用户共鸣的内容，账号积累了稳定的用户基础与较高的互动表现，为后续商业合作、品牌推广及账号商业化变现打下了基础",

"content.notes.kick":"PART 01 · 小红书账号搭建","content.notes.h":"优秀笔记展示",
"content.notes.a.k":"确定选题方向","content.notes.a.v":"围绕「游戏剧情」原创系列、生活化图文系列等，作为主要选题进行笔记更新",
"content.notes.b.k":"规范笔记封面","content.notes.b.v":"统一采用 \"精彩剧集截图＋大漫画\" 的组合形式，主角形象固定，背景场景根据主题切换",
"content.notes.h2":"数据展示",

"ai.kick":"COMING SOON","ai.h":"AI 创作实验","ai.body":"内容整理中，敬请期待。",
"visual.kick":"COMING SOON","visual.h":"视觉手记","visual.body":"内容整理中，敬请期待。",

"about.kick":"PART 04 · PERSONAL FILE",
"about.name":"隋轶轩","about.focus":"小红书 / 抖音 内容运营","about.tel":"13943880281","about.email":"2086958238@qq.com",
"about.summary":"深耕小红书/抖音内容运营，拥有较高的内容敏感度和用户洞察，想法多，热衷了解潮流趋势，擅长从 0 到 1 搭建账号内容体系，曾主导完成小红书 / 抖音的账号分析与内容运营，使小红书/抖音账号在 6 个月内平均互动率提升 80%，粉丝从 3W 增长至 12W，具备从内容增长到用户沉淀转化的完整运营经验",
"about.skill.kick":"PART 04 · SKILLS","about.skill.h":"职业技能",
"about.skill.body":"精通小红书/抖音内容策划，数据分析，投流策略，熟悉私域转化，擅长短视频脚本，场景化图文，能独立完成从选题到发布的闭环\n数据驱动决策，用户需求洞察，跨部门协同"
});
Object.assign(DEF.i,{
"content.dy.profile":IMG+"douyin-profile.jpg",
"about.photo":IMG+"portrait.jpg"});
Object.assign(DEF.g,{
"content.dy.data":g([["douyin-data-1.jpg"],["douyin-data-2.jpg"],["douyin-data-3.jpg"]]),
"content.xhs.profiles":g([["xhs-profile-1.jpg"],["xhs-profile-2.jpg"]]),
"content.notes.covers":g([["note-2.jpg"],["note-1.jpg"],["note-3.jpg"]]),
"content.notes.data":g([["xhs-data-1.jpg"],["xhs-data-2.jpg"],["xhs-data-3.jpg"]]),
"ai.works":[],"visual.works":[],
"about.tools":g([["tool-chatgpt.png","ChatGPT"],["tool-capcut.png","剪映"],["tool-canva.png","Canva"],["tool-jimeng.png","即梦 AI"]])});

/* ---------- 状态与保存（本浏览器 IndexedDB） ---------- */
const LS="kiki-portfolio-v1";let S={f:{},i:{},g:{}},idb=null,saveTimer=0;
const PLAIN=(()=>{try{const d=document.createElement("div");d.contentEditable="plaintext-only";return d.contentEditable==="plaintext-only"}catch(e){return false}})();
const idbOpen=()=>new Promise(r=>{try{const q=indexedDB.open("kiki-portfolio",1);q.onupgradeneeded=()=>q.result.createObjectStore("kv");q.onsuccess=()=>r(q.result);q.onerror=()=>r(null);q.onblocked=()=>r(null)}catch(e){r(null)}});
const idbGet=k=>new Promise(r=>{if(!idb)return r(null);try{const q=idb.transaction("kv").objectStore("kv").get(k);q.onsuccess=()=>r(q.result==null?null:q.result);q.onerror=()=>r(null)}catch(e){r(null)}});
const idbSet=(k,v)=>new Promise(r=>{if(!idb)return r(false);try{const t=idb.transaction("kv","readwrite");t.objectStore("kv").put(v,k);t.oncomplete=()=>r(true);t.onerror=()=>r(false);t.onabort=()=>r(false)}catch(e){r(false)}});
const isObj=o=>o&&typeof o==="object"&&!Array.isArray(o);
const okSrc=s=>typeof s==="string"&&(s===""||/^data:image\/(png|jpe?g|webp|gif);base64,/.test(s)||/^\/assets\/img\/[\w.-]+$/.test(s));
function clean(v){const o={f:{},i:{},g:{}};if(!isObj(v))return o;
 if(isObj(v.f))for(const k in v.f)if(typeof v.f[k]==="string")o.f[k]=v.f[k];
 if(isObj(v.i))for(const k in v.i)if(okSrc(v.i[k]))o.i[k]=v.i[k];
 if(isObj(v.g))for(const k in v.g)if(Array.isArray(v.g[k]))o.g[k]=v.g[k].filter(x=>isObj(x)&&okSrc(x.src)&&x.src).map(x=>({id:String(x.id||uid()),src:x.src,cap:typeof x.cap==="string"?x.cap:""}));
 return o}
const ready=(async()=>{idb=await idbOpen();let v=await idbGet("state");if(!v){try{v=JSON.parse(localStorage.getItem(LS)||"null")}catch(e){v=null}}S=clean(v)})();
function status(t,keep){const e=document.querySelector("#dock-status");if(!e)return;e.textContent=t;clearTimeout(status.t);if(!keep)status.t=setTimeout(()=>{e.textContent=""},2200)}
function persist(){status("保存中…",1);clearTimeout(saveTimer);saveTimer=setTimeout(async()=>{let ok=await idbSet("state",S);if(!ok){try{localStorage.setItem(LS,JSON.stringify(S));ok=true}catch(e){ok=false}}status(ok?"已自动保存":"保存失败：图片可能过大")},350)}
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,6);

const gf=k=>S.f[k]!==undefined?S.f[k]:(DEF.f[k]??"");
const gi=k=>S.i[k]!==undefined?S.i[k]:(DEF.i[k]??"");
const gg=k=>S.g[k]!==undefined?S.g[k]:(DEF.g[k]||[]);
const ensureG=k=>{if(S.g[k]===undefined)S.g[k]=JSON.parse(JSON.stringify(DEF.g[k]||[]));return S.g[k]};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

/* ---------- 模板小工具 ---------- */
const T=(k,tag="span",cls="")=>`<${tag} class="ed ${cls}" data-f="${k}" spellcheck="false">${esc(gf(k))}</${tag}>`;
const IM=(k,cls="",alt="")=>{const s=gi(k);return `<figure class="slot ${cls}${s?"":" is-empty"}" data-img="${k}">${s?`<img src="${s}" alt="${esc(alt)}" data-light>`:""}<div class="slot-ctl"><button data-replace>${s?"更换图片":"＋ 添加图片"}</button>${s?'<button data-clear>移除</button>':""}</div></figure>`};
const GL=(k,cls="")=>{const a=gg(k);return `<div class="gal ${cls}${a.length?"":" is-empty"}" data-gal="${k}">${a.map(it=>`<figure class="gi" data-id="${it.id}"><img src="${it.src}" alt="${esc(it.cap||"")}" data-light><figcaption class="ed" data-gcap spellcheck="false">${esc(it.cap||"")}</figcaption><button class="gi-del" data-gdel aria-label="删除这张图片">×</button></figure>`).join("")}<button class="gal-add" data-gadd>＋<span>添加图片</span></button></div>`};
const stat=p=>`<div class="stat"><h4>${T(p+".k")}</h4><p>${T(p+".v")}</p></div>`;
const step=p=>`<li class="step"><span class="step-no">${T(p+".n")}</span><h4>${T(p+".t")}</h4><p>${T(p+".b")}</p></li>`;
const field=(k,en,cn)=>`<div class="fld"><dt>${en}<small>${cn}</small></dt><dd>${T(k)}</dd></div>`;

const VIEW={
content:{
dy:()=>`<div class="sec"><p class="kick">${T("content.dy.kick")}</p>
<div class="split"><div><h3 class="h3">${T("content.dy.name")}</h3><div class="stats">${stat("content.dy.s1")}${stat("content.dy.s2")}${stat("content.dy.s3")}${stat("content.dy.s4")}</div></div>
<div>${IM("content.dy.profile","shot tall","抖音账号主页截图")}</div></div>
<div class="sub"><h4 class="h4">${T("content.dy.datacap")}</h4>${GL("content.dy.data","g3")}</div></div>`,
idea:()=>`<div class="sec"><p class="kick">${T("content.idea.kick")}</p><h3 class="h3">${T("content.idea.h")}</h3><p class="lead">${T("content.idea.body")}</p>
<ol class="steps">${[1,2,3,4,5,6].map(n=>step("content.idea.s"+n)).join("")}</ol></div>`,
xhs:()=>`<div class="sec"><p class="kick">${T("content.xhs.kick")}</p>
<div class="split"><div><h3 class="h3">${T("content.xhs.h")}</h3>
<div class="ba"><h4>${T("content.xhs.before.k")}</h4><p>${T("content.xhs.before.v")}</p></div>
<div class="ba after"><h4>${T("content.xhs.after.k")}</h4><p>${T("content.xhs.after.v")}</p></div></div>
<div>${GL("content.xhs.profiles","g2")}</div></div></div>`,
notes:()=>`<div class="sec"><p class="kick">${T("content.notes.kick")}</p><h3 class="h3">${T("content.notes.h")}</h3>
${GL("content.notes.covers","notes")}
<div class="two"><div><h4 class="h4">${T("content.notes.a.k")}</h4><p>${T("content.notes.a.v")}</p></div><div><h4 class="h4">${T("content.notes.b.k")}</h4><p>${T("content.notes.b.v")}</p></div></div>
<div class="sub"><h4 class="h4">${T("content.notes.h2")}</h4>${GL("content.notes.data","g3")}</div></div>`},
ai:{main:()=>`<div class="sec"><p class="kick">${T("ai.kick")}</p><h3 class="h3">${T("ai.h")}</h3><p class="lead">${T("ai.body")}</p>${GL("ai.works","works")}</div>`},
visual:{main:()=>`<div class="sec"><p class="kick">${T("visual.kick")}</p><h3 class="h3">${T("visual.h")}</h3><p class="lead">${T("visual.body")}</p>${GL("visual.works","works")}</div>`},
about:{
id:()=>`<div class="sec"><div class="idgrid"><div>${IM("about.photo","shot portrait","个人照片")}</div>
<div><dl class="fields">${field("about.name","NAME","姓名")}${field("about.focus","FOCUS","方向")}${field("about.tel","WECHAT / TEL","微信 / 电话")}${field("about.email","E-MAIL","邮箱")}</dl>
<p class="lead">${T("about.summary")}</p></div></div></div>`,
skill:()=>`<div class="sec"><p class="kick">${T("about.skill.kick")}</p><h3 class="h3">${T("about.skill.h")}</h3><p class="lead">${T("about.skill.body")}</p>${GL("about.tools","tools")}</div>`}};

/* ---------- 页面骨架（首页部分保持原样） ---------- */
const STAMP=`<svg class="stamp" viewBox="0 0 200 200" aria-hidden="true"><defs><path id="sp" d="M100 100m-74 0a74 74 0 1 1 148 0a74 74 0 1 1-148 0"/></defs><circle cx="100" cy="100" r="92" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="100" cy="100" r="62" fill="none" stroke="currentColor" stroke-width="1"/><text font-size="15" font-weight="700" letter-spacing="5" fill="currentColor"><textPath href="#sp">CERTIFIED · PERSONAL ARCHIVE · 2025 · CERTIFIED ·</textPath></text><text x="100" y="108" text-anchor="middle" font-size="24" font-weight="800" fill="currentColor">2025</text></svg>`;
const CLIP=`<svg class="clip" viewBox="0 0 44 92" aria-hidden="true"><rect x="9" y="0" width="26" height="9" rx="2" fill="#3a3d46"/><rect x="12" y="5" width="20" height="30" rx="10" fill="none" stroke="#2f323a" stroke-width="3.4"/><path d="M22 35v10" stroke="#2f323a" stroke-width="3.4" stroke-linecap="round"/><path d="M13 45h18a4 4 0 0 1 4 4v14a11 11 0 0 1-11 11h-4a11 11 0 0 1-11-11V49a4 4 0 0 1 4-4z" fill="none" stroke="#2f323a" stroke-width="3.4"/><path d="M24 70a5 5 0 0 1 5 5v3" fill="none" stroke="#2f323a" stroke-width="3.4" stroke-linecap="round"/></svg>`;
function barcode(){let x=7,s="",r=17;for(let n=0;n<58;n++){r=(r*1103515245+12345)&2147483647;const w=1+(r>>8)%4;if(n%2===0)s+=`<rect x="${x}" y="0" width="${w}" height="40"/>`;x+=w+(n%2?1:0)+ (r%2?1:0);if(x>300)break}return `<svg class="barcode" viewBox="0 0 ${x+4} 40" preserveAspectRatio="none" aria-hidden="true" fill="#17181e">${s}</svg>`}

document.querySelector("#app").insertAdjacentHTML("beforeend",`<dialog id="focus-dialog" aria-labelledby="focus-title">
<div class="edit-dock" id="edit-dock"><span class="dock-status" id="dock-status" aria-live="polite"></span>
<div class="dock-tools"><button class="dock-btn" id="dock-export" title="把当前修改导出为文件">导出</button><button class="dock-btn" id="dock-import" title="导入之前导出的文件">导入</button><button class="dock-btn" id="dock-reset" title="恢复当前部分的默认内容">恢复默认</button></div>
<button class="dock-btn" id="dock-edit" aria-pressed="false" aria-label="编辑资料与图片"><span class="dock-ic">✎</span><span class="dock-tx">编辑</span></button></div>
<article class="focus-object" tabindex="-1"><div class="swing">
<div class="lanyard" aria-hidden="true"><div class="strap"></div>${CLIP}</div>
<div class="card"><i class="card-slot"></i>
<div class="card-main">${STAMP}
<div class="card-head"><span class="card-no" id="card-no"></span><div class="head-r"><div class="chips" id="entry-chips"></div><button id="close-focus" aria-label="退出聚焦，返回日志">×</button></div></div>
<div class="card-scroll" id="focus-scroll"><div class="card-title"><div class="title-row"><h2 class="focus-title" id="focus-title"></h2><span class="cn-wrap" id="focus-cn"></span></div><p class="meta" id="focus-meta"></p><div class="card-rule"></div></div>
<nav class="tabs" id="focus-tabs" aria-label="内容分节"></nav>
<div class="edit-banner">编辑模式 · 点击文字直接修改 · 点击图片可更换 · 「＋ 添加图片」新增 · 自动保存在本浏览器</div>
<div id="focus-content"></div></div></div>
<div class="card-foot">${barcode()}<button class="card-tag" data-contact><b>LET’S TALK</b><span>聊聊新的可能 ↗</span></button></div>
<div class="card-bar"><span>IN MY CREATIVE ERA</span><span>PERSONAL DESIGN PORTFOLIO · 2025—2026</span></div></div></div></article>
<input type="file" id="pick" accept="image/*" hidden><input type="file" id="pick-json" accept="application/json,.json" hidden></dialog>
<dialog id="lightbox" aria-label="查看大图"><button class="lb-close" aria-label="关闭大图">×</button><img alt=""></dialog>
<dialog id="contact-dialog" aria-labelledby="contact-title"><button class="contact-close" aria-label="关闭联系窗口">×</button><span class="eyebrow">LET’S MAKE SOMETHING</span><h2 id="contact-title">一起，让想法发生。</h2><p>欢迎交流内容运营与创作合作。</p><div class="contact-info" id="contact-info"></div><button class="contact-confirm">好的，回到日志 ↗</button></dialog>`);

const xt=document.querySelector("#focus-dialog"),$t=xt.querySelector(".focus-object"),te=document.querySelector("#contact-dialog"),lb=document.querySelector("#lightbox");
let Xt=null,Ei=null,de=false,Tab=null,EDIT=false,target=null;
const $=s=>xt.querySelector(s);
const Cs={content:-7,ai:4,visual:5,about:-5};

/* ---------- 渲染 ---------- */
function setCE(e,on){e.setAttribute("contenteditable",on?(PLAIN?"plaintext-only":"true"):"false")}
function applyEdit(){xt.querySelectorAll(".ed").forEach(e=>setCE(e,EDIT))}
function renderHead(){const t=hi.find(r=>r.id===Xt);$("#card-no").textContent=`IDENTIFICATION CARD · NO. ${t.number}`;
$("#entry-chips").innerHTML=hi.map(r=>`<button class="chip" data-switch="${r.id}" aria-current="${r.id===Xt}" aria-label="${r.number} ${r.title}" title="${r.number} ${r.title}">${r.number}</button>`).join("");
$("#focus-title").innerHTML=T(Xt+".title","span");$("#focus-cn").innerHTML=T(Xt+".cn","span","cn-tag");$("#focus-meta").innerHTML=T(Xt+".meta","span");
xt.querySelector(".card").dataset.theme=Xt}
function renderTabs(){const a=TABS[Xt],n=$("#focus-tabs");n.hidden=a.length<2;n.innerHTML=a.map(([k,l])=>`<button data-tab="${k}" aria-current="${k===Tab?"page":"false"}">${l}</button>`).join("")}
function renderBody(){$("#focus-content").innerHTML=VIEW[Xt][Tab]();applyEdit()}
function rerender(){const s=$("#focus-scroll"),y=s.scrollTop;renderBody();s.scrollTop=y}
function setTab(k){Tab=k;renderTabs();renderBody();const sc=$("#focus-scroll"),ti=$(".card-title"),lim=ti.offsetTop+ti.offsetHeight;sc.scrollTop=Math.min(sc.scrollTop,lim);St.matches||ht.fromTo("#focus-content",{opacity:.25,y:7},{opacity:1,y:0,duration:.23,overwrite:true})}

/* Reader presentation only; Three.js owns object focus and positioning. */
function tn(id){const entry=hi.find(r=>r.id===id);if(!entry)return;if(EDIT)setEdit(false);Xt=id;Tab=TABS[id][0][0];renderHead();renderTabs();renderBody();
 if(!xt.open)xt.showModal();$("#focus-scroll").scrollTop=0;document.body.classList.add("reader-open");
 ready.then(()=>{if(Xt===id){renderHead();renderBody()}});$("#close-focus").focus({preventScroll:true});
 if(!St.matches)we=ht.fromTo($t,{opacity:0,y:14},{opacity:1,y:0,duration:.28,ease:"power2.out",overwrite:true});}
function en(notify=true){if(!xt.open)return;if(EDIT)setEdit(false);we?.kill();xt.close();Xt=null;document.body.classList.remove("reader-open");if(notify)onClose?.();}
function Di(){en();}
/* ---------- 编辑模式 ---------- */
function setEdit(on){EDIT=on;xt.classList.toggle("editing",on);applyEdit();const b=$("#dock-edit");b.setAttribute("aria-pressed",on);b.classList.toggle("on",on);b.querySelector(".dock-ic").textContent=on?"✓":"✎";b.querySelector(".dock-tx").textContent=on?"完成":"编辑";if(!on)status("")}
function readImage(file){return new Promise((res,rej)=>{const fr=new FileReader();fr.onerror=()=>rej();fr.onload=()=>{const im=new Image();im.onerror=()=>rej();im.onload=()=>{let w=im.naturalWidth||im.width,h=im.naturalHeight||im.height;const r=Math.min(1,1600/Math.max(w,h));w=Math.max(1,Math.round(w*r));h=Math.max(1,Math.round(h*r));const c=document.createElement("canvas");c.width=w;c.height=h;const x=c.getContext("2d"),alpha=file.type==="image/png"&&w*h<=640*640;if(!alpha){x.fillStyle="#fff";x.fillRect(0,0,w,h)}x.drawImage(im,0,0,w,h);res(c.toDataURL(alpha?"image/png":"image/jpeg",.86))};im.src=fr.result};fr.readAsDataURL(file)})}
async function onPick(files){const t=target;target=null;if(!t||!files.length)return;status("处理图片…",1);
 try{if(t.type==="slot"){S.i[t.key]=await readImage(files[0])}else{const a=ensureG(t.key);for(const f of files)a.push({id:uid(),src:await readImage(f),cap:""})}persist();rerender()}catch(e){status("图片读取失败")}}
function pickFor(t,multi){target=t;const p=$("#pick");p.multiple=!!multi;p.value="";p.click()}
function exportData(){const b=new Blob([JSON.stringify({v:1,state:S})],{type:"application/json"}),a=document.createElement("a");a.href=URL.createObjectURL(b);a.download="portfolio-edits.json";xt.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},600);status("已导出")}
function importData(file){const fr=new FileReader();fr.onload=()=>{try{const v=JSON.parse(fr.result);S=clean(v.state||v);persist();renderHead();rerender();status("已导入")}catch(e){status("导入失败：文件格式不对")}};fr.readAsText(file)}
function resetEntry(){const t=hi.find(r=>r.id===Xt);if(!confirm(`将恢复「${t.title}」的默认内容，你对这一部分的修改会被清除。继续？`))return;const p=Xt+".";for(const m of ["f","i","g"])for(const k of Object.keys(S[m]))if(k.startsWith(p))delete S[m][k];persist();renderHead();rerender()}

/* ---------- 联系窗口 ---------- */
function openContact(){const e=gf("about.email"),t=gf("about.tel");document.querySelector("#contact-info").innerHTML=`Wechat/Tel：${esc(t)}<br>E-mail：<a href="mailto:${esc(e)}">${esc(e)}</a>`;te.showModal()}

/* ---------- 事件 ---------- */
document.querySelectorAll(".paper-link").forEach(o=>o.onclick=()=>{location.hash===`#project/${o.dataset.open}`?tn(o.dataset.open):location.hash=`project/${o.dataset.open}`});
document.querySelector("#close-focus").onclick=Di;
xt.addEventListener("click",e=>{const n=e.target;if(n===xt){Di();return}
 const c=n.closest("[data-tab]");if(c){setTab(c.dataset.tab);return}
 const s=n.closest("[data-switch]");if(s){tn(s.dataset.switch);onSwitch?.(s.dataset.switch);return}
 if(n.closest("[data-contact]")){openContact();return}
 const rp=n.closest("[data-replace]");if(rp){pickFor({type:"slot",key:rp.closest("[data-img]").dataset.img},false);return}
 const cl=n.closest("[data-clear]");if(cl){S.i[cl.closest("[data-img]").dataset.img]="";persist();rerender();return}
 const ga=n.closest("[data-gadd]");if(ga){pickFor({type:"gal",key:ga.closest("[data-gal]").dataset.gal},true);return}
 const gd=n.closest("[data-gdel]");if(gd){const k=gd.closest("[data-gal]").dataset.gal,id=gd.closest(".gi").dataset.id,a=ensureG(k);S.g[k]=a.filter(x=>x.id!==id);persist();rerender();return}
 const li=n.closest("[data-light]");if(li&&!EDIT){lb.querySelector("img").src=li.src;lb.showModal();return}
 if(n.closest("#dock-edit")){setEdit(!EDIT);return}
 if(n.closest("#dock-export")){exportData();return}
 if(n.closest("#dock-import")){$("#pick-json").value="";$("#pick-json").click();return}
 if(n.closest("#dock-reset")){resetEntry()}});
xt.addEventListener("input",e=>{const el=e.target.closest&&e.target.closest(".ed");if(!el)return;const v=el.innerText.replace(/\u00a0/g," ").replace(/\n+$/,"");
 if(el.dataset.f){S.f[el.dataset.f]=v;persist()}
 else if(el.hasAttribute("data-gcap")){const k=el.closest("[data-gal]").dataset.gal,id=el.closest(".gi").dataset.id,it=ensureG(k).find(x=>x.id===id);if(it){it.cap=v;persist()}}});
xt.addEventListener("paste",e=>{const el=e.target.closest&&e.target.closest(".ed");if(!el)return;e.preventDefault();document.execCommand("insertText",false,(e.clipboardData||window.clipboardData).getData("text/plain"))});
xt.addEventListener("keydown",e=>{if(e.key==="Enter"&&e.target.closest&&e.target.closest("[data-gcap]")){e.preventDefault();e.target.blur()}});
$("#pick").addEventListener("change",e=>onPick(Array.from(e.target.files||[])));
$("#pick-json").addEventListener("change",e=>{const f=e.target.files&&e.target.files[0];f&&importData(f)});
$("#focus-scroll").addEventListener("scroll",()=>{const sc=$("#focus-scroll"),ti=$(".card-title");$("#focus-tabs").classList.toggle("stuck",sc.scrollTop>ti.offsetTop+ti.offsetHeight-2)},{passive:true});
xt.addEventListener("cancel",e=>{e.preventDefault();if(EDIT){setEdit(false);return}Di()});
lb.addEventListener("click",()=>lb.close());
te.querySelectorAll(".contact-close,.contact-confirm").forEach(o=>o.onclick=()=>te.close());te.addEventListener("click",o=>{o.target===te&&te.close()});


return {open:tn,close:en,get isOpen(){return xt.open;},get active(){return Xt;},ready};
}
