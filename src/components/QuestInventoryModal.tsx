import React from 'react';
import { PlayerStats, ZoneId } from '../types/game';
import { ZONES_DATA } from '../data/curriculumData';
import { BookOpen, Award, CheckCircle2, Lock, Star, Sparkles } from 'lucide-react';

interface QuestInventoryModalProps {
  player: PlayerStats;
  currentZone: ZoneId;
  activeTab: 'quests' | 'inventory';
  onClose: () => void;
  onOpenQuestionModal: () => void;
}

export const QuestInventoryModal: React.FC<QuestInventoryModalProps> = ({
  player,
  currentZone,
  activeTab,
  onClose,
  onOpenQuestionModal,
}) => {
  const [tab, setTab] = React.useState<'quests' | 'inventory'>(activeTab);
  const currentZoneData = ZONES_DATA[currentZone];
  const allZones = Object.values(ZONES_DATA);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border-4 border-indigo-400 rounded-3xl w-full max-w-xl shadow-2xl text-white overflow-hidden my-auto">
        {/* Header Tabs */}
        <div className="bg-slate-950 p-2 border-b border-slate-800 flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setTab('quests')}
              className={`px-4 py-2 rounded-2xl text-xs font-black flex items-center gap-1.5 transition cursor-pointer ${
                tab === 'quests'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Daftar Misi Aktif</span>
            </button>
            <button
              onClick={() => setTab('inventory')}
              className={`px-4 py-2 rounded-2xl text-xs font-black flex items-center gap-1.5 transition cursor-pointer ${
                tab === 'inventory'
                  ? 'bg-purple-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Award className="w-4 h-4 text-yellow-300" />
              <span>Lencana & Koleksi</span>
            </button>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-white font-black flex items-center justify-center text-sm cursor-pointer mr-1"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {tab === 'quests' ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                    Zona Aktif: {currentZoneData.name}
                  </span>
                  <h3 className="text-base font-black text-white">{currentZoneData.environmentName}</h3>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    onOpenQuestionModal();
                  }}
                  className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-4 py-2 rounded-xl text-xs flex items-center gap-1 shadow cursor-pointer transition"
                >
                  <Sparkles className="w-4 h-4 text-slate-950" />
                  <span>Buka Tantangan</span>
                </button>
              </div>

              <div className="space-y-2.5">
                {currentZoneData.questions.map((q, idx) => {
                  const isDone = player.completedZones.includes(currentZone);
                  return (
                    <div
                      key={q.id}
                      className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-2xl flex items-start gap-3"
                    >
                      <div
                        className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                          isDone ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {isDone ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-white text-xs sm:text-sm">{q.title}</div>
                        <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">{q.contextStory}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Inventory & Badges */
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-black text-white mb-1">Koleksi 5 Lencana Kehormatan Rasio</h3>
                <p className="text-xs text-slate-400">
                  Raih seluruh lencana dengan menuntaskan misi dan refleksi di setiap zona.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {allZones.map((z) => {
                  const hasBadge = player.badges.includes(z.badgeName) || player.completedZones.includes(z.id);
                  return (
                    <div
                      key={z.id}
                      className={`p-3.5 rounded-2xl border-2 flex items-center gap-3 transition ${
                        hasBadge
                          ? 'bg-purple-950/40 border-purple-400 text-white shadow-lg'
                          : 'bg-slate-950/60 border-slate-800 text-slate-500 opacity-60'
                      }`}
                    >
                      <div className="text-3xl p-2 bg-slate-900 rounded-xl border border-slate-700">
                        {hasBadge ? z.badgeIcon : <Lock className="w-6 h-6 text-slate-600" />}
                      </div>
                      <div>
                        <div className="font-black text-xs sm:text-sm">{z.badgeName}</div>
                        <div className="text-[10px] text-slate-400">{z.name}</div>
                        <div className="text-[10px] text-amber-400 font-bold mt-0.5">
                          {hasBadge ? '✓ Telah Diraih' : 'Terkunci'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Coins & Stars summary */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-around text-center">
                <div>
                  <span className="text-xs text-slate-400 block">Total Koin</span>
                  <span className="text-xl font-black text-amber-400">🪙 {player.coins}</span>
                </div>
                <div className="h-8 w-px bg-slate-800" />
                <div>
                  <span className="text-xs text-slate-400 block">Total Bintang</span>
                  <span className="text-xl font-black text-yellow-300">⭐ {player.stars}</span>
                </div>
                <div className="h-8 w-px bg-slate-800" />
                <div>
                  <span className="text-xs text-slate-400 block">Level Petualang</span>
                  <span className="text-xl font-black text-cyan-400">⚡ Lvl {player.level}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
