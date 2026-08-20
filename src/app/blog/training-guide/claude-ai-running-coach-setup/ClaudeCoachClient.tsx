// src/app/blog/training-guide/claude-ai-running-coach-setup/ClaudeCoachClient.tsx
"use client";

import { useState } from "react";

/* ─────────────────────────────────────────────
   COPY BUTTON
───────────────────────────────────────────── */

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide px-3 py-1.5 rounded-lg border transition-all duration-200 cursor-pointer shrink-0"
      style={{
        borderColor: copied ? "rgb(34 197 94 / 0.5)" : "rgb(63 63 70 / 0.8)",
        color: copied ? "rgb(34 197 94)" : "rgb(161 161 170)",
        backgroundColor: copied ? "rgb(34 197 94 / 0.1)" : "transparent",
      }}
    >
      {copied ? (
        <>
          <span>✓</span>
          <span>Copied!</span>
        </>
      ) : (
        <>
          <span>⎘</span>
          <span>Copy</span>
        </>
      )}
    </button>
  );
}

/* ─────────────────────────────────────────────
   PROMPT BLOCK
───────────────────────────────────────────── */

function PromptBlock({ content, label }: { content: string; label?: string }) {
  return (
    <div className="flex flex-col gap-0 rounded-xl overflow-hidden border border-zinc-700">
      <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-800 border-b border-zinc-700">
        <span className="text-xs font-bold uppercase tracking-wide text-zinc-400" dir="ltr">
          {label ?? "Prompt — paste into Claude"}
        </span>
        <CopyButton text={content} />
      </div>
      <pre className="bg-zinc-900 px-5 py-4 text-sm text-zinc-300 leading-relaxed overflow-x-auto whitespace-pre-wrap font-mono" dir="ltr">
        {content}
      </pre>
    </div>
  );
}

/* ─────────────────────────────────────────────
   TERMINAL BLOCK
───────────────────────────────────────────── */

function TerminalBlock({ commands }: { commands: string[] }) {
  const content = commands.join("\n");
  return (
    <div className="flex flex-col gap-0 rounded-xl overflow-hidden border border-zinc-700">
      <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-800 border-b border-zinc-700">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500/60" />
            <span className="w-3 h-3 rounded-full bg-yellow-500/60" />
            <span className="w-3 h-3 rounded-full bg-green-500/60" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wide text-zinc-400 ml-1" dir="ltr">
            Terminal
          </span>
        </div>
        <CopyButton text={content} />
      </div>
      <div className="bg-zinc-950 px-5 py-4 font-mono text-sm" dir="ltr">
        {commands.map((cmd, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="text-green-500 shrink-0">$</span>
            <span className="text-zinc-200">{cmd}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   PROMPTS DATA
───────────────────────────────────────────── */

const mcpPrompt = `I want to connect my training data from athletedata.health to you.
Please help me set up the MCP connection so you can read my Strava
and Garmin data automatically every time I ask you something.
I am not a programmer — explain each step clearly.`;

const dashboardPrompt = `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RUNNING DATA ANALYSIS, DASHBOARD & TRAINING PLAN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

My data is connected via athletedata.health.
Pull my last 180 days of training data now.

SECTION 1 — MY GOAL

Event / goal:        [e.g., Cairo Marathon / Wadi Degla 10K / build base]
Race or target date: [exact date, or "no fixed date"]
Target outcome:      [e.g., finish / sub-50:00 / sub-1:45 half]
Constraints:         [injuries, max hours per week, days unavailable]
Experience level:    [e.g., returning after 6 months / 3 races completed]

SECTION 2 — ANALYSIS REQUIRED

Produce each of the six points below in plain language.
Do not invent or estimate any data point.
If a field is missing, say so and adapt — never fill gaps with assumptions.

1. VOLUME TREND
   Weekly and monthly distance and run frequency.
   Flag any week-over-week increase above 10% as injury risk.
   Flag any sustained drop-off as detraining risk.

2. PACE TREND
   Is pace at a comparable effort improving, flat, or declining?
   Use pace at a given HR if HR data is available.

3. INTENSITY DISTRIBUTION
   Split across easy, moderate, and hard effort.
   Flag if hard efforts exceed 20% of weekly volume.
   Most training should be easy — if it is not, say so directly.

4. RECOVERY SIGNALS
   Only complete this if daily wellness data is present.
   Resting HR trend, HRV trend, sleep consistency.
   If this data is absent, state that and skip this section.

5. CURRENT FITNESS ESTIMATE
   Use the best available race result or sustained effort.
   Apply the Riegel formula. Show the inputs used — not just the number.
   Project realistic current capability at the goal distance.

6. GAP ANALYSIS
   Compare current fitness against what the goal requires by the target date.
   If the goal is not achievable in the timeline, say so and state
   what IS achievable instead.

SECTION 3 — BUILD MY DASHBOARD

Build one self-contained HTML file — inline CSS and JS only.
Must open offline by double-clicking. No server needed.

Include:
  • Header: countdown to goal date + one-line readiness verdict
  • Stat cards: weekly volume / avg runs per week / longest recent run /
    predicted finish time at goal distance
  • Weekly volume bar chart with a reference line at target peak distance
  • Pace trend line chart — overlay HR if available
  • FITNESS and FATIGUE chart if CTL and ATL data exists:
    - Daily points, not weekly averages
    - Plain subtitle: "When fatigue climbs above fitness you are
      digging a hole. Fine for a block. Not fine for a month."
  • Recovery panel only if resting HR or HRV data exists
  • Recent activity table — last 10 runs
  • Log new run form — saves to localStorage

Omit any panel with no data. Show a one-line explanation instead.
Do not render empty charts or zero-filled cards.

SECTION 4 — TRAINING PLAN

Build a week-by-week plan from today to the goal date.
If no fixed date, use a 10-week block.

Include:
  • Weekly structure — runs, session types, rest days
  • Specific paces or HR zones derived from the fitness estimate above
  • Progressive long-run buildup
  • A 2-week taper if a race date was given
  • One paragraph on the single biggest risk in this specific data

SECTION 5 — OUTPUT FORMAT

Deliver in this order:
  A. Written analysis — six points, plain language
  B. Complete HTML dashboard file — save it as dashboard.html
  C. Training plan — week-by-week table
  D. One-paragraph honest verdict — am I on track, and what is the
     single most important change I should make right now?
  E. One bold line, 10 words or fewer — my readiness verdict I can share`;

const autoUpdatePrompt = `I want you to check my athletedata.health training data every morning
at 7am and automatically update my dashboard.html file with any new
activities. If my fitness, fatigue, or form numbers have changed, update
the stat cards. If I have a new race result, recalculate my fitness estimate.

Set this up as a scheduled daily task using cron.
I am not a programmer — write the setup steps for me clearly.`;

const quickCommands = [
  {
    label: "Update dashboard manually",
    prompt: "Pull my latest training data from athletedata.health and update my dashboard.html",
  },
  {
    label: "Get a new training week",
    prompt: "Based on my current data, write me a specific training plan for this coming week",
  },
  {
    label: "Check for overtraining",
    prompt: "Look at my last 21 days of data. Am I showing any signs of overtraining or under-recovery?",
  },
  {
    label: "Pre-race check",
    prompt: "I race in [X] days. Look at my data and tell me what I should and should not do between now and then",
  },
  {
    label: "Reset & rebuild dashboard",
    prompt: "Delete my current dashboard.html and rebuild it from scratch using my latest training data",
  },
];

const askClaudeExamples = [
  "Analyze my last 4 weeks of training and tell me if I am ready to increase my long run distance.",
  "My last three runs felt harder than usual at the same pace. Look at my heart rate data and tell me what you think is happening.",
  "Write me a training week for this coming week based on my current fitness level and my goal race date.",
  "Am I overtraining? Look at my HRV and resting heart rate trend for the last 30 days and give me an honest answer.",
  "I have a race in 6 weeks. What is the most important thing I should focus on between now and then based on my data?",
];

/* ─────────────────────────────────────────────
   STEP RENDERER
───────────────────────────────────────────── */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function StepCard({ step }: { step: any }) {
  return (
    <div className={`border rounded-2xl overflow-hidden ${step.color}`}>

      {/* Step Header */}
      <div className="flex items-center gap-4 px-6 py-5 border-b border-zinc-800">
        <div className="flex flex-col items-center gap-0.5 shrink-0">
          <span className="text-xs font-bold uppercase tracking-widest text-zinc-600" dir="ltr">
            Step
          </span>
          <span className={`text-3xl font-black ${step.numberColor}`} dir="ltr">
            {step.number}
          </span>
        </div>
        <div className={`w-px h-10 ${step.accentColor} opacity-30 shrink-0`} />
        <h3 className="font-bold text-white text-lg leading-tight" dir="ltr">
          {step.title}
        </h3>
      </div>

      <div className="p-6 flex flex-col gap-5">

        {/* Why */}
        {step.why && (
          <div className="flex items-start gap-3 bg-zinc-900/50 rounded-xl p-4">
            <span className="text-xl shrink-0">💡</span>
            <p className="text-sm text-zinc-400 leading-relaxed" dir="ltr">
              {step.why}
            </p>
          </div>
        )}

        {/* Instructions */}
        {step.instructions && step.instructions.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-sm font-bold uppercase tracking-wide text-zinc-500" dir="ltr">
              Do this:
            </p>
            <div className="flex flex-col gap-2">
              {step.instructions.map((instruction: string, i: number) => (
                <div key={i} className="flex items-start gap-3">
                  <span className={`text-sm font-bold shrink-0 mt-0.5 ${step.numberColor}`} dir="ltr">
                    {i + 1}.
                  </span>
                  <p className="text-sm text-zinc-300 leading-relaxed" dir="ltr">
                    {instruction}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Single Terminal Command */}
        {step.terminalCommand && (
          <TerminalBlock commands={[step.terminalCommand]} />
        )}

        {/* Multiple Terminal Commands */}
        {step.terminalCommands && (
          <TerminalBlock commands={step.terminalCommands} />
        )}

        {/* Step 4 — MCP Prompt */}
        {step.number === "04" && (
          <PromptBlock content={mcpPrompt} label="Paste into Claude Code" />
        )}

        {/* Step 5 — Dashboard Prompt */}
        {step.number === "05" && (
          <div className="flex flex-col gap-3">
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 flex items-start gap-2">
              <span className="text-yellow-400 shrink-0">⚠️</span>
              <p className="text-sm text-zinc-400 leading-relaxed" dir="ltr">
                <span className="text-yellow-400 font-bold">Fill in Section 1</span>{" "}
                with your own goal before you send it. Everything else Claude handles
                automatically from your connected data.
              </p>
            </div>
            <PromptBlock
              content={dashboardPrompt}
              label="Full Dashboard Prompt — Copy & Paste into Claude Code"
            />
          </div>
        )}

        {/* Step 6 — Auto Update Prompt + After Steps */}
        {step.number === "06" && (
          <>
            <PromptBlock content={autoUpdatePrompt} label="Paste into Claude Code" />
            {step.afterSteps && (
              <div className="flex flex-col gap-2">
                <p className="text-sm font-bold uppercase tracking-wide text-zinc-500" dir="ltr">
                  After this:
                </p>
                {step.afterSteps.map((s: string, i: number) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className={`text-sm font-bold shrink-0 mt-0.5 ${step.numberColor}`} dir="ltr">
                      {i + 1}.
                    </span>
                    <p className="text-sm text-zinc-300 leading-relaxed" dir="ltr">
                      {s}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Step 7 — Ask Claude Examples */}
        {step.number === "07" && (
          <div className="flex flex-col gap-3">
            <p className="text-sm font-bold uppercase tracking-wide text-zinc-500" dir="ltr">
              Copy and paste any of these:
            </p>
            {askClaudeExamples.map((example, i) => (
              <div
                key={i}
                className="flex items-start justify-between gap-3 bg-zinc-900 border border-zinc-700 rounded-xl p-4"
              >
                <p className="text-sm text-zinc-300 leading-relaxed font-mono flex-1" dir="ltr">
                  {example}
                </p>
                <CopyButton text={example} />
              </div>
            ))}
          </div>
        )}

        {/* Success */}
        {step.success && (
          <div className="flex items-start gap-3 bg-green-500/10 border border-green-500/20 rounded-xl p-4">
            <span className="text-green-400 shrink-0">✅</span>
            <p className="text-sm text-zinc-300 leading-relaxed" dir="ltr">
              {step.success}
            </p>
          </div>
        )}

        {/* Warning */}
        {step.warning && (
          <div className="flex items-start gap-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
            <span className="text-yellow-400 shrink-0">⚠️</span>
            <p className="text-sm text-zinc-400 leading-relaxed" dir="ltr">
              {step.warning}
            </p>
          </div>
        )}

        {/* Tip */}
        {step.tip && (
          <div className="flex items-start gap-3 bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
            <span className="shrink-0">{step.tip.flag}</span>
            <p
              className="text-sm text-zinc-400 leading-relaxed"
              dir={step.tip.dir ?? "ltr"}
            >
              {step.tip.text}
            </p>
          </div>
        )}

      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   QUICK COMMANDS SECTION
───────────────────────────────────────────── */

function QuickCommandsSection() {
  return (
    <div className="flex flex-col gap-4">
      {quickCommands.map((cmd, i) => (
        <div
          key={i}
          className="bg-zinc-900 border border-zinc-700 rounded-xl overflow-hidden"
        >
          <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-800 border-b border-zinc-700">
            <span className="text-sm font-bold uppercase tracking-wide text-zinc-400" dir="ltr">
              {cmd.label}
            </span>
            <CopyButton text={cmd.prompt} />
          </div>
          <div className="px-5 py-4">
            <p className="text-sm text-zinc-300 font-mono leading-relaxed" dir="ltr">
              {cmd.prompt}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN EXPORT
───────────────────────────────────────────── */

interface ClaudeCoachClientProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  steps?: any[];
  quickCommands?: boolean;
}

export function ClaudeCoachClient({
  steps,
  quickCommands: showQuickCommands,
}: ClaudeCoachClientProps) {
  if (showQuickCommands) {
    return <QuickCommandsSection />;
  }

  if (steps) {
    return (
      <div className="flex flex-col gap-6">
        {steps.map((step) => (
          <StepCard key={step.number} step={step} />
        ))}
      </div>
    );
  }

  return null;
}