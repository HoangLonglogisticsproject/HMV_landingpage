import { useState, type FormEvent } from 'react';
import { ArrowUpRight, CheckCircle2, Loader2, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { products } from '@/lib/catalog';
import { rfqSchema } from '@/lib/rfq';

export function RfqForm() {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const fields = new FormData(form);
    if (fields.get('website')) return;
    const result = rfqSchema.safeParse(Object.fromEntries(fields));
    if (!result.success) { setError(result.error.issues[0]?.message ?? 'Please review your details.'); return; }
    setBusy(true); setError('');
    try {
      const { error: insertError } = await supabase.from('rfqs').insert(result.data);
      if (insertError) throw new Error(insertError.message.includes('limit') ? 'Submission limit reached. Please email our team.' : 'Your inquiry could not be saved. Please try again or email our team.');
      setDone(true); form.reset();
    } catch (err) { setError(err instanceof Error ? err.message : 'Please try again or email our team.'); }
    finally { setBusy(false); }
  }
  if (done) return <div className="py-14" role="status"><CheckCircle2 className="mb-5 size-10 text-leaf" /><h3 className="text-2xl font-semibold">Your inquiry has been received.</h3><p className="mt-3 text-muted-foreground">Thank you for contacting HMV Global. Your request has been saved for review by our trading team.</p><Button variant="outline" className="mt-7" onClick={() => setDone(false)}>Send another inquiry <ArrowUpRight /></Button></div>;
  return <form onSubmit={submit} className="grid gap-5">
    <div className="grid gap-5 sm:grid-cols-2"><label className="field-label">Full name *<input className="field" name="name" required minLength={2} maxLength={100} placeholder="Your full name" autoComplete="name" /></label><label className="field-label">Company *<input className="field" name="company" required minLength={2} maxLength={150} placeholder="Company name" autoComplete="organization" /></label></div>
    <label className="field-label">Business email *<input className="field" name="email" type="email" required maxLength={254} placeholder="you@company.com" autoComplete="email" /></label>
    <div className="grid gap-5 sm:grid-cols-2"><label className="field-label">Product of interest *<select className="field" name="product" required defaultValue=""><option value="" disabled>Select a commodity</option>{products.map(p => <option key={p.id}>{p.name}</option>)}<option>Other tropical commodities</option></select></label><label className="field-label">Estimated quantity *<input className="field" name="quantity" required maxLength={100} placeholder="e.g. 20 metric tonnes" /></label></div>
    <div className="grid gap-5 sm:grid-cols-2"><label className="field-label">Destination country / port *<input className="field" name="destination" required minLength={2} maxLength={150} placeholder="e.g. Rotterdam, Netherlands" /></label><label className="field-label">Preferred Incoterm<select className="field" name="incoterm" defaultValue="To be agreed">{['To be agreed','EXW','FCA','FOB','CFR','CIF','DAP'].map(x => <option key={x}>{x}</option>)}</select></label></div>
    <label className="field-label">Specifications & requirements<textarea className="field min-h-28 resize-y" name="requirements" maxLength={3000} placeholder="Product grade, packaging, target delivery date and quality requirements…" /></label>
    <label className="hidden" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
    <label className="flex items-start gap-3 text-xs leading-relaxed text-muted-foreground"><input type="checkbox" required className="mt-0.5 accent-primary" />I agree that HMV Global may use these details to respond to my sourcing inquiry. Details are stored privately and are not displayed publicly.</label>
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    <Button type="submit" disabled={busy} className="h-12 justify-between px-5">{busy ? 'Sending inquiry…' : 'Submit Request for Quotation'}{busy ? <Loader2 className="animate-spin" /> : <ArrowUpRight />}</Button>
    <a href="mailto:vannguyen@hmvglobal.com" className="flex items-center justify-center gap-2 text-xs text-muted-foreground"><Mail className="size-3.5" /> Prefer email? vannguyen@hmvglobal.com</a>
  </form>;
}