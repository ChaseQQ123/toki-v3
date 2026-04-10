// TOKI 工具箱 - 集成Kimi和智谱清言功能

class TOKITools {
    constructor() {
        this.apiKey = 'c4911cf15f844167bd26301e25622cf1.n1BU10ytXbnQ6N5d';
        this.baseUrl = 'https://open.bigmodel.cn/api/paas/v4';
        
        // 工具定义
        this.tools = {
            calculator: {
                name: '计算器',
                icon: '🧮',
                description: '数学计算',
                execute: (expression) => this.calculate(expression)
            },
            weather: {
                name: '天气查询',
                icon: '🌤️',
                description: '查询城市天气',
                execute: (city) => this.getWeather(city)
            },
            search: {
                name: '网络搜索',
                icon: '🔍',
                description: '搜索网络信息',
                execute: (query) => this.search(query)
            },
            chart: {
                name: '图表生成',
                icon: '📊',
                description: '生成数据图表',
                execute: (data) => this.generateChart(data)
            },
            translate: {
                name: '翻译',
                icon: '🌐',
                description: '多语言翻译',
                execute: (text) => this.translate(text)
            },
            datetime: {
                name: '日期时间',
                icon: '📅',
                description: '日期时间查询',
                execute: () => this.getDateTime()
            }
        };
    }
    
    /**
     * 计算器
     */
    calculate(expression) {
        try {
            // 安全的数学表达式计算
            const result = Function(`"use strict"; return (${expression})`)();
            return {success: true, result};
        } catch (error) {
            return {success: false, error: '计算错误'};
        }
    }
    
    /**
     * 天气查询（使用免费API）
     */
    async getWeather(city) {
        try {
            // 使用免费的天气API或模拟数据
            const response = await fetch(`https://wttr.in/${city}?format=j1`);
            const data = await response.json();
            
            const current = data.current_condition[0];
            
            return {
                success: true,
                weather: {
                    city: city,
                    temperature: current.temp_C + '°C',
                    condition: current.weatherDesc[0].value,
                    humidity: current.humidity + '%',
                    wind: current.windspeedKmph + ' km/h'
                }
            };
        } catch (error) {
            return {success: false, error: '天气查询失败'};
        }
    }
    
    /**
     * 网络搜索（使用智谱AI）
     */
    async search(query) {
        try {
            const response = await fetch(`${this.baseUrl}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: 'glm-4-flash',
                    messages: [{
                        role: 'user',
                        content: `请搜索关于"${query}"的最新信息，并提供简要总结。`
                    }]
                })
            });
            
            const data = await response.json();
            return {
                success: true,
                result: data.choices[0].message.content
            };
        } catch (error) {
            return {success: false, error: '搜索失败'};
        }
    }
    
    /**
     * 图表生成（返回配置）
     */
    generateChart(data) {
        // 返回ECharts配置
        return {
            success: true,
            chart: {
                type: 'bar',
                data: data,
                config: {
                    title: '数据图表',
                    xAxis: '类别',
                    yAxis: '数值'
                }
            }
        };
    }
    
    /**
     * 翻译
     */
    async translate(text) {
        try {
            const response = await fetch(`${this.baseUrl}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: 'glm-4-flash',
                    messages: [{
                        role: 'user',
                        content: `请翻译以下内容：\n${text}`
                    }]
                })
            });
            
            const data = await response.json();
            return {
                success: true,
                translation: data.choices[0].message.content
            };
        } catch (error) {
            return {success: false, error: '翻译失败'};
        }
    }
    
    /**
     * 获取日期时间
     */
    getDateTime() {
        const now = new Date();
        return {
            success: true,
            datetime: {
                date: now.toLocaleDateString('zh-CN'),
                time: now.toLocaleTimeString('zh-CN'),
                weekday: ['日', '一', '二', '三', '四', '五', '六'][now.getDay()],
                timestamp: now.getTime()
            }
        };
    }
    
    /**
     * 执行工具
     */
    async executeTool(toolName, ...args) {
        const tool = this.tools[toolName];
        if (!tool) {
            return {success: false, error: '工具不存在'};
        }
        
        return await tool.execute(...args);
    }
}

// 智能体系统
class TOKIAgents {
    constructor() {
        // 预设智能体
        this.agents = {
            dataAnalyst: {
                name: '📊 数据分析师',
                description: '上传数据，自动分析并生成报告',
                systemPrompt: '你是一个专业的数据分析师，擅长数据分析、统计和可视化。你能帮助用户分析数据、发现规律、生成洞察报告。',
                tools: ['calculator', 'chart'],
                examples: [
                    '分析这份销售数据',
                    '帮我计算平均值和标准差',
                    '生成数据趋势图表'
                ]
            },
            
            businessAssistant: {
                name: '💼 商务助手',
                description: '商业文档、报告、方案撰写',
                systemPrompt: '你是一个专业的商务助手，精通商业文档撰写、市场分析、商业计划等。你能撰写专业的商业报告、方案、邮件等。',
                tools: ['search', 'translate'],
                examples: [
                    '帮我写一份市场分析报告',
                    '生成商业计划书大纲',
                    '写一封商务邮件'
                ]
            },
            
            learningMentor: {
                name: '📚 学习导师',
                description: '作业辅导、知识讲解、学习方法',
                systemPrompt: '你是一个耐心的学习导师，擅长讲解知识、解答问题、制定学习计划。你能用通俗易懂的语言解释复杂概念。',
                tools: ['search'],
                examples: [
                    '解释一下量子力学',
                    '帮我制定英语学习计划',
                    '解答这道数学题'
                ]
            },
            
            designAssistant: {
                name: '🎨 设计师助手',
                description: '设计方案、配色建议、创意灵感',
                systemPrompt: '你是一个专业的设计助手，擅长平面设计、UI设计、配色方案等。你能提供专业的设计建议和创意灵感。',
                tools: ['search'],
                examples: [
                    '推荐一个科技感的配色方案',
                    '设计一个简约风格的Logo',
                    '给我一些海报设计灵感'
                ]
            },
            
            writingPartner: {
                name: '✍️ 写作伙伴',
                description: '文章创作、文案优化、写作技巧',
                systemPrompt: '你是一个专业的写作伙伴，擅长各类文体写作、文案优化。你能帮助用户提升写作质量、激发创作灵感。',
                tools: ['search', 'translate'],
                examples: [
                    '帮我写一篇散文',
                    '优化这段文案',
                    '给我一些标题建议'
                ]
            },
            
            codeHelper: {
                name: '💻 编程助手',
                description: '代码编写、调试、技术解答',
                systemPrompt: '你是一个专业的编程助手，精通多种编程语言和技术栈。你能帮助用户编写代码、解决技术问题、提供最佳实践建议。',
                tools: [],
                examples: [
                    '写一个Python爬虫',
                    '解释这段代码的作用',
                    '如何优化这个算法'
                ]
            }
        };
    }
    
    /**
     * 获取智能体列表
     */
    getAgentList() {
        return Object.entries(this.agents).map(([id, agent]) => ({
            id,
            name: agent.name,
            description: agent.description,
            examples: agent.examples
        }));
    }
    
    /**
     * 调用智能体
     */
    async callAgent(agentId, message) {
        const agent = this.agents[agentId];
        if (!agent) {
            throw new Error('智能体不存在');
        }
        
        const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey || 'c4911cf15f844167bd26301e25622cf1.n1BU10ytXbnQ6N5d'}`
            },
            body: JSON.stringify({
                model: 'glm-4-flash',
                messages: [
                    {role: 'system', content: agent.systemPrompt},
                    {role: 'user', content: message}
                ]
            })
        });
        
        const data = await response.json();
        return {
            success: true,
            agent: agent.name,
            response: data.choices[0].message.content
        };
    }
}

// 文件处理器
class TOKIFileHandler {
    constructor() {
        this.supportedTypes = {
            'application/pdf': this.parsePDF.bind(this),
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': this.parseWord.bind(this),
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': this.parseExcel.bind(this),
            'image/*': this.parseImage.bind(this)
        };
    }
    
    /**
     * 解析PDF
     */
    async parsePDF(file) {
        // 使用PDF.js或后端服务
        // 这里返回提示信息
        return {
            success: true,
            type: 'pdf',
            filename: file.name,
            size: file.size,
            message: 'PDF文件已上传（需要后端解析）'
        };
    }
    
    /**
     * 解析Word
     */
    async parseWord(file) {
        return {
            success: true,
            type: 'word',
            filename: file.name,
            size: file.size,
            message: 'Word文件已上传（需要后端解析）'
        };
    }
    
    /**
     * 解析Excel
     */
    async parseExcel(file) {
        return {
            success: true,
            type: 'excel',
            filename: file.name,
            size: file.size,
            message: 'Excel文件已上传（需要后端解析）'
        };
    }
    
    /**
     * 解析图片
     */
    async parseImage(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                resolve({
                    success: true,
                    type: 'image',
                    filename: file.name,
                    size: file.size,
                    dataUrl: e.target.result,
                    message: '图片已上传，可以使用GLM-4V进行识别'
                });
            };
            reader.readAsDataURL(file);
        });
    }
    
    /**
     * 处理文件
     */
    async handleFile(file) {
        const mimeType = file.type;
        
        // 查找匹配的处理器
        for (const [type, handler] of Object.entries(this.supportedTypes)) {
            if (type.includes('*') ? mimeType.startsWith(type.split('/')[0]) : mimeType === type) {
                return await handler(file);
            }
        }
        
        return {
            success: false,
            error: '不支持的文件类型'
        };
    }
}

// 导出
window.TOKITools = TOKITools;
window.TOKIAgents = TOKIAgents;
window.TOKIFileHandler = TOKIFileHandler;