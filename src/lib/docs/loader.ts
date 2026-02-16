/* =========================================================
   NX-KNOWLEDGE-BASE — Docs Loader
   Server-side utilities for reading docs from the filesystem
   ========================================================= */

import fs from "fs/promises";
import path from "path";
import type { KnowledgeBaseSchema } from "@/types/schema";
import type { RepoMeta, RepoWithFiles, FileTreeNode } from "./types";

/** Base path for repos folder (relative to project root) */
const REPOS_BASE = path.join(process.cwd(), "repos");

/* ---------------------------------------------------------
   Repo-level operations
   --------------------------------------------------------- */

/** Get all repo names (folder names under repos/) */
export const getRepoNames = async (): Promise<string[]> => {
    try {
        const entries = await fs.readdir(REPOS_BASE, { withFileTypes: true });
        return entries
            .filter((e) => e.isDirectory() && !e.name.startsWith("_") && !e.name.startsWith("."))
            .map((e) => e.name);
    } catch {
        return [];
    }
};

/** Read meta.json for a specific repo */
export const getRepoMeta = async (repoName: string): Promise<RepoMeta | null> => {
    try {
        const metaPath = path.join(REPOS_BASE, repoName, "meta.json");
        const raw = await fs.readFile(metaPath, "utf-8");
        return JSON.parse(raw) as RepoMeta;
    } catch {
        return null;
    }
};

/** Get all repos with their metadata */
export const getAllRepos = async (): Promise<RepoMeta[]> => {
    const names = await getRepoNames();
    const metas = await Promise.all(names.map(getRepoMeta));
    return metas.filter((m): m is RepoMeta => m !== null);
};

/** Get a repo with its file list */
export const getRepoWithFiles = async (repoName: string): Promise<RepoWithFiles | null> => {
    const meta = await getRepoMeta(repoName);
    if (!meta) return null;

    const docFiles = await getDocFilePaths(repoName);
    return { meta, docFiles };
};

/* ---------------------------------------------------------
   Document-level operations
   --------------------------------------------------------- */

/** Get a single file doc by repo and path */
export const getFileDoc = async (repoName: string, filePath: string): Promise<KnowledgeBaseSchema | null> => {
    try {
        const docPath = resolveDocPath(repoName, filePath);
        const raw = await fs.readFile(docPath, "utf-8");
        return JSON.parse(raw) as KnowledgeBaseSchema;
    } catch {
        return null;
    }
};

/** Get all file docs for a repo */
export const getAllFileDocs = async (repoName: string): Promise<KnowledgeBaseSchema[]> => {
    const filePaths = await getDocFilePaths(repoName);
    const docs = await Promise.all(
        filePaths.map(async (fp) => {
            try {
                const fullPath = path.join(REPOS_BASE, repoName, "docs", fp);
                const raw = await fs.readFile(fullPath, "utf-8");
                return JSON.parse(raw) as KnowledgeBaseSchema;
            } catch {
                return null;
            }
        })
    );
    return docs.filter((d): d is KnowledgeBaseSchema => d !== null);
};

/** List all JSON doc file paths (relative to docs/) for a repo */
export const getDocFilePaths = async (repoName: string): Promise<string[]> => {
    const docsDir = path.join(REPOS_BASE, repoName, "docs");
    try {
        return await walkDir(docsDir, docsDir);
    } catch {
        return [];
    }
};

/* ---------------------------------------------------------
   File tree for navigation
   --------------------------------------------------------- */

/** Build a tree structure from doc file paths */
export const buildFileTree = (filePaths: string[]): FileTreeNode[] => {
    const root: FileTreeNode[] = [];

    for (const fp of filePaths) {
        const parts = fp.split("/").filter(Boolean);
        let current = root;

        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            const isFile = i === parts.length - 1;
            const pathSoFar = parts.slice(0, i + 1).join("/");

            let existing = current.find((n) => n.name === part);

            if (!existing) {
                existing = {
                    name: part,
                    path: pathSoFar,
                    type: isFile ? "file" : "folder",
                    children: isFile ? undefined : [],
                };
                current.push(existing);
            }

            if (!isFile && existing.children) {
                current = existing.children;
            }
        }
    }

    return sortTree(root);
};

/** Find a tree node by path. Returns root folder (with children) for empty path. */
export const getTreeNodeAtPath = (root: FileTreeNode[], targetPath: string): FileTreeNode | null => {
    if (!targetPath) {
        return {
            name: "/",
            path: "",
            type: "folder",
            children: root,
        };
    }

    const findNode = (nodes: FileTreeNode[]): FileTreeNode | null => {
        for (const node of nodes) {
            if (node.path === targetPath) return node;
            if (node.children) {
                const found = findNode(node.children);
                if (found) return found;
            }
        }
        return null;
    };

    return findNode(root);
};

/** Sort tree: folders first, then alphabetically */
const sortTree = (nodes: FileTreeNode[]): FileTreeNode[] => {
    return nodes
        .sort((a, b) => {
            if (a.type !== b.type) return a.type === "folder" ? -1 : 1;
            return a.name.localeCompare(b.name);
        })
        .map((node) => ({
            ...node,
            children: node.children ? sortTree(node.children) : undefined,
        }));
};

/* ---------------------------------------------------------
   Override handling
   --------------------------------------------------------- */

/** Get override data for a file (if exists) */
export const getOverride = async (repoName: string, filePath: string): Promise<Partial<KnowledgeBaseSchema> | null> => {
    try {
        const overridePath = path.join(REPOS_BASE, repoName, "overrides", filePath);
        const raw = await fs.readFile(overridePath, "utf-8");
        return JSON.parse(raw);
    } catch {
        return null;
    }
};

/** Merge base doc with override (override fields win) */
export const mergeWithOverride = (base: KnowledgeBaseSchema, override: Partial<KnowledgeBaseSchema>): KnowledgeBaseSchema => {
    return deepMerge(base as unknown as Record<string, unknown>, override as unknown as Record<string, unknown>) as unknown as KnowledgeBaseSchema;
};

/* ---------------------------------------------------------
   Helpers
   --------------------------------------------------------- */

/** Resolve a file path to the actual JSON doc path on disk */
const resolveDocPath = (repoName: string, filePath: string): string => {
    const normalized = filePath.endsWith(".json") ? filePath : `${filePath}.json`;
    return path.join(REPOS_BASE, repoName, "docs", normalized);
};

/** Recursively walk a directory and return relative file paths */
const walkDir = async (dir: string, base: string): Promise<string[]> => {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const files: string[] = [];

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            const subFiles = await walkDir(fullPath, base);
            files.push(...subFiles);
        } else if (entry.name.endsWith(".json") && !entry.name.startsWith(".")) {
            files.push(path.relative(base, fullPath).replace(/\\/g, "/"));
        }
    }

    return files;
};

/** Deep merge two objects (target overrides source) */
const deepMerge = (source: Record<string, unknown>, target: Record<string, unknown>): Record<string, unknown> => {
    const result = { ...source };

    for (const key of Object.keys(target)) {
        const sourceVal = source[key];
        const targetVal = target[key];

        if (targetVal && typeof targetVal === "object" && !Array.isArray(targetVal) && sourceVal && typeof sourceVal === "object" && !Array.isArray(sourceVal)) {
            result[key] = deepMerge(sourceVal as Record<string, unknown>, targetVal as Record<string, unknown>);
        } else {
            result[key] = targetVal;
        }
    }

    return result;
};
