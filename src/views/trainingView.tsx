import { PageHeader } from './pageHeader'
import type { CareerProfile, Player, PlayerSkills, TrainingSession } from '../types'
import { trainingSessions } from '../data'
import { Icon } from '../utils'

export function TrainingView({ profile, players, trainingEnergy, lastTrainingDay, simDay, doTrainingSession }: { profile: CareerProfile; players: Player[]; trainingEnergy: number; lastTrainingDay: number; simDay: number; doTrainingSession: (s: TrainingSession) => void }) {
  const myPlayer = players.find((p) => p.id === 900) ?? players[0]
  const skills = myPlayer.skills ?? { pace: 60, shooting: 60, passing: 60, dribbling: 60, physical: 60 }
  const skillList: { key: keyof PlayerSkills; label: string; icon: string; color: string }[] = [
    { key: 'pace', label: 'PACE', icon: '⚡', color: 'purple' },
    { key: 'shooting', label: 'SHOOTING', icon: '◎', color: 'amber' },
    { key: 'passing', label: 'PASSING', icon: '↗', color: 'cyan' },
    { key: 'dribbling', label: 'DRIBBLING', icon: '◈', color: 'lime' },
    { key: 'physical', label: 'PHYSICAL', icon: '▦', color: 'purple' },
  ]
  const avgSkills = Math.round((skills.pace + skills.shooting + skills.passing + skills.dribbling + skills.physical) / 5)
  const canTrain = lastTrainingDay !== simDay && trainingEnergy >= 22
  return <>
    <PageHeader eyebrow={`TRAINING GROUND · DAY ${simDay}`} title="Training ground" description={`${profile.name} · ${profile.clubName} · Day ${simDay}`} action={<div className="training-energy-pill"><Icon>⚡</Icon><b>{trainingEnergy}%</b><small>Energy</small><div className="energy-track"><i style={{ width: `${trainingEnergy}%` }} /></div></div>} />
    <div className="training-grid">
      <section className="panel training-skills-panel">
        <div className="panel-heading"><div><span className="section-kicker">PLAYER SKILLS</span><h3>{profile.name}</h3></div><strong className="training-avg">{avgSkills}<small>AVG</small></strong></div>
        <div className="training-skill-list">{skillList.map((s) => <div key={s.key} className="training-skill-row"><div className="training-skill-icon" style={{ background: `var(--${s.color})`, opacity: .18 }}><Icon>{s.icon}</Icon></div><div className="training-skill-info"><span>{s.label}</span><b>{skills[s.key as keyof PlayerSkills]}</b><div className="training-skill-track"><i style={{ width: `${skills[s.key as keyof PlayerSkills]}%`, background: `var(--${s.color})` }} /></div></div></div>)}</div>
      </section>
      <section className="panel training-sessions-panel">
        <div className="panel-heading"><div><span className="section-kicker">{canTrain ? 'AVAILABLE SESSIONS' : lastTrainingDay === simDay ? 'SESSION COMPLETE' : 'LOW ENERGY'}</span><h3>Today's drills</h3></div></div>
        {trainingSessions.map((session) => <button key={session.id} className={`training-session-card ${!canTrain || trainingEnergy < session.energyCost ? 'disabled' : ''}`} onClick={() => doTrainingSession(session)} disabled={!canTrain || trainingEnergy < session.energyCost}>
          <span className="training-session-icon"><Icon>{session.icon}</Icon></span>
          <div className="training-session-info"><b>{session.label}</b><p>{session.description}</p></div>
          <div className="training-session-meta"><span className={`difficulty ${session.energyCost > 30 ? 'high' : session.energyCost > 25 ? 'medium' : 'low'}`}>{session.skill.toUpperCase()}</span><small>−{session.energyCost} ⚡</small></div>
        </button>)}
        {!canTrain && <div className="empty-state"><h3>Rest & recover</h3><p>{lastTrainingDay === simDay ? 'Come back tomorrow for your next session.' : 'Your energy is too low. Rest overnight to recharge.'}</p></div>}
      </section>
    </div>
  </>
}

