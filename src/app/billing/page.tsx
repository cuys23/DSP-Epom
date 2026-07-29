import type { Metadata } from "next";
import { BillingView } from "@/components/BillingView";

export const metadata: Metadata = { title: "Transactions | Epom Market" };

export default function BillingPage() {
  return <BillingView />;
}
