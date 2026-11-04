
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
      <main className="flex min-h-screen items-center justify-center bg-[#09090b] text-white">
        <div className="flex items-center gap-3 text-zinc-400">
          <LoaderCircle className="animate-spin" size={22} />
          Loading performance analytics...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#09090b] px-4 py-8 text-white sm:px-8">
      <div className="mx-auto max-w-6xl">

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
            Performance Analytics
          </h1>

          <p className="mt-3 text-zinc-400">
            Understand your interview performance and track your progress.
          </p>
        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* Empty State */}
        {totalInterviews === 0 && !error ? (
          <div className="mt-10 rounded-2xl border border-zinc-800 bg-[#111114] p-10 text-center">
            <BarChart3
              size={48}
              className="mx-auto text-violet-400"
            />

            <h2 className="mt-5 text-xl font-semibold">
              No performance data yet
            </h2>

            <p className="mt-3 text-sm text-zinc-400">
              Complete a mock interview to generate your performance analytics.
            </p>

            <button
              onClick={() => router.push("/mock-interview")}
              className="mt-6 rounded-xl bg-violet-600 px-6 py-3 font-semibold hover:bg-violet-500"
            >
              Start Mock Interview
            </button>
          </div>
        ) : totalInterviews > 0 ? (
          <>
            {/* Summary Cards */}
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

              <StatCard
                icon={<MessageSquare size={23} />}
                title="Completed Interviews"
                value={String(totalInterviews)}
                color="text-violet-400"
              />

              <StatCard
                icon={<Target size={23} />}
                title="Average Score"
                value={`${averageScore}%`}
                color="text-cyan-400"
              />

              <StatCard
                icon={<Trophy size={23} />}
                title="Best Score"
                value={`${bestScore}%`}
                color="text-yellow-400"
              />

              <StatCard
                icon={<TrendingUp size={23} />}
                title="Latest Score"
                value={`${latestScore}%`}
                color="text-green-400"
              />

            </div>

            {/* Score Trend Chart */}
            <section className="mt-8 rounded-2xl border border-zinc-800 bg-[#111114] p-6">

              <div className="flex items-center gap-3">
                <TrendingUp
                  size={23}
                  className="text-violet-400"
                />

                <div>
                  <h2 className="text-lg font-semibold">
                    Interview Score Progress
                  </h2>

                  <p className="mt-1 text-sm text-zinc-400">
                    Your scores in chronological order.
                  </p>
                </div>
              </div>

              <div className="mt-8 flex h-64 items-end gap-3 overflow-x-auto border-b border-zinc-800 pb-2">
                {interviews.map((item, index) => {
                  const score = item.overall_score ?? 0;

                  return (
                    <div
                      key={item.id}
                      className="flex h-full min-w-12 flex-1 flex-col items-center justify-end gap-2"
                    >
                      <span className="text-xs font-semibold text-zinc-300">
                        {score}%
                      </span>

                      <div className="flex h-44 w-full items-end justify-center">
                        <div
                          title={`${item.role}: ${score}%`}
                          className="w-full max-w-14 rounded-t-lg bg-violet-500 transition-all hover:bg-violet-400"
                          style={{
                            height: `${Math.max(score, 2)}%`,
                          }}
                        />
                      </div>

                      <span className="text-xs text-zinc-500">
                        #{index + 1}
                      </span>
                    </div>
                  );
                })}
              </div>

              <p className="mt-4 text-xs text-zinc-500">
                Each bar represents one completed interview, ordered from oldest to newest.
              </p>
            </section>

            {/* Role-wise Performance */}
            <section className="mt-8 rounded-2xl border border-zinc-800 bg-[#111114] p-6">

              <div className="flex items-center gap-3">
                <BarChart3
                  size={23}
                  className="text-cyan-400"
                />

                <div>
                  <h2 className="text-lg font-semibold">
                    Role-wise Performance
                  </h2>

                  <p className="mt-1 text-sm text-zinc-400">
                    Average interview score for each job role.
                  </p>
                </div>
              </div>

              <div className="mt-7 space-y-6">
                {roleStats.map((item) => (
                  <div key={item.role}>

                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                      <span className="text-sm font-medium">
                        {item.role}
                      </span>

                      <span className={`text-sm font-bold ${scoreColor(item.average)}`}>
                        {item.average}%
                        <span className="ml-2 text-xs font-normal text-zinc-500">
                          ({item.count} {item.count === 1 ? "interview" : "interviews"})
                        </span>
                      </span>
                    </div>

                    <div className="h-3 overflow-hidden rounded-full bg-zinc-800">
                      <div
                        className="h-full rounded-full bg-cyan-500 transition-all duration-700"
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
            <section className="mt-8 rounded-2xl border border-zinc-800 bg-[#111114] p-6">

              <h2 className="text-lg font-semibold">
                Recent Interviews
              </h2>

              <div className="mt-5 divide-y divide-zinc-800">
                {[...interviews]
                  .reverse()
                  .slice(0, 5)
                  .map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-wrap items-center justify-between gap-4 py-4"
                    >
                      <div>
                        <h3 className="font-semibold">
                          {item.role}
                        </h3>

                        <p className="mt-1 flex items-center gap-2 text-xs text-zinc-500">
                          <CalendarDays size={13} />
                          {formatDate(item.created_at)}
                        </p>
                      </div>

                      <span className={`text-xl font-bold ${scoreColor(item.overall_score ?? 0)}`}>
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
                className="rounded-xl bg-violet-600 px-5 py-3 font-semibold hover:bg-violet-500"
              >
                Start Another Interview
              </button>

              <button
                onClick={() => router.push("/interview-history")}
                className="rounded-xl border border-zinc-700 px-5 py-3 font-semibold hover:bg-zinc-900"
              >
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
    <div className="rounded-2xl border border-zinc-800 bg-[#111114] p-5">
      <div className={color}>
        {icon}
      </div>

      <p className="mt-4 text-3xl font-bold">
        {value}
      </p>

      <p className="mt-1 text-sm text-zinc-400">
        {title}
      </p>
    </div>
  );
}
