// Orquestrador FINO: compõe os steps independentes e devolve TODOS os intermediários.
// Cada step continua chamável isoladamente (ver ./steps/*). Providers são injetáveis.
import type { DiagnosticInput } from "@/lib/diagnostic";
import { getBenchmark } from "@/lib/benchmarks";
import type { DiagnosticPlan, EngineRun } from "@/lib/engine/types";
import { getLlmProvider, type LlmProvider } from "@/lib/engine/providers/llm";
import {
  getSearchVolumeProvider,
  type SearchVolumeProvider,
} from "@/lib/engine/providers/search-volume";
import { extractKeywords } from "@/lib/engine/steps/extract-keywords";
import { resolveDemand } from "@/lib/engine/steps/resolve-demand";
import { classifyArchetype } from "@/lib/engine/steps/classify-archetype";
import { generateRationale } from "@/lib/engine/steps/generate-rationale";
import { decideChannel } from "@/lib/engine/steps/decide-channel";
import { estimateCpl } from "@/lib/engine/steps/cpl-estimate";
import { generateMediaPlan } from "@/lib/engine/steps/media-plan";
import { computeFunnel } from "@/lib/engine/steps/funnel-targets";

export interface EngineDeps {
  llm?: LlmProvider | null;
  volumeProvider?: SearchVolumeProvider | null;
}

export async function runEngine(
  input: DiagnosticInput,
  deps: EngineDeps = {},
): Promise<EngineRun> {
  const llm = deps.llm !== undefined ? deps.llm : getLlmProvider();
  const volumeProvider =
    deps.volumeProvider !== undefined ? deps.volumeProvider : getSearchVolumeProvider();
  const benchmark = getBenchmark(input.segmento);

  const keywords = await extractKeywords(input, llm);
  const demand = await resolveDemand(input, keywords, { volumeProvider, llm });
  const classification = await classifyArchetype(input, demand, llm);
  const rationale = await generateRationale(input, classification.archetype, llm);
  const decision = decideChannel(classification, rationale, demand);
  const cpl = estimateCpl(decision.channel, benchmark);
  const mediaPlan = await generateMediaPlan(input, decision.channel, llm);
  const funnel = computeFunnel(input, decision.channel, benchmark, cpl);

  const plan: DiagnosticPlan = {
    channel: decision.channel,
    decision,
    mediaPlan,
    cpl,
    funnel,
    benchmarkCategory: benchmark.category,
    benchmarkConfidence: benchmark.confidence,
  };

  return { input, keywords, demand, decision, mediaPlan, cpl, funnel, plan };
}
