import React from 'react';
import { ZoneId } from '../types/game';
import { ZONES_DATA } from '../data/curriculumData';
import { MessageCircle, Sparkles, ArrowRight } from 'lucide-react';
import { soundFx } from '../utils/audio';

interface NpcDialogModalProps {
  zoneId: ZoneId;
  onClose: () => void;
  onStartQuest: () => void;
}

export const NpcDialogModal: React.FC<NpcDialogModalProps> = ({
  zoneId,
  onClose,
  onStartQuest,
}) => {
  const zone = ZONES_DATA[zoneId];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border-4 border-amber-400 rounded-3xl w-full max-w-lg shadow-2xl text-white overflow-hidden my-auto animate-fade-in">
        {/* NPC Profile Header */}
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-4 text-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/30 border border-slate-950/20 flex items-center justify-center text-3xl shadow">
              {zone.badgeIcon}
            </div>
            <div>
              <div className="text-[11px] font-black uppercase tracking-wider opacity-85">
                {zone.npcTitle}
              </div>
              <h2 className="text-lg font-black">{zone.npcName}</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-900/20 hover:bg-slate-900/40 text-slate-950 font-black flex items-center justify-center text-sm cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Dialog Content */}
        <div className="p-5 space-y-4">
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl text-slate-200 text-xs sm:text-sm leading-relaxed relative">
            <div className="text-amber-400 font-bold text-xs mb-1 flex items-center gap-1.5">
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Pesan {zone.npcName}:</span>
            </div>
            <p>"{zone.npcWelcome}"</p>
          </div>

          <div className="bg-indigo-950/40 border border-indigo-700/60 p-3.5 rounded-2xl text-xs space-y-1">
            <span className="font-bold text-indigo-300 block">Target Pembelajaran Zona:</span>
            <p className="text-slate-300">{zone.learningGoal}</p>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={onClose}
              className="flex-1 bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold py-3 rounded-2xl text-xs transition cursor-pointer"
            >
              Nanti Dulu
            </button>
            <button
              onClick={() => {
                soundFx.playCoin();
                onClose();
                onStartQuest();
              }}
              className="flex-1 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black py-3 rounded-2xl shadow-xl flex items-center justify-center gap-1.5 text-xs transition cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>Mulai Misi Zona</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
