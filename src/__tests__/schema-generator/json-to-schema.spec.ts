import { applyCustomRules } from "../../custom-rules";
import { jsonToSchema } from "../../schema-generator";
import { ERROR_MESSAGES } from "../../shared";
import { TestHelper } from "../../utils";
import { ERROR_MESSAGE, ERROR_MESSAGE_2, ERROR_MESSAGE_3, ERROR_MESSAGE_4 } from "../common";

describe("json-to-schema", () => {
	beforeEach(() => {
		jest.restoreAllMocks();
	});

	describe("jsonToSchema", () => {
		it("should create Yup schema based on config provided", () => {
			const values = {
				field1: undefined,
				field2: 1,
				field3: "invalid email",
			};
			const schema = jsonToSchema({
				section: {
					uiType: "section",
					children: {
						field1: {
							uiType: "text-field",
							validation: [
								{ required: true, errorMessage: ERROR_MESSAGE },
								{ min: 1, errorMessage: ERROR_MESSAGE_2 },
							],
						},
						nested: {
							uiType: "div",
							children: {
								field2: {
									uiType: "numeric-field",
									validation: [{ min: 2, errorMessage: ERROR_MESSAGE_3 }],
								},
							},
						},
					},
				},
				section2: {
					uiType: "section",
					children: {
						field3: {
							uiType: "email-field",
							validation: [{ email: true, errorMessage: ERROR_MESSAGE_4 }],
						},
					},
				},
			});
			const schemaFields = schema.describe().fields;
			const schemaTypeList = Object.keys(schemaFields).map((key) => schemaFields[key].type);
			expect(schemaTypeList).toEqual(["string", "number", "string"]);

			const error = TestHelper.getError(() => schema.validateSync(values, { abortEarly: false }));
			expect(error.inner).toHaveLength(3);
			expect(error.inner[0].message).toBe(ERROR_MESSAGE);
			expect(error.inner[1].message).toBe(ERROR_MESSAGE_3);
			expect(error.inner[2].message).toBe(ERROR_MESSAGE_4);
		});

		it("should throw error if there are unknown fields", () => {
			const schema = jsonToSchema({
				section: {
					uiType: "section",
					children: {
						field: {
							uiType: "text-field",
							validation: [{ required: true, errorMessage: ERROR_MESSAGE }],
						},
					},
				},
			});

			const error = TestHelper.getError(() =>
				schema.validateSync({ field: "hello", custom: "world" }, { abortEarly: false })
			);
			expect(error.inner).toHaveLength(1);
			expect(error.inner[0].message).toBe(ERROR_MESSAGES.UNSPECIFIED_FIELD("custom"));
		});

		it("should not apply validation schema for fields with referenceKey", () => {
			const schema = jsonToSchema({
				section: {
					uiType: "section",
					children: {
						field: {
							uiType: "text-field",
							validation: [{ required: true, errorMessage: ERROR_MESSAGE }],
						},
						custom: {
							referenceKey: "my-custom-field",
							validation: [{ required: true, errorMessage: ERROR_MESSAGE_2 }],
						},
					},
				},
			});

			const error = TestHelper.getError(() =>
				schema.validateSync({ field: undefined, custom: undefined }, { abortEarly: false })
			);
			expect(error.inner).toHaveLength(1);
			expect(error.inner[0].message).toBe(ERROR_MESSAGE);
		});
	});

	describe("conditionalRender", () => {
		beforeAll(() => {
			applyCustomRules();
		});

		it("should not apply validation for conditionally hidden fields", () => {
			const schema = jsonToSchema({
				section: {
					uiType: "section",
					children: {
						field1: {
							uiType: "text-field",
							validation: [{ required: true, errorMessage: ERROR_MESSAGE }],
						},
						wrapper: {
							uiType: "div",
							children: {
								field2: {
									uiType: "numeric-field",
									validation: [{ required: true, errorMessage: ERROR_MESSAGE_2 }],
									showIf: [{ field1: [{ equals: "show field 2" }] }],
								},
							},
						},
					},
				},
			});
			expect(() => schema.validateSync({ field1: "do not show field 2" })).not.toThrowError();

			let error = TestHelper.getError(() =>
				schema.validateSync({ field1: "do not show field 2", field2: 123 }, { abortEarly: false })
			);
			expect(error.inner[0].message).toBe(ERROR_MESSAGES.UNSPECIFIED_FIELD("field2"));

			error = TestHelper.getError(() => schema.validateSync({ field1: "show field 2" }, { abortEarly: false }));
			expect(error.inner[0].message).toBe(ERROR_MESSAGE_2);
		});

		it("should not apply validation if field parent is conditionally hidden", () => {
			const schema = jsonToSchema({
				section: {
					uiType: "section",
					children: {
						field1: {
							uiType: "text-field",
							validation: [{ required: true, errorMessage: ERROR_MESSAGE }],
						},
						wrapper: {
							uiType: "div",
							showIf: [{ field1: [{ equals: "show wrapper" }] }],
							children: {
								field2: {
									uiType: "numeric-field",
									validation: [{ required: true, errorMessage: ERROR_MESSAGE_2 }],
								},
							},
						},
					},
				},
			});

			expect(() => schema.validateSync({ field1: "do not show wrapper" })).not.toThrowError();

			let error = TestHelper.getError(() =>
				schema.validateSync({ field1: "do not show field 2", field2: 123 }, { abortEarly: false })
			);
			expect(error.inner[0].message).toBe(ERROR_MESSAGES.UNSPECIFIED_FIELD("field2"));

			error = TestHelper.getError(() => schema.validateSync({ field1: "show wrapper" }, { abortEarly: false }));
			expect(error.inner[0].message).toBe(ERROR_MESSAGE_2);
		});
	});
});
