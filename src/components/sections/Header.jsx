import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDown, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { copy } from '@/data/hmv';
import { supplyJourney, journeyIndex } from '@/data/supplyJourney';
const FarmScene=lazy(()=>import('@/components/common/FarmScene'));
export function Header({lang='en'}) {
 const t=copy[lang],section=useRef(null);const [progress,setProgress]=useState(0);
 const chapters=supplyJourney;const active=journeyIndex(progress);const chapter=chapters[active];
 useEffect(()=>{let frame=0;const update=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{const el=section.current;if(!el)return;const nav=document.querySelector('.site-nav')?.offsetHeight||92;setProgress(Math.max(0,Math.min(1,(nav-el.getBoundingClientRect().top)/(el.offsetHeight-innerHeight+nav))));});};addEventListener('scroll',update,{passive:true});update();return()=>{cancelAnimationFrame(frame);removeEventListener('scroll',update);};},[]);
 const jump=i=>{const el=section.current;if(!el)return;const nav=document.querySelector('.site-nav')?.offsetHeight||92;scrollTo({top:scrollY+el.getBoundingClientRect().top-nav+(el.offsetHeight-innerHeight+nav)*((i+.18)/chapters.length),behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});};
 return <header ref={section} className="farm-journey farm-art"><div className="home-hero"><Suspense fallback={null}><FarmScene progress={progress}/></Suspense><div className="hero-shade"/><div className="hero-inner"><p className="eyebrow hero-eyebrow">{t.label}</p><p className="journey-location">{lang==='vi'?'HÀNH TRÌNH GIÁ TRỊ':'THE VALUE JOURNEY'} / 0{active+1}</p><h1>HMV GLOBAL<span>{lang==='vi'?chapter.titleVi:chapter.titleEn}</span></h1><p className="hero-intro">{lang==='vi'?chapter.textVi:chapter.textEn}</p><Button asChild size="lg" variant="secondary" className="hero-action"><Link to={`/${lang}/${active===6?'about':'supply-chain'}`}>{lang==='vi'?'Khám phá hệ sinh thái':'Explore our ecosystem'}<ArrowUpRight/></Link></Button></div><div className="journey-rail">{chapters.map((c,i)=><Button key={c.id} variant="ghost" className={active===i?'journey-step active':'journey-step'} onClick={()=>jump(i)} aria-pressed={active===i}><span>0{i+1}</span>{lang==='vi'?c.labelVi:c.labelEn}</Button>)}</div><div className="hero-bottom"><span>{lang==='vi'?'Mô hình chuỗi giá trị · Phối cảnh minh họa':'Value-chain concept · Artistic interpretation'}</span><a href="#featured-products" aria-label={lang==='vi'?'Đến câu chuyện HMV':'Go to the HMV story'}><ArrowDown size={20}/></a></div></div></header>;
}
