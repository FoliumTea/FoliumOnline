# 포트폴리오 JSON 스키마

`src/data/portfolio.json` 구조 정의. 개인 연락처·이력서 정보는 제외.

## 구조

```json
{
    "projects": [
        {
            "title": "string (프로젝트 제목)",
            "description": "string (프로젝트 설명)",
            "startDate": "string YYYY-MM-DD",
            "endDate": "string YYYY-MM-DD",
            "goal": "string (프로젝트 목표)",
            "role": "string (내 역할)",
            "teamSize": "integer ≥1 (참여 인원)",
            "accomplishments": ["string (성과)"],
            "keywords": ["string (기술 키워드)"],
            "github": "string (GitHub 저장소 URL)"
        }
    ]
}
```

## 필드

| 필드                       | 타입         | 필수 | 설명                |
| -------------------------- | ------------ | ---- | ------------------- |
| projects                   | array        | ✓    | 프로젝트 목록       |
| projects[].title           | string       | ✓    | 프로젝트 제목       |
| projects[].description     | string       | ✓    | 프로젝트 설명       |
| projects[].startDate       | string       | ✓    | 시작일 (YYYY-MM-DD) |
| projects[].endDate         | string       | ✓    | 종료일 (YYYY-MM-DD) |
| projects[].goal            | string       | ✓    | 프로젝트 목표       |
| projects[].role            | string       | ✓    | 내 역할             |
| projects[].teamSize        | integer      | ✓    | 참여 인원 (≥1)      |
| projects[].accomplishments | string[]     | ✓    | 성과/달성 사항      |
| projects[].keywords        | string[]     | ✓    | 기술 키워드/태그    |
| projects[].github          | string (URI) | ✓    | GitHub 저장소 링크  |
