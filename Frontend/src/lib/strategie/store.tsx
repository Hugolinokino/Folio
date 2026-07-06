import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { strategieApi, type StrategyDataDto, type StrategyWorkspaceSummary } from './api';
import {
  DEFAULT_MATRIX_KRITERIEN,
  emptyVorhaben,
  liveMeta,
  type Akteur,
  type Annahme,
  type Entscheidungspunkt,
  type Faktor,
  type Initiative,
  type JournalEntry,
  type Loop,
  type Matrix,
  type Option,
  type Strang,
  type Swot,
  type Tows,
  type Vorhaben,
  type Wargame,
} from './types';

const CURRENT_KEY = 'folio-strategie-current';

interface SwotSlice { akteure: Akteur[]; swot: Swot; tows: Tows }
interface ForesightSlice { faktoren: Faktor[]; annahmen: Annahme[]; loops: Loop[] }
interface TimelineSlice { entscheidungspunkte: Entscheidungspunkt[]; straenge: Strang[] }
interface OptionsSlice { optionen: Option[]; matrix: Matrix }
interface WargameSlice { wargame: Wargame }
interface ExecutionSlice { initiativen: Initiative[] }
interface JournalSlice { journal: JournalEntry[] }

function parse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function assemble(summary: StrategyWorkspaceSummary, dto: StrategyDataDto): Vorhaben {
  const empty = emptyVorhaben(summary.title, summary.horizon);
  const swotSlice = parse<SwotSlice>(dto.swotPestelStakeholders, {
    akteure: empty.akteure,
    swot: empty.swot,
    tows: empty.tows,
  });
  const foresightSlice = parse<ForesightSlice>(dto.foresightRadar, {
    faktoren: empty.faktoren,
    annahmen: empty.annahmen,
    loops: empty.loops,
  });
  const timelineSlice = parse<TimelineSlice>(dto.timelinesScenarios, {
    entscheidungspunkte: empty.entscheidungspunkte,
    straenge: empty.straenge,
  });
  const optionsSlice = parse<OptionsSlice>(dto.optionsMatrix, {
    optionen: empty.optionen,
    matrix: empty.matrix,
  });
  const wargameSlice = parse<WargameSlice>(dto.wargamingSimulation, { wargame: empty.wargame });
  const executionSlice = parse<ExecutionSlice>(dto.executionKpis, { initiativen: empty.initiativen });
  const journalSlice = parse<JournalSlice>(dto.journalRetro, { journal: empty.journal });

  return {
    meta: liveMeta(summary.title, summary.horizon),
    akteure: swotSlice.akteure,
    swot: swotSlice.swot,
    tows: swotSlice.tows,
    faktoren: foresightSlice.faktoren,
    annahmen: foresightSlice.annahmen,
    loops: foresightSlice.loops,
    entscheidungspunkte: timelineSlice.entscheidungspunkte,
    straenge: timelineSlice.straenge,
    optionen: optionsSlice.optionen,
    matrix: optionsSlice.matrix.kriterien?.length ? optionsSlice.matrix : { kriterien: DEFAULT_MATRIX_KRITERIEN },
    wargame: wargameSlice.wargame,
    initiativen: executionSlice.initiativen,
    journal: journalSlice.journal,
  };
}

function disassemble(d: Vorhaben): StrategyDataDto {
  return {
    swotPestelStakeholders: JSON.stringify({ akteure: d.akteure, swot: d.swot, tows: d.tows } satisfies SwotSlice),
    foresightRadar: JSON.stringify({ faktoren: d.faktoren, annahmen: d.annahmen, loops: d.loops } satisfies ForesightSlice),
    timelinesScenarios: JSON.stringify({
      entscheidungspunkte: d.entscheidungspunkte,
      straenge: d.straenge,
    } satisfies TimelineSlice),
    optionsMatrix: JSON.stringify({ optionen: d.optionen, matrix: d.matrix } satisfies OptionsSlice),
    wargamingSimulation: JSON.stringify({ wargame: d.wargame } satisfies WargameSlice),
    executionKpis: JSON.stringify({ initiativen: d.initiativen } satisfies ExecutionSlice),
    journalRetro: JSON.stringify({ journal: d.journal } satisfies JournalSlice),
  };
}

interface StrategieContextValue {
  workspaces: StrategyWorkspaceSummary[];
  currentId: string;
  data: Vorhaben;
  loading: boolean;
  update: (fn: (draft: Vorhaben) => void) => void;
  switchWorkspace: (id: string) => void;
  createWorkspace: (title: string, horizon: string) => Promise<void>;
}

const StrategieContext = createContext<StrategieContextValue | null>(null);

export function useStrategie(): StrategieContextValue {
  const ctx = useContext(StrategieContext);
  if (!ctx) throw new Error('useStrategie must be used within a StrategieProvider');
  return ctx;
}

export function StrategieProvider({ children }: { children: ReactNode }) {
  const [workspaces, setWorkspaces] = useState<StrategyWorkspaceSummary[]>([]);
  const [currentId, setCurrentId] = useState<string>('');
  const [data, setData] = useState<Vorhaben>(() => emptyVorhaben('Neues Vorhaben', ''));
  const [loading, setLoading] = useState(true);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    (async () => {
      let list = await strategieApi.listWorkspaces();
      if (list.length === 0) {
        const created = await strategieApi.createWorkspace('Neues Vorhaben', '');
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
    strategieApi.getData(currentId).then((dto) => {
      setData(assemble(summary, dto));
      setLoading(false);
    });
  }, [currentId, workspaces]);

  const persist = (next: Vorhaben) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      strategieApi.saveData(currentId, disassemble(next));
    }, 400);
  };

  const update = (fn: (draft: Vorhaben) => void) => {
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

  const createWorkspace = async (title: string, horizon: string) => {
    const created = await strategieApi.createWorkspace(title.trim() || 'Neues Vorhaben', horizon.trim());
    setWorkspaces((prev) => [...prev, created]);
    localStorage.setItem(CURRENT_KEY, created.id);
    setCurrentId(created.id);
  };

  const value = useMemo(
    () => ({ workspaces, currentId, data, loading, update, switchWorkspace, createWorkspace }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [workspaces, currentId, data, loading],
  );

  return <StrategieContext.Provider value={value}>{children}</StrategieContext.Provider>;
}
