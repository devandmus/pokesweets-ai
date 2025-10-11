from langgraph.graph import StateGraph, END
from .state import RecipeState
from .nodes import (
    fetch_pokemon_node,
    build_prompt_node,
    generate_recipe_node,
    validate_recipe_node,
    save_recipe_node,
    generate_image_node
)


def create_recipe_workflow():
    """Create and compile the recipe generation workflow."""
    
    # Create the state graph
    workflow = StateGraph(RecipeState)
    
    # Add nodes
    workflow.add_node("fetch_pokemon", fetch_pokemon_node)
    workflow.add_node("build_prompt", build_prompt_node)
    workflow.add_node("generate_recipe", generate_recipe_node)
    workflow.add_node("validate_recipe", validate_recipe_node)
    workflow.add_node("save_recipe", save_recipe_node)
    workflow.add_node("generate_image_node", generate_image_node)
    
    # Define the workflow flow
    workflow.set_entry_point("fetch_pokemon")
    
    # Sequential flow for main recipe generation
    workflow.add_edge("fetch_pokemon", "build_prompt")
    workflow.add_edge("build_prompt", "generate_recipe")
    workflow.add_edge("generate_recipe", "validate_recipe")
    
    # Conditional edge after validation
    def should_save(state: RecipeState) -> str:
        """Determine if recipe should be saved or end with error."""
        if state.get("errors"):
            return "end"
        return "save"
    
    workflow.add_conditional_edges(
        "validate_recipe",
        should_save,
        {
            "save": "save_recipe",
            "end": END
        }
    )
    
    # Conditional edge for image generation
    def should_generate_image(state: RecipeState) -> str:
        """Determine if image should be generated."""
        if state.get("generate_image", False) and not state.get("errors"):
            return "image"
        return "end"

    workflow.add_conditional_edges(
        "save_recipe",
        should_generate_image,
        {
            "image": "generate_image_node",
            "end": END
        }
    )

    workflow.add_edge("generate_image_node", END)
    
    # Compile the graph
    return workflow.compile()


# Create global workflow instance
recipe_workflow = create_recipe_workflow()


async def generate_recipe_workflow(
    pokemon_id: int,
    preferences: dict = None,
    generate_image: bool = False
) -> RecipeState:
    """
    Execute the recipe generation workflow.
    
    Args:
        pokemon_id: ID of the Pokemon
        preferences: User preferences (optional)
        generate_image: Whether to generate an image
        
    Returns:
        Final state with recipe data or errors
    """
    initial_state: RecipeState = {
        "pokemon_id": pokemon_id,
        "pokemon_name": None,
        "pokemon_data": None,
        "user_preferences": preferences,
        "generate_image": generate_image,
        "recipe_prompt": None,
        "raw_recipe": None,
        "validated_recipe": None,
        "recipe_id": None,
        "image_url": None,
        "image_prompt": None,
        "errors": []
    }
    
    # Execute the workflow
    result = await recipe_workflow.ainvoke(initial_state)
    
    return result
