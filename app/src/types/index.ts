export type UserRole = 'admin' | 'associate' | 'client';

export interface LawyerPermissions {
  viewClients: boolean;
  editClients: boolean;
  viewCases: boolean;
  editCases: boolean;
  viewFinance: boolean;
  editFinance: boolean;
  viewDocuments: boolean;
  uploadDocuments: boolean;
  viewCalendar: boolean;
  editCalendar: boolean;
  viewMessages: boolean;
  sendMessages: boolean;
  assignedCasesOnly: boolean;
}

export const DEFAULT_ASSOCIATE_PERMISSIONS: LawyerPermissions = {
  viewClients: true,
  editClients: false,
  viewCases: true,
  editCases: false,
  viewFinance: false,
  editFinance: false,
  viewDocuments: true,
  uploadDocuments: true,
  viewCalendar: true,
  editCalendar: false,
  viewMessages: true,
  sendMessages: true,
  assignedCasesOnly: true,
};

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
  cpf?: string;
  oab?: string;
  avatar?: string;
  permissions?: LawyerPermissions;
}

export type CaseStatus = 'ativo' | 'arquivado' | 'aguardando' | 'encerrado';
export type CaseArea = 'civil' | 'trabalhista' | 'criminal' | 'tributário' | 'família' | 'empresarial';

export interface Case {
  id: string;
  number: string;
  title: string;
  description: string;
  area: CaseArea;
  status: CaseStatus;
  clientId: string;
  clientName: string;
  lawyerId: string;
  court?: string;
  judge?: string;
  openedAt: string;
  updatedAt: string;
  nextHearing?: string;
  updates: CaseUpdate[];
}

export interface CaseUpdate {
  id: string;
  date: string;
  description: string;
  author: string;
}

export type EventType = 'audiência' | 'prazo' | 'reunião' | 'outros';

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time?: string;
  type: EventType;
  caseId?: string;
  caseNumber?: string;
  clientName?: string;
  location?: string;
  description?: string;
}

export type TransactionType = 'receita' | 'despesa';
export type TransactionStatus = 'pago' | 'pendente' | 'atrasado';

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  date: string;
  dueDate?: string;
  clientId?: string;
  clientName?: string;
  caseId?: string;
}

export type DocumentCategory = 'petição' | 'contrato' | 'procuração' | 'decisão' | 'outros';

export interface Document {
  id: string;
  name: string;
  category: DocumentCategory;
  caseId?: string;
  caseNumber?: string;
  clientId?: string;
  clientName?: string;
  uploadedAt: string;
  size: string;
  uri?: string;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  content: string;
  sentAt: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  clientId: string;
  clientName: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  messages: Message[];
}
