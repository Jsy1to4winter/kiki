/* Image management is available only inside the authenticated profile editor. */
(() => {
  'use strict';
  const editor=document.getElementById('profile-editor'),list=document.getElementById('editor-album-list');
  if(!editor||!list)return;
  const rows=[];
  function release(row){row.urls.forEach(url=>URL.revokeObjectURL(url));row.urls=[];}
  function busy(row,value){
    row.busy=value;row.element.setAttribute('aria-busy',String(value));
    row.element.querySelectorAll('button,input').forEach(control=>control.disabled=value);
  }
  function message(row,text,error=false){row.status.textContent=text;row.status.dataset.error=String(error);}
  function draw(row,items){
    release(row);row.items=items;row.cancelConfirmation=null;row.gallery.replaceChildren();row.gallery.hidden=!items.length;
    items.forEach((item,index)=>{
      const tile=document.createElement('div');tile.className='editor-album-photo';
      const image=document.createElement('img');image.src=item.src||URL.createObjectURL(item.blob);if(!item.src)row.urls.push(image.src);image.alt=item.caption||item.name||`图片 ${index+1}`;image.loading='lazy';
      const name=document.createElement('span');name.className='editor-photo-name';name.textContent=item.caption||item.name||`图片 ${index+1}`;
      tile.append(image,name);
      if(index<3){const badge=document.createElement('span');badge.className='editor-cover-badge';badge.textContent=`封面 ${index+1}`;tile.append(badge);}
      if(item.removable&&item.id!==undefined&&item.id!==null){
        const actions=document.createElement('div');actions.className='editor-photo-actions';
        const remove=document.createElement('button');remove.type='button';remove.className='editor-album-delete';remove.textContent='删除';remove.setAttribute('aria-label',`删除第 ${index+1} 张图片：${image.alt}`);
        const cancel=document.createElement('button');cancel.type='button';cancel.className='editor-delete-cancel';cancel.textContent='取消';cancel.hidden=true;
        let armed=false;
        function disarm(){armed=false;remove.textContent='删除';remove.dataset.confirming='false';cancel.hidden=true;}
        cancel.onclick=()=>{disarm();row.cancelConfirmation=null;message(row,`${row.items.length} 张图片 · 前三张作为封面`);remove.focus();};
        remove.onclick=async()=>{
          if(!editor.open||row.busy)return;
          if(!armed){row.cancelConfirmation?.();row.cancelConfirmation=disarm;armed=true;remove.textContent='确认删除';remove.dataset.confirming='true';cancel.hidden=false;message(row,'再次点击“确认删除”移除这张图片，删除后无法恢复。');return;}
          row.version++;busy(row,true);message(row,'正在删除图片…');
          try{
            if(!await window.archiveAuthorize()){disarm();message(row,'已取消删除。');return;}
            await row.remove(item.id);const next=await row.list();
            if(editor.open)draw(row,next);
            message(row,`已删除 · 共 ${next.length} 张图片`+(window.archiveCloud.enabled?' · 已同步到云端':''));
          }catch(error){disarm();message(row,error.message||'图片未能删除，请稍后重试。',true);}
          finally{busy(row,false);}
        };
        actions.append(remove,cancel);tile.append(actions);
      }else{
        const note=document.createElement('span');note.className='editor-help';note.textContent='预设素材';tile.append(note);
      }
      row.gallery.append(tile);
    });
  }
  const ready=(async()=>{
    const albums=await window.archiveCollectionManager.albums();
    const entries=albums.map((album,index)=>({title:album.title,section:'私藏',list:()=>window.archiveCollectionManager.list(index),remove:id=>window.archiveCollectionManager.remove(index,id),upload:files=>window.archiveCollectionManager.upload(index,files)}));
    entries.push({title:'回声相册',section:'评价',list:()=>window.archiveReviewManager.list(),remove:id=>window.archiveReviewManager.remove(id),upload:files=>window.archiveReviewManager.upload(files)});
    entries.forEach((entry,index)=>{
      const element=document.createElement('div');element.className='editor-album';element.dataset.album=String(index);
      const title=document.createElement('h3');title.textContent=entry.section+' / '+entry.title;
      const status=document.createElement('p');status.className='editor-album-status';status.setAttribute('role','status');
      const button=document.createElement('button');button.type='button';button.className='editor-album-add';button.textContent='＋ 添加图片';button.setAttribute('aria-label','向'+entry.title+'添加图片');
      const input=document.createElement('input');input.type='file';input.accept='image/png,image/jpeg,image/webp,image/gif,image/avif';input.multiple=true;input.hidden=true;input.setAttribute('aria-label',entry.title+'图片');
      const gallery=document.createElement('div');gallery.className='editor-album-photos';gallery.hidden=true;
      element.append(title,status,button,input,gallery);list.append(element);
      const row={...entry,element,status,input,button,gallery,busy:false,version:0,urls:[],items:[]};rows.push(row);
      button.addEventListener('click',async()=>{
        if(!editor.open||row.busy)return;
        if(await window.archiveAuthorize())input.click();
      });
      input.addEventListener('change',async()=>{
        const files=[...input.files];if(!files.length||row.busy)return;
        row.version++;
        if(!editor.open){input.value='';return;}
        row.cancelConfirmation?.();busy(row,true);message(row,'正在添加图片…');
        try{
          if(!await window.archiveAuthorize()){message(row,'已取消添加。');return;}
          for(const file of files){
            if(!['image/png','image/jpeg','image/webp','image/gif','image/avif'].includes(file.type))throw new Error('请选择 PNG、JPG、WebP、GIF 或 AVIF 图片。');
            if(file.size>20*1024*1024)throw new Error('每张图片不能超过 20MB。');
          }
          await entry.upload(files);const items=await row.list();if(editor.open)draw(row,items);
          message(row,`已添加 ${files.length} 张 · 共 ${items.length} 张图片`+(window.archiveCloud.enabled?' · 已同步到云端':' · 已保存在当前浏览器'));
        }catch(error){message(row,error.message||'图片未能添加，请稍后重试。',true);}
        finally{busy(row,false);input.value='';}
      });
    });
  })();
  async function refresh(){
    await ready;
    await Promise.all(rows.map(async row=>{
      if(row.busy)return;const version=++row.version;message(row,'正在读取相册…');
      try{const items=await row.list();if(editor.open&&row.version===version&&!row.busy){draw(row,items);message(row,`${items.length} 张图片 · 前三张作为封面`);}}
      catch(error){if(editor.open&&row.version===version&&!row.busy){release(row);row.gallery.replaceChildren();row.gallery.hidden=true;message(row,error.message||'相册暂时未能载入。',true);}}
    }));
  }
  editor.addEventListener('close',()=>rows.forEach(row=>{row.version++;row.cancelConfirmation?.();release(row);row.gallery.replaceChildren();row.gallery.hidden=true;}));
  window.archiveAlbumEditor={refresh};
})();
