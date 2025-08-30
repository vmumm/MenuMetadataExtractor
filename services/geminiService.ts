import { GoogleGenAI, Type } from "@google/genai";
import type { MenuItemMetadata } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const baseSchema = {
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
  base64Image: string | null,
  mimeType: string | null,
  itemName?: string,
  description?: string
): Promise<MenuItemMetadata> => {
  const promptParts: string[] = [
    `You are an expert catalog manager for a food delivery service like DoorDash. Your task is to generate detailed, structured metadata for a menu item based on the information provided. Provide the data in the requested JSON format. Use your expertise to generate compelling descriptions and useful tags.`
  ];

  if (itemName && description) {
    promptParts.push(`The user has provided the following name and description. Use them as the ground truth for those fields. Item Name: "${itemName}". Description: "${description}".`);
  } else if (itemName) {
    promptParts.push(`The user has provided the item name. Use it as the ground truth for that field and generate a compelling description based on it. Item Name: "${itemName}".`);
  } else if (description) {
    promptParts.push(`The user has provided the description. Use it as the ground truth for that field and infer a suitable item name. Description: "${description}".`);
  }

  if (base64Image) {
    promptParts.push(`Use the provided image as a visual reference to enhance the accuracy and richness of all generated metadata fields.`);
  } else {
    promptParts.push(`Generate the metadata based only on the provided text.`);
  }

  const prompt = promptParts.join('\n\n');
  
  // The type for the parts array in the contents object
  const contentParts: { text: string }[] | ({ inlineData: { data: string; mimeType: string; }} | { text: string })[] = [{ text: prompt }];

  if (base64Image && mimeType) {
    (contentParts as ({ inlineData: { data: string; mimeType: string; }} | { text: string })[]).unshift({
      inlineData: {
        data: base64Image,
        mimeType: mimeType,
      },
    });
  }
  
  // Dynamically build the schema to exclude user-provided fields from Gemini's task.
  const schema = JSON.parse(JSON.stringify(baseSchema));

  if (itemName && itemName.trim()) {
    delete schema.properties.itemName;
    schema.required = schema.required.filter((prop: string) => prop !== 'itemName');
  }
  if (description && description.trim()) {
    delete schema.properties.description;
    schema.required = schema.required.filter((prop: string) => prop !== 'description');
  }

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
          parts: contentParts,
        },
        config: {
          responseMimeType: 'application/json',
          responseSchema: schema,
        },
    });

    const jsonText = response.text.trim();
    const data = JSON.parse(jsonText);
    
    // Re-insert the user-provided fields to ensure they are the source of truth.
    if (itemName && itemName.trim()) {
      data.itemName = itemName;
    }
    if (description && description.trim()) {
      data.description = description;
    }
    
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