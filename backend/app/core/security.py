import hashlib
from datetime import datetime, timedelta
from typing import Any, Union
from jose import jwt
from passlib.context import CryptContext
from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_access_token(subject: Union[str, Any], expires_delta: timedelta = None) -> str:
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
    to_encode = {"exp": expire, "sub": str(subject)}
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def verify_password(plain_password: str, hashed_password: str) -> bool:
    # Hash the plain password first to match the storage logic
    pre_hashed = hashlib.sha256(plain_password.encode()).hexdigest()
    print(f"DEBUG: verify_password - pre_hashed length: {len(pre_hashed)}")
    return pwd_context.verify(pre_hashed, hashed_password)

def get_password_hash(password: str) -> str:
    # Pre-hash with SHA-256 to bypass bcrypt's 72-character limit
    pre_hashed = hashlib.sha256(password.encode()).hexdigest()
    print(f"DEBUG: get_password_hash - pre_hashed length: {len(pre_hashed)}")
    return pwd_context.hash(pre_hashed)
