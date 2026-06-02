# Benchmarks BR — para validação

> Estes números alimentam a engine (`src/lib/benchmarks.ts`). **Edite à vontade** — aqui (doc) e/ou direto no arquivo de config. A coluna **Confiança** indica o quanto o dado é sólido.
>
> - **Conversão (anúncio→lead): confiança ALTA** — base Leadster Panorama 2025 (2.861 sites, 167M acessos, 3,7M leads).
> - **CPL: confiança VARIÁVEL** — parte de relatórios BR, parte extrapolada de benchmarks globais. É o que mais precisa do seu olhar de especialista.

## CPL esperado e conversão anúncio→lead, por categoria

| Categoria | Google CPL (R$) | Google conv. | Meta CPL (R$) | Meta conv. | Confiança |
|---|---|---|---|---|---|
| Saúde (medicina, odonto, estética) | 70–360 | 3,5% | 50–200 | 4,0% | média |
| Jurídico | 370–1.630 | 2,5% | 90–220 | 4,5% | alta |
| Contabilidade e Finanças | 225–900 | 3,0% | 125–315 | 3,5% | média |
| Tecnologia e Software (SaaS) | 270–1.260 | 2,0% | 90–450 | 2,2% | média |
| Marketing e Agências | 90–450 | 4,0% | 90–300 | 4,0% | baixa |
| Consultoria e Serviços B2B | 90–450 | 1,6% | 90–300 | 1,8% | média |
| Indústria (manufatura, atacado, agro) | 135–360 | 3,0% | 90–300 | 2,5% | média |
| Construção e Engenharia | 135–360 | 2,5% | 90–300 | 2,5% | média |
| Imobiliário | 56–315 | 1,5% | 56–150 | 1,8% | média |
| Logística e Transporte | 150–500 | 2,6% | 90–300 | 2,5% | **baixa** |
| Educação | 200–900 | 3,0% | 90–450 | 3,0% | **baixa** |
| Financeiro e Seguros | 180–900 | 4,0% | 100–350 | 4,0% | média |
| Eventos e Hospitalidade | 100–400 | 2,5% | 60–250 | 2,5% | **baixa** |
| **B2B Geral (fallback)** | 150–500 | 3,28% | 90–300 | 3,40% | baixa |

> Médias gerais BR 2025: **Google 3,28%** / **Meta 3,40%** de conversão anúncio→lead. Meta é ~4–5x mais barato em CPL, porém lead menos qualificado.

## Funil downstream padrão (B2B/serviços)

Aplicado a todos por enquanto (varia mais por motion de vendas que por segmento — a engine pode ajustar por ticket/recorrência):

| Etapa | Meta padrão | Faixa observada (BR) |
|---|---|---|
| Lead → qualificado | 30% | 15–45% |
| Qualificado → reunião realizada | 40% | — |
| Reunião → venda | 25% | 22–30% |
| No-show de reuniões | 20% | 8–25% (cadência reduz p/ ~10%) |

Insight: WhatsApp na captação melhora a conversão em ~24% (3,12% vs 2,52%) — Leadster 2025.

## Lacunas (precisam do seu olhar)

- **CPL por micro-segmento** (ex.: oncologista vs oftalmologista): relatórios só trazem por categoria ampla. A engine usa a categoria; refine os casos que você conhece de perto.
- **Logística, Educação, Eventos, Agro, Atacado**: CPL com baixa confiança — validar.
- **Educação**: ensino superior global tem CPL muito mais alto; a faixa aqui é conservadora.

## Fontes
- [Leadster — Panorama de Geração de Leads 2025](https://leadster.com.br/panorama-geracao-de-leads-no-brasil-2025/) · [Taxa de conversão por segmento](https://leadster.com.br/blog/taxa-de-conversao-por-segmento/)
- [Conversion.com.br — Google Ads Benchmarks 2024](https://www.conversion.com.br/blog/google-ads-benchmarks-2024/)
- [Searchlab — Meta Ads 2026](https://searchlab.com.br/p/meta-ads-mais-caro-2026/) · [Superads — Facebook Ads Brasil](https://www.superads.ai/facebook-ads-costs/)
- [Meetime — Inside Sales Benchmark](https://meetime.com.br/blog/prospeccao/metas-para-sdrs/) · [DataStone — SaaS B2B 2025](https://blog.datastone.com.br/blog/2025/09/04/benchmark-conversao-saas-b2b/)
- [Growth Machine — vazamentos/no-show](https://blog.growthmachine.com.br/5-vazamentos-funil-de-vendas-b2b/) · [Ruler Analytics (global)](https://www.ruleranalytics.com/blog/insight/conversion-rate-by-industry/)
- [RD Station — Panorama 2025](https://www.rdstation.com/pesquisas/panoramas-rdstation-2025/)
