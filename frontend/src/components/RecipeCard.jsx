import { Clock, ChefHat, Sparkles, Star, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { memo } from 'react';

export default memo(function RecipeCard({ recipe, onViewDetails }) {
  return (
    <motion.div
      className="card-shine relative bg-gradient-to-br from-poke-yellow via-white to-poke-orange rounded-2xl shadow-retro-lg overflow-hidden group border-8 border-pokedex-dark"
      whileHover={{
        y: -8,
        rotate: [0, -1, 1, 0],
        transition: { duration: 0.3 }
      }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Holographic border effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-poke-red/20 via-poke-blue/20 to-poke-purple/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

      {/* Pokemon Card Header */}
      <div className="bg-gradient-to-r from-pokedex-red to-poke-red p-3 relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center border-2 border-pokedex-dark">
              <Zap className="text-poke-yellow" size={18} />
            </div>
            <span className="font-pokemon text-md text-white capitalize">
              {recipe.pokemon_name}
            </span>
          </div>
          <div className="bg-white/90 px-3 py-1 rounded-full border-2 border-pokedex-dark">
            <span className="font-pokemon text-md text-pokedex-dark">
              #{String(recipe.pokemon_id).padStart(3, '0')}
            </span>
          </div>
        </div>
      </div>

      {/* Recipe Image Container - TCG Style */}
      <div className="relative bg-gradient-to-br from-pokedex-screen to-poke-green/50 border-y-4 border-pokedex-dark">
        {recipe.image_url ? (
          <div className="relative group/image">
            <img
              src={recipe.image_url}
              alt={recipe.recipe_title}
              className="w-full h-56 object-cover"
            />
            {/* Simplified overlay effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-poke-yellow/0 via-poke-yellow/10 to-transparent opacity-0 group-hover/image:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
          </div>
        ) : (
          <div className="h-56 flex items-center justify-center dot-matrix">
            <div className="text-center">
              <Sparkles className="text-pokedex-dark mx-auto mb-2" size={48} />
              <p className="font-pixel text-base text-pokedex-dark">SIN IMAGEN</p>
            </div>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-5 bg-gradient-to-br from-white to-dessert-cream relative">
        {/* Recipe Title - TCG Attack Name Style */}
        <div className="mb-3">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-pokemon text-base text-pokedex-dark leading-tight flex-1">
              {recipe.recipe_title}
            </h3>
            <div className="flex gap-1">
              <Star className="text-poke-yellow" size={16} fill="currentColor" />
            </div>
          </div>
          <div className="h-1 bg-gradient-to-r from-poke-red via-poke-yellow to-poke-blue rounded-full"></div>
        </div>

        {/* Description - TCG Flavor Text Style */}
        <div className="mb-4 p-3 bg-white/50 rounded-lg border-2 border-pokedex-dark dot-matrix">
          <p className="font-pixel text-lg text-gray-700 line-clamp-3 leading-relaxed">
            {recipe.description}
          </p>
        </div>

        {/* Stats - TCG Bottom Info */}
        <div className="flex items-center justify-between gap-3 mb-4 text-md">
          {recipe.difficulty && (
            <div className="flex items-center gap-1 bg-gradient-to-r from-poke-orange to-poke-red text-white px-3 py-1.5 rounded-full border-2 border-pokedex-dark shadow-retro">
              <ChefHat size={16} />
              <span className="font-pixel">{recipe.difficulty.toUpperCase()}</span>
            </div>
          )}

          {recipe.prep_time && (
            <div className="flex items-center gap-1 bg-gradient-to-r from-poke-blue to-poke-purple text-white px-3 py-1.5 rounded-full border-2 border-pokedex-dark shadow-retro">
              <Clock size={16} />
              <span className="font-pixel">{recipe.prep_time}m</span>
            </div>
          )}
        </div>

        {/* View Details Button - TCG Energy Style */}
        <motion.button
          onClick={() => onViewDetails(recipe)}
          className="retro-btn w-full bg-gradient-to-r from-poke-yellow via-poke-orange to-poke-red text-white py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-pokemon text-md group-hover:shadow-pokeball"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <Sparkles size={20} />
          <span>VER RECETA</span>
          <Zap size={20} />
        </motion.button>

        {/* Card Set Number - Bottom Right */}
        <div className="absolute bottom-2 right-2 opacity-50">
          <p className="font-pixel text-xs text-gray-400">
            {recipe.id}/{recipe.id + 100}
          </p>
        </div>
      </div>
    </motion.div>
  );
});
