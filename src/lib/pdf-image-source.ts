import { getImageProps } from "next/image";

// PDF 캡처의 외부 이미지를 기존 Next.js 허용 목록 경로로 변환
export const getPdfImageSource = (source: string, baseUrl: string): string => {
    let url: URL;
    try {
        url = new URL(source, baseUrl);
    } catch {
        return source;
    }
    if (url.protocol !== "https:" || url.origin === new URL(baseUrl).origin) {
        return source;
    }
    return getImageProps({
        src: url.href,
        alt: "",
        width: 1200,
        height: 675,
    }).props.src;
};
