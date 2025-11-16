import React, { useState } from "react";
import { TextField, Button, Card, Box, Typography } from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Signup() {
  const navigate = useNavigate();
  const [data, setData] = useState({ name: "", email: "", password: "" });

  const handleSignup = async () => {
    const res = await axios.post("https://fitness-ai-backend.onrender.com/signup", data);

    if (res.data.token) {
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("name", res.data.name);
      navigate("/dashboard");
    }
  };

  return (
    <Box sx={{ height: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <Card sx={{ padding: 4, width: 350 }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>Create Account</Typography>

        <TextField label="Name" fullWidth sx={{ mb: 2 }} onChange={e => setData({ ...data, name: e.target.value })}/>
        <TextField label="Email" fullWidth sx={{ mb: 2 }} onChange={e => setData({ ...data, email: e.target.value })}/>
        <TextField label="Password" type="password" fullWidth sx={{ mb: 3 }} onChange={e => setData({ ...data, password: e.target.value })}/>

        <Button variant="contained" fullWidth onClick={handleSignup}>Signup</Button>
      </Card>
    </Box>
  );
}

export default Signup;
