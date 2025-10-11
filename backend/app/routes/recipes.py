from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import Optional, Dict, Any
from pydantic import BaseModel
import json
from ..database import get_db
from ..models import Recipe
from ..workflows import generate_recipe_workflow

router = APIRouter()


class RecipeGenerateRequest(BaseModel):
    """Request model for recipe generation."""
    pokemon_id: int
    preferences: Optional[Dict[str, Any]] = None
    generate_image: bool = False


class RecipeResponse(BaseModel):
    """Response model for recipe."""
    id: Optional[int] = None
    pokemon_id: int
    pokemon_name: str
    recipe_title: str
    description: str
    ingredients: list
    instructions: list
    difficulty: Optional[str] = None
    prep_time: Optional[int] = None
    image_url: Optional[str] = None
    thematic_connection: Optional[str] = None
    presentation: Optional[str] = None


@router.post("/generate")
async def generate_recipe(request: RecipeGenerateRequest):
    """
    Generate a new recipe based on a Pokemon.

    Args:
        request: Recipe generation request

    Returns:
        Generated recipe with optional image
    """
    if not (1 <= request.pokemon_id <= 1017):
        raise HTTPException(status_code=400, detail="Pokemon ID must be between 1 and 1017")
    
    # Execute the LangGraph workflow
    result = await generate_recipe_workflow(
        pokemon_id=request.pokemon_id,
        preferences=request.preferences,
        generate_image=request.generate_image
    )
    
    # Check for errors
    if result.get("errors"):
        raise HTTPException(
            status_code=500,
            detail={"message": "Recipe generation failed", "errors": result["errors"]}
        )
    
    # Extract recipe data
    validated_recipe = result.get("validated_recipe", {})
    pokemon_data = result.get("pokemon_data", {})
    
    response = {
        "id": result.get("recipe_id"),
        "pokemon_id": pokemon_data.get("id"),
        "pokemon_name": pokemon_data.get("name"),
        "recipe_title": validated_recipe.get("title"),
        "description": validated_recipe.get("description"),
        "ingredients": validated_recipe.get("ingredients", []),
        "instructions": validated_recipe.get("instructions", []),
        "difficulty": validated_recipe.get("difficulty"),
        "prep_time": validated_recipe.get("prep_time"),
        "image_url": result.get("image_url"),
        "thematic_connection": validated_recipe.get("thematic_connection"),
        "presentation": validated_recipe.get("presentation"),
        "pokemon_sprite": pokemon_data.get("sprite")
    }
    
    return response


@router.get("/")
async def list_recipes(
    skip: int = 0,
    limit: int = 20,
    pokemon_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """
    List saved recipes.
    
    Args:
        skip: Number of recipes to skip (default: 0)
        limit: Maximum number of recipes to return (default: 20)
        pokemon_id: Filter by Pokemon ID (optional)
        db: Database session
        
    Returns:
        List of recipes
    """
    query = db.query(Recipe)
    
    if pokemon_id:
        query = query.filter(Recipe.pokemon_id == pokemon_id)
    
    recipes = query.order_by(Recipe.created_at.desc()).offset(skip).limit(limit).all()
    
    result = []
    for recipe in recipes:
        result.append({
            "id": recipe.id,
            "pokemon_id": recipe.pokemon_id,
            "pokemon_name": recipe.pokemon_name,
            "recipe_title": recipe.recipe_title,
            "description": recipe.description,
            "ingredients": json.loads(recipe.ingredients) if recipe.ingredients else [],
            "instructions": json.loads(recipe.instructions) if recipe.instructions else [],
            "difficulty": recipe.difficulty,
            "prep_time": recipe.prep_time,
            "thematic_connection": recipe.thematic_connection,
            "presentation": recipe.presentation,
            "image_url": recipe.image_url,
            "created_at": recipe.created_at.isoformat() if recipe.created_at else None
        })
    
    return {"recipes": result, "count": len(result)}


@router.get("/{recipe_id}")
async def get_recipe(recipe_id: int, db: Session = Depends(get_db)):
    """
    Get a specific recipe by ID.
    
    Args:
        recipe_id: Recipe ID
        db: Database session
        
    Returns:
        Recipe details
    """
    recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    
    if not recipe:
        raise HTTPException(status_code=404, detail=f"Recipe with ID {recipe_id} not found")
    
    return {
        "id": recipe.id,
        "pokemon_id": recipe.pokemon_id,
        "pokemon_name": recipe.pokemon_name,
        "recipe_title": recipe.recipe_title,
        "description": recipe.description,
        "ingredients": json.loads(recipe.ingredients) if recipe.ingredients else [],
        "instructions": json.loads(recipe.instructions) if recipe.instructions else [],
        "difficulty": recipe.difficulty,
        "prep_time": recipe.prep_time,
        "thematic_connection": recipe.thematic_connection,
        "presentation": recipe.presentation,
        "image_url": recipe.image_url,
        "created_at": recipe.created_at.isoformat() if recipe.created_at else None
    }


@router.post("/{recipe_id}/generate-image")
async def generate_recipe_image(recipe_id: int, db: Session = Depends(get_db)):
    """
    Generate an image for an existing recipe.

    Args:
        recipe_id: Recipe ID
        db: Database session

    Returns:
        Updated recipe with image URL
    """
    from ..services.image_service import image_service
    from ..services.llm_service import llm_service
    from ..services.pokeapi import pokeapi_service

    # Fetch recipe
    recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()

    if not recipe:
        raise HTTPException(status_code=404, detail=f"Recipe with ID {recipe_id} not found")

    try:
        # Fetch Pokemon data
        pokemon_data = pokeapi_service.extract_attributes(recipe.pokemon_id)
        if not pokemon_data:
            raise HTTPException(status_code=404, detail=f"Pokemon with ID {recipe.pokemon_id} not found")

        # Build recipe data for prompt generation
        recipe_data = {
            "title": recipe.recipe_title,
            "description": recipe.description,
            "ingredients": json.loads(recipe.ingredients) if recipe.ingredients else [],
            "instructions": json.loads(recipe.instructions) if recipe.instructions else []
        }

        # Generate image prompt
        image_prompt = llm_service.generate_image_prompt(recipe_data, pokemon_data)

        # Generate image
        image_b64 = image_service.generate_image(
            image_prompt,
            recipe_id=recipe_id,
            pokemon_id=recipe.pokemon_id
        )

        if not image_b64:
            raise HTTPException(status_code=500, detail="Failed to generate image")

        # Update recipe with new image
        image_url = f"data:image/png;base64,{image_b64}"
        recipe.image_url = image_url
        db.commit()

        # Return updated recipe data
        return {
            "id": recipe.id,
            "pokemon_id": recipe.pokemon_id,
            "pokemon_name": recipe.pokemon_name,
            "recipe_title": recipe.recipe_title,
            "description": recipe.description,
            "ingredients": json.loads(recipe.ingredients) if recipe.ingredients else [],
            "instructions": json.loads(recipe.instructions) if recipe.instructions else [],
            "difficulty": recipe.difficulty,
            "prep_time": recipe.prep_time,
            "image_url": recipe.image_url,
            "thematic_connection": None,
            "presentation": None,
            "pokemon_sprite": pokemon_data.get("sprite")
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating image: {str(e)}")


@router.delete("/{recipe_id}")
async def delete_recipe(recipe_id: int, db: Session = Depends(get_db)):
    """
    Delete a recipe.

    Args:
        recipe_id: Recipe ID
        db: Database session

    Returns:
        Confirmation message
    """
    recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()

    if not recipe:
        raise HTTPException(status_code=404, detail=f"Recipe with ID {recipe_id} not found")

    db.delete(recipe)
    db.commit()

    return {"message": f"Recipe {recipe_id} deleted successfully"}
