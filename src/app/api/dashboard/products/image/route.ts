import { jsonError, jsonOk } from "@/lib/api";
import { requireCatalogOwner } from "@/lib/dashboard-catalog-auth";
import { storeProductImage } from "@/lib/product-image-storage";
import { enforceRateLimit } from "@/lib/security/rate-limit";
import { recordSystemIncident } from "@/lib/system-incidents";
import {
  maxImageBytes,
  resolveUploadedImageMime,
  verifyImageBuffer,
} from "@/lib/upload-image";

export async function POST(req: Request) {
  const limited = await enforceRateLimit(req, "dashboard:product-image", 40, 60 * 60 * 1000);
  if (limited) return limited;

  const ctx = await requireCatalogOwner();
  if (!ctx.ok) return ctx.response;

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) {
    return jsonError("לא נבחר קובץ");
  }

  const mime = resolveUploadedImageMime(file);
  if (!mime) {
    return jsonError("יש להעלות תמונה בפורמט JPG, PNG או WebP");
  }
  if (file.size > maxImageBytes()) {
    return jsonError("גודל התמונה המקסימלי הוא 2MB");
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  const verifiedMime = await verifyImageBuffer(buffer);
  if (!verifiedMime) {
    return jsonError("הקובץ שהועלה אינו תמונה תקינה");
  }

  try {
    const url = await storeProductImage(ctx.user.business.id, buffer, verifiedMime);
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
      recordSystemIncident({
        context: "dashboard:product-image",
        publicMessage: "שגיאה בהעלאה ל-Storage",
        developerMessage: msg,
        error: e,
      });
      return jsonError("שגיאה בהעלאה ל-Storage", 502);
    }
    return jsonError("שגיאה בשמירת התמונה", 500);
  }
}
