import { cn } from "@/lib/utils";
import { MaterialIcon } from "@/components/MaterialIcon";
import type { SummaryInline, SummarySection } from "@/types/campaign";

/**
 * Fixed 270px rail on the right of the campaign wizard. Scrolls independently
 * of the main content column.
 */
export function CampaignSummaryRail({ sections }: { sections: SummarySection[] }) {
  const [first, ...rest] = sections;

  return (
    <aside
      data-summary-rail
      className="fixed right-0 top-[57px] h-[calc(100vh-57px)] w-[270px] overflow-y-auto border-l border-[#e1e2ec] bg-epom-surface"
    >
      {/* The first block has asymmetric padding on the live site — heading and
          body are siblings rather than a wrapped section. */}
      <div className="px-6 pt-6 text-[14px] font-semibold leading-[21px] text-epom-text">
        {first.heading}
      </div>
      {first.media ? (
        <section className="flex items-center p-6">
          <InlinePair {...first.media} />
        </section>
      ) : (
        <div className="p-6 text-[12px] leading-[18px] text-epom-muted">{first.description}</div>
      )}

      {rest.map((section) => (
        <div key={section.heading}>
          <div className="h-px bg-[#e1e2ec]" />
          <section className="p-6">
            <div className="text-[14px] font-semibold leading-[21px] text-epom-text">
              {section.heading}
            </div>

            {section.description && (
              <div className="mt-3 text-[12px] leading-[18px] text-epom-muted">
                {section.description}
              </div>
            )}

            {section.items && (
              <div className="mt-5 flex flex-col">
                {section.items.map((item) => (
                  <div key={item.title}>
                    <div
                      className={cn(
                        "text-[12px] font-semibold leading-[18px] text-epom-text",
                        section.spacedTitle && "mt-2",
                      )}
                    >
                      {item.title}
                    </div>
                    {item.inline && (
                      // 20px row with the text bottom-aligned, matching the live box.
                      <div className="mt-3 flex h-5 items-end">
                        <InlinePair {...item.inline} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      ))}
      <div className="h-px bg-[#e1e2ec]" />
    </aside>
  );
}

function InlinePair({ label, value, icon }: SummaryInline) {
  return (
    <>
      <span className="mr-1 text-[12px] leading-[18px] text-epom-muted">{label}</span>
      {icon && (
        <MaterialIcon name={icon} className="mr-1 block text-[12px] leading-3 text-epom-text" />
      )}
      <span className="text-[12px] leading-[18px] text-epom-text">{value}</span>
    </>
  );
}
