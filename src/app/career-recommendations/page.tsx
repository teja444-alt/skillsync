
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

import {
  ArrowLeft,
  BrainCircuit,
  Target,
  BookOpen,
  Lightbulb,
  BriefcaseBusiness,
  Clock,
  CheckCircle2,
  LoaderCircle,
  Sparkles,
  Code2,
  Save,
  Check,
  RefreshCw,
  GraduationCap,
  TrendingUp,
} from "lucide-react";

type Recommendation = {
  priority: number;
  title: string;
  reason: string;
  action: string;
  estimatedTime: string;
};

type LearningWeek = {
  week: number;
  focus: string;
  topics: string[];
  task: string;
  project: string;
  expectedOutcome: string;
};

type ProjectSuggestion = {
  title: string;
  description: string;
  skillsUsed: string[];
  difficulty: string;
};

type CareerPlan = {
  careerSummary: string;
  recommendedRole: string;
  readinessLevel: string;
  topPriorities: Recommendation[];
  learningPlan: LearningWeek[];
  interviewAdvice: string[];
  projectSuggestions: ProjectSuggestion[];
  nextAction: string;
};

export default function CareerRecommendationsPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [plan, setPlan] = useState<CareerPlan | null>(null);

  useEffect(() => {
    generateRecommendations();
  }, []);

  async function generateRecommendations() {
    setLoading(true);
    setGenerating(true);
    setError("");
    setPlan(null);
    setSaved(false);

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        router.replace("/login");
        return;
      }

      const { data: resumeData, error: resumeError } =
        await supabase
          .from("resume_analyses")
          .select("analysis, overall_score, target_role, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

      if (resumeError) throw resumeError;

      if (!resumeData?.analysis) {
        throw new Error(
          "Please upload and analyze your resume first."
        );
      }

      const { data: skillsData, error: skillsError } =
        await supabase
          .from("user_skill_progress")
          .select("role, skill, is_completed")
          .eq("user_id", user.id);

      if (skillsError) throw skillsError;

      const { data: interviewData, error: interviewError } =
        await supabase
          .from("mock_interviews")
          .select("role, overall_score, feedback, created_at")
          .eq("user_id", user.id)
          .not("overall_score", "is", null)
          .order("created_at", { ascending: false });

      if (interviewError) throw interviewError;

      const response = await fetch("/api/career-recommendations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resumeAnalysis: {
            analysis: resumeData.analysis,
            overallScore: resumeData.overall_score,
            targetRole: resumeData.target_role,
          },
          skillProgress: skillsData || [],
          interviewHistory: interviewData || [],
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Failed to generate recommendations."
        );
      }

      if (!result.recommendations) {
        throw new Error("No recommendations were returned.");
      }

      setPlan(result.recommendations);
    } catch (err: any) {
      console.error("Career recommendations error:", err);
      setError(
        err.message || "Unable to generate career recommendations."
      );
    } finally {
      setLoading(false);
      setGenerating(false);
    }
  }

  // Save generated plan to Supabase
  async function saveCareerPlan() {
    if (!plan || saving || saved) return;

    setSaving(true);
    setError("");

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        router.replace("/login");
        return;
      }

      const { error: saveError } = await supabase
        .from("career_recommendations")
        .insert({
          user_id: user.id,
          recommendations: plan,
          recommended_role: plan.recommendedRole,
          readiness_level: plan.readinessLevel,
        });

      if (saveError) throw saveError;

      setSaved(true);
    } catch (err: any) {
      console.error("Save career plan error:", err);
      setError(
        err.message || "Unable to save your career plan."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading || generating) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0B1220] px-5 text-slate-100">
        <div className="max-w-md text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border border-blue-500/20 bg-blue-500/10">
            <BrainCircuit
              size={42}
              className="animate-pulse text-blue-400"
            />
          </div>

          <h1 className="mt-6 text-2xl font-bold">
            AI Career Recommendations
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-400">
            Gemini is analyzing your resume, completed skills,
            and mock interview performance.
          </p>

          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-blue-400">
            <LoaderCircle size={18} className="animate-spin" />
            Generating your personalized career plan...
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0B1220] px-4 py-8 text-slate-100 sm:px-8">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <button
          onClick={() => router.push("/dashboard")}
          className="mb-8 flex items-center gap-2 text-sm text-slate-400 transition hover:text-blue-400"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </button>

        <div className="mb-8">
          <div className="mb-3 flex items-center gap-2">
            <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-2">
              <BrainCircuit size={19} className="text-blue-400" />
            </div>

            <p className="text-sm font-semibold uppercase tracking-widest text-blue-400">
              SkillSync AI
            </p>
          </div>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            AI Career Recommendations
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
            Your personalized career improvement plan, powered by Gemini.
            Get actionable guidance based on your skills and performance.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {plan && (
          <>
            {/* Career Assessment */}
            <section className="mt-8 overflow-hidden rounded-2xl border border-blue-500/30 bg-[#111C30] p-6 sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-2.5">
                    <Sparkles className="text-blue-400" size={24} />
                  </div>

                  <div>
                    <h2 className="text-xl font-bold">
                      Your Career Assessment
                    </h2>
                    <p className="mt-1 text-xs text-slate-400">
                      AI-powered career evaluation
                    </p>
                  </div>
                </div>

                <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1.5 text-xs font-semibold text-blue-300">
                  Personalized Plan
                </span>
              </div>

              <p className="mt-6 text-sm leading-7 text-slate-300 sm:text-base">
                {plan.careerSummary}
              </p>

              <div className="mt-7 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-700/70 bg-[#0B1220]/60 p-5">
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Target size={17} className="text-blue-400" />
                    Recommended Role
                  </div>

                  <p className="mt-3 text-lg font-bold text-blue-300">
                    {plan.recommendedRole}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-700/70 bg-[#0B1220]/60 p-5">
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <TrendingUp size={17} className="text-cyan-400" />
                    Current Readiness
                  </div>

                  <p className="mt-3 text-lg font-bold text-cyan-300">
                    {plan.readinessLevel}
                  </p>
                </div>
              </div>
            </section>

            {/* Save Plan */}
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={saveCareerPlan}
                disabled={saving || saved}
                className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <LoaderCircle size={18} className="animate-spin" />
                ) : saved ? (
                  <Check size={18} />
                ) : (
                  <Save size={18} />
                )}

                {saving
                  ? "Saving..."
                  : saved
                  ? "Career Plan Saved"
                  : "Save Career Plan"}
              </button>

              <button
                onClick={() => router.push("/saved-career-plans")}
                className="rounded-xl border border-slate-700 bg-[#111C30] px-6 py-3 font-semibold text-slate-200 transition hover:border-blue-500/50 hover:bg-blue-500/10"
              >
                View Saved Plans
              </button>
            </div>

            {/* Top Priorities */}
            <section className="mt-12">
              <SectionHeading
                icon={<Target size={23} />}
                title="Your Top 3 Priorities"
                description="Focus on these improvements first."
              />

              <div className="mt-5 grid gap-5 md:grid-cols-3">
                {plan.topPriorities.map((item) => (
                  <div
                    key={item.priority}
                    className="rounded-2xl border border-slate-800 bg-[#111C30] p-5 transition duration-300 hover:-translate-y-1 hover:border-blue-500/40"
                  >
                    <div className="flex items-center justify-between">
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10 font-bold text-blue-400">
                        {item.priority}
                      </span>

                      <span className="text-xs font-semibold text-slate-500">
                        PRIORITY
                      </span>
                    </div>

                    <h3 className="mt-5 font-bold text-slate-100">
                      {item.title}
                    </h3>

                    <p className="mt-3 text-sm leading-6 text-slate-400">
                      {item.reason}
                    </p>

                    <div className="mt-5 rounded-xl border border-blue-500/10 bg-[#0B1220] p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-blue-400">
                        Action to take
                      </p>

                      <p className="mt-2 text-sm leading-6 text-slate-300">
                        {item.action}
                      </p>
                    </div>

                    <p className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                      <Clock size={14} className="text-blue-400" />
                      {item.estimatedTime}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Learning Plan */}
            <section className="mt-12">
              <SectionHeading
                icon={<BookOpen size={23} />}
                title="Your 4-Week Learning Plan"
                description="A practical weekly plan based on your skill gaps."
              />

              <div className="mt-6 space-y-5">
                {plan.learningPlan.map((week) => (
                  <div
                    key={week.week}
                    className="rounded-2xl border border-slate-800 bg-[#111C30] p-5 sm:p-6"
                  >
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="rounded-lg border border-blue-500/20 bg-blue-500/10 px-3 py-2 text-sm font-bold text-blue-400">
                        WEEK {week.week}
                      </span>

                      <h3 className="text-lg font-bold text-slate-100">
                        {week.focus}
                      </h3>
                    </div>

                    <div className="mt-6 grid gap-6 md:grid-cols-2">
                      <div>
                        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          <BookOpen size={15} className="text-blue-400" />
                          Topics to learn
                        </p>

                        <ul className="mt-4 space-y-3">
                          {week.topics.map((topic, index) => (
                            <li
                              key={index}
                              className="flex items-start gap-2 text-sm leading-6 text-slate-300"
                            >
                              <CheckCircle2
                                size={17}
                                className="mt-0.5 shrink-0 text-blue-400"
                              />
                              {topic}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          <Target size={15} className="text-cyan-400" />
                          Practice task
                        </p>

                        <p className="mt-3 text-sm leading-6 text-slate-300">
                          {week.task}
                        </p>

                        <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-cyan-400">
                          Expected outcome
                        </p>

                        <p className="mt-2 text-sm leading-6 text-slate-300">
                          {week.expectedOutcome}
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 rounded-xl border border-slate-700/70 bg-[#0B1220]/70 p-4">
                      <p className="flex items-center gap-2 text-sm font-semibold text-blue-300">
                        <Code2 size={17} />
                        Weekly Project
                      </p>

                      <p className="mt-2 text-sm leading-6 text-slate-300">
                        {week.project}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Interview Advice */}
            <section className="mt-12">
              <SectionHeading
                icon={<Lightbulb size={23} />}
                title="Interview Improvement Advice"
                description="Recommendations based on your interview performance."
              />

              <div className="mt-5 rounded-2xl border border-slate-800 bg-[#111C30] p-6">
                <ul className="space-y-5">
                  {plan.interviewAdvice.map((advice, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-3 text-sm leading-6 text-slate-300"
                    >
                      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-500/10">
                        <CheckCircle2
                          size={17}
                          className="text-blue-400"
                        />
                      </div>

                      {advice}
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* Project Suggestions */}
            <section className="mt-12">
              <SectionHeading
                icon={<BriefcaseBusiness size={23} />}
                title="Recommended Projects"
                description="Build these projects to demonstrate your skills."
              />

              <div className="mt-5 grid gap-5 md:grid-cols-2">
                {plan.projectSuggestions.map((project, index) => (
                  <div
                    key={index}
                    className="rounded-2xl border border-slate-800 bg-[#111C30] p-6 transition duration-300 hover:border-blue-500/40"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-2">
                          <Code2 size={20} className="text-blue-400" />
                        </div>

                        <h3 className="pt-1 text-lg font-bold text-slate-100">
                          {project.title}
                        </h3>
                      </div>

                      <span className="shrink-0 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-300">
                        {project.difficulty}
                      </span>
                    </div>

                    <p className="mt-4 text-sm leading-6 text-slate-400">
                      {project.description}
                    </p>

                    <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Skills involved
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {project.skillsUsed.map((skill, index) => (
                        <span
                          key={index}
                          className="rounded-lg border border-blue-500/20 bg-blue-500/10 px-3 py-1.5 text-xs text-blue-300"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Next Action */}
            <section className="mt-12 rounded-2xl border border-blue-500/30 bg-[#111C30] p-6 sm:p-7">
              <div className="flex items-center gap-3">
                <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-2.5">
                  <GraduationCap
                    className="text-blue-400"
                    size={24}
                  />
                </div>

                <div>
                  <h2 className="text-lg font-bold">
                    Your Next Action
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Your recommended next step
                  </p>
                </div>
              </div>

              <p className="mt-5 text-sm leading-7 text-slate-300">
                {plan.nextAction}
              </p>
            </section>

            {/* Regenerate */}
            <button
              onClick={generateRecommendations}
              className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 bg-[#111C30] px-5 py-3 font-semibold text-slate-300 transition hover:border-blue-500/50 hover:bg-blue-500/10 hover:text-blue-300"
            >
              <RefreshCw size={18} />
              Generate Updated Recommendations
            </button>
          </>
        )}
      </div>
    </main>
  );
}

function SectionHeading({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-3">
        <span className="text-blue-400">{icon}</span>

        <h2 className="text-xl font-bold text-slate-100">
          {title}
        </h2>
      </div>

      <p className="mt-2 text-sm text-slate-400">
        {description}
      </p>
    </div>
  );
}
