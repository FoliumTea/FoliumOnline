// Astro 5 설정
// Keystatic: dev 모드에서만 통합 (에디터는 개발 프리뷰에서만 사용, 빌드 시 제외)
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import markdoc from "@astrojs/markdoc";
import keystatic from "@keystatic/astro";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const isDev = process.env.NODE_ENV === "development";

export default defineConfig({
    output: "static",
    integrations: [react(), markdoc(), ...(isDev ? [keystatic()] : [])],
    vite: {
        resolve: {
            alias: { "@": path.resolve(__dirname, "src") },
        },
        plugins: [tailwindcss()],
    },
});
