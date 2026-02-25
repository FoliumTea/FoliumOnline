import { defineMarkdocConfig, component } from "@astrojs/markdoc/config";
import prism from "@astrojs/markdoc/prism";

export default defineMarkdocConfig({
    extends: [prism()],
    tags: {
        youtube: {
            render: component("./src/components/YouTubeEmbed.astro"),
            attributes: {
                id: { type: String, required: true },
            },
        },
        "folium-table": {
            render: component("./src/components/FoliumTable.astro"),
            attributes: {
                columns: { type: String, required: true },
                rows: { type: String, required: true },
                columnHeadColors: { type: String },
                columnHeadColorsDark: { type: String },
                rowColors: { type: String },
                rowColorsDark: { type: String },
            },
        },
    },
});
