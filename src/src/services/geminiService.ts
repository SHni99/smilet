import { GoogleGenerativeAI } from "@google/generative-ai";

// Use custom global variable injected by RSBuild
declare const __VITE_GEMINI_API_KEY__: string | undefined;

const API_KEY = __VITE_GEMINI_API_KEY__;

if (!API_KEY) {
  throw new Error(
    "VITE_GEMINI_API_KEY is not set. Please create a .env file with your Gemini API key. " +
      "Get your API key from: https://makersuite.google.com/app/apikey"
  );
}

const genAI = new GoogleGenerativeAI(API_KEY);

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

function getTopicSpecificInstructions(
  topic: string,
  difficulty: "easy" | "medium" | "hard"
): string {
  const topicLower = topic.toLowerCase();

  if (
    topicLower.includes("software testing") ||
    topicLower.includes("testing")
  ) {
    if (difficulty === "hard") {
      return `
FOR SOFTWARE TESTING (Hard):
- Include calculation questions for non-functional testing metrics:
  * Performance testing: throughput, response time, concurrent users
  * Load testing: calculating system capacity and limits
  * Memory usage calculations and optimization
  * Test coverage percentage calculations
  * Defect density and escape rate calculations
- Include complex test strategy scenarios
- Advanced automation framework questions
- API testing with complex validation logic`;
    } else if (difficulty === "medium") {
      return `
FOR SOFTWARE TESTING (Medium):
- Test case design techniques with examples
- Bug lifecycle and severity/priority scenarios
- Testing methodologies comparison
- Basic performance testing concepts`;
    } else {
      return `
FOR SOFTWARE TESTING (Easy):
- Basic testing terminology
- Simple test types (unit, integration, system)
- Basic bug reporting concepts`;
    }
  }

  if (topicLower.includes("javascript") || topicLower.includes("programming")) {
    if (difficulty === "hard") {
      return `
FOR PROGRAMMING (Hard):
- Algorithm complexity calculations (Big O notation)
- Memory management and optimization problems
- Performance benchmarking calculations
- Advanced data structure operations with metrics`;
    }
  }

  if (
    topicLower.includes("performance") ||
    topicLower.includes("optimization")
  ) {
    if (difficulty === "hard") {
      return `
FOR PERFORMANCE TOPICS (Hard):
- Include numerical calculations for:
  * Throughput calculations (requests per second)
  * Response time analysis and percentiles
  * Resource utilization percentages
  * Scalability factor calculations
  * Performance improvement ratios`;
    }
  }

  // Default instructions for technical topics
  if (difficulty === "hard") {
    return `
FOR TECHNICAL TOPICS (Hard):
- Include calculation-based questions where applicable
- Focus on metrics, ratios, and quantitative analysis
- Advanced problem-solving scenarios
- Industry-specific formulas and calculations`;
  }

  return "Focus on practical applications and real-world scenarios.";
}

export async function generateQuizQuestions(
  topic: string,
  difficulty: "easy" | "medium" | "hard" = "medium",
  numQuestions: number = 10
): Promise<QuizData> {
  try {
    // Use Gemini 2.0 Flash model
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

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

TECHNICAL TOPIC OPTIMIZATION:
${getTopicSpecificInstructions(topic, difficulty)}

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

    try {
      const quizData: QuizData = JSON.parse(jsonText);

      // Validate the structure
      if (!quizData.questions || !Array.isArray(quizData.questions)) {
        throw new Error("Invalid response structure: missing questions array");
      }

      // Validate each question
      quizData.questions.forEach((q, index) => {
        if (
          !q.question ||
          !Array.isArray(q.options) ||
          q.options.length !== 4
        ) {
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

      return quizData;
    } catch (parseError) {
      console.error("Failed to parse Gemini response:", text);
      console.error("Parse error:", parseError);

      // Retry with a simpler prompt focused on JSON output
      console.log("Retrying with simplified prompt...");
      try {
        const simplePrompt = `Create ${numQuestions} quiz questions about "${topic}" (${difficulty} level). 
Return ONLY valid JSON in this exact format with no extra text:

{
  "questions": [
    {
      "question": "Question text?",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": 0,
      "explanation": "Why A is correct"
    }
  ],
  "topic": "${topic}",
  "difficulty": "${difficulty}"
}`;

        const retryResult = await model.generateContent(simplePrompt);
        const retryResponse = await retryResult.response;
        let retryText = retryResponse.text().trim();

        // Clean retry response
        if (retryText.startsWith("```json")) {
          retryText = retryText
            .replace(/^```json\s*/, "")
            .replace(/\s*```$/, "");
        } else if (retryText.startsWith("```")) {
          retryText = retryText.replace(/^```\s*/, "").replace(/\s*```$/, "");
        }

        // Apply same cleanup
        retryText = retryText
          .replace(/[\u201C\u201D]/g, '"')
          .replace(/[\u2018\u2019]/g, "'")
          .replace(/\n\s*\n/g, "\n")
          .replace(/,(\s*[}\]])/g, "$1")
          .trim();

        const retryJsonStart = retryText.indexOf("{");
        const retryJsonEnd = retryText.lastIndexOf("}");

        if (
          retryJsonStart !== -1 &&
          retryJsonEnd !== -1 &&
          retryJsonEnd > retryJsonStart
        ) {
          retryText = retryText.substring(retryJsonStart, retryJsonEnd + 1);
        }

        const retryQuizData: QuizData = JSON.parse(retryText);

        // Validate retry data
        if (
          !retryQuizData.questions ||
          !Array.isArray(retryQuizData.questions)
        ) {
          throw new Error("Invalid retry response structure");
        }

        return retryQuizData;
      } catch (retryError) {
        console.error("Retry also failed:", retryError);
        throw new Error(
          "Failed to parse quiz questions from AI response after retry"
        );
      }
    }
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
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    const prompt = `Given this quiz question and the user's answer, provide a helpful hint (not the full answer):

Question: ${question}
User's answer: ${userAnswer}

Please provide a brief, encouraging hint that guides the user toward the correct answer without giving it away completely. Keep it under 50 words.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error("Error generating hint:", error);
    return "Think about the key concepts related to this topic and consider each option carefully.";
  }
}
