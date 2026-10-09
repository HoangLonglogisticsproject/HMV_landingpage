import { Link } from '@tanstack/react-router';
import { ArrowUpRight, ChevronDown, Leaf, Mail, MapPin, PackageCheck, Ship, Sprout, Handshake, Network, Compass } from 'lucide-react';
import { RfqForm } from '@/components/RfqForm';
import { getFaqs } from '@/lib/catalog';
import { ui, type Locale } from '@/lib/i18n';

type P = { locale: Locale; h1?: boolean };
const leaders = [['Mr. Ho Quang Minh', 'Chairman', 'minhho@hmvglobal.com'], ['Mr. Hieu Truong', 'Managing Director', 'hieutruong@hmvglobal.com'], ['Ms. Van Nguyen', 'General Manager', 'vannguyen@hmvglobal.com']] as const;

export function SupplySteps({ locale, h1 }: P) {
  const t = ui[locale].supply; const H = h1 ? 'h1' : 'h2';
  return <div className="journey-copy"><p className="eyebrow mb-4 text-primary">{t.eyebrow}</p><H className="section-heading">{t.title[0]}<br />{t.title[1]}</H><p className="mt-5 text-sm leading-7 text-muted-foreground">{t.intro}</p><ol className="mt-7 grid gap-5">{t.steps.map(([name, detail], i) => { const I = [Sprout, PackageCheck, Ship][i] ?? Leaf; return <li key={name} className="flex items-center gap-4"><span className="grid size-10 shrink-0 place-items-center rounded-md border border-border bg-background text-primary"><I className="size-5 stroke-[1.4]" /></span><div><h3 className="text-sm font-semibold"><span className="mr-2 text-[10px] text-primary">0{i + 1}</span>{name}</h3><p className="mt-1 text-[11px] text-muted-foreground">{detail}</p></div></li>; })}</ol><Link to="/$lang/contact" params={{ lang: locale }} className="mt-7 inline-flex items-center gap-2 text-xs font-semibold text-primary">{t.cta} <ArrowUpRight className="size-4" /></Link></div>;
}

export function Capabilities({ locale }: P) {
  const t = ui[locale].capabilities;
  return <section className="border-y border-border py-18"><div className="page-width"><p className="eyebrow mb-4 text-primary">{t.eyebrow}</p><h2 className="section-heading">{t.title}</h2><div className="mt-10 grid gap-6 md:grid-cols-3">{t.items.map(([title, text], i) => { const I = [Handshake, Network, Compass][i] ?? Leaf; return <div key={title} className="rounded-lg border border-border bg-card p-7"><I className="size-7 stroke-[1.4] text-primary" /><h3 className="mt-5 text-lg font-semibold">{title}</h3><p className="mt-3 text-sm leading-7 text-muted-foreground">{text}</p></div>; })}</div></div></section>;
}

export function AboutSection({ locale, h1 }: P) {
  const t = ui[locale].about; const H = h1 ? 'h1' : 'h2'; const roles = ui[locale].roles;
  return <section id="about" className="py-20"><div className="page-width grid gap-12 lg:grid-cols-2"><div><p className="eyebrow mb-4 text-primary">{t.eyebrow}</p><H className="section-heading">{t.title[0]}<br />{t.title[1]}</H><p className="mt-6 text-sm leading-7 text-muted-foreground">{t.p1}</p><p className="mt-4 text-sm leading-7 text-muted-foreground">{t.p2}</p><div className="mt-7 flex items-start gap-3 border-t border-border pt-6"><MapPin className="mt-1 size-5 shrink-0 text-primary" /><p className="text-xs leading-6 text-muted-foreground">Floor 5, 240 Nguyen Dinh Chinh St., Phu Nhuan Ward,<br />Ho Chi Minh City, Vietnam</p></div></div><div><p className="eyebrow mb-5 text-muted-foreground">{t.leadership}</p>{leaders.map(([name, role, email], i) => <div key={email} className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 border-b border-border py-6"><div className="min-w-0"><span className="text-[10px] text-primary">0{i + 1} / {roles[role]}</span><h3 className="mt-2 text-lg font-semibold">{name}</h3><a href={`mailto:${email}`} className="mt-2 block break-all text-xs text-muted-foreground hover:text-primary">{email}</a></div><a href={`mailto:${email}`} aria-label={`${t.email} ${name}`} className="grid size-9 place-items-center self-center rounded-full border border-border text-primary"><ArrowUpRight className="size-4" /></a></div>)}</div></div></section>;
}

export function FaqSection({ locale }: P) {
  const t = ui[locale].faq;
  return <section className="border-y border-border bg-muted py-16"><div className="page-width grid gap-9 lg:grid-cols-[0.8fr_1.2fr]"><div><p className="eyebrow mb-4 text-primary">{t.eyebrow}</p><h2 className="section-heading">{t.title[0]}<br />{t.title[1]}</h2></div><div>{getFaqs(locale).map(f => <details key={f.question} className="group border-b border-border py-5"><summary className="flex cursor-pointer list-none items-start justify-between gap-5 text-sm font-medium">{f.question}<ChevronDown className="size-4 shrink-0 text-primary transition-transform group-open:rotate-180" /></summary><p className="mt-4 text-sm leading-7 text-muted-foreground">{f.answer}</p></details>)}</div></div></section>;
}

export function RfqSection({ locale, h1 }: P) {
  const t = ui[locale].rfq; const H = h1 ? 'h1' : 'h2';
  return <section id="rfq" className="py-20"><div className="page-width grid gap-12 lg:grid-cols-[0.85fr_1.15fr]"><div><p className="eyebrow mb-4 text-primary">{t.eyebrow}</p><H className="section-heading">{t.title[0]}<br />{t.title[1]}</H><p className="mt-6 max-w-95 text-sm leading-7 text-muted-foreground">{t.intro}</p><div className="mt-9 border-t border-border pt-7"><p className="text-xs text-muted-foreground">{t.contact}</p><h3 className="mt-3 text-lg font-semibold">Ms. Van Nguyen</h3><p className="mt-1 text-xs text-muted-foreground">{ui[locale].roles['General Manager']}</p><a href="mailto:vannguyen@hmvglobal.com" className="mt-4 inline-flex items-center gap-2 text-sm text-primary"><Mail className="size-4" /> vannguyen@hmvglobal.com</a></div></div><div className="min-w-0"><h3 className="mb-7 text-xl font-semibold">{t.form} <span className="text-sm font-normal text-muted-foreground">/ RFQ</span></h3><RfqForm locale={locale} /></div></div></section>;
}

export function SiteFooter({ locale }: P) {
  const t = ui[locale].footer; const n = ui[locale].nav;
  return <footer className="bg-ocean-deep py-12 text-hero-foreground"><div className="page-width"><div className="grid gap-9 md:grid-cols-[1.4fr_1fr_1fr]"><div><p className="font-display text-2xl font-extrabold">HMV GLOBAL</p><p className="mt-2 text-xs text-hero-foreground/70">{ui[locale].tagline}</p><p className="mt-5 max-w-75 text-xs leading-6 text-hero-foreground/70">{t.lines.map(l => <span key={l} className="block">{l}</span>)}</p></div><div><p className="mb-5 text-xs font-semibold">{t.explore}</p><div className="grid gap-3 text-xs text-hero-foreground/70"><Link to="/$lang/products" params={{ lang: locale }}>{n.products}</Link><Link to="/$lang/supply-chain" params={{ lang: locale }}>{n.supply}</Link><Link to="/$lang/insights" params={{ lang: locale }}>{n.insights}</Link><Link to="/$lang/about" params={{ lang: locale }}>{n.about}</Link><Link to="/$lang/contact" params={{ lang: locale }}>{n.contact}</Link></div></div><div><p className="mb-5 text-xs font-semibold">{t.city}</p><p className="text-xs leading-6 text-hero-foreground/70">Floor 5, 240 Nguyen Dinh Chinh St.<br />Phu Nhuan Ward, Ho Chi Minh City</p><a href="mailto:vannguyen@hmvglobal.com" className="mt-4 block text-xs text-hero-foreground/70">vannguyen@hmvglobal.com</a></div></div><div className="mt-10 flex flex-wrap justify-between gap-4 border-t border-hero-foreground/20 pt-6 text-[10px] text-hero-foreground/60"><span>© 2026 HMV Global Co., LTD. {t.rights}</span><span>{t.terms}</span></div></div></footer>;
}
