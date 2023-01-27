import { TFieldSchema, TFields } from "../schema-generator";
import { checkbox } from "./checkbox";
import { email } from "./email";
import { numeric } from "./numeric";
import { radio } from "./radio";
import { text } from "./text";
import { textarea } from "./textarea";
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
			case "checkbox":
				config = { ...config, ...checkbox(id, field) };
				break;
			case "email":
				config = { ...config, ...email(id, field) };
				break;
			case "numeric":
				config = { ...config, ...numeric(id, field) };
				break;
			case "radio":
				config = { ...config, ...radio(id, field) };
				break;
			case "text":
				config = { ...config, ...text(id, field) };
				break;
			case "textarea":
				config = { ...config, ...textarea(id, field) };
				break;
		}
	});
	return config;
};
