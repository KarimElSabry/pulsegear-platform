// src/app/admin/analytics/ActionForm.tsx

'use client'

import { useActionState } from 'react'
import type { ActionResult } from './finance-actions'

type Action = (prev: ActionResult | null, formData: FormData) => Promise<ActionResult>

export const inputClass =
  'w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500'

export function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="block space-y-1">
      <span className="block text-xs font-semibold text-gray-300">{label}</span>
      {children}
      {hint && <span className="block text-[11px] text-gray-500">{hint}</span>}
    </label>
  )
}

/** A form bound to a server action that returns {ok, message}; the message is shown under the button. */
export default function ActionForm({
  action, title, description, children, submitLabel = 'Save', encType,
}: {
  action: Action
  title: string
  description?: string
  children: React.ReactNode
  submitLabel?: string
  encType?: 'multipart/form-data'
}) {
  const [state, formAction, pending] = useActionState(action, null)
  return (
    <section className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
      <h2 className="text-white font-bold text-lg">{title}</h2>
      {description && <p className="text-gray-400 text-sm mt-1 mb-4">{description}</p>}
      <form action={formAction} encType={encType} className="space-y-3 mt-3">
        {children}
        <div className="flex items-center gap-3 pt-1">
          <button
            type="submit"
            disabled={pending}
            className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-sm font-bold px-4 py-2 rounded-lg transition"
          >
            {pending ? 'Saving…' : submitLabel}
          </button>
          {state && (
            <p role="status" className={`text-sm ${state.ok ? 'text-green-400' : 'text-red-400'}`}>{state.message}</p>
          )}
        </div>
      </form>
    </section>
  )
}
