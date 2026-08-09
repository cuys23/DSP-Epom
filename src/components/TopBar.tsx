"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { MaterialIcon } from "@/components/MaterialIcon";
import { ACCOUNT_BALANCE_CENTS, money } from "@/lib/transactions";
import type { Crumb } from "@/types/nav";

const LANGUAGES = ["EN", "中文", "UA", "DE", "FR", "ES", "PT"];
const ACTIVE_LANGUAGE = "EN";

const USER_ACTIONS = [
  { label: "Edit profile", href: "/user-profile" },
  { label: "Review Us on G2" },
  { label: "Help center" },
  { label: "Sign out" },
];

export function TopBar({ breadcrumbs }: { breadcrumbs: Crumb[] }) {
  const [open, setOpen] = useState<"language" | "user" | null>(null);
  const barRef = useRef<HTMLDivElement>(null);

  // One listener for both menus — close on outside click or Escape.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (!barRef.current?.contains(e.target as Node)) setOpen(null);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <header>
      <div className="h-[56.5px] border-b-[0.5px] border-epom-border bg-epom-surface pl-[26px] pr-8">
        <div ref={barRef} className="flex min-h-[56px] items-center justify-between gap-11">
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="min-w-0">
            <ol className="flex items-center py-1 text-[12px] leading-[17.1429px]">
              <li className="flex items-center">
                <a href="/dashboard" aria-label="Home" className="flex text-epom-primary">
                  <MaterialIcon name="home" className="block text-[16px] leading-4" />
                </a>
              </li>
              {breadcrumbs.map((crumb) => (
                <li key={crumb.label} className="flex items-center">
                  <span className="px-2 text-epom-muted">/</span>
                  {crumb.href ? (
                    <a
                      href={crumb.href}
                      className="truncate font-semibold leading-[18px] text-epom-primary"
                    >
                      {crumb.label}
                    </a>
                  ) : (
                    <span className="truncate">{crumb.label}</span>
                  )}
                </li>
              ))}
            </ol>
          </nav>

          {/* Balance · timezone · language · user */}
          <ul className="flex h-9 items-center">
            <li>
              <button type="button" className={cn(textButtonClass, "inline-flex gap-[9px]")}>
                <span>Balance:</span>
                <span className="text-epom-success">{money(ACCOUNT_BALANCE_CENTS)}</span>
              </button>
            </li>
            <li>
              <button type="button" className={cn(textButtonClass, "ml-3")}>
                UTC+00:00
              </button>
            </li>

            <li className="relative">
              <button
                type="button"
                aria-label="Language"
                aria-expanded={open === "language"}
                onClick={() => setOpen(open === "language" ? null : "language")}
                className={cn(toggleClass, "text-epom-primary", open === "language" && toggleOpenClass)}
              >
                <span className="text-[14px] leading-5">{ACTIVE_LANGUAGE}</span>
                <MaterialIcon name="arrow_drop_down" className="block text-[20px] leading-5" />
              </button>

              {open === "language" && (
                <div className={cn(menuClass, "w-[101px]")}>
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      className={cn(
                        menuItemClass,
                        // Language rows span the full menu width and are separated by 2px.
                        "mx-0 mb-0.5 w-full justify-start",
                        lang === ACTIVE_LANGUAGE && "bg-epom-primary-12 font-semibold",
                      )}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              )}
            </li>

            <li className="relative">
              <button
                type="button"
                aria-expanded={open === "user"}
                onClick={() => setOpen(open === "user" ? null : "user")}
                className={cn(toggleClass, "text-epom-link", open === "user" && toggleOpenClass)}
              >
                <MaterialIcon name="person" className="block text-[20px] leading-5" />
                <span className="hidden max-w-[150px] overflow-hidden whitespace-nowrap text-[14px] font-semibold leading-5 text-epom-primary min-[960px]:block">
                  Adstarget
                </span>
                <MaterialIcon name="arrow_drop_down" className="block text-[20px] leading-5" />
              </button>

              {open === "user" && (
                <div className={cn(menuClass, "w-[324px]")}>
                  <div className="px-4 py-2">
                    <div className="text-[14px] font-semibold leading-[21px] text-epom-text">
                      Adstarget
                    </div>
                    <div className="text-[12px] leading-[18px] text-epom-muted">
                      admin@vinmedia.net
                    </div>
                  </div>
                  <div className="mt-1">
                    {USER_ACTIONS.map(({ label, href }) =>
                      href ? (
                        <Link
                          key={label}
                          href={href}
                          className={cn(menuItemClass, "w-[calc(100%-8px)] justify-start")}
                        >
                          {label}
                        </Link>
                      ) : (
                        <button
                          key={label}
                          type="button"
                          className={cn(menuItemClass, "w-[calc(100%-8px)] justify-start")}
                        >
                          {label}
                        </button>
                      ),
                    )}
                  </div>
                </div>
              )}
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
}

const textButtonClass =
  "inline-block min-w-24 whitespace-nowrap rounded border border-transparent px-4 py-[6.5px] text-[14px] font-semibold leading-[21px] text-epom-primary transition-colors hover:border-epom-primary-8 hover:bg-epom-primary-8 active:bg-epom-primary-12";

// ml-1 reproduces the 4px the live site puts between each dropdown and its neighbour.
const toggleClass =
  "relative ml-1 flex h-[35px] items-center justify-center gap-2 overflow-hidden rounded-[5px] px-4 py-[7.5px] text-[14px] leading-5 transition-colors hover:bg-epom-primary-8";

const toggleOpenClass = "bg-epom-primary-8";

const menuClass =
  "absolute right-0 top-[49px] z-[1000] rounded-t-[4px] rounded-b-[3px] bg-epom-surface p-0.5 shadow-epom-dropdown";

const menuItemClass =
  "mx-1 flex h-9 items-center rounded px-3 text-[14px] leading-[21px] text-epom-text transition-colors hover:bg-epom-primary-8";
