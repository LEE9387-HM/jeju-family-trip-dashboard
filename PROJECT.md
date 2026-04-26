# PROJECT: jeju-family-trip

## 목적
제주도 가족여행 일정을 항공, 렌터카, 숙소, 맛집, 일자별 동선으로 정리하고 가족이 실제 여행 계획서처럼 확인할 수 있는 웹페이지를 제공한다.

## 기술 스택
- Vite
- React
- Vanilla CSS
- Supabase
- GitHub Actions Pages 배포

## 실행 명령
```powershell
npm install
npm run dev
npm run build
npm run preview -- --host 127.0.0.1 --port 4173
```

GitHub Pages와 같은 하위 경로 검증:
```powershell
npm run build
npm run preview -- --host 127.0.0.1 --port 4173
# http://127.0.0.1:4173/jeju-family-trip-dashboard/
```

## 배포
- 저장소: `https://github.com/LEE9387-HM/jeju-family-trip-dashboard`
- 배포 주소: `https://lee9387-hm.github.io/jeju-family-trip-dashboard/`
- Vite base: `/jeju-family-trip-dashboard/`

## 데이터
- 기본 데이터: `src/data/tripData.js`
- 로컬 저장: `localStorage` key `jeju-trip-data`
- Supabase 테이블: `trips`
- 주요 row id: `main-trip`
