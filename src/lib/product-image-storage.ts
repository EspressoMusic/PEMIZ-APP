import { mkdir, writeFile } from "fs/promises";
import path from "path";
import {
  generateRandomImageFilename,
  isAllowedImageMime,
} from "@/lib/upload-image";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "products");

function supabaseConfig():
  | { base: string; key: string; bucket: string }
  | null {
  const base = (
    process.env.SUPABASE_URL ??
    process.env.NEXT_PUBLIC_SUPABASE_URL ??
    ""
  ).replace(/\/$/, "");
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.SUPABASE_SECRET_KEY ??
    "";
  const bucket = process.env.SUPABASE_PRODUCT_IMAGE_BUCKET ?? "product-images";

  if (!base || !key) return null;
  return { base, key, bucket };
}

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

  const config = supabaseConfig();
  if (config) {
    try {
      return await uploadToSupabase(config, objectPath, buffer, mime);
    } catch (e) {
      if (process.env.VERCEL === "1") throw e;
      console.warn(
        "[product-image] Supabase upload failed, using local storage:",
        e instanceof Error ? e.message : e
      );
    }
  } else if (process.env.VERCEL === "1") {
    throw new Error("SUPABASE_REQUIRED");
  }

  const dir = path.join(UPLOAD_DIR, businessId);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), buffer);
  return `/uploads/products/${objectPath}`;
}

async function uploadToSupabase(
  config: { base: string; key: string; bucket: string },
  objectPath: string,
  buffer: Buffer,
  contentType: string
): Promise<string> {
  const encodedPath = objectPath
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");

  const res = await fetch(
    `${config.base}/storage/v1/object/${config.bucket}/${encodedPath}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.key}`,
        apikey: config.key,
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

  return `${config.base}/storage/v1/object/public/${config.bucket}/${encodedPath}`;
}
