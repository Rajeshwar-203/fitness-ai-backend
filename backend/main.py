from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import pymongo

from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta

# =====================================================
# FastAPI App
# =====================================================
app = FastAPI()

# =====================================================
# CORS (Allow frontend access)
# =====================================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow React frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =====================================================
# Home Route
# =====================================================
@app.get("/")
def home():
    return {"message": "Fitness AI Backend Running Successfully!"}

# =====================================================
# Database Setup (MongoDB)
# =====================================================
client = pymongo.MongoClient("mongodb://localhost:27017/")
db = client["fitness_ai"]
users = db["users"]

# =====================================================
# Password Hashing
# =====================================================
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str):
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str):
    return pwd_context.verify(plain, hashed)


# =====================================================
# JWT Config
# =====================================================
SECRET_KEY = "SUPER_SECRET_KEY_123"   # TODO: move to env in production
ALGORITHM = "HS256"


def create_jwt(email: str):
    payload = {
        "sub": email,
        "exp": datetime.utcnow() + timedelta(days=1),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


# =====================================================
# Pydantic Models
# =====================================================
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
    # New optional fields (for future use / analytics)
    age: Optional[int] = None
    health_conditions: Optional[List[str]] = None


# ====== AI Meal Generator Models ======
class MealRequest(BaseModel):
    goal: str
    calories: int
    diet_type: str            # Veg / Non-Veg / Vegan
    cuisine: str              # Indian, South Indian, etc.
    protein: float
    diet_preference: Optional[str] = None  # NEW (eg: Low Carb, Diabetic-friendly)


# ====== AI Workout Generator Models ======
class WorkoutRequest(BaseModel):
    goal: str                  # Lose Fat / Gain Muscle / Maintenance
    available_time: int        # minutes per session
    equipment: List[str]       # ["dumbbells", "resistance band"]
    fitness_level: str         # Beginner / Intermediate / Advanced
    age: int
    health_conditions: Optional[List[str]] = None  # ["diabetes", "knee pain"]


# =====================================================
# Signup API
# =====================================================
@app.post("/signup")
def signup(user: UserAuth):
    # Check if email already exists
    if users.find_one({"email": user.email}):
        return {"error": "Email already exists"}

    hashed_pw = hash_password(user.password)

    users.insert_one(
        {
            "name": user.name,
            "email": user.email,
            "password": hashed_pw,
        }
    )

    token = create_jwt(user.email)

    return {
        "message": "Signup successful",
        "token": token,
        "name": user.name,
    }


# =====================================================
# Login API
# =====================================================
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
    }


# =====================================================
# Simple Rule-based Fitness Plan (Daily)
# =====================================================
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
            "fats_g": round(fats, 1),
        },
    }


# =====================================================
# Weekly Workout Plan (Rule-based)
# =====================================================
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
            "Rest / Stretch",
        ],
        "Gain Muscle": [
            "Chest + Triceps",
            "Back + Biceps",
            "Leg Day",
            "Shoulders + Abs",
            "Full Body Strength",
            "Glutes + Hamstrings",
            "Rest / Mobility",
        ],
        "Maintenance": [
            "Light Cardio",
            "Upper Body",
            "Core Stability",
            "Lower Body",
            "Full Body",
            "Yoga / Stretch",
            "Rest",
        ],
    }

    # Calories for each goal
    calories_map = {
        "Lose Fat": 1800,
        "Gain Muscle": 2400,
        "Maintenance": 2000,
    }

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
            "fats_g": round(fats, 1),
        }

    goal = user.goal
    weekly_workouts = workouts[goal]
    calories = calories_map[goal]

    weekly_plan = []
    days = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
    ]

    for i in range(7):
        weekly_plan.append(
            {
                "day": days[i],
                "workout": weekly_workouts[i],
                "calories": calories,
                "macros": calc_macros(user.weight, calories, goal),
            }
        )

    return {"weekly_plan": weekly_plan}


# =====================================================
# Gemini Setup (AI Features)
# =====================================================
import os

try:
    import google.generativeai as genai
    from dotenv import load_dotenv

    load_dotenv()
    genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
    GEMINI_AVAILABLE = True
    GEMINI_IMPORT_ERROR = ""
except Exception as e:  # pragma: no cover
    GEMINI_AVAILABLE = False
    GEMINI_IMPORT_ERROR = str(e)


# =====================================================
# AI Meal Generator (Gemini)
# =====================================================
@app.post("/generate-meal-plan")
def generate_meal_plan(req: MealRequest):
    if not GEMINI_AVAILABLE:
        return {
            "error": f"Gemini client not available on server: {GEMINI_IMPORT_ERROR}"
        }

    diet_pref_text = (
        f"• Diet Preference: {req.diet_preference}\n" if req.diet_preference else ""
    )

    prompt = f"""
Generate a clean, attractive, user-friendly **Meal Plan** in a structured format
suitable for a fitness app.

Make it:
- Easy to read
- Organized with sections
- Use short bullet points
- Include emojis for clarity
- Macros table for each meal
- Give tips at the end
- No long paragraphs
- No repeated content

User Details:
• Goal: {req.goal}
• Daily Calories Target: {req.calories} kcal
• Protein Target: {req.protein} g
• Diet Type: {req.diet_type}
• Cuisine: {req.cuisine}
{diet_pref_text}

Return the response in this clean format 👇

-------------------------------------------------------------

🍽️ **Daily Meal Plan for {req.goal}**

🔥 **Total Calories:** {req.calories} kcal  
💪 **Protein Target:** {req.protein} g  

---

### 🥞 Breakfast
• Dish Name  
• Short description  
• Serving size  
**Macros:**  
- Protein: xx g  
- Carbs: xx g  
- Fats: xx g  
- Calories: xxx kcal  

---

### 🍛 Lunch
(Same structure)

---

### 🍏 Snack
(Same structure)

---

### 🍽️ Dinner
(Same structure)

---

### 📊 Daily Macro Summary
- Total Protein: xx g  
- Total Carbs: xx g  
- Total Fats: xx g  
- Total Calories: xx kcal  

---

### 💡 Tips (short and useful)
• 3–5 fitness/nutrition tips  
• Keep them beginner-friendly  

-------------------------------------------------------------

Keep the language simple, energetic, friendly, and motivating.
"""

    try:
        model = genai.GenerativeModel("models/gemini-2.5-flash")
        response = model.generate_content(prompt)
        return {"meal_plan": response.text}
    except Exception as e:
        return {"error": str(e)}


# =====================================================
# AI Workout Generator (Gemini)
# =====================================================
@app.post("/generate-workout-plan-ai")
def generate_workout_plan_ai(req: WorkoutRequest):
    """
    AI-based workout generator that:
    - Uses goal, fitness level, equipment, time
    - Considers age & health conditions
    - Includes:
        * Exercise name
        * Target muscles
        * Duration / sets
        * Difficulty rating: Easy / OK / Hard
        * Short note for improvement
    """
    if not GEMINI_AVAILABLE:
        return {
            "error": f"Gemini client not available on server: {GEMINI_IMPORT_ERROR}"
        }

    health_text = (
        ", ".join(req.health_conditions)
        if req.health_conditions
        else "No major health issues"
    )
    equipment_text = ", ".join(req.equipment) if req.equipment else "No equipment"

    prompt = f"""
You are an expert fitness coach.

Generate a **personalized workout plan** with clear sections.

User Profile:
• Goal: {req.goal}
• Age: {req.age}
• Fitness level: {req.fitness_level}
• Available time per session: {req.available_time} minutes
• Available equipment: {equipment_text}
• Health conditions: {health_text}

Requirements:
- Create a single-day workout plan that fits within the available time.
- Focus on safety if health conditions are present.
- Include warm-up and cool-down.
- For each exercise, provide:
    • Exercise Name  
    • Target Muscles  
    • Duration or Sets/Reps  
    • Difficulty Rating: Easy / OK / Hard  
    • Short Coaching Tip for improvement  

Format it like this:

-------------------------------------------------------------
🏋️ **AI Workout Plan for {req.goal}**

👤 **Profile**
• Age: {req.age}  
• Level: {req.fitness_level}  
• Health: {health_text}  
• Time Available: {req.available_time} min  
• Equipment: {equipment_text}  

---

🔥 **Warm-up (5–10 min)**
• Exercise 1  
• Exercise 2  

---

💪 **Main Workout**
1️⃣ **Exercise Name**
• Target: muscles  
• Duration: xx min / sets x reps  
• Difficulty: Easy / OK / Hard  
• Tip: short line  

2️⃣ **Exercise Name**
(same structure)

(Include 4–6 exercises in total)

---

🧘 **Cool-down (5–10 min)**
• Simple stretches and breathing

---

💡 **Progression Tips**
• 3–5 bullet points on how to progress safely.

Keep everything short, structured, and very clear.
"""

    try:
        model = genai.GenerativeModel("models/gemini-2.5-flash")
        response = model.generate_content(prompt)
        return {"workout_plan": response.text}
    except Exception as e:
        return {"error": str(e)}
