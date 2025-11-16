import React, { useState } from "react";
import { TextField, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import CenteredCard from "../components/CenteredCard";

function StepBody() {
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const navigate = useNavigate();

  const next = () => {
    localStorage.setItem("height", height);
    localStorage.setItem("weight", weight);
    navigate("/equipment");
  };

  return (
    <CenteredCard title="Your Body Details 📏">
      <TextField
        fullWidth
        label="Height (cm)"
        type="number"
        value={height}
        onChange={(e) => setHeight(e.target.value)}
        sx={{ mb: 2 }}
      />

      <TextField
        fullWidth
        label="Weight (kg)"
        type="number"
        value={weight}
        onChange={(e) => setWeight(e.target.value)}
        sx={{ mb: 3 }}
      />

      <Button
        variant="contained"
        fullWidth
        disabled={!height || !weight}
        onClick={next}
        sx={{ padding: 1.2, fontSize: "1rem" }}
      >
        Next →
      </Button>
    </CenteredCard>
  );
}

export default StepBody;
