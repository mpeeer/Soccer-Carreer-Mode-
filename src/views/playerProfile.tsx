import { useState } from 'react'
import type { CSSProperties } from 'react'
import type { Player, ProfileTab, View } from '../types'
import { positionColors, positionTints } from '../data'
import { Icon } from '../utils'
import { PlayerPortrait } from '../portraits/playerPortrait'

interface PlayerProfileProps {
  player: Player
  setActiveView: (v: View) => void
  onShowToast: (msg: string) => void
}

export function PlayerProfile({ player, setActiveView, onShowToast }: PlayerProfileProps) {
  const [tab, setTab] = useState<ProfileTab>('overview')
  const accent = positionColors[player.position] ?? '#1f8a5f'
  const tint = positionTints[player.position] ?? 'rgba(148,163,184,.1)'

  return (
    <div className="ea-fc-theme ea-player-profile" style={{ '--pp-accent': accent, '--pp-tint': tint } as CSSProperties}>
      <header className="ea-top-tabs">
        <div className="ea-brand-mark"><span>NS</span></div>
        <nav className="ea-tab-nav">
          <button className="ea-tab" onClick={() => setActiveView('squad')}>Squad</button>
          <button className="ea-tab ea-tab-primary">Player profile</button>
          <div className="ea-tab-divider" />
          <button className={`ea-tab${tab === 'overview' ? ' ea-tab-active' : ''}`} onClick={() => setTab('overview')}>Overview</button>
          <button className={`ea-tab${tab === 'attributes' ? ' ea-tab-active' : ''}`} onClick={() => setTab('attributes')}>Attributes</button>
          <button className={`ea-tab${tab === 'offers' ? ' ea-tab-active' : ''}`} onClick={() => setTab('offers')}>Offers</button>
          <button className={`ea-tab${tab === 'stats' ? ' ea-tab-active' : ''}`} onClick={() => setTab('stats')}>Stats</button>
        </nav>
      </header>

      {tab === 'attributes' && <AttributesTab player={player} />}
      {tab === 'overview' && <OverviewTab player={player} onShowToast={onShowToast} />}
      {tab === 'offers' && <OffersTab player={player} onShowToast={onShowToast} />}
      {tab === 'stats' && <StatsTab player={player} />}
    </div>
  )
}

function OverviewTab({ player, onShowToast }: { player: Player; onShowToast: (m: string) => void }) {
  const accent = positionColors[player.position] ?? '#1f8a5f'
  const initials = player.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
  return (
    <div className="ea-pp-overview" style={{ '--pp-accent': accent } as CSSProperties}>
      <section className="ea-pp-hero">
        <div className="ea-pp-hero-image">
          <div className="ea-pp-placeholder">
            <PlayerPortrait initials={initials} accent={accent} shirt={player.shirtNumber ?? player.id} size="xl" className="ea-pp-portrait" />
            <span className="ea-pp-image-name">{player.name.split(' ').slice(-1).join('').toUpperCase()}</span>
          </div>
        </div>
        <div className="ea-pp-hero-meta">
          <span className="ea-pp-position">{player.position}</span>
          <h1 className="ea-pp-display-name">{player.name}</h1>
          <div className="ea-pp-rating-block">
            <span className="ea-pp-rating">{player.rating}</span>
            <span className="kicker">Overall</span>
          </div>
          <p className="ea-pp-tagline">{player.club ?? 'NORTHSTAR FC'} · {player.flag ?? 'HQ'} · Age {player.age}</p>
        </div>
      </section>

      <section className="ea-pp-status-grid">
        <div className="ea-pp-status-cell">
          <span>Form</span><strong><Icon>✓</Icon> OK</strong>
        </div>
        <div className="ea-pp-status-cell">
          <span>Morale</span><strong className="orange"><span className="emo">☺</span> Happy</strong>
        </div>
        <div className="ea-pp-status-cell">
          <span>Match fitness</span><strong className="cyan"><Icon>⚡</Icon> Sharp</strong>
        </div>
        <div className="ea-pp-status-cell">
          <span>Condition</span><strong className="lime"><Icon>✓</Icon> Ready</strong>
        </div>
      </section>

      <section className="ea-pp-attributes-grid">
        <div className="ea-pp-attr-cell"><span>Club</span><b>{player.club?.toUpperCase() ?? 'YOUR CLUB'}</b></div>
        <div className="ea-pp-attr-cell"><span>Market value</span><b className="mono">${(player.value / 1_000_000).toFixed(1)}M</b></div>
        <div className="ea-pp-attr-cell"><span>Salary</span><b className="mono">${(player.wage / 1000).toFixed(1)}K/wk</b></div>
        <div className="ea-pp-attr-cell"><span>Contract</span><b>{player.contract} years</b></div>
      </section>

      <section className="ea-pp-skills-grid">
        {['Pace', 'Shooting', 'Passing', 'Dribbling', 'Defending', 'Physical'].map((name, i) => {
          const vals = [player.skills.pace, player.skills.shooting, player.skills.passing, player.skills.dribbling, Math.max(30, player.skills.physical - 30), player.skills.physical]
          return (
            <div className="ea-pp-skill-row" key={name}>
              <span>{name}</span>
              <b>{vals[i]}</b>
            </div>
          )
        })}
      </section>

      <section className="ea-pp-extras-grid">
        <div className="ea-pp-attr-cell"><span>Height · weight</span><b>{player.height ?? '5\'11"'} · {player.weight ?? '170 LBS'}</b></div>
        <div className="ea-pp-attr-cell"><span>Weak foot</span><b>{'★'.repeat(player.weakFoot ?? 4)}</b></div>
        <div className="ea-pp-attr-cell"><span>Preferred foot</span><b>{player.preferredFoot ?? 'Right'}</b></div>
      </section>

      <div className="ea-pp-footer">
        <button className="ea-pp-show-actions" onClick={() => onShowToast('Show actions menu opened')}>Show actions</button>
      </div>
    </div>
  )
}

function AttributesTab({ player }: { player: Player }) {
  return (
    <div className="ea-pp-attrs-tab">
      <div className="ea-pp-radar-wrap">
        <RadarChart player={player} />
      </div>
      <div className="ea-pp-attrs-list">
        {Object.entries(player.skills).map(([key, val]) => (
          <div className="ea-pp-attr-bar" key={key}>
            <span>{key.toUpperCase()}</span>
            <b>{val}</b>
            <div className="ea-pp-attr-bar-track"><i style={{ width: `${val}%`, background: 'var(--accent)' }} /></div>
          </div>
        ))}
      </div>
    </div>
  )
}

function OffersTab({ player, onShowToast }: { player: Player; onShowToast: (m: string) => void }) {
  const offers = [
    { id: 'sp1', club: 'Bayern München', status: 'Pending', color: '#dc052d' },
    { id: 'sp2', club: 'Real Madrid', status: 'Negotiating', color: '#fcbf00' },
    { id: 'sp3', club: 'Man City', status: 'Withdrawn', color: '#6cabdd' },
  ]
  return (
    <div className="ea-pp-offers-tab">
      <div className="ea-pp-offers-grid">
        {offers.map((o) => (
          <article key={o.id} className="ea-pp-offer-card" style={{ '--offer-color': o.color } as CSSProperties}>
            <span className="ea-pp-offer-status">{o.status.toUpperCase()}</span>
            <b className="ea-pp-offer-club">{o.club}</b>
            <p>Proposed fee</p>
            <h3>€{(player.value / 1_000_000).toFixed(0)}M</h3>
            <small>Including add-ons</small>
            <button className="ea-pp-offer-btn" onClick={() => onShowToast(`Reviewing ${o.club} offer`)}>Open negotiation</button>
          </article>
        ))}
      </div>
    </div>
  )
}

function StatsTab({ player }: { player: Player }) {
  const sampleStats = [
    { label: 'Matches', val: 32 },
    { label: 'Goals', val: 14 },
    { label: 'Assists', val: 9 },
    { label: 'Avg rating', val: (player.rating / 12).toFixed(1) },
    { label: 'Yellows', val: 4 },
    { label: 'Reds', val: 0 },
  ]
  return (
    <div className="ea-pp-stats-tab">
      <div className="ea-pp-stats-grid">
        {sampleStats.map((s) => (
          <div className="ea-pp-stat-cell" key={s.label}>
            <span>{s.label}</span>
            <b>{s.val}</b>
          </div>
        ))}
      </div>
    </div>
  )
}

function RadarChart({ player }: { player: Player }) {
  const keys: Array<keyof typeof player.skills> = ['pace', 'shooting', 'passing', 'dribbling', 'physical']
  const vals = keys.map((k) => player.skills[k])
  const cx = 130, cy = 130, r = 90
  const points = vals.map((v, i) => {
    const angle = -Math.PI / 2 + (i / vals.length) * Math.PI * 2
    const scaled = (v / 99) * r
    return [cx + Math.cos(angle) * scaled, cy + Math.sin(angle) * scaled] as const
  })
  const polygon = points.map(([x, y]) => `${x},${y}`).join(' ')
  return (
    <svg viewBox="0 0 260 260" className="ea-pp-radar" aria-label="Attribute radar">
      {[0.4, 0.7, 1].map((scale) => (
        <circle key={scale} cx={cx} cy={cy} r={r * scale} fill="none" stroke="rgba(148,163,184,.15)" />
      ))}
      <polygon points={polygon} fill="rgba(200,255,0,.25)" stroke="var(--accent)" strokeWidth={2} />
      {keys.map((k, i) => {
        const angle = -Math.PI / 2 + (i / keys.length) * Math.PI * 2
        const x = cx + Math.cos(angle) * (r + 14)
        const y = cy + Math.sin(angle) * (r + 14)
        return <text key={k} x={x} y={y} fill="#94a3b8" fontSize="10" textAnchor="middle" dominantBaseline="middle">{k}</text>
      })}
    </svg>
  )
}
