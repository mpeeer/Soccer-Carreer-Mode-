import { useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import type { Player, Tactics, View } from '../types'
import { formations, positionColors, positionTints } from '../data'
import { Icon } from '../utils'
import { PlayerPortrait } from '../portraits/playerPortrait'

interface TeamManagementProps {
  players: Player[]
  selectedPlayer: Player
  setSelectedPlayerId: (id: number) => void
  setActiveView: (v: View) => void
  tactics?: Tactics
  onSetTacticsView?: () => void
  onSubPlayer: (outId: number, inId: number) => void
  onShowToast: (m: string) => void
}

type SidebarPlayer = {
  id: number
  name: string
  short: string
  position: string
  positionLine: string
  pos: string
  ovr: number
  form: number | string
  fitness: number
  pace: number
  shooting: number
  passing: number
  dribbling: number
  defending: number
  physical: number
  skillMoves: number
  weakFoot: number
  age: number
  height: string
  role: string
  character: string
  foot: string
}

export function TeamManagement({ players, selectedPlayer, setSelectedPlayerId, setActiveView, tactics, onSetTacticsView, onSubPlayer, onShowToast }: TeamManagementProps) {
  const formation = tactics ? formations[tactics.formation] : { slots: formations.fourThreeThree.slots, label: formations.fourThreeThree.label }
  const activeFormationId = tactics?.formation ?? 'fourThreeThree'
  const starters = useMemo(() => {
    return players.filter((p) => p.role !== 'Prospect').slice(0, formation.slots.length)
  }, [players, formation])
  const subs = useMemo(() => players.filter((p) => !starters.find((s) => s.id === p.id)), [players, starters])

  const [swapWith, setSwapWith] = useState<Player | null>(null)

  const handleChipClick = (id: number) => {
    setSelectedPlayerId(id)
    setSwapWith(null)
  }

  return (
    <div className="ea-fc-theme ea-team-mgmt" style={{ '--tm-accent': positionColors[selectedPlayer.position] } as CSSProperties}>
      <header className="ea-top-tabs">
        <div className="ea-brand-mark" aria-label="My Career">
          <span>MC</span>
        </div>
        <nav className="ea-tab-nav">
          <button className="ea-tab" onClick={() => setActiveView('squad')}>Squad</button>
          <button className="ea-tab ea-tab-primary">Team Management</button>
          <div className="ea-tab-divider" />
          <button className="ea-tab">Tactics</button>
          <button className="ea-tab">Assignments</button>
          <div className="ea-tab-divider" />
          <div className="ea-switch-view">
            <button className="ea-switch">Without Ball</button>
            <button className="ea-switch">Switch View</button>
          </div>
        </nav>
      </header>

      <div className="ea-tm-body">
        {/* Left: Pitch */}
        <section className="ea-pitch-wrap">
          <div className="ea-pitch">
            {/* Field lines */}
            <div className="ea-pitch-line center-circle" />
            <div className="ea-pitch-line center-line" />
            <div className="ea-pitch-line center-spot" />
            <div className="ea-pitch-line penalty-area-top" />
            <div className="ea-pitch-line penalty-area-bottom" />
            <div className="ea-pitch-line goal-area-top" />
            <div className="ea-pitch-line goal-area-bottom" />
            {starters.map((player, i) => {
              const slot = formation.slots[i]
              const active = selectedPlayer.id === player.id
              return (
                <button
                  key={player.id}
                  className={`ea-player-chip ${active ? 'ea-chip-active' : ''}`}
                  style={{ left: `${slot.x}%`, top: `${slot.y}%`, '--chip-accent': positionColors[player.position] } as CSSProperties}
                  onClick={() => handleChipClick(player.id)}
                  title={player.name}
                >
                  <span className="ea-chip-rating">{player.rating}</span>
                  <span className="ea-chip-name">{player.name.split(' ').slice(-1).join('').toUpperCase()}</span>
                  <span className="ea-chip-position">{slot.position}</span>
                </button>
              )
            })}
          </div>

          {/* Substitutes bench */}
          <div className="ea-subs">
            <div className="ea-subs-head">
              <h4>Substitutes</h4>
              <span>{subs.length} available</span>
            </div>
            <div className="ea-subs-row">
              {subs.map((p) => (
                <button
                  key={p.id}
                  className={`ea-sub-card ${selectedPlayer.id === p.id ? 'ea-sub-active' : ''}`}
                  style={{ '--sub-accent': positionColors[p.position] } as CSSProperties}
                  onClick={() => handleChipClick(p.id)}
                >
                  <span className="ea-sub-rating">{p.rating}</span>
                  <span className="ea-sub-name">{p.name.split(' ').map((n) => n[0]).join('')}</span>
                  <small>{p.position}</small>
                </button>
              ))}
              {subs.length === 0 && <span className="ea-subs-empty">No substitutes registered.</span>}
            </div>
          </div>
        </section>

        {/* Right: Sidebar */}
        <Sidebar player={selectedPlayer} swapWith={swapWith} setSwapWith={setSwapWith} players={players} sub={onSubPlayer} onGoHub={() => setActiveView('hub')} />
      </div>

      {/* Bottom action bar */}
      <footer className="ea-tm-actions">
        <button className="ea-tm-action-btn" onClick={() => onShowToast('Selection confirmed')}>
          <Icon>✓</Icon>Select
        </button>
        <button className="ea-tm-action-btn" onClick={() => setActiveView('squad')}>
          <Icon>←</Icon>Back
        </button>
        <button className="ea-tm-action-btn">
          <Icon>✎</Icon>Edit Active Tactic
        </button>
        <button className="ea-tm-action-btn">
          <Icon>↔</Icon>Suggested Sub
        </button>
        <button className="ea-tm-action-btn" onClick={() => setActiveView('playerProfile')}>
          <Icon>★</Icon>Full Profile
        </button>
        <button className="ea-tm-action-btn primary" onClick={() => onShowToast('Quick sub applied')}>
          <Icon>⚡</Icon>Quick Sub
        </button>
      </footer>

      {/* Swap mode instructions */}
      {swapWith && (
        <div className="ea-swap-overlay">
          <div className="ea-swap-popover">
            <h4>Swap substitution</h4>
            <p>Replace {selectedPlayer.name} with {swapWith.name}?</p>
            <div className="ea-swap-actions">
              <button className="outline" onClick={() => setSwapWith(null)}>Cancel</button>
              <button className="primary" onClick={() => { onSubPlayer(selectedPlayer.id, swapWith.id); setSwapWith(null); onShowToast(`${swapWith.name} replaces ${selectedPlayer.name}`) }}>Confirm swap</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Sidebar({ player, swapWith, setSwapWith, players, sub, onGoHub }: { player: Player; swapWith: Player | null; setSwapWith: (p: Player | null) => void; players: Player[]; sub: (outId: number, inId: number) => void; onGoHub?: () => void }) {
  const accent = positionColors[player.position] ?? '#1f8a5f'
  const initials = player.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
  const subOptions = players.filter((p) => p.id !== player.id)

  return (
    <aside className="ea-tm-sidebar" style={{ '--sb-accent': accent } as CSSProperties}>
      <div className="ea-sb-head">
        <span className="ea-sb-meta">
          <strong>{player.position === 'RM' ? 'RM · LM · ST · LW' : `${player.position} · LM · ST · LW`}</strong>
          <small>{player.flag ?? 'HQ'} · {player.role?.toUpperCase()}</small>
        </span>
        <span className="ea-sb-rating">{player.rating}<small>OVR</small></span>
        <span className="ea-sb-potential">{player.potential}<small>POT</small></span>
      </div>
      <div className="ea-sb-image">
        <div className="ea-sb-portrait">
          <PlayerPortrait initials={initials} accent={accent} shirt={player.shirtNumber ?? player.id} size="lg" className="ea-sb-portrait-svg" />
        </div>
        <span className="ea-sb-name">{player.name}</span>
      </div>
      <div className="ea-sb-status-row">
        <span className="ea-sb-chip lime"><Icon>✓</Icon> OK</span>
        <span className="ea-sb-chip orange"><span className="emo">☺</span> Happy</span>
        <span className="ea-sb-chip cyan"><Icon>⚡</Icon> Decent</span>
      </div>
      <div className="ea-sb-match-status">
        <strong>Ready to Play</strong>
      </div>
      <div className="ea-sb-divider" />
      <div className="ea-sb-stat-grid">
        <div><span>Pace</span><b>{player.skills.pace + 4}</b></div>
        <div><span>Shooting</span><b>{player.skills.shooting}</b></div>
        <div><span>Passing</span><b>{player.skills.passing + 4}</b></div>
        <div><span>Dribbling</span><b>{player.skills.dribbling + 4}</b></div>
        <div><span>Defending</span><b>{Math.max(30, player.skills.pace - 50)}</b></div>
        <div><span>Physical</span><b>{player.skills.physical}</b></div>
      </div>
      <div className="ea-sb-extras">
        <div><span>Age</span><b>{player.age}</b></div>
        <div><span>Height</span><b>{player.height ?? '5\'11"'}</b></div>
        <div><span>Skill Moves</span><b>{'★'.repeat(player.skillMoves ?? 3)}</b></div>
        <div><span>Weak Foot</span><b>{'★'.repeat(player.weakFoot ?? 3)}</b></div>
        <div><span>PlayStyles</span><b>{subOptions.length} ◇</b></div>
        <div><span>Role</span><b>{player.role}</b></div>
        <div><span>Focus</span><b>{player.position === 'ST' ? 'Support' : 'Balanced'}</b></div>
        <div><span>Character Type</span><b>{player.position === 'ST' ? 'Explosive' : 'Resolute'}</b></div>
        <div><span>Foot</span><b>{player.preferredFoot ?? 'Right'}</b></div>
      </div>
      <div className="ea-sb-actions">
        <button className="ea-sb-action primary" onClick={() => sub(player.id, players.find((p) => p.position !== player.position && p.role === 'Prospect')?.id ?? players[0]?.id ?? player.id)}>
          <Icon>↔</Icon>Quick Sub
        </button>
        <button className="ea-sb-action" onClick={() => setSwapWith(subOptions[0] ?? null)}>
          <Icon>⚡</Icon>Open Swap
        </button>
        <button className="ea-sb-action" onClick={() => onGoHub?.()}>
          <Icon>←</Icon>Squad Hub
        </button>
      </div>
    </aside>
  )
}
