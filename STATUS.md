# STATUS: jeju-family-trip

- **Last Updated**: 2026-04-27
- **Current Milestone**: v2.7 - Mobile Timeline Polish & Supabase Connected
- **Health**: Green for GitHub Pages rendering, itinerary UI, and Supabase row access

## 완료된 작업
- **배포 화면 출력 복구**
  - `Sections.jsx`의 `useState` 미 import와 오래된 데이터 스키마로 인한 런타임 렌더링 실패를 수정했다.
  - GitHub Pages 하위 경로에서 예약 이미지와 번들이 안정적으로 로드되도록 보강했다.
- **여행 계획 데이터 전면 갱신**
  - `meta.version`을 `2.5`로 올려 오래된 localStorage/Supabase 데이터보다 새 기본 일정이 우선되도록 했다.
  - 렌터카 카시트 정보를 `업체 제공 없음 · 휴대용 카시트/유모차 직접 지참`으로 정정했다.
  - 1일차부터 6일차까지 시간 단위 `timeBlocks`를 추가했다.
  - 우도, 마라도, 중문권, 한림/협재권, 렌터카 반납 동선을 촘촘한 관광형 일정으로 재구성했다.
  - 사용자 제공 숙소 링크와 갈치조림 링크를 데이터에 반영했다.
- **모바일 중심 UI 개편**
  - 상단 여행 달력에서 날짜를 누르면 해당 일자 일정으로 이동하도록 구성했다.
  - 탭형 요약 일정을 전체 스크롤형 시간표로 교체했다.
  - 각 일정 블록에 시간, 상태, 분류, 장소, 메모, 지도/링크 버튼을 표시한다.
  - Apple-inspired 밝은 배경, 얇은 구분선, 시스템 폰트, 압축 카드, 모바일 가로 스크롤 네비게이션으로 정리했다.
- **참고 자료 정리**
  - `docs/jeju-itinerary-references-2026-04-27.md`에 웹 참고 링크를 남겼다.
  - 동일 문서를 `C:\WorkSpace\메모\RAW\01. inbox\jeju-itinerary-references-2026-04-27.md`로 복사했다.
- **Supabase fallback 보강**
  - `main-trip` row가 없는 경우 `.maybeSingle()` 기반으로 기본 데이터를 upsert하도록 보강했다.
  - 클라우드 오류 상태 문구를 `클라우드 오류 · 로컬 저장`으로 명확히 바꿨다.
- **객관 리뷰 후 디자인 폴리시**
  - 동기화 상태 뱃지에 상태 점을 추가했다.
  - 모바일 관리 버튼을 한 줄 compact toolbar로 정리했다.
  - 날짜 이동 시 달력이 화면을 과하게 가리지 않도록 sticky를 제거하고 해시 스크롤 offset을 조정했다.
  - 일정 블록에 상태별 점과 세로 라인을 추가해 시간표 흐름을 더 명확하게 했다.

## 현재 상태
- 최신 배포 커밋: `fc3d1e5e2543ec84f5824ba5bef7901ebe51ebdc`
- GitHub Actions run: `24995409149` (`Deploy to GitHub Pages`) success
- 실제 Pages URL: `https://lee9387-hm.github.io/jeju-family-trip-dashboard/`
- 캐시 우회 확인 URL: `https://lee9387-hm.github.io/jeju-family-trip-dashboard/?v=1270bcf`
- 원격 HTML에서 최신 번들 로드 확인:
  - `assets/index-5bOhcoTI.js`
  - `assets/index-B6iZJhF7.css`
- 원격 모바일 스크린샷:
  - `output/playwright/remote-apple-mobile-current.png`
  - `output/playwright/remote-apple-mobile-day5-current.png`

## Supabase 상태
- 사용자가 Supabase SQL을 입력한 뒤 REST API로 `main-trip` row 조회를 확인했다.
- 확인 결과: `count=1`, `content.meta.version=2.5`, title=`제주도 가족여행`.
- 배포 화면 동기화 뱃지는 `클라우드 동기화됨`으로 표시된다.

## 검증 결과
- `npm run lint`: 성공
- `npm run build`: 성공
- 로컬 production preview `http://127.0.0.1:4173/jeju-family-trip-dashboard/`: 200
- Playwright 로컬 모바일/데스크톱 캡처: 성공
- GitHub Actions Pages 배포: 성공
- 원격 Pages HTML/JS/CSS 확인: 성공
- 원격 Pages 모바일 날짜 해시 이동 `#day-5`: 성공
- Supabase `trips.main-trip` row 조회: 성공

## 남은 작업
- [x] Supabase `trips` 테이블과 `main-trip` row 접근 확인.
- [x] 배포 화면 클라우드 동기화 뱃지 확인.
- [ ] 실제 여행 전 페리 운항 시간과 식당 운영시간은 전날 재확인.
