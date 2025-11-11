const { GoogleGenerativeAI } = require("@google/generative-ai");

exports.handler = async (event, context) => {
  // Enable CORS for browser requests
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: "",
    };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: "Server configuration error: API key not found",
      }),
    };
  }

  try {
    const {
      topic,
      difficulty = "medium",
      numQuestions = 10,
    } = JSON.parse(event.body || "{}");

    if (!topic) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Topic is required" }),
      };
    }

    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Generate the quiz using the same logic as your original service
    const prompt = `Generate ${numQuestions} multiple choice quiz questions about "${topic}" with ${difficulty} difficulty.

Please return the response in this exact JSON format:
{
  "questions": [
    {
      "question": "Question text here",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Brief explanation of why this answer is correct"
    }
  ],
  "topic": "${topic}",
  "difficulty": "${difficulty}"
}

DIFFICULTY-SPECIFIC REQUIREMENTS:

EASY Level:
- Basic concepts and definitions
- Simple terminology questions
- Straightforward scenarios
- Common knowledge in the field

MEDIUM Level:
- Application of concepts to real scenarios
- Problem-solving with multiple steps
- Best practices and methodologies
- Comparative analysis between options

HARD Level:
- Complex calculations and formulas
- Advanced technical scenarios requiring deep expertise
- Performance metrics, optimization problems
- Multi-variable problem solving
- Industry-specific edge cases and advanced techniques

General Requirements:
- Each question should have exactly 4 options
- correctAnswer should be the index (0-3) of the correct option
- Questions should be engaging and educational
- Explanations should be concise but informative
- Questions should cover different aspects of the topic
- Avoid overly obvious or trick questions
- For hard difficulty: Include at least 3-4 calculation/analytical questions
- Ensure mathematical accuracy for any numerical questions

Topic: ${topic}
Difficulty: ${difficulty}
Number of questions: ${numQuestions}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Clean up the response text to extract JSON (same logic as original)
    let jsonText = text.trim();

    // Remove markdown code blocks if present
    if (jsonText.startsWith("```json")) {
      jsonText = jsonText.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    } else if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/^```\s*/, "").replace(/\s*```$/, "");
    }

    // Additional cleanup for common AI response issues
    jsonText = jsonText
      .replace(/[\u201C\u201D]/g, '"') // Replace smart quotes with regular quotes
      .replace(/[\u2018\u2019]/g, "'") // Replace smart single quotes
      .replace(/\n\s*\n/g, "\n") // Remove extra blank lines
      .replace(/,(\s*[}\]])/g, "$1") // Remove trailing commas
      .trim();

    // Find the JSON object boundaries
    const jsonStart = jsonText.indexOf("{");
    const jsonEnd = jsonText.lastIndexOf("}");

    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      jsonText = jsonText.substring(jsonStart, jsonEnd + 1);
    }

    const quizData = JSON.parse(jsonText);

    // Validate the structure
    if (!quizData.questions || !Array.isArray(quizData.questions)) {
      throw new Error("Invalid response structure: missing questions array");
    }

    // Validate each question
    quizData.questions.forEach((q, index) => {
      if (!q.question || !Array.isArray(q.options) || q.options.length !== 4) {
        throw new Error(`Invalid question structure at index ${index}`);
      }
      if (
        typeof q.correctAnswer !== "number" ||
        q.correctAnswer < 0 ||
        q.correctAnswer > 3
      ) {
        throw new Error(`Invalid correctAnswer at index ${index}`);
      }
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(quizData),
    };
  } catch (error) {
    console.error("Error generating quiz:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: `Failed to generate quiz: ${error.message}`,
      }),
    };
  }
};
