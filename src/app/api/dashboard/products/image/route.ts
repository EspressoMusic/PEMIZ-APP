import { jsonError, jsonOk } from "@/lib/api";
import { requireStoreOwner } from "@/lib/dashboard-auth";
import { storeProductImage } from "@/lib/product-image-storage";
import { enforceRateLimit } from "@/lib/security/rate-limit";
import { isAllowedImageMime, maxImageBytes } from "@/lib/upload-image";

export async function POST(req: Request) {
  const limited = enforceRateLimit(req, "dashboard:product-image", 40, 60 * 60 * 1000);
  if (limited) return limited;

  const ctx = await requireStoreOwner();
  if (!ctx.ok) return ctx.response;

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) {
    return jsonError("לא נבחר קובץ");
  }

  if (!isAllowedImageMime(file.type)) {
    return jsonError("יש להעלות תמונה בפורמט JPG, PNG או WebP");
  }
  if (file.size > maxImageBytes()) {
    return jsonError("גודל התמונה המקסימלי הוא 2MB");
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    const url = await storeProductImage(ctx.user.business.id, buffer, file.type);
    return jsonOk({ url });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (msg === "SUPABASE_REQUIRED") {
      return jsonError(
        "העלאת תמונות בפרודקשן דורשת הגדרת Supabase Storage (ראה .env.example)",
        503
      );
    }
    if (msg.startsWith("SUPABASE_UPLOAD:")) {
      return jsonError("שגיאה בהעלאה ל-Storage", 502);
    }
    return jsonError("שגיאה בשמירת התמונה", 500);
  }
}
