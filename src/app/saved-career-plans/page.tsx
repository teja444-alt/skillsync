
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

import {
  ArrowLeft,
  BrainCircuit,
  CalendarDays,
  Trash2,
  Eye,
  LoaderCircle,
  Sparkles,
  Target,
  BookOpen,
  BriefcaseBusiness,
  X,
  CheckCircle2,
  Clock,
  GraduationCap,
  RefreshCw,
} from "lucide-react";

type CareerPlan = {
  careerSummary: string;
  recommendedRole: string;
  readinessLevel: string;
  topPriorities: {
    priority: number;
    title: string;
    reason: string;
    action: string;
    estimatedTime: string;
  }[];
  learningPlan: {
    week: number;
    focus: string;
    topics: string[];
    task: string;
    project: string;
    expectedOutcome: string;
  }[];
  interviewAdvice: string[];
  projectSuggestions: {
    title: string;
    description: string;
    skillsUsed: string[];
    difficulty: string;
  }[];
  nextAction: string;
};

type SavedPlan = {
  id: string;
  recommendations: CareerPlan;
  recommended_role: string | null;
  readiness_level: string | null;
  created_at: string;
};

export default function SavedCareerPlansPage() {
  const router = useRouter();

  const [plans, setPlans] = useState<SavedPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPlan, setSelectedPlan] =
    useState<SavedPlan | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchSavedPlans();
  }, []);

  async function fetchSavedPlans() {
    setLoading(true);
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

      const { data, error: fetchError } = await supabase
        .from("career_recommendations")
        .select(
          "id, recommendations, recommended_role, readiness_level, created_at"
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      setPlans((data || []) as SavedPlan[]);
    } catch (err: any) {
      console.error("Fetch saved plans error:", err);
      setError(err.message || "Unable to load saved career plans.");
    } finally {
      setLoading(false);
    }
  }

  async function deletePlan(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this career plan? This action cannot be undone."
    );

    if (!confirmed) return;

    setDeletingId(id);
    setError("");

    try {
      const { error: deleteError } = await supabase
        .from("career_recommendations")
        .delete()
        .eq("id", id);

      if (deleteError) throw deleteError;

      setPlans((previous) =>
        previous.filter((plan) => plan.id !== id)
      );

      if (selectedPlan?.id === id) {
        setSelectedPlan(null);
      }
    } catch (err: any) {
      console.error("Delete career plan error:", err);
      setError(err.message || "Unable to delete this career plan.");
    } finally {
      setDeletingId(null);
    }
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0B1220] text-slate-100">
        <div className="flex items-center gap-3 text-slate-400">
          <LoaderCircle
            size={22}
            className="animate-spin text-blue-400"
          />
          Loading saved career plans...
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

        <div className="flex flex-wrap items-center justify-between gap-5">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-2">
                <BrainCircuit size={19} className="text-blue-400" />
              </div>

              <p className="text-sm font-semibold uppercase tracking-widest text-blue-400">
                SkillSync AI
              </p>
            </div>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Saved Career Plans
            </h1>

            <p className="mt-3 text-sm text-slate-400 sm:text-base">
              Review your previous AI-generated career recommendations.
            </p>
          </div>

          <button
            onClick={() => router.push("/career-recommendations")}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
          >
            <Sparkles size={17} />
            Generate New Plan
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            <span>{error}</span>

            <button
              onClick={fetchSavedPlans}
              className="flex items-center gap-2 font-semibold hover:text-white"
            >
              <RefreshCw size={15} />
              Retry
            </button>
          </div>
        )}

        {/* Summary */}
        <div className="mt-8 rounded-2xl border border-slate-800 bg-[#111C30] p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-2.5">
                <BrainCircuit
                  className="text-blue-400"
                  size={24}
                />
              </div>

              <div>
                <h2 className="font-bold">
                  Your Career Plan History
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  {plans.length} saved{" "}
                  {plans.length === 1 ? "plan" : "plans"}
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 px-4 py-2">
              <span className="text-sm font-semibold text-blue-300">
                {plans.length} Total
              </span>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {plans.length === 0 && !error && (
          <div className="mt-8 rounded-2xl border border-slate-800 bg-[#111C30] px-6 py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10">
              <Sparkles
                size={32}
                className="text-blue-400"
              />
            </div>

            <h2 className="mt-5 text-xl font-bold">
              No Saved Career Plans Yet
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-400">
              Generate your personalized career recommendations
              and save them to review your progress later.
            </p>

            <button
              onClick={() => router.push("/career-recommendations")}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-500"
            >
              <Sparkles size={17} />
              Generate Your First Plan
            </button>
          </div>
        )}

        {/* Saved Plans */}
        <div className="mt-8 space-y-5">
          {plans.map((item, index) => (
            <div
              key={item.id}
              className="rounded-2xl border border-slate-800 bg-[#111C30] p-5 transition duration-300 hover:border-blue-500/40 sm:p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">
                    SAVED PLAN #{plans.length - index}
                  </p>

                  <h2 className="mt-3 text-xl font-bold text-slate-100">
                    {item.recommended_role ||
                      item.recommendations?.recommendedRole ||
                      "Career Plan"}
                  </h2>

                  <p className="mt-3 flex items-center gap-2 text-sm text-slate-400">
                    <CalendarDays
                      size={15}
                      className="text-blue-400"
                    />
                    {formatDate(item.created_at)}
                  </p>
                </div>

                <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-3">
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    Readiness
                  </p>

                  <p className="mt-2 font-bold text-cyan-300">
                    {item.readiness_level ||
                      item.recommendations?.readinessLevel ||
                      "Not available"}
                  </p>
                </div>
              </div>

              <p className="mt-5 line-clamp-3 text-sm leading-6 text-slate-400">
                {item.recommendations?.careerSummary}
              </p>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-slate-800 pt-5">
                <button
                  onClick={() => setSelectedPlan(item)}
                  className="flex items-center gap-2 text-sm font-semibold text-blue-400 transition hover:text-blue-300"
                >
                  <Eye size={17} />
                  View Details
                </button>

                <button
                  onClick={() => deletePlan(item.id)}
                  disabled={deletingId === item.id}
                  className="flex items-center gap-2 text-sm font-semibold text-red-400 transition hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {deletingId === item.id ? (
                    <LoaderCircle
                      size={16}
                      className="animate-spin"
                    />
                  ) : (
                    <Trash2 size={16} />
                  )}
                  {deletingId === item.id ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Selected Plan Details Modal */}
        {selectedPlan && (
          <div
            className="fixed inset-0 z-50 overflow-y-auto bg-black/80 p-4 backdrop-blur-sm sm:p-8"
            onClick={() => setSelectedPlan(null)}
          >
            <div
              className="mx-auto my-8 max-w-4xl rounded-2xl border border-slate-700 bg-[#111C30] p-5 shadow-2xl sm:p-8"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-5">
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-blue-400">
                    <Sparkles size={15} />
                    Saved Career Plan
                  </div>

                  <h2 className="mt-3 text-2xl font-bold text-slate-100">
                    {selectedPlan.recommended_role ||
                      selectedPlan.recommendations.recommendedRole}
                  </h2>

                  <p className="mt-2 flex items-center gap-2 text-sm text-slate-400">
                    <CalendarDays size={14} />
                    {formatDate(selectedPlan.created_at)}
                  </p>
                </div>

                <button
                  onClick={() => setSelectedPlan(null)}
                  className="rounded-xl border border-slate-700 p-2 text-slate-400 transition hover:border-blue-500/40 hover:text-white"
                  aria-label="Close details"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="mt-7 space-y-9">

                {/* Career Assessment */}
                <section>
                  <div className="flex items-center gap-2">
                    <BrainCircuit
                      size={20}
                      className="text-blue-400"
                    />

                    <h3 className="font-bold text-blue-300">
                      Career Assessment
                    </h3>
                  </div>

                  <p className="mt-3 text-sm leading-7 text-slate-300">
                    {selectedPlan.recommendations.careerSummary}
                  </p>

                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-xl border border-slate-700 bg-[#0B1220] p-4">
                      <p className="text-xs uppercase text-slate-500">
                        Recommended Role
                      </p>

                      <p className="mt-2 font-bold text-blue-300">
                        {selectedPlan.recommendations.recommendedRole}
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-700 bg-[#0B1220] p-4">
                      <p className="text-xs uppercase text-slate-500">
                        Readiness Level
                      </p>

                      <p className="mt-2 font-bold text-cyan-300">
                        {selectedPlan.recommendations.readinessLevel}
                      </p>
                    </div>
                  </div>
                </section>

                {/* Top Priorities */}
                <section>
                  <DetailHeading
                    icon={<Target size={19} />}
                    title="Top Priorities"
                  />

                  <div className="mt-4 space-y-4">
                    {selectedPlan.recommendations.topPriorities?.map(
                      (priority) => (
                        <div
                          key={priority.priority}
                          className="rounded-xl border border-slate-700 bg-[#0B1220] p-4"
                        >
                          <div className="flex items-center gap-3">
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 font-bold text-blue-400">
                              {priority.priority}
                            </span>

                            <h4 className="font-semibold text-slate-100">
                              {priority.title}
                            </h4>
                          </div>

                          <p className="mt-3 text-sm leading-6 text-slate-400">
                            {priority.reason}
                          </p>

                          <div className="mt-4 rounded-lg border border-blue-500/10 bg-blue-500/5 p-3">
                            <p className="text-xs font-semibold uppercase text-blue-400">
                              Action
                            </p>

                            <p className="mt-2 text-sm leading-6 text-slate-300">
                              {priority.action}
                            </p>
                          </div>

                          <p className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                            <Clock size={14} />
                            Estimated time: {priority.estimatedTime}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                </section>

                {/* Learning Plan */}
                <section>
                  <DetailHeading
                    icon={<BookOpen size={19} />}
                    title="Four-Week Learning Plan"
                  />

                  <div className="mt-4 space-y-4">
                    {selectedPlan.recommendations.learningPlan?.map(
                      (week) => (
                        <div
                          key={week.week}
                          className="rounded-xl border border-slate-700 bg-[#0B1220] p-4"
                        >
                          <div className="flex flex-wrap items-center gap-3">
                            <span className="rounded-lg bg-blue-500/10 px-3 py-1.5 text-xs font-bold text-blue-400">
                              WEEK {week.week}
                            </span>

                            <p className="font-semibold text-slate-100">
                              {week.focus}
                            </p>
                          </div>

                          <div className="mt-4">
                            <p className="text-xs font-semibold uppercase text-slate-500">
                              Topics
                            </p>

                            <div className="mt-2 flex flex-wrap gap-2">
                              {week.topics?.map((topic, index) => (
                                <span
                                  key={index}
                                  className="rounded-lg border border-slate-700 bg-[#111C30] px-3 py-1.5 text-xs text-slate-300"
                                >
                                  {topic}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="mt-4">
                            <p className="text-xs font-semibold uppercase text-slate-500">
                              Practice Task
                            </p>

                            <p className="mt-2 text-sm leading-6 text-slate-300">
                              {week.task}
                            </p>
                          </div>

                          <div className="mt-4">
                            <p className="flex items-center gap-2 text-xs font-semibold uppercase text-blue-400">
                              <BriefcaseBusiness size={14} />
                              Weekly Project
                            </p>

                            <p className="mt-2 text-sm leading-6 text-slate-300">
                              {week.project}
                            </p>
                          </div>

                          <div className="mt-4">
                            <p className="text-xs font-semibold uppercase text-cyan-400">
                              Expected Outcome
                            </p>

                            <p className="mt-2 text-sm leading-6 text-slate-300">
                              {week.expectedOutcome}
                            </p>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </section>

                {/* Interview Advice */}
                <section>
                  <DetailHeading
                    icon={<GraduationCap size={19} />}
                    title="Interview Advice"
                  />

                  <ul className="mt-4 space-y-3">
                    {selectedPlan.recommendations.interviewAdvice?.map(
                      (advice, index) => (
                        <li
                          key={index}
                          className="flex items-start gap-3 text-sm leading-6 text-slate-300"
                        >
                          <CheckCircle2
                            size={17}
                            className="mt-0.5 shrink-0 text-blue-400"
                          />
                          {advice}
                        </li>
                      )
                    )}
                  </ul>
                </section>

                {/* Project Suggestions */}
                <section>
                  <DetailHeading
                    icon={<BriefcaseBusiness size={19} />}
                    title="Project Suggestions"
                  />

                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    {selectedPlan.recommendations.projectSuggestions?.map(
                      (project, index) => (
                        <div
                          key={index}
                          className="rounded-xl border border-slate-700 bg-[#0B1220] p-4"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <h4 className="font-semibold text-slate-100">
                              {project.title}
                            </h4>

                            <span className="shrink-0 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2.5 py-1 text-xs text-cyan-300">
                              {project.difficulty}
                            </span>
                          </div>

                          <p className="mt-3 text-sm leading-6 text-slate-400">
                            {project.description}
                          </p>

                          <p className="mt-4 text-xs font-semibold uppercase text-slate-500">
                            Skills Used
                          </p>

                          <div className="mt-2 flex flex-wrap gap-2">
                            {project.skillsUsed?.map((skill, skillIndex) => (
                              <span
                                key={skillIndex}
                                className="rounded-lg bg-blue-500/10 px-2.5 py-1 text-xs text-blue-300"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </section>

                {/* Next Action */}
                <section className="rounded-xl border border-blue-500/30 bg-blue-500/5 p-5">
                  <div className="flex items-center gap-2">
                    <CheckCircle2
                      size={20}
                      className="text-blue-400"
                    />

                    <h3 className="font-bold text-blue-300">
                      Your Next Action
                    </h3>
                  </div>

                  <p className="mt-3 text-sm leading-7 text-slate-300">
                    {selectedPlan.recommendations.nextAction}
                  </p>
                </section>

              </div>

              <button
                onClick={() => setSelectedPlan(null)}
                className="mt-8 w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-500"
              >
                Close Details
              </button>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}

function DetailHeading({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-blue-400">{icon}</span>
      <h3 className="font-bold text-slate-100">{title}</h3>
    </div>
  );
}
