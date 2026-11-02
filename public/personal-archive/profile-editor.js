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
  Object.assign(BASE,{"introTitle": "自我介绍", "noticeTitle": "须知", "notice": "不是雨季，却接连下了几天的雨。几天不在家，马桶里都生出了跟头虫\n\n好像是花粉或蛾子粉尘通过窗户带进来的。按下冲水按钮，蠕动的跟头虫随着旋涡消失了\n\n构成世界的物质出人意料地容易腐烂\n\n擦地，腾空冰箱，往浴室里喷了酸性洗涤剂之后，我躺在地板上。\n\n油地毡冰冷的气息直抵脸颊。外面不断传来噪声。那是汽车画着犹如星星轨迹般的长尾巴行驶在公路上的声音。\n\n感觉疲劳缓解了，身体里的血液也恢复了正常的速度。我像死了似的趴了会儿，竟然在地板上睡着了。\n\n偶尔传来救护车的警笛声和摩托车的噪声。陨石没能进入睡梦深处\n\n只在梦境之外撕破凌乱的星云，一闪而过。我蜷缩起身体。我", "reviewText": "把被记住的话，收进这里。", "navLabels": ["自我", "随笔", "私藏", "评价", "痕迹"]});
  let published = clone(BASE), saved = clone(BASE), formBase = clone(BASE), pendingLegacyDraft=null, cloudReadError=null;
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
    ['introTitle','noticeTitle','notice','reviewText'].forEach(key=>config[key]=text(value[key],key==='notice'?30000:key==='reviewText'?1000:80,BASE[key]));
    config.navLabels=BASE.navLabels.map((label,i)=>text(value.navLabels?.[i],12,label)||label);
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
    $('.profile-details>.soft-card>h3').textContent=config.introTitle;
    $('#notice-title').textContent=config.noticeTitle;
    $('.notice-passages').replaceChildren(...config.notice.split(/\n\s*\n/).filter(Boolean).map(content=>{const li=document.createElement('li'),p=document.createElement('p');p.textContent=content;li.append(p);return li;}));
    $('.reviews-archive-heading>p').textContent=config.reviewText;
    document.querySelectorAll('#nav .nav-item').forEach((button,i)=>{button.querySelector('.nav-label').textContent=config.navLabels[i];button.setAttribute('aria-label',config.navLabels[i]);});
    document.querySelectorAll('.card-end [data-next]').forEach(button=>{const scene=button.closest('[data-scene]');const i=Number(scene.dataset.scene);if(i<4){const label=i===0?'开始了解 / ':'继续 / ';button.firstChild.textContent=label+config.navLabels[i+1]+' ';}});
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
  BASE.navLabels.forEach((value,i)=>{const label=document.createElement('label');label.textContent=`第 ${i+1} 项`;const input=document.createElement('input');input.name=`navLabel${i}`;input.maxLength=12;label.append(input);$('#editor-nav-fields').append(label);});
  function field(name){return form.elements.namedItem(name);}
  function fill(config){
    form.reset();formBase=clone(config);
    keys.forEach(key=>field(key).value=config.facts[key]);
    ['introTitle','noticeTitle','notice','reviewText'].forEach(key=>field(key).value=config[key]);config.navLabels.forEach((label,i)=>field(`navLabel${i}`).value=label);
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
    ['introTitle','noticeTitle','notice','reviewText'].forEach(key=>value[key]=field(key).value);value.navLabels=BASE.navLabels.map((_,i)=>field(`navLabel${i}`).value);
    value.intro=field('intro').value;value.anchor=field('anchor').value;
    value.links=value.links.map((entry,i)=>({...entry,title:field(`linkTitle${i}`).value,url:field(`linkURL${i}`).value}));
    const file=$('#profile-avatar-file').files[0];if(file)value.avatar=await avatarFile(file);
    return normalize(value);
  }
  const ready=(async()=>{
    try {const response=await fetch('site-profile.json?v=archive-content-02');if(response.ok)published=normalize(await response.json());}catch{}
    await window.archiveCloud.ready;
    if(window.archiveCloud.enabled){
      try{const remote=await window.archiveCloud.getProfile();if(remote)published=normalize(remote);else{try{const draft=await readDraft();if(draft)pendingLegacyDraft=normalize(draft);}catch{}}}catch(error){cloudReadError=error.message;}
      saved=clone(published);apply(saved);
      $('.editor-storage-note').textContent=cloudReadError?'云端内容暂时未能载入，登录后请先重新载入资料。':'资料与图片保存到云端，所有访客打开或刷新后可见。';
      $('#profile-reset').textContent='重新载入云端资料';$('#profile-export').textContent='导出资料备份';return;
    }
    saved=clone(published);
    try {const draft=await readDraft();if(draft)saved=normalize(draft);}catch{}
    apply(saved);
  })();
  const accessModal=$('#profile-access'),accessForm=$('#profile-access-form'),password=$('#profile-access-password'),accessStatus=$('#profile-access-status');
  const cloud=window.archiveCloud;
  async function verifyAccess(){
    await cloud.ready;if(!cloud.enabled)return true;
    if(accessModal.open)return Promise.resolve(false);
    accessForm.reset();accessStatus.textContent='';accessModal.returnValue='';accessModal.showModal();$('#profile-access-email').focus({preventScroll:true});
    return new Promise(resolve=>accessModal.addEventListener('close',()=>{password.value='';resolve(accessModal.returnValue==='accepted');},{once:true}));
  }
  window.archiveAuthorize=async()=>{await cloud.ready;return !cloud.enabled||cloud.isAuthenticated()||verifyAccess();};
  $('#profile-access-close').addEventListener('click',()=>accessModal.close('cancelled'));
  accessForm.addEventListener('submit',async event=>{
    event.preventDefault();const button=accessForm.querySelector('[type=submit]');button.disabled=true;accessStatus.textContent='正在验证…';
    try{await cloud.signIn($('#profile-access-email').value,password.value);accessModal.close('accepted');}
    catch(error){accessStatus.textContent=error.message;password.value='';password.focus();}
    finally{button.disabled=false;}
  });
  trigger.addEventListener('click',async()=>{await ready;if(!await verifyAccess())return;fill(pendingLegacyDraft||saved);message(cloudReadError|| (pendingLegacyDraft?'已载入此浏览器之前保存的资料，点击“保存并查看”后同步到云端。':''),!!cloudReadError);modal.showModal();window.archiveAlbumEditor?.refresh();modal.scrollTop=0;field('introTitle').focus({preventScroll:true});});
  $('#profile-editor-close').addEventListener('click',()=>modal.close());
  modal.addEventListener('close',()=>trigger.focus({preventScroll:true}));
  modal.addEventListener('click',event=>{if(event.target!==modal)return;const r=modal.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)modal.close();});
  form.addEventListener('submit',async event=>{
    event.preventDefault();const button=form.querySelector('[type="submit"]');button.disabled=true;message('正在保存…');
    try {
      const config=await fromForm();if(cloud.enabled){if(cloudReadError)throw new Error('请先点击“重新载入云端资料”，读取成功后再保存。');await cloud.saveProfile(config);published=clone(config);pendingLegacyDraft=null;}else await writeDraft(config);saved=config;apply(saved);fill(saved);message(cloud.enabled?'已保存到云端。':'已保存到此浏览器。');modal.close();
    } catch(error){message(error.name==='Error'?error.message:'未能保存，请检查浏览器存储设置；也可以导出发布文件。',true);}
    finally{button.disabled=false;}
  });
  $('#profile-export').addEventListener('click',async()=>{
    try {const config=await fromForm();const blob=new Blob([JSON.stringify(config,null,2)+'\n'],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='site-profile.json';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);message(cloud.enabled?'已导出资料备份，云端修改请点击“保存并查看”。':'已导出发布文件。更新仓库中的 site-profile.json 后，所有访客才能看到这些修改。');}
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
    try {if(cloud.enabled){const remote=await cloud.getProfile();if(remote)published=normalize(remote);cloudReadError=null;pendingLegacyDraft=null;$('.editor-storage-note').textContent='资料与图片保存到云端，所有访客打开或刷新后可见。';}else await removeDraft();saved=clone(published);apply(saved);fill(saved);message('已恢复当前已发布版本。');}catch(error){message(cloud.enabled?error.message:'浏览器未能清除草稿，请检查存储设置。',true);}
  });
})();
