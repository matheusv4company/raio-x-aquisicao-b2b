// Benchmarks de mídia paga e funil (Brasil), por categoria de segmento.
// Fontes: pesquisa em relatórios BR — Leadster Panorama 2025 (conversão, alta confiança),
// Conversion.com.br, Searchlab, Superads (CPL/CPC), Meetime, DataStone, Ruler (funil).
// ⚠️ NÚMEROS PARA VALIDAÇÃO do especialista — ver docs/benchmarks-br.md (fontes + confiança).
// Conversão tem confiança ALTA (Leadster, amostra grande); CPL é mais variável (parte extrapolada).

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

// Funil downstream padrão (B2B/serviços). Varia mais por motion de vendas que por segmento;
// medianas das fontes BR (Meetime/DataStone/Ruler). A engine pode ajustar por ticket/recorrência.
export const DEFAULT_FUNNEL: FunnelBenchmark = {
  leadToQualified: 30,
  qualifiedToMeeting: 40,
  meetingToSale: 25,
  noShow: 20,
};

export const SEGMENT_BENCHMARKS: SegmentBenchmark[] = [
  {
    category: "Saúde",
    groups: ["Saúde — Medicina", "Saúde — Odontologia", "Saúde — Outras áreas"],
    google: { cplMin: 70, cplMax: 360, lpConversion: 3.5 },
    meta: { cplMin: 50, cplMax: 200, lpConversion: 4.0 },
    confidence: "média",
  },
  {
    category: "Jurídico",
    groups: ["Jurídico"],
    google: { cplMin: 370, cplMax: 1630, lpConversion: 2.5 },
    meta: { cplMin: 90, cplMax: 220, lpConversion: 4.5 },
    confidence: "alta",
    note: "CPC jurídico é dos mais caros do BR; Meta costuma ter CPL bem menor.",
  },
  {
    category: "Contabilidade e Finanças",
    groups: ["Contabilidade e Finanças"],
    google: { cplMin: 225, cplMax: 900, lpConversion: 3.0 },
    meta: { cplMin: 125, cplMax: 315, lpConversion: 3.5 },
    confidence: "média",
  },
  {
    category: "Tecnologia e Software",
    groups: ["Tecnologia e Software"],
    google: { cplMin: 270, cplMax: 1260, lpConversion: 2.0 },
    meta: { cplMin: 90, cplMax: 450, lpConversion: 2.2 },
    confidence: "média",
    note: "SaaS/Tech tem conversão de topo baixa (~2%) e ciclo mais longo.",
  },
  {
    category: "Marketing e Agências",
    groups: ["Marketing e Vendas"],
    google: { cplMin: 90, cplMax: 450, lpConversion: 4.0 },
    meta: { cplMin: 90, cplMax: 300, lpConversion: 4.0 },
    confidence: "baixa",
  },
  {
    category: "Consultoria e Serviços B2B",
    groups: ["Consultoria e Serviços Profissionais", "Serviços Empresariais (Facilities)"],
    google: { cplMin: 90, cplMax: 450, lpConversion: 1.6 },
    meta: { cplMin: 90, cplMax: 300, lpConversion: 1.8 },
    confidence: "média",
    note: "Consultoria tem conversão crítica (~1,5%); priorizar qualificação.",
  },
  {
    category: "Indústria",
    groups: ["Indústria e Manufatura", "Atacado e Distribuição", "Agronegócio"],
    google: { cplMin: 135, cplMax: 360, lpConversion: 3.0 },
    meta: { cplMin: 90, cplMax: 300, lpConversion: 2.5 },
    confidence: "média",
    note: "B2B industrial converte melhor no desktop (~5,8%).",
  },
  {
    category: "Construção e Engenharia",
    groups: ["Construção e Engenharia"],
    google: { cplMin: 135, cplMax: 360, lpConversion: 2.5 },
    meta: { cplMin: 90, cplMax: 300, lpConversion: 2.5 },
    confidence: "média",
  },
  {
    category: "Imobiliário",
    groups: ["Imobiliário"],
    google: { cplMin: 56, cplMax: 315, lpConversion: 1.5 },
    meta: { cplMin: 56, cplMax: 150, lpConversion: 1.8 },
    confidence: "média",
    note: "Conversão crítica (~1,5%); CPL baixo mas volume e qualificação difíceis.",
  },
  {
    category: "Logística e Transporte",
    groups: ["Logística e Transporte"],
    google: { cplMin: 150, cplMax: 500, lpConversion: 2.6 },
    meta: { cplMin: 90, cplMax: 300, lpConversion: 2.5 },
    confidence: "baixa",
    note: "Pouco dado de CPL específico no BR — validar.",
  },
  {
    category: "Educação",
    groups: ["Educação e Treinamento"],
    google: { cplMin: 200, cplMax: 900, lpConversion: 3.0 },
    meta: { cplMin: 90, cplMax: 450, lpConversion: 3.0 },
    confidence: "baixa",
    note: "Ensino superior global chega a CPL muito mais alto; faixa BR aqui é conservadora — validar.",
  },
  {
    category: "Financeiro e Seguros",
    groups: ["Financeiro e Seguros"],
    google: { cplMin: 180, cplMax: 900, lpConversion: 4.0 },
    meta: { cplMin: 100, cplMax: 350, lpConversion: 4.0 },
    confidence: "média",
  },
  {
    category: "Eventos e Hospitalidade",
    groups: ["Eventos e Hospitalidade"],
    google: { cplMin: 100, cplMax: 400, lpConversion: 2.5 },
    meta: { cplMin: 60, cplMax: 250, lpConversion: 2.5 },
    confidence: "baixa",
    note: "Pouco dado específico — validar.",
  },
];

// Usado quando o segmento não mapeia em nenhuma categoria (entrada livre / sem benchmark próprio).
// Médias gerais do Brasil (Leadster Panorama 2025).
export const FALLBACK_BENCHMARK: SegmentBenchmark = {
  category: "B2B Geral",
  groups: [],
  google: { cplMin: 150, cplMax: 500, lpConversion: 3.28 },
  meta: { cplMin: 90, cplMax: 300, lpConversion: 3.4 },
  confidence: "baixa",
  note: "Médias gerais do Brasil — fallback para segmentos sem benchmark específico.",
};

/** Resolve o benchmark a partir do rótulo de segmento escolhido pelo lead. */
export function getBenchmark(segmentLabel: string): SegmentBenchmark {
  const group = getSegmentGroup(segmentLabel);
  if (!group) return FALLBACK_BENCHMARK;
  return SEGMENT_BENCHMARKS.find((b) => b.groups.includes(group)) ?? FALLBACK_BENCHMARK;
}
