import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Task, DateReminder, ChatMessage, SpiceLevel, BrainDumpAnalysisResult } from '../types';
import { storageService } from '../services/storageService';
import { streakService } from '../services/streak.service';

export interface TimeBlock {
  time: string;
  activity: string;
  type: "work" | "rest" | "hygiene" | "family";
  auntieTip: string;
}

export interface PlannerData {
  message: string;
  todayPlan: TimeBlock[];
  riskScore: number;
  recommendations: string[];
  rescheduleLog?: string;
}

interface AuntieContextType {
  currentPage: 'landing' | 'dashboard' | 'braindump' | 'chat' | 'reminders' | 'analytics';
  setCurrentPage: (page: 'landing' | 'dashboard' | 'braindump' | 'chat' | 'reminders' | 'analytics') => void;
  tasks: Task[];
  reminders: DateReminder[];
  streak: number;
  longestStreak: number;
  chatMessages: ChatMessage[];
  spiceLevel: SpiceLevel;
  loading: boolean;
  
  // New Global Stores from checklist
  plannerData: PlannerData | null;
  auntieMood: 'pleased' | 'neutral' | 'scolding' | 'warm';
  lastGeminiResponse: any;

  // Actions
  toggleTask: (id: string) => void;
  addTask: (task: Task) => void;
  addTasksFromDump: (extractedTasks: Task[]) => void;
  rescheduleTask: (id: string, days: number) => void;
  deleteTask: (id: string) => void;
  
  addReminder: (rem: DateReminder) => void;
  deleteReminder: (id: string) => void;
  
  setSpiceLevel: (level: SpiceLevel) => void;
  sendMessage: (text: string, activityType?: 'vent' | 'excuse' | 'brag') => Promise<void>;
  clearChat: () => void;
  resetAllData: () => void;
  
  // Centralized AI request wrappers using our unified Auntie Engine
  fetchAuntieAdvice: () => Promise<{ advice: string; mood: 'pleased' | 'neutral' | 'scolding' | 'warm' }>;
  analyzeDumpText: (dumpText: string) => Promise<BrainDumpAnalysisResult>;
  generatePlannerData: (userInput: string) => Promise<PlannerData>;
  runRealityCheck: () => Promise<{ realityReport: string; dangerZones: string[]; recommendedActions: string[] }>;
  runDeadlineSimulator: (commitment: string) => Promise<{ headline: string; hoursRemainingText: string; dramaticSirenText: string; actionPlan: string[] }>;
}

const AuntieContext = createContext<AuntieContextType | undefined>(undefined);

const INITIAL_PLANNER: PlannerData = {
  message: "Drink a cup of tea, sweetheart. Let's do a fast focus check before we organize your day.",
  todayPlan: [
    { time: "09:00 AM", activity: "Tackle your biggest Study/Work focus", type: "work", auntieTip: "No chat apps open, darling! Focus!" },
    { time: "12:00 PM", activity: "Nourishing lunch & Hydration Check", type: "hygiene", auntieTip: "Drink warm cardamom water." },
    { time: "02:00 PM", activity: "Elite achievement duties (Sharma Ji speed)", type: "work", auntieTip: "Your cousin finished studying this 3 days ago." },
    { time: "05:00 PM", activity: "Clean up your workspace & Stretch", type: "hygiene", auntieTip: "That chair is not a closet!" }
  ],
  riskScore: 35,
  recommendations: [
    "Close all social media browser tabs.",
    "Place your phone on the other side of the room.",
    "Do the shortest duty first to build confidence!"
  ]
};

export function AuntieProvider({ children }: { children: ReactNode }) {
  const [currentPage, setCurrentPageState] = useState<'landing' | 'dashboard' | 'braindump' | 'chat' | 'reminders' | 'analytics'>('landing');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [reminders, setReminders] = useState<DateReminder[]>([]);
  const [streak, setStreak] = useState<number>(3);
  const [longestStreak, setLongestStreak] = useState<number>(3);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [spiceLevel, setSpiceLevelState] = useState<SpiceLevel>('medium');
  const [loading, setLoading] = useState<boolean>(false);

  // Global Stores requested
  const [plannerData, setPlannerData] = useState<PlannerData | null>(null);
  const [auntieMood, setAuntieMood] = useState<'pleased' | 'neutral' | 'scolding' | 'warm'>('neutral');
  const [lastGeminiResponse, setLastGeminiResponse] = useState<any>(null);

  // Initialize from storage service on mount
  useEffect(() => {
    const loadedTasks = storageService.getTasks();
    setTasks(loadedTasks);
    setReminders(storageService.getReminders());
    setChatMessages(storageService.getChatMessages());
    setSpiceLevelState(storageService.getSpiceLevel());

    // Sync streak with loaded tasks to handle break verification and load real values
    const streakData = streakService.syncStreakWithTasks(loadedTasks);
    setStreak(streakData.currentStreak);
    setLongestStreak(streakData.longestStreak);

    // Restore cached planner if exists
    const cachedPlan = localStorage.getItem('auntie_planner_data');
    if (cachedPlan) {
      try {
        setPlannerData(JSON.parse(cachedPlan));
      } catch {
        setPlannerData(INITIAL_PLANNER);
      }
    } else {
      setPlannerData(INITIAL_PLANNER);
    }
  }, []);

  const setCurrentPage = (page: 'landing' | 'dashboard' | 'braindump' | 'chat' | 'reminders' | 'analytics') => {
    setCurrentPageState(page);
  };

  // --- Task Management Actions & Automatic AI Enhancements ---

  const recalculateRiskScores = async (currentTasksList: Task[]) => {
    if (currentTasksList.length === 0) return;
    try {
      const level = spiceLevel === 'hot' ? 'red_chilli' : spiceLevel;
      const response = await fetch('/api/auntie-engine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: "calculate_risk",
          roastLevel: level,
          currentTasks: currentTasksList
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.taskRisks) {
          const updated = currentTasksList.map(t => {
            const riskInfo = data.taskRisks.find((r: any) => r.id === t.id);
            if (riskInfo) {
              return { 
                ...t, 
                riskScore: riskInfo.riskScore,
                auntieRoast: riskInfo.warning ? riskInfo.warning : t.auntieRoast
              };
            }
            return t;
          });
          setTasks(updated);
          storageService.saveTasks(updated);
        }
      }
    } catch (e) {
      console.error("Error calculating risk scores:", e);
    }
  };

  const triggerAutoReschedule = async (currentTasksList: Task[], triggerReason: string, changedTaskTitle: string) => {
    const level = spiceLevel === 'hot' ? 'red_chilli' : spiceLevel;
    try {
      const response = await fetch('/api/auntie-engine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: "planner",
          roastLevel: level,
          userInput: `Automatically reschedule schedule because: ${triggerReason} for "${changedTaskTitle}"`,
          currentTasks: currentTasksList.filter(t => t.status === 'todo'),
          completedTasks: currentTasksList.filter(t => t.status === 'completed'),
          streak
        })
      });

      if (response.ok) {
        const data = await response.json();
        const rescheduleLog = `Rescheduled because of "${triggerReason.toLowerCase()}" on "${changedTaskTitle}". Auntie optimized your schedule for maximum focus!`;
        const updatedPlannerData = {
          ...data,
          rescheduleLog
        };
        setPlannerData(updatedPlannerData);
        localStorage.setItem('auntie_planner_data', JSON.stringify(updatedPlannerData));
      }
    } catch (error) {
      console.error("Error automatically rescheduling:", error);
    }
  };

  const toggleTask = (id: string) => {
    let changedTask: Task | undefined;
    const isCompleting = tasks.find(t => t.id === id)?.status === 'todo';
    
    let updatedTasks: Task[] = [];
    let streakData;

    if (isCompleting) {
      const result = streakService.onTaskCompleted(id, tasks);
      updatedTasks = result.updatedTasks;
      streakData = result.streakData;
    } else {
      const result = streakService.onTaskUncompleted(id, tasks);
      updatedTasks = result.updatedTasks;
      streakData = result.streakData;
    }

    setStreak(streakData.currentStreak);
    setLongestStreak(streakData.longestStreak);
    setTasks(updatedTasks);
    storageService.saveTasks(updatedTasks);

    changedTask = updatedTasks.find(t => t.id === id);
    if (changedTask) {
      const reason = isCompleting ? "Task Completed Late" : "Task Re-opened";
      triggerAutoReschedule(updatedTasks, reason, changedTask.title);
      recalculateRiskScores(updatedTasks);
    }
  };

  const addTask = (task: Task) => {
    // Check if task doesn't have a risk score, calculate one locally as starting point
    const hasScore = task.riskScore !== undefined;
    let initialScore = 30;
    if (task.priority === 'high') initialScore = 75;
    else if (task.priority === 'medium') initialScore = 45;
    if (task.category === 'critical' || task.category === 'sharma_ji') initialScore += 15;
    
    const preparedTask = {
      ...task,
      riskScore: hasScore ? task.riskScore : Math.min(95, initialScore)
    };

    const updated = [preparedTask, ...tasks];
    setTasks(updated);
    storageService.saveTasks(updated);

    // If new task is urgent (high priority), trigger automatic rescheduling!
    const isUrgent = preparedTask.priority === 'high' || preparedTask.category === 'critical' || preparedTask.category === 'sharma_ji';
    if (isUrgent) {
      triggerAutoReschedule(updated, "New Urgent Task Added", preparedTask.title);
    }
    recalculateRiskScores(updated);
  };

  const addTasksFromDump = (extractedTasks: Task[]) => {
    const updated = [...extractedTasks, ...tasks];
    setTasks(updated);
    storageService.saveTasks(updated);
    triggerAutoReschedule(updated, "Tasks Imported From Brain Dump", `${extractedTasks.length} tasks`);
    recalculateRiskScores(updated);
  };

  const rescheduleTask = (id: string, days: number) => {
    let changedTask: Task | undefined;
    const updated = tasks.map((t) => {
      if (t.id === id) {
        changedTask = t;
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + days);
        const formattedDate = targetDate.toISOString().split('T')[0];

        const funnyExcuses = [
          "Oh, great! The procrastination protocol has been activated.",
          "Snoozing is sweet poison, sweetheart.",
          "Tomorrow is a magical place where all your tasks supposedly finish themselves."
        ];
        const randomExc = funnyExcuses[Math.floor(Math.random() * funnyExcuses.length)];

        return { 
          ...t, 
          dueDate: formattedDate,
          auntieRoast: `You snoozed this by ${days} days! ${randomExc} Your cousin graduated from Stanford and never snoozes.`
        };
      }
      return t;
    });
    setTasks(updated);
    storageService.saveTasks(updated);

    if (changedTask) {
      triggerAutoReschedule(updated, "Task Snoozed / Skipped", changedTask.title);
      recalculateRiskScores(updated);
    }
  };

  const deleteTask = (id: string) => {
    const deletedTask = tasks.find(t => t.id === id);
    const updated = tasks.filter((t) => t.id !== id);
    setTasks(updated);
    storageService.saveTasks(updated);

    // Sync streak when task is deleted
    const streakData = streakService.syncStreakWithTasks(updated);
    setStreak(streakData.currentStreak);
    setLongestStreak(streakData.longestStreak);

    if (deletedTask) {
      triggerAutoReschedule(updated, "Task Deleted", deletedTask.title);
      recalculateRiskScores(updated);
    }
  };

  // --- Reminders Management ---
  const addReminder = (rem: DateReminder) => {
    const updated = [rem, ...reminders];
    setReminders(updated);
    storageService.saveReminders(updated);
  };

  const deleteReminder = (id: string) => {
    const updated = reminders.filter((r) => r.id !== id);
    setReminders(updated);
    storageService.saveReminders(updated);
  };

  // --- Spice Level ---
  const setSpiceLevel = (level: SpiceLevel) => {
    setSpiceLevelState(level);
    storageService.saveSpiceLevel(level);
  };

  // --- Chat & Vent Messages with real server API ---
  const sendMessage = async (text: string, activityType?: 'vent' | 'excuse' | 'brag') => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: Math.random().toString(36).substring(2, 9),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      activityType
    };

    const nextMessages = [...chatMessages, userMsg];
    setChatMessages(nextMessages);
    storageService.saveChatMessages(nextMessages);

    setLoading(true);
    try {
      const level = spiceLevel === 'hot' ? 'red_chilli' : spiceLevel;
      const response = await fetch('/api/auntie-engine', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: "vent",
          roastLevel: level,
          userInput: text,
          streak,
          mood: activityType || 'neutral'
        })
      });

      if (!response.ok) {
        throw new Error("Sip of tea went down the wrong pipe, sweetheart.");
      }

      const data = await response.json();
      setLastGeminiResponse(data);
      
      const replyMood = data.mood || "neutral";
      setAuntieMood(replyMood);

      const auntieMsg: ChatMessage = {
        id: Math.random().toString(36).substring(2, 9),
        sender: 'auntie',
        text: data.reply || data.message || "Do your work, darling! Auntie is watching.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      const finalMessages = [...nextMessages, auntieMsg];
      setChatMessages(finalMessages);
      storageService.saveChatMessages(finalMessages);
    } catch (error) {
      console.error("Context Chat Error:", error);
      
      const auntieErrorMsg: ChatMessage = {
        id: Math.random().toString(36).substring(2, 9),
        sender: 'auntie',
        text: "Sweetheart, my phone network behaves like a slow turtle. But listen: just open your books, finish what you need, and don't make excuses!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      const finalMessages = [...nextMessages, auntieErrorMsg];
      setChatMessages(finalMessages);
      storageService.saveChatMessages(finalMessages);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    const initialGreeting: ChatMessage = {
      id: 'initial-greeting',
      sender: 'auntie',
      text: "Hello sweetheart! Chat cleared. Have you taken a deep breath and hydrated yet? What's on your mind?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setChatMessages([initialGreeting]);
    storageService.saveChatMessages([initialGreeting]);
  };

  // --- Reset All Data ---
  const resetAllData = () => {
    storageService.clearAll();
    streakService.reset();
    localStorage.removeItem('auntie_planner_data');
    setTasks([]);
    setReminders([]);
    setStreak(0);
    setLongestStreak(0);
    setPlannerData(INITIAL_PLANNER);
    setAuntieMood('neutral');
    
    const initialGreeting: ChatMessage = {
      id: 'initial-greeting',
      sender: 'auntie',
      text: "Hello darling! All wiped clean. Let's pour a fresh hot cup of tea and start fresh and focused today!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setChatMessages([initialGreeting]);
    storageService.saveChatMessages([initialGreeting]);
    setCurrentPage('landing');
  };

  // --- External API Integrations via Centralized Auntie Engine ---

  const fetchAuntieAdvice = async () => {
    const todoCount = tasks.filter(t => t.status === 'todo').length;
    const completedCount = tasks.filter(t => t.status === 'completed').length;
    const level = spiceLevel === 'hot' ? 'red_chilli' : spiceLevel;

    try {
      const res = await fetch('/api/auntie-engine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: "roast",
          roastLevel: level,
          currentTasks: tasks.filter(t => t.status === 'todo'),
          completedTasks: tasks.filter(t => t.status === 'completed'),
          streak,
          userInput: ""
        })
      });
      if (res.ok) {
        const data = await res.json();
        setLastGeminiResponse(data);
        if (data.advice) {
          setAuntieMood(data.mood || 'neutral');
          return { advice: data.advice, mood: data.mood || 'neutral' };
        }
      }
    } catch (e) {
      console.error("Error calling auntie-engine advice:", e);
    }

    return {
      advice: "Drink a glass of water and look at your tasks, sweetheart!",
      mood: 'neutral' as const
    };
  };

  const analyzeDumpText = async (dumpText: string) => {
    const level = spiceLevel === 'hot' ? 'red_chilli' : spiceLevel;
    try {
      const response = await fetch('/api/auntie-engine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: "brain_dump",
          roastLevel: level,
          userInput: dumpText,
          streak
        })
      });
      if (response.ok) {
        const data = await response.json();
        setLastGeminiResponse(data);
        return data;
      }
    } catch (e) {
      console.error("Error analyzing brain dump:", e);
    }
    
    // Static Fallback
    return {
      tasks: [],
      overallRoast: "Auntie scanned your brain dump. Let's write down real focus duties, darling!",
      priorityOrderExplanation: "Focus on clean essentials and studies first."
    };
  };

  const generatePlannerData = async (userInput: string): Promise<PlannerData> => {
    setLoading(true);
    const level = spiceLevel === 'hot' ? 'red_chilli' : spiceLevel;
    try {
      const response = await fetch('/api/auntie-engine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: "planner",
          roastLevel: level,
          userInput,
          currentTasks: tasks.filter(t => t.status === 'todo'),
          completedTasks: tasks.filter(t => t.status === 'completed'),
          streak
        })
      });

      if (response.ok) {
        const data = await response.json();
        setLastGeminiResponse(data);
        setPlannerData(data);
        localStorage.setItem('auntie_planner_data', JSON.stringify(data));
        return data;
      }
    } catch (error) {
      console.error("Error generating planner data:", error);
    } finally {
      setLoading(false);
    }

    return INITIAL_PLANNER;
  };

  const runRealityCheck = async () => {
    const level = spiceLevel === 'hot' ? 'red_chilli' : spiceLevel;
    try {
      const response = await fetch('/api/auntie-engine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: "reality_check",
          roastLevel: level,
          currentTasks: tasks.filter(t => t.status === 'todo'),
          completedTasks: tasks.filter(t => t.status === 'completed'),
          streak
        })
      });
      if (response.ok) {
        const data = await response.json();
        setLastGeminiResponse(data);
        return data;
      }
    } catch (e) {
      console.error("Error executing reality check:", e);
    }

    return {
      realityReport: "Finish your chores, sweetheart! Procrastination is a scary road.",
      dangerZones: ["Opening shopping websites", "Staring blankly at task lists"],
      recommendedActions: ["Clean up your desk right away", "Take a big sip of fresh water"]
    };
  };

  const runDeadlineSimulator = async (commitment: string) => {
    const level = spiceLevel === 'hot' ? 'red_chilli' : spiceLevel;
    try {
      const response = await fetch('/api/auntie-engine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: "deadline_simulator",
          roastLevel: level,
          userInput: commitment,
          streak
        })
      });
      if (response.ok) {
        const data = await response.json();
        setLastGeminiResponse(data);
        return data;
      }
    } catch (e) {
      console.error("Error in deadline simulator:", e);
    }

    return {
      headline: "⏰ Commitment Alert: The clock is ticking!",
      hoursRemainingText: "Time is fleeing, sweetheart!",
      dramaticSirenText: "WEE-WOO-WEE-WOO! Sharma Ji is already looking at his watch!",
      actionPlan: ["Mute all your screens", "Set a 20-minute visual timer", "Start right now"]
    };
  };

  return (
    <AuntieContext.Provider value={{
      currentPage,
      setCurrentPage,
      tasks,
      reminders,
      streak,
      longestStreak,
      chatMessages,
      spiceLevel,
      loading,
      
      // Global stores
      plannerData,
      auntieMood,
      lastGeminiResponse,
      
      toggleTask,
      addTask,
      addTasksFromDump,
      rescheduleTask,
      deleteTask,
      addReminder,
      deleteReminder,
      setSpiceLevel,
      sendMessage,
      clearChat,
      resetAllData,
      
      // AI action orchestrations
      fetchAuntieAdvice,
      analyzeDumpText,
      generatePlannerData,
      runRealityCheck,
      runDeadlineSimulator
    }}>
      {children}
    </AuntieContext.Provider>
  );
}

export function useAuntie() {
  const context = useContext(AuntieContext);
  if (context === undefined) {
    throw new Error('useAuntie must be used within an AuntieProvider');
  }
  return context;
}
