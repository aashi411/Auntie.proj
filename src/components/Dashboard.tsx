import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, Circle, Flame, Sparkles, ClipboardList, 
  Hourglass, AlertTriangle, Filter, Plus, Clock, ArrowRight,
  ShieldCheck, HelpCircle, X, ChevronRight, CornerDownRight
} from 'lucide-react';
import { Task, SpiceLevel } from '../types';
import MascotCup from './MascotCup';
import { useAuntie } from '../context/AuntieContext';

interface DashboardProps {
  tasks: Task[];
  streak: number;
  longestStreak?: number;
  spiceLevel: SpiceLevel;
  onToggleTask: (id: string) => void;
  onAddTask: (task: Task) => void;
  onRescheduleTask: (id: string, days: number) => void;
  onDeleteTask: (id: string) => void;
}

const CATEGORY_TABS = [
  { id: 'all', label: 'All Duties 📋' },
  { id: 'sharma_ji', label: "Elite Level 🎓" },
  { id: 'critical', label: 'Critical Focus 🚨' },
  { id: 'hygiene', label: 'Daily Essentials 🧹' },
  { id: 'someday', label: 'Someday Vibes ☕' }
];

const SNOOZE_ROASTS = [
  "Oh, great! The procrastination protocol has been activated. How original, sweetheart.",
  "Darling, if you postpone this task again, it will buy its own apartment and start asking you for rent!",
  "Your successful cousin already finished next week's tasks yesterday while running a green-tech incubator. Sure you want to snooze?",
  "Procrastination is the ultimate sweet poison! Snooze it, but don't come crying to me when your deadlines come barking.",
  "Snoozing again? Okay, I will brew another cup of tea while you hunt for more creative excuses."
];

export default function Dashboard({ tasks, streak, longestStreak, spiceLevel, onToggleTask, onAddTask, onRescheduleTask, onDeleteTask }: DashboardProps) {
  const { plannerData } = useAuntie();
  const [activeTab, setActiveTab] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [snoozeModalTask, setSnoozeModalTask] = useState<Task | null>(null);
  const [snoozeRoast, setSnoozeRoast] = useState('');

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'sharma_ji' | 'critical' | 'hygiene' | 'someday'>('sharma_ji');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [effort, setEffort] = useState('1 hour');

  // Filtered Tasks
  const filteredTasks = tasks.filter(task => {
    if (activeTab === 'all') return true;
    return task.category === activeTab;
  });

  const todoCount = tasks.filter(t => t.status === 'todo').length;
  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const urgentCount = tasks.filter(t => t.status === 'todo' && t.priority === 'high').length;

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    // Custom auto roasts based on category and spiceLevel
    let auntieRoast = '';
    if (spiceLevel === 'mild') {
      if (category === 'sharma_ji') {
        auntieRoast = `You're working on something amazing, darling! Let's do your best so we can celebrate your progress. 🌸`;
      } else if (category === 'critical') {
        auntieRoast = `This is quite important, sweetheart. Let's focus on it together!`;
      } else if (category === 'hygiene') {
        auntieRoast = `Just a quick tidy up, honey. It will feel so fresh and clean!`;
      } else {
        auntieRoast = `A lovely plan for someday! Keep dreaming and doing what you can.`;
      }
    } else if (spiceLevel === 'medium') {
      if (category === 'sharma_ji') {
        auntieRoast = `Your high-achieving cousin did this in middle school. You are doing it now. Focus so you can at least try to match their speed, darling!`;
      } else if (category === 'critical') {
        auntieRoast = `Oh my lord! This is a critical matter. Close all your distractors and do it immediately.`;
      } else if (category === 'hygiene') {
        auntieRoast = `Your living space looks like a chaotic thrift store. Clean up before I tell your mother!`;
      } else {
        auntieRoast = `Ah, a 'someday' task. Which means you will look at this list, feel happy, and then proceed to do absolutely nothing. Correct?`;
      }
    } else {
      // HOT SHARMA JI LEVEL 🌶️🌶️🌶️
      if (category === 'sharma_ji') {
        auntieRoast = `Sharma Ji's son finished this last week, and you are just now adding it to a list? Sharma Ji is not impressed. Get to work before I call your family! 🎓🌶️`;
      } else if (category === 'critical') {
        auntieRoast = `Oh look! A 'critical' task. Let me guess, you'll ignore this until it's 10 minutes past the deadline and then cry about 'burnout'. DO IT NOW! 🚨🔥`;
      } else if (category === 'hygiene') {
        auntieRoast = `Clean up! That chair is not a wardrobe, sweetheart. Soon that pile of clothes will stand up, start asking you for rent, and file for its own tax ID! 🧹🌶️`;
      } else {
        auntieRoast = `Ah, a 'someday' task. Translation: 'This is where tasks go to die a slow, painful death of complete abandonment.' Why are you like this? ☕🌶️`;
      }
    }

    const newTask: Task = {
      id: `task-custom-${Date.now()}`,
      title: title.trim(),
      description: description.trim() || undefined,
      category,
      priority,
      status: 'todo',
      dueDate: new Date().toISOString().split('T')[0],
      effort,
      auntieRoast
    };

    onAddTask(newTask);
    setTitle('');
    setDescription('');
    setCategory('sharma_ji');
    setPriority('medium');
    setEffort('1 hour');
    setShowAddForm(false);
  };

  const triggerSnoozeModal = (task: Task) => {
    let roast = '';
    if (spiceLevel === 'mild') {
      const mildSnoozes = [
        "It's okay to take a little rest, sweetheart. We will tackle this tomorrow when you have more energy! 🌸",
        "Don't worry, honey. Your health and peace of mind come first. Let's do it another day. 💕",
        "A small break is good, darling. Take a deep breath!"
      ];
      roast = mildSnoozes[Math.floor(Math.random() * mildSnoozes.length)];
    } else if (spiceLevel === 'medium') {
      const mediumSnoozes = [
        "Oh, great! The procrastination protocol has been activated. How original, sweetheart.",
        "Darling, if you postpone this task again, it will buy its own apartment and start asking you for rent!",
        "Your successful cousin already finished next week's tasks yesterday while running a green-tech incubator. Sure you want to snooze?",
        "Procrastination is the ultimate sweet poison! Snooze it, but don't come crying to me when your deadlines come barking.",
        "Snoozing again? Okay, I will brew another cup of tea while you hunt for more creative excuses."
      ];
      roast = mediumSnoozes[Math.floor(Math.random() * mediumSnoozes.length)];
    } else {
      // HOT RED CHILLY SHARMA JI LEVEL 🌶️🌶️🌶️
      const hotSnoozes = [
        "Snoozing again? Oho! Your procrastination is of premium, imported quality. Sharma Ji's son is currently completing next quarter's goals, and you can't even complete today's! 🌶️🌶️🌶️",
        "Oho! Postponing again? At this rate, this task will grow old, retire, draw pension, and buy a Florida timeshare before you even click 'Start'!",
        "You are treating this task list like a terms and conditions page — just scrolling to the bottom to click 'Accept later' without doing anything. Absolute cinema! 🎬🌶️",
        "Stop romanticizing your chaotic laziness, darling. Discipline is hot. Postponing high priority duties is absolutely tragic. 😎🔥",
        "Acha, fine! Snooze it! Let's see if the deadline also decided to snooze itself. Spoiler: It did not!"
      ];
      roast = hotSnoozes[Math.floor(Math.random() * hotSnoozes.length)];
    }
    setSnoozeRoast(roast);
    setSnoozeModalTask(task);
  };

  const handleConfirmSnooze = (days: number) => {
    if (!snoozeModalTask) return;
    onRescheduleTask(snoozeModalTask.id, days);
    setSnoozeModalTask(null);
  };

  // Determine Auntie's facial icon and subtitle based on current backlog count
  const getMoodMeter = () => {
    if (todoCount === 0 && completedCount === 0) {
      return { label: "CALM (NO ACTIVE DUTIES)", color: "text-stone-500 bg-stone-50 border-stone-200", meter: "w-0 bg-stone-400", emoji: "👵🏽☕" };
    }
    if (todoCount === 0 && completedCount > 0) {
      return { label: "PROUD (ELITE COUSIN LEVEL)", color: "text-emerald-700 bg-emerald-50 border-emerald-300", meter: "w-full bg-emerald-500", emoji: "👵🏽✨" };
    }
    if (urgentCount > 2) {
      return { label: "EXTREME CRISIS LEVEL", color: "text-rose-700 bg-rose-50 border-rose-300", meter: "w-1/4 bg-rose-500", emoji: "👵🏽🔥" };
    }
    if (todoCount > 4) {
      return { label: "DISAPPOINTED AUNTIE", color: "text-amber-700 bg-amber-50 border-amber-300", meter: "w-2/5 bg-amber-500", emoji: "👵🏽😠" };
    }
    return { label: "BALANCED COACH AUNTIE", color: "text-stone-700 bg-stone-50 border-stone-300", meter: "w-2/3 bg-stone-500", emoji: "👵🏽☕" };
  };

  const moodMeter = getMoodMeter();

  return (
    <div id="dashboard-container" className="space-y-6">
      {/* bento grid statistics block */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Stat Card 1: Streak */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-dark-brown/15 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 text-center sm:text-left">
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-bold text-stone-400 block uppercase tracking-wide">Daily Streak</span>
            <span className="text-2xl sm:text-3xl font-display font-bold text-accent-terracotta flex items-center justify-center sm:justify-start gap-1">
              <Flame className="w-7 h-7 sm:w-8 sm:h-8 fill-accent-terracotta text-accent-terracotta animate-pulse" />
              <span>{streak} Days</span>
            </span>
            {longestStreak !== undefined && (
              <span className="text-[9px] font-mono font-bold text-stone-400 block tracking-wider uppercase mt-1">
                Longest: {longestStreak} Days
              </span>
            )}
          </div>
          <div className="sm:text-right">
            <span className="text-xs font-sans text-light-brown font-medium block">
              {streak > 2 ? 'Auntie is pleased!' : "Don't break it, darling!"}
            </span>
          </div>
        </div>

        {/* Stat Card 2: Pending Tasks */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-dark-brown/15 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 text-center sm:text-left">
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-bold text-stone-400 block uppercase tracking-wide">Pending Duties</span>
            <span className="text-2xl sm:text-3xl font-display font-bold text-dark-brown flex items-center justify-center sm:justify-start gap-1.5">
              <ClipboardList className="w-7 h-7 sm:w-8 sm:h-8 text-light-brown" />
              <span>{todoCount} Active</span>
            </span>
          </div>
          <div className="sm:text-right">
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full inline-block ${urgentCount > 0 ? 'bg-rose-100 text-rose-800' : 'bg-stone-100 text-stone-700'}`}>
              {urgentCount} URGENT
            </span>
          </div>
        </div>

        {/* Stat Card 3: Completed Tasks */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-dark-brown/15 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 text-center sm:text-left">
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-bold text-stone-400 block uppercase tracking-wide">Completed Duties</span>
            <span className="text-2xl sm:text-3xl font-display font-bold text-accent-green flex items-center justify-center sm:justify-start gap-1.5">
              <CheckCircle2 className="w-7 h-7 sm:w-8 sm:h-8 text-accent-green" />
              <span>{completedCount} Done</span>
            </span>
          </div>
          <div className="sm:text-right">
            <span className="text-xs font-sans text-light-brown font-medium">
              Auntie is proud!
            </span>
          </div>
        </div>

        {/* Stat Card 4: Auntie's Mood Meter */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-dark-brown/15 shadow-sm space-y-3 flex flex-col justify-between text-center sm:text-left">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-stone-400 block uppercase tracking-wide">Auntie's Mood</span>
            <span className="text-2xl leading-none select-none">{moodMeter.emoji}</span>
          </div>
          <div className={`text-[10px] text-center font-display font-bold py-1 px-2.5 rounded-sm border ${moodMeter.color}`}>
            {moodMeter.label}
          </div>
          <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden border border-dark-brown/5">
            <div className={`h-full transition-all duration-500 ${moodMeter.meter}`} />
          </div>
        </div>
      </div>

      {/* Dynamic Rescheduling Log Notice */}
      {plannerData?.rescheduleLog && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-amber-50 border-2 border-amber-300 rounded-3xl p-5 flex flex-col sm:flex-row items-center gap-4 shadow-xs"
        >
          <div className="bg-amber-100 p-2.5 rounded-full text-amber-700 flex-shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h4 className="font-display font-bold text-dark-brown text-sm">Auntie's Schedule Optimizer Triggered! ⏰</h4>
            <p className="text-xs font-sans text-stone-600 mt-1 leading-relaxed">
              {plannerData.rescheduleLog}
            </p>
          </div>
          <div className="text-[10px] font-mono font-bold bg-amber-100 text-amber-800 px-3 py-1.5 rounded-full uppercase tracking-wider flex-shrink-0">
            Schedule Realigned
          </div>
        </motion.div>
      )}

      {/* Add Task Toggle & Form */}
      <div className="flex items-center justify-between">
        <h3 className="font-display font-bold text-xl text-dark-brown">Your Active Tasks</h3>
        <button
          id="toggle-add-task-btn"
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-accent-terracotta hover:bg-accent-terracotta/90 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{showAddForm ? 'Close Form' : 'Add Task'}</span>
        </button>
      </div>

      {/* Form Card */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleAddTask} className="bg-warm-beige/50 border-2 border-dark-brown/10 p-5 rounded-3xl space-y-4">
              <h4 className="font-display font-bold text-dark-brown text-sm">Draft a New Task</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold text-light-brown">TASK TITLE</label>
                  <input
                    id="new-task-title"
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="E.g., Finish my math coding homework"
                    className="w-full bg-white border border-dark-brown/15 rounded-xl px-3 py-2 text-sm focus:outline-hidden focus:border-accent-terracotta"
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <label className="text-xs font-mono font-bold text-light-brown">CATEGORY</label>
                    <select
                      id="new-task-category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value as any)}
                      className="w-full bg-white border border-dark-brown/15 rounded-xl px-2 py-2 text-xs focus:outline-hidden"
                    >
                      <option value="sharma_ji">Elite Level 🎓</option>
                      <option value="critical">Critical Focus 🚨</option>
                      <option value="hygiene">Daily Essentials 🧹</option>
                      <option value="someday">Someday Vibes ☕</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-mono font-bold text-light-brown">PRIORITY</label>
                    <select
                      id="new-task-priority"
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as any)}
                      className="w-full bg-white border border-dark-brown/15 rounded-xl px-2 py-2 text-xs focus:outline-hidden"
                    >
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-mono font-bold text-light-brown">EFFORT</label>
                    <input
                      id="new-task-effort"
                      type="text"
                      required
                      value={effort}
                      onChange={(e) => setEffort(e.target.value)}
                      placeholder="1 hour"
                      className="w-full bg-white border border-dark-brown/15 rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-accent-terracotta"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono font-bold text-light-brown">SHORT DETAILS (OPTIONAL)</label>
                <input
                  id="new-task-desc"
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Review formulas, answer exercise 4..."
                  className="w-full bg-white border border-dark-brown/15 rounded-xl px-3 py-2 text-sm focus:outline-hidden focus:border-accent-terracotta"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 border border-dark-brown/10 rounded-xl text-xs font-bold text-light-brown hover:bg-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  id="submit-task-btn"
                  type="submit"
                  className="px-5 py-2 bg-accent-green hover:bg-accent-green/90 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Confirm Task
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Task Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto py-1 border-b border-dark-brown/10">
        {CATEGORY_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold font-display transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === tab.id
                ? 'bg-accent-terracotta text-white'
                : 'text-light-brown hover:bg-warm-beige'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Task List Grid */}
      <div className="space-y-4">
        {filteredTasks.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 border-2 border-dashed border-dark-brown/15 text-center text-light-brown font-sans font-medium">
            <span className="text-4xl block mb-2 select-none">🧹📭</span>
            "Either you are incredibly organized... or you have forgotten something important."
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                className={`bg-white rounded-3xl p-6 border-2 border-dark-brown/15 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all ${
                  task.status === 'completed' ? 'opacity-65 border-dark-brown/5 bg-warm-beige/10' : ''
                }`}
              >
                <div className="flex items-start gap-4 flex-1">
                  {/* Custom Checkbox Action */}
                  <button
                    id={`toggle-task-${task.id}`}
                    onClick={() => onToggleTask(task.id)}
                    className="mt-1 flex-shrink-0 cursor-pointer"
                  >
                    {task.status === 'completed' ? (
                      <CheckCircle2 className="w-6 h-6 text-accent-green fill-emerald-50" />
                    ) : (
                      <Circle className="w-6 h-6 text-stone-300 hover:text-accent-terracotta transition-colors" />
                    )}
                  </button>

                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className={`font-display font-bold text-base text-dark-brown ${
                        task.status === 'completed' ? 'line-through text-stone-400' : ''
                      }`}>
                        {task.title}
                      </h4>
                      <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-sm ${
                        task.priority === 'high' ? 'bg-rose-100 text-rose-800' :
                        task.priority === 'medium' ? 'bg-amber-100 text-amber-800' :
                        'bg-stone-100 text-stone-700'
                      }`}>
                        {task.priority}
                      </span>
                      {task.status === 'todo' && (
                        <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-sm border ${
                          (task.riskScore || 30) > 70 ? 'bg-rose-50 text-rose-700 border-rose-200' :
                          (task.riskScore || 30) > 35 ? 'bg-amber-50 text-amber-700 border-amber-200' :
                          'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}>
                          Risk Score: {task.riskScore || 30}%
                        </span>
                      )}
                    </div>

                    {task.description && (
                      <p className={`text-sm text-light-brown font-sans ${task.status === 'completed' ? 'text-stone-400' : ''}`}>
                        {task.description}
                      </p>
                    )}

                    {/* Auntie's sarcastic roast widget */}
                    {task.status === 'todo' && task.auntieRoast && (
                      <div className="mt-3 bg-stone-50 border border-dark-brown/5 rounded-2xl p-4 flex gap-2.5 items-start">
                        <div className="flex-shrink-0 mt-0.5">
                          <MascotCup size={24} />
                        </div>
                        <p className="text-xs font-sans italic text-light-brown leading-relaxed font-medium">
                          "{task.auntieRoast}"
                        </p>
                      </div>
                    )}
                    
                    {task.status === 'completed' && (
                      <span className="text-xs font-sans text-accent-green font-semibold flex items-center gap-1 mt-1">
                        <Sparkles className="w-3.5 h-3.5 fill-emerald-100" />
                        "Very nice! Your successful cousin is thoroughly impressed."
                      </span>
                    )}
                  </div>
                </div>

                {/* Right controls: effort estimate & Rescheduling */}
                <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-dark-brown/5">
                  <div className="flex items-center gap-1.5 text-xs text-light-brown font-mono font-bold">
                    <Clock className="w-3.5 h-3.5" />
                    <span>EFFORT: {task.effort}</span>
                  </div>

                  {task.status === 'todo' && (
                    <div className="flex items-center gap-2">
                      <button
                        id={`snooze-task-${task.id}`}
                        onClick={() => triggerSnoozeModal(task)}
                        className="px-3 py-1.5 border border-dark-brown/15 hover:border-accent-terracotta hover:bg-rose-50 rounded-lg text-xs font-bold text-light-brown hover:text-accent-terracotta transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Hourglass className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Reschedule / Snooze</span>
                        <span className="sm:hidden">Snooze</span>
                      </button>

                      <button
                        id={`delete-task-${task.id}`}
                        onClick={() => onDeleteTask(task.id)}
                        className="p-1.5 text-stone-300 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete Task"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SNOOZE/RESCHEDULE WARNING MODAL */}
      <AnimatePresence>
        {snoozeModalTask && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setSnoozeModalTask(null)}
              className="absolute inset-0 bg-dark-brown/40"
            />

            {/* Content box */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-cream border-4 border-accent-terracotta w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl relative z-10"
            >
              {/* Notebook binding top effect */}
              <div className="bg-accent-terracotta text-white px-6 py-4 flex justify-between items-center">
                <span className="font-display font-bold text-sm tracking-wide">AUNTIE WARNING POPUP</span>
                <button onClick={() => setSnoozeModalTask(null)} className="text-white hover:text-stone-200">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-start text-center sm:text-left">
                  <MascotCup size={90} className="flex-shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <h4 className="font-display font-bold text-dark-brown text-base">You are snoozing: "{snoozeModalTask.title}"</h4>
                    <p className="text-sm font-sans font-medium italic text-accent-terracotta leading-relaxed">
                      "{snoozeRoast}"
                    </p>
                  </div>
                </div>

                <div className="border-t border-dark-brown/10 pt-4 space-y-3">
                  <p className="text-xs font-mono font-bold text-light-brown">HOW MANY DAYS TO SNOOZE, SWEETHEART?</p>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      id="snooze-1-day"
                      onClick={() => handleConfirmSnooze(1)}
                      className="p-3 bg-white hover:bg-amber-50 border border-dark-brown/15 hover:border-accent-mustard text-xs font-bold font-display rounded-xl text-dark-brown transition-all cursor-pointer text-center"
                    >
                      <span>Snooze 1 Day</span>
                      <span className="block text-[9px] font-mono text-stone-400 font-normal mt-0.5">"Just temporary excuse"</span>
                    </button>

                    <button
                      id="snooze-3-days"
                      onClick={() => handleConfirmSnooze(3)}
                      className="p-3 bg-white hover:bg-amber-50 border border-dark-brown/15 hover:border-accent-mustard text-xs font-bold font-display rounded-xl text-dark-brown transition-all cursor-pointer text-center"
                    >
                      <span>Snooze 3 Days</span>
                      <span className="block text-[9px] font-mono text-stone-400 font-normal mt-0.5">"Laziness multiplying"</span>
                    </button>

                    <button
                      id="snooze-7-days"
                      onClick={() => handleConfirmSnooze(7)}
                      className="p-3 bg-white hover:bg-amber-50 border border-dark-brown/15 hover:border-accent-mustard text-xs font-bold font-display rounded-xl text-dark-brown transition-all cursor-pointer text-center"
                    >
                      <span>Snooze 1 Week</span>
                      <span className="block text-[9px] font-mono text-stone-400 font-normal mt-0.5">"Successful cousin disowns you"</span>
                    </button>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <button
                    onClick={() => setSnoozeModalTask(null)}
                    className="px-5 py-3.5 bg-accent-green hover:bg-accent-green/90 text-white font-display font-bold text-xs rounded-2xl transition-all cursor-pointer"
                  >
                    No, I will do it now!
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
