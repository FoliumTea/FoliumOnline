# Admin Portfolio 스크롤 계약

## 증상

- AI 프로젝트 선택기가 Published 프로젝트 전체를 항상 펼친 상태로 표시
- AI 설정 높이 증가에 따라 Portfolio 목록의 시작 위치가 화면 아래로 이동
- 설정과 목록이 서로 다른 레이아웃 경계에 놓여 목록 접근 불가

## 원인

- `PortfolioPanel`의 바깥 컨테이너: `overflow-hidden`
- 단일 스크롤 수정 과정에서 `portfolio-panel-scroll` 닫는 태그를 AI 설정 직후에 배치
- 실제 Portfolio 목록: 스크롤 컨테이너 밖의 잘리는 영역에 잔류
- AI 선택기: 모든 Published 프로젝트 버튼을 기본 노출하여 초기 화면 높이 확대

## 해결

- 상단 `포트폴리오`·`도서` 탭만 스크롤 컨테이너 밖에 유지
- 목록 디자인·AI 설정·필터·Featured 순서·Portfolio 목록 전체를 `portfolio-panel-scroll` 안에 배치
- Portfolio 목록 전용 세로 스크롤 제거
- AI 선택기 기본 상태: 선택된 프로젝트 요약만 표시
- 전체 Published 프로젝트 선택 목록: 사용자가 펼치는 `details` 안에 표시
- 선택 목록 내부 높이 제한과 별도 세로 스크롤 없음

## 재발 방지

- `PortfolioPanel` 목록 화면의 세로 스크롤 소유자: `portfolio-panel-scroll` 정확히 1개
- `portfolio-panel-tabs`: 스크롤 소유자 밖의 고정 형제 요소
- AI 설정·필터·목록 추가 시 `portfolio-panel-scroll` 내부 배치
- 목록이나 AI 선택기에 `overflow-y-auto`, `max-h-*` 추가 금지
- 인증 E2E 확인 항목:
    - 스크롤 가능한 본문 1개
    - 본문 이동 뒤 탭 위치 유지
    - Portfolio 목록 접근 가능
    - AI 선택기 접기·펼치기 가능
