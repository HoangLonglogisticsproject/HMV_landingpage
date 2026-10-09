import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Lightformer, useTexture } from '@react-three/drei';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Group, Vector3, CatmullRomCurve3, SRGBColorSpace, Color } from 'three';
import earth from '@/assets/earth.jpg.asset.json';

function coordinate(lat: number, lon: number, radius = 2.2) {
  const phi = (90-lat)*Math.PI/180; const theta = (lon+180)*Math.PI/180;
  return new Vector3(-radius*Math.sin(phi)*Math.cos(theta), radius*Math.cos(phi), radius*Math.sin(phi)*Math.sin(theta));
}
function Globe({ progress, reduced }: { progress: React.RefObject<number>; reduced: boolean }) {
  const group = useRef<Group>(null);
  const texture = useTexture(earth.url, t => { t.colorSpace = SRGBColorSpace; });
  const colors = useMemo(() => {
    const style = getComputedStyle(document.documentElement);
    return { route: new Color(style.getPropertyValue('--primary').trim()), pin: new Color(style.getPropertyValue('--leaf').trim()) };
  }, []);
  // Three.js does not parse OKLCH; canvas tokens are converted by the browser.
  const palette = useMemo(() => {
    const el = document.createElement('span'); document.body.appendChild(el);
    el.style.color = 'var(--primary)'; const blue = getComputedStyle(el).color;
    el.style.color = 'var(--leaf)'; const green = getComputedStyle(el).color; el.remove();
    const ctx = document.createElement('canvas').getContext('2d');
    const convert = (value: string) => { if (!ctx) return new Color(); ctx.fillStyle=value; ctx.fillRect(0,0,1,1); const rgb=ctx.getImageData(0,0,1,1).data; return new Color(`rgb(${rgb[0]},${rgb[1]},${rgb[2]})`); };
    return { blue:convert(blue),green:convert(green) };
  }, []);
  const origin = useMemo(() => coordinate(10.82,106.63), []);
  const destinations = useMemo(() => [coordinate(51.92,4.48), coordinate(40.7,-74),coordinate(34,-118)], []);
  const curves = useMemo(() => destinations.map(end => new CatmullRomCurve3([origin,origin.clone().add(end).normalize().multiplyScalar(3.15),end])), [origin,destinations]);
  useFrame((_, raw) => {
    const g=group.current; if (!g) return;
    const target = -1.5 + progress.current * 2.15;
    g.rotation.y += (target-g.rotation.y)*(reduced ? 1 : 1-Math.exp(-3*Math.min(raw,0.05)));
  });
  return <group ref={group} rotation={[0.12,-1.5,-0.16]}>
    <mesh><sphereGeometry args={[2.17,64,32]} /><meshStandardMaterial map={texture} roughness={0.75} metalness={0.12} /></mesh>
    {curves.map((curve,i) => <mesh key={i}><tubeGeometry args={[curve,48,0.018,6,false]} /><meshBasicMaterial color={palette.blue} /></mesh>)}
    {[origin,...destinations].map((p,i) => <mesh key={i} position={p}><sphereGeometry args={[i===0?0.07:0.045,12,8]} /><meshBasicMaterial color={i===0?palette.green:palette.blue} /></mesh>)}
  </group>;
}
export default function SupplyGlobe() {
  const progress = useRef(0);
  const container=useRef<HTMLDivElement>(null);
  const [visible,setVisible]=useState(false);
  const [reduced,setReduced]=useState(false);
  useEffect(() => {
    setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    const element=container.current; if (!element) return;
    const observer=new IntersectionObserver(([entry]) => setVisible(Boolean(entry?.isIntersecting)), { rootMargin:'150px' }); observer.observe(element);
    const onScroll=() => { const section=element.closest('section'); if (!section) return; const r=section.getBoundingClientRect(); progress.current=Math.max(0,Math.min(1,(window.innerHeight-r.top)/(window.innerHeight+r.height))); };
    onScroll(); window.addEventListener('scroll',onScroll,{passive:true});
    return () => { observer.disconnect();window.removeEventListener('scroll',onScroll); };
  },[]);
  return <div ref={container} className="journey-canvas" aria-label="3D supply-chain globe connecting Vietnam with Europe and North America">
    {visible && <Canvas dpr={[1,1.5]} camera={{position:[0,0,7.5],fov:42}} gl={{antialias:true,alpha:true}} frameloop={reduced?'demand':'always'}>
      <ambientLight intensity={1.6} /><directionalLight position={[3,4,6]} intensity={2} />
      <Environment resolution={64}><Lightformer intensity={1} position={[0,5,0]} scale={[8,8,1]} /></Environment>
      <Suspense fallback={null}><Globe progress={progress} reduced={reduced} /></Suspense>
    </Canvas>}
  </div>;
}