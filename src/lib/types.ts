export type PapelUsuario = "admin" | "advogado" | "financeiro";
export type TipoPessoa = "fisica" | "juridica";
export type TipoRelacaoCliente = "cliente" | "devedor" | "ambos";
export type AreaProcesso =
  | "civel"
  | "trabalhista"
  | "familia"
  | "cobranca"
  | "tributario"
  | "criminal"
  | "consumidor"
  | "previdenciario"
  | "empresarial"
  | "outro";
export type FaseProcesso =
  | "conhecimento"
  | "recursal"
  | "execucao"
  | "cumprimento_sentenca"
  | "inqueito"
  | "administrativo";
export type StatusProcesso = "ativo" | "suspenso" | "arquivado" | "encerrado" | "extinto";
export type TipoAndamento = "andamento" | "prazo" | "audiencia";
export type TipoLancamento = "receita" | "despesa";
export type CategoriaLancamento =
  | "honorarios_contratuais"
  | "honorarios_exito"
  | "parcela_acordo"
  | "custas_processuais"
  | "despesa_escritorio"
  | "salario"
  | "aluguel"
  | "imposto"
  | "outro";
export type StatusLancamento = "pendente" | "pago" | "cancelado";
export type FormaPagamento = "pix" | "boleto" | "transferencia" | "dinheiro" | "cartao" | "outro";

export interface Profile {
  id: string;
  nome: string;
  email: string;
  papel: PapelUsuario;
  ativo: boolean;
  created_at: string;
}

export interface Cliente {
  id: string;
  tipo_pessoa: TipoPessoa;
  nome: string;
  cpf_cnpj: string | null;
  email: string | null;
  telefone: string | null;
  whatsapp: string | null;
  endereco: string | null;
  cidade: string | null;
  estado: string | null;
  cep: string | null;
  tipo_relacao: TipoRelacaoCliente;
  observacoes: string | null;
  ativo: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Processo {
  id: string;
  numero_processo: string;
  cliente_id: string;
  parte_contraria: string | null;
  area: AreaProcesso;
  fase: FaseProcesso;
  status: StatusProcesso;
  tribunal: string | null;
  comarca: string | null;
  vara: string | null;
  valor_causa: number | null;
  data_distribuicao: string | null;
  advogado_responsavel: string | null;
  observacoes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  clientes?: Pick<Cliente, "id" | "nome">;
}

export interface Andamento {
  id: string;
  processo_id: string;
  tipo: TipoAndamento;
  data: string;
  descricao: string;
  prazo_data: string | null;
  prazo_cumprido: boolean;
  created_by: string | null;
  created_at: string;
}

export interface LancamentoFinanceiro {
  id: string;
  tipo: TipoLancamento;
  categoria: CategoriaLancamento;
  descricao: string;
  valor: number;
  vencimento: string;
  data_pagamento: string | null;
  status: StatusLancamento;
  forma_pagamento: FormaPagamento | null;
  cliente_id: string | null;
  processo_id: string | null;
  grupo_parcela: string | null;
  parcela_numero: number | null;
  parcela_total: number | null;
  observacoes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  clientes?: Pick<Cliente, "id" | "nome"> | null;
  processos?: Pick<Processo, "id" | "numero_processo"> | null;
}

export const AREA_LABELS: Record<AreaProcesso, string> = {
  civel: "Cível",
  trabalhista: "Trabalhista",
  familia: "Família",
  cobranca: "Cobrança",
  tributario: "Tributário",
  criminal: "Criminal",
  consumidor: "Consumidor",
  previdenciario: "Previdenciário",
  empresarial: "Empresarial",
  outro: "Outro",
};

export const FASE_LABELS: Record<FaseProcesso, string> = {
  conhecimento: "Conhecimento",
  recursal: "Recursal",
  execucao: "Execução",
  cumprimento_sentenca: "Cumprimento de Sentença",
  inqueito: "Inquérito",
  administrativo: "Administrativo",
};

export const STATUS_PROCESSO_LABELS: Record<StatusProcesso, string> = {
  ativo: "Ativo",
  suspenso: "Suspenso",
  arquivado: "Arquivado",
  encerrado: "Encerrado",
  extinto: "Extinto",
};

export const CATEGORIA_LABELS: Record<CategoriaLancamento, string> = {
  honorarios_contratuais: "Honorários Contratuais",
  honorarios_exito: "Honorários de Êxito",
  parcela_acordo: "Parcela de Acordo",
  custas_processuais: "Custas Processuais",
  despesa_escritorio: "Despesa de Escritório",
  salario: "Salário",
  aluguel: "Aluguel",
  imposto: "Imposto",
  outro: "Outro",
};

export const FORMA_PAGAMENTO_LABELS: Record<FormaPagamento, string> = {
  pix: "Pix",
  boleto: "Boleto",
  transferencia: "Transferência",
  dinheiro: "Dinheiro",
  cartao: "Cartão",
  outro: "Outro",
};

export const TIPO_RELACAO_LABELS: Record<TipoRelacaoCliente, string> = {
  cliente: "Cliente",
  devedor: "Devedor",
  ambos: "Cliente e Devedor",
};
