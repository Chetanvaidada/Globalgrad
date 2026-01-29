from fastapi import APIRouter, Depends, HTTPException
from app.api import deps
from app.core.config import settings
from livekit import api
import uuid

router = APIRouter()

@router.get("/token")
def get_voice_token(
    current_user = Depends(deps.get_current_user),
):
    """
    Generate a LiveKit token for the authenticated user to join a voice room.
    """
    # Ensure keys are present
    if not settings.LIVEKIT_API_KEY or not settings.LIVEKIT_API_SECRET:
        raise HTTPException(status_code=500, detail="LiveKit credentials not configured")

    # Use a stable room name per user so multiple tabs/playground join the same room
    room_name = f"counsellor-{current_user.id}"
    
    # Identify the user by their ID so the Agent can look them up
    # ensure identity is a string
    identity = str(current_user.id)
    name = current_user.full_name or current_user.email

    token = api.AccessToken(
        settings.LIVEKIT_API_KEY,
        settings.LIVEKIT_API_SECRET,
    ).with_identity(identity) \
    .with_name(name) \
    .with_grants(api.VideoGrants(
        room_join=True,
        room=room_name,
        can_publish=True,
        can_subscribe=True,
        can_publish_data=True,
    ))

    return {"token": token.to_jwt(), "room_name": room_name}
