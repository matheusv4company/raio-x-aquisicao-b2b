// Provider de LLM (Claude) — injetável. Os steps funcionam SEM ele (fallback determinístico).
// A implementação real (Anthropic) será plugada quando houver ANTHROPIC_API_KEY (Fase 2.x),
// de preferência via SDK oficial com prompt caching.

export interface LlmProvider {
  generateJSON<T>(opts: { system?: string; prompt: string }): Promise<T>;
  generateText(opts: { system?: string; prompt: string }): Promise<string>;
}

/**
 * Retorna o provider real ou `null` (modo fallback).
 * Enquanto o adapter Anthropic não está implementado, retorna null mesmo com a chave —
 * a engine roda 100% em fallback determinístico. Trocar aqui ao implementar o adapter.
 */
export function getLlmProvider(): LlmProvider | null {
  // TODO(Fase 2.x): implementar adapter Anthropic (SDK + prompt caching) quando ANTHROPIC_API_KEY existir.
  return null;
}
