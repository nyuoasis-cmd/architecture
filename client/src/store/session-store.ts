import { create } from 'zustand';
import type {
  SessionDetail,
  SessionParticipant,
  SessionProgressEntry,
  SessionRecord,
} from '../lib/session-client';

type SessionStoreState = {
  teacherSessions: SessionRecord[];
  currentSession: SessionDetail | null;
  participants: SessionParticipant[];
  viewerProgress: Record<string, SessionProgressEntry>;
  setTeacherSessions: (sessions: SessionRecord[]) => void;
  prependTeacherSession: (session: SessionRecord) => void;
  setCurrentSession: (session: SessionDetail | null) => void;
  setParticipants: (participants: SessionParticipant[]) => void;
  updateViewerProgress: (qaId: string, patch: SessionProgressEntry) => void;
};

export const useSessionStore = create<SessionStoreState>((set) => ({
  teacherSessions: [],
  currentSession: null,
  participants: [],
  viewerProgress: {},
  setTeacherSessions: (teacherSessions) => set({ teacherSessions }),
  prependTeacherSession: (session) =>
    set((state) => ({
      teacherSessions: [session, ...state.teacherSessions.filter((item) => item.id !== session.id)],
    })),
  setCurrentSession: (currentSession) =>
    set({
      currentSession,
      participants: currentSession?.participants ?? [],
      viewerProgress: currentSession?.viewer?.progress ?? {},
    }),
  setParticipants: (participants) => set({ participants }),
  updateViewerProgress: (qaId, patch) =>
    set((state) => ({
      viewerProgress: {
        ...state.viewerProgress,
        [qaId]: {
          ...state.viewerProgress[qaId],
          ...patch,
        },
      },
    })),
}));
