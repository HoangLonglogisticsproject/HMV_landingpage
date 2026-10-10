import { Link } from 'react-router-dom';
import { ArrowUpRight, Sprout, Leaf, CircleDot, Wheat, Flower2, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { copy,products } from '@/data/hmv';
const icons=[Flower2,Leaf,Sprout,Wheat,CircleDot,Layers];
export function Features({lang}){const t=copy[lang];return <section className="section-pad portfolio-section" id="products"><div className="content-width"><div className="section-heading"><div><p className="eyebrow">{t.productsLabel}</p><h2 className="whitespace-pre-line">{t.productsTitle}</h2></div><p>{t.productsText}</p></div><div className="product-grid">{products.map((p,i)=>{const Icon=icons[i];return <Link className="product-item" key={p.id} to={`/${lang}/products/${p.id}`}><div className="product-top"><Icon size={32} strokeWidth={1.4}/><span>{p.category}</span></div><h3>{p[lang]}</h3><p>{lang==='vi'?p.subVi:p.subEn}</p><span className="product-link">{t.more}<ArrowUpRight size={19}/></span></Link>})}</div><p className="commercial-note">{t.confirmed}</p></div></section>}
