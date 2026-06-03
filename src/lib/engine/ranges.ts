// Fonte ÚNICA dos pontos médios numéricos das faixas do formulário (faturamento, ticket)
// e do percentual de crescimento da meta. Derivados aqui, nunca espalhados pela engine.
import type { DiagnosticInput } from "@/lib/diagnostic";

export const FATURAMENTO_RANGES: Record<DiagnosticInput["faturamento"], [number, number]> = {
  "0-50k": [0, 50_000],
  "50-100k": [50_000, 100_000],
  "100-250k": [100_000, 250_000],
  "250-500k": [250_000, 500_000],
  "500k-1m": [500_000, 1_000_000],
  "1m-3m": [1_000_000, 3_000_000],
  "3m-5m": [3_000_000, 5_000_000],
  "5m+": [5_000_000, 8_000_000],
};

export const TICKET_RANGES: Record<DiagnosticInput["ticketMedio"], [number, number]> = {
  "<1k": [500, 1_000],
  "1-3k": [1_000, 3_000],
  "3-5k": [3_000, 5_000],
  "5-10k": [5_000, 10_000],
  "10-20k": [10_000, 20_000],
  "20k+": [20_000, 40_000],
};

// Crescimento-alvo em 12 meses (fração do faturamento atual).
export const META_CRESCIMENTO_PCT: Record<DiagnosticInput["metaCrescimento"], number> = {
  consistencia: 0.2,
  forte: 0.5,
  dobrar: 1.0,
};

export function faturamentoMid(v: DiagnosticInput["faturamento"]): number {
  const [a, b] = FATURAMENTO_RANGES[v];
  return (a + b) / 2;
}

export function ticketMid(v: DiagnosticInput["ticketMedio"]): number {
  const [a, b] = TICKET_RANGES[v];
  return (a + b) / 2;
}
