import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Pokemon endpoints
export const searchPokemon = async (query, limit = 20) => {
  const response = await api.get(`/pokemon/search`, {
    params: { query, limit }
  });
  return response.data;
};

export const getPokemon = async (pokemonId) => {
  const response = await api.get(`/pokemon/${pokemonId}`);
  return response.data;
};

// Recipe endpoints
export const generateRecipe = async (pokemonId, preferences = null, generateImage = false) => {
  const response = await api.post('/recipes/generate', {
    pokemon_id: pokemonId,
    preferences,
    generate_image: generateImage
  });
  return response.data;
};

export const listRecipes = async (skip = 0, limit = 20, pokemonId = null) => {
  const params = { skip, limit };
  if (pokemonId) params.pokemon_id = pokemonId;

  const response = await api.get('/recipes/', { params });
  return response.data;
};

export const getRecipe = async (recipeId) => {
  const response = await api.get(`/recipes/${recipeId}`);
  return response.data;
};

export const deleteRecipe = async (recipeId) => {
  const response = await api.delete(`/recipes/${recipeId}`);
  return response.data;
};

export const generateRecipeImage = async (recipeId) => {
  const response = await api.post(`/recipes/${recipeId}/generate-image`);
  return response.data;
};

// Usage endpoints
export const getUsageSummary = async () => {
  const response = await api.get('/usage/summary');
  return response.data;
};

export const getUsageHistory = async (startDate = null, endDate = null, limit = 50) => {
  const params = { limit };
  if (startDate) params.start_date = startDate;
  if (endDate) params.end_date = endDate;

  const response = await api.get('/usage/history', { params });
  return response.data;
};

export const getUsageQuota = async () => {
  const response = await api.get('/usage/quota');
  return response.data;
};

export default api;
