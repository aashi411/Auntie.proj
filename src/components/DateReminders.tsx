import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Gift, Plus, Trash2, PartyPopper } from 'lucide-react';
import { DateReminder } from '../types';

interface DateRemindersProps {
  reminders: DateReminder[];
  onAddReminder: (reminder: DateReminder) => void;
  onDeleteReminder: (id: string) => void;
}

export default function DateReminders({ reminders, onAddReminder, onDeleteReminder }: DateRemindersProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [type, setType] = useState<'birthday' | 'anniversary' | 'important'>('birthday');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date.trim()) return;

    // Generate custom sarcastic roast based on event type
    let auntieRoast = '';
    if (type === 'birthday') {
      auntieRoast = `Write it on your forehead, sweetheart! If you forget ${title} this year, Auntie is personally telling your parents about your phone screen time.`;
    } else if (type === 'anniversary') {
      auntieRoast = `Marriage is tough work, darling! Send cards and touch feet in the morning. Don't be the lazy cousin who forgets.`;
    } else {
      auntieRoast = `Even a busy bird remembers when its seeds are served! Surely you can remember ${title} on ${date}. Focus!`;
    }

    const newRem: DateReminder = {
      id: `rem-${Date.now()}`,
      title: title.trim(),
      date,
      type,
      auntieRoast
    };

    onAddReminder(newRem);
    setTitle('');
    setDate('');
    setType('birthday');
    setShowAddForm(false);
  };

  return (
    <div id="reminders-section" className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-3xl text-dark-brown">Reminders & Duties</h2>
          <p className="text-sm text-light-brown font-sans mt-1">
            Family birthdays and social duties. Forget these and Auntie will make sure you hear about it for a generation.
          </p>
        </div>
        
        <button
          id="toggle-add-reminder-btn"
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-accent-terracotta hover:bg-accent-terracotta/90 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{showAddForm ? 'Close Form' : 'Add Duty'}</span>
        </button>
      </div>

      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleSubmit} className="bg-warm-beige/50 border-2 border-dark-brown/10 p-5 rounded-3xl space-y-4">
              <h4 className="font-display font-bold text-dark-brown text-sm">Add Social Duty or Date</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold text-light-brown">WHAT IS THE EVENT?</label>
                  <input
                    id="reminder-title-input"
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Mother's 50th Birthday, Cousin Sophie's Wedding"
                    className="w-full bg-white border border-dark-brown/15 rounded-xl px-3 py-2 text-sm focus:outline-hidden focus:border-accent-terracotta"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold text-light-brown">WHEN IS IT? (E.G., JUNE 29)</label>
                  <input
                    id="reminder-date-input"
                    type="text"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    placeholder="June 29, July 05"
                    className="w-full bg-white border border-dark-brown/15 rounded-xl px-3 py-2 text-sm focus:outline-hidden focus:border-accent-terracotta"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold text-light-brown">EVENT CATEGORY</label>
                  <select
                    id="reminder-type-select"
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full bg-white border border-dark-brown/15 rounded-xl px-3 py-2 text-sm focus:outline-hidden focus:border-accent-terracotta"
                  >
                    <option value="birthday">Birthday 🎂</option>
                    <option value="anniversary">Anniversary 💍</option>
                    <option value="important">Important Duty 🚨</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 border border-dark-brown/10 rounded-xl text-xs font-bold text-light-brown hover:bg-white"
                >
                  Cancel
                </button>
                <button
                  id="submit-reminder-btn"
                  type="submit"
                  className="px-5 py-2 bg-accent-green hover:bg-accent-green/90 text-white rounded-xl text-xs font-bold transition-colors"
                >
                  Save Duty to Auntie
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reminders.map((rem, idx) => (
          <div
            key={rem.id}
            style={{ transform: `rotate(${idx % 2 === 0 ? -1 : 1.5}deg)` }}
            className="bg-accent-mustard p-6 rounded-sm shadow-[4px_4px_0px_#8B6811] flex flex-col justify-between hover:scale-[1.02] transition-transform text-[#4A380D]"
          >
            {/* Stamp-like date ribbon */}
            <div className="flex items-center justify-between mb-4 border-b border-[#4A380D]/20 pb-2">
              <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-[#4A380D]/10 text-[#4A380D]">
                {rem.type}
              </span>
              
              <div className="flex items-center gap-1.5 font-display font-bold text-dark-brown text-sm">
                <Calendar className="w-4 h-4 text-dark-brown" />
                <span>{rem.date}</span>
              </div>
            </div>

            <div className="space-y-3 flex-1 flex flex-col justify-between">
              <div>
                <h4 className="font-display font-bold text-[#3C2F2F] text-base flex items-center gap-1.5">
                  {rem.type === 'birthday' ? <Gift className="w-4 h-4 text-red-700" /> : <PartyPopper className="w-4 h-4 text-emerald-800" />}
                  <span>{rem.title}</span>
                </h4>
                
                {/* Sarcastic Auntie warning roast */}
                <p className="text-xs font-serif italic text-[#3C2F2F]/85 leading-relaxed font-semibold mt-3">
                  "{rem.auntieRoast}"
                </p>
              </div>

              <div className="flex justify-end pt-3 border-t border-[#4A380D]/20">
                <button
                  id={`delete-reminder-${rem.id}`}
                  onClick={() => onDeleteReminder(rem.id)}
                  className="flex items-center gap-1 text-[#3C2F2F] hover:text-[#C24D2C] text-[10px] font-mono font-bold transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>DISCHARGE DUTY</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
