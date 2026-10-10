// src/app/admin/requests/statuses.ts
// Values match what the rest of the app (deals sync trigger, deals page) already uses.

export const REQUEST_STATUSES = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'deal_agreed', label: 'On-going (deal agreed)' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
] as const
