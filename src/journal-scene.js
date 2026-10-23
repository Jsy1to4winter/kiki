import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { SSAOPass } from 'three/addons/postprocessing/SSAOPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import gsap from 'gsap';
import { createIDCard } from './id-card';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { FXAAShader } from 'three/addons/shaders/FXAAShader.js';

export const ACCENT='#08fff9';
export async function createJournalScene(host,onState){
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});
 const gl=renderer.getContext();const debugExt=gl.getExtension('WEBGL_debug_renderer_info');const software=debugExt&&/swiftshader|llvmpipe|software/i.test(gl.getParameter(debugExt.UNMASKED_RENDERER_WEBGL));renderer.setPixelRatio(software?Math.min(1,1400/innerWidth):Math.min(devicePixelRatio,2));renderer.setClearColor(0x090c0d);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.02;host.append(renderer.domElement);renderer.domElement.setAttribute('role','img');renderer.domElement.setAttribute('aria-label','实时三维个人日志，左侧为带照片和纸质贴纸的 ID CARD');
 const scene=new THREE.Scene();
 const camera=new THREE.PerspectiveCamera(34,1,.1,80);camera.position.set(0,0,22);camera.lookAt(0,0,0);
 const pmrem=new THREE.PMREMGenerator(renderer);const room=new RoomEnvironment();const environment=pmrem.fromScene(room,.04);scene.environment=environment.texture;scene.environmentIntensity=.35;room.dispose();pmrem.dispose();
 const ambient=new THREE.HemisphereLight(0xe8efea,0x48433d,.86);scene.add(ambient);
 const key=new THREE.DirectionalLight(0xfff4e9,2.3);key.position.set(-5,9,12);key.castShadow=true;key.shadow.mapSize.set(software?1024:2048,software?1024:2048);Object.assign(key.shadow.camera,{left:-12,right:12,top:11,bottom:-11,near:.1,far:40});key.shadow.normalBias=.02;key.shadow.bias=-.00008;key.shadow.radius=4;scene.add(key);
 const fill=new THREE.DirectionalLight(0xe3eee9,.4);fill.position.set(8,-1,8);scene.add(fill);
 const root=new THREE.Group();root.name='journal-models';root.rotation.set(.08,-.12,-.025);scene.add(root);
 const all=[],targets=[],objects=new Map(),geometries=new Set(),materials=new Set(),textures=new Set();
 function tex(kind='paper'){
  const cv=document.createElement('canvas');cv.width=cv.height=512;const c=cv.getContext('2d');const im=c.createImageData(512,512);let seed=125;const rand=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646;};
  for(let i=0;i<im.data.length;i+=4){const n=kind==='cloth'?((Math.floor(i/4/512)%4<2?1:-1)*12+(i/4%4<2?1:-1)*8):0;const v=212+(rand()-.5)*35+n;im.data[i]=im.data[i+1]=im.data[i+2]=v;im.data[i+3]=255;}c.putImageData(im,0,0);
  c.globalAlpha=.13;c.strokeStyle='#454a45';for(let i=0;i<1600;i++){const x=rand()*512,y=rand()*512;c.beginPath();c.moveTo(x,y);c.lineTo(x+rand()*9,y+rand()*2);c.stroke();}
  const t=new THREE.CanvasTexture(cv);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(2,2);textures.add(t);return t;
 }
 const fiber=tex(),cloth=tex('cloth');
 function mat(color,{metal=false,fabric=false}={}){const m=new THREE.MeshStandardMaterial({color,roughness:metal?.33:.94,metalness:metal?.82:0,map:metal?null:fabric?cloth:fiber,bumpMap:metal?null:fabric?cloth:fiber,bumpScale:fabric?.035:.016,envMapIntensity:metal?.8:.12});materials.add(m);return m;}
 const grey=mat('#b1b8b2'),paper=mat('#c6c3b7'),dark=mat('#282d2c'),cyan=mat(ACCENT),metal=mat('#929a96',{metal:true}),black=mat('#151b19',{fabric:true});
 const track=(m)=>{all.push(m);m.castShadow=true;m.receiveShadow=true;geometries.add(m.geometry);return m;};
 function box(w,h,d,m,x,y,z,rz=0,parent=root){const o=track(new THREE.Mesh(new RoundedBoxGeometry(w,h,d,2,Math.min(.08,d/2)),m));o.position.set(x,y,z);o.rotation.z=rz;parent.add(o);return o;}
 function sheet(w,h,color,x,y,z,rot=0,id){
  const g=new THREE.Group();g.position.set(x,y,z);g.rotation.z=rot;root.add(g);g.name=id||'paper-layer';
  const m=typeof color==='string'?mat(color):color;
  // Physical paper core and tessellated, subtly curled front surface.
  box(w,h,.035,m,0,0,0,0,g);
  const geo=new THREE.PlaneGeometry(w,h,40,30);const pos=geo.attributes.position;
  for(let i=0;i<pos.count;i++){const px=pos.getX(i),py=pos.getY(i);pos.setZ(i,.026+.035*Math.pow(Math.abs(px)/(w/2),5)+.025*Math.sin(py*2+px*.8));}geo.computeVertexNormals();
  const face=track(new THREE.Mesh(geo,m));g.add(face);
  if(id){g.userData.id=id;g.userData.home={position:g.position.clone(),rotation:g.rotation.clone(),scale:g.scale.clone()};objects.set(id,g);targets.push(face);face.userData.id=id;}
  return g;
 }
 const cover=box(10.7,6.8,.20,dark,.35,0,-.25,-.02);cover.name='thick-journal-cover';
 const accentEdge=new THREE.MeshStandardMaterial({color:ACCENT,emissive:ACCENT,emissiveIntensity:.22,roughness:.9,metalness:0,toneMapped:false});materials.add(accentEdge);box(10.9,6.65,.08,accentEdge,.35,0,-.34,-.02);
 for(let i=0;i<9;i++)box(10.35,6.38,.027,i%2?grey:paper,.35+(i%3)*.018,0,-.13+i*.028,-.02);
 box(10.55,6.45,.075,grey,.35,0,.15,-.02);
 // Layered papers, with independent depth and real cast shadows.
 sheet(8.7,5.5,paper,.4,.02,.27,.05);
 sheet(5.9,5.4,grey,1.8,-.05,.36,-.055);
 const idCard=await createIDCard({parent:root,track,materials,textures,fiber,renderer});objects.set('content',idCard.group);targets.push(idCard.face);
 RectAreaLightUniformsLib.init();const idSoftbox=new THREE.RectAreaLight(0xfff4e4,.8,4.8,3.4);idSoftbox.position.set(-4.2,3.2,6);idSoftbox.lookAt(-2.65,-.32,1.28);scene.add(idSoftbox);
 const idAccent=new THREE.SpotLight(ACCENT,4,14,.62,.8,2);idAccent.position.set(-5.5,2.2,3.3);idAccent.target=idCard.group;scene.add(idAccent);
 const center=sheet(3.8,4.9,'#888e8c',1.1,.03,.75,-.07,'ai');
 const note=sheet(1.85,2.85,'#b4bcb2',3.45,1.6,1.01,-.055,'visual');
 const bottom=sheet(3.0,1.62,'#adb0a7',-.25,-2.47,1.10,.09,'about');
 sheet(1.1,1.4,'#929d98',4.65,-1.8,.7,.07);
 // Geometric abstract embossing, not an image of the scene.
 function ring(radius,m,x,y,z,parent=root,sx=1,sy=1){const mesh=track(new THREE.Mesh(new THREE.TorusGeometry(radius,.012,6,100),m));mesh.position.set(x,y,z);mesh.scale.set(sx,sy,1);parent.add(mesh);return mesh;}
 ring(1.46,dark,0,0,.11,center);ring(1.46,dark,0,0,.12,center,.36,1);ring(1.46,dark,0,0,.13,center,1,.35);
 const globe=track(new THREE.Mesh(new THREE.SphereGeometry(1.15,48,32),mat('#6a7771')));globe.scale.z=.14;globe.position.set(.22,-.1,.08);center.add(globe);
 for(let i=0;i<7;i++)box(1.35-i*.075,.012,.013,dark,0,.9-i*.25,.085,0,note);
 box(1.35,.08,.02,cyan,0,-.9,.085,0,note);
 // Raised empty photograph frame and recessed geometric relief.
 const photo=sheet(1.55,2.02,'#afb3ac',-1.13,1.78,.94,-.13);box(1.31,1.55,.04,dark,0,.12,.07,0,photo);
 const moon=track(new THREE.Mesh(new THREE.SphereGeometry(.23,28,20),grey));moon.scale.z=.18;moon.position.set(-.28,.52,.14);photo.add(moon);
 const peak=track(new THREE.Mesh(new THREE.ConeGeometry(.5,.85,3),mat('#63746c')));peak.rotation.x=Math.PI/2;peak.rotation.z=.3;peak.position.set(.18,-.22,.16);photo.add(peak);
 // Actual metal clips, thick wires and fabric tape.
 function wire(coords,r=.025,parent=root){const curve=new THREE.CatmullRomCurve3(coords.map(v=>new THREE.Vector3(...v)));const mesh=track(new THREE.Mesh(new THREE.TubeGeometry(curve,64,r,8,false),metal));parent.add(mesh);return mesh;}
 wire([[3.05,2.95,1.12],[3.68,3.96,1.2],[3.98,3.84,1.2],[3.55,3.13,1.2],[3.29,3.03,1.2],[3.32,3.2,1.2],[3.8,3.82,1.2]],.023);
 wire([[.85,-3.1,1.16],[.9,-3.7,1.18],[1.15,-3.78,1.18],[1.35,-3.65,1.18],[1.22,-3.12,1.18]],.027);
 box(.66,1.5,.08,black,4.16,-2.1,.92,.04);
 box(.45,.52,.20,black,-4.95,.1,.65,-.02);wire([[-5.16,.25,.82],[-5.82,.62,.88],[-5.87,.4,.88],[-5.67,-.13,.88],[-5.12,-.08,.83]],.025);
 const floor=track(new THREE.Mesh(new THREE.PlaneGeometry(200,200),new THREE.MeshStandardMaterial({color:'#080d0a',roughness:1,metalness:0})));floor.position.z=-.45;scene.add(floor);floor.castShadow=false;
 const composer=new EffectComposer(renderer);composer.addPass(new RenderPass(scene,camera));const ao=new SSAOPass(scene,camera,640,480,software?4:8);ao.kernelRadius=.12;ao.minDistance=.0015;ao.maxDistance=.075;composer.addPass(ao);composer.addPass(new OutputPass());const fxaa=new ShaderPass(FXAAShader);composer.addPass(fxaa);
 const ray=new THREE.Raycaster(),pointer=new THREE.Vector2();let selected=null,timeline=null,drag=null,disposed=false,frame=0,phase='idle',intro=null,needsRender=true;
 const worldPos=new THREE.Vector3();let last=0;
 const startCamera=()=>{const aspect=host.clientWidth/host.clientHeight;camera.aspect=aspect;camera.position.z=aspect<1?33:19;camera.fov=aspect<1?46:34;camera.updateProjectionMatrix();};
 function resize(){needsRender=true;const ratio=software?Math.min(1,1400/host.clientWidth):Math.min(devicePixelRatio,2);renderer.setPixelRatio(ratio);renderer.setSize(host.clientWidth,host.clientHeight,false);composer.setPixelRatio(ratio);composer.setSize(host.clientWidth,host.clientHeight);ao.setSize(Math.min(host.clientWidth,software?400:1100),Math.min(host.clientHeight,software?300:800));fxaa.uniforms.resolution.value.set(1/(host.clientWidth*ratio),1/(host.clientHeight*ratio));startCamera();}
 resize();const observer=new ResizeObserver(resize);observer.observe(host);
 function hit(e){const r=renderer.domElement.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(pointer,camera);return ray.intersectObjects(targets,false).find(h=>!h.object.userData.alphaHit||(h.uv&&h.object.userData.alphaHit(h.uv)));}
 function resetTransforms(){for(const g of objects.values()){const h=g.userData.home;g.position.copy(h.position);g.rotation.copy(h.rotation);g.scale.copy(h.scale);}}
 function focus(id){
  if(!objects.has(id)||phase==='opening')return;if(selected&&selected!==id){restore();const done=timeline.eventCallback('onComplete');timeline.eventCallback('onComplete',()=>{done?.();focus(id);});return;}intro?.progress(1);timeline?.kill();resetTransforms();selected=id;phase='opening';onState({phase,id});
  const g=objects.get(id),base=g.userData.home;const parentQ=new THREE.Quaternion();root.getWorldQuaternion(parentQ);const flat=parentQ.clone().invert();const q0=g.quaternion.clone();const qstate={p:0};
  const centerLocal=root.worldToLocal(new THREE.Vector3(0,0,4.3));
  timeline=gsap.timeline({defaults:{ease:'power3.inOut'},onComplete:()=>{needsRender=true;phase='focused';onState({phase,id});}}).addLabel('selected',0);
  timeline.addLabel('lift',0);
  needsRender=true;const duration=reduced.matches?0:.75;
  timeline.to(g.position,{x:centerLocal.x,y:centerLocal.y,z:centerLocal.z,duration},'lift').to(qstate,{p:1,duration,onUpdate:()=>g.quaternion.slerpQuaternions(q0,flat,qstate.p)},'lift').to(g.scale,{x:base.scale.x*(id==='content'?1.4:1.25),y:base.scale.y*(id==='content'?1.4:1.25),z:base.scale.z*(id==='content'?1.4:1.25),duration},'lift');
  timeline.to(root.rotation,{x:root.rotation.x,y:root.rotation.y,duration:0},'lift');
 }
 function restore(){if(!selected)return;needsRender=true;timeline?.kill();phase='closing';onState({phase,id:selected});const g=objects.get(selected),h=g.userData.home,q0=g.quaternion.clone(),q1=new THREE.Quaternion().setFromEuler(h.rotation),q={p:0};timeline=gsap.timeline({defaults:{duration:reduced.matches?0:.65,ease:'power3.inOut'},onComplete:()=>{needsRender=true;selected=null;phase='idle';onState({phase,id:null});}}).to(g.position,{x:h.position.x,y:h.position.y,z:h.position.z},0).to(g.scale,{x:h.scale.x,y:h.scale.y,z:h.scale.z},0).to(q,{p:1,onUpdate:()=>g.quaternion.slerpQuaternions(q0,q1,q.p)},0);}
 function down(e){const h=hit(e);drag={x:e.clientX,y:e.clientY,id:h?.object.userData.id,moved:false};}
 function move(e){if(!drag){const h=hit(e);renderer.domElement.style.cursor=h?'pointer':'default';if(!selected&&!reduced.matches){const r=host.getBoundingClientRect(),px=(e.clientX-r.left)/r.width-.5,py=(e.clientY-r.top)/r.height-.5;gsap.to(root.rotation,{x:.08-py*.055,y:-.12+px*.08,duration:.6,ease:'power2.out',overwrite:true,onUpdate:()=>{needsRender=true;}});gsap.to(idSoftbox,{intensity:h?.object.userData.id==='content'?1.25:.8,duration:.4,overwrite:true,onUpdate:()=>{needsRender=true;}});}return;}if(Math.hypot(e.clientX-drag.x,e.clientY-drag.y)>7)drag.moved=true;}
 function up(){if(!drag)return;const d=drag;drag=null;if(d.moved)return;if(!d.id){restore();return;}if(selected===d.id)return;if(selected){restore();return;}focus(d.id);}
 renderer.domElement.addEventListener('pointerdown',down);renderer.domElement.addEventListener('pointermove',move);renderer.domElement.addEventListener('pointerup',up);renderer.domElement.addEventListener('pointercancel',()=>{drag=null;});
 // Intro targets are actual mesh vertices in the model's own coordinate system.
 const particlesGeo=new THREE.BufferGeometry(),pts=[],origin=[];root.updateMatrixWorld(true);
 for(const m of all){if(m===floor||m.geometry.attributes.position.count<20)continue;const a=m.geometry.attributes.position;for(let i=0;i<a.count;i+=Math.max(1,Math.floor(a.count/180))){const v=new THREE.Vector3().fromBufferAttribute(a,i).applyMatrix4(m.matrixWorld);pts.push(v.x,v.y,v.z);origin.push((Math.random()-.5)*24,(Math.random()-.5)*16,Math.random()*8);}}
 const targetArray=new Float32Array(pts),startArray=new Float32Array(origin),current=new Float32Array(origin);particlesGeo.setAttribute('position',new THREE.BufferAttribute(current,3));const particlesMat=new THREE.PointsMaterial({color:ACCENT,size:.028,transparent:true,opacity:.9,depthWrite:false});const particles=new THREE.Points(particlesGeo,particlesMat);scene.add(particles);particles.visible=false;
 function playIntro(){if(reduced.matches){root.visible=true;particles.visible=false;return;}intro?.kill();root.visible=false;particles.visible=true;particlesMat.opacity=.9;const p={v:0};intro=gsap.timeline({onComplete:()=>{needsRender=true;root.visible=true;particles.visible=false;}}).to(p,{v:1,duration:1.8,ease:'power3.out',onUpdate:()=>{for(let i=0;i<current.length;i++)current[i]=startArray[i]+(targetArray[i]-startArray[i])*p.v;particlesGeo.attributes.position.needsUpdate=true;}},0).call(()=>{root.visible=true;},null,1.65).to(particlesMat,{opacity:0,duration:.6},1.65);}
 let seen=false;try{seen=sessionStorage.getItem('journal-three-intro')==='seen';sessionStorage.setItem('journal-three-intro','seen');}catch{}if(!seen)playIntro();
 function animate(t){if(disposed)return;frame=requestAnimationFrame(animate);if(document.hidden)return;if(!needsRender&&(phase==='idle'||phase==='focused')&&!intro?.isActive())return;if(t-last<1000/(software?10:30))return;last=t;composer.render();if(software)gl.finish();needsRender=false;}
 frame=requestAnimationFrame(animate);
 const debug={scene,root,camera,renderer,objects,idCard:idCard.group,idSoftbox,idAccent,software,focus,restore,playIntro,get state(){return{selected,phase,drawCalls:renderer.info.render.calls};},project(id){objects.get(id)?.getWorldPosition(worldPos);const p=worldPos.clone().project(camera);return{x:(p.x+1)/2*host.clientWidth,y:(1-p.y)/2*host.clientHeight};}};
 return {...debug,get state(){return debug.state;},dispose(){disposed=true;cancelAnimationFrame(frame);timeline?.kill();intro?.kill();observer.disconnect();ao.dispose();composer.dispose();environment.dispose();geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());particlesGeo.dispose();particlesMat.dispose();renderer.dispose();renderer.domElement.remove();}};
}
