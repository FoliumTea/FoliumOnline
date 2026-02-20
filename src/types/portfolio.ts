// 포트폴리오 프로젝트 타입 정의
// 개인 연락처/이력서 정보는 제외하고 프로젝트 정보만 포함

export interface PortfolioProject {
    /** URL 경로용 슬러그 (예: /portfolio/timeout) */
    slug: string;
    /** 썸네일 이미지 URL (블록 뷰용) */
    thumbnail?: string;
    /** 프로젝트 제목 */
    title: string;
    /** 프로젝트 설명 */
    description: string;
    /** 프로젝트 시작일 (YYYY-MM-DD) */
    startDate: string;
    /** 프로젝트 종료일 (YYYY-MM-DD) */
    endDate: string;
    /** 프로젝트 목표 */
    goal: string;
    /** 내 역할 */
    role: string;
    /** 프로젝트 참여 인원 수 */
    teamSize: number;
    /** 성과/달성 사항 */
    accomplishments: string[];
    /** 기술 키워드/태그 */
    keywords: string[];
    /** GitHub 저장소 링크 */
    github: string;
    /** 공개 여부 (false면 목록·상세 페이지에 노출 안 함) */
    public: boolean;
    /** 블록 뷰용 보조 문구 (예: "STOVE 스토어 출시", "BIC 루키 선정") */
    badges?: { text: string }[];
}

export interface Portfolio {
    projects: PortfolioProject[];
}
