export { jsonToSchema } from "./json-to-schema";
export * from "./types";
export declare const addRule: (type: "string" | "number" | "boolean" | "object" | "array" | "mixed", name: string, fn: (value: unknown, arg: unknown, context: import("yup").TestContext<{}>) => boolean) => void;
