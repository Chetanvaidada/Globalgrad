from pydantic import BaseModel
from typing import Optional
from app.models.university import UniversityStatus

class UserUniversityBase(BaseModel):
    university_id: str
    status: UniversityStatus

class UserUniversityCreate(UserUniversityBase):
    pass

class UserUniversityUpdate(UserUniversityBase):
    pass

class UserUniversity(UserUniversityBase):
    id: int
    user_id: int

    class Config:
        orm_mode = True
