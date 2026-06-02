import { DiagnosticForm } from "@/components/DiagnosticForm";

export default function DiagnosticoPage() {
  return (
    <main className="flex flex-1 flex-col items-center bg-zinc-50 px-4 py-10 text-zinc-900 sm:py-16">
      <div className="w-full max-w-xl">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Raio-X da Aquisição B2B
          </h1>
          <p className="mt-2 text-zinc-600">
            Responda em ~3 minutos e receba seu plano de captação.
          </p>
        </div>
        <DiagnosticForm />
      </div>
    </main>
  );
}
