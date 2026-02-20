/**
 * Resume 뷰어 컴포넌트: 3가지 레이아웃 선택 가능
 */
import { useState, useEffect } from "react";
import type { Resume } from "@/types/resume";

interface Props {
    resume: Resume;
}

type ResumeLayout = "classic" | "modern" | "minimal";

export default function ResumeView({ resume }: Props) {
    const [layout, setLayout] = useState<ResumeLayout>("classic");

    useEffect(() => {
        // 모든 레이아웃 숨기기
        const containers = document.querySelectorAll(".resume-layout");
        containers.forEach((container) => {
            container.classList.add("hidden");
        });

        // 선택된 레이아웃만 표시
        const activeContainer = document.getElementById(
            `resume-${layout}-container`
        );
        if (activeContainer) {
            activeContainer.classList.remove("hidden");
        }
    }, [layout]);

    return (
        <div className="resume-viewer">
            <div className="resume-layout-selector">
                <button
                    onClick={() => setLayout("classic")}
                    className={layout === "classic" ? "active" : ""}
                    type="button"
                >
                    Classic
                </button>
                <button
                    onClick={() => setLayout("modern")}
                    className={layout === "modern" ? "active" : ""}
                    type="button"
                >
                    Modern
                </button>
                <button
                    onClick={() => setLayout("minimal")}
                    className={layout === "minimal" ? "active" : ""}
                    type="button"
                >
                    Minimal
                </button>
            </div>
        </div>
    );
}
