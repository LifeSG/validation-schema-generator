import { IDaysRangeRule } from "../schema-generator";
export declare const ERROR_MESSAGES: {
    COMMON: {
        REQUIRED_OPTION: string;
        REQUIRED_OPTIONS: string;
        INVALID_OPTION: string;
    };
    CONTACT: {
        INVALID_SINGAPORE_NUMBER: string;
        INVALID_INTERNATIONAL_NUMBER: string;
    };
    DATE: {
        MUST_BE_FUTURE: string;
        MUST_BE_PAST: string;
        CANNOT_BE_FUTURE: string;
        CANNOT_BE_PAST: string;
        MIN_DATE: (date: string) => string;
        MAX_DATE: (date: string) => string;
        INVALID: string;
        DISABLED_DATES: string;
        WITHIN_DAYS: (withinDays: IDaysRangeRule) => string;
        BEYOND_DAYS: (beyondDays: IDaysRangeRule) => string;
    };
    DATE_RANGE: {
        MUST_BE_FUTURE: string;
        MUST_BE_PAST: string;
        CANNOT_BE_FUTURE: string;
        CANNOT_BE_PAST: string;
        MIN_DATE: (date: string) => string;
        MAX_DATE: (date: string) => string;
        DISABLED_DATES: string;
        INVALID: string;
        REQUIRED: string;
        MUST_HAVE_NUMBER_OF_DAYS: (numberOfDays: number) => string;
    };
    TIME: {
        INVALID: string;
    };
    EMAIL: {
        INVALID: string;
    };
    GENERIC: {
        INVALID: string;
        UNSUPPORTED: string;
    };
    SLIDER: {
        MUST_BE_INCREMENTAL: string;
    };
    UNIT_NUMBER: {
        INVALID: string;
    };
    UNSPECIFIED_FIELD: (id: string) => string;
    UPLOAD: (unit?: string, unitPlural?: string) => {
        DIMENSIONS: (width: number, height: number) => string;
        FILE_TYPE: (fileTypes: string[]) => string;
        MAX_FILES: (max: number) => string;
        MAX_FILE_SIZE: (maxSize: number) => string;
        REQUIRED: string;
        INVALID: string;
    };
    ARRAY_FIELD: {
        INVALID: string;
        REQUIRED: string;
    };
};
