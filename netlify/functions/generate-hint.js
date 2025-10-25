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
    const { question, userAnswer } = JSON.parse(event.body || "{}");

    if (!question || !userAnswer) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Question and userAnswer are required" }),
      };
    }

    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    const prompt = `Given this quiz question and the user's answer, provide a helpful hint (not the full answer):

Question: ${question}
User's answer: ${userAnswer}

Please provide a brief, encouraging hint that guides the user toward the correct answer without giving it away completely. Keep it under 50 words.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const hint = response.text().trim();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ hint }),
    };
  } catch (error) {
    console.error("Error generating hint:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        hint: "Think about the key concepts related to this topic and consider each option carefully.",
      }),
    };
  }
};
