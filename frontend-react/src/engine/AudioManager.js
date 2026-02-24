/**
 * 墨韵节拍：止戈 - 音频管理模块
 * 使用 Web Audio API 程序化生成所有音效
 */

// AudioContext 实例
var audioContext = null;

// 音乐相关状态
var isPlaying = false;
var currentBpm = 120;
var musicIntensityLevel = 0;
var musicIntervalId = null;
var beatCount = 0;

// 外部 BGM 相关状态
var bgmAudio = null;
var bgmLoaded = false;

// 页面加载时立即开始预加载 BGM
(function preloadBgm() {
    bgmAudio = new Audio('/assets/bgm.mp3');
    bgmAudio.loop = true;
    bgmAudio.volume = 0.5;
    bgmAudio.preload = 'auto';
    
    bgmAudio.addEventListener('canplaythrough', function() {
        bgmLoaded = true;
    });
    
    bgmAudio.addEventListener('error', function() {
        bgmLoaded = false;
        bgmAudio = null;
        console.warn('BGM 文件加载失败，将使用程序化生成的背景音乐');
    });
    
    bgmAudio.load();
})();

// 五声音阶频率 (C D E G A) - C大调五声音阶
var pentatonicScale = {
    C3: 130.81,
    D3: 146.83,
    E3: 164.81,
    G3: 196.00,
    A3: 220.00,
    C4: 261.63,
    D4: 293.66,
    E4: 329.63,
    G4: 392.00,
    A4: 440.00,
    C5: 523.25,
    D5: 587.33,
    E5: 659.25,
    G5: 783.99,
    A5: 880.00
};

/**
 * 初始化 AudioContext
 * 需要用户交互后调用
 */
function init() {
    if (!audioContext) {
        var AudioContextClass = window.AudioContext || window.webkitAudioContext;
        audioContext = new AudioContextClass();
    }
    
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
    
}

/**
 * 创建振荡器
 */
function createOscillator(type, frequency, startTime, duration) {
    var oscillator = audioContext.createOscillator();
    var gainNode = audioContext.createGain();
    
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, startTime);
    
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(1, startTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
    
    return oscillator;
}

/**
 * 创建噪声用于打击音效
 */
function createNoiseBuffer(duration) {
    var bufferSize = audioContext.sampleRate * duration;
    var buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    var data = buffer.getChannelData(0);
    
    for (var i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }
    
    return buffer;
}

/**
 * 播放噪声
 */
function playNoise(duration, frequencyFilter) {
    var noiseBuffer = createNoiseBuffer(duration);
    var noiseSource = audioContext.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    
    var filter = audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(frequencyFilter, audioContext.currentTime);
    
    var gainNode = audioContext.createGain();
    gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
    
    noiseSource.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    noiseSource.start(audioContext.currentTime);
    noiseSource.stop(audioContext.currentTime + duration);
}

// ==================== 基础音效生成函数 ====================

/**
 * 鼓点节拍音（大鼓 boom，低频 60-80Hz）
 */
function playKickDrum() {
    var now = audioContext.currentTime;
    var oscillator = audioContext.createOscillator();
    var gainNode = audioContext.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(80, now);
    oscillator.frequency.exponentialRampToValueAtTime(40, now + 0.15);
    
    gainNode.gain.setValueAtTime(1, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.start(now);
    oscillator.stop(now + 0.2);
}

/**
 * 梆子/木鱼敲击音（高频短促 800-1200Hz）
 */
function playWoodBlock() {
    var now = audioContext.currentTime;
    var oscillator = audioContext.createOscillator();
    var gainNode = audioContext.createGain();
    
    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(1000, now);
    
    gainNode.gain.setValueAtTime(0.3, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.start(now);
    oscillator.stop(now + 0.1);
}

/**
 * 锣声（中频衰减 300-500Hz）
 */
function playGong() {
    var now = audioContext.currentTime;
    
    // 主音
    var oscillator = audioContext.createOscillator();
    var gainNode = audioContext.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(400, now);
    oscillator.frequency.setValueAtTime(380, now + 0.05);
    oscillator.frequency.linearRampToValueAtTime(400, now + 0.15);
    
    gainNode.gain.setValueAtTime(0.8, now);
    gainNode.gain.exponentialRampToValueAtTime(0.4, now + 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.start(now);
    oscillator.stop(now + 0.8);
    
    // 泛音
    var harmonic = audioContext.createOscillator();
    var harmonicGain = audioContext.createGain();
    
    harmonic.type = 'triangle';
    harmonic.frequency.setValueAtTime(800, now);
    
    harmonicGain.gain.setValueAtTime(0.2, now);
    harmonicGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    
    harmonic.connect(harmonicGain);
    harmonicGain.connect(audioContext.destination);
    
    harmonic.start(now);
    harmonic.stop(now + 0.5);
}

/**
 * 拳击打击音（低频冲击 + 噪声）
 */
function playPunchHit() {
    var now = audioContext.currentTime;
    
    // 低频冲击
    var oscillator = audioContext.createOscillator();
    var gainNode = audioContext.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(150, now);
    oscillator.frequency.exponentialRampToValueAtTime(50, now + 0.1);
    
    gainNode.gain.setValueAtTime(1, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.start(now);
    oscillator.stop(now + 0.15);
    
    // 噪声层
    playNoise(0.1, 2000);
}

/**
 * 掌击破空音（高频扫频 whoosh）
 */
function playPalmHit() {
    var now = audioContext.currentTime;
    var oscillator = audioContext.createOscillator();
    var gainNode = audioContext.createGain();
    
    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(2000, now);
    oscillator.frequency.exponentialRampToValueAtTime(500, now + 0.12);
    
    gainNode.gain.setValueAtTime(0.4, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.start(now);
    oscillator.stop(now + 0.15);
}

/**
 * 格挡音（金属碰撞感）
 */
function playBlock() {
    var now = audioContext.currentTime;
    
    // 金属撞击声
    var oscillator = audioContext.createOscillator();
    var gainNode = audioContext.createGain();
    
    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(2500, now);
    oscillator.frequency.exponentialRampToValueAtTime(1500, now + 0.05);
    
    gainNode.gain.setValueAtTime(0.5, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.start(now);
    oscillator.stop(now + 0.1);
    
    // 高频泛音
    var harmonic = audioContext.createOscillator();
    var harmonicGain = audioContext.createGain();
    
    harmonic.type = 'sine';
    harmonic.frequency.setValueAtTime(5000, now);
    
    harmonicGain.gain.setValueAtTime(0.2, now);
    harmonicGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    
    harmonic.connect(harmonicGain);
    harmonicGain.connect(audioContext.destination);
    
    harmonic.start(now);
    harmonic.stop(now + 0.08);
}

/**
 * 闪避 whoosh 音
 */
function playDodge() {
    var now = audioContext.currentTime;
    var oscillator = audioContext.createOscillator();
    var gainNode = audioContext.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(3000, now);
    oscillator.frequency.exponentialRampToValueAtTime(800, now + 0.2);
    
    gainNode.gain.setValueAtTime(0.3, now);
    gainNode.gain.linearRampToValueAtTime(0.5, now + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.start(now);
    oscillator.stop(now + 0.25);
}

/**
 * 连击确认音（清脆叮声）
 */
function playComboConfirm() {
    var now = audioContext.currentTime;
    var oscillator = audioContext.createOscillator();
    var gainNode = audioContext.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(1760, now); // A6
    oscillator.frequency.exponentialRampToValueAtTime(2093, now + 0.05); // C7
    
    gainNode.gain.setValueAtTime(0.4, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.start(now);
    oscillator.stop(now + 0.15);
}

/**
 * 完美判定音（和弦）
 */
function playPerfectChord() {
    var now = audioContext.currentTime;
    var frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5 - C大调和弦
    
    frequencies.forEach(function(freq) {
        var oscillator = audioContext.createOscillator();
        var gainNode = audioContext.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(freq, now);
        
        gainNode.gain.setValueAtTime(0.3, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.start(now);
        oscillator.stop(now + 0.4);
    });
}

/**
 * 气势槽满触发音（升调）
 */
function playPowerUp() {
    var now = audioContext.currentTime;
    var oscillator = audioContext.createOscillator();
    var gainNode = audioContext.createGain();
    
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(440, now); // A4
    oscillator.frequency.linearRampToValueAtTime(880, now + 0.3); // A5
    oscillator.frequency.linearRampToValueAtTime(1760, now + 0.5); // A6
    
    gainNode.gain.setValueAtTime(0.3, now);
    gainNode.gain.linearRampToValueAtTime(0.5, now + 0.2);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.start(now);
    oscillator.stop(now + 0.6);
}

// ==================== 公共接口方法 ====================

/**
 * 播放节拍提示音
 */
function playBeat() {
    if (!audioContext) {
        console.warn('AudioManager not initialized. Call init() first.');
        return;
    }
    // 外部 BGM 播放时不叠加程序化鼓点
    if (bgmLoaded && bgmAudio && !bgmAudio.paused) {
        return;
    }
    playKickDrum();
}

/**
 * 播放打击音效
 * @param {string} type - 'punch', 'palm', 'block', 'dodge'
 */
function playHitSound(type) {
    if (!audioContext) {
        console.warn('AudioManager not initialized. Call init() first.');
        return;
    }
    
    switch(type) {
        case 'punch':
            playPunchHit();
            break;
        case 'palm':
            playPalmHit();
            break;
        case 'block':
            playBlock();
            break;
        case 'dodge':
            playDodge();
            break;
        default:
            console.warn('Unknown hit sound type:', type);
    }
}

/**
 * 播放判定音效
 * @param {string} rating - 'perfect', 'great', 'good', 'miss'
 */
function playJudgmentSound(rating) {
    if (!audioContext) {
        console.warn('AudioManager not initialized. Call init() first.');
        return;
    }
    
    switch(rating) {
        case 'perfect':
            playPerfectChord();
            break;
        case 'great':
            playComboConfirm();
            break;
        case 'good':
            createOscillator('sine', 440, audioContext.currentTime, 0.2);
            break;
        case 'miss':
            createOscillator('sawtooth', 150, audioContext.currentTime, 0.15);
            break;
        default:
            console.warn('Unknown judgment rating:', rating);
    }
}

/**
 * 播放单个音符
 */
function playNote(frequency, duration, type, volume) {
    if (!audioContext) return;
    
    var now = audioContext.currentTime;
    var oscillator = audioContext.createOscillator();
    var gainNode = audioContext.createGain();
    
    oscillator.type = type || 'sine';
    oscillator.frequency.setValueAtTime(frequency, now);
    
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(volume || 0.3, now + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.start(now);
    oscillator.stop(now + duration);
}

/**
 * 背景音乐循环
 */
function playMusicLoop() {
    if (!isPlaying) return;
    
    var now = audioContext.currentTime;
    var beatDuration = 60 / currentBpm;
    
    // 基础鼓点（所有层级都有）
    if (beatCount % 4 === 0) {
        playKickDrum();
    }
    
    // Level 1+: 加入梆子
    if (musicIntensityLevel >= 1) {
        if (beatCount % 2 === 1) {
            playWoodBlock();
        }
    }
    
    // Level 2+: 加入旋律（五声音阶）
    if (musicIntensityLevel >= 2) {
        var melodyPattern = [pentatonicScale.C4, pentatonicScale.D4, pentatonicScale.E4, pentatonicScale.G4];
        var noteIndex = Math.floor(beatCount / 2) % melodyPattern.length;
        if (beatCount % 4 === 2) {
            playNote(melodyPattern[noteIndex], beatDuration * 0.8, 'triangle', 0.2);
        }
    }
    
    // Level 3: 加入琵琶快奏模拟（快速琶音）
    if (musicIntensityLevel >= 3) {
        if (beatCount % 4 === 3) {
            var arpeggio = [pentatonicScale.C5, pentatonicScale.E5, pentatonicScale.G5, pentatonicScale.A5];
            for (var i = 0; i < arpeggio.length; i++) {
                setTimeout((function(freq) {
                    return function() {
                        playNote(freq, 0.08, 'sine', 0.15);
                    };
                })(arpeggio[i]), i * 50);
            }
        }
    }
    
    beatCount++;
}

/**
 * 开始背景音乐
 * @param {number} bpm - 每分钟节拍数，默认120
 */
function startMusic(bpm) {
    if (!audioContext) {
        console.warn('AudioManager not initialized. Call init() first.');
        return;
    }
    
    if (isPlaying) {
        stopMusic();
    }
    
    currentBpm = bpm || 120;
    isPlaying = true;
    beatCount = 0;
    
    // 优先使用外部 BGM 文件
    if (bgmLoaded && bgmAudio) {
        bgmAudio.currentTime = 0;
        bgmAudio.play().catch(function(err) {
            console.warn('BGM 播放失败，回退到程序化音乐:', err);
            startProceduralMusic();
        });
        return;
    }
    
    // fallback: 程序化生成的背景音乐
    startProceduralMusic();
}

/**
 * 启动程序化生成的背景音乐（fallback）
 */
function startProceduralMusic() {
    var beatDuration = 60 / currentBpm;
    
    // 立即播放第一拍
    playMusicLoop();
    
    // 设置定时器
    musicIntervalId = setInterval(function() {
        playMusicLoop();
    }, beatDuration * 1000);
}

/**
 * 停止背景音乐
 */
function stopMusic() {
    // 停止外部 BGM
    if (bgmAudio) {
        bgmAudio.pause();
        bgmAudio.currentTime = 0;
    }
    
    // 停止程序化音乐定时器
    if (musicIntervalId) {
        clearInterval(musicIntervalId);
        musicIntervalId = null;
    }
    isPlaying = false;
    beatCount = 0;
}

/**
 * 设置音乐强度层级
 * @param {number} level - 强度层级 0-3
 *  0: 基础鼓点
 *  1: + 梆子
 *  2: + 旋律
 *  3: + 琵琶快奏
 */
function setMusicIntensity(level) {
    if (level >= 0 && level <= 3) {
        musicIntensityLevel = level;
    } else {
        console.warn('Invalid music intensity level. Must be 0-3.');
    }
}

/**
 * 获取当前音乐强度层级
 */
function getMusicIntensity() {
    return musicIntensityLevel;
}

/**
 * 检查是否正在播放音乐
 */
function isMusicPlaying() {
    return isPlaying;
}

// 公共API - 单例对象
var AudioManager = {
    init: init,
    playBeat: playBeat,
    playHitSound: playHitSound,
    playJudgmentSound: playJudgmentSound,
    playComboConfirm: playComboConfirm,
    playPerfectChord: playPerfectChord,
    playPowerUp: playPowerUp,
    startMusic: startMusic,
    stopMusic: stopMusic,
    setMusicIntensity: setMusicIntensity,
    getMusicIntensity: getMusicIntensity,
    isMusicPlaying: isMusicPlaying
};

export default AudioManager;
