type SendResult = { sent: boolean; devUrl?: string };

export async function sendVerificationEmail(
  to: string,
  verifyUrl: string,
  ownerName: string
): Promise<SendResult> {
  const subject = "אימות אימייל — פתיחת החנות שלך ב-Linky";
  const html = `
    <div dir="rtl" style="font-family:sans-serif;line-height:1.6">
      <p>שלום ${ownerName},</p>
      <p>פתחת חנות ב-Linky. לאימות האימייל ולהפעלת החנות והדשבורד, לחץ על הקישור:</p>
      <p><a href="${verifyUrl}">${verifyUrl}</a></p>
      <p>הקישור תקף ל-24 שעות.</p>
      <p>אם לא ביקשת זאת, אפשר להתעלם מהודעה זו.</p>
    </div>
  `;

  if (process.env.NODE_ENV === "development") {
    console.log(`[Linky Email] To: ${to}\nSubject: ${subject}\n${verifyUrl}`);
    return { sent: false, devUrl: verifyUrl };
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? "onboarding@resend.dev";

  if (apiKey) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to: [to], subject, html }),
    });
    if (!res.ok) {
      console.error("[Linky Email] Resend failed", await res.text());
      return { sent: false, devUrl: verifyUrl };
    }
    return { sent: true };
  }

  console.log(`[Linky Email] No RESEND_API_KEY — ${verifyUrl}`);
  return { sent: false, devUrl: verifyUrl };
}

export async function sendPasswordResetEmail(
  to: string,
  resetUrl: string,
  ownerName: string
): Promise<SendResult> {
  const subject = "איפוס סיסמה — Linky";
  const html = `
    <div dir="rtl" style="font-family:sans-serif;line-height:1.6">
      <p>שלום ${ownerName},</p>
      <p>קיבלנו בקשה לאיפוס הסיסמה לחשבון שלך. לבחירת סיסמה חדשה, לחץ על הקישור:</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>הקישור תקף לשעה אחת.</p>
      <p>אם לא ביקשת זאת, אפשר להתעלם מהודעה זו.</p>
    </div>
  `;

  if (process.env.NODE_ENV === "development") {
    console.log(`[Linky Email] To: ${to}\nSubject: ${subject}\n${resetUrl}`);
    return { sent: false, devUrl: resetUrl };
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? "onboarding@resend.dev";

  if (apiKey) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to: [to], subject, html }),
    });
    if (!res.ok) {
      console.error("[Linky Email] Resend failed", await res.text());
      return { sent: false, devUrl: resetUrl };
    }
    return { sent: true };
  }

  console.log(`[Linky Email] No RESEND_API_KEY — ${resetUrl}`);
  return { sent: false, devUrl: resetUrl };
}
