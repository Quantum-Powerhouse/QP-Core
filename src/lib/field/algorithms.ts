import type { FieldClaim } from "./types";

/**
 * The algorithm ledger: which quantum speedups are proven, in what model,
 * with the fine print kept. Every entry names the paper it was read from,
 * and three of these algorithms run live on this site.
 */
export const ALGORITHMS: FieldClaim[] = [
  {
    id: "alg-shor-1995",
    title: "Factoring and discrete logarithms in polynomial time (Shor)",
    body: "Shor's algorithms factor integers and take discrete logarithms in a number of steps polynomial in the input size, the abstract's own phrasing is 'polynomial in the input size, e.g., the number of digits of the integer to be factored'. Published in SIAM Journal on Computing 26, 1484 (1997). This single result is why the post quantum cryptography section exists: RSA and elliptic curve cryptography rest on exactly these two problems.",
    status: "verified",
    date: "1995-08",
    source: { label: "Shor, arXiv quant-ph/9508027; SIAM J. Comput. 26, 1484 (1997)", url: "https://arxiv.org/abs/quant-ph/9508027" },
  },
  {
    id: "alg-grover-1996",
    title: "Unstructured search in O(√N) queries (Grover)",
    body: "Grover's algorithm finds a marked item among N unsorted items in O(√N) oracle queries where any classical strategy needs O(N). A quadratic speedup, not an exponential one, and that distinction carries most of the practical caveats about 'quantum search'. The arcade's Grover Searchlight runs the real three qubit instance: you can watch the marked amplitude get amplified and also watch what happens when you iterate too far.",
    status: "verified",
    date: "1996-05",
    source: { label: "Grover, arXiv quant-ph/9605043; STOC 1996", url: "https://arxiv.org/abs/quant-ph/9605043" },
  },
  {
    id: "alg-bbbv-1997",
    title: "Grover is optimal: Ω(√N), so brute forcing NP stays exponential",
    body: "Bennett, Bernstein, Brassard and Vazirani proved the matching lower bound: relative to a random oracle, NP cannot be solved on a quantum computer in time o(2^(n/2)). Quadratic is the ceiling for black box search, quantum computers do not brute force NP complete problems into tractability. Published in SIAM Journal on Computing 26, 1510 (1997), back to back with Shor.",
    status: "verified",
    date: "1997-01",
    source: { label: "Bennett, Bernstein, Brassard, Vazirani, arXiv quant-ph/9701001; SIAM J. Comput. 26, 1510 (1997)", url: "https://arxiv.org/abs/quant-ph/9701001" },
  },
  {
    id: "alg-hhl-2009",
    title: "Linear systems in poly(log N, κ) time, with the fine print in the abstract",
    body: "Harrow, Hassidim and Lloyd solve sparse linear systems in time polynomial in log N and the condition number κ, an exponential speedup over classical methods in N. The conditions are stated in the paper itself: the matrix must be sparse and well conditioned, and the output is not the solution vector x but an expectation value of an operator on x. Any application that needs to read out all of x loses the speedup. Physical Review Letters 103, 150502 (2009).",
    status: "verified",
    date: "2008-11",
    source: { label: "Harrow, Hassidim, Lloyd, arXiv 0811.3171; Phys. Rev. Lett. 103, 150502 (2009)", url: "https://arxiv.org/abs/0811.3171" },
  },
  {
    id: "alg-tang-2018",
    title: "A celebrated exponential ML speedup, dequantized (Tang)",
    body: "Ewin Tang gave a classical algorithm for recommendation systems that, given sample and query access to the data, runs only polynomially slower than the Kerenidis and Prakash quantum algorithm, removing what had been cited as a flagship exponential speedup in quantum machine learning. The result is a standing warning label on quantum ML claims: the speedup must survive comparison against classical algorithms that get analogous data access.",
    status: "verified",
    date: "2018-07",
    source: { label: "Tang, arXiv 1807.04271; STOC 2019", url: "https://arxiv.org/abs/1807.04271" },
  },
  {
    id: "alg-simulation-2014",
    title: "Simulating quantum systems: the least contested application",
    body: "The standard review by Georgescu, Ashhab and Nori surveys quantum simulation across condensed matter physics, high energy physics, atomic physics, quantum chemistry and cosmology, on platforms from trapped ions to superconducting circuits. Simulating quantum mechanics is the application where the exponential classical cost is not in dispute, which is why chemistry and materials lead the what gets solved first section.",
    status: "verified",
    date: "2013-08",
    source: { label: "Georgescu, Ashhab, Nori, arXiv 1308.6253; Reviews of Modern Physics 86, 153 (2014)", url: "https://arxiv.org/abs/1308.6253" },
  },
  {
    id: "alg-vqe-2013",
    title: "VQE: the hybrid workhorse, and the one this site runs",
    body: "Peruzzo and coauthors introduced the variational quantum eigensolver on a photonic processor, computing the ground state energy of helium hydride by pairing a small quantum device with a classical optimizer, trading long coherent evolution for many short circuits. Nature Communications 5, 4213 (2014). The VQE suite on this site is the same idea for the H₂ molecule, run entirely in your browser with exact parameter shift gradients.",
    status: "verified",
    date: "2013-04",
    source: { label: "Peruzzo et al., arXiv 1304.3061; Nat. Commun. 5, 4213 (2014)", url: "https://arxiv.org/abs/1304.3061" },
  },
  {
    id: "alg-qaoa-2014",
    title: "QAOA: a guarantee only at p=1 on 3-regular graphs",
    body: "Farhi, Goldstone and Gutmann's quantum approximate optimization algorithm targets combinatorial problems with a circuit depth that grows with a parameter p. The only worst case guarantee in the paper is for p=1 on MaxCut over 3-regular graphs: at least 0.6924 of the optimal cut. Nothing is guaranteed for general graphs or larger p, and the paper remains an arXiv preprint. The arcade's QAOA MaxCut card runs a real p=1 instance you can tune by hand.",
    status: "preprint",
    date: "2014-11",
    source: { label: "Farhi, Goldstone, Gutmann, arXiv 1411.4028 (preprint)", url: "https://arxiv.org/abs/1411.4028" },
  },
];
