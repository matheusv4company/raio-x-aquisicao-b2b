// Provider de VOLUME DE BUSCA (Google Ads API) — injetável.
// Os steps funcionam SEM ele (cai em estimativa). Implementação real plugada quando
// houver credenciais do Google Ads (developer token Basic Access + OAuth) — Fase 2.x.
import type { KeywordVolume } from "@/lib/engine/types";

export interface SearchVolumeProvider {
  /** Volume mensal de busca (geo Brasil, pt) para cada palavra-chave. */
  getVolumes(keywords: string[]): Promise<KeywordVolume[]>;
}

/**
 * Retorna o provider real ou `null` (modo estimativa).
 * Enquanto o adapter Google Ads não está implementado, retorna null mesmo com credenciais.
 */
export function getSearchVolumeProvider(): SearchVolumeProvider | null {
  // TODO(Fase 2.x): adapter Google Ads (KeywordPlanIdeaService.GenerateKeywordHistoricalMetrics).
  return null;
}
