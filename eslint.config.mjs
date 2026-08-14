import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      // This rule nudges <img> towards next/image for sizing and format
      // negotiation. Sanity's CDN already does both, from parameters written by
      // src/sanity/lib/imageUrl.ts, so next/image here would re-fetch and
      // re-encode bytes that already arrive correct — billed per transform on
      // Vercel — and it can't serve the picsum.photos fallback fixtures at all,
      // since those aren't in next.config.ts remotePatterns. Off rather than
      // per-line disabled: it's one project-wide decision, not thirteen.
      "@next/next/no-img-element": "off",
    },
  },
]);

export default eslintConfig;
