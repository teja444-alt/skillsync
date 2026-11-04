
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  ArrowLeft,
  CalendarDays,
  Trophy,
  LoaderCircle,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Target,
} from "lucide-react";

type InterviewResult = {
  question: string;
  answer: string;
  score: number;
  feedback: string;
  idealAnswer: string;
};

type Evaluation = {
  overallScore: number;
  performance: string;
  summary: string;
  strengths: string[];
  improvements: string[];
  results: InterviewResult[];
};

type Interview = {
  id: string;
  role: string;
  overall_score: number | null;
  feedback: Evaluation | null;
  created_at: string;
};

export default function InterviewHistoryPage() {
  const router = useRouter();

  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    async function loadHistory() {
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

        const { data, error: queryError } = await supabase
          .from("mock_interviews")
          .select("id, role, overall_score, feedback, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (queryError) {
          throw queryError;
        }

        setInterviews((data || []) as Interview[]);
      } catch (err: any) {
        console.error("Interview history error:", err);
        setError(
          "Unable to load interview history. Please try again."
        );
      } finally {
        setLoading(false);
      }
    }

    loadHistory();
  }, [router]);

  const averageScore =
    interviews.length > 0
      ? Math.round(
          interviews.reduce(
            (total, item) => total + (item.overall_score ?? 0),
            0
          ) / interviews.length
        )
      : 0;

  const bestScore =
    interviews.length > 0
      ? Math.max(
          ...interviews.map((item) => item.overall_score ?? 0)
        )
      : 0;

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  function getScoreColor(score: number) {
    if (score >= 75) return "text-green-400";
    if (score >= 50) return "text-yellow-400";
    return "text-red-400";
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#09090b] text-white">
        <div className="flex items-center gap-3 text-zinc-400">
          <LoaderCircle className="animate-spin" size={22} />
          Loading interview history...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#09090b] px-4 py-8 text-white sm:px-8">
      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <button
          onClick={() => router.push("/dashboard")}
          className="mb-8 flex items-center gap-2 text-sm text-zinc-400 hover:text-white"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </button>

        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-violet-400">
            SkillSync AI
          </p>

          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
            Interview History
          </h1>

          <p className="mt-3 text-zinc-400">
            Review your previous interviews and track your performance.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* Statistics */}
        {interviews.length > 0 && (
          <div className="mt-8 grid gap-4 sm:grid-cols-3">

            <div className="rounded-2xl border border-zinc-800 bg-[#111114] p-5">
              <MessageSquare className="text-violet-400" size={24} />
              <p className="mt-4 text-3xl font-bold">
                {interviews.length}
              </p>
              <p className="mt-1 text-sm text-zinc-400">
                Completed Interviews
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-[#111114] p-5">
              <Target className="text-cyan-400" size={24} />
              <p className="mt-4 text-3xl font-bold">
                {averageScore}%
              </p>
              <p className="mt-1 text-sm text-zinc-400">
                Average Score
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-[#111114] p-5">
              <Trophy className="text-yellow-400" size={24} />
              <p className="mt-4 text-3xl font-bold">
                {bestScore}%
              </p>
              <p className="mt-1 text-sm text-zinc-400">
                Best Score
              </p>
            </div>

          </div>
        )}

        {/* Empty State */}
        {interviews.length === 0 && !error && (
          <div className="mt-10 rounded-2xl border border-zinc-800 bg-[#111114] p-10 text-center">
            <MessageSquare
              size={45}
              className="mx-auto text-violet-400"
            />

            <h2 className="mt-5 text-xl font-semibold">
              No interview history yet
            </h2>

            <p className="mt-3 text-sm text-zinc-400">
              Complete your first AI mock interview to see your
              scores and feedback here.
            </p>

            <button
              onClick={() => router.push("/mock-interview")}
              className="mt-6 rounded-xl bg-violet-600 px-6 py-3 font-semibold hover:bg-violet-500"
            >
              Start Your First Interview
            </button>
          </div>
        )}

        {/* Interview Records */}
        <div className="mt-10 space-y-5">
          {interviews.map((interview, index) => {
            const isExpanded = expandedId === interview.id;
            const feedback = interview.feedback;

            return (
              <section
                key={interview.id}
                className="overflow-hidden rounded-2xl border border-zinc-800 bg-[#111114]"
              >
                {/* Interview Summary */}
                <div className="p-5 sm:p-6">

                  <div className="flex flex-wrap items-center justify-between gap-4">

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-widest text-violet-400">
                        Interview #{interviews.length - index}
                      </p>

                      <h2 className="mt-2 text-xl font-bold">
                        {interview.role}
                      </h2>

                      <p className="mt-2 flex items-center gap-2 text-sm text-zinc-400">
                        <CalendarDays size={15} />
                        {formatDate(interview.created_at)}
                      </p>
                    </div>

                    <div className="text-right">
                      <p
                        className={`text-3xl font-bold ${getScoreColor(
                          interview.overall_score ?? 0
                        )}`}
                      >
                        {interview.overall_score ?? 0}%
                      </p>

                      <p className="mt-1 text-xs text-zinc-400">
                        Interview Score
                      </p>
                    </div>

                  </div>

                  {feedback && (
                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-800 pt-4">

                      <span className="rounded-full bg-violet-500/10 px-3 py-1.5 text-sm text-violet-300">
                        {feedback.performance}
                      </span>

                      <button
                        onClick={() =>
                          setExpandedId(
                            isExpanded ? null : interview.id
                          )
                        }
                        className="flex items-center gap-2 text-sm font-semibold text-violet-400 hover:text-violet-300"
                      >
                        {isExpanded ? "Hide Details" : "View Details"}

                        {isExpanded ? (
                          <ChevronUp size={18} />
                        ) : (
                          <ChevronDown size={18} />
                        )}
                      </button>

                    </div>
                  )}

                </div>

                {/* Expanded Feedback */}
                {isExpanded && feedback && (
                  <div className="space-y-6 border-t border-zinc-800 bg-[#0c0c0f] p-5 sm:p-6">

                    <div>
                      <h3 className="font-semibold">
                        Overall Feedback
                      </h3>

                      <p className="mt-2 text-sm leading-6 text-zinc-400">
                        {feedback.summary}
                      </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">

                      <div className="rounded-xl border border-zinc-800 p-4">
                        <h3 className="font-semibold text-green-400">
                          Strengths
                        </h3>

                        <ul className="mt-3 space-y-2 text-sm text-zinc-300">
                          {(feedback.strengths || []).map(
                            (item, i) => (
                              <li key={i}>✓ {item}</li>
                            )
                          )}
                        </ul>
                      </div>

                      <div className="rounded-xl border border-zinc-800 p-4">
                        <h3 className="font-semibold text-yellow-400">
                          Areas to Improve
                        </h3>

                        <ul className="mt-3 space-y-2 text-sm text-zinc-300">
                          {(feedback.improvements || []).map(
                            (item, i) => (
                              <li key={i}>• {item}</li>
                            )
                          )}
                        </ul>
                      </div>

                    </div>

                    <div>
                      <h3 className="mb-4 font-semibold">
                        Question-wise Evaluation
                      </h3>

                      <div className="space-y-4">
                        {(feedback.results || []).map(
                          (result, i) => (
                            <div
                              key={i}
                              className="rounded-xl border border-zinc-800 p-4"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <h4 className="font-medium">
                                  Q{i + 1}. {result.question}
                                </h4>

                                <span className="shrink-0 rounded-lg bg-violet-500/10 px-3 py-1 text-sm font-bold text-violet-300">
                                  {result.score}/10
                                </span>
                              </div>

                              <p className="mt-4 text-xs font-semibold uppercase text-zinc-500">
                                Your Answer
                              </p>

                              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-zinc-300">
                                {result.answer || "No answer provided."}
                              </p>

                              <p className="mt-4 text-xs font-semibold uppercase text-zinc-500">
                                AI Feedback
                              </p>

                              <p className="mt-2 text-sm leading-6 text-zinc-300">
                                {result.feedback}
                              </p>

                              <div className="mt-4 rounded-lg bg-zinc-900 p-4">
                                <p className="text-xs font-semibold uppercase text-cyan-400">
                                  Example Ideal Answer
                                </p>

                                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-zinc-300">
                                  {result.idealAnswer}
                                </p>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>

                  </div>
                )}
              </section>
            );
          })}
        </div>

        {/* Start Another Interview */}
        {interviews.length > 0 && (
          <button
            onClick={() => router.push("/mock-interview")}
            className="mt-8 w-full rounded-xl bg-violet-600 px-6 py-3 font-semibold hover:bg-violet-500"
          >
            Start Another Interview
          </button>
        )}

      </div>
    </main>
  );
}
