"use client";

import { useState } from "react";
import Image from "next/image";
import { MaterialIcon } from "@/components/MaterialIcon";
import type { CreativeAsset } from "@/types/creative-asset";

interface AssetsTableProps {
  assets: CreativeAsset[];
  onPreviewAsset: (asset: CreativeAsset) => void;
  onDeleteAsset: (assetId: string) => void;
}

export function AssetsTable({
  assets,
  onPreviewAsset,
  onDeleteAsset,
}: AssetsTableProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleSelectAll = () => {
    if (selectedIds.length === assets.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(assets.map((a) => a.id));
    }
  };

  const toggleSelectRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  if (assets.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed border-epom-border p-8 text-center text-epom-muted">
        <MaterialIcon name="image" className="mb-2 text-[48px] text-epom-muted/60" />
        <p className="text-[14px] font-medium text-epom-text">No available data to show.</p>
        <p className="text-[12px]">Upload new images, videos, or HTML5 assets to get started.</p>
      </div>
    );
  }

  const allSelected = assets.length > 0 && selectedIds.length === assets.length;

  return (
    <div className="overflow-x-auto rounded-lg border border-epom-border bg-epom-surface shadow-xs">
      <table className="w-full text-left text-[14px] leading-5">
        <thead className="border-b border-epom-border bg-black/[0.02] text-[13px] font-semibold text-epom-muted uppercase tracking-wider">
          <tr>
            <th scope="col" className="w-10 px-4 py-3 text-center">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={toggleSelectAll}
                className="h-4 w-4 rounded border-epom-border text-epom-primary focus:ring-epom-primary"
              />
            </th>
            <th scope="col" className="w-16 px-4 py-3">
              Image
            </th>
            <th scope="col" className="px-4 py-3">
              Name
            </th>
            <th scope="col" className="w-20 px-4 py-3 text-center">
              Preview
            </th>
            <th scope="col" className="px-4 py-3">
              Dimensions
            </th>
            <th scope="col" className="px-4 py-3">
              File Size (KB)
            </th>
            <th scope="col" className="px-4 py-3">
              Type
            </th>
            <th scope="col" className="w-24 px-4 py-3 text-right">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-epom-border text-epom-text">
          {assets.map((asset) => {
            const isSelected = selectedIds.includes(asset.id);
            return (
              <tr
                key={asset.id}
                className={`group transition-colors hover:bg-black/[0.02] ${
                  isSelected ? "bg-epom-primary-12" : ""
                }`}
              >
                <td className="px-4 py-3 text-center">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelectRow(asset.id)}
                    className="h-4 w-4 rounded border-epom-border text-epom-primary focus:ring-epom-primary"
                  />
                </td>
                <td className="px-4 py-3">
                  <div
                    onClick={() => onPreviewAsset(asset)}
                    className="relative h-10 w-14 cursor-pointer overflow-hidden rounded border border-epom-border bg-gray-100 flex items-center justify-center group-hover:border-epom-primary transition-colors"
                  >
                    {asset.type === "MP4" ? (
                      <div className="relative h-full w-full flex items-center justify-center bg-black">
                        <video
                          src={asset.previewUrl}
                          muted
                          preload="metadata"
                          className="h-full w-full object-cover opacity-80"
                        />
                        <MaterialIcon
                          name="play_circle"
                          className="absolute text-[20px] text-white drop-shadow-md"
                        />
                      </div>
                    ) : asset.previewUrl ? (
                      <Image
                        src={asset.previewUrl}
                        alt={asset.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <MaterialIcon name="image" className="text-[20px] text-epom-muted" />
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 font-medium text-epom-text">
                  {asset.name}
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    type="button"
                    onClick={() => onPreviewAsset(asset)}
                    title="Preview Asset"
                    className="p-1 text-epom-muted hover:text-epom-primary transition-colors"
                  >
                    <MaterialIcon name="remove_red_eye" className="block text-[20px]" />
                  </button>
                </td>
                <td className="px-4 py-3 text-epom-muted">{asset.dimensions}</td>
                <td className="px-4 py-3 text-epom-muted">{asset.fileSizeKb}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[12px] font-semibold ${
                      asset.type === "MP4"
                        ? "bg-purple-100 text-purple-700"
                        : asset.type === "HTML5"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {asset.type}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => onDeleteAsset(asset.id)}
                      title="Delete asset"
                      className="p-1 text-epom-muted hover:text-red-600 transition-colors"
                    >
                      <MaterialIcon name="delete" className="block text-[18px]" />
                    </button>
                    <button
                      type="button"
                      title="More actions"
                      className="p-1 text-epom-muted hover:text-epom-text transition-colors"
                    >
                      <MaterialIcon name="more_horiz" className="block text-[18px]" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
