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
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      },
    });

    // Simplified prompt that's faster to process
    const difficultyGuide = {
      easy: "basic concepts and simple definitions",
      medium: "practical applications and problem-solving",
      hard: "advanced scenarios, calculations, and deep technical knowledge"
    };

    const prompt = `Generate ${numQuestions} multiple choice quiz questions about "${topic}" at ${difficulty} level (${difficultyGuide[difficulty]}).

Return ONLY valid JSON (no markdown, no code blocks):
{
  "questions": [
    {
      "question": "Question text",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": 0,
      "explanation": "Brief explanation"
    }
  ],
  "topic": "${topic}",
  "difficulty": "${difficulty}"
}

Rules:
- 4 options per question, correctAnswer is index 0-3
- Keep explanations under 80 characters
- Use only ASCII characters
- Return pure JSON only`;

    // Add timeout protection
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Generation timeout after 25 seconds')), 25000);
    });

    const generationPromise = model.generateContent(prompt);
    
    const result = await Promise.race([generationPromise, timeoutPromise]);
    const response = await result.response;
    const text = response.text();

    // Log the raw response for debugging
    console.log("Raw AI Response:", text.substring(0, 500));

    // Clean up the response text to extract JSON
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

    console.log("Cleaned JSON text:", jsonText.substring(0, 500));

    let quizData;
    try {
      quizData = JSON.parse(jsonText);
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError);
      console.error("Failed to parse text:", jsonText.substring(0, 1000));
      throw new Error(`JSON parsing failed: ${parseError.message}`);
    }

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
    console.error("Error stack:", error.stack);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: `Failed to generate quiz: ${error.message}`,
        details: error.stack,
      }),
    };
  }
};
