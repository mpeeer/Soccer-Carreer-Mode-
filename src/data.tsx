import type { Position, Player, PlayerSkills, Fixture, ClubOffer, Prospect, TrainingSession, TransferApproach, View, CareerProfile, OnboardingSave } from './types'

// ── Storage keys ──
export const SAVE_KEY = 'northstar-career-save'
export const PROFILE_KEY = 'northstar-career-profile'
export const ONBOARDING_KEY = 'northstar-career-onboarding'
export const LEGACY_SAVE_BACKUP_KEY = 'northstar-career-save-legacy-backup'
export const CURRENT_SAVE_VERSION = 2

// ── Valid positions ──
export const validPositions: Position[] = ['GK', 'CB', 'LB', 'RB', 'DM', 'CM', 'AM', 'LW', 'RW', 'ST']

// ── Skill generator ──
export function randomSkillsForPosition(pos: Position, baseRating: number): PlayerSkills {
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

// ── Players ──
export const initialPlayers: Player[] = [
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

// ── Fixtures ──
export const baseFixtures: Fixture[] = [
  { opponent: 'Redhaven United', short: 'RU', date: 'SAT, AUG 16', competition: 'Premier Division', home: true, difficulty: 'Medium', crest: '#e96a59' },
  { opponent: 'Violet Town', short: 'VT', date: 'WED, AUG 20', competition: 'Continental Cup · Qualifier', home: false, difficulty: 'High', crest: '#8e73d4' },
  { opponent: 'Oldcastle Rovers', short: 'OR', date: 'SUN, AUG 24', competition: 'Premier Division', home: true, difficulty: 'Low', crest: '#56a98e' },
  { opponent: 'Kingsport Athletic', short: 'KA', date: 'SAT, AUG 30', competition: 'Premier Division', home: false, difficulty: 'High', crest: '#e6ae52' },
]

export function formatFixtureDate(index: number) {
  const date = new Date(Date.UTC(2026, 7, 15 + index * 7))
  return `${date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' }).toUpperCase()}`
}

export const seasonFixtures: Fixture[] = Array.from({ length: 38 }, (_, index) => ({
  ...baseFixtures[index % baseFixtures.length],
  date: formatFixtureDate(index),
  home: index % 2 === 0,
}))

// ── Transfer market prospects ──
export const prospects: Prospect[] = [
  { id: 101, name: 'Marek Voss', position: 'ST', age: 19, rating: 72, potential: '87–92', value: '€9.4M', interest: 'Very high', club: 'Fjordholm FK', flag: 'NO', color: '#e89a69', tags: ['Poacher', 'Quick step'] },
  { id: 102, name: 'Teyo Aranda', position: 'RW', age: 20, rating: 75, potential: '84–89', value: '€14.8M', interest: 'High', club: 'Costa Azul', flag: 'ES', color: '#6e9ddc', tags: ['Inverted winger', 'Flair'] },
  { id: 103, name: 'Bastian Kroll', position: 'CB', age: 18, rating: 68, potential: '82–90', value: '€4.8M', interest: 'Medium', club: 'Rhein 04', flag: 'DE', color: '#a981d5', tags: ['Ball winner', 'Aerial'] },
  { id: 104, name: 'Naila Bouchard', position: 'CM', age: 21, rating: 77, potential: '85–88', value: '€21.5M', interest: 'High', club: 'AS Montreux', flag: 'FR', color: '#6ab9a5', tags: ['Deep playmaker', 'Vision'] },
]

// ── Club offer pool ──
export const clubOfferPool: ClubOffer[] = [
  { id: 'redhaven', clubName: 'Redhaven United', clubShort: 'RU', league: 'Premier Division', identity: 'The sleeping giant', philosophy: 'Immediate results', description: 'A proud club with a restless fanbase, a strong squad core, and no patience for a slow start.', primaryColor: '#e96a59', secondaryColor: '#f4c46d', pros: ['Experienced squad core', 'Strong home support'], cons: ['Board demands a top-six finish', 'Limited patience for experiments'], managerBudget: 54000000, managerTrust: 67, playerRating: 68, playerPotential: 84, playerWage: 7200, playerRole: 'Prospect', playerTraining: 46, managerResultBoost: 1, managerBudgetGrowth: 250000, playerTrainingBonus: -1, playerTrustModifier: -1 },
  { id: 'violet', clubName: 'Violet Town', clubShort: 'VT', league: 'Continental League', identity: 'The academy project', philosophy: 'Youth development', description: 'A technical club built around young players, patient coaching, and a clear pathway to the first team.', primaryColor: '#8e73d4', secondaryColor: '#b8a3ff', pros: ['Excellent training facilities', 'Young players get minutes'], cons: ['Small transfer budget', 'Results can take time'], managerBudget: 30500000, managerTrust: 81, playerRating: 67, playerPotential: 89, playerWage: 5800, playerRole: 'First team', playerTraining: 64, managerResultBoost: 0, managerBudgetGrowth: 100000, playerTrainingBonus: 3, playerTrustModifier: 2 },
  { id: 'oldcastle', clubName: 'Oldcastle Rovers', clubShort: 'OR', league: 'Premier Division', identity: 'The community club', philosophy: 'Stability first', description: 'A grounded club where trust is earned locally and every decision is measured against the supporters.', primaryColor: '#56a98e', secondaryColor: '#d9e6a3', pros: ['Supporters give time', 'Balanced finances'], cons: ['Modest facilities', 'Lower squad ceiling'], managerBudget: 39000000, managerTrust: 86, playerRating: 65, playerPotential: 82, playerWage: 6200, playerRole: 'Rotation', playerTraining: 52, managerResultBoost: 0, managerBudgetGrowth: 350000, playerTrainingBonus: 0, playerTrustModifier: 3 },
  { id: 'kingsport', clubName: 'Kingsport Athletic', clubShort: 'KA', league: 'Coastal Championship', identity: 'The promotion push', philosophy: 'Win now', description: 'A high-energy club that expects promotion and offers a fast route into the spotlight.', primaryColor: '#e6ae52', secondaryColor: '#274a68', pros: ['Clear promotion target', 'Big match exposure'], cons: ['Heavy pressure every week', 'Thin depth in the squad'], managerBudget: 47000000, managerTrust: 62, playerRating: 69, playerPotential: 83, playerWage: 6800, playerRole: 'First team', playerTraining: 48, managerResultBoost: 1, managerBudgetGrowth: 150000, playerTrainingBonus: -2, playerTrustModifier: -2 },
  { id: 'fjordholm', clubName: 'Fjordholm FK', clubShort: 'FFK', league: 'Alpine League', identity: 'The modern outpost', philosophy: 'Recruit and develop', description: 'A smart, ambitious club known for finding overlooked talent and giving it a platform.', primaryColor: '#4e9ed4', secondaryColor: '#d8f1ff', pros: ['Modern scouting network', 'High potential pathway'], cons: ['Remote travel schedule', 'Lower league prestige'], managerBudget: 34500000, managerTrust: 78, playerRating: 66, playerPotential: 91, playerWage: 6100, playerRole: 'Crucial', playerTraining: 70, managerResultBoost: 0, managerBudgetGrowth: 200000, playerTrainingBonus: 5, playerTrustModifier: 1 },
  { id: 'montreux', clubName: 'AS Montreux', clubShort: 'ASM', league: 'Continental League', identity: 'The elegant challenger', philosophy: 'Possession football', description: 'A technical side with a clear playing style, demanding standards, and a chance to compete beyond the league.', primaryColor: '#6ab9a5', secondaryColor: '#f0d3a0', pros: ['Strong tactical identity', 'Continental competition'], cons: ['Strict role requirements', 'Less room for mistakes'], managerBudget: 51500000, managerTrust: 72, playerRating: 70, playerPotential: 87, playerWage: 7600, playerRole: 'Rotation', playerTraining: 58, managerResultBoost: 0, managerBudgetGrowth: 200000, playerTrainingBonus: 1, playerTrustModifier: 0 },
]

export function createClubOffers(leaguePreference: string) {
  const shuffled = [...clubOfferPool]
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    ;[shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]]
  }
  return shuffled.sort((a, b) => Number(b.league === leaguePreference) - Number(a.league === leaguePreference)).slice(0, 3)
}

// ── Training ──
export const trainingSessions: TrainingSession[] = [
  { id: 'sprint', label: 'Sprint drills', skill: 'pace', description: 'Interval runs and acceleration work on the training ground.', energyCost: 28, icon: '⚡' },
  { id: 'finishing', label: 'Finishing practice', skill: 'shooting', description: 'One-touch finishes, volleys, and composed penalty work.', energyCost: 30, icon: '◎' },
  { id: 'rondo', label: 'Rondo & distribution', skill: 'passing', description: 'Tight-space passing sequences and long-range distribution.', energyCost: 22, icon: '↗' },
  { id: 'dribble', label: '1v1 duels', skill: 'dribbling', description: 'Close control through cones and competitive take-on drills.', energyCost: 26, icon: '◈' },
  { id: 'strength', label: 'Strength & recovery', skill: 'physical', description: 'Gym block, core stability, and controlled recovery cycling.', energyCost: 34, icon: '▦' },
]

// ── Transfer pool ──
export const transferClubPool: TransferApproach[] = [
  { id: 'tf-dynamo', clubName: 'Dynamo 1896', clubShort: 'DYN', league: 'Continental League', identity: 'The continental contender', storyline: 'Dynamo 1896 have been tracking your progress for months. Their sporting director flew in personally. "We build dynasties, not just seasons."', primaryColor: '#c44d6e', secondaryColor: '#f7d08a', perks: ['Regular continental football', 'Top-tier training facilities', 'Vocal home support'], risks: ['Intense media pressure', 'High board expectations', 'Cold winter schedule'], managerBudget: 51000000, managerTrust: 71, playerWage: 8200, playerRole: 'First team', playerTraining: 68, stage: 'approaching', arrivalDay: 0, arrivalWeek: 0, counterDemand: '' },
  { id: 'tf-ironbank', clubName: 'Ironbank FC', clubShort: 'IB', league: 'Premier Division', identity: 'The ambitious upstart', storyline: 'Ironbank are not subtle — their chairman sent a handwritten note and a number. "Money talks. We want yours to sing."', primaryColor: '#2e7d6a', secondaryColor: '#d4e8c2', perks: ['Competitive wage structure', 'Modern stadium project', 'Young, hungry squad'], risks: ['Unproven in big matches', 'Board meddling in transfers', 'Limited scouting network'], managerBudget: 68000000, managerTrust: 58, playerWage: 9600, playerRole: 'Crucial', playerTraining: 54, stage: 'approaching', arrivalDay: 0, arrivalWeek: 0, counterDemand: '' },
  { id: 'tf-santiverde', clubName: 'Santiverde', clubShort: 'SV', league: 'Coastal Championship', identity: 'The lifestyle club', storyline: 'Santiverde pitch the weather, the city, and the vision. "You can win anywhere. Why not win where the sun sets on the sea?"', primaryColor: '#d4853e', secondaryColor: '#f0d4b8', perks: ['Player-friendly city lifestyle', 'Strong youth pipeline', 'Relaxed media environment'], risks: ['Lower league prestige', 'Smaller transfer budget', 'Fewer derby fixtures'], managerBudget: 34000000, managerTrust: 84, playerWage: 7500, playerRole: 'First team', playerTraining: 60, stage: 'approaching', arrivalDay: 0, arrivalWeek: 0, counterDemand: '' },
  { id: 'tf-northcroft', clubName: 'Northcroft Athletic', clubShort: 'NA', league: 'Alpine League', identity: 'The old guard', storyline: 'Northcroft are a name that carries weight. Their captain wants you in the dressing room. "We have the history. You could be part of the next chapter."', primaryColor: '#3d5e8c', secondaryColor: '#c8d9f0', perks: ['Rich club heritage', 'Loyal fanbase', 'Proven development pathway'], risks: ['Aging squad core', 'Rebuilding phase', 'Remote location'], managerBudget: 42000000, managerTrust: 76, playerWage: 7000, playerRole: 'Rotation', playerTraining: 72, stage: 'approaching', arrivalDay: 0, arrivalWeek: 0, counterDemand: '' },
]

// ── Navigation ──
export const navItems: { id: View; label: string; icon: string }[] = [
  { id: 'hub', label: 'Central', icon: '⌂' },
  { id: 'squad', label: 'Squad', icon: '♙' },
  { id: 'calendar', label: 'Calendar', icon: '◷' },
  { id: 'transfers', label: 'Transfers', icon: '↔' },
  { id: 'market', label: 'Market', icon: '↗' },
  { id: 'academy', label: 'Academy', icon: '✦' },
  { id: 'club', label: 'Club vision', icon: '◈' },
]

export const playerNavItems: { id: View; label: string; icon: string }[] = [
  { id: 'hub', label: 'Central', icon: '⌂' },
  { id: 'player', label: 'My player', icon: '♙' },
  { id: 'calendar', label: 'Calendar', icon: '◷' },
  { id: 'transfers', label: 'Transfers', icon: '↔' },
  { id: 'training', label: 'Training', icon: '⚡' },
  { id: 'squad', label: 'Club team', icon: '◎' },
  { id: 'club', label: 'Club life', icon: '◈' },
]
