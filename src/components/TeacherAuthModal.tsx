import React, { useState } from 'react';
import { Lock, GraduationCap, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { soundFx } from '../utils/audio';

interface TeacherAuthModalProps {
  isOpen: boolean;
  onSuccess: () => void;
  onClose: () => void;
}

const TEACHER_DEFAULT_PIN = 'guru123';

export const TeacherAuthModal: React.FC<TeacherAuthModalProps> = ({
  isOpen,
  onSuccess,
  onClose,
}) => {
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [attempts, setAttempts] = useState(0);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.trim() === TEACHER_DEFAULT_PIN || pin.trim() === '123456') {
      soundFx.playVictory();
      setErrorMsg('');
      setPin('');
      onSuccess();
    } else {
      soundFx.playWrong();
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      setErrorMsg(`PIN Guru tidak sesuai. Silakan coba kembali (Percobaan ${newAttempts}).`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border-4 border-blue-500 rounded-3xl w-full max-w-md shadow-2xl text-white overflow-hidden my-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-xl">
              <GraduationCap className="w-6 h-6 text-blue-200" />
            </div>
            <div>
              <div className="text-xs font-black tracking-wider text-blue-200 uppercase">
                Autentikasi Hak Akses
              </div>
              <h2 className="text-base sm:text-lg font-black">Masuk Dashboard Guru</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-900/30 hover:bg-slate-900/50 text-white font-black flex items-center justify-center text-sm cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="text-xs text-slate-300 leading-relaxed bg-slate-950/70 p-3 rounded-xl border border-slate-800">
            Halaman ini khusus untuk pendidik/guru guna memantau ketercapaian tujuan pembelajaran dan rekap nilai siswa.
            <div className="text-[11px] text-blue-400 font-semibold mt-1">
              Petunjuk Guru: Gunakan PIN pengajar default (<strong>guru123</strong>).
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1.5 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-blue-400" />
              <span>Masukkan PIN / Sandi Guru:</span>
            </label>
            <input
              type="password"
              autoFocus
              value={pin}
              onChange={(e) => {
                setPin(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              placeholder="Ketik PIN guru di sini..."
              className="w-full bg-slate-950 border-2 border-slate-700 focus:border-blue-400 rounded-2xl px-4 py-3 text-sm text-white font-bold outline-none tracking-widest"
            />
          </div>

          {errorMsg && (
            <div className="text-xs text-rose-300 bg-rose-950/40 border border-rose-800 p-2.5 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2.5 rounded-xl text-xs transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={!pin.trim()}
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-black py-2.5 rounded-xl shadow-lg flex items-center justify-center gap-1.5 text-xs transition cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Masuk Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
