/**
 * High-Resolution Procedural Texture Generator
 * Generates photorealistic grass, gravel, bark, leaves, tires, fabric, Ford grille, and NSW license plate.
 */
class TextureGenerator {
    constructor() {
        this.cache = {};
    }

    // 1. Realistic Grass Texture matching the photographic turf reference
    createGrassTexture(size = 1024) {
        if (this.cache['grass']) return this.cache['grass'];
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        // Rich, deep dark green lawn undertone (#187a11, #1b8513)
        ctx.fillStyle = '#166e0f';
        ctx.fillRect(0, 0, size, size);

        // Noise and dark lush underlayer
        const imgData = ctx.getImageData(0, 0, size, size);
        const data = imgData.data;
        for (let i = 0; i < data.length; i += 4) {
            const noise = (Math.random() - 0.5) * 25;
            data[i] = Math.min(255, Math.max(0, 24 + noise * 0.6));      // R: dark forest
            data[i + 1] = Math.min(255, Math.max(0, 126 + noise));       // G: deep dark green
            data[i + 2] = Math.min(255, Math.max(0, 17 + noise * 0.4));  // B: chlorophyll base
        }
        ctx.putImageData(imgData, 0, 0);

        // Individual grass blades matching the dark green lush turf palette
        const bladeColors = [
            '#187a11', '#1b8513', '#177f10', '#1a8511', '#13780c',
            '#156b0d', '#209117', '#11570a', '#249e1b', '#186e10'
        ];
        const bladeCount = 28000;
        for (let i = 0; i < bladeCount; i++) {
            const x = Math.random() * size;
            const y = Math.random() * size;
            const len = 5 + Math.random() * 12;
            const angle = Math.random() * Math.PI * 2; // All-direction turf weave
            const col = bladeColors[Math.floor(Math.random() * bladeColors.length)];

            ctx.strokeStyle = col;
            ctx.lineWidth = 1.0 + Math.random() * 1.5;
            ctx.beginPath();
            ctx.moveTo(x, y);
            const cx = x + Math.cos(angle) * (len * 0.5) + (Math.random() - 0.5) * 3;
            const cy = y + Math.sin(angle) * (len * 0.5) + (Math.random() - 0.5) * 3;
            const ex = x + Math.cos(angle) * len;
            const ey = y + Math.sin(angle) * len;
            ctx.quadraticCurveTo(cx, cy, ex, ey);
            ctx.stroke();
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        this.cache['grass'] = texture;

        // Overlay the high-resolution photographic texture from the user's reference
        if (typeof Image !== 'undefined') {
            const photo = new Image();
            photo.onload = () => {
                ctx.drawImage(photo, 0, 0, size, size);
                texture.needsUpdate = true;
            };
            photo.src = 'textures/grass_seamless.jpg';
        }

        return texture;
    }

    // High-resolution Normal Map matching the photographic turf reference
    createGrassNormalMap(size = 1024) {
        if (this.cache['grassNormal']) return this.cache['grassNormal'];
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        // Flat normal base (128, 128, 255)
        ctx.fillStyle = 'rgb(128, 128, 255)';
        ctx.fillRect(0, 0, size, size);

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        this.cache['grassNormal'] = texture;

        if (typeof Image !== 'undefined') {
            const photo = new Image();
            photo.onload = () => {
                ctx.drawImage(photo, 0, 0, size, size);
                texture.needsUpdate = true;
            };
            photo.src = 'textures/grass_normal.jpg';
        }

        return texture;
    }

    // 2. Crushed Grey Gravel Driveway (exact match to the photo)
    createGravelTexture(size = 1024) {
        if (this.cache['gravel']) return this.cache['gravel'];
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        // Grey-blue gravel base
        ctx.fillStyle = '#7a7e85';
        ctx.fillRect(0, 0, size, size);

        // Draw thousands of crushed stone pebbles
        const stoneColors = ['#5e6269', '#8b909a', '#9da3ad', '#4b4e54', '#686d75', '#aeb4bf', '#3b3d42'];
        for (let i = 0; i < 22000; i++) {
            const x = Math.random() * size;
            const y = Math.random() * size;
            const r = 1.2 + Math.random() * 3.8;
            ctx.fillStyle = stoneColors[Math.floor(Math.random() * stoneColors.length)];

            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();

            // Pebble shadow / highlight
            if (Math.random() > 0.5) {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
                ctx.fillRect(x, y + r * 0.5, r, r * 0.5);
            }
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(40, 40);
        this.cache['gravel'] = texture;
        return texture;
    }

    // 3. Eucalyptus Gum Tree Bark Texture
    createBarkTexture(size = 512) {
        if (this.cache['bark']) return this.cache['bark'];
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        // Pale creamy tan and mottled grey gum tree bark
        ctx.fillStyle = '#b5ab9e';
        ctx.fillRect(0, 0, size, size);

        // Vertical peeling bark strips
        const stripColors = ['#8f8373', '#665c50', '#c9c0b5', '#574c40', '#9c9082'];
        for (let i = 0; i < 400; i++) {
            const x = Math.random() * size;
            const y = Math.random() * size;
            const w = 4 + Math.random() * 16;
            const h = 40 + Math.random() * 180;
            ctx.fillStyle = stripColors[Math.floor(Math.random() * stripColors.length)];
            ctx.globalAlpha = 0.5 + Math.random() * 0.5;
            ctx.fillRect(x, y, w, h);
        }
        ctx.globalAlpha = 1.0;

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(2, 6);
        this.cache['bark'] = texture;
        return texture;
    }

    // 4. Eucalyptus Leaf Canopy Cluster Texture (with alpha cutout)
    createLeafClusterTexture(size = 512) {
        if (this.cache['leaf']) return this.cache['leaf'];
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        ctx.clearRect(0, 0, size, size);

        // Foliage colors from the photo: olive greens, eucalyptus sage, sunny highlights
        const leafColors = ['#456b37', '#5d8a4a', '#6f9d56', '#3b5c2d', '#7fa85b', '#8fba6a', '#345228'];

        const leafCount = 450;
        for (let i = 0; i < leafCount; i++) {
            const cx = size / 2 + (Math.random() - 0.5) * (size * 0.75);
            const cy = size / 2 + (Math.random() - 0.5) * (size * 0.75);

            // Distance fade from center for natural bushy shape
            const dist = Math.hypot(cx - size / 2, cy - size / 2);
            if (dist > size * 0.45 && Math.random() > 0.3) continue;

            const length = 18 + Math.random() * 26;
            const width = 6 + Math.random() * 8;
            const angle = Math.random() * Math.PI * 2;

            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(angle);

            // Drooping sickle-shaped eucalyptus leaf
            ctx.fillStyle = leafColors[Math.floor(Math.random() * leafColors.length)];
            ctx.beginPath();
            ctx.moveTo(0, -length / 2);
            ctx.quadraticCurveTo(width, 0, 0, length / 2);
            ctx.quadraticCurveTo(-width * 0.5, 0, 0, -length / 2);
            ctx.fill();

            // Central leaf vein
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(0, -length / 2);
            ctx.lineTo(0, length / 2);
            ctx.stroke();

            ctx.restore();
        }

        const texture = new THREE.CanvasTexture(canvas);
        this.cache['leaf'] = texture;
        return texture;
    }

    // 5. Authentic Ford Radiator Grille with Scripted Ford Emblem (from photo!)
    createFordGrilleTexture(size = 512) {
        if (this.cache['fordGrille']) return this.cache['fordGrille'];
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        // Black wire mesh pattern
        ctx.fillStyle = '#0d0d0e';
        ctx.fillRect(0, 0, size, size);

        // Fine wire mesh grid
        ctx.strokeStyle = '#222224';
        ctx.lineWidth = 1.5;
        const spacing = 6;
        for (let x = 0; x < size; x += spacing) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, size);
            ctx.stroke();
        }
        for (let y = 0; y < size; y += spacing) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(size, y);
            ctx.stroke();
        }

        // Draw the iconic scripted cursive "Ford" emblem in chrome/silver
        ctx.save();
        ctx.translate(size / 2, size / 2 - 10);

        // Chrome drop shadow
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetX = 3;
        ctx.shadowOffsetY = 4;

        ctx.fillStyle = '#e0e4e8';
        ctx.font = 'italic bold 95px "Brush Script MT", "Snell Roundhand", cursive, serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Ford', 0, 0);

        // Chrome shiny highlight overlay
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.5;
        ctx.strokeText('Ford', 0, 0);

        ctx.restore();

        const texture = new THREE.CanvasTexture(canvas);
        this.cache['fordGrille'] = texture;
        return texture;
    }

    // 6. Yellow NSW Vintage License Plate: "TAREE H.V.C. / BM · 18 AP / NEW SOUTH WALES"
    createLicensePlateTexture() {
        if (this.cache['plate']) return this.cache['plate'];
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');

        // Vintage yellow plate background
        ctx.fillStyle = '#e8bf29';
        ctx.fillRect(0, 0, 512, 256);

        // Plate black embossed border
        ctx.strokeStyle = '#111111';
        ctx.lineWidth = 12;
        ctx.strokeRect(10, 10, 492, 236);

        // Top Banner: TAREE H.V.C.
        ctx.fillStyle = '#111111';
        ctx.font = 'bold 28px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('TAREE H.V.C.', 256, 48);

        // Main Plate Number: BM · 18 AP
        ctx.font = 'bold 96px "Impact", "Arial Black", sans-serif';
        ctx.letterSpacing = '4px';
        ctx.fillText('BM · 18 AP', 256, 145);

        // Bottom Banner: NEW SOUTH WALES
        ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.fillText('NEW SOUTH WALES', 256, 215);

        const texture = new THREE.CanvasTexture(canvas);
        this.cache['plate'] = texture;
        return texture;
    }

    // 7. Fluted Vintage Headlight Glass Lens
    createHeadlightGlassTexture(size = 256) {
        if (this.cache['headlight']) return this.cache['headlight'];
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = '#dbeeff';
        ctx.fillRect(0, 0, size, size);

        // Vertical fluting ribs
        ctx.strokeStyle = '#adcde8';
        ctx.lineWidth = 2.5;
        for (let x = 6; x < size; x += 8) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, size);
            ctx.stroke();
        }

        // Concentric circular ribs
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
        for (let r = 20; r < size / 2; r += 24) {
            ctx.beginPath();
            ctx.arc(size / 2, size / 2, r, 0, Math.PI * 2);
            ctx.stroke();
        }

        const texture = new THREE.CanvasTexture(canvas);
        this.cache['headlight'] = texture;
        return texture;
    }

    // 7b. Balanced Automotive Windshield Glass Texture
    createWindshieldGlassTexture(size = 512) {
        if (this.cache['windshieldGlass']) return this.cache['windshieldGlass'];
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        // Soft sky reflection gradient (subtle crystal tint, clear view through)
        const bgGrad = ctx.createLinearGradient(0, 0, 0, size);
        bgGrad.addColorStop(0.0, 'rgba(230, 245, 255, 0.32)');
        bgGrad.addColorStop(0.3, 'rgba(190, 222, 250, 0.16)');
        bgGrad.addColorStop(0.7, 'rgba(160, 205, 245, 0.12)');
        bgGrad.addColorStop(1.0, 'rgba(205, 230, 255, 0.24)');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, size, size);

        // Elegant diagonal specular sunlight glints
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.42)';
        ctx.lineWidth = 22;
        ctx.beginPath();
        ctx.moveTo(size * 0.15, 0);
        ctx.lineTo(size * 0.75, size);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.moveTo(size * 0.35, 0);
        ctx.lineTo(size * 0.95, size);
        ctx.stroke();

        // Subtle thin glass chamfer bevel highlight
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.lineWidth = 2;
        ctx.strokeRect(2, 2, size - 4, size - 4);
        ctx.restore();

        const texture = new THREE.CanvasTexture(canvas);
        this.cache['windshieldGlass'] = texture;
        return texture;
    }

    // 8. Matte Folding Canvas Roof Fabric Texture
    createFabricTexture(size = 512) {
        if (this.cache['fabric']) return this.cache['fabric'];
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        // Dark charcoal weathered fabric
        ctx.fillStyle = '#1c1c1e';
        ctx.fillRect(0, 0, size, size);

        // Subtle weave pattern
        ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
        for (let y = 0; y < size; y += 4) {
            for (let x = (y % 8 === 0 ? 0 : 2); x < size; x += 4) {
                ctx.fillRect(x, y, 2, 2);
            }
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(4, 4);
        this.cache['fabric'] = texture;
        return texture;
    }

    // 9. Pleated Tufted Leather for Car Seats
    createLeatherTexture(size = 512) {
        if (this.cache['leather']) return this.cache['leather'];
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = '#141416';
        ctx.fillRect(0, 0, size, size);

        // Vertical leather pleats/flutes
        const pleatW = 32;
        for (let x = 0; x < size; x += pleatW) {
            // Shadow crease
            ctx.fillStyle = '#080809';
            ctx.fillRect(x, 0, 4, size);

            // Highlight ridge
            ctx.fillStyle = '#2a2a2e';
            ctx.fillRect(x + 10, 0, 12, size);
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(2, 2);
        this.cache['leather'] = texture;
        return texture;
    }

    // 10. Diamond Plate & Dual Aluminum Step Plates (Matching Side View Image 3)
    createRunningBoardTexture(width = 512, height = 128) {
        if (this.cache['runningBoard']) return this.cache['runningBoard'];
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        // Black ribbed running board base
        ctx.fillStyle = '#141416';
        ctx.fillRect(0, 0, width, height);

        // Horizontal rubber traction ribs
        ctx.strokeStyle = '#222225';
        ctx.lineWidth = 2;
        for (let y = 6; y < height; y += 8) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }

        // Two polished cast-aluminum step plates (beneath front and rear doors, from Image 3!)
        const plateCenters = [130, 380];
        const pW = 120;
        const pH = 84;

        for (const cx of plateCenters) {
            const px = cx - pW / 2;
            const py = (height - pH) / 2;

            // Aluminum plate drop shadow
            ctx.fillStyle = '#08080a';
            ctx.fillRect(px - 2, py - 2, pW + 4, pH + 4);

            // Brushed aluminum finish
            const grad = ctx.createLinearGradient(px, py, px, py + pH);
            grad.addColorStop(0.0, '#e2e6eb');
            grad.addColorStop(0.5, '#b8bec7');
            grad.addColorStop(1.0, '#d5dae2');
            ctx.fillStyle = grad;
            ctx.fillRect(px, py, pW, pH);

            // Beveled chrome border
            ctx.strokeStyle = '#f8f9fb';
            ctx.lineWidth = 3;
            ctx.strokeRect(px + 1, py + 1, pW - 2, pH - 2);

            // Inner traction grooves
            ctx.strokeStyle = '#60646c';
            ctx.lineWidth = 2.5;
            for (let y = py + 12; y < py + pH - 10; y += 10) {
                ctx.beginPath();
                ctx.moveTo(px + 12, y);
                ctx.lineTo(px + pW - 12, y);
                ctx.stroke();
            }

            // Central Ford script badge on step plate
            ctx.fillStyle = '#22252a';
            ctx.font = 'italic bold 16px "Brush Script MT", cursive, serif';
            ctx.textAlign = 'center';
            ctx.fillText('Ford', cx, py + pH / 2 + 5);
        }

        const texture = new THREE.CanvasTexture(canvas);
        this.cache['runningBoard'] = texture;
        return texture;
    }

    // 10b. Rear Canvas Curtain with Horizontal Oval Isinglass Window (from Rear View Image 2!)
    createRearCanopyTexture(size = 512) {
        if (this.cache['rearCanopy']) return this.cache['rearCanopy'];
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        // Black weathered canvas top
        ctx.fillStyle = '#18181a';
        ctx.fillRect(0, 0, size, size);

        // Subtle canvas weave
        ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
        for (let y = 0; y < size; y += 4) {
            for (let x = (y % 8 === 0 ? 0 : 2); x < size; x += 4) {
                ctx.fillRect(x, y, 2, 2);
            }
        }

        // Distinctive horizontal oval window (Image 2!)
        const ox = size / 2;
        const oy = size * 0.38;
        const rx = 145; // horizontal radius
        const ry = 72;  // vertical radius

        // Outer chrome/nickel bezel ring
        ctx.beginPath();
        ctx.ellipse(ox, oy, rx + 10, ry + 10, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#0a0a0c'; // shadow
        ctx.fill();

        ctx.beginPath();
        ctx.ellipse(ox, oy, rx + 6, ry + 6, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#dbe0e6'; // nickel bezel
        ctx.fill();

        ctx.beginPath();
        ctx.ellipse(ox, oy, rx + 2, ry + 2, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#1c1c1f'; // rubber gasket
        ctx.fill();

        // Isinglass transparent window glass with sky reflection
        ctx.beginPath();
        ctx.ellipse(ox, oy, rx, ry, 0, 0, Math.PI * 2);
        const glassGrad = ctx.createLinearGradient(ox - rx, oy - ry, ox + rx, oy + ry);
        glassGrad.addColorStop(0.0, 'rgba(215, 238, 255, 0.65)');
        glassGrad.addColorStop(0.4, 'rgba(160, 200, 235, 0.45)');
        glassGrad.addColorStop(0.7, 'rgba(80, 110, 140, 0.35)');
        glassGrad.addColorStop(1.0, 'rgba(200, 230, 255, 0.6)');
        ctx.fillStyle = glassGrad;
        ctx.fill();

        // White diagonal reflection glare line
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(ox, oy, rx - 4, ry - 4, 0, 0, Math.PI * 2);
        ctx.clip();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
        ctx.lineWidth = 14;
        ctx.beginPath();
        ctx.moveTo(ox - rx * 0.4, oy - ry);
        ctx.lineTo(ox - rx * 0.1, oy + ry);
        ctx.stroke();
        ctx.restore();

        const texture = new THREE.CanvasTexture(canvas);
        this.cache['rearCanopy'] = texture;
        return texture;
    }

    // 10c. Classic Exhibition Display Plate ("HYMAN LTD." from Images 1 & 2)
    createHymanPlateTexture() {
        if (this.cache['hymanPlate']) return this.cache['hymanPlate'];
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');

        // Black plate background
        ctx.fillStyle = '#111113';
        ctx.fillRect(0, 0, 512, 256);

        // Silver border
        ctx.strokeStyle = '#c8cdd4';
        ctx.lineWidth = 10;
        ctx.strokeRect(10, 10, 492, 236);

        // White/silver typography
        ctx.fillStyle = '#e8ecf2';
        ctx.font = 'bold 84px "Times New Roman", Georgia, serif';
        ctx.textAlign = 'center';
        ctx.letterSpacing = '3px';
        ctx.fillText('HYMAN', 256, 125);

        ctx.font = 'bold 36px "Times New Roman", Georgia, serif';
        ctx.fillText('LTD.', 256, 175);

        ctx.font = 'bold 18px sans-serif';
        ctx.fillStyle = '#9aa0a8';
        ctx.fillText('CLASSIC CARS', 256, 215);

        const texture = new THREE.CanvasTexture(canvas);
        this.cache['hymanPlate'] = texture;
        return texture;
    }

    // 10d. Diamond Plate Running Board Texture
    createTreadPlateTexture(size = 256) {
        if (this.cache['treadPlate']) return this.cache['treadPlate'];
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = '#18181a';
        ctx.fillRect(0, 0, size, size);

        // Rubber diamond ribs
        ctx.strokeStyle = '#2d2d30';
        ctx.lineWidth = 3;
        for (let y = -size; y < size * 2; y += 14) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(size, y + size);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0, y + size);
            ctx.lineTo(size, y);
            ctx.stroke();
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(2, 10);
        this.cache['treadPlate'] = texture;
        return texture;
    }

    // 10e. Porsche Gold Crest Emblem (Front Hood from Photo 0)
    createPorscheBadgeTexture(size = 256) {
        if (this.cache['porscheBadge']) return this.cache['porscheBadge'];
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        // Gold metallic shield outline
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(size * 0.22, size * 0.12);
        ctx.lineTo(size * 0.78, size * 0.12);
        ctx.lineTo(size * 0.76, size * 0.58);
        ctx.bezierCurveTo(size * 0.72, size * 0.82, size * 0.5, size * 0.94, size * 0.5, size * 0.96);
        ctx.bezierCurveTo(size * 0.5, size * 0.94, size * 0.28, size * 0.82, size * 0.24, size * 0.58);
        ctx.closePath();

        const goldGrad = ctx.createLinearGradient(0, 0, size, size);
        goldGrad.addColorStop(0.0, '#ffd966');
        goldGrad.addColorStop(0.3, '#d4af37');
        goldGrad.addColorStop(0.7, '#f7e27e');
        goldGrad.addColorStop(1.0, '#aa820a');
        ctx.fillStyle = goldGrad;
        ctx.fill();

        ctx.strokeStyle = '#6e5200';
        ctx.lineWidth = 6;
        ctx.stroke();
        ctx.clip();

        // 4 Quadrants: Top-left & Bottom-right: gold with black stag antlers. Top-right & Bottom-left: red & black stripes.
        const midX = size * 0.5;
        const midY = size * 0.48;

        // Top-right red/black stripes
        ctx.fillStyle = '#b71212';
        ctx.fillRect(midX, size * 0.22, size * 0.35, midY - size * 0.22);
        ctx.fillStyle = '#111111';
        ctx.fillRect(midX + 14, size * 0.22, 12, midY - size * 0.22);
        ctx.fillRect(midX + 42, size * 0.22, 12, midY - size * 0.22);

        // Bottom-left red/black stripes
        ctx.fillStyle = '#b71212';
        ctx.fillRect(size * 0.2, midY, midX - size * 0.2, size * 0.45);
        ctx.fillStyle = '#111111';
        ctx.fillRect(size * 0.28, midY, 12, size * 0.45);
        ctx.fillRect(size * 0.42, midY, 12, size * 0.45);

        // Center inner Stuttgart shield (gold with black prancing horse)
        ctx.fillStyle = '#d4af37';
        ctx.beginPath();
        ctx.arc(midX, midY + 4, size * 0.12, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#222';
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.fillStyle = '#111111';
        ctx.beginPath();
        ctx.arc(midX, midY + 3, size * 0.06, 0, Math.PI * 2);
        ctx.fill();

        // "PORSCHE" arch banner at top
        ctx.fillStyle = '#111111';
        ctx.font = 'bold 22px sans-serif';
        ctx.textAlign = 'center';
        ctx.letterSpacing = '3px';
        ctx.fillText('PORSCHE', midX, size * 0.2);

        ctx.restore();

        const texture = new THREE.CanvasTexture(canvas);
        this.cache['porscheBadge'] = texture;
        return texture;
    }

    // 10f. Porsche 4-Point LED Matrix Headlight Texture (Front View Photo 0)
    createPorscheHeadlightTexture(size = 512) {
        if (this.cache['porscheHeadlight']) return this.cache['porscheHeadlight'];
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        // Dark smoked titanium projector housing
        const bgGrad = ctx.createRadialGradient(size * 0.5, size * 0.5, 40, size * 0.5, size * 0.5, size * 0.5);
        bgGrad.addColorStop(0.0, '#1c1e22');
        bgGrad.addColorStop(0.7, '#0e0f12');
        bgGrad.addColorStop(1.0, '#050608');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, size, size);

        // Outer Dark Chrome Bezel Ring
        ctx.strokeStyle = '#353a42';
        ctx.lineWidth = 14;
        ctx.beginPath();
        ctx.arc(size * 0.5, size * 0.5, size * 0.46, 0, Math.PI * 2);
        ctx.stroke();

        // Concentric precision ribbed lens rings
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.lineWidth = 3;
        for (let r = 80; r < size * 0.42; r += 26) {
            ctx.beginPath();
            ctx.arc(size * 0.5, size * 0.5, r, 0, Math.PI * 2);
            ctx.stroke();
        }

        // Center Bi-LED Projector Lens ("Eyeball")
        const projGrad = ctx.createRadialGradient(size * 0.48, size * 0.46, 6, size * 0.5, size * 0.5, 75);
        projGrad.addColorStop(0.0, '#ffffff');
        projGrad.addColorStop(0.2, '#cce6ff');
        projGrad.addColorStop(0.6, '#304c66');
        projGrad.addColorStop(1.0, '#111822');
        ctx.fillStyle = projGrad;
        ctx.beginPath();
        ctx.arc(size * 0.5, size * 0.5, 75, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#52667d';
        ctx.lineWidth = 5;
        ctx.stroke();

        // The iconic Porsche 4-Point LED Daytime Running Lights (4 bright glowing squares at 12, 3, 6, 9 o'clock)
        const d = size * 0.33;
        const pts = [
            { x: size * 0.5, y: size * 0.5 - d },
            { x: size * 0.5 + d, y: size * 0.5 },
            { x: size * 0.5, y: size * 0.5 + d },
            { x: size * 0.5 - d, y: size * 0.5 }
        ];

        for (const pt of pts) {
            // Glow halo
            const glow = ctx.createRadialGradient(pt.x, pt.y, 4, pt.x, pt.y, 36);
            glow.addColorStop(0.0, 'rgba(255, 255, 255, 1.0)');
            glow.addColorStop(0.3, 'rgba(210, 240, 255, 0.85)');
            glow.addColorStop(0.7, 'rgba(120, 200, 255, 0.35)');
            glow.addColorStop(1.0, 'rgba(80, 160, 255, 0.0)');
            ctx.fillStyle = glow;
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, 36, 0, Math.PI * 2);
            ctx.fill();

            // Sharp crystal LED core block
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(pt.x - 14, pt.y - 14, 28, 28);
            ctx.strokeStyle = '#bfe2ff';
            ctx.lineWidth = 3;
            ctx.strokeRect(pt.x - 14, pt.y - 14, 28, 28);
        }

        const texture = new THREE.CanvasTexture(canvas);
        this.cache['porscheHeadlight'] = texture;
        return texture;
    }

    // 10g. Full-Width 3D LED Rear Lightbar with "PORSCHE" & "911 Carrera S" (Rear View Photo 1)
    createPorscheLightbarTexture(width = 1024, height = 128) {
        if (this.cache['porscheLightbar']) return this.cache['porscheLightbar'];
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        // Dark gloss smoke-tinted acrylic housing
        ctx.fillStyle = '#0a0a0c';
        ctx.fillRect(0, 0, width, height);

        // Thin neon-red continuous LED light strip spanning end to end (992 signature)
        const redGlow = ctx.createLinearGradient(0, height * 0.25, 0, height * 0.55);
        redGlow.addColorStop(0.0, 'rgba(255, 20, 20, 0.2)');
        redGlow.addColorStop(0.5, 'rgba(255, 50, 50, 1.0)');
        redGlow.addColorStop(1.0, 'rgba(255, 20, 20, 0.2)');

        ctx.fillStyle = redGlow;
        ctx.fillRect(20, height * 0.32, width - 40, 16);

        // Intense core neon laser line
        ctx.fillStyle = '#ff6666';
        ctx.fillRect(24, height * 0.36, width - 48, 6);

        // Outer corner brake/turn pods
        ctx.fillStyle = 'rgba(255, 20, 20, 0.85)';
        ctx.fillRect(20, height * 0.2, 110, 36);
        ctx.fillRect(width - 130, height * 0.2, 110, 36);

        // Centered 3D Silver "P O R S C H E" typography in the central recess
        ctx.fillStyle = '#f0f3f6';
        ctx.font = 'bold 30px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.textAlign = 'center';
        ctx.letterSpacing = '14px';
        ctx.fillText('P O R S C H E', width * 0.5 + 7, height * 0.44);

        // Centered script badge below: "911 Carrera S"
        ctx.fillStyle = '#18181a';
        ctx.font = 'italic bold 22px Georgia, serif';
        ctx.letterSpacing = '2px';
        ctx.fillText('911 Carrera S', width * 0.5, height * 0.82);

        const texture = new THREE.CanvasTexture(canvas);
        this.cache['porscheLightbar'] = texture;
        return texture;
    }

    // 10h. California License Plate ("16403" from Rear View Photo 1)
    createCaliforniaPlateTexture(width = 512, height = 256) {
        if (this.cache['caPlate']) return this.cache['caPlate'];
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        // White reflective plate surface
        ctx.fillStyle = '#f4f6f8';
        ctx.fillRect(0, 0, width, height);

        // Outer dark embossed bevel border
        ctx.strokeStyle = '#c2c7ce';
        ctx.lineWidth = 12;
        ctx.strokeRect(6, 6, width - 12, height - 12);

        // Red script "California" header
        ctx.fillStyle = '#b81818';
        ctx.font = 'italic bold 52px "Brush Script MT", "Brush Script", "Snell Roundhand", cursive, Georgia, serif';
        ctx.textAlign = 'center';
        ctx.fillText('California', width * 0.5, 68);

        // Registration decals
        ctx.fillStyle = '#1c3b6a';
        ctx.fillRect(40, 36, 48, 30);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px sans-serif';
        ctx.fillText('SEP', 64, 57);

        ctx.fillStyle = '#b87518';
        ctx.fillRect(width - 88, 36, 48, 30);
        ctx.fillStyle = '#ffffff';
        ctx.fillText('2024', width - 64, 57);

        // Centered License Plate Number: "16403" (Photo 1)
        ctx.fillStyle = '#182b4a';
        ctx.font = 'bold 104px "Trebuchet MS", Arial, sans-serif';
        ctx.letterSpacing = '8px';
        ctx.fillText('16403', width * 0.5, 178);

        const texture = new THREE.CanvasTexture(canvas);
        this.cache['caPlate'] = texture;
        return texture;
    }

    // 10i. Dark Honeycomb Intake Mesh (Front Bumper Photo 0)
    createPorscheHoneycombTexture(size = 256) {
        if (this.cache['honeycomb']) return this.cache['honeycomb'];
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = '#08080a';
        ctx.fillRect(0, 0, size, size);

        ctx.strokeStyle = '#1d1e22';
        ctx.lineWidth = 2.5;

        const hexRadius = 10;
        const hexHeight = Math.sqrt(3) * hexRadius;
        for (let y = -hexHeight; y < size + hexHeight * 2; y += hexHeight) {
            for (let x = -hexRadius; x < size + hexRadius * 2; x += hexRadius * 3) {
                for (let offset = 0; offset < 2; offset++) {
                    const cx = x + offset * (hexRadius * 1.5);
                    const cy = y + offset * (hexHeight * 0.5);
                    ctx.beginPath();
                    for (let a = 0; a < 6; a++) {
                        const angle = (Math.PI / 3) * a;
                        const hx = cx + hexRadius * Math.cos(angle);
                        const hy = cy + hexRadius * Math.sin(angle);
                        if (a === 0) ctx.moveTo(hx, hy);
                        else ctx.lineTo(hx, hy);
                    }
                    ctx.closePath();
                    ctx.stroke();
                }
            }
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(4, 4);
        this.cache['honeycomb'] = texture;
        return texture;
    }

    // 10j. Toyota 4Runner Aggressive Front Grille & Chrome Emblem (Photo 0)
    createToyotaGrilleTexture(width = 512, height = 256) {
        if (this.cache['toyotaGrille']) return this.cache['toyotaGrille'];
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        // Deep satin black background
        ctx.fillStyle = '#0e1013';
        ctx.fillRect(0, 0, width, height);

        // Horizontal Billet Grille Slats (Photo 0)
        const slatCount = 18;
        const slatSpacing = height / slatCount;
        for (let i = 0; i < slatCount; i++) {
            const y = i * slatSpacing;
            // Slat top highlight
            ctx.fillStyle = '#2a2d33';
            ctx.fillRect(8, y, width - 16, 3);
            // Slat face
            ctx.fillStyle = '#16181c';
            ctx.fillRect(8, y + 3, width - 16, slatSpacing - 6);
            // Slat drop shadow
            ctx.fillStyle = '#060709';
            ctx.fillRect(8, y + slatSpacing - 3, width - 16, 3);
        }

        // Center Thick Crossbar (Photo 0)
        const barH = 54;
        const barY = height * 0.32 - barH * 0.5;
        const barGrad = ctx.createLinearGradient(0, barY, 0, barY + barH);
        barGrad.addColorStop(0.0, '#363a40');
        barGrad.addColorStop(0.2, '#212429');
        barGrad.addColorStop(0.8, '#141619');
        barGrad.addColorStop(1.0, '#0a0b0d');
        ctx.fillStyle = barGrad;
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(16, barY, width - 32, barH, 8) : ctx.rect(16, barY, width - 32, barH);
        ctx.fill();
        ctx.strokeStyle = '#484e57';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Chrome Toyota 3-Oval Emblem in Center (Photo 0)
        const drawToyotaLogo = (cx, cy, rx, ry) => {
            ctx.save();
            // Outer oval
            ctx.strokeStyle = '#f0f3f6';
            ctx.lineWidth = 7;
            ctx.shadowColor = '#000000';
            ctx.shadowBlur = 6;
            ctx.beginPath();
            ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
            ctx.stroke();

            // Inner vertical oval
            ctx.shadowBlur = 0;
            ctx.strokeStyle = '#d8dde4';
            ctx.lineWidth = 5.5;
            ctx.beginPath();
            ctx.ellipse(cx, cy, rx * 0.42, ry * 0.90, 0, 0, Math.PI * 2);
            ctx.stroke();

            // Inner horizontal oval intersecting top
            ctx.beginPath();
            ctx.ellipse(cx, cy - ry * 0.18, rx * 0.72, ry * 0.44, 0, 0, Math.PI * 2);
            ctx.stroke();

            // Chrome specular glint
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.ellipse(cx - rx * 0.25, cy - ry * 0.25, rx * 0.35, ry * 0.25, -Math.PI / 6, 0, Math.PI * 0.6);
            ctx.stroke();
            ctx.restore();
        };

        drawToyotaLogo(width * 0.5, height * 0.32, 48, 32);

        // Lower Right Accent Badge ("T-REX" / Trail badge from Photo 0)
        ctx.fillStyle = '#c0c5cc';
        ctx.fillRect(width * 0.74, height * 0.68, 54, 16);
        ctx.fillStyle = '#111316';
        ctx.fillRect(width * 0.74 + 2, height * 0.68 + 2, 50, 12);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('4RUNNER', width * 0.74 + 27, height * 0.68 + 11);

        const texture = new THREE.CanvasTexture(canvas);
        this.cache['toyotaGrille'] = texture;
        return texture;
    }

    // 10k. Toyota 4Runner Rear Tailgate Chrome Garnish Bar with Embossed "4RUNNER" (Photo 2)
    create4RunnerRearGarnishTexture(width = 512, height = 128) {
        if (this.cache['4runnerGarnish']) return this.cache['4runnerGarnish'];
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        // Dark magnetic gray outer bevel border
        ctx.fillStyle = '#2a2e33';
        ctx.fillRect(0, 0, width, height);

        // Polished Chrome Horizontal Plate
        const plateGrad = ctx.createLinearGradient(0, 8, 0, height - 16);
        plateGrad.addColorStop(0.0, '#ffffff');
        plateGrad.addColorStop(0.18, '#d8dce2');
        plateGrad.addColorStop(0.5, '#9fa6b2');
        plateGrad.addColorStop(0.82, '#c4c9d2');
        plateGrad.addColorStop(1.0, '#565b64');
        ctx.fillStyle = plateGrad;
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(14, 12, width - 28, height - 24, 6) : ctx.rect(14, 12, width - 28, height - 24);
        ctx.fill();
        ctx.strokeStyle = '#444850';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Embossed bold stamped letters: "4 R U N N E R" (Photo 2)
        const text = '4 R U N N E R';
        ctx.font = '900 48px -apple-system, BlinkMacSystemFont, "Impact", "Arial Black", sans-serif';
        ctx.textAlign = 'center';

        // Letter drop shadow for deep stamped effect
        ctx.fillStyle = '#1c1f24';
        ctx.fillText(text, width * 0.5 + 2, height * 0.5 + 17);

        // Letter top highlight
        ctx.fillStyle = '#ffffff';
        ctx.fillText(text, width * 0.5 - 1, height * 0.5 + 13);

        // Letter metallic face
        const textGrad = ctx.createLinearGradient(0, 20, 0, height - 20);
        textGrad.addColorStop(0.0, '#e8ecf2');
        textGrad.addColorStop(0.4, '#b0b6c2');
        textGrad.addColorStop(0.7, '#727884');
        textGrad.addColorStop(1.0, '#363a42');
        ctx.fillStyle = textGrad;
        ctx.fillText(text, width * 0.5, height * 0.5 + 15);

        // Reverse camera / keyhole notch in garnish
        ctx.fillStyle = '#181a1d';
        ctx.beginPath();
        ctx.arc(width * 0.84, height * 0.5, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#8a919d';
        ctx.lineWidth = 2;
        ctx.stroke();

        const texture = new THREE.CanvasTexture(canvas);
        this.cache['4runnerGarnish'] = texture;
        return texture;
    }

    // 10l. Toyota 4Runner Projector Headlight Lens & Amber Flanker (Photo 0)
    create4RunnerHeadlightTexture(width = 512, height = 256) {
        if (this.cache['4runnerHeadlight']) return this.cache['4runnerHeadlight'];
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        // Dark chrome internal housing
        const bgGrad = ctx.createRadialGradient(width * 0.4, height * 0.5, 30, width * 0.4, height * 0.5, width * 0.6);
        bgGrad.addColorStop(0.0, '#2e333a');
        bgGrad.addColorStop(0.6, '#181b20');
        bgGrad.addColorStop(1.0, '#0c0d10');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, width, height);

        // Faceted Chrome Reflector Cavity
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
        ctx.lineWidth = 1.5;
        for (let r = 20; r < 140; r += 16) {
            ctx.beginPath();
            ctx.arc(width * 0.38, height * 0.5, r, 0, Math.PI * 2);
            ctx.stroke();
        }

        // Circular Chrome Projector Bezel
        const projX = width * 0.38;
        const projY = height * 0.5;
        const ringGrad = ctx.createLinearGradient(projX - 55, projY - 55, projX + 55, projY + 55);
        ringGrad.addColorStop(0.0, '#ffffff');
        ringGrad.addColorStop(0.5, '#7f8794');
        ringGrad.addColorStop(1.0, '#20242b');
        ctx.strokeStyle = ringGrad;
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.arc(projX, projY, 52, 0, Math.PI * 2);
        ctx.stroke();

        // Projector Glass Eyeball Lens
        const lensGrad = ctx.createRadialGradient(projX - 12, projY - 12, 6, projX, projY, 44);
        lensGrad.addColorStop(0.0, '#ffffff');
        lensGrad.addColorStop(0.35, '#dbeafe');
        lensGrad.addColorStop(0.75, '#60a5fa');
        lensGrad.addColorStop(1.0, '#1e3a8a');
        ctx.fillStyle = lensGrad;
        ctx.beginPath();
        ctx.arc(projX, projY, 44, 0, Math.PI * 2);
        ctx.fill();

        // Inner High Beam Reflector (Left side)
        ctx.fillStyle = '#282d36';
        ctx.beginPath();
        ctx.arc(width * 0.72, height * 0.5, 38, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#c4cdd8';
        ctx.lineWidth = 4;
        ctx.stroke();

        // Outer Amber Turn Indicator Flanker (Right edge - Photo 0)
        const amberGrad = ctx.createLinearGradient(width * 0.86, 0, width, height);
        amberGrad.addColorStop(0.0, '#ff9900');
        amberGrad.addColorStop(0.5, '#e65c00');
        amberGrad.addColorStop(1.0, '#b33600');
        ctx.fillStyle = amberGrad;
        ctx.beginPath();
        ctx.moveTo(width * 0.88, 14);
        ctx.lineTo(width - 8, 14);
        ctx.lineTo(width - 8, height - 14);
        ctx.lineTo(width * 0.84, height - 14);
        ctx.closePath();
        ctx.fill();

        // Amber Faceted Prisms
        ctx.strokeStyle = 'rgba(255, 230, 150, 0.4)';
        ctx.lineWidth = 2;
        for (let py = 20; py < height - 16; py += 14) {
            ctx.beginPath();
            ctx.moveTo(width * 0.86, py);
            ctx.lineTo(width - 10, py);
            ctx.stroke();
        }

        // Top Horizontal LED DRL Eyebrow (Photo 0)
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#93c5fd';
        ctx.shadowBlur = 10;
        ctx.fillRect(width * 0.14, 22, width * 0.68, 8);
        ctx.shadowBlur = 0;

        const texture = new THREE.CanvasTexture(canvas);
        this.cache['4runnerHeadlight'] = texture;
        return texture;
    }

    // 10m. Toyota 4Runner Vertical Taillight Cluster (Photo 2)
    create4RunnerTaillightTexture(width = 256, height = 512) {
        if (this.cache['4runnerTaillight']) return this.cache['4runnerTaillight'];
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        // Black outer housing frame
        ctx.fillStyle = '#0f1114';
        ctx.fillRect(0, 0, width, height);

        // TOP HALF: Clear Crystalline Reverse & Turn Signal Lens (Photo 2)
        const topH = height * 0.46;
        const clearGrad = ctx.createLinearGradient(0, 12, 0, topH);
        clearGrad.addColorStop(0.0, '#424854');
        clearGrad.addColorStop(0.3, '#2a2f38');
        clearGrad.addColorStop(0.7, '#181b22');
        clearGrad.addColorStop(1.0, '#0f1116');
        ctx.fillStyle = clearGrad;
        ctx.fillRect(12, 12, width - 24, topH - 12);

        // Clear Honeycomb / Reflector Pods
        ctx.strokeStyle = 'rgba(220, 230, 245, 0.45)';
        ctx.lineWidth = 2;
        for (let ty = 28; ty < topH - 16; ty += 26) {
            for (let tx = 28; tx < width - 28; tx += 28) {
                ctx.beginPath();
                ctx.arc(tx, ty, 9, 0, Math.PI * 2);
                ctx.stroke();
            }
        }

        // BOTTOM HALF: Deep Ruby Red Faceted LED Brake Light (Photo 2)
        const botY = topH + 8;
        const botH = height - botY - 12;
        const redGrad = ctx.createLinearGradient(0, botY, 0, height - 12);
        redGrad.addColorStop(0.0, '#bd1111');
        redGrad.addColorStop(0.35, '#870a0a');
        redGrad.addColorStop(0.7, '#520404');
        redGrad.addColorStop(1.0, '#2e0202');
        ctx.fillStyle = redGrad;
        ctx.fillRect(12, botY, width - 24, botH);

        // Glowing LED matrix squares in the red zone
        for (let ry = botY + 22; ry < height - 32; ry += 32) {
            for (let rx = 28; rx < width - 28; rx += 34) {
                ctx.fillStyle = '#ff2e2e';
                ctx.fillRect(rx, ry, 22, 18);
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(rx + 6, ry + 4, 10, 10);
            }
        }

        // Outer Red Perimeter C-Guide border
        ctx.strokeStyle = '#ff3333';
        ctx.lineWidth = 6;
        ctx.strokeRect(16, botY + 4, width - 32, botH - 8);

        // Outer Protective Polycarbonate Border
        ctx.strokeStyle = '#2b3038';
        ctx.lineWidth = 6;
        ctx.strokeRect(6, 6, width - 12, height - 12);

        const texture = new THREE.CanvasTexture(canvas);
        this.cache['4runnerTaillight'] = texture;
        return texture;
    }

    // 10n. Toyota 4Runner 6-Spoke Silver Alloy Off-Road Wheel Rim (Photo 1)
    create4RunnerWheelTexture(size = 512) {
        if (this.cache['4runnerWheel']) return this.cache['4runnerWheel'];
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        const cx = size * 0.5;
        const cy = size * 0.5;
        const rOuter = size * 0.48;

        // Dark gunmetal wheel well barrel
        ctx.fillStyle = '#14171a';
        ctx.beginPath();
        ctx.arc(cx, cy, rOuter, 0, Math.PI * 2);
        ctx.fill();

        // Silver Machined Outer Rim Lip
        const lipGrad = ctx.createLinearGradient(0, 0, size, size);
        lipGrad.addColorStop(0.0, '#ffffff');
        lipGrad.addColorStop(0.4, '#c8ced8');
        lipGrad.addColorStop(0.7, '#8f96a4');
        lipGrad.addColorStop(1.0, '#ffffff');
        ctx.strokeStyle = lipGrad;
        ctx.lineWidth = 22;
        ctx.beginPath();
        ctx.arc(cx, cy, rOuter - 11, 0, Math.PI * 2);
        ctx.stroke();

        // 6 Muscular Chunky Silver Spokes (Photo 1)
        for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI) / 3;
            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(angle);

            // Spoke shadow bevel
            ctx.fillStyle = '#4c525c';
            ctx.beginPath();
            ctx.moveTo(-34, 40);
            ctx.lineTo(-44, rOuter - 24);
            ctx.lineTo(44, rOuter - 24);
            ctx.lineTo(34, 40);
            ctx.closePath();
            ctx.fill();

            // Spoke silver brushed face
            const spokeGrad = ctx.createLinearGradient(-30, 0, 30, rOuter);
            spokeGrad.addColorStop(0.0, '#f2f5f9');
            spokeGrad.addColorStop(0.5, '#c8cfda');
            spokeGrad.addColorStop(1.0, '#a4abb8');
            ctx.fillStyle = spokeGrad;
            ctx.beginPath();
            ctx.moveTo(-28, 44);
            ctx.lineTo(-38, rOuter - 28);
            ctx.lineTo(38, rOuter - 28);
            ctx.lineTo(28, 44);
            ctx.closePath();
            ctx.fill();

            // Spoke center groove flute
            ctx.fillStyle = '#2d3138';
            ctx.fillRect(-6, 56, 12, rOuter * 0.62);

            ctx.restore();
        }

        // Center Hub
        ctx.fillStyle = '#a6adb8';
        ctx.beginPath();
        ctx.arc(cx, cy, 62, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#5a616d';
        ctx.lineWidth = 5;
        ctx.stroke();

        // 6 Chrome Lug Nuts
        for (let j = 0; j < 6; j++) {
            const la = (j * Math.PI) / 3 + Math.PI / 6;
            const lx = cx + Math.cos(la) * 44;
            const ly = cy + Math.sin(la) * 44;
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(lx, ly, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#33373e';
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        // Center Toyota 3-Oval Logo Cap
        ctx.strokeStyle = '#282b30';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(cx, cy, 22, 15, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(cx, cy, 9, 14, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(cx, cy - 3, 16, 7, 0, 0, Math.PI * 2);
        ctx.stroke();

        const texture = new THREE.CanvasTexture(canvas);
        this.cache['4runnerWheel'] = texture;
        return texture;
    }

    // 10j. High-Definition Asphalt Road Texture with Stone Aggregate & Markings
    // 10j. Photorealistic 2-Lane Asphalt Highway Texture (Double-Wide with Dual-Lane Markings)
    createAsphaltRoadTexture(width = 512, height = 512) {
        if (this.cache['asphaltRoad']) return this.cache['asphaltRoad'];
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        // Dark weathered bitumen base
        ctx.fillStyle = '#202124';
        ctx.fillRect(0, 0, width, height);

        // Micro-aggregate mineral noise (fine crushed stone aggregate)
        const imgData = ctx.getImageData(0, 0, width, height);
        const data = imgData.data;
        for (let i = 0; i < data.length; i += 4) {
            const noise = (Math.random() - 0.5) * 40;
            data[i] = Math.min(255, Math.max(0, data[i] + noise));
            data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
            data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise * 1.08));
        }
        ctx.putImageData(imgData, 0, 0);

        // 2-Lane Dual Tire Burnish Grooves (worn rubber wheel tracks in BOTH lanes)
        // Left Lane (0.0 to 0.5): tracks at 0.18 and 0.36
        // Right Lane (0.5 to 1.0): tracks at 0.64 and 0.82
        const burnishGrad = ctx.createLinearGradient(0, 0, width, 0);
        burnishGrad.addColorStop(0.00, 'rgba(22, 23, 26, 0.3)');
        burnishGrad.addColorStop(0.18, 'rgba(10, 11, 13, 0.65)'); // Left lane outer tire track
        burnishGrad.addColorStop(0.27, 'rgba(32, 33, 37, 0.15)');
        burnishGrad.addColorStop(0.36, 'rgba(10, 11, 13, 0.65)'); // Left lane inner tire track
        burnishGrad.addColorStop(0.48, 'rgba(26, 27, 30, 0.1)');  // Center crown
        burnishGrad.addColorStop(0.52, 'rgba(26, 27, 30, 0.1)');
        burnishGrad.addColorStop(0.64, 'rgba(10, 11, 13, 0.65)'); // Right lane inner tire track
        burnishGrad.addColorStop(0.73, 'rgba(32, 33, 37, 0.15)');
        burnishGrad.addColorStop(0.82, 'rgba(10, 11, 13, 0.65)'); // Right lane outer tire track
        burnishGrad.addColorStop(1.00, 'rgba(22, 23, 26, 0.3)');
        ctx.fillStyle = burnishGrad;
        ctx.fillRect(0, 0, width, height);

        // Center Double-Yellow Divider Lines (Standard 2-Lane Highway)
        ctx.strokeStyle = '#f5be18';
        ctx.lineWidth = 5;
        ctx.setLineDash([]);
        // Left center line
        ctx.beginPath();
        ctx.moveTo(width * 0.485, 0);
        ctx.lineTo(width * 0.485, height);
        ctx.stroke();
        // Right center line
        ctx.beginPath();
        ctx.moveTo(width * 0.515, 0);
        ctx.lineTo(width * 0.515, height);
        ctx.stroke();

        // Retroreflective amber center road markers (cat's eyes every 48px)
        ctx.fillStyle = '#ffe066';
        for (let y = 12; y < height; y += 48) {
            ctx.fillRect(width * 0.5 - 2, y, 4, 8);
        }

        // Outer Solid White Shoulder / Fog Lines
        ctx.strokeStyle = '#f0f3f6';
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.moveTo(width * 0.06, 0);
        ctx.lineTo(width * 0.06, height);
        ctx.moveTo(width * 0.94, 0);
        ctx.lineTo(width * 0.94, height);
        ctx.stroke();

        // Shoulder margins outside white lines (gravel / weathered edge)
        ctx.fillStyle = 'rgba(15, 15, 17, 0.4)';
        ctx.fillRect(0, 0, width * 0.05, height);
        ctx.fillRect(width * 0.95, 0, width * 0.05, height);

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        this.cache['asphaltRoad'] = texture;
        return texture;
    }

    // 10k. Procedural Wave Normal Map for Animated Ocean Ripples
    createWaterNormalMap(size = 512) {
        if (this.cache['waterNormal']) return this.cache['waterNormal'];
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        const imgData = ctx.createImageData(size, size);
        const data = imgData.data;

        // Generate high-frequency Trochoidal/Gerstner wave normals
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                const u = (x / size) * Math.PI * 8;
                const v = (y / size) * Math.PI * 8;

                const dx = Math.sin(u * 1.5 + v * 0.8) * 0.4 + Math.sin(u * 3.2 - v * 2.1) * 0.25;
                const dy = Math.cos(v * 1.4 - u * 0.7) * 0.4 + Math.cos(v * 3.1 + u * 2.2) * 0.25;

                // Tangent-space normal vector (Nx, Ny, Nz) mapped to RGB (0-255)
                const nx = Math.max(-1, Math.min(1, dx));
                const ny = Math.max(-1, Math.min(1, dy));
                const nz = Math.sqrt(Math.max(0.01, 1 - nx * nx - ny * ny));

                const idx = (y * size + x) * 4;
                data[idx] = Math.floor((nx * 0.5 + 0.5) * 255);     // R -> X
                data[idx + 1] = Math.floor((ny * 0.5 + 0.5) * 255); // G -> Y
                data[idx + 2] = Math.floor((nz * 0.5 + 0.5) * 255); // B -> Z
                data[idx + 3] = 255;
            }
        }
        ctx.putImageData(imgData, 0, 0);

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(16, 16);
        this.cache['waterNormal'] = texture;
        return texture;
    }

    // 10l. Modern Architectural High-Rise Facade with Windows & Mullions
    createBuildingFacadeTexture(width = 512, height = 512) {
        if (this.cache['buildingFacade']) return this.cache['buildingFacade'];
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        // Dark granite/concrete structural piers
        ctx.fillStyle = '#2b2d33';
        ctx.fillRect(0, 0, width, height);

        // Window grid: 8 floors x 8 bays
        const floors = 8;
        const bays = 8;
        const bayW = width / bays;
        const floorH = height / floors;

        for (let f = 0; f < floors; f++) {
            const y = f * floorH;
            for (let b = 0; b < bays; b++) {
                const x = b * bayW;

                // Glass window pane with sky reflection tint
                const winGrad = ctx.createLinearGradient(x, y, x + bayW, y + floorH);
                winGrad.addColorStop(0.0, '#36495a');
                winGrad.addColorStop(0.5, '#1e2933');
                winGrad.addColorStop(1.0, '#131b22');
                ctx.fillStyle = winGrad;
                ctx.fillRect(x + 5, y + 6, bayW - 10, floorH - 12);

                // Subtle interior office lighting glints (randomized for realism)
                if ((f * 3 + b * 7) % 5 === 0) {
                    ctx.fillStyle = 'rgba(255, 235, 170, 0.45)';
                    ctx.fillRect(x + 8, y + floorH * 0.4, bayW - 16, 8);
                }

                // Window mullions (metallic frames)
                ctx.strokeStyle = '#484d56';
                ctx.lineWidth = 2;
                ctx.strokeRect(x + 5, y + 6, bayW - 10, floorH - 12);
                ctx.beginPath();
                ctx.moveTo(x + bayW * 0.5, y + 6);
                ctx.lineTo(x + bayW * 0.5, y + floorH - 6);
                ctx.stroke();
            }

            // Concrete spandrel band between floors
            ctx.fillStyle = '#3a3d45';
            ctx.fillRect(0, y + floorH - 4, width, 4);
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        this.cache['buildingFacade'] = texture;
        return texture;
    }

    // 10l-0. Style 0: Limestone Art Deco Tower Facade (Photo 0: 30 Park Place / 220 CPS style)
    createLimestoneArtDecoTexture(width = 512, height = 512) {
        if (this.cache['limestoneArtDeco']) return this.cache['limestoneArtDeco'];
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        // Warm buff / creamy limestone base
        ctx.fillStyle = '#d6c9ad';
        ctx.fillRect(0, 0, width, height);

        // Subtle fine limestone sedimentary grain
        for (let i = 0; i < 600; i++) {
            const gx = Math.random() * width;
            const gy = Math.random() * height;
            ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255, 255, 255, 0.12)' : 'rgba(120, 105, 80, 0.08)';
            ctx.fillRect(gx, gy, 2 + Math.random() * 4, 1 + Math.random() * 3);
        }

        // Slender vertical Art Deco bays (6 bays x 8 floors)
        const floors = 8;
        const bays = 6;
        const bayW = width / bays;
        const floorH = height / floors;

        // Vertical continuous limestone piers
        for (let b = 0; b <= bays; b++) {
            const px = b * bayW;
            ctx.fillStyle = '#c7b99b';
            ctx.fillRect(px - 3, 0, 6, height);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
            ctx.fillRect(px - 1, 0, 2, height);
        }

        // Punched rectangular windows with deep stone reveals
        for (let f = 0; f < floors; f++) {
            const y = f * floorH;
            for (let b = 0; b < bays; b++) {
                const x = b * bayW;
                const wx = x + 8;
                const wy = y + 8;
                const ww = bayW - 16;
                const wh = floorH - 16;

                // Deep reveal shadow
                ctx.fillStyle = '#8f836c';
                ctx.fillRect(wx - 2, wy - 2, ww + 4, wh + 4);

                // Tinted architectural glass
                const glassGrad = ctx.createLinearGradient(wx, wy, wx, wy + wh);
                glassGrad.addColorStop(0.0, '#2e3d48');
                glassGrad.addColorStop(0.4, '#1b252c');
                glassGrad.addColorStop(1.0, '#12181c');
                ctx.fillStyle = glassGrad;
                ctx.fillRect(wx, wy, ww, wh);

                // Luxury warm interior amber light in select windows
                if ((f * 5 + b * 11) % 4 === 0) {
                    ctx.fillStyle = 'rgba(255, 228, 160, 0.55)';
                    ctx.fillRect(wx + 2, wy + wh * 0.45, ww - 4, wh * 0.4);
                }

                // Dark bronze window frame & mullion
                ctx.strokeStyle = '#221e1a';
                ctx.lineWidth = 1.5;
                ctx.strokeRect(wx, wy, ww, wh);
                ctx.beginPath();
                ctx.moveTo(wx + ww * 0.5, wy);
                ctx.lineTo(wx + ww * 0.5, wy + wh);
                ctx.stroke();

                // Spandrel panel between floors: Art Deco fluting
                ctx.fillStyle = '#c4b699';
                ctx.fillRect(x + 5, y + floorH - 6, bayW - 10, 5);
                ctx.fillStyle = '#9e9176';
                ctx.fillRect(x + 6, y + floorH - 2, bayW - 12, 1);
            }
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        this.cache['limestoneArtDeco'] = texture;
        return texture;
    }

    // 10l-1. Style 1: Chicago Romanesque Red Brick & Terracotta (Photo 1)
    createRedBrickRomanesqueTexture(width = 512, height = 512) {
        if (this.cache['redBrickRomanesque']) return this.cache['redBrickRomanesque'];
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        // Deep terracotta red brick base
        ctx.fillStyle = '#833425';
        ctx.fillRect(0, 0, width, height);

        // Brick mortar courses
        const brickH = 8;
        const brickW = 20;
        ctx.fillStyle = '#4e2319';
        for (let y = 0; y < height; y += brickH) {
            ctx.fillRect(0, y, width, 1.5);
            const rowOffset = (Math.floor(y / brickH) % 2) * (brickW * 0.5);
            for (let x = rowOffset; x < width; x += brickW) {
                ctx.fillRect(x, y, 1.5, brickH);
            }
        }

        // Slight brick color variation
        for (let i = 0; i < 400; i++) {
            const bx = Math.floor(Math.random() * (width / brickW)) * brickW;
            const by = Math.floor(Math.random() * (height / brickH)) * brickH;
            ctx.fillStyle = Math.random() > 0.5 ? 'rgba(168, 70, 50, 0.35)' : 'rgba(90, 30, 20, 0.4)';
            ctx.fillRect(bx + 1, by + 1, brickW - 2, brickH - 2);
        }

        // Windows: 6 bays x 8 floors
        const floors = 8;
        const bays = 6;
        const bayW = width / bays;
        const floorH = height / floors;

        for (let f = 0; f < floors; f++) {
            const y = f * floorH;
            const isArchedTopTier = (f < 2); // Top 2 floors have round Romanesque arched windows!

            for (let b = 0; b < bays; b++) {
                const x = b * bayW;
                const wx = x + 10;
                const wy = y + 10;
                const ww = bayW - 20;
                const wh = floorH - 18;

                if (isArchedTopTier) {
                    // Round Romanesque arch top
                    const archRadius = ww * 0.5;
                    const archCenterY = wy + archRadius;

                    // Stone arch voussoirs / surround
                    ctx.fillStyle = '#baa895';
                    ctx.beginPath();
                    ctx.arc(wx + archRadius, archCenterY, archRadius + 4, Math.PI, 0, false);
                    ctx.lineTo(wx + ww + 4, wy + wh);
                    ctx.lineTo(wx - 4, wy + wh);
                    ctx.closePath();
                    ctx.fill();

                    // Glass arch pane
                    ctx.fillStyle = '#17222c';
                    ctx.beginPath();
                    ctx.arc(wx + archRadius, archCenterY, archRadius, Math.PI, 0, false);
                    ctx.lineTo(wx + ww, wy + wh);
                    ctx.lineTo(wx, wy + wh);
                    ctx.closePath();
                    ctx.fill();

                    // Dark frame
                    ctx.strokeStyle = '#2d1e15';
                    ctx.lineWidth = 2;
                    ctx.stroke();
                } else {
                    // Rectangular window with stone lintel & sill
                    // Stone lintel (top)
                    ctx.fillStyle = '#baa895';
                    ctx.fillRect(wx - 2, wy - 4, ww + 4, 4);

                    // Stone sill (bottom)
                    ctx.fillRect(wx - 4, wy + wh, ww + 8, 4);

                    // Glass pane
                    ctx.fillStyle = '#17222c';
                    ctx.fillRect(wx, wy, ww, wh);

                    // Mullions
                    ctx.strokeStyle = '#2d1e15';
                    ctx.lineWidth = 1.5;
                    ctx.strokeRect(wx, wy, ww, wh);
                    ctx.beginPath();
                    ctx.moveTo(wx + ww * 0.5, wy);
                    ctx.lineTo(wx + ww * 0.5, wy + wh);
                    ctx.moveTo(wx, wy + wh * 0.5);
                    ctx.lineTo(wx + ww, wy + wh * 0.5);
                    ctx.stroke();
                }

                // Random warm lighting glint
                if ((f * 7 + b * 13) % 4 === 1) {
                    ctx.fillStyle = 'rgba(255, 230, 165, 0.4)';
                    ctx.fillRect(wx + 2, wy + wh * 0.5, ww - 4, wh * 0.4);
                }
            }

            // Terracotta beltcourse between floors
            ctx.fillStyle = '#68291c';
            ctx.fillRect(0, y + floorH - 3, width, 3);
            ctx.fillStyle = '#baa895';
            ctx.fillRect(0, y + floorH - 1, width, 1.5);
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        this.cache['redBrickRomanesque'] = texture;
        return texture;
    }

    // 10l-1b. Heavy Rusticated Granite/Sandstone Podium Base (Photos 1 & 3)
    createRusticatedStoneTexture(width = 512, height = 512) {
        if (this.cache['rusticatedStone']) return this.cache['rusticatedStone'];
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        // Grey-buff coarse granite stone
        ctx.fillStyle = '#9c9285';
        ctx.fillRect(0, 0, width, height);

        // Heavy ashlar stone blocks
        const blockH = 48;
        const blockW = 128;
        for (let y = 0; y < height; y += blockH) {
            const row = Math.floor(y / blockH);
            const xOff = (row % 2) * (blockW * 0.5);

            for (let x = -blockW * 0.5 + xOff; x < width + blockW; x += blockW) {
                // Pillow face / bevel highlight & shadow
                const shade = 145 + Math.floor(Math.random() * 25);
                ctx.fillStyle = `rgb(${shade + 5}, ${shade}, ${shade - 10})`;
                ctx.fillRect(x + 4, y + 4, blockW - 8, blockH - 8);

                // Deep rusticated V-groove shadow
                ctx.strokeStyle = '#433d36';
                ctx.lineWidth = 4;
                ctx.strokeRect(x + 2, y + 2, blockW - 4, blockH - 4);

                // Top highlight line
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(x + 4, y + 4);
                ctx.lineTo(x + blockW - 4, y + 4);
                ctx.stroke();
            }
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        this.cache['rusticatedStone'] = texture;
        return texture;
    }

    // 10l-2. Style 2: Curvilinear Modern Ribbon Balconies & Glass Curtain Wall (Photo 2)
    createCurvilinearGlassTexture(width = 512, height = 512) {
        if (this.cache['curvilinearGlass']) return this.cache['curvilinearGlass'];
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        // Dark tinted blue-grey structural glass curtain wall
        ctx.fillStyle = '#182430';
        ctx.fillRect(0, 0, width, height);

        const floors = 8;
        const floorH = height / floors;

        for (let f = 0; f < floors; f++) {
            const y = f * floorH;

            // Subtle vertical mullions (high tech floor-to-ceiling glass)
            const mullions = 12;
            const mw = width / mullions;
            for (let m = 0; m < mullions; m++) {
                const x = m * mw;
                // Tint gradient
                const grad = ctx.createLinearGradient(x, y, x, y + floorH);
                grad.addColorStop(0.0, '#2d4358');
                grad.addColorStop(0.5, '#192532');
                grad.addColorStop(1.0, '#10171f');
                ctx.fillStyle = grad;
                ctx.fillRect(x + 2, y + 8, mw - 4, floorH - 12);

                // Ultra slim dark mullion
                ctx.fillStyle = '#0e141a';
                ctx.fillRect(x, y, 2, floorH);

                // Occasional interior warm spotlight
                if ((f * 3 + m * 5) % 6 === 0) {
                    ctx.fillStyle = 'rgba(255, 240, 200, 0.35)';
                    ctx.fillRect(x + 6, y + floorH * 0.35, mw - 12, 10);
                }
            }

            // White aerodynamic slab trim band
            ctx.fillStyle = '#f3f6fa';
            ctx.fillRect(0, y + floorH - 6, width, 6);
            ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
            ctx.fillRect(0, y + floorH - 1, width, 1.5);
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        this.cache['curvilinearGlass'] = texture;
        return texture;
    }

    // 10l-3. Style 3: Beaux-Arts Classical Facade with Pediments & Quoins (Photo 3)
    createBeauxArtsFacadeTexture(width = 512, height = 512) {
        if (this.cache['beauxArtsFacade']) return this.cache['beauxArtsFacade'];
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        // Warm light grey-limestone classical facade
        ctx.fillStyle = '#cdc5b7';
        ctx.fillRect(0, 0, width, height);

        // Quoin stones on borders
        const quoinW = 24;
        const quoinH = 20;
        for (let y = 0; y < height; y += quoinH) {
            const isLong = (Math.floor(y / quoinH) % 2 === 0);
            const qw = isLong ? quoinW : quoinW * 0.65;
            ctx.fillStyle = '#b8af9f';
            ctx.fillRect(0, y + 1, qw, quoinH - 2);
            ctx.fillRect(width - qw, y + 1, qw, quoinH - 2);
            ctx.strokeStyle = '#9e9587';
            ctx.strokeRect(0, y + 1, qw, quoinH - 2);
            ctx.strokeRect(width - qw, y + 1, qw, quoinH - 2);
        }

        // 5 bays x 8 floors
        const floors = 8;
        const bays = 5;
        const bayW = (width - quoinW * 2) / bays;
        const floorH = height / floors;

        for (let f = 0; f < floors; f++) {
            const y = f * floorH;
            const hasPediment = (f % 2 === 0); // Alternating floors have triangular pediments!
            const isArchedTop = (f < 2);

            for (let b = 0; b < bays; b++) {
                const x = quoinW + b * bayW;
                const wx = x + 12;
                const wy = y + 12;
                const ww = bayW - 24;
                const wh = floorH - 22;

                if (isArchedTop) {
                    // Arched window
                    const r = ww * 0.5;
                    ctx.fillStyle = '#a89f91';
                    ctx.beginPath();
                    ctx.arc(wx + r, wy + r, r + 4, Math.PI, 0, false);
                    ctx.lineTo(wx + ww + 4, wy + wh);
                    ctx.lineTo(wx - 4, wy + wh);
                    ctx.closePath();
                    ctx.fill();

                    ctx.fillStyle = '#1c2630';
                    ctx.beginPath();
                    ctx.arc(wx + r, wy + r, r, Math.PI, 0, false);
                    ctx.lineTo(wx + ww, wy + wh);
                    ctx.lineTo(wx, wy + wh);
                    ctx.closePath();
                    ctx.fill();
                } else {
                    // Pediment crown on window
                    if (hasPediment) {
                        ctx.fillStyle = '#b5ac9d';
                        ctx.beginPath();
                        ctx.moveTo(wx - 4, wy - 3);
                        ctx.lineTo(wx + ww * 0.5, wy - 10);
                        ctx.lineTo(wx + ww + 4, wy - 3);
                        ctx.closePath();
                        ctx.fill();
                        ctx.strokeStyle = '#8d8373';
                        ctx.lineWidth = 1.5;
                        ctx.stroke();
                    } else {
                        // Flat molded cornice over window
                        ctx.fillStyle = '#b5ac9d';
                        ctx.fillRect(wx - 4, wy - 5, ww + 8, 4);
                    }

                    // Window glass
                    ctx.fillStyle = '#1c2630';
                    ctx.fillRect(wx, wy, ww, wh);

                    // Carved stone balustrade under window
                    ctx.fillStyle = '#bbb2a3';
                    ctx.fillRect(wx - 3, wy + wh, ww + 6, 5);
                    for (let bx = wx; bx < wx + ww; bx += 6) {
                        ctx.fillStyle = '#7a7164';
                        ctx.fillRect(bx, wy + wh + 1, 2, 4);
                    }
                }

                // Window mullions
                ctx.strokeStyle = '#322c24';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(wx + ww * 0.5, wy);
                ctx.lineTo(wx + ww * 0.5, wy + wh);
                ctx.moveTo(wx, wy + wh * 0.5);
                ctx.lineTo(wx + ww, wy + wh * 0.5);
                ctx.stroke();

                // Warm interior lamp
                if ((f * 3 + b * 5) % 4 === 0) {
                    ctx.fillStyle = 'rgba(255, 230, 160, 0.45)';
                    ctx.fillRect(wx + 2, wy + wh * 0.5, ww - 4, wh * 0.45);
                }
            }

            // Classical projecting dentil cornice every 2 floors
            if (f % 2 === 1) {
                ctx.fillStyle = '#a49b8c';
                ctx.fillRect(0, y + floorH - 6, width, 6);
                ctx.fillStyle = '#746c5f';
                for (let dx = 8; dx < width - 8; dx += 12) {
                    ctx.fillRect(dx, y + floorH - 4, 6, 4);
                }
            }
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        this.cache['beauxArtsFacade'] = texture;
        return texture;
    }

    // 10l-4. Style 4: Neo-Gothic Cathedral Architectural Terra Cotta (Photo 4: Woolworth style)
    createNeoGothicFacadeTexture(width = 512, height = 512) {
        if (this.cache['neoGothicFacade']) return this.cache['neoGothicFacade'];
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        // Pale creamy architectural terra-cotta base
        ctx.fillStyle = '#dad3c5';
        ctx.fillRect(0, 0, width, height);

        // 8 bays x 8 floors
        const floors = 8;
        const bays = 8;
        const bayW = width / bays;
        const floorH = height / floors;

        // Prominent continuous vertical Gothic piers (piers continue unbroken top to bottom)
        for (let b = 0; b <= bays; b++) {
            const px = b * bayW;
            ctx.fillStyle = '#b7ae9e';
            ctx.fillRect(px - 4, 0, 8, height);
            ctx.fillStyle = '#ece8e0';
            ctx.fillRect(px - 1, 0, 2, height);
            ctx.fillStyle = '#8f8574';
            ctx.fillRect(px - 4, 0, 1.5, height);
        }

        // Gothic lancet windows with tracery
        for (let f = 0; f < floors; f++) {
            const y = f * floorH;
            for (let b = 0; b < bays; b++) {
                const x = b * bayW;
                const wx = x + 7;
                const wy = y + 7;
                const ww = bayW - 14;
                const wh = floorH - 14;

                // Gothic pointed arch hood
                ctx.fillStyle = '#c5bea0';
                ctx.beginPath();
                ctx.moveTo(wx, wy + 8);
                ctx.quadraticCurveTo(wx + ww * 0.5, wy - 3, wx + ww, wy + 8);
                ctx.lineTo(wx + ww, wy + wh);
                ctx.lineTo(wx, wy + wh);
                ctx.closePath();
                ctx.fill();

                // Dark recessed window pane
                ctx.fillStyle = '#1c252d';
                ctx.fillRect(wx + 2, wy + 4, ww - 4, wh - 6);

                // Delicate vertical Gothic tracery rib
                ctx.strokeStyle = '#c5bea0';
                ctx.lineWidth = 1.2;
                ctx.beginPath();
                ctx.moveTo(wx + ww * 0.5, wy + 2);
                ctx.lineTo(wx + ww * 0.5, wy + wh - 2);
                ctx.stroke();

                // Spandrel panel between stories: carved Gothic Quatrefoil ornament
                ctx.fillStyle = '#b7ae9e';
                ctx.fillRect(x + 5, y + floorH - 6, bayW - 10, 5);
                ctx.fillStyle = '#8f8574';
                ctx.fillRect(x + bayW * 0.5 - 2, y + floorH - 5, 4, 3);

                // Warm interior candle/light
                if ((f * 5 + b * 9) % 5 === 0) {
                    ctx.fillStyle = 'rgba(255, 235, 175, 0.45)';
                    ctx.fillRect(wx + 3, wy + wh * 0.45, ww - 6, wh * 0.45);
                }
            }
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        this.cache['neoGothicFacade'] = texture;
        return texture;
    }

    // 10l-5. Apartment Style A: Historic Industrial Warehouse Loft (Photo 0)
    createIndustrialLoftTexture(width = 512, height = 512) {
        if (this.cache['industrialLoft']) return this.cache['industrialLoft'];
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        // Weathered deep industrial red-brown brick
        ctx.fillStyle = '#733122';
        ctx.fillRect(0, 0, width, height);

        // Brick courses
        const brickH = 8;
        const brickW = 20;
        ctx.fillStyle = '#441d14';
        for (let y = 0; y < height; y += brickH) {
            ctx.fillRect(0, y, width, 1.5);
            const xOff = (Math.floor(y / brickH) % 2) * (brickW * 0.5);
            for (let x = xOff; x < width; x += brickW) {
                ctx.fillRect(x, y, 1.5, brickH);
            }
        }

        // Brick variation & weathering
        for (let i = 0; i < 350; i++) {
            const bx = Math.floor(Math.random() * (width / brickW)) * brickW;
            const by = Math.floor(Math.random() * (height / brickH)) * brickH;
            ctx.fillStyle = Math.random() > 0.5 ? 'rgba(148, 62, 42, 0.35)' : 'rgba(68, 26, 18, 0.4)';
            ctx.fillRect(bx + 1, by + 1, brickW - 2, brickH - 2);
        }

        // Brick corbel frieze along the top parapet
        ctx.fillStyle = '#572418';
        ctx.fillRect(0, 0, width, 24);
        for (let x = 6; x < width; x += 16) {
            ctx.fillStyle = '#8a3c2a';
            ctx.fillRect(x, 10, 8, 14);
            ctx.fillStyle = '#3c1810';
            ctx.fillRect(x + 1, 20, 6, 4);
        }

        // 4 floors x 6 bays (Wide warehouse loft bays)
        const floors = 4;
        const bays = 6;
        const bayW = width / bays;
        const floorH = (height - 30) / floors;

        for (let f = 0; f < floors; f++) {
            const y = 30 + f * floorH;
            for (let b = 0; b < bays; b++) {
                const x = b * bayW;
                const wx = x + 10;
                const wy = y + 10;
                const ww = bayW - 20;
                const wh = floorH - 18;

                // Segmental brick arch header
                ctx.fillStyle = '#5c251a';
                ctx.beginPath();
                ctx.arc(wx + ww * 0.5, wy + 6, ww * 0.5 + 4, Math.PI, 0, false);
                ctx.lineTo(wx + ww + 4, wy + wh);
                ctx.lineTo(wx - 4, wy + wh);
                ctx.closePath();
                ctx.fill();

                // Multi-pane factory iron grid window
                ctx.fillStyle = '#182128';
                ctx.fillRect(wx, wy + 4, ww, wh - 4);

                // Multi-pane grid (4 columns x 3 rows of small panes)
                ctx.strokeStyle = '#2c1e18';
                ctx.lineWidth = 1.5;
                for (let px = 1; px <= 3; px++) {
                    ctx.beginPath();
                    ctx.moveTo(wx + px * (ww / 4), wy + 4);
                    ctx.lineTo(wx + px * (ww / 4), wy + wh);
                    ctx.stroke();
                }
                for (let py = 1; py <= 2; py++) {
                    ctx.beginPath();
                    ctx.moveTo(wx, wy + 4 + py * ((wh - 4) / 3));
                    ctx.lineTo(wx + ww, wy + 4 + py * ((wh - 4) / 3));
                    ctx.stroke();
                }

                // Random warm cozy loft interior lighting
                if ((f * 3 + b * 7) % 3 === 0) {
                    ctx.fillStyle = 'rgba(255, 225, 150, 0.4)';
                    ctx.fillRect(wx + 4, wy + wh * 0.4, ww - 8, wh * 0.45);
                }
            }

            // Horizontal brick belt course
            ctx.fillStyle = '#4c1e15';
            ctx.fillRect(0, y + floorH - 3, width, 3);
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        this.cache['industrialLoft'] = texture;
        return texture;
    }

    // 10l-6. Apartment Style B: Classic Brick Apartment with Black Metal Fire Escape (Photo 1)
    createFireEscapeApartmentTexture(width = 512, height = 512) {
        if (this.cache['fireEscapeApartment']) return this.cache['fireEscapeApartment'];
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        // Warm vibrant red-orange brick
        ctx.fillStyle = '#8f3724';
        ctx.fillRect(0, 0, width, height);

        // Brick mortar lines
        const brickH = 8;
        const brickW = 20;
        ctx.fillStyle = '#522116';
        for (let y = 0; y < height; y += brickH) {
            ctx.fillRect(0, y, width, 1.2);
            const xOff = (Math.floor(y / brickH) % 2) * (brickW * 0.5);
            for (let x = xOff; x < width; x += brickW) {
                ctx.fillRect(x, y, 1.2, brickH);
            }
        }

        // Top decorative brick corbel parapet
        ctx.fillStyle = '#652619';
        ctx.fillRect(0, 0, width, 22);
        for (let x = 8; x < width; x += 18) {
            ctx.fillStyle = '#aa4730';
            ctx.fillRect(x, 6, 10, 16);
        }

        // 5 floors x 7 bays (Dense classic residential apartment windows)
        const floors = 5;
        const bays = 7;
        const bayW = width / bays;
        const floorH = (height - 25) / floors;

        for (let f = 0; f < floors; f++) {
            const y = 25 + f * floorH;
            const isArchedTop = (f === 0); // Top floor has round arches!

            for (let b = 0; b < bays; b++) {
                const x = b * bayW;
                const wx = x + 8;
                const wy = y + 8;
                const ww = bayW - 16;
                const wh = floorH - 14;

                if (isArchedTop) {
                    // Semicircular arched window
                    const r = ww * 0.5;
                    ctx.fillStyle = '#aa4730';
                    ctx.beginPath();
                    ctx.arc(wx + r, wy + r, r + 3, Math.PI, 0, false);
                    ctx.lineTo(wx + ww + 3, wy + wh);
                    ctx.lineTo(wx - 3, wy + wh);
                    ctx.closePath();
                    ctx.fill();

                    // Glass
                    ctx.fillStyle = '#1c2630';
                    ctx.beginPath();
                    ctx.arc(wx + r, wy + r, r, Math.PI, 0, false);
                    ctx.lineTo(wx + ww, wy + wh);
                    ctx.lineTo(wx, wy + wh);
                    ctx.closePath();
                    ctx.fill();
                } else {
                    // Segmental arch with brick lintel & stone sill
                    ctx.fillStyle = '#b55238';
                    ctx.fillRect(wx - 2, wy - 3, ww + 4, 3);
                    ctx.fillStyle = '#7a7064'; // stone sill
                    ctx.fillRect(wx - 3, wy + wh, ww + 6, 3);

                    // Window glass
                    ctx.fillStyle = '#1c2630';
                    ctx.fillRect(wx, wy, ww, wh);

                    // Multi-pane sash frame
                    ctx.strokeStyle = '#2b1b14';
                    ctx.lineWidth = 1.5;
                    ctx.strokeRect(wx, wy, ww, wh);
                    ctx.beginPath();
                    ctx.moveTo(wx + ww * 0.5, wy);
                    ctx.lineTo(wx + ww * 0.5, wy + wh);
                    ctx.moveTo(wx, wy + wh * 0.5);
                    ctx.lineTo(wx + ww, wy + wh * 0.5);
                    ctx.stroke();
                }

                // Decorative brick rosette medallion in spandrel
                if (f > 0 && (b % 2 === 0)) {
                    ctx.fillStyle = '#aa4730';
                    ctx.beginPath();
                    ctx.arc(x + bayW * 0.5, y - 2, 4, 0, Math.PI * 2);
                    ctx.fill();
                }

                // Warm interior lamp
                if ((f * 4 + b * 9) % 3 === 1) {
                    ctx.fillStyle = 'rgba(255, 235, 175, 0.45)';
                    ctx.fillRect(wx + 2, wy + wh * 0.45, ww - 4, wh * 0.45);
                }
            }
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        this.cache['fireEscapeApartment'] = texture;
        return texture;
    }

    // 10l-7. Apartment Style C: Ornate Brownstone Luxury Apartments (Photo 2)
    createBrownstoneApartmentTexture(width = 512, height = 512) {
        if (this.cache['brownstoneApartment']) return this.cache['brownstoneApartment'];
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        // Warm honey / burnt orange brick
        ctx.fillStyle = '#9b4728';
        ctx.fillRect(0, 0, width, height);

        // Ground floor: Rusticated ashlar stone base
        const groundH = height * 0.28;
        ctx.fillStyle = '#80776b';
        ctx.fillRect(0, height - groundH, width, groundH);

        // Rusticated stone blocks on ground floor
        ctx.strokeStyle = '#4e4840';
        ctx.lineWidth = 2.5;
        for (let gy = height - groundH; gy < height; gy += 28) {
            ctx.beginPath();
            ctx.moveTo(0, gy);
            ctx.lineTo(width, gy);
            ctx.stroke();
            const xOff = (Math.floor(gy / 28) % 2) * 50;
            for (let gx = xOff; gx < width; gx += 100) {
                ctx.beginPath();
                ctx.moveTo(gx, gy);
                ctx.lineTo(gx, gy + 28);
                ctx.stroke();
            }
        }

        // Grand arched ground floor portal windows & doors (3 wide bays)
        const bays = 3;
        const bayW = width / bays;
        for (let b = 0; b < bays; b++) {
            const bx = b * bayW;
            const wx = bx + 16;
            const ww = bayW - 32;
            const wy = height - groundH + 12;
            const wh = groundH - 18;
            const r = ww * 0.5;

            // Grand stone arch
            ctx.fillStyle = '#3a352e';
            ctx.beginPath();
            ctx.arc(wx + r, wy + r, r, Math.PI, 0, false);
            ctx.lineTo(wx + ww, wy + wh);
            ctx.lineTo(wx, wy + wh);
            ctx.closePath();
            ctx.fill();

            // Glass
            ctx.fillStyle = '#1c2833';
            ctx.fillRect(wx + 4, wy + r, ww - 8, wh - r);

            // Warm lobby glow
            ctx.fillStyle = 'rgba(255, 230, 160, 0.5)';
            ctx.fillRect(wx + 8, wy + r + 6, ww - 16, wh - r - 12);
        }

        // Upper 3 residential stories (Warm brick with wide studio windows)
        const upperH = height - groundH;
        const upperFloors = 3;
        const uFloorH = upperH / upperFloors;

        for (let f = 0; f < upperFloors; f++) {
            const y = f * uFloorH;
            for (let b = 0; b < bays; b++) {
                const bx = b * bayW;
                const wx = bx + 18;
                const wy = y + 14;
                const ww = bayW - 36;
                const wh = uFloorH - 24;
                const r = ww * 0.5;

                // Wide studio arched window
                ctx.fillStyle = '#7a341c';
                ctx.beginPath();
                ctx.arc(wx + r, wy + r * 0.7, r + 3, Math.PI, 0, false);
                ctx.lineTo(wx + ww + 3, wy + wh);
                ctx.lineTo(wx - 3, wy + wh);
                ctx.closePath();
                ctx.fill();

                // Glass
                ctx.fillStyle = '#1b242e';
                ctx.fillRect(wx, wy + r * 0.7, ww, wh - r * 0.7);

                // Luxury warm interior drapery highlights
                ctx.fillStyle = 'rgba(255, 220, 160, 0.4)';
                ctx.fillRect(wx + 4, wy + wh * 0.35, ww - 8, wh * 0.55);

                // Window mullions (dark bronze)
                ctx.strokeStyle = '#221914';
                ctx.lineWidth = 2;
                ctx.strokeRect(wx, wy + r * 0.7, ww, wh - r * 0.7);
                ctx.beginPath();
                ctx.moveTo(wx + ww * 0.5, wy);
                ctx.lineTo(wx + ww * 0.5, wy + wh);
                ctx.stroke();
            }

            // Classical belt cornice between floors
            ctx.fillStyle = '#5c2616';
            ctx.fillRect(0, y + uFloorH - 4, width, 4);
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        this.cache['brownstoneApartment'] = texture;
        return texture;
    }


    // 10m. Street-Level Retail Storefront Texture
    createStorefrontTexture(width = 512, height = 256) {
        if (this.cache['storefront']) return this.cache['storefront'];
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        // Dark polished stone base
        ctx.fillStyle = '#1c1d21';
        ctx.fillRect(0, 0, width, height);

        // Large display windows
        const displays = 3;
        const dw = width / displays;
        for (let i = 0; i < displays; i++) {
            const x = i * dw;

            // Warm interior illuminated boutique display
            const winGrad = ctx.createLinearGradient(x, 20, x, height - 20);
            winGrad.addColorStop(0.0, '#2d2e33');
            winGrad.addColorStop(0.4, '#fff0c7');
            winGrad.addColorStop(1.0, '#383020');
            ctx.fillStyle = winGrad;
            ctx.fillRect(x + 12, 24, dw - 24, height - 48);

            // Frame & canopy awning
            ctx.strokeStyle = '#0e0f12';
            ctx.lineWidth = 6;
            ctx.strokeRect(x + 12, 24, dw - 24, height - 48);

            // Awning header
            ctx.fillStyle = '#18191c';
            ctx.fillRect(x + 8, 8, dw - 16, 20);
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        this.cache['storefront'] = texture;
        return texture;
    }

    // 10n. Stratified Cliff Rock Texture with Sedimentary Fractures
    createCliffRockTexture(size = 512) {
        if (this.cache['cliffRock']) return this.cache['cliffRock'];
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        // Grey-brown weathered rock base
        ctx.fillStyle = '#4e4c47';
        ctx.fillRect(0, 0, size, size);

        // Directional horizontal sedimentary stratification layers
        for (let y = 0; y < size; y += 8 + Math.random() * 14) {
            const shade = 55 + Math.floor(Math.random() * 40);
            ctx.fillStyle = `rgb(${shade + 10}, ${shade}, ${shade - 5})`;
            ctx.fillRect(0, y, size, 6 + Math.random() * 8);

            // Deep fracture shadow lines
            ctx.strokeStyle = '#23221f';
            ctx.lineWidth = 1.5 + Math.random() * 2.5;
            ctx.beginPath();
            ctx.moveTo(0, y + (Math.random() - 0.5) * 6);
            for (let x = 40; x <= size; x += 40) {
                ctx.lineTo(x, y + (Math.random() - 0.5) * 8);
            }
            ctx.stroke();
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        this.cache['cliffRock'] = texture;
        return texture;
    }

    // 10o. Ambient Occlusion Wheel Ground Contact Shadow Decal
    createWheelShadowTexture(size = 256) {
        if (this.cache['wheelShadow']) return this.cache['wheelShadow'];
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        const radGrad = ctx.createRadialGradient(size * 0.5, size * 0.5, 10, size * 0.5, size * 0.5, size * 0.48);
        radGrad.addColorStop(0.0, 'rgba(0, 0, 0, 0.75)');
        radGrad.addColorStop(0.35, 'rgba(0, 0, 0, 0.55)');
        radGrad.addColorStop(0.7, 'rgba(0, 0, 0, 0.2)');
        radGrad.addColorStop(1.0, 'rgba(0, 0, 0, 0.0)');
        ctx.fillStyle = radGrad;
        ctx.fillRect(0, 0, size, size);

        const texture = new THREE.CanvasTexture(canvas);
        this.cache['wheelShadow'] = texture;
        return texture;
    }

    // 10p. 3D Individual Grass Blade Texture for GPU-Instanced Tufts
    createGrassBladeTexture(width = 256, height = 512) {
        if (this.cache['grassBlade']) return this.cache['grassBlade'];
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        // Transparent background
        ctx.clearRect(0, 0, width, height);

        // Multiple natural curving grass blades in a cluster matching dark green lush turf
        const bladeColors = ['#11570a', '#156b0d', '#187a11', '#1b8513', '#177f10', '#1a8511', '#209117'];
        const count = 16;

        for (let i = 0; i < count; i++) {
            const rootX = width * 0.5 + (Math.random() - 0.5) * 60;
            const rootY = height;
            const tipX = rootX + (Math.random() - 0.5) * 160;
            const tipY = height * (0.05 + Math.random() * 0.35);
            const ctrlX = (rootX + tipX) * 0.5 + (Math.random() - 0.5) * 80;
            const ctrlY = (rootY + tipY) * 0.5;

            const bladeGrad = ctx.createLinearGradient(rootX, rootY, tipX, tipY);
            bladeGrad.addColorStop(0.0, '#0b3806'); // Dark forest root
            bladeGrad.addColorStop(0.4, bladeColors[i % bladeColors.length]);
            bladeGrad.addColorStop(1.0, '#2fc423'); // Dark green sunlit tip


            ctx.strokeStyle = bladeGrad;
            ctx.lineWidth = 14 + Math.random() * 8;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(rootX, rootY);
            ctx.quadraticCurveTo(ctrlX, ctrlY, tipX, tipY);
            ctx.stroke();
        }

        const texture = new THREE.CanvasTexture(canvas);
        this.cache['grassBlade'] = texture;
        return texture;
    }

    // 11. Photorealistic Sky Dome Texture with realistic clouds
    createSkyTexture(width = 2048, height = 1024) {
        if (this.cache['sky']) return this.cache['sky'];
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        // Atmospheric Rayleigh gradient (deep azure blue at zenith to warm pale cyan/haze at horizon)
        const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
        skyGrad.addColorStop(0.0, '#1c5aa6'); // Deep zenith blue
        skyGrad.addColorStop(0.45, '#3b88d8'); // Mid sky
        skyGrad.addColorStop(0.78, '#82bcf2'); // Lower sky
        skyGrad.addColorStop(0.92, '#bfe1fb'); // Atmospheric haze
        skyGrad.addColorStop(1.0, '#d9ebf7');  // Horizon glow
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, width, height);

        // Sun disc and golden solar glow
        const sunX = width * 0.72;
        const sunY = height * 0.32;
        const sunGlow = ctx.createRadialGradient(sunX, sunY, 10, sunX, sunY, 400);
        sunGlow.addColorStop(0.0, 'rgba(255, 255, 245, 1.0)');
        sunGlow.addColorStop(0.08, 'rgba(255, 250, 220, 0.9)');
        sunGlow.addColorStop(0.25, 'rgba(255, 235, 190, 0.45)');
        sunGlow.addColorStop(0.6, 'rgba(255, 220, 160, 0.12)');
        sunGlow.addColorStop(1.0, 'rgba(255, 255, 255, 0.0)');
        ctx.fillStyle = sunGlow;
        ctx.fillRect(0, 0, width, height);

        // Fluffy layered cumulus clouds
        for (let c = 0; c < 28; c++) {
            const cx = Math.random() * width;
            const cy = height * 0.35 + Math.random() * (height * 0.38);
            const cloudScale = 60 + Math.random() * 120;
            const puffs = 7 + Math.floor(Math.random() * 8);

            for (let p = 0; p < puffs; p++) {
                const px = cx + (Math.random() - 0.5) * cloudScale * 2.2;
                const py = cy + (Math.random() - 0.5) * cloudScale * 0.45;
                const pr = cloudScale * (0.35 + Math.random() * 0.4);

                const puffGrad = ctx.createRadialGradient(px, py - pr * 0.2, 0, px, py, pr);
                puffGrad.addColorStop(0.0, 'rgba(255, 255, 255, 0.85)');
                puffGrad.addColorStop(0.55, 'rgba(245, 248, 255, 0.65)');
                puffGrad.addColorStop(0.85, 'rgba(225, 235, 245, 0.25)');
                puffGrad.addColorStop(1.0, 'rgba(255, 255, 255, 0.0)');

                ctx.fillStyle = puffGrad;
                ctx.beginPath();
                ctx.arc(px, py, pr, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.mapping = THREE.EquirectangularReflectionMapping;
        this.cache['sky'] = texture;
        return texture;
    }
}

window.textureGenerator = new TextureGenerator();
