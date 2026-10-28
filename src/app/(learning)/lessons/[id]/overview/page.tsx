import React from 'react';
import { getLessonWithOverview } from '@/lib/data/lesson-queries';
import { OverviewClient } from '@/components/overview/OverviewClient';

interface OverviewPageProps {
  params: Promise<{ id: string }>;
}

export default async function OverviewPage({ params }: OverviewPageProps) {
  const { id } = await params;
  const lessonId = Number(id) || 1;
  const {
    lesson,
    overview,
    vocabCount,
    grammars,
    kanjis,
    kaiwaLinesCount,
    allLessons,
    source,
  } = await getLessonWithOverview(lessonId);

  return (
    <OverviewClient
      lesson={lesson}
      overview={overview}
      vocabCount={vocabCount}
      grammars={grammars}
      kanjis={kanjis}
      kaiwaLinesCount={kaiwaLinesCount}
      allLessons={allLessons}
      dataSource={source}
    />
  );
}
