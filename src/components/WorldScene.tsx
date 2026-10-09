import { Canvas, useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { Component, Suspense, useEffect, useMemo, useRef, type ReactNode, type RefObject } from 'react';
import { CatmullRomCurve3, Color, Group, SRGBColorSpace, Vector3 } from 'three';
import earth from '@/assets/earth.jpg.asset.json';
import { globeWeight } from '@/lib/journey';

function usePalette() {
  return useMemo(() => {
    const el = document.createElement('span');
    document.body.appendChild(el);
    const ctx = document.createElement('canvas').getContext('2d');
    const color = (token: string) => {
      el.style.color = `var(--${token})`;
      if (!ctx) return new Color();
      ctx.fillStyle = getComputedStyle(el).color;
      ctx.fillRect(0, 0, 1, 1);
      const p = ctx.getImageData(0, 0, 1, 1).data;
      return new Color(`rgb(${p[0]},${p[1]},${p[2]})`);
    };
    const result = { blue: color('primary'), ocean: color('world-water'), leaf: color('leaf'), grass: color('world-grass'), crop: color('world-crop'), soil: color('world-soil'), white: color('background'), roof: color('world-roof') };
    el.remove();
    return result;
  }, []);
}
/** Globe Y rotation that turns Vietnam (≈106.6°E) toward the camera. */
const VIETNAM_Y = 2.75;
function coordinate(lat: number, lon: number, radius = 2.43) {
  const phi = (90 - lat) * Math.PI / 180;
  const theta = (lon + 180) * Math.PI / 180;
  return new Vector3(-radius * Math.sin(phi) * Math.cos(theta), radius * Math.cos(phi), radius * Math.sin(phi) * Math.sin(theta));
}
function smoothingFor(delta: number) { return 1 - Math.exp(-4 * Math.min(delta, 0.05)); }
function World({ progress, reduced, onReady }: { progress: RefObject<number>; reduced: boolean; onReady: () => void }) {
  const farm = useRef<Group>(null);
  const factory = useRef<Group>(null);
  const globe = useRef<Group>(null);
  const palette = usePalette();
  const texture = useTexture(earth.url, t => { t.colorSpace = SRGBColorSpace; });
  const paths = useMemo(() => {
    const start = coordinate(10.82, 106.63);
    return [coordinate(51.92, 4.48), coordinate(40.7, -74), coordinate(34, -118)].map(end => new CatmullRomCurve3([start, start.clone().add(end).normalize().multiplyScalar(3.45), end]));
  }, []);
  useEffect(() => { onReady(); }, [onReady]);
  useFrame((state, delta) => {
    const f = farm.current; const g = globe.current;
    if (!f || !g) return;
    const p = progress.current;
    const transition = globeWeight(p);
    const fac = factory.current;
    if (fac) { const k = Math.max(0, Math.min(1, (p - 0.3) / 0.1)); const s = reduced ? k : fac.scale.x + (k - fac.scale.x) * smoothingFor(delta); fac.scale.setScalar(Math.max(0.001, s)); fac.visible = s > 0.01; }
    const mobile = state.size.width < 768;
    const smoothing = reduced ? 1 : 1 - Math.exp(-4 * Math.min(delta, 0.05));
    const fit = mobile ? Math.min(1.2, state.viewport.width * 0.39 / 2.5) : Math.min(1.05, state.viewport.width * 0.22 / 2.5);
    const center = mobile ? 0 : state.viewport.width * 0.25;
    const farmSize = fit * (1 - transition);
    f.scale.lerp(new Vector3(farmSize, farmSize, farmSize), smoothing);
    f.position.lerp(new Vector3(center, mobile ? -0.2 : -0.25, 0), smoothing);
    f.rotation.y = reduced ? -0.35 : -0.35 + p * 1.2 + Math.sin(state.clock.elapsedTime * 0.16) * 0.035;
    f.visible = transition < 0.995;
    const globeSize = fit * 0.87 * transition;
    g.scale.lerp(new Vector3(globeSize, globeSize, globeSize), smoothing);
    g.position.lerp(new Vector3(center, mobile ? -0.2 : 0.05, 0), smoothing);
    // Opening shows buyer markets then turns to Vietnam; the closing globe keeps Vietnam as the visual origin.
    const target = p < 0.5 ? VIETNAM_Y - 1.5 * Math.max(0, 1 - p / 0.12) : VIETNAM_Y - 0.55 * Math.min(1, Math.max(0, (p - 0.8) / 0.2));
    g.rotation.y += (target - g.rotation.y) * smoothing;
    g.visible = transition > 0.005;
  });
  return <>
    <group ref={farm} rotation={[0.28, -0.35, 0]} position={[2.25, -0.25, 0]}>
      <mesh position={[0,-0.45,0]}><cylinderGeometry args={[2.5,2.3,0.22,64]} /><meshStandardMaterial color={palette.ocean} roughness={0.3} metalness={0.15} /></mesh>
      <mesh position={[0,-0.25,0]}><cylinderGeometry args={[2.14,2.25,0.33,48]} /><meshStandardMaterial color={palette.soil} /></mesh>
      <mesh position={[0,-0.04,0]}><cylinderGeometry args={[2.14,2.14,0.12,48]} /><meshStandardMaterial color={palette.grass} /></mesh>
      {Array.from({ length: 9 }, (_, i) => <mesh key={`crop-${i}`} position={[-0.95 + i * 0.22,0.07,0.45]}><boxGeometry args={[0.12,0.09,1.7]} /><meshStandardMaterial color={i % 2 ? palette.crop : palette.leaf} /></mesh>)}
      {Array.from({ length: 12 }, (_, i) => { const x = -1.25 + (i % 4) * 0.45; const z = -1.2 + Math.floor(i / 4) * 0.38; return <group key={`tree-${i}`} position={[x,0,z]}><mesh position={[0,0.14,0]}><cylinderGeometry args={[0.025,0.04,0.3,6]} /><meshStandardMaterial color={palette.soil} /></mesh><mesh position={[0,0.4,0]}><icosahedronGeometry args={[0.23,1]} /><meshStandardMaterial color={i % 2 ? palette.leaf : palette.grass} flatShading /></mesh><mesh position={[0.13,0.4,0.1]}><sphereGeometry args={[0.045,8,6]} /><meshStandardMaterial color={palette.crop} /></mesh></group>; })}
      <group position={[1.1,0,-0.5]}><mesh position={[0,0.24,0]}><boxGeometry args={[0.7,0.48,0.65]} /><meshStandardMaterial color={palette.white} /></mesh><mesh position={[0,0.58,0]} rotation={[0,Math.PI / 4,0]}><coneGeometry args={[0.57,0.28,4]} /><meshStandardMaterial color={palette.roof} /></mesh><mesh position={[0,0.16,0.331]}><boxGeometry args={[0.18,0.32,0.015]} /><meshStandardMaterial color={palette.blue} /></mesh></group>
      <mesh position={[0.55,0.035,0.25]}><boxGeometry args={[0.17,0.025,2.6]} /><meshStandardMaterial color={palette.white} /></mesh>
      <group ref={factory} position={[-0.15,0,-1.55]} scale={0.001}><mesh position={[0,0.3,0]}><boxGeometry args={[1.3,0.6,0.7]} /><meshStandardMaterial color={palette.white} /></mesh><mesh position={[0,0.66,0]}><boxGeometry args={[1.34,0.12,0.74]} /><meshStandardMaterial color={palette.blue} /></mesh><mesh position={[0.45,0.9,0]}><cylinderGeometry args={[0.07,0.09,0.6,12]} /><meshStandardMaterial color={palette.roof} /></mesh>{[-0.4,-0.1,0.2].map((x,i) => <mesh key={`win-${i}`} position={[x,0.34,0.352]}><boxGeometry args={[0.18,0.14,0.01]} /><meshStandardMaterial color={palette.ocean} /></mesh>)}</group>
      {[-0.2,0.25,0.7].map((z,i) => <mesh key={`crate-${i}`} position={[1.1,0.12,z]}><boxGeometry args={[0.3,0.24,0.3]} /><meshStandardMaterial color={palette.crop} /></mesh>)}
    </group>
    <group ref={globe} rotation={[0.1,VIETNAM_Y - 1.5,-0.1]} scale={0}>
      <mesh><sphereGeometry args={[2.4,64,40]} /><meshStandardMaterial map={texture} roughness={0.8} metalness={0.05} /></mesh>
      {paths.map((curve,i) => <group key={i}><mesh><tubeGeometry args={[curve,64,0.01,6,false]} /><meshBasicMaterial color={palette.blue} transparent opacity={0.7} /></mesh><mesh position={curve.getPoint(1)}><sphereGeometry args={[0.06,12,8]} /><meshBasicMaterial color={palette.crop} /></mesh></group>)}
      <mesh position={coordinate(10.82,106.63)}><sphereGeometry args={[0.085,16,8]} /><meshBasicMaterial color={palette.leaf} /></mesh>
    </group>
  </>;
}
class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  override state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  override render() { return this.state.failed ? null : this.props.children; }
}
export default function WorldScene({ progress, reduced, visible, onReady }: { progress: RefObject<number>; reduced: boolean; visible: boolean; onReady: () => void }) {
  return <div className="world-canvas" aria-label="Interactive 3D agricultural world with farms and international trade connections"><SceneBoundary><Canvas dpr={[1,1.5]} camera={{ position: [0,5.6,10.8], fov: 40 }} gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }} frameloop={visible && !reduced ? 'always' : 'demand'}>
    <ambientLight intensity={2} /><directionalLight position={[-3,8,5]} intensity={3} /><directionalLight position={[5,2,-2]} intensity={1} />
    <Suspense fallback={null}><World progress={progress} reduced={reduced} onReady={onReady} /></Suspense>
  </Canvas></SceneBoundary></div>;
}