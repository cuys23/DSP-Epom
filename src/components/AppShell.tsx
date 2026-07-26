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
  children: React.ReactNode;
}

export function AppShell({ breadcrumbs, activeHref, rightRail, children }: AppShellProps) {
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
        <div className="h-[calc(100vh-57px)] overflow-auto p-8">{children}</div>
      </div>

      {rightRail}
    </>
  );
}
