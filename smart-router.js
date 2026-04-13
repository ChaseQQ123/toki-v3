/**
 * TOKIClaw 智能路由 - 集成到TOKI
 * 自动选择最合适的AI模型
 */

class SmartRouter {
    constructor() {
        this.threshold = 0.35;
    }

    /**
     * 分析消息复杂度
     * 返回: 0-1，越大越复杂
     */
    analyzeComplexity(message) {
        let score = 0;
        
        // 1. 长度因素
        const len = message.length;
        if (len > 500) score += 0.30;
        else if (len > 200) score += 0.15;
        else if (len > 50) score += 0.05;
        
        // 2. 代码块 - 编程任务用重量模型
        if (message.includes('```')) score += 0.40;
        
        // 3. 关键词 - 复杂任务
        const complexKeywords = [
            '分析', '总结', '报告', '方案', '设计', '架构',
            '优化', '重构', '算法', '数据结构', '复杂',
            '详细', '完整', '全面', '深入'
        ];
        if (complexKeywords.some(k => message.includes(k))) {
            score += 0.20;
        }
        
        // 4. 简单对话关键词 - 用轻量模型
        const simpleKeywords = [
            '你好', '在吗', '怎么样', '谢谢', '好的',
            '早安', '晚安', '嗨', '哈喽', '早上好'
        ];
        if (simpleKeywords.some(k => message.includes(k))) {
            score -= 0.20;
        }
        
        // 5. 多媒体 - 必须用重量模型
        if (message.includes('data:image') || 
            message.includes('.jpg') || 
            message.includes('.png')) {
            score = 1.0;
        }
        
        return Math.max(0, Math.min(1, score));
    }

    /**
     * 选择最佳模型
     */
    selectModel(message, hasZhipuKey = false) {
        const complexity = this.analyzeComplexity(message);
        
        // 如果没有智谱Key，强制用星火
        if (!hasZhipuKey) {
            return {
                engine: 'spark',
                model: 'spark-lite',
                reason: '智谱未配置，使用星火',
                complexity
            };
        }
        
        // 复杂度低于阈值 → 用星火（无限免费）
        if (complexity < this.threshold) {
            return {
                engine: 'spark',
                model: 'spark-lite',
                reason: '简单任务，使用星火（免费）',
                complexity,
                saved: true
            };
        }
        
        // 复杂度高于阈值 → 用智谱（更强）
        return {
            engine: 'zhipu',
            model: 'glm-4-flash',
            reason: '复杂任务，使用智谱（更强）',
            complexity,
            saved: false
        };
    }
    
    /**
     * 计算节省成本
     */
    calculateSavings(history = []) {
        let saved = 0;
        let total = history.length;
        
        history.forEach(msg => {
            if (msg.usedLight) saved++;
        });
        
        return {
            saved,
            total,
            percentage: total > 0 ? (saved / total * 100).toFixed(1) : 0
        };
    }
}

// 导出
window.SmartRouter = SmartRouter;
