
import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const MODEL = "gemini-3.5-flash-lite";

function cleanJSON(output: string) {
  return output
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

async function callGemini(prompt: string) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("Gemini API key is missing.");
  }

  const ai = new GoogleGenAI({ apiKey });

  let response;

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      response = await ai.models.generateContent({
        model: MODEL,
        contents: prompt,
      });

      break;
    } catch (error: any) {
      const status = error?.status ?? error?.error?.code;

      console.error(`Gemini attempt ${attempt} failed:`, error);

      if ((status === 503 || status === 429) && attempt < 3) {
        await new Promise((resolve) =>
          setTimeout(resolve, 2000 * attempt)
        );
        continue;
      }

      throw error;
    }
  }

  const output = response?.text;

  if (!output) {
    throw new Error("Gemini returned an empty response.");
  }

  return JSON.parse(cleanJSON(output));
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { action, role, resumeSummary, questions, answers } = body;

    if (!role || typeof role !== "string") {
      return NextResponse.json(
        { error: "Please select an interview role." },
        { status: 400 }
      );
    }

    // Generate interview questions
    if (action === "generate") {
      const prompt = `
You are an experienced technical interviewer.

Create exactly 5 interview questions for a candidate applying for:
${role}

Candidate resume information:
${JSON.stringify(resumeSummary || "No resume information provided.")}

Requirements:
- Generate questions relevant to the selected role.
- Consider the candidate's existing skills and missing skills.
- Include a mix of technical, practical, and conceptual questions.
- Questions should be suitable for a computer science engineering student.
- Do not assume the candidate has experience not mentioned in the resume.
- Start with a moderate difficulty and gradually increase difficulty.
- Each question should be clear and answerable.

Return ONLY valid JSON in this structure:

{
  "questions": [
    {
      "id": 1,
      "question": "Question text",
      "topic": "Topic",
      "difficulty": "Easy"
    }
  ]
}

Difficulty must be Easy, Medium, or Hard.
Return exactly 5 questions.
Return JSON only.
`;

      const result = await callGemini(prompt);

      if (
        !Array.isArray(result.questions) ||
        result.questions.length !== 5
      ) {
        return NextResponse.json(
          { error: "Could not generate valid interview questions. Try again." },
          { status: 502 }
        );
      }

      return NextResponse.json({ questions: result.questions });
    }

    // Evaluate interview answers
    if (action === "evaluate") {
      if (
        !Array.isArray(questions) ||
        !Array.isArray(answers) ||
        questions.length !== answers.length ||
        questions.length === 0
      ) {
        return NextResponse.json(
          { error: "Questions and answers are required." },
          { status: 400 }
        );
      }

      const interviewData = questions.map((question: any, index: number) => ({
        question: question.question,
        topic: question.topic,
        difficulty: question.difficulty,
        answer: answers[index] || "",
      }));

      const prompt = `
You are a strict but fair technical interview evaluator.

Evaluate the following interview for the role of ${role}.

Interview responses:
${JSON.stringify(interviewData)}

Evaluation rules:
- Evaluate only what the candidate actually answered.
- Do not give high marks for vague or incorrect answers.
- Reward technical accuracy, clarity, relevance, and practical understanding.
- An empty answer should receive zero marks.
- Do not invent information about the candidate.
- Give specific feedback that helps the candidate improve.
- Each question has a maximum score of 10.
- Calculate the overall score as a percentage out of 50.

Return ONLY valid JSON in this structure:

{
  "overallScore": 0,
  "performance": "Needs Improvement",
  "summary": "Overall interview feedback",
  "strengths": ["Strength 1", "Strength 2"],
  "improvements": ["Improvement 1", "Improvement 2"],
  "results": [
    {
      "question": "Original question",
      "answer": "Candidate answer",
      "score": 0,
      "feedback": "Specific feedback",
      "idealAnswer": "A concise example of a good answer"
    }
  ]
}

Performance must be one of:
"Needs Improvement", "Average", "Good", or "Excellent".

Return exactly one result for every question.
Scores must be integers between 0 and 10.
Overall score must be an integer between 0 and 100.
Return JSON only.
`;

      const result = await callGemini(prompt);

      if (
        !Array.isArray(result.results) ||
        result.results.length !== questions.length ||
        typeof result.overallScore !== "number"
      ) {
        return NextResponse.json(
          { error: "Could not evaluate your answers. Please try again." },
          { status: 502 }
        );
      }

      return NextResponse.json({ evaluation: result });
    }

    return NextResponse.json(
      { error: "Invalid action. Use generate or evaluate." },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Mock interview API error:", error);

    const status = error?.status ?? error?.error?.code;

    if (status === 503 || status === 429) {
      return NextResponse.json(
        { error: "Gemini is busy. Please wait and try again." },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: "Mock interview failed. Check the VS Code terminal." },
      { status: 500 }
    );
  }
}
