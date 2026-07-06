import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { open } from '@tauri-apps/plugin-dialog';
import { praxisApi, type CaseSummaryDto, type CaseDetailDto, type ParteiDto, type DeadlineDto, type DocumentDto, type ChronoEventDto, type CorrespondenceDto, type BillingEntryDto, type DraftDto } from './api';
import { countWords, daysUntil, formatDateDe, formatRelative, todayIso } from './format';
import { extractPdfText } from './pdf';
import type { Fall, Frist, RadarRow } from './types';

interface CaseListContextValue {
  cases: CaseSummaryDto[];
  loading: boolean;
  reload: () => void;
  createCase: (title: string, gebiet: string) => Promise<void>;
}

const CaseListContext = createContext<CaseListContextValue | null>(null);

/**
 * Shared across every simultaneous consumer (sidebar, switcher, home grid) so
 * that creating a case from any one of them refreshes all the others too —
 * a plain per-component hook would give each caller its own disconnected copy.
 */
export function CaseListProvider({ children }: { children: ReactNode }) {
  const [cases, setCases] = useState<CaseSummaryDto[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(() => {
    praxisApi.listCases().then((c) => {
      setCases(c);
      setLoading(false);
    });
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const createCase = async (title: string, gebiet: string) => {
    await praxisApi.createCase(title, gebiet);
    reload();
  };

  const value = useMemo(() => ({ cases, loading, reload, createCase }), [cases, loading, reload]);
  return <CaseListContext.Provider value={value}>{children}</CaseListContext.Provider>;
}

export function useCaseList(): CaseListContextValue {
  const ctx = useContext(CaseListContext);
  if (!ctx) throw new Error('useCaseList must be used within a CaseListProvider');
  return ctx;
}

export function useFristenradar() {
  const [rows, setRows] = useState<RadarRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    praxisApi.listAllDeadlines().then((deadlines) => {
      const mapped: RadarRow[] = deadlines
        .map((d) => ({
          id: d.id,
          titel: d.title,
          dueDateIso: d.dueDate,
          datum: formatDateDe(d.dueDate),
          tage: daysUntil(d.dueDate),
          art: d.type || '',
          note: d.note || '',
          completed: d.completed,
          caseId: d.caseId,
          caseTitle: d.caseTitle,
          caseRef: d.caseRef,
        }))
        .sort((a, b) => a.tage - b.tage);
      setRows(mapped);
      setLoading(false);
    });
  }, []);

  return { rows, loading };
}

function assembleFall(
  detail: CaseDetailDto,
  parteien: ParteiDto[],
  deadlines: DeadlineDto[],
  akten: DocumentDto[],
  chrono: ChronoEventDto[],
  korrespondenz: CorrespondenceDto[],
  billing: BillingEntryDto[],
  drafts: DraftDto[],
): Fall {
  const fristen: Frist[] = deadlines
    .map((d) => ({
      id: d.id,
      titel: d.title,
      dueDateIso: d.dueDate,
      datum: formatDateDe(d.dueDate),
      tage: daysUntil(d.dueDate),
      art: d.type || '',
      note: d.note || '',
      completed: d.completed,
    }))
    .sort((a, b) => a.tage - b.tage);
  const nextFrist = fristen.find((f) => !f.completed) || null;
  const totalMinutes = billing.reduce((s, e) => s + e.minutes, 0);

  return {
    id: detail.id,
    ref: detail.ref,
    title: detail.title,
    phase: detail.phase,
    streitwert: detail.streitwert || '—',
    gebiet: detail.gebiet || '',
    kurz: detail.kurz || '',
    verfahren: detail.verfahren || '',
    gericht: detail.gericht || '',
    nr: detail.nr || '',
    color: detail.color || 'blue',
    rolleKlient: detail.rolleKlient || 'Klient*in',
    rate: detail.rate,
    budget: detail.budget || 0,
    parteien: parteien.map((p) => ({
      id: p.id,
      rolle: p.rolle,
      name: p.name,
      detail: p.detail || '',
      vertreter: p.vertreter || '',
      klient: p.isKlient,
    })),
    fristen,
    nextFrist,
    akten: akten.map((a) => ({
      id: a.id,
      nr: a.nr,
      titel: a.title,
      absender: a.sender || '',
      typ: a.docType || '',
      ordner: a.folder || 'Unsortiert',
      seiten: a.pages,
      filePath: a.filePath,
      content: a.content,
      datum: a.docDate ? formatDateDe(a.docDate) : '',
    })),
    chrono: chrono.map((c) => ({ id: c.id, datum: formatDateDe(c.eventDate), ereignis: c.ereignis, beleg: c.beleg || '' })),
    korrespondenz: korrespondenz.map((k) => ({
      id: k.id,
      datum: formatDateDe(k.corrDate),
      richtung: k.richtung === 'aus' ? 'aus' : 'ein',
      von: k.von || '',
      betreff: k.betreff || '',
      typ: k.typ || '',
    })),
    honorar: {
      rate: detail.rate,
      budget: detail.budget || 1,
      entries: billing.map((b) => ({ id: b.id, datum: formatDateDe(b.entryDate), taetigkeit: b.taetigkeit, minuten: b.minutes })),
      total: totalMinutes / 60,
    },
    entwuerfe: drafts.map((d) => ({
      id: d.id,
      titel: d.titel,
      typ: d.typ || '',
      status: d.status || '',
      content: d.content,
      updated: d.updatedAt ? formatRelative(d.updatedAt) : '',
      words: countWords(d.content),
    })),
  };
}

export function useCaseWorkspace(caseId: string | null) {
  const [fall, setFall] = useState<Fall | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    if (!caseId) return;
    setLoading(true);
    const [detail, parteien, deadlines, akten, chrono, korrespondenz, billing, drafts] = await Promise.all([
      praxisApi.getCase(caseId),
      praxisApi.listCaseParties(caseId),
      praxisApi.listDeadlines(caseId),
      praxisApi.listDocuments(caseId),
      praxisApi.listChrono(caseId),
      praxisApi.listCorrespondence(caseId),
      praxisApi.listBillingEntries(caseId),
      praxisApi.listDrafts(caseId),
    ]);
    setFall(assembleFall(detail, parteien, deadlines, akten, chrono, korrespondenz, billing, drafts));
    setLoading(false);
  }, [caseId]);

  useEffect(() => {
    reload();
  }, [reload]);

  const addFrist = async (title: string, dueDate: string, type: string, note: string) => {
    if (!caseId) return;
    await praxisApi.createDeadline(caseId, title, dueDate, type, note);
    await reload();
  };

  const completeFrist = async (deadlineId: string) => {
    await praxisApi.completeDeadline(deadlineId);
    await reload();
  };

  const addChronoEvent = async (ereignis: string, beleg: string, eventDate = todayIso()) => {
    if (!caseId) return;
    await praxisApi.createChronoEvent(caseId, eventDate, ereignis, beleg);
    await reload();
  };

  const addCorrespondence = async (richtung: 'ein' | 'aus', von: string, betreff: string, typ: string, corrDate = todayIso()) => {
    if (!caseId) return;
    await praxisApi.createCorrespondence(caseId, corrDate, richtung, von, betreff, typ);
    await reload();
  };

  const addBillingEntry = async (taetigkeit: string, minutes: number, entryDate = todayIso()) => {
    if (!caseId) return;
    await praxisApi.createBillingEntry(caseId, entryDate, taetigkeit, minutes);
    await reload();
  };

  const addParty = async (rolle: string, name: string, detail: string, vertreter: string, isKlient: boolean) => {
    if (!caseId) return;
    await praxisApi.createCaseParty(caseId, rolle, name, detail, vertreter, isKlient);
    await reload();
  };

  const addDraft = async (titel: string, typ: string) => {
    if (!caseId) return null;
    const draft = await praxisApi.createDraft(caseId, titel, typ);
    await reload();
    return draft;
  };

  const updateDraftContent = async (draftId: string, content: string) => {
    await praxisApi.updateDraftContent(draftId, content);
  };

  const uploadDocument = async (folder: string) => {
    if (!caseId || !fall) return;
    const selected = await open({ multiple: false, filters: [{ name: 'PDF', extensions: ['pdf'] }] });
    if (!selected || Array.isArray(selected)) return;
    const bytesArray = await praxisApi.readBinaryFile(selected);
    const bytes = new Uint8Array(bytesArray);
    const { text, pages } = await extractPdfText(bytes);
    const fileName = selected.split(/[\\/]/).pop() || 'Dokument.pdf';
    const titel = fileName.replace(/\.pdf$/i, '');
    const nr = `act. ${fall.akten.length + 1}`;
    await praxisApi.importDocument(caseId, selected, nr, titel, '', 'Beilage', folder, text, pages, todayIso());
    await reload();
  };

  return {
    fall,
    loading,
    reload,
    addFrist,
    completeFrist,
    addChronoEvent,
    addCorrespondence,
    addBillingEntry,
    addParty,
    addDraft,
    updateDraftContent,
    uploadDocument,
  };
}
