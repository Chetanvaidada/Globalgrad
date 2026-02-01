from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.api import api_router
from app.core.config import settings
from app.db.session import engine, Base
import app.models.user  # noqa: F401
import app.models.onboarding  # noqa: F401  # register tables for create_all

app = FastAPI(
    title=settings.PROJECT_NAME,
)

# With credentials (cookies), browsers reject "*". Use explicit origins.
origins = [o.strip() for o in settings.BACKEND_CORS_ORIGINS.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/health/db")
def db_health(db: Session = Depends(get_db)):
    db.execute("SELECT 1")
    return {"db": "ok"}


@app.get("/")
def root():
    return {"message": f"Welcome to {settings.PROJECT_NAME} API"}
