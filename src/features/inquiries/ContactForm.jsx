'use client';
import { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSearchParams } from '@/lib/navigation';
import { copy, products } from '@/data/hmv';
import { createInquiryMailto } from './inquiry';

// The inquiry form. `product` preselects the product (from `?product=`, see ContactFormFromUrl).
export function ContactForm({ lang, product = '' }) {
  const t = copy[lang];
  const vi = lang === 'vi';
  const [prepared, setPrepared] = useState(false);
  const submit = e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    window.location.href = createInquiryMailto(data);
    setPrepared(true);
  };
  return (
    <form onSubmit={submit} className="inquiry-form">
      <div className="form-grid">
        {[
          { key: 'name', label: t.name, type: 'text' },
          { key: 'email', label: t.email, type: 'email' },
          { key: 'company', label: t.company, type: 'text' },
          { key: 'destination', label: t.destination, type: 'text' },
        ].map(f => (
          <label key={f.key}>
            {f.label}
            <input
              name={f.key}
              type={f.type}
              required
              maxLength={200}
              autoComplete={
                f.key === 'name'
                  ? 'name'
                  : f.key === 'email'
                    ? 'email'
                    : f.key === 'company'
                      ? 'organization'
                      : 'off'
              }
            />
          </label>
        ))}
      </div>
      <label>
        {t.product}
        <select name="product" defaultValue={product} required>
          <option value="">{t.select}</option>
          {products.map(p => (
            <option key={p.id} value={p.en}>
              {p[lang]}
            </option>
          ))}
          <option value="Wind Energy">
            {vi ? 'Dự án Điện gió' : 'Wind Energy Project'}
          </option>
          <option value="Logistics">
            {vi
              ? 'Giải pháp Logistics / Vận chuyển'
              : 'Logistics & Freight Solutions'}
          </option>
        </select>
      </label>
      <label>
        {t.message}
        <textarea name="message" rows={5} required maxLength={5000} />
      </label>
      <Button variant="brand" size="lg" type="submit">
        {t.emailAction}
        <ArrowUpRight />
      </Button>
      <p className="form-note">{t.emailNote}</p>
      {prepared && <p role="status">{t.draftReady}</p>}
    </form>
  );
}

// Reads `?product=` with an unconditional hook. Render it inside <Suspense> (Contact.jsx): a statically
// prerendered Next.js page renders the fallback on the server, and this component on the client.
export function ContactFormFromUrl({ lang }) {
  const params = useSearchParams();
  return <ContactForm lang={lang} product={params.get('product') || ''} />;
}
