import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties, FormEvent, ReactNode } from 'react'

type View = 'hub' | 'player' | 'squad' | 'market' | 'academy' | 'club' | 'calendar' | 'transfers' | 'training'
type CareerMode = 'manager' | 'player'
type MatchPhase = 'pre' | 'live' | 'halftime' | 'fulltime' | 'interview'
type Position = 'GK' | 'CB' | 'LB' | 'RB' | 'DM' | 'CM' | 'AM' | 'LW' | 'RW' | 'ST'
type TransferApproach = { id: string; clubName: string; clubShort: string; league: string; identity: string; storyline: string; primaryColor: string; secondaryColor: string; perks: string[]; risks: string[]; managerBudget: number; managerTrust: number; playerWage: number; playerRole: string; playerTraining: number; stage: 'approaching' | 'considering' | 'negotiating' | 'accepted' | 'declined'; arrivalDay: number; arrivalWeek: number; counterDemand: string }
type PlayerSkills = { pace: number; shooting: number; passing: number; dribbling: number; physical: number }
type TrainingSession = { id: string; label: string; skill: keyof PlayerSkills; description: string; energyCost: number; icon: string }

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
  skills: PlayerSkills
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

type ClubOffer = {
  id: string
  clubName: string
  clubShort: string
  league: string
  identity: string
  philosophy: string
  description: string
  primaryColor: string
  secondaryColor: string
  pros: string[]
  cons: string[]
  managerBudget: number
  managerTrust: number
  playerRating: number
  playerPotential: number
  playerWage: number
  playerRole: string
  playerTraining: number
  managerResultBoost: number
  managerBudgetGrowth: number
  playerTrainingBonus: number
  playerTrustModifier: number
}

type OnboardingSave = {
  mode: CareerMode
  name: string
  leaguePreference: string
  difficulty: string
  playerPosition: Position
  offers: ClubOffer[]
  acceptedOffer?: ClubOffer
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
  clubOffer: ClubOffer | null
  introComplete: boolean
  seasonNumber: number
  weekNumber: number
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
  trainingEnergy: number
  lastTrainingDay: number
  rivalryScore: number
  managerTrust: number
  simulationEvents: SimulationEvent[]
}

type SavedCareerEnvelope = {
  version: 1 | 2
  savedAt: number
  career: SavedCareer
}

type SaveStatus = 'saved' | 'saving' | 'error'

const SAVE_KEY = 'northstar-career-save'
const PROFILE_KEY = 'northstar-career-profile'
const ONBOARDING_KEY = 'northstar-career-onboarding'
const LEGACY_SAVE_BACKUP_KEY = 'northstar-career-save-legacy-backup'
const CURRENT_SAVE_VERSION = 2

const validPositions: Position[] = ['GK', 'CB', 'LB', 'RB', 'DM', 'CM', 'AM', 'LW', 'RW', 'ST']

function isSavedCareerEnvelope(value: unknown): value is SavedCareerEnvelope {
  if (!value || typeof value !== 'object') return false
  const envelope = value as Partial<SavedCareerEnvelope>
  return (envelope.version === 1 || envelope.version === CURRENT_SAVE_VERSION) && typeof envelope.savedAt === 'number' && Number.isFinite(envelope.savedAt) && Boolean(envelope.career)
}

function isSavedClubOffer(value: unknown): value is ClubOffer {
  if (!value || typeof value !== 'object') return false
  const offer = value as Partial<ClubOffer>
  return typeof offer.id === 'string' && typeof offer.clubName === 'string' && typeof offer.clubShort === 'string' && typeof offer.league === 'string' && typeof offer.identity === 'string' && typeof offer.philosophy === 'string' && typeof offer.description === 'string' && typeof offer.primaryColor === 'string' && typeof offer.secondaryColor === 'string' && Array.isArray(offer.pros) && offer.pros.every((item) => typeof item === 'string') && Array.isArray(offer.cons) && offer.cons.every((item) => typeof item === 'string') && typeof offer.managerBudget === 'number' && typeof offer.managerTrust === 'number' && typeof offer.playerRating === 'number' && typeof offer.playerPotential === 'number' && typeof offer.playerWage === 'number' && typeof offer.playerRole === 'string' && typeof offer.playerTraining === 'number' && typeof offer.managerResultBoost === 'number' && typeof offer.managerBudgetGrowth === 'number' && typeof offer.playerTrainingBonus === 'number' && typeof offer.playerTrustModifier === 'number'
}

function isSavedOnboarding(value: unknown): value is OnboardingSave {
  if (!value || typeof value !== 'object') return false
  const onboarding = value as Partial<OnboardingSave>
  return (onboarding.mode === 'manager' || onboarding.mode === 'player') && typeof onboarding.name === 'string' && onboarding.name.trim().length > 0 && typeof onboarding.leaguePreference === 'string' && typeof onboarding.difficulty === 'string' && validPositions.includes(onboarding.playerPosition as Position) && Array.isArray(onboarding.offers) && onboarding.offers.length === 3 && onboarding.offers.every(isSavedClubOffer) && (!onboarding.acceptedOffer || (isSavedClubOffer(onboarding.acceptedOffer) && onboarding.offers.some((offer) => offer.id === onboarding.acceptedOffer?.id)))
}

function backupLegacySaveIfNeeded() {
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

function readSavedOnboarding(): OnboardingSave | null {
  try {
    const raw = window.localStorage.getItem(ONBOARDING_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as unknown
    return isSavedOnboarding(parsed) ? parsed : null
  } catch {
    return null
  }
}

function isSavedProfile(value: unknown): value is CareerProfile {
  if (!value || typeof value !== 'object') return false
  const profile = value as Partial<CareerProfile>
  return (profile.mode === 'manager' || profile.mode === 'player') && typeof profile.name === 'string' && profile.name.trim().length > 0 && typeof profile.clubName === 'string' && profile.clubName.trim().length > 0 && typeof profile.clubShort === 'string' && profile.clubShort.trim().length > 0 && typeof profile.league === 'string' && profile.league.trim().length > 0 && typeof profile.primaryColor === 'string' && typeof profile.secondaryColor === 'string' && /^#[0-9a-f]{6}$/i.test(profile.primaryColor) && /^#[0-9a-f]{6}$/i.test(profile.secondaryColor) && validPositions.includes(profile.playerPosition as Position) && typeof profile.difficulty === 'string' && profile.difficulty.trim().length > 0
}

function isSavedPlayer(value: unknown): value is Player {
  if (!value || typeof value !== 'object') return false
  const player = value as Partial<Player>
  const skills = player.skills as Partial<PlayerSkills> | undefined
  const validSkills = !skills || (typeof skills.pace === 'number' && typeof skills.shooting === 'number' && typeof skills.passing === 'number' && typeof skills.dribbling === 'number' && typeof skills.physical === 'number')
  return Number.isFinite(player.id) && typeof player.name === 'string' && validPositions.includes(player.position as Position) && boundedNumber(player.rating, -1, 0, 99) === player.rating && boundedNumber(player.potential, -1, 0, 99) === player.potential && boundedNumber(player.age, -1, 15, 60) === player.age && boundedNumber(player.form, -1, 0, 100) === player.form && boundedNumber(player.morale, -1, 0, 100) === player.morale && boundedNumber(player.fitness, -1, 0, 100) === player.fitness && boundedNumber(player.value, -1, 0, 1000000000) === player.value && boundedNumber(player.wage, -1, 0, 1000000) === player.wage && boundedNumber(player.contract, -1, 0, 10) === player.contract && typeof player.role === 'string' && typeof player.initials === 'string' && typeof player.color === 'string' && /^#[0-9a-f]{6}$/i.test(player.color) && validSkills
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

function randomSkillsForPosition(pos: Position, baseRating: number): PlayerSkills {
  const r = baseRating
  return pos === 'GK' ? { pace: r - 12, shooting: r - 30, passing: r - 8, dribbling: r - 22, physical: r - 4 } :
    pos === 'CB' ? { pace: r - 5, shooting: r - 22, passing: r - 10, dribbling: r - 18, physical: r } :
    pos === 'LB' || pos === 'RB' ? { pace: r, shooting: r - 14, passing: r - 5, dribbling: r - 6, physical: r - 5 } :
    pos === 'DM' ? { pace: r - 10, shooting: r - 14, passing: r - 2, dribbling: r - 8, physical: r - 2 } :
    pos === 'CM' ? { pace: r - 8, shooting: r - 6, passing: r, dribbling: r - 4, physical: r - 5 } :
    pos === 'AM' ? { pace: r - 4, shooting: r - 2, passing: r, dribbling: r, physical: r - 10 } :
    pos === 'LW' || pos === 'RW' ? { pace: r, shooting: r - 5, passing: r - 5, dribbling: r, physical: r - 12 } :
    { pace: r - 2, shooting: r, passing: r - 6, dribbling: r - 2, physical: r - 4 } // ST
}

const initialPlayers: Player[] = [
  { id: 1, name: 'Milo Vardic', position: 'GK', rating: 78, potential: 80, age: 29, form: 76, morale: 87, fitness: 92, value: 18500000, wage: 42000, contract: 2, role: 'First team', initials: 'MV', color: '#f4a261', skills: randomSkillsForPosition('GK', 78) },
  { id: 2, name: 'Eliot Van Doren', position: 'CB', rating: 81, potential: 84, age: 27, form: 84, morale: 91, fitness: 88, value: 32000000, wage: 56000, contract: 3, role: 'Crucial', initials: 'EV', color: '#58c4c6', skills: randomSkillsForPosition('CB', 81) },
  { id: 3, name: 'Rayan Kessler', position: 'CB', rating: 76, potential: 82, age: 22, form: 79, morale: 81, fitness: 95, value: 16500000, wage: 24000, contract: 4, role: 'Rotation', initials: 'RK', color: '#8a7dff', skills: randomSkillsForPosition('CB', 76) },
  { id: 4, name: 'Juno Marsetti', position: 'LB', rating: 80, potential: 85, age: 24, form: 88, morale: 89, fitness: 91, value: 28000000, wage: 38000, contract: 3, role: 'First team', initials: 'JM', color: '#f2c14e', skills: randomSkillsForPosition('LB', 80) },
  { id: 5, name: 'Tomas Osei', position: 'RB', rating: 75, potential: 79, age: 26, form: 71, morale: 76, fitness: 79, value: 11000000, wage: 27000, contract: 1, role: 'Rotation', initials: 'TO', color: '#df6d86', skills: randomSkillsForPosition('RB', 75) },
  { id: 6, name: 'Soren Halvik', position: 'DM', rating: 82, potential: 85, age: 25, form: 86, morale: 94, fitness: 90, value: 41000000, wage: 61000, contract: 4, role: 'Crucial', initials: 'SH', color: '#4e9ed4', skills: randomSkillsForPosition('DM', 82) },
  { id: 7, name: 'Nico Bellori', position: 'CM', rating: 79, potential: 88, age: 21, form: 91, morale: 92, fitness: 87, value: 36500000, wage: 31000, contract: 5, role: 'First team', initials: 'NB', color: '#f07f5e', skills: randomSkillsForPosition('CM', 79) },
  { id: 8, name: 'Arden Kova', position: 'CM', rating: 77, potential: 80, age: 28, form: 73, morale: 80, fitness: 93, value: 15000000, wage: 35000, contract: 2, role: 'Rotation', initials: 'AK', color: '#b893da', skills: randomSkillsForPosition('CM', 77) },
  { id: 9, name: 'Lio Santoro', position: 'AM', rating: 84, potential: 89, age: 23, form: 95, morale: 96, fitness: 86, value: 59000000, wage: 77000, contract: 4, role: 'Crucial', initials: 'LS', color: '#e8b74c', skills: randomSkillsForPosition('AM', 84) },
  { id: 10, name: 'Jae Min-Ro', position: 'LW', rating: 80, potential: 87, age: 22, form: 82, morale: 90, fitness: 89, value: 33000000, wage: 44000, contract: 3, role: 'First team', initials: 'JR', color: '#68b5a0', skills: randomSkillsForPosition('LW', 80) },
  { id: 11, name: 'Erlon Hyland', position: 'ST', rating: 86, potential: 91, age: 25, form: 93, morale: 95, fitness: 94, value: 78000000, wage: 105000, contract: 4, role: 'Crucial', initials: 'EH', color: '#d96b63', skills: randomSkillsForPosition('ST', 86) },
  { id: 12, name: 'Dario Venn', position: 'RW', rating: 74, potential: 83, age: 19, form: 77, morale: 84, fitness: 97, value: 12500000, wage: 17000, contract: 5, role: 'Prospect', initials: 'DV', color: '#77a9e8', skills: randomSkillsForPosition('RW', 74) },
  { id: 13, name: 'Cal Rook', position: 'CB', rating: 70, potential: 78, age: 20, form: 68, morale: 73, fitness: 100, value: 6000000, wage: 11000, contract: 3, role: 'Prospect', initials: 'CR', color: '#798798', skills: randomSkillsForPosition('CB', 70) },
]

const baseFixtures: Fixture[] = [
  { opponent: 'Redhaven United', short: 'RU', date: 'SAT, AUG 16', competition: 'Premier Division', home: true, difficulty: 'Medium', crest: '#e96a59' },
  { opponent: 'Violet Town', short: 'VT', date: 'WED, AUG 20', competition: 'Continental Cup · Qualifier', home: false, difficulty: 'High', crest: '#8e73d4' },
  { opponent: 'Oldcastle Rovers', short: 'OR', date: 'SUN, AUG 24', competition: 'Premier Division', home: true, difficulty: 'Low', crest: '#56a98e' },
  { opponent: 'Kingsport Athletic', short: 'KA', date: 'SAT, AUG 30', competition: 'Premier Division', home: false, difficulty: 'High', crest: '#e6ae52' },
]

function formatFixtureDate(index: number) {
  const date = new Date(Date.UTC(2026, 7, 15 + index * 7))
  return `${date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' }).toUpperCase()}`
}

const seasonFixtures: Fixture[] = Array.from({ length: 38 }, (_, index) => ({
  ...baseFixtures[index % baseFixtures.length],
  date: formatFixtureDate(index),
  home: index % 2 === 0,
}))

const prospects: Prospect[] = [
  { id: 101, name: 'Marek Voss', position: 'ST', age: 19, rating: 72, potential: '87–92', value: '€9.4M', interest: 'Very high', club: 'Fjordholm FK', flag: 'NO', color: '#e89a69', tags: ['Poacher', 'Quick step'] },
  { id: 102, name: 'Teyo Aranda', position: 'RW', age: 20, rating: 75, potential: '84–89', value: '€14.8M', interest: 'High', club: 'Costa Azul', flag: 'ES', color: '#6e9ddc', tags: ['Inverted winger', 'Flair'] },
  { id: 103, name: 'Bastian Kroll', position: 'CB', age: 18, rating: 68, potential: '82–90', value: '€4.8M', interest: 'Medium', club: 'Rhein 04', flag: 'DE', color: '#a981d5', tags: ['Ball winner', 'Aerial'] },
  { id: 104, name: 'Naila Bouchard', position: 'CM', age: 21, rating: 77, potential: '85–88', value: '€21.5M', interest: 'High', club: 'AS Montreux', flag: 'FR', color: '#6ab9a5', tags: ['Deep playmaker', 'Vision'] },
]

const clubOfferPool: ClubOffer[] = [
  { id: 'redhaven', clubName: 'Redhaven United', clubShort: 'RU', league: 'Premier Division', identity: 'The sleeping giant', philosophy: 'Immediate results', description: 'A proud club with a restless fanbase, a strong squad core, and no patience for a slow start.', primaryColor: '#e96a59', secondaryColor: '#f4c46d', pros: ['Experienced squad core', 'Strong home support'], cons: ['Board demands a top-six finish', 'Limited patience for experiments'], managerBudget: 54000000, managerTrust: 67, playerRating: 68, playerPotential: 84, playerWage: 7200, playerRole: 'Prospect', playerTraining: 46, managerResultBoost: 1, managerBudgetGrowth: 250000, playerTrainingBonus: -1, playerTrustModifier: -1 },
  { id: 'violet', clubName: 'Violet Town', clubShort: 'VT', league: 'Continental League', identity: 'The academy project', philosophy: 'Youth development', description: 'A technical club built around young players, patient coaching, and a clear pathway to the first team.', primaryColor: '#8e73d4', secondaryColor: '#b8a3ff', pros: ['Excellent training facilities', 'Young players get minutes'], cons: ['Small transfer budget', 'Results can take time'], managerBudget: 30500000, managerTrust: 81, playerRating: 67, playerPotential: 89, playerWage: 5800, playerRole: 'First team', playerTraining: 64, managerResultBoost: 0, managerBudgetGrowth: 100000, playerTrainingBonus: 3, playerTrustModifier: 2 },
  { id: 'oldcastle', clubName: 'Oldcastle Rovers', clubShort: 'OR', league: 'Premier Division', identity: 'The community club', philosophy: 'Stability first', description: 'A grounded club where trust is earned locally and every decision is measured against the supporters.', primaryColor: '#56a98e', secondaryColor: '#d9e6a3', pros: ['Supporters give time', 'Balanced finances'], cons: ['Modest facilities', 'Lower squad ceiling'], managerBudget: 39000000, managerTrust: 86, playerRating: 65, playerPotential: 82, playerWage: 6200, playerRole: 'Rotation', playerTraining: 52, managerResultBoost: 0, managerBudgetGrowth: 350000, playerTrainingBonus: 0, playerTrustModifier: 3 },
  { id: 'kingsport', clubName: 'Kingsport Athletic', clubShort: 'KA', league: 'Coastal Championship', identity: 'The promotion push', philosophy: 'Win now', description: 'A high-energy club that expects promotion and offers a fast route into the spotlight.', primaryColor: '#e6ae52', secondaryColor: '#274a68', pros: ['Clear promotion target', 'Big match exposure'], cons: ['Heavy pressure every week', 'Thin depth in the squad'], managerBudget: 47000000, managerTrust: 62, playerRating: 69, playerPotential: 83, playerWage: 6800, playerRole: 'First team', playerTraining: 48, managerResultBoost: 1, managerBudgetGrowth: 150000, playerTrainingBonus: -2, playerTrustModifier: -2 },
  { id: 'fjordholm', clubName: 'Fjordholm FK', clubShort: 'FFK', league: 'Alpine League', identity: 'The modern outpost', philosophy: 'Recruit and develop', description: 'A smart, ambitious club known for finding overlooked talent and giving it a platform.', primaryColor: '#4e9ed4', secondaryColor: '#d8f1ff', pros: ['Modern scouting network', 'High potential pathway'], cons: ['Remote travel schedule', 'Lower league prestige'], managerBudget: 34500000, managerTrust: 78, playerRating: 66, playerPotential: 91, playerWage: 6100, playerRole: 'Crucial', playerTraining: 70, managerResultBoost: 0, managerBudgetGrowth: 200000, playerTrainingBonus: 5, playerTrustModifier: 1 },
  { id: 'montreux', clubName: 'AS Montreux', clubShort: 'ASM', league: 'Continental League', identity: 'The elegant challenger', philosophy: 'Possession football', description: 'A technical side with a clear playing style, demanding standards, and a chance to compete beyond the league.', primaryColor: '#6ab9a5', secondaryColor: '#f0d3a0', pros: ['Strong tactical identity', 'Continental competition'], cons: ['Strict role requirements', 'Less room for mistakes'], managerBudget: 51500000, managerTrust: 72, playerRating: 70, playerPotential: 87, playerWage: 7600, playerRole: 'Rotation', playerTraining: 58, managerResultBoost: 0, managerBudgetGrowth: 200000, playerTrainingBonus: 1, playerTrustModifier: 0 },
]

function createClubOffers(leaguePreference: string) {
  const shuffled = [...clubOfferPool]
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    ;[shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]]
  }
  return shuffled.sort((a, b) => Number(b.league === leaguePreference) - Number(a.league === leaguePreference)).slice(0, 3)
}

const trainingSessions: TrainingSession[] = [
  { id: 'sprint', label: 'Sprint drills', skill: 'pace', description: 'Interval runs and acceleration work on the training ground.', energyCost: 28, icon: '⚡' },
  { id: 'finishing', label: 'Finishing practice', skill: 'shooting', description: 'One-touch finishes, volleys, and composed penalty work.', energyCost: 30, icon: '◎' },
  { id: 'rondo', label: 'Rondo & distribution', skill: 'passing', description: 'Tight-space passing sequences and long-range distribution.', energyCost: 22, icon: '↗' },
  { id: 'dribble', label: '1v1 duels', skill: 'dribbling', description: 'Close control through cones and competitive take-on drills.', energyCost: 26, icon: '◈' },
  { id: 'strength', label: 'Strength & recovery', skill: 'physical', description: 'Gym block, core stability, and controlled recovery cycling.', energyCost: 34, icon: '▦' },
]

const transferClubPool: TransferApproach[] = [
  { id: 'tf-dynamo', clubName: 'Dynamo 1896', clubShort: 'DYN', league: 'Continental League', identity: 'The continental contender', storyline: 'Dynamo 1896 have been tracking your progress for months. Their sporting director flew in personally. "We build dynasties, not just seasons."', primaryColor: '#c44d6e', secondaryColor: '#f7d08a', perks: ['Regular continental football', 'Top-tier training facilities', 'Vocal home support'], risks: ['Intense media pressure', 'High board expectations', 'Cold winter schedule'], managerBudget: 51000000, managerTrust: 71, playerWage: 8200, playerRole: 'First team', playerTraining: 68, stage: 'approaching', arrivalDay: 0, arrivalWeek: 0, counterDemand: '' },
  { id: 'tf-ironbank', clubName: 'Ironbank FC', clubShort: 'IB', league: 'Premier Division', identity: 'The ambitious upstart', storyline: 'Ironbank are not subtle — their chairman sent a handwritten note and a number. "Money talks. We want yours to sing."', primaryColor: '#2e7d6a', secondaryColor: '#d4e8c2', perks: ['Competitive wage structure', 'Modern stadium project', 'Young, hungry squad'], risks: ['Unproven in big matches', 'Board meddling in transfers', 'Limited scouting network'], managerBudget: 68000000, managerTrust: 58, playerWage: 9600, playerRole: 'Crucial', playerTraining: 54, stage: 'approaching', arrivalDay: 0, arrivalWeek: 0, counterDemand: '' },
  { id: 'tf-santiverde', clubName: 'Santiverde', clubShort: 'SV', league: 'Coastal Championship', identity: 'The lifestyle club', storyline: 'Santiverde pitch the weather, the city, and the vision. "You can win anywhere. Why not win where the sun sets on the sea?"', primaryColor: '#d4853e', secondaryColor: '#f0d4b8', perks: ['Player-friendly city lifestyle', 'Strong youth pipeline', 'Relaxed media environment'], risks: ['Lower league prestige', 'Smaller transfer budget', 'Fewer derby fixtures'], managerBudget: 34000000, managerTrust: 84, playerWage: 7500, playerRole: 'First team', playerTraining: 60, stage: 'approaching', arrivalDay: 0, arrivalWeek: 0, counterDemand: '' },
  { id: 'tf-northcroft', clubName: 'Northcroft Athletic', clubShort: 'NA', league: 'Alpine League', identity: 'The old guard', storyline: 'Northcroft are a name that carries weight. Their captain wants you in the dressing room. "We have the history. You could be part of the next chapter."', primaryColor: '#3d5e8c', secondaryColor: '#c8d9f0', perks: ['Rich club heritage', 'Loyal fanbase', 'Proven development pathway'], risks: ['Aging squad core', 'Rebuilding phase', 'Remote location'], managerBudget: 42000000, managerTrust: 76, playerWage: 7000, playerRole: 'Rotation', playerTraining: 72, stage: 'approaching', arrivalDay: 0, arrivalWeek: 0, counterDemand: '' },
]

function createLegacyClubOffer(profile: CareerProfile): ClubOffer {
  return { id: 'legacy', clubName: profile.clubName, clubShort: profile.clubShort, league: profile.league, identity: 'Existing career', philosophy: 'Established setup', description: 'This career was created before the new club-offer system. Your original club has been preserved.', primaryColor: profile.primaryColor, secondaryColor: profile.secondaryColor, pros: ['Original career preserved', 'Existing squad retained'], cons: ['Legacy starting conditions', 'No offer reroll'], managerBudget: 48500000, managerTrust: 74, playerRating: 66, playerPotential: 86, playerWage: 6500, playerRole: 'Prospect', playerTraining: 42, managerResultBoost: 0, managerBudgetGrowth: 0, playerTrainingBonus: 0, playerTrustModifier: 0 }
}

function profileFromOffer(onboarding: OnboardingSave, offer: ClubOffer): CareerProfile {
  return { mode: onboarding.mode, name: onboarding.name, clubName: offer.clubName, clubShort: offer.clubShort, league: offer.league, primaryColor: offer.primaryColor, secondaryColor: offer.secondaryColor, difficulty: onboarding.difficulty, playerPosition: onboarding.playerPosition }
}

const navItems: { id: View; label: string; icon: string }[] = [
  { id: 'hub', label: 'Central', icon: '⌂' },
  { id: 'squad', label: 'Squad', icon: '♙' },
  { id: 'calendar', label: 'Calendar', icon: '◷' },
  { id: 'transfers', label: 'Transfers', icon: '↔' },
  { id: 'market', label: 'Market', icon: '↗' },
  { id: 'academy', label: 'Academy', icon: '✦' },
  { id: 'club', label: 'Club vision', icon: '◈' },
]

const playerNavItems: { id: View; label: string; icon: string }[] = [
  { id: 'hub', label: 'Central', icon: '⌂' },
  { id: 'player', label: 'My player', icon: '♙' },
  { id: 'calendar', label: 'Calendar', icon: '◷' },
  { id: 'transfers', label: 'Transfers', icon: '↔' },
  { id: 'training', label: 'Training', icon: '⚡' },
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

function createCareerPlayer(profile: CareerProfile, offer?: ClubOffer | null): Player {
  const initials = profile.name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase() || 'NP'
  return { id: 900, name: profile.name, position: profile.playerPosition, rating: offer?.playerRating ?? 66, potential: offer?.playerPotential ?? 86, age: 18, form: 72, morale: 82, fitness: 96, value: 2500000, wage: offer?.playerWage ?? 6500, contract: 4, role: offer?.playerRole ?? 'Prospect', initials, color: profile.primaryColor, skills: randomSkillsForPosition(profile.playerPosition, offer?.playerRating ?? 66) }
}

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
  const [shortlist, setShortlist] = useState<number[]>(savedCareer?.shortlist ?? [101, 104])
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
    const career: SavedCareer = { profile, clubOffer, introComplete, seasonNumber, weekNumber, activeView, players, shortlist, scouted, negotiations, fixtureResults, dateIndex, budget, selectedPlayerId, simulationSpeed, isClockRunning, simMinute, simDay, playerMatchPhase, playerMatch, trainingProgress, trainingEnergy, lastTrainingDay, rivalryScore, managerTrust, simulationEvents }
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
  }, [profile, clubOffer, introComplete, seasonNumber, weekNumber, activeView, players, shortlist, scouted, negotiations, fixtureResults, dateIndex, budget, selectedPlayerId, simulationSpeed, isClockRunning, simMinute, simDay, playerMatchPhase, playerMatch, trainingProgress, trainingEnergy, lastTrainingDay, rivalryScore, managerTrust, simulationEvents])

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
    } else if (simDay % 7 === 0 && !fixtureResults[dateIndex]) {
      const fixture = seasonFixtures[dateIndex % seasonFixtures.length]
      const squadRating = players.reduce((total, item) => total + item.rating, 0) / players.length
      const homeGoals = Math.max(0, Math.min(4, Math.round((squadRating - 71) / 8) + (fixture.home ? 1 : 0) + (clubOffer?.managerResultBoost ?? 0)))
      const awayGoals = fixture.difficulty === 'High' ? 2 : 1
      const result = `${fixture.home ? homeGoals : awayGoals}–${fixture.home ? awayGoals : homeGoals}`
    const seasonEnds = weekNumber >= 38
    setFixtureResults((current) => seasonEnds ? {} : { ...current, [dateIndex]: result })
    setBudget((current) => current + (clubOffer?.managerBudgetGrowth ?? 0))
    setDateIndex((current) => seasonEnds ? 0 : Math.min(current + 1, seasonFixtures.length - 1))
    setWeekNumber((current) => current >= 38 ? 1 : current + 1)
      if (seasonEnds) setSeasonNumber((current) => current + 1)
      setSimulationEvents((current) => [{ id: Date.now() + 2, label: 'Simulated fixture', detail: `${fixture.opponent} finished ${result}.` }, ...current].slice(0, 8))
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
    setShortlist([101, 104])
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
    setShortlist([101, 104])
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
    const squadRating = players.reduce((total, player) => total + player.rating, 0) / players.length
    const formBoost = players.reduce((total, player) => total + player.form, 0) / players.length > 82 ? 1 : 0
    const boardBoost = Math.floor((clubOffer?.managerTrust ?? 74) / 60)
    const homeGoals = Math.max(0, Math.min(4, Math.round((squadRating - 71) / 8) + (currentFixture.home ? 1 : 0) + formBoost + boardBoost + (clubOffer?.managerResultBoost ?? 0)))
    const awayGoals = currentFixture.difficulty === 'High' ? 2 : currentFixture.difficulty === 'Medium' ? 1 : 0
    const result = `${currentFixture.home ? homeGoals : awayGoals}–${currentFixture.home ? awayGoals : homeGoals}`
    const seasonEnds = weekNumber >= 38
    setFixtureResults((current) => seasonEnds ? {} : { ...current, [dateIndex]: result })
    if (profile?.mode === 'manager') setBudget((current) => current + (clubOffer?.managerBudgetGrowth ?? 0))
    setDateIndex((current) => seasonEnds ? 0 : Math.min(current + 1, seasonFixtures.length - 1))
    setWeekNumber((current) => current >= 38 ? 1 : current + 1)
    if (seasonEnds) setSeasonNumber((current) => current + 1)
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
    showToast('Scout report filed · ready for review')
  }

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
          {activeView === 'hub' && (careerMode === 'player' ? <PlayerHubView profile={profile} player={selectedPlayer} clockLabel={clockLabel} simDay={simDay} playerMatchPhase={playerMatchPhase} playerMatch={playerMatch} actionTimer={matchActionTimer} matchSpeed={simulationSpeed} onSetSpeed={(s) => setSimulationSpeed(s as 0|1|2|20)} trainingProgress={trainingProgress} rivalryScore={rivalryScore} managerTrust={managerTrust} simulationEvents={simulationEvents} onAdvanceMatch={advancePlayerMatch} onMatchAction={choosePlayerMatchAction} openModal={openModal} setActiveView={setActiveView} /> : <HubView profile={profile} budget={budget} dateIndex={dateIndex} fixtureResults={fixtureResults} continueWeek={continueWeek} openModal={openModal} setActiveView={setActiveView} />)}
          {activeView === 'player' && <PlayerHubView profile={profile} player={selectedPlayer} clockLabel={clockLabel} simDay={simDay} playerMatchPhase={playerMatchPhase} playerMatch={playerMatch} actionTimer={matchActionTimer} matchSpeed={simulationSpeed} onSetSpeed={(s) => setSimulationSpeed(s as 0|1|2|20)} trainingProgress={trainingProgress} rivalryScore={rivalryScore} managerTrust={managerTrust} simulationEvents={simulationEvents} onAdvanceMatch={advancePlayerMatch} onMatchAction={choosePlayerMatchAction} openModal={openModal} setActiveView={setActiveView} />}
          {activeView === 'squad' && <SquadView players={players} selectedPlayer={selectedPlayer} setSelectedPlayerId={setSelectedPlayerId} openModal={openModal} />}
          {activeView === 'market' && <MarketView filteredProspects={filteredProspects} search={search} setSearch={setSearch} marketFilter={marketFilter} setMarketFilter={setMarketFilter} shortlist={shortlist} scouted={scouted} negotiations={negotiations} toggleShortlist={toggleShortlist} scoutProspect={scoutProspect} startNegotiation={startNegotiation} budget={budget} openModal={openModal} />}
          {activeView === 'academy' && <AcademyView openModal={openModal} setActiveView={setActiveView} />}
          {activeView === 'club' && (careerMode === 'player' ? <PlayerClubView profile={profile} player={selectedPlayer} openModal={openModal} /> : <ClubView budget={budget} requestInvestment={requestInvestment} openModal={openModal} />)}
          {activeView === 'calendar' && <CalendarView profile={profile} dateIndex={dateIndex} fixtureResults={fixtureResults} simDay={simDay} weekNumber={weekNumber} seasonNumber={seasonNumber} />}
          {activeView === 'transfers' && <TransferOffersView profile={profile} approaches={transferApproaches} clubOffer={clubOffer} onConsider={(a) => { setActiveTransferApproach(a); setShowTransferModal(true) }} onAccept={(a) => acceptClubTransfer(a)} onDecline={(a) => declineApproach(a)}          onCounter={(a, demand) => {
            setTransferApproaches((c) => c.map((x) => x.id === a.id ? { ...x, stage: 'negotiating', counterDemand: demand, managerTrust: Math.min(100, x.managerTrust + 10), playerWage: Math.round(x.playerWage * 1.12), managerBudget: Math.round(x.managerBudget * 1.08) } : x))
            showToast(`Counter-offer submitted. ${a.clubName}'s offer improved.`)
          }} />}
          {activeView === 'training' && <TrainingView profile={profile} players={players} trainingEnergy={trainingEnergy} lastTrainingDay={lastTrainingDay} simDay={simDay} doTrainingSession={doTrainingSession} />}
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
  return <div className="setup-shell"><div className="setup-orbit setup-orbit-one" /><div className="setup-orbit setup-orbit-two" /><header className="setup-brand"><div className="brand-mark">N<span>+</span></div><div><b>NORTHSTAR</b><small>CAREER MODE</small></div></header><main className="setup-card offers-card"><div className="setup-intro"><span className="live-pill"><i /> CLUB OFFERS</span><span className="section-kicker">SEASON 01 · YOUR FIRST APPOINTMENT</span><h1>Three clubs.<br /><em>One decision.</em></h1><p>{onboarding.name}, these clubs have reviewed your profile. Each offer opens a different route through the season.</p></div><div className="offer-grid">{onboarding.offers.map((offer, index) => <article className="club-offer" key={offer.id} style={{ '--offer-primary': offer.primaryColor, '--offer-secondary': offer.secondaryColor } as CSSProperties}><div className="offer-topline"><span className="offer-index">0{index + 1}</span><span className="offer-league">{offer.league}</span></div><div className="offer-crest">{offer.clubShort}</div><span className="offer-identity">{offer.identity}</span><h2>{offer.clubName}</h2><p>{offer.description}</p><div className="offer-meta"><span><b>STYLE</b>{offer.philosophy}</span><span><b>{onboarding.mode === 'manager' ? 'BUDGET' : 'PATHWAY'}</b>{onboarding.mode === 'manager' ? formatMoney(offer.managerBudget) : offer.playerRole}</span></div><div className="offer-tradeoffs"><div><b>ADVANTAGES</b>{offer.pros.map((item) => <span key={item}>+ {item}</span>)}</div><div><b>TRADE-OFFS</b>{offer.cons.map((item) => <span key={item}>− {item}</span>)}</div></div><button className="primary-button full-button" onClick={() => onAccept(offer)}>{onboarding.acceptedOffer?.id === offer.id ? 'Continue with this club' : `Accept ${offer.clubName}`} <Icon>→</Icon></button></article>)}</div><div className="setup-footer"><span>Offers are locked to this career and saved locally.</span><span>{onboarding.mode === 'manager' ? 'Manager appointment' : 'Player contract'} · Season 1</span></div></main></div>
}

function IntroductionView({ profile, offer, onContinue }: { profile: CareerProfile; offer: ClubOffer | null; onContinue: () => void }) {
  const acceptedOffer = offer ?? createLegacyClubOffer(profile)
  const isManager = profile.mode === 'manager'
  return <div className="setup-shell"><div className="setup-orbit setup-orbit-one" /><div className="setup-orbit setup-orbit-two" /><header className="setup-brand"><div className="brand-mark">N<span>+</span></div><div><b>NORTHSTAR</b><small>CAREER MODE</small></div></header><main className="setup-card introduction-card"><div className="intro-scoreboard"><span>SEASON 01</span><b>WEEK 01</b><span>{acceptedOffer.league.toUpperCase()}</span></div><div className="setup-intro"><span className="live-pill"><i /> APPOINTMENT CONFIRMED</span><span className="section-kicker">THE OPENING BRIEFING</span><h1>{isManager ? 'Welcome to the<br />touchline.' : 'Welcome to the<br />first team.'}</h1><p>{isManager ? `The board at ${acceptedOffer.clubName} wants a clear identity, a steady hand, and results that match the ambition.` : `${acceptedOffer.clubName} sees a place for ${profile.name}. Your first sessions will decide how quickly that place becomes yours.`}</p></div><div className="introduction-grid"><div className="introduction-club" style={{ background: `linear-gradient(135deg, ${acceptedOffer.primaryColor}, ${acceptedOffer.secondaryColor})` }}><span>{acceptedOffer.clubShort}</span><div><b>{acceptedOffer.clubName}</b><small>{acceptedOffer.identity} · {acceptedOffer.philosophy}</small></div></div><div className="introduction-brief"><span className="section-kicker">{isManager ? 'BOARD MANDATE' : 'FIRST-TEAM BRIEF'}</span><b>{isManager ? 'Make the club competitive without losing its identity.' : `Earn a role as a ${acceptedOffer.playerRole.toLowerCase()} and make every training session count.`}</b><div className="tag-row"><span>{acceptedOffer.pros[0]}</span><span>{acceptedOffer.cons[0]}</span></div></div></div><button className="primary-button setup-submit" onClick={onContinue}>Enter {acceptedOffer.clubName} <Icon>→</Icon></button><div className="setup-footer"><span>Season 1 · Week 1 · Day 1</span><span>Career state saves automatically</span></div></main></div>
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

  return <div className="setup-shell"><div className="setup-orbit setup-orbit-one" /><div className="setup-orbit setup-orbit-two" /><header className="setup-brand"><div className="brand-mark">N<span>+</span></div><div><b>NORTHSTAR</b><small>CAREER MODE</small></div></header><main className="setup-card"><div className="setup-intro"><span className="live-pill"><i /> NEW CAREER</span><span className="section-kicker">SEASON 01 · THE FIRST DECISION</span><h1>Take the<br /><em>touchline.</em></h1><p>Set your role, name your club, and make the first call of the season.</p></div><form onSubmit={submit}><div className="mode-toggle"><button type="button" className={mode === 'manager' ? 'active' : ''} onClick={() => setMode('manager')}><span className="setup-option-icon">◈</span><span><b>Manager Career</b><small>Run the club. Shape the squad.</small></span><i>✓</i></button><button type="button" className={mode === 'player' ? 'active' : ''} onClick={() => setMode('player')}><span className="setup-option-icon">♙</span><span><b>Player Career</b><small>Become the name on the shirt.</small></span><i>✓</i></button></div><div className="setup-grid"><label className="setup-field"><span>{mode === 'manager' ? 'MANAGER NAME' : 'PLAYER NAME'}</span><input value={name} onChange={(event) => setName(event.target.value)} placeholder={mode === 'manager' ? 'Your manager name' : 'Your player name'} maxLength={28} /></label><div className="setup-field setup-field-note"><span>CLUB APPOINTMENT</span><small>Three unique offers will be generated after setup. Each club has its own pressure, resources, and pathway.</small></div><label className="setup-field"><span>LEAGUE</span><select value={league} onChange={(event) => setLeague(event.target.value)}><option>Premier Division</option><option>Continental League</option><option>Coastal Championship</option><option>Alpine League</option></select></label>{mode === 'player' && <label className="setup-field"><span>STARTING POSITION</span><select value={playerPosition} onChange={(event) => setPlayerPosition(event.target.value as Position)}>{(['GK', 'CB', 'LB', 'RB', 'DM', 'CM', 'AM', 'LW', 'RW', 'ST'] as Position[]).map((position) => <option key={position}>{position}</option>)}</select></label>}<label className="setup-field"><span>CAREER DIFFICULTY</span><select value={difficulty} onChange={(event) => setDifficulty(event.target.value)}><option>Authentic</option><option>Competitive</option><option>Story driven</option></select></label></div><div className="club-customizer"><div><span className="setup-field-label">FIRST APPOINTMENT</span><small>Review the board brief before you accept a club.</small></div><div className="setup-option-icon">✦</div></div><button className="primary-button setup-submit" type="submit">View club offers <Icon>→</Icon></button></form><div className="setup-footer"><span>All career data is saved locally in this browser.</span><span>Fictional football universe · Season 1 kickoff</span></div></main></div>
}

function PlayerHubView({ profile, player, clockLabel, simDay, playerMatchPhase, playerMatch, actionTimer, matchSpeed, onSetSpeed, trainingProgress, rivalryScore, managerTrust, simulationEvents, onAdvanceMatch, onMatchAction, openModal, setActiveView }: { profile: CareerProfile; player: Player; clockLabel: string; simDay: number; playerMatchPhase: MatchPhase | null; playerMatch: PlayerMatch | null; actionTimer: number; matchSpeed: number; onSetSpeed: (s: number) => void; trainingProgress: number; rivalryScore: number; managerTrust: number; simulationEvents: SimulationEvent[]; onAdvanceMatch: () => void; onMatchAction: (action: 'attack' | 'compose' | 'conserve' | 'press' | 'hold' | 'risk' | 'encourage' | 'humble') => void; openModal: (title: string) => void; setActiveView: (view: View) => void }) {
  return <><PageHeader eyebrow={`PLAYER CAREER · AUG ${simDay}, 2026 · ${profile.league.toUpperCase()}`} title="Earn your next appearance." description={`${profile.name} is entering a defining week at ${profile.clubName}. Training, selection, and matchday decisions set the tone.`} action={<button className="primary-button continue-button" onClick={() => openModal('Next match preparation')}><span className="pulse-ring" />Matchday focus <Icon>→</Icon></button>} /><div className="player-hero-grid"><section className="player-hero panel"><div className="player-hero-bg" /><div className="player-hero-content"><div className="hero-topline"><span className="live-pill"><i /> PLAYER CAREER</span><span className="muted-text">{profile.clubName.toUpperCase()} · {profile.playerPosition}</span></div><h2>Own your<br /><em>matchday.</em></h2><p>Earn your place, handle the pressure, and turn good sessions into starts.</p><div className="player-hero-actions"><button className="light-button" onClick={() => openModal('Training plan')}>Train today <Icon>→</Icon></button><button className="hero-text-button" onClick={() => openModal('Player social feed')}>Open social feed <Icon>↗</Icon></button></div></div><div className="player-hero-rating"><span>OVR</span><strong>{player.rating}</strong><small>+2 this season</small></div></section><MatchdayPanel profile={profile} phase={playerMatchPhase} match={playerMatch} clockLabel={clockLabel} simDay={simDay} actionTimer={actionTimer} matchSpeed={matchSpeed} onSetSpeed={onSetSpeed} onAdvance={onAdvanceMatch} onAction={onMatchAction} openModal={openModal} /></div><div className="player-metric-row"><Metric label="PLAYER RATING" value={String(player.rating)} trend="+2 this season" icon="✦" accent="purple" /><Metric label="MATCH FITNESS" value={`${player.fitness}%`} trend="Peak readiness" icon="⌁" accent="cyan" /><Metric label="MANAGER TRUST" value={`${managerTrust}%`} trend="Live relationship" icon="◎" accent="lime" /><Metric label="RIVALRY" value={`${rivalryScore}`} trend="Competitive edge" icon="⚡" accent="amber" /></div><div className="player-lower-grid"><section className="panel player-progress-panel"><div className="panel-heading"><div><span className="section-kicker">PERSONAL DEVELOPMENT</span><h3>Build the complete player</h3></div><button className="text-link" onClick={() => openModal('Full development plan')}>View plan <Icon>→</Icon></button></div><div className="player-progress-profile"><div className="player-profile-avatar" style={{ background: `linear-gradient(135deg, ${profile.primaryColor}, ${profile.secondaryColor})` }}>{profile.name.split(' ').map((part) => part[0]).join('').slice(0, 2)}</div><div><b>{profile.name}</b><span>{profile.playerPosition} · {profile.clubName}</span><div className="tag-row"><span>Playmaker</span><span>Early breakthrough</span></div></div><strong>{player.potential}<small>POTENTIAL</small></strong></div><div className="development-list"><DynamicBar label="Technical" value={72} color="purple" /><DynamicBar label="Physical" value={64} color="cyan" /><DynamicBar label="Mental" value={78} color="lime" /></div><div className="training-progress-label"><span>Next training milestone</span><b>{trainingProgress}%</b></div><div className="training-progress-track"><i style={{ width: `${trainingProgress}%` }} /></div></section><section className="panel player-briefing"><div className="panel-heading"><div><span className="section-kicker">WEEKLY BRIEFING</span><h3>Next up</h3></div><button className="more-button">•••</button></div><div className="brief-item"><div className="brief-icon purple">♙</div><div><b>Training objective</b><p>Complete 2 finishing sessions</p></div><span className="brief-time">2 / 3</span></div><div className="brief-item"><div className="brief-icon amber">⚡</div><div><b>Rivalry with Rayan Kessler</b><p>Beat his rating in next 5 matches</p></div><span className="brief-time">01–00</span></div><div className="brief-item"><div className="brief-icon cyan">✦</div><div><b>Manager conversation</b><p>Discuss your first-team role</p></div><span className="brief-time">NEW</span></div>{simulationEvents.slice(0, 2).map((event) => <div className="brief-item" key={event.id}><div className="brief-icon purple">◷</div><div><b>{event.label}</b><p>{event.detail}</p></div><span className="brief-time">LIVE</span></div>)}<button className="text-link" onClick={() => setActiveView('squad')}>See club team <Icon>→</Icon></button></section></div></>
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

function HubView({ profile, budget, dateIndex, fixtureResults, continueWeek, openModal, setActiveView }: { profile: CareerProfile; budget: number; dateIndex: number; fixtureResults: Record<number, string>; continueWeek: () => void; openModal: (title: string) => void; setActiveView: (view: View) => void }) {
  const fixture = seasonFixtures[dateIndex]
  const currentResult = fixtureResults[dateIndex]
  return <>
    <PageHeader eyebrow={`MATCHWEEK · ${fixture.date} · ${profile.league.toUpperCase()}`} title="Matchweek starts now." description={`A new week, a full squad, and one clear objective: put ${profile.clubName} in position to win.`} action={<button className="primary-button continue-button" onClick={continueWeek}><span className="pulse-ring" />Continue week <Icon>→</Icon></button>} />
    <div className="hero-grid">
      <section className="club-hero panel">
        <div className="hero-glow" />
        <div className="hero-content"><div className="hero-topline"><span className="live-pill"><i /> LIVE CAREER</span><span className="muted-text">RANKED #07 · {profile.league.toUpperCase()}</span></div><h2>Set the<br /><em>standard.</em></h2><p>Three points from a continental place. The squad is ready. The next result is yours to chase.</p><div className="hero-actions"><button className="light-button" onClick={() => setActiveView('squad')}>Set lineup <Icon>→</Icon></button><button className="hero-text-button" onClick={() => openModal('Match preview')}>View match preview <Icon>↗</Icon></button></div></div>
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
  return <><PageHeader eyebrow="TRANSFER HUB · WINDOW OPEN" title="Build the shortlist." description="Find the right profile, check the numbers, and move when the deal is right." action={<div className="budget-pill"><span>AVAILABLE TO SPEND</span><b>{formatMoney(budget)}</b><Icon>€</Icon></div>} /><div className="market-toolbar panel"><div className="market-tabs"><button className={marketFilter === 'All' ? 'active' : ''} onClick={() => setMarketFilter('All')}>Discover <span>24</span></button><button className={marketFilter === 'Shortlist' ? 'active' : ''} onClick={() => setMarketFilter('Shortlist')}>Shortlist <span>{shortlist.length}</span></button><button className={marketFilter === 'Scouted' ? 'active' : ''} onClick={() => setMarketFilter('Scouted')}>Reports ready <span>{scouted.length}</span></button></div><label className="search-box"><Icon>⌕</Icon><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search player, position or club" /><kbd>⌘ K</kbd></label><button className="filter-button" onClick={() => openModal('Advanced filters')}><Icon>≡</Icon> Filters <span>2</span></button></div><div className="market-summary"><div><b>{filteredProspects.length === 0 ? 'No' : filteredProspects.length}</b><span>targets matching your profile</span></div><div className="summary-separator" /><div><span>Recruitment brief</span><b className="brief-tag">U21 · high potential · attack</b></div><button className="text-link" onClick={() => openModal('Recruitment brief')}>Edit brief <Icon>→</Icon></button></div><div className="prospect-grid">{filteredProspects.map((prospect) => <ProspectCard key={prospect.id} prospect={prospect} isShortlisted={shortlist.includes(prospect.id)} isScouted={scouted.includes(prospect.id)} isNegotiating={negotiations.includes(prospect.id)} toggleShortlist={toggleShortlist} scoutProspect={scoutProspect} startNegotiation={startNegotiation} />)}</div>{filteredProspects.length === 0 && <div className="empty-state panel"><div>⌕</div><h3>No targets found</h3><p>Try a wider search or switch back to Discover.</p></div>}</>
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
    <PageHeader eyebrow={`CALENDAR · ${currentMonthLabel} · SEASON ${String(seasonNumber).padStart(2, '0')}`} title="Plan the campaign." description={`Every fixture, every session, every deadline mapped for ${profile.clubName}.`} action={<div className="calendar-nav"><button className="outline-button" onClick={() => setViewMonth(Math.max(0, viewMonth - 1))} disabled={viewMonth === 0}><Icon>←</Icon> Prev</button><button className="primary-button" onClick={() => setViewMonth(currentMonthIndex)} disabled={isViewingCurrentMonth}>{isViewingCurrentMonth ? 'Current' : 'Jump to today'} <Icon>◷</Icon></button><button className="outline-button" onClick={() => setViewMonth(Math.min(MONTHS.length - 1, viewMonth + 1))} disabled={viewMonth === MONTHS.length - 1}>Next <Icon>→</Icon></button></div>} />
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
  return <><PageHeader eyebrow={`TRANSFER DESK · ${profile.clubName.toUpperCase()}`} title="Your next move." description={`Active approaches from clubs that want ${profile.mode === 'manager' ? 'you in the dugout' : 'you on the pitch'}.`} action={<button className="outline-button" onClick={() => {}}><Icon>↔</Icon> Agent: Maya Chen</button>} /><div className="transfer-active-section">{active.length === 0 ? <div className="empty-state panel"><div>↔</div><h3>No active approaches</h3><p>Clubs will make approaches as your reputation grows. Keep performing and the calls will come.</p></div> : active.map((approach) => <article className="transfer-offer-card panel" key={approach.id}><div className="transfer-offer-top"><div className="transfer-offer-crest" style={{ background: `linear-gradient(135deg, ${approach.primaryColor}, ${approach.secondaryColor})` }}>{approach.clubShort}</div><div className="transfer-offer-info"><span className="section-kicker">{approach.stage.toUpperCase()}</span><h3>{approach.clubName}</h3><p>{approach.identity} · {approach.league}</p></div><span className={`difficulty ${approach.managerTrust > 75 ? 'low' : approach.managerTrust > 60 ? 'medium' : 'high'}`}>{approach.managerTrust > 75 ? 'Warm interest' : approach.managerTrust > 60 ? 'Formal bid' : 'Urgent pursuit'}</span></div><p className="transfer-offer-narrative">{approach.storyline}</p><div className="transfer-offer-perks"><span className="section-kicker">WHAT THEY OFFER</span><div className="tag-row">{approach.perks.map((p) => <span key={p}>{p}</span>)}</div></div><div className="transfer-offer-meta"><span><b>{profile.mode === 'manager' ? 'BUDGET' : 'WAGE'}</b>{profile.mode === 'manager' ? formatMoney(approach.managerBudget) : formatMoney(approach.playerWage) + '/wk'}</span><span><b>ROLE</b>{approach.playerRole}</span><span><b>TRAINING</b>{approach.playerTraining}</span><span><b>TRUST</b>{approach.managerTrust}%</span></div>{approach.stage === 'negotiating' && <div className="transfer-counter"><span className="section-kicker">YOUR DEMAND</span><p>{approach.counterDemand || 'No demand submitted yet.'}</p></div>}<div className="transfer-offer-actions"><button className="primary-button" onClick={() => { onAccept(approach) }}>Accept <Icon>→</Icon></button><button className="outline-button" onClick={() => { onCounter(approach, `Improved ${profile.mode === 'manager' ? 'budget by 15%' : 'wages and role'} requested`) }}>{approach.stage === 'negotiating' ? 'Re-counter' : 'Negotiate'} <Icon>↔</Icon></button><button className="ghost-button" onClick={() => { onDecline(approach) }}>Decline</button></div></article>)}</div>{decided.length > 0 && <><div className="transfer-history-header"><span className="section-kicker">ARCHIVED</span></div><div className="transfer-history">{decided.map((approach) => <div className="brief-item" key={approach.id}><div className={`brief-icon ${approach.stage === 'accepted' ? 'lime' : 'purple'}`}>{approach.stage === 'accepted' ? '✓' : '✕'}</div><div><b>{approach.clubName}</b><p>{approach.stage === 'accepted' ? 'Transfer completed' : 'Approach declined'} · Week {approach.arrivalWeek}</p></div><span className="brief-time">{approach.stage === 'accepted' ? 'DONE' : 'CLOSED'}</span></div>)}</div></>}</>
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
    <PageHeader eyebrow={`TRAINING GROUND · DAY ${simDay}`} title="Build the complete player." description={`${profile.name}'s development session at ${profile.clubName}. Every drill sharpens an edge.`} action={<div className="training-energy-pill"><Icon>⚡</Icon><b>{trainingEnergy}%</b><small>Energy</small><div className="energy-track"><i style={{ width: `${trainingEnergy}%` }} /></div></div>} />
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

export default App
