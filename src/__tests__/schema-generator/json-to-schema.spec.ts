import { ObjectSchema } from "yup";
import { applyCustomRules } from "../../custom-rules";
import { TSectionsSchema, jsonToSchema } from "../../schema-generator";
import { ERROR_MESSAGES } from "../../shared";
import { TestHelper } from "../../utils";
import { ERROR_MESSAGE, ERROR_MESSAGE_2, ERROR_MESSAGE_3, ERROR_MESSAGE_4 } from "../common";
import { ObjectShape } from "yup/lib/object";

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

		describe("overrides", () => {
			const SCHEMA: TSectionsSchema = {
				section: {
					uiType: "section",
					children: {
						field: {
							uiType: "text-field",
							validation: [
								{ required: true, errorMessage: ERROR_MESSAGE },
								{ min: 2, errorMessage: ERROR_MESSAGE_2 },
							],
						},
					},
				},
				section2: {
					uiType: "section",
					children: {
						field2: {
							uiType: "text-field",
							validation: [
								{ required: true, errorMessage: ERROR_MESSAGE_3 },
								{ min: 2, errorMessage: ERROR_MESSAGE_4 },
							],
						},
					},
				},
			};

			it("should be able to override the schema", () => {
				const schema = jsonToSchema(SCHEMA, {
					field: {
						validation: [{ errorMessage: "overridden error 1" }],
					},
					field2: {
						validation: [{ errorMessage: "overridden error 2" }],
					},
				});

				expect(() => schema.validateSync({ field: "hello", field2: "world" })).not.toThrowError();

				const error = TestHelper.getError(() =>
					schema.validateSync({ field: undefined, field2: undefined }, { abortEarly: false })
				);
				expect(error.inner).toHaveLength(2);
				expect(error.inner[0].message).toBe("overridden error 2");
				expect(error.inner[1].message).toBe("overridden error 1");
			});

			it("should remove entries on overriding with null values", () => {
				const schema = jsonToSchema(SCHEMA, {
					field: {
						validation: [null, { min: 5 }],
					},
					section2: null,
				});

				expect(() => schema.validateSync({ field: undefined })).not.toThrowError();

				const error = TestHelper.getError(() => schema.validateSync({ field: "hi" }, { abortEarly: false }));
				expect(error.inner).toHaveLength(1);
				expect(error.inner[0].message).toBe(ERROR_MESSAGE_2);
			});

			it("should not change or remove entries on overriding with undefined values", () => {
				const schema = jsonToSchema(SCHEMA, {
					field: {
						validation: [undefined, { min: 5 }],
					},
					section2: undefined,
					field2: {
						validation: [undefined, { min: 5 }],
					},
				});

				const error = TestHelper.getError(() =>
					schema.validateSync({ field: undefined, field2: undefined }, { abortEarly: false })
				);
				expect(error.inner).toHaveLength(2);
				expect(error.inner[0].message).toBe(ERROR_MESSAGE_3);
				expect(error.inner[1].message).toBe(ERROR_MESSAGE);

				const error2 = TestHelper.getError(() =>
					schema.validateSync({ field: "hi", field2: "hi" }, { abortEarly: false })
				);
				expect(error2.inner).toHaveLength(2);
				expect(error2.inner[0].message).toBe(ERROR_MESSAGE_4);
				expect(error2.inner[1].message).toBe(ERROR_MESSAGE_2);
			});
		});
	});

	describe("conditionalRender", () => {
		beforeAll(() => {
			applyCustomRules();
		});

		describe("conditionally hidden fields", () => {
			let schema: ObjectSchema<ObjectShape>;

			beforeAll(() => {
				schema = jsonToSchema({
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
			});

			it("should not apply validation schema of hidden field", () => {
				expect(() => schema.validateSync({ field1: "do not show field 2" })).not.toThrowError();
				expect(() =>
					schema.validateSync({ field1: "do not show field 2", field2: undefined })
				).not.toThrowError();
			});

			it("should reject hidden field with null value", () => {
				const error = TestHelper.getError(() =>
					schema.validateSync({ field1: "do not show field 2", field2: null }, { abortEarly: false })
				);
				expect(error.inner[0].message).toBe(ERROR_MESSAGES.UNSPECIFIED_FIELD("field2"));
			});

			it("should reject hidden field with empty string", () => {
				const error = TestHelper.getError(() =>
					schema.validateSync({ field1: "do not show field 2", field2: "" }, { abortEarly: false })
				);
				expect(error.inner[0].message).toBe(ERROR_MESSAGES.UNSPECIFIED_FIELD("field2"));
			});

			it("should apply validation schema if field is shown", () => {
				const error = TestHelper.getError(() =>
					schema.validateSync({ field1: "show field 2" }, { abortEarly: false })
				);
				expect(error.inner[0].message).toBe(ERROR_MESSAGE_2);
			});
		});

		describe("conditionally hidden parent fields", () => {
			let schema: ObjectSchema<ObjectShape>;

			beforeAll(() => {
				schema = jsonToSchema({
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
			});

			it("should not apply validation schema of hidden child field", () => {
				expect(() => schema.validateSync({ field1: "do not show wrapper" })).not.toThrowError();
				expect(() =>
					schema.validateSync({ field1: "do not show wrapper", field2: undefined })
				).not.toThrowError();
			});

			it("should reject hidden child field with null value", () => {
				const error = TestHelper.getError(() =>
					schema.validateSync({ field1: "do not show wrapper", field2: null }, { abortEarly: false })
				);
				expect(error.inner[0].message).toBe(ERROR_MESSAGES.UNSPECIFIED_FIELD("field2"));
			});

			it("should reject hidden child field with empty string", () => {
				const error = TestHelper.getError(() =>
					schema.validateSync({ field1: "do not show wrapper", field2: "" }, { abortEarly: false })
				);
				expect(error.inner[0].message).toBe(ERROR_MESSAGES.UNSPECIFIED_FIELD("field2"));
			});

			it("should apply validation schema if field is shown", () => {
				const error = TestHelper.getError(() =>
					schema.validateSync({ field1: "show wrapper" }, { abortEarly: false })
				);
				expect(error.inner[0].message).toBe(ERROR_MESSAGE_2);
			});
		});
	});
});
