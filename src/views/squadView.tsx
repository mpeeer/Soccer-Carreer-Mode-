import type { Player } from '../types'
import { positionColors } from '../data'
import { formatMoney, Icon } from '../utils'
import { useMemo, useState } from 'react'

/* ──────────────────────────────────────────────────────────────
   FM SQUAD — dense player table on left, squad feedback on right
   ────────────────────────────────────────────────────────────── */
export function SquadView({ players, selectedPlayer, setSelectedPlayerId, openModal }: { players: Player[]; selectedPlayer: Player; setSelectedPlayerId: (id: number) => void; openModal: (title: string) => void }) {
  const [posFilter, setPosFilter] = useState<'All' | 'GK' | 'DEF' | 'MID' | 'ATT'>('All')
  const positions = ['All', 'GK', 'DEF', 'MID', 'ATT'] as const
  const filtered = useMemo(() => posFilter === 'All' ? players : players.filter((p) => {
    if (posFilter === 'GK') return p.position === 'GK'
    if (posFilter === 'DEF') return ['CB', 'LB', 'RB'].includes(p.position)
    if (posFilter === 'MID') return ['DM', 'CM', 'AM', 'LM', 'RM', 'CAM', 'CDM'].includes(p.position)
    return ['ST', 'LW', 'RW', 'CF'].includes(p.position)
  }), [players, posFilter])

  const ratings = players.map((p, i) => {
    const r = p.rating
    if (r >= 85) return 'exc'
    if (r >= 80) return 'good'
    if (r >= 75) return 'avg'
    if (r >= 70) return 'below'
    return 'poor'
  })

  const posRatings: Record<string, { count: number; avg: number; min: number; max: number }> = {}
  ;['GK', 'CB', 'LB', 'RB', 'DM', 'CM', 'AM', 'LW', 'RW', 'ST'].forEach((pos) => {
    const subset = players.filter((p) => p.position === pos)
    if (subset.length === 0) return
    const avg = subset.reduce((t, p) => t + p.rating, 0) / subset.length
    const min = Math.min(...subset.map((p) => p.rating))
    const max = Math.max(...subset.map((p) => p.rating))
    posRatings[pos] = { count: subset.length, avg: Math.round(avg), min, max }
  })

  return (
    <>
      <header className="page-header" style={{ marginBottom: 'var(--s-4)' }}>
        <div>
          <span className="kicker">Squad · 35 players · Average 26 yo</span>
          <h1>Brighton · First Team</h1>
          <p>Select a player to view their report. Transfer & loan lists sit on the Recruitment tab.</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--s-2)' }}>
          <button className="btn btn-ghost" onClick={() => openModal('Export report')}>
            <Icon>↓</Icon> Export
          </button>
          <button className="btn btn-primary" onClick={() => openModal('Squad actions')}>
            Squad actions <Icon>→</Icon>
          </button>
        </div>
      </header>

      <div className="squad-grid">
        {/* Left: player table */}
        <section className="panel flush">
          <div className="panel-head" style={{ gap: 'var(--s-4)' }}>
            <div className="squad-tabs">
              {positions.map((pos) => (
                <button
                  key={pos}
                  className={`squad-tab${posFilter === pos ? ' active' : ''}`}
                  onClick={() => setPosFilter(pos)}
                >
                  {pos} <span className="muted">{
                    pos === 'All' ? players.length :
                    pos === 'GK' ? players.filter((p) => p.position === 'GK').length :
                    pos === 'DEF' ? players.filter((p) => ['CB','LB','RB'].includes(p.position)).length :
                    pos === 'MID' ? players.filter((p) => ['DM','CM','AM','LM','RM','CAM','CDM'].includes(p.position)).length :
                    players.filter((p) => ['ST','LW','RW','CF'].includes(p.position)).length
                  }</span>
                </button>
              ))}
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 'var(--s-2)', alignItems: 'center' }}>
              <select className="btn btn-ghost btn-sm" defaultValue="ability">
                <option value="ability">Sort: Ability ↓</option>
                <option>Sort: Potential ↓</option>
                <option>Sort: Age ↑</option>
                <option>Sort: Value ↓</option>
              </select>
              <button className="btn btn-icon btn-ghost">⚙</button>
            </div>
          </div>

          <table className="fm-table">
            <thead>
              <tr>
                <th className="rank">#</th>
                <th>Info</th>
                <th>Player</th>
                <th>Nat</th>
                <th>Age</th>
                <th>Pre</th>
                <th>Morale</th>
                <th>Con</th>
                <th>Shp</th>
                <th>Ability</th>
                <th>Potential</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => {
                const ratingClass = ratings[i]
                return (
                  <tr
                    key={p.id}
                    className={selectedPlayer.id === p.id ? 'selected' : ''}
                    onClick={() => setSelectedPlayerId(p.id)}
                  >
                    <td className="rank">{i + 1}</td>
                    <td className="num">{p.position}</td>
                    <td className="name">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 24, height: 24, borderRadius: 4, background: p.color, color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 10 }}>{p.initials}</div>
                        <div>
                          <div>{p.name}</div>
                          {p.role && <small className="muted" style={{ fontSize: 10 }}>{p.role}</small>}
                        </div>
                      </div>
                    </td>
                    <td>{p.flag ?? 'HQ'}</td>
                    <td className="num">{p.age}</td>
                    <td>
                      <span className="pill">{p.fitness >= 90 ? '●' : p.fitness >= 80 ? '◐' : '○'} {Math.round(p.fitness)}%</span>
                    </td>
                    <td className="num">{p.morale}</td>
                    <td className="num">-</td>
                    <td className="num">-</td>
                    <td><span className={`rating ${ratingClass}`}>{p.rating}</span></td>
                    <td><span className="rating">{p.potential}</span></td>
                    <td className="num">{formatMoney(p.value)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </section>

        {/* Right rail: squad feedback, medical, role */}
        <aside className="squad-side">
          <section className="panel">
            <div className="panel-head">
              <div>
                <span className="kicker">Squad Feedback</span>
                <h3 style={{ fontSize: 'var(--t-md)', marginTop: 2 }}>From the staff</h3>
              </div>
            </div>
            <div className="panel-rows">
              <div className="panel-row">
                <span className="row-icon accent">✦</span>
                <div className="row-text"><b className="accent">Board</b><small>Unchecked</small></div>
                <span className="pill">—</span>
              </div>
              <div className="panel-row">
                <span className="row-icon">⚐</span>
                <div className="row-text"><b>Supporters</b><small>Buzzing</small></div>
                <span className="pill good">+8%</span>
              </div>
            </div>
          </section>

          <section className="panel">
            <div className="panel-head">
              <div>
                <span className="kicker">Medical Centre</span>
                <h3 style={{ fontSize: 'var(--t-md)', marginTop: 2 }}>Casualties</h3>
              </div>
              <button className="kicker accent" style={{ background: 'transparent' }}>+ 5 others</button>
            </div>
            <div className="panel-rows">
              <div className="panel-row">
                <span className="row-icon accent">!</span>
                <div className="row-text"><b>6 players injured</b><small>Adam Webster · Solly March · 4 others</small></div>
              </div>
              <div className="panel-row">
                <span className="row-icon">⏿</span>
                <div className="row-text"><b>2 players ill</b><small>Moises Caicedo (back)</small></div>
              </div>
            </div>
          </section>

          <section className="panel">
            <div className="panel-head">
              <div>
                <span className="kicker">Position depth</span>
                <h3 style={{ fontSize: 'var(--t-md)', marginTop: 2 }}>Squad Planner</h3>
              </div>
              <button className="kicker accent" style={{ background: 'transparent' }}>Open ›</button>
            </div>
            <div className="panel-rows" style={{ overflowY: 'auto', maxHeight: 360 }}>
              {Object.entries(posRatings).map(([pos, info]) => (
                <div key={pos} className="panel-row">
                  <span className="row-icon" style={{ background: positionColors[pos as keyof typeof positionColors] ?? 'var(--surface-3)', color: '#fff', fontWeight: 700, fontSize: 9 }}>{pos}</span>
                  <div className="row-text"><b>{info.count} {pos === 'GK' ? 'goalkeepers' : pos === 'CB' ? 'centre-backs' : pos.includes('B') ? 'full-backs' : pos === 'CM' || pos === 'DM' ? 'midfielders' : 'forwards'}</b><small>Avg <b className="mono">{info.avg}</b> · <span className="muted">{info.min}–{info.max}</span></small></div>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </>
  )
}

export function DynamicBar({ label, value }: { label: string; value: number; color?: string }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span className="muted" style={{ fontSize: 'var(--t-xs)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</span>
        <b className="mono" style={{ fontSize: 'var(--t-sm)', fontWeight: 600 }}>{value}</b>
      </div>
      <div className="bar">
        <i style={{ width: `${Math.min(100, value)}%`, background: 'var(--accent)' }} />
      </div>
    </div>
  )
}
