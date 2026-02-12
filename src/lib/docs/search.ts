/* =========================================================
   NX-KNOWLEDGE-BASE — Search Utility
   Server-side full-text search across documentation
   ========================================================= */

import type { KnowledgeBaseSchema } from "@/types/schema";
import type { SearchResult, SearchOptions, SearchSymbolKind } from "./types";
import { getAllRepos, getAllFileDocs } from "./loader";

const KIND_PREFIXES: Record<string, SearchSymbolKind> = {
    function: "function",
    func: "function",
    class: "class",
    component: "component",
    comp: "component",
    interface: "interface",
    type: "type",
    enum: "enum",
};

/** Parse "component:Button" or "function:getName" — returns { query, kind } */
export const parseSearchQuery = (rawQuery: string): { query: string; kind?: SearchSymbolKind } => {
    const trimmed = rawQuery.trim();
    const match = trimmed.match(/^(function|func|class|component|comp|interface|type|enum):\s*(.+)$/i);
    if (match) {
        const prefixKey = match[1].toLowerCase();
        const parsedKind = KIND_PREFIXES[prefixKey];
        const rest = match[2].trim();
        if (parsedKind && rest.length >= 2) {
            return { query: rest, kind: parsedKind };
        }
    }
    return { query: trimmed, kind: undefined };
};

/** Search across all documentation */
export const searchDocs = async (options: SearchOptions): Promise<{ results: SearchResult[]; total: number }> => {
    const { query: rawQuery, repo, limit = 20, offset = 0, kind: explicitKind } = options;

    const { query, kind: parsedKind } = parseSearchQuery(rawQuery);
    const kind = explicitKind ?? parsedKind;

    if (!query || query.trim().length < 2) {
        return { results: [], total: 0 };
    }

    const queryLower = query.toLowerCase().trim();
    const queryTerms = queryLower.split(/\s+/);

    const repos = repo ? [repo] : (await getAllRepos()).map((r) => r.name);

    const allResults: SearchResult[] = [];

    for (const repoName of repos) {
        const docs = await getAllFileDocs(repoName);
        for (const doc of docs) {
            const fileResults = searchInDoc(doc, repoName, queryTerms);
            allResults.push(...fileResults);
        }
    }

    // Filter by kind when specified (only symbol/export with matching kind)
    const filtered = kind
        ? allResults.filter((r) => r.symbolKind === kind)
        : allResults;

    // Sort by score descending
    filtered.sort((a, b) => b.score - a.score);

    const total = filtered.length;
    const paged = filtered.slice(offset, offset + limit);

    return { results: paged, total };
};

/** Search within a single document */
const searchInDoc = (doc: KnowledgeBaseSchema, repoName: string, queryTerms: string[]): SearchResult[] => {
    const results: SearchResult[] = [];
    const filePath = doc.source.file_path;
    const fileName = doc.file_name;
    const baseLink = `/repos/${repoName}/docs/${filePath}`;

    // Search in file name and path (so "svg.tsx" or "assets/svg" find the file)
    const fileSearchText = `${fileName} ${filePath}`;
    const fileScore = scoreMatch(fileSearchText, queryTerms);
    if (fileScore > 0) {
        results.push({
            repo: repoName,
            filePath,
            fileName,
            matchType: "file",
            matchField: `file:${fileName}`,
            matchText: doc.summary.purpose || `File: ${fileName}`,
            score: fileScore + 2, // Boost file matches so exact name matches rank high
            link: baseLink,
        });
    }

    // Search in summary
    const summaryScore = scoreMatch(`${doc.summary.purpose} ${doc.summary.problem_solved}`, queryTerms);
    if (summaryScore > 0) {
        results.push({
            repo: repoName,
            filePath,
            fileName,
            matchType: "summary",
            matchField: "summary",
            matchText: doc.summary.purpose,
            score: summaryScore,
            link: baseLink,
        });
    }

    // Search in symbols (support both description_one_line and description)
    for (const symbol of doc.symbols) {
        const desc = symbol.description_one_line ?? (symbol as { description?: string }).description ?? "";
        const symbolText = `${symbol.name} ${desc} ${symbol.details?.what_it_does ?? ""}`;
        const symbolScore = scoreMatch(symbolText, queryTerms);
        const symKind = toSearchSymbolKind(symbol.kind);

        if (symbolScore > 0) {
            results.push({
                repo: repoName,
                filePath,
                fileName,
                matchType: "symbol",
                matchField: `symbol:${symbol.name}`,
                matchText: desc,
                score: symbolScore + 1, // Boost symbol matches
                link: `${baseLink}#${symbol.symbol_id}`,
                symbolKind: symKind,
            });
        }
    }

    // Search in exports (support both description_one_line and description)
    for (const exp of doc.exports) {
        const expDesc = exp.description_one_line ?? (exp as { description?: string }).description ?? "";
        const exportScore = scoreMatch(`${exp.name} ${expDesc}`, queryTerms);
        const expKind = exp.kind ? toSearchSymbolKind(exp.kind) : doc.symbols.find((s) => s.name === exp.name) ? toSearchSymbolKind(doc.symbols.find((s) => s.name === exp.name)!.kind) : undefined;
        if (exportScore > 0) {
            const symbolId = exp.symbol_id ?? (doc.symbols.find((s) => s.name === exp.name)?.symbol_id ?? null);
            const link = symbolId ? `${baseLink}#${symbolId}` : baseLink;
            results.push({
                repo: repoName,
                filePath,
                fileName,
                matchType: "export",
                matchField: `export:${exp.name}`,
                matchText: expDesc,
                score: exportScore,
                link,
                symbolKind: expKind,
            });
        }
    }

    // Search in dependencies (support why_used, description, import_path, name)
    for (const dep of [...doc.dependencies.external, ...doc.dependencies.internal]) {
        const d = dep as { import_path?: string; name?: string; why_used?: string; description?: string };
        const depName = d.import_path ?? d.name ?? "";
        const depDesc = d.why_used ?? d.description ?? "";
        const depScore = scoreMatch(`${depName} ${depDesc}`, queryTerms);
        if (depScore > 0) {
            results.push({
                repo: repoName,
                filePath,
                fileName,
                matchType: "dependency",
                matchField: `dep:${depName}`,
                matchText: depDesc,
                score: depScore,
                link: baseLink,
            });
        }
    }

    return results;
};

/** Score how well a text matches query terms (0 = no match) */
const scoreMatch = (text: string, queryTerms: string[]): number => {
    const textLower = text.toLowerCase();
    let score = 0;

    for (const term of queryTerms) {
        if (textLower.includes(term)) {
            score += 1;

            // Boost exact word matches
            const wordBoundary = new RegExp(`\\b${escapeRegex(term)}\\b`, "i");
            if (wordBoundary.test(text)) {
                score += 0.5;
            }
        }
    }

    return score;
};

/** Escape special regex characters */
const escapeRegex = (str: string): string => {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const FILTERABLE_KINDS: SearchSymbolKind[] = ["function", "class", "component", "interface", "type", "enum"];
const toSearchSymbolKind = (kind: string): SearchSymbolKind | undefined => {
    const k = kind.toLowerCase();
    return FILTERABLE_KINDS.includes(k as SearchSymbolKind) ? (k as SearchSymbolKind) : undefined;
};
