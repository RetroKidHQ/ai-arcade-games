/**
 * Procedural Terrain & Road Network with Photorealistic Textures
 * High-resolution multi-blade grass, crushed stone gravel driveway, and smooth asphalt roads.
 */
class TerrainManager {
    constructor() {
        this.worldSize = 1400;
        this.halfSize = this.worldSize / 2;
        this.segments = 180;
        this.waterHeight = -2.0;

        // Road network spline waypoints
        this.roads = [
            // Main coastal highway loop
            [
                { x: -500, z: -500 }, { x: 0, z: -550 }, { x: 500, z: -480 },
                { x: 580, z: -100 }, { x: 520, z: 450 }, { x: 0, z: 520 },
                { x: -480, z: 460 }, { x: -560, z: 0 }, { x: -500, z: -500 }
            ],
            // Cross-country mountain pass
            [
                { x: -480, z: 0 }, { x: -250, z: -50 }, { x: 0, z: 0 },
                { x: 250, z: 80 }, { x: 520, z: 120 }
            ],
            // Downtown grid road
            [
                { x: -50, z: -550 }, { x: -50, z: 520 }
            ],
            // Stunt arena loop access
            [
                { x: 100, z: 100 }, { x: 300, z: 250 }, { x: 420, z: 380 }
            ]
        ];

        this.roadWidth = 9.0;
        this.mesh = null;
    }

    hash2D(x, z) {
        let n = Math.sin(x * 127.1 + z * 311.7) * 43758.5453123;
        return n - Math.floor(n);
    }

    smoothNoise(x, z) {
        const i = Math.floor(x);
        const j = Math.floor(z);
        const fx = x - i;
        const fz = z - j;
        const u = fx * fx * (3.0 - 2.0 * fx);
        const v = fz * fz * (3.0 - 2.0 * fz);

        const a0 = this.hash2D(i, j);
        const a1 = this.hash2D(i + 1, j);
        const b0 = this.hash2D(i, j + 1);
        const b1 = this.hash2D(i + 1, j + 1);

        return (a0 * (1 - u) + a1 * u) * (1 - v) + (b0 * (1 - u) + b1 * u) * v;
    }

    perlin(x, z) {
        let total = 0;
        let freq = 0.0035;
        let amp = 32.0;

        total += this.smoothNoise(x * freq, z * freq) * amp;
        total += this.smoothNoise(x * freq * 2.2, z * freq * 2.2) * (amp * 0.45);
        total += this.smoothNoise(x * freq * 5.0, z * freq * 5.0) * (amp * 0.15);

        return total;
    }

    getDistanceToRoad(x, z) {
        let minDistance = 99999;
        let nearestP1 = null;
        let nearestP2 = null;

        for (const road of this.roads) {
            for (let i = 0; i < road.length - 1; i++) {
                const p1 = road[i];
                const p2 = road[i + 1];

                const dx = p2.x - p1.x;
                const dz = p2.z - p1.z;
                const l2 = dx * dx + dz * dz;

                let t = ((x - p1.x) * dx + (z - p1.z) * dz) / l2;
                t = Math.max(0, Math.min(1, t));

                const projX = p1.x + t * dx;
                const projZ = p1.z + t * dz;

                const dist = Math.hypot(x - projX, z - projZ);
                if (dist < minDistance) {
                    minDistance = dist;
                    nearestP1 = p1;
                    nearestP2 = p2;
                }
            }
        }
        return { distance: minDistance, p1: nearestP1, p2: nearestP2 };
    }

    getHeight(x, z) {
        const distFromCenter = Math.hypot(x + 120, z + 120);
        let centerFlatFactor = Math.min(1.0, Math.max(0, (distFromCenter - 90) / 100));

        const distFromStunt = Math.hypot(x - 300, z - 300);
        let stuntFlatFactor = Math.min(1.0, Math.max(0, (distFromStunt - 90) / 70));

        let baseHeight = (this.perlin(x, z) - 10) * centerFlatFactor * stuntFlatFactor;

        if (x > 150 && z < -100) {
            const mtnWeight = Math.min(1.0, (x - 150) / 300) * Math.min(1.0, (-100 - z) / 250);
            baseHeight += Math.sin(x * 0.01) * 35.0 * mtnWeight + 25.0 * mtnWeight;
        }

        if (x < -200 && z > 150) {
            const oceanDist = Math.hypot(x - (-600), z - 600);
            if (oceanDist < 500) {
                baseHeight -= (500 - oceanDist) * 0.08;
            }
        }

        const roadInfo = this.getDistanceToRoad(x, z);
        if (roadInfo.distance < this.roadWidth * 2.2) {
            const blend = Math.max(0, (roadInfo.distance - this.roadWidth) / (this.roadWidth * 1.2));
            baseHeight = baseHeight * (0.25 + 0.75 * blend);
        }

        return baseHeight;
    }

    getSurfaceType(x, z) {
        const height = this.getHeight(x, z);
        if (height < this.waterHeight) return 'water';

        const roadInfo = this.getDistanceToRoad(x, z);
        if (roadInfo.distance <= this.roadWidth) {
            return 'road';
        } else if (roadInfo.distance <= this.roadWidth * 1.5) {
            return 'road_shoulder';
        }
        return 'grass';
    }

    getNormal(x, z) {
        const delta = 1.0;
        const hl = this.getHeight(x - delta, z);
        const hr = this.getHeight(x + delta, z);
        const hd = this.getHeight(x, z - delta);
        const hu = this.getHeight(x, z + delta);

        const normal = new THREE.Vector3(hl - hr, 2.0 * delta, hd - hu);
        return normal.normalize();
    }

    createTerrainMesh() {
        const geo = new THREE.PlaneGeometry(this.worldSize, this.worldSize, this.segments, this.segments);
        geo.rotateX(-Math.PI / 2);

        const pos = geo.attributes.position;
        const colors = [];

        // Colors carefully balanced to blend with the realistic grass texture
        const cGrassLush = new THREE.Color(0xffffff);  // Full procedural grass colors
        const cGrassWarm = new THREE.Color(0xd0eed0);  // Deep dark green meadow radiance
        const cGravelRoad = new THREE.Color(0x6b6e76); // Dark crushed stone road
        const cSand = new THREE.Color(0xd2b785);       // Coastal sand
        const cCliffRock = new THREE.Color(0x484642);   // Stratified dark cliff rock

        for (let i = 0; i < pos.count; i++) {
            const vx = pos.getX(i);
            const vz = pos.getZ(i);
            const vy = this.getHeight(vx, vz);
            pos.setY(i, vy);

            // Compute local slope angle from height gradients
            const norm = this.getNormal(vx, vz);
            const slope = 1.0 - norm.y; // 0 = flat, 1 = vertical cliff

            const roadInfo = this.getDistanceToRoad(vx, vz);
            const dist = roadInfo.distance;

            let col = new THREE.Color();
            if (dist <= this.roadWidth) {
                // Asphalt & gravel roadway
                col.copy(cGravelRoad);
            } else if (dist <= this.roadWidth + 3.5) {
                // Gravel shoulder blend into grass
                const t = (dist - this.roadWidth) / 3.5;
                col.copy(cGravelRoad).lerp(cGrassLush, t);
            } else if (vy < this.waterHeight + 2.5) {
                // Shoreline beach sand
                col.copy(cSand);
            } else if (slope > 0.35) {
                // Steep mountain slopes & cliffs
                const t = Math.min(1.0, (slope - 0.35) / 0.35);
                col.copy(cGrassLush).lerp(cCliffRock, t);
            } else if (vy > 30.0) {
                // High mountain peak rock
                const t = Math.min(1.0, (vy - 30.0) / 25.0);
                col.copy(cGrassLush).lerp(cCliffRock, t);
            } else {
                // Rolling meadow with subtle organic warmth
                const noise = Math.sin(vx * 0.05) * Math.cos(vz * 0.05);
                col.copy(cGrassLush).lerp(cGrassWarm, Math.max(0, noise * 0.25));
            }

            colors.push(col.r, col.g, col.b);
        }

        geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        geo.computeVertexNormals();

        // Realistic grass texture and normal map matching the reference photo
        const tg = window.textureGenerator;
        const grassTex = tg ? tg.createGrassTexture(1024) : null;
        const grassNormal = tg ? tg.createGrassNormalMap(1024) : null;
        if (grassTex) {
            grassTex.wrapS = THREE.RepeatWrapping;
            grassTex.wrapT = THREE.RepeatWrapping;
            grassTex.repeat.set(120, 120);
        }
        if (grassNormal) {
            grassNormal.wrapS = THREE.RepeatWrapping;
            grassNormal.wrapT = THREE.RepeatWrapping;
            grassNormal.repeat.set(120, 120);
        }

        const mat = new THREE.MeshStandardMaterial({
            map: grassTex,
            normalMap: grassNormal,
            normalScale: new THREE.Vector2(0.65, 0.65),
            vertexColors: true,
            roughness: 0.88,
            metalness: 0.02,
            flatShading: false
        });

        this.mesh = new THREE.Mesh(geo, mat);
        this.mesh.receiveShadow = true;
        return this.mesh;
    }

    createWaterMesh() {
        const waterGeo = new THREE.PlaneGeometry(this.worldSize, this.worldSize, 64, 64);
        waterGeo.rotateX(-Math.PI / 2);

        const tg = window.textureGenerator;
        this.waterNormalMap = tg ? tg.createWaterNormalMap(512) : null;
        const skyTex = tg ? tg.createSkyTexture() : null;

        // Photorealistic Ocean Material with Animated Normal Waves, Depth Tint & Sky Fresnel
        this.waterMat = new THREE.MeshStandardMaterial({
            color: 0x12587a,
            roughness: 0.08,
            metalness: 0.82,
            normalMap: this.waterNormalMap,
            normalScale: new THREE.Vector2(0.85, 0.85),
            envMap: skyTex,
            transparent: true,
            opacity: 0.86
        });

        this.waterMesh = new THREE.Mesh(waterGeo, this.waterMat);
        this.waterMesh.position.y = this.waterHeight;
        this.waterMesh.receiveShadow = true;
        return this.waterMesh;
    }

    // High-Resolution 3D Asphalt Highway Ribbons with Yellow Center Lines
    createRoadRibbonMesh() {
        const tg = window.textureGenerator;
        const asphaltTex = tg ? tg.createAsphaltRoadTexture(512, 512) : null;

        const roadMat = new THREE.MeshStandardMaterial({
            map: asphaltTex,
            roughness: 0.75,
            metalness: 0.15,
            polygonOffset: true,
            polygonOffsetFactor: -1.0,
            polygonOffsetUnits: -1.0
        });

        const group = new THREE.Group();

        for (const road of this.roads) {
            const numSegments = road.length - 1;
            for (let i = 0; i < numSegments; i++) {
                const p1 = road[i];
                const p2 = road[i + 1];

                const dx = p2.x - p1.x;
                const dz = p2.z - p1.z;
                const len = Math.hypot(dx, dz);
                if (len < 0.1) continue;

                const angle = Math.atan2(dx, dz);
                const steps = Math.max(4, Math.ceil(len / 18));
                const segLen = len / steps;

                for (let s = 0; s < steps; s++) {
                    const t1 = s / steps;
                    const t2 = (s + 1) / steps;

                    const sx = p1.x + dx * ((t1 + t2) * 0.5);
                    const sz = p1.z + dz * ((t1 + t2) * 0.5);
                    const sy = this.getHeight(sx, sz) + 0.06; // Rests snugly on top of terrain

                    const segGeo = new THREE.PlaneGeometry(this.roadWidth * 0.95, segLen + 0.2);
                    segGeo.rotateX(-Math.PI / 2);
                    segGeo.rotateY(angle);

                    // Check slope pitch between p1 and p2
                    const y1 = this.getHeight(p1.x + dx * t1, p1.z + dz * t1);
                    const y2 = this.getHeight(p1.x + dx * t2, p1.z + dz * t2);
                    const pitch = Math.atan2(y2 - y1, segLen);
                    segGeo.rotateZ(pitch);

                    const roadSeg = new THREE.Mesh(segGeo, roadMat);
                    roadSeg.position.set(sx, sy, sz);
                    roadSeg.receiveShadow = true;
                    group.add(roadSeg);
                }
            }
        }

        return group;
    }

    update(dt) {
        // Animate realistic ocean wave ripples across water surface
        if (this.waterNormalMap) {
            this.waterNormalMap.offset.x = (this.waterNormalMap.offset.x + dt * 0.02) % 1.0;
            this.waterNormalMap.offset.y = (this.waterNormalMap.offset.y + dt * 0.035) % 1.0;
        }
    }
}

window.terrainManager = new TerrainManager();
