/**
 * InputManager - 输入处理模块
 * 处理键盘输入（方向键 + 空格），支持防抖
 */
function InputManager() {
    this.canvas = null;
    this.inputCallback = null;
    this.lastInputTime = {};
    this.debounceTime = 80;
    this.listeners = [];
}

InputManager.prototype.init = function(canvas) {
    this.canvas = canvas;
    
    // 仅监听键盘事件
    this.addEventListener(document, 'keydown', this.handleKeyDown.bind(this));
};

InputManager.prototype.addEventListener = function(element, event, handler, options) {
    element.addEventListener(event, handler, options);
    this.listeners.push({
        element: element,
        event: event,
        handler: handler
    });
};

InputManager.prototype.handleKeyDown = function(e) {
    var inputType = null;
    
    switch(e.code) {
        case 'ArrowLeft':
            inputType = 'punch_left';
            break;
        case 'ArrowRight':
            inputType = 'punch_right';
            break;
        case 'ArrowDown':
            inputType = 'dodge_down';
            break;
        case 'ArrowUp':
            inputType = 'dodge_up';
            break;
        case 'Space':
            inputType = 'block';
            break;
    }
    
    if (inputType) {
        e.preventDefault();
        this.triggerInput(inputType);
    }
};

InputManager.prototype.triggerInput = function(type) {
    const now = performance.now();
    
    // 防抖检查
    if (this.lastInputTime[type] && (now - this.lastInputTime[type]) < this.debounceTime) {
        return;
    }
    
    this.lastInputTime[type] = now;
    
    if (this.inputCallback) {
        this.inputCallback({
            type: type,
            time: now
        });
    }
};

InputManager.prototype.onInput = function(callback) {
    this.inputCallback = callback;
};

InputManager.prototype.destroy = function() {
    // 移除所有监听器
    for (let i = 0; i < this.listeners.length; i++) {
        const listener = this.listeners[i];
        listener.element.removeEventListener(listener.event, listener.handler);
    }
    this.listeners = [];
    this.inputCallback = null;
    this.canvas = null;
    this.lastInputTime = {};
};

export default InputManager;
