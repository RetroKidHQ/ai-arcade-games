/**
 * Main Application & Game Loop
 * Lighting, skybox, camera controller, input handling, and HUD synchronization.
 */

class Game {
    constructor() {
        this.container = document.getElementById('game-container');
        this.clock = new THREE.Clock();

        // Input state
        this.input = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            handbrake: false,
            boost: false
        };

        // Camera settings
        this.cameraModes = ['chase', 'hood', 'cinematic', 'orbit'];
        this.cameraModeIndex = 0;
        this.cameraMode = 'chase';
        this.orbitAngle = { yaw: 0, pitch: 0.3 };
        this.isMouseDown = false;
        this.lastMousePos = { x: 0, y: 0 };

        // Time of Day
        this.timeOfDay = 'day'; // 'day', 'sunset', 'night'

        this.initThree();
        this.initEnvironment();
        this.initLighting();
        this.initCar();
        this.initMinimap();
        this.initInputListeners();
        this.initUIListeners();

        // Game loop
        this.animate = this.animate.bind(this);
        requestAnimationFrame(this.animate);
    }

    initThree() {
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x87ceeb, 0.0016);

        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.5, 3000);
        this.camera.position.set(0, 10, 20);

        this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.05;

        this.container.appendChild(this.renderer.domElement);

        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    initEnvironment() {
        // Realistic Sky Dome with Clouds & Sun Glow
        if (window.textureGenerator) {
            const skyGeo = new THREE.SphereGeometry(1800, 32, 24);
            const skyTex = window.textureGenerator.createSkyTexture();
            const skyMat = new THREE.MeshBasicMaterial({
                map: skyTex,
                side: THREE.BackSide,
                fog: false
            });
            this.skyDome = new THREE.Mesh(skyGeo, skyMat);
            this.scene.add(this.skyDome);
        }

        // Build procedural terrain & water
        const terrainMesh = window.terrainManager.createTerrainMesh();
        this.scene.add(terrainMesh);

        const waterMesh = window.terrainManager.createWaterMesh();
        this.scene.add(waterMesh);

        // Build props, buildings, ramps, and vegetation
        this.world = new window.WorldManager(this.scene, window.terrainManager);
        this.world.buildAll();
    }

    initLighting() {
        this.hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6);
        this.hemiLight.position.set(0, 200, 0);
        this.scene.add(this.hemiLight);

        this.dirLight = new THREE.DirectionalLight(0xfff6e5, 1.3);
        this.dirLight.position.set(250, 400, 200);
        this.dirLight.castShadow = true;
        this.dirLight.shadow.mapSize.width = 2048;
        this.dirLight.shadow.mapSize.height = 2048;
        this.dirLight.shadow.camera.near = 50;
        this.dirLight.shadow.camera.far = 1000;
        const d = 160;
        this.dirLight.shadow.camera.left = -d;
        this.dirLight.shadow.camera.right = d;
        this.dirLight.shadow.camera.top = d;
        this.dirLight.shadow.camera.bottom = -d;
        this.scene.add(this.dirLight);

        this.setTimeOfDay('day');
    }

    setTimeOfDay(time) {
        this.timeOfDay = time;
        if (time === 'day') {
            if (this.skyDome) this.skyDome.visible = true;
            this.scene.background = null;
            this.scene.fog.color.setHex(0xbfe1fb);
            this.scene.fog.density = 0.0009;
            this.hemiLight.intensity = 0.75;
            this.hemiLight.color.setHex(0xebf5fb);
            this.hemiLight.groundColor.setHex(0x4a5d3f);
            this.dirLight.intensity = 1.45;
            this.dirLight.color.setHex(0xfffaea);
            this.dirLight.position.set(250, 420, 200);
            this.setStreetLights(false);
            this.setHeadlights(false);
        } else if (time === 'sunset') {
            if (this.skyDome) this.skyDome.visible = false;
            this.scene.background = new THREE.Color(0xe67e52);
            this.scene.fog.color.setHex(0xe67e52);
            this.scene.fog.density = 0.0015;
            this.hemiLight.intensity = 0.45;
            this.hemiLight.color.setHex(0xffaa77);
            this.dirLight.intensity = 1.0;
            this.dirLight.color.setHex(0xff7733);
            this.dirLight.position.set(400, 100, 100);
            this.setStreetLights(true);
            this.setHeadlights(true);
        } else if (time === 'night') {
            if (this.skyDome) this.skyDome.visible = false;
            this.scene.background = new THREE.Color(0x060814);
            this.scene.fog.color.setHex(0x060814);
            this.scene.fog.density = 0.0018;
            this.hemiLight.intensity = 0.15;
            this.hemiLight.color.setHex(0x1a243b);
            this.dirLight.intensity = 0.25;
            this.dirLight.color.setHex(0x5c7cb6);
            this.dirLight.position.set(-150, 250, -100);
            this.setStreetLights(true);
            this.setHeadlights(true);
        }
    }

    setStreetLights(enabled) {
        if (!this.world || !this.world.streetLights) return;
        for (const light of this.world.streetLights) {
            light.intensity = enabled ? 2.2 : 0;
        }
    }

    setHeadlights(enabled) {
        if (!this.car || !this.car.headlights) return;
        for (const light of this.car.headlights) {
            light.intensity = enabled ? 2.5 : 0;
        }
    }

    initCar() {
        this.car = new window.Car(this.scene, window.terrainManager, this.world);
        // Start near the main scenic road
        this.car.resetPosition(-50, -200);
        this.setHeadlights(this.timeOfDay !== 'day');
    }

    initMinimap() {
        this.minimap = new window.Minimap('minimap-canvas', window.terrainManager);
    }

    initInputListeners() {
        window.addEventListener('keydown', (e) => {
            // Initialize sound on first keypress
            window.soundEngine.init();
            window.soundEngine.resume();

            switch (e.code) {
                case 'KeyW':
                case 'ArrowUp':
                    this.input.forward = true;
                    break;
                case 'KeyS':
                case 'ArrowDown':
                    this.input.backward = true;
                    break;
                case 'KeyA':
                case 'ArrowLeft':
                    this.input.left = true;
                    break;
                case 'KeyD':
                case 'ArrowRight':
                    this.input.right = true;
                    break;
                case 'Space':
                    this.input.handbrake = true;
                    e.preventDefault();
                    break;
                case 'ShiftLeft':
                case 'ShiftRight':
                    this.input.boost = true;
                    break;
                case 'KeyC':
                    this.cycleCamera();
                    break;
                case 'KeyR':
                    this.resetCar();
                    break;
                case 'KeyH':
                    window.soundEngine.playHorn(this.car.carType === 'vintage');
                    break;
                case 'KeyM':
                    this.toggleRadio();
                    break;
                case 'KeyL':
                    this.toggleHeadlights();
                    break;
                case 'KeyT':
                    this.cycleTimeOfDay();
                    break;
            }
        });

        window.addEventListener('keyup', (e) => {
            switch (e.code) {
                case 'KeyW':
                case 'ArrowUp':
                    this.input.forward = false;
                    break;
                case 'KeyS':
                case 'ArrowDown':
                    this.input.backward = false;
                    break;
                case 'KeyA':
                case 'ArrowLeft':
                    this.input.left = false;
                    break;
                case 'KeyD':
                case 'ArrowRight':
                    this.input.right = false;
                    break;
                case 'Space':
                    this.input.handbrake = false;
                    break;
                case 'ShiftLeft':
                case 'ShiftRight':
                    this.input.boost = false;
                    break;
            }
        });

        // Mouse drag for Free/Orbit Camera
        window.addEventListener('mousedown', (e) => {
            if (e.target.tagName !== 'BUTTON' && e.target.tagName !== 'SELECT' && e.target.tagName !== 'INPUT') {
                this.isMouseDown = true;
                this.lastMousePos = { x: e.clientX, y: e.clientY };
                window.soundEngine.init();
                window.soundEngine.resume();
            }
        });

        window.addEventListener('mouseup', () => {
            this.isMouseDown = false;
        });

        window.addEventListener('mousemove', (e) => {
            if (this.isMouseDown) {
                const dx = e.clientX - this.lastMousePos.x;
                const dy = e.clientY - this.lastMousePos.y;
                this.orbitAngle.yaw -= dx * 0.006;
                this.orbitAngle.pitch = Math.max(0.05, Math.min(Math.PI / 2.5, this.orbitAngle.pitch + dy * 0.005));
                this.lastMousePos = { x: e.clientX, y: e.clientY };
            }
        });
    }

    initUIListeners() {
        // Vehicle Switcher Modal / Dropdown
        const vehicleSelect = document.getElementById('vehicle-select');
        if (vehicleSelect) {
            vehicleSelect.addEventListener('change', (e) => {
                this.car.setCarType(e.target.value);
                this.setHeadlights(this.timeOfDay !== 'day');
            });
        }

        // Color Picker
        const colorPicker = document.getElementById('paint-picker');
        if (colorPicker) {
            colorPicker.addEventListener('input', (e) => {
                const hex = parseInt(e.target.value.replace('#', '0x'));
                this.car.setPaintColor(hex);
            });
        }

        // Camera Button
        const camBtn = document.getElementById('btn-cam');
        if (camBtn) camBtn.addEventListener('click', () => this.cycleCamera());

        // Reset Button
        const resetBtn = document.getElementById('btn-reset');
        if (resetBtn) resetBtn.addEventListener('click', () => this.resetCar());

        // Horn Button
        const hornBtn = document.getElementById('btn-horn');
        if (hornBtn) hornBtn.addEventListener('click', () => {
            window.soundEngine.init();
            window.soundEngine.playHorn(this.car.carType === 'vintage');
        });

        // Radio Button
        const radioBtn = document.getElementById('btn-radio');
        if (radioBtn) radioBtn.addEventListener('click', () => this.toggleRadio());

        // Time of Day Button
        const todBtn = document.getElementById('btn-tod');
        if (todBtn) todBtn.addEventListener('click', () => this.cycleTimeOfDay());

        // Audio Mute Button
        const muteBtn = document.getElementById('btn-audio');
        if (muteBtn) {
            muteBtn.addEventListener('click', () => {
                const muted = window.soundEngine.toggleMute();
                muteBtn.textContent = muted ? '🔇' : '🔊';
            });
        }

        // Speed Trap callback
        window.onSpeedTrap = (speed) => {
            this.showStuntNotification(`📸 SPEED CAMERA FLASH! ${speed} km/h!`);
        };

        // Stunt callback
        window.onStunt = (text) => {
            this.showStuntNotification(`🏆 ${text}`);
        };

        window.onDrift = (score) => {
            const banner = document.getElementById('drift-banner');
            if (banner) {
                banner.textContent = `DRIFT: ${score} PTS`;
                banner.style.display = 'block';
                clearTimeout(this.driftTimeout);
                this.driftTimeout = setTimeout(() => {
                    banner.style.display = 'none';
                }, 1000);
            }
        };

        // On-screen touch controls for mobile/tablet
        this.setupTouchControl('btn-touch-up', 'forward');
        this.setupTouchControl('btn-touch-down', 'backward');
        this.setupTouchControl('btn-touch-left', 'left');
        this.setupTouchControl('btn-touch-right', 'right');
        this.setupTouchControl('btn-touch-brake', 'handbrake');
        this.setupTouchControl('btn-touch-boost', 'boost');
    }

    setupTouchControl(elementId, action) {
        const el = document.getElementById(elementId);
        if (!el) return;
        const setAction = (val) => {
            this.input[action] = val;
            window.soundEngine.init();
            window.soundEngine.resume();
        };
        el.addEventListener('touchstart', (e) => { e.preventDefault(); setAction(true); });
        el.addEventListener('touchend', (e) => { e.preventDefault(); setAction(false); });
        el.addEventListener('mousedown', (e) => { e.preventDefault(); setAction(true); });
        el.addEventListener('mouseup', (e) => { e.preventDefault(); setAction(false); });
    }

    cycleCamera() {
        this.cameraModeIndex = (this.cameraModeIndex + 1) % this.cameraModes.length;
        this.cameraMode = this.cameraModes[this.cameraModeIndex];
        const camLabel = document.getElementById('cam-label');
        if (camLabel) {
            camLabel.textContent = this.cameraMode.toUpperCase();
        }
    }

    resetCar() {
        // Nearest road center or origin
        const roadInfo = window.terrainManager.getDistanceToRoad(this.car.position.x, this.car.position.z);
        if (roadInfo.p1) {
            this.car.resetPosition(roadInfo.p1.x, roadInfo.p1.z);
        } else {
            this.car.resetPosition(-50, -200);
        }
        this.showStuntNotification('Vehicle Recovered to Road');
    }

    toggleRadio() {
        const playing = window.soundEngine.toggleRadio();
        const btn = document.getElementById('btn-radio');
        if (btn) btn.style.background = playing ? 'rgba(0, 255, 204, 0.4)' : 'rgba(0,0,0,0.5)';
        this.showStuntNotification(playing ? '🎵 Cruising Synthwave Radio: ON' : '📻 Radio: OFF');
    }

    toggleHeadlights() {
        if (!this.car || !this.car.headlights) return;
        const newState = this.car.headlights[0].intensity === 0;
        this.setHeadlights(newState);
        this.showStuntNotification(newState ? '💡 Headlights ON' : 'Headlights OFF');
    }

    cycleTimeOfDay() {
        if (this.timeOfDay === 'day') this.setTimeOfDay('sunset');
        else if (this.timeOfDay === 'sunset') this.setTimeOfDay('night');
        else this.setTimeOfDay('day');
        this.showStuntNotification(`Time: ${this.timeOfDay.toUpperCase()}`);
    }

    showStuntNotification(text) {
        const notif = document.getElementById('stunt-notif');
        if (!notif) return;
        notif.textContent = text;
        notif.style.opacity = '1';
        notif.style.transform = 'translate(-50%, -20px) scale(1.08)';
        clearTimeout(this.notifTimeout);
        this.notifTimeout = setTimeout(() => {
            notif.style.opacity = '0';
            notif.style.transform = 'translate(-50%, 0) scale(1.0)';
        }, 2200);
    }

    updateCamera(delta) {
        const car = this.car;
        const targetPos = car.position.clone();
        const speed = Math.abs(car.speed);

        if (this.cameraMode === 'chase') {
            // Dynamic Chase camera smoothly following the vehicle orientation & slope
            const followDist = 8.5 + (speed / 140.0) * 3.5;
            const followHeight = 3.2 + (speed / 140.0) * 0.8;

            const carBack = new THREE.Vector3(0, 0, -1).applyQuaternion(car.root.quaternion);
            const carUpVec = new THREE.Vector3(0, 1, 0).applyQuaternion(car.root.quaternion);

            const desiredX = targetPos.x + carBack.x * followDist;
            const desiredY = targetPos.y + carBack.y * followDist + carUpVec.y * followHeight;
            const desiredZ = targetPos.z + carBack.z * followDist;

            this.camera.position.x = THREE.MathUtils.lerp(this.camera.position.x, desiredX, 7 * delta);
            this.camera.position.y = THREE.MathUtils.lerp(this.camera.position.y, desiredY, 8 * delta);
            this.camera.position.z = THREE.MathUtils.lerp(this.camera.position.z, desiredZ, 7 * delta);

            const lookTarget = targetPos.clone().add(carUpVec.clone().multiplyScalar(1.2));
            this.camera.lookAt(lookTarget);

            // Dynamic speed FOV
            const targetFOV = 60 + (speed / 160.0) * 15;
            this.camera.fov = THREE.MathUtils.lerp(this.camera.fov, targetFOV, 4 * delta);
            this.camera.updateProjectionMatrix();

        } else if (this.cameraMode === 'hood') {
            // Hood / Driver First-Person View
            const carFwd = new THREE.Vector3(0, 0, 1).applyQuaternion(car.root.quaternion);
            const carUpVec = new THREE.Vector3(0, 1, 0).applyQuaternion(car.root.quaternion);

            this.camera.position.set(
                targetPos.x + carFwd.x * 0.3 + carUpVec.x * 1.25,
                targetPos.y + carFwd.y * 0.3 + carUpVec.y * 1.25,
                targetPos.z + carFwd.z * 0.3 + carUpVec.z * 1.25
            );

            const lookAtPoint = new THREE.Vector3(
                targetPos.x + carFwd.x * 25 + carUpVec.x * 1.1,
                targetPos.y + carFwd.y * 25 + carUpVec.y * 1.1,
                targetPos.z + carFwd.z * 25 + carUpVec.z * 1.1
            );
            this.camera.lookAt(lookAtPoint);

        } else if (this.cameraMode === 'cinematic') {
            // Cinematic Drone Camera
            const time = this.clock.getElapsedTime() * 0.4;
            const dist = 14.0;
            this.camera.position.set(
                targetPos.x + Math.cos(time) * dist,
                targetPos.y + 5.5 + Math.sin(time * 0.5) * 2.0,
                targetPos.z + Math.sin(time) * dist
            );
            this.camera.lookAt(targetPos.clone().add(new THREE.Vector3(0, 1.2, 0)));

        } else if (this.cameraMode === 'orbit') {
            // Free orbit view around the car
            const dist = 10.0;
            const ox = Math.sin(this.orbitAngle.yaw) * Math.cos(this.orbitAngle.pitch) * dist;
            const oy = Math.sin(this.orbitAngle.pitch) * dist;
            const oz = Math.cos(this.orbitAngle.yaw) * Math.cos(this.orbitAngle.pitch) * dist;

            this.camera.position.set(targetPos.x + ox, targetPos.y + oy, targetPos.z + oz);
            this.camera.lookAt(targetPos.clone().add(new THREE.Vector3(0, 1.2, 0)));
        }

        // Shadow follows car
        this.dirLight.position.x = targetPos.x + 150;
        this.dirLight.position.z = targetPos.z + 120;
        this.dirLight.target.position.copy(targetPos);
        this.dirLight.target.updateMatrixWorld();
    }

    updateHUD() {
        const car = this.car;
        const absSpeed = Math.round(Math.abs(car.speed));

        // Digital Speed
        const speedDigitEl = document.getElementById('speed-digital');
        if (speedDigitEl) speedDigitEl.textContent = absSpeed;

        // Analog Speedometer Needle
        const needleEl = document.getElementById('speed-needle');
        if (needleEl) {
            // 0 km/h = -120 deg, 220 km/h = 120 deg
            const angle = -120 + Math.min(220, absSpeed) * (240 / 220);
            needleEl.style.transform = `rotate(${angle}deg)`;
        }

        // Gear Indicator
        const gearEl = document.getElementById('gear-val');
        if (gearEl) {
            if (car.speed < -0.5) gearEl.textContent = 'R';
            else if (absSpeed < 1) gearEl.textContent = 'N';
            else gearEl.textContent = car.currentGear;
        }

        // RPM Bar
        const rpmBar = document.getElementById('rpm-bar');
        if (rpmBar) {
            const rpmPct = Math.min(100, (car.rpm / 7000) * 100);
            rpmBar.style.width = `${rpmPct}%`;
        }

        // Total Score
        const scoreEl = document.getElementById('score-val');
        if (scoreEl) scoreEl.textContent = car.totalStuntScore;
    }

    animate() {
        requestAnimationFrame(this.animate);

        const delta = Math.min(this.clock.getDelta(), 0.1);

        // Update Car Physics
        this.car.update(delta, this.input);

        // Update Open World Props
        this.world.update(delta, this.car.position, Math.abs(this.car.speed));

        // Update Camera
        this.updateCamera(delta);

        // Update Minimap
        this.minimap.render(this.car.position, this.car.heading);

        // Update HUD Gauges
        this.updateHUD();

        // Render Scene
        this.renderer.render(this.scene, this.camera);
    }
}

window.addEventListener('DOMContentLoaded', () => {
    window.game = new Game();
});
