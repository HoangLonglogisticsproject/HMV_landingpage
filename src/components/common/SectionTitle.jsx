import { cn } from '@/lib/utils';

/** Cặp tiêu đề (mô tả nhỏ + tiêu đề lớn) lặp lại ở mọi section. */
export function SectionTitle({ description, title, className, headerClassName }) {
  return (
    <div className={cn('mx-auto mb-[80px] max-w-[800px]', className)}>
      {description && (
        <h2 className="text-brand mb-[10px] text-[18px] font-semibold uppercase">{description}</h2>
      )}
      <h3 className={cn('text-[40px] leading-[1.3] font-medium', headerClassName)}>{title}</h3>
    </div>
  );
}
