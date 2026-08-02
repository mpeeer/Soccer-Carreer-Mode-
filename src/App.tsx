import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties, FormEvent, ReactNode } from 'react'
import type { View, CareerMode, MatchPhase, Position, TransferApproach, PlayerSkills, TrainingSession, Player, Fixture, CareerProfile, ClubOffer, OnboardingSave, Prospect, PlayerMatch, ManagerMatch, SimulationEvent, SavedCareer, SavedCareerEnvelope, SaveStatus, TransferTab, Tactics } from './types'
import { SAVE_KEY, PROFILE_KEY, ONBOARDING_KEY, CURRENT_SAVE_VERSION, initialPlayers, seasonFixtures, prospects, trainingSessions, transferClubPool, navItems, playerNavItems, createClubOffers, seedDynamicRatings, defaultTactics } from './data'
import { backupLegacySaveIfNeeded, readSavedOnboarding, readSavedCareer, profileFromOffer, formatMoney, createCareerPlayer, Icon } from './utils'
import { TransferHub } from './views/transferHub'
import { PlayerProfile } from './views/playerProfile'
import { TeamManagement } from './views/teamManagement'
import { DynamicRatingsTicker } from './views/dynamicRatingsTicker'
import { TacticsView } from './views/tactics'
import { PageHeader } from './views/pageHeader'
import { PlayerHubView } from './views/hubViews'
import { MatchdayPanel } from './views/hubViews'
import { ManagerMatchdayPanel } from './views/hubViews'
import { HubView } from './views/hubViews'
import { Metric } from './views/hubViews'
import { SquadView } from './views/squadView'
import { PlayerDetail } from './views/squadView'
import { DynamicBar } from './views/squadView'
import { MarketView } from './views/marketView'
import { ProspectCard } from './views/marketView'
import { AcademyView } from './views/academyView'
import { YouthRow } from './views/academyView'
import { PlayerClubView } from './views/clubViews'
import { ClubView } from './views/clubViews'
import { FinanceBar } from './views/clubViews'
import { CalendarView } from './views/calendarView'
import { TransferApproachModal } from './views/transferViews'
import { TransferOffersView } from './views/transferViews'
import { ClubOffersView, IntroductionView, SetupView } from './views/setupViews'
import { LandingPage, DocsPage } from './views/landingViews'
import { TrainingView } from './views/trainingView'
function App() {
  const savedCareer = readSavedCareer()
  const savedOnboarding = readSavedOnboarding()
  const restoredOnboardingProfile = savedOnboarding?.acceptedOffer ? profileFromOffer(savedOnboarding, savedOnboarding.acceptedOffer) : null
  const restoredProfile = savedCareer?.profile ?? restoredOnboardingProfile
  const restoredOffer = savedCareer?.clubOffer ?? savedOnboarding?.acceptedOffer ?? null
  const [onboarding, setOnboarding] = useState<OnboardingSave | null>(() => savedCareer || savedOnboarding?.acceptedOffer ? null : savedOnboarding)
  const [profile, setProfile] = useState<CareerProfile | null>(restoredProfile)
  const [clubOffer, setClubOffer] = useState<ClubOffer | null>(restoredOffer)
  const [activeView, setActiveView] = useState<View>(savedCareer?.activeView ?? (restoredProfile?.mode === 'player' ? 'player' : 'hub'))
  const [players, setPlayers] = useState(() => {
    if (savedCareer?.players?.length) {
      if (savedCareer.profile.mode !== 'player') return savedCareer.players
      const careerPlayer = createCareerPlayer(savedCareer.profile, savedCareer.clubOffer)
      const hasCareerPlayer = savedCareer.players.some((player) => player.id === careerPlayer.id)
      return hasCareerPlayer
        ? savedCareer.players.map((player) => player.id === careerPlayer.id ? { ...player, name: careerPlayer.name, position: careerPlayer.position, initials: careerPlayer.initials, color: careerPlayer.color } : player)
        : [...savedCareer.players, careerPlayer]
    }
    return restoredProfile?.mode === 'player' ? [...initialPlayers, createCareerPlayer(restoredProfile, restoredOffer)] : initialPlayers
  })
  const [shortlist, setShortlist] = useState<number[]>(savedCareer?.shortlist ?? [101, 110, 107, 109, 102, 108, 104, 106, 105, 103, 111, 112])
  const [transferList, setTransferList] = useState<number[]>(savedCareer?.transferList ?? [])
  const [loanList, setLoanList] = useState<number[]>(savedCareer?.loanList ?? [])
  const [blockedList, setBlockedList] = useState<number[]>(savedCareer?.blockedList ?? [])
  const [dynamicRatings, setDynamicRatings] = useState<import('./types').DynamicRating[]>(savedCareer?.dynamicRatings ?? seedDynamicRatings)
  const [tactics, setTactics] = useState<Tactics>(defaultTactics)
  const [transferComments, setTransferComments] = useState<Record<number, { from: string; text: string; at: number }[]>>({})
  const [transferReports, setTransferReports] = useState<Record<number, { match: string; result: string; minutes: number; goals: number; assists: number; rating: number }[]>>({})
  const [scouted, setScouted] = useState<number[]>(savedCareer?.scouted ?? [])
  const [negotiations, setNegotiations] = useState<number[]>(savedCareer?.negotiations ?? [])
  const [fixtureResults, setFixtureResults] = useState<Record<number, string>>(savedCareer?.fixtureResults ?? {})
  const [dateIndex, setDateIndex] = useState(savedCareer?.dateIndex ?? 0)
  const [seasonNumber, setSeasonNumber] = useState(savedCareer?.seasonNumber ?? 1)
  const [weekNumber, setWeekNumber] = useState(savedCareer?.weekNumber ?? 1)
  const [budget, setBudget] = useState(savedCareer?.budget ?? 48500000)
  const [showNotifications, setShowNotifications] = useState(false)
  const [toast, setToast] = useState('')
  const [search, setSearch] = useState('')
  const [selectedPlayerId, setSelectedPlayerId] = useState(restoredProfile?.mode === 'player' ? 900 : savedCareer?.selectedPlayerId ?? 9)
  const [marketFilter, setMarketFilter] = useState<'All' | 'Shortlist' | 'Scouted'>('All')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalTitle, setModalTitle] = useState('')
  const [pendingInvestment, setPendingInvestment] = useState(false)
  const [simulationSpeed, setSimulationSpeed] = useState<0 | 1 | 2 | 20>(savedCareer?.simulationSpeed ?? 1)
  const [isClockRunning, setIsClockRunning] = useState(savedCareer?.isClockRunning ?? true)
  const [simMinute, setSimMinute] = useState(savedCareer?.simMinute ?? 8 * 60)
  const [simDay, setSimDay] = useState(savedCareer?.simDay ?? 1)
  const [playerMatchPhase, setPlayerMatchPhase] = useState<MatchPhase | null>(savedCareer?.playerMatchPhase ?? null)
  const [playerMatch, setPlayerMatch] = useState<PlayerMatch | null>(savedCareer?.playerMatch ?? null)
  const [matchActionTimer, setMatchActionTimer] = useState(0)
  const [managerMatch, setManagerMatch] = useState<ManagerMatch | null>(null)
  const [trainingProgress, setTrainingProgress] = useState(savedCareer?.trainingProgress ?? 42)
  const [rivalryScore, setRivalryScore] = useState(savedCareer?.rivalryScore ?? 48)
  const [managerTrust, setManagerTrust] = useState(savedCareer?.managerTrust ?? 74)
  const [simulationEvents, setSimulationEvents] = useState<SimulationEvent[]>(savedCareer?.simulationEvents ?? [])
  const [introComplete, setIntroComplete] = useState(savedCareer?.introComplete ?? (restoredOnboardingProfile ? false : true))
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved')
  const [savedAt, setSavedAt] = useState<number | null>(savedCareer?.savedAt ?? null)
  const [transferApproaches, setTransferApproaches] = useState<TransferApproach[]>(() => {
    try {
      const raw = window.localStorage.getItem('northstar-transfers')
      if (!raw) return []
      const parsed = JSON.parse(raw) as TransferApproach[]
      return Array.isArray(parsed) && parsed.every((a) => typeof a?.id === 'string') ? parsed : []
    } catch { return [] }
  })
  const [showTransferModal, setShowTransferModal] = useState(false)
  const [activeTransferApproach, setActiveTransferApproach] = useState<TransferApproach | null>(null)
  const [trainingEnergy, setTrainingEnergy] = useState(savedCareer?.trainingEnergy ?? 100)
  const [lastTrainingDay, setLastTrainingDay] = useState(savedCareer?.lastTrainingDay ?? 0)
  const processedDayRef = useRef(savedCareer?.simDay ?? 1)
  const previousMinuteRef = useRef(savedCareer?.simMinute ?? 8 * 60)
  const careerMode = profile?.mode ?? 'manager'
  const [pageMode, setPageMode] = useState<'landing' | 'docs' | 'game'>('landing')
  const visibleNavItems = careerMode === 'player' ? playerNavItems : navItems

  useEffect(() => {
    backupLegacySaveIfNeeded()
  }, [])

  const selectedPlayer = players.find((player) => player.id === selectedPlayerId) ?? players[0]
  const filteredProspects = useMemo(() => prospects.filter((prospect) => {
    const matchesSearch = prospect.name.toLowerCase().includes(search.toLowerCase()) || prospect.position.toLowerCase().includes(search.toLowerCase()) || prospect.club.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = marketFilter === 'All' || (marketFilter === 'Shortlist' ? shortlist.includes(prospect.id) : scouted.includes(prospect.id))
    return matchesSearch && matchesFilter
  }), [marketFilter, search, shortlist, scouted])

  const saveCareer = useCallback(() => {
    if (!profile) return false
    const nextSavedAt = Date.now()
    const career: SavedCareer = { profile, clubOffer, introComplete, seasonNumber, weekNumber, activeView, players, shortlist, scouted, negotiations, transferList, loanList, blockedList, fixtureResults, dateIndex, budget, selectedPlayerId, simulationSpeed, isClockRunning, simMinute, simDay, playerMatchPhase, playerMatch, trainingProgress, trainingEnergy, lastTrainingDay, rivalryScore, managerTrust, simulationEvents, dynamicRatings, tactics: defaultTactics, transferComments: {}, transferReports: {} }
    try { window.localStorage.setItem('northstar-transfers', JSON.stringify(transferApproaches)) } catch { /* non-critical */ }
    const envelope: SavedCareerEnvelope = { version: CURRENT_SAVE_VERSION, savedAt: nextSavedAt, career }
    try {
      window.localStorage.setItem(SAVE_KEY, JSON.stringify(envelope))
      window.localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
      window.localStorage.removeItem(ONBOARDING_KEY)
      setSavedAt(nextSavedAt)
      setSaveStatus('saved')
      return true
    } catch {
      setSaveStatus('error')
      return false
    }
  }, [profile, clubOffer, introComplete, seasonNumber, weekNumber, activeView, players, shortlist, scouted, negotiations, transferList, loanList, blockedList, fixtureResults, dateIndex, budget, selectedPlayerId, simulationSpeed, isClockRunning, simMinute, simDay, playerMatchPhase, playerMatch, trainingProgress, trainingEnergy, lastTrainingDay, rivalryScore, managerTrust, simulationEvents, dynamicRatings, tactics])

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

  // Auto-advance match clock during live play
  useEffect(() => {
    if (playerMatchPhase !== 'live' || !playerMatch || simulationSpeed === 0) return
    const tick = window.setInterval(() => {
      setPlayerMatch((m) => {
        if (!m || m.minute >= 90) return m
        const nextMinute = m.minute + 1
        const intervals = [10, 20, 30, 40, 55, 65, 75, 85]
        if (intervals.includes(nextMinute)) setMatchActionTimer(8)
        if (nextMinute === 45) setPlayerMatchPhase('halftime')
        if (nextMinute === 90) setPlayerMatchPhase('fulltime')
        return { ...m, minute: nextMinute, stamina: Math.max(30, m.stamina - 1) }
      })
    }, 1000 / simulationSpeed)
    return () => window.clearInterval(tick)
  }, [playerMatchPhase, playerMatch, simulationSpeed])

  // Auto-advance manager match
  useEffect(() => {
    if (!managerMatch || simulationSpeed === 0) return
    const tac = tactics
    const mentDelta = tac.mentality === 'Ultra Defensive' ? -1.6 : tac.mentality === 'Defensive' ? -0.7 : tac.mentality === 'Balanced' ? 0 : tac.mentality === 'Attacking' ? 0.7 : 1.5
    const pressurePossessionBoost = tac.pressure === 'High' ? 2.4 : tac.pressure === 'Low' ? -1.2 : 0
    const lineOppChanceFactor = tac.defensiveLine === 'High' ? 1.25 : tac.defensiveLine === 'Low' ? 0.78 : 1
    const widthShotBoost = tac.width === 'Wide' ? 0.04 : tac.width === 'Narrow' ? -0.02 : 0
    const styleShotMul = tac.playStyle === 'Quick Transitions' ? 1.18 : tac.playStyle === 'Counter Attack' ? 1.08 : tac.playStyle === 'High Press' ? 1.05 : tac.playStyle === 'Wing Play' ? 1.1 : 1
    const styleGoalMul = tac.playStyle === 'Counter Attack' ? 1.18 : tac.playStyle === 'Quick Transitions' ? 1.08 : tac.playStyle === 'Possession' ? 1.0 : 1
    const mentGoalBoost = 1 + mentDelta * 0.06
    const tick = window.setInterval(() => {
      setManagerMatch((m) => {
        if (!m || m.minute >= 90) return m
        const nextMinute = m.minute + 1
        const homeAdvantage = m.home ? 5 : -5
        const squadAvg = players.reduce((t, p) => t + p.rating, 0) / players.length
        const strengthDiff = (squadAvg - 71) / 4 + homeAdvantage + mentDelta
        const possessionShift = (Math.random() - 0.5) * 14 + strengthDiff * 0.8 + pressurePossessionBoost
        const newPoss = Math.max(25, Math.min(75, m.possession + possessionShift))
        const teamShotProb = Math.max(0.04, (0.12 + widthShotBoost) * styleShotMul)
        const oppShotProb = Math.max(0.04, 0.1 * lineOppChanceFactor * (tac.pressure === 'High' ? 1.08 : 1))
        const newShots = m.shots + (Math.random() < teamShotProb ? 1 : 0)
        const newOppShots = m.opponentShots + (Math.random() < oppShotProb ? 1 : 0)
        const teamScores = newShots > m.shots && Math.random() < (0.25 * styleGoalMul * mentGoalBoost)
        const oppScores = newOppShots > m.opponentShots && Math.random() < (0.22 * styleGoalMul * lineOppChanceFactor)
        const newEvents = [...m.events]
        if (teamScores) newEvents.push(`${nextMinute}' GOAL — ${profile!.clubShort}`)
        if (oppScores) newEvents.push(`${nextMinute}' Goal conceded — ${m.opponentShort}`)
        if ([10, 20, 30, 40, 55, 65, 75, 85].includes(nextMinute) && Math.random() < 0.4) {
          if (tac.pressure === 'High' && tac.playStyle === 'High Press') newEvents.push(`${nextMinute}' High press`)
          else if (mentDelta >= 1.2) newEvents.push(`${nextMinute}' All-out attack`)
          else if (mentDelta <= -1.2) newEvents.push(`${nextMinute}' Low block holds`)
          else if (tac.width === 'Wide') newEvents.push(`${nextMinute}' Wing play`)
          else if (tac.playStyle === 'Possession') newEvents.push(`${nextMinute}' Possession`)
        }
        if (newEvents.length > 8) newEvents.shift()
        const newPerfs = m.playerPerformances.map((pp) => {
          const player = players.find((p) => p.id === pp.id)
          if (!player) return pp
          const offensivePos = player.position === 'ST' || player.position === 'AM' || player.position === 'CAM'
          const defensivePos = player.position === 'CB' || player.position === 'CDM' || player.position === 'DM'
          const roleFit = (offensivePos && mentDelta >= 0.7) || (defensivePos && mentDelta <= -0.7) ? 0.18 : 0
          const perfShift = (Math.random() - 0.45) * 2 + (player.form - 75) / 50 + roleFit
          return { ...pp, rating: Math.max(5, Math.min(10, pp.rating + perfShift)) }
        })
        if (nextMinute === 45 && !m.events.some((e) => e.includes('Half-time'))) {
          newEvents.push('Half-time')
        }
        return { ...m, minute: nextMinute, possession: Math.round(newPoss), shots: newShots, opponentShots: newOppShots, teamGoals: m.teamGoals + (teamScores ? 1 : 0), opponentGoals: m.opponentGoals + (oppScores ? 1 : 0), events: newEvents.slice(-8), playerPerformances: newPerfs }
      })
    }, 1000 / simulationSpeed)
    return () => window.clearInterval(tick)
  }, [managerMatch, simulationSpeed, players, profile, tactics])

  const finishManagerMatch = (finalScore?: string) => {
    if (!managerMatch) return
    const result = finalScore ?? `${managerMatch.teamGoals}–${managerMatch.opponentGoals}`
    const seasonEnds = weekNumber >= 38
    setFixtureResults((c) => seasonEnds ? {} : { ...c, [dateIndex]: result })
    setBudget((c) => c + (clubOffer?.managerBudgetGrowth ?? 0))
    setDateIndex((c) => seasonEnds ? 0 : Math.min(c + 1, seasonFixtures.length - 1))
    setWeekNumber((c) => c >= 38 ? 1 : c + 1)
    if (seasonEnds) setSeasonNumber((c) => c + 1)
    setPlayers((c) => c.map((p) => ({ ...p, fitness: Math.max(62, p.fitness - (p.id % 3 === 0 ? 7 : 3)), form: Math.min(99, Math.max(55, p.form + (p.id % 2 === 0 ? 2 : -1))) })))
    const sorted = [...managerMatch.playerPerformances].sort((a, b) => b.rating - a.rating)
    const newDvrs: import('./types').DynamicRating[] = []
    sorted.slice(0, 2).forEach((pp) => {
      const p = players.find((pl) => pl.id === pp.id)
      if (!p) return
      const boost = pp.rating >= 8 ? 2 : pp.rating >= 7 ? 1 : 0
      if (boost > 0) {
        newDvrs.push({ id: Date.now() + Math.random(), playerId: p.id, playerName: p.name, rating: p.rating + boost, change: boost, reason: pp.rating >= 8 ? 'Man of the match' : 'Strong performance', tier: p.rating + boost >= 90 ? 'legend' : p.rating + boost >= 85 ? 'elite' : 'gold', instant: true })
      }
    })
    if (newDvrs.length > 0) setDynamicRatings((c) => [...newDvrs, ...c].slice(0, 12))
    setManagerMatch(null)
    setSimulationSpeed(1)
    setIsClockRunning(true)
    showToast(`Matchday complete · ${result}`)
  }

  // Countdown timer for match actions
  useEffect(() => {
    if (matchActionTimer <= 0 || !playerMatchPhase) return
    const timer = window.setTimeout(() => {
      if (matchActionTimer <= 1) {
        handleMatchActionTimeout()
        setMatchActionTimer(0)
      } else {
        setMatchActionTimer((t) => t - 1)
      }
    }, 1000)
    return () => window.clearTimeout(timer)
  }, [matchActionTimer, playerMatchPhase])

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
    setTrainingEnergy((e) => Math.min(100, e + 35))
    setTrainingProgress((currentProgress) => {
      const gain = profile.mode === 'player' ? Math.max(1, (clubOffer?.playerTraining ?? 42) / 7 + (clubOffer?.playerTrainingBonus ?? 0)) : 4 + Math.round((clubOffer?.managerTrust ?? 74) / 30)
      const completed = currentProgress + gain >= 100
      if (completed) {
        setPlayers((currentPlayers) => currentPlayers.map((player) => player.id === 900 ? { ...player, rating: Math.min(player.potential, player.rating + 1), form: Math.min(99, player.form + 3) } : player))
        setSimulationEvents((current) => [{ id: Date.now(), label: 'Training completed', detail: 'Season block advanced.' }, ...current].slice(0, 8))
      }
      return completed ? currentProgress + gain - 100 : currentProgress + gain
    })
    if (profile.mode === 'player') {
      setRivalryScore((current) => Math.max(0, Math.min(100, current + (simDay % 2 === 0 ? 2 : -1))))
      setManagerTrust((current) => Math.max(0, Math.min(100, current + (simDay % 3 === 0 ? 1 : 0) + (clubOffer?.playerTrustModifier ?? 0))))
      if (simDay % 5 === 0 && !playerMatchPhase && dateIndex < seasonFixtures.length && !fixtureResults[dateIndex]) {
        const fixture = seasonFixtures[dateIndex]
        setPlayerMatch({ opponent: fixture.opponent, opponentShort: fixture.short, minute: 0, rating: 6.0, goals: 0, assists: 0, passes: 0, choices: [], teamGoals: 0, opponentGoals: fixture.difficulty === 'High' ? 2 : 1, stamina: 100, lastEvent: 'The whistle is about to go.' })
        setPlayerMatchPhase('pre')
        setIsClockRunning(false)
      }
    } else if (simDay % 7 === 0 && !fixtureResults[dateIndex] && !managerMatch) {
      const fixture = seasonFixtures[dateIndex % seasonFixtures.length]
      const initialPerfs = players.map((p) => ({ id: p.id, rating: p.rating }))
      setManagerMatch({ opponent: fixture.opponent, opponentShort: fixture.short, crest: fixture.crest, home: fixture.home, minute: 0, teamGoals: 0, opponentGoals: 0, possession: 50, shots: 0, opponentShots: 0, events: ['Kick-off.'], playerPerformances: initialPerfs })
      setIsClockRunning(false)
      setSimulationEvents((current) => [{ id: Date.now() + 2, label: 'Matchday', detail: `${fixture.opponent}, ${fixture.home ? 'home' : 'away'}.` }, ...current].slice(0, 8))
    }
    if (simDay % 3 === 0 && transferApproaches.length < 3 && Math.random() < 0.3) {
      const available = transferClubPool.filter((club) => !transferApproaches.some((a) => a.id === club.id))
      if (available.length > 0) {
        const pick = available[Math.floor(Math.random() * available.length)]
        const approach: TransferApproach = { ...pick, arrivalDay: simDay, arrivalWeek: weekNumber, stage: 'approaching', counterDemand: '' }
        setTransferApproaches((current) => [...current, approach])
          setActiveTransferApproach(approach)
          setShowTransferModal(true)
          setIsClockRunning(false)
          setSimulationEvents((current) => [{ id: Date.now(), label: 'Transfer approach', detail: pick.clubName }, ...current].slice(0, 8))
      }
    }
  }, [profile, simDay, dateIndex, fixtureResults, players, playerMatchPhase, clubOffer, weekNumber, transferApproaches])

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

  const startCareer = (nextProfile: CareerProfile, nextOffer: ClubOffer) => {
    const nextPlayers = nextProfile.mode === 'player' ? [...initialPlayers, createCareerPlayer(nextProfile, nextOffer)] : initialPlayers
    setOnboarding(null)
    setProfile(nextProfile)
    setClubOffer(nextOffer)
    setIntroComplete(false)
    setActiveView(nextProfile.mode === 'player' ? 'player' : 'hub')
    setPlayers(nextPlayers)
    setShortlist([101, 110, 107, 109, 102, 108, 104, 106, 105, 103, 111, 112])
    setTransferList([])
    setLoanList([])
    setBlockedList([])
    setDynamicRatings(seedDynamicRatings)
    setScouted([])
    setNegotiations([])
    setFixtureResults({})
    setDateIndex(0)
    setSeasonNumber(1)
    setWeekNumber(1)
    setBudget(nextProfile.mode === 'manager' ? nextOffer.managerBudget : 48500000)
    setSelectedPlayerId(nextProfile.mode === 'player' ? 900 : 9)
    setSimulationSpeed(1)
    setIsClockRunning(false)
    setSimMinute(8 * 60)
    setSimDay(1)
    previousMinuteRef.current = 8 * 60
    processedDayRef.current = 1
    setPlayerMatchPhase(null)
    setPlayerMatch(null)
    setTrainingProgress(nextProfile.mode === 'player' ? nextOffer.playerTraining : 42)
    setRivalryScore(48)
    setManagerTrust(nextProfile.mode === 'manager' ? nextOffer.managerTrust : 74)
    setSimulationEvents([])
    setTransferApproaches([])
    setManagerMatch(null)
    setTrainingEnergy(100)
    setLastTrainingDay(0)
  }

  const resetCareer = () => {
    window.localStorage.removeItem(SAVE_KEY)
    window.localStorage.removeItem(PROFILE_KEY)
    window.localStorage.removeItem(ONBOARDING_KEY)
    setOnboarding(null)
    setClubOffer(null)
    setIntroComplete(true)
    setSavedAt(null)
    setSaveStatus('saved')
    setProfile(null)
    setActiveView('hub')
    setPlayers(initialPlayers)
    setShortlist([101, 110, 107, 109, 102, 108, 104, 106, 105, 103, 111, 112])
    setTransferList([])
    setLoanList([])
    setBlockedList([])
    setDynamicRatings(seedDynamicRatings)
    setScouted([])
    setNegotiations([])
    setFixtureResults({})
    setDateIndex(0)
    setSeasonNumber(1)
    setWeekNumber(1)
    setBudget(48500000)
    setSelectedPlayerId(9)
    setSimulationSpeed(1)
    setIsClockRunning(false)
    setSimMinute(8 * 60)
    setSimDay(1)
    previousMinuteRef.current = 8 * 60
    processedDayRef.current = 1
    setPlayerMatchPhase(null)
    setPlayerMatch(null)
    setTrainingProgress(42)
    setRivalryScore(48)
    setManagerTrust(74)
    setSimulationEvents([])
    setShowTransferModal(false)
    setActiveTransferApproach(null)
    setManagerMatch(null)
    setTrainingEnergy(100)
    setLastTrainingDay(0)
  }

  const completeIntroduction = () => {
    setIntroComplete(true)
    setIsClockRunning(true)
    showToast('Season 1 · Week 1 is underway')
  }

  const beginOnboarding = (nextOnboarding: OnboardingSave) => {
    const persistedOnboarding = { ...nextOnboarding, offers: createClubOffers(nextOnboarding.leaguePreference) }
    setOnboarding(persistedOnboarding)
    try { window.localStorage.setItem(ONBOARDING_KEY, JSON.stringify(persistedOnboarding)) } catch { /* save status appears after a club is accepted */ }
  }

  const doTrainingSession = (session: TrainingSession) => {
    if (trainingEnergy < session.energyCost || lastTrainingDay === simDay) {
      showToast(lastTrainingDay === simDay ? 'Already trained today.' : 'Not enough energy.')
      return
    }
    setTrainingEnergy((e) => Math.max(0, e - session.energyCost))
    setLastTrainingDay(simDay)
    const boost = Math.floor(Math.random() * 3) + 2
    setPlayers((current) => current.map((p) => profile?.mode === 'player' && p.id === 900 ? { ...p, skills: { ...p.skills, [session.skill]: Math.min(99, (p.skills?.[session.skill] ?? 60) + boost) }, form: Math.min(99, p.form + 2), fitness: Math.min(100, p.fitness + 3) } : p))
    showToast(`${session.label} complete · +${boost} ${session.skill}`)
  }

  const showToast = (message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 3200)
  }

  const acceptClubTransfer = (approach: TransferApproach) => {
    if (!profile || !clubOffer) return
    setTransferApproaches((current) => current.map((a) => a.id === approach.id ? { ...a, stage: 'accepted' } : a))
    setProfile({ ...profile, clubName: approach.clubName, clubShort: approach.clubShort, league: approach.league, primaryColor: approach.primaryColor, secondaryColor: approach.secondaryColor })
    setClubOffer({ ...clubOffer, clubName: approach.clubName, clubShort: approach.clubShort, league: approach.league, primaryColor: approach.primaryColor, secondaryColor: approach.secondaryColor, managerBudget: approach.managerBudget, managerTrust: approach.managerTrust, playerWage: approach.playerWage, playerRole: approach.playerRole, playerTraining: approach.playerTraining, identity: approach.identity })
    if (profile.mode === 'player') setBudget(approach.managerBudget)
    setShowTransferModal(false)
    setActiveTransferApproach(null)
    showToast(`Transfer complete · ${approach.clubName}`)
  }

  const declineApproach = (approach: TransferApproach) => {
    setTransferApproaches((current) => current.map((a) => a.id === approach.id ? { ...a, stage: 'declined' } : a))
    setShowTransferModal(false)
    setActiveTransferApproach(null)
    setIsClockRunning(true)
    showToast(`You declined ${approach.clubName}'s approach.`)
  }

  const beginPlayerMatch = () => {
    if (!playerMatch) return
    setPlayerMatch((current) => current ? { ...current, minute: 1, lastEvent: 'Kick-off.' } : current)
    setPlayerMatchPhase('live')
  }

  const choosePlayerMatchAction = (action: 'attack' | 'compose' | 'conserve' | 'press' | 'hold' | 'risk' | 'encourage' | 'humble') => {
    if (!playerMatch) return
    const isPositive = action === 'attack' || action === 'press' || action === 'encourage'
    const ratingGain = action === 'encourage' ? 0.2 : isPositive ? 0.25 : action === 'conserve' || action === 'hold' ? 0.12 : 0.18
    const event = action === 'attack' ? 'Driving into space.'
      : action === 'press' ? 'Pressing high — won the second ball.'
      : action === 'risk' ? 'Attempting the through ball.'
      : action === 'encourage' ? 'Post-match interview.'
      : action === 'humble' ? 'Post-match interview.'
      : 'Keeping it simple.'
    const nextMatch: PlayerMatch = { ...playerMatch, rating: Math.min(10, Number((playerMatch.rating + ratingGain).toFixed(1))), passes: playerMatch.passes + (action === 'compose' || action === 'hold' ? 6 : 2), goals: playerMatch.goals + (action === 'risk' && playerMatch.minute >= 45 ? 1 : 0), teamGoals: playerMatch.teamGoals + (action === 'attack' && playerMatch.minute >= 45 ? 1 : 0), stamina: Math.max(54, playerMatch.stamina - (isPositive ? 10 : 5)), choices: [...playerMatch.choices, action], lastEvent: event }
    if (playerMatchPhase === 'interview') {
      finishPlayerMatch(nextMatch)
      return
    }
    setMatchActionTimer(0)
    setPlayerMatch(nextMatch)
    if (playerMatchPhase === 'pre') setPlayerMatchPhase('live')
  }

  const handleMatchActionTimeout = () => {
    setPlayerMatch((m) => m ? { ...m, stamina: Math.max(30, m.stamina - 8), opponentGoals: m.opponentGoals + 1, lastEvent: 'Lost possession.', rating: Math.max(4, Number((m.rating - 0.3).toFixed(1))) } : m)
  }

  const advancePlayerMatch = () => {
    if (!playerMatch) return
    if (playerMatchPhase === 'pre') { setMatchActionTimer(8); return beginPlayerMatch() }
    if (playerMatchPhase === 'halftime') {
      setPlayerMatchPhase('live')
      setMatchActionTimer(8)
      setPlayerMatch((m) => m ? { ...m, lastEvent: 'Second half.' } : m)
    }
    if (playerMatchPhase === 'fulltime') setPlayerMatchPhase('interview')
  }

  const finishPlayerMatch = (finalMatch: PlayerMatch) => {
    const result = `${finalMatch.teamGoals}–${finalMatch.opponentGoals}`
    setPlayers((current) => current.map((item) => item.id === 900 ? { ...item, rating: Math.min(item.potential, item.rating + (finalMatch.rating >= 7.5 ? 1 : 0)), form: Math.min(99, Math.max(55, item.form + (finalMatch.rating >= 7 ? 3 : -1))), fitness: Math.max(48, item.fitness - (100 - finalMatch.stamina) / 2), morale: Math.min(99, item.morale + (finalMatch.rating >= 7 ? 3 : 0)) } : item))
    setRivalryScore((current) => Math.max(0, Math.min(100, current + (finalMatch.rating >= 7 ? 8 : -3))))
    setManagerTrust((current) => Math.max(0, Math.min(100, current + (finalMatch.rating >= 7 ? 4 : -2) + (finalMatch.choices.includes('encourage') ? 2 : 0))))
    const seasonEnds = weekNumber >= 38
    setFixtureResults((current) => seasonEnds ? {} : { ...current, [dateIndex]: result })
    if (profile?.mode === 'manager') setBudget((current) => current + (clubOffer?.managerBudgetGrowth ?? 0))
    setDateIndex((current) => seasonEnds ? 0 : Math.min(current + 1, seasonFixtures.length - 1))
    setWeekNumber((current) => current >= 38 ? 1 : current + 1)
    if (seasonEnds) setSeasonNumber((current) => current + 1)
    setSimulationEvents((current) => [{ id: Date.now(), label: 'Match complete', detail: `${finalMatch.rating.toFixed(1)} rating · ${result} vs ${finalMatch.opponent}` }, ...current].slice(0, 8))
    setPlayerMatch(null)
    setPlayerMatchPhase(null)
    setMatchActionTimer(0)
    setSimulationSpeed(1)
    setIsClockRunning(true)
    showToast(`Matchday complete · performance ${finalMatch.rating.toFixed(1)}`)
  }

  const continueWeek = () => {
    const currentFixture = seasonFixtures[dateIndex]
    if (!currentFixture || fixtureResults[dateIndex]) {
      showToast('All scheduled fixtures have been resolved')
      return
    }
    if (managerMatch) { showToast('Matchday already in progress'); return }
    const initialPerfs = players.map((p) => ({ id: p.id, rating: p.rating }))
    setManagerMatch({ opponent: currentFixture.opponent, opponentShort: currentFixture.short, crest: currentFixture.crest, home: currentFixture.home ?? true, minute: 0, teamGoals: 0, opponentGoals: 0, possession: 50, shots: 0, opponentShots: 0, events: ['Kick-off. The squad takes the pitch.'], playerPerformances: initialPerfs })
    setIsClockRunning(false)
    showToast(`Matchday begins · ${currentFixture.opponent}`)
  }

  const toggleShortlist = (id: number) => {
    setShortlist((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])
    showToast(shortlist.includes(id) ? 'Removed from shortlist' : 'Added to shortlist')
  }

  const movePlayerToList = (id: number, target: Exclude<TransferTab, 'shortlist'>) => {
    const setters: Record<Exclude<TransferTab, 'shortlist'>, (updater: (current: number[]) => number[]) => void> = {
      transferList: setTransferList,
      loanList: setLoanList,
      blockedList: setBlockedList,
    }
    setShortlist((current) => current.filter((item) => item !== id))
    setters[target]((current) => current.includes(id) ? current : [...current, id])
    showToast(`Moved to ${target === 'transferList' ? 'transfer list' : target === 'loanList' ? 'loan list' : 'blocked list'}`)
  }

  const sendTransferComment = (id: number, text: string) => {
    setTransferComments((c) => ({ ...c, [id]: [...(c[id] ?? []), { from: 'You', text, at: Date.now() }] }))
  }

  const scoutProspect = (id: number) => {
    setScouted((current) => current.includes(id) ? current : [...current, id])
    showToast('Scout report filed · ready for review')
  }

  if (pageMode === 'landing') return <LandingPage onEnter={() => setPageMode('game')} onDocs={() => setPageMode('docs')} hasSavedCareer={!!profile} onContinue={() => setPageMode('game')} />
  if (pageMode === 'docs') return <DocsPage onBack={() => setPageMode('landing')} />

  if (!profile) return onboarding ? <ClubOffersView onboarding={onboarding} onAccept={(offer) => {
    const nextProfile: CareerProfile = { mode: onboarding.mode, name: onboarding.name, clubName: offer.clubName, clubShort: offer.clubShort, league: offer.league, primaryColor: offer.primaryColor, secondaryColor: offer.secondaryColor, difficulty: onboarding.difficulty, playerPosition: onboarding.playerPosition }
    try { window.localStorage.setItem(ONBOARDING_KEY, JSON.stringify({ ...onboarding, acceptedOffer: offer })) } catch { /* career save follows immediately */ }
    startCareer(nextProfile, offer)
  }} /> : <SetupView onComplete={beginOnboarding} />

  if (!introComplete) return <IntroductionView profile={profile} offer={clubOffer} onContinue={completeIntroduction} />

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
      <aside className="app-sidebar">
        <div className="sb-brand">NS</div>
        <div className="app-sidebar-top" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flex: 1, width: '100%' }}>
          {visibleNavItems.map((item) => (
            <button
              key={item.id}
              className={`sb-icon${activeView === item.id ? ' active' : ''}`}
              onClick={() => setActiveView(item.id)}
              title={item.label}
            >
              <Icon>{item.icon}</Icon>
              {item.id === 'market' && <span className="sb-badge">2</span>}
            </button>
          ))}
        </div>
        <div className="sb-clock">
          <span className={`sb-time ${isClockRunning ? '' : 'paused'}`}>{isClockRunning ? clockLabel : '||'}</span>
          <div className="sb-speed">
            <button className={simulationSpeed === 0 ? 'active' : ''} onClick={() => { setSimulationSpeed(0); setIsClockRunning(false) }} title="Pause" />
            <button className={simulationSpeed === 1 && isClockRunning ? 'active' : ''} onClick={() => { setSimulationSpeed(1); setIsClockRunning(true) }} title="1x" />
            <button className={simulationSpeed === 2 ? 'active' : ''} onClick={() => { setSimulationSpeed(2); setIsClockRunning(true) }} title="2x" />
            <button className={simulationSpeed === 20 ? 'active' : ''} onClick={() => { setSimulationSpeed(20); setIsClockRunning(true) }} title="20x" />
          </div>
        </div>
        <button className="sb-icon" onClick={() => showToast(saveCareer() ? 'Saved' : 'Save failed')} title="Save">
          <Icon>⌁</Icon>
        </button>
      </aside>

      <main className="main-content">
        <div className="app-topbar">
          <span className="tb-pill"><i className="dot" />{careerMode === 'player' ? 'PLAYER' : 'MANAGER'} · {profile.clubShort}</span>
          {careerMode === 'player' && playerMatchPhase && (
            <button className="tb-pill alert" onClick={() => setActiveView('player')}>
              <span className="dot" /> Matchday
            </button>
          )}
          {savedAt && (
            <span className="tb-pill" style={{ color: 'var(--text-dim)' }}>
              <i className="dot" style={{ background: saveStatus === 'saving' ? 'var(--warn)' : 'var(--good)' }} />
              {saveStatus === 'saving' ? 'Saving…' : 'Saved'}
            </span>
          )}
          <div className="flex" />
          <button className="tb-user" onClick={() => setShowNotifications(!showNotifications)}>
            <div className="tb-avatar" style={{ background: profile.primaryColor, color: '#fff' }}>
              {profile.name.split(' ').map((p) => p[0]).join('').slice(0, 2) || 'NP'}
            </div>
            <span>{profile.name}</span>
          </button>
          {showNotifications && (
            <div className="notif">
              <h4>Notifications</h4>
              <div className="notif-row">
                <div className="dot" />
                <div>
                  <b>Week {weekNumber} · {clockLabel}</b>
                  <small>Simulator running at {simulationSpeed}× speed</small>
                </div>
              </div>
              <div className="notif-row">
                <div className="dot warn" />
                <div>
                  <b>{transferApproaches.length} transfer approaches</b>
                  <small>{transferApproaches.filter((a) => a.stage === 'approaching').length} new this week</small>
                </div>
              </div>
              <div className="notif-row">
                <div className="dot" />
                <div>
                  <b>Day {simDay} · Season {seasonNumber}</b>
                  <small>Training, fitness and form updating</small>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="page stack-lg">
          {activeView === 'hub' && (careerMode === 'player' ? <PlayerHubView profile={profile} player={selectedPlayer} clockLabel={clockLabel} simDay={simDay} playerMatchPhase={playerMatchPhase} playerMatch={playerMatch} actionTimer={matchActionTimer} matchSpeed={simulationSpeed} onSetSpeed={(s) => setSimulationSpeed(s as 0|1|2|20)} trainingProgress={trainingProgress} rivalryScore={rivalryScore} managerTrust={managerTrust} simulationEvents={simulationEvents} onAdvanceMatch={advancePlayerMatch} onMatchAction={choosePlayerMatchAction} openModal={openModal} setActiveView={setActiveView} /> : <HubView profile={profile} budget={budget} dateIndex={dateIndex} fixtureResults={fixtureResults} players={players} managerMatch={managerMatch} matchSpeed={simulationSpeed} onSetSpeed={(s) => setSimulationSpeed(s as 0|1|2|20)} onFinishMatch={() => finishManagerMatch()} onSubPlayer={(outId, inId) => { setPlayers((c) => c.map((p) => p.id === outId ? { ...p, fitness: Math.min(100, p.fitness + 15) } : p)); setManagerMatch((m) => m ? { ...m, events: [...m.events, `SUB: ${players.find((p) => p.id === inId)?.name ?? ''} replaces ${players.find((p) => p.id === outId)?.name ?? ''}`].slice(-8), playerPerformances: [...m.playerPerformances.filter((pp) => pp.id !== outId), { id: inId, rating: players.find((p) => p.id === inId)?.rating ?? 70 }] } : m); showToast('Substitution made') }} continueWeek={continueWeek} openModal={openModal} setActiveView={setActiveView} />)}
          {activeView === 'player' && <PlayerHubView profile={profile} player={selectedPlayer} clockLabel={clockLabel} simDay={simDay} playerMatchPhase={playerMatchPhase} playerMatch={playerMatch} actionTimer={matchActionTimer} matchSpeed={simulationSpeed} onSetSpeed={(s) => setSimulationSpeed(s as 0|1|2|20)} trainingProgress={trainingProgress} rivalryScore={rivalryScore} managerTrust={managerTrust} simulationEvents={simulationEvents} onAdvanceMatch={advancePlayerMatch} onMatchAction={choosePlayerMatchAction} openModal={openModal} setActiveView={setActiveView} />}
          {activeView === 'squad' && <SquadView players={players} selectedPlayer={selectedPlayer} setSelectedPlayerId={setSelectedPlayerId} openModal={openModal} />}
          {activeView === 'transferHub' && <TransferHub prospects={prospects} shortlist={shortlist} transferList={transferList} loanList={loanList} blockedList={blockedList} budget={budget} transferComments={transferComments} transferReports={transferReports} onToggleShortlist={toggleShortlist} onMoveTab={movePlayerToList} onSendComment={sendTransferComment} onShowToast={showToast} />}
          {activeView === 'playerProfile' && <PlayerProfile player={selectedPlayer} setActiveView={setActiveView} onShowToast={showToast} />}
          {activeView === 'teamManagement' && <TeamManagement players={players} selectedPlayer={selectedPlayer} setSelectedPlayerId={setSelectedPlayerId} setActiveView={setActiveView} onSubPlayer={(outId, inId) => { setPlayers((c) => c.map((p) => p.id === outId ? { ...p, fitness: Math.min(100, p.fitness + 15) } : p)); showToast('Substitution made') }} onShowToast={showToast} />}
          {activeView === 'tactics' && <TacticsView players={players} tactics={tactics} onUpdateTactics={(t) => { setTactics(t); showToast(`Tactics set: ${t.formation} · ${t.mentality}`) }} setActiveView={setActiveView} onShowToast={showToast} />}
          {activeView === 'market' && <MarketView filteredProspects={filteredProspects} search={search} setSearch={setSearch} marketFilter={marketFilter} setMarketFilter={setMarketFilter} shortlist={shortlist} scouted={scouted} negotiations={negotiations} toggleShortlist={toggleShortlist} scoutProspect={scoutProspect} startNegotiation={startNegotiation} budget={budget} openModal={openModal} />}
          {activeView === 'academy' && <AcademyView openModal={openModal} setActiveView={setActiveView} />}
          {activeView === 'club' && (careerMode === 'player' ? <PlayerClubView profile={profile} player={selectedPlayer} openModal={openModal} /> : <ClubView budget={budget} requestInvestment={requestInvestment} openModal={openModal} />)}
          {activeView === 'calendar' && <CalendarView profile={profile} dateIndex={dateIndex} fixtureResults={fixtureResults} simDay={simDay} weekNumber={weekNumber} seasonNumber={seasonNumber} />}
          {activeView === 'transfers' && <TransferOffersView profile={profile} approaches={transferApproaches} clubOffer={clubOffer} onConsider={(a) => { setActiveTransferApproach(a); setShowTransferModal(true) }} onAccept={(a) => acceptClubTransfer(a)} onDecline={(a) => declineApproach(a)} onCounter={(a, demand) => { setTransferApproaches((c) => c.map((x) => x.id === a.id ? { ...x, stage: 'negotiating', counterDemand: demand, managerTrust: Math.min(100, x.managerTrust + 10), playerWage: Math.round(x.playerWage * 1.12), managerBudget: Math.round(x.managerBudget * 1.08) } : x)); showToast(`Counter-offer submitted. ${a.clubName}'s offer improved.`) }} />}
          {activeView === 'training' && <TrainingView profile={profile} players={players} trainingEnergy={trainingEnergy} lastTrainingDay={lastTrainingDay} simDay={simDay} doTrainingSession={doTrainingSession} />}
          {(activeView === 'transferHub' || activeView === 'teamManagement') && (
            <div style={{ marginTop: 16 }}>
              <DynamicRatingsTicker ratings={dynamicRatings} />
            </div>
          )}
        </div>
      </main>

      {toast && <div className="toast"><span className="toast-check">✓</span>{toast}</div>}
      {showTransferModal && activeTransferApproach && <TransferApproachModal approach={activeTransferApproach} profile={profile} onAccept={acceptClubTransfer} onDecline={declineApproach} onConsider={() => { setShowTransferModal(false); setActiveTransferApproach(null); setIsClockRunning(true); showToast(`You'll review ${activeTransferApproach.clubName}'s offer in your own time.`) }} onClose={() => { setShowTransferModal(false); setActiveTransferApproach(null); setIsClockRunning(true) }} />}
      {isModalOpen && <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}><div className="modal" onClick={(event) => event.stopPropagation()}><button className="modal-close" aria-label="Close" onClick={() => setIsModalOpen(false)}>×</button><div className="kicker">Confirmation</div><h2>{modalTitle}</h2><p>{pendingInvestment ? 'Submit a €2.5M board investment request for the transfer window.' : `Confirm: ${modalTitle}?`}</p><div className="modal-actions"><button className="btn btn-primary" onClick={() => { if (pendingInvestment) { setBudget((current) => current + 2500000); setPendingInvestment(false); showToast('Investment approved · +€2.5M') } else { showToast(`${modalTitle} confirmed`) } setIsModalOpen(false) }}>Confirm <Icon>→</Icon></button><button className="btn btn-ghost" onClick={() => setIsModalOpen(false)}>Cancel</button></div></div></div>}
    </div>
  )
}

export default App
