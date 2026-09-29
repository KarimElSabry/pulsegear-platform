// src/content/hero-videos.ts
// The homepage hero plays these clips in random order, crossfading from one to the next.
//
// HOW TO ADD A VIDEO
//   1. Put the file in /public/video/   (example: public/video/run-sunrise.mp4)
//   2. Add one line below.
// The poster image is shown until the first clip is ready, and whenever the list is empty,
// on data-saver connections, and for visitors who prefer reduced motion.
//
// TIPS: 10 to 20 seconds each, 1920x1080, no audio, H.264 MP4 under 4 MB (webm optional,
// usually smaller). With N clips a visitor downloads one clip at a time plus the next one.

export type HeroClip = { mp4: string; webm?: string }

export const HERO_CLIPS: HeroClip[] = [

  { mp4: '/video/marathon1.mp4' },
  { mp4: '/video/marathon2.mp4' },
  { mp4: '/video/marathon3.mp4' },
  { mp4: '/video/marathon4.mp4' },
  { mp4: '/video/garmin_footage.mp4' },
  // { mp4: '/video/run-sunrise.mp4', webm: '/video/run-sunrise.webm' },
  // { mp4: '/video/track-intervals.mp4' },
  // { mp4: '/video/trail-watch.mp4' },
]
