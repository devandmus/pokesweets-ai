from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from typing import Dict, Any, Optional
from ..config import settings
from .usage_tracker import usage_tracker
from ..utils.logger import setup_logger

logger = setup_logger(__name__)


class LLMService:
    """Service for LLM interactions using LangChain."""
    
    def __init__(self):
        self.llm = ChatOpenAI(
            model="gpt-4o",
            temperature=0.8,
            api_key=settings.openai_api_key,
            model_kwargs={"response_format": {"type": "json_object"}}
        )
        
    def generate_recipe(
        self,
        pokemon_data: Dict[str, Any],
        preferences: Dict[str, Any] = None,
        recipe_id: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Generate a recipe based on Pokemon attributes.

        Args:
            pokemon_data: Pokemon attributes
            preferences: User preferences (optional)

        Returns:
            Dict with recipe data
        """
        # Build preference string
        pref_text = ""
        dessert_pref = ""
        if preferences:
            if preferences.get("dietary"):
                pref_text += f"Restricciones dietéticas: {preferences['dietary']}. "
            if preferences.get("complexity"):
                pref_text += f"Nivel de complejidad: {preferences['complexity']}. "
            if preferences.get("dessert_type"):
                dessert_pref = f"Crea específicamente una {preferences['dessert_type']}."
            elif preferences.get("dessert_description"):
                dessert_pref = f"Descripción del postre deseado: {preferences['dessert_description']}."

        # Create prompt template
        template = """Eres un chef pastelero creativo especializado en postres temáticos de Pokémon.

Información del Pokémon:
- Nombre: {name}
- Tipos: {types}
- Color: {color}
- Hábitat: {habitat}
- Descripción: {description}

{preferences}
{dessert_preference}

IMPORTANTE:
- Responde COMPLETAMENTE en español de América Latina, usando tildes y terminaciones correctas (ej: "postre" no "postre", "tú" no "tu").
- Crea una receta de postre única inspirada en este Pokémon con los siguientes requisitos:
  1. Debe reflejar la apariencia visual del Pokémon (colores, formas)
  2. Incorporar elementos temáticos de su tipo y hábitat
  3. Ser creativa pero realista y ejecutable
  4. Utilizar ÚNICAMENTE ingredientes comunes y fáciles de encontrar en supermercados de Chile (frutillas, uvas, manzanas, duraznos, pisco chileno, vino chileno, harina, azúcar, leche, huevos, etc. - evita ingredientes exóticos o difíciles de conseguir)

Responde con un objeto JSON con la siguiente estructura:
{{
    "title": "Nombre creativo de la receta",
    "description": "Descripción breve que conecte el postre con el Pokémon (2-3 frases)",
    "difficulty": "Fácil|Medio|Difícil",
    "prep_time": <número en minutos>,
    "ingredients": [
        {{"item": "nombre del ingrediente", "quantity": "cantidad", "notes": "notas opcionales"}},
        ...
    ],
    "instructions": [
        "Instrucción del paso 1",
        "Instrucción del paso 2",
        ...
    ],
    "presentation": "Cómo presentar/decorar el postre para que parezca el Pokémon",
    "thematic_connection": "Explicación de cómo la receta refleja las características del Pokémon"
}}"""
        
        prompt = ChatPromptTemplate.from_template(template)
        
        # Create chain with JSON output parser
        parser = JsonOutputParser()
        chain = prompt | self.llm | parser
        
        try:
            chain = prompt | self.llm | parser
            result = chain.invoke({
                "name": pokemon_data.get("name", "").title(),
                "types": ", ".join(pokemon_data.get("types", [])),
                "color": pokemon_data.get("color", "unknown"),
                "habitat": pokemon_data.get("habitat", "unknown"),
                "description": pokemon_data.get("description", "Un Pokémon misterioso"),
                "preferences": pref_text or "Sin preferencias específicas.",
                "dessert_preference": dessert_pref
            })

            prompt_tokens = 800
            completion_tokens = 600
            total_tokens = prompt_tokens + completion_tokens

            cost = usage_tracker.track_llm_usage(
                model="gpt-4o",
                prompt_tokens=prompt_tokens,
                completion_tokens=completion_tokens,
                recipe_id=recipe_id,
                pokemon_id=pokemon_data.get("id")
            )

            result["_usage"] = {
                "prompt_tokens": prompt_tokens,
                "completion_tokens": completion_tokens,
                "total_tokens": total_tokens,
                "cost_usd": cost
            }

            return result
        except Exception as e:
            logger.error(f"Error generating recipe for Pokemon {pokemon_data.get('name')}: {e}")
            return {
                "error": str(e),
                "title": "Error generating recipe",
                "description": "An error occurred during recipe generation",
                "difficulty": "Medium",
                "prep_time": 0,
                "ingredients": [],
                "instructions": [],
                "presentation": "",
                "thematic_connection": ""
            }
    
    def generate_image_prompt(self, recipe_data: Dict[str, Any], pokemon_data: Dict[str, Any]) -> str:
        """
        Generate a detailed image prompt for the dessert image.

        Args:
            recipe_data: Recipe information
            pokemon_data: Pokemon attributes

        Returns:
            Image generation prompt optimized for complete, detailed images
        """
        dessert_title = recipe_data.get('title', 'un postre único')
        pokemon_name = pokemon_data.get('name', '').title()
        pokemon_types = ', '.join(pokemon_data.get('types', ['misterioso']))
        pokemon_color = pokemon_data.get('color', 'colorido')
        presentation = recipe_data.get('presentation', '')

        prompt = f"""Crea una imagen fotográfica profesional completa y detallada de {dessert_title},
una creación culinaria inspirada en el Pokémon {pokemon_name}.

La imagen debe mostrar:
- El postre terminado completo con todos sus componentes y decoraciones
- Elementos característicos de {pokemon_name}: forma, colores ({pokemon_color}), rasgos distintivos
- Estética del tipo Pokémon {pokemon_types}
- Textura detallada de los ingredientes: humos, brillos, texturas matericas
- Entorno gastronómico: plato, cubiertos, iluminación que resalte el postre
- Fondo minimalista o natural que complemente el postre
{presentation}

Fotografía gastronómica profesional de alta calidad, composición centrada,
iluminación natural y dramática, ultra-realista, 8K resolución, vista cenital con
ángulo artístico, colores vibrantes, detalles microscópicos, composición perfecta."""

        return prompt.strip()


# Create global instance
llm_service = LLMService()
