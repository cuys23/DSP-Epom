"use client";

import { useState } from "react";
import { MaterialIcon } from "@/components/MaterialIcon";
import type { Folder } from "@/types/creative-asset";

interface UploadAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  folders: Folder[];
  activeFolderId: string;
  onUploadSuccess: (assetName: string, folderId: string) => void;
}

export function UploadAssetModal({
  isOpen,
  onClose,
  folders,
  activeFolderId,
  onUploadSuccess,
}: UploadAssetModalProps) {
  const [selectedFolder, setSelectedFolder] = useState(activeFolderId);
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileName) return;
    onUploadSuccess(fileName, selectedFolder);
    setFileName("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-xl border border-epom-border bg-epom-surface p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-epom-border pb-4">
          <div className="flex items-center gap-2">
            <MaterialIcon name="cloud_upload" className="text-[24px] text-epom-primary" />
            <h2 className="text-[18px] font-semibold text-epom-text">Upload Asset</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-epom-muted hover:text-epom-text"
          >
            <MaterialIcon name="close" className="text-[20px]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-[13px] font-medium text-epom-text mb-1">
              Select Folder
            </label>
            <select
              value={selectedFolder}
              onChange={(e) => setSelectedFolder(e.target.value)}
              className="w-full rounded border border-epom-border bg-epom-surface px-3 py-2 text-[14px] text-epom-text focus:border-epom-primary focus:outline-none"
            >
              {folders.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragActive(false);
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                setFileName(e.dataTransfer.files[0].name);
              }
            }}
            className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
              dragActive
                ? "border-epom-primary bg-epom-primary-12"
                : "border-epom-border bg-gray-50/50"
            }`}
          >
            <MaterialIcon name="cloud_upload" className="mb-2 text-[36px] text-epom-muted" />
            <p className="text-[14px] font-medium text-epom-text">
              Drag & drop asset file here or click to browse
            </p>
            <p className="mt-1 text-[12px] text-epom-muted">
              Supports JPG, PNG, GIF, MP4, HTML5 ZIP (Max 15MB)
            </p>
            <input
              type="file"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setFileName(e.target.files[0].name);
                }
              }}
              className="mt-3 block w-full text-[12px] text-epom-muted file:mr-4 file:rounded file:border-0 file:bg-epom-primary-12 file:px-3 file:py-1.5 file:text-[13px] file:font-semibold file:text-epom-primary hover:file:bg-epom-primary/20"
            />
          </div>

          {fileName && (
            <div className="rounded bg-epom-primary-12 p-3 text-[13px] text-epom-primary flex items-center justify-between">
              <span>Selected file: <strong>{fileName}</strong></span>
              <button
                type="button"
                onClick={() => setFileName("")}
                className="text-epom-muted hover:text-red-600"
              >
                <MaterialIcon name="close" className="text-[16px]" />
              </button>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4 border-t border-epom-border">
            <button
              type="button"
              onClick={onClose}
              className="rounded border border-epom-border px-4 py-2 text-[14px] font-medium text-epom-text hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!fileName}
              className="rounded bg-epom-primary px-4 py-2 text-[14px] font-medium text-white hover:opacity-90 disabled:opacity-50"
            >
              Upload
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
