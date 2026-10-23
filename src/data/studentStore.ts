import { StudentAssessmentRecord, TeacherSettings, ZoneId, KKTP_INDICATORS } from '../types/game';

const STORAGE_KEY_STUDENTS = 'ratioverse_students_v2';
const STORAGE_KEY_SETTINGS = 'ratioverse_teacher_settings_v2';

export const DEFAULT_TEACHER_SETTINGS: TeacherSettings = {
  kktpThreshold: 75,
  ranges: {
    sangatBaik: 90,
    tercapai: 75,
    perluPenguatan: 60,
  },
};

export const INITIAL_STUDENT_RECORDS: StudentAssessmentRecord[] = [
  {
    id: 'std-001',
    name: 'Budi Pratama',
    className: '6A',
    diagnosticCompleted: true,
    diagnosticScore: 85,
    zoneProgress: {
      village: { completed: true, score: 95, attempts: 3, stars: 3 },
      forest: { completed: true, score: 90, attempts: 4, stars: 3 },
      city: { completed: true, score: 85, attempts: 4, stars: 2 },
      desert: { completed: true, score: 90, attempts: 3, stars: 3 },
      castle: { completed: true, score: 92, attempts: 4, stars: 3 },
    },
    indicatorScores: {
      'ind-1': 95,
      'ind-2': 90,
      'ind-3': 85,
      'ind-4': 90,
      'ind-5': 92,
      'ind-6': 88,
      'ind-7': 90,
      'ind-8': 92,
    },
    reflections: [
      {
        zoneId: 'village',
        date: '2026-10-21',
        concept: 'Rasio membandingkan dua kelompok benda dan urutan penting.',
        strategy: 'Mengelompokkan apel berdasarkan warnanya.',
        check: 'Membaca ulang soal apakah merah dulu atau hijau dulu.',
        challenge: 'Membedakan rasio bagian-ke-bagian dengan bagian-ke-total.',
        realWorld: 'Membandingkan jumlah takaran sirup dan air saat membuat es teh manis.',
        aiTeacherFeedback: 'Pemahaman yang sangat jernih! Kamu sudah menguasai konsep dasar perbandingan.',
      },
      {
        zoneId: 'forest',
        date: '2026-10-22',
        concept: 'Menyederhanakan rasio dengan membagi kedua bilangan menggunakan FPB.',
        strategy: 'Mencari angka pembagi terbesar dari kedua bilangan.',
        check: 'Mengalikan kembali hasilnya dengan faktor pembagi.',
        challenge: 'Menemukan FPB dari bilangan yang cukup besar seperti 18 dan 24.',
        realWorld: 'Menyederhanakan takaran resep kue bolu agar pas untuk loyang kecil.',
        aiTeacherFeedback: 'Luar biasa! Strategi perkalian kembali membuktikan ketelitian berpikirmu.',
      },
    ],
    totalPlayTimeMinutes: 38,
    overallScore: 90,
    kktpStatus: 'Sangat Baik',
  },
  {
    id: 'std-002',
    name: 'Siti Rahmawati',
    className: '6A',
    diagnosticCompleted: true,
    diagnosticScore: 70,
    zoneProgress: {
      village: { completed: true, score: 85, attempts: 4, stars: 2 },
      forest: { completed: true, score: 80, attempts: 5, stars: 2 },
      city: { completed: true, score: 78, attempts: 6, stars: 2 },
      desert: { completed: true, score: 75, attempts: 5, stars: 2 },
      castle: { completed: false, score: 0, attempts: 0, stars: 0 },
    },
    indicatorScores: {
      'ind-1': 85,
      'ind-2': 80,
      'ind-3': 78,
      'ind-4': 75,
      'ind-5': 65,
      'ind-6': 76,
      'ind-7': 72,
      'ind-8': 80,
    },
    reflections: [
      {
        zoneId: 'village',
        date: '2026-10-22',
        concept: 'Rasio ditulis dengan titik dua (:).',
        strategy: 'Menghitung satu per satu balok di layar.',
        check: 'Mencoba kembali saat petunjuk pertama muncul.',
        challenge: 'Menghitung siswa laki-laki terhadap seluruh siswa.',
        realWorld: 'Menghitung perbandingan siswa laki-laki dan perempuan di kelas 6A.',
      },
    ],
    totalPlayTimeMinutes: 29,
    overallScore: 79,
    kktpStatus: 'Tercapai',
  },
  {
    id: 'std-003',
    name: 'Dimas Kurniawan',
    className: '6A',
    diagnosticCompleted: true,
    diagnosticScore: 50,
    zoneProgress: {
      village: { completed: true, score: 65, attempts: 7, stars: 1 },
      forest: { completed: true, score: 60, attempts: 8, stars: 1 },
      city: { completed: false, score: 40, attempts: 6, stars: 0 },
      desert: { completed: false, score: 0, attempts: 0, stars: 0 },
      castle: { completed: false, score: 0, attempts: 0, stars: 0 },
    },
    indicatorScores: {
      'ind-1': 65,
      'ind-2': 60,
      'ind-3': 50,
      'ind-4': 45,
      'ind-5': 40,
      'ind-6': 55,
      'ind-7': 50,
      'ind-8': 60,
    },
    reflections: [
      {
        zoneId: 'village',
        date: '2026-10-22',
        concept: 'Perbandingan benda dengan angka.',
        strategy: 'Melihat warna balok.',
        check: 'Melihat jawaban teman.',
        challenge: 'Masih sering terbalik antara rasio bagian dan total.',
        realWorld: 'Belum tahu persis di mana menggunakannya.',
      },
    ],
    totalPlayTimeMinutes: 22,
    overallScore: 56,
    kktpStatus: 'Perlu Penguatan',
  },
  {
    id: 'std-004',
    name: 'Aulia Zahra',
    className: '6B',
    diagnosticCompleted: true,
    diagnosticScore: 90,
    zoneProgress: {
      village: { completed: true, score: 100, attempts: 3, stars: 3 },
      forest: { completed: true, score: 95, attempts: 3, stars: 3 },
      city: { completed: true, score: 92, attempts: 3, stars: 3 },
      desert: { completed: true, score: 95, attempts: 3, stars: 3 },
      castle: { completed: true, score: 96, attempts: 3, stars: 3 },
    },
    indicatorScores: {
      'ind-1': 100,
      'ind-2': 95,
      'ind-3': 92,
      'ind-4': 95,
      'ind-5': 96,
      'ind-6': 94,
      'ind-7': 95,
      'ind-8': 96,
    },
    reflections: [
      {
        zoneId: 'castle',
        date: '2026-10-22',
        concept: 'Skala peta dan perbedaan perbandingan senilai vs berbalik nilai.',
        strategy: 'Mengubah ke satuan cm dulu baru membagi dengan 100.000.',
        check: 'Memeriksa kembali dengan tangga satuan panjang.',
        challenge: 'Memahami penalaran jumlah pekerja dengan hari kerja.',
        realWorld: 'Membaca skala peta di atlas pelajaran IPS.',
        aiTeacherFeedback: 'Daya nalar yang amat tajam! Kamu mampu membedakan konteks senilai dan berbalik nilai dengan sempurna.',
      },
    ],
    totalPlayTimeMinutes: 42,
    overallScore: 96,
    kktpStatus: 'Sangat Baik',
  },
];

export function getStoredStudents(): StudentAssessmentRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_STUDENTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(INITIAL_STUDENT_RECORDS));
      return INITIAL_STUDENT_RECORDS;
    }
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_STUDENT_RECORDS;
  }
}

export function saveStoredStudents(records: StudentAssessmentRecord[]) {
  try {
    localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(records));
  } catch (e) {
    console.error('Failed to save student records:', e);
  }
}

export function getTeacherSettings(): TeacherSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (!raw) {
      return DEFAULT_TEACHER_SETTINGS;
    }
    return JSON.parse(raw);
  } catch (e) {
    return DEFAULT_TEACHER_SETTINGS;
  }
}

export function saveTeacherSettings(settings: TeacherSettings) {
  try {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save teacher settings:', e);
  }
}

export function updateOrCreateStudentRecord(
  playerId: string,
  playerName: string,
  updateFn: (record: StudentAssessmentRecord) => void,
  className?: string
) {
  const students = getStoredStudents();
  let found = students.find((s) => s.id === playerId);
  if (!found) {
    found = {
      id: playerId,
      name: (playerName && playerName.trim()) || 'Pemain Baru',
      className: className || '6A',
      diagnosticCompleted: false,
      diagnosticScore: 0,
      zoneProgress: {
        village: { completed: false, score: 0, attempts: 0, stars: 0 },
        forest: { completed: false, score: 0, attempts: 0, stars: 0 },
        city: { completed: false, score: 0, attempts: 0, stars: 0 },
        desert: { completed: false, score: 0, attempts: 0, stars: 0 },
        castle: { completed: false, score: 0, attempts: 0, stars: 0 },
      },
      indicatorScores: {
        'ind-1': 0,
        'ind-2': 0,
        'ind-3': 0,
        'ind-4': 0,
        'ind-5': 0,
        'ind-6': 0,
        'ind-7': 0,
        'ind-8': 0,
      },
      reflections: [],
      totalPlayTimeMinutes: 5,
      overallScore: 0,
      kktpStatus: 'Perlu Bimbingan',
    };
    students.unshift(found);
  } else {
    if (playerName && playerName.trim()) {
      found.name = playerName.trim();
    }
    if (className) {
      found.className = className;
    }
  }

  updateFn(found);

  // Recalculate overall score & status based on indicators
  const indicatorValues = Object.values(found.indicatorScores);
  const nonZero = indicatorValues.filter((v) => v > 0);
  const avg = nonZero.length > 0 ? Math.round(nonZero.reduce((a, b) => a + b, 0) / nonZero.length) : 0;
  found.overallScore = avg;

  const settings = getTeacherSettings();
  if (avg >= settings.ranges.sangatBaik) found.kktpStatus = 'Sangat Baik';
  else if (avg >= settings.ranges.tercapai) found.kktpStatus = 'Tercapai';
  else if (avg >= settings.ranges.perluPenguatan) found.kktpStatus = 'Perlu Penguatan';
  else found.kktpStatus = 'Perlu Bimbingan';

  saveStoredStudents(students);
}

export function exportStudentsToCsv(students: StudentAssessmentRecord[]): string {
  const headers = [
    'ID Siswa',
    'Nama Siswa',
    'Kelas',
    'Skor Awal (Diagnostik)',
    'Nilai Akhir (Keseluruhan)',
    'Status KKTP',
    'Village Selesai',
    'Forest Selesai',
    'City Selesai',
    'Desert Selesai',
    'Castle Selesai',
    'IKTP-1 (Konsep Rasio)',
    'IKTP-2 (Sederhanakan)',
    'IKTP-3 (Rasio Senilai)',
    'IKTP-4 (Rasio Satuan)',
    'IKTP-5 (Proporsi Masalah)',
    'IKTP-6 (Strategi)',
    'IKTP-7 (Pemeriksaan/Verifikasi)',
    'IKTP-8 (Refleksi)',
    'Jumlah Refleksi',
  ];

  const rows = students.map((s) => [
    `"${s.id}"`,
    `"${s.name}"`,
    `"${s.className}"`,
    s.diagnosticScore,
    s.overallScore,
    `"${s.kktpStatus}"`,
    s.zoneProgress.village.completed ? 'Ya' : 'Belum',
    s.zoneProgress.forest.completed ? 'Ya' : 'Belum',
    s.zoneProgress.city.completed ? 'Ya' : 'Belum',
    s.zoneProgress.desert.completed ? 'Ya' : 'Belum',
    s.zoneProgress.castle.completed ? 'Ya' : 'Belum',
    s.indicatorScores['ind-1'] || 0,
    s.indicatorScores['ind-2'] || 0,
    s.indicatorScores['ind-3'] || 0,
    s.indicatorScores['ind-4'] || 0,
    s.indicatorScores['ind-5'] || 0,
    s.indicatorScores['ind-6'] || 0,
    s.indicatorScores['ind-7'] || 0,
    s.indicatorScores['ind-8'] || 0,
    s.reflections.length,
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}
