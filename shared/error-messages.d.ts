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
    };
    TIME: {
        INVALID: string;
    };
    EMAIL: {
        INVALID: string;
    };
    UNSPECIFIED_FIELD: (id: string) => string;
};
