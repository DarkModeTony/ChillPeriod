'use client';

import { useState, useMemo, useRef, useEffect } from 'react';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const CELL_SIZE = 13;
const CELL_GAP = 3;
const TOTAL_CELL = CELL_SIZE + CELL_GAP;

function getColor(attended, bunked) {
  const total = attended + bunked;
  if (total === 0) return '#161b22'; // empty

  // Pure bunk day
  if (attended === 0 && bunked > 0) {
    if (bunked >= 3) return '#b91c1c';
    if (bunked >= 2) return '#991b1b';
    return '#7f1d1d';
  }

  // Mixed day
  if (attended > 0 && bunked > 0) {
    const ratio = attended / total;
    if (ratio >= 0.7) return '#a3e635'; // mostly attended — lime
    return '#f59e0b'; // amber for mixed
  }

  // Pure attended day
  if (attended >= 5) return '#39d353';
  if (attended >= 3) return '#26a641';
  if (attended >= 2) return '#006d32';
  return '#0e4429';
}

export default function AttendanceHeatmap({ attendanceLog = {} }) {
  const [tooltip, setTooltip] = useState(null);
  const scrollRef = useRef(null);

  // Auto-scroll to show the most recent data (right end)
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, [attendanceLog]);

  const { weeks, monthLabels, stats } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Go back ~1 year to the nearest Sunday
    const startDate = new Date(today);
    startDate.setFullYear(startDate.getFullYear() - 1);
    // Rewind to Sunday
    startDate.setDate(startDate.getDate() - startDate.getDay());

    const weeksArr = [];
    const monthLabelsArr = [];
    let totalAttended = 0;
    let totalBunked = 0;
    let activeDays = 0;
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    const current = new Date(startDate);
    let weekIdx = 0;
    let lastMonth = -1;

    while (current <= today) {
      if (!weeksArr[weekIdx]) weeksArr[weekIdx] = [];

      const dateStr = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}-${String(current.getDate()).padStart(2, '0')}`;
      const dayData = attendanceLog[dateStr];
      const attended = dayData?.attended || 0;
      const bunked = dayData?.bunked || 0;

      totalAttended += attended;
      totalBunked += bunked;

      if (attended > 0 || bunked > 0) {
        activeDays++;
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }

      // Month labels — if too close to previous, replace it (keep later month)
      const month = current.getMonth();
      if (month !== lastMonth) {
        const lastEntry = monthLabelsArr[monthLabelsArr.length - 1];
        if (lastEntry && weekIdx - lastEntry.week < 3) {
          lastEntry.label = MONTHS[month];
          lastEntry.week = weekIdx;
        } else {
          monthLabelsArr.push({ label: MONTHS[month], week: weekIdx });
        }
        lastMonth = month;
      }

      weeksArr[weekIdx].push({
        date: dateStr,
        day: current.getDay(),
        attended,
        bunked,
        color: current > today ? '#0d1117' : getColor(attended, bunked),
        isFuture: current > today,
        displayDate: current.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
      });

      current.setDate(current.getDate() + 1);
      if (current.getDay() === 0) weekIdx++;
    }

    // Calculate current streak from today going backwards
    currentStreak = 0;
    const checkDate = new Date(today);
    while (true) {
      const ds = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
      const d = attendanceLog[ds];
      if (d && (d.attended > 0 || d.bunked > 0)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return {
      weeks: weeksArr,
      monthLabels: monthLabelsArr,
      stats: { totalAttended, totalBunked, activeDays, currentStreak, longestStreak }
    };
  }, [attendanceLog]);

  const gridWidth = weeks.length * TOTAL_CELL + 36; // 36px for day labels
  const gridHeight = 7 * TOTAL_CELL + 24; // 24px for month labels

  return (
    <div style={{
      background: 'var(--card-bg)',
      border: '1px solid var(--border-color)',
      borderRadius: '20px',
      padding: '24px',
      marginBottom: '32px',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '20px', flexWrap: 'wrap', gap: '12px'
      }}>
        <div>
          <h3 style={{
            fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)',
            margin: 0, display: 'flex', alignItems: 'center', gap: '8px'
          }}>
            📊 Attendance Activity
          </h3>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
            <strong style={{ color: '#39d353' }}>{stats.totalAttended}</strong> classes attended
            {stats.totalBunked > 0 && <> · <strong style={{ color: '#ef4444' }}>{stats.totalBunked}</strong> bunked</>}
            {' '}in the last year
          </p>
        </div>

        {/* Streak badges */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={{
            padding: '6px 14px', borderRadius: '10px',
            background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)'
          }}>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#10b981', textAlign: 'center' }}>
              {stats.currentStreak}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Streak
            </div>
          </div>
          <div style={{
            padding: '6px 14px', borderRadius: '10px',
            background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)'
          }}>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#a78bfa', textAlign: 'center' }}>
              {stats.longestStreak}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Best
            </div>
          </div>
          <div style={{
            padding: '6px 14px', borderRadius: '10px',
            background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)'
          }}>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#f59e0b', textAlign: 'center' }}>
              {stats.activeDays}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Days
            </div>
          </div>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div ref={scrollRef} style={{ overflowX: 'auto', paddingBottom: '8px', scrollbarWidth: 'thin' }}>
        <div style={{ position: 'relative', minWidth: `${gridWidth}px` }}>
          <svg
            width={gridWidth}
            height={gridHeight}
            style={{ display: 'block' }}
          >
            {/* Month labels */}
            {monthLabels.map((m, i) => (
              <text
                key={i}
                x={36 + m.week * TOTAL_CELL}
                y={12}
                fill="var(--text-muted)"
                fontSize="11"
                fontFamily="inherit"
              >
                {m.label}
              </text>
            ))}

            {/* Day labels */}
            {[1, 3, 5].map(dayIdx => (
              <text
                key={dayIdx}
                x={0}
                y={24 + dayIdx * TOTAL_CELL + CELL_SIZE - 2}
                fill="var(--text-muted)"
                fontSize="10"
                fontFamily="inherit"
              >
                {DAYS[dayIdx]}
              </text>
            ))}

            {/* Cells */}
            {weeks.map((week, wi) =>
              week.map((day, di) => (
                <rect
                  key={day.date}
                  x={36 + wi * TOTAL_CELL}
                  y={24 + di * TOTAL_CELL}
                  width={CELL_SIZE}
                  height={CELL_SIZE}
                  rx={2}
                  ry={2}
                  fill={day.color}
                  style={{
                    cursor: day.isFuture ? 'default' : 'pointer',
                    outline: tooltip?.date === day.date ? '2px solid var(--text-secondary)' : 'none',
                    outlineOffset: '-1px',
                    transition: 'fill 0.15s'
                  }}
                  onMouseEnter={(e) => {
                    if (day.isFuture) return;
                    const rect = e.target.getBoundingClientRect();
                    setTooltip({
                      date: day.date,
                      displayDate: day.displayDate,
                      attended: day.attended,
                      bunked: day.bunked,
                      x: rect.left + rect.width / 2,
                      y: rect.top
                    });
                  }}
                  onMouseLeave={() => setTooltip(null)}
                />
              ))
            )}
          </svg>

          {/* Tooltip */}
          {tooltip && (
            <div style={{
              position: 'fixed',
              left: tooltip.x,
              top: tooltip.y - 8,
              transform: 'translate(-50%, -100%)',
              background: '#1c2128',
              border: '1px solid #30363d',
              borderRadius: '8px',
              padding: '8px 12px',
              fontSize: '12px',
              color: '#e6edf3',
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              zIndex: 50,
              boxShadow: '0 4px 12px rgba(0,0,0,0.4)'
            }}>
              <div style={{ fontWeight: 600, marginBottom: '2px' }}>{tooltip.displayDate}</div>
              {tooltip.attended === 0 && tooltip.bunked === 0 ? (
                <div style={{ color: '#7d8590' }}>No activity</div>
              ) : (
                <div style={{ display: 'flex', gap: '8px' }}>
                  {tooltip.attended > 0 && (
                    <span style={{ color: '#39d353' }}>
                      ✅ {tooltip.attended} attended
                    </span>
                  )}
                  {tooltip.bunked > 0 && (
                    <span style={{ color: '#f87171' }}>
                      ❌ {tooltip.bunked} bunked
                    </span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
        gap: '6px', marginTop: '12px', fontSize: '11px', color: 'var(--text-muted)'
      }}>
        <span>Less</span>
        {['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'].map((c, i) => (
          <div
            key={i}
            style={{
              width: '12px', height: '12px', borderRadius: '2px',
              background: c
            }}
          />
        ))}
        <span>More</span>
        <span style={{ marginLeft: '12px', borderLeft: '1px solid var(--border-color)', paddingLeft: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: '#7f1d1d' }} />
          Bunked
          <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: '#f59e0b' }} />
          Mixed
        </span>
      </div>
    </div>
  );
}
