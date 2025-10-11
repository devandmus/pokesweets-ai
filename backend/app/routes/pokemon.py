from fastapi import APIRouter, HTTPException
from typing import List
from ..services.pokeapi import pokeapi_service

router = APIRouter()


@router.get("/search")
async def search_pokemon(query: str, limit: int = 20):
    """
    Search for Pokemon by name.
    
    Args:
        query: Search query
        limit: Maximum number of results (default: 20)
        
    Returns:
        List of matching Pokemon
    """
    if not query or len(query) < 2:
        raise HTTPException(status_code=400, detail="Query must be at least 2 characters")
    
    results = pokeapi_service.search_pokemon(query, limit)
    return {"results": results, "count": len(results)}


@router.get("/{pokemon_id}")
async def get_pokemon(pokemon_id: int):
    """
    Get detailed Pokemon information.
    
    Args:
        pokemon_id: Pokemon ID
        
    Returns:
        Pokemon details
    """
    if pokemon_id < 1:
        raise HTTPException(status_code=400, detail="Invalid Pokemon ID")
    
    pokemon_data = pokeapi_service.extract_attributes(pokemon_id)
    
    if not pokemon_data:
        raise HTTPException(status_code=404, detail=f"Pokemon with ID {pokemon_id} not found")
    
    return pokemon_data
