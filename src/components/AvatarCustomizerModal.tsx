import React, { useState } from 'react';
import { AvatarConfig } from '../types/game';
import { User, Check, Palette, Sparkles } from 'lucide-react';
import { soundFx } from '../utils/audio';

interface AvatarCustomizerModalProps {
  currentConfig: AvatarConfig;
  onSave: (config: AvatarConfig) => void;
  onClose: () => void;
}

export const AvatarCustomizerModal: React.FC<AvatarCustomizerModalProps> = ({
  currentConfig,
  onSave,
  onClose,
}) => {
  const [config, setConfig] = useState<AvatarConfig>({ ...currentConfig });

  const skinColors = [
    { label: 'Kuning Langsat', hex: '#fed7aa' },
    { label: 'Sawo Matang', hex: '#d97706' },
    { label: 'Cokelat Hangat', hex: '#92400e' },
    { label: 'Cerah', hex: '#ffedd5' },
    { label: 'Gelap Eksotis', hex: '#78350f' },
  ];

  const shirtColors = [
    { label: 'Biru Samudra', hex: '#2563eb' },
    { label: 'Merah Berani', hex: '#dc2626' },
    { label: 'Hijau Hutan', hex: '#16a34a' },
    { label: 'Kuning Surya', hex: '#f59e0b' },
    { label: 'Ungu Mistis', hex: '#9333ea' },
    { label: 'Hitam Gagah', hex: '#1e293b' },
  ];

  const pantsColors = [
    { label: 'Biru Denim', hex: '#1e3a8a' },
    { label: 'Abu Voxel', hex: '#334155' },
    { label: 'Cokelat Kayu', hex: '#713f12' },
    { label: 'Hijau Lumut', hex: '#14532d' },
  ];

  const hats: { id: AvatarConfig['hat']; label: string; icon: string }[] = [
    { id: 'none', label: 'Tanpa Topi', icon: '👤' },
    { id: 'cap', label: 'Topi Petualang', icon: '🧢' },
    { id: 'crown', label: 'Mahkota Emas', icon: '👑' },
    { id: 'goggles', label: 'Kacamata Keren', icon: '🥽' },
    { id: 'wizard', label: 'Topi Cendekia', icon: '🧙' },
  ];

  const accessories: { id: AvatarConfig['accessory']; label: string; icon: string }[] = [
    { id: 'none', label: 'Tanpa Aksesori', icon: '❌' },
    { id: 'backpack', label: 'Ransel Petualang', icon: '🎒' },
    { id: 'cape', label: 'Jubah Pahlawan', icon: '🧣' },
    { id: 'wings', label: 'Sayap Kristal', icon: '🪽' },
  ];

  const handleSave = () => {
    soundFx.playCoin();
    onSave(config);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border-4 border-amber-400 rounded-3xl w-full max-w-lg shadow-2xl text-white overflow-hidden my-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-yellow-500 p-4 text-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-6 h-6 text-slate-950" />
            <div>
              <div className="text-xs font-black tracking-wider uppercase opacity-80">Kustomisasi Karakter</div>
              <h2 className="text-lg sm:text-xl font-black">Avatar Voxel 3D</h2>
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
        <div className="p-4 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* 1. Skin Color */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1.5">Warna Kulit Avatar:</label>
            <div className="flex flex-wrap gap-2">
              {skinColors.map((sc) => (
                <button
                  key={sc.hex}
                  onClick={() => setConfig({ ...config, skinColor: sc.hex })}
                  className={`w-9 h-9 rounded-xl border-2 flex items-center justify-center transition cursor-pointer ${
                    config.skinColor === sc.hex ? 'border-amber-400 scale-110 shadow-lg' : 'border-slate-700'
                  }`}
                  style={{ backgroundColor: sc.hex }}
                  title={sc.label}
                >
                  {config.skinColor === sc.hex && <Check className="w-4 h-4 text-slate-900" />}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Shirt Color */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1.5">Warna Baju / Kaos:</label>
            <div className="flex flex-wrap gap-2">
              {shirtColors.map((sc) => (
                <button
                  key={sc.hex}
                  onClick={() => setConfig({ ...config, shirtColor: sc.hex })}
                  className={`w-9 h-9 rounded-xl border-2 flex items-center justify-center transition cursor-pointer ${
                    config.shirtColor === sc.hex ? 'border-amber-400 scale-110 shadow-lg' : 'border-slate-700'
                  }`}
                  style={{ backgroundColor: sc.hex }}
                  title={sc.label}
                >
                  {config.shirtColor === sc.hex && <Check className="w-4 h-4 text-white" />}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Pants Color */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1.5">Warna Celana:</label>
            <div className="flex flex-wrap gap-2">
              {pantsColors.map((pc) => (
                <button
                  key={pc.hex}
                  onClick={() => setConfig({ ...config, pantsColor: pc.hex })}
                  className={`w-9 h-9 rounded-xl border-2 flex items-center justify-center transition cursor-pointer ${
                    config.pantsColor === pc.hex ? 'border-amber-400 scale-110 shadow-lg' : 'border-slate-700'
                  }`}
                  style={{ backgroundColor: pc.hex }}
                  title={pc.label}
                >
                  {config.pantsColor === pc.hex && <Check className="w-4 h-4 text-white" />}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Hat / Headgear */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1.5">Topi / Mahkota:</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {hats.map((h) => (
                <button
                  key={h.id}
                  onClick={() => setConfig({ ...config, hat: h.id })}
                  className={`p-2.5 rounded-2xl border-2 text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
                    config.hat === h.id
                      ? 'bg-amber-500/20 border-amber-400 text-white'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-750'
                  }`}
                >
                  <span className="text-lg">{h.icon}</span>
                  <span>{h.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 5. Accessories */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1.5">Aksesori Punggung:</label>
            <div className="grid grid-cols-2 gap-2">
              {accessories.map((acc) => (
                <button
                  key={acc.id}
                  onClick={() => setConfig({ ...config, accessory: acc.id })}
                  className={`p-2.5 rounded-2xl border-2 text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
                    config.accessory === acc.id
                      ? 'bg-amber-500/20 border-amber-400 text-white'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-750'
                  }`}
                >
                  <span className="text-lg">{acc.icon}</span>
                  <span>{acc.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            className="w-full bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black py-3 rounded-2xl shadow-xl flex items-center justify-center gap-2 cursor-pointer transition text-sm mt-3"
          >
            <Sparkles className="w-5 h-5 text-slate-950" />
            <span>Simpan Perubahan Avatar</span>
          </button>
        </div>
      </div>
    </div>
  );
};
