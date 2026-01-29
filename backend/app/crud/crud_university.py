from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.university import UserUniversity, UniversityStatus

def get_user_universities(db: Session, user_id: int) -> List[UserUniversity]:
    return db.query(UserUniversity).filter(UserUniversity.user_id == user_id).all()

def get_user_university(db: Session, user_id: int, university_id: str) -> Optional[UserUniversity]:
    return db.query(UserUniversity).filter(
        UserUniversity.user_id == user_id,
        UserUniversity.university_id == university_id
    ).first()

def update_university_status(
    db: Session, 
    user_id: int, 
    university_id: str, 
    status: UniversityStatus
) -> UserUniversity:
    existing = get_user_university(db, user_id, university_id)
    
    if existing:
        existing.status = status
        db.commit()
        db.refresh(existing)
        return existing
    else:
        new_selection = UserUniversity(
            user_id=user_id,
            university_id=university_id,
            status=status
        )
        db.add(new_selection)
        db.commit()
        db.refresh(new_selection)
        return new_selection

def remove_university(db: Session, user_id: int, university_id: str) -> bool:
    existing = get_user_university(db, user_id, university_id)
    if existing:
        db.delete(existing)
        db.commit()
        return True
    return False
