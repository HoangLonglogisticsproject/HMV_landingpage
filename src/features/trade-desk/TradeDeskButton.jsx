'use client';
import { Button } from '@/components/ui/button';
import { openTradeDesk } from './open';

// A call to action that opens the HMV Trade Desk; usable from server-rendered pages.
export function TradeDeskButton({ product, goal, source, children, ...props }) {
  return (
    <Button type="button" {...props} onClick={() => openTradeDesk({ product, goal, source })}>
      {children}
    </Button>
  );
}
