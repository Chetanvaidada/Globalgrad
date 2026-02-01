from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str
    API_V1_STR: str
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int

    COOKIE_SAMESITE: str = "lax"
    COOKIE_SECURE: bool = False

    # CORS: when using cookies (allow_credentials=True), origins cannot be "*". Comma-separated list. Set in .env.
    BACKEND_CORS_ORIGINS: str

    # Google OAuth
    GOOGLE_CLIENT_ID: str
    GOOGLE_CLIENT_SECRET: str
    # LiveKit
    LIVEKIT_URL: str
    LIVEKIT_API_KEY: str
    LIVEKIT_API_SECRET: str

    # Gemini
    GEMINI_API_KEY: str
    GOOGLE_API_KEY: str
    
    class Config:
        case_sensitive = True
        env_file = ".env"
        env_file_encoding = 'utf-8'

settings = Settings()
