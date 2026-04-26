// localStorage 유틸리티
const STORAGE_KEY = "jeju-trip-data";

export function saveTrip(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("저장 실패:", e);
  }
}

export function loadTrip() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.error("불러오기 실패:", e);
    return null;
  }
}

export function exportJson(data) {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "jeju-trip.json";
  a.click();
  URL.revokeObjectURL(url);
}

export function openNaverMap(query) {
  window.open(
    `https://map.naver.com/p/search/${encodeURIComponent(query)}`,
    "_blank",
    "noopener"
  );
}

export function getDayTypeLabel(type) {
  const map = {
    이동일: "✈️ 이동일",
    하이브리드: "🌟 핵심일",
    회복일: "😌 휴식일",
    날씨의존형: "🌦️ 날씨 의존",
    arrival: "도착일",
    activity: "핵심 일정",
    rest: "회복일",
    departure: "복귀일",
  };
  return map[type] || type;
}

export function getDayTypeBadgeClass(type) {
  const map = {
    이동일: "badge-travel",
    하이브리드: "badge-star",
    회복일: "badge-rest",
    날씨의존형: "badge-weather",
    arrival: "badge-travel",
    activity: "badge-star",
    rest: "badge-rest",
    departure: "badge-weather",
  };
  return map[type] || "badge-default";
}
