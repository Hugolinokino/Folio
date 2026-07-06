import { pipeline, env, type FeatureExtractionPipeline } from '@huggingface/transformers';

// Never probe the Vite dev server for local model files — go straight to the
// HF Hub (one-time download, cached by the browser runtime afterwards).
env.allowLocalModels = false;

interface EmbedRequest {
  id: number;
  text: string;
}

interface EmbedResponse {
  id: number;
  vector?: Float32Array;
  error?: string;
}

let extractorPromise: Promise<FeatureExtractionPipeline> | null = null;

function getExtractor(): Promise<FeatureExtractionPipeline> {
  if (!extractorPromise) {
    extractorPromise = pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  }
  return extractorPromise;
}

self.onmessage = async (e: MessageEvent<EmbedRequest>) => {
  const { id, text } = e.data;
  try {
    const extractor = await getExtractor();
    // MiniLM truncates to its context window anyway; pre-slicing just keeps
    // the tokenizer from chewing through megabytes of PDF text first.
    const output = await extractor(text.slice(0, 4000), { pooling: 'mean', normalize: true });
    const vector = new Float32Array(output.data as Float32Array);
    const response: EmbedResponse = { id, vector };
    self.postMessage(response, { transfer: [vector.buffer] });
  } catch (err) {
    const response: EmbedResponse = { id, error: err instanceof Error ? err.message : String(err) };
    self.postMessage(response);
  }
};
