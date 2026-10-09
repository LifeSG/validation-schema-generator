// caps the string length tested against a config-supplied regex; bounds polynomial backtracking only, not exponential (regex patterns must be trusted)
export const MAX_MATCHES_INPUT_LENGTH = 1000;

// default cap on base64 payload length when no maxSizeInKb validation rule is configured (~100MB decoded)
export const DEFAULT_MAX_BASE64_LENGTH = 100 * 1024 * 1024;

// caps recursion depth over nested schema config (children / option.children) to prevent stack exhaustion
export const MAX_SCHEMA_NESTING_DEPTH = 50;

// hard cap on raw object nesting of sections/overrides, checked iteratively before any recursive processing
export const MAX_CONFIG_OBJECT_DEPTH = 100;
