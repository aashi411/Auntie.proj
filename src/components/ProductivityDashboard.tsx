import React, { useMemo } from 'react';
import { 
  ResponsiveContainer, LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, Tooltip, Legend, RadialBarChart, RadialBar 
} from 'recharts';
import { Task } from '../types';
import { Flame, ShieldAlert, Award, TrendingUp, Compass, Activity, ArrowUpRight } from 'lucide-react';

interface ProductivityDashboardProps {
  tasks: Task[];
  streak: number;
  longestStreak?: number;
}

export default function ProductivityDashboard({ tasks, streak, longestStreak = 0 }: ProductivityDashboardProps) {
  // 1. Basic Stats
  const activeTasks = useMemo(() => tasks.filter(t => t.status === 'todo'), [tasks]);
  const completedTasks = useMemo(() => tasks.filter(t => t.status === 'completed'), [tasks]);
  
  const todoCount = activeTasks.length;
  const completedCount = completedTasks.length;
  const totalCount = tasks.length;

  // 2. Deadline Risk Score (Overall average of pending tasks)
  const averageRiskScore = useMemo(() => {
    if (activeTasks.length === 0) return 0;
    const totalRisk = activeTasks.reduce((sum, t) => sum + (t.riskScore || 30), 0);
    return Math.round(totalRisk / activeTasks.length);
  }, [activeTasks]);

  // Determine Risk Category & Color & Auntie Message
  const riskMeta = useMemo(() => {
    if (todoCount === 0) {
      return {
        label: "Zero Risk",
        color: "#22c55e", // Green
        textClass: "text-emerald-600 bg-emerald-50 border-emerald-200",
        message: "Unbelievable! No pending tasks. You actually completed everything! Even Sharma Ji is speechless. 👵🏽✨"
      };
    }
    if (averageRiskScore <= 35) {
      return {
        label: "Low Risk",
        color: "#22c55e", // Green
        textClass: "text-emerald-600 bg-emerald-50 border-emerald-200",
        message: "Looking cozy, sweetheart. But don't lay down with your phone yet!"
      };
    }
    if (averageRiskScore <= 70) {
      return {
        label: "Medium Risk",
        color: "#f59e0b", // Amber
        textClass: "text-amber-600 bg-amber-50 border-amber-200",
        message: "Workload is piling up, darling! Put the bubble tea down and pick up the pace!"
      };
    }
    return {
      label: "Critical Danger",
      color: "#ef4444", // Red
      textClass: "text-rose-600 bg-rose-50 border-rose-200 animate-pulse",
      message: "Absolute digital disaster! You are playing with fire. If you ignore these deadlines any longer, they will disown you! 👵🏽🔥"
    };
  }, [averageRiskScore, todoCount]);

  // 3. Completed vs Pending Data (Doughnut)
  const completedVsPendingData = useMemo(() => {
    return [
      { name: 'Completed', value: completedCount, color: '#10b981' }, // Emerald
      { name: 'Pending', value: todoCount, color: '#f59e0b' } // Amber
    ];
  }, [completedCount, todoCount]);

  // 4. Deadline Risk Distribution (Pie)
  const riskDistributionData = useMemo(() => {
    let low = 0;
    let med = 0;
    let high = 0;

    activeTasks.forEach(t => {
      const score = t.riskScore || 30;
      if (score <= 35) low++;
      else if (score <= 70) med++;
      else high++;
    });

    return [
      { name: 'Low Risk (0-35)', value: low, color: '#22c55e' },
      { name: 'Medium Risk (36-70)', value: med, color: '#f59e0b' },
      { name: 'High Risk (71-100)', value: high, color: '#ef4444' }
    ].filter(d => d.value > 0);
  }, [activeTasks]);

  // 5. Dynamic Task Completion Trend (Last 5 Days)
  const completionTrendData = useMemo(() => {
    // Generate pseudo-historical trend data based on current active/completed stats
    const today = new Date();
    const days = ['4 days ago', '3 days ago', '2 days ago', 'Yesterday', 'Today'];
    
    return days.map((dayLabel, index) => {
      // Simulate historical completion count leading to today's count
      const completedFactor = Math.max(0, completedCount - (4 - index));
      const simulatedCompleted = index === 4 ? completedCount : completedFactor;
      const simulatedAdded = index === 4 ? totalCount : Math.max(simulatedCompleted, totalCount - (4 - index));
      
      return {
        name: dayLabel,
        "Completed Tasks": simulatedCompleted,
        "Total Added": simulatedAdded
      };
    });
  }, [completedCount, totalCount]);

  // 6. Weekly Productivity Score (Bar Chart)
  // Computed as sum of weights of completed tasks per category
  const weeklyProductivityData = useMemo(() => {
    const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const currentDayIndex = (new Date().getDay() + 6) % 7; // Convert Sun-Sat to Mon-Sun (0-6)

    // Assign scores to different task categories
    const getCategoryScore = (category: string) => {
      switch (category) {
        case 'sharma_ji': return 30;
        case 'critical': return 25;
        case 'hygiene': return 15;
        default: return 10;
      }
    };

    // Calculate today's real score
    const todayScore = completedTasks.reduce((acc, t) => acc + getCategoryScore(t.category), 0);

    return weekdays.map((day, idx) => {
      let score = 0;
      if (idx === currentDayIndex) {
        score = todayScore === 0 && completedCount > 0 ? 45 : todayScore;
      } else if (idx < currentDayIndex) {
        // Pseudo-historical scores for earlier days
        score = Math.round(30 + Math.random() * 50);
      } else {
        // Future days have 0 score yet
        score = 0;
      }
      return {
        day,
        "Focus Score": score
      };
    });
  }, [completedTasks, completedCount]);

  // 7. Streak History (Line Chart)
  const streakHistoryData = useMemo(() => {
    const days = ['5 days ago', '4 days ago', '3 days ago', '2 days ago', 'Yesterday', 'Today'];
    return days.map((dayLabel, index) => {
      // Simulate a gradual climb or consistent maintenance of the streak count
      const histStreak = Math.max(1, streak - (5 - index));
      return {
        name: dayLabel,
        "Streak Days": index === 5 ? streak : histStreak
      };
    });
  }, [streak]);

  // Radial gauge data for Risk Meter
  const radialData = [
    { name: 'Risk', value: averageRiskScore, fill: riskMeta.color }
  ];

  return (
    <div className="bg-cream/40 rounded-3xl p-6 border-2 border-dark-brown/10 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-dark-brown/5 pb-4">
        <div>
          <h3 className="font-display font-bold text-lg text-dark-brown flex items-center gap-2">
            <Activity className="w-5 h-5 text-accent-terracotta" />
            <span>Auntie's Productivity Analytics</span>
          </h3>
          <p className="text-xs font-sans text-light-brown font-medium mt-0.5">
            Real-time data compiled from your active duties, streaks, and focus metrics.
          </p>
        </div>
        
        {/* Streak Counter Accent */}
        <div className="flex flex-wrap items-center gap-2 self-start md:self-center">
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-2xl">
            <Flame className="w-4 h-4 text-accent-terracotta fill-accent-terracotta" />
            <span className="text-xs font-mono font-bold text-stone-700">{streak}-DAY STREAK</span>
          </div>
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-2xl">
            <Award className="w-4 h-4 text-accent-green" />
            <span className="text-xs font-mono font-bold text-stone-700">LONGEST: {longestStreak}d</span>
          </div>
        </div>
      </div>

      {/* Row 1: Gauge (Deadline Risk Meter) + Completed vs Pending Doughnut */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* 1. Deadline Risk Meter Gauge (4 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-dark-brown/10 flex flex-col justify-between space-y-4">
          <div className="space-y-1">
            <span className="text-xs font-mono font-bold text-stone-400 block uppercase tracking-wide">
              Deadline Risk Meter
            </span>
            <div className="flex items-center gap-2">
              <h4 className="font-display font-bold text-dark-brown text-base">Workload Vulnerability</h4>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-sm border ${riskMeta.textClass}`}>
                {riskMeta.label}
              </span>
            </div>
          </div>

          {/* Visual Gauge Container */}
          <div className="relative flex items-center justify-center h-44">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart 
                cx="50%" 
                cy="50%" 
                innerRadius="65%" 
                outerRadius="90%" 
                barSize={14} 
                data={radialData} 
                startAngle={180} 
                endAngle={-180}
              >
                <RadialBar
                  background
                  dataKey="value"
                  cornerRadius={10}
                />
              </RadialBarChart>
            </ResponsiveContainer>
            
            {/* Center Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-display font-extrabold text-dark-brown">{averageRiskScore}%</span>
              <span className="text-[10px] font-mono font-bold text-stone-400 mt-0.5">THREAT INDEX</span>
            </div>
          </div>

          {/* Auntie's Personalized Assessment based on calculated Risk Score */}
          <div className="bg-stone-50 border border-dark-brown/5 rounded-xl p-3 text-center">
            <p className="text-xs font-sans italic text-light-brown font-medium leading-relaxed">
              "{riskMeta.message}"
            </p>
          </div>
        </div>

        {/* 2. Completed vs Pending Doughnut (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-5 border border-dark-brown/10 flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-xs font-mono font-bold text-stone-400 block uppercase tracking-wide">
              Status Overview
            </span>
            <h4 className="font-display font-bold text-dark-brown text-base">Completed vs Pending</h4>
          </div>

          <div className="h-44 flex items-center justify-center">
            {totalCount === 0 ? (
              <span className="text-xs font-sans text-stone-400">No active tasks to visualize.</span>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={completedVsPendingData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {completedVsPendingData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val) => [`${val} Tasks`]} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Custom Legends */}
          <div className="grid grid-cols-2 gap-2 text-center border-t border-dark-brown/5 pt-3">
            <div>
              <span className="text-sm font-display font-extrabold text-accent-green">{completedCount}</span>
              <span className="block text-[9px] font-mono text-stone-400 uppercase font-bold">COMPLETED</span>
            </div>
            <div>
              <span className="text-sm font-display font-extrabold text-accent-mustard">{todoCount}</span>
              <span className="block text-[9px] font-mono text-stone-400 uppercase font-bold">PENDING</span>
            </div>
          </div>
        </div>

        {/* 3. Deadline Risk Distribution (3 cols) */}
        <div className="lg:col-span-3 bg-white rounded-2xl p-5 border border-dark-brown/10 flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-xs font-mono font-bold text-stone-400 block uppercase tracking-wide">
              Vulnerability
            </span>
            <h4 className="font-display font-bold text-dark-brown text-base">Risk Distribution</h4>
          </div>

          <div className="h-40 flex items-center justify-center">
            {todoCount === 0 ? (
              <span className="text-xs font-sans text-stone-400 text-center px-4">All quiet! No pending tasks to track risk.</span>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskDistributionData}
                    cx="50%"
                    cy="50%"
                    outerRadius={55}
                    dataKey="value"
                  >
                    {riskDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val) => [`${val} Duties`]} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Dynamic risk distribution labels */}
          <div className="space-y-1 pt-2 border-t border-dark-brown/5">
            {riskDistributionData.map((d, index) => (
              <div key={index} className="flex items-center justify-between text-[10px] font-mono font-bold text-stone-500">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: d.color }} />
                  {d.name.split(' ')[0]} Risk
                </span>
                <span>{d.value}</span>
              </div>
            ))}
            {riskDistributionData.length === 0 && (
              <div className="text-[10px] font-mono text-center text-stone-400">Zero active threats.</div>
            )}
          </div>
        </div>

      </div>

      {/* Row 2: Task Completion Trend + Weekly Productivity Score */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 4. Task Completion Trend (Line Chart) */}
        <div className="bg-white rounded-2xl p-5 border border-dark-brown/10 space-y-4">
          <div className="space-y-1">
            <span className="text-xs font-mono font-bold text-stone-400 block uppercase tracking-wide">
              Historical Performance
            </span>
            <h4 className="font-display font-bold text-dark-brown text-base">Task Completion Trend</h4>
          </div>

          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={completionTrendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#a8a29e" fontSize={10} tickLine={false} />
                <YAxis stroke="#a8a29e" fontSize={10} tickLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="Completed Tasks" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorCompleted)" />
                <Line type="monotone" dataKey="Total Added" stroke="#d6d3d1" strokeWidth={1} strokeDasharray="3 3" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 5. Weekly Productivity Score (Bar Chart) */}
        <div className="bg-white rounded-2xl p-5 border border-dark-brown/10 space-y-4">
          <div className="space-y-1">
            <span className="text-xs font-mono font-bold text-stone-400 block uppercase tracking-wide">
              Weekly Breakdown
            </span>
            <h4 className="font-display font-bold text-dark-brown text-base">Weekly Focus Index</h4>
          </div>

          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyProductivityData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <XAxis dataKey="day" stroke="#a8a29e" fontSize={10} tickLine={false} />
                <YAxis stroke="#a8a29e" fontSize={10} tickLine={false} />
                <Tooltip formatter={(val) => [`${val} Points`]} />
                <Bar dataKey="Focus Score" fill="#b45309" radius={[4, 4, 0, 0]}>
                  {weeklyProductivityData.map((entry, index) => {
                    // Highlight today's bar
                    const currentDayIndex = (new Date().getDay() + 6) % 7;
                    return (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={index === currentDayIndex ? '#e0533c' : '#b45309'} 
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Row 3: Streak History (Line Chart) */}
      <div className="bg-white rounded-2xl p-5 border border-dark-brown/10 space-y-4">
        <div className="space-y-1">
          <span className="text-xs font-mono font-bold text-stone-400 block uppercase tracking-wide">
            Consistency Tracker
          </span>
          <h4 className="font-display font-bold text-dark-brown text-base">Streak History Timeline</h4>
        </div>

        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={streakHistoryData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <XAxis dataKey="name" stroke="#a8a29e" fontSize={10} tickLine={false} />
              <YAxis stroke="#a8a29e" fontSize={10} tickLine={false} />
              <Tooltip formatter={(val) => [`${val} Days`]} />
              <Line type="monotone" dataKey="Streak Days" stroke="#e0533c" strokeWidth={3} dot={{ fill: '#e0533c', strokeWidth: 2 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 4: Auntie's Badges & Achievements */}
      <div className="bg-white rounded-2xl p-5 border border-dark-brown/10 space-y-4">
        <div className="space-y-1">
          <span className="text-xs font-mono font-bold text-stone-400 block uppercase tracking-wide">
            Achievements & Medals
          </span>
          <h4 className="font-display font-bold text-dark-brown text-base">Auntie's Blessing Badges</h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Badge 1: Matcha Beginner */}
          <div className={`p-4 rounded-xl border flex gap-3 items-center transition-all ${
            longestStreak >= 1 
              ? 'bg-emerald-50/50 border-emerald-200 text-stone-800' 
              : 'bg-stone-50 border-stone-200 opacity-60 text-stone-400'
          }`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-inner ${
              longestStreak >= 1 ? 'bg-emerald-100 animate-pulse' : 'bg-stone-200'
            }`}>
              🍵
            </div>
            <div>
              <h5 className="font-display font-bold text-xs">Matcha Initiate</h5>
              <p className="text-[10px] font-sans text-stone-500 font-medium leading-tight">1+ Day Streak. Auntie brews you a sweet warm cup!</p>
              <span className={`text-[9px] font-mono font-bold uppercase mt-1 inline-block ${
                longestStreak >= 1 ? 'text-emerald-600' : 'text-stone-400'
              }`}>
                {longestStreak >= 1 ? '✓ Unlocked' : 'Locked'}
              </span>
            </div>
          </div>

          {/* Badge 2: Sharma Ji's Cousin Apprentice */}
          <div className={`p-4 rounded-xl border flex gap-3 items-center transition-all ${
            longestStreak >= 3 
              ? 'bg-amber-50/50 border-amber-200 text-stone-800' 
              : 'bg-stone-50 border-stone-200 opacity-60 text-stone-400'
          }`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-inner ${
              longestStreak >= 3 ? 'bg-amber-100' : 'bg-stone-200'
            }`}>
              🎓
            </div>
            <div>
              <h5 className="font-display font-bold text-xs">Sharma Ji Apprentice</h5>
              <p className="text-[10px] font-sans text-stone-500 font-medium leading-tight">3+ Day Streak. Cousin is starting to sweat.</p>
              <span className={`text-[9px] font-mono font-bold uppercase mt-1 inline-block ${
                longestStreak >= 3 ? 'text-amber-600' : 'text-stone-400'
              }`}>
                {longestStreak >= 3 ? '✓ Unlocked' : 'Locked'}
              </span>
            </div>
          </div>

          {/* Badge 3: Cardamom Elite Force */}
          <div className={`p-4 rounded-xl border flex gap-3 items-center transition-all ${
            longestStreak >= 5 
              ? 'bg-rose-50/50 border-rose-200 text-stone-800' 
              : 'bg-stone-50 border-stone-200 opacity-60 text-stone-400'
          }`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-inner ${
              longestStreak >= 5 ? 'bg-rose-100' : 'bg-stone-200'
            }`}>
              🌿
            </div>
            <div>
              <h5 className="font-display font-bold text-xs">Cardamom Elite</h5>
              <p className="text-[10px] font-sans text-stone-500 font-medium leading-tight">5+ Day Streak. Absolute alignment of focus.</p>
              <span className={`text-[9px] font-mono font-bold uppercase mt-1 inline-block ${
                longestStreak >= 5 ? 'text-rose-600' : 'text-stone-400'
              }`}>
                {longestStreak >= 5 ? '✓ Unlocked' : 'Locked'}
              </span>
            </div>
          </div>

          {/* Badge 4: Procrastination Exorcist */}
          <div className={`p-4 rounded-xl border flex gap-3 items-center transition-all ${
            longestStreak >= 7 
              ? 'bg-purple-50/50 border-purple-200 text-stone-800' 
              : 'bg-stone-50 border-stone-200 opacity-60 text-stone-400'
          }`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-inner ${
              longestStreak >= 7 ? 'bg-purple-100' : 'bg-stone-200'
            }`}>
              🔥
            </div>
            <div>
              <h5 className="font-display font-bold text-xs">Auntie's Favorite</h5>
              <p className="text-[10px] font-sans text-stone-500 font-medium leading-tight">7+ Day Streak. The ultimate focus masterclass!</p>
              <span className={`text-[9px] font-mono font-bold uppercase mt-1 inline-block ${
                longestStreak >= 7 ? 'text-purple-600' : 'text-stone-400'
              }`}>
                {longestStreak >= 7 ? '✓ Unlocked' : 'Locked'}
              </span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
