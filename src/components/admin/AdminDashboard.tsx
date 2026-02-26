/**
 * AdminDashboard
 *
 * 어드민 대시보드 메인 컴포넌트.
 * 사이드바 탭으로 각 관리 섹션을 전환한다:
 *   - 포스트: 블로그 글 CRUD
 *   - 포트폴리오: 포트폴리오 아이템 CRUD
 *   - About: about_data 편집 및 Supabase 저장
 *   - 사이트 설정: 컬러 스킴 등 site_config 관리 + 빌드 트리거
 *
 * 로그아웃 버튼은 헤더에 위치한다.
 */
import { useState } from "react";
import { browserClient } from "@/lib/supabase";
import PostsPanel from "@/components/admin/panels/PostsPanel";
import PortfolioPanel from "@/components/admin/panels/PortfolioPanel";
import TagsPanel from "@/components/admin/panels/TagsPanel";
import AboutPanel from "@/components/admin/panels/AboutPanel";
import SiteConfigPanel from "@/components/admin/panels/SiteConfigPanel";

// 탭 정의
const TABS = [
    { id: "posts", label: "포스트", icon: "📝" },
    { id: "portfolio", label: "포트폴리오", icon: "🗂️" },
    { id: "tags", label: "태그", icon: "🏷️" },
    { id: "about", label: "About", icon: "👤" },
    { id: "config", label: "사이트 설정", icon: "⚙️" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState<TabId>("posts");

    /** 로그아웃 처리 */
    const handleLogout = async () => {
        if (!browserClient) return;
        await browserClient.auth.signOut();
        window.location.href = "/admin/login";
    };

    return (
        <div className="min-h-screen flex flex-col">
            {/* 헤더 */}
            <header className="border-b border-(--color-border) bg-(--color-surface) px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <a
                        href="/"
                        className="text-sm font-medium text-(--color-muted) hover:text-(--color-foreground) transition-colors"
                    >
                        ← 사이트
                    </a>
                    <span className="text-(--color-border)">|</span>
                    <span className="text-sm font-bold text-(--color-foreground)">
                        Admin Dashboard
                    </span>
                </div>
                <button
                    onClick={handleLogout}
                    className="text-sm text-(--color-muted) hover:text-red-500 transition-colors px-3 py-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-950/30"
                >
                    로그아웃
                </button>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* 사이드바 탭 */}
                <nav className="w-48 border-r border-(--color-border) bg-(--color-surface-subtle) flex flex-col py-4 gap-1 px-2 shrink-0">
                    {TABS.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={[
                                "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-left transition-colors",
                                activeTab === tab.id
                                    ? "bg-(--color-accent) text-(--color-on-accent)"
                                    : "text-(--color-muted) hover:bg-(--color-border) hover:text-(--color-foreground)",
                            ].join(" ")}
                        >
                            <span>{tab.icon}</span>
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </nav>

                {/* 패널 영역 */}
                <main className="flex-1 overflow-y-auto p-6">
                    {activeTab === "posts" && <PostsPanel />}
                    {activeTab === "portfolio" && <PortfolioPanel />}
                    {activeTab === "tags" && <TagsPanel />}
                    {activeTab === "about" && <AboutPanel />}
                    {activeTab === "config" && <SiteConfigPanel />}
                </main>
            </div>
        </div>
    );
}
