'use client';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { Dialog } from 'radix-ui';
import { X } from 'lucide-react';
import logo from '@/assets/logohmv.webp';
import Image from '@/lib/image';
import { Button } from '@/components/ui/button';
import { productById, recognizeProduct } from './rules';
import { track } from '@/lib/analytics';
import { contactChannels, sendInquiry } from '@/lib/inquiry';
import { createInquiryMailto } from '@/features/inquiries/inquiry';
import { emptyBrief, fieldId, routeOf, stageOf, summarize, toInquiry } from './brief';
import { contactErrors, validateInquiry } from './validation';
import { inquiryFingerprint } from './fingerprint';
import { detectLanguage } from './language';
import { deskCopy } from './copy';
import { visitContext } from './visit';
import { followUpChannels } from './channels';
import {
  ContactForm, DestinationComposer, ProductComposer, RequirementPanel, RouteAction, SentCard, Thread, VolumeComposer,
} from './DeskChat';

// HMV Trade Desk: an inbound B2B sales conversation. HMV asks three things, product, destination and volume, then
// routes the buyer: a ready requirement to HMV Sales for quotation, one still being explored to HMV Customer Service.
// Contact details are asked last, inline, and the inquiry goes to POST /api/inquiry, never to analytics. Deterministic:
// no generated text. Loaded and mounted by TradeDeskHost on the first openTradeDesk(); each call arrives as a new
// `request`.

// The contact card's fields in screen order: the first one with an error is focused.
const CONTACT_ORDER = ['contact.company', 'contact.name', 'contact.email', 'contact.phone', 'consent.contact'];
const LANGUAGES = [['en', 'EN', 'English'], ['vi', 'VI', 'Tiếng Việt']];
/** POST /api/inquiry accepted the inquiry: 201 with the reference the CMS issued. */
const isAccepted = ({ status, body }) => status === 201 && typeof body.reference === 'string';
// randomUUID needs a secure context; getRandomValues does not (plain-http previews).
const newKey = () => crypto.randomUUID?.() ?? Array.from(crypto.getRandomValues(new Uint8Array(16)), b => b.toString(16).padStart(2, '0')).join('');
const emptyContact = () => ({ company: '', email: '', name: '', phone: '' });

/** @param {{ lang: 'en' | 'vi', request: { product?: string, source?: string } }} props `lang`: the site's language */
export function TradeDesk({ lang: siteLang, request }) {
  const uid = useId().replaceAll(':', '');
  const [open, setOpen] = useState(false);
  // The desk's language: the buyer's own choice (EN | VI) stands until they change it; otherwise the language their
  // messages are written in; otherwise the site's.
  const [chosenLang, setChosenLang] = useState(/** @type {'en' | 'vi' | null} */ (null));
  const [writtenLang, setWrittenLang] = useState(/** @type {'en' | 'vi' | null} */ (null));
  const lang = chosenLang ?? writtenLang ?? siteLang;
  const t = deskCopy[lang];
  const [brief, setBrief] = useState(() => emptyBrief());
  // Opened with the product known (a product page): the conversation starts at the destination.
  const [preselected, setPreselected] = useState(false);
  // What the buyer typed for a product that named none (or several) of HMV's.
  const [unclear, setUnclear] = useState(/** @type {string[]} */ ([]));
  const [exploring, setExploring] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [contact, setContact] = useState(emptyContact);
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState('');
  const [status, setStatus] = useState('idle');
  const [fieldErrors, setFieldErrors] = useState(/** @type {string[]} */ ([]));
  const [reference, setReference] = useState('');
  // Whether the buyer has seen the accepted result: it is kept, and shown on the next open, until they have.
  const [acknowledged, setAcknowledged] = useState(false);
  // Counts the conversations of this desk: a response to an earlier one never changes the current one.
  const [generation, setGeneration] = useState(0);
  // The last submission of this conversation: its content fingerprint and idempotency key. An exact retry reuses the
  // key; a changed inquiry gets a new one, so a key always stands for one exact inquiry.
  const [submission, setSubmission] = useState(/** @type {{ fingerprint: string, key: string } | null} */ (null));
  // The last open request acted on (null before the first).
  const [handled, setHandled] = useState(/** @type {object | null} */ (null));
  // The generation whose submission is in flight: one request at a time per conversation.
  const inFlight = useRef(-1);
  const sentHeading = useRef(null);

  // A new conversation. Consent is given per inquiry, so it is asked again; after a sent inquiry the contact is
  // cleared too. The buyer's own language choice stays.
  const startConversation = ({ product = null } = {}) => {
    if (reference) {
      setContact(emptyContact());
      setWebsite('');
    }
    setConsent(false);
    const known = productById(product) ? product : null;
    setBrief(emptyBrief({ product: known }));
    setPreselected(Boolean(known));
    setUnclear([]);
    setExploring(false);
    setContactOpen(false);
    setWrittenLang(null);
    setReference('');
    setAcknowledged(false);
    setStatus('idle');
    setFieldErrors([]);
    setSubmission(null);
    setGeneration(g => g + 1);
  };

  // Each open request (a new object from TradeDeskHost, which also counts it in analytics) opens the desk: a new
  // conversation after a sent inquiry the buyer has seen, or when opened for another product; otherwise the
  // conversation is kept. An acceptance the buyer has not seen yet (it arrived while the desk was closed) is shown.
  if (request !== handled) {
    setHandled(request);
    const { product = null } = request;
    const fresh = reference ? acknowledged : Boolean(productById(product)) && product !== brief.product;
    if (fresh) startConversation({ product });
    setOpen(true);
  }
  const openChange = next => {
    setOpen(next);
    if (!next && reference) setAcknowledged(true);
  };

  const stage = stageOf(brief, { exploring });
  const route = routeOf(brief);
  const facts = { product: brief.product ?? undefined };

  // Focus follows the conversation: the control that answers HMV's question, the route's action, the contact card's
  // first field, or the result. Focusing it also scrolls it, under the newest message, into view. On open, in place of
  // the dialog's own first-control focus (the desk's content mounts after this component's effects); and for a new
  // conversation while the desk is open, whose controls replace the previous ones even at the same question.
  const control = contactOpen ? 'contact.company' : stage;
  const focusTarget = useCallback(
    () => (reference ? sentHeading.current : document.getElementById(fieldId(uid, control))),
    [reference, uid, control],
  );
  useEffect(() => {
    if (open) focusTarget()?.focus();
  }, [open, focusTarget, generation]);
  const focusOnOpen = event => {
    const target = focusTarget();
    if (!target) return;
    event.preventDefault();
    target.focus();
  };

  // The control to focus once the screen is updated: an edited answer's question (its button is gone by then), or a
  // contact field the server refused (its answer arrives while the card is still locked).
  const pendingFocus = useRef(null);
  useEffect(() => {
    if (!pendingFocus.current) return;
    document.getElementById(fieldId(uid, pendingFocus.current))?.focus();
    pendingFocus.current = null;
  });

  /** Learns the buyer's language from what they wrote, when it is clear evidence (never a place name or a number). */
  const listen = text => {
    const written = detectLanguage(text);
    if (written) setWrittenLang(written);
  };
  // A product (also after an edit): the destination stays; the volume starts over in the product's usual unit, so an
  // amount is never read in another product's unit.
  const chooseProduct = (product, words = '') => {
    setBrief(b => ({ ...emptyBrief({ product, notes: words }), destination: b.destination }));
    track('trade_product_selected', { product, source: 'chosen' });
  };
  const answerProduct = words => {
    listen(words);
    const product = recognizeProduct(words);
    if (product) chooseProduct(product, words);
    else setUnclear(u => [...u, words]);
  };
  const answerDestination = destination => {
    listen(destination);
    setBrief(b => ({ ...b, destination }));
    track('trade_destination_completed', facts);
  };
  // The third answer: product, destination and volume are known, so the requirement is ready for quotation.
  const answerVolume = volume => {
    setBrief(b => ({ ...b, volume }));
    track('trade_volume_completed', facts);
    track('trade_route_rfq', facts);
  };
  const explore = () => {
    setExploring(true);
    track('trade_route_discovery', facts);
  };
  // Counted once per conversation, however often the card reopens after an edit.
  const contactStarted = useRef(-1);
  const openContact = () => {
    setContactOpen(true);
    if (contactStarted.current === generation) return;
    contactStarted.current = generation;
    track('trade_contact_start', { ...facts, route });
  };

  /**
   * Corrects one answer from the requirement panel: that question is asked again and the other answers stay, except
   * that a new product also clears the volume (its unit follows the product). The contact card closes until the
   * requirement is settled again, its values kept; the next send of a changed inquiry gets a new idempotency key. A
   * sent inquiry is never edited (the panel offers no edit then).
   */
  const edit = key => {
    const next = {
      product: { ...emptyBrief(), destination: brief.destination },
      destination: { ...brief, destination: '' },
      volume: { ...brief, volume: { ...brief.volume, amount: '' } },
    }[key];
    setBrief(next);
    if (key === 'product') {
      setPreselected(false);
      setUnclear([]);
    }
    setExploring(false);
    setContactOpen(false);
    setPanelOpen(false);
    setStatus('idle');
    pendingFocus.current = stageOf(next, { exploring: false });
  };

  const product = productById(brief.product);
  // The product name, never the buyer's free text: it goes into the follow-up links.
  const channels = reference ? followUpChannels(contactChannels, { lang, reference, subject: product?.[lang] }) : [];

  // The conversation on screen, for responses that arrive later: one for an earlier conversation changes nothing.
  const live = useRef(generation);
  useEffect(() => {
    live.current = generation;
  });

  /** Contact errors (from the validation, here or the server's): shown on their fields, the first one focused. */
  const showErrors = fields => {
    const own = CONTACT_ORDER.filter(f => fields.includes(f));
    setFieldErrors(own);
    if (!own.length) return false;
    pendingFocus.current = own[0];
    return true;
  };

  /** The inquiry as it would be sent now and its fingerprint: an exact retry keeps the key, any change takes a new one. */
  const prepare = () => {
    const draft = toInquiry(brief, { contact, consent, locale: lang, context: visitContext(), website });
    const fingerprint = inquiryFingerprint(draft);
    const key = submission?.fingerprint === fingerprint ? submission.key : newKey();
    return { inquiry: { ...draft, idempotencyKey: key }, fingerprint };
  };

  /** A response for the conversation still on screen: its reference, the field errors to correct, or the failure. */
  const settle = (response, accepted) => {
    if (accepted) {
      setReference(response.body.reference);
      setAcknowledged(false);
      setStatus('idle');
      return;
    }
    // 409: this key was used for other content; the next attempt takes a new one.
    if (response.status === 409) setSubmission(null);
    setStatus(response.status === 400 && showErrors(response.body.fields ?? []) ? 'idle' : 'failed');
  };

  /** Sends a validated inquiry of conversation `sent.generation`: an accepted lead is counted, only that one updated. */
  async function deliver(inquiry, sent) {
    inFlight.current = sent.generation;
    setStatus('sending');
    try {
      const response = await sendInquiry(inquiry);
      const accepted = isAccepted(response);
      if (accepted) track('generate_lead', { ...sent.facts, locale: inquiry.locale, route: sent.route });
      if (live.current === sent.generation) settle(response, accepted);
    } catch {
      if (live.current === sent.generation) setStatus('failed');
    } finally {
      if (inFlight.current === sent.generation) inFlight.current = -1;
    }
  }

  async function send(event) {
    event.preventDefault();
    if (inFlight.current === generation) return;
    const { inquiry, fingerprint } = prepare();
    const check = validateInquiry(inquiry);
    if (!check.ok) {
      if (!showErrors(check.errors)) setStatus('failed');
      return;
    }
    setFieldErrors([]);
    setSubmission({ fingerprint, key: inquiry.idempotencyKey });
    // While it is sent the conversation cannot change (its controls are locked); a new one can be started.
    await deliver(inquiry, { generation, facts, route });
  }

  // The fallback when the API cannot take the inquiry: the same requirement as an email draft.
  const mailto = () => {
    const en = summarize(brief, 'en');
    window.location.assign(createInquiryMailto({ ...contact, product: en.product, destination: en.destination, volume: en.volume, message: brief.notes }));
  };

  // A field with an error that the buyer corrects loses it at once, checked by the send's rules; an untouched or still
  // invalid field keeps its state, so no message appears before a send.
  const clearIfCorrected = (field, errorsNow) => {
    if (fieldErrors.includes(field) && !errorsNow().includes(field)) setFieldErrors(errors => errors.filter(f => f !== field));
  };
  const changeContact = (name, value) => {
    const next = { ...contact, [name]: value };
    setContact(next);
    clearIfCorrected(`contact.${name}`, () => contactErrors(next, consent));
  };
  const changeConsent = checked => {
    setConsent(checked);
    clearIfCorrected('consent.contact', () => contactErrors(contact, checked));
  };
  /** The message for a contact field with an error, or null. */
  const errorFor = name => (fieldErrors.includes(name) ? t.errors[name] : null);

  return (
    <Dialog.Root open={open} onOpenChange={openChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="desk-overlay" />
        <Dialog.Content className="desk" aria-describedby={`${uid}-description`} lang={lang} onOpenAutoFocus={focusOnOpen}>
          <header className="desk-head">
            <Image className="desk-logo" src={logo} alt="HMV Global" width={1536} height={1024} sizes="72px" />
            <div className="desk-brand">
              <Dialog.Title className="desk-title">{t.deskName}</Dialog.Title>
              <Dialog.Description id={`${uid}-description`} className="desk-description">{t.description}</Dialog.Description>
            </div>
            <fieldset className="desk-lang">
              <legend className="sr-only">{t.language}</legend>
              {LANGUAGES.map(([code, short, name]) => (
                <button key={code} type="button" lang={code} aria-label={name} aria-pressed={lang === code} onClick={() => setChosenLang(code)}>
                  {short}
                </button>
              ))}
            </fieldset>
            <Dialog.Close className="desk-close" aria-label={t.close}>
              <X size={20} />
            </Dialog.Close>
          </header>

          <div className="desk-body">
            <RequirementPanel
              t={t}
              lang={lang}
              brief={brief}
              route={route}
              open={panelOpen}
              onToggle={() => setPanelOpen(o => !o)}
              onEdit={reference ? null : edit}
              locked={status === 'sending'}
            />
            <div className="desk-main">
              <Thread t={t} lang={lang} brief={brief} preselected={preselected} unclear={unclear} exploring={exploring} />
              {reference ? (
                <SentCard t={t} route={route} reference={reference} channels={channels} heading={sentHeading}>
                  <div className="desk-sent-actions">
                    <Dialog.Close asChild>
                      <Button type="button" size="lg" className="day-cta">{t.done}</Button>
                    </Dialog.Close>
                    <button type="button" className="text-link" onClick={() => startConversation(handled ?? {})}>{t.newInquiry}</button>
                  </div>
                </SentCard>
              ) : (
                // Keyed by the conversation: a new one never inherits an unsent draft from a composer at the same question.
                <fieldset key={generation} className="desk-lock" disabled={status === 'sending'}>
                  {stage === 'product' && <ProductComposer uid={uid} t={t} lang={lang} onAnswer={answerProduct} onChoose={chooseProduct} />}
                  {stage === 'destination' && <DestinationComposer uid={uid} t={t} onAnswer={answerDestination} onExplore={explore} />}
                  {stage === 'volume' && <VolumeComposer uid={uid} t={t} lang={lang} unit={brief.volume.unit} onAnswer={answerVolume} onExplore={explore} />}
                  {stage === 'decision' && !contactOpen && <RouteAction uid={uid} t={t} route={route} onClick={openContact} />}
                  {contactOpen && (
                    <ContactForm
                      uid={uid}
                      lang={lang}
                      t={t}
                      route={route}
                      contact={contact}
                      onContactChange={changeContact}
                      consent={consent}
                      onConsentChange={changeConsent}
                      website={website}
                      setWebsite={setWebsite}
                      status={status}
                      errorFor={errorFor}
                      onSubmit={send}
                      onMailto={mailto}
                    />
                  )}
                </fieldset>
              )}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
