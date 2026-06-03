import type { ReactNode } from "react";

/** Customer store matches bakery app: LTR + full-screen mobile shell */
export default function PublicStoreLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[100dvh] bg-customer-bg">{children}</div>
  );
}
