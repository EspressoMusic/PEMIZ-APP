import { assertDevPreviewAllowed } from "@/lib/assert-dev-preview";

export default async function DevPreviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await assertDevPreviewAllowed();
  return children;
}
