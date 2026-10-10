import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { baseUrl } from '@/data/hmv';
export function PageMeta({lang,title,description}) {
 const {pathname}=useLocation();const suffix=pathname.replace(/^\/(en|vi)/,'');const fullTitle=`${title} | HMV Global`;
 useEffect(()=>{
  document.title=fullTitle;
  const tags=[['name','description',description],['property','og:title',fullTitle],['property','og:description',description],['property','og:url',`${baseUrl}${pathname}`],['property','og:locale',lang==='vi'?'vi_VN':'en_US'],['name','twitter:title',fullTitle],['name','twitter:description',description]];
  tags.forEach(([attr,key,value])=>{let tag=document.head.querySelector(`meta[${attr}="${key}"]`);if(!tag){tag=document.createElement('meta');tag.setAttribute(attr,key);document.head.appendChild(tag)}tag.setAttribute('content',value)});
 },[fullTitle,description,pathname,lang]);
 return <Helmet htmlAttributes={{lang}} link={[{rel:'canonical',href:`${baseUrl}${pathname}`},{rel:'alternate',hrefLang:'en',href:`${baseUrl}/en${suffix}`},{rel:'alternate',hrefLang:'vi',href:`${baseUrl}/vi${suffix}`},{rel:'alternate',hrefLang:'x-default',href:`${baseUrl}/en${suffix}`}]} />;
}
