import { cn } from '@/lib/utils';

/** Vệt gradient xanh nghiêng phía sau chữ được nhấn mạnh. */
export function Highlight({ children, className }) {
  return <span className={cn('highlight', className)}>{children}</span>;
}
