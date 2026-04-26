# HANDOFF: 제주도 가족여행 대시보드

- updated_at: 2026-04-27
- from_agent: codex-worker
- to_agent: supabase-backend-or-qa-worker
- role: backend sync follow-up
- status: pages-redeploy-complete-itinerary-upgraded

## Objective
제주도 가족여행 React/Vite 앱의 배포 화면 출력 문제를 해결하고, 실제 휴대폰에서 보기 편한 시간 단위 가족여행 계획서로 업그레이드한다.

## What Changed
- `src/data/tripData.js`
  - 기본 데이터 버전을 `2.5`로 올렸다.
  - 렌터카 카시트 정보를 `업체 제공 없음 · 휴대용 카시트/유모차 직접 지참`으로 정정했다.
  - 1일차부터 6일차까지 촘촘한 시간 단위 일정 `timeBlocks`를 추가했다.
  - 우도, 성산 갈치조림, 성산일출봉 무료구역, 섭지코지, 천지연/천제연/주상절리, 마라도, 송악산, 산방산/오설록, 금오름, 협재, 용출횟집, 렌터카 반납 동선을 반영했다.
  - 숙소 링크 `https://naver.me/Fz8IE7Gz`와 갈치조림 링크 `https://naver.me/xRhliwC7`를 반영했다.
- `src/components/Sections.jsx`
  - 상단 여행 달력 컴포넌트 `DayCalendarSection`을 추가했다.
  - 기존 탭형 일정표를 전체 스크롤형 모바일 타임라인으로 교체했다.
  - 일정 블록별 시간, 상태, 분류, 장소, 메모, 지도/링크 액션을 표시한다.
- `src/App.jsx`
  - 날짜 해시 이동 시 sticky 네비게이션과 달력 높이를 고려해 해당 일자 일정으로 스크롤되도록 보강했다.
  - Supabase `main-trip` row가 없을 때 `.maybeSingle()` 기반으로 기본 데이터를 upsert하도록 보강했다.
  - 클라우드 오류 상태 문구를 `클라우드 오류 · 로컬 저장`으로 명확히 바꿨다.
- `src/styles/main.css`
  - Apple-inspired 밝은 시스템 배경, 절제된 검정 포인트, 얇은 구분선, 압축 카드, 모바일 우선 시간표 UI로 재정리했다.
- `docs/jeju-itinerary-references-2026-04-27.md`
  - 일정 재구성에 사용한 웹 참고 링크를 남겼다.
  - 같은 파일을 메모 vault inbox로 복사했다.

## Evidence
- `npm run lint`: 성공.
- `npm run build`: 성공.
- 로컬 production preview 경로 `http://127.0.0.1:4173/jeju-family-trip-dashboard/`: 200.
- 로컬 Playwright 모바일/데스크톱 스크린샷 성공.
- `1270bcf095e9fac867ba8733615103b929f89b99`를 `main`에 push했다.
- GitHub Actions run `24961649385`가 성공했다.
- 원격 Pages `https://lee9387-hm.github.io/jeju-family-trip-dashboard/?v=1270bcf`에서 최신 번들 `index-5bOhcoTI.js`, `index-B6iZJhF7.css` 로드를 확인했다.
- 원격 Playwright 모바일 캡처와 `#day-5` 날짜 해시 이동 캡처가 성공했다.

## Remaining Risk
- Supabase 동기화는 아직 클라우드 성공 상태가 아니다.
- 값 노출 없이 REST 접근을 확인했을 때 `/rest/v1/trips?select=id&limit=1`가 404를 반환했다.
- 따라서 남은 문제는 프론트 코드보다 Supabase 프로젝트의 `trips` 테이블 존재 여부, API schema 노출, RLS/policy, 또는 GitHub Secrets 값 정확성 확인에 있다.
- 앱은 `클라우드 오류 · 로컬 저장` 상태로 정상 사용 가능하다.

## Deployment Info
- GitHub 저장소: `https://github.com/LEE9387-HM/jeju-family-trip-dashboard`
- 배포 주소: `https://lee9387-hm.github.io/jeju-family-trip-dashboard/`
- Vite base: `/jeju-family-trip-dashboard/`
- Supabase 테이블 목표: `trips`, row id: `main-trip`

## Next Steps
1. Supabase 대시보드 또는 service role 권한으로 `trips` 테이블이 실제로 존재하는지 확인한다.
2. `SUPABASE_SCHEMA.sql` 기준으로 테이블/RLS/policy를 적용하거나 보정한다.
3. GitHub Secrets `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`가 현재 Supabase 프로젝트와 일치하는지 값 노출 없이 확인한다.
4. 보정 후 Pages에서 뱃지가 `클라우드 동기화됨`으로 바뀌는지 확인한다.

## Next Prompt
`C:\WorkSpace\Coding\코딩\jeju-family-trip`에서 `STATUS.md`와 `HANDOFF.md`를 먼저 읽어줘. GitHub Pages 화면 출력과 모바일 시간표 UI 업그레이드는 `1270bcf` 배포로 완료됐고 원격 Pages에서 최신 번들 및 모바일 캡처까지 확인됐어. 이제 남은 것은 Supabase 클라우드 동기화야. 값 노출 없이 Supabase 프로젝트의 `trips` 테이블 존재 여부, API schema 노출, RLS/policy, GitHub Secrets 값을 점검하고, `SUPABASE_SCHEMA.sql` 기준으로 필요한 최소 보정안을 제시하거나 적용해줘.

