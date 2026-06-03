// STEP: estrutura de campanha + ângulos de criativo para o canal escolhido.
// Usa LLM quando disponível; senão, templates por canal. Independente e refinável.
import { type DiagnosticInput } from "@/lib/diagnostic";
import { getSegmentGroup } from "@/lib/segments";
import type { Channel, CreativeFormat, MediaPlan } from "@/lib/engine/types";
import type { LlmProvider } from "@/lib/engine/providers/llm";

export async function generateMediaPlan(
  input: DiagnosticInput,
  channel: Channel,
  llm: LlmProvider | null,
): Promise<MediaPlan> {
  if (llm) {
    try {
      const out = await llm.generateJSON<Omit<MediaPlan, "source">>({
        system: "Você é especialista em tráfego pago no Brasil. Responda em JSON.",
        prompt: buildPrompt(input, channel),
      });
      if (out?.estrutura?.length && out?.criativos?.length) {
        return { ...out, formato: ensureFormato(out.formato, input, channel), source: "ia" };
      }
    } catch {
      // cai no template
    }
  }
  return templateMediaPlan(input, channel);
}

// Grupos cujo produto/resultado é VISUAL e de entendimento simples → criativos estáticos.
// Demais (serviços conceituais / pouco visuais) → vídeo. Heurística refinável pelo LLM.
const VISUAL_GROUPS = new Set<string>([
  "Saúde — Medicina",
  "Saúde — Odontologia",
  "Saúde — Outras áreas",
  "Imobiliário",
  "Eventos e Hospitalidade",
  "Construção e Engenharia",
]);

function formatoMeta(input: DiagnosticInput): CreativeFormat {
  const group = getSegmentGroup(input.segmento);
  const visual = group ? VISUAL_GROUPS.has(group) : false;
  return visual
    ? {
        tipo: "estaticos",
        motivo:
          "Seu produto/resultado é visual e de entendimento simples — criativos estáticos performam bem e escalam com baixo custo de produção.",
      }
    : {
        tipo: "video",
        motivo:
          "Seu serviço é mais conceitual / pouco visual — vídeo explica melhor a proposta e aquece o lead antes da oferta.",
      };
}

// Garante recomendação de formato no Meta (mantém a do LLM se vier; senão, heurística).
function ensureFormato(
  formato: CreativeFormat | undefined,
  input: DiagnosticInput,
  channel: Channel,
): CreativeFormat | undefined {
  if (channel !== "meta") return undefined;
  return formato ?? formatoMeta(input);
}

function buildPrompt(input: DiagnosticInput, channel: Channel): string {
  return [
    `Monte a estrutura de ${channel === "google" ? "Google Ads" : "Meta Ads"} para esta oferta.`,
    "Responda JSON { resumo: string, estrutura: string[], criativos: string[] }.",
    `Segmento: ${input.segmento}`,
    `Produto: ${input.produtoPrincipal}`,
    `Oferta: ${input.oferta}`,
    `Ticket: ${input.ticketMedio} | Recorrência: ${input.recorrencia}`,
  ].join("\n");
}

function templateMediaPlan(input: DiagnosticInput, channel: Channel): MediaPlan {
  if (channel === "google") {
    return {
      source: "template",
      resumo: `Capturar a intenção de quem já busca por "${input.produtoPrincipal}" e levar a uma página de conversão dedicada.`,
      estrutura: [
        "Campanha de Pesquisa (Search) segmentada por intenção de compra",
        "Grupos de anúncios por tema de palavra-chave (1 tema por grupo)",
        "Foco em termos de fundo de funil em correspondência de frase/exata",
        "Extensões: sitelink, chamada e formulário de lead",
        "Landing page específica da oferta (não a home), com 1 CTA claro",
        "Remarketing em Display/PMax para quem não converteu",
      ],
      criativos: [
        "Título com o termo exato buscado + seu principal diferencial",
        "Título 2 com prova (números, autoridade, garantia)",
        "Descrição com benefício concreto + CTA direto (orçamento/agendar)",
        "Anúncios de chamada (call) para captar no mobile",
      ],
    };
  }
  return {
    source: "template",
    formato: formatoMeta(input),
    resumo: `Apresentar a oferta "${input.produtoPrincipal}" e seus diferenciais a um público frio qualificado, gerando atenção e demanda.`,
    estrutura: [
      "Campanha de reconhecimento/tráfego com público frio amplo (Advantage+)",
      "Conjunto de remarketing (engajamento, visitantes, vídeo assistido)",
      "Público semelhante (lookalike) a partir da base de leads/clientes",
      "Teste de 3 a 5 criativos por conjunto, escalando os vencedores",
      "Landing page ou formulário instantâneo alinhado ao criativo",
    ],
    criativos: [
      "Vídeo curto (até 30s) apresentando a transformação/benefício",
      "Gancho de interrupção nos 3 primeiros segundos",
      "Prova social / antes-e-depois / depoimento (UGC)",
      "Criativo de oferta com diferencial claro + CTA",
      "Carrossel explicando o método/as etapas",
    ],
  };
}
