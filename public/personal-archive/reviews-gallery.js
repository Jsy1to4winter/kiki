/* Only owns the evaluation-page album; page switching and music remain independent. */
(()=>{'use strict';
const modal=document.getElementById('reviews-album'),opener=document.getElementById('reviews-open');if(!modal||!opener)return;
const grid=document.getElementById('reviews-grid'),gridView=document.getElementById('reviews-grid-view'),imageView=document.getElementById('reviews-image-view'),image=document.getElementById('reviews-image'),caption=document.getElementById('reviews-caption'),counter=document.getElementById('reviews-page');
let items=[],publishedItems=[],selected=0,lastFocus=null,returnTile=null;
const pad=n=>String(n).padStart(2,'0');
function safeSource(src){try{const url=new URL(src,document.baseURI);return ['https:','http:','data:','file:'].includes(url.protocol)?url.href:null}catch{return null}}
function render(){const slots=[...document.querySelectorAll('.reviews-photo > img')].reverse();slots.forEach((img,i)=>{img.parentElement.hidden=false;img.hidden=!items[i];if(items[i])img.src=items[i].src;});grid.replaceChildren();document.querySelectorAll('[data-reviews-count]').forEach(el=>el.textContent=pad(items.length));if(!items.length){const p=document.createElement('p');p.className='reviews-grid-empty';p.textContent='相册暂无图片';grid.append(p);return}items.forEach((item,i)=>{const button=document.createElement('button');button.type='button';button.className='reviews-grid-item';button.setAttribute('aria-label',`放大第${i+1}张：${item.alt||'相册图片'}`);const holder=document.createElement('span');holder.className='reviews-grid-photo';const img=document.createElement('img');img.src=item.src;img.alt=item.alt||'相册图片';img.loading='lazy';holder.append(img);const label=document.createElement('span');label.className='reviews-grid-label';label.textContent=item.caption||`${pad(i+1)} / 回声`;button.append(holder,label);button.addEventListener('click',()=>{returnTile=button;showImage(i)});grid.append(button)})}
function showGrid(){gridView.hidden=false;imageView.hidden=true;if(modal.open)(returnTile||document.getElementById('reviews-close')).focus({preventScroll:true})}
function showImage(i){if(!items.length)return;selected=(i+items.length)%items.length;const item=items[selected];image.src=item.src;image.alt=item.alt||'评价相册图片';caption.textContent=item.caption||'';counter.textContent=`${pad(selected+1)} / ${pad(items.length)}`;gridView.hidden=true;imageView.hidden=false;document.getElementById('reviews-back').focus({preventScroll:true});modal.scrollTop=0}
opener.addEventListener('click',()=>{lastFocus=document.activeElement;returnTile=null;showGrid();modal.showModal();document.getElementById('reviews-close').focus({preventScroll:true})});
document.getElementById('reviews-close').addEventListener('click',()=>modal.close());modal.addEventListener('close',()=>lastFocus?.focus({preventScroll:true}));document.getElementById('reviews-back').addEventListener('click',showGrid);document.getElementById('reviews-prev').addEventListener('click',()=>showImage(selected-1));document.getElementById('reviews-next').addEventListener('click',()=>showImage(selected+1));
modal.addEventListener('click',e=>{if(e.target!==modal)return;const r=modal.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)modal.close()});
document.addEventListener('keydown',e=>{if(!modal.open)return;if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.stopImmediatePropagation();e.preventDefault();if(!imageView.hidden)showImage(selected+(e.key==='ArrowRight'?1:-1))}},true);
let sx=0,sy=0;const viewer=modal.querySelector('.reviews-viewer');viewer.addEventListener('touchstart',e=>{sx=e.changedTouches[0].clientX;sy=e.changedTouches[0].clientY},{passive:true});viewer.addEventListener('touchend',e=>{const dx=e.changedTouches[0].clientX-sx,dy=e.changedTouches[0].clientY-sy;if(Math.abs(dx)>55&&Math.abs(dx)>Math.abs(dy)*1.5)showImage(selected+(dx<0?1:-1))},{passive:true});
const status=document.createElement('p');status.className='collection-status';status.setAttribute('role','status');status.hidden=true;gridView.append(status);
const db=new Promise((resolve,reject)=>{try{const request=indexedDB.open('personal-archive-reviews',1);request.onupgradeneeded=()=>request.result.createObjectStore('images',{autoIncrement:true});request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error)}catch(e){reject(e)}});db.catch(()=>{});
async function locals(){await window.archiveCloud.ready;if(window.archiveCloud.enabled)return (await window.archiveCloud.listImages('reviews')).map(item=>({remote:true,...item}));const database=await db;return new Promise((resolve,reject)=>{const tx=database.transaction('images'),store=tx.objectStore('images'),records=store.getAll(),keys=store.getAllKeys();tx.oncomplete=()=>resolve(records.result.map((record,i)=>({...record,id:keys.result[i]})));tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error)});}
function appendLocal(records){records.forEach(record=>items.push({...record,removable:true,src:record.remote?record.src:URL.createObjectURL(record.blob),alt:'相册图片',caption:record.caption||record.name}));render();}
async function reloadItems(){
 const records=await locals();items.forEach(item=>{if(item.blob&&item.src?.startsWith('blob:'))URL.revokeObjectURL(item.src);});items=[...publishedItems];appendLocal(records);
}
window.archiveReviewManager={
 async list(){await ready;await reloadItems();return items.map(item=>({...item,removable:item.id!==undefined&&item.id!==null}));},
 async remove(id){
  await ready;
  if(window.archiveCloud.enabled)await window.archiveCloud.deleteImage('reviews',id);
  else{const database=await db;await new Promise((resolve,reject)=>{const tx=database.transaction('images','readwrite');tx.objectStore('images').delete(id);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);});}
  await reloadItems();returnTile=null;if(modal.open)showGrid();
 },
 async count(){await ready;return items.length;},
 async upload(files){
  await ready;
  if(window.archiveCloud.enabled){await window.archiveCloud.uploadImages('reviews',files);await reloadItems();return;}
  const records=files.map(blob=>({blob,name:blob.name})),database=await db;
  await new Promise((resolve,reject)=>{const tx=database.transaction('images','readwrite');records.forEach(record=>{const request=tx.objectStore('images').add(record);request.onsuccess=()=>record.id=request.result;});tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error)});appendLocal(records);
 }
};
render();const ready=fetch('reviews-gallery.json?v=archive-content-02').then(r=>{if(!r.ok)throw Error('Config unavailable');return r.json()}).then(config=>{if(!Array.isArray(config.items))return;items=config.items.filter(x=>x&&typeof x.src==='string'&&safeSource(x.src)).map(x=>({src:safeSource(x.src),alt:typeof x.alt==='string'?x.alt:'相册图片',caption:typeof x.caption==='string'?x.caption:''}));publishedItems=[...items];render()}).catch(()=>{}).then(async()=>{try{appendLocal(await locals());}catch{status.hidden=false;status.textContent='相册暂时未能载入，请稍后刷新。';}});
})();
