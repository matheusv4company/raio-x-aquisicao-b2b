// Renderiza o PDF da análise via HTML→Chromium headless.
// Vercel/serverless: @sparticuz/chromium (binário Linux). Dev local: Chrome instalado
// (CHROME_PATH ou caminho padrão da plataforma). buildAnalysisHtml é a fonte única do layout.
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";
import { buildAnalysisHtml } from "@/lib/pdf/template.mjs";
import { FATURAMENTO, TICKET } from "@/lib/diagnostic";
import type { EngineRun } from "@/lib/engine/types";

function labelOf(opts: readonly { value: string; label: string }[], v: string): string {
  return opts.find((o) => o.value === v)?.label ?? v;
}

function monthYear(date: Date): string {
  const m = date.toLocaleDateString("pt-BR", { month: "long" });
  return `${m.charAt(0).toUpperCase()}${m.slice(1)} · ${date.getFullYear()}`;
}

/** Mapeia o EngineRun (já calculado) para o formato que o template renderiza. */
export function runToPdfData(run: EngineRun) {
  const { input, plan, decision, mediaPlan, cpl, funnel, projection, keywords } = run;
  const ue = funnel.unitEconomics;
  return {
    nome: input.nome,
    data: monthYear(new Date()),
    channel: plan.channel,
    input: {
      segmento: input.segmento,
      produtoPrincipal: input.produtoPrincipal,
      faturamentoLabel: labelOf(FATURAMENTO, input.faturamento),
      ticketLabel: labelOf(TICKET, input.ticketMedio),
      recorrente: input.recorrencia === "recorrente",
    },
    archetypeNome: decision.archetypeNome,
    rationale: decision.rationale,
    cpl: { min: cpl.min, max: cpl.max },
    funnel: {
      lpConversion: funnel.lpConversion,
      leadToQualified: funnel.leadToQualified,
      qualifiedToMeeting: funnel.qualifiedToMeeting,
      meetingToSale: funnel.meetingToSale,
    },
    ue: {
      leadsPorVenda: ue.leadsPorVenda,
      cacMin: ue.cacImplicitoMin,
      cacMax: ue.cacImplicitoMax,
      veredito: ue.veredito,
    },
    keywords: keywords.slice(0, 6).map((k) => k.keyword),
    formato: mediaPlan.formato,
    estrutura: mediaPlan.estrutura.slice(0, 5),
    criativos: mediaPlan.criativos.slice(0, 4),
    projection: {
      metaFrase: projection.metaFrase,
      budgetRecomendado: projection.budgetRecomendado,
      scenarios: projection.scenarios,
    },
  };
}

function localChromePath(): string {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  if (process.platform === "win32")
    return "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
  if (process.platform === "darwin")
    return "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
  return "/usr/bin/google-chrome";
}

async function launchBrowser() {
  const serverless = Boolean(process.env.AWS_LAMBDA_FUNCTION_VERSION || process.env.VERCEL);
  if (serverless) {
    return puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: true,
    });
  }
  return puppeteer.launch({
    executablePath: localChromePath(),
    headless: true,
    args: ["--no-sandbox"],
  });
}

export async function renderAnalysisPdf(run: EngineRun): Promise<Buffer> {
  const html = buildAnalysisHtml(runToPdfData(run));
  const browser = await launchBrowser();
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 820, height: 1200, deviceScaleFactor: 2 });
    await page.setContent(html, { waitUntil: "load" });
    // Garante que as Google Fonts (Fraunces/Inter) carregaram antes de imprimir.
    await page.evaluate(async () => {
      await document.fonts.ready;
    });
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true, // usa o @page{size:A4;margin:0} do template → 1 .page = 1 página
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    });
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}
