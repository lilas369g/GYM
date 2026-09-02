import { NextRequest, NextResponse } from "next/server";
import { createSessionToken, isSameOriginMutation, sessionCookieOptions, SESSION_COOKIE, verifyAdminPassword } from "@/lib/auth";

const attempts = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 8;

export async function POST(request: NextRequest) {
  if (!isSameOriginMutation(request)) return NextResponse.json({ error: "طلب غير مسموح." }, { status: 403 });

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const now = Date.now();
  const current = attempts.get(ip);
  const state = !current || current.resetAt < now ? { count: 0, resetAt: now + WINDOW_MS } : current;
  if (state.count >= MAX_ATTEMPTS) {
    return NextResponse.json({ error: "محاولات كثيرة. حاول بعد عدة دقائق." }, { status: 429 });
  }

  let password = "";
  try {
    const body = await request.json();
    password = typeof body?.password === "string" ? body.password : "";
  } catch {
    return NextResponse.json({ error: "بيانات الدخول غير صالحة." }, { status: 400 });
  }

  if (!verifyAdminPassword(password)) {
    state.count += 1;
    attempts.set(ip, state);
    return NextResponse.json({ error: "كلمة المرور غير صحيحة." }, { status: 401 });
  }

  attempts.delete(ip);
  try {
    const response = NextResponse.json({ ok: true });
    response.cookies.set(SESSION_COOKIE, createSessionToken(), sessionCookieOptions);
    return response;
  } catch {
    return NextResponse.json({ error: "إعدادات جلسة الإدارة غير مكتملة." }, { status: 500 });
  }
}
