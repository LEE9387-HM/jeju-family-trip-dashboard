import { useState, useEffect, useCallback } from 'react';
import { DEFAULT_TRIP_DATA } from './data/tripData';
import { saveTrip, loadTrip, exportJson } from './utils/tripUtils';
import { getDayTypeLabel, getDayTypeBadgeClass } from './utils/tripUtils';
import { supabase } from './utils/supabaseClient';
import {
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

export default function App() {
  const [tripData, setTripData] = useState(DEFAULT_TRIP_DATA);
  const [editMode, setEditMode] = useState(false);
  const [toast, setToast] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }, []);

  // Initial Load Logic (Local + Supabase)
  useEffect(() => {
    const initData = async () => {
      let localData = loadTrip();
      
      // Force update if version is old
      if (localData && (!localData.meta.version || localData.meta.version < DEFAULT_TRIP_DATA.meta.version)) {
        console.log('Old version detected. Updating to:', DEFAULT_TRIP_DATA.meta.version);
        localData = DEFAULT_TRIP_DATA;
        saveTrip(localData);
      }

      setTripData(localData || DEFAULT_TRIP_DATA);

      if (supabase) {
        setIsSyncing(true);
        try {
          const { data, error } = await supabase
            .from('trips')
            .select('content')
            .eq('id', 'main-trip')
            .single();
          
          if (data && data.content) {
            const cloudData = data.content;
            // Only use cloud data if it's the same or newer version
            if (!cloudData.meta.version || cloudData.meta.version < DEFAULT_TRIP_DATA.meta.version) {
              console.warn('Cloud data is outdated. Syncing local default (v' + DEFAULT_TRIP_DATA.meta.version + ') to cloud.');
              syncToCloud(DEFAULT_TRIP_DATA);
            } else {
              setTripData(cloudData);
            }
          }
        } catch (e) {
          console.error('Supabase fetch failed:', e);
        }
        setIsSyncing(false);
      }
    };
    initData();
  }, []);

  // Sync to Cloud
  const syncToCloud = useCallback(async (data) => {
    if (!supabase) return;
    setIsSyncing(true);
    const { error } = await supabase
      .from('trips')
      .upsert({ id: 'main-trip', content: data, updated_at: new Date() });
    
    if (error) console.error('Sync error:', error);
    setIsSyncing(false);
  }, []);

  useEffect(() => {
    saveTrip(tripData);
    // Debounced sync could be added here
  }, [tripData]);

  const handleUpdate = useCallback((path, value) => {
    setTripData(prev => {
      const next = setNestedValue(prev, path, value);
      syncToCloud(next);
      return next;
    });
    showToast('✅ 저장됨');
  }, [showToast, syncToCloud]);

  const handleReset = () => {
    if (window.confirm('모든 수정 내용을 초기화하시겠습니까?')) {
      setTripData(DEFAULT_TRIP_DATA);
      saveTrip(DEFAULT_TRIP_DATA);
      showToast('🔄 초기화 완료');
    }
  };

  const handleExport = () => {
    exportJson(tripData);
    showToast('📥 JSON 내보내기 완료');
  };

  return (
    <div className={`app-shell ${editMode ? 'edit-mode' : ''}`}>
      {/* Header */}
      <header className="hero">
        <div className="sync-status">
          {isSyncing ? '⏳ 동기화 중...' : '☁️ 클라우드 연결됨'}
        </div>
        <span className="hero-emoji">🌊</span>
        <h1>{tripData.meta.title}</h1>
        <p className="hero-subtitle">{tripData.meta.subtitle}</p>
        <div className="hero-travelers">
          👨‍👩‍👧‍👦 성인 {tripData.meta.travelers.adults}명 &nbsp;·&nbsp; 소아 {tripData.meta.travelers.children}명
        </div>
      </header>

      {/* Toolbar */}
      <div className="toolbar">
        <button className={`btn btn-edit ${editMode ? 'active' : ''}`} onClick={() => setEditMode(v => !v)}>
          {editMode ? '✅ 편집 완료' : '✏️ 편집 모드'}
        </button>
        <button className="btn btn-export" onClick={handleExport}>📥 JSON 내보내기</button>
        <button className="btn btn-reset" onClick={handleReset}>🔄 초기화</button>
      </div>

      {/* Sections */}
      <FlightSection flights={tripData.flights} editMode={editMode} onUpdate={handleUpdate} />
      <CarRentalSection car={tripData.carRental} editMode={editMode} onUpdate={handleUpdate} />
      <AccommodationSection accommodations={tripData.accommodations} editMode={editMode} onUpdate={handleUpdate} />
      <RestaurantSection restaurants={tripData.restaurants} editMode={editMode} onUpdate={handleUpdate} />
      <ItinerarySection itinerary={tripData.itinerary} editMode={editMode} onUpdate={handleUpdate} getDayTypeLabel={getDayTypeLabel} getDayTypeBadgeClass={getDayTypeBadgeClass} />

      {/* Footer */}
      <footer className="app-footer">
        🌺 제주도 가족여행 대시보드 · 수정 내용은 브라우저에 자동 저장됩니다
      </footer>

      {/* Toast */}
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
