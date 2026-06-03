// PREVIEW local do PDF. Usa o MESMO template da produção (src/lib/pdf/template.mjs).
// node scripts/preview-pdf.mjs → preview*.png + preview*.pdf
import puppeteer from "puppeteer-core";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { buildAnalysisHtml } from "../src/lib/pdf/template.mjs";

const __dir = dirname(fileURLToPath(import.meta.url));
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

// Espelho do step da engine (src/lib/engine/steps/projection.ts) — só para o preview ter dados.
function computeProjection({ faturamentoMid, ticketMid, metaPct, recorrente, leadToSale, cplMin, cplMax, metaFrase }) {
  const cplRange = cplMax - cplMin;
  const receitaAlvoMes = recorrente ? (faturamentoMid * metaPct) / 12 : faturamentoMid * metaPct;
  const clientesAlvo = receitaAlvoMes / ticketMid;
  const leadsAlvo = clientesAlvo / leadToSale;
  const tiers = [
    { nome: "Início", mult: 0.5, cplPos: 0.25, rec: false },
    { nome: "Meta", mult: 1.0, cplPos: 0.5, rec: true },
    { nome: "Acelerar", mult: 1.5, cplPos: 0.78, rec: false },
  ];
  const scenarios = tiers.map((t) => {
    const leadsMes = leadsAlvo * t.mult;
    const cpl = cplMin + cplRange * t.cplPos;
    const budgetMensal = leadsMes * cpl;
    const vendasMes = leadsMes * leadToSale;
    const receitaMes = vendasMes * ticketMid;
    return {
      nome: t.nome, recomendado: t.rec, cpl: Math.round(cpl),
      budgetMensal: Math.round(budgetMensal), leadsMes: Math.round(leadsMes),
      vendasMes: Math.round(vendasMes), receitaMes: Math.round(receitaMes),
      roas: budgetMensal > 0 ? receitaMes / budgetMensal : 0,
    };
  });
  return { metaFrase, budgetRecomendado: scenarios.find((s) => s.recomendado).budgetMensal, scenarios };
}

const leadToSale = (55 / 100) * (55 / 100) * (35 / 100); // 0.10588 → ~9 leads/venda
const funnel = { lpConversion: 3.5, leadToQualified: 55, qualifiedToMeeting: 55, meetingToSale: 35 };

const GOOGLE = {
  nome: "Dr. Matheus Moura", data: "Junho · 2026", channel: "google",
  input: { segmento: "Médico oftalmologista", produtoPrincipal: "cirurgia de catarata", faturamentoLabel: "R$ 250 mil a R$ 500 mil/mês", ticketLabel: "R$ 5 mil a R$ 10 mil", recorrente: false },
  archetypeNome: "Necessidade aguda",
  rationale: "Quem procura uma cirurgia de catarata já está com o problema na mão e busca ativamente por uma solução. Aqui o jogo não é criar desejo, é estar presente no momento exato da busca, à frente dos concorrentes. No seu caso, o Google Ads é a mídia ideal.",
  cpl: { min: 40, max: 200 }, funnel,
  ue: { leadsPorVenda: 9, cacMin: 378, cacMax: 1889, veredito: "saudável" },
  keywords: ["cirurgia de catarata", "cirurgia de catarata preço", "cirurgia de catarata [sua cidade]", "oftalmologista catarata", "lente intraocular preço", "facoemulsificação valor"],
  formato: null,
  estrutura: ["Campanha de Pesquisa segmentada por intenção de compra", "Grupos de anúncios por tema de palavra-chave", "Termos de fundo de funil em correspondência de frase/exata", "Landing page específica da oferta, com 1 CTA claro", "Remarketing para quem não converteu"],
  criativos: ["Título com o termo exato buscado + diferencial", "Prova (números, autoridade) no título 2", "CTA direto: agendar avaliação", "Anúncios de chamada para mobile"],
  projection: computeProjection({ faturamentoMid: 375000, ticketMid: 7500, metaPct: 0.5, recorrente: false, leadToSale, cplMin: 40, cplMax: 200, metaFrase: "crescer +50%" }),
};

const META = {
  nome: "Carla Mendes", data: "Junho · 2026", channel: "meta",
  input: { segmento: "Escritório de contabilidade", produtoPrincipal: "contabilidade consultiva (troca de contador)", faturamentoLabel: "R$ 100 mil a R$ 250 mil/mês", ticketLabel: "R$ 1 mil a R$ 3 mil/mês", recorrente: true },
  archetypeNome: "Insatisfação latente",
  rationale: "Seu cliente ideal já tem contador e nem percebe que poderia ter um serviço muito melhor — ele está acomodado e não procura nada no Google. No Meta, anúncios que mostram o que ele está perdendo despertam essa insatisfação e geram a troca. É por isso que o Meta Ads é a mídia ideal aqui.",
  cpl: { min: 25, max: 90 }, funnel,
  ue: { leadsPorVenda: 9, cacMin: 236, cacMax: 849, veredito: "saudável" },
  keywords: [],
  formato: { tipo: "video", motivo: "Seu serviço é mais conceitual / pouco visual — vídeo explica melhor a proposta e aquece o lead antes da oferta." },
  estrutura: ["Campanha de conversão (cadastro) + uma de reconhecimento", "Públicos frios por cargo/setor (donos de PME)", "Lookalike 1% da sua base de clientes atuais", "Landing page com oferta de análise tributária gratuita", "Remarketing em vídeo para quem assistiu 50%+"],
  criativos: ["Vídeo: 'seu contador só te manda a guia do imposto?'", "Depoimento de quem trocou de contabilidade", "Comparativo: contador comum × consultivo", "Oferta: diagnóstico tributário gratuito"],
  projection: computeProjection({ faturamentoMid: 175000, ticketMid: 2000, metaPct: 1.0, recorrente: true, leadToSale, cplMin: 25, cplMax: 90, metaFrase: "dobrar o faturamento" }),
};

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ["--no-sandbox"] });
async function render(sample, prefix) {
  const page = await browser.newPage();
  await page.setViewport({ width: 820, height: 1200, deviceScaleFactor: 2 });
  await page.setContent(buildAnalysisHtml(sample), { waitUntil: "networkidle0" });
  await page.screenshot({ path: join(__dir, `${prefix}.png`), fullPage: true });
  await page.pdf({ path: join(__dir, `${prefix}.pdf`), format: "A4", printBackground: true, preferCSSPageSize: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } });
  const sections = await page.$$("section.page");
  for (let i = 0; i < sections.length; i++) {
    await sections[i].screenshot({ path: join(__dir, `${prefix}-p${i}.png`) });
  }
  await page.close();
  return sections.length;
}
const nG = await render(GOOGLE, "preview");
const nM = await render(META, "preview-meta");
await browser.close();
console.log(`OK: preview (${nG}p, Google) + preview-meta (${nM}p, Meta) em`, __dir);
