import requests
import json
from typing import Dict, Any, Optional
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from ..config import settings
from ..database import SessionLocal
from ..models import PokemonCache
from ..utils.logger import setup_logger

logger = setup_logger(__name__)


class PokeAPIService:
    """Service for interacting with PokéAPI."""

    def __init__(self):
        self.base_url = settings.pokeapi_base_url
        self.cache_ttl_hours = 24
        
    def _get_from_cache(self, name: str, db: Session) -> Optional[Dict[str, Any]]:
        """Get Pokemon data from cache if not expired."""
        cache_entry = db.query(PokemonCache).filter(PokemonCache.name == name.lower()).first()

        if cache_entry:
            cache_age = datetime.utcnow() - cache_entry.cached_at
            if cache_age < timedelta(hours=self.cache_ttl_hours):
                return json.loads(cache_entry.data)
            else:
                db.delete(cache_entry)
                db.commit()

        return None

    def _save_to_cache(self, name: str, data: Dict[str, Any], db: Session):
        """Save Pokemon data to cache."""
        try:
            cache_entry = PokemonCache(
                name=name.lower(),
                data=json.dumps(data)
            )
            db.add(cache_entry)
            db.commit()
        except Exception as e:
            logger.error(f"Error saving Pokemon to cache: {e}")
            db.rollback()

    def get_pokemon(self, identifier: int | str) -> Optional[Dict[str, Any]]:
        """
        Fetch Pokemon data from PokéAPI.

        Args:
            identifier: Pokemon ID or name

        Returns:
            Dict with Pokemon data or None if not found
        """
        db = SessionLocal()
        try:
            cache_key = str(identifier).lower()
            cached_data = self._get_from_cache(cache_key, db)

            if cached_data:
                return cached_data

            url = f"{self.base_url}/pokemon/{identifier}"
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            data = response.json()

            self._save_to_cache(cache_key, data, db)

            return data
        except requests.exceptions.RequestException as e:
            logger.error(f"Error fetching Pokemon {identifier} from API: {e}")
            return None
        finally:
            db.close()
    
    def get_pokemon_species(self, identifier: int | str) -> Optional[Dict[str, Any]]:
        """
        Fetch Pokemon species data (for color, habitat, etc).

        Args:
            identifier: Pokemon ID or name

        Returns:
            Dict with species data or None if not found
        """
        db = SessionLocal()
        try:
            cache_key = f"species_{str(identifier).lower()}"
            cached_data = self._get_from_cache(cache_key, db)

            if cached_data:
                return cached_data

            url = f"{self.base_url}/pokemon-species/{identifier}"
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            data = response.json()

            self._save_to_cache(cache_key, data, db)

            return data
        except requests.exceptions.RequestException as e:
            logger.error(f"Error fetching Pokemon species {identifier} from API: {e}")
            return None
        finally:
            db.close()
    
    def extract_attributes(self, pokemon_id: int) -> Dict[str, Any]:
        """
        Extract relevant attributes for recipe generation.

        Args:
            pokemon_id: Pokemon ID

        Returns:
            Dict with extracted attributes
        """
        # Get basic Pokemon data
        pokemon_data = self.get_pokemon(pokemon_id)
        if not pokemon_data:
            return {}

        # Get species data for additional attributes
        species_data = self.get_pokemon_species(pokemon_id)

        # Extract types (with protection against None)
        types_data = pokemon_data.get("types") or []
        types = []
        for t in types_data:
            try:
                type_name = t.get("type", {}).get("name") if isinstance(t, dict) and t.get("type") else None
                if type_name:
                    types.append(type_name)
            except AttributeError:
                continue

        # Extract color from species (with protection against None)
        color = "unknown"
        if species_data:
            color_obj = species_data.get("color")
            if isinstance(color_obj, dict):
                color = color_obj.get("name", "unknown")

        # Extract habitat (with protection against None)
        habitat = "unknown"
        if species_data:
            habitat_obj = species_data.get("habitat")
            if isinstance(habitat_obj, dict):
                habitat = habitat_obj.get("name", "unknown")

        # Extract flavor text (description) (with protection against None)
        flavor_texts = species_data.get("flavor_text_entries") or [] if species_data else []
        description = ""
        for entry in flavor_texts:
            if isinstance(entry, dict):
                lang_obj = entry.get("language")
                if isinstance(lang_obj, dict) and lang_obj.get("name") == "en":
                    flavor_text = entry.get("flavor_text", "").replace("\n", " ").replace("\f", " ")
                    if flavor_text:
                        description = flavor_text
                        break

        # Extract sprite (with protection against nested None)
        sprite = ""
        sprites_obj = pokemon_data.get("sprites")
        if isinstance(sprites_obj, dict):
            other_obj = sprites_obj.get("other", {})
            if isinstance(other_obj, dict):
                official_artwork = other_obj.get("official-artwork", {})
                if isinstance(official_artwork, dict):
                    sprite = official_artwork.get("front_default", "")

        return {
            "id": pokemon_data.get("id"),
            "name": pokemon_data.get("name"),
            "types": types,
            "color": color,
            "habitat": habitat,
            "description": description,
            "height": pokemon_data.get("height", 0),
            "weight": pokemon_data.get("weight", 0),
            "sprite": sprite
        }
    
    def search_pokemon(self, query: str, limit: int = 20) -> list[Dict[str, Any]]:
        """
        Search for Pokemon by name prefix.
        
        Args:
            query: Search query
            limit: Maximum number of results
            
        Returns:
            List of matching Pokemon
        """
        try:
            # Get list of all Pokemon
            url = f"{self.base_url}/pokemon?limit=1000"
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            data = response.json()
            
            # Filter by query
            results = []
            query_lower = query.lower()
            for pokemon in data.get("results", []):
                if query_lower in pokemon["name"].lower():
                    # Extract ID from URL
                    pokemon_id = pokemon["url"].rstrip("/").split("/")[-1]
                    results.append({
                        "id": int(pokemon_id),
                        "name": pokemon["name"]
                    })
                    if len(results) >= limit:
                        break
            
            return results
        except requests.exceptions.RequestException as e:
            logger.error(f"Error searching Pokemon with query '{query}': {e}")
            return []


# Create global instance
pokeapi_service = PokeAPIService()
