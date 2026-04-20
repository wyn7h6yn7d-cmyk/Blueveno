import { TerminalFrame } from "./terminal-frame";
import { MockLabel, MockPill, MockTable, MockTd, MockTh } from "./mockup-primitives";

const rows = [
  { t: "09:38:12", sym: "ESZ5", side: "L", qty: "2", setup: "ORB", tag: "drive", net: "+0.62", mfe: "+0.9" },
  { t: "09:52:44", sym: "ESZ5", side: "L", qty: "1", setup: "ORB", tag: "add", net: "+0.28", mfe: "+0.4" },
  { t: "10:14:03", sym: "NQZ5", side: "S", qty: "1", setup: "Fade", tag: "open", net: "+0.45", mfe: "+0.7" },
  { t: "10:41:19", sym: "NQZ5", side: "S", qty: "1", setup: "Fade", tag: "scale", net: "+0.31", mfe: "+0.5" },
  { t: "11:06:55", sym: "ESZ5", side: "L", qty: "1", setup: "Scratch", tag: "—", net: "−0.12", mfe: "+0.1" },
  { t: "13:22:08", sym: "ESZ5", side: "S", qty: "2", setup: "Mean rev.", tag: "mid", net: "+0.58", mfe: "+0.8" },
];

export function MockAutoJournal() {
  return (
    <TerminalFrame
      title="Journal · execution log"
      subtitle="Oct 14 · NY · equities index · synced 14:02"
    >
      <div className="border-b border-border/60 bg-black/25 px-3 py-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <MockLabel className="text-zinc-600">Filters</MockLabel>
            <span className="font-mono text-[9px] text-zinc-500">
              <span className="text-zinc-300">All symbols</span> · ES · NQ
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <MockPill tone="ok">Live</MockPill>
            <span className="font-mono text-[9px] tabular-nums text-zinc-500">6 fills · 1 scratch</span>
          </div>
        </div>
      </div>

      <MockTable className="rounded-none border-0 border-b border-border/60">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[32rem] border-collapse">
            <thead>
              <tr>
                <MockTh>Time</MockTh>
                <MockTh>Sym</MockTh>
                <MockTh>Side</MockTh>
                <MockTh className="text-right">Qty</MockTh>
                <MockTh>Setup</MockTh>
                <MockTh>Tag</MockTh>
                <MockTh className="text-right">Net R</MockTh>
                <MockTh className="text-right">MFE</MockTh>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.t} className="hover:bg-white/[0.02]">
                  <MockTd mono className="text-zinc-500">
                    {r.t}
                  </MockTd>
                  <MockTd mono className="text-zinc-200">
                    {r.sym}
                  </MockTd>
                  <MockTd mono>
                    <span
                      className={
                        r.side === "L" ? "text-emerald-400/90" : r.side === "S" ? "text-rose-400/85" : ""
                      }
                    >
                      {r.side}
                    </span>
                  </MockTd>
                  <MockTd mono className="text-right text-zinc-400">
                    {r.qty}
                  </MockTd>
                  <MockTd className="text-zinc-300">{r.setup}</MockTd>
                  <MockTd className="font-mono text-[10px] text-zinc-500">{r.tag}</MockTd>
                  <MockTd mono className="text-right text-zinc-100">
                    {r.net}
                  </MockTd>
                  <MockTd mono className="text-right text-zinc-500">
                    {r.mfe}
                  </MockTd>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </MockTable>

      <div className="flex flex-wrap items-center justify-between gap-2 bg-white/[0.02] px-3 py-2">
        <p className="font-mono text-[9px] text-zinc-600">
          Session net <span className="text-zinc-300">+2.12 R</span> · gross +2.36 · fees −0.24
        </p>
        <p className="font-mono text-[9px] text-zinc-600">Ledger ID · BV-2025-10-14-NY-01</p>
      </div>
    </TerminalFrame>
  );
}
