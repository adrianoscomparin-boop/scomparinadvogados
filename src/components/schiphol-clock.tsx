"use client";

import { useEffect, useRef, useState } from "react";

const CENTER = 100;
const FACE_R = 94;
const MINUTE_LEN = 78;
const HOUR_LEN = 50;
const MINUTE_W = 2.3;
const HOUR_W = 3.1;

/**
 * O chão é uma linha imaginária: a escada nasce nele e o pintor nunca fica
 * abaixo dele. Os limites de x mantêm a base da escada dentro do mostrador,
 * que é redondo e por isso estreita justamente na altura do chão.
 */
const FLOOR_Y = 160;
const LADDER_TOP_Y = 40;
const BODY_X_MIN = 36;
const BODY_X_MAX = 164;

/** Onde o pintor fica de pé entre um serviço e outro, junto do balde. */
const STAND = { x: 46, y: FLOOR_Y };
const IDLE_DELAY_MS = 3000;

/**
 * O ponteiro dos minutos é apagado da ponta para o centro nos últimos 3s do
 * minuto e repintado do centro para fora nos primeiros 4s do minuto seguinte —
 * o rodo passa pelo centro exatamente na virada, então a troca de ângulo não
 * tem salto visível. O ponteiro das horas anda de 12 em 12 minutos e é
 * refeito do mesmo jeito.
 */
const HOUR_STEP_MIN = 12;

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);

type Point = { x: number; y: number };

function pointAt(angleDeg: number, radius: number): Point {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: CENTER + Math.cos(rad) * radius, y: CENTER + Math.sin(rad) * radius };
}

/**
 * Onde os pés ficam para a mão alcançar `tool`: um degrau abaixo do serviço,
 * nunca acima do topo da escada nem abaixo do chão.
 */
function footFor(tool: Point): Point {
  const side = tool.x >= CENTER ? 1 : -1;
  return {
    x: clamp(tool.x + side * 13, BODY_X_MIN, BODY_X_MAX),
    y: clamp(tool.y + 27, LADDER_TOP_Y + 6, FLOOR_Y),
  };
}

const lerpPoint = (a: Point, b: Point, p: number): Point => ({
  x: a.x + (b.x - a.x) * p,
  y: a.y + (b.y - a.y) * p,
});

/**
 * Trajeto do pintor entre dois serviços: desce a escada, empurra ela pelo chão
 * e sobe do outro lado — nunca atravessa o mostrador pelo ar. O tempo é
 * repartido pela distância de cada trecho, então a velocidade é constante.
 */
function travelPath(a: Point, b: Point, p: number): Point {
  const bottomA = { x: a.x, y: FLOOR_Y };
  const bottomB = { x: b.x, y: FLOOR_Y };

  const descent = FLOOR_Y - a.y;
  const walk = Math.abs(b.x - a.x);
  const climb = FLOOR_Y - b.y;
  const total = descent + walk + climb;
  if (total === 0) return a;

  const endOfDescent = descent / total;
  const endOfWalk = (descent + walk) / total;

  if (p <= endOfDescent) {
    return lerpPoint(a, bottomA, descent === 0 ? 1 : p / endOfDescent);
  }
  if (p <= endOfWalk) {
    return lerpPoint(bottomA, bottomB, walk === 0 ? 1 : (p - endOfDescent) / (endOfWalk - endOfDescent));
  }
  return lerpPoint(bottomB, b, climb === 0 ? 1 : (p - endOfWalk) / (1 - endOfWalk));
}

function handPath(len: number, width: number) {
  if (len < 1.5) return "";
  const tip = CENTER - len;
  return [
    `M ${CENTER - width} ${CENTER}`,
    `L ${CENTER - width * 0.5} ${tip + 1.5}`,
    `L ${CENTER} ${tip - 1.5}`,
    `L ${CENTER + width * 0.5} ${tip + 1.5}`,
    `L ${CENTER + width} ${CENTER}`,
    "Z",
  ].join(" ");
}

/** Ângulo do ponteiro das horas, que só muda a cada HOUR_STEP_MIN minutos. */
function steppedHourAngle(date: Date) {
  const h = date.getHours() % 12;
  const m = Math.floor(date.getMinutes() / HOUR_STEP_MIN) * HOUR_STEP_MIN;
  return (h + m / 60) * 30;
}

/** Trabalhando: a ferramenta manda no corpo. Andando/parado: o corpo manda na ferramenta. */
type Pose = { kind: "work"; tool: Point } | { kind: "travel"; foot: Point; walking: boolean };

type Residue = { angle: number; from: number; to: number; width: number };

type Frame = {
  minuteAngle: number;
  minuteLen: number;
  hourAngle: number;
  hourLen: number;
  pose: Pose;
  residue: Residue | null;
};

function computeFrame(now: Date): Frame {
  const minutes = now.getMinutes();
  const t = now.getSeconds() + now.getMilliseconds() / 1000;

  const minuteAngle = minutes * 6;
  const hourNew = steppedHourAngle(now);
  const hourOld = steppedHourAngle(new Date(now.getTime() - HOUR_STEP_MIN * 60_000));
  const hourJob = minutes % HOUR_STEP_MIN === 0 && hourNew !== hourOld;

  const minuteTip = pointAt(minuteAngle, MINUTE_LEN);
  const hourTipOld = pointAt(hourOld, HOUR_LEN);
  const hourTipNew = pointAt(hourNew, HOUR_LEN);

  const frame: Frame = {
    minuteAngle,
    minuteLen: MINUTE_LEN,
    hourAngle: hourNew,
    hourLen: HOUR_LEN,
    pose: { kind: "travel", foot: STAND, walking: false },
    residue: null,
  };

  if (t < 4) {
    // Pintando o ponteiro dos minutos, do centro para fora.
    frame.minuteLen = MINUTE_LEN * (t / 4);
    frame.pose = { kind: "work", tool: pointAt(minuteAngle, frame.minuteLen) };
    if (hourJob) frame.hourAngle = hourOld;
  } else if (hourJob && t < 21) {
    frame.hourAngle = hourOld;
    if (t < 10) {
      // Indo do ponteiro dos minutos até o das horas.
      const foot = travelPath(footFor(minuteTip), footFor(hourTipOld), (t - 4) / 6);
      frame.pose = { kind: "travel", foot, walking: true };
    } else if (t < 14) {
      // Apagando o ponteiro das horas.
      frame.hourLen = HOUR_LEN * (1 - (t - 10) / 4);
      frame.pose = { kind: "work", tool: pointAt(hourOld, frame.hourLen) };
      frame.residue = { angle: hourOld, from: frame.hourLen, to: HOUR_LEN, width: HOUR_W };
    } else if (t < 18) {
      // Repintando o ponteiro das horas na posição nova.
      frame.hourAngle = hourNew;
      frame.hourLen = HOUR_LEN * ((t - 14) / 4);
      frame.pose = { kind: "work", tool: pointAt(hourNew, frame.hourLen) };
    } else {
      // Voltando para o balde.
      frame.hourAngle = hourNew;
      const foot = travelPath(footFor(hourTipNew), STAND, (t - 18) / 3);
      frame.pose = { kind: "travel", foot, walking: true };
    }
  } else if (t < 7) {
    // Voltando do ponteiro dos minutos para o balde.
    const foot = travelPath(footFor(minuteTip), STAND, (t - 4) / 3);
    frame.pose = { kind: "travel", foot, walking: true };
  } else if (t < 52) {
    frame.pose = { kind: "travel", foot: STAND, walking: false };
  } else if (t < 57) {
    // Indo até a ponta do ponteiro dos minutos com o rodo.
    const foot = travelPath(STAND, footFor(minuteTip), (t - 52) / 5);
    frame.pose = { kind: "travel", foot, walking: true };
  } else {
    // Apagando o ponteiro dos minutos, da ponta para o centro.
    frame.minuteLen = MINUTE_LEN * (1 - (t - 57) / 3);
    frame.pose = { kind: "work", tool: pointAt(minuteAngle, frame.minuteLen) };
    frame.residue = { angle: minuteAngle, from: frame.minuteLen, to: MINUTE_LEN, width: MINUTE_W };
  }

  return frame;
}

/** Só vale gastar 30fps enquanto o pintor está em cena. */
function isBusy(now: Date) {
  const t = now.getSeconds();
  if (t >= 52 || t < 8) return true;
  return now.getMinutes() % HOUR_STEP_MIN === 0 && t < 22;
}

/**
 * Devolve `null` até o primeiro quadro no cliente: a página é pré-renderizada,
 * então marcar a hora no servidor quebraria a hidratação.
 */
function useAnimationClock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    let raf = 0;
    let lastCommit = 0;

    const loop = (timestamp: number) => {
      raf = requestAnimationFrame(loop);
      const current = new Date();
      const interval = isBusy(current) ? 33 : 500;
      if (timestamp - lastCommit < interval) return;
      lastCommit = timestamp;
      setNow(current);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
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
        // Sem suporte ou negado — o relógio segue funcionando, só não impede
        // o monitor de dormir sozinho.
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

const INK = "#1a1a1a";
const OVERALLS = "#2c4a78";
const FACE = "#f2ede1";
const METAL = "#8b929c";

type Rig = {
  bodyX: number;
  feetY: number;
  side: number;
  swing: number;
  tool: Point;
};

function buildRig(pose: Pose, phase: number): Rig {
  if (pose.kind === "work") {
    const foot = footFor(pose.tool);
    return {
      bodyX: foot.x,
      feetY: foot.y,
      side: pose.tool.x >= CENTER ? 1 : -1,
      swing: 1.6,
      tool: pose.tool,
    };
  }

  const bodyX = clamp(pose.foot.x, BODY_X_MIN, BODY_X_MAX);
  const feetY = clamp(pose.foot.y, LADDER_TOP_Y + 6, FLOOR_Y);
  const side = bodyX >= CENTER ? 1 : -1;
  return {
    bodyX,
    feetY,
    side,
    // Rodo carregado junto ao quadril enquanto anda ou espera.
    swing: pose.walking ? Math.sin(phase * 9) * 4 : 1.6,
    tool: { x: bodyX + side * 7, y: feetY - 11 },
  };
}

/**
 * Escada com rodízios, de altura fixa, que acompanha o pintor pelo mostrador.
 * É ela que sustenta a figura: os pés dele pousam sempre num degrau, em vez de
 * ficarem no ar. Fica na frente dos ponteiros (a tinta está na parede, a escada
 * está diante dela) e atrás do pintor.
 */
function Ladder({ x }: { x: number }) {
  const railX = (y: number, sign: number) => {
    const p = (y - LADDER_TOP_Y) / (FLOOR_Y - LADDER_TOP_Y);
    return x + sign * (3.4 + 1.4 * p);
  };

  const rungs: number[] = [];
  for (let y = LADDER_TOP_Y + 9; y <= FLOOR_Y - 7; y += 11) rungs.push(y);

  return (
    <g stroke={METAL} strokeLinecap="round" opacity="0.75">
      <line
        x1={railX(LADDER_TOP_Y, -1)}
        y1={LADDER_TOP_Y}
        x2={railX(FLOOR_Y, -1)}
        y2={FLOOR_Y}
        strokeWidth="1.6"
      />
      <line
        x1={railX(LADDER_TOP_Y, 1)}
        y1={LADDER_TOP_Y}
        x2={railX(FLOOR_Y, 1)}
        y2={FLOOR_Y}
        strokeWidth="1.6"
      />
      {rungs.map((y) => (
        <line key={y} x1={railX(y, -1)} y1={y} x2={railX(y, 1)} y2={y} strokeWidth="1.1" />
      ))}
      <circle cx={railX(FLOOR_Y, -1)} cy={FLOOR_Y + 1.8} r="1.7" fill={METAL} stroke="none" />
      <circle cx={railX(FLOOR_Y, 1)} cy={FLOOR_Y + 1.8} r="1.7" fill={METAL} stroke="none" />
    </g>
  );
}

/**
 * Desenha o pintor. Na passada `halo` tudo sai da cor do mostrador e mais
 * grosso, formando um contorno — sem ele a figura some quando cruza os
 * ponteiros, que são da mesma cor escura.
 */
function PainterBody({ rig, halo }: { rig: Rig; halo?: boolean }) {
  const { bodyX, feetY, side, swing, tool } = rig;
  const hipY = feetY - 12;
  const shoulderY = feetY - 23;
  const headY = feetY - 28;

  const grow = halo ? 2.6 : 0;
  const paint = (color: string) => (halo ? FACE : color);

  const armDx = tool.x - bodyX;
  const armDy = tool.y - shoulderY;
  const armLen = Math.hypot(armDx, armDy) || 1;
  const perp = { x: (-armDy / armLen) * 3.6, y: (armDx / armLen) * 3.6 };

  return (
    <g>
      {/* pernas */}
      <line
        x1={bodyX}
        y1={hipY}
        x2={bodyX - swing}
        y2={feetY}
        stroke={paint(OVERALLS)}
        strokeWidth={2.8 + grow}
        strokeLinecap="round"
      />
      <line
        x1={bodyX}
        y1={hipY}
        x2={bodyX + swing}
        y2={feetY}
        stroke={paint(OVERALLS)}
        strokeWidth={2.8 + grow}
        strokeLinecap="round"
      />

      {/* tronco de macacão */}
      <line
        x1={bodyX}
        y1={shoulderY - 1}
        x2={bodyX}
        y2={hipY}
        stroke={paint(OVERALLS)}
        strokeWidth={7 + grow}
        strokeLinecap="round"
      />

      {/* braço livre */}
      <line
        x1={bodyX}
        y1={shoulderY + 1}
        x2={bodyX - side * 3.5}
        y2={shoulderY + 10}
        stroke={paint(OVERALLS)}
        strokeWidth={2.4 + grow}
        strokeLinecap="round"
      />

      {/* braço de trabalho + rodo */}
      <line
        x1={bodyX}
        y1={shoulderY}
        x2={tool.x}
        y2={tool.y}
        stroke={paint(OVERALLS)}
        strokeWidth={2.4 + grow}
        strokeLinecap="round"
      />
      <line
        x1={tool.x - perp.x}
        y1={tool.y - perp.y}
        x2={tool.x + perp.x}
        y2={tool.y + perp.y}
        stroke={paint(INK)}
        strokeWidth={1.8 + grow}
        strokeLinecap="round"
      />

      {/* cabeça */}
      <circle cx={bodyX} cy={headY} r={3.4} fill={paint(INK)} stroke={paint(INK)} strokeWidth={grow} />
    </g>
  );
}

/** Pintor de macacão que apaga e repinta os ponteiros. */
function Painter({ pose, phase }: { pose: Pose; phase: number }) {
  const rig = buildRig(pose, phase);

  return (
    <g>
      {/* balde de tinta, sempre no chão junto ao lugar de descanso */}
      <path
        d={`M ${STAND.x - 14} ${STAND.y - 5} L ${STAND.x - 12.6} ${STAND.y} L ${STAND.x - 6.4} ${STAND.y} L ${STAND.x - 5} ${STAND.y - 5} Z`}
        fill={INK}
        opacity="0.85"
      />
      <Ladder x={rig.bodyX} />
      <PainterBody rig={rig} halo />
      <PainterBody rig={rig} />
    </g>
  );
}

export default function SchipholClock() {
  const now = useAnimationClock();
  const idle = useIdle(IDLE_DELAY_MS);
  const { isFullscreen, toggle } = useFullscreen();
  useWakeLock();

  const frame = now ? computeFrame(now) : null;
  const phase = now ? now.getSeconds() + now.getMilliseconds() / 1000 : 0;
  const digital = now
    ? `${String(now.getHours() % 12 || 12).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(
        now.getSeconds(),
      ).padStart(2, "0")} ${now.getHours() < 12 ? "AM" : "PM"}`
    : " ";

  return (
    <div
      className="relative flex h-full min-h-screen w-full flex-col items-center justify-center gap-4 bg-[#0d0d0d]"
      style={{ cursor: idle ? "none" : "default" }}
    >
      <svg viewBox="0 0 200 200" className="aspect-square h-full max-h-[85vh] w-auto max-w-full">
        <defs>
          <filter id="brush" x="-30%" y="-30%" width="160%" height="160%">
            <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="2" seed="7" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.3" xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <clipPath id="face-clip">
            <circle cx={CENTER} cy={CENTER} r={FACE_R} />
          </clipPath>
        </defs>

        {/* mostrador */}
        <circle cx={CENTER} cy={CENTER} r={FACE_R} fill={FACE} />
        <circle cx={CENTER} cy={CENTER} r={FACE_R} fill="none" stroke="#0d0d0d" strokeWidth="0.75" opacity="0.15" />

        <g clipPath="url(#face-clip)">
          {HOUR_TICKS.map((i) => {
            const isCardinal = i % 3 === 0;
            return (
              <line
                key={i}
                x1={CENTER}
                y1={isCardinal ? 10 : 13}
                x2={CENTER}
                y2={19}
                stroke={INK}
                strokeWidth={isCardinal ? 2.6 : 1.4}
                strokeLinecap="round"
                transform={`rotate(${i * 30} ${CENTER} ${CENTER})`}
              />
            );
          })}

          {frame && (
            <>
              {/* tinta que ainda não saiu de todo, logo atrás do rodo */}
              {frame.residue && (
                <g transform={`rotate(${frame.residue.angle} ${CENTER} ${CENTER})`} opacity="0.2" filter="url(#brush)">
                  <line
                    x1={CENTER}
                    y1={CENTER - frame.residue.from}
                    x2={CENTER}
                    y2={CENTER - frame.residue.to}
                    stroke={INK}
                    strokeWidth={frame.residue.width * 1.8}
                    strokeLinecap="round"
                  />
                </g>
              )}

              <g transform={`rotate(${frame.hourAngle} ${CENTER} ${CENTER})`}>
                <path d={handPath(frame.hourLen, HOUR_W)} fill={INK} filter="url(#brush)" />
              </g>

              <g transform={`rotate(${frame.minuteAngle} ${CENTER} ${CENTER})`}>
                <path d={handPath(frame.minuteLen, MINUTE_W)} fill={INK} filter="url(#brush)" />
              </g>

              <circle cx={CENTER} cy={CENTER} r="3" fill={INK} />

              <Painter pose={frame.pose} phase={phase} />
            </>
          )}
        </g>
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
        className="absolute right-4 bottom-4 rounded-full border border-white/20 bg-black/40 px-4 py-2 text-xs text-white/70 backdrop-blur transition-opacity duration-500 hover:bg-black/60"
        style={{ opacity: idle ? 0 : 1, pointerEvents: idle ? "none" : "auto" }}
      >
        {isFullscreen ? "Sair da tela cheia" : "Tela cheia"}
      </button>
    </div>
  );
}
