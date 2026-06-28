import { Type } from "@google/genai";
import { geminiService } from "./gemini.service";
import { getMasterAuntieInstruction } from "./auntieEngine.service";

/**
 * Reminder Service handles extraction of social duties/events,
 * analyzing user requests, and simulating scary/sassy deadlines.
 */
export const reminderService = {
  /**
   * Analyzes input to extract calendar reminders/social events using Gemini AI
   */
  async analyzeReminderAI(userInput: string, roastLevel: string) {
    const prompt = `Extract any social event, family duty, birthday, anniversary, or exam date from this text:
"${userInput}"`;

    const systemInstruction = getMasterAuntieInstruction(roastLevel) +
      "\nExtract the title, date, target person, description, and provide Auntie's specific cultural advice about not showing up empty-handed!";

    const schema = {
      type: Type.OBJECT,
      required: ["title", "date", "relation", "description", "auntieAdvice"],
      properties: {
        title: { type: Type.STRING, description: "e.g., 'Auntie Meena's Anniversary', 'Cousin Study Session'" },
        date: { type: Type.STRING, description: "Formatted as YYYY-MM-DD" },
        relation: { type: Type.STRING, description: "e.g., 'Auntie', 'Cousin', 'Parents', 'Friend'" },
        description: { type: Type.STRING },
        auntieAdvice: { type: Type.STRING, description: "Sassy or sweet advice about the event" }
      }
    };

    return await geminiService.generateJSON(prompt, systemInstruction, schema, 0.85);
  },

  /**
   * Simulates a simulated high-alert deadline countdown
   */
  async simulateDeadlineAI(userInput: string, roastLevel: string) {
    const prompt = `Simulate an intense, funny, high-urgency deadline countdown or alert for this specific commitment:
"${userInput}"`;

    const systemInstruction = getMasterAuntieInstruction(roastLevel) +
      "\nMake it highly dramatic and hilarious. Focus on how time is ticking away.";

    const schema = {
      type: Type.OBJECT,
      required: ["headline", "hoursRemainingText", "dramaticSirenText", "actionPlan"],
      properties: {
        headline: { type: Type.STRING, description: "Scary or sassy high-alert alert headline" },
        hoursRemainingText: { type: Type.STRING, description: "Funny estimate of panic-hours left" },
        dramaticSirenText: { type: Type.STRING, description: "Auntie's custom vocal siren effect or drama speech" },
        actionPlan: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    };

    return await geminiService.generateJSON(prompt, systemInstruction, schema, 0.9);
  },

  /**
   * Local fallbacks
   */
  analyzeReminderFallback(userInput: string, roastLevel: string) {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 3); // Default to 3 days from now
    const formattedDate = targetDate.toISOString().split('T')[0];

    return {
      title: userInput.substring(0, 30) || "Family Social Duty",
      date: formattedDate,
      relation: "Relative",
      description: "Remember to buy some sweets and wish them well, darling!",
      auntieAdvice: roastLevel === 'red_chilli'
        ? "Do not dare show up with empty hands and excuses! Go buy some fresh cardamoms! 🌶️"
        : "Make sure you call them on time, sweetheart. Relationships are important!"
    };
  },

  simulateDeadlineFallback(userInput: string, roastLevel: string) {
    const isRedChilli = roastLevel === 'red_chilli';
    return {
      headline: isRedChilli ? "🔥 PANIC MODE PROTOCOL ACTIVATED!" : "⏰ Attention Sweetheart: Time is Ticking!",
      hoursRemainingText: "Precisely zero hours of leisure remaining!",
      dramaticSirenText: isRedChilli 
        ? "WEE-WOO-WEE-WOO! Sharma Ji is already looking at his watch! Move!" 
        : "Tick tock, darling. Open the books before the sun sets!",
      actionPlan: [
        "Drink a shot of strong ginger tea.",
        "Turn off all notifications.",
        "Focus for exactly 20 minutes."
      ]
    };
  }
};
