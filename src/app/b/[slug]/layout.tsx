import type { ReactNode } from "react";

/** Customer store — same frame as seller dashboard */
export default function PublicStoreLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-dvh bakery-frame-bg">{children}</div>;
}
