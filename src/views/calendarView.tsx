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
  // Compute which weeks fall in this view month
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
    // Compute which week this day falls in: first week of the month starts at viewMonth*4.2+1
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
    { label: 'Matchday', cls: 'match-upcoming', dot: '◉' },
    { label: 'Completed', cls: 'match-completed', dot: '✓' },
    { label: 'Training', cls: 'training-sample', dot: '◌' },
    { label: 'Deadline', cls: 'deadline', dot: '⟁' },
    { label: 'Today', cls: 'today', dot: '◉' },
  ]
  return <>
    <PageHeader eyebrow={`CALENDAR · ${currentMonthLabel} · SEASON ${String(seasonNumber).padStart(2, '0')}`} title="Calendar" description={`${currentMonthLabel} · Season ${String(seasonNumber).padStart(2, '0')} · ${profile.clubName}`} action={<div className="calendar-nav"><button className="outline-button" onClick={() => setViewMonth(Math.max(0, viewMonth - 1))} disabled={viewMonth === 0}><Icon>←</Icon> Prev</button><button className="primary-button" onClick={() => setViewMonth(currentMonthIndex)} disabled={isViewingCurrentMonth}>{isViewingCurrentMonth ? 'Current' : 'Jump to today'} <Icon>◷</Icon></button><button className="outline-button" onClick={() => setViewMonth(Math.min(MONTHS.length - 1, viewMonth + 1))} disabled={viewMonth === MONTHS.length - 1}>Next <Icon>→</Icon></button></div>} />
    <div className="calendar-panel panel">
      <div className="calendar-legend">{legendItems.map((item) => <span key={item.label}><i className={`legend-sample ${item.cls}`}>{item.dot}</i>{item.label}</span>)}</div>
      <div className="calendar-weekdays">{WEEKDAYS.map((wd) => <span key={wd}>{wd}</span>)}</div>
      <div className="calendar-grid">
        {Array.from({ length: monthStartOffset }).map((_, i) => <div key={`empty-${i}`} className="calendar-day empty" />)}
        {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => {
          const { cellClass, fixture, result, isMatchDay, isDeadline, isToday } = getDayCell(day)
          return <div key={day} className={cellClass} title={fixture ? `${fixture.opponent}${result ? ` · ${result}` : ''}${isToday ? ' · TODAY' : ''}` : isDeadline ? `Transfer deadline${isToday ? ' · TODAY' : ''}` : isToday ? 'Today · Training' : ''}>
            <span className="day-num">{day}</span>
            {isMatchDay && fixture && <span className="day-badge match-badge" style={{ background: fixture.crest }}>{fixture.short}{result ? ` ${result}` : ''}</span>}
            {isDeadline && <span className="day-badge deadline-badge">{day === 14 ? 'Window opens' : 'Deadline day'}</span>}
            {isToday && !isMatchDay && !isDeadline && <span className="day-badge today-badge">Training</span>}
          </div>
        })}
      </div>
    </div>
    <div className="calendar-side-panels">
      <section className="panel calendar-fixtures">
        <div className="panel-heading"><div><span className="section-kicker">THIS MONTH</span><h3>Upcoming fixtures</h3></div></div>
        {monthFixtureIndices.filter((m) => !fixtureResults[m.fixtureIndex]).slice(0, 5).map((m) => {
          const f = seasonFixtures[m.fixtureIndex]
          return <div className="brief-item" key={m.fixtureIndex}><div className="brief-icon purple">◉</div><div><b>{f.opponent}</b><p>{f.competition} · {f.home ? 'Home' : 'Away'} · Week {m.fixtureIndex + 1}</p></div><span className={`difficulty ${f.difficulty.toLowerCase()}`}>{f.difficulty}</span></div>
        })}
        {monthFixtureIndices.filter((m) => !fixtureResults[m.fixtureIndex]).length === 0 && <div className="empty-state"><h3>No upcoming fixtures</h3><p>All matches this month have been resolved.</p></div>}
      </section>
      <section className="panel calendar-results">
        <div className="panel-heading"><div><span className="section-kicker">RECENT</span><h3>Results this month</h3></div></div>
        {monthFixtureIndices.filter((m) => fixtureResults[m.fixtureIndex]).slice(0, 5).map((m) => {
          const f = seasonFixtures[m.fixtureIndex]
          const r = fixtureResults[m.fixtureIndex]
          return <div className="brief-item" key={m.fixtureIndex}><div className="brief-icon lime">✓</div><div><b>{f.short} {r}</b><p>{f.competition} · Week {m.fixtureIndex + 1}</p></div><span className="brief-time">FINAL</span></div>
        })}
        {monthFixtureIndices.filter((m) => fixtureResults[m.fixtureIndex]).length === 0 && <div className="empty-state"><h3>No results yet</h3><p>Your first match result this month will appear here.</p></div>}
      </section>
    </div>
  </>
}

