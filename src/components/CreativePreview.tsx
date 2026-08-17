"use client";

import { Dialog } from "@/components/form/Dialog";

export interface PreviewCreative {
  name: string;
  /**
   * Path under `public/creatives`, a Supabase Storage URL for the products kept
   * there, or empty when the asset was never uploaded.
   */
  src: string;
  video: boolean;
  size: string;
}

/**
 * The modal behind every creative's eye icon. Videos get native controls rather
 * than autoplay, since these are sound-on ads.
 */
export function CreativePreview({
  creative,
  onClose,
}: {
  creative: PreviewCreative;
  onClose: () => void;
}) {
  return (
    <Dialog title={creative.name} width="w-[520px]" onCancel={onClose} onApply={onClose}>
      <div className="flex flex-col items-center gap-3 px-6 py-4">
        {creative.src ? (
          creative.video ? (
            <video
              src={creative.src}
              controls
              playsInline
              className="max-h-[52vh] w-auto max-w-full rounded bg-black"
            />
          ) : (
            // Plain <img>: these are fixed local assets, so Next's optimizer adds
            // nothing but a build step.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={creative.src}
              alt={creative.name}
              className="max-h-[52vh] w-auto max-w-full rounded"
            />
          )
        ) : (
          <div className="py-10 text-[12px] leading-[18px] text-epom-muted">
            No preview available.
          </div>
        )}
        <div className="text-[12px] leading-[18px] text-epom-muted">{creative.size}</div>
      </div>
    </Dialog>
  );
}
