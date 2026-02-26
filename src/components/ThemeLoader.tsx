/**
 * ThemeLoader
 *
 * 런타임에 Supabase site_config 테이블에서 color_scheme을 읽어
 * <html data-color-scheme> 속성을 즉시 업데이트한다.
 * browserClient가 없으면 아무 동작도 하지 않는다.
 */
import { useEffect } from "react";
import { browserClient } from "@/lib/supabase";

const VALID_SCHEMES = ["blue", "gray", "beige", "blackwhite"];

export default function ThemeLoader() {
    useEffect(() => {
        if (!browserClient) return;

        browserClient
            .from("site_config")
            .select("value")
            .eq("key", "color_scheme")
            .single()
            .then(({ data }) => {
                if (!data) return;
                // value는 JSON.stringify된 문자열 (예: '"blue"')로 저장됨
                const raw = data.value;
                const scheme =
                    typeof raw === "string" && raw.startsWith('"')
                        ? JSON.parse(raw)
                        : raw;
                if (VALID_SCHEMES.includes(scheme as string)) {
                    document.documentElement.dataset.colorScheme =
                        scheme as string;
                }
            });
    }, []);

    // UI 렌더링 없음 — 사이드 이펙트만 실행
    return null;
}
