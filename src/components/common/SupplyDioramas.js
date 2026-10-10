import * as T from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

// Sculptural explanatory sets, not depictions of owned facilities or real shipments.
export function buildSupplyDioramas(colors) {
 const resources=[],sets=[];
 for(let stage=2;stage<=5;stage++){
  const group=new T.Group(),bins=new Map();
  const add=(geometry,key,position,scale=[1,1,1],rotation=[0,0,0])=>{geometry.scale(...scale);geometry.rotateX(rotation[0]);geometry.rotateY(rotation[1]);geometry.rotateZ(rotation[2]);geometry.translate(...position);if(!bins.has(key))bins.set(key,[]);bins.get(key).push(geometry);};
  const box=(key,p,s,r)=>add(new T.BoxGeometry(1,1,1),key,p,s,r);
  const ball=(key,p,s)=>add(new T.SphereGeometry(1,18,12),key,p,s);
  const cylinder=(key,p,s)=>add(new T.CylinderGeometry(1,1,1,18),key,p,s);
  const curve=(key,points,radius)=>add(new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),48,radius,8,false),key,[0,0,0]);
  box('path',[0,-.4,0],[44,.7,32]);
  // An architectural arch unifies the four commercial vignettes.
  curve('white',[[-16,0,-9],[-16,12,-9],[0,18,-9],[16,12,-9],[16,0,-9]],.22);
  if(stage===2){
   box('white',[4,2,0],[16,.6,7]);for(const x of [-3,11])for(const z of [-2,2])cylinder('roof',[x,1,z],[.12,2,.12]);
   // Product samples, a specification sheet and a magnifying lens.
   for(let i=0;i<8;i++)ball('fruit',[i%4*1.2,2.6,Math.floor(i/4)*1.5],[.5,.6,.5]);
   box('shirt',[10,2.6,0],[4,.2,5]);for(let i=0;i<4;i++)box('white',[10,2.72,-1.5+i],[2.5,.04,.12]);
   add(new T.TorusGeometry(2.2,.2,8,40),'shirt',[4,8,0],[1,1,1],[0,.2,0]);curve('shirt',[[5.5,6.5,0],[8,4,0]],.22);
   for(let i=0;i<4;i++){box('hat',[-9,1+i*.8,4],[3,.7,3]);ball('fruit',[-9,4.3,4],[.5,.5,.5]);}
  }
  if(stage===3){
   // Two visible product pathways: fresh packing and processing vessels.
   box('roof',[0,2,2],[23,.6,4]);for(let i=0;i<15;i++)cylinder('white',[-10+i*1.4,2.45,2],[.15,3.7,.15],[Math.PI/2,0,0]);
   for(let i=0;i<6;i++)ball('fruit',[-7+i*2.5,3,2],[.6,.7,.6]);
   for(const x of [-6,2,10]){cylinder('white',[x,5,-5],[2,7,2]);ball('white',[x,8.5,-5],[2,.65,2]);box('shirt',[x,5,-2.98],[1.2,2,.08]);curve('roof',[[x,8,-5],[x,10,-5],[x+3,10,-5],[x+3,3,-2]],.15);}
   for(let i=0;i<3;i++)box('hat',[7+i*2,1.4,7],[1.7,2.5,2]);
  }
  if(stage===4){
   // Goods, commercial documents and a suspended global coordination sphere.
   for(let row=0;row<2;row++)for(let i=0;i<3;i++){box(row?'shirt':'roof',[-9+i*6,1.5+row*3,-2],[5.5,2.7,4]);for(let j=0;j<8;j++)box('white',[-11.4+i*6+j*.65,1.5+row*3,.04],[.04,2.2,.03]);}
   box('white',[9,3,5],[6,.3,7]);box('shirt',[9,3.2,5],[4,.2,5]);for(let i=0;i<4;i++)box('white',[9,3.32,3.8+i*.8],[2.6,.03,.1]);
   ball('water',[1,12,-2],[3.5,3.5,3.5]);for(let i=0;i<3;i++)add(new T.TorusGeometry(3.7,.04,6,64),'white',[1,12,-2],[1,1,1],[Math.PI/2,i*Math.PI/3,0]);
   curve('fruit',[[-10,4,-2],[-5,9,4],[1,12,-2],[9,6,5]],.09);
  }
  if(stage===5){
   // Abstract destination shelves and distribution channels, no retailer branding.
   for(const x of [-11,0,11]){box('white',[x,5,-4],[.3,10,.3]);for(let k=0;k<3;k++)box('roof',[x,1+k*3,-1],[9,.3,5]);for(let k=0;k<3;k++)for(let j=0;j<4;j++){const px=x-3+j*2;box('hat',[px,2+k*3,-1],[1.6,1.5,2]);ball(k%2?'fruit':'leaf',[px,2.9+k*3,-1],[.5,.5,.5]);}}
   curve('water',[[-16,0,8],[-8,1,8],[0,1,8],[8,1,8],[16,0,8]],.12);
   for(const x of [-10,10]){add(new T.TorusGeometry(2,.08,6,40),'shirt',[x,11,-3]);ball('water',[x,11,-3],[1.7,1.7,1.7]);}
  }
  for(const [key,geos] of bins){const normalized=geos.map(g=>{const n=g.index?g.toNonIndexed():g;n.deleteAttribute('uv');return n;});const merged=mergeGeometries(normalized);normalized.forEach(g=>g.dispose());geos.forEach(g=>{if(!normalized.includes(g))g.dispose();});const material=new T.MeshStandardMaterial({color:colors[key],roughness:key==='white'?.4:.8,metalness:key==='roof'?.15:0,side:T.DoubleSide});resources.push(merged,material);if(merged){const mesh=new T.Mesh(merged,material);mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh);}}
  group.visible=false;sets.push(group);
 }
 return {sets,dispose:()=>resources.forEach(r=>r?.dispose())};
}
