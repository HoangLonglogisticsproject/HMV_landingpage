'use client';
import { X } from 'lucide-react';
import { LightboxPreview, PreviewDialog } from '@/components/common/Lightbox';
import Image from '@/lib/image';

// The analysis report opened from the quality evidence (views/products/CassavaProcurement Quality), in the native modal
// dialog of components/common/Lightbox: its pages one below the other at the width of the screen, readable and
// zoomable on a phone, the dialog scrolling under its title and close button. Images only, nothing to download; the
// page HTML carries none of it until the button is pressed.
export function QualityReportPreview({ closeLabel }) {
  return (
    <LightboxPreview>
      {(report, close) => (
        <PreviewDialog
          key={report.title}
          className="fixed inset-0 m-0 size-full max-h-none max-w-none overflow-y-auto overscroll-contain border-0 bg-[rgb(0_18_51/0.92)] p-0 backdrop:bg-transparent"
          label={report.title}
          close={close}
        >
          <div className="sticky top-0 z-10 flex items-center justify-between gap-3 bg-navy px-4 py-3 text-white sm:px-6">
            <p className="min-w-0 text-sm leading-snug font-semibold">{report.title}</p>
            <button
              type="button"
              onClick={close}
              aria-label={closeLabel}
              className="flex size-10 shrink-0 items-center justify-center rounded-full border border-[#8aa3cf] bg-navy hover:bg-[#0a3a8a] focus-visible:outline-2 focus-visible:outline-white"
            >
              <X className="size-5" aria-hidden="true" />
            </button>
          </div>
          <div className="mx-auto flex w-full max-w-[880px] flex-col gap-4 px-3 py-4 sm:px-6 sm:py-6">
            {report.pages.map((p, i) => (
              <Image
                key={p.src}
                src={p.src}
                width={p.width}
                height={p.height}
                sizes="(max-width: 880px) 100vw, 880px"
                loading={i ? 'lazy' : undefined}
                alt={p.alt}
                className="h-auto w-full rounded-md bg-white"
              />
            ))}
            <p className="text-center text-xs leading-relaxed text-white/75">{report.note}</p>
          </div>
        </PreviewDialog>
      )}
    </LightboxPreview>
  );
}
