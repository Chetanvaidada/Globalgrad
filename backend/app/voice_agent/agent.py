from __future__ import annotations

import logging

import os

import sys



# Add backend directory to sys.path to allow imports from app

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))



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



from app.db.session import SessionLocal

from app.models.onboarding import UserOnboarding

from app.models.university import UniversityStatus

from app.crud import crud_university

from .prompts import SYSTEM_INSTRUCTION, WELCOME_MESSAGE



load_dotenv()

logger = logging.getLogger("voice-agent")



@dataclass

class UserData:

    user_id: int





class Assistant(Agent):

    def __init__(self) -> None:

        super().__init__(instructions=SYSTEM_INSTRUCTION)



    @function_tool()

    async def get_user_profile(self, context: RunContext[UserData]) -> str:

        """Get the user's profile information (GPA, scores, budget, etc.)."""

        user_id = context.userdata.user_id

        logger.info(f"Fetching profile for user {user_id}")



        db = SessionLocal()

        try:

            profile = (

                db.query(UserOnboarding)

                .filter(UserOnboarding.user_id == user_id)

                .first()

            )

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



        db = SessionLocal()

        try:

            crud_university.update_university_status(

                db,

                user_id,

                university_id,

                UniversityStatus.shortlisted,

            )

            return f"Successfully added {university_id} to shortlist."

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



        db = SessionLocal()

        try:

            crud_university.update_university_status(

                db,

                user_id,

                university_id,

                UniversityStatus.locked,

            )

            return f"Successfully locked {university_id}."

        except Exception as e:

            logger.error(f"Error locking: {e}")

            return "Failed to lock university."

        finally:

            db.close()



    @function_tool()

    async def get_my_list(self, context: RunContext[UserData]) -> str:

        """Get the current list of shortlisted or locked universities."""

        user_id = context.userdata.user_id



        db = SessionLocal()

        try:

            unis = crud_university.get_user_universities(db, user_id)

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



    # Parse user ID from identity; if not numeric, use the identity string as-is

    try:

        user_id = int(participant.identity)

    except ValueError:

        logger.warning(f"Could not parse user ID from identity '{participant.identity}'. Using as-is.")

        user_id = 0 



    session = AgentSession(

        llm=google.realtime.RealtimeModel(

            voice="Puck",

            temperature=0.8,

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

        agent=Assistant(),

        room=ctx.room,

        room_options=RoomOptions(participant_identity=participant.identity),

    )



    logger.info(f"AgentSession started for participant_identity={participant.identity}")



    session.generate_reply(

        instructions=f"Say exactly this greeting to the user: {WELCOME_MESSAGE}",

        allow_interruptions=True,

    )





if __name__ == "__main__":

    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint))

