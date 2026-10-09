import { z } from 'zod';
export const rfqSchema = z.object({
  name: z.string().trim().min(2, 'Please enter your full name.').max(100),
  company: z.string().trim().min(2, 'Please enter your company.').max(150),
  email: z.string().trim().email('Please enter a valid business email.').max(254),
  product: z.string().trim().min(2, 'Please select a product.').max(150),
  quantity: z.string().trim().min(1, 'Please provide the quantity.').max(100),
  destination: z.string().trim().min(2, 'Please enter your destination.').max(150),
  incoterm: z.enum(['To be agreed', 'EXW', 'FCA', 'FOB', 'CFR', 'CIF', 'DAP']),
  requirements: z.string().trim().max(3000),
});