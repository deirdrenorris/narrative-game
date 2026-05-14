export type Health = 'good' | 'fair' | 'poor' | 'critical' | 'dead';
export type Pace = 'resting' | 'slow' | 'steady' | 'grueling';
export type Rations = 'bare' | 'meager' | 'filling';

export interface PartyMember {
  name: string;
  role: 'leader' | 'spouse' | 'child' | 'traveler';
  health: Health;
  ailments: string[];
}

export interface WagonParts {
  wheels: number;
  axles: number;
  tongues: number;
}

export interface GameState {
  // Journey progress
  milesFromStart: number;
  dayNumber: number;
  month: string;
  year: number;
  landmark: string;

  // Party
  party: PartyMember[];

  // Supplies
  food: number;
  ammo: number;
  medicine: number;
  wagonParts: WagonParts;
  money: number;

  // Travel settings
  pace: Pace;
  rations: Rations;

  // Environment context for Claude
  weather: string;
  terrain: string;
  recentEvents: string[];

  // End conditions
  gameOver: boolean;
  won: boolean;
  gameOverReason?: string;
}

export interface GameResponse {
  state: GameState;
  narration: string;
  choices: string[];
  tombstone?: string;
}

export function createInitialState(): GameState {
  return {
    milesFromStart: 0,
    dayNumber: 1,
    month: 'May',
    year: 1848,
    landmark: 'Independence, Missouri',

    party: [
      { name: 'Eleanor', role: 'leader', health: 'good', ailments: [] },
      { name: 'Thomas', role: 'spouse', health: 'good', ailments: [] },
      { name: 'Clara', role: 'child', health: 'good', ailments: [] },
      { name: 'Josiah', role: 'traveler', health: 'good', ailments: [] },
    ],

    food: 200,
    ammo: 20,
    medicine: 10,
    wagonParts: { wheels: 2, axles: 1, tongues: 1 },
    money: 80,

    pace: 'steady',
    rations: 'filling',

    weather: 'clear and warm',
    terrain: 'rolling prairie',
    recentEvents: [],

    gameOver: false,
    won: false,
  };
}

export const LANDMARKS = [
  { name: 'Independence, Missouri', miles: 0 },
  { name: 'Fort Kearny', miles: 316 },
  { name: 'Chimney Rock', miles: 554 },
  { name: 'Fort Laramie', miles: 667 },
  { name: 'South Pass', miles: 947 },
  { name: 'Fort Bridger', miles: 1070 },
  { name: 'Snake River Crossing', miles: 1430 },
  { name: 'Oregon City', miles: 2000 },
];

export function getCurrentLandmark(miles: number): string {
  for (let i = LANDMARKS.length - 1; i >= 0; i--) {
    if (miles >= LANDMARKS[i].miles) {
      if (i < LANDMARKS.length - 1) {
        return `Between ${LANDMARKS[i].name} and ${LANDMARKS[i + 1].name}`;
      }
      return LANDMARKS[i].name;
    }
  }
  return 'Independence, Missouri';
}
