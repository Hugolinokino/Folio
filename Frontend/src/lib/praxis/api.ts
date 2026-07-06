import { invoke } from '@tauri-apps/api/core';

export interface CaseSummaryDto {
  id: string;
  title: string;
  ref: string;
  phase: string;
  gebiet: string | null;
  color: string | null;
}

export interface CaseDetailDto {
  id: string;
  title: string;
  ref: string;
  phase: string;
  streitwert: string | null;
  gebiet: string | null;
  rate: number;
  budget: number | null;
  kurz: string | null;
  verfahren: string | null;
  gericht: string | null;
  nr: string | null;
  color: string | null;
  rolleKlient: string | null;
}

export interface ParteiDto {
  id: string;
  rolle: string;
  name: string;
  detail: string | null;
  vertreter: string | null;
  isKlient: boolean;
}

export interface DeadlineDto {
  id: string;
  caseId: string;
  title: string;
  dueDate: string;
  type: string | null;
  note: string | null;
  completed: boolean;
}

export interface DeadlineWithCaseDto extends DeadlineDto {
  caseTitle: string;
  caseRef: string;
}

export interface DocumentDto {
  id: string;
  caseId: string;
  nr: string;
  title: string;
  sender: string | null;
  docType: string | null;
  pages: number | null;
  filePath: string;
  content: string | null;
  folder: string | null;
  docDate: string | null;
  clusterId: number | null;
}

export interface DocumentEmbeddingDto {
  id: string;
  embedding: number[] | null;
}

export interface ChronoEventDto {
  id: string;
  caseId: string;
  eventDate: string;
  ereignis: string;
  beleg: string | null;
}

export interface CorrespondenceDto {
  id: string;
  caseId: string;
  corrDate: string;
  richtung: string;
  von: string | null;
  betreff: string | null;
  typ: string | null;
}

export interface BillingEntryDto {
  id: string;
  caseId: string;
  entryDate: string;
  taetigkeit: string;
  minutes: number;
}

export interface DraftDto {
  id: string;
  caseId: string;
  titel: string;
  typ: string | null;
  status: string | null;
  content: string;
  updatedAt: string | null;
}

export const praxisApi = {
  listCases: () => invoke<CaseSummaryDto[]>('list_cases'),
  getCase: (caseId: string) => invoke<CaseDetailDto>('get_case', { caseId }),
  createCase: (title: string, gebiet: string) => invoke<CaseDetailDto>('create_case', { title, gebiet }),

  listCaseParties: (caseId: string) => invoke<ParteiDto[]>('list_case_parties', { caseId }),
  createCaseParty: (caseId: string, rolle: string, name: string, detail: string, vertreter: string, isKlient: boolean) =>
    invoke<ParteiDto>('create_case_party', { caseId, rolle, name, detail, vertreter, isKlient }),

  listDeadlines: (caseId: string) => invoke<DeadlineDto[]>('list_deadlines', { caseId }),
  listAllDeadlines: () => invoke<DeadlineWithCaseDto[]>('list_all_deadlines'),
  createDeadline: (caseId: string, title: string, dueDate: string, type: string, note: string) =>
    invoke<DeadlineDto>('create_deadline', { caseId, title, dueDate, type, note }),
  completeDeadline: (deadlineId: string) => invoke<void>('complete_deadline', { deadlineId }),

  listDocuments: (caseId: string) => invoke<DocumentDto[]>('list_documents', { caseId }),
  readBinaryFile: (path: string) => invoke<number[]>('read_binary_file', { path }),
  importDocument: (
    caseId: string,
    sourcePath: string,
    nr: string,
    title: string,
    sender: string,
    docType: string,
    folder: string,
    content: string,
    pages: number | null,
    docDate: string,
  ) => invoke<DocumentDto>('import_document', { caseId, sourcePath, nr, title, sender, docType, folder, content, pages, docDate }),
  updateDocumentEmbedding: (documentId: string, embedding: number[]) =>
    invoke<void>('update_document_embedding', { documentId, embedding }),
  listDocumentEmbeddings: (caseId: string) => invoke<DocumentEmbeddingDto[]>('list_document_embeddings', { caseId }),
  assignDocumentClusters: (assignments: { documentId: string; clusterId: number }[]) =>
    invoke<void>('assign_document_clusters', { assignments }),

  listChrono: (caseId: string) => invoke<ChronoEventDto[]>('list_chrono', { caseId }),
  createChronoEvent: (caseId: string, eventDate: string, ereignis: string, beleg: string) =>
    invoke<ChronoEventDto>('create_chrono_event', { caseId, eventDate, ereignis, beleg }),

  listCorrespondence: (caseId: string) => invoke<CorrespondenceDto[]>('list_correspondence', { caseId }),
  createCorrespondence: (caseId: string, corrDate: string, richtung: string, von: string, betreff: string, typ: string) =>
    invoke<CorrespondenceDto>('create_correspondence', { caseId, corrDate, richtung, von, betreff, typ }),

  listBillingEntries: (caseId: string) => invoke<BillingEntryDto[]>('list_billing_entries', { caseId }),
  createBillingEntry: (caseId: string, entryDate: string, taetigkeit: string, minutes: number) =>
    invoke<BillingEntryDto>('create_billing_entry', { caseId, entryDate, taetigkeit, minutes }),

  listDrafts: (caseId: string) => invoke<DraftDto[]>('list_drafts', { caseId }),
  createDraft: (caseId: string, titel: string, typ: string) => invoke<DraftDto>('create_draft', { caseId, titel, typ }),
  updateDraftContent: (draftId: string, content: string) => invoke<void>('update_draft_content', { draftId, content }),
};
