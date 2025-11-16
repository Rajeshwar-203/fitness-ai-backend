// frontend/src/components/Navbar.js
import React from "react";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  return (
    <AppBar position="static" sx={{ backgroundColor: "#283593" }}>
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography
          variant="h6"
          sx={{ cursor: "pointer" }}
          onClick={() => navigate("/dashboard")}
        >
          Fitness AI
        </Typography>

        <Box sx={{ display: "flex", gap: 2 }}>
          <Button color="inherit" onClick={() => navigate("/dashboard")}>
            Dashboard
          </Button>
          <Button color="inherit" onClick={() => navigate("/weekly-plan")}>
            Weekly Plan
          </Button>
          <Button color="inherit" onClick={() => navigate("/meal-plan")}>
            Meal Plan
          </Button>
          <Button color="inherit" onClick={() => navigate("/workout-ai")}>
            AI Workout
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
