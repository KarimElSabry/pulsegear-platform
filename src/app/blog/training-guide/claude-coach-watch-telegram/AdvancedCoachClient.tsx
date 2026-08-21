// src/app/blog/training-guide/claude-coach-watch-telegram/AdvancedCoachClient.tsx
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
        <><span>✓</span><span>Copied!</span></>
      ) : (
        <><span>⎘</span><span>Copy</span></>
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
   PROMPT DATA
───────────────────────────────────────────── */

const telegramFullPrompt = `You are my setup assistant. I'm an athlete and I want to stop paying for coaching
apps. We're going to connect my training data to you, teach you how I want to be
coached, have you build my next training block, push it to my watch, and then wire
you up to text me on Telegram.

HOW TO WORK THROUGH THIS
Part 1 needs my hands - accounts, logins, an API key. Go one step at a time there
and wait for me.
Parts 2 through 5 are yours. Once I've given you the key, build it. Don't ask
permission between steps. Tell me what you did when it works.

Use plain language. I may not be a programmer. Never make me paste a command into
a terminal - you run it.

WHEN I'M STUCK
If I get stuck twice on the same thing, or tell you I'm confused, or something
breaks you can't fix in a couple of tries, stop and ask me to describe exactly
what I see on screen. Then fix it from there. Don't nag when things are fine.

===================================================================
PART 1 - What I have to do myself  (one step at a time, wait for me)
===================================================================

STEP 1 - Account
Ask if I already have an intervals.icu account. Plenty of endurance athletes do.
If not: free signup at https://intervals.icu, no card.

STEP 2 - Connect my watch  ** the step everyone gets stuck on **
Send me to Settings -> Integrations and have me connect what I actually own.
intervals.icu pulls from Garmin, Strava, COROS, Polar, Suunto, Wahoo, Oura, WHOOP
and Zwift. One connection here beats six separate ones.

Have me check THREE things in that same panel before we move on:

    "Sync activities"           my history flows in
    wellness / sleep scopes     without these there's no Fitness or Fatigue
    "Upload planned workouts"   the block we write actually reaches my watch

That third one is off by default. Leave it off and everything in Part 4 posts
perfectly and never reaches my wrist.

Then warn me:
  - The backfill is NOT instant. Give it a few minutes.
  - A brand-new account may only carry recent history. Normal.

Before moving on, make me confirm I can SEE activities on the intervals.icu
calendar. If that calendar is empty, everything downstream is empty too, and we
fix it here instead of debugging code later.

STEP 3 - Zones  ** do this now, not later **
Have me check Settings for my threshold heart rate and pace. If they're at 0 or
obviously wrong, the block we build lands on my watch with meaningless targets.
Two minutes here saves the whole thing.

If I don't know my threshold HR, tell me a usable starting point: roughly the
average HR I could hold for a hard 30 to 60 minute effort. Good enough to start.

STEP 4 - API key
Send me to https://intervals.icu/settings, all the way to the bottom, to
"Developer Settings". Have me generate a key and copy it, plus my athlete id on
the same page (looks like i123456).

Create .env in this folder, or APPEND to it if one already exists without touching
what's in there:

    INTERVALS_API_KEY=paste_the_key_here
    INTERVALS_ATHLETE_ID=i123456

Append to .gitignore too, creating it if needed:

    .env
    data.json

Tell me plainly: that key reads AND writes my training data. Never paste it into a
chat, a screenshot, or a public repo.

===================================================================
PART 2 - Pull my data  (don't wait for me, just go)
===================================================================

Write pull.py. These API details are verified. Use them exactly, do not improvise:

  Base URL:   https://intervals.icu/api/v1

  Auth:       HTTP Basic. The username is the LITERAL STRING "API_KEY".
              The password is my key:
                  session.auth = ("API_KEY", my_key)
              Not a typo. The username is really the words API_KEY.

  Athlete:    "0" always means "the authenticated athlete", so /athlete/0/...
              works even if I typo my id. Use my id if given, else "0".

  User-Agent: Cloudflare sits in front of intervals.icu and BLOCKS the default
              python-requests / urllib user agents. Set your own:
                  session.headers["User-Agent"] = "AthleteCoach/1.0"
              Skip this and you get mystery 403s on a perfectly good key.

  Endpoints:  GET /athlete/{id}/activities?oldest=YYYY-MM-DD&newest=YYYY-MM-DD
              GET /athlete/{id}/wellness?oldest=YYYY-MM-DD&newest=YYYY-MM-DD

  Errors:     401 = bad or regenerated key. 403 = almost always the User-Agent.
  Limits:     5,000/day, 2,500 per 15 min. Two calls is nothing.

Keep from each ACTIVITY: start_date_local, type, name, moving_time (seconds),
distance (meters), total_elevation_gain (meters), average_heartrate, max_heartrate,
icu_training_load, icu_intensity

Keep from each WELLNESS day: id (this is the DATE), ctl, atl, restingHR, hrv,
sleepSecs, sleepScore, weight

Those three names are jargon. Translate them everywhere you show them to me:

    ctl        FITNESS   my long-run training base
    atl        FATIGUE   how much recent work is sitting on me
    ctl - atl  FORM      negative = buried, positive = fresh

Pull the last 180 days into data.json. Then install what you need and run it
yourself.

If it returns 0 activities, do NOT tell me it worked. Tell me my wearable sync from
Step 2 is off or still backfilling, and walk me back to that panel.

When it works, tell me in plain English what my numbers actually say. Not a table -
a read. Am I fit? Am I buried? What's the trend over 180 days?

===================================================================
PART 3 - Learn how I want to be coached
===================================================================
This is the part that makes you a coach instead of a calculator. You have my
numbers now. You don't have me.

Interview me. ONE QUESTION AT A TIME, conversational, not a form. React to what I
say before asking the next one. If an answer is vague, ask the follow-up.

Cover these, in roughly this order:

  1. What am I training for, and when is it? Get the date and the distance.
     If I don't have a race, ask what I'm actually chasing instead.
  2. What does a normal week look like right now? Days, hours, longest run.
  3. What are my hard constraints? Work, family, which days are impossible,
     what equipment or terrain I actually have access to.
  4. Injury history and anything currently niggling.
  5. What's failed before? Plans I've quit, blocks that broke me, patterns I
     keep repeating.
  6. How do I want to be coached? Push me hard or hold me back? Do I want the
     reasoning behind every session or just the session? Do I want to be told
     when I'm being an idiot?
  7. What's non-negotiable? A rest day, long run on Sunday, whatever it is.

Then write coach.md in this folder. Structure it as:

    WHO I AM              age, sport, history, current volume
    WHAT I'M CHASING      goal event, date, what success looks like
    MY CONSTRAINTS        time, days, equipment, terrain, injuries
    HOW TO COACH ME       tone, how much explanation, when to push, when to
                          pull me back, what I've told you I respond to
    NON-NEGOTIABLES       the things you never program over
    WHAT I'VE LEARNED     patterns from my own history, updated over time

Write HOW TO COACH ME in the second person, addressed to you, so it reads as
instructions rather than notes.

Show me coach.md and let me edit it. This is my coach's brain and I should see
exactly what's in it. Tell me I can come back and change it any time.

===================================================================
PART 4 - Build my block and put it on my watch
===================================================================

Read data.json and coach.md together. Then propose my next training block.

Default to 4 weeks: three building weeks and a down week, unless my race date or
coach.md says otherwise. If my race is close, work backwards from it and say so.

SHOW ME THE WHOLE BLOCK FIRST, as a simple week-by-week list, before you post
anything. Tell me why it looks like that in two or three sentences, grounded in my
actual Fitness and Fatigue numbers and what coach.md says. Then wait for my yes.

Do not put 20 workouts on my calendar without showing me first.

When I approve, post each session to my calendar, one call per session:

  POST /athlete/{id}/events
  {
    "category": "WORKOUT",
    "start_date_local": "2026-08-07T00:00:00",
    "type": "Run",
    "name": "5x3min threshold",
    "moving_time": 3000,
    "description": "- 15m Z2 HR\n\n5x\n- 3m Z4 HR\n- 2m Z1 HR\n\n- 10m Z2 HR"
  }

  THE ZONE TRAP - verified, and it WILL bite you:
    The event's "target" field is IGNORED by the workout parser. Only the suffix
    inside the description decides what a zone means:
        "- 15m Z2"       -> POWER zone  (wrong for running, shows watts)
        "- 15m Z2 HR"    -> heart-rate zone
        "- 15m Z2 Pace"  -> pace zone
    For running always append HR or Pace. For cycling bare Z is fine.

  Syntax:  "- 15m Z2 HR" is one step. "5x" on its own line starts a repeat block;
           steps under it repeat; a blank line closes it.
  Undo:    DELETE /athlete/{id}/events/{event_id}
  List:    GET /athlete/{id}/events?oldest=...&newest=...

  Post them in a simple loop, one at a time. Keep every event id you get back and
  save them to block.json so I can undo the block later without hunting.

After it posts, tell me two things:
  - intervals.icu only pushes about 7 days ahead to the watch, so week 1 shows up
    now and the rest lands as it gets closer. The block is real, the watch just
    stays a week out.
  - It reaches the watch on the next sync.

Have me confirm week 1 is on the intervals.icu calendar, then sync my watch and
confirm it landed.

===================================================================
PART 5 - Make it text me
===================================================================
Right now I have to come to my laptop to talk to you. Let's fix that.

STEP 1 - Make the bot  (my hands)
Have me open Telegram, message @BotFather, send /newbot, pick a name and a
username, and copy the token it gives back.

Then have me send my new bot one message. Anything, "hi" is fine.

Tell me up front that it will NOT reply, and that's correct. Nothing is listening
yet. I'm leaving a message in the queue so you can find my chat id in the next
step. Telegram only holds unfetched messages for about a day, so if I come back to
this tomorrow I need to send a fresh one.

Have me add the token to .env myself. Do not ask me to paste it in the chat:

    TELEGRAM_BOT_TOKEN=paste_the_botfather_token_here

STEP 2 - Find my chat id and prove it works  (yours)
Call https://api.telegram.org/bot<token>/getUpdates and pull my chat id out of the
message I just sent. Save it to .env as TELEGRAM_CHAT_ID.

Then send me a test message with sendMessage so I see it land on my phone. If
getUpdates comes back empty, my "hi" is either older than a day or went to a
different bot. Have me send another one.

STEP 3 - Send me my block
Write send.py: reads .env, reads block.json and coach.md, and texts me a short
summary of the block we just built. Not the whole thing. Something I'd actually
read on a phone - what this week looks like, what today is, and one line of why,
in the voice coach.md describes.

Run it. Confirm it landed.

Then tell me how to use it from here: any time I want my block texted to me, or a
session explained, or my week checked, I just ask you and you run it.

===================================================================
LAST THING
===================================================================
Tell me what I just built, in four lines, no jargon:

    my training data flows in by itself
    you know how I want to be coached, and it's written down where I can edit it
    my block is on my watch
    you can reach my phone

Then get out of my way so I can go train.`;

/* ─────────────────────────────────────────────
   WHAT YOU'RE BUILDING TABLE
───────────────────────────────────────────── */

interface BuildPiece {
  piece: string;
  does: string;
}

function WhatYoureBuildingTable({ pieces }: { pieces: BuildPiece[] }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-zinc-800">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-800 bg-zinc-900">
            <th className="text-left px-5 py-3 text-xs font-bold uppercase tracking-wide text-zinc-400" dir="ltr">
              Piece
            </th>
            <th className="text-left px-5 py-3 text-xs font-bold uppercase tracking-wide text-zinc-400" dir="ltr">
              What it does
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800">
          {pieces.map((row, i) => (
            <tr key={i} className="hover:bg-zinc-900/50 transition-colors">
              <td className="px-5 py-4 whitespace-nowrap">
                <span className="text-sm font-bold text-white" dir="ltr">{row.piece}</span>
              </td>
              <td className="px-5 py-4">
                <span className="text-sm text-zinc-400 leading-relaxed" dir="ltr">{row.does}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ─────────────────────────────────────────────
   TRAP TABLE
───────────────────────────────────────────── */

interface Trap {
  trap: string;
  what: string;
}

function TrapTable({ traps }: { traps: Trap[] }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-zinc-800">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-800 bg-zinc-900">
            <th className="text-left px-5 py-3 text-xs font-bold uppercase tracking-wide text-zinc-400" dir="ltr">
              Trap
            </th>
            <th className="text-left px-5 py-3 text-xs font-bold uppercase tracking-wide text-zinc-400" dir="ltr">
              What it looks like
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800">
          {traps.map((row, i) => (
            <tr key={i} className="hover:bg-zinc-900/50 transition-colors">
              <td className="px-5 py-4">
                <span className="text-sm font-bold text-yellow-400" dir="ltr">{row.trap}</span>
              </td>
              <td className="px-5 py-4">
                <span className="text-sm text-zinc-400 leading-relaxed" dir="ltr">{row.what}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN EXPORT
───────────────────────────────────────────── */

interface AdvancedCoachClientProps {
  whatYoureBuilding?: BuildPiece[];
  traps?: Trap[];
  telegramPrompt?: boolean;
}

export function AdvancedCoachClient({
  whatYoureBuilding,
  traps,
  telegramPrompt,
}: AdvancedCoachClientProps) {
  if (telegramPrompt) {
    return (
      <PromptBlock
        content={telegramFullPrompt}
        label="Full Prompt — Open Claude Code in an empty folder and paste this"
      />
    );
  }

  if (whatYoureBuilding) {
    return <WhatYoureBuildingTable pieces={whatYoureBuilding} />;
  }

  if (traps) {
    return <TrapTable traps={traps} />;
  }

  return null;
}