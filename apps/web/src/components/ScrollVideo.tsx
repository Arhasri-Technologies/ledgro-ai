import { useEffect, useRef, useState } from 'react'
import { HERO_VIDEO_URL } from '../constants'

function objectCoverRect(
  vw: number,
  vh: number,
  cw: number,
  ch: number,
): { sx: number; sy: number; sw: number; sh: number; dx: number; dy: number; dw: number; dh: number } {
  const scale = Math.max(cw / vw, ch / vh)
  const sw = cw / scale
  const sh = ch / scale
  const sx = (vw - sw) / 2
  const sy = (vh - sh) / 2
  return { sx, sy, sw, sh, dx: 0, dy: 0, dw: cw, dh: ch }
}

export function ScrollVideo() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [posterHidden, setPosterHidden] = useState(false)
  const [videoVisible, setVideoVisible] = useState(false)
  const [canvasReady, setCanvasReady] = useState(false)

  const framesRef = useRef<ImageBitmap[]>([])
  const smoothedRef = useRef(0)
  const rafRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    const video = videoRef.current
    if (!canvas || !video) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let frames: ImageBitmap[] = []
    let cacheReady = false
    let videoHasFrame = false
    let cancelled = false

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2)
      const w = window.innerWidth
      const h = window.innerHeight
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const drawBitmap = (bitmap: ImageBitmap) => {
      const cw = window.innerWidth
      const ch = window.innerHeight
      const { sx, sy, sw, sh, dx, dy, dw, dh } = objectCoverRect(bitmap.width, bitmap.height, cw, ch)
      ctx.clearRect(0, 0, cw, ch)
      ctx.drawImage(bitmap, sx, sy, sw, sh, dx, dy, dw, dh)
    }

    const extractFrames = async (offscreen: HTMLVideoElement) => {
      const duration = offscreen.duration
      if (!duration || !Number.isFinite(duration)) return

      const count = Math.min(90, Math.max(24, Math.floor(duration * 12)))
      const maxW = 960
      const vw = offscreen.videoWidth
      const vh = offscreen.videoHeight
      const scale = vw > maxW ? maxW / vw : 1
      const tw = Math.floor(vw * scale)
      const th = Math.floor(vh * scale)

      const off = document.createElement('canvas')
      off.width = tw
      off.height = th
      const offCtx = off.getContext('2d')
      if (!offCtx) return

      const seek = (t: number) =>
        new Promise<void>((resolve) => {
          const onSeeked = () => {
            offscreen.removeEventListener('seeked', onSeeked)
            resolve()
          }
          offscreen.addEventListener('seeked', onSeeked)
          offscreen.currentTime = Math.min(t, duration - 0.05)
        })

      const extracted: ImageBitmap[] = []
      for (let i = 0; i < count; i++) {
        if (cancelled) break
        const t = (i / (count - 1)) * (duration - 0.05)
        await seek(t)
        offCtx.drawImage(offscreen, 0, 0, tw, th)
        extracted.push(await createImageBitmap(off))
      }

      if (!cancelled && extracted.length > 0) {
        frames = extracted
        framesRef.current = extracted
        cacheReady = true
        setCanvasReady(true)
      }
    }

    const onVideoData = () => {
      videoHasFrame = true
      setVideoVisible(true)
      setPosterHidden(true)

      const off = document.createElement('video')
      off.src = HERO_VIDEO_URL
      off.muted = true
      off.playsInline = true
      off.preload = 'auto'
      off.crossOrigin = 'anonymous'

      const startExtract = () => {
        setTimeout(() => {
          if (!cancelled) void extractFrames(off)
        }, 300)
      }

      off.addEventListener('loadeddata', startExtract, { once: true })
      off.load()
    }

    video.addEventListener('loadeddata', onVideoData, { once: true })
    video.src = HERO_VIDEO_URL
    video.load()

    resize()
    window.addEventListener('resize', resize)

    let lastSeek = -1

    const tick = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight
      const target = maxScroll > 0 ? Math.min(1, Math.max(0, window.scrollY / maxScroll)) : 0
      smoothedRef.current += (target - smoothedRef.current) * 0.12
      const p = smoothedRef.current

      if (cacheReady && frames.length > 0) {
        const idx = Math.min(frames.length - 1, Math.floor(p * (frames.length - 1)))
        drawBitmap(frames[idx])
      } else if (videoHasFrame && video.duration) {
        const t = p * (video.duration - 0.05)
        if (Math.abs(t - lastSeek) > 0.04) {
          lastSeek = t
          video.currentTime = t
        }
      }

      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)

    return () => {
      cancelled = true
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
      frames.forEach((f) => f.close())
    }
  }, [])

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#0a0a0a]" aria-hidden>
      <img
        src="/hero-poster.jpg"
        alt=""
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
          posterHidden ? 'opacity-0' : 'opacity-100'
        }`}
      />
      <video
        ref={videoRef}
        muted
        playsInline
        preload="auto"
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
          canvasReady ? 'opacity-0' : videoVisible ? 'opacity-100' : 'opacity-0'
        }`}
      />
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
          canvasReady ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  )
}
