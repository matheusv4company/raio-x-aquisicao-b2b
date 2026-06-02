import { z } from "zod";

// Opções de cada campo (value = chave estável usada pela engine; label = texto exibido).
export const FATURAMENTO = [
  { value: "0-50k", label: "Até R$ 50 mil/mês" },
  { value: "50-100k", label: "R$ 50 mil a R$ 100 mil/mês" },
  { value: "100-250k", label: "R$ 100 mil a R$ 250 mil/mês" },
  { value: "250-500k", label: "R$ 250 mil a R$ 500 mil/mês" },
  { value: "500k-1m", label: "R$ 500 mil a R$ 1 milhão/mês" },
  { value: "1m-3m", label: "R$ 1 mi a R$ 3 mi/mês" },
  { value: "3m-5m", label: "R$ 3 mi a R$ 5 mi/mês" },
  { value: "5m+", label: "Mais de R$ 5 mi/mês" },
] as const;

export const TICKET = [
  { value: "<1k", label: "Até R$ 1 mil" },
  { value: "1-3k", label: "R$ 1 mil a R$ 3 mil" },
  { value: "3-5k", label: "R$ 3 mil a R$ 5 mil" },
  { value: "5-10k", label: "R$ 5 mil a R$ 10 mil" },
  { value: "10-20k", label: "R$ 10 mil a R$ 20 mil" },
  { value: "20k+", label: "Mais de R$ 20 mil" },
] as const;

export const RECORRENCIA = [
  { value: "recorrente", label: "Recorrente (assinatura / mensalidade)" },
  { value: "pontual", label: "Pontual (venda avulsa / one-time)" },
] as const;

export const VENDEDORES = [
  { value: "0", label: "Nenhum (só eu / sócios)" },
  { value: "1-3", label: "1 a 3 vendedores" },
  { value: "4-10", label: "4 a 10 vendedores" },
  { value: "10+", label: "Mais de 10 vendedores" },
] as const;

export const TRAFEGO = [
  { value: "nao", label: "Não invisto em tráfego ainda" },
  { value: "agencia", label: "Sim, com uma agência" },
  { value: "interna", label: "Sim, com equipe interna" },
] as const;

// Schema único de validação, compartilhado entre cliente (formulário) e servidor (API da Fase 4).
export const diagnosticSchema = z.object({
  // Etapa 1 — negócio
  segmento: z.string().min(2, "Selecione ou digite seu segmento"),
  faturamento: z.enum([
    "0-50k",
    "50-100k",
    "100-250k",
    "250-500k",
    "500k-1m",
    "1m-3m",
    "3m-5m",
    "5m+",
  ]),
  produtoPrincipal: z
    .string()
    .min(2, "Conte o que você mais vende")
    .max(140, "Tente resumir em poucas palavras"),
  ticketMedio: z.enum(["<1k", "1-3k", "3-5k", "5-10k", "10-20k", "20k+"]),
  recorrencia: z.enum(["recorrente", "pontual"]),
  vendedores: z.enum(["0", "1-3", "4-10", "10+"]),
  trafego: z.enum(["nao", "agencia", "interna"]),
  // Etapa 2 — oferta (insumo da análise de IA da Fase 2)
  oferta: z
    .string()
    .min(15, "Descreva sua oferta com um pouco mais de detalhe")
    .max(1200, "Tente resumir um pouco mais"),
  // Etapa 3 — contato
  nome: z.string().min(2, "Informe seu nome"),
  email: z.string().email("E-mail inválido"),
  telefone: z.string().min(10, "Informe um WhatsApp válido com DDD"),
  consentimento: z
    .boolean()
    .refine((v) => v === true, { message: "É necessário aceitar para continuar" }),
});

export type DiagnosticInput = z.infer<typeof diagnosticSchema>;
