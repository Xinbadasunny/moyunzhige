/**
 * EffectsManager - 视觉特效模块
 * 管理水墨飞溅、定格帧、屏幕震动、判定文字、连击数和水墨波纹特效
 */
function EffectsManager() {
    // 粒子对象池
    this.particlePool = [];
    this.activeParticles = [];
    this.poolSize = 200;
    
    // 定格帧
    this.hitStopDuration = 0;
    this.hitStopTimer = 0;
    
    // 屏幕震动
    this.shakeIntensity = 0;
    this.shakeDuration = 0;
    this.shakeTimer = 0;
    this.shakeOffset = { x: 0, y: 0 };
    
    // 判定文字
    this.judgmentTexts = [];
    
    // 连击数
    this.comboDisplays = [];
    
    // 水墨波纹
    this.inkWaves = [];
    
    // 初始化粒子池
    this.initParticlePool();
}

EffectsManager.prototype.initParticlePool = function() {
    for (let i = 0; i < this.poolSize; i++) {
        this.particlePool.push({
            active: false,
            x: 0,
            y: 0,
            vx: 0,
            vy: 0,
            radius: 0,
            color: '',
            alpha: 1,
            gravity: 0,
            friction: 0
        });
    }
};

EffectsManager.prototype.getParticle = function() {
    for (let i = 0; i < this.particlePool.length; i++) {
        if (!this.particlePool[i].active) {
            this.particlePool[i].active = true;
            return this.particlePool[i];
        }
    }
    return null;
};

EffectsManager.prototype.releaseParticle = function(particle) {
    particle.active = false;
};

/**
 * 水墨飞溅特效
 */
EffectsManager.prototype.triggerInkSplash = function(x, y, intensity) {
    const particleCount = Math.floor(Math.random() * 21) + 20; // 20-40个
    
    for (let i = 0; i < particleCount; i++) {
        const particle = this.getParticle();
        if (!particle) break;
        
        particle.x = x;
        particle.y = y;
        particle.vx = (Math.random() - 0.5) * intensity * 8;
        particle.vy = (Math.random() - 0.5) * intensity * 8;
        particle.radius = Math.random() * 8 + 3;
        particle.color = Math.random() > 0.5 ? '#333333' : '#555555';
        particle.alpha = 1;
        particle.gravity = 0.3;
        particle.friction = 0.96;
        
        this.activeParticles.push(particle);
    }
};

/**
 * 定格帧效果
 */
EffectsManager.prototype.triggerHitStop = function(duration) {
    this.hitStopDuration = duration;
    this.hitStopTimer = duration;
};

EffectsManager.prototype.isHitStopped = function() {
    return this.hitStopTimer > 0;
};

/**
 * 屏幕震动
 */
EffectsManager.prototype.triggerShake = function(intensity, duration) {
    this.shakeIntensity = intensity;
    this.shakeDuration = duration;
    this.shakeTimer = duration;
};

EffectsManager.prototype.getShakeOffset = function() {
    return this.shakeOffset;
};

/**
 * 判定文字特效
 */
EffectsManager.prototype.showJudgment = function(text, x, y, rating) {
    const config = {
        perfect: { color: '#FFD700', fontSize: 48 },
        great: { color: '#FFFFFF', fontSize: 36 },
        good: { color: '#999999', fontSize: 28 },
        miss: { color: '#FF4444', fontSize: 32 }
    };
    
    const style = config[rating] || config.good;
    
    this.judgmentTexts.push({
        text: text,
        x: x,
        y: y,
        color: style.color,
        fontSize: style.fontSize,
        scale: 0,
        alpha: 1,
        timer: 0,
        duration: 800
    });
};

/**
 * 连击数特效
 */
EffectsManager.prototype.showCombo = function(count, x, y) {
    this.comboDisplays.push({
        count: count,
        x: x,
        y: y,
        scale: 0,
        bounceVelocity: 0.15,
        alpha: 1,
        timer: 0,
        duration: 1000
    });
};

/**
 * 水墨波纹
 */
EffectsManager.prototype.triggerInkWave = function(x, y) {
    this.inkWaves.push({
        x: x,
        y: y,
        radius: 0,
        maxRadius: 100,
        alpha: 1,
        thickness: 5
    });
};

/**
 * 更新所有特效
 */
EffectsManager.prototype.update = function(deltaTime) {
    // 更新定格帧
    if (this.hitStopTimer > 0) {
        this.hitStopTimer -= deltaTime;
    }
    
    // 更新屏幕震动
    if (this.shakeTimer > 0) {
        this.shakeTimer -= deltaTime;
        this.shakeOffset.x = (Math.random() - 0.5) * this.shakeIntensity * 2;
        this.shakeOffset.y = (Math.random() - 0.5) * this.shakeIntensity * 2;
    } else {
        this.shakeOffset.x = 0;
        this.shakeOffset.y = 0;
    }
    
    // 更新粒子
    for (let i = this.activeParticles.length - 1; i >= 0; i--) {
        const particle = this.activeParticles[i];
        
        particle.vx *= particle.friction;
        particle.vy *= particle.friction;
        particle.vy += particle.gravity;
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.alpha -= 0.02;
        
        if (particle.alpha <= 0) {
            this.releaseParticle(particle);
            this.activeParticles.splice(i, 1);
        }
    }
    
    // 更新判定文字
    for (let i = this.judgmentTexts.length - 1; i >= 0; i--) {
        const judgment = this.judgmentTexts[i];
        judgment.timer += deltaTime;
        
        // 缩放弹出动画
        if (judgment.timer < 100) {
            judgment.scale = judgment.timer / 100;
        } else {
            judgment.scale = 1;
        }
        
        // 淡出
        if (judgment.timer > 600) {
            judgment.alpha = 1 - (judgment.timer - 600) / 200;
        }
        
        if (judgment.timer >= judgment.duration) {
            this.judgmentTexts.splice(i, 1);
        }
    }
    
    // 更新连击数
    for (let i = this.comboDisplays.length - 1; i >= 0; i--) {
        const combo = this.comboDisplays[i];
        combo.timer += deltaTime;
        
        // 弹跳缩放效果
        if (combo.timer < 200) {
            combo.scale += combo.bounceVelocity;
            combo.bounceVelocity *= 0.85;
        }
        
        // 淡出
        if (combo.timer > 800) {
            combo.alpha = 1 - (combo.timer - 800) / 200;
        }
        
        if (combo.timer >= combo.duration) {
            this.comboDisplays.splice(i, 1);
        }
    }
    
    // 更新水墨波纹
    for (let i = this.inkWaves.length - 1; i >= 0; i--) {
        const wave = this.inkWaves[i];
        
        wave.radius += 3;
        wave.alpha -= 0.02;
        wave.thickness *= 0.98;
        
        if (wave.alpha <= 0 || wave.radius >= wave.maxRadius) {
            this.inkWaves.splice(i, 1);
        }
    }
};

/**
 * 渲染所有特效
 */
EffectsManager.prototype.render = function(ctx) {
    // 渲染水墨波纹
    for (let i = 0; i < this.inkWaves.length; i++) {
        const wave = this.inkWaves[i];
        ctx.save();
        ctx.globalAlpha = wave.alpha;
        ctx.strokeStyle = '#666666';
        ctx.lineWidth = wave.thickness;
        ctx.beginPath();
        ctx.arc(wave.x, wave.y, wave.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }
    
    // 渲染粒子
    for (let i = 0; i < this.activeParticles.length; i++) {
        const particle = this.activeParticles[i];
        ctx.save();
        ctx.globalAlpha = particle.alpha;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        // 不规则圆形
        ctx.ellipse(
            particle.x, 
            particle.y, 
            particle.radius * (0.8 + Math.random() * 0.4), 
            particle.radius * (0.8 + Math.random() * 0.4), 
            Math.random() * Math.PI, 
            0, 
            Math.PI * 2
        );
        ctx.fill();
        ctx.restore();
    }
    
    // 渲染判定文字
    for (let i = 0; i < this.judgmentTexts.length; i++) {
        const judgment = this.judgmentTexts[i];
        ctx.save();
        ctx.globalAlpha = judgment.alpha;
        ctx.fillStyle = judgment.color;
        ctx.font = `bold ${judgment.fontSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        ctx.translate(judgment.x, judgment.y);
        ctx.scale(judgment.scale, judgment.scale);
        ctx.fillText(judgment.text, 0, 0);
        
        ctx.restore();
    }
    
    // 渲染连击数
    for (let i = 0; i < this.comboDisplays.length; i++) {
        const combo = this.comboDisplays[i];
        ctx.save();
        ctx.globalAlpha = combo.alpha;
        ctx.fillStyle = '#FFD700';
        ctx.font = `bold 36px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        ctx.translate(combo.x, combo.y);
        ctx.scale(combo.scale, combo.scale);
        ctx.fillText(combo.count + ' COMBO', 0, 0);
        
        ctx.restore();
    }
};

export default EffectsManager;
