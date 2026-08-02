import { useState } from 'react'
import type { Player, ProfileTab } from '../types'
import { positionColors, positionTints } from '../data'
import { Icon } from '../utils'

interface PlayerProfileProps {
  player: Player
  setActiveView: (v: any) => void
  onShowToast: (msg: string) => void
}

/**
 * Maps a 1–99 ability score to FM-style rating colour.
 */
function abilityClass(score: number) {
  if (score >= 14) return 'exc'
  if (score >= 11) return 'good'
  if (score >= 7) return 'avg'
  if (score >= 4) return 'below'
  return 'poor'
}

export function PlayerProfile({ player, setActiveView, onShowToast }: PlayerProfileProps) {
  const [tab, setTab] = useState<ProfileTab>('overview')
  return (
    <div className="pp-shell">
      <header className="page-header" style={{ marginBottom: 'var(--s-4)' }}>
        <div>
          <span className="kicker">Squad · Player Profile</span>
          <h1>{player.name.split(' ').slice(-1).join('')}</h1>
          <p>{player.position} · {player.club ?? 'NORTHSTAR FC'} · {player.flag ?? 'HQ'} · Age {player.age}</p>
        </div>
        <div className="tac-tabs">
          <button className={`tac-tabview${tab === 'overview' ? ' active' : ''}`} onClick={() => setTab('overview')}>Overview</button>
          <button className={`tac-tabview${tab === 'attributes' ? ' active' : ''}`} onClick={() => setTab('attributes')}>Personal</button>
          <button className={`tac-tabview${tab === 'offers' ? ' active' : ''}`} onClick={() => setTab('offers')}>Performance</button>
          <button className={`tac-tabview${tab === 'stats' ? ' active' : ''}`} onClick={() => setTab('stats')}>Career</button>
        </div>
      </header>

      {tab === 'overview' && <OverviewTab player={player} onShowToast={onShowToast} setActiveView={setActiveView} />}
      {tab === 'attributes' && <AttributesTab player={player} />}
      {tab === 'offers' && <OffersTab player={player} onShowToast={onShowToast} />}
      {tab === 'stats' && <StatsTab player={player} />}
    </div>
  )
}

function OverviewTab({ player, onShowToast, setActiveView }: { player: Player; onShowToast: (msg: string) => void; setActiveView: (v: any) => void }) {
  const accent = positionColors[player.position] ?? '#1f8a5f'
  const tint = positionTints[player.position] ?? 'rgba(148,163,184,.1)'
  const initials = player.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()

  return (
    <>
      {/* Header: portrait + meta + rating block */}
      <section className="pp-header">
        <div style={{ position: 'relative' }} className="pp-portrait">
          <svg viewBox="0 0 200 240" style={{ width: '100%', height: '100%' }}>
            <defs>
              <linearGradient id="ppShirt" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor={accent} stopOpacity="1" />
                <stop offset="100%" stopColor={tint} stopOpacity="0.6" />
              </linearGradient>
            </defs>
            <rect x="0" y="0" width="200" height="240" fill="rgba(255,255,255,0.04)" />
            <rect x="20" y="80" width="160" height="120" rx="12" fill="url(#ppShirt)" />
            <rect x="80" y="50" width="40" height="60" rx="6" fill="rgba(255,255,255,0.18)" />
            <text x="100" y="180" fontSize="64" fontWeight="800" textAnchor="middle" fill="#fff" opacity="0.4" letterSpacing="-0.02em">{player.shirtNumber ?? 9}</text>
            <text x="100" y="220" fontSize="14" fontWeight="800" textAnchor="middle" fill="#fff" opacity="0.7" letterSpacing="0.04em">{initials}</text>
          </svg>
          <span style={{ position: 'absolute', top: 8, left: 8, padding: '2px 8px', background: 'var(--accent)', color: '#fff', borderRadius: 999, fontSize: 10, fontWeight: 800, letterSpacing: '0.06em' }}>★ Important Player</span>
        </div>

        <div className="pp-meta">
          <div className="pp-meta-row">
            <span className="pill accent">{player.position}</span>
            <span className="pill">{player.flag ?? 'HQ'} · {player.role}</span>
            <span className="pill good">{player.age} yo · {player.contract}y contract</span>
          </div>
          <div className="pp-meta-row">
            <label className="kicker">EDITION · 26/2007</label>
            <span className="kicker">Left · Strong</span>
            <span className="kicker">Right · Very Strong</span>
          </div>
          <div className="pp-rating-block">
            <b>{player.rating}</b>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span className="kicker">Current Ability</span>
              <span style={{ fontSize: 'var(--t-md)', fontWeight: 700 }}>{player.potential}</span>
              <span className="kicker">Potential</span>
              <div style={{ width: 200 }}>
                <div className="bar"><i style={{ width: `${Math.min(100, (player.rating / Math.max(70, player.potential)) * 100)}%`, background: 'var(--accent)' }} /></div>
              </div>
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <button className="btn btn-primary" onClick={() => onShowToast('Player added to comparison')}>Compare <Icon>↔</Icon></button>
            </div>
          </div>
        </div>
      </section>

      {/* Three-column attribute grid (Technical / Mental / Physical) */}
      <section className="pp-attr-grid">
        <AttributeColumn
          title="Technical"
          accent={accent}
          rows={techRows(player)}
        />
        <AttributeColumn
          title="Mental"
          accent="#2bb6ff"
          rows={mentalRows(player)}
        />
        <AttributeColumn
          title="Physical"
          accent="#f05a4b"
          rows={physicalRows(player)}
        />
      </section>

      {/* Player Profile summary + form/season stats */}
      <section className="grid-3" style={{ marginTop: 'var(--s-4)' }}>
        <div className="panel" style={{ gridColumn: 'span 2' }}>
          <div className="panel-head">
            <div>
              <span className="kicker accent">Player Profile</span>
              <h3 style={{ fontSize: 'var(--t-md)', marginTop: 2 }}>Appearance & play style</h3>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <span className="pill">High risk</span>
            </div>
          </div>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.55, fontSize: 'var(--t-sm)' }}>
            {player.name.split(' ')[0]} plays as a {player.role?.toLowerCase() ?? 'first-team'} {player.position}. Physical profile ranks as{' '}
            <b className="good">{player.skills.physical >= 80 ? 'Excellent' : player.skills.physical >= 65 ? 'Strong' : 'Average'}</b>{' '}
            and the player&apos;s fitness is currently <b>{player.fitness >= 90 ? 'peak' : player.fitness >= 80 ? 'high' : 'building'}</b>{' '}
            ({Math.round(player.fitness)}%). Form is reading <b>{player.form}</b> — recommended rotation if below 70.
          </p>
          <div style={{ marginTop: 'var(--s-3)', paddingTop: 'var(--s-3)', borderTop: '1px solid var(--line)' }}>
            <span className="kicker">Built From The Back</span>
            <div className="metric" style={{ marginTop: 'var(--s-2)', minHeight: 50, padding: 'var(--s-2) var(--s-3)', background: 'var(--accent-dim)', borderColor: 'var(--accent-line)' }}>
              <span style={{ fontSize: 'var(--t-xs)', color: 'var(--text-muted)' }}>Role fit</span>
              <b style={{ fontSize: 'var(--t-md)', fontWeight: 800 }}>E (1 match)</b>
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <div>
              <span className="kicker accent">Season Stats</span>
              <h3 style={{ fontSize: 'var(--t-md)', marginTop: 2 }}>Performance overview</h3>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--s-2)' }}>
            <Stat label="Apps" value="32" />
            <Stat label="Mins" value="2,890" />
            <Stat label="Goals" value="14" big accent />
            <Stat label="Assists" value="9" />
            <Stat label="xG" value="13.4" />
            <Stat label="xA" value="8.2" />
            <Stat label="Avg rating" value="7.6" />
            <Stat label="Distance" value="11.2 km" />
          </div>
        </div>
      </section>

      {/* Career & Conversation (legacy offers tab) */}
      <section style={{ marginTop: 'var(--s-4)' }}>
        <div style={{ display: 'flex', gap: 'var(--s-2)' }}>
          <button className="btn btn-primary" onClick={() => setActiveView('squad')}>← Back to squad</button>
          <button className="btn btn-ghost" onClick={() => onShowToast('Player actions menu opened')}>Show actions <Icon>⋯</Icon></button>
          <button className="btn btn-ghost" onClick={() => onShowToast('Training plan opened')}>Training plan</button>
        </div>
      </section>
    </>
  )
}

function techRows(player: Player) {
  return [
    { name: 'Crossing', v: player.skills.passing - 4 },
    { name: 'Dribbling', v: player.skills.dribbling },
    { name: 'Finishing', v: player.skills.shooting + 4 },
    { name: 'First Touch', v: player.skills.passing + 6 },
    { name: 'Heading', v: Math.max(20, player.skills.physical - 8) },
    { name: 'Long Shots', v: player.skills.shooting - 8 },
    { name: 'Marking', v: Math.max(20, player.skills.physical - 14) },
    { name: 'Passing', v: player.skills.passing + 4 },
    { name: 'Set Pieces', v: player.skills.passing - 6 },
    { name: 'Tackling', v: Math.max(20, player.skills.physical - 14) },
    { name: 'Technique', v: player.skills.passing + 8 },
  ]
}

function mentalRows(player: Player) {
  return [
    { name: 'Aggression', v: player.skills.physical - 4 },
    { name: 'Anticipation', v: player.skills.passing + 4 },
    { name: 'Bravery', v: player.skills.physical - 4 },
    { name: 'Composure', v: player.skills.passing + 4 },
    { name: 'Concentration', v: player.skills.passing },
    { name: 'Decisions', v: player.skills.passing + 6 },
    { name: 'Determination', v: player.skills.physical + 4 },
    { name: 'Flair', v: player.skills.dribbling + 6 },
    { name: 'Leadership', v: player.skills.passing - 6 },
    { name: 'Off the Ball', v: player.skills.passing + 2 },
    { name: 'Positioning', v: player.skills.passing + 2 },
    { name: 'Teamwork', v: player.skills.passing + 4 },
    { name: 'Vision', v: player.skills.passing + 8 },
    { name: 'Work Rate', v: player.skills.physical },
  ]
}

function physicalRows(player: Player) {
  return [
    { name: 'Acceleration', v: player.skills.pace },
    { name: 'Agility', v: player.skills.pace - 4 },
    { name: 'Balance', v: player.skills.physical - 4 },
    { name: 'Jumping Reach', v: player.skills.physical + 4 },
    { name: 'Natural Fitness', v: player.skills.physical + 8 },
    { name: 'Pace', v: player.skills.pace + 2 },
    { name: 'Stamina', v: player.skills.physical + 6 },
    { name: 'Strength', v: player.skills.physical + 4 },
  ]
}

function AttributeColumn({ title, accent, rows }: { title: string; accent: string; rows: { name: string; v: number }[] }) {
  return (
    <div className="pp-attr-col">
      <h3 style={{ color: accent }}>{title}</h3>
      <div className="pp-attr-list">
        {rows.map((row) => {
          const cls = abilityClass(row.v)
          return (
            <div key={row.name}>
              <div className="pp-attr-row">
                <span>{row.name}</span>
                <b style={{ color: abilityColor(row.v) }}>{row.v}</b>
              </div>
              <div className={`pp-attr-bar-bg ${cls}`}>
                <i style={{ width: `${Math.min(100, Math.max(0, (row.v / 20) * 100))}%` }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function abilityColor(v: number) {
  if (v >= 14) return 'var(--r-exc)'
  if (v >= 11) return 'var(--r-good)'
  if (v >= 7) return 'var(--r-avg)'
  if (v >= 4) return 'var(--r-below)'
  return 'var(--r-poor)'
}

function Stat({ label, value, big, accent }: { label: string; value: string; big?: boolean; accent?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--s-2) var(--s-3)', background: 'var(--surface-2)', borderRadius: 'var(--r-sm)', border: '1px solid var(--line)' }}>
      <span className="kicker">{label}</span>
      <b className="mono" style={{ fontSize: big ? 'var(--t-xl)' : 'var(--t-md)', fontWeight: 800, color: accent ? 'var(--accent-hot)' : 'var(--text)' }}>{value}</b>
    </div>
  )
}

function AttributesTab({ player }: { player: Player }) {
  // Radar
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
    <div className="grid-2">
      <section className="panel">
        <div className="panel-head"><div><span className="kicker">Personal</span><h3 style={{ fontSize: 'var(--t-md)' }}>Attribute radar</h3></div></div>
        <div style={{ display: 'grid', placeItems: 'center', padding: 'var(--s-4)' }}>
          <svg viewBox="0 0 260 260" style={{ width: '100%', maxWidth: 360, height: 'auto' }} aria-label="Attribute radar">
            {[0.4, 0.7, 1].map((scale) => (
              <circle key={scale} cx={cx} cy={cy} r={r * scale} fill="none" stroke="rgba(148,163,184,.15)" />
            ))}
            <polygon points={polygon} fill="rgba(4,120,87,.20)" stroke="var(--accent)" strokeWidth={2} />
            {keys.map((k, i) => {
              const angle = -Math.PI / 2 + (i / keys.length) * Math.PI * 2
              const x = cx + Math.cos(angle) * (r + 16)
              const y = cy + Math.sin(angle) * (r + 16)
              return <text key={k} x={x} y={y} fill="#94a3b8" fontSize="10" textAnchor="middle" dominantBaseline="middle">{k.toUpperCase()}</text>
            })}
          </svg>
        </div>
      </section>
      <section className="panel">
        <div className="panel-head"><div><span className="kicker">Personal</span><h3 style={{ fontSize: 'var(--t-md)' }}>Story</h3></div></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--s-3)' }}>
          {[
            'Emerging as a first-team starter after promotion.',
            'Currently in best form of the campaign (peak form: 7.8 rating).',
            'Strong scorer against weaker opposition (16 ga in 11 apps).',
            'Average finishing expected against top sides: 44.0% on-target vs ratio xG.',
          ].map((line) => (
            <div key={line} className="panel-row" style={{ background: 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: 'var(--r-md)', padding: 'var(--s-3)' }}>
              <div className="row-icon accent">·</div>
              <div className="row-text"><b>Profile note</b><small>{line}</small></div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function OffersTab({ player, onShowToast }: { player: Player; onShowToast: (m: string) => void }) {
  const offers = [
    { id: 'p1', club: 'Bayern München', status: 'Pending', color: '#dc052d', fee: Math.round(player.value / 1_000_000) },
    { id: 'p2', club: 'Real Madrid', status: 'Negotiating', color: '#fcbf00', fee: Math.round(player.value / 1_000_000) + 6 },
    { id: 'p3', club: 'Man City', status: 'Withdrawn', color: '#6cabdd', fee: Math.round(player.value / 1_000_000) - 4 },
  ]
  return (
    <section className="grid-3">
      {offers.map((o) => (
        <article key={o.id} className="panel" style={{ padding: 'var(--s-5)' }}>
          <div className="panel-head">
            <span className="kicker">{o.status.toUpperCase()}</span>
            <span className="kicker">OFFER</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-3)', marginTop: 'var(--s-2)' }}>
            <span style={{ width: 40, height: 40, borderRadius: 8, background: o.color, color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 800 }}>{o.club.slice(0, 2).toUpperCase()}</span>
            <b style={{ fontSize: 'var(--t-md)', fontWeight: 700 }}>{o.club}</b>
          </div>
          <div style={{ marginTop: 'var(--s-3)' }}>
            <span className="kicker">Proposed fee</span>
            <b className="mono" style={{ fontSize: 'var(--t-3xl)', fontWeight: 800, display: 'block', color: o.color }}>€{o.fee}M</b>
            <small className="muted">Including add-ons &amp; sell-on clauses</small>
          </div>
          <button className="btn btn-primary btn-block" style={{ marginTop: 'var(--s-3)' }} onClick={() => onShowToast(`Reviewing ${o.club} offer`)}>Open negotiation</button>
        </article>
      ))}
    </section>
  )
}

function StatsTab({ player }: { player: Player }) {
  const sampleStats = [
    { label: 'Matches', val: 32 },
    { label: 'Goals',   val: 14 },
    { label: 'Assists', val: 9 },
    { label: 'Mins',    val: 2890 },
    { label: 'Started', val: 28 },
    { label: 'Yellows', val: 4 },
    { label: 'Reds',    val: 0 },
    { label: 'MotM',    val: 6 },
    { label: 'Clean She', val: 0 },
    { label: 'xG',      val: '13.4' },
    { label: 'xA',      val: '8.2' },
    { label: 'Pass %',  val: '85%' },
  ]
  return (
    <section>
      <div className="grid-4">
        {sampleStats.map((s) => (
          <div key={s.label} className="metric">
            <span className="m-label">{s.label}</span>
            <span className="m-value">{s.val}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
