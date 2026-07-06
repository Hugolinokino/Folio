/** Pure vector math for the Akten offline-AI features — no model code here,
 * just cosine similarity and a small spherical k-means over the 384-dim
 * MiniLM embeddings. Everything is deterministic given its inputs except the
 * k-means++ seeding, which uses Math.random. */

export function cosineSimilarity(a: Float32Array, b: Float32Array): number {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  const denom = Math.sqrt(na) * Math.sqrt(nb);
  return denom === 0 ? 0 : dot / denom;
}

function normalize(v: Float32Array): Float32Array {
  let norm = 0;
  for (let i = 0; i < v.length; i++) norm += v[i] * v[i];
  norm = Math.sqrt(norm);
  if (norm === 0) return v;
  const out = new Float32Array(v.length);
  for (let i = 0; i < v.length; i++) out[i] = v[i] / norm;
  return out;
}

function dot(a: Float32Array, b: Float32Array): number {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * b[i];
  return s;
}

/** k-means++ seeding: spread the initial centroids out proportionally to
 * (cosine) distance from the ones already chosen. */
function seedCentroids(vectors: Float32Array[], k: number): Float32Array[] {
  const centroids: Float32Array[] = [vectors[Math.floor(Math.random() * vectors.length)]];
  while (centroids.length < k) {
    const distances = vectors.map((v) => {
      let best = Infinity;
      for (const c of centroids) best = Math.min(best, 1 - dot(v, c));
      return best;
    });
    const total = distances.reduce((s, d) => s + d, 0);
    if (total === 0) {
      // All remaining points coincide with a centroid — pad with duplicates.
      centroids.push(vectors[centroids.length % vectors.length]);
      continue;
    }
    let r = Math.random() * total;
    let idx = 0;
    for (; idx < distances.length - 1; idx++) {
      r -= distances[idx];
      if (r <= 0) break;
    }
    centroids.push(vectors[idx]);
  }
  return centroids;
}

/** Spherical k-means (cosine distance on unit vectors). Returns one cluster
 * index (0..k-1) per input vector. Callers must pass k >= 1 and at least k
 * vectors. */
export function kMeans(rawVectors: Float32Array[], k: number, maxIter = 50): number[] {
  const vectors = rawVectors.map(normalize);
  let centroids = seedCentroids(vectors, k);
  let assignments = new Array<number>(vectors.length).fill(0);

  for (let iter = 0; iter < maxIter; iter++) {
    let changed = false;
    for (let i = 0; i < vectors.length; i++) {
      let best = 0;
      let bestSim = -Infinity;
      for (let c = 0; c < centroids.length; c++) {
        const sim = dot(vectors[i], centroids[c]);
        if (sim > bestSim) {
          bestSim = sim;
          best = c;
        }
      }
      if (assignments[i] !== best) {
        assignments[i] = best;
        changed = true;
      }
    }
    if (!changed && iter > 0) break;

    const dims = vectors[0].length;
    const sums = Array.from({ length: k }, () => new Float32Array(dims));
    const counts = new Array<number>(k).fill(0);
    for (let i = 0; i < vectors.length; i++) {
      const c = assignments[i];
      counts[c]++;
      for (let d = 0; d < dims; d++) sums[c][d] += vectors[i][d];
    }
    centroids = centroids.map((old, c) => (counts[c] === 0 ? old : normalize(sums[c])));
  }

  return assignments;
}
