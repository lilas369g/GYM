import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { readContent } from "@/lib/content-store";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

export const dynamic = "force-dynamic";
export const metadata = { title: "إدارة المحتوى | نادي المنصور", robots: { index: false, follow: false } };

export default async function AdminPage() {
  if (!(await isAdmin())) redirect("/admin/login");
  return <div className="admin-body"><AdminDashboard initialContent={await readContent()} /></div>;
}
