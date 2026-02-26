/**
 * Supabase 클라이언트 모듈
 *
 * - serverClient: Astro .astro 파일의 빌드 타임 fetch 전용 (service_role 키 사용).
 *   번들에 포함되지 않으므로 브라우저에 노출되지 않는다.
 *
 * - browserClient: React 클라이언트 컴포넌트 전용 (anon 키 + RLS 적용).
 *   브라우저에서 실행되며 인증된 어드민만 쓰기 가능.
 *
 * 사용 예:
 *   - Astro 파일 (빌드 타임): import { serverClient } from "@/lib/supabase"
 *   - React 컴포넌트 (런타임): import { browserClient } from "@/lib/supabase"
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.PUBLIC_SUPABASE_URL ?? "";
const anon = import.meta.env.PUBLIC_SUPABASE_ANON_KEY ?? "";
const service = import.meta.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

// ── 빌드 타임 전용 클라이언트 (service_role) ─────────────────
// RLS를 우회하므로 초안 포함 모든 콘텐츠를 읽어 정적 HTML을 생성할 수 있다.
// 반드시 Astro 서버 컨텍스트(.astro 파일)에서만 사용할 것.
export const serverClient: SupabaseClient | null =
    url && service ? createClient(url, service) : null;

// ── 브라우저 런타임 클라이언트 (anon) ──────────────────────────
// RLS가 적용되므로 공개 데이터는 누구나 읽고,
// 쓰기는 Supabase Auth로 로그인한 어드민만 가능하다.
export const browserClient: SupabaseClient | null =
    url && anon ? createClient(url, anon) : null;

/** @deprecated 기존 코드와의 호환을 위해 남겨둠. browserClient 사용을 권장. */
export const supabase = browserClient;
