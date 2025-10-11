from typing import Optional
from sqlalchemy.orm import Session
from ..models import OpenAIUsage
from ..database import SessionLocal
from ..utils.logger import setup_logger

logger = setup_logger(__name__)


class UsageTracker:
    """Track OpenAI API usage and costs."""

    PRICING = {
        "gpt-4o": {
            "input": 2.50 / 1_000_000,
            "output": 10.00 / 1_000_000
        },
        "gpt-image-1": {
            "low": 0.01,
            "medium": 0.04,
            "high": 0.17
        }
    }

    def track_llm_usage(
        self,
        model: str,
        prompt_tokens: int,
        completion_tokens: int,
        recipe_id: Optional[int] = None,
        pokemon_id: Optional[int] = None
    ) -> float:
        """Track LLM usage and return cost."""
        total_tokens = prompt_tokens + completion_tokens

        input_cost = prompt_tokens * self.PRICING[model]["input"]
        output_cost = completion_tokens * self.PRICING[model]["output"]
        total_cost = input_cost + output_cost

        db = SessionLocal()
        try:
            usage = OpenAIUsage(
                request_type="recipe_generation",
                model=model,
                prompt_tokens=prompt_tokens,
                completion_tokens=completion_tokens,
                total_tokens=total_tokens,
                cost_usd=total_cost,
                recipe_id=recipe_id,
                pokemon_id=pokemon_id
            )
            db.add(usage)
            db.commit()
        except Exception as e:
            logger.error(f"Error tracking LLM usage: {e}")
            db.rollback()
        finally:
            db.close()

        return total_cost

    def track_image_usage(
        self,
        quality: str,
        recipe_id: Optional[int] = None,
        pokemon_id: Optional[int] = None
    ) -> float:
        """Track image generation usage and return cost."""
        cost = self.PRICING["gpt-image-1"].get(quality, 0.04)

        db = SessionLocal()
        try:
            usage = OpenAIUsage(
                request_type="image_generation",
                model="gpt-image-1",
                prompt_tokens=0,
                completion_tokens=0,
                total_tokens=0,
                cost_usd=cost,
                recipe_id=recipe_id,
                pokemon_id=pokemon_id
            )
            db.add(usage)
            db.commit()
        except Exception as e:
            logger.error(f"Error tracking image usage: {e}")
            db.rollback()
        finally:
            db.close()

        return cost


usage_tracker = UsageTracker()
