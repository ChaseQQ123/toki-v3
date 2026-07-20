/**
 * TOKI 本地知识图谱
 * 基于SQLite的轻量级知识图谱实现
 * 
 * 当前使用 localStorage 模拟，生产环境需替换为 sqlite-wasm
 */

class LocalKnowledgeGraph {
  constructor() {
    this.storageKey = 'toki_knowledge_graph';
    
    // 知识图谱结构
    this.graph = {
      // 实体：人、地点、概念等
      entities: [],
      // 关系：实体之间的连接
      relations: [],
      // 事实：具体的知识条目
      facts: []
    };
    
    // 实体类型
    this.entityTypes = {
      person: { icon: '👤', color: '#4CAF50' },
      place: { icon: '📍', color: '#2196F3' },
      organization: { icon: '🏢', color: '#FF9800' },
      concept: { icon: '💡', color: '#9C27B0' },
      event: { icon: '📅', color: '#F44336' },
      object: { icon: '📦', color: '#795548' }
    };
    
    // 关系类型
    this.relationTypes = {
      'knows': '认识',
      'works_for': '工作于',
      'located_in': '位于',
      'related_to': '相关',
      'created_by': '创建者',
      'happened_at': '发生在',
      'part_of': '部分属于',
      'similar_to': '相似于'
    };
  }

  /**
   * 初始化
   */
  async init() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        this.graph = JSON.parse(stored);
      }
      console.log(`✅ LocalKnowledgeGraph 初始化完成`);
      console.log(`   实体: ${this.graph.entities.length} 个`);
      console.log(`   关系: ${this.graph.relations.length} 条`);
      console.log(`   事实: ${this.graph.facts.length} 条`);
      return true;
    } catch (error) {
      console.error('❌ LocalKnowledgeGraph 初始化失败:', error);
      return false;
    }
  }

  /**
   * 添加实体
   */
  addEntity(name, type = 'concept', metadata = {}) {
    // 检查是否已存在
    const existing = this.graph.entities.find(e => 
      e.name.toLowerCase() === name.toLowerCase() && e.type === type
    );
    if (existing) {
      return existing.id;
    }
    
    const entity = {
      id: `entity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      type,
      metadata: {
        ...metadata,
        createdAt: Date.now(),
        accessCount: 0
      }
    };
    
    this.graph.entities.push(entity);
    this.save();
    
    console.log(`➕ 添加实体: ${name} (${type})`);
    return entity.id;
  }

  /**
   * 添加关系
   */
  addRelation(fromEntityId, relationType, toEntityId, metadata = {}) {
    // 检查是否已存在
    const existing = this.graph.relations.find(r =>
      r.from === fromEntityId && r.type === relationType && r.to === toEntityId
    );
    if (existing) {
      return existing.id;
    }
    
    const relation = {
      id: `rel_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      from: fromEntityId,
      type: relationType,
      to: toEntityId,
      metadata: {
        ...metadata,
        createdAt: Date.now(),
        confidence: metadata.confidence || 1.0
      }
    };
    
    this.graph.relations.push(relation);
    this.save();
    
    const fromEntity = this.graph.entities.find(e => e.id === fromEntityId);
    const toEntity = this.graph.entities.find(e => e.id === toEntityId);
    console.log(`🔗 添加关系: ${fromEntity?.name} → ${relationType} → ${toEntity?.name}`);
    
    return relation.id;
  }

  /**
   * 添加事实
   */
  addFact(content, entities = [], metadata = {}) {
    const fact = {
      id: `fact_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      content,
      entities, // 相关实体ID列表
      metadata: {
        ...metadata,
        createdAt: Date.now(),
        source: metadata.source || 'user_input'
      }
    };
    
    this.graph.facts.push(fact);
    this.save();
    
    console.log(`📝 添加事实: ${content.substring(0, 50)}...`);
    return fact.id;
  }

  /**
   * 查询实体
   */
  queryEntity(name) {
    return this.graph.entities.filter(e =>
      e.name.toLowerCase().includes(name.toLowerCase())
    );
  }

  /**
   * 查询关系
   */
  queryRelations(entityId, direction = 'both') {
    return this.graph.relations.filter(r => {
      if (direction === 'out') return r.from === entityId;
      if (direction === 'in') return r.to === entityId;
      return r.from === entityId || r.to === entityId;
    });
  }

  /**
   * 查询相关事实
   */
  queryFacts(entityId) {
    return this.graph.facts.filter(f =>
      f.entities.includes(entityId)
    );
  }

  /**
   * 搜索知识
   */
  search(query) {
    const results = {
      entities: [],
      relations: [],
      facts: []
    };
    
    // 搜索实体
    results.entities = this.graph.entities.filter(e =>
      e.name.toLowerCase().includes(query.toLowerCase())
    );
    
    // 搜索事实
    results.facts = this.graph.facts.filter(f =>
      f.content.toLowerCase().includes(query.toLowerCase())
    );
    
    // 搜索相关关系
    const entityIds = results.entities.map(e => e.id);
    results.relations = this.graph.relations.filter(r =>
      entityIds.includes(r.from) || entityIds.includes(r.to)
    );
    
    return results;
  }

  /**
   * 获取实体详情（包含关系和事实）
   */
  getEntityDetails(entityId) {
    const entity = this.graph.entities.find(e => e.id === entityId);
    if (!entity) return null;
    
    return {
      entity,
      relations: {
        outgoing: this.graph.relations.filter(r => r.from === entityId),
        incoming: this.graph.relations.filter(r => r.to === entityId)
      },
      facts: this.graph.facts.filter(f => f.entities.includes(entityId))
    };
  }

  /**
   * 删除实体及其关联
   */
  deleteEntity(entityId) {
    // 删除关系
    this.graph.relations = this.graph.relations.filter(r =>
      r.from !== entityId && r.to !== entityId
    );
    
    // 从事实中移除引用
    this.graph.facts.forEach(f => {
      f.entities = f.entities.filter(id => id !== entityId);
    });
    
    // 删除实体
    this.graph.entities = this.graph.entities.filter(e => e.id !== entityId);
    
    this.save();
    console.log(`🗑️ 已删除实体: ${entityId}`);
  }

  /**
   * 导出图谱
   */
  export() {
    return {
      ...this.graph,
      exportedAt: Date.now()
    };
  }

  /**
   * 导入图谱
   */
  import(data) {
    this.graph = {
      entities: data.entities || [],
      relations: data.relations || [],
      facts: data.facts || []
    };
    this.save();
    console.log(`📥 已导入知识图谱: ${this.graph.entities.length} 实体, ${this.graph.relations.length} 关系`);
  }

  /**
   * 清空图谱
   */
  clear() {
    this.graph = { entities: [], relations: [], facts: [] };
    this.save();
    console.log('🗑️ 已清空知识图谱');
  }

  /**
   * 统计信息
   */
  getStats() {
    return {
      entities: this.graph.entities.length,
      relations: this.graph.relations.length,
      facts: this.graph.facts.length,
      entityTypes: this.countEntityTypes()
    };
  }

  /**
   * 按类型统计实体
   */
  countEntityTypes() {
    const counts = {};
    this.graph.entities.forEach(e => {
      counts[e.type] = (counts[e.type] || 0) + 1;
    });
    return counts;
  }

  /**
   * 保存到 localStorage
   */
  save() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.graph));
    } catch (error) {
      console.error('知识图谱保存失败:', error);
    }
  }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { LocalKnowledgeGraph };
}