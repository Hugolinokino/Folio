import { praxisApi } from './api';
import { embedText, vectorToBytes, bytesToVector } from './embeddings';
import { cosineSimilarity, kMeans } from './ml';
import type { Akte } from './types';

export interface SearchHit {
  id: string;
  score: number;
}

/** Loads all stored embeddings for a case and lazily backfills any document
 * that has extracted text but no embedding yet (documents imported before
 * this feature existed, or whose embedding failed). Returns id → vector for
 * every document that ended up with one. */
export async function ensureEmbeddings(
  caseId: string,
  akten: Akte[],
  onProgress?: (msg: string) => void,
): Promise<Map<string, Float32Array>> {
  const rows = await praxisApi.listDocumentEmbeddings(caseId);
  const vectors = new Map<string, Float32Array>();
  for (const row of rows) {
    if (row.embedding && row.embedding.length > 0) {
      vectors.set(row.id, bytesToVector(row.embedding));
    }
  }

  const missing = akten.filter((a) => !vectors.has(a.id) && a.content && a.content.trim().length > 0);
  for (let i = 0; i < missing.length; i++) {
    onProgress?.(`Embeddings werden berechnet … (${i + 1}/${missing.length})`);
    const akte = missing[i];
    const vector = await embedText(akte.content!);
    await praxisApi.updateDocumentEmbedding(akte.id, vectorToBytes(vector));
    vectors.set(akte.id, vector);
  }

  return vectors;
}

/** Embeds and stores a single freshly imported document. Fire-and-forget from
 * the upload flow — failures land in the console and the document is simply
 * picked up again by the next lazy backfill. */
export async function embedDocument(documentId: string, text: string): Promise<void> {
  try {
    if (!text.trim()) return;
    const vector = await embedText(text);
    await praxisApi.updateDocumentEmbedding(documentId, vectorToBytes(vector));
  } catch (err) {
    console.error('Embedding für Dokument fehlgeschlagen:', documentId, err);
  }
}

/** Runs k-means over the case's document embeddings (backfilling first) and
 * persists the assignments. Returns the number of clusters, or null when
 * there aren't enough embedded documents to cluster meaningfully. */
export async function computeClusters(
  caseId: string,
  akten: Akte[],
  onProgress?: (msg: string) => void,
): Promise<number | null> {
  const vectors = await ensureEmbeddings(caseId, akten, onProgress);
  if (vectors.size < 2) return null;

  onProgress?.('Cluster werden berechnet …');
  const ids = Array.from(vectors.keys());
  const k = Math.min(4, ids.length);
  const assignments = kMeans(ids.map((id) => vectors.get(id)!), k);
  await praxisApi.assignDocumentClusters(ids.map((id, i) => ({ documentId: id, clusterId: assignments[i] })));
  return k;
}

/** Embeds the query and ranks the case's documents by cosine similarity —
 * pure retrieval, no generated answer on top. */
export async function semanticSearch(
  caseId: string,
  akten: Akte[],
  query: string,
  onProgress?: (msg: string) => void,
): Promise<SearchHit[]> {
  const vectors = await ensureEmbeddings(caseId, akten, onProgress);
  onProgress?.('Suche läuft …');
  const queryVector = await embedText(query);
  return Array.from(vectors.entries())
    .map(([id, v]) => ({ id, score: cosineSimilarity(queryVector, v) }))
    .sort((a, b) => b.score - a.score);
}
