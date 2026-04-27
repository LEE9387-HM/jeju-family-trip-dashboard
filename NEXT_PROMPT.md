# NEXT PROMPT

`C:\WorkSpace\Coding\코딩\jeju-family-trip`에서 `READ_FIRST.md`, 루트 `AGENTS.md`, 프로젝트 `AGENTS.md`, `PROJECT.md`, `STATUS.md`, `HANDOFF.md`를 먼저 읽어줘.

GitHub Pages 화면 출력, 모바일 시간표 UI, Supabase `trips.main-trip` row 접근, 배포 화면 `클라우드 동기화됨` 상태까지 확인 완료됐어. 원격 Pages `https://lee9387-hm.github.io/jeju-family-trip-dashboard/`에서 모바일 캡처까지 확인했어.

추가 수정이 필요하면 `src/data/tripData.js`의 일정 데이터와 `src/styles/main.css`의 모바일 UI만 좁게 수정해줘. 일정 데이터를 바꿀 때는 `meta.version`을 올려 배포 기본값 갱신을 보장하고, `npm run lint`, `npm run build`, Playwright 모바일 캡처 후 배포해줘.
