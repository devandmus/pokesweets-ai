from openai import OpenAI
from typing import Optional
from ..config import settings
from .usage_tracker import usage_tracker
from ..utils.logger import setup_logger

logger = setup_logger(__name__)


class ImageService:
    """Service for generating images using gpt-image-1 (state-of-the-art image generation model)."""

    def __init__(self):
        self.client = OpenAI(api_key=settings.openai_api_key)

    def generate_image(
        self,
        prompt: str,
        size: str = "1024x1024",
        recipe_id: Optional[int] = None,
        pokemon_id: Optional[int] = None
    ) -> Optional[str]:
        """
        Generate an image using gpt-image-1 (state-of-the-art image generation model).

        Args:
            prompt: Image generation prompt (detailed and specific)
            size: Image size (1024x1024, 1024x1792, 1792x1024)

        Returns:
            Base64-encoded image data or None if generation fails
        """
        try:
            # Use gpt-image-1 for high-quality image generation
            response = self.client.images.generate(
                model="gpt-image-1",
                prompt=prompt,
                size=size,
                quality="medium",
                n=1
            )

            # gpt-image-1 returns base64 encoded images by default
            if response.data and len(response.data) > 0:
                usage_tracker.track_image_usage(
                    quality="medium",
                    recipe_id=recipe_id,
                    pokemon_id=pokemon_id
                )
                # Check if we have b64_json or need to get from url
                if hasattr(response.data[0], 'b64_json') and response.data[0].b64_json:
                    return response.data[0].b64_json
                elif hasattr(response.data[0], 'url') and response.data[0].url:
                    # If we get a URL, we need to download and convert to base64
                    import base64
                    import requests as req
                    img_response = req.get(response.data[0].url)
                    return base64.b64encode(img_response.content).decode('utf-8')
            return None

        except Exception as e:
            logger.error(f"Error generating image with gpt-image-1 (medium quality): {e}")
            try:
                # Fallback to gpt-image-1 with standard quality
                response = self.client.images.generate(
                    model="gpt-image-1",
                    prompt=prompt,
                    size=size,
                    quality="low",
                    n=1
                )
                if response.data and len(response.data) > 0:
                    usage_tracker.track_image_usage(
                        quality="low",
                        recipe_id=recipe_id,
                        pokemon_id=pokemon_id
                    )
                    # Check if we have b64_json or need to get from url
                    if hasattr(response.data[0], 'b64_json') and response.data[0].b64_json:
                        return response.data[0].b64_json
                    elif hasattr(response.data[0], 'url') and response.data[0].url:
                        # If we get a URL, we need to download and convert to base64
                        import base64
                        import requests as req
                        img_response = req.get(response.data[0].url)
                        return base64.b64encode(img_response.content).decode('utf-8')
            except Exception as e2:
                logger.error(f"Error generating image with gpt-image-1 (low quality fallback): {e2}")
                return None


# Create global instance
image_service = ImageService()
