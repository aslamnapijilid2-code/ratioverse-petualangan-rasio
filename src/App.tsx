import React, { useState, useEffect, useRef } from 'react';
import { PlayerStats, ZoneId, AvatarConfig, StudentReflection, QuestionData } from './types/game';
import { ZONES_DATA } from './data/curriculumData';
import { WorldScene } from './game3d/worldScene';
import { InteractiveZoneObject } from './game3d/environments';
import { soundFx } from './utils/audio';
import { updateOrCreateStudentRecord } from './data/studentStore';

// Components
import { LandingPage } from './components/LandingPage';
import { DiagnosticModal } from './components/DiagnosticModal';
import { NavigationHeader } from './components/NavigationHeader';
import { TouchControls } from './components/TouchControls';
import { QuestQuizModal } from './components/QuestQuizModal';
import { ReflectionModal } from './components/ReflectionModal';
import { WorldMapModal } from './components/WorldMapModal';
import { AvatarCustomizerModal } from './components/AvatarCustomizerModal';
import { QuestInventoryModal } from './components/QuestInventoryModal';
import { NpcDialogModal } from './components/NpcDialogModal';
import { TeacherDashboard } from './components/TeacherDashboard';
import { TeacherAuthModal } from './components/TeacherAuthModal';

const STORAGE_KEY_PLAYER = 'ratioverse_player_data_v2';

const DEFAULT_AVATAR: AvatarConfig = {
  skinColor: '#fed7aa',
  shirtColor: '#2563eb',
  pantsColor: '#1e3a8a',
  accessory: 'backpack',
  hat: 'cap',
};

const DEFAULT_PLAYER: PlayerStats = {
  id: 'std-' + Math.floor(100 + Math.random() * 900),
  name: '',
  className: '6A',
  avatar: DEFAULT_AVATAR,
  coins: 50,
  xp: 0,
  level: 1,
  hearts: 5,
  maxHearts: 5,
  stars: 0,
  badges: [],
  unlockedZones: ['village'],
  completedZones: [],
  currentZone: 'village',
  inventory: ['Buku Panduan Rasio'],
};

export default function App() {
  const [gameState, setGameState] = useState<'landing' | 'diagnostic' | 'playing' | 'teacher_dashboard'>('landing');

  // Player state
  const [player, setPlayer] = useState<PlayerStats>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PLAYER);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return DEFAULT_PLAYER;
  });

  const [isMuted, setIsMuted] = useState(false);
  const [isLowGraphics, setIsLowGraphics] = useState(false);

  // 3D Canvas ref & World Scene controller
  const canvasMountRef = useRef<HTMLDivElement>(null);
  const worldSceneRef = useRef<WorldScene | null>(null);

  // Modal visibility states
  const [nearbyObject, setNearbyObject] = useState<InteractiveZoneObject | null>(null);
  const [showQuestModal, setShowQuestModal] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showReflectionModal, setShowReflectionModal] = useState(false);
  const [showWorldMap, setShowWorldMap] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showQuestInventory, setShowQuestInventory] = useState(false);
  const [inventoryTab, setInventoryTab] = useState<'quests' | 'inventory'>('quests');
  const [showNpcDialog, setShowNpcDialog] = useState(false);
  const [showTeacherAuthModal, setShowTeacherAuthModal] = useState(false);
  const [isTeacherAuth, setIsTeacherAuth] = useState(false);

  // Save player state to localStorage whenever changed
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PLAYER, JSON.stringify(player));
    } catch (e) {}
  }, [player]);

  // Handle teacher dashboard request with auth check
  const handleOpenTeacherDashboard = () => {
    if (isTeacherAuth) {
      setGameState('teacher_dashboard');
    } else {
      setShowTeacherAuthModal(true);
    }
  };

  const handleTeacherAuthSuccess = () => {
    setIsTeacherAuth(true);
    setShowTeacherAuthModal(false);
    setGameState('teacher_dashboard');
  };

  const handleTeacherLogout = () => {
    setIsTeacherAuth(false);
    setGameState('landing');
  };

  // Initialize or cleanup 3D scene when entering/leaving 'playing'
  useEffect(() => {
    if (gameState === 'playing' && canvasMountRef.current) {
      if (!worldSceneRef.current) {
        worldSceneRef.current = new WorldScene(
          canvasMountRef.current,
          player.currentZone,
          player.avatar,
          {
            onNearInteractive: (obj) => setNearbyObject(obj),
            onCoinCollected: (_coinId) => {
              setPlayer((prev) => ({
                ...prev,
                coins: prev.coins + 10,
                xp: prev.xp + 15,
                level: Math.floor((prev.xp + 15) / 100) + 1,
              }));
            },
            onEnterPortal: (zoneId) => {
              // Advance to next zone if current is completed
              const zoneOrder: ZoneId[] = ['village', 'forest', 'city', 'desert', 'castle'];
              const curIdx = zoneOrder.indexOf(zoneId);
              if (curIdx < zoneOrder.length - 1) {
                const nextZone = zoneOrder[curIdx + 1];
                if (player.unlockedZones.includes(nextZone)) {
                  changeZone(nextZone);
                } else {
                  // Prompt quest modal
                  setShowQuestModal(true);
                }
              }
            },
            onOpenMathStation: (_zoneId) => {
              setShowQuestModal(true);
            },
            onOpenNpcDialog: (_zoneId) => {
              setShowNpcDialog(true);
            },
          },
          isLowGraphics
        );
      }
    } else {
      if (worldSceneRef.current) {
        worldSceneRef.current.destroy();
        worldSceneRef.current = null;
      }
    }

    return () => {
      if (worldSceneRef.current) {
        worldSceneRef.current.destroy();
        worldSceneRef.current = null;
      }
    };
  }, [gameState, isLowGraphics]);

  // Zone Change handler
  const changeZone = (newZone: ZoneId) => {
    setPlayer((prev) => ({ ...prev, currentZone: newZone }));
    setCurrentQuestionIndex(0);
    setNearbyObject(null);
    if (worldSceneRef.current) {
      worldSceneRef.current.loadZone(newZone);
    }
  };

  // Sound Mute Toggle
  const handleToggleMute = () => {
    const muted = soundFx.toggleMute();
    setIsMuted(muted);
  };

  // Low Graphics Toggle
  const handleToggleGraphics = () => {
    setIsLowGraphics(!isLowGraphics);
    if (worldSceneRef.current) {
      worldSceneRef.current.destroy();
      worldSceneRef.current = null;
      // Recreates automatically via useEffect dependency
    }
  };

  // Start Adventure flow from landing
  const handleStartFromLanding = () => {
    // Sync player name and class into student assessment records
    updateOrCreateStudentRecord(
      player.id,
      player.name || 'Pemain Baru',
      (rec) => {
        rec.name = player.name || 'Pemain Baru';
        rec.className = player.className || '6A';
      },
      player.className || '6A'
    );

    // If student hasn't done diagnostic test yet, prompt diagnostic first
    const studentRecords = localStorage.getItem('ratioverse_students_v2');
    const hasDiagnostic = studentRecords && studentRecords.includes(player.id) && studentRecords.includes('"diagnosticCompleted":true');

    if (!hasDiagnostic) {
      setGameState('diagnostic');
    } else {
      setGameState('playing');
      soundFx.startCheerfulBgm();
    }
  };

  // Diagnostic completed
  const handleDiagnosticComplete = (score: number) => {
    updateOrCreateStudentRecord(
      player.id,
      player.name || 'Pemain Baru',
      (rec) => {
        rec.diagnosticCompleted = true;
        rec.diagnosticScore = score;
      },
      player.className || '6A'
    );

    setGameState('playing');
    soundFx.startCheerfulBgm();
  };

  // Save Avatar Customization
  const handleSaveAvatar = (newConfig: AvatarConfig) => {
    setPlayer((prev) => ({ ...prev, avatar: newConfig }));
    if (worldSceneRef.current) {
      worldSceneRef.current.updateAvatar(newConfig);
    }
  };

  // Handle Question Completed
  const handleCompleteQuestion = (question: QuestionData, isCorrect: boolean, attempts: number) => {
    if (isCorrect) {
      setPlayer((prev) => ({
        ...prev,
        coins: prev.coins + 25,
        xp: prev.xp + 35,
        level: Math.floor((prev.xp + 35) / 100) + 1,
        stars: prev.stars + (attempts === 1 ? 3 : attempts === 2 ? 2 : 1),
      }));

      // Update student assessment record
      updateOrCreateStudentRecord(player.id, player.name, (rec) => {
        // Update indicator score
        const currentIndScore = rec.indicatorScores[question.indicatorId] || 0;
        const newScore = Math.min(100, Math.max(currentIndScore, attempts === 1 ? 100 : attempts === 2 ? 85 : 75));
        rec.indicatorScores[question.indicatorId] = newScore;
      });

      // Advance question index
      setCurrentQuestionIndex((prev) => prev + 1);

      // In Simplify Forest, advance bridge stage repair
      if (player.currentZone === 'forest' && worldSceneRef.current) {
        worldSceneRef.current.setBridgeRepaired(currentQuestionIndex + 1);
      }
    }
  };

  // Handle All Questions in Zone Completed
  const handleAllQuestionsCompleted = () => {
    setShowQuestModal(false);
    if (worldSceneRef.current) {
      worldSceneRef.current.setCelebrating(true);
      setTimeout(() => {
        if (worldSceneRef.current) worldSceneRef.current.setCelebrating(false);
      }, 3500);
    }

    // Trigger Deep Learning reflection modal!
    setTimeout(() => {
      setShowReflectionModal(true);
    }, 1200);
  };

  // Handle Reflection Submitted
  const handleReflectionSubmitted = (reflection: StudentReflection) => {
    const curZone = player.currentZone;
    const zoneBadge = ZONES_DATA[curZone].badgeName;

    const zoneOrder: ZoneId[] = ['village', 'forest', 'city', 'desert', 'castle'];
    const curIdx = zoneOrder.indexOf(curZone);
    const nextZone = curIdx < zoneOrder.length - 1 ? zoneOrder[curIdx + 1] : curZone;

    const updatedUnlocked = Array.from(new Set([...player.unlockedZones, nextZone]));
    const updatedCompleted = Array.from(new Set([...player.completedZones, curZone]));
    const updatedBadges = Array.from(new Set([...player.badges, zoneBadge]));

    setPlayer((prev) => ({
      ...prev,
      unlockedZones: updatedUnlocked,
      completedZones: updatedCompleted,
      badges: updatedBadges,
      coins: prev.coins + 100,
      xp: prev.xp + 150,
      level: Math.floor((prev.xp + 150) / 100) + 1,
    }));

    // Update persistent student record
    updateOrCreateStudentRecord(player.id, player.name, (rec) => {
      rec.zoneProgress[curZone] = {
        completed: true,
        score: 95,
        attempts: 3,
        stars: 3,
      };
      rec.indicatorScores['ind-8'] = 95; // Metacognitive reflection indicator
      rec.reflections.push(reflection);
    });

    setShowReflectionModal(false);
  };

  // Virtual Controls bindings
  const handleJoystickMove = (dx: number, dy: number) => {
    if (worldSceneRef.current) {
      worldSceneRef.current.controls.virtualX = dx;
      worldSceneRef.current.controls.virtualY = dy;
    }
  };

  const handleJump = () => {
    if (worldSceneRef.current) {
      worldSceneRef.current.triggerJump();
    }
  };

  const handleInteract = () => {
    if (worldSceneRef.current) {
      worldSceneRef.current.triggerInteraction();
    }
  };

  return (
    <div className="w-screen h-screen overflow-hidden bg-slate-950 font-sans select-none relative">
      {/* 1. Landing Page View */}
      {gameState === 'landing' && (
        <LandingPage
          playerName={player.name}
          onSetPlayerName={(name) => setPlayer((prev) => ({ ...prev, name }))}
          playerClass={player.className || '6A'}
          onSetPlayerClass={(c) => setPlayer((prev) => ({ ...prev, className: c }))}
          onStartGame={handleStartFromLanding}
          onOpenTeacherDashboard={handleOpenTeacherDashboard}
        />
      )}

      {/* 2. Diagnostic Assessment View */}
      {gameState === 'diagnostic' && (
        <DiagnosticModal onComplete={handleDiagnosticComplete} />
      )}

      {/* 3. Teacher Dashboard View */}
      {gameState === 'teacher_dashboard' && (
        <TeacherDashboard
          onBackToGame={() => setGameState('playing')}
          onLogout={handleTeacherLogout}
        />
      )}

      {/* Teacher Authentication Modal */}
      <TeacherAuthModal
        isOpen={showTeacherAuthModal}
        onSuccess={handleTeacherAuthSuccess}
        onClose={() => setShowTeacherAuthModal(false)}
      />

      {/* 4. Active 3D Playing Canvas & HUD */}
      {gameState === 'playing' && (
        <div className="w-full h-full relative">
          {/* 3D WebGL Canvas Mount Container */}
          <div ref={canvasMountRef} className="absolute inset-0 w-full h-full pointer-events-auto" />

          {/* Top HUD Navigation Header */}
          <NavigationHeader
            player={player}
            currentZone={player.currentZone}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
            isLowGraphics={isLowGraphics}
            onToggleGraphics={handleToggleGraphics}
            onOpenMap={() => setShowWorldMap(true)}
            onOpenAvatar={() => setShowAvatarModal(true)}
            onOpenQuests={() => {
              setInventoryTab('quests');
              setShowQuestInventory(true);
            }}
            onOpenInventory={() => {
              setInventoryTab('inventory');
              setShowQuestInventory(true);
            }}
            onOpenTeacherDashboard={handleOpenTeacherDashboard}
          />

          {/* Bottom Dock & Touch Controls */}
          <TouchControls
            nearbyObject={nearbyObject}
            onInteract={handleInteract}
            onJump={handleJump}
            onJoystickMove={handleJoystickMove}
            onRotateCameraLeft={() => worldSceneRef.current?.rotateCamera('left')}
            onRotateCameraRight={() => worldSceneRef.current?.rotateCamera('right')}
            onResetCamera={() => worldSceneRef.current?.resetCamera()}
          />

          {/* Modals */}
          {/* NPC Dialog Modal */}
          {showNpcDialog && (
            <NpcDialogModal
              zoneId={player.currentZone}
              onClose={() => setShowNpcDialog(false)}
              onStartQuest={() => setShowQuestModal(true)}
            />
          )}

          {/* Math Quest / Quiz Modal */}
          {showQuestModal && (
            <QuestQuizModal
              zoneId={player.currentZone}
              questionIndex={currentQuestionIndex}
              onClose={() => setShowQuestModal(false)}
              onCompleteQuestion={handleCompleteQuestion}
              onAllQuestionsCompleted={handleAllQuestionsCompleted}
            />
          )}

          {/* Deep Learning Reflection Modal */}
          {showReflectionModal && (
            <ReflectionModal
              zoneId={player.currentZone}
              onSubmitReflection={handleReflectionSubmitted}
              onClose={() => setShowReflectionModal(false)}
            />
          )}

          {/* World Map Modal */}
          {showWorldMap && (
            <WorldMapModal
              unlockedZones={player.unlockedZones}
              completedZones={player.completedZones}
              currentZone={player.currentZone}
              onSelectZone={(zId) => changeZone(zId)}
              onClose={() => setShowWorldMap(false)}
            />
          )}

          {/* Avatar Customizer Modal */}
          {showAvatarModal && (
            <AvatarCustomizerModal
              currentConfig={player.avatar}
              onSave={handleSaveAvatar}
              onClose={() => setShowAvatarModal(false)}
            />
          )}

          {/* Quest Log & Inventory Modal */}
          {showQuestInventory && (
            <QuestInventoryModal
              player={player}
              currentZone={player.currentZone}
              activeTab={inventoryTab}
              onClose={() => setShowQuestInventory(false)}
              onOpenQuestionModal={() => setShowQuestModal(true)}
            />
          )}
        </div>
      )}
    </div>
  );
}
