/**
 * Supabase 클라이언트
 * - 포트폴리오 JSON 및 블로그 마크다운 저장용
 * - 환경변수: PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY
 */
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY ?? "";

export const supabase =
    supabaseUrl && supabaseAnonKey
        ? createClient(supabaseUrl, supabaseAnonKey)
        : null;
