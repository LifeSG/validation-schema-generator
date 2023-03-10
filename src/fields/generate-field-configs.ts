import { TFieldSchema, TFields } from "../schema-generator";
import { checkbox } from "./checkbox";
import { chips } from "./chips";
import { contact } from "./contact";
import { date } from "./date";
import { email } from "./email";
import { multiSelect } from "./multi-select";
import { numeric } from "./numeric";
import { radio } from "./radio";
import { select } from "./select";
import { text } from "./text";
import { textarea } from "./textarea";
import { time } from "./time";
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
			case "chips":
				config = { ...config, ...chips(id, field) };
				break;
			case "contact":
				config = { ...config, ...contact(id, field) };
				break;
			case "date":
				config = { ...config, ...date(id, field) };
				break;
			case "email":
				config = { ...config, ...email(id, field) };
				break;
			case "multi-select":
				config = { ...config, ...multiSelect(id, field) };
				break;
			case "numeric":
				config = { ...config, ...numeric(id, field) };
				break;
			case "radio":
				config = { ...config, ...radio(id, field) };
				break;
			case "select":
				config = { ...config, ...select(id, field) };
				break;
			case "text":
				config = { ...config, ...text(id, field) };
				break;
			case "textarea":
				config = { ...config, ...textarea(id, field) };
				break;
			case "time":
				config = { ...config, ...time(id, field) };
				break;
		}
	});
	return config;
};
