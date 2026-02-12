import fs from "node:fs/promises";
import path from "node:path";
import {
    defaultRepoConfig,
    inferLanguage,
    isCodeFile,
    kbRoot,
    knownRepos,
    readArg,
    readJson,
    repoDocPath,
    reposRoot,
    shaSafe,
    toPosix,
    walkFiles,
    writeJson,
} from "./shared.mjs";

const parseImports = (content) => {
    const importRegex = /import[\s\S]*?from\s+["']([^"']+)["']/g;
    const imports = [];
    let match = importRegex.exec(content);
    while (match) {
        imports.push(match[1]);
        match = importRegex.exec(content);
    }
    return imports;
};

const parseExportsAndSymbols = (content) => {
    const lines = content.split("\n");
    const symbols = [];

    for (let index = 0; index < lines.length; index += 1) {
        const line = lines[index];
        const match =
            line.match(/export\s+(?:async\s+)?function\s+([A-Za-z0-9_]+)/) ||
            line.match(/export\s+const\s+([A-Za-z0-9_]+)/) ||
            line.match(/export\s+class\s+([A-Za-z0-9_]+)/) ||
            line.match(/export\s+interface\s+([A-Za-z0-9_]+)/) ||
            line.match(/export\s+type\s+([A-Za-z0-9_]+)/) ||
            line.match(/export\s+enum\s+([A-Za-z0-9_]+)/);

        if (!match) {
            continue;
        }

        const name = match[1];
        const kind = line.includes("function")
            ? "function"
            : line.includes("class")
              ? "class"
              : line.includes("interface")
                ? "interface"
                : line.includes("type")
                  ? "type"
                  : line.includes("enum")
                    ? "enum"
                    : "constant";

        symbols.push({
            symbol_id: name,
            name,
            kind,
            description_one_line: `${name} export in this file.`,
            details: {
                what_it_does: `${name} is exported from this module and participates in the module's contract.`,
            },
            examples: {
                minimal_correct: {
                    title: "Minimal usage",
                    code: `import { ${name} } from "module-path";`,
                },
                incorrect: {
                    title: "Incorrect usage",
                    code: `import { Missing${name} } from "module-path";`,
                    why_incorrect: "The symbol name does not match the module export.",
                },
            },
            locations: {
                source_line_start: index + 1,
                source_line_end: index + 1,
                github_permalink: "",
                nx_kb_anchor: `#${name}`,
            },
        });
    }

    const exports = symbols.map((symbol) => ({
        name: symbol.name,
        kind: symbol.kind,
        description_one_line: symbol.description_one_line,
        symbol_id: symbol.symbol_id,
    }));

    return { exports, symbols };
};

const resolveInternalPath = (sourceFile, importPath) => {
    if (!importPath.startsWith(".")) {
        return "";
    }
    const raw = path.resolve(path.dirname(sourceFile), importPath);
    return toPosix(raw);
};

const buildDocForFile = async ({ repoName, sourceRoot, sourceFile, commitSha, githubUrl, defaultBranch }) => {
    const raw = await fs.readFile(sourceFile, "utf8");
    const srcRelativePath = toPosix(path.relative(sourceRoot, sourceFile));
    const imports = parseImports(raw);
    const { exports, symbols } = parseExportsAndSymbols(raw);

    const internal = imports
        .filter((item) => item.startsWith("."))
        .map((importPath) => {
            const resolved = resolveInternalPath(sourceFile, importPath);
            const relativeResolved = toPosix(path.relative(sourceRoot, resolved));
            return {
                import_path: importPath,
                resolved_file_path: relativeResolved,
                why_used: "Imported from a local module to compose this file.",
                link_to_nx_kb: `/repos/${repoName}/files/${relativeResolved}`,
                link_to_github: `${githubUrl}/blob/${commitSha}/${relativeResolved}`,
            };
        });

    const external = imports
        .filter((item) => !item.startsWith("."))
        .map((name) => ({
            name,
            kind: "runtime",
            why_used: "Imported package used by this module.",
        }));

    const nxPath = `/repos/${repoName}/files/${srcRelativePath}`;
    const githubPath = `${githubUrl}/blob/${shaSafe(commitSha)}/${srcRelativePath}`;

    for (const symbol of symbols) {
        symbol.locations.github_permalink = `${githubPath}#L${symbol.locations.source_line_start}`;
    }

    return {
        srcRelativePath,
        doc: {
            schema_version: "v1.0.0",
            doc_id: `${repoName}:${srcRelativePath}`,
            repo: {
                name: repoName,
                source_default_branch: defaultBranch,
            },
            file_name: path.basename(sourceFile),
            source: {
                file_path: srcRelativePath,
                commit_sha: shaSafe(commitSha),
                generated_at_iso: new Date().toISOString(),
                language: inferLanguage(sourceFile),
                framework_tags: ["node", "typescript"],
                link_to_github: githubPath,
                link_to_nx_kb: nxPath,
            },
            summary: {
                purpose: `Documentation for ${srcRelativePath}.`,
                problem_solved: "Describes how this file contributes to its repository module architecture.",
            },
            dependencies: {
                external,
                internal,
            },
            exports,
            symbols,
            quality: {
                generation_confidence: "medium",
                known_gaps: ["Descriptions are generated heuristically and should be reviewed in PR."],
            },
        },
    };
};

const parsePayload = async () => {
    const payloadPath = readArg("--payload");
    if (!payloadPath) {
        return undefined;
    }
    return readJson(path.resolve(kbRoot, payloadPath));
};

const collectFiles = async (sourceRoot, payload) => {
    if (payload?.changed_files?.length) {
        const selected = payload.changed_files
            .filter((filePath) => filePath.startsWith("src/"))
            .map((filePath) => path.join(sourceRoot, filePath))
            .filter((filePath) => isCodeFile(filePath));
        return selected;
    }

    const allFiles = await walkFiles(path.join(sourceRoot, "src"));
    return allFiles.filter((filePath) => isCodeFile(filePath));
};

const ensureRepoScaffold = async (repoName) => {
    await fs.mkdir(path.join(reposRoot, repoName, "docs"), { recursive: true });
    await fs.mkdir(path.join(reposRoot, repoName, "meta"), { recursive: true });
    await fs.mkdir(path.join(reposRoot, repoName, "openapi"), { recursive: true });
    await fs.mkdir(path.join(reposRoot, repoName, "materialized"), { recursive: true });
};

const generateForRepo = async (repoName, payload) => {
    const config = defaultRepoConfig(repoName);
    const sourceRoot = process.env.SOURCE_REPO_PATH || config.source_root;
    const commitSha = payload?.commit_sha || process.env.SOURCE_COMMIT_SHA || "unknown";
    const defaultBranch = payload?.branch || process.env.SOURCE_DEFAULT_BRANCH || config.default_branch;
    const githubUrl = process.env.SOURCE_REPO_GITHUB_URL || config.github_url;

    if (!sourceRoot) {
        throw new Error(`Missing source root for repo: ${repoName}`);
    }

    await ensureRepoScaffold(repoName);
    const sourceFiles = await collectFiles(sourceRoot, payload);
    let generatedCount = 0;

    for (const sourceFile of sourceFiles) {
        try {
            const { srcRelativePath, doc } = await buildDocForFile({
                repoName,
                sourceRoot,
                sourceFile,
                commitSha,
                githubUrl,
                defaultBranch,
            });
            await writeJson(repoDocPath(repoName, srcRelativePath), doc);
            generatedCount += 1;
        } catch (error) {
            console.warn(`skip file ${sourceFile}: ${error.message}`);
        }
    }

    const manifest = {
        repo_name: repoName,
        generated_at_iso: new Date().toISOString(),
        source_commit_sha: shaSafe(commitSha),
        source_branch: defaultBranch,
        docs_root: `repos/${repoName}/docs`,
        generated_files_count: generatedCount,
        generator_version: "v1.0.0",
    };

    await writeJson(path.join(reposRoot, repoName, "meta", "manifest.json"), manifest);
    console.log(`[kb] generated ${generatedCount} docs for ${repoName}`);
};

const main = async () => {
    const payload = await parsePayload();
    const repoFromArg = readArg("--repo");
    const repoName = repoFromArg || payload?.repo_name;

    if (repoName) {
        await generateForRepo(repoName, payload);
        return;
    }

    const repos = Object.keys(knownRepos);
    for (const repo of repos) {
        await generateForRepo(repo, payload);
    }
};

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
