
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Target,
  CheckCircle2,
  Circle,
  Loader2,
  BookOpen,
  Trophy,
  BrainCircuit,
  AlertCircle,
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

type ResumeAnalysis = {
  roleAnalysis: RoleAnalysis[];
};

type ProgressRow = {
  role: string;
  skill: string;
  is_completed: boolean;
};

type RoleProgress = {
  role: string;
  score: number;
  readiness: string;
  matchingSkills: string[];
  missingSkills: string[];
  recommendations: string[];
};

export default function SkillsPage() {
  const [roles, setRoles] = useState<RoleProgress[]>([]);
  const [selectedRole, setSelectedRole] = useState("");
  const [completedSkills, setCompletedSkills] = useState<
    Record<string, boolean>
  >({});

  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingSkill, setSavingSkill] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Load latest resume analysis and saved skill progress
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError("");

      try {
        // Get logged-in user
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          setError("Please log in to use the Skill Gap Tracker.");
          return;
        }

        setUserId(user.id);

        // Fetch latest resume analysis
        const { data: resumeData, error: resumeError } =
          await supabase
            .from("resume_analyses")
            .select("analysis, created_at")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

        if (resumeError) {
          throw new Error(
            "Unable to load resume analysis: " +
              resumeError.message
          );
        }

        if (!resumeData) {
          setRoles([]);
          return;
        }

        const analysis = resumeData.analysis as ResumeAnalysis;

        if (!Array.isArray(analysis?.roleAnalysis)) {
          throw new Error(
            "Your saved resume analysis does not contain job-role data. Please analyze your resume again."
          );
        }

        // Build role data from actual AI analysis
        const roleData: RoleProgress[] =
          analysis.roleAnalysis.map((item) => ({
            role: item.role,
            score:
              typeof item.score === "number" &&
              Number.isFinite(item.score)
                ? Math.min(100, Math.max(0, item.score))
                : 0,
            readiness: item.readiness || "Not specified",
            matchingSkills: Array.isArray(item.matchingSkills)
              ? item.matchingSkills.filter(
                  (skill): skill is string =>
                    typeof skill === "string"
                )
              : [],
            missingSkills: Array.isArray(item.missingSkills)
              ? item.missingSkills.filter(
                  (skill): skill is string =>
                    typeof skill === "string"
                )
              : [],
            recommendations: Array.isArray(item.recommendations)
              ? item.recommendations.filter(
                  (skill): skill is string =>
                    typeof skill === "string"
                )
              : [],
          }));

        setRoles(roleData);

        if (roleData.length > 0) {
          setSelectedRole(roleData[0].role);
        }

        // Fetch saved completion progress
        const { data: progressData, error: progressError } =
          await supabase
            .from("user_skill_progress")
            .select("role, skill, is_completed")
            .eq("user_id", user.id);

        if (progressError) {
          throw new Error(
            "Unable to load saved skill progress: " +
              progressError.message
          );
        }

        const savedProgress: Record<string, boolean> = {};

        (progressData as ProgressRow[] | null)?.forEach(
          (item) => {
            savedProgress[`${item.role}::${item.skill}`] =
              item.is_completed;
          }
        );

        setCompletedSkills(savedProgress);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong while loading your skills."
        );
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const currentRole = roles.find(
    (item) => item.role === selectedRole
  );

  const skills = currentRole?.missingSkills ?? [];
  const matchingSkills = currentRole?.matchingSkills ?? [];

  // Calculate selected role progress
  const completedCount = useMemo(
    () =>
      skills.filter(
        (skill) =>
          completedSkills[`${selectedRole}::${skill}`]
      ).length,
    [skills, selectedRole, completedSkills]
  );

  const progressPercentage =
    skills.length > 0
      ? Math.round((completedCount / skills.length) * 100)
      : 0;

  // Calculate progress across all roles
  const allRoleProgress = roles.map((role) => {
    const completed = role.missingSkills.filter(
      (skill) => completedSkills[`${role.role}::${skill}`]
    ).length;

    const total = role.missingSkills.length;

    return {
      ...role,
      completed,
      total,
      percentage:
        total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  });

  const totalSkills = allRoleProgress.reduce(
    (total, item) => total + item.total,
    0
  );

  const totalCompleted = allRoleProgress.reduce(
    (total, item) => total + item.completed,
    0
  );

  const overallProgress =
    totalSkills > 0
      ? Math.round((totalCompleted / totalSkills) * 100)
      : 0;

  // Save skill completion in Supabase
  async function toggleSkill(skill: string) {
    if (!userId || !selectedRole) {
      setError("Please log in before updating your skills.");
      return;
    }

    const key = `${selectedRole}::${skill}`;
    const newStatus = !completedSkills[key];

    setSavingSkill(key);
    setError("");
    setMessage("");

    const { error: saveError } = await supabase
      .from("user_skill_progress")
      .upsert(
        {
          user_id: userId,
          role: selectedRole,
          skill,
          is_completed: newStatus,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id,role,skill",
        }
      );

    if (saveError) {
      setError("Unable to save skill: " + saveError.message);
      setSavingSkill(null);
      return;
    }

    setCompletedSkills((previous) => ({
      ...previous,
      [key]: newStatus,
    }));

    setMessage(
      newStatus
        ? `${skill} marked as completed!`
        : `${skill} marked as incomplete.`
    );

    setSavingSkill(null);
  }

  return (
    <main className="min-h-screen bg-[#0B1220] text-slate-100">
      <div className="mx-auto max-w-6xl px-5 py-8">

        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="mb-6 inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-blue-400"
          >
            <ArrowLeft size={17} />
            Back to Dashboard
          </Link>

          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-3">
              <Target className="text-blue-400" size={28} />
            </div>

            <div>
              <p className="text-sm font-semibold tracking-wider text-blue-400">
                SKILLSYNC AI
              </p>
              <h1 className="text-3xl font-bold tracking-tight">
                AI Skill Gap Tracker
              </h1>

              <p className="mt-1 text-slate-400">
                Discover your missing skills using your actual resume analysis.
              </p>
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center gap-3 rounded-xl border border-slate-700/70 bg-[#111C30] p-6 text-slate-300">
            <Loader2 className="animate-spin text-blue-400" />
            Loading your AI skill analysis...
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">
            <AlertCircle className="mt-0.5 shrink-0" size={20} />
            <p>{error}</p>
          </div>
        )}

        {/* No resume */}
        {!loading && !error && roles.length === 0 && (
          <section className="rounded-2xl border border-slate-700/70 bg-[#111C30] p-8 text-center">
            <BrainCircuit
              size={42}
              className="mx-auto text-blue-400"
            />

            <h2 className="mt-4 text-xl font-bold">
              Resume Analysis Required
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              Upload your resume first. SkillSync will identify matching and missing skills for all 9 job roles.
            </p>

            <Link
              href="/resume"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-500"
            >
              Analyze My Resume
            </Link>
          </section>
        )}

        {!loading && !error && roles.length > 0 && (
          <>
            {/* Overall Progress */}
            <section className="mb-8 grid gap-5 md:grid-cols-3">

              <div className="rounded-2xl border border-slate-700/70 bg-[#111C30] p-6 md:col-span-2">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">
                      Missing Skills Completion
                    </p>

                    <h2 className="mt-1 text-3xl font-bold">
                      {overallProgress}%
                    </h2>
                  </div>

                  <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-3">
                    <Trophy
                      className="text-blue-400"
                      size={28}
                    />
                  </div>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-blue-500 transition-all"
                    style={{ width: `${overallProgress}%` }}
                  />
                </div>

                <p className="mt-3 text-sm text-slate-400">
                  {totalCompleted} of {totalSkills} missing skills completed across {roles.length} job roles.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-700/70 bg-[#111C30] p-6">
                <BookOpen
                  className="mb-3 text-blue-400"
                  size={26}
                />

                <p className="text-sm text-slate-400">
                  Analyzed Job Roles
                </p>

                <h2 className="mt-1 text-3xl font-bold">
                  {roles.length}
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Retrieved from your latest resume
                </p>
              </div>
            </section>

            {/* Role Selector */}
            <section className="mb-8">
              <h2 className="mb-4 text-xl font-semibold">
                Select Job Role
              </h2>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {allRoleProgress.map((item) => (
                  <button
                    key={item.role}
                    onClick={() => {
                      setSelectedRole(item.role);
                      setMessage("");
                    }}
                    className={`rounded-xl border p-4 text-left transition ${
                      selectedRole === item.role
                        ? "border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/5"
                        : "border-slate-700/70 bg-[#111C30] hover:border-blue-500/50"
                    }`}
                  >
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <span className="font-semibold">
                        {item.role}
                      </span>

                      <span className="text-sm font-bold text-blue-300">
                        {item.score}/100
                      </span>
                    </div>

                    <div className="mb-3 h-2 overflow-hidden rounded-full bg-slate-800">
                      <div
                        className="h-full rounded-full bg-blue-500"
                        style={{ width: `${item.score}%` }}
                      />
                    </div>

                    <p className="text-xs text-slate-400">
                      {item.completed}/{item.total} missing skills completed
                    </p>
                  </button>
                ))}
              </div>
            </section>

            {/* Selected Role */}
            {currentRole && (
              <section className="rounded-2xl border border-slate-700/70 bg-[#111C30] p-6">

                <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold tracking-wider text-blue-400">
                      AI RESUME ANALYSIS
                    </p>

                    <h2 className="mt-1 text-2xl font-bold">
                      {currentRole.role}
                    </h2>

                    <p className="mt-2 text-sm text-slate-400">
                      Resume readiness:{" "}
                      <span className="font-semibold text-blue-300">
                        {currentRole.score}/100
                      </span>
                      {" · "}
                      {currentRole.readiness}
                    </p>
                  </div>

                  <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 px-4 py-3 text-center">
                    <p className="text-2xl font-bold text-blue-300">
                      {progressPercentage}%
                    </p>

                    <p className="text-xs text-slate-400">
                      Missing skills completed
                    </p>
                  </div>
                </div>

                {/* Matching Skills */}
                <div className="mb-7">
                  <h3 className="mb-3 flex items-center gap-2 font-semibold text-emerald-400">
                    <CheckCircle2 size={19} />
                    Skills Already Found in Your Resume
                  </h3>

                  {matchingSkills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {matchingSkills.map((skill, index) => (
                        <span
                          key={`${skill}-${index}`}
                          className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">
                      No matching skills identified.
                    </p>
                  )}
                </div>

                {/* Missing Skills */}
                <div>
                  <h3 className="mb-3 flex items-center gap-2 font-semibold text-red-400">
                    <Target size={19} />
                    Missing Skills — Your Learning Checklist
                  </h3>

                  <p className="mb-4 text-sm text-slate-400">
                    Learn these skills and mark them as completed when you have genuinely practiced them.
                  </p>

                  <div className="mb-6 h-3 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-blue-500 transition-all"
                      style={{
                        width: `${progressPercentage}%`,
                      }}
                    />
                  </div>

                  {skills.length > 0 ? (
                    <div className="space-y-3">
                      {skills.map((skill, index) => {
                        const key = `${selectedRole}::${skill}`;
                        const isCompleted = !!completedSkills[key];
                        const isSaving = savingSkill === key;

                        return (
                          <button
                            key={`${skill}-${index}`}
                            onClick={() => toggleSkill(skill)}
                            disabled={savingSkill !== null}
                            className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition ${
                              isCompleted
                                ? "border-emerald-500/30 bg-emerald-500/5"
                                : "border-slate-700/70 bg-[#0B1220] hover:border-blue-500/50"
                            } disabled:cursor-wait`}
                          >
                            {isSaving ? (
                              <Loader2
                                size={22}
                                className="shrink-0 animate-spin text-blue-400"
                              />
                            ) : isCompleted ? (
                              <CheckCircle2
                                size={22}
                                className="shrink-0 text-emerald-400"
                              />
                            ) : (
                              <Circle
                                size={22}
                                className="shrink-0 text-slate-500"
                              />
                            )}

                            <span className="flex-1">
                              <span
                                className={`block font-medium ${
                                  isCompleted
                                    ? "text-emerald-300 line-through"
                                    : "text-slate-200"
                                }`}
                              >
                                {skill}
                              </span>

                              <span className="mt-1 block text-xs text-slate-500">
                                Skill {index + 1} of {skills.length}
                              </span>
                            </span>

                            <span
                              className={`text-xs ${
                                isCompleted
                                  ? "text-emerald-400"
                                  : "text-slate-500"
                              }`}
                            >
                              {isCompleted
                                ? "Completed"
                                : "Mark complete"}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-center">
                      <Trophy
                        className="mx-auto mb-2 text-emerald-400"
                        size={30}
                      />

                      <h3 className="font-bold text-emerald-300">
                        No Missing Skills Listed!
                      </h3>

                      <p className="mt-2 text-sm text-slate-400">
                        Your AI analysis did not identify any missing skills for this role.
                      </p>
                    </div>
                  )}
                </div>

                {/* Recommendations */}
                {currentRole.recommendations.length > 0 && (
                  <div className="mt-7 rounded-xl border border-blue-500/20 bg-blue-500/5 p-5">
                    <h3 className="font-semibold text-blue-300">
                      AI Learning Recommendations
                    </h3>

                    <ul className="mt-3 space-y-2">
                      {currentRole.recommendations.map(
                        (item, index) => (
                          <li
                            key={`${item}-${index}`}
                            className="text-sm leading-6 text-slate-300"
                          >
                            • {item}
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                )}

                {progressPercentage === 100 &&
                  skills.length > 0 && (
                    <div className="mt-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-center">
                      <Trophy
                        className="mx-auto mb-2 text-emerald-400"
                        size={32}
                      />

                      <h3 className="text-lg font-bold text-emerald-300">
                        Missing Skills Checklist Completed!
                      </h3>

                      <p className="mt-1 text-sm text-slate-400">
                        You have marked every missing skill as completed. Make sure you can demonstrate them in practice.
                      </p>
                    </div>
                  )}

                {message && (
                  <p className="mt-4 text-sm text-emerald-400">
                    {message}
                  </p>
                )}
              </section>
            )}

            {/* Progress Across Roles */}
            <section className="mt-8 rounded-2xl border border-slate-700/70 bg-[#111C30] p-6">
              <h2 className="mb-5 text-xl font-bold">
                Your Progress Across Job Roles
              </h2>

              <div className="space-y-5">
                {allRoleProgress.map((item) => (
                  <div key={item.role}>
                    <div className="mb-2 flex justify-between gap-3 text-sm">
                      <span className="text-slate-300">
                        {item.role}
                      </span>

                      <span className="text-slate-400">
                        {item.completed}/{item.total} · {item.percentage}%
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                      <div
                        className="h-full rounded-full bg-blue-500 transition-all"
                        style={{
                          width: `${item.percentage}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Roadmap Link */}
            <div className="mt-8 rounded-2xl border border-blue-500/20 bg-blue-500/5 p-6">
              <h2 className="text-xl font-bold">
                Ready to improve your skills?
              </h2>

              <p className="mt-2 text-sm text-slate-400">
                Follow your personalized learning roadmap to work on your missing skills.
              </p>

              <Link
                href="/resume"
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"
              >
                View Learning Roadmaps
                <BookOpen size={16} />
              </Link>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
