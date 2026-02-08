
export interface Recipe {
  id: string;
  title: string;
  origin: string;
  culturalStory: string;
  summary: string;
  prepTime: number;
  ingredientsNeeded: string[];
  link: string;
  imagePlaceholder: string;
}

export interface Restaurant {
  name: string;
  cuisine: string;
  uri: string;
  rating?: number;
  summary?: string;
}

export interface SearchState {
  ingredients: string[];
  appliances: string[];
  maxTime: number;
}
