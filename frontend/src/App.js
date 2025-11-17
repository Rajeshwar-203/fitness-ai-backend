import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import StepName from "./steps/StepName";
import StepGoal from "./steps/StepGoal";
import StepBody from "./steps/StepBody";
import StepEquipment from "./steps/StepEquipment";
import StepCuisine from "./steps/StepCuisine";
import FinalPage from "./steps/FinalPage";

import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import WeeklyPlan from "./pages/WeeklyPlan";
import MealPlan from "./pages/MealPlan";
import WorkoutAI from "./pages/WorkoutAI";

import Navbar from "./components/Navbar";

// ======================================================
// 🚀 AUTH GUARD (Protect pages after login)
// ======================================================
const Protected = ({ children }) => {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <BrowserRouter>
      {/* Navbar visible on all pages except onboarding */}
      <Navbar />

      <Routes>
        {/* Onboarding Steps */}
        <Route path="/" element={<StepName />} />
        <Route path="/goal" element={<StepGoal />} />
        <Route path="/body" element={<StepBody />} />
        <Route path="/equipment" element={<StepEquipment />} />
        <Route path="/cuisine" element={<StepCuisine />} />
        <Route path="/done" element={<FinalPage />} />

        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <Protected>
              <Dashboard />
            </Protected>
          }
        />

        <Route
          path="/weekly-plan"
          element={
            <Protected>
              <WeeklyPlan />
            </Protected>
          }
        />

        <Route
          path="/meal-plan"
          element={
            <Protected>
              <MealPlan />
            </Protected>
          }
        />

        <Route
          path="/workout-ai"
          element={
            <Protected>
              <WorkoutAI />
            </Protected>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
