import { useState } from "react";
import { GENRES, type Genre, type StoryParams } from "@/lib/story-fractal";

export const EMPTY_PARAMS: StoryParams = {
  titulo: "",
  sistema: "",
  protagonista: "",
  carencia: "",
  antagonistaInterno: "",
  genero: "" as Genre,
  semilla: "",
  profundidad: 0,
  tension: 0,
  luz: 0,
  simetria: 0,
};

type StepKind = "texto" | "genero" | "semilla" | "rango";

interface Step {
  key: keyof StoryParams;
  kind: StepKind;
  label: string;
  hint: string;
  polos?: [string, string];
  min?: number;
  max?: number;
}

const STEPS: Step[] = [
  {
    key: "titulo",
    kind: "texto",
    label: "Título",
    hint: "El nombre del bucle. Todo lo demás orbita alrededor de él.",
    polos: ["nombrar", "callar"],
  },
  {
    key: "sistema",
    kind: "texto",
    label: "Sistema",
    hint: "El orden que sostiene el mundo antes de la grieta.",
    polos: ["orden", "grieta"],
  },
  {
    key: "protagonista",
    kind: "texto",
    label: "Protagonista",
    hint: "Quien atraviesa el círculo y vuelve cambiado.",
    polos: ["yo", "otro"],
  },
  {
    key: "carencia",
    kind: "texto",
    label: "Carencia",
    hint: "El vacío que empuja el movimiento.",
    polos: ["falta", "exceso"],
  },
  {
    key: "antagonistaInterno",
    kind: "texto",
    label: "Antagonista interno",
    hint: "La negación que el protagonista lleva dentro.",
    polos: ["defensa", "verdad"],
  },
  {
    key: "genero",
    kind: "genero",
    label: "Género",
    hint: "Define el desplazamiento de los arcanos.",
    polos: ["destino", "elección"],
  },
  {
    key: "semilla",
    kind: "semilla",
    label: "Semilla",
    hint: "Fija el azar. La misma semilla siempre da el mismo fractal.",
    polos: ["azar", "ley"],
  },
  {
    key: "profundidad",
    kind: "rango",
    label: "Profundidad fractal",
    hint: "Cuántas veces se repite el círculo dentro de sí mismo.",
    polos: ["superficie", "abismo"],
    min: 1,
    max: 4,
  },
  {
    key: "simetria",
    kind: "rango",
    label: "Estaciones",
    hint: "Cuántos nodos tiene el círculo del héroe.",
    polos: ["mínimo", "completo"],
    min: 3,
    max: 12,
  },
  {
    key: "tension",
    kind: "rango",
    label: "Tensión",
    hint: "Disonancia rítmica del campo.",
    polos: ["calma", "ruptura"],
    min: 0,
    max: 100,
  },
  {
    key: "luz",
    kind: "rango",
    label: "Luz",
    hint: "Apertura y claridad del campo.",
    polos: ["sombra", "claridad"],
    min: 0,
    max: 100,
  },
];

function randomSeed() {
  return (
    Math.random().toString(36).slice(2, 8) +
    "-" +
    Date.now().toString(36).slice(-3)
  );
}

export function StoryWizard({
  onStart,
}: {
  onStart: (p: StoryParams) => void;
}) {
  const [draft, setDraft] = useState<StoryParams>(EMPTY_PARAMS);
  const [step, setStep] = useState(0);
  const [buffer, setBuffer] = useState<string>("");

  const done = step >= STEPS.length;
  const current = STEPS[step];

  const valorActual = (s: Step) => {
    const v = draft[s.key];
    return typeof v === "number" ? v : String(v ?? "");
  };

  const añadir = () => {
    if (!current) return;
    const raw = buffer.trim();
    if (current.kind === "rango") {
      const n = Number(raw === "" ? current.min : raw);
      setDraft((d) => ({ ...d, [current.key]: n }));
    } else if (current.kind === "semilla") {
      setDraft((d) => ({ ...d, semilla: raw === "" ? randomSeed() : raw }));
    } else {
      if (raw === "") return;
      setDraft((d) => ({ ...d, [current.key]: raw }));
    }
    setBuffer("");
    setStep((s) => s + 1);
  };

  const volver = () => {
    if (step === 0) return;
    const prev = STEPS[step - 1]!;
    setDraft((d) => ({ ...d, [prev.key]: EMPTY_PARAMS[prev.key] }));
    setBuffer("");
    setStep((s) => s - 1);
  };

  const empezar = () => {
    onStart({
      ...draft,
      genero: (draft.genero || "mito") as Genre,
      semilla: draft.semilla || randomSeed(),
      profundidad: Math.max(1, Math.min(4, draft.profundidad || 1)),
      simetria: Math.max(3, Math.min(12, draft.simetria || 3)),
    });
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10">
      <div className="panel rounded-md p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xs uppercase tracking-[0.25em] text-primary">
            Constructor · elemento {Math.min(step + 1, STEPS.length)} de{" "}
            {STEPS.length}
          </h2>
          <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            nada se calcula hasta empezar
          </span>
        </div>

        <div className="mt-3 h-1 w-full rounded-full bg-border">
          <div
            className="h-1 rounded-full bg-primary transition-all"
            style={{ width: `${(step / STEPS.length) * 100}%` }}
          />
        </div>

        {!done && current && (
          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.2em]">
              <span className="text-muted-foreground">
                {current.polos?.[0]}
              </span>
              <span className="text-primary">polos</span>
              <span className="text-muted-foreground">
                {current.polos?.[1]}
              </span>
            </div>

            <h3 className="text-lg text-foreground">{current.label}</h3>
            <p className="text-xs text-muted-foreground">{current.hint}</p>

            {current.kind === "texto" && (
              <input
                autoFocus
                value={buffer}
                onChange={(e) => setBuffer(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && añadir()}
                placeholder="escribe y añade…"
                className="w-full rounded-sm border border-border bg-input/40 px-3 py-2 text-sm outline-none focus:border-primary"
              />
            )}

            {current.kind === "semilla" && (
              <div className="flex gap-2">
                <input
                  autoFocus
                  value={buffer}
                  onChange={(e) => setBuffer(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && añadir()}
                  placeholder="vacío = semilla aleatoria"
                  className="flex-1 rounded-sm border border-border bg-input/40 px-3 py-2 text-sm outline-none focus:border-primary"
                />
                <button
                  onClick={() => setBuffer(randomSeed())}
                  className="rounded-sm border border-border px-3 text-[11px] uppercase tracking-widest hover:border-primary"
                >
                  Mutar
                </button>
              </div>
            )}

            {current.kind === "genero" && (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {GENRES.map((g) => (
                  <button
                    key={g}
                    onClick={() => setBuffer(g)}
                    className={`rounded-sm border px-2 py-2 text-xs uppercase tracking-widest transition ${
                      buffer === g
                        ? "border-primary text-primary"
                        : "border-border text-muted-foreground hover:border-primary/60"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            )}

            {current.kind === "rango" && (
              <div>
                <div className="flex justify-between text-[11px] text-muted-foreground">
                  <span>{current.min}</span>
                  <span className="text-primary">
                    {buffer === "" ? current.min : buffer}
                  </span>
                  <span>{current.max}</span>
                </div>
                <input
                  type="range"
                  min={current.min}
                  max={current.max}
                  value={buffer === "" ? current.min : Number(buffer)}
                  onChange={(e) => setBuffer(e.target.value)}
                  className="w-full accent-[var(--primary)]"
                />
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                onClick={añadir}
                className="rounded-sm bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-widest text-primary-foreground hover:opacity-90"
              >
                Añadir
              </button>
              <button
                onClick={volver}
                disabled={step === 0}
                className="rounded-sm border border-border px-3 py-2 text-xs uppercase tracking-widest disabled:opacity-30"
              >
                Atrás
              </button>
            </div>
          </div>
        )}

        {done && (
          <div className="mt-6 space-y-3">
            <p className="text-sm text-foreground">
              Todos los elementos están puestos. El fractal aún no existe.
            </p>
            <div className="flex gap-2">
              <button
                onClick={empezar}
                className="rounded-sm bg-primary px-6 py-3 text-sm font-semibold uppercase tracking-[0.25em] text-primary-foreground hover:opacity-90"
              >
                Empezar
              </button>
              <button
                onClick={volver}
                className="rounded-sm border border-border px-3 py-2 text-xs uppercase tracking-widest"
              >
                Atrás
              </button>
            </div>
          </div>
        )}

        <div className="mt-8 space-y-1 border-t border-border pt-4">
          <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Elementos añadidos
          </div>
          {STEPS.slice(0, step).map((s) => (
            <div key={String(s.key)} className="flex justify-between text-xs">
              <span className="text-muted-foreground">{s.label}</span>
              <span className="text-foreground">{valorActual(s) || "—"}</span>
            </div>
          ))}
          {step === 0 && (
            <p className="text-xs text-muted-foreground">
              Todo en cero. Añade el primer elemento.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
