
import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const MODEL = "gemini-3.5-flash-lite";

const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

async function callGemini(prompt: string) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing from environment variables.");
  }

  const ai = new GoogleGenAI({ apiKey });

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: MODEL,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.4,
        },
      });

      const output = response.text;

      if (!output) {
        throw new Error("Gemini returned an empty response.");
      }

      return JSON.parse(output);
    } catch (error: any) {
      const status =
        error?.status ??
        error?.error?.code ??
        error?.code;

      console.error(`Gemini attempt ${attempt} failed:`, {
        status,
        message: error?.message,
      });

      const retryable =
        status === 429 ||
        status === 503 ||
        status === 500 ||
        status === 504;

      if (retryable && attempt < 3) {
        await sleep(2000 * attempt);
        continue;
      }

      throw error;
    }
  }

  throw new Error("Gemini request failed after retries.");
}

function isValidCareerPlan(data: any) {
  return (
    data &&
    typeof data.careerSummary === "string" &&
    typeof data.recommendedRole === "string" &&
    typeof data.readinessLevel === "string" &&
    Array.isArray(data.topPriorities) &&
    data.topPriorities.length === 3 &&
    Array.isArray(data.learningPlan) &&
    data.learningPlan.length === 4 &&
    Array.isArray(data.interviewAdvice) &&
    data.interviewAdvice.length >= 2 &&
    data.interviewAdvice.length <= 3 &&
    Array.isArray(data.projectSuggestions) &&
    data.projectSuggestions.length === 2 &&
    typeof data.nextAction === "string"
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      resumeAnalysis,
      skillProgress,
      interviewHistory,
    } = body;

    if (!resumeAnalysis || typeof resumeAnalysis !== "object") {
      return NextResponse.json(
        { error: "Resume analysis data is required." },
        { status: 400 }
      );
    }

    if (
      !Array.isArray(skillProgress) ||
      !Array.isArray(interviewHistory)
    ) {
      return NextResponse.json(
        {
          error:
            "Skill progress and interview history must be arrays.",
        },
        { status: 400 }
      );
    }

    const prompt = `
You are a practical AI career mentor for computer science students.

Analyze the following REAL candidate data and create a personalized career improvement plan.

RESUME ANALYSIS:
${JSON.stringify(resumeAnalysis)}

SKILL PROGRESS:
${JSON.stringify(skillProgress)}

MOCK INTERVIEW HISTORY:
${JSON.stringify(interviewHistory)}

RULES:
- Base recommendations only on supplied data.
- Do not invent skills, projects, experience, certificates, or achievements.
- Prioritize important missing resume skills.
- Do not recommend completed skills unless they need revision.
- Consider interview feedback and low-scoring answers.
- If interview history is empty, do not pretend an interview happened.
- Recommend realistic tasks for a computer science engineering student.
- Avoid generic advice.
- Explain why each recommendation matters.
- Do not guarantee employment.
- Select recommendedRole from the supplied resume role analysis whenever possible.
- If there is insufficient evidence, use "Not enough data" for recommendedRole.

Return a JSON object with exactly this structure:

{
  "careerSummary": "Short assessment.",
  "recommendedRole": "Suitable role or Not enough data.",
  "readinessLevel": "Beginner",
  "topPriorities": [
    {
      "priority": 1,
      "title": "Specific skill",
      "reason": "Why it matters",
      "action": "Exact task",
      "estimatedTime": "3 days"
    }
  ],
  "learningPlan": [
    {
      "week": 1,
      "focus": "Learning focus",
      "topics": ["Topic 1", "Topic 2"],
      "task": "Practice task",
      "project": "Small project",
      "expectedOutcome": "Measurable outcome"
    }
  ],
  "interviewAdvice": [
    "Specific advice"
  ],
  "projectSuggestions": [
    {
      "title": "Project name",
      "description": "What to build",
      "skillsUsed": ["Skill 1", "Skill 2"],
      "difficulty": "Beginner"
    }
  ],
  "nextAction": "One clear action for today."
}

OUTPUT REQUIREMENTS:
- Exactly 3 topPriorities.
- Exactly 4 learningPlan items, one for each week.
- 2 to 3 interviewAdvice items.
- Exactly 2 projectSuggestions.
- readinessLevel must be Beginner, Developing, Intermediate, or Job Ready.
- Project difficulty must be Beginner, Intermediate, or Advanced.
- Return valid JSON only. No markdown.
`;

    const recommendations = await callGemini(prompt);

    if (!isValidCareerPlan(recommendations)) {
      console.error("Invalid career plan structure:", recommendations);

      return NextResponse.json(
        {
          error:
            "The AI returned an incomplete career plan. Please try again.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json({ recommendations });
  } catch (error: any) {
    console.error("Career recommendations error:", error);

    const status =
      error?.status ??
      error?.error?.code ??
      error?.code;

    if (status === 429) {
      return NextResponse.json(
        {
          error: "Gemini API quota or rate limit reached. Try again later.",
        },
        { status: 429 }
      );
    }

    if (status === 503 || status === 504) {
      return NextResponse.json(
        {
          error: "Gemini is temporarily unavailable. Please try again shortly.",
        },
        { status: 503 }
      );
    }

    if (status === 400 || status === 404) {
      return NextResponse.json(
        {
          error:
            "Gemini rejected the request. Check whether the configured model is available.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json(
      {
        error:
          "Career recommendations failed. Check the VS Code terminal for details.",
      },
      { status: 500 }
    );
  }
}
