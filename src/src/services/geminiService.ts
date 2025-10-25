// No longer need to import GoogleGenerativeAI or API key in client
// API calls are now handled by Netlify Functions for security

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface QuizData {
  questions: QuizQuestion[];
  topic: string;
  difficulty: string;
}

export async function generateQuizQuestions(
  topic: string,
  difficulty: "easy" | "medium" | "hard" = "medium",
  numQuestions: number = 10
): Promise<QuizData> {
  try {
    const response = await fetch("/.netlify/functions/generate-quiz", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        topic,
        difficulty,
        numQuestions,
      }),
    });

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ error: "Unknown error" }));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    const quizData: QuizData = await response.json();
    return quizData;
  } catch (error) {
    console.error("Error generating quiz questions:", error);
    throw new Error(
      `Failed to generate quiz questions: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

export async function generateHint(
  question: string,
  userAnswer: string
): Promise<string> {
  try {
    const response = await fetch("/.netlify/functions/generate-hint", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question,
        userAnswer,
      }),
    });

    if (!response.ok) {
      console.error("Error generating hint:", response.status);
      return "Think about the key concepts related to this topic and consider each option carefully.";
    }

    const data = await response.json();
    return (
      data.hint ||
      "Think about the key concepts related to this topic and consider each option carefully."
    );
  } catch (error) {
    console.error("Error generating hint:", error);
    return "Think about the key concepts related to this topic and consider each option carefully.";
  }
}
