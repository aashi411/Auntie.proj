import { Task, DateReminder, ChatMessage, SpiceLevel } from '../types';
import { INITIAL_TASKS, INITIAL_REMINDERS } from '../data/mockData';

const KEYS = {
  TASKS: 'auntie_tasks',
  REMINDERS: 'auntie_reminders',
  STREAK: 'auntie_streak',
  CHAT: 'auntie_chat',
  SPICE: 'auntie_spice'
};

/**
 * StorageService provides an abstraction layer over LocalStorage,
 * designed to be easily swapped with a cloud service like Firebase Firestore in the future.
 */
export const storageService = {
  // --- Tasks ---
  getTasks(): Task[] {
    const data = localStorage.getItem(KEYS.TASKS);
    if (data) {
      try {
        return JSON.parse(data);
      } catch (e) {
        console.error("Failed to parse stored tasks:", e);
      }
    }
    this.saveTasks(INITIAL_TASKS);
    return INITIAL_TASKS;
  },

  saveTasks(tasks: Task[]): void {
    localStorage.setItem(KEYS.TASKS, JSON.stringify(tasks));
  },

  // --- Reminders ---
  getReminders(): DateReminder[] {
    const data = localStorage.getItem(KEYS.REMINDERS);
    if (data) {
      try {
        return JSON.parse(data);
      } catch (e) {
        console.error("Failed to parse stored reminders:", e);
      }
    }
    this.saveReminders(INITIAL_REMINDERS);
    return INITIAL_REMINDERS;
  },

  saveReminders(reminders: DateReminder[]): void {
    localStorage.setItem(KEYS.REMINDERS, JSON.stringify(reminders));
  },

  // --- Streak ---
  getStreak(): number {
    const data = localStorage.getItem(KEYS.STREAK);
    if (data) {
      const val = parseInt(data, 10);
      return isNaN(val) ? 3 : val;
    }
    this.saveStreak(3);
    return 3;
  },

  saveStreak(streak: number): void {
    localStorage.setItem(KEYS.STREAK, streak.toString());
  },

  // --- Chat Messages ---
  getChatMessages(): ChatMessage[] {
    const data = localStorage.getItem(KEYS.CHAT);
    const initialGreeting: ChatMessage = {
      id: 'initial-greeting',
      sender: 'auntie',
      text: "Hello darling! Sit down. Have you had a glass of water today? Or are you just surviving on triple-shot iced matcha and pure anxiety? Tell Auntie what we are getting done today!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    if (data) {
      try {
        return JSON.parse(data);
      } catch (e) {
        console.error("Failed to parse stored chat messages:", e);
      }
    }
    
    const initialList = [initialGreeting];
    this.saveChatMessages(initialList);
    return initialList;
  },

  saveChatMessages(messages: ChatMessage[]): void {
    localStorage.setItem(KEYS.CHAT, JSON.stringify(messages));
  },

  // --- Spice Level ---
  getSpiceLevel(): SpiceLevel {
    const data = localStorage.getItem(KEYS.SPICE) as SpiceLevel | null;
    if (data && ['mild', 'medium', 'hot'].includes(data)) {
      return data;
    }
    this.saveSpiceLevel('medium');
    return 'medium';
  },

  saveSpiceLevel(spiceLevel: SpiceLevel): void {
    localStorage.setItem(KEYS.SPICE, spiceLevel);
  },

  // --- Wipe Data ---
  clearAll(): void {
    localStorage.setItem(KEYS.TASKS, JSON.stringify([]));
    localStorage.setItem(KEYS.REMINDERS, JSON.stringify([]));
    localStorage.setItem(KEYS.STREAK, '0');
    localStorage.removeItem(KEYS.CHAT);
    localStorage.removeItem('auntie_planner_data');
    localStorage.removeItem('auntie_streak_data');
    localStorage.removeItem('auntie_streak_count');
  }
};
