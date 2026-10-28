/**
 * SRS (Spaced Repetition System) Algorithm
 * Thang cấp độ nhớ (srs_level): 0 (Mới) -> 5 (Thành thạo)
 */

export type SRSFeedback = 'hard' | 'good' | 'easy';

export interface SRSResult {
  nextLevel: number;
  nextReviewDate: Date;
  intervalLabel: string;
}

export const MIN_SRS_LEVEL = 0;
export const MAX_SRS_LEVEL = 5;

/**
 * Khoảng thời gian ôn tập tính theo giờ cho từng cấp độ SRS (0 -> 5)
 * - Level 0: 10 phút (ôn lại ngay trong phiên)
 * - Level 1: 1 ngày (24h)
 * - Level 2: 3 ngày (72h)
 * - Level 3: 7 ngày (168h)
 * - Level 4: 14 ngày (336h)
 * - Level 5: 30 ngày (720h)
 */
const SRS_INTERVAL_MINUTES: Record<number, number> = {
  0: 10,
  1: 24 * 60,
  2: 3 * 24 * 60,
  3: 7 * 24 * 60,
  4: 14 * 24 * 60,
  5: 30 * 24 * 60,
};

const SRS_INTERVAL_LABELS: Record<number, string> = {
  0: '10 phút',
  1: '1 ngày',
  2: '3 ngày',
  3: '7 ngày',
  4: '14 ngày',
  5: '30 ngày',
};

/**
 * chuẩn hóa giá trị srs_level luôn nằm trong khoảng [0, 5]
 */
export function clampSRSLevel(level: number): number {
  if (Number.isNaN(level)) return MIN_SRS_LEVEL;
  return Math.max(MIN_SRS_LEVEL, Math.min(MAX_SRS_LEVEL, Math.floor(level)));
}

/**
 * Tính toán cấp độ SRS tiếp theo và thời điểm ôn tập kế tiếp dựa trên phản hồi của học viên:
 * - 'hard': Giảm 1 cấp (tối thiểu về 0), ôn lại sớm
 * - 'good': Tăng 1 cấp (tối đa lên 5)
 * - 'easy': Tăng 2 cấp (tối đa lên 5)
 */
export function calculateNextReview(
  currentLevel: number,
  feedback: SRSFeedback,
  now: Date = new Date()
): SRSResult {
  const safeCurrentLevel = clampSRSLevel(currentLevel);
  let nextLevel = safeCurrentLevel;

  switch (feedback) {
    case 'hard':
      nextLevel = clampSRSLevel(safeCurrentLevel - 1);
      break;
    case 'good':
      nextLevel = clampSRSLevel(safeCurrentLevel + 1);
      break;
    case 'easy':
      nextLevel = clampSRSLevel(safeCurrentLevel + 2);
      break;
  }

  const intervalMinutes = SRS_INTERVAL_MINUTES[nextLevel] ?? 10;
  const nextReviewDate = new Date(now.getTime() + intervalMinutes * 60 * 1000);

  return {
    nextLevel,
    nextReviewDate,
    intervalLabel: SRS_INTERVAL_LABELS[nextLevel] ?? '10 phút',
  };
}

/**
 * Trả về tên gọi trạng thái ghi nhớ tương ứng với từng cấp độ SRS
 */
export function getSRSLevelBadge(level: number): {
  label: string;
  colorClass: string;
} {
  const safeLevel = clampSRSLevel(level);
  switch (safeLevel) {
    case 0:
      return { label: 'Mới (Lv.0)', colorClass: 'bg-slate-100 text-slate-700' };
    case 1:
      return { label: 'Đang học (Lv.1)', colorClass: 'bg-rose-100 text-rose-700' };
    case 2:
      return { label: 'Sơ cấp (Lv.2)', colorClass: 'bg-amber-100 text-amber-700' };
    case 3:
      return { label: 'Khá nhớ (Lv.3)', colorClass: 'bg-sky-100 text-sky-700' };
    case 4:
      return { label: 'Nhớ kỹ (Lv.4)', colorClass: 'bg-indigo-100 text-indigo-700' };
    case 5:
      return { label: 'Thành thạo (Lv.5)', colorClass: 'bg-emerald-100 text-emerald-700' };
    default:
      return { label: 'Mới (Lv.0)', colorClass: 'bg-slate-100 text-slate-700' };
  }
}

/**
 * Kiểm tra xem một mục từ vựng/kanji đã đến hạn cần ôn tập hay chưa
 */
export function isDueForReview(
  nextReviewDate?: string | Date | null,
  now: Date = new Date()
): boolean {
  if (!nextReviewDate) return true;
  const targetTime =
    typeof nextReviewDate === 'string'
      ? new Date(nextReviewDate).getTime()
      : nextReviewDate.getTime();
  return targetTime <= now.getTime();
}
