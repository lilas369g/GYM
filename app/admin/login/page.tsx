import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { AdminLogin } from "@/components/admin/AdminLogin";

export const metadata = { title: "دخول الإدارة | نادي المنصور" };

export default async function LoginPage() {
  if (await isAdmin()) redirect("/admin");
  return <div className="admin-login"><AdminLogin /></div>;
}
