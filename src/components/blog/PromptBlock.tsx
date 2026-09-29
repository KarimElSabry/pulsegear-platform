// src/components/blog/PromptBlock.tsx
// Copyable prompt / terminal block for tutorial articles.
'use client'

import { useState } from 'react'

export default function PromptBlock({
  content,
  label = 'Prompt — paste into Claude',
  variant = 'prompt',
}: {
  content: string
  label?: string
  variant?: 'prompt' | 'terminal'
}) {
  const [copied, setCopied] = useState(false)
  async function copy() {
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      /* clipboard unavailable */
    }
  }
  return (
    <div className="overflow-hidden rounded-2xl border border-line" dir="ltr">
      <div className="flex items-center justify-between gap-3 border-b border-line bg-surface-2 px-4 py-2.5">
        <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-muted">
          {variant === 'terminal' && (
            <span className="flex gap-1" aria-hidden="true">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/70" />
            </span>
          )}
          {label}
        </span>
        <button
          type="button"
          onClick={copy}
          className={`rounded-lg border px-3 py-1 text-xs font-bold uppercase tracking-wide transition-colors ${
            copied ? 'border-emerald-500/50 text-emerald-400' : 'border-line-strong text-muted-strong hover:border-white hover:text-white'
          }`}
        >
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className={`overflow-x-auto whitespace-pre-wrap px-5 py-4 font-mono text-sm leading-relaxed ${variant === 'terminal' ? 'bg-surface-0 text-emerald-200' : 'bg-surface-1 text-muted-strong'}`}>
        {variant === 'terminal' ? content.split('\n').map((l, i) => (
          <span key={i} className="block"><span className="text-emerald-500">$ </span>{l}</span>
        )) : content}
      </pre>
    </div>
  )
}
