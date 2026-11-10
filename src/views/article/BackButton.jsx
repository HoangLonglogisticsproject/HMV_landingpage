'use client';
import { Button } from '@/components/ui/button';
import { useGoBack } from '@/lib/navigation';

export function BackButton({ children }) {
  const back = useGoBack();
  return (
    <Button type="button" variant="ghost" className="article-back" onClick={back}>
      {children}
    </Button>
  );
}
