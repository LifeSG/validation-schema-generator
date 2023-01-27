import { TFieldSchema, TFields } from "../schema-generator";
import { text } from "./text";
import { TFieldsConfig } from "./types";

/**
 * parse JSON schema by running each field through its respective field config generator
 *
 * each field config generator will return the formatted yup schema and validation config
 *
 * a field config generator may come up with multiple fields and change the validation config (e.g. chips with textarea)
 */
export const generateFieldConfigs = (fields: TFields) => {
	let config: TFieldsConfig<TFieldSchema> = {};
	Object.entries(fields).forEach(([id, field]) => {
		const { fieldType } = field;
		switch (fieldType) {
			case "text":
				config = { ...config, ...text(id, field) };
				break;
		}
	});
	return config;
};