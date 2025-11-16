// frontend/src/pages/MealPlan.js
import React, { useState } from "react";
import {
  Box,
  Card,
  Typography,
  TextField,
  MenuItem,
  Button,
  CircularProgress,
  Grid,
  Chip,
} from "@mui/material";
import axios from "axios";

function MealPlan() {
  const [form, setForm] = useState({
    goal: "Gain Muscle",
    calories: 2400,
    diet_type: "Veg",
    cuisine: "South Indian",
    protein: 110,
    diet_preference: "High Protein",
  });

  const [loading, setLoading] = useState(false);
  const [mealPlan, setMealPlan] = useState(null);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        name === "calories" || name === "protein" ? Number(value) : value,
    }));
  };

  const handleGenerate = async () => {
    setLoading(true);
    setMealPlan(null);
    setError("");

    try {
      const res = await axios.post(
        "https://fitness-ai-backend-l6x5.onrender.com/generate-meal-plan",
        form
      );

      if (res.data.error) {
        setError(res.data.error);
      } else if (res.data.meal_plan) {
        setMealPlan(res.data.meal_plan);
      } else {
        setError("No meal plan returned.");
      }
    } catch (err) {
      console.error(err);
      setError("⚠️ Network error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderMealCard = (title, data, emoji) => {
    if (!data) return null;

    return (
      <Grid item xs={12} md={6}>
        <Card
          sx={{
            borderRadius: 3,
            padding: 2.5,
            boxShadow: 3,
            backgroundColor: "#ffffff",
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
            {emoji} {title}
          </Typography>
          <Typography sx={{ fontWeight: 600, mb: 0.5 }}>
            {data.dish}
          </Typography>
          <Typography sx={{ fontSize: "0.9rem", color: "#555", mb: 1.5 }}>
            {data.description}
          </Typography>

          <Typography sx={{ fontWeight: 600, mb: 0.5 }}>Macros</Typography>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Chip label={`Protein: ${data.protein} g`} />
            <Chip label={`Carbs: ${data.carbs} g`} />
            <Chip label={`Fats: ${data.fats} g`} />
            <Chip label={`Calories: ${data.calories} kcal`} />
          </Box>
        </Card>
      </Grid>
    );
  };

  const summary = mealPlan?.summary;

  return (
    <Box
      sx={{
        padding: 4,
        backgroundColor: "#f5f6fa",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Card
        sx={{
          maxWidth: 1000,
          width: "100%",
          padding: 4,
          borderRadius: 3,
          boxShadow: 3,
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
          AI Meal Plan Generator 🍽️
        </Typography>
        <Typography sx={{ mb: 3, color: "#555" }}>
          Get a full-day meal plan personalized to your goal, calories and
          preferences.
        </Typography>

        {/* Form */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 2,
            mb: 3,
          }}
        >
          <TextField
            select
            label="Goal"
            name="goal"
            value={form.goal}
            onChange={handleChange}
            fullWidth
          >
            <MenuItem value="Lose Fat">Lose Fat</MenuItem>
            <MenuItem value="Gain Muscle">Gain Muscle</MenuItem>
            <MenuItem value="Maintenance">Maintenance</MenuItem>
          </TextField>

          <TextField
            label="Calories per day"
            name="calories"
            type="number"
            value={form.calories}
            onChange={handleChange}
            fullWidth
          />

          <TextField
            select
            label="Diet Type"
            name="diet_type"
            value={form.diet_type}
            onChange={handleChange}
            fullWidth
          >
            <MenuItem value="Veg">Veg</MenuItem>
            <MenuItem value="Non-Veg">Non-Veg</MenuItem>
            <MenuItem value="Vegan">Vegan</MenuItem>
          </TextField>

          <TextField
            label="Cuisine"
            name="cuisine"
            value={form.cuisine}
            onChange={handleChange}
            fullWidth
            placeholder="South Indian, North Indian, etc."
          />

          <TextField
            label="Protein Target (g)"
            name="protein"
            type="number"
            value={form.protein}
            onChange={handleChange}
            fullWidth
          />

          <TextField
            select
            label="Diet Preference"
            name="diet_preference"
            value={form.diet_preference}
            onChange={handleChange}
            fullWidth
          >
            <MenuItem value="High Protein">High Protein</MenuItem>
            <MenuItem value="Low Carb">Low Carb</MenuItem>
            <MenuItem value="Vegan">Vegan</MenuItem>
            <MenuItem value="Diabetic Friendly">Diabetic Friendly</MenuItem>
            <MenuItem value="Gluten Free">Gluten Free</MenuItem>
            <MenuItem value="Thyroid Friendly">Thyroid Friendly</MenuItem>
          </TextField>
        </Box>

        <Button
          variant="contained"
          onClick={handleGenerate}
          disabled={loading}
          sx={{
            mb: 3,
            paddingX: 3,
            paddingY: 1.2,
            borderRadius: 2,
            textTransform: "none",
            fontSize: "1rem",
            backgroundColor: "#5C6BC0",
            "&:hover": { backgroundColor: "#3F51B5" },
          }}
        >
          {loading ? (
            <>
              <CircularProgress size={20} sx={{ color: "white", mr: 1 }} />
              Generating Meal Plan...
            </>
          ) : (
            "Generate AI Meal Plan 🤖"
          )}
        </Button>

        {error && (
          <Typography sx={{ color: "red", mb: 2 }}>{error}</Typography>
        )}

        {/* Result */}
        {!mealPlan && !error && !loading && (
          <Typography sx={{ color: "gray" }}>
            No plan yet. Fill details and click{" "}
            <strong>Generate AI Meal Plan</strong>.
          </Typography>
        )}

        {mealPlan && (
          <>
            {/* Summary Card */}
            {summary && (
              <Card
                sx={{
                  borderRadius: 3,
                  padding: 2.5,
                  boxShadow: 2,
                  background:
                    "linear-gradient(135deg, #5C6BC0, #42A5F5)",
                  color: "white",
                  mb: 3,
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                  📊 Daily Macro Summary
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 1.5,
                    alignItems: "center",
                  }}
                >
                  <Chip
                    label={`Protein: ${summary.total_protein} g`}
                    sx={{ backgroundColor: "rgba(255,255,255,0.2)" }}
                  />
                  <Chip
                    label={`Carbs: ${summary.total_carbs} g`}
                    sx={{ backgroundColor: "rgba(255,255,255,0.2)" }}
                  />
                  <Chip
                    label={`Fats: ${summary.total_fats} g`}
                    sx={{ backgroundColor: "rgba(255,255,255,0.2)" }}
                  />
                  <Chip
                    label={`Calories: ${summary.total_calories} kcal`}
                    sx={{ backgroundColor: "rgba(255,255,255,0.2)" }}
                  />
                </Box>
              </Card>
            )}

            {/* Meal Cards Grid */}
            <Grid container spacing={2}>
              {renderMealCard("Breakfast", mealPlan.breakfast, "🥞")}
              {renderMealCard("Lunch", mealPlan.lunch, "🍛")}
              {renderMealCard("Snack", mealPlan.snack, "🍏")}
              {renderMealCard("Dinner", mealPlan.dinner, "🍽️")}
            </Grid>
          </>
        )}
      </Card>
    </Box>
  );
}

export default MealPlan;
