import { Link } from '@tanstack/react-router';
import { useState } from 'react';
import { ArrowUpRight, Globe2, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import logo from '@/assets/hmv-logo.jpg.asset.json';

export function SiteHeader() {
  const [menu, setMenu] = useState(false);
  const close = () => setMenu(false);
  const navigation = <><Link to="/" hash="commodities" onClick={close}>Commodities</Link><Link to="/" hash="supply-chain" onClick={close}>Our Approach</Link><Link to="/insights" onClick={close}>Perspectives</Link><Link to="/" hash="about" onClick={close}>About HMV</Link></>;
  return <header className="site-header sticky top-0 z-40 border-b border-border bg-background/95">
    <div className="page-width flex h-22 items-center justify-between gap-4">
      <Link to="/" onClick={close} aria-label="HMV Global home" className="flex min-w-0 items-center gap-2"><img src={logo.url} width={64} height={52} alt="" className="h-13 w-16 object-contain" /><div><span className="font-display text-xl font-extrabold text-ocean-deep">HMV <span className="text-primary">GLOBAL</span></span><p className="mt-0.5 text-[10px] text-muted-foreground">Connecting the world</p></div></Link>
      <nav aria-label="Main navigation" className="hidden items-center gap-8 text-xs font-medium lg:flex">{navigation}</nav>
      <div className="flex items-center gap-5"><span className="hidden items-center gap-1 text-xs sm:flex"><Globe2 className="size-3.5 text-primary" /> EN</span><Button asChild className="hidden h-10 px-5 sm:inline-flex"><Link to="/" hash="rfq" onClick={close}>Let's Trade <ArrowUpRight /></Link></Button><Button variant="ghost" size="icon" aria-label={menu ? 'Close navigation' : 'Open navigation'} aria-expanded={menu} onClick={() => setMenu(!menu)} className="lg:hidden">{menu ? <X /> : <Menu />}</Button></div>
    </div>
    {menu && <nav aria-label="Mobile navigation" className="grid gap-5 border-t border-border px-5 py-6 text-sm lg:hidden">{navigation}<Button asChild><Link to="/" hash="rfq" onClick={close}>Let's Trade <ArrowUpRight /></Link></Button></nav>}
  </header>;
}