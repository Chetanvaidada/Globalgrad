from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api import deps
from app.models.user import User
from app.schemas.onboarding import Onboarding, OnboardingUpdate
from app.crud import crud_onboarding

router = APIRouter()


@router.get("", response_model=Onboarding | None)
def get_my_onboarding(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """Get current user's onboarding data."""
    return crud_onboarding.get_by_user_id(db, user_id=current_user.id)


@router.put("", response_model=Onboarding)
def upsert_my_onboarding(
    body: OnboardingUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """Create or update onboarding and mark user as onboarded."""
    record = crud_onboarding.upsert(db, user_id=current_user.id, obj_in=body)
    current_user.is_onboarded = True
    db.add(current_user)
    db.commit()
    db.refresh(record)
    return record
