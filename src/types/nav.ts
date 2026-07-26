export interface NavItem {
  /** Visible label. */
  label: string;
  /** Material Icons ligature name, e.g. "rocket_launch". */
  icon: string;
  href: string;
  children?: NavItem[];
}

export interface Crumb {
  label: string;
  /** Omitted for the current (last) crumb, which renders as plain text. */
  href?: string;
}
