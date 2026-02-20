/**
 * 블로그 포스트 유틸: 본문에서 첫 이미지 URL 추출, 요약 문장 생성, KST 날짜 포맷
 * 저장값은 KST를 그대로 저장(ISO의 시·분은 KST 기준). 표시 시 변환 없이 그대로 한국어로 포맷.
 */

/** 저장된 KST 시각(naive, UTC 필드에 KST 숫자 저장)을 한국어 날짜·시간으로 표시. 변환 없음. AM/PM은 오전/오후 */
export function formatPubDateKST(date: Date): string {
    const formatter = new Intl.DateTimeFormat("ko-KR", {
        timeZone: "UTC",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    });
    let s = formatter.format(date);
    s = s.replace(/\bAM\b/i, "오전").replace(/\bPM\b/i, "오후");
    return s;
}

/** 본문(raw)에서 첫 번째 마크다운/마크독 이미지 URL 추출. 없으면 null */
export function getFirstImageFromContent(body: string): string | null {
    if (!body || typeof body !== "string") return null;
    // Markdown image: ![alt](url) or ![](url)
    const match = body.match(/!\[[^\]]*\]\s*\(\s*([^)\s]+)\s*\)/);
    return match ? match[1].trim() : null;
}

/** 본문에서 마크다운 제거 후 첫 3문장 반환 (요약 폴백용) */
export function getFirstThreeSentences(body: string): string {
    if (!body || typeof body !== "string") return "";
    // 간단한 마크다운 제거: 링크 [text](url) -> text, **bold** 제거, # 제거, 코드블록 제거
    let text = body
        .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
        .replace(/\*\*([^*]+)\*\*/g, "$1")
        .replace(/\*([^*]+)\*/g, "$1")
        .replace(/^#+\s*/gm, "")
        .replace(/```[\s\S]*?```/g, "")
        .replace(/`[^`]+`/g, "")
        .replace(/\n+/g, " ")
        .trim();
    const sentences = text.split(/(?<=[.!?])\s+/).filter(Boolean);
    return sentences.slice(0, 3).join(" ").trim() || text.slice(0, 200);
}
