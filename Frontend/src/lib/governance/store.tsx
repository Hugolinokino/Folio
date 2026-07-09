import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { governanceApi, type GovernanceDataDto, type GovernanceWorkspaceSummary } from './api';
import {
  emptyMandat,
  liveMeta,
  type Benchmark,
  type Check,
  type Erlass,
  type KalenderEintrag,
  type Kompetenz,
  type Konflikt,
  type Mandat,
  type Organ,
  type Prozess,
  type RaciRow,
  type Reform,
  type ScorecardDim,
  type Unterschrift,
  type Verweis,
  type Befund,
} from './types';

const CURRENT_KEY = 'folio-governance-current';

interface NormenwerkSlice { erlasse: Erlass[] }
interface VerweisnetzSlice { verweise: Verweis[]; befunde: Befund[] }
interface OrganeSlice { organe: Organ[]; kompetenzen: Kompetenz[]; raci: RaciRow[]; unterschriften: Unterschrift[] }
interface ProzesseSlice { prozesse: Prozess[]; checks: Check[] }
interface ComplianceSlice { konflikte: Konflikt[]; kalender: KalenderEintrag[] }
interface ScorecardSlice { scorecard: ScorecardDim[]; benchmarks: Benchmark[] }
interface ReformSlice { reformen: Reform[] }

function parse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function assemble(summary: GovernanceWorkspaceSummary, dto: GovernanceDataDto): Mandat {
  const empty = emptyMandat(summary.title, summary.rechtsform);
  const normenwerk = parse<NormenwerkSlice>(dto.normenwerk, { erlasse: empty.erlasse });
  const verweisnetz = parse<VerweisnetzSlice>(dto.verweisnetz, { verweise: empty.verweise, befunde: empty.befunde });
  const organe = parse<OrganeSlice>(dto.organeKompetenzen, {
    organe: empty.organe,
    kompetenzen: empty.kompetenzen,
    raci: empty.raci,
    unterschriften: empty.unterschriften,
  });
  const prozesse = parse<ProzesseSlice>(dto.prozesseKontrolle, { prozesse: empty.prozesse, checks: empty.checks });
  const compliance = parse<ComplianceSlice>(dto.compliance, { konflikte: empty.konflikte, kalender: empty.kalender });
  const scorecard = parse<ScorecardSlice>(dto.scorecard, { scorecard: empty.scorecard, benchmarks: empty.benchmarks });
  const reform = parse<ReformSlice>(dto.reformSimulator, { reformen: empty.reformen });

  return {
    meta: liveMeta(summary.title, summary.rechtsform),
    erlasse: normenwerk.erlasse,
    verweise: verweisnetz.verweise,
    befunde: verweisnetz.befunde,
    organe: organe.organe,
    kompetenzen: organe.kompetenzen,
    raci: organe.raci,
    unterschriften: organe.unterschriften,
    prozesse: prozesse.prozesse,
    checks: prozesse.checks,
    konflikte: compliance.konflikte,
    kalender: compliance.kalender,
    scorecard: scorecard.scorecard,
    benchmarks: scorecard.benchmarks,
    reformen: reform.reformen,
  };
}

function disassemble(d: Mandat): GovernanceDataDto {
  return {
    normenwerk: JSON.stringify({ erlasse: d.erlasse } satisfies NormenwerkSlice),
    verweisnetz: JSON.stringify({ verweise: d.verweise, befunde: d.befunde } satisfies VerweisnetzSlice),
    organeKompetenzen: JSON.stringify({
      organe: d.organe,
      kompetenzen: d.kompetenzen,
      raci: d.raci,
      unterschriften: d.unterschriften,
    } satisfies OrganeSlice),
    prozesseKontrolle: JSON.stringify({ prozesse: d.prozesse, checks: d.checks } satisfies ProzesseSlice),
    compliance: JSON.stringify({ konflikte: d.konflikte, kalender: d.kalender } satisfies ComplianceSlice),
    scorecard: JSON.stringify({ scorecard: d.scorecard, benchmarks: d.benchmarks } satisfies ScorecardSlice),
    reformSimulator: JSON.stringify({ reformen: d.reformen } satisfies ReformSlice),
  };
}

interface GovernanceContextValue {
  workspaces: GovernanceWorkspaceSummary[];
  currentId: string;
  data: Mandat;
  loading: boolean;
  update: (fn: (draft: Mandat) => void) => void;
  switchWorkspace: (id: string) => void;
  createWorkspace: (title: string, rechtsform: string) => Promise<void>;
  renameWorkspace: (id: string, title: string) => Promise<void>;
  deleteWorkspace: (id: string) => Promise<void>;
}

const GovernanceContext = createContext<GovernanceContextValue | null>(null);

export function useGovernance(): GovernanceContextValue {
  const ctx = useContext(GovernanceContext);
  if (!ctx) throw new Error('useGovernance must be used within a GovernanceProvider');
  return ctx;
}

export function GovernanceProvider({ children }: { children: ReactNode }) {
  const [workspaces, setWorkspaces] = useState<GovernanceWorkspaceSummary[]>([]);
  const [currentId, setCurrentId] = useState<string>('');
  const [data, setData] = useState<Mandat>(() => emptyMandat('Neues Mandat', ''));
  const [loading, setLoading] = useState(true);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    (async () => {
      let list = await governanceApi.listWorkspaces();
      if (list.length === 0) {
        const created = await governanceApi.createWorkspace('Neues Mandat', '');
        list = [created];
      }
      setWorkspaces(list);
      const stored = localStorage.getItem(CURRENT_KEY);
      const initial = list.find((w) => w.id === stored)?.id || list[0].id;
      setCurrentId(initial);
    })();
  }, []);

  useEffect(() => {
    if (!currentId) return;
    const summary = workspaces.find((w) => w.id === currentId);
    if (!summary) return;
    setLoading(true);
    governanceApi.getData(currentId).then((dto) => {
      setData(assemble(summary, dto));
      setLoading(false);
    });
  }, [currentId, workspaces]);

  const persist = (next: Mandat) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      governanceApi.saveData(currentId, disassemble(next));
    }, 400);
  };

  const update = (fn: (draft: Mandat) => void) => {
    setData((prev) => {
      const draft = structuredClone(prev);
      fn(draft);
      persist(draft);
      return draft;
    });
  };

  const switchWorkspace = (id: string) => {
    if (id === currentId) return;
    localStorage.setItem(CURRENT_KEY, id);
    setCurrentId(id);
  };

  const createWorkspace = async (title: string, rechtsform: string) => {
    const created = await governanceApi.createWorkspace(title.trim() || 'Neues Mandat', rechtsform.trim());
    setWorkspaces((prev) => [...prev, created]);
    localStorage.setItem(CURRENT_KEY, created.id);
    setCurrentId(created.id);
  };

  const renameWorkspace = async (id: string, title: string) => {
    const clean = title.trim();
    if (!clean) return;
    await governanceApi.renameWorkspace(id, clean);
    setWorkspaces((prev) => prev.map((w) => (w.id === id ? { ...w, title: clean } : w)));
    if (id === currentId) {
      setData((prev) => ({ ...prev, meta: liveMeta(clean, prev.meta.rechtsform) }));
    }
  };

  const deleteWorkspace = async (id: string) => {
    await governanceApi.deleteWorkspace(id);
    const remaining = workspaces.filter((w) => w.id !== id);
    if (id !== currentId) {
      setWorkspaces(remaining);
      return;
    }
    if (remaining.length > 0) {
      setWorkspaces(remaining);
      localStorage.setItem(CURRENT_KEY, remaining[0].id);
      setCurrentId(remaining[0].id);
    } else {
      const created = await governanceApi.createWorkspace('Neues Mandat', '');
      setWorkspaces([created]);
      localStorage.setItem(CURRENT_KEY, created.id);
      setCurrentId(created.id);
    }
  };

  const value = useMemo(
    () => ({ workspaces, currentId, data, loading, update, switchWorkspace, createWorkspace, renameWorkspace, deleteWorkspace }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [workspaces, currentId, data, loading],
  );

  return <GovernanceContext.Provider value={value}>{children}</GovernanceContext.Provider>;
}
