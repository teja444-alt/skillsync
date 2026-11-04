
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
      <main className="flex min-h-screen items-center justify-center bg-[#09090b] px-5 text-white">
        <div className="max-w-md text-center">
          <BrainCircuit
            size={42}
            className="mx-auto animate-pulse text-violet-400"
          />

          <h1 className="mt-6 text-2xl font-bold">
            AI Career Recommendations
          </h1>

          <p className="mt-3 text-sm leading-6 text-zinc-400">
            Gemini is analyzing your resume, completed skills,
            and mock interview performance.
          </p>

          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-violet-400">
            <LoaderCircle size={18} className="animate-spin" />
            Generating your personalized career plan...
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#09090b] px-4 py-8 text-white sm:px-8">
      <div className="mx-auto max-w-6xl">

        <button
          onClick={() => router.push("/dashboard")}
          className="mb-8 flex items-center gap-2 text-sm text-zinc-400 hover:text-white"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </button>

        <p className="text-sm font-semibold uppercase tracking-widest text-violet-400">
          SKILLSYNC AI
        </p>

        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
          AI Career Recommendations
        </h1>

        <p className="mt-3 text-zinc-400">
          Your personalized career improvement plan, powered by Gemini.
        </p>

        {error && (
          <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {plan && (
          <>
            {/* Career Assessment */}
            <section className="mt-8 rounded-2xl border border-violet-500/30 bg-violet-950/20 p-6 sm:p-8">
              <div className="flex items-center gap-3">
                <Sparkles className="text-violet-400" size={25} />
                <h2 className="text-xl font-bold">
                  Your Career Assessment
                </h2>
              </div>

              <p className="mt-5 leading-7 text-zinc-300">
                {plan.careerSummary}
              </p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-zinc-700 p-4">
                  <p className="text-xs uppercase text-zinc-400">
                    Recommended Role
                  </p>
                  <p className="mt-2 text-lg font-bold text-violet-300">
                    {plan.recommendedRole}
                  </p>
                </div>

                <div className="rounded-xl border border-zinc-700 p-4">
                  <p className="text-xs uppercase text-zinc-400">
                    Current Readiness
                  </p>
                  <p className="mt-2 text-lg font-bold text-cyan-300">
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
                className="flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-6 py-3 font-semibold hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
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
                className="rounded-xl border border-zinc-700 px-6 py-3 font-semibold hover:bg-zinc-900"
              >
                View Saved Plans
              </button>
            </div>

            {/* Top Priorities */}
            <section className="mt-10">
              <SectionHeading
                icon={<Target size={23} />}
                title="Your Top 3 Priorities"
                description="Focus on these improvements first."
              />

              <div className="mt-5 grid gap-5 md:grid-cols-3">
                {plan.topPriorities.map((item) => (
                  <div
                    key={item.priority}
                    className="rounded-2xl border border-zinc-800 bg-[#111114] p-5"
                  >
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/10 font-bold text-violet-400">
                      {item.priority}
                    </span>

                    <h3 className="mt-4 font-bold">
                      {item.title}
                    </h3>

                    <p className="mt-3 text-sm leading-6 text-zinc-400">
                      {item.reason}
                    </p>

                    <div className="mt-4 rounded-lg bg-zinc-900 p-3">
                      <p className="text-xs font-semibold uppercase text-violet-400">
                        Action to take
                      </p>
                      <p className="mt-2 text-sm leading-6 text-zinc-300">
                        {item.action}
                      </p>
                    </div>

                    <p className="mt-4 flex items-center gap-2 text-xs text-zinc-500">
                      <Clock size={14} />
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
                    className="rounded-2xl border border-zinc-800 bg-[#111114] p-6"
                  >
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="rounded-lg bg-violet-500/10 px-3 py-2 text-sm font-bold text-violet-400">
                        WEEK {week.week}
                      </span>
                      <h3 className="text-lg font-bold">
                        {week.focus}
                      </h3>
                    </div>

                    <div className="mt-5 grid gap-5 md:grid-cols-2">
                      <div>
                        <p className="text-xs font-semibold uppercase text-zinc-500">
                          Topics to learn
                        </p>

                        <ul className="mt-3 space-y-2">
                          {week.topics.map((topic, index) => (
                            <li
                              key={index}
                              className="flex items-start gap-2 text-sm text-zinc-300"
                            >
                              <CheckCircle2
                                size={16}
                                className="mt-0.5 shrink-0 text-green-400"
                              />
                              {topic}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <p className="text-xs font-semibold uppercase text-zinc-500">
                          Practice task
                        </p>
                        <p className="mt-3 text-sm leading-6 text-zinc-300">
                          {week.task}
                        </p>

                        <p className="mt-5 text-xs font-semibold uppercase text-violet-400">
                          Expected outcome
                        </p>
                        <p className="mt-2 text-sm leading-6 text-zinc-300">
                          {week.expectedOutcome}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
                      <p className="flex items-center gap-2 text-sm font-semibold text-cyan-300">
                        <Code2 size={17} />
                        Weekly Project
                      </p>
                      <p className="mt-2 text-sm leading-6 text-zinc-300">
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

              <div className="mt-5 rounded-2xl border border-zinc-800 bg-[#111114] p-6">
                <ul className="space-y-4">
                  {plan.interviewAdvice.map((advice, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-3 text-sm leading-6 text-zinc-300"
                    >
                      <CheckCircle2
                        size={18}
                        className="mt-0.5 shrink-0 text-green-400"
                      />
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
                    className="rounded-2xl border border-zinc-800 bg-[#111114] p-6"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-lg font-bold">
                        {project.title}
                      </h3>

                      <span className="shrink-0 rounded-full bg-cyan-500/10 px-3 py-1 text-xs text-cyan-300">
                        {project.difficulty}
                      </span>
                    </div>

                    <p className="mt-3 text-sm leading-6 text-zinc-400">
                      {project.description}
                    </p>

                    <p className="mt-5 text-xs font-semibold uppercase text-zinc-500">
                      Skills involved
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {project.skillsUsed.map((skill, index) => (
                        <span
                          key={index}
                          className="rounded-lg bg-violet-500/10 px-3 py-1.5 text-xs text-violet-300"
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
            <section className="mt-12 rounded-2xl border border-green-500/30 bg-green-500/5 p-6">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="text-green-400" size={25} />
                <h2 className="text-lg font-bold">
                  Your Next Action
                </h2>
              </div>

              <p className="mt-4 leading-7 text-zinc-300">
                {plan.nextAction}
              </p>
            </section>

            <button
              onClick={generateRecommendations}
              className="mt-8 w-full rounded-xl border border-zinc-700 px-5 py-3 font-semibold text-zinc-300 hover:bg-zinc-900"
            >
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
        <span className="text-violet-400">{icon}</span>
        <h2 className="text-xl font-bold">{title}</h2>
      </div>

      <p className="mt-2 text-sm text-zinc-400">
        {description}
      </p>
    </div>
  );
}
