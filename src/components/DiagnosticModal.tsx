import React, { useState } from 'react';
import { DIAGNOSTIC_QUESTIONS } from '../data/curriculumData';
import { Sparkles, CheckCircle2, ArrowRight, BrainCircuit } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundFx } from '../utils/audio';

interface DiagnosticModalProps {
  onComplete: (score: number) => void;
}

export const DiagnosticModal: React.FC<DiagnosticModalProps> = ({ onComplete }) => {
  const [qIndex, setQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [inputVal, setInputVal] = useState('');
  const [scores, setScores] = useState<number[]>([]);
  const [isFinished, setIsFinished] = useState(false);

  const currentQ = DIAGNOSTIC_QUESTIONS[qIndex];

  const handleNext = () => {
    let isCorrect = false;
    if (currentQ.type === 'multiple-choice') {
      const chosen = currentQ.options?.find((o) => o.id === selectedOption);
      isCorrect = chosen?.isCorrect || false;
    } else {
      const clean = inputVal.trim().toLowerCase().replace(/\s+/g, '');
      const target = currentQ.correctAnswer.toLowerCase().replace(/\s+/g, '');
      const alts = currentQ.acceptedAlternatives?.map((a) => a.toLowerCase().replace(/\s+/g, '')) || [];
      isCorrect = clean === target || alts.includes(clean);
    }

    if (isCorrect) soundFx.playCorrect();
    else soundFx.playWrong();

    const newScores = [...scores, isCorrect ? 100 : 0];
    setScores(newScores);

    if (qIndex + 1 < DIAGNOSTIC_QUESTIONS.length) {
      setQIndex(qIndex + 1);
      setSelectedOption(null);
      setInputVal('');
    } else {
      const avg = Math.round(newScores.reduce((a, b) => a + b, 0) / newScores.length);
      setIsFinished(true);
      confetti({ particleCount: 70, spread: 60 });
    }
  };

  const finalScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/90 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border-4 border-cyan-400 rounded-3xl w-full max-w-xl shadow-2xl text-white overflow-hidden my-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-600 to-blue-700 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-xl">
              <BrainCircuit className="w-6 h-6 text-cyan-200" />
            </div>
            <div>
              <div className="text-xs font-black tracking-wider text-cyan-200 uppercase">
                Asesmen Awal Pembelajaran
              </div>
              <h2 className="text-lg sm:text-xl font-black">Tes Diagnostik Rasio</h2>
            </div>
          </div>
          <span className="text-xs font-bold bg-cyan-900/80 px-2.5 py-1 rounded-full border border-cyan-400">
            {qIndex + 1} / {DIAGNOSTIC_QUESTIONS.length}
          </span>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {!isFinished ? (
            <div className="space-y-4">
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 text-xs text-slate-300">
                <span className="font-bold text-cyan-300 block mb-0.5">Petunjuk:</span>
                Jawablah 3 pertanyaan singkat ini untuk mengetahui pemahaman awalmu sebelum memulai petualangan di RATIOVERSE.
              </div>

              <div className="bg-indigo-950/40 border border-indigo-700/60 p-4 rounded-2xl">
                <span className="text-xs font-bold text-amber-400 block mb-1">
                  Kisah: {currentQ.contextStory}
                </span>
                <p className="text-sm sm:text-base font-bold text-white">{currentQ.problemPrompt}</p>
              </div>

              {currentQ.type === 'multiple-choice' ? (
                <div className="space-y-2">
                  {currentQ.options?.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setSelectedOption(opt.id)}
                      className={`w-full text-left p-3 rounded-2xl border-2 transition font-medium text-xs sm:text-sm cursor-pointer ${
                        selectedOption === opt.id
                          ? 'bg-cyan-500/20 border-cyan-400 text-white font-bold'
                          : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              ) : (
                <div>
                  <input
                    type="text"
                    value={inputVal}
                    onChange={(e) => setInputVal(e.target.value)}
                    placeholder="Ketik jawabanmu..."
                    className="w-full bg-slate-950 border-2 border-slate-700 focus:border-cyan-400 rounded-2xl px-4 py-3 text-base font-mono text-cyan-300 outline-none"
                    onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                  />
                </div>
              )}

              <button
                onClick={handleNext}
                disabled={currentQ.type === 'multiple-choice' ? !selectedOption : !inputVal.trim()}
                className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 disabled:opacity-50 text-slate-950 font-black py-3 rounded-2xl shadow-xl flex items-center justify-center gap-2 cursor-pointer transition text-sm mt-2"
              >
                <span>{qIndex + 1 < DIAGNOSTIC_QUESTIONS.length ? 'Pertanyaan Berikutnya' : 'Selesai & Lihat Hasil'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="space-y-4 text-center py-2 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-cyan-500/20 border-2 border-cyan-400 text-cyan-300 flex items-center justify-center mx-auto text-3xl font-black">
                {finalScore}%
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Hasil Asesmen Awal Siap!</h3>
                <p className="text-xs sm:text-sm text-slate-300 mt-1">
                  Skor diagnostikmu telah tersimpan untuk dipantau oleh bapak/ibu guru di rapor belajarmu.
                </p>
              </div>

              <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700 text-xs text-left text-slate-300 space-y-1">
                <span className="font-bold text-amber-300 block">Rekomendasi Petualangan:</span>
                <p>
                  Mulailah dari <strong>Ratio Village</strong> untuk mematangkan konsep perbandingan dan urutan, lalu
                  taklukkan jembatan di <strong>Simplify Forest</strong>!
                </p>
              </div>

              <button
                onClick={() => onComplete(finalScore)}
                className="w-full bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-300 hover:to-teal-400 text-slate-950 font-black py-3 rounded-2xl shadow-xl flex items-center justify-center gap-2 text-sm cursor-pointer transition"
              >
                <Sparkles className="w-5 h-5 text-slate-950" />
                <span>Masuki Dunia 3D RATIOVERSE</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
