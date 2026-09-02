import { NextResponse } from "next/server";
import { isAdmin, isSameOriginMutation } from "@/lib/auth";
import { readContent, saveContent } from "@/lib/content-store";
import { validateContent, ValidationError } from "@/lib/validation";

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "غير مصرح." }, { status: 401 });
  return NextResponse.json(await readContent(), { headers: { "Cache-Control": "no-store" } });
}

export async function PUT(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "غير مصرح." }, { status: 401 });
  if (!isSameOriginMutation(request)) return NextResponse.json({ error: "طلب غير مسموح." }, { status: 403 });

  try {
    const raw = await request.text();
    if (Buffer.byteLength(raw, "utf8") > 1_000_000) {
      return NextResponse.json({ error: "حجم المحتوى أكبر من المسموح." }, { status: 413 });
    }
    const content = validateContent(JSON.parse(raw));
    return NextResponse.json(await saveContent(content), { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if ((error as { code?: string }).code === "REVISION_CONFLICT") {
      return NextResponse.json({ error: (error as Error).message }, { status: 409 });
    }
    if (error instanceof ValidationError || error instanceof SyntaxError) {
      return NextResponse.json({ error: error.message }, { status: 422 });
    }
    console.error("Content save failed", error);
    return NextResponse.json({ error: "تعذّر حفظ المحتوى. حاول مجدداً." }, { status: 500 });
  }
}
