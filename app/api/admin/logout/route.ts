import { NextResponse } from "next/server";
import { isSameOriginMutation, SESSION_COOKIE } from "@/lib/auth";

export async function POST(request: Request) {
  if (!isSameOriginMutation(request)) return NextResponse.json({ error: "طلب غير مسموح." }, { status: 403 });
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, "", { httpOnly: true, expires: new Date(0), sameSite: "lax", path: "/" });
  return response;
}
