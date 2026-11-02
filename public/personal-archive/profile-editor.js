(() => {
  'use strict';
  const $ = selector => document.querySelector(selector);
  const modal = $('#profile-editor'), form = $('#profile-form'), trigger = $('#profile-edit');
  if (!modal || !form || !trigger) return;
  const status = $('#profile-editor-status');
  const keys = ['name','age','skills','tags','alterEgo'];
  const selectors = ['.fact-name','.fact-age','.fact-skills','.fact-tags','.fact-avatar'];
  const clone = value => JSON.parse(JSON.stringify(value));
  const BASE = {
    version:1, facts:{name:'',age:'',skills:'',tags:'',alterEgo:''},
    intro:'这里存放我的文字、偏爱与被记住的瞬间。\n你正在看到的，是尚未完成的一个切面。',
    anchor:'雾山影｜UTC+8', avatar:'assets/profile-glasses-avatar.png',
    links:[{title:'片刻记录',description:'留下一些不想遗忘的瞬间。',url:''},{title:'偏爱收集',description:'存放作品、灵感与心头所好。',url:''},{title:'未完之页',description:'给下一段故事留一个入口。',url:''}]
  };
  let published = clone(BASE), saved = clone(BASE), formBase = clone(BASE);
  function message(text, error=false) { status.textContent=text;status.dataset.error=String(error); }
  function text(value, limit, fallback='') {
    if (typeof value !== 'string') return fallback;
    if (value.length > limit) throw new Error(`内容过长，请缩短至 ${limit} 字以内。`);
    return value.trim();
  }
  function linkURL(value) {
    const input=text(value,2048); if(!input)return '';
    let url; try {url=new URL(input,location.href);} catch {throw new Error('链接地址无法识别，请检查后重试。');}
    if(!['http:','https:'].includes(url.protocol))throw new Error('链接仅支持 http 或 https 地址。');
    return url.href;
  }
  function avatarURL(value) {
    const input=text(value,12*1024*1024,BASE.avatar);
    if(/^data:image\/(png|jpeg|webp|gif);base64,/i.test(input))return input;
    let url;try{url=new URL(input,location.href);}catch{throw new Error('头像地址无法识别。');}
    if(!['http:','https:'].includes(url.protocol))throw new Error('头像地址格式不支持。');
    return input;
  }
  function normalize(value) {
    if(!value || typeof value!=='object' || Array.isArray(value))throw new Error('请选择导出的 site-profile.json 配置文件。');
    const config=clone(BASE);
    keys.forEach(key=>config.facts[key]=text(value.facts?.[key],key==='age'?40:160));
    config.intro=text(value.intro,12000,BASE.intro);
    config.anchor=text(value.anchor,120,BASE.anchor).replace(/^锚点[:：]\s*/,'')||BASE.anchor;
    config.avatar=avatarURL(value.avatar||BASE.avatar);
    config.links=BASE.links.map((fallback,i)=>({title:text(value.links?.[i]?.title,80,fallback.title)||fallback.title,description:text(value.links?.[i]?.description,300,fallback.description),url:linkURL(value.links?.[i]?.url||'')}));
    return config;
  }
  function apply(config) {
    keys.forEach((key,i)=>{
      const target=$(selectors[i]+' dd'); if(!target)return;
      const marker=document.createElement('i');marker.setAttribute('aria-hidden','true');
      target.replaceChildren(marker,document.createTextNode(config.facts[key]||'待填写'));
    });
    const intro=$('.profile-details>.soft-card>p');
    if(intro)intro.textContent=config.intro;
    const note=$('.profile-details>.soft-card>small');if(note)note.hidden=config.intro!==BASE.intro;
    $('.anchor-tag>span:last-child').textContent='锚点：'+config.anchor;
    const portrait=$('.profile-figure img');portrait.src=config.avatar;
    portrait.alt=config.facts.name?config.facts.name+'的头像':'个人头像';
    window.archiveLinkCards?.set(config.links);
  }
  const database=new Promise((resolve,reject)=>{
    try {
      const request=indexedDB.open('personal-archive-profile-editor',1);
      request.onupgradeneeded=()=>request.result.createObjectStore('settings');
      request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);request.onblocked=()=>reject(new Error('Storage blocked'));
    } catch(error) {reject(error);}
  });
  database.catch(()=>{});
  async function readDraft(){const db=await database;return new Promise((resolve,reject)=>{const req=db.transaction('settings','readonly').objectStore('settings').get('draft');req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});}
  async function writeDraft(config){const db=await database;return new Promise((resolve,reject)=>{const tx=db.transaction('settings','readwrite');tx.objectStore('settings').put(config,'draft');tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);});}
  async function removeDraft(){const db=await database;return new Promise((resolve,reject)=>{const tx=db.transaction('settings','readwrite');tx.objectStore('settings').delete('draft');tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);});}
  const linkFields=$('#editor-link-fields');
  BASE.links.forEach((entry,i)=>{
    const group=document.createElement('div');group.className='editor-link-group';
    const title=document.createElement('h3');title.textContent=`0${i+1} / 链接卡片`;group.append(title);
    for(const [labelText,name,limit] of [['卡片名称',`linkTitle${i}`,80],['跳转链接',`linkURL${i}`,2048]]){
      const label=document.createElement('label');label.append(document.createTextNode(labelText));
      const input=document.createElement('input');input.name=name;input.maxLength=limit;input.autocomplete='off';
      if(name.startsWith('linkURL')){input.inputMode='url';input.placeholder='https://（留空则不启用跳转）';}
      label.append(input);group.append(label);
    }
    linkFields.append(group);
  });
  function field(name){return form.elements.namedItem(name);}
  function fill(config){
    form.reset();formBase=clone(config);
    keys.forEach(key=>field(key).value=config.facts[key]);
    field('intro').value=config.intro;field('anchor').value=config.anchor;
    config.links.forEach((entry,i)=>{field(`linkTitle${i}`).value=entry.title;field(`linkURL${i}`).value=entry.url;});
    $('#profile-avatar-file').value='';
  }
  async function avatarFile(file) {
    if(!['image/png','image/jpeg','image/webp','image/gif'].includes(file.type))throw new Error('请选择 PNG、JPG、WebP 或 GIF 图片。');
    if(file.size>8*1024*1024)throw new Error('头像图片请控制在 8MB 以内。');
    const source=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(new Error('图片读取失败。'));reader.readAsDataURL(file);});
    await new Promise((resolve,reject)=>{const image=new Image();image.onload=resolve;image.onerror=()=>reject(new Error('图片无法打开，请换一张图片。'));image.src=source;});
    return source;
  }
  async function fromForm(){
    const value=clone(formBase);
    keys.forEach(key=>value.facts[key]=field(key).value);
    value.intro=field('intro').value;value.anchor=field('anchor').value;
    value.links=value.links.map((entry,i)=>({...entry,title:field(`linkTitle${i}`).value,url:field(`linkURL${i}`).value}));
    const file=$('#profile-avatar-file').files[0];if(file)value.avatar=await avatarFile(file);
    return normalize(value);
  }
  const ready=(async()=>{
    try {const response=await fetch('site-profile.json?v=profile-editor-01');if(response.ok)published=normalize(await response.json());}catch{}
    saved=clone(published);
    try {const draft=await readDraft();if(draft)saved=normalize(draft);}catch{}
    apply(saved);
  })();
  trigger.addEventListener('click',async()=>{await ready;fill(saved);message('');modal.showModal();field('name').focus({preventScroll:true});});
  $('#profile-editor-close').addEventListener('click',()=>modal.close());
  modal.addEventListener('close',()=>trigger.focus({preventScroll:true}));
  modal.addEventListener('click',event=>{if(event.target!==modal)return;const r=modal.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)modal.close();});
  form.addEventListener('submit',async event=>{
    event.preventDefault();const button=form.querySelector('[type="submit"]');button.disabled=true;message('正在保存…');
    try {
      const config=await fromForm();await writeDraft(config);saved=config;apply(saved);fill(saved);message('已保存到此浏览器。');modal.close();
    } catch(error){message(error.name==='Error'?error.message:'未能保存，请检查浏览器存储设置；也可以导出发布文件。',true);}
    finally{button.disabled=false;}
  });
  $('#profile-export').addEventListener('click',async()=>{
    try {const config=await fromForm();const blob=new Blob([JSON.stringify(config,null,2)+'\n'],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='site-profile.json';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);message('已导出发布文件。更新仓库中的 site-profile.json 后，所有访客才能看到这些修改。');}
    catch(error){message(error.message,true);}
  });
  $('#profile-import').addEventListener('click',()=>$('#profile-import-file').click());
  $('#profile-import-file').addEventListener('change',async event=>{
    const file=event.target.files[0];if(!file)return;
    try {if(file.size>14*1024*1024)throw new Error('配置文件过大。');const config=normalize(JSON.parse(await file.text()));fill(config);message('配置已读入，点击“保存并查看”后生效。');}
    catch(error){message(error instanceof SyntaxError?'JSON 格式有误，请选择导出的配置文件。':error.message,true);}
    event.target.value='';
  });
  $('#profile-reset').addEventListener('click',async()=>{
    try {await removeDraft();saved=clone(published);apply(saved);fill(saved);message('已恢复当前已发布版本。');}catch{message('浏览器未能清除草稿，请检查存储设置。',true);}
  });
})();
