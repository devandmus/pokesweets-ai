import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign, Zap, Cake, Image as ImageIcon, TrendingUp, Activity, X } from 'lucide-react';
import { getUsageSummary, getUsageQuota } from '../services/api';

export default function UsageDashboard({ isOpen, onClose }) {
    const [usage, setUsage] = useState(null);
    const [quota, setQuota] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Bloquear scroll del body cuando el modal está abierto
    useEffect(() => {
        if (isOpen) {
            // Guardar el estilo original de overflow
            const originalOverflow = document.body.style.overflow;
            // Bloquear el scroll
            document.body.style.overflow = 'hidden';

            // Cleanup: restaurar el scroll cuando se cierra el modal
            return () => {
                document.body.style.overflow = originalOverflow;
            };
        }
    }, [isOpen]);

    useEffect(() => {
        const fetchUsage = async () => {
            try {
                setLoading(true);
                const [summaryData, quotaData] = await Promise.all([
                    getUsageSummary(),
                    getUsageQuota()
                ]);
                setUsage(summaryData);
                setQuota(quotaData);
                setError(null);
            } catch (err) {
                console.error('Error fetching usage data:', err);
                setError('Error cargando datos de consumo');
            } finally {
                setLoading(false);
            }
        };

        if (isOpen) {
            fetchUsage();
            // Refetch every 30 seconds while modal is open
            const interval = setInterval(fetchUsage, 30000);
            return () => clearInterval(interval);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    // Calculate percentage color
    const getPercentageColor = (percentage) => {
        if (percentage >= 90) return 'bg-red-500';
        if (percentage >= 70) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    const getPercentageBorderColor = (percentage) => {
        if (percentage >= 90) return 'border-red-600';
        if (percentage >= 70) return 'border-yellow-600';
        return 'border-green-600';
    };

    return (
        <AnimatePresence>
            {/* Modal Overlay */}
            <motion.div
                className="fixed inset-0 bg-gradient-to-br from-pokedex-dark/95 via-black/95 to-poke-purple/95 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            >
                {/* Modal Content */}
                <motion.div
                    className="bg-gradient-to-br from-dessert-cream via-white to-pokedex-light rounded-3xl shadow-retro-lg border-8 border-pokedex-dark max-w-4xl w-full max-h-[90vh] overflow-hidden"
                    initial={{ scale: 0.8, y: 100 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.8, y: 100 }}
                    transition={{ type: "spring", damping: 20 }}
                    onClick={(e) => e.stopPropagation()}
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
                                    CONSUMO IA
                                </h2>
                                <p className="font-pixel text-sm text-poke-yellow">
                                    Monitor de Uso OpenAI
                                </p>
                            </div>
                        </div>

                        <motion.button
                            onClick={onClose}
                            className="retro-btn bg-white/20 hover:bg-white/30 text-white p-3 rounded-full border-4 border-white shadow-retro"
                            whileHover={{ scale: 1.1, rotate: 90 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            <X size={24} />
                        </motion.button>
                    </div>

                    {/* Scrollable Content */}
                    <div className="overflow-y-auto max-h-[calc(90vh-80px)] px-6 py-6">
                        {/* Loading State */}
                        {loading && (
                            <div className="text-center font-pixel text-pokedex-dark py-12">
                                <Activity className="inline-block animate-pulse" size={48} />
                                <p className="mt-4 text-lg">Cargando datos...</p>
                            </div>
                        )}

                        {/* Error State */}
                        {error && !loading && (
                            <div className="bg-red-100 rounded-xl p-6 border-4 border-red-600">
                                <p className="text-center font-pixel text-red-700 text-lg">{error}</p>
                            </div>
                        )}

                        {/* Content - Only show if not loading and no error */}
                        {!loading && !error && usage && quota && (
                            <>
                                {/* Header */}
                                <div className="text-center mb-6">
                                    <motion.div
                                        className="inline-flex items-center gap-2 bg-gradient-to-r from-poke-green to-poke-blue px-6 py-3 rounded-full shadow-retro border-4 border-pokedex-dark"
                                        whileHover={{ scale: 1.05 }}
                                    >
                                        <Activity className="text-white" size={24} />
                                        <h2 className="font-pokemon text-lg text-white">
                                            CONSUMO DE IA
                                        </h2>
                                        <Zap className="text-poke-yellow" size={24} />
                                    </motion.div>
                                </div>

                                {/* Stats Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                    {/* Total Cost */}
                                    <motion.div
                                        className="bg-gradient-to-br from-green-100 to-green-200 p-4 rounded-xl border-4 border-green-500 shadow-retro"
                                        whileHover={{ scale: 1.05, y: -5 }}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <DollarSign className="text-green-700" size={24} />
                                            <span className="font-pixel text-xs text-green-700">COSTO</span>
                                        </div>
                                        <p className="text-2xl font-pokemon text-green-800">
                                            ${usage.total_cost_usd.toFixed(4)}
                                        </p>
                                        <p className="text-xs font-pixel text-green-600 mt-1">USD Total</p>
                                    </motion.div>

                                    {/* Total Tokens */}
                                    <motion.div
                                        className="bg-gradient-to-br from-blue-100 to-blue-200 p-4 rounded-xl border-4 border-blue-500 shadow-retro"
                                        whileHover={{ scale: 1.05, y: -5 }}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <Zap className="text-blue-700" size={24} />
                                            <span className="font-pixel text-xs text-blue-700">TOKENS</span>
                                        </div>
                                        <p className="text-2xl font-pokemon text-blue-800">
                                            {usage.total_tokens.toLocaleString()}
                                        </p>
                                        <p className="text-xs font-pixel text-blue-600 mt-1">Consumidos</p>
                                    </motion.div>

                                    {/* Recipes Generated */}
                                    <motion.div
                                        className="bg-gradient-to-br from-pink-100 to-pink-200 p-4 rounded-xl border-4 border-pink-500 shadow-retro"
                                        whileHover={{ scale: 1.05, y: -5 }}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <Cake className="text-pink-700" size={24} />
                                            <span className="font-pixel text-xs text-pink-700">RECETAS</span>
                                        </div>
                                        <p className="text-2xl font-pokemon text-pink-800">
                                            {usage.recipes_generated}
                                        </p>
                                        <p className="text-xs font-pixel text-pink-600 mt-1">Generadas</p>
                                    </motion.div>

                                    {/* Images Generated */}
                                    <motion.div
                                        className="bg-gradient-to-br from-purple-100 to-purple-200 p-4 rounded-xl border-4 border-purple-500 shadow-retro"
                                        whileHover={{ scale: 1.05, y: -5 }}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <ImageIcon className="text-purple-700" size={24} />
                                            <span className="font-pixel text-xs text-purple-700">IMAGENES</span>
                                        </div>
                                        <p className="text-2xl font-pokemon text-purple-800">
                                            {usage.images_generated}
                                        </p>
                                        <p className="text-xs font-pixel text-purple-600 mt-1">Generadas</p>
                                    </motion.div>
                                </div>

                                {/* Budget Progress Bar */}
                                <div className={`bg-pokedex-screen p-5 rounded-xl border-4 ${getPercentageBorderColor(quota.percentage_used)} dot-matrix`}>
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <TrendingUp className="text-pokedex-dark" size={20} />
                                            <span className="font-pokemon text-base text-pokedex-dark">PRESUPUESTO</span>
                                        </div>
                                        <span className="font-pixel text-lg text-pokedex-dark font-bold">
                                            {quota.percentage_used.toFixed(1)}%
                                        </span>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="relative w-full bg-gray-300 rounded-full h-6 border-2 border-pokedex-dark overflow-hidden">
                                        <motion.div
                                            className={`h-full ${getPercentageColor(quota.percentage_used)} relative`}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${quota.percentage_used}%` }}
                                            transition={{ duration: 1, ease: "easeOut" }}
                                        >
                                            {/* Animated shine effect */}
                                            <motion.div
                                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
                                                animate={{ x: ['-100%', '200%'] }}
                                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                            />
                                        </motion.div>
                                        {/* Percentage text inside bar */}
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <span className="font-pixel text-sm text-white drop-shadow-lg font-bold">
                                                ${quota.current_cost_usd.toFixed(2)} / ${quota.budget_limit_usd.toFixed(2)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Remaining budget */}
                                    <div className="mt-3 flex justify-between items-center">
                                        <p className="font-pixel text-sm text-pokedex-dark">
                                            Restante: <span className="font-bold">${quota.remaining_usd.toFixed(2)}</span>
                                        </p>
                                        {quota.percentage_used >= 80 && (
                                            <motion.span
                                                className="font-pixel text-xs bg-red-500 text-white px-3 py-1 rounded-full border-2 border-red-700"
                                                animate={{ scale: [1, 1.1, 1] }}
                                                transition={{ duration: 1, repeat: Infinity }}
                                            >
                                                ⚠️ ALERTA
                                            </motion.span>
                                        )}
                                    </div>
                                </div>

                                {/* Cost Breakdown */}
                                <div className="mt-4 grid grid-cols-2 gap-3">
                                    <div className="bg-gradient-to-br from-dessert-cream to-yellow-100 p-3 rounded-lg border-2 border-yellow-400">
                                        <p className="font-pixel text-xs text-gray-700 mb-1">Costo promedio/receta</p>
                                        <p className="font-pokemon text-lg text-yellow-800">
                                            ${usage.recipes_generated > 0
                                                ? (usage.total_cost_usd / usage.recipes_generated).toFixed(4)
                                                : '0.00'}
                                        </p>
                                    </div>
                                    <div className="bg-gradient-to-br from-dessert-cream to-orange-100 p-3 rounded-lg border-2 border-orange-400">
                                        <p className="font-pixel text-xs text-gray-700 mb-1">Tokens promedio/receta</p>
                                        <p className="font-pokemon text-lg text-orange-800">
                                            {usage.recipes_generated > 0
                                                ? Math.round(usage.total_tokens / usage.recipes_generated).toLocaleString()
                                                : '0'}
                                        </p>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
