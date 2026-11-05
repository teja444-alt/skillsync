
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  ArrowLeft,
  TrendingUp,
  Trophy,
  Target,
  MessageSquare,
  LoaderCircle,
  BarChart3,
  CalendarDays,
  Activity,
  Sparkles,
} from "lucide-react";

type Interview = {
  id: string;
  role: string;
  overall_score: number | null;
  created_at: string;
};

export default function AnalyticsPage() {
  const router = useRouter();

  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAnalytics() {
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
          .select("id, role, overall_score, created_at")
          .eq("user_id", user.id)
          .not("overall_score", "is", null)
          .order("created_at", { ascending: true });

        if (queryError) {
          throw queryError;
        }

        setInterviews((data || []) as Interview[]);
      } catch (err: any) {
        console.error("Analytics error:", err);
        setError(
          "Unable to load performance analytics. Please try again."
        );
      } finally {
        setLoading(false);
      }
    }

    loadAnalytics();
  }, [router]);

  const totalInterviews = interviews.length;

  const averageScore =
    totalInterviews > 0
      ? Math.round(
          interviews.reduce(
            (total, item) => total + (item.overall_score ?? 0),
            0
          ) / totalInterviews
        )
      : 0;

  const bestScore =
    totalInterviews > 0
      ? Math.max(
          ...interviews.map((item) => item.overall_score ?? 0)
        )
      : 0;

  const latestScore =
    totalInterviews > 0
      ? interviews[totalInterviews - 1].overall_score ?? 0
      : 0;

  // Calculate average score for every job role
  const roleStats = Object.values(
    interviews.reduce(
      (groups, interview) => {
        const role = interview.role;

        if (!groups[role]) {
          groups[role] = {
            role,
            total: 0,
            count: 0,
          };
        }

        groups[role].total += interview.overall_score ?? 0;
        groups[role].count += 1;

        return groups;
      },
      {} as Record<
        string,
        { role: string; total: number; count: number }
      >
    )
  )
    .map((item) => ({
      role: item.role,
      average: Math.round(item.total / item.count),
      count: item.count,
    }))
    .sort((a, b) => b.average - a.average);

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  function scoreColor(score: number) {
    if (score >= 75) return "text-green-400";
    if (score >= 50) return "text-yellow-400";
    return "text-red-400";
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0B1220] text-slate-100">
        <div className="flex items-center gap-3 text-slate-400">
          <LoaderCircle
            className="animate-spin text-blue-400"
            size={24}
          />
          Loading performance analytics...
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
              <Activity size={19} className="text-blue-400" />
            </div>

            <p className="text-sm font-semibold uppercase tracking-widest text-blue-400">
              SkillSync AI
            </p>
          </div>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Performance Analytics
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
            Monitor your interview performance, understand your strengths,
            and track your progress over time.
          </p>
        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* Empty State */}
        {totalInterviews === 0 && !error ? (
          <div className="mt-10 rounded-2xl border border-slate-800 bg-[#111C30] p-8 text-center sm:p-12">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10">
              <BarChart3
                size={32}
                className="text-blue-400"
              />
            </div>

            <h2 className="mt-5 text-xl font-semibold">
              No Performance Data Yet
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-400">
              Complete a mock interview to generate your performance
              analytics and start tracking your improvement.
            </p>

            <button
              onClick={() => router.push("/mock-interview")}
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-500"
            >
              <Sparkles size={18} />
              Start Mock Interview
            </button>
          </div>
        ) : totalInterviews > 0 ? (
          <>
            {/* Summary Cards */}
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

              <StatCard
                icon={<MessageSquare size={22} />}
                title="Completed Interviews"
                value={String(totalInterviews)}
                color="text-blue-400"
              />

              <StatCard
                icon={<Target size={22} />}
                title="Average Score"
                value={`${averageScore}%`}
                color="text-cyan-400"
              />

              <StatCard
                icon={<Trophy size={22} />}
                title="Best Score"
                value={`${bestScore}%`}
                color="text-yellow-400"
              />

              <StatCard
                icon={<TrendingUp size={22} />}
                title="Latest Score"
                value={`${latestScore}%`}
                color="text-green-400"
              />

            </div>

            {/* Score Trend Chart */}
            <section className="mt-8 rounded-2xl border border-slate-800 bg-[#111C30] p-5 sm:p-7">

              <div className="flex items-center gap-3">
                <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-2.5">
                  <TrendingUp
                    size={22}
                    className="text-blue-400"
                  />
                </div>

                <div>
                  <h2 className="text-lg font-semibold">
                    Interview Score Progress
                  </h2>

                  <p className="mt-1 text-sm text-slate-400">
                    Your scores in chronological order.
                  </p>
                </div>
              </div>

              <div className="mt-8 flex h-64 items-end gap-3 overflow-x-auto border-b border-slate-700/70 pb-2">
                {interviews.map((item, index) => {
                  const score = item.overall_score ?? 0;

                  return (
                    <div
                      key={item.id}
                      className="flex h-full min-w-12 flex-1 flex-col items-center justify-end gap-2"
                    >
                      <span className="text-xs font-semibold text-slate-300">
                        {score}%
                      </span>

                      <div className="flex h-44 w-full items-end justify-center">
                        <div
                          title={`${item.role}: ${score}%`}
                          className="w-full max-w-14 rounded-t-lg bg-blue-500 transition-all duration-300 hover:bg-blue-400"
                          style={{
                            height: `${Math.max(score, 2)}%`,
                          }}
                        />
                      </div>

                      <span className="text-xs text-slate-500">
                        #{index + 1}
                      </span>
                    </div>
                  );
                })}
              </div>

              <p className="mt-4 text-xs text-slate-500">
                Each bar represents one completed interview, ordered from
                oldest to newest.
              </p>
            </section>

            {/* Role-wise Performance */}
            <section className="mt-8 rounded-2xl border border-slate-800 bg-[#111C30] p-5 sm:p-7">

              <div className="flex items-center gap-3">
                <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-2.5">
                  <BarChart3
                    size={22}
                    className="text-cyan-400"
                  />
                </div>

                <div>
                  <h2 className="text-lg font-semibold">
                    Role-wise Performance
                  </h2>

                  <p className="mt-1 text-sm text-slate-400">
                    Average interview score for each job role.
                  </p>
                </div>
              </div>

              <div className="mt-7 space-y-6">
                {roleStats.map((item) => (
                  <div key={item.role}>

                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                      <span className="text-sm font-medium text-slate-200">
                        {item.role}
                      </span>

                      <span
                        className={`text-sm font-bold ${scoreColor(item.average)}`}
                      >
                        {item.average}%

                        <span className="ml-2 text-xs font-normal text-slate-500">
                          ({item.count}{" "}
                          {item.count === 1 ? "interview" : "interviews"})
                        </span>
                      </span>
                    </div>

                    <div className="h-3 overflow-hidden rounded-full bg-slate-800">
                      <div
                        className="h-full rounded-full bg-blue-500 transition-all duration-700"
                        style={{
                          width: `${Math.min(100, Math.max(0, item.average))}%`,
                        }}
                      />
                    </div>

                  </div>
                ))}
              </div>
            </section>

            {/* Recent Interviews */}
            <section className="mt-8 rounded-2xl border border-slate-800 bg-[#111C30] p-5 sm:p-7">

              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">
                    Recent Interviews
                  </h2>

                  <p className="mt-1 text-sm text-slate-400">
                    Your latest five interview results.
                  </p>
                </div>

                <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-2.5">
                  <CalendarDays
                    size={20}
                    className="text-blue-400"
                  />
                </div>
              </div>

              <div className="mt-5 divide-y divide-slate-800">
                {[...interviews]
                  .reverse()
                  .slice(0, 5)
                  .map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-wrap items-center justify-between gap-4 py-4"
                    >
                      <div>
                        <h3 className="font-semibold text-slate-200">
                          {item.role}
                        </h3>

                        <p className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                          <CalendarDays size={13} />
                          {formatDate(item.created_at)}
                        </p>
                      </div>

                      <span
                        className={`text-xl font-bold ${scoreColor(item.overall_score ?? 0)}`}
                      >
                        {item.overall_score ?? 0}%
                      </span>
                    </div>
                  ))}
              </div>
            </section>

            {/* Actions */}
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <button
                onClick={() => router.push("/mock-interview")}
                className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-500"
              >
                <Sparkles size={18} />
                Start Another Interview
              </button>

              <button
                onClick={() => router.push("/interview-history")}
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-[#111C30] px-5 py-3 font-semibold text-slate-200 transition hover:border-blue-500/50 hover:bg-blue-500/10"
              >
                <MessageSquare size={18} />
                View Interview History
              </button>
            </div>
          </>
        ) : null}

      </div>
    </main>
  );
}

function StatCard({
  icon,
  title,
  value,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  color: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-[#111C30] p-5 transition duration-300 hover:-translate-y-1 hover:border-blue-500/40">
      <div className="flex items-center justify-between">
        <div className={color}>
          {icon}
        </div>

        <div className="h-8 w-8 rounded-lg bg-slate-800/70" />
      </div>

      <p className="mt-5 text-3xl font-bold text-slate-100">
        {value}
      </p>

      <p className="mt-1 text-sm text-slate-400">
        {title}
      </p>
    </div>
  );
}
