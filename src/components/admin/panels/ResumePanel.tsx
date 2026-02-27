/**
 * ResumePanel
 *
 * resume_data 테이블 (lang='ko')에서 이력서 데이터를 불러와 편집하고
 * Supabase에 저장한다.
 */
import { useEffect, useState } from "react";
import { browserClient } from "@/lib/supabase";
import { uploadImageToSupabase } from "@/lib/image-upload";
import type { Resume } from "@/types/resume";

export default function ResumePanel() {
    const [resumeData, setResumeData] = useState<Resume | null>(null);
    const [jsonInput, setJsonInput] = useState("");
    const [rowId, setRowId] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [status, setStatus] = useState<{
        type: "error" | "success";
        msg: string;
    } | null>(null);

    // Supabase에서 기존 resume 데이터 로드
    useEffect(() => {
        if (!browserClient) return;
        browserClient
            .from("resume_data")
            .select("id, data")
            .eq("lang", "ko")
            .limit(1)
            .single()
            .then(({ data: row, error }) => {
                if (error || !row) {
                    // 기본 템플릿 로드
                    const defaultResume: Resume = {
                        basics: { name: "", label: "", image: "", summary: "" },
                        work: [],
                        projects: [],
                        education: [],
                        skills: [],
                        languages: [],
                    };
                    setResumeData(defaultResume);
                    setJsonInput(JSON.stringify(defaultResume, null, 2));
                    return;
                }
                const d = row.data as Resume;
                setRowId(row.id);
                setResumeData(d);
                setJsonInput(JSON.stringify(d, null, 2));
            });
    }, []);

    const handleSave = async () => {
        if (!browserClient) return;
        setSaving(true);
        setStatus(null);

        try {
            const parsedData = JSON.parse(jsonInput) as Resume;

            let err;
            if (rowId) {
                const res = await browserClient
                    .from("resume_data")
                    .update({ data: parsedData as any })
                    .eq("id", rowId);
                err = res.error;
            } else {
                const res = await browserClient
                    .from("resume_data")
                    .insert({ lang: "ko", data: parsedData as any })
                    .select("id")
                    .single();
                err = res.error;
                if (res.data) setRowId(res.data.id);
            }

            if (err) throw err;
            setResumeData(parsedData);
            setStatus({
                type: "success",
                msg: "저장됐습니다. 이력서 페이지에 즉시 반영됩니다.",
            });
        } catch (e: any) {
            setStatus({
                type: "error",
                msg: `저장 실패: ${e.message}`,
            });
        } finally {
            setSaving(false);
        }
    };

    const handleImageUpload = async (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            setStatus({
                type: "error",
                msg: "이미지 파일만 업로드 가능합니다.",
            });
            return;
        }

        setUploadingImage(true);
        setStatus(null);
        try {
            const url = await uploadImageToSupabase(file);

            // JSON Editor 데이터 업데이트
            try {
                const parsedData = JSON.parse(jsonInput) as Resume;
                if (!parsedData.basics) parsedData.basics = {};
                parsedData.basics.image = url;
                const newJson = JSON.stringify(parsedData, null, 2);
                setJsonInput(newJson);
                setResumeData(parsedData);
                setStatus({
                    type: "success",
                    msg: "이미지가 업로드되어 JSON에 반영되었습니다.",
                });
            } catch (jsonErr) {
                setStatus({
                    type: "error",
                    msg: "이미지는 업로드되었으나 JSON 파싱에 실패하여 적용되지 않았습니다.",
                });
            }
        } catch (err: any) {
            setStatus({
                type: "error",
                msg: `이미지 업로드 실패: ${err.message}`,
            });
        } finally {
            setUploadingImage(false);
            // Reset input
            e.target.value = "";
        }
    };

    return (
        <div className="flex h-full max-w-4xl flex-col space-y-8">
            <h2 className="text-2xl font-bold text-(--color-foreground)">
                이력서 편집
            </h2>

            {/* 프로필 이미지 업로드 */}
            <section className="space-y-3">
                <h3 className="text-lg font-semibold text-(--color-foreground)">
                    프로필 사진 업데이트
                </h3>
                <div className="flex items-center gap-4">
                    {resumeData?.basics?.image && (
                        <img
                            src={resumeData.basics.image}
                            alt="Profile"
                            className="h-16 w-16 rounded-full border border-(--color-border) object-cover"
                        />
                    )}
                    <div>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            disabled={uploadingImage}
                            className="block w-full cursor-pointer text-base text-(--color-foreground) file:mr-4 file:rounded-lg file:border-0 file:bg-(--color-accent) file:px-4 file:py-2 file:text-base file:font-semibold file:text-(--color-on-accent) hover:file:bg-(--color-accent)/90 disabled:opacity-50"
                        />
                        <p className="mt-1 text-sm text-(--color-muted)">
                            이미지를 선택하면 WebP로 자동 변환되어 저장되며 배열
                            안의 basics.image 경로가 업데이트됩니다.
                        </p>
                    </div>
                </div>
            </section>

            {/* Resume JSON Editor */}
            <section className="flex h-full flex-1 flex-col space-y-3">
                <h3 className="text-lg font-semibold text-(--color-foreground)">
                    이력서 데이터 (JSON)
                </h3>
                <p className="text-sm text-(--color-muted)">
                    JSON 형태로 이력서를 수정하세요.
                </p>
                <textarea
                    value={jsonInput}
                    onChange={(e) => setJsonInput(e.target.value)}
                    className="h-96 w-full resize-y rounded-lg border border-(--color-border) bg-(--color-surface) p-4 font-mono text-sm leading-relaxed text-(--color-foreground) focus:ring-2 focus:ring-(--color-accent)/40 focus:outline-none"
                    spellCheck={false}
                />
            </section>

            {/* 피드백 + 저장 */}
            {status && (
                <p
                    className={`rounded-lg px-3 py-2 text-base ${
                        status.type === "error"
                            ? "bg-red-50 text-red-500 dark:bg-red-950/30"
                            : "bg-green-50 text-green-600 dark:bg-green-950/30"
                    }`}
                >
                    {status.msg}
                </p>
            )}
            <div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="rounded-lg bg-(--color-accent) px-6 py-2.5 text-base font-semibold text-(--color-on-accent) transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                    {saving ? "저장 중..." : "Supabase에 저장"}
                </button>
            </div>
        </div>
    );
}
