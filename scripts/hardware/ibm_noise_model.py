"""Simulation vs. a real device's noise model, and, when a token exists, the real device.

Runs the site's Bell/CHSH experiment three ways and writes src/data/hardware.json:

  1. ideal, noiseless statevector (what the browser engine computes)
  2. noise_model. Qiskit Aer with the noise model of a REAL IBM device, built from
                    that device's published calibration snapshot (FakeBrisbane:
                    ibm_brisbane, 127 qubits). No account needed. This is a real
                    device's error rates, applied in simulation, labeled as such.
  3. device, the real ibm_brisbane, IF QISKIT_IBM_TOKEN is set. Otherwise the
                    record says "not run", the site shows that honestly.

Usage (from QuantumSite):
  ../Projects/quantumflow-api/venv/Scripts/python.exe scripts/hardware/ibm_noise_model.py
Optional:
  QISKIT_IBM_TOKEN=...  to also run on hardware (costs free-tier minutes).
"""

from __future__ import annotations

import json
import math
import os
import sys
from datetime import datetime, timezone
from pathlib import Path

from qiskit import QuantumCircuit, transpile
from qiskit.quantum_info import Statevector
from qiskit_aer import AerSimulator
from qiskit_ibm_runtime.fake_provider import FakeBrisbane

SHOTS = 4000
# CHSH settings that maximize |S| for the Bell state (same as the arcade).
SETTINGS = {"a0": 0.0, "a1": math.pi / 4, "b0": math.pi / 8, "b1": -math.pi / 8}


def chsh_circuit(a: float, b: float) -> QuantumCircuit:
    qc = QuantumCircuit(2, 2)
    qc.h(0)
    qc.cx(0, 1)
    qc.ry(-2 * a, 0)
    qc.ry(-2 * b, 1)
    qc.measure([0, 1], [0, 1])
    return qc


def correlation_from_counts(counts: dict[str, int]) -> float:
    total = sum(counts.values()) or 1
    e = 0.0
    for bits, n in counts.items():
        a = 1 if bits[-1] == "0" else -1  # qubit 0 is the rightmost bit in Qiskit strings
        b = 1 if bits[-2] == "0" else -1
        e += a * b * n
    return e / total


def ideal_correlation(a: float, b: float) -> float:
    qc = chsh_circuit(a, b).remove_final_measurements(inplace=False)
    sv = Statevector(qc)
    probs = sv.probabilities_dict()
    return correlation_from_counts({k: int(round(v * 1_000_000)) for k, v in probs.items()})


def chsh_s(corr) -> float:
    return corr("a0", "b0") + corr("a0", "b1") + corr("a1", "b0") - corr("a1", "b1")


def run_backend(backend, label: str) -> dict:
    results = {}
    for ak in ("a0", "a1"):
        for bk in ("b0", "b1"):
            qc = transpile(chsh_circuit(SETTINGS[ak], SETTINGS[bk]), backend, optimization_level=1)
            job = backend.run(qc, shots=SHOTS)
            results[(ak, bk)] = correlation_from_counts(job.result().get_counts())
    return {"label": label, "shots": SHOTS, "S": chsh_s(lambda x, y: results[(x, y)]), "correlations": {f"{k[0]}-{k[1]}": v for k, v in results.items()}}


def main() -> None:
    out = {
        "experiment": "CHSH Bell test on a 2-qubit Bell state, 4 measurement settings",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "classical_bound": 2.0,
        "tsirelson_bound": 2 * math.sqrt(2),
        "runs": [],
    }

    # 1. ideal
    ideal = {"label": "ideal statevector (noiseless)", "shots": None, "S": chsh_s(lambda x, y: ideal_correlation(SETTINGS[x], SETTINGS[y]))}
    out["runs"].append(ideal)

    # 2. real device noise model (calibration snapshot), in simulation
    fake = FakeBrisbane()
    noisy = AerSimulator.from_backend(fake)
    nm = run_backend(noisy, "ibm_brisbane noise model (Aer, real calibration snapshot)")
    nm["device"] = "ibm_brisbane"
    nm["qubits_on_device"] = fake.num_qubits
    nm["note"] = "Simulation using the published error rates of a real 127-qubit device. Not a hardware run."
    out["runs"].append(nm)

    # 3. real hardware, only if a token exists
    token = os.environ.get("QISKIT_IBM_TOKEN")
    if token:
        from qiskit_ibm_runtime import QiskitRuntimeService, SamplerV2

        service = QiskitRuntimeService(channel="ibm_quantum_platform", token=token)
        backend = service.least_busy(operational=True, simulator=False, min_num_qubits=2)
        corr = {}
        for ak in ("a0", "a1"):
            for bk in ("b0", "b1"):
                qc = transpile(chsh_circuit(SETTINGS[ak], SETTINGS[bk]), backend, optimization_level=1)
                job = SamplerV2(backend).run([qc], shots=SHOTS)
                counts = job.result()[0].data.c.get_counts()
                corr[(ak, bk)] = correlation_from_counts(counts)
        out["runs"].append({
            "label": f"{backend.name} (real hardware)",
            "device": backend.name,
            "shots": SHOTS,
            "S": chsh_s(lambda x, y: corr[(x, y)]),
            "correlations": {f"{k[0]}-{k[1]}": v for k, v in corr.items()},
            "note": "Executed on IBM Quantum hardware.",
        })
    else:
        out["runs"].append({
            "label": "real hardware",
            "device": None,
            "shots": None,
            "S": None,
            "note": "Not run yet. Set QISKIT_IBM_TOKEN and rerun this script to execute on an IBM Quantum device.",
        })

    dest = Path(__file__).resolve().parents[2] / "src" / "data" / "hardware.json"
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_text(json.dumps(out, indent=2), encoding="utf-8")
    print(f"wrote {dest}")
    for r in out["runs"]:
        print(f"  {r['label']}: S = {r['S']}")


if __name__ == "__main__":
    sys.exit(main())
