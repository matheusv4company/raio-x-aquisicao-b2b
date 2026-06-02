// STEP (puro): estima a faixa de CPL esperada para o canal, a partir do benchmark do segmento.
// Independente e refinável.
import type { SegmentBenchmark } from "@/lib/benchmarks";
import type { Channel, CplEstimate } from "@/lib/engine/types";

export function estimateCpl(
  channel: Channel,
  benchmark: SegmentBenchmark,
): CplEstimate {
  const c = channel === "google" ? benchmark.google : benchmark.meta;
  return {
    channel,
    min: c.cplMin,
    max: c.cplMax,
    note: benchmark.note,
  };
}
