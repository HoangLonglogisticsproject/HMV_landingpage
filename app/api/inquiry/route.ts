import { deliveryAdapterFromEnv } from '@/next/inquiry/adapters';
import { inquiryResponse } from '@/next/inquiry/http';
import { createInquiryService } from '@/next/inquiry/service';

// HMV Trade Desk inquiries: JSON body (src/features/trade-desk/brief.js toInquiry) → validation → inquiry service →
// delivery adapter (src/next/inquiry). Responses: src/next/inquiry/http.js.
const submit = createInquiryService({ adapter: deliveryAdapterFromEnv(process.env) });

export const POST = (request: Request) => inquiryResponse(request, submit);
