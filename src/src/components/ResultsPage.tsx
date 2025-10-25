/**
 * ResultsPage Component
 *
 * Displays comprehensive quiz results with beautiful visualizations.
 * Shows score breakdown, performance metrics, and personalized recommendations.
 * Features animated charts and celebratory elements for great performance.
 */

import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

interface QuestionResult {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  userAnswer: "correct" | "incorrect" | "unanswered";
}

interface ResultsState {
  score: number;
  totalQuestions: number;
  topic: string;
  difficulty: "easy" | "medium" | "hard";
  questions: QuestionResult[];
}

const ResultsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { score, totalQuestions, topic, difficulty, questions } =
    location.state as ResultsState;

  const percentage = Math.round((score / totalQuestions) * 100);
  const correctAnswers = questions.filter(
    (q) => q.userAnswer === "correct"
  ).length;
  const incorrectAnswers = questions.filter(
    (q) => q.userAnswer === "incorrect"
  ).length;
  const unansweredQuestions = questions.filter(
    (q) => q.userAnswer === "unanswered"
  ).length;
  const missedQuestions = questions.filter((q) => q.userAnswer === "incorrect");

  const getPerformanceMessage = () => {
    if (percentage >= 90)
      return {
        message: "Outstanding! 🏆",
        color: "text-green-600",
        emoji: "🌟",
      };
    if (percentage >= 80)
      return { message: "Excellent! 🎉", color: "text-blue-600", emoji: "👏" };
    if (percentage >= 70)
      return {
        message: "Great Job! 👍",
        color: "text-purple-600",
        emoji: "😊",
      };
    if (percentage >= 60)
      return {
        message: "Good Effort! 💪",
        color: "text-orange-600",
        emoji: "👍",
      };
    return { message: "Keep Learning! 📚", color: "text-red-600", emoji: "💪" };
  };

  const performance = getPerformanceMessage();

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-2xl mb-6 shadow-lg">
            <span className="text-3xl">🏆</span>
          </div>
          <h1 className="text-5xl font-bold text-text mb-4">Quiz Complete!</h1>
          <p className="text-xl text-text-muted">
            Here's how you performed on {topic}
          </p>
          <div className="mt-4">
            <span
              className={`px-4 py-2 rounded-full text-sm font-medium ${
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
              {difficulty.toUpperCase()} DIFFICULTY
            </span>
          </div>
        </div>

        {/* Main Score Card */}
        <div className="glass rounded-3xl p-8 mb-8 text-center animate-fade-in-scale">
          <div className="text-8xl mb-4">{performance.emoji}</div>
          <div className={`text-4xl font-bold ${performance.color} mb-2`}>
            {performance.message}
          </div>
          <div className="text-6xl font-bold text-text mb-2">
            {score}/{totalQuestions}
          </div>
          <div className="text-2xl text-text-muted mb-6">
            {percentage}% Correct
          </div>

          {/* Score Circle */}
          <div className="relative w-48 h-48 mx-auto mb-6">
            <svg
              className="w-full h-full transform -rotate-90"
              viewBox="0 0 100 100"
            >
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-border"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${(percentage / 100) * 283} 283`}
                className="text-primary transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl font-bold text-primary">
                {percentage}%
              </span>
            </div>
          </div>
        </div>

        {/* Detailed Breakdown */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="glass rounded-2xl p-6 text-center">
            <div className="w-12 h-12 bg-green-500 rounded-xl mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl text-white">✓</span>
            </div>
            <div className="text-3xl font-bold text-green-600 mb-2">
              {correctAnswers}
            </div>
            <div className="text-text-muted">Correct Answers</div>
          </div>

          <div className="glass rounded-2xl p-6 text-center">
            <div className="w-12 h-12 bg-red-500 rounded-xl mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl text-white">✗</span>
            </div>
            <div className="text-3xl font-bold text-red-600 mb-2">
              {incorrectAnswers}
            </div>
            <div className="text-text-muted">Incorrect Answers</div>
          </div>

          <div className="glass rounded-2xl p-6 text-center">
            <div className="w-12 h-12 bg-orange-500 rounded-xl mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl text-white">?</span>
            </div>
            <div className="text-3xl font-bold text-orange-600 mb-2">
              {unansweredQuestions}
            </div>
            <div className="text-text-muted">Unanswered</div>
          </div>
        </div>

        {/* Question Review */}
        <div className="glass rounded-3xl p-8 mb-8">
          <h3 className="text-2xl font-bold text-text mb-6">Question Review</h3>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {questions.map((question, index) => (
              <div key={question.id} className="p-4 bg-surface rounded-xl">
                <div className="flex items-start justify-between mb-2">
                  <span className="text-sm font-semibold text-text-muted">
                    Question {index + 1}
                  </span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      question.userAnswer === "correct"
                        ? "bg-green-100 text-green-800"
                        : question.userAnswer === "incorrect"
                        ? "bg-red-100 text-red-800"
                        : "bg-orange-100 text-orange-800"
                    }`}
                  >
                    {question.userAnswer === "correct"
                      ? "Correct"
                      : question.userAnswer === "incorrect"
                      ? "Incorrect"
                      : "Unanswered"}
                  </span>
                </div>
                <p className="text-text mb-2">{question.question}</p>
                <p className="text-sm text-text-muted">
                  Correct answer:{" "}
                  <span className="font-semibold text-primary">
                    {question.options[question.correctAnswer]}
                  </span>
                </p>
                {question.explanation && (
                  <p className="text-sm text-text-muted mt-2">
                    {question.explanation}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Learning Recommendations */}
        <div className="glass rounded-3xl p-8 mb-8">
          <h3 className="text-2xl font-bold text-text mb-6">
            Continue Learning
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() =>
                navigate("/topic", { state: { topic, prefill: true } })
              }
              className="p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl text-left hover:shadow-md transition-shadow duration-200"
              aria-label="Practice another quiz on this topic"
            >
              <h4 className="font-semibold text-primary mb-2">
                🎯 Practice More
              </h4>
              <p className="text-text-muted text-sm">
                Start another quiz (topic prefilled) to expand your knowledge.
              </p>
            </button>

            <button
              type="button"
              onClick={() =>
                navigate("/deep-dive", {
                  state: { topic, missedQuestions },
                })
              }
              className="p-4 bg-gradient-to-r from-accent/10 to-accent/5 rounded-xl text-left hover:shadow-md transition-shadow duration-200"
              aria-label="Open deep dive page for missed questions"
            >
              <h4 className="font-semibold text-accent mb-2">📚 Deep Dive</h4>
              <p className="text-text-muted text-sm">
                Open a detailed review page for the questions you missed.
              </p>
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate("/topic")}
            className="px-8 py-4 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
          >
            Take Another Quiz 🚀
          </button>
          <button
            onClick={() => navigate("/")}
            className="px-8 py-4 bg-surface text-text font-semibold rounded-2xl border-2 border-border hover:border-primary hover:text-primary transition-all duration-300"
          >
            Back to Home 🏠
          </button>
        </div>

        {/* Footer Stats */}
        <div className="text-center mt-12 text-text-muted">
          <p>
            You completed the {difficulty} difficulty quiz in {topic} with{" "}
            {percentage}% accuracy!
          </p>
          <p className="text-sm mt-2">
            Keep learning and challenge yourself with new topics and
            difficulties.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;
