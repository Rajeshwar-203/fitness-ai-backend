from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pymongo

from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta

import os
import json
from dotenv import load_dotenv
import google.generativeai as genai

# -------------------------------------------------
# Load env + Gemini config
# -------------------------------------------------
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

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


# ---------- AI Models for Meal & Workout ----------

class MealRequest(BaseModel):
    goal: str
    calories: int
    diet_type: str
    cuisine: str
    protein: float
    diet_preference: str  # e.g. "High Protein", "Low Carb", etc.


class WorkoutRequest(BaseModel):
    goal: str
    available_time: int
    equipment: list
    fitness_level: str
    age: int
    health_conditions: list


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
# Generate Personalized Fitness Plan (Daily)
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
# Generate Weekly Plan
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

    days = ["Monday", "Tuesday", "Wednesday", "Thursday",
            "Friday", "Saturday", "Sunday"]

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
# AI MEAL GENERATOR (Gemini) - STRUCTURED JSON
# =====================================================
@app.post("/generate-meal-plan")
def generate_meal_plan(req: MealRequest):
    if not GEMINI_API_KEY:
        return {"error": "Gemini API key not configured on server."}

    prompt = f"""
You are a nutritionist for a fitness app.

Generate a 1-day meal plan in **JSON ONLY** for this user.

User Details:
- Goal: {req.goal}
- Daily Calories Target: {req.calories} kcal
- Protein Target: {req.protein} g
- Diet Type: {req.diet_type}
- Cuisine: {req.cuisine}
- Diet Preference: {req.diet_preference}  (e.g. high protein, low carb, diabetic friendly, etc.)

Rules:
- Use South / Indian style foods when possible.
- Keep portions realistic.
- Respect diet type & preference.
- Focus on fitness goal.

⚠️ IMPORTANT:
Return ONLY valid JSON in this exact format, NO extra text, NO markdown:

{{
  "breakfast": {{
    "dish": "string",
    "description": "short description",
    "protein": number,
    "carbs": number,
    "fats": number,
    "calories": number
  }},
  "lunch": {{
    "dish": "string",
    "description": "short description",
    "protein": number,
    "carbs": number,
    "fats": number,
    "calories": number
  }},
  "snack": {{
    "dish": "string",
    "description": "short description",
    "protein": number,
    "carbs": number,
    "fats": number,
    "calories": number
  }},
  "dinner": {{
    "dish": "string",
    "description": "short description",
    "protein": number,
    "carbs": number,
    "fats": number,
    "calories": number
  }},
  "summary": {{
    "total_protein": number,
    "total_carbs": number,
    "total_fats": number,
    "total_calories": number
  }}
}}
"""

    try:
        model = genai.GenerativeModel("models/gemini-2.5-flash")
        response = model.generate_content(prompt)

        text = response.text.strip()

        # Strip ```json ``` if model wraps it
        if text.startswith("```"):
            lines = text.splitlines()
            lines = [ln for ln in lines if not ln.strip().startswith("```")]
            text = "\n".join(lines).strip()

        data = json.loads(text)

        return {"meal_plan": data}

    except Exception as e:
        return {"error": str(e)}


# =====================================================
# AI WORKOUT GENERATOR (Gemini) - STRUCTURED JSON
# =====================================================
@app.post("/generate-workout-plan-ai")
def generate_workout_plan_ai(req: WorkoutRequest):
    if not GEMINI_API_KEY:
        return {"error": "Gemini API key not configured on server."}

    prompt = f"""
You are an intelligent fitness coach.

Create a structured workout plan as JSON ONLY for this user.

User Details:
- Goal: {req.goal}
- Available Time: {req.available_time} minutes
- Fitness Level: {req.fitness_level}
- Age: {req.age}
- Equipment: {", ".join(req.equipment) if req.equipment else "No equipment"}
- Health Conditions: {", ".join(req.health_conditions) if req.health_conditions else "None"}

Requirements:
- Include warm-up, main workout, and cool-down moves.
- Use safe exercises if health conditions are present.
- Every exercise must have:
  - exercise: name
  - phase: "Warm-up" | "Main" | "Cool-down"
  - muscles: target muscles
  - duration: "time or sets/reps"
  - difficulty: "Easy" | "OK" | "Hard"
  - tip: short improvement tip

⚠️ IMPORTANT:
Return ONLY a JSON array of exercises, like:

[
  {{
    "exercise": "Jumping Jacks",
    "phase": "Warm-up",
    "muscles": "Full Body",
    "duration": "2 minutes",
    "difficulty": "Easy",
    "tip": "Land softly on your feet and keep your core engaged."
  }},
  ...
]
"""

    try:
        model = genai.GenerativeModel("models/gemini-2.5-flash")
        response = model.generate_content(prompt)

        text = response.text.strip()

        if text.startswith("```"):
            lines = text.splitlines()
            lines = [ln for ln in lines if not ln.strip().startswith("```")]
            text = "\n".join(lines).strip()

        data = json.loads(text)

        return {"workout_plan": data}

    except Exception as e:
        return {"error": str(e)}
