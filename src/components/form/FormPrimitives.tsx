import { cn } from "@/lib/utils";
import { MaterialIcon } from "@/components/MaterialIcon";

/** White card that groups a section of the wizard form. */
export function FormBox({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("flex flex-col rounded bg-epom-surface p-6", className)}>{children}</div>
  );
}

export function FormHeading({
  as: Tag = "h3",
  className,
  children,
}: {
  as?: "h3" | "h4";
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Tag className={cn("text-[16px] font-bold leading-6 text-epom-text", className)}>{children}</Tag>
  );
}

export function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="mb-1 block text-[12px] font-semibold leading-[18px] text-epom-muted">
      {children}
      {required && <span className="ml-1 text-epom-primary">*</span>}
    </label>
  );
}

/** 36px text input matching `.custom-input__field` / `.form-control`. */
export function TextField({
  placeholder,
  className,
}: {
  placeholder?: string;
  className?: string;
}) {
  return (
    <input
      type="text"
      readOnly
      placeholder={placeholder}
      className={cn(
        "h-9 w-full rounded border border-epom-border bg-epom-surface px-3 text-[14px] leading-5 text-epom-text",
        "transition-[border-color,box-shadow] duration-150 ease-in-out focus:border-epom-primary focus:outline-none",
        className,
      )}
    />
  );
}

/**
 * Closed select control. The live app opens a custom panel; the clone renders
 * the resting state, which is all this URL shows.
 */
export function SelectField({
  value,
  placeholder,
  className,
}: {
  value?: string;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={cn("relative h-9 w-full", className)}>
      <div className="flex h-9 w-full items-center rounded border border-epom-border py-[6px] pl-[11px] pr-9 text-[14px] leading-[21px]">
        <span className={value ? "text-epom-text" : "text-epom-muted"}>{value ?? placeholder}</span>
      </div>
      <MaterialIcon
        name="arrow_drop_down"
        className="pointer-events-none absolute right-3 top-2 block text-[20px] leading-5 text-epom-muted"
      />
    </div>
  );
}

/** Search input with the trailing magnifier, used by the dual-list tabs. */
export function SearchField({ className }: { className?: string }) {
  return (
    <div className={cn("relative", className)}>
      <input
        type="text"
        readOnly
        placeholder="Search"
        className="h-9 w-full rounded border border-epom-border bg-epom-surface px-3 py-2 text-[14px] leading-5 text-epom-text transition-[border-color,box-shadow] duration-150 ease-in-out focus:border-epom-primary focus:outline-none"
      />
      <MaterialIcon
        name="search"
        className="pointer-events-none absolute right-2 top-2 block text-[20px] leading-5 text-epom-muted"
      />
    </div>
  );
}

const BANNER_VARIANTS = {
  info: {
    box: "bg-[#ccdef2] items-start",
    icon: "text-[#005bc0]",
    name: "info",
  },
  warning: {
    // 21px, not the inherited 20px: the live banner's content is an inline span,
    // so its font box (not line-height) sets the row height.
    box: "bg-[#ffefd5] items-center leading-[21px]",
    icon: "text-[#987100]",
    name: "warning",
  },
} as const;

export function Banner({
  variant,
  className,
  children,
}: {
  variant: keyof typeof BANNER_VARIANTS;
  className?: string;
  children: React.ReactNode;
}) {
  const v = BANNER_VARIANTS[variant];
  return (
    <div className={cn("flex gap-4 rounded p-4 text-epom-text", v.box, className)}>
      <MaterialIcon name={v.name} className={cn("block shrink-0 text-[16px] leading-4", v.icon)} />
      <div className="flex-1">{children}</div>
    </div>
  );
}

/**
 * Empty data table used by the Bidding Strategy tab. Column widths are fixed
 * because the live table's auto layout resolves to specific pixel widths.
 */
export function EmptyTable({ columns }: { columns: { label: string; width: number }[] }) {
  return (
    <div className="rounded-[3px] border border-epom-border bg-epom-surface">
      <table className="w-full table-fixed border-collapse">
        <thead>
          <tr>
            {columns.map((c) => (
              <th
                key={c.label}
                style={{ width: c.width }}
                className="h-[34px] bg-[#e1e2ec] px-3 py-2 text-left text-[12px] font-semibold leading-[18px] text-epom-text"
              >
                {c.label}
              </th>
            ))}
            <th className="h-[34px] w-6 bg-[#e1e2ec] px-3 py-2" />
          </tr>
        </thead>
        <tbody>
          <tr>
            <td colSpan={columns.length + 1} className="h-[66px] px-3 py-4">
              <div className="flex h-[34px] items-center justify-center text-[12px] leading-3 text-epom-muted">
                No available data to show.
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
