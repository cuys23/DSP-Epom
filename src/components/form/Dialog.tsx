"use client";

import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { MaterialIcon } from "@/components/MaterialIcon";

/** `.button` — 14/600, 36px tall, 96px minimum. */
export const BTN_BASE =
  "h-9 min-w-24 max-w-[720px] whitespace-nowrap rounded text-center text-[14px] font-semibold leading-[21px] transition-colors";

export const BTN_PRIMARY = cn(
  BTN_BASE,
  "bg-epom-primary px-4 py-[7.5px] text-white shadow-epom-button hover:bg-epom-primary-hover active:shadow-none",
);

export const BTN_OUTLINED = cn(
  BTN_BASE,
  "border border-epom-primary px-[15px] py-[6.5px] text-epom-primary hover:bg-epom-primary-8 active:bg-epom-primary-12",
);

/** `.button-outlined-grey` — neutral outline, used for Cancel and for idle actions. */
export const BTN_OUTLINED_GREY = cn(
  BTN_BASE,
  "border border-epom-muted px-[15px] py-[6.5px] text-epom-text hover:bg-black/[0.08] active:bg-black/[0.12]",
  "disabled:cursor-not-allowed disabled:border-epom-border disabled:text-epom-border disabled:hover:bg-transparent",
);

/** Shared dialog chrome: overlay, Escape-to-close, title row and footer. */
export function Dialog({
  title,
  width,
  onCancel,
  onApply,
  children,
}: {
  title: string;
  width: string;
  onCancel: () => void;
  onApply: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => e.key === "Escape" && onCancel();
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onCancel]);

  return (
    <div className="fixed inset-0 z-[1050] flex items-center justify-center bg-black/50 p-8">
      <div
        className={cn("flex max-h-[80vh] flex-col rounded bg-epom-surface shadow-epom-dropdown", width)}
      >
        <div className="flex items-start justify-between px-6 pt-6">
          <div className="text-[20px] font-bold leading-6 text-epom-text">{title}</div>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Close"
            className="-mr-2 -mt-1 flex h-8 w-8 items-center justify-center rounded-full text-epom-muted transition-colors hover:bg-black/[0.04]"
          >
            <MaterialIcon name="close" className="block text-[20px] leading-5" />
          </button>
        </div>

        {children}

        <div className="flex justify-end gap-4 border-t border-epom-border px-6 py-4">
          <button type="button" onClick={onCancel} className={BTN_OUTLINED_GREY}>
            Cancel
          </button>
          <button type="button" onClick={onApply} className={BTN_PRIMARY}>
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
