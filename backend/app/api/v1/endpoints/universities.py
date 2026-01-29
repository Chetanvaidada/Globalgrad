from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.schemas.university import UserUniversity as UserUniversitySchema
from app.schemas.university import UserUniversityCreate
from app.crud import crud_university

router = APIRouter()

@router.get("/", response_model=List[UserUniversitySchema])
def read_user_universities(
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user),
):
    """
    Retrieve user's university selections.
    """
    return crud_university.get_user_universities(db, user_id=current_user.id)

@router.post("/", response_model=UserUniversitySchema)
def update_university_selection(
    uni_in: UserUniversityCreate,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user),
):
    """
    Add or Update a university selection (shortlist/lock).
    """
    return crud_university.update_university_status(
        db, 
        user_id=current_user.id, 
        university_id=uni_in.university_id, 
        status=uni_in.status
    )

@router.delete("/{university_id}", response_model=dict)
def remove_university_selection(
    university_id: str,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user),
):
    """
    Remove a university from selection (un-shortlist).
    """
    success = crud_university.remove_university(
        db, 
        user_id=current_user.id, 
        university_id=university_id
    )
    
    if success:
        return {"message": "Selection removed"}
    
    raise HTTPException(status_code=404, detail="University not found in selection")
