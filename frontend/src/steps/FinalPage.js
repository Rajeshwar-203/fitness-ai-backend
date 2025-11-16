import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function FinalPage() {
  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => {
      navigate("/dashboard");
    }, 1500);
  }, []);

  return (
    <h2 style={{ padding: 40 }}>
      Preparing your personalized plan... 🚀
    </h2>
  );
}

export default FinalPage;
