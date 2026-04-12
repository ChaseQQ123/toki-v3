import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { PicoClawRN } from '../services/PicoClawRN';
import { Stats, Memory } from '../types';
import { THEME } from '../utils/constants';

export const MemoryScreen: React.FC = () => {
  const [memory, setMemory] = useState<PicoClawRN | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentMemories, setRecentMemories] = useState<Memory[]>([]);
  const [selectedDNA, setSelectedDNA] = useState<string>('USER');

  // 初始化
  useEffect(() => {
    initMemory();
  }, []);

  const initMemory = async () => {
    const pico = new PicoClawRN({ maxMemories: 1000 });
    await pico.initPromise;
    setMemory(pico);
    await refreshStats(pico);
  };

  // 刷新统计
  const refreshStats = async (pico: PicoClawRN) => {
    const statsData = await pico.getStats();
    setStats(statsData);

    const memories = pico.memories.slice(-10).reverse();
    setRecentMemories(memories);
  };

  // 查看DNA
  const viewDNA = async () => {
    if (!memory) return;

    const dna = await memory.getChromosome(selectedDNA);
    Alert.alert(
      `${selectedDNA} 染色体`,
      JSON.stringify(dna, null, 2),
      [{ text: '确定' }]
    );
  };

  // 导出数据
  const exportData = async () => {
    if (!memory) return;

    const data = await memory.export();
    const json = JSON.stringify(data, null, 2);

    // TODO: 实际导出到文件
    Alert.alert('导出成功', `已导出 ${data.memories.length} 条记忆`);
  };

  // 清除数据
  const clearData = () => {
    Alert.alert(
      '警告',
      '确定要清除所有记忆吗？此操作不可恢复！',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '确定',
          style: 'destructive',
          onPress: async () => {
            if (memory) {
              await memory.clear();
              await refreshStats(memory);
              Alert.alert('成功', '记忆已清除');
            }
          },
        },
      ]
    );
  };

  if (!stats) {
    return (
      <View style={styles.container}>
        <Text>加载中...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* 统计卡片 */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.totalMemories}</Text>
          <Text style={styles.statLabel}>总记忆</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.userPreferences}</Text>
          <Text style={styles.statLabel}>用户偏好</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {Math.round(stats.affect.mood * 100)}%
          </Text>
          <Text style={styles.statLabel}>情绪状态</Text>
        </View>
      </View>

      {/* DNA查看器 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🧬 DNA系统</Text>
        <View style={styles.dnaSelector}>
          {['USER', 'MEMORY', 'SKILLS'].map(dna => (
            <TouchableOpacity
              key={dna}
              style={[
                styles.dnaButton,
                selectedDNA === dna && styles.dnaButtonActive,
              ]}
              onPress={() => setSelectedDNA(dna)}
            >
              <Text style={styles.dnaButtonText}>{dna}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity style={styles.actionButton} onPress={viewDNA}>
          <Text style={styles.actionButtonText}>查看DNA内容</Text>
        </TouchableOpacity>
      </View>

      {/* 最近记忆 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📝 最近记忆</Text>
        {recentMemories.map((mem, index) => (
          <View key={mem.id} style={styles.memoryCard}>
            <View style={styles.memoryHeader}>
              <Text style={styles.memoryTime}>
                {new Date(mem.timestamp).toLocaleString()}
              </Text>
              <Text style={styles.memoryImportance}>
                重要度: {Math.round(mem.importance * 100)}%
              </Text>
            </View>
            <Text style={styles.memoryInput}>{mem.input}</Text>
            <Text style={styles.memoryOutput} numberOfLines={2}>
              {mem.output}
            </Text>
            <View style={styles.memoryTags}>
              {mem.tags.map((tag, i) => (
                <View key={i} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>

      {/* 操作按钮 */}
      <View style={styles.section}>
        <TouchableOpacity
          style={[styles.actionButton, styles.exportButton]}
          onPress={exportData}
        >
          <Text style={styles.actionButtonText}>📤 导出数据</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.clearButton]}
          onPress={clearData}
        >
          <Text style={styles.actionButtonText}>🗑️ 清除所有</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 15,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: THEME.primaryColor,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  dnaSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  dnaButton: {
    flex: 1,
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  dnaButtonActive: {
    backgroundColor: THEME.primaryColor,
  },
  dnaButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  actionButton: {
    backgroundColor: THEME.primaryColor,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  exportButton: {
    backgroundColor: THEME.successColor,
  },
  clearButton: {
    backgroundColor: THEME.errorColor,
  },
  memoryCard: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: THEME.primaryColor,
  },
  memoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  memoryTime: {
    fontSize: 11,
    color: '#999',
  },
  memoryImportance: {
    fontSize: 11,
    color: THEME.successColor,
  },
  memoryInput: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  memoryOutput: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  memoryTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 5,
  },
  tagText: {
    fontSize: 11,
    color: '#1976d2',
  },
});

export default MemoryScreen;