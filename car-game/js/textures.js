/**
 * High-Resolution Procedural Texture Generator
 * Generates photorealistic grass, gravel, bark, leaves, tires, fabric, Ford grille, and NSW license plate.
 */
class TextureGenerator {
    constructor() {
        this.cache = {};
    }

    // 1. Realistic Grass Texture with normal/bump detail
    createGrassTexture(size = 1024) {
        if (this.cache['grass']) return this.cache['grass'];
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        // Base green undertone with subtle soil brown spots
        ctx.fillStyle = '#2d5a27';
        ctx.fillRect(0, 0, size, size);

        // Noise base
        const imgData = ctx.getImageData(0, 0, size, size);
        const data = imgData.data;
        for (let i = 0; i < data.length; i += 4) {
            const noise = (Math.random() - 0.5) * 35;
            data[i] = Math.min(255, Math.max(0, data[i] + noise * 0.7));     // R
            data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));   // G
            data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise * 0.4)); // B
        }
        ctx.putImageData(imgData, 0, 0);

        // Draw thousands of individual realistic grass blades
        const bladeColors = ['#3b7d32', '#4c9940', '#255020', '#56a846', '#6dbd59', '#385e2b', '#7fa84d'];
        const bladeCount = 18000;
        for (let i = 0; i < bladeCount; i++) {
            const x = Math.random() * size;
            const y = Math.random() * size;
            const len = 6 + Math.random() * 14;
            const angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.8;
            const col = bladeColors[Math.floor(Math.random() * bladeColors.length)];

            ctx.strokeStyle = col;
            ctx.lineWidth = 1.0 + Math.random() * 1.4;
            ctx.beginPath();
            ctx.moveTo(x, y);
            const cx = x + Math.cos(angle) * (len * 0.6) + (Math.random() - 0.5) * 4;
            const cy = y + Math.sin(angle) * (len * 0.6);
            const ex = x + Math.cos(angle) * len;
            const ey = y + Math.sin(angle) * len;
            ctx.quadraticCurveTo(cx, cy, ex, ey);
            ctx.stroke();
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(50, 50);
        this.cache['grass'] = texture;
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
