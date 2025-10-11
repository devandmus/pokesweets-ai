from sqlalchemy import Column, Integer, String, Text, DateTime, Float, ForeignKey
from datetime import datetime
from .database import Base


class Recipe(Base):
    """Recipe model for storing generated dessert recipes."""
    
    __tablename__ = "recipes"
    
    id = Column(Integer, primary_key=True, index=True)
    pokemon_id = Column(Integer, nullable=False, index=True)
    pokemon_name = Column(String(100), nullable=False)
    recipe_title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    ingredients = Column(Text, nullable=False)  # JSON string
    instructions = Column(Text, nullable=False)  # JSON string
    difficulty = Column(String(20))
    prep_time = Column(Integer)
    thematic_connection = Column(Text)
    presentation = Column(Text)
    image_url = Column(String(500))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        """Convert model to dictionary."""
        return {
            "id": self.id,
            "pokemon_id": self.pokemon_id,
            "pokemon_name": self.pokemon_name,
            "recipe_title": self.recipe_title,
            "description": self.description,
            "ingredients": self.ingredients,
            "instructions": self.instructions,
            "difficulty": self.difficulty,
            "prep_time": self.prep_time,
            "thematic_connection": self.thematic_connection,
            "presentation": self.presentation,
            "image_url": self.image_url,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }


class PokemonCache(Base):
    """Cache for PokéAPI responses to reduce API calls."""

    __tablename__ = "pokemon_cache"

    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False, unique=True, index=True)
    data = Column(Text, nullable=False)
    cached_at = Column(DateTime, default=datetime.utcnow)

    def to_dict(self):
        """Convert model to dictionary."""
        return {
            "id": self.id,
            "name": self.name,
            "data": self.data,
            "cached_at": self.cached_at.isoformat() if self.cached_at else None
        }


class OpenAIUsage(Base):
    """Track OpenAI API usage for cost monitoring."""

    __tablename__ = "openai_usage"

    id = Column(Integer, primary_key=True, index=True)
    request_type = Column(String(50), nullable=False, index=True)
    model = Column(String(50), nullable=False)
    prompt_tokens = Column(Integer, default=0)
    completion_tokens = Column(Integer, default=0)
    total_tokens = Column(Integer, nullable=False)
    cost_usd = Column(Float, nullable=False)
    recipe_id = Column(Integer, ForeignKey("recipes.id", ondelete="SET NULL"), nullable=True, index=True)
    pokemon_id = Column(Integer, nullable=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    def to_dict(self):
        """Convert model to dictionary."""
        return {
            "id": self.id,
            "request_type": self.request_type,
            "model": self.model,
            "prompt_tokens": self.prompt_tokens,
            "completion_tokens": self.completion_tokens,
            "total_tokens": self.total_tokens,
            "cost_usd": self.cost_usd,
            "recipe_id": self.recipe_id,
            "pokemon_id": self.pokemon_id,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
