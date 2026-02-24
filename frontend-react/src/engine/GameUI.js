/**
 * GameUI - 《墨韵节拍：止戈》UI 层
 * 使用 Canvas 2D API 绘制所有 UI 元素
 */

function GameUI(width, height) {
    this.width = width;
    this.height = height;
    
    // 游戏状态
    this.qi = 0;
    this.combo = 0;
    this.score = 0;
    this.progress = 0;
    this.ultimateMode = false;
    
    // 动画状态
    this.comboScale = 1;
    this.comboTargetScale = 1;
    this.pulseTime = 0;
    this.startScreenBlink = 0;
    
    // 节拍提示相关
    this.beats = [];
    this.beatInterval = 1000;
    this.currentTime = 0;
    
    // 结算统计
    this.stats = null;
    
    // 配置
    this.colors = {
        qiBottom: '#4CAF50',
        qiTop: '#FFD700',
        qiBorder: '#2c3e50',
        combo: '#FF6B6B',
        score: '#FFFFFF',
        beatLine: '#FFFFFF',
        ultimate: '#FFD700'
    };
}

// 设置气势值 (0-100)
GameUI.prototype.setQi = function(value) {
    this.qi = Math.max(0, Math.min(100, value));
};

// 设置连击数
GameUI.prototype.setCombo = function(count) {
    if (count !== this.combo && count > 0) {
        this.comboTargetScale = 1.3;
    }
    this.combo = count;
    if (count === 0) {
        this.comboTargetScale = 1;
    }
};

// 设置分数
GameUI.prototype.setScore = function(score) {
    this.score = score;
};

// 设置进度 (0-1)
GameUI.prototype.setProgress = function(value) {
    this.progress = Math.max(0, Math.min(1, value));
};

// 设置无我境界状态
GameUI.prototype.setUltimateMode = function(active) {
    this.ultimateMode = active;
};

// 更新动画
GameUI.prototype.update = function(deltaTime) {
    // 连击数缩放动画恢复
    if (this.comboScale > this.comboTargetScale) {
        this.comboScale -= deltaTime * 3;
        if (this.comboScale < this.comboTargetScale) {
            this.comboScale = this.comboTargetScale;
        }
    } else if (this.comboScale < this.comboTargetScale) {
        this.comboScale += deltaTime * 5;
        if (this.comboScale > this.comboTargetScale) {
            this.comboScale = this.comboTargetScale;
        }
    }
    
    // 气势槽脉动效果
    if (this.qi >= 100) {
        this.pulseTime += deltaTime * 3;
    } else {
        this.pulseTime = 0;
    }
    
    // 开始界面闪烁效果
    this.startScreenBlink += deltaTime * 2;
};

// 渲染气势槽
GameUI.prototype.renderQiGauge = function(ctx) {
    const gaugeWidth = 40;
    const gaugeHeight = this.height * 0.5;
    const x = 30;
    const y = (this.height - gaugeHeight) / 2;
    
    ctx.save();
    
    // 外框 - 水墨风格
    ctx.strokeStyle = this.colors.qiBorder;
    ctx.lineWidth = 3;
    ctx.fillStyle = 'rgba(20, 20, 20, 0.8)';
    ctx.fillRect(x, y, gaugeWidth, gaugeHeight);
    ctx.strokeRect(x, y, gaugeWidth, gaugeHeight);
    
    // 内部填充渐变
    const fillHeight = (this.qi / 100) * gaugeHeight;
    if (fillHeight > 0) {
        const gradient = ctx.createLinearGradient(x, y + gaugeHeight, x, y);
        gradient.addColorStop(0, this.colors.qiBottom);
        gradient.addColorStop(1, this.colors.qiTop);
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x + 3, y + gaugeHeight - fillHeight + 3, gaugeWidth - 6, fillHeight - 6);
        
        // 气满时的发光脉动效果
        if (this.qi >= 100) {
            const pulseIntensity = 0.5 + Math.sin(this.pulseTime) * 0.3;
            ctx.shadowColor = this.colors.qiTop;
            ctx.shadowBlur = 20 * pulseIntensity;
            ctx.fillStyle = this.colors.qiTop;
            ctx.globalAlpha = pulseIntensity;
            ctx.fillRect(x + 3, y + 3, gaugeWidth - 6, gaugeHeight - 6);
            ctx.globalAlpha = 1;
        }
    }
    
    // 气值文字
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(Math.floor(this.qi) + '%', x + gaugeWidth / 2, y + gaugeHeight + 25);
    
    ctx.restore();
};

// 渲染连击数
GameUI.prototype.renderCombo = function(ctx) {
    if (this.combo <= 0) return;
    
    const x = this.width - 150;
    const y = 150;
    
    ctx.save();
    
    ctx.translate(x, y);
    ctx.scale(this.comboScale, this.comboScale);
    
    // 连击数字
    ctx.fillStyle = this.colors.combo;
    ctx.font = 'bold 64px Arial';
    ctx.textAlign = 'center';
    ctx.shadowColor = this.colors.combo;
    ctx.shadowBlur = 15;
    ctx.fillText(this.combo, 0, 0);
    
    // "连击" 文字
    ctx.font = 'bold 28px Arial';
    ctx.shadowBlur = 8;
    ctx.fillText('连击', 0, 35);
    
    ctx.restore();
};

// 渲染分数
GameUI.prototype.renderScore = function(ctx) {
    const x = this.width / 2;
    const y = 50;
    
    ctx.save();
    
    ctx.fillStyle = this.colors.score;
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#FFFFFF';
    ctx.shadowBlur = 10;
    ctx.fillText('分数: ' + this.score, x, y);
    
    ctx.restore();
};

// 渲染进度条
GameUI.prototype.renderProgressBar = function(ctx) {
    const barWidth = this.width * 0.8;
    const barHeight = 8;
    const x = (this.width - barWidth) / 2;
    const y = 15;
    
    ctx.save();
    
    // 背景条
    ctx.fillStyle = 'rgba(50, 50, 50, 0.8)';
    ctx.fillRect(x, y, barWidth, barHeight);
    
    // 进度条
    const progressWidth = barWidth * this.progress;
    const gradient = ctx.createLinearGradient(x, y, x + progressWidth, y);
    gradient.addColorStop(0, '#4CAF50');
    gradient.addColorStop(0.5, '#FFD700');
    gradient.addColorStop(1, '#FF6B6B');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, progressWidth, barHeight);
    
    // 边框
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, barWidth, barHeight);
    
    ctx.restore();
};

// 渲染节拍图标
GameUI.prototype.renderBeatIcon = function(ctx, type, x, y, size) {
    ctx.save();
    
    const halfSize = size / 2;
    
    switch (type) {
        case 'punch_left':
            // 左箭头 - 蓝色
            ctx.fillStyle = '#3498DB';
            ctx.beginPath();
            ctx.moveTo(x - halfSize, y);
            ctx.lineTo(x, y - halfSize);
            ctx.lineTo(x, y - halfSize * 0.3);
            ctx.lineTo(x + halfSize, y - halfSize * 0.3);
            ctx.lineTo(x + halfSize, y + halfSize * 0.3);
            ctx.lineTo(x, y + halfSize * 0.3);
            ctx.lineTo(x, y + halfSize);
            ctx.closePath();
            ctx.fill();
            break;
            
        case 'punch_right':
            // 右箭头 - 蓝色
            ctx.fillStyle = '#3498DB';
            ctx.beginPath();
            ctx.moveTo(x + halfSize, y);
            ctx.lineTo(x, y - halfSize);
            ctx.lineTo(x, y - halfSize * 0.3);
            ctx.lineTo(x - halfSize, y - halfSize * 0.3);
            ctx.lineTo(x - halfSize, y + halfSize * 0.3);
            ctx.lineTo(x, y + halfSize * 0.3);
            ctx.lineTo(x, y + halfSize);
            ctx.closePath();
            ctx.fill();
            break;
            
        case 'block':
            // 盾牌图标 - 黄色
            ctx.fillStyle = '#F39C12';
            ctx.beginPath();
            ctx.moveTo(x, y - halfSize);
            ctx.lineTo(x + halfSize * 0.8, y - halfSize * 0.6);
            ctx.lineTo(x + halfSize * 0.8, y + halfSize * 0.4);
            ctx.lineTo(x, y + halfSize);
            ctx.lineTo(x - halfSize * 0.8, y + halfSize * 0.4);
            ctx.lineTo(x - halfSize * 0.8, y - halfSize * 0.6);
            ctx.closePath();
            ctx.fill();
            break;
            
        case 'dodge_up':
            // 上箭头 - 绿色
            ctx.fillStyle = '#2ECC71';
            ctx.beginPath();
            ctx.moveTo(x, y - halfSize);
            ctx.lineTo(x + halfSize, y);
            ctx.lineTo(x + halfSize * 0.3, y);
            ctx.lineTo(x + halfSize * 0.3, y + halfSize);
            ctx.lineTo(x - halfSize * 0.3, y + halfSize);
            ctx.lineTo(x - halfSize * 0.3, y);
            ctx.lineTo(x - halfSize, y);
            ctx.closePath();
            ctx.fill();
            break;
            
        case 'dodge_down':
            // 下箭头 - 绿色
            ctx.fillStyle = '#2ECC71';
            ctx.beginPath();
            ctx.moveTo(x, y + halfSize);
            ctx.lineTo(x + halfSize, y);
            ctx.lineTo(x + halfSize * 0.3, y);
            ctx.lineTo(x + halfSize * 0.3, y - halfSize);
            ctx.lineTo(x - halfSize * 0.3, y - halfSize);
            ctx.lineTo(x - halfSize * 0.3, y);
            ctx.lineTo(x - halfSize, y);
            ctx.closePath();
            ctx.fill();
            break;
            
        case 'hold':
            // 长条 - 紫色
            ctx.fillStyle = '#9B59B6';
            ctx.fillRect(x - halfSize, y - halfSize * 0.5, size, halfSize);
            break;
    }
    
    ctx.restore();
};

// 渲染节拍提示条
GameUI.prototype.renderBeatTimeline = function(ctx, beats, currentTime, beatInterval) {
    if (!beats || beats.length === 0) return;
    
    this.beats = beats;
    this.currentTime = currentTime;
    this.beatInterval = beatInterval;
    
    const timelineHeight = 120;
    const timelineY = this.height - timelineHeight - 20;
    const judgeLineX = this.width * 0.2;
    const iconSize = 40;
    
    ctx.save();
    
    // 绘制背景
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(0, timelineY, this.width, timelineHeight);
    
    // 绘制判定线
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 3;
    ctx.shadowColor = '#FFFFFF';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.moveTo(judgeLineX, timelineY - 10);
    ctx.lineTo(judgeLineX, timelineY + timelineHeight + 10);
    ctx.stroke();
    ctx.shadowBlur = 0;
    
    // 绘制节拍图标
    beats.forEach(function(beat) {
        if (!beat || !beat.type) return;
        
        // 计算位置：节拍从右向左移动
        const timeUntilBeat = beat.time - currentTime;
        const pixelsPerSecond = this.width * 0.0008;
        const beatX = judgeLineX + timeUntilBeat * pixelsPerSecond;
        
        // 只渲染在屏幕范围内的节拍
        if (beatX > -50 && beatX < this.width + 50) {
            this.renderBeatIcon(ctx, beat.type, beatX, timelineY + timelineHeight / 2, iconSize);
            
            // 绘制节拍轨迹线
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(judgeLineX, timelineY + timelineHeight / 2);
            ctx.lineTo(beatX, timelineY + timelineHeight / 2);
            ctx.stroke();
        }
    }.bind(this));
    
    // 绘制轨道分隔线
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, timelineY);
    ctx.lineTo(this.width, timelineY);
    ctx.moveTo(0, timelineY + timelineHeight);
    ctx.lineTo(this.width, timelineY + timelineHeight);
    ctx.stroke();
    
    ctx.restore();
};

// 渲染无我境界效果
GameUI.prototype.renderUltimateMode = function(ctx) {
    if (!this.ultimateMode) return;
    
    ctx.save();
    
    // 背景变暗
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(0, 0, this.width, this.height);
    
    // 金色光晕边缘
    const gradient = ctx.createRadialGradient(
        this.width / 2, this.height / 2, this.width * 0.3,
        this.width / 2, this.height / 2, this.width * 0.8
    );
    gradient.addColorStop(0, 'rgba(255, 215, 0, 0)');
    gradient.addColorStop(0.7, 'rgba(255, 215, 0, 0.1)');
    gradient.addColorStop(1, 'rgba(255, 215, 0, 0.4)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.width, this.height);
    
    // 无我境界文字
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#FFD700';
    ctx.shadowBlur = 20;
    ctx.fillText('无我境界', this.width / 2, this.height / 2);
    
    ctx.restore();
};

// 渲染开始界面
GameUI.prototype.renderStartScreen = function(ctx) {
    ctx.save();
    
    // 背景
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, this.width, this.height);
    
    // 游戏标题 - 水墨风格
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 72px "Microsoft YaHei", Arial';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
    ctx.shadowBlur = 20;
    ctx.fillText('墨韵节拍：止戈', this.width / 2, this.height / 2 - 50);
    
    // 副标题
    ctx.font = '24px "Microsoft YaHei", Arial';
    ctx.shadowBlur = 10;
    ctx.fillText('武术节奏游戏', this.width / 2, this.height / 2);
    
    // 点击开始提示 - 呼吸闪烁效果
    const blinkAlpha = 0.5 + Math.sin(this.startScreenBlink) * 0.3;
    ctx.fillStyle = `rgba(255, 215, 0, ${blinkAlpha})`;
    ctx.font = 'bold 32px "Microsoft YaHei", Arial';
    ctx.shadowColor = '#FFD700';
    ctx.shadowBlur = 15;
    ctx.fillText('点击开始', this.width / 2, this.height / 2 + 80);
    
    // 操作提示
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = '18px Arial';
    ctx.shadowBlur = 5;
    ctx.fillText('使用方向键和空格键进行操作', this.width / 2, this.height / 2 + 140);
    
    ctx.restore();
};

// 渲染结算界面
GameUI.prototype.renderResultScreen = function(ctx, stats) {
    if (!stats) return;
    
    this.stats = stats;
    
    ctx.save();
    
    // 背景
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fillRect(0, 0, this.width, this.height);
    
    const centerX = this.width / 2;
    let startY = this.height * 0.2;
    
    // 标题
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 48px "Microsoft YaHei", Arial';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
    ctx.shadowBlur = 15;
    ctx.fillText('游戏结束', centerX, startY);
    startY += 80;
    
    // 评级
    let grade = 'C';
    const total = stats.perfect + stats.great + stats.good + stats.miss;
    if (total > 0) {
        const accuracy = (stats.perfect * 100 + stats.great * 80 + stats.good * 60) / total;
        if (accuracy >= 95 && stats.miss === 0) grade = 'S';
        else if (accuracy >= 90) grade = 'A';
        else if (accuracy >= 75) grade = 'B';
    }
    
    ctx.font = 'bold 120px Arial';
    ctx.shadowColor = '#FFD700';
    ctx.shadowBlur = 30;
    ctx.fillStyle = grade === 'S' ? '#FFD700' : (grade === 'A' ? '#FF6B6B' : (grade === 'B' ? '#4CAF50' : '#9E9E9E'));
    ctx.fillText(grade, centerX, startY);
    startY += 100;
    
    // 分数
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 36px Arial';
    ctx.shadowBlur = 10;
    ctx.fillText('最终分数: ' + stats.score, centerX, startY);
    startY += 50;
    
    // 最大连击
    ctx.fillText('最大连击: ' + stats.maxCombo, centerX, startY);
    startY += 70;
    
    // 统计数据
    const statsData = [
        { label: 'Perfect', value: stats.perfect, color: '#FFD700' },
        { label: 'Great', value: stats.great, color: '#4CAF50' },
        { label: 'Good', value: stats.good, color: '#3498DB' },
        { label: 'Miss', value: stats.miss, color: '#FF6B6B' }
    ];
    
    statsData.forEach(function(stat) {
        ctx.fillStyle = stat.color;
        ctx.font = 'bold 28px Arial';
        ctx.fillText(stat.label + ': ' + stat.value, centerX, startY);
        startY += 40;
    });
    
    // 重新开始提示
    startY += 40;
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 28px "Microsoft YaHei", Arial';
    ctx.shadowColor = '#FFD700';
    ctx.shadowBlur = 15;
    ctx.fillText('点击重新开始', centerX, startY);
    
    ctx.restore();
};

// 主渲染方法
GameUI.prototype.render = function(ctx) {
    // 清除画布
    ctx.clearRect(0, 0, this.width, this.height);
    
    // 渲染无我境界效果（背景层）
    this.renderUltimateMode(ctx);
    
    // 渲染进度条
    this.renderProgressBar(ctx);
    
    // 渲染分数
    this.renderScore(ctx);
    
    // 渲染连击数
    this.renderCombo(ctx);
    
    // 渲染气势槽
    this.renderQiGauge(ctx);
    
    // 渲染节拍提示条
    if (this.beats && this.beats.length > 0) {
        this.renderBeatTimeline(ctx, this.beats, this.currentTime, this.beatInterval);
    }
};

export default GameUI;
