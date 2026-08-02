import { useState } from 'react'
import type { CareerProfile } from '../types'
import { seasonFixtures } from '../data'
import { Icon } from '../utils'

const MONTHS = ['AUG', 'SEP', 'OCT', 'NOV', 'DEC', 'JAN', 'FEB', 'MAR', 'APR', 'MAY']
const WEEKDAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']

export function CalendarView({ profile, dateIndex, fixtureResults, simDay, weekNumber, seasonNumber }: { profile: CareerProfile; dateIndex: number; fixtureResults: Record<number, string>; simDay: number; weekNumber: number; seasonNumber: number }) {
  const currentMonthIndex = Math.min(MONTHS.length - 1, Math.max(0, Math.floor((weekNumber - 1) / 3.4)))
  const [viewMonth, setViewMonth] = useState(currentMonthIndex)
  const isViewingCurrentMonth = viewMonth === currentMonthIndex
  const monthLabel = `${MONTHS[viewMonth]} 2026`

  // Build out the month grid: 35 cells (5 weeks)
  const firstDayOffset = (viewMonth * 4) % 7
  const totalDays = 31

  const cells: { day: number | null; fixture?: typeof seasonFixtures[number]; isToday?: boolean; inMonth?: boolean }[] = []
  for (let i = 0; i < firstDayOffset; i++) cells.push({ day: null })
  for (let d = 1; d <= totalDays; d++) {
    // Determine fixture for this day: matches roughly = [(day + 8) % 38] in season
    const fixtureIndex = ((viewMonth * 4 + Math.floor((d - 1) / 7)) % seasonFixtures.length)
    const isToday = isViewingCurrentMonth && Math.ceil(simDay / 7) === Math.floor((d - 1) / 7) + 1
    const f = seasonFixtures[fixtureIndex]
    cells.push({ day: d, fixture: f, isToday, inMonth: true })
  }
  while (cells.length % 7 !== 0) cells.push({ day: null })

  const legendItems = [
    { label: 'Matchday', color: 'rgba(123,63,242,0.30)', border: 'rgba(123,63,242,0.40)' },
    { label: 'Training', color: 'rgba(255,255,255,0.06)', border: 'rgba(255,255,255,0.10)' },
    { label: 'Deadline', color: 'rgba(249,115,22,0.18)', border: 'rgba(249,115,22,0.40)' },
    { label: 'Today', color: 'rgba(123,63,242,0.40)', border: 'rgba(123,63,242,0.60)' },
  ]

  return (
    <>
      <header className="page-header" style={{ marginBottom: 'var(--s-4)' }}>
        <div>
          <span className="kicker">Club · Calendar</span>
          <h1>{monthLabel} · Season 0{seasonNumber}</h1>
          <p>{profile.clubName} · {profile.league}. Tap a fixture for the match report.</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--s-2)', alignItems: 'center' }}>
          <button className="btn btn-ghost btn-sm" onClick={() => setViewMonth(Math.max(0, viewMonth - 1))} disabled={viewMonth === 0}>
            <Icon>←</Icon> Prev
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => setViewMonth(currentMonthIndex)} disabled={isViewingCurrentMonth}>
            {isViewingCurrentMonth ? 'Current' : 'Jump to today'} <Icon>◷</Icon>
          </button>
          <button className="btn btn-ghost btn-sm" onClick={() => setViewMonth(Math.min(MONTHS.length - 1, viewMonth + 1))} disabled={viewMonth === MONTHS.length - 1}>
            Next <Icon>→</Icon>
          </button>
        </div>
      </header>

      <section className="panel flush" style={{ marginBottom: 'var(--s-4)' }}>
        <div className="panel-head">
          <div style={{ display: 'flex', gap: 'var(--s-4)', flexWrap: 'wrap' }}>
            {legendItems.map((item) => (
              <span key={item.label} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 'var(--t-xs)' }}>
                <i style={{ width: 24, height: 12, borderRadius: 3, background: item.color, border: '1px solid ' + item.border, display: 'inline-block' }} />
                {item.label}
              </span>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 'var(--s-2)', alignItems: 'center' }}>
            <span className="kicker">VIEW · MONTHLY</span>
            <button className="btn btn-ghost btn-sm">+ Add event</button>
          </div>
        </div>

        <div className="cal-month-head">
          {WEEKDAYS.map((wd) => <span key={wd}>{wd}</span>)}
        </div>

        <div className="cal-month" style={{ borderRadius: 0, border: 0 }}>
          {cells.map((cell, i) => {
            const isMatch = Boolean(cell.fixture)
            const result = cell.fixture ? fixtureResults[(viewMonth * 4 + Math.floor((cell.day! - 1) / 7)) % seasonFixtures.length] : null
            const isToday = cell.isToday
            const isDeadline = cell.day ? (cell.day === 14 || cell.day === 28) : false
            const isPast = !isToday && cell.day != null && cell.day < simDay
            const styleClasses = [
              'cal-cell',
              cell.day == null && 'empty',
              isMatch && 'has-fixture',
              isMatch && result && 'match-completed',
              isMatch && !result && isPast && 'match-past',
              isMatch && !result && !isPast && 'match-upcoming',
              isDeadline && !isPast && 'deadline',
              isToday && 'today',
            ].filter(Boolean).join(' ')
            return (
              <div key={i} className={styleClasses} style={{
                background: isToday ? 'var(--accent-dim)' : (isMatch ? (result ? 'var(--surface-2)' : 'linear-gradient(180deg, var(--accent-dim) 0%, rgba(123,63,242,0) 80%)') : 'transparent'),
                borderColor: isToday ? 'var(--accent)' : 'var(--line)',
              }}>
                {cell.day != null && (
                  <>
                    <span className="day-num">{cell.day}</span>
                    {cell.fixture && (
                      <span className="cal-event match" style={{ background: result ? 'var(--surface-2)' : 'var(--accent-dim)', color: result ? 'var(--text-muted)' : 'var(--accent-hot)' }}>
                        {cell.fixture.short}{result ? ` ${result}` : ''}
                      </span>
                    )}
                    {!cell.fixture && (cell.day % 2 === 0 && cell.day % 7 !== 0) && (
                      <span className="cal-event training">Training</span>
                    )}
                    {isDeadline && (
                      <span className="cal-event deadline">{cell.day === 14 ? 'Window opens' : 'Deadline'}</span>
                    )}
                  </>
                )}
              </div>
            )
          })}
        </div>
      </section>

      <div className="grid-2">
        <section className="panel">
          <div className="panel-head">
            <div>
              <span className="kicker">This month</span>
              <h3 style={{ fontSize: 'var(--t-md)', marginTop: 2 }}>Upcoming fixtures</h3>
            </div>
            <button className="btn btn-ghost btn-sm">View all →</button>
          </div>
          <div className="panel-rows">
            {seasonFixtures.slice(viewMonth * 4, viewMonth * 4 + 4).map((f, i) => {
              const idx = viewMonth * 4 + i
              const result = fixtureResults[idx]
              return (
                <div className="panel-row" key={idx}>
                  <span className="row-icon" style={{ background: f.home ? '#1f8a5f' : '#e96a59', color: '#fff', fontWeight: 700 }}>{f.home ? 'H' : 'A'}</span>
                  <div className="row-text"><b>{f.opponent}</b><small>{f.competition} · Week {idx + 1} · {f.date}</small></div>
                  <span className={`pill ${f.difficulty === 'High' ? 'bad' : f.difficulty === 'Medium' ? 'warn' : 'good'}`}>{f.difficulty}</span>
                  {result && <b className="mono" style={{ fontSize: 'var(--t-sm)' }}>{result}</b>}
                </div>
              )
            })}
          </div>
        </section>

        <section className="panel">
          <div className="panel-head">
            <div>
              <span className="kicker">Season margins</span>
              <h3 style={{ fontSize: 'var(--t-md)', marginTop: 2 }}>Team of the week</h3>
            </div>
            <button className="btn btn-link">Compile →</button>
          </div>
          <div style={{ padding: 'var(--s-3)' }}>
            <b style={{ fontSize: 'var(--t-lg)', display: 'block', marginBottom: 6 }}>English Premier League · 1 hour ago</b>
            <p className="muted" style={{ fontSize: 'var(--t-sm)', lineHeight: 1.5 }}>
              David Raya, Reece, William Saliba, Levi Colwill, Mikel Merino, Declan Rice, Bruno Guimaraes, Semenyo, Florian Wirtz, van Dijk and Mavropanos were selected as the Premier League Team of the Week.
            </p>
            <div style={{ display: 'flex', gap: 'var(--s-2)', marginTop: 'var(--s-3)' }}>
              <button className="btn btn-primary btn-sm">Open story →</button>
              <button className="btn btn-ghost btn-sm">Share</button>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
