export interface Task {
  id: string;
  title: string;
  description?: string;
  category: 'critical' | 'hygiene' | 'sharma_ji' | 'someday';
  priority: 'high' | 'medium' | 'low';
  status: 'todo' | 'completed';
  dueDate?: string;
  effort?: string;
  auntieRoast?: string;
  riskScore?: number;
  completedAt?: string;
}

export interface DateReminder {
  id: string;
  title: string;
  date: string;
  type: 'birthday' | 'anniversary' | 'important';
  auntieRoast: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'auntie';
  text: string;
  timestamp: string;
  activityType?: 'vent' | 'excuse' | 'brag';
}

export type SpiceLevel = 'mild' | 'medium' | 'hot';

export interface BrainDumpAnalysisResult {
  tasks: Omit<Task, 'id' | 'status'>[];
  overallRoast: string;
  priorityOrderExplanation: string;
}
