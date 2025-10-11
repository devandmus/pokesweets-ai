from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .database import init_db
from .routes import api_router

# Initialize FastAPI app
app = FastAPI(
    title="PokeSweets API",
    description="API for generating Pokemon-themed dessert recipes using AI",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    """Initialize database on startup."""
    init_db()
    print("✅ Database initialized")
    print(f"✅ CORS enabled for: {settings.cors_origins_list}")


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "Welcome to PokeSweets API",
        "docs": "/docs",
        "version": "1.0.0"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}


# Include API routes
app.include_router(api_router, prefix="/api")
