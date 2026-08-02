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
      {/* Top tabs */}
      <header className="ea-top-tabs">
        <div className="ea-brand-mark" aria-label="My Career">
          <span>MC</span>
        </div>
        <nav className="ea-tab-nav">
          <button className="ea-tab" onClick={() => setActiveView('squad')}>Squad</button>
          <button className="ea-tab ea-tab-primary">Player Profile</button>
          <div className="ea-tab-divider" />
          <button className={`ea-tab ${tab === 'overview' ? 'ea-tab-active' : ''}`} onClick={() => setTab('overview')}>Overview</button>
          <button className={`ea-tab ${tab === 'attributes' ? 'ea-tab-active' : ''}`} onClick={() => setTab('attributes')}>Attributes</button>
          <button className={`ea-tab ${tab === 'offers' ? 'ea-tab-active' : ''}`} onClick={() => setTab('offers')}>Offers</button>
          <button className={`ea-tab ${tab === 'stats' ? 'ea-tab-active' : ''}`} onClick={() => setTab('stats')}>Stats</button>
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
  return (
    <div className="ea-pp-overview" style={{ '--pp-accent': accent } as CSSProperties}>
      <section className="ea-pp-hero">
        <div className="ea-pp-hero-image">
          <div className="ea-pp-placeholder">
            <PlayerPortrait initials={player.initials} accent={accent} shirt={player.shirtNumber ?? player.id} size="xl" className="ea-pp-portrait" />
            <span className="ea-pp-handwritten-age">
              <b>{Math.floor(Number(player.dob?.match(/\d+/)?.[0] ?? player.age))}</b>
              <small>Age (Date of Birth)</small>
            </span>
            <span className="ea-pp-image-name">{player.name.split(' ').slice(-1).join('').toUpperCase()}</span>
          </div>
        </div>
        <div className="ea-pp-hero-meta">
          <span className="ea-pp-position">{player.position}{player.position === 'RM' ? ' · LM · ST · LW' : ' · LM · ST · LW'}</span>
          <h1 className="ea-pp-display-name">{player.name.split(' ').map((n) => n[0]).join('')}. {player.name.split(' ').slice(-1).join('').toUpperCase()}</h1>
          <div className="ea-pp-rating-block">
            <span className="ea-pp-rating">{player.rating}</span>
            <div className="ea-pp-rating-stars">
              {[1,2,3,4,5,6,7].map((s) => <i key={s}>★</i>)}
              <span className="ea-pp-rating-label">{`${player.rating} ${player.rating} 0 OVR 0 OVR 0 OVR`}</span>
            </div>
          </div>
          <p className="ea-pp-tagline">An Exciting Prospect,<br/>Happy With Current Terms.</p>
        </div>
      </section>

      <section className="ea-pp-status-grid">
        <div className="ea-pp-status-cell">
          <span>Form</span>
          <strong className="lime">
            <Icon>✓</Icon>OK
          </strong>
        </div>
        <div className="ea-pp-status-cell">
          <span>Morale</span>
          <strong className="orange">
            <span className="emo">☺</span>HAPPY
          </strong>
        </div>
        <div className="ea-pp-status-cell">
          <span>Match Fitness</span>
          <strong className="cyan">
            <Icon>⚡</Icon>SHARP
          </strong>
        </div>
        <div className="ea-pp-status-cell">
          <span>Condition</span>
          <strong className="lime">
            <Icon>✓</Icon>READY TO PLAY
          </strong>
        </div>
      </section>

      <section className="ea-pp-attributes-grid">
        <div className="ea-pp-attr-cell">
          <span>Club</span>
          <b>{player.club?.toUpperCase() ?? 'YOUR CLUB'} · <i style={{ fontStyle: 'normal' }}>J</i></b>
        </div>
        <div className="ea-pp-attr-cell">
          <span>Expected Market Value (xTV)</span>
          <b>$${(player.value / 1_000_000).toFixed(1)}M<i className="stars">★★★★★</i></b>
        </div>
        <div className="ea-pp-attr-cell">
          <span>Nationality/Region</span>
          <b>{player.flag ?? 'HQ'}<i className="flag-line"> TÜRKIYE</i></b>
        </div>
        <div className="ea-pp-attr-cell">
          <span>Weekly Wage</span>
          <b>$${(player.wage / 1000).toFixed(1)}K<i className="stars">★★★★★</i></b>
        </div>
      </section>

      <section className="ea-pp-skills-grid">
        {[
          { name: 'Pace', val: player.skills.pace + 4 },
          { name: 'Shooting', val: player.skills.shooting },
          { name: 'Passing', val: player.skills.passing + 4 },
          { name: 'Dribbling', val: player.skills.dribbling + 4 },
          { name: 'Defending', val: Math.max(30, player.skills.pace - 50) },
          { name: 'Physical', val: player.skills.physical },
        ].map((s) => (
          <div className="ea-pp-skill-row" key={s.name}>
            <span>{s.name}</span>
            <b>{s.val}</b>
          </div>
        ))}
      </section>

      <section className="ea-pp-extras-grid">
        <div className="ea-pp-attr-cell"><span>Height & Weight</span><b>{player.height} / {player.weight}</b></div>
        <div className="ea-pp-attr-cell"><span>Weak Foot</span><b>{'★'.repeat(player.weakFoot ?? 4)}</b></div>
        <div className="ea-pp-attr-cell"><span>Contract Until</span><b>31 JUL {2026 + (player.contract ?? 3)}</b></div>
        <div className="ea-pp-attr-cell"><span>Release Clause</span><b>NONE</b></div>
        <div className="ea-pp-attr-cell"><span>Preferred Foot</span><b>{player.preferredFoot ?? 'Right'}</b></div>
      </section>

      <footer className="ea-pp-footer">
        <button className="ea-pp-show-actions" onClick={() => onShowToast('Show Actions menu opened')}>Show Actions</button>
      </footer>
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
            <div className="ea-pp-attr-bar-track"><i style={{ width: `${val}%`, background: '#00d4ff' }} /></div>
          </div>
        ))}
      </div>
    </div>
  )
}

function OffersTab({ player, onShowToast }: { player: Player; onShowToast: (m: string) => void }) {
  const offers = [
    { id: 'sp1', club: 'Bayern München', fee: 88, status: 'Pending', color: '#dc052d' },
    { id: 'sp2', club: 'Real Madrid', fee: 102, status: 'Negotiating', color: '#fcbf00' },
    { id: 'sp3', club: 'Man City', fee: 75, status: 'Withdrawn', color: '#6cabdd' },
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
        {offers.length === 0 && (
          <div className="ea-pp-no-offers">No active offers yet. Keep performing and the clubs will come.</div>
        )}
      </div>
    </div>
  )
}

function StatsTab({ player }: { player: Player }) {
  const sampleStats = [
    { label: 'Matches', val: 32 },
    { label: 'Goals', val: 14 },
    { label: 'Assists', val: 9 },
    { label: 'Avg Rating', val: (Number((player.rating / 12).toFixed(1))) },
    { label: 'Yellow Cards', val: 4 },
    { label: 'Red Cards', val: 0 },
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
      <polygon points={polygon} fill="rgba(0,212,255,.25)" stroke="#00d4ff" strokeWidth={2} />
      {keys.map((k, i) => {
        const angle = -Math.PI / 2 + (i / keys.length) * Math.PI * 2
        const x = cx + Math.cos(angle) * (r + 14)
        const y = cy + Math.sin(angle) * (r + 14)
        return <text key={k} x={x} y={y} fill="#94a3b8" fontSize="10" textAnchor="middle" dominantBaseline="middle">{k}</text>
      })}
    </svg>
  )
}
