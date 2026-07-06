/** Triggers a browser download of in-memory text — used for client-side exports (Obsidian Markdown, JSON, …). */
export function download(name: string, text: string, mime: string) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type: mime }));
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}
