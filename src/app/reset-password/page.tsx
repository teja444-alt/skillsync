
"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  BrainCircuit,
  Lock,
  ArrowRight,
  Loader2,
  ShieldCheck,
} from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function checkRecoverySession() {
      try {
        // Supabase automatically processes supported recovery
        // links when detectSessionInUrl is enabled.
        const { data, error } = await supabase.auth.getSession();

        if (error) throw error;

        if (!active) return;

        if (data.session) {
          setHasSession(true);
          setError("");
        } else {
          setHasSession(false);
          setError(
            "Your password reset session is missing or expired. Please request a new reset link."
          );
        }
      } catch (err) {
        if (!active) return;

        setHasSession(false);
        setError(
          err instanceof Error
            ? err.message
            : "Unable to verify your password reset link."
        );
      } finally {
        if (active) {
          setCheckingSession(false);
        }
      }
    }

    // Listen for Supabase recovery authentication events.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;

      if (
        event === "PASSWORD_RECOVERY" ||
        (event === "SIGNED_IN" && session)
      ) {
        setHasSession(true);
        setError("");
      }

      if (event === "SIGNED_OUT") {
        setHasSession(false);
      }
    });

    checkRecoverySession();

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleReset(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!hasSession) {
      setError(
        "Your recovery session is missing. Request a new password reset link."
      );
      return;
    }

    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      // Verify the current recovery session again.
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) throw sessionError;

      if (!session) {
        throw new Error(
          "Your recovery session has expired. Request a new reset link."
        );
      }

      // Update the authenticated user's password.
      const { error: updateError } =
        await supabase.auth.updateUser({
          password,
        });

      if (updateError) throw updateError;

      setMessage(
        "Your password has been updated successfully. Redirecting to login..."
      );

      setPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        router.replace("/login");
      }, 2000);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update your password."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0B1220] px-4 py-10 text-slate-100">
      <div className="w-full max-w-md">

        {/* Logo */}
        <Link
          href="/"
          className="mb-8 flex items-center justify-center gap-3"
        >
          <div className="rounded-xl bg-blue-600 p-2.5">
            <BrainCircuit size={25} />
          </div>

          <span className="text-2xl font-bold">
            Skill<span className="text-blue-400">Sync</span>
          </span>
        </Link>

        {/* Reset Card */}
        <div className="rounded-2xl border border-slate-800 bg-[#111C30] p-6 shadow-xl sm:p-8">

          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-400">
            <ShieldCheck size={28} />
          </div>

          <h1 className="text-2xl font-bold">
            Create a new password
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            Choose a new password for your SkillSync account.
          </p>

          {/* Checking Session */}
          {checkingSession ? (
            <div className="mt-7 flex items-center gap-3 rounded-xl border border-slate-700 bg-[#0B1220] p-4 text-sm text-slate-300">
              <Loader2 className="animate-spin text-blue-400" size={20} />
              Verifying your recovery link...
            </div>
          ) : hasSession ? (
            <form
              onSubmit={handleReset}
              className="mt-7 space-y-5"
            >
              {/* New Password */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  New password
                </label>

                <div className="flex items-center gap-3 rounded-xl border border-slate-700 bg-[#0B1220] px-4 transition focus-within:border-blue-500">
                  <Lock size={18} className="text-slate-500" />

                  <input
                    type="password"
                    required
                    minLength={6}
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-slate-600"
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Confirm new password
                </label>

                <div className="flex items-center gap-3 rounded-xl border border-slate-700 bg-[#0B1220] px-4 transition focus-within:border-blue-500">
                  <Lock size={18} className="text-slate-500" />

                  <input
                    type="password"
                    required
                    minLength={6}
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) =>
                      setConfirmPassword(e.target.value)
                    }
                    placeholder="Confirm new password"
                    className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-slate-600"
                  />
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
                  {error}
                </div>
              )}

              {/* Success */}
              {message && (
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-400">
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Updating password...
                  </>
                ) : (
                  <>
                    Update password
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="mt-7 space-y-4">
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm leading-6 text-red-400">
                {error || "Your recovery session is invalid or expired."}
              </div>

              <Link
                href="/login"
                className="flex w-full items-center justify-center rounded-xl bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-500"
              >
                Return to login
              </Link>
            </div>
          )}

          <div className="mt-6 border-t border-slate-800 pt-5 text-center">
            <Link
              href="/login"
              className="text-sm text-slate-400 transition hover:text-blue-400"
            >
              Back to login
            </Link>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-600">
          Secure account recovery · SkillSync
        </p>
      </div>
    </main>
  );
}
