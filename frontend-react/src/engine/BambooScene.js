/**
 * 墨韵节拍：止戈 - 竹林场景模块
 * 渲染动态竹林背景效果
 */

class BambooScene {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.time = 0;
        this.shakeOffsetX = 0;
        this.shakeOffsetY = 0;
        
        // 初始化背景图加载
        this.backgroundImage = new Image();
        this.backgroundLoaded = false;
        this.backgroundImage.onload = function() {
            this.backgroundLoaded = true;
        }.bind(this);
        this.backgroundImage.src = '/assets/bamboo-bg.png';
        
        this.initBamboos();
        this.initGround();
        this.initLightBeams();
        this.initFog();
        this.initLeaves();
    }

    initBamboos() {
        this.bamboos = [];
        
        var layers = [
            { name: 'far', count: 8, color: '#2d4a3e', scale: 0.6, speed: 0.3, alpha: 0.5 },
            { name: 'mid', count: 12, color: '#3d5a4e', scale: 0.8, speed: 0.5, alpha: 0.7 },
            { name: 'near', count: 15, color: '#4a6b5a', scale: 1.0, speed: 0.8, alpha: 1.0 }
        ];
        
        for (var l = 0; l < layers.length; l++) {
            var layer = layers[l];
            for (var i = 0; i < layer.count; i++) {
                var x = (i / layer.count) * this.width + Math.random() * 50 - 25;
                var bamboo = {
                    x: x,
                    y: this.height * 0.85,
                    height: this.height * (0.5 + Math.random() * 0.4) * layer.scale,
                    width: 8 + Math.random() * 6,
                    segments: 8 + Math.floor(Math.random() * 4),
                    phase: Math.random() * Math.PI * 2,
                    speed: layer.speed * (0.8 + Math.random() * 0.4),
                    color: layer.color,
                    alpha: layer.alpha,
                    leaves: this.generateLeaves(layer.scale)
                };
                this.bamboos.push(bamboo);
            }
        }
        
        this.bamboos.sort(function(a, b) {
            return a.alpha - b.alpha;
        });
    }

    generateLeaves(scale) {
        var leaves = [];
        var leafCount = 3 + Math.floor(Math.random() * 4);
        
        for (var i = 0; i < leafCount; i++) {
            leaves.push({
                offsetX: (Math.random() - 0.5) * 30 * scale,
                offsetY: -0.3 - Math.random() * 0.5,
                length: (15 + Math.random() * 10) * scale,
                width: (6 + Math.random() * 4) * scale,
                angle: (Math.random() - 0.5) * 0.3,
                phase: Math.random() * Math.PI * 2
            });
        }
        return leaves;
    }

    initGround() {
        this.groundStones = [];
        for (var i = 0; i < 30; i++) {
            this.groundStones.push({
                x: Math.random() * this.width,
                y: this.height * 0.85 + Math.random() * this.height * 0.1,
                size: 2 + Math.random() * 4,
                color: '#3a4a3a'
            });
        }
    }

    initLightBeams() {
        this.lightBeams = [];
        for (var i = 0; i < 5; i++) {
            this.lightBeams.push({
                x: this.width * (0.2 + Math.random() * 0.6),
                width: 20 + Math.random() * 40,
                angle: -0.1 + Math.random() * 0.2,
                alpha: 0.1 + Math.random() * 0.15,
                phase: Math.random() * Math.PI * 2,
                speed: 0.3 + Math.random() * 0.3
            });
        }
        
        this.lightSpots = [];
        for (var i = 0; i < 8; i++) {
            this.lightSpots.push({
                x: Math.random() * this.width,
                y: this.height * 0.85 + Math.random() * this.height * 0.1,
                radius: 3 + Math.random() * 8,
                alpha: 0.2 + Math.random() * 0.3,
                phase: Math.random() * Math.PI * 2,
                speed: 0.2 + Math.random() * 0.4
            });
        }
    }

    initFog() {
        this.fogLayers = [];
        for (var i = 0; i < 3; i++) {
            this.fogLayers.push({
                y: this.height * (0.2 + i * 0.15),
                height: this.height * 0.15,
                alpha: 0.1 + i * 0.05,
                phase: Math.random() * Math.PI * 2,
                speed: 0.1 + Math.random() * 0.1
            });
        }
    }

    initLeaves() {
        this.fallingLeaves = [];
        for (var i = 0; i < 40; i++) {
            this.fallingLeaves.push(this.createFallingLeaf());
        }
    }

    createFallingLeaf() {
        return {
            x: Math.random() * this.width,
            y: Math.random() * this.height * 0.8,
            size: 3 + Math.random() * 4,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.05,
            fallSpeed: 0.5 + Math.random() * 1,
            swayAmplitude: 20 + Math.random() * 30,
            swayPhase: Math.random() * Math.PI * 2,
            swaySpeed: 0.5 + Math.random() * 0.5,
            color: '#4a6b5a'
        };
    }

    setShakeOffset(x, y) {
        this.shakeOffsetX = x;
        this.shakeOffsetY = y;
    }

    update(deltaTime) {
        this.time += deltaTime;
        
        for (var i = 0; i < this.fallingLeaves.length; i++) {
            var leaf = this.fallingLeaves[i];
            leaf.y += leaf.fallSpeed * deltaTime * 60;
            leaf.x += Math.sin(this.time * leaf.swaySpeed + leaf.swayPhase) * 0.5;
            leaf.rotation += leaf.rotationSpeed * deltaTime * 60;
            
            if (leaf.y > this.height * 0.9) {
                this.fallingLeaves[i] = this.createFallingLeaf();
                this.fallingLeaves[i].y = -10;
            }
        }
    }

    render(ctx) {
        ctx.save();
        ctx.translate(this.shakeOffsetX, this.shakeOffsetY);
        
        if (this.backgroundLoaded) {
            // 使用背景图绘制
            ctx.drawImage(this.backgroundImage, 0, 0, this.width, this.height);
            // 只渲染落叶动态元素
            this.renderFallingLeaves(ctx);
        } else {
            // 背景图未加载，使用原有的程序化渲染作为 fallback
            this.renderBackground(ctx);
            this.renderFog(ctx, true);
            this.renderBamboos(ctx);
            this.renderGround(ctx);
            this.renderLightBeams(ctx);
            this.renderLightSpots(ctx);
            this.renderFog(ctx, false);
            this.renderFallingLeaves(ctx);
        }
        
        ctx.restore();
    }

    renderBackground(ctx) {
        var gradient = ctx.createLinearGradient(0, 0, 0, this.height);
        gradient.addColorStop(0, '#1a2a25');
        gradient.addColorStop(0.5, '#2d3d35');
        gradient.addColorStop(1, '#3d4d45');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.width, this.height);
    }

    renderFog(ctx, isBackground) {
        var layers = isBackground ? this.fogLayers.slice(0, 2) : [this.fogLayers[2]];
        
        for (var i = 0; i < layers.length; i++) {
            var fog = layers[i];
            var offset = Math.sin(this.time * fog.speed + fog.phase) * 20;
            
            ctx.save();
            ctx.globalAlpha = fog.alpha * (isBackground ? 1 : 0.7);
            ctx.globalCompositeOperation = 'source-over';
            
            var gradient = ctx.createLinearGradient(0, fog.y, 0, fog.y + fog.height);
            gradient.addColorStop(0, 'rgba(200, 210, 200, 0)');
            gradient.addColorStop(0.5, 'rgba(200, 210, 200, 0.3)');
            gradient.addColorStop(1, 'rgba(200, 210, 200, 0)');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.moveTo(offset, fog.y);
            ctx.lineTo(this.width + offset, fog.y);
            ctx.lineTo(this.width + offset + 50, fog.y + fog.height);
            ctx.lineTo(offset - 50, fog.y + fog.height);
            ctx.closePath();
            ctx.fill();
            
            ctx.restore();
        }
    }

    renderBamboos(ctx) {
        for (var i = 0; i < this.bamboos.length; i++) {
            var bamboo = this.bamboos[i];
            this.renderBamboo(ctx, bamboo);
        }
    }

    renderBamboo(ctx, bamboo) {
        ctx.save();
        ctx.globalAlpha = bamboo.alpha;
        
        var sway = Math.sin(this.time * bamboo.speed + bamboo.phase) * 0.03;
        var segmentHeight = bamboo.height / bamboo.segments;
        
        ctx.translate(bamboo.x, bamboo.y);
        ctx.rotate(sway);
        
        ctx.fillStyle = bamboo.color;
        ctx.strokeStyle = this.darkenColor(bamboo.color, 0.2);
        ctx.lineWidth = 1;
        
        for (var i = 0; i < bamboo.segments; i++) {
            var currentY = -i * segmentHeight;
            var nextY = -(i + 1) * segmentHeight;
            var currentWidth = bamboo.width * (1 - i * 0.08);
            var nextWidth = bamboo.width * (1 - (i + 1) * 0.08);
            
            ctx.beginPath();
            ctx.moveTo(-currentWidth / 2, currentY);
            ctx.lineTo(currentWidth / 2, currentY);
            ctx.lineTo(nextWidth / 2, nextY);
            ctx.lineTo(-nextWidth / 2, nextY);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            
            if (i < bamboo.segments - 1) {
                ctx.beginPath();
                ctx.moveTo(-currentWidth / 2 + 1, nextY + 2);
                ctx.lineTo(currentWidth / 2 - 1, nextY + 2);
                ctx.strokeStyle = this.darkenColor(bamboo.color, 0.3);
                ctx.stroke();
                ctx.strokeStyle = this.darkenColor(bamboo.color, 0.2);
            }
        }
        
        this.renderBambooLeaves(ctx, bamboo, sway);
        
        ctx.restore();
    }

    renderBambooLeaves(ctx, bamboo, sway) {
        ctx.fillStyle = this.lightenColor(bamboo.color, 0.1);
        
        for (var i = 0; i < bamboo.leaves.length; i++) {
            var leaf = bamboo.leaves[i];
            var leafSway = Math.sin(this.time * 0.5 + leaf.phase) * 0.1;
            var totalAngle = leaf.angle + sway * 2 + leafSway;
            
            var baseX = leaf.offsetX;
            var baseY = bamboo.height * leaf.offsetY;
            
            ctx.save();
            ctx.translate(baseX, baseY);
            ctx.rotate(totalAngle);
            
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.quadraticCurveTo(leaf.length / 2, -leaf.width / 2, leaf.length, 0);
            ctx.quadraticCurveTo(leaf.length / 2, leaf.width / 2, 0, 0);
            ctx.fill();
            
            ctx.restore();
        }
    }

    renderGround(ctx) {
        var groundY = this.height * 0.85;
        
        var gradient = ctx.createLinearGradient(0, groundY, 0, this.height);
        gradient.addColorStop(0, '#2d3d32');
        gradient.addColorStop(1, '#1d2d22');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, groundY, this.width, this.height - groundY);
        
        ctx.fillStyle = '#3a4a3a';
        for (var i = 0; i < 50; i++) {
            var x = (i * 37) % this.width;
            var y = groundY + (i * 23) % (this.height - groundY);
            var bladeHeight = 3 + (i % 5);
            
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + 2, y - bladeHeight);
            ctx.lineTo(x + 4, y);
            ctx.fill();
        }
        
        ctx.fillStyle = '#4a5a4a';
        for (var i = 0; i < this.groundStones.length; i++) {
            var stone = this.groundStones[i];
            ctx.beginPath();
            ctx.arc(stone.x, stone.y, stone.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    renderLightBeams(ctx) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        
        for (var i = 0; i < this.lightBeams.length; i++) {
            var beam = this.lightBeams[i];
            var alphaVar = Math.sin(this.time * beam.speed + beam.phase) * 0.05;
            var currentAlpha = beam.alpha + alphaVar;
            
            var gradient = ctx.createLinearGradient(
                beam.x, 0,
                beam.x + Math.sin(beam.angle) * this.height,
                this.height
            );
            gradient.addColorStop(0, 'rgba(255, 250, 220, ' + currentAlpha + ')');
            gradient.addColorStop(0.5, 'rgba(255, 250, 220, ' + (currentAlpha * 0.6) + ')');
            gradient.addColorStop(1, 'rgba(255, 250, 220, 0)');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.moveTo(beam.x - beam.width / 2, 0);
            ctx.lineTo(beam.x + beam.width / 2, 0);
            ctx.lineTo(beam.x + beam.width / 2 + Math.sin(beam.angle) * this.height, this.height);
            ctx.lineTo(beam.x - beam.width / 2 + Math.sin(beam.angle) * this.height, this.height);
            ctx.closePath();
            ctx.fill();
        }
        
        ctx.restore();
    }

    renderLightSpots(ctx) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        
        for (var i = 0; i < this.lightSpots.length; i++) {
            var spot = this.lightSpots[i];
            var moveX = Math.sin(this.time * spot.speed + spot.phase) * 10;
            var moveY = Math.cos(this.time * spot.speed * 0.7 + spot.phase) * 5;
            var alphaVar = Math.sin(this.time * spot.speed * 1.5 + spot.phase) * 0.1;
            
            var gradient = ctx.createRadialGradient(
                spot.x + moveX, spot.y + moveY, 0,
                spot.x + moveX, spot.y + moveY, spot.radius
            );
            gradient.addColorStop(0, 'rgba(255, 250, 220, ' + (spot.alpha + alphaVar) + ')');
            gradient.addColorStop(1, 'rgba(255, 250, 220, 0)');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(spot.x + moveX, spot.y + moveY, spot.radius, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }

    renderFallingLeaves(ctx) {
        for (var i = 0; i < this.fallingLeaves.length; i++) {
            var leaf = this.fallingLeaves[i];
            
            ctx.save();
            ctx.globalAlpha = 0.8;
            ctx.translate(leaf.x, leaf.y);
            ctx.rotate(leaf.rotation);
            
            ctx.fillStyle = leaf.color;
            ctx.beginPath();
            ctx.moveTo(0, -leaf.size);
            ctx.quadraticCurveTo(leaf.size, 0, 0, leaf.size);
            ctx.quadraticCurveTo(-leaf.size, 0, 0, -leaf.size);
            ctx.fill();
            
            ctx.restore();
        }
    }

    darkenColor(color, amount) {
        var hex = color.replace('#', '');
        var r = parseInt(hex.substring(0, 2), 16);
        var g = parseInt(hex.substring(2, 4), 16);
        var b = parseInt(hex.substring(4, 6), 16);
        
        r = Math.max(0, Math.floor(r * (1 - amount)));
        g = Math.max(0, Math.floor(g * (1 - amount)));
        b = Math.max(0, Math.floor(b * (1 - amount)));
        
        return 'rgb(' + r + ',' + g + ',' + b + ')';
    }

    lightenColor(color, amount) {
        var hex = color.replace('#', '');
        var r = parseInt(hex.substring(0, 2), 16);
        var g = parseInt(hex.substring(2, 4), 16);
        var b = parseInt(hex.substring(4, 6), 16);
        
        r = Math.min(255, Math.floor(r + (255 - r) * amount));
        g = Math.min(255, Math.floor(g + (255 - g) * amount));
        b = Math.min(255, Math.floor(b + (255 - b) * amount));
        
        return 'rgb(' + r + ',' + g + ',' + b + ')';
    }
}

export default BambooScene;