import { useEffect, useRef } from 'react';
export default function FarmScene({progress}) {
 const host=useRef(null);const state=useRef(null);const latest=useRef(progress);latest.current=progress;
 useEffect(()=>{
  const el=host.current;if(!el)return;let stopped=false;let renderer,observer;const resources=[];
  import('three').then(T=>{
   if(stopped)return;
   try{renderer=new T.WebGLRenderer({antialias:true,powerPreference:'low-power'});}catch{return;}
   renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.outputColorSpace=T.SRGBColorSpace;el.appendChild(renderer.domElement);
   const css=getComputedStyle(document.documentElement);const color=key=>css.getPropertyValue(key).trim();
   const scene=new T.Scene();scene.background=new T.Color(color('--farm-sky'));scene.fog=new T.Fog(color('--farm-sky'),40,100);
   const camera=new T.PerspectiveCamera(46,1,.1,150);scene.add(new T.HemisphereLight(color('--farm-light'),color('--farm-earth'),2.3));const sun=new T.DirectionalLight(color('--farm-light'),3);sun.position.set(-20,35,12);scene.add(sun);
   const materials={};for(const [key,token] of Object.entries({leaf:'--farm-leaf',moss:'--farm-moss',soil:'--farm-earth',path:'--farm-path',water:'--farm-water',fruit:'--farm-fruit',shirt:'--brand',hat:'--farm-hat',skin:'--farm-skin',roof:'--farm-roof',white:'--background'})){materials[key]=new T.MeshStandardMaterial({color:color(token),roughness:.88});resources.push(materials[key]);}
   const box=new T.BoxGeometry(1,1,1),sphere=new T.SphereGeometry(1,10,7),cylinder=new T.CylinderGeometry(1,1,1,9),cone=new T.ConeGeometry(1,1,12);resources.push(box,sphere,cylinder,cone);
   function mesh(geo,mat,x,y,z,sx,sy,sz,parent=scene){const m=new T.Mesh(geo,materials[mat]);m.position.set(x,y,z);m.scale.set(sx,sy,sz);parent.add(m);return m;}
   mesh(box,'soil',0,-1.5,0,110,2,95);
   // Broad stepped terraces with individually modelled rows, not photographic planes.
   for(let k=0;k<7;k++){
    const z=-28+k*8,y=.2+k*.18;mesh(box,'moss',-2,y-.65,z,52,1.2,6.5);
    for(let r=0;r<3;r++){mesh(box,'soil',-2,y,z-2+r*1.6,49,.14,.65);for(let j=0;j<20;j++){const x=-25+j*2.5;mesh(sphere,'leaf',x,y+.42,z-2+r*1.6,.5,.55,.5);if((j+r+k)%5===0)mesh(sphere,'fruit',x+.25,y+.52,z-1.9+r*1.6,.13,.13,.13);}}
   }
   // A river and a walking track cut across the fields.
   for(let i=0;i<27;i++){const z=-43+i*3.2,x=31+Math.sin(i*.21)*4;const segment=mesh(box,'water',x,-.32,z,6,.15,3.7);segment.rotation.y=Math.cos(i*.21)*.25;const path=mesh(box,'path',6+Math.sin(i*.24)*2,1.6,z,3.2,.15,3.6);path.rotation.y=Math.cos(i*.24)*.2;}
   for(let i=0;i<18;i++){const x=-48+i*6;mesh(sphere,'moss',x,2,-49,10,6+(i%4)*2,10);mesh(sphere,'leaf',x+3,5,-56,13,10+(i%3)*3,12);}
   function tree(x,z){mesh(cylinder,'soil',x,3,z,.22,6,.22);mesh(sphere,'leaf',x,6,z,2.2,2.8,2.2);mesh(sphere,'moss',x+1.1,6.7,z,1.8,2.2,1.8);}
   for(let i=0;i<12;i++)tree(-30-(i%2)*3,-30+i*5);
   function farmer(x,z,angle=0,bend=0){const g=new T.Group();g.position.set(x,1.7,z);g.rotation.y=angle;scene.add(g);mesh(cylinder,'shirt',0,1.15,0,.3,.85,.28,g).rotation.z=bend;mesh(sphere,'skin',0,1.85,0,.22,.26,.22,g);mesh(cone,'hat',0,2.15,0,.65,.3,.65,g);for(const side of [-1,1]){mesh(cylinder,'roof',side*.15,.45,0,.09,.9,.09,g);const arm=mesh(cylinder,'skin',side*.36,1.1,.12,.075,.65,.075,g);arm.rotation.z=side*.32;arm.rotation.x=.6;}mesh(cylinder,'hat',.65,.35,.32,.4,.45,.4,g);for(let i=0;i<4;i++)mesh(sphere,'fruit',.5+(i%2)*.19,.64,.2+Math.floor(i/2)*.19,.1,.1,.1,g);}
   farmer(2,8,.5,.2);farmer(-9,-6,-.5,.35);farmer(8,-19,2.2);farmer(-19,19,1.1);
   // Open sorting pavilion: an illustrative handover, not an asserted HMV facility.
   const shed=new T.Group();shed.position.set(17,1.8,-24);scene.add(shed);mesh(box,'path',0,0,0,9,.25,7,shed);for(const x of [-4,4])for(const z of [-3,3])mesh(box,'white',x,2,z,.2,4,.2,shed);const roof=mesh(box,'roof',0,4.3,0,10,.35,8,shed);roof.rotation.z=.06;mesh(box,'hat',0,1,0,5,.2,2,shed);for(let i=0;i<6;i++)mesh(box,'hat',-2+(i%3)*1.3,.5,-1.7+Math.floor(i/3)*2.7,1,.8,.8,shed);
   const route=new T.CatmullRomCurve3([new T.Vector3(30,24,39),new T.Vector3(18,13,19),new T.Vector3(12,8,-2),new T.Vector3(24,10,-12)]);
   const targets=new T.CatmullRomCurve3([new T.Vector3(-7,2,0),new T.Vector3(-7,2,-3),new T.Vector3(-3,2,-11),new T.Vector3(10,2,-25)]);
   function draw(){if(stopped)return;const p=Math.max(0,Math.min(1,latest.current));camera.position.copy(route.getPoint(p));camera.lookAt(targets.getPoint(p));renderer.render(scene,camera);}
   state.current={draw};observer=new ResizeObserver(()=>{renderer.setSize(el.clientWidth,el.clientHeight);camera.aspect=el.clientWidth/el.clientHeight;camera.updateProjectionMatrix();draw();});observer.observe(el);draw();
  }).catch(()=>{});
  return()=>{stopped=true;observer?.disconnect();resources.forEach(r=>r.dispose());renderer?.dispose();renderer?.domElement.remove();state.current=null;};
 },[]);
 useEffect(()=>state.current?.draw(),[progress]);
 return <div ref={host} className="farm-scene" aria-hidden="true"/>;
}
