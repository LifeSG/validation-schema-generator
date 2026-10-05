import { LocalDate } from "@js-joda/core";
import * as Yup from "yup";
import { ObjectSchema } from "yup";
import { ObjectShape } from "yup/lib/object";
import { TComponentSchema, TSectionsSchema, jsonToSchema } from "../../schema-generator";
import { _testExports } from "../../schema-generator/json-to-schema";
import { ERROR_MESSAGES, MAX_CONFIG_OBJECT_DEPTH, MAX_SCHEMA_NESTING_DEPTH } from "../../shared";
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

		it("should throw once schema config nesting exceeds MAX_CONFIG_OBJECT_DEPTH (reached before the per-field MAX_SCHEMA_NESTING_DEPTH soft-degrade)", () => {
			let node: TComponentSchema = {
				uiType: "text-field",
				validation: [{ required: true, errorMessage: ERROR_MESSAGE }],
			};
			for (let i = 0; i < MAX_SCHEMA_NESTING_DEPTH + 10; i++) {
				node = { uiType: "div", children: { child: node } };
			}

			expect(() => jsonToSchema({ section: { uiType: "section", children: { root: node } } })).toThrow(
				`schema config nesting exceeds the maximum depth of ${MAX_CONFIG_OBJECT_DEPTH}`
			);
		});

		it("should throw once checkbox/radio option nesting exceeds MAX_CONFIG_OBJECT_DEPTH (reached before the per-field MAX_SCHEMA_NESTING_DEPTH soft-degrade)", () => {
			const totalLevels = MAX_SCHEMA_NESTING_DEPTH + 10;
			// eslint-disable-next-line @typescript-eslint/no-explicit-any -- deeply recursive fixture, typing it as TComponentSchema blows up TS's type-checker
			let children: any = {
				leaf: { uiType: "text-field", validation: [{ required: true, errorMessage: ERROR_MESSAGE }] },
			};
			for (let i = 0; i < totalLevels; i++) {
				children = {
					[`level${i}`]: { uiType: "checkbox", options: [{ label: "opt", value: "opt", children }] },
				};
			}

			expect(() => jsonToSchema({ section: { uiType: "section", children } })).toThrow(
				`schema config nesting exceeds the maximum depth of ${MAX_CONFIG_OBJECT_DEPTH}`
			);
		});

		describe("max config object depth", () => {
			const DEPTH_ERROR = `schema config nesting exceeds the maximum depth of ${MAX_CONFIG_OBJECT_DEPTH}`;
			// eslint-disable-next-line @typescript-eslint/no-explicit-any -- deeply recursive fixture
			const nestDivs = (levels: number): any => {
				// eslint-disable-next-line @typescript-eslint/no-explicit-any -- deeply recursive fixture
				let node: any = { uiType: "text-field" };
				for (let i = 0; i < levels; i++) {
					node = { uiType: "div", children: { [`child${i}`]: node } };
				}
				return { section: { uiType: "section", children: { root: node } } };
			};

			it("should throw a descriptive error if sections are nested beyond the max depth", () => {
				expect(() => jsonToSchema(nestDivs(20000))).toThrow(DEPTH_ERROR);
			});

			it("should throw a descriptive error if overrides are nested beyond the max depth", () => {
				// eslint-disable-next-line @typescript-eslint/no-explicit-any -- deeply recursive fixture
				let overrides: any = { label: "x" };
				for (let i = 0; i < 20000; i++) overrides = { children: overrides };

				expect(() => jsonToSchema(nestDivs(1), overrides)).toThrow(DEPTH_ERROR);
			});

			it("should throw a descriptive error if when rules are nested beyond the max depth", () => {
				let rule: Record<string, unknown> = { required: true };
				for (let i = 0; i < 20000; i++) rule = { when: { field2: { is: [{ filled: true }], then: [rule] } } };

				expect(() =>
					jsonToSchema({
						section: {
							uiType: "section",
							children: {
								field1: { uiType: "text-field", validation: [rule] },
								field2: { uiType: "text-field" },
							},
						},
					})
				).toThrow(DEPTH_ERROR);
			});

			it("should not exceed the call stack for configs just within the max depth", () => {
				jest.spyOn(console, "error").mockImplementation(() => undefined);
				const levels = Math.floor(MAX_CONFIG_OBJECT_DEPTH / 2) - 5;
				const overrides = { root: { children: { child0: { label: "x" } } } };

				expect(() => jsonToSchema(nestDivs(levels), overrides).validateSync({})).not.toThrow();
			});
		});

		// the MAX_CONFIG_OBJECT_DEPTH pre-check above always throws before a when-rule chain can reach
		// addSchemaToWhenRules' own MAX_SCHEMA_NESTING_DEPTH guard, so it's exercised directly here instead
		describe("addSchemaToWhenRules nesting guard", () => {
			it("should bail out and log once when-rule recursion exceeds MAX_SCHEMA_NESTING_DEPTH", () => {
				jest.spyOn(console, "error").mockImplementation(() => undefined);

				let rule: Record<string, unknown> = { required: true };
				for (let i = 0; i < MAX_SCHEMA_NESTING_DEPTH + 100000; i++) {
					rule = { when: { field2: { is: [{ filled: true }], then: [rule] } } };
				}
				// eslint-disable-next-line @typescript-eslint/no-explicit-any -- minimal stub, only `yupSchema`/`validation` are read
				const fieldConfigs = {
					field1: { yupSchema: Yup.string(), validation: [rule] },
					field2: { yupSchema: Yup.string(), validation: [] },
				} as any;

				expect(() => _testExports.addSchemaToWhenRules("field1", fieldConfigs, [rule] as never)).not.toThrow();
				expect(console.error).toHaveBeenCalledWith(
					expect.stringContaining(
						`when-rule nesting depth exceeded ${MAX_SCHEMA_NESTING_DEPTH}, skipping remaining when rules`
					)
				);
			});
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

		it("should gracefully handle missing schema children", () => {
			const schema = jsonToSchema({
				section1: {
					uiType: "section",
					children: undefined as any,
				},
				section2: {
					uiType: "section",
					children: {
						div: {
							uiType: "div",
							children: undefined as any,
						},
					},
				},
			});

			expect(() => schema.validateSync({})).not.toThrowError();
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

			it("should be able to override the schema with conditional render rules", () => {
				const schema = jsonToSchema(SCHEMA, {
					field: {
						validation: [{ errorMessage: "overridden error 1" }],
					},
					field2: {
						showIf: [{ field: [{ equals: "show field 2" }] }],
						validation: [{ errorMessage: "overridden error 2" }],
					},
				});

				expect(() => schema.validateSync({ field: "hello", field2: undefined })).not.toThrowError();

				const error = TestHelper.getError(() =>
					schema.validateSync({ field: "show field 2", field2: undefined }, { abortEarly: false })
				);
				expect(error.inner).toHaveLength(1);
				expect(error.inner[0].message).toBe("overridden error 2");
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

	describe("conditional validation", () => {
		it("should be able to create a schema without cyclic dependency", () => {
			const schema = jsonToSchema({
				section: {
					uiType: "section",
					children: {
						field1: {
							uiType: "text-field",
							validation: [
								{
									when: {
										field2: {
											is: [{ empty: true }],
											then: [{ required: true, errorMessage: ERROR_MESSAGE }],
										},
									},
								},
							],
						},
						field2: {
							uiType: "text-field",
							validation: [
								{
									when: {
										field1: {
											is: [{ empty: true }],
											then: [{ required: true, errorMessage: ERROR_MESSAGE_2 }],
										},
									},
								},
							],
						},
					},
				},
			});

			const error = TestHelper.getError(() => schema.validateSync({}, { abortEarly: false }));
			expect(error.inner).toHaveLength(2);
			expect(error.inner[0].message).toBe(ERROR_MESSAGE);
			expect(error.inner[1].message).toBe(ERROR_MESSAGE_2);
			expect(() => schema.validateSync({ field1: "hello" })).not.toThrow();
		});

		it("should beb able to support nested conditional validation", () => {
			const schema = jsonToSchema({
				section: {
					uiType: "section",
					children: {
						field1: {
							uiType: "text-field",
							validation: [
								{
									when: {
										field2: {
											is: [{ filled: true }],
											then: [
												{
													when: {
														field3: {
															is: [{ filled: true }],
															then: [{ required: true, errorMessage: ERROR_MESSAGE }],
														},
													},
												},
											],
										},
									},
								},
							],
						},
						field2: { uiType: "text-field" },
						field3: { uiType: "text-field" },
					},
				},
			});

			expect(() => schema.validateSync({ field1: "a", field2: "b", field3: "c" })).not.toThrowError();
			expect(() => schema.validateSync({ field1: undefined, field2: undefined, field3: "c" })).not.toThrowError();
			expect(() => schema.validateSync({ field1: undefined, field2: "b", field3: undefined })).not.toThrowError();
			expect(
				TestHelper.getError(() => schema.validateSync({ field1: undefined, field2: "b", field3: "c" })).message
			).toBe(ERROR_MESSAGE);
		});

		it("should skip when rules referencing an unknown field instead of throwing", () => {
			jest.spyOn(console, "error").mockImplementation(() => undefined);

			let schema: ObjectSchema<ObjectShape>;
			expect(() => {
				schema = jsonToSchema({
					section: {
						uiType: "section",
						children: {
							field1: {
								uiType: "text-field",
								validation: [
									{
										when: {
											unknownField: {
												is: [{ filled: true }],
												then: [{ required: true, errorMessage: ERROR_MESSAGE }],
											},
										},
									},
								],
							},
						},
					},
				});
			}).not.toThrow();

			expect(console.error).toHaveBeenCalledWith(
				expect.stringContaining('when rule on field "field1" references unknown field "unknownField"')
			);
			expect(() => schema.validateSync({})).not.toThrow();
		});
	});

	describe("conditionalRender", () => {
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
									nested: {
										uiType: "div",
										children: {
											field2: {
												uiType: "numeric-field",
												validation: [{ required: true, errorMessage: ERROR_MESSAGE_2 }],
											},
										},
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

	describe("shown condition", () => {
		it("should support shown condition for conditionally rendered fields", () => {
			const uiType = "text-field";
			const schema = jsonToSchema({
				section: {
					uiType: "section",
					children: {
						field1: {
							uiType,
						},
						field2: {
							uiType,
							showIf: [{ field1: [{ equals: "show" }] }],
						},
						field3: {
							uiType,
							showIf: [{ field2: [{ shown: true }] }],
							validation: [{ required: true, errorMessage: ERROR_MESSAGE }],
						},
					},
				},
			});

			expect(() => schema.validateSync({})).not.toThrowError();
			expect(() => schema.validateSync({ field1: "show", field2: "show", field3: "val" })).not.toThrowError();
			expect(TestHelper.getError(() => schema.validateSync({ field1: "show" })).message).toBe(ERROR_MESSAGE);
			expect(TestHelper.getError(() => schema.validateSync({ field3: "val" })).message).toBe(
				ERROR_MESSAGES.UNSPECIFIED_FIELD("field3")
			);
		});

		it("should support shown condition as one of the conditional rendering rules", () => {
			const uiType = "text-field";
			const schema = jsonToSchema({
				section: {
					uiType: "section",
					children: {
						field1: {
							uiType,
						},
						field2: {
							uiType,
							showIf: [{ field1: [{ equals: "show" }] }],
						},
						field3: {
							uiType,
						},
						field4: {
							uiType,
							showIf: [{ field2: [{ shown: true }, { filled: true }] }, { field3: [{ filled: true }] }],
							validation: [{ required: true, errorMessage: ERROR_MESSAGE }],
						},
					},
				},
			});

			expect(() => schema.validateSync({ field1: "show", field2: "" })).not.toThrowError();
			expect(() => schema.validateSync({ field3: "" })).not.toThrowError();
			expect(TestHelper.getError(() => schema.validateSync({ field1: "show", field2: "val" })).message).toBe(
				ERROR_MESSAGE
			);
			expect(TestHelper.getError(() => schema.validateSync({ field3: "val" })).message).toBe(ERROR_MESSAGE);
		});

		it("should still evaluate shown condition if source field is not defined", () => {
			const uiType = "text-field";
			const schema = jsonToSchema({
				section: {
					uiType: "section",
					children: {
						field: {
							uiType,
							showIf: [{ missing: [{ shown: true }] }],
							validation: [{ required: true, errorMessage: ERROR_MESSAGE }],
						},
					},
				},
			});

			expect(() => schema.validateSync({})).not.toThrowError();
		});

		it("should not crash when a showIf/shown source field id collides with an inherited Object.prototype member", () => {
			const uiType = "text-field";
			const schema = jsonToSchema({
				section: {
					uiType: "section",
					children: {
						field: {
							uiType,
							showIf: [{ constructor: [{ shown: true }] }],
							validation: [{ required: true, errorMessage: ERROR_MESSAGE }],
						},
					},
				},
			});

			expect(() => schema.validateSync({})).not.toThrowError();
		});

		it("should support shown conditions declared out of order", () => {
			const uiType = "text-field";
			const schema = jsonToSchema({
				section: {
					uiType: "section",
					children: {
						field4: {
							uiType,
							showIf: [{ field3: [{ shown: true }] }],
							validation: [{ required: true, errorMessage: ERROR_MESSAGE_2 }],
						},
						field3: {
							uiType,
							showIf: [{ field2: [{ shown: true }] }],
							validation: [{ required: true, errorMessage: ERROR_MESSAGE }],
						},
					},
				},
				section2: {
					uiType: "section",
					children: {
						field2: {
							uiType,
							showIf: [{ field1: [{ equals: "show" }] }],
						},
						field1: {
							uiType,
						},
					},
				},
			});

			expect(() => schema.validateSync({ field1: "show", field3: "val", field4: "val" })).not.toThrowError();
			expect(TestHelper.getError(() => schema.validateSync({ field3: "val" })).message).toBe(
				ERROR_MESSAGES.UNSPECIFIED_FIELD("field3")
			);
			expect(TestHelper.getError(() => schema.validateSync({ field4: "val" })).message).toBe(
				ERROR_MESSAGES.UNSPECIFIED_FIELD("field4")
			);
			expect(TestHelper.getError(() => schema.validateSync({ field1: "show" })).message).toBe(ERROR_MESSAGE);
			expect(TestHelper.getError(() => schema.validateSync({ field1: "show", field3: "val" })).message).toBe(
				ERROR_MESSAGE_2
			);
		});

		it("should not apply validation schema of hidden child field", () => {
			const uiType = "text-field";
			const schema = jsonToSchema({
				section: {
					uiType: "section",
					children: {
						field1: {
							uiType,
						},
						field2: {
							uiType,
							showIf: [{ field1: [{ equals: "show" }] }],
						},
						wrapper: {
							uiType: "div",
							showIf: [{ field2: [{ shown: true }] }],
							children: {
								field3: {
									uiType,
									validation: [{ required: true, errorMessage: ERROR_MESSAGE }],
								},
							},
						},
					},
				},
			});

			expect(() => schema.validateSync({})).not.toThrowError();
		});
	});

	describe("withinDays / beyondDays conditional rendering", () => {
		beforeEach(() => {
			jest.spyOn(LocalDate, "now").mockReturnValue(LocalDate.parse("2023-01-01"));
		});

		afterEach(() => {
			jest.restoreAllMocks();
		});

		it.each`
			condition                            | config                                                         | valid
			${"withinDays (future)"}             | ${{ withinDays: { numberOfDays: 7 } }}                         | ${"2023-01-07"}
			${"withinDays (past)"}               | ${{ withinDays: { numberOfDays: -7 } }}                        | ${"2022-12-28"}
			${"withinDays (from specific date)"} | ${{ withinDays: { numberOfDays: 5, fromDate: "2023-01-10" } }} | ${"2023-01-12"}
			${"beyondDays (future)"}             | ${{ beyondDays: { numberOfDays: 7 } }}                         | ${"2023-01-09"}
			${"beyondDays (past)"}               | ${{ beyondDays: { numberOfDays: -7 } }}                        | ${"2022-12-24"}
			${"beyondDays (from specific date)"} | ${{ beyondDays: { numberOfDays: 5, fromDate: "2023-01-10" } }} | ${"2023-01-16"}
		`("should support $condition condition for conditionally rendered date fields", ({ config, valid }) => {
			const schema = jsonToSchema({
				section: {
					uiType: "section",
					children: {
						field: {
							uiType: "date-field",
							validation: [{ required: true, errorMessage: ERROR_MESSAGE }],
						},
						field1: {
							uiType: "date-field",
							showIf: [{ field: [config, { filled: true }] }],
							validation: [{ required: true, errorMessage: ERROR_MESSAGE_2 }],
						},
					},
				},
			});
			expect(() => schema.validateSync({ field: valid, field1: valid })).not.toThrowError();
			const error = TestHelper.getError(() => schema.validateSync({ field: valid }, { abortEarly: false }));
			expect(error.errors).toContain(ERROR_MESSAGE_2);
		});
	});
});
