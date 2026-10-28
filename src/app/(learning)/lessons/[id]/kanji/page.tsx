import React from 'react';
import { getLessonWithKanjis } from '@/lib/data/lesson-queries';
import { KanjiGridClient } from '@/components/kanji/KanjiGridClient';

export default async function LessonKanjiPage({
  params,
}: {
  params: { id: string };
}) {
  const lessonId = parseInt(params.id, 10) || 1;
  const { lesson, kanjis, allLessons, source } =
    await getLessonWithKanjis(lessonId);

  return (
    <KanjiGridClient
      lesson={lesson}
      kanjis={kanjis}
      allLessons={allLessons}
      dataSource={source}
    />
  );
}
