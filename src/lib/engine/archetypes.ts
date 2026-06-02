// Arquétipos de comportamento de compra → canal + padrão de justificativa.
// Validado com o cliente. A pergunta-chave: no momento da decisão, o cliente está
// PROCURANDO ativamente por essa solução? Sim → Google; Não → Meta.
// IMPORTANTE: o canal depende da OFERTA/ÂNGULO, não do segmento (a mesma contabilidade
// é Google p/ "abrir CNPJ" e Meta p/ "captar clientes de concorrentes").
// Esta é a copy EDITÁVEL: fallbackRationale (sem IA) e guiaIA (orienta a IA a escrever).
import type { DiagnosticInput } from "@/lib/diagnostic";
import type { ArchetypeId, Channel } from "@/lib/engine/types";

export interface Archetype {
  id: ArchetypeId;
  channel: Channel;
  nome: string;
  gatilho: string; // descrição do trigger (usada na classificação da IA)
  exemplos: string[];
  /** Justificativa fallback (sem IA), no padrão do arquétipo. */
  fallbackRationale: (input: DiagnosticInput) => string;
  /** Orientação para a IA escrever a justificativa nesse padrão. */
  guiaIA: string;
}

export const ARCHETYPES: Record<ArchetypeId, Archetype> = {
  A1: {
    id: "A1",
    channel: "google",
    nome: "Necessidade aguda",
    gatilho: "O cliente já está com o problema e procura com urgência.",
    exemplos: ["advogado trabalhista", "manutenção corretiva", "encanador"],
    fallbackRationale: (i) =>
      `Quem precisa de ${i.produtoPrincipal} normalmente já está com o problema na mão e procura ` +
      `ativamente por uma solução — muitas vezes com urgência. Aqui o jogo não é criar desejo, é estar ` +
      `presente no momento exato da busca, à frente dos concorrentes. No seu caso, o Google Ads é a mídia ideal.`,
    guiaIA:
      "Necessidade aguda/urgente: o cliente já está com o problema e procura com urgência. " +
      "Enquadre que o jogo é estar na busca no momento exato, não criar desejo.",
  },
  A2: {
    id: "A2",
    channel: "google",
    nome: "Insatisfação percebida",
    gatilho:
      "Custo de troca alto, mas a insatisfação é visível; quando estoura, o cliente procura ativamente.",
    exemplos: ["limpeza terceirizada", "troca de fornecedor B2B"],
    fallbackRationale: () =>
      `A troca de fornecedor nesse mercado só acontece quando a insatisfação fica evidente — e aí o cliente ` +
      `procura ativamente por alternativas. Estar presente nessa busca coloca você direto na disputa, no momento ` +
      `em que a necessidade aparece. No seu caso, o Google Ads é a mídia ideal.`,
    guiaIA:
      "Insatisfação percebida: custo de troca alto, mas quando a insatisfação fica evidente o cliente procura. " +
      "Enquadre capturar essa busca no momento da troca.",
  },
  A3: {
    id: "A3",
    channel: "google",
    nome: "Desejo pré-existente",
    gatilho:
      "A decisão já foi tomada por conta própria (não se cria com anúncio); só falta escolher o fornecedor.",
    exemplos: ["abertura de CNPJ", "compra já decidida"],
    fallbackRationale: (i) =>
      `A decisão de contratar ${i.produtoPrincipal} normalmente já está tomada quando o cliente vai atrás — ` +
      `não se cria essa demanda com um anúncio, captura-se quem já decidiu. O caminho é aparecer na busca, na ` +
      `frente dos concorrentes, no momento exato. No seu caso, o Google Ads é a mídia ideal.`,
    guiaIA:
      "Desejo pré-existente: a decisão já foi tomada sozinha (não se cria com anúncio); só falta escolher fornecedor. " +
      "Enquadre capturar quem já decidiu.",
  },
  A4: {
    id: "A4",
    channel: "meta",
    nome: "Acomodação / insatisfação latente",
    gatilho:
      "O cliente mantém o serviço há anos e não percebe que poderia ser melhor; não procura trocar.",
    exemplos: ["contabilidade (captar de concorrentes)", "plano de saúde", "energia/telecom"],
    fallbackRationale: () =>
      `Muitos clientes mantêm esse tipo de serviço por anos sem questionar, porque não percebem que poderiam ter ` +
      `algo bem melhor — e por isso não estão procurando trocar. O caminho é o Meta: anúncios que revelam os sinais ` +
      `de um serviço ruim e convidam para uma análise gratuita despertam a insatisfação e geram a troca. ` +
      `No seu caso, o Meta Ads é a mídia ideal.`,
    guiaIA:
      "Acomodação/insatisfação latente: o cliente mantém o serviço há anos sem perceber que poderia ser melhor; " +
      "não procura trocar. Enquadre que o Meta revela o problema e chama para uma análise gratuita.",
  },
  A5: {
    id: "A5",
    channel: "meta",
    nome: "Oferta diferenciada/desconhecida",
    gatilho:
      "O público não sabe que existe uma solução nesse formato; a oferta é diferenciada/nova.",
    exemplos: ["consultoria financeira", "metodologia proprietária"],
    fallbackRationale: () =>
      `Sua oferta tem um grau de diferenciação ainda não conhecido por boa parte do seu público — as pessoas ` +
      `sentem o problema, mas não sabem que existe uma solução como a sua. Por isso o caminho é uma mídia de ` +
      `atenção, onde o seu lead já está, para apresentar todos os benefícios antes que ele perceba que precisa. ` +
      `No seu caso, o Meta Ads é a mídia ideal.`,
    guiaIA:
      "Oferta diferenciada/desconhecida: o público não sabe que existe a solução nesse formato. " +
      "Enquadre apresentar o valor numa mídia de atenção; use 'grau de diferenciação ainda não conhecido por boa parte do seu público'.",
  },
};
