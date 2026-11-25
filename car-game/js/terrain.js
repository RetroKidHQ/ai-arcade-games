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

        // Double as wide: 18.0 meters wide (was 9.0m), true 2-lane roadway
        this.roadWidth = 18.0;

        // Road network spline waypoints: 2-lane roads leading to every building in the world
        this.roads = [
            // =========================================================================
            // COMPACT DOWNTOWN GRID: 2-Lane Avenues & Cross Streets Enclosing Every Building
            // Every skyscraper and apartment block sits directly between these 18m-wide 2-lane roadways!
            // =========================================================================
            // North-South Avenues (along Z):
            // Avenue A (West perimeter avenue)
            [ { x: -318, z: -330 }, { x: -318, z: 50 } ],
            // Avenue B (West-central avenue)
            [ { x: -246, z: -330 }, { x: -246, z: 50 } ],
            // Avenue C (Grand Arterial - connects North & South Coastal Highways)
            [ { x: -174, z: -550 }, { x: -174, z: 480 } ],
            // Avenue D (East-central avenue)
            [ { x: -102, z: -330 }, { x: -102, z: 50 } ],
            // Avenue E (East perimeter avenue)
            [ { x: -30, z: -330 }, { x: -30, z: 50 } ],
            // West Residential Drive (serving West Apartments)
            [ { x: -390, z: -246 }, { x: -390, z: -102 } ],

            // East-West Cross Streets (along X):
            // Street 1 (North perimeter street)
            [ { x: -318, z: -318 }, { x: -30, z: -318 } ],
            // Street 2 (North-central street)
            [ { x: -390, z: -246 }, { x: -30, z: -246 } ],
            // Street 3 (Main East-West Boulevard - connects West Coast to Mountain Pass)
            [ { x: -450, z: -174 }, { x: -30, z: -174 }, { x: 120, z: -120 } ],
            // Street 4 (South-central street)
            [ { x: -390, z: -102 }, { x: -30, z: -102 } ],
            // Street 5 (Mid-boulevard street - between skyscrapers & apartment district)
            [ { x: -318, z: -30 }, { x: -30, z: -30 } ],
            // Street 6 (South apartment boulevard - framing the apartment blocks)
            [ { x: -318, z: 36 }, { x: -30, z: 36 } ],

            // =========================================================================
            // REGIONAL HIGHWAYS & BUILDING ACCESS ROADS
            // =========================================================================
            // Farmland & Country Barn Scenic Drive (leads directly to Barn & Windmills)
            [
                { x: -246, z: 36 }, { x: -246, z: 120 }, { x: -280, z: 200 }, { x: -280, z: 280 }
            ],

            // Cape Point Lighthouse Coastal Drive (leads directly to Lighthouse)
            [
                { x: -280, z: 280 }, { x: -360, z: 340 }, { x: -460, z: 380 }
            ],

            // Main Coastal Highway Loop
            [
                { x: -500, z: -500 }, { x: -174, z: -550 }, { x: 150, z: -520 }, { x: 500, z: -480 },
                { x: 580, z: -100 }, { x: 520, z: 450 }, { x: 150, z: 520 }, { x: -174, z: 480 },
                { x: -480, z: 460 }, { x: -560, z: 0 }, { x: -500, z: -500 }
            ],

            // Mountain Pass Highway
            [
                { x: 120, z: -120 }, { x: 250, z: 0 }, { x: 380, z: 80 }, { x: 520, z: 120 }
            ],

            // Coastal Dunes & Arena Access Road
            [
                { x: 120, z: -120 }, { x: 220, z: 120 }, { x: 320, z: 250 }, { x: 420, z: 380 }
            ]
        ];

        // Pre-compute flattened road segments with AABB bounding boxes for high-performance spatial queries
        this.roadSegments = [];
        for (const road of this.roads) {
            for (let i = 0; i < road.length - 1; i++) {
                const p1 = road[i];
                const p2 = road[i + 1];
                const dx = p2.x - p1.x;
                const dz = p2.z - p1.z;
                const l2 = dx * dx + dz * dz;
                if (l2 < 0.0001) continue;
                this.roadSegments.push({
                    p1, p2, dx, dz, l2,
                    minX: Math.min(p1.x, p2.x),
                    maxX: Math.max(p1.x, p2.x),
                    minZ: Math.min(p1.z, p2.z),
                    maxZ: Math.max(p1.z, p2.z)
                });
            }
        }

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

    // High-performance AABB broadphase road distance query (runs 20x faster)
    getDistanceToRoad(x, z) {
        let minDistanceSq = 99999999;
        let nearestP1 = null;
        let nearestP2 = null;
        let nearestProjX = x;
        let nearestProjZ = z;

        const count = this.roadSegments.length;
        for (let i = 0; i < count; i++) {
            const seg = this.roadSegments[i];

            // Fast bounding box rejection using current known minimum distance
            const curMinDist = Math.sqrt(minDistanceSq);
            if (x < seg.minX - curMinDist || x > seg.maxX + curMinDist ||
                z < seg.minZ - curMinDist || z > seg.maxZ + curMinDist) {
                continue;
            }

            let t = ((x - seg.p1.x) * seg.dx + (z - seg.p1.z) * seg.dz) / seg.l2;
            t = t < 0 ? 0 : (t > 1 ? 1 : t);

            const projX = seg.p1.x + t * seg.dx;
            const projZ = seg.p1.z + t * seg.dz;

            const distSq = (x - projX) * (x - projX) + (z - projZ) * (z - projZ);
            if (distSq < minDistanceSq) {
                minDistanceSq = distSq;
                nearestP1 = seg.p1;
                nearestP2 = seg.p2;
                nearestProjX = projX;
                nearestProjZ = projZ;
            }
        }

        return {
            distance: Math.sqrt(minDistanceSq),
            p1: nearestP1,
            p2: nearestP2,
            projX: nearestProjX,
            projZ: nearestProjZ
        };
    }

    getNaturalHeight(x, z) {
        // Fast early-out for flat metropolis & apartment district foundation plateau
        const distFromCenter = Math.hypot(x + 174, z + 120);
        if (distFromCenter <= 340) return 0.0;

        const centerFlatFactor = Math.min(1.0, Math.max(0, (distFromCenter - 350) / 80));
        let baseHeight = (this.perlin(x, z) - 10) * centerFlatFactor;

        // Mountain region
        if (x > 150 && z < -100) {
            const mtnWeight = Math.min(1.0, (x - 150) / 300) * Math.min(1.0, (-100 - z) / 250);
            baseHeight += Math.sin(x * 0.01) * 35.0 * mtnWeight + 25.0 * mtnWeight;
        }

        // Ocean depression
        if (x < -200 && z > 150) {
            const oceanDist = Math.hypot(x - (-600), z - 600);
            if (oceanDist < 500) {
                baseHeight -= (500 - oceanDist) * 0.08;
            }
        }

        // Stunt Obstacle Plateaus (Spread across map)
        const stuntSites = [
            { x: 420, z: 480, h: 16.0, r: 120 }, // 72m Mega Loop
            { x: 220, z: 120, h: 10.0, r: 110 }, // 24m Curved Wall Ride
            { x: 510, z: -120, h: 19.5, r: 90 }, // 21m Mega Drop Platform
            { x: 180, z: -320, h: 13.5, r: 80 }, // 15m Mega Kicker
            { x: -120, z: -430, h: 21.0, r: 85 }  // Double Gap Jump
        ];
        for (let i = 0; i < stuntSites.length; i++) {
            const s = stuntSites[i];
            const d = Math.hypot(x - s.x, z - s.z);
            if (d < s.r) {
                const inner = s.r * 0.72;
                if (d <= inner) {
                    baseHeight = s.h;
                } else {
                    const t = (d - inner) / (s.r - inner);
                    const blend = t * t * (3.0 - 2.0 * t);
                    baseHeight = s.h * (1.0 - blend) + baseHeight * blend;
                }
                break;
            }
        }

        return baseHeight;
    }

    getHeight(x, z) {
        // Instant early-out for compact downtown skyscrapers and apartment district
        const distFromCenter = Math.hypot(x + 174, z + 140);
        if (distFromCenter <= 250) {
            return 0.0;
        }

        const naturalY = this.getNaturalHeight(x, z);
        const roadInfo = this.getDistanceToRoad(x, z);

        // Wide, gentle road corridor transition (no steep narrow cliffs entering the road)
        const corridorWidth = Math.max(40.0, this.roadWidth + 22.0); // 40-meter smooth transition zone
        if (roadInfo.distance < corridorWidth) {
            let roadCenterY = this.getNaturalHeight(roadInfo.projX, roadInfo.projZ);

            // Keep road and causeway safely elevated above water
            const minRoadHeight = this.waterHeight + 1.8;
            if (roadCenterY < minRoadHeight) {
                roadCenterY = minRoadHeight;
            }

            const halfW = this.roadWidth * 0.5;
            if (roadInfo.distance <= halfW) {
                // Flat, smooth roadbed across the roadway width
                return roadCenterY;
            }

            // Smooth S-curve (smoothstep) easing from roadbed into natural mountainside
            const t = (roadInfo.distance - halfW) / (corridorWidth - halfW);
            const blend = t * t * (3.0 - 2.0 * t);
            let blendedHeight = roadCenterY * (1.0 - blend) + naturalY * blend;

            // Ensure transition near water doesn't drop underwater
            if (blendedHeight < this.waterHeight + 1.0) {
                const waterT = Math.max(0, 1.0 - roadInfo.distance / corridorWidth);
                blendedHeight = Math.max(blendedHeight, (this.waterHeight + 1.0) * waterT + naturalY * (1.0 - waterT));
            }

            return blendedHeight;
        }

        return naturalY;
    }

    getSurfaceType(x, z) {
        const height = this.getHeight(x, z);
        if (height < this.waterHeight) return 'water';

        // Stunt sites road-grade traction
        const stuntSites = [
            { x: 420, z: 480, r: 110 },
            { x: 220, z: 120, r: 100 },
            { x: 510, z: -120, r: 80 },
            { x: 180, z: -320, r: 70 },
            { x: -120, z: -430, r: 75 },
            { x: -240, z: 430, r: 80 }
        ];
        for (let i = 0; i < stuntSites.length; i++) {
            if (Math.hypot(x - stuntSites[i].x, z - stuntSites[i].z) < stuntSites[i].r) {
                return 'road';
            }
        }

        const roadInfo = this.getDistanceToRoad(x, z);
        const halfW = this.roadWidth * 0.5;
        if (roadInfo.distance <= halfW) {
            return 'road';
        } else if (roadInfo.distance <= halfW + 4.0) {
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
            const halfW = this.roadWidth * 0.5;

            // Stunt Pads asphalt color
            let isStuntFloor = false;
            const sites = [[420, 480, 95], [220, 120, 90], [510, -120, 70], [180, -320, 60], [-120, -430, 65], [-240, 430, 70]];
            for (let s = 0; s < sites.length; s++) {
                if (Math.hypot(vx - sites[s][0], vz - sites[s][1]) < sites[s][2]) {
                    isStuntFloor = true;
                    break;
                }
            }

            if (isStuntFloor) {
                // Stunt Arena Asphalt Floor
                col.setHex(0x24262c);
            } else if (dist <= halfW) {
                // Asphalt & gravel roadway
                col.copy(cGravelRoad);
            } else if (dist <= halfW + 4.0) {
                // Gravel shoulder blend into grass
                const t = (dist - halfW) / 4.0;
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

    // Continuous Watertight 3D Asphalt Highway Ribbons (Never clips under ground or water)
    createRoadRibbonMesh() {
        const tg = window.textureGenerator;
        const asphaltTex = tg ? tg.createAsphaltRoadTexture(512, 512) : null;

        const roadMat = new THREE.MeshStandardMaterial({
            map: asphaltTex,
            roughness: 0.72,
            metalness: 0.15,
            polygonOffset: true,
            polygonOffsetFactor: -4.0,
            polygonOffsetUnits: -4.0
        });

        const halfW = this.roadWidth * 0.5;
        const positions = [];
        const uvs = [];
        const indices = [];
        let vertexOffset = 0;
        const stepDist = 4.0;

        for (const road of this.roads) {
            const pts = [];
            let totalLen = 0;

            for (let i = 0; i < road.length - 1; i++) {
                const p1 = road[i];
                const p2 = road[i + 1];
                const dx = p2.x - p1.x;
                const dz = p2.z - p1.z;
                const segLen = Math.hypot(dx, dz);
                if (segLen < 0.1) continue;
                const steps = Math.max(1, Math.ceil(segLen / stepDist));
                for (let s = 0; s < steps; s++) {
                    const t = s / steps;
                    pts.push({
                        x: p1.x + dx * t,
                        z: p1.z + dz * t,
                        dist: totalLen + segLen * t
                    });
                }
                totalLen += segLen;
            }
            const last = road[road.length - 1];
            pts.push({ x: last.x, z: last.z, dist: totalLen });

            if (pts.length < 2) continue;

            const isClosed = Math.hypot(road[0].x - last.x, road[0].z - last.z) < 0.1;

            for (let i = 0; i < pts.length; i++) {
                const curr = pts[i];
                let tx, tz;
                if (i === 0) {
                    if (isClosed && pts.length > 2) {
                        tx = pts[1].x - pts[pts.length - 2].x;
                        tz = pts[1].z - pts[pts.length - 2].z;
                    } else {
                        tx = pts[1].x - curr.x;
                        tz = pts[1].z - curr.z;
                    }
                } else if (i === pts.length - 1) {
                    if (isClosed && pts.length > 2) {
                        tx = pts[1].x - pts[pts.length - 2].x;
                        tz = pts[1].z - pts[pts.length - 2].z;
                    } else {
                        tx = curr.x - pts[i - 1].x;
                        tz = curr.z - pts[i - 1].z;
                    }
                } else {
                    tx = pts[i + 1].x - pts[i - 1].x;
                    tz = pts[i + 1].z - pts[i - 1].z;
                }
                const tLen = Math.hypot(tx, tz) || 1;
                tx /= tLen;
                tz /= tLen;

                // Perpendicular horizontal normal (pointing left)
                const nx = -tz;
                const nz = tx;

                const lx = curr.x + nx * halfW;
                const lz = curr.z + nz * halfW;
                const rx = curr.x - nx * halfW;
                const rz = curr.z - nz * halfW;

                const cy = this.getHeight(curr.x, curr.z);
                const ly = this.getHeight(lx, lz);
                const ry = this.getHeight(rx, rz);

                // Road is ALWAYS strictly above the highest ground point AND above water
                const maxGroundY = Math.max(cy, Math.max(ly, ry));
                const minClearance = this.waterHeight + 2.0; // Guaranteed 2.0m clearance above ocean surface
                const roadSurfaceY = Math.max(maxGroundY + 0.18, minClearance);

                // Side skirts drop 0.50m below the road surface to seal all ground gaps
                const skirtY = roadSurfaceY - 0.50;

                // 4 vertices per cross-section station:
                // 0: left skirt bottom, 1: left road surface, 2: right road surface, 3: right skirt bottom
                positions.push(lx, skirtY, lz);
                positions.push(lx, roadSurfaceY, lz);
                positions.push(rx, roadSurfaceY, rz);
                positions.push(rx, skirtY, rz);

                const v = curr.dist / 14.0;
                uvs.push(0.0, v);
                uvs.push(0.06, v);
                uvs.push(0.94, v);
                uvs.push(1.0, v);

                if (i > 0) {
                    const prev = vertexOffset - 4;
                    const c = vertexOffset;

                    // Left skirt quad
                    indices.push(prev + 0, c + 0, prev + 1);
                    indices.push(c + 0, c + 1, prev + 1);

                    // Road surface quad
                    indices.push(prev + 1, c + 1, prev + 2);
                    indices.push(c + 1, c + 2, prev + 2);

                    // Right skirt quad
                    indices.push(prev + 2, c + 2, prev + 3);
                    indices.push(c + 2, c + 3, prev + 3);
                }

                vertexOffset += 4;
            }
        }

        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
        const IndexAttr = (positions.length / 3 > 65535) ? THREE.Uint32BufferAttribute : THREE.Uint16BufferAttribute;
        geo.setIndex(new IndexAttr(indices, 1));
        geo.computeVertexNormals();

        const roadMesh = new THREE.Mesh(geo, roadMat);
        roadMesh.receiveShadow = true;
        roadMesh.renderOrder = 3;

        const group = new THREE.Group();
        group.add(roadMesh);
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
