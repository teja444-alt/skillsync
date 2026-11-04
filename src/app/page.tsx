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
} from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#09090b] text-white">
      {/* Navigation */}
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <a href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600">
            <BrainCircuit size={21} />
          </div>

          <span className="text-xl font-bold tracking-tight">
            Skill<span className="text-violet-400">Sync</span>
          </span>
        </a>

        <div className="hidden items-center gap-8 text-sm text-zinc-400 md:flex">
          <a href="#features" className="transition hover:text-white">
            Features
          </a>
          <a href="#how-it-works" className="transition hover:text-white">
            How it works
          </a>
        </div>

        <a
          href="/login"
          className="rounded-lg border border-zinc-700 px-5 py-2.5 text-sm font-medium transition hover:border-violet-500 hover:bg-zinc-900"
        >
          Sign in
        </a>
      </nav>

      {/* Hero Section */}
      <section className="mx-auto grid max-w-7xl items-center gap-14 px-6 py-20 md:grid-cols-2 md:py-28">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-2 text-sm text-violet-300">
            <Zap size={15} />
            AI-powered job readiness
          </div>

          <h1 className="text-5xl font-bold leading-tight tracking-tight md:text-6xl">
            Your skills.
            <br />
            Your future.
            <br />
            <span className="text-violet-400">Your next job.</span>
          </h1>

          <p className="mt-6 max-w-lg text-lg leading-8 text-zinc-400">
            Discover the skills employers are looking for, identify your skill
            gaps, and build a personalized roadmap to become placement-ready.
          </p>

          <div className="mt-9 flex flex-wrap gap-4">
            <a
              href="/signup"
              className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-3.5 font-semibold transition hover:bg-violet-500"
            >
              Get started free
              <ArrowRight size={18} />
            </a>

            <a
              href="#how-it-works"
              className="rounded-xl border border-zinc-700 px-6 py-3.5 font-semibold transition hover:bg-zinc-900"
            >
              Explore how it works
            </a>
          </div>

          <div className="mt-8 flex items-center gap-3 text-sm text-zinc-500">
            <CheckCircle2 size={16} className="text-green-400" />
            Built for students and job seekers
          </div>
        </div>

        {/* Dashboard Preview */}
        <div className="relative">
          <div className="absolute -inset-10 rounded-full bg-violet-600/10 blur-3xl" />

          <div className="relative rounded-2xl border border-zinc-800 bg-[#111114] p-6 shadow-2xl shadow-violet-950/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-400">Your readiness overview</p>
                <h2 className="mt-1 text-xl font-semibold">
                  Job readiness score
                </h2>
              </div>

              <div className="rounded-lg bg-violet-500/10 p-3 text-violet-400">
                <TrendingUp size={22} />
              </div>
            </div>

            <div className="my-8 flex items-center gap-6">
              <div className="relative flex h-32 w-32 shrink-0 items-center justify-center rounded-full border-[10px] border-violet-500">
                <div className="absolute inset-[-10px] rounded-full border-[10px] border-zinc-800 border-l-transparent border-b-transparent" />
                <div className="text-center">
                  <span className="text-4xl font-bold">72</span>
                  <span className="text-lg text-zinc-400">%</span>
                </div>
              </div>

              <div>
                <p className="font-semibold text-green-400">Good progress!</p>
                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  Improve a few key skills to strengthen your placement profile.
                </p>
              </div>
            </div>

            <div className="space-y-5">
              <SkillBar label="JavaScript" score={90} color="bg-violet-500" />
              <SkillBar label="React" score={75} color="bg-blue-500" />
              <SkillBar label="SQL" score={65} color="bg-cyan-500" />
              <SkillBar label="Data Structures" score={45} color="bg-amber-500" />
            </div>

            <div className="mt-7 grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
                <p className="text-sm text-zinc-400">Matching skills</p>
                <p className="mt-2 text-2xl font-bold">12</p>
              </div>

              <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
                <p className="text-sm text-zinc-400">Skills to improve</p>
                <p className="mt-2 text-2xl font-bold text-amber-400">5</p>
              </div>
            </div>

            <p className="mt-4 text-xs text-zinc-600">
              Preview only — sample data, not a real analysis.
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t border-zinc-800 bg-[#0d0d10]">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-violet-400">
              Everything you need
            </p>

            <h2 className="mt-4 text-3xl font-bold md:text-4xl">
              Turn your skills into opportunities
            </h2>

            <p className="mt-4 text-zinc-400">
              A smarter way to understand your strengths and prepare for your
              dream job.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
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

      {/* How it works */}
      <section id="how-it-works" className="mx-auto max-w-7xl px-6 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-violet-400">
            Simple process
          </p>

          <h2 className="mt-4 text-3xl font-bold md:text-4xl">
            Your journey to placement readiness
          </h2>
        </div>

        <div className="mt-14 grid gap-8 md:grid-cols-3">
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

      {/* CTA */}
      <section className="px-6 pb-20">
        <div className="mx-auto max-w-7xl rounded-3xl border border-violet-500/20 bg-gradient-to-br from-violet-950/60 to-zinc-900 px-8 py-16 text-center">
          <h2 className="text-3xl font-bold md:text-4xl">
            Ready to understand your skill gaps?
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-zinc-400">
            Start building a clearer path from your current skills to your next
            career opportunity.
          </p>

          <a
            href="/signup"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-3.5 font-semibold transition hover:bg-violet-500"
          >
            Start your journey
            <ArrowRight size={18} />
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 px-6 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-sm text-zinc-500 md:flex-row">
          <p>
            © 2026 SkillSync. Built for your career journey.
          </p>

          <p>AI-Powered Job Readiness & Skill Gap Analyzer</p>
        </div>
      </footer>
    </main>
  );
}

function SkillBar({
  label,
  score,
  color,
}: {
  label: string;
  score: number;
  color: string;
}) {
  return (
    <div>
      <div className="mb-2 flex justify-between text-sm">
        <span className="text-zinc-300">{label}</span>
        <span className="text-zinc-400">{score}%</span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-[#111114] p-6 transition hover:border-violet-500/50">
      <div className="mb-5 inline-flex rounded-xl bg-violet-500/10 p-3 text-violet-400">
        {icon}
      </div>

      <h3 className="text-lg font-semibold">{title}</h3>

      <p className="mt-3 leading-7 text-zinc-400">{description}</p>
    </div>
  );
}

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
    <div className="rounded-2xl border border-zinc-800 bg-[#111114] p-6">
      <span className="text-3xl font-bold text-violet-400">{number}</span>

      <h3 className="mt-5 text-xl font-semibold">{title}</h3>

      <p className="mt-3 leading-7 text-zinc-400">{description}</p>
    </div>
  );
}