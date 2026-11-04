
import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const MODEL = "gemini-3.5-flash-lite";

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

  const cleaned = output
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  return JSON.parse(cleaned);
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

    if (!Array.isArray(skillProgress) || !Array.isArray(interviewHistory)) {
      return NextResponse.json(
        { error: "Skill progress and interview history must be arrays." },
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

IMPORTANT RULES:
- Base recommendations only on the supplied data.
- Do not invent skills, projects, experience, certificates, or achievements.
- Give priority to important missing skills from the resume.
- Do not recommend skills already marked completed unless they need revision.
- Consider interview feedback and low-scoring answers.
- If interview history is empty, do not pretend an interview has happened.
- Recommend realistic tasks for a computer science engineering student.
- Avoid generic advice such as "learn coding" or "practice more".
- Explain why each recommendation matters.
- Keep the plan actionable and achievable.
- Do not guarantee employment or job placement.

Return ONLY valid JSON in this structure:

{
  "careerSummary": "Short assessment of the candidate's current position.",
  "recommendedRole": "Most suitable role based on the supplied evidence.",
  "readinessLevel": "Beginner",
  "topPriorities": [
    {
      "priority": 1,
      "title": "Specific skill or improvement",
      "reason": "Why this should be prioritized",
      "action": "Exact task the candidate should complete",
      "estimatedTime": "Example: 3 days"
    }
  ],
  "learningPlan": [
    {
      "week": 1,
      "focus": "Main learning focus",
      "topics": ["Topic 1", "Topic 2"],
      "task": "Specific practice task",
      "project": "Small practical project",
      "expectedOutcome": "Measurable outcome"
    }
  ],
  "interviewAdvice": [
    "Specific interview improvement"
  ],
  "projectSuggestions": [
    {
      "title": "Project name",
      "description": "What to build",
      "skillsUsed": ["Skill 1", "Skill 2"],
      "difficulty": "Beginner"
    }
  ],
  "nextAction": "One clear action the candidate should take today."
}

OUTPUT REQUIREMENTS:
- Include exactly 3 topPriorities.
- Include exactly 4 learningPlan items, one for each week.
- Include 2 to 3 interviewAdvice items.
- Include exactly 2 projectSuggestions.
- Use readinessLevel: Beginner, Developing, Intermediate, or Job Ready.
- Use project difficulty: Beginner, Intermediate, or Advanced.
- Select recommendedRole from the supplied resume role analysis whenever possible.
- If there is insufficient evidence to choose a role, say so in careerSummary and use "Not enough data" for recommendedRole.
- Return valid JSON only. No markdown or explanations.
`;

    const recommendations = await callGemini(prompt);

    if (
      !recommendations ||
      !Array.isArray(recommendations.topPriorities) ||
      recommendations.topPriorities.length !== 3 ||
      !Array.isArray(recommendations.learningPlan) ||
      recommendations.learningPlan.length !== 4 ||
      !Array.isArray(recommendations.projectSuggestions) ||
      recommendations.projectSuggestions.length !== 2
    ) {
      return NextResponse.json(
        { error: "Gemini returned an incomplete career plan. Please try again." },
        { status: 502 }
      );
    }

    return NextResponse.json({ recommendations });
  } catch (error: any) {
    console.error("Career recommendations error:", error);

    const status = error?.status ?? error?.error?.code;

    if (status === 503 || status === 429) {
      return NextResponse.json(
        {
          error: "Gemini is temporarily busy. Please try again shortly.",
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        error: "Career recommendations failed. Check the VS Code terminal.",
      },
      { status: 500 }
    );
  }
}
