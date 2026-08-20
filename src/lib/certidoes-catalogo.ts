import type { TipoPessoa } from "./types";

export type EscopoCertidao = "imovel" | "pessoa";

export interface CertidaoCatalogoItem {
  tipo: string;
  label: string;
  orgao: string;
  escopo: EscopoCertidao;
  /** Quando definido, o item só é gerado para partes desse tipo de pessoa. */
  restritoATipoPessoa?: TipoPessoa;
  /** "Quando houver" — item opcional que nem sempre se aplica. */
  condicional?: boolean;
  url: string | null;
  observacao?: string;
}

// Catálogo fixo das certidões negativas exigidas na diligência imobiliária
// do escritório. Os links são os endereços oficiais informados — o portal
// da prefeitura (gp.srv.br) reúne as opções "Imobiliária" e "Contribuinte"
// dentro da mesma tela, então os dois itens abrem o mesmo portal.
export const CERTIDOES_CATALOGO: CertidaoCatalogoItem[] = [
  {
    tipo: "declaracao_valor_venal",
    label: "Declaração de valor venal",
    orgao: "Prefeitura Municipal — Setor de Tributos",
    escopo: "imovel",
    url: null,
    observacao: "Sem emissão on-line — solicitar diretamente no setor de tributos do município.",
  },
  {
    tipo: "cnd_debitos_imobiliarios",
    label: "Certidão negativa de débitos imobiliários (opção Imobiliária)",
    orgao: "Prefeitura Municipal (gp.srv.br)",
    escopo: "imovel",
    url: "https://www.gp.srv.br/tributario_sinop/servlet/portal_serv_servico?12,53",
    observacao: "No portal, selecione a opção referente ao imóvel (Imobiliária).",
  },
  {
    tipo: "cnd_debitos_municipais_contribuinte",
    label: "Certidão negativa de débitos municipais (opção Contribuinte)",
    orgao: "Prefeitura Municipal (gp.srv.br)",
    escopo: "pessoa",
    url: "https://www.gp.srv.br/tributario_sinop/servlet/portal_serv_servico?12,53",
    observacao: "No portal, selecione a opção referente ao proprietário (Contribuinte).",
  },
  {
    tipo: "cnd_fazenda_estadual",
    label: "Certidão negativa de débitos da Fazenda Estadual",
    orgao: "SEFAZ-MT",
    escopo: "pessoa",
    url: "https://www.sefaz.mt.gov.br/cnd/certidao/servlet/ServletRotd?origem=60",
  },
  {
    tipo: "cnd_uniao_pf",
    label: "Certidão negativa de débitos junto à União (CPF)",
    orgao: "Receita Federal",
    escopo: "pessoa",
    restritoATipoPessoa: "fisica",
    url: "http://servicos.receita.fazenda.gov.br/Servicos/certidao/CNDConjuntaInter/InformaNICertidao.asp?tipo=2",
  },
  {
    tipo: "cnd_uniao_pj",
    label: "Certidão negativa de débitos junto à União (PJ)",
    orgao: "Receita Federal",
    escopo: "pessoa",
    restritoATipoPessoa: "juridica",
    url: "https://servicos.receita.fazenda.gov.br/Servicos/certidaointernet/PJ/Emitir",
  },
  {
    tipo: "cnd_civeis_criminais_tjmt",
    label: "Certidão negativa de ações cíveis e criminais (1º e 2º grau)",
    orgao: "TJMT",
    escopo: "pessoa",
    url: "https://sec.tjmt.jus.br/",
  },
  {
    tipo: "cnd_trabalhista_trt23",
    label: "Certidão negativa de ações trabalhistas (TRT 23ª região)",
    orgao: "TRT23",
    escopo: "pessoa",
    url: "https://portal.trt23.jus.br/portal/certid%C3%B5es",
  },
  {
    tipo: "cnd_trabalhista_tst",
    label: "Certidão negativa de ações trabalhistas (TST)",
    orgao: "TST",
    escopo: "pessoa",
    url: "https://www.tst.jus.br/certidao1",
  },
  {
    tipo: "cnd_trf1_geral",
    label: "Certidão negativa cível/criminal — TRF1 (Geral)",
    orgao: "TRF1",
    escopo: "pessoa",
    url: "https://sistemas.trf1.jus.br/certidao/#/solicitacao",
  },
  {
    tipo: "cnd_trf1_estado",
    label: "Certidão negativa cível/criminal — TRF1 (Estado)",
    orgao: "TRF1",
    escopo: "pessoa",
    url: "https://sistemas.trf1.jus.br/certidao/#/solicitacao",
  },
  {
    tipo: "cnd_trf1_regionalizada",
    label: "Certidão negativa cível/criminal — TRF1 (Regionalizada)",
    orgao: "TRF1",
    escopo: "pessoa",
    url: "https://sistemas.trf1.jus.br/certidao/#/solicitacao",
  },
  {
    tipo: "cnd_trf1_varas_juizados",
    label: "Certidão negativa cível/criminal — TRF1 (Varas e Juizados)",
    orgao: "TRF1",
    escopo: "pessoa",
    url: "https://sistemas.trf1.jus.br/certidao/#/solicitacao",
  },
  {
    tipo: "consulta_protestos",
    label: "Consulta de protestos",
    orgao: "CENPROT Nacional",
    escopo: "pessoa",
    condicional: true,
    url: "https://site.cenprotnacional.org.br/",
  },
  {
    tipo: "consulta_processos_tjmt",
    label: "Consulta de processos",
    orgao: "TJMT",
    escopo: "pessoa",
    condicional: true,
    url: "http://servicos.tjmt.jus.br/Processos/Comarcas/consulta.aspx",
  },
];

export function certidoesAplicaveis(tipoPessoa: TipoPessoa): CertidaoCatalogoItem[] {
  return CERTIDOES_CATALOGO.filter(
    (item) => item.escopo === "pessoa" && (!item.restritoATipoPessoa || item.restritoATipoPessoa === tipoPessoa),
  );
}

export function certidoesDoImovel(): CertidaoCatalogoItem[] {
  return CERTIDOES_CATALOGO.filter((item) => item.escopo === "imovel");
}

export function catalogoPorTipo(tipo: string): CertidaoCatalogoItem | undefined {
  return CERTIDOES_CATALOGO.find((item) => item.tipo === tipo);
}
