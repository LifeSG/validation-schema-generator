export declare const ERROR_MESSAGES: {
    COMMON: {
        REQUIRED_OPTION: string;
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
    };
    TIME: {
        INVALID: string;
    };
    EMAIL: {
        INVALID: string;
    };
    UNIT_NUMBER: {
        INVALID: string;
    };
    UNSPECIFIED_FIELD: (id: string) => string;
    UPLOAD: (unit?: string, unitPlural?: string) => {
        DIMENSIONS: (width: number, height: number) => string;
        FILE_TYPE: (fileType: string) => string;
        MAX_FILES: (max: number) => string;
        MAX_FILE_SIZE: (maxSize: number) => string;
        REQUIRED: string;
    };
};
