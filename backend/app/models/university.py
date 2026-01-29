from sqlalchemy import Column, Integer, String, ForeignKey, Enum
from sqlalchemy.orm import relationship
from app.db.session import Base
import enum

class UniversityStatus(str, enum.Enum):
    shortlisted = "shortlisted"
    locked = "locked"

class UserUniversity(Base):
    __tablename__ = "user_universities"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    university_id = Column(String, nullable=False) # ID from the frontend static data (e.g., 'usa-1')
    status = Column(Enum(UniversityStatus), default=UniversityStatus.shortlisted, nullable=False)

    user = relationship("User", back_populates="universities")
