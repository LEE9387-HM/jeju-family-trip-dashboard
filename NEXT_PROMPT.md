# NEXT PROMPT

`C:\WorkSpace\Coding\코딩\jeju-family-trip`에서 `READ_FIRST.md`, 루트 `AGENTS.md`, 프로젝트 `AGENTS.md`, `PROJECT.md`, `STATUS.md`, `HANDOFF.md`를 먼저 읽어줘.

GitHub Pages 화면 출력과 모바일 시간표 UI 업그레이드는 `1270bcf095e9fac867ba8733615103b929f89b99` 배포로 완료됐고, GitHub Actions run `24961649385`도 성공했어. 원격 Pages `https://lee9387-hm.github.io/jeju-family-trip-dashboard/?v=1270bcf`에서 최신 번들 `index-5bOhcoTI.js`, `index-B6iZJhF7.css` 로드와 모바일 캡처까지 확인됐어.

남은 것은 Supabase 클라우드 동기화야. 현재 배포 화면은 `클라우드 오류 · 로컬 저장`으로 표시되며 앱 자체는 정상 동작한다. 값 노출 없이 확인했을 때 `/rest/v1/trips?select=id&limit=1`가 404를 반환했으니, Supabase 프로젝트의 `trips` 테이블 존재 여부, API schema 노출, RLS/policy, GitHub Secrets `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`가 현재 프로젝트와 일치하는지 확인해줘. 필요하면 `SUPABASE_SCHEMA.sql` 기준으로 최소 보정을 적용하거나 적용 절차를 제시해줘.

