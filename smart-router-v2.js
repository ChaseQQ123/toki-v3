/**
 * TOKIClaw 智能路由 V2.0
 * 支持智谱8个免费模型 + 讯飞星火
 */

class SmartRouterV2 {
    constructor() {
        // 智谱免费模型配置
        this.models = {
            // 对话模型
            'glm-4-flash': {
                name: 'GLM-4-Flash',
                type: 'chat',
                capability: ['对话', '问答', '写作', '翻译'],
                cost: '免费',
                speed: '快',
                quality: '高'
            },
            
            // 视觉模型
            'glm-4v-flash': {
                name: 'GLM-4V-Flash',
                type: 'vision',
                capability: ['图像识别', 'OCR', '图表分析', '多模态'],
                cost: '免费',
                speed: '中',
                quality: '高'
            },
            
            // 图像生成
            'cogview-3-flash': {
                name: 'CogView-3-Flash',
                type: 'image-gen',
                capability: ['图像生成', '绘画', '设计'],
                cost: '免费',
                speed: '中',
                quality: '中'
            },
            
            // 视频生成
            'cogvideox-flash': {
                name: 'CogVideoX-Flash',
                type: 'video-gen',
                capability: ['视频生成', '动画'],
                cost: '免费',
                speed: '慢',
                quality: '中'
            },
            
            // 角色扮演
            'characterglm': {
                name: 'CharacterGLM',
                type: 'character',
                capability: ['角色扮演', '虚拟人'],
                cost: '免费',
                speed: '快',
                quality: '高'
            },
            
            // 长文本
            'glm-4-long': {
                name: 'GLM-4-Long',
                type: 'long-context',
                capability: ['长文本', '文档分析', '长对话'],
                cost: '免费（有限额）',
                speed: '中',
                quality: '高'
            },
            
            // 代码
            'codegeex-4': {
                name: 'CodeGeeX-4',
                type: 'code',
                capability: ['编程', '代码生成', '代码解释'],
                cost: '免费',
                speed: '快',
                quality: '高'
            },
            
            // Embedding
            'embedding-3': {
                name: 'Embedding-3',
                type: 'embedding',
                capability: ['向量化', '语义搜索'],
                cost: '免费',
                speed: '快',
                quality: '高'
            }
        };
        
        // 讯飞星火
        this.spark = {
            'spark-lite': {
                name: '星火 Lite',
                type: 'chat',
                capability: ['对话', '问答'],
                cost: '无限免费',
                speed: '快',
                quality: '中'
            }
        };
        
        // 路由规则
        this.rules = {
            // 图像生成关键词
            imageGen: ['画', '生成图片', '生成图像', '画图', '绘图', '画一只', '画一个', '生成一张'],
            
            // 视频生成关键词
            videoGen: ['生成视频', '制作视频', '视频', '动画'],
            
            // 图像识别关键词
            vision: ['识别图片', '识别图像', '看图', '这张图', '图片是什么', '分析图片', 'OCR'],
            
            // 代码关键词
            code: ['代码', '编程', '写程序', '函数', '算法', 'Python', 'JavaScript', 'Java', 'C++', 'HTML', 'CSS'],
            
            // 长文本关键词
            longText: ['长文本', '文档', '论文', '报告', '总结文档', '分析文档', '超过1000字'],
            
            // 角色扮演关键词
            character: ['扮演', '角色扮演', '模仿', '你是', '假装'],
            
            // 简单对话关键词
            simple: ['你好', '在吗', '怎么样', '谢谢', '好的', '早安', '晚安', '嗨', '哈喽']
        };
    }
    
    /**
     * 分析任务类型
     */
    analyzeTask(message, context = {}) {
        const lower = message.toLowerCase();
        const scores = {
            imageGen: 0,
            videoGen: 0,
            vision: 0,
            code: 0,
            longText: 0,
            character: 0,
            simple: 0,
            chat: 0
        };
        
        // 1. 检查图像生成意图
        if (this.rules.imageGen.some(k => lower.includes(k))) {
            scores.imageGen = 0.9;
        }
        
        // 2. 检查视频生成意图
        if (this.rules.videoGen.some(k => lower.includes(k))) {
            scores.videoGen = 0.9;
        }
        
        // 3. 检查图像识别意图
        if (this.rules.vision.some(k => lower.includes(k))) {
            scores.vision = 0.9;
        }
        // 如果有图片附件
        if (context.hasImage || lower.includes('data:image')) {
            scores.vision = 1.0;
        }
        
        // 4. 检查代码意图
        if (this.rules.code.some(k => lower.includes(k))) {
            scores.code = 0.8;
        }
        if (lower.includes('```')) {
            scores.code = 0.9;
        }
        
        // 5. 检查长文本意图
        if (this.rules.longText.some(k => lower.includes(k))) {
            scores.longText = 0.8;
        }
        if (message.length > 1000) {
            scores.longText = 0.7;
        }
        
        // 6. 检查角色扮演意图
        if (this.rules.character.some(k => lower.includes(k))) {
            scores.character = 0.8;
        }
        
        // 7. 检查简单对话
        if (this.rules.simple.some(k => lower.includes(k))) {
            scores.simple = 0.9;
        }
        
        // 8. 默认对话
        scores.chat = 0.5;
        
        // 找出最高分的任务类型
        let maxScore = 0;
        let taskType = 'chat';
        
        for (const [type, score] of Object.entries(scores)) {
            if (score > maxScore) {
                maxScore = score;
                taskType = type;
            }
        }
        
        return {
            type: taskType,
            score: maxScore,
            allScores: scores
        };
    }
    
    /**
     * 选择最佳模型
     */
    selectModel(message, context = {}) {
        const task = this.analyzeTask(message, context);
        const hasZhipuKey = !!context.zhipuKey;
        
        // 任务类型 → 模型映射
        const modelMap = {
            'imageGen': 'cogview-3-flash',
            'videoGen': 'cogvideox-flash',
            'vision': 'glm-4v-flash',
            'code': 'codegeex-4',
            'longText': 'glm-4-long',
            'character': 'characterglm',
            'simple': 'spark-lite',  // 简单对话用星火（免费无限）
            'chat': 'glm-4-flash'     // 默认用智谱对话
        };
        
        const selectedModel = modelMap[task.type];
        
        // 如果没有智谱Key，简单任务用星火，复杂任务提示配置
        if (!hasZhipuKey) {
            if (task.type === 'simple' || task.type === 'chat') {
                return {
                    model: 'spark-lite',
                    provider: 'spark',
                    reason: '使用星火（无限免费）',
                    task: task,
                    fallback: false
                };
            } else {
                return {
                    model: 'spark-lite',
                    provider: 'spark',
                    reason: '智谱未配置，降级到星火',
                    task: task,
                    fallback: true,
                    recommendConfig: `此任务需要 ${this.models[selectedModel]?.name || selectedModel}，请配置智谱API Key`
                };
            }
        }
        
        return {
            model: selectedModel,
            provider: 'zhipu',
            reason: `${task.type}任务，使用${this.models[selectedModel]?.name || selectedModel}`,
            task: task,
            modelInfo: this.models[selectedModel]
        };
    }
    
    /**
     * 获取模型信息
     */
    getModelInfo(modelId) {
        return this.models[modelId] || this.spark[modelId];
    }
    
    /**
     * 获取所有可用模型
     */
    getAllModels() {
        return { ...this.models, ...this.spark };
    }
}

// 导出
window.SmartRouterV2 = SmartRouterV2;
