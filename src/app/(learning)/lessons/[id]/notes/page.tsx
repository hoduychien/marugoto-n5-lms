import React from 'react';
import { getLessonForNotes } from '@/lib/data/lesson-queries';
import { LessonNotesClient } from '@/components/notes/LessonNotesClient';

interface LessonNotesPageProps {
  params: Promise<{ id: string }>;
}

export default async function LessonNotesPage({
  params,
}: LessonNotesPageProps) {
  const { id } = await params;
  const lessonId = Number(id) || 1;
  const { lesson, allLessons, vocabularies, grammars, source } =
    await getLessonForNotes(lessonId);

  return (
    <LessonNotesClient
      lesson={lesson}
      allLessons={allLessons}
      vocabularies={vocabularies}
      grammars={grammars}
      dataSource={source}
    />
  );
}
