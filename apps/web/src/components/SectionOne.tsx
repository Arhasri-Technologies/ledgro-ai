import { ChevronRight } from 'lucide-react'
import { MITA_PORTRAIT_URL } from '../constants'
import { Reveal } from './Reveal'

const services = ['/ AI AUTOMATION', '/ AI INTEGRATION', '/ AI AGENT DEVELOPMENT']

export function SectionOne() {
  return (
    <section
      className="flex min-h-screen flex-col justify-between px-5 pb-12 pt-24 supports-[height:100svh]:min-h-[100svh] sm:px-8 sm:pt-28 md:px-12 md:pb-16"
    >
      <div className="flex flex-col gap-8 sm:flex-row sm:justify-between">
        <div className="flex flex-col gap-2">
          {services.map((line, i) => (
            <Reveal key={line} delayMs={150 + i * 120}>
              <p className="font-mono text-xs uppercase tracking-[0.15em] text-white/90 drop-shadow-md">{line}</p>
            </Reveal>
          ))}
        </div>
        <Reveal delayMs={300} className="max-w-xs sm:text-right">
          <p className="text-lg leading-relaxed text-white drop-shadow-md sm:text-xl">
            We design automation that brings clarity, precision, and efficiency to the way your company operates.
          </p>
        </Reveal>
      </div>

      <div className="mt-16 flex flex-col gap-8 md:mt-0 md:flex-row md:items-end md:justify-between">
        <div>
          <Reveal delayMs={150}>
            <p className="mb-5 border-l-2 border-white bg-white/15 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.15em] backdrop-blur-md">
              We Automate 100+ Businesses
            </p>
          </Reveal>
          <Reveal delayMs={280}>
            <h1 className="text-5xl font-normal leading-[1.05] tracking-tight text-white drop-shadow-lg sm:text-6xl lg:text-7xl">
              Clear. Precise.
              <br />
              Automated.
            </h1>
          </Reveal>
        </div>

        <Reveal delayMs={420}>
          <div className="flex items-center gap-4 rounded-xl bg-white/15 p-3 backdrop-blur-md">
            <img
              src={MITA_PORTRAIT_URL}
              alt="Mitha, co-founder of NovaAI"
              className="h-24 w-20 rounded-lg object-cover"
              width={80}
              height={96}
            />
            <div className="flex flex-col gap-1.5 pr-2">
              <p className="text-sm font-medium text-white">Talk with Mitha</p>
              <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/60">Co-founder of NovaAI</p>
              <button
                type="button"
                className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-white px-4 py-2 text-xs font-medium text-black transition-colors duration-300 hover:bg-white/85"
              >
                Book 15-mins call
                <ChevronRight size={14} aria-hidden />
              </button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
