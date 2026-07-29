"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { MaterialIcon } from "@/components/MaterialIcon";
import type { Folder } from "@/types/creative-asset";

interface FoldersSidebarProps {
  folders: Folder[];
  activeFolderId: string;
  onSelectFolder: (folderId: string) => void;
  onOpenCreateFolder: () => void;
  onDeleteFolder?: (folderId: string) => void;
}

/**
 * Same `app-folders` panel as the campaigns list, minus the collapse toggle and
 * the per-folder counts — the live Creative Assets page renders neither.
 */
export function FoldersSidebar({
  folders,
  activeFolderId,
  onSelectFolder,
  onOpenCreateFolder,
  onDeleteFolder,
}: FoldersSidebarProps) {
  const [folderSearch, setFolderSearch] = useState("");

  const filteredFolders = folders.filter(
    (f) => f.id !== "all" && f.name.toLowerCase().includes(folderSearch.toLowerCase()),
  );

  return (
    <aside
      data-folders-panel
      className="-my-8 -ml-8 flex h-[calc(100vh-57px)] flex-col overflow-hidden whitespace-nowrap border-r-[0.5px] border-epom-border bg-epom-surface pt-6"
    >
      <div
        onClick={() => onSelectFolder("all")}
        className={cn(
          "flex h-[41px] cursor-pointer items-center px-6 py-2.5 text-[14px] leading-[21px] text-epom-text transition-colors",
          activeFolderId === "all" ? "bg-epom-primary-12" : "hover:bg-epom-primary-8",
        )}
      >
        All assets
      </div>

      <div className="mt-2 flex items-center justify-between border-t border-epom-border px-6 pb-3 pt-6">
        <h3 className="text-[16px] font-semibold leading-6 text-epom-text">Folders</h3>
        <button
          type="button"
          onClick={onOpenCreateFolder}
          aria-label="Add folder"
          title="Create new Folder"
          className="flex h-5 w-5 text-epom-primary"
        >
          <MaterialIcon name="add_circle_outline" className="block text-[16px] leading-5" />
        </button>
      </div>

      <div className="h-12 px-6 pb-3">
        <div className="relative">
          <input
            type="text"
            value={folderSearch}
            onChange={(e) => setFolderSearch(e.target.value)}
            placeholder="Search"
            className="h-9 w-[200px] rounded border border-epom-border bg-epom-surface px-3 py-2 text-[14px] leading-5 text-epom-text focus:outline-none"
          />
          <MaterialIcon
            name="search"
            className="pointer-events-none absolute left-[168px] top-2 block text-[20px] leading-5 text-epom-muted"
          />
        </div>
      </div>

      <ul className="flex-1 overflow-y-auto">
        {filteredFolders.map((f) => (
          <li
            key={f.id}
            onClick={() => onSelectFolder(f.id)}
            className={cn(
              "group flex cursor-pointer items-center justify-between gap-2 px-6 py-2.5 transition-colors duration-100",
              activeFolderId === f.id ? "bg-epom-primary-12" : "hover:bg-black/[0.04]",
            )}
          >
            <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-[14px] leading-5 text-epom-text">
              {f.name}
            </span>

            {/* Hover-revealed action, in the 0-width slot the live panel uses. */}
            {onDeleteFolder && (
              <div className="w-0 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteFolder(f.id);
                  }}
                  title="Delete folder"
                  aria-label={`Delete ${f.name}`}
                  className="flex h-[22px] w-8 items-center justify-center px-1.5 py-px text-epom-primary"
                >
                  <MaterialIcon name="delete" className="block text-[16px] leading-5" />
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </aside>
  );
}
