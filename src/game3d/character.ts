import * as THREE from 'three';
import { AvatarConfig } from '../types/game';

export interface CharacterController {
  group: THREE.Group;
  update: (delta: number, isMoving: boolean, isJumping: boolean, isCelebrating: boolean) => void;
  updateAppearance: (config: AvatarConfig) => void;
}

export function createBlockyCharacter(initialConfig: AvatarConfig): CharacterController {
  const group = new THREE.Group();

  // Materials map for dynamic updating
  const skinMat = new THREE.MeshStandardMaterial({
    color: initialConfig.skinColor,
    roughness: 0.8,
    metalness: 0.1,
  });

  const shirtMat = new THREE.MeshStandardMaterial({
    color: initialConfig.shirtColor,
    roughness: 0.7,
    metalness: 0.1,
  });

  const pantsMat = new THREE.MeshStandardMaterial({
    color: initialConfig.pantsColor,
    roughness: 0.8,
    metalness: 0.1,
  });

  const shoeMat = new THREE.MeshStandardMaterial({
    color: 0x1f2937,
    roughness: 0.9,
    metalness: 0.1,
  });

  const accessoryMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    roughness: 0.4,
    metalness: 0.3,
  });

  // Face texture (cute pixel eyes + friendly smile)
  const faceCanvas = document.createElement('canvas');
  faceCanvas.width = 128;
  faceCanvas.height = 128;
  const ctx = faceCanvas.getContext('2d')!;
  ctx.fillStyle = initialConfig.skinColor;
  ctx.fillRect(0, 0, 128, 128);

  // Eyes
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(28, 44, 20, 24);
  ctx.fillRect(80, 44, 20, 24);
  // Eye gleam
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(32, 48, 8, 8);
  ctx.fillRect(84, 48, 8, 8);
  // Cheerful smile
  ctx.strokeStyle = '#991b1b';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(64, 82, 18, 0.15 * Math.PI, 0.85 * Math.PI, false);
  ctx.stroke();

  const faceTexture = new THREE.CanvasTexture(faceCanvas);
  faceTexture.colorSpace = THREE.SRGBColorSpace;
  const faceMat = new THREE.MeshStandardMaterial({
    map: faceTexture,
    roughness: 0.8,
    metalness: 0.1,
  });

  // 1. Head
  const headGeo = new THREE.BoxGeometry(0.7, 0.7, 0.7);
  // Assign face material to front face (+Z is index 4 in box materials)
  const headMaterials = [skinMat, skinMat, skinMat, skinMat, faceMat, skinMat];
  const headMesh = new THREE.Mesh(headGeo, headMaterials);
  headMesh.position.y = 1.65;
  headMesh.castShadow = true;
  group.add(headMesh);

  // 2. Hat / Hair
  const hatGroup = new THREE.Group();
  headMesh.add(hatGroup);

  function rebuildHat(hatType: string) {
    while (hatGroup.children.length > 0) {
      hatGroup.remove(hatGroup.children[0]);
    }
    if (hatType === 'cap') {
      const capGeo = new THREE.BoxGeometry(0.74, 0.22, 0.74);
      const capMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.6 });
      const cap = new THREE.Mesh(capGeo, capMat);
      cap.position.y = 0.32;
      const visorGeo = new THREE.BoxGeometry(0.6, 0.08, 0.35);
      const visor = new THREE.Mesh(visorGeo, capMat);
      visor.position.set(0, 0.25, 0.45);
      hatGroup.add(cap, visor);
    } else if (hatType === 'crown') {
      const crownGeo = new THREE.BoxGeometry(0.76, 0.25, 0.76);
      const crownMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.7, roughness: 0.2 });
      const crown = new THREE.Mesh(crownGeo, crownMat);
      crown.position.y = 0.36;
      hatGroup.add(crown);
    } else if (hatType === 'goggles') {
      const goggleGeo = new THREE.BoxGeometry(0.75, 0.16, 0.75);
      const gMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6, metalness: 0.4, roughness: 0.3 });
      const goggle = new THREE.Mesh(goggleGeo, gMat);
      goggle.position.set(0, 0.2, 0.02);
      hatGroup.add(goggle);
    } else if (hatType === 'wizard') {
      const coneGeo = new THREE.ConeGeometry(0.45, 0.7, 5);
      const coneMat = new THREE.MeshStandardMaterial({ color: 0x6366f1, roughness: 0.5 });
      const cone = new THREE.Mesh(coneGeo, coneMat);
      cone.position.y = 0.65;
      hatGroup.add(cone);
    }
  }
  rebuildHat(initialConfig.hat);

  // 3. Torso / Body
  const torsoGeo = new THREE.BoxGeometry(0.8, 0.85, 0.45);
  const torsoMesh = new THREE.Mesh(torsoGeo, shirtMat);
  torsoMesh.position.y = 0.95;
  torsoMesh.castShadow = true;
  group.add(torsoMesh);

  // 4. Accessory (Backpack or Cape)
  const accessoryGroup = new THREE.Group();
  torsoMesh.add(accessoryGroup);

  function rebuildAccessory(accType: string) {
    while (accessoryGroup.children.length > 0) {
      accessoryGroup.remove(accessoryGroup.children[0]);
    }
    if (accType === 'backpack') {
      const packGeo = new THREE.BoxGeometry(0.5, 0.6, 0.25);
      const pack = new THREE.Mesh(packGeo, accessoryMat);
      pack.position.set(0, 0, -0.32);
      accessoryGroup.add(pack);
    } else if (accType === 'cape') {
      const capeGeo = new THREE.BoxGeometry(0.65, 0.8, 0.06);
      const capeMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.6 });
      const cape = new THREE.Mesh(capeGeo, capeMat);
      cape.position.set(0, -0.1, -0.26);
      cape.rotation.x = 0.1;
      accessoryGroup.add(cape);
    } else if (accType === 'wings') {
      const wingGeo = new THREE.BoxGeometry(0.9, 0.3, 0.05);
      const wingMat = new THREE.MeshStandardMaterial({ color: 0x67e8f9, emissive: 0x06b6d4, emissiveIntensity: 0.3 });
      const wings = new THREE.Mesh(wingGeo, wingMat);
      wings.position.set(0, 0.1, -0.28);
      accessoryGroup.add(wings);
    }
  }
  rebuildAccessory(initialConfig.accessory);

  // 5. Left Arm & Right Arm (Pivoted at shoulders)
  const armGeo = new THREE.BoxGeometry(0.3, 0.8, 0.3);
  armGeo.translate(0, -0.35, 0); // pivot at shoulder

  const leftArm = new THREE.Mesh(armGeo, shirtMat);
  leftArm.position.set(-0.58, 1.3, 0);
  leftArm.castShadow = true;
  group.add(leftArm);

  const rightArm = new THREE.Mesh(armGeo, shirtMat);
  rightArm.position.set(0.58, 1.3, 0);
  rightArm.castShadow = true;
  group.add(rightArm);

  // 6. Left Leg & Right Leg (Pivoted at hips)
  const legGeo = new THREE.BoxGeometry(0.35, 0.65, 0.35);
  legGeo.translate(0, -0.3, 0); // pivot at hip

  const leftLeg = new THREE.Mesh(legGeo, pantsMat);
  leftLeg.position.set(-0.22, 0.6, 0);
  leftLeg.castShadow = true;
  group.add(leftLeg);

  const rightLeg = new THREE.Mesh(legGeo, pantsMat);
  rightLeg.position.set(0.22, 0.6, 0);
  rightLeg.castShadow = true;
  group.add(rightLeg);

  // 7. Shoes
  const shoeGeo = new THREE.BoxGeometry(0.36, 0.15, 0.42);
  const leftShoe = new THREE.Mesh(shoeGeo, shoeMat);
  leftShoe.position.set(0, -0.58, 0.04);
  leftLeg.add(leftShoe);

  const rightShoe = new THREE.Mesh(shoeGeo, shoeMat);
  rightShoe.position.set(0, -0.58, 0.04);
  rightLeg.add(rightShoe);

  // Contact shadow under character
  const shadowGeo = new THREE.PlaneGeometry(1.0, 1.0);
  const shadowMat = new THREE.MeshBasicMaterial({
    color: 0x000000,
    transparent: true,
    opacity: 0.35,
    depthWrite: false,
  });
  const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
  shadowPlane.rotation.x = -Math.PI / 2;
  shadowPlane.position.y = 0.02;
  group.add(shadowPlane);

  let animTime = 0;

  function update(delta: number, isMoving: boolean, isJumping: boolean, isCelebrating: boolean) {
    animTime += delta * 8;

    if (isCelebrating) {
      // Victory dance: arms up and jump celebration
      leftArm.rotation.x = Math.PI;
      rightArm.rotation.x = Math.PI;
      leftArm.rotation.z = Math.sin(animTime * 1.5) * 0.3 - 0.4;
      rightArm.rotation.z = -Math.sin(animTime * 1.5) * 0.3 + 0.4;
      leftLeg.rotation.x = 0;
      rightLeg.rotation.x = 0;
      headMesh.rotation.y = Math.sin(animTime) * 0.2;
      return;
    }

    if (isJumping) {
      // Arms angled back, legs slightly tucked
      leftArm.rotation.x = -0.6;
      rightArm.rotation.x = -0.6;
      leftArm.rotation.z = -0.3;
      rightArm.rotation.z = 0.3;
      leftLeg.rotation.x = -0.4;
      rightLeg.rotation.x = -0.2;
      return;
    }

    if (isMoving) {
      // Walk swing
      const swing = Math.sin(animTime);
      leftArm.rotation.x = swing * 0.7;
      rightArm.rotation.x = -swing * 0.7;
      leftArm.rotation.z = 0.05;
      rightArm.rotation.z = -0.05;

      leftLeg.rotation.x = -swing * 0.7;
      rightLeg.rotation.x = swing * 0.7;

      torsoMesh.position.y = 0.95 + Math.abs(Math.sin(animTime * 2)) * 0.06;
      headMesh.position.y = 1.65 + Math.abs(Math.sin(animTime * 2)) * 0.06;
    } else {
      // Idle breathing
      const breath = Math.sin(animTime * 0.25) * 0.03;
      leftArm.rotation.x = THREE.MathUtils.damp(leftArm.rotation.x, 0, 10, delta);
      rightArm.rotation.x = THREE.MathUtils.damp(rightArm.rotation.x, 0, 10, delta);
      leftArm.rotation.z = 0.05;
      rightArm.rotation.z = -0.05;

      leftLeg.rotation.x = THREE.MathUtils.damp(leftLeg.rotation.x, 0, 10, delta);
      rightLeg.rotation.x = THREE.MathUtils.damp(rightLeg.rotation.x, 0, 10, delta);

      torsoMesh.position.y = 0.95 + breath;
      headMesh.position.y = 1.65 + breath * 1.2;
    }
  }

  function updateAppearance(cfg: AvatarConfig) {
    skinMat.color.set(cfg.skinColor);
    shirtMat.color.set(cfg.shirtColor);
    pantsMat.color.set(cfg.pantsColor);

    // Redraw face canvas
    ctx.fillStyle = cfg.skinColor;
    ctx.fillRect(0, 0, 128, 128);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(28, 44, 20, 24);
    ctx.fillRect(80, 44, 20, 24);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(32, 48, 8, 8);
    ctx.fillRect(84, 48, 8, 8);
    ctx.strokeStyle = '#991b1b';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(64, 82, 18, 0.15 * Math.PI, 0.85 * Math.PI, false);
    ctx.stroke();
    faceTexture.needsUpdate = true;

    rebuildHat(cfg.hat);
    rebuildAccessory(cfg.accessory);
  }

  return {
    group,
    update,
    updateAppearance,
  };
}
