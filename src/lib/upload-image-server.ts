import sharp from "sharp";

const FORMAT_TO_MIME: Partial<Record<string, "image/jpeg" | "image/png" | "image/webp">> = {
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

/**
 * The client-declared MIME type (file.type) is just a label the caller
 * chose — never proof of what the bytes actually are. This decodes the
 * buffer to confirm it's a real image in an allowed format before it's
 * ever stored or served back to customers. Verification only: the
 * original bytes are stored unchanged, nothing is re-encoded.
 *
 * Server-only (uses sharp/libvips) — never import this from client code.
 */
export async function verifyImageBuffer(
  buffer: Buffer
): Promise<"image/jpeg" | "image/png" | "image/webp" | null> {
  try {
    const metadata = await sharp(buffer).metadata();
    if (!metadata.format) return null;
    return FORMAT_TO_MIME[metadata.format] ?? null;
  } catch {
    return null;
  }
}
