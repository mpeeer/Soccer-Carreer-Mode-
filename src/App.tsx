import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'

type View = 'hub' | 'squad' | 'market' | 'academy' | 'club'
type Position = 'GK' | 'CB' | 'LB' | 'RB' | 'DM' | 'CM' | 'AM' | 'LW' | 'RW' | 'ST'

type Player = {
  id: number
  name: string
  position: Position
  rating: number
  potential: number
  age: number
  form: number
  morale: number
  fitness: number
  value: number
  wage: number
  contract: number
  role: string
  initials: string
  color: string
}

type Fixture = {
  opponent: string
  short: string
  date: string
  competition: string
  home: boolean
  difficulty: 'Low' | 'Medium' | 'High'
  crest: string
}

type Prospect = {
  id: number
  name: string
  position: Position
  age: number
  rating: number
  potential: string
  value: string
  interest: string
  club: string
  flag: string
  color: string
  tags: string[]
}

const initialPlayers: Player[] = [
  { id: 1, name: 'Milo Vardic', position: 'GK', rating: 78, potential: 80, age: 29, form: 76, morale: 87, fitness: 92, value: 18500000, wage: 42000, contract: 2, role: 'First team', initials: 'MV', color: '#f4a261' },
  { id: 2, name: 'Eliot Van Doren', position: 'CB', rating: 81, potential: 84, age: 27, form: 84, morale: 91, fitness: 88, value: 32000000, wage: 56000, contract: 3, role: 'Crucial', initials: 'EV', color: '#58c4c6' },
  { id: 3, name: 'Rayan Kessler', position: 'CB', rating: 76, potential: 82, age: 22, form: 79, morale: 81, fitness: 95, value: 16500000, wage: 24000, contract: 4, role: 'Rotation', initials: 'RK', color: '#8a7dff' },
  { id: 4, name: 'Juno Marsetti', position: 'LB', rating: 80, potential: 85, age: 24, form: 88, morale: 89, fitness: 91, value: 28000000, wage: 38000, contract: 3, role: 'First team', initials: 'JM', color: '#f2c14e' },
  { id: 5, name: 'Tomas Osei', position: 'RB', rating: 75, potential: 79, age: 26, form: 71, morale: 76, fitness: 79, value: 11000000, wage: 27000, contract: 1, role: 'Rotation', initials: 'TO', color: '#df6d86' },
  { id: 6, name: 'Soren Halvik', position: 'DM', rating: 82, potential: 85, age: 25, form: 86, morale: 94, fitness: 90, value: 41000000, wage: 61000, contract: 4, role: 'Crucial', initials: 'SH', color: '#4e9ed4' },
  { id: 7, name: 'Nico Bellori', position: 'CM', rating: 79, potential: 88, age: 21, form: 91, morale: 92, fitness: 87, value: 36500000, wage: 31000, contract: 5, role: 'First team', initials: 'NB', color: '#f07f5e' },
  { id: 8, name: 'Arden Kova', position: 'CM', rating: 77, potential: 80, age: 28, form: 73, morale: 80, fitness: 93, value: 15000000, wage: 35000, contract: 2, role: 'Rotation', initials: 'AK', color: '#b893da' },
  { id: 9, name: 'Lio Santoro', position: 'AM', rating: 84, potential: 89, age: 23, form: 95, morale: 96, fitness: 86, value: 59000000, wage: 77000, contract: 4, role: 'Crucial', initials: 'LS', color: '#e8b74c' },
  { id: 10, name: 'Jae Min-Ro', position: 'LW', rating: 80, potential: 87, age: 22, form: 82, morale: 90, fitness: 89, value: 33000000, wage: 44000, contract: 3, role: 'First team', initials: 'JR', color: '#68b5a0' },
  { id: 11, name: 'Erlon Hyland', position: 'ST', rating: 86, potential: 91, age: 25, form: 93, morale: 95, fitness: 94, value: 78000000, wage: 105000, contract: 4, role: 'Crucial', initials: 'EH', color: '#d96b63' },
  { id: 12, name: 'Dario Venn', position: 'RW', rating: 74, potential: 83, age: 19, form: 77, morale: 84, fitness: 97, value: 12500000, wage: 17000, contract: 5, role: 'Prospect', initials: 'DV', color: '#77a9e8' },
  { id: 13, name: 'Cal Rook', position: 'CB', rating: 70, potential: 78, age: 20, form: 68, morale: 73, fitness: 100, value: 6000000, wage: 11000, contract: 3, role: 'Prospect', initials: 'CR', color: '#798798' },
]

const fixtures: Fixture[] = [
  { opponent: 'Redhaven United', short: 'RU', date: 'SAT, AUG 16', competition: 'Premier Division', home: true, difficulty: 'Medium', crest: '#e96a59' },
  { opponent: 'Violet Town', short: 'VT', date: 'WED, AUG 20', competition: 'Continental Cup · Qualifier', home: false, difficulty: 'High', crest: '#8e73d4' },
  { opponent: 'Oldcastle Rovers', short: 'OR', date: 'SUN, AUG 24', competition: 'Premier Division', home: true, difficulty: 'Low', crest: '#56a98e' },
  { opponent: 'Kingsport Athletic', short: 'KA', date: 'SAT, AUG 30', competition: 'Premier Division', home: false, difficulty: 'High', crest: '#e6ae52' },
]

const prospects: Prospect[] = [
  { id: 101, name: 'Marek Voss', position: 'ST', age: 19, rating: 72, potential: '87–92', value: '€9.4M', interest: 'Very high', club: 'Fjordholm FK', flag: 'NO', color: '#e89a69', tags: ['Poacher', 'Quick step'] },
  { id: 102, name: 'Teyo Aranda', position: 'RW', age: 20, rating: 75, potential: '84–89', value: '€14.8M', interest: 'High', club: 'Costa Azul', flag: 'ES', color: '#6e9ddc', tags: ['Inverted winger', 'Flair'] },
  { id: 103, name: 'Bastian Kroll', position: 'CB', age: 18, rating: 68, potential: '82–90', value: '€4.8M', interest: 'Medium', club: 'Rhein 04', flag: 'DE', color: '#a981d5', tags: ['Ball winner', 'Aerial'] },
  { id: 104, name: 'Naila Bouchard', position: 'CM', age: 21, rating: 77, potential: '85–88', value: '€21.5M', interest: 'High', club: 'AS Montreux', flag: 'FR', color: '#6ab9a5', tags: ['Deep playmaker', 'Vision'] },
]

const navItems: { id: View; label: string; icon: string }[] = [
  { id: 'hub', label: 'Central', icon: '⌂' },
  { id: 'squad', label: 'Squad', icon: '♙' },
  { id: 'market', label: 'Market', icon: '↗' },
  { id: 'academy', label: 'Academy', icon: '✦' },
  { id: 'club', label: 'Club vision', icon: '◈' },
]

function Icon({ children, className = '' }: { children: string; className?: string }) {
  return <span aria-hidden="true" className={`icon ${className}`}>{children}</span>
}

function formatMoney(value: number) {
  if (value >= 1000000) return `€${(value / 1000000).toFixed(1)}M`
  return `€${Math.round(value / 1000)}K`
}

function App() {
  const [activeView, setActiveView] = useState<View>('hub')
  const [players, setPlayers] = useState(initialPlayers)
  const [shortlist, setShortlist] = useState<number[]>([101, 104])
  const [scouted, setScouted] = useState<number[]>([])
  const [negotiations, setNegotiations] = useState<number[]>([])
  const [fixtureResults, setFixtureResults] = useState<Record<number, string>>({})
  const [dateIndex, setDateIndex] = useState(0)
  const [budget, setBudget] = useState(48500000)
  const [showNotifications, setShowNotifications] = useState(false)
  const [toast, setToast] = useState('')
  const [search, setSearch] = useState('')
  const [selectedPlayerId, setSelectedPlayerId] = useState(9)
  const [marketFilter, setMarketFilter] = useState<'All' | 'Shortlist' | 'Scouted'>('All')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalTitle, setModalTitle] = useState('')
  const [pendingInvestment, setPendingInvestment] = useState(false)

  const selectedPlayer = players.find((player) => player.id === selectedPlayerId) ?? players[0]
  const filteredProspects = useMemo(() => prospects.filter((prospect) => {
    const matchesSearch = prospect.name.toLowerCase().includes(search.toLowerCase()) || prospect.position.toLowerCase().includes(search.toLowerCase()) || prospect.club.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = marketFilter === 'All' || (marketFilter === 'Shortlist' ? shortlist.includes(prospect.id) : scouted.includes(prospect.id))
    return matchesSearch && matchesFilter
  }), [marketFilter, search, shortlist, scouted])

  const showToast = (message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 3200)
  }

  const continueWeek = () => {
    const currentFixture = fixtures[dateIndex]
    if (!currentFixture || fixtureResults[dateIndex]) {
      showToast('All scheduled fixtures have been resolved')
      return
    }
    const squadRating = players.reduce((total, player) => total + player.rating, 0) / players.length
    const formBoost = players.reduce((total, player) => total + player.form, 0) / players.length > 82 ? 1 : 0
    const homeGoals = Math.max(0, Math.min(4, Math.round((squadRating - 71) / 8) + (currentFixture.home ? 1 : 0) + formBoost))
    const awayGoals = currentFixture.difficulty === 'High' ? 2 : currentFixture.difficulty === 'Medium' ? 1 : 0
    const result = `${currentFixture.home ? homeGoals : awayGoals}–${currentFixture.home ? awayGoals : homeGoals}`
    setFixtureResults((current) => ({ ...current, [dateIndex]: result }))
    setDateIndex((current) => Math.min(current + 1, fixtures.length - 1))
    setPlayers((current) => current.map((player) => ({
      ...player,
      fitness: Math.max(62, player.fitness - (player.id % 3 === 0 ? 7 : 3)),
      form: Math.min(99, Math.max(55, player.form + (player.id % 2 === 0 ? 2 : -1))),
    })))
    showToast(`${currentFixture.opponent} resolved · final score ${result}`)
  }

  const toggleShortlist = (id: number) => {
    setShortlist((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])
    showToast(shortlist.includes(id) ? 'Removed from shortlist' : 'Added to shortlist')
  }

  const scoutProspect = (id: number) => {
    setScouted((current) => current.includes(id) ? current : [...current, id])
    showToast('Scout report requested · available instantly in this prototype')
  }

  const openModal = (title: string) => {
    setPendingInvestment(false)
    setModalTitle(title)
    setIsModalOpen(true)
  }

  const requestInvestment = () => {
    setPendingInvestment(true)
    setModalTitle('Budget request')
    setIsModalOpen(true)
  }

  const startNegotiation = (id: number) => {
    setNegotiations((current) => current.includes(id) ? current : [...current, id])
    const prospect = prospects.find((item) => item.id === id)
    showToast(`${prospect?.name ?? 'Target'} added to active negotiations`)
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-lockup">
          <div className="brand-mark">N<span>+</span></div>
          <div>
            <div className="brand-name">NORTHSTAR</div>
            <div className="brand-subtitle">CAREER MODE</div>
          </div>
        </div>

        <div className="season-block">
          <span className="eyebrow">SEASON 04</span>
          <strong>THE ASCENT</strong>
          <span className="season-progress"><i /></span>
          <small>Week {dateIndex + 2} of 38 <b>·</b> 12%</small>
        </div>

        <nav className="main-nav" aria-label="Main navigation">
          <span className="nav-label">MANAGER DESK</span>
          {navItems.map((item) => (
            <button key={item.id} aria-label={item.label} title={item.label} className={`nav-item ${activeView === item.id ? 'active' : ''}`} onClick={() => setActiveView(item.id)}>
              <Icon>{item.icon}</Icon><span>{item.label}</span>{item.id === 'market' && <em>2</em>}
            </button>
          ))}
          <span className="nav-label secondary-label">CLUB OPERATIONS</span>
          <button className="nav-item" onClick={() => { setActiveView('club'); showToast('Club operations synced') }}><Icon>▦</Icon><span>Finance</span></button>
          <button className="nav-item" onClick={() => openModal('Settings')}><Icon>⚙</Icon><span>Settings</span></button>
        </nav>

        <div className="sidebar-bottom">
          <div className="assistant-card">
            <div className="assistant-avatar">MC</div>
            <div><b>Maya Chen</b><span>Head of recruitment</span></div>
            <Icon>⋯</Icon>
          </div>
          <div className="save-state"><span className="status-dot" /> Autosave on <span>20:48</span></div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="mobile-brand"><div className="brand-mark">N<span>+</span></div><b>NORTHSTAR</b></div>
          <div className="breadcrumbs"><span>MANAGER CAREER</span><Icon>›</Icon><b>{navItems.find((item) => item.id === activeView)?.label.toUpperCase()}</b></div>
          <div className="top-actions">
            <button className="icon-button notification-button" aria-label="Notifications" onClick={() => setShowNotifications(!showNotifications)}><Icon>♢</Icon><i>3</i></button>
            <div className="top-divider" />
            <div className="manager-mini"><div className="manager-avatar">JP</div><div><b>Jules Park</b><span>Manager</span></div><Icon>⌄</Icon></div>
          </div>
          {showNotifications && <div className="notification-popover"><div className="popover-heading"><b>Inbox</b><small>3 unread</small></div><div className="notification-item"><span className="notification-icon amber">!</span><div><b>Board review due</b><p>Share a progress update before next fixture.</p></div></div><div className="notification-item"><span className="notification-icon blue">↗</span><div><b>Scout report ready</b><p>Naila Bouchard matches your midfield brief.</p></div></div><button onClick={() => setShowNotifications(false)}>Mark all as read</button></div>}
        </header>

        <div className="page-wrap">
          {activeView === 'hub' && <HubView budget={budget} dateIndex={dateIndex} fixtureResults={fixtureResults} continueWeek={continueWeek} openModal={openModal} setActiveView={setActiveView} />}
          {activeView === 'squad' && <SquadView players={players} selectedPlayer={selectedPlayer} setSelectedPlayerId={setSelectedPlayerId} openModal={openModal} />}
          {activeView === 'market' && <MarketView filteredProspects={filteredProspects} search={search} setSearch={setSearch} marketFilter={marketFilter} setMarketFilter={setMarketFilter} shortlist={shortlist} scouted={scouted} negotiations={negotiations} toggleShortlist={toggleShortlist} scoutProspect={scoutProspect} startNegotiation={startNegotiation} budget={budget} openModal={openModal} />}
          {activeView === 'academy' && <AcademyView openModal={openModal} setActiveView={setActiveView} />}
          {activeView === 'club' && <ClubView budget={budget} requestInvestment={requestInvestment} openModal={openModal} />}
        </div>
      </main>

      <nav className="mobile-nav" aria-label="Mobile navigation">
        {navItems.map((item) => <button key={item.id} aria-label={item.label} className={activeView === item.id ? 'active' : ''} onClick={() => setActiveView(item.id)}><Icon>{item.icon}</Icon><span>{item.label}</span>{item.id === 'market' && <em>2</em>}</button>)}
      </nav>

      {toast && <div className="toast"><span className="toast-check">✓</span>{toast}</div>}
      {isModalOpen && <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}><div className="modal" onClick={(event) => event.stopPropagation()}><button className="modal-close" aria-label="Close dialog" onClick={() => setIsModalOpen(false)}>×</button><span className="section-kicker">NORTHSTAR DESK</span><h2>{modalTitle}</h2><p>{pendingInvestment ? 'The board will review a €2.5M capital request for your transfer runway. Confirm to apply the investment to club finances.' : 'This management action is ready for your next decision. The prototype keeps your career state local so you can explore every system without losing your session.'}</p><div className="modal-choices"><button className="primary-button" onClick={() => { if (pendingInvestment) { setBudget((current) => current + 2500000); setPendingInvestment(false); showToast('Board investment approved · €2.5M added') } else { showToast(`${modalTitle} confirmed`) } setIsModalOpen(false) }}>Confirm action <Icon>→</Icon></button><button className="ghost-button" onClick={() => setIsModalOpen(false)}>Cancel</button></div></div></div>}
    </div>
  )
}

function PageHeader({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: ReactNode }) {
  return <div className="page-header"><div><span className="section-kicker">{eyebrow}</span><h1>{title}</h1><p>{description}</p></div>{action}</div>
}

function HubView({ budget, dateIndex, fixtureResults, continueWeek, openModal, setActiveView }: { budget: number; dateIndex: number; fixtureResults: Record<number, string>; continueWeek: () => void; openModal: (title: string) => void; setActiveView: (view: View) => void }) {
  const fixture = fixtures[dateIndex]
  const currentResult = fixtureResults[dateIndex]
  return <>
    <PageHeader eyebrow="MONDAY · AUGUST 11, 2026" title="The climb starts here." description="A new week, a clean slate, and one clear objective: make Northstar impossible to ignore." action={<button className="primary-button continue-button" onClick={continueWeek}><span className="pulse-ring" />Continue week <Icon>→</Icon></button>} />
    <div className="hero-grid">
      <section className="club-hero panel">
        <div className="hero-glow" />
        <div className="hero-content"><div className="hero-topline"><span className="live-pill"><i /> LIVE CAREER</span><span className="muted-text">RANKED #07 · PREMIER DIVISION</span></div><h2>Build something<br /><em>unforgettable.</em></h2><p>Three points from a continental place. Your squad believes. The city is watching.</p><div className="hero-actions"><button className="light-button" onClick={() => setActiveView('squad')}>Set lineup <Icon>→</Icon></button><button className="hero-text-button" onClick={() => openModal('Match preview')}>View match preview <Icon>↗</Icon></button></div></div>
        <div className="hero-stats"><div><span>FORM</span><b>W W D W</b></div><div><span>BOARD CONFIDENCE</span><b className="lime-text">8.6 <small>/ 10</small></b></div><div><span>CLUB VALUE</span><b>€184.2M</b></div></div>
      </section>
      <section className="next-match panel"><div className="panel-heading"><span className="section-kicker">UP NEXT</span><button className="more-button" onClick={() => openModal('Fixture list')}>•••</button></div><div className="match-date">{fixture.date} <span>· {currentResult ? `FINAL ${currentResult}` : `IN ${dateIndex === 0 ? '5' : '12'} DAYS`}</span></div><div className="versus"><div className="club-crest northstar-crest">N<span>+</span></div><div className="versus-copy"><strong>VS</strong><span>PREMIER DIVISION</span></div><div className="opponent-crest" style={{ background: fixture.crest }}>{fixture.short}</div></div><div className="match-names"><b>Northstar FC</b><b>{fixture.opponent}</b></div><div className="match-location"><Icon>⌖</Icon>{fixture.home ? 'Northstar Stadium · Home' : 'Riverside Ground · Away'}<span className={`difficulty ${fixture.difficulty.toLowerCase()}`}>{fixture.difficulty} test</span></div><button className="outline-button full-button" onClick={() => openModal(currentResult ? 'Match report' : 'Match preparation')}>{currentResult ? 'Review match report' : 'Prepare for match'} <Icon>→</Icon></button></section>
    </div>
    <div className="metric-row"><Metric label="TRANSFER BUDGET" value={formatMoney(budget)} trend="+€4.2M" icon="€" accent="purple" /><Metric label="WAGE ROOM" value="€186K" trend="per week" icon="⌁" accent="cyan" /><Metric label="SQUAD MORALE" value="88%" trend="+6 this month" icon="✧" accent="lime" /><Metric label="YOUTH PIPELINE" value="A−" trend="3 prospects ready" icon="✦" accent="amber" /></div>
    <div className="lower-grid"><section className="panel season-pulse"><div className="panel-heading"><div><span className="section-kicker">SEASON PULSE</span><h3>Momentum is building</h3></div><button className="select-button">Last 6 matches <Icon>⌄</Icon></button></div><div className="chart-wrap"><div className="chart-y"><span>90</span><span>75</span><span>60</span><span>45</span></div><div className="chart"><div className="chart-grid"><i /><i /><i /><i /></div><div className="chart-line"><span style={{ left: '4%', bottom: '31%' }} /><span style={{ left: '21%', bottom: '44%' }} /><span style={{ left: '38%', bottom: '40%' }} /><span style={{ left: '55%', bottom: '67%' }} /><span style={{ left: '72%', bottom: '77%' }} /><span style={{ left: '89%', bottom: '88%' }} /></div><div className="chart-area" /><svg viewBox="0 0 600 180" preserveAspectRatio="none" className="trend-svg"><path d="M15 125 C80 100, 100 110, 145 102 S220 92, 270 98 S330 60, 375 66 S435 42, 480 42 S540 22, 585 15" /></svg><div className="chart-labels"><span>AUG 01</span><span>AUG 04</span><span>AUG 07</span><span>AUG 11</span></div></div></div><div className="pulse-footer"><div><span className="trend-up">↗ 18.4%</span><span>Squad performance index</span></div><div className="legend"><i className="legend-dot" /> Overall rating <i className="legend-dot gray" /> Target</div></div></section><section className="panel briefing"><div className="panel-heading"><div><span className="section-kicker">MANAGER BRIEFING</span><h3>Today at the club</h3></div><button className="more-button">•••</button></div><div className="brief-item"><div className="brief-icon purple">✦</div><div><b>Board objective updated</b><p>Secure a top-six finish</p></div><span className="brief-time">09:20</span></div><div className="brief-item"><div className="brief-icon amber">↗</div><div><b>Market movement</b><p>Bellori's value rose to €36.5M</p></div><span className="brief-time">08:45</span></div><div className="brief-item"><div className="brief-icon cyan">♙</div><div><b>Training report</b><p>3 players reached peak fitness</p></div><span className="brief-time">YEST.</span></div><button className="text-link" onClick={() => setActiveView('market')}>Open transfer hub <Icon>→</Icon></button></section></div>
  </>
}

function Metric({ label, value, trend, icon, accent }: { label: string; value: string; trend: string; icon: string; accent: string }) {
  return <div className="metric-card panel"><div className={`metric-icon ${accent}`}>{icon}</div><div><span>{label}</span><strong>{value}</strong><small className={trend.startsWith('+') ? 'positive' : ''}>{trend}</small></div><Icon className="metric-arrow">↗</Icon></div>
}

function SquadView({ players, selectedPlayer, setSelectedPlayerId, openModal }: { players: Player[]; selectedPlayer: Player; setSelectedPlayerId: (id: number) => void; openModal: (title: string) => void }) {
  return <><PageHeader eyebrow="SQUAD MANAGEMENT · 13 PLAYERS" title="Your people, your edge." description="Protect the dressing room, chase the marginal gains, and pick the XI that can win Saturday." action={<button className="outline-button" onClick={() => openModal('Team tactics')}><Icon>◎</Icon> Team tactics</button>} /><div className="squad-layout"><section className="panel squad-list-panel"><div className="squad-toolbar"><div className="filter-tabs"><button className="active">All players <span>13</span></button><button>Starting XI <span>11</span></button><button>Development <span>4</span></button></div><button className="select-button">Sort: OVR <Icon>⌄</Icon></button></div><div className="player-table"><div className="table-head"><span>PLAYER</span><span>POS</span><span>OVR</span><span>FORM</span><span>FITNESS</span><span>ROLE</span><span /></div>{players.map((player) => <button className={`player-row ${selectedPlayer.id === player.id ? 'selected' : ''}`} key={player.id} onClick={() => setSelectedPlayerId(player.id)}><div className="player-cell"><div className="player-avatar" style={{ background: player.color }}>{player.initials}</div><div><b>{player.name}</b><small>{player.age} yrs · {player.contract} yr contract</small></div></div><span className="position-chip">{player.position}</span><strong className="rating-number">{player.rating}</strong><span className={`form-value ${player.form >= 85 ? 'hot' : ''}`}><i />{player.form}</span><span className="fitness-bar"><i style={{ width: `${player.fitness}%` }} /><small>{player.fitness}%</small></span><span className="role-text">{player.role}</span><Icon>›</Icon></button>)}</div></section><PlayerDetail player={selectedPlayer} openModal={openModal} /></div></>
}

function PlayerDetail({ player, openModal }: { player: Player; openModal: (title: string) => void }) {
  return <aside className="panel player-detail"><div className="detail-cover" style={{ background: `linear-gradient(135deg, ${player.color}, #162137 78%)` }}><span className="detail-number">{String(player.id).padStart(2, '0')}</span><div className="detail-avatar">{player.initials}</div><div className="detail-name"><span>{player.position} · {player.age} YEARS</span><h2>{player.name}</h2><small>Northstar FC · Since 2024</small></div></div><div className="detail-body"><div className="detail-rating"><div><span>OVERALL</span><strong>{player.rating}</strong></div><div><span>POTENTIAL</span><strong className="potential">{player.potential}</strong></div><div><span>MARKET VALUE</span><strong>{formatMoney(player.value)}</strong></div></div><div className="detail-section"><div className="detail-section-title"><b>Dynamic OVR</b><span className="positive">+3 this month</span></div><div className="dynamic-bars"><DynamicBar label="Form" value={player.form} color="purple" /><DynamicBar label="Morale" value={player.morale} color="lime" /><DynamicBar label="Match fitness" value={player.fitness} color="cyan" /></div></div><div className="detail-section attributes"><div className="detail-section-title"><b>Key attributes</b><button className="text-link">Full profile <Icon>→</Icon></button></div><div className="attribute-grid"><span>PACE <b>{player.position === 'ST' ? 91 : 78}</b></span><span>SHOOTING <b>{player.position === 'ST' ? 94 : 69}</b></span><span>PASSING <b>{player.position === 'ST' ? 78 : 84}</b></span><span>DEFENDING <b>{player.position === 'CB' ? 88 : 42}</b></span></div></div><div className="detail-actions"><button className="primary-button" onClick={() => openModal(`Develop ${player.name}`)}>Set development <Icon>→</Icon></button><button className="square-button" onClick={() => openModal(`Player actions: ${player.name}`)}>•••</button></div></div></aside>
}

function DynamicBar({ label, value, color }: { label: string; value: number; color: string }) {
  return <div className="dynamic-row"><div><span>{label}</span><b>{value}</b></div><div className="dynamic-track"><i className={color} style={{ width: `${value}%` }} /></div></div>
}

function MarketView({ filteredProspects, search, setSearch, marketFilter, setMarketFilter, shortlist, scouted, negotiations, toggleShortlist, scoutProspect, startNegotiation, budget, openModal }: { filteredProspects: Prospect[]; search: string; setSearch: (value: string) => void; marketFilter: 'All' | 'Shortlist' | 'Scouted'; setMarketFilter: (value: 'All' | 'Shortlist' | 'Scouted') => void; shortlist: number[]; scouted: number[]; negotiations: number[]; toggleShortlist: (id: number) => void; scoutProspect: (id: number) => void; startNegotiation: (id: number) => void; budget: number; openModal: (title: string) => void }) {
  return <><PageHeader eyebrow="TRANSFER HUB · WINDOW OPEN" title="Find the next story." description="Scout smarter. Build for tomorrow. Every deal is a conversation, not a shortcut." action={<div className="budget-pill"><span>AVAILABLE TO SPEND</span><b>{formatMoney(budget)}</b><Icon>€</Icon></div>} /><div className="market-toolbar panel"><div className="market-tabs"><button className={marketFilter === 'All' ? 'active' : ''} onClick={() => setMarketFilter('All')}>Discover <span>24</span></button><button className={marketFilter === 'Shortlist' ? 'active' : ''} onClick={() => setMarketFilter('Shortlist')}>Shortlist <span>{shortlist.length}</span></button><button className={marketFilter === 'Scouted' ? 'active' : ''} onClick={() => setMarketFilter('Scouted')}>Reports ready <span>{scouted.length}</span></button></div><label className="search-box"><Icon>⌕</Icon><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search player, position or club" /><kbd>⌘ K</kbd></label><button className="filter-button" onClick={() => openModal('Advanced filters')}><Icon>≡</Icon> Filters <span>2</span></button></div><div className="market-summary"><div><b>{filteredProspects.length === 0 ? 'No' : filteredProspects.length}</b><span>targets matching your profile</span></div><div className="summary-separator" /><div><span>Recruitment brief</span><b className="brief-tag">U21 · high potential · attack</b></div><button className="text-link" onClick={() => openModal('Recruitment brief')}>Edit brief <Icon>→</Icon></button></div><div className="prospect-grid">{filteredProspects.map((prospect) => <ProspectCard key={prospect.id} prospect={prospect} isShortlisted={shortlist.includes(prospect.id)} isScouted={scouted.includes(prospect.id)} isNegotiating={negotiations.includes(prospect.id)} toggleShortlist={toggleShortlist} scoutProspect={scoutProspect} startNegotiation={startNegotiation} />)}</div>{filteredProspects.length === 0 && <div className="empty-state panel"><div>⌕</div><h3>No targets found</h3><p>Try a wider search or switch back to Discover.</p></div>}</>
}

function ProspectCard({ prospect, isShortlisted, isScouted, isNegotiating, toggleShortlist, scoutProspect, startNegotiation }: { prospect: Prospect; isShortlisted: boolean; isScouted: boolean; isNegotiating: boolean; toggleShortlist: (id: number) => void; scoutProspect: (id: number) => void; startNegotiation: (id: number) => void }) {
  return <article className="prospect-card panel"><div className="prospect-top"><span className="prospect-id">SCOUT 0{prospect.id - 100}</span><button className={`star-button ${isShortlisted ? 'starred' : ''}`} onClick={() => toggleShortlist(prospect.id)} aria-label="Toggle shortlist">★</button></div><div className="prospect-portrait" style={{ background: `linear-gradient(140deg, ${prospect.color}, #1a2740)` }}><span>{prospect.name.split(' ').map((word) => word[0]).join('')}</span><div className="country-badge">{prospect.flag}</div></div><div className="prospect-main"><div className="prospect-title"><div><h3>{prospect.name}</h3><span>{prospect.club} · {prospect.age} yrs</span></div><b className="prospect-rating">{prospect.rating}</b></div><div className="prospect-meta"><span className="position-chip">{prospect.position}</span><span><small>POTENTIAL</small><b>{prospect.potential}</b></span><span><small>VALUE</small><b>{prospect.value}</b></span></div><div className="tag-row">{prospect.tags.map((tag) => <span key={tag}>{tag}</span>)}</div><div className="interest-row"><span>PLAYER INTEREST</span><strong className={prospect.interest === 'Very high' ? 'very-high' : ''}><i />{prospect.interest}</strong></div></div><div className="prospect-actions"><button className="outline-button" onClick={() => scoutProspect(prospect.id)}>{isScouted ? 'Report ready' : 'Request report'} <Icon>{isScouted ? '✓' : '→'}</Icon></button><button className="primary-button" onClick={() => startNegotiation(prospect.id)}>{isNegotiating ? 'Negotiating' : 'Enquire'} <Icon>{isNegotiating ? '✓' : '↗'}</Icon></button></div></article>
}

function AcademyView({ openModal, setActiveView }: { openModal: (title: string) => void; setActiveView: (view: View) => void }) {
  return <><PageHeader eyebrow="NORTHSTAR ACADEMY · 6 PLAYERS" title="Tomorrow is already here." description="Give the next generation a pathway, a purpose, and a reason to stay." action={<button className="primary-button" onClick={() => openModal('Youth tournament')}>Enter tournament <Icon>→</Icon></button>} /><div className="academy-hero panel"><div className="academy-copy"><span className="live-pill purple-pill">✦ ACADEMY SPOTLIGHT</span><h2>The next<br /><em>breakthrough.</em></h2><p>Every great club has a moment when potential becomes permission. Your academy is three decisions away.</p><div className="academy-progress"><div><span>ACADEMY RANKING</span><b>04 <small>of 18</small></b></div><div className="progress-track"><i /></div><small>Top 3 earns an invite to the National Youth Series</small></div></div><div className="academy-player"><div className="academy-orbit orbit-one" /><div className="academy-orbit orbit-two" /><div className="academy-portrait">IS</div><span className="academy-rating">68 <small>OVR</small></span><div className="academy-player-name"><span>U18 · CAM</span><b>Imani Sol</b><small>Scout confidence: high</small></div></div></div><div className="academy-grid"><section className="panel youth-list"><div className="panel-heading"><div><span className="section-kicker">YOUTH PIPELINE</span><h3>Players to watch</h3></div><button className="text-link" onClick={() => openModal('Full academy list')}>View all <Icon>→</Icon></button></div><YouthRow name="Imani Sol" detail="CAM · 17 yrs" rating="68" status="Breakthrough ready" color="#df7e68" progress={88} /><YouthRow name="Luca Neri" detail="LB · 16 yrs" rating="62" status="Building momentum" color="#769ddc" progress={61} /><YouthRow name="Sami Okafor" detail="ST · 15 yrs" rating="55" status="Early development" color="#5eb59c" progress={34} /></section><section className="panel academy-actions"><div className="panel-heading"><div><span className="section-kicker">PROGRAMS</span><h3>Shape the future</h3></div></div><button className="program-card" onClick={() => openModal('Academy coaching')}><span className="program-icon purple">♙</span><span><b>Coach assignments</b><small>3 staff available · 2 open roles</small></span><Icon>→</Icon></button><button className="program-card" onClick={() => openModal('Youth recruitment')}><span className="program-icon amber">⌕</span><span><b>Expand recruitment</b><small>Explore a new regional network</small></span><Icon>→</Icon></button><button className="program-card" onClick={() => setActiveView('squad')}><span className="program-icon cyan">↗</span><span><b>Promote a player</b><small>Move a prospect to senior training</small></span><Icon>→</Icon></button></section></div></>
}

function YouthRow({ name, detail, rating, status, color, progress }: { name: string; detail: string; rating: string; status: string; color: string; progress: number }) {
  return <div className="youth-row"><div className="youth-avatar" style={{ background: color }}>{name.split(' ').map((word) => word[0]).join('')}</div><div className="youth-name"><b>{name}</b><small>{detail}</small></div><strong>{rating}</strong><div className="youth-progress"><span>{status}</span><div><i style={{ width: `${progress}%` }} /></div></div><Icon>›</Icon></div>
}

function ClubView({ budget, requestInvestment, openModal }: { budget: number; requestInvestment: () => void; openModal: (title: string) => void }) {
  return <><PageHeader eyebrow="CLUB VISION · 2026—2030" title="Make the badge mean more." description="A club is bigger than matchday. Build the culture, protect the runway, and leave a legacy." action={<button className="outline-button" onClick={() => openModal('Club roadmap')}><Icon>▦</Icon> Roadmap</button>} /><div className="vision-grid"><section className="panel vision-card primary-vision"><div className="vision-number">01</div><span className="section-kicker">BOARD MANDATE</span><h2>Earn Europe.<br /><em>Keep your soul.</em></h2><p>Qualify for continental football while maintaining a youth-first recruitment philosophy. The board is backing the plan.</p><div className="objective-score"><div><span>BOARD CONFIDENCE</span><b>86%</b></div><div className="score-track"><i /></div><small>+12 since the start of the season</small></div></section><section className="panel finance-card"><div className="panel-heading"><div><span className="section-kicker">FINANCIAL CONTROL</span><h3>Every choice compounds.</h3></div><span className="finance-health">HEALTHY</span></div><div className="finance-total"><span>TRANSFER BALANCE</span><strong>{formatMoney(budget)}</strong><small>Updated after last window activity</small></div><div className="finance-bars"><FinanceBar label="Squad wages" value="€1.84M" percent={64} color="purple" /><FinanceBar label="Scouting network" value="€420K" percent={28} color="cyan" /><FinanceBar label="Facilities" value="€680K" percent={42} color="amber" /></div><button className="outline-button full-button" onClick={requestInvestment}>Request board investment <Icon>→</Icon></button></section><section className="panel values-card"><div className="panel-heading"><div><span className="section-kicker">CLUB DNA</span><h3>What we stand for</h3></div><button className="more-button">•••</button></div><div className="value-row"><span className="value-symbol purple">✦</span><div><b>Brave football</b><small>Possession with purpose</small></div><strong>92</strong></div><div className="value-row"><span className="value-symbol lime">♙</span><div><b>Grow our own</b><small>Academy pathway first</small></div><strong>87</strong></div><div className="value-row"><span className="value-symbol amber">◈</span><div><b>One city, one club</b><small>Community always</small></div><strong>95</strong></div></section></div></>
}

function FinanceBar({ label, value, percent, color }: { label: string; value: string; percent: number; color: string }) {
  return <div className="finance-bar"><div><span>{label}</span><b>{value}</b></div><div className="finance-track"><i className={color} style={{ width: `${percent}%` }} /></div></div>
}

export default App
