import { useEffect } from 'react';
import { BrowserRouter,Routes,Route,Navigate,useParams,useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Navigation } from '@/components/sections/Navigation';
import { Activities } from '@/components/sections/Activities';
import { InAction } from '@/components/sections/InAction';
import { CinematicHero, ValueJourney, CoreCommodities, GlobalReach, PartnerCommunity } from '@/components/sections/CinematicHome';
import { LatestInsights } from '@/components/sections/LatestInsights';
import { ArticlePage } from '@/components/sections/ArticlePage';
import { TradeRfq } from '@/components/sections/TradeRfq';
import { Contact } from '@/components/sections/Contact';
import { Footer } from '@/components/sections/Footer';
import { DetailPage } from '@/components/sections/DetailPage';
import { PackagingLogisticsPage } from '@/components/sections/PackagingLogisticsPage';
import { PageMeta } from '@/components/common/PageMeta';
import { copy } from '@/data/hmv';
import { SupportChatWidget } from '@/components/common/SupportChatWidget';
function Site({page='home'}){const {lang}=useParams();const {pathname,hash}=useLocation();useEffect(()=>{if(hash){requestAnimationFrame(()=>document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView({behavior:'auto'}))}else window.scrollTo({top:0,behavior:'instant'})},[pathname,hash]);if(!['en','vi'].includes(lang))return <Navigate to="/en" replace/>;const t=copy[lang];return <><Navigation lang={lang}/><main id="main-content">{page==='home'?<><PageMeta lang={lang} title={lang==='vi'?'Chuỗi cung ứng nông nghiệp & thương mại quốc tế':'Agricultural Supply Chain & Global Trading'} description={t.storyText}/><CinematicHero lang={lang}/><ValueJourney lang={lang}/><CoreCommodities lang={lang}/><PartnerCommunity lang={lang}/><InAction lang={lang}/><GlobalReach lang={lang}/><LatestInsights lang={lang}/><TradeRfq lang={lang}/></>:page==='packaging-logistics'?<PackagingLogisticsPage lang={lang}/>:<DetailPage lang={lang} page={page}/>}</main><Footer lang={lang}/><SupportChatWidget lang={lang}/></>}
export default function App(){return <HelmetProvider><BrowserRouter><a className="skip-link" href="#main-content">Skip to content</a><Routes><Route path="/" element={<Navigate to="/en" replace/>}/><Route path="/:lang" element={<Site/>}/>{['about','supply-chain','trade-solutions','activities','contact','insights','compliance','packaging-logistics'].map(page=><Route key={page} path={`/:lang/${page}`} element={<Site page={page}/>}/>)}<Route path="/:lang/supply-chain/compliance" element={<Site page="compliance"/>}/><Route path="/:lang/blog/:slug" element={<><ArticlePage/></>}/><Route path="/:lang/products/:id" element={<Site page="product"/>}/><Route path="*" element={<NotFound/>}/></Routes></BrowserRouter></HelmetProvider>}
function NotFound(){return <><PageMeta lang="en" title="Page not found" description="Return to HMV Global."/><div className="not-found"><h1>Page not found</h1><a href="/en">HMV Global →</a></div></>}
