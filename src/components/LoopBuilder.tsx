import { useMemo } from "react";
import type { FractalNode, FractalStory, StoryParams } from "@/lib/story-fractal";
import {
  PLANES,
  planeOf,
  polarNode,
  transitionsFrom,
} from "@/lib/narrative-theory";

export interface Propuesta {
  target: FractalNode;
  operador: string;
  peso: number;
  texto: string;
  clase: "empalme" | "opuesto" | "retorno";
}

export function proposalsFor(
  story: FractalStory,
  cadena: FractalNode[],
  params: StoryParams,
): Propuesta[] {
  const last = cadena[cadena.length - 1];
  if (!last) return [];
  const out: Propuesta[] = transitionsFrom(story, last, params, 4).map((t) => ({
    target: t.target,
    operador: t.operador,
    peso: t.peso,
    texto: t.texto,
    clase: "empalme" as const,
  }));

  const op = polarNode(story, last);
  if (op) {
    out.unshift({
      target: op,
      operador: "opuesto polar",
      peso: 1,
      texto: `Salto al polo contrario: ${op.station.nombre} · ${op.chakra.nombre} bajo ${op.arcano}. La tensión se invierte y el arco cambia de signo.`,
      clase: "opuesto",
    });
  }

  const inicio = cadena[0]!;
  if (cadena.length >= 3 && last.station.idx !== inicio.station.idx) {
    const retorno =
      story.root.find((n) => n.station.idx === inicio.station.idx) ?? inicio;
    const destino = retorno.children[cadena.length % 7] ?? retorno;
    out.push({
      target: destino,
      operador: "retorno · nuevo plano",
      peso: 0.9,
      texto: `Cierra el bucle volviendo a ${inicio.station.nombre}, pero en el plano ${
        PLANES[(cadena.length + 1) % PLANES.length]!.nombre
      }: el mismo inicio visto desde otra altura.`,
      clase: "retorno",
    });
  }

  return out;
}

export function LoopBuilder({
  story,
  params,
  cadena,
  onAdd,
  onUndo,
  onReset,
  onPick,
}: {
  story: FractalStory;
  params: StoryParams;
  cadena: FractalNode[];
  onAdd: (n: FractalNode) => void;
  onUndo: () => void;
  onReset: () => void;
  onPick: (n: FractalNode) => void;
}) {
  const propuestas = useMemo(
    () => proposalsFor(story, cadena, params),
    [story, cadena, params],
  );

  const vueltas = useMemo(() => {
    if (cadena.length < 2) return 0;
    const inicio = cadena[0]!.station.idx;
    return cadena
      .slice(1)
      .filter((n) => n.station.idx === inicio).length;
  }, [cadena]);

  return (
    <div className="space-y-4 text-xs">
      {cadena.length === 0 ? (
        <div className="space-y-2">
          <p className="text-muted-foreground">
            Escoge el nodo de partida. Desde ahí se proponen empalmes por
            tensión, arco y opuesto polar.
          </p>
          <div className="grid grid-cols-1 gap-1">
            {story.root.map((n) => (
              <button
                key={n.id}
                onClick={() => onAdd(n)}
                className="rounded-sm border border-border/60 p-2 text-left transition hover:border-primary"
              >
                <span className="text-primary">{n.station.nombre}</span>{" "}
                <span className="text-muted-foreground">
                  · {n.arcano} · {n.chakra.nombre}
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <>
          <div>
            <div className="mb-1 flex items-center justify-between">
              <span className="text-[9px] uppercase tracking-[0.2em] text-primary">
                Bucle · {cadena.length} nodos · vuelta {vueltas + 1}
              </span>
              <span className="flex gap-2">
                <button
                  onClick={onUndo}
                  className="rounded-sm border border-border px-2 py-0.5 text-[10px] uppercase tracking-widest hover:border-primary"
                >
                  Deshacer
                </button>
                <button
                  onClick={onReset}
                  className="rounded-sm border border-border px-2 py-0.5 text-[10px] uppercase tracking-widest hover:border-primary"
                >
                  Vaciar
                </button>
              </span>
            </div>
            <ol className="space-y-1">
              {cadena.map((n, i) => {
                const cierra = i > 0 && n.station.idx === cadena[0]!.station.idx;
                return (
                  <li key={`${n.id}-${i}`}>
                    <button
                      onClick={() => onPick(n)}
                      className={`w-full rounded-sm border p-2 text-left transition hover:border-primary ${
                        cierra ? "border-primary/70 bg-primary/5" : "border-border/60"
                      }`}
                    >
                      <span className="text-primary">
                        {String(i + 1).padStart(2, "0")}
                      </span>{" "}
                      {n.station.nombre} · {n.chakra.nombre}
                      <div className="text-[10px] text-muted-foreground">
                        {n.arcano} / {n.persona.etiqueta} ·{" "}
                        {planeOf(n).nombre.toLowerCase()} · tensión{" "}
                        {Math.round(n.disonancia * 100)}%
                        {cierra && " · retorno en nuevo plano"}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>

          <div>
            <div className="mb-1 text-[9px] uppercase tracking-[0.2em] text-primary">
              Nodos propuestos
            </div>
            <ul className="space-y-1">
              {propuestas.map((p, i) => (
                <li key={`${p.target.id}-${i}`}>
                  <button
                    onClick={() => onAdd(p.target)}
                    className={`w-full rounded-sm border p-2 text-left transition hover:border-primary ${
                      p.clase === "retorno"
                        ? "border-primary/60"
                        : p.clase === "opuesto"
                          ? "border-accent/60"
                          : "border-border/60"
                    }`}
                  >
                    <span className="text-primary">{p.operador}</span>{" "}
                    <span className="text-muted-foreground">
                      ({Math.round(p.peso * 100)}%)
                    </span>
                    <div className="text-foreground">
                      {p.target.station.nombre} · {p.target.chakra.nombre} —{" "}
                      {p.target.arcano}
                    </div>
                    <p className="mt-1 leading-relaxed text-muted-foreground">
                      {p.texto}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
