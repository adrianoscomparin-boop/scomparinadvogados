"use client";

import { useEffect, useRef, useState } from "react";

const SETTLE_TRANSITION = "transform 700ms cubic-bezier(0.34, 1.56, 0.64, 1)";
const IDLE_DELAY_MS = 3000;

function useNow() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return now;
}

function useIdle(delay: number) {
  const [idle, setIdle] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const wake = () => {
      setIdle(false);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setIdle(true), delay);
    };
    wake();
    window.addEventListener("mousemove", wake);
    window.addEventListener("touchstart", wake);
    window.addEventListener("keydown", wake);
    return () => {
      window.removeEventListener("mousemove", wake);
      window.removeEventListener("touchstart", wake);
      window.removeEventListener("keydown", wake);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [delay]);

  return idle;
}

function useWakeLock() {
  useEffect(() => {
    let sentinel: WakeLockSentinel | null = null;

    const request = async () => {
      try {
        if ("wakeLock" in navigator) {
          sentinel = await navigator.wakeLock.request("screen");
        }
      } catch {
        // Not supported or denied — the clock still works, it just won't
        // stop the display from sleeping on its own.
      }
    };

    request();

    const onVisibility = () => {
      if (document.visibilityState === "visible") request();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      sentinel?.release().catch(() => {});
    };
  }, []);
}

function useFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const onChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toggle = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      document.documentElement.requestFullscreen().catch(() => {});
    }
  };

  return { isFullscreen, toggle };
}

const HOUR_TICKS = Array.from({ length: 12 }, (_, i) => i);

export default function SchipholClock() {
  const now = useNow();
  const idle = useIdle(IDLE_DELAY_MS);
  const { isFullscreen, toggle } = useFullscreen();
  useWakeLock();

  const hours = now.getHours() % 12;
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();

  const hourAngle = (hours + minutes / 60) * 30;
  const minuteAngle = minutes * 6;

  const displayHours = now.getHours() % 12 || 12;
  const period = now.getHours() < 12 ? "AM" : "PM";
  const digital = `${String(displayHours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(
    seconds,
  ).padStart(2, "0")} ${period}`;

  return (
    <div
      className="relative flex h-full min-h-screen w-full flex-col items-center justify-center gap-4 bg-[#0d0d0d]"
      style={{ cursor: idle ? "none" : "default" }}
    >
      <svg viewBox="0 0 200 200" className="h-full max-h-[85vh] w-auto max-w-full aspect-square">
        <defs>
          <filter id="brush" x="-30%" y="-30%" width="160%" height="160%">
            <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="2" seed="7" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.3" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>

        {/* Face */}
        <circle cx="100" cy="100" r="94" fill="#f2ede1" />
        <circle cx="100" cy="100" r="94" fill="none" stroke="#0d0d0d" strokeWidth="0.75" opacity="0.15" />

        {/* Hour ticks */}
        {HOUR_TICKS.map((i) => {
          const angle = i * 30;
          const isCardinal = i % 3 === 0;
          return (
            <line
              key={i}
              x1="100"
              y1={isCardinal ? "10" : "13"}
              x2="100"
              y2="19"
              stroke="#1a1a1a"
              strokeWidth={isCardinal ? 2.6 : 1.4}
              strokeLinecap="round"
              transform={`rotate(${angle} 100 100)`}
            />
          );
        })}

        {/* Hour hand */}
        <g style={{ transform: `rotate(${hourAngle}deg)`, transformOrigin: "100px 100px" }}>
          <path
            d="M 100 100 L 97 55 Q 100 49 103 55 Z"
            fill="#1a1a1a"
            filter="url(#brush)"
          />
        </g>

        {/* Minute hand */}
        <g
          style={{
            transform: `rotate(${minuteAngle}deg)`,
            transformOrigin: "100px 100px",
            transition: SETTLE_TRANSITION,
          }}
        >
          <path
            d="M 100 100 L 97.5 20 Q 100 13 102.5 20 Z"
            fill="#1a1a1a"
            filter="url(#brush)"
          />
        </g>

        {/* Pivot */}
        <circle cx="100" cy="100" r="3" fill="#1a1a1a" />
      </svg>

      <p
        className="font-mono text-white/25"
        style={{ fontSize: "clamp(0.75rem, 2.2vw, 1.25rem)", letterSpacing: "0.15em" }}
      >
        {digital}
      </p>

      <button
        type="button"
        onClick={toggle}
        className="absolute bottom-4 right-4 rounded-full border border-white/20 bg-black/40 px-4 py-2 text-xs text-white/70 backdrop-blur transition-opacity duration-500 hover:bg-black/60"
        style={{ opacity: idle ? 0 : 1, pointerEvents: idle ? "none" : "auto" }}
      >
        {isFullscreen ? "Sair da tela cheia" : "Tela cheia"}
      </button>
    </div>
  );
}
