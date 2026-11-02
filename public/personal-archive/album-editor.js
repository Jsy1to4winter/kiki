/* Image management is available only inside the authenticated profile editor. */
(() => {
  'use strict';
  const editor=document.getElementById('profile-editor'),list=document.getElementById('editor-album-list');
  if(!editor||!list)return;
  const rows=[];
  const ready=(async()=>{
    const albums=await window.archiveCollectionManager.albums();
    const entries=albums.map((album,index)=>({title:album.title,section:'私藏',count:()=>window.archiveCollectionManager.count(index),upload:files=>window.archiveCollectionManager.upload(index,files)}));
    entries.push({title:'回声相册',section:'评价',count:()=>window.archiveReviewManager.count(),upload:files=>window.archiveReviewManager.upload(files)});
    entries.forEach((entry,index)=>{
      const row=document.createElement('div');row.className='editor-album';row.dataset.album=String(index);
      const title=document.createElement('h3');title.textContent=entry.section+' / '+entry.title;
      const status=document.createElement('p');status.className='editor-album-status';status.setAttribute('role','status');
      const button=document.createElement('button');button.type='button';button.className='editor-album-add';button.textContent='＋ 添加图片';button.setAttribute('aria-label','向'+entry.title+'添加图片');
      const input=document.createElement('input');input.type='file';input.accept='image/png,image/jpeg,image/webp,image/gif,image/avif';input.multiple=true;input.hidden=true;input.setAttribute('aria-label',entry.title+'图片');
      row.append(title,status,button,input);list.append(row);
      const state={...entry,status,input,button,busy:false,version:0};rows.push(state);
      button.addEventListener('click',async()=>{
        if(!editor.open||state.busy)return;
        if(await window.archiveAuthorize())input.click();
      });
      input.addEventListener('change',async()=>{
        const files=[...input.files];if(!files.length||state.busy)return;
        state.version++;
        if(!editor.open){input.value='';return;}
        state.busy=true;button.disabled=true;status.dataset.error='false';
        try{
          if(!await window.archiveAuthorize())return;
          for(const file of files){
            if(!['image/png','image/jpeg','image/webp','image/gif','image/avif'].includes(file.type))throw new Error('请选择 PNG、JPG、WebP、GIF 或 AVIF 图片。');
            if(file.size>20*1024*1024)throw new Error('每张图片不能超过 20MB。');
          }
          status.textContent='正在添加图片…';await entry.upload(files);
          const count=await entry.count();status.textContent=`已添加 ${files.length} 张 · 共 ${count} 张图片`+(window.archiveCloud.enabled?' · 已同步到云端':' · 已保存在当前浏览器');
        }catch(error){status.dataset.error='true';status.textContent=error.message||'图片未能添加，请稍后重试。';}
        finally{state.busy=false;button.disabled=false;input.value='';}
      });
    });
  })();
  async function refresh(){
    await ready;
    await Promise.all(rows.map(async row=>{
      if(row.busy)return;const version=++row.version;row.status.textContent='正在读取相册…';row.status.dataset.error='false';
      try{const count=await row.count();if(row.version===version&&!row.busy)row.status.textContent=`${count} 张图片 · 前三张作为封面`;}
      catch(error){if(row.version===version&&!row.busy){row.status.dataset.error='true';row.status.textContent=error.message||'相册暂时未能载入。';}}
    }));
  }
  window.archiveAlbumEditor={refresh};
})();
