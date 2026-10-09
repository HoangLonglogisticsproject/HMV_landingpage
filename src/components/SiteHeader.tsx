import { Link, useRouterState } from '@tanstack/react-router';
import { useState } from 'react';
import { ArrowUpRight, ChevronDown, Globe2, Menu, X } from 'lucide-react';
import { getProducts } from '@/lib/catalog';
import { navExtra, supplyMenu } from '@/lib/world2';
import { Button } from '@/components/ui/button';
import logo from '@/assets/hmv-logo.jpg.asset.json';
import { localeFromPath, localeNames, locales, switchLocalePath, ui } from '@/lib/i18n';

export function SiteHeader() {
  const [menu, setMenu] = useState(false);
  const pathname = useRouterState({ select: s => s.location.pathname });
  const lang = localeFromPath(pathname);
  const t = ui[lang].nav;
  const close = () => setMenu(false);
  const x = navExtra[lang]; const menuData = supplyMenu[lang]; const products = getProducts(lang);
  const navigation = <>
    <Link to="/$lang" params={{ lang }} onClick={close} activeOptions={{ exact: true }} activeProps={{ className: 'text-primary' }}>{x.home}</Link>
    <div className="mega group relative">
      <Link to="/$lang/supply-chain" params={{ lang }} onClick={close} activeProps={{ className: 'text-primary' }} className="inline-flex items-center gap-1">{t.supply} <ChevronDown className="hidden size-3.5 lg:block" /></Link>
      <div className="mega-panel">
        <div><p className="eyebrow mb-3 text-primary">{menuData.products}</p><ul className="grid gap-2">{products.map(p => <li key={p.id}><Link to="/$lang/products/$id" params={{ lang, id: p.id }} onClick={close} className="text-sm hover:text-primary">{p.name}</Link></li>)}</ul></div>
        <ul className="grid gap-3">{menuData.items.map((m, i) => <li key={m.hash}><Link to="/$lang/supply-chain" params={{ lang }} hash={m.hash} onClick={close} className="block hover:text-primary"><span className="text-sm font-semibold">0{i + 2} · {m.label}</span><span className="block text-[11px] text-muted-foreground">{m.text}</span></Link></li>)}</ul>
      </div>
    </div>
    <Link to="/$lang/supply-chain" params={{ lang }} hash="blueprint" onClick={close}>{x.solutions}</Link>
    <Link to="/$lang/insights" params={{ lang }} onClick={close} activeProps={{ className: 'text-primary' }}>{t.insights}</Link>
    <Link to="/$lang/about" params={{ lang }} onClick={close} activeProps={{ className: 'text-primary' }}>{t.about}</Link>
  </>;

  // Plain links so crawlers and visitors can always reach each language; never auto-redirected by browser language or IP.
  const switcher = <div role="group" aria-label={t.language} className="flex items-center gap-1 text-xs"><Globe2 className="size-3.5 text-primary" />{locales.map(l => <a key={l} href={switchLocalePath(pathname, l)} hrefLang={l} lang={l} aria-label={localeNames[l]} aria-current={l === lang ? 'true' : undefined} onClick={close} className={`px-1 uppercase ${l === lang ? 'font-semibold text-primary' : 'text-muted-foreground hover:text-primary'}`}>{l}</a>)}</div>;
  return <header className="site-header sticky top-0 z-40 border-b border-border bg-background/95">
    <div className="page-width flex h-22 items-center justify-between gap-4">
      <Link to="/$lang" params={{ lang }} onClick={close} aria-label={t.home} className="flex min-w-0 items-center gap-2"><img src={logo.url} width={64} height={52} alt="" className="h-13 w-16 object-contain" /><div><span className="font-display text-xl font-extrabold text-ocean-deep">HMV <span className="text-primary">GLOBAL</span></span><p className="mt-0.5 text-[10px] text-muted-foreground">{ui[lang].tagline}</p></div></Link>
      <nav aria-label="Main navigation" className="hidden items-center gap-8 text-xs font-medium lg:flex">{navigation}</nav>
      <div className="flex items-center gap-4">{switcher}<Button asChild className="hidden h-10 px-5 sm:inline-flex"><Link to="/$lang/contact" params={{ lang }} onClick={close}>{x.partner} <ArrowUpRight /></Link></Button><Button variant="ghost" size="icon" aria-label={menu ? t.close : t.open} aria-expanded={menu} onClick={() => setMenu(!menu)} className="lg:hidden">{menu ? <X /> : <Menu />}</Button></div>
    </div>
    {menu && <nav aria-label="Mobile navigation" className="grid gap-5 border-t border-border px-5 py-6 text-sm lg:hidden">{navigation}<Link to="/$lang/contact" params={{ lang }} onClick={close}>{t.contact}</Link><Button asChild><Link to="/$lang/contact" params={{ lang }} onClick={close}>{x.partner} <ArrowUpRight /></Link></Button></nav>}
  </header>;
}
