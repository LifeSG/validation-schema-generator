export const ERROR_MESSAGES = {
	COMMON: {
		REQUIRED_OPTION: "An option is required",
		INVALID_OPTION: "Value does not match options",
	},
	CONTACT: {
		INVALID_SINGAPORE_NUMBER: "Invalid Singapore number",
		INVALID_INTERNATIONAL_NUMBER: "Invalid international number",
	},
	DATE: {
		MUST_BE_FUTURE: "Date must be in the future.",
		MUST_BE_PAST: "Date must be in the past.",
		CANNOT_BE_FUTURE: "Date cannot be in the future.",
		CANNOT_BE_PAST: "Date cannot be in the past.",
		MIN_DATE: (date: string) => `Date cannot be earlier than ${date}`,
		MAX_DATE: (date: string) => `Date cannot be later than ${date}`,
		INVALID: "Invalid date",
	},
	TIME: {
		INVALID: "Invalid time",
	},
	EMAIL: {
		INVALID: "Invalid email address",
	},
	UNIT_NUMBER: {
		INVALID: "Invalid unit number",
	},
	UNSPECIFIED_FIELD: (id: string) => `this field has unspecified keys: ${id}`, // match Yup.noUnknown() error
};
