import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { generateHint } from "../services/geminiService";

interface MissedQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  userAnswer: number | "unanswered" | "incorrect" | "correct";
}

const DeepDive: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = (location && (location.state as any)) || {};
  const topic: string = state.topic || "Topic";
  const missed: MissedQuestion[] = state.missedQuestions || [];

  const [hints, setHints] = useState<Record<number, string>>({});
  const [loadingIds, setLoadingIds] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Pre-fetch hints for missed questions
    (async () => {
      try {
        for (const q of missed) {
          setLoadingIds((prev) => [...prev, q.id]);
          const userAnsText =
            typeof q.userAnswer === "number"
              ? q.options[q.userAnswer]
              : String(q.userAnswer);
          const hint = await generateHint(q.question, userAnsText);
          setHints((prev) => ({ ...prev, [q.id]: hint }));
          setLoadingIds((prev) => prev.filter((id) => id !== q.id));
        }
      } catch (e) {
        console.error("DeepDive hint fetch error", e);
        setError("Failed to fetch hints. Please try again later.");
      }
    })();
  }, [missed]);

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold">Deep Dive: {topic}</h1>
          <p className="text-text-muted">
            Review each missed question with tailored hints and explanations.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {missed.length === 0 && (
            <div className="p-6 bg-surface rounded-xl text-center">
              No missed questions — great job!
            </div>
          )}

          {missed.map((q) => (
            <div key={q.id} className="p-4 bg-white/5 glass rounded-xl">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-text mb-2">{q.question}</p>
                  <p className="text-sm text-text-muted">
                    Correct answer:{" "}
                    <span className="font-semibold text-primary">
                      {q.options[q.correctAnswer]}
                    </span>
                  </p>
                </div>
                <div className="text-sm text-text-muted">
                  {loadingIds.includes(q.id) ? "Loading hint..." : ""}
                </div>
              </div>

              <div className="mt-3">
                <h5 className="text-sm font-semibold mb-1">
                  Hint / Elaboration
                </h5>
                <p className="text-text-muted text-sm">
                  {hints[q.id] ||
                    (loadingIds.includes(q.id)
                      ? "Generating..."
                      : "No hint available")}
                </p>
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() =>
                    navigate("/topic", { state: { topic: q.question } })
                  }
                  className="px-4 py-2 bg-primary text-white rounded"
                >
                  Try similar question
                </button>
                <button
                  onClick={() => navigator.clipboard.writeText(q.question)}
                  className="px-4 py-2 bg-surface border border-border rounded"
                >
                  Copy question
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 bg-surface rounded-lg border border-border"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeepDive;
