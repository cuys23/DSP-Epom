"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { MaterialIcon } from "@/components/MaterialIcon";
import { NAV_ITEMS } from "@/lib/nav-data";
import type { NavItem } from "@/types/nav";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  /** Nav item to highlight, e.g. "/dashboard". */
  activeHref: string;
}

export function Sidebar({ collapsed, onToggle, activeHref }: SidebarProps) {
  // The live site opens the submenu that owns the current route on first paint.
  const [expanded, setExpanded] = useState<string[]>(() =>
    NAV_ITEMS.filter((i) => i.children?.some((c) => c.href === activeHref)).map((i) => i.label),
  );

  const toggleSubmenu = (label: string) =>
    setExpanded((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label],
    );

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-[1000] flex flex-col bg-epom-sidebar transition-[width] duration-[120ms] ease-linear",
        collapsed ? "w-[78px]" : "w-[240px]",
      )}
    >
      {/* Header — logo + collapse toggle */}
      <div
        className={cn(
          "flex h-[76px] shrink-0 items-center p-4",
          collapsed ? "justify-start pl-[21px]" : "justify-between",
        )}
      >
        {!collapsed && (
          <Link href="/" className="block">
            <Image
              src="/images/logo.png"
              alt="Epom Market"
              width={1312}
              height={512}
              priority
              className="h-11 w-[113px] cursor-pointer object-contain"
            />
          </Link>
        )}
        <button
          type="button"
          onClick={onToggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="text-epom-nav-toggle transition-colors duration-[120ms] ease-linear hover:text-epom-primary"
        >
          <MaterialIcon
            name="start"
            className={cn("block text-[20px] leading-5", !collapsed && "rotate-180")}
          />
        </button>
      </div>

      {/* Scrolling nav region */}
      <nav
        className={cn(
          "min-h-0 flex-1 overflow-y-auto",
          collapsed ? "epom-scrollbar-hidden" : "epom-scrollbar",
        )}
      >
        {/* The nav list stops 14px short of the sidebar edge, as on the live site. */}
        <ul className={cn(!collapsed && "w-[226px]")}>
          {NAV_ITEMS.map((item) => (
            <SidebarItem
              key={item.label}
              item={item}
              collapsed={collapsed}
              activeHref={activeHref}
              expanded={expanded.includes(item.label)}
              onToggleSubmenu={() => toggleSubmenu(item.label)}
            />
          ))}
        </ul>
      </nav>

      {/* Footer — version + legal links */}
      <div
        className={cn(
          "shrink-0 transition-opacity duration-[120ms] ease-linear",
          collapsed && "pointer-events-none opacity-0",
        )}
      >
        <div className="p-1 text-center text-[10px] leading-[14.2857px] text-epom-version">
          Version 8.2 Epom Ltd. © 2026
        </div>
        {/*
          The live site colours these with the brand's primary — the same navy the
          sidebar is painted with — and lays them out overlapping below the fold,
          so they are invisible there. They read as the sidebar's own text instead,
          stacked — side by side the pair is 252px wide and the sidebar is 240 —
          rather than reproducing a footer nobody can see.
        */}
        <div className="flex flex-col items-center gap-1 whitespace-nowrap p-1 text-[14px] font-semibold leading-5">
          <a
            href="/privacy-policy"
            className="text-epom-nav-idle underline transition-colors duration-[120ms] ease-linear hover:text-white"
          >
            Privacy Policy
          </a>
          <a
            href="/terms-and-conditions"
            className="text-epom-nav-idle underline transition-colors duration-[120ms] ease-linear hover:text-white"
          >
            Terms and Conditions
          </a>
        </div>
      </div>
    </aside>
  );
}

interface SidebarItemProps {
  item: NavItem;
  collapsed: boolean;
  activeHref: string;
  expanded: boolean;
  onToggleSubmenu: () => void;
}

function SidebarItem({ item, collapsed, activeHref, expanded, onToggleSubmenu }: SidebarItemProps) {
  // A parent never takes the solid highlight — it gets a 16% tint while one of
  // its children owns the route, and the child carries the solid bar.
  const hasActiveChild = !!item.children?.some((c) => c.href === activeHref);
  const isActive = !item.children && item.href === activeHref;

  return (
    <li
      className={cn(
        "relative",
        collapsed && (isActive || hasActiveChild) && "border-r-2 border-epom-nav-active",
      )}
    >
      <a
        href={item.href}
        className={cn(
          "relative block h-[41px] cursor-pointer text-[14px] leading-[21px] transition-colors duration-[120ms] ease-linear",
          collapsed ? "px-0" : "py-2.5 pl-[35px] pr-[45px]",
          isActive && "bg-epom-nav-active text-white",
          hasActiveChild && "bg-epom-nav-active/16 text-white",
          !isActive && !hasActiveChild && "text-epom-nav-idle hover:bg-epom-nav-hover",
        )}
      >
        <MaterialIcon
          name={item.icon}
          className={cn(
            "absolute top-0 block h-[41px] w-[18px] text-[18px] leading-[41px]",
            // Collapsed icons sit at 18px on the live site — left-aligned, not centred.
            collapsed ? "left-[18px]" : "left-[11px]",
          )}
        />
        {!collapsed && (
          <span className="block overflow-hidden whitespace-nowrap pr-px">{item.label}</span>
        )}
      </a>

      {/* Submenu chevron — its own hit target, so the label still navigates. */}
      {item.children && !collapsed && (
        <button
          type="button"
          onClick={onToggleSubmenu}
          aria-label={`${expanded ? "Collapse" : "Expand"} ${item.label}`}
          aria-expanded={expanded}
          className={cn(
            "absolute left-[187.5px] top-[10px] h-[25px] w-5 transition-colors duration-[120ms] ease-linear",
            isActive || hasActiveChild ? "text-white" : "text-epom-nav-idle",
          )}
        >
          <MaterialIcon
            name={expanded ? "arrow_drop_down" : "arrow_right"}
            className="block text-[20px] leading-5"
          />
        </button>
      )}

      {item.children && expanded && !collapsed && (
        <ul>
          {item.children.map((child) => (
            <li key={child.label}>
              <a
                href={child.href}
                className={cn(
                  "relative block h-[41px] cursor-pointer py-2.5 pl-[58px] pr-[45px] text-[14px] leading-[21px] transition-colors duration-[120ms] ease-linear",
                  child.href === activeHref
                    ? "bg-epom-nav-active text-white"
                    : "text-epom-nav-idle hover:bg-epom-nav-hover",
                )}
              >
                <MaterialIcon
                  name={child.icon}
                  className="absolute left-8 top-0 block h-[41px] w-[18px] text-[18px] leading-[41px]"
                />
                <span className="block overflow-hidden whitespace-nowrap">{child.label}</span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}
