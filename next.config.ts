import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // PDF via Chromium headless. puppeteer-core e @sparticuz/chromium já são auto-externalizados
  // pelo Next 16 (lista oficial). Mas o binário do Chromium (pasta bin/*.br) NÃO é rastreado
  // automaticamente (nada o importa estaticamente — é lido em runtime), então a função serverless
  // sobe sem ele ("input directory .../bin does not exist"). Forçamos a inclusão nas rotas que
  // geram PDF.
  outputFileTracingIncludes: {
    "/api/diagnostico": ["./node_modules/@sparticuz/chromium/bin/**/*"],
    "/api/pdf": ["./node_modules/@sparticuz/chromium/bin/**/*"],
    "/api/pdf/[id]": ["./node_modules/@sparticuz/chromium/bin/**/*"],
  },
};

export default nextConfig;
