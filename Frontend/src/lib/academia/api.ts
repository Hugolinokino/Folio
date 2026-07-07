import { invoke } from '@tauri-apps/api/core';

export interface ProjectDto {
  id: string;
  title: string;
  type: string;
  advisor: string | null;
  dueDate: string | null;
  progress: number;
  color: string;
}

export interface SourceDto {
  id: string;
  projectId: string;
  type: string;
  citationKey: string;
  title: string;
  author: string | null;
  year: number | null;
  annotation: string | null;
  filePath: string | null;
  content: string | null;
  edition: string | null;
  place: string | null;
}

export interface NoteSummaryDto {
  id: string;
  projectId: string;
  title: string;
  tags: string | null;
  updatedAt: string | null;
}

export interface NoteDetailDto {
  id: string;
  projectId: string;
  title: string;
  content: string;
  tags: string | null;
  updatedAt: string | null;
}

export interface NoteRefDto {
  id: string;
  title: string;
}

export interface ChapterDto {
  id: string;
  projectId: string;
  title: string;
  status: string | null;
  content: string;
  updatedAt: string | null;
}

export interface TaskDto {
  id: string;
  projectId: string;
  title: string;
  done: boolean;
  dueDate: string | null;
}

export interface MilestoneDto {
  id: string;
  projectId: string;
  title: string;
  targetDate: string;
}

export interface ActivityEntryDto {
  id: string;
  projectId: string;
  message: string;
  createdAt: string | null;
}

export interface OutlineNodeDto {
  id: string;
  projectId: string;
  parentId: string | null;
  title: string;
  sortOrder: number;
}

export interface ArgumentPointDto {
  id: string;
  nodeId: string;
  text: string;
  sortOrder: number;
  sourceIds: string[];
}

export interface ThesisDto {
  id: string;
  projectId: string;
  claim: string;
  summary: string | null;
  position: string | null;
  sortOrder: number;
}

export interface ThesisPointDto {
  id: string;
  thesisId: string;
  side: 'pro' | 'con';
  text: string;
  sourceId: string | null;
  sortOrder: number;
}

export interface QuoteDto {
  id: string;
  projectId: string;
  sourceId: string;
  text: string;
  cluster: string | null;
  tag: string | null;
}

export interface BibliographySection {
  label: string;
  entries: string[];
}

export const academiaApi = {
  listProjects: () => invoke<ProjectDto[]>('list_projects'),
  getProject: (projectId: string) => invoke<ProjectDto>('get_project', { projectId }),
  createProject: (title: string, type: string, advisor: string) =>
    invoke<ProjectDto>('create_project', { title, type, advisor }),
  renameProject: (projectId: string, title: string) => invoke<void>('rename_project', { projectId, title }),
  deleteProject: (projectId: string) => invoke<void>('delete_project', { projectId }),

  listSources: (projectId: string) => invoke<SourceDto[]>('list_sources', { projectId }),
  createSource: (
    projectId: string,
    type: string,
    citationKey: string,
    title: string,
    author: string,
    year: number | null,
    annotation: string,
    edition: string,
    place: string,
  ) => invoke<SourceDto>('create_source', { projectId, type, citationKey, title, author, year, annotation, edition, place }),
  readBinaryFile: (path: string) => invoke<number[]>('read_binary_file', { path }),
  importSource: (
    projectId: string,
    sourcePath: string,
    type: string,
    citationKey: string,
    title: string,
    author: string,
    year: number | null,
    annotation: string,
    content: string,
  ) =>
    invoke<SourceDto>('import_source', {
      projectId, sourcePath, type, citationKey, title, author, year, annotation, content, edition: '', place: '',
    }),
  deleteSource: (sourceId: string) => invoke<void>('delete_source', { sourceId }),

  listNotes: (projectId: string) => invoke<NoteSummaryDto[]>('list_notes', { projectId }),
  getNote: (noteId: string) => invoke<NoteDetailDto>('get_note', { noteId }),
  createNote: (projectId: string, title: string) => invoke<NoteDetailDto>('create_note', { projectId, title }),
  updateNote: (noteId: string, content: string, tags: string) =>
    invoke<void>('update_note', { noteId, content, tags }),
  deleteNote: (noteId: string) => invoke<void>('delete_note', { noteId }),
  listBacklinks: (noteId: string) => invoke<NoteRefDto[]>('list_backlinks', { noteId }),

  listChapters: (projectId: string) => invoke<ChapterDto[]>('list_chapters', { projectId }),
  createChapter: (projectId: string, title: string) => invoke<ChapterDto>('create_chapter', { projectId, title }),
  updateChapterContent: (chapterId: string, content: string) =>
    invoke<void>('update_chapter_content', { chapterId, content }),
  deleteChapter: (chapterId: string) => invoke<void>('delete_chapter', { chapterId }),

  listTasks: (projectId: string) => invoke<TaskDto[]>('list_tasks', { projectId }),
  createTask: (projectId: string, title: string, dueDate: string | null) =>
    invoke<TaskDto>('create_task', { projectId, title, dueDate }),
  completeTask: (taskId: string) => invoke<void>('complete_task', { taskId }),
  deleteTask: (taskId: string) => invoke<void>('delete_task', { taskId }),

  listMilestones: (projectId: string) => invoke<MilestoneDto[]>('list_milestones', { projectId }),
  createMilestone: (projectId: string, title: string, targetDate: string) =>
    invoke<MilestoneDto>('create_milestone', { projectId, title, targetDate }),

  listActivity: (projectId: string) => invoke<ActivityEntryDto[]>('list_activity', { projectId }),

  listOutline: (projectId: string) => invoke<OutlineNodeDto[]>('list_outline', { projectId }),
  createOutlineNode: (projectId: string, parentId: string | null, title: string) =>
    invoke<OutlineNodeDto>('create_outline_node', { projectId, parentId, title }),
  deleteOutlineNode: (nodeId: string) => invoke<void>('delete_outline_node', { nodeId }),
  listArgumentPoints: (projectId: string) => invoke<ArgumentPointDto[]>('list_argument_points', { projectId }),
  createArgumentPoint: (nodeId: string, text: string) =>
    invoke<ArgumentPointDto>('create_argument_point', { nodeId, text }),
  linkArgumentSource: (argumentId: string, sourceId: string) =>
    invoke<void>('link_argument_source', { argumentId, sourceId }),
  unlinkArgumentSource: (argumentId: string, sourceId: string) =>
    invoke<void>('unlink_argument_source', { argumentId, sourceId }),

  listTheses: (projectId: string) => invoke<ThesisDto[]>('list_theses', { projectId }),
  createThesis: (projectId: string, claim: string, summary: string, position: string) =>
    invoke<ThesisDto>('create_thesis', { projectId, claim, summary, position }),
  deleteThesis: (thesisId: string) => invoke<void>('delete_thesis', { thesisId }),
  listThesisPoints: (projectId: string) => invoke<ThesisPointDto[]>('list_thesis_points', { projectId }),
  addThesisPoint: (thesisId: string, side: 'pro' | 'con', text: string, sourceId: string | null) =>
    invoke<ThesisPointDto>('add_thesis_point', { thesisId, side, text, sourceId }),

  listQuotes: (projectId: string) => invoke<QuoteDto[]>('list_quotes', { projectId }),
  createQuote: (projectId: string, sourceId: string, text: string, cluster: string, tag: string) =>
    invoke<QuoteDto>('create_quote', { projectId, sourceId, text, cluster, tag }),
  deleteQuote: (quoteId: string) => invoke<void>('delete_quote', { quoteId }),

  exportChaptersMarkdown: (projectId: string) => invoke<string>('export_chapters_markdown', { projectId }),
  exportChaptersDocx: (projectId: string, path: string, bibliography: BibliographySection[]) =>
    invoke<void>('export_chapters_docx', { projectId, path, bibliography }),
};
