/* =========================================================
   NX-KNOWLEDGE-BASE — Docs Lib Types
   ========================================================= */

import type { KnowledgeBaseSchema } from "@/types/schema";

/** Repo-level metadata stored in repos/<name>/meta.json */
export interface RepoMeta {
    name: string;
    display_name: string;
    description: string;
    github_url: string;
    default_branch: string;
    language: string;
    framework_tags: string[];
    last_synced_at: string;
    last_synced_commit: string;
    file_count: number;
    symbol_count: number;
}

/** A repo with its metadata + list of doc file paths */
export interface RepoWithFiles {
    meta: RepoMeta;
    docFiles: string[];
}

/** Flat tree node for sidebar navigation */
export interface FileTreeNode {
    name: string;
    path: string;
    type: "file" | "folder";
    children?: FileTreeNode[];
}

/** Search result */
export interface SearchResult {
    repo: string;
    filePath: string;
    fileName: string;
    matchType: "summary" | "symbol" | "export" | "dependency";
    matchField: string;
    matchText: string;
    score: number;
    link: string;
}

/** Search query options */
export interface SearchOptions {
    query: string;
    repo?: string;
    limit?: number;
    offset?: number;
}

/** Sync webhook payload (from GitHub Actions) */
export interface SyncPayload {
    repo: string;
    branch: string;
    commit_sha: string;
    timestamp: string;
    files: SyncFileChange[];
}

export interface SyncFileChange {
    path: string;
    action: "added" | "modified" | "deleted";
    diff?: string;
    content?: string;
}

/** API response wrappers */
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    timestamp: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    total: number;
    limit: number;
    offset: number;
}

/** Re-export the schema for convenience */
export type { KnowledgeBaseSchema } from "@/types/schema";
