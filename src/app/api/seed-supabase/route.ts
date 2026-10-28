import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import {
  MARUGOTO_LESSONS_SEED,
  MARUGOTO_VOCAB_SEED,
} from '@/lib/data/marugoto-seed';
import { MARUGOTO_OVERVIEW_SEED } from '@/lib/data/marugoto-overview-seed';
import {
  MARUGOTO_GRAMMAR_SEED,
  MARUGOTO_KAIWA_SEED,
} from '@/lib/data/marugoto-grammar-kaiwa-seed';
import { MARUGOTO_KANJI_SEED } from '@/lib/data/marugoto-kanji-seed';
import { HIRAGANA_ITEMS, KATAKANA_ITEMS } from '@/lib/data/kana-seed';

export async function POST() {
  if (!isSupabaseConfigured) {
    return NextResponse.json(
      {
        ok: false,
        error:
          'Chưa cấu hình NEXT_PUBLIC_SUPABASE_URL và NEXT_PUBLIC_SUPABASE_ANON_KEY trong file .env.local',
      },
      { status: 400 }
    );
  }

  try {
    // 1. Upsert 18 bài học (lessons) - Chỉ gửi đúng các cột trong bảng lessons
    const lessonsPayload = MARUGOTO_LESSONS_SEED.map((l) => ({
      id: l.id,
      topic_name: l.topic_name,
      description: l.description,
      thumbnail_url: l.thumbnail_url ?? null,
      order_index: l.order_index,
    }));
    const { error: lessonsErr } = await supabase
      .from('lessons')
      .upsert(lessonsPayload, { onConflict: 'id' });
    if (lessonsErr) throw new Error(`Bảng lessons: ${lessonsErr.message}`);

    // 2. Upsert 18 bài Tổng hợp lý thuyết (lesson_overviews)
    const overviewsPayload = Object.values(MARUGOTO_OVERVIEW_SEED).map((o) => ({
      id: o.id,
      lesson_id: o.lesson_id,
      summary_vn: o.summary_vn,
      can_do_objectives: o.can_do_objectives,
      core_theory_points: o.core_theory_points,
      key_expressions: o.key_expressions,
      cultural_notes: o.cultural_notes,
    }));
    const { error: overviewsErr } = await supabase
      .from('lesson_overviews')
      .upsert(overviewsPayload, { onConflict: 'id' });
    if (overviewsErr)
      throw new Error(`Bảng lesson_overviews: ${overviewsErr.message}`);

    // 3. Upsert toàn bộ Từ vựng (vocabularies)
    const vocabsPayload = Object.values(MARUGOTO_VOCAB_SEED)
      .flat()
      .map((v) => ({
        id: v.id,
        lesson_id: v.lesson_id,
        kanji: v.kanji ?? null,
        hiragana: v.hiragana,
        romaji: v.romaji,
        meaning_vn: v.meaning_vn,
        audio_url: v.audio_url ?? null,
        example_jp: v.example_jp ?? null,
        example_vn: v.example_vn ?? null,
      }));
    const { error: vocabsErr } = await supabase
      .from('vocabularies')
      .upsert(vocabsPayload, { onConflict: 'id' });
    if (vocabsErr)
      throw new Error(`Bảng vocabularies: ${vocabsErr.message}`);

    // 4. Upsert toàn bộ Ngữ pháp (grammars)
    const grammarsPayload = Object.values(MARUGOTO_GRAMMAR_SEED)
      .flat()
      .map((g) => ({
        id: g.id,
        lesson_id: g.lesson_id,
        pattern: g.pattern,
        meaning_vn: g.meaning_vn,
        explanation_vn: g.explanation_vn,
        examples: g.examples,
      }));
    const { error: grammarsErr } = await supabase
      .from('grammars')
      .upsert(grammarsPayload, { onConflict: 'id' });
    if (grammarsErr) throw new Error(`Bảng grammars: ${grammarsErr.message}`);

    // 5. Upsert toàn bộ Hán tự (kanjis) - Chuẩn hóa đúng các cột trong bảng kanjis
    const kanjisPayload = Object.values(MARUGOTO_KANJI_SEED)
      .flat()
      .map((k) => ({
        id: k.id,
        lesson_id: k.lesson_id,
        character: k.character,
        yomikata: k.yomikata,
        onyomi: k.onyomi ?? null,
        kunyomi: k.kunyomi ?? null,
        han_viet: k.han_viet ?? null,
        meaning_vn: k.meaning_vn,
        stroke_count: k.stroke_count,
        examples: k.example_jp
          ? [{ jp: k.example_jp, vn: k.example_vn || '' }]
          : [],
        stroke_gif_url: k.stroke_gif_url ?? null,
      }));
    const { error: kanjisErr } = await supabase
      .from('kanjis')
      .upsert(kanjisPayload, { onConflict: 'id' });
    if (kanjisErr) throw new Error(`Bảng kanjis: ${kanjisErr.message}`);

    // 6. Upsert toàn bộ Hội thoại (kaiwas)
    const kaiwasPayload = Object.values(MARUGOTO_KAIWA_SEED).map((kw) => ({
      id: kw.id,
      lesson_id: kw.lesson_id,
      title: kw.title,
      situation_vn: kw.situation_vn,
      lines: kw.lines,
    }));
    const { error: kaiwasErr } = await supabase
      .from('kaiwas')
      .upsert(kaiwasPayload, { onConflict: 'id' });
    if (kaiwasErr) throw new Error(`Bảng kaiwas: ${kaiwasErr.message}`);

    // 7. Upsert toàn bộ Bảng chữ cái Hiragana & Katakana (kanas - nếu bảng đã được tạo)
    const kanasPayload = [...HIRAGANA_ITEMS, ...KATAKANA_ITEMS].map(
      (item, idx) => ({
        id: item.id,
        system: item.system,
        group: item.group,
        row: item.row,
        character: item.character,
        romaji: item.romaji,
        example_word: item.example_word,
        example_reading: item.example_reading,
        example_vn: item.example_vn,
        order_index: idx + 1,
      })
    );
    await supabase.from('kanas').upsert(kanasPayload, { onConflict: 'id' });

    return NextResponse.json({
      ok: true,
      counts: {
        lessons: lessonsPayload.length,
        overviews: overviewsPayload.length,
        vocabularies: vocabsPayload.length,
        grammars: grammarsPayload.length,
        kanjis: kanjisPayload.length,
        kaiwas: kaiwasPayload.length,
      },
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Lỗi không xác định khi đẩy dữ liệu.';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
