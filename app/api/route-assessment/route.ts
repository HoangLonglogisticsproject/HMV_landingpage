import { deliveryAdapterFromEnv } from '@/next/inquiry/adapters';
import { inquiryResponse } from '@/next/inquiry/http';
import { createRouteAssessmentService } from '@/next/inquiry/route-assessment';

// Vietnam–Cambodia consolidation route assessments (views/consolidation/RouteAssessmentForm): JSON body → validation
// (src/features/route-assessment/validation.js) → inquiry service → the Trade Desk's delivery adapter, unless that is the
// CMS (src/next/inquiry/route-assessment.js). Responses: src/next/inquiry/http.js.
const submit = createRouteAssessmentService(deliveryAdapterFromEnv(process.env));

export const POST = (request: Request) => inquiryResponse(request, submit);
