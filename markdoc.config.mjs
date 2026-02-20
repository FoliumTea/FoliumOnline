import { defineMarkdocConfig, component } from "@astrojs/markdoc/config";

export default defineMarkdocConfig({
    tags: {
        youtube: {
            render: component("./src/components/YouTubeEmbed.astro"),
            attributes: {
                id: { type: String, required: true },
            },
        },
    },
});
