import type { Metadata } from "next";
import { CampaignWizardShell } from "@/components/CampaignWizardShell";
import { SearchField } from "@/components/form/FormPrimitives";
import { MaterialIcon } from "@/components/MaterialIcon";
import { SSP_ENDPOINTS } from "@/lib/campaign-data";

export const metadata: Metadata = { title: "Campaign settings | Epom Market" };

export default function TrafficSourcePage() {
  return (
    <CampaignWizardShell
      activeTab="/campaigns/new/traffic-source"
      footer={["Cancel", "Previous", "Next", "Save"]}
    >
      {/* Tile padding is 24px on every side except the left, which the lead
          text and left column supply themselves. */}
      <div className="flex flex-col rounded bg-epom-surface py-6 pr-6">
        <div className="pl-6 text-[14px] leading-[21px] text-epom-muted">
          Select SSP Endpoints that will be sending traffic to this Campaign.
        </div>

        <div className="mt-8 flex h-[276px] gap-4">
          {/* The Available column is the scroll region — the page itself doesn't scroll.
              Width is pinned to 417px: on the live site it falls out of the min-content
              width of the 122 rows, which is fragile to reproduce exactly. */}
          <div className="w-[417px] shrink-0 overflow-y-auto pl-6 pr-5">
            <h4 className="text-[14px] font-bold leading-[21px] text-epom-text">Available</h4>
            <SearchField className="mt-4" />

            <div className="relative mt-4">
              <input
                type="text"
                readOnly
                placeholder="Select labels"
                className="h-9 w-full rounded border border-epom-border bg-epom-surface px-3 text-[14px] leading-5 text-epom-text focus:outline-none"
              />
              <MaterialIcon
                name="arrow_drop_down"
                className="pointer-events-none absolute right-2 top-2 block text-[20px] leading-5 text-epom-muted"
              />
            </div>

            <ul className="mt-8 flex flex-col gap-2 pb-3">
              {SSP_ENDPOINTS.map((ep) => (
                <li
                  key={ep.name}
                  className="flex flex-col justify-between gap-1 rounded border border-epom-border pb-[11px] pl-4 pr-2 pt-[7px]"
                >
                  <div className="flex h-8 items-center gap-2">
                    <span className="flex flex-1 items-center text-[14px] leading-[21px] text-epom-text">
                      {ep.name}
                    </span>
                    <button
                      type="button"
                      className="flex h-8 items-center gap-1 rounded px-2 py-[7px] text-[12px] font-semibold leading-[18px] text-[#006d3e] transition-colors hover:bg-[#006d3e14]"
                    >
                      <MaterialIcon
                        name="add_circle_outline"
                        className="block text-[16px] leading-4"
                      />
                      Include
                    </button>
                    <button
                      type="button"
                      className="flex h-8 items-center gap-1 rounded px-2 py-[7px] text-[12px] font-semibold leading-[18px] text-[#ba1a1a] transition-colors hover:bg-[#ba1a1a14]"
                    >
                      <MaterialIcon name="block" className="block text-[16px] leading-4" />
                      Exclude
                    </button>
                  </div>
                  {ep.labels.length > 0 && (
                    <ul className="mt-1 flex h-5 gap-1">
                      {ep.labels.map((l) => (
                        <li key={l.text}>
                          <span
                            className="block rounded-lg px-1 py-0.5 text-[10px] font-bold leading-4 text-white"
                            style={{ backgroundColor: l.color }}
                          >
                            {l.text}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <hr className="h-[276px] w-px shrink-0 border-0 bg-epom-border" />

          <div className="flex-1 pr-5">
            {/* No items-center: the live row stretches, so "Clear all" is 21px tall. */}
            <div className="flex justify-between">
              <h4 className="text-[14px] font-bold leading-[21px] text-epom-text">Linked (0)</h4>
              <span className="cursor-pointer text-[12px] font-semibold leading-[21px] text-epom-primary">
                Clear all
              </span>
            </div>
            <div className="mt-4 text-center text-[12px] leading-[18px] text-epom-muted">
              No selected SSP Endpoints.
            </div>
          </div>
        </div>
      </div>
    </CampaignWizardShell>
  );
}
