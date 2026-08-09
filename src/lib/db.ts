/**
 * Runtime access to Supabase — server-side only.
 *
 * The rest of the app still treats Supabase as a build-time store (see
 * `scripts/supabase.mjs`). These helpers exist for the two rows the UI can
 * actually edit: a campaign's daily budget limits and the user profile.
 *
 * The service role key bypasses RLS, so nothing here may ever run in the
 * browser. Import it from server components and server actions only.
 */

function credentials() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Database is not configured: set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY on the server.");
  }
  return { rest: `${url.replace(/\/$/, "")}/rest/v1`, key };
}

async function request(path: string, init: RequestInit = {}) {
  const { rest, key } = credentials();
  const res = await fetch(`${rest}/${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      ...init.headers,
    },
  });
  if (!res.ok) throw new Error(`supabase ${res.status}: ${await res.text()}`);
  return res;
}

/** First matching row, or null when the table has none. */
export async function selectOne<T>(path: string): Promise<T | null> {
  const rows = (await (await request(path)).json()) as T[];
  return rows[0] ?? null;
}

/** Insert-or-update on the primary key, returning the stored row. */
export async function upsert<T>(table: string, row: Record<string, unknown>): Promise<T> {
  const res = await request(table, {
    method: "POST",
    body: JSON.stringify(row),
    // merge-duplicates makes this an upsert; representation returns the result.
    headers: { Prefer: "resolution=merge-duplicates,return=representation" },
  });
  return ((await res.json()) as T[])[0];
}
