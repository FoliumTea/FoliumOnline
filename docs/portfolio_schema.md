# 포트폴리오 스키마 (Markdoc)

포트폴리오는 `src/content/portfolio/*.mdoc` 콘텐츠 컬렉션으로 관리됩니다.  
프론트매터 스키마는 `src/content/config.ts`의 `portfolio` 컬렉션에 정의되어 있습니다.

## 파일 위치

- **목록/상세 데이터**: `src/content/portfolio/<slug>.mdoc` (파일명이 URL 슬러그가 됨)
- **스키마 정의**: `src/content/config.ts` → `collections.portfolio`

## 프론트매터 필드

| 필드            | 타입               | 필수 | 설명                                     |
| --------------- | ------------------ | ---- | ---------------------------------------- |
| title           | string             | ✓    | 프로젝트 제목                            |
| description     | string             | ✓    | 프로젝트 설명                            |
| startDate       | string             | ✓    | 시작일 (YYYY-MM-DD)                      |
| endDate         | string             | ✓    | 종료일 (YYYY-MM-DD)                      |
| goal            | string             | ✓    | 프로젝트 목표                            |
| role            | string             | ✓    | 내 역할                                  |
| teamSize        | number             | ✓    | 참여 인원 (≥1)                           |
| accomplishments | string[]           | ✓    | 성과/달성 사항                           |
| keywords        | string[]           | ✓    | 기술 키워드/태그                         |
| github          | string             | ✓    | GitHub 저장소 URL (없으면 `""`)          |
| public          | boolean            | ✓    | 공개 여부 (false면 목록/상세 비노출)     |
| jobField        | "web" \| "game"    |      | 노출 분야 (비면 PUBLIC_JOB_FIELD와 무관) |
| thumbnail       | string             |      | 썸네일 이미지 URL                        |
| badges          | { text: string }[] |      | 블록 뷰용 보조 문구 (예: 수상·출시)      |

## 본문

`---` 프론트매터 아래에는 Markdoc 문법으로 상세 본문을 작성할 수 있습니다.  
(헤딩, 목록, 강조, 링크 등) 상세 페이지 하단에 렌더링됩니다.
