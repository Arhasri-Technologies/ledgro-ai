import { ChevronRight } from 'lucide-react'
import { Reveal } from './Reveal'

const capabilities = [
  {
    title: 'Real-time vision',
    body: 'Reads context as it happens and surfaces what matters before you ask.',
  },
  {
    title: 'Layered insight',
    body: 'Moves from rough outline to sharp output without losing the thread.',
  },
  {
    title: 'Adaptive speed',
    body: 'Learns your cadence and tightens every pass as you work.',
  },
]

export function SectionTwo() {
  return (
    <section
      className="flex min-h-screen flex-col justify-between px-5 pb-12 pt-24 supports-[height:100svh]:min-h-[100svh] sm:px-8 sm:pt-28 md:px-12 md:pb-16"
    >
      <div className="flex flex-col gap-8 sm:flex-row sm:justify-between">
        <Reveal delayMs={120}>
          <p className="border-l-2 border-white bg-white/15 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.15em] backdrop-blur-md">
            Insight On Demand
          </p>
        </Reveal>
        <Reveal delayMs={220} className="max-w-sm sm:text-right">
          <p className="text-lg leading-relaxed text-white drop-shadow-md sm:text-xl">
            Our AI doesn&apos;t just respond — it interprets, sharpens, and delivers the signal you need.
          </p>
        </Reveal>
      </div>

      <div className="mt-16 flex flex-1 flex-col justify-end gap-12 md:mt-0 md:flex-row md:items-end md:justify-between md:gap-16">
        <div className="max-w-xl">
          <Reveal delayMs={180}>
            <h2 className="text-5xl font-normal leading-[1.05] tracking-tight text-white drop-shadow-lg sm:text-6xl lg:text-7xl">
              Learn to see
              <br />
              brilliantly.
            </h2>
          </Reveal>
          <Reveal delayMs={320}>
            <p className="mt-6 max-w-md text-sm text-white/80 drop-shadow-md sm:text-base">
              From the first sketch to the final render, Nova turns raw intent into decisions your team can act on —
              quietly, precisely, at speed.
            </p>
          </Reveal>
          <Reveal delayMs={420}>
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                className="inline-flex items-center gap-1 rounded-full bg-white px-5 py-2.5 text-xs font-medium text-black transition-colors duration-300 hover:bg-white/85 sm:text-sm"
              >
                Run the demo
                <ChevronRight size={14} aria-hidden />
              </button>
              <button
                type="button"
                className="rounded-full border border-white/25 bg-white/10 px-5 py-2.5 text-xs backdrop-blur-md transition-colors duration-300 hover:bg-white/20 sm:text-sm"
              >
                Free consultation
              </button>
            </div>
          </Reveal>
        </div>

        <div className="w-full max-w-md rounded-2xl border border-white/15 bg-white/10 backdrop-blur-md px-5 sm:px-6">
          {capabilities.map((cap, i) => (
            <Reveal key={cap.title} delayMs={300 + i * 110}>
              <div
                className={`flex gap-5 py-5 ${i < capabilities.length - 1 ? 'border-b border-white/15' : ''}`}
              >
                <span className="font-mono text-[11px] tracking-[0.15em] text-white/55">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="group flex items-center justify-between gap-2">
                    <h3 className="text-base font-medium text-white sm:text-lg">{cap.title}</h3>
                    <ChevronRight
                      size={16}
                      className="shrink-0 text-white/40 transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-white"
                      aria-hidden
                    />
                  </div>
                  <p className="mt-1.5 text-sm leading-relaxed text-white/70">{cap.body}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
