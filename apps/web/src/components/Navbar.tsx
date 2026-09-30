import { Hexagon } from 'lucide-react'
import { Reveal } from './Reveal'

const links = [
  { label: 'Projects', superscript: '6' },
  { label: 'About' },
  { label: 'Blog' },
  { label: 'Contact' },
]

export function Navbar() {
  return (
    <header className="fixed top-0 z-50 w-full border-b border-white/15">
      <div className="flex items-center justify-between px-5 py-4 sm:px-8 md:px-12">
        <Reveal delayMs={0}>
          <a href="/" className="flex items-center gap-2 text-lg font-medium tracking-tight text-white sm:text-xl">
            <Hexagon size={24} strokeWidth={1.5} aria-hidden />
            novaai
          </a>
        </Reveal>

        <nav className="hidden items-center gap-8 md:flex lg:gap-10">
          {links.map((link, i) => (
            <Reveal key={link.label} delayMs={100 + i * 100}>
              <a href={`#${link.label.toLowerCase()}`} className="text-sm text-white/85 transition-colors duration-300 hover:text-white">
                {link.label}
                {link.superscript && (
                  <sup className="ml-0.5 font-mono text-[10px] text-white/60">{link.superscript}</sup>
                )}
              </a>
            </Reveal>
          ))}
        </nav>

        <Reveal delayMs={500}>
          <button
            type="button"
            className="rounded-md border border-white/20 bg-white/15 px-4 py-2 text-xs backdrop-blur-md transition-colors duration-300 hover:bg-white/25 sm:px-5 sm:text-sm"
          >
            Get Free Consultation
          </button>
        </Reveal>
      </div>
    </header>
  )
}
