from typing import TypedDict, List, Optional, Dict, Any


class RecipeState(TypedDict):
    """State schema for the recipe generation workflow."""
    
    # Input
    pokemon_id: int
    pokemon_name: Optional[str]
    pokemon_data: Optional[Dict[str, Any]]
    user_preferences: Optional[Dict[str, Any]]
    generate_image: bool
    
    # Processing
    recipe_prompt: Optional[str]
    raw_recipe: Optional[Dict[str, Any]]
    validated_recipe: Optional[Dict[str, Any]]
    refinement_count: int
    
    # Output
    recipe_id: Optional[int]
    image_url: Optional[str]
    image_prompt: Optional[str]
    errors: List[str]
