/**
 * TopicInput Component
 *
 * Allows users to input their preferred topic for quiz generation.
 * Features an elegant form with smooth animations and AI processing state.
 * Validates input and provides visual feedback during AI question generation.
 */

import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { generateQuizQuestions } from "../services/geminiService";

const TopicInput: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // If navigated from ResultsPage, location.state may contain prefill/review data
  const incomingState = (location && (location.state as any)) || {};

  const [topic, setTopic] = useState<string>(incomingState.topic || "");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">(
    "medium"
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reviewMode, setReviewMode] = useState<boolean>(!!incomingState.review);
  const [missedQuestions, setMissedQuestions] = useState<any[] | null>(
    incomingState.missedQuestions || null
  );
  const [suggestedTopics] = useState([
    "Software Testing",
    "JavaScript Fundamentals",
    "World History",
    "Science Trivia",
    "React Development",
    "Geography",
    "Machine Learning",
    "Pop Culture",
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setIsGenerating(true);
    setError(null);

    try {
      // Generate questions using Gemini API
      const quizData = await generateQuizQuestions(
        topic.trim(),
        difficulty,
        10
      );

      navigate("/quiz", {
        state: {
          topic: topic.trim(),
          difficulty: difficulty,
          questions: quizData.questions,
          quizData: quizData,
        },
      });
    } catch (err) {
      console.error("Failed to generate quiz questions:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to generate quiz questions. Please try again."
      );
      setIsGenerating(false);
    }
  };

  const handleSuggestedTopic = (suggestedTopic: string) => {
    setTopic(suggestedTopic);
  };

  useEffect(() => {
    // If prefill requested, focus the input or auto-submit
    if (incomingState.prefill && incomingState.topic) {
      setTopic(incomingState.topic);
      // Optionally auto-submit — we keep it manual for UX
    }

    if (incomingState.review && incomingState.missedQuestions) {
      setReviewMode(true);
      setMissedQuestions(incomingState.missedQuestions);
    }
  }, []);

  if (isGenerating) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-2xl mx-auto text-center">
          {/* AI Processing Animation */}
          <div className="relative mb-8">
            <div className="w-32 h-32 mx-auto relative">
              {/* Outer rotating ring */}
              <div className="absolute inset-0 border-4 border-primary/20 rounded-full animate-spin-slow"></div>

              {/* Inner pulsing ring */}
              <div className="absolute inset-4 border-4 border-primary/40 rounded-full animate-pulse"></div>

              {/* Center AI icon */}
              <div className="absolute inset-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                <span className="text-3xl animate-bounce-gentle">🧠</span>
              </div>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-text mb-4">
            Creating Your Personalized Quiz
          </h2>
          <p className="text-lg text-text-muted mb-8">
            Our AI is researching and generating questions about:
          </p>

          {/* Topic Display */}
          <div className="glass rounded-2xl p-6 mb-8 animate-fade-in-scale">
            <div className="text-2xl font-semibold text-primary mb-2">
              {topic}
            </div>
            <div className="flex items-center justify-center text-text-muted mb-3">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse mr-2"></div>
              Analyzing online sources
            </div>
            <div className="flex items-center justify-center">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  difficulty === "easy"
                    ? "bg-green-500 text-white"
                    : difficulty === "medium"
                    ? "bg-yellow-500 text-white"
                    : "bg-red-500 text-white"
                }`}
              >
                {difficulty === "easy"
                  ? "🌱"
                  : difficulty === "medium"
                  ? "⚡"
                  : "🔥"}{" "}
                {difficulty.toUpperCase()} LEVEL
              </span>
            </div>
          </div>

          {/* Progress Indicators */}
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <div
                className="w-3 h-3 bg-primary rounded-full animate-bounce"
                style={{ animationDelay: "0s" }}
              ></div>
              <div
                className="w-3 h-3 bg-primary rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              ></div>
              <div
                className="w-3 h-3 bg-primary rounded-full animate-bounce"
                style={{ animationDelay: "0.4s" }}
              ></div>
            </div>
            <p className="text-text-muted">
              This usually takes about 30 seconds...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-2xl mx-auto w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl mb-4">
            <span className="text-2xl">🎯</span>
          </div>
          <h1 className="text-4xl font-bold text-text mb-4">
            What Would You Like to Learn?
          </h1>
          <p className="text-lg text-text-muted">
            Tell us your preferred topic and we'll create a personalized quiz
            just for you
          </p>
        </div>

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="mb-12">
          <div className="glass rounded-2xl p-8">
            <label
              htmlFor="topic"
              className="block text-lg font-semibold text-text mb-4"
            >
              Enter Your Topic
            </label>

            <div className="relative mb-6">
              <input
                id="topic"
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., Software Testing, World History, JavaScript..."
                className="w-full px-6 py-4 text-lg border-2 border-border rounded-xl focus:border-primary focus:outline-none transition-colors duration-300 bg-background"
                required
              />
              {topic && (
                <button
                  type="button"
                  onClick={() => setTopic("")}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-text-muted hover:text-text transition-colors"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Difficulty Selection */}
            <div className="mb-6">
              <label className="block text-lg font-semibold text-text mb-4">
                Select Difficulty Level
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setDifficulty("easy")}
                  className={`py-3 px-4 rounded-xl font-medium transition-all duration-300 ${
                    difficulty === "easy"
                      ? "bg-green-500 text-white shadow-lg transform scale-105"
                      : "bg-background border-2 border-border text-text-muted hover:border-green-500 hover:text-green-500"
                  }`}
                >
                  <div className="text-lg">🌱</div>
                  <div>Easy</div>
                  <div className="text-xs opacity-75">Beginner friendly</div>
                </button>

                <button
                  type="button"
                  onClick={() => setDifficulty("medium")}
                  className={`py-3 px-4 rounded-xl font-medium transition-all duration-300 ${
                    difficulty === "medium"
                      ? "bg-yellow-500 text-white shadow-lg transform scale-105"
                      : "bg-background border-2 border-border text-text-muted hover:border-yellow-500 hover:text-yellow-500"
                  }`}
                >
                  <div className="text-lg">⚡</div>
                  <div>Medium</div>
                  <div className="text-xs opacity-75">Moderate challenge</div>
                </button>

                <button
                  type="button"
                  onClick={() => setDifficulty("hard")}
                  className={`py-3 px-4 rounded-xl font-medium transition-all duration-300 ${
                    difficulty === "hard"
                      ? "bg-red-500 text-white shadow-lg transform scale-105"
                      : "bg-background border-2 border-border text-text-muted hover:border-red-500 hover:text-red-500"
                  }`}
                >
                  <div className="text-lg">🔥</div>
                  <div>Hard</div>
                  <div className="text-xs opacity-75">Expert level</div>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={!topic.trim()}
              className="w-full py-4 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              Generate My Quiz ✨
            </button>
          </div>
        </form>

        {/* Error Display */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center">
              <span className="text-red-500 text-xl mr-3">⚠️</span>
              <div>
                <h4 className="text-red-800 font-semibold">
                  Error Generating Quiz
                </h4>
                <p className="text-red-600">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Suggested Topics */}
        <div className="text-center">
          <h3 className="text-lg font-semibold text-text mb-6">
            Or try one of these popular topics:
          </h3>
          <div className="flex flex-wrap justify-center gap-3">
            {suggestedTopics.map((suggestedTopic, index) => (
              <button
                key={index}
                onClick={() => handleSuggestedTopic(suggestedTopic)}
                className="px-4 py-2 bg-gradient-to-r from-surface to-background border border-border rounded-lg text-text-muted hover:text-primary hover:border-primary transition-all duration-300 transform hover:-translate-y-0.5"
              >
                {suggestedTopic}
              </button>
            ))}
          </div>
        </div>

        {/* Back Button */}
        <div className="text-center mt-12">
          <button
            onClick={() => navigate("/")}
            className="text-text-muted hover:text-primary transition-colors duration-300 flex items-center justify-center mx-auto"
          >
            <span className="mr-2">←</span> Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default TopicInput;
