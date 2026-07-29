"use client";

import { cn } from "@/lib/utils";

export interface Sort {
  key: string;
  asc: boolean;
}

/**
 * `th.sort` header label. The live table draws its indicator with two 4px CSS
 * triangles pinned to the right of the text: both fade in on hover, and only
 * one stays once the column is sorted.
 */
export function SortLabel({
  label,
  sortKey,
  sort,
  setSort,
}: {
  label: string;
  sortKey: string;
  sort: Sort | null;
  setSort: (s: Sort) => void;
}) {
  const active = sort?.key === sortKey;
  const asc = active && sort.asc;
  const desc = active && !sort.asc;

  return (
    <button
      type="button"
      onClick={() => setSort({ key: sortKey, asc: active ? !sort.asc : true })}
      className="group/sort relative flex items-center pr-3 text-left"
    >
      {label}
      {/* Points up: sorted ascending. */}
      <span
        className={cn(
          "absolute right-0 top-[5px] h-0 w-0 border-x-4 border-b-4 border-x-transparent border-b-epom-muted transition-opacity",
          desc && "hidden",
          asc ? "opacity-100" : "opacity-0 group-hover/sort:opacity-100",
        )}
      />
      {/* Points down: sorted descending. */}
      <span
        className={cn(
          "absolute right-0 top-[11px] h-0 w-0 border-x-4 border-t-4 border-x-transparent border-t-epom-muted transition-opacity",
          asc && "hidden",
          desc ? "opacity-100" : "opacity-0 group-hover/sort:opacity-100",
        )}
      />
    </button>
  );
}
