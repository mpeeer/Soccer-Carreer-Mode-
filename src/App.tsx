import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'

type View = 'hub' | 'player' | 'squad' | 'market' | 'academy' | 'club'
type CareerMode = 'manager' | 'player'
type MatchPhase = 'pre' | 'live' | 'halftime' | 'fulltime' | 'interview'
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

type CareerProfile = {
  mode: CareerMode
  name: string
  clubName: string
  clubShort: string
  league: string
  primaryColor: string
  secondaryColor: string
  difficulty: string
  playerPosition: Position
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

type PlayerMatch = {
  opponent: string
  opponentShort: string
  minute: number
  rating: number
  goals: number
  assists: number
  passes: number
  choices: string[]
  teamGoals: number
  opponentGoals: number
  stamina: number
  lastEvent: string
}

type SimulationEvent = {
  id: number
  label: string
  detail: string
}

type SavedCareer = {
  profile: CareerProfile
  activeView: View
  players: Player[]
  shortlist: number[]
  scouted: number[]
  negotiations: number[]
  fixtureResults: Record<number, string>
  dateIndex: number
  budget: number
  selectedPlayerId: number
  simulationSpeed: 0 | 1 | 2 | 20
  isClockRunning: boolean
  simMinute: number
  simDay: number
  playerMatchPhase: MatchPhase | null
  playerMatch: PlayerMatch | null
  trainingProgress: number
  rivalryScore: number
  managerTrust: number
  simulationEvents: SimulationEvent[]
}

type SavedCareerEnvelope = {
  version: 1
  savedAt: number
  career: SavedCareer
}

type SaveStatus = 'saved' | 'saving' | 'error'

const SAVE_KEY = 'northstar-career-save'
const PROFILE_KEY = 'northstar-career-profile'
const CURRENT_SAVE_VERSION = 1

const validPositions: Position[] = ['GK', 'CB', 'LB', 'RB', 'DM', 'CM', 'AM', 'LW', 'RW', 'ST']

function isSavedCareerEnvelope(value: unknown): value is SavedCareerEnvelope {
  if (!value || typeof value !== 'object') return false
  const envelope = value as Partial<SavedCareerEnvelope>
  return envelope.version === CURRENT_SAVE_VERSION && typeof envelope.savedAt === 'number' && Number.isFinite(envelope.savedAt) && Boolean(envelope.career)
}

function isSavedProfile(value: unknown): value is CareerProfile {
  if (!value || typeof value !== 'object') return false
  const profile = value as Partial<CareerProfile>
  return (profile.mode === 'manager' || profile.mode === 'player') && typeof profile.name === 'string' && profile.name.trim().length > 0 && typeof profile.clubName === 'string' && profile.clubName.trim().length > 0 && typeof profile.clubShort === 'string' && profile.clubShort.trim().length > 0 && typeof profile.league === 'string' && profile.league.trim().length > 0 && typeof profile.primaryColor === 'string' && typeof profile.secondaryColor === 'string' && /^#[0-9a-f]{6}$/i.test(profile.primaryColor) && /^#[0-9a-f]{6}$/i.test(profile.secondaryColor) && validPositions.includes(profile.playerPosition as Position) && typeof profile.difficulty === 'string' && profile.difficulty.trim().length > 0
}

function isSavedPlayer(value: unknown): value is Player {
  if (!value || typeof value !== 'object') return false
  const player = value as Partial<Player>
  return Number.isFinite(player.id) && typeof player.name === 'string' && validPositions.includes(player.position as Position) && boundedNumber(player.rating, -1, 0, 99) === player.rating && boundedNumber(player.potential, -1, 0, 99) === player.potential && boundedNumber(player.age, -1, 15, 60) === player.age && boundedNumber(player.form, -1, 0, 100) === player.form && boundedNumber(player.morale, -1, 0, 100) === player.morale && boundedNumber(player.fitness, -1, 0, 100) === player.fitness && boundedNumber(player.value, -1, 0, 1000000000) === player.value && boundedNumber(player.wage, -1, 0, 1000000) === player.wage && boundedNumber(player.contract, -1, 0, 10) === player.contract && typeof player.role === 'string' && typeof player.initials === 'string' && typeof player.color === 'string' && /^#[0-9a-f]{6}$/i.test(player.color)
}

function boundedNumber(value: unknown, fallback: number, min: number, max: number) {
  return typeof value === 'number' && Number.isFinite(value) ? Math.max(min, Math.min(max, value)) : fallback
}

function isSavedMatchPhase(value: unknown): value is MatchPhase {
  return value === 'pre' || value === 'live' || value === 'halftime' || value === 'fulltime' || value === 'interview'
}

function isSavedPlayerMatch(value: unknown): value is PlayerMatch {
  if (!value || typeof value !== 'object') return false
  const match = value as Partial<PlayerMatch>
  return typeof match.opponent === 'string' && typeof match.opponentShort === 'string' && boundedNumber(match.minute, -1, 0, 90) === match.minute && boundedNumber(match.rating, -1, 0, 10) === match.rating && boundedNumber(match.goals, -1, 0, 10) === match.goals && boundedNumber(match.assists, -1, 0, 10) === match.assists && boundedNumber(match.passes, -1, 0, 200) === match.passes && Array.isArray(match.choices) && match.choices.every((choice) => typeof choice === 'string') && boundedNumber(match.teamGoals, -1, 0, 20) === match.teamGoals && boundedNumber(match.opponentGoals, -1, 0, 20) === match.opponentGoals && boundedNumber(match.stamina, -1, 0, 100) === match.stamina && typeof match.lastEvent === 'string'
}

function readSavedCareer(): (SavedCareer & { savedAt?: number }) | null {
  try {
    const raw = window.localStorage.getItem(SAVE_KEY)
    if (!raw) return null
    const rawParsed = JSON.parse(raw) as unknown
    const envelope = isSavedCareerEnvelope(rawParsed) ? rawParsed : null
    const parsed = (envelope?.career ?? rawParsed) as Partial<SavedCareer>
    if (!isSavedProfile(parsed.profile)) return null
    const profile = parsed.profile
    const allowedViews = profile.mode === 'player' ? ['hub', 'player', 'squad', 'club'] : ['hub', 'squad', 'market', 'academy', 'club']
    const activeView = typeof parsed.activeView === 'string' && allowedViews.includes(parsed.activeView) ? parsed.activeView as View : profile.mode === 'player' ? 'player' : 'hub'
    const fixtureResults = parsed.fixtureResults && typeof parsed.fixtureResults === 'object' ? Object.fromEntries(Object.entries(parsed.fixtureResults).filter(([key, value]) => /^\d+$/.test(key) && typeof value === 'string')) : {}
    let dateIndex = boundedNumber(parsed.dateIndex, 0, 0, fixtures.length - 1)
    dateIndex = Math.floor(dateIndex)
    while (dateIndex < fixtures.length - 1 && fixtureResults[dateIndex]) dateIndex += 1
    const savedPhase = isSavedMatchPhase(parsed.playerMatchPhase) ? parsed.playerMatchPhase : null
    const savedMatch = isSavedPlayerMatch(parsed.playerMatch) ? parsed.playerMatch : null
    const playerMatchPhase = parsed.profile.mode === 'player' && savedPhase && savedMatch ? savedPhase : null
    const playerMatch = playerMatchPhase ? savedMatch : null
    const simulationSpeed = parsed.simulationSpeed === 0 || parsed.simulationSpeed === 1 || parsed.simulationSpeed === 2 || parsed.simulationSpeed === 20 ? parsed.simulationSpeed : 1
    const simMinute = Math.floor(boundedNumber(parsed.simMinute, 9 * 60 + 30, 0, 24 * 60 - 1))
    const simDay = Math.floor(boundedNumber(parsed.simDay, 11, 1, 28))
    const players = Array.isArray(parsed.players) && parsed.players.length > 0 && parsed.players.every(isSavedPlayer) ? parsed.players : initialPlayers
    return {
      profile,
      activeView,
      players,
      shortlist: parsed.shortlist ?? [101, 104],
      scouted: parsed.scouted ?? [],
      negotiations: parsed.negotiations ?? [],
      fixtureResults,
      dateIndex,
      budget: boundedNumber(parsed.budget, 48500000, 0, 1000000000),
      selectedPlayerId: Math.floor(boundedNumber(parsed.selectedPlayerId, 9, 0, 10000)),
      simulationSpeed,
      isClockRunning: typeof parsed.isClockRunning === 'boolean' ? parsed.isClockRunning : true,
      simMinute,
      simDay,
      playerMatchPhase,
      playerMatch,
      trainingProgress: boundedNumber(parsed.trainingProgress, 42, 0, 100),
      rivalryScore: boundedNumber(parsed.rivalryScore, 48, 0, 100),
      managerTrust: boundedNumber(parsed.managerTrust, 74, 0, 100),
      simulationEvents: Array.isArray(parsed.simulationEvents) ? parsed.simulationEvents.filter((event): event is SimulationEvent => Boolean(event && typeof event.id === 'number' && typeof event.label === 'string' && typeof event.detail === 'string')).slice(0, 8) : [],
      ...(envelope ? { savedAt: envelope.savedAt } : {}),
    } as SavedCareer & { savedAt?: number }
  } catch {
    return null
  }
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

const playerNavItems: { id: View; label: string; icon: string }[] = [
  { id: 'hub', label: 'Central', icon: '⌂' },
  { id: 'player', label: 'My player', icon: '♙' },
  { id: 'squad', label: 'Club team', icon: '◎' },
  { id: 'club', label: 'Club life', icon: '◈' },
]

function Icon({ children, className = '' }: { children: string; className?: string }) {
  return <span aria-hidden="true" className={`icon ${className}`}>{children}</span>
}

function formatMoney(value: number) {
  if (value >= 1000000) return `€${(value / 1000000).toFixed(1)}M`
  return `€${Math.round(value / 1000)}K`
}

function formatSavedTime(value: number | null) {
  if (!value) return 'Not saved'
  return new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function createCareerPlayer(profile: CareerProfile): Player {
  const initials = profile.name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase() || 'NP'
  return { id: 900, name: profile.name, position: profile.playerPosition, rating: 66, potential: 86, age: 18, form: 72, morale: 82, fitness: 96, value: 2500000, wage: 6500, contract: 4, role: 'Prospect', initials, color: profile.primaryColor }
}

function App() {
  const savedCareer = readSavedCareer()
  const [profile, setProfile] = useState<CareerProfile | null>(savedCareer?.profile ?? null)
  const [activeView, setActiveView] = useState<View>(savedCareer?.activeView ?? 'hub')
  const [players, setPlayers] = useState(() => {
    if (savedCareer?.players?.length) {
      if (savedCareer.profile.mode !== 'player') return savedCareer.players
      const careerPlayer = createCareerPlayer(savedCareer.profile)
      const hasCareerPlayer = savedCareer.players.some((player) => player.id === careerPlayer.id)
      return hasCareerPlayer
        ? savedCareer.players.map((player) => player.id === careerPlayer.id ? { ...player, name: careerPlayer.name, position: careerPlayer.position, initials: careerPlayer.initials, color: careerPlayer.color } : player)
        : [...savedCareer.players, careerPlayer]
    }
    return savedCareer?.profile.mode === 'player' ? [...initialPlayers, createCareerPlayer(savedCareer.profile)] : initialPlayers
  })
  const [shortlist, setShortlist] = useState<number[]>(savedCareer?.shortlist ?? [101, 104])
  const [scouted, setScouted] = useState<number[]>(savedCareer?.scouted ?? [])
  const [negotiations, setNegotiations] = useState<number[]>(savedCareer?.negotiations ?? [])
  const [fixtureResults, setFixtureResults] = useState<Record<number, string>>(savedCareer?.fixtureResults ?? {})
  const [dateIndex, setDateIndex] = useState(savedCareer?.dateIndex ?? 0)
  const [budget, setBudget] = useState(savedCareer?.budget ?? 48500000)
  const [showNotifications, setShowNotifications] = useState(false)
  const [toast, setToast] = useState('')
  const [search, setSearch] = useState('')
  const [selectedPlayerId, setSelectedPlayerId] = useState(savedCareer?.profile.mode === 'player' ? 900 : savedCareer?.selectedPlayerId ?? 9)
  const [marketFilter, setMarketFilter] = useState<'All' | 'Shortlist' | 'Scouted'>('All')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalTitle, setModalTitle] = useState('')
  const [pendingInvestment, setPendingInvestment] = useState(false)
  const [simulationSpeed, setSimulationSpeed] = useState<0 | 1 | 2 | 20>(savedCareer?.simulationSpeed ?? 1)
  const [isClockRunning, setIsClockRunning] = useState(savedCareer?.isClockRunning ?? true)
  const [simMinute, setSimMinute] = useState(savedCareer?.simMinute ?? 9 * 60 + 30)
  const [simDay, setSimDay] = useState(savedCareer?.simDay ?? 11)
  const [playerMatchPhase, setPlayerMatchPhase] = useState<MatchPhase | null>(savedCareer?.playerMatchPhase ?? null)
  const [playerMatch, setPlayerMatch] = useState<PlayerMatch | null>(savedCareer?.playerMatch ?? null)
  const [trainingProgress, setTrainingProgress] = useState(savedCareer?.trainingProgress ?? 42)
  const [rivalryScore, setRivalryScore] = useState(savedCareer?.rivalryScore ?? 48)
  const [managerTrust, setManagerTrust] = useState(savedCareer?.managerTrust ?? 74)
  const [simulationEvents, setSimulationEvents] = useState<SimulationEvent[]>(savedCareer?.simulationEvents ?? [])
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved')
  const [savedAt, setSavedAt] = useState<number | null>(savedCareer?.savedAt ?? null)
  const processedDayRef = useRef(savedCareer?.simDay ?? 11)
  const previousMinuteRef = useRef(savedCareer?.simMinute ?? 9 * 60 + 30)
  const careerMode = profile?.mode ?? 'manager'
  const visibleNavItems = careerMode === 'player' ? playerNavItems : navItems

  const selectedPlayer = players.find((player) => player.id === selectedPlayerId) ?? players[0]
  const filteredProspects = useMemo(() => prospects.filter((prospect) => {
    const matchesSearch = prospect.name.toLowerCase().includes(search.toLowerCase()) || prospect.position.toLowerCase().includes(search.toLowerCase()) || prospect.club.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = marketFilter === 'All' || (marketFilter === 'Shortlist' ? shortlist.includes(prospect.id) : scouted.includes(prospect.id))
    return matchesSearch && matchesFilter
  }), [marketFilter, search, shortlist, scouted])

  const saveCareer = useCallback(() => {
    if (!profile) return false
    const nextSavedAt = Date.now()
    const career: SavedCareer = { profile, activeView, players, shortlist, scouted, negotiations, fixtureResults, dateIndex, budget, selectedPlayerId, simulationSpeed, isClockRunning, simMinute, simDay, playerMatchPhase, playerMatch, trainingProgress, rivalryScore, managerTrust, simulationEvents }
    const envelope: SavedCareerEnvelope = { version: CURRENT_SAVE_VERSION, savedAt: nextSavedAt, career }
    try {
      window.localStorage.setItem(SAVE_KEY, JSON.stringify(envelope))
      window.localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
      setSavedAt(nextSavedAt)
      setSaveStatus('saved')
      return true
    } catch {
      setSaveStatus('error')
      return false
    }
  }, [profile, activeView, players, shortlist, scouted, negotiations, fixtureResults, dateIndex, budget, selectedPlayerId, simulationSpeed, isClockRunning, simMinute, simDay, playerMatchPhase, playerMatch, trainingProgress, rivalryScore, managerTrust, simulationEvents])

  useEffect(() => {
    if (!profile || !isClockRunning || simulationSpeed === 0 || playerMatchPhase) return
    const timer = window.setInterval(() => {
      setSimMinute((current) => {
        const next = current + simulationSpeed
        return next >= 24 * 60 ? next - 24 * 60 : next
      })
    }, 1000)
    return () => window.clearInterval(timer)
  }, [profile, isClockRunning, simulationSpeed, playerMatchPhase])

  useEffect(() => {
    if (simMinute < previousMinuteRef.current) setSimDay((day) => day >= 28 ? 1 : day + 1)
    previousMinuteRef.current = simMinute
  }, [simMinute])

  useEffect(() => {
    if (!profile || processedDayRef.current === simDay) return
    processedDayRef.current = simDay
    setPlayers((currentPlayers) => currentPlayers.map((player) => ({
      ...player,
      form: Math.min(99, Math.max(55, player.form + (player.id % 2 === 0 ? 1 : -1))),
      fitness: Math.min(100, player.fitness + (player.id % 3 === 0 ? 6 : 3)),
    })))
    setTrainingProgress((currentProgress) => {
      const gain = profile.mode === 'player' ? 9 : 4
      const completed = currentProgress + gain >= 100
      if (completed) {
        setPlayers((currentPlayers) => currentPlayers.map((player) => player.id === 900 ? { ...player, rating: Math.min(player.potential, player.rating + 1), form: Math.min(99, player.form + 3) } : player))
        setSimulationEvents((current) => [{ id: Date.now(), label: 'Training milestone', detail: profile.mode === 'player' ? `${profile.name} reached a new development milestone.` : 'The training ground completed its daily block.' }, ...current].slice(0, 8))
      }
      return completed ? currentProgress + gain - 100 : currentProgress + gain
    })
    if (profile.mode === 'player') {
      setRivalryScore((current) => Math.max(0, Math.min(100, current + (simDay % 2 === 0 ? 2 : -1))))
      setManagerTrust((current) => Math.max(0, Math.min(100, current + (simDay % 3 === 0 ? 1 : 0))))
      setSimulationEvents((current) => [{ id: Date.now() + 1, label: 'Daily report', detail: `Training, recovery, and social standing processed for day ${simDay}.` }, ...current].slice(0, 8))
      if (simDay % 5 === 0 && !playerMatchPhase && dateIndex < fixtures.length && !fixtureResults[dateIndex]) {
        const fixture = fixtures[dateIndex]
        setPlayerMatch({ opponent: fixture.opponent, opponentShort: fixture.short, minute: 0, rating: 6.0, goals: 0, assists: 0, passes: 0, choices: [], teamGoals: 0, opponentGoals: fixture.difficulty === 'High' ? 2 : 1, stamina: 100, lastEvent: 'The whistle is about to go.' })
        setPlayerMatchPhase('pre')
        setIsClockRunning(false)
      }
    } else if (simDay % 7 === 0 && !fixtureResults[dateIndex]) {
      const fixture = fixtures[dateIndex % fixtures.length]
      const squadRating = players.reduce((total, item) => total + item.rating, 0) / players.length
      const homeGoals = Math.max(0, Math.min(4, Math.round((squadRating - 71) / 8) + (fixture.home ? 1 : 0)))
      const awayGoals = fixture.difficulty === 'High' ? 2 : 1
      const result = `${fixture.home ? homeGoals : awayGoals}–${fixture.home ? awayGoals : homeGoals}`
      setFixtureResults((current) => ({ ...current, [dateIndex]: result }))
      setDateIndex((current) => Math.min(current + 1, fixtures.length - 1))
      setSimulationEvents((current) => [{ id: Date.now() + 2, label: 'Simulated fixture', detail: `${fixture.opponent} finished ${result}.` }, ...current].slice(0, 8))
    }
  }, [profile, simDay, dateIndex, fixtureResults, players, playerMatchPhase])

  useEffect(() => {
    if (!profile) return
    setSaveStatus('saving')
    const saveTimer = window.setTimeout(saveCareer, 800)
    return () => window.clearTimeout(saveTimer)
  }, [profile, saveCareer])

  useEffect(() => {
    const flushSave = () => { saveCareer() }
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') flushSave()
    }
    window.addEventListener('pagehide', flushSave)
    window.addEventListener('beforeunload', flushSave)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      window.removeEventListener('pagehide', flushSave)
      window.removeEventListener('beforeunload', flushSave)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [saveCareer])

  const clockLabel = `${String(Math.floor(simMinute / 60)).padStart(2, '0')}:${String(simMinute % 60).padStart(2, '0')}`

  const startCareer = (nextProfile: CareerProfile) => {
    const nextPlayers = nextProfile.mode === 'player' ? [...initialPlayers, createCareerPlayer(nextProfile)] : initialPlayers
    setProfile(nextProfile)
    setActiveView(nextProfile.mode === 'player' ? 'player' : 'hub')
    setPlayers(nextPlayers)
    setShortlist([101, 104])
    setScouted([])
    setNegotiations([])
    setFixtureResults({})
    setDateIndex(0)
    setBudget(48500000)
    setSelectedPlayerId(nextProfile.mode === 'player' ? 900 : 9)
    setSimulationSpeed(1)
    setIsClockRunning(true)
    setSimMinute(9 * 60 + 30)
    setSimDay(11)
    previousMinuteRef.current = 9 * 60 + 30
    processedDayRef.current = 11
    setPlayerMatchPhase(null)
    setPlayerMatch(null)
    setTrainingProgress(42)
    setRivalryScore(48)
    setManagerTrust(74)
    setSimulationEvents([])
  }

  const resetCareer = () => {
    window.localStorage.removeItem(SAVE_KEY)
    window.localStorage.removeItem(PROFILE_KEY)
    setSavedAt(null)
    setSaveStatus('saved')
    setProfile(null)
    setActiveView('hub')
    setPlayers(initialPlayers)
    setShortlist([101, 104])
    setScouted([])
    setNegotiations([])
    setFixtureResults({})
    setDateIndex(0)
    setBudget(48500000)
    setSelectedPlayerId(9)
    setSimulationSpeed(1)
    setIsClockRunning(true)
    setSimMinute(9 * 60 + 30)
    setSimDay(11)
    previousMinuteRef.current = 9 * 60 + 30
    processedDayRef.current = 11
    setPlayerMatchPhase(null)
    setPlayerMatch(null)
    setTrainingProgress(42)
    setRivalryScore(48)
    setManagerTrust(74)
    setSimulationEvents([])
  }

  const showToast = (message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 3200)
  }

  const beginPlayerMatch = () => {
    if (!playerMatch) return
    setPlayerMatch((current) => current ? { ...current, minute: 1, lastEvent: 'You take your position. The opening phase is yours to read.' } : current)
    setPlayerMatchPhase('live')
  }

  const choosePlayerMatchAction = (action: 'attack' | 'compose' | 'conserve' | 'press' | 'hold' | 'risk' | 'encourage' | 'humble') => {
    if (!playerMatch) return
    const isPositive = action === 'attack' || action === 'press' || action === 'encourage'
    const ratingGain = action === 'encourage' ? 0.2 : isPositive ? 0.25 : action === 'conserve' || action === 'hold' ? 0.12 : 0.18
    const event = action === 'attack' ? 'You drive into space and force the back line deeper.' : action === 'press' ? 'Your pressure wins a dangerous second ball.' : action === 'risk' ? 'You attempt the ambitious pass. The crowd rises.' : action === 'encourage' ? 'You take responsibility in the interview.' : action === 'humble' ? 'You credit the team and leave the spotlight to the group.' : 'You keep the game simple and stay available.'
    const nextMatch: PlayerMatch = { ...playerMatch, rating: Math.min(10, Number((playerMatch.rating + ratingGain).toFixed(1))), passes: playerMatch.passes + (action === 'compose' || action === 'hold' ? 6 : 2), goals: playerMatch.goals + (action === 'risk' && playerMatch.minute >= 45 ? 1 : 0), teamGoals: playerMatch.teamGoals + (action === 'attack' && playerMatch.minute >= 45 ? 1 : 0), stamina: Math.max(54, playerMatch.stamina - (isPositive ? 10 : 5)), choices: [...playerMatch.choices, action], lastEvent: event }
    if (playerMatchPhase === 'interview') {
      finishPlayerMatch(nextMatch)
      return
    }
    setPlayerMatch(nextMatch)
    if (playerMatchPhase === 'pre') setPlayerMatchPhase('live')
    // Keep the user in the half-time decision state until they explicitly start the second half.
  }

  const advancePlayerMatch = () => {
    if (!playerMatch) return
    if (playerMatchPhase === 'pre') return beginPlayerMatch()
    if (playerMatchPhase === 'live') {
      setPlayerMatch((current) => current ? { ...current, minute: 45, lastEvent: 'Half-time. The manager wants one clear adjustment from you.' } : current)
      setPlayerMatchPhase('halftime')
    } else if (playerMatchPhase === 'halftime') {
      setPlayerMatch((current) => current ? { ...current, minute: 90, teamGoals: Math.max(current.teamGoals, current.goals + 1), lastEvent: 'Full-time. The stadium gives you the final word.' } : current)
      setPlayerMatchPhase('fulltime')
    } else if (playerMatchPhase === 'fulltime') {
      setPlayerMatchPhase('interview')
    }
  }

  const finishPlayerMatch = (finalMatch: PlayerMatch) => {
    const result = `${finalMatch.teamGoals}–${finalMatch.opponentGoals}`
    setPlayers((current) => current.map((item) => item.id === 900 ? { ...item, rating: Math.min(item.potential, item.rating + (finalMatch.rating >= 7.5 ? 1 : 0)), form: Math.min(99, Math.max(55, item.form + (finalMatch.rating >= 7 ? 3 : -1))), fitness: Math.max(48, item.fitness - (100 - finalMatch.stamina) / 2), morale: Math.min(99, item.morale + (finalMatch.rating >= 7 ? 3 : 0)) } : item))
    setRivalryScore((current) => Math.max(0, Math.min(100, current + (finalMatch.rating >= 7 ? 8 : -3))))
    setManagerTrust((current) => Math.max(0, Math.min(100, current + (finalMatch.rating >= 7 ? 4 : -2) + (finalMatch.choices.includes('encourage') ? 2 : 0))))
    setFixtureResults((current) => ({ ...current, [dateIndex]: result }))
    setDateIndex((current) => Math.min(current + 1, fixtures.length - 1))
    setSimulationEvents((current) => [{ id: Date.now(), label: 'Matchday report', detail: `${profile?.name} rated ${finalMatch.rating.toFixed(1)} in a ${result} result against ${finalMatch.opponent}.` }, ...current].slice(0, 8))
    setPlayerMatch(null)
    setPlayerMatchPhase(null)
    setIsClockRunning(true)
    showToast(`Matchday complete · performance ${finalMatch.rating.toFixed(1)}`)
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

  if (!profile) return <SetupView onComplete={startCareer} />

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
          <span className="nav-label">{careerMode === 'player' ? 'PLAYER DESK' : 'MANAGER DESK'}</span>
          {visibleNavItems.map((item) => (
            <button key={item.id} aria-label={item.label} title={item.label} className={`nav-item ${activeView === item.id ? 'active' : ''}`} onClick={() => setActiveView(item.id)}>
              <Icon>{item.icon}</Icon><span>{item.label}</span>{item.id === 'market' && <em>2</em>}
            </button>
          ))}
          <span className="nav-label secondary-label">{careerMode === 'player' ? 'CAREER OPERATIONS' : 'CLUB OPERATIONS'}</span>
          <button className="nav-item" onClick={() => { setActiveView('club'); showToast('Club operations synced') }}><Icon>▦</Icon><span>Finance</span></button>
          <button className="nav-item" onClick={() => openModal('Settings')}><Icon>⚙</Icon><span>Settings</span></button>
          <button className="nav-item" onClick={resetCareer}><Icon>＋</Icon><span>New career</span></button>
        </nav>

        <div className="sidebar-bottom">
          <div className="assistant-card">
            <div className="assistant-avatar">MC</div>
            <div><b>Maya Chen</b><span>Head of recruitment</span></div>
            <Icon>⋯</Icon>
          </div>
          <div className={`save-state save-${saveStatus}`}><span className="status-dot" /> {saveStatus === 'saving' ? 'Saving offline…' : saveStatus === 'error' ? 'Save unavailable' : 'Saved offline'} <span>{formatSavedTime(savedAt)}</span></div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="mobile-brand"><div className="brand-mark">N<span>+</span></div><b>NORTHSTAR</b></div>
          <div className="breadcrumbs"><span>{careerMode === 'player' ? 'PLAYER CAREER' : 'MANAGER CAREER'}</span><Icon>›</Icon><b>{visibleNavItems.find((item) => item.id === activeView)?.label.toUpperCase()}</b></div>
          <div className="top-actions">
            <button className="save-game-button" onClick={() => showToast(saveCareer() ? 'Career saved offline' : 'Offline save failed')}><Icon>⌁</Icon> Save game</button>
            {careerMode === 'player' && playerMatchPhase && <button className="matchday-alert" aria-label="Return to live matchday" title="Return to live matchday" onClick={() => setActiveView('player')}><span className="matchday-alert-dot" /> Matchday live <Icon>→</Icon></button>}
            <div className="clock-control" aria-label="Simulation speed"><span className={`clock-state ${isClockRunning ? 'running' : 'paused'}`}><i />{isClockRunning ? clockLabel : 'PAUSED'}</span><div className="speed-options"><button aria-label="Pause simulation" title="Pause simulation" className={simulationSpeed === 0 ? 'active' : ''} onClick={() => { setSimulationSpeed(0); setIsClockRunning(false) }}>Ⅱ</button><button aria-label="Run simulation at 1x" title="Run at 1x" className={simulationSpeed === 1 && isClockRunning ? 'active' : ''} onClick={() => { setSimulationSpeed(1); setIsClockRunning(true) }}>1×</button><button aria-label="Run simulation at 2x" title="Run at 2x" className={simulationSpeed === 2 ? 'active' : ''} onClick={() => { setSimulationSpeed(2); setIsClockRunning(true) }}>2×</button><button aria-label="Run simulation at 20x" title="Run at 20x" className={simulationSpeed === 20 ? 'active' : ''} onClick={() => { setSimulationSpeed(20); setIsClockRunning(true) }}>20×</button></div></div>
            <button className="icon-button notification-button" aria-label="Notifications" onClick={() => setShowNotifications(!showNotifications)}><Icon>♢</Icon><i>3</i></button>
            <div className="top-divider" />
            <div className="manager-mini"><div className="manager-avatar" style={{ background: profile.primaryColor }}>{profile.name.split(' ').map((part) => part[0]).join('').slice(0, 2) || 'JP'}</div><div><b>{profile.name}</b><span>{careerMode === 'player' ? 'Player career' : 'Manager'}</span></div><Icon>⌄</Icon></div>
          </div>
          {showNotifications && <div className="notification-popover"><div className="popover-heading"><b>Inbox</b><small>3 unread</small></div><div className="notification-item"><span className="notification-icon amber">!</span><div><b>Board review due</b><p>Share a progress update before next fixture.</p></div></div><div className="notification-item"><span className="notification-icon blue">↗</span><div><b>Scout report ready</b><p>Naila Bouchard matches your midfield brief.</p></div></div><button onClick={() => setShowNotifications(false)}>Mark all as read</button></div>}
        </header>

        <div className="page-wrap">
          {activeView === 'hub' && (careerMode === 'player' ? <PlayerHubView profile={profile} player={selectedPlayer} clockLabel={clockLabel} simDay={simDay} playerMatchPhase={playerMatchPhase} playerMatch={playerMatch} trainingProgress={trainingProgress} rivalryScore={rivalryScore} managerTrust={managerTrust} simulationEvents={simulationEvents} onAdvanceMatch={advancePlayerMatch} onMatchAction={choosePlayerMatchAction} openModal={openModal} setActiveView={setActiveView} /> : <HubView profile={profile} budget={budget} dateIndex={dateIndex} fixtureResults={fixtureResults} continueWeek={continueWeek} openModal={openModal} setActiveView={setActiveView} />)}
          {activeView === 'player' && <PlayerHubView profile={profile} player={selectedPlayer} clockLabel={clockLabel} simDay={simDay} playerMatchPhase={playerMatchPhase} playerMatch={playerMatch} trainingProgress={trainingProgress} rivalryScore={rivalryScore} managerTrust={managerTrust} simulationEvents={simulationEvents} onAdvanceMatch={advancePlayerMatch} onMatchAction={choosePlayerMatchAction} openModal={openModal} setActiveView={setActiveView} />}
          {activeView === 'squad' && <SquadView players={players} selectedPlayer={selectedPlayer} setSelectedPlayerId={setSelectedPlayerId} openModal={openModal} />}
          {activeView === 'market' && <MarketView filteredProspects={filteredProspects} search={search} setSearch={setSearch} marketFilter={marketFilter} setMarketFilter={setMarketFilter} shortlist={shortlist} scouted={scouted} negotiations={negotiations} toggleShortlist={toggleShortlist} scoutProspect={scoutProspect} startNegotiation={startNegotiation} budget={budget} openModal={openModal} />}
          {activeView === 'academy' && <AcademyView openModal={openModal} setActiveView={setActiveView} />}
          {activeView === 'club' && (careerMode === 'player' ? <PlayerClubView profile={profile} player={selectedPlayer} openModal={openModal} /> : <ClubView budget={budget} requestInvestment={requestInvestment} openModal={openModal} />)}
        </div>
      </main>

      <nav className="mobile-nav" aria-label="Mobile navigation">
        {visibleNavItems.map((item) => <button key={item.id} aria-label={item.label} className={activeView === item.id ? 'active' : ''} onClick={() => setActiveView(item.id)}><Icon>{item.icon}</Icon><span>{item.label}</span>{item.id === 'market' && <em>2</em>}</button>)}
      </nav>

      {toast && <div className="toast"><span className="toast-check">✓</span>{toast}</div>}
      {isModalOpen && <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}><div className="modal" onClick={(event) => event.stopPropagation()}><button className="modal-close" aria-label="Close dialog" onClick={() => setIsModalOpen(false)}>×</button><span className="section-kicker">NORTHSTAR DESK</span><h2>{modalTitle}</h2><p>{pendingInvestment ? 'The board will review a €2.5M capital request for your transfer runway. Confirm to apply the investment to club finances.' : 'This management action is ready for your next decision. The prototype keeps your career state local so you can explore every system without losing your session.'}</p><div className="modal-choices"><button className="primary-button" onClick={() => { if (pendingInvestment) { setBudget((current) => current + 2500000); setPendingInvestment(false); showToast('Board investment approved · €2.5M added') } else { showToast(`${modalTitle} confirmed`) } setIsModalOpen(false) }}>Confirm action <Icon>→</Icon></button><button className="ghost-button" onClick={() => setIsModalOpen(false)}>Cancel</button></div></div></div>}
    </div>
  )
}

function SetupView({ onComplete }: { onComplete: (profile: CareerProfile) => void }) {
  const [mode, setMode] = useState<CareerMode>('manager')
  const [name, setName] = useState('Jules Park')
  const [clubName, setClubName] = useState('Northstar FC')
  const [clubShort, setClubShort] = useState('NFC')
  const [league, setLeague] = useState('Premier Division')
  const [primaryColor, setPrimaryColor] = useState('#b5ef76')
  const [secondaryColor, setSecondaryColor] = useState('#8c7bff')
  const [difficulty, setDifficulty] = useState('Authentic')
  const [playerPosition, setPlayerPosition] = useState<Position>('AM')

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onComplete({ mode, name: name.trim() || 'Jules Park', clubName: clubName.trim() || 'Northstar FC', clubShort: clubShort.trim().slice(0, 4).toUpperCase() || 'NFC', league, primaryColor, secondaryColor, difficulty, playerPosition })
  }

  return <div className="setup-shell"><div className="setup-orbit setup-orbit-one" /><div className="setup-orbit setup-orbit-two" /><header className="setup-brand"><div className="brand-mark">N<span>+</span></div><div><b>NORTHSTAR</b><small>CAREER MODE</small></div></header><main className="setup-card"><div className="setup-intro"><span className="live-pill"><i /> NEW CAREER</span><span className="section-kicker">SEASON 01 · THE FIRST DECISION</span><h1>Where does your<br /><em>story begin?</em></h1><p>Choose your path, shape your identity, and build a career that belongs to you.</p></div><form onSubmit={submit}><div className="mode-toggle"><button type="button" className={mode === 'manager' ? 'active' : ''} onClick={() => setMode('manager')}><span className="setup-option-icon">◈</span><span><b>Manager Career</b><small>Run the club. Shape the squad.</small></span><i>✓</i></button><button type="button" className={mode === 'player' ? 'active' : ''} onClick={() => setMode('player')}><span className="setup-option-icon">♙</span><span><b>Player Career</b><small>Become the name on the shirt.</small></span><i>✓</i></button></div><div className="setup-grid"><label className="setup-field"><span>{mode === 'manager' ? 'MANAGER NAME' : 'PLAYER NAME'}</span><input value={name} onChange={(event) => setName(event.target.value)} placeholder={mode === 'manager' ? 'Your manager name' : 'Your player name'} maxLength={28} /></label><label className="setup-field"><span>CLUB NAME</span><input value={clubName} onChange={(event) => setClubName(event.target.value)} placeholder="Create your club" maxLength={24} /></label><label className="setup-field"><span>CLUB SHORTCODE</span><input value={clubShort} onChange={(event) => setClubShort(event.target.value.toUpperCase())} placeholder="NFC" maxLength={4} /></label><label className="setup-field"><span>LEAGUE</span><select value={league} onChange={(event) => setLeague(event.target.value)}><option>Premier Division</option><option>Continental League</option><option>Coastal Championship</option><option>Alpine League</option></select></label>{mode === 'player' && <label className="setup-field"><span>STARTING POSITION</span><select value={playerPosition} onChange={(event) => setPlayerPosition(event.target.value as Position)}>{(['GK', 'CB', 'LB', 'RB', 'DM', 'CM', 'AM', 'LW', 'RW', 'ST'] as Position[]).map((position) => <option key={position}>{position}</option>)}</select></label>}<label className="setup-field"><span>CAREER DIFFICULTY</span><select value={difficulty} onChange={(event) => setDifficulty(event.target.value)}><option>Authentic</option><option>Competitive</option><option>Story driven</option></select></label></div><div className="club-customizer"><div><span className="setup-field-label">CLUB IDENTITY</span><small>Choose the colours your supporters will wear.</small></div><div className="color-picks"><label><input type="color" value={primaryColor} onChange={(event) => setPrimaryColor(event.target.value)} /><span style={{ background: primaryColor }} /></label><label><input type="color" value={secondaryColor} onChange={(event) => setSecondaryColor(event.target.value)} /><span style={{ background: secondaryColor }} /></label><div className="kit-preview" style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}><b>{clubShort.slice(0, 4) || 'NFC'}</b></div></div></div><button className="primary-button setup-submit" type="submit">Begin {mode === 'manager' ? 'manager' : 'player'} career <Icon>→</Icon></button></form><div className="setup-footer"><span>All career data is saved locally in this browser.</span><span>Fictional football universe · Northstar 04</span></div></main></div>
}

function PlayerHubView({ profile, player, clockLabel, simDay, playerMatchPhase, playerMatch, trainingProgress, rivalryScore, managerTrust, simulationEvents, onAdvanceMatch, onMatchAction, openModal, setActiveView }: { profile: CareerProfile; player: Player; clockLabel: string; simDay: number; playerMatchPhase: MatchPhase | null; playerMatch: PlayerMatch | null; trainingProgress: number; rivalryScore: number; managerTrust: number; simulationEvents: SimulationEvent[]; onAdvanceMatch: () => void; onMatchAction: (action: 'attack' | 'compose' | 'conserve' | 'press' | 'hold' | 'risk' | 'encourage' | 'humble') => void; openModal: (title: string) => void; setActiveView: (view: View) => void }) {
  return <><PageHeader eyebrow={`PLAYER CAREER · AUG ${simDay}, 2026 · ${profile.league.toUpperCase()}`} title="Make them remember your name." description={`${profile.name} is entering a defining week at ${profile.clubName}. Every session, conversation, and appearance moves the story forward.`} action={<button className="primary-button continue-button" onClick={() => openModal('Next match preparation')}><span className="pulse-ring" />Matchday focus <Icon>→</Icon></button>} /><div className="player-hero-grid"><section className="player-hero panel"><div className="player-hero-bg" /><div className="player-hero-content"><div className="hero-topline"><span className="live-pill"><i /> PLAYER CAREER</span><span className="muted-text">{profile.clubName.toUpperCase()} · {profile.playerPosition}</span></div><h2>The next<br /><em>chapter is yours.</em></h2><p>Earn your place, build your reputation, and turn one good season into a career.</p><div className="player-hero-actions"><button className="light-button" onClick={() => openModal('Training plan')}>Train today <Icon>→</Icon></button><button className="hero-text-button" onClick={() => openModal('Player social feed')}>Open social feed <Icon>↗</Icon></button></div></div><div className="player-hero-rating"><span>OVR</span><strong>{player.rating}</strong><small>+2 this season</small></div></section><MatchdayPanel profile={profile} phase={playerMatchPhase} match={playerMatch} clockLabel={clockLabel} simDay={simDay} onAdvance={onAdvanceMatch} onAction={onMatchAction} openModal={openModal} /></div><div className="player-metric-row"><Metric label="PLAYER RATING" value={String(player.rating)} trend="+2 this season" icon="✦" accent="purple" /><Metric label="MATCH FITNESS" value={`${player.fitness}%`} trend="Peak readiness" icon="⌁" accent="cyan" /><Metric label="MANAGER TRUST" value={`${managerTrust}%`} trend="Live relationship" icon="◎" accent="lime" /><Metric label="RIVALRY" value={`${rivalryScore}`} trend="Competitive edge" icon="⚡" accent="amber" /></div><div className="player-lower-grid"><section className="panel player-progress-panel"><div className="panel-heading"><div><span className="section-kicker">PERSONAL DEVELOPMENT</span><h3>Build the complete player</h3></div><button className="text-link" onClick={() => openModal('Full development plan')}>View plan <Icon>→</Icon></button></div><div className="player-progress-profile"><div className="player-profile-avatar" style={{ background: `linear-gradient(135deg, ${profile.primaryColor}, ${profile.secondaryColor})` }}>{profile.name.split(' ').map((part) => part[0]).join('').slice(0, 2)}</div><div><b>{profile.name}</b><span>{profile.playerPosition} · {profile.clubName}</span><div className="tag-row"><span>Playmaker</span><span>Early breakthrough</span></div></div><strong>{player.potential}<small>POTENTIAL</small></strong></div><div className="development-list"><DynamicBar label="Technical" value={72} color="purple" /><DynamicBar label="Physical" value={64} color="cyan" /><DynamicBar label="Mental" value={78} color="lime" /></div><div className="training-progress-label"><span>Next training milestone</span><b>{trainingProgress}%</b></div><div className="training-progress-track"><i style={{ width: `${trainingProgress}%` }} /></div></section><section className="panel player-briefing"><div className="panel-heading"><div><span className="section-kicker">CAREER MOMENTS</span><h3>This week</h3></div><button className="more-button">•••</button></div><div className="brief-item"><div className="brief-icon purple">♙</div><div><b>Training objective</b><p>Complete 2 finishing sessions</p></div><span className="brief-time">2 / 3</span></div><div className="brief-item"><div className="brief-icon amber">⚡</div><div><b>Rivalry with Rayan Kessler</b><p>Beat his rating in next 5 matches</p></div><span className="brief-time">01–00</span></div><div className="brief-item"><div className="brief-icon cyan">✦</div><div><b>Manager conversation</b><p>Discuss your first-team role</p></div><span className="brief-time">NEW</span></div>{simulationEvents.slice(0, 2).map((event) => <div className="brief-item" key={event.id}><div className="brief-icon purple">◷</div><div><b>{event.label}</b><p>{event.detail}</p></div><span className="brief-time">LIVE</span></div>)}<button className="text-link" onClick={() => setActiveView('squad')}>See club team <Icon>→</Icon></button></section></div></>
}

function MatchdayPanel({ profile, phase, match, clockLabel, simDay, onAdvance, onAction, openModal }: { profile: CareerProfile; phase: MatchPhase | null; match: PlayerMatch | null; clockLabel: string; simDay: number; onAdvance: () => void; onAction: (action: 'attack' | 'compose' | 'conserve' | 'press' | 'hold' | 'risk' | 'encourage' | 'humble') => void; openModal: (title: string) => void }) {
  const phaseLabel = phase === 'pre' ? 'TEAM TALK' : phase === 'live' ? 'LIVE MATCH' : phase === 'halftime' ? 'HALF-TIME' : phase === 'fulltime' ? 'FULL-TIME' : phase === 'interview' ? 'POST-MATCH' : 'NEXT APPEARANCE'
  const advanceLabel = phase === 'pre' ? 'Enter match' : phase === 'live' ? 'Play to half-time' : phase === 'halftime' ? 'Play second half' : phase === 'fulltime' ? 'Go to interview' : 'Finish report'
  return <section className={`panel player-next-match matchday-panel ${phase ? 'matchday-active' : ''}`}><div className="panel-heading"><span className="section-kicker">{phaseLabel}</span><span className="clock-mini">{phase ? `${match?.minute ?? 0}'` : clockLabel}</span></div>{!phase && <><div className="match-date">SAT, AUG {simDay + 5} <span>· IN 5 DAYS</span></div><div className="player-matchup"><div className="club-crest" style={{ background: profile.primaryColor, color: '#172219' }}>{profile.clubShort}</div><div className="versus-copy"><strong>VS</strong><span>LEAGUE FIXTURE</span></div><div className="opponent-crest" style={{ background: '#e96a59' }}>RU</div></div><div className="match-names"><b>{profile.clubName}</b><b>Redhaven United</b></div><div className="match-location"><Icon>⌖</Icon> Riverside Ground · Away<span className="difficulty medium">MEDIUM TEST</span></div><button className="outline-button full-button" onClick={() => openModal('Matchday role')}>View expected role <Icon>→</Icon></button></>}{phase && match && <><div className="match-scoreboard"><div><span>{profile.clubShort}</span><strong>{match.teamGoals}</strong></div><div className="score-divider">—</div><div><span>{match.opponentShort}</span><strong>{match.opponentGoals}</strong></div></div><div className="matchday-status"><span>PERFORMANCE <b>{match.rating.toFixed(1)}</b></span><span>STAMINA <b>{Math.round(match.stamina)}%</b></span><span>PASSING <b>{match.passes}</b></span></div><p className="matchday-event">{match.lastEvent}</p>{(phase === 'pre' || phase === 'halftime') && <div className="match-choice-grid"><button className="match-choice" onClick={() => onAction('attack')}><b>{phase === 'pre' ? 'Attack the space' : 'Raise the tempo'}</b><small>Positive impact · higher stamina cost</small></button><button className="match-choice" onClick={() => onAction('compose')}><b>Control the game</b><small>Build rhythm · safe performance gain</small></button></div>}{phase === 'live' && <div className="match-choice-grid"><button className="match-choice" onClick={() => onAction('press')}><b>Press the next trigger</b><small>Win the duel and lift the rating</small></button><button className="match-choice" onClick={() => onAction('hold')}><b>Hold your shape</b><small>Protect stamina and stay available</small></button></div>}{phase === 'fulltime' && <div className="match-choice-grid"><button className="match-choice" onClick={() => onAction('risk')}><b>Talk about the big moment</b><small>Own the spotlight after full-time</small></button><button className="match-choice" onClick={() => onAction('humble')}><b>Credit the team</b><small>Build trust with the dressing room</small></button></div>}{phase === 'interview' && <div className="match-choice-grid"><button className="match-choice" onClick={() => onAction('encourage')}><b>Back your teammates</b><small>Build manager trust and dressing-room respect</small></button><button className="match-choice" onClick={() => onAction('humble')}><b>Keep it about the group</b><small>Protect morale and stay grounded</small></button></div>}{phase !== 'interview' && <button className="primary-button full-button" onClick={onAdvance}>{advanceLabel} <Icon>→</Icon></button>}</>}</section>
}

function PageHeader({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: ReactNode }) {
  return <div className="page-header"><div><span className="section-kicker">{eyebrow}</span><h1>{title}</h1><p>{description}</p></div>{action}</div>
}

function HubView({ profile, budget, dateIndex, fixtureResults, continueWeek, openModal, setActiveView }: { profile: CareerProfile; budget: number; dateIndex: number; fixtureResults: Record<number, string>; continueWeek: () => void; openModal: (title: string) => void; setActiveView: (view: View) => void }) {
  const fixture = fixtures[dateIndex]
  const currentResult = fixtureResults[dateIndex]
  return <>
    <PageHeader eyebrow={`MONDAY · AUGUST ${String(10 + dateIndex).padStart(2, '0')}, 2026 · ${profile.league.toUpperCase()}`} title="The climb starts here." description={`A new week, a clean slate, and one clear objective: make ${profile.clubName} impossible to ignore.`} action={<button className="primary-button continue-button" onClick={continueWeek}><span className="pulse-ring" />Continue week <Icon>→</Icon></button>} />
    <div className="hero-grid">
      <section className="club-hero panel">
        <div className="hero-glow" />
        <div className="hero-content"><div className="hero-topline"><span className="live-pill"><i /> LIVE CAREER</span><span className="muted-text">RANKED #07 · {profile.league.toUpperCase()}</span></div><h2>Build something<br /><em>unforgettable.</em></h2><p>Three points from a continental place. Your squad believes. The city is watching.</p><div className="hero-actions"><button className="light-button" onClick={() => setActiveView('squad')}>Set lineup <Icon>→</Icon></button><button className="hero-text-button" onClick={() => openModal('Match preview')}>View match preview <Icon>↗</Icon></button></div></div>
        <div className="hero-stats"><div><span>FORM</span><b>W W D W</b></div><div><span>BOARD CONFIDENCE</span><b className="lime-text">8.6 <small>/ 10</small></b></div><div><span>CLUB VALUE</span><b>€184.2M</b></div></div>
      </section>
      <section className="next-match panel"><div className="panel-heading"><span className="section-kicker">UP NEXT</span><button className="more-button" onClick={() => openModal('Fixture list')}>•••</button></div><div className="match-date">{fixture.date} <span>· {currentResult ? `FINAL ${currentResult}` : `IN ${dateIndex === 0 ? '5' : '12'} DAYS`}</span></div><div className="versus"><div className="club-crest northstar-crest">N<span>+</span></div><div className="versus-copy"><strong>VS</strong><span>PREMIER DIVISION</span></div><div className="opponent-crest" style={{ background: fixture.crest }}>{fixture.short}</div></div><div className="match-names"><b>{profile.clubName}</b><b>{fixture.opponent}</b></div><div className="match-location"><Icon>⌖</Icon>{fixture.home ? `${profile.clubName} Stadium · Home` : 'Riverside Ground · Away'}<span className={`difficulty ${fixture.difficulty.toLowerCase()}`}>{fixture.difficulty} test</span></div><button className="outline-button full-button" onClick={() => openModal(currentResult ? 'Match report' : 'Match preparation')}>{currentResult ? 'Review match report' : 'Prepare for match'} <Icon>→</Icon></button></section>
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

function PlayerClubView({ profile, player, openModal }: { profile: CareerProfile; player: Player; openModal: (title: string) => void }) {
  return <><PageHeader eyebrow="PLAYER CAREER · CLUB LIFE" title="Your career is more than matchday." description={`Build trust at ${profile.clubName}, understand your role, and make the decisions that shape your next contract.`} action={<button className="outline-button" onClick={() => openModal('Contract conversation')}><Icon>◎</Icon> Contract talk</button>} /><div className="player-club-grid"><section className="panel contract-card"><div className="panel-heading"><div><span className="section-kicker">YOUR DEAL</span><h3>Make the next move count.</h3></div><span className="finance-health">SECURE</span></div><div className="contract-player"><div className="player-profile-avatar" style={{ background: `linear-gradient(135deg, ${profile.primaryColor}, ${profile.secondaryColor})` }}>{profile.name.split(' ').map((part) => part[0]).join('').slice(0, 2)}</div><div><b>{profile.name}</b><small>{profile.playerPosition} · {profile.clubName}</small></div><strong>{formatMoney(player.wage)}<small>PER WEEK</small></strong></div><div className="contract-grid"><div><span>CONTRACT</span><b>4 years</b></div><div><span>ROLE</span><b>Rotation</b></div><div><span>RELEASE VALUE</span><b>{formatMoney(player.value)}</b></div><div><span>MANAGER TRUST</span><b className="lime-text">74%</b></div></div><button className="primary-button full-button" onClick={() => openModal('Contract conversation')}>Discuss your role <Icon>→</Icon></button></section><section className="panel relationships-card"><div className="panel-heading"><div><span className="section-kicker">DRESSING ROOM</span><h3>People who shape your season</h3></div></div><div className="relationship-row"><div className="relationship-avatar" style={{ background: '#f07f5e' }}>NB</div><div><b>Nico Bellori</b><small>Training partner · CM</small></div><span className="relationship-score positive">86</span></div><div className="relationship-row"><div className="relationship-avatar" style={{ background: '#8a7dff' }}>RK</div><div><b>Rayan Kessler</b><small>Rival · CB</small></div><span className="relationship-score rival">63</span></div><div className="relationship-row"><div className="relationship-avatar" style={{ background: '#e8b74c' }}>LS</div><div><b>Lio Santoro</b><small>Senior mentor · AM</small></div><span className="relationship-score positive">79</span></div><button className="text-link" onClick={() => openModal('Social choices')}>Open social choices <Icon>→</Icon></button></section><section className="panel club-standing-card"><span className="section-kicker">CLUB STANDING</span><h2>{profile.clubName}</h2><p>You are currently competing for a place in the matchday squad. Your next objective is simple: complete 3 strong training sessions before selection.</p><div className="standing-track"><i style={{ width: '68%' }} /></div><div className="standing-footer"><span>ROTATION PLAYER</span><b>68% to first-team lock</b></div></section></div></>
}

function ClubView({ budget, requestInvestment, openModal }: { budget: number; requestInvestment: () => void; openModal: (title: string) => void }) {
  return <><PageHeader eyebrow="CLUB VISION · 2026—2030" title="Make the badge mean more." description="A club is bigger than matchday. Build the culture, protect the runway, and leave a legacy." action={<button className="outline-button" onClick={() => openModal('Club roadmap')}><Icon>▦</Icon> Roadmap</button>} /><div className="vision-grid"><section className="panel vision-card primary-vision"><div className="vision-number">01</div><span className="section-kicker">BOARD MANDATE</span><h2>Earn Europe.<br /><em>Keep your soul.</em></h2><p>Qualify for continental football while maintaining a youth-first recruitment philosophy. The board is backing the plan.</p><div className="objective-score"><div><span>BOARD CONFIDENCE</span><b>86%</b></div><div className="score-track"><i /></div><small>+12 since the start of the season</small></div></section><section className="panel finance-card"><div className="panel-heading"><div><span className="section-kicker">FINANCIAL CONTROL</span><h3>Every choice compounds.</h3></div><span className="finance-health">HEALTHY</span></div><div className="finance-total"><span>TRANSFER BALANCE</span><strong>{formatMoney(budget)}</strong><small>Updated after last window activity</small></div><div className="finance-bars"><FinanceBar label="Squad wages" value="€1.84M" percent={64} color="purple" /><FinanceBar label="Scouting network" value="€420K" percent={28} color="cyan" /><FinanceBar label="Facilities" value="€680K" percent={42} color="amber" /></div><button className="outline-button full-button" onClick={requestInvestment}>Request board investment <Icon>→</Icon></button></section><section className="panel values-card"><div className="panel-heading"><div><span className="section-kicker">CLUB DNA</span><h3>What we stand for</h3></div><button className="more-button">•••</button></div><div className="value-row"><span className="value-symbol purple">✦</span><div><b>Brave football</b><small>Possession with purpose</small></div><strong>92</strong></div><div className="value-row"><span className="value-symbol lime">♙</span><div><b>Grow our own</b><small>Academy pathway first</small></div><strong>87</strong></div><div className="value-row"><span className="value-symbol amber">◈</span><div><b>One city, one club</b><small>Community always</small></div><strong>95</strong></div></section></div></>
}

function FinanceBar({ label, value, percent, color }: { label: string; value: string; percent: number; color: string }) {
  return <div className="finance-bar"><div><span>{label}</span><b>{value}</b></div><div className="finance-track"><i className={color} style={{ width: `${percent}%` }} /></div></div>
}

export default App
