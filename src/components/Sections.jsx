import { useState } from 'react';
import { openNaverMap, getDayTypeLabel, getDayTypeBadgeClass } from '../utils/tripUtils';

function resolvePublicAsset(src) {
  if (!src) return '';
  if (/^(https?:|data:|blob:)/.test(src)) return src;
  const base = import.meta.env.BASE_URL || '/';
  return `${base}${src.replace(/^\/+/, '')}`;
}

function airportCode(label) {
  const text = String(label || '');
  const match = text.match(/\(([^)]+)\)/);
  return match ? match[1] : text.split(' ')[0];
}

function starCount(priority) {
  if (typeof priority === 'number') return Math.max(0, Math.min(priority, 5));
  return Math.max(0, Math.min(String(priority || '').split('★').length - 1, 5));
}

function VoucherImage({ src, label }) {
  if (!src) return null;
  const imageSrc = resolvePublicAsset(src);
  return (
    <div className="voucher-preview">
      <p className="voucher-label">{label}</p>
      <button className="voucher-img-wrapper" type="button" onClick={() => window.open(imageSrc, '_blank', 'noopener')}>
        <img src={imageSrc} alt={label} className="voucher-thumbnail" />
        <div className="voucher-overlay">
          <span>원본 보기</span>
        </div>
      </button>
    </div>
  );
}

function MapComponent({ query, title }) {
  const mapQuery = query || title || '제주도';
  return (
    <div className="map-container">
      <div className="map-placeholder">
        <div className="map-placeholder-icon pulse">위치</div>
        <p className="map-title">{title || '위치 정보'}</p>
        <p className="map-query">{mapQuery}</p>
        <button 
          className="map-link" 
          type="button"
          onClick={() => openNaverMap(mapQuery)}
        >
          네이버 지도로 보기
        </button>
      </div>
    </div>
  );
}

function EditableText({ value, path, editMode, onUpdate, tag: Tag = 'span', className = '' }) {
  const displayValue = value ?? '';
  if (!editMode) return <Tag className={className}>{displayValue}</Tag>;
  return (
    <Tag className={className}>
      <input
        className="editable-field"
        defaultValue={displayValue}
        onBlur={(e) => onUpdate(path, e.target.value)}
        style={{ width: `${Math.max(String(displayValue).length, 8)}ch` }}
      />
    </Tag>
  );
}

export function PlanOverviewSection({ tripData }) {
  const itinerary = Array.isArray(tripData.itinerary) ? tripData.itinerary : [];
  const startDate = itinerary[0]?.date;
  const endDate = itinerary[itinerary.length - 1]?.date;
  const today = new Date();
  const todayAtMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const startAtMidnight = startDate ? new Date(`${startDate}T00:00:00`) : null;
  const dDay = startAtMidnight
    ? Math.ceil((startAtMidnight.getTime() - todayAtMidnight.getTime()) / 86400000)
    : null;
  const dDayLabel = dDay === null ? '일정 확정' : dDay > 0 ? `D-${dDay}` : dDay === 0 ? 'D-Day' : '여행 완료';
  const mainStay = tripData.accommodations?.[0]?.name || '메인 숙소';
  const finalStay = tripData.accommodations?.[tripData.accommodations.length - 1]?.name || mainStay;

  return (
    <section className="section plan-overview" id="overview">
      <h2 className="section-title">여행 계획 개요</h2>
      <div className="overview-grid">
        <article className="stat-card highlight">
          <span className="stat-label">출발 기준</span>
          <strong>{dDayLabel}</strong>
          <p>{startDate} - {endDate}</p>
        </article>
        <article className="stat-card">
          <span className="stat-label">여행 인원</span>
          <strong>{tripData.meta.travelers.adults + tripData.meta.travelers.children}명</strong>
          <p>성인 {tripData.meta.travelers.adults} · 소아 {tripData.meta.travelers.children}</p>
        </article>
        <article className="stat-card">
          <span className="stat-label">숙박 전략</span>
          <strong>{mainStay}</strong>
          <p>복귀 전날 {finalStay} 이동</p>
        </article>
        <article className="stat-card">
          <span className="stat-label">운전 계획</span>
          <strong>{tripData.carRental.model}</strong>
          <p>{tripData.carRental.pickupTime} 인수 · {tripData.carRental.returnTime} 반납</p>
        </article>
      </div>

      <div className="planning-board">
        <article className="board-panel">
          <h3>출발 전 확인</h3>
          <ul className="priority-list">
            <li>좌석 배정과 위탁수하물 기준 재확인</li>
            <li>렌터카 카시트와 인수 위치 확인</li>
            <li>05/05 조기 비행 기준 공항 도착 시간 역산</li>
          </ul>
        </article>
        <article className="board-panel">
          <h3>가족 동선 원칙</h3>
          <ul className="priority-list">
            <li>도착일 저녁 운전 최소화</li>
            <li>장거리 이동일 다음에는 회복 여백 확보</li>
            <li>날씨 변수는 실내 후보와 카페 휴식으로 흡수</li>
          </ul>
        </article>
      </div>
    </section>
  );
}

export function FlightSection({ flights, editMode, onUpdate }) {
  const renderFlight = (flight, label, flightKey) => (
    <div className="card" key={flightKey}>
      <div className="flight-date-badge">{label} · {flight.date}</div>
      <div className="flight-route">
        <div className="flight-airport">
          <div className="airport-code">{airportCode(flight.from)}</div>
          <div className="airport-name">{flight.from}</div>
        </div>
        <div className="flight-line">
          <span className="flight-icon">편도</span>
        </div>
        <div className="flight-airport">
          <div className="airport-code">{airportCode(flight.to)}</div>
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
    </div>
  );

  return (
    <section className="section" id="flights">
      <h2 className="section-title">항공편</h2>
      <div className="grid-2">
        {renderFlight(flights.outbound, '출발편', 'outbound')}
        {renderFlight(flights.inbound, '복귀편', 'inbound')}
      </div>
    </section>
  );
}

export function CarRentalSection({ car, editMode, onUpdate }) {
  const checklist = Array.isArray(car.checklist) ? car.checklist : [];
  const drivingPlan = Array.isArray(car.drivingPlan) ? car.drivingPlan : [];
  return (
    <section className="section" id="car">
      <h2 className="section-title">렌터카</h2>
      <div className="grid-2">
        <div className="card">
          <div className="card-heading">
            <span className="eyebrow">렌터카 예약</span>
            <h3>{car.company}</h3>
            <p>{car.address}</p>
          </div>
          <div className="info-grid">
            {[
              ['차종', 'model'], ['연료', 'fuel'], ['보험', 'insurance'], ['전화', 'phone'],
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
            <div className="info-row">
              <span className="info-label">인수 동선</span>
              <span className="info-value">
                <EditableText value={car.pickupGuide} path={['carRental', 'pickupGuide']} editMode={editMode} onUpdate={onUpdate} />
              </span>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-heading compact">
            <span className="eyebrow">인수 체크</span>
            <h3>렌터카 준비 항목</h3>
          </div>
          <div className="checklist">
            {checklist.map((c, i) => (
              <div className="check-item" key={i}>
                <span className={`check-icon ${c.required ? 'required' : ''}`}>{c.required ? '필수' : '선택'}</span>
                <EditableText value={c.item} path={['carRental', 'checklist', i, 'item']} editMode={editMode} onUpdate={onUpdate} />
              </div>
            ))}
          </div>
          <h4 className="subsection-label">운전 계획</h4>
          <div className="drive-plan">
            {drivingPlan.map((d, i) => (
              <div className="drive-row" key={i}>
                <span className="drive-day">{d.day}</span>
                <EditableText value={d.note} path={['carRental', 'drivingPlan', i, 'note']} editMode={editMode} onUpdate={onUpdate} className="drive-note" />
              </div>
            ))}
          </div>
          <VoucherImage src={car.voucherImage} label="렌터카 예약증" />
        </div>
      </div>
    </section>
  );
}

export function AccommodationSection({ accommodations, editMode, onUpdate }) {
  return (
    <section className="section" id="stays">
      <h2 className="section-title">숙소</h2>
      <div className="grid-2">
        {accommodations.map((stay, idx) => (
          <div className="card" key={stay.id}>
            <div className="card-topline">
              <div>
                <h3>
                  <EditableText value={stay.name} path={['accommodations', idx, 'name']} editMode={editMode} onUpdate={onUpdate} />
                </h3>
                <p>{stay.address}</p>
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
            {Array.isArray(stay.strategy) && stay.strategy.length > 0 && (
              <div className="chips" style={{ marginTop: '1rem' }}>
                {stay.strategy.map((s, i) => <span key={i} className="chip">{s}</span>)}
              </div>
            )}
            <button
              className="map-link"
              onClick={() => openNaverMap(stay.name)}
            >
              네이버 지도
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

export function RestaurantSection({ restaurants, editMode, onUpdate }) {
  return (
    <section className="section" id="restaurants">
      <h2 className="section-title">식사 후보</h2>
      <div className="grid-3">
        {restaurants.map((rest, idx) => (
          <div className="card" key={rest.id}>
            <div className="card-topline">
              <h3>
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
              <span className="info-label">메뉴</span>
              <span className="info-value">
                <EditableText value={rest.specialty} path={['restaurants', idx, 'specialty']} editMode={editMode} onUpdate={onUpdate} />
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">메모</span>
              <span className="info-value muted">
                <EditableText value={rest.note} path={['restaurants', idx, 'note']} editMode={editMode} onUpdate={onUpdate} />
              </span>
            </div>
            <div className="rest-priority">
              {Array.from({ length: 5 }, (_, i) => (
                <span key={i} className={`star ${i < starCount(rest.priority) ? '' : 'empty'}`}>★</span>
              ))}
            </div>
            <button className="map-link" type="button" onClick={() => openNaverMap(rest.mapQuery || rest.name)}>
              네이버 지도
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

export function ItinerarySection({ itinerary, editMode, onUpdate }) {
  const [activeTab, setActiveTab] = useState('Summary');

  const tabs = ['Summary', ...itinerary.map(day => day.label)];

  const activeDay = itinerary.find(d => d.label === activeTab);
  const activeDayIndex = activeDay ? itinerary.findIndex(d => d.id === activeDay.id) : -1;

  return (
    <section className="section" id="itinerary">
      <h2 className="section-title">일정표</h2>
      
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
              <h3 className="card-section-title">여행 경로 요약</h3>
              <div className="info-grid">
                {itinerary.map((day, idx) => (
                  <div key={day.id} className="info-row route-summary-row">
                    <span className="info-label compact-label">{day.label}</span>
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
                      path={['itinerary', activeDayIndex, 'title']}
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
                        path={['itinerary', activeDayIndex, 'highlights', hi]}
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
                      path={['itinerary', activeDayIndex, 'note']}
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
    </section>
  );
}
