import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { baseUrl } from '@/data/hmv';
export function PageMeta({lang,title,description}) {
 const {pathname}=useLocation(); const suffix=pathname.replace(/^\/(en|vi)/,'');
 return <Helmet><html lang={lang}/><title>{title} | HMV Global</title><meta name="description" content={description}/><link rel="canonical" href={`${baseUrl}${pathname}`}/><link rel="alternate" hrefLang="en" href={`${baseUrl}/en${suffix}`}/><link rel="alternate" hrefLang="vi" href={`${baseUrl}/vi${suffix}`}/><link rel="alternate" hrefLang="x-default" href={`${baseUrl}/en${suffix}`}/><meta property="og:title" content={`${title} | HMV Global`}/><meta property="og:description" content={description}/><meta property="og:url" content={`${baseUrl}${pathname}`}/><meta property="og:locale" content={lang==='vi'?'vi_VN':'en_US'}/></Helmet>;
}
