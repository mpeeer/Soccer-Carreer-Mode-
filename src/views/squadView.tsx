import { PageHeader } from './pageHeader'
import type { Player, View } from '../types'
import { positionColors } from '../data'
import { formatMoney, Icon } from '../utils'

/* ──────────────────────────────────────────────────────────────
   SQUAD — list of players + sticky detail panel
   ────────────────────────────────────────────────────────────── */
export function SquadView({ players, selectedPlayer, setSelectedPlayerId, openModal }: { players: Player[]; selectedPlayer: Player; setSelectedPlayerId: (id: number) => void; openModal: (title: string) => void }) {
  const squadAvg = Math.round(players.reduce((t, p) => t + p.rating, 0) / players.length)
  return (
    <>
      <PageHeader
        eyebrow={`Squad · ${players.length} players`}
        title="Squad"
        description={`Squad rating ${squadAvg} · Total value ${formatMoney(players.reduce((t, p) => t + p.value, 0))}`}
        action={
          <button className="btn btn-ghost" onClick={() => openModal('Team tactics')}>
            <Icon>◎</Icon> Team tactics
          </button>
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(320px, 0.9fr)', gap: 'var(--s-5)', alignItems: 'start' }}>
        <section className="panel flush">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--s-4) var(--s-5)', borderBottom: '1px solid var(--line)' }}>
            <div className="filter-tabs" style={{ display: 'flex', gap: 4 }}>
              <button className="btn btn-sm btn-ghost active" style={{ background: 'var(--surface-2)' }}>All players <span className="muted">{players.length}</span></button>
              <button className="btn btn-sm btn-ghost">Starting XI <span className="muted">11</span></button>
              <button className="btn btn-sm btn-ghost">Development <span className="muted">4</span></button>
            </div>
            <button className="btn btn-sm btn-ghost">Sort: OVR <Icon>⌄</Icon></button>
          </div>
          <div style={{ padding: '0 var(--s-5) var(--s-4)' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(200px, 2.4fr) 56px 56px 80px 130px 100px 24px',
              gap: 'var(--s-3)',
              color: 'var(--text-dim)',
              fontSize: 11, fontWeight: 600, letterSpacing: '0.06em',
              padding: 'var(--s-3) var(--s-4)',
            }}>
              <span>Player</span><span>Pos</span><span>OVR</span><span>Form</span><span>Fitness</span><span>Role</span><span></span>
            </div>
            {players.map((player) => (
              <button
                className={`squad-row${selectedPlayer.id === player.id ? ' selected' : ''}`}
                key={player.id}
                onClick={() => setSelectedPlayerId(player.id)}
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(200px, 2.4fr) 56px 56px 80px 130px 100px 24px',
                  gap: 'var(--s-3)',
                  alignItems: 'center',
                  width: '100%',
                  padding: 'var(--s-3) var(--s-4)',
                  border: 0,
                  borderTop: '1px solid var(--line)',
                  textAlign: 'left',
                  background: selectedPlayer.id === player.id ? 'var(--accent-dim)' : 'transparent',
                  borderLeft: selectedPlayer.id === player.id ? '3px solid var(--accent)' : '3px solid transparent',
                  color: 'inherit',
                  transition: 'background 0.15s',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-3)', minWidth: 0 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 8,
                    background: player.color, color: '#fff', fontWeight: 700, fontSize: 12,
                    display: 'grid', placeItems: 'center', flexShrink: 0,
                  }}>{player.initials}</div>
                  <div style={{ minWidth: 0 }}>
                    <b style={{ fontSize: 'var(--t-sm)', fontWeight: 600, display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{player.name}</b>
                    <small className="muted" style={{ fontSize: 'var(--t-xs)' }}>{player.age} yrs · {player.contract}yr contract</small>
                  </div>
                </div>
                <span className="chip">{player.position}</span>
                <strong className="accent mono" style={{ fontSize: 'var(--t-md)' }}>{player.rating}</strong>
                <span className="mono" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--t-sm)' }}>
                  <span style={{ width: 6, height: 6, borderRadius: 3, background: player.form >= 85 ? 'var(--good)' : 'var(--text-dim)' }}></span>
                  {player.form}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <i style={{ display: 'block', height: 4, width: 60, background: 'var(--accent)', borderRadius: 2 }} />
                  <b className="mono" style={{ fontSize: 'var(--t-xs)', color: 'var(--text-muted)' }}>{player.fitness}%</b>
                </span>
                <span className="muted" style={{ fontSize: 'var(--t-xs)' }}>{player.role}</span>
                <Icon>›</Icon>
              </button>
            ))}
          </div>
        </section>

        <PlayerDetail player={selectedPlayer} openModal={openModal} />
      </div>
    </>
  )
}

/* ──────────────────────────────────────────────────────────────
   PLAYER DETAIL — sticky right rail
   ────────────────────────────────────────────────────────────── */
export function PlayerDetail({ player, openModal }: { player: Player; openModal: (title: string) => void }) {
  return (
    <aside className="panel flush" style={{ position: 'sticky', top: 88, maxHeight: 'calc(100vh - 120px)', overflowY: 'auto' }}>
      <div style={{
        position: 'relative',
        minHeight: 160,
        background: `linear-gradient(135deg, ${player.color}, #1a2140 100%)`,
        display: 'flex', alignItems: 'flex-end',
        padding: 'var(--s-5)',
        overflow: 'hidden',
      }}>
        <span style={{
          position: 'absolute', right: 16, top: 8,
          fontSize: 80, fontWeight: 800, color: 'rgba(255,255,255,0.15)',
          letterSpacing: '-0.04em', pointerEvents: 'none',
        }}>{player.shirtNumber ?? ''}</span>
        <div style={{
          width: 60, height: 60, borderRadius: '50%',
          border: '2px solid rgba(255,255,255,0.2)',
          background: 'rgba(255,255,255,0.12)', color: '#fff',
          fontWeight: 700, fontSize: 18,
          display: 'grid', placeItems: 'center', flexShrink: 0,
        }}>{player.initials}</div>
        <div style={{ marginLeft: 'var(--s-4)', flex: 1, minWidth: 0 }}>
          <span className="kicker" style={{ color: 'rgba(255,255,255,0.7)' }}>{player.position} · {player.age} years</span>
          <h2 style={{ fontSize: 'var(--t-xl)', fontWeight: 700, color: '#fff', letterSpacing: '-0.01em', margin: '4px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{player.name}</h2>
          <small style={{ color: 'rgba(255,255,255,0.6)', fontSize: 'var(--t-xs)' }}>{player.club ?? 'NORTHSTAR FC'} · {player.flag ?? 'HQ'}</small>
        </div>
      </div>

      <div style={{ padding: 'var(--s-5)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', paddingBottom: 'var(--s-4)', borderBottom: '1px solid var(--line)', gap: 'var(--s-3)' }}>
          <div>
            <span className="kicker">Overall</span>
            <b className="mono" style={{ fontSize: 'var(--t-xl)', fontWeight: 700, display: 'block' }}>{player.rating}</b>
          </div>
          <div>
            <span className="kicker">Potential</span>
            <b className="mono accent" style={{ fontSize: 'var(--t-xl)', fontWeight: 700, display: 'block' }}>{player.potential}</b>
          </div>
          <div>
            <span className="kicker">Value</span>
            <b className="mono" style={{ fontSize: 'var(--t-md)', fontWeight: 700, display: 'block' }}>{formatMoney(player.value)}</b>
          </div>
        </div>

        <div style={{ paddingTop: 'var(--s-4)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--s-2)' }}>
            <b style={{ fontSize: 'var(--t-sm)', fontWeight: 700 }}>Form & fitness</b>
          </div>
          <div className="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-3)' }}>
            <DynamicBar label="Form" value={player.form} color="purple" />
            <DynamicBar label="Morale" value={player.morale} color="lime" />
            <DynamicBar label="Match fitness" value={player.fitness} color="cyan" />
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--line)', marginTop: 'var(--s-5)', paddingTop: 'var(--s-4)' }}>
          <b style={{ fontSize: 'var(--t-sm)', fontWeight: 700, display: 'block', marginBottom: 'var(--s-3)' }}>Key attributes</b>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--s-3) var(--s-4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span className="muted" style={{ fontSize: 'var(--t-xs)', fontWeight: 600 }}>PACE</span>
              <b className="mono" style={{ fontSize: 'var(--t-sm)', fontWeight: 600 }}>{player.skills.pace}</b>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span className="muted" style={{ fontSize: 'var(--t-xs)', fontWeight: 600 }}>SHOOTING</span>
              <b className="mono" style={{ fontSize: 'var(--t-sm)', fontWeight: 600 }}>{player.skills.shooting}</b>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span className="muted" style={{ fontSize: 'var(--t-xs)', fontWeight: 600 }}>PASSING</span>
              <b className="mono" style={{ fontSize: 'var(--t-sm)', fontWeight: 600 }}>{player.skills.passing}</b>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span className="muted" style={{ fontSize: 'var(--t-xs)', fontWeight: 600 }}>PHYSICAL</span>
              <b className="mono" style={{ fontSize: 'var(--t-sm)', fontWeight: 600 }}>{player.skills.physical}</b>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 'var(--s-2)', marginTop: 'var(--s-5)' }}>
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => openModal(`Develop ${player.name}`)}>
            Set development <Icon>→</Icon>
          </button>
          <button className="btn btn-icon-square" onClick={() => openModal(`Player actions: ${player.name}`)}>
            ⋯
          </button>
        </div>
      </div>
    </aside>
  )
}

/* ──────────────────────────────────────────────────────────────
   DynamicBar — used by detail + development panel
   ────────────────────────────────────────────────────────────── */
export function DynamicBar({ label, value, color }: { label: string; value: number; color: string }) {
  const accentColor = color === 'lime' || color === 'purple' ? 'var(--accent)' : 'var(--accent)'
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span className="muted" style={{ fontSize: 'var(--t-xs)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</span>
        <b className="mono" style={{ fontSize: 'var(--t-sm)', fontWeight: 600 }}>{value}</b>
      </div>
      <div className="bar">
        <i style={{ width: `${Math.min(100, value)}%`, background: accentColor }} />
      </div>
    </div>
  )
}
