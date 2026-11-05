
"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  BrainCircuit,
  Mail,
  Lock,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

type AuthMode = "login" | "signup" | "forgot";

export default function LoginPage() {
  const [mode, setMode] = useState<AuthMode>("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function changeMode(nextMode: AuthMode) {
    setMode(nextMode);
    setError("");
    setMessage("");
    setPassword("");
  }

  // EMAIL AUTHENTICATION
  async function handleEmailAuth(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (loading) return;

    setLoading(true);
    setError("");
    setMessage("");

    const cleanEmail = email.trim();

    try {
      // FORGOT PASSWORD
      if (mode === "forgot") {
        const { error } =
          await supabase.auth.resetPasswordForEmail(cleanEmail, {
            redirectTo: `${window.location.origin}/reset-password`,
          });

        if (error) throw error;

        setMessage(
          "If an account exists for this email, a password reset link will be sent."
        );

        return;
      }

      // SIGN UP
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/login`,
          },
        });

        if (error) throw error;

        // Signup created an authenticated session.
        if (data.session) {
          window.location.replace("/dashboard");
          return;
        }

        // No session: attempt login in case confirmation is disabled
        const {
          data: loginData,
          error: loginError,
        } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (!loginError && loginData.session) {
          window.location.replace("/dashboard");
          return;
        }

        // Email verification may be required.
        setMessage(
          "Account created successfully! Please check your email and verify your account before signing in."
        );

        return;
      }

      // LOGIN
      const { error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error) throw error;

      window.location.replace("/dashboard");
      return;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  // GOOGLE LOGIN
  async function handleGoogleLogin() {
    if (loading) return;

    setError("");
    setMessage("");
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) throw error;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Google login failed. Please try again."
      );

      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0B1220] px-4 py-12 text-slate-100 sm:px-6">

      {/* Background Decorations */}
      <div className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />

      <div className="relative z-10 w-full max-w-md">

        {/* LOGO */}
        <Link
          href="/"
          className="mb-8 flex items-center justify-center gap-3"
        >
          <div className="rounded-xl border border-blue-400/20 bg-blue-600 p-2.5 shadow-lg shadow-blue-600/20">
            <BrainCircuit size={25} className="text-white" />
          </div>

          <span className="text-2xl font-bold tracking-tight">
            Skill<span className="text-blue-400">Sync</span>
          </span>
        </Link>

        {/* AUTH CARD */}
        <div className="rounded-2xl border border-slate-700/70 bg-[#111C30]/95 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-8">

          {/* HEADING */}
          <div className="mb-7">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1.5 text-xs font-semibold text-blue-300">
              <Sparkles size={14} />
              YOUR CAREER JOURNEY STARTS HERE
            </div>

            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {mode === "signup"
                ? "Create your account"
                : mode === "forgot"
                  ? "Reset your password"
                  : "Welcome back"}
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              {mode === "signup"
                ? "Start building your career readiness profile."
                : mode === "forgot"
                  ? "Enter your email to receive a password reset link."
                  : "Sign in to continue your career journey."}
            </p>
          </div>

          {/* GOOGLE LOGIN */}
          {mode === "login" && (
            <>
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-700 bg-[#0B1220] py-3 text-sm font-semibold text-slate-200 transition hover:border-blue-500/50 hover:bg-blue-500/5 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-sm font-bold text-slate-900">
                  G
                </span>

                Continue with Google
              </button>

              <div className="my-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-slate-700" />

                <span className="text-xs font-medium tracking-wide text-slate-500">
                  OR WITH EMAIL
                </span>

                <div className="h-px flex-1 bg-slate-700" />
              </div>
            </>
          )}

          {/* AUTH FORM */}
          <form
            onSubmit={handleEmailAuth}
            className="space-y-5"
          >

            {/* EMAIL */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Email address
              </label>

              <div className="flex items-center gap-3 rounded-xl border border-slate-700 bg-[#0B1220] px-4 transition focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/10">
                <Mail size={18} className="shrink-0 text-slate-500" />

                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  disabled={loading}
                  className="w-full bg-transparent py-3.5 text-sm text-slate-100 outline-none placeholder:text-slate-600 disabled:opacity-50"
                />
              </div>
            </div>

            {/* PASSWORD */}
            {mode !== "forgot" && (
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Password
                </label>

                <div className="flex items-center gap-3 rounded-xl border border-slate-700 bg-[#0B1220] px-4 transition focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/10">
                  <Lock size={18} className="shrink-0 text-slate-500" />

                  <input
                    id="password"
                    type="password"
                    required
                    minLength={6}
                    autoComplete={
                      mode === "signup"
                        ? "new-password"
                        : "current-password"
                    }
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    disabled={loading}
                    className="w-full bg-transparent py-3.5 text-sm text-slate-100 outline-none placeholder:text-slate-600 disabled:opacity-50"
                  />
                </div>
              </div>
            )}

            {/* FORGOT PASSWORD */}
            {mode === "login" && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => changeMode("forgot")}
                  disabled={loading}
                  className="text-sm font-medium text-blue-400 transition hover:text-blue-300"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {/* ERROR */}
            {error && (
              <p
                role="alert"
                className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm leading-6 text-red-300"
              >
                {error}
              </p>
            )}

            {/* SUCCESS MESSAGE */}
            {message && (
              <p
                role="status"
                className="rounded-xl border border-green-500/20 bg-green-500/10 p-3 text-sm leading-6 text-green-300"
              >
                {message}
              </p>
            )}

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 font-semibold text-white shadow-lg shadow-blue-600/10 transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Please wait..."
                : mode === "signup"
                  ? "Create account"
                  : mode === "forgot"
                    ? "Send reset link"
                    : "Sign in"}

              {!loading && <ArrowRight size={18} />}
            </button>

          </form>

          {/* MODE SWITCH */}
          {mode === "forgot" ? (
            <button
              type="button"
              onClick={() => changeMode("login")}
              disabled={loading}
              className="mt-6 flex w-full items-center justify-center gap-2 text-sm text-slate-400 transition hover:text-blue-400"
            >
              <ArrowLeft size={16} />
              Back to sign in
            </button>
          ) : (
            <p className="mt-7 text-center text-sm text-slate-400">
              {mode === "signup"
                ? "Already have an account?"
                : "Don't have an account?"}{" "}

              <button
                type="button"
                disabled={loading}
                onClick={() =>
                  changeMode(
                    mode === "signup" ? "login" : "signup"
                  )
                }
                className="font-semibold text-blue-400 transition hover:text-blue-300 disabled:opacity-50"
              >
                {mode === "signup" ? "Sign in" : "Sign up"}
              </button>
            </p>
          )}

          {/* SECURITY NOTE */}
          <div className="mt-7 flex items-center justify-center gap-2 border-t border-slate-800 pt-5 text-xs text-slate-500">
            <ShieldCheck size={15} className="text-blue-400" />
            Your account and data are securely protected.
          </div>

        </div>

        {/* FOOTER */}
        <p className="mt-6 text-center text-xs leading-6 text-slate-500">
          By continuing, you agree to SkillSync's terms and privacy policy.
        </p>

      </div>
    </main>
  );
}
