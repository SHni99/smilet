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
        temperature: 0.5,
        maxOutputTokens: 4096,
        responseMimeType: "application/json",
        candidateCount: 1,
      },
    });

    // Simplified prompt that's faster to process
    const difficultyGuide = {
      easy: "basic concepts and simple definitions",
      medium: "practical applications and problem-solving",
      hard: "advanced scenarios and calculations",
    };

    const prompt = `Create ${numQuestions} quiz questions about ${topic} (${difficulty} level: ${difficultyGuide[difficulty]}).

Return valid JSON with this structure:
{
  "questions": [
    {
      "question": "question text here",
      "options": ["option 1", "option 2", "option 3", "option 4"],
      "correctAnswer": 0,
      "explanation": "why this is correct"
    }
  ],
  "topic": "${topic}",
  "difficulty": "${difficulty}"
}

Rules:
- correctAnswer is index 0-3
- Keep text concise
- No special formatting`;

    // Add timeout protection
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(
        () => reject(new Error("Generation timeout after 25 seconds")),
        25000
      );
    });

    const generationPromise = model.generateContent(prompt);

    const result = await Promise.race([generationPromise, timeoutPromise]);
    const response = await result.response;
    
    // Check if response was complete
    const candidates = result.response.candidates;
    if (candidates && candidates[0]) {
      const finishReason = candidates[0].finishReason;
      console.log("Finish reason:", finishReason);
      
      if (finishReason && finishReason !== "STOP") {
        console.warn("Response may be incomplete. Finish reason:", finishReason);
        
        if (finishReason === "MAX_TOKENS") {
          throw new Error("Response truncated due to token limit. Try reducing the number of questions.");
        }
      }
    }
    
    const text = response.text();

    // Since we're using responseMimeType: "application/json", the response should be valid JSON
    console.log("Raw AI Response length:", text.length);
    console.log("First 500 chars:", text.substring(0, 500));
    console.log("Last 100 chars:", text.substring(Math.max(0, text.length - 100)));

    let quizData;
    try {
      // Try parsing directly first
      quizData = JSON.parse(text);
      console.log("Successfully parsed JSON directly");
    } catch (directParseError) {
      console.log("Direct parse failed, attempting cleanup...");
      
      // Fallback: Clean up the response text to extract JSON
      let jsonText = text.trim();

      // Remove markdown code blocks if present
      if (jsonText.startsWith("```json")) {
        jsonText = jsonText.replace(/^```json\s*/, "").replace(/\s*```$/, "");
      } else if (jsonText.startsWith("```")) {
        jsonText = jsonText.replace(/^```\s*/, "").replace(/\s*```$/, "");
      }

      // Find the JSON object boundaries
      const jsonStart = jsonText.indexOf("{");
      const jsonEnd = jsonText.lastIndexOf("}");

      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        jsonText = jsonText.substring(jsonStart, jsonEnd + 1);
      }

      console.log("Cleaned JSON (first 500 chars):", jsonText.substring(0, 500));

      quizData = JSON.parse(jsonText);
      console.log("Successfully parsed after cleanup");
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
