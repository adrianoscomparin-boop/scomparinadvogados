"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const CENTER = 100;
const FACE_R = 94;
const MINUTE_LEN = 78;
const HOUR_LEN = 50;
const MINUTE_W = 2.3;
const HOUR_W = 3.1;

const INK = "#1a1a1a";
const FACE = "#f2ede1";
const OVERALLS = "#2c4a78";
const METAL = "#8b929c";

/**
 * Piso reto. Os limites de x mantêm a base da escada dentro do mostrador, que é
 * redondo e por isso estreita justamente na altura do chão; em OFFSTAGE_X o
 * disco já acabou, então homem, escada e balde somem inteiros atrás da borda
 * sem precisar de nenhum truque de opacidade.
 */
const FLOOR_Y = 160;
const LADDER_LEN = 128;
const RUNG = 8;
const RAIL = 4.2;
const OFFSTAGE_X = 12;
const X_MIN = 36;
const X_MAX = 164;

// Proporções do boneco, em unidades do mostrador (≈30 de altura).
const THIGH = 8;
const SHIN = 8.5;
const UPPER_ARM = 5.6;
const FOREARM = 5.6;
const HIP_H = 15;
const TORSO = 11;
const HEAD_R = 3.3;
const STRIDE = 9;
const STEP_LIFT = 3.2;
const POLE = 13;

const HOUR_STEP_MIN = 12;
const IDLE_DELAY_MS = 3000;

type Point = { x: number; y: number };

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);
const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
const pt = (x: number, y: number): Point => ({ x, y });

function pointAt(angleDeg: number, radius: number): Point {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return pt(CENTER + Math.cos(rad) * radius, CENTER + Math.sin(rad) * radius);
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

/** Onde ele se posta para alcançar um ponto: ao lado e abaixo, com o cabo do rodo cobrindo o resto. */
function anchorFor(tool: Point): Point {
  const side = tool.x >= CENTER ? 1 : -1;
  const x = clamp(tool.x + side * 16, X_MIN, X_MAX);
  const top = FLOOR_Y - LADDER_LEN + RUNG;
  return pt(x, clamp(tool.y + 30, top, FLOOR_Y));
}

type Actor = {
  act: "walk" | "climb" | "work";
  x: number;
  feetY: number;
  tool: Point | null;
  facing: number;
};

type Residue = { angle: number; from: number; to: number; width: number };

type Stage = {
  minuteAngle: number;
  minuteLen: number;
  hourAngle: number;
  hourLen: number;
  residue: Residue | null;
  actor: Actor | null;
};

/**
 * Roteiro de um minuto. O ponteiro dos minutos é apagado da ponta para o centro
 * nos últimos 4s e repintado do centro para fora nos primeiros 6s do minuto
 * seguinte, então o rodo cruza o centro exatamente na virada e a troca de
 * ângulo não tem salto. Terminado o serviço ele desce, empurra a escada para
 * fora do mostrador e some — o relógio fica limpo por meio minuto até ele
 * voltar. De 12 em 12 minutos o ponteiro das horas entra no mesmo ritual, e a
 * ausência encurta.
 *
 * Cada quadro é função pura do relógio: nada acumula erro nem trava se a aba
 * for suspensa.
 */
function computeStage(now: Date): Stage {
  const minutes = now.getMinutes();
  const t = now.getSeconds() + now.getMilliseconds() / 1000;

  const minuteAngle = minutes * 6;
  const hourNew = steppedHourAngle(now);
  const hourOld = steppedHourAngle(new Date(now.getTime() - HOUR_STEP_MIN * 60_000));
  const hourJob = minutes % HOUR_STEP_MIN === 0 && hourNew !== hourOld;

  const minuteTip = pointAt(minuteAngle, MINUTE_LEN);
  const minuteAnchor = anchorFor(minuteTip);

  const stage: Stage = {
    minuteAngle,
    minuteLen: MINUTE_LEN,
    hourAngle: hourNew,
    hourLen: HOUR_LEN,
    residue: null,
    actor: null,
  };

  const work = (tool: Point) => {
    const anchor = anchorFor(tool);
    stage.actor = {
      act: "work",
      x: anchor.x,
      feetY: anchor.y,
      tool,
      facing: tool.x >= CENTER ? -1 : 1,
    };
  };
  const climb = (x: number, fromY: number, toY: number, p: number) => {
    stage.actor = { act: "climb", x, feetY: lerp(fromY, toY, p), tool: null, facing: 1 };
  };
  const walk = (fromX: number, toX: number, p: number) => {
    stage.actor = {
      act: "walk",
      x: lerp(fromX, toX, p),
      feetY: FLOOR_Y,
      tool: null,
      facing: toX >= fromX ? 1 : -1,
    };
  };

  // --- serviço no ponteiro dos minutos, começando na virada ----------------
  if (t < 6) {
    stage.minuteLen = MINUTE_LEN * (t / 6);
    if (hourJob) stage.hourAngle = hourOld;
    work(pointAt(minuteAngle, stage.minuteLen));
    return stage;
  }

  if (hourJob) {
    const oldAnchor = anchorFor(pointAt(hourOld, HOUR_LEN));
    const newAnchor = anchorFor(pointAt(hourNew, HOUR_LEN));
    if (t < 18) stage.hourAngle = hourOld;

    if (t < 9.5) {
      climb(minuteAnchor.x, minuteAnchor.y, FLOOR_Y, (t - 6) / 3.5);
    } else if (t < 14) {
      walk(minuteAnchor.x, oldAnchor.x, (t - 9.5) / 4.5);
    } else if (t < 18) {
      climb(oldAnchor.x, FLOOR_Y, oldAnchor.y, (t - 14) / 4);
    } else if (t < 23) {
      stage.hourLen = HOUR_LEN * (1 - (t - 18) / 5);
      stage.residue = { angle: hourOld, from: stage.hourLen, to: HOUR_LEN, width: HOUR_W };
      work(pointAt(hourOld, stage.hourLen));
    } else if (t < 29) {
      stage.hourLen = HOUR_LEN * ((t - 23) / 6);
      work(pointAt(hourNew, stage.hourLen));
    } else if (t < 32.5) {
      climb(newAnchor.x, newAnchor.y, FLOOR_Y, (t - 29) / 3.5);
    } else if (t < 37.5) {
      walk(newAnchor.x, OFFSTAGE_X, (t - 32.5) / 5);
    }
    if (t < 44) return stage;
  } else {
    if (t < 9.5) {
      climb(minuteAnchor.x, minuteAnchor.y, FLOOR_Y, (t - 6) / 3.5);
      return stage;
    }
    if (t < 14.5) {
      walk(minuteAnchor.x, OFFSTAGE_X, (t - 9.5) / 5);
      return stage;
    }
    if (t < 44) return stage;
  }

  // --- volta para apagar o ponteiro do minuto que está acabando ------------
  if (t < 50.5) {
    walk(OFFSTAGE_X, minuteAnchor.x, (t - 44) / 6.5);
  } else if (t < 56) {
    climb(minuteAnchor.x, FLOOR_Y, minuteAnchor.y, (t - 50.5) / 5.5);
  } else {
    stage.minuteLen = MINUTE_LEN * (1 - (t - 56) / 4);
    stage.residue = { angle: minuteAngle, from: stage.minuteLen, to: MINUTE_LEN, width: MINUTE_W };
    work(pointAt(minuteAngle, stage.minuteLen));
  }
  return stage;
}

/**
 * Cinemática de dois ossos: dado o quadril e o pé, acha o joelho. `dirX` diz
 * para que lado a articulação dobra em coordenadas do mundo — joelho para a
 * frente, cotovelo para trás — em vez de depender da perpendicular, que
 * inverte de lado assim que o pé passa da altura do quadril.
 */
function limb(root: Point, target: Point, l1: number, l2: number, dirX: number, toeDir: number): Point[] {
  let dx = target.x - root.x;
  let dy = target.y - root.y;
  let d = Math.hypot(dx, dy);
  const max = l1 + l2 - 0.01;
  let end = target;
  if (d > max) {
    dx *= max / d;
    dy *= max / d;
    end = pt(root.x + dx, root.y + dy);
    d = max;
  }
  if (d < 0.01) d = 0.01;

  const m = (l1 * l1 - l2 * l2 + d * d) / (2 * d);
  const h = Math.sqrt(Math.max(0, l1 * l1 - m * m));
  const ux = dx / d;
  const uy = dy / d;
  let nx = -uy;
  let ny = ux;
  if (nx * dirX < 0) {
    nx = -nx;
    ny = -ny;
  }

  const joint = pt(root.x + ux * m + nx * h, root.y + uy * m + ny * h);
  const chain = [root, joint, end];
  if (toeDir) chain.push(pt(end.x + toeDir * 2.9, end.y + 0.4));
  return chain;
}

/**
 * Passada sem patinar: o compasso vem da posição no mostrador, não do relógio.
 * Cada pé fica cravado num ponto fixo do chão durante metade do ciclo e só
 * então avança — por isso o pé nunca escorrega enquanto o corpo passa por cima.
 */
function walkFeet(x: number): Point[] {
  const s = x / STRIDE;
  const feet: Point[] = [];
  for (let i = 0; i < 2; i++) {
    const p = s + 0.5 * i;
    const k = Math.floor(p);
    const u = p - k;
    if (u < 0.5) {
      feet.push(pt((k + 0.25) * STRIDE, FLOOR_Y));
    } else {
      const q = (u - 0.5) * 2;
      const fx = lerp((k + 0.25) * STRIDE, (k + 1.25) * STRIDE, q);
      feet.push(pt(fx, FLOOR_Y - STEP_LIFT * Math.sin(Math.PI * q)));
    }
  }
  return feet;
}

/** Subida degrau a degrau: mesma lógica da passada, na vertical e travada nos degraus. */
function climbFeet(x: number, feetY: number): Point[] {
  const s = (FLOOR_Y - feetY) / RUNG;
  const feet: Point[] = [];
  for (let i = 0; i < 2; i++) {
    const p = s + 0.5 * i;
    const k = Math.floor(p);
    const u = p - k;
    const lateral = i === 0 ? -3.2 : 3.2;
    if (u < 0.5) {
      feet.push(pt(x + lateral, FLOOR_Y - (k + 0.25) * RUNG));
    } else {
      const q = (u - 0.5) * 2;
      const fy = lerp(FLOOR_Y - (k + 0.25) * RUNG, FLOOR_Y - (k + 1.25) * RUNG, q);
      feet.push(pt(x + lateral + Math.sin(Math.PI * q) * 2.2, fy));
    }
  }
  return feet;
}

type Skeleton = {
  legs: Point[][];
  torso: Point[];
  head: Point;
  arms: Point[][];
  pole: Point[];
  brush: Point[];
  ladderX: number;
};

function buildSkeleton(actor: Actor): Skeleton {
  const facing = actor.facing;
  let feet: Point[];
  let hip: Point;
  let shoulder: Point;
  let handRail: Point;
  let handTool: Point;
  let poleTip: Point;
  let kneeDir: number;
  let elbowDir: number;

  if (actor.act === "walk") {
    feet = walkFeet(actor.x);
    const s = actor.x / STRIDE;
    // O quadril sobe quando as pernas se juntam e desce na passada aberta.
    hip = pt(actor.x, FLOOR_Y - HIP_H + 0.9 * Math.abs(Math.sin(2 * Math.PI * s)));
    shoulder = pt(hip.x + facing * 0.9, hip.y - TORSO);
    handRail = pt(actor.x + facing * RAIL, shoulder.y + 2.5);
    // Rodo carregado em pé, ao lado do corpo, longe do balde.
    handTool = pt(actor.x - facing * 3.8, hip.y - 3);
    poleTip = pt(handTool.x - facing * 1.8, handTool.y - POLE);
    kneeDir = facing;
    elbowDir = -facing;
  } else if (actor.act === "climb") {
    feet = climbFeet(actor.x, actor.feetY);
    // O quadril acompanha os pés, não a altura teórica: eles estão travados em
    // degraus e podem estar a até um degrau um do outro.
    hip = pt(actor.x - 0.6, (feet[0].y + feet[1].y) / 2 - HIP_H * 0.78);
    shoulder = pt(hip.x, hip.y - TORSO);
    // A mão livre agarra o degrau mais próximo de um braço acima do ombro; como
    // o degrau é um nível fixo, ela troca de degrau sozinha durante a subida.
    const grabY = FLOOR_Y - Math.round((FLOOR_Y - (shoulder.y - 9)) / RUNG) * RUNG;
    handRail = pt(actor.x + RAIL, grabY);
    handTool = pt(actor.x - 5.5, shoulder.y + 6);
    poleTip = pt(handTool.x - 1.2, handTool.y + POLE);
    kneeDir = 1;
    elbowDir = -1;
  } else {
    // Trabalhando: pés firmes em degraus vizinhos, corpo inclinado para o
    // serviço, um braço no montante e o outro no cabo do rodo.
    const tool = actor.tool ?? pt(actor.x, actor.feetY);
    feet = [pt(actor.x - 3.2, actor.feetY), pt(actor.x + 3.2, actor.feetY - 0.6)];
    hip = pt(actor.x - facing * 1.2, actor.feetY - HIP_H);
    shoulder = pt(hip.x + facing * 2.2, hip.y - TORSO);
    handRail = pt(actor.x - facing * RAIL, shoulder.y + 4);
    const dx = tool.x - shoulder.x;
    const dy = tool.y - shoulder.y;
    const dist = Math.hypot(dx, dy) || 1;
    const grip = clamp(dist - POLE, 2.5, UPPER_ARM + FOREARM - 0.6);
    handTool = pt(shoulder.x + (dx / dist) * grip, shoulder.y + (dy / dist) * grip);
    poleTip = tool;
    kneeDir = facing;
    elbowDir = -facing;
  }

  const px = poleTip.x - handTool.x;
  const py = poleTip.y - handTool.y;
  const plen = Math.hypot(px, py) || 1;

  return {
    legs: [
      limb(hip, feet[0], THIGH, SHIN, kneeDir, facing),
      limb(hip, feet[1], THIGH, SHIN, kneeDir, facing),
    ],
    torso: [hip, shoulder],
    head: pt(shoulder.x + facing * 0.6, shoulder.y - HEAD_R - 1.1),
    arms: [
      limb(shoulder, handRail, UPPER_ARM, FOREARM, elbowDir, 0),
      limb(shoulder, handTool, UPPER_ARM, FOREARM, elbowDir, 0),
    ],
    pole: [handTool, poleTip],
    brush: [
      pt(poleTip.x + (py / plen) * 3.4, poleTip.y - (px / plen) * 3.4),
      pt(poleTip.x - (py / plen) * 3.4, poleTip.y + (px / plen) * 3.4),
    ],
    ladderX: actor.x,
  };
}

const toPoints = (chain: Point[]) => chain.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ");

/**
 * Desenha o pintor. Na passada `halo` tudo sai da cor do mostrador e mais
 * grosso, formando um contorno — sem ele a figura some quando cruza os
 * ponteiros, que são da mesma cor escura.
 */
function PainterLayer({ skel, halo }: { skel: Skeleton; halo?: boolean }) {
  const grow = halo ? 2.8 : 0;
  const cloth = halo ? FACE : OVERALLS;
  const dark = halo ? FACE : INK;
  const chain = {
    fill: "none" as const,
    stroke: cloth,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  return (
    <g>
      <polyline {...chain} strokeWidth={2.9 + grow} points={toPoints(skel.legs[0])} />
      <polyline {...chain} strokeWidth={2.9 + grow} points={toPoints(skel.legs[1])} />
      <polyline {...chain} strokeWidth={6.4 + grow} points={toPoints(skel.torso)} />
      <polyline {...chain} strokeWidth={2.5 + grow} points={toPoints(skel.arms[0])} />
      <polyline {...chain} strokeWidth={2.5 + grow} points={toPoints(skel.arms[1])} />
      <circle cx={skel.head.x} cy={skel.head.y} r={HEAD_R} fill={dark} stroke={dark} strokeWidth={grow} />
      <line
        x1={skel.pole[0].x}
        y1={skel.pole[0].y}
        x2={skel.pole[1].x}
        y2={skel.pole[1].y}
        stroke={dark}
        strokeWidth={1.3 + grow}
        strokeLinecap="round"
      />
      <line
        x1={skel.brush[0].x}
        y1={skel.brush[0].y}
        x2={skel.brush[1].x}
        y2={skel.brush[1].y}
        stroke={dark}
        strokeWidth={2.2 + grow}
        strokeLinecap="round"
      />
    </g>
  );
}

/**
 * Escada desenhada com a base na origem: depois é só transladar para o pé dela
 * pousar no chão. O balde vai pendurado num degrau, então sai de cena junto.
 */
function Ladder({ x }: { x: number }) {
  const rungs = useMemo(() => {
    const list: number[] = [];
    for (let r = RUNG; r <= LADDER_LEN - RUNG; r += RUNG) list.push(r);
    return list;
  }, []);

  return (
    <g transform={`translate(${x.toFixed(2)} ${FLOOR_Y})`}>
      <g stroke={METAL} strokeLinecap="round" opacity="0.75">
        <line x1={-RAIL} y1={0} x2={-RAIL + 0.8} y2={-LADDER_LEN} strokeWidth="1.6" />
        <line x1={RAIL} y1={0} x2={RAIL - 0.8} y2={-LADDER_LEN} strokeWidth="1.6" />
        {rungs.map((r) => {
          const taper = (r / LADDER_LEN) * 0.8;
          return (
            <line key={r} x1={-RAIL + taper} y1={-r} x2={RAIL - taper} y2={-r} strokeWidth="1" />
          );
        })}
        <circle cx={-RAIL} cy={1.8} r="1.7" fill={METAL} stroke="none" />
        <circle cx={RAIL} cy={1.8} r="1.7" fill={METAL} stroke="none" />
      </g>
      <path d="M -10.8 -12 L -9.5 -6 L -3.7 -6 L -2.4 -12 Z" fill={INK} opacity="0.85" />
      <line x1={-6.6} y1={-12} x2={-4.6} y2={-RUNG * 2} stroke={INK} strokeWidth="0.7" opacity="0.7" />
    </g>
  );
}

/** Só vale gastar 30fps enquanto o pintor está em cena. */
function onStage(now: Date) {
  const t = now.getSeconds();
  if (t < 15 || t >= 44) return true;
  return now.getMinutes() % HOUR_STEP_MIN === 0 && t < 38;
}

/**
 * Devolve `null` até o primeiro quadro no cliente: a página é pré-renderizada,
 * então marcar a hora no servidor quebraria a hidratação.
 */
function useAnimationClock(reduceMotion: boolean) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    let raf = 0;
    let lastCommit = 0;

    const loop = (timestamp: number) => {
      raf = requestAnimationFrame(loop);
      const current = new Date();
      const interval = !reduceMotion && onStage(current) ? 33 : 500;
      if (timestamp - lastCommit < interval) return;
      lastCommit = timestamp;
      setNow(current);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [reduceMotion]);

  return now;
}

function useReducedMotion() {
  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduce(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  return reduce;
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
        // Sem suporte ou negado — o relógio segue funcionando, só não impede o
        // monitor de dormir sozinho.
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
  const reduceMotion = useReducedMotion();
  const now = useAnimationClock(reduceMotion);
  const idle = useIdle(IDLE_DELAY_MS);
  const { isFullscreen, toggle } = useFullscreen();
  useWakeLock();

  const stage = now ? computeStage(now) : null;
  const skeleton = stage?.actor ? buildSkeleton(stage.actor) : null;
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
      <svg viewBox="0 0 200 200" className="aspect-square h-full max-h-[85vh] w-auto max-w-full" aria-hidden="true">
        <defs>
          <filter id="brush" x="-30%" y="-30%" width="160%" height="160%">
            <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="2" seed="7" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.3" xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <clipPath id="face-clip">
            <circle cx={CENTER} cy={CENTER} r={FACE_R} />
          </clipPath>
        </defs>

        <circle cx={CENTER} cy={CENTER} r={FACE_R} fill={FACE} />
        <circle cx={CENTER} cy={CENTER} r={FACE_R} fill="none" stroke="#0d0d0d" strokeWidth="0.75" opacity="0.15" />

        <g clipPath="url(#face-clip)">
          {HOUR_TICKS.map((i) => {
            const cardinal = i % 3 === 0;
            return (
              <line
                key={i}
                x1={CENTER}
                y1={cardinal ? 10 : 13}
                x2={CENTER}
                y2={19}
                stroke={INK}
                strokeWidth={cardinal ? 2.6 : 1.4}
                strokeLinecap="round"
                transform={`rotate(${i * 30} ${CENTER} ${CENTER})`}
              />
            );
          })}

          {stage && (
            <>
              {stage.residue && (
                <g transform={`rotate(${stage.residue.angle} ${CENTER} ${CENTER})`} opacity="0.2" filter="url(#brush)">
                  <line
                    x1={CENTER}
                    y1={CENTER - stage.residue.from}
                    x2={CENTER}
                    y2={CENTER - stage.residue.to}
                    stroke={INK}
                    strokeWidth={stage.residue.width * 1.8}
                    strokeLinecap="round"
                  />
                </g>
              )}

              <g transform={`rotate(${stage.hourAngle} ${CENTER} ${CENTER})`}>
                <path d={handPath(stage.hourLen, HOUR_W)} fill={INK} filter="url(#brush)" />
              </g>

              <g transform={`rotate(${stage.minuteAngle} ${CENTER} ${CENTER})`}>
                <path d={handPath(stage.minuteLen, MINUTE_W)} fill={INK} filter="url(#brush)" />
              </g>

              <circle cx={CENTER} cy={CENTER} r="3" fill={INK} />

              {skeleton && (
                <>
                  <Ladder x={skeleton.ladderX} />
                  <PainterLayer skel={skeleton} halo />
                  <PainterLayer skel={skeleton} />
                </>
              )}
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
