import React, { useState, useMemo } from 'react';
import {
  StudentAssessmentRecord,
  TeacherSettings,
  KKTP_INDICATORS,
  ZoneId,
} from '../types/game';
import {
  getStoredStudents,
  getTeacherSettings,
  saveTeacherSettings,
  exportStudentsToCsv,
} from '../data/studentStore';
import {
  GraduationCap,
  Users,
  Award,
  AlertTriangle,
  Download,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Settings,
  Sliders,
  ChevronDown,
  ChevronUp,
  BookOpen,
  ArrowLeft,
  Bot,
  Sparkles,
} from 'lucide-react';

interface TeacherDashboardProps {
  onBackToGame: () => void;
  onLogout?: () => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ onBackToGame, onLogout }) => {
  const [students, setStudents] = useState<StudentAssessmentRecord[]>(getStoredStudents());
  const [settings, setSettings] = useState<TeacherSettings>(getTeacherSettings());
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Selected student for detailed drilldown modal
  const [selectedStudent, setSelectedStudent] = useState<StudentAssessmentRecord | null>(null);

  // Save updated settings
  const handleUpdateKKTP = (newThreshold: number) => {
    const updated: TeacherSettings = {
      ...settings,
      kktpThreshold: newThreshold,
      ranges: {
        ...settings.ranges,
        tercapai: newThreshold,
      },
    };
    setSettings(updated);
    saveTeacherSettings(updated);

    // Refresh student categories based on new threshold
    const updatedStudents = students.map((s) => {
      let status: StudentAssessmentRecord['kktpStatus'] = 'Perlu Bimbingan';
      if (s.overallScore >= updated.ranges.sangatBaik) status = 'Sangat Baik';
      else if (s.overallScore >= updated.ranges.tercapai) status = 'Tercapai';
      else if (s.overallScore >= updated.ranges.perluPenguatan) status = 'Perlu Penguatan';
      return { ...s, kktpStatus: status };
    });
    setStudents(updatedStudents);
  };

  // Filtered student list
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchClass = classFilter === 'ALL' || s.className === classFilter;
      const matchStatus = statusFilter === 'ALL' || s.kktpStatus === statusFilter;
      return matchSearch && matchClass && matchStatus;
    });
  }, [students, searchQuery, classFilter, statusFilter]);

  // Aggregate Metrics
  const totalStudents = students.length;
  const classAvg = totalStudents > 0 ? Math.round(students.reduce((a, b) => a + b.overallScore, 0) / totalStudents) : 0;
  const passedCount = students.filter((s) => s.kktpStatus === 'Sangat Baik' || s.kktpStatus === 'Tercapai').length;
  const passRate = totalStudents > 0 ? Math.round((passedCount / totalStudents) * 100) : 0;
  const interventionCount = students.filter((s) => s.kktpStatus === 'Perlu Penguatan' || s.kktpStatus === 'Perlu Bimbingan').length;

  // Download CSV
  const handleDownloadCsv = () => {
    const csvContent = exportStudentsToCsv(students);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Rekap_Nilai_Rasio_Kelas6_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <nav className="bg-slate-900 border-b border-slate-800 px-4 py-3 sm:px-6 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToGame}
            className="bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-1.5 transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Game 3D</span>
          </button>
          {onLogout && (
            <button
              onClick={onLogout}
              className="bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800 px-3 py-1.5 rounded-xl font-bold text-xs sm:text-sm transition cursor-pointer"
              title="Keluar dari sesi Guru"
            >
              Logout Guru
            </button>
          )}
          <div className="h-6 w-px bg-slate-800 hidden sm:block" />
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-black text-white leading-tight">
                Dashboard Asesmen Guru • RATIOVERSE
              </h1>
              <p className="text-[11px] text-slate-400">
                Pemantauan Capaian Pembelajaran Matematika Bab Rasio Kelas VI SD
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* KKTP Settings Button */}
          <button
            onClick={() => setShowSettingsModal(true)}
            className="bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-2 rounded-xl text-xs font-bold text-slate-200 flex items-center gap-1.5 transition cursor-pointer"
          >
            <Sliders className="w-4 h-4 text-cyan-400" />
            <span>Atur KKTP (Ambang: {settings.kktpThreshold})</span>
          </button>

          {/* Download CSV Button */}
          <button
            onClick={handleDownloadCsv}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-lg transition cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Unduh Rekap CSV</span>
          </button>
        </div>
      </nav>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Summary Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
              <span>Total Peserta Didik</span>
              <Users className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white mt-1">{totalStudents}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Kelas 6A & 6B terdaftar</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
              <span>Rata-Rata Capaian Kelas</span>
              <Award className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-400 mt-1">{classAvg} / 100</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Skor matematika murni</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
              <span>Ketuntasan KKTP</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1">{passRate}%</div>
            <div className="text-[11px] text-slate-500 mt-0.5">{passedCount} siswa mencapai kriteria</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
              <span>Perlu Penguatan Khusus</span>
              <AlertTriangle className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-rose-400 mt-1">{interventionCount}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Memerlukan bimbingan guru</div>
          </div>
        </div>

        {/* 8 KKTP Indicators Progress Breakdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-400" />
                <span>Penguasaan 8 Indikator Ketercapaian Tujuan Pembelajaran (IKTP)</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Nilai penguasaan kompetensi rasio matematika dipisahkan secara murni dari gamifikasi.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {KKTP_INDICATORS.map((ind) => {
              // Calculate average score for this indicator
              const scores = students.map((s) => s.indicatorScores[ind.id] || 0);
              const avg = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
              const isPassed = avg >= settings.kktpThreshold;

              return (
                <div key={ind.id} className="bg-slate-950/60 border border-slate-800/80 p-3 rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-200">
                      <span className="text-indigo-400 mr-1.5">{ind.code}:</span>
                      {ind.title}
                    </span>
                    <span className={`font-black ${isPassed ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {avg}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        isPassed ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${avg}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-slate-500 line-clamp-1">{ind.description}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-[260px]">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari berdasarkan nama siswa atau ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Class Filter */}
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-300 outline-none"
            >
              <option value="ALL">Semua Kelas</option>
              <option value="6A">Kelas 6A</option>
              <option value="6B">Kelas 6B</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-300 outline-none"
            >
              <option value="ALL">Semua Status KKTP</option>
              <option value="Sangat Baik">Sangat Baik (90-100)</option>
              <option value="Tercapai">Tercapai (75-89)</option>
              <option value="Perlu Penguatan">Perlu Penguatan (60-74)</option>
              <option value="Perlu Bimbingan">Perlu Bimbingan (&lt;60)</option>
            </select>
          </div>
        </div>

        {/* Student Records Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 font-bold uppercase text-[11px]">
                <tr>
                  <th className="p-3.5">Peserta Didik</th>
                  <th className="p-3.5">Kelas</th>
                  <th className="p-3.5 text-center">Diagnostik Awal</th>
                  <th className="p-3.5 text-center">Progres Zona (1-5)</th>
                  <th className="p-3.5 text-center">Nilai Akhir Rasio</th>
                  <th className="p-3.5 text-center">Status KKTP</th>
                  <th className="p-3.5 text-center">Refleksi</th>
                  <th className="p-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 font-medium text-slate-200">
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((s) => {
                    const zones = Object.values(s.zoneProgress);
                    const completedCount = zones.filter((z) => z.completed).length;

                    return (
                      <tr key={s.id} className="hover:bg-slate-850/60 transition">
                        <td className="p-3.5">
                          <div className="font-bold text-white">{s.name}</div>
                          <div className="text-[10px] text-slate-500 font-mono">{s.id}</div>
                        </td>
                        <td className="p-3.5 text-slate-400">{s.className}</td>
                        <td className="p-3.5 text-center font-bold text-cyan-400">
                          {s.diagnosticScore > 0 ? `${s.diagnosticScore}%` : '-'}
                        </td>
                        <td className="p-3.5 text-center">
                          <div className="inline-flex items-center gap-1">
                            <span className="font-bold text-amber-300">{completedCount}</span>
                            <span className="text-slate-500">/ 5 Zona</span>
                          </div>
                        </td>
                        <td className="p-3.5 text-center">
                          <span className="font-black text-sm text-white px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-700">
                            {s.overallScore}
                          </span>
                        </td>
                        <td className="p-3.5 text-center">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                              s.kktpStatus === 'Sangat Baik'
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                : s.kktpStatus === 'Tercapai'
                                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                                : s.kktpStatus === 'Perlu Penguatan'
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                            }`}
                          >
                            {s.kktpStatus}
                          </span>
                        </td>
                        <td className="p-3.5 text-center">
                          <span className="text-xs text-indigo-300 font-bold bg-indigo-950/40 px-2 py-1 rounded-md border border-indigo-800">
                            {s.reflections.length} Catatan
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => setSelectedStudent(s)}
                            className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-3 py-1.5 rounded-xl text-xs transition cursor-pointer"
                          >
                            Rincian Capaian
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-500">
                      Tidak ada peserta didik yang sesuai dengan filter pencarian.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Student Drilldown Detail Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border-4 border-blue-400 rounded-3xl w-full max-w-3xl shadow-2xl text-white overflow-hidden my-auto">
            <div className="bg-gradient-to-r from-blue-700 to-indigo-800 p-4 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-blue-200">Portofolio Capaian Belajar Siswa</span>
                <h2 className="text-lg sm:text-xl font-black text-white">
                  {selectedStudent.name} (Kelas {selectedStudent.className})
                </h2>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="w-8 h-8 rounded-full bg-slate-900/30 text-white font-black flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-5 max-h-[75vh] overflow-y-auto text-xs sm:text-sm">
              {/* Score Header Info */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                  <span className="text-slate-400 block text-[11px]">Asesmen Awal (Diagnostik)</span>
                  <span className="text-lg font-black text-cyan-400">{selectedStudent.diagnosticScore}%</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                  <span className="text-slate-400 block text-[11px]">Nilai Akhir (Keseluruhan)</span>
                  <span className="text-lg font-black text-amber-400">{selectedStudent.overallScore}%</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                  <span className="text-slate-400 block text-[11px]">Status Ketercapaian KKTP</span>
                  <span className="text-sm font-black text-emerald-400">{selectedStudent.kktpStatus}</span>
                </div>
              </div>

              {/* Progress per 5 Zones */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                <h3 className="font-bold text-slate-200 text-xs uppercase tracking-wider">
                  Progres Pengerjaan 5 Zona Pembelajaran
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 pt-1">
                  {(['village', 'forest', 'city', 'desert', 'castle'] as ZoneId[]).map((zid) => {
                    const zp = selectedStudent.zoneProgress[zid];
                    return (
                      <div
                        key={zid}
                        className={`p-2.5 rounded-xl border text-center ${
                          zp?.completed
                            ? 'bg-emerald-950/40 border-emerald-700 text-emerald-300'
                            : 'bg-slate-900 border-slate-800 text-slate-500'
                        }`}
                      >
                        <div className="font-bold capitalize">{zid}</div>
                        <div className="text-[11px] mt-0.5">
                          {zp?.completed ? `Skor: ${zp.score}% (${zp.attempts}x coba)` : 'Belum Selesai'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Indicator Scores */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                <h3 className="font-bold text-slate-200 text-xs uppercase tracking-wider">
                  Rincian Nilai per Indikator KKTP (Matematika Murni)
                </h3>
                <div className="space-y-1.5 pt-1">
                  {KKTP_INDICATORS.map((ind) => {
                    const score = selectedStudent.indicatorScores[ind.id] || 0;
                    return (
                      <div
                        key={ind.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800/80 text-xs"
                      >
                        <span className="text-slate-300 font-medium">
                          <strong className="text-indigo-400 mr-1">{ind.code}:</strong> {ind.title}
                        </span>
                        <span className="font-black text-white">{score}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Student Reflections */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                <h3 className="font-bold text-slate-200 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span>Jurnal Refleksi Pembelajaran Mendalam Siswa</span>
                </h3>

                {selectedStudent.reflections.length > 0 ? (
                  selectedStudent.reflections.map((ref, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between text-indigo-300 font-bold">
                        <span>Zona: {ref.zoneId.toUpperCase()}</span>
                        <span className="text-slate-500 font-normal">{ref.date}</span>
                      </div>
                      <div className="text-slate-300">
                        <span className="text-amber-300 font-semibold block">1. Konsep yang dipahami:</span>
                        {ref.concept}
                      </div>
                      <div className="text-slate-300">
                        <span className="text-cyan-300 font-semibold block">2. Strategi penyelesaian:</span>
                        {ref.strategy}
                      </div>
                      <div className="text-slate-300">
                        <span className="text-emerald-300 font-semibold block">3. Cara verifikasi hasil:</span>
                        {ref.check}
                      </div>
                      {ref.aiTeacherFeedback && (
                        <div className="bg-indigo-950/50 border border-indigo-700/60 p-2.5 rounded-lg text-indigo-200 italic mt-2">
                          <span className="font-bold not-italic block text-indigo-300 flex items-center gap-1">
                            <Bot className="w-3.5 h-3.5" /> Ulasan Guru Pembimbing AI:
                          </span>
                          "{ref.aiTeacherFeedback}"
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 italic text-xs">Belum ada jurnal refleksi yang dikirimkan.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* KKTP Settings Configuration Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-sm">
          <div className="bg-slate-900 border-4 border-cyan-400 rounded-3xl w-full max-w-md shadow-2xl text-white p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-black flex items-center gap-2">
                <Settings className="w-5 h-5 text-cyan-400" />
                <span>Pengaturan KKTP Satuan Pendidikan</span>
              </h2>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Guru dapat menyesuaikan kriteria ketercapaian tujuan pembelajaran sesuai dengan karakteristik peserta
              didik di satuan pendidikan masing-masing.
            </p>

            <div className="space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <label className="text-xs font-bold text-cyan-300 block">
                Ambang Batas Ketuntasan (KKTP Default = 75):
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="50"
                  max="90"
                  step="5"
                  value={settings.kktpThreshold}
                  onChange={(e) => handleUpdateKKTP(Number(e.target.value))}
                  className="flex-1 accent-cyan-400 cursor-pointer"
                />
                <span className="font-black text-cyan-300 text-lg w-10 text-right">
                  {settings.kktpThreshold}
                </span>
              </div>

              <div className="text-[11px] text-slate-400 space-y-1 pt-2 border-t border-slate-800">
                <div>• 90 - 100 : Sangat Baik</div>
                <div>• {settings.kktpThreshold} - 89 : Tercapai</div>
                <div>• 60 - {settings.kktpThreshold - 1} : Perlu Penguatan</div>
                <div>• Di bawah 60 : Perlu Bimbingan</div>
              </div>
            </div>

            <button
              onClick={() => setShowSettingsModal(false)}
              className="w-full bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-black py-2.5 rounded-xl cursor-pointer transition text-xs"
            >
              Simpan & Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
