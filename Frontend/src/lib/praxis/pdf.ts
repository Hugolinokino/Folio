import * as pdfjsLib from 'pdfjs-dist';

// WKWebView (Tauri's engine on macOS) implements ReadableStream but not
// Symbol.asyncIterator on it, which pdf.js's getTextContent() relies on via
// `for await...of`. Polyfill via the universally-supported reader API.
if (typeof ReadableStream !== 'undefined' && !(Symbol.asyncIterator in ReadableStream.prototype)) {
  Object.defineProperty(ReadableStream.prototype, Symbol.asyncIterator, {
    configurable: true,
    writable: true,
    value: function asyncIterator(this: ReadableStream) {
      const reader = this.getReader();
      return {
        async next() {
          const { done, value } = await reader.read();
          return done ? { done: true as const, value: undefined } : { done: false as const, value };
        },
        async return(value?: unknown) {
          await reader.cancel();
          return { done: true as const, value };
        },
        [Symbol.asyncIterator]() {
          return this;
        },
      };
    },
  });
}

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.mjs', import.meta.url).href;

export interface ExtractedPdf {
  text: string;
  pages: number;
}

/** Runs entirely through pdf.js's own background worker — the main thread only awaits the result. */
export async function extractPdfText(bytes: Uint8Array): Promise<ExtractedPdf> {
  const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
  const pageTexts: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const text = content.items.map((item) => ('str' in item ? item.str : '')).join(' ');
    pageTexts.push(text);
  }
  return { text: pageTexts.join('\n\n'), pages: pdf.numPages };
}
