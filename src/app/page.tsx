import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center bg-zinc-50 px-6 py-20 text-zinc-900">
      <div className="w-full max-w-2xl text-center">
        <span className="inline-block rounded-full border border-zinc-300 bg-white px-4 py-1 text-sm font-medium text-zinc-600">
          Diagnóstico gratuito · ~3 minutos
        </span>
        <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl">
          Raio-X da Aquisição B2B
        </h1>
        <p className="mt-5 text-lg leading-8 text-zinc-600">
          Responda algumas perguntas sobre o seu negócio e receba um{" "}
          <strong className="text-zinc-900">
            plano personalizado de captação de clientes
          </strong>
          : canal de mídia ideal, estrutura de campanha e criativos, CPL esperado e as
          metas de funil que você precisa bater.
        </p>
        <div className="mt-8">
          <Link
            href="/diagnostico"
            className="inline-flex h-12 items-center justify-center rounded-full bg-zinc-900 px-8 text-base font-semibold text-white transition-colors hover:bg-zinc-700"
          >
            Fazer meu Raio-X
          </Link>
        </div>
        <p className="mt-6 text-sm text-zinc-500">
          Para empresas B2B que faturam R$ 100 mil+/mês.
        </p>
      </div>
    </main>
  );
}
