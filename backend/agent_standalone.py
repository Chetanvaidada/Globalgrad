"""
Completely standalone LiveKit Voice Agent for Cloud Deployment
No dependencies on app.core.config - all imports are lazy/runtime only
"""
from __future__ import annotations

import logging
import os
import json
import sys
from dataclasses import dataclass
from dotenv import load_dotenv

from livekit.agents import (
    AutoSubscribe,
    JobContext,
    WorkerOptions,
    cli,
)
from livekit.agents.llm import function_tool
from livekit.agents.voice import Agent, AgentSession
from livekit.agents.voice.events import RunContext
from livekit.agents.voice.room_io import RoomOptions
from livekit.plugins import google

# Direct SQLAlchemy imports - NO app imports at module level
from sqlalchemy import create_engine, Column, Integer, String, Enum as SQLEnum, text
from sqlalchemy.orm import sessionmaker

load_dotenv()

logger = logging.getLogger("voice-agent")

BACKEND_DIR = os.path.dirname(__file__)


def _ensure_backend_on_syspath() -> None:
    if BACKEND_DIR not in sys.path:
        sys.path.insert(0, BACKEND_DIR)

# SYSTEM INSTRUCTION (copied from prompts.py to avoid imports)
SYSTEM_INSTRUCTION = """You are a helpful AI counsellor assisting students with their study abroad journey. You can:
- Get user profile information (GPA, test scores, budget, etc.)
- Add universities to their shortlist
- Lock universities as final choices
- Show their current university list

Be friendly, helpful, and concise in your responses."""

WELCOME_MESSAGE = "Hello! I'm your AI study abroad counsellor. How can I help you today?"

try:
    _ensure_backend_on_syspath()
    from app.voice_agent.prompts import SYSTEM_INSTRUCTION as _SYSTEM_INSTRUCTION, WELCOME_MESSAGE as _WELCOME_MESSAGE

    SYSTEM_INSTRUCTION = _SYSTEM_INSTRUCTION
    WELCOME_MESSAGE = _WELCOME_MESSAGE
    logger.info("Loaded prompts from app.voice_agent.prompts")
except Exception as e:
    logger.warning(f"Falling back to embedded prompts. Error loading app.voice_agent.prompts: {e}")

# Create database session factory using environment variable
DATABASE_URL = os.getenv("DATABASE_URL")
if DATABASE_URL:
    engine = create_engine(DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
else:
    logger.warning("DATABASE_URL not set")
    SessionLocal = None


@dataclass
class UserData:
    user_id: int


def get_user_profile_from_db(db, user_id: int):
    """Get user profile without importing app models"""
    try:
        row = db.execute(
            text(
                """
                SELECT
                    current_education_level,
                    degree_major,
                    gpa_or_percentage,
                    intended_degree,
                    field_of_study,
                    target_intake_year,
                    budget_range_per_year,
                    funding_plan,
                    ielts_toefl_status,
                    ielts_toefl_score,
                    gre_gmat_status,
                    gre_gmat_score
                FROM user_onboarding
                WHERE user_id = :user_id
                """
            ),
            {"user_id": user_id},
        ).mappings().first()

        return row
    except Exception as e:
        logger.error(f"Error getting profile: {e}")
        return None


def update_university_status_in_db(db, user_id: int, university_id: str, status: str):
    """Update university status without importing app models at module level"""
    try:
        status_value = "shortlisted" if status == "shortlisted" else "locked"

        existing_id = db.execute(
            text(
                """
                SELECT id
                FROM user_universities
                WHERE user_id = :user_id AND university_id = :university_id
                """
            ),
            {"user_id": user_id, "university_id": university_id},
        ).scalar()

        if existing_id is not None:
            db.execute(
                text("UPDATE user_universities SET status = :status WHERE id = :id"),
                {"status": status_value, "id": existing_id},
            )
        else:
            db.execute(
                text(
                    """
                    INSERT INTO user_universities (user_id, university_id, status)
                    VALUES (:user_id, :university_id, :status)
                    """
                ),
                {"user_id": user_id, "university_id": university_id, "status": status_value},
            )

        db.commit()
        return True
    except Exception as e:
        logger.error(f"Error updating status: {e}")
        try:
            db.rollback()
        except Exception:
            pass
        return False


def get_user_universities_from_db(db, user_id: int):
    """Get user universities without importing app models at module level"""
    try:
        rows = db.execute(
            text(
                """
                SELECT university_id, status
                FROM user_universities
                WHERE user_id = :user_id
                ORDER BY id ASC
                """
            ),
            {"user_id": user_id},
        ).mappings().all()

        return rows
    except Exception as e:
        logger.error(f"Error getting universities: {e}")
        return []


class Assistant(Agent):
    def __init__(self, room) -> None:
        super().__init__(instructions=SYSTEM_INSTRUCTION)
        self.room = room

    @function_tool()
    async def get_user_profile(self, context: RunContext[UserData]) -> str:
        """Get the user's profile information (GPA, scores, budget, etc.)."""
        user_id = context.userdata.user_id
        logger.info(f"Fetching profile for user {user_id}")

        if not SessionLocal:
            return "Database not configured"

        db = SessionLocal()
        try:
            profile = get_user_profile_from_db(db, user_id)
            if not profile:
                return "User profile not found. Please ask the user to complete onboarding."

            profile_str = f"""
        - Education Level: {profile.current_education_level}
        - Major: {profile.degree_major}
        - GPA: {profile.gpa_or_percentage}
        - Intended Degree: {profile.intended_degree} in {profile.field_of_study}
        - Target Intake: {profile.target_intake_year}
        - Budget: {profile.budget_range_per_year} ({profile.funding_plan})
        - IELTS/TOEFL: {profile.ielts_toefl_status} ({profile.ielts_toefl_score or 'N/A'})
        - GRE/GMAT: {profile.gre_gmat_status} ({profile.gre_gmat_score or 'N/A'})
        """
            return profile_str
        finally:
            db.close()

    @function_tool()
    async def add_to_shortlist(self, context: RunContext[UserData], university_id: str) -> str:
        """Add a university to the user's shortlist.
        
        Args:
            university_id: The ID of the university (e.g., 'usa-1').
        """
        user_id = context.userdata.user_id
        logger.info(f"Shortlisting {university_id} for user {user_id}")

        if not SessionLocal:
            return "Database not configured"

        db = SessionLocal()
        try:
            if update_university_status_in_db(db, user_id, university_id, "shortlisted"):
                await self.room.local_participant.publish_data(
                    payload=json.dumps({"type": "university_update", "action": "shortlist", "id": university_id}),
                    topic="university_update"
                )
                return f"Successfully added {university_id} to shortlist."
            else:
                return "Failed to shortlist university."
        except Exception as e:
            logger.error(f"Error shortlisting: {e}")
            return "Failed to shortlist university."
        finally:
            db.close()

    @function_tool()
    async def lock_university(self, context: RunContext[UserData], university_id: str) -> str:
        """Lock a university (confirm as final choice).
        
        Args:
            university_id: The ID of the university (e.g., 'usa-1').
        """
        user_id = context.userdata.user_id
        logger.info(f"Locking {university_id} for user {user_id}")

        if not SessionLocal:
            return "Database not configured"

        db = SessionLocal()
        try:
            if update_university_status_in_db(db, user_id, university_id, "locked"):
                await self.room.local_participant.publish_data(
                    payload=json.dumps({"type": "university_update", "action": "lock", "id": university_id}),
                    topic="university_update"
                )
                return f"Successfully locked {university_id}."
            else:
                return "Failed to lock university."
        except Exception as e:
            logger.error(f"Error locking: {e}")
            return "Failed to lock university."
        finally:
            db.close()

    @function_tool()
    async def get_my_list(self, context: RunContext[UserData]) -> str:
        """Get the current list of shortlisted or locked universities."""
        user_id = context.userdata.user_id

        if not SessionLocal:
            return "Database not configured"

        db = SessionLocal()
        try:
            unis = get_user_universities_from_db(db, user_id)
            if not unis:
                return "No universities currently in your list."

            return "\n".join([f"- {u.university_id} ({u.status})" for u in unis])
        finally:
            db.close()


async def entrypoint(ctx: JobContext):
    logger.info(f"connecting to room {ctx.room.name}")
    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)

    ctx.room.on(
        "track_published",
        lambda pub, participant: logger.info(
            f"track_published participant={participant.identity} kind={pub.kind} source={pub.source} name={pub.name} sid={pub.sid}"
        ),
    )
    ctx.room.on(
        "track_subscribed",
        lambda track, pub, participant: logger.info(
            f"track_subscribed participant={participant.identity} kind={pub.kind} source={pub.source} name={pub.name} sid={pub.sid}"
        ),
    )

    # Wait for the first participant to connect
    participant = await ctx.wait_for_participant()
    logger.info(f"starting voice assistant for participant {participant.identity}")

    # Parse user ID from identity
    try:
        user_id = int(participant.identity)
    except ValueError:
        logger.warning(f"Could not parse user ID from identity '{participant.identity}'. Using as-is.")
        user_id = 0 

    logger.info(f"Initializing agent session for user_id={user_id} (identity={participant.identity})")
    session = AgentSession(
        llm=google.realtime.RealtimeModel(
            voice="Puck",
            temperature=0.8,
            language="en-US",
        ),
        userdata=UserData(user_id=user_id),
    )

    session.on(
        "user_state_changed",
        lambda ev: logger.info(f"user_state_changed {ev.old_state} -> {ev.new_state}"),
    )
    session.on(
        "agent_state_changed",
        lambda ev: logger.info(f"agent_state_changed {ev.old_state} -> {ev.new_state}"),
    )
    session.on(
        "user_input_transcribed",
        lambda ev: logger.info(
            f"user_input_transcribed final={ev.is_final} speaker_id={ev.speaker_id} transcript={ev.transcript!r}"
        ),
    )
    session.on(
        "error",
        lambda ev: logger.error(
            f"agent_session_error source={type(ev.source).__name__} error={ev.error!r}"
        ),
    )

    await session.start(
        agent=Assistant(room=ctx.room),
        room=ctx.room,
        room_options=RoomOptions(
            participant_identity=participant.identity,
            close_on_disconnect=False,
        ),
    )

    logger.info(f"AgentSession started for participant_identity={participant.identity}")

    session.generate_reply(
        instructions=f"Say exactly this greeting to the user: {WELCOME_MESSAGE}",
        allow_interruptions=True,
    )


if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint))
