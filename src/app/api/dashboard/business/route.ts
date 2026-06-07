import { jsonOk, jsonServerError } from "@/lib/api";
import { requireBusinessOwner } from "@/lib/dashboard-auth";
import { deleteBusinessById } from "@/lib/delete-business";

export async function DELETE() {
  const ctx = await requireBusinessOwner();
  if (!ctx.ok) return ctx.response;
  try {
    await deleteBusinessById(ctx.user.business.id);
    return jsonOk({ deleted: true });
  } catch (error) {
    return jsonServerError(error, "dashboard:business:delete");
  }
}
