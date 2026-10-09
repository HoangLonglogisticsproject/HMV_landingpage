import { useState, type FormEvent } from 'react';
import { ArrowUpRight, CheckCircle2, Loader2, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { getProducts } from '@/lib/catalog';
import { ui, type Locale } from '@/lib/i18n';
import { rfqSchema } from '@/lib/rfq';

export function RfqForm({ locale = 'en' }: { locale?: Locale }) {
  const t = ui[locale].rfq;
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<null | Record<string, string>>(null);
  const [error, setError] = useState('');
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const fields = new FormData(form);
    if (fields.get('website')) return;
    const result = rfqSchema.safeParse(Object.fromEntries(fields));
    if (!result.success) { setError(locale === 'en' ? (result.error.issues[0]?.message ?? t.invalid) : t.invalid); return; }
    setBusy(true); setError('');
    try {
      const { error: insertError } = await supabase.from('rfqs').insert(result.data);
      if (insertError) throw new Error(insertError.message.includes('limit') ? t.limit : t.failed);
      setDone(Object.fromEntries(Object.entries(result.data).map(([k, v]) => [k, String(v)]))); form.reset();
    } catch (err) { setError(err instanceof Error ? err.message : t.failed); }
    finally { setBusy(false); }
  }
  if (done) return <div className="py-14" role="status"><CheckCircle2 className="mb-5 size-10 text-leaf" /><h3 className="text-2xl font-semibold">{t.doneTitle}</h3><p className="mt-3 text-muted-foreground">{t.doneText}</p><div className="mt-7 rounded-lg border border-border bg-secondary p-6"><p className="eyebrow text-primary">{t.summary}</p><table className="spec-table mt-3"><tbody>{([[t.company, done.company], [t.product, done.product], [t.format, t.formats[done.product_format ?? ''] ?? done.product_format], [t.quantity, done.quantity], [t.frequency, done.frequency], [t.destination, done.destination], [t.incoterm, done.incoterm === 'To be agreed' ? t.tba : done.incoterm], [t.documents, done.documents], [t.requirements, done.requirements]] as const).filter(([, v]) => v).map(([k, v]) => <tr key={k}><th scope="row">{k}</th><td>{v}</td></tr>)}</tbody></table><p className="mt-4 text-xs text-muted-foreground">{t.summaryNote}</p></div><Button variant="outline" className="mt-7" onClick={() => setDone(null)}>{t.again} <ArrowUpRight /></Button></div>;
  return <form onSubmit={submit} className="grid gap-5">
    <div className="grid gap-5 sm:grid-cols-2"><label className="field-label">{t.name} *<input className="field" name="name" required minLength={2} maxLength={100} placeholder={t.namePh} autoComplete="name" /></label><label className="field-label">{t.company} *<input className="field" name="company" required minLength={2} maxLength={150} placeholder={t.companyPh} autoComplete="organization" /></label></div>
    <label className="field-label">{t.email} *<input className="field" name="email" type="email" required maxLength={254} placeholder="you@company.com" autoComplete="email" /></label>
    <div className="grid gap-5 sm:grid-cols-2"><label className="field-label">{t.product} *<select className="field" name="product" required defaultValue=""><option value="" disabled>{t.select}</option>{getProducts(locale).map(p => <option key={p.id} value={p.nameEn}>{p.name}</option>)}<option value="Other tropical commodities">{t.otherProduct}</option></select></label><label className="field-label">{t.quantity} *<input className="field" name="quantity" required maxLength={100} placeholder={t.quantityPh} /></label></div>
    <div className="grid gap-5 sm:grid-cols-2"><label className="field-label">{t.format}<select className="field" name="product_format" defaultValue="To be discussed">{Object.entries(t.formats).map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label><label className="field-label">{t.frequency}<input className="field" name="frequency" maxLength={100} placeholder={t.frequencyPh} /></label></div>
    <div className="grid gap-5 sm:grid-cols-2"><label className="field-label">{t.destination} *<input className="field" name="destination" required minLength={2} maxLength={150} placeholder={t.destinationPh} /></label><label className="field-label">{t.incoterm}<select className="field" name="incoterm" defaultValue="To be agreed">{['To be agreed','EXW','FCA','FOB','CFR','CIF','DAP'].map(x => <option key={x} value={x}>{x === 'To be agreed' ? t.tba : x}</option>)}</select></label></div>
    <label className="field-label">{t.documents}<input className="field" name="documents" maxLength={1000} placeholder={t.documentsPh} /></label>
    <input type="hidden" name="locale" value={locale} />
    <label className="field-label">{t.requirements}<textarea className="field min-h-28 resize-y" name="requirements" maxLength={3000} placeholder={t.requirementsPh} /></label>
    <label className="hidden" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
    <label className="flex items-start gap-3 text-xs leading-relaxed text-muted-foreground"><input type="checkbox" required className="mt-0.5 accent-primary" />{t.consent}</label>
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    <Button type="submit" disabled={busy} className="h-12 justify-between px-5">{busy ? t.sending : t.submit}{busy ? <Loader2 className="animate-spin" /> : <ArrowUpRight />}</Button>
    <a href="mailto:vannguyen@hmvglobal.com" className="flex items-center justify-center gap-2 text-xs text-muted-foreground"><Mail className="size-3.5" /> {t.prefer} vannguyen@hmvglobal.com</a>
  </form>;
}