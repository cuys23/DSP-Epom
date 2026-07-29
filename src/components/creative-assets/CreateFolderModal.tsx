"use client";

import { useState } from "react";
import { MaterialIcon } from "@/components/MaterialIcon";

interface CreateFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateFolder: (folderName: string) => void;
}

export function CreateFolderModal({
  isOpen,
  onClose,
  onCreateFolder,
}: CreateFolderModalProps) {
  const [folderName, setFolderName] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderName.trim()) return;
    onCreateFolder(folderName.trim());
    setFolderName("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl border border-epom-border bg-epom-surface p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-epom-border pb-4">
          <div className="flex items-center gap-2">
            <MaterialIcon name="create_new_folder" className="text-[24px] text-epom-primary" />
            <h2 className="text-[18px] font-semibold text-epom-text">Create new Folder</h2>
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
              Folder Name
            </label>
            <input
              type="text"
              required
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder="e.g. Banners 2026"
              className="w-full rounded border border-epom-border bg-epom-surface px-3 py-2 text-[14px] text-epom-text focus:border-epom-primary focus:outline-none"
            />
          </div>

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
              disabled={!folderName.trim()}
              className="rounded bg-epom-primary px-4 py-2 text-[14px] font-medium text-white hover:opacity-90 disabled:opacity-50"
            >
              Save Folder
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
