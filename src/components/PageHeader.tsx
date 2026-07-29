"use client";

import { MaterialIcon } from "@/components/MaterialIcon";
import { DateRangePicker } from "@/components/DateRangePicker";
import { REPORT_FROM, REPORT_TO } from "@/lib/campaign-stats";

/** dd.mm.yyyy - dd.mm.yyyy over the account's current reporting week. */
const REPORT_RANGE = [REPORT_FROM, REPORT_TO]
  .map((iso) => iso.split("-").reverse().join("."))
  .join(" - ");

export function PageHeader() {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h1 className="flex items-center whitespace-nowrap text-[20px] font-bold leading-6 text-epom-text">
        Dashboard
        <a
          href="https://help.dsp.epom.com/docs/dashboard"
          target="_blank"
          rel="noreferrer"
          aria-label="Dashboard help"
          className="ml-2 flex h-5 w-5 text-epom-link transition-colors duration-[120ms] ease-linear hover:text-epom-primary"
        >
          <MaterialIcon name="help_outline" className="block text-[20px] leading-5" />
        </a>
      </h1>

      <DateRangePicker value={REPORT_RANGE} activeRange="Last 7 days" />
    </div>
  );
}
