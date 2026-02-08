
import { GoogleGenAI } from "@google/genai";
import { Recipe, RecipeResult, SearchState } from "../types";

export const getCulturalRecipesWithSearch = async (
  state: SearchState, 
  existingRecipes: string[] = []
): Promise<RecipeResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const cultureQuery = state.cultures.length > 0 ? `specifically from ${state.cultures.join(" or ")} heritage` : "from diverse global heritage";
  const excludeQuery = existingRecipes.length > 0 ? `DO NOT include any of the following recipes: ${existingRecipes.join(", ")}.` : "";
  const count = existingRecipes.length > 0 ? 6 : 3;

  const prompt = `Search the web for real, authentic, and currently live recipes ${cultureQuery} that can be made using these core ingredients: ${state.ingredients.join(", ")}. 
  The user has access to these appliances: ${state.appliances.join(", ")}. 
  Crucially, ensure the recipes can be prepared in under ${state.maxTime} minutes.
  ${excludeQuery}
  
  Please return exactly ${count} recipes. You MUST verify that the SOURCE_URL is currently active and reachable.
  
  For EACH recipe, use this EXACT delimiter-based format:
  
  [RECIPE_START]
  NAME: [Name of the dish]
  HERITAGE: [Specific community/culture]
  SUMMARY: [Provide 2-3 COMPLETE sentences describing the dish. Do not truncate.]
  HISTORY: [A detailed section on cultural significance and history. Use COMPLETE sentences. Do not truncate.]
  INGREDIENTS_USED: [List ALL ingredients required with exact measurements/quantities, separated by semicolons]
  APPLIANCES_USED: [List all kitchen tools and appliances used, separated by semicolons]
  TIME_ESTIMATE: [Minutes only, as a number]
  SOURCE_URL: [The exact URL of the recipe found]
  THUMBNAIL_URL: [Find the actual direct image link (like the og:image or the main featured image) from the specific recipe article found at SOURCE_URL. If you cannot find a direct, valid image URL for this specific article, leave this blank. DO NOT use generic placeholders or the same image for different recipes.]
  [RECIPE_END]
  
  Be authentic and specific. We want real links to real heritage cooking.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || "";
    const recipes: Recipe[] = [];
    
    const recipeBlocks = text.split('[RECIPE_START]');
    recipeBlocks.shift();

    recipeBlocks.forEach(block => {
      const content = block.split('[RECIPE_END]')[0];
      const lines = content.trim().split('\n');
      
      const recipe: Partial<Recipe> = {};
      
      lines.forEach(line => {
        if (line.startsWith('NAME:')) recipe.name = line.replace('NAME:', '').trim();
        if (line.startsWith('HERITAGE:')) recipe.heritage = line.replace('HERITAGE:', '').trim();
        if (line.startsWith('SUMMARY:')) recipe.summary = line.replace('SUMMARY:', '').trim();
        if (line.startsWith('HISTORY:')) recipe.history = line.replace('HISTORY:', '').trim();
        if (line.startsWith('INGREDIENTS_USED:')) recipe.ingredients = line.replace('INGREDIENTS_USED:', '').split(';').map(i => i.trim()).filter(i => i);
        if (line.startsWith('APPLIANCES_USED:')) recipe.appliances = line.replace('APPLIANCES_USED:', '').split(';').map(i => i.trim()).filter(i => i);
        if (line.startsWith('TIME_ESTIMATE:')) recipe.time = line.replace('TIME_ESTIMATE:', '').trim();
        if (line.startsWith('SOURCE_URL:')) recipe.sourceUrl = line.replace('SOURCE_URL:', '').trim();
        if (line.startsWith('THUMBNAIL_URL:')) {
          const val = line.replace('THUMBNAIL_URL:', '').trim();
          if (val && (val.startsWith('http') || val.startsWith('https'))) {
            // Clean up common issues like markdown formatting if the AI hallucinated it
            recipe.thumbnailUrl = val.replace(/[()]/g, '');
          }
        }
      });

      if (recipe.name) {
        recipes.push(recipe as Recipe);
      }
    });

    const sources: { title: string; uri: string }[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    chunks.forEach((chunk: any) => {
      if (chunk.web && chunk.web.uri) {
        sources.push({ title: chunk.web.title || "Recipe Source", uri: chunk.web.uri });
      }
    });

    return {
      recipes,
      sources: sources.filter((v, i, a) => a.findIndex(t => t.uri === v.uri) === i)
    };
  } catch (error) {
    console.error("Error fetching recipes:", error);
    return { recipes: [], sources: [] };
  }
};
