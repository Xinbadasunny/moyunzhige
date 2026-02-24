/**
 * Player 类 - 水墨侠士角色
 */

var STATES = {
    IDLE: 'idle',
    PUNCH_LEFT: 'punch_left',
    PUNCH_RIGHT: 'punch_right',
    BLOCK: 'block',
    DODGE_UP: 'dodge_up',
    DODGE_DOWN: 'dodge_down',
    HOLD: 'hold',
    HIT: 'hit'
};

var ACTION_DURATION = 300; // 动作持续时间（毫秒）

function Player(x, y) {
    this.x = x;
    this.y = y;
    this.currentState = STATES.IDLE;
    this.actionTimer = 0;
    this.ultimateMode = false;
    this.canvasHeight = 600; // 默认高度，会在render时动态调整
    this.scale = 1;
    
    // 呼吸动画参数
    this.breathTime = 0;
    this.breathOffset = 0;
    
    // 残影效果（存储最近5帧）
    this.afterimages = [];
    
    // 动画偏移量
    this.animOffsetX = 0;
    this.animOffsetY = 0;
    this.rotation = 0;
    
    // 加载外部图片
    this.spriteImage = new Image();
    this.spriteLoaded = false;
    var self = this;
    this.spriteImage.onload = function() {
        self.spriteLoaded = true;
        console.log('[Player] 主角图片加载成功, spriteLoaded =', self.spriteLoaded);
    };
    this.spriteImage.onerror = function() {
        console.warn('[Player] 主角图片加载失败');
    };
    this.spriteImage.src = '/assets/player.png';
    console.log('[Player] 开始加载主角图片: /assets/player.png');
}

Player.prototype.performAction = function(actionType) {
    console.log('[Player] performAction called:', actionType, 'current:', this.currentState);
    if (this.currentState === STATES.HIT) {
        return; // 受伤中不能执行其他动作
    }
    
    this.currentState = actionType;
    this.actionTimer = ACTION_DURATION;
    this.animOffsetX = 0;
    this.animOffsetY = 0;
    this.rotation = 0;
};

Player.prototype.update = function(deltaTime) {
    // 更新呼吸动画
    this.breathTime += deltaTime;
    this.breathOffset = Math.sin(this.breathTime * 0.003) * 3;
    
    // 更新动作计时器
    if (this.actionTimer > 0) {
        this.actionTimer -= deltaTime;
        
        // 动作过渡效果
        var progress = 1 - (this.actionTimer / ACTION_DURATION);
        this.updateAnimationProgress(progress);
        
        if (this.actionTimer <= 0) {
            this.currentState = STATES.IDLE;
            this.animOffsetX = 0;
            this.animOffsetY = 0;
            this.rotation = 0;
        }
    }
    
    // 更新残影
    if (this.ultimateMode) {
        this.afterimages.unshift({
            x: this.x,
            y: this.y,
            state: this.currentState,
            animOffsetX: this.animOffsetX,
            animOffsetY: this.animOffsetY,
            rotation: this.rotation,
            alpha: 0.6
        });
        if (this.afterimages.length > 5) {
            this.afterimages.pop();
        }
    } else {
        this.afterimages = [];
    }
};

Player.prototype.updateAnimationProgress = function(progress) {
    switch (this.currentState) {
        case STATES.PUNCH_LEFT:
            this.animOffsetX = Math.sin(progress * Math.PI) * 40;
            break;
        case STATES.PUNCH_RIGHT:
            this.animOffsetX = Math.sin(progress * Math.PI) * 40;
            break;
        case STATES.DODGE_UP:
            this.animOffsetY = -Math.sin(progress * Math.PI) * 30;
            break;
        case STATES.DODGE_DOWN:
            this.animOffsetY = Math.sin(progress * Math.PI) * 20;
            break;
        case STATES.BLOCK:
            this.animOffsetX = Math.sin(progress * Math.PI) * 5;
            break;
        case STATES.HOLD:
            this.animOffsetX = Math.sin(progress * Math.PI) * 20;
            break;
        case STATES.HIT:
            this.animOffsetX = -Math.sin(progress * Math.PI) * 15;
            this.rotation = Math.sin(progress * Math.PI) * 0.1;
            break;
    }
};

Player.prototype.render = function(ctx) {
    // 动态计算缩放比例
    this.scale = this.canvasHeight / 600;
    
    var centerY = this.y + this.breathOffset + this.animOffsetY;
    var centerX = this.x + this.animOffsetX;
    
    // 如果图片加载成功，使用图片绘制
    if (this.spriteLoaded) {
        const spriteWidth = 120 * this.scale;
        const spriteHeight = 180 * this.scale;
        const drawX = centerX - spriteWidth / 2;
        const drawY = centerY - spriteHeight / 2;
        
        // 渲染残影
        if (this.ultimateMode) {
            for (var i = 0; i < this.afterimages.length; i++) {
                var afterimage = this.afterimages[i];
                ctx.save();
                ctx.globalAlpha = afterimage.alpha * 0.3;
                const afterimageX = afterimage.x + afterimage.animOffsetX - spriteWidth / 2;
                const afterimageY = afterimage.y + this.breathOffset + afterimage.animOffsetY - spriteHeight / 2;
                ctx.drawImage(this.spriteImage, afterimageX, afterimageY, spriteWidth, spriteHeight);
                ctx.restore();
            }
        }
        
        // 渲染主体
        ctx.save();
        
        // 无我境界发光效果
        if (this.ultimateMode) {
            ctx.shadowColor = '#FFD700';
            ctx.shadowBlur = 20;
        }
        
        // 根据动作状态对图片施加变换
        ctx.translate(centerX, centerY);
        
        // 计算动作进度（0~1），用于平滑过渡
        var actionProgress = this.actionTimer > 0 ? Math.sin((1 - this.actionTimer / 300) * Math.PI) : 0;
        
        switch (this.currentState) {
            case 'punch_left':
                // 左拳：身体大幅左倾 + 水平拉伸
                ctx.rotate(-0.3 * actionProgress);
                ctx.scale(1 + 0.2 * actionProgress, 1 - 0.1 * actionProgress);
                break;
            case 'punch_right':
                // 右拳：身体大幅右倾 + 水平拉伸
                ctx.rotate(0.3 * actionProgress);
                ctx.scale(1 + 0.2 * actionProgress, 1 - 0.1 * actionProgress);
                break;
            case 'block':
                // 格挡：身体明显收缩 + 下沉
                ctx.scale(1 - 0.15 * actionProgress, 1 - 0.1 * actionProgress);
                ctx.translate(0, 15 * this.scale * actionProgress);
                break;
            case 'dodge_up':
                // 跳闪：身体上移 + 纵向拉伸
                ctx.translate(0, -40 * this.scale * actionProgress);
                ctx.scale(1 - 0.1 * actionProgress, 1 + 0.2 * actionProgress);
                break;
            case 'dodge_down':
                // 蹲闪：身体大幅压扁 + 下沉
                ctx.translate(0, 30 * this.scale * actionProgress);
                ctx.scale(1 + 0.25 * actionProgress, 1 - 0.4 * actionProgress);
                break;
            case 'hit':
                // 受伤：身体后仰
                ctx.rotate(this.rotation);
                ctx.scale(1 - 0.1 * actionProgress, 1 - 0.1 * actionProgress);
                break;
            case 'hold':
                // 蓄力：身体前倾
                ctx.rotate(0.15 * actionProgress);
                ctx.scale(1 + 0.1 * actionProgress, 1);
                break;
            default:
                // idle：无变换
                break;
        }
        
        ctx.drawImage(this.spriteImage, -spriteWidth / 2, -spriteHeight / 2, spriteWidth, spriteHeight);
        ctx.restore();
    } else {
        // 图片未加载，使用原有的 Canvas 手绘逻辑作为 fallback
        // 渲染残影
        if (this.ultimateMode) {
            for (var i = 0; i < this.afterimages.length; i++) {
                var afterimage = this.afterimages[i];
                ctx.save();
                ctx.globalAlpha = afterimage.alpha * 0.3;
                ctx.translate(afterimage.x, afterimage.y + this.breathOffset);
                ctx.rotate(afterimage.rotation);
                ctx.scale(this.scale, this.scale);
                this.drawPose(ctx, 0, 0, afterimage.state);
                ctx.restore();
            }
        }
        
        // 渲染主体
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(this.rotation);
        ctx.scale(this.scale, this.scale);
        
        // 无我境界发光效果
        if (this.ultimateMode) {
            ctx.shadowColor = '#FFD700';
            ctx.shadowBlur = 20;
        }
        
        this.drawPose(ctx, 0, 0, this.currentState);
        ctx.restore();
    }
};

Player.prototype.drawPose = function(ctx, centerX, centerY, state) {
    ctx.fillStyle = '#333333';
    ctx.strokeStyle = '#222222';
    
    switch (state) {
        case STATES.IDLE:
            this.drawIdlePose(ctx, centerX, centerY);
            break;
        case STATES.PUNCH_LEFT:
            this.drawPunchLeftPose(ctx, centerX, centerY);
            break;
        case STATES.PUNCH_RIGHT:
            this.drawPunchRightPose(ctx, centerX, centerY);
            break;
        case STATES.BLOCK:
            this.drawBlockPose(ctx, centerX, centerY);
            break;
        case STATES.DODGE_UP:
            this.drawJumpPose(ctx, centerX, centerY);
            break;
        case STATES.DODGE_DOWN:
            this.drawCrouchPose(ctx, centerX, centerY);
            break;
        case STATES.HOLD:
            this.drawHoldPose(ctx, centerX, centerY);
            break;
        case STATES.HIT:
            this.drawHitPose(ctx, centerX, centerY);
            break;
    }
};

// 站立待机姿态
Player.prototype.drawIdlePose = function(ctx, cx, cy) {
    ctx.lineWidth = 8;
    
    // 长袍下摆
    ctx.beginPath();
    ctx.moveTo(cx - 25, cy + 80);
    ctx.quadraticCurveTo(cx - 35, cy + 120, cx - 20, cy + 150);
    ctx.quadraticCurveTo(cx, cy + 140, cx + 20, cy + 150);
    ctx.quadraticCurveTo(cx + 35, cy + 120, cx + 25, cy + 80);
    ctx.closePath();
    ctx.fill();
    
    // 身体主体
    ctx.beginPath();
    ctx.moveTo(cx - 20, cy + 20);
    ctx.quadraticCurveTo(cx - 25, cy + 60, cx - 25, cy + 80);
    ctx.lineTo(cx + 25, cy + 80);
    ctx.quadraticCurveTo(cx + 25, cy + 60, cx + 20, cy + 20);
    ctx.closePath();
    ctx.fill();
    
    // 头部
    ctx.beginPath();
    ctx.arc(cx, cy, 18, 0, Math.PI * 2);
    ctx.fill();
    
    // 发髻
    ctx.beginPath();
    ctx.arc(cx + 5, cy - 20, 8, 0, Math.PI * 2);
    ctx.fill();
    
    // 左臂
    ctx.beginPath();
    ctx.moveTo(cx - 18, cy + 25);
    ctx.quadraticCurveTo(cx - 35, cy + 50, cx - 30, cy + 70);
    ctx.stroke();
    
    // 右臂
    ctx.beginPath();
    ctx.moveTo(cx + 18, cy + 25);
    ctx.quadraticCurveTo(cx + 35, cy + 50, cx + 30, cy + 70);
    ctx.stroke();
    
    // 飘带
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(cx - 20, cy + 40);
    ctx.quadraticCurveTo(cx - 50, cy + 60, cx - 40, cy + 90);
    ctx.quadraticCurveTo(cx - 30, cy + 100, cx - 25, cy + 110);
    ctx.stroke();
};

// 左拳出击
Player.prototype.drawPunchLeftPose = function(ctx, cx, cy) {
    ctx.lineWidth = 8;
    
    // 身体略微前倾
    ctx.beginPath();
    ctx.moveTo(cx - 18, cy + 20);
    ctx.quadraticCurveTo(cx - 22, cy + 60, cx - 22, cy + 80);
    ctx.lineTo(cx + 28, cy + 80);
    ctx.quadraticCurveTo(cx + 22, cy + 60, cx + 18, cy + 20);
    ctx.closePath();
    ctx.fill();
    
    // 头部
    ctx.beginPath();
    ctx.arc(cx, cy - 3, 18, 0, Math.PI * 2);
    ctx.fill();
    
    // 发髻
    ctx.beginPath();
    ctx.arc(cx + 5, cy - 23, 8, 0, Math.PI * 2);
    ctx.fill();
    
    // 长袍下摆
    ctx.beginPath();
    ctx.moveTo(cx - 22, cy + 80);
    ctx.quadraticCurveTo(cx - 32, cy + 120, cx - 17, cy + 150);
    ctx.quadraticCurveTo(cx + 3, cy + 140, cx + 23, cy + 150);
    ctx.quadraticCurveTo(cx + 38, cy + 120, cx + 28, cy + 80);
    ctx.closePath();
    ctx.fill();
    
    // 左臂向前伸展
    ctx.beginPath();
    ctx.moveTo(cx - 16, cy + 22);
    ctx.lineTo(cx - 60, cy + 15);
    ctx.stroke();
    
    // 左拳
    ctx.beginPath();
    ctx.arc(cx - 65, cy + 15, 10, 0, Math.PI * 2);
    ctx.fill();
    
    // 右臂后摆
    ctx.beginPath();
    ctx.moveTo(cx + 16, cy + 22);
    ctx.quadraticCurveTo(cx + 40, cy + 30, cx + 35, cy + 60);
    ctx.stroke();
    
    // 飘带飘动
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(cx - 18, cy + 40);
    ctx.quadraticCurveTo(cx - 55, cy + 30, cx - 60, cy + 60);
    ctx.stroke();
};

// 右拳出击
Player.prototype.drawPunchRightPose = function(ctx, cx, cy) {
    ctx.lineWidth = 8;
    
    // 身体略微前倾
    ctx.beginPath();
    ctx.moveTo(cx - 18, cy + 20);
    ctx.quadraticCurveTo(cx - 22, cy + 60, cx - 22, cy + 80);
    ctx.lineTo(cx + 28, cy + 80);
    ctx.quadraticCurveTo(cx + 22, cy + 60, cx + 18, cy + 20);
    ctx.closePath();
    ctx.fill();
    
    // 头部
    ctx.beginPath();
    ctx.arc(cx, cy - 3, 18, 0, Math.PI * 2);
    ctx.fill();
    
    // 发髻
    ctx.beginPath();
    ctx.arc(cx + 5, cy - 23, 8, 0, Math.PI * 2);
    ctx.fill();
    
    // 长袍下摆
    ctx.beginPath();
    ctx.moveTo(cx - 22, cy + 80);
    ctx.quadraticCurveTo(cx - 32, cy + 120, cx - 17, cy + 150);
    ctx.quadraticCurveTo(cx + 3, cy + 140, cx + 23, cy + 150);
    ctx.quadraticCurveTo(cx + 38, cy + 120, cx + 28, cy + 80);
    ctx.closePath();
    ctx.fill();
    
    // 左臂后摆
    ctx.beginPath();
    ctx.moveTo(cx - 16, cy + 22);
    ctx.quadraticCurveTo(cx - 40, cy + 30, cx - 35, cy + 60);
    ctx.stroke();
    
    // 右臂向前伸展
    ctx.beginPath();
    ctx.moveTo(cx + 16, cy + 22);
    ctx.lineTo(cx + 60, cy + 15);
    ctx.stroke();
    
    // 右拳
    ctx.beginPath();
    ctx.arc(cx + 65, cy + 15, 10, 0, Math.PI * 2);
    ctx.fill();
    
    // 飘带飘动
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(cx + 18, cy + 40);
    ctx.quadraticCurveTo(cx + 55, cy + 30, cx + 60, cy + 60);
    ctx.stroke();
};

// 双臂格挡
Player.prototype.drawBlockPose = function(ctx, cx, cy) {
    ctx.lineWidth = 8;
    
    // 身体
    ctx.beginPath();
    ctx.moveTo(cx - 20, cy + 20);
    ctx.quadraticCurveTo(cx - 25, cy + 60, cx - 25, cy + 80);
    ctx.lineTo(cx + 25, cy + 80);
    ctx.quadraticCurveTo(cx + 25, cy + 60, cx + 20, cy + 20);
    ctx.closePath();
    ctx.fill();
    
    // 头部
    ctx.beginPath();
    ctx.arc(cx, cy, 18, 0, Math.PI * 2);
    ctx.fill();
    
    // 发髻
    ctx.beginPath();
    ctx.arc(cx + 5, cy - 20, 8, 0, Math.PI * 2);
    ctx.fill();
    
    // 长袍下摆
    ctx.beginPath();
    ctx.moveTo(cx - 25, cy + 80);
    ctx.quadraticCurveTo(cx - 35, cy + 120, cx - 20, cy + 150);
    ctx.quadraticCurveTo(cx, cy + 140, cx + 20, cy + 150);
    ctx.quadraticCurveTo(cx + 35, cy + 120, cx + 25, cy + 80);
    ctx.closePath();
    ctx.fill();
    
    // 左臂上举格挡
    ctx.beginPath();
    ctx.moveTo(cx - 18, cy + 25);
    ctx.quadraticCurveTo(cx - 35, cy + 10, cx - 25, cy - 15);
    ctx.lineTo(cx - 5, cy - 5);
    ctx.stroke();
    
    // 右臂上举格挡
    ctx.beginPath();
    ctx.moveTo(cx + 18, cy + 25);
    ctx.quadraticCurveTo(cx + 35, cy + 10, cx + 25, cy - 15);
    ctx.lineTo(cx + 5, cy - 5);
    ctx.stroke();
    
    // 飘带
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(cx - 20, cy + 40);
    ctx.quadraticCurveTo(cx - 50, cy + 50, cx - 45, cy + 80);
    ctx.stroke();
};

// 跳跃闪避
Player.prototype.drawJumpPose = function(ctx, cx, cy) {
    ctx.lineWidth = 8;
    
    // 身体
    ctx.beginPath();
    ctx.moveTo(cx - 18, cy + 20);
    ctx.quadraticCurveTo(cx - 25, cy + 60, cx - 25, cy + 80);
    ctx.lineTo(cx + 25, cy + 80);
    ctx.quadraticCurveTo(cx + 25, cy + 60, cx + 18, cy + 20);
    ctx.closePath();
    ctx.fill();
    
    // 头部
    ctx.beginPath();
    ctx.arc(cx, cy - 5, 18, 0, Math.PI * 2);
    ctx.fill();
    
    // 发髻
    ctx.beginPath();
    ctx.arc(cx + 5, cy - 25, 8, 0, Math.PI * 2);
    ctx.fill();
    
    // 长袍下摆
    ctx.beginPath();
    ctx.moveTo(cx - 25, cy + 80);
    ctx.quadraticCurveTo(cx - 35, cy + 120, cx - 20, cy + 150);
    ctx.quadraticCurveTo(cx, cy + 140, cx + 20, cy + 150);
    ctx.quadraticCurveTo(cx + 35, cy + 120, cx + 25, cy + 80);
    ctx.closePath();
    ctx.fill();
    
    // 双臂上举
    ctx.beginPath();
    ctx.moveTo(cx - 18, cy + 25);
    ctx.quadraticCurveTo(cx - 30, cy + 5, cx - 25, cy - 20);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(cx + 18, cy + 25);
    ctx.quadraticCurveTo(cx + 30, cy + 5, cx + 25, cy - 20);
    ctx.stroke();
    
    // 飘带向上飘
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(cx - 20, cy + 40);
    ctx.quadraticCurveTo(cx - 45, cy + 20, cx - 50, cy - 10);
    ctx.stroke();
};

// 下蹲闪避
Player.prototype.drawCrouchPose = function(ctx, cx, cy) {
    ctx.lineWidth = 8;
    
    // 身体压低
    ctx.beginPath();
    ctx.moveTo(cx - 18, cy + 35);
    ctx.quadraticCurveTo(cx - 25, cy + 65, cx - 25, cy + 80);
    ctx.lineTo(cx + 25, cy + 80);
    ctx.quadraticCurveTo(cx + 25, cy + 65, cx + 18, cy + 35);
    ctx.closePath();
    ctx.fill();
    
    // 头部降低
    ctx.beginPath();
    ctx.arc(cx, cy + 15, 18, 0, Math.PI * 2);
    ctx.fill();
    
    // 发髻
    ctx.beginPath();
    ctx.arc(cx + 5, cy - 5, 8, 0, Math.PI * 2);
    ctx.fill();
    
    // 长袍下摆
    ctx.beginPath();
    ctx.moveTo(cx - 25, cy + 80);
    ctx.quadraticCurveTo(cx - 35, cy + 120, cx - 20, cy + 150);
    ctx.quadraticCurveTo(cx, cy + 140, cx + 20, cy + 150);
    ctx.quadraticCurveTo(cx + 35, cy + 120, cx + 25, cy + 80);
    ctx.closePath();
    ctx.fill();
    
    // 双臂抱膝
    ctx.beginPath();
    ctx.moveTo(cx - 18, cy + 40);
    ctx.quadraticCurveTo(cx - 30, cy + 55, cx - 15, cy + 60);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(cx + 18, cy + 40);
    ctx.quadraticCurveTo(cx + 30, cy + 55, cx + 15, cy + 60);
    ctx.stroke();
    
    // 飘带
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(cx - 20, cy + 50);
    ctx.quadraticCurveTo(cx - 50, cy + 70, cx - 45, cy + 100);
    ctx.stroke();
};

// 蓄力推掌
Player.prototype.drawHoldPose = function(ctx, cx, cy) {
    ctx.lineWidth = 8;
    
    // 身体前倾
    ctx.beginPath();
    ctx.moveTo(cx - 18, cy + 20);
    ctx.quadraticCurveTo(cx - 22, cy + 60, cx - 22, cy + 80);
    ctx.lineTo(cx + 28, cy + 80);
    ctx.quadraticCurveTo(cx + 22, cy + 60, cx + 18, cy + 20);
    ctx.closePath();
    ctx.fill();
    
    // 头部
    ctx.beginPath();
    ctx.arc(cx, cy - 3, 18, 0, Math.PI * 2);
    ctx.fill();
    
    // 发髻
    ctx.beginPath();
    ctx.arc(cx + 5, cy - 23, 8, 0, Math.PI * 2);
    ctx.fill();
    
    // 长袍下摆
    ctx.beginPath();
    ctx.moveTo(cx - 22, cy + 80);
    ctx.quadraticCurveTo(cx - 32, cy + 120, cx - 17, cy + 150);
    ctx.quadraticCurveTo(cx + 3, cy + 140, cx + 23, cy + 150);
    ctx.quadraticCurveTo(cx + 38, cy + 120, cx + 28, cy + 80);
    ctx.closePath();
    ctx.fill();
    
    // 左手收于腰间
    ctx.beginPath();
    ctx.moveTo(cx - 16, cy + 22);
    ctx.quadraticCurveTo(cx - 25, cy + 40, cx - 15, cy + 50);
    ctx.stroke();
    
    // 右手推掌向前
    ctx.beginPath();
    ctx.moveTo(cx + 16, cy + 22);
    ctx.lineTo(cx + 55, cy + 20);
    ctx.stroke();
    
    // 掌心
    ctx.beginPath();
    ctx.ellipse(cx + 60, cy + 20, 8, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // 飘带激荡
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(cx - 18, cy + 40);
    ctx.quadraticCurveTo(cx - 55, cy + 25, cx - 65, cy + 55);
    ctx.stroke();
};

// 受伤姿态
Player.prototype.drawHitPose = function(ctx, cx, cy) {
    ctx.lineWidth = 8;
    
    // 身体后仰
    ctx.beginPath();
    ctx.moveTo(cx - 18, cy + 20);
    ctx.quadraticCurveTo(cx - 28, cy + 55, cx - 28, cy + 75);
    ctx.lineTo(cx + 22, cy + 75);
    ctx.quadraticCurveTo(cx + 12, cy + 55, cx + 18, cy + 20);
    ctx.closePath();
    ctx.fill();
    
    // 头部后仰
    ctx.beginPath();
    ctx.arc(cx - 5, cy - 5, 18, 0, Math.PI * 2);
    ctx.fill();
    
    // 发髻
    ctx.beginPath();
    ctx.arc(cx, cy - 25, 8, 0, Math.PI * 2);
    ctx.fill();
    
    // 长袍下摆
    ctx.beginPath();
    ctx.moveTo(cx - 28, cy + 75);
    ctx.quadraticCurveTo(cx - 38, cy + 115, cx - 23, cy + 145);
    ctx.quadraticCurveTo(cx - 3, cy + 135, cx + 17, cy + 145);
    ctx.quadraticCurveTo(cx + 32, cy + 115, cx + 22, cy + 75);
    ctx.closePath();
    ctx.fill();
    
    // 左臂护胸
    ctx.beginPath();
    ctx.moveTo(cx - 16, cy + 22);
    ctx.quadraticCurveTo(cx - 30, cy + 35, cx - 20, cy + 45);
    ctx.stroke();
    
    // 右臂护胸
    ctx.beginPath();
    ctx.moveTo(cx + 16, cy + 22);
    ctx.quadraticCurveTo(cx + 30, cy + 35, cx + 20, cy + 45);
    ctx.stroke();
    
    // 飘带散乱
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(cx - 20, cy + 40);
    ctx.quadraticCurveTo(cx - 55, cy + 55, cx - 50, cy + 85);
    ctx.stroke();
};

Player.prototype.setUltimateMode = function(active) {
    this.ultimateMode = active;
    if (!active) {
        this.afterimages = [];
    }
};

Player.prototype.takeDamage = function() {
    this.currentState = STATES.HIT;
    this.actionTimer = ACTION_DURATION;
    this.animOffsetX = 0;
    this.animOffsetY = 0;
};

export default Player;
