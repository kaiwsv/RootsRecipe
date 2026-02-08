
export interface RecipeSource {
  title: string;
  uri: string;
}

export interface Recipe {
  name: string;
  heritage: string;
  summary: string;
  history: string;
  ingredients: string[];
  appliances: string[];
  time: string;
  sourceUrl: string;
  thumbnailUrl?: string;
}

export interface Business {
  name: string;
  heritage: string;
  summary: string;
  significance: string;
  address: string;
  website: string;
  thumbnailUrl?: string;
}

export interface RecipeResult {
  recipes: Recipe[];
  sources: RecipeSource[];
}

export interface BusinessResult {
  businesses: Business[];
  sources: RecipeSource[];
}

export interface SearchState {
  ingredients: string[];
  appliances: string[];
  cultures: string[];
  maxTime: number;
  zipCode?: string;
}
