import Image from "next/image";
import { APP_LOGO_SRC } from "@/lib/app-branding";

export function AppLogo({
  size = 160,
  className = "",
  priority = false,
}: {
  size?: number;
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src={APP_LOGO_SRC}
      alt="Peymiz"
      width={size}
      height={size}
      priority={priority}
      unoptimized
      className={className}
    />
  );
}
