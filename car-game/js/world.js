/**
 * Open World Environment Builder with Photorealistic Australian Eucalyptus & Gum Trees
 * Multi-branching trunks with peeling gum bark, lush leaf clusters with alpha mask, and road props.
 */
class WorldManager {
    constructor(scene, terrain) {
        this.scene = scene;
        this.terrain = terrain;
        this.colliders = [];
        this.ramps = [];
        this.animatedProps = [];
        this.streetLights = [];
        this.destructibles = [];
    }

    buildAll() {
        this.buildCity();
        this.buildStuntPark();
        this.buildFarmland();
        this.buildLighthouse();
        this.buildRealisticBushland();
        this.buildRoadProps();
    }

    // 1. Downtown City Zone
    buildCity() {
        const cityX = -120;
        const cityZ = -120;
        const buildingColors = [0x424651, 0x58606d, 0x6e7888, 0x3a3f4a, 0x2d313b, 0x4a5b6c];
        const gridRows = 4;
        const gridCols = 4;
        const blockSize = 32;

        for (let r = 0; r < gridRows; r++) {
            for (let c = 0; c < gridCols; c++) {
                if (r === 1 && c === 1) continue;

                const bx = cityX + (c - gridCols / 2) * blockSize;
                const bz = cityZ + (r - gridRows / 2) * blockSize;
                const by = this.terrain.getHeight(bx, bz);

                const width = 16 + Math.random() * 8;
                const depth = 16 + Math.random() * 8;
                const height = 24 + Math.random() * 45;

                const bGeo = new THREE.BoxGeometry(width, height, depth);
                const col = buildingColors[Math.floor(Math.random() * buildingColors.length)];
                const bMat = new THREE.MeshStandardMaterial({ color: col, roughness: 0.7, metalness: 0.2 });

                const building = new THREE.Mesh(bGeo, bMat);
                building.position.set(bx, by + height / 2, bz);
                building.castShadow = true;
                building.receiveShadow = true;
                this.scene.add(building);

                const winGeo = new THREE.PlaneGeometry(width * 0.85, height * 0.75);
                const winMat = new THREE.MeshBasicMaterial({ color: 0xffe899, transparent: true, opacity: 0.35 });
                const win1 = new THREE.Mesh(winGeo, winMat);
                win1.position.set(0, 0, depth / 2 + 0.1);
                building.add(win1);

                const win2 = win1.clone();
                win2.rotation.y = Math.PI;
                win2.position.set(0, 0, -depth / 2 - 0.1);
                building.add(win2);

                this.colliders.push({
                    type: 'box',
                    minX: bx - width / 2,
                    maxX: bx + width / 2,
                    minZ: bz - depth / 2,
                    maxZ: bz + depth / 2,
                    y: by,
                    height: height
                });
            }
        }
    }

    // 2. Stunt Park
    buildStuntPark() {
        const stuntX = 300;
        const stuntZ = 300;
        const baseY = this.terrain.getHeight(stuntX, stuntZ);

        const courtGeo = new THREE.CylinderGeometry(85, 85, 1, 32);
        const courtMat = new THREE.MeshStandardMaterial({ color: 0x1d1e22, roughness: 0.8 });
        const court = new THREE.Mesh(courtGeo, courtMat);
        court.position.set(stuntX, baseY - 0.4, stuntZ);
        this.scene.add(court);

        this.createRamp(stuntX - 35, baseY, stuntZ, 14, 28, 8.5, 0);
        this.createRamp(stuntX + 35, baseY, stuntZ, 16, 32, 12.0, Math.PI);

        const ringGeo = new THREE.TorusGeometry(7, 0.8, 16, 32);
        const ringMat = new THREE.MeshStandardMaterial({ color: 0x00ffcc, emissive: 0x00b894, emissiveIntensity: 0.6 });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.position.set(stuntX - 35, baseY + 18, stuntZ + 35);
        this.scene.add(ring);

        this.createSpeedTrap(stuntX, baseY, stuntZ + 55);
    }

    createRamp(x, y, z, width, length, height, rotationY) {
        const rampShape = new THREE.Shape();
        rampShape.moveTo(0, 0);
        rampShape.lineTo(length, height);
        rampShape.lineTo(length, 0);
        rampShape.closePath();

        const extrudeSettings = { depth: width, bevelEnabled: false };
        const geo = new THREE.ExtrudeGeometry(rampShape, extrudeSettings);
        geo.center();

        const mat = new THREE.MeshStandardMaterial({ color: 0xd35400, roughness: 0.5, metalness: 0.2 });
        const rampMesh = new THREE.Mesh(geo, mat);
        rampMesh.position.set(x, y + height / 2, z);
        rampMesh.rotation.y = rotationY;
        rampMesh.castShadow = true;
        rampMesh.receiveShadow = true;
        this.scene.add(rampMesh);

        this.ramps.push({ x, z, width, length, height, rotation: rotationY, mesh: rampMesh });
    }

    createSpeedTrap(x, y, z) {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 6), new THREE.MeshStandardMaterial({ color: 0x888888 }));
        post.position.set(x - 6, y + 3, z);
        this.scene.add(post);

        const camBox = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.2, 1.2), new THREE.MeshStandardMaterial({ color: 0xffdd00 }));
        camBox.position.set(x - 6, y + 5.5, z);
        this.scene.add(camBox);

        const flashLight = new THREE.PointLight(0xffffff, 0, 30);
        flashLight.position.set(x - 6, y + 6, z);
        this.scene.add(flashLight);

        this.speedTrap = { x, z, radius: 12, flashLight, flashTimer: 0 };
    }

    // 3. Farmland
    buildFarmland() {
        const farmX = -320;
        const farmZ = 240;

        const turbineCoords = [
            { x: farmX - 90, z: farmZ - 60 },
            { x: farmX, z: farmZ - 100 },
            { x: farmX + 90, z: farmZ - 80 }
        ];

        for (const pos of turbineCoords) {
            const ty = this.terrain.getHeight(pos.x, pos.z);
            const tower = new THREE.Mesh(
                new THREE.CylinderGeometry(1.2, 2.5, 48, 16),
                new THREE.MeshStandardMaterial({ color: 0xeeeeee, roughness: 0.4 })
            );
            tower.position.set(pos.x, ty + 24, pos.z);
            tower.castShadow = true;
            this.scene.add(tower);

            const hub = new THREE.Mesh(new THREE.SphereGeometry(1.8, 16, 16), new THREE.MeshStandardMaterial({ color: 0xdddddd }));
            hub.position.set(pos.x, ty + 48, pos.z);
            this.scene.add(hub);

            const bladesGroup = new THREE.Group();
            for (let b = 0; b < 3; b++) {
                const blade = new THREE.Mesh(new THREE.BoxGeometry(0.8, 22, 0.2), new THREE.MeshStandardMaterial({ color: 0xffffff }));
                blade.position.y = 11;
                const pivot = new THREE.Group();
                pivot.rotation.z = (b * Math.PI * 2) / 3;
                pivot.add(blade);
                bladesGroup.add(pivot);
            }
            hub.add(bladesGroup);

            this.animatedProps.push({ type: 'windmill', mesh: bladesGroup, speed: 0.015 + Math.random() * 0.01 });
            this.colliders.push({ type: 'cylinder', x: pos.x, z: pos.z, radius: 2.5 });
        }

        // Rustic Red Country Barn
        const barnY = this.terrain.getHeight(farmX + 40, farmZ + 40);
        const barn = new THREE.Mesh(new THREE.BoxGeometry(20, 12, 14), new THREE.MeshStandardMaterial({ color: 0x962d2d, roughness: 0.8 }));
        barn.position.set(farmX + 40, barnY + 6, farmZ + 40);
        barn.castShadow = true;
        barn.receiveShadow = true;
        this.scene.add(barn);

        const roof = new THREE.Mesh(new THREE.ConeGeometry(13, 6, 4), new THREE.MeshStandardMaterial({ color: 0x3d3d3d }));
        roof.rotation.y = Math.PI / 4;
        roof.position.set(farmX + 40, barnY + 15, farmZ + 40);
        this.scene.add(roof);

        this.colliders.push({
            type: 'box',
            minX: farmX + 40 - 10,
            maxX: farmX + 40 + 10,
            minZ: farmZ + 40 - 7,
            maxZ: farmZ + 40 + 7
        });

        // Hay bales
        for (let i = 0; i < 18; i++) {
            const hx = farmX + (Math.random() - 0.5) * 80;
            const hz = farmZ + (Math.random() - 0.5) * 80;
            const hy = this.terrain.getHeight(hx, hz);

            const hayGeo = new THREE.CylinderGeometry(1.4, 1.4, 2.2, 12);
            hayGeo.rotateZ(Math.PI / 2);
            const hay = new THREE.Mesh(hayGeo, new THREE.MeshStandardMaterial({ color: 0xd4a037, roughness: 0.95 }));
            hay.position.set(hx, hy + 1.1, hz);
            hay.rotation.y = Math.random() * Math.PI;
            hay.castShadow = true;
            this.scene.add(hay);

            this.destructibles.push({ mesh: hay, x: hx, y: hy + 1.1, z: hz, vx: 0, vz: 0, radius: 1.5 });
        }
    }

    // 4. Coastal Lighthouse
    buildLighthouse() {
        const lx = -460;
        const lz = 380;
        const ly = this.terrain.getHeight(lx, lz);

        const tower = new THREE.Mesh(
            new THREE.CylinderGeometry(3.5, 5.5, 30, 16),
            new THREE.MeshStandardMaterial({ color: 0xf5f6fa, roughness: 0.6 })
        );
        tower.position.set(lx, ly + 15, lz);
        tower.castShadow = true;
        this.scene.add(tower);

        const stripe = new THREE.Mesh(new THREE.CylinderGeometry(4.2, 4.8, 5, 16), new THREE.MeshStandardMaterial({ color: 0xc0392b }));
        stripe.position.set(lx, ly + 15, lz);
        this.scene.add(stripe);

        const beaconGroup = new THREE.Group();
        beaconGroup.position.set(lx, ly + 32, lz);

        const beaconLight = new THREE.SpotLight(0xfff0aa, 3, 220, Math.PI / 8, 0.4);
        beaconLight.position.set(0, 0, 0);
        beaconLight.target.position.set(50, 0, 0);
        beaconGroup.add(beaconLight);
        beaconGroup.add(beaconLight.target);
        this.scene.add(beaconGroup);

        this.animatedProps.push({ type: 'lighthouse', mesh: beaconGroup, speed: 0.02 });
        this.colliders.push({ type: 'cylinder', x: lx, z: lz, radius: 5.5 });
    }

    // 5. Realistic Australian Eucalyptus / Gum Trees from the photo!
    buildRealisticBushland() {
        const tg = window.textureGenerator;
        const barkTex = tg ? tg.createBarkTexture(512) : null;
        const leafTex = tg ? tg.createLeafClusterTexture(512) : null;

        // Photorealistic mottled gum bark material
        const trunkMat = new THREE.MeshStandardMaterial({
            map: barkTex,
            roughness: 0.85,
            metalness: 0.05
        });

        // Photorealistic leaf cluster material with alpha mask
        const leafMat = new THREE.MeshStandardMaterial({
            map: leafTex,
            transparent: true,
            alphaTest: 0.15,
            roughness: 0.6,
            side: THREE.DoubleSide
        });

        // Pre-create 3 distinct realistic eucalyptus tree model archetypes
        const treeTemplates = [
            this.createEucalyptusTreeModel(trunkMat, leafMat, 1.0),
            this.createEucalyptusTreeModel(trunkMat, leafMat, 1.3),
            this.createBushyTreeModel(trunkMat, leafMat, 0.9)
        ];

        const treeCount = 280;
        for (let i = 0; i < treeCount; i++) {
            const tx = (Math.random() - 0.5) * (this.terrain.worldSize - 80);
            const tz = (Math.random() - 0.5) * (this.terrain.worldSize - 80);
            const ty = this.terrain.getHeight(tx, tz);

            if (ty < this.terrain.waterHeight + 1.5) continue;
            if (this.terrain.getDistanceToRoad(tx, tz).distance < 14) continue;
            if (Math.hypot(tx + 120, tz + 120) < 110) continue; // City
            if (Math.hypot(tx - 300, tz - 300) < 95) continue;  // Stunt park

            const template = treeTemplates[Math.floor(Math.random() * treeTemplates.length)];
            const treeMesh = template.clone();

            const scale = 0.85 + Math.random() * 0.45;
            treeMesh.scale.set(scale, scale, scale);
            treeMesh.position.set(tx, ty, tz);
            treeMesh.rotation.y = Math.random() * Math.PI * 2;
            treeMesh.castShadow = true;
            this.scene.add(treeMesh);

            this.colliders.push({
                type: 'cylinder',
                x: tx,
                z: tz,
                radius: 1.2 * scale
            });
        }

        // Add 3D Roadside Grass Tufts along the gravel road edges
        this.buildRoadsideGrassTufts(leafMat);

        // Scatter realistic boulders
        const rockGeo = new THREE.DodecahedronGeometry(2.2, 1);
        const rockMat = new THREE.MeshStandardMaterial({ color: 0x6d7075, roughness: 0.95 });
        const rockMesh = new THREE.InstancedMesh(rockGeo, rockMat, 120);
        rockMesh.castShadow = true;
        const dummy = new THREE.Object3D();

        for (let r = 0; r < 120; r++) {
            const rx = (Math.random() - 0.5) * (this.terrain.worldSize - 100);
            const rz = (Math.random() - 0.5) * (this.terrain.worldSize - 100);
            const ry = this.terrain.getHeight(rx, rz);
            if (this.terrain.getDistanceToRoad(rx, rz).distance < 12) continue;

            const rScale = 0.8 + Math.random() * 1.5;
            dummy.position.set(rx, ry + rScale * 0.8, rz);
            dummy.scale.set(rScale, rScale * (0.6 + Math.random() * 0.4), rScale);
            dummy.rotation.set(Math.random(), Math.random(), Math.random());
            dummy.updateMatrix();
            rockMesh.setMatrixAt(r, dummy.matrix);

            this.colliders.push({ type: 'cylinder', x: rx, z: rz, radius: 1.6 * rScale });
        }
        this.scene.add(rockMesh);
    }

    // Realistic Australian Eucalyptus Tree: slender pale trunk dividing into graceful organic branches
    createEucalyptusTreeModel(trunkMat, leafMat, scale = 1.0) {
        const tree = new THREE.Group();

        // Main trunk (slender & tall, authentic to the photo)
        const trunkGeo = new THREE.CylinderGeometry(0.38 * scale, 0.65 * scale, 14 * scale, 10);
        const trunk = new THREE.Mesh(trunkGeo, trunkMat);
        trunk.position.y = 7 * scale;
        trunk.castShadow = true;
        tree.add(trunk);

        // 4 Multi-branching limbs reaching upwards
        const branchAngles = [0, 1.6, 3.14, 4.7];
        for (const angle of branchAngles) {
            const branchGeo = new THREE.CylinderGeometry(0.18 * scale, 0.3 * scale, 7.5 * scale, 8);
            const branch = new THREE.Mesh(branchGeo, trunkMat);
            branch.position.set(
                Math.cos(angle) * 1.5 * scale,
                (12 + Math.random() * 2) * scale,
                Math.sin(angle) * 1.5 * scale
            );
            branch.rotation.z = Math.cos(angle) * 0.4;
            branch.rotation.x = Math.sin(angle) * 0.4;
            branch.castShadow = true;
            tree.add(branch);

            // Foliage canopy clusters attached to branch tips
            for (let f = 0; f < 3; f++) {
                const canopyCluster = this.createLeafCrossCluster(leafMat, (5.5 + Math.random() * 3.5) * scale);
                canopyCluster.position.set(
                    Math.cos(angle) * (2.8 + f * 1.2) * scale + (Math.random() - 0.5) * 1.5,
                    (14 + f * 2.5) * scale,
                    Math.sin(angle) * (2.8 + f * 1.2) * scale + (Math.random() - 0.5) * 1.5
                );
                canopyCluster.rotation.y = Math.random() * Math.PI;
                tree.add(canopyCluster);
            }
        }

        return tree;
    }

    // Leafy Shrub / Fruit Tree (matching the bushy tree on the right in the photo)
    createBushyTreeModel(trunkMat, leafMat, scale = 1.0) {
        const tree = new THREE.Group();

        const trunk = new THREE.Mesh(
            new THREE.CylinderGeometry(0.35 * scale, 0.55 * scale, 6 * scale, 8),
            trunkMat
        );
        trunk.position.y = 3 * scale;
        trunk.castShadow = true;
        tree.add(trunk);

        // Dense low canopy
        for (let i = 0; i < 6; i++) {
            const cluster = this.createLeafCrossCluster(leafMat, 5.0 * scale);
            const a = (i * Math.PI * 2) / 6;
            cluster.position.set(
                Math.cos(a) * 2.2 * scale,
                (4.5 + (i % 2) * 1.8) * scale,
                Math.sin(a) * 2.2 * scale
            );
            cluster.rotation.y = a;
            tree.add(cluster);
        }

        return tree;
    }

    // Double-sided cross-quad leaf cluster with realistic depth
    createLeafCrossCluster(leafMat, size = 6.0) {
        const group = new THREE.Group();
        const planeGeo = new THREE.PlaneGeometry(size, size);

        const p1 = new THREE.Mesh(planeGeo, leafMat);
        p1.castShadow = true;
        group.add(p1);

        const p2 = p1.clone();
        p2.rotation.y = Math.PI / 3;
        group.add(p2);

        const p3 = p1.clone();
        p3.rotation.y = (Math.PI * 2) / 3;
        group.add(p3);

        return group;
    }

    // 3D Roadside Grass Tufts
    buildRoadsideGrassTufts(leafMat) {
        const tuftGeo = new THREE.PlaneGeometry(1.6, 1.2);
        const tuftMat = new THREE.MeshStandardMaterial({
            color: 0x5a943e,
            roughness: 0.9,
            side: THREE.DoubleSide
        });

        const tuftMesh = new THREE.InstancedMesh(tuftGeo, tuftMat, 400);
        const dummy = new THREE.Object3D();

        let count = 0;
        for (const road of this.terrain.roads) {
            for (let i = 0; i < road.length - 1 && count < 400; i++) {
                const p1 = road[i];
                const p2 = road[i + 1];

                for (let step = 0; step < 8 && count < 400; step++) {
                    const t = step / 8;
                    const rx = p1.x + t * (p2.x - p1.x);
                    const rz = p1.z + t * (p2.z - p1.z);

                    // Place along road shoulder (+- 10m from center)
                    for (const side of [-1, 1]) {
                        if (count >= 400) break;
                        const gx = rx + side * (9.5 + Math.random() * 3.5);
                        const gz = rz + (Math.random() - 0.5) * 4;
                        const gy = this.terrain.getHeight(gx, gz);

                        dummy.position.set(gx, gy + 0.6, gz);
                        dummy.rotation.y = Math.random() * Math.PI;
                        dummy.scale.set(1.0 + Math.random() * 0.5, 1.0 + Math.random() * 0.5, 1.0);
                        dummy.updateMatrix();
                        tuftMesh.setMatrixAt(count++, dummy.matrix);
                    }
                }
            }
        }
        this.scene.add(tuftMesh);
    }

    // 6. Street Lamps
    buildRoadProps() {
        const lampPositions = [
            { x: -50, z: -400 }, { x: -50, z: -250 }, { x: -50, z: -100 },
            { x: -50, z: 50 }, { x: -50, z: 200 }, { x: -50, z: 350 },
            { x: -200, z: -50 }, { x: 50, z: 0 }, { x: 200, z: 40 }
        ];

        for (const lp of lampPositions) {
            const ly = this.terrain.getHeight(lp.x + 8, lp.z);
            const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.25, 9), new THREE.MeshStandardMaterial({ color: 0x333333 }));
            pole.position.set(lp.x + 8, ly + 4.5, lp.z);
            this.scene.add(pole);

            const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.5, 8, 8), new THREE.MeshBasicMaterial({ color: 0xfff4d0 }));
            bulb.position.set(lp.x + 8, ly + 9, lp.z);
            this.scene.add(bulb);

            const light = new THREE.PointLight(0xffeedd, 1.8, 35, 1.5);
            light.position.set(lp.x + 8, ly + 8.8, lp.z);
            this.scene.add(light);
            this.streetLights.push(light);

            this.colliders.push({ type: 'cylinder', x: lp.x + 8, z: lp.z, radius: 0.5 });
        }
    }

    checkCollision(carX, carZ, carRadius = 1.6) {
        for (const col of this.colliders) {
            if (col.type === 'cylinder') {
                const dx = carX - col.x;
                const dz = carZ - col.z;
                const dist = Math.hypot(dx, dz);
                const minDist = carRadius + col.radius;
                if (dist < minDist && dist > 0.0001) {
                    const overlap = minDist - dist;
                    const nx = dx / dist;
                    const nz = dz / dist;
                    return { hit: true, nx, nz, overlap };
                }
            } else if (col.type === 'box') {
                if (
                    carX + carRadius > col.minX &&
                    carX - carRadius < col.maxX &&
                    carZ + carRadius > col.minZ &&
                    carZ - carRadius < col.maxZ
                ) {
                    const cx = (col.minX + col.maxX) / 2;
                    const cz = (col.minZ + col.maxZ) / 2;
                    const dx = carX - cx;
                    const dz = carZ - cz;
                    const halfW = (col.maxX - col.minX) / 2 + carRadius;
                    const halfD = (col.maxZ - col.minZ) / 2 + carRadius;
                    const ox = halfW - Math.abs(dx);
                    const oz = halfD - Math.abs(dz);

                    if (ox < oz) {
                        return { hit: true, nx: Math.sign(dx), nz: 0, overlap: ox };
                    } else {
                        return { hit: true, nx: 0, nz: Math.sign(dz), overlap: oz };
                    }
                }
            }
        }

        for (const item of this.destructibles) {
            const dx = item.x - carX;
            const dz = item.z - carZ;
            const dist = Math.hypot(dx, dz);
            if (dist < carRadius + item.radius) {
                const pushForce = 0.4;
                item.vx += (dx / dist) * pushForce;
                item.vz += (dz / dist) * pushForce;
            }
        }

        return null;
    }

    checkRampElevation(carX, carZ) {
        for (const ramp of this.ramps) {
            const dx = carX - ramp.x;
            const dz = carZ - ramp.z;
            const cos = Math.cos(-ramp.rotation);
            const sin = Math.sin(-ramp.rotation);
            const localX = dx * cos - dz * sin;
            const localZ = dx * sin + dz * cos;
            const halfL = ramp.length / 2;
            const halfW = ramp.width / 2;

            if (localX >= -halfL && localX <= halfL && localZ >= -halfW && localZ <= halfW) {
                const t = (localX + halfL) / ramp.length;
                return { onRamp: true, extraHeight: t * ramp.height };
            }
        }
        return null;
    }

    update(delta, carPos, carSpeed) {
        for (const prop of this.animatedProps) {
            if (prop.type === 'windmill') {
                prop.mesh.rotation.z += prop.speed;
            } else if (prop.type === 'lighthouse') {
                prop.mesh.rotation.y += prop.speed;
            }
        }

        for (const item of this.destructibles) {
            if (Math.abs(item.vx) > 0.01 || Math.abs(item.vz) > 0.01) {
                item.x += item.vx;
                item.z += item.vz;
                item.vx *= 0.9;
                item.vz *= 0.9;
                item.y = this.terrain.getHeight(item.x, item.z) + 1.1;
                item.mesh.position.set(item.x, item.y, item.z);
                item.mesh.rotation.x += item.vz * 0.2;
                item.mesh.rotation.z -= item.vx * 0.2;
            }
        }

        if (this.speedTrap) {
            const dist = Math.hypot(carPos.x - this.speedTrap.x, carPos.z - this.speedTrap.z);
            if (dist < this.speedTrap.radius && carSpeed > 60) {
                this.speedTrap.flashLight.intensity = 8.0;
                this.speedTrap.flashTimer = 0.2;
                if (window.onSpeedTrap) window.onSpeedTrap(Math.round(carSpeed));
            }
            if (this.speedTrap.flashTimer > 0) {
                this.speedTrap.flashTimer -= delta;
                if (this.speedTrap.flashTimer <= 0) this.speedTrap.flashLight.intensity = 0;
            }
        }
    }
}

window.WorldManager = WorldManager;
