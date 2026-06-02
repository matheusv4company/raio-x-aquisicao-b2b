// Tipos compartilhados da engine de recomendação.
// A engine é DESACOPLADA: cada step (em ./steps) é independente, com I/O explícito,
// e pode ser executado/refinado isoladamente. Providers (LLM, volume) são injetáveis.
import type { DiagnosticInput } from "@/lib/diagnostic";
import type { SegmentBenchmark } from "@/lib/benchmarks";

export type Channel = "google" | "meta";

export interface KeywordIdea {
  keyword: string;
  reason?: string;
}

export interface KeywordVolume {
  keyword: string;
  monthlySearches: number | null;
  competition?: "baixa" | "média" | "alta" | null;
}

/** Sinal normalizado de demanda de BUSCA (vem do volume real do Google OU de estimativa). */
export interface DemandSignal {
  level: "alta" | "média" | "baixa";
  totalMonthlySearches: number | null; // null quando não há dado real
  reliable: boolean; // true só com dado real (Google Ads API)
  source: "google-ads" | "estimativa-ia" | "heurística";
  keywords: KeywordVolume[];
  summary: string;
}

export type ArchetypeId = "A1" | "A2" | "A3" | "A4" | "A5";

export interface ArchetypeClassification {
  archetype: ArchetypeId;
  confidence: "alta" | "média" | "baixa";
  reasoning: string;
  source: "ia" | "heurística";
}

export interface ChannelDecision {
  channel: Channel;
  archetype: ArchetypeId;
  archetypeNome: string;
  rationale: string; // justificativa pronta para o lead, no padrão do arquétipo
  classification: ArchetypeClassification;
  demand: DemandSignal;
}

export interface MediaPlan {
  resumo: string;
  estrutura: string[]; // estrutura de campanha (camadas/passos)
  criativos: string[]; // ângulos de criativo sugeridos
  source: "ia" | "template";
}

export interface CplEstimate {
  channel: Channel;
  min: number; // R$
  max: number; // R$
  note?: string;
}

export interface UnitEconomics {
  leadToSaleRate: number; // % composto (0-1)
  leadsPorVenda: number;
  reunioesPorVenda: number;
  cacImplicitoMin: number; // R$ (no melhor caso de CPL)
  cacImplicitoMax: number; // R$ (no pior caso de CPL)
  cacImplicitoMedio: number; // R$ (cenário médio — base do veredito)
  valorReferencia: number; // R$ (ticket médio, ou LTV estimado se recorrente)
  recorrente: boolean;
  veredito: "saudável" | "atenção" | "inviável";
  comentario: string;
}

export interface FunnelTargets {
  lpConversion: number; // % anúncio/LP → lead
  leadToQualified: number; // %
  qualifiedToMeeting: number; // %
  meetingToSale: number; // %
  noShow: number; // %
  unitEconomics: UnitEconomics;
}

export interface DiagnosticPlan {
  channel: Channel;
  decision: ChannelDecision;
  mediaPlan: MediaPlan;
  cpl: CplEstimate;
  funnel: FunnelTargets;
  benchmarkCategory: string;
  benchmarkConfidence: SegmentBenchmark["confidence"];
}

/** Resultado completo da engine, com TODOS os intermediários — para transparência e refino por etapa. */
export interface EngineRun {
  input: DiagnosticInput;
  keywords: KeywordIdea[];
  demand: DemandSignal;
  decision: ChannelDecision;
  mediaPlan: MediaPlan;
  cpl: CplEstimate;
  funnel: FunnelTargets;
  plan: DiagnosticPlan;
}
