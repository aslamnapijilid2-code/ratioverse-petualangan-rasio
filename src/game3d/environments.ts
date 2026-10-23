import * as THREE from 'three';
import { ZoneId } from '../types/game';

export interface InteractiveZoneObject {
  id: string;
  type: 'npc' | 'math_station' | 'portal' | 'coin';
  position: THREE.Vector3;
  radius: number;
  label: string;
  hintText: string;
  mesh?: THREE.Object3D;
  collected?: boolean;
}

export interface ZoneEnvironmentResult {
  group: THREE.Group;
  interactives: InteractiveZoneObject[];
  animatedMeshes: { mesh: THREE.Object3D; update: (delta: number) => void }[];
  portalMesh: THREE.Object3D;
  bridgeMeshes?: THREE.Object3D[];
}

// Procedural materials helper
function getMaterial(color: number, roughness = 0.7, metalness = 0.1) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness });
}

export function buildZoneEnvironment(zoneId: ZoneId): ZoneEnvironmentResult {
  const group = new THREE.Group();
  const interactives: InteractiveZoneObject[] = [];
  const animatedMeshes: { mesh: THREE.Object3D; update: (delta: number) => void }[] = [];
  let bridgeMeshes: THREE.Object3D[] = [];

  // 1. Terrain Ground
  let groundColor = 0x4ade80; // green for village
  if (zoneId === 'forest') groundColor = 0x166534;
  else if (zoneId === 'city') groundColor = 0x64748b;
  else if (zoneId === 'desert') groundColor = 0xf59e0b;
  else if (zoneId === 'castle') groundColor = 0x334155;

  const groundGeo = new THREE.BoxGeometry(70, 2, 70);
  const groundMat = new THREE.MeshStandardMaterial({
    color: groundColor,
    roughness: 0.9,
    metalness: 0.05,
  });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.position.y = -1;
  ground.receiveShadow = true;
  group.add(ground);

  // Decorative paths
  const pathMat = new THREE.MeshStandardMaterial({
    color: zoneId === 'desert' ? 0xd97706 : zoneId === 'city' ? 0x334155 : 0xd1d5db,
    roughness: 0.8,
  });
  const mainPath = new THREE.Mesh(new THREE.BoxGeometry(4, 0.05, 40), pathMat);
  mainPath.position.set(0, 0.02, 0);
  mainPath.receiveShadow = true;
  group.add(mainPath);

  // 2. Zone Specific Features
  if (zoneId === 'village') {
    // Village Cottages (3-part voxel houses)
    const housePositions = [
      { x: -10, z: -8, rot: 0.3 },
      { x: 12, z: -10, rot: -0.4 },
      { x: -12, z: 8, rot: 1.2 },
    ];
    housePositions.forEach((pos) => {
      const houseGroup = new THREE.Group();
      // Wall
      const wall = new THREE.Mesh(new THREE.BoxGeometry(5, 3.5, 4.5), getMaterial(0xfef3c7, 0.8));
      wall.position.y = 1.75;
      wall.castShadow = true;
      // Roof
      const roof = new THREE.Mesh(new THREE.ConeGeometry(4.2, 2.2, 4), getMaterial(0xb91c1c, 0.7));
      roof.position.y = 4.2;
      roof.rotation.y = Math.PI / 4;
      roof.castShadow = true;
      // Door
      const door = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2, 0.2), getMaterial(0x78350f));
      door.position.set(0, 1, 2.3);
      houseGroup.add(wall, roof, door);
      houseGroup.position.set(pos.x, 0, pos.z);
      houseGroup.rotation.y = pos.rot;
      group.add(houseGroup);
    });

    // Windmill with rotating sails
    const millGroup = new THREE.Group();
    const millTower = new THREE.Mesh(new THREE.CylinderGeometry(2, 3, 7, 8), getMaterial(0xf3f4f6));
    millTower.position.y = 3.5;
    millTower.castShadow = true;
    const millRoof = new THREE.Mesh(new THREE.ConeGeometry(2.5, 2, 8), getMaterial(0x1e3a8a));
    millRoof.position.y = 7.5;
    const sailCenter = new THREE.Group();
    sailCenter.position.set(0, 6, 2.2);
    for (let i = 0; i < 4; i++) {
      const blade = new THREE.Mesh(new THREE.BoxGeometry(0.5, 4.5, 0.1), getMaterial(0x9ca3af));
      blade.position.y = 2.2;
      blade.rotation.z = (i * Math.PI) / 2;
      blade.castShadow = true;
      sailCenter.add(blade);
    }
    millGroup.add(millTower, millRoof, sailCenter);
    millGroup.position.set(16, 0, 12);
    group.add(millGroup);

    animatedMeshes.push({
      mesh: sailCenter,
      update: (delta) => {
        sailCenter.rotation.z += delta * 0.8;
      },
    });

    // Apple Trees with red & green voxel apples
    const treePositions = [
      { x: -6, z: -16 },
      { x: 6, z: -16 },
      { x: -16, z: -2 },
      { x: 18, z: -4 },
    ];
    treePositions.forEach((pos, idx) => {
      const tree = new THREE.Group();
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.5, 3, 6), getMaterial(0x78350f));
      trunk.position.y = 1.5;
      trunk.castShadow = true;
      const foliage = new THREE.Mesh(new THREE.DodecahedronGeometry(2), getMaterial(0x22c55e, 0.9));
      foliage.position.y = 3.6;
      foliage.castShadow = true;

      // Fruit cubes
      for (let f = 0; f < 3; f++) {
        const apple = new THREE.Mesh(
          new THREE.BoxGeometry(0.35, 0.35, 0.35),
          getMaterial(f % 2 === 0 ? 0xef4444 : 0x84cc16)
        );
        apple.position.set(
          (Math.random() - 0.5) * 1.8,
          3.2 + Math.random() * 0.8,
          (Math.random() - 0.5) * 1.8
        );
        tree.add(apple);
      }
      tree.add(trunk, foliage);
      tree.position.set(pos.x, 0, pos.z);
      group.add(tree);
    });

    // Fruit Stall (Math Station)
    const stall = new THREE.Group();
    const table = new THREE.Mesh(new THREE.BoxGeometry(3, 1, 1.5), getMaterial(0xd97706));
    table.position.y = 0.5;
    const awning = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.2, 2), getMaterial(0xdc2626));
    awning.position.set(0, 2.5, 0);
    // Red & green apples in baskets
    const appleCrate = new THREE.Mesh(new THREE.BoxGeometry(1, 0.4, 0.8), getMaterial(0xb45309));
    appleCrate.position.set(-0.7, 1.2, 0);
    stall.add(table, awning, appleCrate);
    stall.position.set(0, 0, -6);
    group.add(stall);

    interactives.push({
      id: 'station_village',
      type: 'math_station',
      position: new THREE.Vector3(0, 0, -6),
      radius: 3.2,
      label: 'Festival Buah Apel',
      hintText: 'Buka Misi Perbandingan Buah',
    });
  } else if (zoneId === 'forest') {
    // Simplify Forest: Pine trees, river, broken bridge segments
    for (let i = 0; i < 18; i++) {
      const px = (Math.random() - 0.5) * 55;
      const pz = (Math.random() - 0.5) * 55;
      if (Math.abs(px) < 5 && Math.abs(pz) < 18) continue; // clear path

      const pine = new THREE.Group();
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.4, 2, 6), getMaterial(0x522e14));
      trunk.position.y = 1;
      const tier1 = new THREE.Mesh(new THREE.ConeGeometry(1.8, 2.5, 6), getMaterial(0x14532d));
      tier1.position.y = 2.5;
      const tier2 = new THREE.Mesh(new THREE.ConeGeometry(1.3, 2.2, 6), getMaterial(0x15803d));
      tier2.position.y = 3.8;
      pine.add(trunk, tier1, tier2);
      pine.position.set(px, 0, pz);
      group.add(pine);
    }

    // River running across
    const river = new THREE.Mesh(
      new THREE.BoxGeometry(60, 0.1, 8),
      new THREE.MeshStandardMaterial({
        color: 0x0284c7,
        roughness: 0.1,
        metalness: 0.8,
        transparent: true,
        opacity: 0.85,
      })
    );
    river.position.set(0, 0.05, -5);
    group.add(river);

    // Broken Stone Bridge spanning the river
    const bridgeGroup = new THREE.Group();
    bridgeGroup.position.set(0, 0.2, -5);
    // Left & Right Piers
    const pierL = new THREE.Mesh(new THREE.BoxGeometry(4, 1.2, 2), getMaterial(0x78716c));
    pierL.position.set(0, 0.6, 3.5);
    const pierR = new THREE.Mesh(new THREE.BoxGeometry(4, 1.2, 2), getMaterial(0x78716c));
    pierR.position.set(0, 0.6, -3.5);
    bridgeGroup.add(pierL, pierR);

    // 3 Bridge Plank Segments (activated / glowing upon questions completed)
    for (let b = 0; b < 3; b++) {
      const plank = new THREE.Mesh(
        new THREE.BoxGeometry(3.6, 0.4, 1.6),
        new THREE.MeshStandardMaterial({
          color: 0xa8a29e,
          roughness: 0.5,
          emissive: 0x10b981,
          emissiveIntensity: 0.2,
        })
      );
      plank.position.set(0, 1.0, -1.6 + b * 1.6);
      plank.castShadow = true;
      bridgeGroup.add(plank);
      bridgeMeshes.push(plank);
    }
    group.add(bridgeGroup);

    interactives.push({
      id: 'station_forest',
      type: 'math_station',
      position: new THREE.Vector3(0, 0, -4),
      radius: 3.5,
      label: 'Konsol Jembatan Hutan',
      hintText: 'Perbaiki Jembatan dengan Rasio Paling Sederhana!',
    });
  } else if (zoneId === 'city') {
    // Proportion City: Colorful voxel skyscrapers
    const buildings = [
      { x: -14, z: -12, w: 7, h: 14, d: 7, c: 0x2563eb },
      { x: 14, z: -12, w: 7, h: 18, d: 7, c: 0x7c3aed },
      { x: -16, z: 10, w: 8, h: 12, d: 8, c: 0x0891b2 },
      { x: 16, z: 12, w: 8, h: 16, d: 7, c: 0x4f46e5 },
    ];
    buildings.forEach((b) => {
      const tower = new THREE.Mesh(new THREE.BoxGeometry(b.w, b.h, b.d), getMaterial(b.c, 0.5, 0.2));
      tower.position.set(b.x, b.h / 2, b.z);
      tower.castShadow = true;
      tower.receiveShadow = true;
      group.add(tower);

      // Windows
      const windowMat = new THREE.MeshStandardMaterial({
        color: 0xfef08a,
        emissive: 0xfacc15,
        emissiveIntensity: 0.4,
      });
      for (let wy = 3; wy < b.h - 2; wy += 3) {
        const win = new THREE.Mesh(new THREE.BoxGeometry(b.w + 0.1, 1, 1), windowMat);
        win.position.set(b.x, wy, b.z);
        group.add(win);
      }
    });

    // Proportion Machine in center plaza
    const machineGroup = new THREE.Group();
    const machineBase = new THREE.Mesh(new THREE.BoxGeometry(4, 2, 3), getMaterial(0x1e293b, 0.4, 0.6));
    machineBase.position.y = 1;
    // Big Brass Gear
    const gearGeo = new THREE.CylinderGeometry(1.4, 1.4, 0.3, 12);
    const gearMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.8,
      roughness: 0.2,
    });
    const gear1 = new THREE.Mesh(gearGeo, gearMat);
    gear1.position.set(0, 2.5, 0);
    gear1.rotation.x = Math.PI / 2;
    machineGroup.add(machineBase, gear1);
    machineGroup.position.set(0, 0, -8);
    group.add(machineGroup);

    animatedMeshes.push({
      mesh: gear1,
      update: (delta) => {
        gear1.rotation.z += delta * 1.5;
      },
    });

    interactives.push({
      id: 'station_city',
      type: 'math_station',
      position: new THREE.Vector3(0, 0, -8),
      radius: 3.5,
      label: 'Mesin Pelipatganda Pabrik',
      hintText: 'Operasikan Rasio Senilai!',
    });
  } else if (zoneId === 'desert') {
    // Unit Ratio Desert: Sand dunes, step pyramid, obelisk, fuel depot
    const pyramid = new THREE.Group();
    const stepCount = 5;
    for (let s = 0; s < stepCount; s++) {
      const size = 16 - s * 2.8;
      const stepMesh = new THREE.Mesh(new THREE.BoxGeometry(size, 1.5, size), getMaterial(0xd97706, 0.9));
      stepMesh.position.y = s * 1.5 + 0.75;
      stepMesh.castShadow = true;
      stepMesh.receiveShadow = true;
      pyramid.add(stepMesh);
    }
    pyramid.position.set(-15, 0, -15);
    group.add(pyramid);

    // Glowing energy crystals
    const crystalGeo = new THREE.OctahedronGeometry(1.2, 0);
    const crystalMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      emissive: 0x0891b2,
      emissiveIntensity: 0.6,
      metalness: 0.3,
      roughness: 0.2,
    });
    const crystal1 = new THREE.Mesh(crystalGeo, crystalMat);
    crystal1.position.set(0, 2.5, -9);
    group.add(crystal1);

    animatedMeshes.push({
      mesh: crystal1,
      update: (delta) => {
        crystal1.rotation.y += delta * 1.2;
        crystal1.position.y = 2.5 + Math.sin(Date.now() * 0.003) * 0.3;
      },
    });

    // Rover buggy
    const buggy = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(2.5, 1, 3.5), getMaterial(0xef4444));
    body.position.y = 1;
    buggy.add(body);
    buggy.position.set(12, 0, -6);
    group.add(buggy);

    interactives.push({
      id: 'station_desert',
      type: 'math_station',
      position: new THREE.Vector3(0, 0, -9),
      radius: 3.5,
      label: 'Stasiun Kristal & Bahan Bakar',
      hintText: 'Hitung Rasio Satuan (Unit Rate)',
    });
  } else if (zoneId === 'castle') {
    // Proportion Castle: Stone battlements, grand throne, Boss of Ratios floating orb
    const castleWall = new THREE.Mesh(new THREE.BoxGeometry(24, 8, 3), getMaterial(0x475569, 0.7));
    castleWall.position.set(0, 4, -18);
    castleWall.castShadow = true;
    group.add(castleWall);

    // Castle Towers
    const towerL = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 2.8, 12, 8), getMaterial(0x334155));
    towerL.position.set(-12, 6, -18);
    towerL.castShadow = true;
    const towerR = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 2.8, 12, 8), getMaterial(0x334155));
    towerR.position.set(12, 6, -18);
    towerR.castShadow = true;
    group.add(towerL, towerR);

    // Boss Pedestal & Magical floating boss orb
    const dais = new THREE.Mesh(new THREE.CylinderGeometry(3.5, 4, 1.2, 10), getMaterial(0x1e1b4b, 0.5));
    dais.position.set(0, 0.6, -10);
    dais.receiveShadow = true;
    group.add(dais);

    const bossGroup = new THREE.Group();
    bossGroup.position.set(0, 3.5, -10);

    const coreOrb = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.5, 1),
      new THREE.MeshStandardMaterial({
        color: 0x8b5cf6,
        emissive: 0x7c3aed,
        emissiveIntensity: 0.8,
        metalness: 0.4,
        roughness: 0.2,
      })
    );
    bossGroup.add(coreOrb);

    // Orbiting magical ratio cubes
    const orbiters: THREE.Mesh[] = [];
    for (let c = 0; c < 4; c++) {
      const cube = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.5, 0.5),
        new THREE.MeshStandardMaterial({
          color: 0xfacc15,
          emissive: 0xeab308,
          emissiveIntensity: 0.5,
        })
      );
      bossGroup.add(cube);
      orbiters.push(cube);
    }
    group.add(bossGroup);

    animatedMeshes.push({
      mesh: bossGroup,
      update: (delta) => {
        bossGroup.rotation.y += delta * 0.8;
        const t = Date.now() * 0.002;
        orbiters.forEach((orb, i) => {
          const angle = t + (i * Math.PI) / 2;
          orb.position.set(Math.cos(angle) * 2.4, Math.sin(t * 2 + i) * 0.5, Math.sin(angle) * 2.4);
        });
      },
    });

    interactives.push({
      id: 'station_castle',
      type: 'math_station',
      position: new THREE.Vector3(0, 0, -10),
      radius: 4.0,
      label: 'Singgasana Boss of Ratios',
      hintText: 'Tantangan Terakhir: Uji Proporsi Agung!',
    });
  }

  // 3. NPC Character in Zone
  const npcGroup = new THREE.Group();
  const npcBody = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.2, 0.5), getMaterial(0x0284c7));
  npcBody.position.y = 1.0;
  const npcHead = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.7, 0.7), getMaterial(0xfbcfe8));
  npcHead.position.y = 1.95;
  const npcHat = new THREE.Mesh(new THREE.ConeGeometry(0.5, 0.7, 5), getMaterial(0xf59e0b));
  npcHat.position.y = 2.6;
  npcGroup.add(npcBody, npcHead, npcHat);

  // Position NPC near the player path
  npcGroup.position.set(3.5, 0, -2);
  group.add(npcGroup);

  interactives.push({
    id: `npc_${zoneId}`,
    type: 'npc',
    position: new THREE.Vector3(3.5, 0, -2),
    radius: 3.0,
    label: 'NPC Guru Pembimbing',
    hintText: 'Bicara dengan NPC Penjaga Zona',
  });

  // 4. Portal Archway to Next Zone (at z = -24)
  const portalGroup = new THREE.Group();
  const pillarL = new THREE.Mesh(new THREE.BoxGeometry(1.2, 6, 1.2), getMaterial(0x475569));
  pillarL.position.set(-2.5, 3, 0);
  const pillarR = new THREE.Mesh(new THREE.BoxGeometry(1.2, 6, 1.2), getMaterial(0x475569));
  pillarR.position.set(2.5, 3, 0);
  const lintel = new THREE.Mesh(new THREE.BoxGeometry(6.2, 1.2, 1.4), getMaterial(0x334155));
  lintel.position.set(0, 6.2, 0);

  // Glowing portal energy sheet
  const portalEnergy = new THREE.Mesh(
    new THREE.PlaneGeometry(4.2, 5.4),
    new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.6,
      transparent: true,
      opacity: 0.75,
      side: THREE.DoubleSide,
    })
  );
  portalEnergy.position.set(0, 3.2, 0);

  portalGroup.add(pillarL, pillarR, lintel, portalEnergy);
  portalGroup.position.set(0, 0, -24);
  group.add(portalGroup);

  animatedMeshes.push({
    mesh: portalEnergy,
    update: (delta) => {
      portalEnergy.rotation.y = Math.sin(Date.now() * 0.002) * 0.05;
    },
  });

  interactives.push({
    id: `portal_${zoneId}`,
    type: 'portal',
    position: new THREE.Vector3(0, 0, -24),
    radius: 3.2,
    label: 'Gerbang Portal Zona',
    hintText: 'Menuju Zona Petualangan Berikutnya',
  });

  // 5. Floating Gold Coins across the zone
  const coinPositions = [
    { x: -2, z: 2 },
    { x: 3, z: 4 },
    { x: -5, z: -10 },
    { x: 4, z: -12 },
    { x: -1, z: -18 },
  ];

  coinPositions.forEach((cp, idx) => {
    const coinGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.12, 10);
    const coinMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      metalness: 0.8,
      roughness: 0.2,
      emissive: 0xca8a04,
      emissiveIntensity: 0.3,
    });
    const coin = new THREE.Mesh(coinGeo, coinMat);
    coin.rotation.x = Math.PI / 2;
    coin.position.set(cp.x, 1.0, cp.z);
    coin.castShadow = true;
    group.add(coin);

    const coinObj: InteractiveZoneObject = {
      id: `coin_${zoneId}_${idx}`,
      type: 'coin',
      position: new THREE.Vector3(cp.x, 1.0, cp.z),
      radius: 1.4,
      label: 'Koin Emas Rasio',
      hintText: 'Ambil Koin (+10 Koin)',
      mesh: coin,
      collected: false,
    };
    interactives.push(coinObj);

    animatedMeshes.push({
      mesh: coin,
      update: (delta) => {
        if (!coinObj.collected) {
          coin.rotation.z += delta * 3.0;
          coin.position.y = 1.0 + Math.sin(Date.now() * 0.005 + idx) * 0.15;
        }
      },
    });
  });

  return {
    group,
    interactives,
    animatedMeshes,
    portalMesh: portalEnergy,
    bridgeMeshes,
  };
}
