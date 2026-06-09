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

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function sendPlatformMessageToOwner(
  to: string,
  ownerName: string,
  storeName: string,
  message: string
): Promise<SendResult> {
  const subject = `הודעה מצוות Linky — ${storeName}`;
  const bodyHtml = escapeHtml(message.trim()).replace(/\n/g, "<br />");
  const html = `
    <div dir="rtl" style="font-family:sans-serif;line-height:1.6">
      <p>שלום ${escapeHtml(ownerName)},</p>
      <p>קיבלת הודעה מצוות Linky בנוגע לחנות <strong>${escapeHtml(storeName)}</strong>:</p>
      <p style="margin:16px 0;padding:12px 14px;border-radius:12px;background:#f5efe6">${bodyHtml}</p>
      <p style="color:#6b5c52;font-size:14px">אפשר להשיב למייל זה אם יש שאלות.</p>
    </div>
  `;

  if (process.env.NODE_ENV === "development") {
    console.log(
      `[Linky Email] Platform message to ${to}\nSubject: ${subject}\n${message.trim()}`
    );
    return { sent: false };
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
      return { sent: false };
    }
    return { sent: true };
  }

  console.log(`[Linky Email] No RESEND_API_KEY — platform message to ${to}`);
  return { sent: false };
}

export type TrialWarningDaysLeft = 7 | 3 | 1;

function trialWarningCopy(daysLeft: TrialWarningDaysLeft, storeName: string, endsAt: Date) {
  const endsLabel = endsAt.toLocaleDateString("he-IL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const when =
    daysLeft === 7
      ? "בעוד שבוע"
      : daysLeft === 3
        ? "בעוד 3 ימים"
        : "מחר";
  const subject =
    daysLeft === 1
      ? `תזכורת: מחר מסתיימת תקופת הניסיון — ${storeName}`
      : `תזכורת: תקופת הניסיון מסתיימת ${when} — ${storeName}`;
  const html = `
    <div dir="rtl" style="font-family:sans-serif;line-height:1.6">
      <p>שלום,</p>
      <p>תקופת הניסיון של החנות <strong>${escapeHtml(storeName)}</strong> מסתיימת ${when} (${endsLabel}).</p>
      <p>אחרי סיום הניסיון החנות תיסגר ללקוחות עד שממשיכים מנוי.</p>
      <p>כדאי להיכנס לדשבורד ולוודא שהכל מוכן, או לשדרג מנוי לפני הסגירה.</p>
    </div>
  `;
  return { subject, html };
}

export async function sendTrialEndingWarningEmail(
  to: string,
  storeName: string,
  daysLeft: TrialWarningDaysLeft,
  trialEndsAt: Date
): Promise<SendResult> {
  const { subject, html } = trialWarningCopy(daysLeft, storeName, trialEndsAt);

  if (process.env.NODE_ENV === "development") {
    console.log(
      `[Linky Email] Trial ${daysLeft}d warning to ${to}\nSubject: ${subject}`
    );
    return { sent: false };
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
      return { sent: false };
    }
    return { sent: true };
  }

  console.log(`[Linky Email] No RESEND_API_KEY — trial warning to ${to}`);
  return { sent: false };
}
