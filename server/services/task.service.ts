import { Type } from "@google/genai";
import { geminiService } from "./gemini.service";
import { getMasterAuntieInstruction } from "./auntieEngine.service";

/**
 * Task Service handles business logic related to tasks, including:
 * 1. AI-driven brain dump analysis
 * 2. Task prioritization and structuring
 * 3. Local/Static fallbacks
 */
export const taskService = {
  /**
   * Analyzes raw brain dump via Gemini AI
   */
  async analyzeBrainDumpAI(dumpText: string, roastLevel: string) {
    const prompt = `Analyze this chaotic brain dump of tasks and thoughts:
"${dumpText}"

Extract individual tasks, determine realistic categories, priorities, estimated effort, and a hilarious custom Auntie roast for each task.`;

    const systemInstruction = getMasterAuntieInstruction(roastLevel) + 
      "\nEnsure category values are exactly: 'critical' (vital items), 'hygiene' (cleaning, self-care), 'sharma_ji' (high-achievement studies/work), or 'someday' (low priority wishlist). " +
      "Priority values must be 'high', 'medium', or 'low'. Efforts should be simple like '30 mins', '1 hour', '2 hours'.";

    const schema = {
      type: Type.OBJECT,
      required: ["tasks", "overallRoast", "priorityOrderExplanation"],
      properties: {
        tasks: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            required: ["title", "description", "category", "priority", "effort", "auntieRoast", "riskScore"],
            properties: {
              title: { type: Type.STRING, description: "Action-oriented task title" },
              description: { type: Type.STRING, description: "Brief context or details" },
              category: { type: Type.STRING, enum: ["critical", "hygiene", "sharma_ji", "someday"] },
              priority: { type: Type.STRING, enum: ["high", "medium", "low"] },
              effort: { type: Type.STRING, description: "Estimated time/effort, e.g. '45 mins', '2 hours'" },
              auntieRoast: { type: Type.STRING, description: "Witty, caring, custom Auntie roast matching the current roastLevel" },
              riskScore: { type: Type.INTEGER, description: "Deadline and priority risk score from 0 (no risk) to 100 (extreme critical risk) based on priority, deadline proximity, and workload" }
            }
          }
        },
        overallRoast: { type: Type.STRING, description: "A funny, cohesive summary of their chaotic mind" },
        priorityOrderExplanation: { type: Type.STRING, description: "Auntie's explanation of why things are sorted this way" }
      }
    };

    return await geminiService.generateJSON(prompt, systemInstruction, schema, 0.85);
  },

  /**
   * Prioritizes existing tasks using Gemini AI
   */
  async prioritizeTasksAI(tasks: any[], roastLevel: string) {
    const tasksPrompt = JSON.stringify(tasks.map(t => ({ id: t.id, title: t.title, priority: t.priority, category: t.category })));
    const prompt = `Look at these current tasks and prioritize them with Auntie's special tough-love algorithm:\n${tasksPrompt}`;

    const systemInstruction = getMasterAuntieInstruction(roastLevel) + 
      "\nAnalyze each task, decide if the priority should be adjusted, and provide a humorous justification.";

    const schema = {
      type: Type.OBJECT,
      required: ["prioritizedTasks", "advice"],
      properties: {
        prioritizedTasks: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            required: ["id", "suggestedPriority", "reason"],
            properties: {
              id: { type: Type.STRING },
              suggestedPriority: { type: Type.STRING, enum: ["high", "medium", "low"] },
              reason: { type: Type.STRING, description: "Sassy reason why this priority makes sense" }
            }
          }
        },
        advice: { type: Type.STRING, description: "General tough-love advice on organizing their day" }
      }
    };

    return await geminiService.generateJSON(prompt, systemInstruction, schema, 0.8);
  },

  /**
   * Local Fallback for Brain Dump Analysis
   */
  analyzeBrainDumpFallback(dumpText: string, roastLevel: string) {
    const sentences = dumpText.split(/[.!?\n,;]+/);
    const tasks: any[] = [];

    for (let s of sentences) {
      s = s.trim();
      if (s.length < 5) continue;

      let priority: 'high' | 'medium' | 'low' = 'medium';
      let category: 'critical' | 'hygiene' | 'sharma_ji' | 'someday' = 'hygiene';
      let effort = '1 hour';
      let auntieRoast = '';

      if (s.includes('important') || s.includes('urgent') || s.includes('exam') || s.includes('test') || s.includes('deadline')) {
        priority = 'high';
        category = 'sharma_ji';
        effort = '2 hours';
        if (roastLevel === 'blessings') {
          auntieRoast = `Prepare calmly, darling. I am sending you all my blessings and prayers for your test!`;
        } else if (roastLevel === 'mild') {
          auntieRoast = `This is important, sweetheart. Take a deep breath and start slowly. I believe in you!`;
        } else if (roastLevel === 'medium') {
          auntieRoast = `Aha! Your cousin finished preparing for this last week. Put the screen down and work, darling.`;
        } else {
          auntieRoast = `Sharma Ji's son is already a senior fellow and you are procrastinating a basic task? Close the 45 tabs and study! 🌶️`;
        }
      } else if (s.includes('clean') || s.includes('room') || s.includes('tidy') || s.includes('wash') || s.includes('clothes')) {
        priority = 'medium';
        category = 'hygiene';
        effort = '30 mins';
        if (roastLevel === 'blessings' || roastLevel === 'mild') {
          auntieRoast = `A clean space brings a peaceful mind, honey. Tidying up will feel so good.`;
        } else if (roastLevel === 'medium') {
          auntieRoast = `Your room looks like a chaotic playground! Tidying up is good hygiene, sweetheart.`;
        } else {
          auntieRoast = `Your dirty clothes are planning an independent republic on that chair! Wash them before they apply for a passport! 🌶️`;
        }
      } else if (s.includes('call') || s.includes('mom') || s.includes('family') || s.includes('parent')) {
        priority = 'high';
        category = 'critical';
        effort = '15 mins';
        if (roastLevel === 'blessings' || roastLevel === 'mild') {
          auntieRoast = `Call home, sweetheart. They would love to hear your lovely voice!`;
        } else {
          auntieRoast = `You have time to view 400 dog videos, but no time to dial your mother? Go call her now!`;
        }
      } else {
        if (roastLevel === 'blessings') {
          auntieRoast = `I've noted this, honey. Let's do it peacefully step-by-step.`;
        } else if (roastLevel === 'mild') {
          auntieRoast = `We can definitely complete this today, darling. Let's do a tiny bit of focus.`;
        } else if (roastLevel === 'medium') {
          auntieRoast = `You wrote this down, sweetheart. Now are we going to do it or just frame it on the wall?`;
        } else {
          auntieRoast = `Another item for your procrastination museum! Start working already! 🌶️`;
        }
      }

      let baseScore = 30;
      if (priority === 'high') baseScore = 75;
      else if (priority === 'medium') baseScore = 45;
      
      if (category === 'critical' || category === 'sharma_ji') baseScore += 15;
      if (effort.includes('2') || effort.includes('3')) baseScore += 10;
      
      const riskScore = Math.min(95, Math.max(15, baseScore));

      tasks.push({
        title: s.substring(0, 1).toUpperCase() + s.substring(1),
        description: `Extracted from your notes`,
        category,
        priority,
        effort,
        auntieRoast,
        riskScore
      });
    }

    if (tasks.length === 0) {
      tasks.push({
        title: "Focus on your daily duties, sweetheart",
        description: "Let's make a real plan.",
        category: "hygiene",
        priority: "high",
        effort: "30 mins",
        auntieRoast: "A blank dump is a sign of a sleepy mind. Drink some water!",
        riskScore: 75
      });
    }

    return {
      tasks,
      overallRoast: roastLevel === 'red_chilli' ? "Absolute theater! Your brain is in a vacation state. Let's study! 🌶️" : "I see some tasks to complete, honey. Let's start with a fresh heart.",
      priorityOrderExplanation: "First we tackle critical family & essential studies, then hygiene chores."
    };
  },

  /**
   * Local Fallback for Prioritization
   */
  prioritizeTasksFallback(tasks: any[], roastLevel: string) {
    const prioritizedTasks = tasks.map(t => {
      let suggestedPriority = t.priority || 'medium';
      let reason = "Auntie likes this priority, looks stable, darling!";

      if (t.category === 'sharma_ji' || t.category === 'critical') {
        suggestedPriority = 'high';
        reason = roastLevel === 'red_chilli' 
          ? "High achievement and family are non-negotiable! Sharma Ji level priority!" 
          : "Highly important for your long term path, sweetheart.";
      } else if (t.category === 'someday') {
        suggestedPriority = 'low';
        reason = "This is a daydream item, darling. Let's do it after real duties.";
      }

      return {
        id: t.id,
        suggestedPriority,
        reason
      };
    });

    return {
      prioritizedTasks,
      advice: "Auntie says: Sort your critical duties first, keep your focus on Sharma Ji's son's level, then rest."
    };
  },

  /**
   * Use Gemini to calculate risk score (0-100) for tasks based on workload, deadlines, priorities, and effort
   */
  async calculateRiskScoresAI(tasks: any[], roastLevel: string) {
    const prompt = `Analyze this set of tasks and calculate a risk score from 0 to 100 for each task.
Consider:
1. High-priority tasks have higher base risk.
2. Tasks with immediate or missing deadlines have higher risk.
3. Tasks with longer estimated effort require more effort, so risk is higher.
4. If there are many active tasks (heavy workload), overall task failure risk increases.

Tasks:
${JSON.stringify(tasks.map(t => ({ id: t.id, title: t.title, priority: t.priority, category: t.category, effort: t.effort, dueDate: t.dueDate })))}

Return a structured array mapping each task ID to its calculated risk score (0-100) and a brief humorous Auntie warning.`;

    const systemInstruction = getMasterAuntieInstruction(roastLevel) +
      "\nEnsure you assign a logical risk score from 0 (very safe) to 100 (extreme danger of missed deadline) for each task. Respond in the required JSON schema.";

    const schema = {
      type: Type.OBJECT,
      required: ["taskRisks"],
      properties: {
        taskRisks: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            required: ["id", "riskScore", "warning"],
            properties: {
              id: { type: Type.STRING, description: "The task ID" },
              riskScore: { type: Type.INTEGER, description: "Risk score from 0 to 100" },
              warning: { type: Type.STRING, description: "A very brief, sassy Auntie warning about this task's risk" }
            }
          }
        }
      }
    };

    return await geminiService.generateJSON(prompt, systemInstruction, schema, 0.75);
  },

  /**
   * Fallback task risk score calculator
   */
  calculateRiskScoresFallback(tasks: any[]) {
    const taskRisks = tasks.map(t => {
      let score = 30;
      if (t.priority === 'high') score = 70;
      else if (t.priority === 'medium') score = 45;
      else score = 20;

      if (t.category === 'sharma_ji' || t.category === 'critical') score += 15;
      if (t.effort?.includes('2') || t.effort?.includes('3')) score += 10;

      // Adjust for workload
      if (tasks.length > 5) score += 10;

      // Cap at 98
      const finalScore = Math.min(98, Math.max(10, score));

      return {
        id: t.id,
        riskScore: finalScore,
        warning: t.priority === 'high' 
          ? "This is screaming for attention, sweetheart! Stop snoozing!"
          : "Keep an eye on this. Don't let it drift into the someday pile!"
      };
    });

    return { taskRisks };
  }
};
