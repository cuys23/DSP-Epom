import type { NavItem } from "@/types/nav";

/** Sidebar navigation, transcribed verbatim from dsp.epom.market. */
export const NAV_ITEMS: NavItem[] = [
  { label: "Explore", icon: "rocket_launch", href: "/explore" },
  { label: "Dashboard", icon: "dashboard", href: "/dashboard" },
  { label: "Campaigns", icon: "campaign", href: "/campaigns" },
  { label: "Audience", icon: "groups", href: "/audience" },
  { label: "Conversion Tracking", icon: "link", href: "/conversion-tracking" },
  {
    label: "Analytics",
    icon: "assessment",
    href: "/analytics",
    children: [
      { label: "Analytics", icon: "assessment", href: "/analytics" },
      { label: "Traffic Funnel", icon: "leaderboard", href: "/traffic-funnel" },
    ],
  },
  { label: "Creative Assets", icon: "image", href: "/creative-assets" },
  { label: "Filters", icon: "filter_alt", href: "/filters" },
  {
    label: "Retargeting",
    icon: "sync",
    href: "/retargeting/ifa",
    children: [
      { label: "Segments", icon: "segment", href: "/retargeting/segments" },
      { label: "IFA Lists", icon: "adjust", href: "/retargeting/ifa" },
      { label: "User IDs", icon: "person_pin_circle", href: "/retargeting/user-ids" },
    ],
  },
  { label: "Custom Locations", icon: "location_on", href: "/custom-locations" },
  { label: "Billing", icon: "credit_card", href: "/billing" },
  {
    label: "Planning",
    icon: "calendar_month",
    href: "/planning",
    children: [
      { label: "Media plannings", icon: "bar_chart", href: "/planning" },
      { label: "Demand Analytics", icon: "data_usage", href: "/demand-analytics" },
    ],
  },
  {
    label: "Autopilot",
    icon: "play_circle",
    href: "/autopilot",
    children: [
      { label: "Bidding Rules", icon: "device_hub", href: "/autopilot/bidding-rules" },
      { label: "Autopilot Log", icon: "published_with_changes", href: "/autopilot/autopilot-logs" },
      { label: "Bid Modifiers", icon: "price_change", href: "/autopilot/bid-modifiers" },
    ],
  },
  { label: "Tag Manager", icon: "sell", href: "/tag-manager" },
  { label: "Access Management", icon: "how_to_reg", href: "/manager/access-management" },
  { label: "User Activity", icon: "query_builder", href: "/manager/user-activity" },
];
