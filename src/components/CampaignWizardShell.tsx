import { cn } from "@/lib/utils";
import { AppShell } from "@/components/AppShell";
import { CampaignSummaryRail } from "@/components/CampaignSummaryRail";
import { MaterialIcon } from "@/components/MaterialIcon";
import { WIZARD_SUMMARY } from "@/lib/campaign-data";

const TABS = [
  { label: "Basic Info", href: "/campaigns/new" },
  { label: "Audience", href: "/campaigns/new/audience" },
  { label: "Bidding Strategy", href: "/campaigns/new/bidding-strategy" },
  { label: "Budgets", href: "/campaigns/new/budgets" },
  { label: "Traffic Source", href: "/campaigns/new/traffic-source" },
  { label: "Optimization", href: "/campaigns/new/optimization" },
];

export type FooterButton = "Cancel" | "Previous" | "Next" | "Save";

interface CampaignWizardShellProps {
  /** href of the active tab. */
  activeTab: string;
  footer: FooterButton[];
  children: React.ReactNode;
}

export function CampaignWizardShell({ activeTab, footer, children }: CampaignWizardShellProps) {
  return (
    <AppShell
      activeHref="/campaigns"
      breadcrumbs={[{ label: "Campaigns", href: "/campaigns" }, { label: "Create new campaign" }]}
      rightRail={<CampaignSummaryRail sections={WIZARD_SUMMARY} />}
    >
      {/* Reserve the width the fixed summary rail occupies. The column is a
          full-height flex stack so the content area can stretch and pin the
          footer to the bottom when the form is shorter than the viewport. */}
      <div className="flex min-h-full max-w-[calc(100%-270px)] flex-col">
        <div className="flex h-9 items-center">
          <h1 className="flex items-center text-[20px] font-bold leading-6 text-epom-text">
            Create new campaign
            <a
              href="https://help.dsp.epom.com/docs/basic-settings"
              target="_blank"
              rel="noreferrer"
              aria-label="Campaign settings help"
              className="ml-2 flex h-5 w-5 text-epom-link transition-colors duration-[120ms] ease-linear hover:text-epom-primary"
            >
              <MaterialIcon name="help_outline" className="block text-[20px] leading-5" />
            </a>
          </h1>
        </div>

        <nav className="mt-4">
          <ul className="flex h-[34px] border-b border-epom-border">
            {TABS.map((tab, i) => {
              const active = tab.href === activeTab;
              return (
                <li key={tab.href} className="relative -mb-px flex h-[34px]">
                  <a
                    href={tab.href}
                    className={cn(
                      "flex h-[34px] items-center gap-2 border-b-2 pb-2 pt-1 text-[16px] font-semibold leading-[21px] transition-colors duration-[120ms] ease-linear",
                      i > 0 && "ml-8",
                      active
                        ? "border-epom-primary text-epom-primary"
                        : "border-transparent text-epom-muted",
                    )}
                  >
                    {tab.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="mt-4 flex flex-1 flex-col gap-4">{children}</div>

        <div className="mt-4 flex h-9 justify-end gap-4">
          {footer.map((b) => (
            <button key={b} type="button" className={footerButtonClass(b)}>
              {b}
            </button>
          ))}
        </div>
      </div>
    </AppShell>
  );
}

function footerButtonClass(label: FooterButton) {
  const base =
    "h-9 w-24 min-w-24 rounded text-center text-[14px] font-semibold leading-[21px] transition-colors";
  if (label === "Cancel") {
    return cn(base, "border border-epom-muted px-4 py-[6.5px] text-epom-text hover:bg-black/5");
  }
  if (label === "Previous") {
    return cn(
      base,
      "border border-epom-primary px-[15px] py-[6.5px] text-epom-primary hover:bg-epom-primary-8",
    );
  }
  return cn(
    base,
    "bg-epom-primary px-4 py-[7.5px] text-white shadow-epom-button hover:bg-epom-primary-hover active:shadow-none",
  );
}
