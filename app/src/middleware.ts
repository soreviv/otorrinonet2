import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");

  const csp = [
    `default-src 'self'`,
    // strict-dynamic permite que scripts con nonce carguen sub-scripts dinámicos
    // (React runtime, Turnstile). La allowlist es fallback para navegadores sin
    // soporte CSP3.
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://challenges.cloudflare.com`,
    `style-src 'self' 'nonce-${nonce}'`,
    `img-src 'self' data: blob: https://maps.gstatic.com https://*.googleusercontent.com https://lh3.googleusercontent.com`,
    `font-src 'self'`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self' https://challenges.cloudflare.com`,
    `frame-ancestors 'none'`,
    `frame-src https://maps.google.com https://www.google.com https://challenges.cloudflare.com`,
    `connect-src 'self' https://challenges.cloudflare.com`,
    `upgrade-insecure-requests`,
    `report-uri /api/csp-report`,
    `report-to csp-endpoint`,
  ].join("; ");

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  response.headers.set("Content-Security-Policy", csp);
  response.headers.set(
    "Report-To",
    JSON.stringify({
      group: "csp-endpoint",
      max_age: 10886400,
      endpoints: [{ url: "/api/csp-report" }],
    }),
  );

  return response;
}

export const config = {
  matcher: [
    {
      source:
        "/((?!api|_next/static|_next/image|favicon\\.ico|robots\\.txt|sitemap\\.xml|site\\.webmanifest).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
