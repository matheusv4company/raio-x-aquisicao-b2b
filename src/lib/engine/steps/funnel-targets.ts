// STEP (puro): metas de funil + resumo de unit economics (CAC implícito vs ticket).
// Independente e refinável. Constantes de cálculo no topo, fáceis de ajustar.
import type { DiagnosticInput } from "@/lib/diagnostic";
import { DEFAULT_FUNNEL, type SegmentBenchmark } from "@/lib/benchmarks";
import { TICKET_RANGES } from "@/lib/engine/ranges";
import type {
  Channel,
  CplEstimate,
  FunnelTargets,
  UnitEconomics,
} from "@/lib/engine/types";

// Meses de vida estimados de um cliente recorrente (para aproximar LTV). Ajustável.
const LTV_MESES_RECORRENTE = 12;
// Limiar saudável: CAC até 30% do valor de referência. Ajustável.
const CAC_SAUDAVEL_RATIO = 0.3;

export function computeFunnel(
  input: DiagnosticInput,
  channel: Channel,
  benchmark: SegmentBenchmark,
  cpl: CplEstimate,
): FunnelTargets {
  const ch = channel === "google" ? benchmark.google : benchmark.meta;
  const f = DEFAULT_FUNNEL;

  const leadToSaleRate =
    (f.leadToQualified / 100) *
    (f.qualifiedToMeeting / 100) *
    (f.meetingToSale / 100);

  const unitEconomics = computeUnitEconomics(input, cpl, f.meetingToSale, leadToSaleRate);

  return {
    lpConversion: ch.lpConversion,
    leadToQualified: f.leadToQualified,
    qualifiedToMeeting: f.qualifiedToMeeting,
    meetingToSale: f.meetingToSale,
    noShow: f.noShow,
    unitEconomics,
  };
}

function computeUnitEconomics(
  input: DiagnosticInput,
  cpl: CplEstimate,
  meetingToSalePct: number,
  leadToSaleRate: number,
): UnitEconomics {
  const [tMin, tMax] = TICKET_RANGES[input.ticketMedio];
  const ticketMid = (tMin + tMax) / 2;
  const recorrente = input.recorrencia === "recorrente";
  const valorReferencia = recorrente ? ticketMid * LTV_MESES_RECORRENTE : ticketMid;

  const cplMid = (cpl.min + cpl.max) / 2;
  const leadsPorVenda = leadToSaleRate > 0 ? Math.round(1 / leadToSaleRate) : 0;
  const reunioesPorVenda =
    meetingToSalePct > 0 ? Math.round(1 / (meetingToSalePct / 100)) : 0;

  const cac = (cplValue: number) =>
    leadToSaleRate > 0 ? Math.round(cplValue / leadToSaleRate) : 0;
  const cacImplicitoMin = cac(cpl.min);
  const cacImplicitoMax = cac(cpl.max);
  const cacImplicitoMedio = cac(cplMid);

  // Veredito baseado no CENÁRIO MÉDIO (não no pior caso), para não alarmar sem motivo.
  const ratio = valorReferencia > 0 ? cacImplicitoMedio / valorReferencia : Infinity;
  let veredito: UnitEconomics["veredito"];
  if (ratio <= CAC_SAUDAVEL_RATIO) veredito = "saudável";
  else if (ratio <= 1) veredito = "atenção";
  else veredito = "inviável";

  const valorLabel = recorrente
    ? `LTV estimado de ~R$ ${fmt(valorReferencia)} (${LTV_MESES_RECORRENTE} meses)`
    : `ticket de ~R$ ${fmt(valorReferencia)}`;

  const fecho =
    veredito === "saudável"
      ? "a conta fecha com folga"
      : veredito === "atenção"
        ? "a conta fecha, mas exige eficiência no funil e no CPL"
        : "a conta fica apertada — priorize aumentar ticket, conversão ou recorrência";

  const comentario =
    `Cada venda exige ~${leadsPorVenda} leads. No melhor caso (CPL R$ ${fmt(cpl.min)}), o ` +
    `custo por cliente fica ~R$ ${fmt(cacImplicitoMin)}; no pior (CPL R$ ${fmt(cpl.max)}), ~R$ ${fmt(cacImplicitoMax)}. ` +
    `Para um ${valorLabel}, ${fecho}.`;

  return {
    leadToSaleRate,
    leadsPorVenda,
    reunioesPorVenda,
    cacImplicitoMin,
    cacImplicitoMax,
    cacImplicitoMedio,
    valorReferencia,
    recorrente,
    veredito,
    comentario,
  };
}

function fmt(n: number): string {
  return n.toLocaleString("pt-BR", { maximumFractionDigits: 0 });
}
