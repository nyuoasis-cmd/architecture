import { create } from 'zustand';

export type MobileTab = 'guide' | 'chat' | 'preview' | 'quiz';
export type PreviewTab = 'demo' | 'quiz';

type LearnStoreState = {
  currentQaId: string;
  scenarioId: string;
  mobileTab: MobileTab;
  previewTab: PreviewTab;
  setCurrentQaId: (qaId: string) => void;
  setScenarioId: (scenarioId: string) => void;
  setMobileTab: (mobileTab: MobileTab) => void;
  setPreviewTab: (previewTab: PreviewTab) => void;
  resetForQa: (qaId: string, scenarioId: string) => void;
};

export const useLearnStore = create<LearnStoreState>((set) => ({
  currentQaId: 'ch06_q03',
  scenarioId: 'launch',
  mobileTab: 'guide',
  previewTab: 'demo',
  setCurrentQaId: (currentQaId) => set({ currentQaId }),
  setScenarioId: (scenarioId) => set({ scenarioId }),
  setMobileTab: (mobileTab) => set({ mobileTab }),
  setPreviewTab: (previewTab) => set({ previewTab }),
  resetForQa: (currentQaId, scenarioId) =>
    set({
      currentQaId,
      scenarioId,
      mobileTab: 'guide',
      previewTab: 'demo',
    }),
}));
