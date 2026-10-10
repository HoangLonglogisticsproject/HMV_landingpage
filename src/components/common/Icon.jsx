import { cn } from '@/lib/utils';

/** Lấy icon từ sprite SVG trong /public/img/icons.svg. */
export function Icon({ name, className }) {
  return (
    <svg className={cn('size-[25px]', className)} aria-hidden="true">
      <use href={`/img/icons.svg#icon-${name}`} />
    </svg>
  );
}
