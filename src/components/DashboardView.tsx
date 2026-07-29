"use client";

import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { ChartCard } from "@/components/ChartCard";
import { DEFAULT_RANGE, rangeDays } from "@/lib/campaign-stats";

/**
 * Owns the dashboard's selected date range. The header picks it and the chart
 * card reads it, so both sit under one piece of state rather than each deriving
 * its own window.
 */
export function DashboardView() {
  const [range, setRange] = useState(DEFAULT_RANGE);
  const days = rangeDays(range);

  return (
    <>
      <PageHeader days={days} activeRange={range} onRangeChange={setRange} />
      <ChartCard days={days} />
    </>
  );
}
