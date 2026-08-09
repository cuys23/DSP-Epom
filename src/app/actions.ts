"use server";

import { revalidatePath } from "next/cache";
import { selectOne, upsert } from "@/lib/db";
import {
  DEFAULT_ANALYTICS_SETTINGS,
  DEFAULT_BUDGET,
  DEFAULT_PROFILE,
  type AnalyticsSettings,
  type CampaignBudget,
  type UserProfile,
} from "@/lib/records";

// --------------------------------------------------------------- row shapes

interface BudgetRow {
  starts_at: string;
  ends_at: string;
  spend_limit: number | string;
  impression_limit: number;
  even_pacing: boolean;
}

const BUDGET_COLUMNS =
  "starts_at,ends_at,spend_limit,impression_limit,even_pacing";

/** Postgres hands back a full ISO timestamp; the form works in minutes. */
const toMinutes = (iso: string) => new Date(iso).toISOString().slice(0, 16);

interface ProfileRow {
  timezone: string;
  first_name: string;
  last_name: string;
  email: string;
  company: string;
  country: string;
  phone: string;
}

interface AnalyticsRow {
  action_0_title: string;
  action_0_multi: boolean;
  action_1_title: string;
  action_1_multi: boolean;
  action_2_title: string;
  action_2_multi: boolean;
}

const toBudget = (r: BudgetRow): CampaignBudget => ({
  startsAt: toMinutes(r.starts_at),
  endsAt: toMinutes(r.ends_at),
  // numeric comes back as a string over PostgREST.
  spendLimit: Number(r.spend_limit),
  impressionLimit: r.impression_limit,
  evenPacing: r.even_pacing,
});

const toProfile = (r: ProfileRow): UserProfile => ({
  timezone: r.timezone,
  firstName: r.first_name,
  lastName: r.last_name,
  email: r.email,
  company: r.company,
  country: r.country,
  phone: r.phone,
});

const toAnalytics = (r: AnalyticsRow): AnalyticsSettings => ({
  actions: [
    { title: r.action_0_title, multi: r.action_0_multi },
    { title: r.action_1_title, multi: r.action_1_multi },
    { title: r.action_2_title, multi: r.action_2_multi },
  ],
});

// ----------------------------------------------------------- action results

/**
 * Writes report failure instead of throwing. An uncaught throw in a server
 * action reaches the browser as Next's generic "An error occurred in the Server
 * Components render" in production, which tells the user nothing — a missing
 * env var, a rejected value and a database outage all look identical.
 */
export type ActionResult<T> =
  { ok: true; data: T } | { ok: false; error: string };

async function attempt<T>(write: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    return { ok: true, data: await write() };
  } catch (e) {
    console.error("supabase write failed:", e);
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Could not save.",
    };
  }
}

// ------------------------------------------------------------ safe fallback

/**
 * Reads fall back to the seed values rather than failing the page: the tables
 * only exist after the migrations have been run, and an unreachable database
 * should still render the clone.
 */
async function readOr<T>(
  fallback: T,
  read: () => Promise<T | null>,
): Promise<T> {
  try {
    return (await read()) ?? fallback;
  } catch (e) {
    console.error("supabase read failed, using defaults:", e);
    return fallback;
  }
}

// ------------------------------------------------------------------ budget

/**
 * `fallback` is the campaign's own derived flight and caps, so a campaign with
 * no stored row still shows its real numbers rather than another campaign's.
 */
export async function readBudget(
  campaignId: string,
  fallback: CampaignBudget = DEFAULT_BUDGET,
): Promise<CampaignBudget> {
  return readOr(fallback, async () => {
    const row = await selectOne<BudgetRow>(
      `campaign_budgets?campaign_id=eq.${campaignId}&select=${BUDGET_COLUMNS}`,
    );
    return row && toBudget(row);
  });
}

export async function saveBudget(
  campaignId: string,
  budget: CampaignBudget,
): Promise<ActionResult<CampaignBudget>> {
  return attempt(async () => {
    // Reject anything that would render as a nonsense budget rather than storing it.
    const spendLimit = Number(budget.spendLimit);
    const impressionLimit = Math.trunc(Number(budget.impressionLimit));
    if (!Number.isFinite(spendLimit) || spendLimit < 0)
      throw new Error("invalid spend limit");
    if (!Number.isFinite(impressionLimit) || impressionLimit < 0) {
      throw new Error("invalid impression limit");
    }

    const startsAt = new Date(`${budget.startsAt}:00Z`);
    const endsAt = new Date(`${budget.endsAt}:00Z`);
    if (Number.isNaN(startsAt.valueOf()) || Number.isNaN(endsAt.valueOf())) {
      throw new Error("Enter a valid start and end date.");
    }
    if (endsAt <= startsAt)
      throw new Error("The end date must be after the start date.");

    const row = await upsert<BudgetRow>("campaign_budgets", {
      campaign_id: campaignId,
      starts_at: startsAt.toISOString(),
      ends_at: endsAt.toISOString(),
      spend_limit: spendLimit,
      impression_limit: impressionLimit,
      even_pacing: budget.evenPacing,
      updated_at: new Date().toISOString(),
    });
    revalidatePath(`/campaigns/edit/${campaignId}`);
    return toBudget(row);
  });
}

// ----------------------------------------------------------------- profile

export async function readProfile(): Promise<UserProfile> {
  return readOr(DEFAULT_PROFILE, async () => {
    const row = await selectOne<ProfileRow>(
      "user_profile?id=eq.me&select=timezone,first_name,last_name,email,company,country,phone",
    );
    return row && toProfile(row);
  });
}

export async function saveProfile(
  profile: UserProfile,
): Promise<ActionResult<UserProfile>> {
  return attempt(async () => {
    const trimmed = {
      timezone: profile.timezone.trim(),
      first_name: profile.firstName.trim(),
      last_name: profile.lastName.trim(),
      // Email is read-only in the UI; keep the stored value authoritative.
      email: DEFAULT_PROFILE.email,
      company: profile.company.trim(),
      country: profile.country.trim(),
      phone: profile.phone.trim(),
    };
    if (!trimmed.first_name || !trimmed.last_name || !trimmed.company) {
      throw new Error("First name, last name and company are required");
    }

    const row = await upsert<ProfileRow>("user_profile", {
      id: "me",
      ...trimmed,
      updated_at: new Date().toISOString(),
    });
    revalidatePath("/user-profile");
    return toProfile(row);
  });
}

// ------------------------------------------------------ analytics settings

export async function readAnalyticsSettings(): Promise<AnalyticsSettings> {
  return readOr(DEFAULT_ANALYTICS_SETTINGS, async () => {
    const row = await selectOne<AnalyticsRow>(
      "user_analytics_settings?id=eq.me&select=action_0_title,action_0_multi,action_1_title,action_1_multi,action_2_title,action_2_multi",
    );
    return row && toAnalytics(row);
  });
}

export async function saveAnalyticsSettings(
  settings: AnalyticsSettings,
): Promise<ActionResult<AnalyticsSettings>> {
  return attempt(async () => {
    const [a0, a1, a2] = settings.actions;
    const row = await upsert<AnalyticsRow>("user_analytics_settings", {
      id: "me",
      action_0_title: a0.title.trim() || "Action 0",
      action_0_multi: a0.multi,
      action_1_title: a1.title.trim() || "Action 1",
      action_1_multi: a1.multi,
      action_2_title: a2.title.trim() || "Action 2",
      action_2_multi: a2.multi,
      updated_at: new Date().toISOString(),
    });
    revalidatePath("/user-profile");
    return toAnalytics(row);
  });
}
