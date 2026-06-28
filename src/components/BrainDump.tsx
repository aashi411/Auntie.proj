import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Save, RotateCcw, Clipboard } from 'lucide-react';
import { Task, BrainDumpAnalysisResult, SpiceLevel } from '../types';
import MascotCup from './MascotCup';

interface BrainDumpProps {
  onAddTasks: (tasks: Task[]) => void;
  onNavigateToDashboard: () => void;
  spiceLevel: SpiceLevel;
}

const LOADING_MESSAGES = [
  "Auntie is heating up the water for herbal infusion...",
  "Auntie is polishing her designer glasses...",
  "Auntie is shaking her head at this chaotic pile of thoughts...",
  "Auntie is checking your successful cousin's achievements for comparison...",
  "Auntie is rolling up her sleeves and preparing a reality check...",
  "Auntie is checking if you stayed hydrated today..."
];

export default function BrainDump({ onAddTasks, onNavigateToDashboard, spiceLevel }: BrainDumpProps) {
  const [dumpText, setDumpText] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const [analysis, setAnalysis] = useState<BrainDumpAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Rotate loading messages
  useEffect(() => {
    let interval: any;
    if (loading) {
      interval = setInterval(() => {
        setLoadingMsgIdx((prev) => (prev + 1) % LOADING_MESSAGES.length);
      }, 2500);
    } else {
      setLoadingMsgIdx(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleAnalyze = async () => {
    if (!dumpText.trim()) return;
    setLoading(true);
    setAnalysis(null);
    setError(null);

    try {
      const response = await fetch('/api/analyze-dump', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ dumpText, spiceLevel }),
      });

      if (!response.ok) {
        throw new Error('Auntie is busy with her neighbors right now');
      }

      const result = await response.json();
      setAnalysis(result);
    } catch (err) {
      console.error('Brain dump analysis error:', err);
      setError("Auntie's network is behaving like a lazy snail. Try again, sweetheart!");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToDashboard = () => {
    if (!analysis) return;

    // Convert extracted tasks to complete tasks with unique IDs and statuses
    const newTasks: Task[] = analysis.tasks.map((t, idx) => ({
      ...t,
      id: `task-extracted-${Date.now()}-${idx}`,
      status: 'todo',
      dueDate: new Date().toISOString().split('T')[0] // Default to today
    }));

    onAddTasks(newTasks);
    // Reset dump
    setDumpText('');
    setAnalysis(null);
    onNavigateToDashboard();
  };

  const loadExample = () => {
    setDumpText(
      "i need to study SQL for my software test on Monday but my room is super messy and there is a heap of clothes on the laundry chair. also i forgot to call my mother yesterday and she is going to scold me. and maybe i want to buy some chips and watch that new anime but i know i should water the kitchen plants too before they die."
    );
  };

  return (
    <div id="braindump-section" className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-bold text-3xl text-dark-brown">Brain Dump</h2>
          <p className="text-sm text-light-brown font-sans mt-1">
            Write down your chaotic, messy, unorganized thoughts. Auntie will pull out the real tasks, prioritize them, and scold you appropriately.
          </p>
        </div>
        {!analysis && !loading && (
          <button
            onClick={loadExample}
            className="self-start md:self-auto flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-accent-mustard/15 text-accent-terracotta border border-accent-mustard/35 hover:bg-accent-mustard/25 transition-colors cursor-pointer"
          >
            <Clipboard className="w-3.5 h-3.5" />
            <span>Load Messy Example</span>
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {/* Loading State */}
        {loading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-warm-beige rounded-3xl p-12 border-2 border-dark-brown/10 text-center flex flex-col items-center justify-center space-y-6"
          >
            {/* Pulsing Chai Mug icon */}
            <div className="relative">
              <span className="text-6xl animate-bounce inline-block">☕</span>
              <span className="absolute -top-1 -right-1 text-2xl animate-ping inline-block">✨</span>
            </div>
            
            <div className="space-y-2 max-w-md">
              <h3 className="font-display font-bold text-xl text-dark-brown">Hold your horses, sweetheart...</h3>
              <p className="text-sm font-sans font-medium text-light-brown italic animate-pulse">
                "{LOADING_MESSAGES[loadingMsgIdx]}"
              </p>
            </div>
            
            <div className="w-48 h-2 bg-cream rounded-full overflow-hidden border border-dark-brown/10">
              <motion.div 
                className="h-full bg-accent-terracotta"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              />
            </div>
          </motion.div>
        )}

        {/* Input State */}
        {!loading && !analysis && (
          <motion.div
            key="input"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="bg-white rounded-3xl border-2 border-dark-brown/15 shadow-sm overflow-hidden"
          >
            {/* Notepad header */}
            <div className="bg-warm-beige/60 px-6 py-4 border-b border-dark-brown/10 flex items-center justify-between">
              <span className="font-mono text-xs font-semibold text-light-brown uppercase tracking-wider">
                Uncensored Mental Clutter Notesheet
              </span>
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-300" />
                <span className="w-3 h-3 rounded-full bg-amber-300" />
                <span className="w-3 h-3 rounded-full bg-emerald-300" />
              </div>
            </div>

            {error && (
              <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-sans font-medium flex items-center justify-between">
                <span>{error}</span>
                <button onClick={() => setError(null)} className="text-rose-500 hover:text-rose-700 font-bold px-2 cursor-pointer text-sm">×</button>
              </div>
            )}

            <div className="p-6 relative">
              {/* Vertical red line simulating legal pad paper */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-rose-200" />

              <textarea
                id="brain-dump-textarea"
                rows={8}
                value={dumpText}
                onChange={(e) => setDumpText(e.target.value)}
                placeholder="i need to finished studying sql... clean up room... forgot to buy groceries and i have to call mom also..."
                className="w-full pl-8 pr-2 py-1 bg-transparent border-none text-dark-brown placeholder-stone-400 font-sans leading-relaxed focus:outline-hidden text-base resize-none notebook-lines"
              />
            </div>

            <div className="bg-warm-beige/30 px-6 py-4 border-t border-dark-brown/10 flex justify-between items-center">
              <span className="text-xs text-light-brown font-medium">
                {dumpText.split(/\s+/).filter(Boolean).length} words of panic
              </span>
              <button
                id="analyze-button"
                onClick={handleAnalyze}
                disabled={!dumpText.trim()}
                className="flex items-center gap-1.5 bg-accent-terracotta hover:bg-accent-terracotta/90 disabled:opacity-40 disabled:cursor-not-allowed text-white font-display font-bold px-6 py-3 rounded-2xl text-sm transition-all shadow-md active:scale-98 cursor-pointer"
              >
                <span>Auntie, Organize This!</span>
                <Sparkles className="w-4 h-4 fill-white text-white" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Analysis Results State */}
        {analysis && (
          <motion.div
            key="results"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            {/* Auntie's Feedback Card */}
            <div className="bg-amber-50 rounded-3xl p-6 border-2 border-accent-mustard/30 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 text-accent-mustard/10 translate-x-8 -translate-y-8 select-none font-serif text-9xl">
                “
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-white p-2.5 rounded-2xl shadow-xs flex-shrink-0">
                  <MascotCup size={45} />
                </div>
                <div className="space-y-2">
                  <h3 className="font-display font-bold text-lg text-dark-brown">Auntie's Verdict</h3>
                  <p className="text-sm font-sans text-dark-brown italic leading-relaxed font-medium">
                    "{analysis.overallRoast}"
                  </p>
                  <p className="text-xs text-light-brown font-mono mt-1">
                    <strong className="text-accent-terracotta font-sans">Auntie's Philosophy:</strong> {analysis.priorityOrderExplanation}
                  </p>
                </div>
              </div>
            </div>

            {/* Extracted Tasks Table */}
            <div className="bg-white rounded-3xl border-2 border-dark-brown/15 shadow-sm overflow-hidden">
              <div className="px-6 py-4 bg-warm-beige/50 border-b border-dark-brown/10 flex items-center justify-between">
                <h4 className="font-display font-bold text-dark-brown text-md">Extracted Tasks ({analysis.tasks.length})</h4>
                <span className="text-xs font-mono bg-accent-terracotta/10 text-accent-terracotta font-bold px-2.5 py-1 rounded-full">
                  PRIORITIZED BY AUNTIE
                </span>
              </div>

              <div className="divide-y divide-dark-brown/10">
                {analysis.tasks.map((task, idx) => (
                  <div key={idx} className="p-6 hover:bg-cream/40 transition-colors flex flex-col md:flex-row gap-6 items-start">
                    {/* Badge & Number */}
                    <div className="flex md:flex-col items-center gap-2 md:gap-1.5">
                      <span className="w-7 h-7 rounded-full bg-dark-brown/5 flex items-center justify-center font-mono font-bold text-xs text-dark-brown">
                        {idx + 1}
                      </span>
                      <span className={`text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded-full ${
                        task.priority === 'high' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                        task.priority === 'medium' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                        'bg-stone-100 text-stone-700 border border-stone-200'
                      }`}>
                        {task.priority}
                      </span>
                    </div>

                    {/* Task details */}
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h5 className="font-display font-bold text-dark-brown text-base">{task.title}</h5>
                        <span className={`text-xs font-mono font-semibold px-2 py-0.5 rounded-sm ${
                          task.category === 'sharma_ji' ? 'bg-amber-100 text-accent-terracotta border border-amber-300/30' :
                          task.category === 'critical' ? 'bg-rose-100 text-rose-800 border border-rose-300/30' :
                          task.category === 'hygiene' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300/30' :
                          'bg-stone-100 text-stone-700 border border-stone-300/30'
                        }`}>
                          {task.category.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-sm text-light-brown font-sans">{task.description}</p>
                      
                      {/* Sarcastic Roast */}
                      <div className="mt-3 bg-stone-50 border border-dark-brown/5 rounded-2xl p-4 flex gap-2.5 items-start">
                        <div className="flex-shrink-0 mt-0.5">
                          <MascotCup size={20} />
                        </div>
                        <p className="text-xs font-sans italic text-light-brown leading-relaxed font-medium">
                          "{task.auntieRoast}"
                        </p>
                      </div>
                    </div>

                    {/* Effort Estimate */}
                    <div className="flex-shrink-0 text-right">
                      <span className="text-xs font-mono font-bold text-light-brown block">EFFORT ESTIMATE</span>
                      <span className="text-sm font-display font-bold text-accent-terracotta">{task.effort}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-end">
              <button
                id="discard-button"
                onClick={() => setAnalysis(null)}
                className="flex items-center justify-center gap-1.5 px-6 py-3.5 rounded-2xl border-2 border-dark-brown/15 hover:bg-stone-50 text-dark-brown font-display font-bold text-sm transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Trash and Redump</span>
              </button>
              
              <button
                id="save-extracted-button"
                onClick={handleSaveToDashboard}
                className="flex items-center justify-center gap-1.5 px-8 py-3.5 rounded-2xl bg-accent-green hover:bg-accent-green/90 text-white font-display font-bold text-sm transition-colors shadow-md cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save to Dashboard, Auntie!</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
