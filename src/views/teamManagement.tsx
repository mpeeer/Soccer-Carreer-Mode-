import { useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import type { Player, View } from '../types'
import { formations, positionColors } from '../data'
import { Icon } from '../utils'
import { PlayerPortrait } from '../portraits/playerPortrait'

interface TeamManagementProps {
  players: Player[]
  selectedPlayer: Player
  setSelectedPlayerId: (id: number) => void
  setActiveView: (v: View) => void
  onSubPlayer: (outId: number, inId: number) => void
  onShowToast: (m: string) => void
}

export function TeamManagement({ players, selectedPlayer, setSelectedPlayerId, setActiveView, onSubPlayer, onShowToast }: TeamManagementProps) {
  const formation = formations.fourThreeThree
  const starters = useMemo(() => players.filter((p) => p.role !== 'Prospect').slice(0, formation.slots.length), [players, formation])
  const subs = useMemo(() => players.filter((p) => !starters.find((s) => s.id === p.id)), [players, starters])
  const [swapWith, setSwapWith] = useState<Player | null>(null)

  const handleChipClick = (id: number) => {
    setSelectedPlayerId(id)
    setSwapWith(null)
  }

  return (
    <div className="ea-fc-theme ea-team-mgmt" style={{ '--tm-accent': positionColors[selectedPlayer.position] } as CSSProperties}>
      {/* Top tabs */}
      <header className="ea-top-tabs">
        <div className="ea-brand-mark"><span>NS</span></div>
        <nav className="ea-tab-nav">
          <button className="ea-tab" onClick={() => setActiveView('squad')}>Squad</button>
          <button className="ea-tab ea-tab-primary">Team</button>
          <div className="ea-tab-divider" />
          <button className="ea-tab" onClick={() => setActiveView('tactics')}>Tactics</button>
          <div className="ea-tab-divider" />
          <div className="ea-switch-view">
            <button className="ea-switch">Without ball</button>
            <button className="ea-switch">Switch view</button>
          </div>
        </nav>
      </header>

      {/* Body */}
      <div className="ea-tm-body">
        {/* Pitch */}
        <section className="ea-pitch-wrap">
          <div className="ea-pitch">
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
                  className={`ea-player-chip${active ? ' ea-chip-active' : ''}`}
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

          {/* Subs bench */}
          <div className="ea-subs">
            <div className="ea-subs-head">
              <h4>Substitutes</h4>
              <span>{subs.length} available</span>
            </div>
            <div className="ea-subs-row">
              {subs.map((p) => (
                <button
                  key={p.id}
                  className={`ea-sub-card${selectedPlayer.id === p.id ? ' ea-sub-active' : ''}`}
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

        {/* Sidebar */}
        <Sidebar player={selectedPlayer} swapWith={swapWith} setSwapWith={setSwapWith} players={players} sub={onSubPlayer} onGoHub={() => setActiveView('hub')} onShowToast={onShowToast} />
      </div>

      {/* Bottom action bar */}
      <footer className="ea-tm-actions">
        <button className="ea-tm-action-btn" onClick={() => onShowToast('Selection confirmed')}>✓ Select</button>
        <button className="ea-tm-action-btn" onClick={() => setActiveView('squad')}>← Back</button>
        <button className="ea-tm-action-btn" onClick={() => setActiveView('tactics')}>✎ Edit tactics</button>
        <button className="ea-tm-action-btn">↔ Suggested sub</button>
        <button className="ea-tm-action-btn" onClick={() => setActiveView('playerProfile')}>★ Full profile</button>
        <button className="ea-tm-action-btn primary">⚡ Quick sub</button>
      </footer>

      {swapWith && (
        <div className="ea-swap-overlay">
          <div className="ea-swap-popover">
            <h4>Confirm swap</h4>
            <p>Replace {selectedPlayer.name} with {swapWith.name}?</p>
            <div className="ea-swap-actions">
              <button className="outline" onClick={() => setSwapWith(null)}>Cancel</button>
              <button className="primary" onClick={() => { onSubPlayer(selectedPlayer.id, swapWith.id); setSwapWith(null); onShowToast(`${swapWith.name} replaces ${selectedPlayer.name}`) }}>Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Sidebar({ player, swapWith, setSwapWith, players, sub, onGoHub, onShowToast }: { player: Player; swapWith: Player | null; setSwapWith: (p: Player | null) => void; players: Player[]; sub: (outId: number, inId: number) => void; onGoHub?: () => void; onShowToast?: (m: string) => void }) {
  const accent = positionColors[player.position] ?? '#1f8a5f'
  const initials = player.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
  const subOptions = players.filter((p) => p.id !== player.id)

  return (
    <aside className="ea-tm-sidebar" style={{ '--sb-accent': accent } as CSSProperties}>
      <div className="ea-sb-head">
        <span className="ea-sb-meta">
          <strong>{player.position}</strong>
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
        <span className="ea-sb-chip cyan"><Icon>⚡</Icon> Sharp</span>
      </div>
      <div className="ea-sb-match-status"><strong>Ready to play</strong></div>
      <div className="ea-sb-divider" />
      <div className="ea-sb-stat-grid">
        <div><span>Pace</span><b>{player.skills.pace}</b></div>
        <div><span>Shooting</span><b>{player.skills.shooting}</b></div>
        <div><span>Passing</span><b>{player.skills.passing}</b></div>
        <div><span>Dribbling</span><b>{player.skills.dribbling}</b></div>
        <div><span>Defending</span><b>{Math.max(30, player.skills.physical - 30)}</b></div>
        <div><span>Physical</span><b>{player.skills.physical}</b></div>
      </div>
      <div className="ea-sb-extras">
        <div><span>Age</span><b>{player.age}</b></div>
        <div><span>Height</span><b>{player.height ?? '5\'11"'}</b></div>
        <div><span>Skill moves</span><b>{'★'.repeat(player.skillMoves ?? 3)}</b></div>
        <div><span>Weak foot</span><b>{'★'.repeat(player.weakFoot ?? 3)}</b></div>
        <div><span>Foot</span><b>{player.preferredFoot ?? 'Right'}</b></div>
        <div><span>Role</span><b>{player.role}</b></div>
      </div>
      <div className="ea-sb-actions">
        <button className="ea-sb-action primary" onClick={() => { onShowToast?.('Quick sub applied'); sub(player.id, subOptions[0]?.id ?? player.id) }}><Icon>↔</Icon> Quick sub</button>
        <button className="ea-sb-action" onClick={() => setSwapWith(subOptions[0] ?? null)}><Icon>⚡</Icon> Swap</button>
        <button className="ea-sb-action" onClick={() => onGoHub?.()}><Icon>←</Icon> Hub</button>
      </div>
    </aside>
  )
}
