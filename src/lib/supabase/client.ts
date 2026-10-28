import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const rawSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || '';
const rawSupabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || '';

/**
 * Kiểm tra xem người dùng đã cấu hình thông tin kết nối Supabase thực tế trong .env chưa
 */
export const isSupabaseConfigured = Boolean(
  rawSupabaseUrl &&
    rawSupabaseAnonKey &&
    rawSupabaseUrl.startsWith('http') &&
    !rawSupabaseUrl.includes('your-project-id')
);

// Sử dụng URL & Key hợp lệ mặc định khi chưa cấu hình .env để tránh lỗi "supabaseUrl is required" lúc import module
const SAFE_SUPABASE_URL = isSupabaseConfigured
  ? rawSupabaseUrl
  : 'https://placeholder-project.supabase.co';

const SAFE_SUPABASE_ANON_KEY = isSupabaseConfigured
  ? rawSupabaseAnonKey
  : 'placeholder-anon-key';

export const supabase: SupabaseClient = createClient(
  SAFE_SUPABASE_URL,
  SAFE_SUPABASE_ANON_KEY
);
