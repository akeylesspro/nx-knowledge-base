import path from "node:path";
import {
    fileExists,
    overridePath,
    readJson,
    repoMaterializedPath,
    reposRoot,
    walkFiles,
    writeJson,
} from "./shared.mjs";

const deepMerge = (baseValue, patchValue) => {
    if (patchValue === null) {
        return null;
    }

    if (Array.isArray(baseValue) || Array.isArray(patchValue)) {
        return patchValue;
    }

    if (typeof baseValue !== "object" || baseValue === null) {
        return patchValue;
    }

    if (typeof patchValue !== "object" || patchValue === null) {
        return patchValue;
    }

    const merged = { ...baseValue };
    for (const [key, value] of Object.entries(patchValue)) {
        if (!(key in baseValue)) {
            merged[key] = value;
            continue;
        }
        merged[key] = deepMerge(baseValue[key], value);
    }
    return merged;
};

const applyForRepo = async (repoName) => {
    const docsRoot = path.join(reposRoot, repoName, "docs");
    const docFiles = await walkFiles(docsRoot);
    const orphanOverrides = [];

    for (const docFile of docFiles) {
        if (!docFile.endsWith(".json")) {
            continue;
        }

        const sourceDoc = await readJson(docFile);
        const srcRelativePath = sourceDoc?.source?.file_path || `${path.relative(docsRoot, docFile).replace(/\.json$/, "")}.ts`;
        const overrideFilePath = overridePath(repoName, srcRelativePath);
        let materialized = sourceDoc;

        if (await fileExists(overrideFilePath)) {
            const overridePatch = await readJson(overrideFilePath);
            materialized = deepMerge(sourceDoc, overridePatch);
            materialized.quality = materialized.quality || {};
            materialized.quality.last_reviewed_by = materialized.quality.last_reviewed_by || "manual-override";
        }

        const materializedPath = repoMaterializedPath(repoName, srcRelativePath);
        await writeJson(materializedPath, materialized);
    }

    const overridesRoot = path.join(process.cwd(), "overrides", repoName);
    const overrideFiles = (await fileExists(overridesRoot)) ? await walkFiles(overridesRoot) : [];
    for (const overrideFile of overrideFiles) {
        if (!overrideFile.endsWith(".json")) {
            continue;
        }
        const relativeOverride = path.relative(overridesRoot, overrideFile).replace(/\.json$/, "");
        const generatedDocPath = path.join(reposRoot, repoName, "docs", `${relativeOverride}.json`);
        if (!(await fileExists(generatedDocPath))) {
            orphanOverrides.push(relativeOverride);
        }
    }

    await writeJson(path.join(reposRoot, repoName, "meta", "orphan-overrides.json"), {
        repo_name: repoName,
        orphan_overrides: orphanOverrides,
        checked_at_iso: new Date().toISOString(),
    });

    console.log(`[kb] applied overrides for ${repoName}`);
};

const main = async () => {
    const repoNameArg = process.argv.includes("--repo") ? process.argv[process.argv.indexOf("--repo") + 1] : undefined;
    if (repoNameArg) {
        await applyForRepo(repoNameArg);
        return;
    }

    for (const repoName of ["client_commons", "server_commons"]) {
        await applyForRepo(repoName);
    }
};

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
