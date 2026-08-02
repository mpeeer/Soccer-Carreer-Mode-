import type { SaveStatus, CareerProfile, ClubOffer, OnboardingSave, Player, PlayerSkills, PlayerMatch, MatchPhase, SimulationEvent, View, TransferApproach, SavedCareer, SavedCareerEnvelope, Position } from './types'
import { SAVE_KEY, PROFILE_KEY, ONBOARDING_KEY, LEGACY_SAVE_BACKUP_KEY, CURRENT_SAVE_VERSION, validPositions, initialPlayers, seasonFixtures, randomSkillsForPosition } from './data'

// ── Number helper ──
export function boundedNumber(value: unknown, fallback: number, min: number, max: number) {
  return typeof value === 'number' && Number.isFinite(value) ? Math.max(min, Math.min(max, value)) : fallback
}

// ── Type validators ──
export function isSavedCareerEnvelope(value: unknown): value is SavedCareerEnvelope {
  if (!value || typeof value !== 'object') return false
  const envelope = value as Partial<SavedCareerEnvelope>
  return (envelope.version === 1 || envelope.version === CURRENT_SAVE_VERSION) && typeof envelope.savedAt === 'number' && Number.isFinite(envelope.savedAt) && Boolean(envelope.career)
}

export function isSavedClubOffer(value: unknown): value is ClubOffer {
  if (!value || typeof value !== 'object') return false
  const offer = value as Partial<ClubOffer>
  return typeof offer.id === 'string' && typeof offer.clubName === 'string' && typeof offer.clubShort === 'string' && typeof offer.league === 'string' && typeof offer.identity === 'string' && typeof offer.philosophy === 'string' && typeof offer.description === 'string' && typeof offer.primaryColor === 'string' && typeof offer.secondaryColor === 'string' && Array.isArray(offer.pros) && offer.pros.every((item) => typeof item === 'string') && Array.isArray(offer.cons) && offer.cons.every((item) => typeof item === 'string') && typeof offer.managerBudget === 'number' && typeof offer.managerTrust === 'number' && typeof offer.playerRating === 'number' && typeof offer.playerPotential === 'number' && typeof offer.playerWage === 'number' && typeof offer.playerRole === 'string' && typeof offer.playerTraining === 'number' && typeof offer.managerResultBoost === 'number' && typeof offer.managerBudgetGrowth === 'number' && typeof offer.playerTrainingBonus === 'number' && typeof offer.playerTrustModifier === 'number'
}

export function isSavedOnboarding(value: unknown): value is OnboardingSave {
  if (!value || typeof value !== 'object') return false
  const onboarding = value as Partial<OnboardingSave>
  return (onboarding.mode === 'manager' || onboarding.mode === 'player') && typeof onboarding.name === 'string' && onboarding.name.trim().length > 0 && typeof onboarding.leaguePreference === 'string' && typeof onboarding.difficulty === 'string' && validPositions.includes(onboarding.playerPosition as Position) && Array.isArray(onboarding.offers) && onboarding.offers.length === 3 && onboarding.offers.every(isSavedClubOffer) && (!onboarding.acceptedOffer || (isSavedClubOffer(onboarding.acceptedOffer) && onboarding.offers.some((offer) => offer.id === onboarding.acceptedOffer?.id)))
}

export function isSavedProfile(value: unknown): value is CareerProfile {
  if (!value || typeof value !== 'object') return false
  const profile = value as Partial<CareerProfile>
  return (profile.mode === 'manager' || profile.mode === 'player') && typeof profile.name === 'string' && profile.name.trim().length > 0 && typeof profile.clubName === 'string' && profile.clubName.trim().length > 0 && typeof profile.clubShort === 'string' && profile.clubShort.trim().length > 0 && typeof profile.league === 'string' && profile.league.trim().length > 0 && typeof profile.primaryColor === 'string' && typeof profile.secondaryColor === 'string' && /^#[0-9a-f]{6}$/i.test(profile.primaryColor) && /^#[0-9a-f]{6}$/i.test(profile.secondaryColor) && validPositions.includes(profile.playerPosition as Position) && typeof profile.difficulty === 'string' && profile.difficulty.trim().length > 0
}

export function isSavedPlayer(value: unknown): value is Player {
  if (!value || typeof value !== 'object') return false
  const player = value as Partial<Player>
  const skills = player.skills as Partial<PlayerSkills> | undefined
  const validSkills = !skills || (typeof skills.pace === 'number' && typeof skills.shooting === 'number' && typeof skills.passing === 'number' && typeof skills.dribbling === 'number' && typeof skills.physical === 'number')
  return Number.isFinite(player.id) && typeof player.name === 'string' && validPositions.includes(player.position as Position) && boundedNumber(player.rating, -1, 0, 99) === player.rating && boundedNumber(player.potential, -1, 0, 99) === player.potential && boundedNumber(player.age, -1, 15, 60) === player.age && boundedNumber(player.form, -1, 0, 100) === player.form && boundedNumber(player.morale, -1, 0, 100) === player.morale && boundedNumber(player.fitness, -1, 0, 100) === player.fitness && boundedNumber(player.value, -1, 0, 1000000000) === player.value && boundedNumber(player.wage, -1, 0, 1000000) === player.wage && boundedNumber(player.contract, -1, 0, 10) === player.contract && typeof player.role === 'string' && typeof player.initials === 'string' && typeof player.color === 'string' && /^#[0-9a-f]{6}$/i.test(player.color) && validSkills
}

export function isSavedMatchPhase(value: unknown): value is MatchPhase {
  return value === 'pre' || value === 'live' || value === 'halftime' || value === 'fulltime' || value === 'interview'
}

export function isSavedPlayerMatch(value: unknown): value is PlayerMatch {
  if (!value || typeof value !== 'object') return false
  const match = value as Partial<PlayerMatch>
  return typeof match.opponent === 'string' && typeof match.opponentShort === 'string' && boundedNumber(match.minute, -1, 0, 90) === match.minute && boundedNumber(match.rating, -1, 0, 10) === match.rating && boundedNumber(match.goals, -1, 0, 10) === match.goals && boundedNumber(match.assists, -1, 0, 10) === match.assists && boundedNumber(match.passes, -1, 0, 200) === match.passes && Array.isArray(match.choices) && match.choices.every((choice) => typeof choice === 'string') && boundedNumber(match.teamGoals, -1, 0, 20) === match.teamGoals && boundedNumber(match.opponentGoals, -1, 0, 20) === match.opponentGoals && boundedNumber(match.stamina, -1, 0, 100) === match.stamina && typeof match.lastEvent === 'string'
}

// ── Storage helpers ──
export function backupLegacySaveIfNeeded() {
  try {
    const raw = window.localStorage.getItem(SAVE_KEY)
    if (!raw || window.localStorage.getItem(LEGACY_SAVE_BACKUP_KEY)) return
    const parsed = JSON.parse(raw) as Partial<SavedCareerEnvelope>
    if (parsed.version === 1 || !parsed.version) {
      window.localStorage.setItem(LEGACY_SAVE_BACKUP_KEY, raw)
      window.localStorage.removeItem(SAVE_KEY)
    }
  } catch {
    // A malformed old save should not block a fresh career.
  }
}

export function readSavedOnboarding(): OnboardingSave | null {
  try {
    const raw = window.localStorage.getItem(ONBOARDING_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as unknown
    return isSavedOnboarding(parsed) ? parsed : null
  } catch {
    return null
  }
}

export function readSavedCareer(): (SavedCareer & { savedAt?: number }) | null {
  try {
    const raw = window.localStorage.getItem(SAVE_KEY)
    if (!raw) return null
    const rawParsed = JSON.parse(raw) as unknown
    const envelope = isSavedCareerEnvelope(rawParsed) ? rawParsed : null
    const parsed = (envelope?.career ?? rawParsed) as Partial<SavedCareer>
    if (!isSavedProfile(parsed.profile)) return null
    const profile = parsed.profile
    if (envelope?.version === 1 || !envelope) return null
    const migratedClubOffer = isSavedClubOffer(parsed.clubOffer) ? parsed.clubOffer : createLegacyClubOffer(profile)
    const allowedViews = profile.mode === 'player' ? ['hub', 'player', 'squad', 'club', 'calendar', 'transfers', 'training'] : ['hub', 'squad', 'market', 'academy', 'club', 'calendar', 'transfers']
    const activeView = typeof parsed.activeView === 'string' && allowedViews.includes(parsed.activeView) ? parsed.activeView as View : profile.mode === 'player' ? 'player' : 'hub'
    const fixtureResults = parsed.fixtureResults && typeof parsed.fixtureResults === 'object' ? Object.fromEntries(Object.entries(parsed.fixtureResults).filter(([key, value]) => /^\d+$/.test(key) && typeof value === 'string')) : {}
    let dateIndex = boundedNumber(parsed.dateIndex, 0, 0, seasonFixtures.length - 1)
    dateIndex = Math.floor(dateIndex)
    while (dateIndex < seasonFixtures.length - 1 && fixtureResults[dateIndex]) dateIndex += 1
    const savedPhase = isSavedMatchPhase(parsed.playerMatchPhase) ? parsed.playerMatchPhase : null
    const savedMatch = isSavedPlayerMatch(parsed.playerMatch) ? parsed.playerMatch : null
    const playerMatchPhase = parsed.profile.mode === 'player' && savedPhase && savedMatch ? savedPhase : null
    const playerMatch = playerMatchPhase ? savedMatch : null
    const simulationSpeed = parsed.simulationSpeed === 0 || parsed.simulationSpeed === 1 || parsed.simulationSpeed === 2 || parsed.simulationSpeed === 20 ? parsed.simulationSpeed : 1
    const simMinute = Math.floor(boundedNumber(parsed.simMinute, 8 * 60, 0, 24 * 60 - 1))
    const simDay = Math.floor(boundedNumber(parsed.simDay, 1, 1, 28))
    const players = Array.isArray(parsed.players) && parsed.players.length > 0 && parsed.players.every(isSavedPlayer) ? parsed.players : initialPlayers
    return {
      profile,
      clubOffer: migratedClubOffer,
      introComplete: typeof parsed.introComplete === 'boolean' ? parsed.introComplete : true,
      seasonNumber: Math.floor(boundedNumber(parsed.seasonNumber, 1, 1, 99)),
      weekNumber: Math.floor(boundedNumber(parsed.weekNumber, 1, 1, 38)),
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
      trainingEnergy: boundedNumber(parsed.trainingEnergy, 100, 0, 100),
      lastTrainingDay: boundedNumber(parsed.lastTrainingDay, 0, 0, 28),
      rivalryScore: boundedNumber(parsed.rivalryScore, 48, 0, 100),
      managerTrust: boundedNumber(parsed.managerTrust, 74, 0, 100),
      simulationEvents: Array.isArray(parsed.simulationEvents) ? parsed.simulationEvents.filter((event): event is SimulationEvent => Boolean(event && typeof event.id === 'number' && typeof event.label === 'string' && typeof event.detail === 'string')).slice(0, 8) : [],
      ...(envelope ? { savedAt: envelope.savedAt } : {}),
    } as SavedCareer & { savedAt?: number }
  } catch {
    return null
  }
}

// ── Club offer factories ──
export function createLegacyClubOffer(profile: CareerProfile): ClubOffer {
  return { id: 'legacy', clubName: profile.clubName, clubShort: profile.clubShort, league: profile.league, identity: 'Existing career', philosophy: 'Established setup', description: 'This career was created before the new club-offer system. Your original club has been preserved.', primaryColor: profile.primaryColor, secondaryColor: profile.secondaryColor, pros: ['Original career preserved', 'Existing squad retained'], cons: ['Legacy starting conditions', 'No offer reroll'], managerBudget: 48500000, managerTrust: 74, playerRating: 66, playerPotential: 86, playerWage: 6500, playerRole: 'Prospect', playerTraining: 42, managerResultBoost: 0, managerBudgetGrowth: 0, playerTrainingBonus: 0, playerTrustModifier: 0 }
}

export function profileFromOffer(onboarding: OnboardingSave, offer: ClubOffer): CareerProfile {
  return { mode: onboarding.mode, name: onboarding.name, clubName: offer.clubName, clubShort: offer.clubShort, league: offer.league, primaryColor: offer.primaryColor, secondaryColor: offer.secondaryColor, difficulty: onboarding.difficulty, playerPosition: onboarding.playerPosition }
}

// ── UI helpers ──
export function formatMoney(value: number) {
  if (value >= 1000000) return `€${(value / 1000000).toFixed(1)}M`
  return `€${Math.round(value / 1000)}K`
}

export function formatSavedTime(value: number | null) {
  if (!value) return 'Not saved'
  return new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

// ── Player factory ──
export function createCareerPlayer(profile: CareerProfile, offer?: ClubOffer | null): Player {
  const initials = profile.name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase() || 'NP'
  return { id: 900, name: profile.name, position: profile.playerPosition, rating: offer?.playerRating ?? 66, potential: offer?.playerPotential ?? 86, age: 18, form: 72, morale: 82, fitness: 96, value: 2500000, wage: offer?.playerWage ?? 6500, contract: 4, role: offer?.playerRole ?? 'Prospect', initials, color: profile.primaryColor, skills: randomSkillsForPosition(profile.playerPosition, offer?.playerRating ?? 66) }
}

// ── Icon component ──
export function Icon({ children, className = '' }: { children: string; className?: string }) {
  return <span aria-hidden="true" className={`icon ${className}`}>{children}</span>
}
