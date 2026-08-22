export const GLOW_DESIGN_CONSTITUTION = {
  northStar: 'Technology should feel less like operating a device and more like inhabiting a calm, intelligent place.',
  visualName: 'Timeless Living Pearl Modernism',
  reference: 'Diana-era private-residence elegance + old-world luxury + Apple restraint + quiet living intelligence',
  materials: ['ivory stone','mother-of-pearl','pale champagne metal','silver','sheer daylight','water reflection','controlled translucent glass'],
  behavior: [
    'Light moves before objects.',
    'Information condenses from mist into structure.',
    'Completed things dissolve into light rather than disappearing abruptly.',
    'Related information may form constellations or spatial groupings.',
    'Intelligence is implied through refraction, movement and responsive atmosphere rather than illustrated as a character.',
    'Each page has one or two living moments, never decorative overload.',
    'Seasonal evolution changes atmosphere and light temperature, not theme or chrome.',
  ],
  typography: ['fine serif hierarchy','quiet sans-serif utility text','large breathing room','precise alignment'],
  never: ['fairycore','literal angels or wings','fantasy crystals','neon','excessive sparkles','Y2K toy styling','obvious AI-art decoration','dense equal card grids','fake glass everywhere','heavy pink or lilac effects'],
  pageClimates: {
    today: 'pale ivory morning room with reflected daylight',
    calendar: 'blue-gray drawing room with slow reflected light',
    brain: 'private library or winter garden with liquid light',
    concierge: 'ivory pearl service salon with invisible-companion presence',
    closet: 'glass couture atelier with warm daylight and champagne rails',
    makeup: 'luminous vanity laboratory with pearl task lighting',
    facialPractice: 'quiet sculptural wellness chamber with warm stone and water traces',
    finance: 'liquid treasury and illuminated ledger',
    financialBrain: 'midnight financial observatory',
  },
} as const;

export type GlowDesignConstitution = typeof GLOW_DESIGN_CONSTITUTION;
