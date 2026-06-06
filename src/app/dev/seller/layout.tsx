export default function DevSellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dashboard-surface bakery-frame-bg h-dvh overflow-hidden">
      <div className="app-safe-x mx-auto flex h-full min-h-0 w-full max-w-[1040px] flex-col overflow-hidden py-4 lg:px-[14px]">
        {children}
      </div>
    </div>
  );
}
