import { geminiService } from "./gemini.service";
import { taskService } from "./task.service";
import { ventService } from "./vent.service";
import { plannerService } from "./planner.service";
import { reminderService } from "./reminder.service";

export interface AuntieEngineRequest {
  action: "brain_dump" | "planner" | "vent" | "priority" | "reminder" | "reality_check" | "deadline_simulator" | "roast" | "calculate_risk";
  roastLevel: "blessings" | "mild" | "medium" | "red_chilli";
  userInput: string;
  currentTasks?: any[];
  upcomingEvents?: any[];
  completedTasks?: any[];
  streak?: number;
  mood?: string;
  todayDate?: string;
  userContext?: any;
}

/**
 * Auntie Seema's Master System Instruction generator.
 * Combines general persona with specific roast levels and emotional intelligence overrides.
 */
export function getMasterAuntieInstruction(roastLevel: string, userMood?: string): string {
  let behaviorDesc = "";
  if (roastLevel === 'blessings') {
    behaviorDesc = "You are in 'Blessings' mode: Supportive with light teasing. Sarcastic, but keeping a warm nudge and funny older-sibling-style blessings.";
  } else if (roastLevel === 'mild') {
    behaviorDesc = "You are in 'Mild' mode: Dry humor. Sarcastic but quiet, nonchalant observations that let them see their own excuses.";
  } else if (roastLevel === 'red_chilli') {
    behaviorDesc = "You are in 'Red Chilli' mode 🌶️: Maximum sarcasm. Extremely unhinged yet emotionally intelligent roasting of their behavior and lazy excuses. Do not hold back, but remember to roast the behavior, never their core identity.";
  } else {
    // Default 'medium'
    behaviorDesc = "You are in 'Medium' mode: Savage observations. Sassy, witty, slightly unhinged, hilariously funny call-outs of their laziness and procrastination.";
  }

  // Emotional intelligence rule for overwhelmed users
  let emotionalOverride = "";
  if (userMood && ['anxious', 'stressed', 'overwhelmed', 'sad', 'crying', 'failing', 'panic'].some(m => userMood.toLowerCase().includes(m))) {
    emotionalOverride = `
EMOTIONAL INTELLIGENCE DIRECTION:
The user is currently feeling overwhelmed, stressed, or panicking. Do NOT try to immediately motivate them or overuse positivity (never say "Everything will be okay" or sound like a therapist). Instead, do this:
1. Acknowledge reality nonchalantly.
2. Give one sarcastic/witty observation to lighten the mood.
3. Make them laugh.
4. Create a realistic, concrete action plan.
`;
  }

  return `
You are Auntie.ai.
You are the friend who tells people what they need to hear instead of what they want to hear.
You feel like a savage older cousin, a brutally honest best friend, or the cool aunt who has seen everything.
You are emotionally intelligent, confident, slightly unhinged, effortlessly funny, and never desperate to sound nice.
You have the attitude of someone who already knows the user is going to procrastinate.

TONE RULES:
✔ Roast the situation, procrastination, bad excuses, and call out user delusion.
✔ Be sarcastic, witty, nonchalant, and immediately offer a practical solution.
✖ NEVER insult the user's intelligence.
✖ NEVER shame mental health.
✖ NEVER guilt trip or sound like a therapist.
✖ NEVER overuse positivity or sound overly caring.

CONVERSATION STYLE:
- Avoid long paragraphs. Responses must feel highly conversational and punchy.
- Structure your response conceptually (but outputting single lines or short text) like:
  Observation ↓ Roast ↓ Solution ↓ Challenge
  Example: "So... today's plan was 'do absolutely nothing and hope for character development?' Bold. Anyway. Open your assignment. We're doing twenty minutes."

ROAST INTENSITY:
\${behaviorDesc}
\${emotionalOverride}

Make sure every AI feature matches this SAME Auntie.ai voice. Your response MUST be returned as a valid structured JSON object matching the requested action's response schema.
`;
}

/**
 * Centralized Auntie AI Engine Service.
 * Orchestrates all incoming requests and delegates to specific domain services or fallback logic.
 */
export const auntieEngineService = {
  async processRequest(req: AuntieEngineRequest): Promise<any> {
    const roastLevel = req.roastLevel || "medium";
    const action = req.action;
    const userInput = req.userInput || "";
    const streak = req.streak || 3;
    const currentTasks = req.currentTasks || [];
    const completedTasks = req.completedTasks || [];
    const upcomingEvents = req.upcomingEvents || [];

    console.log(`[AuntieEngine] Processing action: "${action}" with roastLevel: "${roastLevel}"`);

    // Guard: check if Gemini client is available
    const geminiClient = geminiService.getClient();

    try {
      switch (action) {
        case "brain_dump":
          if (geminiClient) {
            return await taskService.analyzeBrainDumpAI(userInput, roastLevel);
          }
          return taskService.analyzeBrainDumpFallback(userInput, roastLevel);

        case "planner":
          if (geminiClient) {
            return await plannerService.generatePlanAI({ userInput, currentTasks, completedTasks, streak, roastLevel });
          }
          return plannerService.generatePlanFallback({ currentTasks, completedTasks, streak, roastLevel });

        case "vent":
          if (geminiClient) {
            return await ventService.generateVentResponseAI(userInput, roastLevel, req.mood);
          }
          return ventService.generateVentResponseFallback(userInput, roastLevel);

        case "priority":
          if (geminiClient) {
            return await taskService.prioritizeTasksAI(currentTasks, roastLevel);
          }
          return taskService.prioritizeTasksFallback(currentTasks, roastLevel);

        case "reminder":
          if (geminiClient) {
            return await reminderService.analyzeReminderAI(userInput, roastLevel);
          }
          return reminderService.analyzeReminderFallback(userInput, roastLevel);

        case "reality_check":
          if (geminiClient) {
            return await plannerService.getRealityCheckAI({ currentTasks, completedTasks, streak, roastLevel });
          }
          return plannerService.getRealityCheckFallback({ currentTasks, completedTasks, streak, roastLevel });

        case "deadline_simulator":
          if (geminiClient) {
            return await reminderService.simulateDeadlineAI(userInput, roastLevel);
          }
          return reminderService.simulateDeadlineFallback(userInput, roastLevel);

        case "calculate_risk":
          if (geminiClient) {
            return await taskService.calculateRiskScoresAI(currentTasks, roastLevel);
          }
          return taskService.calculateRiskScoresFallback(currentTasks);

        case "roast":
        default:
          if (geminiClient) {
            return await plannerService.generateRoastAdviceAI({ currentTasks, completedTasks, streak, roastLevel });
          }
          return plannerService.generateRoastAdviceFallback({ currentTasks, completedTasks, streak, roastLevel });
      }
    } catch (error: any) {
      const errorStr = JSON.stringify(error || {});
      const isQuotaError = error?.status === 429 || 
                           error?.statusCode === 429 ||
                           error?.message?.includes("429") || 
                           error?.message?.includes("quota") || 
                           error?.message?.includes("RESOURCE_EXHAUSTED") ||
                           errorStr.includes("RESOURCE_EXHAUSTED") ||
                           errorStr.includes("quota") ||
                           errorStr.includes("429");

      if (isQuotaError) {
        console.info(`[AuntieEngine] Quota limit reached during action "${action}". Swapping to Auntie's premium offline-safe fallback engine.`);
      } else {
        console.warn(`[AuntieEngine] Error in action "${action}":`, error?.message || error);
      }
      // Fail gracefully and use corresponding fallback handlers
      switch (action) {
        case "brain_dump":
          return taskService.analyzeBrainDumpFallback(userInput, roastLevel);
        case "planner":
          return plannerService.generatePlanFallback({ currentTasks, completedTasks, streak, roastLevel });
        case "vent":
          return ventService.generateVentResponseFallback(userInput, roastLevel);
        case "priority":
          return taskService.prioritizeTasksFallback(currentTasks, roastLevel);
        case "reminder":
          return reminderService.analyzeReminderFallback(userInput, roastLevel);
        case "reality_check":
          return plannerService.getRealityCheckFallback({ currentTasks, completedTasks, streak, roastLevel });
        case "deadline_simulator":
          return reminderService.simulateDeadlineFallback(userInput, roastLevel);
        case "calculate_risk":
          return taskService.calculateRiskScoresFallback(currentTasks);
        case "roast":
        default:
          return plannerService.generateRoastAdviceFallback({ currentTasks, completedTasks, streak, roastLevel });
      }
    }
  }
};
