import React from 'react';
import { PlayerStats, ZoneId } from '../types/game';
import { ZONES_DATA } from '../data/curriculumData';
import {
  Volume2,
  VolumeX,
  Compass,
  User,
  BookOpen,
  Award,
  Sparkles,
  Heart,
  Coins,
  Star,
  Monitor,
  GraduationCap,
} from 'lucide-react';
import { soundFx } from '../utils/audio';

interface NavigationHeaderProps {
  player: PlayerStats;
  currentZone: ZoneId;
  isMuted: boolean;
  onToggleMute: () => void;
  isLowGraphics: boolean;
  onToggleGraphics: () => void;
  onOpenMap: () => void;
  onOpenAvatar: () => void;
  onOpenQuests: () => void;
  onOpenInventory: () => void;
  onOpenTeacherDashboard: () => void;
}

export const NavigationHeader: React.FC<NavigationHeaderProps> = ({
  player,
  currentZone,
  isMuted,
  onToggleMute,
  isLowGraphics,
  onToggleGraphics,
  onOpenMap,
  onOpenAvatar,
  onOpenQuests,
  onOpenInventory,
  onOpenTeacherDashboard,
}) => {
  const currentZoneInfo = ZONES_DATA[currentZone];

  return (
    <header className="absolute top-0 left-0 right-0 z-30 pointer-events-none p-3 flex flex-wrap items-center justify-between gap-2">
      {/* Left: App Title & Active Zone Pill */}
      <div className="flex items-center gap-2 pointer-events-auto">
        <div className="bg-slate-900/90 text-white border-2 border-amber-400 rounded-xl px-3 py-1.5 shadow-lg flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center font-black text-slate-900 text-lg shadow-inner">
            R
          </div>
          <div>
            <div className="text-xs font-black tracking-wider text-amber-300 uppercase">RATIOVERSE</div>
            <div className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>{currentZoneInfo?.name}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-semibold">
                Zona {Object.keys(ZONES_DATA).indexOf(currentZone) + 1}/5
              </span>
            </div>
          </div>
        </div>

        {/* Quest Log Quick Button */}
        <button
          onClick={onOpenQuests}
          className="bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold px-3 py-2 rounded-xl shadow-lg border-2 border-indigo-400 flex items-center gap-1.5 text-xs transition cursor-pointer"
          title="Daftar Misi"
        >
          <BookOpen className="w-4 h-4 text-yellow-300" />
          <span className="hidden sm:inline">Misi Zona</span>
        </button>

        {/* World Map Button */}
        <button
          onClick={onOpenMap}
          className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold px-3 py-2 rounded-xl shadow-lg border-2 border-emerald-400 flex items-center gap-1.5 text-xs transition cursor-pointer"
          title="Peta Dunia"
        >
          <Compass className="w-4 h-4 text-emerald-200" />
          <span className="hidden sm:inline">Peta Dunia</span>
        </button>
      </div>

      {/* Middle/Right: Gamification Stats (Hearts, Coins, Stars, XP) */}
      <div className="flex items-center gap-2 pointer-events-auto">
        <div className="bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-1.5 shadow-lg flex items-center gap-3 text-xs sm:text-sm font-bold text-white">
          {/* Hearts */}
          <div className="flex items-center gap-1 text-rose-400" title="Kesempatan Menjawab">
            <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
            <span>{player.hearts}</span>
          </div>

          {/* Coins */}
          <div className="flex items-center gap-1 text-amber-300" title="Koin Rasio">
            <Coins className="w-4 h-4 text-amber-400" />
            <span>{player.coins}</span>
          </div>

          {/* Stars */}
          <div className="flex items-center gap-1 text-yellow-300" title="Bintang Penyelesaian">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span>{player.stars}</span>
          </div>

          {/* Level / XP */}
          <div className="flex items-center gap-1.5 text-cyan-300 pl-1 border-l border-slate-700">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Lvl {player.level}</span>
          </div>
        </div>

        {/* Avatar Customizer */}
        <button
          onClick={onOpenAvatar}
          className="bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-bold p-2 sm:px-3 rounded-xl shadow-lg border-2 border-amber-300 flex items-center gap-1 text-xs transition cursor-pointer"
          title="Ubah Karakter Avatar"
        >
          <User className="w-4 h-4" />
          <span className="hidden md:inline">Avatar</span>
        </button>

        {/* Badges / Inventory */}
        <button
          onClick={onOpenInventory}
          className="bg-purple-600 hover:bg-purple-700 active:scale-95 text-white font-bold p-2 sm:px-3 rounded-xl shadow-lg border-2 border-purple-400 flex items-center gap-1 text-xs transition cursor-pointer"
          title="Lencana & Inventaris"
        >
          <Award className="w-4 h-4 text-yellow-300" />
          <span className="hidden md:inline">Lencana</span>
        </button>

        {/* Graphics Switch (High/Low for school devices) */}
        <button
          onClick={onToggleGraphics}
          className={`p-2 rounded-xl shadow-lg border-2 text-xs font-bold transition cursor-pointer ${
            isLowGraphics
              ? 'bg-amber-600 border-amber-400 text-white'
              : 'bg-slate-800 border-slate-600 text-slate-300 hover:text-white'
          }`}
          title={isLowGraphics ? 'Grafis Rendah (Hemat Baterai/CPU)' : 'Grafis Tinggi (Bayangan 3D)'}
        >
          <Monitor className="w-4 h-4" />
        </button>

        {/* Audio Mute Toggle */}
        <button
          onClick={onToggleMute}
          className={`p-2 rounded-xl shadow-lg border-2 text-xs font-bold transition cursor-pointer ${
            isMuted
              ? 'bg-rose-900/80 border-rose-600 text-rose-300'
              : 'bg-slate-800 border-slate-600 text-slate-300 hover:text-white'
          }`}
          title={isMuted ? 'Nyalakan Suara' : 'Matikan Suara'}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        {/* Teacher Dashboard Switch */}
        <button
          onClick={onOpenTeacherDashboard}
          className="bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-600 hover:to-indigo-700 text-white font-bold px-3 py-2 rounded-xl shadow-lg border-2 border-blue-400 flex items-center gap-1.5 text-xs transition cursor-pointer"
          title="Masuk ke Dashboard Guru"
        >
          <GraduationCap className="w-4 h-4 text-blue-200" />
          <span className="hidden lg:inline">Dashboard Guru</span>
        </button>
      </div>
    </header>
  );
};
