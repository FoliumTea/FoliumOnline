/**
 * MarkdownBlockInserter
 *
 * folium-table, youtube 등 Markdoc 커스텀 블록 + 이미지 삽입.
 * Keystatic 스타일의 블록 삽입 인터페이스.
 */
import { useState, useCallback } from "react";
import ImageUploader from "@/components/admin/ImageUploader";

export type InsertMode = "folium-table" | "youtube" | "image" | null;

interface MarkdownBlockInserterProps {
    content: string;
    onContentChange: (content: string) => void;
    /** 부모 textarea의 selectionStart. onSelect 시 업데이트해야 함 */
    cursorPositionRef: React.MutableRefObject<number | null>;
    disabled?: boolean;
    className?: string;
}

function escapeJsonString(s: string): string {
    return s
        .replace(/\\/g, "\\\\")
        .replace(/"/g, '\\"')
        .replace(/\n/g, "\\n")
        .replace(/\r/g, "\\r");
}

/** Markdoc folium-table 태그 생성 */
function buildFoliumTableTag(
    columns: string[],
    rows: string[][],
    columnHeadColors?: string[],
    columnHeadColorsDark?: string[],
    rowColors?: string[],
    rowColorsDark?: string[]
): string {
    const colsJson = JSON.stringify(columns);
    const rowsJson = JSON.stringify(rows);
    const attrs: string[] = [
        `columns="${escapeJsonString(colsJson)}"`,
        `rows="${escapeJsonString(rowsJson)}"`,
    ];
    if (columnHeadColors?.length)
        attrs.push(
            `columnHeadColors="${escapeJsonString(JSON.stringify(columnHeadColors))}"`
        );
    if (columnHeadColorsDark?.length)
        attrs.push(
            `columnHeadColorsDark="${escapeJsonString(JSON.stringify(columnHeadColorsDark))}"`
        );
    if (rowColors?.length)
        attrs.push(
            `rowColors="${escapeJsonString(JSON.stringify(rowColors))}"`
        );
    if (rowColorsDark?.length)
        attrs.push(
            `rowColorsDark="${escapeJsonString(JSON.stringify(rowColorsDark))}"`
        );
    return `{% folium-table\n   ${attrs.join("\n   ")}\n/%}`;
}

/** Markdoc youtube 태그 생성 */
function buildYoutubeTag(id: string): string {
    return `{% youtube id="${id.replace(/"/g, '\\"')}" /%}`;
}

export default function MarkdownBlockInserter({
    content,
    onContentChange,
    cursorPositionRef,
    disabled = false,
    className = "",
}: MarkdownBlockInserterProps) {
    const [modal, setModal] = useState<InsertMode>(null);

    const insertAtCursor = useCallback(
        (text: string) => {
            const pos = cursorPositionRef.current ?? content.length;
            const before = content.slice(0, pos);
            const after = content.slice(pos);
            const newContent =
                before +
                (before.endsWith("\n") || before === "" ? "" : "\n\n") +
                text +
                "\n\n" +
                after;
            onContentChange(newContent);
            cursorPositionRef.current = pos + text.length + 4; // +4 for "\n\n" and "\n\n"
        },
        [content, onContentChange, cursorPositionRef]
    );

    // ── Folium Table 폼 상태 ──
    const [ftColumns, setFtColumns] = useState("항목, 내용");
    const [ftRows, setFtRows] = useState("값1 | 값2\n값3 | 값4");
    const [ftColHeadColors, setFtColHeadColors] = useState("");
    const [ftRowColors, setFtRowColors] = useState("");

    const handleInsertFoliumTable = () => {
        const columns = ftColumns
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
        const rows = ftRows
            .split("\n")
            .filter((l) => l.trim())
            .map((line) =>
                line
                    .split("|")
                    .map((c) => c.trim())
                    .filter((_, i, arr) => i < (columns.length || arr.length))
            )
            .filter((row) => row.length > 0);

        if (columns.length === 0) return;
        const colColors = ftColHeadColors
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
        const rowCols = ftRowColors
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);

        const tag = buildFoliumTableTag(
            columns,
            rows.length > 0 ? rows : [columns.map(() => "")],
            colColors.length > 0 ? colColors : undefined,
            undefined,
            rowCols.length > 0 ? rowCols : undefined,
            undefined
        );
        insertAtCursor(tag);
        setModal(null);
        setFtColumns("항목, 내용");
        setFtRows("값1 | 값2\n값3 | 값4");
        setFtColHeadColors("");
        setFtRowColors("");
    };

    // ── YouTube 폼 상태 ──
    const [ytId, setYtId] = useState("");

    const handleInsertYoutube = () => {
        const id = ytId.trim();
        if (!id) return;
        insertAtCursor(buildYoutubeTag(id));
        setModal(null);
        setYtId("");
    };

    return (
        <>
            <div className={`flex flex-wrap items-center gap-2 ${className}`}>
                <span className="text-xs text-(--color-muted)">
                    커스텀 블록:
                </span>
                <button
                    type="button"
                    onClick={() => setModal("folium-table")}
                    disabled={disabled}
                    className="px-2.5 py-1 rounded-md border border-(--color-border) text-xs font-medium text-(--color-foreground) hover:bg-(--color-surface-subtle) disabled:opacity-50 transition-colors"
                >
                    📋 Folium Table
                </button>
                <button
                    type="button"
                    onClick={() => setModal("youtube")}
                    disabled={disabled}
                    className="px-2.5 py-1 rounded-md border border-(--color-border) text-xs font-medium text-(--color-foreground) hover:bg-(--color-surface-subtle) disabled:opacity-50 transition-colors"
                >
                    ▶ YouTube
                </button>
                <button
                    type="button"
                    onClick={() => setModal("image")}
                    disabled={disabled}
                    className="px-2.5 py-1 rounded-md border border-(--color-border) text-xs font-medium text-(--color-foreground) hover:bg-(--color-surface-subtle) disabled:opacity-50 transition-colors"
                >
                    🖼 이미지
                </button>
            </div>

            {/* 이미지 업로드 모달 */}
            {modal === "image" && (
                <ImageUploader
                    onInsert={insertAtCursor}
                    onClose={() => setModal(null)}
                />
            )}

            {/* Folium Table 모달 */}
            {modal === "folium-table" && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
                    onClick={() => setModal(null)}
                >
                    <div
                        className="w-full max-w-lg mx-4 p-6 rounded-xl border border-(--color-border) bg-(--color-surface) shadow-xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="text-lg font-semibold text-(--color-foreground) mb-4">
                            Folium Table 삽입
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-(--color-muted) mb-1">
                                    컬럼 헤더 (쉼표 구분)
                                </label>
                                <input
                                    type="text"
                                    value={ftColumns}
                                    onChange={(e) =>
                                        setFtColumns(e.target.value)
                                    }
                                    placeholder="항목, 내용"
                                    className="w-full px-3 py-2 rounded-lg border border-(--color-border) bg-(--color-surface-subtle) text-(--color-foreground) text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-(--color-muted) mb-1">
                                    행 데이터 (한 줄에 한 행, 셀은 | 로 구분)
                                </label>
                                <textarea
                                    value={ftRows}
                                    onChange={(e) => setFtRows(e.target.value)}
                                    rows={6}
                                    placeholder="값1 | 값2&#10;값3 | 값4"
                                    className="w-full px-3 py-2 rounded-lg border border-(--color-border) bg-(--color-surface-subtle) text-(--color-foreground) text-sm font-mono resize-y"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-(--color-muted) mb-1">
                                    컬럼 헤더 색상 (선택, Tailwind 이름, 쉼표
                                    구분)
                                </label>
                                <input
                                    type="text"
                                    value={ftColHeadColors}
                                    onChange={(e) =>
                                        setFtColHeadColors(e.target.value)
                                    }
                                    placeholder="green-400, blue-200"
                                    className="w-full px-3 py-2 rounded-lg border border-(--color-border) bg-(--color-surface-subtle) text-(--color-foreground) text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-(--color-muted) mb-1">
                                    행 배경 색상 (선택, 쉼표 구분)
                                </label>
                                <input
                                    type="text"
                                    value={ftRowColors}
                                    onChange={(e) =>
                                        setFtRowColors(e.target.value)
                                    }
                                    placeholder="green-100, green-50"
                                    className="w-full px-3 py-2 rounded-lg border border-(--color-border) bg-(--color-surface-subtle) text-(--color-foreground) text-sm"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-6">
                            <button
                                type="button"
                                onClick={() => setModal(null)}
                                className="px-4 py-2 rounded-lg border border-(--color-border) text-sm text-(--color-muted) hover:bg-(--color-surface-subtle)"
                            >
                                취소
                            </button>
                            <button
                                type="button"
                                onClick={handleInsertFoliumTable}
                                className="px-4 py-2 rounded-lg bg-(--color-accent) text-(--color-on-accent) text-sm font-medium"
                            >
                                삽입
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* YouTube 모달 */}
            {modal === "youtube" && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
                    onClick={() => setModal(null)}
                >
                    <div
                        className="w-full max-w-md mx-4 p-6 rounded-xl border border-(--color-border) bg-(--color-surface) shadow-xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="text-lg font-semibold text-(--color-foreground) mb-4">
                            YouTube 삽입
                        </h3>
                        <div>
                            <label className="block text-sm font-medium text-(--color-muted) mb-1">
                                동영상 ID
                            </label>
                            <input
                                type="text"
                                value={ytId}
                                onChange={(e) => setYtId(e.target.value)}
                                placeholder="Qr6olpAJfvk (youtu.be/Qr6olpAJfvk 에서)"
                                className="w-full px-3 py-2 rounded-lg border border-(--color-border) bg-(--color-surface-subtle) text-(--color-foreground) text-sm"
                                autoFocus
                            />
                        </div>
                        <div className="flex justify-end gap-2 mt-6">
                            <button
                                type="button"
                                onClick={() => setModal(null)}
                                className="px-4 py-2 rounded-lg border border-(--color-border) text-sm text-(--color-muted) hover:bg-(--color-surface-subtle)"
                            >
                                취소
                            </button>
                            <button
                                type="button"
                                onClick={handleInsertYoutube}
                                disabled={!ytId.trim()}
                                className="px-4 py-2 rounded-lg bg-(--color-accent) text-(--color-on-accent) text-sm font-medium disabled:opacity-50"
                            >
                                삽입
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
