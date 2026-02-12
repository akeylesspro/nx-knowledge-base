import path from "node:path";
import { fileExists, readJson, reposRoot, walkFiles, writeJson } from "./shared.mjs";

const collectDocs = async (repoName) => {
    const materializedRoot = path.join(reposRoot, repoName, "materialized");
    const docsRoot = path.join(reposRoot, repoName, "docs");
    const useRoot = (await fileExists(materializedRoot)) ? materializedRoot : docsRoot;
    const files = await walkFiles(useRoot);
    const jsonFiles = files.filter((filePath) => filePath.endsWith(".json"));
    const docs = [];

    for (const filePath of jsonFiles) {
        try {
            docs.push(await readJson(filePath));
        } catch {
            continue;
        }
    }

    return docs;
};

const main = async () => {
    const index = {
        generated_at_iso: new Date().toISOString(),
        entries: [],
    };

    for (const repoName of ["client_commons", "server_commons"]) {
        const docs = await collectDocs(repoName);
        for (const doc of docs) {
            index.entries.push({
                kind: "file",
                repo: repoName,
                id: doc.doc_id,
                title: doc.file_name,
                path: doc.source?.link_to_nx_kb || "",
                summary: doc.summary?.purpose || "",
                keywords: [doc.source?.language || "", ...(doc.source?.framework_tags || [])].filter(Boolean),
            });

            for (const symbol of doc.symbols || []) {
                index.entries.push({
                    kind: "symbol",
                    repo: repoName,
                    id: symbol.symbol_id,
                    title: symbol.name,
                    path: `/repos/${repoName}/symbols/${symbol.symbol_id}`,
                    summary: symbol.description_one_line || "",
                    keywords: [symbol.kind || "", doc.file_name || ""].filter(Boolean),
                });
            }
        }
    }

    await writeJson(path.join(process.cwd(), "public", "search-index.json"), index);
    console.log(`[kb] built search index with ${index.entries.length} entries`);
};

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
