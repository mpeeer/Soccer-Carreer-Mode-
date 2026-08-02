import { PageHeader } from "./pageHeader"
import { DynamicBar } from "./squadView"
import type { CareerProfile, Player, MatchPhase, PlayerMatch, ManagerMatch, SimulationEvent, View } from '../types'
import { seasonFixtures } from '../data'
import { formatMoney, Icon } from '../utils'

/* ──────────────────────────────────────────────────────────────
   MANAGER HUB — minimal flat dashboard
   identity band → next/inbox/league → metrics band → lower row
   ────────────────────────────────────────────────────────────── */
export function ManagerHubView({ profile, players, budget, weekNumber, dateIndex, fixtureResults, seasonNumber, managerMatch, matchSpeed, onSetSpeed, onContinue, onFinishMatch, simulationEvents, onSubPlayer, openModal, setActiveView }: { profile: CareerProfile; players: Player[]; budget: number; weekNumber: number; dateIndex: number; fixtureResults: Record<number, string>; seasonNumber: number; managerMatch: ManagerMatch | null; matchSpeed: number; onSetSpeed: (s: number) => void; onContinue: () => void; onFinishMatch: () => void; simulationEvents: SimulationEvent[]; onSubPlayer: (outId: number, inId: number) => void; openModal: (title: string) => void; setActiveView: (view: View) => void }) {
  if (managerMatch) return <ManagerMatchdayPanel match={managerMatch} profile={profile} players={players} matchSpeed={matchSpeed} onSetSpeed={onSetSpeed} onFinish={onFinishMatch} onSubPlayer={onSubPlayer} />
  const fixture = seasonFixtures[dateIndex]
  const currentResult = fixtureResults[dateIndex]
  // Representative premium-league table data for the right rail
  const leagueTable = [
    { pos: 1, name: 'Bournemouth', crest: '#bd2031', p: 38, w: 6, d: 4, l: 3, gd: 14, pts: 22 },
    { pos: 2, name: 'Arsenal', crest: '#ef0107', p: 38, w: 6, d: 3, l: 2, gd: 9, pts: 21 },
    { pos: 3, name: 'SPAL', crest: '#1e6ca8', p: 38, w: 6, d: 2, l: 3, gd: 6, pts: 20 },
    { pos: 4, name: 'Fulham', crest: '#000000', p: 38, w: 5, d: 4, l: 4, gd: 5, pts: 19 },
    { pos: 5, name: 'Crystal Palace', crest: '#1b458f', p: 38, w: 5, d: 4, l: 4, gd: 4, pts: 19 },
    { pos: 6, name: 'York City', crest: '#ff7a00', p: 38, w: 5, d: 3, l: 5, gd: 2, pts: 18 },
    { pos: 7, name: 'Watford', crest: '#f7b500', p: 38, w: 5, d: 3, l: 5, gd: 1, pts: 18 },
    { pos: 8, name: 'Forest', crest: '#dd0000', p: 38, w: 5, d: 2, l: 6, gd: 0, pts: 17 },
    { pos: 9, name: 'Newcastle', crest: '#241f20', p: 38, w: 4, d: 4, l: 5, gd: -1, pts: 16 },
    { pos: 10, name: 'Bromley', crest: '#000033', p: 38, w: 4, d: 4, l: 5, gd: -3, pts: 16 },
    { pos: 11, name: 'Derby', crest: '#000000', p: 38, w: 4, d: 4, l: 5, gd: -4, pts: 16 },
    { pos: 12, name: 'Luton Town', crest: '#f78f1e', p: 38, w: 4, d: 3, l: 6, gd: -6, pts: 15 },
  ]
  // Representative inbox
  const messages = [
    { id: 'm1', from: 'George Lynch', subject: 'Boardroom focus', body: 'The board has ratified your appointment. Season objective confirmed: a top-six finish with a net spend below €40M.', date: 'Sat 26, May', time: '11:00', unread: true },
    { id: 'm2', from: 'Simon Newton', subject: 'Recruitment focus update', body: 'The scouting network filed three new reports this morning. Average recommendation rating 4.4/5 across the shortlist.', date: 'Sat 26, May', time: '10:01', unread: true },
    { id: 'm3', from: 'Rufus Emerson', subject: 'Club dynamics', body: 'Squad morale is strong after a full week of training. Two senior players have offered to mentor academy graduates.', date: 'Sun 27, May', time: '03:45', unread: true },
    { id: 'm4', from: 'James Field', subject: 'Training week in review', body: 'Excellent intensity across all units this week. Fitness is up across the squad with no injuries reported.', date: 'Fri 25, May', time: '16:30', unread: false },
    { id: 'm5', from: 'Andrew Cuffin', subject: 'Tactics & instruction', body: 'Opposition report filed: expect a compact mid block. The wide channels should be our primary route.', date: 'Fri 25, May', time: '18:20', unread: false },
    { id: 'm6', from: 'Andrew Cuffin', subject: 'Tactician overview update', body: 'Matchday plan confirmed — balanced shape with a high press for the opening fifteen minutes.', date: 'Fri 25, May', time: '20:30', unread: false },
    { id: 'm7', from: 'Simon Newton', subject: 'Player of the week', body: 'Three candidates shortlisted for Player of the Week honours after the weekend fixtures.', date: 'Fri 25, May', time: '20:30', unread: false },
  ]
  const leaguePosition = leagueTable.find((row) => row.name === profile.clubName)?.pos ?? 7
  const squadAvg = Math.round(players.reduce((t, p) => t + p.rating, 0) / players.length)

  return (
    <>
      {/* Identity band */}
      <section className="dash-band">
        <div className="dash-ident">
          <div className="dash-crest" style={{ background: profile.primaryColor }}>{profile.clubShort}</div>
          <div className="dash-ident-text">
            <span className="dash-kicker">{profile.league} · Season {seasonNumber} · Week {weekNumber}</span>
            <h1 className="dash-club">{profile.clubName}</h1>
            <span className="dash-ident-meta">Manager · {profile.name}</span>
          </div>
        </div>
        <div className="dash-band-stats">
          <div className="dash-stat"><span>League position</span><b>{leaguePosition}</b><em>of 12</em></div>
          <div className="dash-stat"><span>Form</span><b className="dash-form">W W D W</b><em>last 4</em></div>
          <div className="dash-stat"><span>Squad average</span><b>{squadAvg}</b><em>rating</em></div>
          <div className="dash-stat"><span>Transfer budget</span><b>{formatMoney(budget)}</b><em>available</em></div>
        </div>
      </section>

      {/* Top row: next fixture | inbox | league */}
      <div className="dash-top">
        <section className="panel dash-next">
          <div className="panel-head">
            <span className="kicker">Next fixture</span>
            <span className="kicker">{fixture.home ? 'HOME' : 'AWAY'} · {fixture.difficulty?.toUpperCase() ?? 'MEDIUM'}</span>
          </div>
          <div className="hub-nextmatch">
            <div className="hub-nextmatch-time">
              <b>20:00</b>
              <span className="kicker">KICK-OFF</span>
            </div>
            <div className="hub-nextmatch-info">
              <span className="kicker">Opposition report</span>
              <b className="hub-nextmatch-fc">{fixture.home ? `${profile.clubName} vs ${fixture.short}` : `${fixture.short} vs ${profile.clubShort}`}</b>
              <small className="muted">{fixture.date}{currentResult ? ` · FINAL ${currentResult}` : ''}</small>
            </div>
            <div className="hub-nextmatch-actions">
              <button className="btn btn-primary btn-block" onClick={onContinue}>
                Continue <Icon>→</Icon>
              </button>
              <button className="btn btn-ghost btn-block" onClick={() => setActiveView('tactics')}>
                Edit tactics <Icon>✎</Icon>
              </button>
            </div>
          </div>

          <div className="hub-cal-mini">
            <div className="panel-head" style={{ padding: 'var(--s-2) var(--s-4)' }}>
              <b style={{ fontSize: 'var(--t-sm)' }}>August 2026</b>
              <div className="cal-dots">
                <button className="cal-dot active"></button>
                <button className="cal-dot"></button>
                <button className="cal-dot"></button>
              </div>
            </div>
            <div className="cal-grid-mini">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((wd) => (
                <div key={wd} className="cal-h-cell">{wd}</div>
              ))}
              {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
                const isMatch = day === 6 || day === 13 || day === 17 || day === 22 || day === 27
                return (
                  <div key={day} className={`cal-d-cell${isMatch ? ' match' : ''}${day === 4 ? ' today' : ''}`}>
                    <span className="cal-d-num">{day}</span>
                    {day === 6 && <span className="cal-d-evt">CHEL</span>}
                    {day === 13 && <span className="cal-d-evt">ARS</span>}
                    {day === 22 && <span className="cal-d-evt">ARS</span>}
                    {day === 27 && <span className="cal-d-evt">FUL</span>}
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        <section className="panel dash-inbox">
          <div className="panel-head">
            <span className="kicker">Inbox</span>
            <div className="msg-tabs">
              <button className="msg-tab active">All</button>
              <button className="msg-tab">New <i>(5)</i></button>
              <button className="msg-tab">Today <i>(3)</i></button>
              <button className="msg-tab">Unread <i>(3)</i></button>
            </div>
            <div className="panel-head-actions">
              <button className="iconbtn">⌕</button>
              <button className="iconbtn">⚙</button>
              <button className="iconbtn">▾</button>
            </div>
          </div>
          <div className="msg-list">
            {messages.map((msg) => (
              <div key={msg.id} className={`msg-row${msg.unread ? ' unread' : ''}`} onClick={() => setActiveView('calendar')}>
                <div className="msg-avatar" style={{ background: profile.primaryColor }}>
                  {msg.from.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                </div>
                <div className="msg-body">
                  <b className="msg-from">{msg.from}</b>
                  <span className="msg-subject">{msg.subject}</span>
                </div>
                <span className="msg-time">{msg.time}</span>
              </div>
            ))}
          </div>
          <div className="panel-foot">
            <span className="dash-quiet">Representative inbox · Saved locally</span>
          </div>
        </section>

        <section className="panel dash-league">
          <div className="panel-head">
            <span className="kicker">League · {profile.league}</span>
            <span className="kicker">Matchweek {weekNumber}</span>
          </div>
          <div className="league-table-mini">
            <div className="league-table-head">
              <span>#</span><span>Team</span><span>Pld</span><span>Pts</span>
            </div>
            {leagueTable.map((row) => (
              <div key={row.pos} className={`league-table-row${row.name === profile.clubName ? ' highlighted' : ''}`}>
                <span className="lt-pos" style={{ color: row.pos === 1 ? 'var(--r-good)' : row.pos <= 4 ? 'var(--accent)' : row.pos >= 12 ? 'var(--r-poor)' : 'var(--text-muted)' }}>{row.pos}</span>
                <span className="lt-team">
                  <i style={{ background: row.crest, width: 8, height: 8, borderRadius: 2, display: 'inline-block', marginRight: 6 }} /> {row.name}
                </span>
                <span className="lt-p">{row.p}</span>
                <span className="lt-pts">{row.pts}</span>
              </div>
            ))}
          </div>
          <div className="panel-foot" style={{ justifyContent: 'flex-end' }}>
            <span className="dash-quiet">Top 12 of 20 · Representative data</span>
          </div>
        </section>
      </div>

      {/* Metrics band */}
      <div className="metrics-band">
        <div className="metric">
          <div className="m-icon">⌁</div>
          <div className="m-label">Wage bill</div>
          <div className="m-value">€186K</div>
          <div className="m-delta">per week</div>
        </div>
        <div className="metric">
          <div className="m-icon accent">✧</div>
          <div className="m-label">Squad morale</div>
          <div className="m-value">88%</div>
          <div className="m-delta positive">+6 this month</div>
        </div>
        <div className="metric">
          <div className="m-icon">✦</div>
          <div className="m-label">Youth pipeline</div>
          <div className="m-value">A−</div>
          <div className="m-delta">3 prospects ready</div>
        </div>
        <div className="metric">
          <div className="m-icon accent">◎</div>
          <div className="m-label">Board confidence</div>
          <div className="m-value">8.6</div>
          <div className="m-delta positive">/10 · secure</div>
        </div>
      </div>

      {/* Lower row: schedule | briefing + top performers */}
      <div className="grid-lower">
        <section className="panel">
          <div className="panel-head">
            <span className="kicker">Future schedule</span>
            <span className="kicker">All competitions</span>
          </div>
          <div className="fix-list">
            {seasonFixtures.slice(dateIndex + 1, dateIndex + 6).map((f, i) => (
              <div key={i} className="fix-row">
                <span className="fix-date">{f.date}</span>
                <span className="fix-league">{f.competition} <small>·</small> <b>{f.home ? 'H' : 'A'}</b></span>
                <div className="fix-opp">
                  <div className="crest-mini" style={{ background: f.crest }}>{f.short}</div>
                  <span>{f.opponent}</span>
                  <span className={`pill ${f.difficulty === 'High' ? 'bad' : f.difficulty === 'Medium' ? 'warn' : 'good'}`}>{f.difficulty} test</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="dash-side">
          <section className="panel">
            <div className="panel-head">
              <div>
                <span className="kicker">Club briefing</span>
                <h3>Today at the club</h3>
              </div>
              <button className="btn btn-link" onClick={() => setActiveView('market')}>
                Transfer hub <Icon>→</Icon>
              </button>
            </div>
            <div className="panel-rows">
              {simulationEvents.length > 0 ? simulationEvents.slice(0, 5).map((event) => (
                <div className="event" key={event.id}>
                  <div className="e-dot" />
                  <div className="e-text">
                    <b>{event.label}</b>
                    <small>{event.detail}</small>
                  </div>
                  <div className="e-time mono">NEW</div>
                </div>
              )) : (
                <>
                  <div className="event"><div className="e-dot accent" /><div className="e-text"><b>Board objective updated</b><small>Secure a top-six finish</small></div><div className="e-time mono">09:20</div></div>
                  <div className="event"><div className="e-dot good" /><div className="e-text"><b>Market movement</b><small>Bellori&apos;s value rose to €36.5M</small></div><div className="e-time mono">08:45</div></div>
                  <div className="event"><div className="e-dot warn" /><div className="e-text"><b>Training report</b><small>3 players reached peak fitness</small></div><div className="e-time mono">YEST</div></div>
                </>
              )}
            </div>
          </section>

          <section className="panel">
            <div className="panel-head">
              <div>
                <span className="kicker">Squad</span>
                <h3>Top performers</h3>
              </div>
              <button className="btn btn-link" onClick={() => setActiveView('squad')}>
                Full squad <Icon>→</Icon>
              </button>
            </div>
            <div className="panel-rows">
              {[...players].sort((a, b) => b.form - a.form).slice(0, 5).map((p) => (
                <div className="panel-row" key={p.id}>
                  <div className="row-icon" style={{ background: p.color, color: '#fff', fontWeight: 700, fontSize: 11 }}>{p.initials}</div>
                  <div className="row-text"><b>{p.name}</b><small>{p.position} · {p.role ?? 'Rotation'}</small></div>
                  <b className="row-meta accent">{p.rating}</b>
                  <span className={`pill rating ${p.rating >= 85 ? 'exc' : p.rating >= 75 ? 'good' : 'avg'}`}>{p.form}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </>
  )
}


/* ──────────────────────────────────────────────────────────────
   PLAYER HUB — personal dashboard, same flat system
   ────────────────────────────────────────────────────────────── */
export function PlayerHubView({ profile, player, clockLabel, simDay, dateIndex = 0, playerMatchPhase, playerMatch, actionTimer, matchSpeed, onSetSpeed, trainingProgress, rivalryScore, managerTrust, simulationEvents, onAdvanceMatch, onMatchAction, openModal, setActiveView }: { profile: CareerProfile; player: Player; clockLabel: string; simDay: number; dateIndex?: number; playerMatchPhase: MatchPhase | null; playerMatch: PlayerMatch | null; actionTimer: number; matchSpeed: number; onSetSpeed: (s: number) => void; trainingProgress: number; rivalryScore: number; managerTrust: number; simulationEvents: SimulationEvent[]; onAdvanceMatch: () => void; onMatchAction: (action: 'attack' | 'compose' | 'conserve' | 'press' | 'hold' | 'risk' | 'encourage' | 'humble') => void; openModal: (title: string) => void; setActiveView: (view: View) => void }) {
  return (
    <>
      {/* Identity band */}
      <section className="dash-band">
        <div className="dash-ident">
          <div className="dash-crest" style={{ background: profile.primaryColor }}>{profile.name.split(' ').map((p) => p[0]).join('').slice(0, 2)}</div>
          <div className="dash-ident-text">
            <span className="dash-kicker">{profile.league} · Player career</span>
            <h1 className="dash-club">{profile.name}</h1>
            <span className="dash-ident-meta">{profile.playerPosition} · {profile.clubName} · {player.contract} yrs remaining</span>
          </div>
        </div>
        <div className="dash-band-stats">
          <div className="dash-stat"><span>Overall</span><b>{player.rating}</b><em>current</em></div>
          <div className="dash-stat"><span>Form</span><b>{player.form}</b><em>current</em></div>
          <div className="dash-stat"><span>Morale</span><b>{player.morale}</b><em>current</em></div>
          <div className="dash-stat"><span>Potential</span><b>{player.potential}</b><em>ceiling</em></div>
        </div>
      </section>

      {/* Matchday + development */}
      <div className="grid-hero">
        <MatchdayPanel
          profile={profile}
          phase={playerMatchPhase}
          match={playerMatch}
          clockLabel={clockLabel}
          simDay={simDay}
          actionTimer={actionTimer}
          matchSpeed={matchSpeed}
          onSetSpeed={onSetSpeed}
          onAdvance={onAdvanceMatch}
          onAction={onMatchAction}
          openModal={openModal}
        />

        <section className="panel">
          <div className="panel-head">
            <div>
              <span className="kicker">Development</span>
              <h3>Growth this season</h3>
            </div>
            <button className="btn btn-link" onClick={() => setActiveView('training')}>
              Open training <Icon>→</Icon>
            </button>
          </div>
          <div className="panel-body">
            <div className="dev-hero">
              <div className="dev-hero-avatar" style={{ background: `linear-gradient(135deg, ${profile.primaryColor}, ${profile.secondaryColor})` }}>
                {profile.name.split(' ').map((part) => part[0]).join('').slice(0, 2)}
              </div>
              <div>
                <b style={{ display: 'block', fontSize: 'var(--t-md)' }}>{profile.name}</b>
                <small className="muted" style={{ fontSize: 'var(--t-xs)' }}>{profile.playerPosition} · {profile.clubName}</small>
              </div>
              <div className="dev-hero-pot">
                <b>{player.potential}</b>
                <span>Potential</span>
              </div>
            </div>
            <div className="stack">
              <DynamicBar label="Technical" value={72} color="purple" />
              <DynamicBar label="Physical" value={64} color="cyan" />
              <DynamicBar label="Mental" value={78} color="lime" />
            </div>
            <div style={{ marginTop: 'var(--s-5)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span className="kicker">Season progress</span>
                <b style={{ fontSize: 'var(--t-md)', fontVariantNumeric: 'tabular-nums' }}>{Math.round(trainingProgress)}%</b>
              </div>
              <div className="bar"><i style={{ width: `${Math.round(trainingProgress)}%` }} /></div>
            </div>
          </div>
        </section>
      </div>

      {/* Metrics band */}
      <div className="metrics-band">
        <div className="metric">
          <div className="m-icon accent">★</div>
          <div className="m-label">Match fitness</div>
          <div className="m-value">{player.fitness}%</div>
          <div className="m-delta">{player.fitness >= 90 ? 'Peak' : player.fitness >= 80 ? 'Sharp' : 'Building'}</div>
        </div>
        <div className="metric">
          <div className="m-icon">◎</div>
          <div className="m-label">Manager trust</div>
          <div className="m-value">{managerTrust}%</div>
          <div className="m-delta">{managerTrust >= 70 ? 'Strong' : managerTrust >= 50 ? 'Stable' : 'Pressure'}</div>
        </div>
        <div className="metric">
          <div className="m-icon accent">⚡</div>
          <div className="m-label">Rivalry score</div>
          <div className="m-value">{rivalryScore}</div>
          <div className="m-delta">{rivalryScore >= 60 ? 'Competitive' : 'Building'}</div>
        </div>
        <div className="metric">
          <div className="m-icon">✦</div>
          <div className="m-label">Contract</div>
          <div className="m-value">{player.contract}y</div>
          <div className="m-delta">remaining</div>
        </div>
      </div>

      {/* Activity + upcoming fixtures */}
      <div className="grid-lower">
        <section className="panel">
          <div className="panel-head">
            <div>
              <span className="kicker">Activity</span>
              <h3>Recent updates</h3>
            </div>
            <button className="btn btn-link" onClick={() => setActiveView('squad')}>
              See full squad <Icon>→</Icon>
            </button>
          </div>
          <div className="panel-rows">
            {simulationEvents.length === 0 && (
              <div className="panel-row" style={{ padding: 'var(--s-5) 0' }}>
                <div className="row-icon">·</div>
                <div className="row-text">
                  <b>No activity yet</b>
                  <small>Start a session and your events will appear here.</small>
                </div>
              </div>
            )}
            {simulationEvents.slice(0, 6).map((event) => (
              <div className="event" key={event.id}>
                <div className="e-dot" />
                <div className="e-text">
                  <b>{event.label}</b>
                  <small>{event.detail}</small>
                </div>
                <div className="e-time">NEW</div>
              </div>
            ))}
          </div>
        </section>

        <section className="panel">
          <div className="panel-head">
            <div>
              <span className="kicker">Fixtures</span>
              <h3>Upcoming schedule</h3>
            </div>
            <button className="btn btn-link" onClick={() => setActiveView('calendar')}>
              Full calendar <Icon>→</Icon>
            </button>
          </div>
          <div className="fix-list">
            {seasonFixtures.slice(dateIndex, dateIndex + 5).map((f, i) => (
              <div key={i} className="fix-row">
                <span className="fix-date">{f.date}</span>
                <span className="fix-league">{f.competition} <small>·</small> <b>{f.home ? 'H' : 'A'}</b></span>
                <div className="fix-opp">
                  <div className="crest-mini" style={{ background: f.crest }}>{f.short}</div>
                  <span>{f.opponent}</span>
                  <span className={`pill ${f.difficulty === 'High' ? 'bad' : f.difficulty === 'Medium' ? 'warn' : 'good'}`}>{f.difficulty} test</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  )
}

/* ──────────────────────────────────────────────────────────────
   MATCHDAY PANEL — right side of the hero for player hub
   ────────────────────────────────────────────────────────────── */
export function MatchdayPanel({ profile, phase, match, clockLabel, simDay, actionTimer, matchSpeed, onSetSpeed, onAdvance, onAction, openModal }: { profile: CareerProfile; phase: MatchPhase | null; match: PlayerMatch | null; clockLabel: string; simDay: number; actionTimer: number; matchSpeed: number; onSetSpeed: (s: number) => void; onAdvance: () => void; onAction: (action: 'attack' | 'compose' | 'conserve' | 'press' | 'hold' | 'risk' | 'encourage' | 'humble') => void; openModal: (title: string) => void }) {
  const phaseLabel = phase === 'pre' ? 'TEAM TALK' : phase === 'live' ? `${match?.minute ?? 0}'` : phase === 'halftime' ? 'HALF-TIME' : phase === 'fulltime' ? 'FULL-TIME' : phase === 'interview' ? 'POST-MATCH' : 'NEXT APPEARANCE'
  const advanceLabel = phase === 'pre' ? 'Enter match' : phase === 'halftime' ? 'Start second half' : phase === 'fulltime' ? 'Go to interview' : 'Finish report'
  const inChoicePoint = actionTimer > 0 && (phase === 'live' || phase === 'pre' || phase === 'halftime')
  const matchNarrative = phase === 'pre' ? 'Final team talk. You are in the starting XI.'
    : phase === 'live' && match && match.minute < 15 ? 'Settling into the game.'
    : phase === 'live' && match && match.minute < 30 ? 'Game opening up.'
    : phase === 'live' && match && match.minute < 45 ? 'Approaching half-time.'
    : phase === 'halftime' ? 'Half-time adjustments.'
    : phase === 'live' && match && match.minute < 65 ? 'Second half pressure.'
    : phase === 'live' && match && match.minute < 80 ? 'Final quarter.'
    : phase === 'live' ? 'Closing stages.'
    : phase === 'fulltime' ? 'Full-time.'
    : phase === 'interview' ? 'Post-match interview.'
    : 'Awaiting next appearance.'

  const getLiveChoices = (): { action: 'attack' | 'compose' | 'conserve' | 'press' | 'hold' | 'risk' | 'encourage' | 'humble'; label: string; sub: string }[] => {
    if (phase === 'pre') return [{ action: 'attack', label: 'Set the tone early', sub: 'Aggressive start' }, { action: 'compose', label: 'Feel the game out', sub: 'Patient approach' }]
    if (phase === 'halftime') return [{ action: 'attack', label: 'Raise the tempo', sub: 'Push forward' }, { action: 'hold', label: 'Stay compact', sub: 'Conserve energy' }]
    if (phase === 'fulltime' || phase === 'interview') return [{ action: 'encourage', label: 'Praise the team', sub: 'Build morale' }, { action: 'humble', label: 'Stay grounded', sub: 'Protect reputation' }]
    const m = match?.minute ?? 0
    if (m < 25) return [{ action: 'press', label: 'Press the full-back', sub: 'High intensity' }, { action: 'compose', label: 'Keep it simple', sub: 'Short passes' }, { action: 'risk', label: 'Play the through ball', sub: 'Chance creation' }]
    if (m < 50) return [{ action: 'attack', label: 'Run into the channel', sub: 'Stretch defence' }, { action: 'hold', label: 'Hold position', sub: 'Stay available' }, { action: 'risk', label: 'Take the shot', sub: 'Test keeper' }]
    if (m < 70) return [{ action: 'press', label: 'Track back & tackle', sub: 'Defensive shift' }, { action: 'compose', label: 'Switch the play', sub: 'Open weak side' }, { action: 'attack', label: 'Drive into the box', sub: 'Goal threat' }]
    return [{ action: 'risk', label: 'Go for the winner', sub: 'Everything on the line' }, { action: 'hold', label: 'Secure the result', sub: 'Game management' }, { action: 'press', label: 'Win the decisive duel', sub: 'One last effort' }]
  }
  const liveChoices = getLiveChoices()

  return (
    <section className={`match-card${phase ? ' live' : ''}`}>
      <div className="panel-head">
        <span className="kicker">{phase === 'live' ? 'Live match' : phase === 'pre' ? 'Team talk' : phase === 'halftime' ? 'Half-time' : phase === 'fulltime' ? 'Full-time' : phase === 'interview' ? 'Post-match' : 'Next appearance'}</span>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <button className={`btn btn-sm ${matchSpeed === 1 ? 'btn-primary' : 'btn-ghost'}`} onClick={() => onSetSpeed(1)}>1×</button>
          <button className={`btn btn-sm ${matchSpeed === 2 ? 'btn-primary' : 'btn-ghost'}`} onClick={() => onSetSpeed(2)}>2×</button>
          <button className={`btn btn-sm ${matchSpeed === 10 ? 'btn-primary' : 'btn-ghost'}`} onClick={() => onSetSpeed(10)}>10×</button>
          <span className="mono" style={{ fontSize: 11, color: 'var(--text-dim)' }}>{phaseLabel}</span>
        </div>
      </div>

      {!phase && (
        <>
          <div className="muted" style={{ fontSize: 'var(--t-xs)' }}>SAT · DAY {simDay + 5} <span style={{ color: 'var(--text-dim)' }}>· IN 5 DAYS</span></div>
          <div className="match-crests">
            <div className="crest" style={{ background: profile.primaryColor }}>{profile.clubShort}</div>
            <div className="vs">VS</div>
            <div className="crest opp" style={{ background: '#e96a59' }}>RU</div>
          </div>
          <div className="match-teams">
            <b>{profile.clubName}</b>
            <span className="muted" style={{ fontSize: 'var(--t-xs)' }}>vs Redhaven United</span>
          </div>
          <div className="match-info">
            <span>Away · Riverside Ground</span>
            <span className="pill warn">Medium test</span>
          </div>
          <button className="btn btn-ghost" onClick={() => openModal('Matchday role')}>
            View expected role <Icon>→</Icon>
          </button>
        </>
      )}

      {phase && match && (
        <>
          <div className="match-scoreboard">
            <div><span>{profile.clubShort}</span><strong>{match.teamGoals}</strong></div>
            <div className="vs">—</div>
            <div><span>{match.opponentShort}</span><strong>{match.opponentGoals}</strong></div>
          </div>

          <div className="grid-3" style={{ padding: 'var(--s-3) 0', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span className="kicker">Performance</span>
              <b className="mono" style={{ fontSize: 'var(--t-md)' }}>{match.rating.toFixed(1)}</b>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span className="kicker">Stamina</span>
              <b className="mono" style={{ fontSize: 'var(--t-md)' }}>{Math.round(match.stamina)}%</b>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span className="kicker">Passes</span>
              <b className="mono" style={{ fontSize: 'var(--t-md)' }}>{match.passes}</b>
            </div>
          </div>

          <p className="muted" style={{ fontSize: 'var(--t-sm)' }}>{matchNarrative}</p>

          {inChoicePoint && (
            <div className="bar thin">
              <i style={{ width: `${(actionTimer / 8) * 100}%`, background: actionTimer <= 3 ? 'var(--warn)' : 'var(--accent)' }} />
            </div>
          )}
          {inChoicePoint && (
            <div style={{ fontSize: 'var(--t-xs)', color: actionTimer <= 3 ? 'var(--warn)' : 'var(--text-muted)', marginTop: 4 }}>
              {actionTimer}s to decide
            </div>
          )}

          {inChoicePoint && (
            <div className="grid-2" style={{ marginTop: 'var(--s-3)' }}>
              {liveChoices.map((c) => (
                <button key={c.action} className="btn btn-ghost" onClick={() => onAction(c.action)} style={{ flexDirection: 'column', height: 'auto', padding: 'var(--s-3)' }}>
                  <b style={{ fontSize: 'var(--t-sm)' }}>{c.label}</b>
                  <small className="muted">{c.sub}</small>
                </button>
              ))}
            </div>
          )}

          {!inChoicePoint && phase !== 'interview' && (
            <p className="muted" style={{ fontSize: 'var(--t-sm)' }}>{match.lastEvent}</p>
          )}

          {(phase === 'pre' || phase === 'halftime' || phase === 'fulltime') && !inChoicePoint && (
            <button className="btn btn-primary" onClick={onAdvance}>
              {advanceLabel} <Icon>→</Icon>
            </button>
          )}
        </>
      )}
    </section>
  )
}

/* ──────────────────────────────────────────────────────────────
   MANAGER MATCHDAY PANEL — full-width match view
   ────────────────────────────────────────────────────────────── */
export function ManagerMatchdayPanel({ match, profile, players, matchSpeed, onSetSpeed, onFinish, onSubPlayer }: { match: ManagerMatch; profile: CareerProfile; players: Player[]; matchSpeed: number; onSetSpeed: (s: number) => void; onFinish: () => void; onSubPlayer: (outId: number, inId: number) => void }) {
  const tiredPlayer = match.playerPerformances.find((pp) => { const p = players.find((pl) => pl.id === pp.id); return p && p.fitness < 75 && pp.rating < (p.rating - 2) })
  const availableSubs = players.filter((p) => !match.playerPerformances.some((pp) => pp.id === p.id)).slice(0, 3)
  return (
    <div className="stack-lg">
      <div className="panel">
        <div className="panel-head">
          <span className="pill live"><i /> Live · {match.minute}'</span>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <button className={`btn btn-sm ${matchSpeed === 1 ? 'btn-primary' : 'btn-ghost'}`} onClick={() => onSetSpeed(1)}>1×</button>
            <button className={`btn btn-sm ${matchSpeed === 2 ? 'btn-primary' : 'btn-ghost'}`} onClick={() => onSetSpeed(2)}>2×</button>
            <button className={`btn btn-sm ${matchSpeed === 10 ? 'btn-primary' : 'btn-ghost'}`} onClick={() => onSetSpeed(10)}>10×</button>
          </div>
        </div>
        <div className="match-crests">
          <div className="crest" style={{ background: profile.primaryColor }}>{profile.clubShort}</div>
          <div className="match-scoreboard" style={{ padding: 0 }}>
            <div><strong className="mono">{match.teamGoals}</strong><span>Home</span></div>
            <div className="vs">—</div>
            <div><strong className="mono">{match.opponentGoals}</strong><span>Away</span></div>
          </div>
          <div className="crest opp" style={{ background: match.crest }}>{match.opponentShort}</div>
        </div>
      </div>

      <div className="grid-3">
        <div className="metric">
          <div className="m-icon accent">◎</div>
          <div className="m-label">Possession</div>
          <div className="m-value">{match.possession}%</div>
          <div className="bar"><i style={{ width: `${match.possession}%`, background: match.possession > 50 ? 'var(--accent)' : 'var(--warn)' }} /></div>
        </div>
        <div className="metric">
          <div className="m-icon">⚡</div>
          <div className="m-label">Shots</div>
          <div className="m-value mono">{match.shots} <span style={{ fontSize: 18, color: 'var(--text-muted)' }}>vs {match.opponentShots}</span></div>
          <div className="m-delta">on target ratio</div>
        </div>
        <div className="metric">
          <div className="m-icon">↗</div>
          <div className="m-label">Squad form</div>
          <div className="m-value">{players.reduce((t, p) => t + p.form, 0) / players.length | 0}</div>
          <div className="m-delta">avg form index</div>
        </div>
      </div>

      <div className="grid-lower">
        <section className="panel">
          <div className="panel-head">
            <div>
              <span className="kicker">Match events</span>
              <h3>Timeline</h3>
            </div>
          </div>
          <div className="panel-rows">
            {match.events.slice(-5).map((e, i) => {
              const isGoal = e.includes('GOAL') || e.includes('goal')
              const isHalftime = e.includes('Half-time')
              return (
                <div className="event" key={i}>
                  <div className={`e-dot ${isGoal ? 'good' : isHalftime ? 'warn' : ''}`} />
                  <div className="e-text">
                    <b>{isGoal ? 'Goal' : isHalftime ? 'Half-time' : 'Play'}</b>
                    <small>{e}</small>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        <section className="panel">
          <div className="panel-head">
            <div>
              <span className="kicker">Performances</span>
              <h3>Top players on pitch</h3>
            </div>
          </div>
          <div className="panel-rows">
            {match.playerPerformances.slice(0, 6).map((pp) => {
              const player = players.find((p) => p.id === pp.id)
              if (!player) return null
              const delta = pp.rating - player.rating
              return (
                <div className="panel-row" key={pp.id}>
                  <div className="row-icon" style={{ background: player.color, color: '#fff', fontWeight: 700, fontSize: 11 }}>
                    {player.initials}
                  </div>
                  <div className="row-text">
                    <b>{player.name}</b>
                    <small>{player.position} · {player.role}</small>
                  </div>
                  <div className="row-meta" style={{ color: delta > 0 ? 'var(--good)' : delta < -2 ? 'var(--bad)' : 'var(--text-muted)' }}>
                    {pp.rating.toFixed(1)} {delta > 0 ? '↑' : delta < -2 ? '↓' : ''}
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      </div>

      {tiredPlayer && availableSubs.length > 0 && (match.minute === 45 || (match.minute > 45 && match.minute < 85)) && (
        <section className="panel">
          <div className="panel-head">
            <div>
              <span className="kicker">Suggested sub</span>
              <h3>{players.find((p) => p.id === tiredPlayer.id)?.name} is tiring</h3>
            </div>
          </div>
          <div className="grid-3" style={{ marginTop: 'var(--s-2)' }}>
            {availableSubs.slice(0, 2).map((sub) => (
              <button key={sub.id} className="btn btn-ghost" onClick={() => onSubPlayer(tiredPlayer.id, sub.id)} style={{ flexDirection: 'column', height: 'auto', padding: 'var(--s-3)' }}>
                <b>{sub.name}</b>
                <small className="muted">{sub.position} · {sub.rating} OVR</small>
              </button>
            ))}
          </div>
        </section>
      )}

      {match.minute >= 85 && (
        <button className="btn btn-primary btn-lg" onClick={onFinish}>
          Final whistle <Icon>→</Icon>
        </button>
      )}
    </div>
  )
}

/* ──────────────────────────────────────────────────────────────
   MANAGER HUB — the manager dashboard (legacy matchweek view)
   ────────────────────────────────────────────────────────────── */
export function HubView({ profile, budget, dateIndex, fixtureResults, players, managerMatch, matchSpeed, onSetSpeed, onFinishMatch, onSubPlayer, continueWeek, openModal, setActiveView }: { profile: CareerProfile; budget: number; dateIndex: number; fixtureResults: Record<number, string>; players: Player[]; managerMatch: ManagerMatch | null; matchSpeed: number; onSetSpeed: (s: number) => void; onFinishMatch: () => void; onSubPlayer: (outId: number, inId: number) => void; continueWeek: () => void; openModal: (title: string) => void; setActiveView: (view: View) => void }) {
  const fixture = seasonFixtures[dateIndex]
  const currentResult = fixtureResults[dateIndex]
  if (managerMatch) return <ManagerMatchdayPanel match={managerMatch} profile={profile} players={players} matchSpeed={matchSpeed} onSetSpeed={onSetSpeed} onFinish={onFinishMatch} onSubPlayer={onSubPlayer} />

  return (
    <>
      <PageHeader
        eyebrow={`${profile.league} · ${fixture.date}`}
        title="Matchweek"
        description={`${fixture.competition} · ${fixture.home ? 'Home' : 'Away'} · ${profile.clubName}`}
        action={            <button className="btn btn-primary" onClick={() => continueWeek()}>
            Continue week <Icon>→</Icon>
          </button>
        }
      />

      <div className="grid-hero">
        <section className="hero hero-split">
          <div>
            <div className="hero-meta">
              <span className="pill live"><i /> Manager</span>
              <span className="pill">Ranked #7</span>
            </div>
            <h2>{profile.clubName}</h2>
            <p>{fixture.competition} · {fixture.home ? 'Home' : 'Away'} vs {fixture.opponent}</p>
            <div className="hero-footline">
              <div>
                <span>Form</span>
                <b>W W D W</b>
              </div>
              <div>
                <span>Board confidence</span>
                <b className="accent">8.6 / 10</b>
              </div>
              <div>
                <span>Squad value</span>
                <b>€184.2M</b>
              </div>
            </div>
          </div>
          <div className="hero-big-number">
            <small>Squad avg</small>
            {Math.round(players.reduce((t, p) => t + p.rating, 0) / players.length)}
          </div>
        </section>

        <section className="match-card">
          <div className="panel-head">
            <span className="kicker">Up next</span>
          </div>
          <div className="muted" style={{ fontSize: 'var(--t-xs)' }}>
            {fixture.date} · <span style={{ color: 'var(--text-dim)' }}>{currentResult ? `FINAL ${currentResult}` : `IN ${dateIndex === 0 ? '5' : '12'} DAYS`}</span>
          </div>
          <div className="match-crests">
            <div className="crest" style={{ background: profile.primaryColor }}>{profile.clubShort}</div>
            <div className="vs">VS</div>
            <div className="crest opp" style={{ background: fixture.crest }}>{fixture.short}</div>
          </div>
          <div className="match-teams">
            <b>{profile.clubName}</b>
            <span className="muted" style={{ fontSize: 'var(--t-xs)' }}>vs {fixture.opponent}</span>
          </div>
          <div className="match-info">
            <span>{fixture.home ? `${profile.clubName} Stadium · Home` : 'Riverside Ground · Away'}</span>
            <span className={`pill ${fixture.difficulty === 'High' ? 'bad' : fixture.difficulty === 'Medium' ? 'warn' : 'good'}`}>{fixture.difficulty} test</span>
          </div>
          <button className="btn btn-ghost" onClick={() => openModal(currentResult ? 'Match report' : 'Match preparation')}>
            {currentResult ? 'Review match report' : 'Prepare for match'} <Icon>→</Icon>
          </button>
        </section>
      </div>

      <div className="grid-4">
        <div className="metric">
          <div className="m-icon accent">€</div>
          <div className="m-label">Transfer budget</div>
          <div className="m-value">{formatMoney(budget)}</div>
          <div className="m-delta positive">+€4.2M this window</div>
        </div>
        <div className="metric">
          <div className="m-icon">⌁</div>
          <div className="m-label">Wage bill</div>
          <div className="m-value">€186K</div>
          <div className="m-delta">per week</div>
        </div>
        <div className="metric">
          <div className="m-icon accent">✧</div>
          <div className="m-label">Squad morale</div>
          <div className="m-value">88%</div>
          <div className="m-delta positive">+6 this month</div>
        </div>
        <div className="metric">
          <div className="m-icon">✦</div>
          <div className="m-label">Youth pipeline</div>
          <div className="m-value">A−</div>
          <div className="m-delta">3 prospects ready</div>
        </div>
      </div>

      <div className="grid-lower">
        <section className="panel">
          <div className="panel-head">
            <div>
              <span className="kicker">Season pulse</span>
              <h3>Momentum is building</h3>
            </div>
            <button className="btn btn-link">Last 6 matches <Icon>⌄</Icon></button>
          </div>
          <div style={{ position: 'relative', height: 160, marginTop: 'var(--s-5)' }}>
            <svg viewBox="0 0 600 180" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
              <defs>
                <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
                </linearGradient>
              </defs>
              {[0, 1, 2, 3].map((i) => (
                <line key={i} x1="0" y1={45 * i + 10} x2="600" y2={45 * i + 10} stroke="var(--line)" strokeDasharray="4 4" />
              ))}
              <path d="M15 125 C80 100, 100 110, 145 102 S220 92, 270 98 S330 60, 375 66 S435 42, 480 42 S540 22, 585 15 L 600 180 L 0 180 Z" fill="url(#trendFill)" />
              <path d="M15 125 C80 100, 100 110, 145 102 S220 92, 270 98 S330 60, 375 66 S435 42, 480 42 S540 22, 585 15" fill="none" stroke="var(--accent)" strokeWidth="2" />
              {[
                { x: 15, y: 125, l: 'Aug 01' },
                { x: 145, y: 102, l: 'Aug 07' },
                { x: 270, y: 98, l: 'Aug 14' },
                { x: 480, y: 42, l: 'Sep 04' },
                { x: 585, y: 15, l: 'Sep 11' },
              ].map((p) => (
                <g key={p.l}>
                  <circle cx={p.x} cy={p.y} r="3" fill="var(--accent)" />
                  <text x={p.x} y="170" fill="var(--text-dim)" fontSize="11" textAnchor="middle">{p.l}</text>
                </g>
              ))}
            </svg>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 'var(--s-3)', borderTop: '1px solid var(--line)', marginTop: 'var(--s-2)' }}>
            <span className="accent" style={{ fontSize: 'var(--t-sm)', fontWeight: 700 }}>↗ 18.4%</span>
            <span className="muted" style={{ fontSize: 'var(--t-xs)' }}>Squad performance index, last 6 matches</span>
          </div>
        </section>

        <section className="panel">
          <div className="panel-head">
            <div>
              <span className="kicker">Briefing</span>
              <h3>Today at the club</h3>
            </div>
            <button className="btn btn-link" onClick={() => setActiveView('market')}>
              Open transfer hub <Icon>→</Icon>
            </button>
          </div>
          <div className="panel-rows">
            <div className="event">
              <div className="e-dot accent" />
              <div className="e-text">
                <b>Board objective updated</b>
                <small>Secure a top-six finish</small>
              </div>
              <div className="e-time">09:20</div>
            </div>
            <div className="event">
              <div className="e-dot good" />
              <div className="e-text">
                <b>Market movement</b>
                <small>Bellori's value rose to €36.5M</small>
              </div>
              <div className="e-time">08:45</div>
            </div>
            <div className="event">
              <div className="e-dot warn" />
              <div className="e-text">
                <b>Training report</b>
                <small>3 players reached peak fitness</small>
              </div>
              <div className="e-time">YEST</div>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}

/* ──────────────────────────────────────────────────────────────
   Metric helper (legacy, used by squad/detail panels)
   ────────────────────────────────────────────────────────────── */
export function Metric({ label, value, trend, icon, accent }: { label: string; value: string; trend: string; icon: string; accent: string }) {
  return (
    <div className="metric">
      <div className={`m-icon ${accent === 'purple' || accent === 'lime' ? 'accent' : ''}`}>{icon}</div>
      <div className="m-label">{label}</div>
      <div className="m-value">{value}</div>
      <div className={`m-delta ${trend.startsWith('+') ? 'positive' : ''}`}>{trend}</div>
    </div>
  )
}
