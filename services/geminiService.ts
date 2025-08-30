import { GoogleGenAI, Type } from "@google/genai";
import type { MenuItemMetadata } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const schema = {
  type: Type.OBJECT,
  properties: {
    itemName: { type: Type.STRING, description: "The full name of the menu item." },
    description: { type: Type.STRING, description: "A creative and appealing description for a customer browsing a delivery app. Listing out cuisine, ingredients, and preparation." },
    category: { type: Type.STRING, description: "The menu category (e.g., 'Appetizer', 'Main Course', 'Dessert', 'Side Dish', 'Beverage')." },
    dietaryTags: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "A list of suggested dietary tags (e.g., 'Vegetarian', 'Vegan', 'Gluten-Free', 'Spicy', 'Low-Carb')."
    },
    allergenWarnings: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "A list of potential allergens present (e.g., 'Contains Nuts', 'Contains Dairy', 'Contains Shellfish')."
    },
    suggestedPairings: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Suggestions for items that would pair well with this dish to encourage upselling."
    },
    seoKeywords: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "A list of keywords for search engine optimization (e.g., 'cheesy pizza', 'spicy chicken sandwich', 'healthy salad')."
    },
  },
  required: [
    "itemName", "description", "category", "dietaryTags", 
    "allergenWarnings", "suggestedPairings", "seoKeywords"
  ]
};


export const extractMenuMetadata = async (
  base64Image: string,
  mimeType: string
): Promise<MenuItemMetadata> => {
  const prompt = `You are an expert catalog manager for a food delivery service like DoorDash. Your task is to analyze the image of this menu item and extract detailed, structured metadata. Provide the data in the requested JSON format. The item's name might be visible in the image, or you may need to infer it from the dish's appearance. Use your expertise to generate compelling descriptions and useful tags.`;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
          parts: [
            {
              inlineData: {
                data: base64Image,
                mimeType: mimeType,
              },
            },
            { text: prompt },
          ],
        },
        config: {
          responseMimeType: 'application/json',
          responseSchema: schema,
        },
    });

    const jsonText = response.text.trim();
    const data = JSON.parse(jsonText);
    
    // Simple validation to ensure the parsed object fits the expected structure
    if (!data.itemName || !data.description) {
        throw new Error("Received incomplete data from the API.");
    }

    return data as MenuItemMetadata;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        throw new Error(`Gemini API Error: ${error.message}`);
    }
    throw new Error("An unknown error occurred while communicating with the Gemini API.");
  }
};