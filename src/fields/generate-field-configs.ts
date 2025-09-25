import isEmpty from "lodash/isEmpty";
import isObject from "lodash/isObject";
import { TComponentSchema, TCustomFieldSchema, TFieldSchema, TSectionsSchema } from "../schema-generator";
import { arrayField } from "./array-field";
import { checkbox } from "./checkbox";
import { chips } from "./chips";
import { contactField } from "./contact-field";
import { dateField } from "./date-field";
import { dateRangeField } from "./date-range-field";
import { eSignatureField } from "./e-signature-field";
import { emailField } from "./email-field";
import { errorField } from "./error-field";
import { fileUpload } from "./file-upload";
import { hiddenField } from "./hidden-field";
import { histogramSlider } from "./histogram-slider";
import { imageUpload } from "./image-upload";
import { maskedField } from "./masked-field";
import { multiSelect } from "./multi-select";
import { nestedMultiSelect } from "./nested-multi-select";
import { numericField } from "./numeric-field";
import { radio } from "./radio";
import { rangeSelect } from "./range-select";
import { referenceKey } from "./reference-key";
import { select } from "./select";
import { slider } from "./slider";
import { switchField } from "./switch";
import { textField } from "./text-field";
import { textarea } from "./textarea";
import { timeField } from "./time-field";
import { TFieldsConfig } from "./types";
import { unitNumberField } from "./unit-number-field";

/**
 * parse JSON schema by running each field through its respective field config generator
 *
 * each field config generator will return the formatted yup schema and validation config
 *
 * a field config generator may come up with multiple fields and change the validation config (e.g. chips with textarea)
 */
export const generateFieldConfigs = (sections: TSectionsSchema) => {
	let config: TFieldsConfig<TFieldSchema | TCustomFieldSchema> = {};
	Object.values(sections).forEach(({ children }) => {
		config = { ...config, ...generateChildrenFieldConfigs(children) };
	});
	return config;
};

const generateChildrenFieldConfigs = (childrenSchema: Record<string, TComponentSchema>) => {
	let config: TFieldsConfig<TFieldSchema | TCustomFieldSchema> = {};

	if (isEmpty(childrenSchema) || !isObject(childrenSchema)) {
		return config;
	}

	Object.entries(childrenSchema).forEach(([id, componentSchema]) => {
		if ("referenceKey" in componentSchema) {
			const customComponentSchema = componentSchema as TCustomFieldSchema;
			switch (customComponentSchema.referenceKey) {
				case "array-field":
					config = { ...config, ...arrayField(id, customComponentSchema) };
					break;
				default:
					config = { ...config, ...referenceKey(id) };
			}
			return;
		}

		const { uiType, children } = componentSchema;

		switch (uiType) {
			case "checkbox":
				config = { ...config, ...checkbox(id, componentSchema) };
				componentSchema.options.forEach((option) => {
					if (!isEmpty(option.children) && isObject(option.children)) {
						config = { ...config, ...generateChildrenFieldConfigs(option.children) };
					}
				});
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
			case "date-range-field":
				config = { ...config, ...dateRangeField(id, componentSchema) };
				break;
			case "email-field":
				config = { ...config, ...emailField(id, componentSchema) };
				break;
			case "error-field":
				config = { ...config, ...errorField(id, componentSchema) };
				break;
			case "e-signature-field":
				config = { ...config, ...eSignatureField(id, componentSchema) };
				break;
			case "file-upload":
				config = { ...config, ...fileUpload(id, componentSchema) };
				break;
			case "hidden-field":
				config = { ...config, ...hiddenField(id, componentSchema) };
				break;
			case "histogram-slider":
				config = { ...config, ...histogramSlider(id, componentSchema) };
				break;
			case "image-upload":
				config = { ...config, ...imageUpload(id, componentSchema) };
				break;
			case "masked-field":
				config = { ...config, ...maskedField(id, componentSchema) };
				break;
			case "multi-select":
				config = { ...config, ...multiSelect(id, componentSchema) };
				break;
			case "nested-multi-select":
				config = { ...config, ...nestedMultiSelect(id, componentSchema) };
				break;
			case "numeric-field":
				config = { ...config, ...numericField(id, componentSchema) };
				break;
			case "radio":
				config = { ...config, ...radio(id, componentSchema) };
				componentSchema.options.forEach((option) => {
					if (!isEmpty(option.children) && isObject(option.children)) {
						config = { ...config, ...generateChildrenFieldConfigs(option.children) };
					}
				});
				break;
			case "range-select":
				config = { ...config, ...rangeSelect(id, componentSchema) };
				break;
			case "select":
				config = { ...config, ...select(id, componentSchema) };
				break;
			case "slider":
				config = { ...config, ...slider(id, componentSchema) };
				break;
			case "switch":
				config = { ...config, ...switchField(id, componentSchema) };
				break;
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
			case "accordion":
			case "grid":
				if (!isEmpty(children) && isObject(children)) {
					config = { ...config, ...generateChildrenFieldConfigs(children) };
				}
				break;
		}
	});

	return config;
};
