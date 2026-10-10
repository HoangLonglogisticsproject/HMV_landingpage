import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer } from '@react-three/drei';
import * as T from 'three';
import { supplyJourney, journeyIndex } from '@/data/supplyJourney';
import { buildSupplyDioramas } from './SupplyDioramas';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

// A deliberately sculpted miniature landscape, not a representation of HMV assets.
function buildWorld(colors) {
 const group=new T.Group(), bins=new Map(), resources=[];
 const material=(key,roughness=.85)=>new T.MeshStandardMaterial({color:colors[key],roughness,side:T.DoubleSide,metalness:key==='water'?.35:0});
 const mats={};for(const k of ['leaf','moss','earth','path','water','fruit','hat','skin','roof','white','shirt']){mats[k]=material(k);resources.push(mats[k]);}
 const add=(geo,key,pos,scale=[1,1,1],rot=[0,0,0])=>{geo.scale(...scale);geo.rotateX(rot[0]);geo.rotateY(rot[1]);geo.rotateZ(rot[2]);geo.translate(...pos);if(!bins.has(key))bins.set(key,[]);bins.get(key).push(geo);};
 const sphere=(key,pos,scale)=>add(new T.IcosahedronGeometry(1,2),key,pos,scale);
 const box=(key,pos,scale,rot)=>add(new T.BoxGeometry(1,1,1),key,pos,scale,rot);
 const cylinder=(key,pos,scale,rot)=>add(new T.CylinderGeometry(.9,1,1,10),key,pos,scale,rot);
 const height=(x,z)=>2+Math.sin(x*.055)*3+Math.cos(z*.07)*2+Math.sin((x+z)*.08)*1.4;
 const terrain=new T.PlaneGeometry(200,190,100,90);terrain.rotateX(-Math.PI/2);
 const vertices=terrain.attributes.position;for(let i=0;i<vertices.count;i++){vertices.setY(i,height(vertices.getX(i),vertices.getZ(i)));}terrain.computeVertexNormals();
 const canvas=document.createElement('canvas');canvas.width=canvas.height=256;const ctx=canvas.getContext('2d');
 if(ctx){ctx.fillStyle=colors.moss;ctx.fillRect(0,0,256,256);for(let i=0;i<2500;i++){ctx.fillStyle=i%2?colors.leaf:colors.path;ctx.globalAlpha=.09;ctx.fillRect((i*73)%256,(i*113)%256,1,2);}}
 const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;texture.wrapS=texture.wrapT=T.RepeatWrapping;texture.repeat.set(12,12);resources.push(texture,terrain);
 const groundMat=material('moss');groundMat.map=texture;resources.push(groundMat);const ground=new T.Mesh(terrain,groundMat);ground.receiveShadow=true;group.add(ground);
 // Contoured cultivation bands follow the terrain rather than a rigid tile grid.
 for(let r=0;r<18;r++){const positions=[],indices=[];for(let i=0;i<70;i++){const x=-59+i*1.3,z=6+r*2.3+Math.sin(x*.065)*5;positions.push(x,height(x,z)+.12,z,x,height(x,z+1)+.12,z+1);if(i){const v=i*2;indices.push(v-2,v,v-1,v-1,v,v+1);}}const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));geo.setIndex(indices);geo.computeVertexNormals();if(!bins.has(r%3?'leaf':'hat'))bins.set(r%3?'leaf':'hat',[]);bins.get(r%3?'leaf':'hat').push(geo);}
 // Broad water ribbon and pale riverside trail.
 for(const [key,width,offset] of [['water',9,0],['path',1.3,-8]]){const positions=[],indices=[];for(let i=0;i<100;i++){const z=-85+i*1.75,x=36+Math.sin(z*.04)*12+offset;for(const s of [-1,1])positions.push(x+s*width, height(x,z)+.18,z);if(i){const v=i*2;indices.push(v-2,v-1,v,v-1,v+1,v);}}const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));geo.setIndex(indices);geo.computeVertexNormals();if(!bins.has(key))bins.set(key,[]);bins.get(key).push(geo);}
 // Layered, faceted mountains provide a distant silhouette and depth.
 for(let i=0;i<12;i++){const x=-95+i*18;sphere(i%2?'leaf':'roof',[x,2,-82],[18,14+(i%4)*6,20]);sphere('moss',[x+5,0,-66],[17,7+(i%3)*3,16]);}
 for(let i=0;i<72;i++){const x=-61+(i%12)*5.2,z=-30+Math.floor(i/12)*5.5,y=height(x,z);cylinder('earth',[x,y+1.5,z],[.15,3,.15]);sphere(i%3?'leaf':'moss',[x,y+4,z],[1.8,2.5,1.6]);if(i%2===0)for(let j=0;j<3;j++)sphere('fruit',[x+Math.cos(j*2)*1.4,y+3.8+j*.4,z+Math.sin(j*2)*1.2],[.2,.24,.2]);}
 // Oversized foreground leaves frame the journey like a botanical sculpture.
 for(let i=0;i<15;i++){const x=-34+i*3.4,z=58+(i%3)*2,y=height(x,z);cylinder('earth',[x,y+1,z],[.07,2,.07]);for(let j=0;j<3;j++)add(new T.SphereGeometry(1,12,8),'leaf',[x+(j-1)*.8,y+2+j*.45,z],[.8,.1,1.8],[.2,j*2,.35]);}
 // Artisan miniature farm workers, with conical hats and woven baskets.
 for(const [x,z,angle] of [[10,23,.3],[14,18,-.4],[-13,10,1.2]]){const y=height(x,z);cylinder('shirt',[x,y+1.4,z],[.28,.85,.26],[0,0,angle*.12]);sphere('skin',[x,y+2.02,z],[.23,.26,.23]);add(new T.ConeGeometry(.65,.28,18),'hat',[x,y+2.35,z]);for(const side of [-1,1]){cylinder('roof',[x+side*.16,y+.5,z],[.09,1,.09]);cylinder('skin',[x+side*.4,y+1.3,z+.13],[.07,.75,.07],[.4,0,side*.4]);}cylinder('hat',[x+.8,y+.65,z+.3],[.4,.5,.4]);}
 // Glass-like product handover pavilion: illustrative, not an owned facility.
 for(const x of [1,10])for(const z of [-8,-15])cylinder('white',[x,height(5,-12)+2.5,z],[.08,5,.08]);box('roof',[5.5,height(5,-12)+5.1,-11.5],[11,.25,9],[0,0,-.08]);box('path',[5.5,height(5,-12),-11.5],[11,.3,9]);
 for(const [key,geos] of bins){const normalized=geos.map(g=>{const n=g.index?g.toNonIndexed():g;n.deleteAttribute('uv');return n;});const merged=mergeGeometries(normalized);normalized.forEach(g=>g.dispose());geos.forEach(g=>{if(!normalized.includes(g))g.dispose();});if(merged){resources.push(merged);const mesh=new T.Mesh(merged,mats[key]);mesh.castShadow=key!=='water';mesh.receiveShadow=true;group.add(mesh);}}
 const turbines=[];for(const [x,z,h] of [[50,-20,18],[66,-40,22],[34,-49,17],[77,-65,24]]){const y=height(x,z);const tower=new T.Mesh(new T.CylinderGeometry(.25,.7,h,12),mats.white);tower.position.set(x,y+h/2,z);group.add(tower);resources.push(tower.geometry);const rotor=new T.Group();rotor.position.set(x,y+h,z+1);for(let i=0;i<3;i++){const blade=new T.Mesh(new T.BoxGeometry(.5,h*.42,.2),mats.white);blade.position.y=h*.19;const arm=new T.Group();arm.rotation.z=i*Math.PI*2/3;arm.add(blade);rotor.add(arm);resources.push(blade.geometry);}const hub=new T.Mesh(new T.SphereGeometry(.65,12,8),mats.white);rotor.add(hub);resources.push(hub.geometry);group.add(rotor);turbines.push(rotor);}
 return {group,turbines,dispose:()=>resources.forEach(r=>r.dispose())};
}
function World({progress,colors,reduced}) {
 const world=useMemo(()=>buildWorld(colors),[colors]);const {invalidate,camera,pointer}=useThree();const current=useRef(progress);const target=new T.Vector3();
 const dioramas=useMemo(()=>buildSupplyDioramas(colors),[colors]);const display=useRef(-1);
 useEffect(()=>{invalidate();},[progress,invalidate]);useEffect(()=>()=>{world.dispose();dioramas.dispose();},[world,dioramas]);
 useFrame((_,delta)=>{const desired=reduced?0:progress;current.current=T.MathUtils.lerp(current.current,desired,1-Math.exp(-5*Math.min(delta,.05)));if(Math.abs(current.current-desired)<.001)current.current=desired;const index=journeyIndex(current.current);const chapter=supplyJourney[index];
 if(display.current!==index){display.current=index;world.group.visible=index<2||index===6;dioramas.sets.forEach((g,i)=>{g.visible=index===i+2;});}
 target.set(...chapter.camera);target.x+=reduced?0:pointer.x*1.2;target.y+=reduced?0:pointer.y*.7;camera.position.lerp(target,1-Math.exp(-4*Math.min(delta,.05)));camera.lookAt(...chapter.target);world.turbines.forEach((r,i)=>{r.rotation.z=current.current*8+i*.4;});if(current.current!==desired||camera.position.distanceTo(target)>.01)invalidate();});
 return <><color attach="background" args={[colors.sky]}/><fog attach="fog" args={[colors.sky,115,220]}/><hemisphereLight args={[colors.light,colors.earth,1.6]}/><directionalLight position={[-25,65,45]} intensity={3.2} color={colors.light} castShadow shadow-mapSize={[1024,1024]} shadow-camera-left={-75} shadow-camera-right={75} shadow-camera-top={65} shadow-camera-bottom={-65} shadow-bias={-.001}/><Environment resolution={64}><Lightformer intensity={1.4} color={colors.light} position={[0,20,0]} rotation-x={Math.PI/2} scale={[90,90,1]}/><Lightformer intensity={.8} color={colors.sky} position={[50,15,0]} rotation-y={Math.PI/2} scale={[70,30,1]}/></Environment><primitive object={world.group}/>{dioramas.sets.map((g,i)=><primitive key={i} object={g}/>)}</>;
}
export default function FarmScene({progress}) {
 const [colors,setColors]=useState(null);const [reduced,setReduced]=useState(false);const [visible,setVisible]=useState(true);const host=useRef(null);
 useEffect(()=>{const css=getComputedStyle(document.documentElement);const tokens={sky:'--farm-sky',light:'--farm-light',leaf:'--farm-leaf',moss:'--farm-moss',earth:'--farm-earth',path:'--farm-path',water:'--farm-water',fruit:'--farm-fruit',hat:'--farm-hat',skin:'--farm-skin',roof:'--farm-roof',white:'--background',shirt:'--brand'};setColors(Object.fromEntries(Object.entries(tokens).map(([k,v])=>[k,css.getPropertyValue(v).trim()])));const media=matchMedia('(prefers-reduced-motion: reduce)');const change=()=>setReduced(media.matches);change();media.addEventListener('change',change);const observer=new IntersectionObserver(([entry])=>setVisible(entry.isIntersecting));if(host.current)observer.observe(host.current);return()=>{media.removeEventListener('change',change);observer.disconnect();};},[]);
 return <div ref={host} className="farm-scene" aria-hidden="true">{colors&&<Canvas shadows dpr={[1,1.5]} frameloop={visible?'demand':'never'} camera={{position:[65,34,77],fov:48,near:.5,far:260}} gl={{antialias:true,powerPreference:'low-power'}} onCreated={({gl})=>{gl.toneMapping=T.ACESFilmicToneMapping;gl.toneMappingExposure=.9;}}><World progress={progress} colors={colors} reduced={reduced}/></Canvas>}</div>;
}
