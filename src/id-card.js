import * as THREE from 'three';

/** All artwork layers share the same atlas and UV coordinates: the portrait never moves. */
export async function createIDCard({parent,track,materials,textures,fiber,renderer}){
 const texture=await new THREE.TextureLoader().loadAsync('/textures/id-card-reference.png');
 texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());textures.add(texture);
 const image=texture.image,canvas=document.createElement('canvas');canvas.width=image.width;canvas.height=image.height;const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(image,0,0);const alpha=ctx.getImageData(0,0,image.width,image.height).data;
 const W=4.8,H=W*image.height/image.width;
 const group=new THREE.Group();group.name='id-card-content';group.position.set(-2.65,-.32,1.28);group.rotation.z=.065;parent.add(group);
 group.userData.id='content';group.userData.home={position:group.position.clone(),rotation:group.rotation.clone(),scale:group.scale.clone()};
 const xy=(u,v)=>new THREE.Vector2((u-.5)*W,(.5-v)*H);
 function shapeFrom(points){const s=new THREE.Shape();points.forEach(([u,v],i)=>{const p=xy(u,v);i?s.lineTo(p.x,p.y):s.moveTo(p.x,p.y);});s.closePath();return s;}
 function layer(name,points,roughness,z,{clearcoat=0,bump=.006}={}){
  const geo=new THREE.ShapeGeometry(shapeFrom(points));const positions=geo.attributes.position;const uv=geo.attributes.uv;
  for(let i=0;i<positions.count;i++)uv.setXY(i,positions.getX(i)/W+.5,positions.getY(i)/H+.5);
  const mat=new THREE.MeshPhysicalMaterial({color:0xffffff,map:texture,transparent:true,alphaTest:.08,roughness,bumpMap:fiber,bumpScale:bump,metalness:0,clearcoat,clearcoatRoughness:.6,envMapIntensity:.4,side:THREE.DoubleSide});materials.add(mat);
  const mesh=track(new THREE.Mesh(geo,mat));mesh.name=name;mesh.position.z=z;group.add(mesh);return mesh;
 }
 // Bevelled, solid paper core follows the reference silhouette, not a rectangular screenshot.
 const coreShape=shapeFrom([[.052,.205],[.108,.182],[.913,.127],[.965,.15],[.989,.89],[.969,.942],[.102,.989],[.061,.958],[.033,.27]]);
 const edgeMat=new THREE.MeshStandardMaterial({color:'#c9bb8d',roughness:.96,map:fiber,bumpMap:fiber,bumpScale:.014,metalness:0});materials.add(edgeMat);
 const core=track(new THREE.Mesh(new THREE.ExtrudeGeometry(coreShape,{depth:.062,bevelEnabled:true,bevelSegments:3,steps:1,bevelSize:.012,bevelThickness:.009}),edgeMat));core.name='id-card-solid-paper-core';group.add(core);
 const face=layer('id-card-printed-paper',[[0,0],[1,0],[1,1],[0,1]],.96,.073,{bump:.007});
 face.userData.id='content';face.userData.alphaHit=uv=>{const x=Math.min(image.width-1,Math.max(0,Math.floor(uv.x*image.width))),y=Math.min(image.height-1,Math.max(0,Math.floor((1-uv.y)*image.height)));return alpha[(y*image.width+x)*4+3]>35;};
 // Raised photo stock and original stickers retain exact atlas coordinates and registration.
 layer('id-card-portrait-fixed',[[.098,.279],[.366,.239],[.401,.705],[.117,.744]],.64,.077,{clearcoat:.035,bump:.002});
 const stickerLayers=[
  layer('id-sticker-young-blue',[[.068,.657],[.172,.608],[.211,.782],[.111,.825]],.56,.087,{clearcoat:.14,bump:.003}),
  layer('id-sticker-call-roan',[[.725,.242],[.91,.265],[.902,.39],[.719,.37]],.5,.09,{clearcoat:.18,bump:.002}),
  layer('id-sticker-smile-triangle',[[.934,.323],[.99,.46],[.874,.462]],.56,.095,{clearcoat:.12,bump:.003}),
  layer('id-sticker-stars',[[.282,.231],[.318,.224],[.327,.251],[.371,.242],[.397,.325],[.353,.348],[.315,.31]],.62,.085,{clearcoat:.08}),
  layer('id-sticker-profile-orange',[[.218,.714],[.397,.695],[.402,.772],[.216,.792]],.57,.085,{clearcoat:.1}),
 ];
 layer('id-paper-newspaper-scraps',[[.782,.192],[.842,.125],[.889,.137],[.902,.132],[.965,.173],[.952,.396],[.892,.447],[.814,.42]],.98,.082,{bump:.009});
 // The APPROVED mark is ink printed on paper, not a floating plastic badge.
 layer('id-approved-ink',[[.713,.837],[.964,.747],[.991,.924],[.74,.976]],.98,.076,{bump:.004});
 const clipMaterial=new THREE.MeshStandardMaterial({color:'#b9c1bf',metalness:.93,roughness:.26,envMapIntensity:.9});materials.add(clipMaterial);
 const clipPath=[[.102,.196],[.095,.115],[.12,.087],[.154,.099],[.169,.14],[.179,.428],[.166,.491],[.142,.502],[.129,.467],[.129,.258]];
 const curve=new THREE.CatmullRomCurve3(clipPath.map(([u,v])=>{const p=xy(u,v);return new THREE.Vector3(p.x,p.y,.125);}));
 const clip=track(new THREE.Mesh(new THREE.TubeGeometry(curve,90,.021,10,false),clipMaterial));clip.name='id-card-metal-paperclip';group.add(clip);
 group.userData.reference='Hye ID card supplied by user';group.userData.photoUV=[[.098,.279],[.366,.239],[.401,.705],[.117,.744]];
 group.userData.stickerLayers=stickerLayers.map(m=>m.name);group.userData.materials={paper:edgeMat,face:face.material,stickers:stickerLayers.map(m=>m.material)};
 return {group,face,texture};
}
