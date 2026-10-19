// src/app/admin/milestones/ConfirmDeleteButton.tsx

'use client'

export default function ConfirmDeleteButton({ label = 'Delete', message }: { label?: string; message: string }) {
  return (
    <button
      type="submit"
      onClick={(e) => { if (!window.confirm(message)) e.preventDefault() }}
      className="text-xs text-red-400 hover:text-red-300 underline"
    >
      {label}
    </button>
  )
}
