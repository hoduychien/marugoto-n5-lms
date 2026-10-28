import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface SettingsState {
  showFurigana: boolean;
  showRomaji: boolean;
  toggleFurigana: () => void;
  toggleRomaji: () => void;
  setShowFurigana: (val: boolean) => void;
  setShowRomaji: (val: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      showFurigana: true,
      showRomaji: false,
      toggleFurigana: () =>
        set((state) => ({ showFurigana: !state.showFurigana })),
      toggleRomaji: () => set((state) => ({ showRomaji: !state.showRomaji })),
      setShowFurigana: (val: boolean) => set({ showFurigana: val }),
      setShowRomaji: (val: boolean) => set({ showRomaji: val }),
    }),
    {
      name: 'marugoto_n5_display_settings',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined'
          ? localStorage
          : {
              getItem: () => null,
              setItem: () => {},
              removeItem: () => {},
            }
      ),
    }
  )
);

