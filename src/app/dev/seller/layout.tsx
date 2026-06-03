import { notFound } from "next/navigation";

export default function DevSellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <div className="bakery-frame-bg h-dvh overflow-hidden">
      <div className="app-safe-x mx-auto flex h-full min-h-0 w-full max-w-[1040px] flex-col overflow-hidden py-4 lg:px-[14px]">
        {children}
      </div>
    </div>
  );
}
