import type { Metadata } from "next";
import { Suspense } from "react";
import { UserProfileView } from "@/components/UserProfileView";
import { readProfile, readAnalyticsSettings } from "@/app/actions";

export const metadata: Metadata = { title: "User Profile | Epom Market" };

// The profile row is editable at runtime, so this page can't be prerendered.
export const dynamic = "force-dynamic";

export default async function UserProfilePage() {
  const [profile, analyticsSettings] = await Promise.all([
    readProfile(),
    readAnalyticsSettings(),
  ]);

  return (
    <Suspense>
      <UserProfileView profile={profile} analyticsSettings={analyticsSettings} />
    </Suspense>
  );
}
