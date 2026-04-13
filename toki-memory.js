/**
 * TOKI 记忆系统 - 浏览器版
 * 基于 localStorage 的轻量级记忆
 */

class TOKIMemory {
    constructor() {
        this.storageKey = 'toki_memory';
        this.userKey = 'toki_user';
        this.load();
    }
    
    // 加载记忆
    load() {
        try {
            // 用户画像
            this.user = JSON.parse(localStorage.getItem(this.userKey) || '{}');
            
            // 对话历史
            this.history = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
        } catch (e) {
            this.user = {};
            this.history = [];
        }
    }
    
    // 保存记忆
    save() {
        try {
            localStorage.setItem(this.userKey, JSON.stringify(this.user));
            localStorage.setItem(this.storageKey, JSON.stringify(this.history));
        } catch (e) {
            console.error('保存记忆失败:', e);
        }
    }
    
    // 添加消息到历史
    addMessage(role, content) {
        this.history.push({
            role: role,
            content: content,
            timestamp: Date.now()
        });
        
        // 只保留最近50条
        if (this.history.length > 50) {
            this.history = this.history.slice(-50);
        }
        
        this.save();
    }
    
    // 获取最近的历史
    getRecentHistory(count = 10) {
        return this.history.slice(-count);
    }
    
    // 学习用户信息
    learnUserInfo(key, value) {
        this.user[key] = value;
        this.save();
    }
    
    // 获取用户信息
    getUserInfo(key) {
        return this.user[key];
    }
    
    // 记住用户偏好
    rememberPreference(preference) {
        if (!this.user.preferences) {
            this.user.preferences = [];
        }
        if (!this.user.preferences.includes(preference)) {
            this.user.preferences.push(preference);
        }
        this.save();
    }
    
    // 清空历史
    clearHistory() {
        this.history = [];
        this.save();
    }
    
    // 获取用户画像摘要
    getUserSummary() {
        const parts = [];
        
        if (this.user.name) {
            parts.push(`用户名叫${this.user.name}`);
        }
        
        if (this.user.preferences && this.user.preferences.length > 0) {
            parts.push(`偏好: ${this.user.preferences.slice(0, 5).join('、')}`);
        }
        
        return parts.length > 0 ? parts.join('。') : '新用户';
    }
    
    // 从消息中提取信息
    extractInfo(message) {
        // 提取名字
        const nameMatch = message.match(/我叫(.{2,10})|我是(.{2,10})/);
        if (nameMatch) {
            const name = nameMatch[1] || nameMatch[2];
            this.learnUserInfo('name', name);
        }
        
        // 提取喜欢的东西
        const likeMatch = message.match(/我喜欢(.{2,20})/);
        if (likeMatch) {
            this.rememberPreference(likeMatch[1]);
        }
    }
}

// 导出
window.TOKIMemory = new TOKIMemory();
