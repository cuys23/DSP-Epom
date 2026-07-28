"use client";

import { cn } from "@/lib/utils";
import { MaterialIcon } from "@/components/MaterialIcon";

interface Folder {
  name: string;
  count: number;
}

interface FoldersPanelProps {
  collapsed: boolean;
  onToggle: () => void;
  allCount: number;
  folders: Folder[];
}

/**
 * Second sidebar on the campaigns list. It breaks out of the page wrapper's
 * 32px padding so it sits flush against the main nav and spans full height —
 * the 28px left bleed is what the negative margin buys.
 */
export function FoldersPanel({ collapsed, onToggle, allCount, folders }: FoldersPanelProps) {
  return (
    <aside
      data-folders-panel
      className="-my-8 -ml-7 flex h-[calc(100vh-57px)] flex-col overflow-hidden whitespace-nowrap border-r-[0.5px] border-epom-border bg-epom-surface pt-6"
    >
      {collapsed && (
        <div className="flex justify-center">
          <button type="button" onClick={onToggle} aria-label="Expand folders">
            <MaterialIcon
              name="start"
              className="block h-5 w-5 text-[20px] leading-5 text-epom-muted"
            />
          </button>
        </div>
      )}

      <div
        className={cn(
          "flex h-[41px] items-center justify-between bg-epom-primary-12 px-6 py-2.5 text-[14px] leading-[21px] text-epom-text",
          collapsed && "mt-3",
        )}
      >
        <span>
          {!collapsed && <span className="mr-1">All campaigns</span>}
          <span className="text-epom-muted">({allCount})</span>
        </span>
        {!collapsed && (
          <button type="button" onClick={onToggle} aria-label="Collapse folders">
            <MaterialIcon
              name="start"
              className="block h-5 w-5 rotate-180 text-[20px] leading-5 text-epom-muted"
            />
          </button>
        )}
      </div>

      {/* No fixed height: hiding the h3 when collapsed shrinks this 61px → 57px. */}
      <div className="mt-2 flex items-center justify-between border-t border-epom-border px-6 pb-3 pt-6">
        {!collapsed && (
          <h3 className="text-[16px] font-semibold leading-6 text-epom-text">Folders</h3>
        )}
        <button type="button" aria-label="Add folder" className="flex h-5 w-5 text-epom-primary">
          <MaterialIcon name="add_circle_outline" className="block text-[16px] leading-5" />
        </button>
      </div>

      {!collapsed && (
        <div className="h-12 px-6 pb-3">
          <div className="relative">
            <input
              type="text"
              readOnly
              placeholder="Search"
              className="h-9 w-[200px] rounded border border-epom-border bg-epom-surface px-3 py-2 text-[14px] leading-5 text-epom-text focus:outline-none"
            />
            <MaterialIcon
              name="search"
              className="pointer-events-none absolute left-[168px] top-2 block text-[20px] leading-5 text-epom-muted"
            />
          </div>
        </div>
      )}

      <ul>
        {folders.map((f) => (
          <li
            key={f.name}
            className={cn(
              // 42px expanded (the 22px actions button sets the height), 40px collapsed.
              "group flex cursor-pointer items-center justify-between gap-2 py-2.5 transition-colors duration-100 hover:bg-black/[0.04]",
              collapsed ? "px-4" : "px-6",
            )}
          >
            <span className="flex-1 overflow-hidden whitespace-nowrap text-[14px] leading-5 text-epom-text">
              {f.name}
              <span className="ml-1 text-epom-muted">({f.count})</span>
            </span>
            {/* 0-width wrapper at opacity 0 — the actions button only appears on
                row hover, and overflows into the panel's clipped area. */}
            {!collapsed && (
              <div className="w-0 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  type="button"
                  aria-label={`${f.name} actions`}
                  className="flex h-[22px] w-8 items-center justify-center px-1.5 py-px text-epom-primary"
                >
                  <MaterialIcon name="more_horiz" className="block text-[16px] leading-5" />
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </aside>
  );
}
