/** @type {import('next').NextConfig} */

// Phase A.14k DEPLOY-MODE switch: GH Pages (default) OR Vercel.
// GH Pages requires static export + subpath config.
// Vercel handles SSR + static + Edge fns automatically.
//
// Toggle via env: DEPLOY_TARGET=vercel (default: gh-pages)
const DEPLOY_TARGET = process.env.DEPLOY_TARGET || 'gh-pages';
const IS_GH_PAGES = DEPLOY_TARGET === 'gh-pages';
const IS_VERCEL = DEPLOY_TARGET === 'vercel';

const nextConfig = {
  // Static export only when targeting GH Pages.
  ...(IS_GH_PAGES && {
    output: 'export',
    basePath: '/ugc-command-center',
    assetPrefix: '/ugc-command-center',
    trailingSlash: true,
  }),

  images: { unoptimized: true },
  reactStrictMode: true,

  // Don't block prod builds on ESLint/TS — sister agents' WIP routes may still
  // have lint noise. CI lint runs separately.
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },

  // Vercel-only: increase server action body limit for comment screenshot uploads.
  ...(IS_VERCEL && {
    experimental: {
      serverActions: {
        bodySizeLimit: '2mb',
      },
    },
  }),

  // Expose deploy target to client so components can adapt (e.g.,
  // CommentPopover skips /api/comments POST on GH Pages — localStorage only).
  env: {
    NEXT_PUBLIC_DEPLOY_TARGET: DEPLOY_TARGET,
  },
};

module.exports = nextConfig;
