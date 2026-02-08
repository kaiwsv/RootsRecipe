
import React, { useState, useMemo, useEffect } from 'react';
import { Search, Clock, Utensils, BookOpen, ArrowRight, Globe, ScrollText, ExternalLink, Plus, Leaf, Soup, Wheat, Wine, History, ChevronRight, Check, Flame, Hammer } from 'lucide-react';
import { COMMON_INGREDIENTS, COOKING_APPLIANCES, PROCESSING_TOOLS, COMMON_CULTURES } from './constants';
import { RecipeResult, SearchState, Recipe } from './types';
import { getCulturalRecipesWithSearch } from './services/geminiService';
import { fetchLinkMetadata, LinkMetadata } from './services/linkPreviewService';

const RecipeCard: React.FC<{ recipe: Recipe; index: number }> = ({ recipe, index }) => {
  const [metadata, setMetadata] = useState<LinkMetadata | null>(null);
  const [loadingMetadata, setLoadingMetadata] = useState(true);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadMetadata = async () => {
      setLoadingMetadata(true);
      try {
        const data = await fetchLinkMetadata(recipe.sourceUrl);
        if (isMounted) {
          setMetadata(data);
        }
      } catch (e) {
        console.error("Card metadata error", e);
      } finally {
        if (isMounted) {
          setLoadingMetadata(false);
        }
      }
    };
    loadMetadata();
    return () => { isMounted = false; };
  }, [recipe.sourceUrl]);

  // Priority: 1. Live Scraped Image, 2. AI Found Image, 3. Pattern Fallback
  const displayImage = metadata?.images?.[0] || recipe.thumbnailUrl;
  const favicon = metadata?.favicons?.[0] || `https://www.google.com/s2/favicons?domain=${new URL(recipe.sourceUrl).hostname}&sz=64`;

  return (
    <div 
      className="bg-white rounded-[2.5rem] shadow-xl border border-emerald-50 overflow-hidden flex flex-col group hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 animate-in fade-in slide-in-from-bottom-8"
      style={{ animationDelay: `${index * 150}ms` }}
    >
      {/* Hero Header Section */}
      <div className="h-64 relative overflow-hidden bg-emerald-50">
        {displayImage && !imgError ? (
          <img 
            src={displayImage} 
            alt={recipe.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full bg-[#064e3b] flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
             {/* Decorative pattern for cards without images */}
             <div className="absolute inset-0 opacity-10 pointer-events-none grid grid-cols-4 gap-4 p-4">
                {[...Array(16)].map((_, i) => (
                  <div key={i} className="border border-white rounded-full aspect-square" />
                ))}
             </div>
             <ScrollText size={64} className="text-white/20 mb-4 relative z-10" />
             <h3 className="text-white text-xl font-bold serif relative z-10 leading-tight">
               {recipe.name}
             </h3>
          </div>
        )}
        
        {/* Shimmer overlay while loading metadata */}
        {loadingMetadata && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[pulse_2s_infinite] pointer-events-none" />
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent pointer-events-none" />
        <div className="absolute bottom-4 left-6 right-4 flex items-end justify-between pointer-events-none">
          <div className="flex-1">
            <span className="bg-[#10b981] text-white text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full shadow-lg">
              {recipe.heritage}
            </span>
            {displayImage && !imgError && (
              <h3 className="text-white text-xl md:text-2xl font-bold serif mt-2 leading-tight drop-shadow-md">
                {recipe.name}
              </h3>
            )}
          </div>
        </div>
      </div>

      {/* Attribution Bar */}
      <div className="px-6 py-3 bg-gray-50/50 border-b border-emerald-50 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 overflow-hidden">
          <img src={favicon} alt="" className="w-4 h-4 rounded-sm flex-shrink-0" />
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider truncate">
            {new URL(recipe.sourceUrl).hostname.replace('www.', '')}
          </span>
        </div>
        {loadingMetadata && <div className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />}
      </div>

      {/* Main Card Content */}
      <div className="p-6 flex-1 flex flex-col space-y-6">
        <div className="space-y-2">
           <h4 className="flex items-center gap-2 text-[10px] font-bold text-emerald-800 uppercase tracking-widest"><BookOpen className="w-3.5 h-3.5" /> Summary</h4>
           <p className="text-gray-700 text-sm italic leading-relaxed line-clamp-3">{recipe.summary}</p>
        </div>
        
        <div className="bg-emerald-50/40 p-5 rounded-[2rem] border border-emerald-100/50 shadow-inner">
           <h4 className="flex items-center gap-2 text-[10px] font-bold text-emerald-800 uppercase tracking-widest mb-2"><History className="w-3.5 h-3.5" /> Cultural Significance</h4>
           <p className="text-gray-700 text-xs leading-relaxed line-clamp-4">{recipe.history}</p>
        </div>

        <div className="flex-1 space-y-6">
          <div className="space-y-3">
            <h4 className="text-[#064e3b] font-bold text-[10px] uppercase tracking-widest flex items-center gap-2">
              <Search className="w-3.5 h-3.5" /> Ingredients
            </h4>
            <ul className="space-y-1.5 pl-1 max-h-32 overflow-y-auto custom-scrollbar">
              {recipe.ingredients.map((ing, i) => (
                <li key={i} className="flex items-start gap-2 text-[11px] text-gray-600">
                  <Check className="w-3 h-3 text-[#10b981] mt-0.5 flex-shrink-0" />
                  <span>{ing}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="text-[#064e3b] font-bold text-[10px] uppercase tracking-widest flex items-center gap-2">
              <Utensils className="w-3.5 h-3.5" /> Tools
            </h4>
            <div className="flex flex-wrap gap-1.5 pl-1">
              {recipe.appliances.map((app, i) => (
                <span key={i} className="bg-white text-emerald-800 text-[10px] px-3 py-1 rounded-lg border border-emerald-100 shadow-sm font-medium">
                  {app}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-6 border-t border-emerald-50 mt-auto">
          <span className="text-[#064e3b] text-sm font-bold flex items-center gap-2">
            <Clock className="w-4 h-4" /> {recipe.time} Minutes
          </span>
          <a 
            href={recipe.sourceUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="bg-[#064e3b] text-white px-5 py-2.5 rounded-full text-xs font-bold hover:bg-[#10b981] transition-all flex items-center gap-2 shadow-lg hover:shadow-emerald-900/20"
          >
            Visit Article <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [customIngredients, setCustomIngredients] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [cultures, setCultures] = useState<string[]>([]);
  const [customCultures, setCustomCultures] = useState<string[]>([]);
  const [cultureSearchTerm, setCultureSearchTerm] = useState('');
  
  const [appliances, setAppliances] = useState<string[]>(["Stove"]);
  const [maxTime, setMaxTime] = useState(45);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [sources, setSources] = useState<{title: string, uri: string}[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [view, setView] = useState<'home' | 'results'>('home');

  const toggleSelection = (item: string, list: string[], setter: (val: string[]) => void) => {
    setter(list.includes(item) ? list.filter(i => i !== item) : [...list, item]);
  };

  const handleAddCustomCulture = () => {
    if (cultureSearchTerm && !cultures.includes(cultureSearchTerm) && !COMMON_CULTURES.includes(cultureSearchTerm)) {
      setCustomCultures(prev => [...prev, cultureSearchTerm]);
      setCultures(prev => [...prev, cultureSearchTerm]);
      setCultureSearchTerm('');
    }
  };

  const handleAddCustomIngredient = () => {
    if (searchTerm && !ingredients.includes(searchTerm) && !COMMON_INGREDIENTS.includes(searchTerm)) {
      setCustomIngredients(prev => [...prev, searchTerm]);
      setIngredients(prev => [...prev, searchTerm]);
      setSearchTerm('');
    }
  };

  const handleSearch = async () => {
    if (ingredients.length === 0) {
      alert("Please select at least one ingredient to begin your journey.");
      return;
    }

    setLoading(true);
    setView('results');
    
    try {
      const searchResult = await getCulturalRecipesWithSearch({ 
        ingredients, 
        appliances, 
        cultures, 
        maxTime 
      });
      setRecipes(searchResult.recipes);
      setSources(searchResult.sources);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = async () => {
    setLoadingMore(true);
    try {
      const existingNames = recipes.map(r => r.name);
      const searchResult = await getCulturalRecipesWithSearch({ 
        ingredients, 
        appliances, 
        cultures, 
        maxTime 
      }, existingNames);
      
      setRecipes(prev => [...prev, ...searchResult.recipes]);
      setSources(prev => [...prev, ...searchResult.sources]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMore(false);
    }
  };

  const allAvailableCultures = useMemo(() => [...new Set([...COMMON_CULTURES, ...customCultures])], [customCultures]);
  const allAvailableIngredients = useMemo(() => [...new Set([...COMMON_INGREDIENTS, ...customIngredients])], [customIngredients]);

  const filteredCultures = allAvailableCultures.filter(culture => 
    culture.toLowerCase().includes(cultureSearchTerm.toLowerCase())
  );

  const filteredIngredients = allAvailableIngredients.filter(ing => 
    ing.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#fcfaf7] relative overflow-hidden font-sans">
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <Leaf className="absolute -top-10 -left-10 w-64 h-64 text-emerald-900/5 rotate-12" />
        <Soup className="absolute top-1/4 -right-20 w-80 h-80 text-emerald-900/5 -rotate-12" />
        <Wheat className="absolute bottom-1/4 -left-20 w-72 h-72 text-emerald-900/5 rotate-45" />
        <Wine className="absolute -bottom-10 -right-10 w-64 h-64 text-emerald-900/5 -rotate-12" />
        <Utensils className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] text-emerald-900/[0.02] pointer-events-none" />
      </div>

      <header className="bg-[#064e3b] text-white py-6 px-4 shadow-lg sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setView('home')}>
            <div className="bg-[#10b981] p-2 rounded-lg group-hover:rotate-12 transition-transform shadow-inner">
              <ScrollText className="w-6 h-6 text-[#064e3b]" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight serif text-emerald-50">Roots & Recipes</h1>
          </div>
          <p className="hidden md:block text-sm italic opacity-80 serif text-emerald-100">Commemorating heritage through food.</p>
          <div className="w-10"></div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 flex-1 w-full relative z-10">
        {view === 'home' ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <section className="text-center space-y-3 py-6">
              <h2 className="text-4xl md:text-5xl font-bold text-[#064e3b] serif text-emerald-950">Gather Your Roots</h2>
              <p className="text-gray-600 max-w-xl mx-auto leading-relaxed italic">
                Pick a culture of food to explore. Select your ingredients and we'll find authentic recipes that tell a story.
              </p>
            </section>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl shadow-xl border border-emerald-100 flex flex-col h-[480px]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold flex items-center gap-2 text-[#064e3b] serif"><Globe className="w-5 h-5" /> 1. Heritage & Culture</h3>
                  <span className="text-xs bg-[#064e3b] text-white px-3 py-1 rounded-full font-bold">{cultures.length}</span>
                </div>
                <div className="relative mb-4 flex gap-2">
                  <div className="relative flex-1">
                    <input type="text" placeholder="Search or add culture..." className="w-full pl-10 pr-4 py-2 bg-gray-50/50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#064e3b]/20" value={cultureSearchTerm} onChange={(e) => setCultureSearchTerm(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddCustomCulture()} />
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto pr-2 space-y-1 custom-scrollbar">
                  {filteredCultures.map(culture => (
                    <label key={culture} className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${cultures.includes(culture) ? 'bg-emerald-50 border-emerald-200 shadow-sm' : 'hover:bg-gray-50 border-transparent'} border`}>
                      <input type="checkbox" className="w-4 h-4 rounded text-[#064e3b]" checked={cultures.includes(culture)} onChange={() => toggleSelection(culture, cultures, setCultures)} />
                      <span className="text-gray-700 font-medium">{culture}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl shadow-xl border border-emerald-100 flex flex-col h-[480px]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold flex items-center gap-2 text-[#064e3b] serif"><Search className="w-5 h-5" /> 2. The Pantry</h3>
                  <span className="text-xs bg-[#064e3b] text-white px-3 py-1 rounded-full font-bold">{ingredients.length}</span>
                </div>
                <div className="relative mb-4 flex gap-2">
                  <div className="relative flex-1">
                    <input type="text" placeholder="Search or add ingredient..." className="w-full pl-10 pr-4 py-2 bg-gray-50/50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#064e3b]/20" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddCustomIngredient()} />
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto pr-2 space-y-1 custom-scrollbar">
                  {filteredIngredients.map(ing => (
                    <label key={ing} className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${ingredients.includes(ing) ? 'bg-emerald-50 border-emerald-200 shadow-sm' : 'hover:bg-gray-50 border-transparent'} border`}>
                      <input type="checkbox" className="w-4 h-4 rounded text-[#064e3b]" checked={ingredients.includes(ing)} onChange={() => toggleSelection(ing, ingredients, setIngredients)} />
                      <span className="text-gray-700 font-medium">{ing}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-sm p-8 rounded-[2.5rem] shadow-xl border border-emerald-100 space-y-8">
              <h3 className="text-2xl font-bold text-[#064e3b] serif border-b border-emerald-100 pb-4">3. Kitchen Setup</h3>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h4 className="flex items-center gap-2 text-sm font-bold text-[#064e3b] uppercase tracking-widest"><Flame className="w-4 h-4" /> Heat & Cooking</h4>
                  <div className="flex flex-wrap gap-2">
                    {COOKING_APPLIANCES.map(app => (
                      <button key={app} onClick={() => toggleSelection(app, appliances, setAppliances)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${appliances.includes(app) ? 'bg-[#064e3b] text-white shadow-md' : 'bg-gray-100/80 text-gray-600 hover:bg-gray-200/80'}`}>
                        {app}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="flex items-center gap-2 text-sm font-bold text-[#064e3b] uppercase tracking-widest"><Hammer className="w-4 h-4" /> Preparation Tools</h4>
                  <div className="flex flex-wrap gap-2">
                    {PROCESSING_TOOLS.map(app => (
                      <button key={app} onClick={() => toggleSelection(app, appliances, setAppliances)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${appliances.includes(app) ? 'bg-[#064e3b] text-white shadow-md' : 'bg-gray-100/80 text-gray-600 hover:bg-gray-200/80'}`}>
                        {app}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="pt-4 border-t border-emerald-100">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold flex items-center gap-2 text-[#064e3b] serif"><Clock className="w-5 h-5" /> 4. Time Window</h3>
                  <span className="text-lg font-bold text-[#064e3b]">{maxTime} Minutes</span>
                </div>
                <input type="range" min="15" max="120" step="5" className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#064e3b]" value={maxTime} onChange={(e) => setMaxTime(parseInt(e.target.value))} />
              </div>
            </div>

            <div className="space-y-4">
              <button onClick={handleSearch} disabled={ingredients.length === 0} className="w-full relative overflow-hidden bg-[#10b981] hover:bg-[#059669] disabled:opacity-50 text-white font-bold py-10 rounded-[2.5rem] shadow-2xl transition-all flex items-center justify-center gap-4 text-3xl group z-20">
                <span className="relative z-10">Seek Authentic Flavors</span>
                <ArrowRight className="relative z-10 group-hover:translate-x-3 transition-transform w-10 h-10" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />
              </button>
              <p className="text-center text-gray-400 italic text-sm">* AI-powered heritage archive seeker.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            <div className="flex items-center justify-between border-b border-emerald-200 pb-6">
              <button onClick={() => setView('home')} className="text-[#064e3b] font-semibold flex items-center gap-2 hover:bg-emerald-50 px-5 py-2.5 rounded-full transition-all group">
                <ChevronRight className="w-5 h-5 rotate-180 group-hover:-translate-x-1 transition-transform" /> Return
              </button>
              <div className="text-right">
                <h2 className="text-3xl font-bold text-[#022c22] serif text-emerald-950">Heritage Discoveries</h2>
                <p className="text-emerald-700 text-sm italic">Showing {recipes.length} Cultural Traditions</p>
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-48 space-y-6">
                <div className="relative">
                  <div className="w-20 h-20 border-4 border-[#064e3b]/10 border-t-[#10b981] rounded-full animate-spin"></div>
                  <Globe className="absolute inset-0 m-auto w-8 h-8 text-[#064e3b] animate-pulse" />
                </div>
                <p className="text-[#064e3b] font-bold text-xl serif text-center">Unearthing archives...</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
                {recipes.map((recipe, idx) => (
                  <RecipeCard key={`${recipe.name}-${idx}`} recipe={recipe} index={idx} />
                ))}
              </div>
            )}

            {!loading && (
              <div className="flex flex-col items-center pt-16 space-y-12">
                <button 
                  onClick={handleLoadMore} 
                  disabled={loadingMore} 
                  className="bg-white hover:bg-emerald-50 text-[#064e3b] font-bold py-6 px-16 rounded-full border-2 border-[#064e3b] transition-all flex items-center gap-4 text-2xl shadow-xl disabled:opacity-50 group active:scale-95"
                >
                  {loadingMore ? (
                    <div className="w-8 h-8 border-2 border-[#064e3b]/20 border-t-[#064e3b] rounded-full animate-spin"></div>
                  ) : (
                    <Plus className="w-8 h-8 group-hover:rotate-90 transition-transform" />
                  )}
                  Load More Recipes
                </button>

                {sources.length > 0 && (
                  <div className="w-full bg-white/50 backdrop-blur-sm p-12 rounded-[3.5rem] border border-emerald-100 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <h4 className="text-[#064e3b] font-bold mb-8 flex items-center gap-3 serif text-3xl"><Globe className="w-8 h-8" /> Research Archives</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {sources.map((s, i) => (
                        <a key={i} href={s.uri} target="_blank" rel="noopener noreferrer" className="bg-white p-5 rounded-2xl border border-emerald-100 text-emerald-900 hover:border-[#10b981] hover:shadow-lg transition-all flex items-start gap-3 group">
                          <ExternalLink className="w-4 h-4 mt-1 opacity-40 group-hover:opacity-100 group-hover:text-[#10b981] flex-shrink-0" />
                          <span className="text-xs font-medium leading-relaxed group-hover:text-[#064e3b] line-clamp-2">{s.title}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="bg-[#022c22] text-white/80 py-16 px-4 mt-auto border-t border-white/10 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="flex items-center justify-center gap-3 text-[#10b981] mb-4">
             <div className="h-px w-8 bg-[#10b981]/30"></div>
             <h4 className="font-bold uppercase tracking-[0.2em] text-xs">Our Mission</h4>
             <div className="h-px w-8 bg-[#10b981]/30"></div>
          </div>
          <p className="max-w-3xl mx-auto italic leading-relaxed text-2xl serif text-white/90">
            "Roots & Recipes aims to bridge generations and preserve cultural heritage by transforming everyday ingredients into windows of the past. By honoring traditional techniques and stories, we ensure that no legacy is ever truly lost."
          </p>
          <div className="pt-8 text-white/40 text-[10px] flex flex-col items-center gap-2">
            <p>&copy; 2026 Roots & Recipes. Preserving the flavor of history.</p>
            <p className="uppercase tracking-widest opacity-60 font-bold">QWER Hacks 2026: Emilie Liao and Kai Wang</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
