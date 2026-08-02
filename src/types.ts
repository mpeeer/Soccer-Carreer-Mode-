import type { ReactNode } from "react"

export type View = 'hub' | 'player' | 'squad' | 'market' | 'academy' | 'club' | 'calendar' | 'transfers' | 'training'
export type CareerMode = 'manager' | 'player'
export type MatchPhase = 'pre' | 'live' | 'halftime' | 'fulltime' | 'interview'
export type Position = 'GK' | 'CB' | 'LB' | 'RB' | 'DM' | 'CM' | 'AM' | 'LW' | 'RW' | 'ST'
export type TransferApproach = { id: string; clubName: string; clubShort: string; league: string; identity: string; storyline: string; primaryColor: string; secondaryColor: string; perks: string[]; risks: string[]; managerBudget: number; managerTrust: number; playerWage: number; playerRole: string; playerTraining: number; stage: 'approaching' | 'considering' | 'negotiating' | 'accepted' | 'declined'; arrivalDay: number; arrivalWeek: number; counterDemand: string }
export type PlayerSkills = { pace: number; shooting: number; passing: number; dribbling: number; physical: number }
export type TrainingSession = { id: string; label: string; skill: keyof PlayerSkills; description: string; energyCost: number; icon: string }

export type Player = {
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

export type Fixture = {
  opponent: string
  short: string
  date: string
  competition: string
  home: boolean
  difficulty: 'Low' | 'Medium' | 'High'
  crest: string
}

export type CareerProfile = {
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

export type ClubOffer = {
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

export type OnboardingSave = {
  mode: CareerMode
  name: string
  leaguePreference: string
  difficulty: string
  playerPosition: Position
  offers: ClubOffer[]
  acceptedOffer?: ClubOffer
}

export type Prospect = {
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

export type PlayerMatch = {
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

export type ManagerMatch = {
  opponent: string
  opponentShort: string
  crest: string
  home: boolean
  minute: number
  teamGoals: number
  opponentGoals: number
  possession: number
  shots: number
  opponentShots: number
  events: string[]
  playerPerformances: { id: number; rating: number }[]
}

export type SimulationEvent = {
  id: number
  label: string
  detail: string
}

export type SavedCareer = {
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

export type SavedCareerEnvelope = {
  version: 1 | 2
  savedAt: number
  career: SavedCareer
}

export type SaveStatus = 'saved' | 'saving' | 'error'
