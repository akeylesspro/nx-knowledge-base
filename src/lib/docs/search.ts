/* =========================================================
   NX-KNOWLEDGE-BASE — Search Utility
   Server-side full-text search across documentation
   ========================================================= */

import type { KnowledgeBaseSchema } from "@/types/schema";
import type { SearchResult, SearchOptions } from "./types";
import { getAllRepos, getAllFileDocs } from "./loader";

/** Search across all documentation */
export const searchDocs = async (options: SearchOptions): Promise<{ results: SearchResult[]; total: number }> => {
    const { query, repo, limit = 20, offset = 0 } = options;

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

    // Sort by score descending
    allResults.sort((a, b) => b.score - a.score);

    const total = allResults.length;
    const paged = allResults.slice(offset, offset + limit);

    return { results: paged, total };
};

/** Search within a single document */
const searchInDoc = (doc: KnowledgeBaseSchema, repoName: string, queryTerms: string[]): SearchResult[] => {
    const results: SearchResult[] = [];
    const filePath = doc.source.file_path;
    const fileName = doc.file_name;
    const baseLink = `/repos/${repoName}/docs/${filePath}`;

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

    // Search in symbols
    for (const symbol of doc.symbols) {
        const symbolText = `${symbol.name} ${symbol.description_one_line} ${symbol.details.what_it_does}`;
        const symbolScore = scoreMatch(symbolText, queryTerms);

        if (symbolScore > 0) {
            results.push({
                repo: repoName,
                filePath,
                fileName,
                matchType: "symbol",
                matchField: `symbol:${symbol.name}`,
                matchText: symbol.description_one_line,
                score: symbolScore + 1, // Boost symbol matches
                link: `${baseLink}#${symbol.symbol_id}`,
            });
        }
    }

    // Search in exports
    for (const exp of doc.exports) {
        const exportScore = scoreMatch(`${exp.name} ${exp.description_one_line}`, queryTerms);
        if (exportScore > 0) {
            results.push({
                repo: repoName,
                filePath,
                fileName,
                matchType: "export",
                matchField: `export:${exp.name}`,
                matchText: exp.description_one_line,
                score: exportScore,
                link: `${baseLink}#${exp.symbol_id}`,
            });
        }
    }

    // Search in dependencies
    for (const dep of [...doc.dependencies.external, ...doc.dependencies.internal]) {
        const depName = "import_path" in dep ? dep.import_path : dep.name;
        const depScore = scoreMatch(`${depName} ${dep.why_used}`, queryTerms);
        if (depScore > 0) {
            results.push({
                repo: repoName,
                filePath,
                fileName,
                matchType: "dependency",
                matchField: `dep:${depName}`,
                matchText: dep.why_used,
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
