import { Task } from '../types';

const KEYS = {
  STREAK_DATA: 'auntie_streak_data'
};

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastStreakUpdateDate: string; // YYYY-MM-DD
  completedDates: string[]; // unique YYYY-MM-DD dates of completion
}

export const getLocalDateString = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getDaysDifference = (dateStr1: string, dateStr2: string): number => {
  const d1 = new Date(dateStr1 + 'T00:00:00');
  const d2 = new Date(dateStr2 + 'T00:00:00');
  const diffTime = d1.getTime() - d2.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
};

export const getDateOffsetString = (baseDateStr: string, offsetDays: number): string => {
  const date = new Date(baseDateStr + 'T12:00:00'); // Use midday to avoid DST shifts
  date.setDate(date.getDate() + offsetDays);
  return getLocalDateString(date);
};

// Calculate all contiguous streaks from a sorted, unique list of YYYY-MM-DD strings
export const calculateContiguousStreaks = (dates: string[], todayStr: string): { current: number; longest: number } => {
  if (dates.length === 0) {
    return { current: 0, longest: 0 };
  }

  // Create a unique, sorted list of dates
  const sortedDates = Array.from(new Set(dates))
    .filter(Boolean)
    .sort((a, b) => new Date(a + 'T00:00:00').getTime() - new Date(b + 'T00:00:00').getTime());

  if (sortedDates.length === 0) {
    return { current: 0, longest: 0 };
  }

  // 1. Calculate the overall longest contiguous streak in the entire history
  let maxStreak = 0;
  let currentContiguous = 0;
  let prevDateStr: string | null = null;

  for (const dateStr of sortedDates) {
    if (prevDateStr === null) {
      currentContiguous = 1;
    } else {
      const diff = getDaysDifference(dateStr, prevDateStr);
      if (diff === 1) {
        currentContiguous++;
      } else if (diff > 1) {
        if (currentContiguous > maxStreak) {
          maxStreak = currentContiguous;
        }
        currentContiguous = 1;
      }
    }
    prevDateStr = dateStr;
  }
  if (currentContiguous > maxStreak) {
    maxStreak = currentContiguous;
  }

  // 2. Calculate current streak (anchored at today or yesterday)
  let currentStreak = 0;
  const hasToday = sortedDates.includes(todayStr);
  const yesterdayStr = getDateOffsetString(todayStr, -1);
  const hasYesterday = sortedDates.includes(yesterdayStr);

  if (hasToday) {
    currentStreak = 1;
    let checkDate = getDateOffsetString(todayStr, -1);
    while (sortedDates.includes(checkDate)) {
      currentStreak++;
      checkDate = getDateOffsetString(checkDate, -1);
    }
  } else if (hasYesterday) {
    currentStreak = 1;
    let checkDate = getDateOffsetString(yesterdayStr, -1);
    while (sortedDates.includes(checkDate)) {
      currentStreak++;
      checkDate = getDateOffsetString(checkDate, -1);
    }
  } else {
    currentStreak = 0;
  }

  return {
    current: currentStreak,
    longest: Math.max(maxStreak, currentStreak)
  };
};

export const streakService = {
  getStreakData(): StreakData {
    const raw = localStorage.getItem(KEYS.STREAK_DATA);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          return {
            currentStreak: typeof parsed.currentStreak === 'number' ? parsed.currentStreak : 0,
            longestStreak: typeof parsed.longestStreak === 'number' ? parsed.longestStreak : 0,
            lastStreakUpdateDate: parsed.lastStreakUpdateDate || '',
            completedDates: Array.isArray(parsed.completedDates) ? parsed.completedDates : []
          };
        }
      } catch (e) {
        console.error('Error parsing streak data', e);
      }
    }

    // Default fallbacks if no existing streak data
    // To preserve the beautiful initial 3-day streak for existing users so it's not immediately 0,
    // we can pre-populate mock historical dates if there's no record.
    const today = getLocalDateString();
    const yesterday = getDateOffsetString(today, -1);
    const dayBefore = getDateOffsetString(today, -2);
    
    // Check if there was an old raw streak we can migrate
    const oldStreakRaw = localStorage.getItem('auntie_streak_count');
    const oldStreak = oldStreakRaw ? parseInt(oldStreakRaw, 10) : 3;

    const initialDates: string[] = [];
    if (oldStreak > 0) {
      // populate back from yesterday to form a nice valid starting sequence
      for (let i = 1; i <= oldStreak; i++) {
        initialDates.push(getDateOffsetString(today, -i));
      }
    }

    const defaultData: StreakData = {
      currentStreak: oldStreak,
      longestStreak: oldStreak,
      lastStreakUpdateDate: yesterday,
      completedDates: initialDates
    };
    
    this.saveStreakData(defaultData);
    return defaultData;
  },

  saveStreakData(data: StreakData): void {
    localStorage.setItem(KEYS.STREAK_DATA, JSON.stringify(data));
    localStorage.setItem('auntie_streak_count', data.currentStreak.toString());
  },

  // Process task list updates to dynamically keep streak accurate and prevent artificial inflation
  syncStreakWithTasks(tasks: Task[]): StreakData {
    const todayStr = getLocalDateString();
    const data = this.getStreakData();

    // Gather all unique completed dates from tasks that are marked completed
    const taskCompletedDates = tasks
      .filter(t => t.status === 'completed' && t.completedAt)
      .map(t => t.completedAt as string);

    // Merge task completed dates with existing registered completion dates
    const allDatesSet = new Set([...data.completedDates, ...taskCompletedDates]);
    
    // BUT if a completedAt date is in the tasks, but is NO LONGER completed in any task,
    // we should remove it to keep consistency (preventing cheating/reverting).
    // Let's identify which dates are in `completedDates` but are missing in the active tasks.
    // We only clean up dates for which there are active tasks loaded in memory.
    if (tasks.length > 0) {
      // Clean up dates that were unchecked
      for (const d of Array.from(allDatesSet)) {
        // If this date is present in tasks but not completed, we remove it
        const hasCompletedTaskForDate = tasks.some(t => t.status === 'completed' && t.completedAt === d);
        const hasTaskAtAllForDate = tasks.some(t => t.completedAt === d);
        if (hasTaskAtAllForDate && !hasCompletedTaskForDate) {
          allDatesSet.delete(d);
        }
      }
    }

    const uniqueDates = Array.from(allDatesSet).filter(Boolean);
    const { current, longest } = calculateContiguousStreaks(uniqueDates, todayStr);

    const updatedData: StreakData = {
      currentStreak: current,
      longestStreak: Math.max(data.longestStreak, longest),
      lastStreakUpdateDate: uniqueDates.length > 0 ? uniqueDates.sort().reverse()[0] : '',
      completedDates: uniqueDates
    };

    this.saveStreakData(updatedData);
    return updatedData;
  },

  // Called when a task is completed
  onTaskCompleted(taskId: string, tasks: Task[]): { updatedTasks: Task[]; streakData: StreakData } {
    const todayStr = getLocalDateString();
    
    const updatedTasks = tasks.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          status: 'completed' as const,
          completedAt: todayStr
        };
      }
      return t;
    });

    const data = this.getStreakData();
    if (!data.completedDates.includes(todayStr)) {
      data.completedDates.push(todayStr);
    }
    
    const { current, longest } = calculateContiguousStreaks(data.completedDates, todayStr);
    
    const updatedData: StreakData = {
      currentStreak: current,
      longestStreak: Math.max(data.longestStreak, longest),
      lastStreakUpdateDate: todayStr,
      completedDates: data.completedDates
    };

    this.saveStreakData(updatedData);
    return { updatedTasks, streakData: updatedData };
  },

  // Called when a task is marked as incomplete (todo)
  onTaskUncompleted(taskId: string, tasks: Task[]): { updatedTasks: Task[]; streakData: StreakData } {
    let targetCompletedAt: string | undefined;
    
    const updatedTasks = tasks.map(t => {
      if (t.id === taskId) {
        targetCompletedAt = t.completedAt;
        // Strip completedAt upon uncompleting
        const { completedAt, ...rest } = t;
        return {
          ...rest,
          status: 'todo' as const
        };
      }
      return t;
    });

    const todayStr = getLocalDateString();
    const data = this.getStreakData();

    // Check if there are any other completed tasks remaining on that target completion day
    if (targetCompletedAt) {
      const otherCompletedOnSameDay = updatedTasks.some(
        t => t.status === 'completed' && t.completedAt === targetCompletedAt
      );
      
      if (!otherCompletedOnSameDay) {
        // Remove the date from completedDates since no completed tasks remain for that day
        data.completedDates = data.completedDates.filter(d => d !== targetCompletedAt);
      }
    }

    const { current, longest } = calculateContiguousStreaks(data.completedDates, todayStr);
    
    const updatedData: StreakData = {
      currentStreak: current,
      longestStreak: Math.max(data.longestStreak, longest),
      lastStreakUpdateDate: data.completedDates.length > 0 ? data.completedDates.sort().reverse()[0] : '',
      completedDates: data.completedDates
    };

    this.saveStreakData(updatedData);
    return { updatedTasks, streakData: updatedData };
  },

  reset(): void {
    localStorage.removeItem(KEYS.STREAK_DATA);
    localStorage.removeItem('auntie_streak_count');
  }
};
