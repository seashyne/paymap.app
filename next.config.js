/** @type {import("next").NextConfig} */

const cspDirectives = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://www.gstatic.com https://apis.google.com https://*.firebaseapp.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: blob: https://lh3.googleusercontent.com https://firebasestorage.googleapis.com https://images.unsplash.com",
  "connect-src 'self' https://api.anthropic.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://www.googleapis.com https://firestore.googleapis.com https://*.firebaseio.com https://firebase.googleapis.com wss://*.firebaseio.com wss:",
  "frame-src 'self' https://js.stripe.com https://*.firebaseapp.com https://accounts.google.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "upgrade-insecure-requests",
].join("; ")

const securityHeaders = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Content-Security-Policy", value: cspDirectives },
]

const nextConfig = {
  reactStrictMode: true,
  compress: true,
  output: "standalone",
  env: {
    NEXT_PUBLIC_APP_VERSION: "14.0.0",
  },
  experimental: {
    optimizePackageImports: ["lucide-react"],
    serverComponentsExternalPackages: ["@prisma/client", "@prisma/adapter-neon", "@neondatabase/serverless"],
  },
  // Prevent Next.js from bundling Prisma and Neon — they must run in Node.js
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "firebasestorage.googleapis.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        "firebase-admin": false,
        "ioredis": false,
        // Do NOT alias @prisma/client to false — it breaks server components.
        // Prisma is kept out of client bundles via serverExternalPackages above.
      }
    }

    return config
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        source: "/_next/static/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/_next/image/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=86400" },
        ],
      },
    ]
  },
}

module.exports = nextConfig
