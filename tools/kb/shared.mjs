import fs from "node:fs/promises";
import path from "node:path";

export const kbRoot = process.cwd();
export const reposRoot = path.join(kbRoot, "repos");
export const overridesRoot = path.join(kbRoot, "overrides");

export const knownRepos = {
    client_commons: {
        source_root: path.resolve(kbRoot, "../../commons/client_commons"),
        github_url: "https://github.com/akeylesspro/akeyless-client-commons",
        default_branch: "main",
    },
    server_commons: {
        source_root: path.resolve(kbRoot, "../../commons/server_commons"),
        github_url: "https://github.com/akeylesspro/akeyless-server-commons",
        default_branch: "main",
    },
};

export const codeExtensions = new Set([".ts", ".tsx", ".js", ".jsx", ".vue"]);

export const toPosix = (input) => input.split(path.sep).join("/");

export const ensureDir = async (dirPath) => {
    await fs.mkdir(dirPath, { recursive: true });
};

export const readJson = async (filePath) => {
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw);
};

export const writeJson = async (filePath, payload) => {
    await ensureDir(path.dirname(filePath));
    await fs.writeFile(filePath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
};

export const fileExists = async (filePath) => {
    try {
        await fs.access(filePath);
        return true;
    } catch {
        return false;
    }
};

export const walkFiles = async (targetDir) => {
    const entries = await fs.readdir(targetDir, { withFileTypes: true });
    const files = [];
    for (const entry of entries) {
        const entryPath = path.join(targetDir, entry.name);
        if (entry.isDirectory()) {
            files.push(...(await walkFiles(entryPath)));
            continue;
        }
        files.push(entryPath);
    }
    return files;
};

export const isCodeFile = (filePath) => codeExtensions.has(path.extname(filePath).toLowerCase());

export const inferLanguage = (filePath) => {
    const ext = path.extname(filePath).toLowerCase();
    if (ext === ".ts") return "ts";
    if (ext === ".tsx") return "tsx";
    if (ext === ".js") return "js";
    if (ext === ".jsx") return "jsx";
    if (ext === ".vue") return "vue";
    return "unknown";
};

export const readArg = (flag) => {
    const index = process.argv.indexOf(flag);
    if (index < 0) {
        return undefined;
    }
    return process.argv[index + 1];
};

export const shaSafe = (input) => (input && input.length >= 7 ? input : "unknown");

export const repoDocPath = (repoName, srcRelativePath) => {
    const noExt = srcRelativePath.replace(/\.[^.]+$/, "");
    return path.join(reposRoot, repoName, "docs", `${noExt}.json`);
};

export const repoMaterializedPath = (repoName, srcRelativePath) => {
    const noExt = srcRelativePath.replace(/\.[^.]+$/, "");
    return path.join(reposRoot, repoName, "materialized", `${noExt}.json`);
};

export const overridePath = (repoName, srcRelativePath) => {
    const noExt = srcRelativePath.replace(/\.[^.]+$/, "");
    return path.join(overridesRoot, repoName, `${noExt}.json`);
};

export const defaultRepoConfig = (repoName) => {
    const config = knownRepos[repoName];
    if (!config) {
        return {
            source_root: "",
            github_url: "",
            default_branch: "main",
        };
    }
    return config;
};
