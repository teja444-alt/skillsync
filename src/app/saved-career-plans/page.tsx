
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
      <main className="flex min-h-screen items-center justify-center bg-[#09090b] text-white">
        <div className="flex items-center gap-3 text-zinc-400">
          <LoaderCircle size={20} className="animate-spin" />
          Loading saved career plans...
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

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-violet-400">
              SKILLSYNC AI
            </p>

            <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
              Saved Career Plans
            </h1>

            <p className="mt-3 text-zinc-400">
              Review your previous AI-generated career recommendations.
            </p>
          </div>

          <button
            onClick={() => router.push("/career-recommendations")}
            className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold hover:bg-violet-500"
          >
            Generate New Plan
          </button>
        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* Summary */}
        <div className="mt-8 rounded-2xl border border-zinc-800 bg-[#111114] p-6">
          <div className="flex items-center gap-3">
            <BrainCircuit className="text-violet-400" size={25} />
            <div>
              <h2 className="font-bold">Your Career Plan History</h2>
              <p className="mt-1 text-sm text-zinc-400">
                {plans.length} saved {plans.length === 1 ? "plan" : "plans"}
              </p>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {plans.length === 0 && !error && (
          <div className="mt-8 rounded-2xl border border-zinc-800 bg-[#111114] px-6 py-16 text-center">
            <Sparkles
              size={42}
              className="mx-auto text-violet-400"
            />

            <h2 className="mt-5 text-xl font-bold">
              No saved career plans yet
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-zinc-400">
              Generate your personalized career recommendations
              and save them to review your progress later.
            </p>

            <button
              onClick={() => router.push("/career-recommendations")}
              className="mt-6 rounded-xl bg-violet-600 px-6 py-3 font-semibold hover:bg-violet-500"
            >
              Generate Your First Plan
            </button>
          </div>
        )}

        {/* Saved Plans */}
        <div className="mt-8 space-y-5">
          {plans.map((item, index) => (
            <div
              key={item.id}
              className="rounded-2xl border border-zinc-800 bg-[#111114] p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-violet-400">
                    SAVED PLAN #{plans.length - index}
                  </p>

                  <h2 className="mt-3 text-xl font-bold">
                    {item.recommended_role ||
                      item.recommendations?.recommendedRole ||
                      "Career Plan"}
                  </h2>

                  <p className="mt-3 flex items-center gap-2 text-sm text-zinc-400">
                    <CalendarDays size={15} />
                    {formatDate(item.created_at)}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-xs uppercase text-zinc-500">
                    Readiness
                  </p>

                  <p className="mt-2 font-bold text-cyan-300">
                    {item.readiness_level ||
                      item.recommendations?.readinessLevel ||
                      "Not available"}
                  </p>
                </div>
              </div>

              <p className="mt-5 line-clamp-3 text-sm leading-6 text-zinc-400">
                {item.recommendations?.careerSummary}
              </p>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-800 pt-5">
                <button
                  onClick={() => setSelectedPlan(item)}
                  className="flex items-center gap-2 text-sm font-semibold text-violet-400 hover:text-violet-300"
                >
                  <Eye size={17} />
                  View Details
                </button>

                <button
                  onClick={() => deletePlan(item.id)}
                  disabled={deletingId === item.id}
                  className="flex items-center gap-2 text-sm font-semibold text-red-400 hover:text-red-300 disabled:opacity-50"
                >
                  {deletingId === item.id ? (
                    <LoaderCircle size={16} className="animate-spin" />
                  ) : (
                    <Trash2 size={16} />
                  )}
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Selected Plan Details */}
        {selectedPlan && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 p-4 sm:p-8">
            <div className="mx-auto my-8 max-w-4xl rounded-2xl border border-zinc-700 bg-[#111114] p-6 sm:p-8">

              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-violet-400">
                    SAVED CAREER PLAN
                  </p>

                  <h2 className="mt-2 text-2xl font-bold">
                    {selectedPlan.recommended_role ||
                      selectedPlan.recommendations.recommendedRole}
                  </h2>

                  <p className="mt-2 text-sm text-zinc-400">
                    {formatDate(selectedPlan.created_at)}
                  </p>
                </div>

                <button
                  onClick={() => setSelectedPlan(null)}
                  className="rounded-lg border border-zinc-700 p-2 text-zinc-400 hover:text-white"
                  aria-label="Close details"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="mt-6 space-y-8">

                <section>
                  <h3 className="font-bold text-violet-300">
                    Career Assessment
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-zinc-300">
                    {selectedPlan.recommendations.careerSummary}
                  </p>
                </section>

                <section>
                  <h3 className="flex items-center gap-2 font-bold">
                    <Target size={19} className="text-violet-400" />
                    Top Priorities
                  </h3>

                  <div className="mt-4 space-y-4">
                    {selectedPlan.recommendations.topPriorities?.map(
                      (priority) => (
                        <div
                          key={priority.priority}
                          className="rounded-xl border border-zinc-800 p-4"
                        >
                          <h4 className="font-semibold">
                            {priority.priority}. {priority.title}
                          </h4>

                          <p className="mt-2 text-sm text-zinc-400">
                            {priority.reason}
                          </p>

                          <p className="mt-3 text-sm text-zinc-300">
                            <strong>Action:</strong> {priority.action}
                          </p>

                          <p className="mt-2 text-xs text-zinc-500">
                            Estimated time: {priority.estimatedTime}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                </section>

                <section>
                  <h3 className="flex items-center gap-2 font-bold">
                    <BookOpen size={19} className="text-violet-400" />
                    Four-Week Learning Plan
                  </h3>

                  <div className="mt-4 space-y-4">
                    {selectedPlan.recommendations.learningPlan?.map(
                      (week) => (
                        <div
                          key={week.week}
                          className="rounded-xl border border-zinc-800 p-4"
                        >
                          <p className="font-semibold text-violet-300">
                            Week {week.week}: {week.focus}
                          </p>

                          <p className="mt-3 text-sm text-zinc-300">
                            <strong>Topics:</strong>{" "}
                            {week.topics?.join(", ")}
                          </p>

                          <p className="mt-3 text-sm text-zinc-300">
                            <strong>Practice:</strong> {week.task}
                          </p>

                          <p className="mt-3 text-sm text-zinc-300">
                            <strong>Project:</strong> {week.project}
                          </p>

                          <p className="mt-3 text-sm text-zinc-400">
                            <strong>Outcome:</strong>{" "}
                            {week.expectedOutcome}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                </section>

                <section>
                  <h3 className="font-bold text-violet-300">
                    Interview Advice
                  </h3>

                  <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-zinc-300">
                    {selectedPlan.recommendations.interviewAdvice?.map(
                      (advice, index) => (
                        <li key={index}>{advice}</li>
                      )
                    )}
                  </ul>
                </section>

                <section>
                  <h3 className="flex items-center gap-2 font-bold">
                    <BriefcaseBusiness
                      size={19}
                      className="text-violet-400"
                    />
                    Project Suggestions
                  </h3>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    {selectedPlan.recommendations.projectSuggestions?.map(
                      (project, index) => (
                        <div
                          key={index}
                          className="rounded-xl border border-zinc-800 p-4"
                        >
                          <h4 className="font-semibold">
                            {project.title}
                          </h4>

                          <p className="mt-2 text-sm text-zinc-400">
                            {project.description}
                          </p>

                          <p className="mt-3 text-xs text-cyan-300">
                            {project.difficulty}
                          </p>

                          <p className="mt-2 text-xs text-zinc-400">
                            Skills: {project.skillsUsed?.join(", ")}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                </section>

                <section className="rounded-xl border border-green-500/30 bg-green-500/5 p-4">
                  <h3 className="font-bold text-green-400">
                    Your Next Action
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-zinc-300">
                    {selectedPlan.recommendations.nextAction}
                  </p>
                </section>

              </div>

              <button
                onClick={() => setSelectedPlan(null)}
                className="mt-8 w-full rounded-xl bg-violet-600 px-5 py-3 font-semibold hover:bg-violet-500"
              >
                Close
              </button>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
