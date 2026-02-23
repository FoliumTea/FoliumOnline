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

| 데이터     | 경로                           | 스키마                                                                 |
| ---------- | ------------------------------ | ---------------------------------------------------------------------- |
| 포트폴리오 | `src/content/portfolio/*.mdoc` | `src/content/config.ts` (portfolio 컬렉션), `docs/portfolio_schema.md` |
| 이력서     | `src/data/resume.json`         | [JSON Resume](https://docs.jsonresume.org/schema)                      |

## 환경 변수

`env.example`을 `.env.local`로 복사 후 설정.

| 변수                       | 설명                                                                   |
| -------------------------- | ---------------------------------------------------------------------- |
| `PUBLIC_SUPABASE_URL`      | Supabase 프로젝트 URL                                                  |
| `PUBLIC_SUPABASE_ANON_KEY` | Supabase 익명 키                                                       |
| `PUBLIC_COLOR_SCHEME`      | 사이트 컬러 스킴: `blue`, `gray`, `beige`, `blackwhite`. 기본값 `gray` |
| `PUBLIC_JOB_FIELD`         | 포트폴리오·이력서 노출 분야: `web` 또는 `game`. 기본값 `game`          |

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
