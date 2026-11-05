
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BrainCircuit,
  BriefcaseBusiness,
  CheckCircle2,
  Circle,
  Loader2,
  Trophy,
  Target,
  Lightbulb,
  TrendingUp,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

const ROLES = [
  "Software Engineer",
  "Frontend Developer",
  "Backend Developer",
  "Full-Stack Developer",
  "AI/ML Engineer",
  "Data Analyst",
  "Python Developer",
  "Java Developer",
  "Cloud/DevOps Engineer",
];

type Question = {
  id: number;
  question: string;
  topic: string;
  difficulty: "Easy" | "Medium" | "Hard";
};

type Evaluation = {
  overallScore: number;
  performance: string;
  summary: string;
  strengths: string[];
  improvements: string[];
  results: {
    question: string;
    answer: string;
    score: number;
    feedback: string;
    idealAnswer: string;
  }[];
};

export default function MockInterviewPage() {
  const [role, setRole] = useState(ROLES[0]);
  const [userId, setUserId] = useState("");
  const [resumeSummary, setResumeSummary] = useState<any>(null);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);

  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saveMessage, setSaveMessage] = useState("");

  // Load logged-in user and latest resume analysis
  useEffect(() => {
    async function loadData() {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        setError("Please log in to use the mock interview.");
        return;
      }

      setUserId(user.id);

      const { data, error: resumeError } = await supabase
        .from("resume_analyses")
        .select("analysis")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (resumeError) {
        console.error("Resume loading error:", resumeError);
        return;
      }

      if (data?.analysis) {
        setResumeSummary(data.analysis);
      }
    }

    loadData();
  }, []);

  // Generate interview questions
  async function startInterview() {
    setLoading(true);
    setError("");
    setSaveMessage("");
    setEvaluation(null);
    setQuestions([]);
    setAnswers([]);
    setCurrentQuestion(0);

    try {
      const roleAnalysis = resumeSummary?.roleAnalysis?.find(
        (item: any) => item.role === role
      );

      const response = await fetch("/api/mock-interview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "generate",
          role,
          resumeSummary: resumeSummary
            ? {
                candidateName: resumeSummary.candidateName,
                summary: resumeSummary.summary,
                technicalSkills: resumeSummary.technicalSkills,
                projects: resumeSummary.projects,
                roleAnalysis,
              }
            : null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not generate questions.");
      }

      setQuestions(data.questions);
      setAnswers(data.questions.map(() => ""));
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  // Update an answer
  function updateAnswer(value: string) {
    setAnswers((previous) =>
      previous.map((answer, index) =>
        index === currentQuestion ? value : answer
      )
    );
  }

  // Evaluate answers and save interview
  async function submitInterview() {
    if (!userId) {
      setError("Please log in again.");
      return;
    }

    if (answers.some((answer) => !answer.trim())) {
      setError("Please answer all 5 questions before submitting.");
      return;
    }

    setLoading(true);
    setError("");
    setSaveMessage("");

    try {
      const response = await fetch("/api/mock-interview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "evaluate",
          role,
          questions,
          answers,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Interview evaluation failed.");
      }

      const result: Evaluation = data.evaluation;

      setEvaluation(result);

      // Save completed interview in Supabase
      setSaving(true);

      const { error: saveError } = await supabase
        .from("mock_interviews")
        .insert({
          user_id: userId,
          role,
          questions,
          answers,
          overall_score: result.overallScore,
          feedback: result,
        });

      if (saveError) {
        console.error("Interview save error:", saveError);
        setSaveMessage(
          "Evaluation completed, but saving to Supabase failed: " +
            saveError.message
        );
      } else {
        setSaveMessage("Interview evaluation saved successfully.");
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
      setSaving(false);
    }
  }

  function restartInterview() {
    setQuestions([]);
    setAnswers([]);
    setCurrentQuestion(0);
    setEvaluation(null);
    setError("");
    setSaveMessage("");
  }

  const answeredCount = answers.filter((answer) =>
    answer.trim()
  ).length;

  return (
    <main className="min-h-screen bg-[#0B1220] px-4 py-8 text-slate-100 sm:px-8">
      <div className="mx-auto max-w-5xl">

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
              <BrainCircuit size={28} className="text-blue-400" />
            </div>

            <div>
              <p className="mb-1 text-sm font-semibold uppercase tracking-widest text-blue-400">
                SkillSync AI
              </p>

              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                AI Mock Interview
              </h1>
            </div>
          </div>

          <p className="mt-3 max-w-2xl leading-7 text-slate-400">
            Practice technical interviews, get evaluated, and improve
            your job readiness with AI-powered feedback.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* Role selection */}
        {!evaluation && (
          <section className="mb-6 rounded-2xl border border-slate-700/70 bg-[#111C30] p-6 shadow-xl shadow-black/10">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-lg bg-blue-500/10 p-2">
                <BriefcaseBusiness className="text-blue-400" size={22} />
              </div>

              <div>
                <h2 className="text-xl font-semibold">
                  Choose your interview role
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  Select the position you want to prepare for.
                </p>
              </div>
            </div>

            <select
              value={role}
              onChange={(e) => {
                setRole(e.target.value);
                restartInterview();
              }}
              disabled={loading || questions.length > 0}
              className="w-full rounded-xl border border-slate-700 bg-[#0B1220] p-3 text-white outline-none transition focus:border-blue-500 disabled:opacity-60"
            >
              {ROLES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            {resumeSummary ? (
              <p className="mt-4 flex items-center gap-2 text-sm text-green-400">
                <CheckCircle2 size={17} />
                Latest resume analysis connected.
              </p>
            ) : (
              <p className="mt-4 text-sm text-amber-400">
                No resume analysis found. Questions will be generated
                using the selected role only.
              </p>
            )}

            {questions.length === 0 && (
              <button
                onClick={startInterview}
                disabled={loading}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Generating questions...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    Start Interview
                  </>
                )}
              </button>
            )}
          </section>
        )}

        {/* Interview questions */}
        {questions.length > 0 && !evaluation && (
          <section className="rounded-2xl border border-slate-700/70 bg-[#111C30] p-6 shadow-xl shadow-black/10">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-blue-400">
                  Live Practice Session
                </p>

                <h2 className="mt-1 text-xl font-semibold">
                  {role}
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  Question {currentQuestion + 1} of {questions.length}
                </p>
              </div>

              <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-sm font-medium text-blue-300">
                {answeredCount}/5 answered
              </span>
            </div>

            <div className="mb-6 h-2 overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-blue-500 transition-all"
                style={{
                  width: `${((currentQuestion + 1) / questions.length) * 100}%`,
                }}
              />
            </div>

            <div className="mb-5 flex flex-wrap gap-2">
              <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs text-blue-300">
                {questions[currentQuestion].topic}
              </span>

              <span className="rounded-full border border-slate-700 bg-slate-800 px-3 py-1 text-xs text-slate-300">
                {questions[currentQuestion].difficulty}
              </span>
            </div>

            <div className="mb-5 rounded-xl border border-slate-700/60 bg-[#0B1220]/70 p-5">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-blue-400">
                Question {currentQuestion + 1}
              </p>

              <h3 className="text-lg font-semibold leading-relaxed">
                {questions[currentQuestion].question}
              </h3>
            </div>

            <textarea
              value={answers[currentQuestion] || ""}
              onChange={(e) => updateAnswer(e.target.value)}
              placeholder="Write your answer here..."
              rows={7}
              className="w-full resize-y rounded-xl border border-slate-700 bg-[#0B1220] p-4 text-white outline-none placeholder:text-slate-500 transition focus:border-blue-500"
            />

            <div className="mt-6 flex flex-wrap justify-between gap-3">
              <button
                onClick={() =>
                  setCurrentQuestion((previous) =>
                    Math.max(0, previous - 1)
                  )
                }
                disabled={currentQuestion === 0 || loading}
                className="rounded-xl border border-slate-700 px-5 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-800 disabled:opacity-40"
              >
                Previous
              </button>

              {currentQuestion < questions.length - 1 ? (
                <button
                  onClick={() =>
                    setCurrentQuestion((previous) => previous + 1)
                  }
                  disabled={loading}
                  className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50"
                >
                  Next Question
                </button>
              ) : (
                <button
                  onClick={submitInterview}
                  disabled={loading || answeredCount !== 5}
                  className="rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="mr-2 inline animate-spin" />
                      Evaluating answers...
                    </>
                  ) : (
                    "Submit Interview"
                  )}
                </button>
              )}
            </div>

            <div className="mt-6 border-t border-slate-700 pt-5">
              <p className="mb-3 text-sm text-slate-400">
                Jump to a question:
              </p>

              <div className="flex flex-wrap gap-2">
                {questions.map((question, index) => (
                  <button
                    key={question.id}
                    onClick={() => setCurrentQuestion(index)}
                    className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-semibold transition ${
                      currentQuestion === index
                        ? "bg-blue-600 text-white"
                        : answers[index]?.trim()
                          ? "border border-green-500/30 bg-green-500/10 text-green-300"
                          : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                    }`}
                  >
                    {answers[index]?.trim() ? (
                      <CheckCircle2 size={17} />
                    ) : (
                      index + 1
                    )}
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Evaluation results */}
        {evaluation && (
          <div className="space-y-6">

            {/* Overall Score */}
            <section className="rounded-2xl border border-blue-500/30 bg-[#111C30] p-7 text-center shadow-xl shadow-black/10">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10">
                <Trophy size={30} className="text-blue-400" />
              </div>

              <p className="text-sm font-semibold uppercase tracking-widest text-slate-400">
                Your Interview Score
              </p>

              <div className="my-5 text-6xl font-bold text-blue-400">
                {evaluation.overallScore}%
              </div>

              <h2 className="text-xl font-semibold">
                {evaluation.performance}
              </h2>

              <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-slate-400">
                {evaluation.summary}
              </p>

              {saveMessage && (
                <p className="mt-4 text-sm text-green-400">
                  {saving ? "Saving interview..." : saveMessage}
                </p>
              )}
            </section>

            {/* Strengths and Improvements */}
            <section className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-700/70 bg-[#111C30] p-5">
                <h3 className="mb-4 flex items-center gap-2 font-semibold text-green-400">
                  <CheckCircle2 size={19} />
                  Strengths
                </h3>

                <ul className="space-y-3 text-sm text-slate-300">
                  {evaluation.strengths.map((item, index) => (
                    <li key={index}>✓ {item}</li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-slate-700/70 bg-[#111C30] p-5">
                <h3 className="mb-4 flex items-center gap-2 font-semibold text-amber-400">
                  <TrendingUp size={19} />
                  Areas to improve
                </h3>

                <ul className="space-y-3 text-sm text-slate-300">
                  {evaluation.improvements.map((item, index) => (
                    <li key={index}>• {item}</li>
                  ))}
                </ul>
              </div>
            </section>

            {/* Question-wise Feedback */}
            <section className="space-y-4">
              <h2 className="text-xl font-bold">
                Question-wise feedback
              </h2>

              {evaluation.results.map((item, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-slate-700/70 bg-[#111C30] p-5"
                >
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <h3 className="font-semibold leading-relaxed">
                      Q{index + 1}. {item.question}
                    </h3>

                    <span className="shrink-0 rounded-lg border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-sm font-bold text-blue-300">
                      {item.score}/10
                    </span>
                  </div>

                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Your answer
                  </p>

                  <p className="mb-5 whitespace-pre-wrap text-sm leading-relaxed text-slate-300">
                    {item.answer || "No answer provided."}
                  </p>

                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    AI feedback
                  </p>

                  <p className="mb-5 text-sm leading-relaxed text-slate-300">
                    {item.feedback}
                  </p>

                  <div className="rounded-xl border border-blue-500/10 bg-[#0B1220] p-4">
                    <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-400">
                      <Lightbulb size={15} />
                      Example ideal answer
                    </p>

                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-300">
                      {item.idealAnswer}
                    </p>
                  </div>
                </div>
              ))}
            </section>

            <button
              onClick={restartInterview}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 font-semibold text-white transition hover:bg-blue-500"
            >
              <RotateCcw size={18} />
              Start Another Interview
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
