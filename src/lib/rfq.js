export function toRfqRow(d, locale) {
  const v = (x, max) => String(x ?? '').trim().slice(0, max);
  const company = v(d.company, 150), email = v(d.email, 255).toLowerCase(), product = v(d.product, 120);
  if (!company || !product || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('invalid');
  return { name: company, company, email, product, quantity: v(d.volume, 100) || 'To be discussed', destination: v(d.port, 100) || 'To be discussed', incoterm: 'To be discussed', requirements: v(d.message, 3000), locale: locale === 'vi' ? 'vi' : 'en' };
}
