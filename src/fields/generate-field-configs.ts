import isEmpty from "lodash/isEmpty";
import isObject from "lodash/isObject";
import { TComponentSchema, TFieldSchema, TSectionsSchema } from "../schema-generator";
import { checkbox } from "./checkbox";
import { chips } from "./chips";
import { contactField } from "./contact-field";
import { dateField } from "./date-field";
import { emailField } from "./email-field";
import { multiSelect } from "./multi-select";
import { numericField } from "./numeric-field";
import { radio } from "./radio";
import { select } from "./select";
// import { switch } from "./switch";
import { textField } from "./text-field";
import { textarea } from "./textarea";
import { timeField } from "./time-field";
import { unitNumberField } from "./unit-number-field";
import { TFieldsConfig } from "./types";
import { referenceKey } from "./reference-key";
import { imageUpload } from "./image-upload";

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
		config = { ...config, ...generateChildrenFieldConfigs(children) };
	});
	return config;
};

const generateChildrenFieldConfigs = (childrenSchema: Record<string, TComponentSchema>) => {
	let config: TFieldsConfig<TFieldSchema> = {};
	Object.entries(childrenSchema).forEach(([id, componentSchema]) => {
		if ("referenceKey" in componentSchema) {
			config = { ...config, ...referenceKey(id) };
			return;
		}
		const { uiType, children } = componentSchema;

		switch (uiType) {
			case "checkbox":
				config = { ...config, ...checkbox(id, componentSchema) };
				break;
			case "chips":
				config = { ...config, ...chips(id, componentSchema) };
				break;
			case "contact-field":
				config = { ...config, ...contactField(id, componentSchema) };
				break;
			case "date-field":
				config = { ...config, ...dateField(id, componentSchema) };
				break;
			case "email-field":
				config = { ...config, ...emailField(id, componentSchema) };
				break;
			case "image-upload":
				config = { ...config, ...imageUpload(id, componentSchema) };
				break;
			case "multi-select":
				config = { ...config, ...multiSelect(id, componentSchema) };
				break;
			case "numeric-field":
				config = { ...config, ...numericField(id, componentSchema) };
				break;
			case "radio":
				config = { ...config, ...radio(id, componentSchema) };
				break;
			case "select":
				config = { ...config, ...select(id, componentSchema) };
				break;
			// case "switch":
			// 	config = { ...config, ...switch(id, componentSchema) };
			// 	break;
			case "text-field":
				config = { ...config, ...textField(id, componentSchema) };
				break;
			case "textarea":
				config = { ...config, ...textarea(id, componentSchema) };
				break;
			case "time-field":
				config = { ...config, ...timeField(id, componentSchema) };
				break;
			case "unit-number-field":
				config = { ...config, ...unitNumberField(id, componentSchema) };
				break;
			case "div":
			case "span":
			case "header":
			case "footer":
			case "p":
			case "h1":
			case "h2":
			case "h3":
			case "h4":
			case "h5":
			case "h6":
				if (!isEmpty(children) && isObject(children)) {
					config = { ...config, ...generateChildrenFieldConfigs(children) };
				}
				break;
		}
	});

	return config;
};
