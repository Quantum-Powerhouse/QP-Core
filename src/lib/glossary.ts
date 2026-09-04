/**
 * The glossary. Each term links to the place on this site where it is
 * computed or demonstrated, definitions with receipts.
 */
export type GlossaryEntry = {
  term: string;
  def: string;
  where?: { label: string; href: string };
};

export const GLOSSARY: GlossaryEntry[] = [
  { term: "Amplitude", def: "The complex number attached to each basis state. Probabilities come from its squared magnitude; interference comes from its sign and phase.", where: { label: "Gate Mixer", href: "/playground/arcade#gate-mixer" } },
  { term: "Ansatz", def: "A parameterized trial circuit whose knobs an optimizer turns. The VQE suite uses a single parameter ansatz that is exact for H₂.", where: { label: "VQE suite", href: "/playground/vqe-suite" } },
  { term: "BB84", def: "The 1984 quantum key distribution protocol. Security comes from the fact that measuring a qubit in the wrong basis disturbs it.", where: { label: "BB84. Catch Eve", href: "/playground/arcade#bb84-catch-eve" } },
  { term: "Bell state", def: "One of four maximally entangled two qubit states. Measuring one qubit fixes the other's statistics, with no classical explanation.", where: { label: "Entangled Dice", href: "/playground/arcade#entangled-dice" } },
  { term: "Bloch sphere", def: "The unit sphere picture of a single qubit: pure states are points on the surface, gates are rotations.", where: { label: "the interactive sphere", href: "/#top" } },
  { term: "Born rule", def: "The probability of an outcome equals the squared magnitude of its amplitude. Every collapse on this site is a real sample from it.", where: { label: "Born Casino", href: "/playground/arcade#born-casino" } },
  { term: "CHSH inequality", def: "A Bell inequality: classical correlations obey S ≤ 2, quantum mechanics reaches 2√2. You can violate it yourself with sampled rounds.", where: { label: "CHSH", href: "/playground/arcade#chsh-beat-the-classical-bound" } },
  { term: "CNOT", def: "The two qubit gate that flips a target when the control is 1. Applied to superpositions it creates entanglement.", where: { label: "Circuit Lab", href: "/lab" } },
  { term: "Code distance", def: "How many physical errors an error correcting code can tell apart; the scoreboard tracks it because logical error rates fall exponentially with it, below threshold.", where: { label: "hardware scoreboard", href: "/field/hardware" } },
  { term: "Coherence", def: "The survival of definite phase relationships between amplitudes. Decoherence is their leak into the environment.", where: { label: "Decoherence Dial", href: "/playground/arcade#decoherence-dial" } },
  { term: "Density matrix", def: "The state description that also covers noise and partial knowledge. This site evolves them exactly, no Monte Carlo jitter.", where: { label: "Circuit Lab noise panel", href: "/lab" } },
  { term: "Entanglement", def: "Correlation between systems that no separate description of each can reproduce. Purity of a subsystem dropping below 1 is its fingerprint.", where: { label: "Entanglement Dial", href: "/playground/arcade#entanglement-dial" } },
  { term: "Fidelity", def: "How close two states are, as a number in [0, 1]. The steering game scores you on it.", where: { label: "State Match", href: "/playground/arcade#state-match" } },
  { term: "Gate", def: "A unitary operation on qubits, the reversible logic of quantum computing. Every button in the arcade multiplies a real matrix into a real statevector.", where: { label: "Gate Mixer", href: "/playground/arcade#gate-mixer" } },
  { term: "GHZ state", def: "The three qubit state (|000⟩+|111⟩)/√2. It wins a referee game with certainty where classical players top out at 75%.", where: { label: "The GHZ Game", href: "/playground/arcade#the-ghz-game" } },
  { term: "Grover search", def: "Amplitude amplification that finds a marked item in O(√N) queries, provably optimal. Over rotate and you fly past the answer.", where: { label: "Grover Searchlight", href: "/playground/arcade#grover-searchlight" } },
  { term: "Hadamard", def: "The gate that turns |0⟩ into an equal superposition. Two in a row cancel, which is interference in its smallest form.", where: { label: "Interference Lab", href: "/playground/arcade#interference-lab" } },
  { term: "Interference", def: "Amplitudes adding with signs, so paths can cancel or reinforce. It is the resource every quantum algorithm actually spends.", where: { label: "Interference Lab", href: "/playground/arcade#interference-lab" } },
  { term: "Kraus channel", def: "The general mathematical form of noise acting on a density matrix. The engine's depolarizing noise is one, applied exactly.", where: { label: "engineering notes", href: "/engineering" } },
  { term: "Logical qubit", def: "A qubit encoded across many physical qubits so errors can be detected and corrected. The scoreboard counts them; the arcade shows why they pay.", where: { label: "Repetition Rescue", href: "/playground/arcade#repetition-rescue" } },
  { term: "Measurement", def: "Asking a state a question in a chosen basis. The answer is random by the Born rule and the state updates. Here it is a real inverse CDF sample, never a scripted animation.", where: { label: "Measurement Duel", href: "/playground/arcade#measurement-duel" } },
  { term: "No cloning", def: "No unitary process can copy an unknown quantum state. A two line linearity argument, and the reason quantum key distribution works.", where: { label: "The Cloning Button", href: "/playground/arcade#the-cloning-button" } },
  { term: "Noise model", def: "A device's measured error rates applied in simulation. The hardware page compares the exact prediction against ibm_brisbane's published calibration.", where: { label: "hardware", href: "/hardware" } },
  { term: "OpenQASM", def: "The standard text format for quantum circuits. The transpiler terminal parses 2.0 and 3.0; the Circuit Lab exports 2.0.", where: { label: "transpiler terminal", href: "/playground/qp-core" } },
  { term: "Oracle", def: "A black box subroutine an algorithm may query. Speedups are counted in queries; Bernstein and Vazirani needs exactly one.", where: { label: "Bernstein-Vazirani", href: "/playground/arcade#bernstein-vazirani" } },
  { term: "Parameter shift rule", def: "An identity giving the exact gradient of a rotation gate's expectation from two evaluations. The VQE curve is exact gradient descent because of it.", where: { label: "VQE docs", href: "/docs/vqe-suite/hamiltonian-and-ansatz" } },
  { term: "Pauli operators", def: "X, Y, Z: bit flip, both, phase flip. They generate rotations, express Hamiltonians, and label measurement bases.", where: { label: "Bloch Detective", href: "/playground/arcade#bloch-detective" } },
  { term: "Phase kickback", def: "A controlled operation writing its phase onto the control qubit. Deutsch and Grover both run on this trick.", where: { label: "Phase Kickback", href: "/playground/arcade#phase-kickback" } },
  { term: "Purity", def: "Tr(ρ²), equal to 1 for pure states and 1/2 for a maximally mixed qubit. Watching it drop is watching entanglement or noise happen.", where: { label: "Entanglement Dial", href: "/playground/arcade#entanglement-dial" } },
  { term: "QAOA", def: "A variational circuit for combinatorial optimization. Its only proven worst case guarantee is at depth p=1 on 3-regular MaxCut.", where: { label: "QAOA MaxCut", href: "/playground/arcade#qaoa-maxcut" } },
  { term: "QBER", def: "Quantum bit error rate: the sifted key disagreement fraction in QKD. An eavesdropper pushes it toward 25%.", where: { label: "BB84. Catch Eve", href: "/playground/arcade#bb84-catch-eve" } },
  { term: "Quantum Fourier transform", def: "The unitary that turns hidden periodicity into readable peaks. It is how Shor's algorithm extracts a period.", where: { label: "QFT Period Finder", href: "/playground/arcade#qft-period-finder" } },
  { term: "Quantum walk", def: "The coherent counterpart of a random walk: it spreads linearly in time instead of as √t.", where: { label: "Walk Race", href: "/playground/arcade#walk-race" } },
  { term: "Qubit", def: "A two level quantum system: a unit vector of two complex amplitudes, not a probabilistic bit.", where: { label: "Gate Mixer", href: "/playground/arcade#gate-mixer" } },
  { term: "Shot", def: "One prepare and measure repetition on hardware. The hardware lane runs 1024 per job against a monthly ledger.", where: { label: "hardware", href: "/hardware" } },
  { term: "Statevector", def: "The full list of 2ⁿ amplitudes describing n qubits. The engine holds it explicitly; the benchmark shows the 2ⁿ wall.", where: { label: "Engine Scaling Benchmark", href: "/playground/arcade#engine-scaling-benchmark" } },
  { term: "Superdense coding", def: "Two classical bits carried by one qubit, paid for with a pre shared entangled pair.", where: { label: "Superdense Coding", href: "/playground/arcade#superdense-coding" } },
  { term: "Superposition", def: "A state with amplitude on several basis states at once. Not 'both values at the same time', a vector that measurement will project.", where: { label: "Born Casino", href: "/playground/arcade#born-casino" } },
  { term: "Teleportation", def: "Moving a state using entanglement plus two classical bits, destroying the original. It cannot signal faster than light.", where: { label: "Teleportation Walkthrough", href: "/playground/arcade#teleportation-walkthrough" } },
  { term: "Threshold theorem", def: "Below a physical error threshold, error correction can suppress logical errors arbitrarily, under stated noise assumptions. The open problems page keeps the assumptions honest.", where: { label: "open problems", href: "/field/open-problems" } },
  { term: "Transpiler", def: "The compiler stage that rewrites a circuit for a target: gate set, connectivity, format. This site's turns OpenQASM into Amazon Braket IR.", where: { label: "transpiler terminal", href: "/playground/qp-core" } },
  { term: "VQE", def: "The variational quantum eigensolver: a quantum circuit proposes states, a classical optimizer tunes it toward the ground state energy.", where: { label: "VQE suite", href: "/playground/vqe-suite" } },
  { term: "Zero noise extrapolation", def: "Run a circuit at amplified noise levels and extrapolate back to zero. The engine does it with Richardson extrapolation on exact density matrices.", where: { label: "ZNE demo", href: "/playground/vqe-suite" } },
];
