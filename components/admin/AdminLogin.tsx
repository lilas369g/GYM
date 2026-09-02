"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/Icon";

export function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "تعذّر تسجيل الدخول.");
      router.replace("/admin");
      router.refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "تعذّر تسجيل الدخول.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="login-card" onSubmit={submit}>
      <a href="/" className="brand-link"><Icon name="dumbbell" size={27} /><strong>المنصور</strong></a>
      <h1>لوحة إدارة الموقع</h1>
      <p>أدخل كلمة مرور المالك للمتابعة.</p>
      {error && <p className="form-error" role="alert">{error}</p>}
      <label htmlFor="password">كلمة المرور</label>
      <input id="password" name="password" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} />
      <button className="button" type="submit" disabled={busy}>{busy ? "جارٍ التحقق…" : "دخول آمن"}</button>
    </form>
  );
}
