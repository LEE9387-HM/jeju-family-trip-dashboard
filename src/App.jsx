import { useState, useEffect, useCallback } from 'react';
import { DEFAULT_TRIP_DATA } from './data/tripData';
import { saveTrip, loadTrip, exportJson } from './utils/tripUtils';
import { supabase } from './utils/supabaseClient';
import {
  DayCalendarSection,
  PlanOverviewSection,
  FlightSection,
  CarRentalSection,
  AccommodationSection,
  RestaurantSection,
  ItinerarySection,
} from './components/Sections';
import './styles/main.css';

function setNestedValue(obj, path, value) {
  if (!path || path.length === 0) return obj;
  const cloned = JSON.parse(JSON.stringify(obj));
  let cursor = cloned;
  for (let i = 0; i < path.length - 1; i++) {
    cursor = cursor[path[i]];
  }
  cursor[path[path.length - 1]] = value;
  return cloned;
}

function mergeWithDefaults(defaultValue, value) {
  if (Array.isArray(defaultValue)) {
    if (!Array.isArray(value)) return defaultValue;
    return value.map((item, index) => mergeWithDefaults(defaultValue[index] ?? {}, item));
  }

  if (defaultValue && typeof defaultValue === 'object') {
    const source = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
    const merged = { ...source };
    Object.keys(defaultValue).forEach((key) => {
      merged[key] = mergeWithDefaults(defaultValue[key], source[key]);
    });
    return merged;
  }

  return value ?? defaultValue;
}

function normalizeTripData(data) {
  const normalized = mergeWithDefaults(DEFAULT_TRIP_DATA, data || DEFAULT_TRIP_DATA);
  normalized.meta = {
    ...DEFAULT_TRIP_DATA.meta,
    ...(normalized.meta || {}),
    version: DEFAULT_TRIP_DATA.meta.version,
  };
  return normalized;
}

export default function App() {
  const [tripData, setTripData] = useState(() => normalizeTripData(DEFAULT_TRIP_DATA));
  const [editMode, setEditMode] = useState(false);
  const [toast, setToast] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncState, setSyncState] = useState(supabase ? 'ready' : 'local');

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }, []);

  const syncToCloud = useCallback(async (data, options = {}) => {
    if (!supabase) {
      setSyncState('local');
      return false;
    }

    setIsSyncing(true);
    try {
      const { error } = await supabase
        .from('trips')
        .upsert({
          id: 'main-trip',
          content: normalizeTripData(data),
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
      setSyncState('cloud');
      return true;
    } catch (error) {
      console.error('Sync error:', error);
      setSyncState('error');
      if (!options.silent) showToast('클라우드 저장 실패, 로컬 저장됨');
      return false;
    } finally {
      setIsSyncing(false);
    }
  }, [showToast]);

  // Initial Load Logic (Local + Supabase)
  useEffect(() => {
    const initData = async () => {
      let localData = normalizeTripData(loadTrip());

      if (!localData.meta.version || localData.meta.version < DEFAULT_TRIP_DATA.meta.version) {
        console.log('Old version detected. Updating to:', DEFAULT_TRIP_DATA.meta.version);
        localData = normalizeTripData(DEFAULT_TRIP_DATA);
        saveTrip(localData);
      }

      setTripData(localData);

      if (supabase) {
        setIsSyncing(true);
        try {
          const { data, error } = await supabase
            .from('trips')
            .select('content')
            .eq('id', 'main-trip')
            .maybeSingle();

          if (error) throw error;

          if (data && data.content) {
            const cloudData = normalizeTripData(data.content);
            if (!cloudData.meta.version || cloudData.meta.version < DEFAULT_TRIP_DATA.meta.version) {
              console.warn('Cloud data is outdated. Syncing local default (v' + DEFAULT_TRIP_DATA.meta.version + ') to cloud.');
              const resetData = normalizeTripData(DEFAULT_TRIP_DATA);
              setTripData(resetData);
              saveTrip(resetData);
              const synced = await syncToCloud(resetData, { silent: true });
              if (!synced) return;
            } else {
              setTripData(cloudData);
              saveTrip(cloudData);
            }
          } else {
            const synced = await syncToCloud(localData, { silent: true });
            if (!synced) return;
          }
          setSyncState('cloud');
        } catch (e) {
          console.error('Supabase fetch failed:', e);
          setSyncState('error');
        } finally {
          setIsSyncing(false);
        }
      }
    };
    initData();
  }, [syncToCloud]);

  useEffect(() => {
    saveTrip(tripData);
  }, [tripData]);

  useEffect(() => {
    const scrollToHash = () => {
      const id = window.location.hash.replace('#', '');
      if (!id) return;
      const scroll = () => {
        const target = document.getElementById(id);
        if (!target) return;
        const stickyOffset = window.matchMedia('(max-width: 720px)').matches ? 84 : 92;
        const top = target.getBoundingClientRect().top + window.scrollY - stickyOffset;
        window.scrollTo({ top: Math.max(0, top), behavior: 'auto' });
      };
      [80, 420, 900].forEach((delay) => window.setTimeout(scroll, delay));
    };

    scrollToHash();
    window.addEventListener('hashchange', scrollToHash);
    return () => window.removeEventListener('hashchange', scrollToHash);
  }, [tripData.meta.version]);

  const handleUpdate = useCallback((path, value) => {
    setTripData(prev => {
      const next = normalizeTripData(setNestedValue(prev, path, value));
      syncToCloud(next, { silent: true });
      return next;
    });
    showToast('저장됨');
  }, [showToast, syncToCloud]);

  const handleReset = () => {
    if (window.confirm('모든 수정 내용을 초기화하시겠습니까?')) {
      const resetData = normalizeTripData(DEFAULT_TRIP_DATA);
      setTripData(resetData);
      saveTrip(resetData);
      syncToCloud(resetData, { silent: true });
      showToast('초기화 완료');
    }
  };

  const handleExport = () => {
    exportJson(tripData);
    showToast('JSON 내보내기 완료');
  };

  const syncStatusLabel = isSyncing
    ? '동기화 중'
    : {
      cloud: '클라우드 동기화됨',
      ready: '클라우드 준비됨',
      local: '로컬 저장 모드',
      error: '클라우드 오류 · 로컬 저장',
    }[syncState];

  return (
    <div className={`app-shell ${editMode ? 'edit-mode' : ''}`}>
      <header className="hero">
        <div className={`sync-status sync-${syncState}`}>{syncStatusLabel}</div>
        <div className="hero-content">
          <p className="hero-kicker">Jeju Family Trip Plan</p>
          <h1>{tripData.meta.title}</h1>
          <p className="hero-subtitle">{tripData.meta.subtitle}</p>
          <div className="hero-travelers">
            성인 {tripData.meta.travelers.adults}명 · 소아 {tripData.meta.travelers.children}명
          </div>
        </div>
        <div className="hero-plan-card">
          <span className="plan-card-label">핵심 전략</span>
          <strong>{tripData.meta.mode || '서귀포 거점형 가족 여행'}</strong>
          <div className="hero-timeline">
            <span>항공</span>
            <span>렌터카</span>
            <span>섬 일정</span>
            <span>시간표</span>
          </div>
        </div>
      </header>

      <nav className="quick-nav" aria-label="페이지 섹션 바로가기">
        <a href="#calendar">달력</a>
        <a href="#overview">개요</a>
        <a href="#flights">항공</a>
        <a href="#car">렌터카</a>
        <a href="#stays">숙소</a>
        <a href="#restaurants">식사</a>
        <a href="#itinerary">일정</a>
      </nav>

      <div className="toolbar">
        <button className={`btn btn-edit ${editMode ? 'active' : ''}`} onClick={() => setEditMode(v => !v)}>
          {editMode ? '편집 완료' : '편집 모드'}
        </button>
        <button className="btn btn-export" onClick={handleExport}>JSON 내보내기</button>
        <button className="btn btn-reset" onClick={handleReset}>초기화</button>
      </div>

      <DayCalendarSection itinerary={tripData.itinerary} />
      <PlanOverviewSection tripData={tripData} />
      <FlightSection flights={tripData.flights} editMode={editMode} onUpdate={handleUpdate} />
      <CarRentalSection car={tripData.carRental} editMode={editMode} onUpdate={handleUpdate} />
      <AccommodationSection accommodations={tripData.accommodations} editMode={editMode} onUpdate={handleUpdate} />
      <RestaurantSection restaurants={tripData.restaurants} editMode={editMode} onUpdate={handleUpdate} />
      <ItinerarySection itinerary={tripData.itinerary} editMode={editMode} onUpdate={handleUpdate} />

      <footer className="app-footer">
        제주도 가족여행 계획서 · 2026.04.30 - 2026.05.05
      </footer>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
