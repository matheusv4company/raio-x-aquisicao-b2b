// STEP: escreve a justificativa do canal para o lead, no padrão do arquétipo.
// IA quando disponível (segue o guiaIA do arquétipo); senão, fallback do arquétipo.
// Independente e refinável (a copy mora em archetypes.ts).
import type { DiagnosticInput } from "@/lib/diagnostic";
import type { ArchetypeId } from "@/lib/engine/types";
import { ARCHETYPES } from "@/lib/engine/archetypes";
import type { LlmProvider } from "@/lib/engine/providers/llm";

export async function generateRationale(
  input: DiagnosticInput,
  archetypeId: ArchetypeId,
  llm: LlmProvider | null,
): Promise<string> {
  const arch = ARCHETYPES[archetypeId];
  const canalLabel = arch.channel === "google" ? "Google" : "Meta";

  if (llm) {
    try {
      const out = await llm.generateText({
        system:
          "Você é copywriter de resposta direta no Brasil. Escreva 2 a 4 frases, tom consultivo, concreto, sem clichê.",
        prompt: [
          `Escreva a justificativa do canal (${canalLabel} Ads) para o lead, no padrão do arquétipo.`,
          `Padrão: ${arch.guiaIA}`,
          `Termine exatamente com: "No seu caso, o ${canalLabel} Ads é a mídia ideal."`,
          "",
          `Segmento: ${input.segmento}`,
          `Produto/serviço: ${input.produtoPrincipal}`,
          `Oferta: ${input.oferta}`,
        ].join("\n"),
      });
      const text = out?.trim();
      if (text && text.length > 20) return text;
    } catch {
      // fallback
    }
  }
  return arch.fallbackRationale(input);
}
