/**
 * Tailwind CSS default color palette - maps color names (e.g. "red-400") to hex.
 * Used by FoliumTable for column/row coloring.
 * Source: Tailwind CSS v4 default theme
 */
const TAILWIND_COLORS: Record<string, string> = {
    red: "#ef4444",
    "red-50": "#fef2f2",
    "red-100": "#fee2e2",
    "red-200": "#fecaca",
    "red-300": "#fca5a5",
    "red-400": "#f87171",
    "red-500": "#ef4444",
    "red-600": "#dc2626",
    "red-700": "#b91c1c",
    "red-800": "#991b1b",
    "red-900": "#7f1d1d",
    "red-950": "#450a0a",
    green: "#22c55e",
    "green-50": "#f0fdf4",
    "green-100": "#dcfce7",
    "green-200": "#bbf7d0",
    "green-300": "#86efac",
    "green-400": "#4ade80",
    "green-500": "#22c55e",
    "green-600": "#16a34a",
    "green-700": "#15803d",
    "green-800": "#166534",
    "green-900": "#14532d",
    "green-950": "#052e16",
};

/** Shades 50-400 are "light" (need dark text), 500-950 are "dark" (need light text) */
const LIGHT_SHADES = new Set([50, 100, 200, 300, 400]);

export function tailwindToHex(name: string): string {
    const trimmed = String(name).trim().toLowerCase();
    return TAILWIND_COLORS[trimmed] ?? trimmed;
}

export function isLightBackground(tailwindName: string): boolean {
    const match = tailwindName.match(/-(\d+)$/);
    if (!match) return true;
    const shade = parseInt(match[1], 10);
    return LIGHT_SHADES.has(shade);
}
