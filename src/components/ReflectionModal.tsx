import React, { useState } from 'react';
import { StudentReflection, ZoneId } from '../types/game';
import { ZONES_DATA } from '../data/curriculumData';
import { Sparkles, MessageSquareHeart, Check, ArrowRight, Bot } from 'lucide-react';
import { soundFx } from '../utils/audio';

interface ReflectionModalProps {
  zoneId: ZoneId;
  onSubmitReflection: (reflection: StudentReflection) => void;
  onClose: () => void;
}

export const ReflectionModal: React.FC<ReflectionModalProps> = ({
  zoneId,
  onSubmitReflection,
  onClose,
}) => {
  const zone = ZONES_DATA[zoneId];

  const [concept, setConcept] = useState('');
  const [strategy, setStrategy] = useState('');
  const [check, setCheck] = useState('');
  const [challenge, setChallenge] = useState('');
  const [realWorld, setRealWorld] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);

  // Quick preset chips to make typing easy on tablet/mobile for grade 6 students
  const conceptOptions = [
    'Rasio membandingkan 2 nilai dan urutannya penting (a:b)',
    'Menyederhanakan rasio dengan membagi kedua nilai dengan FPB',
    'Rasio senilai didapat dengan mengalikan/membagi angka yang sama',
    'Rasio satuan menemukan nilai per satu benda',
    'Perbandingan senilai bertambah bersama, berbeda dengan berbalik nilai',
  ];

  const strategyOptions = [
    'Menghitung dan memvisualisasikan benda',
    'Membagi bertahap atau menggunakan FPB',
    'Membuat tabel kelipatan rasio',
    'Mencari nilai per 1 satuan terlebih dahulu',
    'Menggunakan perkalian silang proporsi',
  ];

  const checkOptions = [
    'Mengalikan kembali hasil bagi dengan pembagi',
    'Memastikan urutan penyebutan di soal',
    'Mengecek kesetaraan menggunakan perkalian silang',
    'Membaca ulang soal dan memeriksa logika akal sehat',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!concept.trim() || !strategy.trim()) return;

    setIsSubmitting(true);
    let teacherFeedback =
      'Refleksi belajarmu sangat mendalam! Kamu telah menghubungkan konsep matematika dengan strategi berpikir kritis dan penerapan di dunia nyata.';

    try {
      const res = await fetch('/api/gemini/reflect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          zoneName: zone.name,
          answers: { concept, strategy, check, challenge, realWorld },
        }),
      });
      const data = await res.json();
      if (data.feedback) teacherFeedback = data.feedback;
    } catch (e) {
      // offline fallback
    }

    setAiFeedback(teacherFeedback);
    soundFx.playVictory();

    const reflectionRecord: StudentReflection = {
      zoneId,
      date: new Date().toISOString().split('T')[0],
      concept,
      strategy,
      check: check || 'Pemeriksaan ulang mandiri',
      challenge: challenge || 'Memilih strategi yang paling cepat',
      realWorld: realWorld || 'Membagi makanan atau resep di rumah',
      aiTeacherFeedback: teacherFeedback,
    };

    onSubmitReflection(reflectionRecord);
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border-4 border-indigo-400 rounded-3xl w-full max-w-2xl shadow-2xl text-white overflow-hidden relative my-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-xl">
              🧘
            </div>
            <div>
              <div className="text-xs font-black tracking-wider text-purple-200 uppercase">
                Pendekatan Pembelajaran Mendalam
              </div>
              <h2 className="text-lg sm:text-xl font-black">Refleksi Belajar: {zone.name}</h2>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-4 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {!aiFeedback ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-xs sm:text-sm text-slate-300">
                Selamat telah menyelesaikan misi di <strong>{zone.name}</strong>! Luangkan sejenak untuk
                merefleksikan proses belajarmu agar pemahamanmu semakin berkesadaran dan bermakna.
              </p>

              {/* 1. Apa konsep rasio yang kamu pelajari? */}
              <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700 space-y-2">
                <label className="text-xs sm:text-sm font-bold text-amber-300 block">
                  1. Apa konsep rasio yang baru saja kamu pelajari di zona ini?
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {conceptOptions.map((opt, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setConcept(opt)}
                      className="text-[11px] bg-slate-900 hover:bg-slate-700 text-slate-300 border border-slate-700 px-2.5 py-1 rounded-xl transition cursor-pointer"
                    >
                      + {opt}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  required
                  value={concept}
                  onChange={(e) => setConcept(e.target.value)}
                  placeholder="Ketik atau pilih konsep yang kamu pahami..."
                  className="w-full bg-slate-950 border border-slate-700 focus:border-indigo-400 rounded-xl px-3 py-2 text-xs sm:text-sm text-white outline-none"
                />
              </div>

              {/* 2. Strategi apa yang kamu gunakan? */}
              <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700 space-y-2">
                <label className="text-xs sm:text-sm font-bold text-cyan-300 block">
                  2. Strategi apa yang kamu gunakan untuk menyelesaikan soal-soal tadi?
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {strategyOptions.map((opt, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setStrategy(opt)}
                      className="text-[11px] bg-slate-900 hover:bg-slate-700 text-slate-300 border border-slate-700 px-2.5 py-1 rounded-xl transition cursor-pointer"
                    >
                      + {opt}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  required
                  value={strategy}
                  onChange={(e) => setStrategy(e.target.value)}
                  placeholder="Ceritakan strategimu..."
                  className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-xl px-3 py-2 text-xs sm:text-sm text-white outline-none"
                />
              </div>

              {/* 3. Bagaimana memeriksa kebenaran hasil? */}
              <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700 space-y-2">
                <label className="text-xs sm:text-sm font-bold text-emerald-300 block">
                  3. Bagaimana caramu memeriksa bahwa jawabanmu benar (verifikasi)?
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {checkOptions.map((opt, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setCheck(opt)}
                      className="text-[11px] bg-slate-900 hover:bg-slate-700 text-slate-300 border border-slate-700 px-2.5 py-1 rounded-xl transition cursor-pointer"
                    >
                      + {opt}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={check}
                  onChange={(e) => setCheck(e.target.value)}
                  placeholder="Misal: mengalikan kembali, perkalian silang..."
                  className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-400 rounded-xl px-3 py-2 text-xs sm:text-sm text-white outline-none"
                />
              </div>

              {/* 4. Bagian mana yang paling menantang? */}
              <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700 space-y-2">
                <label className="text-xs sm:text-sm font-bold text-rose-300 block">
                  4. Bagian mana yang paling menantang atau sulit bagimu?
                </label>
                <input
                  type="text"
                  value={challenge}
                  onChange={(e) => setChallenge(e.target.value)}
                  placeholder="Misal: menghitung angka besar, menentukan FPB, atau membedakan urutan..."
                  className="w-full bg-slate-950 border border-slate-700 focus:border-rose-400 rounded-xl px-3 py-2 text-xs sm:text-sm text-white outline-none"
                />
              </div>

              {/* 5. Penerapan dalam kehidupan sehari-hari */}
              <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700 space-y-2">
                <label className="text-xs sm:text-sm font-bold text-yellow-300 block">
                  5. Apa yang akan kamu lakukan jika menemukan situasi serupa dalam kehidupan sehari-hari?
                </label>
                <input
                  type="text"
                  value={realWorld}
                  onChange={(e) => setRealWorld(e.target.value)}
                  placeholder="Misal: membuat takaran sirup es manis, berbelanja pensil, membagi porsi makanan..."
                  className="w-full bg-slate-950 border border-slate-700 focus:border-yellow-400 rounded-xl px-3 py-2 text-xs sm:text-sm text-white outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !concept.trim() || !strategy.trim()}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 disabled:opacity-50 text-white font-black py-3 rounded-2xl shadow-xl flex items-center justify-center gap-2 cursor-pointer transition text-sm"
              >
                <Sparkles className="w-5 h-5 text-yellow-300" />
                <span>{isSubmitting ? 'Menganalisis Refleksi...' : 'Kirim Refleksi & Buka Zona Baru'}</span>
              </button>
            </form>
          ) : (
            /* AI Teacher Feedback Presentation */
            <div className="space-y-5 animate-fade-in py-2">
              <div className="bg-gradient-to-br from-indigo-950 to-purple-950 border-2 border-indigo-400 rounded-3xl p-5 shadow-inner">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-500/30 text-indigo-300 flex items-center justify-center border border-indigo-400">
                    <Bot className="w-6 h-6 text-cyan-300" />
                  </div>
                  <div>
                    <h3 className="font-black text-white text-base">Catatan Refleksi Guru Pembimbing</h3>
                    <span className="text-xs text-indigo-300">Apresiasi Pendekatan Pembelajaran Mendalam</span>
                  </div>
                </div>
                <p className="text-sm text-slate-200 leading-relaxed italic bg-slate-900/60 p-4 rounded-2xl border border-indigo-800">
                  "{aiFeedback}"
                </p>
              </div>

              <div className="bg-emerald-950/40 border border-emerald-600/60 p-4 rounded-2xl text-xs sm:text-sm text-emerald-200 flex items-center gap-3">
                <span className="text-2xl">🌟</span>
                <div>
                  <strong className="block text-emerald-300">Gerbang Petualangan Terbuka!</strong>
                  Refleksimu telah tercatat di buku rapor belajar guru dan zona berikutnya siap dijelajahi.
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black py-3.5 rounded-2xl shadow-xl flex items-center justify-center gap-2 text-sm cursor-pointer transition"
              >
                <span>Lanjutkan Penjelajahan 3D</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
