import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

const main = async () => {
    const payloadPathArgIndex = process.argv.indexOf("--payload");
    const payloadPath = payloadPathArgIndex >= 0 ? process.argv[payloadPathArgIndex + 1] : undefined;
    if (!payloadPath) {
        throw new Error("Missing --payload path");
    }

    const signature = process.env.DISPATCH_SIGNATURE;
    const secret = process.env.DISPATCH_SECRET;
    if (!signature || !secret) {
        throw new Error("Missing DISPATCH_SIGNATURE or DISPATCH_SECRET env vars");
    }

    const payloadRaw = await fs.readFile(path.resolve(process.cwd(), payloadPath), "utf8");
    const digest = crypto.createHmac("sha256", secret).update(payloadRaw).digest("hex");

    if (digest !== signature) {
        throw new Error("Invalid dispatch payload signature");
    }

    console.log("[kb] dispatch signature verified");
};

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
