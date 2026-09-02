import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { isAdmin, isSameOriginMutation } from "@/lib/auth";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

function detectImage(bytes: Uint8Array) {
  if (bytes.length >= 12 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return { extension: "jpg", mime: "image/jpeg" };
  if (bytes.length >= 8 && bytes.slice(0, 8).every((byte, index) => byte === [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a][index])) return { extension: "png", mime: "image/png" };
  const text = Buffer.from(bytes.slice(0, 16)).toString("ascii");
  if (text.startsWith("RIFF") && text.slice(8, 12) === "WEBP") return { extension: "webp", mime: "image/webp" };
  if (text.slice(4, 12) === "ftypavif" || text.slice(4, 12) === "ftypavis") return { extension: "avif", mime: "image/avif" };
  return null;
}

export async function POST(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "غير مصرح." }, { status: 401 });
  if (!isSameOriginMutation(request)) return NextResponse.json({ error: "طلب غير مسموح." }, { status: 403 });

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) return NextResponse.json({ error: "اختر ملف صورة." }, { status: 400 });
    if (!file.size || file.size > MAX_IMAGE_BYTES) return NextResponse.json({ error: "حجم الصورة يجب أن يكون بين 1 بايت و5 ميغابايت." }, { status: 413 });

    const bytes = new Uint8Array(await file.arrayBuffer());
    const detected = detectImage(bytes);
    if (!detected) return NextResponse.json({ error: "الصيغ المسموحة: JPG وPNG وWebP وAVIF فقط." }, { status: 415 });

    const publicRoot = path.resolve(process.cwd(), "public");
    const uploadDirectory = path.resolve(process.cwd(), process.env.UPLOAD_DIR || "public/uploads");
    if (uploadDirectory !== publicRoot && !uploadDirectory.startsWith(`${publicRoot}${path.sep}`)) {
      throw new Error("UPLOAD_DIR must be inside public");
    }
    await mkdir(uploadDirectory, { recursive: true });
    const filename = `${Date.now()}-${randomUUID()}.${detected.extension}`;
    await writeFile(path.join(uploadDirectory, filename), bytes, { flag: "wx" });
    const relativeDirectory = path.relative(publicRoot, uploadDirectory).split(path.sep).join("/");
    return NextResponse.json({ src: `/${relativeDirectory}/${filename}`, mime: detected.mime });
  } catch (error) {
    console.error("Image upload failed", error);
    return NextResponse.json({ error: "تعذّر رفع الصورة. حاول مجدداً." }, { status: 500 });
  }
}
