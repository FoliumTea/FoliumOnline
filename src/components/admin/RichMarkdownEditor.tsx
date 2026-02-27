/**
 * RichMarkdownEditor
 *
 * MDXEditor 기반 WYSIWYG 마크다운 에디터.
 * - ## 입력 시 H2로 즉시 렌더링
 * - folium-table, youtube 커스텀 directive 지원
 * - Supabase Storage 이미지 업로드 (WebP 변환)
 */
import { useCallback, useState, useEffect } from "react";
import { basicDark } from "cm6-theme-basic-dark";
import { basicLight } from "cm6-theme-basic-light";
import {
    MDXEditor,
    headingsPlugin,
    listsPlugin,
    quotePlugin,
    linkPlugin,
    tablePlugin,
    thematicBreakPlugin,
    imagePlugin,
    codeBlockPlugin,
    codeMirrorPlugin,
    CodeMirrorEditor,
    directivesPlugin,
    diffSourcePlugin,
    markdownShortcutPlugin,
    toolbarPlugin,
    BlockTypeSelect,
    BoldItalicUnderlineToggles,
    CreateLink,
    DiffSourceToggleWrapper,
    InsertCodeBlock,
    InsertImage,
    InsertTable,
    ListsToggle,
    UndoRedo,
    usePublisher,
    insertDirective$,
    GenericDirectiveEditor,
    useMdastNodeUpdater,
    PropertyPopover,
    type DirectiveDescriptor,
    type DirectiveEditorProps,
} from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";
import { jsxToDirective, directiveToJsx } from "@/lib/mdx-directive-converter";
import { uploadImageToSupabase } from "@/lib/image-upload";

interface RichMarkdownEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
}

// YouTube directive: ::youtube[]{id="xxx"} — 16:9 미리보기
function YoutubeDirectiveEditor({
    mdastNode,
    descriptor,
}: DirectiveEditorProps) {
    const updateMdastNode = useMdastNodeUpdater();
    const id = (mdastNode.attributes?.id ?? "") as string;
    const properties = { id };
    const onChange = useCallback(
        (values: Record<string, string>) => {
            updateMdastNode({
                attributes: Object.fromEntries(
                    Object.entries(values).filter(([, v]) => v !== "")
                ),
            });
        },
        [updateMdastNode]
    );

    return (
        <div className="my-3 flex flex-col gap-2">
            <div className="rich-editor-youtube-wrapper">
                {id ? (
                    <iframe
                        src={`https://www.youtube.com/embed/${id}`}
                        title="YouTube video"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="rich-editor-youtube-embed"
                    />
                ) : (
                    <div className="flex min-h-[180px] items-center justify-center rounded-lg border border-dashed border-(--color-border) bg-(--color-surface-subtle) text-sm text-(--color-muted)">
                        YouTube Video ID 없음 — 설정에서 입력하세요
                    </div>
                )}
            </div>
            <div className="flex items-center gap-2">
                <PropertyPopover
                    properties={properties}
                    title={mdastNode.name || "youtube"}
                    onChange={onChange}
                />
                <span className="text-xs text-(--color-muted)">
                    {id ? `ID: ${id}` : "ID를 입력하세요"}
                </span>
            </div>
        </div>
    );
}

const YoutubeDirectiveDescriptor: DirectiveDescriptor = {
    name: "youtube",
    testNode(node) {
        return node.name === "youtube";
    },
    attributes: ["id"],
    hasChildren: false,
    type: "leafDirective",
    Editor: YoutubeDirectiveEditor,
};

// Folium-table directive: ::folium-table[]{columns="..." rows="..."}
const FoliumTableDirectiveDescriptor: DirectiveDescriptor = {
    name: "folium-table",
    testNode(node) {
        return node.name === "folium-table";
    },
    attributes: [
        "columns",
        "rows",
        "columnHeadColors",
        "columnHeadColorsDark",
        "rowColors",
        "rowColorsDark",
    ],
    hasChildren: false,
    type: "leafDirective",
    Editor: GenericDirectiveEditor,
};

function InsertButtons() {
    const insertDirective = usePublisher(insertDirective$);
    const [modal, setModal] = useState<"folium-table" | "youtube" | null>(null);

    // Folium Table 폼 상태
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

        const columnsJson = JSON.stringify(columns);
        const rowsJson = JSON.stringify(
            rows.length ? rows : [columns.map(() => "")]
        );

        const attrs: Record<string, string> = {
            columns: columnsJson,
            rows: rowsJson,
        };

        if (colColors.length)
            attrs.columnHeadColors = JSON.stringify(colColors);
        if (rowCols.length) attrs.rowColors = JSON.stringify(rowCols);

        insertDirective({
            type: "leafDirective",
            name: "folium-table",
            attributes: attrs,
            children: [],
        } as any);

        setModal(null);
        setFtColumns("항목, 내용");
        setFtRows("값1 | 값2\n값3 | 값4");
        setFtColHeadColors("");
        setFtRowColors("");
    };

    // YouTube 폼 상태
    const [ytId, setYtId] = useState("");

    const handleInsertYoutube = () => {
        let id = ytId.trim();
        if (!id) return;

        try {
            const parsed = new URL(id);
            id =
                parsed.searchParams.get("v") ||
                parsed.pathname.split("/").pop() ||
                id;
        } catch {
            // Assume it's already an ID
        }

        insertDirective({
            type: "leafDirective",
            name: "youtube",
            attributes: { id },
            children: [],
        } as any);

        setModal(null);
        setYtId("");
    };

    return (
        <>
            <button
                type="button"
                onClick={() => setModal("youtube")}
                className="rounded border border-(--color-border) px-2 py-1 text-sm font-medium text-(--color-foreground) transition-colors hover:border-(--color-accent) hover:bg-(--color-surface-subtle) hover:text-(--color-accent)"
            >
                ▶ YouTube
            </button>
            <button
                type="button"
                onClick={() => setModal("folium-table")}
                className="rounded border border-(--color-border) px-2 py-1 text-sm font-medium text-(--color-foreground) transition-colors hover:border-(--color-accent) hover:bg-(--color-surface-subtle) hover:text-(--color-accent)"
            >
                📋 Folium Table
            </button>

            {/* Folium Table 모달 */}
            {modal === "folium-table" && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
                    onClick={() => setModal(null)}
                >
                    <div
                        className="mx-4 w-full max-w-lg rounded-xl border border-(--color-border) bg-(--color-surface) p-6 shadow-xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="mb-4 text-xl font-semibold text-(--color-foreground)">
                            Folium Table 삽입
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="mb-1 block text-base font-medium text-(--color-muted)">
                                    컬럼 헤더 (쉼표 구분)
                                </label>
                                <input
                                    type="text"
                                    value={ftColumns}
                                    onChange={(e) =>
                                        setFtColumns(e.target.value)
                                    }
                                    placeholder="항목, 내용"
                                    className="w-full rounded-lg border border-(--color-border) bg-(--color-surface-subtle) px-3 py-2 text-base text-(--color-foreground)"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-base font-medium text-(--color-muted)">
                                    행 데이터 (한 줄에 한 행, 셀은 | 로 구분)
                                </label>
                                <textarea
                                    value={ftRows}
                                    onChange={(e) => setFtRows(e.target.value)}
                                    rows={6}
                                    placeholder="값1 | 값2&#10;값3 | 값4"
                                    className="w-full resize-y rounded-lg border border-(--color-border) bg-(--color-surface-subtle) px-3 py-2 font-mono text-base text-(--color-foreground)"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-base font-medium text-(--color-muted)">
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
                                    className="w-full rounded-lg border border-(--color-border) bg-(--color-surface-subtle) px-3 py-2 text-base text-(--color-foreground)"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-base font-medium text-(--color-muted)">
                                    행 배경 색상 (선택, 쉼표 구분)
                                </label>
                                <input
                                    type="text"
                                    value={ftRowColors}
                                    onChange={(e) =>
                                        setFtRowColors(e.target.value)
                                    }
                                    placeholder="green-100, green-50"
                                    className="w-full rounded-lg border border-(--color-border) bg-(--color-surface-subtle) px-3 py-2 text-base text-(--color-foreground)"
                                />
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setModal(null)}
                                className="rounded-lg border border-(--color-border) px-4 py-2 text-base text-(--color-muted) hover:bg-(--color-surface-subtle)"
                            >
                                취소
                            </button>
                            <button
                                type="button"
                                onClick={handleInsertFoliumTable}
                                className="rounded-lg bg-(--color-accent) px-4 py-2 text-base font-medium text-(--color-on-accent)"
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
                        className="mx-4 w-full max-w-md rounded-xl border border-(--color-border) bg-(--color-surface) p-6 shadow-xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="mb-4 text-xl font-semibold text-(--color-foreground)">
                            YouTube 삽입
                        </h3>
                        <div>
                            <label className="mb-1 block text-base font-medium text-(--color-muted)">
                                동영상 ID
                            </label>
                            <input
                                type="text"
                                value={ytId}
                                onChange={(e) => setYtId(e.target.value)}
                                placeholder="Qr6olpAJfvk (youtu.be/Qr6olpAJfvk 에서)"
                                className="w-full rounded-lg border border-(--color-border) bg-(--color-surface-subtle) px-3 py-2 text-base text-(--color-foreground)"
                                autoFocus
                            />
                        </div>
                        <div className="mt-6 flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setModal(null)}
                                className="rounded-lg border border-(--color-border) px-4 py-2 text-base text-(--color-muted) hover:bg-(--color-surface-subtle)"
                            >
                                취소
                            </button>
                            <button
                                type="button"
                                onClick={handleInsertYoutube}
                                disabled={!ytId.trim()}
                                className="rounded-lg bg-(--color-accent) px-4 py-2 text-base font-medium text-(--color-on-accent) disabled:opacity-50"
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

export default function RichMarkdownEditor({
    value,
    onChange,
    placeholder = "본문을 작성하세요...",
    disabled = false,
}: RichMarkdownEditorProps) {
    const [mounted, setMounted] = useState(false);
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;
        const el = document.documentElement;
        setIsDark(el.classList.contains("dark"));
        const observer = new MutationObserver(() => {
            setIsDark(el.classList.contains("dark"));
        });
        observer.observe(el, { attributes: true, attributeFilter: ["class"] });
        return () => observer.disconnect();
    }, [mounted]);

    const handleChange = useCallback(
        (mdxMarkdown: string) => {
            const jsxString = directiveToJsx(mdxMarkdown);
            onChange(jsxString);
        },
        [onChange]
    );

    const mdxValue = jsxToDirective(value);

    const imageUploadHandler = useCallback(
        async (file: File): Promise<string> => {
            return uploadImageToSupabase(file);
        },
        []
    );

    if (!mounted) {
        return (
            <div className="min-h-[280px] rounded-lg border border-(--color-border) bg-(--color-surface-subtle) p-4 text-sm text-(--color-muted)">
                에디터 로딩 중...
            </div>
        );
    }

    return (
        <div className="rich-markdown-editor overflow-hidden rounded-lg border border-(--color-border) [&_.mdxeditor]:!bg-(--color-surface) [&_.mdxeditor_[contenteditable]]:!min-h-[260px] [&_.mdxeditor-root]:!border-0 [&_.mdxeditor-toolbar]:!border-b [&_.mdxeditor-toolbar]:!border-(--color-border) [&_.mdxeditor-toolbar]:!bg-(--color-surface-subtle)">
            <MDXEditor
                markdown={mdxValue}
                onChange={handleChange}
                readOnly={disabled}
                placeholder={placeholder}
                contentEditableClassName="prose prose-lg max-w-none min-h-[260px] text-[var(--color-foreground)] dark:prose-invert rich-editor-prose font-sans"
                plugins={[
                    headingsPlugin(),
                    markdownShortcutPlugin(),
                    listsPlugin(),
                    quotePlugin(),
                    linkPlugin(),
                    tablePlugin(),
                    thematicBreakPlugin(),
                    imagePlugin({
                        imageUploadHandler,
                    }),
                    codeBlockPlugin({
                        defaultCodeBlockLanguage: "text",
                        codeBlockEditorDescriptors: [
                            {
                                priority: -10,
                                match: () => true,
                                Editor: CodeMirrorEditor,
                            },
                        ],
                    }),
                    codeMirrorPlugin({
                        codeBlockLanguages: {
                            text: "Plain text",
                            cpp: "C++",
                            csharp: "C#",
                            js: "JavaScript",
                            jsx: "JSX",
                            ts: "TypeScript",
                            tsx: "TSX",
                            css: "CSS",
                            json: "JSON",
                            python: "Python",
                            bash: "Bash",
                            mermaid: "Mermaid",
                            html: "HTML",
                            sql: "SQL",
                            yaml: "YAML",
                        },
                        autoLoadLanguageSupport: true,
                        codeMirrorExtensions: isDark
                            ? [basicDark]
                            : [basicLight],
                    }),
                    directivesPlugin({
                        directiveDescriptors: [
                            YoutubeDirectiveDescriptor,
                            FoliumTableDirectiveDescriptor,
                        ],
                    }),
                    diffSourcePlugin({ viewMode: "rich-text" }),
                    toolbarPlugin({
                        toolbarContents: () => (
                            <DiffSourceToggleWrapper>
                                <div className="flex flex-wrap items-center gap-1 p-2">
                                    <UndoRedo />
                                    <div className="h-5 w-px bg-(--color-border)" />
                                    <BlockTypeSelect />
                                    <BoldItalicUnderlineToggles />
                                    <ListsToggle />
                                    <div className="h-5 w-px bg-(--color-border)" />
                                    <CreateLink />
                                    <InsertImage />
                                    <InsertCodeBlock />
                                    <InsertTable />
                                    <div className="h-5 w-px bg-(--color-border)" />
                                    <InsertButtons />
                                </div>
                            </DiffSourceToggleWrapper>
                        ),
                    }),
                ]}
            />
        </div>
    );
}
