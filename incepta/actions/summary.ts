'use server';

import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY!,
});

export async function summarize(text: string): Promise<string> {
  console.log(text);
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: text,
    });
    console.log(response.text);
    return response.text!;
  } catch (error) {
    console.error("Error in summarize server action:", error);
    return "An error occurred while summarizing.";
  }
}
