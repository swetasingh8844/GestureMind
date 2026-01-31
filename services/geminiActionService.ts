import { GoogleGenAI, Type } from "@google/genai";
import { ActionType } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const SYSTEM_PROMPT = `
You are a high-speed Neural Gesture Decoder for a device controller. 
You will receive 21 hand landmarks (indices 0-20) with X and Y coordinates.
Coordinate system: Top-left is (0,0), Bottom-right is (1,1). Lower Y value means HIGHER in the air.

STRICT GESTURE MAPPING RULES (PRIORITY):
1. OPEN_YOUTUBE (Open Palm): All five fingers (Thumb 4, Index 8, Middle 12, Ring 16, Pinky 20) are EXTENDED. Their tips are much higher (lower Y) than their respective MCP joints (5, 9, 13, 17) and spread apart. This is a full open hand.
2. OPEN_GMAIL (Small Finger/Pinky): ONLY the Pinky (landmark 20) is extended high (lowest Y). The index (8), middle (12), and ring (16) fingers are curled down.
3. PLAY_SONG (Middle Finger): ONLY the Middle finger (landmark 12) is extended high. The index (8), ring (16), and pinky (20) are curled. This is the signal for YouTube Music.
4. PAUSE_SONG (O-Sign/Pinch): Thumb tip (4) and Index tip (8) are touching or very close (distance < 0.05). This is the pause signal.
5. VOLUME_UP (Thumbs Up): Thumb (4) is pointing straight up (lowest Y) and away from the palm.
6. VOLUME_DOWN (Thumbs Down): Thumb (4) is pointing down (highest Y), while other fingers are curled.
7. LOCK_SYSTEM (Fist): All fingers tightly curled toward the palm.

Return a JSON response with 'action' and 'reasoning'.
Actions: ['PLAY_SONG', 'PAUSE_SONG', 'VOLUME_UP', 'VOLUME_DOWN', 'OPEN_YOUTUBE', 'OPEN_GMAIL', 'LOCK_SYSTEM', 'NONE']
`;

export async function interpretGesture(gestureData: any): Promise<{ action: ActionType, reasoning: string }> {
  try {
    const simplifiedData = gestureData.map((p: any, i: number) => ({
      i, 
      x: parseFloat(p.x), 
      y: parseFloat(p.y)
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Hand Landmarks: ${JSON.stringify(simplifiedData)}. Decipher the gesture.`,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            action: { 
              type: Type.STRING, 
              enum: ['PLAY_SONG', 'PAUSE_SONG', 'VOLUME_UP', 'VOLUME_DOWN', 'OPEN_YOUTUBE', 'OPEN_GMAIL', 'LOCK_SYSTEM', 'NONE']
            },
            reasoning: { type: Type.STRING }
          },
          required: ['action', 'reasoning']
        }
      }
    });

    const result = JSON.parse(response.text);
    return result as { action: ActionType, reasoning: string };
  } catch (error: any) {
    console.error("Gemini Interpretation Error:", error);
    const msg = error?.status === 429 ? "QUOTA_EXCEEDED" : "SIGNAL_ERROR";
    return { action: 'NONE', reasoning: `Neural Link Error: ${msg}` };
  }
}