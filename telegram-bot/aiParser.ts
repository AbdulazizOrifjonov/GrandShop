import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const ProductSchema = z.object({
  name: z.string().describe("The name or brand of the product. If not clear, return empty string."),
  price: z.number().nullable().describe("The price in numbers (e.g. 1300000). If missing, return null."),
  description: z.string().describe("A clean description of the product without emojis."),
  characteristics: z.array(z.string()).describe("A list of key specifications or characteristics."),
});

export type ParsedProduct = z.infer<typeof ProductSchema>;

export async function parseProductText(text: string): Promise<ParsedProduct | null> {
  try {
    let model;
    
    // Check if AI keys exist and are valid (not the placeholder string)
    const aiKey = process.env.AI_API_KEY || "";
    const isRealKey = aiKey && aiKey !== "OpenAI yoki Gemini API kaliti" && aiKey.length > 10;

    if (isRealKey || process.env.OPENAI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      if (process.env.AI_API_KEY && process.env.AI_API_KEY.startsWith("sk-")) {
        process.env.OPENAI_API_KEY = process.env.AI_API_KEY;
        model = openai("gpt-4o-mini");
      } else if (process.env.AI_API_KEY) {
        process.env.GOOGLE_GENERATIVE_AI_API_KEY = process.env.AI_API_KEY;
        model = google("gemini-1.5-flash");
      } else if (process.env.OPENAI_API_KEY) {
        model = openai("gpt-4o-mini");
      } else if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
        model = google("gemini-1.5-flash");
      }

      if (model) {
        const { object } = await generateObject({
          model: model,
          schema: ProductSchema,
          prompt: `Extract the product details from the following Telegram post. 
If the price is missing, set it to null. 
Do not invent a name if it's missing, use a safe default or empty string.

CRITICAL INSTRUCTION: EXTRACT THE TEXT EXACTLY AS WRITTEN IN THE ORIGINAL LANGUAGE. DO NOT TRANSLATE ANYTHING. PRESERVE CYRILLIC (RUSSIAN) TEXT EXACTLY.

Post text:
"""
${text}
"""`,
        });
        return object;
      }
    }
    
    // FALLBACK TO REGEX IF NO AI KEY IS PROVIDED (to save the user from API key hassle)
    console.log("No AI key found, using regex fallback...");
    
    // Extract name (first line)
    const lines = text.split('\n').filter(l => l.trim() !== '');
    // Clean name by removing any emojis or special starting symbols
    let name = lines[0] || "Yangi Mahsulot";
    name = name.replace(/^[\p{Emoji_Presentation}\p{Extended_Pictographic}\u200d\uFE0F\W]+/gu, '').replace(/"/g, '').trim();
    if (name.length > 50) name = name.substring(0, 50) + "..."; // safety truncate
    
    // Extract price
    let price: number | null = null;
    // Match any digits after "Цена" or "Narx" ignoring any characters/emojis in between, up to the first group of numbers
    const priceMatch = text.match(/(?:Цена|Narx)[^\d]*([\d\.\s\,]+)/i) || text.match(/([\d\.\s\,]+)\s*(сум|uzs|so\'?m|\$)/i);
    if (priceMatch) {
      let numStr = priceMatch[1].replace(/[^\d]/g, '');
      if (numStr) {
        price = parseInt(numStr, 10);
      }
    }
    
    // Extract characteristics
    const characteristics: string[] = [];
    const descLines: string[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();
      
      const lower = trimmed.toLowerCase();
      // Skip price, links, or contact lines
      if (lower.includes('цена') || lower.includes('ссылка') || lower.includes('@') || lower.includes('http')) {
        continue;
      }
      
      // Clean leading emojis or dashes from characteristics
      const cleanLine = trimmed.replace(/^[\p{Emoji_Presentation}\p{Extended_Pictographic}\u200d\uFE0F\-\s✓✔✅✔️💯🎁📉💰💲]+/gu, '').trim();
      
      if (cleanLine.length > 2) {
        characteristics.push(cleanLine);
      }
    }
    
    return {
      name,
      price,
      description: descLines.join('\n').trim(), // we aren't really using description now, putting everything in characteristics
      characteristics
    };

  } catch (error) {
    console.error("Parsing error:", error);
    return null;
  }
}
