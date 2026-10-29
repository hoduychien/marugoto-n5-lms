'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';

export interface LessonNoteItem {
  id: string;
  lessonId: number;
  userId: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export type NoteSyncStatus = 'idle' | 'saving' | 'saved' | 'error' | 'local_only';

interface LessonNotesState {
  notes: Record<number, LessonNoteItem>; // key: lessonId
  syncStatus: NoteSyncStatus;
  lastSavedAt: string | null;
  activeLessonId: number;

  // Actions
  getNote: (lessonId: number, userId?: string) => LessonNoteItem;
  updateTitle: (lessonId: number, title: string, userId?: string) => void;
  updateContent: (lessonId: number, content: string, userId?: string) => void;
  toggleTag: (lessonId: number, tag: string, userId?: string) => void;
  addTag: (lessonId: number, tag: string, userId?: string) => void;
  removeTag: (lessonId: number, tag: string, userId?: string) => void;
  saveNote: (lessonId: number, userId?: string) => Promise<boolean>;
  deleteNote: (lessonId: number, userId?: string) => Promise<boolean>;
  loadRemoteNote: (lessonId: number, userId?: string) => Promise<void>;
  resetNote: (lessonId: number) => void;
}

const DEFAULT_NOTE_TEMPLATE = (lessonIndex: number) => `## 📝 Ghi chú buổi học trên lớp - Bài ${lessonIndex}

### 📌 Lời dặn của Sensei:
- 

### 💡 Điểm ngữ pháp & Từ vựng cần lưu ý:
- 

### ⚠️ Lỗi sai hay gặp khi luyện tập:
- 

### ❓ Câu hỏi cần hỏi lại giáo viên:
- 
`;

export const useLessonNotesStore = create<LessonNotesState>()(
  persist(
    (set, get) => ({
      notes: {},
      syncStatus: 'idle',
      lastSavedAt: null,
      activeLessonId: 1,

      getNote: (lessonId, userId = 'guest') => {
        const existing = get().notes[lessonId];
        if (existing) return existing;

        return {
          id: `note-${lessonId}-${Date.now()}`,
          lessonId,
          userId,
          title: `Ghi chú bài học ${lessonId}`,
          content: DEFAULT_NOTE_TEMPLATE(lessonId),
          tags: ['Lời dặn Sensei', 'Ngữ pháp'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      },

      updateTitle: (lessonId, title, userId = 'guest') => {
        const current = get().getNote(lessonId, userId);
        const updated: LessonNoteItem = {
          ...current,
          title,
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({
          notes: {
            ...state.notes,
            [lessonId]: updated,
          },
          syncStatus: 'saving',
        }));
      },

      updateContent: (lessonId, content, userId = 'guest') => {
        const current = get().getNote(lessonId, userId);
        const updated: LessonNoteItem = {
          ...current,
          content,
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({
          notes: {
            ...state.notes,
            [lessonId]: updated,
          },
          syncStatus: 'saving',
        }));
      },

      toggleTag: (lessonId, tag, userId = 'guest') => {
        const current = get().getNote(lessonId, userId);
        const exists = current.tags.includes(tag);
        const newTags = exists
          ? current.tags.filter((t) => t !== tag)
          : [...current.tags, tag];

        const updated: LessonNoteItem = {
          ...current,
          tags: newTags,
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({
          notes: {
            ...state.notes,
            [lessonId]: updated,
          },
          syncStatus: 'saving',
        }));
      },

      addTag: (lessonId, tag, userId = 'guest') => {
        const cleanTag = tag.trim();
        if (!cleanTag) return;
        const current = get().getNote(lessonId, userId);
        if (current.tags.includes(cleanTag)) return;

        const updated: LessonNoteItem = {
          ...current,
          tags: [...current.tags, cleanTag],
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({
          notes: {
            ...state.notes,
            [lessonId]: updated,
          },
          syncStatus: 'saving',
        }));
      },

      removeTag: (lessonId, tag, userId = 'guest') => {
        const current = get().getNote(lessonId, userId);
        const updated: LessonNoteItem = {
          ...current,
          tags: current.tags.filter((t) => t !== tag),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({
          notes: {
            ...state.notes,
            [lessonId]: updated,
          },
          syncStatus: 'saving',
        }));
      },

      saveNote: async (lessonId, userId = 'guest') => {
        const note = get().getNote(lessonId, userId);
        const now = new Date().toISOString();
        const updatedNote: LessonNoteItem = {
          ...note,
          updatedAt: now,
        };

        set((state) => ({
          notes: {
            ...state.notes,
            [lessonId]: updatedNote,
          },
          syncStatus: 'saving',
        }));

        if (!isSupabaseConfigured) {
          set({
            syncStatus: 'local_only',
            lastSavedAt: now,
          });
          return true;
        }

        try {
          const {
            data: { user },
          } = await supabase.auth.getUser();

          if (user) {
            const { error } = await supabase.from('lesson_notes').upsert(
              {
                id: note.id,
                user_id: user.id,
                lesson_id: lessonId,
                title: note.title,
                content: note.content,
                tags: note.tags,
                updated_at: now,
              },
              { onConflict: 'user_id,lesson_id' }
            );

            if (error) {
              console.warn('Supabase note save fallback to local:', error.message);
              set({ syncStatus: 'local_only', lastSavedAt: now });
              return true;
            }

            set({ syncStatus: 'saved', lastSavedAt: now });
            return true;
          } else {
            set({ syncStatus: 'local_only', lastSavedAt: now });
            return true;
          }
        } catch (err) {
          console.warn('Supabase error saving note:', err);
          set({ syncStatus: 'local_only', lastSavedAt: now });
          return true;
        }
      },

      loadRemoteNote: async (lessonId, _userId) => {
        if (!isSupabaseConfigured) return;

        try {
          const {
            data: { user },
          } = await supabase.auth.getUser();

          if (!user) return;

          const { data, error } = await supabase
            .from('lesson_notes')
            .select('*')
            .eq('user_id', user.id)
            .eq('lesson_id', lessonId)
            .maybeSingle();

          if (!error && data) {
            const remoteNote: LessonNoteItem = {
              id: data.id || `note-${lessonId}-${user.id}`,
              lessonId,
              userId: user.id,
              title: data.title || `Ghi chú bài học ${lessonId}`,
              content: data.content || '',
              tags: Array.isArray(data.tags) ? data.tags : [],
              createdAt: data.created_at || new Date().toISOString(),
              updatedAt: data.updated_at || new Date().toISOString(),
            };

            set((state) => ({
              notes: {
                ...state.notes,
                [lessonId]: remoteNote,
              },
              syncStatus: 'saved',
              lastSavedAt: remoteNote.updatedAt,
            }));
          }
        } catch {
          // Ignore
        }
      },

      deleteNote: async (lessonId, _userId) => {
        const now = new Date().toISOString();
        const emptyNote: LessonNoteItem = {
          id: `note-${lessonId}-${Date.now()}`,
          lessonId,
          userId: 'guest',
          title: `Ghi chú bài học ${lessonId}`,
          content: '',
          tags: [],
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          notes: {
            ...state.notes,
            [lessonId]: emptyNote,
          },
          syncStatus: 'saved',
          lastSavedAt: now,
        }));

        if (isSupabaseConfigured) {
          try {
            const {
              data: { user },
            } = await supabase.auth.getUser();
            if (user) {
              await supabase
                .from('lesson_notes')
                .delete()
                .eq('user_id', user.id)
                .eq('lesson_id', lessonId);
            }
          } catch {
            // ignore
          }
        }

        return true;
      },

      resetNote: (lessonId) => {
        const template = DEFAULT_NOTE_TEMPLATE(lessonId);
        get().updateContent(lessonId, template);
      },
    }),
    {
      name: 'marugoto_n5_lesson_notes_v1',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined'
          ? localStorage
          : {
              getItem: () => null,
              setItem: () => {},
              removeItem: () => {},
            }
      ),
      partialize: (state) => ({ notes: state.notes }),
    }
  )
);
