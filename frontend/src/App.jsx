import { useState, useCallback, memo, lazy, Suspense } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Cake, Loader2, Image as ImageIcon, Sparkles, Zap, Star, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import PokemonSelector from './components/PokemonSelector';
import DessertSelector from './components/DessertSelector';
import RecipeCard from './components/RecipeCard';
import UsageDashboard from './components/UsageDashboard';
import { generateRecipe, listRecipes } from './services/api';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useWindowSize } from './hooks/useWindowSize';

// Lazy load RecipeDetail modal (only loaded when needed)
const RecipeDetail = lazy(() => import('./components/RecipeDetail'));

// Optimized React Query configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes - recipes don't change often
      cacheTime: 10 * 60 * 1000, // 10 minutes cache
      refetchOnWindowFocus: false, // Avoid unnecessary refetches
      retry: 1, // Only retry once on failure
    },
  },
});

// Optimized background stars - memoized component with pre-generated positions
const starPositions = Array.from({ length: 8 }, (_, i) => ({
  id: i,
  left: `${Math.random() * 100}%`,
  top: `${Math.random() * 100}%`,
  size: 8 + Math.random() * 12,
  delay: Math.random() * 2,
  duration: 2 + Math.random() * 2
}));

const BackgroundStars = memo(() => {
  return (
    <div className="fixed inset-0 pointer-events-none">
      {starPositions.map((star) => (
        <motion.div
          key={star.id}
          className="absolute text-poke-yellow will-change-transform"
          style={{ left: star.left, top: star.top }}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.3, 0.8, 0.3],
          }}
          transition={{
            duration: star.duration,
            repeat: Infinity,
            delay: star.delay,
          }}
        >
          <Star size={star.size} fill="currentColor" />
        </motion.div>
      ))}
    </div>
  );
});
BackgroundStars.displayName = 'BackgroundStars';

function AppContent() {
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [dessertPreferences, setDessertPreferences] = useState(null);
  const [generatedRecipe, setGeneratedRecipe] = useState(null);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [includeImage, setIncludeImage] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showUsageDashboard, setShowUsageDashboard] = useState(false);

  // Use optimized window size hook
  const windowSize = useWindowSize();

  // Fetch saved recipes
  const { data: savedRecipes, refetch: refetchRecipes } = useQuery({
    queryKey: ['recipes'],
    queryFn: () => listRecipes(0, 10),
  });

  // Generate recipe mutation
  const generateMutation = useMutation({
    mutationFn: ({ pokemonId, generateImage }) =>
      generateRecipe(pokemonId, dessertPreferences, generateImage),
    onSuccess: (data) => {
      setGeneratedRecipe(data);
      refetchRecipes();
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
    },
  });

  const handlePokemonSelect = useCallback((pokemon) => {
    setSelectedPokemon(pokemon);
    setDessertPreferences(null);
    setGeneratedRecipe(null);
  }, []);

  const handleGenerateRecipe = useCallback(() => {
    if (selectedPokemon) {
      generateMutation.mutate({
        pokemonId: selectedPokemon.id,
        generateImage: includeImage
      });
    }
  }, [selectedPokemon, includeImage, generateMutation]);

  return (
    <div className="min-h-screen pokeball-bg bg-gradient-to-br from-poke-blue via-poke-purple to-poke-pink relative overflow-hidden">
      {/* Confetti Effect - Optimized */}
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={100}
          gravity={0.3}
          colors={['#EE1515', '#FFDE00', '#3B4CCA', '#00A650', '#FF6B00']}
        />
      )}

      {/* Animated Background Stars - Optimized */}
      <BackgroundStars />

      {/* Header - Pokedex Style */}
      <motion.header
        className="bg-gradient-to-r from-pokedex-red to-poke-red shadow-retro-lg border-b-8 border-pokedex-dark relative z-10"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
      >
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center gap-4 mb-2">
            {/* Pokedex Light */}
            <div
              className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border-4 border-white shadow-pokeball relative"
            >
              <div className="absolute inset-2 rounded-full bg-white opacity-50"></div>
            </div>

            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-pokemon text-white drop-shadow-lg tracking-wider">
                POKESWEETS
              </h1>
            </div>

          </div>
          <div className="flex items-center justify-center gap-2 mt-2">
            <Cake className="text-poke-yellow" size={20} />
            <p className="font-pixel text-lg text-poke-yellow">
              Generador Pokédex de Postres
            </p>
            <Sparkles className="text-poke-yellow" size={20} />
          </div>
        </div>
      </motion.header>

      <main className="container mx-auto px-4 py-8 relative z-10">
        {/* Usage Dashboard Button */}
        <motion.div
          className="mb-8 flex justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <motion.button
            onClick={() => setShowUsageDashboard(true)}
            className="retro-btn bg-gradient-to-r from-poke-green to-poke-blue text-white px-6 py-4 rounded-xl border-4 border-pokedex-dark shadow-retro-lg flex items-center gap-3"
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
          >
            <Activity size={28} />
            <span className="font-pokemon text-lg">VER CONSUMO IA</span>
            <Zap size={24} className="text-poke-yellow" />
          </motion.button>
        </motion.div>

        {/* Step 1: Select Pokemon - Game Boy Style */}
        <motion.section
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="text-center mb-4">
            <motion.div
              className="inline-flex items-center gap-2 bg-gradient-to-r from-poke-yellow to-poke-orange px-6 py-3 rounded-full shadow-retro border-4 border-pokedex-dark"
              whileHover={{ scale: 1.05 }}
            >
              <Zap className="text-pokedex-dark" size={24} />
              <h2 className="font-pokemon text-lg text-pokedex-dark">
                PASO 1: ELIGE POKEMON
              </h2>
            </motion.div>
          </div>
          <PokemonSelector onSelect={handlePokemonSelect} />
        </motion.section>

        {/* Step 1.5: Select Dessert Type */}
        <AnimatePresence>
          {selectedPokemon && (
            <motion.section
              className="mb-8"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <div className="text-center mb-4">
                <motion.div
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-poke-pink to-dessert-strawberry px-6 py-3 rounded-full shadow-retro border-4 border-pokedex-dark"
                  whileHover={{ scale: 1.05 }}
                >
                  <Cake className="text-pokedex-dark" size={24} />
                  <h2 className="font-pokemon text-lg text-pokedex-dark">
                    PASO 2: TIPO POSTRE
                  </h2>
                </motion.div>
              </div>
              <motion.div
                className="max-w-2xl mx-auto bg-white/95 rounded-2xl shadow-retro-lg p-6 border-4 border-pokedex-dark"
                whileHover={{ y: -5 }}
              >
                <DessertSelector onDessertSelect={setDessertPreferences} />
              </motion.div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Step 2: Generate Recipe */}
        <AnimatePresence>
          {selectedPokemon && (
            <motion.section
              className="mb-8"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <motion.div
                className="max-w-2xl mx-auto bg-gradient-to-br from-dessert-cream to-white rounded-2xl shadow-retro-lg p-6 border-4 border-pokedex-dark"
                whileHover={{ y: -5 }}
              >
                <div className="text-center mb-4">
                  <motion.div
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-poke-green to-poke-blue px-6 py-3 rounded-full shadow-retro border-4 border-pokedex-dark mb-4"
                    whileHover={{ scale: 1.05 }}
                  >
                    <Sparkles className="text-white" size={24} />
                    <h2 className="font-pokemon text-lg text-white">
                      PASO 3: GENERAR!
                    </h2>
                  </motion.div>
                </div>

                <div className="text-center mb-4 p-4 bg-pokedex-screen rounded-xl dot-matrix border-4 border-pokedex-dark">
                  <p className="font-pixel text-base text-pokedex-dark">Pokémon Seleccionado:</p>
                  <p className="font-pokemon text-xl capitalize text-pokedex-dark">
                    No.{String(selectedPokemon.id).padStart(3, '0')} {selectedPokemon.name}
                  </p>
                </div>

                <div className="flex items-center justify-center gap-2 mb-4 p-3 bg-poke-yellow/20 rounded-lg border-2 border-poke-yellow">
                  <input
                    type="checkbox"
                    id="includeImage"
                    checked={includeImage}
                    onChange={(e) => setIncludeImage(e.target.checked)}
                    className="w-5 h-5 accent-poke-red"
                  />
                  <label htmlFor="includeImage" className="flex items-center gap-2 cursor-pointer font-pixel text-md text-pokedex-dark">
                    <ImageIcon size={20} />
                    Generar imagen del postre (toma más tiempo)
                  </label>
                </div>

                <motion.button
                  onClick={handleGenerateRecipe}
                  disabled={generateMutation.isPending}
                  className="retro-btn w-full bg-gradient-to-r from-poke-red to-poke-orange text-white py-4 px-6 rounded-xl disabled:from-gray-400 disabled:to-gray-500 flex items-center justify-center gap-3 font-pokemon text-base"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {generateMutation.isPending ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Loader2 size={24} />
                      </motion.div>
                      <span>GENERANDO...</span>
                    </>
                  ) : (
                    <>
                      <Zap size={24} />
                      <span>CREAR RECETA!</span>
                      <Sparkles size={24} />
                    </>
                  )}
                </motion.button>

                {generateMutation.isError && (
                  <motion.div
                    className="mt-4 p-4 bg-red-500 border-4 border-red-700 rounded-lg text-white font-pixel shadow-retro"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                  >
                    ERROR! Por favor intenta de nuevo.
                  </motion.div>
                )}
              </motion.div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Generated Recipe */}
        <AnimatePresence>
          {generatedRecipe && (
            <motion.section
              className="mb-8"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
            >
              <div className="text-center mb-4">
                <motion.div
                  className="inline-flex items-center gap-3 bg-gradient-to-r from-poke-yellow via-poke-orange to-poke-red px-8 py-4 rounded-full shadow-retro-lg border-4 border-pokedex-dark"
                  animate={{
                    scale: [1, 1.05, 1],
                  }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <Sparkles className="text-white" size={28} />
                  <h2 className="font-pokemon text-xl text-white drop-shadow-lg">
                    NUEVA RECETA ENCONTRADA!
                  </h2>
                  <Star className="text-white" size={28} fill="white" />
                </motion.div>
              </div>
              <div className="max-w-2xl mx-auto">
                <RecipeCard
                  recipe={generatedRecipe}
                  onViewDetails={setSelectedRecipe}
                />
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Saved Recipes */}
        {savedRecipes && savedRecipes.recipes && savedRecipes.recipes.length > 0 && (
          <motion.section
            className="mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="text-center mb-6">
              <motion.div
                className="inline-flex items-center gap-2 bg-gradient-to-r from-poke-blue to-poke-purple px-6 py-3 rounded-full shadow-retro border-4 border-pokedex-dark"
                whileHover={{ scale: 1.05 }}
              >
                <h2 className="font-pokemon text-lg text-white">
                  COLECCION RECETAS
                </h2>
              </motion.div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedRecipes.recipes.map((recipe, index) => (
                <motion.div
                  key={recipe.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <RecipeCard
                    recipe={recipe}
                    onViewDetails={setSelectedRecipe}
                  />
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}
      </main>

      {/* Recipe Detail Modal - Lazy loaded */}
      <AnimatePresence>
        {selectedRecipe && (
          <Suspense fallback={null}>
            <RecipeDetail
              recipe={selectedRecipe}
              onClose={() => setSelectedRecipe(null)}
            />
          </Suspense>
        )}
      </AnimatePresence>

      {/* Usage Dashboard Modal */}
      <UsageDashboard
        isOpen={showUsageDashboard}
        onClose={() => setShowUsageDashboard(false)}
      />

      {/* Footer - Pokeball Style */}
      <footer className="bg-gradient-to-r from-pokedex-dark to-black border-t-4 border-poke-red mt-12 py-6 relative z-10">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-block mb-2">
            <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-b from-poke-red via-white to-white border-4 border-pokedex-dark relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-4 h-4 rounded-full bg-white border-2 border-pokedex-dark"></div>
              </div>
            </div>
          </div>
          <p className="font-pixel text-white text-lg">PokeSweets - Proyecto Académico</p>
          <p className="font-pixel text-poke-yellow text-base mt-1">Andrés Maldonado & Edgar León</p>
          <p className="font-pixel text-gray-400 text-md mt-2">¡Hazte con Todos los Postres!</p>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}
