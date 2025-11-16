import React, { useEffect, useState } from "react";
import { Box, Card, Typography, Divider, Chip } from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const [plan, setPlan] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const user = {
      name: localStorage.getItem("name"),
      goal: localStorage.getItem("goal"),
      height: parseFloat(localStorage.getItem("height") || "0"),
      weight: parseFloat(localStorage.getItem("weight") || "0"),
      equipment: JSON.parse(localStorage.getItem("equipment") || "[]"),
      cuisine: localStorage.getItem("cuisine"),
    };

    axios
      .post("https://fitness-ai-backend-l6x5.onrender.com/generate-plan", user)
      .then((res) => setPlan(res.data))
      .catch((err) => console.log(err));
  }, []);

  if (!plan) return <h2 style={{ padding: 40 }}>Loading dashboard...</h2>;

  return (
    <Box sx={{ padding: 4, backgroundColor: "#f5f6fa", minHeight: "100vh" }}>
      <Typography variant="h4" sx={{ fontWeight: 600, mb: 3 }}>
        Welcome, {localStorage.getItem("name")} 👋
      </Typography>

      {/* Top buttons */}
      <div style={{ marginBottom: "20px", display: "flex", gap: "10px" }}>
        <button
          onClick={() => navigate("/weekly-plan")}
          style={{
            padding: "10px 16px",
            background: "#5C6BC0",
            color: "white",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
            fontSize: "0.95rem",
          }}
        >
          View Weekly Plan 📅
        </button>

        <button
          onClick={() => navigate("/meal-plan")}
          style={{
            padding: "10px 16px",
            background: "#26A69A",
            color: "white",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
            fontSize: "0.95rem",
          }}
        >
          AI Meal Plan 🍛
        </button>
      </div>

      {/* Workout Section */}
      <Card sx={{ padding: 3, mb: 3, borderRadius: 3, boxShadow: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Today's Workout 💪
        </Typography>
        <Divider sx={{ my: 2 }} />
        {plan.workout_plan.map((w, i) => (
          <Chip
            key={i}
            label={w}
            sx={{ margin: 0.5, padding: 1, fontSize: "1rem" }}
          />
        ))}
      </Card>

      {/* Calories Section */}
      <Card sx={{ padding: 3, mb: 3, borderRadius: 3, boxShadow: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Daily Calories 🔥
        </Typography>
        <Divider sx={{ my: 2 }} />
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          {plan.recommended_calories} kcal
        </Typography>
      </Card>

      {/* Macros Section */}
      <Card sx={{ padding: 3, borderRadius: 3, boxShadow: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Macronutrient Breakdown 🍽️
        </Typography>
        <Divider sx={{ my: 2 }} />

        <Typography sx={{ fontSize: "1.1rem" }}>
          <strong>Protein:</strong> {plan.macros.protein_g} g
        </Typography>
        <Typography sx={{ fontSize: "1.1rem" }}>
          <strong>Carbs:</strong> {plan.macros.carbs_g} g
        </Typography>
        <Typography sx={{ fontSize: "1.1rem" }}>
          <strong>Fats:</strong> {plan.macros.fats_g} g
        </Typography>
      </Card>
    </Box>
  );
}

export default Dashboard;
