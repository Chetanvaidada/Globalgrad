from fastapi import APIRouter
from app.api.v1.endpoints import auth, onboarding, universities, voice

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(onboarding.router, prefix="/onboarding", tags=["onboarding"])
api_router.include_router(universities.router, prefix="/universities", tags=["universities"])
api_router.include_router(voice.router, prefix="/voice", tags=["voice"])
