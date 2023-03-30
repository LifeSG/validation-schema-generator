import { TFieldSchema, TSectionsSchema } from "../schema-generator";
import { checkbox } from "./checkbox";
import { chips } from "./chips";
import { contactField } from "./contact-field";
import { dateField } from "./date-field";
import { emailField } from "./email-field";
import { multiSelect } from "./multi-select";
import { numericField } from "./numeric-field";
import { radio } from "./radio";
import { select } from "./select";
import { textField } from "./text-field";
import { textarea } from "./textarea";
import { timeField } from "./time-field";
import { TFieldsConfig } from "./types";

/**
 * parse JSON schema by running each field through its respective field config generator
 *
 * each field config generator will return the formatted yup schema and validation config
 *
 * a field config generator may come up with multiple fields and change the validation config (e.g. chips with textarea)
 */
export const generateFieldConfigs = (sections: TSectionsSchema) => {
	let config: TFieldsConfig<TFieldSchema> = {};
	Object.values(sections).forEach(({ children }) => {
		Object.entries(children).forEach(([id, field]) => {
			switch (field.uiType) {
				case "checkbox":
					config = { ...config, ...checkbox(id, field) };
					break;
				case "chips":
					config = { ...config, ...chips(id, field) };
					break;
				case "contact-field":
					config = { ...config, ...contactField(id, field) };
					break;
				case "date-field":
					config = { ...config, ...dateField(id, field) };
					break;
				case "email-field":
					config = { ...config, ...emailField(id, field) };
					break;
				case "multi-select":
					config = { ...config, ...multiSelect(id, field) };
					break;
				case "numeric-field":
					config = { ...config, ...numericField(id, field) };
					break;
				case "radio":
					config = { ...config, ...radio(id, field) };
					break;
				case "select":
					config = { ...config, ...select(id, field) };
					break;
				case "text-field":
					config = { ...config, ...textField(id, field) };
					break;
				case "textarea":
					config = { ...config, ...textarea(id, field) };
					break;
				case "time-field":
					config = { ...config, ...timeField(id, field) };
					break;
			}
		});
	});
	return config;
};
