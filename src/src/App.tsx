import React from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import "./global.css";
import LandingPage from "./components/LandingPage";
import TopicInput from "./components/TopicInput";
import QuizGame from "./components/QuizGame";
import ResultsPage from "./components/ResultsPage";
import DeepDive from "./components/DeepDive";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-surface to-background">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/topic" element={<TopicInput />} />
          <Route path="/quiz" element={<QuizGame />} />
          <Route path="/results" element={<ResultsPage />} />
          <Route path="/deep-dive" element={<DeepDive />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
