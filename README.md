# validation-schema-generator

-   typescript-based
-   JSON to Yup conversion
-   field types baked into library

The validation schema generator is meant to be used in conjunction with the [web-frontend-engine](https://github.com/LifeSG/web-frontend-engine/) and any backend service interaction with the frontend engine. It is able to convert validation config in JSON format to a validation schema ([Yup](https://github.com/jquense/yup)) that will be used on both frontend and backend.

For more information on the schema format, please refer to the frontend engine storybook at https://designsystem.life.gov.sg/web-frontend-engine/index.html.

## Intention

Since form submission involves validation on both frontend and backend, it makes sense to have a common library for it. This ensures the validation logic is the same across both ends and prevents duplication of codes. This library is meant for stacks that use typescript in both frontend and backend.

## Getting started

### Installation

`npm i @lifesg/validation-schema-generator`

### jsonToSchema

Generate a validation schema to validate against a set of values.

```ts
import { jsonToSchema } from "@lifesg/validation-schema-generator";

const schema = jsonToSchema({
	field1: {
		fieldType: "contact",
		label: "Contact number",
		validation: [
			{ required: true },
			{ contactNumber: { singaporeNumber: "default" }, errorMessage: "Invalid contact number" },
		],
	},
	field2: {
		fieldType: "radio",
		label: "Radio",
		options: [
			{ label: "A", value: "Apple" },
			{ label: "B", value: "Berry" },
		],
		validation: [{ required: true }, { min: 2, errorMessage: "Min. 2 items" }],
	},
	field3: {
		fieldType: "text",
		label: "Text field",
		validation: [{ required: true }],
	},
});

await schema.validate(
	{
		field1: "+65 91234567",
		field2: "Apple",
		field3: "Hello",
	},
	{ abortEarly: false }
);
```

### addRule

Add custom rules to support additional validation logic.

```ts
import { addRule, jsonToSchema } from "@lifesg/validation-schema-generator";

addRule("string", "testString", (value) => value === "hello");

const schema = jsonToSchema<{ testString?: boolean }>({
	field: {
		fieldType: "text",
		validation: [{ testString: true, errorMessage: "error message" }],
	},
});

await schema.validate({ field: "invalid" });
```

### Fields supported

-   checkbox
-   chips
-   contact
-   date
-   email
-   multi-select
-   numeric
-   radio
-   select
-   text
-   textarea
-   time

For more information on the usage of each field, please refer to the frontend engine storybook at https://designsystem.life.gov.sg/web-frontend-engine/index.html.

## Definitions

Throughout the library, you will find terms referring to various objects, it will be beneficial to know their actual meanings:

### Validation schema

The eventual output as a Yup schema.

### Validation config

The validation property of a field in a JSON form schema (refer to [web-frontend-engine](https://github.com/LifeSG/web-frontend-engine/)). It is an array of rules.

```ts
// sample form schema
{
	"fields": {
		"myField": {
			"fieldType": "text",
			"label": "My field",
			"validation": [ // <-- validation config
				{ "required": true, "errorMessage": "this field is required" } // <-- rule
			]
		}
	}
}
```

### Rule

An object within the validation config describing a single validation logic.

### Condition

The key of a rule, .e.g, `required`.
