import React from 'react';
import { ZoneId } from '../types/game';
import { ZONES_DATA } from '../data/curriculumData';
import { Lock, CheckCircle, Star, ArrowRight, Compass } from 'lucide-react';

interface WorldMapModalProps {
  unlockedZones: ZoneId[];
  completedZones: ZoneId[];
  currentZone: ZoneId;
  onSelectZone: (zoneId: ZoneId) => void;
  onClose: () => void;
}

export const WorldMapModal: React.FC<WorldMapModalProps> = ({
  unlockedZones,
  completedZones,
  currentZone,
  onSelectZone,
  onClose,
}) => {
  const zoneList: ZoneId[] = ['village', 'forest', 'city', 'desert', 'castle'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border-4 border-emerald-400 rounded-3xl w-full max-w-2xl shadow-2xl text-white overflow-hidden my-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass className="w-6 h-6 text-emerald-200" />
            <div>
              <div className="text-xs font-black tracking-wider text-emerald-200 uppercase">
                Peta Dunia 3D RATIOVERSE
              </div>
              <h2 className="text-lg sm:text-xl font-black">5 Zona Petualangan Rasio</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-900/20 hover:bg-slate-900/40 text-white font-black flex items-center justify-center text-lg cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Zones Grid */}
        <div className="p-4 sm:p-6 space-y-3 max-h-[75vh] overflow-y-auto">
          {zoneList.map((zId, index) => {
            const zone = ZONES_DATA[zId];
            const isUnlocked = unlockedZones.includes(zId);
            const isCompleted = completedZones.includes(zId);
            const isCurrent = currentZone === zId;

            return (
              <div
                key={zId}
                className={`p-4 rounded-2xl border-2 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                  isCurrent
                    ? 'bg-emerald-950/50 border-emerald-400 shadow-lg'
                    : isUnlocked
                    ? 'bg-slate-800/80 border-slate-700 hover:border-slate-500'
                    : 'bg-slate-900/60 border-slate-800 opacity-60'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 shadow"
                    style={{ backgroundColor: `${zone.themeColor}33`, borderColor: zone.themeColor, borderWidth: 1 }}
                  >
                    {isUnlocked ? zone.badgeIcon : <Lock className="w-5 h-5 text-slate-500" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-amber-400">Level {index + 1}</span>
                      <h3 className="font-black text-sm sm:text-base text-white">{zone.name}</h3>
                      {isCurrent && (
                        <span className="text-[10px] bg-emerald-500 text-slate-950 font-black px-2 py-0.5 rounded-full">
                          Lokasi Sekarang
                        </span>
                      )}
                      {isCompleted && (
                        <span className="text-[10px] bg-indigo-500/30 text-indigo-300 border border-indigo-500 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Tuntas
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-300 mt-0.5">{zone.learningGoal}</p>
                    <div className="text-[11px] text-slate-400 mt-1">
                      NPC: <span className="text-slate-200">{zone.npcName}</span> ({zone.npcTitle})
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  {isUnlocked ? (
                    <button
                      onClick={() => {
                        onSelectZone(zId);
                        onClose();
                      }}
                      className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition cursor-pointer w-full sm:w-auto justify-center ${
                        isCurrent
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                          : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                      }`}
                    >
                      <span>{isCurrent ? 'Tetap di Sini' : 'Jelajahi Zona'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <div className="flex items-center gap-1 text-xs text-slate-500 font-bold px-3 py-1.5 bg-slate-800 rounded-xl">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Selesaikan Zona {index}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
