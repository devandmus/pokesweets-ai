import { useState, useEffect, useRef, memo } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { searchPokemon } from '../services/api';

export default memo(function PokemonSelector({ onSelect }) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const debounceTimerRef = useRef(null);

  // Optimized debounce with cleanup
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [query]);

  const { data, isLoading } = useQuery({
    queryKey: ['pokemon-search', debouncedQuery],
    queryFn: () => searchPokemon(debouncedQuery),
    enabled: debouncedQuery.length >= 2,
  });

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Game Boy Screen Container */}
      <motion.div
        className="gameboy-screen p-6 rounded-3xl border-8 border-pokedex-dark shadow-retro-lg"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring" }}
      >
        {/* Search Bar - Retro Style */}
        <div className="relative mb-6">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
            <Search className="text-pokedex-dark" size={24} />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="BUSCAR POKÉMON..."
            className="w-full pl-14 pr-4 py-4 border-4 border-pokedex-dark rounded-xl focus:outline-none text-lg font-pixel bg-white/90 text-pokedex-dark placeholder-pokedex-dark/50 shadow-retro uppercase"
          />
        </div>

        {/* Loading State - Pokeball Spinner */}
        {isLoading && (
          <motion.div
            className="flex flex-col items-center justify-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="w-16 h-16 rounded-full bg-gradient-to-b from-poke-red via-white to-white border-4 border-pokedex-dark relative mb-4"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-6 h-6 rounded-full bg-white border-2 border-pokedex-dark"></div>
              </div>
              <div className="absolute top-1/2 left-0 right-0 h-1 bg-pokedex-dark -translate-y-1/2"></div>
            </motion.div>
            <p className="font-pixel text-pokedex-dark text-base">BUSCANDO...</p>
          </motion.div>
        )}

        {/* Pokemon Grid - Trading Card Style */}
        {data && data.results && data.results.length > 0 && (
          <motion.div
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[500px] overflow-y-auto p-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {data.results.map((pokemon, index) => (
              <motion.button
                key={pokemon.id}
                onClick={() => onSelect(pokemon)}
                className="retro-btn p-4 bg-gradient-to-br from-dessert-cream to-white rounded-xl capitalize text-center group relative overflow-hidden"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  delay: index * 0.05,
                  type: "spring",
                  stiffness: 200
                }}
                whileHover={{
                  scale: 1.05,
                  rotate: [0, -2, 2, 0],
                  transition: { duration: 0.3 }
                }}
                whileTap={{ scale: 0.95 }}
              >
                {/* Card Shine Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>

                {/* Pokemon Number Badge */}
                <div className="absolute top-2 right-2 bg-poke-red text-white font-pokemon text-md px-2 py-1 rounded-full shadow-retro">
                  #{String(pokemon.id).padStart(3, '0')}
                </div>

                {/* Pokemon Icon Placeholder */}
                <div className="w-16 h-16 mx-auto mb-2 bg-pokedex-screen rounded-full flex items-center justify-center border-4 border-pokedex-dark">
                  <div className="font-pokemon text-2xl">
                    ⚡
                  </div>
                </div>

                {/* Pokemon Name */}
                <div className="font-pixel text-base text-pokedex-dark">
                  {pokemon.name.toUpperCase()}
                </div>

                {/* Type Indicator Line */}
                <div className="mt-2 h-1 bg-gradient-to-r from-poke-red via-poke-yellow to-poke-blue rounded-full"></div>
              </motion.button>
            ))}
          </motion.div>
        )}

        {/* No Results */}
        {query.length >= 2 && !isLoading && data && data.results.length === 0 && (
          <motion.div
            className="text-center py-12 px-4"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
          >
            <div className="font-pokemon text-pokedex-dark text-lg mb-2">
              SIN RESULTADOS!
            </div>
            <p className="font-pixel text-pokedex-dark/70 text-md">
              Prueba otro término de búsqueda...
            </p>
          </motion.div>
        )}

        {/* Initial State */}
        {query.length < 2 && !isLoading && (
          <motion.div
            className="text-center py-12 px-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-b from-poke-red via-white to-white border-4 border-pokedex-dark relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-white border-2 border-pokedex-dark"></div>
              </div>
              <div className="absolute top-1/2 left-0 right-0 h-1 bg-pokedex-dark -translate-y-1/2"></div>
            </div>
            <p className="font-pixel text-pokedex-dark text-base">
              ESCRIBE AL MENOS 2 CARACTERES PARA BUSCAR
            </p>
            <p className="font-pixel text-pokedex-dark/70 text-md mt-2">
              Ej: pika, char, bulb...
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
});
