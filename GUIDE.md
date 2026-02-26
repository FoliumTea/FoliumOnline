# FoliumOnline 사용 가이드

이 문서는 저장소를 포크해서 **본인만의 이력서, 포트폴리오, 소개(About me) 페이지**를 채우려는 사용자를 위한 안내.
코드 수정이 아니라 **내용만 넣고 관리하는 방법**을 중심으로 설명함.

---

## 목차

1. [저장소 포크하기](#1-저장소-포크하기)
2. [원본(origin) 변경 사항을 내 포크에 가져오기](#2-원본origin-변경-사항을-내-포크에-가져오기)
3. [충돌(merge conflict) 해결하기](#3-충돌merge-conflict-해결하기)
4. [Pull Request 할 때 주의할 점 (base 브랜치)](#4-pull-request-할-때-주의할-점-base-브랜치)
5. [개발 서버 켜고 사이트 보기](#5-개발-서버-켜고-사이트-보기)
6. [환경 변수 설정](#6-환경-변수-설정)
7. [About me(소개) 페이지 채우기 — Admin 대시보드](#7-about-me소개-페이지-채우기--admin-대시보드)
8. [이력서(Resume) 채우기](#8-이력서resume-채우기)
9. [포트폴리오(Portfolio) 채우기](#9-포트폴리오portfolio-채우기)
10. [블로그 글 쓰기](#10-블로그-글-쓰기)
11. [커스텀 콘텐츠 블록 (folium-table, youtube)](#11-커스텀-콘텐츠-블록-folium-table-youtube)
12. [컬러 스킴 변경](#12-컬러-스킴-변경)
13. [변경 사항 배포 (게시 버튼)](#13-변경-사항-배포-게시-버튼)

---

## 1. 저장소 포크하기

**포크**란 원본 저장소(다른 사람 계정)를 그대로 복사해 **내 GitHub 계정 아래**에 새 저장소를 만드는 것.

1. GitHub에서 FoliumOnline **원본 저장소** 페이지로 감.
2. 오른쪽 상단 **Fork** 버튼 클릭.
3. "Create a fork"에서 Owner를 **내 계정**으로 두고, 저장소 이름은 그대로 두거나 원하는 대로 바꾼 뒤 **Create fork** 클릭.
4. 끝나면 내 계정 아래에 `FoliumOnline`(또는 지정한 이름) 저장소가 생김. 이게 **내 포크(fork)**.

이후 작업은 **반드시 내 포크 저장소**에서 함. 원본 저장소에 직접 푸시할 권한은 없음.

---

## 2. 원본(origin) 변경 사항을 내 포크에 가져오기

원본 저장소(예: `owner/FoliumOnline`)가 업데이트되었을 때, 그 변경 사항을 **내 포크**에도 반영하고 싶다면 아래 순서대로 함.

### 2.1 원본을 "리모트"로 추가하기 (한 번만 하면 됨)

내 컴퓨터에서 프로젝트 폴더를 연 터미널(또는 명령 프롬프트)에서:

```bash
git remote add upstream https://github.com/원본소유자/FoliumOnline.git
```

`원본소유자`는 실제 원본 저장소 주인 계정 이름으로 바꿈.
이렇게 하면 "내 포크"는 `origin`, "원본"은 `upstream`이라는 이름으로 구분됨.

### 2.2 원본 최신 내용 가져오기

```bash
git fetch upstream
```

그다음 **지금 쓰는 브랜치**(예: `main` 또는 `develop`)에 원본 내용을 합침:

```bash
git checkout main
git merge upstream/main
```

원본이 `develop` 브랜치를 메인으로 쓴다면 `upstream/main` 대신 `upstream/develop`으로 바꿈.

### 2.3 내 포크(GitHub)에도 반영하기

로컬에서 합친 뒤, 내 포크 저장소에 푸시함:

```bash
git push origin main
```

이후 GitHub에서 내 포크 페이지를 새로고침하면 원본과 동일한 최신 커밋이 반영되어 있음.

---

## 3. 충돌(merge conflict) 해결하기

`git merge upstream/main`(또는 다른 브랜치) 실행 시 **Merge conflict** 메시지가 나오면, 같은 파일을 원본과 내가 둘 다 수정했을 때 발생함.

### 3.1 충돌이 났다는 것 확인하기

터미널에 다음 같은 문구가 보임:

- `CONFLICT (content): Merge conflict in ...`
- `Automatic merge failed; fix conflicts and then commit the result.`

### 3.2 어떤 파일이 충돌했는지 보기

```bash
git status
```

"Unmerged paths" 또는 "both modified" 로 나오는 파일이 충돌한 파일.

### 3.3 파일 안에서 충돌 표시 이해하기

충돌한 파일을 열면 대략 다음처럼 표시되어 있음:

```
<<<<<<< HEAD
(내가 수정한 내용)
=======
(원본/다른 쪽에서 수정한 내용)
>>>>>>> upstream/main
```

- `<<<<<<< HEAD` ~ `=======` : **내 쪽** 내용.
- `=======` ~ `>>>>>>> upstream/main` : **가져오는 쪽**(원본) 내용.

### 3.4 해결 방법

- **내 내용만 남기기**: `<<<<<<<`, `=======`, `>>>>>>>` 줄 전체를 지우고, 남기고 싶은 본문만 둠.
- **원본 내용만 남기기**: 위와 같이 표시를 지우고, 원본 쪽 본문만 둠.
- **둘 다 살리기**: 표시를 지운 뒤, 두 내용을 합쳐서 한 덩어리로 정리함.

모든 충돌 파일에서 위 작업을 한 뒤 저장함.

### 3.5 merge 마무리하기

```bash
git add .
git commit -m "merge: upstream 변경 사항 반영, 충돌 해결"
git push origin main
```

커밋 메시지는 프로젝트의 커밋 규칙(예: `merge:` 또는 `chore:`)에 맞게 쓰면 됨.

---

## 4. Pull Request 할 때 주의할 점 (base 브랜치)

**Pull Request(PR)** 는 "내 변경 사항을 어떤 저장소의 어떤 브랜치에 반영해 달라"고 요청하는 것.

### 4.1 반드시 확인할 것

- **base 브랜치(base repository)**
  PR를 만들 때 GitHub이 "어디에 합칠까?"라고 보여주는 **대상 저장소 + 브랜치**가 있음.
- **내 포크 → 원본**으로 PR을 보낼 때만 base를 **원본 저장소의 브랜치**(예: `owner/FoliumOnline`, `develop`)로 두어야 함.
- **원본 저장소 쪽에서 base를 "내 포크"로 두면 안 됨.**
  즉, 원본 저장소에 "원본을 내 포크에 합치기" 같은 PR을 만들면 잘못된 것. 실수로 만들었다면 해당 PR은 닫음.

### 4.2 정리

- **원본에 기여할 때**: base = **원본 저장소**의 `main` 또는 `develop`, compare = **내 포크**의 해당 브랜치.
- **원본을 내 포크에 가져오는 일**은 보통 PR이 아니라, [2장](#2-원본origin-변경-사항을-내-포크에-가져오기)처럼 로컬에서 `git fetch` + `git merge` 한 뒤 `git push origin main` 으로 함.

---

## 5. 개발 서버 켜고 사이트 보기

내용을 수정한 뒤 화면에서 확인하려면 **개발 서버**를 켜야 함.

1. **Node.js**가 설치되어 있어야 함. (LTS 버전 권장.)
2. 프로젝트 폴더에서 터미널을 열고 다음을 **처음 한 번만** 실행함:

```bash
  pnpm install
```

    (없으면 `npm install -g pnpm` 으로 pnpm 설치 후 다시 실행.)

3. 개발 서버 실행:

```bash
  pnpm dev
```

4. 브라우저에서 다음 주소로 접속함:

- **사이트**: [http://localhost:4321](http://localhost:4321)
    - **Admin 대시보드(Supabase 관리)**: [http://127.0.0.1:4321/admin](http://127.0.0.1:4321/admin)

서버를 끄려면 터미널에서 `Ctrl + C` 누름.

---

## 6. 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 만들고 아래 변수를 채움. (`env.example` 파일을 복사하면 됨.)

| 변수                        | 필수 여부 | 설명                                                                         |
| --------------------------- | --------- | ---------------------------------------------------------------------------- |
| `PUBLIC_SUPABASE_URL`       | 필수      | Supabase 프로젝트 URL                                                        |
| `PUBLIC_SUPABASE_ANON_KEY`  | 필수      | Supabase 익명 키 (브라우저 런타임용)                                         |
| `SUPABASE_SERVICE_ROLE_KEY` | 빌드 필수 | Supabase 서비스 롤 키. **절대 외부 노출 금지.** 빌드 타임에만 사용됨         |
| `PUBLIC_COLOR_SCHEME`       | 선택      | 컬러 스킴 초기값 폴백: `blue` / `gray` / `beige` / `blackwhite`. 기본 `gray` |
| `PUBLIC_JOB_FIELD`          | 선택      | 노출 분야 폴백: `web` 또는 `game`. 기본 `game`                               |
| `VERCEL_DEPLOY_HOOK_URL`    | 배포 필수 | Admin "게시" 버튼 클릭 시 정적 재빌드를 트리거하는 Vercel Deploy Hook URL    |

> **참고**: 컬러 스킴과 job_field의 실제 값은 Supabase `site_config` 테이블에서 읽음. 환경 변수는 Supabase 연결이 없을 때의 폴백임.

Vercel 배포 환경에는 Vercel 프로젝트 설정의 **Environment Variables** 탭에도 동일하게 넣어야 함. (`SUPABASE_SERVICE_ROLE_KEY`는 **Preview/Production** 환경에만 추가하고 공개 저장소에 올리지 않도록 주의.)

---

## 7. About me(소개) 페이지 채우기 — Admin 대시보드

About me 페이지에 나오는 **프로필 사진, 이름, 소개 문구, 연락처, 경험/역량** 등은 Supabase의 `about_data` 테이블에 저장됨. Admin 대시보드에서 바로 편집 가능하며, **재배포 없이** 사이트에 즉시 반영됨.

### 7.1 Admin 대시보드 열기

1. `pnpm dev`로 개발 서버를 켠 상태에서 브라우저로 **[http://127.0.0.1:4321/admin](http://127.0.0.1:4321/admin)** 접속.
2. 로그인 폼에 **이메일**과 **패스워드**를 입력하고 로그인 버튼 클릭.
3. 인증에 성공하면 Admin 대시보드가 열림.

> **계정 정보**: Admin 계정은 사이트 코드가 아니라 **Supabase 프로젝트 → Authentication**에서 직접 관리함. 처음 포크할 때 미리 생성된 계정이 없으므로, 아래 7.2를 참고해 직접 만들어야 함.

### 7.2 최초 Admin 계정 만들기

Supabase Dashboard에서 직접 사용자를 추가함.

1. **[https://supabase.com/dashboard](https://supabase.com/dashboard)** 에 접속해 본인의 Supabase 프로젝트를 선택.
2. 왼쪽 메뉴에서 **Authentication** 클릭.
3. **Users** 탭 → 오른쪽 상단 **Add user** → **Create new user** 클릭.
4. **Email**과 **Password**를 입력하고 **Create user** 클릭.
    - 이메일: 본인이 쓸 이메일 주소 (예: `admin@example.com`)
    - 패스워드: 충분히 긴 패스워드 권장 (8자 이상)
5. 생성된 계정으로 `/admin/login`에 접속해 로그인하면 됨.

> **참고**: 이 계정은 사이트 방문자와는 완전히 별개. Supabase RLS 정책상 이 계정이 있어야만 Admin 대시보드의 쓰기 기능(포스트 저장, About me 저장 등)이 동작함.

### 7.3 패스워드 변경하기

Supabase Dashboard에서 언제든 변경할 수 있음.

1. **[https://supabase.com/dashboard](https://supabase.com/dashboard)** → 본인 프로젝트 선택.
2. **Authentication** → **Users** 탭.
3. 목록에서 해당 사용자를 찾아 **우측 ⋯ 메뉴(더 보기)** 클릭 → **Send password recovery** 또는 **Reset password** 선택.
    - **Send password recovery**: 해당 이메일로 패스워드 재설정 링크 발송.
    - 또는 직접 수정하려면 사용자를 클릭 → 상세 페이지에서 **Reset password** 입력 후 저장.

> **참고**: 로그인한 상태에서 패스워드를 바꾸는 기능은 현재 Admin 대시보드에 없으므로, 반드시 Supabase Dashboard를 통해서 변경해야 함.

### 7.2 About me 편집하기

- Admin 대시보드에서 **About** 또는 **소개** 메뉴로 이동함.
- 이름, 소개 문구, 연락처(이메일, GitHub, LinkedIn), 섹션별 경험/역량 항목 등을 입력·수정함.
- 저장하면 Supabase `about_data` 테이블에 즉시 반영됨.
- 사이트의 About me 페이지는 브라우저가 열릴 때 Supabase에서 실시간으로 내용을 읽어오므로, 저장 후 페이지를 새로고침하면 바로 반영됨.

---

## 8. 이력서(Resume) 채우기

이력서 페이지는 **로컬 JSON 파일**로 내용이 정해짐. Supabase를 거치지 않으며 빌드 시 정적으로 렌더링됨.

### 8.1 수정할 파일

- **한국어 이력서**: `src/data/resume.json`
- **영문 이력서**: `src/data/resume_en.json`

두 파일 구조는 같고, 언어만 다르게 채우면 됨.

### 8.2 어떤 내용을 넣는지

- **basics**: 이름, 직무 라벨, 프로필 사진 경로, 이메일, 전화번호, URL, 한 줄 요약, 주소, SNS(GitHub 등).
- **work**: 경력 (회사명, 직책, 기간, 요약, 하이라이트).
  노출 분야를 쓰려면 `jobField`에 `"web"` 또는 `"game"`을 넣음.
- **projects**: 프로젝트 (이름, 기간, 설명, 하이라이트, URL, `jobField` 등).
- **education**: 학력 (학교, 전공, 학위, 기간, 과목 등).
- **skills**, **languages**, **awards**, **certificates** 등 필요한 항목만 채우면 됨.

JSON 형식이므로 **쉼표, 따옴표, 중괄호/대괄호**를 틀리지 않게 해야 함. 저장 후 `pnpm dev`로 실행 중인 페이지에서 Resume를 새로고침해서 확인함.

> **참고**: 이력서의 **work 섹션 표시 기준(job_field)**은 Supabase `site_config` 테이블의 `job_field` 값을 빌드 타임에 읽어서 결정됨. Admin에서 `job_field`를 바꾸면 다음 빌드 때 반영됨.

---

## 9. 포트폴리오(Portfolio) 채우기

포트폴리오 콘텐츠는 Supabase `portfolio_items` 테이블에 저장됨. 빌드 타임에 가져와 정적 페이지로 렌더링되므로, 내용을 추가·수정한 뒤에는 **게시(재빌드)가 필요함**.

### 9.1 Admin 대시보드에서 추가·편집

1. **[http://127.0.0.1:4321/admin](http://127.0.0.1:4321/admin)** 접속 후 **Portfolio** 메뉴 선택.
2. **새 항목 추가** 또는 기존 항목을 클릭해 편집.
3. 제목, 설명, 기간, 역할, 팀 규모, 키워드, GitHub URL, 본문 등을 입력함.
4. **published** 토글을 켜야 사이트에 노출됨.
5. 저장 후 **게시** 버튼을 누르면 Vercel 재빌드가 트리거됨.

### 9.2 항목의 본문 형식

포트폴리오 상세 페이지의 본문은 **Markdoc** 형식으로 작성됨. 일반 마크다운(제목 `##`, 목록 `-`, 링크, 이미지 등)을 그대로 쓰면 되고, 커스텀 블록은 [11장](#11-커스텀-콘텐츠-블록-folium-table-youtube)을 참고함.

### 9.3 데이터 필드 안내

| 필드                    | 설명                                 |
| ----------------------- | ------------------------------------ |
| `title`                 | 프로젝트 제목                        |
| `description`           | 목록/카드에 표시될 짧은 설명         |
| `startDate` / `endDate` | 진행 기간 (`YYYY-MM-DD`)             |
| `goal`                  | 프로젝트 목표                        |
| `role`                  | 내 역할                              |
| `teamSize`              | 참여 인원 수                         |
| `accomplishments`       | 성과 목록                            |
| `tags` (keywords)       | 기술/키워드 태그 배열                |
| `github`                | GitHub 저장소 URL (없으면 빈 문자열) |
| `published`             | `true`여야 사이트에 노출됨           |
| `featured`              | `true`이면 랜딩 페이지에도 노출됨    |
| `jobField`              | `web` 또는 `game` (노출 필터용)      |

---

## 10. 블로그 글 쓰기

블로그 포스트는 Supabase `posts` 테이블에 저장됨. 빌드 타임에 가져와 정적 페이지로 렌더링되므로 **게시 후 재빌드가 필요함**.

### 10.1 Admin 대시보드에서 작성

1. **[http://127.0.0.1:4321/admin](http://127.0.0.1:4321/admin)** 접속 후 **Posts** 또는 **블로그** 메뉴 선택.
2. **새 글 작성** 또는 기존 글을 클릭해 편집.
3. 제목, 요약, 발행일, 카테고리, 태그, 본문을 입력함.
4. **published** 토글을 켜야 사이트에 노출됨.
5. 저장 후 **게시** 버튼을 누르면 Vercel 재빌드가 트리거됨.

태그는 Admin의 **태그** 메뉴에서 미리 등록해 두면 포스트 작성 시 slug로 선택할 수 있음.

---

## 11. 커스텀 콘텐츠 블록 (folium-table, youtube, 이미지)

포트폴리오/블로그 본문 안에서 **특별한 블록**을 삽입할 수 있음. 이 태그는 **Markdoc 문법**을 따름.

### 11.0 이미지 업로드·삽입

Admin에서 본문 편집 시 **이미지** 버튼을 누르면:

- **파일 업로드**: 로컬 이미지를 끌어다 놓거나 선택. WebP로 변환 후 Supabase Storage에 저장되어 마크다운 `![](url)` 형식으로 삽입됨.
- **URL 입력**: 이미지 URL을 붙여넣기. "URL 그대로"로 바로 삽입하거나, "Supabase에 저장"을 선택하면 fetch 후 WebP 변환·업로드(CORS 허용 시).

이미지 업로드를 사용하려면 `supabase/migrations/003_storage_images_bucket.sql`을 Supabase SQL Editor에서 먼저 실행해야 함.

### 11.1 folium-table — 스타일 있는 표

일반 마크다운 표(`|---`) 대신, 컬럼별로 색상을 지정할 수 있는 카드형 테이블.

**기본 사용법**:

```markdoc
{% folium-table
   columns="[\"항목\", \"내용\"]"
   rows="[[\"프로젝트 유형\", \"웹 서비스\"], [\"기간\", \"2024.01 ~ 2024.06\"]]"
/%}
```

**컬럼 색상 지정** (Tailwind 색상 이름 사용):

```markdoc
{% folium-table
   columns="[\"상태\", \"설명\"]"
   rows="[[\"완료\", \"배포 완료\"], [\"진행 중\", \"개발 중\"]]"
   columnHeadColors="[\"green-400\", \"\"]"
   rowColors="[\"green-200\", \"\"]"
/%}
```

| 속성                   | 설명                                   |
| ---------------------- | -------------------------------------- |
| `columns`              | 컬럼 헤더 배열 (JSON 문자열)           |
| `rows`                 | 행 데이터 2차원 배열 (JSON 문자열)     |
| `columnHeadColors`     | 헤더 배경색 (Tailwind 이름 배열, 선택) |
| `columnHeadColorsDark` | 헤더 배경색 다크모드 (선택)            |
| `rowColors`            | 셀 배경색 배열 (선택)                  |
| `rowColorsDark`        | 셀 배경색 다크모드 배열 (선택)         |

### 11.2 youtube — YouTube 영상 임베드

```markdoc
{% youtube id="VIDEO_ID" /%}
```

`VIDEO_ID`는 YouTube URL에서 `v=` 뒤의 값. 예를 들어 `https://youtu.be/k1GhTDWcO7I`라면 `k1GhTDWcO7I`.

---

## 12. 컬러 스킴 변경

사이트 전체 색상 테마는 **Admin 대시보드**에서 변경할 수 있음. 변경 즉시(재배포 없이) 모든 방문자의 화면에 적용됨.

### 12.1 변경 방법

1. Admin 대시보드 → **Site Config** 또는 **설정** 메뉴.
2. `color_scheme` 항목을 다음 중 하나로 변경:

- `blue` — 파란 톤 (슬레이트 계열)
    - `gray` — 중립 회색 (기본값)
    - `beige` — 따뜻한 베이지/스톤 톤
    - `blackwhite` — 순수 흑백

3. 저장하면 방문자가 다음 번 페이지를 열 때 새 색상이 적용됨.

> **참고**: 다크모드/라이트모드 토글은 각 방문자가 사이트 헤더의 버튼으로 조절하는 **클라이언트 설정**이며, 컬러 스킴과는 별개임.

---

## 13. 변경 사항 배포 (게시 버튼)

블로그/포트폴리오 콘텐츠는 빌드 타임에 정적 HTML로 변환되므로, **Supabase에 저장한 것만으로는 사이트에 바로 반영되지 않음**. 재빌드를 트리거해야 함.

### 13.1 게시 버튼으로 재빌드

Admin 대시보드에 있는 **게시(Publish)** 버튼을 누르면 Vercel Deploy Hook을 통해 자동으로 재빌드가 시작됨.

- 빌드가 완료되면(보통 1~3분) 변경 내용이 사이트에 반영됨.
- 빌드 상태는 Vercel 대시보드에서 확인할 수 있음.

### 13.2 게시 버튼이 동작하지 않을 때

`VERCEL_DEPLOY_HOOK_URL` 환경 변수가 올바르게 설정되어 있는지 확인함. 설정 방법:

1. Vercel 프로젝트 대시보드 → **Settings** → **Git** → **Deploy Hooks**.
2. 훅 이름을 입력하고 브랜치를 선택 후 **Create Hook** 클릭.
3. 생성된 URL을 `.env.local`과 Vercel 환경 변수에 `VERCEL_DEPLOY_HOOK_URL`로 추가.

---

## 요약

| 하고 싶은 일          | 어디서 / 어떤 파일                                                        |
| --------------------- | ------------------------------------------------------------------------- |
| 소개(About me) 채우기 | Admin 대시보드 → About 편집 → 즉시 반영                                   |
| 이력서 채우기         | `src/data/resume.json`, `src/data/resume_en.json` 편집 후 재빌드          |
| 포트폴리오 추가·수정  | Admin 대시보드 → Portfolio 편집 → 게시(재빌드)                            |
| 블로그 글 쓰기        | Admin 대시보드 → Posts 편집 → 게시(재빌드)                                |
| 태그 관리             | Admin 대시보드 → Tags 편집                                                |
| 컬러 스킴 바꾸기      | Admin 대시보드 → Site Config → `color_scheme` 값 변경 → 즉시 반영         |
| 재빌드 트리거         | Admin 대시보드 → 게시 버튼                                                |
| 원본 변경 가져오기    | `git fetch upstream` → `git merge upstream/main` → `git push origin main` |
| PR 보낼 때            | base를 **원본 저장소**로 두고, 원본을 base로 하는 PR은 만들지 않기        |

추가로 궁금한 점이 있으면 프로젝트의 README.md, CHANGES.md, docs/ 폴더 안 문서를 참고하면 됨.
