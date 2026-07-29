/**
 * The creative type picked in step 1 of the wizard. The live site keeps it in
 * Angular state; this clone has no store, so the session carries it instead.
 */
const KEY = "epom:creative-type";

export function rememberCreativeType(label: string) {
  sessionStorage.setItem(KEY, label);
}

export function readCreativeType(): string | null {
  return sessionStorage.getItem(KEY);
}

// ponytail: only Video's icon is confirmed against the live site; the other
// three are the closest Material equivalents. Re-check when the live account
// has a banner/native/interstitial campaign to compare against.
const ICONS: Record<string, string> = {
  Banner: "crop_16_9",
  Video: "smart_display",
  Native: "view_quilt",
  Interstitial: "smartphone",
};

export function creativeTypeIcon(label: string): string {
  return ICONS[label] ?? "smart_display";
}
