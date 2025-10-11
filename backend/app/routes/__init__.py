from fastapi import APIRouter
from .pokemon import router as pokemon_router
from .recipes import router as recipes_router
from .usage import router as usage_router

api_router = APIRouter()

api_router.include_router(pokemon_router, prefix="/pokemon", tags=["pokemon"])
api_router.include_router(recipes_router, prefix="/recipes", tags=["recipes"])
api_router.include_router(usage_router, prefix="/usage", tags=["usage"])

__all__ = ["api_router"]
