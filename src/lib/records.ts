/**
 * The two records the UI can edit at runtime, plus the values to fall back on
 * before anything has been saved. Shared by the server pages that read them and
 * the server actions that write them.
 */

export interface CampaignBudget {
  /** Local-style "YYYY-MM-DDTHH:mm" in UTC — the page prints everything as UTC+0. */
  startsAt: string;
  endsAt: string;
  spendLimit: number;
  impressionLimit: number;
  evenPacing: boolean;
}

export interface UserProfile {
  timezone: string;
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  country: string;
  phone: string;
}

/** What the live budget card shows for this campaign before any edit. */
export const DEFAULT_BUDGET: CampaignBudget = {
  startsAt: "2026-07-28T07:03",
  endsAt: "2026-07-31T23:59",
  spendLimit: 100,
  impressionLimit: 10_000,
  evenPacing: false,
};

/** "July 28, 2026 07:03 UTC+0" — the format the budget card's columns print. */
export function formatFlight(value: string): string {
  const [date, time] = value.split("T");
  const label = new Date(`${date}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
  return `${label} ${time} UTC+0`;
}

export const DEFAULT_PROFILE: UserProfile = {
  timezone: "UTC+00:00 London, GBR; Reykjavik, ISL; Dakar, SEN",
  firstName: "Minh",
  lastName: "Do",
  email: "admin@vinmedia.net",
  company: "Adstarget",
  country: "Viet Nam",
  phone: "0999999",
};

export interface AnalyticsAction {
  title: string;
  multi: boolean;
}

export interface AnalyticsSettings {
  actions: [AnalyticsAction, AnalyticsAction, AnalyticsAction];
}

export const DEFAULT_ANALYTICS_SETTINGS: AnalyticsSettings = {
  actions: [
    { title: "Action 0", multi: false },
    { title: "Action 1", multi: false },
    { title: "Action 2", multi: false },
  ],
};
