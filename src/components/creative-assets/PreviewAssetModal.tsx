"use client";

import Image from "next/image";
import { MaterialIcon } from "@/components/MaterialIcon";
import type { CreativeAsset } from "@/types/creative-asset";

interface PreviewAssetModalProps {
  asset: CreativeAsset | null;
  onClose: () => void;
}

export function PreviewAssetModal({ asset, onClose }: PreviewAssetModalProps) {
  if (!asset) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-epom-border bg-epom-surface shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-epom-border px-6 py-4">
          <div className="flex items-center gap-2">
            <MaterialIcon name="image" className="text-[24px] text-epom-primary" />
            <div>
              <h2 className="text-[16px] font-semibold text-epom-text">{asset.name}</h2>
              <p className="text-[12px] text-epom-muted">
                {asset.dimensions} • {asset.fileSizeKb} KB • {asset.type}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-epom-muted hover:text-epom-text"
          >
            <MaterialIcon name="close" className="text-[20px]" />
          </button>
        </div>

        {/* Media Preview Container */}
        <div className="relative flex flex-1 items-center justify-center bg-gray-900 p-6 min-h-[300px]">
          {asset.type === "MP4" ? (
            <video
              src={asset.previewUrl}
              controls
              autoPlay
              className="max-h-[60vh] max-w-full rounded"
            />
          ) : asset.previewUrl ? (
            <div className="relative h-[60vh] w-full max-w-full flex items-center justify-center">
              <Image
                src={asset.previewUrl}
                alt={asset.name}
                fill
                className="object-contain"
                unoptimized
              />
            </div>
          ) : (
            <div className="text-center text-white/60">
              <MaterialIcon name="broken_image" className="text-[48px]" />
              <p className="mt-2 text-[14px]">No preview available</p>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between border-t border-epom-border px-6 py-3 bg-gray-50 text-[13px] text-epom-muted">
          <span>Created date: {asset.createdAt}</span>
          <div className="flex gap-2">
            {asset.previewUrl && (
              <a
                href={asset.previewUrl}
                download={asset.name}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 rounded bg-epom-primary px-3 py-1.5 text-[13px] font-medium text-white hover:opacity-90"
              >
                <MaterialIcon name="file_download" className="text-[16px]" />
                Download
              </a>
            )}
            <button
              type="button"
              onClick={onClose}
              className="rounded border border-epom-border bg-white px-3 py-1.5 font-medium text-epom-text hover:bg-gray-100"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
