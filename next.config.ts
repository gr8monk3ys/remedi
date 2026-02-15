import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";
import withBundleAnalyzer from "@next/bundle-analyzer";
import path from "node:path";

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const projectRoot = path.resolve(__dirname);
const e2eLocalAuthEnabled = process.env.E2E_LOCAL_AUTH === "true";
const e2eDisableSentry = process.env.E2E_DISABLE_SENTRY === "true";
const clerkClientMockSpecifier = "./lib/e2e/clerk-nextjs-client-mock.tsx";
const clerkServerMockSpecifier = "./lib/e2e/clerk-nextjs-mock/server.ts";
const clerkClientMockPath = path.join(
  projectRoot,
  clerkClientMockSpecifier.replace("./", ""),
);
const clerkServerMockPath = path.join(
  projectRoot,
  clerkServerMockSpecifier.replace("./", ""),
);

const nextConfig: NextConfig = {
  // NOTE: Do NOT set `output: "standalone"` when deploying to Vercel.
  // Vercel uses its own build output adapter; "standalone" is only for
  // self-hosted Docker/Node deployments and breaks Vercel routing.
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com", // Google profile images
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com", // GitHub profile images
      },
    ],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },
  // Enable compression
  compress: true,
  // Power optimizations
  poweredByHeader: false,
  // Generate ETags for pages
  generateEtags: true,

  // Security and caching headers
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: "/:path*",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(), browsing-topics=()",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
        ],
      },
      {
        // Cache static assets for 1 year
        source: "/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // Cache images for 1 week
        source: "/:path*.{jpg,jpeg,png,gif,webp,avif,ico,svg}",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=604800, stale-while-revalidate=86400",
          },
        ],
      },
      {
        // Cache fonts for 1 year
        source: "/:path*.{woff,woff2,ttf,otf,eot}",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // API routes should not be cached by default
        source: "/api/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, max-age=0",
          },
        ],
      },
    ];
  },

  // Code splitting and bundle optimization
  experimental: {
    // Optimize package imports for better tree-shaking
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },

  // Turbopack handles code splitting automatically in Next.js 16+
  turbopack: {
    root: projectRoot,
    ...(e2eLocalAuthEnabled
      ? {
          resolveAlias: {
            "@clerk/nextjs/server": clerkServerMockSpecifier,
            "@clerk/nextjs": clerkClientMockSpecifier,
          },
        }
      : {}),
  },

  webpack(config) {
    if (e2eLocalAuthEnabled) {
      config.resolve = config.resolve || {};
      config.resolve.alias = {
        ...(config.resolve.alias || {}),
        "@clerk/nextjs/server": clerkServerMockPath,
        "@clerk/nextjs$": clerkClientMockPath,
      };
    }

    return config;
  },
};

// Sentry configuration options
const sentryWebpackPluginOptions = {
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options

  // Only upload source maps in production
  silent: true,

  // Organization and project from Sentry dashboard
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Auth token for uploading source maps
  authToken: process.env.SENTRY_AUTH_TOKEN,

  // Hides source maps from generated client bundles
  hideSourceMaps: true,

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,

  // Upload source maps only in CI/production build
  automaticVerifyRelease: process.env.CI === "true",
};

// Wrap Next.js config with Sentry and Bundle Analyzer
const configWithAnalyzer = bundleAnalyzer(nextConfig);
const sentryEnabled =
  Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN) && !e2eDisableSentry;

export default sentryEnabled
  ? withSentryConfig(configWithAnalyzer, sentryWebpackPluginOptions)
  : configWithAnalyzer;
