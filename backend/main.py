from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import pymongo

from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta
import os

# =====================================================
# Gemini
# =====================================================
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

# =====================================================
# FastAPI App
# =====================================================
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
# Database Setup (Atlas-ready)
# -------------------------------------------------
MONGO_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017/")
client = pymongo.MongoClient(MONGO_URI)

db = client["fitness_ai"]
users = db["users"]
meal_plans = db["meal_plans"]          # ⭐ NEW
workout_plans = db["workout_plans"]    # ⭐ NEW

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
    equipment: List[str]
    cuisine: str

# ⭐ NEW – Meal + Workout request models
class MealRequest(BaseModel):
    goal: str
    calories: int
    diet_type: str
    cuisine: str
    protein: float
    diet_preference: str
    user_email: Optional[str] = None   # used to save history

class WorkoutRequest(BaseModel):
    goal: str
    available_time: int
    equipment: List[str]
    fitness_level: str
    age: int
    health_conditions: List[str]
    user_email: Optional[str] = None   # used to save history

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
        "name": user.name,
        "email": user.email,
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
        "name": user["name"],
        "email": user["email"],
    }

# -------------------------------------------------
# Generate Personalized Fitness Plan  (OLD – unchanged)
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

# -------------------------------------------------
# Weekly Plan  (OLD – unchanged logic)
# -------------------------------------------------
@app.post("/generate-weekly-plan")
def generate_weekly_plan(user: User):

    # Base workout templates
    workouts = {
        "Lose Fat": [
            "HIIT + Cardio",
            "Full Body Circuit",
            "Core + Abs",
            "Active Recovery Walk",
            "HIIT + Strength Mix",
            "Lower Body Conditioning",
            "Rest / Stretch"
        ],
        "Gain Muscle": [
            "Chest + Triceps",
            "Back + Biceps",
            "Leg Day",
            "Shoulders + Abs",
            "Full Body Strength",
            "Glutes + Hamstrings",
            "Rest / Mobility"
        ],
        "Maintenance": [
            "Light Cardio",
            "Upper Body",
            "Core Stability",
            "Lower Body",
            "Full Body",
            "Yoga / Stretch",
            "Rest"
        ]
    }

    # Calories for each goal
    calories_map = {
        "Lose Fat": 1800,
        "Gain Muscle": 2400,
        "Maintenance": 2000
    }

    # Macros calculation per day
    def calc_macros(weight, calories, goal):
        if goal == "Gain Muscle":
            protein = weight * 1.8
        elif goal == "Lose Fat":
            protein = weight * 1.5
        else:
            protein = weight * 1.2

        protein_calories = protein * 4
        remaining = calories - protein_calories

        carbs = (remaining * 0.6) / 4
        fats = (remaining * 0.4) / 9

        return {
            "protein_g": round(protein, 1),
            "carbs_g": round(carbs, 1),
            "fats_g": round(fats, 1)
        }

    goal = user.goal
    weekly_workouts = workouts[goal]
    calories = calories_map[goal]

    weekly_plan = []
    days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

    for i in range(7):
        weekly_plan.append({
            "day": days[i],
            "workout": weekly_workouts[i],
            "calories": calories,
            "macros": calc_macros(user.weight, calories, goal)
        })

    return {
        "weekly_plan": weekly_plan
    }

# =====================================================
# AI MEAL GENERATOR (Gemini) + HISTORY
# =====================================================
@app.post("/generate-meal-plan")
def generate_meal_plan(req: MealRequest):
    """
    Returns a structured JSON meal plan AND saves it (if email is provided).
    """

    if not GEMINI_API_KEY:
        return {"error": "Gemini API key not configured on server."}

    prompt = f"""
You are a nutrition AI for a fitness app.

User:
- Goal: {req.goal}
- Daily Calories Target: {req.calories} kcal
- Protein Target: {req.protein} g
- Diet Type: {req.diet_type}
- Cuisine: {req.cuisine}
- Diet Preference: {req.diet_preference}

Return ONLY valid JSON (no markdown, no backticks, no comments) in this exact structure:

{{
  "breakfast": {{
    "dish": "string",
    "description": "short friendly sentence",
    "protein": 0,
    "carbs": 0,
    "fats": 0,
    "calories": 0
  }},
  "lunch": {{
    "dish": "string",
    "description": "short friendly sentence",
    "protein": 0,
    "carbs": 0,
    "fats": 0,
    "calories": 0
  }},
  "snack": {{
    "dish": "string",
    "description": "short friendly sentence",
    "protein": 0,
    "carbs": 0,
    "fats": 0,
    "calories": 0
  }},
  "dinner": {{
    "dish": "string",
    "description": "short friendly sentence",
    "protein": 0,
    "carbs": 0,
    "fats": 0,
    "calories": 0
  }},
  "summary": {{
    "total_protein": 0,
    "total_carbs": 0,
    "total_fats": 0,
    "total_calories": 0,
    "notes": "1–2 line motivating summary"
  }}
}}

Make sure numbers are realistic for a {req.goal} {req.diet_type} South Indian style plan.
"""

    try:
        model = genai.GenerativeModel("models/gemini-pro")
        response = model.generate_content(prompt)

        import json
        meal_json = json.loads(response.text)

        # ⭐ Save to MongoDB if we have email
        if req.user_email:
            meal_plans.insert_one({
                "user_email": req.user_email,
                "created_at": datetime.utcnow(),
                "goal": req.goal,
                "diet_type": req.diet_type,
                "cuisine": req.cuisine,
                "diet_preference": req.diet_preference,
                "calories": req.calories,
                "protein": req.protein,
                "plan": meal_json,
            })

        return {"meal_plan": meal_json}

    except Exception as e:
        return {"error": str(e)}

@app.get("/meal-history")
def get_meal_history(email: str = Query(..., alias="email")):
    """
    Returns last 5 meal plans for a user.
    """
    cursor = (
        meal_plans
        .find({"user_email": email})
        .sort("created_at", -1)
        .limit(5)
    )
    history = []
    for doc in cursor:
        history.append({
            "id": str(doc.get("_id")),
            "created_at": doc.get("created_at").isoformat() if doc.get("created_at") else None,
            "goal": doc.get("goal"),
            "diet_type": doc.get("diet_type"),
            "cuisine": doc.get("cuisine"),
            "diet_preference": doc.get("diet_preference"),
            "calories": doc.get("calories"),
            "protein": doc.get("protein"),
            "plan": doc.get("plan"),
        })
    return history

# =====================================================
# AI WORKOUT GENERATOR (Gemini) + HISTORY
# =====================================================
@app.post("/generate-workout-plan-ai")
def generate_workout_plan_ai(req: WorkoutRequest):
    """
    AI-based workout generator using Gemini.
    Returns a list of exercises with difficulty, muscles, duration, tip.
    Saves history if email is provided.
    """

    if not GEMINI_API_KEY:
        return {"error": "Gemini API key not configured on server."}

    equipment_str = ", ".join(req.equipment) if req.equipment else "No equipment"
    health_str = ", ".join(req.health_conditions) if req.health_conditions else "None"

    prompt = f"""
You are a smart workout coach.

Create a structured workout for this user:

- Goal: {req.goal}
- Available Time: {req.available_time} minutes
- Fitness Level: {req.fitness_level}
- Age: {req.age}
- Equipment: {equipment_str}
- Health Conditions: {health_str}

Design:
- Include warm-up, main workout, and cool-down.
- Use simple, safe exercises suitable for {req.fitness_level} level.
- Adjust intensity if health conditions are risky.

Return ONLY a JSON array (no markdown, no backticks) like:

[
  {{
    "exercise": "string",
    "section": "Warm-up | Main | Cool-down",
    "muscles": "string",
    "duration": "string",
    "difficulty": "Easy | OK | Hard",
    "tip": "short coaching tip"
  }}
]

Use 10–16 exercises max.
"""

    try:
        model = genai.GenerativeModel("models/gemini-2.5-flash")
        response = model.generate_content(prompt)

        import json
        workout_json = json.loads(response.text)

        # ⭐ Save to MongoDB if email present
        if req.user_email:
            workout_plans.insert_one({
                "user_email": req.user_email,
                "created_at": datetime.utcnow(),
                "goal": req.goal,
                "available_time": req.available_time,
                "fitness_level": req.fitness_level,
                "age": req.age,
                "equipment": req.equipment,
                "health_conditions": req.health_conditions,
                "plan": workout_json,
            })

        return {"workout_plan": workout_json}

    except Exception as e:
        return {"error": str(e)}

@app.get("/workout-history")
def get_workout_history(email: str = Query(..., alias="email")):
    """
    Returns last 5 AI workouts for a user.
    """
    cursor = (
        workout_plans
        .find({"user_email": email})
        .sort("created_at", -1)
        .limit(5)
    )
    history = []
    for doc in cursor:
        history.append({
            "id": str(doc.get("_id")),
            "created_at": doc.get("created_at").isoformat() if doc.get("created_at") else None,
            "goal": doc.get("goal"),
            "available_time": doc.get("available_time"),
            "fitness_level": doc.get("fitness_level"),
            "age": doc.get("age"),
            "equipment": doc.get("equipment"),
            "health_conditions": doc.get("health_conditions"),
            "plan": doc.get("plan"),
        })
    return history
