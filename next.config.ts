import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // PDF via Chromium headless. puppeteer-core e @sparticuz/chromium já são auto-externalizados
  // pelo Next 16 (lista oficial), então não precisam ser declarados aqui.
};

export default nextConfig;
