import { describe, it, expect } from 'vitest';
import { rfqSchema } from '../lib/rfq';
const valid = { name: 'Jane Buyer', company: 'International Foods', email: 'jane@example.com', product: 'Passion Fruit', quantity: '20 tonnes', destination: 'Rotterdam', incoterm: 'FOB', requirements: '' };
describe('International RFQ validation', () => {
 it('accepts a complete international buyer inquiry', () => expect(rfqSchema.safeParse(valid).success).toBe(true));
 it('rejects an invalid contact email', () => expect(rfqSchema.safeParse({ ...valid, email: 'not-an-email' }).success).toBe(false));
 it('requires a destination for quotation', () => expect(rfqSchema.safeParse({ ...valid, destination: '' }).success).toBe(false));
 it('restricts Incoterms to supported quotation options', () => expect(rfqSchema.safeParse({ ...valid, incoterm: 'INVALID' }).success).toBe(false));
});