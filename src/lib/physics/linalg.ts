export type Complex = { re: number; im: number };

export const c = (re: number, im = 0): Complex => ({ re, im });
export const cAdd = (a: Complex, b: Complex): Complex => ({ re: a.re + b.re, im: a.im + b.im });
export const cSub = (a: Complex, b: Complex): Complex => ({ re: a.re - b.re, im: a.im - b.im });
export const cMul = (a: Complex, b: Complex): Complex => ({
  re: a.re * b.re - a.im * b.im,
  im: a.re * b.im + a.im * b.re,
});
export const cConj = (a: Complex): Complex => ({ re: a.re, im: -a.im });
export const cScale = (a: Complex, s: number): Complex => ({ re: a.re * s, im: a.im * s });

export type ComplexMatrix = Complex[][];
export type ComplexVector = Complex[];

/** Kronecker product of two square complex matrices. */
export function kron(a: ComplexMatrix, b: ComplexMatrix): ComplexMatrix {
  const n = a.length;
  const m = b.length;
  const out: ComplexMatrix = Array.from({ length: n * m }, () =>
    Array.from({ length: n * m }, () => c(0)),
  );
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      for (let p = 0; p < m; p++) {
        for (let q = 0; q < m; q++) {
          out[i * m + p][j * m + q] = cMul(a[i][j], b[p][q]);
        }
      }
    }
  }
  return out;
}

export function matAdd(a: ComplexMatrix, b: ComplexMatrix): ComplexMatrix {
  return a.map((row, i) => row.map((v, j) => cAdd(v, b[i][j])));
}

export function matScale(a: ComplexMatrix, s: number): ComplexMatrix {
  return a.map((row) => row.map((v) => cScale(v, s)));
}

export function matMul(a: ComplexMatrix, b: ComplexMatrix): ComplexMatrix {
  const n = a.length;
  const k = b.length;
  const m = b[0].length;
  const out: ComplexMatrix = Array.from({ length: n }, () =>
    Array.from({ length: m }, () => c(0)),
  );
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < m; j++) {
      let sum = c(0);
      for (let l = 0; l < k; l++) {
        sum = cAdd(sum, cMul(a[i][l], b[l][j]));
      }
      out[i][j] = sum;
    }
  }
  return out;
}

export function matVec(a: ComplexMatrix, v: ComplexVector): ComplexVector {
  return a.map((row) => row.reduce((sum, aij, j) => cAdd(sum, cMul(aij, v[j])), c(0)));
}

/** Conjugate transpose. */
export function dagger(a: ComplexMatrix): ComplexMatrix {
  const n = a.length;
  const m = a[0].length;
  const out: ComplexMatrix = Array.from({ length: m }, () =>
    Array.from({ length: n }, () => c(0)),
  );
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < m; j++) {
      out[j][i] = cConj(a[i][j]);
    }
  }
  return out;
}

/** <v1|v2> = sum conj(v1_i) * v2_i */
export function innerProduct(v1: ComplexVector, v2: ComplexVector): Complex {
  return v1.reduce((sum, v1i, i) => cAdd(sum, cMul(cConj(v1i), v2[i])), c(0));
}

/** Real expectation value <psi|H|psi> for Hermitian H (imaginary part discarded, assumed ~0). */
export function expectationReal(psi: ComplexVector, h: ComplexMatrix): number {
  const hPsi = matVec(h, psi);
  return innerProduct(psi, hPsi).re;
}

/**
 * Closed-form eigen-decomposition of a real symmetric 2x2 matrix [[a, b], [b, d]].
 * Returns eigenvalues ascending with matching normalized eigenvectors.
 */
export function eigen2x2Symmetric(
  a: number,
  b: number,
  d: number,
): { values: [number, number]; vectors: [[number, number], [number, number]] } {
  const trace = a + d;
  const det = a * d - b * b;
  const disc = Math.sqrt(Math.max(trace * trace - 4 * det, 0));
  const lo = (trace - disc) / 2;
  const hi = (trace + disc) / 2;

  const eigVec = (lambda: number): [number, number] => {
    if (Math.abs(b) > 1e-12) {
      const x = 1;
      const y = (lambda - a) / b;
      const norm = Math.hypot(x, y);
      return [x / norm, y / norm];
    }
    return a <= d ? [1, 0] : [0, 1];
  };

  return { values: [lo, hi], vectors: [eigVec(lo), eigVec(hi)] };
}

/**
 * Jacobi eigenvalue algorithm for a real symmetric NxN matrix.
 * Returns eigenvalues and eigenvectors (columns of the returned matrix), unsorted.
 */
export function jacobiEigenSymmetric(
  input: number[][],
  maxSweeps = 100,
): { values: number[]; vectors: number[][] } {
  const n = input.length;
  const a = input.map((row) => [...row]);
  const v: number[][] = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)),
  );

  for (let sweep = 0; sweep < maxSweeps; sweep++) {
    let off = 0;
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) off += a[i][j] * a[i][j];
    }
    if (off < 1e-14) break;

    for (let p = 0; p < n; p++) {
      for (let q = p + 1; q < n; q++) {
        if (Math.abs(a[p][q]) < 1e-15) continue;
        const theta = (a[q][q] - a[p][p]) / (2 * a[p][q]);
        const t = Math.sign(theta || 1) / (Math.abs(theta) + Math.sqrt(theta * theta + 1));
        const cs = 1 / Math.sqrt(t * t + 1);
        const sn = t * cs;

        const app = a[p][p];
        const aqq = a[q][q];
        const apq = a[p][q];

        a[p][p] = cs * cs * app - 2 * sn * cs * apq + sn * sn * aqq;
        a[q][q] = sn * sn * app + 2 * sn * cs * apq + cs * cs * aqq;
        a[p][q] = 0;
        a[q][p] = 0;

        for (let i = 0; i < n; i++) {
          if (i === p || i === q) continue;
          const aip = a[i][p];
          const aiq = a[i][q];
          a[i][p] = cs * aip - sn * aiq;
          a[p][i] = a[i][p];
          a[i][q] = sn * aip + cs * aiq;
          a[q][i] = a[i][q];
        }

        for (let i = 0; i < n; i++) {
          const vip = v[i][p];
          const viq = v[i][q];
          v[i][p] = cs * vip - sn * viq;
          v[i][q] = sn * vip + cs * viq;
        }
      }
    }
  }

  return { values: a.map((row, i) => row[i]), vectors: v };
}

/**
 * Evaluates the unique degree-(n-1) polynomial through the given (x, y) points
 * at an arbitrary x via Lagrange interpolation.
 */
export function lagrangeInterpolate(points: { x: number; y: number }[], atX: number): number {
  let total = 0;
  for (let i = 0; i < points.length; i++) {
    let weight = 1;
    for (let j = 0; j < points.length; j++) {
      if (i === j) continue;
      weight *= (atX - points[j].x) / (points[i].x - points[j].x);
    }
    total += weight * points[i].y;
  }
  return total;
}

/** Richardson (zero-noise) extrapolation: Lagrange-interpolates the given points to x = 0. */
export function richardsonExtrapolateToZero(points: { x: number; y: number }[]): number {
  return lagrangeInterpolate(points, 0);
}
