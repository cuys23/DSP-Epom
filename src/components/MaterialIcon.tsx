import { cn } from "@/lib/utils";

interface MaterialIconProps {
  /** Ligature name, e.g. "dashboard". */
  name: string;
  /** The target site uses the outlined family everywhere except the calendar glyph. */
  filled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function MaterialIcon({ name, filled, className, style }: MaterialIconProps) {
  return (
    <span
      aria-hidden
      className={cn(filled ? "mi" : "mi-outlined", className)}
      style={style}
    >
      {name}
    </span>
  );
}
