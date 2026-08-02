import { useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import type { Player, View } from '../types'
import { formations, positionColors } from '../data'
import { Icon } from '../utils'

interface TeamManagementProps {
  players: Player[]
  selectedPlayer: Player
  setSelectedPlayerId: (id: number) => void
  setActiveView: (v: View) => void
  onSubPlayer: (outId: number, inId: number) => void
  onShowToast: (m: string) => void
}

export function TeamManagement({ players, selectedPlayer, setSelectedPlayerId, setActiveView, onSubPlayer, onShowToast }: TeamManagementProps) {
  const [view, setView] = useState<'combined' | 'in' | 'out' | 'both'>('both')
  const formation = formations.fourThreeThree
  const starters = useMemo(() => players.filter((p) => p.role !== 'Prospect').slice(0, formation.slots.length), [players, formation])
  const subs = useMemo(() => players.filter((p) => !starters.find((s) => s.id === p.id)), [players, starters])
  const [swapWith, setSwapWith] = useState<Player | null>(null)

  const ratings: Record<number, string> = {}
  starters.forEach((p) => {
    const r = p.rating
    ratings[p.id] = r >= 85 ? 'exc' : r >= 80 ? 'good' : r >= 75 ? 'avg' : r >= 70 ? 'below' : 'poor'
  })

  // In possession: all players shift up slightly; out of possession: drop back
  const inPoss = (posIndex: number) => ({ left: formation.slots[posIndex].x, top: formation.slots[posIndex].y * 0.85 + 8 })
  const outPoss = (posIndex: number) => ({ left: formation.slots[posIndex].x, top: formation.slots[posIndex].y * 1.10 - 8 })

  return (
    <div className="ea-fc-theme ea-team-mgmt" style={{ '--tm-accent': positionColors[selectedPlayer.position] } as CSSProperties}>
      <header className="page-header" style={{ marginBottom: 'var(--s-4)' }}>
        <div>
          <span className="kicker">Match Day · Team Sheet</span>
          <h1>{view === 'combined' ? 'Combined' : view === 'in' ? 'In Possession' : view === 'out' ? 'Out of Possession' : 'In & Out of Possession'}</h1>
          <p>Tap a chip to swap. Use the table on the right to change roles or make subs.</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--s-2)', alignItems: 'center' }}>
          <div className="tac-tabs">
            <button className={`tac-tabview${view === 'combined' ? ' active' : ''}`} onClick={() => setView('combined')}>Combined</button>
            <button className={`tac-tabview${view === 'in' ? ' active' : ''}`} onClick={() => setView('in')}>In Possession</button>
            <button className={`tac-tabview${view === 'out' ? ' active' : ''}`} onClick={() => setView('out')}>Out of Possession</button>
            <button className={`tac-tabview${view === 'both' ? ' active' : ''}`} onClick={() => setView('both')}>Both</button>
          </div>
        </div>
      </header>

      <div className={view === 'both' ? 'tac-grid' : ''} style={view !== 'both' ? { display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) 360px', gap: 'var(--s-3)', alignItems: 'start' } : undefined}>
        {view === 'both' && (
          <>
            <PitchWrapper
              title="In Possession"
              subtitle="Attacking phase · high line"
              starters={starters}
              formation={formation}
              selectedPlayerId={selectedPlayer.id}
              onChip={(id) => setSelectedPlayerId(id)}
              ratings={ratings}
              positionFn={inPoss}
            />
            <PitchWrapper
              title="Out of Possession"
              subtitle="Defensive phase · compact block"
              starters={starters}
              formation={formation}
              selectedPlayerId={selectedPlayer.id}
              onChip={(id) => setSelectedPlayerId(id)}
              ratings={ratings}
              positionFn={outPoss}
            />
          </>
        )}
        {view !== 'both' && (
          <PitchWrapper
            title={view === 'in' ? 'In Possession' : view === 'out' ? 'Out of Possession' : 'Combined View'}
            subtitle={view === 'in' ? 'High line · attack the space' : view === 'out' ? 'Mid block · compact shape' : 'Both phases shown'}
            starters={starters}
            formation={formation}
            selectedPlayerId={selectedPlayer.id}
            onChip={(id) => setSelectedPlayerId(id)}
            ratings={ratings}
            positionFn={(i) => ({ left: formation.slots[i].x, top: formation.slots[i].y })}
          />
        )}

        <SidePanel
          player={selectedPlayer}
          players={players}
          starters={starters}
          subs={subs}
          formation={formation}
          setSelectedPlayerId={setSelectedPlayerId}
          onShowToast={onShowToast}
          setActiveView={setActiveView}
        />
      </div>

      {swapWith && (
        <div className="modal-backdrop" onClick={() => setSwapWith(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSwapWith(null)}>×</button>
            <div className="kicker">Confirm substitution</div>
            <h2>Bring on {swapWith.name}?</h2>
            <p>Replace {selectedPlayer.name} ({selectedPlayer.position}) with {swapWith.name} ({swapWith.position}).</p>
            <div className="modal-actions">
              <button className="btn btn-primary" onClick={() => { onSubPlayer(selectedPlayer.id, swapWith.id); setSwapWith(null); onShowToast(`${swapWith.name} on for ${selectedPlayer.name}`) }}>Confirm sub <Icon>→</Icon></button>
              <button className="btn btn-ghost" onClick={() => setSwapWith(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function PitchWrapper({ title, subtitle, starters, formation, selectedPlayerId, onChip, ratings, positionFn }: { title: string; subtitle: string; starters: Player[]; formation: typeof formations.fourThreeThree; selectedPlayerId: number; onChip: (id: number) => void; ratings: Record<number, string>; positionFn: (i: number) => CSSProperties }) {
  return (
    <section className="panel flush">
      <div className="panel-head">
        <div>
          <span className="kicker accent">{title}</span>
          <h3 style={{ fontSize: 'var(--t-md)', marginTop: 2 }}>{subtitle}</h3>
        </div>
        <div className="kicker">FORMATION · {formation.label}</div>
      </div>
      <div className="fm-pitch">
        <div className="pitch-lines">
          <div className="center-line" />
          <div className="center-circle" />
          <div className="center-spot" />
          <div className="pen-area-top" style={{ background: 'transparent' }} />
          <div className="pen-area-bottom" style={{ background: 'transparent' }} />
          <div className="goal-area-top" />
          <div className="goal-area-bottom" />
        </div>
        {starters.map((player, i) => {
          const slot = formation.slots[i]
          const active = selectedPlayerId === player.id
          const pos = positionFn(i)
          const rating = ratings[player.id] ?? 'avg'
          return (
            <button
              key={player.id}
              className={`pitch-chip${active ? ' active' : ''}`}
              style={{ left: `${pos.left}%`, top: `${pos.top}%`, '--chip-accent': positionColors[slot.position] } as CSSProperties}
              onClick={() => onChip(player.id)}
              title={player.name}
            >
              <span className={`rating ${rating}`} style={{ width: 24, height: 18, fontSize: 11 }}>{player.rating}</span>
              <span className="pc-name">{player.name.split(' ').slice(-1)[0]?.toUpperCase()}</span>
              <span className="pc-pos">{slot.position}</span>
            </button>
          )
        })}
      </div>
    </section>
  )
}

function SidePanel({ player, players, starters, subs, setSelectedPlayerId, setActiveView, onShowToast }: { player: Player; players: Player[]; starters: Player[]; subs: Player[]; formation: typeof formations.fourThreeThree; setSelectedPlayerId: (id: number) => void; setActiveView: (v: View) => void; onShowToast: (m: string) => void }) {
  return (
    <aside className="tac-side">
      <section className="panel">
        <div className="panel-head">
          <div>
            <span className="kicker">{player.position} · {player.flag ?? 'HQ'}</span>
            <h3 style={{ fontSize: 'var(--t-md)', marginTop: 2 }}>{player.name}</h3>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span className="rating exc" style={{ width: 36, height: 28, fontSize: 14 }}>{player.rating}</span>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.06em', marginTop: 2 }}>OVR · POT {player.potential}</div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 'var(--s-2)' }}>
          <div><span className="kicker">Pace</span><b className="mono">{player.skills.pace}</b></div>
          <div><span className="kicker">Shooting</span><b className="mono">{player.skills.shooting}</b></div>
          <div><span className="kicker">Passing</span><b className="mono">{player.skills.passing}</b></div>
          <div><span className="kicker">Dribbling</span><b className="mono">{player.skills.dribbling}</b></div>
          <div><span className="kicker">Defending</span><b className="mono">{Math.max(30, player.skills.physical - 30)}</b></div>
          <div><span className="kicker">Physical</span><b className="mono">{player.skills.physical}</b></div>
        </div>
        <div className="tac-rhythm" style={{ marginTop: 'var(--s-2)' }}>
          <button className="active">✓ OK</button>
          <button>☺ Happy</button>
          <button>⚡ Sharp</button>
          <button>Ready</button>
        </div>
        <div style={{ display: 'flex', gap: 'var(--s-2)', marginTop: 'var(--s-2)' }}>
          <button className="btn btn-ghost btn-sm" onClick={() => setActiveView('squad')}>← Squad</button>
          <button className="btn btn-primary btn-sm" onClick={() => setActiveView('tactics')}>✎ Tactics</button>
          <button className="btn btn-ghost btn-sm" onClick={() => onShowToast(`${player.name} marked ready`)}>Ready <Icon>✓</Icon></button>
        </div>
      </section>

      <section className="panel">
        <div className="panel-head">
          <div>
            <span className="kicker">Starting XI</span>
            <h3 style={{ fontSize: 'var(--t-md)', marginTop: 2 }}>Select from squad</h3>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {[...players].sort((a, b) => b.rating - a.rating).slice(0, 14).map((p) => (
            <button
              key={p.id}
              className={`panel-row ${p.id === player.id ? 'selected' : ''}`}
              style={{ background: 'transparent', borderTop: '1px solid var(--line)', textAlign: 'left', color: 'inherit', display: 'flex', alignItems: 'center', gap: 'var(--s-3)', padding: 'var(--s-2) var(--s-4)', fontSize: 'var(--t-sm)' }}
              onClick={() => setSelectedPlayerId(p.id)}
            >
              <span className="row-icon" style={{ background: p.color, color: '#fff', fontWeight: 700, fontSize: 10 }}>{p.initials}</span>
              <span className="row-text"><b>{p.name}</b><small>{p.position} · {p.fitness}% fit</small></span>
              <span className={`rating ${p.rating >= 85 ? 'exc' : p.rating >= 80 ? 'good' : 'avg'}`} style={{ marginLeft: 'auto' }}>{p.rating}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="panel-head">
          <div>
            <span className="kicker">Substitutes</span>
            <h3 style={{ fontSize: 'var(--t-md)', marginTop: 2 }}>{subs.length.toString().padStart(2, '0')} of 7</h3>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {subs.slice(0, 7).map((p) => (
            <button
              key={p.id}
              className="panel-row"
              style={{ background: 'transparent', borderTop: '1px solid var(--line)', textAlign: 'left', color: 'inherit', display: 'flex', alignItems: 'center', gap: 'var(--s-3)', padding: 'var(--s-2) var(--s-4)', fontSize: 'var(--t-sm)' }}
              onClick={() => onShowToast(`${p.name} benched`)}
            >
              <span className="row-icon" style={{ background: p.color, color: '#fff', fontWeight: 700, fontSize: 10 }}>{p.initials}</span>
              <span className="row-text"><b>{p.name}</b><small>{p.position}</small></span>
            </button>
          ))}
          {subs.length === 0 && <span className="muted" style={{ padding: 'var(--s-3)' }}>No substitutes registered.</span>}
        </div>
      </section>
    </aside>
  )
}

// Re-imported to preserve shape
type Formation = typeof formations.fourThreeThree
