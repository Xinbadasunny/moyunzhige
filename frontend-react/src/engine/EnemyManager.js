/**
 * Enemy 和 EnemyManager 类 - 忍者敌人系统
 */

var ENEMY_STATES = {
    APPROACHING: 'approaching',
    READY: 'ready',
    HIT: 'hit',
    DEAD: 'dead'
};

// Enemy 类 - 单个忍者
function Enemy(type, targetX, canvasWidth, canvasHeight) {
    this.type = type; // white, red, stealth
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    
    this.state = ENEMY_STATES.APPROACHING;
    this.x = canvasWidth + 50; // 从画面右侧外开始
    this.targetX = targetX; // 目标位置（侠士前方约100px）
    this.y = canvasHeight * 0.6;
    
    // 外观参数
    this.scale = canvasHeight * 0.35 / 120;
    this.alpha = 1;
    this.flickerTime = 0;
    
    // 运动参数
    this.speed = 150; // 移动速度（像素/秒）
    
    // 被击中后的物理参数
    this.velocityX = 0;
    this.velocityY = 0;
    this.gravity = 1000;
    this.rotation = 0;
    this.rotationSpeed = 0;
    
    // 动画参数
    this.animTime = 0;
}

Enemy.prototype.update = function(deltaTime) {
    this.animTime += deltaTime * 0.005;
    
    switch (this.state) {
        case ENEMY_STATES.APPROACHING:
            this.updateApproaching(deltaTime);
            break;
        case ENEMY_STATES.READY:
            this.updateReady(deltaTime);
            break;
        case ENEMY_STATES.HIT:
            this.updateHit(deltaTime);
            break;
        case ENEMY_STATES.DEAD:
            // 已死亡，不做处理
            break;
    }
    
    // stealth类型闪烁效果
    if (this.type === 'stealth') {
        this.flickerTime += deltaTime * 0.005;
        this.alpha = 0.3 + Math.sin(this.flickerTime) * 0.2;
    }
};

Enemy.prototype.updateApproaching = function(deltaTime) {
    var distance = this.targetX - this.x;
    
    if (distance <= 5) {
        this.x = this.targetX;
        this.state = ENEMY_STATES.READY;
    } else {
        this.x += this.speed * (deltaTime / 1000);
    }
};

Enemy.prototype.updateReady = function(deltaTime) {
    // 待机动画，轻微上下浮动
    this.y = this.canvasHeight * 0.6 + Math.sin(this.animTime) * 2;
};

Enemy.prototype.updateHit = function(deltaTime) {
    var dt = deltaTime / 1000;
    
    // 应用重力
    this.velocityY += this.gravity * dt;
    
    // 更新位置
    this.x += this.velocityX * dt;
    this.y += this.velocityY * dt;
    
    // 更新旋转
    this.rotation += this.rotationSpeed * dt;
    
    // 检查是否飞出画面
    if (this.x > this.canvasWidth + 100 || this.y > this.canvasHeight + 100) {
        this.state = ENEMY_STATES.DEAD;
    }
};

Enemy.prototype.render = function(ctx, spriteImage, spriteLoaded) {
    if (this.state === ENEMY_STATES.DEAD) {
        return;
    }
    
    ctx.save();
    ctx.globalAlpha = this.alpha;
    
    // 应用位置和旋转
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.scale(this.scale, this.scale);
    
    // 如果图片已加载，绘制外部刺客图片
    if (spriteLoaded && spriteImage) {
        // 绘制图片（约 60x100 像素）
        var imageWidth = 60;
        var imageHeight = 100;
        ctx.drawImage(
            spriteImage,
            -imageWidth / 2,  // 居中绘制
            -imageHeight / 2,
            imageWidth,
            imageHeight
        );
    } else {
        // 否则保留原有手绘 fallback
        // 根据类型绘制不同的忍者
        switch (this.type) {
            case 'white':
                this.drawWhiteNinja(ctx);
                break;
            case 'red':
                this.drawRedNinja(ctx);
                break;
            case 'stealth':
                this.drawStealthNinja(ctx);
                break;
        }
    }
    
    ctx.restore();
};

Enemy.prototype.drawWhiteNinja = function(ctx) {
    ctx.fillStyle = '#888888';
    ctx.strokeStyle = '#666666';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    var cx = 0;
    var cy = 0;
    
    // 身体
    ctx.beginPath();
    ctx.moveTo(cx - 15, cy - 30);
    ctx.quadraticCurveTo(cx - 20, cy + 20, cx - 15, cy + 60);
    ctx.lineTo(cx + 15, cy + 60);
    ctx.quadraticCurveTo(cx + 20, cy + 20, cx + 15, cy - 30);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // 头部/面罩
    ctx.beginPath();
    ctx.ellipse(cx, cy - 40, 12, 15, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // 眼睛
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(cx - 5, cy - 42, 3, 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + 5, cy - 42, 3, 2, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // 左臂
    ctx.fillStyle = '#888888';
    ctx.strokeStyle = '#666666';
    ctx.beginPath();
    ctx.moveTo(cx - 15, cy - 20);
    ctx.quadraticCurveTo(cx - 30, cy, cx - 25, cy + 30);
    ctx.stroke();
    
    // 右臂
    ctx.beginPath();
    ctx.moveTo(cx + 15, cy - 20);
    ctx.quadraticCurveTo(cx + 30, cy, cx + 25, cy + 30);
    ctx.stroke();
    
    // 手里剑（ready状态时显示）
    if (this.state === ENEMY_STATES.READY) {
        this.drawShuriken(ctx, cx + 25, cy + 35);
    }
    
    // 腿部
    ctx.beginPath();
    ctx.moveTo(cx - 10, cy + 60);
    ctx.lineTo(cx - 15, cy + 100);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(cx + 10, cy + 60);
    ctx.lineTo(cx + 15, cy + 100);
    ctx.stroke();
};

Enemy.prototype.drawRedNinja = function(ctx) {
    // 红色忍者体型略大
    var cx = 0;
    var cy = 0;
    
    ctx.fillStyle = '#aa3333';
    ctx.strokeStyle = '#882222';
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // 身体
    ctx.beginPath();
    ctx.moveTo(cx - 18, cy - 35);
    ctx.quadraticCurveTo(cx - 24, cy + 25, cx - 18, cy + 70);
    ctx.lineTo(cx + 18, cy + 70);
    ctx.quadraticCurveTo(cx + 24, cy + 25, cx + 18, cy - 35);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // 头部/面罩
    ctx.beginPath();
    ctx.ellipse(cx, cy - 47, 14, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // 眼睛
    ctx.fillStyle = '#ff6666';
    ctx.beginPath();
    ctx.ellipse(cx - 6, cy - 50, 4, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + 6, cy - 50, 4, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // 左臂
    ctx.fillStyle = '#aa3333';
    ctx.strokeStyle = '#882222';
    ctx.beginPath();
    ctx.moveTo(cx - 18, cy - 25);
    ctx.quadraticCurveTo(cx - 35, cy - 2, cx - 30, cy + 35);
    ctx.stroke();
    
    // 右臂
    ctx.beginPath();
    ctx.moveTo(cx + 18, cy - 25);
    ctx.quadraticCurveTo(cx + 35, cy - 2, cx + 30, cy + 35);
    ctx.stroke();
    
    // 手里剑
    if (this.state === ENEMY_STATES.READY) {
        this.drawShuriken(ctx, cx + 30, cy + 40);
    }
    
    // 腿部
    ctx.beginPath();
    ctx.moveTo(cx - 12, cy + 70);
    ctx.lineTo(cx - 18, cy + 115);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(cx + 12, cy + 70);
    ctx.lineTo(cx + 18, cy + 115);
    ctx.stroke();
};

Enemy.prototype.drawStealthNinja = function(ctx) {
    var cx = 0;
    var cy = 0;
    
    ctx.fillStyle = '#555555';
    ctx.strokeStyle = '#444444';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // 身体
    ctx.beginPath();
    ctx.moveTo(cx - 15, cy - 30);
    ctx.quadraticCurveTo(cx - 20, cy + 20, cx - 15, cy + 60);
    ctx.lineTo(cx + 15, cy + 60);
    ctx.quadraticCurveTo(cx + 20, cy + 20, cx + 15, cy - 30);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // 头部/面罩
    ctx.beginPath();
    ctx.ellipse(cx, cy - 40, 12, 15, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // 眼睛（发光效果）
    ctx.fillStyle = '#ffff00';
    ctx.shadowColor = '#ffff00';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.ellipse(cx - 5, cy - 42, 3, 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + 5, cy - 42, 3, 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    
    // 左臂
    ctx.fillStyle = '#555555';
    ctx.strokeStyle = '#444444';
    ctx.beginPath();
    ctx.moveTo(cx - 15, cy - 20);
    ctx.quadraticCurveTo(cx - 30, cy, cx - 25, cy + 30);
    ctx.stroke();
    
    // 右臂
    ctx.beginPath();
    ctx.moveTo(cx + 15, cy - 20);
    ctx.quadraticCurveTo(cx + 30, cy, cx + 25, cy + 30);
    ctx.stroke();
    
    // 手里剑
    if (this.state === ENEMY_STATES.READY) {
        this.drawShuriken(ctx, cx + 25, cy + 35);
    }
    
    // 腿部
    ctx.beginPath();
    ctx.moveTo(cx - 10, cy + 60);
    ctx.lineTo(cx - 15, cy + 100);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(cx + 10, cy + 60);
    ctx.lineTo(cx + 15, cy + 100);
    ctx.stroke();
};

Enemy.prototype.drawShuriken = function(ctx, x, y) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(this.animTime * 2);
    
    ctx.fillStyle = '#333333';
    ctx.strokeStyle = '#222222';
    ctx.lineWidth = 2;
    
    // 绘制四角星
    ctx.beginPath();
    for (var i = 0; i < 4; i++) {
        ctx.rotate(Math.PI / 2);
        ctx.moveTo(0, 0);
        ctx.lineTo(-3, -8);
        ctx.lineTo(0, -5);
        ctx.lineTo(3, -8);
        ctx.lineTo(0, 0);
    }
    ctx.fill();
    ctx.stroke();
    
    ctx.restore();
};

Enemy.prototype.hit = function(rating) {
    if (this.state !== ENEMY_STATES.READY) {
        return false;
    }
    
    this.state = ENEMY_STATES.HIT;
    
    // 根据评级设置击飞速度
    var speedMultiplier = 1;
    var rotationMultiplier = 1;
    
    switch (rating) {
        case 'perfect':
            speedMultiplier = 1.5;
            rotationMultiplier = 2;
            break;
        case 'great':
            speedMultiplier = 1.2;
            rotationMultiplier = 1.5;
            break;
        case 'good':
            speedMultiplier = 1.0;
            rotationMultiplier = 1.0;
            break;
        case 'miss':
        default:
            speedMultiplier = 0.5;
            rotationMultiplier = 0.5;
            break;
    }
    
    this.velocityX = 400 * speedMultiplier;
    this.velocityY = -300 * speedMultiplier;
    this.rotationSpeed = 10 * rotationMultiplier;
    
    return true;
};

// EnemyManager 类 - 管理所有忍者
function EnemyManager(canvasWidth, canvasHeight) {
    this.enemies = [];
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    
    // 加载外部刺客图片
    this.enemyImage = new Image();
    this.enemyImageLoaded = false;
    this.enemyImage.src = '/assets/enemy.png';
    this.enemyImage.onload = function() {
        this.enemyImageLoaded = true;
    }.bind(this);
}

EnemyManager.prototype.spawnEnemy = function(type, playerX) {
    // 计算目标位置（侠士前方约100px）
    var targetX = playerX + 100;
    var enemy = new Enemy(type, targetX, this.canvasWidth, this.canvasHeight);
    this.enemies.push(enemy);
    return enemy;
};

EnemyManager.prototype.update = function(deltaTime) {
    for (var i = this.enemies.length - 1; i >= 0; i--) {
        this.enemies[i].update(deltaTime);
        
        // 移除死亡敌人
        if (this.enemies[i].state === ENEMY_STATES.DEAD) {
            this.enemies.splice(i, 1);
        }
    }
};

EnemyManager.prototype.render = function(ctx) {
    for (var i = 0; i < this.enemies.length; i++) {
        this.enemies[i].render(ctx, this.enemyImage, this.enemyImageLoaded);
    }
};

EnemyManager.prototype.hitFrontEnemy = function(rating) {
    // 找到最前面的ready状态敌人
    var frontEnemy = null;
    var maxX = -Infinity;
    
    for (var i = 0; i < this.enemies.length; i++) {
        if (this.enemies[i].state === ENEMY_STATES.READY) {
            if (this.enemies[i].x > maxX) {
                maxX = this.enemies[i].x;
                frontEnemy = this.enemies[i];
            }
        }
    }
    
    if (frontEnemy) {
        return frontEnemy.hit(rating);
    }
    
    return false;
};

EnemyManager.prototype.getActiveCount = function() {
    var count = 0;
    for (var i = 0; i < this.enemies.length; i++) {
        if (this.enemies[i].state !== ENEMY_STATES.DEAD) {
            count++;
        }
    }
    return count;
};

EnemyManager.prototype.clear = function() {
    this.enemies = [];
};

export default EnemyManager;