import { mkdir, writeFile } from "fs/promises";
import path from "path";
import {
  generateRandomImageFilename,
  isAllowedImageMime,
} from "@/lib/upload-image";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "products");

export async function storeProductImage(
  businessId: string,
  buffer: Buffer,
  mime: string
): Promise<string> {
  if (!isAllowedImageMime(mime)) {
    throw new Error("INVALID_MIME");
  }

  const filename = generateRandomImageFilename(mime);
  const objectPath = `${businessId}/${filename}`;

  const supabaseUrl = await trySupabaseUpload(objectPath, buffer, mime);
  if (supabaseUrl) return supabaseUrl;

  if (process.env.VERCEL === "1") {
    throw new Error("SUPABASE_REQUIRED");
  }

  const dir = path.join(UPLOAD_DIR, businessId);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), buffer);
  return `/uploads/products/${objectPath}`;
}

async function trySupabaseUpload(
  objectPath: string,
  buffer: Buffer,
  contentType: string
): Promise<string | null> {
  const base = process.env.SUPABASE_URL?.replace(/\/$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bucket = process.env.SUPABASE_PRODUCT_IMAGE_BUCKET ?? "product-images";

  if (!base || !key) return null;

  const res = await fetch(
    `${base}/storage/v1/object/${bucket}/${objectPath}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": contentType,
        "x-upsert": "true",
      },
      body: new Uint8Array(buffer),
    }
  );

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`SUPABASE_UPLOAD:${res.status}:${text.slice(0, 200)}`);
  }

  return `${base}/storage/v1/object/public/${bucket}/${objectPath}`;
}
