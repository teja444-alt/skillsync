
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
} from "lucide-react";

type AuthMode = "login" | "signup" | "forgot";

interface LoginPageProps {
  initialSignup?: boolean;
}

export default function LoginPage({
  initialSignup = false,
}: LoginPageProps) {
  const [mode, setMode] = useState<AuthMode>(
    initialSignup ? "signup" : "login"
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function changeMode(nextMode: AuthMode) {
    setMode(nextMode);
    setError("");
    setMessage("");
  }

  async function handleEmailAuth(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);
    setError("");
    setMessage("");

    try {
      if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(
          email,
          {
            redirectTo: `${window.location.origin}/reset-password`,
          }
        );

        if (error) throw error;

        setMessage(
          "If an account exists for this email, a password reset link will be sent."
        );

        return;
      }

      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/login`,
          },
        });

        if (error) throw error;

        setMessage(
          "Account created successfully! Check your email if verification is required."
        );
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        window.location.href = "/dashboard";
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setError("");
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
          : "Google login failed."
      );
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#09090b] px-5 py-12 text-white">
      <div className="w-full max-w-md">

        <Link
          href="/"
          className="mb-8 flex items-center justify-center gap-2"
        >
          <div className="rounded-xl bg-violet-600 p-2">
            <BrainCircuit size={22} />
          </div>

          <span className="text-2xl font-bold">
            Skill<span className="text-violet-400">Sync</span>
          </span>
        </Link>

        <div className="rounded-2xl border border-zinc-800 bg-[#111114] p-8">

          <h1 className="text-2xl font-bold">
            {mode === "signup"
              ? "Create your account"
              : mode === "forgot"
                ? "Reset your password"
                : "Welcome back"}
          </h1>

          <p className="mt-2 text-sm text-zinc-400">
            {mode === "signup"
              ? "Start building your career readiness profile."
              : mode === "forgot"
                ? "Enter your email to receive a password reset link."
                : "Sign in to continue your career journey."}
          </p>

          {mode === "login" && (
            <>
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="mt-7 flex w-full items-center justify-center gap-3 rounded-xl border border-zinc-700 py-3 font-medium transition hover:bg-zinc-900 disabled:opacity-50"
              >
                <span className="text-lg font-bold">G</span>
                Continue with Google
              </button>

              <div className="my-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-zinc-800" />

                <span className="text-xs text-zinc-500">
                  OR WITH EMAIL
                </span>

                <div className="h-px flex-1 bg-zinc-800" />
              </div>
            </>
          )}

          <form onSubmit={handleEmailAuth} className="space-y-4">

            <div>
              <label className="mb-2 block text-sm text-zinc-300">
                Email address
              </label>

              <div className="flex items-center gap-3 rounded-xl border border-zinc-700 px-4 focus-within:border-violet-500">
                <Mail size={18} className="text-zinc-500" />

                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-transparent py-3 text-sm outline-none"
                />
              </div>
            </div>

            {mode !== "forgot" && (
              <div>
                <label className="mb-2 block text-sm text-zinc-300">
                  Password
                </label>

                <div className="flex items-center gap-3 rounded-xl border border-zinc-700 px-4 focus-within:border-violet-500">
                  <Lock size={18} className="text-zinc-500" />

                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full bg-transparent py-3 text-sm outline-none"
                  />
                </div>
              </div>
            )}

            {mode === "login" && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => changeMode("forgot")}
                  className="text-sm text-violet-400 hover:text-violet-300"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {error && (
              <p className="rounded-lg bg-red-500/10 p-3 text-sm text-red-400">
                {error}
              </p>
            )}

            {message && (
              <p className="rounded-lg bg-green-500/10 p-3 text-sm text-green-400">
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 py-3 font-semibold transition hover:bg-violet-500 disabled:opacity-50"
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

          {mode === "forgot" ? (
            <button
              type="button"
              onClick={() => changeMode("login")}
              className="mt-6 flex w-full items-center justify-center gap-2 text-sm text-zinc-400 hover:text-white"
            >
              <ArrowLeft size={16} />
              Back to sign in
            </button>
          ) : (
            <p className="mt-6 text-center text-sm text-zinc-400">
              {mode === "signup"
                ? "Already have an account?"
                : "Don't have an account?"}{" "}

              <button
                type="button"
                onClick={() =>
                  changeMode(
                    mode === "signup" ? "login" : "signup"
                  )
                }
                className="font-semibold text-violet-400 hover:text-violet-300"
              >
                {mode === "signup" ? "Sign in" : "Sign up"}
              </button>
            </p>
          )}

        </div>

        <p className="mt-6 text-center text-xs text-zinc-600">
          By continuing, you agree to SkillSync's terms and privacy policy.
        </p>

      </div>
    </main>
  );
}
