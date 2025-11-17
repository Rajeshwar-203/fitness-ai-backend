// frontend/src/pages/MealPlan.js
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
  Divider,
} from "@mui/material";
import axios from "axios";

const BACKEND = "https://fitness-ai-backend-l6x5.onrender.com";

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
  const [mealPlan, setMealPlan] = useState(null);     // ⭐ object
  const [history, setHistory] = useState([]);         // ⭐ previous plans
  const [error, setError] = useState("");

  const email = localStorage.getItem("email") || "";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        name === "calories" || name === "protein"
          ? Number(value)
          : value,
    }));
  };

  const fetchHistory = async () => {
    if (!email) return;
    try {
      const res = await axios.get(`${BACKEND}/meal-history`, {
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
    setMealPlan(null);

    try {
      const payload = {
        ...form,
        calories: Number(form.calories),
        protein: Number(form.protein),
        diet_preference: form.diet_preference,
        user_email: email || null,
      };

      const res = await axios.post(`${BACKEND}/generate-meal-plan`, payload);

      if (res.data.error) {
        setError(res.data.error);
      } else {
        setMealPlan(res.data.meal_plan || null);
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

  const renderMealCard = (title, data, emoji) => {
    if (!data) return null;
    return (
      <Card
        sx={{
          borderRadius: 3,
          padding: 2.5,
          boxShadow: 2,
          backgroundColor: "#ffffff",
          height: "100%",
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
          {emoji} {title}
        </Typography>
        <Typography sx={{ fontWeight: 600 }}>{data.dish}</Typography>
        <Typography sx={{ fontSize: "0.9rem", color: "#555", mt: 0.5 }}>
          {data.description}
        </Typography>
        <Divider sx={{ my: 1.5 }} />
        <Typography sx={{ fontSize: "0.9rem" }}>
          <strong>Protein:</strong> {data.protein} g
        </Typography>
        <Typography sx={{ fontSize: "0.9rem" }}>
          <strong>Carbs:</strong> {data.carbs} g
        </Typography>
        <Typography sx={{ fontSize: "0.9rem" }}>
          <strong>Fats:</strong> {data.fats} g
        </Typography>
        <Typography sx={{ fontSize: "0.9rem", mt: 0.5 }}>
          <strong>Calories:</strong> {data.calories} kcal
        </Typography>
      </Card>
    );
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
          AI Meal Plan Generator 🍽️
        </Typography>
        <Typography sx={{ mb: 3, color: "#555" }}>
          Smart South-Indian style meals, tailored to your goal and diet.
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

        {error && (
          <Typography sx={{ color: "red", mb: 1, fontSize: "0.9rem" }}>
            {error}
          </Typography>
        )}

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
          ) : mealPlan ? (
            "Regenerate Plan 🔁"
          ) : (
            "Generate AI Meal Plan 🤖"
          )}
        </Button>

        {/* Current Plan */}
        {mealPlan ? (
          <>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              Today’s AI Meal Plan
            </Typography>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} md={6}>
                {renderMealCard("Breakfast", mealPlan.breakfast, "🥞")}
              </Grid>
              <Grid item xs={12} md={6}>
                {renderMealCard("Lunch", mealPlan.lunch, "🍛")}
              </Grid>
              <Grid item xs={12} md={6}>
                {renderMealCard("Snack", mealPlan.snack, "🍏")}
              </Grid>
              <Grid item xs={12} md={6}>
                {renderMealCard("Dinner", mealPlan.dinner, "🍽️")}
              </Grid>
            </Grid>

            {mealPlan.summary && (
              <Card
                sx={{
                  borderRadius: 2,
                  padding: 2.5,
                  boxShadow: 1,
                  backgroundColor: "#E8EAF6",
                  mb: 3,
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  📊 Daily Macro Summary
                </Typography>
                <Typography>
                  <strong>Protein:</strong>{" "}
                  {mealPlan.summary.total_protein} g
                </Typography>
                <Typography>
                  <strong>Carbs:</strong> {mealPlan.summary.total_carbs} g
                </Typography>
                <Typography>
                  <strong>Fats:</strong> {mealPlan.summary.total_fats} g
                </Typography>
                <Typography sx={{ mt: 0.5 }}>
                  <strong>Calories:</strong>{" "}
                  {mealPlan.summary.total_calories} kcal
                </Typography>
                <Typography sx={{ mt: 1, fontStyle: "italic" }}>
                  {mealPlan.summary.notes}
                </Typography>
              </Card>
            )}
          </>
        ) : (
          <Typography sx={{ color: "#666", mb: 3 }}>
            No plan yet. Fill details and click{" "}
            <strong>"Generate AI Meal Plan"</strong>.
          </Typography>
        )}

        {/* History */}
        {email && history.length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              Previous AI Meal Plans 🕒
            </Typography>
            <Typography sx={{ mb: 2, fontSize: "0.9rem", color: "#555" }}>
              Showing last {history.length} plans for <strong>{email}</strong>
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
                      {h.goal} • {h.diet_type} • {h.diet_preference}
                    </Typography>
                    <Typography sx={{ fontSize: "0.85rem", color: "#777" }}>
                      {h.cuisine} •{" "}
                      {h.created_at
                        ? new Date(h.created_at).toLocaleString()
                        : ""}
                    </Typography>
                    {h.plan?.summary && (
                      <Typography sx={{ mt: 1, fontSize: "0.9rem" }}>
                        Protein: {h.plan.summary.total_protein} g • Calories:{" "}
                        {h.plan.summary.total_calories} kcal
                      </Typography>
                    )}
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

export default MealPlan;
