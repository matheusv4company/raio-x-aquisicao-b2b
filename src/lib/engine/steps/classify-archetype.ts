// STEP: classifica a OFERTA em um arquétipo (A1–A5), que define o canal.
// A IA lê a oferta (o segmento é só pista); o volume de busca entra como confirmação.
// Independente e refinável. Fallback heurístico quando não há IA.
import type { DiagnosticInput } from "@/lib/diagnostic";
import type {
  ArchetypeClassification,
  ArchetypeId,
  DemandSignal,
} from "@/lib/engine/types";
import { ARCHETYPES } from "@/lib/engine/archetypes";
import type { LlmProvider } from "@/lib/engine/providers/llm";

export async function classifyArchetype(
  input: DiagnosticInput,
  demand: DemandSignal,
  llm: LlmProvider | null,
): Promise<ArchetypeClassification> {
  if (llm) {
    try {
      const out = await llm.generateJSON<{
        archetype: ArchetypeId;
        confidence: ArchetypeClassification["confidence"];
        reasoning: string;
      }>({
        system: "Você classifica a estratégia de mídia ideal lendo a OFERTA de um negócio.",
        prompt: buildPrompt(input, demand),
      });
      if (out?.archetype && ARCHETYPES[out.archetype]) {
        return {
          archetype: out.archetype,
          confidence: out.confidence ?? "média",
          reasoning: out.reasoning ?? "",
          source: "ia",
        };
      }
    } catch {
      // fallback
    }
  }
  return heuristic(demand);
}

function buildPrompt(input: DiagnosticInput, demand: DemandSignal): string {
  const lista = Object.values(ARCHETYPES)
    .map((a) => `- ${a.id} (${a.channel}): ${a.nome} — ${a.gatilho} Ex.: ${a.exemplos.join(", ")}.`)
    .join("\n");
  return [
    "Classifique a oferta em UM arquétipo de comportamento de compra, que define o canal de mídia.",
    "Pergunta-chave: no momento da decisão, esse cliente está PROCURANDO ativamente por essa solução?",
    "Atenção: o canal depende da OFERTA/ÂNGULO, não do segmento.",
    "",
    "Arquétipos:",
    lista,
    "",
    `Segmento: ${input.segmento}`,
    `Produto/serviço: ${input.produtoPrincipal}`,
    `Oferta: ${input.oferta}`,
    `Sinal de busca (referência): ${demand.level}${demand.reliable ? " (dado real)" : " (estimativa)"}`,
    "",
    'Responda JSON: { "archetype": "A1|A2|A3|A4|A5", "confidence": "alta|média|baixa", "reasoning": string }.',
  ].join("\n");
}

function heuristic(demand: DemandSignal): ArchetypeClassification {
  const archetype: ArchetypeId = demand.level === "baixa" ? "A5" : "A1";
  return {
    archetype,
    confidence: "baixa",
    reasoning:
      "Classificação preliminar pelo volume de busca — conecte a IA para ler a oferta e classificar com precisão.",
    source: "heurística",
  };
}
