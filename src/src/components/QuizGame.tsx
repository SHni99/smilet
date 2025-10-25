/**
 * QuizGame Component
 *
 * The main quiz gameplay interface featuring Kahoot-style interactions.
 * Displays questions with multiple choice answers, timer, score tracking,
 * and real-time feedback with beautiful animations and visual effects.
 */

import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  difficulty?: "easy" | "medium" | "hard";
  timeLimit?: number;
}

const QuizGame: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const topic = location.state?.topic || "General Knowledge";
  const difficulty = location.state?.difficulty || "medium";
  const aiQuestions = location.state?.questions || [];

  // Use AI-generated questions or fallback to mock data
  const [questions] = useState<Question[]>(
    aiQuestions.length > 0
      ? aiQuestions
      : [
          {
            id: 1,
            question: "What is the primary purpose of software testing?",
            options: [
              "To find bugs and defects",
              "To make software faster",
              "To reduce development cost",
              "To improve user interface",
            ],
            correctAnswer: 0,
            explanation:
              "Software testing primarily aims to identify bugs and defects to ensure software quality.",
            difficulty: "medium",
            timeLimit: 30,
          },
          {
            id: 2,
            question:
              "Which type of testing focuses on individual components or modules?",
            options: [
              "Integration testing",
              "System testing",
              "Unit testing",
              "Acceptance testing",
            ],
            correctAnswer: 2,
            explanation:
              "Unit testing focuses on testing individual components or modules in isolation.",
            difficulty: "medium",
            timeLimit: 30,
          },
          {
            id: 3,
            question:
              "What does the acronym 'TDD' stand for in software development?",
            options: [
              "Test-Driven Development",
              "Technical Design Document",
              "Tool Development Division",
              "Time-Driven Delivery",
            ],
            correctAnswer: 0,
            explanation:
              "TDD stands for Test-Driven Development, where tests are written before the actual code.",
            difficulty: "medium",
            timeLimit: 30,
          },
          {
            id: 4,
            question:
              "Which testing technique involves testing without knowing the internal code structure?",
            options: [
              "White box testing",
              "Gray box testing",
              "Black box testing",
              "Glass box testing",
            ],
            correctAnswer: 2,
            explanation:
              "Black box testing focuses on testing functionality without knowledge of internal implementation.",
            difficulty: "medium",
            timeLimit: 30,
          },
          {
            id: 5,
            question: "What is regression testing primarily concerned with?",
            options: [
              "Testing new features",
              "Ensuring existing functionality still works",
              "Performance optimization",
              "Security vulnerabilities",
            ],
            correctAnswer: 1,
            explanation:
              "Regression testing ensures that new changes don't break existing functionality.",
            difficulty: "medium",
            timeLimit: 30,
          },
        ]
  );

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(questions[0]?.timeLimit || 30);
  const [answeredQuestions, setAnsweredQuestions] = useState<boolean[]>(
    new Array(questions.length).fill(false)
  );
  const [userAnswers, setUserAnswers] = useState<number[]>(
    new Array(questions.length).fill(-1)
  );
  const [showConfetti, setShowConfetti] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];

  // Timer effect
  useEffect(() => {
    if (
      timeLeft > 0 &&
      !showResult &&
      !answeredQuestions[currentQuestionIndex]
    ) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (
      timeLeft === 0 &&
      !answeredQuestions[currentQuestionIndex] &&
      !showResult
    ) {
      handleAnswerSelect(-1); // Time's up
    }
  }, [timeLeft, showResult, answeredQuestions, currentQuestionIndex]);

  // Update timer when question changes
  useEffect(() => {
    setTimeLeft(questions[currentQuestionIndex]?.timeLimit || 30);
  }, [currentQuestionIndex, questions]);

  const handleAnswerSelect = (answerIndex: number) => {
    if (answeredQuestions[currentQuestionIndex] || showResult) return;

    setSelectedAnswer(answerIndex);
    setShowResult(true);

    const newAnsweredQuestions = [...answeredQuestions];
    newAnsweredQuestions[currentQuestionIndex] = true;
    setAnsweredQuestions(newAnsweredQuestions);

    const newUserAnswers = [...userAnswers];
    newUserAnswers[currentQuestionIndex] = answerIndex;
    setUserAnswers(newUserAnswers);

    if (answerIndex === currentQuestion.correctAnswer) {
      setScore(score + 1);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);
    }

    // Auto-advance to next question after showing result
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer(null);
        setShowResult(false);
      } else {
        // Quiz completed - calculate final score including current question
        const finalScore =
          answerIndex === currentQuestion.correctAnswer ? score + 1 : score;
        navigate("/results", {
          state: {
            score: finalScore,
            totalQuestions: questions.length,
            topic,
            difficulty,
            questions: questions.map((q, i) => ({
              id: i,
              ...q,
              userAnswer:
                i === currentQuestionIndex
                  ? answerIndex === -1
                    ? "unanswered"
                    : answerIndex === currentQuestion.correctAnswer
                    ? "correct"
                    : "incorrect"
                  : answeredQuestions[i]
                  ? userAnswers[i] === q.correctAnswer
                    ? "correct"
                    : "incorrect"
                  : "unanswered",
            })),
          },
        });
      }
    }, 3000);
  };

  const getAnswerButtonClass = (index: number) => {
    const baseClass =
      "w-full p-4 text-left rounded-xl font-medium transition-all duration-300 transform hover:-translate-y-1";

    if (!showResult) {
      return `${baseClass} bg-surface hover:bg-primary hover:text-white border-2 border-border hover:border-primary`;
    }

    if (index === currentQuestion.correctAnswer) {
      return `${baseClass} bg-green-500 text-white border-2 border-green-600 animate-pulse`;
    }

    if (index === selectedAnswer && index !== currentQuestion.correctAnswer) {
      return `${baseClass} bg-red-500 text-white border-2 border-red-600`;
    }

    return `${baseClass} bg-surface text-text-muted border-2 border-border opacity-50`;
  };

  return (
    <div className="min-h-screen p-4">
      {/* Confetti Effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                color: ["#7c3aed", "#f59e0b", "#8b5cf6", "#10b981"][
                  Math.floor(Math.random() * 4)
                ],
              }}
            >
              {["🎉", "🎊", "✨", "🌟"][Math.floor(Math.random() * 4)]}
            </div>
          ))}
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="glass rounded-2xl p-4">
            <div className="text-sm text-text-muted mb-1">Topic</div>
            <div className="font-semibold text-text">{topic}</div>
            <div
              className={`text-xs font-medium mt-1 ${
                difficulty === "easy"
                  ? "text-green-500"
                  : difficulty === "medium"
                  ? "text-yellow-500"
                  : "text-red-500"
              }`}
            >
              {difficulty === "easy"
                ? "🌱"
                : difficulty === "medium"
                ? "⚡"
                : "🔥"}{" "}
              {difficulty.toUpperCase()}
            </div>
          </div>

          <div className="glass rounded-2xl p-4 text-center">
            <div className="text-sm text-text-muted mb-1">Score</div>
            <div className="text-2xl font-bold text-primary">
              {score}/{questions.length}
            </div>
          </div>

          <div className="glass rounded-2xl p-4 text-center">
            <div className="text-sm text-text-muted mb-1">Time</div>
            <div
              className={`text-2xl font-bold ${
                timeLeft <= 10 ? "text-red-500 animate-pulse" : "text-accent"
              }`}
            >
              {timeLeft}s
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-text-muted mb-2">
            <span>
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
            <span>
              {Math.round(
                ((currentQuestionIndex + 1) / questions.length) * 100
              )}
              % Complete
            </span>
          </div>
          <div className="w-full bg-border rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-500"
              style={{
                width: `${
                  ((currentQuestionIndex + 1) / questions.length) * 100
                }%`,
              }}
            ></div>
          </div>
        </div>

        {/* Question Card */}
        <div className="glass rounded-3xl p-8 mb-8 animate-slide-in-up">
          <h2 className="text-2xl font-bold text-text mb-8 text-center">
            {currentQuestion.question}
          </h2>

          {/* Answer Options */}
          <div className="grid gap-4">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                disabled={answeredQuestions[currentQuestionIndex]}
                className={getAnswerButtonClass(index)}
              >
                <div className="flex items-center">
                  <span className="w-8 h-8 bg-background rounded-lg flex items-center justify-center mr-4 font-bold text-primary">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span>{option}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Result Display */}
          {showResult && (
            <div className="mt-8 p-6 bg-gradient-to-r from-surface to-background rounded-xl animate-fade-in-scale">
              {selectedAnswer === currentQuestion.correctAnswer ? (
                <div className="text-center">
                  <div className="text-4xl mb-2">🎉</div>
                  <div className="text-xl font-bold text-green-600 mb-2">
                    Correct!
                  </div>
                  <div className="text-text-muted">
                    {currentQuestion.explanation}
                  </div>
                </div>
              ) : selectedAnswer === -1 ? (
                <div className="text-center">
                  <div className="text-4xl mb-2">⏰</div>
                  <div className="text-xl font-bold text-orange-600 mb-2">
                    Time's Up!
                  </div>
                  <div className="text-text-muted">
                    The correct answer was:{" "}
                    {currentQuestion.options[currentQuestion.correctAnswer]}
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <div className="text-4xl mb-2">😅</div>
                  <div className="text-xl font-bold text-red-600 mb-2">
                    Not quite right
                  </div>
                  <div className="text-text-muted">
                    The correct answer was:{" "}
                    {currentQuestion.options[currentQuestion.correctAnswer]}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => navigate("/")}
            className="text-text-muted hover:text-primary transition-colors duration-300 flex items-center"
          >
            <span className="mr-2">←</span> Exit Quiz
          </button>

          <div className="text-text-muted">
            {answeredQuestions.filter(Boolean).length} of {questions.length}{" "}
            completed
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizGame;
