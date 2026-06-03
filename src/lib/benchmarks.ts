// Benchmarks de mídia paga e funil (Brasil), por categoria de segmento.
// ⚠️ NÚMEROS PARA VALIDAÇÃO do especialista (cliente é especialista em tráfego pago).
//
// CPLs RECALIBRADOS (jun/2026): as faixas anteriores estavam altas demais (extrapoladas de
// dados globais em USD), o que estourava o CAC. Agora usam faixas reais de CPL no Brasil.
// Conversão (anúncio→lead) mantida (alta confiança — Leadster Panorama 2025).

import { getSegmentGroup } from "@/lib/segments";

export interface ChannelBenchmark {
  cplMin: number; // CPL esperado mínimo (R$)
  cplMax: number; // CPL esperado máximo (R$)
  lpConversion: number; // conversão visitante→lead (%) mediana
}

export interface FunnelBenchmark {
  leadToQualified: number; // lead → lead qualificado (%)
  qualifiedToMeeting: number; // qualificado → reunião realizada (%)
  meetingToSale: number; // reunião → venda (%)
  noShow: number; // no-show de reuniões (%)
}

export interface SegmentBenchmark {
  category: string;
  groups: string[]; // grupos da taxonomia (segments.ts) que mapeiam aqui
  google: ChannelBenchmark;
  meta: ChannelBenchmark;
  confidence: "alta" | "média" | "baixa";
  note?: string;
}

// Funil downstream padrão (B2B/serviços). RECALIBRADO: composto lead→venda ≈ 10,6% (~9 leads/venda),
// em vez dos 3% anteriores (33 leads/venda) que inflavam o CAC. Validar por motion de vendas.
export const DEFAULT_FUNNEL: FunnelBenchmark = {
  leadToQualified: 55,
  qualifiedToMeeting: 55,
  meetingToSale: 35,
  noShow: 20,
};

export const SEGMENT_BENCHMARKS: SegmentBenchmark[] = [
  {
    category: "Saúde",
    groups: ["Saúde — Medicina", "Saúde — Odontologia", "Saúde — Outras áreas"],
    google: { cplMin: 40, cplMax: 200, lpConversion: 3.5 },
    meta: { cplMin: 20, cplMax: 90, lpConversion: 4.0 },
    confidence: "média",
  },
  {
    category: "Jurídico",
    groups: ["Jurídico"],
    google: { cplMin: 90, cplMax: 450, lpConversion: 2.5 },
    meta: { cplMin: 35, cplMax: 140, lpConversion: 4.5 },
    confidence: "média",
    note: "CPC jurídico é dos mais caros do BR; Meta costuma ter CPL bem menor.",
  },
  {
    category: "Contabilidade e Finanças",
    groups: ["Contabilidade e Finanças"],
    google: { cplMin: 40, cplMax: 160, lpConversion: 3.0 },
    meta: { cplMin: 25, cplMax: 90, lpConversion: 3.5 },
    confidence: "média",
  },
  {
    category: "Tecnologia e Software",
    groups: ["Tecnologia e Software"],
    google: { cplMin: 70, cplMax: 320, lpConversion: 2.0 },
    meta: { cplMin: 35, cplMax: 160, lpConversion: 2.2 },
    confidence: "média",
    note: "SaaS/Tech tem conversão de topo baixa (~2%) e ciclo mais longo.",
  },
  {
    category: "Marketing e Agências",
    groups: ["Marketing e Vendas"],
    google: { cplMin: 40, cplMax: 180, lpConversion: 4.0 },
    meta: { cplMin: 25, cplMax: 100, lpConversion: 4.0 },
    confidence: "baixa",
  },
  {
    category: "Consultoria e Serviços B2B",
    groups: ["Consultoria e Serviços Profissionais", "Serviços Empresariais (Facilities)"],
    google: { cplMin: 50, cplMax: 220, lpConversion: 1.6 },
    meta: { cplMin: 30, cplMax: 120, lpConversion: 1.8 },
    confidence: "média",
    note: "Consultoria tem conversão crítica (~1,5%); priorizar qualificação.",
  },
  {
    category: "Indústria",
    groups: ["Indústria e Manufatura", "Atacado e Distribuição", "Agronegócio"],
    google: { cplMin: 50, cplMax: 220, lpConversion: 3.0 },
    meta: { cplMin: 30, cplMax: 130, lpConversion: 2.5 },
    confidence: "média",
    note: "B2B industrial converte melhor no desktop (~5,8%).",
  },
  {
    category: "Construção e Engenharia",
    groups: ["Construção e Engenharia"],
    google: { cplMin: 45, cplMax: 200, lpConversion: 2.5 },
    meta: { cplMin: 25, cplMax: 120, lpConversion: 2.5 },
    confidence: "média",
  },
  {
    category: "Imobiliário",
    groups: ["Imobiliário"],
    google: { cplMin: 25, cplMax: 120, lpConversion: 1.5 },
    meta: { cplMin: 15, cplMax: 70, lpConversion: 1.8 },
    confidence: "média",
    note: "Conversão crítica (~1,5%); CPL baixo mas volume e qualificação difíceis.",
  },
  {
    category: "Logística e Transporte",
    groups: ["Logística e Transporte"],
    google: { cplMin: 50, cplMax: 220, lpConversion: 2.6 },
    meta: { cplMin: 30, cplMax: 130, lpConversion: 2.5 },
    confidence: "baixa",
    note: "Pouco dado de CPL específico no BR — validar.",
  },
  {
    category: "Educação",
    groups: ["Educação e Treinamento"],
    google: { cplMin: 30, cplMax: 160, lpConversion: 3.0 },
    meta: { cplMin: 20, cplMax: 100, lpConversion: 3.0 },
    confidence: "baixa",
  },
  {
    category: "Financeiro e Seguros",
    groups: ["Financeiro e Seguros"],
    google: { cplMin: 60, cplMax: 280, lpConversion: 4.0 },
    meta: { cplMin: 30, cplMax: 140, lpConversion: 4.0 },
    confidence: "média",
  },
  {
    category: "Eventos e Hospitalidade",
    groups: ["Eventos e Hospitalidade"],
    google: { cplMin: 30, cplMax: 160, lpConversion: 2.5 },
    meta: { cplMin: 20, cplMax: 100, lpConversion: 2.5 },
    confidence: "baixa",
    note: "Pouco dado específico — validar.",
  },
];

// Usado quando o segmento não mapeia em nenhuma categoria (entrada livre / sem benchmark próprio).
export const FALLBACK_BENCHMARK: SegmentBenchmark = {
  category: "B2B Geral",
  groups: [],
  google: { cplMin: 50, cplMax: 220, lpConversion: 3.28 },
  meta: { cplMin: 25, cplMax: 110, lpConversion: 3.4 },
  confidence: "baixa",
  note: "Médias gerais do Brasil — fallback para segmentos sem benchmark específico.",
};

/** Resolve o benchmark a partir do rótulo de segmento escolhido pelo lead. */
export function getBenchmark(segmentLabel: string): SegmentBenchmark {
  const group = getSegmentGroup(segmentLabel);
  if (!group) return FALLBACK_BENCHMARK;
  return SEGMENT_BENCHMARKS.find((b) => b.groups.includes(group)) ?? FALLBACK_BENCHMARK;
}
