/**
 * 墨韵节拍：止戈 - 节奏引擎模块
 * 武术节奏游戏核心系统
 */

/**
 * 节奏引擎类
 */
class RhythmEngine {
    constructor(options) {
        this.bpm = options && options.bpm ? options.bpm : 120;
        this.beats = [];
        this.startTime = 0;
        this.isPlaying = false;
        this.beatInterval = this.getBeatInterval();
        this.loadLevel('bamboo_battle');
        
        // 统计数据
        this.stats = {
            perfect: 0,
            great: 0,
            good: 0,
            miss: 0
        };
    }

    /**
     * 获取每拍间隔（毫秒）
     */
    getBeatInterval() {
        return 60000 / this.bpm;
    }

    /**
     * 设置 BPM
     */
    setBPM(bpm) {
        this.bpm = bpm;
        this.beatInterval = this.getBeatInterval();
    }

    /**
     * 获取当前 BPM
     */
    getBPM() {
        return this.bpm;
    }

    /**
     * 加载关卡谱面（本地内置）
     */
    loadLevel(levelName) {
        this.beats = [];
        
        if (levelName === 'bamboo_battle') {
            this.generateBambooBattleLevel();
        }
    }

    /**
     * 从后端 API 数据加载谱面
     * @param {Object} levelData - 后端返回的关卡数据 {bpm, beats: [{time, type, duration, enemyType}]}
     */
    loadFromApiData(levelData) {
        if (levelData.bpm) {
            this.bpm = levelData.bpm;
            this.beatInterval = this.getBeatInterval();
        }
        
        this.beats = [];
        if (levelData.beats && levelData.beats.length > 0) {
            for (var i = 0; i < levelData.beats.length; i++) {
                var apiBeat = levelData.beats[i];
                this.beats.push({
                    time: apiBeat.time,
                    type: apiBeat.type,
                    duration: apiBeat.duration || 0,
                    enemyType: apiBeat.enemyType || 'white',
                    hit: false,
                    missed: false
                });
            }
        }
    }

    /**
     * 生成竹林对决关卡谱面
     * BPM=120, 约60秒, 120拍
     */
    generateBambooBattleLevel() {
        const interval = this.beatInterval; // 500ms per beat
        
        // 前 16 拍：简单的左右出拳交替
        for (let i = 0; i < 16; i++) {
            const type = i % 2 === 0 ? 'punch_left' : 'punch_right';
            this.beats.push({
                time: i * interval,
                type: type,
                duration: 0,
                enemyType: 'white',
                hit: false,
                missed: false
            });
        }

        // 17-32 拍：加入格挡
        for (let i = 16; i < 32; i++) {
            let type;
            if (i % 4 === 0) type = 'block';
            else if (i % 4 === 1) type = 'punch_left';
            else if (i % 4 === 2) type = 'punch_right';
            else type = 'block';
            
            this.beats.push({
                time: i * interval,
                type: type,
                duration: 0,
                enemyType: i % 3 === 0 ? 'red' : 'white',
                hit: false,
                missed: false
            });
        }

        // 33-48 拍：加入闪避
        for (let i = 32; i < 48; i++) {
            let type;
            if (i % 8 === 0 || i % 8 === 4) type = 'dodge_up';
            else if (i % 8 === 1 || i % 8 === 5) type = 'dodge_down';
            else if (i % 8 === 2) type = 'punch_left';
            else if (i % 8 === 3) type = 'punch_right';
            else type = 'block';
            
            this.beats.push({
                time: i * interval,
                type: type,
                duration: 0,
                enemyType: i % 4 === 0 ? 'stealth' : (i % 2 === 0 ? 'red' : 'white'),
                hit: false,
                missed: false
            });
        }

        // 49-64 拍：混合所有类型 + 连击段
        for (let i = 48; i < 64; i++) {
            let type;
            const mod = i % 12;
            
            // 连击模式
            if (mod >= 0 && mod <= 3) {
                // 快速连击
                type = mod % 2 === 0 ? 'punch_left' : 'punch_right';
            } else if (mod === 4) {
                type = 'block';
            } else if (mod === 5) {
                type = 'dodge_up';
            } else if (mod === 6) {
                type = 'dodge_down';
            } else if (mod === 7) {
                type = 'punch_left';
            } else if (mod === 8) {
                type = 'hold';
            } else if (mod === 9) {
                type = 'punch_right';
            } else if (mod === 10) {
                type = 'block';
            } else {
                type = 'dodge_up';
            }
            
            const duration = type === 'hold' ? 400 : 0;
            
            this.beats.push({
                time: i * interval,
                type: type,
                duration: duration,
                enemyType: i % 3 === 0 ? 'stealth' : (i % 2 === 0 ? 'red' : 'white'),
                hit: false,
                missed: false
            });
        }

        // 65-96 拍：更复杂的混合模式
        for (let i = 64; i < 96; i++) {
            let type;
            const mod = i % 16;
            
            if (mod === 0 || mod === 8) type = 'hold';
            else if (mod === 1 || mod === 2) type = 'punch_left';
            else if (mod === 3 || mod === 4) type = 'punch_right';
            else if (mod === 5) type = 'block';
            else if (mod === 6) type = 'dodge_up';
            else if (mod === 7) type = 'dodge_down';
            else if (mod === 9) type = 'punch_left';
            else if (mod === 10) type = 'block';
            else if (mod === 11) type = 'punch_right';
            else if (mod === 12) type = 'dodge_down';
            else if (mod === 13) type = 'dodge_up';
            else if (mod === 14) type = 'punch_left';
            else type = 'punch_right';
            
            const duration = type === 'hold' ? 500 : 0;
            
            this.beats.push({
                time: i * interval,
                type: type,
                duration: duration,
                enemyType: (i % 5 === 0) ? 'stealth' : ((i % 3 === 0) ? 'red' : 'white'),
                hit: false,
                missed: false
            });
        }

        // 97-120 拍：高潮段
        for (let i = 96; i < 120; i++) {
            let type;
            const mod = i % 24;
            
            if (mod < 4) {
                type = mod % 2 === 0 ? 'punch_left' : 'punch_right';
            } else if (mod < 8) {
                type = (mod % 2 === 0) ? 'dodge_up' : 'dodge_down';
            } else if (mod < 12) {
                type = 'block';
            } else if (mod < 16) {
                type = mod % 2 === 0 ? 'punch_left' : 'punch_right';
            } else if (mod < 20) {
                type = mod % 2 === 0 ? 'dodge_up' : 'dodge_down';
            } else {
                type = 'hold';
            }
            
            const duration = type === 'hold' ? 600 : 0;
            
            this.beats.push({
                time: i * interval,
                type: type,
                duration: duration,
                enemyType: (i % 4 === 0) ? 'stealth' : ((i % 2 === 0) ? 'red' : 'white'),
                hit: false,
                missed: false
            });
        }
    }

    /**
     * 开始节奏引擎
     */
    start() {
        this.startTime = Date.now();
        this.isPlaying = true;
    }

    /**
     * 获取已经过的时间（毫秒）
     */
    getElapsedTime() {
        if (!this.isPlaying) return 0;
        return Date.now() - this.startTime;
    }

    /**
     * 获取当前拍号
     */
    getCurrentBeatIndex() {
        if (!this.isPlaying) return 0;
        return Math.floor(this.getElapsedTime() / this.beatInterval);
    }

    /**
     * 获取当前进度 0-1
     */
    getProgress() {
        if (this.beats.length === 0) return 0;
        const elapsed = this.getElapsedTime();
        const lastBeatTime = this.beats[this.beats.length - 1].time;
        return Math.min(1, elapsed / (lastBeatTime + 2000));
    }

    /**
     * 是否播放完毕
     */
    isFinished() {
        if (!this.isPlaying) return false;
        const elapsed = this.getElapsedTime();
        const lastBeat = this.beats[this.beats.length - 1];
        if (!lastBeat) return true;
        return elapsed > lastBeat.time + 2000;
    }

    /**
     * 获取当前时间窗口内需要显示的节拍（前后2秒窗口）
     */
    getCurrentBeats() {
        const elapsed = this.getElapsedTime();
        const windowStart = elapsed - 2000;
        const windowEnd = elapsed + 2000;
        
        return this.beats.filter(function(beat) {
            return beat.time >= windowStart && beat.time <= windowEnd;
        });
    }

    /**
     * 判定玩家输入
     * @param {string} inputType - 输入类型
     * @param {number} inputTime - 输入时间（可选，默认为当前时间）
     * @returns {Object} {rating, beat, timeDiff}
     */
    judge(inputType, inputTime) {
        if (!this.isPlaying) {
            return { rating: 'miss', beat: null, timeDiff: 0 };
        }
        
        const time = inputTime || Date.now();
        const elapsed = time - this.startTime;
        
        // 查找最近的未击中且未错过的节拍
        let closestBeat = null;
        let closestDiff = Infinity;
        
        for (let i = 0; i < this.beats.length; i++) {
            const beat = this.beats[i];
            if (beat.hit || beat.missed) continue;
            
            // 检查输入类型是否匹配
            let typeMatch = false;
            if (inputType === 'punch') {
                typeMatch = (beat.type === 'punch_left' || beat.type === 'punch_right');
            } else if (inputType === 'block') {
                typeMatch = (beat.type === 'block');
            } else if (inputType === 'dodge_up') {
                typeMatch = (beat.type === 'dodge_up');
            } else if (inputType === 'dodge_down') {
                typeMatch = (beat.type === 'dodge_down');
            } else if (inputType === 'hold') {
                typeMatch = (beat.type === 'hold');
            } else {
                typeMatch = (beat.type === inputType);
            }
            
            if (!typeMatch) continue;
            
            const diff = Math.abs(beat.time - elapsed);
            
            // 只考虑时间差在300ms以内的
            if (diff > 300) continue;
            
            if (diff < closestDiff) {
                closestDiff = diff;
                closestBeat = beat;
            }
        }
        
        if (!closestBeat) {
            return { rating: 'miss', beat: null, timeDiff: 0 };
        }
        
        // 判定评级
        let rating;
        const absDiff = closestDiff;
        
        if (absDiff <= 50) {
            rating = 'perfect';
        } else if (absDiff <= 100) {
            rating = 'great';
        } else if (absDiff <= 150) {
            rating = 'good';
        } else {
            rating = 'miss';
        }
        
        // 标记节拍状态并更新统计
        if (rating !== 'miss') {
            closestBeat.hit = true;
            this.stats[rating]++;
        }
        
        return {
            rating: rating,
            beat: closestBeat,
            timeDiff: closestBeat.time - elapsed
        };
    }

    /**
     * 更新节奏状态，标记已错过的节拍
     * @param {number} currentTime - 当前时间（可选）
     */
    update(currentTime) {
        if (!this.isPlaying) return;
        
        const elapsed = currentTime ? currentTime - this.startTime : this.getElapsedTime();
        
        for (let i = 0; i < this.beats.length; i++) {
            const beat = this.beats[i];
            if (!beat.hit && !beat.missed) {
                // 如果节拍时间已过超过150ms，标记为错过
                if (elapsed > beat.time + 150) {
                    beat.missed = true;
                    this.stats.miss++;
                }
            }
        }
    }

    /**
     * 获取所有节拍
     */
    getAllBeats() {
        return this.beats;
    }

    /**
     * 重置引擎
     */
    reset() {
        this.isPlaying = false;
        this.startTime = 0;
        for (let i = 0; i < this.beats.length; i++) {
            this.beats[i].hit = false;
            this.beats[i].missed = false;
        }
        // 重置统计数据
        this.stats = {
            perfect: 0,
            great: 0,
            good: 0,
            miss: 0
        };
    }

    /**
     * 获取统计数据
     */
    getStats() {
        const total = this.beats.length;
        const hitCount = this.stats.perfect + this.stats.great + this.stats.good;
        
        return {
            perfect: this.stats.perfect,
            great: this.stats.great,
            good: this.stats.good,
            miss: this.stats.miss,
            total: total,
            accuracy: total > 0 ? hitCount / total : 0
        };
    }
}

export default RhythmEngine;
