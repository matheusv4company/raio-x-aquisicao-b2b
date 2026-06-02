// STEP: extrai as palavras-chave que um CLIENTE buscaria no Google para esta oferta.
// Usa LLM quando disponível; senão, fallback heurístico. Independente e refinável.
import type { DiagnosticInput } from "@/lib/diagnostic";
import type { KeywordIdea } from "@/lib/engine/types";
import type { LlmProvider } from "@/lib/engine/providers/llm";

export async function extractKeywords(
  input: DiagnosticInput,
  llm: LlmProvider | null,
): Promise<KeywordIdea[]> {
  if (llm) {
    try {
      const out = await llm.generateJSON<{ keywords: KeywordIdea[] }>({
        system:
          "Você é especialista em pesquisa de palavras-chave para Google Ads no Brasil.",
        prompt: buildPrompt(input),
      });
      if (out?.keywords?.length) return out.keywords.slice(0, 15);
    } catch {
      // cai no fallback
    }
  }
  return fallbackKeywords(input);
}

function buildPrompt(input: DiagnosticInput): string {
  return [
    "A partir da oferta abaixo, liste as palavras-chave que um potencial CLIENTE no Brasil",
    "digitaria no Google ao procurar por essa solução (intenção de compra, não institucional).",
    'Responda em JSON: { "keywords": [{ "keyword": string, "reason": string }] } (8 a 15 itens).',
    "",
    `Segmento: ${input.segmento}`,
    `Produto/serviço principal: ${input.produtoPrincipal}`,
    `Oferta: ${input.oferta}`,
  ].join("\n");
}

function fallbackKeywords(input: DiagnosticInput): KeywordIdea[] {
  const base = input.produtoPrincipal.trim().toLowerCase();
  const seg = input.segmento.trim().toLowerCase();
  const seeds = [base, `${base} preço`, `${base} perto de mim`, `${base} valor`, seg, `${seg} ${base}`];
  const seen = new Set<string>();
  const out: KeywordIdea[] = [];
  for (const s of seeds) {
    const k = s.replace(/\s+/g, " ").trim();
    if (k.length > 2 && !seen.has(k)) {
      seen.add(k);
      out.push({ keyword: k });
    }
  }
  return out;
}
