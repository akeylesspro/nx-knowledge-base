import fs from "node:fs/promises";
import path from "node:path";
import { reposRoot, walkFiles } from "./shared.mjs";

const blockedPatterns = [
    /AKIA[0-9A-Z]{16}/,
    /-----BEGIN (RSA|OPENSSH|EC) PRIVATE KEY-----/,
    /AIza[0-9A-Za-z-_]{35}/,
    /(?:token|secret|password|api[-_]?key)\s*[:=]\s*["'][^"']{8,}["']/i,
];

const main = async () => {
    const files = (await walkFiles(reposRoot)).filter((filePath) => filePath.endsWith(".json"));
    const issues = [];
    for (const filePath of files) {
        const raw = await fs.readFile(filePath, "utf8");
        for (const pattern of blockedPatterns) {
            if (pattern.test(raw)) {
                issues.push(`${path.relative(process.cwd(), filePath)} matched ${pattern}`);
            }
        }
    }

    if (issues.length) {
        console.error("[kb] security scan failed");
        issues.forEach((issue) => console.error(` - ${issue}`));
        process.exit(1);
    }

    console.log("[kb] security scan passed");
};

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
