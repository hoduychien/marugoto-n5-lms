# Project Blueprint: Marugoto N5 Japanese Learning LMS
**Role:** Senior Fullstack Developer / Tech Lead
**Tech Stack:** Next.js 14+ (App Router), React, TypeScript, Tailwind CSS, Supabase (Auth, Database, Storage), Zustand (State Management), Lucide-React (Icons), Shadcn UI (Component Library).

## 1. Project Overview
A comprehensive Learning Management System (LMS) for self-studying Japanese at the N5 level (based on Marugoto A1). It features interactive vocabulary flashcards with SRS, grammar explanations, kanji guides with stroke animations, Kaiwa reading/listening with toggleable Furigana/Romaji, and JLPT mock exams.

## 2. Database Schema (Supabase SQL)
*AI Agent Instruction: Execute the following SQL in Supabase SQL Editor to initialize the database.*

```sql
-- 1. Profiles (Extends Supabase Auth Users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  display_name TEXT,
  avatar_url TEXT,
  total_exp INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  last_study_date DATE,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Lessons (Chapters/Topics)
CREATE TABLE lessons (
  id SERIAL PRIMARY KEY,
  topic_name TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Vocabularies
CREATE TABLE vocabularies (
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

-- 4. Kanjis
CREATE TABLE kanjis (
  id SERIAL PRIMARY KEY,
  lesson_id INTEGER REFERENCES lessons(id) ON DELETE CASCADE,
  character TEXT NOT NULL,
  onyomi TEXT,
  kunyomi TEXT,
  meaning_vn TEXT NOT NULL,
  stroke_count INTEGER,
  stroke_gif_url TEXT
);

-- 5. User Progress (For SRS & Tracking)
CREATE TABLE user_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  module_type TEXT CHECK (module_type IN ('vocab', 'kanji', 'grammar')),
  item_id INTEGER NOT NULL, -- references vocabularies.id, kanjis.id, etc.
  srs_level INTEGER DEFAULT 0, -- 0 to 5
  next_review_date TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 3. Folder Structure (Next.js App Router)
*AI Agent Instruction: Set up the project directories exactly as follows.*

```text
src/
├── app/
│   ├── (auth)/login/page.tsx
│   ├── (learning)/
│   │   ├── dashboard/page.tsx
│   │   ├── lessons/[id]/
│   │   │   ├── vocab/page.tsx
│   │   │   ├── grammar/page.tsx
│   │   │   ├── kanji/page.tsx
│   │   │   └── kaiwa/page.tsx
│   │   └── flashcards/page.tsx
│   ├── admin/page.tsx
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/                # Shadcn components go here
│   ├── audio/AdvancedAudioPlayer.tsx
│   ├── text/JapaneseText.tsx
│   └── quiz/SRSFlashcard.tsx
├── lib/
│   ├── supabase/client.ts
│   └── srs-algorithm.ts
└── store/
    └── useSettingsStore.ts
```

## 4. Core Global State (Zustand)
*AI Agent Instruction: Create `src/store/useSettingsStore.ts` first. This is critical for the global toggle of Furigana and Romaji across the entire app.*

```typescript
import { create } from 'zustand';

interface SettingsState {
  showFurigana: boolean;
  showRomaji: boolean;
  toggleFurigana: () => void;
  toggleRomaji: () => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  showFurigana: true,
  showRomaji: false,
  toggleFurigana: () => set((state) => ({ showFurigana: !state.showFurigana })),
  toggleRomaji: () => set((state) => ({ showRomaji: !state.showRomaji })),
}));
```

## 5. Core Components Specifications

### A. `<JapaneseText />`
- **Path:** `src/components/text/JapaneseText.tsx`
- **Props:** `kanji` (string), `furigana` (optional string), `romaji` (optional string), `meaning` (optional string).
- **Behavior:** Connects to `useSettingsStore`. Renders HTML `<ruby>` and `<rt>` tags for Kanji and Furigana. Hides `<rt>` using Tailwind `opacity-0` if `showFurigana` is false. Displays `romaji` conditionally based on `showRomaji`.

### B. `<AdvancedAudioPlayer />`
- **Path:** `src/components/audio/AdvancedAudioPlayer.tsx`
- **Props:** `src` (string - URL of the mp3 file from MarugotoStarterCompetencesMp3).
- **Behavior:** Uses HTML5 `<audio>` and `useRef`. Includes Play/Pause button, a Rewind 5s button (`audioRef.current.currentTime -= 5`), and a Speed Toggle (1x -> 0.75x -> 0.5x). Use `lucide-react` for icons.

### C. `<SRSFlashcard />`
- **Path:** `src/components/quiz/SRSFlashcard.tsx`
- **Props:** `vocabularyItem` (Object).
- **Behavior:** Implement 3D flip card CSS. Front shows Kanji/Hiragana (using `JapaneseText`). Back shows Meaning, Example, and includes the `AdvancedAudioPlayer`. Includes 3 buttons for SRS feedback: "Hard", "Good", "Easy", which will trigger an API call to update `user_progress.srs_level`.

## 6. Implementation Phases for AI
**Phase 1: Initialization & Configurations**
- Initialize Next.js with TypeScript and Tailwind.
- Install dependencies: `@supabase/supabase-js`, `zustand`, `lucide-react`, `clsx`, `tailwind-merge`.
- Setup Supabase client in `lib/supabase/client.ts`.

**Phase 2: Core Components & Layouts**
- Build the Zustand store.
- Build `JapaneseText` and `AdvancedAudioPlayer`.
- Build the main App Layout with a persistent Sidebar/Navbar containing the Furigana/Romaji toggle switches.

**Phase 3: Views Implementation**
- Implement `app/lessons/[id]/vocab/page.tsx` displaying a grid of Vocab items.
- Implement the Flashcard review UI.
- Fetch data directly from Supabase inside Server Components where possible, pass data to Client Components for interactivity.