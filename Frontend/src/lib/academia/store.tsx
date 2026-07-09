import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { open, save } from '@tauri-apps/plugin-dialog';
import { download } from '../download';
import { buildBibliography } from './citation';
import {
  academiaApi,
  type ProjectDto,
  type SourceDto,
  type NoteSummaryDto,
  type ChapterDto,
  type TaskDto,
  type MilestoneDto,
  type ActivityEntryDto,
  type OutlineNodeDto,
  type ArgumentPointDto,
  type ThesisDto,
  type ThesisPointDto,
  type QuoteDto,
} from './api';
import { extractPdfText } from '../praxis/pdf';

interface ProjectListContextValue {
  projects: ProjectDto[];
  loading: boolean;
  reload: () => void;
  createProject: (title: string, type: string, advisor: string) => Promise<void>;
  renameProject: (projectId: string, title: string) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
}

const ProjectListContext = createContext<ProjectListContextValue | null>(null);

export function ProjectListProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<ProjectDto[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(() => {
    academiaApi.listProjects().then((p) => {
      setProjects(p);
      setLoading(false);
    });
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const createProject = async (title: string, type: string, advisor: string) => {
    await academiaApi.createProject(title, type, advisor);
    reload();
  };

  const renameProject = async (projectId: string, title: string) => {
    const clean = title.trim();
    if (!clean) return;
    await academiaApi.renameProject(projectId, clean);
    reload();
  };

  const deleteProject = async (projectId: string) => {
    await academiaApi.deleteProject(projectId);
    reload();
  };

  const value = useMemo(
    () => ({ projects, loading, reload, createProject, renameProject, deleteProject }),
    [projects, loading, reload],
  );
  return <ProjectListContext.Provider value={value}>{children}</ProjectListContext.Provider>;
}

export function useProjectList(): ProjectListContextValue {
  const ctx = useContext(ProjectListContext);
  if (!ctx) throw new Error('useProjectList must be used within a ProjectListProvider');
  return ctx;
}

export function useProjectWorkspace(projectId: string | null) {
  const [project, setProject] = useState<ProjectDto | null>(null);
  const [sources, setSources] = useState<SourceDto[]>([]);
  const [notes, setNotes] = useState<NoteSummaryDto[]>([]);
  const [chapters, setChapters] = useState<ChapterDto[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    const [proj, src, nts, chs] = await Promise.all([
      academiaApi.getProject(projectId),
      academiaApi.listSources(projectId),
      academiaApi.listNotes(projectId),
      academiaApi.listChapters(projectId),
    ]);
    setProject(proj);
    setSources(src);
    setNotes(nts);
    setChapters(chs);
    setLoading(false);
  }, [projectId]);

  useEffect(() => { reload(); }, [reload]);

  const addSource = async (
    type: string,
    citationKey: string,
    title: string,
    author: string,
    year: number | null,
    annotation: string,
    edition = '',
    place = '',
  ) => {
    if (!projectId) return;
    await academiaApi.createSource(projectId, type, citationKey, title, author, year, annotation, edition, place);
    await reload();
  };

  const importSource = async (type: string) => {
    if (!projectId) return;
    const selected = await open({ multiple: false, filters: [{ name: 'PDF', extensions: ['pdf'] }] });
    if (!selected || Array.isArray(selected)) return;
    const bytesArray = await academiaApi.readBinaryFile(selected);
    const bytes = new Uint8Array(bytesArray);
    const { text } = await extractPdfText(bytes);
    const fileName = selected.split(/[\\/]/).pop() || 'Quelle.pdf';
    const title = fileName.replace(/\.pdf$/i, '');
    await academiaApi.importSource(projectId, selected, type, title, title, '', null, '', text);
    await reload();
  };

  const deleteSource = async (sourceId: string) => {
    await academiaApi.deleteSource(sourceId);
    await reload();
  };

  const renameSource = async (sourceId: string, title: string) => {
    const clean = title.trim();
    if (!clean) return;
    await academiaApi.renameSource(sourceId, clean);
    await reload();
  };

  const addNote = async (title: string) => {
    if (!projectId) return null;
    const note = await academiaApi.createNote(projectId, title);
    await reload();
    return note;
  };

  const renameNote = async (noteId: string, title: string) => {
    const clean = title.trim();
    if (!clean) return;
    await academiaApi.renameNote(noteId, clean);
    await reload();
  };

  const updateNoteContent = async (noteId: string, content: string, tags: string) => {
    await academiaApi.updateNote(noteId, content, tags);
  };

  const deleteNote = async (noteId: string) => {
    await academiaApi.deleteNote(noteId);
    await reload();
  };

  const addChapter = async (title: string) => {
    if (!projectId) return null;
    const chapter = await academiaApi.createChapter(projectId, title);
    await reload();
    return chapter;
  };

  const renameChapter = async (chapterId: string, title: string) => {
    const clean = title.trim();
    if (!clean) return;
    await academiaApi.renameChapter(chapterId, clean);
    await reload();
  };

  const updateChapterContent = async (chapterId: string, content: string) => {
    await academiaApi.updateChapterContent(chapterId, content);
  };

  const deleteChapter = async (chapterId: string) => {
    await academiaApi.deleteChapter(chapterId);
    await reload();
  };

  const exportMarkdown = async () => {
    if (!projectId) return;
    const md = await academiaApi.exportChaptersMarkdown(projectId);
    download(`${project?.title || 'export'}.md`, md, 'text/markdown');
  };

  const exportLatex = async () => {
    if (!projectId) return;
    const tex = await academiaApi.exportChaptersLatex(projectId, buildBibliography(sources));
    download(`${project?.title || 'export'}.tex`, tex, 'application/x-tex');
  };

  const exportDocx = async () => {
    if (!projectId) return;
    const path = await save({
      defaultPath: `${project?.title || 'export'}.docx`,
      filters: [{ name: 'Word', extensions: ['docx'] }],
    });
    if (!path) return;
    await academiaApi.exportChaptersDocx(projectId, path, buildBibliography(sources));
  };

  const exportPdf = async () => {
    if (!projectId) return;
    const path = await save({
      defaultPath: `${project?.title || 'export'}.pdf`,
      filters: [{ name: 'PDF', extensions: ['pdf'] }],
    });
    if (!path) return;
    await academiaApi.exportChaptersPdf(projectId, path, buildBibliography(sources));
  };

  return {
    project,
    sources,
    notes,
    chapters,
    loading,
    reload,
    addSource,
    importSource,
    deleteSource,
    renameSource,
    addNote,
    renameNote,
    updateNoteContent,
    deleteNote,
    addChapter,
    renameChapter,
    updateChapterContent,
    deleteChapter,
    exportMarkdown,
    exportLatex,
    exportDocx,
    exportPdf,
  };
}

/** Übersicht extras — Aufgaben/Meilensteine/Aktivität, loaded together since they render on one tab. */
export function useProjectBoard(projectId: string | null) {
  const [tasks, setTasks] = useState<TaskDto[]>([]);
  const [milestones, setMilestones] = useState<MilestoneDto[]>([]);
  const [activity, setActivity] = useState<ActivityEntryDto[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    const [t, m, a] = await Promise.all([
      academiaApi.listTasks(projectId),
      academiaApi.listMilestones(projectId),
      academiaApi.listActivity(projectId),
    ]);
    setTasks(t);
    setMilestones(m);
    setActivity(a);
    setLoading(false);
  }, [projectId]);

  useEffect(() => { reload(); }, [reload]);

  const addTask = async (title: string, dueDate: string | null) => {
    if (!projectId) return;
    await academiaApi.createTask(projectId, title, dueDate);
    await reload();
  };

  const completeTask = async (taskId: string) => {
    await academiaApi.completeTask(taskId);
    await reload();
  };

  const deleteTask = async (taskId: string) => {
    await academiaApi.deleteTask(taskId);
    await reload();
  };

  const addMilestone = async (title: string, targetDate: string) => {
    if (!projectId) return;
    await academiaApi.createMilestone(projectId, title, targetDate);
    await reload();
  };

  const deleteMilestone = async (milestoneId: string) => {
    await academiaApi.deleteMilestone(milestoneId);
    await reload();
  };

  return { tasks, milestones, activity, loading, reload, addTask, completeTask, deleteTask, addMilestone, deleteMilestone };
}

/** Gliederung — outline tree + per-node Argumentationslinie, with a real (source-count-based) Lücken-Check. */
export function useOutline(projectId: string | null) {
  const [nodes, setNodes] = useState<OutlineNodeDto[]>([]);
  const [points, setPoints] = useState<ArgumentPointDto[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    const [n, p] = await Promise.all([academiaApi.listOutline(projectId), academiaApi.listArgumentPoints(projectId)]);
    setNodes(n);
    setPoints(p);
    setLoading(false);
  }, [projectId]);

  useEffect(() => { reload(); }, [reload]);

  const addNode = async (parentId: string | null, title: string) => {
    if (!projectId) return;
    await academiaApi.createOutlineNode(projectId, parentId, title);
    await reload();
  };

  const addArgument = async (nodeId: string, text: string) => {
    await academiaApi.createArgumentPoint(nodeId, text);
    await reload();
  };

  const linkSource = async (argumentId: string, sourceId: string) => {
    await academiaApi.linkArgumentSource(argumentId, sourceId);
    await reload();
  };

  const unlinkSource = async (argumentId: string, sourceId: string) => {
    await academiaApi.unlinkArgumentSource(argumentId, sourceId);
    await reload();
  };

  const deleteNode = async (nodeId: string) => {
    await academiaApi.deleteOutlineNode(nodeId);
    await reload();
  };

  return { nodes, points, loading, reload, addNode, addArgument, linkSource, unlinkSource, deleteNode };
}

/** Thesen — claim + pro/con points. */
export function useTheses(projectId: string | null) {
  const [theses, setTheses] = useState<ThesisDto[]>([]);
  const [points, setPoints] = useState<ThesisPointDto[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    const [t, p] = await Promise.all([academiaApi.listTheses(projectId), academiaApi.listThesisPoints(projectId)]);
    setTheses(t);
    setPoints(p);
    setLoading(false);
  }, [projectId]);

  useEffect(() => { reload(); }, [reload]);

  const addThesis = async (claim: string, summary: string, position: string) => {
    if (!projectId) return;
    await academiaApi.createThesis(projectId, claim, summary, position);
    await reload();
  };

  const addPoint = async (thesisId: string, side: 'pro' | 'con', text: string, sourceId: string | null) => {
    await academiaApi.addThesisPoint(thesisId, side, text, sourceId);
    await reload();
  };

  const deleteThesis = async (thesisId: string) => {
    await academiaApi.deleteThesis(thesisId);
    await reload();
  };

  return { theses, points, loading, reload, addThesis, addPoint, deleteThesis };
}

/** Zitate — quote clusters tied to sources. */
export function useQuotes(projectId: string | null) {
  const [quotes, setQuotes] = useState<QuoteDto[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    setQuotes(await academiaApi.listQuotes(projectId));
    setLoading(false);
  }, [projectId]);

  useEffect(() => { reload(); }, [reload]);

  const addQuote = async (sourceId: string, text: string, cluster: string, tag: string) => {
    if (!projectId) return;
    await academiaApi.createQuote(projectId, sourceId, text, cluster, tag);
    await reload();
  };

  const deleteQuote = async (quoteId: string) => {
    await academiaApi.deleteQuote(quoteId);
    await reload();
  };

  return { quotes, loading, reload, addQuote, deleteQuote };
}
