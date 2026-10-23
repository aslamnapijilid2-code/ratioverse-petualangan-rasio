import React, { useState } from 'react';
import {
  Sparkles,
  Play,
  HelpCircle,
  BookOpen,
  GraduationCap,
  Gamepad2,
  Compass,
  ArrowRight,
  ShieldCheck,
  Award,
} from 'lucide-react';
import { soundFx } from '../utils/audio';

interface LandingPageProps {
  playerName: string;
  onSetPlayerName: (name: string) => void;
  playerClass?: string;
  onSetPlayerClass?: (className: string) => void;
  onStartGame: () => void;
  onOpenTeacherDashboard: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  playerName,
  onSetPlayerName,
  playerClass = '6A',
  onSetPlayerClass,
  onStartGame,
  onOpenTeacherDashboard,
}) => {
  const [showGuide, setShowGuide] = useState(false);
  const [showCurriculumProfile, setShowCurriculumProfile] = useState(false);

  const handleStart = () => {
    soundFx.playVictory();
    onStartGame();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between relative overflow-hidden font-sans select-none">
      {/* Background Decorative 3D Voxel Pattern */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-emerald-500 blur-3xl" />
        <div className="absolute top-1/2 -right-24 w-96 h-96 rounded-full bg-amber-500 blur-3xl" />
        <div className="absolute -bottom-24 left-1/3 w-96 h-96 rounded-full bg-purple-600 blur-3xl" />
      </div>

      {/* Top Bar */}
      <header className="relative z-10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-300 flex items-center justify-center font-black text-slate-950 text-xl shadow-lg">
            R
          </div>
          <div>
            <div className="text-sm font-black tracking-wider text-amber-300">RATIOVERSE</div>
            <div className="text-[10px] text-slate-400">Matematika Kelas VI SD • Kurikulum Merdeka</div>
          </div>
        </div>

        <button
          onClick={onOpenTeacherDashboard}
          className="bg-slate-900/80 hover:bg-slate-800 text-blue-300 border border-blue-500/50 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
        >
          <GraduationCap className="w-4 h-4 text-blue-400" />
          <span>Dashboard Guru (PIN)</span>
        </button>
      </header>

      {/* Hero Content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4 max-w-3xl mx-auto py-8">
        {/* Animated Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-950/80 border border-indigo-500/50 text-indigo-300 text-xs font-bold mb-4 shadow">
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>Game Edukasi 3D Voxel Penjelajahan Konsep Rasio</span>
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-emerald-400 drop-shadow-md">
          RATIOVERSE
        </h1>
        <div className="text-lg sm:text-2xl font-black text-emerald-300 mt-1 uppercase tracking-wide">
          Petualangan Rasio
        </div>

        {/* Tagline */}
        <p className="text-sm sm:text-base text-slate-300 mt-3 max-w-xl italic">
          "Jelajahi Dunia, Pecahkan Rasio, Jadilah Master Matematika!"
        </p>

        {/* Name & Class Input Box */}
        <div className="w-full max-w-md bg-slate-900/90 border-2 border-slate-700 focus-within:border-amber-400 rounded-3xl p-5 shadow-2xl mt-6 space-y-4">
          <div className="text-left space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Nama Peserta Didik (Pemain):
              </label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => onSetPlayerName(e.target.value)}
                placeholder="Ketik namamu di sini..."
                className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-2xl px-4 py-2.5 text-sm text-white font-bold outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Pilih Kelas:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {['6A', '6B'].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => onSetPlayerClass && onSetPlayerClass(c)}
                    className={`py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                      playerClass === c
                        ? 'bg-amber-400 text-slate-950 border-amber-300 shadow'
                        : 'bg-slate-950 text-slate-300 border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    Kelas {c}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={handleStart}
            disabled={!playerName.trim()}
            className="w-full bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 disabled:opacity-50 text-slate-950 font-black py-4 rounded-2xl shadow-xl flex items-center justify-center gap-2 text-base cursor-pointer transition transform active:scale-95"
          >
            <Play className="w-5 h-5 fill-slate-950" />
            <span>Mulai Petualangan 3D</span>
          </button>
        </div>

        {/* Feature Pills */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
          <button
            onClick={() => setShowGuide(true)}
            className="bg-slate-900/70 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
          >
            <Gamepad2 className="w-4 h-4 text-emerald-400" />
            <span>Petunjuk Kontrol 3D</span>
          </button>

          <button
            onClick={() => setShowCurriculumProfile(true)}
            className="bg-slate-900/70 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-indigo-400" />
            <span>Profil Pembelajaran & KKTP</span>
          </button>
        </div>
      </main>

      {/* Footer Info */}
      <footer className="relative z-10 px-6 py-3 border-t border-slate-900 text-center text-xs text-slate-500">
        Pendekatan Pembelajaran Mendalam (Deep Learning) • Berkesadaran, Bermakna, Menggembirakan
      </footer>

      {/* Game Control Instructions Modal */}
      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
          <div className="bg-slate-900 border-4 border-emerald-400 rounded-3xl w-full max-w-md shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-black flex items-center gap-2">
                <Gamepad2 className="w-5 h-5 text-emerald-400" />
                <span>Petunjuk Bermain & Kontrol 3D</span>
              </h2>
              <button
                onClick={() => setShowGuide(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span>Bergerak (Maju/Mundur/Kiri/Kanan):</span>
                <span className="font-mono font-bold text-amber-400">Tombol W, A, S, D atau Panah</span>
              </div>
              <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span>Melompat (Jump):</span>
                <span className="font-mono font-bold text-amber-400">Tombol SPASI</span>
              </div>
              <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span>Interaksi NPC / Buka Misi:</span>
                <span className="font-mono font-bold text-amber-400">Tombol E atau Sentuh Tombol Aksi</span>
              </div>
              <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span>Layar Sentuh (HP/Tablet):</span>
                <span className="font-mono font-bold text-amber-400">Virtual Joystick & Tombol Virtual</span>
              </div>
              <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span>Kamera 3D:</span>
                <span className="font-mono font-bold text-amber-400">Third-person otomatis mengikuti</span>
              </div>
            </div>

            <button
              onClick={() => setShowGuide(false)}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl text-xs cursor-pointer transition"
            >
              Saya Mengerti
            </button>
          </div>
        </div>
      )}

      {/* Curriculum Profile Modal */}
      {showCurriculumProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
          <div className="bg-slate-900 border-4 border-indigo-400 rounded-3xl w-full max-w-lg shadow-2xl p-5 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-black flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-400" />
                <span>Profil Pembelajaran Kurikulum Merdeka</span>
              </h2>
              <button
                onClick={() => setShowCurriculumProfile(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <strong className="text-amber-400 block mb-1">Capaian Pembelajaran (CP) Elemen Bilangan:</strong>
                Peserta didik mampu memahami konsep rasio, menyederhanakan rasio, menentukan rasio senilai dan rasio satuan, serta menyelesaikan masalah proporsi sehari-hari.
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <strong className="text-indigo-300 block mb-1">3 Pilar Pembelajaran Mendalam (Deep Learning):</strong>
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>Memahami:</strong> Eksplorasi objek konkret 3D & representasi visual.</li>
                  <li><strong>Mengaplikasi:</strong> Misi pemecahan masalah kontekstual & strategi matematis.</li>
                  <li><strong>Merefleksi:</strong> Jurnal kesadaran diri & metakognisi di setiap akhir zona.</li>
                </ul>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <strong className="text-emerald-300 block mb-1">5 Zona Petualangan:</strong>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Ratio Village: Konsep rasio & pengaruh urutan pembanding.</li>
                  <li>Simplify Forest: Menyederhanakan rasio dengan FPB.</li>
                  <li>Proportion City: Rasio senilai & faktor pengali/pembagi.</li>
                  <li>Unit Ratio Desert: Rasio satuan (unit rate) dalam kehidupan nyata.</li>
                  <li>Proportion Castle: Proporsi bertingkat, skala peta, & Boss Battle.</li>
                </ol>
              </div>
            </div>

            <button
              onClick={() => setShowCurriculumProfile(false)}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-xl text-xs cursor-pointer transition"
            >
              Tutup Profil
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
