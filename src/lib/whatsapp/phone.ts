// Utilitários de telefone BR (E.164). Módulo NEUTRO (sem imports do projeto) para evitar
// dependência circular entre submissions e send-template.

/** Normaliza telefone BR para E.164 (+55DDDNÚMERO). */
export function normalizePhoneBR(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("55") && digits.length >= 12) return `+${digits}`;
  return `+55${digits}`;
}

/** +55 + DDD(2) + número(8 ou 9) = 12 ou 13 dígitos. */
export function isValidPhoneBR(e164: string): boolean {
  const d = e164.replace(/\D/g, "");
  return d.startsWith("55") && (d.length === 12 || d.length === 13);
}

/**
 * Variantes plausíveis de um número BR para LOOKUP, tolerando o "9º dígito".
 * A Meta às vezes manda o wa_id sem o 9 (ex.: +559294818882) enquanto o lead salvou
 * com o 9 (+5592994818882) — e vice-versa. Retorna ambas as formas para casar no banco.
 */
export function phoneVariantsBR(input: string): string[] {
  const d = input.replace(/\D/g, "");
  const variants = new Set<string>();
  const add = (digits: string) => {
    if (digits) variants.add(`+${digits}`);
  };
  add(d); // como veio
  if (d.startsWith("55") && d.length >= 12) {
    const ddd = d.slice(2, 4);
    const rest = d.slice(4);
    if (rest.length === 8) {
      add(`55${ddd}9${rest}`); // sem 9 → adiciona com 9
    } else if (rest.length === 9 && rest.startsWith("9")) {
      add(`55${ddd}${rest.slice(1)}`); // com 9 → adiciona sem 9
    }
  }
  return [...variants];
}
