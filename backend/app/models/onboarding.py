from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base


class UserOnboarding(Base):
    """
    Onboarding profile for a user. One row per user.
    Covers: Academic Background, Study Goal, Budget, Exams & Readiness.
    """
    __tablename__ = "user_onboarding"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)

    # A. Academic Background
    current_education_level = Column(String(100), nullable=True)   # e.g. "High School", "Bachelor's"
    degree_major = Column(String(200), nullable=True)
    graduation_year = Column(Integer, nullable=True)
    gpa_or_percentage = Column(String(50), nullable=True)          # optional

    # B. Study Goal
    intended_degree = Column(String(50), nullable=True)            # Bachelor's / Master's / MBA / PhD
    field_of_study = Column(String(200), nullable=True)
    target_intake_year = Column(Integer, nullable=True)
    preferred_countries = Column(Text, nullable=True)              # comma-separated or JSON

    # C. Budget
    budget_range_per_year = Column(String(100), nullable=True)     # e.g. "10-20 Lakhs"
    funding_plan = Column(String(50), nullable=True)               # Self-funded / Scholarship-dependent / Loan-dependent

    # D. Exams & Readiness
    # IELTS/TOEFL: status = given (taken) or not; if taken, store score in ielts_toefl_score
    ielts_toefl_status = Column(String(50), nullable=True)         # "not_taken" | "taken" | "scheduled"
    ielts_toefl_score = Column(String(20), nullable=True)          # e.g. "7.5" (IELTS) or "100" (TOEFL) – when status is "taken"
    # GRE/GMAT: same pattern
    gre_gmat_status = Column(String(50), nullable=True)            # "not_taken" | "taken" | "scheduled"
    gre_gmat_score = Column(String(20), nullable=True)             # e.g. "320" (GRE) or "700" (GMAT) – when status is "taken"
    sop_status = Column(String(50), nullable=True)                 # Not started / Draft / Ready

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", back_populates="onboarding")
