from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # OpenAI Configuration
    openai_api_key: str
    
    # Database Configuration
    database_url: str = "sqlite:///./recipes.db"
    
    # PokéAPI Configuration
    pokeapi_base_url: str = "https://pokeapi.co/api/v2"
    
    # CORS Configuration
    cors_origins: str = "http://localhost:5173"
    
    # LangChain Configuration (optional)
    langchain_tracing_v2: bool = False
    langchain_api_key: str = ""

    # OpenAI Budget Configuration
    openai_budget_limit: float = 50.0
    
    @property
    def cors_origins_list(self) -> List[str]:
        """Convert CORS origins string to list."""
        return [origin.strip() for origin in self.cors_origins.split(",")]
    
    class Config:
        env_file = ".env"
        case_sensitive = False


# Create global settings instance
settings = Settings()
