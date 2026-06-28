import { GoogleGenAI } from "@google/genai";

let aiInstance: GoogleGenAI | null = null;

/**
 * Centered GoogleGenAI connector that communicates directly with Gemini API.
 * This service is strictly for low-level Gemini communication, as requested.
 */
export const geminiService = {
  /**
   * Retrieves or initializes the GoogleGenAI instance.
   */
  getClient(): GoogleGenAI | null {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
      return null;
    }
    if (!aiInstance) {
      aiInstance = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
    }
    return aiInstance;
  },

  /**
   * Raw helper to generate structured JSON content from Gemini.
   */
  async generateJSON(prompt: string, systemInstruction: string, schema: any, temperature: number = 0.85): Promise<any> {
    const ai = this.getClient();
    if (!ai) {
      throw new Error("GEMINI_API_KEY not configured on the server.");
    }

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: schema,
          temperature,
        }
      });

      const text = response.text;
      if (!text) {
        throw new Error("Gemini returned an empty response.");
      }

      return JSON.parse(text);
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
        console.warn("[Gemini Service Warning]: Free-tier API quota limit reached (429 RESOURCE_EXHAUSTED). Falling back to Auntie's rule-based logic engine.");
      } else {
        console.warn("[Gemini Service Warning]: API call failed, falling back gracefully:", error?.message || error);
      }
      throw error;
    }
  }
};
