import React from 'react';
import { getLessonWithKaiwa } from '@/lib/data/lesson-queries';
import { KaiwaClient } from '@/components/kaiwa/KaiwaClient';

interface KaiwaPageProps {
  params: Promise<{ id: string }>;
}

export default async function KaiwaPage({ params }: KaiwaPageProps) {
  const { id } = await params;
  const lessonId = Number(id) || 1;
  const { lesson, dialogue, audioTracks, allLessons, source } =
    await getLessonWithKaiwa(lessonId);

  return (
    <KaiwaClient
      lesson={lesson}
      dialogue={dialogue}
      audioTracks={audioTracks}
      allLessons={allLessons}
      dataSource={source}
    />
  );
}
