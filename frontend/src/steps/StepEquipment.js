import React, { useState } from "react";
import { Button, FormControlLabel, Checkbox } from "@mui/material";
import { useNavigate } from "react-router-dom";
import CenteredCard from "../components/CenteredCard";

function StepEquipment() {
  const [equipment, setEquipment] = useState([]);
  const navigate = useNavigate();

  const toggleEquip = (item) => {
    if (equipment.includes(item)) {
      setEquipment(equipment.filter(i => i !== item));
    } else {
      setEquipment([...equipment, item]);
    }
  };

  const next = () => {
    localStorage.setItem("equipment", JSON.stringify(equipment));
    navigate("/cuisine");
  };

  const items = ["None", "Dumbbells", "Resistance Band", "Bench"];

  return (
    <CenteredCard title="Equipment You Have 🏋️‍♂️">
      {items.map((item) => (
        <FormControlLabel
          key={item}
          control={<Checkbox onChange={() => toggleEquip(item)} />}
          label={item}
        />
      ))}

      <Button 
        variant="contained"
        fullWidth
        onClick={next}
        sx={{ mt: 3, padding: 1.2 }}
      >
        Next →
      </Button>
    </CenteredCard>
  );
}

export default StepEquipment;
