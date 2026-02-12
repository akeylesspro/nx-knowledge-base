import path from "node:path";
import { fileExists, readJson, reposRoot, walkFiles } from "./shared.mjs";

const typeChecks = {
    string: (value) => typeof value === "string",
    number: (value) => typeof value === "number" && Number.isFinite(value),
    object: (value) => typeof value === "object" && value !== null && !Array.isArray(value),
    array: (value) => Array.isArray(value),
    boolean: (value) => typeof value === "boolean",
};

const validateBySchema = (schema, value, trace, errors) => {
    if (!schema) {
        return;
    }

    if (schema.type) {
        const checker = typeChecks[schema.type];
        if (checker && !checker(value)) {
            errors.push(`${trace}: expected ${schema.type}`);
            return;
        }
    }

    if (schema.enum && !schema.enum.includes(value)) {
        errors.push(`${trace}: expected one of ${schema.enum.join(", ")}`);
    }

    if (schema.type === "string") {
        if (schema.minLength && value.length < schema.minLength) {
            errors.push(`${trace}: expected minLength ${schema.minLength}`);
        }
        if (schema.pattern) {
            const expression = new RegExp(schema.pattern);
            if (!expression.test(value)) {
                errors.push(`${trace}: pattern mismatch ${schema.pattern}`);
            }
        }
    }

    if (schema.type === "object") {
        for (const requiredKey of schema.required || []) {
            if (!(requiredKey in value)) {
                errors.push(`${trace}: missing required key ${requiredKey}`);
            }
        }
        const properties = schema.properties || {};
        for (const [propKey, propSchema] of Object.entries(properties)) {
            if (!(propKey in value)) {
                continue;
            }
            validateBySchema(propSchema, value[propKey], `${trace}.${propKey}`, errors);
        }
    }

    if (schema.type === "array") {
        if (!schema.items) {
            return;
        }
        value.forEach((entry, index) => {
            validateBySchema(schema.items, entry, `${trace}[${index}]`, errors);
        });
    }
};

const readSchema = async (name) => {
    const targetPath = path.join(process.cwd(), "schemas", name);
    return readJson(targetPath);
};

const validateRepoDocs = async (repoName, schema, errors) => {
    const roots = [
        path.join(reposRoot, repoName, "docs"),
        path.join(reposRoot, repoName, "materialized"),
    ];

    for (const rootPath of roots) {
        if (!(await fileExists(rootPath))) {
            continue;
        }
        const files = (await walkFiles(rootPath)).filter((filePath) => filePath.endsWith(".json"));
        for (const filePath of files) {
            const value = await readJson(filePath);
            validateBySchema(schema, value, filePath, errors);

            const internalDeps = value?.dependencies?.internal || [];
            for (const dep of internalDeps) {
                if (!dep.link_to_nx_kb?.startsWith("/")) {
                    errors.push(`${filePath}: invalid internal link_to_nx_kb`);
                }
                if (!dep.link_to_github) {
                    errors.push(`${filePath}: missing internal link_to_github`);
                }
            }
        }
    }
};

const validateOpenApi = async (repoName, schema, errors) => {
    const openApiPath = path.join(reposRoot, repoName, "openapi", "openapi.json");
    if (!(await fileExists(openApiPath))) {
        errors.push(`${openApiPath}: missing openapi.json`);
        return;
    }
    const value = await readJson(openApiPath);
    validateBySchema(schema, value, openApiPath, errors);
};

const validateMirrorConsistency = async (repoName, errors) => {
    const sourceRoot = process.env.SOURCE_REPOS_ROOT
        ? path.join(process.env.SOURCE_REPOS_ROOT, repoName)
        : path.resolve(process.cwd(), repoName === "client_commons" ? "../../commons/client_commons" : "../../commons/server_commons");
    const srcRoot = path.join(sourceRoot, "src");
    if (!(await fileExists(srcRoot))) {
        return;
    }

    const sourceFiles = (await walkFiles(srcRoot)).filter((filePath) => /\.(ts|tsx|js|jsx|vue)$/.test(filePath));
    const missingDocs = [];
    for (const sourceFile of sourceFiles) {
        const relativePath = path.relative(sourceRoot, sourceFile).split(path.sep).join("/");
        const expectedDocPath = path.join(reposRoot, repoName, "docs", relativePath.replace(/\.[^.]+$/, ".json"));
        if (!(await fileExists(expectedDocPath))) {
            missingDocs.push(relativePath);
        }
    }
    if (missingDocs.length) {
        errors.push(`${repoName}: missing ${missingDocs.length} mirrored docs files`);
    }
};

const main = async () => {
    const fileDocSchema = await readSchema("file-doc.schema.json");
    const openApiSchema = await readSchema("openapi.schema.json");
    const errors = [];

    for (const repoName of ["client_commons", "server_commons"]) {
        await validateRepoDocs(repoName, fileDocSchema, errors);
        await validateOpenApi(repoName, openApiSchema, errors);
        await validateMirrorConsistency(repoName, errors);
    }

    if (errors.length) {
        console.error("[kb] validation failed");
        errors.slice(0, 200).forEach((error) => console.error(` - ${error}`));
        process.exit(1);
    }

    console.log("[kb] validation passed");
};

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
