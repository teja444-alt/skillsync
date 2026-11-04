
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
} from "lucide-react";

type ResumeAnalysis = {
  overall_score: number;
  target_role: string | null;
  created_at: string;
};

export default function DashboardPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [resumeData, setResumeData] =
    useState<ResumeAnalysis | null>(null);
  const [fetchError, setFetchError] = useState("");

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
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Logout error:", error);
      return;
    }

    router.replace("/login");
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#09090b] text-white">
        <div className="flex items-center gap-3 text-zinc-400">
          <LoaderCircle
            className="animate-spin"
            size={20}
          />
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
    <main className="min-h-screen bg-[#09090b] text-white">

      {/* Navbar */}
      <nav className="flex items-center justify-between border-b border-zinc-800 px-6 py-5">

        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-violet-600 p-2">
            <BrainCircuit size={20} />
          </div>

          <span className="text-xl font-bold">
            Skill<span className="text-violet-400">Sync</span>
          </span>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-lg border border-zinc-700 px-4 py-2 text-sm hover:bg-zinc-900"
        >
          <LogOut size={16} />
          Sign out
        </button>

      </nav>

      {/* Dashboard Content */}
      <div className="mx-auto max-w-7xl px-6 py-10">

        {/* Welcome Section */}
        <div>
          <p className="text-sm text-violet-400">
            YOUR DASHBOARD
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            Welcome to SkillSync!
          </h1>

          <p className="mt-2 text-zinc-400">
            {email}
          </p>

          <p className="mt-3 text-zinc-400">
            Let's get you ready for your next career opportunity.
          </p>
        </div>

        {/* Error Message */}
        {fetchError && (
          <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            {fetchError}
          </div>
        )}

        {/* Readiness and Target Role */}
        <div className="mt-10 grid gap-6 md:grid-cols-3">

          {/* Job Readiness Score */}
          <div className="rounded-2xl border border-zinc-800 bg-[#111114] p-6 md:col-span-2">

            <div className="flex items-center gap-3">
              <TrendingUp
                className="text-violet-400"
                size={24}
              />

              <h2 className="text-lg font-semibold">
                Job Readiness Score
              </h2>
            </div>

            {resumeData && score !== null ? (
              <div className="mt-7 flex flex-wrap items-center gap-6">

                <div
                  className="flex h-28 w-28 shrink-0 items-center justify-center rounded-full border-8 border-violet-500"
                >
                  <span className="text-3xl font-bold">
                    {score}%
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <p className="font-semibold">
                    Resume analyzed successfully
                  </p>

                  <p className="mt-2 text-sm text-zinc-400">
                    Your average readiness across the analyzed job roles.
                  </p>

                  {analysisDate && (
                    <p className="mt-2 flex items-center gap-2 text-xs text-zinc-500">
                      <CalendarDays size={14} />
                      Last analyzed: {analysisDate}
                    </p>
                  )}

                  <button
                    onClick={() => router.push("/resume")}
                    className="mt-4 text-sm font-semibold text-violet-400 hover:text-violet-300"
                  >
                    Analyze another resume →
                  </button>
                </div>

                {/* Progress Bar */}
                <div className="w-full">
                  <div className="mb-2 flex justify-between text-xs text-zinc-400">
                    <span>Overall progress</span>
                    <span>{score}%</span>
                  </div>

                  <div className="h-3 overflow-hidden rounded-full bg-zinc-800">
                    <div
                      className="h-full rounded-full bg-violet-500 transition-all duration-700"
                      style={{
                        width: `${score}%`,
                      }}
                    />
                  </div>
                </div>

              </div>
            ) : (
              <div className="mt-7 flex flex-wrap items-center gap-6">

                <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-full border-8 border-violet-500">
                  <span className="text-3xl font-bold">
                    --%
                  </span>
                </div>

                <div>
                  <p className="font-semibold">
                    Not analyzed yet
                  </p>

                  <p className="mt-2 text-sm text-zinc-400">
                    Upload your resume to get your personalized readiness score.
                  </p>

                  <button
                    onClick={() => router.push("/resume")}
                    className="mt-4 text-sm font-semibold text-violet-400 hover:text-violet-300"
                  >
                    Upload resume →
                  </button>
                </div>

              </div>
            )}
          </div>

          {/* Target Job Role */}
          <div className="rounded-2xl border border-zinc-800 bg-[#111114] p-6">

            <BriefcaseBusiness
              size={24}
              className="text-violet-400"
            />

            <h2 className="mt-4 text-lg font-semibold">
              Target Job Role
            </h2>

            {resumeData?.target_role ? (
              <>
                <p className="mt-3 text-xl font-bold text-violet-300">
                  {resumeData.target_role}
                </p>

                <p className="mt-2 text-sm text-zinc-400">
                  Your highest-scoring job role based on your latest resume analysis.
                </p>
              </>
            ) : (
              <p className="mt-2 text-sm text-zinc-400">
                Upload your resume to discover your best-matching job role.
              </p>
            )}

          </div>
        </div>

        {/* Career Tools */}
        <h2 className="mt-12 text-xl font-bold">
          Your career tools
        </h2>

        <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">

          {/* 1. Resume Analysis */}
          <DashboardCard
            icon={<FileText size={24} />}
            title="Resume Analysis"
            description="Upload your resume and extract your skills."
            action="Upload resume"
            onClick={() => router.push("/resume")}
          />

          {/* 2. Skill Gap Tracker */}
          <DashboardCard
            icon={<Target size={24} />}
            title="Skill Gap Tracker"
            description="Track your completed skills across all 9 job roles."
            action="Track skills"
            onClick={() => router.push("/skills")}
          />

          {/* 3. Learning Roadmap */}
          <DashboardCard
            icon={<GraduationCap size={24} />}
            title="Learning Roadmap"
            description="View your personalized 4-week learning plans for each job role."
            action="View roadmap"
            onClick={() => router.push("/resume")}
          />

          {/* 4. AI Mock Interview */}
          <DashboardCard
            icon={<MessageSquare size={24} />}
            title="AI Mock Interview"
            description="Practice technical interviews with AI-generated questions and personalized feedback."
            action="Start interview"
            onClick={() => router.push("/mock-interview")}
          />

          {/* 5. Interview History */}
          <DashboardCard
            icon={<History size={24} />}
            title="Interview History"
            description="Review previous interviews, scores, performance, and AI feedback."
            action="View history"
            onClick={() => router.push("/interview-history")}
          />

          {/* 6. Performance Analytics */}
          <DashboardCard
            icon={<BarChart3 size={24} />}
            title="Performance Analytics"
            description="Track your interview scores, average performance, and improvement over time."
            action="View analytics"
            onClick={() => router.push("/analytics")}
          />

          {/* 7. AI Career Recommendations */}
          <DashboardCard
            icon={<Sparkles size={24} />}
            title="AI Career Recommendations"
            description="Get personalized career advice, prioritized skill improvements, learning plans, and project suggestions powered by Gemini."
            action="Get recommendations"
            onClick={() => router.push("/career-recommendations")}
          />

          {/* 8. Saved Career Plans */}
          <DashboardCard
            icon={<BookmarkCheck size={24} />}
            title="Saved Career Plans"
            description="Revisit your previous AI career recommendations and saved learning plans."
            action="View saved plans"
            onClick={() => router.push("/saved-career-plans")}
          />

        </div>
      </div>
    </main>
  );
}

// Reusable Dashboard Card
function DashboardCard({
  icon,
  title,
  description,
  action,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action: string;
  onClick: () => void;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-[#111114] p-6 transition hover:border-violet-500/40">

      <div className="inline-flex rounded-xl bg-violet-500/10 p-3 text-violet-400">
        {icon}
      </div>

      <h3 className="mt-5 text-lg font-semibold">
        {title}
      </h3>

      <p className="mt-2 min-h-12 text-sm leading-6 text-zinc-400">
        {description}
      </p>

      <button
        onClick={onClick}
        className="mt-5 flex items-center gap-2 text-sm font-semibold text-violet-400 hover:text-violet-300"
      >
        {action}
        <ArrowRight size={16} />
      </button>

    </div>
  );
}
