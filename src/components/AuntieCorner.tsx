import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Coffee, Flame, Heart } from 'lucide-react';
import { SpiceLevel } from '../types';
import MascotCup from './MascotCup';

interface AuntieCornerProps {
  todoCount: number;
  completedCount: number;
  urgentCount: number;
  streak: number;
  spiceLevel: SpiceLevel;
  onSpiceLevelChange: (level: SpiceLevel) => void;
}

export default function AuntieCorner({ todoCount, completedCount, urgentCount, streak, spiceLevel, onSpiceLevelChange }: AuntieCornerProps) {
  const [mood, setMood] = useState<'pleased' | 'neutral' | 'scolding' | 'warm'>('neutral');
  const [advice, setAdvice] = useState<string>('');
  const [teaState, setTeaState] = useState<'none' | 'brewing' | 'ready'>('none');
  const [isScoldingActive, setIsScoldingActive] = useState(false);

  // Set initial advice based on stats and spice level
  useEffect(() => {
    updateAuntieAdvice();
  }, [todoCount, completedCount, urgentCount, streak, spiceLevel]);

  const updateAuntieAdvice = async () => {
    try {
      const response = await fetch('/api/auntie-advice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ todoCount, completedCount, urgentCount, streak, spiceLevel })
      });
      if (response.ok) {
        const result = await response.json();
        if (result.advice && result.mood) {
          setAdvice(result.advice);
          setMood(result.mood);
          return;
        }
      }
    } catch (e) {
      console.error("Failed to fetch auntie-advice from backend, using local fallback:", e);
    }

    if (todoCount === 0 && completedCount > 0) {
      setMood('pleased');
      if (spiceLevel === 'mild') {
        setAdvice("Amazing! No pending tasks! I'm so incredibly proud of you, sweetheart. You deserve a wonderful, relaxing break! 🌸");
      } else if (spiceLevel === 'medium') {
        setAdvice("Amazing! No pending tasks! Even the neighbors are talking about your incredible work ethic. You made me so proud, sweetheart!");
      } else {
        setAdvice("Oho, look at you! Zero active tasks. Did you actually complete them, or did you just delete them to make me shut up? Either way, I'm shock-impressed! 🌶️");
      }
    } else if (urgentCount > 1) {
      setMood('scolding');
      if (spiceLevel === 'mild') {
        setAdvice(`Oh dear, you have ${urgentCount} urgent tasks pending. Let's take it one step at a time, darling. You can do this!`);
      } else if (spiceLevel === 'medium') {
        setAdvice(`Oh dear! ${urgentCount} urgent tasks are screaming at you! You are playing with fire, darling. Close social media and get to work!`);
      } else {
        setAdvice(`EMERGENCY RED ALERT! ${urgentCount} urgent deadlines are breathing down your neck, and you have the relaxed confidence of a millionaire on a beach. CLOSE TikTok before I call your mother! 🌶️🌶️🌶️`);
      }
    } else if (streak >= 3) {
      setMood('warm');
      if (spiceLevel === 'mild') {
        setAdvice(`A beautiful ${streak}-day streak! Look at you shine, darling! I'm sending you all my love and warm thoughts to keep you going.`);
      } else if (spiceLevel === 'medium') {
        setAdvice(`A ${streak}-day streak! Look at you go. I am sending you a virtual lucky charm so nothing ruins your stellar focus.`);
      } else {
        setAdvice(`${streak} days in a row? Are you sick, or did you accidentally lock yourself in a room with no Wi-Fi? Whatever it is, do NOT stop now! 🔥`);
      }
    } else {
      setMood('neutral');
      if (spiceLevel === 'mild') {
        setAdvice("Hello darling! Remember: you are capable, smart, and fully supported. Just do a tiny bit of work today!");
      } else if (spiceLevel === 'medium') {
        setAdvice("Darling, scrolling is cheap, but focus is priceless. Drink a glass of water and get your goals done!");
      } else {
        setAdvice("You have 10 deadlines and the confidence of someone who thinks miracles are on-demand. Close that browser tab right now! 🌶️🌶️");
      }
    }
  };

  const getBlessing = () => {
    setMood('warm');
    let blessings: string[] = [];
    if (spiceLevel === 'mild') {
      blessings = [
        "Live long and shine, sweetheart! May today bring you effortless progress, deep satisfaction, and a cozy evening.",
        "God bless you! May your code compile instantly, and may you get nothing but friendly, supportive feedback today. 💕",
        "Stay happy, darling! I put a tiny drop of cardamom oil in your thoughts today so you feel calm and clear.",
        "My sweetheart, I am wishing you a beautiful day. Do what you can, and do it with a happy, light heart."
      ];
    } else if (spiceLevel === 'medium') {
      blessings = [
        "Live long and conquer, sweetheart! May you get a high-paying remote role with unlimited flexibility and perfect sleep.",
        "God bless you! May your code compile on the first try and your manager go on a 2-week vacation.",
        "Stay happy, darling! Today you will find a crisp $20 bill in an old pair of jeans. Now go finish your tasks!",
        "Acha, my blessings are always with you. But remember: prayer without action is like driving a car with no fuel!"
      ];
    } else {
      blessings = [
        "Fine, here is a blessing: may your ego recover after you finally finish at least ONE single task. Now work!",
        "May your Wi-Fi be fast, your coffee be extremely hot, and your excuses be utterly obliterated by the cold, hard reality of your life.",
        "May you find the same high-level motivation to work that you find at 2 AM when you're reorganizing your bookshelf.",
        "Oho, blessings on-demand? I will pray that you get the strength of an elite cousin who finished their Stanford degree while typing with one hand."
      ];
    }
    const randomBlessing = blessings[Math.floor(Math.random() * blessings.length)];
    setAdvice(randomBlessing);
  };

  const getRoast = () => {
    setMood('scolding');
    setIsScoldingActive(true);
    let roasts: string[] = [];
    if (spiceLevel === 'mild') {
      roasts = [
        "Sweetheart, you've been looking a little tired. Let's finish just one small thing and then take a sweet rest.",
        "Oh, darling, that pile of laundry is getting a bit tall. Just put away five shirts! It will take two minutes.",
        "Are we getting a little distracted by our shiny glass screen, honey? Let's put it face-down for ten minutes and focus.",
        "Sweet child, procrastination is only your fear speaking. Breathe in, breathe out, and open that textbook."
      ];
    } else if (spiceLevel === 'medium') {
      roasts = [
        "Sweetheart, you have been staring at this screen so long that the pixels are starting to feel awkward.",
        "If ignoring responsibilities was an Olympic sport, you would be sponsored by major brands by now.",
        "Your successful cousin woke up at 5 AM, completed three projects, ran a marathon, and still had time to volunteer. And you are here asking me to scold you?",
        "Your ancestors crossed oceans with pure grit and determination, and you cannot even cross the room to organize your desk?",
        "Darling, your task list has more 'someday' tags than an airport has suitcases. Get to work!"
      ];
    } else {
      roasts = [
        "Your high-achieving cousin already launched a profitable green-tech startup during their 15-minute lunch break, and you are here pressing a button to get roasted? GET TO WORK!",
        "You are treating your to-do list like a set of terms and conditions — just scrolling straight to the bottom and clicking 'Accept' without reading or doing any of it!",
        "Sweetheart, you are running a 5-star resort for excuses. Shut down the hotel, fire the staff, and open your textbooks!",
        "That chair is not a wardrobe! If you don't clean that mountain of clothes, it will stand up, declare itself an independent state, and demand rent from you!",
        "Stop romanticizing your chaotic laziness, darling. Discipline is hot. Scrolling TikTok at 3 AM looking at 'how to focus' videos is not. 😎",
        "Your laptop is screaming in agony under the weight of 47 open Chrome tabs. Close the 12 tabs of clothes you won't buy, and write that code!"
      ];
    }
    const randomRoast = roasts[Math.floor(Math.random() * roasts.length)];
    setAdvice(randomRoast);
    setTimeout(() => setIsScoldingActive(false), 3000);
  };

  const serveTea = () => {
    setTeaState('brewing');
    setMood('neutral');
    if (spiceLevel === 'mild') {
      setAdvice("Auntie is brewing a sweet, soothing chamomile tea with a drop of organic honey... Please wait...");
    } else if (spiceLevel === 'medium') {
      setAdvice("Auntie is brewing fresh cardamom and ginger herbal tea... Please wait...");
    } else {
      setAdvice("Auntie is boiling hyper-caffeinated extra ginger tea with black pepper to wake up your lazy brain... Stand back, it's hot!");
    }
    
    setTimeout(() => {
      setTeaState('ready');
      setMood('pleased');
      if (spiceLevel === 'mild') {
        setAdvice("Oho! Your honey chamomile tea is ready! ☕ Sweet, soothing, and absolutely caffeine-free. Take a sip, darling, and let's work gently.");
      } else if (spiceLevel === 'medium') {
        setAdvice("Oho! The tea is ready! ☕ Fragrant, warm, and comforting! Take a sip, sweetheart, thank me, and let's crush those goals!");
      } else {
        setAdvice("BOOM! The fiery ginger tea is served! 🌶️☕ Hot enough to melt your procrastination. Drink it, burn away your laziness, and write 50 lines of code!");
      }
    }, 2000);
  };

  // Determine avatar text symbol and background color based on mood
  const getMoodConfig = () => {
    switch (mood) {
      case 'pleased':
        return { text: 'Pleased Auntie', bg: 'bg-accent-green/15 border-accent-green/30 text-accent-green font-bold' };
      case 'scolding':
        return { text: spiceLevel === 'hot' ? '🌶️ RED CHILLY SAVAGE' : 'Savage Auntie', bg: 'bg-accent-terracotta/15 border-accent-terracotta/30 text-accent-terracotta font-bold animate-pulse' };
      case 'warm':
        return { text: 'Loving Auntie', bg: 'bg-accent-mustard/20 border-accent-mustard/40 text-[#4A380D] font-bold' };
      case 'neutral':
      default:
        return { text: 'Auntie Seema', bg: 'bg-warm-beige/80 border-accent-border text-dark-brown font-bold' };
    }
  };

  const moodConfig = getMoodConfig();

  return (
    <div id="auntie-corner-container" className="bg-warm-beige rounded-3xl p-5 sm:p-6 border-2 border-dark-brown/15 shadow-sm relative overflow-hidden">
      {/* Decorative notebook binding effect or border circles */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-accent-terracotta via-accent-mustard to-accent-purple" />
      
      <div className="flex flex-col md:flex-row items-center gap-6 relative z-10 w-full">
        {/* Avatar Frame with MascotCup */}
        <motion.div 
          animate={isScoldingActive ? { rotate: [0, -3, 3, -3, 3, 0] } : {}}
          transition={{ duration: 0.5 }}
          className="relative flex-shrink-0"
        >
          <div className="w-24 h-24 rounded-full border-4 border-accent-purple bg-cream shadow-inner flex items-center justify-center overflow-hidden relative group">
            <MascotCup size={95} className="mt-2.5" />
          </div>
        </motion.div>

        {/* Conversation Bubble */}
        <div className="flex-1 w-full text-center md:text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <h3 className="font-display font-bold text-lg text-dark-brown">Auntie's Corner</h3>
              {streak > 0 && (
                <div className="flex items-center gap-1 text-xs bg-accent-mustard/20 text-accent-terracotta px-2.5 py-0.5 rounded-full font-mono font-bold">
                  <Flame className="w-3 h-3 fill-accent-terracotta" />
                  <span>{streak}d STREAK</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-cream/80 backdrop-blur-xs rounded-2xl p-4 border border-dark-brown/5 relative min-h-[4.5rem] flex items-center shadow-xs">
            {/* Speach bubble pointer */}
            <div className="hidden md:block absolute left-[-8px] top-8 w-4 h-4 bg-cream/80 border-l border-b border-dark-brown/5 rotate-45" />
            
            <AnimatePresence mode="wait">
              <motion.p 
                key={advice}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.2 }}
                className="text-sm font-sans text-dark-brown italic font-medium leading-relaxed w-full"
              >
                "{advice}"
              </motion.p>
            </AnimatePresence>
          </div>
        </div>

        {/* Action Controls */}
        <div className="grid grid-cols-3 md:flex md:flex-col gap-2 w-full md:w-auto">
          <button 
            id="auntie-button-bless"
            onClick={getBlessing}
            className="flex items-center justify-center gap-1.5 px-2 sm:px-4 py-2.5 rounded-xl text-[11px] sm:text-xs font-bold bg-rose-100 hover:bg-rose-200 text-rose-800 transition-colors border border-rose-300/30 cursor-pointer"
          >
            <Heart className="w-3.5 h-3.5 fill-rose-600 text-rose-600 hidden sm:inline" />
            <span>Blessings</span>
          </button>
          
          <button 
            id="auntie-button-roast"
            onClick={getRoast}
            className="flex items-center justify-center gap-1.5 px-2 sm:px-4 py-2.5 rounded-xl text-[11px] sm:text-xs font-bold bg-amber-100 hover:bg-amber-200 text-amber-800 transition-colors border border-amber-300/30 cursor-pointer"
          >
            <Flame className="w-3.5 h-3.5 text-amber-600 hidden sm:inline" />
            <span>Scold Me</span>
          </button>
          
          <button 
            id="auntie-button-chai"
            onClick={serveTea}
            disabled={teaState === 'brewing'}
            className="flex items-center justify-center gap-1.5 px-2 sm:px-4 py-2.5 rounded-xl text-[11px] sm:text-xs font-bold bg-stone-100 hover:bg-stone-200 text-stone-800 disabled:opacity-50 transition-colors border border-stone-300/30 cursor-pointer"
          >
            <Coffee className="w-3.5 h-3.5 text-stone-600 hidden sm:inline" />
            <span>{teaState === 'brewing' ? 'Brewing...' : 'Offer Tea'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
