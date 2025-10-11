import { X, Clock, ChefHat, ShoppingCart, ImageIcon, Sparkles, Star, Zap } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateRecipeImage } from '../services/api';

export default function RecipeDetail({ recipe, onClose }) {
  const [fullImageUrl, setFullImageUrl] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentRecipe, setCurrentRecipe] = useState(recipe);

  // Bloquear scroll del body cuando el modal está abierto
  useEffect(() => {
    // Guardar el estilo original de overflow
    const originalOverflow = document.body.style.overflow;
    // Bloquear el scroll
    document.body.style.overflow = 'hidden';

    // Cleanup: restaurar el scroll cuando se cierra el modal
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  if (!currentRecipe) return null;

  const handleImageClick = (imageUrl) => {
    setFullImageUrl(imageUrl);
  };

  const closeFullImage = () => {
    setFullImageUrl(null);
  };

  const handleGenerateImage = async () => {
    setIsGenerating(true);
    try {
      const updatedRecipe = await generateRecipeImage(currentRecipe.id);
      setCurrentRecipe(updatedRecipe);
    } catch (error) {
      console.error('Error generating image:', error);
      alert('Error generando la imagen. Por favor intenta nuevamente.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 bg-gradient-to-br from-pokedex-dark/95 via-black/95 to-poke-purple/95 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-gradient-to-br from-dessert-cream via-white to-pokedex-light rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-hidden border-8 border-pokedex-dark shadow-retro-lg"
        initial={{ scale: 0.8, y: 100 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 100 }}
        transition={{ type: "spring", damping: 20 }}
      >
        {/* Header - Pokedex Style */}
        <div className="sticky top-0 bg-gradient-to-r from-pokedex-red to-poke-red border-b-4 border-pokedex-dark px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <motion.div
              className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border-4 border-white shadow-pokeball relative"
              animate={{
                boxShadow: ['0 0 20px rgba(59, 76, 202, 0.5)', '0 0 40px rgba(59, 76, 202, 0.8)', '0 0 20px rgba(59, 76, 202, 0.5)']
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="absolute inset-2 rounded-full bg-white opacity-50"></div>
            </motion.div>
            <div>
              <h2 className="font-pokemon text-lg text-white leading-tight">
                DATOS RECETA
              </h2>
              <p className="font-pixel text-md text-poke-yellow">
                {currentRecipe.recipe_title}
              </p>
            </div>
          </div>
          <motion.button
            onClick={onClose}
            className="retro-btn bg-white hover:bg-gray-100 text-pokedex-dark p-3 rounded-xl"
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
          >
            <X size={24} />
          </motion.button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="p-6 space-y-6 pb-12">
            {/* Pokemon Info Card */}
            <motion.div
              className="flex items-center gap-4 p-5 bg-gradient-to-r from-pokedex-screen to-poke-green/50 rounded-2xl border-4 border-pokedex-dark shadow-retro dot-matrix"
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
            >
              {currentRecipe.pokemon_sprite && (
                <motion.div
                  className="bg-white/90 p-2 rounded-xl border-4 border-pokedex-dark"
                  animate={{
                    rotate: [0, 5, -5, 0],
                    scale: [1, 1.05, 1]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <img
                    src={currentRecipe.pokemon_sprite}
                    alt={currentRecipe.pokemon_name}
                    className="w-24 h-24 pixel-border"
                  />
                </motion.div>
              )}
              <div className="flex-1">
                <p className="font-pixel text-md text-pokedex-dark mb-1">INSPIRADO EN:</p>
                <h3 className="font-pokemon text-2xl text-pokedex-dark capitalize">
                  {currentRecipe.pokemon_name}
                </h3>
                <div className="flex items-center gap-2 mt-2">
                  <div className="bg-poke-red text-white font-pokemon text-md px-3 py-1 rounded-full border-2 border-pokedex-dark">
                    No.{String(currentRecipe.pokemon_id).padStart(3, '0')}
                  </div>
                  {[...Array(3)].map((_, i) => (
                    <Star key={i} className="text-poke-yellow" size={16} fill="currentColor" />
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Recipe Image */}
            {currentRecipe.image_url ? (
              <motion.div
                className="relative rounded-2xl overflow-hidden border-4 border-pokedex-dark shadow-retro-lg group cursor-pointer"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileHover={{ scale: 1.02 }}
                onClick={() => handleImageClick(currentRecipe.image_url)}
              >
                <img
                  src={currentRecipe.image_url}
                  alt={currentRecipe.recipe_title}
                  className="w-full h-80 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-6">
                  <div className="font-pokemon text-white text-md flex items-center gap-2">
                    <Sparkles size={18} />
                    CLICK PARA EXPANDIR
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.button
                onClick={handleGenerateImage}
                disabled={isGenerating}
                className="retro-btn w-full bg-gradient-to-r from-poke-blue to-poke-purple text-white py-6 px-6 rounded-2xl disabled:from-gray-400 disabled:to-gray-500 flex flex-col items-center justify-center gap-3 group"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <motion.div
                  animate={isGenerating ? { rotate: 360 } : {}}
                  transition={{ duration: 1, repeat: isGenerating ? Infinity : 0, ease: "linear" }}
                >
                  <ImageIcon size={48} />
                </motion.div>
                <span className="font-pokemon text-lg">
                  {isGenerating ? 'GENERANDO IMAGEN...' : 'GENERAR IMAGEN'}
                </span>
              </motion.button>
            )}

            {/* Description */}
            <motion.div
              className="p-5 bg-white rounded-2xl border-4 border-pokedex-dark shadow-retro"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
            >
              <p className="font-pixel text-base text-gray-700 leading-relaxed">
                {currentRecipe.description}
              </p>
            </motion.div>

            {/* Metadata Stats */}
            <div className="flex items-center gap-4">
              {currentRecipe.difficulty && (
                <motion.div
                  className="flex-1 flex items-center gap-3 p-4 bg-gradient-to-r from-poke-orange to-poke-red text-white rounded-xl border-4 border-pokedex-dark shadow-retro"
                  whileHover={{ y: -5 }}
                >
                  <ChefHat size={28} />
                  <div>
                    <p className="font-pixel text-md opacity-90">DIFICULTAD</p>
                    <p className="font-pokemon text-base">{currentRecipe.difficulty.toUpperCase()}</p>
                  </div>
                </motion.div>
              )}
              {currentRecipe.prep_time && (
                <motion.div
                  className="flex-1 flex items-center gap-3 p-4 bg-gradient-to-r from-poke-blue to-poke-purple text-white rounded-xl border-4 border-pokedex-dark shadow-retro"
                  whileHover={{ y: -5 }}
                >
                  <Clock size={28} />
                  <div>
                    <p className="font-pixel text-md opacity-90">TIEMPO</p>
                    <p className="font-pokemon text-base">{currentRecipe.prep_time} MIN</p>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Thematic Connection */}
            {currentRecipe.thematic_connection && (
              <motion.div
                className="p-5 bg-gradient-to-br from-poke-yellow/30 to-poke-orange/30 rounded-2xl border-4 border-pokedex-dark shadow-retro"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="text-poke-orange" size={24} />
                  <h3 className="font-pokemon text-base text-pokedex-dark">CONEXION TEMATICA</h3>
                </div>
                <p className="font-pixel text-base text-gray-700 leading-relaxed">
                  {currentRecipe.thematic_connection}
                </p>
              </motion.div>
            )}

            {/* Ingredients */}
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-gradient-to-br from-poke-green to-poke-blue rounded-xl border-4 border-pokedex-dark shadow-retro">
                  <ShoppingCart className="text-white" size={24} />
                </div>
                <h3 className="font-pokemon text-xl text-pokedex-dark">INGREDIENTES</h3>
              </div>
              <div className="bg-white rounded-2xl border-4 border-pokedex-dark shadow-retro p-5">
                <ul className="space-y-3">
                  {currentRecipe.ingredients && currentRecipe.ingredients.map((ingredient, index) => (
                    <motion.li
                      key={index}
                      className="flex items-start gap-3 p-3 bg-dessert-cream/50 rounded-lg"
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Zap className="text-poke-yellow flex-shrink-0 mt-1" size={20} />
                      <div className="font-pixel text-md text-gray-700 flex-1">
                        <span className="text-pokedex-dark font-bold">{ingredient.item}:</span>{' '}
                        {ingredient.quantity}
                        {ingredient.notes && (
                          <span className="text-gray-500 block mt-1">
                            ({ingredient.notes})
                          </span>
                        )}
                      </div>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </motion.div>

            {/* Instructions */}
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-gradient-to-br from-poke-pink to-poke-purple rounded-xl border-4 border-pokedex-dark shadow-retro">
                  <Sparkles className="text-white" size={24} />
                </div>
                <h3 className="font-pokemon text-xl text-pokedex-dark">INSTRUCCIONES</h3>
              </div>
              <div className="bg-white rounded-2xl border-4 border-pokedex-dark shadow-retro p-5">
                <ol className="space-y-4">
                  {currentRecipe.instructions && currentRecipe.instructions.map((instruction, index) => (
                    <motion.li
                      key={index}
                      className="flex gap-4"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex-shrink-0">
                        <motion.div
                          className="w-12 h-12 bg-gradient-to-br from-poke-red to-poke-orange text-white rounded-xl border-4 border-pokedex-dark flex items-center justify-center font-pokemon text-lg shadow-retro"
                          whileHover={{ scale: 1.1, rotate: 360 }}
                        >
                          {index + 1}
                        </motion.div>
                      </div>
                      <p className="font-pixel text-md text-gray-700 pt-2 leading-relaxed flex-1">
                        {instruction}
                      </p>
                    </motion.li>
                  ))}
                </ol>
              </div>
            </motion.div>

            {/* Presentation */}
            {currentRecipe.presentation && (
              <motion.div
                className="p-5 bg-gradient-to-br from-dessert-strawberry/40 to-dessert-vanilla/60 rounded-2xl border-4 border-pokedex-dark shadow-retro"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Star className="text-poke-yellow" size={24} fill="currentColor" />
                  <h3 className="font-pokemon text-base text-pokedex-dark">PRESENTACION</h3>
                </div>
                <p className="font-pixel text-base text-gray-700 leading-relaxed">
                  {currentRecipe.presentation}
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Full Image Modal */}
      <AnimatePresence>
        {fullImageUrl && (
          <motion.div
            className="fixed inset-0 bg-black/95 flex items-center justify-center p-4 z-[60]"
            onClick={closeFullImage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.button
              onClick={closeFullImage}
              className="absolute top-4 right-4 retro-btn bg-poke-red text-white p-4 rounded-xl z-10"
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
            >
              <X size={32} />
            </motion.button>
            <motion.img
              src={fullImageUrl}
              alt="Full size"
              className="max-w-full max-h-full object-contain rounded-2xl border-8 border-poke-yellow shadow-pokeball"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.5, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0.5, rotate: 10 }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
