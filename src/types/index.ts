// 宠物信息
export interface Pet {
  id: string;
  name: string;
  breed: string;
  birthday: string;
  gender: 'male' | 'female';
  avatar?: string;
  weight?: number;
  color?: string;
}

// 成长事件
export interface GrowthEvent {
  id: string;
  petId: string;
  title: string;
  description: string;
  date: string;
  type: 'milestone' | 'health' | 'daily' | 'other';
  images?: string[];
  pawPrint?: boolean;
}

// 健康记录
export interface HealthRecord {
  id: string;
  petId: string;
  type: 'vaccine' | 'checkup' | 'medication' | 'deworming';
  title: string;
  date: string;
  nextDate?: string;
  notes?: string;
  veterinarian?: string;
  location?: string;
}

// 聊天消息
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}
