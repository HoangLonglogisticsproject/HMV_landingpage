// Optional follow-up after a sent inquiry: links that open WhatsApp, Zalo or email for the buyer to write to HMV.
// Nothing is sent automatically. Configured per deployment (`contactChannels` from the `@/lib/inquiry` port); an
// unset or malformed channel is left out rather than shown broken. Only the reference and the product (or goal) go
// into a link: never the buyer's email, phone, company or free-text requirements.

const WHATSAPP = /^\d{8,15}$/;
const ZALO = /^https:\/\/(oa\.)?zalo\.me\/[\w./-]+$/;
// A plain mailbox only: characters with a meaning in a URL (# ? & % / …) are refused, not escaped into a link that
// might address another mailbox.
const EMAIL = /^[A-Za-z0-9._+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)+$/;

/** Channel order: Zalo first for Vietnamese buyers; WhatsApp first otherwise, where Zalo is little used. */
const ORDER = { en: ['whatsapp', 'email'], vi: ['zalo', 'whatsapp', 'email'] };

const MESSAGE = {
  en: (reference, subject) => `Hello HMV, I submitted inquiry ${reference} regarding ${subject}.`,
  vi: (reference, subject) => `Xin chào HMV, tôi đã gửi yêu cầu ${reference} về ${subject}.`,
};

/**
 * @param {{ whatsapp?: string, zalo?: string, email?: string }} config
 * @param {{ lang: 'en' | 'vi', reference: string, subject: string }} inquiry `subject`: the product or goal name
 * @returns {{ id: 'whatsapp' | 'zalo' | 'email', href: string }[]} in display order; the first is the primary one
 */
export function followUpChannels(config, { lang, reference, subject }) {
  const message = MESSAGE[lang](reference, subject);
  const whatsapp = config.whatsapp?.replace(/[\s+().-]/g, '') ?? '';
  const zalo = config.zalo?.trim() ?? '';
  const email = config.email?.trim() ?? '';
  const hrefs = {
    whatsapp: WHATSAPP.test(whatsapp) && `https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`,
    zalo: ZALO.test(zalo) && zalo,
    email: EMAIL.test(email) && `mailto:${email}?subject=${encodeURIComponent(`${reference} — ${subject}`)}&body=${encodeURIComponent(message)}`,
  };
  return ORDER[lang].filter(id => hrefs[id]).map(id => ({ id, href: hrefs[id] }));
}
