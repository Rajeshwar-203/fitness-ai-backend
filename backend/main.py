from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pymongo

from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta

# -------------------------------------------------
# FastAPI App
# -------------------------------------------------
app = FastAPI()

# -------------------------------------------------
# CORS (Allow frontend access)
# -------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow React frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------------------------
# Home Route (Fixes 404)
# -------------------------------------------------
@app.get("/")
def home():
    return {"message": "Fitness AI Backend Running Successfully!"}

# -------------------------------------------------
# Database Setup
# -------------------------------------------------
client = pymongo.MongoClient("mongodb://localhost:27017/")
db = client["fitness_ai"]
users = db["users"]

# -------------------------------------------------
# Password Hashing
# -------------------------------------------------
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str):
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str):
    return pwd_context.verify(plain, hashed)

# -------------------------------------------------
# JWT Config
# -------------------------------------------------
SECRET_KEY = "SUPER_SECRET_KEY_123"   # Change later
ALGORITHM = "HS256"

def create_jwt(email: str):
    payload = {
        "sub": email,
        "exp": datetime.utcnow() + timedelta(days=1)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

# -------------------------------------------------
# User Models
# -------------------------------------------------
class UserAuth(BaseModel):
    name: str
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

class User(BaseModel):
    name: str
    goal: str
    height: float
    weight: float
    equipment: list
    cuisine: str

# -------------------------------------------------
# Signup API
# -------------------------------------------------
@app.post("/signup")
def signup(user: UserAuth):
    # Check if email already exists
    if users.find_one({"email": user.email}):
        return {"error": "Email already exists"}

    hashed_pw = hash_password(user.password)

    users.insert_one({
        "name": user.name,
        "email": user.email,
        "password": hashed_pw
    })

    token = create_jwt(user.email)

    return {
        "message": "Signup successful",
        "token": token,
        "name": user.name
    }

# -------------------------------------------------
# Login API
# -------------------------------------------------
@app.post("/login")
def login(req: LoginRequest):
    user = users.find_one({"email": req.email})

    if not user:
        return {"error": "User not found"}

    if not verify_password(req.password, user["password"]):
        return {"error": "Incorrect password"}

    token = create_jwt(req.email)

    return {
        "message": "Login successful",
        "token": token,
        "name": user["name"]
    }

# -------------------------------------------------
# Generate Personalized Fitness Plan
# -------------------------------------------------
@app.post("/generate-plan")
def generate_plan(user: User):

    # -------------------------------
    # WORKOUT SELECTOR
    # -------------------------------
    if user.goal == "Lose Fat":
        workout = ["Jumping Jacks", "Mountain Climbers", "Burpees"]
        calories = 1800

    elif user.goal == "Gain Muscle":
        workout = ["Pushups", "Squats", "Planks"]
        calories = 2400

    else:  # Maintenance
        workout = ["Walking", "Bodyweight Squats", "Light Core"]
        calories = 2000

    # -------------------------------
    # NUTRITION CALCULATOR
    # -------------------------------
    weight = user.weight

    # Protein calculation (g)
    if user.goal == "Gain Muscle":
        protein = weight * 1.8
    elif user.goal == "Lose Fat":
        protein = weight * 1.5
    else:
        protein = weight * 1.2

    # Calories from protein
    protein_calories = protein * 4

    # Remaining calories after protein
    remaining = calories - protein_calories

    # 60% carbs, 40% fats
    carbs_calories = remaining * 0.6
    fats_calories = remaining * 0.4

    carbs = carbs_calories / 4
    fats = fats_calories / 9

    # Final Response
    return {
        "workout_plan": workout,
        "recommended_calories": calories,
        "macros": {
            "protein_g": round(protein, 1),
            "carbs_g": round(carbs, 1),
            "fats_g": round(fats, 1)
        }
    }
