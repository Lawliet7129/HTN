from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Dict, Any
import uuid
from datetime import datetime

from src.models.user import UserCreate, UserResponse, UserLogin, UserType

router = APIRouter(prefix="/auth", tags=["authentication"])
security = HTTPBearer()

# In-memory storage for demo purposes
# In production, this would be a database
users_db: Dict[str, Dict[str, Any]] = {}

@router.post("/register", response_model=UserResponse)
async def register_user(user_data: UserCreate):
    """Register a new user"""
    
    # Check if user already exists
    for user_id, user in users_db.items():
        if user["email"] == user_data.email:
            raise HTTPException(status_code=400, detail="User with this email already exists")
    
    # Create new user
    user_id = str(uuid.uuid4())
    new_user = {
        "id": user_id,
        "name": user_data.name,
        "email": user_data.email,
        "user_type": user_data.user_type,
        "password": user_data.password,  # In production, hash this password
        "created_at": datetime.utcnow()
    }
    
    users_db[user_id] = new_user
    
    # Return user without password
    return UserResponse(
        id=new_user["id"],
        name=new_user["name"],
        email=new_user["email"],
        user_type=new_user["user_type"],
        created_at=new_user["created_at"]
    )

@router.post("/login")
async def login_user(login_data: UserLogin):
    """Login user and return user data"""
    
    # Find user by email
    user = None
    for user_id, user_data in users_db.items():
        if user_data["email"] == login_data.email:
            user = user_data
            break
    
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # In production, verify hashed password
    if user["password"] != login_data.password:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Return user without password
    return UserResponse(
        id=user["id"],
        name=user["name"],
        email=user["email"],
        user_type=user["user_type"],
        created_at=user["created_at"]
    )

@router.get("/me", response_model=UserResponse)
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get current user information"""
    
    # In production, verify JWT token
    # For demo purposes, we'll just return a mock user
    # This would be replaced with proper JWT verification
    
    # Mock user for demo
    mock_user = {
        "id": "1",
        "name": "Demo User",
        "email": "demo@example.com",
        "user_type": "student",
        "created_at": datetime.utcnow()
    }
    
    return UserResponse(**mock_user)
