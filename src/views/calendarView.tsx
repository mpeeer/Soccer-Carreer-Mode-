import { PageHeader } from './pageHeader'
import { useState } from 'react'
import type { CareerProfile } from '../types'
import { seasonFixtures } from '../data'
import { Icon } from '../utils'

export function CalendarView({ profile, dateIndex, fixtureResults, simDay, weekNumber, seasonNumber }: { profile: CareerProfile; dateIndex: number; fixtureResults: Record<number, string>; simDay: number; weekNumber: number; seasonNumber: number }) {
  const MONTHS = ['AUG', 'SEP', 'OCT', 'NOV', 'DEC', 'JAN', 'FEB', 'MAR', 'APR', 'MAY']
  const WEEKDAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']
  const currentMonthIndex = Math.min(MONTHS.length - 1, Math.max(0, Math.floor((weekNumber - 1) / 4.2)))
  const [viewMonth, setViewMonth] = useState(currentMonthIndex)
  const currentMonthLabel = `${MONTHS[viewMonth]} 2026`
  const isViewingCurrentMonth = viewMonth === currentMonthIndex
  const monthStartOffset = (viewMonth * 3) % 7

  const monthFixtureIndices: { fixtureIndex: number; approxDay: number }[] = []
  for (let week = 0; week < 38; week++) {
    const monthForWeek = Math.floor(week / 4.2)
    if (monthForWeek === viewMonth) {
      const weekInMonth = week - Math.floor(viewMonth * 4.2)
      const matchDay = (7 + weekInMonth * 7) % 28
      if (matchDay === 0) monthFixtureIndices.push({ fixtureIndex: week, approxDay: 28 })
      else monthFixtureIndices.push({ fixtureIndex: week, approxDay: Math.max(1, Math.min(28, matchDay)) })
    }
  }

  const getDayCell = (day: number) => {
    const matchForDay = monthFixtureIndices.find((m) => m.approxDay === day)
    const fixture = matchForDay !== undefined ? seasonFixtures[matchForDay.fixtureIndex] : null
    const result = matchForDay !== undefined ? fixtureResults[matchForDay.fixtureIndex] : null
    const isMatchDay = Boolean(fixture)
    const isCompleted = Boolean(result)
    const dayWeek = Math.floor(viewMonth * 4.2 + 1 + Math.floor((day - 1 + monthStartOffset) / 7))
    const isToday = isViewingCurrentMonth && dayWeek === weekNumber && simDay === day
    const isDeadline = day === 14 || day === 28
    const isPast = dayWeek < weekNumber || (dayWeek === weekNumber && simDay > day)
    let cellClass = 'calendar-day'
    if (isToday) cellClass += ' today'
    if (isMatchDay && isCompleted) cellClass += ' match-completed'
    if (isMatchDay && !isCompleted && !isPast) cellClass += ' match-upcoming'
    if (isMatchDay && !isCompleted && isPast) cellClass += ' match-past'
    if (isDeadline && !isPast) cellClass += ' deadline'
    if (isDeadline && isPast) cellClass += ' deadline-past'
    if (isToday && !isMatchDay && !isDeadline) cellClass += ' training'
    if (isPast && !isMatchDay && !isDeadline && !isToday) cellClass += ' past'
    return { cellClass, fixture, result, isMatchDay, isCompleted, isToday, isDeadline, isPast }
  }

  const legendItems = [
    { label: 'Matchday', cls: 'match-upcoming' },
    { label: 'Completed', cls: 'match-completed' },
    { label: 'Training', cls: 'training-sample' },
    { label: 'Deadline', cls: 'deadline' },
    { label: 'Today', cls: 'today' },
  ]

  return (
    <>
      <PageHeader
        eyebrow={`Calendar · ${currentMonthLabel} · Season 0${seasonNumber}`}
        title="Calendar"
        description={`${currentMonthLabel} · Season 0${seasonNumber} · ${profile.clubName}`}
        action={
          <div style={{ display: 'flex', gap: 'var(--s-2)' }}>
            <button className="btn btn-ghost btn-sm" onClick={() => setViewMonth(Math.max(0, viewMonth - 1))} disabled={viewMonth === 0}><Icon>←</Icon> Prev</button>
            <button className="btn btn-primary btn-sm" onClick={() => setViewMonth(currentMonthIndex)} disabled={isViewingCurrentMonth}>{isViewingCurrentMonth ? 'Current' : 'Jump to today'} <Icon>◷</Icon></button>
            <button className="btn btn-ghost btn-sm" onClick={() => setViewMonth(Math.min(MONTHS.length - 1, viewMonth + 1))} disabled={viewMonth === MONTHS.length - 1}>Next <Icon>→</Icon></button>
          </div>
        }
      />

      <section className="panel flush" style={{ padding: 'var(--s-5)' }}>
        <div style={{ display: 'flex', gap: 'var(--s-4)', flexWrap: 'wrap', marginBottom: 'var(--s-5)' }}>
          {legendItems.map((item) => (
            <span key={item.label} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 'var(--t-xs)' }}>
              <i style={{
                width: 28, height: 16, borderRadius: 4,
                background: item.cls === 'match-upcoming' ? 'var(--accent-dim)' :
                            item.cls === 'match-completed' ? 'var(--surface-3)' :
                            item.cls === 'deadline' ? 'rgba(240,160,64,0.12)' :
                            item.cls === 'today' ? 'var(--accent)' :
                            'var(--surface-1)',
                border: '1px solid var(--line)',
              }}></i>
              {item.label}
            </span>
          ))}
        </div>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
          fontSize: 11, color: 'var(--text-dim)', fontWeight: 600,
          letterSpacing: '0.06em', textTransform: 'uppercase',
          padding: 'var(--s-3) 0', borderBottom: '1px solid var(--line)',
        }}>
          {WEEKDAYS.map((wd) => <span key={wd}>{wd}</span>)}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 'var(--s-2)', marginTop: 'var(--s-3)' }}>
          {Array.from({ length: monthStartOffset }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => {
            const { cellClass, fixture, result, isMatchDay, isDeadline, isToday } = getDayCell(day)
            return (
              <div
                key={day}
                className={cellClass}
                style={{
                  minHeight: 60, padding: 'var(--s-2) var(--s-3)',
                  borderRadius: 'var(--r-sm)', border: '1px solid var(--line)',
                  background: isToday ? 'var(--accent-dim)' : isMatchDay ? 'var(--surface-2)' : 'transparent',
                  borderColor: isToday ? 'var(--accent)' : 'var(--line)',
                  display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                }}
              >
                <span className="mono" style={{ fontSize: 'var(--t-xs)', color: 'var(--text-muted)', fontWeight: 700 }}>{day}</span>
                {isMatchDay && fixture && (
                  <span className="pill" style={{ alignSelf: 'flex-start', fontSize: 10 }}>{fixture.short}{result ? ` ${result}` : ''}</span>
                )}
                {isDeadline && <span className="pill warn" style={{ alignSelf: 'flex-start', fontSize: 10 }}>{day === 14 ? 'Opens' : 'Deadline'}</span>}
                {isToday && !isMatchDay && !isDeadline && <span className="pill accent" style={{ alignSelf: 'flex-start', fontSize: 10 }}>Today</span>}
              </div>
            )
          })}
        </div>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--s-5)', marginTop: 'var(--s-5)' }}>
        <section className="panel">
          <div className="panel-head">
            <div><span className="kicker">This month</span><h3>Upcoming fixtures</h3></div>
          </div>
          <div className="panel-rows">
            {monthFixtureIndices.filter((m) => !fixtureResults[m.fixtureIndex]).slice(0, 4).map((m) => {
              const f = seasonFixtures[m.fixtureIndex]
              return (
                <div className="panel-row" key={m.fixtureIndex}>
                  <div className="row-icon">◉</div>
                  <div className="row-text"><b>{f.opponent}</b><small>{f.competition} · {f.home ? 'Home' : 'Away'} · Week {m.fixtureIndex + 1}</small></div>
                  <span className={`pill ${f.difficulty === 'High' ? 'bad' : f.difficulty === 'Medium' ? 'warn' : 'good'}`}>{f.difficulty}</span>
                </div>
              )
            })}
            {monthFixtureIndices.filter((m) => !fixtureResults[m.fixtureIndex]).length === 0 && (
              <div style={{ textAlign: 'center', padding: 'var(--s-5)' }}>
                <b style={{ display: 'block', fontWeight: 700 }}>No upcoming fixtures</b>
                <p className="muted" style={{ marginTop: 4 }}>All matches this month have been resolved.</p>
              </div>
            )}
          </div>
        </section>
        <section className="panel">
          <div className="panel-head">
            <div><span className="kicker">Recent</span><h3>Results this month</h3></div>
          </div>
          <div className="panel-rows">
            {monthFixtureIndices.filter((m) => fixtureResults[m.fixtureIndex]).slice(0, 4).map((m) => {
              const f = seasonFixtures[m.fixtureIndex]
              const r = fixtureResults[m.fixtureIndex]
              return (
                <div className="panel-row" key={m.fixtureIndex}>
                  <div className="row-icon accent">✓</div>
                  <div className="row-text"><b>{f.short} {r}</b><small>{f.competition} · Week {m.fixtureIndex + 1}</small></div>
                  <span className="kicker">FINAL</span>
                </div>
              )
            })}
            {monthFixtureIndices.filter((m) => fixtureResults[m.fixtureIndex]).length === 0 && (
              <div style={{ textAlign: 'center', padding: 'var(--s-5)' }}>
                <b style={{ display: 'block', fontWeight: 700 }}>No results yet</b>
                <p className="muted" style={{ marginTop: 4 }}>Your first match result this month will appear here.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  )
}
