import { Type } from "@google/genai";
import { geminiService } from "./gemini.service";
import { getMasterAuntieInstruction } from "./auntieEngine.service";

/**
 * Planner Service handles daily plan structuring, reality checks,
 * and sassy custom roasts based on current tasks and streaks.
 */
export const plannerService = {
  /**
   * Generates a fully structured day-plan using Gemini AI
   */
  async generatePlanAI(data: { userInput: string; currentTasks: any[]; completedTasks: any[]; streak: number; roastLevel: string }) {
    const prompt = `Create a structured daily schedule or time-blocked planner based on the user's focus input and task list:
Focus input: "${data.userInput}"
Current tasks: ${JSON.stringify(data.currentTasks)}
Completed tasks: ${JSON.stringify(data.completedTasks)}
Current streak: ${data.streak} days

Provide a dynamic plan with time blocks, custom tasks, risk scores (of failing to complete them), recommendations, and Auntie's signature planner advice.`;

    const systemInstruction = getMasterAuntieInstruction(data.roastLevel) +
      "\nEnsure times are reasonable, and provide a high-contrast assessment. End with supportive blessings or witty reminders.";

    const schema = {
      type: Type.OBJECT,
      required: ["message", "todayPlan", "riskScore", "recommendations"],
      properties: {
        message: { type: Type.STRING, description: "Auntie's witty or warm intro advice about the plan" },
        todayPlan: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            required: ["time", "activity", "type", "auntieTip"],
            properties: {
              time: { type: Type.STRING, description: "e.g., '09:00 AM', '02:00 PM'" },
              activity: { type: Type.STRING },
              type: { type: Type.STRING, enum: ["work", "rest", "hygiene", "family"] },
              auntieTip: { type: Type.STRING, description: "Loving/sarcastic tip for this activity" }
            }
          }
        },
        riskScore: { type: Type.INTEGER, description: "Procrastination risk score from 1 to 100" },
        recommendations: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    };

    return await geminiService.generateJSON(prompt, systemInstruction, schema, 0.8);
  },

  /**
   * Generates custom witty advice/roast for Auntie's Corner based on current stats
   */
  async generateRoastAdviceAI(data: { currentTasks: any[]; completedTasks: any[]; streak: number; roastLevel: string }) {
    const todoCount = data.currentTasks.filter((t: any) => t.status === 'todo').length;
    const completedCount = data.completedTasks.length;
    const urgentCount = data.currentTasks.filter((t: any) => t.status === 'todo' && t.priority === 'high').length;

    const prompt = `Give me a single-sentence witty, globally appealing advice, blessing, or roast from Auntie Seema based on these stats:
- Current pending tasks: ${todoCount}
- Completed tasks today: ${completedCount}
- High priority/urgent items screaming: ${urgentCount}
- Current daily streak: ${data.streak} days

Keep it under 100 characters.`;

    const systemInstruction = getMasterAuntieInstruction(data.roastLevel) +
      "\nKeep responses strictly limited to a single snappy sentence (under 100 characters).";

    const schema = {
      type: Type.OBJECT,
      required: ["advice", "mood"],
      properties: {
        advice: { type: Type.STRING, description: "Single snappy sentence advice/roast text" },
        mood: { type: Type.STRING, enum: ["pleased", "neutral", "scolding", "warm"] }
      }
    };

    return await geminiService.generateJSON(prompt, systemInstruction, schema, 0.9);
  },

  /**
   * Generates a Reality Check based on current pending work using Gemini AI
   */
  async getRealityCheckAI(data: { currentTasks: any[]; completedTasks: any[]; streak: number; roastLevel: string }) {
    const todoCount = data.currentTasks.filter((t: any) => t.status === 'todo').length;
    const completedCount = data.completedTasks.length;

    const prompt = `Perform an objective, witty Reality Check on the user's progress.
Pending Tasks: ${todoCount}
Completed Tasks: ${completedCount}
Current Streak: ${data.streak} days

Are they truly focused, or are they just playing with buttons?`;

    const systemInstruction = getMasterAuntieInstruction(data.roastLevel);

    const schema = {
      type: Type.OBJECT,
      required: ["realityReport", "dangerZones", "recommendedActions"],
      properties: {
        realityReport: { type: Type.STRING, description: "Auntie's hilarious, brutally honest checkup" },
        dangerZones: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        },
        recommendedActions: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    };

    return await geminiService.generateJSON(prompt, systemInstruction, schema, 0.8);
  },

  /**
   * Local fallbacks
   */
  generatePlanFallback(data: { currentTasks: any[]; completedTasks: any[]; streak: number; roastLevel: string }) {
    const isRedChilli = data.roastLevel === 'red_chilli';
    return {
      message: isRedChilli 
        ? "Here is your plan. Sharma Ji's son would finish this by sunrise. Open your notebooks!" 
        : "Let's organize your day calmly, sweetheart. Step-by-step is the secret.",
      todayPlan: [
        { time: "09:00 AM", activity: "Tackle High Priority Duties", type: "work", auntieTip: "No screens, no chats, pure focus!" },
        { time: "12:00 PM", activity: "Healthy Meal & Hydration", type: "hygiene", auntieTip: "Drink warm water, sweetheart." },
        { time: "02:00 PM", activity: "Study & Skill Practice", type: "work", auntieTip: "Your cousin studies 10 hours daily, let's do 2!" },
        { time: "05:00 PM", activity: "Clean your Room / Tidy Nest", type: "hygiene", auntieTip: "Take 15 minutes to organize your desk." }
      ],
      riskScore: isRedChilli ? 75 : 40,
      recommendations: [
        "Drink a big glass of water right now.",
        "Put your phone in another room.",
        "Do the shortest task first to build momentum."
      ]
    };
  },

  generateRoastAdviceFallback(data: { currentTasks: any[]; completedTasks: any[]; streak: number; roastLevel: string }) {
    const todoCount = data.currentTasks.filter((t: any) => t.status === 'todo').length;
    const completedCount = data.completedTasks.length;
    const streak = data.streak;

    let advice = "Do your work, darling! Auntie is watching.";
    let mood = "neutral";

    if (todoCount === 0 && completedCount > 0) {
      advice = "Amazing! Zero pending tasks! Even your cousin is thoroughly impressed. Keep it up, darling!";
      mood = "pleased";
    } else if (streak > 3) {
      advice = `A ${streak}-day completion streak! Very nice. I am sending you all my blessings!`;
      mood = "warm";
    } else {
      if (data.roastLevel === 'blessings' || data.roastLevel === 'mild') {
        advice = "Take your time, honey. Finish just one small thing today and Auntie will be so proud of you.";
        mood = "warm";
      } else if (data.roastLevel === 'red_chilli') {
        advice = "Oho! That to-do list is looking like an abandonment zone. Start working! 🌶️";
        mood = "scolding";
      } else {
        advice = "You have duties waiting, sweetheart. Procrastination is sweet poison. Finish one!";
        mood = "neutral";
      }
    }

    return { advice, mood };
  },

  getRealityCheckFallback(data: { currentTasks: any[]; completedTasks: any[]; streak: number; roastLevel: string }) {
    const todoCount = data.currentTasks.filter((t: any) => t.status === 'todo').length;
    const isRedChilli = data.roastLevel === 'red_chilli';

    return {
      realityReport: isRedChilli
        ? `You have ${todoCount} pending tasks staring at you like judges. Sharma Ji is currently discussing your slow pace with your parents!`
        : `You have ${todoCount} small things remaining, sweetheart. Don't let overwhelm win. Focus on one minor duty!`,
      dangerZones: [
        "Opening social media tabs 'just for a second'",
        "Lying down on your bed with your phone"
      ],
      recommendedActions: [
        "Go wash your face with ice-cold water.",
        "Take 5 minutes to clean your study desk.",
        "Close 30 unused Chrome tabs right now!"
      ]
    };
  }
};
