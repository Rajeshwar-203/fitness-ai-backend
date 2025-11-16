import React, { useState } from "react";
import { Button, TextField, MenuItem } from "@mui/material";
import { useNavigate } from "react-router-dom";
import CenteredCard from "../components/CenteredCard";

function StepCuisine() {
  const [cuisine, setCuisine] = useState("");
  const navigate = useNavigate();

  const next = () => {
    localStorage.setItem("cuisine", cuisine);
    navigate("/done");
  };

  return (
    <CenteredCard title="Food Preference 🍽️">
      <TextField
        select
        fullWidth
        label="Choose Cuisine"
        value={cuisine}
        onChange={(e) => setCuisine(e.target.value)}
        sx={{ mb: 3 }}
      >
        <MenuItem value="Indian">Indian</MenuItem>
        <MenuItem value="Asian">Asian</MenuItem>
        <MenuItem value="Western">Western</MenuItem>
      </TextField>

      <Button
        variant="contained"
        fullWidth
        disabled={!cuisine}
        onClick={next}
        sx={{ padding: 1.2 }}
      >
        Finish →
      </Button>
    </CenteredCard>
  );
}

export default StepCuisine;
