"use client";

import { useState } from "react";
import type { z } from "zod";
import {
  diagnosticSchema,
  type DiagnosticInput,
  FATURAMENTO,
  TICKET,
  RECORRENCIA,
  META_CRESCIMENTO,
  VENDEDORES,
  TRAFEGO,
} from "@/lib/diagnostic";
import { SegmentCombobox } from "@/components/SegmentCombobox";

type Data = Partial<Record<keyof DiagnosticInput, string | boolean>>;
type Errors = Partial<Record<keyof DiagnosticInput, string>>;

const stepSchemas = [
  diagnosticSchema.pick({
    segmento: true,
    faturamento: true,
    produtoPrincipal: true,
    ticketMedio: true,
    recorrencia: true,
    metaCrescimento: true,
    vendedores: true,
    trafego: true,
  }),
  diagnosticSchema.pick({ oferta: true }),
  diagnosticSchema.pick({
    nome: true,
    email: true,
    telefone: true,
    consentimento: true,
  }),
];

const STEP_LABELS = ["Seu negócio", "Sua oferta", "Seus dados"];

function collectErrors(schema: z.ZodType, data: unknown): Errors {
  const result = schema.safeParse(data);
  if (result.success) return {};
  const errs: Errors = {};
  for (const issue of result.error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !errs[key as keyof Errors]) {
      errs[key as keyof Errors] = issue.message;
    }
  }
  return errs;
}

export function DiagnosticForm() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<Data>({});
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState<DiagnosticInput | null>(null);

  function set<K extends keyof DiagnosticInput>(key: K, value: Data[K]) {
    setData((d) => ({ ...d, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  }

  async function submit(payload: DiagnosticInput) {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/diagnostico", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Falha no envio");
      setConfirmed(payload);
    } catch {
      setSubmitError("Não consegui enviar agora. Tente novamente em instantes.");
    } finally {
      setSubmitting(false);
    }
  }

  function next() {
    const errs = collectErrors(stepSchemas[step], data);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    if (step < stepSchemas.length - 1) {
      setStep(step + 1);
      return;
    }
    const full = diagnosticSchema.safeParse(data);
    if (!full.success) {
      setErrors(collectErrors(diagnosticSchema, data));
      return;
    }
    submit(full.data);
  }

  if (confirmed) {
    return <ConfirmationScreen data={confirmed} />;
  }

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
      {/* Progresso */}
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium text-zinc-900">
            Etapa {step + 1} de {stepSchemas.length} · {STEP_LABELS[step]}
          </span>
          <span className="text-zinc-400">
            {Math.round(((step + 1) / stepSchemas.length) * 100)}%
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-100">
          <div
            className="h-full rounded-full bg-zinc-900 transition-all"
            style={{ width: `${((step + 1) / stepSchemas.length) * 100}%` }}
          />
        </div>
      </div>

      {step === 0 && (
        <div className="space-y-5">
          <Field label="Qual o seu segmento?" error={errors.segmento}
            hint="Seja específico — quanto mais preciso, melhor o diagnóstico.">
            <SegmentCombobox
              value={(data.segmento as string) ?? ""}
              onChange={(v) => set("segmento", v)}
              error={errors.segmento}
            />
          </Field>

          <Field label="Faturamento mensal" error={errors.faturamento}>
            <Pills options={FATURAMENTO} value={data.faturamento as string}
              onChange={(v) => set("faturamento", v)} />
          </Field>

          <Field label="O que você mais vende?" error={errors.produtoPrincipal}
            hint="Em poucas palavras (ex.: cirurgia de catarata, plano contábil mensal).">
            <input
              type="text"
              value={(data.produtoPrincipal as string) ?? ""}
              onChange={(e) => set("produtoPrincipal", e.target.value)}
              placeholder="Seu principal produto/serviço"
              className={inputClass(errors.produtoPrincipal)}
            />
          </Field>

          <Field label="Ticket médio" error={errors.ticketMedio}>
            <Pills options={TICKET} value={data.ticketMedio as string}
              onChange={(v) => set("ticketMedio", v)} />
          </Field>

          <Field label="Modelo de cobrança" error={errors.recorrencia}>
            <Pills options={RECORRENCIA} value={data.recorrencia as string}
              onChange={(v) => set("recorrencia", v)} />
          </Field>

          <Field label="Meta de crescimento anual" error={errors.metaCrescimento}
            hint="Quanto você quer crescer nos próximos 12 meses. Usamos isso para calcular a verba ideal.">
            <Pills options={META_CRESCIMENTO} value={data.metaCrescimento as string}
              onChange={(v) => set("metaCrescimento", v)} />
          </Field>

          <Field label="Quantos vendedores você tem?" error={errors.vendedores}>
            <Pills options={VENDEDORES} value={data.vendedores as string}
              onChange={(v) => set("vendedores", v)} />
          </Field>

          <Field label="Já investe em tráfego pago hoje?" error={errors.trafego}>
            <Pills options={TRAFEGO} value={data.trafego as string}
              onChange={(v) => set("trafego", v)} />
          </Field>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-5">
          <Field label="Explique sua oferta" error={errors.oferta}
            hint="O que você vende, para quem e qual o principal resultado que entrega. Nossa análise usa isso para descobrir o melhor canal de aquisição para o seu caso.">
            <textarea
              rows={6}
              value={(data.oferta as string) ?? ""}
              onChange={(e) => set("oferta", e.target.value)}
              placeholder="Ex.: Faço cirurgia refrativa a laser para corrigir miopia em pacientes de 25 a 45 anos que querem parar de usar óculos. Diferencial: tecnologia X e pós-operatório acompanhado."
              className={inputClass(errors.oferta)}
            />
          </Field>
          <p className="rounded-xl bg-zinc-50 p-4 text-sm text-zinc-500">
            🔎 Com base nessa descrição, nossa IA analisa os sinais de mercado para
            indicar se o seu melhor canal é <strong>Google</strong> (quando já existe
            busca) ou <strong>Meta</strong> (quando a oferta precisa ser apresentada).
          </p>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-5">
          <Field label="Seu nome" error={errors.nome}>
            <input
              type="text"
              value={(data.nome as string) ?? ""}
              onChange={(e) => set("nome", e.target.value)}
              placeholder="Nome completo"
              className={inputClass(errors.nome)}
            />
          </Field>
          <Field label="E-mail" error={errors.email}>
            <input
              type="email"
              value={(data.email as string) ?? ""}
              onChange={(e) => set("email", e.target.value)}
              placeholder="voce@empresa.com.br"
              className={inputClass(errors.email)}
            />
          </Field>
          <Field label="WhatsApp" error={errors.telefone}
            hint="É no WhatsApp que você recebe a sua análise completa em PDF.">
            <input
              type="tel"
              inputMode="tel"
              maxLength={15}
              value={(data.telefone as string) ?? ""}
              onChange={(e) => set("telefone", formatPhoneInput(e.target.value))}
              placeholder="(11) 99999-9999"
              className={inputClass(errors.telefone)}
            />
          </Field>
          <label className="flex cursor-pointer items-start gap-3 text-sm text-zinc-600">
            <input
              type="checkbox"
              checked={Boolean(data.consentimento)}
              onChange={(e) => set("consentimento", e.target.checked)}
              className="mt-1 h-4 w-4 shrink-0 rounded border-zinc-300"
            />
            <span>
              Autorizo o contato e o tratamento dos meus dados conforme a LGPD para
              receber minha análise e comunicações relacionadas.
            </span>
          </label>
          {errors.consentimento && (
            <p className="-mt-2 text-sm text-red-600">{errors.consentimento}</p>
          )}
        </div>
      )}

      {submitting && (
        <div className="mt-6">
          <style>{`@keyframes loadfill{from{width:6%}to{width:94%}}`}</style>
          <div className="mb-2 text-sm text-zinc-600">
            Gerando sua análise e montando seu PDF…
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100">
            <div
              className="h-full rounded-full bg-zinc-900"
              style={{ animation: "loadfill 14s cubic-bezier(.15,.85,.25,1) forwards" }}
            />
          </div>
        </div>
      )}

      {submitError && (
        <p className="mt-6 rounded-xl bg-red-50 p-3 text-sm text-red-700">{submitError}</p>
      )}

      {/* Navegação */}
      <div className="mt-8 flex items-center justify-between gap-3">
        {step > 0 ? (
          <button
            type="button"
            onClick={() => setStep(step - 1)}
            disabled={submitting}
            className="rounded-full px-5 py-3 text-sm font-medium text-zinc-600 transition hover:text-zinc-900 disabled:opacity-40"
          >
            ← Voltar
          </button>
        ) : (
          <span />
        )}
        <button
          type="button"
          onClick={next}
          disabled={submitting}
          className="inline-flex h-12 items-center justify-center rounded-full bg-zinc-900 px-8 text-base font-semibold text-white transition hover:bg-zinc-700 disabled:opacity-60"
        >
          {step < stepSchemas.length - 1
            ? "Continuar"
            : submitting
              ? "Gerando…"
              : "Gerar minha análise"}
        </button>
      </div>
    </div>
  );
}

function inputClass(error?: string) {
  return `w-full rounded-xl border bg-white px-4 py-3 text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-900 ${
    error ? "border-red-400" : "border-zinc-300"
  }`;
}

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-zinc-900">{label}</label>
      {hint && <p className="mb-2 text-xs text-zinc-500">{hint}</p>}
      {children}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}

function Pills({
  options,
  value,
  onChange,
}: {
  options: readonly { value: string; label: string }[];
  value?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          type="button"
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`rounded-full border px-4 py-2 text-sm transition ${
            value === o.value
              ? "border-zinc-900 bg-zinc-900 text-white"
              : "border-zinc-300 bg-white text-zinc-700 hover:border-zinc-400"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function maskPhone(raw: string): string {
  const d = raw.replace(/\D/g, "");
  return d.length >= 4 ? `•••• ${d.slice(-4)}` : raw;
}

// Máscara de telefone BR: limita a 11 dígitos e formata (DDD) + 8/9 dígitos.
function formatPhoneInput(raw: string): string {
  const d = raw.replace(/\D/g, "").slice(0, 11);
  if (d.length === 0) return "";
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

function ConfirmationScreen({ data }: { data: DiagnosticInput }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-center shadow-sm sm:p-8">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-2xl">
        ✅
      </div>
      <h2 className="mt-4 text-2xl font-bold text-zinc-900">
        Falta 1 passo, {data.nome.split(" ")[0]}!
      </h2>
      <p className="mt-2 text-zinc-600">
        Acabamos de te enviar uma mensagem no WhatsApp{" "}
        <strong className="text-zinc-900">{maskPhone(data.telefone)}</strong>. Toque em{" "}
        <strong className="text-zinc-900">“Quero receber agora”</strong> para receber sua
        análise completa em PDF.
      </p>

      <ol className="mx-auto mt-6 max-w-sm space-y-3 text-left">
        {[
          "Abra a conversa que chegou no seu WhatsApp",
          "Toque no botão “Quero receber agora”",
          "Receba seu Raio-X da Aquisição B2B em PDF",
        ].map((txt, i) => (
          <li key={i} className="flex items-start gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-xs font-semibold text-white">
              {i + 1}
            </span>
            <span className="text-sm text-zinc-700">{txt}</span>
          </li>
        ))}
      </ol>

      <p className="mt-6 text-sm text-zinc-500">
        Não chegou? Confira se o número está correto ou aguarde alguns instantes.
      </p>
    </div>
  );
}
