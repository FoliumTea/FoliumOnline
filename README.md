# FoliumOnline

포트폴리오 + 기술 블로그 웹사이트. Astro 5, Tailwind 4, Keystatic, Supabase 기반.

## 기술 스택

- **Frontend**: Astro 5+
- **Backend**: Supabase (포트폴리오 JSON, 블로그 마크다운 저장)
- **CMS**: Keystatic (블로그 포스트 전용)
- **Styling**: Tailwind CSS 4+
- **Language**: TypeScript
- **Git**: Husky (pre-commit format check)
- **Format**: Prettier
- **Package manager**: pnpm

## pnpm 설치

Node.js LTS(v20 이상 권장)가 설치되어 있다면:

**방법 1: npm으로 전역 설치 (권장)**

```bash
npm install -g pnpm@latest
```

**방법 2: Corepack 사용 (Node 16.9+)**

```bash
corepack enable
corepack prepare pnpm@latest --activate
```

**방법 3: Windows PowerShell**

```powershell
iwr https://get.pnpm.io/install.ps1 -useb | iex
```

설치 확인: `pnpm --version`

## 시작하기

```bash
pnpm install
pnpm dev
```

- 사이트: http://localhost:4321
- Keystatic Admin (개발용): http://127.0.0.1:4321/keystatic

## 스크립트

| 스크립트            | 설명                                                            |
| ------------------- | --------------------------------------------------------------- |
| `pnpm dev`          | 개발 서버 실행                                                  |
| `pnpm build`        | 프로덕션 빌드                                                   |
| `pnpm preview`      | 빌드 결과 미리보기                                              |
| `pnpm format`       | Prettier로 전체 포맷                                            |
| `pnpm format:check` | 포맷 검사만 (CI/ pre-commit용)                                  |
| `pnpm git-refresh`  | 스테이징 해제, 캐시 삭제 후 git add (새/변경된 .gitignore 반영) |
| `pnpm reinstall`    | node_modules 삭제 후 깨끗한 재설치                              |
| `pnpm upgrade-all`  | 모든 패키지 최신 버전으로 업데이트                              |

## 데이터 소스

| 데이터     | 경로                      | 스키마                                                                               |
| ---------- | ------------------------- | ------------------------------------------------------------------------------------ |
| 포트폴리오 | `src/data/portfolio.json` | `PORTFOLIO_SCHEMA.md`                                                                |
| 이력서     | `src/data/resume.json`    | [JSON Resume](https://docs.jsonresume.org/schema). 3가지 네이티브 HTML 레이아웃 제공 |

## 환경 변수

`env.example`을 `.env.local`로 복사 후 설정.

| 변수                       | 설명                                                                   |
| -------------------------- | ---------------------------------------------------------------------- |
| `PUBLIC_SUPABASE_URL`      | Supabase 프로젝트 URL                                                  |
| `PUBLIC_SUPABASE_ANON_KEY` | Supabase 익명 키                                                       |
| `PUBLIC_COLOR_SCHEME`      | 사이트 컬러 스킴: `blue`, `gray`, `beige`, `blackwhite`. 기본값 `gray` |
