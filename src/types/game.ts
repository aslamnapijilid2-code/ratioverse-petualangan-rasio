export type ZoneId = 'village' | 'forest' | 'city' | 'desert' | 'castle';

export interface AvatarConfig {
  skinColor: string;
  shirtColor: string;
  pantsColor: string;
  accessory: 'none' | 'cape' | 'backpack' | 'wings';
  hat: 'none' | 'cap' | 'crown' | 'goggles' | 'wizard';
}

export interface PlayerStats {
  id: string;
  name: string;
  avatar: AvatarConfig;
  coins: number;
  xp: number;
  level: number;
  hearts: number;
  maxHearts: number;
  stars: number;
  badges: string[];
  unlockedZones: ZoneId[];
  completedZones: ZoneId[];
  currentZone: ZoneId;
  className?: string;
  inventory: string[];
}

export interface KKTPIndicator {
  id: string;
  code: string;
  title: string;
  category: 'Konsep' | 'Keterampilan' | 'Penalaran & Metakognisi';
  description: string;
}

export interface QuestionData {
  id: string;
  zoneId: ZoneId;
  indicatorId: string;
  title: string;
  contextStory: string;
  problemPrompt: string;
  type: 'ratio-input' | 'multiple-choice' | 'step-by-step' | 'true-false' | 'unit-calculator';
  options?: { id: string; label: string; isCorrect: boolean }[];
  correctAnswer: string; // e.g. "4:6" or "2:3" or "3000"
  acceptedAlternatives?: string[]; // e.g. ["2:3", "2/3"]
  hintLevel1: string;
  hintLevel2: string;
  stepExplanation: string;
  strategyChoices: string[];
  verificationMethods: string[];
  concreteVisual: {
    type: 'apples' | 'fruits' | 'students' | 'colored-blocks' | 'forest-logs' | 'shop-bottles' | 'desert-fuel' | 'scale-map' | 'boss-orb';
    data: any;
  };
}

export interface StudentReflection {
  zoneId: ZoneId;
  date: string;
  concept: string;
  strategy: string;
  check: string;
  challenge: string;
  realWorld: string;
  aiTeacherFeedback?: string;
}

export interface StudentAssessmentRecord {
  id: string;
  name: string;
  className: string;
  diagnosticCompleted: boolean;
  diagnosticScore: number; // 0 - 100
  zoneProgress: Record<ZoneId, { completed: boolean; score: number; attempts: number; stars: number }>;
  indicatorScores: Record<string, number>; // 0 - 100
  reflections: StudentReflection[];
  totalPlayTimeMinutes: number;
  overallScore: number;
  kktpStatus: 'Sangat Baik' | 'Tercapai' | 'Perlu Penguatan' | 'Perlu Bimbingan';
}

export interface TeacherSettings {
  kktpThreshold: number; // default 75
  ranges: {
    sangatBaik: number; // 90
    tercapai: number; // 75
    perluPenguatan: number; // 60
  };
}

export const KKTP_INDICATORS: KKTPIndicator[] = [
  {
    id: 'ind-1',
    code: 'IKTP-1',
    title: 'Memahami Konsep Rasio',
    category: 'Konsep',
    description: 'Menjelaskan rasio sebagai perbandingan dua kuantitas dan memahami bahwa urutan pembanding memengaruhi makna rasio.',
  },
  {
    id: 'ind-2',
    code: 'IKTP-2',
    title: 'Menyatakan & Menyederhanakan Rasio',
    category: 'Keterampilan',
    description: 'Menuliskan rasio dalam bentuk a:b dan menyederhanakannya dengan membagi kedua bilangan menggunakan FPB.',
  },
  {
    id: 'ind-3',
    code: 'IKTP-3',
    title: 'Menentukan Rasio Senilai',
    category: 'Konsep',
    description: 'Menentukan dan membuktikan kesetaraan rasio dengan mengalikan atau membagi kedua suku dengan bilangan yang sama.',
  },
  {
    id: 'ind-4',
    code: 'IKTP-4',
    title: 'Menghitung Rasio Satuan (Unit Rate)',
    category: 'Keterampilan',
    description: 'Menghitung nilai per satu satuan (harga per barang, kecepatan per menit, konsumsi per liter) menggunakan pembagian.',
  },
  {
    id: 'ind-5',
    code: 'IKTP-5',
    title: 'Menyelesaikan Masalah Proporsi Sehari-hari',
    category: 'Keterampilan',
    description: 'Menyelesaikan masalah kontekstual yang melibatkan perbandingan bertingkat, skala peta, dan resep produksi.',
  },
  {
    id: 'ind-6',
    code: 'IKTP-6',
    title: 'Mengomunikasikan Strategi Penyelesaian',
    category: 'Penalaran & Metakognisi',
    description: 'Memilih dan menjelaskan strategi matematika (tabel rasio, faktor skala, model visual, atau persamaan).',
  },
  {
    id: 'ind-7',
    code: 'IKTP-7',
    title: 'Memeriksa Kebenaran Hasil (Verifikasi)',
    category: 'Penalaran & Metakognisi',
    description: 'Melakukan pemeriksaan ulang kebenaran jawaban melalui substitusi, perkalian silang, atau penalaran logis.',
  },
  {
    id: 'ind-8',
    code: 'IKTP-8',
    title: 'Refleksi Proses Pembelajaran',
    category: 'Penalaran & Metakognisi',
    description: 'Mampu merefleksikan pemahaman konsep, tantangan belajar, dan relevansi rasio dalam kehidupan sehari-hari.',
  },
];
