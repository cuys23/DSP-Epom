/**
 * The dashboard chart card. For an account with no campaigns the Highcharts
 * layer is faded out and this "No data yet" overlay is what's visible, so the
 * clone renders the empty state only.
 */
export function ChartCard() {
  return (
    <div className="relative mb-4 min-h-[500px] rounded-[3px] bg-epom-surface p-6">
      {/* Inset by the card's 24px padding — matches the live overlay's offset parent. */}
      <div className="absolute inset-x-6 top-6 flex h-[350px] flex-col place-content-center bg-epom-surface text-center">
        <div className="mb-2 text-[16px] font-bold leading-6 text-epom-text">No data yet</div>
        <div className="text-[12px] leading-[21px] text-epom-muted">
          You don&apos;t have campaigns yet
        </div>
        <div className="mt-4">
          <button
            type="button"
            className="inline-block min-w-24 whitespace-nowrap rounded bg-epom-primary px-4 py-[7.5px] text-[14px] font-semibold leading-[21px] text-white shadow-epom-button transition-colors hover:bg-epom-primary-hover active:bg-epom-primary active:shadow-none"
          >
            Create new campaign
          </button>
        </div>
      </div>
    </div>
  );
}
