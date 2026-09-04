/** Single source of truth for arcade-wide facts other pages cite. */
export const ARCADE_GAME_COUNT = 26;

/** Generated from the GameCard title props; the test suite verifies it. */
export const ARCADE_INDEX: { section: string; titles: string[] }[] = [
  { section: "One qubit, no mercy", titles: ["Gate Mixer", "State Match", "Born Casino", "π-Pulse Trainer", "Interference Lab", "Measurement Duel", "Bloch Detective"] },
  { section: "Entanglement & protocols", titles: ["Entanglement Dial", "CHSH. Beat the Classical Bound", "Teleportation Walkthrough", "Superdense Coding", "The Cloning Button", "Phase Kickback", "Entangled Dice"] },
  { section: "Algorithms, noise & spies", titles: ["Grover Searchlight", "Deutsch's One Question Oracle", "Born Rule Randomness", "Decoherence Dial", "Repetition Rescue", "BB84. Catch Eve", "Tunneling Odds"] },
  { section: "The frontier", titles: ["QAOA MaxCut", "Walk Race"] },
  { section: "The algorithm wing", titles: ["Bernstein-Vazirani", "The GHZ Game", "QFT Period Finder"] },
];
