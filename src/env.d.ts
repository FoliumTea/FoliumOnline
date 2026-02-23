/// <reference types="astro/client" />

/** 포트폴리오 [slug]에서 Mermaid CDN 동적 import 시 TypeScript 인식용 */
declare module "https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs" {
    const mermaid: {
        initialize: (config: { startOnLoad?: boolean; theme?: string }) => void;
        render: (id: string, definition: string) => Promise<{ svg: string }>;
    };
    export default mermaid;
}
