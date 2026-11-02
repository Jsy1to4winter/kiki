/* Public reads use the publishable key; writes are enforced by Supabase RLS. */
(() => {
  'use strict';
  let config=null,session=null;
  const api={enabled:false};
  api.ready=fetch('supabase-config.json?v=archive-cloud-02',{cache:'no-store'}).then(async response=>{
    if(!response.ok)return;
    const value=await response.json();
    if(!value.enabled)return;
    api.enabled=true;
    const url=new URL(value.url);
    if(url.protocol!=='https:')throw new Error('Supabase 项目地址必须使用 HTTPS。');
    if(!value.publishableKey)throw new Error('请配置 Supabase Publishable key。');
    config={url:url.href.replace(/\/$/,''),key:value.publishableKey};api.enabled=true;
  }).catch(error=>{api.error=error.message;});
  async function request(path,{method='GET',body,headers={},auth=false}={}){
    await api.ready;if(!config)throw new Error(api.error||'请先连接 Supabase 项目。');
    if(session&&session.expiresAt<Date.now())session=null;
    if(auth&&!session)throw new Error('请先通过编辑入口登录。');
    const response=await fetch(config.url+path,{method,cache:'no-store',signal:AbortSignal.timeout(20000),headers:{apikey:config.key,...(session?{Authorization:'Bearer '+session.access_token}:{}),...(body&&!(body instanceof Blob)?{'Content-Type':'application/json'}:{}),...headers},body:body instanceof Blob?body:body===undefined?undefined:JSON.stringify(body)});
    if(!response.ok){let detail={};try{detail=await response.json()}catch{}
      if(response.status===401||response.status===403)throw new Error('登录已失效或没有编辑权限，请重新登录。');
      if(detail.error_code==='invalid_credentials')throw new Error('邮箱或密码不正确。');
      throw new Error('云端操作未完成，请检查网络和 Supabase 配置。');
    }
    if(response.status===204)return null;
    const content=await response.text();return content?JSON.parse(content):null;
  }
  api.isAuthenticated=()=>!!session&&session.expiresAt>Date.now();
  api.signIn=async(email,password)=>{
    session=null;
    const result=await request('/auth/v1/token?grant_type=password',{method:'POST',body:{email,password}});
    session={...result,expiresAt:Date.now()+Number(result.expires_in||3600)*1000-30000};
    try{const allowed=await request('/rest/v1/rpc/is_archive_admin',{method:'POST',body:{},auth:true});if(allowed!==true)throw new Error('此账号没有编辑权限。');}
    catch(error){session=null;throw error;}
  };
  api.signOut=()=>{session=null;};
  api.getProfile=async()=>{const rows=await request('/rest/v1/archive_profile?id=eq.main&select=data');return rows[0]?.data||null;};
  api.saveProfile=async data=>request('/rest/v1/archive_profile?on_conflict=id',{method:'POST',body:{id:'main',data},headers:{Prefer:'resolution=merge-duplicates'},auth:true});
  api.listImages=async album=>{
    const rows=await request('/rest/v1/archive_images?album=eq.'+encodeURIComponent(album)+'&select=id,storage_path,name&order=sort_order.asc');
    return rows.map(row=>({src:config.url+'/storage/v1/object/public/archive-images/'+row.storage_path.split('/').map(encodeURIComponent).join('/'),caption:row.name,alt:row.name}));
  };
  api.uploadImages=async(album,files)=>{
    const uploaded=[];
    for(const file of files){
      if(!['image/png','image/jpeg','image/webp','image/gif','image/avif'].includes(file.type))throw new Error('请选择 PNG、JPG、WebP、GIF 或 AVIF 图片。');
      if(file.size>20*1024*1024)throw new Error('每张图片不能超过 20MB。');
    }
    for(const file of files){
      const ext={'image/png':'png','image/jpeg':'jpg','image/webp':'webp','image/gif':'gif','image/avif':'avif'}[file.type];
      const path=album+'/'+crypto.randomUUID()+'.'+ext;
      await request('/storage/v1/object/archive-images/'+path,{method:'POST',body:file,headers:{'Content-Type':file.type,'x-upsert':'false'},auth:true});
      try{await request('/rest/v1/archive_images',{method:'POST',body:{album,storage_path:path,name:file.name},auth:true});uploaded.push(path);}
      catch(error){try{await request('/storage/v1/object/archive-images',{method:'DELETE',body:{prefixes:[path]},auth:true})}catch{};throw error;}
    }
    return uploaded.length;
  };
  window.archiveCloud=api;
})();
