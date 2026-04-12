// 类型定义

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  tokens?: number;
}

export interface Memory {
  id: number;
  timestamp: string;
  input: string;
  output: string;
  importance: number;
  decayWeight: number;
  tags: string[];
  metadata?: any;
}

export interface DNA {
  USER: {
    preferences: Array<{ content: string; time: string }>;
    habits: Array<{ content: string; frequency: string; time: string }>;
  };
  MEMORY: {
    longTerm: Memory[];
  };
  SKILLS: {
    cache: any[];
  };
}

export interface AffectState {
  mood: number;
  confidence: number;
}

export interface Stats {
  totalMemories: number;
  userPreferences: number;
  userHabits: number;
  affect: AffectState;
}

export interface TokenPackage {
  id: string;
  name: string;
  tokens: number;
  price: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  tokenBalance: number;
  package: TokenPackage;
}