from typing import Optional
from sqlalchemy.orm import Session
from app.models.onboarding import UserOnboarding
from app.schemas.onboarding import OnboardingCreate, OnboardingUpdate


def get_by_user_id(db: Session, *, user_id: int) -> Optional[UserOnboarding]:
    return db.query(UserOnboarding).filter(UserOnboarding.user_id == user_id).first()


def create(db: Session, *, user_id: int, obj_in: OnboardingCreate) -> UserOnboarding:
    db_obj = UserOnboarding(user_id=user_id, **obj_in.model_dump(exclude_unset=False))
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


def update(db: Session, *, db_obj: UserOnboarding, obj_in: OnboardingUpdate) -> UserOnboarding:
    data = obj_in.model_dump(exclude_unset=True)
    for field, value in data.items():
        setattr(db_obj, field, value)
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


def upsert(db: Session, *, user_id: int, obj_in: OnboardingUpdate) -> UserOnboarding:
    existing = get_by_user_id(db, user_id=user_id)
    if existing:
        return update(db, db_obj=existing, obj_in=obj_in)
    return create(db, user_id=user_id, obj_in=OnboardingCreate(**obj_in.model_dump()))
