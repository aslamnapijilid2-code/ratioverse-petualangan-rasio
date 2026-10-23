import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { AvatarConfig, ZoneId } from '../types/game';
import { buildZoneEnvironment, InteractiveZoneObject, ZoneEnvironmentResult } from './environments';
import { createBlockyCharacter, CharacterController } from './character';
import { soundFx } from '../utils/audio';

export interface WorldControls {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  jump: boolean;
  interact: boolean;
  virtualX: number; // -1 to 1
  virtualY: number; // -1 to 1
}

export interface WorldCallbacks {
  onNearInteractive: (obj: InteractiveZoneObject | null) => void;
  onCoinCollected: (coinId: string) => void;
  onEnterPortal: (zoneId: ZoneId) => void;
  onOpenMathStation: (zoneId: ZoneId) => void;
  onOpenNpcDialog: (zoneId: ZoneId) => void;
}

export class WorldScene {
  private container: HTMLDivElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private clock: THREE.Clock;
  private animFrameId: number = 0;
  private isDestroyed: boolean = false;

  private currentZoneId: ZoneId;
  private zoneResult: ZoneEnvironmentResult | null = null;
  private characterController: CharacterController;
  private playerPos = new THREE.Vector3(0, 0, 8);
  private playerVelY = 0;
  private isGrounded = true;
  private isMoving = false;
  private isCelebrating = false;
  private playerFacingAngle = 0;

  // 360 Camera Orbit controls (look around)
  public cameraYaw: number = 0; // horizontal angle
  public cameraPitch: number = 0.38; // vertical angle (radians)
  public cameraDistance: number = 9.5;
  private isDraggingCamera: boolean = false;
  private prevPointerX: number = 0;
  private prevPointerY: number = 0;

  public controls: WorldControls = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    jump: false,
    interact: false,
    virtualX: 0,
    virtualY: 0,
  };

  private callbacks: WorldCallbacks;
  private activeNearbyObject: InteractiveZoneObject | null = null;
  public isLowGraphics: boolean = false;

  constructor(
    container: HTMLDivElement,
    initialZone: ZoneId,
    avatarConfig: AvatarConfig,
    callbacks: WorldCallbacks,
    isLowGraphics: boolean = false
  ) {
    this.container = container;
    this.currentZoneId = initialZone;
    this.callbacks = callbacks;
    this.isLowGraphics = isLowGraphics;
    this.clock = new THREE.Clock();

    // 1. Detect software WebGL
    const isSoftwareGl = (() => {
      try {
        const gl = document.createElement('canvas').getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch (e) {
        return false;
      }
    })();

    // 2. Setup Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl && !isLowGraphics,
      powerPreference: 'high-performance',
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
    this.renderer.setPixelRatio(isSoftwareGl || isLowGraphics ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = !isSoftwareGl && !isLowGraphics;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setSize(container.clientWidth || 800, container.clientHeight || 500);
    this.renderer.domElement.style.cursor = 'grab';

    container.appendChild(this.renderer.domElement);

    // 3. Setup Scene & Camera
    this.scene = new THREE.Scene();
    this.updateSceneAtmosphere(initialZone);

    this.camera = new THREE.PerspectiveCamera(
      55,
      (container.clientWidth || 800) / (container.clientHeight || 500),
      0.1,
      120
    );
    this.camera.position.set(0, 5, 12);

    // 4. Studio Environment Reflection
    try {
      const pmrem = new THREE.PMREMGenerator(this.renderer);
      this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      pmrem.dispose();
    } catch (e) {
      // safe fallback
    }

    // 5. Lighting Rig
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.9);
    hemiLight.position.set(0, 20, 0);
    this.scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xfffbeb, 1.4);
    dirLight.position.set(15, 25, 15);
    dirLight.castShadow = !isSoftwareGl && !isLowGraphics;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 60;
    const d = 25;
    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;
    dirLight.shadow.bias = -0.0005;
    this.scene.add(dirLight);

    // 6. Character
    this.characterController = createBlockyCharacter(avatarConfig);
    this.characterController.group.position.copy(this.playerPos);
    this.scene.add(this.characterController.group);

    // 7. Load Initial Zone Environment
    this.loadZone(initialZone);

    // 8. Bind resize, pointer drag, wheel & keyboard inputs
    window.addEventListener('resize', this.onWindowResize);
    this.bindKeyboard();
    this.bindPointerOrbit();

    // 9. Start Loop
    this.tick();
  }

  public updateSceneAtmosphere(zoneId: ZoneId) {
    let skyColor = 0xbae6fd; // village light blue
    if (zoneId === 'forest') skyColor = 0x86efac;
    else if (zoneId === 'city') skyColor = 0xc7d2fe;
    else if (zoneId === 'desert') skyColor = 0xfef08a;
    else if (zoneId === 'castle') skyColor = 0xddd6fe;

    this.scene.background = new THREE.Color(skyColor);
    this.scene.fog = new THREE.FogExp2(skyColor, 0.018);
  }

  public loadZone(zoneId: ZoneId) {
    this.currentZoneId = zoneId;
    this.updateSceneAtmosphere(zoneId);

    if (this.zoneResult) {
      this.scene.remove(this.zoneResult.group);
    }

    // Reset player position at entrance
    this.playerPos.set(0, 0, 8);
    this.characterController.group.position.copy(this.playerPos);

    this.zoneResult = buildZoneEnvironment(zoneId);
    this.scene.add(this.zoneResult.group);
  }

  public updateAvatar(config: AvatarConfig) {
    this.characterController.updateAppearance(config);
  }

  public setCelebrating(celebrating: boolean) {
    this.isCelebrating = celebrating;
  }

  public setBridgeRepaired(stage: number) {
    if (this.zoneResult?.bridgeMeshes) {
      this.zoneResult.bridgeMeshes.forEach((mesh, idx) => {
        if (idx < stage) {
          (mesh as THREE.Mesh).material = new THREE.MeshStandardMaterial({
            color: 0x10b981,
            emissive: 0x059669,
            emissiveIntensity: 0.6,
          });
        }
      });
    }
  }

  private bindKeyboard = () => {
    window.addEventListener('keydown', (e) => {
      const key = e.key.toLowerCase();
      if (key === 'w' || key === 'arrowup') this.controls.forward = true;
      if (key === 's' || key === 'arrowdown') this.controls.backward = true;
      if (key === 'a' || key === 'arrowleft') this.controls.left = true;
      if (key === 'd' || key === 'arrowright') this.controls.right = true;
      if (key === ' ' || key === 'spacebar') {
        if (this.isGrounded) {
          this.playerVelY = 8.5;
          this.isGrounded = false;
          soundFx.playJump();
        }
      }
      if (key === 'e') {
        this.triggerInteraction();
      }
    });

    window.addEventListener('keyup', (e) => {
      const key = e.key.toLowerCase();
      if (key === 'w' || key === 'arrowup') this.controls.forward = false;
      if (key === 's' || key === 'arrowdown') this.controls.backward = false;
      if (key === 'a' || key === 'arrowleft') this.controls.left = false;
      if (key === 'd' || key === 'arrowright') this.controls.right = false;
    });
  };

  private onPointerDownHandler = (e: PointerEvent) => {
    // Don't drag if clicking on UI interactive controls
    if ((e.target as HTMLElement) !== this.renderer.domElement) return;
    this.isDraggingCamera = true;
    this.prevPointerX = e.clientX;
    this.prevPointerY = e.clientY;
    this.renderer.domElement.style.cursor = 'grabbing';
  };

  private onPointerMoveHandler = (e: PointerEvent) => {
    if (!this.isDraggingCamera) return;
    const deltaX = e.clientX - this.prevPointerX;
    const deltaY = e.clientY - this.prevPointerY;
    this.prevPointerX = e.clientX;
    this.prevPointerY = e.clientY;

    // Rotate camera yaw (horizontal) and pitch (vertical)
    this.cameraYaw -= deltaX * 0.007;
    this.cameraPitch += deltaY * 0.005;

    // Clamp vertical elevation between 0.08 rad (low angle) and 1.35 rad (high angle)
    this.cameraPitch = Math.max(0.08, Math.min(1.35, this.cameraPitch));
  };

  private onPointerUpHandler = () => {
    this.isDraggingCamera = false;
    this.renderer.domElement.style.cursor = 'grab';
  };

  private onWheelHandler = (e: WheelEvent) => {
    e.preventDefault();
    this.cameraDistance += e.deltaY * 0.005;
    this.cameraDistance = Math.max(4.5, Math.min(18.0, this.cameraDistance));
  };

  private bindPointerOrbit = () => {
    const dom = this.renderer.domElement;
    dom.style.touchAction = 'none';

    dom.addEventListener('pointerdown', this.onPointerDownHandler);
    window.addEventListener('pointermove', this.onPointerMoveHandler);
    window.addEventListener('pointerup', this.onPointerUpHandler);
    dom.addEventListener('wheel', this.onWheelHandler, { passive: false });
  };

  public rotateCamera(direction: 'left' | 'right') {
    const step = 0.45;
    this.cameraYaw += direction === 'left' ? step : -step;
  }

  public resetCamera() {
    this.cameraYaw = 0;
    this.cameraPitch = 0.38;
    this.cameraDistance = 9.5;
  }

  public triggerJump() {
    if (this.isGrounded) {
      this.playerVelY = 8.5;
      this.isGrounded = false;
      soundFx.playJump();
    }
  }

  public triggerInteraction() {
    if (!this.activeNearbyObject) return;
    const obj = this.activeNearbyObject;
    if (obj.type === 'math_station') {
      this.callbacks.onOpenMathStation(this.currentZoneId);
    } else if (obj.type === 'npc') {
      this.callbacks.onOpenNpcDialog(this.currentZoneId);
    } else if (obj.type === 'portal') {
      this.callbacks.onEnterPortal(this.currentZoneId);
    }
  }

  private onWindowResize = () => {
    if (!this.container || this.isDestroyed) return;
    const width = this.container.clientWidth || 800;
    const height = this.container.clientHeight || 500;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  private tick = () => {
    if (this.isDestroyed) return;
    const delta = Math.min(this.clock.getDelta(), 0.1);

    // 1. Process movement inputs
    let rawMoveX = 0;
    let rawMoveZ = 0;

    if (this.controls.forward) rawMoveZ -= 1;
    if (this.controls.backward) rawMoveZ += 1;
    if (this.controls.left) rawMoveX -= 1;
    if (this.controls.right) rawMoveX += 1;

    // Merge virtual joystick input if present
    if (Math.abs(this.controls.virtualX) > 0.05) rawMoveX += this.controls.virtualX;
    if (Math.abs(this.controls.virtualY) > 0.05) rawMoveZ += this.controls.virtualY;

    const moveMag = Math.sqrt(rawMoveX * rawMoveX + rawMoveZ * rawMoveZ);
    this.isMoving = moveMag > 0.1;

    if (this.isMoving) {
      const speed = 7.5;
      const inputForward = -rawMoveZ / moveMag;
      const inputRight = rawMoveX / moveMag;

      // Transform movement relative to camera viewing angle
      const forwardX = -Math.sin(this.cameraYaw);
      const forwardZ = -Math.cos(this.cameraYaw);
      const rightX = Math.cos(this.cameraYaw);
      const rightZ = -Math.sin(this.cameraYaw);

      const worldMoveX = inputRight * rightX + inputForward * forwardX;
      const worldMoveZ = inputRight * rightZ + inputForward * forwardZ;

      this.playerPos.x += worldMoveX * speed * delta;
      this.playerPos.z += worldMoveZ * speed * delta;

      // Bound player within island arena [-30, 30]
      this.playerPos.x = Math.max(-30, Math.min(30, this.playerPos.x));
      this.playerPos.z = Math.max(-30, Math.min(30, this.playerPos.z));

      // Calculate facing direction
      const targetAngle = Math.atan2(worldMoveX, worldMoveZ);
      this.playerFacingAngle = THREE.MathUtils.damp(this.playerFacingAngle, targetAngle, 14, delta);
      this.characterController.group.rotation.y = this.playerFacingAngle;
    }

    // 2. Vertical Jump / Gravity Physics
    if (!this.isGrounded) {
      this.playerVelY -= 22 * delta; // gravity
      this.playerPos.y += this.playerVelY * delta;
      if (this.playerPos.y <= 0) {
        this.playerPos.y = 0;
        this.playerVelY = 0;
        this.isGrounded = true;
      }
    }

    this.characterController.group.position.copy(this.playerPos);
    this.characterController.update(delta, this.isMoving, !this.isGrounded, this.isCelebrating);

    // 3. 360 Orbit Camera Follow
    const camX = Math.sin(this.cameraYaw) * Math.cos(this.cameraPitch) * this.cameraDistance;
    const camY = Math.sin(this.cameraPitch) * this.cameraDistance + 1.2;
    const camZ = Math.cos(this.cameraYaw) * Math.cos(this.cameraPitch) * this.cameraDistance;

    const targetCamPos = this.playerPos.clone().add(new THREE.Vector3(camX, camY, camZ));
    this.camera.position.x = THREE.MathUtils.damp(this.camera.position.x, targetCamPos.x, 8, delta);
    this.camera.position.y = THREE.MathUtils.damp(this.camera.position.y, targetCamPos.y, 8, delta);
    this.camera.position.z = THREE.MathUtils.damp(this.camera.position.z, targetCamPos.z, 8, delta);

    const lookTarget = this.playerPos.clone().add(new THREE.Vector3(0, 1.4, 0));
    this.camera.lookAt(lookTarget);

    // 4. Update zone animated meshes (windmill, gears, boss orb, floating coins)
    if (this.zoneResult) {
      this.zoneResult.animatedMeshes.forEach((item) => item.update(delta));
    }

    // 5. Check Proximity to Interactive Objects & Coins
    this.checkInteractions();

    // 6. Render
    this.renderer.render(this.scene, this.camera);

    this.animFrameId = requestAnimationFrame(this.tick);
  };

  private checkInteractions() {
    if (!this.zoneResult) return;

    let nearest: InteractiveZoneObject | null = null;
    let nearestDist = 999;

    for (const obj of this.zoneResult.interactives) {
      const dist = this.playerPos.distanceTo(obj.position);

      // Auto-collect coin
      if (obj.type === 'coin' && !obj.collected && dist <= obj.radius) {
        obj.collected = true;
        if (obj.mesh) {
          this.zoneResult.group.remove(obj.mesh);
        }
        soundFx.playCoin();
        this.callbacks.onCoinCollected(obj.id);
        continue;
      }

      if (dist <= obj.radius && dist < nearestDist) {
        nearestDist = dist;
        nearest = obj;
      }
    }

    if (nearest !== this.activeNearbyObject) {
      this.activeNearbyObject = nearest;
      this.callbacks.onNearInteractive(nearest);
    }
  }

  public destroy() {
    this.isDestroyed = true;
    cancelAnimationFrame(this.animFrameId);
    window.removeEventListener('resize', this.onWindowResize);
    window.removeEventListener('pointermove', this.onPointerMoveHandler);
    window.removeEventListener('pointerup', this.onPointerUpHandler);
    if (this.renderer.domElement) {
      this.renderer.domElement.removeEventListener('pointerdown', this.onPointerDownHandler);
      this.renderer.domElement.removeEventListener('wheel', this.onWheelHandler);
      if (this.renderer.domElement.parentElement) {
        this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
      }
    }
    this.renderer.dispose();
  }
}
