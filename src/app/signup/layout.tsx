import { AppLocaleShell } from "@/components/app-locale-shell";

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppLocaleShell>
      <div className="flex h-dvh min-h-0 flex-1 flex-col overflow-hidden">
        {children}
      </div>
    </AppLocaleShell>
  );
}
