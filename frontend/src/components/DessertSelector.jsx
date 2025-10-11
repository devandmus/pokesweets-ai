import { useState, memo } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ChefHat, Cookie, IceCream, ChevronDown } from 'lucide-react';

const DESSERT_TYPES = [
  { value: 'torta', label: '🎂 Torta', emoji: '🎂' },
  { value: 'helado', label: '🍦 Helado', emoji: '🍦' },
  { value: 'galletas', label: '🍪 Galletas', emoji: '🍪' },
  { value: 'alfajores', label: '🥮 Alfajores', emoji: '🥮' },
  { value: 'mazapan', label: '🍬 Mazapán', emoji: '🍬' },
  { value: 'sopaipillas', label: '🍩 Sopaipillas', emoji: '🍩' },
  { value: 'pastel', label: '🍰 Pastel', emoji: '🍰' },
  { value: 'mousse', label: '🍮 Mousse', emoji: '🍮' },
  { value: 'brownie', label: '🍫 Brownie', emoji: '🍫' },
  { value: 'flan', label: '🍨 Flan', emoji: '🍨' },
  { value: 'custard', label: '🥛 Cuajada', emoji: '🥛' },
  { value: 'other', label: '✨ Personalizado', emoji: '✨' }
];

const DessertSelector = memo(({ onDessertSelect }) => {
  const [selectedType, setSelectedType] = useState('');
  const [customDescription, setCustomDescription] = useState('');

  const handleTypeChange = (e) => {
    const type = e.target.value;
    setSelectedType(type);

    if (type !== 'other') {
      const dessertType = DESSERT_TYPES.find(d => d.value === type)?.label.toLowerCase();
      onDessertSelect(type === '' ? null : { dessert_type: dessertType });
    } else {
      onDessertSelect(customDescription.trim() ? { dessert_description: customDescription.trim() } : null);
    }
  };

  const handleCustomChange = (e) => {
    const description = e.target.value;
    setCustomDescription(description);
    if (selectedType === 'other') {
      onDessertSelect(description.trim() ? { dessert_description: description.trim() } : null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        className="flex items-center gap-3 mb-4"
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
      >
        <div className="p-3 bg-gradient-to-br from-dessert-strawberry to-dessert-vanilla rounded-xl border-4 border-pokedex-dark shadow-retro">
          <ChefHat className="text-pokedex-dark" size={28} />
        </div>
        <div>
          <h3 className="font-pokemon text-lg text-pokedex-dark">MENU POSTRES</h3>
          <p className="font-pixel text-md text-gray-600">¡Elige tu dulce creación!</p>
        </div>
      </motion.div>

      {/* Dessert Type Select - Custom Styled */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <label className="block font-pixel text-base text-pokedex-dark mb-3 flex items-center gap-2">
          <Cookie size={20} />
          TIPO DE POSTRE (OPCIONAL)
        </label>
        <div className="relative">
          <select
            value={selectedType}
            onChange={handleTypeChange}
            className="retro-btn w-full p-4 pr-12 border-4 border-pokedex-dark rounded-xl focus:ring-4 focus:ring-poke-yellow focus:outline-none bg-gradient-to-br from-white to-dessert-cream font-pixel text-base text-pokedex-dark appearance-none cursor-pointer hover:from-dessert-cream hover:to-white transition-all"
            style={{
              backgroundImage: 'none',
            }}
          >
            <option value="">🎲 SORPRESA IA (Postre aleatorio)</option>
            {DESSERT_TYPES.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          {/* Custom Arrow */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
            <ChevronDown className="text-pokedex-dark animate-bounce" size={24} />
          </div>
        </div>
      </motion.div>

      {/* Custom Description */}
      {selectedType === 'other' && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring" }}
        >
          <label className="block font-pixel text-base text-pokedex-dark mb-3 flex items-center gap-2">
            <Sparkles size={20} />
            DESCRIBE TU POSTRE SOÑADO
          </label>
          <textarea
            value={customDescription}
            onChange={handleCustomChange}
            placeholder="Ej: Un pastel de frutas rojo y blanco con forma de Poké Ball con glaseado de fresa..."
            className="w-full p-4 border-4 border-pokedex-dark rounded-xl focus:ring-4 focus:ring-poke-yellow focus:outline-none resize-none font-pixel text-base bg-white text-pokedex-dark placeholder-gray-400"
            rows="4"
          />
          <motion.p
            className="text-md font-pixel text-gray-600 mt-2 flex items-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <IceCream size={16} />
            ¡Describe tu postre ideal inspirado en Pokémon!
          </motion.p>
        </motion.div>
      )}

      {/* Tip Box - Pokedex Entry Style */}
      <motion.div
        className="bg-gradient-to-br from-poke-blue/20 to-poke-purple/20 p-4 rounded-xl border-4 border-pokedex-dark shadow-retro relative overflow-hidden"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {/* Pokedex corner decoration */}
        <div className="absolute top-2 right-2">
          <div className="flex gap-1">
            <div className="w-2 h-2 rounded-full bg-poke-red"></div>
            <div className="w-2 h-2 rounded-full bg-poke-yellow"></div>
            <div className="w-2 h-2 rounded-full bg-poke-green"></div>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Sparkles className="text-poke-yellow" size={24} />
          <div>
            <p className="font-pokemon text-md text-pokedex-dark mb-2">CONSEJO PRO:</p>
            <p className="font-pixel text-md text-gray-700 leading-relaxed">
              ¡Déjalo en blanco para creatividad IA! La IA creará un postre único basado en los colores, personalidad y tipo del Pokémon.
            </p>
          </div>
        </div>

        {/* Decorative dots */}
        <div className="absolute bottom-2 right-4 flex gap-1">
          <div className="w-1 h-1 rounded-full bg-poke-blue animate-pulse" />
          <div className="w-1 h-1 rounded-full bg-poke-blue animate-pulse" style={{ animationDelay: '500ms' }} />
          <div className="w-1 h-1 rounded-full bg-poke-blue animate-pulse" style={{ animationDelay: '1000ms' }} />
        </div>
      </motion.div>

      {/* Preview of selected type */}
      {selectedType && selectedType !== 'other' && (
        <motion.div
          className="bg-gradient-to-r from-dessert-cream to-dessert-vanilla p-4 rounded-xl border-4 border-pokedex-dark shadow-retro text-center"
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200 }}
        >
          <div className="text-5xl mb-2 animate-bounce">
            {DESSERT_TYPES.find(d => d.value === selectedType)?.emoji}
          </div>
          <p className="font-pokemon text-md text-pokedex-dark">
            SELECCIONADO: {DESSERT_TYPES.find(d => d.value === selectedType)?.label}
          </p>
        </motion.div>
      )}
    </div>
  );
});

export default DessertSelector;
