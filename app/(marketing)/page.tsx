import Link from "next/link";

const benefits = [
  { title: "Log your day", text: "Date, market, P&L, short notes." },
  { title: "Paste chart link", text: "Attach your TradingView chart URL." },
  { title: "Scan your week", text: "Daily colors + weekly totals." },
];

const journalBullets = ["Calendar view", "Notes & comments", "TradingView links", "Daily results"];
const navLinks = [
  { href: "#how", label: "How it works" },
  { href: "#benefits", label: "Benefits" },
  { href: "#calendar", label: "Calendar" },
];

const calendarRows = [
  ["", "", "", "", "", "1", "2"],
  ["3", "4", "5", "6", "7", "8", "9"],
  ["10", "11", "12", "13", "14", "15", "16"],
  ["17", "18", "19", "20", "21", "22", "23"],
  ["24", "25", "26", "27", "28", "29", "30"],
];

const pnlMap: Record<string, number> = {
  "4": 180,
  "5": -85,
  "6": 45,
  "8": 220,
  "12": -40,
  "14": 125,
  "15": 310,
  "19": -120,
  "20": 60,
  "22": 95,
  "26": -50,
  "27": 170,
};

function cellTone(day: string) {
  if (!day) return "bg-transparent border-transparent";
  const v = pnlMap[day];
  if (typeof v !== "number") return "bg-white/[0.02] border-white/[0.06]";
  if (v > 0) return "bg-emerald-500/12 border-emerald-400/30 text-emerald-200";
  if (v < 0) return "bg-rose-500/12 border-rose-400/30 text-rose-200";
  return "bg-white/[0.02] border-white/[0.06]";
}

export default function MarketingHomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[oklch(0.06_0.03_260)] text-zinc-100">
      {/* Subtle motion background: elegant, low contrast, blue-toned */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,oklch(0.09_0.03_260),oklch(0.065_0.03_262)_42%,oklch(0.06_0.02_262)_100%)]" />
        <div className="bg-market-grid-drift absolute inset-0 opacity-[0.4]" />
        <div className="bg-market-wave absolute inset-0 opacity-[0.28]" />
        <div className="bg-market-wave-reverse absolute inset-0 opacity-[0.22]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_70%_at_50%_-10%,oklch(0.45_0.08_250/0.16),transparent_58%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_130%_70%_at_50%_110%,oklch(0.32_0.07_254/0.14),transparent_60%)]" />
      </div>

      <header className="sticky top-0 z-20 border-b border-white/[0.06] bg-[oklch(0.06_0.03_260/0.72)] backdrop-blur">
        <div className="mx-auto w-full max-w-6xl px-6">
          <div className="flex h-20 items-center justify-between">
            <Link href="/" className="font-display text-xl tracking-tight text-zinc-50">
              Blueveno
            </Link>
            <nav className="hidden items-center gap-6 md:flex">
              {navLinks.map((l) => (
                <a key={l.href} href={l.href} className="text-sm text-zinc-400 transition hover:text-zinc-100">
                  {l.label}
                </a>
              ))}
            </nav>
            <div className="flex items-center gap-3">
              <Link href="/login" className="text-sm text-zinc-400 transition hover:text-zinc-100">
                Sign in
              </Link>
              <Link
                href="/signup"
                className="rounded-full border border-white/[0.14] bg-white/[0.04] px-4 py-2 text-sm text-zinc-100 transition hover:bg-white/[0.08]"
              >
                Start free
              </Link>
            </div>
          </div>
          <nav className="flex items-center gap-4 py-3 md:hidden">
            {navLinks.map((l) => (
              <a key={l.href} href={l.href} className="text-xs uppercase tracking-[0.08em] text-zinc-400">
                {l.label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-24 px-6 pb-24 pt-8 md:gap-32">
        {/* 1. Hero */}
        <section className="grid items-start gap-10 pt-8 md:pt-14 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-6 xl:col-span-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-zinc-500">Trading journal</p>
            <h1 className="font-display mt-5 text-4xl leading-[1.03] tracking-[-0.03em] text-zinc-50 sm:text-5xl md:text-6xl">
              Your trading day,
              <span className="block text-[oklch(0.78_0.1_248)]">clear in one place.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-zinc-300">
              Log your day, paste your chart link, and see P&L clearly on a calendar.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/signup"
                className="rounded-full bg-[oklch(0.72_0.13_248)] px-6 py-3 text-sm font-semibold text-[oklch(0.13_0.03_260)] transition hover:bg-[oklch(0.77_0.11_248)]"
              >
                Start journaling
              </Link>
              <Link
                href="/app"
                className="rounded-full border border-white/[0.12] bg-white/[0.03] px-6 py-3 text-sm text-zinc-200 transition hover:bg-white/[0.07]"
              >
                View app
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6 xl:col-span-7">
            <div className="relative overflow-hidden rounded-3xl border border-white/[0.12] bg-[linear-gradient(160deg,oklch(0.18_0.08_280),oklch(0.11_0.04_262)_42%,oklch(0.09_0.03_260))] p-5 shadow-[0_26px_90px_-34px_oklch(0.4_0.12_278/0.65)] ring-1 ring-white/[0.06] sm:p-6">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_16%_0%,oklch(0.66_0.18_285/0.18),transparent_60%)]" />
              <div className="relative grid gap-4 sm:grid-cols-[1.45fr_1fr]">
                <div className="rounded-2xl border border-white/[0.16] bg-white/[0.95] p-4 text-zinc-900 shadow-[0_20px_50px_-28px_rgba(0,0,0,0.55)]">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-zinc-600">Dashboard</p>
                    <p className="text-xs text-zinc-500">Last import · 2h ago</p>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {[
                      { k: "Net P&L", v: "$2,129" },
                      { k: "Expectancy", v: "$248" },
                      { k: "Win %", v: "55%" },
                    ].map((c) => (
                      <div key={c.k} className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-2">
                        <p className="text-[10px] text-zinc-500">{c.k}</p>
                        <p className="mt-1 text-sm font-semibold">{c.v}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 rounded-md border border-zinc-200 p-2">
                    <p className="text-[10px] text-zinc-500">Week heatmap</p>
                    <div className="mt-2 grid grid-cols-7 gap-1.5">
                      {[0.2, 0.35, 0.7, 0.12, 0.52, 0.78, 0.15].map((o, i) => (
                        <div key={i} className="h-6 rounded-sm bg-blue-600" style={{ opacity: o }} />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-2xl border border-white/[0.16] bg-white/[0.95] p-4 text-zinc-900 shadow-[0_20px_50px_-30px_rgba(0,0,0,0.55)]">
                    <p className="text-xs font-medium text-zinc-600">April 2026</p>
                    <div className="mt-2 grid grid-cols-4 gap-1.5">
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((d) => (
                        <div
                          key={d}
                          className={`h-9 rounded-sm border border-zinc-200 p-1 text-[10px] ${d % 3 === 0 ? "bg-emerald-50 text-emerald-700" : d % 4 === 0 ? "bg-rose-50 text-rose-700" : "bg-zinc-50 text-zinc-500"}`}
                        >
                          {String(d).padStart(2, "0")}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/[0.16] bg-white/[0.95] p-4 text-zinc-900 shadow-[0_20px_50px_-30px_rgba(0,0,0,0.55)]">
                    <p className="text-xs font-medium text-zinc-600">Journal note</p>
                    <p className="mt-2 text-sm text-zinc-700">Reason: VWAP bounce. Risk 0.5R. Felt calm.</p>
                    <p className="mt-2 text-[11px] text-blue-700">TradingView chart attached</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="how" className="grid gap-4 rounded-3xl border border-white/[0.08] bg-[oklch(0.1_0.02_260/0.7)] p-6 md:grid-cols-3">
          {[
            { n: "01", t: "Log your day", d: "Add date, market, and day P&L." },
            { n: "02", t: "Add context", d: "Write short notes and paste chart link." },
            { n: "03", t: "Review week", d: "Use green/red calendar and weekly totals." },
          ].map((x) => (
            <article key={x.n} className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">{x.n}</p>
              <h3 className="font-display mt-3 text-xl text-zinc-50">{x.t}</h3>
              <p className="mt-2 text-sm text-zinc-400">{x.d}</p>
            </article>
          ))}
        </section>

        {/* 2. 3 core benefits */}
        <section id="benefits" className="grid gap-4 md:grid-cols-3">
          {benefits.map((b) => (
            <article
              key={b.title}
              className="rounded-2xl border border-white/[0.08] bg-[oklch(0.11_0.02_260/0.72)] p-6 ring-1 ring-white/[0.03]"
            >
              <h2 className="font-display text-xl tracking-tight text-zinc-50">{b.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-zinc-400">{b.text}</p>
            </article>
          ))}
        </section>

        <section className="grid gap-6 rounded-3xl border border-white/[0.08] bg-[oklch(0.1_0.02_260/0.8)] p-6 md:grid-cols-[1fr_1.2fr] md:p-8">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">Journaling clarity</p>
            <h3 className="font-display mt-2 text-3xl tracking-tight text-zinc-50">Focus on what matters</h3>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-zinc-400">
              Blueveno keeps journaling simple and useful: log your day, add context, review outcomes.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {journalBullets.map((x) => (
              <span
                key={x}
                className="rounded-full border border-white/[0.1] bg-white/[0.03] px-4 py-2 text-sm text-zinc-300"
              >
                {x}
              </span>
            ))}
          </div>
        </section>

        {/* 3. Calendar preview */}
        <section id="calendar" className="rounded-3xl border border-white/[0.08] bg-[oklch(0.1_0.02_260/0.8)] p-6 md:p-8">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">Calendar view</p>
              <h3 className="font-display mt-2 text-2xl tracking-tight text-zinc-50">Daily P&L at a glance</h3>
            </div>
            <p className="font-mono text-xs text-zinc-400">Week total: +$935</p>
          </div>
          <div className="grid grid-cols-7 gap-2">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
              <div key={d} className="px-1 pb-1 text-center font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">
                {d}
              </div>
            ))}
            {calendarRows.flat().map((day, i) => (
              <div
                key={`${day}-${i}`}
                className={`flex aspect-square items-start justify-between rounded-lg border p-2 text-xs ${cellTone(day)}`}
              >
                <span className="font-mono text-[11px]">{day}</span>
                {day && pnlMap[day] ? (
                  <span className="font-mono text-[10px] tabular-nums">{pnlMap[day] > 0 ? "+" : ""}${pnlMap[day]}</span>
                ) : null}
              </div>
            ))}
          </div>
        </section>

        {/* 4. Simple CTA */}
        <section className="rounded-3xl border border-white/[0.08] bg-[oklch(0.1_0.02_260/0.7)] px-6 py-12 text-center">
          <h3 className="font-display text-3xl tracking-tight text-zinc-50 sm:text-4xl">Start journaling today</h3>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-zinc-400">
            No clutter. No fake data. Just your real trading days.
          </p>
          <Link
            href="/signup"
            className="mt-7 inline-flex rounded-full bg-[oklch(0.72_0.13_248)] px-7 py-3 text-sm font-semibold text-[oklch(0.13_0.03_260)] transition hover:bg-[oklch(0.77_0.11_248)]"
          >
            Create free account
          </Link>
        </section>
      </main>

      {/* 6. Footer */}
      <footer className="relative z-10 border-t border-white/[0.08] py-8">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-6">
          <p className="font-display text-lg tracking-tight text-zinc-100">Blueveno</p>
          <div className="flex items-center gap-5 text-sm text-zinc-500">
            <Link href="/pricing" className="transition hover:text-zinc-300">
              Pricing
            </Link>
            <a href="mailto:hello@blueveno.com" className="transition hover:text-zinc-300">
              Contact
            </a>
            <span>© {new Date().getFullYear()}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
