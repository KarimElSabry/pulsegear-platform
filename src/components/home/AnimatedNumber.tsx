// src/components/home/AnimatedNumber.tsx
'use client'

import CountUp from 'react-countup'
import { useInView } from 'react-intersection-observer'
import { useReducedMotion } from 'framer-motion'

export default function AnimatedNumber({ value, suffix = '' }: { value: number; suffix?: string }) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.4 })
  const reduce = useReducedMotion()
  return (
    <span ref={ref} className="tabular-nums">
      {inView && !reduce ? <CountUp end={value} duration={1.6} separator="," /> : value}
      {suffix}
    </span>
  )
}
