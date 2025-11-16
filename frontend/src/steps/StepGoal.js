import React, { useState } from "react";
import { Button, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { useNavigate } from "react-router-dom";
import CenteredCard from "../components/CenteredCard";

function StepGoal() {
  const [goal, setGoal] = useState("");
  const navigate = useNavigate();

  const next = () => {
    localStorage.setItem("goal", goal);
    navigate("/body");
  };

  return (
    <CenteredCard title="Your Fitness Goal 💪">
      <ToggleButtonGroup
        exclusive
        fullWidth
        value={goal}
        onChange={(e, val) => setGoal(val)}
        sx={{ mb: 3 }}
      >
        <ToggleButton value="Lose Fat">Lose Fat</ToggleButton>
        <ToggleButton value="Gain Muscle">Gain Muscle</ToggleButton>
        <ToggleButton value="Maintenance">Maintenance</ToggleButton>
      </ToggleButtonGroup>

      <Button
        variant="contained"
        fullWidth
        disabled={!goal}
        onClick={next}
        sx={{ padding: 1.2, fontSize: "1rem" }}
      >
        Next →
      </Button>
    </CenteredCard>
  );
}

export default StepGoal;
