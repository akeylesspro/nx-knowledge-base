import fs from "node:fs/promises";
import path from "node:path";
import { defaultRepoConfig, isCodeFile, readArg, readJson, reposRoot, toPosix, walkFiles, writeJson } from "./shared.mjs";

const endpointRegex = /\b(?:app|router)\.(get|post|put|patch|delete|options|head)\s*\(\s*["'`]([^"'`]+)["'`]/gi;

const findEndpoints = async (sourceRoot) => {
    const srcPath = path.join(sourceRoot, "src");
    const files = (await walkFiles(srcPath)).filter((filePath) => isCodeFile(filePath));
    const endpoints = [];

    for (const filePath of files) {
        const content = await fs.readFile(filePath, "utf8");
        endpointRegex.lastIndex = 0;
        let match = endpointRegex.exec(content);
        while (match) {
            endpoints.push({
                method: match[1].toLowerCase(),
                path: match[2].startsWith("/") ? match[2] : `/${match[2]}`,
                operation_id: `${match[1]}_${toPosix(path.relative(srcPath, filePath)).replace(/[^\w]/g, "_")}`,
            });
            match = endpointRegex.exec(content);
        }
    }

    return endpoints;
};

const parsePayload = async () => {
    const payloadPath = readArg("--payload");
    if (!payloadPath) {
        return undefined;
    }
    return readJson(path.resolve(process.cwd(), payloadPath));
};

const generateForRepo = async (repoName, payload) => {
    const config = defaultRepoConfig(repoName);
    const sourceRoot = process.env.SOURCE_REPO_PATH || config.source_root;
    const endpoints = await findEndpoints(sourceRoot);
    const paths = {};

    for (const endpoint of endpoints) {
        paths[endpoint.path] = paths[endpoint.path] || {};
        paths[endpoint.path][endpoint.method] = {
            operationId: endpoint.operation_id,
            responses: {
                "200": {
                    description: "Successful response",
                },
            },
        };
    }

    const document = {
        openapi: "3.1.0",
        info: {
            title: `${repoName} API`,
            version: payload?.commit_sha || "latest",
        },
        paths,
    };

    await writeJson(path.join(reposRoot, repoName, "openapi", "openapi.json"), document);
    console.log(`[kb] generated openapi for ${repoName} with ${endpoints.length} endpoints`);
};

const main = async () => {
    const payload = await parsePayload();
    const repoName = readArg("--repo") || payload?.repo_name;
    if (!repoName) {
        await generateForRepo("client_commons");
        await generateForRepo("server_commons");
        return;
    }
    await generateForRepo(repoName, payload);
};

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
