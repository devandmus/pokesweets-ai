from typing import Dict, Any
import json
from .state import RecipeState
from ..services.pokeapi import pokeapi_service
from ..services.llm_service import llm_service
from ..services.image_service import image_service
from ..models import Recipe
from ..database import SessionLocal
from ..utils.logger import setup_logger

logger = setup_logger(__name__)


def fetch_pokemon_node(state: RecipeState) -> RecipeState:
    """Fetch Pokemon data from PokéAPI."""
    pokemon_id = state["pokemon_id"]
    
    try:
        pokemon_data = pokeapi_service.extract_attributes(pokemon_id)
        
        if not pokemon_data:
            state["errors"].append(f"Pokemon with ID {pokemon_id} not found")
            return state
        
        state["pokemon_name"] = pokemon_data.get("name", "unknown")
        state["pokemon_data"] = pokemon_data
        
    except Exception as e:
        logger.error(f"Error in fetch_pokemon_node for ID {pokemon_id}: {e}")
        state["errors"].append(f"Error fetching Pokemon: {str(e)}")
    
    return state


def build_prompt_node(state: RecipeState) -> RecipeState:
    """Build the recipe generation prompt."""
    pokemon_data = state.get("pokemon_data", {})
    
    if not pokemon_data:
        state["errors"].append("No Pokemon data available to build prompt")
        return state
    
    # The prompt is built internally by the LLM service
    # This node just validates we have the necessary data
    state["recipe_prompt"] = "ready"
    
    return state


def generate_recipe_node(state: RecipeState) -> RecipeState:
    """Generate recipe using LLM."""
    pokemon_data = state.get("pokemon_data") or {}
    preferences = state.get("user_preferences") or {}

    if not pokemon_data:
        state["errors"].append("No Pokemon data available for recipe generation")
        return state

    try:
        recipe_data = llm_service.generate_recipe(pokemon_data, preferences)
        state["raw_recipe"] = recipe_data

        if "error" in recipe_data:
            state["errors"].append(f"Recipe generation error: {recipe_data['error']}")

    except Exception as e:
        logger.error(f"Error in generate_recipe_node: {e}")
        state["errors"].append(f"Error generating recipe: {str(e)}")

    return state


def validate_recipe_node(state: RecipeState) -> RecipeState:
    """Validate the generated recipe."""
    raw_recipe = state.get("raw_recipe", {})
    
    if not raw_recipe:
        state["errors"].append("No recipe to validate")
        return state
    
    # Basic validation
    required_fields = ["title", "description", "ingredients", "instructions"]
    missing_fields = [field for field in required_fields if field not in raw_recipe or not raw_recipe[field]]
    
    if missing_fields:
        state["errors"].append(f"Recipe missing required fields: {', '.join(missing_fields)}")
        return state
    
    # Validate ingredients format
    ingredients = raw_recipe.get("ingredients", [])
    if not isinstance(ingredients, list) or len(ingredients) == 0:
        state["errors"].append("Recipe must have at least one ingredient")
        return state
    
    # Validate instructions format
    instructions = raw_recipe.get("instructions", [])
    if not isinstance(instructions, list) or len(instructions) == 0:
        state["errors"].append("Recipe must have at least one instruction")
        return state
    
    # If validation passes, mark as validated
    state["validated_recipe"] = raw_recipe
    
    return state


def save_recipe_node(state: RecipeState) -> RecipeState:
    """Save recipe to database."""
    validated_recipe = state.get("validated_recipe", {})
    pokemon_data = state.get("pokemon_data", {})
    
    if not validated_recipe or not pokemon_data:
        state["errors"].append("Cannot save recipe: missing data")
        return state
    
    try:
        db = SessionLocal()
        
        recipe = Recipe(
            pokemon_id=pokemon_data.get("id"),
            pokemon_name=pokemon_data.get("name"),
            recipe_title=validated_recipe.get("title"),
            description=validated_recipe.get("description"),
            ingredients=json.dumps(validated_recipe.get("ingredients", [])),
            instructions=json.dumps(validated_recipe.get("instructions", [])),
            difficulty=validated_recipe.get("difficulty", "Medium"),
            prep_time=validated_recipe.get("prep_time", 0),
            thematic_connection=validated_recipe.get("thematic_connection", ""),
            presentation=validated_recipe.get("presentation", "")
        )
        
        db.add(recipe)
        db.commit()
        db.refresh(recipe)
        
        state["recipe_id"] = recipe.id
        
        db.close()
        
    except Exception as e:
        logger.error(f"Error in save_recipe_node: {e}")
        state["errors"].append(f"Error saving recipe: {str(e)}")
    
    return state


def refine_recipe_node(state: RecipeState) -> RecipeState:
    """Refine an incomplete recipe based on validation errors."""
    pokemon_data = state.get("pokemon_data", {})
    raw_recipe = state.get("raw_recipe", {})
    errors = state.get("errors", [])

    if not raw_recipe or not errors:
        state["errors"].append("No recipe to refine or no errors to fix")
        return state

    try:
        state["refinement_count"] += 1
        refined_recipe = llm_service.refine_recipe(
            incomplete_recipe=raw_recipe,
            pokemon_data=pokemon_data,
            errors=errors,
            recipe_id=state.get("recipe_id")
        )

        if refined_recipe:
            state["raw_recipe"] = refined_recipe
            # Clear previous errors and set as re-validated
            state["errors"] = []
            state["validated_recipe"] = refined_recipe

    except Exception as e:
        logger.error(f"Error in refine_recipe_node for Pokemon {pokemon_data.get('name')}: {e}")
        state["errors"].append(f"Error refining recipe: {str(e)}")

    return state


def generate_image_node(state: RecipeState) -> RecipeState:
    """Generate image for the recipe."""
    validated_recipe = state.get("validated_recipe", {})
    pokemon_data = state.get("pokemon_data", {})
    recipe_id = state.get("recipe_id")

    if not validated_recipe or not pokemon_data:
        state["errors"].append("Cannot generate image: missing data")
        return state

    try:
        image_prompt = llm_service.generate_image_prompt(validated_recipe, pokemon_data)
        state["image_prompt"] = image_prompt

        image_b64 = image_service.generate_image(
            image_prompt,
            recipe_id=recipe_id,
            pokemon_id=pokemon_data.get("id")
        )

        if image_b64:
            # Store base64 data that can be used as a data URL
            state["image_url"] = f"data:image/png;base64,{image_b64}"

            # Update recipe in database with base64 data URL
            if recipe_id:
                db = SessionLocal()
                recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
                if recipe:
                    recipe.image_url = f"data:image/png;base64,{image_b64}"
                    db.commit()
                db.close()
        else:
            state["errors"].append("Failed to generate image")

    except Exception as e:
        logger.error(f"Error in generate_image_node: {e}")
        state["errors"].append(f"Error generating image: {str(e)}")

    return state
