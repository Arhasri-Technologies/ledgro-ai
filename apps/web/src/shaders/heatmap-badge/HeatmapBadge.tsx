import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";

import heatmapBadgeSource from "./sources/heatmap-badge.html?raw";

export type HeatmapBadgeVariant = "vinyl" | "thermal";

export type HeatmapBadgeProps = {
  variant?: HeatmapBadgeVariant;
  className?: string;
  style?: CSSProperties;
};

const THEME = {
  source: heatmapBadgeSource,
  background: "#161616",
  label: "DataServ new-hire badge suspended from a lanyard",
};

function buildHeatmapBadgeDocument(source: string, reducedMotion: boolean) {
  if (!reducedMotion) return source;

  return source.replace(
    "  requestAnimationFrame(frame);\n}",
    '  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) requestAnimationFrame(frame);\n}',
  );
}

export function HeatmapBadge({ variant = "vinyl", className = "", style }: HeatmapBadgeProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const intersectsRef = useRef(true);
  const [documentVisible, setDocumentVisible] = useState(() => (
    typeof document === "undefined" || !document.hidden
  ));
  const [hostVisible, setHostVisible] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(() => (
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ));
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || typeof IntersectionObserver === "undefined") return undefined;
    const observer = new IntersectionObserver(([entry]) => {
      intersectsRef.current = entry?.isIntersecting ?? true;
      setHostVisible(intersectsRef.current);
    }, { rootMargin: "80px" });
    observer.observe(host);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return undefined;
    const update = () => setDocumentVisible(!document.hidden);
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  const source = useMemo(
    () => buildHeatmapBadgeDocument(THEME.source, reducedMotion),
    [reducedMotion],
  );
  const mounted = hostVisible && documentVisible;

  useEffect(() => {
    setReady(false);
  }, [mounted, reducedMotion, variant]);

  return (
    <div
      ref={hostRef}
      className={`threeui-background heatmap-badge${className ? ` ${className}` : ""}`}
      role="img"
      aria-label={THEME.label}
      data-variant={variant}
      data-state={!mounted ? "paused" : ready ? "ready" : "loading"}
      style={{ background: THEME.background, pointerEvents: "auto", ...style }}
    >
      {mounted ? (
        <iframe
          key="heatmap-badge-frame"
          title={THEME.label}
          srcDoc={source.replace(
            "s=Math.min(1,(vw-28)/PW,(vh-28)/(PH+150));",
            "s=Math.min((vw-28)/PW,(vh-28)/(PH+150));",
          ).replace(
            "var dpr=0,cdpr=1;",
            "var dpr=0,cdpr=1,layoutWidth=0,layoutHeight=0;",
          ).replace(
            "function resize(){\n  var d=Math.max(1,Math.min(2,window.devicePixelRatio||1));",
            "function resize(){\n  var viewportWidth=window.innerWidth,viewportHeight=window.innerHeight;\n  if(viewportWidth!==layoutWidth||viewportHeight!==layoutHeight){\n    layoutWidth=viewportWidth;layoutHeight=viewportHeight;layout();\n  }\n  var d=Math.max(1,Math.min(2,window.devicePixelRatio||1));",
          )}
          sandbox="allow-scripts"
          loading="eager"
          onLoad={() => setReady(true)}
          style={{
            position: "absolute",
            inset: 0,
            display: "block",
            width: "100%",
            height: "100%",
            border: 0,
            background: THEME.background,
            opacity: ready ? 1 : 0,
            pointerEvents: ready ? "auto" : "none",
            transition: reducedMotion ? "none" : "opacity 160ms ease-out",
          }}
        />
      ) : null}
    </div>
  );
}
