// Taxonomia de segmentos B2B / serviços profissionais.
// Objetivo: campo BUSCÁVEL e granular — "médico oncologista" e "médico oftalmologista"
// são campanhas completamente diferentes, então cada especialidade é uma entrada própria.
// Cobertura é um ponto de partida forte; a entrada livre no combobox garante 100% de cobertura.
// Para expandir: basta adicionar itens nos grupos abaixo.

export interface SegmentOption {
  label: string;
  group: string;
}

export const SEGMENT_GROUPS: { group: string; items: string[] }[] = [
  {
    group: "Saúde — Medicina",
    items: [
      "Médico oncologista",
      "Médico oftalmologista",
      "Médico dermatologista",
      "Médico cardiologista",
      "Médico ortopedista",
      "Médico ginecologista / obstetra",
      "Médico pediatra",
      "Médico psiquiatra",
      "Médico endocrinologista",
      "Médico urologista",
      "Médico gastroenterologista",
      "Médico neurologista",
      "Médico otorrinolaringologista",
      "Cirurgião plástico",
      "Médico mastologista",
      "Médico reumatologista",
      "Médico nefrologista",
      "Médico pneumologista",
      "Cirurgião vascular / angiologista",
      "Médico do trabalho",
      "Médico nutrólogo",
      "Médico geriatra",
      "Médico infectologista",
      "Clínica médica / policlínica",
      "Centro de diagnóstico por imagem",
      "Laboratório de análises clínicas",
    ],
  },
  {
    group: "Saúde — Odontologia",
    items: [
      "Dentista clínico geral",
      "Implantodontia",
      "Ortodontia",
      "Harmonização orofacial",
      "Odontopediatria",
      "Endodontia",
      "Periodontia",
      "Prótese dentária",
      "Odontologia estética",
      "Clínica odontológica",
    ],
  },
  {
    group: "Saúde — Outras áreas",
    items: [
      "Psicólogo",
      "Psicanalista",
      "Nutricionista",
      "Fisioterapeuta",
      "Pilates / RPG",
      "Fonoaudiólogo",
      "Terapeuta ocupacional",
      "Clínica de estética",
      "Dermato-funcional / estética avançada",
      "Clínica de emagrecimento",
      "Clínica de fertilidade / reprodução humana",
      "Clínica veterinária",
    ],
  },
  {
    group: "Jurídico",
    items: [
      "Advogado trabalhista",
      "Advogado tributário",
      "Advogado previdenciário",
      "Advogado de família e sucessões",
      "Advogado criminal",
      "Advogado empresarial / societário",
      "Advogado civil",
      "Advogado imobiliário",
      "Advogado do consumidor",
      "Advogado bancário",
      "Advogado médico / da saúde",
      "Advogado digital / LGPD",
      "Advogado ambiental",
      "Advogado de trânsito",
      "Advogado de imigração",
      "Escritório de advocacia (full service)",
    ],
  },
  {
    group: "Contabilidade e Finanças",
    items: [
      "Escritório de contabilidade",
      "Contabilidade para médicos / clínicas",
      "Contabilidade para TI / startups",
      "BPO financeiro",
      "Consultoria tributária",
      "Planejamento tributário",
      "Planejamento patrimonial / sucessório",
      "Auditoria",
      "Abertura de empresa / regularização",
    ],
  },
  {
    group: "Tecnologia e Software",
    items: [
      "SaaS B2B",
      "Software sob medida / fábrica de software",
      "Desenvolvimento de aplicativos mobile",
      "Consultoria de TI",
      "Cloud e infraestrutura",
      "Cibersegurança",
      "Dados e BI",
      "Implementação de ERP",
      "Automação / RPA",
      "Inteligência artificial",
      "Outsourcing de TI",
    ],
  },
  {
    group: "Marketing e Vendas",
    items: [
      "Agência de tráfego pago",
      "Agência de marketing full-service",
      "Gestão de redes sociais",
      "SEO e marketing de conteúdo",
      "Branding e design",
      "Assessoria de imprensa",
      "Produtora de vídeo",
      "Consultoria de vendas",
      "Geração de leads / outbound",
      "Consultoria de CRM / RevOps",
    ],
  },
  {
    group: "Consultoria e Serviços Profissionais",
    items: [
      "Consultoria de gestão",
      "Consultoria financeira / CFO as a service",
      "Consultoria de RH",
      "Recrutamento e seleção / headhunting",
      "Treinamento corporativo",
      "Coaching executivo / mentoria",
      "Consultoria comercial",
      "Consultoria ESG",
      "Consultoria em LGPD",
    ],
  },
  {
    group: "Indústria e Manufatura",
    items: [
      "Indústria metalúrgica",
      "Indústria de plásticos",
      "Indústria de alimentos e bebidas",
      "Indústria química",
      "Indústria têxtil / confecção",
      "Indústria moveleira",
      "Indústria de embalagens",
      "Autopeças",
      "Equipamentos industriais",
      "Fabricante de máquinas",
      "Indústria farmacêutica / cosmética",
    ],
  },
  {
    group: "Construção e Engenharia",
    items: [
      "Escritório de arquitetura",
      "Engenharia civil",
      "Construtora",
      "Incorporadora",
      "Reformas comerciais",
      "Projetos elétricos",
      "Climatização / HVAC",
      "Energia solar",
      "Paisagismo",
      "Marcenaria sob medida",
    ],
  },
  {
    group: "Imobiliário",
    items: [
      "Imobiliária (vendas)",
      "Imobiliária comercial / locação",
      "Loteadora",
      "Administradora de condomínios",
      "Corretor de imóveis de alto padrão",
    ],
  },
  {
    group: "Logística e Transporte",
    items: [
      "Transportadora",
      "Logística e fulfillment",
      "Comércio exterior / despachante aduaneiro",
      "Locação de frota",
      "Armazenagem",
    ],
  },
  {
    group: "Atacado e Distribuição",
    items: [
      "Distribuidora",
      "Atacadista",
      "Representação comercial",
      "Importadora",
    ],
  },
  {
    group: "Educação e Treinamento",
    items: [
      "Escola técnica / profissionalizante",
      "Curso preparatório",
      "Escola de idiomas (in company)",
      "Escola de educação básica",
      "Faculdade / EAD",
      "Educação infantil",
    ],
  },
  {
    group: "Serviços Empresariais (Facilities)",
    items: [
      "Terceirização de mão de obra",
      "Limpeza e conservação",
      "Segurança patrimonial",
      "Manutenção predial",
      "Telecom / internet empresarial",
      "Controle de pragas / dedetização",
      "Locação de equipamentos",
    ],
  },
  {
    group: "Financeiro e Seguros",
    items: [
      "Corretora de seguros",
      "Assessoria de investimentos",
      "Crédito / empréstimo empresarial",
      "Meios de pagamento / adquirência",
      "Consórcio",
      "Factoring / antecipação de recebíveis",
    ],
  },
  {
    group: "Agronegócio",
    items: [
      "Insumos agrícolas",
      "Maquinário agrícola",
      "Consultoria agronômica",
      "Pecuária",
      "Irrigação",
    ],
  },
  {
    group: "Eventos e Hospitalidade",
    items: [
      "Organização de eventos corporativos",
      "Buffet / catering",
      "Hotel / pousada",
      "Espaço para eventos",
      "Turismo corporativo",
    ],
  },
];

export const SEGMENTS: SegmentOption[] = SEGMENT_GROUPS.flatMap((g) =>
  g.items.map((label) => ({ label, group: g.group })),
);

/** Remove acentos e normaliza para busca tolerante. */
export function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

/** Busca por rótulo (prioridade) e por grupo, tolerante a acentos. */
export function searchSegments(query: string, limit = 30): SegmentOption[] {
  const q = normalizeText(query);
  if (!q) return [];
  const byLabel = SEGMENTS.filter((s) => normalizeText(s.label).includes(q));
  const byGroup = SEGMENTS.filter(
    (s) =>
      !normalizeText(s.label).includes(q) && normalizeText(s.group).includes(q),
  );
  return [...byLabel, ...byGroup].slice(0, limit);
}

/** Retorna o grupo da taxonomia para um rótulo escolhido (ou undefined se for entrada livre). */
export function getSegmentGroup(label: string): string | undefined {
  const norm = normalizeText(label);
  return SEGMENTS.find((s) => normalizeText(s.label) === norm)?.group;
}
