# AGENTS: jeju-family-trip

이 프로젝트는 `C:\WorkSpace\Coding` 루트 운영 규칙을 따른다.

## 작업 원칙
- 응답과 handoff는 한국어로 작성한다.
- 비밀값은 `.env`, GitHub Secrets, 루트 `.env.local`에만 두고 문서/로그에 실제 값을 쓰지 않는다.
- GitHub Pages 배포 기준 base path는 `/jeju-family-trip-dashboard/`다.
- 배포 화면 문제를 볼 때는 먼저 production build와 preview를 같은 base path로 확인한다.
- 수정 후 `npm run lint`와 `npm run build`를 실행한다.

## 주요 파일
- `src/App.jsx`: 앱 셸, 데이터 정규화, Supabase 동기화 상태.
- `src/components/Sections.jsx`: 계획서 섹션과 주요 렌더링 컴포넌트.
- `src/data/tripData.js`: 기본 여행 데이터.
- `src/styles/main.css`: 전체 디자인 시스템.
- `.github/workflows/deploy.yml`: GitHub Pages 배포 워크플로우.
