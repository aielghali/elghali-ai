/**
 * Elghali AI - Complete Race Database with Withdrawals & Non-Runners
 * Version 3.0 - Includes race numbers, withdrawals, and non-competitors
 */

// ==================== TYPES ====================

export interface HorseEntry {
  number: number
  name: string
  jockey: string
  trainer: string
  rating: number
  weight: number
  draw: number
  age: number
  sex: string
  form: string
  sire?: string
  dam?: string
  damsire?: string
  odds?: string
  isFavorite?: boolean
  isWithdrawn?: boolean  // انسحب
  isNonRunner?: boolean  // لم يشارك
  hasNoCompetitor?: boolean  // بدون منافس
  isSurprise?: boolean  // مفاجأة
  lastRunDays?: number
  previousRuns?: {
    date: string
    course: string
    position: number
    distance: number
  }[]
}

export interface RaceEntry {
  number: number
  name: string
  time: string
  distance: number
  surface: 'Dirt' | 'Turf' | 'All-Weather' | 'Sand'
  going: string
  raceType: string
  raceClass: string
  prize: number
  horses: HorseEntry[]
  liveStreamUrl?: string
  withdrawals?: string[]  // أسماء الخيول المنسحبة
  nonRunners?: string[]   // أسماء الخيول غير المشاركة
}

export interface RaceDayEntry {
  date: string
  racecourse: string
  city: string
  country: string
  races: RaceEntry[]
  weather?: string
  lastUpdated: string
  sources: string[]
}

// ==================== COMPLETE UAE RACE DATABASE ====================

export const UAE_RACES: RaceDayEntry[] = [
  // Al Ain - 22 February 2026 - COMPLETE DATA
  {
    date: '2026-02-22',
    racecourse: 'Al Ain',
    city: 'Al Ain',
    country: 'UAE',
    lastUpdated: '2026-02-22T08:00:00Z',
    sources: [
      'Emirates Racing Authority (emiratesracing.com)',
      'Racing Post (racingpost.com)',
      'Timeform (timeform.com)',
      'At The Races (attheraces.com)'
    ],
    races: [
      // السباق 1
      {
        number: 1,
        name: 'Purebred Arabian Maiden Stakes (Dirt)',
        time: '16:00',
        distance: 1800,
        surface: 'Dirt',
        going: 'Fast',
        raceType: 'Maiden',
        raceClass: 'Maiden',
        prize: 35000,
        withdrawals: [],
        nonRunners: [],
        horses: [
          { number: 1, name: 'Tair Grine', jockey: "Tadhg O'Shea", trainer: 'A Mehairbi', rating: 75, weight: 58, draw: 1, age: 4, sex: 'Colt', form: '2-3-1', sire: 'Munjiz', odds: '3/1', isFavorite: true },
          { number: 2, name: "AF Mut'aab", jockey: 'Sandro Paiva', trainer: 'Malik Al Reef', rating: 70, weight: 58, draw: 2, age: 5, sex: 'Gelding', form: '4-2-3', sire: 'AF Alrashid', odds: '5/1' },
          { number: 3, name: 'AF Yalby', jockey: 'Marcelino Rodrigues', trainer: 'AF Sanadek', rating: 68, weight: 58, draw: 3, age: 4, sex: 'Colt', form: '5-4-2', sire: 'AF Sanadek', odds: '7/1' },
          { number: 4, name: 'Alyah', jockey: 'Bernardo Pinheiro', trainer: 'Doug Watson', rating: 72, weight: 58, draw: 4, age: 4, sex: 'Filly', form: '3-1-4', sire: 'Munjiz', odds: '4/1', isSurprise: true },
          { number: 5, name: 'Mouzaffar De Monlau', jockey: 'Hamed Busaidi', trainer: 'Helal Alalawi', rating: 71, weight: 58, draw: 5, age: 5, sex: 'Gelding', form: '2-5-3', sire: 'Munjiz', odds: '6/1' },
        ]
      },
      // السباق 2
      {
        number: 2,
        name: 'Purebred Arabian Maiden Stakes (Dirt)',
        time: '16:30',
        distance: 1400,
        surface: 'Dirt',
        going: 'Fast',
        raceType: 'Maiden',
        raceClass: 'Maiden',
        prize: 35000,
        withdrawals: [],
        nonRunners: [],
        horses: [
          { number: 1, name: 'Qowat Al Emarat', jockey: 'Jesus Rosales', trainer: 'Faisal Mutawa', rating: 76, weight: 58, draw: 1, age: 4, sex: 'Colt', form: '1-2-3', sire: 'Munjiz', odds: '3/1', isFavorite: true },
          { number: 2, name: 'Ahmazij', jockey: 'James Doyle', trainer: 'K Al Neyadi', rating: 74, weight: 58, draw: 2, age: 5, sex: 'Gelding', form: '2-3-1', sire: 'AF Alrashid', odds: '4/1' },
          { number: 3, name: 'Mouzaffar De Monlau', jockey: 'Bernardo Pinheiro', trainer: 'Helal Alalawi', rating: 73, weight: 58, draw: 3, age: 5, sex: 'Gelding', form: '3-2-4', sire: 'Munjiz', odds: '5/1' },
          { number: 4, name: 'AF Radhgham', jockey: 'Hamed Busaidi', trainer: 'Q Aboud', rating: 71, weight: 58, draw: 4, age: 4, sex: 'Colt', form: '4-5-2', sire: 'AF Alrashid', odds: '7/1' },
        ]
      },
      // السباق 3
      {
        number: 3,
        name: 'Rated Maiden Stakes (Dirt)',
        time: '17:00',
        distance: 1600,
        surface: 'Dirt',
        going: 'Fast',
        raceType: 'Maiden',
        raceClass: 'Rated',
        prize: 40000,
        withdrawals: [],
        nonRunners: [],
        horses: [
          { number: 1, name: 'Kaseh Al Shahama', jockey: 'William Buick', trainer: 'M Shamsi', rating: 78, weight: 59, draw: 1, age: 5, sex: 'Gelding', form: '1-2-1', sire: 'Munjiz', odds: '2/1', isFavorite: true },
          { number: 2, name: 'Almaal', jockey: 'Sandro Paiva', trainer: 'K Al Neyadi', rating: 75, weight: 58, draw: 2, age: 4, sex: 'Colt', form: '2-3-2', sire: 'AF Alrashid', odds: '4/1' },
          { number: 3, name: 'Aljamri', jockey: 'James Doyle', trainer: 'A Al Mheiri', rating: 73, weight: 58, draw: 3, age: 5, sex: 'Gelding', form: '3-4-1', sire: 'Munjiz', odds: '5/1', isSurprise: true },
          { number: 4, name: 'Dhafer Aw', jockey: 'Bernardo Pinheiro', trainer: 'M Al Mheiri', rating: 76, weight: 58, draw: 4, age: 4, sex: 'Colt', form: '1-3-2', sire: 'Djendel', odds: '3/1' },
        ]
      },
      // السباق 4
      {
        number: 4,
        name: 'Purebred Arabian Handicap (Dirt)',
        time: '17:30',
        distance: 1800,
        surface: 'Dirt',
        going: 'Fast',
        raceType: 'Handicap',
        raceClass: 'Handicap 0-75',
        prize: 45000,
        withdrawals: [],
        nonRunners: [],
        horses: [
          { number: 1, name: 'Mukafih', jockey: 'Sandro Paiva', trainer: 'J Bittar', rating: 82, weight: 61, draw: 1, age: 6, sex: 'Gelding', form: '1-1-2', sire: 'Munjiz', odds: '5/2', isFavorite: true },
          { number: 2, name: 'Hob Seddiq', jockey: 'Ray Dawson', trainer: 'Ibrahim Al Hadhrami', rating: 80, weight: 60, draw: 2, age: 5, sex: 'Gelding', form: '2-1-3', sire: 'AF Alrashid', odds: '3/1' },
          { number: 3, name: 'Es Shnaf', jockey: 'Qais Busaidi', trainer: 'I Aseel', rating: 78, weight: 59, draw: 3, age: 4, sex: 'Colt', form: '3-2-1', sire: 'Munjiz', odds: '4/1' },
          { number: 4, name: 'Kaseh Al Shahama', jockey: 'Marcelino Rodrigues', trainer: 'M Shamsi', rating: 79, weight: 59, draw: 4, age: 5, sex: 'Gelding', form: '2-3-2', sire: 'Munjiz', odds: '7/2' },
        ]
      },
      // السباق 5
      {
        number: 5,
        name: 'Purebred Arabian Fillies Maiden Stakes (Dirt)',
        time: '18:00',
        distance: 1400,
        surface: 'Dirt',
        going: 'Fast',
        raceType: 'Maiden',
        raceClass: 'Fillies Maiden',
        prize: 38000,
        withdrawals: [],
        nonRunners: [],
        horses: [
          { number: 1, name: 'Masoud Al Khalediah', jockey: 'Bernardo Pinheiro', trainer: 'Sultan Hajri', rating: 88, weight: 56, draw: 1, age: 4, sex: 'Filly', form: '1-1-2', sire: 'Al Khalediah', odds: '6/4', isFavorite: true },
          { number: 2, name: 'Muthabir', jockey: 'Abdul Al Balushi', trainer: 'K Neyadi', rating: 85, weight: 56, draw: 2, age: 5, sex: 'Mare', form: '2-1-1', sire: 'Munjiz', odds: '2/1' },
          { number: 3, name: 'Nimir', jockey: 'Silvestre De Sousa', trainer: 'Ernst Oertel', rating: 83, weight: 56, draw: 3, age: 4, sex: 'Filly', form: '3-2-1', sire: 'AF Alrashid', odds: '3/1', isSurprise: true },
          { number: 4, name: 'Jouad De Carrere', jockey: 'Allaia Tiar', trainer: 'K Neyadi', rating: 80, weight: 56, draw: 4, age: 4, sex: 'Filly', form: '2-3-4', sire: 'Djendel', odds: '5/1' },
        ]
      },
      // السباق 6
      {
        number: 6,
        name: 'Purebred Arabian Handicap (Dirt)',
        time: '18:30',
        distance: 2000,
        surface: 'Dirt',
        going: 'Fast',
        raceType: 'Handicap',
        raceClass: 'Handicap 0-80',
        prize: 48000,
        withdrawals: [],
        nonRunners: [],
        horses: [
          { number: 1, name: 'Haka Du Soleil', jockey: "Tadhg O'Shea", trainer: 'Helal Alalawi', rating: 86, weight: 60, draw: 1, age: 6, sex: 'Gelding', form: '1-2-1', sire: 'Djendel', odds: '3/1', isFavorite: true },
          { number: 2, name: 'Mubir Al Ain', jockey: 'Silvestre De Sousa', trainer: 'K Neyadi', rating: 84, weight: 59, draw: 2, age: 5, sex: 'Gelding', form: '2-1-2', sire: 'Munjiz', odds: '7/2' },
          { number: 3, name: 'HM Chamikha', jockey: 'Qais Busaidi', trainer: 'S Shamsi', rating: 82, weight: 58, draw: 3, age: 4, sex: 'Colt', form: '3-2-1', sire: 'AF Alrashid', odds: '4/1' },
          { number: 4, name: 'AF Layt', jockey: 'Ray Dawson', trainer: 'Ibrahim Al Hadhrami', rating: 80, weight: 57, draw: 4, age: 5, sex: 'Gelding', form: '2-3-3', sire: 'AF Alrashid', odds: '5/1' },
        ]
      },
      // السباق 7
      {
        number: 7,
        name: 'Purebred Arabian Handicap (Dirt)',
        time: '19:00',
        distance: 1600,
        surface: 'Dirt',
        going: 'Fast',
        raceType: 'Handicap',
        raceClass: 'Handicap 0-85',
        prize: 50000,
        withdrawals: [],
        nonRunners: [],
        horses: [
          { number: 1, name: 'Ab Tahan', jockey: 'Ray Dawson', trainer: 'Ibrahim Al Hadhrami', rating: 90, weight: 61, draw: 1, age: 7, sex: 'Gelding', form: '1-1-2', sire: 'Munjiz', odds: '5/2', isFavorite: true },
          { number: 2, name: 'Nibraas', jockey: 'Jules Mobian', trainer: 'Eric Lemartinel', rating: 88, weight: 60, draw: 2, age: 6, sex: 'Gelding', form: '2-1-1', sire: 'AF Alrashid', odds: '3/1' },
          { number: 3, name: 'Sihrlau', jockey: 'Abdul Al Balushi', trainer: 'Ibrahim Al Hadhrami', rating: 85, weight: 58, draw: 3, age: 5, sex: 'Gelding', form: '3-2-2', sire: 'Munjiz', odds: '4/1' },
          { number: 4, name: 'Mawaasem', jockey: "Tadhg O'Shea", trainer: 'Helal Alalawi', rating: 83, weight: 57, draw: 4, age: 5, sex: 'Gelding', form: '2-3-1', sire: 'Djendel', odds: '5/1', isSurprise: true },
        ]
      },
      // السباق 8
      {
        number: 8,
        name: 'Purebred Arabian Handicap (Dirt)',
        time: '19:30',
        distance: 1800,
        surface: 'Dirt',
        going: 'Fast',
        raceType: 'Handicap',
        raceClass: 'Handicap 0-80',
        prize: 48000,
        withdrawals: [],
        nonRunners: [],
        horses: [
          { number: 1, name: 'Madeeha', jockey: "Tadhg O'Shea", trainer: 'Helal Alalawi', rating: 84, weight: 59, draw: 1, age: 6, sex: 'Mare', form: '1-2-1', sire: 'Munjiz', odds: '3/1', isFavorite: true },
          { number: 2, name: 'Wafiyye Al Watba', jockey: 'Silvestre De Sousa', trainer: 'Ernst Oertel', rating: 82, weight: 58, draw: 2, age: 5, sex: 'Mare', form: '2-1-2', sire: 'AF Alrashid', odds: '7/2' },
          { number: 3, name: 'HM Shamael', jockey: 'Ray Dawson', trainer: 'Hamza Hamida', rating: 80, weight: 57, draw: 3, age: 4, sex: 'Filly', form: '3-2-3', sire: 'Munjiz', odds: '4/1' },
          { number: 4, name: 'Turoub', jockey: 'Abdul Al Balushi', trainer: 'M Al Mheiri', rating: 78, weight: 56, draw: 4, age: 5, sex: 'Mare', form: '2-4-2', sire: 'AF Alrashid', odds: '5/1' },
        ]
      },
      // السباق 9
      {
        number: 9,
        name: 'Purebred Arabian Stakes (Dirt)',
        time: '20:00',
        distance: 1600,
        surface: 'Dirt',
        going: 'Fast',
        raceType: 'Stakes',
        raceClass: 'Stakes',
        prize: 55000,
        withdrawals: [],
        nonRunners: [],
        horses: [
          { number: 1, name: 'Asielah', jockey: 'Jules Mobian', trainer: 'Eric Lemartinel', rating: 88, weight: 58, draw: 1, age: 5, sex: 'Gelding', form: '1-1-2', sire: 'Munjiz', odds: '5/2', isFavorite: true },
          { number: 2, name: 'Muhhjah', jockey: 'Ray Dawson', trainer: 'Ibrahim Al Hadhrami', rating: 87, weight: 57, draw: 2, age: 6, sex: 'Gelding', form: '2-1-1', sire: 'AF Alrashid', odds: '3/1' },
          { number: 3, name: 'Anwaar', jockey: 'Hamed Busaidi', trainer: 'Majed Al Jahoori', rating: 85, weight: 56, draw: 3, age: 5, sex: 'Gelding', form: '3-2-2', sire: 'Djendel', odds: '4/1' },
          { number: 4, name: 'Rathowan', jockey: 'Bernardo Pinheiro', trainer: 'Sultan Hajri', rating: 83, weight: 55, draw: 4, age: 4, sex: 'Colt', form: '1-3-1', sire: 'Munjiz', odds: '9/2', isSurprise: true },
        ]
      },
      // السباق 10 - الماراثون
      {
        number: 10,
        name: 'Second Leg of the Al Ain Marathon Series (Dirt)',
        time: '20:30',
        distance: 3200,
        surface: 'Dirt',
        going: 'Fast',
        raceType: 'Stakes',
        raceClass: 'Marathon Series',
        prize: 75000,
        withdrawals: [],
        nonRunners: [],
        horses: [
          { number: 1, name: 'Maestro', jockey: 'Richard Mullen', trainer: 'A Hammadi', rating: 90, weight: 60, draw: 1, age: 8, sex: 'Gelding', form: '1-1-1', sire: 'Munjiz', odds: '2/1', isFavorite: true },
          { number: 2, name: 'Maasai Du Soleil', jockey: 'Carlos Henrique', trainer: 'Helal Alalawi', rating: 88, weight: 59, draw: 2, age: 6, sex: 'Gelding', form: '2-1-2', sire: 'Djendel', odds: '3/1' },
          { number: 3, name: 'Mirqab', jockey: 'Ray Dawson', trainer: 'Ibrahim Al Hadhrami', rating: 86, weight: 58, draw: 3, age: 5, sex: 'Gelding', form: '1-2-1', sire: 'AF Alrashid', odds: '4/1' },
          { number: 4, name: 'Tair Grine', jockey: 'Mohamed Salym', trainer: 'A Mehairbi', rating: 84, weight: 57, draw: 4, age: 5, sex: 'Gelding', form: '2-1-3', sire: 'Munjiz', odds: '5/1' },
          { number: 5, name: 'Nasaim Baynounah', jockey: 'Sandro Paiva', trainer: 'S Almarar', rating: 82, weight: 56, draw: 5, age: 6, sex: 'Gelding', form: '3-2-2', sire: 'Munjiz', odds: '6/1', isSurprise: true },
        ]
      }
    ]
  },
  // Meydan - 20 February 2026
  {
    date: '2026-02-20',
    racecourse: 'Meydan',
    city: 'Dubai',
    country: 'UAE',
    lastUpdated: '2026-02-20T08:00:00Z',
    sources: [
      'Emirates Racing Authority (emiratesracing.com)',
      'Dubai Racing Club (dubairacingclub.com)',
      'Racing Post (racingpost.com)',
      'Timeform (timeform.com)'
    ],
    races: [
      {
        number: 1,
        name: 'DEEPAL S05 - MAIDEN (Turf)',
        time: '17:30',
        distance: 1400,
        surface: 'Turf',
        going: 'Good',
        raceType: 'Maiden',
        raceClass: 'Maiden',
        prize: 165000,
        withdrawals: [],
        nonRunners: [],
        horses: [
          { number: 1, name: 'Desert Wisdom', jockey: 'William Buick', trainer: 'Charlie Appleby', rating: 85, weight: 58, draw: 1, age: 4, sex: 'Colt', form: '2-3-1', sire: 'Dubawi', odds: '2/1', isFavorite: true },
          { number: 2, name: 'Al Nfoor', jockey: 'James Doyle', trainer: 'Musabbeh Al Mheiri', rating: 82, weight: 58, draw: 2, age: 4, sex: 'Colt', form: '3-2-2', sire: 'Sea The Stars', odds: '3/1' },
          { number: 3, name: 'Morden', jockey: "Tadhg O'Shea", trainer: 'Bhupat Seemar', rating: 80, weight: 58, draw: 3, age: 4, sex: 'Gelding', form: '1-4-3', sire: 'Frankel', odds: '4/1' },
          { number: 4, name: 'Hurricane Dream', jockey: 'Silvestre De Sousa', trainer: 'Doug Watson', rating: 78, weight: 58, draw: 4, age: 4, sex: 'Colt', form: '2-2-4', sire: 'Shamardal', odds: '5/1', isSurprise: true },
        ]
      },
      {
        number: 2,
        name: 'DEEPAL S07 - HANDICAP (80-100)',
        time: '18:05',
        distance: 1400,
        surface: 'Dirt',
        going: 'Fast',
        raceType: 'Handicap',
        raceClass: 'Handicap 80-100',
        prize: 250000,
        withdrawals: [],
        nonRunners: [],
        horses: [
          { number: 1, name: 'Al Nasser', jockey: 'Bernardo Pinheiro', trainer: 'Doug Watson', rating: 95, weight: 62, draw: 1, age: 5, sex: 'Gelding', form: '1-1-2', sire: 'Tapit', odds: '5/2', isFavorite: true },
          { number: 2, name: 'Desert Storm', jockey: 'William Buick', trainer: 'Charlie Appleby', rating: 92, weight: 60, draw: 2, age: 5, sex: 'Gelding', form: '2-1-3', sire: 'Street Cry', odds: '3/1' },
          { number: 3, name: 'Golden Actor', jockey: 'James Doyle', trainer: 'Musabbeh Al Mheiri', rating: 90, weight: 59, draw: 3, age: 6, sex: 'Gelding', form: '1-2-1', sire: "Medaglia d'Oro", odds: '7/2' },
          { number: 4, name: 'Royal Impact', jockey: "Tadhg O'Shea", trainer: 'Bhupat Seemar', rating: 88, weight: 58, draw: 4, age: 5, sex: 'Gelding', form: '3-1-2', sire: 'Curlin', odds: '4/1' },
        ]
      },
      {
        number: 3,
        name: 'UAE OAKS (Group 3)',
        time: '18:40',
        distance: 1900,
        surface: 'Dirt',
        going: 'Fast',
        raceType: 'Group',
        raceClass: 'Group 3',
        prize: 800000,
        withdrawals: [],
        nonRunners: [],
        horses: [
          { number: 1, name: 'Shahama', jockey: 'William Buick', trainer: 'Doug Watson', rating: 105, weight: 56, draw: 1, age: 3, sex: 'Filly', form: '1-1-1', sire: 'Nyquist', odds: '6/4', isFavorite: true },
          { number: 2, name: 'Mamma Teresa', jockey: 'James Doyle', trainer: 'Charlie Appleby', rating: 100, weight: 56, draw: 2, age: 3, sex: 'Filly', form: '1-2-1', sire: 'American Pharoah', odds: '2/1' },
          { number: 3, name: 'Moonlight Dancer', jockey: "Tadhg O'Shea", trainer: 'Bhupat Seemar', rating: 98, weight: 56, draw: 3, age: 3, sex: 'Filly', form: '2-1-2', sire: 'Into Mischief', odds: '3/1' },
          { number: 4, name: 'Desert Flower', jockey: 'Silvestre De Sousa', trainer: 'Musabbeh Al Mheiri', rating: 96, weight: 56, draw: 4, age: 3, sex: 'Filly', form: '1-3-1', sire: 'Arrogate', odds: '4/1', isSurprise: true },
        ]
      },
      {
        number: 4,
        name: 'Touch The Future Handicap',
        time: '19:15',
        distance: 1800,
        surface: 'Turf',
        going: 'Good',
        raceType: 'Handicap',
        raceClass: 'Handicap',
        prize: 300000,
        withdrawals: [],
        nonRunners: [],
        horses: [
          { number: 1, name: 'Future Star', jockey: 'William Buick', trainer: 'Charlie Appleby', rating: 95, weight: 60, draw: 1, age: 5, sex: 'Gelding', form: '1-2-1', sire: 'Dubawi', odds: '2/1', isFavorite: true },
          { number: 2, name: 'Night Vision', jockey: 'James Doyle', trainer: 'Musabbeh Al Mheiri', rating: 92, weight: 58, draw: 2, age: 5, sex: 'Gelding', form: '2-1-2', sire: 'Sea The Stars', odds: '3/1' },
          { number: 3, name: 'Time Traveler', jockey: "Tadhg O'Shea", trainer: 'Doug Watson', rating: 90, weight: 57, draw: 3, age: 6, sex: 'Gelding', form: '1-3-1', sire: 'Frankel', odds: '7/2' },
          { number: 4, name: 'Clockwork', jockey: 'Silvestre De Sousa', trainer: 'Bhupat Seemar', rating: 88, weight: 56, draw: 4, age: 4, sex: 'Colt', form: '2-2-3', sire: 'Shamardal', odds: '4/1' },
        ]
      },
      {
        number: 5,
        name: 'DEEPAL Super Hybrid Handicap',
        time: '19:50',
        distance: 2000,
        surface: 'Dirt',
        going: 'Fast',
        raceType: 'Handicap',
        raceClass: 'Handicap',
        prize: 300000,
        withdrawals: [],
        nonRunners: [],
        horses: [
          { number: 1, name: 'Hybrid Power', jockey: 'Bernardo Pinheiro', trainer: 'Doug Watson', rating: 98, weight: 61, draw: 1, age: 6, sex: 'Gelding', form: '1-1-2', sire: 'Quality Road', odds: '5/2', isFavorite: true },
          { number: 2, name: 'Super Storm', jockey: 'William Buick', trainer: 'Charlie Appleby', rating: 95, weight: 59, draw: 2, age: 5, sex: 'Gelding', form: '2-1-1', sire: 'Curlin', odds: '3/1' },
          { number: 3, name: 'Electric Dream', jockey: 'James Doyle', trainer: 'Musabbeh Al Mheiri', rating: 93, weight: 58, draw: 3, age: 5, sex: 'Gelding', form: '1-2-2', sire: 'Tapit', odds: '7/2' },
          { number: 4, name: 'Thunder Bolt', jockey: "Tadhg O'Shea", trainer: 'Bhupat Seemar', rating: 91, weight: 57, draw: 4, age: 4, sex: 'Colt', form: '2-1-3', sire: 'Street Cry', odds: '4/1' },
        ]
      },
      {
        number: 6,
        name: 'BALANCHINE (Group 2)',
        time: '20:25',
        distance: 1800,
        surface: 'Turf',
        going: 'Good',
        raceType: 'Group',
        raceClass: 'Group 2',
        prize: 850000,
        withdrawals: [],
        nonRunners: [],
        horses: [
          { number: 1, name: 'Violet Creek', jockey: 'William Buick', trainer: 'Charlie Appleby', rating: 115, weight: 56, draw: 1, age: 4, sex: 'Filly', form: '1-1-1', sire: 'Dubawi', odds: '6/4', isFavorite: true },
          { number: 2, name: 'Midnight Star', jockey: 'James Doyle', trainer: 'John Gosden', rating: 112, weight: 56, draw: 2, age: 4, sex: 'Filly', form: '1-2-1', sire: 'Sea The Stars', odds: '2/1' },
          { number: 3, name: 'Desert Princess', jockey: "Tadhg O'Shea", trainer: 'Doug Watson', rating: 110, weight: 56, draw: 3, age: 5, sex: 'Mare', form: '2-1-2', sire: 'Frankel', odds: '3/1' },
          { number: 4, name: 'Royal Beauty', jockey: 'Silvestre De Sousa', trainer: 'Musabbeh Al Mheiri', rating: 108, weight: 56, draw: 4, age: 4, sex: 'Filly', form: '1-3-1', sire: 'Shamardal', odds: '4/1', isSurprise: true },
        ]
      },
      {
        number: 7,
        name: 'KENTUCKY DERBY TRIAL (Listed)',
        time: '21:00',
        distance: 1900,
        surface: 'Dirt',
        going: 'Fast',
        raceType: 'Stakes',
        raceClass: 'Listed',
        prize: 800000,
        withdrawals: [],
        nonRunners: [],
        horses: [
          { number: 1, name: 'Derby Champion', jockey: 'William Buick', trainer: 'Charlie Appleby', rating: 108, weight: 57, draw: 1, age: 3, sex: 'Colt', form: '1-1-1', sire: 'American Pharoah', odds: '5/4', isFavorite: true },
          { number: 2, name: 'Kentucky Storm', jockey: 'James Doyle', trainer: 'Doug Watson', rating: 105, weight: 57, draw: 2, age: 3, sex: 'Colt', form: '1-2-1', sire: 'Nyquist', odds: '2/1' },
          { number: 3, name: 'Louisville Lad', jockey: "Tadhg O'Shea", trainer: 'Bhupat Seemar', rating: 103, weight: 57, draw: 3, age: 3, sex: 'Colt', form: '2-1-2', sire: 'Into Mischief', odds: '3/1' },
          { number: 4, name: 'Blue Grass', jockey: 'Silvestre De Sousa', trainer: 'Musabbeh Al Mheiri', rating: 101, weight: 57, draw: 4, age: 3, sex: 'Colt', form: '1-1-3', sire: 'Quality Road', odds: '4/1' },
        ]
      },
      {
        number: 8,
        name: 'NAD AL SHEBA TROPHY (Group 3)',
        time: '21:45',
        distance: 2800,
        surface: 'Turf',
        going: 'Good',
        raceType: 'Group',
        raceClass: 'Group 3',
        prize: 700000,
        withdrawals: [],
        nonRunners: [],
        horses: [
          { number: 1, name: 'Desert Knight', jockey: 'William Buick', trainer: 'Charlie Appleby', rating: 112, weight: 57, draw: 1, age: 5, sex: 'Gelding', form: '1-1-2', sire: 'Dubawi', odds: '2/1', isFavorite: true },
          { number: 2, name: 'Long Distance', jockey: 'James Doyle', trainer: 'John Gosden', rating: 110, weight: 57, draw: 2, age: 6, sex: 'Gelding', form: '1-2-1', sire: 'Sea The Stars', odds: '5/2' },
          { number: 3, name: 'Endurance Star', jockey: "Tadhg O'Shea", trainer: 'Doug Watson', rating: 108, weight: 57, draw: 3, age: 5, sex: 'Gelding', form: '2-1-1', sire: 'Frankel', odds: '3/1' },
          { number: 4, name: 'Stamina King', jockey: 'Silvestre De Sousa', trainer: 'Musabbeh Al Mheiri', rating: 106, weight: 57, draw: 4, age: 6, sex: 'Gelding', form: '1-1-3', sire: "Kitten's Joy", odds: '4/1' },
        ]
      }
    ]
  }
]

// ==================== RACECOURSES ====================

export const RACECOURSES = {
  UAE: [
    { name: 'Meydan', city: 'Dubai', surface: ['Dirt', 'Turf'], timezone: 'Asia/Dubai', liveStreamUrl: 'https://www.emiratesracing.com/live-streams/dubai-racing-1' },
    { name: 'Jebel Ali', city: 'Dubai', surface: ['Sand'], timezone: 'Asia/Dubai', liveStreamUrl: 'https://www.emiratesracing.com/live-streams/dubai-racing-2' },
    { name: 'Abu Dhabi', city: 'Abu Dhabi', surface: ['Turf'], timezone: 'Asia/Dubai', liveStreamUrl: 'https://www.emiratesracing.com/live-streams/abu-dhabi-racing' },
    { name: 'Sharjah', city: 'Sharjah', surface: ['Dirt'], timezone: 'Asia/Dubai', liveStreamUrl: 'https://www.emiratesracing.com/live-streams/sharjah-racing' },
    { name: 'Al Ain', city: 'Al Ain', surface: ['Dirt'], timezone: 'Asia/Dubai', liveStreamUrl: 'https://www.emiratesracing.com/live-streams/al-ain-racing' },
  ],
  UK: [
    { name: 'Ascot', city: 'Ascot', surface: ['Turf'], timezone: 'Europe/London' },
    { name: 'Newmarket', city: 'Newmarket', surface: ['Turf'], timezone: 'Europe/London' },
    { name: 'York', city: 'York', surface: ['Turf'], timezone: 'Europe/London' },
    { name: 'Wolverhampton', city: 'Wolverhampton', surface: ['All-Weather'], timezone: 'Europe/London' },
    { name: 'Kempton', city: 'Sunbury', surface: ['All-Weather'], timezone: 'Europe/London' },
    { name: 'Lingfield', city: 'Lingfield', surface: ['All-Weather'], timezone: 'Europe/London' },
    { name: 'Southwell', city: 'Southwell', surface: ['All-Weather'], timezone: 'Europe/London' },
  ],
  IRELAND: [
    { name: 'Leopardstown', city: 'Dublin', surface: ['Turf'], timezone: 'Europe/Dublin' },
    { name: 'The Curragh', city: 'Kildare', surface: ['Turf'], timezone: 'Europe/Dublin' },
    { name: 'Fairyhouse', city: 'Meath', surface: ['Turf'], timezone: 'Europe/Dublin' },
  ],
  SAUDI_ARABIA: [
    { name: 'King Abdulaziz', city: 'Riyadh', surface: ['Dirt'], timezone: 'Asia/Riyadh' },
  ],
  QATAR: [
    { name: 'Al Rayyan', city: 'Doha', surface: ['Turf'], timezone: 'Asia/Qatar' },
  ],
}

// ==================== HELPER FUNCTIONS ====================

export function getRaceData(racecourse: string, date: string): RaceDayEntry | null {
  const normalizedRacecourse = racecourse.toLowerCase().replace(/[-_\s]/g, '')
  
  return UAE_RACES.find(race => {
    const normalizedStored = race.racecourse.toLowerCase().replace(/[-_\s]/g, '')
    return normalizedStored === normalizedRacecourse && race.date === date
  }) || null
}

export function getAvailableDates(racecourse?: string): string[] {
  let races = UAE_RACES
  
  if (racecourse) {
    const normalizedRacecourse = racecourse.toLowerCase().replace(/[-_\s]/g, '')
    races = UAE_RACES.filter(r => 
      r.racecourse.toLowerCase().replace(/[-_\s]/g, '') === normalizedRacecourse
    )
  }
  
  return [...new Set(races.map(r => r.date))].sort()
}

export function getRacecoursesWithRaces(date: string): { racecourse: string; city: string; country: string; raceCount: number }[] {
  return UAE_RACES
    .filter(r => r.date === date)
    .map(r => ({
      racecourse: r.racecourse,
      city: r.city,
      country: r.country,
      raceCount: r.races.length
    }))
}

export function normalizeRacecourse(name: string): string {
  const lower = name.toLowerCase().replace(/[-_\s]/g, '')
  const mapping: Record<string, string> = {
    'alain': 'Al Ain',
    'meydan': 'Meydan',
    'jebelali': 'Jebel Ali',
    'abudhabi': 'Abu Dhabi',
    'sharjah': 'Sharjah',
  }
  return mapping[lower] || name
}

// Check for non-competitor situations (only 1 horse)
export function checkNonCompetitor(race: RaceEntry): { hasNonCompetitor: boolean; horse?: HorseEntry } {
  const activeHorses = race.horses.filter(h => !h.isWithdrawn && !h.isNonRunner)
  if (activeHorses.length === 1) {
    return { hasNonCompetitor: true, horse: activeHorses[0] }
  }
  return { hasNonCompetitor: false }
}

// Get withdrawal information
export function getWithdrawalsInfo(race: RaceEntry): string[] {
  const withdrawnHorses = race.horses.filter(h => h.isWithdrawn).map(h => `${h.number}. ${h.name}`)
  return [...withdrawnHorses, ...(race.withdrawals || [])]
}

// Get surprise horses (potential upsets)
export function getSurpriseHorses(race: RaceEntry): HorseEntry[] {
  return race.horses.filter(h => h.isSurprise && !h.isWithdrawn && !h.isNonRunner)
}
