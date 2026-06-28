import { Router } from "express";
import { auntieEngineService } from "../services/auntieEngine.service";

const router = Router();

// Centralized Auntie AI Engine Endpoint
router.post("/auntie-engine", async (req, res) => {
  const { 
    action, 
    roastLevel = 'medium', 
    userInput = '', 
    currentTasks = [], 
    upcomingEvents = [], 
    completedTasks = [], 
    streak = 3, 
    mood = 'neutral',
    todayDate = new Date().toISOString().split('T')[0],
    userContext = {}
  } = req.body;

  if (!action) {
    return res.status(400).json({ error: "No action specified, sweetheart!" });
  }

  try {
    const result = await auntieEngineService.processRequest({
      action,
      roastLevel,
      userInput,
      currentTasks,
      upcomingEvents,
      completedTasks,
      streak,
      mood,
      todayDate,
      userContext
    });

    return res.json(result);
  } catch (error: any) {
    console.error("[AuntieEngine Route Error]:", error);
    return res.status(500).json({ 
      error: "Sip of hot ginger tea went down the wrong pipe!", 
      details: error.message 
    });
  }
});

// Backward compatibility handlers mapped straight into our new Auntie Engine!
router.post("/analyze-dump", async (req, res) => {
  const { dumpText, spiceLevel = 'medium' } = req.body;
  try {
    const level = spiceLevel === 'hot' ? 'red_chilli' : spiceLevel;
    const result = await auntieEngineService.processRequest({
      action: "brain_dump",
      roastLevel: level as any,
      userInput: dumpText
    });
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ error: "Failed to analyze dump." });
  }
});

router.post("/chat", async (req, res) => {
  const { messages, spiceLevel = 'medium' } = req.body;
  try {
    const lastMsg = messages && messages.length > 0 ? messages[messages.length - 1].text : "";
    const level = spiceLevel === 'hot' ? 'red_chilli' : spiceLevel;
    const result = await auntieEngineService.processRequest({
      action: "vent",
      roastLevel: level as any,
      userInput: lastMsg
    });
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ error: "Failed to chat." });
  }
});

router.post("/auntie-advice", async (req, res) => {
  const { todoCount, completedCount, streak, spiceLevel = 'medium' } = req.body;
  try {
    const level = spiceLevel === 'hot' ? 'red_chilli' : spiceLevel;
    const result = await auntieEngineService.processRequest({
      action: "roast",
      roastLevel: level as any,
      userInput: "",
      currentTasks: Array(todoCount || 0).fill({ status: 'todo' }),
      completedTasks: Array(completedCount || 0).fill({ status: 'completed' }),
      streak: streak
    });
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ error: "Failed to get advice." });
  }
});

export default router;
