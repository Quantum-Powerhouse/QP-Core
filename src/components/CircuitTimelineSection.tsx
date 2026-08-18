import { CircuitVisualizer } from "@/components/CircuitVisualizer";

export function CircuitTimelineSection() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <div className="mb-6">
        <p className="mb-2 font-mono text-sm text-accent">Circuit Preview</p>
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Gate Timeline
        </h2>
        <p className="mt-3 max-w-2xl text-muted">
          A sample 3-qubit circuit — Hadamard, CNOT entanglement, a phase
          gate, and measurement — rendered as a glowing, animated timeline.
        </p>
      </div>
      <CircuitVisualizer />
    </section>
  );
}
