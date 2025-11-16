import React, { useState } from "react";
import { TextField, Button, Card, Box, Typography } from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();
  const [data, setData] = useState({ email: "", password: "" });

  const handleLogin = async () => {
    const res = await axios.post("http://127.0.0.1:8000/login", data);

    if (res.data.token) {
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("name", res.data.name);
      navigate("/dashboard");
    }
  };

  return (
    <Box sx={{ height: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <Card sx={{ padding: 4, width: 350 }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>Welcome Back</Typography>

        <TextField label="Email" fullWidth sx={{ mb: 2 }} onChange={e => setData({ ...data, email: e.target.value })}/>
        <TextField label="Password" type="password" fullWidth sx={{ mb: 3 }} onChange={e => setData({ ...data, password: e.target.value })}/>

        <Button variant="contained" fullWidth onClick={handleLogin}>Login</Button>
      </Card>
    </Box>
  );
}

export default Login;
