'use client';

import { create } from 'zustand';
import {
  calculateNextReview,
  isDueForReview,
  type SRSFeedback,
  type SRSResult,
} from '@/lib/srs-algorithm';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';

export interface ItemProgressRecord {
  itemId: number;
  moduleType: 'vocab' | 'kanji' | 'grammar' | 'kaiwa';
  srsLevel: number;
  nextReviewDate: string;
  updatedAt: string;
}

interface ProgressState {
  records: Record<string, ItemProgressRecord>; // key: `${moduleType}:${itemId}`
  totalExp: number;
  currentStreak: number;
  lastStudyDate: string | null;
  hydrated: boolean;
  hydrate: () => void;
  rateItem: (
    moduleType: 'vocab' | 'kanji' | 'grammar' | 'kaiwa',
    itemId: number,
    feedback: SRSFeedback
  ) => SRSResult;
  getItemLevel: (
    moduleType: 'vocab' | 'kanji' | 'grammar' | 'kaiwa',
    itemId: number
  ) => number;
  isItemDue: (
    moduleType: 'vocab' | 'kanji' | 'grammar' | 'kaiwa',
    itemId: number
  ) => boolean;
  addExp: (amount: number) => void;
}

const STORAGE_KEY = 'marugoto_n5_srs_progress_v1';

const EXP_BY_FEEDBACK: Record<SRSFeedback, number> = {
  hard: 5,
  good: 10,
  easy: 15,
};

function getTodayDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

export const useProgressStore = create<ProgressState>((set, get) => ({
  records: {},
  totalExp: 0,
  currentStreak: 0,
  lastStudyDate: null,
  hydrated: false,

  hydrate: () => {
    if (typeof window === 'undefined' || get().hydrated) return;

    let localRecords: Record<string, ItemProgressRecord> = {};
    let localExp = 0;
    let localStreak = 0;
    let localLastDate: string | null = null;

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        localRecords = parsed.records || {};
        localExp = Number(parsed.totalExp) || 0;
        localStreak = Number(parsed.currentStreak) || 0;
        localLastDate = parsed.lastStudyDate || null;
      }
    } catch {
      // Ignore corrupt storage
    }

    set({
      records: localRecords,
      totalExp: localExp,
      currentStreak: localStreak,
      lastStudyDate: localLastDate,
      hydrated: true,
    });

    // Đồng bộ 2 chiều từ bảng user_progress & profiles trên Supabase nếu đã đăng nhập
    if (isSupabaseConfigured) {
      void (async () => {
        try {
          const {
            data: { user },
          } = await supabase.auth.getUser();
          if (!user) return;

          const [progressRes, profileRes] = await Promise.all([
            supabase
              .from('user_progress')
              .select('module_type, item_id, srs_level, next_review_date, updated_at')
              .eq('user_id', user.id),
            supabase
              .from('profiles')
              .select('total_exp, current_streak, last_study_date')
              .eq('id', user.id)
              .maybeSingle(),
          ]);

          const mergedRecords: Record<string, ItemProgressRecord> = {
            ...get().records,
          };

          if (!progressRes.error && progressRes.data) {
            for (const row of progressRes.data) {
              const mod = row.module_type as ItemProgressRecord['moduleType'];
              const key = `${mod}:${row.item_id}`;
              mergedRecords[key] = {
                itemId: Number(row.item_id),
                moduleType: mod,
                srsLevel: Number(row.srs_level) || 0,
                nextReviewDate: row.next_review_date || new Date().toISOString(),
                updatedAt: row.updated_at || new Date().toISOString(),
              };
            }
          }

          const remoteExp = Number(profileRes.data?.total_exp) || 0;
          const remoteStreak = Number(profileRes.data?.current_streak) || 0;
          const remoteLastDate = profileRes.data?.last_study_date || null;

          const finalExp = Math.max(get().totalExp, remoteExp);
          const finalStreak = Math.max(get().currentStreak, remoteStreak);
          const finalLastDate = remoteLastDate || get().lastStudyDate;

          set({
            records: mergedRecords,
            totalExp: finalExp,
            currentStreak: finalStreak,
            lastStudyDate: finalLastDate,
          });

          window.localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({
              records: mergedRecords,
              totalExp: finalExp,
              currentStreak: finalStreak,
              lastStudyDate: finalLastDate,
            })
          );
        } catch {
          // Giữ dữ liệu local nếu ngoại tuyến
        }
      })();
    }
  },

  rateItem: (moduleType, itemId, feedback) => {
    const state = get();
    const key = `${moduleType}:${itemId}`;
    const existing = state.records[key];
    const currentLevel = existing ? existing.srsLevel : 0;

    const result = calculateNextReview(currentLevel, feedback);
    const nowIso = new Date().toISOString();
    const today = getTodayDateString();

    let nextStreak = state.currentStreak;
    if (state.lastStudyDate !== today) {
      if (state.lastStudyDate) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().slice(0, 10);
        nextStreak =
          state.lastStudyDate === yesterdayStr ? state.currentStreak + 1 : 1;
      } else {
        nextStreak = 1;
      }
    }

    const updatedRecords: Record<string, ItemProgressRecord> = {
      ...state.records,
      [key]: {
        itemId,
        moduleType,
        srsLevel: result.nextLevel,
        nextReviewDate: result.nextReviewDate.toISOString(),
        updatedAt: nowIso,
      },
    };

    const nextExp = state.totalExp + EXP_BY_FEEDBACK[feedback];

    set({
      records: updatedRecords,
      totalExp: nextExp,
      currentStreak: nextStreak,
      lastStudyDate: today,
    });

    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            records: updatedRecords,
            totalExp: nextExp,
            currentStreak: nextStreak,
            lastStudyDate: today,
          })
        );
      } catch {
        // Ignore storage quota errors
      }
    }

    // Lưu trực tiếp tiến độ lên bảng user_progress và profiles trên Supabase
    if (isSupabaseConfigured) {
      void (async () => {
        try {
          const {
            data: { user },
          } = await supabase.auth.getUser();
          if (!user) return;

          await Promise.all([
            supabase.from('user_progress').upsert(
              {
                user_id: user.id,
                module_type: moduleType,
                item_id: itemId,
                srs_level: result.nextLevel,
                next_review_date: result.nextReviewDate.toISOString(),
                updated_at: nowIso,
              },
              { onConflict: 'user_id,module_type,item_id' }
            ),
            supabase
              .from('profiles')
              .update({
                total_exp: nextExp,
                current_streak: nextStreak,
                last_study_date: today,
              })
              .eq('id', user.id),
          ]);
        } catch {
          // Fallback local storage đã lưu an toàn
        }
      })();
    }

    return result;
  },

  getItemLevel: (moduleType, itemId) => {
    const key = `${moduleType}:${itemId}`;
    return get().records[key]?.srsLevel ?? 0;
  },

  isItemDue: (moduleType, itemId) => {
    const key = `${moduleType}:${itemId}`;
    const record = get().records[key];
    if (!record) return true;
    return isDueForReview(record.nextReviewDate);
  },

  addExp: (amount) => {
    if (amount <= 0) return;
    const nextExp = get().totalExp + amount;
    set({ totalExp: nextExp });
    if (typeof window !== 'undefined') {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        const parsed = raw ? JSON.parse(raw) : {};
        window.localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            ...parsed,
            totalExp: nextExp,
          })
        );
      } catch {
        // ignore
      }
    }
  },
}));
