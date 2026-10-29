'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Select, { components, type DropdownIndicatorProps } from 'react-select';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import type { LessonInfo } from '@/lib/data/marugoto-seed';
import { cn } from '@/lib/utils';

export type LessonModuleSlug =
  | 'overview'
  | 'vocab'
  | 'grammar'
  | 'kanji'
  | 'kaiwa'
  | 'notes';

export interface LessonSelectSwitcherProps {
  currentLessonId: number;
  allLessons: LessonInfo[];
  moduleSlug: LessonModuleSlug;
  className?: string;
}

interface LessonOption {
  value: number;
  label: string;
}

function CustomDropdownIndicator(
  props: DropdownIndicatorProps<LessonOption, false>
) {
  const isOpen = props.selectProps.menuIsOpen;
  return (
    <components.DropdownIndicator {...props}>
      <ChevronDown
        className={cn(
          'h-4 w-4 text-slate-400 transition-transform duration-200 ease-out',
          isOpen && 'rotate-180 text-indigo-600'
        )}
      />
    </components.DropdownIndicator>
  );
}

export function LessonSelectSwitcher({
  currentLessonId,
  allLessons,
  moduleSlug,
  className,
}: LessonSelectSwitcherProps) {
  const router = useRouter();

  // Tìm index của bài học hiện tại trong danh sách
  const currentIndex = allLessons.findIndex((l) => l.id === currentLessonId);
  const currentLesson = currentIndex >= 0 ? allLessons[currentIndex] : allLessons[0];

  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson =
    currentIndex >= 0 && currentIndex < allLessons.length - 1
      ? allLessons[currentIndex + 1]
      : null;

  // Chuẩn bị danh sách options cho react-select
  const options: LessonOption[] = allLessons.map((item) => {
    // Rút gọn bớt tiền tố 'Bài X:' nếu đã có trong topic_name để tránh lặp chữ
    const cleanTopic = item.topic_name.replace(/^Bài\s*\d+\s*:\s*/i, '').trim();
    return {
      value: item.id,
      label: `Bài ${item.order_index}${cleanTopic ? `: ${cleanTopic}` : ''}`,
    };
  });

  const selectedOption =
    options.find((opt) => opt.value === currentLessonId) || options[0];

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      {/* Nút lùi về bài trước */}
      {prevLesson ? (
        <Link
          href={`/lessons/${prevLesson.id}/${moduleSlug}`}
          title={`Bài trước: Bài ${prevLesson.order_index}`}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 hover:text-indigo-600"
          aria-label="Bài trước"
        >
          <ChevronLeft className="h-4 w-4" />
        </Link>
      ) : (
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed"
          aria-hidden="true"
        >
          <ChevronLeft className="h-4 w-4" />
        </span>
      )}

      {/* Select chọn bài học */}
      <div className="w-60 sm:w-72 md:w-80 max-w-[calc(100vw-120px)]">
        <Select<LessonOption, false>
          instanceId="lesson-select-switcher"
          classNamePrefix="react-select"
          options={options}
          value={selectedOption}
          onChange={(opt) => {
            if (opt && opt.value !== currentLessonId) {
              router.push(`/lessons/${opt.value}/${moduleSlug}`);
            }
          }}
          isSearchable={false}
          components={{
            IndicatorSeparator: () => null,
            DropdownIndicator: CustomDropdownIndicator,
          }}
          menuPortalTarget={
            typeof document !== 'undefined' ? document.body : null
          }
          styles={{
            menuPortal: (base) => ({ ...base, zIndex: 60 }),
            control: (base, state) => ({
              ...base,
              minHeight: '36px',
              height: '36px',
              borderRadius: '0.5rem',
              fontSize: '13px',
              fontWeight: 500,
              backgroundColor: '#ffffff',
              borderColor: state.isFocused ? '#6366f1' : '#e2e8f0',
              boxShadow: 'none',
              cursor: 'pointer',
              '&:hover': {
                borderColor: state.isFocused ? '#6366f1' : '#818cf8',
              },
            }),
            valueContainer: (base) => ({
              ...base,
              height: '34px',
              padding: '0 10px',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
            }),
            singleValue: (base) => ({
              ...base,
              color: '#1e293b',
              fontWeight: 600,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }),
            indicatorsContainer: (base) => ({
              ...base,
              height: '34px',
            }),
            dropdownIndicator: (base) => ({
              ...base,
              padding: '0 8px 0 4px',
            }),
            menu: (base) => ({
              ...base,
              borderRadius: '0.5rem',
              boxShadow: 'none',
              border: '1px solid #cbd5e1',
              overflow: 'hidden',
            }),
            menuList: (base) => ({
              ...base,
              padding: '4px',
              maxHeight: '260px',
            }),
            option: (base, state) => ({
              ...base,
              fontSize: '12.5px',
              padding: '7px 10px',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              backgroundColor: state.isSelected
                ? '#4f46e5'
                : state.isFocused
                ? '#f1f5f9'
                : 'transparent',
              color: state.isSelected ? '#ffffff' : '#334155',
              fontWeight: state.isSelected ? 600 : 500,
              '&:active': {
                backgroundColor: state.isSelected ? '#4f46e5' : '#e2e8f0',
              },
            }),
          }}
        />
      </div>

      {/* Nút tiến tới bài kế tiếp */}
      {nextLesson ? (
        <Link
          href={`/lessons/${nextLesson.id}/${moduleSlug}`}
          title={`Bài sau: Bài ${nextLesson.order_index}`}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 hover:text-indigo-600"
          aria-label="Bài sau"
        >
          <ChevronRight className="h-4 w-4" />
        </Link>
      ) : (
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed"
          aria-hidden="true"
        >
          <ChevronRight className="h-4 w-4" />
        </span>
      )}
    </div>
  );
}
