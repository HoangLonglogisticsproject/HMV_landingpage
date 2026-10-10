import { useEffect, useRef } from 'react';
import { photos } from '@/data/hmv';
export default function FarmScene({progress}) {
 const host=useRef(null);const state=useRef(null);
 useEffect(()=>{
  const el=host.current;if(!el||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  let stopped=false;let renderer;let resize;let geo;let mat;const textures=[];
  import('three').then(T=>{
   if(stopped)return;try{renderer=new T.WebGLRenderer({alpha:true,antialias:false,powerPreference:'low-power'});}catch{return;}
   renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));el.appendChild(renderer.domElement);
   const scene=new T.Scene();const camera=new T.PerspectiveCamera(40,1,.1,20);camera.position.z=3;
   geo=new T.PlaneGeometry(1,1);mat=new T.MeshBasicMaterial();const plane=new T.Mesh(geo,mat);scene.add(plane);
   function draw(){if(stopped)return;const p=state.current?.progress||0;const texture=textures[Math.min(2,Math.floor(p*3))];if(!texture)return;mat.map=texture;mat.needsUpdate=true;camera.position.z=3-(p*3%1)*.09;const aspect=el.clientWidth/el.clientHeight;const imageAspect=texture.image.width/texture.image.height;const h=2*camera.position.z*Math.tan(T.MathUtils.degToRad(20));plane.scale.set(Math.max(h*aspect,h*imageAspect)*1.08,Math.max(h,h*aspect/imageAspect)*1.08,1);plane.rotation.y=Math.sin(p*Math.PI*2)*.018;renderer.render(scene,camera);}
   state.current={draw,progress:0};const loader=new T.TextureLoader();[photos.farm,photos.grower,photos.fruitWeighing].forEach((url,i)=>loader.load(url,t=>{if(stopped){t.dispose();return;}t.colorSpace=T.SRGBColorSpace;textures[i]=t;draw();}));
   resize=new ResizeObserver(()=>{renderer.setSize(el.clientWidth,el.clientHeight);camera.aspect=el.clientWidth/el.clientHeight;camera.updateProjectionMatrix();draw();});resize.observe(el);
  }).catch(()=>{});
  return()=>{stopped=true;resize?.disconnect();textures.forEach(t=>t.dispose());geo?.dispose();mat?.dispose();renderer?.dispose();renderer?.domElement.remove();state.current=null;};
 },[]);
 useEffect(()=>{if(state.current){state.current.progress=progress;state.current.draw();}},[progress]);
 return <div ref={host} className="farm-scene" aria-hidden="true"/>;
}