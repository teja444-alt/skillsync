
"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";

import {
  BrainCircuit,
  FileText,
  Target,
  GraduationCap,
  MessageSquare,
  History,
  BarChart3,
  Sparkles,
  LogOut,
  ArrowRight,
  TrendingUp,
  BriefcaseBusiness,
  CalendarDays,
  LoaderCircle,
  BookmarkCheck,
  LayoutDashboard,
} from "lucide-react";

type ResumeAnalysis = {
  overall_score: number;
  target_role: string | null;
  created_at: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const pathname = usePathname();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [resumeData, setResumeData] =
    useState<ResumeAnalysis | null>(null);
  const [fetchError, setFetchError] = useState("");
  const [activeCard, setActiveCard] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    setActiveCard(null);
  }, [pathname]);

  function handleCardNavigation(title: string, path: string) {
    if (activeCard !== null) return;

    setActiveCard(title);
    router.push(path);
  }

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      setFetchError("");

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        router.replace("/login");
        return;
      }

      setEmail(user.email ?? "");

      const { data, error } = await supabase
        .from("resume_analyses")
        .select("overall_score, target_role, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("Dashboard fetch error:", error);
        setFetchError(
          "Unable to load your resume analysis. Please refresh."
        );
      } else if (data) {
        setResumeData(data as ResumeAnalysis);
      }

      setLoading(false);
    }

    loadDashboard();
  }, [router]);

  async function handleLogout() {
    if (loggingOut) return;

    setLoggingOut(true);

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Logout error:", error);
      setLoggingOut(false);
      return;
    }

    router.replace("/login");
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0B1220] text-white">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-700/60 bg-[#111C30] px-6 py-5 text-slate-300 shadow-xl">
          <LoaderCircle className="animate-spin text-blue-400" size={22} />
          Loading your dashboard...
        </div>
      </main>
    );
  }

  const score = resumeData
    ? Math.min(100, Math.max(0, resumeData.overall_score))
    : null;

  const analysisDate = resumeData?.created_at
    ? new Date(resumeData.created_at).toLocaleDateString(
        "en-IN",
        {
          day: "numeric",
          month: "short",
          year: "numeric",
        }
      )
    : null;

  return (
    <main className="min-h-screen bg-[#0B1220] text-slate-100">

      {/* Top Navigation */}
      <nav className="sticky top-0 z-30 border-b border-slate-800/80 bg-[#0B1220]/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">

          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-600 p-2.5 shadow-lg shadow-blue-600/20">
              <BrainCircuit size={22} className="text-white" />
            </div>

            <div>
              <span className="text-xl font-bold tracking-tight">
                Skill<span className="text-blue-400">Sync</span>
              </span>
              <p className="hidden text-[10px] font-medium tracking-[0.2em] text-slate-500 sm:block">
                CAREER DEVELOPMENT PLATFORM
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-xs font-medium text-slate-200">
                Signed in
              </p>
              <p className="max-w-48 truncate text-xs text-slate-500">
                {email}
              </p>
            </div>

            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/60 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:border-red-400/40 hover:bg-red-500/10 hover:text-red-300 disabled:opacity-60"
            >
              {loggingOut ? (
                <LoaderCircle size={16} className="animate-spin" />
              ) : (
                <LogOut size={16} />
              )}
              <span className="hidden sm:inline">
                {loggingOut ? "Signing out..." : "Sign out"}
              </span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Dashboard */}
      <div className="mx-auto max-w-7xl px-5 py-9 sm:px-8 sm:py-12">

        {/* Welcome Header */}
        <section className="relative overflow-hidden rounded-3xl border border-blue-500/20 bg-gradient-to-br from-[#142846] via-[#111F35] to-[#111C30] p-6 shadow-2xl shadow-black/20 sm:p-9">

          <div className="pointer-events-none absolute -right-20 -top-28 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 right-1/3 h-60 w-60 rounded-full bg-cyan-500/5 blur-3xl" />

          <div className="relative z-10">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/10 px-3 py-1.5 text-xs font-semibold tracking-wide text-blue-300">
              <LayoutDashboard size={14} />
              YOUR PERSONAL DASHBOARD
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Welcome to SkillSync!
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
              Build your skills, improve your interview performance,
              and take the next step in your career.
            </p>

            <p className="mt-5 flex items-center gap-2 text-sm text-slate-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              {email}
            </p>
          </div>
        </section>

        {/* Error Message */}
        {fetchError && (
          <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            {fetchError}
          </div>
        )}

        {/* Overview Section */}
        <section className="mt-10">
          <div className="mb-5">
            <p className="text-xs font-semibold tracking-[0.18em] text-blue-400">
              OVERVIEW
            </p>
            <h2 className="mt-2 text-xl font-bold text-white">
              Your career progress
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              A quick look at your latest resume analysis.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">

            {/* Readiness Score */}
            <div className="rounded-2xl border border-slate-700/70 bg-[#111C30] p-6 transition hover:border-blue-500/30 md:col-span-2">

              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-blue-500/10 p-3 text-blue-400">
                  <TrendingUp size={23} />
                </div>

                <div>
                  <h3 className="font-semibold text-white">
                    Job Readiness Score
                  </h3>
                  <p className="text-xs text-slate-500">
                    Your latest resume assessment
                  </p>
                </div>
              </div>

              {resumeData && score !== null ? (
                <div className="mt-8 grid gap-7 sm:grid-cols-[auto_1fr] sm:items-center">

                  <div className="flex h-32 w-32 items-center justify-center rounded-full border-[9px] border-blue-500/80 shadow-lg shadow-blue-500/10">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-white">
                        {score}%
                      </p>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                        Score
                      </p>
                    </div>
                  </div>

                  <div className="min-w-0">
                    <p className="font-semibold text-slate-100">
                      Resume analyzed successfully
                    </p>

                    <p className="mt-2 text-sm leading-6 text-slate-400">
                      Your average readiness across the analyzed job roles.
                    </p>

                    {analysisDate && (
                      <p className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                        <CalendarDays size={14} />
                        Last analyzed: {analysisDate}
                      </p>
                    )}

                    <button
                      onClick={() =>
                        handleCardNavigation("Resume Analysis", "/resume")
                      }
                      disabled={activeCard !== null}
                      className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-400 transition hover:text-blue-300 disabled:opacity-50"
                    >
                      {activeCard === "Resume Analysis" ? (
                        <>
                          <LoaderCircle size={15} className="animate-spin" />
                          Opening...
                        </>
                      ) : (
                        <>
                          Analyze another resume
                          <ArrowRight size={15} />
                        </>
                      )}
                    </button>
                  </div>

                  <div className="sm:col-span-2">
                    <div className="mb-2 flex justify-between text-xs text-slate-400">
                      <span>Overall progress</span>
                      <span className="font-semibold text-blue-300">
                        {score}%
                      </span>
                    </div>

                    <div className="h-2.5 overflow-hidden rounded-full bg-slate-800">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-700"
                        style={{ width: `${score}%` }}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-8 flex flex-wrap items-center gap-6">
                  <div className="flex h-32 w-32 items-center justify-center rounded-full border-[9px] border-slate-700">
                    <span className="text-3xl font-bold text-slate-400">
                      --%
                    </span>
                  </div>

                  <div className="max-w-md">
                    <p className="font-semibold text-white">
                      Not analyzed yet
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-400">
                      Upload your resume to get your personalized readiness score.
                    </p>

                    <button
                      onClick={() =>
                        handleCardNavigation("Resume Analysis", "/resume")
                      }
                      disabled={activeCard !== null}
                      className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-400 hover:text-blue-300 disabled:opacity-50"
                    >
                      {activeCard === "Resume Analysis" ? (
                        <>
                          <LoaderCircle size={15} className="animate-spin" />
                          Opening...
                        </>
                      ) : (
                        <>
                          Upload resume
                          <ArrowRight size={15} />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Target Role */}
            <div className="rounded-2xl border border-slate-700/70 bg-[#111C30] p-6 transition hover:border-blue-500/30">

              <div className="inline-flex rounded-xl bg-blue-500/10 p-3 text-blue-400">
                <BriefcaseBusiness size={23} />
              </div>

              <h3 className="mt-5 font-semibold text-white">
                Target Job Role
              </h3>

              {resumeData?.target_role ? (
                <>
                  <p className="mt-4 text-2xl font-bold text-blue-300">
                    {resumeData.target_role}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-slate-400">
                    Your highest-scoring job role based on your latest resume analysis.
                  </p>
                </>
              ) : (
                <p className="mt-3 text-sm leading-6 text-slate-400">
                  Upload your resume to discover your best-matching job role.
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Career Tools */}
        <section className="mt-12">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold tracking-[0.18em] text-blue-400">
                EXPLORE
              </p>
              <h2 className="mt-2 text-2xl font-bold text-white">
                Your career tools
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Everything you need to prepare for your next opportunity.
              </p>
            </div>

            <span className="rounded-full border border-slate-700 bg-slate-800/60 px-3 py-1.5 text-xs font-medium text-slate-400">
              8 tools available
            </span>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

            <DashboardCard
              icon={<FileText size={23} />}
              title="Resume Analysis"
              description="Upload your resume and extract your skills."
              action="Upload resume"
              loading={activeCard === "Resume Analysis"}
              disabled={activeCard !== null}
              onClick={() => handleCardNavigation("Resume Analysis", "/resume")}
            />

            <DashboardCard
              icon={<Target size={23} />}
              title="Skill Gap Tracker"
              description="Track your completed skills across all 9 job roles."
              action="Track skills"
              loading={activeCard === "Skill Gap Tracker"}
              disabled={activeCard !== null}
              onClick={() => handleCardNavigation("Skill Gap Tracker", "/skills")}
            />

            <DashboardCard
              icon={<GraduationCap size={23} />}
              title="Learning Roadmap"
              description="View your personalized 4-week learning plans for each job role."
              action="View roadmap"
              loading={activeCard === "Learning Roadmap"}
              disabled={activeCard !== null}
              onClick={() => handleCardNavigation("Learning Roadmap", "/resume")}
            />

            <DashboardCard
              icon={<MessageSquare size={23} />}
              title="AI Mock Interview"
              description="Practice technical interviews with AI-generated questions and personalized feedback."
              action="Start interview"
              loading={activeCard === "AI Mock Interview"}
              disabled={activeCard !== null}
              onClick={() => handleCardNavigation("AI Mock Interview", "/mock-interview")}
            />

            <DashboardCard
              icon={<History size={23} />}
              title="Interview History"
              description="Review previous interviews, scores, performance, and AI feedback."
              action="View history"
              loading={activeCard === "Interview History"}
              disabled={activeCard !== null}
              onClick={() => handleCardNavigation("Interview History", "/interview-history")}
            />

            <DashboardCard
              icon={<BarChart3 size={23} />}
              title="Performance Analytics"
              description="Track your interview scores, average performance, and improvement over time."
              action="View analytics"
              loading={activeCard === "Performance Analytics"}
              disabled={activeCard !== null}
              onClick={() => handleCardNavigation("Performance Analytics", "/analytics")}
            />

            <DashboardCard
              icon={<Sparkles size={23} />}
              title="AI Career Recommendations"
              description="Get personalized career advice, prioritized skill improvements, learning plans, and project suggestions powered by Gemini."
              action="Get recommendations"
              loading={activeCard === "AI Career Recommendations"}
              disabled={activeCard !== null}
              onClick={() =>
                handleCardNavigation(
                  "AI Career Recommendations",
                  "/career-recommendations"
                )
              }
            />

            <DashboardCard
              icon={<BookmarkCheck size={23} />}
              title="Saved Career Plans"
              description="Revisit your previous AI career recommendations and saved learning plans."
              action="View saved plans"
              loading={activeCard === "Saved Career Plans"}
              disabled={activeCard !== null}
              onClick={() =>
                handleCardNavigation("Saved Career Plans", "/saved-career-plans")
              }
            />

          </div>
        </section>

        {/* Footer */}
        <footer className="mt-16 border-t border-slate-800 pt-6 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} SkillSync. Built for your career growth.
        </footer>

      </div>
    </main>
  );
}

// Reusable Professional Dashboard Card
function DashboardCard({
  icon,
  title,
  description,
  action,
  loading,
  disabled,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action: string;
  loading: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-busy={loading}
      className="group relative flex min-h-[230px] w-full flex-col rounded-2xl border border-slate-700/70 bg-[#111C30] p-6 text-left transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/50 hover:bg-[#15243B] hover:shadow-xl hover:shadow-blue-950/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-wait disabled:opacity-60 disabled:hover:translate-y-0"
    >
      <div className="flex w-full items-start justify-between">
        <div className="inline-flex rounded-xl border border-blue-400/10 bg-blue-500/10 p-3.5 text-blue-400 transition group-hover:bg-blue-500/20 group-hover:text-cyan-300">
          {icon}
        </div>

        <ArrowRight
          size={18}
          className="mt-1 text-slate-600 transition group-hover:translate-x-1 group-hover:text-blue-400"
        />
      </div>

      <h3 className="mt-6 text-lg font-semibold text-slate-100 transition group-hover:text-white">
        {title}
      </h3>

      <p className="mt-2 flex-1 text-sm leading-6 text-slate-400">
        {description}
      </p>

      <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-400">
        {loading ? (
          <>
            <LoaderCircle size={16} className="animate-spin" />
            Opening...
          </>
        ) : (
          <>
            {action}
            <ArrowRight size={15} className="transition group-hover:translate-x-1" />
          </>
        )}
      </span>
    </button>
  );
}
