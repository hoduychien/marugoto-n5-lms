'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';

export interface CustomVocabWord {
  id: string;
  kanji?: string;
  hiragana: string;
  romaji: string;
  meaning_vn: string;
  example_jp?: string;
  example_vn?: string;
  notes?: string;
  createdAt: string;
  isMastered?: boolean;
}

export interface CustomVocabDeck {
  id: string;
  title: string;
  description: string;
  color: 'indigo' | 'emerald' | 'amber' | 'rose' | 'sky' | 'purple';
  createdAt: string;
  updatedAt: string;
  words: CustomVocabWord[];
}

export type CloudSyncStatus = 'idle' | 'syncing' | 'synced' | 'local_only' | 'error';

interface CustomVocabState {
  decks: CustomVocabDeck[];
  activeDeckId: string | null;
  hydrated: boolean;
  syncStatus: CloudSyncStatus;
  lastSyncedAt: string | null;

  // Actions
  hydrate: () => void;
  syncWithCloud: () => Promise<void>;
  setActiveDeckId: (id: string | null) => void;
  createDeck: (params: {
    title: string;
    description?: string;
    color?: CustomVocabDeck['color'];
  }) => string;
  updateDeck: (
    deckId: string,
    params: {
      title?: string;
      description?: string;
      color?: CustomVocabDeck['color'];
    }
  ) => void;
  deleteDeck: (deckId: string) => void;
  addWordToDeck: (
    deckId: string,
    word: Omit<CustomVocabWord, 'id' | 'createdAt'>
  ) => string;
  updateWordInDeck: (
    deckId: string,
    wordId: string,
    updates: Partial<Omit<CustomVocabWord, 'id' | 'createdAt'>>
  ) => void;
  deleteWordFromDeck: (deckId: string, wordId: string) => void;
  toggleWordMastered: (deckId: string, wordId: string) => void;
  importDecks: (imported: CustomVocabDeck[]) => number;
  resetToSample: () => void;
}

const SAMPLE_DECKS: CustomVocabDeck[] = [
  {
    id: 'sample-comm-1',
    title: 'Giao tiếp hàng ngày thông dụng',
    description: 'Các mẫu câu và từ vựng chào hỏi, cảm ơn, xin lỗi cần nhớ khi sống tại Nhật.',
    color: 'indigo',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    words: [
      {
        id: 'sample-w-1',
        kanji: '初めまして',
        hiragana: 'はじめまして',
        romaji: 'hajimemashite',
        meaning_vn: 'Rất vui được gặp bạn lần đầu tiên',
        example_jp: '初めまして、ナムです。ベトナムから来ました。',
        example_vn: 'Rất vui được gặp bạn, tôi là Nam. Tôi đến từ Việt Nam.',
        notes: 'Dùng khi chào hỏi người mới gặp lần đầu',
        createdAt: new Date().toISOString(),
        isMastered: true,
      },
      {
        id: 'sample-w-2',
        kanji: '宜しくお願いします',
        hiragana: 'よろしくおねがいします',
        romaji: 'yoroshiku onegaishimasu',
        meaning_vn: 'Rất mong nhận được sự giúp đỡ của bạn',
        example_jp: 'これからよろしくお願いします。',
        example_vn: 'Từ nay về sau rất mong được sự giúp đỡ của bạn.',
        notes: 'Câu nói lịch sự thiết yếu trong giao tiếp người Nhật',
        createdAt: new Date().toISOString(),
        isMastered: false,
      },
      {
        id: 'sample-w-3',
        kanji: 'すみません',
        hiragana: 'すみません',
        romaji: 'sumimasen',
        meaning_vn: 'Xin lỗi / Cho tôi hỏi (gọi nhân viên)',
        example_jp: 'すみません、メニューをください。',
        example_vn: 'Xin lỗi, cho tôi xin thực đơn với ạ.',
        notes: 'Đa năng: vừa xin lỗi nhẹ, vừa cảm ơn, vừa dùng để gọi phục vụ',
        createdAt: new Date().toISOString(),
        isMastered: true,
      },
      {
        id: 'sample-w-4',
        kanji: '大丈夫',
        hiragana: 'だいじょうぶ',
        romaji: 'daijoubu',
        meaning_vn: 'Không sao / Ổn / Được rồi',
        example_jp: '怪我はありませんか？— はい、大丈夫です。',
        example_vn: 'Bạn có bị thương không? — Vâng, tôi ổn ạ.',
        notes: 'Tính từ đuôi な, dùng phổ biến hàng ngày',
        createdAt: new Date().toISOString(),
        isMastered: false,
      },
      {
        id: 'sample-w-5',
        kanji: 'いただきます',
        hiragana: 'いただきます',
        romaji: 'itadakimasu',
        meaning_vn: 'Tôi xin phép dùng bữa (Mời dùng bữa)',
        example_jp: 'ご飯の前に「いただきます」と言います。',
        example_vn: 'Trước khi ăn cơm người ta nói câu "itadakimasu".',
        notes: 'Văn hóa cảm ơn người nấu và nguyên liệu món ăn trước khi ăn',
        createdAt: new Date().toISOString(),
        isMastered: true,
      },
    ],
  },
];

// Helper lưu / cập nhật một deck lên Supabase nếu user đã đăng nhập
async function syncDeckToSupabase(deck: CustomVocabDeck) {
  if (!isSupabaseConfigured) return;
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('user_custom_decks').upsert(
      {
        id: deck.id,
        user_id: user.id,
        title: deck.title,
        description: deck.description,
        color: deck.color,
        words: deck.words,
        created_at: deck.createdAt,
        updated_at: deck.updatedAt,
      },
      { onConflict: 'id' }
    );
  } catch {
    // Graceful offline fallback
  }
}

// Helper xóa một deck trên Supabase nếu user đã đăng nhập
async function deleteDeckFromSupabase(deckId: string) {
  if (!isSupabaseConfigured) return;
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('user_custom_decks')
      .delete()
      .eq('id', deckId)
      .eq('user_id', user.id);
  } catch {
    // Graceful offline fallback
  }
}

export const useCustomVocabStore = create<CustomVocabState>()(
  persist(
    (set, get) => ({
      decks: SAMPLE_DECKS,
      activeDeckId: 'sample-comm-1',
      hydrated: false,
      syncStatus: 'idle',
      lastSyncedAt: null,

      hydrate: () => {
        set({ hydrated: true });
        // Tự động đồng bộ với Supabase khi khởi chạy nếu có kết nối
        if (isSupabaseConfigured) {
          void get().syncWithCloud();
        }
      },

      syncWithCloud: async () => {
        if (!isSupabaseConfigured) {
          set({ syncStatus: 'local_only' });
          return;
        }

        set({ syncStatus: 'syncing' });
        try {
          const {
            data: { user },
          } = await supabase.auth.getUser();
          if (!user) {
            set({ syncStatus: 'local_only' });
            return;
          }

          const { data: remoteDecks, error } = await supabase
            .from('user_custom_decks')
            .select('*')
            .eq('user_id', user.id)
            .order('updated_at', { ascending: false });

          if (error) throw error;

          if (remoteDecks && remoteDecks.length > 0) {
            const formattedRemote: CustomVocabDeck[] = remoteDecks.map((r: any) => ({
              id: r.id,
              title: r.title,
              description: r.description || '',
              color: r.color || 'indigo',
              createdAt: r.created_at || new Date().toISOString(),
              updatedAt: r.updated_at || new Date().toISOString(),
              words: Array.isArray(r.words) ? r.words : [],
            }));

            set((state) => ({
              decks: formattedRemote,
              activeDeckId: formattedRemote.some((d) => d.id === state.activeDeckId)
                ? state.activeDeckId
                : formattedRemote[0]?.id || null,
              syncStatus: 'synced',
              lastSyncedAt: new Date().toISOString(),
            }));
          } else {
            // Nếu trên Cloud chưa có dữ liệu nào nhưng local có bộ từ -> đồng bộ lên Cloud ngay!
            const localDecks = get().decks;
            if (localDecks.length > 0) {
              const rows = localDecks.map((d) => ({
                id: d.id,
                user_id: user.id,
                title: d.title,
                description: d.description,
                color: d.color,
                words: d.words,
                created_at: d.createdAt,
                updated_at: d.updatedAt,
              }));
              await supabase.from('user_custom_decks').upsert(rows, { onConflict: 'id' });
            }
            set({ syncStatus: 'synced', lastSyncedAt: new Date().toISOString() });
          }
        } catch {
          set({ syncStatus: 'error' });
        }
      },

      setActiveDeckId: (id) => {
        set({ activeDeckId: id });
      },

      createDeck: ({ title, description = '', color = 'indigo' }) => {
        const newDeckId = `deck-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        const newDeck: CustomVocabDeck = {
          id: newDeckId,
          title: title.trim(),
          description: description.trim(),
          color,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          words: [],
        };

        set((state) => ({
          decks: [newDeck, ...state.decks],
          activeDeckId: newDeckId,
        }));

        // Đồng bộ lên Supabase nếu có đăng nhập
        void syncDeckToSupabase(newDeck);

        return newDeckId;
      },

      updateDeck: (deckId, params) => {
        let updatedDeckRef: CustomVocabDeck | null = null;
        set((state) => ({
          decks: state.decks.map((deck) => {
            if (deck.id === deckId) {
              const updated = {
                ...deck,
                ...params,
                updatedAt: new Date().toISOString(),
              };
              updatedDeckRef = updated;
              return updated;
            }
            return deck;
          }),
        }));

        if (updatedDeckRef) {
          void syncDeckToSupabase(updatedDeckRef);
        }
      },

      deleteDeck: (deckId) => {
        set((state) => {
          const remaining = state.decks.filter((d) => d.id !== deckId);
          return {
            decks: remaining,
            activeDeckId:
              state.activeDeckId === deckId
                ? remaining[0]?.id || null
                : state.activeDeckId,
          };
        });

        // Xóa trên Supabase nếu có đăng nhập
        void deleteDeckFromSupabase(deckId);
      },

      addWordToDeck: (deckId, word) => {
        const newWordId = `word-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        const newWord: CustomVocabWord = {
          id: newWordId,
          kanji: word.kanji?.trim() || undefined,
          hiragana: word.hiragana.trim(),
          romaji: word.romaji.trim(),
          meaning_vn: word.meaning_vn.trim(),
          example_jp: word.example_jp?.trim() || undefined,
          example_vn: word.example_vn?.trim() || undefined,
          notes: word.notes?.trim() || undefined,
          createdAt: new Date().toISOString(),
          isMastered: false,
        };

        let targetDeckRef: CustomVocabDeck | null = null;

        set((state) => ({
          decks: state.decks.map((deck) => {
            if (deck.id === deckId) {
              const updated = {
                ...deck,
                words: [newWord, ...deck.words],
                updatedAt: new Date().toISOString(),
              };
              targetDeckRef = updated;
              return updated;
            }
            return deck;
          }),
        }));

        if (targetDeckRef) {
          void syncDeckToSupabase(targetDeckRef);
        }

        return newWordId;
      },

      updateWordInDeck: (deckId, wordId, updates) => {
        let targetDeckRef: CustomVocabDeck | null = null;

        set((state) => ({
          decks: state.decks.map((deck) => {
            if (deck.id === deckId) {
              const updated = {
                ...deck,
                words: deck.words.map((w) =>
                  w.id === wordId ? { ...w, ...updates } : w
                ),
                updatedAt: new Date().toISOString(),
              };
              targetDeckRef = updated;
              return updated;
            }
            return deck;
          }),
        }));

        if (targetDeckRef) {
          void syncDeckToSupabase(targetDeckRef);
        }
      },

      deleteWordFromDeck: (deckId, wordId) => {
        let targetDeckRef: CustomVocabDeck | null = null;

        set((state) => ({
          decks: state.decks.map((deck) => {
            if (deck.id === deckId) {
              const updated = {
                ...deck,
                words: deck.words.filter((w) => w.id !== wordId),
                updatedAt: new Date().toISOString(),
              };
              targetDeckRef = updated;
              return updated;
            }
            return deck;
          }),
        }));

        if (targetDeckRef) {
          void syncDeckToSupabase(targetDeckRef);
        }
      },

      toggleWordMastered: (deckId, wordId) => {
        let targetDeckRef: CustomVocabDeck | null = null;

        set((state) => ({
          decks: state.decks.map((deck) => {
            if (deck.id === deckId) {
              const updated = {
                ...deck,
                words: deck.words.map((w) =>
                  w.id === wordId ? { ...w, isMastered: !w.isMastered } : w
                ),
                updatedAt: new Date().toISOString(),
              };
              targetDeckRef = updated;
              return updated;
            }
            return deck;
          }),
        }));

        if (targetDeckRef) {
          void syncDeckToSupabase(targetDeckRef);
        }
      },

      importDecks: (imported) => {
        if (!Array.isArray(imported) || imported.length === 0) return 0;
        let count = 0;
        let toAdd: CustomVocabDeck[] = [];

        set((state) => {
          const currentIds = new Set(state.decks.map((d) => d.id));
          toAdd = [];

          for (const item of imported) {
            if (!item.title) continue;
            const validDeck: CustomVocabDeck = {
              id: currentIds.has(item.id)
                ? `deck-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
                : item.id || `deck-${Date.now()}`,
              title: item.title,
              description: item.description || '',
              color: item.color || 'indigo',
              createdAt: item.createdAt || new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              words: Array.isArray(item.words) ? item.words : [],
            };
            toAdd.push(validDeck);
            count++;
          }

          return {
            decks: [...toAdd, ...state.decks],
            activeDeckId: toAdd[0]?.id || state.activeDeckId,
          };
        });

        // Đồng bộ các bộ mới import lên Supabase
        for (const d of toAdd) {
          void syncDeckToSupabase(d);
        }

        return count;
      },

      resetToSample: () => {
        set({
          decks: SAMPLE_DECKS,
          activeDeckId: SAMPLE_DECKS[0].id,
        });

        for (const d of SAMPLE_DECKS) {
          void syncDeckToSupabase(d);
        }
      },
    }),
    {
      name: 'marugoto_n5_custom_vocab',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrate();
      },
    }
  )
);
