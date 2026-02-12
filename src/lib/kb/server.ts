import fs from "node:fs/promises";
import path from "node:path";
import type { KnowledgeBaseSchema } from "@/docs/schema";

const reposRoot = path.join(process.cwd(), "repos");
const searchIndexPath = path.join(process.cwd(), "public", "search-index.json");

type SearchIndex = {
    generated_at_iso: string;
    entries: Array<{
        kind: "file" | "symbol";
        repo: string;
        id: string;
        title: string;
        path: string;
        summary: string;
        keywords: string[];
    }>;
};

export type RepoDocPreview = {
    doc_path: string;
    source_file_path: string;
    file_name: string;
    purpose: string;
    problem_solved: string;
    exports_count: number;
    symbols_count: number;
    language: string;
    framework_tags: string[];
    nx_path: string;
};

const fileExists = async (targetPath: string) => {
    try {
        await fs.access(targetPath);
        return true;
    } catch {
        return false;
    }
};

const walkJsonFiles = async (targetDir: string): Promise<string[]> => {
    const entries = await fs.readdir(targetDir, { withFileTypes: true });
    const files: string[] = [];
    for (const entry of entries) {
        const fullPath = path.join(targetDir, entry.name);
        if (entry.isDirectory()) {
            files.push(...(await walkJsonFiles(fullPath)));
            continue;
        }
        if (entry.name.endsWith(".json")) {
            files.push(fullPath);
        }
    }
    return files;
};

const safeReadJson = async <T>(targetPath: string): Promise<T | undefined> => {
    try {
        const raw = await fs.readFile(targetPath, "utf8");
        return JSON.parse(raw) as T;
    } catch {
        return undefined;
    }
};

export const listRepos = async () => {
    const entries = await fs.readdir(reposRoot, { withFileTypes: true });
    const repos = entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);
    return repos.sort();
};

export const listRepoFiles = async (repo: string) => {
    const docsRoot = path.join(reposRoot, repo, "materialized");
    const fallbackDocsRoot = path.join(reposRoot, repo, "docs");
    const selectedRoot = (await fileExists(docsRoot)) ? docsRoot : fallbackDocsRoot;

    if (!(await fileExists(selectedRoot))) {
        return [];
    }

    const files = await walkJsonFiles(selectedRoot);
    return files.map((filePath) => path.relative(selectedRoot, filePath).split(path.sep).join("/"));
};

export const listRepoDocPreviews = async (repo: string, limit?: number): Promise<RepoDocPreview[]> => {
    const docsRoot = path.join(reposRoot, repo, "materialized");
    const fallbackDocsRoot = path.join(reposRoot, repo, "docs");
    const selectedRoot = (await fileExists(docsRoot)) ? docsRoot : fallbackDocsRoot;

    if (!(await fileExists(selectedRoot))) {
        return [];
    }

    const files = await walkJsonFiles(selectedRoot);
    const previews: RepoDocPreview[] = [];

    for (const filePath of files) {
        const doc = await safeReadJson<KnowledgeBaseSchema>(filePath);
        if (!doc) {
            continue;
        }

        previews.push({
            doc_path: path.relative(selectedRoot, filePath).split(path.sep).join("/"),
            source_file_path: doc.source?.file_path || doc.file_name,
            file_name: doc.file_name || "unknown",
            purpose: doc.summary?.purpose || "",
            problem_solved: doc.summary?.problem_solved || "",
            exports_count: doc.exports?.length || 0,
            symbols_count: doc.symbols?.length || 0,
            language: doc.source?.language || "unknown",
            framework_tags: doc.source?.framework_tags || [],
            nx_path: doc.source?.link_to_nx_kb || "",
        });
    }

    previews.sort((a, b) => a.source_file_path.localeCompare(b.source_file_path));
    if (!limit || limit <= 0) {
        return previews;
    }
    return previews.slice(0, limit);
};

export const readRepoFileDoc = async (repo: string, filePathSegments: string[]) => {
    const rawRelativePath = filePathSegments.join("/");
    const normalizedRelativePath = rawRelativePath.endsWith(".json")
        ? rawRelativePath
        : `${rawRelativePath.replace(/\.[^.]+$/, "")}.json`;
    const materializedPath = path.join(reposRoot, repo, "materialized", normalizedRelativePath);
    const generatedPath = path.join(reposRoot, repo, "docs", normalizedRelativePath);
    const selectedPath = (await fileExists(materializedPath)) ? materializedPath : generatedPath;
    return safeReadJson<KnowledgeBaseSchema>(selectedPath);
};

export const readRepoOpenApi = async (repo: string) => {
    const targetPath = path.join(reposRoot, repo, "openapi", "openapi.json");
    return safeReadJson<Record<string, unknown>>(targetPath);
};

export const findRepoSymbol = async (repo: string, symbolId: string) => {
    const docsRoot = path.join(reposRoot, repo, "materialized");
    const fallbackDocsRoot = path.join(reposRoot, repo, "docs");
    const selectedRoot = (await fileExists(docsRoot)) ? docsRoot : fallbackDocsRoot;
    if (!(await fileExists(selectedRoot))) {
        return undefined;
    }

    const files = await walkJsonFiles(selectedRoot);
    for (const filePath of files) {
        const doc = await safeReadJson<KnowledgeBaseSchema>(filePath);
        if (!doc) {
            continue;
        }
        const symbol = doc.symbols.find((entry) => entry.symbol_id === symbolId);
        if (!symbol) {
            continue;
        }
        return {
            doc,
            symbol,
        };
    }

    return undefined;
};

export const readSearchIndex = async (): Promise<SearchIndex> => {
    const fallback: SearchIndex = {
        generated_at_iso: new Date(0).toISOString(),
        entries: [],
    };
    return (await safeReadJson<SearchIndex>(searchIndexPath)) || fallback;
};
