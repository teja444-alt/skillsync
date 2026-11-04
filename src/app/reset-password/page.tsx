
"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  BrainCircuit,
  Lock,
  ArrowRight,
} from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleReset(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setMessage("");

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
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) throw error;

      setMessage("Password updated successfully!");

      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to reset password. Request a new reset link."
      );
    } finally {
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
            Create a new password
          </h1>

          <p className="mt-2 text-sm text-zinc-400">
            Enter and confirm your new password.
          </p>

          <form onSubmit={handleReset} className="mt-7 space-y-4">

            <div>
              <label className="mb-2 block text-sm text-zinc-300">
                New password
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

            <div>
              <label className="mb-2 block text-sm text-zinc-300">
                Confirm new password
              </label>

              <div className="flex items-center gap-3 rounded-xl border border-zinc-700 px-4 focus-within:border-violet-500">
                <Lock size={18} className="text-zinc-500" />

                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Enter password again"
                  className="w-full bg-transparent py-3 text-sm outline-none"
                />
              </div>
            </div>

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
              {loading ? "Updating..." : "Update password"}

              {!loading && <ArrowRight size={18} />}
            </button>

          </form>

        </div>
      </div>
    </main>
  );
}
