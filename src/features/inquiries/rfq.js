// A non-empty local part, one @, a dot inside the domain, no whitespace: what /^[^\s@]+@[^\s@]+\.[^\s@]+$/ accepted,
// in linear time (that pattern backtracks super-linearly).
export function isEmail(s) {
  const [local, domain, ...rest] = s.split('@');
  return rest.length === 0 && domain !== undefined && local !== '' && !/\s/.test(s) && domain.slice(1, -1).includes('.');
}

export function toRfqRow(d, locale) {
  const v = (x, max) => String(x ?? '').trim().slice(0, max);
  const company = v(d.company, 150), email = v(d.email, 255).toLowerCase(), product = v(d.product, 120);
  if (company.length < 2 || !product || !isEmail(email)) throw new Error('invalid');
  return { name: company.slice(0, 100), company, email, product, quantity: v(d.volume, 100) || 'To be discussed', destination: v(d.port, 100) || 'To be discussed', incoterm: v(d.incoterm, 40) || 'To be agreed', requirements: v(d.message, 3000), locale: locale === 'vi' ? 'vi' : 'en' };
}
