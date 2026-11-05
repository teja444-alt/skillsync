
import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const MODEL = "gemini-2.5-flash";

const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

function getErrorStatus(error: any): number | undefined {
  return (
    error?.status ??
    error?.error?.code ??
    error?.code
  );
}

const prompt = `
You are a professional resume analyzer and career readiness evaluator.

Read the attached resume carefully.

Analyze the candidate for these job roles:
1. Software Engineer
2. Frontend Developer
3. Backend Developer
4. Full-Stack Developer
5. AI/ML Engineer
6. Data Analyst
7. Python Developer
8. Java Developer
9. Cloud/DevOps Engineer

Do not invent information.
Evaluate skills based only on evidence in the resume.
Do not claim the candidate is job-ready if essential skills are missing.

Return ONLY valid JSON in this exact structure:

{
  "candidateName": "Name or Not provided",
  "summary": "Short candidate profile summary",
  "education": ["education details"],
  "technicalSkills": ["technical skills"],
  "softSkills": ["soft skills"],
  "experience": ["experience details"],
  "projects": ["project details"],
  "roleAnalysis": [
    {
      "role": "Software Engineer",
      "score": 0,
      "readiness": "Beginner",
      "matchingSkills": ["skills present in resume"],
      "missingSkills": ["skills missing from resume"],
      "recommendations": ["skills or topics to learn"],
      "improvements": ["specific resume improvements"]
    }
  ],
  "learningRoadmap": [
    {
      "role": "Software Engineer",
      "estimatedDuration": "4 weeks",
      "steps": [
        {
          "week": 1,
          "focus": "Topic to focus on",
          "skillsToLearn": ["skill 1", "skill 2"],
          "practiceTask": "Practical task to complete",
          "project": "Small project to build",
          "expectedOutcome": "What the candidate should achieve"
        }
      ]
    }
  ]
}

ROLE ANALYSIS REQUIREMENTS:

For every listed role:
- Give a score from 0 to 100 based on relevant skills, projects, experience, and education.
- Use readiness values: "Beginner", "Developing", "Intermediate", or "Job Ready".
- Identify relevant skills already shown in the resume.
- Identify important missing skills for that role.
- Give practical recommendations.
- Do not penalize the candidate for missing skills that are not essential to the role.
- Do not inflate scores.
- Include all 9 roles in roleAnalysis.
- If information is missing, use empty arrays.

LEARNING ROADMAP REQUIREMENTS:

- Generate a learningRoadmap for all 9 job roles.
- Each role must have a separate 4-week roadmap.
- Prioritize the missing skills identified in that role's roleAnalysis.
- Week 1 should focus on fundamentals or the most important skill gap.
- Week 2 should focus on intermediate skills and practical exercises.
- Week 3 should focus on building a role-specific project.
- Week 4 should focus on improving the project, testing, GitHub documentation, and interview preparation.
- Keep the roadmap realistic for a computer science engineering student.
- Include specific skills, practice tasks, project ideas, and expected outcomes.
- Avoid vague tasks such as "learn coding" or "practice more".
- Do not claim the candidate already knows skills that are missing from the resume.
- Ensure every roadmap role matches one of the 9 roles in roleAnalysis.
- Include all 9 roles in learningRoadmap.
- Each role must have exactly 4 steps, one for each week.
- Keep the output concise enough to fit within the response limit.

Return JSON only. Do not include markdown or explanations.
`;

async function generateAnalysis(
  ai: GoogleGenAI,
  base64PDF: string
) {
  const maxAttempts = 3;
  let lastError: any;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(
        `Gemini request: ${MODEL}, attempt ${attempt}/${maxAttempts}`
      );

      const response = await ai.models.generateContent({
        model: MODEL,
        contents: [
          {
            role: "user",
            parts: [
              {
                inlineData: {
                  mimeType: "application/pdf",
                  data: base64PDF,
                },
              },
              {
                text: prompt,
              },
            ],
          },
        ],
        config: {
  responseMimeType: "application/json",
  temperature: 0.2,
  maxOutputTokens: 32768,
},
      });

     const output = response.text;

if (!output) {
  throw new Error("Gemini returned an empty response.");
}

const finishReason =
  response.candidates?.[0]?.finishReason;

console.log("Gemini finish reason:", finishReason);

if (finishReason === "MAX_TOKENS") {
  throw new Error(
    "Gemini reached its output token limit. The response was incomplete."
  );
}
      const cleaned = output
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();

       try {
  return JSON.parse(cleaned);
} catch (error) {
  console.error(
    "Invalid or incomplete Gemini JSON response.",
    {
      outputLength: cleaned.length,
      finishReason: response.candidates?.[0]?.finishReason,
      ending: cleaned.slice(-300),
    }
  );

  throw new Error(
    "Gemini returned incomplete or invalid JSON."
  );
}
    } catch (error: any) {
      lastError = error;

      const status = getErrorStatus(error);

      console.error(`Gemini attempt ${attempt} failed:`, {
        status,
        message: error?.message,
      });

      // Retry temporary errors only.
      if (
        (status === 429 ||
          status === 500 ||
          status === 502 ||
          status === 503 ||
          status === 504) &&
        attempt < maxAttempts
      ) {
        await sleep(3000 * attempt);
        continue;
      }

      throw error;
    }
  }

  throw lastError ?? new Error("Gemini request failed.");
}

function validateAnalysis(analysis: any) {
  if (!analysis || typeof analysis !== "object") {
    return false;
  }

  if (
    !Array.isArray(analysis.roleAnalysis) ||
    analysis.roleAnalysis.length !== 9
  ) {
    return false;
  }

  if (
    !Array.isArray(analysis.learningRoadmap) ||
    analysis.learningRoadmap.length !== 9
  ) {
    return false;
  }

  const validRoles = [
    "Software Engineer",
    "Frontend Developer",
    "Backend Developer",
    "Full-Stack Developer",
    "AI/ML Engineer",
    "Data Analyst",
    "Python Developer",
    "Java Developer",
    "Cloud/DevOps Engineer",
  ];

  const roleNames = analysis.roleAnalysis.map(
    (item: any) => item.role
  );

  const roadmapNames = analysis.learningRoadmap.map(
    (item: any) => item.role
  );

  if (
    !validRoles.every((role) => roleNames.includes(role)) ||
    !validRoles.every((role) => roadmapNames.includes(role))
  ) {
    return false;
  }

  for (const role of analysis.roleAnalysis) {
    if (
      typeof role.score !== "number" ||
      role.score < 0 ||
      role.score > 100 ||
      !Array.isArray(role.matchingSkills) ||
      !Array.isArray(role.missingSkills) ||
      !Array.isArray(role.recommendations) ||
      !Array.isArray(role.improvements)
    ) {
      return false;
    }
  }

  for (const roadmap of analysis.learningRoadmap) {
    if (
      !Array.isArray(roadmap.steps) ||
      roadmap.steps.length !== 4 ||
      !roadmap.steps.every(
        (step: any, index: number) =>
          step.week === index + 1
      )
    ) {
      return false;
    }
  }

  return true;
}

export async function POST(request: Request) {
  try {
    // Check API key
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Gemini API key is missing." },
        { status: 500 }
      );
    }

    // Get uploaded resume
    const formData = await request.formData();
    const file = formData.get("resume");

    // Validate uploaded file
    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Please upload a PDF resume." },
        { status: 400 }
      );
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Only PDF files are supported." },
        { status: 400 }
      );
    }

    if (file.size === 0) {
      return NextResponse.json(
        { error: "The uploaded PDF is empty." },
        { status: 400 }
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Resume must be smaller than 5 MB." },
        { status: 400 }
      );
    }

    // Convert PDF to Base64
    const buffer = Buffer.from(await file.arrayBuffer());
    const base64PDF = buffer.toString("base64");

    // Initialize Gemini
    const ai = new GoogleGenAI({ apiKey });

    // Generate analysis
    const analysis = await generateAnalysis(ai, base64PDF);

    // Validate returned analysis
    if (!validateAnalysis(analysis)) {
      console.error(
        "Gemini returned an invalid analysis structure:",
        analysis
      );

      return NextResponse.json(
        {
          error:
            "Gemini returned an incomplete analysis. Please try again.",
        },
        { status: 502 }
      );
    }

    console.log("Resume analysis completed successfully.");

    return NextResponse.json({ analysis });
  } catch (error: any) {
    console.error("Resume analysis error:", error);

    const status = getErrorStatus(error);

    if (status === 429) {
      return NextResponse.json(
        {
          error:
            "Gemini API rate limit reached. Please wait before trying again.",
        },
        { status: 429 }
      );
    }

    if (
      status === 500 ||
      status === 502 ||
      status === 503 ||
      status === 504
    ) {
      return NextResponse.json(
        {
          error:
            "Gemini is temporarily unavailable. Please try again later.",
        },
        { status: 503 }
      );
    }

    if (status === 400) {
      return NextResponse.json(
        {
          error:
            "Gemini rejected the request. Check the uploaded PDF and API request.",
        },
        { status: 400 }
      );
    }

    if (status === 404) {
      return NextResponse.json(
        {
          error:
            `Gemini model '${MODEL}' was not found or is unavailable for this API version.`,
        },
        { status: 502 }
      );
    }

    return NextResponse.json(
      {
        error:
          "Resume analysis failed. Check the VS Code terminal for details.",
      },
      { status: 500 }
    );
  }
}
