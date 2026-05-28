export type DocumentStatus = "uploaded" | "processing" | "ready" | "failed";

export interface DocumentRead {
  id: string;
  filename: string;
  content_type: string;
  size_bytes: number;
  status: DocumentStatus;
  chunk_count: number;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export interface DocumentList {
  items: DocumentRead[];
  total: number;
}

export interface Citation {
  document_id: string;
  document_name: string;
  chunk_index: number;
  text: string;
  score: number;
}

export interface ChatResponse {
  answer: string;
  citations: Citation[];
  source_documents: string[];
  confidence: number;
  used_mock: boolean;
}

export interface HealthResponse {
  status: "ok";
  app: string;
  env: string;
  version: string;
  mock_ai: boolean;
}

export interface ResetResponse {
  deleted_documents: number;
  deleted_chunks: number;
}
