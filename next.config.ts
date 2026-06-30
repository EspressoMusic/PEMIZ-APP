import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const googleAuthCsp = [
  "https://apis.google.com",
  "https://www.gstatic.com",
].join(" ");

const firebaseAuthConnectCsp = [
  "https://identitytoolkit.googleapis.com",
  "https://securetoken.googleapis.com",
  "https://www.googleapis.com",
  "https://firebase.googleapis.com",
  "https://firebaseinstallations.googleapis.com",
].join(" ");

const scriptSrc = isProd
  ? `script-src 'self' 'unsafe-inline' ${googleAuthCsp}`
  : `script-src 'self' 'unsafe-inline' 'unsafe-eval' ${googleAuthCsp}`;

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-DNS-Prefetch-Control", value: "off" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
  ...(isProd
    ? [
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
      ]
    : []),
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      scriptSrc,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://*.supabase.co https://*.google.com https://*.gstatic.com https://lh3.googleusercontent.com",
      "font-src 'self' data:",
      `connect-src 'self' https://*.supabase.co wss://*.supabase.co ${firebaseAuthConnectCsp}`,
      "frame-src 'self' https://accounts.google.com https://*.firebaseapp.com https://*.google.com",
      "worker-src 'self'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  // Inline CSS into the HTML <head> as <style> instead of separate <link>
  // files. Styles arrive with the page, eliminating the request waterfall that
  // caused an intermittent unstyled flash (e.g. the white Google button
  // briefly showing as the beige card behind it) on cold/slow/mobile loads.
  // Recommended by Next.js for atomic-CSS (Tailwind) apps; CSP already allows
  // 'unsafe-inline' for style-src.
  experimental: {
    inlineCss: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  // Proxy Firebase Auth handler/iframe so Google sign-in can run on the app's
  // own domain (NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=peymiz.com) instead of the
  // default *.firebaseapp.com. Both paths are served by Firebase, not Next.
  async rewrites() {
    return [
      {
        source: "/__/auth/:path*",
        destination: "https://peymiz-e5692.firebaseapp.com/__/auth/:path*",
      },
      {
        source: "/__/firebase/:path*",
        destination: "https://peymiz-e5692.firebaseapp.com/__/firebase/:path*",
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/api/public/:path*",
        headers: [
          ...securityHeaders,
          {
            key: "Cache-Control",
            value: "public, max-age=0, s-maxage=15, stale-while-revalidate=30",
          },
        ],
      },
      {
        source: "/manifest.webmanifest",
        headers: [
          { key: "Content-Type", value: "application/manifest+json" },
          { key: "Cache-Control", value: "public, max-age=3600" },
        ],
      },
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
