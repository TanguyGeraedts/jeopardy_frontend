import type { NextConfig } from "next";
import { version } from "./package.json";

// Read at BUILD time: rewrites are baked into the build output. In Docker, pass it as a build arg.
const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8080";

// `next dev` only serves its scripts to localhost. Phones testing on your Wi-Fi open this computer's LAN address
// (e.g. 192.168.1.20), which must be listed here, or the page loads without JavaScript (no buzzer). Comma separated.
const ALLOWED_DEV_ORIGINS = (process.env.ALLOWED_DEV_ORIGINS ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const nextConfig: NextConfig = {
  // Self-contained server in .next/standalone, so the Docker image doesn't need node_modules.
  output: "standalone",
  // The version in the footer, from package.json at build time (only the number reaches the browser).
  env: { NEXT_PUBLIC_APP_VERSION: version },
  allowedDevOrigins: ALLOWED_DEV_ORIGINS,
  // The browser only ever talks to Next (same origin), and Next forwards /api/* to Spring.
  // This avoids CORS entirely: your SecurityConfig has no CORS setup.
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${BACKEND_URL}/api/:path*` }];
  },
};

export default nextConfig;
