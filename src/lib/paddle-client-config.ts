import { appBaseUrl } from "@/lib/billing/app-base-url";

export type PaddleClientEnvironment = "sandbox" | "production";

export function getPaddleClientEnvironment(): PaddleClientEnvironment {
  const env = process.env.PADDLE_ENVIRONMENT?.trim().toLowerCase();
  return env === "sandbox" ? "sandbox" : "production";
}

export function getPaddleClientToken(): string | null {
  return process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN?.trim() || null;
}

/** Where sellers land after a successful Paddle overlay checkout. */
export function paddleCheckoutSuccessPath(): string {
  return "/dashboard/settings";
}

export function buildPaddleCheckoutPageUrl(transactionId: string): string {
  return `${appBaseUrl()}/paddle-checkout?_ptxn=${encodeURIComponent(transactionId)}`;
}

export function getPaddleCheckoutPageProps() {
  return {
    clientToken: getPaddleClientToken() ?? "",
    environment: getPaddleClientEnvironment(),
    successRedirectPath: paddleCheckoutSuccessPath(),
  };
}
