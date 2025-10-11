"""
Seed data for initial database population.
This script populates the database with default recipes from JSON files.
"""
import json
import os
from sqlalchemy.orm import Session
from .models import Recipe
from .database import SessionLocal
from .utils.logger import setup_logger

logger = setup_logger(__name__)

# Paths to the recipe JSON files
RECIPE_FILES = [
    "/app/data/recipe_14.json",
    "/app/data/recipe_10.json",
    "/app/data/recipe_9.json",
    "/app/data/recipe_7.json"
]


def load_recipe_from_json(file_path: str) -> dict:
    """
    Load recipe data from a JSON file.
    
    Args:
        file_path: Path to the JSON file
    
    Returns:
        Dictionary containing recipe data
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        logger.error(f"Error loading recipe from {file_path}: {e}")
        return None


def seed_database(db: Session = None):
    """
    Seed the database with default recipes from JSON files.
    Only runs if the database is empty.
    """
    # Create a database session if not provided
    if db is None:
        db = SessionLocal()
        should_close = True
    else:
        should_close = False
    
    try:
        # Check if recipes already exist
        existing_recipes = db.query(Recipe).count()
        
        if existing_recipes > 0:
            logger.info(f"Database already contains {existing_recipes} recipes. Skipping seed.")
            return
        
        logger.info("🌱 Starting database seeding with default recipes from JSON files...")
        
        # Load and create each recipe
        for recipe_file in RECIPE_FILES:
            if not os.path.exists(recipe_file):
                logger.warning(f"⚠️  Recipe file not found: {recipe_file}")
                continue
            
            logger.info(f"Loading recipe from: {recipe_file}")
            recipe_data = load_recipe_from_json(recipe_file)
            
            if recipe_data is None:
                logger.warning(f"⚠️  Failed to load recipe from {recipe_file}")
                continue
            
            # Create recipe object (excluding 'id' and 'created_at' as they will be auto-generated)
            recipe = Recipe(
                pokemon_id=recipe_data.get("pokemon_id"),
                pokemon_name=recipe_data.get("pokemon_name"),
                recipe_title=recipe_data.get("recipe_title"),
                description=recipe_data.get("description"),
                ingredients=recipe_data.get("ingredients"),  # Already JSON string
                instructions=recipe_data.get("instructions"),  # Already JSON string
                difficulty=recipe_data.get("difficulty"),
                prep_time=recipe_data.get("prep_time"),
                thematic_connection=recipe_data.get("thematic_connection"),
                presentation=recipe_data.get("presentation"),
                image_url=recipe_data.get("image_url")  # Already includes base64 data
            )
            
            db.add(recipe)
            logger.info(f"✅ Recipe '{recipe_data.get('recipe_title')}' added to database")
        
        # Commit all changes
        db.commit()
        logger.info("🎉 Database seeding completed successfully!")
        logger.info(f"📊 Total recipes created: {db.query(Recipe).count()}")
        
    except Exception as e:
        logger.error(f"❌ Error seeding database: {e}")
        db.rollback()
        raise
    finally:
        if should_close:
            db.close()


if __name__ == "__main__":
    # Allow running this script directly for testing
    seed_database()

