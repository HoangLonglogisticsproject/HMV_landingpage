import { SERVICE, validateRouteAssessment } from '@/features/route-assessment/validation';
import { createInquiryService } from './service';

// Vietnam–Cambodia consolidation route assessments behind POST /api/route-assessment: the inquiry service with the route
// assessment's validation and record, through the delivery adapter the Trade Desk uses (no new configuration).

/**
 * The record a delivery adapter receives, in the shape of a Trade Desk record (service.js toRecord), so the webhook
 * keeps one format: `product` names the service where a commodity inquiry names its product, the cargo and the
 * frequency are labelled requirements, and `source` adds the call to action (`cta`) to the visit context. `service`
 * says the same explicitly; n8n routes on `service.id` to the Consol pipeline and its own sheet
 * (docs/inbound/TRADE_DESK_DELIVERY.md).
 */
export function routeAssessmentRecord(value, { reference, createdAt }) {
  const requirements = [
    { key: 'cargo', label: 'Cargo description', value: value.cargo },
    { key: 'frequency', label: 'Expected frequency', value: value.frequency },
  ].filter(r => r.value);
  return {
    reference,
    createdAt,
    locale: value.locale,
    product: { id: SERVICE.id, name: SERVICE.name },
    service: { id: SERVICE.id, name: SERVICE.name },
    origin: value.origin,
    destination: value.destination,
    volume: value.volume,
    application: '',
    transport: '',
    requirements,
    notes: value.notes,
    contact: value.contact,
    source: { ...value.context, cta: value.source },
    // Submitting requires the contact-consent checkbox: its timestamp is the submission's.
    consent: { contactAcceptedAt: createdAt },
  };
}

/**
 * The route-assessment service for `adapter` (deliveryAdapterFromEnv). The CMS ingestion contract takes commodity
 * inquiries only, so with the CMS adapter a route assessment is not accepted (503): the form then offers the email draft,
 * and nothing is lost silently. The webhook and the local log adapter take it.
 */
export const createRouteAssessmentService = (adapter, options = {}) =>
  createInquiryService({ ...options, adapter: adapter?.name === 'cms' ? null : adapter, validate: validateRouteAssessment, record: routeAssessmentRecord });
