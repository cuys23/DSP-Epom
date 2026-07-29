"use client";

import Image from "next/image";
import { MaterialIcon } from "@/components/MaterialIcon";
import type { CreativeAsset } from "@/types/creative-asset";

interface AssetsTableProps {
  assets: CreativeAsset[];
  onPreviewAsset: (asset: CreativeAsset) => void;
  onDeleteAsset: (assetId: string) => void;
}

/**
 * `.table.table-component.middle` — same chrome as the campaigns and audience
 * tables. The live markup carries an empty `select-th` column (padding 0,
 * no checkbox); it renders nothing, so it is not reproduced.
 */
export function AssetsTable({ assets, onPreviewAsset, onDeleteAsset }: AssetsTableProps) {
  return (
    <div className="overflow-x-auto rounded-[3px] border border-epom-border bg-epom-surface">
      <table className="w-full min-w-full border-collapse">
        <thead>
          <tr>
            <Head>Image</Head>
            <Head>Name</Head>
            <Head>Preview</Head>
            <Head>Dimensions</Head>
            <Head>File Size (KB)</Head>
            <Head>Type</Head>
            <th className="bg-[#e1e2ec] px-4 py-2" />
          </tr>
        </thead>
        <tbody>
          {assets.map((asset) => (
            <tr key={asset.id} className="group text-epom-text">
              <Cell>
                <span className="block h-14 w-14">
                  {asset.type === "MP4" ? (
                    <video
                      src={asset.previewUrl}
                      muted
                      preload="metadata"
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <Image
                      src={asset.previewUrl}
                      alt=""
                      width={56}
                      height={56}
                      className="h-full w-full object-contain"
                      unoptimized
                    />
                  )}
                </span>
              </Cell>
              <Cell>{asset.name}</Cell>
              <Cell>
                <RowAction
                  icon="remove_red_eye"
                  label="Preview"
                  onClick={() => onPreviewAsset(asset)}
                />
              </Cell>
              <Cell>{asset.dimensions}</Cell>
              <Cell>{asset.fileSizeKb}</Cell>
              <Cell>{asset.type}</Cell>
              <td className="px-4 py-4 text-right align-middle transition-colors group-hover:bg-[#fafafa]">
                <ul className="flex items-center justify-end">
                  <RowAction
                    icon="delete"
                    label="Delete"
                    onClick={() => onDeleteAsset(asset.id)}
                  />
                </ul>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {assets.length === 0 && (
        <div className="px-4 py-6 text-center text-[14px] leading-5 text-epom-muted">
          No available data to show.
        </div>
      )}
    </div>
  );
}

function Head({ children }: { children: React.ReactNode }) {
  return (
    <th className="whitespace-nowrap bg-[#e1e2ec] px-4 py-2 text-left align-middle text-[12px] font-semibold leading-[18px] text-epom-text">
      {children}
    </th>
  );
}

function Cell({ children }: { children: React.ReactNode }) {
  return (
    <td className="max-w-[600px] break-words px-4 py-4 align-middle text-[12px] font-normal leading-[18px] transition-colors group-hover:bg-[#fafafa]">
      {children}
    </td>
  );
}

function RowAction({ icon, label, onClick }: { icon: string; label: string; onClick: () => void }) {
  return (
    <li className="list-none">
      <button
        type="button"
        onClick={onClick}
        title={label}
        aria-label={label}
        className="flex h-8 w-8 items-center justify-center rounded-full text-epom-muted transition-colors hover:bg-[#ececec] hover:text-epom-primary"
      >
        <MaterialIcon name={icon} className="block text-[20px] leading-5" />
      </button>
    </li>
  );
}
