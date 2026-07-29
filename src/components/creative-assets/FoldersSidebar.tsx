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
  totalAssetCount: number;
}

export function FoldersSidebar({
  folders,
  activeFolderId,
  onSelectFolder,
  onOpenCreateFolder,
  onDeleteFolder,
  totalAssetCount,
}: FoldersSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [folderSearch, setFolderSearch] = useState("");

  const filteredFolders = folders.filter((f) =>
    f.name.toLowerCase().includes(folderSearch.toLowerCase())
  );

  return (
    <aside
      data-folders-panel
      className={cn(
        "-my-8 -ml-8 flex h-[calc(100vh-57px)] flex-col overflow-hidden whitespace-nowrap border-r border-epom-border bg-epom-surface pt-6 transition-[width] duration-150",
        collapsed ? "w-16" : "w-[240px]"
      )}
    >
      {collapsed && (
        <div className="flex justify-center mb-4">
          <button
            type="button"
            onClick={() => setCollapsed(false)}
            aria-label="Expand folders"
            className="p-1 text-epom-muted hover:text-epom-text"
          >
            <MaterialIcon name="start" className="block text-[20px] leading-5" />
          </button>
        </div>
      )}

      {/* All assets header button */}
      <div
        onClick={() => onSelectFolder("all")}
        className={cn(
          "flex h-[41px] cursor-pointer items-center justify-between px-6 py-2.5 text-[14px] leading-[21px] transition-colors",
          activeFolderId === "all"
            ? "bg-epom-primary-12 text-epom-primary font-medium"
            : "bg-transparent text-epom-text hover:bg-black/[0.04]"
        )}
      >
        <span className="flex items-center gap-2 overflow-hidden text-ellipsis">
          {!collapsed && <span>All assets</span>}
          <span className="text-epom-muted">({totalAssetCount})</span>
        </span>
        {!collapsed && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setCollapsed(true);
            }}
            aria-label="Collapse folders"
            className="text-epom-muted hover:text-epom-text"
          >
            <MaterialIcon
              name="start"
              className="block rotate-180 text-[20px] leading-5"
            />
          </button>
        )}
      </div>

      {/* Folders title & Add button */}
      <div className="mt-2 flex items-center justify-between border-t border-epom-border px-6 pb-3 pt-6">
        {!collapsed && (
          <h3 className="text-[16px] font-semibold leading-6 text-epom-text">
            Folders
          </h3>
        )}
        <button
          type="button"
          onClick={onOpenCreateFolder}
          aria-label="Add folder"
          title="Create new Folder"
          className="flex h-5 w-5 items-center justify-center text-epom-primary hover:opacity-80 transition-opacity"
        >
          <MaterialIcon name="add_circle_outline" className="block text-[18px] leading-5" />
        </button>
      </div>

      {/* Search Input */}
      {!collapsed && (
        <div className="px-6 pb-3">
          <div className="relative">
            <input
              type="text"
              value={folderSearch}
              onChange={(e) => setFolderSearch(e.target.value)}
              placeholder="Search"
              className="h-9 w-full rounded border border-epom-border bg-epom-surface pl-3 pr-8 text-[14px] leading-5 text-epom-text focus:border-epom-primary focus:outline-none"
            />
            <MaterialIcon
              name="search"
              className="pointer-events-none absolute right-2.5 top-2 block text-[20px] leading-5 text-epom-muted"
            />
          </div>
        </div>
      )}

      {/* Folder Items List */}
      <ul className="flex-1 overflow-y-auto">
        {filteredFolders
          .filter((f) => f.id !== "all")
          .map((f) => {
            const isActive = activeFolderId === f.id;
            return (
              <li
                key={f.id}
                onClick={() => onSelectFolder(f.id)}
                className={cn(
                  "group flex cursor-pointer items-center justify-between gap-2 py-2.5 text-[14px] leading-5 transition-colors",
                  collapsed ? "px-4" : "px-6",
                  isActive
                    ? "bg-epom-primary-12 text-epom-primary font-medium"
                    : "text-epom-text hover:bg-black/[0.04]"
                )}
              >
                <span className="flex-1 overflow-hidden whitespace-nowrap text-ellipsis">
                  {f.name}
                  {f.assetCount !== undefined && (
                    <span className="ml-1 text-epom-muted">({f.assetCount})</span>
                  )}
                </span>

                {!collapsed && onDeleteFolder && f.id !== "all" && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteFolder(f.id);
                    }}
                    title="Delete folder"
                    className="opacity-0 group-hover:opacity-100 p-1 text-epom-muted hover:text-red-600 transition-opacity"
                  >
                    <MaterialIcon name="delete" className="block text-[16px] leading-4" />
                  </button>
                )}
              </li>
            );
          })}
      </ul>
    </aside>
  );
}
