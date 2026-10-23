import React, { useRef, useState, useEffect } from 'react';
import { InteractiveZoneObject } from '../game3d/environments';
import { ArrowUp, ChevronDown, ChevronUp, Sparkles, Hand } from 'lucide-react';

interface TouchControlsProps {
  nearbyObject: InteractiveZoneObject | null;
  onInteract: () => void;
  onJump: () => void;
  onJoystickMove: (dx: number, dy: number) => void;
  onRotateCameraLeft?: () => void;
  onRotateCameraRight?: () => void;
  onResetCamera?: () => void;
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  nearbyObject,
  onInteract,
  onJump,
  onJoystickMove,
  onRotateCameraLeft,
  onRotateCameraRight,
  onResetCamera,
}) => {
  const joystickRef = useRef<HTMLDivElement>(null);
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [touchDevice, setTouchDevice] = useState(false);

  useEffect(() => {
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
      setTouchDevice(true);
    }
  }, []);

  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    setIsDragging(true);
    updateKnob(e);
  };

  const updateKnob = (e: React.TouchEvent | React.MouseEvent) => {
    if (!joystickRef.current) return;
    const rect = joystickRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

    const deltaX = clientX - centerX;
    const deltaY = clientY - centerY;
    const distance = Math.min(45, Math.hypot(deltaX, deltaY));
    const angle = Math.atan2(deltaY, deltaX);

    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;

    setKnobPos({ x, y });
    onJoystickMove(x / 45, y / 45);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setKnobPos({ x: 0, y: 0 });
    onJoystickMove(0, 0);
  };

  return (
    <>
      {/* Interaction Prompt Toast when near an object */}
      {nearbyObject && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-30 pointer-events-auto animate-bounce">
          <button
            onClick={onInteract}
            className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-sm md:text-base px-5 py-3 rounded-2xl shadow-2xl border-4 border-slate-900 flex items-center gap-2 cursor-pointer transition transform active:scale-95"
          >
            <Hand className="w-5 h-5 text-slate-900" />
            <span>
              {nearbyObject.type === 'portal'
                ? '🚪 Masuk Portal [E]'
                : nearbyObject.type === 'npc'
                ? '💬 Bicara dengan NPC [E]'
                : `⚡ Buka ${nearbyObject.label} [E]`}
            </span>
          </button>
        </div>
      )}

      {/* Unified Bottom Control Dock */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 pointer-events-auto flex flex-col items-center">
        {/* Collapse / Expand Toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="bg-slate-900/90 text-slate-300 hover:text-white px-3 py-1 rounded-t-xl text-xs font-bold border-t border-x border-slate-700 flex items-center gap-1 shadow cursor-pointer mb-[-1px]"
        >
          {isCollapsed ? (
            <>
              <ChevronUp className="w-3.5 h-3.5" /> Tampilkan Kontrol
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5" /> Sembunyikan Kontrol
            </>
          )}
        </button>

        {!isCollapsed && (
          <div className="bg-slate-900/95 border-2 border-slate-700 rounded-2xl p-3 shadow-2xl flex items-center gap-4 text-white max-w-[94vw] sm:max-w-xl">
            {/* Keyboard Guide for Desktop */}
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-300 pr-3 border-r border-slate-700">
              <span className="bg-slate-800 px-2 py-1 rounded font-mono font-bold text-amber-300 border border-slate-600">
                W A S D
              </span>
              <span>Bergerak</span>
              <span className="bg-slate-800 px-2 py-1 rounded font-mono font-bold text-amber-300 border border-slate-600 ml-2">
                SPASI
              </span>
              <span>Lompat</span>
              <span className="bg-slate-800 px-2 py-1 rounded font-mono font-bold text-amber-300 border border-slate-600 ml-2">
                E
              </span>
              <span>Aksi</span>
            </div>

            {/* Mobile / Touch Joystick */}
            {(touchDevice || true) && (
              <div
                ref={joystickRef}
                onMouseDown={handleTouchStart}
                onMouseMove={(e) => isDragging && updateKnob(e)}
                onMouseUp={handleTouchEnd}
                onTouchStart={handleTouchStart}
                onTouchMove={(e) => isDragging && updateKnob(e)}
                onTouchEnd={handleTouchEnd}
                className="w-20 h-20 rounded-full bg-slate-800 border-2 border-slate-600 relative flex items-center justify-center touch-none select-none cursor-pointer"
                title="Virtual Joystick"
              >
                <div
                  className="w-8 h-8 rounded-full bg-amber-400 border border-slate-900 shadow transition-transform duration-75"
                  style={{ transform: `translate(${knobPos.x}px, ${knobPos.y}px)` }}
                />
              </div>
            )}

            {/* Jump Button */}
            <button
              onClick={onJump}
              className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-500 active:scale-90 border-2 border-indigo-400 flex flex-col items-center justify-center font-bold text-xs shadow-lg cursor-pointer transition select-none"
              title="Lompat (Spasi)"
            >
              <ArrowUp className="w-5 h-5 text-white" />
              <span className="text-[9px] text-indigo-200">LOMPAT</span>
            </button>

            {/* Action / Interact Button */}
            <button
              onClick={onInteract}
              disabled={!nearbyObject}
              className={`w-13 h-13 sm:w-14 sm:h-14 rounded-2xl border-2 flex flex-col items-center justify-center font-bold text-xs shadow-lg cursor-pointer transition select-none ${
                nearbyObject
                  ? 'bg-amber-500 hover:bg-amber-400 border-amber-300 text-slate-950 active:scale-90'
                  : 'bg-slate-800 border-slate-700 text-slate-500 opacity-60 cursor-not-allowed'
              }`}
              title="Interaksi (E)"
            >
              <Sparkles className="w-5 h-5" />
              <span className="text-[9px]">AKSI</span>
            </button>

            {/* Quick Camera Rotate Controls */}
            <div className="flex items-center gap-1 border-l border-slate-750 pl-2">
              <button
                onClick={onRotateCameraLeft}
                className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 flex items-center justify-center text-slate-300 hover:text-white transition cursor-pointer active:scale-90"
                title="Putar Kamera ke Kiri (Geser Layar untuk 360°)"
              >
                ↺
              </button>
              <button
                onClick={onResetCamera}
                className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 flex items-center justify-center text-slate-300 hover:text-white text-xs font-bold transition cursor-pointer active:scale-90"
                title="Reset Sudut Pandang"
              >
                👁️
              </button>
              <button
                onClick={onRotateCameraRight}
                className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 flex items-center justify-center text-slate-300 hover:text-white transition cursor-pointer active:scale-90"
                title="Putar Kamera ke Kanan (Geser Layar untuk 360°)"
              >
                ↻
              </button>
            </div>
          </div>
        )}

        {/* Small floating hint badge */}
        <div className="text-[10px] text-slate-400 bg-slate-950/80 px-2.5 py-0.5 rounded-full border border-slate-800 mt-1 pointer-events-none select-none">
          👆 Geser mouse / usap layar untuk melihat keliling 360°
        </div>
      </div>
    </>
  );
};
