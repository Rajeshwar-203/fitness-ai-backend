// frontend/src/pages/WeeklyPlan.js
import React, { useState } from "react";
import {
  Box,
  Card,
  Typography,
  Button,
  Grid,
  Divider,
  CircularProgress,
} from "@mui/material";
import axios from "axios";

function WeeklyPlan() {
  const [weeklyPlan, setWeeklyPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    setWeeklyPlan(null);

    try {
      const user = {
        name: localStorage.getItem("name") || "Sunny",
        goal: localStorage.getItem("goal") || "Gain Muscle",
        height: parseFloat(localStorage.getItem("height") || "170"),
        weight: parseFloat(localStorage.getItem("weight") || "60"),
        equipment: JSON.parse(localStorage.getItem("equipment") || '["dumbbells"]'),
        cuisine: localStorage.getItem("cuisine") || "Indian",
      };

      const res = await axios.post(
        "https://fitness-ai-backend-l6x5.onrender.com/generate-weekly-plan",
        user
      );

      setWeeklyPlan(res.data.weekly_plan || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load weekly plan. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        padding: 4,
        background: "linear-gradient(135deg, #f5f7ff, #e8ecff)",
      }}
    >
      {/* Header */}
      <Typography
        variant="h4"
        sx={{ fontWeight: 700, mb: 1, color: "#283593" }}
      >
        Weekly Workout Plan 🗓️
      </Typography>

      <Typography sx={{ mb: 3, color: "#555" }}>
        Smart AI-generated schedule based on your goal and body stats.
      </Typography>

      {/* Generate Button + Status */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 3, gap: 2 }}>
        <Button
          variant="contained"
          onClick={handleGenerate}
          disabled={loading}
          sx={{
            background: "#5C6BC0",
            textTransform: "none",
            fontSize: "1rem",
            px: 3,
            py: 1.2,
            borderRadius: "10px",
            boxShadow: 2,
            "&:hover": {
              background: "#3F51B5",
            },
          }}
        >
          {loading
  ? "Generating..."
  : weeklyPlan
    ? "Regenerate Weekly Plan 🔄"
    : "Generate Weekly Plan"}

        </Button>

        {loading && <CircularProgress size={26} />}

        {error && (
          <Typography sx={{ color: "red", fontSize: "0.9rem" }}>
            {error}
          </Typography>
        )}
      </Box>

      {/* If no plan yet */}
      {!weeklyPlan && !loading && !error && (
        <Typography sx={{ color: "#666" }}>
          Click <strong>Generate Weekly Plan</strong> to see your schedule.
        </Typography>
      )}

      {/* Weekly Cards */}


{weeklyPlan && (
  <Grid container spacing={2} sx={{ mt: 1 }}>
    {weeklyPlan.map((dayItem, index) => {
      const macros = dayItem.macros || {};
      return (
        <Grid item xs={12} sm={6} md={4} key={index}>
          <Card
            sx={{
              borderRadius: 3,
              padding: 2.5,
              boxShadow: 3,
              background: "#ffffff",
              borderTop: "4px solid #5C6BC0",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <Box>
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, mb: 0.5, color: "#303F9F" }}
              >
                {dayItem.day}
              </Typography>
              <Typography sx={{ mb: 1.5, color: "#555" }}>
                <strong>Workout:</strong> {dayItem.workout}
              </Typography>

              <Divider sx={{ my: 1.5 }} />

              <Typography sx={{ mb: 1 }}>
                <strong>Calories:</strong> {dayItem.calories} kcal
              </Typography>

              <Typography sx={{ fontWeight: 600, mb: 0.5 }}>
                Macros
              </Typography>
              <Typography sx={{ fontSize: "0.95rem" }}>
                Protein: {macros.protein_g ?? "-"} g
              </Typography>
              <Typography sx={{ fontSize: "0.95rem" }}>
                Carbs: {macros.carbs_g ?? "-"} g
              </Typography>
              <Typography sx={{ fontSize: "0.95rem" }}>
                Fats: {macros.fats_g ?? "-"} g
              </Typography>
            </Box>
          </Card>
        </Grid>
      );
    })}
  </Grid>
)}
    </Box>
  );
}

export default WeeklyPlan;
