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
import { markdocToMdx, mdxToMarkdoc } from "@/lib/markdoc-mdx-converter";
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
                    <div className="flex min-h-[180px] items-center justify-center rounded-lg border border-dashed border-(--color-border) bg-(--color-surface-subtle) text-(--color-muted) text-sm">
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

function InsertYoutubeButton() {
    const insertDirective = usePublisher(insertDirective$);

    const handleClick = () => {
        const url = window.prompt("YouTube URL 또는 Video ID를 입력하세요:");
        if (!url?.trim()) return;
        let id = url.trim();
        try {
            const parsed = new URL(id);
            id =
                parsed.searchParams.get("v") ||
                parsed.pathname.split("/").pop() ||
                id;
        } catch {
            // Assume it's already an ID
        }
        if (id) {
            insertDirective({
                type: "leafDirective",
                name: "youtube",
                attributes: { id },
                children: [],
            } as any);
        }
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            className="px-2 py-1 rounded text-sm font-medium border border-(--color-border) text-(--color-foreground) hover:bg-(--color-surface-subtle) hover:border-(--color-accent) hover:text-(--color-accent) transition-colors"
        >
            ▶ YouTube
        </button>
    );
}

function InsertFoliumTableButton() {
    const insertDirective = usePublisher(insertDirective$);

    const handleClick = () => {
        const columns = window.prompt("컬럼 (쉼표 구분):", "항목, 내용");
        if (!columns?.trim()) return;
        const rows = window.prompt(
            "행 데이터 (한 줄에 한 행, 셀은 | 구분):",
            "값1 | 값2"
        );
        const cols = columns
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
        const rowData = (rows || "")
            .split("\n")
            .filter((l) => l.trim())
            .map((line) =>
                line
                    .split("|")
                    .map((c) => c.trim())
                    .slice(0, cols.length)
            );
        const columnsJson = JSON.stringify(cols);
        const rowsJson = JSON.stringify(
            rowData.length ? rowData : [cols.map(() => "")]
        );

        insertDirective({
            type: "leafDirective",
            name: "folium-table",
            attributes: {
                columns: columnsJson,
                rows: rowsJson,
            },
            children: [],
        } as any);
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            className="px-2 py-1 rounded text-sm font-medium border border-(--color-border) text-(--color-foreground) hover:bg-(--color-surface-subtle) hover:border-(--color-accent) hover:text-(--color-accent) transition-colors"
        >
            📋 Folium Table
        </button>
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
            const markdoc = mdxToMarkdoc(mdxMarkdown);
            onChange(markdoc);
        },
        [onChange]
    );

    const mdxValue = markdocToMdx(value);

    const imageUploadHandler = useCallback(
        async (file: File): Promise<string> => {
            return uploadImageToSupabase(file);
        },
        []
    );

    if (!mounted) {
        return (
            <div className="min-h-[280px] rounded-lg border border-(--color-border) bg-(--color-surface-subtle) p-4 text-(--color-muted) text-sm">
                에디터 로딩 중...
            </div>
        );
    }

    return (
        <div className="rich-markdown-editor rounded-lg border border-(--color-border) overflow-hidden [&_.mdxeditor]:!bg-(--color-surface) [&_.mdxeditor-root]:!border-0 [&_.mdxeditor-toolbar]:!bg-(--color-surface-subtle) [&_.mdxeditor-toolbar]:!border-b [&_.mdxeditor-toolbar]:!border-(--color-border) [&_.mdxeditor_[contenteditable]]:!min-h-[260px]">
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
                                    <div className="w-px h-5 bg-(--color-border)" />
                                    <BlockTypeSelect />
                                    <BoldItalicUnderlineToggles />
                                    <ListsToggle />
                                    <div className="w-px h-5 bg-(--color-border)" />
                                    <CreateLink />
                                    <InsertImage />
                                    <InsertCodeBlock />
                                    <InsertTable />
                                    <div className="w-px h-5 bg-(--color-border)" />
                                    <InsertYoutubeButton />
                                    <InsertFoliumTableButton />
                                </div>
                            </DiffSourceToggleWrapper>
                        ),
                    }),
                ]}
            />
        </div>
    );
}
