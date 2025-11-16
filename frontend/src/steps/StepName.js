import React, { useState } from "react";
import { TextField, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import CenteredCard from "../components/CenteredCard";

function StepName() {
  const [name, setName] = useState("");
  const navigate = useNavigate();

  const next = () => {
    localStorage.setItem("name", name);
    navigate("/goal");
  };

  return (
    <CenteredCard title="Welcome! 🎉">
      <TextField
        fullWidth
        label="Your Name"
        variant="outlined"
        value={name}
        onChange={(e) => setName(e.target.value)}
        sx={{ mb: 3 }}
      />

      <Button 
        variant="contained" 
        fullWidth
        disabled={!name}
        onClick={next}
        sx={{ padding: 1.2, fontSize: "1rem" }}
      >
        Next →
      </Button>
    </CenteredCard>
  );
}

export default StepName;
