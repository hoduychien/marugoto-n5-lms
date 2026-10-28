import React from 'react';
import { getLessonWithGrammar } from '@/lib/data/lesson-queries';
import { GrammarClient } from '@/components/grammar/GrammarClient';

interface GrammarPageProps {
  params: Promise<{ id: string }>;
}

export default async function GrammarPage({ params }: GrammarPageProps) {
  const { id } = await params;
  const lessonId = Number(id) || 1;
  const { lesson, grammars, allLessons, source } =
    await getLessonWithGrammar(lessonId);

  return (
    <GrammarClient
      lesson={lesson}
      grammars={grammars}
      allLessons={allLessons}
      dataSource={source}
    />
  );
}
