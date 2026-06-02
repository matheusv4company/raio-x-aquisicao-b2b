import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @react-pdf/renderer usa fontkit/yoga (wasm) — externaliza para rodar via Node, sem bundling.
  serverExternalPackages: ["@react-pdf/renderer"],
};

export default nextConfig;
