export const baseUrl = () => {
    const url = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8004";
    try {
        new URL(url);
        return url;
    } catch {
        throw new Error("Invalid base URL format.");
    }
};

export const isBrowser = (): boolean => typeof window !== "undefined";

export const QAmode = process.env.NEXT_PUBLIC_MODE === "qa";

export const is_local = process.env.NEXT_PUBLIC_IS_LOCAL === "true";


export function mergeArraysToSet<T>(...arrays: T[][]): T[] {
    return [...new Set(arrays.flat())];
}

String.prototype.toCapitalCase = function (): string {
    return this.charAt(0).toUpperCase() + this.slice(1).toLowerCase();
};

