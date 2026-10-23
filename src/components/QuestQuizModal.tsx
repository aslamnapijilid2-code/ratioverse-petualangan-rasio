import React, { useState } from 'react';
import { QuestionData, ZoneId } from '../types/game';
import { ZONES_DATA } from '../data/curriculumData';
import {
  HelpCircle,
  Sparkles,
  CheckCircle2,
  XCircle,
  Lightbulb,
  ArrowRight,
  ShieldAlert,
  Bot,
  Layers,
  SearchCheck,
  RotateCcw,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundFx } from '../utils/audio';

interface QuestQuizModalProps {
  zoneId: ZoneId;
  questionIndex: number;
  onClose: () => void;
  onCompleteQuestion: (question: QuestionData, isCorrect: boolean, attempts: number) => void;
  onAllQuestionsCompleted: () => void;
}

export const QuestQuizModal: React.FC<QuestQuizModalProps> = ({
  zoneId,
  questionIndex,
  onClose,
  onCompleteQuestion,
  onAllQuestionsCompleted,
}) => {
  const zone = ZONES_DATA[zoneId];
  const questions = zone.questions;
  const currentQ = questions[questionIndex] || questions[0];

  const [inputAnswer, setInputAnswer] = useState('');
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [selectedStrategy, setSelectedStrategy] = useState<string>('');
  const [selectedVerification, setSelectedVerification] = useState<string>('');

  const [attempts, setAttempts] = useState(0);
  const [revealedHintLevel, setRevealedHintLevel] = useState<number>(0);
  const [aiHint, setAiHint] = useState<string | null>(null);
  const [isLoadingAiHint, setIsLoadingAiHint] = useState<boolean>(false);

  const [feedbackState, setFeedbackState] = useState<'idle' | 'correct' | 'incorrect'>('idle');
  const [feedbackMessage, setFeedbackMessage] = useState<string>('');
  const [isCompletedStep, setIsCompletedStep] = useState(false);

  // Helper to validate answers
  const checkAnswer = () => {
    let isCorrect = false;
    const currentAttempts = attempts + 1;
    setAttempts(currentAttempts);

    if (currentQ.type === 'multiple-choice') {
      const chosen = currentQ.options?.find((o) => o.id === selectedOptionId);
      isCorrect = chosen?.isCorrect || false;
    } else {
      const cleanInput = inputAnswer.trim().toLowerCase().replace(/\s+/g, '');
      const cleanTarget = currentQ.correctAnswer.toLowerCase().replace(/\s+/g, '');
      const cleanAlternatives =
        currentQ.acceptedAlternatives?.map((a) => a.toLowerCase().replace(/\s+/g, '')) || [];

      if (cleanInput === cleanTarget || cleanAlternatives.includes(cleanInput)) {
        isCorrect = true;
      }
    }

    if (isCorrect) {
      soundFx.playCorrect();
      setFeedbackState('correct');
      setFeedbackMessage('Jawaban Tepat! Pemahamanmu sangat tajam.');
      setIsCompletedStep(true);
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      });
    } else {
      soundFx.playWrong();
      setFeedbackState('incorrect');
      // Step-by-step educational feedback: unlock hints
      const nextHintLevel = Math.min(2, revealedHintLevel + 1);
      setRevealedHintLevel(nextHintLevel);
      setFeedbackMessage(
        nextHintLevel === 1
          ? 'Belum tepat, jangan berkecil hati! Petunjuk Tingkat 1 telah terbuka di bawah untuk membantumu.'
          : 'Hampir berhasil! Simak Petunjuk Tingkat 2 dan pelajari polanya.'
      );
    }
  };

  const handleNext = () => {
    // Record question result exactly once
    onCompleteQuestion(currentQ, true, Math.max(1, attempts));

    if (questionIndex + 1 < questions.length) {
      // Move to next question inside zone
      setInputAnswer('');
      setSelectedOptionId(null);
      setSelectedStrategy('');
      setSelectedVerification('');
      setAttempts(0);
      setRevealedHintLevel(0);
      setAiHint(null);
      setFeedbackState('idle');
      setIsCompletedStep(false);
    } else {
      // Done with all missions in this zone!
      soundFx.playVictory();
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.5 },
      });
      onAllQuestionsCompleted();
    }
  };

  const requestAiTeacherHint = async () => {
    setIsLoadingAiHint(true);
    try {
      const res = await fetch('/api/gemini/hint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          zoneName: zone.name,
          questionText: currentQ.problemPrompt,
          studentAttempt: inputAnswer || selectedOptionId,
          options: currentQ.options?.map((o) => o.label),
        }),
      });
      const data = await res.json();
      setAiHint(data.hint || currentQ.hintLevel1);
    } catch (e) {
      setAiHint(currentQ.hintLevel1);
    } finally {
      setIsLoadingAiHint(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-slate-900 border-4 border-amber-400 rounded-3xl w-full max-w-2xl shadow-2xl text-white overflow-hidden relative my-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-4 text-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{zone.badgeIcon}</span>
            <div>
              <div className="text-xs font-black tracking-wider uppercase opacity-80">
                {zone.name} • Tantangan {questionIndex + 1} dari {questions.length}
              </div>
              <h2 className="text-lg sm:text-xl font-black">{currentQ.title}</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-900/20 hover:bg-slate-900/40 text-slate-950 font-black flex items-center justify-center text-lg cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Story Context Banner */}
          <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-3.5 text-xs sm:text-sm text-slate-200 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center shrink-0 font-bold">
              📖
            </div>
            <div>
              <span className="font-bold text-amber-300 block mb-0.5">Kisah Misi:</span>
              <p>{currentQ.contextStory}</p>
            </div>
          </div>

          {/* Concrete Visual Representation */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col items-center">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>Model Representasi Visual Benda Nyata</span>
            </div>

            {/* Apple Visuals */}
            {currentQ.concreteVisual.type === 'apples' && (
              <div className="flex flex-wrap items-center justify-center gap-6 py-2">
                <div className="flex flex-col items-center bg-rose-950/40 border border-rose-800/60 rounded-xl px-4 py-2">
                  <div className="flex gap-1.5 text-2xl">
                    {Array.from({ length: currentQ.concreteVisual.data.redCount || 4 }).map((_, i) => (
                      <span key={i} title="Apel Merah">🍎</span>
                    ))}
                  </div>
                  <span className="text-xs font-bold text-rose-300 mt-1">
                    {currentQ.concreteVisual.data.redCount || 4} Apel Merah
                  </span>
                </div>
                <div className="text-xl font-bold text-amber-400">:</div>
                <div className="flex flex-col items-center bg-emerald-950/40 border border-emerald-800/60 rounded-xl px-4 py-2">
                  <div className="flex gap-1.5 text-2xl">
                    {Array.from({ length: currentQ.concreteVisual.data.greenCount || 6 }).map((_, i) => (
                      <span key={i} title="Apel Hijau">🍏</span>
                    ))}
                  </div>
                  <span className="text-xs font-bold text-emerald-300 mt-1">
                    {currentQ.concreteVisual.data.greenCount || 6} Apel Hijau
                  </span>
                </div>
              </div>
            )}

            {/* Students Visual */}
            {currentQ.concreteVisual.type === 'students' && (
              <div className="flex flex-wrap items-center justify-center gap-6 py-2">
                <div className="flex flex-col items-center bg-blue-950/40 border border-blue-800/60 rounded-xl px-4 py-2">
                  <div className="flex gap-1 text-xl">👦👦👦👦👦👦👦👦</div>
                  <span className="text-xs font-bold text-blue-300 mt-1">8 Siswa Laki-laki</span>
                </div>
                <div className="text-xl font-bold text-slate-500">+</div>
                <div className="flex flex-col items-center bg-pink-950/40 border border-pink-800/60 rounded-xl px-4 py-2">
                  <div className="flex gap-1 text-xl">👧👧👧👧👧👧👧👧👧👧👧👧</div>
                  <span className="text-xs font-bold text-pink-300 mt-1">12 Siswa Perempuan</span>
                </div>
                <div className="text-xl font-bold text-amber-400">=</div>
                <div className="bg-amber-950/40 border border-amber-800/60 rounded-xl px-3 py-2 text-xs font-bold text-amber-300">
                  Total = 20 Siswa
                </div>
              </div>
            )}

            {/* Forest Bridge Logs */}
            {currentQ.concreteVisual.type === 'forest-logs' && (
              <div className="flex flex-col items-center gap-2 py-2 w-full max-w-md">
                <div className="flex items-center justify-between w-full text-xs font-bold text-slate-300 px-2">
                  <span>Batu Kali: {currentQ.concreteVisual.data.stones} unit</span>
                  <span>Balok Jati: {currentQ.concreteVisual.data.logs} unit</span>
                </div>
                <div className="w-full bg-slate-800 h-4 rounded-full overflow-hidden flex">
                  <div
                    className="bg-amber-600 h-full"
                    style={{
                      width: `${(currentQ.concreteVisual.data.stones / (currentQ.concreteVisual.data.stones + currentQ.concreteVisual.data.logs)) * 100}%`,
                    }}
                  />
                  <div className="bg-emerald-600 h-full flex-1" />
                </div>
                <span className="text-[11px] text-emerald-400 font-semibold">
                  Membagi kedua bilangan dengan FPB yang sama
                </span>
              </div>
            )}

            {/* Shop Proportion Machine */}
            {currentQ.concreteVisual.type === 'shop-bottles' && (
              <div className="flex items-center gap-4 py-2 text-center text-xs">
                <div className="bg-blue-900/40 p-2.5 rounded-xl border border-blue-700">
                  <span className="text-amber-400 font-bold block">Paket Awal</span>
                  <div className="text-base font-black text-white mt-1">2 : 3</div>
                </div>
                <div className="text-amber-400 font-black text-lg">x 4 ➔</div>
                <div className="bg-indigo-900/40 p-2.5 rounded-xl border border-indigo-700">
                  <span className="text-amber-400 font-bold block">Paket Pengganda</span>
                  <div className="text-base font-black text-white mt-1">8 : 12</div>
                </div>
              </div>
            )}

            {/* Desert Fuel & Scale */}
            {currentQ.concreteVisual.type === 'desert-fuel' && (
              <div className="flex items-center gap-6 py-2 text-xs">
                <div className="bg-amber-950/40 border border-amber-800 p-2.5 rounded-xl text-center">
                  <span className="text-slate-400 block">Total Nilai</span>
                  <span className="text-base font-bold text-amber-300">
                    {currentQ.concreteVisual.data.totalCost
                      ? `Rp${currentQ.concreteVisual.data.totalCost.toLocaleString()}`
                      : currentQ.concreteVisual.data.distanceKm
                      ? `${currentQ.concreteVisual.data.distanceKm} km`
                      : `${currentQ.concreteVisual.data.crystals} Kristal`}
                  </span>
                </div>
                <div className="text-xl font-bold text-slate-400">÷</div>
                <div className="bg-amber-950/40 border border-amber-800 p-2.5 rounded-xl text-center">
                  <span className="text-slate-400 block">Jumlah Satuan</span>
                  <span className="text-base font-bold text-amber-300">
                    {currentQ.concreteVisual.data.totalUnits ||
                      currentQ.concreteVisual.data.fuelLiters ||
                      currentQ.concreteVisual.data.minutes}{' '}
                    Unit
                  </span>
                </div>
              </div>
            )}

            {/* Castle Boss / Scale Map */}
            {currentQ.concreteVisual.type === 'scale-map' && (
              <div className="bg-purple-950/40 border border-purple-800 p-3 rounded-xl text-xs text-center space-y-1">
                <div className="text-purple-300 font-bold">Skala Peta 1 : 100.000</div>
                <div className="text-slate-300">Jarak pada Peta: 3 cm</div>
                <div className="text-[11px] text-amber-300">Ingat: 1 km = 100.000 cm</div>
              </div>
            )}
            {currentQ.concreteVisual.type === 'boss-orb' && (
              <div className="text-center py-1">
                <span className="text-3xl animate-pulse">👑 ✨ 🔮</span>
                <p className="text-xs text-purple-300 mt-1 font-semibold">Tantangan Penalaran Master Proporsi</p>
              </div>
            )}
          </div>

          {/* Mathematical Prompt */}
          <div className="bg-indigo-950/40 border-2 border-indigo-700/80 rounded-2xl p-4">
            <label className="text-xs font-bold text-indigo-300 uppercase tracking-wider block mb-1">
              Pertanyaan Matematika:
            </label>
            <p className="text-base sm:text-lg font-bold text-white leading-relaxed">
              {currentQ.problemPrompt}
            </p>
          </div>

          {/* Input Answer Section */}
          {!isCompletedStep && (
            <div className="space-y-4">
              {currentQ.type === 'multiple-choice' ? (
                <div className="grid grid-cols-1 gap-2.5">
                  {currentQ.options?.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setSelectedOptionId(opt.id)}
                      className={`text-left p-3.5 rounded-2xl border-2 transition font-medium text-xs sm:text-sm cursor-pointer ${
                        selectedOptionId === opt.id
                          ? 'bg-amber-500/20 border-amber-400 text-white'
                          : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              ) : (
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1.5">
                    Ketik Jawabanmu (misal: 2:3 atau angka yang diminta):
                  </label>
                  <input
                    type="text"
                    value={inputAnswer}
                    onChange={(e) => setInputAnswer(e.target.value)}
                    placeholder="Contoh: 2:3 atau 3000..."
                    className="w-full bg-slate-950 border-2 border-slate-700 focus:border-amber-400 rounded-2xl px-4 py-3 text-lg font-mono text-amber-300 outline-none"
                    onKeyDown={(e) => e.key === 'Enter' && checkAnswer()}
                  />
                </div>
              )}

              {/* Strategy Choice (Deep Learning: Mengomunikasikan Strategi) */}
              <div className="bg-slate-800/50 p-3 rounded-2xl border border-slate-700">
                <label className="text-xs font-bold text-cyan-300 block mb-1 flex items-center gap-1.5">
                  <SearchCheck className="w-3.5 h-3.5" />
                  <span>Strategi Penyelesaian yang Kamu Gunakan:</span>
                </label>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {currentQ.strategyChoices.map((st, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedStrategy(st)}
                      className={`text-xs px-2.5 py-1.5 rounded-xl border transition cursor-pointer ${
                        selectedStrategy === st
                          ? 'bg-cyan-600 border-cyan-400 text-white font-bold'
                          : 'bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Verification Method (Deep Learning: Memeriksa Kebenaran Hasil) */}
              <div className="bg-slate-800/50 p-3 rounded-2xl border border-slate-700">
                <label className="text-xs font-bold text-emerald-300 block mb-1 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Cara Memeriksa Jawaban (Verifikasi):</span>
                </label>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {currentQ.verificationMethods.map((vm, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedVerification(vm)}
                      className={`text-xs px-2.5 py-1.5 rounded-xl border transition cursor-pointer ${
                        selectedVerification === vm
                          ? 'bg-emerald-600 border-emerald-400 text-white font-bold'
                          : 'bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {vm}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit & Hint Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                <button
                  type="button"
                  onClick={requestAiTeacherHint}
                  disabled={isLoadingAiHint}
                  className="bg-indigo-900/60 hover:bg-indigo-800 text-indigo-200 border border-indigo-600 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Bot className="w-4 h-4 text-cyan-300" />
                  <span>{isLoadingAiHint ? 'Meminta Guru AI...' : 'Tanya Petunjuk Guru AI'}</span>
                </button>

                <button
                  onClick={checkAnswer}
                  disabled={currentQ.type === 'multiple-choice' ? !selectedOptionId : !inputAnswer.trim()}
                  className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 disabled:opacity-50 text-slate-950 font-black px-6 py-2.5 rounded-2xl shadow-lg border-2 border-amber-300 flex items-center gap-2 cursor-pointer transition"
                >
                  <span>Periksa Jawaban</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Educational Hints Section (Unlocked on attempts or request) */}
          {(revealedHintLevel > 0 || aiHint) && !isCompletedStep && (
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                <Lightbulb className="w-4 h-4" />
                <span>Petunjuk Mendidik:</span>
              </div>
              {revealedHintLevel >= 1 && (
                <div className="bg-amber-950/30 border border-amber-700/60 p-3 rounded-xl text-xs text-amber-200">
                  <span className="font-bold block">💡 Petunjuk 1:</span>
                  {currentQ.hintLevel1}
                </div>
              )}
              {revealedHintLevel >= 2 && (
                <div className="bg-amber-950/30 border border-amber-700/60 p-3 rounded-xl text-xs text-amber-200">
                  <span className="font-bold block">💡 Petunjuk 2:</span>
                  {currentQ.hintLevel2}
                </div>
              )}
              {aiHint && (
                <div className="bg-cyan-950/40 border border-cyan-700 p-3 rounded-xl text-xs text-cyan-200">
                  <span className="font-bold flex items-center gap-1 text-cyan-300">
                    <Bot className="w-3.5 h-3.5" /> Petunjuk Guru AI Kak Rasio:
                  </span>
                  <p className="mt-1">{aiHint}</p>
                </div>
              )}
            </div>
          )}

          {/* Completed Explanation Step */}
          {isCompletedStep && (
            <div className="bg-emerald-950/40 border-2 border-emerald-500/80 rounded-2xl p-4 space-y-3 animate-fade-in">
              <div className="flex items-center gap-2 text-emerald-400 font-black text-base">
                <CheckCircle2 className="w-5 h-5" />
                <span>Jawaban Benar! ({currentQ.correctAnswer})</span>
              </div>
              <div className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                <span className="font-bold text-emerald-300 block mb-1">Langkah Penyelesaian Matematika:</span>
                <p>{currentQ.stepExplanation}</p>
              </div>
              <button
                onClick={handleNext}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black py-3 rounded-2xl shadow-xl flex items-center justify-center gap-2 text-sm cursor-pointer transition"
              >
                <span>
                  {questionIndex + 1 < questions.length ? 'Lanjut ke Tantangan Berikutnya' : 'Selesaikan Misi Zona'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
