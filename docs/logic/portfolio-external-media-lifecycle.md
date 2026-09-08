# Portfolio 외부 미디어 수명주기

## 관리 경계

- Admin 편집기 관리 경로: `portfolio/<slug>/`
- 편집기 동작: 현재 본문·thumbnail·snapshot에서 참조되지 않는 파일을 orphan으로 정리
- 외부 MCP 작업의 위험: 이전 본문을 연 Admin 정리 작업과 신규 업로드 시점의 경쟁

## 외부 미디어 추가 규칙

- Admin 밖에서 준비한 미디어: `portfolio/<slug>-media/` 격리 경로 사용
- 파일 이름: content hash 포함
- 본문 저장: 로컬 MCP `update_portfolio_item` 사용
- 저장 직전 원격 Portfolio 레코드 백업
- 저장 후 검증:
    - DB의 최종 URL 일치
    - R2 즉시 readback
    - 30초 지연 readback
    - 공개 페이지 이미지 자연 크기 확인
    - video `duration`, `readyState`, 실제 재생 시간 진행 확인

## 금지 패턴

- Admin 편집기 관리 경로에 파일을 먼저 올린 뒤 나중에 본문 참조 추가
- 업로드 직후 한 번의 HTTP 응답만으로 완료 판정
- video poster와 원본 video 중 한쪽만 검증
- 기존 실패 URL 재사용

## DMC5 복구 사례

- 증상: production HTML에 URL 존재, R2 객체는 404
- 복구: `portfolio/dmc5-media/`에 AnimMontage·H.264/AAC faststart MP4·poster 재업로드
- 결과: 이미지 `2000×864`, video `readyState 4`, 4.97초 재생과 시간 진행 확인
