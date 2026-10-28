import React from 'react';
import { getLessonWithVocabularies } from '@/lib/data/lesson-queries';
import { VocabGridClient } from '@/components/vocab/VocabGridClient';

export default async function LessonVocabPage({
  params,
}: {
  params: { id: string };
}) {
  const lessonId = parseInt(params.id, 10) || 1;
  const { lesson, vocabularies, allLessons, audioTracks, source } =
    await getLessonWithVocabularies(lessonId);

  return (
    <VocabGridClient
      lesson={lesson}
      vocabularies={vocabularies}
      allLessons={allLessons}
      audioTracks={audioTracks}
      dataSource={source}
    />
  );
}
