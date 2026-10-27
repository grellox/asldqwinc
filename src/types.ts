export type Role = 'publico' | 'madre' | 'abogado';

export type District =
  | 'Cercado'
  | 'Yanahuara'
  | 'Cayma'
  | 'Paucarpata'
  | 'J. L. Bustamante y Rivero'
  | 'Cerro Colorado'
  | 'Socabaya'
  | 'Miraflores'
  | 'Mariano Melgar'
  | 'Alto Selva Alegre'
  | 'Sachaca';

export type Modalidad = 'Presencial' | 'Virtual' | 'Ambas';

export type LanguageLevel = 'Nativo' | 'Fluido' | 'Básico';

export interface LawyerLanguage {
  language: string;
  level: LanguageLevel;
}

export interface LawyerExperience {
  org: string;
  role: string;
  period: string;
  durationLabel: string;
  skills: string[];
  highlights: string[];
}

export interface LawyerEducation {
  degree: string;
  institution: string;
  year: string;
}

export interface LawyerReview {
  id: string;
  authorName: string;
  rating: number;
  dateLabel: string;
  caseType: string;
  text: string;
  /** Public reply from the lawyer, when there is one. */
  reply?: string;
}

export interface Lawyer {
  id: string;
  name: string;
  initials: string;
  caaNumber: string;
  district: District;
  modalidad: Modalidad;
  specialties: string[];
  casesCount: number;
  responseHours: number;
  rating: number;
  languages: string[];
  pricePerHito: number;
  hitos: number;
  bio: string;
  /** Short professional title shown under the name in listings and profile. */
  headline: string;
  /** Longer presentation shown only on the dedicated profile page. */
  about: string;
  yearsExperience: number;
  successRate: number;
  avgResolutionMonths: number;
  courts: string[];
  languageLevels: LawyerLanguage[];
  experience: LawyerExperience[];
  education: LawyerEducation[];
  certifications: string[];
  /** Total ratings received; `reviews` only carries the featured ones. */
  reviewsCount: number;
  reviews: LawyerReview[];
  acceptingClients: boolean;
}

export type StageStatus = 'completado' | 'en-curso' | 'atencion' | 'proximo' | 'pendiente';

export interface RouteStage {
  id: string;
  order: number;
  title: string;
  status: StageStatus;
  description: string;
  dateLabel: string;
  facts: string[];
  estimates: string[];
}

export type DocCategory = 'Demanda' | 'Resolución' | 'Cédula' | 'Acta' | 'Partida' | 'Constancia';

export interface DocumentItem {
  id: string;
  name: string;
  category: DocCategory;
  date: string;
  summary: string;
  keyPoints: string[];
  status: 'validado' | 'pendiente';
  validatedBy?: string;
}

export interface PensionMonth {
  month: string;
  paid: number;
  due: number;
  owed: number;
}

export interface ExpenseReceipt {
  description: string;
  amount: number;
  date: string;
}

export interface ExpenseCategory {
  category: string;
  amount: number;
  receipts: ExpenseReceipt[];
}

export type CalendarStatus = 'pagado' | 'parcial' | 'atrasado' | 'sin-verificar' | 'proximo';

export interface CalendarMonth {
  month: string;
  status: CalendarStatus;
  amount: number;
}

export interface BankDeposit {
  date: string;
  amount: number;
  description: string;
  ignored?: boolean;
}

export type ChatStyle = 'breve' | 'paso-a-paso' | 'detallada';

export interface SuggestedQuestion {
  id: string;
  question: string;
  answers: Record<ChatStyle, string>;
  sources?: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  pendingReview?: boolean;
  sources?: string[];
}

export interface RecommendedAction {
  id: string;
  text: string;
  to: string;
}

export type RequestUrgency = 'alta' | 'media' | 'baja';

/**
 * Lifecycle of a lead in the lawyer's inbox:
 * nuevo → presupuestado → aceptado | rechazado (by the mother), or descartado by the lawyer.
 */
export type LeadStatus = 'nuevo' | 'presupuestado' | 'aceptado' | 'rechazado' | 'descartado';

export interface Lead {
  id: string;
  motherName: string;
  summary: string;
  district: District;
  status: LeadStatus;
  urgency?: RequestUrgency;
  dateLabel?: string;
  /** Came in through the marketplace instead of the lawyer's own channels. */
  fromMarketplace?: boolean;
}

/** What the lawyer offers in reply to a request. */
export interface Proposal {
  pricePerHito: number;
  hitos: number;
  message: string;
  validUntil: string;
  sentAt: string;
}

/** Mirror of LeadStatus from the mother's side. */
export type RequestStatus = 'enviada' | 'propuesta' | 'aceptada' | 'rechazada' | 'descartada';

/** An advisory request a mother sent to a lawyer from the marketplace. */
export interface AdviceRequest {
  id: string;
  lawyerId: string;
  lawyerName: string;
  motherName: string;
  summary: string;
  district: District;
  urgency: RequestUrgency;
  dateLabel: string;
  status: RequestStatus;
  proposal?: Proposal;
  /** Set when the request reached the signed-in lawyer's inbox as a lead. */
  leadId?: string;
}

export interface EngagementMilestone {
  label: string;
  amount: number;
  status: 'custodia' | 'pendiente';
}

/** The case that starts when the mother accepts a proposal. */
export interface Engagement {
  requestId: string;
  caseId: string;
  lawyerId: string;
  lawyerName: string;
  pricePerHito: number;
  hitos: number;
  startedAt: string;
  milestones: EngagementMilestone[];
}

export interface BoardQuestion {
  id: string;
  question: string;
  anonName: string;
  answer?: string;
  lawyerName?: string;
  date: string;
}

export interface ValidationDoc {
  id: string;
  title: string;
  clientName: string;
  aiText: string;
  flags: string[];
  status: 'pendiente' | 'aprobado' | 'rechazado' | 'corrigiendo';
}

export type MilestoneStatus = 'liberado' | 'verificando' | 'custodia';

export interface CaseMilestone {
  caseId: string;
  clientName: string;
  status: MilestoneStatus;
  amount: number;
}

export interface ActiveCase {
  id: string;
  clientName: string;
  stage: string;
  district: District;
  nextHearing?: string;
}

export interface EducationalVideo {
  id: string;
  title: string;
  lawyerName: string;
  duration: string;
  topic: string;
  views: number;
}

export interface EmpathyRating {
  label: string;
  value: number;
}

export type AlertSeverity = 'urgente' | 'atencion';

export interface AiAlert {
  id: string;
  clientName: string;
  text: string;
  severity: AlertSeverity;
}

export interface SubscriptionPlan {
  id: 'pro' | 'enterprise';
  name: string;
  price: number;
  features: string[];
}

export interface LawyerProfileDraft {
  bio: string;
  district: District;
  modalidad: Modalidad;
  specialties: string[];
  languages: string[];
  pricePerHito: number;
  responseHours: number;
  listed: boolean;
  acceptingClients: boolean;
}
