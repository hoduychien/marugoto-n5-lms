-- ============================================================================
-- MARUGOTO N5 LMS - SUPABASE DATABASE SCHEMA (FULL 5 MODULES)
-- ============================================================================
-- Hướng dẫn: Copy toàn bộ nội dung file này, dán vào Supabase SQL Editor và bấm RUN.

-- Kích hoạt extension tạo UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles (Mở rộng từ bảng auth.users của Supabase)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  display_name TEXT,
  avatar_url TEXT,
  total_exp INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  last_study_date DATE,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Lessons (18 Bài học / 9 Chủ đề Marugoto A1)
CREATE TABLE IF NOT EXISTS lessons (
  id INTEGER PRIMARY KEY,
  topic_name TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Lesson Overviews (Tổng hợp lý thuyết, Can-do & Văn hóa theo bài)
CREATE TABLE IF NOT EXISTS lesson_overviews (
  id INTEGER PRIMARY KEY,
  lesson_id INTEGER REFERENCES lessons(id) ON DELETE CASCADE UNIQUE,
  summary_vn TEXT NOT NULL,
  can_do_objectives JSONB DEFAULT '[]'::jsonb,
  core_theory_points JSONB DEFAULT '[]'::jsonb,
  key_expressions JSONB DEFAULT '[]'::jsonb,
  cultural_notes JSONB DEFAULT '[]'::jsonb
);

-- 4. Vocabularies (Từ vựng chuẩn Marugoto A1 Wordbook theo bài)
CREATE TABLE IF NOT EXISTS vocabularies (
  id SERIAL PRIMARY KEY,
  lesson_id INTEGER REFERENCES lessons(id) ON DELETE CASCADE,
  kanji TEXT,
  hiragana TEXT NOT NULL,
  romaji TEXT NOT NULL,
  meaning_vn TEXT NOT NULL,
  audio_url TEXT,
  example_jp TEXT,
  example_vn TEXT
);

-- 5. Grammars (Chủ điểm Ngữ pháp & Câu ví dụ theo bài)
CREATE TABLE IF NOT EXISTS grammars (
  id INTEGER PRIMARY KEY,
  lesson_id INTEGER REFERENCES lessons(id) ON DELETE CASCADE,
  pattern TEXT NOT NULL,
  meaning_vn TEXT NOT NULL,
  explanation_vn TEXT NOT NULL,
  examples JSONB DEFAULT '[]'::jsonb
);

-- 6. Kanjis (Hán tự đơn âm, Hán Việt, Âm On/Kun & Từ ghép ví dụ theo bài)
CREATE TABLE IF NOT EXISTS kanjis (
  id INTEGER PRIMARY KEY,
  lesson_id INTEGER REFERENCES lessons(id) ON DELETE CASCADE,
  character TEXT NOT NULL,
  yomikata TEXT NOT NULL,
  onyomi TEXT,
  kunyomi TEXT,
  han_viet TEXT,
  meaning_vn TEXT NOT NULL,
  stroke_count INTEGER DEFAULT 1,
  examples JSONB DEFAULT '[]'::jsonb,
  stroke_gif_url TEXT
);

-- 7. Kaiwas (Kịch bản Hội thoại thực tế theo bài)
CREATE TABLE IF NOT EXISTS kaiwas (
  id INTEGER PRIMARY KEY,
  lesson_id INTEGER REFERENCES lessons(id) ON DELETE CASCADE UNIQUE,
  title TEXT NOT NULL,
  situation_vn TEXT NOT NULL,
  lines JSONB DEFAULT '[]'::jsonb
);

-- 8. Kanas (Bảng chữ cái Hiragana & Katakana)
CREATE TABLE IF NOT EXISTS kanas (
  id TEXT PRIMARY KEY,
  system TEXT NOT NULL CHECK (system IN ('hiragana', 'katakana')),
  "group" TEXT NOT NULL CHECK ("group" IN ('basic', 'dakuon', 'yoon')),
  "row" TEXT NOT NULL,
  character TEXT NOT NULL,
  romaji TEXT NOT NULL,
  example_word TEXT NOT NULL,
  example_reading TEXT NOT NULL,
  example_vn TEXT NOT NULL,
  order_index INTEGER DEFAULT 0
);
ALTER TABLE kanas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public kanas read" ON kanas;
DROP POLICY IF EXISTS "Public kanas write" ON kanas;
CREATE POLICY "Public kanas read" ON kanas FOR SELECT USING (true);
CREATE POLICY "Public kanas write" ON kanas FOR ALL USING (true) WITH CHECK (true);

-- 9. User Progress (Theo dõi tiến độ học & thuật toán SRS)
CREATE TABLE IF NOT EXISTS user_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  module_type TEXT CHECK (module_type IN ('vocab', 'kanji', 'grammar', 'kaiwa')),
  item_id INTEGER NOT NULL,
  srs_level INTEGER DEFAULT 0 CHECK (srs_level BETWEEN 0 AND 5),
  next_review_date TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, module_type, item_id)
);

-- ============================================================================
-- ĐẢM BẢO CÁC CỘT MỚI TỒN TẠI NẾU BẢNG ĐÃ ĐƯỢC TẠO TRƯỚC ĐÓ
-- ============================================================================
ALTER TABLE kanjis ADD COLUMN IF NOT EXISTS yomikata TEXT DEFAULT '';
ALTER TABLE kanjis ADD COLUMN IF NOT EXISTS han_viet TEXT;
ALTER TABLE kanjis ADD COLUMN IF NOT EXISTS examples JSONB DEFAULT '[]'::jsonb;

-- ============================================================================
-- INDEXES (Tối ưu truy vấn cho hệ thống LMS & SRS)
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_vocabularies_lesson_id ON vocabularies(lesson_id);
CREATE INDEX IF NOT EXISTS idx_grammars_lesson_id ON grammars(lesson_id);
CREATE INDEX IF NOT EXISTS idx_kanjis_lesson_id ON kanjis(lesson_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_review ON user_progress(user_id, next_review_date);
CREATE INDEX IF NOT EXISTS idx_lessons_order_index ON lessons(order_index);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) & POLICIES
-- ============================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_overviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE vocabularies ENABLE ROW LEVEL SECURITY;
ALTER TABLE grammars ENABLE ROW LEVEL SECURITY;
ALTER TABLE kanjis ENABLE ROW LEVEL SECURITY;
ALTER TABLE kaiwas ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- Xóa policy cũ nếu chạy lại script nhiều lần
DROP POLICY IF EXISTS "Public lessons read" ON lessons;
DROP POLICY IF EXISTS "Public lessons write" ON lessons;
DROP POLICY IF EXISTS "Public overviews read" ON lesson_overviews;
DROP POLICY IF EXISTS "Public overviews write" ON lesson_overviews;
DROP POLICY IF EXISTS "Public vocabularies read" ON vocabularies;
DROP POLICY IF EXISTS "Public vocabularies write" ON vocabularies;
DROP POLICY IF EXISTS "Public grammars read" ON grammars;
DROP POLICY IF EXISTS "Public grammars write" ON grammars;
DROP POLICY IF EXISTS "Public kanjis read" ON kanjis;
DROP POLICY IF EXISTS "Public kanjis write" ON kanjis;
DROP POLICY IF EXISTS "Public kaiwas read" ON kaiwas;
DROP POLICY IF EXISTS "Public kaiwas write" ON kaiwas;

-- Cho phép đọc và đồng bộ dữ liệu học liệu (Seed & Admin CMS)
CREATE POLICY "Public lessons read" ON lessons FOR SELECT USING (true);
CREATE POLICY "Public lessons write" ON lessons FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public overviews read" ON lesson_overviews FOR SELECT USING (true);
CREATE POLICY "Public overviews write" ON lesson_overviews FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public vocabularies read" ON vocabularies FOR SELECT USING (true);
CREATE POLICY "Public vocabularies write" ON vocabularies FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public grammars read" ON grammars FOR SELECT USING (true);
CREATE POLICY "Public grammars write" ON grammars FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public kanjis read" ON kanjis FOR SELECT USING (true);
CREATE POLICY "Public kanjis write" ON kanjis FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public kaiwas read" ON kaiwas FOR SELECT USING (true);
CREATE POLICY "Public kaiwas write" ON kaiwas FOR ALL USING (true) WITH CHECK (true);

-- Profiles & User Progress policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can view own progress" ON user_progress;
DROP POLICY IF EXISTS "Users can insert own progress" ON user_progress;
DROP POLICY IF EXISTS "Users can update own progress" ON user_progress;
CREATE POLICY "Users can view own progress" ON user_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own progress" ON user_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON user_progress FOR UPDATE USING (auth.uid() = user_id);

-- 10. User Custom Decks (Bộ từ vựng cá nhân hoá do người dùng tự tạo & lưu trữ Cloud)
CREATE TABLE IF NOT EXISTS user_custom_decks (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT 'indigo' CHECK (color IN ('indigo', 'emerald', 'amber', 'rose', 'sky', 'purple')),
  words JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_custom_decks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own custom decks" ON user_custom_decks;
DROP POLICY IF EXISTS "Users can insert own custom decks" ON user_custom_decks;
DROP POLICY IF EXISTS "Users can update own custom decks" ON user_custom_decks;
DROP POLICY IF EXISTS "Users can delete own custom decks" ON user_custom_decks;

CREATE POLICY "Users can view own custom decks" ON user_custom_decks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own custom decks" ON user_custom_decks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own custom decks" ON user_custom_decks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own custom decks" ON user_custom_decks FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_user_custom_decks_user_id ON user_custom_decks(user_id);

-- ============================================================================
-- TRIGGER: Tự động khởi tạo Profile khi có User đăng ký mới qua Supabase Auth
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
