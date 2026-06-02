// STEP: resolve o SINAL DE DEMANDA de busca (Google).
// Prioridade: (1) dado real do Google Ads, (2) estimativa por IA, (3) heurística.
// Independente e refinável. Limiares no topo.
import type { DiagnosticInput } from "@/lib/diagnostic";
import type { DemandSignal, KeywordIdea } from "@/lib/engine/types";
import type { SearchVolumeProvider } from "@/lib/engine/providers/search-volume";
import type { LlmProvider } from "@/lib/engine/providers/llm";

// Limiares de volume mensal SOMADO dos termos (refináveis).
const LIMIAR_ALTA = 2000;
const LIMIAR_MEDIA = 300;

export async function resolveDemand(
  input: DiagnosticInput,
  keywords: KeywordIdea[],
  deps: { volumeProvider: SearchVolumeProvider | null; llm: LlmProvider | null },
): Promise<DemandSignal> {
  // 1) Dado real (Google Ads)
  if (deps.volumeProvider) {
    const vols = await deps.volumeProvider.getVolumes(keywords.map((k) => k.keyword));
    const total = vols.reduce((s, v) => s + (v.monthlySearches ?? 0), 0);
    return {
      level: levelFromVolume(total),
      totalMonthlySearches: total,
      reliable: true,
      source: "google-ads",
      keywords: vols,
      summary: `~${total.toLocaleString("pt-BR")} buscas/mês somando os termos analisados.`,
    };
  }
  // 2) Estimativa por IA
  if (deps.llm) {
    try {
      const est = await deps.llm.generateJSON<{ level: DemandSignal["level"]; reason: string }>({
        system: "Você estima o nível de demanda de busca no Google (Brasil) para uma oferta.",
        prompt:
          "Classifique o nível de busca no Google (alta/média/baixa) por uma solução como esta e explique:\n" +
          `Segmento: ${input.segmento}\nProduto: ${input.produtoPrincipal}\nOferta: ${input.oferta}\n` +
          'Responda JSON { "level": "alta|média|baixa", "reason": string }.',
      });
      if (est?.level) {
        return {
          level: est.level,
          totalMonthlySearches: null,
          reliable: false,
          source: "estimativa-ia",
          keywords: keywords.map((k) => ({ keyword: k.keyword, monthlySearches: null })),
          summary: est.reason,
        };
      }
    } catch {
      // cai na heurística
    }
  }
  // 3) Heurística mínima (sem dado e sem IA)
  return {
    level: "média",
    totalMonthlySearches: null,
    reliable: false,
    source: "heurística",
    keywords: keywords.map((k) => ({ keyword: k.keyword, monthlySearches: null })),
    summary: "Estimativa preliminar — conecte o Google Ads para volume real de busca.",
  };
}

export function levelFromVolume(total: number): DemandSignal["level"] {
  if (total >= LIMIAR_ALTA) return "alta";
  if (total >= LIMIAR_MEDIA) return "média";
  return "baixa";
}
