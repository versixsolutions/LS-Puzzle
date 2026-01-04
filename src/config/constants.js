// Application Constants

export const MODES = {
  NEUROTYPICAL: 'neurotypical',
  TEA: 'tea'
}

export const LEVELS_NEUROTYPICAL = [
  { level: 1, pieces: 4, stars: 0 },   // 2x2
  { level: 2, pieces: 4, stars: 0 },   // 2x2
  { level: 3, pieces: 4, stars: 0 },   // 2x2
  { level: 4, pieces: 9, stars: 0 },   // 3x3
  { level: 5, pieces: 9, stars: 0 },   // 3x3
  { level: 6, pieces: 9, stars: 0 },   // 3x3
  { level: 7, pieces: 16, stars: 0 },  // 4x4
  { level: 8, pieces: 16, stars: 0 },  // 4x4
  { level: 9, pieces: 16, stars: 0 },  // 4x4
  { level: 10, pieces: 25, stars: 0 }  // 5x5
]

// TEA mode: More gradual progression, max 16 pieces
export const LEVELS_TEA = [
  { level: 1, pieces: 4, stars: 0 },   // 2x2
  { level: 2, pieces: 4, stars: 0 },   // 2x2
  { level: 3, pieces: 6, stars: 0 },   // 2x3 or 3x2
  { level: 4, pieces: 6, stars: 0 },   // 2x3 or 3x2
  { level: 5, pieces: 9, stars: 0 },   // 3x3
  { level: 6, pieces: 9, stars: 0 },   // 3x3
  { level: 7, pieces: 12, stars: 0 },  // 3x4 or 4x3
  { level: 8, pieces: 12, stars: 0 },  // 3x4 or 4x3
  { level: 9, pieces: 16, stars: 0 },  // 4x4
  { level: 10, pieces: 16, stars: 0 }  // 4x4
]

export const ALPHABET = [
  'A','B','C','D','E','F','G','H','I','J','K','L','M',
  'N','O','P','Q','R','S','T','U','V','W','X','Y','Z'
]

export const DEFAULT_SENSORY_CONFIG_TEA = {
  music_enabled: false,
  sfx_enabled: true,
  volume: 0.30,
  haptic_enabled: true,
  high_contrast: false,
  reduced_motion: false,
  auto_hints: true,
  auto_hints_delay: 15000
}

export const DEFAULT_SENSORY_CONFIG_NEUROTYPICAL = {
  music_enabled: true,
  sfx_enabled: true,
  volume: 0.50,
  haptic_enabled: true,
  high_contrast: false,
  reduced_motion: false,
  auto_hints: false,
  auto_hints_delay: 0
}

export const ANALYTICS_EVENTS = {
  PIECE_PLACED: 'piece_placed',
  HINT_USED: 'hint_used',
  LEVEL_COMPLETED: 'level_completed',
  LEVEL_ABANDONED: 'level_abandoned',
  FRUSTRATION_DETECTED: 'frustration_detected',
  SESSION_STARTED: 'session_started',
  SESSION_ENDED: 'session_ended'
}

export const IMAGE_CONSTRAINTS = {
  MAX_SIZE_MB: 5,
  MAX_IMAGES: 10,
  SUPPORTED_FORMATS: ['image/jpeg', 'image/png', 'image/webp', 'image/avif'],
  TARGET_SIZE: 800 // Square canvas size
}

export const TRANSITION_DURATION_MS = 3000 // TEA mode countdown

export const COLORS = {
  neurotypical: {
    primary: '#87CEEB',
    secondary: '#FFB6C1',
    success: '#4CAF50',
    warning: '#FFD700'
  },
  tea: {
    primary: '#6B9BD1', // Softer blue
    secondary: '#A8D5BA', // Calm green
    success: '#66BB6A',
    warning: '#FFA726'
  }
}
