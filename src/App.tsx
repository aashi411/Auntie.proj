import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, ClipboardList, MessageSquare, Calendar, 
  ArrowRight, ArrowDown, RefreshCw, TrendingUp, X
} from 'lucide-react';

import { Task, DateReminder, ChatMessage } from './types';
import { useAuntie } from './context/AuntieContext';

// Custom sub-components
import AuntieCorner from './components/AuntieCorner';
import Dashboard from './components/Dashboard';
import BrainDump from './components/BrainDump';
import ChatVent from './components/ChatVent';
import DateReminders from './components/DateReminders';
import MascotCup from './components/MascotCup';
import ProductivityDashboard from './components/ProductivityDashboard';

export default function App() {
  const {
    currentPage,
    setCurrentPage,
    tasks,
    reminders,
    streak,
    longestStreak,
    chatMessages,
    spiceLevel,
    toggleTask: handleToggleTask,
    addTask: handleAddTask,
    addTasksFromDump: handleAddTasksFromDump,
    rescheduleTask: handleRescheduleTask,
    deleteTask: handleDeleteTask,
    addReminder: handleAddReminder,
    deleteReminder: handleDeleteReminder,
    setSpiceLevel: handleSetSpiceLevel,
    sendMessage,
    clearChat: handleClearChat,
    resetAllData
  } = useAuntie();

  const [showResetModal, setShowResetModal] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  useEffect(() => {
    if (showSuccessToast) {
      const timer = setTimeout(() => setShowSuccessToast(false), 6000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessToast]);

  const handleResetClick = () => {
    setShowResetModal(true);
  };

  const confirmReset = () => {
    resetAllData();
    setShowResetModal(false);
    setShowSuccessToast(true);
  };

  // Adapt the prop to the component which accepts high-level message objects
  const handleSendMessage = (msg: ChatMessage) => {
    sendMessage(msg.text, msg.activityType);
  };

  const getFormattedDate = () => {
    const date = new Date();
    const weekday = date.toLocaleDateString('en-US', { weekday: 'long' });
    const month = date.toLocaleDateString('en-US', { month: 'long' });
    const day = date.getDate();
    
    let suffix = 'th';
    if (day === 1 || day === 21 || day === 31) suffix = 'st';
    else if (day === 2 || day === 22) suffix = 'nd';
    else if (day === 3 || day === 23) suffix = 'rd';
    
    return `Today is ${weekday}, ${month} ${day}${suffix}`;
  };

  const todoCount = tasks.filter(t => t.status === 'todo').length;
  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const urgentCount = tasks.filter(t => t.status === 'todo' && t.priority === 'high').length;

  return (
    <div className="min-h-screen bg-cream selection:bg-accent-terracotta/20 flex flex-col justify-between">
      {/* LANDING PAGE VIEW */}
      {currentPage === 'landing' ? (
        <div id="landing-page-wrapper" className="flex-1 flex flex-col justify-center items-center px-6 py-12 relative overflow-hidden">
          {/* Background decoration elements */}
          <div className="absolute top-10 left-10 w-32 h-32 rounded-full border-4 border-accent-purple/5 select-none pointer-events-none" />
          <div className="absolute bottom-12 right-12 w-48 h-48 rounded-full border-dashed border-2 border-accent-mustard/15 select-none pointer-events-none" />

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl text-center space-y-6 flex flex-col items-center"
          >
            {/* Mascot Icon */}
            <MascotCup size={200} badge={true} className="mb-2" />

            <div className="space-y-3">
              <h1 className="font-serif italic font-semibold text-5xl md:text-7xl text-dark-brown tracking-tight leading-none">
                Auntie<span className="text-accent-terracotta font-sans font-bold not-italic">.ai</span>
              </h1>
              <p className="font-mono text-xs uppercase tracking-widest text-accent-purple font-bold">
                ROAST. PLAN. SLAY.
              </p>
              <p className="font-display font-medium text-lg md:text-xl text-light-brown max-w-2xl mx-auto px-4">
                An AI productivity companion with the personality of a cool, sassy, and deeply motivating global Auntie.
              </p>
            </div>

            {/* Notebook lines with global cool auntie rules */}
            <div className="bg-white rounded-3xl p-6 md:p-8 border-2 border-dark-brown/15 shadow-md relative text-left max-w-xl w-full mx-auto">
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-purple-200" />
              
              <div className="pl-6 space-y-4 font-sans text-dark-brown">
                <h4 className="font-display font-bold text-lg text-accent-terracotta">Auntie's Rules of Discipline:</h4>
                <ul className="space-y-4 text-sm font-medium leading-relaxed">
                  <li className="flex gap-2.5 items-start">
                    <span className="text-lg">😎</span>
                    <span><strong>The Overachieving Cousin:</strong> Our standard of excellence. They finished their master's degree and launched a green-tech startup during lunch today.</span>
                  </li>
                  <li className="flex gap-2.5 items-start">
                    <span className="text-lg">🔥</span>
                    <span><strong>Red Chilly Roasts:</strong> Sassy, constructive callouts to save you from endless doom-scrolling. Sarcastic but deeply caring.</span>
                  </li>
                  <li className="flex gap-2.5 items-start">
                    <span className="text-lg">☕</span>
                    <span><strong>Discipline is Hot:</strong> Reminding you to sit down, close your distractors, and get your goals organized.</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full max-w-md px-4 pt-4">
              <button
                id="cta-enter-livingroom"
                onClick={() => setCurrentPage('dashboard')}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-accent-purple hover:bg-accent-purple/90 text-white font-display font-bold text-base px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all active:scale-98 cursor-pointer"
              >
                <span>Enter Auntie's Lounge</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                id="cta-braindump"
                onClick={() => {
                  setCurrentPage('braindump');
                }}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white hover:bg-stone-50 border-2 border-dark-brown/15 text-dark-brown font-display font-bold text-base px-8 py-4 rounded-2xl transition-all cursor-pointer"
              >
                <span>Chaotic Brain Dump First</span>
              </button>
            </div>
          </motion.div>

          {/* HOW IT WORKS SECTION */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="w-full max-w-3xl mt-16 pt-12 border-t border-dark-brown/10 space-y-8 relative z-10"
          >
            <div className="text-center space-y-2">
              <h2 className="font-serif italic font-semibold text-3xl md:text-4xl text-dark-brown tracking-tight">
                How Auntie Works
              </h2>
              <p className="text-sm font-mono text-accent-terracotta uppercase tracking-wider font-bold">
                From chaos to clarity in three simple steps.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 w-full relative">
              {/* Card 1 - Brain Dump */}
              <div className="bg-white border border-dark-brown/10 hover:border-accent-purple/30 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col md:flex-row gap-5 items-start relative group">
                <div className="w-12 h-12 rounded-xl bg-accent-purple/10 flex items-center justify-center text-2xl text-accent-purple font-display font-bold group-hover:scale-110 transition-transform duration-300 shrink-0">
                  🧠
                </div>
                <div className="space-y-1.5 flex-1 text-left">
                  <span className="text-[10px] font-mono text-accent-purple font-bold tracking-wider uppercase block">Step 1 — Brain Dump</span>
                  <h3 className="font-display font-bold text-dark-brown text-base">Dump Everything</h3>
                  <p className="text-xs text-light-brown font-medium leading-relaxed">
                    Write everything on your mind—assignments, deadlines, birthdays, interviews, bills, or even random thoughts. Auntie intelligently extracts tasks, priorities, and important dates.
                  </p>
                </div>
              </div>

              {/* Arrow 1 */}
              <div className="flex items-center justify-center text-stone-300">
                <ArrowDown className="w-5 h-5 animate-pulse" />
              </div>

              {/* Card 2 - Vent Lounge */}
              <div className="bg-white border border-dark-brown/10 hover:border-accent-terracotta/30 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col md:flex-row gap-5 items-start relative group">
                <div className="w-12 h-12 rounded-xl bg-accent-terracotta/10 flex items-center justify-center text-2xl text-accent-terracotta font-display font-bold group-hover:scale-110 transition-transform duration-300 shrink-0">
                  💬
                </div>
                <div className="space-y-1.5 flex-1 text-left">
                  <span className="text-[10px] font-mono text-accent-terracotta font-bold tracking-wider uppercase block">Step 2 — Vent Lounge</span>
                  <h3 className="font-display font-bold text-dark-brown text-base">Vent Without Filters</h3>
                  <p className="text-xs text-light-brown font-medium leading-relaxed">
                    Feeling overwhelmed? Frustrated? Or just making excuses? Talk to Auntie. She listens, gives you a reality check with her signature sass, and helps you move forward with practical advice.
                  </p>
                </div>
              </div>

              {/* Arrow 2 */}
              <div className="flex items-center justify-center text-stone-300">
                <ArrowDown className="w-5 h-5 animate-pulse" />
              </div>

              {/* Card 3 - Smart Plan */}
              <div className="bg-white border border-dark-brown/10 hover:border-accent-green/30 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col md:flex-row gap-5 items-start relative group">
                <div className="w-12 h-12 rounded-xl bg-accent-green/10 flex items-center justify-center text-2xl text-accent-green font-display font-bold group-hover:scale-110 transition-transform duration-300 shrink-0">
                  📅
                </div>
                <div className="space-y-1.5 flex-1 text-left">
                  <span className="text-[10px] font-mono text-accent-green font-bold tracking-wider uppercase block">Step 3 — Smart Plan</span>
                  <h3 className="font-display font-bold text-dark-brown text-base">Get Your Battle Plan</h3>
                  <p className="text-xs text-light-brown font-medium leading-relaxed">
                    Auntie automatically prioritizes tasks, creates your daily schedule, predicts deadline risks, and keeps important events from slipping through the cracks.
                  </p>
                </div>
              </div>
            </div>

            {/* CTA Button below vertical cards */}
            <div className="flex justify-center pt-4">
              <button
                id="cta-how-it-works-start"
                onClick={() => setCurrentPage('dashboard')}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-accent-purple hover:bg-accent-purple/90 text-white font-display font-bold text-base px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all active:scale-98 cursor-pointer"
              >
                <span>Get Started with Auntie</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        </div>
      ) : (
        /* CORE APPLICATION VIEWS */
        <div id="core-app-wrapper" className="flex-1 flex flex-col">
          {/* Header & Main App Nav */}
          <header className="border-b-2 border-dark-brown/10 bg-white/70 backdrop-blur-md sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
              {/* Logo / Brand */}
              <button 
                onClick={() => setCurrentPage('landing')}
                className="flex items-center gap-2 group cursor-pointer text-left"
              >
                <div className="group-hover:scale-105 transition-transform">
                  <MascotCup size={36} />
                </div>
                <div>
                  <h1 className="font-serif italic font-bold text-xl text-dark-brown tracking-tight">
                    Auntie<span className="text-accent-terracotta font-sans font-bold not-italic">.ai</span>
                  </h1>
                  <span className="text-[9px] font-mono text-stone-400 block tracking-wider uppercase font-bold">Your Savage Companion</span>
                </div>
              </button>

              {/* Navigation Tabs */}
              <nav className="flex items-center gap-1 bg-warm-beige/60 p-1 rounded-2xl border border-dark-brown/10">
                <button
                  id="nav-tab-dashboard"
                  onClick={() => setCurrentPage('dashboard')}
                  className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold font-display transition-colors cursor-pointer ${
                    currentPage === 'dashboard' ? 'bg-white text-accent-terracotta shadow-xs border border-dark-brown/5' : 'text-light-brown hover:text-dark-brown'
                  }`}
                >
                  <ClipboardList className="w-3.5 h-3.5" />
                  <span>Dashboard</span>
                </button>

                <button
                  id="nav-tab-braindump"
                  onClick={() => setCurrentPage('braindump')}
                  className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold font-display transition-colors cursor-pointer ${
                    currentPage === 'braindump' ? 'bg-white text-accent-terracotta shadow-xs border border-dark-brown/5' : 'text-light-brown hover:text-dark-brown'
                  }`}
                >
                  <Sparkles className={`w-3.5 h-3.5 ${currentPage === 'braindump' ? 'fill-accent-terracotta text-accent-terracotta' : ''}`} />
                  <span>Brain Dump</span>
                </button>

                <button
                  id="nav-tab-chat"
                  onClick={() => setCurrentPage('chat')}
                  className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold font-display transition-colors cursor-pointer ${
                    currentPage === 'chat' ? 'bg-white text-accent-terracotta shadow-xs border border-dark-brown/5' : 'text-light-brown hover:text-dark-brown'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Vent Lounge</span>
                </button>

                <button
                  id="nav-tab-reminders"
                  onClick={() => setCurrentPage('reminders')}
                  className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold font-display transition-colors cursor-pointer ${
                    currentPage === 'reminders' ? 'bg-white text-accent-terracotta shadow-xs border border-dark-brown/5' : 'text-light-brown hover:text-dark-brown'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Social Duties</span>
                </button>

                <button
                  id="nav-tab-analytics"
                  onClick={() => setCurrentPage('analytics')}
                  className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold font-display transition-colors cursor-pointer ${
                    currentPage === 'analytics' ? 'bg-white text-accent-terracotta shadow-xs border border-dark-brown/5' : 'text-light-brown hover:text-dark-brown'
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Auntie's Insights</span>
                </button>
              </nav>

              {/* Reset Control */}
              <button
                id="reset-state-btn"
                onClick={handleResetClick}
                className="flex items-center gap-1 px-3 py-1.5 border border-dark-brown/10 hover:border-rose-300 hover:bg-rose-50 text-stone-400 hover:text-rose-600 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer"
                title="Wipe Local Progress"
              >
                <RefreshCw className="w-3 h-3" />
                <span>RESET DATA</span>
              </button>
            </div>
          </header>

          {/* Main Application Shell Container */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-8">
            
            {/* Greeting Header from Artistic Flair */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-[#D9D1C7] gap-4">
              <div>
                <h2 className="text-2xl font-bold text-dark-brown font-serif italic">Hey darling!</h2>
                <p className="text-sm text-dark-brown/60 font-medium font-sans">{getFormattedDate()}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-10 px-4 bg-accent-green text-white rounded-full flex items-center text-sm font-bold shadow-xs font-mono">
                  Slay Index: {completedCount > 0 ? Math.min(100, Math.floor(60 + (completedCount / (todoCount + completedCount)) * 40)) : 42}%
                </div>
                <div className="w-10 h-10 bg-dark-brown rounded-full border-2 border-white shadow-xs flex items-center justify-center text-xl select-none">
                  😎
                </div>
              </div>
            </div>

            {/* Context aware banner/portrait widget */}
            <AuntieCorner 
              todoCount={todoCount}
              completedCount={completedCount}
              urgentCount={urgentCount}
              streak={streak}
              spiceLevel={spiceLevel}
              onSpiceLevelChange={handleSetSpiceLevel}
            />

            {/* Router transition frames */}
            <div className="relative z-10 min-h-[450px]">
              <AnimatePresence mode="wait">
                {currentPage === 'dashboard' && (
                  <motion.div
                    key="dashboard"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Dashboard 
                      tasks={tasks}
                      streak={streak}
                      longestStreak={longestStreak}
                      spiceLevel={spiceLevel}
                      onToggleTask={handleToggleTask}
                      onAddTask={handleAddTask}
                      onRescheduleTask={handleRescheduleTask}
                      onDeleteTask={handleDeleteTask}
                    />
                  </motion.div>
                )}

                {currentPage === 'braindump' && (
                  <motion.div
                    key="braindump"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.15 }}
                  >
                    <BrainDump 
                      onAddTasks={handleAddTasksFromDump}
                      onNavigateToDashboard={() => setCurrentPage('dashboard')}
                      spiceLevel={spiceLevel}
                    />
                  </motion.div>
                )}

                {currentPage === 'chat' && (
                  <motion.div
                    key="chat"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.15 }}
                  >
                    <ChatVent />
                  </motion.div>
                )}

                {currentPage === 'reminders' && (
                  <motion.div
                    key="reminders"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.15 }}
                  >
                    <DateReminders 
                      reminders={reminders}
                      onAddReminder={handleAddReminder}
                      onDeleteReminder={handleDeleteReminder}
                    />
                  </motion.div>
                )}

                {currentPage === 'analytics' && (
                  <motion.div
                    key="analytics"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.15 }}
                  >
                    <ProductivityDashboard 
                      tasks={tasks}
                      streak={streak}
                      longestStreak={longestStreak}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </main>
        </div>
      )}

      <footer className="border-t-2 border-dark-brown/10 bg-warm-beige/35 py-8 text-center text-xs text-light-brown/60 space-y-1.5 font-mono">
        <p>Made with ☕ and herbal tea. Procrastination is sweet poison!</p>
        <p>© 2026 Auntie.ai. All roasts delivered with love.</p>
      </footer>

      {/* RESET CONFIRMATION MODAL */}
      <AnimatePresence>
        {showResetModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowResetModal(false)}
              className="absolute inset-0 bg-dark-brown/40 backdrop-blur-xs"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-cream border-4 border-accent-terracotta w-full max-w-md rounded-3xl overflow-hidden shadow-2xl relative z-10"
            >
              {/* Header Binding top effect */}
              <div className="bg-accent-terracotta text-white px-6 py-4 flex justify-between items-center">
                <span className="font-display font-bold text-xs tracking-widest uppercase">AUNTIE'S REALITY CHECK</span>
                <button onClick={() => setShowResetModal(false)} className="text-white hover:text-stone-200 transition-colors cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <MascotCup size={110} className="flex-shrink-0" />
                  <div className="space-y-2">
                    <h3 className="font-serif italic font-bold text-3xl text-dark-brown">Fresh Start?</h3>
                    <p className="text-sm font-sans font-medium text-light-brown/90 leading-relaxed px-1">
                      "This will clear all your tasks, plans, conversations, streaks, reminders, analytics, and locally stored data. Auntie won't judge... everyone deserves a clean slate."
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    id="confirm-reset-btn"
                    onClick={confirmReset}
                    className="flex-1 bg-accent-terracotta hover:bg-accent-terracotta/90 text-white font-display font-bold text-sm py-3.5 px-4 rounded-xl shadow-md transition-all active:scale-98 cursor-pointer text-center"
                  >
                    Start Fresh
                  </button>
                  <button
                    id="cancel-reset-btn"
                    onClick={() => setShowResetModal(false)}
                    className="flex-1 bg-white hover:bg-stone-50 border border-dark-brown/15 text-dark-brown font-display font-bold text-sm py-3.5 px-4 rounded-xl transition-all active:scale-98 cursor-pointer text-center"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* RESET SUCCESS TOAST */}
      <AnimatePresence>
        {showSuccessToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 max-w-md w-full bg-white border-2 border-accent-green rounded-2xl shadow-xl p-4 flex gap-3 items-start overflow-hidden"
          >
            {/* Side Accent line */}
            <div className="absolute top-0 left-0 w-2 h-full bg-accent-green" />
            <div className="pl-2 space-y-1 pr-6">
              <h4 className="font-display font-bold text-dark-brown text-sm flex items-center gap-1.5">
                <span className="text-base">🫖</span> Auntie says:
              </h4>
              <p className="text-xs font-sans font-medium text-stone-600 leading-relaxed italic">
                "Clean slate. New chapter. Let's try making Future You slightly less stressed this time."
              </p>
            </div>
            <button 
              onClick={() => setShowSuccessToast(false)} 
              className="absolute top-3 right-3 text-stone-400 hover:text-stone-600 cursor-pointer flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
