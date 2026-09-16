// caps the string length tested against a config-supplied regex to bound worst-case backtracking cost (ReDoS mitigation)
export const MAX_MATCHES_INPUT_LENGTH = 1000;

// default cap on base64 payload length when no maxSizeInKb validation rule is configured (~100MB decoded)
export const DEFAULT_MAX_BASE64_LENGTH = 100 * 1024 * 1024;

// caps recursion depth over nested schema config (children / option.children) to prevent stack exhaustion
export const MAX_SCHEMA_NESTING_DEPTH = 50;
