import React from "react";
import { Box, Card, Typography } from "@mui/material";

function CenteredCard({ title, children }) {
  return (
    <Box 
      sx={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f7f7f7"
      }}
    >
      <Card 
        sx={{
          width: 380,
          padding: 4,
          borderRadius: 4,
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)"
        }}
      >
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
          {title}
        </Typography>

        {children}
      </Card>
    </Box>
  );
}

export default CenteredCard;
