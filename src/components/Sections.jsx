import { openNaverMap, getDayTypeLabel, getDayTypeBadgeClass } from '../utils/tripUtils';

function VoucherImage({ src, label }) {
  if (!src) return null;
  return (
    <div className="voucher-preview">
      <p className="voucher-label">📎 {label}</p>
      <div className="voucher-img-wrapper" onClick={() => window.open(src, '_blank')}>
        <img src={src} alt={label} className="voucher-thumbnail" />
        <div className="voucher-overlay">
          <span>원본 보기</span>
        </div>
      </div>
    </div>
  );
}

function MapComponent({ query, title }) {
  const encodedQuery = encodeURIComponent(query);
  // Using OpenStreetMap/Leaflet style placeholder since we don't have API keys for interactive embeds
  // But we can link to Naver Maps and show a beautiful preview box
  return (
    <div className="map-container">
      <div className="map-placeholder">
        <div className="map-placeholder-icon pulse">📍</div>
        <p style={{ fontWeight: 600, fontSize: '1rem', marginTop: '0.5rem' }}>{title || '위치 정보'}</p>
        <p style={{ fontSize: '0.85rem', opacity: 0.8, color: 'var(--text-secondary)' }}>{query}</p>
        <button 
          className="map-link" 
          onClick={() => openNaverMap(query)}
          style={{ marginTop: '1rem' }}
        >
          네이버 지도로 보기
        </button>
      </div>
    </div>
  );
}

function EditableText({ value, path, editMode, onUpdate, tag: Tag = 'span', className = '' }) {
  if (!editMode) return <Tag className={className}>{value}</Tag>;
  return (
    <Tag className={className}>
      <input
        className="editable-field"
        defaultValue={value}
        onBlur={(e) => onUpdate(path, e.target.value)}
        style={{ width: `${Math.max(value.length, 8)}ch` }}
      />
    </Tag>
  );
}

export function FlightSection({ flights, editMode, onUpdate }) {
  const renderFlight = (flight, label, flightKey) => (
    <div className="card" key={flightKey}>
      <div className="flight-date-badge">{label} · {flight.date}</div>
      <div className="flight-route">
        <div className="flight-airport">
          <div className="airport-code">{flight.from.split(' ')[0]}</div>
          <div className="airport-name">{flight.from}</div>
        </div>
        <div className="flight-line">
          <span className="flight-icon">✈️</span>
        </div>
        <div className="flight-airport">
          <div className="airport-code">{flight.to.split(' ')[0]}</div>
          <div className="airport-name">{flight.to}</div>
        </div>
      </div>
      <div className="info-grid">
        {[
          ['출발', 'departTime'], ['도착', 'arrivalTime'],
          ['항공사', 'airline'], ['예약번호', 'bookingRef'],
          ['좌석', 'seats'], ['수하물', 'baggage'],
        ].map(([label, key]) => (
          <div className="info-row" key={key}>
            <span className="info-label">{label}</span>
            <span className="info-value">
              <EditableText
                value={flight[key]}
                path={['flights', flightKey, key]}
                editMode={editMode}
                onUpdate={onUpdate}
              />
            </span>
          </div>
        ))}
        <div className="info-row">
          <span className="info-label">비고</span>
          <span className="info-value" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            <EditableText 
              value={flight.note || ''} 
              path={['flights', flightKey, 'note']} 
              editMode={editMode} 
              onUpdate={onUpdate} 
            />
          </span>
        </div>
      </div>
      <VoucherImage src={flight.voucherImage} label={`${label} 예약증`} />
      {editMode && <p className="edit-hint">✏️ 필드를 클릭해서 직접 수정하세요. 포커스 아웃 시 자동 저장됩니다.</p>}
    </div>
  );

  return (
    <div className="section">
      <h2 className="section-title">✈️ 항공편</h2>
      <div className="grid-2">
        {renderFlight(flights.outbound, '출발편', 'outbound')}
        {renderFlight(flights.inbound, '복귀편', 'inbound')}
      </div>
    </div>
  );
}

export function CarRentalSection({ car, editMode, onUpdate }) {
  return (
    <div className="section">
      <h2 className="section-title">🚗 렌터카</h2>
      <div className="grid-2">
        <div className="card">
          <div className="info-grid">
            {[
              ['차종', 'model'], ['연료', 'fuel'], ['보험', 'insurance'],
              ['카시트', 'childSeat'], ['인수일시', 'pickupDate'],
              ['인수시간', 'pickupTime'], ['반납일시', 'returnDate'],
              ['반납시간', 'returnTime'], ['총 이용', 'totalDays'],
            ].map(([label, key]) => (
              <div className="info-row" key={key}>
                <span className="info-label">{label}</span>
                <span className="info-value">
                  <EditableText value={car[key]} path={['carRental', key]} editMode={editMode} onUpdate={onUpdate} />
                </span>
              </div>
            ))}
          </div>
          {editMode && <p className="edit-hint">✏️ 클릭해서 수정 가능합니다.</p>}
        </div>
        <div className="card">
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.8rem', fontWeight: 600 }}>📋 체크리스트</p>
          <div className="checklist">
            {car.checklist.map((c, i) => (
              <div className="check-item" key={i}>
                <span className="check-icon">{c.required ? '✅' : '☑️'}</span>
                <EditableText value={c.item} path={['carRental', 'checklist', i, 'item']} editMode={editMode} onUpdate={onUpdate} />
              </div>
            ))}
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '1rem 0 0.5rem', fontWeight: 600 }}>🗺️ 운전 계획</p>
          <div className="drive-plan">
            {car.drivingPlan.map((d, i) => (
              <div className="drive-row" key={i}>
                <span className="drive-day">{d.day}</span>
                <EditableText value={d.note} path={['carRental', 'drivingPlan', i, 'note']} editMode={editMode} onUpdate={onUpdate} className="drive-note" />
              </div>
            ))}
          </div>
          <VoucherImage src={car.voucherImage} label="렌터카 예약증" />
        </div>
      </div>
    </div>
  );
}

export function AccommodationSection({ accommodations, editMode, onUpdate }) {
  return (
    <div className="section">
      <h2 className="section-title">🏨 숙소</h2>
      <div className="grid-2">
        {accommodations.map((stay, idx) => (
          <div className="card" key={stay.id}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  <EditableText value={stay.name} path={['accommodations', idx, 'name']} editMode={editMode} onUpdate={onUpdate} />
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>{stay.address}</p>
              </div>
              <span className="badge badge-star">{stay.role}</span>
            </div>
            <div className="info-grid">
              {[
                ['체크인', 'checkIn'], ['체크아웃', 'checkOut'],
                ['숙박 유형', 'type'], ['수용 인원', 'capacity'],
                ['주차', 'parking'], ['취사', 'cooking'], ['바비큐', 'bbq'],
              ].map(([label, key]) => (
                <div className="info-row" key={key}>
                  <span className="info-label">{label}</span>
                  <span className="info-value">
                    <EditableText value={String(stay[key])} path={['accommodations', idx, key]} editMode={editMode} onUpdate={onUpdate} />
                  </span>
                </div>
              ))}
            </div>
            {stay.strategy.length > 0 && (
              <div className="chips" style={{ marginTop: '1rem' }}>
                {stay.strategy.map((s, i) => <span key={i} className="chip">{s}</span>)}
              </div>
            )}
            <button
              className="map-link"
              onClick={() => openNaverMap(stay.name)}
            >
              🗺️ 네이버 지도
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export function RestaurantSection({ restaurants, editMode, onUpdate }) {
  return (
    <div className="section">
      <h2 className="section-title">🍽️ 맛집</h2>
      <div className="grid-3">
        {restaurants.map((rest, idx) => (
          <div className="card" key={rest.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.6rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>
                <EditableText value={rest.name} path={['restaurants', idx, 'name']} editMode={editMode} onUpdate={onUpdate} />
              </h3>
              <span className="badge badge-rest">{rest.meal}</span>
            </div>
            <div className="info-row" style={{ marginBottom: '0.3rem' }}>
              <span className="info-label">위치</span>
              <span className="info-value">
                <EditableText value={rest.location} path={['restaurants', idx, 'location']} editMode={editMode} onUpdate={onUpdate} />
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">메모</span>
              <span className="info-value" style={{ color: 'var(--text-secondary)' }}>
                <EditableText value={rest.note} path={['restaurants', idx, 'note']} editMode={editMode} onUpdate={onUpdate} />
              </span>
            </div>
            <div className="rest-priority">
              {Array.from({ length: 5 }, (_, i) => (
                <span key={i} className={`star ${i < rest.priority ? '' : 'empty'}`}>★</span>
              ))}
            </div>
            <a className="map-link" onClick={() => openNaverMap(rest.mapQuery)} href="#">
              🗺️ 네이버 지도
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ItinerarySection({ itinerary, editMode, onUpdate }) {
  const [activeTab, setActiveTab] = useState('Summary');

  const tabs = ['Summary', ...itinerary.map(day => day.label)];

  const activeDay = itinerary.find(d => d.label === activeTab);

  return (
    <div className="section">
      <h2 className="section-title">📅 일정표</h2>
      
      <div className="tab-container">
        {tabs.map(tab => (
          <button
            key={tab}
            className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'Summary' ? '전체 요약' : tab}
          </button>
        ))}
      </div>

      <div className="itinerary-content">
        {activeTab === 'Summary' ? (
          <div className="itinerary-grid">
            <div className="card">
              <h3 style={{ marginBottom: '1rem', color: 'var(--accent-teal)' }}>📍 여행 경로 요약</h3>
              <div className="info-grid">
                {itinerary.map((day, idx) => (
                  <div key={day.id} className="info-row" style={{ borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.5rem' }}>
                    <span className="info-label" style={{ minWidth: '60px' }}>{day.label}</span>
                    <span className="info-value">
                      <EditableText value={day.title} path={['itinerary', idx, 'title']} editMode={editMode} onUpdate={onUpdate} />
                    </span>
                  </div>
                ))}
              </div>
              <MapComponent query="제주도" title="전체 경로" />
            </div>
          </div>
        ) : (
          activeDay && (
            <div className="itinerary-grid">
              <div className="card day-card">
                <div className="day-header">
                  <span className="day-label">{activeDay.label}</span>
                  <span className="day-title">
                    <EditableText 
                      value={activeDay.title} 
                      path={['itinerary', itinerary.indexOf(activeDay), 'title']} 
                      editMode={editMode} 
                      onUpdate={onUpdate} 
                    />
                  </span>
                  <span className={`badge ${getDayTypeBadgeClass(activeDay.type)}`}>{getDayTypeLabel(activeDay.type)}</span>
                  <span className="day-date">{activeDay.date}</span>
                </div>
                <ul className="highlights-list">
                  {activeDay.highlights.map((h, hi) => (
                    <li key={hi}>
                      <EditableText 
                        value={h} 
                        path={['itinerary', itinerary.indexOf(activeDay), 'highlights', hi]} 
                        editMode={editMode} 
                        onUpdate={onUpdate} 
                      />
                    </li>
                  ))}
                </ul>
                {activeDay.note && (
                  <div className="day-note">
                    <EditableText 
                      value={activeDay.note} 
                      path={['itinerary', itinerary.indexOf(activeDay), 'note']} 
                      editMode={editMode} 
                      onUpdate={onUpdate} 
                    />
                  </div>
                )}
                
                {/* Show map for the primary highlight of the day */}
                <MapComponent 
                  query={activeDay.highlights[0] || activeDay.title} 
                  title={`${activeDay.label} 주요 장소`} 
                />
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
