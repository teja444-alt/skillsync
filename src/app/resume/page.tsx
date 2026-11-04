
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BrainCircuit,
  Upload,
  FileText,
  LoaderCircle,
  CheckCircle2,
  Lightbulb,
  Target,
  TrendingUp,
  BookOpen,
  CalendarDays,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

type RoleAnalysis = {
  role: string;
  score: number;
  readiness: string;
  matchingSkills: string[];
  missingSkills: string[];
  recommendations: string[];
  improvements: string[];
};

type RoadmapStep = {
  week: number;
  focus: string;
  skillsToLearn: string[];
  practiceTask: string;
  project: string;
  expectedOutcome: string;
};

type RoleRoadmap = {
  role: string;
  estimatedDuration: string;
  steps: RoadmapStep[];
};

type Analysis = {
  candidateName: string;
  education: string[];
  technicalSkills: string[];
  softSkills: string[];
  experience: string[];
  projects: string[];
  summary: string;
  roleAnalysis: RoleAnalysis[];
  learningRoadmap: RoleRoadmap[];
};

export default function ResumePage() {
  const [file, setFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleAnalyze() {
    if (!file) {
      setError("Please select a PDF resume first.");
      return;
    }

    if (file.type !== "application/pdf") {
      setError("Please upload a PDF file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("PDF file must be smaller than 5 MB.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");
    setAnalysis(null);

    try {
      // Send resume to Gemini API
      const formData = new FormData();
      formData.append("resume", file);

      const response = await fetch("/api/analyze-resume", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Resume analysis failed."
        );
      }

      const analysisData = result.analysis as Analysis;

      if (
        !analysisData ||
        !Array.isArray(analysisData.roleAnalysis)
      ) {
        throw new Error("Invalid analysis response from AI.");
      }

      // Display analysis
      setAnalysis(analysisData);

      // Get authenticated user
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        setError(
          "Analysis completed, but please log in to save your results."
        );
        return;
      }

      // Validate scores
      const validRoles = analysisData.roleAnalysis.filter(
        (role) =>
          typeof role.score === "number" &&
          Number.isFinite(role.score)
      );

      if (validRoles.length === 0) {
        setError(
          "Analysis completed, but no valid readiness scores were returned."
        );
        return;
      }

      // Calculate average readiness
      const overallScore = Math.round(
        validRoles.reduce(
          (total, role) => total + role.score,
          0
        ) / validRoles.length
      );

      // Find highest-scoring role
      const bestRole = [...validRoles].sort(
        (a, b) => b.score - a.score
      )[0];

      // Save analysis in Supabase
      const { error: saveError } = await supabase
        .from("resume_analyses")
        .insert({
          user_id: user.id,
          analysis: analysisData,
          overall_score: overallScore,
          target_role: bestRole.role,
        });

      if (saveError) {
        console.error("Supabase save error:", saveError);
        setError(
          "Analysis completed, but saving failed: " +
            saveError.message
        );
        return;
      }

      setSuccess(
        `Analysis saved successfully! Overall readiness: ${overallScore}%. Best matching role: ${bestRole.role}.`
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  const validScores =
    analysis?.roleAnalysis?.filter(
      (role) =>
        typeof role.score === "number" &&
        Number.isFinite(role.score)
    ) || [];

  const averageScore =
    validScores.length > 0
      ? Math.round(
          validScores.reduce(
            (total, role) => total + role.score,
            0
          ) / validScores.length
        )
      : 0;

  return (
    <main className="min-h-screen bg-[#09090b] px-6 py-8 text-white">
      <div className="mx-auto max-w-5xl">

        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white"
        >
          <ArrowLeft size={16} />
          Back to dashboard
        </Link>

        <div className="mt-8 flex items-center gap-3">
          <div className="rounded-xl bg-violet-600 p-3">
            <BrainCircuit size={24} />
          </div>

          <div>
            <p className="text-sm text-violet-400">
              SKILLSYNC AI
            </p>
            <h1 className="text-3xl font-bold">
              Resume Analysis
            </h1>
          </div>
        </div>

        <p className="mt-4 max-w-2xl text-zinc-400">
          Upload your resume to extract your skills, education,
          experience, projects, and analyze your readiness
          across job roles.
        </p>

        {/* Resume Upload */}
        <section className="mt-8 rounded-2xl border border-zinc-800 bg-[#111114] p-6">
          <label
            htmlFor="resume"
            className="flex cursor-pointer flex-col items-center rounded-xl border-2 border-dashed border-zinc-700 px-6 py-12 text-center hover:border-violet-500"
          >
            <Upload
              size={36}
              className="text-violet-400"
            />

            <span className="mt-4 text-lg font-semibold">
              Upload your resume
            </span>

            <span className="mt-2 text-sm text-zinc-400">
              PDF format only · Maximum 5 MB
            </span>

            <input
              id="resume"
              type="file"
              accept=".pdf,application/pdf"
              className="sr-only"
              onChange={(event) => {
                setFile(event.target.files?.[0] ?? null);
                setAnalysis(null);
                setError("");
                setSuccess("");
              }}
            />
          </label>

          {file && (
            <div className="mt-4 flex items-center gap-3 rounded-lg bg-zinc-900 p-4">
              <FileText className="text-violet-400" />

              <span className="flex-1 truncate text-sm">
                {file.name}
              </span>

              <CheckCircle2
                size={18}
                className="text-green-400"
              />
            </div>
          )}

          {error && (
            <p className="mt-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-400">
              {error}
            </p>
          )}

          {success && (
            <p className="mt-4 rounded-lg bg-green-500/10 p-3 text-sm text-green-400">
              {success}
            </p>
          )}

          <button
            onClick={handleAnalyze}
            disabled={!file || loading}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 font-semibold hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <LoaderCircle
                  size={18}
                  className="animate-spin"
                />
                Analyzing resume...
              </>
            ) : (
              <>
                <BrainCircuit size={18} />
                Analyze Resume
              </>
            )}
          </button>
        </section>

        {/* Analysis Results */}
        {analysis && (
          <div className="mt-8 space-y-6">

            {/* Overall Score */}
            <section className="rounded-2xl border border-violet-500/30 bg-[#111114] p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-violet-400">
                    OVERALL JOB READINESS
                  </p>

                  <h2 className="mt-2 text-4xl font-bold">
                    {averageScore}%
                  </h2>

                  <p className="mt-2 text-sm text-zinc-400">
                    Average readiness across{" "}
                    {validScores.length} analyzed job roles.
                  </p>
                </div>

                <div className="rounded-full border-4 border-violet-500 p-5">
                  <Target
                    size={36}
                    className="text-violet-400"
                  />
                </div>
              </div>

              <div className="mt-5 h-3 overflow-hidden rounded-full bg-zinc-800">
                <div
                  className="h-full rounded-full bg-violet-500"
                  style={{
                    width: `${Math.min(100, Math.max(0, averageScore))}%`,
                  }}
                />
              </div>
            </section>

            {/* Candidate Summary */}
            <section className="rounded-2xl border border-zinc-800 bg-[#111114] p-6">
              <p className="text-sm text-violet-400">
                ANALYSIS COMPLETE
              </p>

              <h2 className="mt-2 text-2xl font-bold">
                {analysis.candidateName}
              </h2>

              <p className="mt-3 leading-7 text-zinc-300">
                {analysis.summary}
              </p>
            </section>

            {/* Job Role Readiness */}
            <section className="rounded-2xl border border-zinc-800 bg-[#111114] p-6">
              <div className="flex items-center gap-3">
                <Target
                  className="text-violet-400"
                  size={22}
                />

                <div>
                  <h2 className="text-xl font-bold">
                    Job Role Readiness
                  </h2>

                  <p className="mt-1 text-sm text-zinc-400">
                    AI-estimated resume match across different job roles.
                  </p>
                </div>
              </div>

              {analysis.roleAnalysis?.length ? (
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  {analysis.roleAnalysis.map((role) => (
                    <div
                      key={role.role}
                      className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-semibold">
                          {role.role}
                        </h3>

                        <span className="rounded-lg bg-violet-500/15 px-3 py-1 text-sm font-bold text-violet-300">
                          {role.score}/100
                        </span>
                      </div>

                      <div className="mt-4 h-2 overflow-hidden rounded-full bg-zinc-800">
                        <div
                          className="h-full rounded-full bg-violet-500"
                          style={{
                            width: `${Math.min(
                              100,
                              Math.max(0, role.score)
                            )}%`,
                          }}
                        />
                      </div>

                      <p className="mt-3 text-sm text-zinc-400">
                        Readiness:{" "}
                        <span className="font-medium text-white">
                          {role.readiness}
                        </span>
                      </p>

                      <div className="mt-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-green-400">
                          Matching Skills
                        </p>

                        <SkillList
                          items={role.matchingSkills}
                          color="green"
                        />
                      </div>

                      <div className="mt-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-red-400">
                          Missing Skills
                        </p>

                        <SkillList
                          items={role.missingSkills}
                          color="red"
                        />
                      </div>

                      <div className="mt-4">
                        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-violet-300">
                          <Lightbulb size={14} />
                          Recommended to Learn
                        </p>

                        <SkillList
                          items={role.recommendations}
                          color="violet"
                        />
                      </div>

                      <div className="mt-4">
                        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-blue-300">
                          <TrendingUp size={14} />
                          Resume Improvements
                        </p>

                        <SkillList
                          items={role.improvements}
                          color="blue"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-sm text-zinc-500">
                  Role analysis is not available.
                </p>
              )}
            </section>

            {/* Learning Roadmap */}
            <section className="rounded-2xl border border-zinc-800 bg-[#111114] p-6">
              <div className="flex items-center gap-3">
                <BookOpen
                  className="text-violet-400"
                  size={22}
                />

                <div>
                  <h2 className="text-xl font-bold">
                    Personalized Learning Roadmap
                  </h2>

                  <p className="mt-1 text-sm text-zinc-400">
                    A practical 4-week plan based on your missing skills.
                  </p>
                </div>
              </div>

              {analysis.learningRoadmap?.length ? (
                <div className="mt-6 space-y-6">
                  {analysis.learningRoadmap.map((roadmap) => (
                    <div
                      key={roadmap.role}
                      className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-5"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <h3 className="text-lg font-semibold">
                          {roadmap.role}
                        </h3>

                        <span className="rounded-full bg-violet-500/15 px-3 py-1 text-sm font-medium text-violet-300">
                          {roadmap.estimatedDuration}
                        </span>
                      </div>

                      <div className="mt-5 grid gap-4 md:grid-cols-2">
                        {roadmap.steps?.map((step) => (
                          <div
                            key={`${roadmap.role}-week-${step.week}`}
                            className="rounded-lg border border-zinc-800 bg-[#09090b] p-4"
                          >
                            <div className="flex items-center gap-2">
                              <CalendarDays
                                size={16}
                                className="text-violet-400"
                              />

                              <h4 className="font-semibold text-violet-300">
                                Week {step.week}
                              </h4>
                            </div>

                            <p className="mt-2 font-medium">
                              {step.focus}
                            </p>

                            <div className="mt-4">
                              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                                Skills to learn
                              </p>

                              <SkillList
                                items={step.skillsToLearn}
                                color="violet"
                              />
                            </div>

                            <div className="mt-4">
                              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                                Practice task
                              </p>

                              <p className="mt-2 text-sm leading-6 text-zinc-300">
                                {step.practiceTask}
                              </p>
                            </div>

                            <div className="mt-4">
                              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                                Project
                              </p>

                              <p className="mt-2 text-sm leading-6 text-zinc-300">
                                {step.project}
                              </p>
                            </div>

                            <div className="mt-4 rounded-lg bg-green-500/10 p-3">
                              <p className="text-xs font-semibold uppercase tracking-wide text-green-400">
                                Expected outcome
                              </p>

                              <p className="mt-2 text-sm leading-6 text-green-200">
                                {step.expectedOutcome}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-sm text-yellow-300">
                  Learning roadmap data is missing from the API response.
                </p>
              )}
            </section>

            {/* Extracted Resume Sections */}
            <ResultSection
              title="Technical Skills"
              items={analysis.technicalSkills}
            />

            <ResultSection
              title="Soft Skills"
              items={analysis.softSkills}
            />

            <ResultSection
              title="Education"
              items={analysis.education}
            />

            <ResultSection
              title="Experience"
              items={analysis.experience}
            />

            <ResultSection
              title="Projects"
              items={analysis.projects}
            />

          </div>
        )}
      </div>
    </main>
  );
}

function SkillList({
  items,
  color,
}: {
  items: string[];
  color: "green" | "red" | "violet" | "blue";
}) {
  const colors = {
    green: "border-green-500/20 bg-green-500/10 text-green-200",
    red: "border-red-500/20 bg-red-500/10 text-red-200",
    violet: "border-violet-500/20 bg-violet-500/10 text-violet-200",
    blue: "border-blue-500/20 bg-blue-500/10 text-blue-200",
  };

  if (!items?.length) {
    return (
      <p className="mt-2 text-sm text-zinc-500">
        None listed.
      </p>
    );
  }

  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {items.map((item, index) => (
        <span
          key={`${item}-${index}`}
          className={`rounded-lg border px-3 py-2 text-sm ${colors[color]}`}
        >
          {item}
        </span>
      ))}
    </div>
  );
}

function ResultSection({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  return (
    <section className="rounded-2xl border border-zinc-800 bg-[#111114] p-6">
      <h2 className="text-lg font-semibold">{title}</h2>

      {items?.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {items.map((item, index) => (
            <span
              key={`${item}-${index}`}
              className="rounded-lg border border-violet-500/20 bg-violet-500/10 px-3 py-2 text-sm text-violet-200"
            >
              {item}
            </span>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-sm text-zinc-500">
          No information found.
        </p>
      )}
    </section>
  );
}
