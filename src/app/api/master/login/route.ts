import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api";
import {
  createMasterSession,
  getMasterKeyFromEnv,
  verifyMasterKey,
} from "@/lib/master-auth";

export async function POST(req: Request) {
  if (!getMasterKeyFromEnv()) {
    return jsonError("סיסמת מנהל לא הוגדרה בשרת (MASTER_KEY)", 503);
  }

  let password = "";
  try {
    const body = (await req.json()) as { password?: string };
    password = typeof body.password === "string" ? body.password : "";
  } catch {
    return jsonError("בקשה לא תקינה", 400);
  }

  if (!password.trim()) {
    return jsonError("נא להזין סיסמה", 400);
  }

  if (!verifyMasterKey(password)) {
    return jsonError("סיסמה שגויה", 401);
  }

  await createMasterSession();
  return NextResponse.json({ ok: true });
}
