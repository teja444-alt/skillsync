import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function POST(request: Request) {
  try {
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

    // Validate file
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

    // Resume analysis prompt
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

    // Call Gemini with retry handling for temporary service errors
    let response;

    const maxAttempts = 3;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        response = await ai.models.generateContent({
          model: "gemini-3.5-flash-lite",
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
        });

        // Gemini request succeeded
        break;
      } catch (error: any) {
        const status = error?.status ?? error?.error?.code;

        console.error(
          `Gemini API attempt ${attempt} failed:`,
          error
        );

        // Retry only temporary overload or rate-limit errors
        if (
          (status === 503 || status === 429) &&
          attempt < maxAttempts
        ) {
          // Wait 2 seconds, then 4 seconds before retrying
          await new Promise((resolve) =>
            setTimeout(resolve, 2000 * attempt)
          );

          continue;
        }

        // No more retries
        if (status === 503 || status === 429) {
          return NextResponse.json(
            {
              error:
                "Gemini is temporarily busy. Please wait a minute and try again.",
            },
            { status: 503 }
          );
        }

        return NextResponse.json(
          {
            error:
              "Gemini API request failed. Check the VS Code terminal.",
          },
          { status: 500 }
        );
      }
    }

    // Check Gemini response
    const output = response?.text;

    if (!output) {
      return NextResponse.json(
        { error: "Gemini returned an empty response." },
        { status: 502 }
      );
    }

    // Clean JSON response
    const cleaned = output
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    // Parse response
    let analysis;

    try {
      analysis = JSON.parse(cleaned);
    } catch (error) {
      console.error("Gemini returned invalid JSON:", output);

      return NextResponse.json(
        {
          error:
            "Gemini returned an invalid analysis. Please try uploading your resume again.",
        },
        { status: 502 }
      );
    }

    // Return analysis to frontend
    return NextResponse.json({ analysis });
  } catch (error) {
    console.error("Resume analysis error:", error);

    return NextResponse.json(
      {
        error:
          "Resume analysis failed. Check the VS Code terminal.",
      },
      { status: 500 }
    );
  }
}