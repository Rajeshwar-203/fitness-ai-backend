// frontend/src/pages/WorkoutAI.js
import React, { useEffect, useState } from "react";
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
  Divider,
} from "@mui/material";
import axios from "axios";

const BACKEND = "https://fitness-ai-backend-l6x5.onrender.com";

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
  const [workoutPlan, setWorkoutPlan] = useState([]); // ⭐ array of exercises
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");

  const email = localStorage.getItem("email") || "";

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

  const fetchHistory = async () => {
    if (!email) return;
    try {
      const res = await axios.get(`${BACKEND}/workout-history`, {
        params: { email },
      });
      setHistory(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    setWorkoutPlan([]);

    try {
      const payload = {
        ...form,
        available_time: Number(form.available_time),
        age: Number(form.age),
        user_email: email || null,
      };

      const res = await axios.post(
        `${BACKEND}/generate-workout-plan-ai`,
        payload
      );

      if (res.data.error) {
        setError(res.data.error);
      } else {
        setWorkoutPlan(res.data.workout_plan || []);
        await fetchHistory();
      }
    } catch (err) {
      console.error(err);
      setError("⚠️ Network error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
    // eslint-disable-next-line
  }, []);

  const difficultyColor = (diff) => {
    if (!diff) return "default";
    if (diff === "Easy") return "success";
    if (diff === "Hard") return "error";
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
          Get a smart, safe routine based on your goal, time, and health.
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

        {error && (
          <Typography sx={{ color: "red", mb: 1, fontSize: "0.9rem" }}>
            {error}
          </Typography>
        )}

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
          ) : workoutPlan.length > 0 ? (
            "Regenerate Workout 🔁"
          ) : (
            "Generate Workout 💪🤖"
          )}
        </Button>

        {/* Current Workout Plan */}
        {workoutPlan && workoutPlan.length > 0 ? (
          <>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              Today’s AI Workout Plan
            </Typography>

            <Grid container spacing={2} sx={{ mb: 3 }}>
              {workoutPlan.map((ex, idx) => (
                <Grid item xs={12} md={6} key={idx}>
                  <Card
                    sx={{
                      padding: 2,
                      borderRadius: 2,
                      boxShadow: 2,
                      backgroundColor: "#ffffff",
                      height: "100%",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 1,
                      }}
                    >
                      <Typography sx={{ fontWeight: 600 }}>
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

                    {ex.section && (
                      <Typography
                        sx={{
                          fontSize: "0.8rem",
                          color:
                            ex.section === "Warm-up"
                              ? "#00897B"
                              : ex.section === "Cool-down"
                              ? "#6A1B9A"
                              : "#1976D2",
                          fontWeight: 600,
                          mb: 0.5,
                        }}
                      >
                        {ex.section}
                      </Typography>
                    )}

                    <Typography sx={{ fontSize: "0.9rem", color: "#555" }}>
                      <strong>Muscles:</strong> {ex.muscles}
                    </Typography>
                    <Typography sx={{ fontSize: "0.9rem" }}>
                      <strong>Duration:</strong> {ex.duration}
                    </Typography>

                    <Typography
                      sx={{
                        fontSize: "0.85rem",
                        mt: 1,
                        color: "#444",
                        fontStyle: "italic",
                      }}
                    >
                      💡 {ex.tip}
                    </Typography>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </>
        ) : (
          <Typography sx={{ color: "#666", mb: 3 }}>
            No workout yet. Fill details and click{" "}
            <strong>"Generate Workout"</strong>.
          </Typography>
        )}

        {/* History Section */}
        {email && history.length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              Previous AI Workouts 🕒
            </Typography>
            <Typography sx={{ mb: 2, fontSize: "0.9rem", color: "#555" }}>
              Showing last {history.length} workouts for <strong>{email}</strong>
            </Typography>

            <Grid container spacing={2}>
              {history.map((h) => (
                <Grid item xs={12} md={6} key={h.id}>
                  <Card
                    sx={{
                      padding: 2,
                      borderRadius: 2,
                      boxShadow: 1,
                      backgroundColor: "#FFFFFF",
                    }}
                  >
                    <Typography sx={{ fontWeight: 600 }}>
                      {h.goal} • {h.fitness_level}
                    </Typography>
                    <Typography sx={{ fontSize: "0.85rem", color: "#777" }}>
                      Time: {h.available_time} mins • Age: {h.age}
                    </Typography>
                    <Typography sx={{ fontSize: "0.85rem", color: "#777" }}>
                      {h.created_at
                        ? new Date(h.created_at).toLocaleString()
                        : ""}
                    </Typography>
                    <Typography sx={{ mt: 1, fontSize: "0.9rem" }}>
                      Exercises: {Array.isArray(h.plan) ? h.plan.length : 0}
                    </Typography>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </>
        )}
      </Card>
    </Box>
  );
}

export default WorkoutAI;
