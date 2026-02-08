
import React, { useState, useEffect, useCallback } from 'react';
import { Search, ChevronRight, Clock, MapPin, Heart, Utensils, BookOpen, User, ArrowRight } from 'lucide-react';
import { COMMON_INGREDIENTS, COMMON_APPLIANCES } from './constants';
import { Recipe, Restaurant, SearchState } from './types';
import { getCulturalRecipes, getNearbyRestaurants } from './services/geminiService';

const App: React.FC = () => {
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [appliances, setAppliances] = useState<string[]>([]);
  const [maxTime, setMaxTime] = useState(60);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<'home' | 'results'>('home');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.error("Geolocation error:", err)
      );
    }
  }, []);

  const toggleIngredient = (ing: string) => {
    setIngredients(prev => prev.includes(ing) ? prev.filter(i => i !== ing) : [...prev, ing]);
  };

  const toggleAppliance = (app: string) => {
    setAppliances(prev => prev.includes(app) ? prev.filter(a => a !== app) : [...prev, app]);
  };

  const handleSearch = async () => {
    if (ingredients.length === 0) {
      alert("Please select at least one ingredient!");
      return;
    }

    setLoading(true);
    setView('results');
    
    try {
      const foundRecipes = await getCulturalRecipes({ ingredients, appliances, maxTime });
      setRecipes(foundRecipes);

      if (userLocation && foundRecipes.length > 0) {
        const cuisines = Array.from(new Set(foundRecipes.map(r => r.origin)));
        const nearby = await getNearbyRestaurants(userLocation.lat, userLocation.lng, cuisines);
        setRestaurants(nearby);
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredIngredients = COMMON_INGREDIENTS.filter(ing => 
    ing.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="bg-[#7c2d12] text-white py-6 px-4 shadow-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('home')}>
            <Utensils className="w-8 h-8 text-[#f59e0b]" />
            <h1 className="text-2xl font-bold tracking-tight">Roots & Recipes</h1>
          </div>
          <p className="hidden md:block text-sm italic opacity-80 serif">"Preserving heritage through the universal language of food."</p>
          <div className="bg-white/10 p-2 rounded-full cursor-pointer hover:bg-white/20 transition">
             <BookOpen className="w-5 h-5" />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {view === 'home' ? (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Intro Section */}
            <section className="text-center space-y-4 py-8">
              <h2 className="text-4xl md:text-5xl font-bold text-[#431407]">What's in your kitchen today?</h2>
              <p className="text-gray-600 max-w-xl mx-auto leading-relaxed">
                Take a moment to slow down. Tell us what you have, and we'll help you commemorate those who came before us through dishes that tell a story.
              </p>
            </section>

            {/* Selection Grid */}
            <div className="grid md:grid-cols-2 gap-8">
              {/* Ingredients Card */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-orange-100 flex flex-col h-[500px]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold flex items-center gap-2 text-[#7c2d12]">
                    <Search className="w-5 h-5" /> Ingredients
                  </h3>
                  <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full font-medium">
                    {ingredients.length} Selected
                  </span>
                </div>
                
                <div className="relative mb-4">
                  <input 
                    type="text" 
                    placeholder="Search ingredients..." 
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#7c2d12]/20"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                </div>

                <div className="flex-1 overflow-y-auto pr-2 space-y-1 custom-scrollbar">
                  {filteredIngredients.length > 0 ? filteredIngredients.map(ing => (
                    <label 
                      key={ing} 
                      className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                        ingredients.includes(ing) ? 'bg-orange-50 border-orange-200' : 'hover:bg-gray-50 border-transparent'
                      } border`}
                    >
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 rounded text-[#7c2d12] focus:ring-[#7c2d12]" 
                        checked={ingredients.includes(ing)}
                        onChange={() => toggleIngredient(ing)}
                      />
                      <span className="text-gray-700 font-medium">{ing}</span>
                    </label>
                  )) : (
                    <div className="text-center py-10 text-gray-400 italic">No matches found. Try something else?</div>
                  )}
                </div>
                <div className="mt-4 text-xs text-gray-400 italic">
                  * We assume you already have pantry staples like oils, salt, and spices.
                </div>
              </div>

              {/* Appliances & Time Card */}
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-orange-100">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-[#7c2d12]">
                    <Utensils className="w-5 h-5" /> Appliances
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {COMMON_APPLIANCES.map(app => (
                      <button
                        key={app}
                        onClick={() => toggleAppliance(app)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                          appliances.includes(app) 
                            ? 'bg-[#7c2d12] text-white shadow-md' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {app}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-orange-100">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold flex items-center gap-2 text-[#7c2d12]">
                      <Clock className="w-5 h-5" /> Max Cooking Time
                    </h3>
                    <span className="text-lg font-bold text-[#7c2d12]">{maxTime} min</span>
                  </div>
                  <input 
                    type="range" 
                    min="15" 
                    max="180" 
                    step="15"
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#7c2d12]"
                    value={maxTime}
                    onChange={(e) => setMaxTime(parseInt(e.target.value))}
                  />
                  <div className="flex justify-between mt-2 text-xs text-gray-400">
                    <span>15m</span>
                    <span>3h+</span>
                  </div>
                </div>

                <button 
                  onClick={handleSearch}
                  disabled={ingredients.length === 0}
                  className="w-full bg-[#f59e0b] hover:bg-[#d97706] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-6 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3 text-xl group"
                >
                  Discover Recipes <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-12 animate-in fade-in duration-500">
            {/* Results Top Bar */}
            <div className="flex items-center justify-between border-b pb-4">
              <button 
                onClick={() => setView('home')}
                className="text-[#7c2d12] font-semibold flex items-center gap-1 hover:underline"
              >
                ← Back to Pantry
              </button>
              <h2 className="text-2xl font-bold text-[#431407]">Preserving Your Heritage</h2>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <div className="w-12 h-12 border-4 border-[#7c2d12] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-500 font-medium italic animate-pulse">Sourcing stories from the past...</p>
              </div>
            ) : (
              <>
                {/* Recipes Section */}
                <section className="space-y-8">
                  <div className="flex items-center gap-2">
                    <Heart className="w-6 h-6 text-red-500 fill-red-500" />
                    <h3 className="text-2xl font-bold">Recommended Traditions</h3>
                  </div>
                  
                  <div className="grid gap-8">
                    {recipes.map((recipe, idx) => (
                      <div key={recipe.id} className="bg-white rounded-3xl shadow-lg overflow-hidden border border-orange-100 flex flex-col md:flex-row group hover:shadow-2xl transition-all duration-300">
                        <div className="md:w-1/3 relative overflow-hidden">
                          <img 
                            src={recipe.imagePlaceholder} 
                            alt={recipe.title} 
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-[#7c2d12] shadow-sm">
                            {recipe.origin}
                          </div>
                        </div>
                        <div className="md:w-2/3 p-8 space-y-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="text-3xl font-bold text-[#431407] serif">{recipe.title}</h4>
                              <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                                <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {recipe.prepTime} mins</span>
                                <span>•</span>
                                <span className="capitalize">{recipe.ingredientsNeeded.length} main ingredients</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="bg-orange-50 p-4 rounded-xl border-l-4 border-orange-400">
                            <h5 className="text-xs uppercase font-bold text-orange-800 tracking-wider mb-1">The Heritage Story</h5>
                            <p className="text-gray-700 italic leading-relaxed text-sm">
                              "{recipe.culturalStory}"
                            </p>
                          </div>

                          <div className="space-y-2">
                            <h5 className="text-sm font-bold text-gray-800">Chef's Summary</h5>
                            <p className="text-gray-600 text-sm leading-relaxed">{recipe.summary}</p>
                          </div>

                          <div className="pt-4 flex items-center justify-between">
                            <a 
                              href={recipe.link} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 text-[#7c2d12] font-bold hover:gap-3 transition-all"
                            >
                              View Full Recipe & History <ChevronRight className="w-5 h-5" />
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Restaurants Section */}
                {restaurants.length > 0 && (
                  <section className="bg-[#7c2d12]/5 p-8 rounded-3xl border border-[#7c2d12]/10 space-y-8">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-6 h-6 text-[#7c2d12]" />
                        <h3 className="text-2xl font-bold text-[#431407]">Support Local Heritage</h3>
                      </div>
                      <span className="text-xs font-bold text-[#7c2d12] bg-[#7c2d12]/10 px-3 py-1 rounded-full">NEAR YOU</span>
                    </div>
                    
                    <p className="text-gray-600">
                      Don't feel like cooking? Support small businesses in your community that keep these cultural flavors alive.
                    </p>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {restaurants.map((place, idx) => (
                        <a 
                          key={idx} 
                          href={place.uri} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="bg-white p-5 rounded-2xl shadow-sm border border-orange-100 hover:shadow-md transition group"
                        >
                          <h5 className="font-bold text-[#431407] group-hover:text-[#7c2d12] transition">{place.name}</h5>
                          <p className="text-sm text-gray-500 mb-2">{place.cuisine}</p>
                          <div className="text-xs text-gray-400 line-clamp-2">{place.summary}</div>
                          <div className="mt-4 flex items-center text-[#7c2d12] text-xs font-bold">
                            View on Maps <ChevronRight className="w-3 h-3 ml-1" />
                          </div>
                        </a>
                      ))}
                    </div>
                  </section>
                )}
              </>
            )}
          </div>
        )}
      </main>

      {/* Footer Navigation (Mobile) */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t py-3 md:hidden px-8 flex justify-between items-center z-50">
        <button onClick={() => setView('home')} className="flex flex-col items-center gap-1">
          <Utensils className={`w-6 h-6 ${view === 'home' ? 'text-[#7c2d12]' : 'text-gray-400'}`} />
          <span className={`text-[10px] font-bold ${view === 'home' ? 'text-[#7c2d12]' : 'text-gray-400'}`}>PANTRY</span>
        </button>
        <button className="flex flex-col items-center gap-1 opacity-50">
          <Heart className="w-6 h-6 text-gray-400" />
          <span className="text-[10px] font-bold text-gray-400">FAVES</span>
        </button>
        <button className="flex flex-col items-center gap-1 opacity-50">
          <User className="w-6 h-6 text-gray-400" />
          <span className="text-[10px] font-bold text-gray-400">PROFILE</span>
        </button>
      </footer>
    </div>
  );
};

export default App;
