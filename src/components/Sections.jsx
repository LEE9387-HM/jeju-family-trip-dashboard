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

function toneClass(tone) {
  return {
    critical: 'tone-critical',
    primary: 'tone-primary',
    warning: 'tone-warning',
    neutral: 'tone-neutral',
  }[tone] || 'tone-neutral';
}

function statusLabel(status) {
  return {
    fixed: '확정',
    planned: '계획',
    check: '확인',
    option: '후보',
  }[status] || status || '계획';
}

function categoryLabel(category) {
  return {
    arrival: '도착',
    cafe: '카페',
    car: '차량',
    check: '확인',
    ferry: '선박',
    grocery: '장보기',
    market: '시장',
    meal: '식사',
    move: '이동',
    option: '대체',
    prep: '준비',
    sight: '관광',
    stay: '숙소',
  }[category] || category || '일정';
}

function blockMapQuery(block) {
  return block.mapQuery || block.place || block.title || '제주도';
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

export function DayCalendarSection({ itinerary }) {
  const days = Array.isArray(itinerary) ? itinerary : [];

  return (
    <section className="day-calendar-section" id="calendar" aria-label="여행 달력">
      <div className="calendar-heading">
        <span className="eyebrow">여행 달력</span>
        <strong>6일 압축 동선</strong>
      </div>
      <div className="calendar-strip">
        {days.map((day, index) => (
          <a className="calendar-day" href={`#${day.id}`} key={day.id}>
            <span className="calendar-index">{index + 1}일차</span>
            <strong>{day.shortDate || day.date}</strong>
            <span>{day.weekday || ''}</span>
            <em>{day.anchors?.slice(0, 2).join(' · ') || day.title}</em>
          </a>
        ))}
      </div>
    </section>
  );
}

export function PlanOverviewSection({ tripData }) {
  const itinerary = Array.isArray(tripData.itinerary) ? tripData.itinerary : [];
  const notes = Array.isArray(tripData.planningNotes) ? tripData.planningNotes : [];
  const travelers = tripData.meta?.travelers || { adults: 0, children: 0 };
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
  const eventCount = itinerary.reduce((count, day) => count + (Array.isArray(day.timeBlocks) ? day.timeBlocks.length : 0), 0);

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
          <strong>{travelers.adults + travelers.children}명</strong>
          <p>성인 {travelers.adults} · 소아 {travelers.children}</p>
        </article>
        <article className="stat-card">
          <span className="stat-label">일정 밀도</span>
          <strong>{eventCount}개 블록</strong>
          <p>{tripData.meta?.mode || '가족 여행 일정'}</p>
        </article>
        <article className="stat-card">
          <span className="stat-label">숙박 전략</span>
          <strong>{mainStay}</strong>
          <p>복귀 전날 {finalStay} 이동</p>
        </article>
      </div>

      <div className="planning-notes">
        {notes.map((note) => (
          <article className={`note-panel ${toneClass(note.tone)}`} key={note.title}>
            <h3>{note.title}</h3>
            <p>{note.body}</p>
          </article>
        ))}
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
          <span className="info-value muted">
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
              <div className="check-item" key={c.item || i}>
                <span className={`check-icon ${c.required ? 'required' : ''}`}>{c.required ? '필수' : '선택'}</span>
                <EditableText value={c.item} path={['carRental', 'checklist', i, 'item']} editMode={editMode} onUpdate={onUpdate} />
              </div>
            ))}
          </div>
          <h4 className="subsection-label">운전 계획</h4>
          <div className="drive-plan">
            {drivingPlan.map((d, i) => (
              <div className="drive-row" key={d.day || i}>
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
  const stays = Array.isArray(accommodations) ? accommodations : [];
  return (
    <section className="section" id="stays">
      <h2 className="section-title">숙소</h2>
      <div className="grid-2">
        {stays.map((stay, idx) => (
          <div className="card" key={stay.id || stay.name}>
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
                    <EditableText value={String(stay[key] || '')} path={['accommodations', idx, key]} editMode={editMode} onUpdate={onUpdate} />
                  </span>
                </div>
              ))}
            </div>
            {Array.isArray(stay.strategy) && stay.strategy.length > 0 && (
              <div className="chips">
                {stay.strategy.map((s) => <span key={s} className="chip">{s}</span>)}
              </div>
            )}
            <div className="action-row">
              <button className="map-link" type="button" onClick={() => openNaverMap(stay.mapQuery || stay.name)}>
                네이버 지도
              </button>
              {stay.link && (
                <a className="map-link secondary" href={stay.link} target="_blank" rel="noreferrer">
                  저장 링크
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function RestaurantSection({ restaurants, editMode, onUpdate }) {
  const items = Array.isArray(restaurants) ? restaurants : [];
  return (
    <section className="section" id="restaurants">
      <h2 className="section-title">식사 후보</h2>
      <div className="grid-3 restaurant-grid">
        {items.map((rest, idx) => (
          <div className="card restaurant-card" key={rest.id || rest.name}>
            <div className="card-topline compact">
              <h3>
                <EditableText value={rest.name} path={['restaurants', idx, 'name']} editMode={editMode} onUpdate={onUpdate} />
              </h3>
              <span className="badge badge-rest">{rest.meal}</span>
            </div>
            <div className="info-row">
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
            <div className="rest-priority" aria-label={`우선순위 ${starCount(rest.priority)}점`}>
              {Array.from({ length: 5 }, (_, i) => (
                <span key={i} className={`star ${i < starCount(rest.priority) ? '' : 'empty'}`}>★</span>
              ))}
            </div>
            <div className="action-row">
              <button className="map-link" type="button" onClick={() => openNaverMap(rest.mapQuery || rest.name)}>
                네이버 지도
              </button>
              {rest.link && (
                <a className="map-link secondary" href={rest.link} target="_blank" rel="noreferrer">
                  저장 링크
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function TimelineBlock({ block, dayIndex, blockIndex, editMode, onUpdate }) {
  const hasAction = block.mapQuery || block.place || block.link;
  return (
    <li className={`timeline-row status-${block.status || 'planned'} category-${block.category || 'default'}`}>
      <div className="time-column">
        <strong>{block.time}</strong>
        <span>{block.end}</span>
      </div>
      <div className="timeline-main">
        <div className="timeline-meta">
          <span className="category-pill">{categoryLabel(block.category)}</span>
          <span className={`status-pill status-${block.status || 'planned'}`}>{statusLabel(block.status)}</span>
        </div>
        <h4>
          <EditableText
            value={block.title}
            path={['itinerary', dayIndex, 'timeBlocks', blockIndex, 'title']}
            editMode={editMode}
            onUpdate={onUpdate}
          />
        </h4>
        <p className="timeline-place">{block.place}</p>
        {block.note && (
          <p className="timeline-note">
            <EditableText
              value={block.note}
              path={['itinerary', dayIndex, 'timeBlocks', blockIndex, 'note']}
              editMode={editMode}
              onUpdate={onUpdate}
            />
          </p>
        )}
      </div>
      {hasAction && (
        <div className="timeline-actions">
          <button className="map-link" type="button" onClick={() => openNaverMap(blockMapQuery(block))}>
            지도
          </button>
          {block.link && (
            <a className="map-link secondary" href={block.link} target="_blank" rel="noreferrer">
              링크
            </a>
          )}
        </div>
      )}
    </li>
  );
}

export function ItinerarySection({ itinerary, editMode, onUpdate }) {
  const days = Array.isArray(itinerary) ? itinerary : [];

  return (
    <section className="section itinerary-section" id="itinerary">
      <h2 className="section-title">시간표</h2>
      <div className="route-summary">
        {days.map((day) => (
          <a className="route-chip" href={`#${day.id}`} key={day.id}>
            <strong>{day.label}</strong>
            <span>{day.anchors?.join(' · ') || day.title}</span>
          </a>
        ))}
      </div>

      <div className="day-stack">
        {days.map((day, dayIndex) => {
          const blocks = Array.isArray(day.timeBlocks) ? day.timeBlocks : [];
          return (
            <article className="day-plan" id={day.id} key={day.id}>
              <div className="day-plan-header">
                <div>
                  <span className="day-label">{day.label} · {day.shortDate || day.date} {day.weekday || ''}</span>
                  <h3>
                    <EditableText
                      value={day.title}
                      path={['itinerary', dayIndex, 'title']}
                      editMode={editMode}
                      onUpdate={onUpdate}
                    />
                  </h3>
                </div>
                <div className="day-badges">
                  <span className={`badge ${getDayTypeBadgeClass(day.type)}`}>{getDayTypeLabel(day.type)}</span>
                  <span className="badge badge-default">강도 {day.intensity}</span>
                </div>
              </div>
              <p className="day-route">{day.route}</p>
              <div className="chips">
                {(day.highlights || []).map((highlight, highlightIndex) => (
                  <span className="chip" key={highlight}>
                    <EditableText
                      value={highlight}
                      path={['itinerary', dayIndex, 'highlights', highlightIndex]}
                      editMode={editMode}
                      onUpdate={onUpdate}
                    />
                  </span>
                ))}
              </div>
              {day.note && (
                <div className="day-note">
                  <EditableText
                    value={day.note}
                    path={['itinerary', dayIndex, 'note']}
                    editMode={editMode}
                    onUpdate={onUpdate}
                  />
                </div>
              )}
              <ol className="timeline-list">
                {blocks.map((block, blockIndex) => (
                  <TimelineBlock
                    key={`${day.id}-${block.time}-${block.title}`}
                    block={block}
                    dayIndex={dayIndex}
                    blockIndex={blockIndex}
                    editMode={editMode}
                    onUpdate={onUpdate}
                  />
                ))}
              </ol>
            </article>
          );
        })}
      </div>
    </section>
  );
}
