import { Navbar } from './components/Navbar'
import { ScrollVideo } from './components/ScrollVideo'
import { SectionOne } from './components/SectionOne'
import { SectionTwo } from './components/SectionTwo'

export default function App() {
  return (
    <div className="relative min-h-screen bg-[#0a0a0a] text-white antialiased">
      <ScrollVideo />
      <div className="relative z-10">
        <Navbar />
        <main>
          <SectionOne />
          <div className="h-[80vh]" aria-hidden />
          <SectionTwo />
        </main>
      </div>
    </div>
  )
}
