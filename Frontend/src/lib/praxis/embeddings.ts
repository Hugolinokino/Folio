/** Client for the MiniLM embedding Web Worker. The worker (and the model
 * download behind it) is created lazily on the first embed call so app
 * startup never blocks on it. */

interface Pending {
  resolve: (v: Float32Array) => void;
  reject: (e: Error) => void;
}

let worker: Worker | null = null;
let nextId = 0;
const pending = new Map<number, Pending>();

function getWorker(): Worker {
  if (!worker) {
    worker = new Worker(new URL('./embed.worker.ts', import.meta.url), { type: 'module' });
    worker.onmessage = (e: MessageEvent<{ id: number; vector?: Float32Array; error?: string }>) => {
      const { id, vector, error } = e.data;
      const p = pending.get(id);
      if (!p) return;
      pending.delete(id);
      if (vector) p.resolve(vector);
      else p.reject(new Error(error || 'Embedding fehlgeschlagen.'));
    };
    worker.onerror = (e) => {
      const err = new Error(e.message || 'Embedding-Worker-Fehler.');
      for (const p of pending.values()) p.reject(err);
      pending.clear();
    };
  }
  return worker;
}

export function embedText(text: string): Promise<Float32Array> {
  const id = nextId++;
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
    getWorker().postMessage({ id, text });
  });
}

/** Little-endian f32 bytes ↔ vector, matching the BLOB the Rust side stores byte-exact. */
export function vectorToBytes(vector: Float32Array): number[] {
  return Array.from(new Uint8Array(vector.buffer, vector.byteOffset, vector.byteLength));
}

export function bytesToVector(bytes: number[]): Float32Array {
  return new Float32Array(new Uint8Array(bytes).buffer);
}
