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
  const [workoutPlan, setWorkoutPlan] = useState("");

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
    const { name, value } = e.target;

    // Multi-select for equipment & health conditions
    if (e.target.multiple) {
      const selected = Array.from(
        e.target.selectedOptions,
        (option) => option.value
      );

      setForm((prev) => ({ ...prev, [name]: selected }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    setWorkoutPlan("");

    try {
      const res = await axios.post(
        "https://fitness-ai-backend-l6x5.onrender.com/generate-workout-plan-ai",
        form
      );

      setWorkoutPlan(res.data.workout_plan || "No workout returned.");
    } catch (err) {
      console.error(err);
      setWorkoutPlan("⚠️ Network error. Try again.");
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
          AI Workout Generator 💪🤖
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

        <Card
          sx={{
            padding: 2,
            borderRadius: 2,
            backgroundColor: "white",
            maxHeight: "400px",
            overflowY: "auto",
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Result
          </Typography>

          {workoutPlan ? (
            <pre
              style={{
                whiteSpace: "pre-wrap",
                fontFamily: "inherit",
                fontSize: "0.95rem",
              }}
            >
              {workoutPlan}
            </pre>
          ) : (
            <Typography sx={{ color: "gray" }}>
              Fill details and click "Generate Workout".
            </Typography>
          )}
        </Card>
      </Card>
    </Box>
  );
}

export default WorkoutAI;
