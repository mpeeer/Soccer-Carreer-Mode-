import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties, FormEvent, ReactNode } from 'react'
import type { View, CareerMode, MatchPhase, Position, TransferApproach, PlayerSkills, TrainingSession, Player, Fixture, CareerProfile, ClubOffer, OnboardingSave, Prospect, PlayerMatch, ManagerMatch, SimulationEvent, SavedCareer, SavedCareerEnvelope, SaveStatus, TransferTab, Tactics } from './types'
import { SAVE_KEY, PROFILE_KEY, ONBOARDING_KEY, CURRENT_SAVE_VERSION, initialPlayers, seasonFixtures, prospects, clubOfferPool, trainingSessions, transferClubPool, navItems, playerNavItems, formatFixtureDate, createClubOffers, seedDynamicRatings, defaultTactics } from './data'
import { backupLegacySaveIfNeeded, readSavedOnboarding, readSavedCareer, profileFromOffer, formatMoney, formatSavedTime, createCareerPlayer, createLegacyClubOffer, Icon } from './utils'
import { TransferHub } from './views/transferHub'
import { PlayerProfile } from './views/playerProfile'
import { TeamManagement } from './views/teamManagement'
import { DynamicRatingsTicker } from './views/dynamicRatingsTicker'
import { TacticsView } from './views/tactics'
import { PlayerPortrait } from './portraits/playerPortrait'

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
    // Persist transfer approaches alongside the career (not in SavedCareer type to keep backward compat)
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
        // Check for choice intervals (every ~10 min)
        const intervals = [10, 20, 30, 40, 55, 65, 75, 85]
        if (intervals.includes(nextMinute)) setMatchActionTimer(8)
        // Phase transitions
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
    const tick = window.setInterval(() => {
      setManagerMatch((m) => {
        if (!m || m.minute >= 90) return m
        const nextMinute = m.minute + 1
        const homeAdvantage = m.home ? 5 : -5
        const squadAvg = players.reduce((t, p) => t + p.rating, 0) / players.length
        const strengthDiff = (squadAvg - 71) / 4 + homeAdvantage
        const possessionShift = (Math.random() - 0.5) * 14 + strengthDiff * 0.8
        const newPoss = Math.max(25, Math.min(75, m.possession + possessionShift))
        const newShots = m.shots + (Math.random() < 0.12 ? 1 : 0)
        const newOppShots = m.opponentShots + (Math.random() < 0.1 ? 1 : 0)
        const teamScores = newShots > m.shots && Math.random() < 0.25
        const oppScores = newOppShots > m.opponentShots && Math.random() < 0.22
        const newEvents = [...m.events]
        if (teamScores) newEvents.push(`${nextMinute}' GOAL! ${profile!.clubShort} find the net!`)
        if (oppScores) newEvents.push(`${nextMinute}' Goal conceded. ${m.opponentShort} break through.`)
        if (newEvents.length > 8) newEvents.shift()
        // Update player performances
        const newPerfs = m.playerPerformances.map((pp) => {
          const player = players.find((p) => p.id === pp.id)
          if (!player) return pp
          const perfShift = (Math.random() - 0.45) * 2 + (player.form - 75) / 50
          return { ...pp, rating: Math.max(5, Math.min(10, pp.rating + perfShift)) }
        })
        // Half-time sub check
        if (nextMinute === 45 && !m.events.some((e) => e.includes('Half-time'))) {
          newEvents.push('Half-time. Time to assess the squad.')
        }
        return { ...m, minute: nextMinute, possession: Math.round(newPoss), shots: newShots, opponentShots: newOppShots, teamGoals: m.teamGoals + (teamScores ? 1 : 0), opponentGoals: m.opponentGoals + (oppScores ? 1 : 0), events: newEvents.slice(-8), playerPerformances: newPerfs }
      })
    }, 1000 / simulationSpeed)
    return () => window.clearInterval(tick)
  }, [managerMatch, simulationSpeed, players, profile])

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
    // DVR: push events for top performers and underperformers
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
    sorted.slice(-1).forEach((pp) => {
      const p = players.find((pl) => pl.id === pp.id)
      if (!p) return
      if (pp.rating < 6.5) newDvrs.push({ id: Date.now() + 200 + Math.random(), playerId: p.id, playerName: p.name, rating: Math.max(p.rating - 1, 50), change: -1, reason: 'Below par display', tier: 'bronze', instant: true })
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
    // Regenerate training energy overnight
    setTrainingEnergy((e) => Math.min(100, e + 35))
    setTrainingProgress((currentProgress) => {
      const gain = profile.mode === 'player' ? Math.max(1, (clubOffer?.playerTraining ?? 42) / 7 + (clubOffer?.playerTrainingBonus ?? 0)) : 4 + Math.round((clubOffer?.managerTrust ?? 74) / 30)
      const completed = currentProgress + gain >= 100
      if (completed) {
        setPlayers((currentPlayers) => currentPlayers.map((player) => player.id === 900 ? { ...player, rating: Math.min(player.potential, player.rating + 1), form: Math.min(99, player.form + 3) } : player))
        setSimulationEvents((current) => [{ id: Date.now(), label: 'Training milestone', detail: profile.mode === 'player' ? `${profile.name} reached a new development milestone.` : 'The training ground completed its daily block.' }, ...current].slice(0, 8))
      }
      return completed ? currentProgress + gain - 100 : currentProgress + gain
    })
    if (profile.mode === 'player') {
      setRivalryScore((current) => Math.max(0, Math.min(100, current + (simDay % 2 === 0 ? 2 : -1))))
      setManagerTrust((current) => Math.max(0, Math.min(100, current + (simDay % 3 === 0 ? 1 : 0) + (clubOffer?.playerTrustModifier ?? 0))))
      setSimulationEvents((current) => [{ id: Date.now() + 1, label: 'Daily report', detail: `Training, recovery, and social standing processed for day ${simDay}.` }, ...current].slice(0, 8))
      if (simDay % 5 === 0 && !playerMatchPhase && dateIndex < seasonFixtures.length && !fixtureResults[dateIndex]) {
        const fixture = seasonFixtures[dateIndex]
        setPlayerMatch({ opponent: fixture.opponent, opponentShort: fixture.short, minute: 0, rating: 6.0, goals: 0, assists: 0, passes: 0, choices: [], teamGoals: 0, opponentGoals: fixture.difficulty === 'High' ? 2 : 1, stamina: 100, lastEvent: 'The whistle is about to go.' })
        setPlayerMatchPhase('pre')
        setIsClockRunning(false)
      }
    } else if (simDay % 7 === 0 && !fixtureResults[dateIndex] && !managerMatch) {
      const fixture = seasonFixtures[dateIndex % seasonFixtures.length]
      const initialPerfs = players.map((p) => ({ id: p.id, rating: p.rating }))
      setManagerMatch({ opponent: fixture.opponent, opponentShort: fixture.short, crest: fixture.crest, home: fixture.home, minute: 0, teamGoals: 0, opponentGoals: 0, possession: 50, shots: 0, opponentShots: 0, events: ['Kick-off. The squad takes the pitch.'], playerPerformances: initialPerfs })
      setIsClockRunning(false)
      setSimulationEvents((current) => [{ id: Date.now() + 2, label: 'Manager matchday', detail: `${fixture.opponent} at ${fixture.home ? 'home' : 'away'}. You have the touchline.` }, ...current].slice(0, 8))
    }
    // Random transfer approaches (every 3 days, 30% chance, max 3 active)
    if (simDay % 3 === 0 && transferApproaches.length < 3 && Math.random() < 0.3) {
      const available = transferClubPool.filter((club) => !transferApproaches.some((a) => a.id === club.id))
      if (available.length > 0) {
        const pick = available[Math.floor(Math.random() * available.length)]
        const approach: TransferApproach = { ...pick, arrivalDay: simDay, arrivalWeek: weekNumber, stage: 'approaching', counterDemand: '' }
        setTransferApproaches((current) => [...current, approach])
        setActiveTransferApproach(approach)
        setShowTransferModal(true)
        setIsClockRunning(false)
        setSimulationEvents((current) => [{ id: Date.now(), label: 'Transfer approach', detail: `${pick.clubName} has made an official approach.` }, ...current].slice(0, 8))
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
      showToast(lastTrainingDay === simDay ? 'You already trained today. Recover overnight.' : 'Not enough energy for this session.')
      return
    }
    setTrainingEnergy((e) => Math.max(0, e - session.energyCost))
    setLastTrainingDay(simDay)
    const boost = Math.floor(Math.random() * 3) + 2 // 2-4 point boost
    setPlayers((current) => current.map((p) => profile?.mode === 'player' && p.id === 900 ? { ...p, skills: { ...p.skills, [session.skill]: Math.min(99, (p.skills?.[session.skill] ?? 60) + boost) }, form: Math.min(99, p.form + 2), fitness: Math.min(100, p.fitness + 3) } : p))
    showToast(`${session.label} complete · +${boost} ${session.skill}`)
  }

  const showToast = (message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 3200)
  }

  const acceptClubTransfer = (approach: TransferApproach) => {
    if (!profile || !clubOffer) return
    const farewell = `"At ${profile.clubName}, the ${clubOffer.identity?.toLowerCase() ?? 'journey'} shaped everything. Now ${approach.clubName} calls." — ${profile.name}`
    setTransferApproaches((current) => current.map((a) => a.id === approach.id ? { ...a, stage: 'accepted' } : a))
    setProfile({ ...profile, clubName: approach.clubName, clubShort: approach.clubShort, league: approach.league, primaryColor: approach.primaryColor, secondaryColor: approach.secondaryColor })
    setClubOffer({ ...clubOffer, clubName: approach.clubName, clubShort: approach.clubShort, league: approach.league, primaryColor: approach.primaryColor, secondaryColor: approach.secondaryColor, managerBudget: approach.managerBudget, managerTrust: approach.managerTrust, playerWage: approach.playerWage, playerRole: approach.playerRole, playerTraining: approach.playerTraining, identity: approach.identity })
    if (profile.mode === 'player') setBudget(approach.managerBudget)
    setShowTransferModal(false)
    setActiveTransferApproach(null)
    showToast(farewell)
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
    setMatchActionTimer(0)
    setPlayerMatch(nextMatch)
    if (playerMatchPhase === 'pre') setPlayerMatchPhase('live')
    // Keep the user in the half-time decision state until they explicitly start the second half.
  }

  const handleMatchActionTimeout = () => {
    setPlayerMatch((m) => m ? { ...m, stamina: Math.max(30, m.stamina - 8), opponentGoals: m.opponentGoals + 1, lastEvent: 'Too slow — you lost possession and the opponent counters.', rating: Math.max(4, Number((m.rating - 0.3).toFixed(1))) } : m)
    setSimulationEvents((c) => [{ id: Date.now(), label: 'Missed decision', detail: 'Hesitation cost you. The opponent seized the moment.' }, ...c].slice(0, 8))
  }

  const advancePlayerMatch = () => {
    if (!playerMatch) return
    if (playerMatchPhase === 'pre') { setMatchActionTimer(8); return beginPlayerMatch() }
    if (playerMatchPhase === 'halftime') {
      setPlayerMatchPhase('live')
      setMatchActionTimer(8)
      setPlayerMatch((m) => m ? { ...m, lastEvent: 'Second half underway. You carry the coach\'s adjustment into the next phase.' } : m)
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
    setSimulationEvents((current) => [{ id: Date.now(), label: 'Matchday report', detail: `${profile?.name} rated ${finalMatch.rating.toFixed(1)} in a ${result} result against ${finalMatch.opponent}.` }, ...current].slice(0, 8))
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
      <aside className="sidebar">
        <div className="brand-lockup">
          <div className="brand-mark">N<span>+</span></div>
          <div>
            <div className="brand-name">NORTHSTAR</div>
            <div className="brand-subtitle">CAREER MODE</div>
          </div>
        </div>

        <div className="season-block">
          <span className="eyebrow">SEASON {String(seasonNumber).padStart(2, '0')}</span>
          <strong>THE ASCENT</strong>
          <span className="season-progress"><i /></span>
          <small>Week {weekNumber} of 38 <b>·</b> {Math.round((weekNumber / 38) * 100)}%</small>
        </div>

        <nav className="main-nav" aria-label="Main navigation">
          <span className="nav-label">{careerMode === 'player' ? 'PLAYER DESK' : 'MANAGER DESK'}</span>
          {visibleNavItems.map((item) => (
            <button key={item.id} aria-label={item.label} title={item.label} className={`nav-item ${activeView === item.id ? 'active' : ''}`} onClick={() => setActiveView(item.id)}>
              <Icon>{item.icon}</Icon><span>{item.label}</span>{item.id === 'market' && <em>2</em>}
            </button>
          ))}
          <span className="nav-label secondary-label">{careerMode === 'player' ? 'CAREER OPERATIONS' : 'CLUB OPERATIONS'}</span>
          <button className="nav-item" onClick={() => { setActiveView('club'); showToast('Finance desk opened') }}><Icon>▦</Icon><span>Finance</span></button>
          <button className="nav-item" onClick={() => openModal('Settings')}><Icon>⚙</Icon><span>Settings</span></button>
          <button className="nav-item" onClick={resetCareer}><Icon>＋</Icon><span>New career</span></button>
        </nav>

        <div className="sidebar-bottom">
          <div className="staff-card">
            <div className="staff-avatar">MC</div>
            <div><b>Maya Chen</b><span>Sporting director</span></div>
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
          {activeView === 'hub' && (careerMode === 'player' ? <PlayerHubView profile={profile} player={selectedPlayer} clockLabel={clockLabel} simDay={simDay} playerMatchPhase={playerMatchPhase} playerMatch={playerMatch} actionTimer={matchActionTimer} matchSpeed={simulationSpeed} onSetSpeed={(s) => setSimulationSpeed(s as 0|1|2|20)} trainingProgress={trainingProgress} rivalryScore={rivalryScore} managerTrust={managerTrust} simulationEvents={simulationEvents} onAdvanceMatch={advancePlayerMatch} onMatchAction={choosePlayerMatchAction} openModal={openModal} setActiveView={setActiveView} /> : <HubView profile={profile} budget={budget} dateIndex={dateIndex} fixtureResults={fixtureResults} players={players} managerMatch={managerMatch} matchSpeed={simulationSpeed} onSetSpeed={(s) => setSimulationSpeed(s as 0|1|2|20)} onFinishMatch={() => finishManagerMatch()} onSubPlayer={(outId, inId) => { setPlayers((c) => c.map((p) => p.id === outId ? { ...p, fitness: Math.min(100, p.fitness + 15) } : p)); setManagerMatch((m) => m ? { ...m, events: [...m.events, `SUB: ${players.find((p) => p.id === inId)?.name ?? ''} replaces ${players.find((p) => p.id === outId)?.name ?? ''}`].slice(-8), playerPerformances: [...m.playerPerformances.filter((pp) => pp.id !== outId), { id: inId, rating: players.find((p) => p.id === inId)?.rating ?? 70 }] } : m); showToast('Substitution made · fresh legs on the pitch') }} continueWeek={continueWeek} openModal={openModal} setActiveView={setActiveView} />)}
          {activeView === 'player' && <PlayerHubView profile={profile} player={selectedPlayer} clockLabel={clockLabel} simDay={simDay} playerMatchPhase={playerMatchPhase} playerMatch={playerMatch} actionTimer={matchActionTimer} matchSpeed={simulationSpeed} onSetSpeed={(s) => setSimulationSpeed(s as 0|1|2|20)} trainingProgress={trainingProgress} rivalryScore={rivalryScore} managerTrust={managerTrust} simulationEvents={simulationEvents} onAdvanceMatch={advancePlayerMatch} onMatchAction={choosePlayerMatchAction} openModal={openModal} setActiveView={setActiveView} />}
          {activeView === 'squad' && <SquadView players={players} selectedPlayer={selectedPlayer} setSelectedPlayerId={setSelectedPlayerId} openModal={openModal} />}
          {activeView === 'transferHub' && <TransferHub prospects={prospects} shortlist={shortlist} transferList={transferList} loanList={loanList} blockedList={blockedList} budget={budget} transferComments={transferComments} transferReports={transferReports} onToggleShortlist={toggleShortlist} onMoveTab={movePlayerToList} onSendComment={sendTransferComment} onShowToast={showToast} />}
          {activeView === 'playerProfile' && <PlayerProfile player={selectedPlayer} setActiveView={setActiveView} onShowToast={showToast} />}
          {activeView === 'teamManagement' && <TeamManagement players={players} selectedPlayer={selectedPlayer} setSelectedPlayerId={setSelectedPlayerId} setActiveView={setActiveView} tactics={tactics} onSetTacticsView={() => setActiveView('tactics')} onSubPlayer={(outId, inId) => { setPlayers((c) => c.map((p) => p.id === outId ? { ...p, fitness: Math.min(100, p.fitness + 15) } : p)); showToast('Substitution made · fresh legs on the pitch') }} onShowToast={showToast} />}
          {activeView === 'tactics' && <TacticsView players={players} tactics={tactics} onUpdateTactics={(t) => { setTactics(t); showToast(`Tactics set: ${t.formation} · ${t.mentality}`) }} setActiveView={setActiveView} onShowToast={showToast} />}
          {activeView === 'market' && <MarketView filteredProspects={filteredProspects} search={search} setSearch={setSearch} marketFilter={marketFilter} setMarketFilter={setMarketFilter} shortlist={shortlist} scouted={scouted} negotiations={negotiations} toggleShortlist={toggleShortlist} scoutProspect={scoutProspect} startNegotiation={startNegotiation} budget={budget} openModal={openModal} />}
          {activeView === 'academy' && <AcademyView openModal={openModal} setActiveView={setActiveView} />}
          {activeView === 'club' && (careerMode === 'player' ? <PlayerClubView profile={profile} player={selectedPlayer} openModal={openModal} /> : <ClubView budget={budget} requestInvestment={requestInvestment} openModal={openModal} />)}
          {activeView === 'calendar' && <CalendarView profile={profile} dateIndex={dateIndex} fixtureResults={fixtureResults} simDay={simDay} weekNumber={weekNumber} seasonNumber={seasonNumber} />}
          {activeView === 'transfers' && <TransferOffersView profile={profile} approaches={transferApproaches} clubOffer={clubOffer} onConsider={(a) => { setActiveTransferApproach(a); setShowTransferModal(true) }} onAccept={(a) => acceptClubTransfer(a)} onDecline={(a) => declineApproach(a)}          onCounter={(a, demand) => {
            setTransferApproaches((c) => c.map((x) => x.id === a.id ? { ...x, stage: 'negotiating', counterDemand: demand, managerTrust: Math.min(100, x.managerTrust + 10), playerWage: Math.round(x.playerWage * 1.12), managerBudget: Math.round(x.managerBudget * 1.08) } : x))
            showToast(`Counter-offer submitted. ${a.clubName}'s offer improved.`)
          }} />}
          {activeView === 'training' && <TrainingView profile={profile} players={players} trainingEnergy={trainingEnergy} lastTrainingDay={lastTrainingDay} simDay={simDay} doTrainingSession={doTrainingSession} />}
          {(activeView === 'transferHub' || activeView === 'teamManagement') && (
            <div className="ea-side-ratings-wrap">
              <DynamicRatingsTicker ratings={dynamicRatings} />
            </div>
          )}
        </div>
      </main>

      <nav className="mobile-nav" aria-label="Mobile navigation">
        {visibleNavItems.map((item) => <button key={item.id} aria-label={item.label} className={activeView === item.id ? 'active' : ''} onClick={() => setActiveView(item.id)}><Icon>{item.icon}</Icon><span>{item.label}</span>{item.id === 'market' && <em>2</em>}</button>)}
      </nav>

      {toast && <div className="toast"><span className="toast-check">✓</span>{toast}</div>}
      {showTransferModal && activeTransferApproach && <TransferApproachModal approach={activeTransferApproach} profile={profile} onAccept={acceptClubTransfer} onDecline={declineApproach} onConsider={() => { setShowTransferModal(false); setActiveTransferApproach(null); setIsClockRunning(true); showToast(`You'll review ${activeTransferApproach.clubName}'s offer in your own time.`) }} onClose={() => { setShowTransferModal(false); setActiveTransferApproach(null); setIsClockRunning(true) }} />}
      {isModalOpen && <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}><div className="modal" onClick={(event) => event.stopPropagation()}><button className="modal-close" aria-label="Close dialog" onClick={() => setIsModalOpen(false)}>×</button><span className="section-kicker">NORTHSTAR DESK</span><h2>{modalTitle}</h2><p>{pendingInvestment ? 'The board will review a €2.5M capital request for your transfer runway. Confirm to apply the investment to club finances.' : 'This action is ready for your decision. Confirm to continue and keep your career moving.'}</p><div className="modal-choices"><button className="primary-button" onClick={() => { if (pendingInvestment) { setBudget((current) => current + 2500000); setPendingInvestment(false); showToast('Board investment approved · €2.5M added') } else { showToast(`${modalTitle} confirmed`) } setIsModalOpen(false) }}>Confirm action <Icon>→</Icon></button><button className="ghost-button" onClick={() => setIsModalOpen(false)}>Cancel</button></div></div></div>}
    </div>
  )
}

function ClubOffersView({ onboarding, onAccept }: { onboarding: OnboardingSave; onAccept: (offer: ClubOffer) => void }) {
  return <div className="setup-shell"><header className="setup-brand"><div className="brand-mark">N<span>+</span></div><div><b>NORTHSTAR</b><small>CAREER MODE</small></div></header><main className="setup-card offers-card"><div className="setup-intro"><span className="live-pill"><i /> CLUB OFFERS</span><span className="section-kicker">SEASON 01 · YOUR FIRST APPOINTMENT</span><h1>Club offers</h1><p>{onboarding.name}, three clubs have submitted offers for your appointment. Review each one before deciding.</p></div><div className="offer-grid">{onboarding.offers.map((offer, index) => <article className="club-offer" key={offer.id} style={{ '--offer-primary': offer.primaryColor, '--offer-secondary': offer.secondaryColor } as CSSProperties}><div className="offer-topline"><span className="offer-index">0{index + 1}</span><span className="offer-league">{offer.league}</span></div><div className="offer-crest">{offer.clubShort}</div><span className="offer-identity">{offer.identity}</span><h2>{offer.clubName}</h2><p>{offer.description}</p><div className="offer-meta"><span><b>STYLE</b>{offer.philosophy}</span><span><b>{onboarding.mode === 'manager' ? 'BUDGET' : 'PATHWAY'}</b>{onboarding.mode === 'manager' ? formatMoney(offer.managerBudget) : offer.playerRole}</span></div><div className="offer-tradeoffs"><div><b>ADVANTAGES</b>{offer.pros.map((item) => <span key={item}>+ {item}</span>)}</div><div><b>TRADE-OFFS</b>{offer.cons.map((item) => <span key={item}>− {item}</span>)}</div></div><button className="primary-button full-button" onClick={() => onAccept(offer)}>{onboarding.acceptedOffer?.id === offer.id ? 'Continue with this club' : `Accept ${offer.clubName}`} <Icon>→</Icon></button></article>)}</div><div className="setup-footer"><span>Offers are locked to this career and saved locally.</span><span>{onboarding.mode === 'manager' ? 'Manager appointment' : 'Player contract'} · Season 1</span></div></main></div>
}

function IntroductionView({ profile, offer, onContinue }: { profile: CareerProfile; offer: ClubOffer | null; onContinue: () => void }) {
  const acceptedOffer = offer ?? createLegacyClubOffer(profile)
  const isManager = profile.mode === 'manager'
  return <div className="setup-shell"><header className="setup-brand"><div className="brand-mark">N<span>+</span></div><div><b>NORTHSTAR</b><small>CAREER MODE</small></div></header><main className="setup-card introduction-card"><div className="intro-scoreboard"><span>SEASON 01</span><b>WEEK 01</b><span>{acceptedOffer.league.toUpperCase()}</span></div><div className="setup-intro"><span className="live-pill"><i /> APPOINTMENT CONFIRMED</span><span className="section-kicker">THE OPENING BRIEFING</span><h1>{isManager ? `${acceptedOffer.clubName}` : `${acceptedOffer.clubName}`}</h1><p>{isManager ? `You have been appointed manager. Expectations are clear: establish an identity and deliver results.` : `Your contract is signed. Training performance will determine how quickly you break into the first team.`}</p></div><div className="introduction-grid"><div className="introduction-club" style={{ background: `linear-gradient(135deg, ${acceptedOffer.primaryColor}, ${acceptedOffer.secondaryColor})` }}><span>{acceptedOffer.clubShort}</span><div><b>{acceptedOffer.clubName}</b><small>{acceptedOffer.identity} · {acceptedOffer.philosophy}</small></div></div><div className="introduction-brief"><span className="section-kicker">{isManager ? 'BOARD MANDATE' : 'FIRST-TEAM BRIEF'}</span><b>{isManager ? 'Make the club competitive without losing its identity.' : `Earn a role as a ${acceptedOffer.playerRole.toLowerCase()} and make every training session count.`}</b><div className="tag-row"><span>{acceptedOffer.pros[0]}</span><span>{acceptedOffer.cons[0]}</span></div></div></div><button className="primary-button setup-submit" onClick={onContinue}>Enter {acceptedOffer.clubName} <Icon>→</Icon></button><div className="setup-footer"><span>Season 1 · Week 1 · Day 1</span><span>Career state saves automatically</span></div></main></div>
}

function SetupView({ onComplete }: { onComplete: (onboarding: OnboardingSave) => void }) {
  const [mode, setMode] = useState<CareerMode>('manager')
  const [name, setName] = useState('Jules Park')
  const [league, setLeague] = useState('Premier Division')
  const [difficulty, setDifficulty] = useState('Authentic')
  const [playerPosition, setPlayerPosition] = useState<Position>('AM')

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onComplete({ mode, name: name.trim() || 'Jules Park', leaguePreference: league, difficulty, playerPosition, offers: [] })
  }

  return <div className="setup-shell"><header className="setup-brand"><div className="brand-mark">N<span>+</span></div><div><b>NORTHSTAR</b><small>CAREER MODE</small></div></header><main className="setup-card"><div className="setup-intro"><span className="live-pill"><i /> NEW CAREER</span><span className="section-kicker">SEASON 01 · THE FIRST DECISION</span><h1>New career</h1><p>Configure your role, name, and club before reviewing offers.</p></div><form onSubmit={submit}><div className="mode-toggle"><button type="button" className={mode === 'manager' ? 'active' : ''} onClick={() => setMode('manager')}><span className="setup-option-icon">◈</span><span><b>Manager Career</b><small>Run the club. Shape the squad.</small></span><i>✓</i></button><button type="button" className={mode === 'player' ? 'active' : ''} onClick={() => setMode('player')}><span className="setup-option-icon">♙</span><span><b>Player Career</b><small>Become the name on the shirt.</small></span><i>✓</i></button></div><div className="setup-grid"><label className="setup-field"><span>{mode === 'manager' ? 'MANAGER NAME' : 'PLAYER NAME'}</span><input value={name} onChange={(event) => setName(event.target.value)} placeholder={mode === 'manager' ? 'Your manager name' : 'Your player name'} maxLength={28} /></label><div className="setup-field setup-field-note"><span>CLUB APPOINTMENT</span><small>Three unique offers will be generated after setup. Each club has its own pressure, resources, and pathway.</small></div><label className="setup-field"><span>LEAGUE</span><select value={league} onChange={(event) => setLeague(event.target.value)}><option>Premier Division</option><option>Continental League</option><option>Coastal Championship</option><option>Alpine League</option></select></label>{mode === 'player' && <label className="setup-field"><span>STARTING POSITION</span><select value={playerPosition} onChange={(event) => setPlayerPosition(event.target.value as Position)}>{(['GK', 'CB', 'LB', 'RB', 'DM', 'CM', 'AM', 'LW', 'RW', 'ST'] as Position[]).map((position) => <option key={position}>{position}</option>)}</select></label>}<label className="setup-field"><span>CAREER DIFFICULTY</span><select value={difficulty} onChange={(event) => setDifficulty(event.target.value)}><option>Authentic</option><option>Competitive</option><option>Story driven</option></select></label></div><div className="club-customizer"><div><span className="setup-field-label">FIRST APPOINTMENT</span><small>Review the board brief before you accept a club.</small></div><div className="setup-option-icon">✦</div></div><button className="primary-button setup-submit" type="submit">View club offers <Icon>→</Icon></button></form><div className="setup-footer"><span>All career data is saved locally in this browser.</span><span>Fictional football universe · Season 1 kickoff</span></div></main></div>
}

function PlayerHubView({ profile, player, clockLabel, simDay, playerMatchPhase, playerMatch, actionTimer, matchSpeed, onSetSpeed, trainingProgress, rivalryScore, managerTrust, simulationEvents, onAdvanceMatch, onMatchAction, openModal, setActiveView }: { profile: CareerProfile; player: Player; clockLabel: string; simDay: number; playerMatchPhase: MatchPhase | null; playerMatch: PlayerMatch | null; actionTimer: number; matchSpeed: number; onSetSpeed: (s: number) => void; trainingProgress: number; rivalryScore: number; managerTrust: number; simulationEvents: SimulationEvent[]; onAdvanceMatch: () => void; onMatchAction: (action: 'attack' | 'compose' | 'conserve' | 'press' | 'hold' | 'risk' | 'encourage' | 'humble') => void; openModal: (title: string) => void; setActiveView: (view: View) => void }) {
  return <><PageHeader eyebrow={`PLAYER CAREER · AUG ${simDay}, 2026 · ${profile.league.toUpperCase()}`} title="Player dashboard" description={`${profile.clubName} · ${profile.playerPosition}`} action={<button className="primary-button continue-button" onClick={() => openModal('Next match preparation')}>Matchday focus <Icon>→</Icon></button>} /><div className="player-hero-grid"><section className="player-hero panel"><div className="player-hero-content"><div className="hero-topline"><span className="live-pill"><i /> PLAYER CAREER</span><span className="muted-text">{profile.clubName.toUpperCase()} · {profile.playerPosition}</span></div><h2>{profile.clubName}</h2><p>{profile.playerPosition} · {profile.league}</p><div className="player-hero-actions"><button className="light-button" onClick={() => openModal('Training plan')}>Train today <Icon>→</Icon></button><button className="hero-text-button" onClick={() => openModal('Player social feed')}>Open social feed <Icon>↗</Icon></button></div></div><div className="player-hero-rating"><span>OVR</span><strong>{player.rating}</strong><small>+2 this season</small></div></section><MatchdayPanel profile={profile} phase={playerMatchPhase} match={playerMatch} clockLabel={clockLabel} simDay={simDay} actionTimer={actionTimer} matchSpeed={matchSpeed} onSetSpeed={onSetSpeed} onAdvance={onAdvanceMatch} onAction={onMatchAction} openModal={openModal} /></div><div className="player-metric-row"><Metric label="PLAYER RATING" value={String(player.rating)} trend="+2 this season" icon="✦" accent="purple" /><Metric label="MATCH FITNESS" value={`${player.fitness}%`} trend="Peak readiness" icon="⌁" accent="cyan" /><Metric label="MANAGER TRUST" value={`${managerTrust}%`} trend="Live relationship" icon="◎" accent="lime" /><Metric label="RIVALRY" value={`${rivalryScore}`} trend="Competitive edge" icon="⚡" accent="amber" /></div><div className="player-lower-grid"><section className="panel player-progress-panel"><div className="panel-heading"><div><span className="section-kicker">PERSONAL DEVELOPMENT</span><h3>Build the complete player</h3></div><button className="text-link" onClick={() => openModal('Full development plan')}>View plan <Icon>→</Icon></button></div><div className="player-progress-profile"><div className="player-profile-avatar" style={{ background: `linear-gradient(135deg, ${profile.primaryColor}, ${profile.secondaryColor})` }}>{profile.name.split(' ').map((part) => part[0]).join('').slice(0, 2)}</div><div><b>{profile.name}</b><span>{profile.playerPosition} · {profile.clubName}</span><div className="tag-row"><span>Playmaker</span><span>Early breakthrough</span></div></div><strong>{player.potential}<small>POTENTIAL</small></strong></div><div className="development-list"><DynamicBar label="Technical" value={72} color="purple" /><DynamicBar label="Physical" value={64} color="cyan" /><DynamicBar label="Mental" value={78} color="lime" /></div><div className="training-progress-label"><span>Next training milestone</span><b>{trainingProgress}%</b></div><div className="training-progress-track"><i style={{ width: `${trainingProgress}%` }} /></div></section><section className="panel player-briefing"><div className="panel-heading"><div><span className="section-kicker">WEEKLY BRIEFING</span><h3>Next up</h3></div><button className="more-button">•••</button></div><div className="brief-item"><div className="brief-icon purple">♙</div><div><b>Training objective</b><p>Complete 2 finishing sessions</p></div><span className="brief-time">2 / 3</span></div><div className="brief-item"><div className="brief-icon amber">⚡</div><div><b>Rivalry with Rayan Kessler</b><p>Beat his rating in next 5 matches</p></div><span className="brief-time">01–00</span></div><div className="brief-item"><div className="brief-icon cyan">✦</div><div><b>Manager conversation</b><p>Discuss your first-team role</p></div><span className="brief-time">NEW</span></div>{simulationEvents.slice(0, 2).map((event) => <div className="brief-item" key={event.id}><div className="brief-icon purple">◷</div><div><b>{event.label}</b><p>{event.detail}</p></div><span className="brief-time">LIVE</span></div>)}<button className="text-link" onClick={() => setActiveView('squad')}>See club team <Icon>→</Icon></button></section></div></>
}

function MatchdayPanel({ profile, phase, match, clockLabel, simDay, actionTimer, matchSpeed, onSetSpeed, onAdvance, onAction, openModal }: { profile: CareerProfile; phase: MatchPhase | null; match: PlayerMatch | null; clockLabel: string; simDay: number; actionTimer: number; matchSpeed: number; onSetSpeed: (s: number) => void; onAdvance: () => void; onAction: (action: 'attack' | 'compose' | 'conserve' | 'press' | 'hold' | 'risk' | 'encourage' | 'humble') => void; openModal: (title: string) => void }) {
  const phaseLabel = phase === 'pre' ? 'TEAM TALK' : phase === 'live' ? `${match?.minute ?? 0}'` : phase === 'halftime' ? 'HALF-TIME' : phase === 'fulltime' ? 'FULL-TIME' : phase === 'interview' ? 'POST-MATCH' : 'NEXT APPEARANCE'
  const advanceLabel = phase === 'pre' ? 'Enter match' : phase === 'halftime' ? 'Start second half' : phase === 'fulltime' ? 'Go to interview' : 'Finish report'
  const inChoicePoint = actionTimer > 0 && (phase === 'live' || phase === 'pre' || phase === 'halftime')
  const matchNarrative = phase === 'pre' ? 'The tunnel is quiet. Studs echo on concrete. Your name is in the starting XI — now own it.'
    : phase === 'live' && match && match.minute < 15 ? 'Early feeling-out phase. The opposition is pressing in a mid-block. Space behind the full-back is there if you want it.'
    : phase === 'live' && match && match.minute < 30 ? 'The game is opening up. Midfield duels are becoming decisive. Your movement off the ball can unlock the next chance.'
    : phase === 'live' && match && match.minute < 45 ? 'Approaching half-time. Legs are heavy, minds are sharper. One moment of quality can shift the scoreline before the whistle.'
    : phase === 'halftime' ? 'The manager points at the board. One tactical adjustment. The next 45 minutes are yours to define.'
    : phase === 'live' && match && match.minute < 65 ? 'Second half intensity. The opponent is growing into the game. Your pressing triggers are crucial now.'
    : phase === 'live' && match && match.minute < 80 ? 'Final quarter. Fatigue is real but so is adrenaline. Every decision carries weight.'
    : phase === 'live' ? 'Closing stages. The crowd is on its feet. One last push.'
    : phase === 'fulltime' ? 'Full-time. The stadium gives you the final word.'
    : phase === 'interview' ? 'Cameras and microphones. The media wants your reaction.'
    : 'Your next appearance is approaching.'
  const getLiveChoices = (): { action: 'attack' | 'compose' | 'conserve' | 'press' | 'hold' | 'risk' | 'encourage' | 'humble'; label: string; sub: string }[] => {
    if (phase === 'pre') return [{ action: 'attack', label: 'Set the tone early', sub: 'Aggressive start · high energy cost' }, { action: 'compose', label: 'Feel the game out', sub: 'Patient approach · safer rating' }]
    if (phase === 'halftime') return [{ action: 'attack', label: 'Raise the tempo', sub: 'Push forward · risk + reward' }, { action: 'hold', label: 'Stay compact', sub: 'Protect shape · conserve energy' }]
    if (phase === 'fulltime' || phase === 'interview') return [{ action: 'encourage', label: 'Praise the team', sub: 'Build dressing-room morale' }, { action: 'humble', label: 'Stay grounded', sub: 'Protect your reputation' }]
    const m = match?.minute ?? 0
    if (m < 25) return [{ action: 'press', label: 'Press the full-back', sub: 'Win possession high · stamina cost' }, { action: 'compose', label: 'Keep it simple', sub: 'Short passes · build rhythm' }, { action: 'risk', label: 'Play the through ball', sub: 'High risk · chance creation' }]
    if (m < 50) return [{ action: 'attack', label: 'Run into the channel', sub: 'Stretch the defence · energy drain' }, { action: 'hold', label: 'Hold position', sub: 'Stay available · safe option' }, { action: 'risk', label: 'Take the shot', sub: 'Test the keeper · rating boost' }]
    if (m < 70) return [{ action: 'press', label: 'Track back & tackle', sub: 'Defensive shift · team player' }, { action: 'compose', label: 'Switch the play', sub: 'Open up the weak side' }, { action: 'attack', label: 'Drive into the box', sub: 'Direct run · goal threat' }]
    return [{ action: 'risk', label: 'Go for the winner', sub: 'Everything on the line' }, { action: 'hold', label: 'Secure the result', sub: 'Game management · safe' }, { action: 'press', label: 'Win the decisive duel', sub: 'One last effort · high cost' }]
  }
  const liveChoices = getLiveChoices()
  return <section className={`panel player-next-match matchday-panel ${phase ? 'matchday-active' : ''}`}>
      <div className="panel-heading"><span className="section-kicker">{phase === 'live' ? 'LIVE MATCH' : phase === 'pre' ? 'TEAM TALK' : phase === 'halftime' ? 'HALF-TIME' : phase === 'fulltime' ? 'FULL-TIME' : phase === 'interview' ? 'POST-MATCH' : 'NEXT APPEARANCE'}</span><div className="matchday-speed"><button className={`speed-button ${matchSpeed === 1 ? 'active' : ''}`} onClick={() => onSetSpeed(1)}>1×</button><button className={`speed-button ${matchSpeed === 2 ? 'active' : ''}`} onClick={() => onSetSpeed(2)}>2×</button><button className={`speed-button ${matchSpeed === 10 ? 'active' : ''}`} onClick={() => onSetSpeed(10)}>10×</button><span className="clock-mini">{phaseLabel}</span></div></div>
    {!phase && <><div className="match-date">SAT, AUG {simDay + 5} <span>· IN 5 DAYS</span></div><div className="player-matchup"><div className="club-crest" style={{ background: profile.primaryColor, color: '#172219' }}>{profile.clubShort}</div><div className="versus-copy"><strong>VS</strong><span>LEAGUE FIXTURE</span></div><div className="opponent-crest" style={{ background: '#e96a59' }}>RU</div></div><div className="match-names"><b>{profile.clubName}</b><b>Redhaven United</b></div><div className="match-location"><Icon>⌖</Icon> Riverside Ground · Away<span className="difficulty medium">MEDIUM TEST</span></div><button className="outline-button full-button" onClick={() => openModal('Matchday role')}>View expected role <Icon>→</Icon></button></>}
    {phase && match && <>
      <div className="match-scoreboard"><div><span>{profile.clubShort}</span><strong>{match.teamGoals}</strong></div><div className="score-divider">—</div><div><span>{match.opponentShort}</span><strong>{match.opponentGoals}</strong></div></div>
      <div className="matchday-status"><span>PERFORMANCE <b>{match.rating.toFixed(1)}</b></span><span>STAMINA <b>{Math.round(match.stamina)}%</b></span><span>PASSING <b>{match.passes}</b></span></div>
      <p className="matchday-narrative">{matchNarrative}</p>
      {inChoicePoint && <div className="match-timer-bar"><div className="match-timer-fill" style={{ width: `${(actionTimer / 8) * 100}%`, background: actionTimer <= 3 ? 'var(--amber)' : 'var(--cyan)' }} /><span>{actionTimer}s to decide</span></div>}
      {inChoicePoint && <div className="match-choice-grid">{liveChoices.map((c) => <button key={c.action} className="match-choice" onClick={() => onAction(c.action)}><b>{c.label}</b><small>{c.sub}</small></button>)}</div>}
      {!inChoicePoint && phase !== 'interview' && <p className="matchday-event">{match.lastEvent}</p>}
      {(phase === 'pre' || phase === 'halftime' || phase === 'fulltime') && !inChoicePoint && <button className="primary-button full-button" onClick={onAdvance}>{advanceLabel} <Icon>→</Icon></button>}
    </>}
  </section>
}

function PageHeader({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: ReactNode }) {
  return <div className="page-header"><div><span className="section-kicker">{eyebrow}</span><h1>{title}</h1><p>{description}</p></div>{action}</div>
}

function ManagerMatchdayPanel({ match, profile, players, matchSpeed, onSetSpeed, onFinish, onSubPlayer }: { match: ManagerMatch; profile: CareerProfile; players: Player[]; matchSpeed: number; onSetSpeed: (s: number) => void; onFinish: () => void; onSubPlayer: (outId: number, inId: number) => void }) {
  const tiredPlayer = match.playerPerformances.find((pp) => { const p = players.find((pl) => pl.id === pp.id); return p && p.fitness < 75 && pp.rating < (p.rating - 2) })
  const availableSubs = players.filter((p) => !match.playerPerformances.some((pp) => pp.id === p.id)).slice(0, 3)
  return <div className="manager-matchday">
    <div className="manager-match-hero">
      <div className="manager-match-header"><span className="live-pill"><i /> LIVE · {match.minute}'</span><div className="matchday-speed"><button className={`speed-button ${matchSpeed === 1 ? 'active' : ''}`} onClick={() => onSetSpeed(1)}>1×</button><button className={`speed-button ${matchSpeed === 2 ? 'active' : ''}`} onClick={() => onSetSpeed(2)}>2×</button><button className={`speed-button ${matchSpeed === 10 ? 'active' : ''}`} onClick={() => onSetSpeed(10)}>10×</button></div></div>
      <div className="manager-scoreboard"><div className="manager-club"><div className="club-crest" style={{ background: profile.primaryColor, color: '#172219' }}>{profile.clubShort}</div><b>{profile.clubName}</b></div><div className="manager-score-center"><strong>{match.teamGoals}</strong><span>—</span><strong>{match.opponentGoals}</strong></div><div className="manager-club away"><div className="opponent-crest" style={{ background: match.crest }}>{match.opponentShort}</div><b>{match.opponent}</b></div></div>
    </div>
    <div className="manager-analytics">
      <div className="analytics-card"><span>POSSESSION</span><div className="analytics-bar"><i style={{ width: `${match.possession}%`, background: match.possession > 50 ? 'var(--cyan)' : 'var(--amber)' }} /><small>{match.possession}%</small></div></div>
      <div className="analytics-card"><span>SHOTS</span><b>{match.shots} <small>vs {match.opponentShots}</small></b></div>
      <div className="analytics-card"><span>FORM INDEX</span><b className="lime-text">{players.reduce((t, p) => t + p.form, 0) / players.length | 0}</b></div>
    </div>
    <div className="manager-events">{match.events.slice(-5).map((e, i) => <div key={i} className={`event-item ${e.includes('GOAL') || e.includes('goal') ? 'event-goal' : e.includes('Half-time') ? 'event-halftime' : ''}`}>{e}</div>)}</div>
    <div className="manager-performances"><span className="section-kicker">PLAYER PERFORMANCES</span>
      <div className="perf-list">{match.playerPerformances.slice(0, 6).map((pp) => { const player = players.find((p) => p.id === pp.id); return player ? <div key={pp.id} className={`perf-row ${pp.rating > player.rating ? 'hot' : pp.rating < player.rating - 2 ? 'cold' : ''}`}><div className="player-avatar" style={{ background: player.color }}>{player.initials}</div><span>{player.name.split(' ').pop()}</span><strong>{pp.rating.toFixed(1)}</strong></div> : null })}</div>
    </div>
    {tiredPlayer && availableSubs.length > 0 && (match.minute === 45 || (match.minute > 45 && match.minute < 85)) && <div className="manager-subs"><span className="section-kicker">SUGGESTED SUBSTITUTION</span><p>{players.find((p) => p.id === tiredPlayer.id)?.name} is tiring. Fresh legs could change the game.</p><div className="sub-options">{availableSubs.slice(0, 2).map((sub) => <button key={sub.id} className="sub-button" onClick={() => onSubPlayer(tiredPlayer.id, sub.id)}><div className="player-avatar" style={{ background: sub.color }}>{sub.initials}</div><b>{sub.name}</b><small>{sub.position} · {sub.rating} OVR</small></button>)}</div></div>}
    {match.minute >= 85 && <button className="primary-button full-button" onClick={onFinish}>Final whistle <Icon>→</Icon></button>}
  </div>
}

function HubView({ profile, budget, dateIndex, fixtureResults, players, managerMatch, matchSpeed, onSetSpeed, onFinishMatch, onSubPlayer, continueWeek, openModal, setActiveView }: { profile: CareerProfile; budget: number; dateIndex: number; fixtureResults: Record<string, string>; players: Player[]; managerMatch: ManagerMatch | null; matchSpeed: number; onSetSpeed: (s: number) => void; onFinishMatch: () => void; onSubPlayer: (outId: number, inId: number) => void; continueWeek: () => void; openModal: (title: string) => void; setActiveView: (view: View) => void }) {
  const fixture = seasonFixtures[dateIndex]
  const currentResult = fixtureResults[dateIndex]
  if (managerMatch) return <ManagerMatchdayPanel match={managerMatch} profile={profile} players={players} matchSpeed={matchSpeed} onSetSpeed={onSetSpeed} onFinish={onFinishMatch} onSubPlayer={onSubPlayer} />
  return <>
    <PageHeader eyebrow={`MATCHWEEK · ${fixture.date} · ${profile.league.toUpperCase()}`} title="Matchweek" description={`${fixture.date} · ${fixture.competition} · ${fixture.home ? 'Home' : 'Away'}`} action={<button className="primary-button continue-button" onClick={continueWeek}>Continue week <Icon>→</Icon></button>} />
    <div className="hero-grid">
      <section className="club-hero panel">
        
        <div className="hero-content"><div className="hero-topline"><span className="live-pill"><i /> LIVE CAREER</span><span className="muted-text">RANKED #07 · {profile.league.toUpperCase()}</span></div><h2>{profile.clubName}</h2><p>{fixture.home ? 'Home' : 'Away'} vs {fixture.opponent} · {fixture.competition}</p><div className="hero-actions"><button className="light-button" onClick={() => setActiveView('squad')}>Set lineup <Icon>→</Icon></button><button className="hero-text-button" onClick={() => openModal('Match preview')}>View match preview <Icon>↗</Icon></button></div></div>
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
  return <><PageHeader eyebrow="SQUAD MANAGEMENT · 13 PLAYERS" title="Squad management" description={`${players.length} players · Squad rating: ${(players.reduce((t, p) => t + p.rating, 0) / players.length).toFixed(0)}`} action={<button className="outline-button" onClick={() => openModal('Team tactics')}><Icon>◎</Icon> Team tactics</button>} /><div className="squad-layout"><section className="panel squad-list-panel"><div className="squad-toolbar"><div className="filter-tabs"><button className="active">All players <span>13</span></button><button>Starting XI <span>11</span></button><button>Development <span>4</span></button></div><button className="select-button">Sort: OVR <Icon>⌄</Icon></button></div><div className="player-table"><div className="table-head"><span>PLAYER</span><span>POS</span><span>OVR</span><span>FORM</span><span>FITNESS</span><span>ROLE</span><span /></div>{players.map((player) => <button className={`player-row ${selectedPlayer.id === player.id ? 'selected' : ''}`} key={player.id} onClick={() => setSelectedPlayerId(player.id)}><div className="player-cell"><div className="player-avatar" style={{ background: player.color }}>{player.initials}</div><div><b>{player.name}</b><small>{player.age} yrs · {player.contract} yr contract</small></div></div><span className="position-chip">{player.position}</span><strong className="rating-number">{player.rating}</strong><span className={`form-value ${player.form >= 85 ? 'hot' : ''}`}><i />{player.form}</span><span className="fitness-bar"><i style={{ width: `${player.fitness}%` }} /><small>{player.fitness}%</small></span><span className="role-text">{player.role}</span><Icon>›</Icon></button>)}</div></section><PlayerDetail player={selectedPlayer} openModal={openModal} /></div></>
}

function PlayerDetail({ player, openModal }: { player: Player; openModal: (title: string) => void }) {
  return <aside className="panel player-detail"><div className="detail-cover" style={{ background: `linear-gradient(135deg, ${player.color}, #162137 78%)` }}><span className="detail-number">{String(player.id).padStart(2, '0')}</span><div className="detail-avatar">{player.initials}</div><div className="detail-name"><span>{player.position} · {player.age} YEARS</span><h2>{player.name}</h2><small>Northstar FC · Since 2024</small></div></div><div className="detail-body"><div className="detail-rating"><div><span>OVERALL</span><strong>{player.rating}</strong></div><div><span>POTENTIAL</span><strong className="potential">{player.potential}</strong></div><div><span>MARKET VALUE</span><strong>{formatMoney(player.value)}</strong></div></div><div className="detail-section"><div className="detail-section-title"><b>Dynamic OVR</b><span className="positive">+3 this month</span></div><div className="dynamic-bars"><DynamicBar label="Form" value={player.form} color="purple" /><DynamicBar label="Morale" value={player.morale} color="lime" /><DynamicBar label="Match fitness" value={player.fitness} color="cyan" /></div></div><div className="detail-section attributes"><div className="detail-section-title"><b>Key attributes</b><button className="text-link">Full profile <Icon>→</Icon></button></div><div className="attribute-grid"><span>PACE <b>{player.position === 'ST' ? 91 : 78}</b></span><span>SHOOTING <b>{player.position === 'ST' ? 94 : 69}</b></span><span>PASSING <b>{player.position === 'ST' ? 78 : 84}</b></span><span>DEFENDING <b>{player.position === 'CB' ? 88 : 42}</b></span></div></div><div className="detail-actions"><button className="primary-button" onClick={() => openModal(`Develop ${player.name}`)}>Set development <Icon>→</Icon></button><button className="square-button" onClick={() => openModal(`Player actions: ${player.name}`)}>•••</button></div></div></aside>
}

function DynamicBar({ label, value, color }: { label: string; value: number; color: string }) {
  return <div className="dynamic-row"><div><span>{label}</span><b>{value}</b></div><div className="dynamic-track"><i className={color} style={{ width: `${value}%` }} /></div></div>
}

function MarketView({ filteredProspects, search, setSearch, marketFilter, setMarketFilter, shortlist, scouted, negotiations, toggleShortlist, scoutProspect, startNegotiation, budget, openModal }: { filteredProspects: Prospect[]; search: string; setSearch: (value: string) => void; marketFilter: 'All' | 'Shortlist' | 'Scouted'; setMarketFilter: (value: 'All' | 'Shortlist' | 'Scouted') => void; shortlist: number[]; scouted: number[]; negotiations: number[]; toggleShortlist: (id: number) => void; scoutProspect: (id: number) => void; startNegotiation: (id: number) => void; budget: number; openModal: (title: string) => void }) {
  return <><PageHeader eyebrow="TRANSFER HUB · WINDOW OPEN" title="Transfer hub" description={`Budget: ${formatMoney(budget)} · Window open`} action={<div className="budget-pill"><span>AVAILABLE TO SPEND</span><b>{formatMoney(budget)}</b><Icon>€</Icon></div>} /><div className="market-toolbar panel"><div className="market-tabs"><button className={marketFilter === 'All' ? 'active' : ''} onClick={() => setMarketFilter('All')}>Discover <span>24</span></button><button className={marketFilter === 'Shortlist' ? 'active' : ''} onClick={() => setMarketFilter('Shortlist')}>Shortlist <span>{shortlist.length}</span></button><button className={marketFilter === 'Scouted' ? 'active' : ''} onClick={() => setMarketFilter('Scouted')}>Reports ready <span>{scouted.length}</span></button></div><label className="search-box"><Icon>⌕</Icon><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search player, position or club" /><kbd>⌘ K</kbd></label><button className="filter-button" onClick={() => openModal('Advanced filters')}><Icon>≡</Icon> Filters <span>2</span></button></div><div className="market-summary"><div><b>{filteredProspects.length === 0 ? 'No' : filteredProspects.length}</b><span>targets matching your profile</span></div><div className="summary-separator" /><div><span>Recruitment brief</span><b className="brief-tag">U21 · high potential · attack</b></div><button className="text-link" onClick={() => openModal('Recruitment brief')}>Edit brief <Icon>→</Icon></button></div><div className="prospect-grid">{filteredProspects.map((prospect) => <ProspectCard key={prospect.id} prospect={prospect} isShortlisted={shortlist.includes(prospect.id)} isScouted={scouted.includes(prospect.id)} isNegotiating={negotiations.includes(prospect.id)} toggleShortlist={toggleShortlist} scoutProspect={scoutProspect} startNegotiation={startNegotiation} />)}</div>{filteredProspects.length === 0 && <div className="empty-state panel"><div>⌕</div><h3>No targets found</h3><p>Try a wider search or switch back to Discover.</p></div>}</>
}

function ProspectCard({ prospect, isShortlisted, isScouted, isNegotiating, toggleShortlist, scoutProspect, startNegotiation }: { prospect: Prospect; isShortlisted: boolean; isScouted: boolean; isNegotiating: boolean; toggleShortlist: (id: number) => void; scoutProspect: (id: number) => void; startNegotiation: (id: number) => void }) {
  return <article className="prospect-card panel"><div className="prospect-top"><span className="prospect-id">SCOUT 0{prospect.id - 100}</span><button className={`star-button ${isShortlisted ? 'starred' : ''}`} onClick={() => toggleShortlist(prospect.id)} aria-label="Toggle shortlist">★</button></div><div className="prospect-portrait" style={{ background: `linear-gradient(140deg, ${prospect.color}, #1a2740)` }}><span>{prospect.name.split(' ').map((word) => word[0]).join('')}</span><div className="country-badge">{prospect.flag}</div></div><div className="prospect-main"><div className="prospect-title"><div><h3>{prospect.name}</h3><span>{prospect.club} · {prospect.age} yrs</span></div><b className="prospect-rating">{prospect.rating}</b></div><div className="prospect-meta"><span className="position-chip">{prospect.position}</span><span><small>POTENTIAL</small><b>{prospect.potential}</b></span><span><small>VALUE</small><b>{prospect.value}</b></span></div><div className="tag-row">{prospect.tags.map((tag) => <span key={tag}>{tag}</span>)}</div><div className="interest-row"><span>PLAYER INTEREST</span><strong className={prospect.interest === 'Very high' ? 'very-high' : ''}><i />{prospect.interest}</strong></div></div><div className="prospect-actions"><button className="outline-button" onClick={() => scoutProspect(prospect.id)}>{isScouted ? 'Report ready' : 'Request report'} <Icon>{isScouted ? '✓' : '→'}</Icon></button><button className="primary-button" onClick={() => startNegotiation(prospect.id)}>{isNegotiating ? 'Negotiating' : 'Enquire'} <Icon>{isNegotiating ? '✓' : '↗'}</Icon></button></div></article>
}

function AcademyView({ openModal, setActiveView }: { openModal: (title: string) => void; setActiveView: (view: View) => void }) {
  return <><PageHeader eyebrow="NORTHSTAR ACADEMY · 6 PLAYERS" title="Academy" description="6 youth players · Ranking: 4th of 18" action={<button className="primary-button" onClick={() => openModal('Youth tournament')}>Enter tournament <Icon>→</Icon></button>} /><div className="academy-hero panel"><div className="academy-copy"><span className="live-pill purple-pill">✦ ACADEMY SPOTLIGHT</span><h2>Academy spotlight</h2><p>Top prospects in the development pipeline. Performance data updates weekly.</p><div className="academy-progress"><div><span>ACADEMY RANKING</span><b>04 <small>of 18</small></b></div><div className="progress-track"><i /></div><small>Top 3 earns an invite to the National Youth Series</small></div></div><div className="academy-player"><div className="academy-portrait">IS</div><span className="academy-rating">68 <small>OVR</small></span><div className="academy-player-name"><span>U18 · CAM</span><b>Imani Sol</b><small>Scout confidence: high</small></div></div></div><div className="academy-grid"><section className="panel youth-list"><div className="panel-heading"><div><span className="section-kicker">YOUTH PIPELINE</span><h3>Players to watch</h3></div><button className="text-link" onClick={() => openModal('Full academy list')}>View all <Icon>→</Icon></button></div><YouthRow name="Imani Sol" detail="CAM · 17 yrs" rating="68" status="Breakthrough ready" color="#df7e68" progress={88} /><YouthRow name="Luca Neri" detail="LB · 16 yrs" rating="62" status="Building momentum" color="#769ddc" progress={61} /><YouthRow name="Sami Okafor" detail="ST · 15 yrs" rating="55" status="Early development" color="#5eb59c" progress={34} /></section><section className="panel academy-actions"><div className="panel-heading"><div><span className="section-kicker">PROGRAMS</span><h3>Shape the future</h3></div></div><button className="program-card" onClick={() => openModal('Academy coaching')}><span className="program-icon purple">♙</span><span><b>Coach assignments</b><small>3 staff available · 2 open roles</small></span><Icon>→</Icon></button><button className="program-card" onClick={() => openModal('Youth recruitment')}><span className="program-icon amber">⌕</span><span><b>Expand recruitment</b><small>Explore a new regional network</small></span><Icon>→</Icon></button><button className="program-card" onClick={() => setActiveView('squad')}><span className="program-icon cyan">↗</span><span><b>Promote a player</b><small>Move a prospect to senior training</small></span><Icon>→</Icon></button></section></div></>
}

function YouthRow({ name, detail, rating, status, color, progress }: { name: string; detail: string; rating: string; status: string; color: string; progress: number }) {
  return <div className="youth-row"><div className="youth-avatar" style={{ background: color }}>{name.split(' ').map((word) => word[0]).join('')}</div><div className="youth-name"><b>{name}</b><small>{detail}</small></div><strong>{rating}</strong><div className="youth-progress"><span>{status}</span><div><i style={{ width: `${progress}%` }} /></div></div><Icon>›</Icon></div>
}

function PlayerClubView({ profile, player, openModal }: { profile: CareerProfile; player: Player; openModal: (title: string) => void }) {
  return <><PageHeader eyebrow="PLAYER CAREER · CLUB LIFE" title="Club life" description={`${profile.clubName} · ${profile.playerPosition} · Contract: 4 years`} action={<button className="outline-button" onClick={() => openModal('Contract conversation')}><Icon>◎</Icon> Contract talk</button>} /><div className="player-club-grid"><section className="panel contract-card"><div className="panel-heading"><div><span className="section-kicker">YOUR DEAL</span><h3>Make the next move count.</h3></div><span className="finance-health">SECURE</span></div><div className="contract-player"><div className="player-profile-avatar" style={{ background: `linear-gradient(135deg, ${profile.primaryColor}, ${profile.secondaryColor})` }}>{profile.name.split(' ').map((part) => part[0]).join('').slice(0, 2)}</div><div><b>{profile.name}</b><small>{profile.playerPosition} · {profile.clubName}</small></div><strong>{formatMoney(player.wage)}<small>PER WEEK</small></strong></div><div className="contract-grid"><div><span>CONTRACT</span><b>4 years</b></div><div><span>ROLE</span><b>Rotation</b></div><div><span>RELEASE VALUE</span><b>{formatMoney(player.value)}</b></div><div><span>MANAGER TRUST</span><b className="lime-text">74%</b></div></div><button className="primary-button full-button" onClick={() => openModal('Contract conversation')}>Discuss your role <Icon>→</Icon></button></section><section className="panel relationships-card"><div className="panel-heading"><div><span className="section-kicker">DRESSING ROOM</span><h3>People who shape your season</h3></div></div><div className="relationship-row"><div className="relationship-avatar" style={{ background: '#f07f5e' }}>NB</div><div><b>Nico Bellori</b><small>Training partner · CM</small></div><span className="relationship-score positive">86</span></div><div className="relationship-row"><div className="relationship-avatar" style={{ background: '#8a7dff' }}>RK</div><div><b>Rayan Kessler</b><small>Rival · CB</small></div><span className="relationship-score rival">63</span></div><div className="relationship-row"><div className="relationship-avatar" style={{ background: '#e8b74c' }}>LS</div><div><b>Lio Santoro</b><small>Senior mentor · AM</small></div><span className="relationship-score positive">79</span></div><button className="text-link" onClick={() => openModal('Social choices')}>Open social choices <Icon>→</Icon></button></section><section className="panel club-standing-card"><span className="section-kicker">CLUB STANDING</span><h2>{profile.clubName}</h2><p>You are currently competing for a place in the matchday squad. Your next objective is simple: complete 3 strong training sessions before selection.</p><div className="standing-track"><i style={{ width: '68%' }} /></div><div className="standing-footer"><span>ROTATION PLAYER</span><b>68% to first-team lock</b></div></section></div></>
}

function ClubView({ budget, requestInvestment, openModal }: { budget: number; requestInvestment: () => void; openModal: (title: string) => void }) {
  return <><PageHeader eyebrow="CLUB VISION · 2026—2030" title="Club vision" description={`Board confidence: 86% · Financial status: Healthy`} action={<button className="outline-button" onClick={() => openModal('Club roadmap')}><Icon>▦</Icon> Roadmap</button>} /><div className="vision-grid"><section className="panel vision-card primary-vision"><div className="vision-number">01</div><span className="section-kicker">BOARD MANDATE</span><h2>Board mandate</h2><p>Qualify for continental competition while maintaining youth development standards. The board supports the current strategy.</p><div className="objective-score"><div><span>BOARD CONFIDENCE</span><b>86%</b></div><div className="score-track"><i /></div><small>+12 since the start of the season</small></div></section><section className="panel finance-card"><div className="panel-heading"><div><span className="section-kicker">FINANCIAL CONTROL</span><h3>Every choice compounds.</h3></div><span className="finance-health">HEALTHY</span></div><div className="finance-total"><span>TRANSFER BALANCE</span><strong>{formatMoney(budget)}</strong><small>Updated after last window activity</small></div><div className="finance-bars"><FinanceBar label="Squad wages" value="€1.84M" percent={64} color="purple" /><FinanceBar label="Scouting network" value="€420K" percent={28} color="cyan" /><FinanceBar label="Facilities" value="€680K" percent={42} color="amber" /></div><button className="outline-button full-button" onClick={requestInvestment}>Request board investment <Icon>→</Icon></button></section><section className="panel values-card"><div className="panel-heading"><div><span className="section-kicker">CLUB DNA</span><h3>What we stand for</h3></div><button className="more-button">•••</button></div><div className="value-row"><span className="value-symbol purple">✦</span><div><b>Brave football</b><small>Possession with purpose</small></div><strong>92</strong></div><div className="value-row"><span className="value-symbol lime">♙</span><div><b>Grow our own</b><small>Academy pathway first</small></div><strong>87</strong></div><div className="value-row"><span className="value-symbol amber">◈</span><div><b>One city, one club</b><small>Community always</small></div><strong>95</strong></div></section></div></>
}

function FinanceBar({ label, value, percent, color }: { label: string; value: string; percent: number; color: string }) {
  return <div className="finance-bar"><div><span>{label}</span><b>{value}</b></div><div className="finance-track"><i className={color} style={{ width: `${percent}%` }} /></div></div>
}

function CalendarView({ profile, dateIndex, fixtureResults, simDay, weekNumber, seasonNumber }: { profile: CareerProfile; dateIndex: number; fixtureResults: Record<number, string>; simDay: number; weekNumber: number; seasonNumber: number }) {
  const MONTHS = ['AUG', 'SEP', 'OCT', 'NOV', 'DEC', 'JAN', 'FEB', 'MAR', 'APR', 'MAY']
  const WEEKDAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']
  const currentMonthIndex = Math.min(MONTHS.length - 1, Math.max(0, Math.floor((weekNumber - 1) / 4.2)))
  const [viewMonth, setViewMonth] = useState(currentMonthIndex)
  const currentMonthLabel = `${MONTHS[viewMonth]} 2026`
  const isViewingCurrentMonth = viewMonth === currentMonthIndex
  const monthStartOffset = (viewMonth * 3) % 7
  // Compute which weeks fall in this view month
  const monthFixtureIndices: { fixtureIndex: number; approxDay: number }[] = []
  for (let week = 0; week < 38; week++) {
    const monthForWeek = Math.floor(week / 4.2)
    if (monthForWeek === viewMonth) {
      const weekInMonth = week - Math.floor(viewMonth * 4.2)
      const matchDay = (7 + weekInMonth * 7) % 28
      if (matchDay === 0) monthFixtureIndices.push({ fixtureIndex: week, approxDay: 28 })
      else monthFixtureIndices.push({ fixtureIndex: week, approxDay: Math.max(1, Math.min(28, matchDay)) })
    }
  }
  const getDayCell = (day: number) => {
    const matchForDay = monthFixtureIndices.find((m) => m.approxDay === day)
    const fixture = matchForDay !== undefined ? seasonFixtures[matchForDay.fixtureIndex] : null
    const result = matchForDay !== undefined ? fixtureResults[matchForDay.fixtureIndex] : null
    const isMatchDay = Boolean(fixture)
    const isCompleted = Boolean(result)
    // Compute which week this day falls in: first week of the month starts at viewMonth*4.2+1
    const dayWeek = Math.floor(viewMonth * 4.2 + 1 + Math.floor((day - 1 + monthStartOffset) / 7))
    const isToday = isViewingCurrentMonth && dayWeek === weekNumber && simDay === day
    const isDeadline = day === 14 || day === 28
    const isPast = dayWeek < weekNumber || (dayWeek === weekNumber && simDay > day)
    let cellClass = 'calendar-day'
    if (isToday) cellClass += ' today'
    if (isMatchDay && isCompleted) cellClass += ' match-completed'
    if (isMatchDay && !isCompleted && !isPast) cellClass += ' match-upcoming'
    if (isMatchDay && !isCompleted && isPast) cellClass += ' match-past'
    if (isDeadline && !isPast) cellClass += ' deadline'
    if (isDeadline && isPast) cellClass += ' deadline-past'
    if (isToday && !isMatchDay && !isDeadline) cellClass += ' training'
    if (isPast && !isMatchDay && !isDeadline && !isToday) cellClass += ' past'
    return { cellClass, fixture, result, isMatchDay, isCompleted, isToday, isDeadline, isPast }
  }
  const legendItems = [
    { label: 'Matchday', cls: 'match-upcoming', dot: '◉' },
    { label: 'Completed', cls: 'match-completed', dot: '✓' },
    { label: 'Training', cls: 'training-sample', dot: '◌' },
    { label: 'Deadline', cls: 'deadline', dot: '⟁' },
    { label: 'Today', cls: 'today', dot: '◉' },
  ]
  return <>
    <PageHeader eyebrow={`CALENDAR · ${currentMonthLabel} · SEASON ${String(seasonNumber).padStart(2, '0')}`} title="Calendar" description={`${currentMonthLabel} · Season ${String(seasonNumber).padStart(2, '0')} · ${profile.clubName}`} action={<div className="calendar-nav"><button className="outline-button" onClick={() => setViewMonth(Math.max(0, viewMonth - 1))} disabled={viewMonth === 0}><Icon>←</Icon> Prev</button><button className="primary-button" onClick={() => setViewMonth(currentMonthIndex)} disabled={isViewingCurrentMonth}>{isViewingCurrentMonth ? 'Current' : 'Jump to today'} <Icon>◷</Icon></button><button className="outline-button" onClick={() => setViewMonth(Math.min(MONTHS.length - 1, viewMonth + 1))} disabled={viewMonth === MONTHS.length - 1}>Next <Icon>→</Icon></button></div>} />
    <div className="calendar-panel panel">
      <div className="calendar-legend">{legendItems.map((item) => <span key={item.label}><i className={`legend-sample ${item.cls}`}>{item.dot}</i>{item.label}</span>)}</div>
      <div className="calendar-weekdays">{WEEKDAYS.map((wd) => <span key={wd}>{wd}</span>)}</div>
      <div className="calendar-grid">
        {Array.from({ length: monthStartOffset }).map((_, i) => <div key={`empty-${i}`} className="calendar-day empty" />)}
        {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => {
          const { cellClass, fixture, result, isMatchDay, isDeadline, isToday } = getDayCell(day)
          return <div key={day} className={cellClass} title={fixture ? `${fixture.opponent}${result ? ` · ${result}` : ''}${isToday ? ' · TODAY' : ''}` : isDeadline ? `Transfer deadline${isToday ? ' · TODAY' : ''}` : isToday ? 'Today · Training' : ''}>
            <span className="day-num">{day}</span>
            {isMatchDay && fixture && <span className="day-badge match-badge" style={{ background: fixture.crest }}>{fixture.short}{result ? ` ${result}` : ''}</span>}
            {isDeadline && <span className="day-badge deadline-badge">{day === 14 ? 'Window opens' : 'Deadline day'}</span>}
            {isToday && !isMatchDay && !isDeadline && <span className="day-badge today-badge">Training</span>}
          </div>
        })}
      </div>
    </div>
    <div className="calendar-side-panels">
      <section className="panel calendar-fixtures">
        <div className="panel-heading"><div><span className="section-kicker">THIS MONTH</span><h3>Upcoming fixtures</h3></div></div>
        {monthFixtureIndices.filter((m) => !fixtureResults[m.fixtureIndex]).slice(0, 5).map((m) => {
          const f = seasonFixtures[m.fixtureIndex]
          return <div className="brief-item" key={m.fixtureIndex}><div className="brief-icon purple">◉</div><div><b>{f.opponent}</b><p>{f.competition} · {f.home ? 'Home' : 'Away'} · Week {m.fixtureIndex + 1}</p></div><span className={`difficulty ${f.difficulty.toLowerCase()}`}>{f.difficulty}</span></div>
        })}
        {monthFixtureIndices.filter((m) => !fixtureResults[m.fixtureIndex]).length === 0 && <div className="empty-state"><h3>No upcoming fixtures</h3><p>All matches this month have been resolved.</p></div>}
      </section>
      <section className="panel calendar-results">
        <div className="panel-heading"><div><span className="section-kicker">RECENT</span><h3>Results this month</h3></div></div>
        {monthFixtureIndices.filter((m) => fixtureResults[m.fixtureIndex]).slice(0, 5).map((m) => {
          const f = seasonFixtures[m.fixtureIndex]
          const r = fixtureResults[m.fixtureIndex]
          return <div className="brief-item" key={m.fixtureIndex}><div className="brief-icon lime">✓</div><div><b>{f.short} {r}</b><p>{f.competition} · Week {m.fixtureIndex + 1}</p></div><span className="brief-time">FINAL</span></div>
        })}
        {monthFixtureIndices.filter((m) => fixtureResults[m.fixtureIndex]).length === 0 && <div className="empty-state"><h3>No results yet</h3><p>Your first match result this month will appear here.</p></div>}
      </section>
    </div>
  </>
}

function TransferApproachModal({ approach, profile, onAccept, onDecline, onConsider, onClose }: { approach: TransferApproach; profile: CareerProfile; onAccept: (a: TransferApproach) => void; onDecline: (a: TransferApproach) => void; onConsider: (a: TransferApproach) => void; onClose: () => void }) {
  return <div className="modal-backdrop" onClick={onClose}><div className="modal transfer-modal" onClick={(e) => e.stopPropagation()} style={{ '--offer-primary': approach.primaryColor, '--offer-secondary': approach.secondaryColor } as CSSProperties}><button className="modal-close" onClick={onClose}>×</button><div className="transfer-modal-header" style={{ background: `linear-gradient(135deg, ${approach.primaryColor}, ${approach.secondaryColor})` }}><span className="live-pill"><i /> OFFICIAL APPROACH</span><div className="transfer-modal-crest">{approach.clubShort}</div><h2>{approach.clubName}</h2><p>{approach.identity}</p></div><div className="transfer-modal-body"><div className="transfer-storyline"><span className="section-kicker">THE APPROACH</span><p>{approach.storyline}</p></div><div className="transfer-perks"><div className="transfer-perk-column"><span className="section-kicker">PERKS</span>{approach.perks.map((p) => <div key={p} className="transfer-perk-item positive">+ {p}</div>)}</div><div className="transfer-perk-column"><span className="section-kicker">RISKS</span>{approach.risks.map((r) => <div key={r} className="transfer-perk-item risk">− {r}</div>)}</div></div><div className="transfer-comparison"><div className="transfer-club-comp current"><span>{profile.clubShort}</span><small>Current · {profile.league}</small></div><Icon className="transfer-arrow">→</Icon><div className="transfer-club-comp next"><span>{approach.clubShort}</span><small>{approach.league}</small></div></div><div className="transfer-meta-grid"><span><b>{profile.mode === 'manager' ? 'BUDGET' : 'WAGE'}</b>{profile.mode === 'manager' ? formatMoney(approach.managerBudget) : formatMoney(approach.playerWage) + '/wk'}</span><span><b>ROLE</b>{approach.playerRole}</span><span><b>TRAINING</b>{approach.playerTraining}/100</span><span><b>TRUST</b>{approach.managerTrust}%</span></div></div><div className="transfer-modal-footer"><button className="primary-button" onClick={() => { onAccept(approach) }}>Accept & join {approach.clubShort} <Icon>→</Icon></button><button className="outline-button" onClick={() => { onConsider(approach) }}>Consider later</button><button className="ghost-button" onClick={() => { onDecline(approach) }}>Decline</button></div></div></div>
}

function TransferOffersView({ profile, approaches, clubOffer, onConsider, onAccept, onDecline, onCounter }: { profile: CareerProfile; approaches: TransferApproach[]; clubOffer: ClubOffer | null; onConsider: (a: TransferApproach) => void; onAccept: (a: TransferApproach) => void; onDecline: (a: TransferApproach) => void; onCounter: (a: TransferApproach, demand: string) => void }) {
  const active = approaches.filter((a) => a.stage !== 'declined' && a.stage !== 'accepted')
  const decided = approaches.filter((a) => a.stage === 'declined' || a.stage === 'accepted')
  return <><PageHeader eyebrow={`TRANSFER DESK · ${profile.clubName.toUpperCase()}`} title="Transfer desk" description={`Active approaches · ${profile.mode === 'manager' ? 'Manager' : 'Player'} market`} action={<button className="outline-button" onClick={() => {}}><Icon>↔</Icon> Agent: Maya Chen</button>} /><div className="transfer-active-section">{active.length === 0 ? <div className="empty-state panel"><div>↔</div><h3>No active approaches</h3><p>Clubs will make approaches as your reputation grows. Keep performing and the calls will come.</p></div> : active.map((approach) => <article className="transfer-offer-card panel" key={approach.id}><div className="transfer-offer-top"><div className="transfer-offer-crest" style={{ background: `linear-gradient(135deg, ${approach.primaryColor}, ${approach.secondaryColor})` }}>{approach.clubShort}</div><div className="transfer-offer-info"><span className="section-kicker">{approach.stage.toUpperCase()}</span><h3>{approach.clubName}</h3><p>{approach.identity} · {approach.league}</p></div><span className={`difficulty ${approach.managerTrust > 75 ? 'low' : approach.managerTrust > 60 ? 'medium' : 'high'}`}>{approach.managerTrust > 75 ? 'Warm interest' : approach.managerTrust > 60 ? 'Formal bid' : 'Urgent pursuit'}</span></div><p className="transfer-offer-narrative">{approach.storyline}</p><div className="transfer-offer-perks"><span className="section-kicker">WHAT THEY OFFER</span><div className="tag-row">{approach.perks.map((p) => <span key={p}>{p}</span>)}</div></div><div className="transfer-offer-meta"><span><b>{profile.mode === 'manager' ? 'BUDGET' : 'WAGE'}</b>{profile.mode === 'manager' ? formatMoney(approach.managerBudget) : formatMoney(approach.playerWage) + '/wk'}</span><span><b>ROLE</b>{approach.playerRole}</span><span><b>TRAINING</b>{approach.playerTraining}</span><span><b>TRUST</b>{approach.managerTrust}%</span></div>{approach.stage === 'negotiating' && <div className="transfer-counter"><span className="section-kicker">YOUR DEMAND</span><p>{approach.counterDemand || 'No demand submitted yet.'}</p></div>}<div className="transfer-offer-actions"><button className="primary-button" onClick={() => { onAccept(approach) }}>Accept <Icon>→</Icon></button><button className="outline-button" onClick={() => { onCounter(approach, `Improved ${profile.mode === 'manager' ? 'budget by 15%' : 'wages and role'} requested`) }}>{approach.stage === 'negotiating' ? 'Re-counter' : 'Negotiate'} <Icon>↔</Icon></button><button className="ghost-button" onClick={() => { onDecline(approach) }}>Decline</button></div></article>)}</div>{decided.length > 0 && <><div className="transfer-history-header"><span className="section-kicker">ARCHIVED</span></div><div className="transfer-history">{decided.map((approach) => <div className="brief-item" key={approach.id}><div className={`brief-icon ${approach.stage === 'accepted' ? 'lime' : 'purple'}`}>{approach.stage === 'accepted' ? '✓' : '✕'}</div><div><b>{approach.clubName}</b><p>{approach.stage === 'accepted' ? 'Transfer completed' : 'Approach declined'} · Week {approach.arrivalWeek}</p></div><span className="brief-time">{approach.stage === 'accepted' ? 'DONE' : 'CLOSED'}</span></div>)}</div></>}</>
}

function TrainingView({ profile, players, trainingEnergy, lastTrainingDay, simDay, doTrainingSession }: { profile: CareerProfile; players: Player[]; trainingEnergy: number; lastTrainingDay: number; simDay: number; doTrainingSession: (s: TrainingSession) => void }) {
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
        <div className="training-skill-list">{skillList.map((s) => <div key={s.key} className="training-skill-row"><div className="training-skill-icon" style={{ background: `var(--${s.color})`, opacity: .18 }}><Icon>{s.icon}</Icon></div><div className="training-skill-info"><span>{s.label}</span><b>{skills[s.key]}</b><div className="training-skill-track"><i style={{ width: `${skills[s.key]}%`, background: `var(--${s.color})` }} /></div></div></div>)}</div>
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

function LandingPage({ onEnter, onDocs, hasSavedCareer, onContinue }: { onEnter: () => void; onDocs: () => void; hasSavedCareer: boolean; onContinue: () => void }) {
  return <div className="landing-shell">
    <nav className="landing-nav"><span className="landing-logo">◈</span><b>Northstar FC</b><button className="ghost-button" onClick={onDocs}>Docs</button></nav>
    <main className="landing-main">
      <div className="landing-hero">
        <span className="section-kicker">Career mode simulation</span>
        <h1>Run the club.<br />Write the story.</h1>
        <p>Manage a squad, navigate the transfer market, develop youth talent, and make every matchday count. Northstar FC is a deep, offline-first football management simulation.</p>
        <div className="landing-actions">
          <button className="primary-button landing-cta" onClick={onEnter}>New career <Icon>→</Icon></button>
          {hasSavedCareer && <button className="outline-button" onClick={onContinue}>Continue career <Icon>↗</Icon></button>}
        </div>
      </div>
      <div className="landing-features">
        <div className="landing-feature"><span className="feature-icon">♙</span><div><b>Squad management</b><p>13-player squad with individual attributes, form tracking, and development plans.</p></div></div>
        <div className="landing-feature"><span className="feature-icon">↗</span><div><b>Transfer market</b><p>Scout prospects, negotiate contracts, and build your shortlist across leagues.</p></div></div>
        <div className="landing-feature"><span className="feature-icon">◷</span><div><b>Season calendar</b><p>Full 10-month calendar with matchdays, transfer windows, and training blocks.</p></div></div>
        <div className="landing-feature"><span className="feature-icon">✦</span><div><b>Youth academy</b><p>Develop young talent through coaching programs and promotion pathways.</p></div></div>
        <div className="landing-feature"><span className="feature-icon">⚡</span><div><b>Live matchday</b><p>Real-time match simulation with tactical choices, substitutions, and analytics.</p></div></div>
      </div>
    </main>
    <footer className="landing-footer"><span>Offline-first · Auto-saves locally · No accounts required</span><span>v0.1 · Built with React + TypeScript</span></footer>
  </div>
}

function DocsPage({ onBack }: { onBack: () => void }) {
  return <div className="landing-shell">
    <nav className="landing-nav"><span className="landing-logo">◈</span><b>Northstar FC</b><button className="ghost-button" onClick={onBack}>← Back</button></nav>
    <main className="docs-main">
      <h1>Documentation</h1>
      <section className="docs-section">
        <h3>Getting started</h3>
        <p>Choose between Manager Career (run the club, manage finances, control transfers) or Player Career (develop your pro, train skills, earn a starting role). Three club offers are generated based on your league preference — each with unique budgets, expectations, and pathways.</p>
      </section>
      <section className="docs-section">
        <h3>Manager career</h3>
        <p>Control the squad, manage a transfer budget, scout prospects, develop the academy, and make tactical decisions on matchday. Board confidence, financial health, and club DNA all respond to your choices. Matches simulate in real time with live analytics, substitutions, and speed controls.</p>
      </section>
      <section className="docs-section">
        <h3>Player career</h3>
        <p>Train five core skills (pace, shooting, passing, dribbling, physical) through daily sessions with an energy system. Build relationships in the dressing room, respond to transfer approaches, and make split-second matchday choices. Every training session and match decision shapes your rating and career trajectory.</p>
      </section>
      <section className="docs-section">
        <h3>Simulation & saving</h3>
        <p>The game clock runs in real time at adjustable speeds (1×, 2×, 20×). A 28-day month cycle drives fixture scheduling, training regeneration, and transfer events. All progress saves automatically to your browser's local storage — no server, no account, no internet required.</p>
      </section>
    </main>
    <footer className="landing-footer"><span>Offline-first · Auto-saves locally · No accounts required</span><span>v0.1 · Built with React + TypeScript</span></footer>
  </div>
}

export default App
