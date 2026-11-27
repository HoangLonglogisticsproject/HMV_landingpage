'use client';
import { Button } from '@/components/ui/button';
import { focusQuickRfq } from '@/features/inquiries/focus';

// A call to action that takes the buyer to the page's Quick RFQ (features/inquiries/focus.js); usable from server-rendered pages.
export function FocusRfqButton({ children, ...props }) {
  return (
    <Button type="button" onClick={focusQuickRfq} {...props}>
      {children}
    </Button>
  );
}
