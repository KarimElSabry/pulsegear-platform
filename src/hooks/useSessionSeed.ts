// src/hooks/useSessionSeed.ts
// A random number created once per browser session (sessionStorage), so the homepage shows a
// different selection each time someone starts a new visit, but does not reshuffle while they
// click around. Returns 0 on the server and during hydration; components treat 0 as "default order".

'use client'

import { useSyncExternalStore } from 'react'

const KEY = 'pg_session_seed'
let memo: number | null = null

function read(): number {
  if (memo !== null) return memo
  try {
    const stored = sessionStorage.getItem(KEY)
    if (stored && Number(stored) > 0) {
      memo = Number(stored)
    } else {
      memo = 1 + Math.floor(Math.random() * 2147483646)
      sessionStorage.setItem(KEY, String(memo))
    }
  } catch {
    memo = 1 + Math.floor(Math.random() * 2147483646) // storage blocked: random once per page load
  }
  return memo
}

const subscribe = () => () => {}

export function useSessionSeed(): number {
  return useSyncExternalStore(subscribe, read, () => 0)
}
