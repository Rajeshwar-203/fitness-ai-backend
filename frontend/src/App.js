import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

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
import Navbar from "./components/Navbar";   // ✅ NEW

function App() {
  return (
    <BrowserRouter basename="/">
      {/* Navbar visible on all pages except maybe onboarding if you want */}
      <Navbar />

      <Routes>
        <Route path="/" element={<StepName />} />
        <Route path="/goal" element={<StepGoal />} />
        <Route path="/body" element={<StepBody />} />
        <Route path="/equipment" element={<StepEquipment />} />
        <Route path="/cuisine" element={<StepCuisine />} />
        <Route path="/done" element={<FinalPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/weekly-plan" element={<WeeklyPlan />} />
        <Route path="/meal-plan" element={<MealPlan />} />
        <Route path="/workout-ai" element={<WorkoutAI />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
