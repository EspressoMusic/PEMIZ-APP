"use client";

import Script from "next/script";
import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { PaddleClientEnvironment } from "@/lib/paddle-client-config";

declare global {
  interface Window {
    Paddle?: {
      Environment: { set: (env: "sandbox" | "production") => void };
      Initialize: (options: {
        token: string;
        eventCallback?: (event: { name: string }) => void;
        checkout?: { settings: Record<string, string> };
      }) => void;
      Checkout: {
        open: (options: {
          transactionId?: string | null;
          settings?: Record<string, string>;
        }) => void;
      };
    };
  }
}

type PaddleCheckoutClientProps = {
  clientToken: string;
  environment: PaddleClientEnvironment;
  successRedirectPath: string;
};

function PaddleCheckoutContent({
  clientToken,
  environment,
  successRedirectPath,
}: PaddleCheckoutClientProps) {
  const searchParams = useSearchParams();
  const transactionId = searchParams.get("_ptxn");
  const [error, setError] = useState<string | null>(null);
  const [scriptReady, setScriptReady] = useState(false);
  const openedRef = useRef(false);

  useEffect(() => {
    if (!scriptReady || openedRef.current) return;

    if (!clientToken) {
      setError("Paddle client token is not configured.");
      return;
    }
    if (!transactionId) {
      setError("Missing checkout transaction (_ptxn).");
      return;
    }
    if (!window.Paddle) {
      setError("Paddle.js did not load.");
      return;
    }

    try {
      if (environment === "sandbox") {
        window.Paddle.Environment.set("sandbox");
      }

      window.Paddle.Initialize({
        token: clientToken,
        checkout: {
          settings: {
            displayMode: "overlay",
            theme: "light",
          },
        },
        eventCallback(event) {
          if (event.name === "checkout.completed") {
            window.location.replace(successRedirectPath);
          }
        },
      });

      openedRef.current = true;
      window.Paddle.Checkout.open({ transactionId });
    } catch {
      setError("Could not open Paddle checkout.");
    }
  }, [
    scriptReady,
    clientToken,
    environment,
    transactionId,
    successRedirectPath,
  ]);

  return (
    <>
      <Script
        src="https://cdn.paddle.com/paddle/v2/paddle.js"
        strategy="afterInteractive"
        onLoad={() => setScriptReady(true)}
        onError={() => setError("Failed to load Paddle.js.")}
      />
      <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-6 text-center">
        {error ? (
          <>
            <p className="text-[15px] font-extrabold text-bakery-sale">{error}</p>
            <a
              href={successRedirectPath}
              className="mt-4 text-[14px] font-bold text-bakery-primary underline"
            >
              Back to settings
            </a>
          </>
        ) : (
          <p className="text-[15px] font-semibold text-bakery-muted">
            Opening secure checkout…
          </p>
        )}
      </div>
    </>
  );
}

export function PaddleCheckoutClient(props: PaddleCheckoutClientProps) {
  return (
    <Suspense
      fallback={
        <p className="mx-auto flex min-h-dvh max-w-md items-center justify-center px-6 text-center text-[15px] font-semibold text-bakery-muted">
          Loading checkout…
        </p>
      }
    >
      <PaddleCheckoutContent {...props} />
    </Suspense>
  );
}
