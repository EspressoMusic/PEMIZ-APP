"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Alert, Panel, PageTitle } from "@/components/ui";
import { WebShell } from "@/components/web-shell";

export default function PendingApprovalPage() {
  const router = useRouter();
  const [businessName, setBusinessName] = useState("");
  const [checking, setChecking] = useState(true);

  async function checkStatus() {
    const res = await fetch("/api/auth/me");
    const data = await res.json();
    if (!res.ok) {
      router.replace("/login");
      return;
    }
    if (!data.user?.business) {
      router.replace("/onboarding");
      return;
    }
    if (data.user.business.isActive) {
      router.replace("/dashboard");
      return;
    }
    setBusinessName(data.user.business.name ?? "");
    setChecking(false);
  }

  useEffect(() => {
    checkStatus();
    const id = setInterval(checkStatus, 8000);
    return () => clearInterval(id);
  }, [router]);

  if (checking) {
    return (
      <WebShell>
        <div className="py-20 text-center text-bakery-muted">טוען...</div>
      </WebShell>
    );
  }

  return (
    <WebShell>
      <div className="mx-auto max-w-md px-4 py-12">
        <Panel>
          <PageTitle subtitle="לאחר האישור תוכל/י להיכנס לדשבורד ולנהל את החנות">
            ממתינים לאישור מנהל
          </PageTitle>

          {businessName && (
            <p className="mb-4 text-[15px] leading-[1.45] text-bakery-muted">
              החנות <strong className="text-bakery-ink">{businessName}</strong> נשמרה
              במערכת. המנהל יאשר את הבקשה בקרוב.
            </p>
          )}

          <Alert variant="info">
            אין צורך לעשות כלום כרגע. כשהחנות תאושר, הדף יעבור אוטומטית לדשבורד — או
            התחבר/י שוב מאוחר יותר.
          </Alert>

          <p className="mt-6 text-center text-[14px] text-bakery-muted">
            <Link href="/login" className="font-bold hover:text-bakery-ink">
              יציאה / התחברות מחדש
            </Link>
          </p>
        </Panel>
      </div>
    </WebShell>
  );
}
