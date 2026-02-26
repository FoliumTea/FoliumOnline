# FoliumOnline

포트폴리오 + 기술 블로그 웹사이트. Astro 5 정적 출력 + Supabase 런타임/빌드타임 하이브리드 아키텍처.

## 기술 스택

- **Frontend**: Astro 5+ (output: static)
- **UI 라이브러리**: React 19 (클라이언트 Islands)
- **데이터 스토어**: Supabase (PostgreSQL + RLS)
- **Styling**: Tailwind CSS 4+, @tailwindcss/typography
- **마크다운 렌더링**: @markdoc/markdoc + @shikijs/rehype (Shiki 구문 강조)
- **Language**: TypeScript
- **Git hooks**: Husky (pre-commit format check)
- **Format**: Prettier
- **Package manager**: pnpm

## 아키텍처 개요

정적 사이트(SEO 우선)와 런타임 업데이트(재배포 없이 내용 변경 가능)를 동시에 지원하는 **하이브리드 모델**을 사용함.

| 데이터             | 렌더링 방식           | 소스                              |
| ------------------ | --------------------- | --------------------------------- |
| 블로그 포스트 본문 | 빌드 타임 (정적)      | Supabase `posts` 테이블           |
| 포트폴리오 상세    | 빌드 타임 (정적)      | Supabase `portfolio_items` 테이블 |
| About me 프로필    | 런타임 (React island) | Supabase `about_data` 테이블      |
| 컬러 스킴          | 런타임 (React island) | Supabase `site_config` 테이블     |
| 이력서             | 빌드 타임 (정적)      | `src/data/resume.json`            |
| `job_field` 설정   | 빌드 타임             | Supabase `site_config` → env 폴백 |

블로그/포트폴리오는 Vercel Deploy Hook으로 Admin에서 "게시" 버튼을 누르면 정적 재빌드가 트리거됨.

## 콘텐츠 형식

본문 콘텐츠는 **Markdoc** 형식으로 Supabase에 저장됨. 표준 마크다운 외에 다음 커스텀 태그를 지원함.

```markdoc
{% folium-table
   columns="[\"항목\", \"내용\"]"
   rows="[[\"행1열1\", \"행1열2\"]]"
/%}

{% youtube id="VIDEO_ID" /%}
```

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
- Admin 대시보드 (Supabase 관리): http://127.0.0.1:4321/admin

## 환경 변수

`env.example`을 `.env.local`로 복사 후 설정.

| 변수                        | 설명                                                                                                                           |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `PUBLIC_SUPABASE_URL`       | Supabase 프로젝트 URL                                                                                                          |
| `PUBLIC_SUPABASE_ANON_KEY`  | Supabase 익명 키 (브라우저 런타임용, RLS 적용)                                                                                 |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase 서비스 롤 키 (빌드 타임 전용, 절대 클라이언트에 노출 금지)                                                            |
| `PUBLIC_COLOR_SCHEME`       | 컬러 스킴 초기값 폴백: `blue`, `gray`, `beige`, `blackwhite`. 기본값 `gray` (실제 값은 Supabase `site_config`에서 런타임 우선) |
| `PUBLIC_JOB_FIELD`          | 포트폴리오·이력서 노출 분야 폴백: `web` 또는 `game`. 기본값 `game` (실제 값은 Supabase `site_config`에서 빌드타임 우선)        |
| `VERCEL_DEPLOY_HOOK_URL`    | Admin에서 "게시" 버튼 클릭 시 정적 재빌드를 트리거하는 Vercel Deploy Hook URL                                                  |

## 스크립트

| 스크립트            | 설명                                                            |
| ------------------- | --------------------------------------------------------------- |
| `pnpm dev`          | 개발 서버 실행                                                  |
| `pnpm build`        | 프로덕션 빌드                                                   |
| `pnpm preview`      | 빌드 결과 미리보기                                              |
| `pnpm format`       | Prettier로 전체 포맷                                            |
| `pnpm format:check` | 포맷 검사만 (CI / pre-commit용)                                 |
| `pnpm git-refresh`  | 스테이징 해제, 캐시 삭제 후 git add (새/변경된 .gitignore 반영) |
| `pnpm reinstall`    | node_modules 삭제 후 깨끗한 재설치                              |
| `pnpm upgrade-all`  | 모든 패키지 최신 버전으로 업데이트                              |
| `pnpm migrate`      | 로컬 콘텐츠 파일을 Supabase DB로 마이그레이션                   |

## 주요 라이브러리

| 패키지                     | 역할                                                     |
| -------------------------- | -------------------------------------------------------- |
| `@markdoc/markdoc`         | Markdoc 파싱 + 커스텀 태그(folium-table, youtube) 렌더링 |
| `@shikijs/rehype`          | 코드 블록 구문 강조 (라이트/다크 듀얼 테마)              |
| `rehype-parse`             | Markdoc HTML 출력을 hast로 변환 (Shiki 후처리용)         |
| `rehype-slug`              | 헤딩에 ID 자동 부여                                      |
| `rehype-autolink-headings` | 헤딩 앵커 링크 자동 생성                                 |
| `@supabase/supabase-js`    | Supabase 클라이언트 (서버/브라우저 분리)                 |

## Supabase 테이블 구조

| 테이블            | 주요 컬럼                                                           | 용도                              |
| ----------------- | ------------------------------------------------------------------- | --------------------------------- |
| `site_config`     | `key`, `value`                                                      | 컬러 스킴, job_field 등 전역 설정 |
| `about_data`      | JSON 구조                                                           | About me 프로필 (런타임 fetch)    |
| `posts`           | `slug`, `title`, `content`, `published`, `tags`, `pub_date`         | 블로그 포스트                     |
| `portfolio_items` | `slug`, `title`, `content`, `published`, `tags`, `data`, `featured` | 포트폴리오 프로젝트               |
| `tags`            | `slug`, `name`, `color`                                             | 블로그 태그 표시명·색상           |

태그 테이블 생성: `supabase/migrations/002_tags_table.sql`을 Supabase SQL Editor에서 실행.

## upstream(FoliumOnline)과 동기화

이 저장소는 [FoliumTea/FoliumOnline](https://github.com/FoliumTea/FoliumOnline)의 fork임.

**평소에는 GitHub 저장소 페이지에서 "Sync fork" → "Update branch"를 누르면 됨.**
충돌이 나거나 로컬에서 한 번에 처리하고 싶을 때만 아래처럼 터미널에서 진행하면 됨.

### 1. upstream 원격 추가 (최초 1회)

```bash
git remote add upstream https://github.com/FoliumTea/FoliumOnline.git
```

이미 추가돼 있으면 생략. 확인: `git remote -v`

### 2. upstream에서 가져오기 및 병합

```bash
git fetch upstream
git merge upstream/main
```

- `upstream/main`을 현재 브랜치(보통 `main`)에 병합함.
- 충돌이 없으면 자동으로 merge commit이 생성됨.

### 3. 병합 충돌이 났을 때 (직접 해결)

`git merge upstream/main` 실행 후 충돌이 나면:

1. **충돌 파일 확인**

    ```bash
    git status
    ```

    - `Unmerged paths` / `both modified` 등으로 표시된 파일을 수정하면 됨.

2. **파일별로 충돌 해결**
    - 해당 파일을 열어 `<<<<<<< HEAD`, `=======`, `>>>>>>> upstream/main` 마커를 찾고, 남길 내용만 남기고 마커 전부 삭제함.
    - **삭제 충돌**(`deleted by them` 등): upstream에서 삭제했고 로컬에서 수정한 경우, 삭제를 따를지 로컬 버전을 유지할지 결정한 뒤
        - 삭제를 따르려면: `git rm <파일경로>`
        - 로컬 버전을 유지하려면: `git add <파일경로>`

3. **해결한 파일 스테이징 후 병합 완료**

    ```bash
    git add <해결한 파일들>
    git commit
    ```

    - commit 메시지는 기본으로 merge 메시지가 채워져 있음.

4. **병합을 취소하고 처음부터 다시 하려면**

    ```bash
    git merge --abort
    ```

    - 작업 트리가 merge 이전 상태로 돌아감.
