import Link from "next/link";

const benefits = [
  { title: "Log your day", text: "Date, market, P&L, short notes." },
  { title: "Paste chart link", text: "Attach your TradingView chart URL." },
  { title: "Scan your week", text: "Daily colors + weekly totals." },
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
        <div className="bg-market-grid-drift absolute inset-0 opacity-[0.24]" />
        <div className="bg-market-wave absolute inset-0 opacity-[0.14]" />
        <div className="bg-market-wave-reverse absolute inset-0 opacity-[0.08]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_70%_at_50%_-10%,oklch(0.45_0.08_250/0.12),transparent_58%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_130%_70%_at_50%_110%,oklch(0.32_0.07_254/0.1),transparent_60%)]" />
      </div>

      <header className="relative z-10 mx-auto flex h-20 w-full max-w-6xl items-center justify-between px-6">
        <Link href="/" className="font-display text-xl tracking-tight text-zinc-50">
          Blueveno
        </Link>
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
            <div className="relative overflow-hidden rounded-3xl border border-white/[0.1] bg-[oklch(0.09_0.02_260/0.95)] p-5 shadow-[0_20px_80px_-32px_oklch(0.34_0.08_252/0.5)] ring-1 ring-white/[0.04] sm:p-6">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_85%_70%_at_50%_-15%,oklch(0.4_0.08_250/0.14),transparent_60%)]" />
              <div className="relative">
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                  <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-500">Tue, Apr 21</p>
                  <p className="font-mono text-sm tabular-nums text-emerald-300">+$180</p>
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
                    <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">Journal note</p>
                    <p className="mt-3 text-sm leading-relaxed text-zinc-300">
                      Followed plan at open. No chase entries after first move.
                    </p>
                    <a
                      href="https://www.tradingview.com/"
                      className="mt-4 inline-block rounded-md border border-white/[0.1] bg-white/[0.03] px-3 py-2 font-mono text-[11px] text-[oklch(0.82_0.08_248)] hover:underline"
                    >
                      TradingView chart link
                    </a>
                  </div>

                  <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
                    <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">This week</p>
                    <p className="mt-3 font-display text-2xl tracking-tight text-zinc-100">+$935</p>
                    <div className="mt-4 grid grid-cols-5 gap-2">
                      {[
                        { d: "Mon", v: 120 },
                        { d: "Tue", v: 180 },
                        { d: "Wed", v: -40 },
                        { d: "Thu", v: 220 },
                        { d: "Fri", v: 455 },
                      ].map((x) => (
                        <div
                          key={x.d}
                          className={`rounded-md border px-2 py-2 text-center font-mono text-[10px] ${
                            x.v >= 0
                              ? "border-emerald-400/30 bg-emerald-500/12 text-emerald-200"
                              : "border-rose-400/30 bg-rose-500/12 text-rose-200"
                          }`}
                        >
                          <p>{x.d}</p>
                          <p className="mt-1 tabular-nums">{x.v > 0 ? "+" : ""}{x.v}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. 3 core benefits */}
        <section className="grid gap-4 md:grid-cols-3">
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

        {/* 3. Calendar preview */}
        <section className="rounded-3xl border border-white/[0.08] bg-[oklch(0.1_0.02_260/0.8)] p-6 md:p-8">
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
        <section className="text-center">
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
