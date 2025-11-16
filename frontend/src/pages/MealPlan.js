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
} from "@mui/material";
import axios from "axios";

function MealPlan() {
  const [form, setForm] = useState({
    goal: "Gain Muscle",
    calories: 2400,
    diet_type: "Veg",
    cuisine: "South Indian",
    protein: 110,
  });

  const [loading, setLoading] = useState(false);
  const [mealPlan, setMealPlan] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "calories" || name === "protein" ? Number(value) : value,
    }));
  };
const handleGenerate = async () => {
  setLoading(true);
  setMealPlan("");

  try {
    const res = await axios.post(
      "https://fitness-ai-backend-l6x5.onrender.com/generate-meal-plan",
      form
    );

    if (res.data.error) {
      setMealPlan("⚠️ " + res.data.error);
    } else if (!res.data.meal_plan) {
      setMealPlan("⚠️ No meal plan returned. Try again.");
    } else {
      setMealPlan(res.data.meal_plan);
    }
  } catch (err) {
    console.error(err);
    setMealPlan("⚠️ Network error. Try again.");
  } finally {
    setLoading(false);
  }
};

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
          maxWidth: 900,
          width: "100%",
          padding: 4,
          borderRadius: 3,
          boxShadow: 3,
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 3 }}>
          AI Meal Plan Generator 🍽️
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
              <CircularProgress
                size={20}
                sx={{ color: "white", mr: 1 }}
              />
              Generating Meal Plan...
            </>
          ) : (
            "Generate AI Meal Plan 🤖"
          )}
        </Button>

        {/* Result */}
        <Card
  sx={{
    padding: 2,
    borderRadius: 2,
    backgroundColor: "#ffffff",
    maxHeight: "400px",
    overflowY: "auto",
  }}
>
  <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
    Result
  </Typography>

  {mealPlan ? (
    <pre
      style={{
        whiteSpace: "pre-wrap",
        fontFamily: "inherit",
        fontSize: "0.95rem",
        lineHeight: 1.5
      }}
    >
      {mealPlan}
    </pre>
  ) : (
    <Typography variant="body1" sx={{ color: "gray" }}>
      No plan yet. Fill details and click "Generate AI Meal Plan".
    </Typography>
  )}
</Card>

      </Card>
    </Box>
  );
}

export default MealPlan;
