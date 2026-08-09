"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import type { Crumb } from "@/types/nav";

interface AppShellProps {
  breadcrumbs: Crumb[];
  /** Nav item to highlight in the sidebar. */
  activeHref: string;
  /** Fixed 270px panel pinned to the right edge, below the topbar. */
  rightRail?: React.ReactNode;
  /**
   * Classes for the scrolling content column. The wizard replaces the default
   * padding with its own flex column so its footer can sit full-bleed.
   */
  contentClassName?: string;
  children: React.ReactNode;
}

export function AppShell({
  breadcrumbs,
  activeHref,
  rightRail,
  contentClassName = "overflow-auto p-8",
  children,
}: AppShellProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((v) => !v)}
        activeHref={activeHref}
      />

      <div
        className={cn(
          "bg-epom-page transition-[margin] duration-[120ms] ease-linear",
          collapsed ? "ml-[74px]" : "ml-[240px]",
        )}
      >
        <TopBar breadcrumbs={breadcrumbs} />
        {/* The content column scrolls internally — the document body never does. */}
        <div className={cn("h-[calc(100vh-57px)]", contentClassName)}>{children}</div>
      </div>

      {rightRail}
    </>
  );
}
