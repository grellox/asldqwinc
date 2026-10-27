import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { safeStorage } from './safeStorage';
import { documents as initialDocuments } from '../data/documents';
import { leads as initialLeads, validationQueue as initialValidationQueue } from '../data/lawyerDesk';
import { boardQuestions as initialBoardQuestions } from '../data/board';
import { hitoBreakdown, lawyers, MY_LAWYER_ID, myLawyer } from '../data/lawyers';
import type {
  AdviceRequest,
  BoardQuestion,
  Engagement,
  ChatMessage,
  District,
  DocumentItem,
  Lead,
  LawyerProfileDraft,
  Proposal,
  RequestUrgency,
  Role,
  ValidationDoc,
} from '../types';

/** How long other lawyers take to answer in the demo. */
const REPLY_DELAY_MS = 8000;

/** A request still in play; a rejected or discarded one can be sent again. */
export function isActiveRequest(request: AdviceRequest) {
  return request.status !== 'rechazada' && request.status !== 'descartada';
}

const initialLawyerProfile: LawyerProfileDraft = {
  bio: myLawyer.bio,
  district: myLawyer.district,
  modalidad: myLawyer.modalidad,
  specialties: myLawyer.specialties,
  languages: myLawyer.languages,
  pricePerHito: myLawyer.pricePerHito,
  responseHours: 2,
  listed: true,
  acceptingClients: true,
};

interface AppState {
  role: Role;
  setRole: (role: Role) => void;

  loggedIn: boolean;
  userName: string;
  login: (name: string, role: Role) => void;
  logout: () => void;

  cejSyncedLabel: string;
  markCejSynced: () => void;

  recommendedActionsOpen: boolean;
  toggleRecommendedActions: () => void;

  documents: DocumentItem[];
  addDocument: (doc: DocumentItem) => void;
  setDocumentStatus: (id: string, status: DocumentItem['status'], validatedBy?: string) => void;

  bankImported: boolean;
  importBankStatement: () => void;

  chatMessages: ChatMessage[];
  addChatMessage: (msg: ChatMessage) => void;

  lawyerChatMessages: ChatMessage[];
  addLawyerChatMessage: (msg: ChatMessage) => void;

  compareIds: string[];
  toggleCompare: (id: string) => void;
  clearCompare: () => void;

  requests: AdviceRequest[];
  sendRequest: (input: {
    lawyerId: string;
    lawyerName: string;
    summary: string;
    district: District;
    urgency: RequestUrgency;
  }) => void;
  cancelRequest: (id: string) => void;
  /** Demo stand-in for the inbox of lawyers other than the signed-in one. */
  simulateProposal: (requestId: string) => void;
  /** Lawyer the visitor wanted to contact before signing in. */
  pendingRequestLawyerId: string | null;
  setPendingRequestLawyer: (id: string | null) => void;

  /** Mother's answer to a proposal. */
  acceptProposal: (requestId: string) => void;
  declineProposal: (requestId: string) => void;

  engagement: Engagement | null;

  leads: Lead[];
  sendProposal: (leadId: string, proposal: Omit<Proposal, 'sentAt'>) => void;
  discardLead: (leadId: string) => void;

  validationQueue: ValidationDoc[];
  setValidationStatus: (id: string, status: ValidationDoc['status'], editedText?: string) => void;

  lawyerProfile: LawyerProfileDraft;
  saveLawyerProfile: (profile: LawyerProfileDraft) => void;

  boardQuestions: BoardQuestion[];
  addBoardQuestion: (question: string) => void;
  answerBoardQuestion: (id: string, answer: string, lawyerName: string) => void;

  resetDemo: () => void;
}

const initialPersistedState = {
  role: 'publico' as Role,
  loggedIn: false,
  userName: '',
  cejSyncedLabel: 'hace 2 horas',
  recommendedActionsOpen: false,
  documents: initialDocuments,
  bankImported: false,
  chatMessages: [] as ChatMessage[],
  lawyerChatMessages: [] as ChatMessage[],
  compareIds: [] as string[],
  requests: [] as AdviceRequest[],
  pendingRequestLawyerId: null as string | null,
  engagement: null as Engagement | null,
  leads: initialLeads,
  validationQueue: initialValidationQueue,
  boardQuestions: initialBoardQuestions,
  lawyerProfile: initialLawyerProfile,
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...initialPersistedState,

      setRole: (role) => set({ role }),

      login: (name, role) => set({ loggedIn: true, userName: name, role }),
      logout: () => set({ loggedIn: false, userName: '', role: 'publico' }),

      markCejSynced: () => set({ cejSyncedLabel: 'hace un momento' }),

      toggleRecommendedActions: () => set((s) => ({ recommendedActionsOpen: !s.recommendedActionsOpen })),

      addDocument: (doc) => set((s) => ({ documents: [doc, ...s.documents] })),
      setDocumentStatus: (id, status, validatedBy) =>
        set((s) => ({
          documents: s.documents.map((d) => (d.id === id ? { ...d, status, validatedBy } : d)),
        })),

      importBankStatement: () => set({ bankImported: true }),

      addChatMessage: (msg) => set((s) => ({ chatMessages: [...s.chatMessages, msg] })),

      addLawyerChatMessage: (msg) => set((s) => ({ lawyerChatMessages: [...s.lawyerChatMessages, msg] })),

      toggleCompare: (id) =>
        set((s) => {
          if (s.compareIds.includes(id)) {
            return { compareIds: s.compareIds.filter((c) => c !== id) };
          }
          if (s.compareIds.length >= 3) return s;
          return { compareIds: [...s.compareIds, id] };
        }),
      clearCompare: () => set({ compareIds: [] }),

      sendRequest: ({ lawyerId, lawyerName, summary, district, urgency }) =>
        set((s) => {
          if (s.requests.some((r) => r.lawyerId === lawyerId && isActiveRequest(r))) return s;

          const stamp = Date.now();
          const dateLabel = new Date().toLocaleDateString('es-PE');
          const motherName = s.userName || 'María Torres';

          // Requests addressed to the signed-in lawyer land in their acquisition
          // inbox, so the demo can be followed end to end across both roles.
          const isMine = lawyerId === MY_LAWYER_ID;
          const leadId = isMine ? `lead-${stamp}` : undefined;

          const request: AdviceRequest = {
            id: `req-${stamp}`,
            lawyerId,
            lawyerName,
            motherName,
            summary,
            district,
            urgency,
            dateLabel,
            status: 'enviada',
            leadId,
          };

          // Drop a previous closed request to the same lawyer, so the list stays readable.
          const others = s.requests.filter((r) => r.lawyerId !== lawyerId);

          if (!isMine) {
            // Only the signed-in lawyer has an inbox in this demo, so the rest answer on their own.
            window.setTimeout(() => get().simulateProposal(request.id), REPLY_DELAY_MS);
            return { requests: [request, ...others] };
          }

          const lead: Lead = {
            id: leadId!,
            motherName,
            summary,
            district,
            status: 'nuevo',
            urgency,
            dateLabel,
            fromMarketplace: true,
          };

          return { requests: [request, ...others], leads: [lead, ...s.leads] };
        }),

      cancelRequest: (id) =>
        set((s) => {
          const request = s.requests.find((r) => r.id === id);
          return {
            requests: s.requests.filter((r) => r.id !== id),
            leads: request?.leadId ? s.leads.filter((l) => l.id !== request.leadId) : s.leads,
          };
        }),

      setPendingRequestLawyer: (id) => set({ pendingRequestLawyerId: id }),

      simulateProposal: (requestId) =>
        set((s) => {
          const request = s.requests.find((r) => r.id === requestId);
          if (!request || request.status !== 'enviada') return s;

          const lawyer = lawyers.find((l) => l.id === request.lawyerId);
          if (!lawyer) return s;

          const firstName = request.motherName.split(' ')[0];
          const proposal: Proposal = {
            pricePerHito: lawyer.pricePerHito,
            hitos: lawyer.hitos,
            message: `Hola ${firstName}, leí tu caso y puedo acompañarte. Trabajo por hitos: pagas cada etapa solo cuando se cumple. Si tienes dudas antes de aceptar, escríbeme.`,
            validUntil: new Date(Date.now() + 5 * 86400000).toLocaleDateString('es-PE'),
            sentAt: new Date().toLocaleDateString('es-PE'),
          };

          return {
            requests: s.requests.map((r) => (r.id === requestId ? { ...r, status: 'propuesta', proposal } : r)),
          };
        }),

      sendProposal: (leadId, proposal) =>
        set((s) => {
          const sentAt = new Date().toLocaleDateString('es-PE');
          return {
            leads: s.leads.map((l) => (l.id === leadId ? { ...l, status: 'presupuestado' } : l)),
            requests: s.requests.map((r) =>
              r.leadId === leadId ? { ...r, status: 'propuesta', proposal: { ...proposal, sentAt } } : r
            ),
          };
        }),

      discardLead: (leadId) =>
        set((s) => ({
          leads: s.leads.map((l) => (l.id === leadId ? { ...l, status: 'descartado' } : l)),
          requests: s.requests.map((r) => (r.leadId === leadId ? { ...r, status: 'descartada' } : r)),
        })),

      acceptProposal: (requestId) =>
        set((s) => {
          const request = s.requests.find((r) => r.id === requestId);
          if (!request?.proposal) return s;

          const { pricePerHito, hitos } = request.proposal;
          // Only the first payment is funded now; the rest stay pending until each stage is reached.
          const milestones = Array.from({ length: hitos }, (_, i) => ({
            label: hitoBreakdown[i]?.label ?? `Hito ${i + 1}`,
            amount: pricePerHito,
            status: i === 0 ? ('custodia' as const) : ('pendiente' as const),
          }));

          return {
            requests: s.requests.map((r) => (r.id === requestId ? { ...r, status: 'aceptada' } : r)),
            leads: s.leads.map((l) => (l.id === request.leadId ? { ...l, status: 'aceptado' } : l)),
            engagement: {
              requestId,
              caseId: `exp-${String(Date.now()).slice(-5)}`,
              lawyerId: request.lawyerId,
              lawyerName: request.lawyerName,
              pricePerHito,
              hitos,
              startedAt: new Date().toLocaleDateString('es-PE'),
              milestones,
            },
          };
        }),

      declineProposal: (requestId) =>
        set((s) => {
          const request = s.requests.find((r) => r.id === requestId);
          return {
            requests: s.requests.map((r) => (r.id === requestId ? { ...r, status: 'rechazada' } : r)),
            leads: request?.leadId
              ? s.leads.map((l) => (l.id === request.leadId ? { ...l, status: 'rechazado' } : l))
              : s.leads,
          };
        }),

      setValidationStatus: (id, status, editedText) =>
        set((s) => ({
          validationQueue: s.validationQueue.map((v) =>
            v.id === id ? { ...v, status, aiText: editedText ?? v.aiText } : v
          ),
        })),

      saveLawyerProfile: (profile) => set({ lawyerProfile: profile }),

      addBoardQuestion: (question) =>
        set((s) => ({
          boardQuestions: [
            {
              id: `q-${Date.now()}`,
              question,
              anonName: 'Madre anónima',
              date: new Date().toLocaleDateString('es-PE'),
            },
            ...s.boardQuestions,
          ],
        })),
      answerBoardQuestion: (id, answer, lawyerName) =>
        set((s) => ({
          boardQuestions: s.boardQuestions.map((q) => (q.id === id ? { ...q, answer, lawyerName } : q)),
        })),

      resetDemo: () => set(initialPersistedState),
    }),
    {
      name: 'syloop-demo-state',
      version: 1,
      storage: createJSONStorage(() => safeStorage),
      migrate: (persisted, version) => {
        const state = persisted as Partial<AppState> | undefined;
        if (!state || version >= 1) return state as AppState;
        // v0 requests predate the proposal flow and carry no status.
        return {
          ...state,
          requests: (state.requests ?? []).map((r) => ({ ...r, status: r.status ?? 'enviada' })),
        } as AppState;
      },
    }
  )
);
