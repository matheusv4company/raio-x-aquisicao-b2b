// STEP (puro): compõe a decisão final a partir do arquétipo classificado + a justificativa.
// O canal vem do arquétipo (ver archetypes.ts). Independente e refinável.
import { ARCHETYPES } from "@/lib/engine/archetypes";
import type {
  ArchetypeClassification,
  ChannelDecision,
  DemandSignal,
} from "@/lib/engine/types";

export function decideChannel(
  classification: ArchetypeClassification,
  rationale: string,
  demand: DemandSignal,
): ChannelDecision {
  const arch = ARCHETYPES[classification.archetype];
  return {
    channel: arch.channel,
    archetype: arch.id,
    archetypeNome: arch.nome,
    rationale,
    classification,
    demand,
  };
}
