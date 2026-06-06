"use client";

import { Smartphone } from "lucide-react";
import { Panel } from "@/components/ui";
import { PwaInstallPanel } from "@/components/pwa/pwa-install-panel";

const COPY = {
  title: "התקינו את Linky במכשיר",
  subtitle:
    "אותן פונקציות כמו באתר — פתיחת חנות, ניהול הזמנות ולקוחות — ישירות מהמסך הראשי.",
  installedTitle: "האפליקציה מותקנת",
  installedHint: "אפשר לפתוח את Linky מהמסך הראשי בכל עת.",
  installButton: "התקנת אפליקציה",
  iosStep1: "לחצו על כפתור השיתוף בתחתית Safari",
  iosStep2: "גללו ובחרו «הוספה למסך הבית»",
  iosStep3: "אשרו — האפליקציה תופיע במסך הבית",
  androidHint:
    "ב-Chrome: תפריט (⋮) → «התקן אפליקציה» או «הוסף למסך הבית».",
  desktopHint: "במחשב: Chrome/Edge → אייקון ההתקנה בשורת הכתובת.",
};

export function HomeLandingInstall() {
  return (
    <section className="app-safe-x px-4 pb-10 sm:pb-14">
      <div className="auth-surface mx-auto w-full max-w-[min(100%,28rem)] sm:max-w-[26rem]">
        <Panel className="dashboard-card sm:p-7">
          <div className="mb-4 flex justify-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-bakery-square/70">
              <Smartphone className="h-6 w-6 text-bakery-primary" strokeWidth={1.75} />
            </span>
          </div>
          <PwaInstallPanel copy={COPY} />
        </Panel>
      </div>
    </section>
  );
}
