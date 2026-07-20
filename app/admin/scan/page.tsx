import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin-auth";
import Scanner from "@/components/admin/Scanner";

export const metadata: Metadata = {
  title: "Scan Ticket — BUBU 30",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function ScanPage() {
  if (!(await isAdmin())) redirect("/admin");
  return <Scanner />;
}
