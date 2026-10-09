import { Link, useRouterState } from '@tanstack/react-router';
import { useState } from 'react';
import { ArrowUpRight, Globe2, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import logo from '@/assets/hmv-logo.jpg.asset.json';
import { localeFromPath, localeNames, locales, switchLocalePath, ui } from '@/lib/i18n';

export function SiteHeader() {
  const [menu, setMenu] = useState(false);
  const pathname = useRouterState({ select: s => s.location.pathname });
  const lang = localeFromPath(pathname);
  const t = ui[lang].nav;
  const close = () => setMenu(false);
  const navigation = <>
    <Link to="/$lang/products" params={{ lang }} onClick={close} activeProps={{ className: 'text-primary' }}>{t.products}</Link>
    <Link to="/$lang/supply-chain" params={{ lang }} onClick={close} activeProps={{ className: 'text-primary' }}>{t.supply}</Link>
    <Link to="/$lang/insights" params={{ lang }} onClick={close} activeProps={{ className: 'text-primary' }}>{t.insights}</Link>
    <Link to="/$lang/about" params={{ lang }} onClick={close} activeProps={{ className: 'text-primary' }}>{t.about}</Link>
  </>;
  // Plain links so crawlers and visitors can always reach each language; never auto-redirected by browser language or IP.
  const switcher = <div role="group" aria-label={t.language} className="flex items-center gap-1 text-xs"><Globe2 className="size-3.5 text-primary" />{locales.map(l => <a key={l} href={switchLocalePath(pathname, l)} hrefLang={l} lang={l} aria-label={localeNames[l]} aria-current={l === lang ? 'true' : undefined} onClick={close} className={`px-1 uppercase ${l === lang ? 'font-semibold text-primary' : 'text-muted-foreground hover:text-primary'}`}>{l}</a>)}</div>;
  return <header className="site-header sticky top-0 z-40 border-b border-border bg-background/95">
    <div className="page-width flex h-22 items-center justify-between gap-4">
      <Link to="/$lang" params={{ lang }} onClick={close} aria-label={t.home} className="flex min-w-0 items-center gap-2"><img src={logo.url} width={64} height={52} alt="" className="h-13 w-16 object-contain" /><div><span className="font-display text-xl font-extrabold text-ocean-deep">HMV <span className="text-primary">GLOBAL</span></span><p className="mt-0.5 text-[10px] text-muted-foreground">{ui[lang].tagline}</p></div></Link>
      <nav aria-label="Main navigation" className="hidden items-center gap-8 text-xs font-medium lg:flex">{navigation}</nav>
      <div className="flex items-center gap-4">{switcher}<Button asChild className="hidden h-10 px-5 sm:inline-flex"><Link to="/$lang/contact" params={{ lang }} onClick={close}>{t.trade} <ArrowUpRight /></Link></Button><Button variant="ghost" size="icon" aria-label={menu ? t.close : t.open} aria-expanded={menu} onClick={() => setMenu(!menu)} className="lg:hidden">{menu ? <X /> : <Menu />}</Button></div>
    </div>
    {menu && <nav aria-label="Mobile navigation" className="grid gap-5 border-t border-border px-5 py-6 text-sm lg:hidden">{navigation}<Link to="/$lang/contact" params={{ lang }} onClick={close}>{t.contact}</Link><Button asChild><Link to="/$lang/contact" params={{ lang }} onClick={close}>{t.trade} <ArrowUpRight /></Link></Button></nav>}
  </header>;
}
