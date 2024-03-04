import capitalize from "lodash/capitalize";
import { FileHelper } from "../utils";

export const ERROR_MESSAGES = {
	COMMON: {
		REQUIRED_OPTION: "An option is required",
		REQUIRED_OPTIONS: "Both options are required",
		INVALID_OPTION: "Value does not match options",
	},
	CONTACT: {
		INVALID_SINGAPORE_NUMBER: "Invalid Singapore number",
		INVALID_INTERNATIONAL_NUMBER: "Invalid international number",
	},
	DATE: {
		MUST_BE_FUTURE: "Date must be in the future",
		MUST_BE_PAST: "Date must be in the past",
		CANNOT_BE_FUTURE: "Date cannot be in the future",
		CANNOT_BE_PAST: "Date cannot be in the past",
		MIN_DATE: (date: string) => `Date cannot be earlier than ${date}`,
		MAX_DATE: (date: string) => `Date cannot be later than ${date}`,
		INVALID: "Invalid date",
		DISABLED_DATES: "Date is not allowed",
	},
	DATE_RANGE: {
		MUST_BE_FUTURE: "Dates must be in the future.",
		MUST_BE_PAST: "Dates must be in the past.",
		CANNOT_BE_FUTURE: "Dates cannot be in the future.",
		CANNOT_BE_PAST: "Dates cannot be in the past.",
		MIN_DATE: (date: string) => `Dates cannot be earlier than ${date}`,
		MAX_DATE: (date: string) => `Dates cannot be later than ${date}`,
		DISABLED_DATES: "Date range should not include disabled dates.",
		INVALID: "Invalid dates",
		REQUIRED: "Both dates are required",
		MUST_HAVE_NUMBER_OF_DAYS: (numberOfDays: number) => `Selection should have ${numberOfDays} days`,
	},
	TIME: {
		INVALID: "Invalid time",
	},
	EMAIL: {
		INVALID: "Invalid email address",
	},
	GENERIC: {
		INVALID: "Invalid input",
		UNSUPPORTED: "This component is not supported by the engine",
	},
	SLIDER: {
		MUST_BE_INCREMENTAL: "Input must be incremental",
	},
	UNIT_NUMBER: {
		INVALID: "Invalid unit number",
	},
	UNSPECIFIED_FIELD: (id: string) => `this field has unspecified keys: ${id}`, // match Yup.noUnknown() error
	UPLOAD: (unit = "file", unitPlural = `${unit}s`) => ({
		DIMENSIONS: (width: number, height: number) => `Upload failed. ${unit} needs to be within ${width}x${height}.`,
		FILE_TYPE: (fileTypes: string[]) =>
			`Upload failed. Only ${FileHelper.extensionsToSentence(fileTypes)} ${
				fileTypes.length !== 1 ? "files are" : "file is"
			} accepted.`,
		MAX_FILES: (max: number) =>
			`Upload failed. You can only upload maximum of ${max} ${max !== 1 ? unitPlural : unit}.`,
		MAX_FILE_SIZE: (maxSize: number) =>
			`Upload failed. ${capitalize(unit)} exceeds the maximum size of ${maxSize} KB.`,
		// GENERIC: "Upload failed. Please try again.",
		REQUIRED: `Upload at least 1 ${unit}`,
		INVALID: "Invalid submission",
	}),
};
