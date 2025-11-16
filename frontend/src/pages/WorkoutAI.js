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

function WorkoutAI() {
  const [form, setForm] = useState({
    goal: "Gain Muscle",
    available_time: 45,
    equipment: [],
    fitness_level: "Beginner",
    age: 20,
    health_conditions: [],
  });

  const [loading, setLoading] = useState(false);
  const [workoutPlan, setWorkoutPlan] = useState(null);
  const [error, setError] = useState("");

  const equipmentOptions = [
    "Dumbbells",
    "Resistance Bands",
    "Pull-up Bar",
    "Yoga Mat",
    "Bench",
    "No Equipment",
  ];

  const healthOptions = [
    "None",
    "Diabetes",
    "Thyroid",
    "Knee Pain",
    "Back Pain",
    "Obesity",
    "Asthma",
  ];

  const handleChange = (e) => {
    const { name, value, multiple, selectedOptions } = e.target;

    if (multiple) {
      const selected = Array.from(selectedOptions, (opt) => opt.value);
      setForm((prev) => ({ ...prev, [name]: selected }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    setWorkoutPlan(null);
    setError("");

    try {
      const res = await axios.post(
        "https://fitness-ai-backend-l6x5.onrender.com/generate-workout-plan-ai",
        form
      );

      if (res.data.error) {
        setError(res.data.error);
      } else if (Array.isArray(res.data.workout_plan)) {
        setWorkoutPlan(res.data.workout_plan);
      } else {
        setError("No workout returned.");
      }
    } catch (err) {
      console.error(err);
      setError("⚠️ Network error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const difficultyColor = (diff) => {
    if (!diff) return "default";
    const d = diff.toLowerCase();
    if (d === "easy") return "success";
    if (d === "hard") return "error";
    return "warning"; // OK
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
          maxWidth: 1000,
          width: "100%",
          padding: 4,
          borderRadius: 3,
          boxShadow: 3,
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
          AI Workout Generator 💪🤖
        </Typography>
        <Typography sx={{ mb: 3, color: "#555" }}>
          Get a full routine with warm-up, main workout & cool-down based on
          your goal, time, and health conditions.
        </Typography>

        {/* FORM GRID */}
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
          >
            <MenuItem value="Gain Muscle">Gain Muscle</MenuItem>
            <MenuItem value="Lose Fat">Lose Fat</MenuItem>
            <MenuItem value="Endurance">Endurance</MenuItem>
          </TextField>

          <TextField
            label="Available Time (mins)"
            name="available_time"
            type="number"
            value={form.available_time}
            onChange={handleChange}
          />

          <TextField
            select
            label="Fitness Level"
            name="fitness_level"
            value={form.fitness_level}
            onChange={handleChange}
          >
            <MenuItem value="Beginner">Beginner</MenuItem>
            <MenuItem value="Intermediate">Intermediate</MenuItem>
            <MenuItem value="Advanced">Advanced</MenuItem>
          </TextField>

          <TextField
            label="Age"
            name="age"
            type="number"
            value={form.age}
            onChange={handleChange}
          />

          {/* Multi Select - Equipment */}
          <TextField
            select
            SelectProps={{ multiple: true }}
            label="Equipment Available"
            name="equipment"
            value={form.equipment}
            onChange={handleChange}
          >
            {equipmentOptions.map((e) => (
              <MenuItem key={e} value={e}>
                {e}
              </MenuItem>
            ))}
          </TextField>

          {/* Multi Select - Health Conditions */}
          <TextField
            select
            SelectProps={{ multiple: true }}
            label="Health Conditions"
            name="health_conditions"
            value={form.health_conditions}
            onChange={handleChange}
          >
            {healthOptions.map((h) => (
              <MenuItem key={h} value={h}>
                {h}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        <Button
          variant="contained"
          disabled={loading}
          onClick={handleGenerate}
          sx={{
            mb: 3,
            paddingX: 3,
            paddingY: 1.2,
            borderRadius: 2,
            textTransform: "none",
            backgroundColor: "#5C6BC0",
            "&:hover": { backgroundColor: "#3F51B5" },
          }}
        >
          {loading ? (
            <>
              <CircularProgress size={20} sx={{ mr: 1, color: "white" }} />
              Generating Workout...
            </>
          ) : (
            "Generate Workout 💪🤖"
          )}
        </Button>

        {error && (
          <Typography sx={{ color: "red", mb: 2 }}>{error}</Typography>
        )}

        {!workoutPlan && !error && !loading && (
          <Typography sx={{ color: "gray" }}>
            Fill details and click <strong>Generate Workout</strong>.
          </Typography>
        )}

        {/* RESULT CARDS */}
        {Array.isArray(workoutPlan) && (
          <Grid container spacing={2}>
            {workoutPlan.map((ex, idx) => (
              <Grid item xs={12} md={6} key={idx}>
                <Card
                  sx={{
                    borderRadius: 3,
                    padding: 2,
                    boxShadow: 2,
                    backgroundColor: "#ffffff",
                    height: "100%",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 1,
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 700, pr: 1 }}
                    >
                      {ex.exercise}
                    </Typography>
                    {ex.difficulty && (
                      <Chip
                        label={ex.difficulty}
                        color={difficultyColor(ex.difficulty)}
                        size="small"
                      />
                    )}
                  </Box>

                  <Typography
                    sx={{ fontSize: "0.85rem", color: "#757575", mb: 0.5 }}
                  >
                    {ex.phase && `Phase: ${ex.phase}`}
                  </Typography>

                  {ex.muscles && (
                    <Typography sx={{ mb: 0.5 }}>
                      <strong>Muscles:</strong> {ex.muscles}
                    </Typography>
                  )}

                  {ex.duration && (
                    <Typography sx={{ mb: 0.5 }}>
                      <strong>Duration / Sets:</strong> {ex.duration}
                    </Typography>
                  )}

                  {ex.tip && (
                    <Typography
                      sx={{ fontSize: "0.9rem", color: "#555", mt: 0.5 }}
                    >
                      💡 <strong>Tip:</strong> {ex.tip}
                    </Typography>
                  )}
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Card>
    </Box>
  );
}

export default WorkoutAI;
