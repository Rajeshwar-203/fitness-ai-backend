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
# CORS 
# -------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------------------------
# HOME
# -------------------------------------------------
@app.get("/")
def home():
    return {"message": "Fitness AI Backend Running Successfully!"}

# -------------------------------------------------
# DATABASE
# -------------------------------------------------
client = pymongo.MongoClient("mongodb://localhost:27017/")
db = client["fitness_ai"]
users = db["users"]
progress = db["progress"]

# -------------------------------------------------
# AUTH
# -------------------------------------------------
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str):
    return pwd_context.hash(password)

def verify_password(plain, hashed):
    return pwd_context.verify(plain, hashed)

SECRET_KEY = "SUPER_SECRET_KEY_123"
ALGORITHM = "HS256"

def create_jwt(email: str):
    payload = {"sub": email, "exp": datetime.utcnow() + timedelta(days=1)}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

# -------------------------------------------------
# MODELS
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

class MealRequest(BaseModel):
    goal: str
    calories: int
    diet_type: str
    cuisine: str
    protein: float
    diet_preference: str  # NEW

class WorkoutRequest(BaseModel):
    goal: str
    available_time: int
    equipment: list
    fitness_level: str
    age: int
    health_conditions: list

class ProgressEntry(BaseModel):
    email: str
    exercise: str
    date: str

# -------------------------------------------------
# AUTH ENDPOINTS
# -------------------------------------------------
@app.post("/signup")
def signup(user: UserAuth):
    if users.find_one({"email": user.email}):
        return {"error": "Email already exists"}

    hashed_pw = hash_password(user.password)

    users.insert_one({
        "name": user.name,
        "email": user.email,
        "password": hashed_pw
    })

    token = create_jwt(user.email)
    return {"message": "Signup successful", "token": token, "name": user.name}

@app.post("/login")
def login(req: LoginRequest):
    user = users.find_one({"email": req.email})
    if not user:
        return {"error": "User not found"}

    if not verify_password(req.password, user["password"]):
        return {"error": "Incorrect password"}

    token = create_jwt(req.email)
    return {"message": "Login successful", "token": token, "name": user["name"]}

# -------------------------------------------------
# DAILY PLAN
# -------------------------------------------------
@app.post("/generate-plan")
def generate_plan(user: User):

    if user.goal == "Lose Fat":
        workout = ["Jumping Jacks", "Mountain Climbers", "Burpees"]
        calories = 1800
    elif user.goal == "Gain Muscle":
        workout = ["Pushups", "Squats", "Planks"]
        calories = 2400
    else:
        workout = ["Walking", "Bodyweight Squats", "Light Core"]
        calories = 2000

    weight = user.weight

    if user.goal == "Gain Muscle":
        protein = weight * 1.8
    elif user.goal == "Lose Fat":
        protein = weight * 1.5
    else:
        protein = weight * 1.2

    protein_calories = protein * 4
    remaining = calories - protein_calories

    carbs = (remaining * 0.6) / 4
    fats  = (remaining * 0.4) / 9

    return {
        "workout_plan": workout,
        "recommended_calories": calories,
        "macros": {
            "protein_g": round(protein, 1),
            "carbs_g": round(carbs, 1),
            "fats_g": round(fats, 1)
        }
    }

# -------------------------------------------------
# WEEKLY PLAN
# -------------------------------------------------
@app.post("/generate-weekly-plan")
def generate_weekly_plan(user: User):

    workouts = {
        "Lose Fat": [
            "HIIT + Cardio", "Full Body Circuit", "Core + Abs",
            "Active Recovery Walk", "HIIT + Strength Mix",
            "Lower Body Conditioning", "Rest / Stretch"
        ],
        "Gain Muscle": [
            "Chest + Triceps", "Back + Biceps", "Leg Day",
            "Shoulders + Abs", "Full Body Strength",
            "Glutes + Hamstrings", "Rest / Mobility"
        ],
        "Maintenance": [
            "Light Cardio", "Upper Body", "Core Stability",
            "Lower Body", "Full Body", "Yoga / Stretch", "Rest"
        ],
    }

    calories_map = {"Lose Fat": 1800, "Gain Muscle": 2400, "Maintenance": 2000}

    goal = user.goal
    cals = calories_map[goal]
    days = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"]

    weekly = []
    for i in range(7):
        weekly.append({
            "day": days[i],
            "workout": workouts[goal][i],
            "calories": cals
        })

    return {"weekly_plan": weekly}

# -------------------------------------------------
# MEAL PLAN (AI)
# -------------------------------------------------
import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

@app.post("/generate-meal-plan")
def generate_meal_plan(req: MealRequest):

    prompt = f"""
Generate a structured, clean, attractive meal plan using this info:

Goal: {req.goal}
Calories: {req.calories}
Protein: {req.protein}
Diet Type: {req.diet_type}
Cuisine: {req.cuisine}
Diet Preference: {req.diet_preference}

Return ONLY JSON in this format:

{{
  "breakfast": {{
    "dish": "",
    "description": "",
    "protein": 0,
    "carbs": 0,
    "fats": 0,
    "calories": 0
  }},
  "lunch": {{}},
  "snack": {{}},
  "dinner": {{}},
  "summary": {{
    "total_protein": 0,
    "total_carbs": 0,
    "total_fats": 0,
    "total_calories": 0
  }}
}}
"""

    try:
        model = genai.GenerativeModel("models/gemini-2.5-flash")
        res = model.generate_content(prompt)
        return {"meal_plan": res.text}
    except Exception as e:
        return {"error": str(e)}

# -------------------------------------------------
# AI WORKOUT PLAN
# -------------------------------------------------
@app.post("/generate-workout-plan-ai")
def generate_workout(req: WorkoutRequest):
    
    prompt = f"""
Generate a JSON workout plan with:

Goal: {req.goal}
Time: {req.available_time} minutes
Fitness Level: {req.fitness_level}
Age: {req.age}
Health Conditions: {req.health_conditions}
Equipment: {req.equipment}

Return ONLY JSON list:

[
  {{
    "exercise": "",
    "muscles": "",
    "duration": "",
    "difficulty": "Easy/OK/Hard",
    "tip": ""
  }}
]
"""
    try:
        model = genai.GenerativeModel("models/gemini-2.5-flash")
        res = model.generate_content(prompt)
        return {"workout_plan": res.text}
    except Exception as e:
        return {"error": str(e)}

# -------------------------------------------------
# PROGRESS TRACKING
# -------------------------------------------------
@app.post("/save-progress")
def save_progress(req: ProgressEntry):
    progress.insert_one(req.dict())
    return {"message": "Progress saved"}

@app.get("/get-progress/{email}")
def get_progress(email: str):
    records = list(progress.find({"email": email}, {"_id": 0}))
    return {"history": records}
