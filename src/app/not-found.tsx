import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { MaterialIcon } from "@/components/MaterialIcon";

export const metadata: Metadata = { title: "Page not found | Epom Market" };

/** Sections of the DSP that have not been cloned yet land here, in-app. */
export default function NotFound() {
  return (
    <AppShell activeHref="" breadcrumbs={[{ label: "Page not found" }]}>
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded bg-epom-surface p-6 text-center">
        <MaterialIcon name="explore_off" className="block text-[48px] leading-[48px] text-epom-muted" />
        <div className="mt-4 text-[16px] font-bold leading-6 text-epom-text">Page not found</div>
        <div className="mt-2 text-[12px] leading-[18px] text-epom-muted">
          This section of the DSP has not been built yet.
        </div>
        <a
          href="/dashboard"
          className="mt-4 inline-block min-w-24 whitespace-nowrap rounded bg-epom-primary px-4 py-[7.5px] text-[14px] font-semibold leading-[21px] text-white shadow-epom-button transition-colors hover:bg-epom-primary-hover"
        >
          Back to Dashboard
        </a>
      </div>
    </AppShell>
  );
}
