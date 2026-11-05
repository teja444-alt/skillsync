
import type { ReactNode } from "react";
import {
  ArrowRight,
  BrainCircuit,
  BriefcaseBusiness,
  CheckCircle2,
  FileText,
  GraduationCap,
  Target,
  TrendingUp,
  Zap,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#0B1220] text-slate-100">

      {/* NAVIGATION */}
      <nav className="sticky top-0 z-50 border-b border-slate-800/80 bg-[#0B1220]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

          <a href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-600/20">
              <BrainCircuit size={22} className="text-white" />
            </div>

            <span className="text-xl font-bold tracking-tight">
              Skill<span className="text-blue-400">Sync</span>
              <span className="ml-1 text-xs font-medium text-slate-500">
                AI
              </span>
            </span>
          </a>

          <div className="hidden items-center gap-9 text-sm font-medium text-slate-400 md:flex">
            <a href="#features" className="transition hover:text-blue-400">
              Features
            </a>

            <a href="#how-it-works" className="transition hover:text-blue-400">
              How it works
            </a>
          </div>

          <a
            href="/login"
            className="rounded-xl border border-slate-700 bg-[#111C30] px-5 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-blue-500 hover:bg-blue-500/10 hover:text-white"
          >
            Sign in
          </a>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative mx-auto grid max-w-7xl items-center gap-16 px-6 py-20 md:grid-cols-2 md:py-28">

        <div className="pointer-events-none absolute -left-40 top-20 h-96 w-96 rounded-full bg-blue-600/10 blur-[130px]" />

        <div className="relative z-10">

          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-300">
            <Sparkles size={16} />
            AI-powered job readiness
          </div>

          <h1 className="text-5xl font-bold leading-[1.15] tracking-tight sm:text-6xl lg:text-7xl">
            Your skills.
            <br />
            Your future.
            <br />
            <span className="text-blue-400">
              Your next job.
            </span>
          </h1>

          <p className="mt-7 max-w-xl text-base leading-8 text-slate-400 sm:text-lg">
            Discover the skills employers are looking for, identify your skill
            gaps, and build a personalized roadmap to become placement-ready.
          </p>

          <div className="mt-9 flex flex-wrap gap-4">

            <a
              href="/signup"
              className="group inline-flex items-center gap-2 rounded-xl bg-blue-600 px-7 py-4 font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-500 hover:shadow-blue-500/30"
            >
              Get started free

              <ArrowRight
                size={19}
                className="transition-transform group-hover:translate-x-1"
              />
            </a>

            <a
              href="#how-it-works"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-[#111C30] px-7 py-4 font-semibold text-slate-200 transition hover:border-blue-500/60 hover:bg-blue-500/5"
            >
              Explore how it works
            </a>

          </div>

          <div className="mt-9 flex flex-wrap items-center gap-3 text-sm text-slate-400">
            <CheckCircle2 size={17} className="text-emerald-400" />
            Built for students and job seekers
          </div>

          <div className="mt-10 flex flex-wrap gap-8 border-t border-slate-800 pt-7">
            <div>
              <p className="text-xl font-bold text-white">AI</p>
              <p className="mt-1 text-xs text-slate-500">
                Powered insights
              </p>
            </div>

            <div>
              <p className="text-xl font-bold text-white">6+</p>
              <p className="mt-1 text-xs text-slate-500">
                Career tools
              </p>
            </div>

            <div>
              <p className="text-xl font-bold text-white">4-Step</p>
              <p className="mt-1 text-xs text-slate-500">
                Career preparation
              </p>
            </div>
          </div>
        </div>

        {/* DASHBOARD PREVIEW */}
        <div className="relative">

          <div className="pointer-events-none absolute -inset-8 rounded-full bg-blue-600/10 blur-[100px]" />

          <div className="relative rounded-2xl border border-slate-700/80 bg-[#111C30] p-5 shadow-2xl shadow-black/30 sm:p-7">

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">
                  Your readiness overview
                </p>

                <h2 className="mt-1 text-xl font-bold text-white">
                  Job readiness score
                </h2>
              </div>

              <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-3 text-blue-400">
                <TrendingUp size={23} />
              </div>
            </div>

            
{/* SCORE */}
<div className="my-9 flex flex-wrap items-center gap-6 sm:flex-nowrap">

  {/* CIRCULAR PROGRESS */}
  <div
    className="relative flex h-32 w-32 shrink-0 items-center justify-center rounded-full p-[9px]"
    style={{
      background:
        "conic-gradient(#3B82F6 0deg 259.2deg, #334155 259.2deg 360deg)",
    }}
  >
    <div className="flex h-full w-full items-center justify-center rounded-full bg-[#111C30]">
      <div className="flex items-baseline">
        <span className="text-4xl font-bold tracking-tight text-white">
          72
        </span>
        <span className="text-base font-semibold text-slate-400">
          %
        </span>
      </div>
    </div>
  </div>

  {/* SCORE DESCRIPTION */}
  <div className="min-w-0">
    <p className="font-semibold text-emerald-400">
      Good progress!
    </p>

    <p className="mt-2 text-sm leading-6 text-slate-400">
      Improve a few key skills to strengthen your placement profile.
    </p>
  </div>

</div>


            {/* SKILL PROGRESS */}
            <div className="space-y-5">
              <SkillBar label="JavaScript" score={90} />
              <SkillBar label="React" score={75} />
              <SkillBar label="SQL" score={65} />
              <SkillBar label="Data Structures" score={45} />
            </div>

            {/* STATISTICS */}
            <div className="mt-7 grid grid-cols-2 gap-4">

              <div className="rounded-xl border border-slate-700/70 bg-[#0B1220] p-4">
                <p className="text-sm text-slate-400">
                  Matching skills
                </p>

                <p className="mt-2 text-2xl font-bold text-white">
                  12
                </p>
              </div>

              <div className="rounded-xl border border-slate-700/70 bg-[#0B1220] p-4">
                <p className="text-sm text-slate-400">
                  Skills to improve
                </p>

                <p className="mt-2 text-2xl font-bold text-amber-400">
                  5
                </p>
              </div>

            </div>

            <div className="mt-5 flex items-center gap-2 rounded-lg bg-blue-500/5 px-3 py-2.5">
              <ShieldCheck size={15} className="text-blue-400" />

              <p className="text-xs text-slate-500">
                Preview only — sample data, not a real analysis.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section
        id="features"
        className="border-y border-slate-800 bg-[#0D1728]"
      >
        <div className="mx-auto max-w-7xl px-6 py-24">

          <div className="mx-auto max-w-2xl text-center">

            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-blue-400">
              <Zap size={14} />
              Everything you need
            </div>

            <h2 className="mt-6 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Turn your skills into opportunities
            </h2>

            <p className="mt-5 leading-7 text-slate-400">
              A smarter way to understand your strengths and prepare for your
              dream job.
            </p>

          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

            <FeatureCard
              icon={<FileText size={24} />}
              title="Resume Analysis"
              description="Upload your resume and extract your skills, experience, and technical strengths."
            />

            <FeatureCard
              icon={<Target size={24} />}
              title="Skill Gap Detection"
              description="Compare your current skills with the requirements of your target job role."
            />

            <FeatureCard
              icon={<GraduationCap size={24} />}
              title="Personalized Roadmap"
              description="Get a structured learning roadmap to help you improve the skills you are missing."
            />

            <FeatureCard
              icon={<BrainCircuit size={24} />}
              title="AI-Powered Insights"
              description="Receive intelligent recommendations based on your profile and career goals."
            />

            <FeatureCard
              icon={<BriefcaseBusiness size={24} />}
              title="Job Role Matching"
              description="Explore how your skills align with roles such as frontend developer or software engineer."
            />

            <FeatureCard
              icon={<TrendingUp size={24} />}
              title="Progress Tracking"
              description="Track your learning progress and update your readiness as you gain new skills."
            />

          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section
        id="how-it-works"
        className="mx-auto max-w-7xl px-6 py-24"
      >

        <div className="mx-auto max-w-2xl text-center">

          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-blue-400">
            <Sparkles size={14} />
            Simple process
          </div>

          <h2 className="mt-6 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Your journey to placement readiness
          </h2>

          <p className="mt-4 leading-7 text-slate-400">
            Three simple steps to understand your skills and prepare for your
            next opportunity.
          </p>

        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">

          <StepCard
            number="01"
            title="Upload your resume"
            description="Start by sharing your resume and selecting your target job role."
          />

          <StepCard
            number="02"
            title="Analyze your skills"
            description="SkillSync evaluates your profile and identifies areas to improve."
          />

          <StepCard
            number="03"
            title="Follow your roadmap"
            description="Use your personalized roadmap to prepare for placement opportunities."
          />

        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="px-6 pb-24">

        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl border border-blue-500/20 bg-[#111C30] px-8 py-16 text-center sm:px-12">

          <div className="pointer-events-none absolute -left-20 -top-32 h-72 w-72 rounded-full bg-blue-600/15 blur-[100px]" />

          <div className="pointer-events-none absolute -bottom-32 -right-20 h-72 w-72 rounded-full bg-blue-500/10 blur-[100px]" />

          <div className="relative z-10">

            <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10 text-blue-400">
              <BrainCircuit size={28} />
            </div>

            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to understand your skill gaps?
            </h2>

            <p className="mx-auto mt-5 max-w-xl leading-7 text-slate-400">
              Start building a clearer path from your current skills to your
              next career opportunity.
            </p>

            <a
              href="/signup"
              className="group mt-9 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-7 py-4 font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-500"
            >
              Start your journey

              <ArrowRight
                size={18}
                className="transition-transform group-hover:translate-x-1"
              />
            </a>

          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-800 bg-[#09111E] px-6 py-9">

        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 md:flex-row">

          <a href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
              <BrainCircuit size={18} className="text-white" />
            </div>

            <span className="font-bold">
              Skill<span className="text-blue-400">Sync</span>
            </span>
          </a>

          <p className="text-center text-xs text-slate-500">
            © 2026 SkillSync. Built for your career journey.
          </p>

          <p className="text-center text-xs text-slate-500">
            AI-Powered Job Readiness & Skill Gap Analyzer
          </p>

        </div>
      </footer>

    </main>
  );
}

// SKILL PROGRESS BAR
function SkillBar({
  label,
  score,
}: {
  label: string;
  score: number;
}) {
  return (
    <div>
      <div className="mb-2 flex justify-between text-sm">
        <span className="font-medium text-slate-300">{label}</span>
        <span className="text-slate-400">{score}%</span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-slate-800">
        <div
          className="h-full rounded-full bg-blue-500 transition-all duration-500"
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

// FEATURE CARD
function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-[#111C30] p-7 transition duration-300 hover:-translate-y-1 hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-950/20">

      <div className="mb-6 inline-flex rounded-xl border border-blue-500/20 bg-blue-500/10 p-3.5 text-blue-400">
        {icon}
      </div>

      <h3 className="text-lg font-semibold text-white">
        {title}
      </h3>

      <p className="mt-3 text-sm leading-7 text-slate-400">
        {description}
      </p>

    </div>
  );
}

// PROCESS STEP CARD
function StepCard({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-[#111C30] p-7 transition duration-300 hover:-translate-y-1 hover:border-blue-500/50">

      <span className="text-4xl font-bold tracking-tight text-blue-400">
        {number}
      </span>

      <h3 className="mt-7 text-xl font-semibold text-white">
        {title}
      </h3>

      <p className="mt-3 text-sm leading-7 text-slate-400">
        {description}
      </p>

    </div>
  );
}
