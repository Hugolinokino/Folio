const MONATE_DE = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];

export function formatDateDe(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.getDate()}. ${MONATE_DE[d.getMonth()]} ${d.getFullYear()}`;
}

export function daysUntil(iso: string): number {
  const d = new Date(`${iso}T00:00:00`);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - now.getTime()) / 86400000);
}

export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function nowDisplay(): string {
  const now = new Date();
  return `${now.getDate()}. ${MONATE_DE[now.getMonth()]} ${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}

/** SQLite CURRENT_TIMESTAMP is UTC 'YYYY-MM-DD HH:MM:SS' with no timezone marker. */
export function formatRelative(sqliteUtc: string): string {
  const iso = `${sqliteUtc.replace(' ', 'T')}Z`;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return sqliteUtc;
  const diffMs = Date.now() - d.getTime();
  const minutes = Math.round(diffMs / 60000);
  if (minutes < 1) return 'gerade eben';
  if (minutes < 60) return `vor ${minutes} Min.`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `vor ${hours} Std.`;
  const days = Math.round(hours / 24);
  if (days === 1) return 'gestern';
  if (days < 14) return `vor ${days} Tagen`;
  return formatDateDe(d.toISOString().slice(0, 10));
}

export function countWords(html: string): number {
  const text = html.replace(/<[^>]+>/g, ' ');
  return text.split(/\s+/).filter(Boolean).length;
}
