// Astro 5 설정
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import markdoc from "@astrojs/markdoc";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
    output: "static",
    integrations: [react(), markdoc()],
    vite: {
        resolve: {
            alias: { "@": path.resolve(__dirname, "src") },
        },
        plugins: [tailwindcss()],
    },
});
