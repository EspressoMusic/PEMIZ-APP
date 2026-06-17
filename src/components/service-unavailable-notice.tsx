import { publicSystemErrorMessage } from "@/lib/public-errors";

export function ServiceUnavailableNotice({
  locale = "en",
}: {
  locale?: "he" | "en";
}) {
  return (
    <div className="flex min-h-[50vh] items-center justify-center px-6 py-12">
      <div className="w-full max-w-md rounded-[24px] border-[3px] border-[#5C4A3E]/22 bg-bakery-square px-6 py-8 text-center shadow-[0_8px_28px_rgba(78,52,46,0.14)]">
        <p className="text-[18px] font-extrabold text-bakery-ink">
          Service unavailable
        </p>
        <p className="mt-3 text-[15px] leading-relaxed text-bakery-muted">
          {publicSystemErrorMessage(locale)}
        </p>
      </div>
    </div>
  );
}
