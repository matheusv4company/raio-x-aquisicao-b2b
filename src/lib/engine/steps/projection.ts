// STEP (puro): projeção de investimento ORIENTADA À META.
// A verba é DERIVADA da meta de crescimento do cliente (reverse-funnel:
// meta → receita-alvo/mês → clientes/mês → leads/mês → verba), nunca de um % inventado.
// O CPL escala dentro da FAIXA PESQUISADA (min→max usado como curva de eficiência):
// verba baixa pega o inventário eficiente; escalar empurra para leads mais caros
// (retornos decrescentes). Independente e refinável.
import { META_CRESCIMENTO, type DiagnosticInput } from "@/lib/diagnostic";
import { META_CRESCIMENTO_PCT, faturamentoMid, ticketMid } from "@/lib/engine/ranges";
import type {
  CplEstimate,
  FunnelTargets,
  Projection,
  ProjectionScenario,
} from "@/lib/engine/types";

// Cenários ancorados na meta: Início (rampa) · Meta (bate exato) · Acelerar (supera).
// cplPos = posição na faixa pesquisada (0 = mínimo eficiente, 1 = teto saturado).
const TIERS = [
  { nome: "Início", mult: 0.5, cplPos: 0.25, rec: false },
  { nome: "Meta", mult: 1.0, cplPos: 0.5, rec: true },
  { nome: "Acelerar", mult: 1.5, cplPos: 0.78, rec: false },
] as const;

export function computeProjection(
  input: DiagnosticInput,
  cpl: CplEstimate,
  funnel: FunnelTargets,
): Projection {
  const F = faturamentoMid(input.faturamento);
  const T = ticketMid(input.ticketMedio);
  const g = META_CRESCIMENTO_PCT[input.metaCrescimento];
  const recorrente = input.recorrencia === "recorrente";
  const leadToSale = funnel.unitEconomics.leadToSaleRate;
  const cplRange = cpl.max - cpl.min;

  // Receita/mês que a captação precisa gerar p/ bater a meta em 12 meses:
  // recorrente acumula → adiciona (F*g)/12 de receita por mês; pontual → sustenta F*g/mês.
  const receitaAlvoMes = recorrente ? (F * g) / 12 : F * g;
  const clientesAlvo = T > 0 ? receitaAlvoMes / T : 0;
  const leadsAlvo = leadToSale > 0 ? clientesAlvo / leadToSale : 0;

  const scenarios: ProjectionScenario[] = TIERS.map((t) => {
    const leadsMes = leadsAlvo * t.mult;
    const cplV = cpl.min + cplRange * t.cplPos;
    const budgetMensal = leadsMes * cplV;
    const vendasMes = leadsMes * leadToSale;
    const receitaMes = vendasMes * T;
    return {
      nome: t.nome,
      recomendado: t.rec,
      multiplicador: t.mult,
      cpl: Math.round(cplV),
      budgetMensal: Math.round(budgetMensal),
      leadsMes: Math.round(leadsMes),
      vendasMes: Math.round(vendasMes),
      receitaMes: Math.round(receitaMes),
      roas: budgetMensal > 0 ? receitaMes / budgetMensal : 0,
    };
  });

  const meta = scenarios.find((s) => s.recomendado) ?? scenarios[0];
  const metaFrase =
    META_CRESCIMENTO.find((m) => m.value === input.metaCrescimento)?.frase ?? "";

  return {
    metaCrescimento: input.metaCrescimento,
    metaPct: g,
    metaFrase,
    recorrente,
    receitaAlvoMes: Math.round(receitaAlvoMes),
    budgetRecomendado: meta.budgetMensal,
    scenarios,
  };
}
