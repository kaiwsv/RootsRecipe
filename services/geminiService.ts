
import { GoogleGenAI, Type } from "@google/genai";
import { Recipe, Restaurant, SearchState } from "../types";

export const getCulturalRecipes = async (state: SearchState): Promise<Recipe[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const prompt = `Act as a culinary historian and master chef. Given these ingredients: ${state.ingredients.join(", ")}, 
  available appliances: ${state.appliances.join(", ")}, and a max prep time of ${state.maxTime} minutes, 
  recommend 3 culturally significant recipes (especially from marginalized or immigrant communities, or UNESCO Intangible Cultural Heritage foods).
  For each recipe, provide:
  1. A title.
  2. Its country/culture of origin.
  3. The deep cultural story or tradition behind the dish.
  4. A short AI summary of how to make it.
  5. The preparation time (within the limit).
  6. A list of key ingredients needed from the user's list.
  7. A realistic external link to a recipe blog or documentation (e.g., NYT Cooking, UNESCO, or cultural blogs).`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              origin: { type: Type.STRING },
              culturalStory: { type: Type.STRING },
              summary: { type: Type.STRING },
              prepTime: { type: Type.NUMBER },
              ingredientsNeeded: { type: Type.ARRAY, items: { type: Type.STRING } },
              link: { type: Type.STRING }
            },
            required: ["title", "origin", "culturalStory", "summary", "prepTime", "ingredientsNeeded", "link"]
          }
        }
      }
    });

    const data = JSON.parse(response.text || "[]");
    return data.map((r: any, idx: number) => ({
      ...r,
      id: `recipe-${idx}`,
      imagePlaceholder: `https://picsum.photos/seed/${idx + 50}/600/400`
    }));
  } catch (error) {
    console.error("Error fetching recipes:", error);
    return [];
  }
};

export const getNearbyRestaurants = async (lat: number, lng: number, cuisines: string[]): Promise<Restaurant[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const cuisineStr = cuisines.join(" or ");
  const prompt = `Find highly-rated local restaurants specializing in ${cuisineStr} near these coordinates. 
  Prioritize small, family-owned, or immigrant-owned businesses. Provide their name, cuisine type, and a brief description.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: { latitude: lat, longitude: lng }
          }
        }
      }
    });

    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const restaurants: Restaurant[] = [];

    chunks.forEach((chunk: any) => {
      if (chunk.maps) {
        restaurants.push({
          name: chunk.maps.title || "Unknown Local Spot",
          uri: chunk.maps.uri || "#",
          cuisine: cuisineStr,
          summary: "Check out this local business in your community."
        });
      }
    });

    return restaurants.slice(0, 5);
  } catch (error) {
    console.error("Error fetching restaurants:", error);
    return [];
  }
};
