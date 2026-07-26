"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { MaterialIcon } from "@/components/MaterialIcon";

/**
 * Collapsible section used across the wizard. The live site rotates the
 * `arrow_right` glyph 90deg when open rather than swapping the icon.
 */
export function Accordion({
  title,
  defaultOpen = false,
  /** 20px + 8px gap on Bidding Strategy; 24px flush on Optimization. */
  iconSize = 24,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  iconSize?: 20 | 24;
  children?: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex h-6 w-full cursor-pointer items-center text-left"
      >
        <MaterialIcon
          name="arrow_right"
          className={cn(
            "block h-6 text-epom-text transition-transform duration-[120ms] ease-linear",
            iconSize === 20 ? "mr-2 w-5 text-[20px] leading-6" : "w-6 text-[24px] leading-6",
            open && "rotate-90",
          )}
        />
        <span className="text-[16px] font-bold leading-6 text-epom-text">{title}</span>
      </button>
      {open && children && <div className="mt-6">{children}</div>}
    </>
  );
}
